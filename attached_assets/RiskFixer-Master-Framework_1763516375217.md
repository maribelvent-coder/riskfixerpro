# RiskFixer Master Framework Document
## Complete AI-Assisted Development Specification

**Version:** 2.0  
**Target Platform:** Replit (Next.js + PostgreSQL)  
**Timeline:** 3-Week Sprint  
**Last Updated:** November 18, 2025

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Complete Database Schema Specifications](#2-complete-database-schema-specifications)
3. [Risk Engine Logic Specifications](#3-risk-engine-logic-specifications)
4. [Seed Data Specifications](#4-seed-data-specifications)
5. [API Routes & Endpoints](#5-api-routes--endpoints)
6. [UI/UX Component Specifications](#6-uiux-component-specifications)
7. [AI Integration Specifications](#7-ai-integration-specifications)
8. [PDF Generation Specifications](#8-pdf-generation-specifications)
9. [3-Week Implementation Roadmap](#9-3-week-implementation-roadmap)
10. [Replit Configuration Checklist](#10-replit-configuration-checklist)

---

## 1. Project Overview & Architecture

### 1.1 Product Vision

**RiskFixer** is a two-phase security risk management platform:

- **Phase 1 (MVP):** Consultant-led assessment tool with PDF report generation
- **Phase 2 (SaaS):** Client dashboard with real-time monitoring and recommendations

### 1.2 Technology Stack

```
Frontend:          Next.js 14 (App Router)
Backend:           Next.js API Routes
Database:          PostgreSQL (Replit built-in)
ORM:               Drizzle ORM
Authentication:    NextAuth.js
Styling:           Tailwind CSS + shadcn/ui
AI Services:       OpenAI GPT-4V (vision) + GPT-4 (narratives)
PDF Generation:    Puppeteer
File Storage:      Replit Storage (Phase 1) → S3 (Phase 2)
Deployment:        Replit (with Nix configuration)
```

### 1.3 Architecture Decisions

**Key Design Principles:**
1. **Build for Phase 2 from Day 1** - Multi-tenancy, RBAC, and scalable schema upfront
2. **Hybrid Risk Model** - Keep existing compound reduction model but add T×V×I formula option
3. **Template-Driven** - Pre-configured assessment templates (Executive Protection, Office Building, etc.)
4. **AI-Augmented** - Photo analysis and narrative generation throughout workflow
5. **Offline-Capable** - Support field assessments without constant connectivity

**Current System (Existing Codebase):**
- Using Drizzle ORM (NOT Prisma)
- ASIS Framework already implemented
- Compound reduction model: `remaining = remaining × (1 - effectiveness)`
- Formula: `Risk = Likelihood × Impact × (1 - Control Effectiveness)`

**New System (To Be Implemented):**
- Add T×V×I Formula: `Risk_Residual = (Threat × Vulnerability) × Impact × (1 - Control_Effectiveness)`
- Make calculation method configurable per assessment
- Preserve existing ASIS framework capabilities

### 1.4 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Next.js UI   │  │   AI Vision  │  │  PDF Preview │        │
│  │  (React)     │  │   Component  │  │   Component  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ /api/        │  │ /api/        │  │ /api/        │        │
│  │ assessments  │  │ risk-engine  │  │ ai-services  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │ /api/pdf     │  │ /api/auth    │                           │
│  └──────────────┘  └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CORE SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Risk Engine  │  │ AI Service   │  │ PDF Service  │        │
│  │   Module     │  │   Module     │  │   (Puppeteer)│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │         Drizzle ORM (PostgreSQL)                 │          │
│  │  - Organizations  - RiskScenarios                │          │
│  │  - Sites          - Controls                     │          │
│  │  - Assessments    - Photos                       │          │
│  │  - Templates      - AuditLogs                    │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  OpenAI API  │  │ Replit       │  │  Email       │        │
│  │  (GPT-4V/4)  │  │ PostgreSQL   │  │  Service     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Database Schema Specifications

### 2.1 Schema Overview

**Database:** PostgreSQL 14+  
**ORM:** Drizzle ORM  
**Migration Strategy:** Drizzle-Kit migrations in `server/db/migrations/`

### 2.2 Core Entity Relationships

```
Organization (1) ──── (M) Site
Organization (1) ──── (M) User
Site (1) ──── (M) Assessment
Assessment (1) ──── (M) RiskScenario
Assessment (1) ──── (M) Photo
RiskScenario (M) ──── (M) Control (through RiskScenarioControl junction)
Template (1) ──── (M) TemplateThreat
Template (1) ──── (M) TemplateControl
```

### 2.3 Complete Drizzle Schema

**File Location:** `server/db/schema.ts`

```typescript
// ===================================================================
// ORGANIZATIONS & MULTI-TENANCY
// ===================================================================

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  subscriptionTier: varchar('subscription_tier', { length: 50 })
    .notNull()
    .default('free'), // free, pro, enterprise
  subscriptionStatus: varchar('subscription_status', { length: 50 })
    .notNull()
    .default('active'),
  maxSites: integer('max_sites').default(5),
  maxAssessments: integer('max_assessments').default(10),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===================================================================
// USERS & AUTHENTICATION
// ===================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('consultant'),
  // Roles: admin, consultant, client_admin, client_viewer
  phoneNumber: varchar('phone_number', { length: 20 }),
  title: varchar('title', { length: 100 }),
  certifications: text('certifications'), // JSON array
  isActive: boolean('is_active').notNull().default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===================================================================
// SITES (FACILITIES)
// ===================================================================

export const sites = pgTable('sites', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  siteType: varchar('site_type', { length: 100 }).notNull(),
  // Types: office, warehouse, retail, datacenter, executive_residence, etc.
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zipCode: varchar('zip_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('USA'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  squareFootage: integer('square_footage'),
  numberOfFloors: integer('number_of_floors'),
  numberOfEmployees: integer('number_of_employees'),
  operatingHours: varchar('operating_hours', { length: 100 }),
  primaryContact: varchar('primary_contact', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===================================================================
// ASSESSMENTS
// ===================================================================

export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id')
    .references(() => sites.id, { onDelete: 'cascade' })
    .notNull(),
  templateId: integer('template_id')
    .references(() => templates.id, { onDelete: 'set null' }),
  assessorId: integer('assessor_id')
    .references(() => users.id, { onDelete: 'set null' }),
  assessmentNumber: varchar('assessment_number', { length: 50 })
    .notNull()
    .unique(),
  // Format: ASS-2025-001
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  // Status: draft, in_progress, completed, archived
  assessmentDate: date('assessment_date').notNull(),
  completionDate: date('completion_date'),
  
  // Risk Calculation Method
  calculationMethod: varchar('calculation_method', { length: 50 })
    .notNull()
    .default('compound'), // compound, tvi, custom
  
  // Assessment Metadata
  purpose: text('purpose'),
  scope: text('scope'),
  executiveSummary: text('executive_summary'),
  keyFindings: text('key_findings'), // JSON array
  recommendations: text('recommendations'), // JSON array
  
  // Scores & Analytics
  overallRiskScore: doublePrecision('overall_risk_score'),
  highRiskCount: integer('high_risk_count').default(0),
  mediumRiskCount: integer('medium_risk_count').default(0),
  lowRiskCount: integer('low_risk_count').default(0),
  
  // PDF Report
  pdfUrl: text('pdf_url'),
  pdfGeneratedAt: timestamp('pdf_generated_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===================================================================
// RISK SCENARIOS (Individual Risk Instances)
// ===================================================================

export const riskScenarios = pgTable('risk_scenarios', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  threatId: integer('threat_id')
    .references(() => threats.id, { onDelete: 'restrict' })
    .notNull(),
  assetId: integer('asset_id')
    .references(() => assets.id, { onDelete: 'restrict' }),
  zoneId: integer('zone_id')
    .references(() => facilityZones.id, { onDelete: 'set null' }),
  
  // T×V×I Inputs (New Model)
  threatLikelihood: integer('threat_likelihood'), // 1-5
  vulnerability: integer('vulnerability'), // 1-5
  impact: integer('impact'), // 1-5
  
  // Legacy Compound Model Inputs (Preserve for existing data)
  likelihood: integer('likelihood'), // 1-5
  impactLegacy: integer('impact_legacy'), // 1-5
  
  // Calculated Risk Scores
  inherentRisk: doublePrecision('inherent_risk').notNull(),
  residualRisk: doublePrecision('residual_risk').notNull(),
  controlEffectiveness: doublePrecision('control_effectiveness')
    .notNull()
    .default(0),
  
  // Risk Classification
  riskLevel: varchar('risk_level', { length: 20 }).notNull(),
  // Levels: critical, high, medium, low, negligible
  
  // Contextual Information
  scenarioDescription: text('scenario_description'),
  evidenceNotes: text('evidence_notes'),
  mitigationPriority: integer('mitigation_priority'), // 1-5
  estimatedCostToMitigate: doublePrecision('estimated_cost_to_mitigate'),
  
  // AI-Generated Content
  aiNarrative: text('ai_narrative'),
  aiRecommendations: text('ai_recommendations'), // JSON array
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===================================================================
// THREATS LIBRARY
// ===================================================================

export const threats = pgTable('threats', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  // Categories: physical_intrusion, theft, vandalism, workplace_violence,
  //             natural_disaster, cyber_physical, terrorism, espionage
  subcategory: varchar('subcategory', { length: 100 }),
  description: text('description').notNull(),
  typicalLikelihood: integer('typical_likelihood'), // Default 1-5
  typicalImpact: integer('typical_impact'), // Default 1-5
  asisCode: varchar('asis_code', { length: 50 }), // ASIS PSC.1-2012 mapping
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// CONTROLS LIBRARY
// ===================================================================

export const controls = pgTable('controls', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  // Categories: access_control, surveillance, intrusion_detection,
  //             procedural, personnel, environmental, cyber_physical
  controlType: varchar('control_type', { length: 50 }).notNull(),
  // Types: preventive, detective, deterrent, corrective, compensating
  description: text('description').notNull(),
  
  // Weight/Effectiveness Values
  baseWeight: doublePrecision('base_weight').notNull(),
  // For T×V×I model: 0.05 to 0.30
  reductionPercentage: doublePrecision('reduction_percentage').notNull(),
  // For compound model: 0.10 to 0.50
  
  // Implementation Guidance
  implementationNotes: text('implementation_notes'),
  estimatedCost: varchar('estimated_cost', { length: 50 }),
  // Cost ranges: low (<$1K), medium ($1K-$10K), high (>$10K)
  maintenanceLevel: varchar('maintenance_level', { length: 50 }),
  // low, medium, high
  
  // Effectiveness Modifiers
  requiresTraining: boolean('requires_training').default(false),
  requiresMaintenance: boolean('requires_maintenance').default(false),
  
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// JUNCTION TABLE: RISK SCENARIOS ←→ CONTROLS
// ===================================================================

export const riskScenarioControls = pgTable('risk_scenario_controls', {
  id: serial('id').primaryKey(),
  riskScenarioId: integer('risk_scenario_id')
    .references(() => riskScenarios.id, { onDelete: 'cascade' })
    .notNull(),
  controlId: integer('control_id')
    .references(() => controls.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Implementation Status
  isImplemented: boolean('is_implemented').notNull().default(false),
  implementationFidelity: doublePrecision('implementation_fidelity')
    .notNull()
    .default(1.0), // 0.0 to 1.0 (how well implemented)
  
  // Observations
  observedCondition: varchar('observed_condition', { length: 50 }),
  // Conditions: excellent, good, fair, poor, not_present
  notes: text('notes'),
  photoIds: text('photo_ids'), // JSON array of photo IDs
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// ASSETS (Protected Items/Areas)
// ===================================================================

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id')
    .references(() => sites.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  assetType: varchar('asset_type', { length: 100 }).notNull(),
  // Types: building, room, equipment, data, personnel, vehicle, etc.
  description: text('description'),
  value: doublePrecision('value'), // Monetary or criticality value
  criticalityLevel: integer('criticality_level'), // 1-5
  location: varchar('location', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// FACILITY ZONES (Spatial Organization)
// ===================================================================

export const facilityZones = pgTable('facility_zones', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id')
    .references(() => sites.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  zoneType: varchar('zone_type', { length: 100 }).notNull(),
  // Types: perimeter, lobby, office_area, server_room, parking, etc.
  floorNumber: integer('floor_number'),
  securityLevel: varchar('security_level', { length: 50 }),
  // Levels: public, restricted, controlled, high_security
  description: text('description'),
  accessRequirements: text('access_requirements'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// PHOTOS & EVIDENCE
// ===================================================================

export const photos = pgTable('photos', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  riskScenarioId: integer('risk_scenario_id')
    .references(() => riskScenarios.id, { onDelete: 'set null' }),
  zoneId: integer('zone_id')
    .references(() => facilityZones.id, { onDelete: 'set null' }),
  
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // bytes
  mimeType: varchar('mime_type', { length: 100 }),
  
  // Photo Metadata
  caption: text('caption'),
  tags: text('tags'), // JSON array
  gpsLatitude: doublePrecision('gps_latitude'),
  gpsLongitude: doublePrecision('gps_longitude'),
  takenAt: timestamp('taken_at'),
  
  // AI Analysis Results
  aiAnalysis: text('ai_analysis'), // JSON object
  aiDetectedObjects: text('ai_detected_objects'), // JSON array
  aiSecurityObservations: text('ai_security_observations'),
  
  uploadedBy: integer('uploaded_by')
    .references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// TEMPLATES (Pre-configured Assessment Types)
// ===================================================================

export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  templateType: varchar('template_type', { length: 100 }).notNull(),
  // Types: executive_protection, office_building, retail_store,
  //        warehouse, datacenter, event_security
  description: text('description'),
  siteTypeRecommendation: varchar('site_type_recommendation', { length: 100 }),
  calculationMethod: varchar('calculation_method', { length: 50 })
    .notNull()
    .default('compound'),
  isPublic: boolean('is_public').notNull().default(true),
  createdBy: integer('created_by')
    .references(() => users.id, { onDelete: 'set null' }),
  useCount: integer('use_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const templateThreats = pgTable('template_threats', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id')
    .references(() => templates.id, { onDelete: 'cascade' })
    .notNull(),
  threatId: integer('threat_id')
    .references(() => threats.id, { onDelete: 'cascade' })
    .notNull(),
  isDefault: boolean('is_default').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
});

export const templateControls = pgTable('template_controls', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id')
    .references(() => templates.id, { onDelete: 'cascade' })
    .notNull(),
  controlId: integer('control_id')
    .references(() => controls.id, { onDelete: 'cascade' })
    .notNull(),
  isRecommended: boolean('is_recommended').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
});

// ===================================================================
// FACILITY SURVEYS (Interview/Observation Data)
// ===================================================================

export const facilitySurveys = pgTable('facility_surveys', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  surveyType: varchar('survey_type', { length: 100 }).notNull(),
  // Types: security_staff_interview, management_interview,
  //        facility_walkthrough, document_review
  conductedBy: integer('conducted_by')
    .references(() => users.id, { onDelete: 'set null' }),
  conductedDate: date('conducted_date').notNull(),
  intervieweeRole: varchar('interviewee_role', { length: 100 }),
  
  // Survey Responses (JSON format)
  responses: text('responses').notNull(), // JSON object
  
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// AUDIT LOGS (Compliance & Tracking)
// ===================================================================

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  // Actions: create, update, delete, view, export, login, etc.
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  // Entity types: assessment, risk_scenario, photo, user, etc.
  entityId: integer('entity_id'),
  changes: text('changes'), // JSON object showing before/after
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 2.4 Indexes for Performance

```typescript
// Add to schema.ts
import { index } from 'drizzle-orm/pg-core';

// Organizations indexes
index('idx_organizations_slug').on(organizations.slug);

// Users indexes
index('idx_users_email').on(users.email);
index('idx_users_organization').on(users.organizationId);

// Sites indexes
index('idx_sites_organization').on(sites.organizationId);
index('idx_sites_type').on(sites.siteType);

// Assessments indexes
index('idx_assessments_site').on(assessments.siteId);
index('idx_assessments_status').on(assessments.status);
index('idx_assessments_date').on(assessments.assessmentDate);

// Risk Scenarios indexes
index('idx_risk_scenarios_assessment').on(riskScenarios.assessmentId);
index('idx_risk_scenarios_threat').on(riskScenarios.threatId);
index('idx_risk_scenarios_level').on(riskScenarios.riskLevel);

// Photos indexes
index('idx_photos_assessment').on(photos.assessmentId);
index('idx_photos_risk_scenario').on(photos.riskScenarioId);

// Audit Logs indexes (composite)
index('idx_audit_logs_org_created').on(auditLogs.organizationId, auditLogs.createdAt);
```

---

## 3. Risk Engine Logic Specifications

### 3.1 Risk Calculation Methods

**RiskFixer supports TWO calculation methods:**

#### **Method 1: Compound Reduction Model (Existing/Legacy)**

```
Inherent Risk = Likelihood × Impact

For each control applied:
  Remaining Risk = Remaining Risk × (1 - Control Reduction %)

Residual Risk = Final Remaining Risk
Control Effectiveness = 1 - (Residual Risk / Inherent Risk)
```

**Example:**
- Likelihood: 4, Impact: 5 → Inherent Risk = 20
- Control 1 (10% reduction): 20 × (1 - 0.10) = 18
- Control 2 (15% reduction): 18 × (1 - 0.15) = 15.3
- Control 3 (20% reduction): 15.3 × (1 - 0.20) = 12.24
- Residual Risk = 12.24
- Control Effectiveness = 1 - (12.24 / 20) = 0.388 (38.8%)

#### **Method 2: T×V×I Model (New Standard)**

```
Inherent Risk = Threat Likelihood × Vulnerability × Impact

Control Effectiveness (C_e) = Σ(W_control × F_control)
  Where:
    W_control = Base weight of control (0.05 to 0.30)
    F_control = Implementation fidelity (0.0 to 1.0)
  
  C_e is capped at 0.95 (never 100% effective)

Residual Risk = Inherent Risk × (1 - C_e)
```

**Example:**
- Threat Likelihood: 4, Vulnerability: 5, Impact: 5 → Inherent Risk = 100
- Control 1 (W=0.15, F=1.0): 0.15 × 1.0 = 0.15
- Control 2 (W=0.20, F=0.8): 0.20 × 0.8 = 0.16
- Control 3 (W=0.10, F=1.0): 0.10 × 1.0 = 0.10
- Total C_e = 0.15 + 0.16 + 0.10 = 0.41 (41%)
- Residual Risk = 100 × (1 - 0.41) = 59

### 3.2 Risk Scoring Matrices

#### **Threat Likelihood (T) - 5×5 Matrix**

```
Value | Description              | Frequency
------|--------------------------|---------------------------
  5   | Almost Certain          | Multiple times per year
  4   | Likely                  | Once per year
  3   | Possible                | Once every 1-3 years
  2   | Unlikely                | Once every 3-10 years
  1   | Rare                    | Once every 10+ years
```

#### **Vulnerability (V) - 5×5 Matrix**

```
Value | Description              | Control State
------|--------------------------|---------------------------
  5   | Highly Vulnerable       | No controls present
  4   | Vulnerable              | Minimal/ineffective controls
  3   | Moderately Vulnerable   | Some controls but gaps exist
  2   | Low Vulnerability       | Good controls with minor gaps
  1   | Minimal Vulnerability   | Comprehensive controls in place
```

#### **Impact (I) - 5×5 Matrix**

```
Value | Description    | Financial Loss | Injuries/Deaths | Operational Impact
------|----------------|----------------|-----------------|--------------------
  5   | Catastrophic   | >$10M          | Multiple deaths | Business closure
  4   | Critical       | $1M - $10M     | 1+ deaths       | Major shutdown (weeks)
  3   | Significant    | $100K - $1M    | Major injuries  | Partial shutdown (days)
  2   | Moderate       | $10K - $100K   | Minor injuries  | Minor disruption (hours)
  1   | Negligible     | <$10K          | No injuries     | No operational impact
```

### 3.3 Risk Level Classification

```
Risk Score Range | Level      | Color  | Action Required
-----------------|------------|--------|----------------------------------
  76-125         | Critical   | Red    | Immediate action within 24-48 hrs
  51-75          | High       | Orange | Action required within 1 week
  26-50          | Medium     | Yellow | Action required within 1 month
  11-25          | Low        | Blue   | Monitor and review quarterly
  1-10           | Negligible | Green  | Accept risk, document only
```

### 3.4 Control Weight Reference Table

**For T×V×I Model:**

```
Control Category          | Control Type      | Base Weight (W)
--------------------------|-------------------|------------------
Access Control            | Preventive        | 0.20 - 0.30
Surveillance (CCTV)       | Detective         | 0.15 - 0.25
Intrusion Detection       | Detective         | 0.15 - 0.25
Physical Barriers         | Preventive        | 0.20 - 0.30
Security Personnel        | Preventive        | 0.25 - 0.30
Procedural Controls       | Preventive        | 0.10 - 0.15
Environmental Design      | Deterrent         | 0.10 - 0.15
Cyber-Physical Security   | Preventive        | 0.15 - 0.25
```

**Implementation Fidelity (F) Factors:**

```
F Value | Condition Description
--------|--------------------------------------------------------
  1.0   | Excellent - Fully implemented, well-maintained, tested
  0.8   | Good - Fully implemented, some maintenance needs
  0.6   | Fair - Partially implemented or poorly maintained
  0.4   | Poor - Barely functional, significant gaps
  0.2   | Minimal - Nominally present but ineffective
  0.0   | Not Present - Control does not exist
```

### 3.5 Risk Engine Module Structure

**File Location:** `server/services/risk-engine.ts`

```typescript
// ===================================================================
// RISK ENGINE MODULE
// ===================================================================

export type CalculationMethod = 'compound' | 'tvi' | 'custom';

export interface ThreatInput {
  likelihood: number; // 1-5
  vulnerability?: number; // 1-5 (only for TVI)
  impact: number; // 1-5
}

export interface ControlInput {
  id: number;
  baseWeight?: number; // For TVI model
  reductionPercentage?: number; // For compound model
  implementationFidelity: number; // 0.0 - 1.0
  isImplemented: boolean;
}

export interface RiskCalculationResult {
  inherentRisk: number;
  residualRisk: number;
  controlEffectiveness: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'negligible';
  calculationMethod: CalculationMethod;
  breakdown?: {
    totalControlWeight?: number;
    appliedControls?: Array<{
      controlId: number;
      contribution: number;
    }>;
  };
}

// ===================================================================
// COMPOUND REDUCTION MODEL
// ===================================================================

export function calculateRiskCompound(
  threat: ThreatInput,
  controls: ControlInput[]
): RiskCalculationResult {
  // Step 1: Calculate inherent risk
  const inherentRisk = threat.likelihood * threat.impact;
  
  // Step 2: Apply each control sequentially
  let remainingRisk = inherentRisk;
  
  const implementedControls = controls.filter(c => c.isImplemented);
  
  for (const control of implementedControls) {
    const effectiveReduction = 
      (control.reductionPercentage || 0) * control.implementationFidelity;
    remainingRisk = remainingRisk * (1 - effectiveReduction);
  }
  
  // Step 3: Calculate control effectiveness
  const controlEffectiveness = inherentRisk > 0 
    ? 1 - (remainingRisk / inherentRisk)
    : 0;
  
  // Step 4: Classify risk level
  const riskLevel = classifyRiskLevel(remainingRisk);
  
  return {
    inherentRisk,
    residualRisk: remainingRisk,
    controlEffectiveness,
    riskLevel,
    calculationMethod: 'compound',
  };
}

// ===================================================================
// T×V×I MODEL
// ===================================================================

export function calculateRiskTVI(
  threat: ThreatInput,
  controls: ControlInput[]
): RiskCalculationResult {
  // Validate inputs
  if (!threat.vulnerability) {
    throw new Error('Vulnerability score required for T×V×I calculation');
  }
  
  // Step 1: Calculate inherent risk
  const inherentRisk = 
    threat.likelihood * threat.vulnerability * threat.impact;
  
  // Step 2: Calculate total control effectiveness
  let totalControlWeight = 0;
  const appliedControls: Array<{ controlId: number; contribution: number }> = [];
  
  const implementedControls = controls.filter(c => c.isImplemented);
  
  for (const control of implementedControls) {
    const contribution = 
      (control.baseWeight || 0) * control.implementationFidelity;
    totalControlWeight += contribution;
    appliedControls.push({
      controlId: control.id,
      contribution,
    });
  }
  
  // Cap control effectiveness at 0.95 (95%)
  const controlEffectiveness = Math.min(totalControlWeight, 0.95);
  
  // Step 3: Calculate residual risk
  const residualRisk = inherentRisk * (1 - controlEffectiveness);
  
  // Step 4: Classify risk level
  const riskLevel = classifyRiskLevel(residualRisk);
  
  return {
    inherentRisk,
    residualRisk,
    controlEffectiveness,
    riskLevel,
    calculationMethod: 'tvi',
    breakdown: {
      totalControlWeight,
      appliedControls,
    },
  };
}

// ===================================================================
// RISK LEVEL CLASSIFICATION
// ===================================================================

export function classifyRiskLevel(
  riskScore: number
): 'critical' | 'high' | 'medium' | 'low' | 'negligible' {
  if (riskScore >= 76) return 'critical';
  if (riskScore >= 51) return 'high';
  if (riskScore >= 26) return 'medium';
  if (riskScore >= 11) return 'low';
  return 'negligible';
}

// ===================================================================
// ASSESSMENT-LEVEL RISK AGGREGATION
// ===================================================================

export interface AssessmentRiskSummary {
  overallRiskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  negligibleCount: number;
  averageControlEffectiveness: number;
}

export function aggregateAssessmentRisk(
  riskScenarios: RiskCalculationResult[]
): AssessmentRiskSummary {
  const summary: AssessmentRiskSummary = {
    overallRiskScore: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    negligibleCount: 0,
    averageControlEffectiveness: 0,
  };
  
  if (riskScenarios.length === 0) return summary;
  
  // Count risk levels
  for (const scenario of riskScenarios) {
    switch (scenario.riskLevel) {
      case 'critical':
        summary.criticalCount++;
        break;
      case 'high':
        summary.highCount++;
        break;
      case 'medium':
        summary.mediumCount++;
        break;
      case 'low':
        summary.lowCount++;
        break;
      case 'negligible':
        summary.negligibleCount++;
        break;
    }
  }
  
  // Calculate weighted overall risk score
  // Critical risks have 5x weight, high 3x, medium 2x
  const weightedSum = 
    summary.criticalCount * 5 +
    summary.highCount * 3 +
    summary.mediumCount * 2 +
    summary.lowCount * 1 +
    summary.negligibleCount * 0.5;
  
  summary.overallRiskScore = 
    weightedSum / riskScenarios.length;
  
  // Calculate average control effectiveness
  const totalEffectiveness = riskScenarios.reduce(
    (sum, scenario) => sum + scenario.controlEffectiveness,
    0
  );
  summary.averageControlEffectiveness = 
    totalEffectiveness / riskScenarios.length;
  
  return summary;
}
```

---

## 4. Seed Data Specifications

### 4.1 Threat Library (15-20 Threats)

**File Location:** `server/db/seed-data/threats.ts`

```typescript
export const seedThreats = [
  // ===== PHYSICAL INTRUSION =====
  {
    name: 'Unauthorized Entry - Forced Entry',
    category: 'physical_intrusion',
    subcategory: 'forced_entry',
    description: 'Attacker forces entry through doors, windows, or barriers using physical force or tools.',
    typicalLikelihood: 3,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-INT-001',
  },
  {
    name: 'Unauthorized Entry - Tailgating',
    category: 'physical_intrusion',
    subcategory: 'social_engineering',
    description: 'Unauthorized person follows authorized person through access-controlled entry.',
    typicalLikelihood: 4,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-INT-002',
  },
  {
    name: 'Unauthorized Entry - Piggybacking',
    category: 'physical_intrusion',
    subcategory: 'social_engineering',
    description: 'Unauthorized person gains entry with explicit or implicit permission of authorized person.',
    typicalLikelihood: 4,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-INT-003',
  },
  
  // ===== THEFT =====
  {
    name: 'Theft - Property/Equipment',
    category: 'theft',
    subcategory: 'property_theft',
    description: 'Theft of company property, equipment, inventory, or assets.',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-001',
  },
  {
    name: 'Theft - Intellectual Property',
    category: 'theft',
    subcategory: 'data_theft',
    description: 'Unauthorized copying or theft of proprietary information, trade secrets, or confidential data.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-THF-002',
  },
  
  // ===== VANDALISM & SABOTAGE =====
  {
    name: 'Vandalism - Property Damage',
    category: 'vandalism',
    subcategory: 'property_damage',
    description: 'Intentional damage to building, equipment, or property.',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-VAN-001',
  },
  {
    name: 'Sabotage - Operational Disruption',
    category: 'sabotage',
    subcategory: 'operational',
    description: 'Deliberate action to disrupt operations, damage equipment, or compromise systems.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-SAB-001',
  },
  
  // ===== WORKPLACE VIOLENCE =====
  {
    name: 'Workplace Violence - Active Threat',
    category: 'workplace_violence',
    subcategory: 'active_shooter',
    description: 'Active threat situation including armed intruder or active shooter scenario.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-WPV-001',
  },
  {
    name: 'Workplace Violence - Employee Conflict',
    category: 'workplace_violence',
    subcategory: 'interpersonal',
    description: 'Physical altercation or threat between employees or with supervisors.',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-WPV-002',
  },
  {
    name: 'Workplace Violence - Domestic Violence Spillover',
    category: 'workplace_violence',
    subcategory: 'external_threat',
    description: 'Domestic violence situation involving employee extends into workplace.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-WPV-003',
  },
  
  // ===== NATURAL DISASTERS =====
  {
    name: 'Natural Disaster - Earthquake',
    category: 'natural_disaster',
    subcategory: 'seismic',
    description: 'Structural damage and operational disruption from earthquake event.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-NAT-001',
  },
  {
    name: 'Natural Disaster - Flood',
    category: 'natural_disaster',
    subcategory: 'weather',
    description: 'Water damage to facility and equipment from flooding event.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-NAT-002',
  },
  {
    name: 'Natural Disaster - Wildfire',
    category: 'natural_disaster',
    subcategory: 'fire',
    description: 'Threat to facility from wildfire in surrounding area.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-NAT-003',
  },
  
  // ===== EXECUTIVE PROTECTION =====
  {
    name: 'Executive Threat - Kidnapping',
    category: 'executive_protection',
    subcategory: 'kidnapping',
    description: 'Targeted kidnapping or abduction of executive or high-value personnel.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-EXE-001',
  },
  {
    name: 'Executive Threat - Assassination/Assault',
    category: 'executive_protection',
    subcategory: 'physical_harm',
    description: 'Targeted physical attack on executive or high-value personnel.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-EXE-002',
  },
  
  // ===== CYBER-PHYSICAL =====
  {
    name: 'Cyber-Physical - Access Control Hack',
    category: 'cyber_physical',
    subcategory: 'access_system',
    description: 'Compromise of electronic access control system to gain unauthorized entry.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-CYB-001',
  },
  {
    name: 'Cyber-Physical - CCTV System Compromise',
    category: 'cyber_physical',
    subcategory: 'surveillance',
    description: 'Hacking or disabling of CCTV surveillance system.',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-CYB-002',
  },
  
  // ===== TERRORISM & ESPIONAGE =====
  {
    name: 'Terrorism - Bomb Threat/IED',
    category: 'terrorism',
    subcategory: 'explosive',
    description: 'Threat of explosive device placed at or near facility.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-TER-001',
  },
  {
    name: 'Espionage - Technical Surveillance',
    category: 'espionage',
    subcategory: 'surveillance',
    description: 'Placement of listening devices or hidden cameras for intelligence gathering.',
    typicalLikelihood: 1,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-ESP-001',
  },
];
```

### 4.2 Control Library (50-80 Controls)

**File Location:** `server/db/seed-data/controls.ts`

```typescript
export const seedControls = [
  // ===== ACCESS CONTROL =====
  {
    name: 'Electronic Access Control System (Badge/Card)',
    category: 'access_control',
    controlType: 'preventive',
    description: 'Proximity card or badge reader system controlling door access with audit logging.',
    baseWeight: 0.25,
    reductionPercentage: 0.30,
    implementationNotes: 'Requires badge provisioning system, regular audits of access rights.',
    estimatedCost: 'medium',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'Biometric Access Control (Fingerprint/Facial Recognition)',
    category: 'access_control',
    controlType: 'preventive',
    description: 'Biometric authentication for high-security areas.',
    baseWeight: 0.30,
    reductionPercentage: 0.40,
    implementationNotes: 'Higher security than card access, requires enrollment process.',
    estimatedCost: 'high',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'Security Guard - Reception/Lobby',
    category: 'access_control',
    controlType: 'preventive',
    description: 'Staffed security desk at main entrance with visitor management.',
    baseWeight: 0.28,
    reductionPercentage: 0.35,
    implementationNotes: '24/7 coverage recommended for high-security facilities.',
    estimatedCost: 'high',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Visitor Management System',
    category: 'access_control',
    controlType: 'preventive',
    description: 'Digital system for visitor check-in, badge issuance, and host notification.',
    baseWeight: 0.15,
    reductionPercentage: 0.20,
    implementationNotes: 'Integrates with access control, maintains visitor logs.',
    estimatedCost: 'medium',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Turnstiles/Speed Gates',
    category: 'access_control',
    controlType: 'preventive',
    description: 'Physical barriers preventing tailgating at entry points.',
    baseWeight: 0.22,
    reductionPercentage: 0.30,
    implementationNotes: 'Must integrate with access control system, requires maintenance.',
    estimatedCost: 'high',
    maintenanceLevel: 'medium',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  {
    name: 'Man Trap/Security Vestibule',
    category: 'access_control',
    controlType: 'preventive',
    description: 'Double-door system preventing tailgating with controlled passage.',
    baseWeight: 0.30,
    reductionPercentage: 0.45,
    implementationNotes: 'Highest effectiveness against tailgating, requires space.',
    estimatedCost: 'high',
    maintenanceLevel: 'medium',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  
  // ===== SURVEILLANCE =====
  {
    name: 'CCTV Cameras - Fixed (Indoor)',
    category: 'surveillance',
    controlType: 'detective',
    description: 'Fixed-position cameras covering interior spaces with continuous recording.',
    baseWeight: 0.18,
    reductionPercentage: 0.20,
    implementationNotes: 'Minimum 30-day retention, adequate lighting required.',
    estimatedCost: 'medium',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'CCTV Cameras - PTZ (Pan-Tilt-Zoom)',
    category: 'surveillance',
    controlType: 'detective',
    description: 'Motorized cameras with remote control for active monitoring.',
    baseWeight: 0.20,
    reductionPercentage: 0.25,
    implementationNotes: 'Requires security staff for active monitoring.',
    estimatedCost: 'medium',
    maintenanceLevel: 'high',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'CCTV Cameras - Outdoor (Weather-Resistant)',
    category: 'surveillance',
    controlType: 'detective',
    description: 'Weatherproof cameras for perimeter and outdoor area monitoring.',
    baseWeight: 0.18,
    reductionPercentage: 0.20,
    implementationNotes: 'IR night vision recommended, requires weather housing.',
    estimatedCost: 'medium',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'CCTV Monitoring - 24/7 Staffed',
    category: 'surveillance',
    controlType: 'detective',
    description: 'Dedicated security personnel monitoring cameras in real-time.',
    baseWeight: 0.25,
    reductionPercentage: 0.35,
    implementationNotes: 'Significantly increases camera effectiveness, requires training.',
    estimatedCost: 'high',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Video Analytics (Motion Detection/Object Recognition)',
    category: 'surveillance',
    controlType: 'detective',
    description: 'AI-powered analytics for automated threat detection and alerting.',
    baseWeight: 0.20,
    reductionPercentage: 0.25,
    implementationNotes: 'Reduces false alarms, requires calibration.',
    estimatedCost: 'high',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  
  // ===== INTRUSION DETECTION =====
  {
    name: 'Intrusion Alarm System - Door/Window Sensors',
    category: 'intrusion_detection',
    controlType: 'detective',
    description: 'Magnetic contact sensors on doors/windows triggering alarm when opened.',
    baseWeight: 0.20,
    reductionPercentage: 0.25,
    implementationNotes: 'Covers perimeter openings, requires monitoring response.',
    estimatedCost: 'medium',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'Motion Detectors (PIR) - Interior',
    category: 'intrusion_detection',
    controlType: 'detective',
    description: 'Passive infrared sensors detecting movement in protected areas.',
    baseWeight: 0.18,
    reductionPercentage: 0.22,
    implementationNotes: 'After-hours protection, requires proper placement.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'Glass Break Sensors',
    category: 'intrusion_detection',
    controlType: 'detective',
    description: 'Acoustic sensors detecting sound frequency of breaking glass.',
    baseWeight: 0.15,
    reductionPercentage: 0.18,
    implementationNotes: 'Protects glass entry points, complements door sensors.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'Perimeter Intrusion Detection System (Fence Sensors)',
    category: 'intrusion_detection',
    controlType: 'detective',
    description: 'Sensors on perimeter fence detecting climbing or cutting attempts.',
    baseWeight: 0.22,
    reductionPercentage: 0.28,
    implementationNotes: 'Early warning system, reduces false alarms with proper calibration.',
    estimatedCost: 'high',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  {
    name: 'Monitored Alarm System (24/7 Central Station)',
    category: 'intrusion_detection',
    controlType: 'detective',
    description: 'Professional monitoring service with law enforcement dispatch capability.',
    baseWeight: 0.20,
    reductionPercentage: 0.30,
    implementationNotes: 'Requires alarm system, provides rapid response.',
    estimatedCost: 'medium',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  
  // ===== PHYSICAL BARRIERS =====
  {
    name: 'Perimeter Fence (6-8 ft Chain Link)',
    category: 'physical_barriers',
    controlType: 'preventive',
    description: 'Standard chain-link fence defining property boundary.',
    baseWeight: 0.15,
    reductionPercentage: 0.15,
    implementationNotes: 'Basic deterrent, limited delay time against determined attacker.',
    estimatedCost: 'medium',
    maintenanceLevel: 'low',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  {
    name: 'Perimeter Fence with Anti-Climb Features',
    category: 'physical_barriers',
    controlType: 'preventive',
    description: 'Fence with barbed wire, razor wire, or angled extensions.',
    baseWeight: 0.22,
    reductionPercentage: 0.25,
    implementationNotes: 'Increases delay time, may have aesthetic/regulatory concerns.',
    estimatedCost: 'medium',
    maintenanceLevel: 'medium',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  {
    name: 'Bollards - Vehicle Barriers',
    category: 'physical_barriers',
    controlType: 'preventive',
    description: 'Fixed or retractable posts preventing vehicle access to protected areas.',
    baseWeight: 0.25,
    reductionPercentage: 0.35,
    implementationNotes: 'Essential for vehicle-borne threat protection.',
    estimatedCost: 'high',
    maintenanceLevel: 'low',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  {
    name: 'Reinforced Doors (Commercial Grade)',
    category: 'physical_barriers',
    controlType: 'preventive',
    description: 'Heavy-duty doors with reinforced frames and high-security locks.',
    baseWeight: 0.20,
    reductionPercentage: 0.25,
    implementationNotes: 'Significantly increases forced entry difficulty.',
    estimatedCost: 'medium',
    maintenanceLevel: 'low',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  {
    name: 'Ballistic-Rated Doors/Windows',
    category: 'physical_barriers',
    controlType: 'preventive',
    description: 'Bullet-resistant materials for high-threat environments.',
    baseWeight: 0.30,
    reductionPercentage: 0.45,
    implementationNotes: 'Required for executive protection, high cost.',
    estimatedCost: 'high',
    maintenanceLevel: 'low',
    requiresTraining: false,
    requiresMaintenance: false,
  },
  {
    name: 'Security Film on Windows',
    category: 'physical_barriers',
    controlType: 'preventive',
    description: 'Polyester film holding glass together when broken, delaying entry.',
    baseWeight: 0.12,
    reductionPercentage: 0.15,
    implementationNotes: 'Cost-effective alternative to replacement, degrades over time.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: false,
    requiresMaintenance: false,
  },
  {
    name: 'Safe Room / Panic Room',
    category: 'physical_barriers',
    controlType: 'preventive',
    description: 'Hardened room with communication and life support for emergency shelter.',
    baseWeight: 0.28,
    reductionPercentage: 0.40,
    implementationNotes: 'Executive protection essential, requires testing.',
    estimatedCost: 'high',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: true,
  },
  
  // ===== SECURITY PERSONNEL =====
  {
    name: 'Roving Security Patrol (Foot/Vehicle)',
    category: 'security_personnel',
    controlType: 'preventive',
    description: 'Security guards conducting random or scheduled facility patrols.',
    baseWeight: 0.25,
    reductionPercentage: 0.30,
    implementationNotes: 'Provides deterrence and rapid response, requires tour tracking.',
    estimatedCost: 'high',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Armed Security Personnel',
    category: 'security_personnel',
    controlType: 'preventive',
    description: 'Armed guards for high-threat environments or executive protection.',
    baseWeight: 0.30,
    reductionPercentage: 0.40,
    implementationNotes: 'Requires licensing, extensive training, and insurance.',
    estimatedCost: 'high',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Executive Protection Detail (Close Protection)',
    category: 'security_personnel',
    controlType: 'preventive',
    description: 'Dedicated security personnel providing close protection to executives.',
    baseWeight: 0.30,
    reductionPercentage: 0.45,
    implementationNotes: 'Specialized training required, advance work essential.',
    estimatedCost: 'high',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  
  // ===== PROCEDURAL CONTROLS =====
  {
    name: 'Visitor Access Policy (Sign-In/Escort Required)',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Written policy requiring visitor identification and escort.',
    baseWeight: 0.10,
    reductionPercentage: 0.15,
    implementationNotes: 'Effectiveness depends on consistent enforcement.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Background Checks (Pre-Employment)',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Criminal and employment history screening for new hires.',
    baseWeight: 0.12,
    reductionPercentage: 0.18,
    implementationNotes: 'Legal compliance required, reduces insider threat.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: false,
    requiresMaintenance: false,
  },
  {
    name: 'Security Awareness Training (Annual)',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Employee training on security policies, threat recognition, and response.',
    baseWeight: 0.15,
    reductionPercentage: 0.20,
    implementationNotes: 'Creates human firewall, requires regular updates.',
    estimatedCost: 'low',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Badge Display Policy (Visible ID Required)',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Policy requiring employees to visibly display ID badges.',
    baseWeight: 0.08,
    reductionPercentage: 0.10,
    implementationNotes: 'Enables visual identification of unauthorized persons.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Clean Desk Policy',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Policy requiring confidential materials to be secured when unattended.',
    baseWeight: 0.08,
    reductionPercentage: 0.12,
    implementationNotes: 'Reduces data theft risk, requires cultural buy-in.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Emergency Response Plan (Written & Practiced)',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Documented procedures for security incidents with regular drills.',
    baseWeight: 0.18,
    reductionPercentage: 0.25,
    implementationNotes: 'Critical for life safety, must be tested quarterly.',
    estimatedCost: 'low',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Active Threat Response Training (Run-Hide-Fight)',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Employee training on active shooter/threat response protocols.',
    baseWeight: 0.15,
    reductionPercentage: 0.22,
    implementationNotes: 'Can save lives, must include drills and evacuation routes.',
    estimatedCost: 'low',
    maintenanceLevel: 'medium',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Access Control Audit (Quarterly)',
    category: 'procedural',
    controlType: 'detective',
    description: 'Regular review of access rights, badge status, and system logs.',
    baseWeight: 0.10,
    reductionPercentage: 0.15,
    implementationNotes: 'Identifies access creep and terminated employee issues.',
    estimatedCost: 'low',
    maintenanceLevel: 'medium',
    requiresTraining: false,
    requiresMaintenance: false,
  },
  
  // ===== ENVIRONMENTAL DESIGN =====
  {
    name: 'CPTED Principles Applied (Crime Prevention Through Environmental Design)',
    category: 'environmental_design',
    controlType: 'deterrent',
    description: 'Design elements promoting natural surveillance and territorial reinforcement.',
    baseWeight: 0.12,
    reductionPercentage: 0.15,
    implementationNotes: 'Includes landscaping, lighting, and sightlines.',
    estimatedCost: 'medium',
    maintenanceLevel: 'low',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  {
    name: 'Exterior Lighting (Perimeter & Parking)',
    category: 'environmental_design',
    controlType: 'deterrent',
    description: 'Adequate lighting eliminating hiding spots and enabling surveillance.',
    baseWeight: 0.15,
    reductionPercentage: 0.18,
    implementationNotes: 'Minimum 1-2 foot-candles recommended, reduces liability.',
    estimatedCost: 'medium',
    maintenanceLevel: 'medium',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  {
    name: 'Clear Zone (Landscaping Setback)',
    category: 'environmental_design',
    controlType: 'deterrent',
    description: 'Vegetation kept low near building to eliminate concealment.',
    baseWeight: 0.08,
    reductionPercentage: 0.10,
    implementationNotes: '10-15 ft clear zone recommended for CCTV effectiveness.',
    estimatedCost: 'low',
    maintenanceLevel: 'high',
    requiresTraining: false,
    requiresMaintenance: true,
  },
  {
    name: 'Signage - Security Warnings',
    category: 'environmental_design',
    controlType: 'deterrent',
    description: 'Visible signs warning of surveillance, alarms, or prosecution.',
    baseWeight: 0.05,
    reductionPercentage: 0.08,
    implementationNotes: 'Psychological deterrent, legal notification in some jurisdictions.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: false,
    requiresMaintenance: false,
  },
  
  // ===== CYBER-PHYSICAL SECURITY =====
  {
    name: 'Network Segmentation (Physical Security Systems Isolated)',
    category: 'cyber_physical',
    controlType: 'preventive',
    description: 'Physical security systems on separate network from IT systems.',
    baseWeight: 0.20,
    reductionPercentage: 0.25,
    implementationNotes: 'Prevents lateral movement from IT compromise.',
    estimatedCost: 'medium',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Multi-Factor Authentication (MFA) for Security Systems',
    category: 'cyber_physical',
    controlType: 'preventive',
    description: 'MFA required for access to security system management interfaces.',
    baseWeight: 0.15,
    reductionPercentage: 0.20,
    implementationNotes: 'Prevents credential theft compromise.',
    estimatedCost: 'low',
    maintenanceLevel: 'low',
    requiresTraining: true,
    requiresMaintenance: false,
  },
  {
    name: 'Security System Patching & Updates (Regular)',
    category: 'cyber_physical',
    controlType: 'preventive',
    description: 'Timely application of vendor security patches to physical security systems.',
    baseWeight: 0.12,
    reductionPercentage: 0.15,
    implementationNotes: 'Often neglected, critical for preventing exploits.',
    estimatedCost: 'low',
    maintenanceLevel: 'high',
    requiresTraining: true,
    requiresMaintenance: false,
  },
];
```

### 4.3 Facility Zone Templates

```typescript
export const seedFacilityZones = [
  // Executive Residence Zones
  {
    name: 'Property Perimeter',
    zoneType: 'perimeter',
    securityLevel: 'restricted',
    description: 'Outer boundary of executive residence property.',
  },
  {
    name: 'Main Entrance/Gatehouse',
    zoneType: 'entry_point',
    securityLevel: 'high_security',
    description: 'Primary vehicle and pedestrian access point.',
  },
  {
    name: 'Residence Interior',
    zoneType: 'living_space',
    securityLevel: 'high_security',
    description: 'Main living areas of executive residence.',
  },
  {
    name: 'Safe Room',
    zoneType: 'hardened_space',
    securityLevel: 'high_security',
    description: 'Reinforced panic room for emergency situations.',
  },
  
  // Office Building Zones
  {
    name: 'Building Perimeter',
    zoneType: 'perimeter',
    securityLevel: 'public',
    description: 'Exterior boundary of office building.',
  },
  {
    name: 'Parking Garage',
    zoneType: 'parking',
    securityLevel: 'restricted',
    description: 'Employee and visitor parking area.',
  },
  {
    name: 'Lobby/Reception',
    zoneType: 'lobby',
    securityLevel: 'public',
    description: 'Main entrance and visitor reception area.',
  },
  {
    name: 'Office Floors (General)',
    zoneType: 'office_area',
    securityLevel: 'restricted',
    description: 'Standard office workspace requiring badge access.',
  },
  {
    name: 'Executive Suite',
    zoneType: 'office_area',
    securityLevel: 'controlled',
    description: 'C-level offices with enhanced access control.',
  },
  {
    name: 'Server Room / IT Infrastructure',
    zoneType: 'server_room',
    securityLevel: 'high_security',
    description: 'Network and server equipment room.',
  },
];
```

### 4.4 Assessment Templates

```typescript
export const seedTemplates = [
  {
    name: 'Executive Residence Security Assessment',
    templateType: 'executive_protection',
    description: 'Comprehensive security assessment for high-net-worth individual residence.',
    siteTypeRecommendation: 'executive_residence',
    calculationMethod: 'tvi',
    isPublic: true,
    // Associated threats (by ID): kidnapping, assassination, forced entry, espionage
    // Associated controls (by ID): armed security, safe room, perimeter intrusion detection, CCTV
  },
  {
    name: 'Corporate Office Building Assessment',
    templateType: 'office_building',
    description: 'Standard office building physical security assessment.',
    siteTypeRecommendation: 'office',
    calculationMethod: 'compound',
    isPublic: true,
    // Associated threats: unauthorized entry, theft, workplace violence, vandalism
    // Associated controls: access control, CCTV, visitor management, intrusion alarm
  },
  {
    name: 'Retail Store Security Assessment',
    templateType: 'retail_store',
    description: 'Retail facility assessment focusing on theft prevention and customer safety.',
    siteTypeRecommendation: 'retail',
    calculationMethod: 'compound',
    isPublic: true,
    // Associated threats: shoplifting, robbery, employee theft, vandalism
    // Associated controls: CCTV, EAS tags, security guards, cash handling procedures
  },
];
```

---

## 5. API Routes & Endpoints

### 5.1 API Route Structure

**Base URL:** `/api/`

```
/api/
├── auth/
│   ├── login (POST)
│   ├── logout (POST)
│   ├── register (POST)
│   └── session (GET)
│
├── organizations/
│   ├── (GET, POST)
│   └── [id]/
│       ├── (GET, PATCH, DELETE)
│       ├── users (GET, POST)
│       └── sites (GET)
│
├── sites/
│   ├── (GET, POST)
│   └── [id]/
│       ├── (GET, PATCH, DELETE)
│       ├── assessments (GET, POST)
│       └── zones (GET, POST)
│
├── assessments/
│   ├── (GET, POST)
│   └── [id]/
│       ├── (GET, PATCH, DELETE)
│       ├── risk-scenarios (GET, POST)
│       ├── photos (GET, POST)
│       ├── generate-pdf (POST)
│       └── analytics (GET)
│
├── risk-scenarios/
│   ├── (GET, POST)
│   └── [id]/
│       ├── (GET, PATCH, DELETE)
│       ├── calculate-risk (POST)
│       ├── controls (GET, POST, DELETE)
│       └── generate-narrative (POST)
│
├── threats/
│   ├── (GET, POST)
│   └── [id]/ (GET, PATCH, DELETE)
│
├── controls/
│   ├── (GET, POST)
│   └── [id]/ (GET, PATCH, DELETE)
│
├── templates/
│   ├── (GET, POST)
│   └── [id]/
│       ├── (GET, PATCH, DELETE)
│       └── apply (POST)
│
├── photos/
│   ├── upload (POST)
│   └── [id]/
│       ├── (GET, DELETE)
│       └── analyze (POST)
│
└── ai/
    ├── analyze-photo (POST)
    └── generate-narrative (POST)
```

### 5.2 Key API Endpoint Specifications

#### **POST /api/assessments**

**Purpose:** Create a new security assessment

**Authentication:** Required (consultant role)

**Request Body:**
```json
{
  "siteId": 123,
  "templateId": 5,
  "assessmentDate": "2025-11-18",
  "purpose": "Annual security review",
  "scope": "Complete facility assessment including all zones"
}
```

**Response:**
```json
{
  "success": true,
  "assessment": {
    "id": 456,
    "assessmentNumber": "ASS-2025-123",
    "status": "draft",
    "createdAt": "2025-11-18T10:00:00Z"
  }
}
```

---

#### **POST /api/risk-scenarios/[id]/calculate-risk**

**Purpose:** Calculate inherent and residual risk for a scenario

**Authentication:** Required

**Request Body:**
```json
{
  "calculationMethod": "tvi",
  "threatLikelihood": 4,
  "vulnerability": 5,
  "impact": 4,
  "controls": [
    {
      "controlId": 12,
      "isImplemented": true,
      "implementationFidelity": 0.8
    },
    {
      "controlId": 34,
      "isImplemented": true,
      "implementationFidelity": 1.0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "calculation": {
    "inherentRisk": 80,
    "residualRisk": 47.2,
    "controlEffectiveness": 0.41,
    "riskLevel": "medium",
    "breakdown": {
      "totalControlWeight": 0.41,
      "appliedControls": [
        { "controlId": 12, "contribution": 0.16 },
        { "controlId": 34, "contribution": 0.25 }
      ]
    }
  }
}
```

---

#### **POST /api/photos/upload**

**Purpose:** Upload photo with AI analysis

**Authentication:** Required

**Request:** Multipart form data
```
file: [binary]
assessmentId: 456
riskScenarioId: 789 (optional)
zoneId: 10 (optional)
caption: "North perimeter fence condition"
```

**Response:**
```json
{
  "success": true,
  "photo": {
    "id": 1011,
    "fileName": "fence_photo_001.jpg",
    "fileUrl": "/uploads/456/fence_photo_001.jpg",
    "aiAnalysis": {
      "summary": "Chain-link fence with visible rust and damage",
      "detectedObjects": ["fence", "gate", "vegetation"],
      "securityObservations": [
        "Fence shows signs of corrosion reducing structural integrity",
        "Gap visible at base of fence near gate post",
        "Vegetation growth against fence line reduces visibility"
      ],
      "recommendations": [
        "Replace corroded fence sections",
        "Repair gap at gate post",
        "Trim vegetation to maintain clear zone"
      ]
    }
  }
}
```

---

#### **POST /api/assessments/[id]/generate-pdf**

**Purpose:** Generate PDF report for assessment

**Authentication:** Required

**Request Body:**
```json
{
  "includePhotos": true,
  "includeExecutiveSummary": true,
  "includeRiskMatrix": true,
  "includeRecommendations": true
}
```

**Response:**
```json
{
  "success": true,
  "pdfUrl": "/reports/ASS-2025-123_report.pdf",
  "generatedAt": "2025-11-18T15:30:00Z"
}
```

---

### 5.3 Authorization Rules

**Role-Based Access Control (RBAC):**

```typescript
// Authorization matrix
const permissions = {
  admin: ['*'], // Full access to all resources
  
  consultant: [
    'read:organizations:own',
    'read/write:sites:own_org',
    'read/write:assessments:own_org',
    'read/write:risk_scenarios',
    'read/write:photos',
    'read:threats',
    'read:controls',
    'execute:ai_analysis',
    'execute:pdf_generation',
  ],
  
  client_admin: [
    'read:organizations:own',
    'read:sites:own_org',
    'read:assessments:own_sites',
    'read:risk_scenarios:own_assessments',
    'read:photos:own_assessments',
  ],
  
  client_viewer: [
    'read:assessments:assigned',
    'read:risk_scenarios:assigned_assessments',
    'read:photos:assigned_assessments',
  ],
};
```

---

## 6. UI/UX Component Specifications

### 6.1 Page Structure & Navigation

**Primary Navigation (Sidebar):**
```
┌──────────────────────────┐
│ RiskFixer Logo           │
├──────────────────────────┤
│ 🏠 Dashboard             │
│ 🏢 Sites                 │
│ 📋 Assessments           │
│ 📊 Reports (Phase 2)     │
│ ⚙️ Settings              │
│ 👤 Profile               │
└──────────────────────────┘
```

### 6.2 Dashboard (Home Page)

**File Location:** `app/dashboard/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Welcome back, [User Name]                              │
│ Quick Stats Bar:                                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ Active   │ │ Sites    │ │ Critical │ │ Avg Risk │         │
│ │ Assess.  │ │ Monitored│ │ Risks    │ │ Score    │         │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Recent Assessments Table                                        │
│ ┌──────┬───────────────┬──────────┬────────┬─────────────┐   │
│ │ #    │ Site          │ Date     │ Status │ Actions     │   │
│ ├──────┼───────────────┼──────────┼────────┼─────────────┤   │
│ │ ASS- │ HQ Building   │ Nov 15   │ Draft  │ [Continue]  │   │
│ │ 2025 │               │          │        │ [Delete]    │   │
│ └──────┴───────────────┴──────────┴────────┴─────────────┘   │
│ [+ New Assessment]                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- `StatsCard` - Quick metric display
- `AssessmentTable` - Sortable/filterable table
- `NewAssessmentButton` - Opens template selector modal

---

### 6.3 Assessment Workflow (Multi-Step Form)

**File Location:** `app/assessments/[id]/page.tsx`

**Steps:**
1. **Setup** - Basic info (date, assessor, template)
2. **Facility Survey** - Interview questions, observations
3. **Risk Scenarios** - For each threat:
   - Score T/V/I or L/I
   - Select/customize controls
   - Add photos
   - AI narrative generation
4. **Review & Analysis** - Risk matrix, control effectiveness chart
5. **Report Generation** - PDF customization and download

**Risk Scenario Input Form:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Risk Scenario: Unauthorized Entry - Forced Entry               │
├─────────────────────────────────────────────────────────────────┤
│ Threat Scoring (T×V×I Model):                                  │
│                                                                  │
│ Threat Likelihood: [▓▓▓▓░] 4 - Likely                         │
│ Vulnerability:     [▓▓▓▓▓] 5 - Highly Vulnerable              │
│ Impact:            [▓▓▓▓░] 4 - Critical                        │
│                                                                  │
│ Inherent Risk: 80 (High)                                        │
├─────────────────────────────────────────────────────────────────┤
│ Existing Controls:                                              │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ ☑ Electronic Access Control System                        │ │
│ │   Fidelity: [▓▓▓▓░░░░░░] 80%                            │ │
│ │   Notes: System functional but needs maintenance          │ │
│ │   [📷 Add Photo] [🗑️ Remove]                            │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ ☑ CCTV Cameras - Fixed (Indoor)                          │ │
│ │   Fidelity: [▓▓▓▓▓▓▓▓▓▓] 100%                          │ │
│ │   Notes: Recently upgraded, excellent coverage            │ │
│ │   [📷 2 Photos] [🗑️ Remove]                             │ │
│ └───────────────────────────────────────────────────────────┘ │
│ [+ Add Control]                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Residual Risk: 47.2 (Medium)                                    │
│ Control Effectiveness: 41%                                      │
│                                                                  │
│ [🤖 Generate AI Narrative] [💾 Save] [➡️ Next Threat]       │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6.4 Risk Matrix Visualization

**Component:** `RiskMatrixChart`

**Display:** Heat map showing all risk scenarios plotted by inherent vs. residual risk

```
      │ Critical (5)  │ [  ] [R3] [  ] [  ] [  ]
      │ High (4)      │ [  ] [R1] [R7] [  ] [  ]
Impact│ Significant(3)│ [R4] [R5] [  ] [  ] [  ]
      │ Moderate (2)  │ [R6] [  ] [  ] [  ] [  ]
      │ Negligible(1) │ [  ] [  ] [  ] [  ] [  ]
      └───────────────┴───────────────────────────
                        1    2    3    4    5
                           Likelihood
                           
Legend: [R#] = Risk Scenario with hover tooltip
Color: Red (Critical), Orange (High), Yellow (Medium), Blue (Low), Green (Negligible)
```

---

### 6.5 Photo Management Interface

**Component:** `PhotoGallery`

**Features:**
- Drag-and-drop upload
- Grid view with thumbnails
- Click to expand lightbox
- AI analysis badge ("🤖 Analyzed")
- Tag filtering
- Association with risk scenarios/zones

```
┌─────────────────────────────────────────────────────────────────┐
│ Photos (12)                                     [🔍 Filter] [⬆️]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│ │[Image 1]│ │[Image 2]│ │[Image 3]│ │[Image 4]│              │
│ │🤖 AI    │ │         │ │🤖 AI    │ │         │              │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│ North Gate   Lobby CCTV  Fence Dmg   Access Ctrl              │
│                                                                  │
│ [+ Upload Photos] [+ Take Photo] [🗑️ Delete Selected]        │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6.6 Component Library (shadcn/ui)

**Core Components to Use:**
```typescript
// Forms & Inputs
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup } from '@/components/ui/radio-group';

// Layout & Navigation
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Sheet } from '@/components/ui/sheet';

// Data Display
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Feedback
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
```

---

## 7. AI Integration Specifications

### 7.1 OpenAI Configuration

**Environment Variables:**
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL_VISION=gpt-4o  # For image analysis
OPENAI_MODEL_TEXT=gpt-4o    # For narrative generation
```

### 7.2 Photo Analysis Service

**File Location:** `server/services/ai-photo-analysis.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PhotoAnalysisResult {
  summary: string;
  detectedObjects: string[];
  securityObservations: string[];
  recommendations: string[];
  confidence: number;
}

export async function analyzeSecurityPhoto(
  imageBase64: string,
  context?: {
    zoneName?: string;
    threatType?: string;
    existingControls?: string[];
  }
): Promise<PhotoAnalysisResult> {
  const contextPrompt = context
    ? `
      Context:
      - Location: ${context.zoneName || 'Unknown'}
      - Threat being assessed: ${context.threatType || 'General security'}
      - Existing controls: ${context.existingControls?.join(', ') || 'None specified'}
    `
    : '';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert physical security consultant analyzing facility security photos. 
        Provide detailed observations about security vulnerabilities, control effectiveness, 
        and specific recommendations for improvement.
        
        Focus on:
        - Physical barriers (fences, doors, windows)
        - Access control equipment (card readers, locks, gates)
        - Surveillance equipment (cameras, lighting)
        - Environmental factors (landscaping, sightlines, lighting)
        - Signs of wear, damage, or poor maintenance
        - CPTED principles (Crime Prevention Through Environmental Design)
        
        Be specific, actionable, and prioritize life safety concerns.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this security-related photo and provide:
            1. Brief summary (1-2 sentences)
            2. List of detected security-relevant objects
            3. Security observations (vulnerabilities, control conditions)
            4. Specific recommendations for improvement
            
            ${contextPrompt}
            
            Respond in JSON format:
            {
              "summary": "string",
              "detectedObjects": ["string"],
              "securityObservations": ["string"],
              "recommendations": ["string"],
              "confidence": number (0.0-1.0)
            }`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  // Parse JSON response
  const result: PhotoAnalysisResult = JSON.parse(content);
  return result;
}
```

### 7.3 Narrative Generation Service

**File Location:** `server/services/ai-narrative-generation.ts`

```typescript
export interface NarrativeGenerationInput {
  threatName: string;
  threatDescription: string;
  inherentRisk: number;
  residualRisk: number;
  riskLevel: string;
  zoneName?: string;
  evidenceNotes?: string;
  implementedControls: Array<{
    name: string;
    condition: string;
    fidelity: number;
  }>;
  missingControls?: string[];
}

export interface GeneratedNarrative {
  riskDescription: string;
  currentStateAnalysis: string;
  vulnerabilityExplanation: string;
  controlEffectivenessAssessment: string;
  recommendedActions: string[];
}

export async function generateRiskNarrative(
  input: NarrativeGenerationInput
): Promise<GeneratedNarrative> {
  const prompt = `You are a professional security consultant writing a risk assessment report.
  
  Generate a comprehensive narrative for the following risk scenario:
  
  **Threat:** ${input.threatName}
  **Description:** ${input.threatDescription}
  **Location:** ${input.zoneName || 'Facility-wide'}
  **Inherent Risk Score:** ${input.inherentRisk} (${getRiskLevelText(input.inherentRisk)})
  **Residual Risk Score:** ${input.residualRisk} (${input.riskLevel})
  
  **Implemented Controls:**
  ${input.implementedControls
    .map(
      (c) =>
        `- ${c.name} (${c.condition}, Fidelity: ${Math.round(c.fidelity * 100)}%)`
    )
    .join('\n')}
  
  ${
    input.missingControls?.length
      ? `**Notable Missing Controls:**
  ${input.missingControls.map((c) => `- ${c}`).join('\n')}`
      : ''
  }
  
  ${input.evidenceNotes ? `**Field Observations:**\n${input.evidenceNotes}` : ''}
  
  Provide:
  1. **Risk Description** (2-3 sentences): Explain the specific threat scenario at this location.
  2. **Current State Analysis** (2-3 sentences): Describe existing security posture and observations.
  3. **Vulnerability Explanation** (2-3 sentences): Explain why this risk exists and contributing factors.
  4. **Control Effectiveness Assessment** (2-3 sentences): Evaluate how well current controls mitigate the risk.
  5. **Recommended Actions** (3-5 bullet points): Specific, prioritized actions to reduce risk.
  
  Use professional security industry language. Be specific and actionable.
  Avoid generic advice. Reference ASIS standards where applicable.
  
  Respond in JSON format:
  {
    "riskDescription": "string",
    "currentStateAnalysis": "string",
    "vulnerabilityExplanation": "string",
    "controlEffectivenessAssessment": "string",
    "recommendedActions": ["string"]
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a certified physical security professional (PSP) with expertise in security risk assessments per ASIS International standards.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1500,
    temperature: 0.4,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const result: GeneratedNarrative = JSON.parse(content);
  return result;
}

function getRiskLevelText(score: number): string {
  if (score >= 76) return 'Critical';
  if (score >= 51) return 'High';
  if (score >= 26) return 'Medium';
  if (score >= 11) return 'Low';
  return 'Negligible';
}
```

---

## 8. PDF Generation Specifications

### 8.1 Puppeteer Setup (Replit Configuration)

**Nix Configuration File:** `.replit`

```nix
# Add Puppeteer dependencies
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.chromium
    pkgs.nss
    pkgs.freetype
    pkgs.harfbuzz
    pkgs.ca-certificates
    pkgs.fontconfig
  ];
  
  env = {
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true";
    PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
  };
}
```

### 8.2 PDF Service Module

**File Location:** `server/services/pdf-generator.ts`

```typescript
import puppeteer from 'puppeteer';
import { db } from '@/server/db';
import { assessments, riskScenarios, photos } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export interface PDFGenerationOptions {
  assessmentId: number;
  includePhotos: boolean;
  includeExecutiveSummary: boolean;
  includeRiskMatrix: boolean;
  includeRecommendations: boolean;
  includeAppendices: boolean;
}

export async function generateAssessmentPDF(
  options: PDFGenerationOptions
): Promise<string> {
  // Step 1: Fetch all assessment data
  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, options.assessmentId),
    with: {
      site: true,
      assessor: true,
      riskScenarios: {
        with: {
          threat: true,
          controls: {
            with: {
              control: true,
            },
          },
        },
      },
      photos: options.includePhotos,
    },
  });

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  // Step 2: Generate HTML report
  const htmlContent = generateReportHTML(assessment, options);

  // Step 3: Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #666;">
          <span>${assessment.site.name} Security Assessment</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #666;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          <span style="float: right; margin-right: 0.75in;">RiskFixer Report | ${new Date().toLocaleDateString()}</span>
        </div>
      `,
    });

    // Step 4: Save PDF file
    const fileName = `${assessment.assessmentNumber}_report.pdf`;
    const filePath = `/mnt/user-data/outputs/${fileName}`;
    
    await fs.writeFile(filePath, pdfBuffer);

    // Step 5: Update assessment record
    await db
      .update(assessments)
      .set({
        pdfUrl: filePath,
        pdfGeneratedAt: new Date(),
      })
      .where(eq(assessments.id, options.assessmentId));

    return filePath;
  } finally {
    await browser.close();
  }
}
```

### 8.3 PDF Report HTML Template

**File Location:** `server/templates/assessment-report.tsx` (React component for HTML)

```tsx
interface ReportTemplateProps {
  assessment: /* full assessment type */;
  options: PDFGenerationOptions;
}

export function AssessmentReportTemplate({
  assessment,
  options,
}: ReportTemplateProps) {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <title>{assessment.assessmentNumber} Security Assessment Report</title>
        <style>{`
          @page {
            size: Letter;
            margin: 0.75in;
          }
          
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
          }
          
          .cover-page {
            page-break-after: always;
            text-align: center;
            padding-top: 3in;
          }
          
          .cover-title {
            font-size: 28pt;
            font-weight: bold;
            margin-bottom: 0.5in;
          }
          
          .cover-subtitle {
            font-size: 16pt;
            color: #666;
            margin-bottom: 0.25in;
          }
          
          h1 {
            font-size: 18pt;
            border-bottom: 2px solid #000;
            padding-bottom: 0.1in;
            margin-top: 0.3in;
          }
          
          h2 {
            font-size: 14pt;
            margin-top: 0.25in;
          }
          
          .risk-high { color: #dc2626; font-weight: bold; }
          .risk-medium { color: #ea580c; }
          .risk-low { color: #0284c7; }
          
          .risk-scenario {
            page-break-inside: avoid;
            margin-bottom: 0.25in;
            padding: 0.15in;
            border: 1px solid #ddd;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0.15in 0;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 0.08in;
            text-align: left;
          }
          
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          
          .photo {
            max-width: 100%;
            height: auto;
            page-break-inside: avoid;
          }
        `}</style>
      </head>
      <body>
        {/* Cover Page */}
        <div className="cover-page">
          <div className="cover-title">
            Physical Security Assessment
          </div>
          <div className="cover-subtitle">
            {assessment.site.name}
          </div>
          <div className="cover-subtitle">
            {assessment.assessmentNumber}
          </div>
          <div style={{ marginTop: '1in', fontSize: '12pt' }}>
            Assessment Date: {assessment.assessmentDate}
            <br />
            Prepared by: {assessment.assessor?.firstName}{' '}
            {assessment.assessor?.lastName}
            <br />
            Report Generated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Executive Summary */}
        {options.includeExecutiveSummary && (
          <>
            <h1>Executive Summary</h1>
            <p>{assessment.executiveSummary}</p>
            
            <h2>Risk Overview</h2>
            <table>
              <tr>
                <th>Risk Level</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
              <tr className="risk-high">
                <td>Critical/High</td>
                <td>{assessment.highRiskCount}</td>
                <td>
                  {(
                    (assessment.highRiskCount /
                      assessment.riskScenarios.length) *
                    100
                  ).toFixed(0)}
                  %
                </td>
              </tr>
              <tr className="risk-medium">
                <td>Medium</td>
                <td>{assessment.mediumRiskCount}</td>
                <td>
                  {(
                    (assessment.mediumRiskCount /
                      assessment.riskScenarios.length) *
                    100
                  ).toFixed(0)}
                  %
                </td>
              </tr>
              <tr className="risk-low">
                <td>Low</td>
                <td>{assessment.lowRiskCount}</td>
                <td>
                  {(
                    (assessment.lowRiskCount /
                      assessment.riskScenarios.length) *
                    100
                  ).toFixed(0)}
                  %
                </td>
              </tr>
            </table>
          </>
        )}

        {/* Risk Scenarios Detail */}
        <h1 style={{ pageBreakBefore: 'always' }}>
          Detailed Risk Assessment
        </h1>
        {assessment.riskScenarios.map((scenario, index) => (
          <div key={scenario.id} className="risk-scenario">
            <h2>
              {index + 1}. {scenario.threat.name}
              <span
                className={`risk-${scenario.riskLevel}`}
                style={{ float: 'right' }}
              >
                {scenario.riskLevel.toUpperCase()}
              </span>
            </h2>
            
            <p><strong>Risk Description:</strong></p>
            <p>{scenario.scenarioDescription || scenario.threat.description}</p>
            
            <table>
              <tr>
                <th>Metric</th>
                <th>Score</th>
              </tr>
              <tr>
                <td>Threat Likelihood</td>
                <td>{scenario.threatLikelihood || scenario.likelihood}/5</td>
              </tr>
              {scenario.vulnerability && (
                <tr>
                  <td>Vulnerability</td>
                  <td>{scenario.vulnerability}/5</td>
                </tr>
              )}
              <tr>
                <td>Impact</td>
                <td>{scenario.impact || scenario.impactLegacy}/5</td>
              </tr>
              <tr style={{ backgroundColor: '#fee2e2' }}>
                <td><strong>Inherent Risk</strong></td>
                <td><strong>{scenario.inherentRisk.toFixed(1)}</strong></td>
              </tr>
              <tr style={{ backgroundColor: '#fef3c7' }}>
                <td><strong>Residual Risk</strong></td>
                <td><strong>{scenario.residualRisk.toFixed(1)}</strong></td>
              </tr>
              <tr>
                <td>Control Effectiveness</td>
                <td>{(scenario.controlEffectiveness * 100).toFixed(0)}%</td>
              </tr>
            </table>
            
            <p><strong>Implemented Controls:</strong></p>
            <ul>
              {scenario.controls.map((sc) => (
                <li key={sc.id}>
                  {sc.control.name} -{' '}
                  <em>
                    {sc.observedCondition || 'Condition not specified'}
                  </em>
                  {sc.implementationFidelity < 1 && (
                    <span style={{ color: '#dc2626' }}>
                      {' '}
                      (Fidelity: {(sc.implementationFidelity * 100).toFixed(0)}%)
                    </span>
                  )}
                </li>
              ))}
            </ul>
            
            {scenario.aiRecommendations && (
              <>
                <p><strong>Recommendations:</strong></p>
                <ul>
                  {JSON.parse(scenario.aiRecommendations).map(
                    (rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    )
                  )}
                </ul>
              </>
            )}
            
            {/* Photos for this risk scenario */}
            {options.includePhotos &&
              assessment.photos
                .filter((p) => p.riskScenarioId === scenario.id)
                .map((photo) => (
                  <div key={photo.id} style={{ marginTop: '0.15in' }}>
                    <img
                      src={photo.fileUrl}
                      alt={photo.caption || ''}
                      className="photo"
                    />
                    {photo.caption && (
                      <p style={{ fontSize: '9pt', color: '#666' }}>
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
          </div>
        ))}

        {/* Recommendations Summary */}
        {options.includeRecommendations && (
          <>
            <h1 style={{ pageBreakBefore: 'always' }}>
              Prioritized Recommendations
            </h1>
            {/* Generate consolidated recommendations */}
          </>
        )}
      </body>
    </html>
  );
}
```

---

## 9. 3-Week Implementation Roadmap

### Week 1: Foundation & Data Layer (Days 1-7)

#### **Day 1: Project Setup & Configuration**
**AI Prompt for Replit Agent:**
```
Set up a Next.js 14 project in Replit with the following:
1. Initialize Next.js with App Router (not Pages Router)
2. Install dependencies: drizzle-orm, @neondatabase/serverless, next-auth, tailwindcss
3. Configure Replit's built-in PostgreSQL connection
4. Set up Drizzle config pointing to Replit PostgreSQL
5. Create .env file template with OPENAI_API_KEY, DATABASE_URL, NEXTAUTH_SECRET
6. Install shadcn/ui and configure it with Tailwind
7. Create basic folder structure: /server/db, /server/services, /app, /components
```

**Tasks:**
- [ ] Initialize Next.js 14 with App Router
- [ ] Configure Drizzle ORM
- [ ] Set up Replit PostgreSQL connection
- [ ] Install shadcn/ui components
- [ ] Create environment variables

---

#### **Day 2: Database Schema Implementation**
**AI Prompt:**
```
Using the complete database schema from the RiskFixer Master Framework Document (Section 2.3),
create the following Drizzle schema file at server/db/schema.ts:
1. Implement all tables: organizations, users, sites, assessments, riskScenarios, threats, controls, etc.
2. Add all foreign key relationships with cascade rules
3. Create indexes for performance (orgs, sites, assessments, risk scenarios)
4. Export all table definitions and relations
```

**Tasks:**
- [ ] Create complete `server/db/schema.ts`
- [ ] Generate initial migration with `drizzle-kit generate:pg`
- [ ] Run migration: `drizzle-kit push:pg`
- [ ] Verify tables in Replit PostgreSQL

---

#### **Day 3-4: Seed Data Implementation**
**AI Prompt (Day 3):**
```
Create a seed script at server/db/seed.ts that populates:
1. Threats library (15-20 threats from Section 4.1 of framework)
2. Controls library (50-80 controls from Section 4.2)
3. Include all fields: name, category, description, baseWeight, reductionPercentage, etc.
4. Make the script idempotent (check if data exists before inserting)
```

**AI Prompt (Day 4):**
```
Extend the seed script to add:
1. 3 assessment templates (executive protection, office building, retail store)
2. Template-threat associations
3. Template-control associations
4. Sample facility zones for each template
5. One demo organization with 2 users (admin, consultant)
```

**Tasks:**
- [ ] Create threats seed data
- [ ] Create controls seed data
- [ ] Create templates and associations
- [ ] Create demo organization
- [ ] Run seed script: `npm run seed`

---

#### **Day 5: Risk Engine Module**
**AI Prompt:**
```
Implement the risk calculation engine at server/services/risk-engine.ts per Section 3.5:
1. Create calculateRiskCompound() function for legacy model
2. Create calculateRiskTVI() function for T×V×I model
3. Create classifyRiskLevel() function
4. Create aggregateAssessmentRisk() function
5. Include TypeScript interfaces for all inputs/outputs
6. Add comprehensive JSDoc comments
```

**Tasks:**
- [ ] Implement risk calculation functions
- [ ] Write unit tests for risk engine
- [ ] Test both calculation methods
- [ ] Verify risk level classification

---

#### **Day 6-7: Authentication & Authorization**
**AI Prompt (Day 6):**
```
Set up NextAuth.js authentication:
1. Configure credentials provider (email/password)
2. Create login API route at /api/auth/[...nextauth]
3. Hash passwords with bcrypt
4. Store sessions in PostgreSQL
5. Create middleware for protected routes
6. Add RBAC helper functions (checkPermission, requireRole)
```

**AI Prompt (Day 7):**
```
Create authentication UI components:
1. Login page with email/password form
2. Registration page (if needed for testing)
3. Protected route wrapper component
4. User profile dropdown
5. Session management (logout, auto-refresh)
```

**Tasks:**
- [ ] Configure NextAuth.js
- [ ] Create login/registration pages
- [ ] Implement RBAC system
- [ ] Test authentication flow

---

### Week 2: Core Assessment Workflow (Days 8-14)

#### **Day 8: Dashboard & Navigation**
**AI Prompt:**
```
Create the main dashboard at app/dashboard/page.tsx:
1. Sidebar navigation with: Dashboard, Sites, Assessments, Settings
2. Stats cards showing: Active Assessments, Sites Monitored, Critical Risks, Avg Risk Score
3. Recent assessments table (sortable, filterable)
4. "New Assessment" button opening template selector modal
5. Use shadcn/ui components (Card, Table, Button, Dialog)
```

**Tasks:**
- [ ] Create dashboard layout
- [ ] Implement stats cards with real data
- [ ] Create assessments table
- [ ] Add template selector modal

---

#### **Day 9-10: Sites Management**
**AI Prompt (Day 9):**
```
Create sites CRUD interface at app/sites:
1. Sites list page with table (name, type, address, # assessments)
2. Create/Edit site form with all fields from schema
3. API routes: GET /api/sites, POST /api/sites, PATCH /api/sites/[id]
4. Validation using Zod schemas
5. Success/error toast notifications
```

**AI Prompt (Day 10):**
```
Create site detail page at app/sites/[id]:
1. Site information card
2. Assessments list for this site
3. "New Assessment" button
4. Quick stats (avg risk, last assessment date)
```

**Tasks:**
- [ ] Create sites list page
- [ ] Implement site form
- [ ] Create API routes
- [ ] Add site detail page

---

#### **Day 11-12: Assessment Creation Wizard**
**AI Prompt (Day 11):**
```
Create multi-step assessment wizard at app/assessments/new:
1. Step 1: Basic Info (site selector, date, assessor, template selector)
2. Step 2: Apply template (load associated threats and controls)
3. Step 3: Facility Survey (show template-specific interview questions)
4. Use React state management or form library (react-hook-form)
5. Progress indicator showing current step
6. Save as draft functionality at each step
```

**AI Prompt (Day 12):**
```
Implement the risk scenario input interface:
1. For each threat in template, show risk scoring form
2. T×V×I sliders (1-5) or Likelihood/Impact sliders
3. Inherent risk auto-calculation display
4. Control selector with search/filter
5. Implementation fidelity slider per control
6. Real-time residual risk calculation
7. "Add Photo" button for each control
8. Auto-save every 30 seconds
```

**Tasks:**
- [ ] Create assessment wizard
- [ ] Implement template application
- [ ] Build risk scenario form
- [ ] Add auto-save functionality

---

#### **Day 13: Photo Upload & Management**
**AI Prompt:**
```
Create photo management system:
1. Photo upload component with drag-and-drop (use react-dropzone)
2. API route POST /api/photos/upload handling multipart form data
3. Store files in /mnt/user-data/uploads (Replit storage)
4. Save metadata to photos table
5. Photo gallery component with thumbnails
6. Lightbox for full-size view
7. Associate photos with risk scenarios or zones
```

**Tasks:**
- [ ] Implement photo upload
- [ ] Create photo gallery
- [ ] Add file storage logic
- [ ] Test image handling

---

#### **Day 14: Risk Matrix Visualization**
**AI Prompt:**
```
Create risk matrix visualization component:
1. Use Recharts or D3.js for heat map
2. Plot all risk scenarios by likelihood × impact (or T × V)
3. Color-code by risk level (red, orange, yellow, blue, green)
4. Click on point to navigate to risk scenario
5. Show before/after view (inherent vs residual)
6. Add legend and axis labels
7. Export to PNG functionality
```

**Tasks:**
- [ ] Implement risk matrix component
- [ ] Add interactive tooltips
- [ ] Create export function
- [ ] Test with sample data

---

### Week 3: AI Integration & PDF Generation (Days 15-21)

#### **Day 15-16: AI Photo Analysis**
**AI Prompt (Day 15):**
```
Implement AI photo analysis service at server/services/ai-photo-analysis.ts:
1. Use OpenAI GPT-4 Vision API
2. Send base64-encoded image with security-focused prompt
3. Request JSON response with: summary, detectedObjects, securityObservations, recommendations
4. Parse and save to photos.aiAnalysis field
5. Error handling and retry logic
```

**AI Prompt (Day 16):**
```
Create photo analysis UI:
1. "Analyze with AI" button on photo upload
2. Loading spinner during analysis
3. Display AI results in expandable card
4. Option to edit/override AI observations
5. Badge showing "AI Analyzed" status
```

**Tasks:**
- [ ] Implement OpenAI integration
- [ ] Create analysis service
- [ ] Build AI results UI
- [ ] Test with various security photos

---

#### **Day 17: AI Narrative Generation**
**AI Prompt:**
```
Implement AI narrative generation at server/services/ai-narrative-generation.ts:
1. Use OpenAI GPT-4 for text generation
2. Input: threat data, risk scores, controls, observations
3. Generate: risk description, current state analysis, vulnerability explanation, control assessment, recommendations
4. API route: POST /api/risk-scenarios/[id]/generate-narrative
5. Save to riskScenarios.aiNarrative field
```

**Tasks:**
- [ ] Create narrative generation service
- [ ] Build API endpoint
- [ ] Add "Generate Narrative" button in risk scenario form
- [ ] Display generated content in textarea

---

#### **Day 18: Puppeteer & PDF Setup**
**AI Prompt:**
```
Configure Puppeteer for Replit:
1. Update .replit config to include Chromium dependencies (see Section 8.1)
2. Install puppeteer package
3. Set PUPPETEER_EXECUTABLE_PATH environment variable
4. Create test PDF generation script to verify Chromium works
5. Handle Replit-specific quirks (no-sandbox flags)
```

**Tasks:**
- [ ] Update Nix configuration
- [ ] Install Puppeteer
- [ ] Test Chromium launch
- [ ] Verify PDF generation works

---

#### **Day 19-20: PDF Report Generation**
**AI Prompt (Day 19):**
```
Create PDF generation service at server/services/pdf-generator.ts:
1. Fetch complete assessment data with all related tables
2. Generate HTML using React component template (Section 8.3)
3. Use Puppeteer to render HTML to PDF
4. Include: cover page, executive summary, risk scenarios, photos, recommendations
5. Save PDF to /mnt/user-data/outputs
6. Update assessment.pdfUrl field
```

**AI Prompt (Day 20):**
```
Create PDF report UI:
1. "Generate Report" button in assessment detail page
2. PDF customization modal (include photos? appendices?)
3. Loading spinner during generation
4. Preview button opening PDF in new tab
5. Download button
6. Email report functionality (optional)
```

**Tasks:**
- [ ] Implement PDF generator
- [ ] Create report HTML template
- [ ] Build PDF generation UI
- [ ] Test with complete assessment

---

#### **Day 21: Testing, Polish & Deployment**
**AI Prompt:**
```
Final polish and testing:
1. Run through complete workflow: create site → start assessment → score risks → upload photos → AI analysis → generate PDF
2. Fix any bugs encountered
3. Add loading states and error messages
4. Improve mobile responsiveness (if time)
5. Test with demo account and seed data
6. Create user documentation or README
7. Deploy to Replit (should auto-deploy on push)
```

**Tasks:**
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] UI polish
- [ ] Create demo video or walkthrough
- [ ] Write deployment notes

---

## 10. Replit Configuration Checklist

### 10.1 Nix Configuration (`.replit`)

```nix
{ pkgs }: {
  deps = [
    # Node.js and core dependencies
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript
    
    # PostgreSQL client libraries
    pkgs.postgresql
    
    # Puppeteer dependencies
    pkgs.chromium
    pkgs.nss
    pkgs.freetype
    pkgs.harfbuzz
    pkgs.ca-certificates
    pkgs.fontconfig
    pkgs.libX11
    pkgs.libXcomposite
    pkgs.libXcursor
    pkgs.libXdamage
    pkgs.libXext
    pkgs.libXi
    pkgs.libXrandr
    pkgs.libXrender
    pkgs.libXtst
    pkgs.libxcb
    pkgs.alsa-lib
    pkgs.atk
    pkgs.cups
    pkgs.dbus
    pkgs.expat
    pkgs.glib
    pkgs.gtk3
    pkgs.nspr
    pkgs.pango
    
    # Build tools
    pkgs.gcc
    pkgs.gnumake
  ];

  env = {
    # Puppeteer configuration
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true";
    PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
    
    # Disable Puppeteer sandbox (required in Replit)
    PUPPETEER_ARGS = "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage";
    
    # PostgreSQL connection (Replit provides DATABASE_URL automatically)
    # DATABASE_URL will be auto-injected by Replit
  };

  # Start command
  [nix.channel]
  channel = "stable-23_11";
}
```

### 10.2 Environment Variables

**File:** `.env.local` (create this manually in Replit)

```bash
# Database (automatically provided by Replit, but can override for external DB)
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://your-repl-name.repl.co"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# OpenAI API
OPENAI_API_KEY="sk-..."

# Node Environment
NODE_ENV="development"

# Optional: Email service for report distribution (Phase 2)
# EMAIL_SERVER="smtp://..."
# EMAIL_FROM="noreply@riskfixer.com"
```

### 10.3 Package.json Scripts

```json
{
  "name": "riskfixer",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx server/db/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "drizzle-orm": "^0.30.0",
    "@neondatabase/serverless": "^0.9.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.23.0",
    "openai": "^4.47.0",
    "puppeteer": "^22.6.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.0",
    "recharts": "^2.12.0",
    "react-dropzone": "^14.2.0",
    "react-hook-form": "^7.51.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.4.0",
    "drizzle-kit": "^0.20.0",
    "tsx": "^4.7.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

### 10.4 Replit Deployment Settings

**In Replit Dashboard:**

1. **Secrets (Environment Variables):**
   - Add `OPENAI_API_KEY`
   - Add `NEXTAUTH_SECRET`
   - `DATABASE_URL` is auto-provided

2. **PostgreSQL Setup:**
   - Enable PostgreSQL from Replit's "Tools" menu
   - Database will be available at `$DATABASE_URL`

3. **Storage:**
   - Uploaded photos: `/mnt/user-data/uploads`
   - Generated PDFs: `/mnt/user-data/outputs`
   - These persist across deployments

4. **Run Command:**
   - Set to `npm run dev` for development
   - Or `npm run build && npm run start` for production

5. **Port:**
   - Next.js runs on port 3000 by default
   - Replit will auto-detect and expose it

### 10.5 Troubleshooting Common Replit Issues

**Issue:** Puppeteer fails to launch Chromium
```bash
# Solution: Verify environment variables are set
echo $PUPPETEER_EXECUTABLE_PATH  # Should show /nix/store/.../bin/chromium
```

**Issue:** Database connection errors
```bash
# Solution: Check DATABASE_URL is set
echo $DATABASE_URL  # Should show PostgreSQL connection string
# Run migrations
npm run db:push
```

**Issue:** File uploads not persisting
```bash
# Solution: Ensure using /mnt/user-data/ paths
# Replit only persists files in /mnt/user-data/
```

**Issue:** OpenAI API timeouts
```typescript
// Solution: Increase timeout in OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds
});
```

---

## Appendix A: AI Prompting Best Practices for Replit Agent

### General Prompting Guidelines

1. **Be Specific About File Locations:**
   ```
   ✅ "Create a file at server/db/schema.ts with..."
   ❌ "Create a schema file with..."
   ```

2. **Reference the Framework Document:**
   ```
   ✅ "Using Section 2.3 of the RiskFixer Master Framework, implement..."
   ❌ "Create a database schema for risk management..."
   ```

3. **Break Down Complex Tasks:**
   ```
   ✅ "First, create the Drizzle schema with just the organizations and users tables. Then, I'll ask you to add the sites and assessments tables."
   ❌ "Implement the entire database schema."
   ```

4. **Specify Dependencies:**
   ```
   ✅ "Install drizzle-orm, @neondatabase/serverless, and zod. Then create..."
   ❌ "Set up the database connection."
   ```

5. **Request Explanations:**
   ```
   ✅ "Implement the risk calculation function and explain each step in comments."
   ❌ "Implement the risk calculation."
   ```

### Iterative Development with AI

**Pattern: Build → Test → Refine**

```
Prompt 1: "Create a basic risk scenario form with just threat selection and likelihood/impact sliders."
[AI creates basic form]

Prompt 2: "Good! Now add the control selection dropdown and show a list of selected controls below the form."
[AI adds controls]

Prompt 3: "Perfect. Now calculate the residual risk in real-time as the user adjusts sliders and show it in a risk level badge."
[AI adds calculation]
```

---

## Appendix B: Phase 2 Enhancements (Post-MVP)

**Features to add after 3-week sprint:**

1. **Client Dashboard:**
   - Real-time risk monitoring
   - Historical trend charts
   - Control effectiveness tracking over time
   - Automated risk scoring updates

2. **Multi-User Collaboration:**
   - Role-based task assignment
   - Comments and annotations on risk scenarios
   - Change tracking and audit logs
   - Notification system

3. **Advanced Reporting:**
   - Executive dashboards with KPIs
   - Compliance mapping (ASIS, ISO, NIST)
   - Custom report templates
   - Scheduled report generation

4. **Integration APIs:**
   - SIEM system integration
   - Access control system data import
   - Incident management system connector
   - GIS mapping integration

5. **Mobile App:**
   - Native iOS/Android assessment app
   - Offline data collection
   - Photo capture with GPS tagging
   - Voice-to-text observations

---

**END OF MASTER FRAMEWORK DOCUMENT**

---

## How to Use This Document

**For AI-Assisted Coding:**
1. Copy relevant sections into your prompts
2. Reference section numbers (e.g., "See Section 3.5 for risk engine spec")
3. Use the AI prompts provided in the roadmap verbatim or adapt them

**For Manual Development:**
1. Follow the 3-week roadmap day-by-day
2. Implement database schema first (Week 1)
3. Build core workflow next (Week 2)
4. Add AI and PDF last (Week 3)

**For Project Management:**
1. Use the daily tasks as sprint tickets
2. Track progress in a kanban board
3. Estimate 8-12 hours per day with AI assistance
4. Budget 2-3 hours for testing and polish at the end

**Questions or Issues?**
- Refer back to this framework document
- Use the troubleshooting section (10.5)
- Consult the API specifications (Section 5)
- Reference the database schema (Section 2)

Good luck building RiskFixer! 🚀