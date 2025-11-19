# Physical Security Risk Assessment Platform

## Overview
This platform provides an enterprise-grade solution for conducting professional physical security assessments, adhering to ASIS International standards and Army FM guidelines. It enables structured facility surveys, detailed risk analysis, and automated reporting to streamline the assessment process, enhance security posture, and generate compliance-ready reports. Key capabilities include tiered access (free/pro/enterprise), robust authentication, and comprehensive site/location management. The platform aims to empower security professionals in identifying vulnerabilities and evaluating physical security controls.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS with shadcn/ui and Radix UI, primarily dark mode, inspired by Carbon Design and Linear.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Routing**: Wouter for lightweight client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **Mobile Responsiveness**: iOS-optimized design with touch targets, pinch-to-zoom, and responsive layouts.

### Technical Implementations
- **Backend**: Express.js with Node.js ESM modules, TypeScript.
- **Database**: PostgreSQL with Drizzle ORM, sharing TypeScript schemas.
- **API Design**: RESTful endpoints with JSON responses.
- **Authentication**: Session-based using `express-session` and `connect-pg-simple` for PostgreSQL storage; bcrypt for password hashing; role-based access control (free/pro/enterprise tiers).
- **Security Model**: Multi-layered, including session authentication, ownership verification middleware, payload sanitization, and filtered data access to prevent cross-tenant tampering and privilege escalation. Includes a feature flag system and tenant context for multi-tenancy.
- **Admin Features**: Admin role system, admin panel for user management, and password reset functionality.
- **Password Reset System**: Secure self-service password reset using cryptographically strong, time-limited, one-time use tokens.
- **Multi-Paradigm Assessment System**: Supports dynamic workflows (e.g., "facility" or "executive") with distinct tab structures, phase indicators, and completion tracking. Includes an Executive Interview component and standalone PDF export for survey findings.
- **Template Requirement System**: All assessments must be created from a template, enforcing template selection at both frontend and backend, and auto-populating assessment questions.
- **Risk Calculation Model**: Calculates Inherent, Current, and Residual risks using a floating-point compound reduction system, supporting both compound and T×V×I models.
- **Photo Evidence Upload System**: Comprehensive workflow including Replit Object Storage integration, secure API endpoints, frontend components for capture/preview/progress, and database storage of evidence paths.
- **Multi-Tenancy Foundation**: Complete organization and member management with schema updates (organizationId), CRUD operations for organizations, a secure member invitation system, and robust RBAC enforcement. Organizations inherit creator's account tier with configurable limits.
- **Reference Libraries**: Integrated Threat Library (38 threats across 8 categories) and Control Library (49 controls across 9 categories aligned with CPTED and ASIS standards), both with database storage, seed scripts, and frontend browsing capabilities.
- **Facility Zones**: Granular site zoning system for security assessments with full CRUD API and auto-creation from assessment templates.
- **Geographic Intelligence (GeoIntel) System**: Extends sites schema with geographic data, new tables for Points of Interest (POIs) and crime data. Includes geocoding services (Google Maps), crime data services (GPT-4o Vision for PDF extraction, FBI UCR integration), and secure API routes for geographic data management.

### Feature Specifications
- **Core Entities**: Assessments, Sites/Locations, Assets, Risk Scenarios, Vulnerabilities, Controls, Treatment Plans, Survey Questions, Risk Insights, Reports, Users, Password Reset Tokens, Organizations, Threats, Security Controls, Facility Zones, Points of Interest, Crime Data.
- **Sites Management**: CRUD operations for physical sites, linking assessments to locations, with integrated geocoding.
- **Reporting**: Generates reports in multiple formats (PDF, DOCX, HTML) with visualizations and action items.
- **Account Tiers**: Free (limited), Pro (unlimited, full AI/exports), Enterprise (custom limits, priority support).
- **Marketing Website**: Professional landing page with feature highlights, pricing, and CTAs.

## External Dependencies

### Database Services
- **PostgreSQL**: Primary application database.
- **Neon Database**: Cloud PostgreSQL service.

### AI Services
- **OpenAI API**: For GPT-5 integration (e.g., GPT-4o Vision for crime data extraction).

### UI/UX Libraries
- **Radix UI**: Headless component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide Icons**: Icon library.
- **Embla Carousel**: Carousel component.
- **Google Maps API**: For geocoding, mapping, and proximity services.

### Development Tools
- **Vite**: Build tool and dev server.
- **TypeScript**: Full-stack type safety.
- **Drizzle Kit**: Database migrations.
- **Zod**: Runtime type validation.

### Session & Storage
- **connect-pg-simple**: PostgreSQL session store.
- **Express Session**: Server-side session management.
- **Replit Object Storage**: For file persistence (photo evidence).

### Deployment
- **Replit**: Development and hosting.
- **ESBuild**: Server code bundling.