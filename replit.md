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
- ✅ **Floating Point Compound Risk Reduction System (October 3, 2025)**: Accurate risk reduction calculations with mathematical precision
  - **Compound Reduction Model**: Implements diminishing returns with 10% reduction per effectiveness point
  - **Mathematical Accuracy**: Single effectiveness-3 control = 27.1% reduction (5 × 0.9³ = 3.645)
  - **Multiple Controls**: Three effectiveness-5 controls = 79.4% reduction (5 → 2.95 → 1.74 → 1.03)
  - **Floating Point Precision**: All calculations use floats throughout chain, no premature rounding
  - **Display Precision**: Percentages shown with one decimal place (e.g., 27.1%, 79.4%)
  - **Inline Treatment Fields**: Controls schema extended with treatmentType, primaryEffect, treatmentEffectiveness, actionDescription, responsibleParty, targetDate, estimatedCost
  - **Input Fix**: Vulnerability/control text fields use editing state tracking to prevent server data overwrites during typing
  - **Risk Types**: Separates likelihood and impact reductions for accurate compound calculations

- ✅ **Vulnerabilities & Controls (Step 3)**: Complete inline editable interface for managing vulnerabilities and controls with effectiveness ratings
  - Database schema: Added `vulnerabilities` and `controls` tables with proper relationships
  - API layer: Full CRUD endpoints for vulnerabilities and controls
  - UI: Inline editing with immediate persistence, control type badges, effectiveness ratings (1-5)
  - Z-index fix: Applied to main content area to prevent sidebar overlay interference

- ✅ **Prioritize Risks (Step 4)**: Consolidated decision table with Current Risk calculation
  - Current Risk calculation: Uses compound reduction model with floating point precision
  - Decision table: Shows Inherent, Current, Change %, and Decision columns
  - Decision dropdown: Accept, Transfer, Remediate, Undecided options
  - Summary metrics: Displays count of each decision type

- ✅ **Treatment Planning (Step 5)**: Risk treatment with inline control fields
  - Treatment fields: Type (likelihood/impact), Effect (1-5), Effectiveness (1-5)
  - Additional fields: Description, Responsible Party, Target Date, Estimated Cost
  - Residual Risk: Calculated using compound reduction on current risk values
  - Filtering: Only shows "remediate" scenarios

- ✅ **Executive Summary (Step 6)**: Complete visualization dashboard with charts and metrics
  - Metrics Cards: Total scenarios, accepted, transferred, remediated counts
  - Decision Pie Chart: Accept/Transfer/Remediate distribution using Recharts
  - Individual Risk Progression Chart: Horizontal bar chart showing each scenario's risk journey (Inherent → Current → Residual)
  - Risk Register Table: Complete scenario list with full risk progression
  - Color coding: Inherent (red #ef4444), Current (orange #f59e0b), Residual (green #22c55e)
  - Chart sorting: Scenarios ordered by inherent risk score (highest first) for priority focus

- ✅ **PDF Report Updates**: Complete alignment with UI triple risk calculations
  - Fixed likelihood/impact mappings to match UI values (very-low/low/medium/high/very-high)
  - Updated control filtering to include both vulnerability-linked and scenario-linked controls
  - Aligned risk calculation formulas: 10% reduction per effectiveness point
  - Added risk progression visualization in generated reports

- ✅ **Critical Bug Fixes (October 3, 2025)**: Fixed property naming inconsistencies
  - Fixed `control_type` → `controlType` in all UI mutations and display logic (4 instances)
  - Fixed `v.scenarioId` → `v.riskScenarioId` in vulnerability filtering
  - Result: Controls now display correct badges, effectiveness selectors appear, no 400 errors
  - Verified: End-to-end workflow tested successfully with all risk calculations working

- ✅ **End-to-End Workflow Verification**: Complete SRA workflow tested and validated
  - Phase 1 & 2 complete workflow: Assets → Scenarios → Vulnerabilities/Controls → Decisions → Treatments → Executive Summary
  - Triple risk progression verified: Inherent (16) → Current (12 with 30% reduction) → Residual (Very Low)
  - Report generation and download successful
  - No API failures, all calculations match between UI and PDF

- ✅ **Workflow UX Restructuring (October 3, 2025)**: Improved workflow clarity and user experience
  - **Step 2**: Renamed "Vulnerability Description" → "Threat Description" to eliminate confusion with Step 3 vulnerability analysis
  - **Step 3**: Removed "Proposed Control" button; now only accepts existing controls with effectiveness ratings (1-5)
  - **Step 3**: Added filtering to display only controlType='existing' controls
  - **Step 5**: Added "Proposed Controls" section for scenarios marked "remediate" with inline editing
  - **Step 5**: Proposed controls linked to riskScenarioId for treatment planning
  - **Routing Fix**: Fixed AppSidebar to use wouter Link component instead of preventDefault; added "/assessments" route
  - **Result**: Clear workflow progression - existing controls in Step 3 for current risk → proposed controls in Step 5 for residual risk

- ✅ **Focus Stability Fix (October 3, 2025)**: Eliminated focus jumping in treatment planning fields
  - **Problem**: Users experienced focus loss while typing in text fields and jumping between scenarios when adjusting sliders
  - **Root Cause**: Query invalidation after every field update caused component re-renders and DOM element recreation
  - **Solution**: Disabled query invalidation on control updates, added refetchOnWindowFocus: false, improved useEffect comparison logic
  - **Result**: Stable focus during text entry, slider adjustments, and all field edits with debounced auto-save (500ms)
  - **Testing**: End-to-end test confirmed all treatment fields maintain focus, data persists correctly

- ✅ **Chart Visualization Improvements (October 3, 2025)**: Enhanced Executive Summary with clearer risk progression display
  - **Replaced**: Risk Level Comparison bar chart (grouped by risk level) with Individual Risk Progression chart
  - **New Chart**: Horizontal bar layout showing each risk scenario's complete journey
  - **Layout**: Three bars per scenario (Inherent, Current, Residual) displayed side-by-side, not stacked
  - **Benefits**: Users can immediately see which specific scenarios have the highest risk and how controls/treatments impact each one
  - **Dynamic Height**: Chart scales based on scenario count (minimum 300px, +60px per scenario) for readability
  - **Compliance Feature**: Hidden compliance checklist report and sidebar menu item (removed from ReportGenerator and AppSidebar)
  - **Layout Fix**: Removed z-index classes from main content area that were causing content to overlap sidebar

### Known Issues
- **Phase 1 Facility Survey**: Combobox popover interference and progress counter desync issues prevent reliable completion in automated testing
  - Combobox popovers can block the "Save Progress" button (z-index/overlay handling)
  - Progress counter doesn't always update correctly after successful saves
  - "Next Category" navigation can timeout due to element interception
  - Note: Survey completes successfully in manual testing despite occasional combobox timeouts

### Minor Improvements Recommended
- Address null→undefined type warnings in EnhancedRiskAssessment for cleaner TypeScript builds
- Add aria-describedby to dialog components for improved accessibility compliance
- Enhance combobox testid stability for more reliable automated testing

### Architecture Notes
- Main content layout uses flexbox with sidebar on left, content area on right (no z-index needed)
- EnhancedRiskAssessment is rendered via AssessmentForm when `phase="risk-assessment"`
- Phase 2 tab is disabled until `facilitySurveyCompleted=true`