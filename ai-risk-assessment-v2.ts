/**
 * RiskFixer AI Risk Assessment Service v2.0
 * 
 * IMPROVEMENTS IN THIS VERSION:
 * - Integrated BASE_SYSTEM_PROMPT from system-prompt-base.ts
 * - Support for both rich (audit-trail) and flat (backward-compatible) response formats
 * - Transform layer for response compatibility
 * - Fixed UTF-8 encoding for T×V×I formula
 * - Removed duplicate rubric injection (now in system prompt only)
 * - Added validation using helper functions from system-prompt-base
 * - Enhanced error handling and logging
 * 
 * @author RiskFixer Team
 * @version 2.0
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 */

import OpenAI from 'openai';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import {
  assessments,
  riskScenarios,
  threats,
  controls,
  facilitySurveys,
  scenarioControls,
} from '@shared/schema';

// Import from system-prompt-base.ts
import {
  BASE_SYSTEM_PROMPT,
  RISK_CLASSIFICATION,
  RUBRIC_LABELS,
  getRiskClassification,
  validateScoreLabel,
} from './system-prompt-base';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export type TemplateType = 
  | 'office_building'
  | 'retail_store'
  | 'warehouse'
  | 'datacenter'
  | 'manufacturing'
  | 'executive_protection';

export interface FacilityContext {
  assessmentId: number;
  templateType: TemplateType;
  interviewResponses: Record<string, any>;
  photoAnalysisFindings?: string[];
  incidentHistory?: IncidentRecord[];
  controlInventory?: ControlStatus[];
  geographicData?: GeographicIntel;
  operationalProfile?: OperationalProfile;
}

export interface IncidentRecord {
  date: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface ControlStatus {
  controlId: string;
  controlName: string;
  status: 'implemented' | 'partial' | 'planned' | 'not_implemented';
  effectiveness: number;
  lastTested?: string;
  notes?: string;
}

export interface GeographicIntel {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  capIndexScore?: number;
  capIndexTheftScore?: number;
  capIndexViolentScore?: number;
  crimeRatePerCapita?: number;
  neighborhoodRating?: string;
}

export interface OperationalProfile {
  operatingHours?: string;
  employeeCount?: number;
  visitorVolume?: string;
  assetValue?: string;
  sensitiveData?: boolean;
  publicFacing?: boolean;
  industryType?: string;
}

export interface ThreatAssessmentRequest {
  threatId: string;
  threatName: string;
  threatCategory: string;
  asisCode?: string;
  context: FacilityContext;
}

/**
 * Flat response format for backward compatibility with existing database schema
 */
export interface AIAssessmentResponse {
  threatId: string;
  threatLikelihood: number;
  threatLikelihoodLabel: string;
  threatLikelihoodEvidence: string[];
  threatLikelihoodReasoning: string;
  vulnerability: number;
  vulnerabilityLabel: string;
  vulnerabilityEvidence: string[];
  vulnerabilityReasoning: string;
  impact: number;
  impactLabel: string;
  impactEvidence: string[];
  impactReasoning: string;
  inherentRisk: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  suggestedControls: string[];
  insufficientDataFlags: string[];
  confidence: 'high' | 'medium' | 'low';
  scenarioDescription?: string;
  evidenceTrail?: string[];
}

/**
 * Rich response format matching BASE_SYSTEM_PROMPT output specification
 * This format is better for audit trails and PDF reports
 */
export interface RichAIAssessmentResponse {
  threat_likelihood: {
    score: number;
    label: string;
    evidence: string[];
    reasoning: string;
    confidence: 'High' | 'Medium' | 'Low';
    data_gaps: string[];
  };
  vulnerability: {
    score: number;
    label: string;
    control_gaps: string[];
    existing_controls: string[];
    reasoning: string;
    confidence: 'High' | 'Medium' | 'Low';
    data_gaps: string[];
  };
  impact: {
    score: number;
    label: string;
    financial_range: string;
    safety_impact: string;
    operational_impact: string;
    regulatory_impact: string;
    reputational_impact: string;
    reasoning: string;
    confidence: 'High' | 'Medium' | 'Low';
    data_gaps: string[];
  };
  inherent_risk: {
    score: number;
    calculation: string;
    classification: string;
    confidence: 'High' | 'Medium' | 'Low';
  };
  scenario_description: string;
  priority_controls: Array<{
    control_name: string;
    standard_reference: string;
    addresses_vulnerability: string;
    implementation_priority: 'Immediate' | 'Short-term' | 'Medium-term';
    estimated_cost_range: string;
    risk_reduction_estimate: string;
  }>;
  evidence_trail: string[];
  assessment_metadata: {
    assessed_date: string;
    methodology: string;
    assessor_qualification: string;
    data_quality: 'High' | 'Medium' | 'Low';
    review_recommended: 'Yes' | 'No';
  };
}

export interface NarrativeRequest {
  assessmentId: number;
  templateType: TemplateType;
  riskScenarios: RiskScenarioSummary[];
  facilityContext: FacilityContext;
  narrativeType: 'executive_summary' | 'risk_landscape' | 'recommendations' | 'full_report';
}

export interface RiskScenarioSummary {
  threatName: string;
  threatCategory: string;
  threatLikelihood: number;
  vulnerability: number;
  impact: number;
  inherentRisk: number;
  residualRisk?: number;
  riskLevel: string;
  scenarioDescription?: string;
  appliedControls?: string[];
}

export interface GeneratedNarrative {
  narrativeType: string;
  content: string;
  keyFindings: string[];
  priorityRecommendations: string[];
  generatedAt: string;
}

export interface ControlExplanation {
  controlId: string;
  controlName: string;
  whySuggested: string;
  standardsReference: string[];
  expectedEffectiveness: number;
  implementationPriority: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  estimatedCost: 'low' | 'medium' | 'high';
  relatedThreats: string[];
}

// ============================================================================
// INDUSTRY STANDARDS LIBRARY (Layer 3)
// ============================================================================

const INDUSTRY_STANDARDS: Record<TemplateType, string> = {
  office_building: `
APPLICABLE STANDARDS FOR OFFICE BUILDING ASSESSMENTS:

1. ASIS International Standards:
   - ASIS GDL-RA (General Security Risk Assessment Guideline)
   - ASIS POA (Physical Asset Protection)
   - ASIS WVPI (Workplace Violence Prevention and Intervention)
   - ASIS ESRM (Enterprise Security Risk Management)

2. Building Security Standards:
   - ANSI/ASIS PSC.1-2012 (Quality Assurance and Management)
   - NFPA 730 (Premises Security)
   - NFPA 731 (Electronic Security Systems)

3. Access Control Standards:
   - UL 294 (Access Control System Units)
   - NIST SP 800-116 (PIV Card Access Control)

4. CPTED Principles:
   - Natural Surveillance
   - Natural Access Control
   - Territorial Reinforcement
   - Maintenance and Management

5. Workplace Violence Prevention:
   - OSHA General Duty Clause (Section 5(a)(1))
   - ASIS/SHRM Workplace Violence Prevention Standard
`,

  retail_store: `
APPLICABLE STANDARDS FOR RETAIL STORE ASSESSMENTS:

1. Retail Security Standards:
   - NRF (National Retail Federation) LP Standards
   - NRF ORC (Organized Retail Crime) Guidelines
   - RILA (Retail Industry Leaders Association) Asset Protection Standards

2. Shrinkage Prevention:
   - NRF Shrinkage Survey Methodology
   - LPRC (Loss Prevention Research Council) Best Practices
   - EAS (Electronic Article Surveillance) Standards

3. ASIS International Standards:
   - ASIS GDL-RA (General Security Risk Assessment Guideline)
   - ASIS Retail Security Council Guidelines

4. Cash Handling:
   - ASIS Cash-in-Transit Guidelines
   - Armored Car Industry Standards

5. CPTED for Retail:
   - Store Layout Optimization
   - Sightline Management
   - Transaction Area Security
`,

  warehouse: `
APPLICABLE STANDARDS FOR WAREHOUSE/DISTRIBUTION ASSESSMENTS:

1. Cargo Security Standards:
   - TAPA FSR (Facility Security Requirements) 2020
   - TAPA TSR (Trucking Security Requirements)
   - C-TPAT (Customs-Trade Partnership Against Terrorism)
   - AEO (Authorized Economic Operator) Requirements

2. Inventory Control:
   - ISO 28000 (Supply Chain Security Management)
   - ISO 28001 (Best Practices for Supply Chain Security)

3. Loading Dock Security:
   - ASIS Loading Dock Security Guidelines
   - CargoNet Theft Prevention Best Practices

4. ASIS International Standards:
   - ASIS GDL-RA (General Security Risk Assessment Guideline)
   - ASIS Warehouse Security Guidelines

5. Fleet Security:
   - GPS Tracking Standards
   - Driver Verification Protocols
   - Seal Integrity Programs
`,

  datacenter: `
APPLICABLE STANDARDS FOR DATACENTER ASSESSMENTS:

1. Primary Compliance Frameworks:
   - SOC 2 Type II (Trust Services Criteria)
   - ISO 27001 (Information Security Management)
   - ISO 27002 (Security Controls)
   - PCI DSS 4.0 (Payment Card Industry)

2. Physical Security Standards:
   - TIA-942 (Datacenter Standards)
   - Uptime Institute Tier Classifications
   - BICSI 002 (Datacenter Design)

3. Access Control:
   - NIST SP 800-53 (Security Controls)
   - FIPS 201 (PIV Standards)
   - Biometric Standards (ISO/IEC 19795)

4. Environmental Controls:
   - ASHRAE (Environmental Guidelines)
   - FM Global (Fire Protection)
   - NFPA 75 (IT Equipment Protection)

5. Redundancy Requirements:
   - N+1 / 2N Power Configurations
   - Geographic Diversity Standards
`,

  manufacturing: `
APPLICABLE STANDARDS FOR MANUFACTURING FACILITY ASSESSMENTS:

1. Industrial Security Standards:
   - ASIS Industrial Security Guidelines
   - CFATS (Chemical Facility Anti-Terrorism Standards) if applicable
   - MTSA (Maritime Transportation Security Act) if applicable

2. Process Safety:
   - OSHA PSM (Process Safety Management)
   - EPA RMP (Risk Management Program)
   - NFPA 652 (Combustible Dust)

3. ASIS International Standards:
   - ASIS GDL-RA (General Security Risk Assessment Guideline)
   - ASIS Facilities Physical Security Measures

4. Supply Chain Security:
   - C-TPAT Requirements
   - ISO 28000 Supply Chain Security

5. Intellectual Property Protection:
   - Trade Secret Protection Standards
   - NIST Cybersecurity Framework (manufacturing overlay)
`,

  executive_protection: `
APPLICABLE STANDARDS FOR EXECUTIVE PROTECTION ASSESSMENTS:

1. ASIS International Standards:
   - ASIS CPP Body of Knowledge - Executive Protection
   - ASIS ESRM (Enterprise Security Risk Management)
   - ASIS Chief Security Officer Standard

2. Threat Assessment:
   - ASIS WVPI (fixated person indicators)
   - US Secret Service Threat Assessment Research
   - FBI Active Shooter Research

3. Travel Security:
   - US State Department OSAC Guidelines
   - International SOS Risk Ratings
   - Travel Risk Management Standards

4. Residential Security:
   - ASIS Residential Security Guidelines
   - CPTED for Residential Applications
   - Safe Room Standards (FEMA 320/361)

5. Communications Security:
   - NIST Guidelines for Executive Communications
   - Social Media Risk Mitigation
   - OPSEC Principles
`,
};

// ============================================================================
// CONTROL EFFECTIVENESS DATA (Layer 5)
// ============================================================================

const CONTROL_EFFECTIVENESS: Record<string, {
  name: string;
  baseEffectiveness: number;
  category: string;
  evidenceSources: string[];
}> = {
  perimeter_fence: {
    name: 'Perimeter Fencing',
    baseEffectiveness: 0.15,
    category: 'physical_barrier',
    evidenceSources: ['ASIS POA', 'CPTED Research'],
  },
  access_control_electronic: {
    name: 'Electronic Access Control',
    baseEffectiveness: 0.25,
    category: 'access_control',
    evidenceSources: ['UL 294', 'ASIS Access Control Guidelines'],
  },
  cctv_monitored: {
    name: 'Monitored CCTV System',
    baseEffectiveness: 0.20,
    category: 'surveillance',
    evidenceSources: ['ASIS Surveillance Research', 'UK Home Office Studies'],
  },
  security_guard_24_7: {
    name: '24/7 Security Officer Presence',
    baseEffectiveness: 0.30,
    category: 'personnel',
    evidenceSources: ['ASIS Private Security Officer Standards', 'Insurance Industry Data'],
  },
  intrusion_detection: {
    name: 'Intrusion Detection System',
    baseEffectiveness: 0.20,
    category: 'detection',
    evidenceSources: ['UL 681', 'NFPA 731'],
  },
  visitor_management: {
    name: 'Visitor Management System',
    baseEffectiveness: 0.15,
    category: 'access_control',
    evidenceSources: ['ASIS Visitor Management Guidelines'],
  },
  security_lighting: {
    name: 'Security Lighting',
    baseEffectiveness: 0.10,
    category: 'deterrence',
    evidenceSources: ['IESNA Security Lighting Standards', 'CPTED Research'],
  },
  employee_training: {
    name: 'Security Awareness Training',
    baseEffectiveness: 0.15,
    category: 'human_factors',
    evidenceSources: ['ASIS Security Awareness Guidelines'],
  },
  background_checks: {
    name: 'Pre-Employment Background Checks',
    baseEffectiveness: 0.20,
    category: 'personnel_security',
    evidenceSources: ['ASIS Pre-Employment Screening Guidelines', 'SHRM Standards'],
  },
  emergency_response_plan: {
    name: 'Documented Emergency Response Plan',
    baseEffectiveness: 0.15,
    category: 'response',
    evidenceSources: ['NFPA 1600', 'ASIS Business Continuity Guideline'],
  },
};

// ============================================================================
// AI SERVICE CONFIGURATION
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 4000,
  assessmentModel: 'gpt-4o',
  narrativeModel: 'gpt-4o',
};

// ============================================================================
// SYSTEM PROMPT GENERATION (Layer 2 + Layer 3)
// ============================================================================

/**
 * Generate the grounded system prompt for AI assessments
 * Now integrates BASE_SYSTEM_PROMPT from system-prompt-base.ts
 */
function generateSystemPrompt(templateType: TemplateType): string {
  const industryStandards = INDUSTRY_STANDARDS[templateType] || '';
  
  // Append template-specific standards to the base prompt
  return `${BASE_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════════════════════════
TEMPLATE-SPECIFIC STANDARDS: ${templateType.toUpperCase().replace(/_/g, ' ')}
═══════════════════════════════════════════════════════════════════════════════
${industryStandards}
`;
}

/**
 * Generate the user prompt for threat assessment
 * IMPROVED: Removed duplicate rubric injection (now only in system prompt)
 */
function generateThreatAssessmentPrompt(request: ThreatAssessmentRequest): string {
  const { threatId, threatName, threatCategory, asisCode, context } = request;

  // Build facility profile from interview responses
  const facilityProfile = buildFacilityProfile(context);

  // Build threat intelligence context
  const threatIntel = buildThreatIntelligenceContext(
    context.templateType,
    context.geographicData,
    context.incidentHistory
  );

  // Build control inventory section
  const controlSection = buildControlInventorySection(context.controlInventory);

  // Build photo findings section
  const photoSection = context.photoAnalysisFindings?.length
    ? `## PHOTO ANALYSIS FINDINGS\n${context.photoAnalysisFindings.map(f => `- ${f}`).join('\n')}`
    : '## PHOTO ANALYSIS FINDINGS\nNo photos analyzed for this assessment.';

  // Extract relevant interview responses for this threat
  const relevantResponses = extractRelevantResponses(context.interviewResponses, threatCategory);

  // NOTE: Rubrics are now in the system prompt only - no longer duplicated here
  return `## ASSESSMENT REQUEST

Assess the following threat for this ${context.templateType.replace(/_/g, ' ')} facility:

**Threat:** ${threatName}
**Category:** ${threatCategory}
**ASIS Code:** ${asisCode || 'N/A'}

---

${facilityProfile}

---

${threatIntel}

---

${controlSection}

---

${photoSection}

---

## RELEVANT INTERVIEW RESPONSES

${relevantResponses}

---

## REQUIRED OUTPUT

Provide your assessment in the JSON format specified in the system prompt.
Ensure you cite specific evidence from the data provided above.

For this threat (${threatId}), assess:
1. Threat Likelihood (T) - probability of attempt based on evidence
2. Vulnerability (V) - control effectiveness against this specific threat
3. Impact (I) - consequence severity if attack succeeds

Calculate: Inherent Risk = T × V × I`;
}

// ============================================================================
// CONTEXT BUILDING FUNCTIONS
// ============================================================================

function buildFacilityProfile(context: FacilityContext): string {
  const { operationalProfile, interviewResponses, templateType } = context;

  const sections: string[] = ['## FACILITY PROFILE'];

  if (operationalProfile) {
    sections.push(`
**Operating Hours:** ${operationalProfile.operatingHours || 'Not specified'}
**Employee Count:** ${operationalProfile.employeeCount || 'Not specified'}
**Visitor Volume:** ${operationalProfile.visitorVolume || 'Not specified'}
**Asset Value Category:** ${operationalProfile.assetValue || 'Not specified'}
**Sensitive Data Present:** ${operationalProfile.sensitiveData ? 'Yes' : 'No'}
**Public Facing:** ${operationalProfile.publicFacing ? 'Yes' : 'No'}
**Industry:** ${operationalProfile.industryType || 'Not specified'}
`);
  }

  const profileQuestions = [
    'facility_type',
    'building_type',
    'square_footage',
    'floors',
    'tenant_type',
    'ownership',
    'age_of_building',
  ];

  const profileData = profileQuestions
    .filter(q => interviewResponses[q] !== undefined)
    .map(q => `- ${q.replace(/_/g, ' ')}: ${interviewResponses[q]}`)
    .join('\n');

  if (profileData) {
    sections.push(`
**Additional Profile Data from Interview:**
${profileData}
`);
  }

  return sections.join('\n');
}

function buildThreatIntelligenceContext(
  templateType: TemplateType,
  geographicData?: GeographicIntel,
  incidentHistory?: IncidentRecord[]
): string {
  const sections: string[] = ['## THREAT INTELLIGENCE CONTEXT'];

  // Geographic risk data
  if (geographicData) {
    sections.push(`
### Geographic Risk Profile

Location: ${geographicData.address || 'Not specified'}
${geographicData.city ? `City: ${geographicData.city}` : ''}
${geographicData.state ? `State: ${geographicData.state}` : ''}
${geographicData.zipCode ? `ZIP: ${geographicData.zipCode}` : ''}

CAP Index Scores (if available):
- Overall Crime Score: ${geographicData.capIndexScore ?? 'Not available'}
- Theft Score: ${geographicData.capIndexTheftScore ?? 'Not available'}
- Violent Crime Score: ${geographicData.capIndexViolentScore ?? 'Not available'}

Interpretation Guide:
- Scores 0-99: Below average risk
- Score 100: National average
- Scores 100-199: Moderately elevated risk
- Scores 200-399: Significantly elevated risk
- Scores 400+: Substantially elevated risk
`);
  }

  // Incident history
  if (incidentHistory && incidentHistory.length > 0) {
    const recentIncidents = incidentHistory
      .slice(0, 10)
      .map(i => `- ${i.date}: ${i.type} (${i.severity}) - ${i.description}`)
      .join('\n');

    const incidentCounts = incidentHistory.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    sections.push(`
### Incident History

Total Incidents Recorded: ${incidentHistory.length}

Incident Breakdown by Type:
${Object.entries(incidentCounts).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

Recent Incidents:
${recentIncidents}
`);
  }

  // Template-specific threat context
  const templateContext = getTemplateSpecificThreatContext(templateType);
  if (templateContext) {
    sections.push(templateContext);
  }

  return sections.join('\n\n');
}

function getTemplateSpecificThreatContext(templateType: TemplateType): string {
  const contexts: Record<TemplateType, string> = {
    office_building: `
### OFFICE BUILDING THREAT LANDSCAPE

Primary Threat Categories:
1. Unauthorized Access (tailgating, credential theft, social engineering)
2. Workplace Violence (active threat, employee conflict, domestic spillover)
3. Theft (property, equipment, intellectual property)
4. Cyber-Physical Attacks (access control compromise, surveillance hijacking)
5. Espionage/Corporate Spying (technical surveillance, insider threats)

Industry Statistics (ASIS/FBI):
- 2+ million workplace violence incidents annually in US
- Average office theft loss: $50,000+ for equipment theft
- 85% of unauthorized entries via social engineering or tailgating
`,

    retail_store: `
### RETAIL THREAT LANDSCAPE

Primary Threat Categories:
1. Organized Retail Crime (ORC) - coordinated theft rings
2. Shoplifting/Internal Theft - shrinkage drivers
3. Robbery - till and safe targeting
4. Fraud - payment and return fraud schemes
5. Workplace Violence - customer and employee incidents

Industry Statistics (NRF 2024):
- Average shrinkage rate: 1.6% of sales
- ORC losses: $125+ billion annually
- Employee theft: 35% of shrinkage
- Shoplifting: 37% of shrinkage
`,

    warehouse: `
### WAREHOUSE/DISTRIBUTION THREAT LANDSCAPE

Primary Threat Categories:
1. Cargo Theft - in-transit and facility-based
2. Internal Theft - employee collusion, inventory manipulation
3. Unauthorized Access - after-hours intrusion
4. Freight Fraud - fictitious pickups, identity theft
5. Supply Chain Disruption - targeted sabotage

Industry Statistics (CargoNet/FBI):
- $30+ billion annual cargo theft losses in US
- Average cargo theft: $150,000+
- California, Texas, Florida highest theft states
- Electronics, pharmaceuticals, retail goods most targeted
`,

    datacenter: `
### DATACENTER THREAT LANDSCAPE

Primary Threat Categories:
1. Physical Intrusion - unauthorized facility access
2. Insider Threats - malicious or negligent employees
3. Environmental Hazards - power, cooling, fire
4. Cyber-Physical Attacks - network-based physical system compromise
5. Sabotage - competitor or state-sponsored

Industry Context:
- SOC 2 Type II compliance mandates
- Uptime Institute availability requirements
- Customer SLA penalties for outages
- Regulatory exposure (HIPAA, PCI, GDPR)
`,

    manufacturing: `
### MANUFACTURING THREAT LANDSCAPE

Primary Threat Categories:
1. Industrial Espionage - trade secret theft
2. Sabotage - production disruption
3. Workplace Violence - labor disputes, disgruntled employees
4. Theft - raw materials, finished goods, equipment
5. Process Safety Incidents - security implications

Industry Context:
- High-value machinery and tooling targets
- Supply chain security requirements
- Shift operation security gaps
- Contractor access management challenges
`,

    executive_protection: `
### EXECUTIVE PROTECTION THREAT LANDSCAPE

Primary Threat Categories:
1. Targeted Violence - stalking, harassment, assault
2. Kidnapping/Ransom - executive and family targeting
3. Reputation Attacks - coordinated campaigns
4. Privacy Violations - surveillance, information gathering
5. Travel Security - transit vulnerabilities

Threat Actor Categories:
- Fixated individuals (stalkers, obsessed persons)
- Disgruntled former employees
- Business competitors
- Activists/protestors
- Criminals (robbery, kidnapping)
- State actors (espionage, surveillance)
`,
  };

  return contexts[templateType] || '';
}

function buildControlInventorySection(controls?: ControlStatus[]): string {
  if (!controls || controls.length === 0) {
    return '## CURRENT SECURITY CONTROLS\nNo control inventory available.';
  }

  const implemented = controls.filter(c => c.status === 'implemented');
  const partial = controls.filter(c => c.status === 'partial');
  const planned = controls.filter(c => c.status === 'planned');
  const notImplemented = controls.filter(c => c.status === 'not_implemented');

  return `## CURRENT SECURITY CONTROLS

**Fully Implemented (${implemented.length}):**
${implemented.map(c => `- ${c.controlName} (${c.effectiveness}% effective)`).join('\n') || 'None'}

**Partially Implemented (${partial.length}):**
${partial.map(c => `- ${c.controlName} (${c.effectiveness}% effective) - ${c.notes || 'No notes'}`).join('\n') || 'None'}

**Planned (${planned.length}):**
${planned.map(c => `- ${c.controlName}`).join('\n') || 'None'}

**Not Implemented (${notImplemented.length}):**
${notImplemented.map(c => `- ${c.controlName}`).join('\n') || 'None'}
`;
}

function extractRelevantResponses(
  responses: Record<string, any>,
  threatCategory: string
): string {
  const categoryToSections: Record<string, string[]> = {
    'Physical Intrusion': ['perimeter', 'entry', 'access', 'fence', 'door', 'window', 'barrier'],
    'Theft': ['surveillance', 'cctv', 'inventory', 'asset', 'valuable', 'lock', 'safe'],
    'Workplace Violence': ['emergency', 'threat', 'violence', 'training', 'duress', 'panic'],
    'Cyber-Physical': ['network', 'cyber', 'access_control', 'system', 'it_security'],
    'Espionage': ['visitor', 'contractor', 'sensitive', 'confidential', 'nda'],
    'Natural Disaster': ['emergency', 'backup', 'flood', 'fire', 'weather', 'evacuation'],
    'Cargo Theft': ['loading', 'dock', 'trailer', 'seal', 'inventory', 'shipping'],
    'Organized Retail Crime': ['shrink', 'theft', 'orc', 'eas', 'fitting_room'],
    'Executive Targeting': ['executive', 'travel', 'residence', 'family', 'social_media'],
  };

  const relevantPrefixes = categoryToSections[threatCategory] || [];
  
  const relevantEntries = Object.entries(responses)
    .filter(([key]) => 
      relevantPrefixes.some(prefix => 
        key.toLowerCase().includes(prefix)
      )
    )
    .map(([key, value]) => `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join('\n');

  return relevantEntries || 'No directly relevant interview responses found for this threat category.';
}

// ============================================================================
// RESPONSE TRANSFORMATION (NEW IN V2)
// ============================================================================

/**
 * Transform rich AI response to flat format for backward compatibility
 * Preserves full response in optional properties for PDF generation
 */
function transformRichToFlat(
  richResponse: RichAIAssessmentResponse,
  threatId: string
): AIAssessmentResponse {
  return {
    threatId,
    threatLikelihood: richResponse.threat_likelihood.score,
    threatLikelihoodLabel: richResponse.threat_likelihood.label,
    threatLikelihoodEvidence: richResponse.threat_likelihood.evidence,
    threatLikelihoodReasoning: richResponse.threat_likelihood.reasoning,
    vulnerability: richResponse.vulnerability.score,
    vulnerabilityLabel: richResponse.vulnerability.label,
    vulnerabilityEvidence: richResponse.vulnerability.control_gaps,
    vulnerabilityReasoning: richResponse.vulnerability.reasoning,
    impact: richResponse.impact.score,
    impactLabel: richResponse.impact.label,
    impactEvidence: [
      richResponse.impact.financial_range,
      richResponse.impact.safety_impact,
      richResponse.impact.operational_impact,
      richResponse.impact.regulatory_impact,
      richResponse.impact.reputational_impact,
    ].filter(Boolean),
    impactReasoning: richResponse.impact.reasoning,
    inherentRisk: richResponse.inherent_risk.score,
    riskLevel: richResponse.inherent_risk.classification.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
    suggestedControls: richResponse.priority_controls?.map(c => c.control_name) || [],
    insufficientDataFlags: [
      ...(richResponse.threat_likelihood.data_gaps || []),
      ...(richResponse.vulnerability.data_gaps || []),
      ...(richResponse.impact.data_gaps || []),
    ],
    confidence: (richResponse.threat_likelihood.confidence?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low',
    scenarioDescription: richResponse.scenario_description,
    evidenceTrail: richResponse.evidence_trail,
  };
}

/**
 * Detect response format and parse accordingly
 */
function detectAndParseResponse(
  responseText: string,
  threatId: string
): { rich: RichAIAssessmentResponse | null; flat: AIAssessmentResponse } {
  // Extract JSON from response
  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Invalid JSON in AI response: ${e}`);
  }

  // Detect format by checking for nested structure
  const isRichFormat = parsed.threat_likelihood && typeof parsed.threat_likelihood === 'object';

  if (isRichFormat) {
    // Validate rich format
    const richResponse = parsed as RichAIAssessmentResponse;
    
    // Validate scores using imported helper
    if (!validateScoreLabel(richResponse.threat_likelihood.score, richResponse.threat_likelihood.label, 'THREAT')) {
      console.warn(`Score/label mismatch for threat_likelihood: ${richResponse.threat_likelihood.score} / ${richResponse.threat_likelihood.label}`);
    }
    if (!validateScoreLabel(richResponse.vulnerability.score, richResponse.vulnerability.label, 'VULNERABILITY')) {
      console.warn(`Score/label mismatch for vulnerability: ${richResponse.vulnerability.score} / ${richResponse.vulnerability.label}`);
    }
    if (!validateScoreLabel(richResponse.impact.score, richResponse.impact.label, 'IMPACT')) {
      console.warn(`Score/label mismatch for impact: ${richResponse.impact.score} / ${richResponse.impact.label}`);
    }

    return {
      rich: richResponse,
      flat: transformRichToFlat(richResponse, threatId),
    };
  } else {
    // Handle legacy flat format
    const flatResponse = parseAndValidateFlatResponse(parsed, threatId);
    return {
      rich: null,
      flat: flatResponse,
    };
  }
}

/**
 * Parse and validate flat response format (backward compatibility)
 */
function parseAndValidateFlatResponse(
  parsed: any,
  threatId: string
): AIAssessmentResponse {
  const validatedResponse: AIAssessmentResponse = {
    threatId: parsed.threatId || threatId,
    threatLikelihood: clampScore(parsed.threatLikelihood),
    threatLikelihoodLabel: RUBRIC_LABELS.THREAT[clampScore(parsed.threatLikelihood) - 1],
    threatLikelihoodEvidence: ensureArray(parsed.threatLikelihoodEvidence),
    threatLikelihoodReasoning: parsed.threatLikelihoodReasoning || '',
    vulnerability: clampScore(parsed.vulnerability),
    vulnerabilityLabel: RUBRIC_LABELS.VULNERABILITY[clampScore(parsed.vulnerability) - 1],
    vulnerabilityEvidence: ensureArray(parsed.vulnerabilityEvidence),
    vulnerabilityReasoning: parsed.vulnerabilityReasoning || '',
    impact: clampScore(parsed.impact),
    impactLabel: RUBRIC_LABELS.IMPACT[clampScore(parsed.impact) - 1],
    impactEvidence: ensureArray(parsed.impactEvidence),
    impactReasoning: parsed.impactReasoning || '',
    inherentRisk: 0,
    riskLevel: 'medium',
    suggestedControls: ensureArray(parsed.suggestedControls),
    insufficientDataFlags: ensureArray(parsed.insufficientDataFlags),
    confidence: validateConfidence(parsed.confidence),
  };

  // Calculate inherent risk
  validatedResponse.inherentRisk = 
    validatedResponse.threatLikelihood * 
    validatedResponse.vulnerability * 
    validatedResponse.impact;

  // Use imported helper for risk classification
  const classification = getRiskClassification(validatedResponse.inherentRisk);
  validatedResponse.riskLevel = classification.level.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';

  return validatedResponse;
}

function clampScore(score: any): number {
  const num = Number(score);
  if (isNaN(num)) return 3;
  return Math.min(5, Math.max(1, Math.round(num)));
}

function ensureArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return [value];
  return [];
}

function validateConfidence(confidence: any): 'high' | 'medium' | 'low' {
  const valid = ['high', 'medium', 'low'];
  const normalized = String(confidence).toLowerCase();
  return valid.includes(normalized) ? normalized as 'high' | 'medium' | 'low' : 'medium';
}

// ============================================================================
// CORE AI ASSESSMENT FUNCTIONS
// ============================================================================

/**
 * Assess a single threat using AI with grounded context
 * Returns both rich format (for PDF reports) and flat format (for database)
 */
export async function assessThreat(
  request: ThreatAssessmentRequest
): Promise<AIAssessmentResponse> {
  const systemPrompt = generateSystemPrompt(request.context.templateType);
  const userPrompt = generateThreatAssessmentPrompt(request);

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.assessmentModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse and validate response (handles both formats)
    const { flat } = detectAndParseResponse(responseText, request.threatId);
    
    return flat;
  } catch (error) {
    console.error('AI threat assessment error:', error);
    throw new Error(`Failed to assess threat ${request.threatId}: ${error}`);
  }
}

/**
 * Assess threat and return both response formats
 * Use this when you need the full rich response for PDF generation
 */
export async function assessThreatFull(
  request: ThreatAssessmentRequest
): Promise<{ rich: RichAIAssessmentResponse | null; flat: AIAssessmentResponse }> {
  const systemPrompt = generateSystemPrompt(request.context.templateType);
  const userPrompt = generateThreatAssessmentPrompt(request);

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.assessmentModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    return detectAndParseResponse(responseText, request.threatId);
  } catch (error) {
    console.error('AI threat assessment error:', error);
    throw new Error(`Failed to assess threat ${request.threatId}: ${error}`);
  }
}

// ============================================================================
// NARRATIVE GENERATION
// ============================================================================

/**
 * Generate AI-powered narrative content for reports
 */
export async function generateNarrative(
  request: NarrativeRequest
): Promise<GeneratedNarrative> {
  const { templateType, narrativeType, riskScenarios, facilityContext } = request;

  const systemPrompt = generateNarrativeSystemPrompt(templateType);
  const userPrompt = generateNarrativeUserPrompt(request);

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.narrativeModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 6000,
    });

    const content = completion.choices[0]?.message?.content || '';

    const keyFindings = extractKeyFindings(content, riskScenarios);
    const priorityRecommendations = extractPriorityRecommendations(content);

    return {
      narrativeType,
      content,
      keyFindings,
      priorityRecommendations,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('AI narrative generation error:', error);
    throw new Error(`Failed to generate ${narrativeType} narrative: ${error}`);
  }
}

function generateNarrativeSystemPrompt(templateType: TemplateType): string {
  return `You are a senior security consultant preparing a professional physical security assessment report. Your writing should be:

1. PROFESSIONAL: Use formal, objective language appropriate for C-suite executives and board members.

2. EVIDENCE-BASED: Every statement should trace back to specific findings from the assessment data.

3. ACTIONABLE: Recommendations should be specific, prioritized, and include implementation guidance.

4. RISK-FOCUSED: Frame findings in terms of business risk, not just security deficiencies.

5. INDUSTRY-ALIGNED: Reference relevant standards and best practices from:
${INDUSTRY_STANDARDS[templateType] || 'ASIS International Standards'}

Format guidelines:
- Write in clear, concise paragraphs
- Use professional security terminology appropriately
- Avoid alarmist language while being direct about risks
- Structure content logically with clear transitions
- Quantify risks where possible (T×V×I scores, dollar impacts)`;
}

function generateNarrativeUserPrompt(request: NarrativeRequest): string {
  const { narrativeType, riskScenarios, facilityContext } = request;

  const riskDist = riskScenarios.reduce((acc, s) => {
    acc[s.riskLevel] = (acc[s.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRisks = [...riskScenarios]
    .sort((a, b) => b.inherentRisk - a.inherentRisk)
    .slice(0, 5);

  const scenarioSummary = topRisks.map(s => 
    `- ${s.threatName}: T=${s.threatLikelihood}, V=${s.vulnerability}, I=${s.impact}, Score=${s.inherentRisk} (${s.riskLevel})`
  ).join('\n');

  const prompts: Record<string, string> = {
    executive_summary: `
Generate an EXECUTIVE SUMMARY (approximately 500-700 words) for this security assessment.

## ASSESSMENT OVERVIEW
- Template Type: ${facilityContext.templateType.replace(/_/g, ' ')}
- Total Risk Scenarios Assessed: ${riskScenarios.length}
- Risk Distribution: Critical=${riskDist.critical || 0}, High=${riskDist.high || 0}, Medium=${riskDist.medium || 0}, Low=${riskDist.low || 0}

## TOP RISK SCENARIOS
${scenarioSummary}

## FACILITY CONTEXT
${JSON.stringify(facilityContext.operationalProfile || {}, null, 2)}

The executive summary should include:
1. Opening statement on overall security posture
2. Key risk findings (top 3-5 concerns)
3. Most critical control gaps identified
4. Priority recommendations (3-5 specific actions)
5. Conclusion with risk trajectory statement

Write in a style suitable for presentation to executive leadership and the board.`,

    risk_landscape: `
Generate a RISK LANDSCAPE ANALYSIS (approximately 800-1000 words) for this security assessment.

## ALL RISK SCENARIOS
${riskScenarios.map(s => 
  `- ${s.threatName} (${s.threatCategory}): Score=${s.inherentRisk}, Level=${s.riskLevel}
    Description: ${s.scenarioDescription || 'N/A'}`
).join('\n')}

## RISK DISTRIBUTION
- Critical Risks: ${riskDist.critical || 0}
- High Risks: ${riskDist.high || 0}  
- Medium Risks: ${riskDist.medium || 0}
- Low Risks: ${riskDist.low || 0}

The risk landscape section should:
1. Analyze risk distribution patterns
2. Identify clustering of risks by category
3. Highlight systemic vulnerabilities affecting multiple threats
4. Compare to industry benchmarks where applicable
5. Provide visual summary recommendations (charts, tables)
6. Identify risk interdependencies`,

    recommendations: `
Generate a RECOMMENDATIONS section (approximately 600-800 words) for this security assessment.

## HIGHEST RISK SCENARIOS REQUIRING ACTION
${topRisks.map(s => 
  `- ${s.threatName}: Score=${s.inherentRisk}
    Applied Controls: ${s.appliedControls?.join(', ') || 'None'}
    Current Control Gaps: [identified from assessment]`
).join('\n\n')}

Structure recommendations as:
1. IMMEDIATE ACTIONS (0-30 days) - Address critical and high risks
2. SHORT-TERM IMPROVEMENTS (30-90 days) - Address medium risks
3. LONG-TERM ENHANCEMENTS (90+ days) - Programmatic improvements
4. BUDGET CONSIDERATIONS - Rough order of magnitude costs
5. IMPLEMENTATION SEQUENCE - Dependencies and priorities

Each recommendation should include:
- Specific control or action
- Which risks it addresses
- Expected effectiveness
- Relevant standard or best practice reference
- Priority ranking`,

    full_report: `
Generate a COMPLETE ASSESSMENT NARRATIVE that combines:
1. Executive Summary
2. Methodology Statement
3. Risk Landscape Analysis
4. Detailed Findings by Category
5. Control Gap Analysis
6. Prioritized Recommendations
7. Conclusion and Next Steps

Total length: approximately 2000-2500 words.

## ASSESSMENT DATA
Risk Scenarios: ${riskScenarios.length}
Risk Distribution: Critical=${riskDist.critical || 0}, High=${riskDist.high || 0}, Medium=${riskDist.medium || 0}, Low=${riskDist.low || 0}

## TOP RISKS
${scenarioSummary}

## FACILITY CONTEXT
${JSON.stringify(facilityContext.operationalProfile || {}, null, 2)}`,
  };

  return prompts[narrativeType] || prompts.executive_summary;
}

function extractKeyFindings(content: string, scenarios: RiskScenarioSummary[]): string[] {
  const findings: string[] = [];

  const criticalCount = scenarios.filter(s => s.riskLevel === 'critical').length;
  const highCount = scenarios.filter(s => s.riskLevel === 'high').length;

  if (criticalCount > 0) {
    findings.push(`${criticalCount} critical risk scenario(s) requiring immediate attention`);
  }
  if (highCount > 0) {
    findings.push(`${highCount} high-risk scenario(s) requiring action within 30 days`);
  }

  const categories = scenarios.reduce((acc, s) => {
    acc[s.threatCategory] = (acc[s.threatCategory] || 0) + s.inherentRisk;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  if (topCategories.length > 0) {
    findings.push(`Primary risk categories: ${topCategories.join(', ')}`);
  }

  return findings;
}

function extractPriorityRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^[\d\.\-\*]\s*(.+)$/);
    if (match && line.toLowerCase().includes('recommend')) {
      recommendations.push(match[1].trim());
    }
  }

  return recommendations.slice(0, 5);
}

// ============================================================================
// CONTROL RECOMMENDATION EXPLANATIONS
// ============================================================================

/**
 * Generate AI-powered explanation for why a control was suggested
 */
export async function explainControlRecommendation(
  controlId: string,
  controlName: string,
  threatName: string,
  threatCategory: string,
  vulnerabilityScore: number,
  templateType: TemplateType
): Promise<ControlExplanation> {
  const controlData = CONTROL_EFFECTIVENESS[controlId];
  const industryStandards = INDUSTRY_STANDARDS[templateType];

  const prompt = `As a CPP, explain why "${controlName}" is recommended for addressing the "${threatName}" threat.

Context:
- Threat Category: ${threatCategory}
- Current Vulnerability Score: ${vulnerabilityScore}/5
- Control Base Effectiveness: ${controlData?.baseEffectiveness || 'Unknown'}
- Control Category: ${controlData?.category || 'Unknown'}

Relevant Standards:
${industryStandards}

Provide a JSON response with:
{
  "whySuggested": "Clear explanation of why this control addresses this specific threat",
  "standardsReference": ["Specific standard references"],
  "expectedEffectiveness": 0-100 percentage,
  "implementationPriority": "immediate|short_term|medium_term|long_term",
  "estimatedCost": "low|medium|high",
  "relatedThreats": ["Other threats this control helps mitigate"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a CPP providing evidence-based control recommendations. Be specific and cite standards.' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const parsed = JSON.parse(responseText);

    return {
      controlId,
      controlName,
      whySuggested: parsed.whySuggested || '',
      standardsReference: ensureArray(parsed.standardsReference),
      expectedEffectiveness: Number(parsed.expectedEffectiveness) || 50,
      implementationPriority: parsed.implementationPriority || 'medium_term',
      estimatedCost: parsed.estimatedCost || 'medium',
      relatedThreats: ensureArray(parsed.relatedThreats),
    };
  } catch (error) {
    console.error('Control explanation error:', error);
    throw new Error(`Failed to explain control ${controlId}: ${error}`);
  }
}

// ============================================================================
// PHOTO ANALYSIS
// ============================================================================

/**
 * Analyze a security photo using GPT-4 Vision
 */
export async function analyzeSecurityPhoto(
  imageBase64: string,
  templateType: TemplateType,
  focusAreas?: string[]
): Promise<string[]> {
  const focusContext = focusAreas?.length
    ? `Focus particularly on: ${focusAreas.join(', ')}`
    : '';

  const prompt = `Analyze this ${templateType.replace(/_/g, ' ')} facility photo from a physical security perspective.

Identify and list specific security-relevant observations:
- Physical barriers and access points
- Surveillance equipment (CCTV, lighting)
- Access control mechanisms
- Potential vulnerabilities
- Environmental factors affecting security
- CPTED elements (natural surveillance, territorial definition)

${focusContext}

Provide your findings as a JSON array of specific observations:
["Finding 1 about specific security element", "Finding 2 about vulnerability", ...]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      return responseText.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[\-\*\d\.]\s*/, '').trim());
    }

    return [];
  } catch (error) {
    console.error('Photo analysis error:', error);
    throw new Error(`Failed to analyze photo: ${error}`);
  }
}

// ============================================================================
// BATCH ASSESSMENT FUNCTION
// ============================================================================

/**
 * Assess all threats for an assessment using AI
 */
export async function assessAllThreats(
  assessmentId: number,
  templateType: TemplateType,
  threatLibrary: Array<{
    id: string;
    name: string;
    category: string;
    asisCode?: string;
  }>,
  facilityContext: FacilityContext
): Promise<{
  success: boolean;
  assessedCount: number;
  results: AIAssessmentResponse[];
  errors: string[];
}> {
  const results: AIAssessmentResponse[] = [];
  const errors: string[] = [];

  for (const threat of threatLibrary) {
    try {
      const result = await assessThreat({
        threatId: threat.id,
        threatName: threat.name,
        threatCategory: threat.category,
        asisCode: threat.asisCode,
        context: facilityContext,
      });
      
      results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      const errorMsg = `Failed to assess ${threat.name}: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  return {
    success: errors.length === 0,
    assessedCount: results.length,
    results,
    errors,
  };
}

// ============================================================================
// DATABASE INTEGRATION HELPERS
// ============================================================================

/**
 * Load facility context from database for an assessment
 */
export async function loadFacilityContext(
  assessmentId: number
): Promise<FacilityContext | null> {
  try {
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
    });

    if (!assessment) {
      return null;
    }

    const survey = await db.query.facilitySurveys.findFirst({
      where: eq(facilitySurveys.assessmentId, assessmentId),
      orderBy: [desc(facilitySurveys.createdAt)],
    });

    const interviewResponses = survey?.surveyData
      ? (typeof survey.surveyData === 'string'
          ? JSON.parse(survey.surveyData)
          : survey.surveyData)
      : {};

    const templateType = (assessment.templateId || 'office_building') as TemplateType;

    const context: FacilityContext = {
      assessmentId,
      templateType,
      interviewResponses,
      operationalProfile: extractOperationalProfile(interviewResponses),
      geographicData: extractGeographicData(interviewResponses),
    };

    return context;
  } catch (error) {
    console.error('Error loading facility context:', error);
    return null;
  }
}

function extractOperationalProfile(responses: Record<string, any>): OperationalProfile {
  return {
    operatingHours: responses.operating_hours || responses.business_hours,
    employeeCount: responses.employee_count || responses.staff_count,
    visitorVolume: responses.visitor_volume || responses.daily_visitors,
    assetValue: responses.asset_value || responses.total_asset_value,
    sensitiveData: responses.sensitive_data === 'yes' || responses.pii_present === true,
    publicFacing: responses.public_access === 'yes' || responses.public_facing === true,
    industryType: responses.industry || responses.business_type,
  };
}

function extractGeographicData(responses: Record<string, any>): GeographicIntel {
  return {
    address: responses.address || responses.facility_address,
    city: responses.city,
    state: responses.state,
    zipCode: responses.zip_code || responses.postal_code,
    capIndexScore: responses.cap_index_score,
    neighborhoodRating: responses.neighborhood_type,
  };
}

/**
 * Save AI assessment results to database
 */
export async function saveAssessmentResults(
  assessmentId: number,
  results: AIAssessmentResponse[]
): Promise<{ insertedCount: number; riskScenarioIds: number[] }> {
  const insertedIds: number[] = [];

  for (const result of results) {
    try {
      const threat = await db.query.threats.findFirst({
        where: eq(threats.name, result.threatId),
      });

      let threatDbId = threat?.id;

      if (!threatDbId) {
        const [newThreat] = await db.insert(threats).values({
          name: result.threatId,
          category: 'general',
          description: `AI-assessed threat: ${result.threatId}`,
        }).returning();
        threatDbId = newThreat.id;
      }

      const scenarioDescription = `
Threat Likelihood (${result.threatLikelihood}/5 - ${result.threatLikelihoodLabel}): ${result.threatLikelihoodReasoning}
Vulnerability (${result.vulnerability}/5 - ${result.vulnerabilityLabel}): ${result.vulnerabilityReasoning}
Impact (${result.impact}/5 - ${result.impactLabel}): ${result.impactReasoning}

Evidence cited: ${[
  ...result.threatLikelihoodEvidence,
  ...result.vulnerabilityEvidence,
  ...result.impactEvidence,
].join('; ')}

${result.insufficientDataFlags.length > 0 
  ? `\nData gaps identified: ${result.insufficientDataFlags.join(', ')}`
  : ''}

${result.scenarioDescription ? `\nScenario: ${result.scenarioDescription}` : ''}
      `.trim();

      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId,
        threatId: threatDbId,
        threatLikelihood: result.threatLikelihood,
        vulnerability: result.vulnerability,
        impact: result.impact,
        inherentRisk: result.inherentRisk,
        residualRisk: result.inherentRisk,
        controlEffectiveness: 0,
        riskLevel: result.riskLevel,
        scenarioDescription,
        aiNarrative: JSON.stringify({
          confidence: result.confidence,
          suggestedControls: result.suggestedControls,
          insufficientDataFlags: result.insufficientDataFlags,
          evidenceTrail: result.evidenceTrail,
        }),
      }).returning();

      insertedIds.push(inserted.id);
    } catch (error) {
      console.error(`Error saving result for ${result.threatId}:`, error);
    }
  }

  return {
    insertedCount: insertedIds.length,
    riskScenarioIds: insertedIds,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Core assessment functions
  assessThreat,
  assessThreatFull, // NEW: Returns both rich and flat formats
  assessAllThreats,
  
  // Narrative generation
  generateNarrative,
  
  // Control explanations
  explainControlRecommendation,
  
  // Photo analysis
  analyzeSecurityPhoto,
  
  // Database helpers
  loadFacilityContext,
  saveAssessmentResults,
  
  // Configuration
  AI_CONFIG,
  INDUSTRY_STANDARDS,
  CONTROL_EFFECTIVENESS,
  
  // Utilities (now imported from system-prompt-base)
  getRiskClassification,
  validateScoreLabel,
  
  // Internal (exposed for testing)
  generateSystemPrompt,
  transformRichToFlat,
};
