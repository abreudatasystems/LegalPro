import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  sqliteTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { text as sqliteText, integer as sqliteInteger, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = sqliteTable(
  "sessions",
  {
    sid: sqliteText("sid").primaryKey(),
    sess: sqliteText("sess").notNull(),
    expire: sqliteInteger("expire").notNull(),
  },
);

// User storage table (mandatory for Replit Auth)
export const users = sqliteTable("users", {
  id: sqliteText("id").primaryKey(),
  email: sqliteText("email").unique(),
  firstName: sqliteText("first_name"),
  lastName: sqliteText("last_name"),
  profileImageUrl: sqliteText("profile_image_url"),
  role: sqliteText("role").default('assistant'),
  createdAt: sqliteInteger("created_at"),
  updatedAt: sqliteInteger("updated_at"),
});

// Clients table
export const clients = sqliteTable("clients", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull(),
  email: sqliteText("email"),
  phone: sqliteText("phone"),
  address: sqliteText("address"),
  type: sqliteText("type").notNull().default('individual'),
  companyDocument: sqliteText("company_document"), // CNPJ for companies
  personalDocument: sqliteText("personal_document"), // CPF for individuals
  notes: sqliteText("notes"),
  createdAt: sqliteInteger("created_at"),
  updatedAt: sqliteInteger("updated_at"),
});

// Contracts table
export const contracts = sqliteTable("contracts", {
  id: sqliteText("id").primaryKey(),
  title: sqliteText("title").notNull(),
  description: sqliteText("description"),
  clientId: sqliteText("client_id").references(() => clients.id),
  value: real("value"),
  startDate: sqliteInteger("start_date"),
  endDate: sqliteInteger("end_date"),
  status: sqliteText("status").notNull().default('draft'),
  content: sqliteText("content"), // Full contract content
  createdBy: sqliteText("created_by").references(() => users.id),
  createdAt: sqliteInteger("created_at"),
  updatedAt: sqliteInteger("updated_at"),
});

// Contract templates (minutas)
export const contractTemplates = sqliteTable("contract_templates", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull(),
  description: sqliteText("description"),
  content: sqliteText("content").notNull(),
  category: sqliteText("category"),
  isActive: sqliteInteger("is_active").default(1),
  createdBy: sqliteText("created_by").references(() => users.id),
  createdAt: sqliteInteger("created_at"),
  updatedAt: sqliteInteger("updated_at"),
});

// Contract clauses
export const contractClauses = sqliteTable("contract_clauses", {
  id: sqliteText("id").primaryKey(),
  title: sqliteText("title").notNull(),
  content: sqliteText("content").notNull(),
  category: sqliteText("category"),
  isActive: sqliteInteger("is_active").default(1),
  createdBy: sqliteText("created_by").references(() => users.id),
  createdAt: sqliteInteger("created_at"),
  updatedAt: sqliteInteger("updated_at"),
});

// Projects table
export const projects = sqliteTable("projects", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull(),
  description: sqliteText("description"),
  clientId: sqliteText("client_id").references(() => clients.id),
  status: sqliteText("status").notNull().default('planning'),
  startDate: sqliteInteger("start_date"),
  endDate: sqliteInteger("end_date"),
  assignedTo: sqliteText("assigned_to").references(() => users.id),
  createdBy: sqliteText("created_by").references(() => users.id),
  createdAt: sqliteInteger("created_at"),
  updatedAt: sqliteInteger("updated_at"),
});

// Financial transactions table
export const transactions = sqliteTable("transactions", {
  id: sqliteText("id").primaryKey(),
  description: sqliteText("description").notNull(),
  amount: real("amount").notNull(),
  type: sqliteText("type").notNull(), // 'income' or 'expense'
  clientId: sqliteText("client_id").references(() => clients.id),
  projectId: sqliteText("project_id").references(() => projects.id),
  contractId: sqliteText("contract_id").references(() => contracts.id),
  date: sqliteInteger("date"),
  createdBy: sqliteText("created_by").references(() => users.id),
  createdAt: sqliteInteger("created_at"),
});

// Documents table
export const documents = sqliteTable("documents", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull(),
  type: sqliteText("type").notNull(),
  filePath: sqliteText("file_path"),
  clientId: sqliteText("client_id").references(() => clients.id),
  projectId: sqliteText("project_id").references(() => projects.id),
  contractId: sqliteText("contract_id").references(() => contracts.id),
  status: sqliteText("status").default('active'), // 'active', 'archived', 'draft'
  uploadedBy: sqliteText("uploaded_by").references(() => users.id),
  createdAt: sqliteInteger("created_at"),
  updatedAt: sqliteInteger("updated_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  contracts: many(contracts),
  projects: many(projects),
  assignedProjects: many(projects),
  templates: many(contractTemplates),
  clauses: many(contractClauses),
  transactions: many(transactions),
  documents: many(documents),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  contracts: many(contracts),
  projects: many(projects),
  transactions: many(transactions),
  documents: many(documents),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  client: one(clients, {
    fields: [contracts.clientId],
    references: [clients.id],
  }),
  createdBy: one(users, {
    fields: [contracts.createdBy],
    references: [users.id],
  }),
  transactions: many(transactions),
  documents: many(documents),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  assignedTo: one(users, {
    fields: [projects.assignedTo],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  transactions: many(transactions),
  documents: many(documents),
}));

export const contractTemplatesRelations = relations(contractTemplates, ({ one }) => ({
  createdBy: one(users, {
    fields: [contractTemplates.createdBy],
    references: [users.id],
  }),
}));

export const contractClausesRelations = relations(contractClauses, ({ one }) => ({
  createdBy: one(users, {
    fields: [contractClauses.createdBy],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  client: one(clients, {
    fields: [transactions.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [transactions.projectId],
    references: [projects.id],
  }),
  contract: one(contracts, {
    fields: [transactions.contractId],
    references: [contracts.id],
  }),
  createdBy: one(users, {
    fields: [transactions.createdBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  contract: one(contracts, {
    fields: [documents.contractId],
    references: [contracts.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const insertContractClauseSchema = createInsertSchema(contractClauses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  uploadedBy: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractClause = z.infer<typeof insertContractClauseSchema>;
export type ContractClause = typeof contractClauses.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;