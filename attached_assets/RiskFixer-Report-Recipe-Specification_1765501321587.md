# RiskFixer: Report Recipe Specification
## Codifying Report Excellence into Automated Generation

**Version:** 1.0  
**Based On:** MacQuarrie Executive Protection Assessment (November 2025)  
**Purpose:** Transform iteratively-refined report patterns into reproducible system logic  
**Last Updated:** November 29, 2025

---

## Executive Summary

This specification captures the "secret sauce" discovered through iterative refinement of the MacQuarrie Executive Protection Assessment. The goal is to encode these patterns so RiskFixer can automatically generate reports of equivalent quality across all assessment types.

**Two Report Formats Codified:**
1. **Executive Summary Narrative** — Strategic, story-driven, 4-6 pages for executive consumption
2. **Comprehensive Technical Assessment** — Detailed, evidence-based, 15-25 pages for security professionals

---

## Part 1: Report Recipe Architecture

### 1.1 Core Concept: Report as Recipe

A **Report Recipe** is a configuration object that tells the report generator:
- What sections to include and in what order
- What data each section requires
- How to generate narratives for each section
- What visualizations to render
- What tone and formatting to apply

```typescript
// server/types/report-recipe.ts

export interface ReportRecipe {
  id: string;
  name: string;
  description: string;
  reportType: 'executive_summary' | 'comprehensive' | 'client_dashboard';
  assessmentTypes: AssessmentType[];  // Which templates can use this recipe
  
  // Recipe Components
  sections: SectionDefinition[];
  dataRequirements: DataRequirement[];
  narrativePrompts: NarrativePrompt[];
  visualizations: VisualizationSpec[];
  
  // Formatting
  toneSetting: ToneSetting;
  branding: BrandingConfig;
  pageLayout: PageLayoutConfig;
}

export type AssessmentType = 
  | 'executive_protection'
  | 'office_building'
  | 'retail_store'
  | 'warehouse'
  | 'datacenter'
  | 'manufacturing';

export type ToneSetting = 
  | 'executive'      // High-level, strategic, minimal jargon
  | 'technical'      // Detailed, precise, industry terminology
  | 'hybrid';        // Blends both approaches
```

### 1.2 Section Definition Schema

Each section in a report is defined by:

```typescript
export interface SectionDefinition {
  id: string;
  title: string;
  order: number;
  required: boolean;
  pageBreakBefore: boolean;
  
  // Content Type
  contentType: 'narrative' | 'table' | 'visualization' | 'mixed';
  
  // Data Dependencies
  requiredData: string[];        // Data keys that must exist
  optionalData: string[];        // Data keys that enhance if present
  
  // Narrative Configuration
  narrativePromptId?: string;    // Links to NarrativePrompt
  maxWords?: number;
  minWords?: number;
  
  // Table Configuration
  tableConfig?: TableConfiguration;
  
  // Visualization Configuration
  visualizationId?: string;      // Links to VisualizationSpec
  
  // Conditional Display
  displayCondition?: DisplayCondition;
}

export interface DisplayCondition {
  field: string;
  operator: 'exists' | 'equals' | 'greaterThan' | 'lessThan' | 'contains';
  value?: any;
}
```

---

## Part 2: The MacQuarrie Patterns — Executive Summary Recipe

### 2.1 Section Structure (Discovered Through Iteration)

The Executive Summary follows a narrative arc that builds credibility and leads to action:

```typescript
export const executiveSummaryRecipe: ReportRecipe = {
  id: 'executive-summary-ep-v1',
  name: 'Executive Protection Summary',
  reportType: 'executive_summary',
  assessmentTypes: ['executive_protection'],
  toneSetting: 'executive',
  
  sections: [
    {
      id: 'cover',
      title: 'Cover Page',
      order: 1,
      required: true,
      pageBreakBefore: false,
      contentType: 'mixed',
      requiredData: ['principalName', 'assessmentDate', 'consultantName'],
      optionalData: ['principalTitle', 'organizationName']
    },
    {
      id: 'the-assessment',
      title: 'The Assessment',
      order: 2,
      required: true,
      pageBreakBefore: true,
      contentType: 'narrative',
      narrativePromptId: 'assessment-intro',
      requiredData: ['methodology', 'dataSources', 'siteWalkDates'],
      maxWords: 150,
      minWords: 80
    },
    {
      id: 'risk-landscape',
      title: 'The Risk Landscape',
      order: 3,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      narrativePromptId: 'risk-landscape',
      requiredData: ['principalProfile', 'threatDomains', 'documentedIncidents'],
      optionalData: ['activistGroups', 'laborTensions', 'industryContext'],
      maxWords: 800,
      minWords: 400
    },
    {
      id: 'vulnerability-reality',
      title: 'The Vulnerability Reality',
      order: 4,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      narrativePromptId: 'vulnerability-reality',
      requiredData: ['siteWalkFindings', 'interviewFindings'],
      optionalData: ['accessControlGaps', 'travelPatterns'],
      maxWords: 600,
      minWords: 300
    },
    {
      id: 'geographic-intelligence',
      title: 'Geographic Intelligence',
      order: 5,
      required: false,
      pageBreakBefore: false,
      contentType: 'mixed',
      narrativePromptId: 'geographic-summary',
      requiredData: ['capIndexData'],
      displayCondition: {
        field: 'capIndexData',
        operator: 'exists'
      },
      maxWords: 200
    },
    {
      id: 'mathematical-reality',
      title: 'The Mathematical Reality',
      order: 6,
      required: true,
      pageBreakBefore: false,
      contentType: 'mixed',
      narrativePromptId: 'risk-calculation-explanation',
      requiredData: ['threatScore', 'vulnerabilityScore', 'impactScore', 'overallRiskScore'],
      maxWords: 400
    },
    {
      id: 'path-forward',
      title: 'The Path Forward',
      order: 7,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      narrativePromptId: 'recommendations-narrative',
      requiredData: ['prioritizedRecommendations'],
      maxWords: 500
    },
    {
      id: 'bottom-line',
      title: 'The Bottom Line',
      order: 8,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      narrativePromptId: 'conclusion',
      requiredData: ['keyFindings', 'topPriorities'],
      maxWords: 300
    },
    {
      id: 'about',
      title: 'About RiskFixer',
      order: 9,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      requiredData: [],  // Static content
      maxWords: 100
    }
  ],
  
  // ... continued below
};
```

### 2.2 Narrative Prompt Templates

These prompts encode the voice and structure that made the MacQuarrie reports effective:

```typescript
export const narrativePrompts: NarrativePrompt[] = [
  {
    id: 'assessment-intro',
    sectionId: 'the-assessment',
    systemPrompt: `You are a senior physical security consultant writing an executive protection assessment. 
Your tone is professional, authoritative, and direct. You avoid jargon but maintain precision.
You always cite specific methodologies and data sources to establish credibility.`,
    
    userPromptTemplate: `Write the opening "Assessment" section for an executive protection report.

Assessment Details:
- Principal: {{principalName}}, {{principalTitle}}
- Organization: {{organizationName}}
- Site Walk Dates: {{siteWalkDates}}
- Methodology: ASIS International Security Risk Assessment (SRA) Standard (ASIS SRA-2024)

Data Sources Used:
{{#each dataSources}}
- {{this.type}}: {{this.description}} ({{this.date}})
{{/each}}

Requirements:
1. Open with a single sentence stating what type of assessment this is
2. Mention the methodology (ASIS SRA-2024 adapted for executive protection)
3. List the data sources that were integrated
4. Keep it factual and brief — this sets context, not conclusions
5. Do NOT include findings or recommendations yet

Output only the narrative text, no headers or labels.`,
    
    outputConstraints: {
      maxWords: 150,
      minWords: 80,
      prohibitedPhrases: ['in conclusion', 'to summarize', 'importantly'],
      requiredElements: ['ASIS', 'site walk', 'interview']
    }
  },
  
  {
    id: 'risk-landscape',
    sectionId: 'risk-landscape',
    systemPrompt: `You are writing the threat environment section of an executive protection assessment.
Your goal is to weave together career context, documented incidents, and threat domains into a cohesive narrative.
You MUST attribute all incident information to specific sources (interview, document, etc.).
Never speculate — only include what is documented.`,
    
    userPromptTemplate: `Write the "Risk Landscape" section for {{principalName}}.

Principal Profile:
{{principalProfile}}

Threat Domains Analysis (TorchStone Framework):
{{#each threatDomains}}
**Domain {{this.number}} — {{this.name}}:**
{{this.findings}}
{{/each}}

Documented Incidents:
{{#each documentedIncidents}}
- {{this.description}} (Source: {{this.source}}, Date: {{this.date}})
{{/each}}

{{#if activistGroups}}
Activist/Opposition Groups:
{{#each activistGroups}}
- {{this.name}}: {{this.description}}
{{/each}}
{{/if}}

{{#if laborTensions}}
Labor/Insider Context:
{{laborTensions}}
{{/if}}

Requirements:
1. Open with a paragraph establishing the principal's career trajectory and how it creates the threat profile
2. Reference documented incidents with explicit source attribution ("Interview with [Name] confirmed...")
3. Organize threats using the TorchStone 8 Domains framework where applicable
4. For each relevant domain, explain WHY it applies to this specific principal
5. End with a transition to the vulnerability section (what this threat landscape means for security posture)
6. Use phrases like "documented," "confirmed," "per interview" — never "allegedly" or "reportedly"

Output only the narrative text. Do not include section headers.`,
    
    outputConstraints: {
      maxWords: 800,
      minWords: 400,
      requiredElements: ['career', 'documented', 'interview'],
      prohibitedPhrases: ['allegedly', 'reportedly', 'it is believed that']
    }
  },
  
  {
    id: 'vulnerability-reality',
    sectionId: 'vulnerability-reality',
    systemPrompt: `You are writing the vulnerability findings section.
Your job is to connect site walk observations with interview insights.
Always attribute findings to their source.
Present workplace and residential findings separately but comparatively.`,
    
    userPromptTemplate: `Write the "Vulnerability Reality" section based on assessment findings.

Site Walk Findings:
{{#each siteWalkFindings}}
**{{this.location}}** (Walked: {{this.date}}):
{{#each this.findings}}
- {{this.finding}} {{#if this.quote}}— "{{this.quote}}" ({{this.source}}){{/if}}
{{/each}}
{{/each}}

Interview Findings:
{{#each interviewFindings}}
**{{this.source}}** ({{this.role}}, {{this.date}}):
{{#each this.findings}}
- {{this.finding}}
{{/each}}
Key Quote: "{{this.keyQuote}}"
{{/each}}

Geographic Context:
- Workplace CAP Score: {{workplaceCAP}} (B&E: {{workplaceBE}})
- Residence CAP Score: {{residenceCAP}} (Violent Crime: {{residenceVC}})

Requirements:
1. Open with the highest-concern finding from the workplace
2. Use direct quotes from interviews where available
3. Present the geographic data as validation/context for findings
4. Create the "asymmetric vulnerability" narrative if applicable:
   - "More probable risks at X, but Y offers no protection against focused attack"
5. End with any gap between threat awareness and protective measures
6. Avoid listing — weave findings into flowing prose

Output only the narrative text. Do not include section headers.`,
    
    outputConstraints: {
      maxWords: 600,
      minWords: 300,
      requiredElements: ['site walk', 'interview'],
      preferredStructure: 'workplace-first-then-residential'
    }
  },
  
  {
    id: 'risk-calculation-explanation',
    sectionId: 'mathematical-reality',
    systemPrompt: `You are explaining the T×V×I risk calculation methodology.
Your goal is to make the math accessible while maintaining rigor.
Each score component must be justified with specific evidence.`,
    
    userPromptTemplate: `Write the "Mathematical Reality" section explaining the risk calculation.

Risk Scores:
- Threat: {{threatScore}}/5
- Vulnerability: {{vulnerabilityScore}}/5  
- Impact: {{impactScore}}/5
- Overall: {{overallRiskScore}}/125
- Risk Level: {{riskLevel}}

Threat Score Justification:
{{threatJustification}}

Vulnerability Score Justification:
{{vulnerabilityJustification}}

Impact Score Justification:
{{impactJustification}}

Requirements:
1. Open with the formula: "Risk = Threat × Vulnerability × Impact"
2. Present the calculation: "{{threatScore}} × {{vulnerabilityScore}} × {{impactScore}} = {{overallRiskScore}}/125"
3. State the risk level determination
4. Explain each component score in a separate paragraph:
   - What drove the Threat score (list specific factors)
   - What drove the Vulnerability score (list specific gaps)
   - What drove the Impact score (list consequences)
5. Use bold for the final score and risk level
6. Keep explanations evidence-based, not theoretical

Output only the narrative text. Do not include section headers.`,
    
    outputConstraints: {
      maxWords: 400,
      requiredElements: ['T×V×I', 'score', 'documented'],
      formatting: ['bold_final_score', 'bold_component_scores']
    }
  },
  
  {
    id: 'recommendations-narrative',
    sectionId: 'path-forward',
    systemPrompt: `You are writing prioritized security recommendations.
Each recommendation must tie back to a specific finding.
Present recommendations as proportionate responses, not wish lists.`,
    
    userPromptTemplate: `Write the "Path Forward" section with prioritized recommendations.

Recommendations (in priority order):
{{#each prioritizedRecommendations}}
**Priority {{this.priority}}: {{this.title}}**
- Rationale: {{this.rationale}}
- Evidence Basis: {{this.evidenceBasis}}
- Linked Findings: {{this.linkedFindings}}
{{/each}}

Requirements:
1. Brief intro stating these are targeted measures addressing documented vulnerabilities
2. Present each priority as a short paragraph (not bullets) with:
   - What to do
   - Why (evidence link)
   - Expected risk reduction (if available)
3. End with implementation guidance (start with priorities 1-3)
4. Emphasize that recommendations are "proportionate" and "integrate with existing capabilities"

Output only the narrative text. Do not include section headers.`,
    
    outputConstraints: {
      maxWords: 500,
      structure: 'paragraph-per-priority'
    }
  },
  
  {
    id: 'conclusion',
    sectionId: 'bottom-line',
    systemPrompt: `You are writing the closing summary.
Reinforce key points without repeating details.
End with a clear call to action.`,
    
    userPromptTemplate: `Write the "Bottom Line" conclusion.

Key Summary Points:
- Overall Risk: {{riskLevel}} ({{overallRiskScore}}/125)
- Primary Risk Environment: {{primaryRiskEnvironment}}
- Top 3 Priorities: {{topPriorities}}
- Key Insight: {{keyInsight}}

Requirements:
1. One paragraph summarizing the risk profile drivers
2. One paragraph on the prioritization insight (e.g., "workplace vs. residence")
3. One paragraph on implementation guidance
4. Final sentence on how these recommendations integrate with existing capabilities
5. NO new information — synthesis only

Output only the narrative text. Do not include section headers.`,
    
    outputConstraints: {
      maxWords: 300,
      prohibitedPhrases: ['in conclusion', 'to summarize', 'in summary']
    }
  }
];
```

---

## Part 3: Data Requirements Specification

### 3.1 Required Data Objects

The report generator needs these data structures populated:

```typescript
// server/types/report-data.ts

export interface ReportDataPackage {
  // Assessment Metadata
  assessmentId: number;
  assessmentType: AssessmentType;
  assessmentDate: Date;
  consultantName: string;
  consultantCredentials: string;
  
  // Principal/Facility Profile
  principal?: PrincipalProfile;           // For EP assessments
  facility?: FacilityProfile;             // For facility assessments
  
  // Threat Data
  threatDomains: ThreatDomain[];
  documentedIncidents: DocumentedIncident[];
  activistGroups?: ActivistGroup[];
  laborTensions?: string;
  
  // Vulnerability Data
  siteWalkFindings: SiteWalkFinding[];
  interviewFindings: InterviewFinding[];
  accessControlGaps?: string[];
  
  // Geographic Intelligence
  capIndexData?: CAPIndexData[];
  
  // Risk Calculation
  threatScore: number;
  vulnerabilityScore: number;
  impactScore: number;
  overallRiskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
  
  // Justifications
  threatJustification: string;
  vulnerabilityJustification: string;
  impactJustification: string;
  
  // Recommendations
  prioritizedRecommendations: Recommendation[];
  
  // Summary Elements
  keyFindings: string[];
  topPriorities: string[];
  keyInsight: string;
  primaryRiskEnvironment: string;
}

export interface PrincipalProfile {
  name: string;
  title: string;
  organization: string;
  industryTenure: string;
  corporateScope: string;
  industryVisibility: string[];
  travelPatterns?: string;
  familyContext?: string;
}

export interface ThreatDomain {
  number: number;
  name: string;
  applicable: boolean;
  findings: string;
  evidenceSources: string[];
}

export interface DocumentedIncident {
  id: string;
  description: string;
  date: string;
  source: string;
  sourceRole?: string;
  threatDomainId?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface SiteWalkFinding {
  location: string;
  date: Date;
  findings: {
    finding: string;
    quote?: string;
    source?: string;
    vulnerabilityId?: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }[];
}

export interface InterviewFinding {
  source: string;
  role: string;
  date: Date;
  findings: {
    finding: string;
    vulnerabilityLink?: string;
  }[];
  keyQuote?: string;
}

export interface CAPIndexData {
  locationName: string;
  locationType: 'workplace' | 'residence' | 'frequent_destination';
  overallScore: number;
  crimeBreakdown: {
    category: string;
    score: number;
    nationalComparison: number;  // 2.48 means 2.48× national average
  }[];
  keyFinding: string;
}

export interface Recommendation {
  priority: number;
  title: string;
  rationale: string;
  evidenceBasis: string[];
  linkedVulnerabilities: string[];
  linkedIncidents: string[];
  estimatedCost?: string;
  riskReduction?: number;
  implementationTimeframe?: string;
}
```

### 3.2 Interview-to-Report Data Mapping

This maps interview questions to report data fields:

```typescript
// server/mappings/interview-to-report.ts

export const interviewToReportMapping: DataMapping[] = [
  // Principal Profile from Interview
  {
    interviewSection: 'executive_profile',
    reportField: 'principal.industryVisibility',
    questions: ['ep_profile_8', 'ep_profile_9', 'ep_profile_10'],
    aggregationType: 'array_concat'
  },
  {
    interviewSection: 'executive_profile', 
    reportField: 'principal.travelPatterns',
    questions: ['ep_travel_1', 'ep_travel_2', 'ep_travel_3'],
    aggregationType: 'narrative_summary'
  },
  
  // Documented Incidents from Interview
  {
    interviewSection: 'threat_history',
    reportField: 'documentedIncidents',
    questions: ['ep_threat_1', 'ep_threat_2', 'ep_threat_3'],
    aggregationType: 'incident_array',
    transformation: 'parseIncidentResponses'
  },
  
  // Vulnerability Findings from Interview
  {
    interviewSection: 'workplace_security',
    reportField: 'siteWalkFindings',
    questions: ['ep_workplace_*'],  // All workplace questions
    aggregationType: 'finding_array',
    transformation: 'parseVulnerabilityResponses'
  },
  
  // Geographic Context
  {
    interviewSection: 'locations',
    reportField: 'capIndexData',
    questions: ['ep_location_1', 'ep_location_2'],
    aggregationType: 'external_data_lookup',
    externalSource: 'cap_index_import'
  }
];

export interface DataMapping {
  interviewSection: string;
  reportField: string;
  questions: string[];
  aggregationType: 'single_value' | 'array_concat' | 'narrative_summary' | 
                   'incident_array' | 'finding_array' | 'external_data_lookup';
  transformation?: string;
  externalSource?: string;
}
```

---

## Part 4: Comprehensive Technical Assessment Recipe

### 4.1 Section Structure

The Comprehensive Assessment provides detailed technical depth:

```typescript
export const comprehensiveAssessmentRecipe: ReportRecipe = {
  id: 'comprehensive-ep-v1',
  name: 'Executive Protection Comprehensive Assessment',
  reportType: 'comprehensive',
  assessmentTypes: ['executive_protection'],
  toneSetting: 'technical',
  
  sections: [
    {
      id: 'cover',
      title: 'Cover Page',
      order: 1,
      required: true,
      pageBreakBefore: false,
      contentType: 'mixed',
      requiredData: ['principalName', 'principalTitle', 'organizationName', 'assessmentDate']
    },
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      order: 2,
      required: true,
      pageBreakBefore: true,
      contentType: 'mixed',
      requiredData: ['overallRiskScore', 'riskLevel', 'documentedIncidents', 'keyFindings', 'topPriorities'],
      narrativePromptId: 'tech-exec-summary',
      tableConfig: {
        id: 'incident-summary-table',
        columns: ['Incident', 'Date', 'Source']
      }
    },
    {
      id: 'methodology',
      title: 'Assessment Methodology',
      order: 3,
      required: true,
      pageBreakBefore: true,
      contentType: 'mixed',
      requiredData: ['methodology', 'dataSources', 'siteWalkDates'],
      narrativePromptId: 'methodology-detail'
    },
    {
      id: 'geographic-analysis',
      title: 'Geographic Risk Analysis',
      order: 4,
      required: false,
      pageBreakBefore: true,
      contentType: 'mixed',
      requiredData: ['capIndexData'],
      narrativePromptId: 'geographic-detail',
      tableConfig: {
        id: 'cap-index-table',
        columns: ['Crime Category', 'CAP Score', 'vs. Average']
      },
      displayCondition: {
        field: 'capIndexData',
        operator: 'exists'
      }
    },
    {
      id: 'principal-profile',
      title: 'Principal Profile',
      order: 5,
      required: true,
      pageBreakBefore: true,
      contentType: 'mixed',
      requiredData: ['principal'],
      narrativePromptId: 'principal-profile-detail'
    },
    {
      id: 'threat-assessment',
      title: 'Threat Assessment',
      order: 6,
      required: true,
      pageBreakBefore: true,
      contentType: 'narrative',
      requiredData: ['threatScore', 'threatDomains', 'documentedIncidents'],
      narrativePromptId: 'threat-assessment-detail',
      maxWords: 1500
    },
    {
      id: 'vulnerability-assessment',
      title: 'Vulnerability Assessment',
      order: 7,
      required: true,
      pageBreakBefore: true,
      contentType: 'mixed',
      requiredData: ['vulnerabilityScore', 'siteWalkFindings', 'interviewFindings'],
      narrativePromptId: 'vulnerability-detail',
      tableConfig: {
        id: 'vulnerability-summary-table',
        columns: ['Finding', 'Location', 'Severity']
      }
    },
    {
      id: 'impact-assessment',
      title: 'Impact Assessment',
      order: 8,
      required: true,
      pageBreakBefore: true,
      contentType: 'narrative',
      requiredData: ['impactScore', 'principal'],
      narrativePromptId: 'impact-detail'
    },
    {
      id: 'risk-calculation',
      title: 'Risk Calculation',
      order: 9,
      required: true,
      pageBreakBefore: true,
      contentType: 'mixed',
      requiredData: ['threatScore', 'vulnerabilityScore', 'impactScore', 'overallRiskScore'],
      tableConfig: {
        id: 'risk-matrix-table',
        columns: ['Component', 'Score', 'Rating']
      }
    },
    {
      id: 'recommendations',
      title: 'Security Recommendations',
      order: 10,
      required: true,
      pageBreakBefore: true,
      contentType: 'mixed',
      requiredData: ['prioritizedRecommendations'],
      narrativePromptId: 'recommendations-technical'
    },
    {
      id: 'implementation-roadmap',
      title: 'Implementation Roadmap',
      order: 11,
      required: true,
      pageBreakBefore: false,
      contentType: 'table',
      requiredData: ['prioritizedRecommendations'],
      tableConfig: {
        id: 'roadmap-table',
        columns: ['Priority', 'Control', 'Evidence Basis']
      }
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      order: 12,
      required: true,
      pageBreakBefore: true,
      contentType: 'narrative',
      requiredData: ['keyFindings', 'topPriorities'],
      narrativePromptId: 'tech-conclusion'
    },
    {
      id: 'data-sources',
      title: 'Data Sources',
      order: 13,
      required: true,
      pageBreakBefore: false,
      contentType: 'list',
      requiredData: ['dataSources']
    },
    {
      id: 'about',
      title: 'About RiskFixer',
      order: 14,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      requiredData: []
    }
  ]
};
```

### 4.2 Table Configurations

Standardized table formats for data presentation:

```typescript
// server/config/report-tables.ts

export const tableConfigurations: Record<string, TableConfiguration> = {
  'incident-summary-table': {
    columns: [
      { header: 'Incident', field: 'description', width: '50%' },
      { header: 'Date', field: 'date', width: '25%' },
      { header: 'Source', field: 'source', width: '25%' }
    ],
    dataSource: 'documentedIncidents',
    sortBy: 'date',
    sortOrder: 'desc'
  },
  
  'cap-index-table': {
    columns: [
      { header: 'Crime Category', field: 'category', width: '40%', bold: true },
      { header: 'CAP Score', field: 'score', width: '30%' },
      { header: 'vs. Average', field: 'comparison', width: '30%', format: 'multiplier' }
    ],
    dataSource: 'capIndexData.crimeBreakdown',
    highlightRows: {
      condition: { field: 'score', operator: 'greaterThan', value: 150 },
      style: 'bold'
    }
  },
  
  'vulnerability-summary-table': {
    columns: [
      { header: 'Finding', field: 'finding', width: '50%' },
      { header: 'Location', field: 'location', width: '25%' },
      { header: 'Severity', field: 'severity', width: '25%', format: 'severity_badge' }
    ],
    dataSource: 'flattenedVulnerabilities',
    sortBy: 'severity',
    sortOrder: 'desc'
  },
  
  'risk-matrix-table': {
    columns: [
      { header: 'Component', field: 'component', width: '40%', bold: true },
      { header: 'Score', field: 'score', width: '30%' },
      { header: 'Rating', field: 'rating', width: '30%' }
    ],
    dataSource: 'riskComponents',
    footerRow: {
      component: 'TOTAL RISK',
      score: '{{overallRiskScore}}/125',
      rating: '{{riskLevel}}'
    },
    footerStyle: 'bold'
  },
  
  'roadmap-table': {
    columns: [
      { header: 'Priority', field: 'priority', width: '15%', format: 'priority_badge' },
      { header: 'Control', field: 'title', width: '45%' },
      { header: 'Evidence Basis', field: 'evidenceBasis', width: '40%', format: 'comma_list' }
    ],
    dataSource: 'prioritizedRecommendations',
    sortBy: 'priority',
    sortOrder: 'asc'
  }
};

export interface TableConfiguration {
  columns: ColumnDefinition[];
  dataSource: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  highlightRows?: RowHighlightConfig;
  footerRow?: Record<string, string>;
  footerStyle?: 'bold' | 'italic' | 'normal';
}

export interface ColumnDefinition {
  header: string;
  field: string;
  width: string;
  bold?: boolean;
  format?: 'text' | 'date' | 'number' | 'multiplier' | 'severity_badge' | 
           'priority_badge' | 'comma_list' | 'percentage';
}
```

---

## Part 5: Report Generation Service

### 5.1 Main Generation Flow

```typescript
// server/services/report-generator.ts

import { ReportRecipe, ReportDataPackage, SectionDefinition } from '../types/report-recipe';
import { generateNarrative } from './narrative-generator';
import { renderTable } from './table-renderer';
import { renderVisualization } from './visualization-renderer';
import { renderToPDF } from './pdf-renderer';

export async function generateReport(
  recipe: ReportRecipe,
  data: ReportDataPackage
): Promise<Buffer> {
  
  // 1. Validate data requirements
  validateDataRequirements(recipe, data);
  
  // 2. Generate content for each section
  const sections: RenderedSection[] = [];
  
  for (const sectionDef of recipe.sections) {
    // Check display condition
    if (sectionDef.displayCondition && !evaluateCondition(sectionDef.displayCondition, data)) {
      continue;
    }
    
    const renderedSection = await renderSection(sectionDef, data, recipe.toneSetting);
    sections.push(renderedSection);
  }
  
  // 3. Assemble into document structure
  const document = assembleDocument(sections, recipe.branding, recipe.pageLayout);
  
  // 4. Render to PDF
  const pdfBuffer = await renderToPDF(document);
  
  return pdfBuffer;
}

async function renderSection(
  sectionDef: SectionDefinition,
  data: ReportDataPackage,
  tone: ToneSetting
): Promise<RenderedSection> {
  
  const renderedSection: RenderedSection = {
    id: sectionDef.id,
    title: sectionDef.title,
    pageBreakBefore: sectionDef.pageBreakBefore,
    content: []
  };
  
  switch (sectionDef.contentType) {
    case 'narrative':
      const narrative = await generateNarrative(
        sectionDef.narrativePromptId!,
        data,
        { maxWords: sectionDef.maxWords, minWords: sectionDef.minWords, tone }
      );
      renderedSection.content.push({ type: 'text', content: narrative });
      break;
      
    case 'table':
      const table = renderTable(sectionDef.tableConfig!, data);
      renderedSection.content.push({ type: 'table', content: table });
      break;
      
    case 'visualization':
      const viz = await renderVisualization(sectionDef.visualizationId!, data);
      renderedSection.content.push({ type: 'image', content: viz });
      break;
      
    case 'mixed':
      // Handle sections with both narrative and tables/visualizations
      if (sectionDef.narrativePromptId) {
        const narrative = await generateNarrative(
          sectionDef.narrativePromptId,
          data,
          { maxWords: sectionDef.maxWords, tone }
        );
        renderedSection.content.push({ type: 'text', content: narrative });
      }
      
      if (sectionDef.tableConfig) {
        const table = renderTable(sectionDef.tableConfig, data);
        renderedSection.content.push({ type: 'table', content: table });
      }
      
      if (sectionDef.visualizationId) {
        const viz = await renderVisualization(sectionDef.visualizationId, data);
        renderedSection.content.push({ type: 'image', content: viz });
      }
      break;
  }
  
  return renderedSection;
}

function validateDataRequirements(recipe: ReportRecipe, data: ReportDataPackage): void {
  const missingFields: string[] = [];
  
  for (const section of recipe.sections) {
    for (const requiredField of section.requiredData) {
      if (!getNestedValue(data, requiredField)) {
        missingFields.push(`${section.id}: ${requiredField}`);
      }
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required data fields: ${missingFields.join(', ')}`);
  }
}
```

### 5.2 Narrative Generation Service

```typescript
// server/services/narrative-generator.ts

import OpenAI from 'openai';
import Handlebars from 'handlebars';
import { narrativePrompts } from '../config/narrative-prompts';

const openai = new OpenAI();

export async function generateNarrative(
  promptId: string,
  data: ReportDataPackage,
  options: NarrativeOptions
): Promise<string> {
  
  const promptConfig = narrativePrompts.find(p => p.id === promptId);
  if (!promptConfig) {
    throw new Error(`Narrative prompt not found: ${promptId}`);
  }
  
  // Compile template with data
  const template = Handlebars.compile(promptConfig.userPromptTemplate);
  const userPrompt = template(data);
  
  // Generate narrative
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: promptConfig.systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: options.maxWords ? options.maxWords * 2 : 1000,
    temperature: 0.7
  });
  
  let narrative = response.choices[0].message.content || '';
  
  // Validate output constraints
  narrative = applyOutputConstraints(narrative, promptConfig.outputConstraints);
  
  return narrative;
}

function applyOutputConstraints(
  narrative: string, 
  constraints?: OutputConstraints
): string {
  if (!constraints) return narrative;
  
  // Remove prohibited phrases
  if (constraints.prohibitedPhrases) {
    for (const phrase of constraints.prohibitedPhrases) {
      const regex = new RegExp(phrase, 'gi');
      narrative = narrative.replace(regex, '');
    }
  }
  
  // Check word count
  const wordCount = narrative.split(/\s+/).length;
  if (constraints.maxWords && wordCount > constraints.maxWords * 1.1) {
    // Truncate if significantly over
    console.warn(`Narrative exceeded max words: ${wordCount} > ${constraints.maxWords}`);
  }
  
  return narrative.trim();
}
```

---

## Part 6: Database Schema Extensions

### 6.1 Report Recipe Storage

```typescript
// server/db/schema/report-recipes.ts

import { pgTable, text, jsonb, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const reportRecipes = pgTable('report_recipes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  reportType: text('report_type').notNull(),  // 'executive_summary' | 'comprehensive' | 'client_dashboard'
  assessmentTypes: jsonb('assessment_types').notNull().$type<string[]>(),
  sections: jsonb('sections').notNull().$type<SectionDefinition[]>(),
  toneSetting: text('tone_setting').notNull(),
  branding: jsonb('branding').$type<BrandingConfig>(),
  pageLayout: jsonb('page_layout').$type<PageLayoutConfig>(),
  isActive: boolean('is_active').default(true),
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const narrativePrompts = pgTable('narrative_prompts', {
  id: text('id').primaryKey(),
  sectionId: text('section_id').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  userPromptTemplate: text('user_prompt_template').notNull(),
  outputConstraints: jsonb('output_constraints').$type<OutputConstraints>(),
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const generatedReports = pgTable('generated_reports', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id').references(() => assessments.id),
  recipeId: text('recipe_id').references(() => reportRecipes.id),
  reportType: text('report_type').notNull(),
  status: text('status').notNull(),  // 'generating' | 'complete' | 'failed'
  pdfUrl: text('pdf_url'),
  dataSnapshot: jsonb('data_snapshot').$type<ReportDataPackage>(),
  generationLog: jsonb('generation_log').$type<GenerationLogEntry[]>(),
  generatedAt: timestamp('generated_at').defaultNow(),
  generatedBy: text('generated_by')
});
```

### 6.2 Interview Finding Storage

```typescript
// server/db/schema/interview-findings.ts

export const interviewFindings = pgTable('interview_findings', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id').references(() => assessments.id),
  source: text('source').notNull(),          // "Theresa Jensen"
  sourceRole: text('source_role'),            // "Executive Assistant"
  interviewDate: timestamp('interview_date'),
  finding: text('finding').notNull(),
  directQuote: text('direct_quote'),
  linkedVulnerabilityId: integer('linked_vulnerability_id'),
  linkedThreatDomainId: integer('linked_threat_domain_id'),
  severity: text('severity'),                 // 'critical' | 'high' | 'medium' | 'low'
  usedInReport: boolean('used_in_report').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const documentedIncidents = pgTable('documented_incidents', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id').references(() => assessments.id),
  description: text('description').notNull(),
  incidentDate: text('incident_date'),
  source: text('source').notNull(),
  sourceRole: text('source_role'),
  threatDomainId: integer('threat_domain_id'),
  severity: text('severity').notNull(),
  actionTaken: text('action_taken'),
  createdAt: timestamp('created_at').defaultNow()
});
```

---

## Part 7: Implementation Roadmap

### 7.1 Phase 1: Core Infrastructure (Days 1-3)

**Day 1: Database & Types**
```
AI Prompt:
"Create the report recipe database schema and TypeScript types:
1. reportRecipes table with JSONB columns for sections, branding
2. narrativePrompts table 
3. generatedReports table for tracking
4. interviewFindings table for source attribution
5. documentedIncidents table
6. All TypeScript interfaces from Part 1

Files:
- server/db/schema/report-recipes.ts
- server/types/report-recipe.ts
- server/types/report-data.ts"
```

**Day 2: Recipe Configuration**
```
AI Prompt:
"Implement the Executive Summary recipe configuration:
1. Create executiveSummaryRecipe object per Part 2.1
2. Create all narrative prompts per Part 2.2
3. Create comprehensiveAssessmentRecipe per Part 4.1
4. Store in database via seed script

Files:
- server/config/recipes/executive-summary-ep.ts
- server/config/recipes/comprehensive-ep.ts
- server/config/narrative-prompts.ts
- server/db/seeds/report-recipes.ts"
```

**Day 3: Data Assembly Service**
```
AI Prompt:
"Create the data assembly service that builds ReportDataPackage:
1. Fetch all assessment data
2. Transform interview responses to findings
3. Pull CAP Index data
4. Calculate risk scores if not cached
5. Build complete ReportDataPackage object

File: server/services/report-data-assembler.ts"
```

### 7.2 Phase 2: Generation Engine (Days 4-7)

**Day 4-5: Narrative Generation**
```
AI Prompt:
"Implement the narrative generation service:
1. Template compilation with Handlebars
2. OpenAI integration for generation
3. Output constraint validation
4. Caching for regeneration efficiency

Files:
- server/services/narrative-generator.ts
- server/lib/handlebars-helpers.ts"
```

**Day 6: Table Rendering**
```
AI Prompt:
"Implement table rendering service:
1. Table configuration parser
2. Data transformation for each table type
3. Highlight row logic
4. Footer row handling

File: server/services/table-renderer.ts"
```

**Day 7: Section Assembly**
```
AI Prompt:
"Implement the main report generator:
1. Recipe loading and validation
2. Section rendering loop
3. Content assembly
4. Error handling and logging

File: server/services/report-generator.ts"
```

### 7.3 Phase 3: PDF Output (Days 8-10)

**Day 8-9: PDF Template**
```
AI Prompt:
"Create PDF rendering templates using docx-js:
1. Cover page template
2. Section template with headers
3. Table styles matching MacQuarrie format
4. Page headers/footers with branding
5. Professional typography (Arial, proper spacing)

Files:
- server/templates/report-pdf-template.ts
- server/services/pdf-renderer.ts"
```

**Day 10: Integration Testing**
```
Tasks:
- End-to-end test with sample data
- Compare output to MacQuarrie reference
- Adjust prompts based on output quality
- Performance optimization
```

### 7.4 Phase 4: API & UI (Days 11-14)

**Day 11: API Routes**
```
AI Prompt:
"Create report generation API:
1. POST /api/assessments/[id]/reports/generate
2. GET /api/assessments/[id]/reports
3. GET /api/assessments/[id]/reports/[reportId]/download
4. POST /api/assessments/[id]/reports/[reportId]/regenerate

File: server/api/reports.ts"
```

**Day 12-13: Report UI**
```
AI Prompt:
"Build report generation UI:
1. Report type selector (Executive Summary vs. Comprehensive)
2. Generation progress indicator
3. Preview capability
4. Download button
5. Regeneration with section override

Component: app/assessments/[id]/reports/page.tsx"
```

**Day 14: Polish & Documentation**
```
Tasks:
- Error handling improvements
- Loading states
- Success/failure notifications
- Internal documentation
- Demo report generation
```

---

## Part 8: Quality Assurance Checklist

### 8.1 Narrative Quality Criteria

Each generated narrative should be validated against:

- [ ] **Attribution**: All findings cite specific sources
- [ ] **Evidence-Based**: No speculation or "allegedly" language
- [ ] **Professional Tone**: Authoritative but accessible
- [ ] **Word Count**: Within specified limits
- [ ] **Required Elements**: Contains all specified terms/concepts
- [ ] **Prohibited Phrases**: None present
- [ ] **Logical Flow**: Transitions between paragraphs
- [ ] **Actionable**: Recommendations are specific and prioritized

### 8.2 Table Quality Criteria

- [ ] **Data Accuracy**: All values correctly mapped
- [ ] **Formatting**: Consistent column widths and alignment
- [ ] **Highlighting**: High-risk items properly emphasized
- [ ] **Sorting**: Correct sort order applied
- [ ] **Completeness**: All data rows present

### 8.3 Overall Report Quality

- [ ] **Structure**: All required sections present in order
- [ ] **Page Breaks**: Appropriate section separation
- [ ] **Branding**: Logo, colors, fonts correct
- [ ] **Consistency**: Terminology consistent throughout
- [ ] **Cross-References**: Internal references accurate
- [ ] **File Quality**: PDF renders correctly, no artifacts

---

## Conclusion

This Report Recipe Specification transforms the iterative learning from the MacQuarrie assessment into a reproducible system. The key innovations are:

1. **Recipes as Configuration**: Report structure is data, not code
2. **Narrative Prompts as Templates**: Voice and structure are parameterized
3. **Data Mapping**: Interview responses flow automatically to report sections
4. **Quality Constraints**: Output validation ensures professional standards

By implementing this specification, RiskFixer can generate reports of MacQuarrie quality across all assessment types, with the flexibility to refine and improve recipes based on continued iteration.

---

**END OF REPORT RECIPE SPECIFICATION**
