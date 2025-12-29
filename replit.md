# Physical Security Risk Assessment Platform

## Overview
This platform is an enterprise-grade solution for professional physical security assessments. It aligns with ASIS International standards and Army FM guidelines to facilitate structured facility surveys, in-depth risk analysis, and automated reporting. The platform aims to streamline security processes, enhance an organization's security posture, and generate compliance-ready reports. It features tiered access (free/pro/enterprise), robust authentication, comprehensive site/location management, and empowers security professionals to identify vulnerabilities and evaluate physical security controls effectively.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend uses React 18 with TypeScript, styled with Tailwind CSS, shadcn/ui, and Radix UI, primarily in a dark mode. State management is handled by TanStack Query and React hooks, with Wouter for client-side routing. Form handling uses React Hook Form with Zod validation. A mobile-first responsive design ensures optimal viewing across devices. All assessment template dashboards follow a react-hook-form + zodResolver + shadcn Form component pattern for schema-driven validation and type-safe form handling.

### Technical Implementations
The backend is built with Express.js and Node.js ESM modules in TypeScript. PostgreSQL is the database, integrated via Drizzle ORM. The API is RESTful with JSON responses. Authentication uses JWT tokens and session-based fallback (`express-session`, `connect-pg-simple`), with bcrypt for password hashing and role-based access control.

Multi-tenant data isolation is implemented via a `TenantStorage` class with hybrid filtering. Key middleware components (`attachTenantContext`, `requireOrganizationPermission`, `verifyAssessmentOwnership`, `verifySiteOwnership`) enforce tenant context and ownership verification. New users automatically receive a personal organization upon registration, eliminating a separate onboarding step and linking them as organization owners with free-tier limits. An invitation system allows secure organization member invitations with one-time token-based acceptance. Admin features include user management and a secure password reset system.

A multi-paradigm assessment system supports dynamic workflows with template-driven questions loaded from the database. A modular risk calculation engine uses an adapter pattern for template-specific implementations (e.g., Executive Protection, Office Building), supporting compound reduction models for control effectiveness. The Office Building template includes workplace violence and data security assessments with strict Zod schemas, 15 threats, 62 controls, and dual-axis risk scoring. Automated risk scenario generation upon profile save creates standard scenarios and implicit assets. Total Cost of Risk (TCOR) calculations are implemented across all assessment templates to quantify direct and indirect security costs, with standardized TCOR fields in each template's profile schema.

A comprehensive photo evidence upload system integrates with Replit Object Storage, featuring automatic image optimization using the Sharp library (resizing to max 1600px and converting to WebP, quality 75%) upon upload and on-the-fly for legacy images during export.

Multi-tenancy provides organization and member management, secure invitations, and RBAC. Reference libraries for Threats (57) and Controls (74) are integrated, aligning with CPTED and ASIS standards. A question-control linkage architecture uses database IDs for referential integrity. A granular facility zoning system provides full CRUD API.

The Geographic Intelligence (GeoIntel) system extends site schemas with geographic data, including tables for Points of Interest, crime data, and site incidents. It integrates geocoding services (Google Maps) and crime data sources, using AI extraction (GPT-4o Vision) for crime data visualization and risk integration.

An Executive Protection Database Schema includes executive profiles, interviews, locations, travel routes, crime data imports, incidents, points of interest, and OSINT findings, with Zod validation. The Executive Protection Interview Risk Mapper implements the T×V×I×E formula unique to the EP framework, calculating threat likelihood, vulnerability, impact, and exposure based on interview questions and mapping to control recommendations. An Executive Protection AI Risk Assessment uses GPT-4o for enhanced threat assessment with algorithmic fallback, providing evidence-based scoring and narrative summaries. An Executive Protection Controls Library contains 48 EP-specific controls across 6 categories.

### Feature Specifications
Core entities managed include Assessments, Sites/Locations, Assets, Risk Scenarios, Vulnerabilities, Controls, Treatment Plans, Survey Questions, Risk Insights, Reports, Users, Organizations, Threats, Security Controls, Facility Zones, Points of Interest, Crime Data, Site Incidents, and Executive Protection specific entities. The platform supports CRUD operations for physical sites with integrated geocoding, generates reports in multiple formats, and offers Free, Pro, and Enterprise account tiers.

## External Dependencies

### Database Services
-   **PostgreSQL**: Primary application database.
-   **Neon Database**: Cloud PostgreSQL service.

### AI Services
-   **OpenAI API**: For GPT-5 integration, including GPT-4o Vision.

### Crime Data Services
-   **Crimeometer API**: Provides crime incidents, statistics, sex offender registry data, and 911 calls for service.

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
-   **Replit Object Storage**: For file persistence (photo evidence).

### Deployment
-   **Replit**: Development and hosting platform.
-   **ESBuild**: Server code bundling.