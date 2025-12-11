# RiskFixer: Report Generation & Frontend UX Specification
## MacQuarrie-Grade Reports + Dashboard Redesign

**Version:** 1.0  
**Date:** December 10, 2025  
**Status:** Implementation Specification  
**Owner:** RiskFixer Product Team

---

## Executive Summary

This document specifies two major enhancements:

1. **Report Generation System** — Produce professional, narrative-driven PDF reports matching the MacQuarrie Executive Protection Assessment format
2. **Frontend UX Redesign** — Clean tab-based navigation with dedicated Reports and Risk Profile/Dashboard views

---

# PART 1: REPORT GENERATION ARCHITECTURE

## 1.1 Report Types Required

| Report Type | Use Case | Primary Audience |
|-------------|----------|------------------|
| **Executive Summary** | 1-2 page high-level overview for C-suite | Executives, Board |
| **Full Assessment Report** | Complete 15-25 page technical document | Security Directors, Consultants |
| **Gap Analysis Report** | Technical remediation guide with specifications | Facilities, IT, Operations |

---

## 1.2 Report Structure: Full Assessment

Based on MacQuarrie format, this is the target structure:

```
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE 1: COVER PAGE                                                    │
│  ├─ RiskFixer logo (branded)                                          │
│  ├─ Assessment type + Subject name                                    │
│  ├─ OVERALL RISK: [RATING] with color badge                          │
│  ├─ Score: XX/125                                                     │
│  ├─ CONFIDENTIAL marking                                              │
│  ├─ Prepared by + Date                                                │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE 2: EXECUTIVE SUMMARY                                             │
│  ├─ Overall Risk Rating box (visual)                                  │
│  ├─ 2-3 paragraph assessment overview                                 │
│  ├─ Documented Threat History (bullet summary)                        │
│  ├─ Key Findings (bullet summary)                                     │
│  ├─ Recommended Priorities (numbered 1-6)                             │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE 3: ASSESSMENT METHODOLOGY                                        │
│  ├─ ASIS GDL-RA compliance statement                                  │
│  ├─ Data sources (site walks, interviews, CAP Index, etc.)           │
│  ├─ T×V×I formula explanation                                         │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGES 4-5: GEOGRAPHIC RISK ANALYSIS                                   │
│  ├─ CAP Index data tables (if available)                              │
│  ├─ Location comparison (if multiple sites)                           │
│  ├─ Key findings from crime data                                      │
│  ├─ Risk prioritization implications                                  │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGES 6-7: PRINCIPAL/FACILITY PROFILE (context-dependent)             │
│  ├─ EP: Principal background, visibility, patterns                    │
│  ├─ Facility: Operations, hours, employee count, assets               │
│  ├─ Industry context                                                  │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGES 8-11: THREAT ASSESSMENT                                         │
│  ├─ Overall Threat Score box: X/5 (Rating)                            │
│  ├─ Threat Domain #1: [Name] — Probability: X/5                       │
│  │   └─ Narrative explanation with evidence                           │
│  ├─ Threat Domain #2: [Name] — Probability: X/5                       │
│  │   └─ Narrative explanation with evidence                           │
│  ├─ ... (all relevant threat domains)                                 │
│  ├─ Domains Assessed at Enterprise Level (if applicable)             │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGES 12-15: VULNERABILITY ANALYSIS                                   │
│  ├─ Overall Vulnerability Score box: X/5 (Rating)                     │
│  ├─ Vulnerability 1: [Name]                                           │
│  │   ├─ Source: [Interview/Site Walk/Photo]                          │
│  │   ├─ Current State: [Description]                                  │
│  │   └─ Implication: [Why it matters]                                │
│  ├─ Vulnerability 2: [Name]                                           │
│  │   └─ ...                                                           │
│  ├─ (Table format optional for current state details)                │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE 16: IMPACT ASSESSMENT                                            │
│  ├─ Overall Impact Score box: X/5 (Rating)                            │
│  ├─ Personal/Employee Safety considerations                           │
│  ├─ Corporate/Operational continuity considerations                   │
│  ├─ Regulatory/Compliance considerations                              │
│  ├─ Reputational considerations                                       │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE 17: RISK CALCULATION                                             │
│  ├─ Formula: Risk = T × V × I                                         │
│  ├─ Calculation: X × X × X = XX/125                                   │
│  ├─ Component breakdown table:                                        │
│  │   ├─ Threat: X/5 — Rating                                         │
│  │   ├─ Vulnerability: X/5 — Rating                                  │
│  │   ├─ Impact: X/5 — Rating                                         │
│  │   └─ TOTAL RISK: XX/125 — CLASSIFICATION                          │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGES 18-20: SECURITY RECOMMENDATIONS                                 │
│  ├─ Priority 1: [Control Name]                                        │
│  │   ├─ Rationale: [Why this is priority]                            │
│  │   └─ Actions: [Specific steps]                                    │
│  ├─ Priority 2: [Control Name]                                        │
│  │   └─ ...                                                           │
│  ├─ Priority 3-6: ...                                                 │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE 21: IMPLEMENTATION ROADMAP                                       │
│  ├─ Priority/Control/Evidence table                                   │
│  ├─ Timeline indicators (Week 1, Week 2, etc.)                       │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE 22: CONCLUSION                                                   │
│  ├─ 2-3 paragraph synthesis                                           │
│  ├─ Key drivers summary                                               │
│  ├─ Recommended starting point                                        │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE 23: DATA SOURCES                                                 │
│  ├─ Site walks (dates, locations)                                     │
│  ├─ Interviews (names, dates)                                         │
│  ├─ Intelligence sources (CAP Index, etc.)                           │
│  ├─ Methodology reference                                             │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  APPENDIX: T×V×I RATING SCALE                                          │
│  ├─ Component ratings (1-5) table                                     │
│  ├─ Composite risk classification (1-125) table                       │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│  APPENDIX: PHOTOS                                                      │
│  ├─ Figure 1: [Caption]                                               │
│  ├─ Figure 2: [Caption]                                               │
│  ├─ ... (all assessment photos with captions)                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1.3 Report Data Requirements

### What the AI Engine Must Produce

For the report generator to create MacQuarrie-grade output, the AI assessment engine must provide:

```typescript
interface FullReportData {
  // METADATA
  assessmentId: number;
  templateType: TemplateType;
  assessmentDate: string;
  assessorName: string;
  
  // SUBJECT
  subjectName: string;           // Facility name or Principal name
  subjectTitle?: string;         // EP: "President, Commercial Operations"
  subjectOrganization?: string;  // "BWXT Nuclear Operations Group"
  address: string;
  
  // OVERALL RISK
  overallRisk: {
    score: number;              // 1-125
    classification: 'NEGLIGIBLE' | 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
    color: string;              // Hex color
  };
  
  // EXECUTIVE SUMMARY (AI-generated narrative)
  executiveSummary: {
    overview: string;           // 2-3 paragraphs
    documentedIncidents: string[];  // Bullet points of threat history
    keyFindings: string[];      // Bullet points of main findings
    recommendedPriorities: {
      priority: number;
      title: string;
      shortDescription: string;
    }[];
  };
  
  // METHODOLOGY (mostly static, some dynamic)
  methodology: {
    dataSources: {
      type: string;             // "Site Walk", "Interview", "CAP Index"
      description: string;      // "Cambridge office (November 14, 2025)"
    }[];
  };
  
  // GEOGRAPHIC RISK (if CAP Index available)
  geographicRisk?: {
    locations: {
      name: string;
      address: string;
      capScore: number;
      violentCrimeScore: number;
      propertyCrimeScore: number;
      breakingEnteringScore: number;
      keyFinding: string;
    }[];
    comparativeSummary: string;
  };
  
  // PROFILE (EP: Principal, Facility: Operations)
  profile: {
    sections: {
      title: string;
      content: string | { label: string; value: string }[];
    }[];
  };
  
  // THREAT ASSESSMENT
  threatAssessment: {
    overallScore: number;       // 1-5
    overallRating: string;      // "Significant"
    domains: {
      id: string;
      name: string;
      probability: string;      // "Moderate-Significant (3-4/5)"
      narrativeExplanation: string;  // Multi-paragraph prose
      contributingFactors?: string[];
      mitigatingFactors?: string[];
      relevance?: string;
    }[];
    enterpriseDomains?: {       // Domains not directly relevant
      id: string;
      name: string;
      note: string;
    }[];
  };
  
  // VULNERABILITY ANALYSIS
  vulnerabilityAnalysis: {
    overallScore: number;       // 1-5
    overallRating: string;
    vulnerabilities: {
      id: string;
      name: string;
      source: string;           // "EA Interview + Site Walk"
      currentState: string | { element: string; status: string }[];
      implication: string;
    }[];
  };
  
  // IMPACT ASSESSMENT
  impactAssessment: {
    overallScore: number;
    overallRating: string;
    categories: {
      name: string;             // "Personal & Family", "Corporate"
      considerations: string[];
    }[];
  };
  
  // RISK CALCULATION (derived from T×V×I)
  riskCalculation: {
    formula: string;            // "Risk = Threat × Vulnerability × Impact"
    calculation: string;        // "4 × 4 × 4 = 64/125"
    components: {
      name: string;
      score: number;
      rating: string;
    }[];
    totalScore: number;
    totalClassification: string;
  };
  
  // RECOMMENDATIONS
  recommendations: {
    priority: number;
    title: string;
    rationale: string;
    actions: string[];
    evidence?: string;          // "EA Interview", "CAP 248 B&E"
    timeline?: string;          // "Week 1-2"
    estimatedCost?: string;     // "$8,500-12,000"
  }[];
  
  // IMPLEMENTATION ROADMAP
  implementationRoadmap: {
    priority: string;           // "1 - High"
    control: string;
    evidenceBasis: string;
  }[];
  
  // CONCLUSION
  conclusion: {
    narrative: string;          // 2-3 paragraphs
    startingRecommendation: string;
  };
  
  // DATA SOURCES
  dataSources: {
    type: string;
    description: string;
  }[];
  
  // PHOTOS
  photos: {
    id: string;
    url: string;
    caption: string;
    figureNumber: number;
  }[];
}
```

---

## 1.4 Report Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REPORT GENERATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

   User clicks "Generate Report"
              │
              ▼
   ┌──────────────────────────────────────┐
   │  1. GATHER ASSESSMENT DATA           │
   │  ├─ Load risk scenarios from DB      │
   │  ├─ Load interview responses         │
   │  ├─ Load photo attachments           │
   │  ├─ Load CAP Index data (if any)     │
   │  └─ Load control recommendations     │
   └──────────────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │  2. CALL AI NARRATIVE GENERATOR      │
   │  ├─ Generate Executive Summary       │
   │  ├─ Generate Threat Narratives       │
   │  ├─ Generate Vulnerability Prose     │
   │  ├─ Generate Impact Analysis         │
   │  ├─ Generate Recommendations Text    │
   │  └─ Generate Conclusion              │
   └──────────────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │  3. BUILD REPORT DATA OBJECT         │
   │  ├─ Assemble FullReportData struct   │
   │  ├─ Format scores and ratings        │
   │  ├─ Order recommendations by priority│
   │  └─ Prepare photo references         │
   └──────────────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │  4. RENDER PDF                        │
   │  ├─ Apply template (cover, headers)  │
   │  ├─ Insert narrative sections        │
   │  ├─ Insert tables and visualizations │
   │  ├─ Insert photos with captions      │
   │  └─ Generate final PDF               │
   └──────────────────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │  5. RETURN TO USER                    │
   │  ├─ Download link                     │
   │  ├─ Preview in browser (optional)    │
   │  └─ Store in assessment record       │
   └──────────────────────────────────────┘
```

---

## 1.5 AI Narrative Generation Prompts

### Executive Summary Prompt

```typescript
const EXECUTIVE_SUMMARY_PROMPT = `
You are writing an executive summary for a {templateType} security assessment.
Write in a narrative, professional tone similar to consulting reports.
Do NOT use bullet points in the overview paragraphs.

ASSESSMENT DATA:
{assessmentData}

RISK SCORES:
- Threat: {threatScore}/5 ({threatRating})
- Vulnerability: {vulnerabilityScore}/5 ({vulnerabilityRating})
- Impact: {impactScore}/5 ({impactRating})
- Overall: {overallScore}/125 ({overallClassification})

KEY FINDINGS:
{keyFindings}

DOCUMENTED INCIDENTS:
{incidents}

Generate:
1. A 2-3 paragraph narrative overview that tells the security story
2. Do NOT start with "This assessment..." - vary your opening
3. Connect threats to vulnerabilities to impacts
4. Reference specific evidence from interviews or site walks
5. End with forward-looking statement about priorities

FORMAT: Return as JSON:
{
  "overview": "2-3 paragraph narrative...",
  "keyFindings": ["finding 1", "finding 2", ...],
  "recommendedPriorities": [
    { "priority": 1, "title": "...", "shortDescription": "..." }
  ]
}
`;
```

### Threat Domain Narrative Prompt

```typescript
const THREAT_DOMAIN_PROMPT = `
You are writing the threat analysis section for threat domain: {domainName}

DOMAIN: {domainName}
PROBABILITY: {probability}
EVIDENCE:
{evidence}

Write a narrative explanation (3-5 paragraphs) that:
1. Explains what this threat means for this subject
2. Cites specific evidence from the assessment
3. Discusses contributing and mitigating factors
4. Explains the relevance to this specific principal/facility

Use professional security consulting language.
Reference specific data points, not generalities.
Do NOT use bullet points in the narrative - save those for lists of factors.

FORMAT: Return as JSON:
{
  "narrativeExplanation": "multi-paragraph prose...",
  "contributingFactors": ["factor 1", ...],
  "mitigatingFactors": ["factor 1", ...],
  "relevance": "one paragraph explaining why this matters here..."
}
`;
```

---

## 1.6 PDF Generation Technology

### Option A: Puppeteer + HTML Template (Recommended)

```typescript
// server/services/report-generator/pdf-generator.ts

import puppeteer from 'puppeteer';
import { FullReportData } from './types';
import { renderReportHTML } from './html-renderer';

export async function generateReportPDF(data: FullReportData): Promise<Buffer> {
  // 1. Render HTML from template
  const html = renderReportHTML(data);
  
  // 2. Launch headless browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // 3. Set content and generate PDF
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'Letter',
    margin: {
      top: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
      right: '0.75in',
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
        CONFIDENTIAL — Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `,
  });
  
  await browser.close();
  return pdf;
}
```

### HTML Template Structure

```html
<!-- templates/report-template.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: Letter;
      margin: 0.75in;
    }
    
    body {
      font-family: 'Georgia', serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
    }
    
    h1 { font-size: 24pt; color: #1a365d; }
    h2 { font-size: 18pt; color: #2d3748; border-bottom: 2px solid #e2e8f0; }
    h3 { font-size: 14pt; color: #4a5568; }
    
    .cover-page {
      page-break-after: always;
      text-align: center;
      padding-top: 2in;
    }
    
    .risk-badge {
      display: inline-block;
      padding: 1rem 2rem;
      font-size: 18pt;
      font-weight: bold;
      border-radius: 8px;
    }
    
    .risk-elevated { background: #F97316; color: white; }
    .risk-critical { background: #EF4444; color: white; }
    .risk-moderate { background: #EAB308; color: black; }
    .risk-low { background: #3B82F6; color: white; }
    .risk-negligible { background: #22C55E; color: white; }
    
    .score-box {
      border: 2px solid #333;
      padding: 1rem;
      text-align: center;
      margin: 1rem 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
      text-align: left;
    }
    
    th { background: #f7fafc; font-weight: bold; }
    
    .photo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .photo-item img {
      max-width: 100%;
      border: 1px solid #e2e8f0;
    }
    
    .photo-caption {
      font-size: 10pt;
      font-style: italic;
      text-align: center;
    }
    
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  {{> cover-page}}
  {{> executive-summary}}
  {{> methodology}}
  {{> geographic-risk}}
  {{> profile}}
  {{> threat-assessment}}
  {{> vulnerability-analysis}}
  {{> impact-assessment}}
  {{> risk-calculation}}
  {{> recommendations}}
  {{> implementation-roadmap}}
  {{> conclusion}}
  {{> data-sources}}
  {{> appendix-ratings}}
  {{> appendix-photos}}
</body>
</html>
```

---

# PART 2: FRONTEND UX REDESIGN

## 2.1 New Tab Structure

Replace the current navigation with a clean, professional tab-based layout:

```
┌────────────────────────────────────────────────────────────────────────┐
│  RISKFIXER                                          [User Menu] [Help] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  [Assessment Name]                                     [Actions] │  │
│  │  Office Building • 123 Main Street • Created: Dec 10, 2025      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────┬─────────────┬──────────┬───────────┬──────────┐          │
│  │INTERVIEW│ RISK PROFILE │ REPORTS  │  PHOTOS   │ SETTINGS │          │
│  └─────────┴─────────────┴──────────┴───────────┴──────────┘          │
│                                                                        │
│  [TAB CONTENT AREA]                                                   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Tab Definitions

| Tab | Purpose | Content |
|-----|---------|---------|
| **INTERVIEW** | Complete the assessment questionnaire | Question flow, section navigation, progress |
| **RISK PROFILE** | View calculated risks and dashboard | Risk scores, scenarios, heatmaps, evidence |
| **REPORTS** | Generate and download reports | Report type selector, preview, download |
| **PHOTOS** | Manage assessment photos | Upload, AI analysis, captions |
| **SETTINGS** | Assessment configuration | Metadata, team access, export options |

---

## 2.2 Tab 1: INTERVIEW (Existing, Enhanced)

Keep the current interview flow but improve:

```
┌────────────────────────────────────────────────────────────────────────┐
│  INTERVIEW                                                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  PROGRESS: ████████████░░░░░░░░░░░░░░░░░░░░  72% Complete              │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  SECTIONS                          │  CURRENT QUESTION          │   │
│  │  ──────────────────────────────────┼───────────────────────────│   │
│  │  ✓ 1. Facility Information         │                            │   │
│  │  ✓ 2. Access Control                │  [Question Text Here]      │   │
│  │  ● 3. Visitor Management  ← Current │                            │   │
│  │  ○ 4. Surveillance Systems          │  [Answer Input Field]      │   │
│  │  ○ 5. Intrusion Detection           │                            │   │
│  │  ○ 6. Emergency Response            │  [Help Text / Context]     │   │
│  │  ○ 7. Personnel Security            │                            │   │
│  │  ○ 8. Physical Barriers             │  [Previous] [Next →]       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  [Save Progress]                              [Generate Risk Profile → ]│
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2.3 Tab 2: RISK PROFILE (New Dashboard)

This is the central risk visualization dashboard:

```
┌────────────────────────────────────────────────────────────────────────┐
│  RISK PROFILE                                                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    OVERALL RISK ASSESSMENT                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │  │
│  │  │  THREAT     │  │VULNERABILITY│  │   IMPACT    │  │  RISK   │ │  │
│  │  │    4/5      │  │    4/5      │  │    4/5      │  │  64/125 │ │  │
│  │  │ Significant │  │ Significant │  │ Significant │  │ELEVATED │ │  │
│  │  │   [■■■■□]   │  │   [■■■■□]   │  │   [■■■■□]   │  │[ORANGE] │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │  │
│  │                                                                   │  │
│  │  AI CONFIDENCE: HIGH    |    Last Updated: Dec 10, 2025 2:34 PM  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────┐  ┌────────────────────────────────┐ │
│  │  RISK SCENARIOS (12)         │  │  TOP RECOMMENDATIONS           │ │
│  │  ────────────────────────────│  │  ──────────────────────────────│ │
│  │  🔴 Kidnapping/Abduction  68 │  │  1. Parking Area Security      │ │
│  │  🔴 Stalking/Surveillance 62 │  │  2. Interior Access Control    │ │
│  │  🟠 Home Invasion         54 │  │  3. Mail Screening Protocol    │ │
│  │  🟠 Physical Assault      48 │  │  4. Duress System              │ │
│  │  🟡 Doxxing/Privacy       42 │  │  5. Residential Security       │ │
│  │  🟡 Mail/Package Threats  38 │  │  6. Travel Security            │ │
│  │  🟢 Vehicle Attack        24 │  │                                │ │
│  │  🟢 Social Engineering    18 │  │  [View Full Recommendations →] │ │
│  │  ...                          │  │                                │ │
│  │  [View All Scenarios →]       │  │                                │ │
│  └──────────────────────────────┘  └────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  EVIDENCE TRAIL                                                   │ │
│  │  ────────────────────────────────────────────────────────────────│ │
│  │  • Interview: EA identified parking area as "most vulnerable"    │ │
│  │  • Site Walk: Interior doors propped open; no lock on private   │ │
│  │  • CAP Index: B&E rate 248 (2.48× national average)             │ │
│  │  • Incident: Tailgating incidents documented in 2024            │ │
│  │  [View Complete Evidence →]                                       │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Risk Profile Components

```typescript
// components/RiskProfile/OverallRiskCard.tsx
interface OverallRiskCardProps {
  threatScore: number;
  threatRating: string;
  vulnerabilityScore: number;
  vulnerabilityRating: string;
  impactScore: number;
  impactRating: string;
  overallScore: number;
  overallClassification: string;
  aiConfidence: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

// components/RiskProfile/RiskScenarioList.tsx
interface RiskScenarioListProps {
  scenarios: {
    id: number;
    threatName: string;
    inherentRisk: number;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    scenarioDescription: string;
  }[];
  onViewScenario: (id: number) => void;
}

// components/RiskProfile/RecommendationsSummary.tsx
interface RecommendationsSummaryProps {
  recommendations: {
    priority: number;
    title: string;
    urgency: 'immediate' | 'short_term' | 'medium_term';
  }[];
  onViewAll: () => void;
}

// components/RiskProfile/EvidenceTrail.tsx
interface EvidenceTrailProps {
  evidence: {
    source: string;
    type: 'interview' | 'site_walk' | 'cap_index' | 'incident' | 'photo';
    summary: string;
  }[];
  onViewComplete: () => void;
}
```

---

## 2.4 Tab 3: REPORTS (New)

```
┌────────────────────────────────────────────────────────────────────────┐
│  REPORTS                                                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  GENERATE NEW REPORT                                              │ │
│  │  ────────────────────────────────────────────────────────────────│ │
│  │                                                                    │ │
│  │  Report Type:                                                      │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │ EXECUTIVE       │  │ FULL            │  │ GAP             │   │ │
│  │  │ SUMMARY         │  │ ASSESSMENT      │  │ ANALYSIS        │   │ │
│  │  │ ─────────────── │  │ ─────────────── │  │ ─────────────── │   │ │
│  │  │ 1-2 pages       │  │ 15-25 pages     │  │ Technical       │   │ │
│  │  │ C-suite focused │  │ Complete report │  │ Remediation     │   │ │
│  │  │ [● Selected]    │  │ [○ Select]      │  │ [○ Select]      │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │ │
│  │                                                                    │ │
│  │  Include Options:                                                  │ │
│  │  ☑ Cover Page with Branding                                       │ │
│  │  ☑ Geographic Risk Data (CAP Index)                               │ │
│  │  ☑ Photo Appendix                                                 │ │
│  │  ☐ Cost Estimates (if available)                                  │ │
│  │                                                                    │ │
│  │  [Generate Report]                                                 │ │
│  │                                                                    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  PREVIOUSLY GENERATED REPORTS                                     │ │
│  │  ────────────────────────────────────────────────────────────────│ │
│  │                                                                    │ │
│  │  📄 Full Assessment Report                     Dec 10, 2025       │ │
│  │     15 pages • PDF • 2.4 MB              [Preview] [Download]     │ │
│  │                                                                    │ │
│  │  📄 Executive Summary                          Dec 10, 2025       │ │
│  │     2 pages • PDF • 245 KB               [Preview] [Download]     │ │
│  │                                                                    │ │
│  │  📄 Gap Analysis Report                        Dec 9, 2025        │ │
│  │     8 pages • PDF • 1.1 MB               [Preview] [Download]     │ │
│  │                                                                    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2.5 Tab 4: PHOTOS (Enhanced)

```
┌────────────────────────────────────────────────────────────────────────┐
│  PHOTOS                                                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  [+ Upload Photos]                    Filter: [All Locations ▼]   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │
│  │  [Photo 1]     │  │  [Photo 2]     │  │  [Photo 3]     │          │
│  │  ────────────  │  │  ────────────  │  │  ────────────  │          │
│  │  Front Entry   │  │  Parking Area  │  │  Interior Door │          │
│  │  ✓ AI Analyzed │  │  ✓ AI Analyzed │  │  ⏳ Pending    │          │
│  │  [Edit] [Del]  │  │  [Edit] [Del]  │  │  [Analyze]     │          │
│  └────────────────┘  └────────────────┘  └────────────────┘          │
│                                                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │
│  │  [Photo 4]     │  │  [Photo 5]     │  │  [Photo 6]     │          │
│  │  ────────────  │  │  ────────────  │  │  ────────────  │          │
│  │  Guard Station │  │  Rear Door     │  │  Window Latch  │          │
│  │  ✓ AI Analyzed │  │  ✓ AI Analyzed │  │  ✓ AI Analyzed │          │
│  │  [Edit] [Del]  │  │  [Edit] [Del]  │  │  [Edit] [Del]  │          │
│  └────────────────┘  └────────────────┘  └────────────────┘          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  PHOTO DETAIL VIEW (when photo selected)                          │ │
│  │  ────────────────────────────────────────────────────────────────│ │
│  │  [Large Photo Image]                                              │ │
│  │                                                                    │ │
│  │  Caption: Rear sliding glass door with factory latch              │ │
│  │  Location: Burlington Residence - Rear Entry                      │ │
│  │                                                                    │ │
│  │  AI ANALYSIS:                                                      │ │
│  │  • Standard sliding door with factory latch mechanism             │ │
│  │  • No security bar or auxiliary lock visible                      │ │
│  │  • Glass panels without security film                             │ │
│  │  • Vulnerability: Lift-out or pry attack possible                 │ │
│  │                                                                    │ │
│  │  [Edit Caption] [Run Analysis Again] [Add to Report]              │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2.6 Component Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── AssessmentHeader.tsx      # Assessment name, actions
│   │   ├── TabNavigation.tsx         # Tab bar component
│   │   └── MainLayout.tsx            # Overall page layout
│   │
│   ├── interview/
│   │   ├── InterviewTab.tsx          # Main interview container
│   │   ├── SectionNav.tsx            # Left sidebar sections
│   │   ├── QuestionCard.tsx          # Individual question
│   │   └── ProgressBar.tsx           # Completion progress
│   │
│   ├── risk-profile/
│   │   ├── RiskProfileTab.tsx        # Main dashboard container
│   │   ├── OverallRiskCard.tsx       # T×V×I score visualization
│   │   ├── RiskScenarioList.tsx      # Scenario list with scores
│   │   ├── RecommendationsSummary.tsx # Top recommendations
│   │   ├── EvidenceTrail.tsx         # Evidence citations
│   │   ├── RiskHeatmap.tsx           # Visual risk heatmap
│   │   └── ScenarioDetailModal.tsx   # Drill-down on scenario
│   │
│   ├── reports/
│   │   ├── ReportsTab.tsx            # Main reports container
│   │   ├── ReportTypeSelector.tsx    # Choose report type
│   │   ├── ReportOptions.tsx         # Include options checkboxes
│   │   ├── GenerateButton.tsx        # Generate action
│   │   ├── ReportHistory.tsx         # Previously generated
│   │   └── ReportPreview.tsx         # In-browser preview
│   │
│   ├── photos/
│   │   ├── PhotosTab.tsx             # Main photos container
│   │   ├── PhotoUploader.tsx         # Drag-drop upload
│   │   ├── PhotoGrid.tsx             # Gallery view
│   │   ├── PhotoDetail.tsx           # Full photo + AI analysis
│   │   └── AIAnalysisPanel.tsx       # GPT-4V results
│   │
│   └── shared/
│       ├── ScoreGauge.tsx            # Circular score visualization
│       ├── RiskBadge.tsx             # Color-coded risk badge
│       ├── ConfidenceIndicator.tsx   # AI confidence display
│       └── LoadingSpinner.tsx        # Loading states
│
├── pages/
│   └── assessment/
│       └── [id].tsx                  # Dynamic assessment page
│
└── hooks/
    ├── useAssessment.ts              # Assessment data hook
    ├── useRiskProfile.ts             # Risk calculations hook
    └── useReportGeneration.ts        # Report generation hook
```

---

## 2.7 API Routes Required

```typescript
// Report Generation Routes
POST /api/assessments/:id/reports/generate
  Body: { reportType: 'executive_summary' | 'full_assessment' | 'gap_analysis', options: {...} }
  Response: { reportId: string, status: 'generating' | 'complete', downloadUrl?: string }

GET /api/assessments/:id/reports
  Response: { reports: ReportRecord[] }

GET /api/assessments/:id/reports/:reportId/download
  Response: PDF file stream

// Risk Profile Routes (if not already present)
GET /api/assessments/:id/risk-profile
  Response: {
    overallRisk: {...},
    scenarios: [...],
    recommendations: [...],
    evidence: [...]
  }

// Photo Routes (enhance existing)
POST /api/assessments/:id/photos/analyze
  Body: { photoId: number }
  Response: { analysis: {...} }
```

---

## 2.8 Implementation Priority

### Phase 1: Risk Profile Dashboard (Week 1)
1. Create TabNavigation component
2. Build RiskProfileTab with score cards
3. Display risk scenarios list
4. Show recommendations summary
5. Add evidence trail component

### Phase 2: Reports Tab (Week 1-2)
1. Create ReportsTab container
2. Build report type selector
3. Implement report generation API
4. Add report history list
5. Integrate PDF preview

### Phase 3: PDF Generation (Week 2)
1. Set up Puppeteer
2. Create HTML templates
3. Implement AI narrative generation
4. Build report assembly logic
5. Test full report flow

### Phase 4: Photo Enhancements (Week 2-3)
1. Improve photo grid layout
2. Add AI analysis display
3. Enhance caption editing
4. Add "Add to Report" functionality

---

## Summary

This specification provides:

1. **Report Structure** — MacQuarrie-grade format with all sections defined
2. **Data Requirements** — Complete interface for AI-generated report content
3. **Generation Flow** — From data gathering through PDF output
4. **AI Prompts** — Templates for narrative generation
5. **Frontend Tabs** — New Risk Profile and Reports views
6. **Component Architecture** — Full React component structure
7. **API Routes** — Required backend endpoints
8. **Implementation Priority** — Phased rollout plan

**END OF SPECIFICATION**
