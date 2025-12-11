/**
 * RiskFixer Executive Protection AI Risk Assessment Engine
 * 
 * 6-LAYER AI FRAMEWORK IMPLEMENTATION:
 * 
 * Layer 1 - DATA COLLECTION
 *   Interview responses & observations (ep-interview-mapper-v2.ts)
 *   Principal profile, context tags, risk signals extracted
 * 
 * Layer 2 - METHODOLOGY FRAMEWORK
 *   Executive Protection T×V×I×E Formula:
 *   - T (Threat Likelihood): 1-10 scale
 *   - V (Vulnerability): 1-10 scale  
 *   - I (Impact): 1-10 scale
 *   - E (Exposure Factor): 1-5 scale (unique to EP)
 *   Risk Score = (T × V × I × E) normalized to 0-100
 * 
 * Layer 3 - INDUSTRY STANDARDS
 *   ASIS International guidelines, CPP certification standards,
 *   EP industry best practices integrated into AI prompts
 * 
 * Layer 4 - THREAT INTELLIGENCE
 *   12 EP-specific threats (kidnapping, stalking, home invasion, etc.)
 *   Context-aware threat likelihood based on principal profile
 * 
 * Layer 5 - CONTROL MAPPING
 *   Gap analysis comparing existing controls to required protections
 *   Priority controls mapped to specific threats with rationale
 * 
 * Layer 6 - QUANTIFIED SCORING & OUTPUT
 *   Evidence-based risk scores with confidence levels
 *   Prioritized recommendations with implementation guidance
 * 
 * DESIGN PHILOSOPHY:
 * - Evidence-based: Every score cites specific interview findings
 * - EP-specific: Focuses on principal protection, not facility security
 * - Conservative: Score toward higher risk when ambiguous
 * - Auditable: Clear reasoning chain for each score
 * - Fallback: Algorithmic calculation if AI unavailable
 * 
 * @author RiskFixer Team
 * @version 2.0
 * @see RiskFixer-Architecture-Alignment-MVP.md
 */

import OpenAI from 'openai';
import type { EPMapperOutput, RiskSignal, ContextTags, PrincipalProfile } from './ep-interview-mapper-v2';
import { db } from '../db';
import { controlLibrary } from '@shared/schema';
import { ilike, or } from 'drizzle-orm';

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
  temperature: 0.3,
  maxTokens: 4000,
  retryAttempts: 2,
  timeoutMs: 30000,
};

// EP-specific threat categories
export const EP_THREATS = [
  { id: 'kidnapping_abduction', name: 'Kidnapping/Abduction', category: 'personal_safety', baseWeight: 1.5 },
  { id: 'stalking_surveillance', name: 'Stalking/Surveillance', category: 'personal_safety', baseWeight: 1.2 },
  { id: 'home_invasion', name: 'Home Invasion', category: 'residential', baseWeight: 1.3 },
  { id: 'workplace_violence', name: 'Workplace Violence', category: 'workplace', baseWeight: 1.1 },
  { id: 'travel_incident', name: 'Travel Security Incident', category: 'travel', baseWeight: 1.2 },
  { id: 'cyber_targeting', name: 'Cyber Targeting/Doxxing', category: 'digital', baseWeight: 1.0 },
  { id: 'extortion_blackmail', name: 'Extortion/Blackmail', category: 'financial', baseWeight: 1.3 },
  { id: 'physical_assault', name: 'Physical Assault', category: 'personal_safety', baseWeight: 1.4 },
  { id: 'family_targeting', name: 'Family Member Targeting', category: 'family', baseWeight: 1.5 },
  { id: 'reputational_attack', name: 'Reputational Attack', category: 'reputation', baseWeight: 0.9 },
  { id: 'vehicle_attack', name: 'Vehicle Attack/Ambush', category: 'travel', baseWeight: 1.4 },
  { id: 'social_engineering', name: 'Social Engineering', category: 'digital', baseWeight: 1.0 },
];

export interface EPAssessmentContext {
  assessmentId: string;
  mapperOutput: EPMapperOutput;
  crimeData?: EPCrimeContext;
  incidentHistory?: EPIncidentRecord[];
}

export interface EPCrimeContext {
  localCrimeIndex?: number;
  regionalCrimeIndex?: number;
  violentCrimeRate?: number;
  propertyCrimeRate?: number;
  kidnappingIncidents?: number;
  homeInvasionRate?: number;
}

export interface EPIncidentRecord {
  date: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface EPThreatScore {
  threatId: string;
  threatName: string;
  category: string;
  
  threatLikelihood: {
    score: number;
    label: string;
    evidence: string[];
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  
  vulnerability: {
    score: number;
    label: string;
    controlGaps: string[];
    existingControls: string[];
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  
  impact: {
    score: number;
    label: string;
    personalImpact: string;
    familyImpact: string;
    financialImpact: string;
    reputationalImpact: string;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  
  exposureFactor: {
    score: number;
    label: string;
    publicProfileContribution: number;
    digitalFootprintContribution: number;
    travelContribution: number;
    wealthContribution: number;
    reasoning: string;
  };
  
  riskScore: {
    raw: number;
    normalized: number;
    classification: 'critical' | 'high' | 'medium' | 'low';
  };
  
  priorityControls: {
    controlId: string;
    controlName: string;
    urgency: 'immediate' | 'short_term' | 'medium_term';
    rationale: string;
    estimatedCostRange?: string;
  }[];
  
  scenarioDescription: string;
  evidenceTrail: string[];
}

export interface EPDashboardOutput {
  assessmentId: string;
  generatedAt: string;
  mode: 'ai' | 'algorithmic' | 'hybrid';
  aiConfidence: 'high' | 'medium' | 'low' | 'fallback';
  processingTimeMs: number;
  
  overviewMetrics: {
    overallRiskScore: number;
    riskClassification: 'critical' | 'high' | 'medium' | 'low';
    exposureFactor: number;
    threatCount: number;
    criticalThreats: number;
    highThreats: number;
    interviewCompletion: number;
    activeControls: number;
    controlGaps: number;
  };
  
  principalSummary: {
    name: string | null;
    publicExposure: string | null;
    travelRisk: string | null;
    familyExposure: string | null;
    digitalRisk: string | null;
    currentProtectionLevel: string;
  };
  
  threatMatrix: EPThreatScore[];
  
  topRiskSignals: RiskSignal[];
  
  prioritizedControls: {
    controlId: string;
    controlName: string;
    category: string;
    urgency: 'immediate' | 'short_term' | 'medium_term';
    addressesThreats: string[];
    rationale: string;
    estimatedCost?: string;
    implementationDifficulty: 'easy' | 'moderate' | 'complex';
  }[];
  
  completionGaps: {
    section: string;
    missingQuestions: string[];
    impactOnAssessment: string;
  }[];
  
  nextSteps: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
  }[];
  
  sectionAssessments?: {
    sectionId: string;
    sectionName: string;
    riskIndicators: number;
    totalQuestions: number;
    keyFindings: string[];
    aiNarrative: string;
  }[];
  
  controlStatus?: {
    category: string;
    implemented: number;
    inProgress: number;
    recommended: number;
    total: number;
  }[];
}

const EP_SYSTEM_PROMPT = `You are a CPP-certified (Certified Protection Professional) executive protection specialist conducting a formal threat assessment for a high-net-worth individual or public figure. Your role is to assess personal security threats using the T×V×I×E framework unique to executive protection.

Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview data provided. Never assume facts not in evidence. If data is missing, note it as a data gap.

2. EP-METHODOLOGY: Follow the Executive Protection T×V×I×E framework where:
   - T (Threat Likelihood): 1-10 scale, probability of threat actor targeting this principal
   - V (Vulnerability): 1-10 scale, gaps in current protective measures
   - I (Impact): 1-10 scale, consequence severity if threat materializes
   - E (Exposure Factor): 1-5 scale, public visibility and accessibility multiplier
   - Risk Score = (T × V × I × E) / 50, normalized to 0-100

3. PRINCIPAL-CENTRIC: Executive protection focuses on:
   - Personal safety of the principal and family
   - 360-degree protection across all domains (home, travel, work, digital)
   - Proactive threat identification and mitigation
   - Lifestyle integration (security that doesn't impede life)
   - Family member protection as extension of principal security

4. THREAT ACTOR FOCUS: Consider who might target the principal:
   - Obsessed individuals (stalkers, fixated persons)
   - Criminal enterprises (kidnapping, extortion)
   - Disgruntled former employees or business adversaries
   - Activists targeting the principal's industry or positions
   - Opportunistic criminals attracted by visible wealth

5. CONSERVATIVE SCORING: When evidence is ambiguous, score toward higher risk. Executive protection errs on the side of caution.

6. CONTROL SELECTION: When recommending controls, you MUST use ONLY the exact control names from the AVAILABLE CONTROLS list provided. Never invent control names.

SCORING GUIDE:
- Threat Likelihood (T): 1=Highly Unlikely, 3=Possible, 5=Likely, 7=Probable, 10=Almost Certain
- Vulnerability (V): 1=Fully Protected, 3=Adequate Controls, 5=Some Gaps, 7=Significant Gaps, 10=No Protection
- Impact (I): 1=Negligible, 3=Minor, 5=Moderate, 7=Major, 10=Catastrophic
- Exposure (E): 1=Private/Anonymous, 2=Low Profile, 3=Moderate Profile, 4=High Profile, 5=Celebrity/VIP

RISK CLASSIFICATION:
- Critical: 75-100 (Immediate action required)
- High: 50-74 (Urgent attention needed)
- Medium: 25-49 (Address in security program)
- Low: 0-24 (Monitor and maintain)

Respond in valid JSON format only.`;

// EP control categories for loading from database
const EP_CONTROL_CATEGORIES = [
  'Personal Protection',
  'Residential Security', 
  'Travel Security',
  'Digital/OSINT Countermeasures',
  'Family Protection',
  'Emergency Preparedness'
];

// Cache for EP controls to avoid repeated DB queries
let cachedEPControls: { id: string; name: string; estimatedCost: string | null; category: string }[] | null = null;

async function loadEPControls(): Promise<typeof cachedEPControls> {
  if (cachedEPControls) return cachedEPControls;
  
  try {
    const controls = await db.select({
      id: controlLibrary.id,
      name: controlLibrary.name,
      estimatedCost: controlLibrary.estimatedCost,
      category: controlLibrary.category,
    }).from(controlLibrary);
    
    // Filter to EP categories and deduplicate by name
    const epControls = controls.filter(c => c.category && EP_CONTROL_CATEGORIES.includes(c.category));
    const uniqueControls = new Map<string, typeof epControls[0]>();
    for (const c of epControls) {
      if (!uniqueControls.has(c.name)) {
        uniqueControls.set(c.name, c);
      }
    }
    
    cachedEPControls = Array.from(uniqueControls.values());
    console.log(`[EP-AI] Loaded ${cachedEPControls.length} unique EP controls from database`);
    return cachedEPControls;
  } catch (error) {
    console.error('[EP-AI] Failed to load EP controls:', error);
    return [];
  }
}

function formatControlsForPrompt(controls: NonNullable<typeof cachedEPControls>): string {
  if (!controls.length) return '';
  
  // Group by category
  const byCategory = new Map<string, typeof controls>();
  for (const c of controls) {
    const cat = c.category || 'Other';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(c);
  }
  
  let result = '\nAVAILABLE CONTROLS (use ONLY these exact names for recommendations):\n';
  for (const [category, catControls] of Array.from(byCategory.entries())) {
    result += `\n${category}:\n`;
    for (const c of catControls) {
      result += `- ${c.name} (${c.estimatedCost || 'Contact for quote'})\n`;
    }
  }
  return result;
}

function buildThreatAssessmentPrompt(
  threat: typeof EP_THREATS[0],
  context: EPAssessmentContext,
  availableControls: string = ''
): string {
  const { mapperOutput } = context;
  const { principalProfile, contextTags, riskSignals, validation } = mapperOutput;
  
  const relevantSignals = riskSignals.filter(
    s => s.affectedThreats.includes(threat.id) || s.affectedThreats.includes('all')
  );
  
  return `Assess the following threat for an executive protection principal:

THREAT: ${threat.name}
CATEGORY: ${threat.category}

PRINCIPAL PROFILE:
- Public Exposure Level: ${principalProfile.publicExposureLevel || 'Not specified'}
- Media Presence: ${principalProfile.mediaPresence || 'Not specified'}
- Net Worth Range: ${principalProfile.netWorthRange || 'Not specified'}
- Industry: ${principalProfile.industryCategory || 'Not specified'}
- Known Threats: ${principalProfile.hasKnownThreats ? 'YES - ACTIVE THREAT HISTORY' : 'No known threats'}
- Self-Rated Threat Perception: ${principalProfile.threatPerceptionSelfRated || 'Not provided'}/10
- Active Adversary: ${principalProfile.hasActiveAdversary ? 'YES' : 'No'}
- Adversary Type: ${principalProfile.adversaryType || 'N/A'}

FAMILY EXPOSURE:
- Family Composition: ${principalProfile.familyComposition.join(', ') || 'Not specified'}
- Dependents at Risk: ${principalProfile.dependentsAtRisk ? 'YES' : 'No'}
- Family Public Exposure: ${principalProfile.familyPublicExposure ? 'YES' : 'No'}

TRAVEL PROFILE:
- Travel Frequency: ${principalProfile.travelFrequency || 'Not specified'}
- International Travel: ${principalProfile.internationalTravel ? 'YES' : 'No'}
- High-Risk Destinations: ${principalProfile.highRiskDestinations.join(', ') || 'None specified'}

CURRENT SECURITY MEASURES:
- Protection Detail: ${principalProfile.hasProtectionDetail ? 'YES' : 'NO'}
- Secure Residence: ${principalProfile.hasSecureResidence ? 'YES' : 'NO'}
- Secure Transportation: ${principalProfile.hasSecureTransportation ? 'YES' : 'NO'}
- Other Measures: ${principalProfile.currentSecurityMeasures.join(', ') || 'None documented'}

CONTEXT FLAGS:
${Object.entries(contextTags)
  .filter(([_, value]) => value === true)
  .map(([key]) => `- ${key.replace(/([A-Z])/g, ' $1').replace('has ', '').trim()}`)
  .join('\n') || '- No critical flags'}

IDENTIFIED RISK SIGNALS FOR THIS THREAT:
${relevantSignals.length > 0 
  ? relevantSignals.map(s => `- [${s.severity.toUpperCase()}] ${s.signal}`).join('\n')
  : '- No specific risk signals identified'}

INTERVIEW COMPLETION: ${validation.completionPercentage}%
${validation.missingRequired.length > 0 
  ? `MISSING CRITICAL DATA: ${validation.missingRequired.join(', ')}`
  : 'All required questions answered'}

${context.crimeData ? `
CRIME DATA CONTEXT:
- Local Crime Index: ${context.crimeData.localCrimeIndex || 'N/A'}
- Regional Crime Index: ${context.crimeData.regionalCrimeIndex || 'N/A'}
- Violent Crime Rate: ${context.crimeData.violentCrimeRate || 'N/A'}
` : ''}
${availableControls}

IMPORTANT: For priorityControls, you MUST use ONLY the exact control names from the AVAILABLE CONTROLS list above. Copy the names exactly as shown.

Provide your assessment in the following JSON format:
{
  "threatLikelihood": {
    "score": <1-10>,
    "label": "<descriptive label>",
    "evidence": ["<specific finding 1>", "<specific finding 2>"],
    "reasoning": "<explanation of score>",
    "confidence": "<high|medium|low>"
  },
  "vulnerability": {
    "score": <1-10>,
    "label": "<descriptive label>",
    "controlGaps": ["<gap 1>", "<gap 2>"],
    "existingControls": ["<control 1>", "<control 2>"],
    "reasoning": "<explanation>",
    "confidence": "<high|medium|low>"
  },
  "impact": {
    "score": <1-10>,
    "label": "<descriptive label>",
    "personalImpact": "<description>",
    "familyImpact": "<description>",
    "financialImpact": "<description>",
    "reputationalImpact": "<description>",
    "reasoning": "<explanation>",
    "confidence": "<high|medium|low>"
  },
  "exposureFactor": {
    "score": <1-5>,
    "label": "<descriptive label>",
    "publicProfileContribution": <0.0-1.0>,
    "digitalFootprintContribution": <0.0-1.0>,
    "travelContribution": <0.0-1.0>,
    "wealthContribution": <0.0-1.0>,
    "reasoning": "<explanation>"
  },
  "priorityControls": [
    {
      "controlId": "<id>",
      "controlName": "<name>",
      "urgency": "<immediate|short_term|medium_term>",
      "rationale": "<why this control>",
      "estimatedCostRange": "<range>"
    }
  ],
  "scenarioDescription": "<2-3 sentence scenario description for reports>"
}`;
}

function calculateAlgorithmicScore(
  threat: typeof EP_THREATS[0],
  context: EPAssessmentContext
): EPThreatScore {
  const { mapperOutput } = context;
  const { principalProfile, contextTags, riskSignals } = mapperOutput;
  
  const relevantSignals = riskSignals.filter(
    s => s.affectedThreats.includes(threat.id) || s.affectedThreats.includes('all')
  );
  
  let threatScore = 3;
  let vulnerabilityScore = 5;
  let impactScore = 5;
  let exposureScore = 2;
  
  if (principalProfile.hasKnownThreats) threatScore += 3;
  if (principalProfile.hasActiveAdversary) threatScore += 2;
  if (contextTags.hasPriorIncidents) threatScore += 1;
  
  relevantSignals.forEach(signal => {
    if (signal.severity === 'critical_indicator') threatScore += 1;
    if (signal.category === 'vulnerability') vulnerabilityScore += 0.5;
    if (signal.category === 'exposure') exposureScore += 0.3;
  });
  
  if (!principalProfile.hasProtectionDetail) vulnerabilityScore += 2;
  if (!principalProfile.hasSecureResidence) vulnerabilityScore += 1;
  if (!principalProfile.hasSecureTransportation) vulnerabilityScore += 1;
  if (contextTags.hasPredictablePatterns) vulnerabilityScore += 1;
  
  if (principalProfile.netWorthRange?.includes('100m')) impactScore = 9;
  else if (principalProfile.netWorthRange?.includes('50m')) impactScore = 8;
  else if (principalProfile.netWorthRange?.includes('10m')) impactScore = 7;
  
  if (principalProfile.dependentsAtRisk) impactScore += 1;
  
  if (principalProfile.publicExposureLevel === 'extensive') exposureScore = 5;
  else if (principalProfile.publicExposureLevel === 'significant') exposureScore = 4;
  else if (principalProfile.publicExposureLevel === 'moderate') exposureScore = 3;
  
  if (contextTags.hasDigitalExposure) exposureScore += 0.5;
  if (contextTags.hasInternationalTravel) exposureScore += 0.5;
  
  threatScore = Math.min(10, Math.max(1, Math.round(threatScore)));
  vulnerabilityScore = Math.min(10, Math.max(1, Math.round(vulnerabilityScore)));
  impactScore = Math.min(10, Math.max(1, Math.round(impactScore)));
  exposureScore = Math.min(5, Math.max(1, Math.round(exposureScore)));
  
  const rawScore = (threatScore * vulnerabilityScore * impactScore * exposureScore);
  const normalizedScore = Math.min(100, Math.round((rawScore / 50) * (threat.baseWeight || 1)));
  
  let classification: 'critical' | 'high' | 'medium' | 'low';
  if (normalizedScore >= 75) classification = 'critical';
  else if (normalizedScore >= 50) classification = 'high';
  else if (normalizedScore >= 25) classification = 'medium';
  else classification = 'low';
  
  const getScoreLabel = (score: number, scale: number): string => {
    const percent = score / scale;
    if (percent >= 0.8) return 'Very High';
    if (percent >= 0.6) return 'High';
    if (percent >= 0.4) return 'Moderate';
    if (percent >= 0.2) return 'Low';
    return 'Very Low';
  };
  
  return {
    threatId: threat.id,
    threatName: threat.name,
    category: threat.category,
    threatLikelihood: {
      score: threatScore,
      label: getScoreLabel(threatScore, 10),
      evidence: relevantSignals.map(s => s.signal).slice(0, 3),
      reasoning: 'Algorithmic calculation based on interview responses and risk signals',
      confidence: 'medium',
    },
    vulnerability: {
      score: vulnerabilityScore,
      label: getScoreLabel(vulnerabilityScore, 10),
      controlGaps: [
        ...(!principalProfile.hasProtectionDetail ? ['No protection detail'] : []),
        ...(!principalProfile.hasSecureResidence ? ['Residence not secured'] : []),
        ...(!principalProfile.hasSecureTransportation ? ['Transportation not secured'] : []),
      ],
      existingControls: principalProfile.currentSecurityMeasures.slice(0, 5),
      reasoning: 'Based on current security posture analysis',
      confidence: 'medium',
    },
    impact: {
      score: impactScore,
      label: getScoreLabel(impactScore, 10),
      personalImpact: 'Physical safety at risk',
      familyImpact: principalProfile.dependentsAtRisk ? 'Family members potentially affected' : 'Limited family exposure',
      financialImpact: `Based on ${principalProfile.netWorthRange || 'unknown'} net worth`,
      reputationalImpact: principalProfile.publicExposureLevel === 'extensive' ? 'High reputational stakes' : 'Moderate reputational impact',
      reasoning: 'Impact assessment based on principal profile',
      confidence: 'medium',
    },
    exposureFactor: {
      score: exposureScore,
      label: getScoreLabel(exposureScore, 5),
      publicProfileContribution: principalProfile.publicExposureLevel === 'extensive' ? 0.4 : 0.2,
      digitalFootprintContribution: contextTags.hasDigitalExposure ? 0.25 : 0.1,
      travelContribution: contextTags.hasInternationalTravel ? 0.2 : 0.1,
      wealthContribution: principalProfile.netWorthRange?.includes('m') ? 0.25 : 0.1,
      reasoning: 'Exposure based on visibility factors',
    },
    riskScore: {
      raw: rawScore,
      normalized: normalizedScore,
      classification,
    },
    priorityControls: [],
    scenarioDescription: `${threat.name} scenario for ${principalProfile.publicExposureLevel || 'moderate'} profile principal`,
    evidenceTrail: [`Algorithmic calculation: T(${threatScore}) × V(${vulnerabilityScore}) × I(${impactScore}) × E(${exposureScore}) = ${rawScore}`],
  };
}

async function assessThreatWithAI(
  threat: typeof EP_THREATS[0],
  context: EPAssessmentContext,
  availableControlsPrompt: string = ''
): Promise<EPThreatScore | null> {
  const openai = getOpenAI();
  if (!openai) return null;
  
  try {
    const prompt = buildThreatAssessmentPrompt(threat, context, availableControlsPrompt);
    
    // Debug: Log control prompt section
    if (threat.id === 'kidnapping') {
      console.log('[EP-AI DEBUG] Control prompt section (first 800 chars):', availableControlsPrompt.substring(0, 800));
    }
    
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { role: 'system', content: EP_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0].message.content;
    if (!content) return null;
    
    const aiResponse = JSON.parse(content);
    
    // Debug: Log what AI returned for controls
    if (threat.id === 'kidnapping') {
      console.log('[EP-AI DEBUG] AI returned controls:', JSON.stringify(aiResponse.priorityControls?.map((c: any) => c.controlName)));
    }
    
    const rawScore = aiResponse.threatLikelihood.score * 
                     aiResponse.vulnerability.score * 
                     aiResponse.impact.score * 
                     aiResponse.exposureFactor.score;
    const normalizedScore = Math.min(100, Math.round((rawScore / 50) * (threat.baseWeight || 1)));
    
    let classification: 'critical' | 'high' | 'medium' | 'low';
    if (normalizedScore >= 75) classification = 'critical';
    else if (normalizedScore >= 50) classification = 'high';
    else if (normalizedScore >= 25) classification = 'medium';
    else classification = 'low';
    
    return {
      threatId: threat.id,
      threatName: threat.name,
      category: threat.category,
      threatLikelihood: aiResponse.threatLikelihood,
      vulnerability: aiResponse.vulnerability,
      impact: aiResponse.impact,
      exposureFactor: aiResponse.exposureFactor,
      riskScore: {
        raw: rawScore,
        normalized: normalizedScore,
        classification,
      },
      priorityControls: aiResponse.priorityControls || [],
      scenarioDescription: aiResponse.scenarioDescription || `${threat.name} risk scenario`,
      evidenceTrail: [
        `AI Assessment (${AI_CONFIG.model})`,
        `T(${aiResponse.threatLikelihood.score}) × V(${aiResponse.vulnerability.score}) × I(${aiResponse.impact.score}) × E(${aiResponse.exposureFactor.score})`,
        `Confidence: T=${aiResponse.threatLikelihood.confidence}, V=${aiResponse.vulnerability.confidence}, I=${aiResponse.impact.confidence}`,
      ],
    };
  } catch (error) {
    console.error(`AI assessment failed for ${threat.id}:`, error);
    return null;
  }
}

export async function generateEPDashboard(
  context: EPAssessmentContext
): Promise<EPDashboardOutput> {
  const startTime = Date.now();
  const { mapperOutput } = context;
  const { principalProfile, contextTags, riskSignals, validation, sectionSummaries } = mapperOutput;
  
  console.log(`[EP-AI] Starting threat assessment for ${EP_THREATS.length} threats`);
  
  // Load EP controls from database for AI to choose from
  const epControls = await loadEPControls();
  const availableControlsPrompt = formatControlsForPrompt(epControls || []);
  console.log(`[EP-AI] Loaded ${epControls?.length || 0} controls for AI recommendations`);
  
  const threatScores: EPThreatScore[] = [];
  let aiSuccessCount = 0;
  
  // Process threats in parallel for speed (with fallback to algorithmic)
  const threatPromises = EP_THREATS.map(async (threat, index) => {
    console.log(`[EP-AI] Assessing threat ${index + 1}/${EP_THREATS.length}: ${threat.id}`);
    const aiScore = await assessThreatWithAI(threat, context, availableControlsPrompt);
    return { threat, aiScore };
  });
  
  const results = await Promise.all(threatPromises);
  
  for (const { threat, aiScore } of results) {
    if (aiScore) {
      threatScores.push(aiScore);
      aiSuccessCount++;
    } else {
      threatScores.push(calculateAlgorithmicScore(threat, context));
    }
  }
  
  console.log(`[EP-AI] Threat assessment complete: ${aiSuccessCount}/${EP_THREATS.length} AI successes, elapsed: ${Date.now() - startTime}ms`);
  
  const mode: 'ai' | 'algorithmic' | 'hybrid' = 
    aiSuccessCount === EP_THREATS.length ? 'ai' :
    aiSuccessCount === 0 ? 'algorithmic' : 'hybrid';
  
  const aiConfidence: 'high' | 'medium' | 'low' | 'fallback' =
    mode === 'algorithmic' ? 'fallback' :
    aiSuccessCount >= EP_THREATS.length * 0.8 ? 'high' :
    aiSuccessCount >= EP_THREATS.length * 0.5 ? 'medium' : 'low';
  
  const avgRiskScore = threatScores.reduce((sum, t) => sum + t.riskScore.normalized, 0) / threatScores.length;
  const criticalThreats = threatScores.filter(t => t.riskScore.classification === 'critical').length;
  const highThreats = threatScores.filter(t => t.riskScore.classification === 'high').length;
  
  const avgExposure = threatScores.reduce((sum, t) => sum + t.exposureFactor.score, 0) / threatScores.length;
  
  let overallClassification: 'critical' | 'high' | 'medium' | 'low';
  if (avgRiskScore >= 75 || criticalThreats > 0) overallClassification = 'critical';
  else if (avgRiskScore >= 50 || highThreats > 2) overallClassification = 'high';
  else if (avgRiskScore >= 25) overallClassification = 'medium';
  else overallClassification = 'low';
  
  const allControls = threatScores.flatMap(t => t.priorityControls);
  const controlMap = new Map<string, typeof allControls[0] & { addressesThreats: string[] }>();
  
  for (const score of threatScores) {
    for (const control of score.priorityControls) {
      const existing = controlMap.get(control.controlId);
      if (existing) {
        existing.addressesThreats.push(score.threatId);
      } else {
        controlMap.set(control.controlId, {
          ...control,
          addressesThreats: [score.threatId],
        });
      }
    }
  }
  
  const sortedControls = Array.from(controlMap.values())
    .sort((a, b) => {
      const urgencyOrder = { immediate: 0, short_term: 1, medium_term: 2 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return b.addressesThreats.length - a.addressesThreats.length;
    })
    .slice(0, 10)
    .map(c => ({
      ...c,
      category: 'executive_protection',
      implementationDifficulty: c.urgency === 'immediate' ? 'easy' as const : 
                                c.urgency === 'short_term' ? 'moderate' as const : 'complex' as const,
    }));

  // Create cost lookup map from already-loaded EP controls
  const costLookup = new Map<string, string>();
  if (epControls) {
    for (const c of epControls) {
      costLookup.set(c.name, c.estimatedCost || 'N/A');
      // Also store normalized version for fuzzy matching
      const normalizedName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      costLookup.set(normalizedName, c.estimatedCost || 'N/A');
    }
  }
  
  // Enrich controls with costs (should be exact match since AI uses exact names)
  const prioritizedControls = sortedControls.map(c => {
    // Try exact match first (AI should use exact names now)
    let cost = costLookup.get(c.controlName);
    if (!cost) {
      // Fallback to normalized match
      const normalizedName = c.controlName.toLowerCase().replace(/[^a-z0-9]/g, '');
      cost = costLookup.get(normalizedName);
    }
    return {
      ...c,
      estimatedCost: cost || 'Contact for quote',
    };
  });
  
  const completionGaps = sectionSummaries
    .filter(s => s.completionPercentage < 80)
    .map(s => ({
      section: s.sectionName,
      missingQuestions: [], 
      impactOnAssessment: s.completionPercentage < 50 
        ? 'Significant data gaps may affect assessment accuracy'
        : 'Some additional context may improve recommendations',
    }));
  
  const nextSteps: EPDashboardOutput['nextSteps'] = [];
  
  if (validation.completionPercentage < 80) {
    nextSteps.push({
      priority: 'high',
      action: 'Complete remaining interview questions',
      rationale: `Interview is ${validation.completionPercentage}% complete. Full data improves assessment accuracy.`,
    });
  }
  
  if (criticalThreats > 0) {
    nextSteps.push({
      priority: 'high',
      action: 'Address critical threat scenarios immediately',
      rationale: `${criticalThreats} critical threat(s) identified requiring urgent attention.`,
    });
  }
  
  if (!principalProfile.hasProtectionDetail && overallClassification !== 'low') {
    nextSteps.push({
      priority: 'high',
      action: 'Evaluate executive protection detail options',
      rationale: 'Current risk profile warrants dedicated protection resources.',
    });
  }
  
  if (prioritizedControls.some(c => c.urgency === 'immediate')) {
    nextSteps.push({
      priority: 'high',
      action: 'Implement immediate security controls',
      rationale: 'Several controls require urgent implementation to reduce risk.',
    });
  }
  
  const currentProtectionLevel = 
    principalProfile.hasProtectionDetail && principalProfile.hasSecureResidence && principalProfile.hasSecureTransportation
      ? 'Comprehensive'
      : principalProfile.hasProtectionDetail || principalProfile.hasSecureResidence
        ? 'Partial'
        : 'Minimal';
  
  return {
    assessmentId: context.assessmentId,
    generatedAt: new Date().toISOString(),
    mode,
    aiConfidence,
    processingTimeMs: Date.now() - startTime,
    
    overviewMetrics: {
      overallRiskScore: Math.round(avgRiskScore),
      riskClassification: overallClassification,
      exposureFactor: Math.round(avgExposure * 10) / 10,
      threatCount: threatScores.length,
      criticalThreats,
      highThreats,
      interviewCompletion: validation.completionPercentage,
      activeControls: principalProfile.currentSecurityMeasures.length,
      controlGaps: threatScores.reduce((sum, t) => sum + t.vulnerability.controlGaps.length, 0),
    },
    
    principalSummary: {
      name: mapperOutput.interviewData.responses.ep_principal_name || null,
      publicExposure: principalProfile.publicExposureLevel,
      travelRisk: principalProfile.travelFrequency,
      familyExposure: principalProfile.familyPublicExposure ? 'Exposed' : 'Protected',
      digitalRisk: contextTags.hasDigitalExposure ? 'High' : 'Moderate',
      currentProtectionLevel,
    },
    
    threatMatrix: threatScores.sort((a, b) => b.riskScore.normalized - a.riskScore.normalized),
    
    topRiskSignals: riskSignals
      .sort((a, b) => {
        const severityOrder = { critical_indicator: 0, concern: 1, indicator: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 8),
    
    prioritizedControls,
    completionGaps,
    nextSteps,
    
    // Section assessments from interview sections
    sectionAssessments: sectionSummaries.map(s => ({
      sectionId: s.sectionId,
      sectionName: s.sectionName,
      riskIndicators: s.riskSignals.length,
      totalQuestions: s.questionCount,
      keyFindings: s.riskSignals.slice(0, 3).map(sig => sig.signal),
      aiNarrative: s.completionPercentage >= 80 
        ? `${s.sectionName} assessment complete with ${s.riskSignals.length} risk indicator(s) identified.`
        : `${s.sectionName} is ${s.completionPercentage}% complete. Additional data may improve assessment.`,
    })),
    
    // Control implementation status by category - use DB controls as the full pool
    controlStatus: EP_CONTROL_CATEGORIES.map(category => {
      // Normalize to significant words (3+ chars)
      const getWords = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
      
      // Build word sets for EACH individual measure (not pooled)
      const existingMeasureWords = principalProfile.currentSecurityMeasures.map(m => new Set(getWords(m)));
      
      // Get controls from DB for this category
      const categoryDbControls = epControls?.filter(ec => ec.category === category) || [];
      
      // Count implemented: controls where a SINGLE measure satisfies word match threshold
      const implementedControls = new Set<string>();
      for (const dbControl of categoryDbControls) {
        const controlWords = getWords(dbControl.name);
        // Check each individual measure - require match from ONE measure only
        for (const measureWords of existingMeasureWords) {
          const matchCount = controlWords.filter(w => measureWords.has(w)).length;
          // Require 2+ matching words from the SAME measure (stricter matching)
          if (matchCount >= 2 || (controlWords.length === 1 && matchCount === 1)) {
            implementedControls.add(dbControl.name);
            break; // Found a match, move to next control
          }
        }
      }
      
      // Get unique recommended controls from ALL threat scenarios (not yet implemented)
      const recommendedControls = new Set<string>();
      for (const threat of threatScores) {
        for (const ctrl of threat.priorityControls) {
          const controlInfo = epControls?.find(ec => ec.name === ctrl.controlName);
          if (controlInfo?.category === category && !implementedControls.has(ctrl.controlName)) {
            recommendedControls.add(ctrl.controlName);
          }
        }
      }
      
      // Total = implemented + recommended (disjoint sets)
      const relevantTotal = implementedControls.size + recommendedControls.size;
      
      return {
        category,
        implemented: implementedControls.size,
        inProgress: 0, // Future: track in-progress controls separately
        recommended: recommendedControls.size,
        total: relevantTotal,
      };
    }).filter(cs => cs.total > 0)
  };
}

export async function getEPDashboardData(
  assessmentId: string,
  interviewResponses: Record<string, any>,
  attachments: any[] = []
): Promise<EPDashboardOutput | null> {
  try {
    console.log('[EP-AI] Loading ep-interview-mapper-v2...');
    const { prepareForAIEngine } = await import('./ep-interview-mapper-v2');
    console.log('[EP-AI] Preparing for AI engine...');
    const mapperOutput = prepareForAIEngine(
      parseInt(assessmentId) || 0,
      interviewResponses,
      attachments
    );
    console.log('[EP-AI] Mapper output ready, creating context...');
    
    const context: EPAssessmentContext = {
      assessmentId,
      mapperOutput,
    };
    
    console.log('[EP-AI] Calling generateEPDashboard...');
    const result = await generateEPDashboard(context);
    console.log('[EP-AI] Dashboard generation complete');
    return result;
    
  } catch (error) {
    console.error('[EP-AI] Error generating EP dashboard:', error);
    return null;
  }
}
