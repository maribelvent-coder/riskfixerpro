# RiskFixer AI Assessment Framework
## Grounded AI-Powered Physical Security Risk Assessment

**Version:** 1.0  
**Last Updated:** December 6, 2025  
**Status:** Authoritative Specification  
**Owner:** RiskFixer Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Principles](#2-core-principles)
3. [The 6-Layer Context Library](#3-the-6-layer-context-library)
4. [Template Coverage Matrix](#4-template-coverage-matrix)
5. [3-Phase Build Order](#5-3-phase-build-order)
6. [Scoring Rubrics](#6-scoring-rubrics)
7. [AI Integration Architecture](#7-ai-integration-architecture)
8. [Implementation Requirements](#8-implementation-requirements)
9. [Quality Gates](#9-quality-gates)
10. [Appendix: File Structure](#10-appendix-file-structure)

---

## 1. Executive Summary

### Purpose

The RiskFixer AI Assessment Framework defines how artificial intelligence is integrated into physical security risk assessments. The framework ensures AI outputs are **grounded in authoritative sources** rather than hallucinated, producing audit-defensible assessments that comply with ASIS International standards.

### Key Innovation

Unlike generic AI chatbots that guess at security recommendations, RiskFixer's AI operates within a **6-layer context library** that provides:

- Facility-specific data from structured interviews
- Methodology compliance with ASIS GDL-RA
- Industry-specific standards (TAPA, SOC 2, NRF, etc.)
- Real threat intelligence (CAP Index, CargoNet, etc.)
- Evidence-based control effectiveness data
- Standardized scoring rubrics that eliminate subjectivity

### The Formula

```
Grounded AI Assessment = 
    Facility Data (Layer 1) +
    Methodology Framework (Layer 2) +
    Industry Standards (Layer 3) +
    Threat Intelligence (Layer 4) +
    Control Effectiveness (Layer 5) +
    Scoring Rubrics (Layer 6)
```

---

## 2. Core Principles

### 2.1 Evidence-Based Assessment

Every AI-generated score MUST cite specific evidence:
- Interview response references
- Photo analysis observations
- Threat intelligence data points
- Control gap identifications

**Prohibited:** Scores based on assumptions, generalizations, or "common knowledge."

### 2.2 Methodology Compliance

All assessments follow the ASIS GDL-RA (General Security Risk Assessment Guideline) framework:

```
Risk = Threat × Vulnerability × Impact (T×V×I)

Where:
- T (Threat Likelihood): 1-5 scale, probability of attack attempt
- V (Vulnerability): 1-5 scale, degree controls fail to prevent/detect
- I (Impact): 1-5 scale, consequence severity if attack succeeds
- Inherent Risk: T × V × I = 1-125 scale
```

### 2.3 Template Specificity

Each facility type (template) requires:
- Template-specific interview questions
- Template-specific threat library
- Template-specific industry standards
- Template-specific control mappings
- Template-adapted scoring criteria

**Prohibited:** Generic calculators applied across all templates.

### 2.4 Sophistication Parity

All templates must achieve equivalent depth:
- If Office has 900-line interview→risk mapper
- Then Retail/Warehouse/Datacenter/Manufacturing need 300-500 lines each
- 30-line generic functions are **framework violations**

### 2.5 Auditability

Assessment reasoning must be clear enough that:
- Another CPP reviewing would reach the same conclusion
- Budget committees can trace recommendations to evidence
- Legal/compliance can verify methodology adherence

---

## 3. The 6-Layer Context Library

The AI Context Library is everything the AI receives when generating an assessment. Each layer serves a distinct purpose and must be populated before AI can produce valid outputs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI ASSESSMENT CONTEXT LIBRARY                        │
│                    (Everything the AI receives in its prompt)                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: FACILITY-SPECIFIC DATA                                    │   │
│  │  Source: This assessment's interview + photos + client data         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: METHODOLOGY FRAMEWORK                                     │   │
│  │  Source: ASIS GDL-RA, T×V×I formulas, classification thresholds     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: INDUSTRY-SPECIFIC STANDARDS                               │   │
│  │  Source: NRF, TAPA, SOC 2, ISO 27001, NIST, CFATS (per template)    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: THREAT INTELLIGENCE                                       │   │
│  │  Source: CAP Index, FBI UCR, CargoNet, NRF surveys, OSINT           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: CONTROL EFFECTIVENESS DATA                                │   │
│  │  Source: ASIS research, academic studies, insurance data, ROI data  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 6: SCORING RUBRICS                                           │   │
│  │  Source: Standardized T/V/I criteria with evidence requirements     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer 1: Facility-Specific Data

**Purpose:** Ground the AI in THIS facility's actual conditions.

**Data Sources:**
| Data Type | Collection Method | Update Frequency |
|-----------|-------------------|------------------|
| Interview responses | 60-80+ structured questions | Per assessment |
| Photo analysis | GPT-4 Vision observations | Per assessment |
| Incident history | Client-provided records | Per assessment |
| Control inventory | Interview + observation | Per assessment |
| Geographic data | Address, CAP Index lookup | Per assessment |
| Operational profile | Hours, employees, assets | Per assessment |

**Deliverable per Template:**
```
server/data/{template}-interview-questionnaire.ts
├── 60-80+ questions with:
│   ├── informsThreat: string[]      // Which threats this question affects
│   ├── informsVulnerability: boolean
│   ├── informsImpact: boolean
│   └── suggestsControls: string[]   // Control gaps this might reveal
```

---

### Layer 2: Methodology Framework

**Purpose:** Ensure calculation consistency and ASIS compliance.

**Components:**
| Component | Description | Location |
|-----------|-------------|----------|
| T×V×I Formula | Core risk calculation engine | Master Framework |
| Risk Classification | 1-125 scale thresholds | Master Framework |
| Control Effectiveness | Compound reduction formula | Master Framework |
| Residual Risk | Inherent × (1 - ControlEffectiveness) | Master Framework |

**This layer is SHARED across all templates.**

**Classification Thresholds:**
```
Score Range    Classification    Action Required
─────────────────────────────────────────────────
1-10           Low               Monitor
11-25          Medium            Address within 90 days
26-63          High              Address within 30 days
64-125         Critical          Immediate action required
```

---

### Layer 3: Industry-Specific Standards

**Purpose:** Ground recommendations in authoritative industry requirements.

**Standards by Template:**

| Template | Primary Standards | Secondary Standards |
|----------|-------------------|---------------------|
| **Office Building** | ASIS PSC.1-2012, ASIS GDL-RA | CPTED, NFPA 730 |
| **Retail Store** | NRF Loss Prevention, ASIS Retail Council | ORC indicators, PCI-DSS |
| **Warehouse** | TAPA FSR, TAPA TSR, C-TPAT | CargoNet categories, OSHA |
| **Datacenter** | SOC 2 Type II, ISO 27001 Annex A.11 | PCI-DSS Section 9, TIA-942 |
| **Manufacturing** | NIST SP 800-82, CFATS | ITAR, DTSA, OSHA PSM |

**Deliverable per Template:**
```
server/prompts/{template}-standards.ts
├── STANDARDS_CONTEXT: string        // Embedded in AI system prompt
├── CONTROL_REQUIREMENTS: object     // Standard → required controls
└── COMPLIANCE_CHECKLIST: object     // Audit verification items
```

---

### Layer 4: Threat Intelligence

**Purpose:** Ground threat likelihood in real-world data.

**Data Sources by Template:**

| Template | Location Data | Industry Data | Update Frequency |
|----------|---------------|---------------|------------------|
| **All** | CAP Index scores | FBI UCR | Per assessment / Annual |
| **Retail** | CAP Index | NRF Shrinkage Survey, RLPSA | Annual |
| **Warehouse** | CAP Index | CargoNet statistics, TAPA TISC | Quarterly |
| **Datacenter** | CAP Index | Uptime Institute | Annual |
| **Manufacturing** | CAP Index | OSHA injury data | Annual |

**Deliverable per Template:**
```
server/threat-intel/{template}-intel.ts
├── getLocationThreatData(address): Promise<LocationIntel>
├── getIndustryBenchmarks(subType): IndustryBenchmarks
└── getThreatIndicators(responses): ThreatIndicators
```

---

### Layer 5: Control Effectiveness Data

**Purpose:** Ground recommendations in evidence of what actually works.

**Data Sources:**
| Source | Content | Reliability |
|--------|---------|-------------|
| ASIS Foundation Research | Control ROI studies | High |
| Loss Prevention Research Council | Retail control effectiveness | High |
| TAPA TISC Reports | Cargo security statistics | High |
| Insurance loss data | Control correlation with losses | Medium-High |
| Academic studies | Peer-reviewed security research | High |
| RiskFixer historical | Assessment outcome tracking | Growing |

**Deliverable per Template:**
```
server/control-effectiveness/{template}-controls.ts
├── CONTROL_EFFECTIVENESS: Record<string, {
│   baseEffectiveness: number,      // 0-1 scale
│   source: string,                 // Citation
│   conditions: string,             // When this applies
│   enhancedBy: string[],           // Synergistic controls
│   diminishedBy: string[]          // Conflicting conditions
│ }>
```

---

### Layer 6: Scoring Rubrics

**Purpose:** Eliminate subjectivity by anchoring scores to specific criteria.

**Universal Rubric Structure:**
```
Score    Label           Evidence Required
──────────────────────────────────────────────────────────────────
1        Rare/Minimal    Specific evidence of absence of risk factors
2        Unlikely/Low    Specific evidence of limited risk factors
3        Possible/Mod    Balanced evidence, no clear direction
4        Likely/High     Specific evidence of elevated risk factors
5        Certain/Crit    Specific evidence of maximum risk factors
```

**Template Adaptation Required:**
Each template adapts the rubric with industry-specific criteria.

**Deliverable per Template:**
```
server/scoring-rubrics/{template}-rubrics.ts
├── THREAT_LIKELIHOOD_RUBRIC: RubricDefinition
├── VULNERABILITY_RUBRIC: RubricDefinition
├── IMPACT_RUBRIC: RubricDefinition
└── getEvidenceRequirements(threatId, score): string[]
```

---

## 4. Template Coverage Matrix

### Build Status Overview

```
                           TEMPLATES (5 Schemas)
                    ┌─────────────────────────────────────────────────────┐
                    │  Office  │  Retail  │ Warehouse│Datacenter│  Mfg   │
┌───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ L1: Interview Q's │    ✅    │    📋    │    📋    │    ❌    │   ❌   │
│     (per template)│  80 Q's  │  70 Q's  │  55 Q's  │  65 Q's  │ 60 Q's │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ L2: Methodology   │    ✅    │    ✅    │    ✅    │    ✅    │   ✅   │
│     (shared)      │          SHARED - BUILD ONCE                       │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ L3: Industry Stds │  ASIS    │   NRF    │   TAPA   │   SOC2   │  NIST  │
│                   │    ✅    │    ❌    │    ❌    │    ❌    │   ❌   │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ L4: Threat Intel  │ CAP+UCR  │ CAP+NRF  │ CargoNet │ CAP+UCR  │CAP+OSHA│
│                   │    ✅    │    ❌    │    ❌    │    ❌    │   ❌   │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ L5: Control Eff.  │  ASIS    │   LP     │   TAPA   │  Uptime  │ Safety │
│                   │    ✅    │    ❌    │    ❌    │    ❌    │   ❌   │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ L6: Scoring       │    ✅    │    ❌    │    ❌    │    ❌    │   ❌   │
│     Rubrics       │  Done    │  Adapt   │  Adapt   │  Adapt   │ Adapt  │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ Interview→Risk    │    ✅    │    ❌    │    ❌    │    ❌    │   ❌   │
│ Mapper (300-900L) │ 900 lines│ 300-500L │ 300-500L │ 300-500L │300-500L│
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ AI Assessment Svc │    ❌    │    —     │    —     │    —     │   —    │
│     (shared)      │          SHARED - BUILD ONCE                       │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ PDF Report        │    ✅    │    ❌    │    ❌    │    ❌    │   ❌   │
│     Template      │          │          │          │          │        │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ AI Narrative Gen  │    ❌    │    —     │    —     │    —     │   —    │
│     (shared)      │          SHARED - BUILD ONCE                       │
└───────────────────┴──────────┴──────────┴──────────┴──────────┴────────┘

Legend: ✅ Complete   📋 Framework Doc Exists   ❌ Needs Build   — Shared Component
```

### Effort Estimates by Template

| Template | Layers Remaining | Effort Estimate |
|----------|------------------|-----------------|
| Office Building | 2 (AI Service, Narrative) | 4-5 days |
| Retail Store | 8 | 12-15 days |
| Warehouse | 8 | 12-15 days |
| Datacenter | 9 | 15-18 days |
| Manufacturing | 9 | 15-18 days |

---

## 5. 3-Phase Build Order

The framework MUST be built in this sequence because later phases depend on earlier phases.

### Phase 1: Data Foundation

**What:** Build the raw data layers that Intelligence depends on.

**Includes:**
- Layer 1: Interview questions with risk mappings (per template)
- Layer 2: Methodology framework (shared, already exists)
- Layer 6: Scoring rubrics (per template)

**Dependency:** None — this is the foundation.

```
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 1: DATA FOUNDATION                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Layer 1: Interview Questions (Per Template)              │ │
│  │ ┌────────┬────────┬────────┬────────┬────────┐          │ │
│  │ │ Office │ Retail │Warehouse│  DC   │  Mfg   │          │ │
│  │ │ 80 Q's │ 70 Q's │ 55 Q's │ 65 Q's│ 60 Q's │          │ │
│  │ └────────┴────────┴────────┴────────┴────────┘          │ │
│  │ Deliverable: {template}-interview-questionnaire.ts       │ │
│  │ Effort: 2-3 days per template                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Layer 2: Methodology Framework (Shared)                  │ │
│  │ T×V×I Engine | Risk Classification | Control Formulas    │ │
│  │ Status: EXISTS in Master Framework                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Layer 6: Scoring Rubrics (Per Template)                  │ │
│  │ T/V/I criteria adapted to industry-specific evidence     │ │
│  │ Deliverable: {template}-rubrics.ts                       │ │
│  │ Effort: 1 day per template                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ Phase 1 Total: 3-4 days per template (can parallelize)        │
└────────────────────────────────────────────────────────────────┘
```

---

### Phase 2: Intelligence Layer

**What:** Build the processing logic that transforms data into insights.

**Includes:**
- Layer 3: Industry standards (per template)
- Layer 4: Threat intelligence integration (per template)
- Layer 5: Control effectiveness data (per template)
- Interview→Risk Mappers (per template) — THE CRITICAL 300-900 LINE COMPONENTS
- AI Assessment Service (shared)

**Dependency:** Requires Phase 1 complete.

```
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 2: INTELLIGENCE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ⚠️  INTERVIEW → RISK MAPPERS (Per Template)              │ │
│  │     THIS IS THE 900-LINE GAP                             │ │
│  │ ┌────────┬────────┬────────┬────────┬────────┐          │ │
│  │ │ Office │ Retail │Warehouse│  DC   │  Mfg   │          │ │
│  │ │ 900 L  │300-500L│300-500L│300-500L│300-500L│          │ │
│  │ │   ✅   │   ❌   │   ❌   │   ❌   │   ❌   │          │ │
│  │ └────────┴────────┴────────┴────────┴────────┘          │ │
│  │                                                          │ │
│  │ Contains:                                                │ │
│  │ • calculateThreatLikelihoodFromInterview(responses, id)  │ │
│  │ • calculateVulnerabilityFromInterview(responses, id)     │ │
│  │ • calculateImpactFromInterview(responses, id)            │ │
│  │ • generateControlRecommendations(responses, id)          │ │
│  │                                                          │ │
│  │ Effort: 3-5 days per template                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Layer 3: Industry Standards (Per Template)               │ │
│  │ System prompts with authoritative standard references    │ │
│  │ Effort: 1-2 days per template                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Layer 4: Threat Intelligence (Per Template)              │ │
│  │ CAP Index integration + industry-specific data           │ │
│  │ Effort: 1-2 days per template                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Layer 5: Control Effectiveness (Per Template)            │ │
│  │ Research-backed effectiveness percentages                │ │
│  │ Effort: 2-3 days per template                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ AI Assessment Service (Shared)                           │ │
│  │ Grounded prompts + context builder + response parser     │ │
│  │ Effort: 3-4 days (after all template layers complete)    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ Phase 2 Total: 10-15 days per template                        │
└────────────────────────────────────────────────────────────────┘
```

---

### Phase 3: Presentation Layer

**What:** Build the output generation that consumes Intelligence outputs.

**Includes:**
- PDF Report Templates (per template)
- AI Narrative Generation (shared)
- Client Dashboard (Phase 2 product feature)

**Dependency:** Requires Phase 2 complete.

```
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 3: PRESENTATION                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ PDF Report Generation (Per Template)                     │ │
│  │ Professional report with all assessment data             │ │
│  │ Deliverable: report-templates/{template}-report.tsx      │ │
│  │ Effort: 2-3 days per template                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ AI Narrative Generation (Shared)                         │ │
│  │ Executive Summary | Risk Landscape | Recommendations     │ │
│  │ Deliverable: ai-narrative-generation.ts                  │ │
│  │ Effort: 2-3 days                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ Phase 3 Total: 4-6 days per template                          │
└────────────────────────────────────────────────────────────────┘
```

---

### Dependency Graph

```
                    ┌─────────────────────────────────────┐
                    │     PHASE 1: DATA FOUNDATION        │
                    └─────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ L1: Interview   │        │ L2: Methodology │        │ L6: Scoring     │
│ Questions       │        │ Framework       │        │ Rubrics         │
│ (per template)  │        │ (shared)        │        │ (per template)  │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                                    │ DEPENDS ON
                                    ▼
                    ┌───────────────────────────────┐
                    │    PHASE 2: INTELLIGENCE      │
                    └───────────────────────────────┘
                                    │
    ┌───────────────┬───────────────┼───────────────┬───────────────┐
    ▼               ▼               ▼               ▼               ▼
┌───────┐     ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
│ L3:   │     │ L4:       │   │ L5:       │   │ Interview │   │ AI        │
│Industry│    │ Threat    │   │ Control   │   │ → Risk    │   │Assessment │
│Stds   │     │ Intel     │   │ Effect.   │   │ Mapper    │   │ Service   │
└───┬───┘     └─────┬─────┘   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
    │               │               │               │               │
    └───────────────┴───────────────┴───────────────┴───────────────┘
                                    │
                                    │ ALL MUST COMPLETE BEFORE
                                    ▼
                    ┌───────────────────────────────┐
                    │    PHASE 3: PRESENTATION      │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
             ┌───────────┐   ┌───────────┐   ┌───────────┐
             │ PDF       │   │ AI        │   │ Dashboard │
             │ Reports   │   │ Narrative │   │ (Phase 2) │
             └───────────┘   └───────────┘   └───────────┘
```

---

## 6. Scoring Rubrics

### 6.1 Threat Likelihood Rubric (Universal)

| Score | Label | Criteria | Evidence Required |
|-------|-------|----------|-------------------|
| 1 | Rare | No incidents at this location or similar facilities in region in 5+ years. No known threat actor interest. Threat requires specialized capability not commonly available. | Incident history review, threat actor analysis, capability assessment |
| 2 | Unlikely | Isolated incidents at similar facilities in region. Low target attractiveness. Threat actors present but not focused on this sector. | Regional incident data, target profile analysis |
| 3 | Possible | Periodic incidents at similar facilities (1-2 per year regionally). Moderate target profile. General threat actor interest in sector. | Industry incident rates, target assessment |
| 4 | Likely | Regular incidents at similar facilities (quarterly+). Known threat actor interest in this target profile. Recent attempts. | Specific threat intelligence, recent incident data |
| 5 | Almost Certain | Recent incidents at this specific location or immediate area. Active threat actor targeting. Multiple incidents annually. | Location-specific incidents, confirmed targeting |

### 6.2 Vulnerability Rubric (Universal)

| Score | Label | Criteria | Evidence Required |
|-------|-------|----------|-------------------|
| 1 | Minimal | Controls exceed industry standards (ASIS/TAPA/ISO). Multiple layers of defense. Recent testing confirmed effectiveness. No gaps identified. | Standards compliance documentation, test results |
| 2 | Low | Controls meet industry standards. Minor gaps that don't create exploitable attack paths. Compensating controls in place. | Gap analysis, compensating control documentation |
| 3 | Moderate | Some controls present but notable gaps exist. Single points of failure identified. Controls not recently tested. | Control inventory, gap identification |
| 4 | High | Significant control gaps. Multiple exploitable weaknesses. Controls below industry standards. Easy reconnaissance possible. | Specific gap documentation, standards comparison |
| 5 | Critical | Controls absent or demonstrably ineffective. Attack path requires minimal effort. No detection capability. | Observed/documented control failures |

### 6.3 Impact Rubric (Universal)

| Score | Label | Financial | Safety | Operational | Regulatory | Reputational |
|-------|-------|-----------|--------|-------------|------------|--------------|
| 1 | Negligible | < $10K | No injuries | Hours disruption | None | Local only |
| 2 | Minor | $10-50K | First aid | < 1 day | Minor finding | Brief mention |
| 3 | Moderate | $50-250K | Medical treatment | 1-7 days | Investigation | Regional media |
| 4 | Significant | $250K-1M | Hospitalization | 1-4 weeks | Fines/sanctions | National media |
| 5 | Severe | > $1M | Fatalities possible | > 1 month | License revocation | Existential threat |

### 6.4 Template-Specific Adaptations

Each template MUST adapt these rubrics with industry-specific criteria. Examples:

**Retail — Threat Likelihood Level 4:**
- Shrinkage rate > 2.5%
- CAP Index theft score > 175
- Known ORC activity in metro area
- Store type targeted by organized groups

**Warehouse — Vulnerability Level 3:**
- Dock doors not controlled during receiving
- No trailer seal verification program
- GPS tracking on < 50% of trailers
- Driver verification is informal

**Datacenter — Impact Level 5:**
- Customer SLA violations > $1M
- SOC 2 qualification at risk
- Multi-tenant customer data exposure
- Business continuity failure

---

## 7. AI Integration Architecture

### 7.1 System Prompt Structure

The AI system prompt grounds all assessments in methodology:

```typescript
function getSystemPrompt(templateType: string): string {
  return `
You are a certified physical security professional (CPP) conducting a formal 
risk assessment following ASIS International standards. Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview 
   data, photos, or threat intelligence provided. Never assume facts not in evidence.

2. METHODOLOGY-COMPLIANT: Follow the ASIS GDL-RA framework using T×V×I where:
   - T (Threat) = Likelihood of threat actor attempting attack (1-5)
   - V (Vulnerability) = Degree to which controls fail to prevent/detect (1-5)
   - I (Impact) = Consequence severity if attack succeeds (1-5)

3. RUBRIC-ANCHORED: Use the exact scoring criteria provided.

4. STANDARD-REFERENCED: Cite specific standards when recommending controls.
   ${getTemplateStandards(templateType)}

5. CONSERVATIVE: When evidence is ambiguous, score toward higher risk.

6. AUDITABLE: Your reasoning must be clear enough that another CPP would 
   reach the same conclusion given the same evidence.

CRITICAL: If data is insufficient to assess a factor, state "INSUFFICIENT DATA" 
rather than guessing. Never hallucinate facts about the facility.
`;
}
```

### 7.2 User Prompt Structure

Each threat assessment request includes:

```
## ASSESSMENT REQUEST
Threat: [Name and ASIS Code]

## FACILITY PROFILE
[All Layer 1 data from interview]

## GEOGRAPHIC THREAT DATA
[All Layer 4 data from CAP Index, etc.]

## INCIDENT HISTORY
[Client-reported incidents]

## CURRENT SECURITY CONTROLS
[Control inventory with status]

## PHOTO ANALYSIS FINDINGS
[GPT-4 Vision observations]

## RELEVANT INTERVIEW RESPONSES
[Questions that inform this specific threat]

## REQUIRED OUTPUT
[JSON structure with scores, evidence, reasoning]
```

### 7.3 Response Validation

All AI responses MUST be validated for:

| Check | Requirement | Action if Failed |
|-------|-------------|------------------|
| JSON Structure | Valid JSON matching schema | Retry with clarification |
| Score Ranges | All scores 1-5 | Reject, request correction |
| Evidence Citations | Each score has evidence array | Reject, request evidence |
| Rubric Alignment | Reasoning matches score level | Flag for review |
| Standard References | Control recommendations cite standards | Add references |
| Data Gap Disclosure | Unknown factors identified | Include in report |

---

## 8. Implementation Requirements

### 8.1 File Structure

```
server/
├── services/
│   ├── risk-scenario-generator.ts       # Universal dispatcher
│   ├── ai-risk-assessment.ts            # AI integration service
│   └── {template}-interview-mapper.ts   # Per-template (300-900 lines each)
│
├── data/
│   └── {template}-interview-questionnaire.ts  # Per-template questions
│
├── threat-libraries/
│   ├── index.ts                         # Barrel export
│   └── {template}-threats.ts            # Per-template threat catalogs
│
├── threat-intel/
│   └── {template}-intel.ts              # Per-template data integration
│
├── control-effectiveness/
│   └── {template}-controls.ts           # Per-template effectiveness data
│
├── scoring-rubrics/
│   └── {template}-rubrics.ts            # Per-template adapted rubrics
│
├── prompts/
│   ├── system-prompt-base.ts            # Shared system prompt
│   └── {template}-standards.ts          # Per-template standard references
│
└── report-templates/
    └── {template}-report.tsx            # Per-template PDF generation
```

### 8.2 Minimum Lines of Code Requirements

| Component | Minimum LOC | Rationale |
|-----------|-------------|-----------|
| Interview Questionnaire | 400-600 | 60-80 questions with full metadata |
| Interview→Risk Mapper | 300-500 | Threat-specific calculation logic |
| Industry Standards Prompt | 150-250 | Comprehensive standard references |
| Threat Intelligence | 100-200 | Data integration + formatting |
| Control Effectiveness | 200-300 | 50+ controls with research data |
| Scoring Rubrics | 100-150 | Adapted criteria with evidence requirements |

**Total per template: 1,250-2,000 lines**

### 8.3 Quality Gates

Before marking any template "complete":

| Gate | Verification |
|------|--------------|
| **Question Coverage** | All 15 threats have ≥3 interview questions informing them |
| **Mapper Coverage** | All 15 threats have specific calculation logic |
| **Standards Citation** | All control recommendations cite authoritative standards |
| **Rubric Adaptation** | Scoring criteria include template-specific evidence |
| **AI Integration** | System prompt includes template-specific standards |
| **Report Generation** | PDF includes all assessment sections per Unified Template |

---

## 9. Quality Gates

### 9.1 Sophistication Parity Check

Before delivery, compare proposed solution to existing patterns:

```
IF proposed_solution.lines < 100
   AND existing_pattern.lines > 300
THEN
   STOP
   ESCALATE to CEO
   DISCLOSE: "Sophistication gap detected"
```

### 9.2 AI Integration Verification

```
IF requirement.includes("AI-powered")
   AND solution.uses_hardcoded_logic
THEN
   STOP
   DISCLOSE: "This is NOT AI-powered as requested"
   PRESENT OPTIONS: MVP hardcoded vs Production AI-enhanced
```

### 9.3 Mandatory Delivery Disclosure

Every delivery MUST include:

```
═══════════════════════════════════════════════════════════════════════
DELIVERY DISCLOSURE
═══════════════════════════════════════════════════════════════════════
What We Delivered: [exact functionality]
What We DID NOT Deliver: [gaps relative to framework]
Sophistication Comparison: Office=[X lines], This=[Y lines]
Classification: [ ] MVP/Basic  [ ] Production-Grade
AI Integration: [ ] Hardcoded  [ ] Interview-Driven  [ ] AI-Enhanced
Framework Compliance: Layer [1-6] status per template
═══════════════════════════════════════════════════════════════════════
CEO DECISION REQUIRED: [ ] Accept  [ ] Expand  [ ] Reject
═══════════════════════════════════════════════════════════════════════
```

---

## 10. Appendix: File Structure

### Complete Implementation Tree

```
server/
├── services/
│   ├── risk-scenario-generator.ts
│   ├── ai-risk-assessment.ts
│   ├── office-interview-mapper.ts         ✅ 900 lines
│   ├── retail-interview-mapper.ts         ❌ Needs build
│   ├── warehouse-interview-mapper.ts      ❌ Needs build
│   ├── datacenter-interview-mapper.ts     ❌ Needs build
│   └── manufacturing-interview-mapper.ts  ❌ Needs build
│
├── data/
│   ├── office-interview-questionnaire.ts  ✅ 80+ questions
│   ├── retail-interview-questionnaire.ts  📋 Framework exists
│   ├── warehouse-interview-questionnaire.ts 📋 Framework exists
│   ├── datacenter-interview-questionnaire.ts ❌ Needs build
│   └── manufacturing-interview-questionnaire.ts ❌ Needs build
│
├── threat-libraries/
│   ├── index.ts                           ✅
│   ├── office-threats.ts                  ✅ 15 threats
│   ├── retail-threats.ts                  ✅ 15 threats
│   ├── warehouse-threats.ts               ✅ 15 threats
│   ├── datacenter-threats.ts              ✅ 15 threats
│   └── manufacturing-threats.ts           ✅ 15 threats
│
├── threat-intel/
│   ├── cap-index-integration.ts           ❌ Needs build
│   ├── retail-intel.ts                    ❌ Needs build
│   ├── warehouse-intel.ts                 ❌ Needs build
│   ├── datacenter-intel.ts                ❌ Needs build
│   └── manufacturing-intel.ts             ❌ Needs build
│
├── control-effectiveness/
│   ├── office-controls.ts                 ✅
│   ├── retail-controls.ts                 ❌ Needs build
│   ├── warehouse-controls.ts              ❌ Needs build
│   ├── datacenter-controls.ts             ❌ Needs build
│   └── manufacturing-controls.ts          ❌ Needs build
│
├── scoring-rubrics/
│   ├── base-rubrics.ts                    ✅
│   ├── office-rubrics.ts                  ✅
│   ├── retail-rubrics.ts                  ❌ Needs build
│   ├── warehouse-rubrics.ts               ❌ Needs build
│   ├── datacenter-rubrics.ts              ❌ Needs build
│   └── manufacturing-rubrics.ts           ❌ Needs build
│
├── prompts/
│   ├── system-prompt-base.ts              ❌ Needs build
│   ├── office-standards.ts                ✅
│   ├── retail-standards.ts                ❌ Needs build
│   ├── warehouse-standards.ts             ❌ Needs build
│   ├── datacenter-standards.ts            ❌ Needs build
│   └── manufacturing-standards.ts         ❌ Needs build
│
└── report-templates/
    ├── unified-facility-report.tsx        ✅
    ├── office-report.tsx                  ✅
    ├── retail-report.tsx                  ❌ Needs build
    ├── warehouse-report.tsx               ❌ Needs build
    ├── datacenter-report.tsx              ❌ Needs build
    └── manufacturing-report.tsx           ❌ Needs build
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-06 | RiskFixer Team | Initial specification |

---

**END OF FRAMEWORK SPECIFICATION**
