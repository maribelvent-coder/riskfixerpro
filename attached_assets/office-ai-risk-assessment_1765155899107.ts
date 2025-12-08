/**
 * RiskFixer Office Building AI Risk Assessment
 * 
 * Extends the base AI assessment framework with office-specific capabilities:
 * - T×V×I formula (standard facility assessment, scale 1-5 for each)
 * - Facility-centric assessment for commercial office buildings
 * - Access control, visitor management, workplace violence prevention
 * - Executive protection, data security, emergency preparedness
 * - ASIS International, NFPA, CPTED industry standards
 * 
 * DESIGN PHILOSOPHY:
 * - Evidence-based: Every score must cite specific findings
 * - Methodology-compliant: ASIS GDL-RA with corporate security extensions
 * - Conservative: Score toward higher risk when ambiguous
 * - Auditable: Clear reasoning chain for each score
 * - Fallback: Algorithmic calculation if AI fails
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 * @see RiskFixer-Office-Building-Framework-UPGRADED.md
 */

import OpenAI from 'openai';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { riskScenarios, assessments, threats } from '@shared/schema';

// Import algorithmic fallback functions from existing mapper
import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  generateControlRecommendations,
  OFFICE_BUILDING_THREATS,
  THREAT_CONTROL_MAPPING,
  InterviewResponses,
} from './office-interview-mapper';

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

export interface OfficeAssessmentContext {
  assessmentId: number;
  facilityName?: string;
  interviewResponses: InterviewResponses;
  photoAnalysisFindings?: string[];
  incidentHistory?: OfficeIncidentRecord[];
  neighborhoodData?: NeighborhoodSecurityData;
  complianceRequirements?: ComplianceProfile;
}

export interface OfficeIncidentRecord {
  date: string;
  type: 'unauthorized_access' | 'workplace_violence' | 'theft' | 'data_breach' | 
        'executive_threat' | 'bomb_threat' | 'intrusion' | 'civil_disturbance' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  policeReport?: boolean;
  injuriesReported?: boolean;
  propertyDamage?: boolean;
  resolutionStatus?: string;
}

export interface NeighborhoodSecurityData {
  crimeIndex?: number; // 0-100 scale
  violentCrimeRate?: number;
  propertyCrimeRate?: number;
  businessDistrictType?: string;
  nearbyHighRiskTargets?: string[];
  policeResponseTime?: number; // minutes
}

export interface ComplianceProfile {
  regulatoryFrameworks: string[]; // SOX, HIPAA, PCI, etc.
  industryType: string;
  publiclyTraded?: boolean;
  governmentContractor?: boolean;
  criticalInfrastructure?: boolean;
}

export interface OfficeThreatAssessmentRequest {
  threatId: string;
  threatName: string;
  threatCategory: string;
  asisCode?: string;
  context: OfficeAssessmentContext;
}

/**
 * Rich AI response format for Office Building assessments
 * T×V×I scale with evidence chains
 */
export interface OfficeAIAssessmentResponse {
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
    regulatoryImpact: string;
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

export interface OfficeGeneratedScenarioResult {
  success: boolean;
  mode: 'ai' | 'algorithmic' | 'hybrid';
  generatedScenarios: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScenarioIds: number[];
  overallSecurityPosture: string;
  aiConfidence: 'high' | 'medium' | 'low' | 'fallback';
  processingTimeMs: number;
}

// ============================================================================
// OFFICE-SPECIFIC SYSTEM PROMPT
// ============================================================================

const OFFICE_SYSTEM_PROMPT = `You are a CPP-certified (Certified Protection Professional) physical security consultant specializing in corporate office building security, conducting a formal risk assessment per ASIS International standards. You are assessing threats to an office building facility, focusing on access control, life safety, information protection, and business continuity.

Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview data, incident history, or facility profile provided. Never assume facts not in evidence. If data is missing, explicitly state "INSUFFICIENT DATA" for that element.

2. METHODOLOGY-COMPLIANT: Follow the ASIS GDL-RA framework using T×V×I where:
   - T (Threat Likelihood): 1-5 scale, probability of threat materializing at this facility
   - V (Vulnerability): 1-5 scale, degree to which current controls fail to prevent/detect/respond
   - I (Impact): 1-5 scale, consequence severity if attack succeeds (financial, safety, operational, regulatory)
   - Inherent Risk = T × V × I (scale 1-125, normalized to 0-100)

3. FACILITY-CENTRIC: Office building assessments focus on:
   - Access control and visitor management
   - Life safety and emergency preparedness
   - Workplace violence prevention
   - Information and data protection
   - Executive protection considerations
   - Business continuity implications

4. RUBRIC-ANCHORED: Use the exact scoring criteria provided.

THREAT LIKELIHOOD RUBRIC (1-5):
Score 1 (RARE): No incident history, low-crime area, no high-profile tenants, minimal public exposure
Score 2 (UNLIKELY): Isolated historical incidents only, average area crime, limited external factors
Score 3 (POSSIBLE): Periodic incidents documented, some concerning external factors, industry-typical exposure
Score 4 (LIKELY): Regular incidents, above-average area crime, high-profile tenants/executives, active threats in sector
Score 5 (ALMOST CERTAIN): Frequent incidents, high-crime area, confirmed threats against facility/occupants, recent serious events

VULNERABILITY RUBRIC (1-5):
Score 1 (MINIMAL): Comprehensive access control (mantrap/turnstiles), 24/7 security officers, monitored CCTV, tested emergency plans, zone-based access
Score 2 (LOW): Good access control systems, dedicated reception, camera coverage, documented procedures, regular training
Score 3 (MODERATE): Basic electronic access, visitor sign-in, some CCTV, basic emergency procedures, training gaps
Score 4 (HIGH): Limited access control, open entry, minimal CCTV, weak visitor management, no security personnel
Score 5 (CRITICAL): No access control, no visitor management, no CCTV, no emergency plans, multiple systemic failures

IMPACT RUBRIC (1-5):
Score 1 (NEGLIGIBLE): Minimal disruption, no safety concern, under $10,000 loss potential
Score 2 (MINOR): Limited disruption, minor safety concern, $10,000-$100,000 loss potential
Score 3 (MODERATE): Significant disruption, potential injuries, $100,000-$500,000 loss, limited regulatory exposure
Score 4 (MAJOR): Major business disruption, serious injuries possible, $500,000-$5M loss, regulatory violations likely
Score 5 (SEVERE): Business-threatening impact, life safety emergency, over $5M loss, significant legal/regulatory exposure, reputational catastrophe

5. STANDARD-REFERENCED: When recommending controls, cite specific standards:
   - ASIS International Physical Security Standards
   - ASIS GDL-FPSM (Facilities Physical Security Measures)
   - ASIS WVPI (Workplace Violence Prevention and Intervention)
   - NFPA 730/731 (Premises Security and Electronic Security Systems)
   - CPTED (Crime Prevention Through Environmental Design)
   - IBC/IFC (International Building/Fire Code)
   - OSHA General Duty Clause (workplace safety)

6. CONSERVATIVE: When evidence is ambiguous, score toward higher risk. Corporate security failures can have cascading impacts on employees, operations, and organizational reputation.

7. AUDITABLE: Your reasoning must be clear enough that another CPP reviewing would reach the same conclusion given the same evidence.

CRITICAL: If data is insufficient to assess a factor, state "INSUFFICIENT DATA" rather than guessing. Never hallucinate facts about the facility or its security posture.

OUTPUT FORMAT:
Respond with a JSON object matching the OfficeAIAssessmentResponse interface. Include evidence citations for every score.`;

// ============================================================================
// OFFICE INDUSTRY STANDARDS (Layer 3)
// ============================================================================

const OFFICE_INDUSTRY_STANDARDS = `
APPLICABLE STANDARDS FOR OFFICE BUILDING ASSESSMENTS:

1. ASIS International Standards:
   - ASIS GDL-RA (General Security Risk Assessment Guideline)
   - ASIS GDL-FPSM (Facilities Physical Security Measures)
   - ASIS POA (Physical Asset Protection)
   - ASIS WVPI (Workplace Violence Prevention and Intervention)
   - ASIS PAP (Protection of Assets - Physical)
   - ASIS ESRM (Enterprise Security Risk Management)

2. Electronic Security Standards:
   - NFPA 730 (Guide for Premises Security)
   - NFPA 731 (Standard for Installation of Electronic Security Systems)
   - UL 2050 (National Industrial Security Systems)
   - SIA OSDP (Open Supervised Device Protocol)

3. Access Control Standards:
   - ASIS Access Control Systems Guideline
   - FIPS 201 (Personal Identity Verification)
   - HSPD-12 (Federal access control for government facilities)
   - ADA Accessibility Requirements

4. Video Surveillance Standards:
   - ASIS Video Surveillance Best Practices
   - NIST Guidelines for Video Analytics
   - ONVIF Standards for IP Video Systems

5. Life Safety Standards:
   - NFPA 101 (Life Safety Code)
   - IBC (International Building Code)
   - IFC (International Fire Code)
   - OSHA General Duty Clause 5(a)(1)

6. Workplace Violence Prevention:
   - ASIS/SHRM Workplace Violence Prevention Standard
   - OSHA Workplace Violence Prevention Guidelines
   - FBI Active Shooter Resources
   - DHS Soft Target Security Guide

7. Emergency Management:
   - NFPA 1600 (Standard on Continuity, Emergency, and Crisis Management)
   - ASIS Business Continuity Guideline
   - FEMA Continuity Planning Resources

8. Crime Prevention:
   - CPTED (Crime Prevention Through Environmental Design)
   - ASIS Security Lighting Guideline
   - IES RP-20 (Lighting for Parking Facilities)

9. Data Protection (Physical Security):
   - ISO 27001 Physical Security Controls
   - NIST SP 800-53 Physical and Environmental Protection
   - SOX Section 404 (Physical Access Controls)
   - HIPAA Physical Safeguards (if applicable)

10. Benchmark Metrics:
    - Security staffing ratios: 1 officer per 10,000-15,000 sq ft (24/7 operations)
    - Camera coverage: 15-25 cameras per 100,000 sq ft (minimum)
    - Access control: 100% electronic control on perimeter, 80%+ on interior
    - Video retention: Minimum 30 days, 90+ days for high-security
    - Emergency response: Annual drills minimum, quarterly for high-risk
`;

// ============================================================================
// CONTEXT BUILDING FUNCTIONS
// ============================================================================

function buildOfficeFacilityProfile(context: OfficeAssessmentContext): string {
  const { interviewResponses, facilityName } = context;
  
  const sections: string[] = ['## FACILITY PROFILE'];
  
  // Basic Information
  sections.push(`
### Facility Overview
- Facility Name: ${facilityName || 'Not specified'}
- Business Function: ${interviewResponses.overview_1 || 'Not specified'}
- Employee Count: ${interviewResponses.overview_2 || 'Not specified'}
- Tenant Type: ${interviewResponses.overview_3 || 'Not specified'}
- Data Sensitivity: ${interviewResponses.overview_4 || 'Not specified'}
- High-Profile Executives: ${interviewResponses.overview_5 || 'Not specified'}
- Operating Hours: ${interviewResponses.overview_6 || 'Not specified'}
- Daily Visitors: ${interviewResponses.overview_7 || 'Not specified'}
- Asset Value: ${interviewResponses.overview_8 || 'Not specified'}
`);

  return sections.join('\n');
}

function buildOfficePerimeterSecurity(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## PERIMETER SECURITY

### Building Perimeter
- Perimeter Definition: ${interviewResponses.perimeter_1 || 'Not specified'}
- Exterior Lighting (1-5): ${interviewResponses.perimeter_2 || 'Not specified'}
- Concealment Landscaping: ${interviewResponses.perimeter_3 || 'Not specified'}
- Perimeter CCTV: ${interviewResponses.perimeter_4 || 'Not specified'}
- Perimeter Camera Coverage: ${interviewResponses.perimeter_4a || 'Not specified'}
- Vulnerable Entry Points: ${interviewResponses.perimeter_5 || 'Not specified'}
- Vulnerable Point Security: ${Array.isArray(interviewResponses.perimeter_5a) ? interviewResponses.perimeter_5a.join(', ') : interviewResponses.perimeter_5a || 'Not specified'}
- Perimeter Intrusion Detection: ${interviewResponses.perimeter_6 || 'Not specified'}
- Intrusion Monitoring: ${interviewResponses.perimeter_7 || 'Not specified'}
- Break-in History: ${interviewResponses.perimeter_8 || 'Not specified'}
`;
}

function buildOfficeParkingSecurity(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## PARKING SECURITY

### Parking Facilities
- Parking Type: ${interviewResponses.parking_1 || 'Not specified'}
- Parking Access Control: ${interviewResponses.parking_2 || 'Not specified'}
- Parking CCTV: ${interviewResponses.parking_3 || 'Not specified'}
- Parking Camera Coverage: ${interviewResponses.parking_3a || 'Not specified'}
- Parking Lighting (1-5): ${interviewResponses.parking_4 || 'Not specified'}
- Parking Incident History: ${interviewResponses.parking_5 || 'Not specified'}
- Parking Incident Frequency: ${interviewResponses.parking_5a || 'Not specified'}
- Security Escort Service: ${interviewResponses.parking_6 || 'Not specified'}
`;
}

function buildOfficeBuildingEntry(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## BUILDING ENTRY SECURITY

### Entry Point Access Control
- Number of Entry Points: ${interviewResponses.entry_1 || 'Not specified'}
- Main Entrance Access Control: ${interviewResponses.entry_2 || 'Not specified'}
- Anti-Tailgating Measures: ${interviewResponses.entry_3 || 'Not specified'}
- Staffed Reception: ${interviewResponses.entry_4 || 'Not specified'}
- Visitor Management System: ${interviewResponses.entry_5 || 'Not specified'}
- Visitor Escort Policy: ${interviewResponses.entry_6 || 'Not specified'}
- Entry Point CCTV: ${interviewResponses.entry_7 || 'Not specified'}
- After-Hours Door Security: ${interviewResponses.entry_8 || 'Not specified'}
- Forced Entry Alarms: ${interviewResponses.entry_9 || 'Not specified'}
- Unauthorized Entry History: ${interviewResponses.entry_10 || 'Not specified'}
- Unauthorized Entry Frequency: ${interviewResponses.entry_10a || 'Not specified'}
`;
}

function buildOfficeInteriorSecurity(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## INTERIOR SECURITY

### Interior Access Control
- Zone-Based Access: ${interviewResponses.interior_1 || 'Not specified'}
- Executive Suite Security: ${interviewResponses.interior_2 || 'Not specified'}
- Server Room Access: ${interviewResponses.interior_3 || 'Not specified'}
- Server Room CCTV: ${interviewResponses.interior_4 || 'Not specified'}
- Stairwell Access Control: ${interviewResponses.interior_5 || 'Not specified'}
- Elevator Floor Control: ${interviewResponses.interior_6 || 'Not specified'}
- Interior Common Area CCTV: ${interviewResponses.interior_7 || 'Not specified'}
- Access Rights Management: ${interviewResponses.interior_8 || 'Not specified'}
`;
}

function buildOfficeSurveillance(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## SURVEILLANCE SYSTEMS

### CCTV Configuration
- Total Cameras: ${interviewResponses.surveillance_1 || 'Not specified'}
- Camera Resolution: ${interviewResponses.surveillance_2 || 'Not specified'}
- Video Retention: ${interviewResponses.surveillance_3 || 'Not specified'}
- Real-Time Monitoring: ${interviewResponses.surveillance_4 || 'Not specified'}
- Video Analytics: ${Array.isArray(interviewResponses.surveillance_5) ? interviewResponses.surveillance_5.join(', ') : interviewResponses.surveillance_5 || 'Not specified'}
- Camera Maintenance: ${interviewResponses.surveillance_6 || 'Not specified'}
- CCTV Effectiveness Rating (1-5): ${interviewResponses.surveillance_7 || 'Not specified'}
`;
}

function buildOfficeIntrusionDetection(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## INTRUSION DETECTION

### Alarm Systems
- Intrusion Detection System: ${interviewResponses.intrusion_1 || 'Not specified'}
- Sensor Types: ${Array.isArray(interviewResponses.intrusion_2) ? interviewResponses.intrusion_2.join(', ') : interviewResponses.intrusion_2 || 'Not specified'}
- Alarm Monitoring: ${interviewResponses.intrusion_3 || 'Not specified'}
- System Testing Frequency: ${interviewResponses.intrusion_4 || 'Not specified'}
- False Alarm Issues: ${interviewResponses.intrusion_5 || 'Not specified'}
`;
}

function buildOfficeSecurityPersonnel(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## SECURITY PERSONNEL & PROCEDURES

### Staffing & Training
- Dedicated Security Personnel: ${interviewResponses.personnel_1 || 'Not specified'}
- Armed/Unarmed Status: ${interviewResponses.personnel_2 || 'Not specified'}
- Background Checks: ${interviewResponses.personnel_3 || 'Not specified'}
- Security Awareness Training: ${interviewResponses.personnel_4 || 'Not specified'}
- Executive Security Training: ${interviewResponses.personnel_5 || 'Not specified'}
- Documented Policies: ${Array.isArray(interviewResponses.personnel_6) ? interviewResponses.personnel_6.join(', ') : interviewResponses.personnel_6 || 'Not specified'}
- Policy Review Frequency: ${interviewResponses.personnel_7 || 'Not specified'}
- Anonymous Reporting System: ${interviewResponses.personnel_8 || 'Not specified'}
- Security Manager: ${interviewResponses.personnel_9 || 'Not specified'}
`;
}

function buildOfficeEmergencyPreparedness(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## EMERGENCY PREPAREDNESS

### Emergency Response Capabilities
- Written Emergency Plan: ${interviewResponses.emergency_1 || 'Not specified'}
- Emergency Scenarios Covered: ${Array.isArray(interviewResponses.emergency_2) ? interviewResponses.emergency_2.join(', ') : interviewResponses.emergency_2 || 'Not specified'}
- Emergency Drill Frequency: ${interviewResponses.emergency_3 || 'Not specified'}
- Mass Notification System: ${interviewResponses.emergency_4 || 'Not specified'}
- Panic/Duress Alarms: ${interviewResponses.emergency_5 || 'Not specified'}
- Remote Lockdown Capability: ${interviewResponses.emergency_6 || 'Not specified'}
- Designated Rally Points: ${interviewResponses.emergency_7 || 'Not specified'}
`;
}

function buildOfficeIncidentHistory(context: OfficeAssessmentContext): string {
  const { interviewResponses, incidentHistory } = context;
  
  const sections: string[] = ['## INCIDENT HISTORY'];
  
  // Interview-reported incidents
  sections.push(`
### Interview-Reported Incidents
- Workplace Violence History: ${interviewResponses.incident_1 || 'Not specified'}
${interviewResponses.incident_1a ? `- Violence Types: ${Array.isArray(interviewResponses.incident_1a) ? interviewResponses.incident_1a.join(', ') : interviewResponses.incident_1a}` : ''}
- Theft History: ${interviewResponses.incident_2 || 'Not specified'}
${interviewResponses.incident_2a ? `- Theft Frequency: ${interviewResponses.incident_2a}` : ''}
- Data Breach History: ${interviewResponses.incident_3 || 'Not specified'}
- Bomb Threat History: ${interviewResponses.incident_4 || 'Not specified'}
- Executive Targeting History: ${interviewResponses.incident_5 || 'Not specified'}
- Centralized Incident Tracking: ${interviewResponses.incident_6 || 'Not specified'}
`);

  // Detailed incident history if provided
  if (incidentHistory && incidentHistory.length > 0) {
    const incidentCounts = incidentHistory.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severeIncidents = incidentHistory.filter(i => 
      i.severity === 'high' || i.severity === 'critical'
    );

    sections.push(`
### Detailed Incident History
Total Incidents Recorded: ${incidentHistory.length}
Severe Incidents (High/Critical): ${severeIncidents.length}

Incident Breakdown by Type:
${Object.entries(incidentCounts).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

Recent Severe Incidents:
${severeIncidents.slice(0, 5).map(i => `- ${i.date}: ${i.type} (${i.severity}) - ${i.description}`).join('\n') || 'No severe incidents recorded'}
`);
  }

  return sections.join('\n');
}

function buildOfficeCyberPhysical(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## CYBER-PHYSICAL SECURITY

### Security System Network
- Network Segregation: ${interviewResponses.cyber_1 || 'Not specified'}
- Visitor WiFi Segregation: ${interviewResponses.cyber_2 || 'Not specified'}
- Security System Patching: ${interviewResponses.cyber_3 || 'Not specified'}
- Default Passwords in Use: ${interviewResponses.cyber_4 || 'Not specified'}
- Physical/Cyber Coordination: ${interviewResponses.cyber_5 || 'Not specified'}
`;
}

function buildOfficeDocumentSecurity(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## DOCUMENT & DATA SECURITY

### Information Protection
- Clean Desk Policy: ${interviewResponses.document_1 || 'Not specified'}
- Clean Desk Enforcement: ${interviewResponses.document_1a || 'Not specified'}
- Secure Document Destruction: ${interviewResponses.document_2 || 'Not specified'}
- Secure Print Release: ${interviewResponses.document_3 || 'Not specified'}
- Photography/Recording Policy: ${interviewResponses.document_4 || 'Not specified'}
- Physical File Security: ${interviewResponses.document_5 || 'Not specified'}
- Security Audits: ${interviewResponses.document_6 || 'Not specified'}
`;
}

function buildOfficeLoadingDock(context: OfficeAssessmentContext): string {
  const { interviewResponses } = context;
  
  if (interviewResponses.loading_1 !== 'yes') {
    return `## LOADING DOCK & RECEIVING
No loading dock at this facility.`;
  }
  
  return `## LOADING DOCK & RECEIVING

### Loading Dock Security
- Loading Dock Present: Yes
- Loading Dock Access Control: ${interviewResponses.loading_2 || 'Not specified'}
- Loading Dock CCTV: ${interviewResponses.loading_3 || 'Not specified'}
- Delivery Verification: ${interviewResponses.loading_4 || 'Not specified'}
- Loading Dock Separation: ${interviewResponses.loading_5 || 'Not specified'}
`;
}

function buildOfficePhotoFindings(context: OfficeAssessmentContext): string {
  if (!context.photoAnalysisFindings || context.photoAnalysisFindings.length === 0) {
    return '## PHOTO ANALYSIS FINDINGS\nNo photos analyzed for this assessment.';
  }

  return `## PHOTO ANALYSIS FINDINGS
${context.photoAnalysisFindings.map(f => `- ${f}`).join('\n')}
`;
}

function buildOfficeComplianceContext(context: OfficeAssessmentContext): string {
  const { complianceRequirements } = context;
  
  if (!complianceRequirements) {
    return '## COMPLIANCE CONTEXT\nNo specific compliance requirements identified.';
  }
  
  return `## COMPLIANCE CONTEXT

### Regulatory Environment
- Industry Type: ${complianceRequirements.industryType || 'Not specified'}
- Regulatory Frameworks: ${complianceRequirements.regulatoryFrameworks?.join(', ') || 'None specified'}
- Publicly Traded: ${complianceRequirements.publiclyTraded ? 'Yes' : 'No'}
- Government Contractor: ${complianceRequirements.governmentContractor ? 'Yes' : 'No'}
- Critical Infrastructure: ${complianceRequirements.criticalInfrastructure ? 'Yes' : 'No'}
`;
}

// ============================================================================
// USER PROMPT GENERATION
// ============================================================================

function generateOfficeThreatAssessmentPrompt(request: OfficeThreatAssessmentRequest): string {
  const { threatId, threatName, threatCategory, asisCode, context } = request;

  const facilityProfile = buildOfficeFacilityProfile(context);
  const perimeterSecurity = buildOfficePerimeterSecurity(context);
  const parkingSecurity = buildOfficeParkingSecurity(context);
  const buildingEntry = buildOfficeBuildingEntry(context);
  const interiorSecurity = buildOfficeInteriorSecurity(context);
  const surveillance = buildOfficeSurveillance(context);
  const intrusionDetection = buildOfficeIntrusionDetection(context);
  const securityPersonnel = buildOfficeSecurityPersonnel(context);
  const emergencyPreparedness = buildOfficeEmergencyPreparedness(context);
  const incidentHistory = buildOfficeIncidentHistory(context);
  const cyberPhysical = buildOfficeCyberPhysical(context);
  const documentSecurity = buildOfficeDocumentSecurity(context);
  const loadingDock = buildOfficeLoadingDock(context);
  const photoFindings = buildOfficePhotoFindings(context);
  const complianceContext = buildOfficeComplianceContext(context);

  return `## ASSESSMENT REQUEST

Assess the following threat for this office building:

**Threat:** ${threatName}
**Category:** ${threatCategory}
**ASIS Code:** ${asisCode || 'N/A'}
**Threat ID:** ${threatId}

---

${facilityProfile}

---

${perimeterSecurity}

---

${parkingSecurity}

---

${buildingEntry}

---

${interiorSecurity}

---

${surveillance}

---

${intrusionDetection}

---

${securityPersonnel}

---

${emergencyPreparedness}

---

${incidentHistory}

---

${cyberPhysical}

---

${documentSecurity}

---

${loadingDock}

---

${photoFindings}

---

${complianceContext}

---

## REQUIRED OUTPUT

Provide your assessment in JSON format matching the OfficeAIAssessmentResponse interface.

For this threat (${threatId}), assess:
1. Threat Likelihood (T) - probability this threat will occur at this facility (1-5)
2. Vulnerability (V) - degree to which current controls fail against this threat (1-5)
3. Impact (I) - consequence severity if attack succeeds (1-5)

Calculate: Inherent Risk = T × V × I (max 125, normalize to 0-100)

Cite specific evidence from the data provided for each score.
If data is insufficient for any element, flag it explicitly.`;
}

// ============================================================================
// AI ASSESSMENT FUNCTION
// ============================================================================

/**
 * Assess a single office threat using GPT-4
 */
async function assessOfficeThreatWithAI(
  request: OfficeThreatAssessmentRequest
): Promise<OfficeAIAssessmentResponse> {
  const systemPrompt = OFFICE_SYSTEM_PROMPT + '\n\n' + OFFICE_INDUSTRY_STANDARDS;
  const userPrompt = generateOfficeThreatAssessmentPrompt(request);

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
  return validateAndTransformOfficeResponse(parsed, request.threatId);
}

/**
 * Validate AI response and fill in missing fields
 */
function validateAndTransformOfficeResponse(
  parsed: any,
  threatId: string
): OfficeAIAssessmentResponse {
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
  if (normalizedRisk >= 75) classification = 'critical';
  else if (normalizedRisk >= 50) classification = 'high';
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
      regulatoryImpact: parsed.impact?.regulatoryImpact || parsed.impactRegulatory || '',
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
  if (normalized >= 75) return 'critical';
  if (normalized >= 50) return 'high';
  if (normalized >= 25) return 'medium';
  return 'low';
}

function getOverallSecurityPosture(responses: InterviewResponses): string {
  let securityFactors = 0;
  let totalFactors = 0;
  
  // Key security indicators
  const indicators = [
    { response: responses.entry_2, badValues: ['open access'] },
    { response: responses.entry_4, isYesGood: true },
    { response: responses.surveillance_1, badValues: ['no cameras'] },
    { response: responses.intrusion_1, isYesGood: true },
    { response: responses.emergency_1, isYesGood: true },
    { response: responses.personnel_1, badValues: ['no dedicated'] },
    { response: responses.personnel_3, badValues: ['no background'] },
  ];
  
  for (const ind of indicators) {
    totalFactors++;
    if (ind.isYesGood) {
      if (String(ind.response).toLowerCase() === 'yes') {
        securityFactors++;
      }
    } else if (ind.badValues) {
      const val = String(ind.response).toLowerCase();
      if (!ind.badValues.some(bad => val.includes(bad))) {
        securityFactors++;
      }
    }
  }
  
  const score = (securityFactors / totalFactors) * 100;
  
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Adequate';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Weak';
  return 'Critical';
}

// ============================================================================
// ALGORITHMIC FALLBACK
// ============================================================================

/**
 * Generate assessment using algorithmic calculation (no AI)
 */
function assessOfficeThreatAlgorithmically(
  threatId: string,
  context: OfficeAssessmentContext
): OfficeAIAssessmentResponse {
  const threat = OFFICE_BUILDING_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const { interviewResponses } = context;

  // Use existing algorithmic functions from office-interview-mapper
  const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
  const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threatId);
  const impact = calculateImpactFromInterview(interviewResponses, threatId);

  const inherentRisk = threatLikelihood * vulnerability * impact;
  const normalizedRisk = (inherentRisk / 125) * 100;

  const classification = classifyRiskLevel(inherentRisk);

  // Get control recommendations from existing mapper
  const recommendedControls = generateControlRecommendations(interviewResponses, threatId);

  // Build evidence based on threat type
  const evidence = buildAlgorithmicEvidence(threatId, interviewResponses);
  const controlGaps = buildControlGaps(threatId, interviewResponses);

  return {
    threatId,
    threatLikelihood: {
      score: threatLikelihood,
      label: getThreatLikelihoodLabel(threatLikelihood),
      evidence: evidence.likelihood,
      reasoning: `Score derived from baseline threat level (${threat.typicalLikelihood}) adjusted by interview-driven risk factors including incident history, facility profile, and environmental factors.`,
      confidence: 'medium',
      dataGaps: [],
    },
    vulnerability: {
      score: vulnerability,
      label: getVulnerabilityLabel(vulnerability),
      controlGaps: controlGaps,
      existingControls: buildExistingControls(interviewResponses),
      reasoning: 'Score derived from security posture analysis using risk factor counting methodology with divisor of 3.',
      confidence: 'medium',
      dataGaps: [],
    },
    impact: {
      score: impact,
      label: getImpactLabel(impact),
      financialImpact: impact >= 4 ? 'Significant financial loss potential' : 'Moderate financial exposure',
      operationalImpact: impact >= 4 ? 'Major operational disruption possible' : 'Limited operational impact',
      safetyImpact: getSafetyImpactDescription(threatId, impact),
      reputationalImpact: impact >= 4 ? 'Significant reputational risk' : 'Limited reputational impact',
      regulatoryImpact: impact >= 4 ? 'Potential regulatory exposure' : 'Minimal regulatory concern',
      reasoning: `Score derived from employee count, asset value, data sensitivity, and threat-specific impact modifiers.`,
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
      standardsReference: 'ASIS International Standards',
    })),
    scenarioDescription: `${threat.name} risk assessment for this office facility. Calculated inherent risk score: ${normalizedRisk.toFixed(1)}/100 (${classification.toUpperCase()}). ${threat.description}`,
    evidenceTrail: ['Algorithmic calculation - no AI evidence chain'],
    insufficientDataFlags: [],
  };
}

/**
 * Build evidence statements based on interview responses for algorithmic assessment
 */
function buildAlgorithmicEvidence(threatId: string, responses: InterviewResponses): { likelihood: string[] } {
  const evidence: string[] = [];
  
  // Common evidence items
  if (responses.overview_5 === 'yes') {
    evidence.push('High-profile executives present at facility');
  }
  if (String(responses.overview_4).toLowerCase().includes('highly sensitive')) {
    evidence.push('Facility handles highly sensitive data');
  }
  if (String(responses.overview_3).toLowerCase().includes('multi-tenant')) {
    evidence.push('Multi-tenant building with shared access');
  }
  
  // Threat-specific evidence
  switch (threatId) {
    case 'unauthorized_access':
      if (responses.entry_10 === 'yes') {
        evidence.push('History of unauthorized entry incidents');
      }
      if (String(responses.entry_2).toLowerCase().includes('open access')) {
        evidence.push('Open building access during business hours');
      }
      break;
      
    case 'workplace_violence':
      if (responses.incident_1 === 'yes') {
        evidence.push('Prior workplace violence incidents documented');
      }
      if (String(responses.overview_2).includes('500+')) {
        evidence.push('Large employee population increases exposure');
      }
      break;
      
    case 'theft_burglary':
      if (responses.incident_2 === 'yes') {
        evidence.push('History of theft incidents');
      }
      if (responses.perimeter_8 === 'yes') {
        evidence.push('Prior break-in attempts documented');
      }
      break;
      
    case 'executive_targeting':
      if (responses.incident_5 === 'yes') {
        evidence.push('History of executive targeting incidents');
      }
      if (responses.overview_5 === 'yes') {
        evidence.push('High-profile executives increase targeting risk');
      }
      break;
      
    case 'data_breach_physical':
      if (responses.incident_3 === 'yes') {
        evidence.push('Prior suspected data breaches');
      }
      if (String(responses.overview_4).toLowerCase().includes('highly sensitive')) {
        evidence.push('Highly sensitive data handled at facility');
      }
      break;
      
    case 'active_shooter':
    case 'terrorism_bomb_threat':
      if (responses.incident_4 === 'yes') {
        evidence.push('Prior bomb threat incidents');
      }
      if (String(responses.overview_1).toLowerCase().includes('government')) {
        evidence.push('Government facility increases targeting risk');
      }
      break;
      
    case 'after_hours_intrusion':
      if (responses.perimeter_8 === 'yes') {
        evidence.push('Prior break-in attempts documented');
      }
      if (responses.intrusion_1 === 'no') {
        evidence.push('No intrusion detection system increases vulnerability');
      }
      break;
      
    case 'insider_threat':
      if (String(responses.personnel_3).toLowerCase().includes('no background')) {
        evidence.push('No employee background checks');
      }
      if (responses.incident_2 === 'yes') {
        evidence.push('Theft history may indicate insider involvement');
      }
      break;
  }
  
  if (evidence.length === 0) {
    evidence.push('Calculated algorithmically from interview responses');
  }
  
  return { likelihood: evidence };
}

/**
 * Build control gaps based on interview responses
 */
function buildControlGaps(threatId: string, responses: InterviewResponses): string[] {
  const gaps: string[] = [];
  
  // Universal gaps
  if (responses.entry_4 === 'no') gaps.push('No staffed reception');
  if (String(responses.surveillance_1).toLowerCase().includes('no cameras')) gaps.push('No CCTV system');
  if (responses.intrusion_1 === 'no') gaps.push('No intrusion detection');
  if (responses.emergency_1 === 'no') gaps.push('No emergency response plan');
  
  // Threat-specific gaps
  const threatControls = THREAT_CONTROL_MAPPING[threatId] || [];
  
  // Add up to 3 threat-specific control recommendations as gaps
  for (const control of threatControls.slice(0, 3)) {
    const controlName = control.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    gaps.push(`Consider: ${controlName}`);
  }
  
  return gaps.slice(0, 5);
}

/**
 * Build list of existing controls from interview responses
 */
function buildExistingControls(responses: InterviewResponses): string[] {
  const controls: string[] = [];
  
  if (responses.entry_4 === 'yes') controls.push('Staffed reception desk');
  if (responses.perimeter_4 === 'yes') controls.push('Perimeter CCTV');
  if (responses.intrusion_1 === 'yes') controls.push('Intrusion detection system');
  if (responses.emergency_1 === 'yes') controls.push('Emergency response plan');
  if (responses.interior_1 === 'yes') controls.push('Zone-based access control');
  if (!String(responses.entry_2).toLowerCase().includes('open access')) {
    controls.push('Electronic access control');
  }
  if (responses.personnel_8 === 'yes') controls.push('Anonymous reporting system');
  if (responses.emergency_6 === 'yes') controls.push('Lockdown capability');
  
  return controls;
}

/**
 * Get safety impact description based on threat type
 */
function getSafetyImpactDescription(threatId: string, impact: number): string {
  const highSafetyThreats = ['workplace_violence', 'active_shooter', 'terrorism_bomb_threat', 'vehicle_ramming'];
  
  if (highSafetyThreats.includes(threatId)) {
    return 'Life safety threat - potential for serious injury or fatality';
  }
  
  if (impact >= 4) {
    return 'Potential safety concern for employees';
  }
  
  return 'Minimal direct safety impact';
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Generate office risk scenarios using AI with algorithmic fallback
 * 
 * This is the main entry point that:
 * 1. Attempts AI assessment for each threat
 * 2. Falls back to algorithmic calculation on failure
 * 3. Stores results in database
 * 4. Returns summary statistics
 */
export async function generateOfficeRiskScenariosWithAI(
  assessmentId: number,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: OfficeIncidentRecord[];
    neighborhoodData?: NeighborhoodSecurityData;
    complianceRequirements?: ComplianceProfile;
    facilityName?: string;
  }
): Promise<OfficeGeneratedScenarioResult> {
  const startTime = Date.now();
  const useAI = options?.useAI !== false; // Default to true

  const context: OfficeAssessmentContext = {
    assessmentId,
    facilityName: options?.facilityName,
    interviewResponses,
    photoAnalysisFindings: options?.photoFindings,
    incidentHistory: options?.incidentHistory,
    neighborhoodData: options?.neighborhoodData,
    complianceRequirements: options?.complianceRequirements,
  };

  const results: OfficeAIAssessmentResponse[] = [];
  let aiSuccessCount = 0;
  let algorithmicFallbackCount = 0;

  // Process each office threat
  for (const threat of OFFICE_BUILDING_THREATS) {
    const request: OfficeThreatAssessmentRequest = {
      threatId: threat.id,
      threatName: threat.name,
      threatCategory: threat.category,
      asisCode: threat.asisCode,
      context,
    };

    try {
      if (useAI) {
        // Attempt AI assessment
        const aiResult = await assessOfficeThreatWithAI(request);
        results.push(aiResult);
        aiSuccessCount++;
      } else {
        // Use algorithmic only
        const algoResult = assessOfficeThreatAlgorithmically(threat.id, context);
        results.push(algoResult);
        algorithmicFallbackCount++;
      }
    } catch (error) {
      console.error(`AI assessment failed for ${threat.id}, using fallback:`, error);
      
      // Fallback to algorithmic
      try {
        const algoResult = assessOfficeThreatAlgorithmically(threat.id, context);
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

  // Calculate overall security posture
  const overallSecurityPosture = getOverallSecurityPosture(interviewResponses);

  // Store results in database
  const riskScenarioIds: number[] = [];
  for (const result of results) {
    try {
      const threat = OFFICE_BUILDING_THREATS.find(t => t.id === result.threatId);
      
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
          category: threat?.category || 'Office',
          description: `${threat?.description || result.threatId} - ASIS Code: ${threat?.asisCode || 'N/A'}`,
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
    overallSecurityPosture,
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
export async function assessSingleOfficeThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  options?: { useAI?: boolean }
): Promise<OfficeAIAssessmentResponse> {
  const threat = OFFICE_BUILDING_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const context: OfficeAssessmentContext = {
    assessmentId: 0,
    interviewResponses,
  };

  const request: OfficeThreatAssessmentRequest = {
    threatId,
    threatName: threat.name,
    threatCategory: threat.category,
    asisCode: threat.asisCode,
    context,
  };

  if (options?.useAI === false) {
    return assessOfficeThreatAlgorithmically(threatId, context);
  }

  try {
    return await assessOfficeThreatWithAI(request);
  } catch (error) {
    console.error(`AI assessment failed, using fallback:`, error);
    return assessOfficeThreatAlgorithmically(threatId, context);
  }
}

/**
 * Generate narrative summary for office assessment (calls GPT-4)
 */
export async function generateOfficeNarrativeSummary(
  results: OfficeAIAssessmentResponse[],
  context: OfficeAssessmentContext
): Promise<string> {
  const topRisks = [...results]
    .sort((a, b) => b.inherentRisk.normalizedScore - a.inherentRisk.normalizedScore)
    .slice(0, 5);

  const securityPosture = getOverallSecurityPosture(context.interviewResponses);

  const prompt = `Generate a professional executive summary (400-600 words) for this office building security risk assessment.

## ASSESSMENT RESULTS

Facility: ${context.facilityName || 'Office Building'}
Total Threats Assessed: ${results.length}
Critical Risks: ${results.filter(r => r.inherentRisk.classification === 'critical').length}
High Risks: ${results.filter(r => r.inherentRisk.classification === 'high').length}
Medium Risks: ${results.filter(r => r.inherentRisk.classification === 'medium').length}
Low Risks: ${results.filter(r => r.inherentRisk.classification === 'low').length}

Overall Security Posture: ${securityPosture}

## FACILITY PROFILE
- Business Function: ${context.interviewResponses.overview_1 || 'Not specified'}
- Employee Count: ${context.interviewResponses.overview_2 || 'Not specified'}
- Tenant Type: ${context.interviewResponses.overview_3 || 'Not specified'}
- Data Sensitivity: ${context.interviewResponses.overview_4 || 'Not specified'}
- High-Profile Executives: ${context.interviewResponses.overview_5 || 'Not specified'}

## TOP RISK SCENARIOS

${topRisks.map(r => {
  const threat = OFFICE_BUILDING_THREATS.find(t => t.id === r.threatId);
  return `- ${threat?.name || r.threatId}: T=${r.threatLikelihood.score}, V=${r.vulnerability.score}, I=${r.impact.score} → Score: ${r.inherentRisk.normalizedScore.toFixed(1)}/100 (${r.inherentRisk.classification.toUpperCase()})`;
}).join('\n')}

## KEY EVIDENCE

${topRisks.slice(0, 3).map(r => {
  const threat = OFFICE_BUILDING_THREATS.find(t => t.id === r.threatId);
  return `${threat?.name || r.threatId}:
- ${r.threatLikelihood.evidence.slice(0, 2).join('\n- ')}`;
}).join('\n\n')}

Write in a professional tone suitable for presentation to executive leadership and the board of directors. Focus on actionable insights, regulatory compliance implications, and ROI-justified recommendations. Reference ASIS International and other relevant standards.`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a CPP-certified security consultant preparing a risk assessment summary for corporate leadership. Write professionally, concisely, and focus on actionable recommendations that protect employees, assets, and business operations.' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate narrative summary.';
  } catch (error) {
    console.error('Failed to generate narrative summary:', error);
    return 'Narrative summary generation failed. Please review the quantitative risk scores above.';
  }
}

/**
 * Get quick security score without full AI assessment
 */
export function getQuickSecurityScore(interviewResponses: InterviewResponses): {
  score: number;
  grade: string;
  posture: string;
  topGaps: string[];
} {
  let score = 0;
  let maxScore = 0;
  const gaps: string[] = [];

  // Access Control (25 points)
  maxScore += 25;
  if (!String(interviewResponses.entry_2).toLowerCase().includes('open access')) {
    score += 10;
  } else {
    gaps.push('Open building access');
  }
  if (interviewResponses.entry_4 === 'yes') {
    score += 5;
  } else {
    gaps.push('No staffed reception');
  }
  if (!String(interviewResponses.entry_5).toLowerCase().includes('no formal')) {
    score += 5;
  } else {
    gaps.push('No visitor management system');
  }
  if (!String(interviewResponses.entry_3).toLowerCase().includes('no -')) {
    score += 5;
  } else {
    gaps.push('No anti-tailgating measures');
  }

  // Surveillance (20 points)
  maxScore += 20;
  if (!String(interviewResponses.surveillance_1).toLowerCase().includes('no cameras')) {
    score += 10;
  } else {
    gaps.push('No CCTV system');
  }
  if (interviewResponses.entry_7 === 'yes') {
    score += 5;
  }
  if (interviewResponses.interior_7 === 'yes') {
    score += 5;
  }

  // Intrusion Detection (15 points)
  maxScore += 15;
  if (interviewResponses.intrusion_1 === 'yes') {
    score += 10;
  } else {
    gaps.push('No intrusion detection system');
  }
  if (String(interviewResponses.intrusion_3).toLowerCase().includes('central station')) {
    score += 5;
  }

  // Emergency Preparedness (20 points)
  maxScore += 20;
  if (interviewResponses.emergency_1 === 'yes') {
    score += 8;
  } else {
    gaps.push('No emergency response plan');
  }
  if (!String(interviewResponses.emergency_4).toLowerCase().includes('no mass')) {
    score += 6;
  } else {
    gaps.push('No mass notification system');
  }
  if (interviewResponses.emergency_6 === 'yes') {
    score += 6;
  }

  // Personnel & Training (20 points)
  maxScore += 20;
  if (!String(interviewResponses.personnel_1).toLowerCase().includes('no dedicated')) {
    score += 8;
  }
  if (!String(interviewResponses.personnel_3).toLowerCase().includes('no background')) {
    score += 6;
  } else {
    gaps.push('No employee background checks');
  }
  if (interviewResponses.personnel_9 === 'yes') {
    score += 6;
  }

  const percentScore = Math.round((score / maxScore) * 100);
  
  let grade: string;
  if (percentScore >= 90) grade = 'A';
  else if (percentScore >= 80) grade = 'B';
  else if (percentScore >= 70) grade = 'C';
  else if (percentScore >= 60) grade = 'D';
  else grade = 'F';

  let posture: string;
  if (percentScore >= 85) posture = 'Strong';
  else if (percentScore >= 70) posture = 'Adequate';
  else if (percentScore >= 50) posture = 'Moderate';
  else if (percentScore >= 30) posture = 'Weak';
  else posture = 'Critical';

  return {
    score: percentScore,
    grade,
    posture,
    topGaps: gaps.slice(0, 5),
  };
}

// ============================================================================
// ROUTE HANDLER EXPORTS
// ============================================================================

/**
 * Route handler for POST /api/assessments/:id/office-interview/generate-risks-ai
 */
export async function handleGenerateOfficeRisksAI(
  assessmentId: number,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: OfficeIncidentRecord[];
    facilityName?: string;
  }
): Promise<OfficeGeneratedScenarioResult> {
  return generateOfficeRiskScenariosWithAI(assessmentId, interviewResponses, options);
}

/**
 * Route handler for POST /api/assessments/:id/office-interview/assess-single-threat
 */
export async function handleAssessSingleOfficeThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  useAI: boolean = true
): Promise<OfficeAIAssessmentResponse> {
  return assessSingleOfficeThreat(threatId, interviewResponses, { useAI });
}

/**
 * Route handler for POST /api/assessments/:id/office-interview/generate-narrative
 */
export async function handleGenerateOfficeNarrative(
  results: OfficeAIAssessmentResponse[],
  context: OfficeAssessmentContext
): Promise<{ narrative: string }> {
  const narrative = await generateOfficeNarrativeSummary(results, context);
  return { narrative };
}

/**
 * Route handler for GET /api/assessments/:id/office-interview/quick-score
 */
export function handleGetQuickSecurityScore(
  interviewResponses: InterviewResponses
): { score: number; grade: string; posture: string; topGaps: string[] } {
  return getQuickSecurityScore(interviewResponses);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  OFFICE_SYSTEM_PROMPT,
  OFFICE_INDUSTRY_STANDARDS,
  assessOfficeThreatWithAI,
  assessOfficeThreatAlgorithmically,
  buildOfficeFacilityProfile,
  buildOfficePerimeterSecurity,
  buildOfficeBuildingEntry,
  buildOfficeIncidentHistory,
  generateOfficeThreatAssessmentPrompt,
  OFFICE_BUILDING_THREATS,
};

export default {
  // Main orchestration
  generateOfficeRiskScenariosWithAI,
  
  // Single threat assessment
  assessSingleOfficeThreat,
  
  // Narrative generation
  generateOfficeNarrativeSummary,
  
  // Quick scoring
  getQuickSecurityScore,
  
  // Route handlers
  handleGenerateOfficeRisksAI,
  handleAssessSingleOfficeThreat,
  handleGenerateOfficeNarrative,
  handleGetQuickSecurityScore,
  
  // Internal (exposed for testing)
  assessOfficeThreatWithAI,
  assessOfficeThreatAlgorithmically,
  buildOfficeFacilityProfile,
  buildOfficePerimeterSecurity,
  buildOfficeBuildingEntry,
};
