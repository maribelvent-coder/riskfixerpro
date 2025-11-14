# Physical Security Risk Assessment Platform

## Overview
This enterprise-grade platform conducts professional physical security assessments in accordance with ASIS International standards and Army FM guidelines. It provides structured facility surveys, detailed risk analysis, and automated reporting. The platform is designed for security professionals to evaluate physical security controls, identify vulnerabilities, and generate compliance-ready reports, aiming to streamline the assessment process and enhance security posture.

**Current Status:** Complete marketing website with authentication, tiered access control (free/pro/enterprise), route protection, production-ready session management, and self-service password reset. Site/location management system for organizing assessments by physical facilities. Free tier accounts are limited to 1 assessment with no AI insights or PDF exports. Sessions persist across server restarts using PostgreSQL storage. **Latest (Nov 14, 2025):** Executive Protection paradigm survey questions now display correctly across all tabs; assessment deletion functionality added with confirmation dialog; backend security hardened with Zod validation on PATCH endpoints.

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
-   **Authentication**: Session-based using `express-session` with PostgreSQL store (connect-pg-simple); username/password with bcrypt hashing; role-based access control with free/pro/enterprise tiers.
-   **Session Management**: Production-ready configuration with:
    -   PostgreSQL-backed session storage (persists across server restarts)
    -   Environment-based security: secure cookies in production, HTTP in development
    -   Required environment variables: SESSION_SECRET, DATABASE_URL
    -   httpOnly cookies (XSS protection)
    -   sameSite: 'lax' (CSRF protection)
    -   7-day session expiration
    -   Trust proxy configured for production deployments
-   **Security Model**: Multi-layered protection:
    -   Session authentication on all protected routes (401 if not authenticated)
    -   Ownership verification middleware for all assessment, site, and sub-resource routes (403 if not owner)
    -   Payload sanitization on all PUT routes to prevent ownership field tampering
    -   Dashboard stats filtered by userId to prevent data leakage
    -   All 40+ API routes secured against cross-user access
    -   Site ownership verification ensures users cannot access or modify other users' sites
    -   Admin access control middleware for admin-only routes
-   **Admin Features**:
    -   Admin role system with `isAdmin` boolean field in users table
    -   Admin-only routes protected by `verifyAdminAccess` middleware
    -   Admin Panel UI at `/app/admin` for user management
    -   User list view showing all users with their account tier and admin status
    -   Password reset functionality: admins can reset any user's password (min 8 characters)
    -   Admin navigation link in sidebar (only visible to admin users)
    -   To create an admin: `UPDATE users SET is_admin = true WHERE id = 'user-id'`
-   **Password Reset System**: Secure self-service password reset functionality:
    -   Username-based reset flow (users don't have email addresses yet)
    -   Cryptographically strong tokens generated via crypto.randomBytes
    -   Tokens hashed with bcrypt before database storage
    -   1-hour token expiration
    -   One-time use tokens (marked as used after successful reset)
    -   Old unused tokens automatically invalidated when new ones are requested
    -   Uniform API responses to prevent user enumeration attacks
    -   UI routes: `/forgot-password` (request), `/reset-password?token=xxx` (reset)
    -   Backend routes: POST `/api/auth/request-password-reset`, POST `/api/auth/reset-password`
    -   In production: tokens would be emailed; in development: logged to console
-   **Route Structure**: 
    -   Public marketing routes: `/` (landing), `/pricing`, `/classes`, `/consulting`, `/contact`
    -   Protected app routes: `/app/*` (dashboard, assessments, sites, analysis, settings)
    -   Authentication routes: `/login`, `/signup`, `/forgot-password`, `/reset-password`
-   **AI Integration**: OpenAI GPT-5 for risk analysis and insight generation, adhering to ASIS CPP standards.
-   **Multi-Paradigm Assessment System**: Dynamic workflow system where different assessment types display completely different tab structures and workflows (not just different questions):
    -   **Architecture**: 
        -   `surveyParadigm` field in templates and assessments determines workflow type ("facility" or "executive")
        -   AssessmentDetail component dynamically renders tabs and phase indicators based on paradigm
        -   Each paradigm has its own tab configuration, phase labels, and completion tracking
    -   **Facility Paradigm** (Standard): Traditional 3-tab workflow
        -   Tabs: Facility Survey → Risk Assessment → Reports
        -   Phase indicators: "Phase 1: Facility Survey", "Phase 2: Risk Assessment", "Reports"
        -   Completion tracking via `facilitySurveyCompleted` and `riskAssessmentCompleted` fields
    -   **Executive Paradigm**: Specialized 7-tab workflow for executive protection
        -   Tabs: Executive Interview → Executive Profile & Threat Assessment → Digital Footprint Analysis → Physical Security Review → Risk Analysis → Security Treatment Plan → Executive Summary
        -   Phase indicators: "Profile & Threats", "Analysis", "Treatment & Summary"
        -   **Executive Interview** (NEW - 1st tab): Comprehensive interview component with 34 pre-loaded questions across 11 categories:
            -   Categories: Incident History & Threats, Executive Protection, Public Profile, Daily Routines & Travel, Residences, Family Information, Office Security, Mail & Packages, Transportation, Itinerary Planning, Travel Security
            -   Question types: Yes/No + text (23 questions) and text-only (11 questions)
            -   Features: Auto-save on all responses (debounced for text, immediate for yes/no), collapsible category sections, progress tracking
            -   Database: executive_interview_questions and executive_interview_responses tables with unique constraints for upsert operations
            -   State management: Ref-based approach prevents stale closure bugs and preserves user edits during auto-save
        -   39 pre-loaded survey questions with enhanced categorization:
            -   **Digital Footprint Analysis**: PII exposure, dark web monitoring, social media review (executive & family)
            -   **Travel Assessment**: Personal practices, travel security, transportation protocols, digital hygiene
            -   **Residential Security**: Perimeter security, access control, alarm systems, emergency planning (includes residential imagery analysis)
            -   **Executive Office & Corporate Security**: Office physical security and CPTED
            -   **Additional Observations**: Free-form section for ad-hoc interview notes
        -   Section-level skip functionality: Skip buttons at each category header mark all questions with "[Section Skipped]"
        -   Standalone PDF export: Generate survey findings report without completing full risk analysis workflow
    -   **Implementation Details**:
        -   Tab initialization: useEffect with useRef ensures correct initial tab selection based on paradigm
        -   Loading guards prevent rendering until paradigm is determined
        -   TypeScript typing via SelectAssessment ensures type safety
        -   Phase progress indicators dynamically render based on workflowConfig.phases
        -   Template selection automatically sets assessment paradigm on creation
-   **Triple Risk Calculation Model**: Calculates Inherent, Current (after existing controls), and Residual (after proposed treatments) risks using a floating-point compound reduction system.
-   **Photo Evidence Upload System**: Complete evidence documentation workflow:
    -   **Backend Architecture**:
        -   Replit Object Storage integration for file persistence
        -   ObjectStorageService with uploadEvidence, deleteEvidence, getEvidenceFile methods
        -   Atomic evidence array updates via storage.appendFacilityQuestionEvidence and storage.appendAssessmentQuestionEvidence methods (prevents concurrent upload race conditions using PostgreSQL array_append)
        -   Security: Session authentication + ownership verification on all evidence routes
        -   Evidence metadata stored in GCS custom metadata (assessmentId, questionId, questionType)
        -   File validation: 10MB limit, image-only MIME types, max 10 photos per question
    -   **API Endpoints**:
        -   POST `/api/assessments/:id/evidence` - Upload with multipart/form-data (multer)
        -   GET `/evidence/:path(*)` - Secure download with ownership verification
        -   DELETE `/api/assessments/:id/evidence` - Remove evidence file and array entry
    -   **Frontend Components**:
        -   Reusable EvidenceUploader component with camera capture (`capture="environment"`)
        -   File picker for existing photos
        -   Preview gallery with thumbnails
        -   Upload progress tracking via XMLHttpRequest
        -   Delete with confirmation
        -   Integrated into FacilitySurvey and ExecutiveSurveyQuestions components
    -   **Database**: Evidence paths stored as text arrays in facilitySurveyQuestions.evidence and assessmentQuestions.evidence fields

### Feature Specifications
-   **Core Entities**: Assessments, Sites/Locations, Assets (people, property, information, reputation), Risk Scenarios, Vulnerabilities, Controls (existing and proposed), Treatment Plans, Facility Survey Questions, Assessment Questions, Risk Insights, Reports, Users, Password Reset Tokens.
-   **Sites Management**: 
    -   CRUD operations for physical sites/locations
    -   Site fields: name, address (city, state, zip, country), facility type, contact information, notes
    -   Ownership verification ensures users can only access their own sites
    -   Assessments can be linked to sites via optional siteId foreign key
    -   Assessment creation flow supports both site selection and manual location entry
-   **Risk Calculation**: Employs a precise compound reduction model (10% reduction per effectiveness point) for current and residual risk calculations, considering likelihood and impact reductions separately.
-   **Reporting**: Generates reports in multiple formats (PDF, DOCX, HTML) with visualizations, executive summaries, and categorized action items based on risk levels.
-   **Account Tiers**: 
    -   **Free**: 1 assessment maximum, no AI insights, no PDF exports
    -   **Pro**: Unlimited assessments, full AI analysis, all export formats
    -   **Enterprise**: Custom limits, priority support, white-label options
-   **Marketing Website**: Professional landing page with hero section, feature highlights, testimonials, pricing grid, and CTAs for signup/demo.

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