# Physical Security Risk Assessment Platform

## Overview
This platform delivers an enterprise-grade solution for professional physical security assessments, aligning with ASIS International standards and Army FM guidelines. It facilitates structured facility surveys, in-depth risk analysis, and automated reporting to streamline security processes, enhance an organization's security posture, and generate compliance-ready reports. Key features include tiered access (free/pro/enterprise), robust authentication, and comprehensive site/location management. The platform's core purpose is to empower security professionals in identifying vulnerabilities and evaluating physical security controls effectively.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform utilizes React 18 with TypeScript for the frontend, styled with Tailwind CSS, shadcn/ui, and Radix UI, primarily in a dark mode theme inspired by Carbon Design and Linear. State management is handled by TanStack Query for server state and React hooks for local state, with Wouter providing lightweight client-side routing. Form handling is managed by React Hook Form with Zod validation. A mobile-first responsive design is implemented across the platform, ensuring optimal viewing and interaction from small mobile devices to desktops.

**Template Dashboard Architecture (November 2025):** All assessment template dashboards follow the mandated react-hook-form + zodResolver + shadcn Form component pattern. The Office Building dashboard serves as the reference implementation, featuring schema-driven validation, controlled form components, synchronous state updates via form.reset(), and comprehensive data-testid coverage for QA automation. This pattern eliminates ad-hoc state management and ensures type-safe form handling across all templates.

### Technical Implementations
The backend is built with Express.js and Node.js ESM modules in TypeScript. PostgreSQL is used as the database, integrated via Drizzle ORM which also shares TypeScript schemas. The API follows a RESTful design with JSON responses. Authentication is session-based using `express-session` and `connect-pg-simple`, with bcrypt for password hashing and role-based access control (RBAC) across free, pro, and enterprise tiers. A multi-layered security model includes session authentication, ownership verification, payload sanitization, and filtered data access to prevent unauthorized access and privilege escalation, supported by a feature flag system and tenant context for multi-tenancy. Admin features include user management and a secure, token-based password reset system.

A multi-paradigm assessment system supports dynamic workflows (e.g., "facility" or "executive") with template-driven questions loaded dynamically from the database, enforcing template selection and auto-populating assessment questions. A modular risk calculation engine uses an adapter pattern for template-specific implementations, supporting various assessment types like Executive Protection, Office Building, Retail Store, Warehouse, Manufacturing Facility, and Data Center, with compound reduction models for control effectiveness.

**Office Building Template (Completed November 2025):** Workplace violence preparedness and data security assessment with strict Zod schema (employeeCount, visitorVolume, dataSensitivity, hasExecutivePresence), 15 threats (8 workplace violence + 7 data security), 62 controls (access control, emergency response, surveillance, data security, workplace safety), dual-axis risk scoring (60% violence + 40% data security), Unicode-aware control matching, and production-ready react-hook-form implementation. Risk thresholds: Critical (75+), High (50-74), Medium (25-49), Low (0-24).

The platform includes a comprehensive photo evidence upload system integrated with Replit Object Storage. A multi-tenancy foundation provides organization and member management, secure invitation systems, and RBAC enforcement. Reference libraries for Threats (57 threats) and Controls (74 controls) are integrated, aligning with CPTED and ASIS standards. A robust question-control linkage architecture uses database IDs for referential integrity, mapping template questions to control_library entries for quantifiable risk assessments.

A granular facility zoning system provides full CRUD API. The Geographic Intelligence (GeoIntel) system extends site schemas with geographic data, including tables for Points of Interest, crime data, and site incidents. It integrates geocoding services (Google Maps) and various crime data sources, with AI extraction (GPT-4o Vision) and multiple import options, supporting crime data visualization and risk integration with charts and threat likelihood recommendations.

An Executive Protection Database Schema includes executive profiles, interviews, locations, travel routes, crime data imports, incidents, points of interest, and OSINT findings, with Zod validation and TypeScript types. An Executive Interview Questionnaire facilitates structured data ingestion for these assessments.

### Feature Specifications
Core entities managed by the platform include Assessments, Sites/Locations, Assets, Risk Scenarios, Vulnerabilities, Controls, Treatment Plans, Survey Questions, Risk Insights, Reports, Users, Organizations, Threats, Security Controls, Facility Zones, Points of Interest, Crime Data, Site Incidents, and Executive Protection specific entities. The question-control architecture links template questions to control library entries, enabling the risk calculation engine to map survey responses to control effectiveness ratings. The platform supports CRUD operations for physical sites with integrated geocoding, generates reports in multiple formats, and offers Free, Pro, and Enterprise account tiers.

## External Dependencies

### Database Services
-   **PostgreSQL**: Primary application database.
-   **Neon Database**: Cloud PostgreSQL service.

### AI Services
-   **OpenAI API**: For GPT-5 integration, including GPT-4o Vision for crime data extraction.

### UI/UX Libraries
-   **Radix UI**: Headless component primitives.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Lucide Icons**: Icon library.
-   **Embla Carousel**: Carousel component.
-   **Google Maps API**: For geocoding, mapping, and proximity services.

### Development Tools
-   **Vite**: Build tool and development server.
-   **TypeScript**: For full-stack type safety.
-   **Drizzle Kit**: For database migrations.
-   **Zod**: For runtime type validation.

### Session & Storage
-   **connect-pg-simple**: PostgreSQL session store.
-   **Express Session**: Server-side session management.
-   **Replit Object Storage**: For file persistence, particularly photo evidence.

### Deployment
-   **Replit**: Development and hosting platform.
-   **ESBuild**: Server code bundling.