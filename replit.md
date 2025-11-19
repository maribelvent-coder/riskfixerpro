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

**Tier-Based Organization Limits** (November 2025) ✓:
- Organizations inherit creator's account tier (Basic/Pro/Enterprise)
- Tier-based limits applied automatically:
  - Basic: 5 assessments, 2 sites, 2 members
  - Pro: 50 assessments, 10 sites, 10 members
  - Enterprise: Unlimited (-1) for all by default
- Admin panel features:
  - View all organizations with their limits
  - Customize limits for any organization tier
  - Edit limits for enterprise organizations with custom values
- Limits stored in shared/tierLimits.ts with getOrganizationTierLimits() helper
- Only paid tier users (basic/pro/enterprise) can create organizations

### Phase 2: Reference Libraries & Template Enhancement (November 2025) ✓
Expanded the platform with professional reference libraries and enhanced template system:

**Completed** ✓:
1. **Threat Library**: 38 professionally cataloged physical security threats across 8 categories
   - Database table: `threat_library` with comprehensive threat metadata
   - Categories: Physical Access, Theft & Crime, Environmental, Violence, Electronic, Supply Chain, Insider, Social Engineering
   - Fields: name, category, description, severity (low/medium/high/critical), likelihood, typical targets, indicators
   - Seed script: `server/seed-threat-library.ts` with all 38 threats
   - Frontend: `/reference/threats` with search, category filtering, severity badges, and statistics dashboard

2. **Control Library**: 49 security controls across 9 categories aligned with CPTED and ASIS standards
   - Database table: `control_library` with detailed control specifications
   - Categories: Access Control, Surveillance, Barriers, Lighting, Intrusion Detection, Personnel, Policy, Response, Environmental
   - Fields: name, category, description, controlType (physical/electronic/procedural), effectiveness (low/medium/high/very-high), cost level, implementation complexity, maintenance requirements
   - Seed script: `server/seed-control-library.ts` with all 49 controls
   - Frontend: `/reference/controls` with search, dual filters (category + type), effectiveness badges, and statistics

3. **Facility Zones**: Site zoning system for granular security assessment
   - Database table: `facility_zones` with zone metadata
   - Fields: siteId, name, zoneType, securityLevel, description, floorNumber, accessRequirements
   - Full CRUD API endpoints: GET/POST/PUT/DELETE `/api/sites/:siteId/zones`
   - Storage layer: Complete DbStorage implementation with zone management methods

4. **Template-Zone Integration**: Auto-creation of facility zones from template suggestions
   - All 5 templates include `suggestedZones` arrays with appropriate zones:
     - Corporate Headquarters: 5 zones (Main Entry, Lobby, Executive Wing, Server Room, Parking)
     - Office Building: 5 zones (Main Entrance, Lobby, Office Areas, Server Room, Parking)
     - Retail Store: 5 zones (Sales Floor, Stockroom, Loading Dock, Cash Handling, Parking)
     - Warehouse & Distribution: 5 zones (Perimeter, Loading Docks, Storage Floor, Admin Office, Yard)
     - Data Center: 5 zones (Security Vestibule, Server Hall, Power Systems, Cooling, NOC)
     - Manufacturing Facility: 5 zones (Perimeter, Production Floor, Loading Dock, Hazmat Storage, Admin)
   - Zones auto-create when assessment is created (POST /api/assessments)
   - Duplicate detection: Case-insensitive name matching prevents duplicates
   - Resilient error handling: Zone creation failures don't block assessment creation

5. **Enhanced Navigation**: "Reference" section in sidebar linking to both libraries

**Technical Decisions**:
- Badge variant="outline" with explicit Tailwind colors (blue/green/yellow/orange/red) for visual severity/effectiveness distinction
- Runtime validation: Exhaustive switches with console.warn for invalid enum values
- Database deployment: Tables created via SQL, seed scripts run manually (tsx server/seed-*.ts)
- Zone auto-creation: Non-blocking try-catch ensures assessment creation always succeeds

**Next Phase**: Phase 3 will add advanced reporting, AI-powered insights, and offline field support.

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