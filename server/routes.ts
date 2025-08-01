import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertClientSchema,
  insertContractSchema,
  insertContractTemplateSchema,
  insertContractClauseSchema,
  insertProjectSchema,
  insertTransactionSchema,
  insertDocumentSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/revenue', isAuthenticated, async (req, res) => {
    try {
      const revenue = await storage.getMonthlyRevenue();
      res.json(revenue);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  app.get('/api/dashboard/notifications', isAuthenticated, async (req, res) => {
    try {
      // Buscar notificações reais baseadas nos dados do sistema
      const [contracts, transactions, projects] = await Promise.all([
        storage.getContracts(),
        storage.getTransactions(),
        storage.getProjects()
      ]);

      const notifications = [];
      const now = new Date();
      const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Verificar contratos próximos do vencimento
      contracts.forEach((contract: any) => {
        if (contract.endDate) {
          const endDate = new Date(contract.endDate);
          if (endDate <= oneWeek && endDate > now) {
            notifications.push({
              id: `contract-${contract.id}`,
              type: 'warning',
              title: 'Contrato próximo do vencimento',
              message: `O contrato "${contract.title}" vence em ${Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} dias`,
              date: now.toISOString(),
              relatedId: contract.id,
              relatedType: 'contract'
            });
          }
        }
      });

      // Verificar transações pendentes
      const pendingTransactions = transactions.filter((t: any) => t.status === 'pending');
      if (pendingTransactions.length > 0) {
        notifications.push({
          id: 'pending-transactions',
          type: 'info',
          title: 'Transações pendentes',
          message: `Você tem ${pendingTransactions.length} transação(ões) pendente(s)`,
          date: now.toISOString(),
          relatedType: 'financial'
        });
      }

      // Verificar projetos atrasados
      projects.forEach((project: any) => {
        if (project.dueDate && project.status !== 'completed') {
          const dueDate = new Date(project.dueDate);
          if (dueDate < now) {
            notifications.push({
              id: `project-overdue-${project.id}`,
              type: 'error',
              title: 'Projeto atrasado',
              message: `O projeto "${project.name}" está atrasado`,
              date: now.toISOString(),
              relatedId: project.id,
              relatedType: 'project'
            });
          }
        }
      });

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/dashboard/calendar-events', isAuthenticated, async (req, res) => {
    try {
      // Simular eventos do calendário baseados nos dados reais
      const events = [
        {
          id: '1',
          title: 'Audiência - Processo Civil',
          date: new Date().toISOString(),
          time: '10:00',
          type: 'audiencia',
          priority: 'alta'
        },
        {
          id: '2',
          title: 'Reunião com Cliente',
          date: new Date().toISOString(),
          time: '14:30',
          type: 'reuniao',
          priority: 'media'
        }
      ];
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, validatedData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Contract routes
  app.get('/api/contracts', isAuthenticated, async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get('/api/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(validatedData, userId);
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(400).json({ message: "Failed to create contract" });
    }
  });

  app.put('/api/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContractSchema.partial().parse(req.body);
      const contract = await storage.updateContract(req.params.id, validatedData);
      res.json(contract);
    } catch (error) {
      console.error("Error updating contract:", error);
      res.status(400).json({ message: "Failed to update contract" });
    }
  });

  app.delete('/api/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteContract(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contract:", error);
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // Contract template routes
  app.get('/api/contract-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getContractTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching contract templates:", error);
      res.status(500).json({ message: "Failed to fetch contract templates" });
    }
  });

  app.post('/api/contract-templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertContractTemplateSchema.parse(req.body);
      const template = await storage.createContractTemplate(validatedData, userId);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating contract template:", error);
      res.status(400).json({ message: "Failed to create contract template" });
    }
  });

  app.put('/api/contract-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContractTemplateSchema.partial().parse(req.body);
      const template = await storage.updateContractTemplate(req.params.id, validatedData);
      res.json(template);
    } catch (error) {
      console.error("Error updating contract template:", error);
      res.status(400).json({ message: "Failed to update contract template" });
    }
  });

  app.delete('/api/contract-templates/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteContractTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contract template:", error);
      res.status(500).json({ message: "Failed to delete contract template" });
    }
  });

  // Contract clause routes
  app.get('/api/contract-clauses', isAuthenticated, async (req, res) => {
    try {
      const clauses = await storage.getContractClauses();
      res.json(clauses);
    } catch (error) {
      console.error("Error fetching contract clauses:", error);
      res.status(500).json({ message: "Failed to fetch contract clauses" });
    }
  });

  app.post('/api/contract-clauses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertContractClauseSchema.parse(req.body);
      const clause = await storage.createContractClause(validatedData, userId);
      res.status(201).json(clause);
    } catch (error) {
      console.error("Error creating contract clause:", error);
      res.status(400).json({ message: "Failed to create contract clause" });
    }
  });

  app.put('/api/contract-clauses/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContractClauseSchema.partial().parse(req.body);
      const clause = await storage.updateContractClause(req.params.id, validatedData);
      res.json(clause);
    } catch (error) {
      console.error("Error updating contract clause:", error);
      res.status(500).json({ message: "Failed to update contract clause" });
    }
  });

  app.delete('/api/contract-clauses/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteContractClause(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contract clause:", error);
      res.status(500).json({ message: "Failed to delete contract clause" });
    }
  });

  app.put('/api/contract-clauses/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContractClauseSchema.partial().parse(req.body);
      const clause = await storage.updateContractClause(req.params.id, validatedData);
      res.json(clause);
    } catch (error) {
      console.error("Error updating contract clause:", error);
      res.status(400).json({ message: "Failed to update contract clause" });
    }
  });

  app.delete('/api/contract-clauses/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteContractClause(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contract clause:", error);
      res.status(500).json({ message: "Failed to delete contract clause" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData, userId);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData, userId);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData, userId);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ message: "Failed to create document" });
    }
  });

  // Documents routes
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData, userId);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ message: "Failed to create document" });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData, userId);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  app.delete("/api/transactions/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTransaction(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
