/**
 * RiskFixer Manufacturing AI Risk Assessment
 * 
 * Extends the base AI assessment framework with manufacturing-specific capabilities:
 * - T×V×I formula (standard facility assessment, scale 1-5 for each)
 * - Production-centric with IP protection focus
 * - Industrial espionage, trade secret theft, equipment sabotage
 * - CFATS compliance for hazmat facilities
 * - Insider threat prevention and detection
 * - ASIS GDL-RA, NIST, ISO 28000 standards
 * 
 * DESIGN PHILOSOPHY:
 * - Evidence-based: Every score must cite specific findings
 * - Methodology-compliant: ASIS GDL-RA with manufacturing extensions
 * - Conservative: Score toward higher risk when ambiguous
 * - Auditable: Clear reasoning chain for each score
 * - Fallback: Algorithmic calculation if AI fails
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 * @see RiskFixer-Manufacturing-Framework.md
 */

import OpenAI from 'openai';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { riskScenarios, assessments, threatLibrary } from '@shared/schema';

// Import algorithmic fallback functions from existing mapper
import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  generateControlRecommendations,
  MANUFACTURING_THREATS,
  THREAT_CONTROL_MAPPING,
  InterviewResponses,
} from './manufacturing-interview-mapper';

// ============================================================================
// CONFIGURATION
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.3, // Low for consistent, deterministic outputs
  maxTokens: 4000,
  retryAttempts: 2,
  timeoutMs: 30000,
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface ManufacturingAssessmentContext {
  assessmentId: number;
  facilityName?: string;
  interviewResponses: InterviewResponses;
  photoAnalysisFindings?: string[];
  incidentHistory?: ManufacturingIncidentRecord[];
  ipAssets?: IPAssetProfile;
  cfatsProfile?: CFATSProfile;
  capIndexData?: CAPIndexData;
}

export interface ManufacturingIncidentRecord {
  date: string;
  type: 'ip_theft' | 'espionage' | 'equipment_sabotage' | 'employee_theft' | 'raw_material_theft' |
        'finished_goods_theft' | 'workplace_violence' | 'unauthorized_access' | 'counterfeit_parts' |
        'vandalism' | 'trespassing' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lossAmount?: number;
  perpetratorType?: 'external' | 'internal' | 'contractor' | 'unknown';
  prosecuted?: boolean;
}

export interface IPAssetProfile {
  hasTradeSecrets: boolean;
  hasProprietaryProcesses: boolean;
  hasPrototypes: boolean;
  hasPatentedTechnology: boolean;
  estimatedIPValue?: string;
  keyCompetitors?: string[];
  foreignInterestConcerns?: boolean;
}

export interface CFATSProfile {
  applicable: boolean;
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  chemicalsOfInterest?: string[];
  lastInspectionDate?: string;
  complianceStatus?: 'compliant' | 'non-compliant' | 'pending';
}

export interface CAPIndexData {
  overallScore?: number;
  theftScore?: number;
  violentCrimeScore?: number;
  burglaryScore?: number;
  neighborhoodType?: string;
}

export interface ManufacturingThreatAssessmentRequest {
  threatId: string;
  threatName: string;
  threatCategory: string;
  asisCode?: string;
  context: ManufacturingAssessmentContext;
}

/**
 * Rich AI response format for Manufacturing assessments
 * T×V×I scale with evidence chains
 */
export interface ManufacturingAIAssessmentResponse {
  threatId: string;
  
  // T×V×I Scores (1-5 scale)
  threatLikelihood: {
    score: number;
    label: string;
    evidence: string[];
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
    dataGaps: string[];
  };
  
  vulnerability: {
    score: number;
    label: string;
    controlGaps: string[];
    existingControls: string[];
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
    dataGaps: string[];
  };
  
  impact: {
    score: number;
    label: string;
    financialImpact: string;
    operationalImpact: string;
    safetyImpact: string;
    reputationalImpact: string;
    ipImpact: string;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  
  // Calculated risks
  inherentRisk: {
    score: number; // T × V × I (1-125)
    normalizedScore: number; // 0-100 scale
    classification: 'critical' | 'high' | 'medium' | 'low';
  };
  
  // Recommendations
  priorityControls: {
    controlId: string;
    controlName: string;
    urgency: 'immediate' | 'short_term' | 'medium_term';
    rationale: string;
    standardsReference: string;
    estimatedCostRange?: string;
  }[];
  
  // Scenario description for reports
  scenarioDescription: string;
  
  // Evidence trail for audit
  evidenceTrail: string[];
  
  // Insufficient data flags
  insufficientDataFlags: string[];
}

export interface ManufacturingGeneratedScenarioResult {
  success: boolean;
  mode: 'ai' | 'algorithmic' | 'hybrid';
  generatedScenarios: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScenarioIds: number[];
  overallIPTheftRisk: string;
  overallInsiderThreatRisk: string;
  cfatsApplicable: boolean;
  aiConfidence: 'high' | 'medium' | 'low' | 'fallback';
  processingTimeMs: number;
}

// ============================================================================
// MANUFACTURING-SPECIFIC SYSTEM PROMPT
// ============================================================================

const MANUFACTURING_SYSTEM_PROMPT = `You are a CPP-certified physical security professional specializing in manufacturing facility security conducting a formal risk assessment. You are assessing threats to a manufacturing facility, focusing on IP protection, production security, insider threats, and regulatory compliance.

Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview data, incident history, or facility characteristics provided. Never assume facts not in evidence. If data is missing, explicitly state "INSUFFICIENT DATA" for that element.

2. METHODOLOGY-COMPLIANT: Follow the ASIS GDL-RA framework using T×V×I where:
   - T (Threat Likelihood): 1-5 scale, probability of threat materializing at this facility
   - V (Vulnerability): 1-5 scale, degree to which current controls fail to prevent/detect
   - I (Impact): 1-5 scale, consequence severity if attack succeeds (financial, operational, IP loss, safety)
   - Inherent Risk = T × V × I (scale 1-125, normalized to 0-100)

3. MANUFACTURING-CENTRIC: Manufacturing assessments focus on:
   - Trade secret and IP protection
   - Industrial espionage prevention
   - Production area access control
   - Equipment and process integrity
   - Raw material and finished goods security
   - Insider threat detection and prevention
   - CFATS compliance (if applicable)
   - Contractor and vendor access management

4. RUBRIC-ANCHORED: Use the exact scoring criteria provided.

THREAT LIKELIHOOD RUBRIC (1-5):
Score 1 (RARE): No incident history, no known espionage interest, commodity products, low-value IP
Score 2 (UNLIKELY): Isolated historical incidents only, limited IP value, low industry targeting
Score 3 (POSSIBLE): Periodic incidents documented, moderate IP value, some competitive intelligence activity
Score 4 (LIKELY): Regular security events, high-value IP, known competitor interest, industry targeting
Score 5 (ALMOST CERTAIN): Frequent incidents, confirmed espionage attempts, critical IP, foreign government interest, CFATS regulated

VULNERABILITY RUBRIC (1-5):
Score 1 (MINIMAL): Comprehensive access control, DLP systems, biometrics, insider threat program, visitor NDAs, photography prohibition
Score 2 (LOW): Good access control, basic DLP, visitor management, background checks, some monitoring gaps
Score 3 (MODERATE): Basic security measures, gaps in IP protection, inconsistent visitor procedures, some control weaknesses
Score 4 (HIGH): Limited access control, no DLP, minimal visitor screening, weak background checks, contractor access issues
Score 5 (CRITICAL): No production floor access control, no IP protection, unescorted visitors, no background checks, multiple control failures

IMPACT RUBRIC (1-5):
Score 1 (NEGLIGIBLE): Loss under $10,000, no IP exposure, minimal disruption, no safety concern
Score 2 (MINOR): Loss $10,000-$100,000, minor IP exposure, limited disruption, no safety impact
Score 3 (MODERATE): Loss $100,000-$500,000, moderate IP exposure, significant operational disruption, potential safety concern
Score 4 (MAJOR): Loss $500,000-$5M, significant IP compromise, major production disruption, employee safety at risk
Score 5 (SEVERE): Loss over $5M, critical IP/trade secret theft, extended production shutdown, serious safety incident, regulatory penalties

5. STANDARD-REFERENCED: When recommending controls, cite specific standards:
   - ASIS GDL-RA (General Security Risk Assessment)
   - ASIS POA (Physical Asset Protection)
   - NIST Manufacturing Security Guidelines
   - NIST SP 800-82 (ICS Security)
   - ISO 28000 (Supply Chain Security)
   - ISO 27001 (Information Security)
   - CFATS (Chemical Facility Anti-Terrorism Standards)
   - FBI Industrial Espionage Prevention Guidelines
   - OSHA Workplace Safety Standards

6. CONSERVATIVE: When evidence is ambiguous, score toward higher risk. IP theft can be catastrophic and often goes undetected until significant damage occurs.

7. AUDITABLE: Your reasoning must be clear enough that another security professional reviewing would reach the same conclusion given the same evidence.

CRITICAL: If data is insufficient to assess a factor, state "INSUFFICIENT DATA" rather than guessing. Never hallucinate facts about the facility or its security posture.

OUTPUT FORMAT:
Respond with a JSON object matching the ManufacturingAIAssessmentResponse interface. Include evidence citations for every score.`;

// ============================================================================
// MANUFACTURING INDUSTRY STANDARDS (Layer 3)
// ============================================================================

const MANUFACTURING_INDUSTRY_STANDARDS = `
APPLICABLE STANDARDS FOR MANUFACTURING FACILITY ASSESSMENTS:

1. Manufacturing Security Standards:
   - ASIS GDL-RA (General Security Risk Assessment Guideline)
   - ASIS POA (Physical Asset Protection)
   - NIST Manufacturing Security Guidelines
   - NIST SP 800-82 (Guide to ICS Security)
   - ISO 28000 (Supply Chain Security Management)

2. Intellectual Property Protection:
   - FBI Industrial Espionage Prevention Guidelines
   - NIST Trade Secret Protection Framework
   - ISO 27001 (Information Security Management)
   - ASIS Information Asset Protection Guidelines
   - Export Control Regulations (ITAR/EAR where applicable)

3. Chemical/Hazmat Security:
   - CFATS (Chemical Facility Anti-Terrorism Standards)
   - DHS CFATS Personnel Surety Program
   - CFATS Risk-Based Performance Standards (RBPS)
   - EPA Risk Management Program
   - DOT Hazmat Transportation Security

4. Access Control Standards:
   - ASIS Facilities Physical Protection Standard
   - NIST Access Control Guidelines
   - TWIC (Transportation Worker Identification Credential) where applicable
   - Biometric Standards (NIST SP 500-290)

5. Insider Threat Prevention:
   - NIST Insider Threat Best Practices
   - CERT Insider Threat Program
   - ASIS Workplace Violence Prevention Standard
   - FBI Insider Threat Indicators

6. Manufacturing-Specific Benchmarks:
   - Average IP theft cost: $250M+ (FBI estimate for major cases)
   - Insider involvement in IP theft: 60%+
   - Equipment sabotage detection time: Often weeks/months
   - Trade secret litigation: $1-5M average legal costs
   - Production downtime cost: $10K-$250K per hour (varies by industry)

7. Industry-Specific Considerations:
   - Pharmaceutical: FDA 21 CFR Part 11, DEA controls
   - Aerospace/Defense: ITAR, NISPOM, CUI protection
   - Electronics: ESD controls, cleanroom security
   - Automotive: OEM security requirements, supply chain integrity
   - Chemical: CFATS, EPA RMP, OSHA PSM
`;

// ============================================================================
// CONTEXT BUILDING FUNCTIONS
// ============================================================================

function buildManufacturingFacilityProfile(context: ManufacturingAssessmentContext): string {
  const { interviewResponses } = context;
  
  const sections: string[] = ['## FACILITY PROFILE'];
  
  // Facility Characteristics
  sections.push(`
### Facility Characteristics
- Manufacturing Type: ${interviewResponses.facility_1 || 'Not specified'}
- Facility Size (sq ft): ${interviewResponses.facility_2 || 'Not specified'}
- Annual Production Value: ${interviewResponses.facility_3 || 'Not specified'}
- Product Type: ${interviewResponses.facility_4 || 'Not specified'}
- Employee Count: ${interviewResponses.facility_5 || 'Not specified'}
- Operating Hours: ${interviewResponses.facility_7 || 'Not specified'}
`);

  // IP Assets
  sections.push(`
### Intellectual Property Assets
- Has Valuable IP: ${interviewResponses.facility_6 === 'yes' ? 'Yes' : 'No'}
${interviewResponses.facility_6a ? `- IP Types: ${Array.isArray(interviewResponses.facility_6a) ? interviewResponses.facility_6a.join(', ') : interviewResponses.facility_6a}` : ''}
`);

  // Hazmat/CFATS
  sections.push(`
### Hazardous Materials
- Uses Hazardous Materials: ${interviewResponses.facility_8 === 'yes' ? 'Yes' : 'No'}
${interviewResponses.facility_8a ? `- CFATS Tier: ${interviewResponses.facility_8a}` : ''}
`);

  // High-Value Materials
  sections.push(`
### High-Value Materials
- Has High-Value Raw Materials: ${interviewResponses.facility_9 === 'yes' ? 'Yes' : 'No'}
${interviewResponses.facility_9a ? `- Material Types: ${Array.isArray(interviewResponses.facility_9a) ? interviewResponses.facility_9a.join(', ') : interviewResponses.facility_9a}` : ''}
`);

  return sections.join('\n');
}

function buildManufacturingSecurityPosture(context: ManufacturingAssessmentContext): string {
  const { interviewResponses } = context;
  
  const sections: string[] = ['## CURRENT SECURITY POSTURE'];
  
  // Perimeter Security
  sections.push(`
### Perimeter Security
- Fencing Type: ${interviewResponses.perimeter_1 || 'Not specified'}
- Main Gate Security: ${interviewResponses.perimeter_2 || 'Not specified'}
- Intrusion Detection: ${interviewResponses.perimeter_3 || 'Not specified'}
- Perimeter Lighting: ${interviewResponses.perimeter_4 || 'Not specified'}
- Vehicle Inspection: ${interviewResponses.perimeter_5 || 'Not specified'}
- Perimeter CCTV: ${interviewResponses.perimeter_6 || 'Not specified'}
`);

  // Production Area Security
  sections.push(`
### Production Area Security
- Production Floor Access Control: ${interviewResponses.production_1 || 'Not specified'}
- Badge System Type: ${interviewResponses.production_2 || 'Not specified'}
- Production Floor CCTV: ${interviewResponses.production_3 || 'Not specified'}
- Tool/Equipment Tracking: ${interviewResponses.production_4 || 'Not specified'}
- Photography Prohibition: ${interviewResponses.production_5 || 'Not specified'}
- Production Zoning: ${interviewResponses.production_6 || 'Not specified'}
`);

  // IP Protection
  sections.push(`
### IP Protection Measures
- R&D/Engineering Access: ${interviewResponses.ip_1a || 'Not specified'}
- Visitor NDA Requirements: ${interviewResponses.ip_2 || 'Not specified'}
- Clean Desk Policy: ${interviewResponses.ip_3 || 'Not specified'}
- Mobile Device Policy: ${interviewResponses.ip_4 || 'Not specified'}
- Data Loss Prevention (DLP): ${interviewResponses.ip_5 || 'Not specified'}
- Document Classification: ${interviewResponses.ip_6 || 'Not specified'}
- Exit Interview IP Review: ${interviewResponses.ip_7 || 'Not specified'}
`);

  // Inventory Control
  sections.push(`
### Inventory & Material Control
- Raw Material Tracking: ${interviewResponses.inventory_1 || 'Not specified'}
- Inventory System: ${interviewResponses.inventory_2 || 'Not specified'}
- High-Value Material Caging: ${interviewResponses.inventory_3 || 'Not specified'}
- Cycle Counting: ${interviewResponses.inventory_4 || 'Not specified'}
- Scrap/Waste Controls: ${interviewResponses.inventory_5 || 'Not specified'}
- BOM Tracking: ${interviewResponses.inventory_6 || 'Not specified'}
- Two-Person Rule for Sensitive Materials: ${interviewResponses.inventory_7 || 'Not specified'}
`);

  // Personnel Security
  sections.push(`
### Personnel Security
- Background Checks: ${interviewResponses.personnel_1 || 'Not specified'}
- Security Training: ${interviewResponses.personnel_2 || 'Not specified'}
- Insider Threat Program: ${interviewResponses.personnel_3 || 'Not specified'}
- Non-Compete/NDA Enforcement: ${interviewResponses.personnel_4 || 'Not specified'}
- Exit Bag Checks: ${interviewResponses.personnel_5 || 'Not specified'}
- Immediate Access Revocation: ${interviewResponses.personnel_6 || 'Not specified'}
- Termination Escort Procedures: ${interviewResponses.personnel_7 || 'Not specified'}
`);

  // Contractor Management
  sections.push(`
### Contractor & Vendor Management
- Contractor Screening: ${interviewResponses.contractor_1 || 'Not specified'}
- Visitor/Contractor Management: ${interviewResponses.contractor_2 || 'Not specified'}
- Escort Requirements: ${interviewResponses.contractor_3 || 'Not specified'}
- Maintenance Access Procedures: ${interviewResponses.contractor_4 || 'Not specified'}
- Supplier Vetting: ${interviewResponses.contractor_5 || 'Not specified'}
- Contractor Badge System: ${interviewResponses.contractor_6 || 'Not specified'}
`);

  // Surveillance
  sections.push(`
### Surveillance & Monitoring
- CCTV Coverage Assessment: ${interviewResponses.surveillance_1 || 'Not specified'}
- Video Retention: ${interviewResponses.surveillance_2 || 'Not specified'}
- Real-Time Monitoring: ${interviewResponses.surveillance_3 || 'Not specified'}
- Video Analytics: ${interviewResponses.surveillance_4 || 'Not specified'}
- OT/IT Network Segmentation: ${interviewResponses.surveillance_5 || 'Not specified'}
- Remote Access Monitoring: ${interviewResponses.surveillance_6 || 'Not specified'}
`);

  return sections.join('\n');
}

function buildManufacturingThreatIntelligence(context: ManufacturingAssessmentContext): string {
  const { interviewResponses, ipAssets, cfatsProfile, incidentHistory, capIndexData } = context;
  
  const sections: string[] = ['## THREAT INTELLIGENCE'];
  
  // Incident History
  sections.push(`
### Incident History
- Security Incidents in Past 24 Months: ${interviewResponses.emergency_1 || 'Not specified'}
- Incident Types: ${Array.isArray(interviewResponses.emergency_2) ? interviewResponses.emergency_2.join(', ') : (interviewResponses.emergency_2 || 'None reported')}
`);

  // Additional incident records if provided
  if (incidentHistory && incidentHistory.length > 0) {
    sections.push(`
### Detailed Incident Records`);
    incidentHistory.forEach((incident, idx) => {
      sections.push(`
${idx + 1}. ${incident.type} (${incident.date})
   - Severity: ${incident.severity}
   - Loss Amount: ${incident.lossAmount ? `$${incident.lossAmount.toLocaleString()}` : 'Not specified'}
   - Perpetrator: ${incident.perpetratorType || 'Unknown'}
   - Description: ${incident.description}`);
    });
  }

  // IP Asset Profile
  if (ipAssets) {
    sections.push(`
### IP Asset Profile
- Trade Secrets: ${ipAssets.hasTradeSecrets ? 'Yes' : 'No'}
- Proprietary Processes: ${ipAssets.hasProprietaryProcesses ? 'Yes' : 'No'}
- Prototypes: ${ipAssets.hasPrototypes ? 'Yes' : 'No'}
- Patented Technology: ${ipAssets.hasPatentedTechnology ? 'Yes' : 'No'}
- Estimated IP Value: ${ipAssets.estimatedIPValue || 'Not specified'}
- Foreign Interest Concerns: ${ipAssets.foreignInterestConcerns ? 'Yes' : 'No'}`);
  }

  // CFATS Profile
  if (cfatsProfile) {
    sections.push(`
### CFATS Profile
- Applicable: ${cfatsProfile.applicable ? 'Yes' : 'No'}
${cfatsProfile.tier ? `- Tier: ${cfatsProfile.tier}` : ''}
${cfatsProfile.complianceStatus ? `- Compliance Status: ${cfatsProfile.complianceStatus}` : ''}`);
  }

  // CAP Index Data
  if (capIndexData) {
    sections.push(`
### Geographic Crime Data (CAP Index)
- Overall Score: ${capIndexData.overallScore || 'Not available'}
- Theft Score: ${capIndexData.theftScore || 'Not available'}
- Violent Crime Score: ${capIndexData.violentCrimeScore || 'Not available'}
- Neighborhood Type: ${capIndexData.neighborhoodType || 'Not available'}`);
  }

  return sections.join('\n');
}

// ============================================================================
// THREAT-SPECIFIC PROMPT GENERATION
// ============================================================================

function generateManufacturingThreatAssessmentPrompt(request: ManufacturingThreatAssessmentRequest): string {
  const { threatId, threatName, threatCategory, asisCode, context } = request;
  
  // Build context sections
  const facilityProfile = buildManufacturingFacilityProfile(context);
  const securityPosture = buildManufacturingSecurityPosture(context);
  const threatIntelligence = buildManufacturingThreatIntelligence(context);
  
  // Photo analysis findings
  const photoAnalysis = context.photoAnalysisFindings?.length 
    ? `## PHOTO ANALYSIS FINDINGS\n${context.photoAnalysisFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
    : '';
  
  // Threat-specific context
  const threatContext = getThreatSpecificContext(threatId);

  return `# MANUFACTURING FACILITY RISK ASSESSMENT

## THREAT BEING ASSESSED
- Threat ID: ${threatId}
- Threat Name: ${threatName}
- Category: ${threatCategory}
- ASIS Code: ${asisCode || 'N/A'}

${threatContext}

${facilityProfile}

${securityPosture}

${threatIntelligence}

${photoAnalysis}

## ASSESSMENT INSTRUCTIONS

Assess this specific threat (${threatName}) against this manufacturing facility using the T×V×I methodology.

For each component:
1. Cite specific evidence from the data above
2. Apply the scoring rubric exactly
3. Note any data gaps that affect confidence
4. Recommend specific controls with standards references

Consider manufacturing-specific factors:
- IP exposure and espionage risk
- Production continuity impact
- Insider threat indicators
- Regulatory compliance (CFATS if applicable)
- Supply chain vulnerabilities

REQUIRED OUTPUT:
Respond with a JSON object containing threatLikelihood, vulnerability, impact, inherentRisk, priorityControls, scenarioDescription, evidenceTrail, and insufficientDataFlags.`;
}

function getThreatSpecificContext(threatId: string): string {
  const contexts: Record<string, string> = {
    'industrial_espionage_ip_theft': `## THREAT-SPECIFIC CONTEXT: INDUSTRIAL ESPIONAGE
This threat involves deliberate theft of trade secrets, proprietary processes, or intellectual property by competitors, foreign governments, or organized actors.
Key indicators to assess:
- Presence of valuable IP/trade secrets
- Foreign ownership or partnership concerns
- Competitor intelligence activities
- Unusual employee departures to competitors
- Photography/recording incidents
- Network intrusion attempts`,

    'equipment_sabotage': `## THREAT-SPECIFIC CONTEXT: EQUIPMENT SABOTAGE
This threat involves intentional damage or tampering with production equipment to disrupt operations.
Key indicators to assess:
- History of equipment tampering
- Labor disputes or disgruntled employees
- Access control to production areas
- Equipment monitoring systems
- Maintenance access procedures
- Lockout/tagout compliance`,

    'raw_material_theft': `## THREAT-SPECIFIC CONTEXT: RAW MATERIAL THEFT
This threat involves theft of incoming raw materials, often involving insider collusion.
Key indicators to assess:
- High-value material presence (precious metals, pharmaceuticals)
- Receiving area security
- Material tracking systems
- Inventory reconciliation frequency
- Two-person rules for valuable materials
- Contractor access to storage areas`,

    'finished_goods_theft': `## THREAT-SPECIFIC CONTEXT: FINISHED GOODS THEFT
This threat involves theft of completed products from warehouse or shipping areas.
Key indicators to assess:
- Product value density
- Shipping area security
- CCTV coverage of docks
- Manifest verification procedures
- Driver waiting area controls
- Outbound inspection procedures`,

    'insider_theft_ip_data': `## THREAT-SPECIFIC CONTEXT: INSIDER IP/DATA THEFT
This threat involves employees stealing proprietary data, customer lists, or trade secrets.
Key indicators to assess:
- Data loss prevention (DLP) systems
- USB/removable media controls
- Email monitoring for sensitive data
- Exit interview procedures
- Non-compete/NDA enforcement
- Behavioral indicators program`,

    'insider_theft_physical': `## THREAT-SPECIFIC CONTEXT: INSIDER PHYSICAL THEFT
This threat involves employees stealing physical assets, tools, or materials.
Key indicators to assess:
- Exit bag check procedures
- Tool tracking systems
- Locker inspections
- CCTV in vulnerable areas
- Anonymous reporting hotline
- Inventory shrinkage tracking`,

    'workplace_violence_production_floor': `## THREAT-SPECIFIC CONTEXT: WORKPLACE VIOLENCE
This threat involves violence by employees, former employees, or visitors in production environments.
Key indicators to assess:
- Threat assessment team
- Employee assistance program
- Termination procedures
- Access revocation speed
- History of violence/threats
- Visitor management procedures`,

    'contractor_vendor_exploitation': `## THREAT-SPECIFIC CONTEXT: CONTRACTOR/VENDOR EXPLOITATION
This threat involves third parties exploiting access for theft, espionage, or sabotage.
Key indicators to assess:
- Contractor screening procedures
- Escort requirements
- Badge differentiation
- Access limitations
- NDA requirements
- Maintenance access controls`,

    'hazmat_theft_diversion': `## THREAT-SPECIFIC CONTEXT: HAZMAT THEFT/DIVERSION
This threat involves theft or unauthorized diversion of hazardous or controlled materials.
Key indicators to assess:
- CFATS compliance status
- Hazmat storage security
- Access controls for hazmat areas
- Material tracking and reconciliation
- Two-person rule implementation
- Transportation security`,

    'vandalism_equipment': `## THREAT-SPECIFIC CONTEXT: EQUIPMENT VANDALISM
This threat involves deliberate damage to equipment by internal or external actors.
Key indicators to assess:
- After-hours security
- Perimeter intrusion detection
- CCTV coverage of equipment
- Employee grievance procedures
- Former employee access revocation
- Guard patrol routes`,

    'trespassing_unauthorized_access': `## THREAT-SPECIFIC CONTEXT: TRESPASSING/UNAUTHORIZED ACCESS
This threat involves unauthorized persons gaining access to the facility.
Key indicators to assess:
- Perimeter fencing
- Gate security
- Visitor management
- Badge enforcement
- Social engineering awareness
- Tailgating prevention`,

    'production_line_disruption': `## THREAT-SPECIFIC CONTEXT: PRODUCTION LINE DISRUPTION
This threat involves intentional or accidental disruption to production processes.
Key indicators to assess:
- OT/IT network segmentation
- Process control security
- Change management procedures
- Backup systems
- Business continuity planning
- Critical equipment redundancy`,

    'trade_secret_theft': `## THREAT-SPECIFIC CONTEXT: TRADE SECRET THEFT
This threat specifically targets proprietary processes, formulas, or methods.
Key indicators to assess:
- Clean desk policy enforcement
- Document classification
- Photography prohibition
- Visitor escort in sensitive areas
- R&D area access controls
- Exit interview procedures`,

    'theft_tooling_dies_molds': `## THREAT-SPECIFIC CONTEXT: TOOLING/DIES/MOLDS THEFT
This threat involves theft of specialized manufacturing equipment used to produce products.
Key indicators to assess:
- Tool crib security
- Tool tracking systems
- Value of custom tooling
- Access controls to tool storage
- Contractor access to tools
- Export control considerations`,

    'counterfeit_parts_infiltration': `## THREAT-SPECIFIC CONTEXT: COUNTERFEIT PARTS INFILTRATION
This threat involves substandard or counterfeit components entering the supply chain.
Key indicators to assess:
- Supplier vetting program
- Parts authentication procedures
- Receiving inspection rigor
- Supplier audit frequency
- Traceability systems
- Approved supplier lists`,
  };

  return contexts[threatId] || `## THREAT-SPECIFIC CONTEXT
Assess this threat based on the interview responses and facility characteristics provided.`;
}

// ============================================================================
// AI ASSESSMENT FUNCTION
// ============================================================================

/**
 * Call GPT-4 to assess a single manufacturing threat
 */
async function assessManufacturingThreatWithAI(
  request: ManufacturingThreatAssessmentRequest
): Promise<ManufacturingAIAssessmentResponse> {
  const systemPrompt = MANUFACTURING_SYSTEM_PROMPT + '\n\n' + MANUFACTURING_INDUSTRY_STANDARDS;
  const userPrompt = generateManufacturingThreatAssessmentPrompt(request);

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: AI_CONFIG.temperature,
    max_tokens: AI_CONFIG.maxTokens,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '';
  
  // Parse JSON response
  let parsed: any;
  try {
    // Handle potential markdown code blocks
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Invalid JSON in AI response: ${e}`);
  }

  // Validate and transform response
  return validateAndTransformManufacturingResponse(parsed, request.threatId);
}

/**
 * Validate AI response and fill in missing fields
 */
function validateAndTransformManufacturingResponse(
  parsed: any,
  threatId: string
): ManufacturingAIAssessmentResponse {
  // Ensure scores are within bounds (1-5)
  const clamp = (val: number, min: number, max: number) => 
    Math.max(min, Math.min(max, Math.round(val)));

  const threatLikelihood = clamp(parsed.threatLikelihood?.score || parsed.threatLikelihood || 3, 1, 5);
  const vulnerability = clamp(parsed.vulnerability?.score || parsed.vulnerability || 3, 1, 5);
  const impact = clamp(parsed.impact?.score || parsed.impact || 3, 1, 5);

  // Calculate inherent risk
  const inherentRisk = threatLikelihood * vulnerability * impact;
  const normalizedRisk = (inherentRisk / 125) * 100;

  // Determine classification
  let classification: 'critical' | 'high' | 'medium' | 'low';
  if (normalizedRisk >= 60) classification = 'critical';
  else if (normalizedRisk >= 40) classification = 'high';
  else if (normalizedRisk >= 25) classification = 'medium';
  else classification = 'low';

  return {
    threatId,
    threatLikelihood: {
      score: threatLikelihood,
      label: getThreatLikelihoodLabel(threatLikelihood),
      evidence: ensureArray(parsed.threatLikelihood?.evidence || parsed.threatLikelihoodEvidence),
      reasoning: parsed.threatLikelihood?.reasoning || parsed.threatLikelihoodReasoning || '',
      confidence: validateConfidence(parsed.threatLikelihood?.confidence),
      dataGaps: ensureArray(parsed.threatLikelihood?.dataGaps || parsed.threatLikelihoodDataGaps),
    },
    vulnerability: {
      score: vulnerability,
      label: getVulnerabilityLabel(vulnerability),
      controlGaps: ensureArray(parsed.vulnerability?.controlGaps || parsed.vulnerabilityControlGaps),
      existingControls: ensureArray(parsed.vulnerability?.existingControls || parsed.vulnerabilityExistingControls),
      reasoning: parsed.vulnerability?.reasoning || parsed.vulnerabilityReasoning || '',
      confidence: validateConfidence(parsed.vulnerability?.confidence),
      dataGaps: ensureArray(parsed.vulnerability?.dataGaps || parsed.vulnerabilityDataGaps),
    },
    impact: {
      score: impact,
      label: getImpactLabel(impact),
      financialImpact: parsed.impact?.financialImpact || parsed.impactFinancial || '',
      operationalImpact: parsed.impact?.operationalImpact || parsed.impactOperational || '',
      safetyImpact: parsed.impact?.safetyImpact || parsed.impactSafety || '',
      reputationalImpact: parsed.impact?.reputationalImpact || parsed.impactReputational || '',
      ipImpact: parsed.impact?.ipImpact || parsed.impactIP || '',
      reasoning: parsed.impact?.reasoning || parsed.impactReasoning || '',
      confidence: validateConfidence(parsed.impact?.confidence),
    },
    inherentRisk: {
      score: inherentRisk,
      normalizedScore: normalizedRisk,
      classification,
    },
    priorityControls: ensureArray(parsed.priorityControls || parsed.suggestedControls).map((c: any) => ({
      controlId: c.controlId || c.control_id || '',
      controlName: c.controlName || c.control_name || (typeof c === 'string' ? c : ''),
      urgency: validateUrgency(c.urgency),
      rationale: c.rationale || c.whySuggested || '',
      standardsReference: c.standardsReference || c.standards_reference || '',
      estimatedCostRange: c.estimatedCostRange || c.estimated_cost_range || '',
    })),
    scenarioDescription: parsed.scenarioDescription || parsed.scenario_description || '',
    evidenceTrail: ensureArray(parsed.evidenceTrail || parsed.evidence_trail),
    insufficientDataFlags: [
      ...ensureArray(parsed.threatLikelihood?.dataGaps),
      ...ensureArray(parsed.vulnerability?.dataGaps),
      ...ensureArray(parsed.insufficientDataFlags),
    ],
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function ensureArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  return [String(val)];
}

function validateConfidence(val: any): 'high' | 'medium' | 'low' {
  const normalized = String(val).toLowerCase();
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  return 'medium';
}

function validateUrgency(val: any): 'immediate' | 'short_term' | 'medium_term' {
  const normalized = String(val).toLowerCase().replace(/[^a-z_]/g, '');
  if (normalized === 'immediate') return 'immediate';
  if (normalized === 'medium_term' || normalized === 'mediumterm') return 'medium_term';
  return 'short_term';
}

function getThreatLikelihoodLabel(score: number): string {
  const labels: Record<number, string> = {
    1: 'Rare',
    2: 'Unlikely',
    3: 'Possible',
    4: 'Likely',
    5: 'Almost Certain',
  };
  return labels[score] || 'Possible';
}

function getVulnerabilityLabel(score: number): string {
  const labels: Record<number, string> = {
    1: 'Minimal',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Critical',
  };
  return labels[score] || 'Moderate';
}

function getImpactLabel(score: number): string {
  const labels: Record<number, string> = {
    1: 'Negligible',
    2: 'Minor',
    3: 'Moderate',
    4: 'Major',
    5: 'Severe',
  };
  return labels[score] || 'Moderate';
}

function classifyRiskLevel(inherentRisk: number): 'critical' | 'high' | 'medium' | 'low' {
  const normalized = (inherentRisk / 125) * 100;
  if (normalized >= 60) return 'critical';
  if (normalized >= 40) return 'high';
  if (normalized >= 25) return 'medium';
  return 'low';
}

function getIPTheftRiskLevel(responses: InterviewResponses): string {
  const hasIP = responses.facility_6 === 'yes';
  const hasDLP = responses.ip_5 === 'yes';
  const hasNDAs = responses.ip_2 === 'yes';
  const hasPhotographyProhibition = responses.production_5 === 'yes';
  const hasInsiderProgram = responses.personnel_3 === 'yes';
  const hasExitInterviews = responses.ip_7 === 'yes';
  
  if (!hasIP) return 'Low';
  
  const controlCount = [hasDLP, hasNDAs, hasPhotographyProhibition, hasInsiderProgram, hasExitInterviews]
    .filter(Boolean).length;
  
  if (controlCount <= 1) return 'Critical';
  if (controlCount <= 2) return 'High';
  if (controlCount <= 3) return 'Moderate';
  return 'Low';
}

function getInsiderThreatRiskLevel(responses: InterviewResponses): string {
  const incidentHistory = responses.emergency_2 || [];
  const hasInsiderHistory = Array.isArray(incidentHistory) && (
    incidentHistory.includes('Employee theft') ||
    incidentHistory.includes('IP theft or suspected espionage') ||
    incidentHistory.includes('Equipment sabotage or tampering')
  );
  
  const hasInsiderProgram = responses.personnel_3 === 'yes';
  const hasAccessRevocation = responses.personnel_6 === 'yes';
  const hasBackgroundChecks = !(responses.personnel_1 || '').toLowerCase().includes('no background');
  
  if (hasInsiderHistory && !hasInsiderProgram) return 'Critical';
  if (hasInsiderHistory || (!hasInsiderProgram && !hasAccessRevocation)) return 'High';
  if (!hasBackgroundChecks || !hasAccessRevocation) return 'Moderate';
  return 'Low';
}

// ============================================================================
// ALGORITHMIC FALLBACK
// ============================================================================

/**
 * Generate assessment using algorithmic calculation (no AI)
 */
function assessManufacturingThreatAlgorithmically(
  threatId: string,
  context: ManufacturingAssessmentContext
): ManufacturingAIAssessmentResponse {
  const threat = MANUFACTURING_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const { interviewResponses } = context;

  // Use existing algorithmic functions
  const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
  const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threatId);
  const impact = calculateImpactFromInterview(interviewResponses, threatId);

  const inherentRisk = threatLikelihood * vulnerability * impact;
  const normalizedRisk = (inherentRisk / 125) * 100;

  const classification = classifyRiskLevel(inherentRisk);

  // Get control recommendations from existing mapper
  const recommendedControls = generateControlRecommendations(interviewResponses, threatId);

  // Determine IP impact based on threat type
  let ipImpact = 'Minimal IP exposure';
  if (['industrial_espionage_ip_theft', 'trade_secret_theft', 'insider_theft_ip_data'].includes(threatId)) {
    ipImpact = impact >= 4 ? 'Critical IP/trade secret compromise possible' : 'Moderate IP exposure risk';
  }

  // Determine safety impact based on threat type
  let safetyImpact = 'Minimal safety concern';
  if (['workplace_violence_production_floor', 'equipment_sabotage', 'hazmat_theft_diversion'].includes(threatId)) {
    safetyImpact = 'Employee/facility safety at risk';
  }

  return {
    threatId,
    threatLikelihood: {
      score: threatLikelihood,
      label: getThreatLikelihoodLabel(threatLikelihood),
      evidence: ['Calculated algorithmically from interview responses'],
      reasoning: `Score derived from baseline threat level (${threat.typicalLikelihood}) adjusted by interview-driven risk factors including incident history, IP presence, and facility characteristics.`,
      confidence: 'medium',
      dataGaps: [],
    },
    vulnerability: {
      score: vulnerability,
      label: getVulnerabilityLabel(vulnerability),
      controlGaps: THREAT_CONTROL_MAPPING[threatId]?.slice(0, 5) || [],
      existingControls: [],
      reasoning: 'Score derived from security posture analysis using risk factor counting methodology.',
      confidence: 'medium',
      dataGaps: [],
    },
    impact: {
      score: impact,
      label: getImpactLabel(impact),
      financialImpact: impact >= 4 ? 'Significant financial loss potential' : 'Moderate financial exposure',
      operationalImpact: impact >= 4 ? 'Major operational disruption possible' : 'Limited operational impact',
      safetyImpact,
      reputationalImpact: impact >= 4 ? 'Potential reputational damage' : 'Limited reputational impact',
      ipImpact,
      reasoning: `Score derived from production value, IP presence, material value, and threat-specific impact modifiers.`,
      confidence: 'medium',
    },
    inherentRisk: {
      score: inherentRisk,
      normalizedScore: normalizedRisk,
      classification,
    },
    priorityControls: recommendedControls.slice(0, 5).map(controlId => ({
      controlId,
      controlName: controlId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      urgency: 'short_term' as const,
      rationale: 'Recommended based on identified control gaps.',
      standardsReference: 'ASIS GDL-RA, NIST Manufacturing Security',
    })),
    scenarioDescription: `${threat.name} risk assessment for this manufacturing facility. Calculated inherent risk score: ${normalizedRisk.toFixed(1)}/100 (${classification.toUpperCase()}).`,
    evidenceTrail: ['Algorithmic calculation - no AI evidence chain'],
    insufficientDataFlags: [],
  };
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Generate manufacturing risk scenarios using AI with algorithmic fallback
 * 
 * This is the main entry point that:
 * 1. Attempts AI assessment for each threat
 * 2. Falls back to algorithmic calculation on failure
 * 3. Stores results in database
 * 4. Returns summary statistics
 */
export async function generateManufacturingRiskScenariosWithAI(
  assessmentId: number,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: ManufacturingIncidentRecord[];
    ipAssets?: IPAssetProfile;
    cfatsProfile?: CFATSProfile;
    capIndexData?: CAPIndexData;
    productionValue?: string;
  }
): Promise<ManufacturingGeneratedScenarioResult> {
  const startTime = Date.now();
  const useAI = options?.useAI !== false; // Default to true

  const context: ManufacturingAssessmentContext = {
    assessmentId,
    interviewResponses,
    photoAnalysisFindings: options?.photoFindings,
    incidentHistory: options?.incidentHistory,
    ipAssets: options?.ipAssets,
    cfatsProfile: options?.cfatsProfile,
    capIndexData: options?.capIndexData,
  };

  const results: ManufacturingAIAssessmentResponse[] = [];
  let aiSuccessCount = 0;
  let algorithmicFallbackCount = 0;

  // Process each manufacturing threat
  for (const threat of MANUFACTURING_THREATS) {
    const request: ManufacturingThreatAssessmentRequest = {
      threatId: threat.id,
      threatName: threat.name,
      threatCategory: threat.category,
      asisCode: threat.asisCode,
      context,
    };

    try {
      if (useAI) {
        // Attempt AI assessment
        const aiResult = await assessManufacturingThreatWithAI(request);
        results.push(aiResult);
        aiSuccessCount++;
      } else {
        // Use algorithmic only
        const algoResult = assessManufacturingThreatAlgorithmically(threat.id, context);
        results.push(algoResult);
        algorithmicFallbackCount++;
      }
    } catch (error) {
      console.error(`AI assessment failed for ${threat.id}, using fallback:`, error);
      
      // Fallback to algorithmic
      try {
        const algoResult = assessManufacturingThreatAlgorithmically(threat.id, context);
        results.push(algoResult);
        algorithmicFallbackCount++;
      } catch (fallbackError) {
        console.error(`Algorithmic fallback also failed for ${threat.id}:`, fallbackError);
        // Skip this threat
      }
    }

    // Small delay between AI calls to avoid rate limiting
    if (useAI) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Calculate overall risk levels
  const overallIPTheftRisk = getIPTheftRiskLevel(interviewResponses);
  const overallInsiderThreatRisk = getInsiderThreatRiskLevel(interviewResponses);
  const cfatsApplicable = interviewResponses.facility_8 === 'yes';

  // Store results in database
  const riskScenarioIds: number[] = [];
  for (const result of results) {
    try {
      const threat = MANUFACTURING_THREATS.find(t => t.id === result.threatId);
      
      // Look up or create threat record
      let existingThreat = await db.query.threats.findFirst({
        where: eq(threats.name, threat?.name || result.threatId),
      });

      let threatDbId: number;
      if (existingThreat) {
        threatDbId = existingThreat.id;
      } else {
        const [newThreat] = await db.insert(threats).values({
          name: threat?.name || result.threatId,
          category: threat?.category || 'Manufacturing',
          description: `${threat?.name || result.threatId} - ASIS Code: ${threat?.asisCode || 'N/A'}`,
        }).returning();
        threatDbId = newThreat.id;
      }
      
      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId,
        threatId: threatDbId,
        threatLikelihood: result.threatLikelihood.score,
        vulnerability: result.vulnerability.score,
        impact: result.impact.score,
        inherentRisk: Math.round(result.inherentRisk.normalizedScore),
        residualRisk: Math.round(result.inherentRisk.normalizedScore), // Initially same as inherent
        controlEffectiveness: 0,
        riskLevel: result.inherentRisk.classification,
        scenarioDescription: result.scenarioDescription,
        // Store AI evidence in JSON field if available
        aiEvidence: result.evidenceTrail.length > 1 ? JSON.stringify({
          threatLikelihood: result.threatLikelihood,
          vulnerability: result.vulnerability,
          impact: result.impact,
          priorityControls: result.priorityControls,
        }) : null,
      }).returning({ id: riskScenarios.id });

      if (inserted?.id) {
        riskScenarioIds.push(inserted.id);
      }
    } catch (dbError) {
      console.error(`Failed to store risk scenario for ${result.threatId}:`, dbError);
    }
  }

  // Count risk levels
  const criticalRisks = results.filter(r => r.inherentRisk.classification === 'critical').length;
  const highRisks = results.filter(r => r.inherentRisk.classification === 'high').length;
  const mediumRisks = results.filter(r => r.inherentRisk.classification === 'medium').length;
  const lowRisks = results.filter(r => r.inherentRisk.classification === 'low').length;

  // Determine mode and confidence
  let mode: 'ai' | 'algorithmic' | 'hybrid';
  let aiConfidence: 'high' | 'medium' | 'low' | 'fallback';

  if (aiSuccessCount === results.length) {
    mode = 'ai';
    aiConfidence = 'high';
  } else if (algorithmicFallbackCount === results.length) {
    mode = 'algorithmic';
    aiConfidence = 'fallback';
  } else {
    mode = 'hybrid';
    aiConfidence = aiSuccessCount > algorithmicFallbackCount ? 'medium' : 'low';
  }

  return {
    success: true,
    mode,
    generatedScenarios: results.length,
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    riskScenarioIds,
    overallIPTheftRisk,
    overallInsiderThreatRisk,
    cfatsApplicable,
    aiConfidence,
    processingTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// ADDITIONAL EXPORTS
// ============================================================================

/**
 * Assess a single threat (for testing or individual assessment)
 */
export async function assessSingleManufacturingThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  options?: { useAI?: boolean }
): Promise<ManufacturingAIAssessmentResponse> {
  const threat = MANUFACTURING_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const context: ManufacturingAssessmentContext = {
    assessmentId: 0,
    interviewResponses,
  };

  const request: ManufacturingThreatAssessmentRequest = {
    threatId,
    threatName: threat.name,
    threatCategory: threat.category,
    asisCode: threat.asisCode,
    context,
  };

  if (options?.useAI === false) {
    return assessManufacturingThreatAlgorithmically(threatId, context);
  }

  try {
    return await assessManufacturingThreatWithAI(request);
  } catch (error) {
    console.error(`AI assessment failed, using fallback:`, error);
    return assessManufacturingThreatAlgorithmically(threatId, context);
  }
}

/**
 * Generate narrative summary for manufacturing assessment (calls GPT-4)
 */
export async function generateManufacturingNarrative(options: {
  assessmentId: number;
  riskScenarios: ManufacturingAIAssessmentResponse[];
  facilityContext: ManufacturingAssessmentContext;
  narrativeType: 'executive_summary' | 'risk_landscape' | 'recommendations' | 'full_report';
}): Promise<string> {
  const { riskScenarios: results, facilityContext, narrativeType } = options;
  
  const topRisks = [...results]
    .sort((a, b) => b.inherentRisk.normalizedScore - a.inherentRisk.normalizedScore)
    .slice(0, 5);

  const ipTheftLevel = getIPTheftRiskLevel(facilityContext.interviewResponses);
  const insiderThreatLevel = getInsiderThreatRiskLevel(facilityContext.interviewResponses);
  const hasCFATS = facilityContext.interviewResponses.facility_8 === 'yes';

  let promptType = '';
  switch (narrativeType) {
    case 'executive_summary':
      promptType = 'a professional executive summary (300-500 words)';
      break;
    case 'risk_landscape':
      promptType = 'a detailed risk landscape analysis (500-800 words)';
      break;
    case 'recommendations':
      promptType = 'prioritized security recommendations (400-600 words)';
      break;
    case 'full_report':
      promptType = 'a comprehensive assessment report (800-1200 words)';
      break;
  }

  const prompt = `Generate ${promptType} for this manufacturing facility security risk assessment.

## ASSESSMENT RESULTS

Total Threats Assessed: ${results.length}
Critical Risks: ${results.filter(r => r.inherentRisk.classification === 'critical').length}
High Risks: ${results.filter(r => r.inherentRisk.classification === 'high').length}
Medium Risks: ${results.filter(r => r.inherentRisk.classification === 'medium').length}
Low Risks: ${results.filter(r => r.inherentRisk.classification === 'low').length}

IP Theft Risk Level: ${ipTheftLevel}
Insider Threat Risk Level: ${insiderThreatLevel}
CFATS Applicable: ${hasCFATS ? 'Yes' : 'No'}

## TOP 5 RISKS

${topRisks.map((r, i) => `
${i + 1}. ${r.threatId.replace(/_/g, ' ').toUpperCase()}
   - Risk Score: ${r.inherentRisk.normalizedScore.toFixed(1)}/100 (${r.inherentRisk.classification.toUpperCase()})
   - Threat Likelihood: ${r.threatLikelihood.score}/5 (${r.threatLikelihood.label})
   - Vulnerability: ${r.vulnerability.score}/5 (${r.vulnerability.label})
   - Impact: ${r.impact.score}/5 (${r.impact.label})
   - Key Control Gaps: ${r.vulnerability.controlGaps.slice(0, 3).join(', ') || 'None identified'}
`).join('\n')}

## FACILITY CONTEXT

Manufacturing Type: ${facilityContext.interviewResponses.facility_1 || 'Not specified'}
Production Value: ${facilityContext.interviewResponses.facility_3 || 'Not specified'}
Employee Count: ${facilityContext.interviewResponses.facility_5 || 'Not specified'}
Has Valuable IP: ${facilityContext.interviewResponses.facility_6 === 'yes' ? 'Yes' : 'No'}
Has Hazmat: ${hasCFATS ? 'Yes' : 'No'}

## INSTRUCTIONS

Write the narrative in a professional tone appropriate for presentation to senior management.

Focus on:
1. The most significant risks requiring immediate attention
2. IP protection and insider threat concerns
3. Regulatory compliance status (CFATS if applicable)
4. Prioritized recommendations with business justification
5. Quick wins vs. strategic investments

Do not use markdown formatting, headers, or bullet points. Write in flowing professional prose paragraphs.`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a CPP-certified security consultant writing professional assessment reports for manufacturing facilities. Write in clear, professional prose without markdown formatting.' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate narrative.';
  } catch (error) {
    console.error('Failed to generate narrative:', error);
    return `Assessment Summary: ${results.length} threats assessed across the manufacturing facility. ${results.filter(r => r.inherentRisk.classification === 'critical' || r.inherentRisk.classification === 'high').length} threats rated high or critical risk. IP Theft Risk: ${ipTheftLevel}. Insider Threat Risk: ${insiderThreatLevel}. Priority attention required for ${topRisks[0]?.threatId.replace(/_/g, ' ')} and ${topRisks[1]?.threatId.replace(/_/g, ' ')}.`;
  }
}

/**
 * Batch assess multiple threats (utility function)
 */
export async function batchAssessManufacturingThreats(
  threatIds: string[],
  interviewResponses: InterviewResponses,
  useAI: boolean = true
): Promise<ManufacturingAIAssessmentResponse[]> {
  const results: ManufacturingAIAssessmentResponse[] = [];
  
  for (const threatId of threatIds) {
    try {
      const result = await assessSingleManufacturingThreat(threatId, interviewResponses, { useAI });
      results.push(result);
      
      // Rate limiting delay for AI calls
      if (useAI) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to assess threat ${threatId}:`, error);
    }
  }
  
  return results;
}

/**
 * Get assessment confidence level based on data completeness
 */
export function assessDataCompleteness(interviewResponses: InterviewResponses): {
  completeness: number;
  missingCritical: string[];
  missingOptional: string[];
  confidence: 'high' | 'medium' | 'low';
} {
  const criticalFields = [
    'facility_1', 'facility_3', 'facility_5', 'facility_6',
    'production_1', 'ip_2', 'ip_5', 'personnel_1', 'personnel_3',
    'emergency_1', 'emergency_2'
  ];
  
  const optionalFields = [
    'perimeter_1', 'perimeter_3', 'production_5', 'ip_3', 'ip_7',
    'inventory_3', 'inventory_7', 'contractor_3', 'surveillance_3'
  ];
  
  const missingCritical: string[] = [];
  const missingOptional: string[] = [];
  
  criticalFields.forEach(field => {
    if (!interviewResponses[field]) {
      missingCritical.push(field);
    }
  });
  
  optionalFields.forEach(field => {
    if (!interviewResponses[field]) {
      missingOptional.push(field);
    }
  });
  
  const totalFields = criticalFields.length + optionalFields.length;
  const answeredFields = totalFields - missingCritical.length - missingOptional.length;
  const completeness = (answeredFields / totalFields) * 100;
  
  let confidence: 'high' | 'medium' | 'low';
  if (missingCritical.length === 0 && completeness >= 80) {
    confidence = 'high';
  } else if (missingCritical.length <= 3 && completeness >= 60) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }
  
  return {
    completeness,
    missingCritical,
    missingOptional,
    confidence,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ManufacturingAssessmentContext,
  ManufacturingAIAssessmentResponse,
  ManufacturingGeneratedScenarioResult,
  ManufacturingIncidentRecord,
  IPAssetProfile,
  CFATSProfile,
  CAPIndexData,
};

export default {
  generateManufacturingRiskScenariosWithAI,
  assessSingleManufacturingThreat,
  generateManufacturingNarrative,
  batchAssessManufacturingThreats,
  assessDataCompleteness,
};
