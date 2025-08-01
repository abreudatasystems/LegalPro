# Overview

LegalPro is a comprehensive legal practice management system built as a full-stack web application. It provides law firms and legal professionals with tools to manage contracts, clients, projects, documents, and financial operations through a modern, responsive interface. The system includes features like contract templates, client relationship management (CRM), project tracking, document management, and dashboard analytics to streamline legal practice operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **Routing**: Wouter for client-side routing with protected routes based on authentication status
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with custom legal-themed design system and CSS variables for theming

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **API Design**: RESTful API endpoints with consistent error handling and request/response logging
- **Development Setup**: Vite middleware integration for hot module replacement in development
- **Session Management**: Express sessions with PostgreSQL session store for persistent user sessions

## Authentication System
- **Provider**: Replit OpenID Connect (OIDC) integration with Passport.js strategy
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Authorization**: Role-based access control with user roles (admin, lawyer, assistant)
- **Security**: Secure session cookies with HTTP-only and secure flags for production

## Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM schema definitions
- **Key Entities**: Users, Clients, Contracts, Projects, Documents, Transactions, Contract Templates, and Contract Clauses
- **Relationships**: Well-defined foreign key relationships between entities (clients to contracts, projects to clients, etc.)
- **Enums**: PostgreSQL enums for controlled vocabularies (user roles, contract status, project status, client types)
- **Migrations**: Drizzle-kit for database schema migrations and version control

## Data Layer Architecture
- **Storage Interface**: Abstracted storage layer with comprehensive CRUD operations for all entities
- **Query Optimization**: Efficient database queries with proper indexing and relationship loading
- **Type Safety**: Full TypeScript integration from database schema to API responses
- **Validation**: Zod schemas for runtime validation of input data and API contracts

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Connection Management**: @neondatabase/serverless for optimized serverless database connections

## Authentication Services
- **Replit Auth**: OpenID Connect integration for user authentication and authorization
- **Session Storage**: PostgreSQL-based session persistence with automatic cleanup

## UI and Component Libraries
- **Radix UI**: Headless UI primitives for accessible component foundations
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography throughout the application

## Development and Build Tools
- **Vite**: Fast development server and build tool with React plugin
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

## Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for forms and API data
- **@hookform/resolvers**: Integration layer between React Hook Form and Zod

## Development Environment
- **Replit Platform**: Cloud-based development environment with specific integrations
- **Runtime Error Handling**: @replit/vite-plugin-runtime-error-modal for development error overlay
- **Code Mapping**: @replit/vite-plugin-cartographer for development tooling integration