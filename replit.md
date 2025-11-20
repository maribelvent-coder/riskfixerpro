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
- **Mobile-First Responsive Design**: Comprehensive platform-wide mobile optimization (November 2025) supporting 360px to desktop viewports. Mobile-first design tokens: typography (text-xs sm:text-sm for labels, text-sm sm:text-base for body, text-2xl sm:text-3xl for headings), spacing (p-2.5 sm:p-4 cards, space-y-2 sm:space-y-4), touch targets (min-h-11 / 44px minimum on all interactive controls), responsive grids (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3), full-width mobile buttons (w-full sm:w-auto), and horizontally scrollable tabs. Applied consistently across all 23+ pages and assessment workflow components. Critical fixes: navigation button stacking, tab scrolling containment, hero text scaling, and pricing table responsiveness to eliminate horizontal overflow on small devices.

### Technical Implementations
- **Backend**: Express.js with Node.js ESM modules, TypeScript.
- **Database**: PostgreSQL with Drizzle ORM, sharing TypeScript schemas.
- **API Design**: RESTful endpoints with JSON responses.
- **Authentication**: Session-based using `express-session` and `connect-pg-simple` for PostgreSQL storage; bcrypt for password hashing; role-based access control (free/pro/enterprise tiers).
- **Security Model**: Multi-layered, including session authentication, ownership verification middleware, payload sanitization, and filtered data access to prevent cross-tenant tampering and privilege escalation. Includes a feature flag system and tenant context for multi-tenancy.
- **Admin Features**: Admin role system, admin panel for user management, and password reset functionality.
- **Password Reset System**: Secure self-service password reset using cryptographically strong, time-limited, one-time use tokens.
- **Multi-Paradigm Assessment System**: Supports dynamic workflows (e.g., "facility" or "executive") with distinct tab structures, phase indicators, and completion tracking. Includes an Executive Interview component and standalone PDF export for survey findings.
- **Template Requirement System**: All assessments must be created from a template, enforcing template selection at both frontend and backend, and auto-populating assessment questions. **Template-Driven Questions**: FacilitySurvey component now loads questions dynamically from database (template questions copied during assessment creation) instead of using hardcoded ASIS questions, enabling each template to show its unique survey structure.
- **Risk Calculation Model**: Calculates Inherent, Current, and Residual risks using a floating-point compound reduction system, supporting both compound and T×V×I models.
- **Photo Evidence Upload System**: Comprehensive workflow including Replit Object Storage integration, secure API endpoints, frontend components for capture/preview/progress, and database storage of evidence paths.
- **Multi-Tenancy Foundation**: Complete organization and member management with schema updates (organizationId), CRUD operations for organizations, a secure member invitation system, and robust RBAC enforcement. Organizations inherit creator's account tier with configurable limits.
- **Reference Libraries**: Integrated Threat Library (57 threats across 9 categories including 8 EP-specific threats: Targeted Kidnapping, Express Kidnapping, Home Invasion-Targeted, Stalking-Physical, Cyberstalking & Doxxing, Assassination/Physical Assault, Paparazzi/Media Harassment, Protest at Residence) and Control Library (74 controls across 15 categories including 11 EP-specific controls: Executive Protection Detail 24/7, Secure Driver Service, Armored Vehicle, Route Randomization Protocol, Residential Security Team, Panic Room with Communications, Advanced CCTV with Off-Site Monitoring, Threat Intelligence Monitoring, Digital Privacy Services, Family Security Training, Executive Security App). Both libraries include database storage, seed scripts, and frontend browsing capabilities aligned with CPTED and ASIS standards.
- **Template-Driven Question System**: Comprehensive question-control linkage architecture enabling quantifiable risk assessments. Each template question explicitly references a control_library entry via foreign key (control_library_id), creating data flow: Template → Questions (with control FK) → Survey Responses → Risk Calculation (using control effectiveness). System includes 81 facility-specific questions (retail: 20, warehouse: 20, data center: 20, manufacturing: 21) with TypeScript configs, validation utilities ensuring template-library alignment, and automated seeding. Question types use hyphenated format ("yes-no") for schema consistency. **ID-Based Architecture (November 2025)**: Refactored to use database IDs for proper referential integrity. Added `questionControlMap` junction table to store all control mappings per question (not just first control). Created library-resolver service for name→ID conversion. Built data-driven risk mapper v3 that queries junction tables (`questionThreatMap`, `questionControlMap`) using IDs only—zero runtime name-matching. Seed scripts fail fast if any threat/control mapping is broken. Office Building template: 91 questions seeded with full ID-based linkages.
- **Facility Zones**: Granular site zoning system for security assessments with full CRUD API and auto-creation from assessment templates.
- **Geographic Intelligence (GeoIntel) System**: Extends sites schema with geographic data, new tables for Points of Interest (POIs), crime data, and site incidents. Includes geocoding services (Google Maps), crime data services (GPT-4o Vision for PDF extraction, FBI UCR integration, BJS NIBRS national statistics, and major US city crime APIs), site incident tracking via CSV upload, and secure API routes for geographic data management. Crime data import supports multiple sources via 5-tab dialog: PDF upload (with AI extraction), manual entry, FBI agency search, BJS national statistics (2019-present), and city-specific APIs for Seattle, Chicago, Los Angeles, and New York City. City crime classification uses three strategies: direct (Seattle uses exact offense_category values), mapping (Chicago maps primary_type to whitelists), and keyword (LA/NYC use LIKE filters on description fields with documented overlap limitation for approximate estimates). **Phase 4 Complete**: Crime Data Visualization and Risk Integration implemented with comprehensive charts, multi-year trends, crime-to-threat mapping, and Risk Intelligence panel showing threat likelihood recommendations and control suggestions.
- **Executive Protection Database Schema (Phase 2 - November 2025)**: Comprehensive schema implementation for executive protection assessments with 8 new tables and 14 foreign key constraints. Tables include: executive_profiles (personal info, security posture, threat intel), executive_interviews (structured interview responses, cooperation levels), executive_locations (residences, offices, frequent destinations with geocoding), executive_travel_routes (commute paths, chokepoints, route geometry), crime_data_imports (CAP Index integration), crime_incidents (individual crime reports with location pins), executive_points_of_interest (emergency services, threats, safe havens), and osint_findings (social media exposure, public records). Foreign key constraints enforce referential integrity with cascade delete for parent-child relationships and set null for optional references. All tables use varchar UUID primary keys for consistency with existing schema patterns. Schema includes Zod validation schemas and TypeScript types for all entities. **Executive Interview Questionnaire**: Structured data ingestion tool with 7 progressive disclosure sections (~30 questions total) covering threat perception, public profile, daily routines, residential security, family safety, transportation, and current security measures. Includes risk indicator keywords for automated flagging and follow-up question logic. Interview data stored in executive_interviews table with JSON responses.
- **GeoIntel Future Roadmap**: **Phase 5 - Mitigation Roadmapping**: Auto-prioritize security controls based on crime-informed threat analysis, track implementation costs/effort, generate sequenced remediation roadmaps with ownership and timelines, no new external integrations required. **Phase 6 - Portfolio Intelligence & Benchmarking**: Multi-site analytics with crime trend aggregation across tenant portfolios, hotspot identification, peer comparisons, trend alerts, and executive dashboards for recurring engagement. **Phase 7 - Workflow Automation & Collaboration**: Task assignment when new risks identified, notification system for critical crime alerts, auto-generated reports from GeoIntel insights, team collaboration on mitigation plans.

### Feature Specifications
- **Core Entities**: Assessments, Sites/Locations, Assets, Risk Scenarios, Vulnerabilities, Controls, Treatment Plans, Survey Questions (with control_library_id FK), Risk Insights, Reports, Users, Password Reset Tokens, Organizations, Threats (57 total), Security Controls (74 total), Facility Zones, Points of Interest, Crime Data, Site Incidents, Executive Profiles, Executive Interviews, Executive Locations, Executive Travel Routes, Crime Data Imports, Crime Incidents, Executive Points of Interest, OSINT Findings.
- **Question-Control Architecture**: Template questions → control_library linkage enables risk calculation engine to map survey responses to control effectiveness ratings. Data flow: (1) Templates define commonRisks (threat_library names) and typicalControls (control_library names), (2) Question configs reference control names and specify assessment criteria (yes-no, rating, text, photo), (3) Seed script populates template_questions with control_library_id FKs, (4) Assessment creation copies questions to facility_survey_questions preserving control links, (5) Risk calculation uses control IDs to aggregate effectiveness and compute reduction factors.
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