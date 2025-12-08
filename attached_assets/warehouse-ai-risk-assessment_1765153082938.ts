/**
 * RiskFixer Warehouse AI Risk Assessment
 * 
 * Extends the base AI assessment framework with warehouse-specific capabilities:
 * - T×V×I formula (standard facility assessment, scale 1-5 for each)
 * - Cargo theft, supply chain, and logistics-focused assessment
 * - Loading dock, yard security, inventory control emphasis
 * - TAPA FSR, CargoNet, ISO 28000, C-TPAT industry standards
 * 
 * DESIGN PHILOSOPHY:
 * - Evidence-based: Every score must cite specific findings
 * - Methodology-compliant: ASIS GDL-RA with supply chain extensions
 * - Conservative: Score toward higher risk when ambiguous
 * - Auditable: Clear reasoning chain for each score
 * - Fallback: Algorithmic calculation if AI fails
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 * @see RiskFixer-Warehouse-Framework.md
 */

import OpenAI from 'openai';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { riskScenarios, assessments, threats } from '@shared/schema';

// Import algorithmic fallback functions from warehouse mapper
import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  generateControlRecommendations,
  getThreatSpecificControls,
  getThreatVulnerabilityBreakdown,
  WAREHOUSE_THREATS,
  THREAT_CONTROL_MAPPING,
  THREAT_QUESTION_MAP,
} from './warehouse-interview-mapper';

// Import interview response type
import type { InterviewResponses } from './warehouse-interview-questionnaire';

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

export interface WarehouseAssessmentContext {
  assessmentId: number;
  facilityName?: string;
  interviewResponses: InterviewResponses;
  photoAnalysisFindings?: string[];
  incidentHistory?: WarehouseIncidentRecord[];
  shrinkageData?: ShrinkageProfile;
  capIndexData?: CAPIndexData;
  tapaLevel?: 'A' | 'B' | 'C' | 'none';
}

export interface WarehouseIncidentRecord {
  date: string;
  type: 'full_truckload_theft' | 'pilferage' | 'employee_theft' | 'trailer_theft' | 
        'vehicle_theft' | 'hijacking' | 'burglary' | 'break_in' | 'vandalism' | 
        'workplace_violence' | 'fire' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lossAmount?: number;
  insiderInvolved?: boolean;
  recovered?: boolean;
  prosecuted?: boolean;
}

export interface ShrinkageProfile {
  currentRate: number; // Percentage
  previousYearRate?: number;
  industryAverage?: number; // Typically 1-2%
  primaryCauses: ('external' | 'internal' | 'vendor' | 'admin_error' | 'unknown')[];
  annualLossDollars?: number;
  highValueLossRate?: number;
}

export interface CAPIndexData {
  overallScore?: number;
  theftScore?: number;
  violentCrimeScore?: number;
  burglaryScore?: number;
  cargoTheftIndex?: number; // Warehouse-specific
  neighborhoodType?: string;
}

export interface WarehouseThreatAssessmentRequest {
  threatId: string;
  threatName: string;
  threatCategory: string;
  asisCode?: string;
  context: WarehouseAssessmentContext;
}

/**
 * Rich AI response format for Warehouse assessments
 * T×V×I scale with evidence chains
 */
export interface WarehouseAIAssessmentResponse {
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
    supplyChainImpact: string; // Warehouse-specific
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
    riskReductionEstimate?: string;
  }[];
  
  // Scenario description for reports
  scenarioDescription: string;
  
  // Evidence trail for audit
  evidenceTrail: string[];
  
  // Insufficient data flags
  insufficientDataFlags: string[];
}

export interface WarehouseGeneratedScenarioResult {
  success: boolean;
  mode: 'ai' | 'algorithmic' | 'hybrid';
  generatedScenarios: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScenarioIds: number[];
  overallCargoTheftRisk: string;
  aiConfidence: 'high' | 'medium' | 'low' | 'fallback';
  processingTimeMs: number;
}

// ============================================================================
// WAREHOUSE-SPECIFIC SYSTEM PROMPT
// ============================================================================

const WAREHOUSE_SYSTEM_PROMPT = `You are a CPP-certified physical security professional specializing in supply chain and logistics security conducting a formal risk assessment. You are assessing threats to a warehouse or distribution center, focusing on cargo protection, inventory integrity, and facility security.

Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview data, incident history, or shrinkage metrics provided. Never assume facts not in evidence. If data is missing, explicitly state "INSUFFICIENT DATA" for that element.

2. METHODOLOGY-COMPLIANT: Follow the ASIS GDL-RA framework using T×V×I where:
   - T (Threat Likelihood): 1-5 scale, probability of threat materializing at this facility
   - V (Vulnerability): 1-5 scale, degree to which current controls fail to prevent/detect
   - I (Impact): 1-5 scale, consequence severity if attack succeeds (financial, safety, supply chain)
   - Inherent Risk = T × V × I (scale 1-125, normalized to 0-100)

3. SUPPLY-CHAIN-CENTRIC: Warehouse assessments focus on:
   - Cargo theft prevention (full truckload, pilferage, fictitious pickup)
   - Loading dock security and seal verification
   - Yard and trailer security
   - Inventory control and shrinkage reduction
   - Insider threat detection and prevention
   - Fleet security and hijacking prevention

4. RUBRIC-ANCHORED: Use the exact scoring criteria provided.

THREAT LIKELIHOOD RUBRIC (1-5):
Score 1 (RARE): No theft history, low-crime area, non-targeted commodity, no ORC activity in region
Score 2 (UNLIKELY): Isolated historical incidents only, moderate area crime, basic cargo attractiveness
Score 3 (POSSIBLE): Periodic incidents documented, industry-average shrinkage (1-2%), known cargo theft in region
Score 4 (LIKELY): Regular incidents, above-average shrinkage (>2%), targeted commodity (electronics, pharma), ORC active nearby
Score 5 (ALMOST CERTAIN): Frequent theft incidents, high shrinkage (>3%), confirmed insider involvement, high-value cargo, active ORC targeting

VULNERABILITY RUBRIC (1-5):
Score 1 (MINIMAL): TAPA Level A certified, comprehensive dock coverage, GPS all fleet, background checks, 100% seal verification
Score 2 (LOW): Strong perimeter with intrusion detection, dock CCTV, WMS with real-time visibility, regular cycle counts
Score 3 (MODERATE): Basic perimeter fencing, limited dock controls, inconsistent seal verification, quarterly inventory
Score 4 (HIGH): Weak perimeter, no dock CCTV, minimal driver verification, infrequent inventory counts
Score 5 (CRITICAL): No security fencing, open vehicle access, no seal verification, no WMS, no background checks

IMPACT RUBRIC (1-5):
Score 1 (NEGLIGIBLE): Loss under $10K, no safety concern, minimal supply chain disruption
Score 2 (MINOR): Loss $10K-$50K, minor operational disruption, single customer affected
Score 3 (MODERATE): Loss $50K-$200K, significant operational disruption, multiple customers affected
Score 4 (MAJOR): Loss $200K-$500K, major supply chain disruption, customer SLA breaches, safety incident possible
Score 5 (SEVERE): Loss over $500K, catastrophic supply chain failure, serious safety incident, regulatory action, customer loss

5. STANDARD-REFERENCED: When recommending controls, cite specific standards:
   - TAPA FSR (Facility Security Requirements) Level A/B/C
   - TAPA TSR (Trucking Security Requirements)
   - ISO 28000 (Supply Chain Security Management)
   - C-TPAT (Customs-Trade Partnership Against Terrorism)
   - CargoNet Theft Prevention Best Practices
   - FBI Cargo Theft Prevention Guidelines
   - ASIS GDL-RA (General Security Risk Assessment)
   - ASIS Supply Chain Security Guidelines

6. CONSERVATIVE: When evidence is ambiguous, score toward higher risk. Cargo theft has severe financial impact - average loss $186,779 per full truckload incident (CargoNet).

7. AUDITABLE: Your reasoning must be clear enough that another supply chain security professional reviewing would reach the same conclusion given the same evidence.

CRITICAL: If data is insufficient to assess a factor, state "INSUFFICIENT DATA" rather than guessing. Never hallucinate facts about the facility or its security posture.

OUTPUT FORMAT:
Respond with a JSON object matching the WarehouseAIAssessmentResponse interface. Include evidence citations for every score.`;

// ============================================================================
// WAREHOUSE INDUSTRY STANDARDS (Layer 3)
// ============================================================================

const WAREHOUSE_INDUSTRY_STANDARDS = `
APPLICABLE STANDARDS FOR WAREHOUSE & DISTRIBUTION CENTER ASSESSMENTS:

1. TAPA (Transported Asset Protection Association) Standards:
   - TAPA FSR (Facility Security Requirements) - Level A (highest), B, C
     * Level A: 24/7 guard presence, intrusion detection, 100% CCTV, background checks
     * Level B: Intrusion detection, CCTV coverage, controlled access
     * Level C: Basic perimeter security, CCTV, access control
   - TAPA TSR (Trucking Security Requirements)
   - TAPA PSR (Parking Security Requirements)
   
2. Government & Trade Standards:
   - C-TPAT (Customs-Trade Partnership Against Terrorism)
   - ISO 28000 (Supply Chain Security Management Systems)
   - ISO 28001 (Security Best Practices for Supply Chain)
   - AEO (Authorized Economic Operator) - EU equivalent

3. ASIS International Standards:
   - ASIS GDL-RA (General Security Risk Assessment Guideline)
   - ASIS POA (Physical Asset Protection)
   - ASIS Supply Chain Security Standard
   - ASIS SCRM (Supply Chain Risk Management)

4. Cargo Theft Prevention Sources:
   - CargoNet Intelligence Reports
   - FBI Cargo Theft Prevention Guidelines
   - NICB (National Insurance Crime Bureau) Cargo Theft Data
   - FreightWatch International Intelligence

5. Industry Benchmarks:
   - Average warehouse shrinkage: 1-2% of inventory value
   - Best-in-class shrinkage: Under 0.5%
   - Average full truckload theft loss: $186,779 (CargoNet)
   - 60-80% of cargo theft involves insider (FBI)
   - 47% of cargo theft occurs at loading docks (CargoNet)
   - Electronics, pharmaceuticals, consumer goods = highest risk commodities

6. Key Control Standards:
   - Perimeter: 8ft+ fencing with 3-strand barbed wire (TAPA Level A)
   - CCTV: 100% coverage of perimeter, docks, yard with 30-day retention
   - Access: Badge readers with audit trail, visitor management
   - Seals: ISO 17712 compliant high-security seals
   - Fleet: GPS tracking, geofencing, panic alerts
   - Inventory: WMS with real-time visibility, cycle counting, exception reporting

7. Threat Intelligence Statistics:
   - California, Texas, Florida = highest cargo theft states
   - Weekends and holidays = peak theft times
   - First/last mile = highest risk transit points
   - Fictitious pickup = fastest growing threat method
`;

// ============================================================================
// CONTEXT BUILDING FUNCTIONS
// ============================================================================

function buildWarehouseFacilityProfile(context: WarehouseAssessmentContext): string {
  const { interviewResponses } = context;
  
  const sections: string[] = ['## FACILITY PROFILE'];
  
  // Facility Characteristics
  sections.push(`
### Facility Characteristics
- Warehouse Type: ${interviewResponses.facility_1 || 'Not specified'}
- Square Footage: ${interviewResponses.facility_2 || 'Not specified'}
- Employee Count: ${interviewResponses.facility_3 || 'Not specified'}
- Annual Inventory Value: ${interviewResponses.facility_4 || 'Not specified'}
${interviewResponses.facility_4a ? `- Inventory Value Range: ${interviewResponses.facility_4a}` : ''}
- High-Value Goods Present: ${interviewResponses.facility_5 || 'Not specified'}
${interviewResponses.facility_5a ? `- High-Value Categories: ${Array.isArray(interviewResponses.facility_5a) ? interviewResponses.facility_5a.join(', ') : interviewResponses.facility_5a}` : ''}
`);

  // Operations Profile
  sections.push(`
### Operations Profile
- Operating Hours: ${interviewResponses.facility_6 || 'Not specified'}
- Daily Truck Volume: ${interviewResponses.facility_7 || 'Not specified'}
- TAPA Certification: ${context.tapaLevel ? `Level ${context.tapaLevel}` : 'Not certified'}
`);

  return sections.join('\n');
}

function buildWarehouseSecurityPosture(context: WarehouseAssessmentContext): string {
  const { interviewResponses } = context;
  
  const sections: string[] = ['## CURRENT SECURITY POSTURE'];
  
  // Perimeter Security
  sections.push(`
### Perimeter & Yard Security
- Perimeter Fencing: ${interviewResponses.perimeter_1 || 'Not specified'}
- Fence Condition: ${interviewResponses.perimeter_2 === 'yes' ? 'Good condition' : interviewResponses.perimeter_2 === 'no' ? 'Needs repair' : 'Not specified'}
- Intrusion Detection: ${interviewResponses.perimeter_3 || 'Not specified'}
- Vehicle Access Control: ${interviewResponses.perimeter_4 || 'Not specified'}
- Perimeter Lighting Rating: ${interviewResponses.perimeter_5 || 'Not specified'}
- Perimeter CCTV: ${interviewResponses.perimeter_6 || 'Not specified'}
${interviewResponses.perimeter_6a ? `- CCTV Coverage: ${interviewResponses.perimeter_6a}` : ''}
- Clear Zone: ${interviewResponses.perimeter_7 === 'yes' ? 'Maintained' : interviewResponses.perimeter_7 === 'no' ? 'Not maintained' : 'Not specified'}
- Trailer Security Measures: ${Array.isArray(interviewResponses.perimeter_8) ? interviewResponses.perimeter_8.join(', ') : interviewResponses.perimeter_8 || 'Not specified'}
- Perimeter Inspections: ${interviewResponses.perimeter_9 || 'Not specified'}
`);

  // Loading Dock Security
  sections.push(`
### Loading Dock Security
- Number of Dock Doors: ${interviewResponses.dock_1 || 'Not specified'}
- Dock CCTV Coverage: ${interviewResponses.dock_2 || 'Not specified'}
${interviewResponses.dock_2a ? `- Cameras See Inside Trailers: ${interviewResponses.dock_2a}` : ''}
- Dock Door Sensors: ${interviewResponses.dock_3 || 'Not specified'}
- Seal Verification Process: ${interviewResponses.dock_4 || 'Not specified'}
- Dock Door Procedures: ${interviewResponses.dock_5 || 'Not specified'}
- Dock Scheduling System: ${interviewResponses.dock_6 || 'Not specified'}
- Dock Leveler Security: ${interviewResponses.dock_7 || 'Not specified'}
- Outbound Verification: ${interviewResponses.dock_8 || 'Not specified'}
- Driver Access Restrictions: ${interviewResponses.dock_9 || 'Not specified'}
- After-Hours Dock Alarm: ${interviewResponses.dock_10 || 'Not specified'}
`);

  // Inventory Control
  sections.push(`
### Inventory Control
- Warehouse Management System: ${interviewResponses.inventory_1 || 'Not specified'}
${interviewResponses.inventory_1a ? `- Real-Time Visibility: ${interviewResponses.inventory_1a}` : ''}
- Cycle Counting Program: ${interviewResponses.inventory_2 || 'Not specified'}
- High-Value Area Security: ${interviewResponses.inventory_3 === 'yes' ? 'Secured area' : interviewResponses.inventory_3 === 'no' ? 'General storage' : 'Not specified'}
${interviewResponses.inventory_3a ? `- High-Value Access: ${interviewResponses.inventory_3a}` : ''}
- Lot/Serial Tracking: ${interviewResponses.inventory_4 || 'Not specified'}
- High-Value CCTV: ${interviewResponses.inventory_5 || 'Not specified'}
- Exception Reporting: ${interviewResponses.inventory_6 || 'Not specified'}
- Two-Person Rule: ${interviewResponses.inventory_7 || 'Not specified'}
`);

  // Personnel Security
  sections.push(`
### Personnel & Access Control
- Employee Background Checks: ${interviewResponses.personnel_1 || 'Not specified'}
- Driver/Carrier Background Checks: ${interviewResponses.personnel_2 || 'Not specified'}
- Access Control System: ${interviewResponses.personnel_3 || 'Not specified'}
- Visitor Management: ${interviewResponses.personnel_4 || 'Not specified'}
- Driver Check-In Procedures: ${interviewResponses.personnel_5 || 'Not specified'}
${interviewResponses.personnel_5a ? `- Driver Waiting Area: ${interviewResponses.personnel_5a}` : ''}
- Security Training: ${interviewResponses.personnel_6 || 'Not specified'}
- Theft Reporting Hotline: ${interviewResponses.personnel_7 || 'Not specified'}
- Insider Threat Program: ${interviewResponses.personnel_8 || 'Not specified'}
`);

  // Fleet Security
  sections.push(`
### Vehicle & Fleet Security
- Company Fleet Size: ${interviewResponses.fleet_1 || 'Not specified'}
- GPS Fleet Tracking: ${interviewResponses.fleet_2 || 'Not specified'}
- Vehicle Immobilizers: ${interviewResponses.fleet_3 || 'Not specified'}
- Two-Driver Rule (High-Value): ${interviewResponses.fleet_4 || 'Not specified'}
- Fuel Theft Prevention: ${interviewResponses.fleet_5 || 'Not specified'}
`);

  // Surveillance
  sections.push(`
### Surveillance & Monitoring
- Interior Warehouse CCTV: ${interviewResponses.surveillance_1 || 'Not specified'}
${interviewResponses.surveillance_1a ? `- Interior Coverage: ${interviewResponses.surveillance_1a}` : ''}
- Video Retention: ${interviewResponses.surveillance_2 || 'Not specified'}
- Footage Review Frequency: ${interviewResponses.surveillance_3 || 'Not specified'}
- Video Analytics: ${interviewResponses.surveillance_4 || 'Not specified'}
- Camera Quality Rating: ${interviewResponses.surveillance_5 || 'Not specified'}
`);

  return sections.join('\n');
}

function buildWarehouseThreatIntelligence(context: WarehouseAssessmentContext): string {
  const { interviewResponses, shrinkageData, incidentHistory, capIndexData } = context;
  
  const sections: string[] = ['## THREAT INTELLIGENCE'];
  
  // Incident History
  sections.push(`
### Cargo Theft & Incident History
- Full Truckload Theft (5 years): ${interviewResponses.incident_1 || 'Not specified'}
${interviewResponses.incident_1a ? `- Number of FTL Incidents: ${interviewResponses.incident_1a}` : ''}
${interviewResponses.incident_1b ? `- Total FTL Loss: ${interviewResponses.incident_1b}` : ''}
${interviewResponses.incident_1c ? `- Insider Involvement: ${interviewResponses.incident_1c}` : ''}
- Pilferage Incidents (12 months): ${interviewResponses.incident_2 || 'Not specified'}
${interviewResponses.incident_2a ? `- Pilferage Frequency: ${interviewResponses.incident_2a}` : ''}
- Annual Shrinkage Rate: ${interviewResponses.incident_3 || shrinkageData?.currentRate ? `${shrinkageData?.currentRate}%` : 'Not specified'}
- Confirmed Employee Theft (2 years): ${interviewResponses.incident_4 || 'Not specified'}
${interviewResponses.incident_4a ? `- Employee Theft Cases: ${interviewResponses.incident_4a}` : ''}
- Trailer Theft from Yard (3 years): ${interviewResponses.incident_5 || 'Not specified'}
- Vehicle Theft (3 years): ${interviewResponses.incident_6 || 'Not specified'}
- Hijacking Incidents (5 years): ${interviewResponses.incident_7 || 'Not specified'}
- Regional Cargo Theft Activity: ${interviewResponses.incident_8 || 'Not specified'}
`);

  // External Environment
  sections.push(`
### Geographic & External Factors
- Area Crime Assessment: High-risk cargo theft areas include California, Texas, Florida, Georgia, New Jersey
${capIndexData?.cargoTheftIndex ? `- CAP Index Cargo Theft Score: ${capIndexData.cargoTheftIndex}` : ''}
${capIndexData?.overallScore ? `- CAP Index Overall: ${capIndexData.overallScore}` : ''}
${capIndexData?.burglaryScore ? `- CAP Index Burglary: ${capIndexData.burglaryScore}` : ''}
`);

  // Shrinkage Analysis
  if (shrinkageData) {
    sections.push(`
### Shrinkage Analysis
- Current Rate: ${shrinkageData.currentRate}%
- Previous Year: ${shrinkageData.previousYearRate ? `${shrinkageData.previousYearRate}%` : 'Not tracked'}
- Industry Benchmark: ${shrinkageData.industryAverage || '1-2%'}
- Primary Causes: ${shrinkageData.primaryCauses?.join(', ') || 'Unknown'}
- Annual Loss Value: ${shrinkageData.annualLossDollars ? `$${shrinkageData.annualLossDollars.toLocaleString()}` : 'Not calculated'}
`);
  }

  // Detailed Incident History
  if (incidentHistory && incidentHistory.length > 0) {
    const recentIncidents = incidentHistory
      .slice(0, 10)
      .map(i => `- ${i.date}: ${i.type.replace(/_/g, ' ')} (${i.severity}) - ${i.description}${i.lossAmount ? ` [Loss: $${i.lossAmount.toLocaleString()}]` : ''}${i.insiderInvolved ? ' [INSIDER INVOLVED]' : ''}`)
      .join('\n');

    const incidentCounts = incidentHistory.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalLoss = incidentHistory.reduce((sum, i) => sum + (i.lossAmount || 0), 0);
    const insiderCount = incidentHistory.filter(i => i.insiderInvolved).length;

    sections.push(`
### Detailed Incident Record
Total Incidents: ${incidentHistory.length}
Total Losses: $${totalLoss.toLocaleString()}
Incidents with Insider Involvement: ${insiderCount} (${((insiderCount / incidentHistory.length) * 100).toFixed(0)}%)

By Type:
${Object.entries(incidentCounts).map(([type, count]) => `- ${type.replace(/_/g, ' ')}: ${count}`).join('\n')}

Recent Incidents:
${recentIncidents}
`);
  }

  return sections.join('\n');
}

function buildWarehouseEmergencyPreparedness(context: WarehouseAssessmentContext): string {
  const { interviewResponses } = context;
  
  const sections: string[] = ['## EMERGENCY PREPAREDNESS'];
  
  sections.push(`
### Response Plans & Procedures
- Cargo Theft Response Plan: ${interviewResponses.emergency_1 || 'Not specified'}
- Documented Security Procedures: ${interviewResponses.emergency_2 || 'Not specified'}
- Key Control System: ${interviewResponses.emergency_3 || 'Not specified'}
- Alarm Response Procedures: ${interviewResponses.emergency_4 || 'Not specified'}
- Security Drills Frequency: ${interviewResponses.emergency_5 || 'Not specified'}
- Law Enforcement Relationship: ${interviewResponses.emergency_6 || 'Not specified'}
`);

  return sections.join('\n');
}

function buildPhotoAnalysisFindings(context: WarehouseAssessmentContext): string {
  if (!context.photoAnalysisFindings || context.photoAnalysisFindings.length === 0) {
    return '## PHOTO ANALYSIS FINDINGS\nNo photo analysis data available.';
  }
  
  return `## PHOTO ANALYSIS FINDINGS
${context.photoAnalysisFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}`;
}

// ============================================================================
// PROMPT GENERATION
// ============================================================================

function generateWarehouseThreatAssessmentPrompt(
  request: WarehouseThreatAssessmentRequest
): string {
  const { threatId, threatName, threatCategory, asisCode, context } = request;
  
  const facilityProfile = buildWarehouseFacilityProfile(context);
  const securityPosture = buildWarehouseSecurityPosture(context);
  const threatIntel = buildWarehouseThreatIntelligence(context);
  const emergencyPrep = buildWarehouseEmergencyPreparedness(context);
  const photoFindings = buildPhotoAnalysisFindings(context);

  return `## THREAT BEING ASSESSED

**Threat:** ${threatName}
**Category:** ${threatCategory}
**ASIS Code:** ${asisCode || 'N/A'}
**Threat ID:** ${threatId}

---

${facilityProfile}

---

${securityPosture}

---

${threatIntel}

---

${emergencyPrep}

---

${photoFindings}

---

## REQUIRED OUTPUT

Provide your assessment in JSON format matching the WarehouseAIAssessmentResponse interface.

For this threat (${threatId}), assess:
1. Threat Likelihood (T) - probability this threat will occur at this facility (1-5)
2. Vulnerability (V) - degree to which current controls fail against this threat (1-5)
3. Impact (I) - consequence severity if attack succeeds (1-5)

Calculate: Inherent Risk = T × V × I (max 125, normalize to 0-100)

Risk Classification:
- Critical: ≥75/100 (inherent risk ≥94)
- High: 50-74/100 (inherent risk 63-93)
- Medium: 25-49/100 (inherent risk 32-62)
- Low: <25/100 (inherent risk <32)

Cite specific evidence from the data provided for each score.
If data is insufficient for any element, flag it explicitly.`;
}

// ============================================================================
// AI ASSESSMENT FUNCTION
// ============================================================================

/**
 * Assess a single warehouse threat using GPT-4
 */
async function assessWarehouseThreatWithAI(
  request: WarehouseThreatAssessmentRequest
): Promise<WarehouseAIAssessmentResponse> {
  const systemPrompt = WAREHOUSE_SYSTEM_PROMPT + '\n\n' + WAREHOUSE_INDUSTRY_STANDARDS;
  const userPrompt = generateWarehouseThreatAssessmentPrompt(request);

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
  return validateAndTransformWarehouseResponse(parsed, request.threatId);
}

/**
 * Validate AI response and fill in missing fields
 */
function validateAndTransformWarehouseResponse(
  parsed: any,
  threatId: string
): WarehouseAIAssessmentResponse {
  // Ensure scores are within bounds (1-5)
  const clamp = (val: number, min: number, max: number) => 
    Math.max(min, Math.min(max, Math.round(val)));

  const threatLikelihood = clamp(parsed.threatLikelihood?.score || parsed.threatLikelihood || 3, 1, 5);
  const vulnerability = clamp(parsed.vulnerability?.score || parsed.vulnerability || 3, 1, 5);
  const impact = clamp(parsed.impact?.score || parsed.impact || 3, 1, 5);

  // Calculate inherent risk
  const inherentRisk = threatLikelihood * vulnerability * impact;
  const normalizedRisk = (inherentRisk / 125) * 100;

  // Determine classification using standard thresholds
  let classification: 'critical' | 'high' | 'medium' | 'low';
  if (inherentRisk >= 75) classification = 'critical';
  else if (inherentRisk >= 50) classification = 'high';
  else if (inherentRisk >= 25) classification = 'medium';
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
      supplyChainImpact: parsed.impact?.supplyChainImpact || parsed.impactSupplyChain || '',
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
      riskReductionEstimate: c.riskReductionEstimate || c.risk_reduction || '',
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
  if (inherentRisk >= 75) return 'critical';
  if (inherentRisk >= 50) return 'high';
  if (inherentRisk >= 25) return 'medium';
  return 'low';
}

// ============================================================================
// ALGORITHMIC FALLBACK
// ============================================================================

/**
 * Fallback assessment using algorithmic calculation when AI fails
 * Uses the warehouse-interview-mapper functions
 */
function assessWarehouseThreatAlgorithmically(
  threatId: string,
  context: WarehouseAssessmentContext
): WarehouseAIAssessmentResponse {
  const threat = WAREHOUSE_THREATS.find(t => t.id === threatId);
  
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const { interviewResponses } = context;

  // Use existing algorithmic functions from mapper
  const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
  const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threatId);
  const impact = calculateImpactFromInterview(interviewResponses, threatId);

  const inherentRisk = threatLikelihood * vulnerability * impact;
  const normalizedRisk = (inherentRisk / 125) * 100;

  const classification = classifyRiskLevel(inherentRisk);

  // Get threat-specific control recommendations
  const threatControls = getThreatSpecificControls(interviewResponses, threatId);
  const generalControls = generateControlRecommendations(interviewResponses, threatId);
  
  // Get vulnerability breakdown for evidence
  const vulnBreakdown = getThreatVulnerabilityBreakdown(interviewResponses, threatId);

  return {
    threatId,
    threatLikelihood: {
      score: threatLikelihood,
      label: getThreatLikelihoodLabel(threatLikelihood),
      evidence: ['Calculated algorithmically from interview responses'],
      reasoning: `Score derived from baseline threat level (${threat.typicalLikelihood}) adjusted by interview-driven risk factors including incident history, facility profile, and geographic factors.`,
      confidence: 'medium',
      dataGaps: [],
    },
    vulnerability: {
      score: vulnerability,
      label: getVulnerabilityLabel(vulnerability),
      controlGaps: vulnBreakdown.criticalGaps.slice(0, 5),
      existingControls: [],
      reasoning: `Score derived from threat-specific security posture analysis. ${vulnBreakdown.totalRiskFactors} risk factors identified across ${THREAT_QUESTION_MAP[threatId]?.questionIds.length || 0} relevant questions.`,
      confidence: 'medium',
      dataGaps: [],
    },
    impact: {
      score: impact,
      label: getImpactLabel(impact),
      financialImpact: impact >= 4 ? 'Significant financial loss potential (>$200K)' : 'Moderate financial exposure',
      operationalImpact: impact >= 4 ? 'Major supply chain disruption possible' : 'Limited operational impact',
      safetyImpact: threatId === 'hijacking_in_transit' || threatId === 'workplace_violence' || threatId === 'fire_emergency'
        ? 'Employee safety at risk' : 'Minimal safety concern',
      supplyChainImpact: impact >= 4 ? 'Customer SLA breaches likely' : 'Limited supply chain impact',
      regulatoryImpact: impact >= 4 ? 'Potential C-TPAT/regulatory implications' : 'Minimal regulatory exposure',
      reasoning: `Score derived from inventory value, commodity type, and threat-specific impact modifiers.`,
      confidence: 'medium',
    },
    inherentRisk: {
      score: inherentRisk,
      normalizedScore: normalizedRisk,
      classification,
    },
    priorityControls: threatControls.slice(0, 5).map(ctrl => ({
      controlId: ctrl.controlId,
      controlName: ctrl.controlId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      urgency: ctrl.priority === 'critical' ? 'immediate' : ctrl.priority === 'high' ? 'short_term' : 'medium_term',
      rationale: ctrl.rationale,
      standardsReference: 'TAPA FSR / ASIS GDL-RA',
    })),
    scenarioDescription: `${threat.name} risk assessment for this warehouse facility. Calculated inherent risk score: ${normalizedRisk.toFixed(1)}/100 (${classification.toUpperCase()}). ${vulnBreakdown.criticalGaps.length > 0 ? `Critical control gaps identified: ${vulnBreakdown.criticalGaps.length}` : 'No critical gaps identified.'}`,
    evidenceTrail: ['Algorithmic calculation - no AI evidence chain'],
    insufficientDataFlags: [],
  };
}

// ============================================================================
// SHRINKAGE RISK HELPER
// ============================================================================

function getShrinkageRiskLevel(responses: InterviewResponses): string {
  const shrinkageResponse = responses.incident_3;
  
  if (!shrinkageResponse) return 'Unknown';
  
  if (shrinkageResponse.includes('Over 3%')) return 'Critical';
  if (shrinkageResponse.includes('2% - 3%')) return 'High';
  if (shrinkageResponse.includes('1% - 2%')) return 'Moderate';
  if (shrinkageResponse.includes('0.5% - 1%')) return 'Low';
  if (shrinkageResponse.includes('Under 0.5%')) return 'Excellent';
  if (shrinkageResponse.includes('Unknown')) return 'Unknown (Risk)';
  
  return 'Unknown';
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Generate warehouse risk scenarios using AI with algorithmic fallback
 * 
 * This is the main entry point that:
 * 1. Attempts AI assessment for each threat
 * 2. Falls back to algorithmic calculation on failure
 * 3. Stores results in database
 * 4. Returns summary statistics
 */
export async function generateWarehouseRiskScenariosWithAI(
  assessmentId: number,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: WarehouseIncidentRecord[];
    capIndexData?: CAPIndexData;
    shrinkageData?: ShrinkageProfile;
    tapaLevel?: 'A' | 'B' | 'C' | 'none';
  }
): Promise<WarehouseGeneratedScenarioResult> {
  const startTime = Date.now();
  const useAI = options?.useAI !== false; // Default to true

  const context: WarehouseAssessmentContext = {
    assessmentId,
    interviewResponses,
    photoAnalysisFindings: options?.photoFindings,
    incidentHistory: options?.incidentHistory,
    capIndexData: options?.capIndexData,
    shrinkageData: options?.shrinkageData,
    tapaLevel: options?.tapaLevel,
  };

  const results: WarehouseAIAssessmentResponse[] = [];
  let aiSuccessCount = 0;
  let algorithmicFallbackCount = 0;

  // Process each warehouse threat
  for (const threat of WAREHOUSE_THREATS) {
    const request: WarehouseThreatAssessmentRequest = {
      threatId: threat.id,
      threatName: threat.name,
      threatCategory: threat.category,
      asisCode: threat.asisCode,
      context,
    };

    try {
      if (useAI) {
        // Attempt AI assessment
        const aiResult = await assessWarehouseThreatWithAI(request);
        results.push(aiResult);
        aiSuccessCount++;
      } else {
        // Use algorithmic only
        const algoResult = assessWarehouseThreatAlgorithmically(threat.id, context);
        results.push(algoResult);
        algorithmicFallbackCount++;
      }
    } catch (error) {
      console.error(`AI assessment failed for ${threat.id}, using fallback:`, error);
      
      // Fallback to algorithmic
      try {
        const algoResult = assessWarehouseThreatAlgorithmically(threat.id, context);
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

  // Calculate overall shrinkage/cargo theft risk
  const overallCargoTheftRisk = getShrinkageRiskLevel(interviewResponses);

  // Store results in database
  const riskScenarioIds: number[] = [];
  for (const result of results) {
    try {
      const threat = WAREHOUSE_THREATS.find(t => t.id === result.threatId);
      
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
          category: threat?.category || 'Warehouse',
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
  let criticalRisks = 0, highRisks = 0, mediumRisks = 0, lowRisks = 0;
  for (const result of results) {
    switch (result.inherentRisk.classification) {
      case 'critical': criticalRisks++; break;
      case 'high': highRisks++; break;
      case 'medium': mediumRisks++; break;
      case 'low': lowRisks++; break;
    }
  }

  // Determine confidence level
  let aiConfidence: 'high' | 'medium' | 'low' | 'fallback';
  if (algorithmicFallbackCount === results.length) {
    aiConfidence = 'fallback';
  } else if (aiSuccessCount >= results.length * 0.8) {
    aiConfidence = 'high';
  } else if (aiSuccessCount >= results.length * 0.5) {
    aiConfidence = 'medium';
  } else {
    aiConfidence = 'low';
  }

  return {
    success: results.length > 0,
    mode: algorithmicFallbackCount === results.length ? 'algorithmic' 
        : aiSuccessCount === results.length ? 'ai' 
        : 'hybrid',
    generatedScenarios: results.length,
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    riskScenarioIds,
    overallCargoTheftRisk,
    aiConfidence,
    processingTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// NARRATIVE GENERATION
// ============================================================================

export interface WarehouseNarrativeRequest {
  assessmentId: number;
  riskScenarios: WarehouseAIAssessmentResponse[];
  facilityContext: WarehouseAssessmentContext;
  narrativeType: 'executive_summary' | 'risk_landscape' | 'recommendations' | 'full_report';
}

/**
 * Generate narrative report sections using AI
 */
export async function generateWarehouseNarrative(
  request: WarehouseNarrativeRequest
): Promise<string> {
  const { narrativeType, riskScenarios, facilityContext } = request;
  
  // Build risk summary
  const criticalThreats = riskScenarios.filter(r => r.inherentRisk.classification === 'critical');
  const highThreats = riskScenarios.filter(r => r.inherentRisk.classification === 'high');
  
  const narrativePrompt = `Generate a ${narrativeType.replace(/_/g, ' ')} for a warehouse security assessment.

## FACILITY CONTEXT
${buildWarehouseFacilityProfile(facilityContext)}

## RISK SUMMARY
- Total Threats Assessed: ${riskScenarios.length}
- Critical Risks: ${criticalThreats.length}
- High Risks: ${highThreats.length}

## CRITICAL THREATS
${criticalThreats.map(t => `- ${WAREHOUSE_THREATS.find(wt => wt.id === t.threatId)?.name || t.threatId}: Risk Score ${t.inherentRisk.normalizedScore.toFixed(0)}/100`).join('\n')}

## HIGH THREATS
${highThreats.map(t => `- ${WAREHOUSE_THREATS.find(wt => wt.id === t.threatId)?.name || t.threatId}: Risk Score ${t.inherentRisk.normalizedScore.toFixed(0)}/100`).join('\n')}

## TOP CONTROL GAPS
${[...new Set(riskScenarios.flatMap(r => r.vulnerability.controlGaps))].slice(0, 10).map(g => `- ${g}`).join('\n')}

Generate a professional ${narrativeType.replace(/_/g, ' ')} suitable for presentation to facility management and security leadership. Focus on actionable insights and prioritized recommendations based on TAPA FSR and ASIS standards.`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { role: 'system', content: 'You are a CPP-certified supply chain security professional writing assessment reports. Use professional language, cite specific standards, and provide actionable recommendations.' },
        { role: 'user', content: narrativePrompt },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate narrative.';
  } catch (error) {
    console.error('Narrative generation failed:', error);
    return `## ${narrativeType.replace(/_/g, ' ').toUpperCase()}

Assessment of ${riskScenarios.length} warehouse-specific threats identified ${criticalThreats.length} critical risks and ${highThreats.length} high risks requiring immediate attention.

Key findings include control gaps in: ${[...new Set(riskScenarios.flatMap(r => r.vulnerability.controlGaps))].slice(0, 5).join(', ')}.

Recommendations are based on TAPA FSR Level A/B standards and ASIS GDL-RA methodology.`;
  }
}

// ============================================================================
// SINGLE THREAT ASSESSMENT (For API endpoint)
// ============================================================================

/**
 * Assess a single threat - useful for real-time assessment during interview
 */
export async function assessSingleWarehouseThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  useAI: boolean = true
): Promise<WarehouseAIAssessmentResponse> {
  const threat = WAREHOUSE_THREATS.find(t => t.id === threatId);
  
  if (!threat) {
    throw new Error(`Unknown warehouse threat: ${threatId}`);
  }

  const context: WarehouseAssessmentContext = {
    assessmentId: 0, // Not stored
    interviewResponses,
  };

  if (!useAI) {
    return assessWarehouseThreatAlgorithmically(threatId, context);
  }

  try {
    const request: WarehouseThreatAssessmentRequest = {
      threatId: threat.id,
      threatName: threat.name,
      threatCategory: threat.category,
      asisCode: threat.asisCode,
      context,
    };

    return await assessWarehouseThreatWithAI(request);
  } catch (error) {
    console.error(`AI assessment failed for ${threatId}, using fallback:`, error);
    return assessWarehouseThreatAlgorithmically(threatId, context);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  WAREHOUSE_SYSTEM_PROMPT,
  WAREHOUSE_INDUSTRY_STANDARDS,
  assessWarehouseThreatWithAI,
  assessWarehouseThreatAlgorithmically,
  buildWarehouseFacilityProfile,
  buildWarehouseSecurityPosture,
  buildWarehouseThreatIntelligence,
  generateWarehouseThreatAssessmentPrompt,
  getShrinkageRiskLevel,
};

export default {
  generateWarehouseRiskScenariosWithAI,
  assessSingleWarehouseThreat,
  generateWarehouseNarrative,
  WAREHOUSE_SYSTEM_PROMPT,
  WAREHOUSE_INDUSTRY_STANDARDS,
};
