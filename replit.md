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
- **Assets**: Protected assets categorized by type (people, property, information, reputation)
- **Risk Scenarios**: Threat scenarios with inherent risk calculations
- **Vulnerabilities**: Security weaknesses linked to risk scenarios
- **Controls**: Existing and proposed controls with effectiveness ratings (1-5 for existing controls)
- **Treatment Plans**: Risk treatment strategies with type/effect/value for residual risk calculation
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
- **Phase 2**: Enhanced Risk Assessment (7-step workflow)
  - Step 1: Assets - Identify and categorize protected assets (✅ COMPLETE)
  - Step 2: Risk Scenarios - Define threat scenarios with inherent risk (✅ COMPLETE)
  - Step 3: Vulnerabilities & Controls - Identify vulnerabilities, add existing/proposed controls with effectiveness ratings (✅ COMPLETE)
  - Step 4: Prioritize Risks - Consolidated decision table with Inherent/Current/Change/Decision columns (✅ COMPLETE)
  - Step 5: Treatment Planning - Define treatment type/effect/value for residual risk calculation (✅ COMPLETE)
  - Step 6: Executive Summary - Metrics cards, decision pie chart, risk level bar chart (5 levels × 3 types), risk register table (✅ COMPLETE)
  - Step 7: Review & Submit - Final review and submission
- **Phase 3**: AI Analysis - Automated risk scoring and insights
- **Phase 4**: Report Generation - Multiple format outputs (PDF, DOCX, HTML)

### Triple Risk Calculation Model
- **Inherent Risk**: Base risk level (Likelihood × Impact) before any controls
- **Current Risk**: Risk after applying existing controls with effectiveness ratings (1-5 scale)
- **Residual Risk**: Risk after implementing proposed treatments (reduction in Likelihood or Impact)

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

## Recent Changes (October 2025)

### Completed Features
- ✅ **Vulnerabilities & Controls (Step 3)**: Complete inline editable interface for managing vulnerabilities and controls with effectiveness ratings
  - Database schema: Added `vulnerabilities` and `controls` tables with proper relationships
  - API layer: Full CRUD endpoints for vulnerabilities and controls
  - UI: Inline editing with immediate persistence, control type badges, effectiveness ratings (1-5)
  - Z-index fix: Applied to main content area to prevent sidebar overlay interference

- ✅ **Prioritize Risks (Step 4)**: Consolidated decision table with Current Risk calculation
  - Current Risk calculation: Reduces inherent risk based on control effectiveness (1-5 scale)
  - Decision table: Shows Inherent, Current, Change %, and Decision columns
  - Decision dropdown: Accept, Transfer, Remediate, Undecided options
  - Summary metrics: Displays count of each decision type

- ✅ **Treatment Planning (Step 5)**: Risk treatment with Type/Effect/Value for Residual Risk
  - Treatment Type: Likelihood or Impact reduction
  - Effect: Reduction amount (1-5 scale)
  - Value: Treatment investment/effort
  - Residual Risk: Calculated based on treatment parameters
  - Filtering: Only shows "remediate" scenarios

- ✅ **Executive Summary (Step 6)**: Complete visualization dashboard with charts and metrics
  - Metrics Cards: Total scenarios, accepted, transferred, remediated counts
  - Decision Pie Chart: Accept/Transfer/Remediate distribution using Recharts
  - Risk Level Bar Chart: All 5 levels (Very Low to Critical) × 3 risk types (Inherent/Current/Residual)
  - Risk Register Table: Complete scenario list with full risk progression
  - Color coding: Inherent (red), Current (orange), Residual (green)

### Known Issues
- **Phase 1 Facility Survey**: Combobox popover interference and progress counter desync issues prevent reliable completion in automated testing
  - Combobox popovers can block the "Save Progress" button (z-index/overlay handling)
  - Progress counter doesn't always update correctly after successful saves
  - "Next Category" navigation can timeout due to element interception

### Architecture Notes
- Main content area uses `relative z-10` and header uses `relative z-20` for proper layering above sidebar overlay
- EnhancedRiskAssessment is rendered via AssessmentForm when `phase="risk-assessment"`
- Phase 2 tab is disabled until `facilitySurveyCompleted=true`