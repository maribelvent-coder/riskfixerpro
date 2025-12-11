/**
 * RiskFixer Executive Protection AI Risk Assessment
 * 
 * Extends the base AI assessment framework with EP-specific capabilities:
 * - T×V×I×E formula (adds Exposure factor unique to EP)
 * - Person-centric rather than facility-centric assessment
 * - Pattern predictability and digital exposure analysis
 * - Family threat surface evaluation
 * 
 * DESIGN PHILOSOPHY:
 * - Evidence-based: Every score must cite specific findings
 * - Methodology-compliant: ASIS GDL-RA with EP extensions
 * - Conservative: Score toward higher risk when ambiguous
 * - Auditable: Clear reasoning chain for each score
 * - Fallback: Algorithmic calculation if AI fails
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 * @see RiskFixer-Executive-Protection-Framework.md
 */

import OpenAI from 'openai';
import { db } from '../../db';
import { eq } from 'drizzle-orm';
import { riskScenarios, assessments } from '@shared/schema';

// Import algorithmic fallback functions from existing mapper
import {
  calculateExposureFactor,
  calculateThreatLikelihood,
  calculateVulnerability,
  calculateImpact,
  EP_THREATS,
  classifyRiskLevel,
  InterviewResponses,
} from '../ep-interview-mapper';

// Import response normalization helpers
import { getResponseValue, getResponseBool } from '../ep-interview-mapper-v2';

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

export interface EPAssessmentContext {
  assessmentId: number;
  executiveName?: string;
  interviewResponses: InterviewResponses;
  photoAnalysisFindings?: string[];
  incidentHistory?: EPIncidentRecord[];
  osintFindings?: OSINTFindings;
  travelItinerary?: TravelProfile[];
}

export interface EPIncidentRecord {
  date: string;
  type: 'threat' | 'surveillance' | 'harassment' | 'stalking' | 'attack' | 'doxxing' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  perpetratorKnown: boolean;
}

export interface OSINTFindings {
  publicExposureLevel: 'minimal' | 'moderate' | 'significant' | 'extensive';
  addressesExposed: number;
  familyMembersIdentifiable: boolean;
  socialMediaRisk: 'low' | 'medium' | 'high';
  darkWebMentions: boolean;
  threatForumActivity: boolean;
}

export interface TravelProfile {
  destination: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  kidnappingRisk: boolean;
  securityAdvised: boolean;
}

export interface EPThreatAssessmentRequest {
  threatId: string;
  threatName: string;
  threatCategory: string;
  context: EPAssessmentContext;
}

/**
 * Rich AI response format for EP assessments
 * Includes evidence chains and exposure factor
 */
export interface EPAIAssessmentResponse {
  threatId: string;
  
  // T×V×I×E Scores (1-10 scale for T/V/I, 1-5 for E)
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
    protectiveFactors: string[];
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
    dataGaps: string[];
  };
  
  impact: {
    score: number;
    label: string;
    personalSafetyImpact: string;
    familyImpact: string;
    financialImpact: string;
    reputationalImpact: string;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  
  exposure: {
    score: number; // 1.0 - 5.0
    label: string;
    publicProfileComponent: number;
    patternPredictabilityComponent: number;
    digitalFootprintComponent: number;
    reasoning: string;
  };
  
  // Calculated risks
  inherentRisk: {
    score: number; // T × V × I × E
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
  }[];
  
  // Scenario description for reports
  scenarioDescription: string;
  
  // Evidence trail for audit
  evidenceTrail: string[];
  
  // Insufficient data flags
  insufficientDataFlags: string[];
}

export interface EPGeneratedScenarioResult {
  success: boolean;
  mode: 'ai' | 'algorithmic' | 'hybrid';
  generatedScenarios: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScenarioIds: number[];
  overallExposure: number;
  aiConfidence: 'high' | 'medium' | 'low' | 'fallback';
  processingTimeMs: number;
}

// ============================================================================
// EP-SPECIFIC SYSTEM PROMPT
// ============================================================================

const EP_SYSTEM_PROMPT = `You are a certified physical security professional (CPP) with executive protection specialization conducting a formal risk assessment. You are assessing threats to a protected principal (executive/high-net-worth individual), NOT a facility.

Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview data, OSINT reports, or incident history provided. Never assume facts not in evidence. If data is missing, explicitly state "INSUFFICIENT DATA" for that element.

2. METHODOLOGY-COMPLIANT: Follow the ASIS GDL-RA framework using T×V×I×E where:
   - T (Threat Likelihood): 1-10 scale, probability of threat actor targeting this principal
   - V (Vulnerability): 1-10 scale, degree to which current protections fail to prevent/detect
   - I (Impact): 1-10 scale, consequence severity if attack succeeds (personal safety paramount)
   - E (Exposure): 1.0-5.0 multiplier, degree to which principal's profile/patterns create opportunity
   - Inherent Risk = T × V × I × E (theoretical max 5,000, normalized to 0-100)

3. PERSON-CENTRIC: Unlike facility assessments, EP focuses on:
   - The principal as a target, not a building
   - Pattern predictability as a primary vulnerability
   - Family members as potential soft targets
   - Digital exposure as an attack surface
   - Travel as a high-risk activity

4. RUBRIC-ANCHORED: Use the exact scoring criteria provided.

THREAT LIKELIHOOD RUBRIC (1-10):
Score 1-2 (RARE): No known threats, low-profile principal, no controversial involvement
Score 3-4 (UNLIKELY): Historical threats only, moderate profile, standard industry
Score 5-6 (POSSIBLE): Recent concerning activity, high-profile, some controversy
Score 7-8 (LIKELY): Active threats documented, very high profile, significant controversy
Score 9-10 (ALMOST CERTAIN): Current active threats, internationally known, direct targeting observed

VULNERABILITY RUBRIC (1-10):
Score 1-2 (MINIMAL): 24/7 protection detail, hardened residence, unpredictable patterns, secure communications
Score 3-4 (LOW): Part-time protection, good residential security, some pattern variation
Score 5-6 (MODERATE): Basic security measures, predictable patterns, standard residence
Score 7-8 (HIGH): Minimal security, highly predictable, exposed digital footprint
Score 9-10 (CRITICAL): No protection, public patterns, doxxed/exposed, family unprotected

IMPACT RUBRIC (1-10):
Score 1-2 (NEGLIGIBLE): Minor inconvenience, no safety concern
Score 3-4 (MINOR): Temporary disruption, minor financial loss
Score 5-6 (MODERATE): Significant disruption, medical attention possible, reputation damage
Score 7-8 (MAJOR): Serious injury possible, major financial loss, career impact
Score 9-10 (CATASTROPHIC): Life-threatening, family endangered, existential to career/finances

EXPOSURE RUBRIC (1.0-5.0):
Score 1.0-1.5: Private individual, no public presence, unpredictable schedule
Score 1.6-2.5: Limited public profile, some predictability, minimal digital footprint
Score 2.6-3.5: Recognized professional, regular patterns, moderate online presence
Score 3.6-4.5: Frequently featured in media, highly predictable, significant digital exposure
Score 4.6-5.0: Internationally known, public schedule, extensive media coverage, family exposed

5. STANDARD-REFERENCED: When recommending controls, cite specific standards:
   - ASIS CPP Body of Knowledge - Executive Protection
   - ASIS ESRM (Enterprise Security Risk Management)
   - US Secret Service Threat Assessment Research
   - ASIS Residential Security Guidelines
   - FEMA 320/361 (Safe Room Standards)
   - US State Department OSAC Guidelines

6. CONSERVATIVE: When evidence is ambiguous, score toward higher risk. Executive protection errs on the side of caution.

7. AUDITABLE: Your reasoning must be clear enough that another CPP reviewing would reach the same conclusion given the same evidence.

CRITICAL: If data is insufficient to assess a factor, state "INSUFFICIENT DATA" rather than guessing. Never hallucinate facts about the principal or their situation.

OUTPUT FORMAT:
Respond with a JSON object matching the EPAIAssessmentResponse interface. Include evidence citations for every score.`;

// ============================================================================
// EP INDUSTRY STANDARDS (Layer 3)
// ============================================================================

const EP_INDUSTRY_STANDARDS = `
APPLICABLE STANDARDS FOR EXECUTIVE PROTECTION ASSESSMENTS:

1. ASIS International Standards:
   - ASIS CPP Body of Knowledge - Executive Protection Domain
   - ASIS ESRM (Enterprise Security Risk Management)
   - ASIS Chief Security Officer Standard
   - ASIS WVPI (fixated person indicators)

2. Threat Assessment Methodology:
   - US Secret Service Exceptional Case Study Project
   - FBI Behavioral Analysis Unit Threat Assessment
   - Association of Threat Assessment Professionals (ATAP) Guidelines
   - Fixated Threat Assessment Centre (UK) Protocols

3. Residential Security:
   - ASIS Residential Security Guidelines
   - CPTED for Residential Applications
   - FEMA 320 (Taking Shelter from the Storm)
   - FEMA 361 (Safe Rooms and Community Shelters)

4. Travel Security:
   - US State Department OSAC Guidelines
   - International SOS Risk Ratings
   - Control Risks Travel Security Standards
   - Armored Vehicle Standards (B4/B6/B7)

5. Communications Security:
   - NIST Cybersecurity Framework (personal devices)
   - OPSEC Principles for Individuals
   - Counter-Surveillance Detection Protocols

6. Family Protection:
   - School Security Best Practices (various state guidelines)
   - Domestic Staff Vetting Standards
   - Emergency Communications Protocols
`;

// ============================================================================
// CONTEXT BUILDING FUNCTIONS
// ============================================================================

function buildEPProfileContext(context: EPAssessmentContext): string {
  const { interviewResponses } = context;
  
  const sections: string[] = ['## PRINCIPAL PROFILE'];
  
  // Public Profile
  sections.push(`
### Public Visibility
- Profile Level: ${getResponseValue(interviewResponses.ep_public_profile) || 'Not specified'}
- Media Coverage: ${getResponseValue(interviewResponses.ep_media_coverage) || 'Not specified'}
- Industry Sector: ${getResponseValue(interviewResponses.ep_industry_sector) || 'Not specified'}
- Net Worth Range: ${getResponseValue(interviewResponses.ep_net_worth_range) || 'Not specified'}
- Controversial Involvement: ${getResponseValue(interviewResponses.ep_controversial_involvement) || 'Not specified'}
`);

  // Threat History
  sections.push(`
### Threat History
- Known Threats: ${getResponseValue(interviewResponses.ep_known_threats) || 'Not specified'}
- Threat Perception (1-10): ${getResponseValue(interviewResponses.ep_threat_perception) || 'Not specified'}
- Current Security Level: ${getResponseValue(interviewResponses.ep_current_security_level) || 'Not specified'}
`);

  // Family Composition
  const familyMembers = interviewResponses.ep_family_members;
  const familyMembersValue = Array.isArray(familyMembers) 
    ? familyMembers.join(', ') 
    : getResponseValue(familyMembers) || 'Not specified';
  
  sections.push(`
### Family Composition
- Family Members: ${familyMembersValue}
- Spouse Public Profile: ${getResponseValue(interviewResponses.ep_spouse_public_profile) || 'N/A'}
- Children Schedule Predictability: ${getResponseValue(interviewResponses.ep_children_schedule) || 'N/A'}
`);

  return sections.join('\n');
}

function buildEPSecurityPostureContext(context: EPAssessmentContext): string {
  const { interviewResponses } = context;
  
  const sections: string[] = ['## CURRENT SECURITY POSTURE'];
  
  // Helper for array fields
  const getArrayValue = (field: any): string => {
    if (Array.isArray(field)) return field.join(', ');
    return getResponseValue(field) || 'Not specified';
  };
  
  // Residential Security
  sections.push(`
### Residential Security
- Residence Type: ${getResponseValue(interviewResponses.ep_residence_type) || 'Not specified'}
- Visibility: ${getResponseValue(interviewResponses.ep_residence_visibility) || 'Not specified'}
- Perimeter Security: ${getArrayValue(interviewResponses.ep_perimeter_security)}
- Alarm System: ${getResponseValue(interviewResponses.ep_alarm_system) || 'Not specified'}
- Safe Room: ${getResponseValue(interviewResponses.ep_safe_room) || 'Not specified'}
- CCTV Coverage: ${getArrayValue(interviewResponses.ep_cctv_coverage)}
- Police Response Time: ${getResponseValue(interviewResponses.ep_police_response_time) || 'Not specified'}
`);

  // Personal Protection
  sections.push(`
### Personal Protection
- Security Level: ${getResponseValue(interviewResponses.ep_current_security_level) || 'Not specified'}
- Daily Routine Predictability: ${getResponseValue(interviewResponses.ep_daily_routine_predictability) || 'Not specified'}
- Commute Pattern: ${getResponseValue(interviewResponses.ep_commute_pattern) || 'Not specified'}
- Vehicle Type: ${getResponseValue(interviewResponses.ep_vehicle_type) || 'Not specified'}
- Vehicle Security Features: ${getArrayValue(interviewResponses.ep_vehicle_security_features)}
`);

  // Digital Security
  sections.push(`
### Digital Security
- Online Presence Management: ${getResponseValue(interviewResponses.ep_online_presence_management) || 'Not specified'}
- Public Records Exposure: ${getResponseValue(interviewResponses.ep_public_records_exposure) || 'Not specified'}
- Social Media Activity: ${getResponseValue(interviewResponses.ep_social_media_activity) || 'Not specified'}
- OSINT Monitoring: ${getResponseValue(interviewResponses.ep_osint_monitoring) || 'Not specified'}
- Communications Security: ${getResponseValue(interviewResponses.ep_communications_security) || 'Not specified'}
`);

  // Travel Security
  sections.push(`
### Travel Security
- Travel Frequency: ${getResponseValue(interviewResponses.ep_travel_frequency) || 'Not specified'}
- International High-Risk Travel: ${getResponseValue(interviewResponses.ep_international_high_risk) || 'Not specified'}
- Travel Publicity: ${getResponseValue(interviewResponses.ep_travel_publicity) || 'Not specified'}
- Airport Procedures: ${getResponseValue(interviewResponses.ep_airport_procedures) || 'Not specified'}
`);

  return sections.join('\n');
}

function buildEPEmergencyPreparednessContext(context: EPAssessmentContext): string {
  const { interviewResponses } = context;
  
  return `## EMERGENCY PREPAREDNESS

### Emergency Response
- Emergency Contacts Established: ${getResponseValue(interviewResponses.ep_emergency_contacts) || 'Not specified'}
- Family Security Training: ${getResponseValue(interviewResponses.ep_family_security_training) || 'Not specified'}
- Duress Codes: ${getResponseValue(interviewResponses.ep_duress_codes) || 'Not specified'}
- Evacuation Routes: ${getResponseValue(interviewResponses.ep_evacuation_routes) || 'Not specified'}
- Go-Bags Prepared: ${getResponseValue(interviewResponses.ep_go_bags) || 'Not specified'}
- Medical Emergency Plan: ${getResponseValue(interviewResponses.ep_medical_emergency_plan) || 'Not specified'}
`;
}

function buildEPThreatIntelligenceContext(context: EPAssessmentContext): string {
  const sections: string[] = ['## THREAT INTELLIGENCE'];
  
  // OSINT Findings
  if (context.osintFindings) {
    sections.push(`
### OSINT Assessment
- Public Exposure Level: ${context.osintFindings.publicExposureLevel}
- Addresses Exposed Online: ${context.osintFindings.addressesExposed}
- Family Members Identifiable: ${context.osintFindings.familyMembersIdentifiable ? 'Yes' : 'No'}
- Social Media Risk: ${context.osintFindings.socialMediaRisk}
- Dark Web Mentions: ${context.osintFindings.darkWebMentions ? 'Yes' : 'No'}
- Threat Forum Activity: ${context.osintFindings.threatForumActivity ? 'Yes' : 'No'}
`);
  }

  // Incident History
  if (context.incidentHistory && context.incidentHistory.length > 0) {
    const recentIncidents = context.incidentHistory
      .slice(0, 10)
      .map(i => `- ${i.date}: ${i.type} (${i.severity}) - ${i.description}${i.perpetratorKnown ? ' [Perpetrator Known]' : ''}`)
      .join('\n');

    const incidentCounts = context.incidentHistory.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    sections.push(`
### Incident History
Total Incidents Recorded: ${context.incidentHistory.length}

Incident Breakdown by Type:
${Object.entries(incidentCounts).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

Recent Incidents:
${recentIncidents}
`);
  } else {
    sections.push(`
### Incident History
No incident history available.
`);
  }

  // Travel Profile
  if (context.travelItinerary && context.travelItinerary.length > 0) {
    sections.push(`
### Travel Risk Profile
${context.travelItinerary.map(t => 
  `- ${t.destination}: ${t.riskLevel} risk${t.kidnappingRisk ? ', KIDNAPPING RISK' : ''}`
).join('\n')}
`);
  }

  return sections.join('\n');
}

function buildEPPhotoFindingsContext(context: EPAssessmentContext): string {
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

function generateEPThreatAssessmentPrompt(request: EPThreatAssessmentRequest): string {
  const { threatId, threatName, threatCategory, context } = request;

  const profileContext = buildEPProfileContext(context);
  const securityContext = buildEPSecurityPostureContext(context);
  const preparednessContext = buildEPEmergencyPreparednessContext(context);
  const threatIntelContext = buildEPThreatIntelligenceContext(context);
  const photoContext = buildEPPhotoFindingsContext(context);

  return `## ASSESSMENT REQUEST

Assess the following threat for this executive protection principal:

**Threat:** ${threatName}
**Category:** ${threatCategory}
**Threat ID:** ${threatId}

---

${profileContext}

---

${securityContext}

---

${preparednessContext}

---

${threatIntelContext}

---

${photoContext}

---

## REQUIRED OUTPUT

Provide your assessment in JSON format matching the EPAIAssessmentResponse interface.

For this threat (${threatId}), assess:
1. Threat Likelihood (T) - probability this threat actor will target this principal (1-10)
2. Vulnerability (V) - degree to which current protections fail against this threat (1-10)
3. Impact (I) - consequence severity if attack succeeds, personal safety paramount (1-10)
4. Exposure (E) - degree to which principal's profile/patterns create opportunity (1.0-5.0)

Calculate: Inherent Risk = T × V × I × E

Cite specific evidence from the data provided for each score.
If data is insufficient for any element, flag it explicitly.`;
}

// ============================================================================
// AI ASSESSMENT FUNCTION
// ============================================================================

/**
 * Assess a single EP threat using GPT-4
 */
async function assessEPThreatWithAI(
  request: EPThreatAssessmentRequest
): Promise<EPAIAssessmentResponse> {
  const systemPrompt = EP_SYSTEM_PROMPT + '\n\n' + EP_INDUSTRY_STANDARDS;
  const userPrompt = generateEPThreatAssessmentPrompt(request);

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
  return validateAndTransformEPResponse(parsed, request.threatId);
}

/**
 * Validate AI response and fill in missing fields
 */
function validateAndTransformEPResponse(
  parsed: any,
  threatId: string
): EPAIAssessmentResponse {
  // Ensure scores are within bounds
  const clamp = (val: number, min: number, max: number) => 
    Math.max(min, Math.min(max, val));

  const threatLikelihood = clamp(parsed.threatLikelihood?.score || parsed.threatLikelihood || 5, 1, 10);
  const vulnerability = clamp(parsed.vulnerability?.score || parsed.vulnerability || 5, 1, 10);
  const impact = clamp(parsed.impact?.score || parsed.impact || 5, 1, 10);
  const exposure = clamp(parsed.exposure?.score || parsed.exposure || 2.5, 1.0, 5.0);

  // Calculate inherent risk
  const inherentRisk = threatLikelihood * vulnerability * impact * exposure;
  const normalizedRisk = Math.min(100, (inherentRisk / 2500) * 100);

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
      protectiveFactors: ensureArray(parsed.vulnerability?.protectiveFactors),
      reasoning: parsed.vulnerability?.reasoning || parsed.vulnerabilityReasoning || '',
      confidence: validateConfidence(parsed.vulnerability?.confidence),
      dataGaps: ensureArray(parsed.vulnerability?.dataGaps || parsed.vulnerabilityDataGaps),
    },
    impact: {
      score: impact,
      label: getImpactLabel(impact),
      personalSafetyImpact: parsed.impact?.personalSafetyImpact || '',
      familyImpact: parsed.impact?.familyImpact || '',
      financialImpact: parsed.impact?.financialImpact || '',
      reputationalImpact: parsed.impact?.reputationalImpact || '',
      reasoning: parsed.impact?.reasoning || parsed.impactReasoning || '',
      confidence: validateConfidence(parsed.impact?.confidence),
    },
    exposure: {
      score: exposure,
      label: getExposureLabel(exposure),
      publicProfileComponent: parsed.exposure?.publicProfileComponent || 0,
      patternPredictabilityComponent: parsed.exposure?.patternPredictabilityComponent || 0,
      digitalFootprintComponent: parsed.exposure?.digitalFootprintComponent || 0,
      reasoning: parsed.exposure?.reasoning || parsed.exposureReasoning || '',
    },
    inherentRisk: {
      score: inherentRisk,
      normalizedScore: normalizedRisk,
      classification,
    },
    priorityControls: ensureArray(parsed.priorityControls || parsed.suggestedControls).map((c: any) => ({
      controlId: c.controlId || c.control_id || '',
      controlName: c.controlName || c.control_name || c,
      urgency: validateUrgency(c.urgency),
      rationale: c.rationale || c.whySuggested || '',
      standardsReference: c.standardsReference || c.standards_reference || '',
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
  if (score <= 2) return 'Rare';
  if (score <= 4) return 'Unlikely';
  if (score <= 6) return 'Possible';
  if (score <= 8) return 'Likely';
  return 'Almost Certain';
}

function getVulnerabilityLabel(score: number): string {
  if (score <= 2) return 'Minimal';
  if (score <= 4) return 'Low';
  if (score <= 6) return 'Moderate';
  if (score <= 8) return 'High';
  return 'Critical';
}

function getImpactLabel(score: number): string {
  if (score <= 2) return 'Negligible';
  if (score <= 4) return 'Minor';
  if (score <= 6) return 'Moderate';
  if (score <= 8) return 'Major';
  return 'Catastrophic';
}

function getExposureLabel(score: number): string {
  if (score <= 1.5) return 'Private';
  if (score <= 2.5) return 'Limited Exposure';
  if (score <= 3.5) return 'Moderate Exposure';
  if (score <= 4.5) return 'High Exposure';
  return 'Extreme Exposure';
}

// ============================================================================
// ALGORITHMIC FALLBACK
// ============================================================================

/**
 * Generate assessment using algorithmic calculation (no AI)
 */
function assessEPThreatAlgorithmically(
  threatId: string,
  context: EPAssessmentContext
): EPAIAssessmentResponse {
  const threat = EP_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const { interviewResponses } = context;

  // Use existing algorithmic functions
  const threatLikelihood = calculateThreatLikelihood(threatId, interviewResponses);
  const vulnerability = calculateVulnerability(threatId, interviewResponses);
  const impact = calculateImpact(threatId, interviewResponses);
  const exposure = calculateExposureFactor(interviewResponses);

  const inherentRisk = threatLikelihood * vulnerability * impact * exposure;
  const normalizedRisk = Math.min(100, (inherentRisk / 2500) * 100);

  const classification = classifyRiskLevel(normalizedRisk);

  return {
    threatId,
    threatLikelihood: {
      score: threatLikelihood,
      label: getThreatLikelihoodLabel(threatLikelihood),
      evidence: ['Calculated algorithmically from interview responses'],
      reasoning: 'Score derived from baseline threat level plus interview-driven modifiers',
      confidence: 'medium',
      dataGaps: [],
    },
    vulnerability: {
      score: vulnerability,
      label: getVulnerabilityLabel(vulnerability),
      controlGaps: ['See algorithmic risk factor analysis'],
      protectiveFactors: [],
      reasoning: 'Score derived from security posture risk factor counting',
      confidence: 'medium',
      dataGaps: [],
    },
    impact: {
      score: impact,
      label: getImpactLabel(impact),
      personalSafetyImpact: threat.baselineImpact >= 8 ? 'High personal safety risk' : 'Moderate personal safety risk',
      familyImpact: interviewResponses.ep_family_members?.includes('children_school_age') 
        ? 'Family members at elevated risk' : '',
      financialImpact: '',
      reputationalImpact: '',
      reasoning: 'Score derived from baseline impact plus family/profile modifiers',
      confidence: 'medium',
    },
    exposure: {
      score: exposure,
      label: getExposureLabel(exposure),
      publicProfileComponent: 0,
      patternPredictabilityComponent: 0,
      digitalFootprintComponent: 0,
      reasoning: 'Calculated from public profile, pattern predictability, and digital footprint factors',
    },
    inherentRisk: {
      score: inherentRisk,
      normalizedScore: normalizedRisk,
      classification,
    },
    priorityControls: [],
    scenarioDescription: `${threat.name} risk assessment for principal. Inherent risk score: ${normalizedRisk.toFixed(1)}/100.`,
    evidenceTrail: ['Algorithmic calculation - no AI evidence chain'],
    insufficientDataFlags: [],
  };
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Generate EP risk scenarios using AI with algorithmic fallback
 * 
 * This is the main entry point that:
 * 1. Attempts AI assessment for each threat
 * 2. Falls back to algorithmic calculation on failure
 * 3. Stores results in database
 * 4. Returns summary statistics
 */
export async function generateEPRiskScenariosWithAI(
  assessmentId: number,
  interviewResponses: InterviewResponses,
  options?: {
    useAI?: boolean;
    photoFindings?: string[];
    incidentHistory?: EPIncidentRecord[];
    osintFindings?: OSINTFindings;
  }
): Promise<EPGeneratedScenarioResult> {
  const startTime = Date.now();
  const useAI = options?.useAI !== false; // Default to true

  const context: EPAssessmentContext = {
    assessmentId,
    interviewResponses,
    photoAnalysisFindings: options?.photoFindings,
    incidentHistory: options?.incidentHistory,
    osintFindings: options?.osintFindings,
  };

  const results: EPAIAssessmentResponse[] = [];
  let aiSuccessCount = 0;
  let algorithmicFallbackCount = 0;

  // Process each EP threat
  for (const threat of EP_THREATS) {
    const request: EPThreatAssessmentRequest = {
      threatId: threat.id,
      threatName: threat.name,
      threatCategory: threat.category,
      context,
    };

    try {
      if (useAI) {
        // Attempt AI assessment
        const aiResult = await assessEPThreatWithAI(request);
        results.push(aiResult);
        aiSuccessCount++;
      } else {
        // Use algorithmic only
        const algoResult = assessEPThreatAlgorithmically(threat.id, context);
        results.push(algoResult);
        algorithmicFallbackCount++;
      }
    } catch (error) {
      console.error(`AI assessment failed for ${threat.id}, using fallback:`, error);
      
      // Fallback to algorithmic
      try {
        const algoResult = assessEPThreatAlgorithmically(threat.id, context);
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

  // Calculate overall exposure (average across threats or from interview data)
  const overallExposure = calculateExposureFactor(interviewResponses);

  // Store results in database
  const riskScenarioIds: number[] = [];
  for (const result of results) {
    try {
      const threat = EP_THREATS.find(t => t.id === result.threatId);
      
      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId,
        threatId: threat?.dbId || 0, // Assuming EP_THREATS has dbId mapping
        threatLikelihood: result.threatLikelihood.score,
        vulnerability: result.vulnerability.score,
        impact: result.impact.score,
        exposure: Math.round(result.exposure.score * 10) / 10, // Round to 1 decimal
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
          exposure: result.exposure,
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
    overallExposure,
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
export async function assessSingleEPThreat(
  threatId: string,
  interviewResponses: InterviewResponses,
  options?: { useAI?: boolean }
): Promise<EPAIAssessmentResponse> {
  const threat = EP_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const context: EPAssessmentContext = {
    assessmentId: 0,
    interviewResponses,
  };

  const request: EPThreatAssessmentRequest = {
    threatId,
    threatName: threat.name,
    threatCategory: threat.category,
    context,
  };

  if (options?.useAI === false) {
    return assessEPThreatAlgorithmically(threatId, context);
  }

  try {
    return await assessEPThreatWithAI(request);
  } catch (error) {
    console.error(`AI assessment failed, using fallback:`, error);
    return assessEPThreatAlgorithmically(threatId, context);
  }
}

/**
 * Generate narrative summary for EP assessment (calls GPT-4)
 */
export async function generateEPNarrativeSummary(
  results: EPAIAssessmentResponse[],
  context: EPAssessmentContext
): Promise<string> {
  const topRisks = [...results]
    .sort((a, b) => b.inherentRisk.normalizedScore - a.inherentRisk.normalizedScore)
    .slice(0, 5);

  const prompt = `Generate a professional executive summary (300-500 words) for this executive protection risk assessment.

## ASSESSMENT RESULTS

Total Threats Assessed: ${results.length}
Critical Risks: ${results.filter(r => r.inherentRisk.classification === 'critical').length}
High Risks: ${results.filter(r => r.inherentRisk.classification === 'high').length}
Medium Risks: ${results.filter(r => r.inherentRisk.classification === 'medium').length}
Low Risks: ${results.filter(r => r.inherentRisk.classification === 'low').length}

Overall Exposure Factor: ${calculateExposureFactor(context.interviewResponses).toFixed(1)} / 5.0

## TOP RISK SCENARIOS

${topRisks.map(r => `- ${EP_THREATS.find(t => t.id === r.threatId)?.name}: T=${r.threatLikelihood.score}, V=${r.vulnerability.score}, I=${r.impact.score}, E=${r.exposure.score.toFixed(1)} → Score: ${r.inherentRisk.normalizedScore.toFixed(1)}/100 (${r.inherentRisk.classification.toUpperCase()})`).join('\n')}

## KEY EVIDENCE

${topRisks.slice(0, 3).map(r => `${EP_THREATS.find(t => t.id === r.threatId)?.name}:
- ${r.threatLikelihood.evidence.slice(0, 2).join('\n- ')}`).join('\n\n')}

Write in a professional tone suitable for presentation to the principal and their family. Focus on actionable insights rather than technical details.`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a senior executive protection consultant preparing a risk assessment summary for a high-net-worth client. Write professionally, concisely, and focus on actionable recommendations.' 
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
// EXPORTS
// ============================================================================

export {
  EP_SYSTEM_PROMPT,
  EP_INDUSTRY_STANDARDS,
  assessEPThreatWithAI,
  assessEPThreatAlgorithmically,
  buildEPProfileContext,
  buildEPSecurityPostureContext,
  generateEPThreatAssessmentPrompt,
};
