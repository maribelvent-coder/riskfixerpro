/**
 * RiskFixer Retail AI Risk Assessment
 * 
 * Extends the base AI assessment framework with retail-specific capabilities:
 * - T×V×I formula (standard facility assessment, scale 1-5 for each)
 * - Store-centric rather than person-centric assessment
 * - Shrinkage rates, EAS systems, cash handling, fitting room controls
 * - NRF, LPRC, RILA industry standards
 * 
 * DESIGN PHILOSOPHY:
 * - Evidence-based: Every score must cite specific findings
 * - Methodology-compliant: ASIS GDL-RA with retail LP extensions
 * - Conservative: Score toward higher risk when ambiguous
 * - Auditable: Clear reasoning chain for each score
 * - Fallback: Algorithmic calculation if AI fails
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 * @see RiskFixer-Retail-Store-Framework.md
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
  RETAIL_STORE_THREATS,
  THREAT_CONTROL_MAPPING,
  InterviewResponses,
} from './retail-interview-mapper';

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

export interface RetailProfile {
  merchandiseDisplayModel?: string; // 'Open Shelving', 'Service Only', 'Display Cases', etc.
  storeFormat?: string;
  annualRevenue?: number;
  shrinkageRate?: number;
  highValueMerchandise?: string[];
  operatingHours?: string;
  hasEAS?: boolean;
  hasCCTV?: boolean;
  hasLPStaff?: boolean;
}

export interface RetailAssessmentContext {
  assessmentId: string;
  storeName?: string;
  interviewResponses: InterviewResponses;
  retailProfile?: RetailProfile; // Added for store type context
  photoAnalysisFindings?: string[];
  incidentHistory?: RetailIncidentRecord[];
  shrinkageData?: ShrinkageProfile;
  capIndexData?: CAPIndexData;
}

export interface RetailIncidentRecord {
  date: string;
  type: 'shoplifting' | 'orc' | 'employee_theft' | 'robbery' | 'burglary' | 'fraud' | 'violence' | 'vandalism' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lossAmount?: number;
  apprehension?: boolean;
  prosecuted?: boolean;
}

export interface ShrinkageProfile {
  currentRate: number; // Percentage
  previousYearRate?: number;
  industryAverage?: number;
  primaryCauses: ('external' | 'internal' | 'vendor' | 'admin_error' | 'unknown')[];
  annualLossDollars?: number;
}

export interface CAPIndexData {
  overallScore?: number;
  theftScore?: number;
  violentCrimeScore?: number;
  burglaryScore?: number;
  neighborhoodType?: string;
}

export interface RetailThreatAssessmentRequest {
  threatId: string;
  threatName: string;
  threatCategory: string;
  asisCode?: string;
  context: RetailAssessmentContext;
}

/**
 * Rich AI response format for Retail assessments
 * T×V×I scale with evidence chains
 */
export interface RetailAIAssessmentResponse {
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

export interface RetailGeneratedScenarioResult {
  success: boolean;
  mode: 'ai' | 'algorithmic' | 'hybrid';
  generatedScenarios: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScenarioIds: number[];
  overallShrinkageRisk: string;
  aiConfidence: 'high' | 'medium' | 'low' | 'fallback';
  processingTimeMs: number;
}

// ============================================================================
// RETAIL-SPECIFIC SYSTEM PROMPT
// ============================================================================

const RETAIL_SYSTEM_PROMPT = `You are a CPP-certified physical security professional specializing in retail loss prevention conducting a formal risk assessment. You are assessing threats to a retail store facility, focusing on asset protection, shrinkage reduction, and customer/employee safety.

Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview data, incident history, or shrinkage metrics provided. Never assume facts not in evidence. If data is missing, explicitly state "INSUFFICIENT DATA" for that element.

2. METHODOLOGY-COMPLIANT: Follow the ASIS GDL-RA framework using T×V×I where:
   - T (Threat Likelihood): 1-5 scale, probability of threat materializing at this store
   - V (Vulnerability): 1-5 scale, degree to which current controls fail to prevent/detect
   - I (Impact): 1-5 scale, consequence severity if attack succeeds (financial, safety, operational)
   - Inherent Risk = T × V × I (scale 1-125, normalized to 0-100)

3. STORE-CENTRIC: Retail assessments focus on:
   - Merchandise protection and shrinkage prevention
   - Cash handling and transaction security
   - Customer flow and theft deterrence
   - Employee procedures and internal theft prevention
   - After-hours security and burglary prevention

4. RUBRIC-ANCHORED: Use the exact scoring criteria provided.

THREAT LIKELIHOOD RUBRIC (1-5):
Score 1 (RARE): No incident history, low-crime area, low-risk merchandise, minimal external ORC activity
Score 2 (UNLIKELY): Isolated historical incidents only, moderate area crime, some external factors
Score 3 (POSSIBLE): Periodic incidents documented, average shrinkage rates, known ORC in region
Score 4 (LIKELY): Regular incidents, above-average shrinkage, ORC targeting similar stores nearby
Score 5 (ALMOST CERTAIN): Frequent incidents, high shrinkage rate (>3%), confirmed ORC activity at store, recent major events

VULNERABILITY RUBRIC (1-5):
Score 1 (MINIMAL): Comprehensive EAS coverage, monitored CCTV, dedicated LP staff, hardened cash handling, strong internal controls
Score 2 (LOW): Good EAS/CCTV coverage, part-time LP presence, solid cash procedures, regular audits
Score 3 (MODERATE): Basic security measures, gaps in coverage, inconsistent procedures, some control weaknesses
Score 4 (HIGH): Limited controls, no EAS or poor coverage, minimal LP presence, weak cash handling
Score 5 (CRITICAL): No security systems, no LP staff, uncontrolled cash, no background checks, multiple control failures

IMPACT RUBRIC (1-5):
Score 1 (NEGLIGIBLE): Loss under $500, no safety concern, minimal disruption
Score 2 (MINOR): Loss $500-$5,000, minor operational disruption, no safety impact
Score 3 (MODERATE): Loss $5,000-$25,000, significant operational disruption, potential safety concern
Score 4 (MAJOR): Loss $25,000-$100,000, major business disruption, employee/customer safety at risk
Score 5 (SEVERE): Loss over $100,000, store closure possible, serious safety incident, regulatory/legal exposure

5. STANDARD-REFERENCED: When recommending controls, cite specific standards:
   - NRF (National Retail Federation) Loss Prevention Standards
   - NRF ORC (Organized Retail Crime) Guidelines
   - LPRC (Loss Prevention Research Council) Best Practices
   - RILA (Retail Industry Leaders Association) Standards
   - ASIS GDL-RA (General Security Risk Assessment)
   - ASIS Retail Security Council Guidelines

6. CONSERVATIVE: When evidence is ambiguous, score toward higher risk. Retail has thin margins where shrinkage directly impacts profitability.

7. AUDITABLE: Your reasoning must be clear enough that another LP professional reviewing would reach the same conclusion given the same evidence.

CRITICAL: If data is insufficient to assess a factor, state "INSUFFICIENT DATA" rather than guessing. Never hallucinate facts about the store or its security posture.

OUTPUT FORMAT:
Respond with a JSON object matching the RetailAIAssessmentResponse interface. Include evidence citations for every score.`;

// ============================================================================
// RETAIL INDUSTRY STANDARDS (Layer 3)
// ============================================================================

const RETAIL_INDUSTRY_STANDARDS = `
APPLICABLE STANDARDS FOR RETAIL STORE ASSESSMENTS:

1. Retail Security Standards:
   - NRF (National Retail Federation) LP Standards
   - NRF ORC (Organized Retail Crime) Guidelines
   - RILA (Retail Industry Leaders Association) Asset Protection Standards
   - NRF Shrinkage Survey Methodology

2. Loss Prevention Best Practices:
   - LPRC (Loss Prevention Research Council) Research-Based Best Practices
   - EAS (Electronic Article Surveillance) Implementation Standards
   - CPTED (Crime Prevention Through Environmental Design) for Retail
   - ASIS Retail Security Council Guidelines

3. ASIS International Standards:
   - ASIS GDL-RA (General Security Risk Assessment Guideline)
   - ASIS POA (Physical Asset Protection)
   - ASIS WVPI (Workplace Violence Prevention and Intervention)

4. Cash Handling & Transaction Security:
   - ASIS Cash-in-Transit Guidelines
   - PCI DSS (Payment Card Industry Data Security Standard)
   - Armored Car Industry Standards
   - Drop Safe and Time-Delay Safe Standards

5. Video Surveillance Standards:
   - ASIS Video Surveillance Best Practices
   - NFPA 731 (Electronic Security Systems)
   - Retail-specific camera placement guidelines (LPRC)

6. Shrinkage Benchmarks (NRF 2024):
   - Average retail shrinkage: 1.6% of sales
   - External theft: 37% of shrinkage
   - Employee theft: 35% of shrinkage
   - ORC losses: $125+ billion annually
   - Acceptable shrinkage threshold: <1.5%

7. Specific Control Standards:
   - EAS tag placement and deactivation protocols
   - Fitting room monitoring procedures
   - High-value merchandise display security
   - Refund authorization and fraud prevention
`;

// ============================================================================
// CONTEXT BUILDING FUNCTIONS
// ============================================================================

function buildRetailStoreProfile(context: RetailAssessmentContext): string {
  const { interviewResponses, retailProfile } = context;
  
  const sections: string[] = ['## STORE PROFILE'];
  
  // Merchandise Display Model - CRITICAL for appropriate control recommendations
  const merchandiseModel = retailProfile?.merchandiseDisplayModel || 'Open Shelving';
  const isServiceOnly = merchandiseModel.toLowerCase().includes('service only');
  
  sections.push(`
### MERCHANDISE DISPLAY MODEL: ${merchandiseModel.toUpperCase()}
${isServiceOnly ? `
**SERVICE ONLY STORE** - Customers do NOT have direct access to merchandise.
- All merchandise is behind counters or in locked cases
- Staff retrieve items for customers
- NO need for traditional anti-shoplifting controls (EAS tags, fitting room monitors)
- Focus should be on: Cash handling, robbery prevention, employee safety, internal theft
` : `
Standard merchandise access model - customers can touch/handle merchandise.
- Shoplifting controls (EAS, fitting room monitors) are relevant
- Focus on shrinkage prevention across all categories
`}
`);

  // Store Characteristics
  sections.push(`
### Store Characteristics
- Store Type: ${interviewResponses.store_profile_1 || retailProfile?.storeFormat || 'Not specified'}
- Merchandise Display: ${merchandiseModel}
- Annual Revenue: ${interviewResponses.store_profile_2 || (retailProfile?.annualRevenue ? `$${retailProfile.annualRevenue.toLocaleString()}` : 'Not specified')}
- Store Size (sq ft): ${interviewResponses.store_profile_3 || 'Not specified'}
- Employee Count: ${interviewResponses.store_profile_4 || 'Not specified'}
- Operating Hours: ${interviewResponses.store_profile_5 || retailProfile?.operatingHours || 'Not specified'}
- Location Type: ${interviewResponses.store_profile_6 || 'Not specified'}
`);

  // Merchandise Profile
  const highValueItems = retailProfile?.highValueMerchandise?.length 
    ? retailProfile.highValueMerchandise.join(', ')
    : (interviewResponses.store_profile_8a || 'Not specified');
    
  sections.push(`
### Merchandise Profile
- Inventory Value: ${interviewResponses.store_profile_7 || 'Not specified'}
- High-Value Items: ${interviewResponses.store_profile_8 === 'yes' || (retailProfile?.highValueMerchandise?.length ?? 0) > 0 ? 'Yes' : 'No'}
- High-Value Categories: ${highValueItems}
`);

  return sections.join('\n');
}

function buildRetailSecurityPosture(context: RetailAssessmentContext): string {
  const { interviewResponses } = context;
  
  const sections: string[] = ['## CURRENT SECURITY POSTURE'];
  
  // EAS System
  sections.push(`
### Electronic Article Surveillance (EAS)
- EAS Installed: ${interviewResponses.eas_1 || 'Not specified'}
- Gates at All Exits: ${interviewResponses.eas_1b || 'Not specified'}
- Tag Coverage: ${interviewResponses.eas_2 || 'Not specified'}
- Alarm Response Protocol: ${interviewResponses.eas_3 || 'Not specified'}
- Deactivation Compliance: ${interviewResponses.eas_4 || 'Not specified'}
`);

  // Video Surveillance
  sections.push(`
### Video Surveillance
- CCTV Installed: ${interviewResponses.cctv_1 || 'Not specified'}
- Retention Period: ${interviewResponses.cctv_1b || 'Not specified'}
- Camera Quality: ${interviewResponses.cctv_3 || 'Not specified'}
- Review Frequency: ${interviewResponses.cctv_4 || 'Not specified'}
- POS Exception Reporting: ${interviewResponses.cctv_5 || 'Not specified'}
- Effectiveness Rating: ${interviewResponses.cctv_6 || 'Not specified'}
`);

  // Cash Handling
  sections.push(`
### Cash Handling
- Register Cash Levels: ${interviewResponses.cash_1 || 'Not specified'}
- Cash Limits Enforced: ${interviewResponses.cash_2 || 'Not specified'}
- Safe Type: ${interviewResponses.cash_3 || 'Not specified'}
- Safe Access Count: ${interviewResponses.cash_4 || 'Not specified'}
- Armored Car Service: ${interviewResponses.cash_5 || 'Not specified'}
- Manual Deposit Procedure: ${interviewResponses.cash_6 || 'Not specified'}
- Dual Control: ${interviewResponses.cash_7 || 'Not specified'}
`);

  // Physical Security
  sections.push(`
### Physical Security
- Storefront Type: ${interviewResponses.physical_1 || 'Not specified'}
- Entrance Security: ${interviewResponses.physical_2 || 'Not specified'}
- Bollards: ${interviewResponses.physical_3 || 'Not specified'}
- Stockroom Access Control: ${interviewResponses.physical_4 || 'Not specified'}
- Intrusion Alarm: ${interviewResponses.physical_5 || 'Not specified'}
- Alarm Monitoring: ${interviewResponses.physical_5a || 'Not specified'}
- Panic Alarms: ${interviewResponses.physical_6 || 'Not specified'}
`);

  // LP Staffing
  sections.push(`
### Loss Prevention Staffing
- Dedicated LP Staff: ${interviewResponses.lp_staff_1 || 'Not specified'}
- LP Staff Type: ${interviewResponses.lp_staff_2 || 'Not specified'}
- Coverage Hours: ${interviewResponses.lp_staff_3 || 'Not specified'}
- Visible Security Presence: ${interviewResponses.lp_staff_4 || 'Not specified'}
- Prosecution Policy: ${interviewResponses.lp_staff_5 || 'Not specified'}
`);

  return sections.join('\n');
}

function buildRetailThreatIntelligence(context: RetailAssessmentContext): string {
  const { interviewResponses, shrinkageData, incidentHistory, capIndexData } = context;
  
  const sections: string[] = ['## THREAT INTELLIGENCE'];
  
  // Shrinkage Data
  sections.push(`
### Shrinkage Profile
- Current Shrinkage Rate: ${interviewResponses.shrinkage_1 || shrinkageData?.currentRate || 'Not specified'}
- Primary Shrinkage Cause: ${interviewResponses.shrinkage_2 || 'Not specified'}
- Monthly Shoplifting Incidents: ${interviewResponses.shrinkage_3 || 'Not specified'}
`);

  // ORC Activity
  sections.push(`
### Organized Retail Crime (ORC)
- ORC Incidents in Past Year: ${interviewResponses.shrinkage_4 || 'Not specified'}
${interviewResponses.shrinkage_4a ? `- ORC Incident Count: ${interviewResponses.shrinkage_4a}` : ''}
${interviewResponses.shrinkage_4b ? `- Estimated ORC Losses: ${interviewResponses.shrinkage_4b}` : ''}
- Known ORC Activity in Area: ${interviewResponses.external_2 || 'Not specified'}
`);

  // Internal Theft
  sections.push(`
### Internal Theft
- Employee Theft Incidents: ${interviewResponses.shrinkage_5 || 'Not specified'}
${interviewResponses.shrinkage_5a ? `- Employee Theft Count: ${interviewResponses.shrinkage_5a}` : ''}
${interviewResponses.shrinkage_5b ? `- Employee Theft Losses: ${interviewResponses.shrinkage_5b}` : ''}
`);

  // Robbery/Burglary History
  sections.push(`
### Robbery & Burglary History
- Robbery Incidents: ${interviewResponses.shrinkage_6 || 'Not specified'}
${interviewResponses.shrinkage_6a ? `- Most Recent Robbery: ${interviewResponses.shrinkage_6a}` : ''}
${interviewResponses.shrinkage_6b ? `- Armed Robbery: ${interviewResponses.shrinkage_6b}` : ''}
- Burglary Incidents: ${interviewResponses.shrinkage_7 || 'Not specified'}
`);

  // External Factors
  sections.push(`
### External Environment
- Area Crime Level: ${interviewResponses.external_1 || 'Not specified'}
- Known ORC in Region: ${interviewResponses.external_2 || 'Not specified'}
- Neighboring Business Cooperation: ${interviewResponses.external_3 || 'Not specified'}
${capIndexData?.overallScore ? `- CAP Index Overall: ${capIndexData.overallScore}` : ''}
${capIndexData?.theftScore ? `- CAP Index Theft: ${capIndexData.theftScore}` : ''}
`);

  // Incident History
  if (incidentHistory && incidentHistory.length > 0) {
    const recentIncidents = incidentHistory
      .slice(0, 10)
      .map(i => `- ${i.date}: ${i.type} (${i.severity}) - ${i.description}${i.lossAmount ? ` [Loss: $${i.lossAmount}]` : ''}`)
      .join('\n');

    const incidentCounts = incidentHistory.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalLoss = incidentHistory.reduce((sum, i) => sum + (i.lossAmount || 0), 0);

    sections.push(`
### Incident History
Total Incidents Recorded: ${incidentHistory.length}
Total Documented Loss: $${totalLoss.toLocaleString()}

Incident Breakdown by Type:
${Object.entries(incidentCounts).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

Recent Incidents:
${recentIncidents}
`);
  } else {
    sections.push(`
### Incident History
No detailed incident history available.
`);
  }

  return sections.join('\n');
}

function buildRetailEmployeeProcedures(context: RetailAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## EMPLOYEE PROCEDURES

### Background & Training
- Background Checks: ${interviewResponses.employee_1 || 'Not specified'}
- Theft Prevention Training: ${interviewResponses.employee_2 || 'Not specified'}
- Robbery Response Training: ${interviewResponses.employee_3 || 'Not specified'}
- Observed Theft Policy: ${interviewResponses.employee_4 || 'Not specified'}

### Operational Procedures
- Two-Person Closing: ${interviewResponses.employee_5 || 'Not specified'}
- Bag/Package Inspection: ${interviewResponses.employee_6 || 'Not specified'}
- Anonymous Tip Line: ${interviewResponses.employee_7 || 'Not specified'}
- Employee Discount Controls: ${interviewResponses.employee_8 || 'Not specified'}
- Termination Security Procedures: ${interviewResponses.employee_9 || 'Not specified'}
`;
}

function buildRetailMerchandiseProtection(context: RetailAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## MERCHANDISE PROTECTION

### High-Value Security
- High-Value Item Security: ${interviewResponses.merchandise_1 || 'Not specified'}
- Fitting Room Monitoring: ${interviewResponses.merchandise_2 || 'Not specified'}
- Security-Focused Fixtures: ${interviewResponses.merchandise_3 || 'Not specified'}

### Store Layout & Visibility
- Sales Floor Sightlines: ${interviewResponses.merchandise_4 || 'Not specified'}
- Convex Mirrors: ${interviewResponses.merchandise_5 || 'Not specified'}

### Inventory Controls
- Physical Inventory Frequency: ${interviewResponses.merchandise_6 || 'Not specified'}

### Refund & Return Controls
- Refund Authorization Level: ${interviewResponses.refunds_1 || 'Not specified'}
- Receipt Requirement: ${interviewResponses.refunds_2 || 'Not specified'}
- Frequent Returner Tracking: ${interviewResponses.refunds_3 || 'Not specified'}
- Suspected Return Fraud History: ${interviewResponses.refunds_4 || 'Not specified'}
`;
}

function buildRetailPhotoFindings(context: RetailAssessmentContext): string {
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

function generateRetailThreatAssessmentPrompt(request: RetailThreatAssessmentRequest): string {
  const { threatId, threatName, threatCategory, asisCode, context } = request;

  const storeProfile = buildRetailStoreProfile(context);
  const securityPosture = buildRetailSecurityPosture(context);
  const threatIntel = buildRetailThreatIntelligence(context);
  const employeeProcedures = buildRetailEmployeeProcedures(context);
  const merchandiseProtection = buildRetailMerchandiseProtection(context);
  const photoFindings = buildRetailPhotoFindings(context);

  return `## ASSESSMENT REQUEST

Assess the following threat for this retail store:

**Threat:** ${threatName}
**Category:** ${threatCategory}
**ASIS Code:** ${asisCode || 'N/A'}
**Threat ID:** ${threatId}

---

${storeProfile}

---

${securityPosture}

---

${threatIntel}

---

${employeeProcedures}

---

${merchandiseProtection}

---

${photoFindings}

---

## REQUIRED OUTPUT

Provide your assessment in JSON format matching the RetailAIAssessmentResponse interface.

For this threat (${threatId}), assess:
1. Threat Likelihood (T) - probability this threat will occur at this store (1-5)
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
 * Assess a single retail threat using GPT-4
 */
async function assessRetailThreatWithAI(
  request: RetailThreatAssessmentRequest
): Promise<RetailAIAssessmentResponse> {
  const openai = getOpenAI();
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
  const systemPrompt = RETAIL_SYSTEM_PROMPT + '\n\n' + RETAIL_INDUSTRY_STANDARDS;
  const userPrompt = generateRetailThreatAssessmentPrompt(request);

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
  return validateAndTransformRetailResponse(parsed, request.threatId);
}

/**
 * Validate AI response and fill in missing fields
 */
function validateAndTransformRetailResponse(
  parsed: any,
  threatId: string
): RetailAIAssessmentResponse {
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

function getShrinkageRiskLevel(responses: InterviewResponses): string {
  const shrinkage = responses.shrinkage_1 || '';
  if (shrinkage.toLowerCase().includes('over 5%')) return 'Critical';
  if (shrinkage.toLowerCase().includes('3-5%')) return 'High';
  if (shrinkage.toLowerCase().includes('2-3%')) return 'Moderate';
  if (shrinkage.toLowerCase().includes('1-2%')) return 'Low';
  if (shrinkage.toLowerCase().includes('under 1%')) return 'Minimal';
  return 'Unknown';
}

// ============================================================================
// ALGORITHMIC FALLBACK
// ============================================================================

/**
 * Generate assessment using algorithmic calculation (no AI)
 */
function assessRetailThreatAlgorithmically(
  threatId: string,
  context: RetailAssessmentContext
): RetailAIAssessmentResponse {
  const threat = RETAIL_STORE_THREATS.find(t => t.id === threatId);
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

  return {
    threatId,
    threatLikelihood: {
      score: threatLikelihood,
      label: getThreatLikelihoodLabel(threatLikelihood),
      evidence: ['Calculated algorithmically from interview responses'],
      reasoning: `Score derived from baseline threat level (${threat.typicalLikelihood}) adjusted by interview-driven risk factors including incident history and area characteristics.`,
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
      safetyImpact: threatId === 'armed_robbery' || threatId === 'customer_violence' 
        ? 'Employee/customer safety at risk' : 'Minimal safety concern',
      reputationalImpact: impact >= 4 ? 'Potential reputational damage' : 'Limited reputational impact',
      reasoning: `Score derived from store revenue, inventory value, and threat-specific impact modifiers.`,
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
      standardsReference: 'NRF/LPRC Best Practices',
    })),
    scenarioDescription: `${threat.name} risk assessment for this retail store. Calculated inherent risk score: ${normalizedRisk.toFixed(1)}/100 (${classification.toUpperCase()}).`,
    evidenceTrail: ['Algorithmic calculation - no AI evidence chain'],
    insufficientDataFlags: [],
  };
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Generate retail risk scenarios using AI with algorithmic fallback
 * 
 * This is the main entry point that:
 * 1. Attempts AI assessment for each threat
 * 2. Falls back to algorithmic calculation on failure
 * 3. Stores results in database
 * 4. Returns summary statistics
 */
export async function generateRetailRiskScenariosWithAI(
  assessmentId: string,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: RetailIncidentRecord[];
    capIndexData?: CAPIndexData;
    shrinkageData?: ShrinkageProfile;
    retailProfile?: RetailProfile; // Added for store type context
  }
): Promise<RetailGeneratedScenarioResult & { aiRecommendations?: any[] }> {
  const startTime = Date.now();
  const useAI = options?.useAI !== false; // Default to true

  // Debug logging for input
  console.log('[AI-ASSESSMENT] === INPUT ===');
  console.log('[AI-ASSESSMENT] Assessment ID:', assessmentId);
  console.log('[AI-ASSESSMENT] Retail profile:', JSON.stringify(options?.retailProfile, null, 2));
  console.log('[AI-ASSESSMENT] Merchandise display model:', options?.retailProfile?.merchandiseDisplayModel || 'NOT SET');
  console.log('[AI-ASSESSMENT] Interview responses count:', Object.keys(interviewResponses).length);
  console.log('[AI-ASSESSMENT] Sample responses:', JSON.stringify(Object.entries(interviewResponses).slice(0, 5)));
  console.log('[AI-ASSESSMENT] Use AI:', useAI);

  const context: RetailAssessmentContext = {
    assessmentId,
    interviewResponses,
    retailProfile: options?.retailProfile, // Pass retail profile for store type context
    photoAnalysisFindings: options?.photoFindings,
    incidentHistory: options?.incidentHistory,
    capIndexData: options?.capIndexData,
    shrinkageData: options?.shrinkageData,
  };

  const results: RetailAIAssessmentResponse[] = [];
  let aiSuccessCount = 0;
  let algorithmicFallbackCount = 0;

  // Process each retail threat
  for (const threat of RETAIL_STORE_THREATS) {
    const request: RetailThreatAssessmentRequest = {
      threatId: threat.id,
      threatName: threat.name,
      threatCategory: threat.category,
      asisCode: threat.asisCode,
      context,
    };

    try {
      if (useAI) {
        // Attempt AI assessment
        const aiResult = await assessRetailThreatWithAI(request);
        results.push(aiResult);
        aiSuccessCount++;
      } else {
        // Use algorithmic only
        const algoResult = assessRetailThreatAlgorithmically(threat.id, context);
        results.push(algoResult);
        algorithmicFallbackCount++;
      }
    } catch (error) {
      console.error(`AI assessment failed for ${threat.id}, using fallback:`, error);
      
      // Fallback to algorithmic
      try {
        const algoResult = assessRetailThreatAlgorithmically(threat.id, context);
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

  // Calculate overall shrinkage risk
  const overallShrinkageRisk = getShrinkageRiskLevel(interviewResponses);

  // Store results in database
  const riskScenarioIds: string[] = [];
  for (const result of results) {
    try {
      const threat = RETAIL_STORE_THREATS.find(t => t.id === result.threatId);
      
      // Look up or create threat record in threat library
      let existingThreat = await db.query.threatLibrary.findFirst({
        where: eq(threatLibrary.name, threat?.name || result.threatId),
      });

      let threatLibraryId: string | undefined;
      if (existingThreat) {
        threatLibraryId = existingThreat.id;
      } else {
        const [newThreat] = await db.insert(threatLibrary).values({
          name: threat?.name || result.threatId,
          category: threat?.category || 'Retail',
          description: `${threat?.name || result.threatId} - ASIS Code: ${threat?.asisCode || 'N/A'}`,
        }).returning();
        threatLibraryId = newThreat.id;
      }
      
      // Map AI assessment response to riskScenarios schema
      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId,
        threatLibraryId,
        scenario: threat?.name || result.threatId,
        asset: 'Retail merchandise and operations',
        threatType: threat?.category || 'Retail',
        threatDescription: result.scenarioDescription,
        vulnerabilityDescription: result.vulnerability.reasoning,
        likelihood: result.threatLikelihood.label,
        impact: result.impact.label,
        riskLevel: result.inherentRisk.classification,
        currentLikelihood: result.threatLikelihood.label,
        currentImpact: result.impact.label,
        currentRiskLevel: result.inherentRisk.classification,
        likelihoodScore: result.threatLikelihood.score,
        impactScore: result.impact.score,
        inherentRisk: result.inherentRisk.normalizedScore,
        controlEffectiveness: 0,
        residualRisk: result.inherentRisk.normalizedScore,
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

  // Aggregate AI recommendations from all threats (de-duplicate by controlId)
  const aiRecommendationsMap = new Map<string, any>();
  for (const result of results) {
    for (const control of result.priorityControls) {
      if (!aiRecommendationsMap.has(control.controlId)) {
        aiRecommendationsMap.set(control.controlId, {
          controlId: control.controlId,
          controlName: control.controlName,
          urgency: control.urgency,
          rationale: control.rationale,
          standardsReference: control.standardsReference,
          estimatedCostRange: control.estimatedCostRange,
          threatIds: [result.threatId],
          inherentRiskScore: result.inherentRisk.normalizedScore,
        });
      } else {
        // Add threat to existing control
        const existing = aiRecommendationsMap.get(control.controlId);
        existing.threatIds.push(result.threatId);
        // Upgrade urgency if this threat is more urgent
        if (control.urgency === 'immediate' && existing.urgency !== 'immediate') {
          existing.urgency = 'immediate';
        } else if (control.urgency === 'short_term' && existing.urgency === 'medium_term') {
          existing.urgency = 'short_term';
        }
        // Track highest risk score
        existing.inherentRiskScore = Math.max(existing.inherentRiskScore, result.inherentRisk.normalizedScore);
      }
    }
  }

  // Sort by urgency and risk score
  const aiRecommendations = Array.from(aiRecommendationsMap.values())
    .sort((a, b) => {
      const urgencyOrder = { immediate: 0, short_term: 1, medium_term: 2 };
      const urgencyDiff = urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.inherentRiskScore - a.inherentRiskScore;
    });

  // Debug logging for output
  console.log('[AI-ASSESSMENT] === OUTPUT ===');
  console.log('[AI-ASSESSMENT] Mode:', mode);
  console.log('[AI-ASSESSMENT] AI success count:', aiSuccessCount);
  console.log('[AI-ASSESSMENT] Algorithmic fallback count:', algorithmicFallbackCount);
  console.log('[AI-ASSESSMENT] AI returned recommendations:', aiRecommendations.length);
  console.log('[AI-ASSESSMENT] Top 3 recommendations:', aiRecommendations.slice(0, 3).map(r => `${r.controlName} (${r.urgency})`));
  console.log('[AI-ASSESSMENT] Total scenarios stored:', riskScenarioIds.length);

  return {
    success: true,
    mode,
    generatedScenarios: results.length,
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    riskScenarioIds,
    overallShrinkageRisk,
    aiConfidence,
    processingTimeMs: Date.now() - startTime,
    aiRecommendations, // Aggregated AI-generated control recommendations
  };
}

// ============================================================================
// ADDITIONAL EXPORTS
// ============================================================================

/**
 * Assess a single threat (for testing or individual assessment)
 */
export async function assessSingleRetailThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  options?: { useAI?: boolean }
): Promise<RetailAIAssessmentResponse> {
  const threat = RETAIL_STORE_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const context: RetailAssessmentContext = {
    assessmentId: '',
    interviewResponses,
  };

  const request: RetailThreatAssessmentRequest = {
    threatId,
    threatName: threat.name,
    threatCategory: threat.category,
    asisCode: threat.asisCode,
    context,
  };

  if (options?.useAI === false) {
    return assessRetailThreatAlgorithmically(threatId, context);
  }

  try {
    return await assessRetailThreatWithAI(request);
  } catch (error) {
    console.error(`AI assessment failed, using fallback:`, error);
    return assessRetailThreatAlgorithmically(threatId, context);
  }
}

/**
 * Generate narrative summary for retail assessment (calls GPT-4)
 */
export async function generateRetailNarrativeSummary(
  results: RetailAIAssessmentResponse[],
  context: RetailAssessmentContext
): Promise<string> {
  const topRisks = [...results]
    .sort((a, b) => b.inherentRisk.normalizedScore - a.inherentRisk.normalizedScore)
    .slice(0, 5);

  const shrinkageLevel = getShrinkageRiskLevel(context.interviewResponses);

  const prompt = `Generate a professional executive summary (300-500 words) for this retail store security risk assessment.

## ASSESSMENT RESULTS

Total Threats Assessed: ${results.length}
Critical Risks: ${results.filter(r => r.inherentRisk.classification === 'critical').length}
High Risks: ${results.filter(r => r.inherentRisk.classification === 'high').length}
Medium Risks: ${results.filter(r => r.inherentRisk.classification === 'medium').length}
Low Risks: ${results.filter(r => r.inherentRisk.classification === 'low').length}

Overall Shrinkage Risk Level: ${shrinkageLevel}

## STORE PROFILE
- Store Type: ${context.interviewResponses.store_profile_1 || 'Not specified'}
- Annual Revenue: ${context.interviewResponses.store_profile_2 || 'Not specified'}
- Current Shrinkage Rate: ${context.interviewResponses.shrinkage_1 || 'Not specified'}
- Dedicated LP Staff: ${context.interviewResponses.lp_staff_1 || 'Not specified'}
- EAS System: ${context.interviewResponses.eas_1 || 'Not specified'}

## TOP RISK SCENARIOS

${topRisks.map(r => {
  const threat = RETAIL_STORE_THREATS.find(t => t.id === r.threatId);
  return `- ${threat?.name || r.threatId}: T=${r.threatLikelihood.score}, V=${r.vulnerability.score}, I=${r.impact.score} → Score: ${r.inherentRisk.normalizedScore.toFixed(1)}/100 (${r.inherentRisk.classification.toUpperCase()})`;
}).join('\n')}

## KEY EVIDENCE

${topRisks.slice(0, 3).map(r => {
  const threat = RETAIL_STORE_THREATS.find(t => t.id === r.threatId);
  return `${threat?.name || r.threatId}:
- ${r.threatLikelihood.evidence.slice(0, 2).join('\n- ')}`;
}).join('\n\n')}

Write in a professional tone suitable for presentation to store management and corporate leadership. Focus on actionable insights and ROI-justified recommendations. Reference NRF/LPRC industry benchmarks where relevant.`;

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
          content: 'You are a senior retail loss prevention consultant preparing a risk assessment summary for a retail client. Write professionally, concisely, and focus on actionable recommendations that improve shrinkage metrics and ROI.' 
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

// ============================================================================
// ROUTE HANDLER EXPORTS
// ============================================================================

/**
 * Route handler for POST /api/assessments/:id/retail-interview/generate-risks-ai
 */
export async function handleGenerateRetailRisksAI(
  assessmentId: string,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: RetailIncidentRecord[];
  }
): Promise<RetailGeneratedScenarioResult> {
  return generateRetailRiskScenariosWithAI(assessmentId, interviewResponses, options);
}

/**
 * Route handler for POST /api/assessments/:id/retail-interview/assess-single-threat
 */
export async function handleAssessSingleRetailThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  useAI: boolean = true
): Promise<RetailAIAssessmentResponse> {
  return assessSingleRetailThreat(threatId, interviewResponses, { useAI });
}

/**
 * Route handler for POST /api/assessments/:id/retail-interview/generate-narrative
 */
export async function handleGenerateRetailNarrative(
  results: RetailAIAssessmentResponse[],
  context: RetailAssessmentContext
): Promise<{ narrative: string }> {
  const narrative = await generateRetailNarrativeSummary(results, context);
  return { narrative };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  RETAIL_SYSTEM_PROMPT,
  RETAIL_INDUSTRY_STANDARDS,
  assessRetailThreatWithAI,
  assessRetailThreatAlgorithmically,
  buildRetailStoreProfile,
  buildRetailSecurityPosture,
  buildRetailThreatIntelligence,
  generateRetailThreatAssessmentPrompt,
  RETAIL_STORE_THREATS,
};

export default {
  // Main orchestration
  generateRetailRiskScenariosWithAI,
  
  // Single threat assessment
  assessSingleRetailThreat,
  
  // Narrative generation
  generateRetailNarrativeSummary,
  
  // Route handlers
  handleGenerateRetailRisksAI,
  handleAssessSingleRetailThreat,
  handleGenerateRetailNarrative,
  
  // Internal (exposed for testing)
  assessRetailThreatWithAI,
  assessRetailThreatAlgorithmically,
  buildRetailStoreProfile,
  buildRetailSecurityPosture,
  buildRetailThreatIntelligence,
};
