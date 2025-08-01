import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';

// Criar diretório de dados se não existir
const dbPath = path.join(process.cwd(), 'data', 'legal.db');

// Criar o banco SQLite
const sqlite = new Database(dbPath);

// Habilitar foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Função para inicializar as tabelas
export function initializeDatabase() {
  // Criar tabelas se não existirem
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      role TEXT DEFAULT 'assistant' CHECK (role IN ('admin', 'lawyer', 'assistant')),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      type TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'company')),
      company_document TEXT,
      personal_document TEXT,
      notes TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      description TEXT,
      client_id TEXT REFERENCES clients(id),
      value REAL,
      start_date INTEGER,
      end_date INTEGER,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
      content TEXT,
      created_by TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS contract_templates (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      category TEXT,
      is_active INTEGER DEFAULT 1,
      created_by TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS contract_clauses (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      is_active INTEGER DEFAULT 1,
      created_by TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      description TEXT,
      client_id TEXT REFERENCES clients(id),
      status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
      start_date INTEGER,
      end_date INTEGER,
      assigned_to TEXT REFERENCES users(id),
      created_by TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      client_id TEXT REFERENCES clients(id),
      project_id TEXT REFERENCES projects(id),
      contract_id TEXT REFERENCES contracts(id),
      date INTEGER DEFAULT (unixepoch()),
      created_by TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      file_path TEXT,
      client_id TEXT REFERENCES clients(id),
      project_id TEXT REFERENCES projects(id),
      contract_id TEXT REFERENCES contracts(id),
      status TEXT DEFAULT 'active',
      uploaded_by TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );
  `);

  // Inserir dados de exemplo
  insertSampleData();
}

function insertSampleData() {
  // Verificar se já existem dados
  const existingClients = sqlite.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
  
  if (existingClients.count === 0) {
    // Inserir clientes de exemplo
    sqlite.exec(`
      INSERT INTO clients (id, name, email, phone, type, company_document, personal_document, address) VALUES
      ('client-1', 'João Silva', 'joao.silva@email.com', '(11) 99999-1111', 'individual', NULL, '123.456.789-00', 'Rua das Flores, 123 - São Paulo, SP'),
      ('client-2', 'Empresa ABC Ltda', 'contato@empresaabc.com.br', '(11) 3333-4444', 'company', '12.345.678/0001-90', NULL, 'Av. Paulista, 1000 - São Paulo, SP'),
      ('client-3', 'Maria Santos', 'maria.santos@email.com', '(11) 88888-2222', 'individual', NULL, '987.654.321-00', 'Rua do Comércio, 456 - Rio de Janeiro, RJ'),
      ('client-4', 'Tech Solutions Ltda', 'admin@techsolutions.com.br', '(11) 5555-6666', 'company', '98.765.432/0001-10', NULL, 'Rua da Tecnologia, 789 - São Paulo, SP');
    `);

    // Inserir contratos de exemplo
    sqlite.exec(`
      INSERT INTO contracts (id, title, description, client_id, value, status, content) VALUES
      ('contract-1', 'Contrato de Prestação de Serviços - João Silva', 'Serviços jurídicos de consultoria civil', 'client-1', 5000.00, 'active', 'Contrato de prestação de serviços jurídicos...'),
      ('contract-2', 'Contrato Empresarial - Empresa ABC', 'Assessoria jurídica empresarial completa', 'client-2', 15000.00, 'active', 'Contrato de assessoria jurídica empresarial...'),
      ('contract-3', 'Contrato de Consultoria - Maria Santos', 'Consultoria em direito trabalhista', 'client-3', 3500.00, 'draft', 'Contrato de consultoria jurídica...'),
      ('contract-4', 'Contrato de Representação - Tech Solutions', 'Representação legal em processos', 'client-4', 25000.00, 'active', 'Contrato de representação legal...');
    `);

    // Inserir projetos de exemplo
    sqlite.exec(`
      INSERT INTO projects (id, name, description, client_id, status) VALUES
      ('project-1', 'Processo Trabalhista - João Silva', 'Acompanhamento de processo trabalhista', 'client-1', 'active'),
      ('project-2', 'Revisão Contratual - Empresa ABC', 'Revisão de contratos comerciais', 'client-2', 'active'),
      ('project-3', 'Consultoria Jurídica - Maria Santos', 'Consultoria em questões trabalhistas', 'client-3', 'planning'),
      ('project-4', 'Processo Civil - Tech Solutions', 'Acompanhamento de processo civil', 'client-4', 'active');
    `);

    // Inserir transações de exemplo
    sqlite.exec(`
      INSERT INTO transactions (id, description, amount, type, client_id) VALUES
      ('trans-1', 'Pagamento de honorários - João Silva', 5000.00, 'income', 'client-1'),
      ('trans-2', 'Pagamento de honorários - Empresa ABC', 15000.00, 'income', 'client-2'),
      ('trans-3', 'Despesa com cartório', 150.00, 'expense', NULL),
      ('trans-4', 'Pagamento de honorários - Tech Solutions', 25000.00, 'income', 'client-4'),
      ('trans-5', 'Despesa com deslocamento', 80.00, 'expense', NULL);
    `);

    // Inserir templates de exemplo
    sqlite.exec(`
      INSERT INTO contract_templates (id, name, description, content, category) VALUES
      ('template-1', 'Contrato de Prestação de Serviços Jurídicos', 'Template padrão para prestação de serviços', 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS\n\nPelo presente instrumento...', 'civil'),
      ('template-2', 'Contrato de Assessoria Empresarial', 'Template para assessoria jurídica empresarial', 'CONTRATO DE ASSESSORIA JURÍDICA EMPRESARIAL\n\nPelo presente instrumento...', 'empresarial'),
      ('template-3', 'Contrato de Consultoria', 'Template para serviços de consultoria', 'CONTRATO DE CONSULTORIA JURÍDICA\n\nPelo presente instrumento...', 'civil');
    `);

    // Inserir cláusulas de exemplo
    sqlite.exec(`
      INSERT INTO contract_clauses (id, title, content, category) VALUES
      ('clause-1', 'Cláusula de Confidencialidade', 'O CONTRATADO obriga-se a manter sigilo absoluto sobre todas as informações...', 'confidencialidade'),
      ('clause-2', 'Cláusula de Pagamento', 'O pagamento dos honorários será efetuado conforme cronograma estabelecido...', 'pagamento'),
      ('clause-3', 'Cláusula de Rescisão', 'Este contrato poderá ser rescindido por qualquer das partes...', 'rescisao'),
      ('clause-4', 'Cláusula de Responsabilidade', 'O CONTRATADO responsabiliza-se pela prestação dos serviços...', 'responsabilidade');
    `);

    // Inserir documentos de exemplo
    sqlite.exec(`
      INSERT INTO documents (id, name, type, client_id, status) VALUES
      ('doc-1', 'Procuração - João Silva', 'legal', 'client-1', 'active'),
      ('doc-2', 'Contrato Social - Empresa ABC', 'legal', 'client-2', 'active'),
      ('doc-3', 'Certidão de Nascimento - Maria Santos', 'administrative', 'client-3', 'active'),
      ('doc-4', 'Estatuto Social - Tech Solutions', 'legal', 'client-4', 'active');
    `);
  }
}