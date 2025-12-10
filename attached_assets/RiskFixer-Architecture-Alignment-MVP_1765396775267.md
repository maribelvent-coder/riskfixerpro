# RiskFixer Architecture Alignment Document
## Resolving the Phase 1 vs. 6-Layer AI Framework Conflict

**Version:** 1.0  
**Date:** December 9, 2025  
**Status:** AUTHORITATIVE ENGINEERING DECISION  
**Prepared for:** Development Agents, Claude Code, Software Engineers

---

## Executive Decision

**THE 6-LAYER AI FRAMEWORK IS THE MVP.**

All legacy Phase 1 logic (direct T×V×I multiplication in mappers) must be **removed or rewritten**. RiskFixer will ship with **one unified risk engine** that produces MacQuarrie-grade output from Day 1.

This document provides:
1. Clear architectural decision
2. Corrected file specifications
3. Engineering instructions for all affected files
4. Validation criteria

---

## Part 1: The Problem Statement

### Current State: Two Incompatible Risk Engines

The codebase currently has **conflicting approaches** that would cause unpredictable behavior if deployed together:

| Component | Current Behavior | Problem |
|-----------|------------------|---------|
| `ep-interview-mapper.ts` | Generates 12 scenarios, calculates T×V×I×E directly | Legacy Phase 1 logic |
| `ep-ai-risk-assessment.ts` | AI-powered assessment with algorithmic fallback | Conflicts with mapper |
| `ai-risk-assessment-v2.ts` | Unified AI service for all templates | Would be bypassed |
| Frontend | Expects hardcoded scenario arrays | Doesn't display AI narratives |
| PDF Reports | Uses legacy risk data | No evidence chains |

**Result if deployed as-is:**
- Two different risk scores for the same data
- Inconsistent recommendations
- No audit trail
- Fails professional credibility test

---

## Part 2: The Architectural Decision

### 6-Layer Context Library = MVP Standard

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         RISKFIXER MVP ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐    ┌────────────────────────┐                   │
│  │    INTERVIEW DATA      │───>│   MAPPER (Data Prep)   │                   │
│  │   (User Input Layer)   │    │   NO SCORING HERE      │                   │
│  └────────────────────────┘    └──────────┬─────────────┘                   │
│                                           │                                  │
│                                           ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    6-LAYER AI ASSESSMENT ENGINE                       │   │
│  │                                                                       │   │
│  │  Layer 1: Facility-Specific Data (from interview)                    │   │
│  │  Layer 2: Methodology Framework (ASIS GDL-RA)                        │   │
│  │  Layer 3: Industry Standards (TAPA, SOC 2, etc.)                     │   │
│  │  Layer 4: Threat Intelligence (CAP Index, CargoNet)                  │   │
│  │  Layer 5: Control Effectiveness (evidence-based data)                │   │
│  │  Layer 6: Scoring Rubrics (eliminates subjectivity)                  │   │
│  │                                                                       │   │
│  │  OUTPUTS:                                                             │   │
│  │  ├─ Risk scenarios with evidence chains                              │   │
│  │  ├─ T×V×I scores with rubric citations                               │   │
│  │  ├─ Control recommendations with rationale                           │   │
│  │  ├─ Narrative justifications (MacQuarrie-grade)                      │   │
│  │  └─ Audit trail for every score                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                           │                                  │
│                                           ▼                                  │
│  ┌────────────────────────┐    ┌────────────────────────┐                   │
│  │   DASHBOARD DISPLAY    │<───│     PDF REPORTS        │                   │
│  │  (AI-Generated Data)   │    │  (Full Narratives)     │                   │
│  └────────────────────────┘    └────────────────────────┘                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### What This Means for Each Component

#### Mappers (ep-interview-mapper.ts, office-interview-mapper.ts, etc.)

**OLD ROLE (Remove):**
- Generate scenario arrays
- Calculate T, V, I, E scores
- Compute inherent risk
- Determine risk levels
- Build control recommendations

**NEW ROLE (Data Preparation Only):**
- Validate interview completion
- Convert answers to structured typed objects
- Inject section metadata
- Inject principal/facility attributes
- Format attachments to URLs
- Pass normalized structure to AI Engine

**Mapper NO LONGER computes:** T, V, I, E, T×V×I, T×V×I×E, risk levels, scenarios

#### AI Assessment Service (ai-risk-assessment-v2.ts)

**ROLE (Sole Risk Engine):**
- Receives structured data from mapper
- Creates all risk scenarios
- Extracts qualitative signals
- Maps to 6 risk dimensions
- Applies template-specific weighting
- Computes ordinal scores (1-5)
- Generates narrative justification
- Assigns baseline controls
- Produces gap inventory
- Computes priority matrix
- Generates investment summary

---

## Part 3: Corrected Section 2.3 — EP Mapper Requirements

This replaces the old Section 2.3 in `RiskFixer-EP-Template-Implementation-Plan.md`:

### 2.3 EP Mapper Requirements (Aligned with 6-Layer AI Logic)

#### 2.3.1 Mapper Role: Data Preparation Only

The EP mapper MUST:

```typescript
interface EPMapperOutput {
  // Validation
  validationStatus: {
    isComplete: boolean;
    answeredQuestions: number;
    totalQuestions: number;
    missingRequired: string[];
  };
  
  // Structured Interview Data
  interviewData: {
    responses: Record<string, any>;
    completedAt: string;
    interviewerNotes?: string;
  };
  
  // Section Metadata
  sectionSummaries: {
    sectionId: string;
    sectionName: string;
    questionCount: number;
    riskSignals: string[];  // Qualitative signals only, no scores
  }[];
  
  // Principal Attributes (EP-specific)
  principalProfile: {
    publicExposureLevel: string;
    netWorthRange: string;
    industryCategory: string;
    familyComposition: string[];
    travelFrequency: string;
  };
  
  // Contextual Tags
  contextTags: {
    hasActiveThreat: boolean;
    hasKnownAdversary: boolean;
    hasFamilyConcerns: boolean;
    hasDigitalExposure: boolean;
    hasInternationalTravel: boolean;
    hasPredictablePatterns: boolean;
  };
  
  // Attachments (if any)
  attachments: {
    type: 'photo' | 'document' | 'floor_plan';
    url: string;
    analysisNotes?: string;
  }[];
}
```

#### 2.3.2 Scenario Generation MUST Be Done by AI

The AI engine (not the mapper) performs:

| Function | AI Engine Responsibility |
|----------|--------------------------|
| Scenario Creation | Creates 12 EP-specific threat scenarios |
| Signal Extraction | Extracts qualitative signals from answers |
| Dimensional Mapping | Maps signals to 6 risk dimensions |
| EP Weighting | Applies person-centric weighting (pattern predictability, digital exposure) |
| Ordinal Scoring | Computes 1-5 scores with evidence citations |
| Narrative Generation | Writes MacQuarrie-grade justifications |
| Control Assignment | Assigns baseline controls from Layer 5 |
| Gap Inventory | Identifies control gaps with severity |
| Priority Matrix | Ranks recommendations by urgency × impact |
| Investment Summary | Generates budget estimates with ROI rationale |

#### 2.3.3 Functions to REMOVE from Mapper

```typescript
// ❌ DELETE THESE FUNCTIONS FROM ep-interview-mapper.ts
export function calculateThreatLikelihood() { /* REMOVE */ }
export function calculateVulnerability() { /* REMOVE */ }
export function calculateImpact() { /* REMOVE */ }
export function calculateExposureFactor() { /* REMOVE */ }
export function classifyRiskLevel() { /* REMOVE */ }
export function generateEPRiskScenarios() { /* REMOVE - AI does this */ }

// ❌ DELETE THESE CONSTANTS
export const EP_THREATS = [ /* REMOVE - AI generates from prompt */ ];
```

#### 2.3.4 Functions to ADD to Mapper

```typescript
// ✅ ADD THESE FUNCTIONS
export function validateInterviewCompletion(responses: Record<string, any>): ValidationResult { /* ... */ }
export function normalizeInterviewData(responses: Record<string, any>): NormalizedInterviewData { /* ... */ }
export function extractPrincipalProfile(responses: Record<string, any>): PrincipalProfile { /* ... */ }
export function buildContextTags(responses: Record<string, any>): ContextTags { /* ... */ }
export function prepareForAIEngine(responses: Record<string, any>): EPMapperOutput { /* ... */ }
```

---

## Part 4: Files That Must Be Updated

### Priority 0 (Critical Path)

| File | Current State | Required Changes |
|------|---------------|------------------|
| `ep-interview-mapper.ts` | 1,573 lines, generates scenarios + calculates T×V×I×E | **Rewrite entirely.** Remove all scoring. Convert to data preparation only. ~300-400 lines. |
| `ep-ai-risk-assessment.ts` | 1,066 lines, AI + algorithmic fallback | **Keep AI logic. Remove algorithmic fallback imports from mapper.** Ensure it's the sole risk engine. |
| `routes.ts` (EP routes) | Calls mapper's `generateEPRiskScenarios` | **Update** `/generate-risks` to call AI engine directly with mapper's prepared data. |

### Priority 1 (Must Fix Before Launch)

| File | Current State | Required Changes |
|------|---------------|------------------|
| `ai-risk-assessment-v2.ts` | Unified AI service, supports EP | Verify EP template handling. This should be the canonical risk engine. |
| `ep-route-integration-guide.ts` | References legacy mapper functions | **Update** all endpoint definitions to use AI-first flow. |
| `ep-controls-seed.sql` | 48 controls seeded | Keep as-is (Layer 5 data). |
| `ep-interview-questionnaire.ts` | 1,735 lines | Keep as-is (Layer 1 data). |

### Priority 2 (Frontend/UI)

| File | Current State | Required Changes |
|------|---------------|------------------|
| Frontend risk display | Expects hardcoded scenario arrays | **Update** to display AI-generated narratives, evidence chains, confidence levels. |
| Frontend scoring UI | Shows legacy T×V×I breakdown | **Update** to show 6-dimension risk view. |
| Dashboard | No AI narrative display | **Add** AI justification panels. |

### Priority 3 (Reports)

| File | Current State | Required Changes |
|------|---------------|------------------|
| PDF template | Uses legacy risk data | **Update** to include AI narratives, evidence trails, gap inventory. |
| Executive summary | Static text | **Replace** with AI-generated executive summary. |

---

## Part 5: Applying This to ALL Templates

The same pattern applies to all facility types. Here's the universal mapper contract:

### Universal Mapper Interface

```typescript
interface TemplateMapperOutput {
  // Universal fields
  templateType: 'office_building' | 'retail_store' | 'warehouse' | 'datacenter' | 'manufacturing' | 'executive_protection';
  
  validationStatus: {
    isComplete: boolean;
    completionPercentage: number;
    missingRequired: string[];
  };
  
  interviewData: {
    responses: Record<string, any>;
    completedAt: string;
    version: string;
  };
  
  // Template-specific profiles
  facilityProfile?: FacilityProfile;      // For facility templates
  principalProfile?: PrincipalProfile;    // For EP template
  
  // Qualitative signals (no scores)
  riskSignals: {
    category: string;
    signal: string;
    sourceQuestionId: string;
    severity: 'indicator' | 'concern' | 'critical_indicator';
  }[];
  
  // Context for AI
  contextTags: Record<string, boolean>;
  
  // Attachments
  attachments: Attachment[];
}
```

### Template-Specific Differences

| Template | Profile Type | Key Dimensions | Weighting Focus |
|----------|--------------|----------------|-----------------|
| Office Building | FacilityProfile | Access control, visitor mgmt, after-hours | Employee count, public access |
| Retail Store | FacilityProfile | Shrinkage, cash handling, customer flow | Transaction volume, ORC exposure |
| Warehouse | FacilityProfile | Dock security, inventory, cargo | Asset value, TAPA compliance |
| Datacenter | FacilityProfile | Logical-physical convergence, redundancy | Uptime tier, compliance requirements |
| Manufacturing | FacilityProfile | Process security, IP protection, safety | Hazmat, supply chain |
| **Executive Protection** | **PrincipalProfile** | **Pattern predictability, digital exposure, family** | **Person-centric, not facility-centric** |

---

## Part 6: Validation Criteria

### Definition of Done for Mapper Rewrite

A mapper is correctly converted when:

1. **No T×V×I calculations exist in the mapper file**
2. **No scenario generation exists in the mapper file**
3. **All risk scoring happens in AI engine**
4. **Mapper exports only data preparation functions**
5. **Route calls AI engine after mapper prepares data**
6. **Frontend displays AI-generated content**
7. **PDF reports include AI narratives and evidence trails**

### Test Cases

```typescript
// Test 1: Mapper produces no scores
const mapperOutput = prepareForAIEngine(interviewResponses);
expect(mapperOutput.threatLikelihood).toBeUndefined();
expect(mapperOutput.vulnerability).toBeUndefined();
expect(mapperOutput.inherentRisk).toBeUndefined();
expect(mapperOutput.riskLevel).toBeUndefined();

// Test 2: AI engine produces scores
const aiOutput = await assessThreat(mapperOutput, 'kidnapping_abduction');
expect(aiOutput.threatLikelihood.score).toBeBetween(1, 5);
expect(aiOutput.threatLikelihood.evidence.length).toBeGreaterThan(0);
expect(aiOutput.threatLikelihood.reasoning).toBeTruthy();

// Test 3: Evidence chain is complete
expect(aiOutput.evidenceTrail.length).toBeGreaterThanOrEqual(3);
expect(aiOutput.scenarioDescription.length).toBeGreaterThan(200);

// Test 4: Confidence is reported
expect(['high', 'medium', 'low']).toContain(aiOutput.confidence);
```

---

## Part 7: Implementation Order

### Week 1: EP Template Conversion

**Day 1-2: Mapper Rewrite**
1. Create new `ep-interview-mapper-v2.ts` with data-prep-only functions
2. Write tests for new mapper
3. Keep old mapper for reference (rename to `.backup`)

**Day 2-3: Route Updates**
1. Update `/generate-risks` to call AI engine
2. Update `/calculate-exposure` (deprecated or reimplemented in AI)
3. Add new `/ai-assessment` endpoint
4. Test with real interview data

**Day 3-4: Frontend Updates**
1. Update risk display to show AI narratives
2. Add confidence indicators
3. Add evidence panels

**Day 4-5: PDF Report Integration**
1. Update PDF template to pull AI data
2. Include executive summary (AI-generated)
3. Include evidence trails
4. Test full flow

### Week 2-3: Apply to Other Templates

Apply the same pattern to:
1. Office Building (already has 900-line mapper — simplify to ~300 lines)
2. Retail Store
3. Warehouse
4. Datacenter
5. Manufacturing

---

## Part 8: Engineering Instructions for Replit Agents

### Task: Rewrite ep-interview-mapper.ts

**Step 1: Read the current file**
```bash
cat /mnt/project/ep-interview-mapper.ts
```

**Step 2: Identify functions to REMOVE**
- `calculateThreatLikelihood()`
- `calculateVulnerability()`
- `calculateImpact()`
- `calculateExposureFactor()`
- `classifyRiskLevel()`
- `generateEPRiskScenarios()`
- `EP_THREATS` constant
- Any function that produces a numeric score

**Step 3: Create new file with data-prep functions only**
- `validateInterviewCompletion()`
- `normalizeInterviewData()`
- `extractPrincipalProfile()`
- `buildContextTags()`
- `extractRiskSignals()` — qualitative signals, NOT scores
- `prepareForAIEngine()`

**Step 4: Update routes.ts**
```typescript
// OLD (remove)
import { generateEPRiskScenarios } from './services/ep-interview-mapper';
const scenarios = await generateEPRiskScenarios(assessmentId, responses);

// NEW (add)
import { prepareForAIEngine } from './services/ep-interview-mapper-v2';
import { assessAllThreats } from './services/ai/ep-ai-risk-assessment';

const preparedData = prepareForAIEngine(responses);
const aiResults = await assessAllThreats(assessmentId, preparedData);
```

**Step 5: Verify no legacy calculations remain**
```bash
grep -n "threatLikelihood\s*=" server/services/ep-interview-mapper-v2.ts
grep -n "vulnerability\s*=" server/services/ep-interview-mapper-v2.ts
grep -n "impact\s*=" server/services/ep-interview-mapper-v2.ts
grep -n "inherentRisk\s*=" server/services/ep-interview-mapper-v2.ts
# All should return 0 results
```

---

## Appendix A: Quick Reference

### What Mappers DO (Data Prep)
- ✅ Validate completion
- ✅ Normalize responses
- ✅ Extract profiles
- ✅ Build context tags
- ✅ Identify qualitative signals
- ✅ Format for AI consumption

### What Mappers DO NOT (AI Engine Does)
- ❌ Calculate T scores
- ❌ Calculate V scores
- ❌ Calculate I scores
- ❌ Calculate E scores
- ❌ Compute T×V×I or T×V×I×E
- ❌ Generate scenarios
- ❌ Classify risk levels
- ❌ Select controls
- ❌ Write narratives

### The Single Risk Engine
- `ai-risk-assessment-v2.ts` — The ONE place all risk calculations happen
- Supports all 6 templates
- Produces MacQuarrie-grade output
- Includes evidence chains
- Audit-defensible

---

## Appendix B: Contact & Authority

**Project Owner:** Nicole (CEO, RiskFixer LLC)  
**Architectural Authority:** This document  
**Master Framework:** `/mnt/project/RiskFixer-Master-Framework-v2_1.md`  
**AI Framework:** `/mnt/project/RiskFixer-AI-Assessment-Framework-v1_0.md`

This document represents the authoritative engineering decision. All development work must align with this architecture.

---

**END OF DOCUMENT**
