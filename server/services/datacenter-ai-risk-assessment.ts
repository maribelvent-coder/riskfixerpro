/**
 * RiskFixer Datacenter AI Risk Assessment
 * 
 * Extends the base AI assessment framework with datacenter-specific capabilities:
 * - T×V×I formula (standard facility assessment, scale 1-5 for each)
 * - Critical infrastructure focus with 99.999% uptime expectations
 * - Power, cooling, fire suppression infrastructure security
 * - Compliance-driven assessment (SOC 2, ISO 27001, PCI-DSS)
 * - Uptime Institute Tier Standards integration
 * 
 * DESIGN PHILOSOPHY:
 * - Evidence-based: Every score must cite specific findings
 * - Methodology-compliant: ASIS GDL-RA with datacenter extensions
 * - Conservative: Score toward higher risk when ambiguous
 * - Auditable: Clear reasoning chain for each score
 * - Fallback: Algorithmic calculation if AI fails
 * 
 * INDUSTRY CONTEXT:
 * - Average datacenter downtime cost: $9,000/minute
 * - Tier IV requires 99.995% uptime (26 minutes/year max)
 * - 60%+ of sabotage involves insiders (FBI)
 * - 30%+ of physical intrusions involve tailgating
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 * @see RiskFixer-Datacenter-Framework.md
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
  DATACENTER_THREATS,
  THREAT_CONTROL_MAPPING,
  InterviewResponses,
} from './datacenter-interview-mapper';

// ============================================================================
// CONFIGURATION
// ============================================================================

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

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

export interface DatacenterAssessmentContext {
  assessmentId: number;
  facilityName?: string;
  interviewResponses: InterviewResponses;
  photoAnalysisFindings?: string[];
  incidentHistory?: DatacenterIncidentRecord[];
  complianceRequirements?: DatacenterComplianceProfile;
  uptimeMetrics?: UptimeMetrics;
}

export interface DatacenterIncidentRecord {
  date: string;
  type: 'power_outage' | 'cooling_failure' | 'fire' | 'water_damage' | 'security_breach' |
        'insider_incident' | 'equipment_theft' | 'cyber_physical' | 'natural_disaster' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  downtimeMinutes?: number;
  financialImpact?: number;
  customerImpact?: number; // Number of customers affected
  rootCause?: string;
  policeReport?: boolean;
}

export interface DatacenterComplianceProfile {
  soc2TypeII?: boolean;
  soc2ReportDate?: string;
  iso27001?: boolean;
  iso27001CertDate?: string;
  pciDss?: boolean;
  pciDssLevel?: number;
  hipaa?: boolean;
  fedramp?: boolean;
  additionalCertifications?: string[];
}

export interface UptimeMetrics {
  tierClassification: 'I' | 'II' | 'III' | 'IV';
  actualUptimePercent?: number;
  plannedDowntimeHours?: number;
  unplannedIncidentsLast12Months?: number;
  mttr?: number; // Mean time to repair in minutes
  mtbf?: number; // Mean time between failures in hours
}

export interface DatacenterThreatAssessmentRequest {
  threatId: string;
  threatName: string;
  threatCategory: string;
  asisCode?: string;
  context: DatacenterAssessmentContext;
}

/**
 * Rich AI response format for Datacenter assessments
 * T×V×I scale with evidence chains
 */
export interface DatacenterAIAssessmentResponse {
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
    customerImpact: string;
    complianceImpact: string;
    reputationalImpact: string;
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

export interface DatacenterGeneratedScenarioResult {
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
// DATACENTER-SPECIFIC SYSTEM PROMPT
// ============================================================================

const DATACENTER_SYSTEM_PROMPT = `You are a CPP-certified (Certified Protection Professional) physical security consultant specializing in datacenter and critical infrastructure security, conducting a formal risk assessment per ASIS International standards. You are assessing threats to a datacenter facility, focusing on physical access control, infrastructure protection, and business continuity.

Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview data, incident history, or facility profile provided. Never assume facts not in evidence. If data is missing, explicitly state "INSUFFICIENT DATA" for that element.

2. METHODOLOGY-COMPLIANT: Follow the ASIS GDL-RA framework using T×V×I where:
   - T (Threat Likelihood): 1-5 scale, probability of threat materializing at this facility
   - V (Vulnerability): 1-5 scale, degree to which current controls fail to prevent/detect/respond
   - I (Impact): 1-5 scale, consequence severity if attack succeeds (financial, operational, customer)
   - Inherent Risk = T × V × I (scale 1-125, normalized to 0-100)

3. DATACENTER-CENTRIC: Datacenter assessments focus on:
   - Physical access control with defense-in-depth (perimeter to cabinet)
   - Power infrastructure protection (utility, UPS, generator)
   - Cooling and environmental control security
   - Fire suppression system integrity
   - Insider threat with privileged access
   - Compliance requirements (SOC 2, ISO 27001, PCI-DSS)
   - Business continuity and customer SLA protection

4. RUBRIC-ANCHORED: Use the exact scoring criteria provided.

THREAT LIKELIHOOD RUBRIC (1-5):
Score 1 (RARE): No incident history, Tier III/IV facility with mature security, no external threat indicators
Score 2 (UNLIKELY): Isolated historical incidents only, good security posture, limited exposure
Score 3 (POSSIBLE): Periodic incidents documented, industry-typical exposure, some control gaps
Score 4 (LIKELY): Regular incidents, above-average crime area, significant control gaps, disgruntled employees
Score 5 (ALMOST CERTAIN): Frequent incidents, confirmed threats, critical control failures, recent serious events

VULNERABILITY RUBRIC (1-5):
Score 1 (MINIMAL): Tier IV-level security (man-traps, biometrics, 24/7 SOC), comprehensive redundancy, all compliance certs
Score 2 (LOW): Tier III-level security, multi-factor access, good monitoring, SOC 2 certified
Score 3 (MODERATE): Tier II-level security, basic access control, some monitoring gaps, working toward certification
Score 4 (HIGH): Tier I-level security, single-factor access, limited monitoring, no compliance certification
Score 5 (CRITICAL): No access control, no monitoring, single points of failure, no emergency plans

IMPACT RUBRIC (1-5):
Score 1 (NEGLIGIBLE): Minimal disruption, under 5 minutes downtime, under $1,000 financial impact
Score 2 (MINOR): Limited disruption, 5-30 minutes downtime, $1,000-$50,000 impact, single customer affected
Score 3 (MODERATE): Significant disruption, 30 min-4 hours downtime, $50,000-$500,000 impact, multiple customers
Score 4 (MAJOR): Major disruption, 4-24 hours downtime, $500,000-$5M impact, SLA violations, regulatory concern
Score 5 (SEVERE): Catastrophic disruption, 24+ hours downtime, over $5M impact, mass SLA violations, regulatory penalties

5. STANDARD-REFERENCED: When recommending controls, cite specific standards:
   - Uptime Institute Tier Standards
   - TIA-942 (Telecommunications Infrastructure Standard for Data Centers)
   - SOC 2 Type II Trust Services Criteria
   - ISO 27001 Information Security Controls
   - PCI-DSS Physical Security Requirements
   - NFPA 75/76 (Fire Protection of IT Equipment)
   - ASHRAE (Environmental Guidelines for Datacenters)

6. CONSERVATIVE: When evidence is ambiguous, score toward higher risk. Datacenter failures can have cascading impacts costing $9,000+ per minute of downtime.

7. AUDITABLE: Your reasoning must be clear enough that another CPP reviewing would reach the same conclusion given the same evidence.

CRITICAL: If data is insufficient to assess a factor, state "INSUFFICIENT DATA" rather than guessing. Never hallucinate facts about the facility or its security posture.

OUTPUT FORMAT:
Respond with a JSON object matching the DatacenterAIAssessmentResponse interface. Include evidence citations for every score.`;

// ============================================================================
// DATACENTER INDUSTRY STANDARDS (Layer 3)
// ============================================================================

const DATACENTER_INDUSTRY_STANDARDS = `
APPLICABLE STANDARDS FOR DATACENTER ASSESSMENTS:

1. Uptime Institute Tier Standards:
   - Tier I: Basic Capacity (99.671% uptime - 28.8 hours/year downtime)
   - Tier II: Redundant Capacity (99.741% uptime - 22 hours/year)
   - Tier III: Concurrently Maintainable (99.982% uptime - 1.6 hours/year)
   - Tier IV: Fault Tolerant (99.995% uptime - 26 minutes/year)
   - Each tier has specific security, power, and cooling requirements

2. TIA-942 (Telecommunications Infrastructure Standard):
   - Physical security perimeter requirements
   - Access control layers (site, building, floor, room, cage, cabinet)
   - Standoff distance from public roads (100ft+ for high security)
   - Environmental protection requirements

3. SOC 2 Type II Trust Services Criteria:
   - Security: Access controls, intrusion detection, incident response
   - Availability: Uptime monitoring, capacity management, disaster recovery
   - Processing Integrity: Change management, monitoring
   - Confidentiality: Data classification, encryption requirements
   - Privacy: Data handling procedures

4. ISO 27001 Physical Security Controls:
   - A.11.1 Secure areas
   - A.11.2 Equipment protection
   - Physical access control requirements
   - Environmental threats protection

5. PCI-DSS Physical Security (for payment processing):
   - Requirement 9: Restrict physical access to cardholder data
   - 90-day video retention minimum
   - Unique authentication per individual
   - Visitor management requirements

6. NFPA 75/76 (Fire Protection for IT):
   - Clean agent suppression requirements
   - Early detection (VESDA) recommendations
   - Zoned suppression to prevent total discharge
   - Manual release button protection

7. ASHRAE Environmental Guidelines:
   - Temperature: 64.4°F-80.6°F (18°C-27°C) recommended
   - Humidity: 8-60% relative humidity
   - Airborne particulate standards

8. Key Metrics and Benchmarks:
   - Average datacenter downtime cost: $9,000/minute
   - Industry average unplanned downtime: 26 hours/year
   - Insider involvement in sabotage: 60%+ (FBI statistic)
   - Tailgating involvement in intrusions: 30%+
   - Video retention standard: 90+ days for compliance
   - Access review frequency: Quarterly minimum (SOC 2)
   - Background check requirement: All datacenter personnel (SOC 2)
`;

// ============================================================================
// CONTEXT BUILDING FUNCTIONS
// ============================================================================

function buildDatacenterFacilityProfile(context: DatacenterAssessmentContext): string {
  const { interviewResponses, facilityName, uptimeMetrics } = context;
  
  const sections: string[] = ['## FACILITY PROFILE'];
  
  sections.push(`
### Datacenter Overview
- Facility Name: ${facilityName || 'Not specified'}
- Tier Classification: ${interviewResponses.dc_tier_classification || uptimeMetrics?.tierClassification || 'Not specified'}
- Size/Capacity: ${interviewResponses.dc_size_capacity || 'Not specified'}
- Customer Type: ${interviewResponses.dc_customer_type || 'Not specified'}
- Customer Count: ${interviewResponses.dc_customer_count || 'Not specified'}
- Data Classification: ${interviewResponses.dc_data_classification || 'Not specified'}
- SLA Commitments: ${interviewResponses.dc_sla_commitments || 'Not specified'}
- Downtime Penalty: ${interviewResponses.dc_downtime_penalty || 'Not specified'}
`);

  if (uptimeMetrics) {
    sections.push(`
### Uptime Metrics
- Actual Uptime: ${uptimeMetrics.actualUptimePercent ? uptimeMetrics.actualUptimePercent + '%' : 'Not measured'}
- Unplanned Incidents (12 months): ${uptimeMetrics.unplannedIncidentsLast12Months ?? 'Not tracked'}
- MTTR: ${uptimeMetrics.mttr ? uptimeMetrics.mttr + ' minutes' : 'Not measured'}
- MTBF: ${uptimeMetrics.mtbf ? uptimeMetrics.mtbf + ' hours' : 'Not measured'}
`);
  }

  return sections.join('\n');
}

function buildDatacenterPerimeterSecurity(context: DatacenterAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## PERIMETER & SITE SECURITY

### Site Perimeter
- Perimeter Fencing: ${interviewResponses.dc_perimeter_fencing || 'Not specified'}
- Fencing Height/Type: ${interviewResponses.dc_fencing_details || 'Not specified'}
- Vehicle Barriers: ${interviewResponses.dc_vehicle_barriers || 'Not specified'}
- K-Rating if applicable: ${interviewResponses.dc_vehicle_barrier_rating || 'Not specified'}
- Standoff Distance: ${interviewResponses.dc_standoff_distance || 'Not specified'}
- Perimeter Lighting: ${interviewResponses.dc_perimeter_lighting || 'Not specified'}
- Perimeter CCTV: ${interviewResponses.dc_perimeter_cctv || 'Not specified'}
- Perimeter Intrusion Detection: ${interviewResponses.dc_perimeter_ids || 'Not specified'}
- Guard Checkpoint: ${interviewResponses.dc_guard_checkpoint || 'Not specified'}
- Guard Force (24/7): ${interviewResponses.dc_security_24x7 || 'Not specified'}
- Break-in History: ${interviewResponses.dc_breakin_history || 'Not specified'}
`;
}

function buildDatacenterAccessControl(context: DatacenterAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## ACCESS CONTROL & AUTHENTICATION

### Physical Access Control
- Access Control System Type: ${interviewResponses.dc_access_system || 'Not specified'}
- Authentication Method: ${interviewResponses.dc_auth_method || 'Not specified'}
- Biometric Authentication: ${interviewResponses.dc_biometric || 'Not specified'}
- Man-trap/Airlock: ${interviewResponses.dc_mantrap || 'Not specified'}
- Anti-Tailgating: ${interviewResponses.dc_anti_tailgate || 'Not specified'}
- Cabinet-Level Locks: ${interviewResponses.dc_cabinet_locks || 'Not specified'}
- Visitor Management System: ${interviewResponses.dc_visitor_mgmt || 'Not specified'}
- Escort Requirements: ${interviewResponses.dc_escort_required || 'Not specified'}
- Access Logging: ${interviewResponses.dc_access_logging || 'Not specified'}
- Access Review Frequency: ${interviewResponses.dc_access_review || 'Not specified'}
- Access Revocation Time: ${interviewResponses.dc_revocation_time || 'Not specified'}
- Customer Access Segregation: ${interviewResponses.dc_customer_segregation || 'Not specified'}
- Two-Person Rule: ${interviewResponses.dc_two_person_rule || 'Not specified'}
- Unauthorized Access History: ${interviewResponses.dc_unauthorized_history || 'Not specified'}
`;
}

function buildDatacenterSurveillance(context: DatacenterAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## SURVEILLANCE & MONITORING

### CCTV System
- CCTV Coverage: ${interviewResponses.dc_cctv_coverage || 'Not specified'}
- Hands-on-Servers Visibility: ${interviewResponses.dc_cctv_hands_on || 'Not specified'}
- Video Retention Period: ${interviewResponses.dc_video_retention || 'Not specified'}
- Video Analytics: ${interviewResponses.dc_video_analytics || 'Not specified'}
- Real-Time Monitoring: ${interviewResponses.dc_realtime_monitoring || 'Not specified'}

### Operations Center
- NOC/SOC Present: ${interviewResponses.dc_noc_soc || 'Not specified'}
- NOC/SOC Staffing: ${interviewResponses.dc_noc_staffing || 'Not specified'}
- Alarm Monitoring: ${interviewResponses.dc_alarm_monitoring || 'Not specified'}
- Environmental Sensor Monitoring: ${interviewResponses.dc_env_monitoring || 'Not specified'}
`;
}

function buildDatacenterPowerSecurity(context: DatacenterAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## POWER INFRASTRUCTURE SECURITY

### Power Systems
- Utility Feeds: ${interviewResponses.dc_utility_feeds || 'Not specified'}
- UPS Configuration: ${interviewResponses.dc_ups_config || 'Not specified'}
- UPS Runtime: ${interviewResponses.dc_ups_runtime || 'Not specified'}
- Generator Configuration: ${interviewResponses.dc_generator_config || 'Not specified'}
- Generator Transfer: ${interviewResponses.dc_gen_transfer || 'Not specified'}
- Fuel Storage Capacity: ${interviewResponses.dc_fuel_capacity || 'Not specified'}
- Fuel Resupply Agreement: ${interviewResponses.dc_fuel_agreement || 'Not specified'}

### Power Security
- EPO Button Protection: ${interviewResponses.dc_epo_protection || 'Not specified'}
- Electrical Room Access: ${interviewResponses.dc_electrical_access || 'Not specified'}
- Generator Yard Security: ${interviewResponses.dc_gen_yard_security || 'Not specified'}
- Fuel Storage Security: ${interviewResponses.dc_fuel_security || 'Not specified'}
- Power Outage History: ${interviewResponses.dc_power_history || 'Not specified'}
`;
}

function buildDatacenterCoolingSecurity(context: DatacenterAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## COOLING & ENVIRONMENTAL CONTROLS

### Cooling Systems
- Cooling System Type: ${interviewResponses.dc_cooling_type || 'Not specified'}
- Cooling Redundancy: ${interviewResponses.dc_cooling_redundancy || 'Not specified'}
- Hot/Cold Aisle Containment: ${interviewResponses.dc_aisle_containment || 'Not specified'}
- Temperature Monitoring: ${interviewResponses.dc_temp_monitoring || 'Not specified'}
- Humidity Monitoring: ${interviewResponses.dc_humidity_monitoring || 'Not specified'}

### Cooling Security
- Chiller Plant Access: ${interviewResponses.dc_chiller_access || 'Not specified'}
- Cooling Tower Security: ${interviewResponses.dc_cooling_tower_security || 'Not specified'}
- Water Leak Detection: ${interviewResponses.dc_leak_detection || 'Not specified'}
- Cooling Failure History: ${interviewResponses.dc_cooling_history || 'Not specified'}
`;
}

function buildDatacenterFireSuppression(context: DatacenterAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## FIRE SUPPRESSION & LIFE SAFETY

### Fire Detection
- Detection System Type: ${interviewResponses.dc_fire_detection || 'Not specified'}
- VESDA Early Detection: ${interviewResponses.dc_vesda || 'Not specified'}
- Detection Monitoring: ${interviewResponses.dc_fire_monitoring || 'Not specified'}

### Fire Suppression
- Suppression Type: ${interviewResponses.dc_suppression_type || 'Not specified'}
- Clean Agent Used: ${interviewResponses.dc_clean_agent || 'Not specified'}
- Zoned Suppression: ${interviewResponses.dc_zoned_suppression || 'Not specified'}
- Manual Release Protection: ${interviewResponses.dc_manual_release || 'Not specified'}
- System Testing Frequency: ${interviewResponses.dc_fire_testing || 'Not specified'}
- Fire Incident History: ${interviewResponses.dc_fire_history || 'Not specified'}
`;
}

function buildDatacenterPersonnelSecurity(context: DatacenterAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## PERSONNEL SECURITY & TRAINING

### Employee Security
- Background Checks: ${interviewResponses.dc_background_checks || 'Not specified'}
- Background Check Scope: ${interviewResponses.dc_background_scope || 'Not specified'}
- Security Training: ${interviewResponses.dc_security_training || 'Not specified'}
- Training Frequency: ${interviewResponses.dc_training_frequency || 'Not specified'}
- Termination Procedures: ${interviewResponses.dc_termination_procedures || 'Not specified'}
- Tool Control: ${interviewResponses.dc_tool_control || 'Not specified'}
- Media Destruction: ${interviewResponses.dc_media_destruction || 'Not specified'}

### Contractor Security
- Contractor Vetting: ${interviewResponses.dc_contractor_vetting || 'Not specified'}
- Contractor Supervision: ${interviewResponses.dc_contractor_supervision || 'Not specified'}
- Contractor Access Review: ${interviewResponses.dc_contractor_review || 'Not specified'}

### Insider Incident History: ${interviewResponses.dc_insider_history || 'Not specified'}
`;
}

function buildDatacenterComplianceContext(context: DatacenterAssessmentContext): string {
  const { interviewResponses, complianceRequirements } = context;
  
  let complianceSection = `## COMPLIANCE & AUDIT

### Certifications
- SOC 2 Type II: ${interviewResponses.dc_soc2 || complianceRequirements?.soc2TypeII ? 'Yes' : 'No' || 'Not specified'}
- ISO 27001: ${interviewResponses.dc_iso27001 || complianceRequirements?.iso27001 ? 'Yes' : 'No' || 'Not specified'}
- PCI-DSS: ${interviewResponses.dc_pcidss || complianceRequirements?.pciDss ? 'Yes' : 'No' || 'Not specified'}
- HIPAA: ${interviewResponses.dc_hipaa || complianceRequirements?.hipaa ? 'Yes' : 'No' || 'Not specified'}
- FedRAMP: ${interviewResponses.dc_fedramp || complianceRequirements?.fedramp ? 'Yes' : 'No' || 'Not specified'}

### Audit Program
- Audit Frequency: ${interviewResponses.dc_audit_frequency || 'Not specified'}
- Last Audit Date: ${interviewResponses.dc_last_audit || 'Not specified'}
- Penetration Testing: ${interviewResponses.dc_pentest || 'Not specified'}
- Vulnerability Scanning: ${interviewResponses.dc_vuln_scanning || 'Not specified'}
- Change Management: ${interviewResponses.dc_change_mgmt || 'Not specified'}
`;

  if (complianceRequirements?.additionalCertifications?.length) {
    complianceSection += `\nAdditional Certifications: ${complianceRequirements.additionalCertifications.join(', ')}`;
  }

  return complianceSection;
}

function buildDatacenterIncidentHistory(context: DatacenterAssessmentContext): string {
  const { interviewResponses, incidentHistory } = context;
  
  const sections: string[] = ['## INCIDENT HISTORY'];
  
  sections.push(`
### Interview-Reported Incidents
- Power Outage History: ${interviewResponses.dc_power_history || 'Not specified'}
- Cooling Failure History: ${interviewResponses.dc_cooling_history || 'Not specified'}
- Fire Incident History: ${interviewResponses.dc_fire_history || 'Not specified'}
- Security Breach History: ${interviewResponses.dc_unauthorized_history || 'Not specified'}
- Insider Incident History: ${interviewResponses.dc_insider_history || 'Not specified'}
- Break-in History: ${interviewResponses.dc_breakin_history || 'Not specified'}
`);

  if (incidentHistory && incidentHistory.length > 0) {
    const incidentCounts = incidentHistory.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severeIncidents = incidentHistory.filter(i => 
      i.severity === 'high' || i.severity === 'critical'
    );

    const totalDowntime = incidentHistory.reduce((sum, i) => sum + (i.downtimeMinutes || 0), 0);

    sections.push(`
### Detailed Incident History
Total Incidents Recorded: ${incidentHistory.length}
Severe Incidents (High/Critical): ${severeIncidents.length}
Total Downtime: ${totalDowntime} minutes

Incident Breakdown by Type:
${Object.entries(incidentCounts).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

Recent Severe Incidents:
${severeIncidents.slice(0, 5).map(i => `- ${i.date}: ${i.type} (${i.severity}) - ${i.description}${i.downtimeMinutes ? ` [${i.downtimeMinutes} min downtime]` : ''}`).join('\n') || 'No severe incidents recorded'}
`);
  }

  return sections.join('\n');
}

function buildDatacenterPhotoFindings(context: DatacenterAssessmentContext): string {
  if (!context.photoAnalysisFindings || context.photoAnalysisFindings.length === 0) {
    return '## PHOTO ANALYSIS FINDINGS\nNo photos analyzed for this assessment.';
  }

  return `## PHOTO ANALYSIS FINDINGS
${context.photoAnalysisFindings.map(f => `- ${f}`).join('\n')}
`;
}

// ============================================================================
// USER PROMPT GENERATION
// ============================================================================

function generateDatacenterThreatAssessmentPrompt(request: DatacenterThreatAssessmentRequest): string {
  const { threatId, threatName, threatCategory, asisCode, context } = request;

  const facilityProfile = buildDatacenterFacilityProfile(context);
  const perimeterSecurity = buildDatacenterPerimeterSecurity(context);
  const accessControl = buildDatacenterAccessControl(context);
  const surveillance = buildDatacenterSurveillance(context);
  const powerSecurity = buildDatacenterPowerSecurity(context);
  const coolingSecurity = buildDatacenterCoolingSecurity(context);
  const fireSuppression = buildDatacenterFireSuppression(context);
  const personnelSecurity = buildDatacenterPersonnelSecurity(context);
  const complianceContext = buildDatacenterComplianceContext(context);
  const incidentHistory = buildDatacenterIncidentHistory(context);
  const photoFindings = buildDatacenterPhotoFindings(context);

  return `## ASSESSMENT REQUEST

Assess the following threat for this datacenter:

**Threat:** ${threatName}
**Category:** ${threatCategory}
**ASIS Code:** ${asisCode || 'N/A'}
**Threat ID:** ${threatId}

---

${facilityProfile}

---

${perimeterSecurity}

---

${accessControl}

---

${surveillance}

---

${powerSecurity}

---

${coolingSecurity}

---

${fireSuppression}

---

${personnelSecurity}

---

${complianceContext}

---

${incidentHistory}

---

${photoFindings}

---

## REQUIRED OUTPUT

Provide your assessment in JSON format matching the DatacenterAIAssessmentResponse interface.

For this threat (${threatId}), assess:
1. Threat Likelihood (T) - probability this threat will occur at this facility (1-5)
2. Vulnerability (V) - degree to which current controls fail against this threat (1-5)
3. Impact (I) - consequence severity if attack succeeds (1-5)

Calculate: Inherent Risk = T × V × I (max 125, normalize to 0-100)

DATACENTER CONTEXT:
- Average downtime cost: $9,000/minute
- Tier classification drives expected security level
- Compliance requirements create baseline expectations
- Customer SLAs create contractual exposure

Cite specific evidence from the data provided for each score.
If data is insufficient for any element, flag it explicitly.`;
}

// ============================================================================
// AI ASSESSMENT FUNCTION
// ============================================================================

/**
 * Assess a single datacenter threat using GPT-4
 */
async function assessDatacenterThreatWithAI(
  request: DatacenterThreatAssessmentRequest
): Promise<DatacenterAIAssessmentResponse> {
  const openai = getOpenAI();
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
  const systemPrompt = DATACENTER_SYSTEM_PROMPT + '\n\n' + DATACENTER_INDUSTRY_STANDARDS;
  const userPrompt = generateDatacenterThreatAssessmentPrompt(request);

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
  return validateAndTransformDatacenterResponse(parsed, request.threatId);
}

/**
 * Validate AI response and fill in missing fields
 */
function validateAndTransformDatacenterResponse(
  parsed: any,
  threatId: string
): DatacenterAIAssessmentResponse {
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
      customerImpact: parsed.impact?.customerImpact || parsed.impactCustomer || '',
      complianceImpact: parsed.impact?.complianceImpact || parsed.impactCompliance || '',
      reputationalImpact: parsed.impact?.reputationalImpact || parsed.impactReputational || '',
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

function getTierLevel(responses: InterviewResponses): string {
  const tierResponse = String(responses.dc_tier_classification || '').toLowerCase();
  if (tierResponse.includes('tier iv') || tierResponse.includes('tier 4')) return 'IV';
  if (tierResponse.includes('tier iii') || tierResponse.includes('tier 3')) return 'III';
  if (tierResponse.includes('tier ii') || tierResponse.includes('tier 2')) return 'II';
  if (tierResponse.includes('tier i') || tierResponse.includes('tier 1')) return 'I';
  return 'Unknown';
}

function getOverallSecurityPosture(responses: InterviewResponses): string {
  let securityFactors = 0;
  let totalFactors = 0;
  
  // Key security indicators for datacenters
  const indicators = [
    { response: responses.dc_tier_classification, isGoodIf: (v: string) => !v?.toLowerCase().includes('tier i') && !v?.toLowerCase().includes('unknown') },
    { response: responses.dc_mantrap, isYesGood: true },
    { response: responses.dc_biometric, isYesGood: true },
    { response: responses.dc_noc_soc, isYesGood: true },
    { response: responses.dc_security_24x7, isYesGood: true },
    { response: responses.dc_background_checks, isYesGood: true },
    { response: responses.dc_vesda, isYesGood: true },
    { response: responses.dc_soc2, isYesGood: true },
    { response: responses.dc_cooling_redundancy, isYesGood: true },
    { response: responses.dc_generator_config, isGoodIf: (v: string) => v?.toLowerCase().includes('n+1') || v?.toLowerCase().includes('2n') },
  ];
  
  for (const ind of indicators) {
    totalFactors++;
    if (ind.isYesGood) {
      if (String(ind.response).toLowerCase() === 'yes') {
        securityFactors++;
      }
    } else if (ind.isGoodIf) {
      if (ind.isGoodIf(String(ind.response))) {
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
function assessDatacenterThreatAlgorithmically(
  threatId: string,
  context: DatacenterAssessmentContext
): DatacenterAIAssessmentResponse {
  const threat = DATACENTER_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const { interviewResponses } = context;

  // Use existing algorithmic functions from datacenter-interview-mapper
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
      reasoning: `Score derived from baseline threat level (${threat.typicalLikelihood}) adjusted by interview-driven risk factors including incident history, tier classification, and environmental factors.`,
      confidence: 'medium',
      dataGaps: [],
    },
    vulnerability: {
      score: vulnerability,
      label: getVulnerabilityLabel(vulnerability),
      controlGaps: controlGaps,
      existingControls: buildExistingControls(interviewResponses),
      reasoning: 'Score derived from security posture analysis using risk factor counting methodology with tier expectation modifier.',
      confidence: 'medium',
      dataGaps: [],
    },
    impact: {
      score: impact,
      label: getImpactLabel(impact),
      financialImpact: impact >= 4 ? 'Significant financial loss - $9,000+/minute downtime cost' : 'Moderate financial exposure',
      operationalImpact: impact >= 4 ? 'Major operational disruption affecting customer services' : 'Limited operational impact',
      customerImpact: getCustomerImpactDescription(threatId, impact, interviewResponses),
      complianceImpact: impact >= 4 ? 'Potential SLA violations and compliance exposure' : 'Minimal compliance concern',
      reputationalImpact: impact >= 4 ? 'Significant reputational risk with enterprise customers' : 'Limited reputational impact',
      reasoning: `Score derived from tier classification, customer count, SLA commitments, and threat-specific impact modifiers.`,
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
      standardsReference: getStandardsReference(threatId),
    })),
    scenarioDescription: `${threat.name} risk assessment for this datacenter facility. Calculated inherent risk score: ${normalizedRisk.toFixed(1)}/100 (${classification.toUpperCase()}). ${threat.description}`,
    evidenceTrail: ['Algorithmic calculation - no AI evidence chain'],
    insufficientDataFlags: [],
  };
}

/**
 * Get standards reference for control recommendations
 */
function getStandardsReference(threatId: string): string {
  const references: Record<string, string> = {
    unauthorized_physical_access: 'SOC 2 CC6.4, TIA-942 Access Control',
    insider_threat_privileged_access: 'SOC 2 CC6.1, ISO 27001 A.7',
    tailgating_mantrap_bypass: 'TIA-942 Section 5.3.3',
    power_failure_extended: 'Uptime Institute Tier Standards, TIA-942 Section 8',
    cooling_failure_thermal_event: 'ASHRAE Guidelines, Uptime Institute Tier Standards',
    fire_equipment_damage: 'NFPA 75/76, TIA-942 Section 10',
    water_intrusion_damage: 'NFPA 75, TIA-942 Section 10',
    theft_equipment_components: 'SOC 2 CC6.4, PCI-DSS Requirement 9',
    sabotage_infrastructure: 'TIA-942 Section 5, SOC 2 CC6.4',
    cyber_physical_attack: 'ISO 27001 A.12, NIST SP 800-82',
    social_engineering_entry: 'SOC 2 CC2.2, ASIS Security Training',
    terrorism_vehicle_borne: 'TIA-942 Section 5.1, DHS Guidelines',
    natural_disaster_impact: 'NFPA 1600, SOC 2 A1.2',
    vendor_contractor_breach: 'SOC 2 CC9.2, ISO 27001 A.15',
    environmental_contamination: 'ASHRAE Guidelines, TIA-942 Section 10',
  };
  return references[threatId] || 'ASIS International Standards';
}

/**
 * Build evidence statements based on interview responses for algorithmic assessment
 */
function buildAlgorithmicEvidence(threatId: string, responses: InterviewResponses): { likelihood: string[] } {
  const evidence: string[] = [];
  
  // Common evidence items
  const tierLevel = getTierLevel(responses);
  if (tierLevel === 'I' || tierLevel === 'Unknown') {
    evidence.push('Lower tier classification indicates reduced redundancy and security');
  }
  if (tierLevel === 'IV') {
    evidence.push('Tier IV classification indicates high security baseline');
  }
  
  // Threat-specific evidence
  switch (threatId) {
    case 'unauthorized_physical_access':
      if (responses.dc_unauthorized_history === 'yes') {
        evidence.push('History of unauthorized access incidents');
      }
      if (responses.dc_mantrap !== 'yes') {
        evidence.push('No man-trap/airlock access control');
      }
      break;
      
    case 'insider_threat_privileged_access':
      if (responses.dc_insider_history === 'yes') {
        evidence.push('Prior insider security incidents documented');
      }
      if (responses.dc_background_checks !== 'yes') {
        evidence.push('No comprehensive background checks');
      }
      if (responses.dc_two_person_rule !== 'yes') {
        evidence.push('No two-person rule for critical operations');
      }
      break;
      
    case 'tailgating_mantrap_bypass':
      if (responses.dc_mantrap !== 'yes') {
        evidence.push('No man-trap entry control');
      }
      if (responses.dc_anti_tailgate !== 'yes') {
        evidence.push('No anti-tailgating measures');
      }
      break;
      
    case 'power_failure_extended':
      if (responses.dc_power_history === 'yes') {
        evidence.push('History of power outage incidents');
      }
      if (!String(responses.dc_utility_feeds).toLowerCase().includes('dual')) {
        evidence.push('Single utility feed increases exposure');
      }
      if (!String(responses.dc_fuel_capacity).toLowerCase().includes('72')) {
        evidence.push('Limited generator fuel capacity');
      }
      break;
      
    case 'cooling_failure_thermal_event':
      if (responses.dc_cooling_history === 'yes') {
        evidence.push('History of cooling system failures');
      }
      if (responses.dc_cooling_redundancy !== 'yes') {
        evidence.push('Insufficient cooling redundancy');
      }
      break;
      
    case 'fire_equipment_damage':
      if (responses.dc_fire_history === 'yes') {
        evidence.push('Prior fire incidents documented');
      }
      if (responses.dc_vesda !== 'yes') {
        evidence.push('No VESDA early detection');
      }
      if (String(responses.dc_suppression_type).toLowerCase().includes('water') ||
          String(responses.dc_suppression_type).toLowerCase().includes('sprinkler')) {
        evidence.push('Water-based suppression increases equipment damage risk');
      }
      break;
      
    case 'water_intrusion_damage':
      if (responses.dc_leak_detection !== 'yes') {
        evidence.push('No water leak detection system');
      }
      if (String(responses.dc_suppression_type).toLowerCase().includes('water') ||
          String(responses.dc_suppression_type).toLowerCase().includes('sprinkler')) {
        evidence.push('Water sprinkler system present');
      }
      break;
      
    case 'theft_equipment_components':
      if (responses.dc_cabinet_locks !== 'yes') {
        evidence.push('No cabinet-level locks');
      }
      if (responses.dc_cctv_hands_on !== 'yes') {
        evidence.push('CCTV cannot see hands-on-servers activity');
      }
      break;
      
    case 'sabotage_infrastructure':
      if (responses.dc_epo_protection !== 'yes') {
        evidence.push('EPO button unprotected from unauthorized activation');
      }
      if (responses.dc_electrical_access !== 'yes') {
        evidence.push('Electrical room access not restricted');
      }
      break;
      
    case 'cyber_physical_attack':
      if (responses.dc_vuln_scanning !== 'yes') {
        evidence.push('No vulnerability scanning program');
      }
      if (responses.dc_change_mgmt !== 'yes') {
        evidence.push('No formal change management process');
      }
      break;
      
    case 'social_engineering_entry':
      if (responses.dc_visitor_mgmt !== 'yes') {
        evidence.push('Weak visitor management procedures');
      }
      if (responses.dc_escort_required !== 'yes') {
        evidence.push('Visitors not required to be escorted');
      }
      break;
      
    case 'terrorism_vehicle_borne':
      if (responses.dc_vehicle_barriers !== 'yes') {
        evidence.push('No vehicle barriers protecting facility');
      }
      if (responses.dc_standoff_distance !== 'yes') {
        evidence.push('Inadequate standoff distance from public road');
      }
      break;
      
    case 'natural_disaster_impact':
      if (!String(responses.dc_fuel_capacity).toLowerCase().includes('72')) {
        evidence.push('Limited generator fuel reserves for extended outage');
      }
      if (responses.dc_fuel_agreement !== 'yes') {
        evidence.push('No fuel resupply agreement in place');
      }
      break;
      
    case 'vendor_contractor_breach':
      if (responses.dc_contractor_vetting !== 'yes') {
        evidence.push('Inadequate contractor vetting procedures');
      }
      if (responses.dc_contractor_supervision !== 'yes') {
        evidence.push('Contractors not supervised/escorted');
      }
      break;
      
    case 'environmental_contamination':
      if (!String(responses.dc_aisle_containment).toLowerCase().includes('yes')) {
        evidence.push('No hot/cold aisle containment for environmental protection');
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
  
  // Universal gaps for datacenters
  if (responses.dc_mantrap !== 'yes') gaps.push('No man-trap/airlock entry');
  if (responses.dc_biometric !== 'yes') gaps.push('No biometric authentication');
  if (responses.dc_noc_soc !== 'yes') gaps.push('No 24/7 NOC/SOC');
  if (responses.dc_background_checks !== 'yes') gaps.push('No comprehensive background checks');
  
  // Threat-specific gaps from control mapping
  const threatControls = THREAT_CONTROL_MAPPING[threatId] || [];
  
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
  
  if (responses.dc_mantrap === 'yes') controls.push('Man-trap entry control');
  if (responses.dc_biometric === 'yes') controls.push('Biometric authentication');
  if (responses.dc_noc_soc === 'yes') controls.push('24/7 NOC/SOC monitoring');
  if (responses.dc_security_24x7 === 'yes') controls.push('24/7 security guard force');
  if (responses.dc_background_checks === 'yes') controls.push('Comprehensive background checks');
  if (responses.dc_vesda === 'yes') controls.push('VESDA early detection');
  if (String(responses.dc_suppression_type).toLowerCase().includes('clean')) {
    controls.push('Clean agent fire suppression');
  }
  if (responses.dc_soc2 === 'yes') controls.push('SOC 2 Type II certified');
  if (responses.dc_cooling_redundancy === 'yes') controls.push('Redundant cooling systems');
  if (String(responses.dc_generator_config).toLowerCase().includes('n+1') ||
      String(responses.dc_generator_config).toLowerCase().includes('2n')) {
    controls.push('Redundant generator capacity');
  }
  
  return controls;
}

/**
 * Get customer impact description based on threat type
 */
function getCustomerImpactDescription(threatId: string, impact: number, responses: InterviewResponses): string {
  const customerCount = responses.dc_customer_count || 'multiple';
  const customerType = responses.dc_customer_type || 'enterprise';
  
  const highCustomerImpactThreats = [
    'power_failure_extended',
    'cooling_failure_thermal_event',
    'fire_equipment_damage',
    'sabotage_infrastructure',
  ];
  
  if (highCustomerImpactThreats.includes(threatId)) {
    return `Potential impact to ${customerCount} ${customerType} customers - service outage, SLA violations, and data availability concerns`;
  }
  
  if (impact >= 4) {
    return `Potential service degradation affecting ${customerType} customers`;
  }
  
  return 'Minimal direct customer impact';
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Generate datacenter risk scenarios using AI with algorithmic fallback
 * 
 * This is the main entry point that:
 * 1. Attempts AI assessment for each threat
 * 2. Falls back to algorithmic calculation on failure
 * 3. Stores results in database
 * 4. Returns summary statistics
 */
export async function generateDatacenterRiskScenariosWithAI(
  assessmentId: number,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: DatacenterIncidentRecord[];
    complianceRequirements?: DatacenterComplianceProfile;
    uptimeMetrics?: UptimeMetrics;
    facilityName?: string;
  }
): Promise<DatacenterGeneratedScenarioResult> {
  const startTime = Date.now();
  const useAI = options?.useAI !== false; // Default to true

  const context: DatacenterAssessmentContext = {
    assessmentId,
    facilityName: options?.facilityName,
    interviewResponses,
    photoAnalysisFindings: options?.photoFindings,
    incidentHistory: options?.incidentHistory,
    complianceRequirements: options?.complianceRequirements,
    uptimeMetrics: options?.uptimeMetrics,
  };

  const results: DatacenterAIAssessmentResponse[] = [];
  let aiSuccessCount = 0;
  let algorithmicFallbackCount = 0;

  // Process each datacenter threat
  for (const threat of DATACENTER_THREATS) {
    const request: DatacenterThreatAssessmentRequest = {
      threatId: threat.id,
      threatName: threat.name,
      threatCategory: threat.category,
      asisCode: threat.asisCode,
      context,
    };

    try {
      if (useAI) {
        // Attempt AI assessment
        const aiResult = await assessDatacenterThreatWithAI(request);
        results.push(aiResult);
        aiSuccessCount++;
      } else {
        // Use algorithmic only
        const algoResult = assessDatacenterThreatAlgorithmically(threat.id, context);
        results.push(algoResult);
        algorithmicFallbackCount++;
      }
    } catch (error) {
      console.error(`AI assessment failed for ${threat.id}, using fallback:`, error);
      
      // Fallback to algorithmic
      try {
        const algoResult = assessDatacenterThreatAlgorithmically(threat.id, context);
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
      const threat = DATACENTER_THREATS.find(t => t.id === result.threatId);
      
      // Look up or create threat record
      let existingThreat = await db.query.threatLibrary.findFirst({
        where: eq(threatLibrary.name, threat?.name || result.threatId),
      });

      let threatDbId: number;
      if (existingThreat) {
        threatDbId = existingThreat.id;
      } else {
        const [newThreat] = await db.insert(threatLibrary).values({
          name: threat?.name || result.threatId,
          category: threat?.category || 'Datacenter',
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
export async function assessSingleDatacenterThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  options?: { useAI?: boolean }
): Promise<DatacenterAIAssessmentResponse> {
  const threat = DATACENTER_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const context: DatacenterAssessmentContext = {
    assessmentId: 0,
    interviewResponses,
  };

  const request: DatacenterThreatAssessmentRequest = {
    threatId,
    threatName: threat.name,
    threatCategory: threat.category,
    asisCode: threat.asisCode,
    context,
  };

  if (options?.useAI === false) {
    return assessDatacenterThreatAlgorithmically(threatId, context);
  }

  try {
    return await assessDatacenterThreatWithAI(request);
  } catch (error) {
    console.error(`AI assessment failed, using fallback:`, error);
    return assessDatacenterThreatAlgorithmically(threatId, context);
  }
}

/**
 * Generate narrative summary for datacenter assessment (calls GPT-4)
 */
export async function generateDatacenterNarrativeSummary(
  results: DatacenterAIAssessmentResponse[],
  context: DatacenterAssessmentContext
): Promise<string> {
  const topRisks = [...results]
    .sort((a, b) => b.inherentRisk.normalizedScore - a.inherentRisk.normalizedScore)
    .slice(0, 5);

  const securityPosture = getOverallSecurityPosture(context.interviewResponses);
  const tierLevel = getTierLevel(context.interviewResponses);

  const prompt = `Generate a professional executive summary (400-600 words) for this datacenter security risk assessment.

## ASSESSMENT RESULTS

Facility: ${context.facilityName || 'Datacenter'}
Tier Classification: ${tierLevel}
Total Threats Assessed: ${results.length}
Critical Risks: ${results.filter(r => r.inherentRisk.classification === 'critical').length}
High Risks: ${results.filter(r => r.inherentRisk.classification === 'high').length}
Medium Risks: ${results.filter(r => r.inherentRisk.classification === 'medium').length}
Low Risks: ${results.filter(r => r.inherentRisk.classification === 'low').length}

Overall Security Posture: ${securityPosture}

## FACILITY PROFILE
- Size/Capacity: ${context.interviewResponses.dc_size_capacity || 'Not specified'}
- Customer Type: ${context.interviewResponses.dc_customer_type || 'Not specified'}
- Customer Count: ${context.interviewResponses.dc_customer_count || 'Not specified'}
- Data Classification: ${context.interviewResponses.dc_data_classification || 'Not specified'}
- SOC 2 Certified: ${context.interviewResponses.dc_soc2 || 'Not specified'}

## TOP RISK SCENARIOS

${topRisks.map(r => {
  const threat = DATACENTER_THREATS.find(t => t.id === r.threatId);
  return `- ${threat?.name || r.threatId}: T=${r.threatLikelihood.score}, V=${r.vulnerability.score}, I=${r.impact.score} → Score: ${r.inherentRisk.normalizedScore.toFixed(1)}/100 (${r.inherentRisk.classification.toUpperCase()})`;
}).join('\n')}

## KEY EVIDENCE

${topRisks.slice(0, 3).map(r => {
  const threat = DATACENTER_THREATS.find(t => t.id === r.threatId);
  return `${threat?.name || r.threatId}:
- ${r.threatLikelihood.evidence.slice(0, 2).join('\n- ')}`;
}).join('\n\n')}

Write in a professional tone suitable for presentation to datacenter management and enterprise customers. Focus on:
1. Uptime and availability implications
2. Customer SLA exposure
3. Compliance certification requirements
4. ROI-justified recommendations
Reference Uptime Institute, SOC 2, ISO 27001, and other relevant standards.`;

  const openai = getOpenAI();
  if (!openai) {
    return 'Narrative summary generation unavailable - OpenAI API key not configured.';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a CPP-certified security consultant preparing a risk assessment summary for datacenter management. Write professionally, concisely, and focus on uptime, availability, and actionable recommendations that protect customer services and business operations.' 
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
  if (interviewResponses.dc_mantrap === 'yes') {
    score += 10;
  } else {
    gaps.push('No man-trap entry control');
  }
  if (interviewResponses.dc_biometric === 'yes') {
    score += 8;
  } else {
    gaps.push('No biometric authentication');
  }
  if (interviewResponses.dc_access_logging === 'yes') {
    score += 7;
  } else {
    gaps.push('No access logging');
  }

  // Surveillance & Monitoring (20 points)
  maxScore += 20;
  if (interviewResponses.dc_noc_soc === 'yes') {
    score += 10;
  } else {
    gaps.push('No 24/7 NOC/SOC');
  }
  if (interviewResponses.dc_cctv_hands_on === 'yes') {
    score += 5;
  }
  if (String(interviewResponses.dc_video_retention).includes('90')) {
    score += 5;
  }

  // Power Infrastructure (20 points)
  maxScore += 20;
  if (String(interviewResponses.dc_utility_feeds).toLowerCase().includes('dual')) {
    score += 8;
  } else {
    gaps.push('Single utility feed');
  }
  if (String(interviewResponses.dc_generator_config).toLowerCase().includes('n+1') ||
      String(interviewResponses.dc_generator_config).toLowerCase().includes('2n')) {
    score += 7;
  }
  if (String(interviewResponses.dc_fuel_capacity).includes('72')) {
    score += 5;
  }

  // Fire Suppression (15 points)
  maxScore += 15;
  if (interviewResponses.dc_vesda === 'yes') {
    score += 8;
  } else {
    gaps.push('No VESDA early detection');
  }
  if (String(interviewResponses.dc_suppression_type).toLowerCase().includes('clean')) {
    score += 7;
  } else {
    gaps.push('No clean agent fire suppression');
  }

  // Personnel Security (10 points)
  maxScore += 10;
  if (interviewResponses.dc_background_checks === 'yes') {
    score += 5;
  } else {
    gaps.push('No background checks');
  }
  if (interviewResponses.dc_security_training === 'yes') {
    score += 5;
  }

  // Compliance (10 points)
  maxScore += 10;
  if (interviewResponses.dc_soc2 === 'yes') {
    score += 7;
  } else {
    gaps.push('No SOC 2 Type II certification');
  }
  if (interviewResponses.dc_pentest === 'yes') {
    score += 3;
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
 * Route handler for POST /api/assessments/:id/datacenter-interview/generate-risks-ai
 */
export async function handleGenerateDatacenterRisksAI(
  assessmentId: number,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: DatacenterIncidentRecord[];
    facilityName?: string;
    complianceRequirements?: DatacenterComplianceProfile;
    uptimeMetrics?: UptimeMetrics;
  }
): Promise<DatacenterGeneratedScenarioResult> {
  return generateDatacenterRiskScenariosWithAI(assessmentId, interviewResponses, options);
}

/**
 * Route handler for POST /api/assessments/:id/datacenter-interview/assess-single-threat
 */
export async function handleAssessSingleDatacenterThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  useAI: boolean = true
): Promise<DatacenterAIAssessmentResponse> {
  return assessSingleDatacenterThreat(threatId, interviewResponses, { useAI });
}

/**
 * Route handler for POST /api/assessments/:id/datacenter-interview/generate-narrative
 */
export async function handleGenerateDatacenterNarrative(
  results: DatacenterAIAssessmentResponse[],
  context: DatacenterAssessmentContext
): Promise<{ narrative: string }> {
  const narrative = await generateDatacenterNarrativeSummary(results, context);
  return { narrative };
}

/**
 * Route handler for GET /api/assessments/:id/datacenter-interview/quick-score
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
  DATACENTER_SYSTEM_PROMPT,
  DATACENTER_INDUSTRY_STANDARDS,
  assessDatacenterThreatWithAI,
  assessDatacenterThreatAlgorithmically,
  buildDatacenterFacilityProfile,
  buildDatacenterPerimeterSecurity,
  buildDatacenterAccessControl,
  buildDatacenterIncidentHistory,
  generateDatacenterThreatAssessmentPrompt,
  DATACENTER_THREATS,
};

export default {
  // Main orchestration
  generateDatacenterRiskScenariosWithAI,
  
  // Single threat assessment
  assessSingleDatacenterThreat,
  
  // Narrative generation
  generateDatacenterNarrativeSummary,
  
  // Quick scoring
  getQuickSecurityScore,
  
  // Route handlers
  handleGenerateDatacenterRisksAI,
  handleAssessSingleDatacenterThreat,
  handleGenerateDatacenterNarrative,
  handleGetQuickSecurityScore,
  
  // Internal (exposed for testing)
  assessDatacenterThreatWithAI,
  assessDatacenterThreatAlgorithmically,
  buildDatacenterFacilityProfile,
  buildDatacenterPerimeterSecurity,
  buildDatacenterAccessControl,
};
