# Physical Security Risk Assessment Platform

## Overview
This enterprise-grade platform conducts professional physical security assessments in accordance with ASIS International standards and Army FM guidelines. It provides structured facility surveys, detailed risk analysis, and automated reporting. The platform is designed for security professionals to evaluate physical security controls, identify vulnerabilities, and generate compliance-ready reports, aiming to streamline the assessment process and enhance security posture.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
-   **Framework**: React 18 with TypeScript.
-   **Styling**: Tailwind CSS with shadcn/ui and Radix UI for accessibility.
-   **Design System**: Carbon Design with Linear-inspired patterns, primarily dark mode.
-   **State Management**: TanStack Query for server state, React hooks for local state.
-   **Routing**: Wouter for lightweight client-side routing.
-   **Form Handling**: React Hook Form with Zod validation.

### Technical Implementations
-   **Backend**: Express.js with Node.js ESM modules, TypeScript.
-   **Database**: PostgreSQL with Drizzle ORM; shared TypeScript schemas between client and server.
-   **API Design**: RESTful endpoints with JSON responses.
-   **Authentication**: Session-based using `express-session` with PostgreSQL store; username/password with secure hashing; role-based access control.
-   **AI Integration**: OpenAI GPT-5 for risk analysis and insight generation, adhering to ASIS CPP standards.
-   **Assessment Workflow**: A multi-phase process including Facility Survey, a 7-step Enhanced Risk Assessment (Assets, Risk Scenarios, Vulnerabilities & Controls, Prioritize Risks, Treatment Planning, Executive Summary, Review & Submit), AI Analysis, and Report Generation.
-   **Triple Risk Calculation Model**: Calculates Inherent, Current (after existing controls), and Residual (after proposed treatments) risks using a floating-point compound reduction system.

### Feature Specifications
-   **Core Entities**: Assessments, Assets (people, property, information, reputation), Risk Scenarios, Vulnerabilities, Controls (existing and proposed), Treatment Plans, Facility Survey Questions, Assessment Questions, Risk Insights, Reports, Users.
-   **Risk Calculation**: Employs a precise compound reduction model (10% reduction per effectiveness point) for current and residual risk calculations, considering likelihood and impact reductions separately.
-   **Reporting**: Generates reports in multiple formats (PDF, DOCX, HTML) with visualizations, executive summaries, and categorized action items based on risk levels.

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

### Deployment
-   **Replit**: Development and hosting.
-   **ESBuild**: Server code bundling.