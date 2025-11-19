# Physical Security Risk Assessment Platform

## Overview
This enterprise-grade platform conducts professional physical security assessments, adhering to ASIS International standards and Army FM guidelines. It offers structured facility surveys, detailed risk analysis, and automated reporting to streamline the assessment process and enhance security posture. The platform supports tiered access (free/pro/enterprise), robust authentication, and a site/location management system. It's designed for security professionals to identify vulnerabilities, evaluate physical security controls, and generate compliance-ready reports.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

### Phase 0: Architectural Hardening (November 2025) ✓
Completed foundational infrastructure for multi-tenancy and enterprise features:

**Infrastructure Added**:
- Feature flag system (`shared/featureFlags.ts`) for gradual rollout
- Tenant context types and middleware (`shared/tenantContext.ts`, `server/tenantMiddleware.ts`)
- Dual risk calculation support - compound + T×V×I models (`shared/riskCalculationConfig.ts`)
- Storage factory pattern for tenant-aware data access (`server/tenantStorage.ts`, `server/storageFactory.ts`)
- OpenAI service lazy-loading fix (prevents startup crashes)

**Architectural Decisions**:
- Retained Express/Vite stack (better for AI jobs, PDFs, offline work)
- No database changes in Phase 0 (purely additive infrastructure)
- Feature flags default to false (safe rollout)
- organizationId columns deferred to Phase 1

See `PHASE0-COMPLETE.md` for detailed documentation.

### Phase 1: Multi-Tenancy Foundation (November 2025) ✓
Built complete organization and member management system with enterprise-grade security:

**Completed** ✓:
1. **Schema Updates**: Added `organizationId` to sites and assessments tables with proper indexes and foreign keys
2. **Organization CRUD**: Full API for creating, updating, and deleting organizations with validation
3. **Member Invitation System**: Complete backend implementation
   - `organizationInvitations` table with cryptographic tokens (32-byte hex)
   - Storage layer CRUD for invitations (create, list, accept, revoke)
   - Secure API routes with validation and expiry enforcement (7-day tokens)
   - Email notification service with logging (upgradeable to SendGrid/AWS SES)
   - Frontend URL construction for accept links (dev: localhost:5173, prod: Replit domain)
   - Security: Tokens excluded from API responses, one-time use enforcement, proper status tracking

4. **Organization Management UI**: Complete frontend implementation
   - Enhanced TeamMembers page with invite dialog and form validation
   - Pending invitations table with revoke capability  
   - AcceptInvitation page for email link acceptance
   - Toast notifications for all actions (invite, revoke, accept)
   - Route integration at `/accept-invitation/:token`

5. **RBAC Enforcement**: Production-ready multi-tenant isolation
   - Organization-scoped middleware for sites and assessments
   - Payload sanitization prevents cross-tenant tampering (userId/organizationId stripped from updates)
   - POST routes force server-side organizationId assignment
   - GET routes aggregate user + organization member data
   - All write operations verify organization membership
   - Architect-reviewed security model prevents privilege escalation

**Security Hardening**:
- Blocked tier self-upgrades (prevented privilege escalation)
- Fixed organization deletion to remove all related records
- Validated invitation expiry and status before acceptance
- Filtered sensitive tokens from API responses
- **Critical**: Sanitized all update/create payloads to prevent organizationId tampering
- **Critical**: Added middleware enforcement to all PUT/DELETE routes

**Multi-Tenancy Model**:
- Organization members can view/edit each other's sites and assessments
- Individual users (no organization) only access their own data
- All resources tagged with organizationId on creation
- Cross-organization access attempts blocked at middleware level

**Next Phase**: Phase 2 will add enhanced templates, facility zones, asset management, and threat/control libraries.

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