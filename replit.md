# Physical Security Risk Assessment Platform

## Overview
This enterprise-grade platform conducts professional physical security assessments, adhering to ASIS International standards and Army FM guidelines. It offers structured facility surveys, detailed risk analysis, and automated reporting to streamline the assessment process and enhance security posture. The platform supports tiered access (free/pro/enterprise), robust authentication, and a site/location management system. It's designed for security professionals to identify vulnerabilities, evaluate physical security controls, and generate compliance-ready reports.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
-   **Framework**: React 18 with TypeScript.
-   **Styling**: Tailwind CSS with shadcn/ui and Radix UI, primarily dark mode, inspired by Carbon Design and Linear.
-   **State Management**: TanStack Query for server state, React hooks for local state.
-   **Routing**: Wouter for lightweight client-side routing.
-   **Form Handling**: React Hook Form with Zod validation.
-   **Mobile Responsiveness**: iOS-optimized design with touch targets, pinch-to-zoom, and responsive layouts for key pages (Dashboard, Assessments, AssessmentDetail).

### Technical Implementations
-   **Backend**: Express.js with Node.js ESM modules, TypeScript.
-   **Database**: PostgreSQL with Drizzle ORM, sharing TypeScript schemas.
-   **API Design**: RESTful endpoints with JSON responses.
-   **Authentication**: Session-based using `express-session` and `connect-pg-simple` for PostgreSQL storage; bcrypt for password hashing; role-based access control (free/pro/enterprise tiers).
-   **Security Model**: Multi-layered, including session authentication, ownership verification middleware, payload sanitization, and filtered data access.
-   **Admin Features**: Admin role system, admin panel for user management, and password reset functionality.
-   **Password Reset System**: Secure self-service password reset using cryptographically strong, time-limited, one-time use tokens.
-   **Multi-Paradigm Assessment System**: Dynamic workflows (e.g., "facility" or "executive") with distinct tab structures, phase indicators, and completion tracking. Includes an Executive Interview component with 34 pre-loaded questions across 11 categories and a standalone PDF export for survey findings.
-   **Template Requirement System**: All assessments must be created from a template. Template selection is enforced at both frontend (form validation) and backend (Zod schema validation). Template auto-populates assessment questions, ensuring photo evidence can be linked to questions.
-   **Triple Risk Calculation Model**: Calculates Inherent, Current, and Residual risks using a floating-point compound reduction system.
-   **Photo Evidence Upload System**: Comprehensive workflow including Replit Object Storage integration, secure API endpoints for upload/download/delete, frontend components for capture/preview/progress, and database storage of evidence paths.

### Feature Specifications
-   **Core Entities**: Assessments, Sites/Locations, Assets, Risk Scenarios, Vulnerabilities, Controls, Treatment Plans, Survey Questions, Risk Insights, Reports, Users, Password Reset Tokens.
-   **Sites Management**: CRUD operations for physical sites, linking assessments to locations.
-   **Risk Calculation**: Compound reduction model for precise risk assessment.
-   **Reporting**: Generates reports in multiple formats (PDF, DOCX, HTML) with visualizations and action items.
-   **Account Tiers**: Free (1 assessment, no AI/PDF), Pro (unlimited, full AI/exports), Enterprise (custom limits, priority support).
-   **Marketing Website**: Professional landing page with feature highlights, pricing, and CTAs.

## External Dependencies

### Database Services
-   **PostgreSQL**: Primary application database.
-   **Neon Database**: Cloud PostgreSQL service.

### AI Services
-   **OpenAI API**: For GPT-5 integration.

### UI/UX Libraries
-   **Radix UI**: Headless component primitives.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Lucide Icons**: Icon library.
-   **Embla Carousel**: Carousel component.

### Development Tools
-   **Vite**: Build tool and dev server.
-   **TypeScript**: Full-stack type safety.
-   **Drizzle Kit**: Database migrations.
-   **Zod**: Runtime type validation.

### Session & Storage
-   **connect-pg-simple**: PostgreSQL session store.
-   **Express Session**: Server-side session management.
-   **Replit Object Storage**: For file persistence (photo evidence).

### Deployment
-   **Replit**: Development and hosting.
-   **ESBuild**: Server code bundling.