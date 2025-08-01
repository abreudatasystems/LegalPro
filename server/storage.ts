import {
  users,
  clients,
  contracts,
  contractTemplates,
  contractClauses,
  projects,
  transactions,
  documents,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Contract,
  type InsertContract,
  type ContractTemplate,
  type InsertContractTemplate,
  type ContractClause,
  type InsertContractClause,
  type Project,
  type InsertProject,
  type Transaction,
  type InsertTransaction,
  type Document,
  type InsertDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum, gte, lte, sql } from "drizzle-orm";

// Helper function to generate UUID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper function to convert Date to Unix timestamp
function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

// Helper function to convert Unix timestamp to Date
function fromUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Contract operations
  getContracts(): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByClient(clientId: string): Promise<Contract[]>;
  createContract(contract: InsertContract, userId: string): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract>;
  deleteContract(id: string): Promise<void>;
  
  // Contract template operations
  getContractTemplates(): Promise<ContractTemplate[]>;
  getContractTemplate(id: string): Promise<ContractTemplate | undefined>;
  createContractTemplate(template: InsertContractTemplate, userId: string): Promise<ContractTemplate>;
  updateContractTemplate(id: string, template: Partial<InsertContractTemplate>): Promise<ContractTemplate>;
  deleteContractTemplate(id: string): Promise<void>;
  
  // Contract clause operations
  getContractClauses(): Promise<ContractClause[]>;
  getContractClause(id: string): Promise<ContractClause | undefined>;
  createContractClause(clause: InsertContractClause, userId: string): Promise<ContractClause>;
  updateContractClause(id: string, clause: Partial<InsertContractClause>): Promise<ContractClause>;
  deleteContractClause(id: string): Promise<void>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByClient(clientId: string): Promise<Project[]>;
  createProject(project: InsertProject, userId: string): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction, userId: string): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  
  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument, userId: string): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]>;
  getTotalRevenue(): Promise<number>;
  
  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument, userId: string): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    activeContracts: number;
    totalClients: number;
    monthlyRevenue: number;
    activeProjects: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const clientData = {
      ...client,
      id: generateId(),
      createdAt: toUnixTimestamp(new Date()),
      updatedAt: toUnixTimestamp(new Date()),
    };
    const [newClient] = await db.insert(clients).values(clientData).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: toUnixTimestamp(new Date()) })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Contract operations
  async getContracts(): Promise<Contract[]> {
    return await db.select().from(contracts).orderBy(desc(contracts.createdAt));
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractsByClient(clientId: string): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.clientId, clientId));
  }

  async createContract(contract: InsertContract, userId: string): Promise<Contract> {
    const contractData = {
      ...contract,
      id: generateId(),
      createdBy: userId,
      createdAt: toUnixTimestamp(new Date()),
      updatedAt: toUnixTimestamp(new Date()),
      startDate: contract.startDate ? toUnixTimestamp(contract.startDate) : null,
      endDate: contract.endDate ? toUnixTimestamp(contract.endDate) : null,
    };
    const [newContract] = await db
      .insert(contracts)
      .values(contractData)
      .returning();
    return newContract;
  }

  async updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract> {
    const updateData = {
      ...contract,
      updatedAt: toUnixTimestamp(new Date()),
      startDate: contract.startDate ? toUnixTimestamp(contract.startDate) : undefined,
      endDate: contract.endDate ? toUnixTimestamp(contract.endDate) : undefined,
    };
    const [updatedContract] = await db
      .update(contracts)
      .set(updateData)
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
  }

  async deleteContract(id: string): Promise<void> {
    await db.delete(contracts).where(eq(contracts.id, id));
  }

  // Contract template operations
  async getContractTemplates(): Promise<ContractTemplate[]> {
    return await db
      .select()
      .from(contractTemplates)
      .where(eq(contractTemplates.isActive, true))
      .orderBy(desc(contractTemplates.createdAt));
  }

  async getContractTemplate(id: string): Promise<ContractTemplate | undefined> {
    const [template] = await db
      .select()
      .from(contractTemplates)
      .where(eq(contractTemplates.id, id));
    return template;
  }

  async createContractTemplate(template: InsertContractTemplate, userId: string): Promise<ContractTemplate> {
    const templateData = {
      ...template,
      id: generateId(),
      createdBy: userId,
      createdAt: toUnixTimestamp(new Date()),
      updatedAt: toUnixTimestamp(new Date()),
    };
    const [newTemplate] = await db
      .insert(contractTemplates)
      .values(templateData)
      .returning();
    return newTemplate;
  }

  async updateContractTemplate(id: string, template: Partial<InsertContractTemplate>): Promise<ContractTemplate> {
    const [updatedTemplate] = await db
      .update(contractTemplates)
      .set({ ...template, updatedAt: toUnixTimestamp(new Date()) })
      .where(eq(contractTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteContractTemplate(id: string): Promise<void> {
    await db.update(contractTemplates)
      .set({ isActive: 0 })
      .where(eq(contractTemplates.id, id));
  }

  // Contract clause operations
  async getContractClauses(): Promise<ContractClause[]> {
    return await db
      .select()
      .from(contractClauses)
      .where(eq(contractClauses.isActive, 1))
      .orderBy(desc(contractClauses.createdAt));
  }

  async getContractClause(id: string): Promise<ContractClause | undefined> {
    const [clause] = await db
      .select()
      .from(contractClauses)
      .where(eq(contractClauses.id, id));
    return clause;
  }

  async createContractClause(clause: InsertContractClause, userId: string): Promise<ContractClause> {
    const clauseData = {
      ...clause,
      id: generateId(),
      createdBy: userId,
      createdAt: toUnixTimestamp(new Date()),
      updatedAt: toUnixTimestamp(new Date()),
    };
    const [newClause] = await db
      .insert(contractClauses)
      .values(clauseData)
      .returning();
    return newClause;
  }

  async updateContractClause(id: string, clause: Partial<InsertContractClause>): Promise<ContractClause> {
    const [updatedClause] = await db
      .update(contractClauses)
      .set({ ...clause, updatedAt: toUnixTimestamp(new Date()) })
      .where(eq(contractClauses.id, id))
      .returning();
    return updatedClause;
  }

  async deleteContractClause(id: string): Promise<void> {
    await db.update(contractClauses)
      .set({ isActive: 0 })
      .where(eq(contractClauses.id, id));
  }

  async updateContractClause(id: string, clause: Partial<InsertContractClause>): Promise<ContractClause> {
    const [updatedClause] = await db
      .update(contractClauses)
      .set({ ...clause, updatedAt: new Date() })
      .where(eq(contractClauses.id, id))
      .returning();
    return updatedClause;
  }

  async deleteContractClause(id: string): Promise<void> {
    await db.update(contractClauses)
      .set({ isActive: false })
      .where(eq(contractClauses.id, id));
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async createProject(project: InsertProject, userId: string): Promise<Project> {
    const projectData = {
      ...project,
      id: generateId(),
      createdBy: userId,
      createdAt: toUnixTimestamp(new Date()),
      updatedAt: toUnixTimestamp(new Date()),
      startDate: project.startDate ? toUnixTimestamp(project.startDate) : null,
      endDate: project.endDate ? toUnixTimestamp(project.endDate) : null,
    };
    const [newProject] = await db
      .insert(projects)
      .values(projectData)
      .returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const updateData = {
      ...project,
      updatedAt: toUnixTimestamp(new Date()),
      startDate: project.startDate ? toUnixTimestamp(project.startDate) : undefined,
      endDate: project.endDate ? toUnixTimestamp(project.endDate) : undefined,
    };
    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction, userId: string): Promise<Transaction> {
    const transactionData = {
      ...transaction,
      id: generateId(),
      createdBy: userId,
      createdAt: toUnixTimestamp(new Date()),
      date: transaction.date ? toUnixTimestamp(transaction.date) : toUnixTimestamp(new Date()),
    };
    const [newTransaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return newTransaction;
  }

  async getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]> {
    const sixMonthsAgo = toUnixTimestamp(new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000));
    
    const result = await db
      .select({
        revenue: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'income'),
          gte(transactions.date, sixMonthsAgo)
        )
      );
    
    return [
      { month: 'Jan', revenue: 0 },
      { month: 'Feb', revenue: 0 },
      { month: 'Mar', revenue: 0 },
      { month: 'Apr', revenue: 0 },
      { month: 'May', revenue: 0 },
      { month: 'Jun', revenue: Number(result[0]?.revenue || 0) },
    ];
  }

  async getTotalRevenue(): Promise<number> {
    const result = await db
      .select({
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(eq(transactions.type, 'income'));
    
    return Number(result[0]?.total || 0);
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument, userId: string): Promise<Document> {
    const documentData = {
      ...document,
      id: generateId(),
      uploadedBy: userId,
      createdAt: toUnixTimestamp(new Date()),
      updatedAt: toUnixTimestamp(new Date()),
    };
    const [newDocument] = await db
      .insert(documents)
      .values(documentData)
      .returning();
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...document, updatedAt: toUnixTimestamp(new Date()) })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    activeContracts: number;
    totalClients: number;
    monthlyRevenue: number;
    activeProjects: number;
  }> {
    const [contractCount] = await db
      .select({ count: count() })
      .from(contracts)
      .where(eq(contracts.status, 'active'));

    const [clientCount] = await db
      .select({ count: count() })
      .from(clients);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthTimestamp = toUnixTimestamp(thisMonth);
    
    const [monthlyRevenueResult] = await db
      .select({ revenue: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'income'),
          gte(transactions.date, thisMonthTimestamp)
        )
      );

    const [projectCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.status, 'active'));

    return {
      activeContracts: contractCount.count,
      totalClients: clientCount.count,
      monthlyRevenue: Number(monthlyRevenueResult.revenue || 0),
      activeProjects: projectCount.count,
    };
  }
}

export const storage = new DatabaseStorage();