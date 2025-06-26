# DebateCard AI - Replit Configuration

## Overview

DebateCard AI is a full-stack web application designed to help debate teams analyze documents and create formatted debate cards using AI-powered document processing. The application allows users to upload documents (PDF, Google Docs, or plain text), analyze them with custom prompts, and extract relevant debate evidence organized into categorized cards.

## System Architecture

### Technology Stack
- **Frontend**: React with TypeScript, Vite build tool, Tailwind CSS for styling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **AI Integration**: OpenAI GPT-4o for document analysis
- **UI Components**: Radix UI with shadcn/ui component system
- **Development Environment**: Replit with Node.js 20, PostgreSQL 16

### Architecture Pattern
The application follows a modern full-stack architecture with:
- Client-server separation with API communication
- Shared schema definitions between frontend and backend
- Modular component structure with reusable UI components
- Service-oriented backend with separate concerns for document processing and AI analysis

## Key Components

### Frontend Architecture
- **Component Structure**: Organized with shadcn/ui components in `/client/src/components/ui/`
- **Page Structure**: Single-page application with routing via Wouter
- **State Management**: React Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with custom theme configuration and CSS variables

### Backend Architecture
- **Server**: Express.js with TypeScript, middleware for logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation (designed for future PostgreSQL integration)
- **Document Processing**: Service layer for text extraction from various sources
- **AI Integration**: OpenAI service for document analysis and debate card generation

### Database Schema
The application uses Drizzle ORM with PostgreSQL, defining four main entities:
- **Users**: Basic user management
- **Documents**: Stores uploaded documents with metadata
- **Debate Cards**: Generated debate evidence cards with categorization
- **Analyses**: Tracks analysis requests and settings

## Data Flow

### Document Upload Process
1. User uploads document via drag-and-drop or file input
2. Server processes document based on type (PDF, Google Docs, or text)
3. Document metadata stored in database
4. Document content prepared for analysis

### AI Analysis Workflow
1. User provides analysis prompt and settings (bold arguments, highlight statistics, citations)
2. Document text sent to OpenAI with structured prompt
3. AI returns formatted text and extracted debate cards
4. Results stored and displayed with categorization and relevance scoring

### Card Generation
1. AI analyzes document content against user prompt
2. Extracts relevant passages for debate arguments
3. Applies formatting based on user settings
4. Categorizes cards by relevance and topic
5. Returns structured JSON with cards and summary

## External Dependencies

### Core Dependencies
- **OpenAI API**: Document analysis and card generation
- **Neon Database**: PostgreSQL hosting (configured but not actively used)
- **Radix UI**: Accessible component primitives
- **React Query**: Server state management
- **Drizzle**: Type-safe database toolkit

### Development Tools
- **Vite**: Fast development server and build tool
- **Replit-specific**: Runtime error overlay, cartographer for development
- **ESBuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Replit Configuration**: Automated setup with Node.js 20 and PostgreSQL 16 modules
- **Hot Reload**: Vite dev server with HMR for frontend, tsx for backend development
- **Port Configuration**: Frontend served on port 5000, mapped to external port 80

### Build Process
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code for production
- **Database**: Drizzle migrations managed via CLI commands

### Production Deployment
- **Autoscale Deployment**: Configured for Replit's autoscale platform
- **Static Serving**: Production serves built frontend assets alongside API
- **Environment Variables**: Database URL and OpenAI API key required

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```