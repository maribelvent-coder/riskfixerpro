# Physical Security Risk Assessment Platform

## Overview

A comprehensive enterprise-grade platform for conducting professional physical security assessments. The application follows ASIS International standards and Army FM guidelines to provide structured facility surveys, risk analysis, and automated reporting. Built for security professionals to evaluate physical security controls, identify vulnerabilities, and generate compliance-ready reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Design System**: Carbon Design with Linear-inspired patterns, dark mode primary
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Shared TypeScript schemas between client and server
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Assessments**: Core entity tracking security evaluations with status workflow
- **Facility Survey Questions**: Physical security controls evaluation
- **Assessment Questions**: Risk assessment questionnaires
- **Risk Insights**: AI-generated analysis and recommendations
- **Reports**: Generated documentation in multiple formats
- **Users**: Authentication and authorization

### Authentication & Authorization
- **Session-based authentication**: Using express-session with PostgreSQL storage
- **User management**: Username/password with secure password hashing
- **Role-based access**: Support for different user permissions levels

### AI Integration
- **OpenAI GPT-5 Integration**: Risk analysis and insight generation
- **Professional Standards**: Implements ASIS CPP certification standards
- **Lighting Analysis**: ASIS lighting standards (0.5-2.0 fc requirements)
- **Camera System Standards**: Pixel density requirements for different security levels
- **Threat Categorization**: Human, environmental, technical, and operational threats

### Assessment Workflow
- **Phase 1**: Facility Survey - Physical security controls evaluation
- **Phase 2**: Risk Assessment - Threat identification and analysis  
- **Phase 3**: AI Analysis - Automated risk scoring and insights
- **Phase 4**: Report Generation - Multiple format outputs (PDF, DOCX, HTML)

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database for all application data
- **Neon Database**: Cloud PostgreSQL service (@neondatabase/serverless)

### AI Services
- **OpenAI API**: GPT-5 model for risk analysis and insight generation
- **Professional Standards**: ASIS International CPP standards, Army FM 3-19.30

### UI/UX Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent icon system
- **Embla Carousel**: Touch-friendly carousels

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across full stack
- **Drizzle Kit**: Database migrations and schema management
- **Zod**: Runtime type validation and schema parsing

### Session & Storage
- **connect-pg-simple**: PostgreSQL session store
- **Express Session**: Server-side session management

### Deployment
- **Replit**: Development and hosting platform
- **ESBuild**: Production bundling for server code