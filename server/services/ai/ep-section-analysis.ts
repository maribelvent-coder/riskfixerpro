/**
 * RiskFixer EP Section Analysis Service
 * 
 * AI-powered analysis of physical security sections to generate:
 * - Risk score (1-10) for each section
 * - Plain-language findings and gap descriptions
 * - Evidence-based vulnerability assessment
 * 
 * This bridges the gap between raw Q&A data and scenario narratives,
 * providing the "what we found" that scenarios use to explain "how it can hurt you"
 * 
 * @author RiskFixer Team
 * @version 1.0
 */

import OpenAI from 'openai';
import { getResponseValue, getResponseBool } from '../ep-interview-mapper-v2';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 2000,
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface SectionAnalysisInput {
  sectionId: string;
  sectionName: string;
  questions: {
    questionId: string;
    questionText: string;
    answer: string | null;
    expectedGoodAnswers?: string[];
  }[];
}

export interface SectionFinding {
  type: 'gap' | 'concern' | 'strength';
  severity: 'critical' | 'high' | 'medium' | 'low';
  finding: string;
  questionId: string;
  evidence: string;
}

export interface SectionAnalysisResult {
  sectionId: string;
  sectionName: string;
  riskScore: number; // 1-10
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  findings: SectionFinding[];
  recommendations: string[];
  answeredCount: number;
  totalQuestions: number;
  completionPercentage: number;
  analyzedAt: string;
}

export interface FullSectionAnalysis {
  assessmentId: string;
  analyzedAt: string;
  sections: SectionAnalysisResult[];
  overallResidentialRisk: number;
  criticalGapsCount: number;
  highGapsCount: number;
}

// ============================================================================
// SECTION DEFINITIONS WITH QUESTION DETAILS
// ============================================================================

export const SECTION_QUESTION_DETAILS: Record<string, {
  sectionName: string;
  questions: { id: string; text: string; goodAnswers: string[] }[];
}> = {
  res_property: {
    sectionName: 'Property Profile',
    questions: [
      { id: 'res_property_type', text: 'What type of property is the residence?', goodAnswers: ['single_family', 'estate'] },
      { id: 'res_neighborhood_type', text: 'What type of neighborhood?', goodAnswers: ['gated_community', 'suburban', 'rural'] },
      { id: 'res_crime_score', text: 'What is the area crime level?', goodAnswers: ['low', 'very_low'] },
      { id: 'res_incident_history', text: 'Any prior security incidents at property?', goodAnswers: ['no', 'none'] },
      { id: 'res_incident_details', text: 'Details of any incidents', goodAnswers: [] },
      { id: 'res_police_response', text: 'Police response time to area?', goodAnswers: ['under_5_min', '5_10_min'] },
      { id: 'res_visibility', text: 'Property visibility from public areas?', goodAnswers: ['low', 'hidden', 'private'] },
    ],
  },
  res_perimeter: {
    sectionName: 'Perimeter Security',
    questions: [
      { id: 'res_fence_type', text: 'What type of perimeter fencing?', goodAnswers: ['iron', 'steel', 'masonry', 'concrete', 'security'] },
      { id: 'res_fence_condition', text: 'Condition of fencing?', goodAnswers: ['good', 'excellent'] },
      { id: 'res_gate_type', text: 'Type of entry gate?', goodAnswers: ['automatic', 'electric', 'security'] },
      { id: 'res_gate_access_method', text: 'Gate access control method?', goodAnswers: ['keypad', 'card', 'biometric', 'intercom'] },
      { id: 'res_boundary_defined', text: 'Is property boundary clearly defined?', goodAnswers: ['yes'] },
      { id: 'res_perimeter_detection', text: 'Perimeter intrusion detection?', goodAnswers: ['yes', 'motion', 'sensors'] },
      { id: 'res_warning_signs', text: 'Security warning signs posted?', goodAnswers: ['yes'] },
      { id: 'res_clear_zone', text: 'Clear zone around perimeter?', goodAnswers: ['yes'] },
      { id: 'res_address_visible', text: 'Address visible from street?', goodAnswers: ['no', 'hidden'] },
    ],
  },
  res_access: {
    sectionName: 'Access Control (Doors)',
    questions: [
      { id: 'res_front_door_material', text: 'Front door material?', goodAnswers: ['solid_wood', 'steel', 'fiberglass', 'reinforced'] },
      { id: 'res_front_lock_type', text: 'Type of front door locks?', goodAnswers: ['deadbolt', 'smart_lock', 'multi_point'] },
      { id: 'res_deadbolt_throw', text: 'Deadbolt throw length?', goodAnswers: ['1_inch', 'over_1_inch'] },
      { id: 'res_strike_plate', text: 'Reinforced strike plates installed?', goodAnswers: ['yes'] },
      { id: 'res_door_frame', text: 'Door frame reinforced?', goodAnswers: ['yes', 'reinforced', 'steel'] },
      { id: 'res_door_viewer', text: 'Door viewer/peephole installed?', goodAnswers: ['yes', 'wide_angle', 'digital'] },
      { id: 'res_door_glass_access', text: 'Glass near door locks accessible?', goodAnswers: ['no', 'reinforced'] },
      { id: 'res_door_count', text: 'Number of exterior doors?', goodAnswers: [] },
    ],
  },
  res_alarms: {
    sectionName: 'Alarm Systems',
    questions: [
      { id: 'res_alarm_installed', text: 'Alarm system installed?', goodAnswers: ['yes'] },
      { id: 'res_alarm_usage', text: 'How often is alarm used?', goodAnswers: ['always', 'regularly', 'daily'] },
      { id: 'res_alarm_sensors', text: 'Types of alarm sensors?', goodAnswers: ['motion', 'door', 'window', 'glass_break', 'multiple'] },
      { id: 'res_sensor_coverage', text: 'Sensor coverage adequate?', goodAnswers: ['yes', 'complete', 'comprehensive'] },
      { id: 'res_alarm_tested', text: 'Alarm system regularly tested?', goodAnswers: ['yes', 'monthly', 'quarterly'] },
      { id: 'res_alarm_backup', text: 'Alarm has backup power?', goodAnswers: ['yes', 'battery', 'cellular'] },
      { id: 'res_panel_location', text: 'Alarm panel location secure?', goodAnswers: ['yes', 'hidden', 'locked'] },
    ],
  },
  res_surveillance: {
    sectionName: 'Surveillance Systems',
    questions: [
      { id: 'res_cctv_installed', text: 'CCTV/cameras installed?', goodAnswers: ['yes'] },
      { id: 'res_camera_coverage', text: 'Camera coverage areas?', goodAnswers: ['perimeter', 'entrances', 'comprehensive', 'all_areas'] },
      { id: 'res_night_vision', text: 'Cameras have night vision?', goodAnswers: ['yes', 'infrared', 'ir'] },
      { id: 'res_video_retention', text: 'Video retention period?', goodAnswers: ['30_days', '60_days', '90_days', 'cloud'] },
      { id: 'res_remote_view', text: 'Remote viewing capability?', goodAnswers: ['yes', 'mobile', 'app'] },
      { id: 'res_camera_protected', text: 'Cameras protected from tampering?', goodAnswers: ['yes', 'vandal_proof', 'secured'] },
    ],
  },
  res_lighting: {
    sectionName: 'Lighting Security',
    questions: [
      { id: 'res_perimeter_lighting', text: 'Perimeter lighting installed?', goodAnswers: ['yes', 'adequate', 'comprehensive'] },
      { id: 'res_entry_lighting', text: 'Entry points well lit?', goodAnswers: ['yes'] },
      { id: 'res_driveway_lighting', text: 'Driveway lighting adequate?', goodAnswers: ['yes'] },
      { id: 'res_lighting_type', text: 'Type of security lighting?', goodAnswers: ['motion', 'led', 'timed', 'smart'] },
      { id: 'res_lights_backup', text: 'Lighting has backup power?', goodAnswers: ['yes', 'solar', 'battery'] },
      { id: 'res_lights_protected', text: 'Lights protected from tampering?', goodAnswers: ['yes', 'high', 'secured'] },
    ],
  },
  res_interior: {
    sectionName: 'Interior Security',
    questions: [
      { id: 'res_safe', text: 'Secure safe installed?', goodAnswers: ['yes', 'fireproof', 'bolted'] },
      { id: 'res_firearm_storage', text: 'Firearms properly secured?', goodAnswers: ['yes', 'gun_safe', 'locked', 'n/a'] },
      { id: 'res_valuables_visible', text: 'Valuables visible from outside?', goodAnswers: ['no', 'hidden'] },
      { id: 'res_bedroom_door', text: 'Master bedroom door reinforced?', goodAnswers: ['yes', 'solid', 'lockable'] },
      { id: 'res_smart_home', text: 'Smart home system installed?', goodAnswers: ['yes'] },
      { id: 'res_smart_security', text: 'Smart devices security configured?', goodAnswers: ['yes', 'secured', 'configured'] },
    ],
  },
  res_windows: {
    sectionName: 'Windows & Glass',
    questions: [
      { id: 'res_window_locks', text: 'Windows have functioning locks?', goodAnswers: ['yes', 'all'] },
      { id: 'res_window_lock_type', text: 'Type of window locks?', goodAnswers: ['keyed', 'pin', 'security'] },
      { id: 'res_security_film', text: 'Security film on windows?', goodAnswers: ['yes'] },
      { id: 'res_window_bars', text: 'Window bars or grilles?', goodAnswers: ['yes', 'decorative_security'] },
      { id: 'res_sliding_door', text: 'Sliding doors secured?', goodAnswers: ['yes', 'bar', 'pin', 'sensor'] },
    ],
  },
  res_landscaping: {
    sectionName: 'Landscaping & CPTED',
    questions: [
      { id: 'res_concealment_vegetation', text: 'Vegetation provides concealment?', goodAnswers: ['no', 'minimal', 'trimmed'] },
      { id: 'res_tree_access', text: 'Trees provide access to upper floors?', goodAnswers: ['no'] },
      { id: 'res_climbing_aids', text: 'Climbing aids present (trellises, etc)?', goodAnswers: ['no', 'removed'] },
      { id: 'res_defensive_landscaping', text: 'Defensive landscaping (thorny bushes)?', goodAnswers: ['yes'] },
      { id: 'res_street_sightline', text: 'Clear sightlines from street?', goodAnswers: ['yes', 'good_visibility'] },
    ],
  },
  res_vehicles: {
    sectionName: 'Vehicle Security',
    questions: [
      { id: 'res_vehicle_parking', text: 'Where are vehicles parked?', goodAnswers: ['garage', 'enclosed', 'secure'] },
      { id: 'res_garage_type', text: 'Type of garage?', goodAnswers: ['attached', 'enclosed'] },
      { id: 'res_garage_opener', text: 'Garage door opener type?', goodAnswers: ['smart', 'rolling_code', 'secured'] },
      { id: 'res_garage_interior_door', text: 'Interior garage door secured?', goodAnswers: ['yes', 'locked', 'reinforced'] },
      { id: 'res_garage_windows', text: 'Garage windows secured?', goodAnswers: ['yes', 'no_windows', 'covered'] },
      { id: 'res_emergency_release', text: 'Garage emergency release secured?', goodAnswers: ['yes', 'shielded'] },
    ],
  },
  res_saferoom: {
    sectionName: 'Safe Room & Emergency',
    questions: [
      { id: 'res_safe_room', text: 'Safe room/panic room available?', goodAnswers: ['yes'] },
      { id: 'res_safe_room_comms', text: 'Safe room has communications?', goodAnswers: ['yes', 'phone', 'radio', 'cellular'] },
      { id: 'res_emergency_supplies', text: 'Emergency supplies stored?', goodAnswers: ['yes'] },
      { id: 'res_smoke_co', text: 'Smoke/CO detectors installed?', goodAnswers: ['yes', 'all_floors'] },
      { id: 'res_emergency_plan', text: 'Emergency response plan documented?', goodAnswers: ['yes', 'practiced'] },
    ],
  },
  res_monitoring: {
    sectionName: 'Monitoring & Response',
    questions: [
      { id: 'res_monitoring_level', text: 'Monitoring service level?', goodAnswers: ['professional', '24_7', 'central_station'] },
      { id: 'res_emergency_contacts', text: 'Emergency contacts documented?', goodAnswers: ['yes'] },
      { id: 'res_duress_code', text: 'Duress code established?', goodAnswers: ['yes'] },
      { id: 'res_security_training', text: 'Household security training?', goodAnswers: ['yes', 'regular'] },
      { id: 'res_perceived_security', text: 'Overall perceived security level?', goodAnswers: ['high', 'very_high', 'excellent'] },
    ],
  },
};

// ============================================================================
// AI SECTION ANALYSIS
// ============================================================================

function buildSectionPrompt(section: SectionAnalysisInput): string {
  const qaList = section.questions
    .map(q => {
      const answer = q.answer || 'Not answered';
      return `- ${q.questionText}\n  Answer: ${answer}`;
    })
    .join('\n');

  return `You are a physical security expert analyzing a residential security assessment section.

SECTION: ${section.sectionName}

QUESTIONS AND ANSWERS:
${qaList}

Analyze this section and provide a JSON response with:
1. riskScore: 1-10 (1=excellent security, 10=critical vulnerabilities)
2. riskLevel: "low" | "medium" | "high" | "critical"
3. summary: 1-2 sentence overview of this section's security posture
4. findings: Array of specific findings, each with:
   - type: "gap" | "concern" | "strength"
   - severity: "critical" | "high" | "medium" | "low"
   - finding: Plain language description
   - questionId: The question this relates to
   - evidence: The answer that led to this finding
5. recommendations: Array of 1-3 actionable recommendations

Be specific and evidence-based. Reference actual answers. For unanswered questions, note them as data gaps.

Respond ONLY with valid JSON, no markdown.`;
}

export async function analyzeSingleSection(
  sectionId: string,
  responses: Record<string, any>
): Promise<SectionAnalysisResult | null> {
  const sectionDef = SECTION_QUESTION_DETAILS[sectionId];
  if (!sectionDef) {
    console.error(`Unknown section: ${sectionId}`);
    return null;
  }

  // Build question list with answers
  const questions = sectionDef.questions.map(q => ({
    questionId: q.id,
    questionText: q.text,
    answer: getResponseValue(responses[q.id]) || null,
    expectedGoodAnswers: q.goodAnswers,
  }));

  const answeredCount = questions.filter(q => q.answer !== null).length;
  const totalQuestions = questions.length;

  const input: SectionAnalysisInput = {
    sectionId,
    sectionName: sectionDef.sectionName,
    questions,
  };

  try {
    const prompt = buildSectionPrompt(input);
    
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
      messages: [
        {
          role: 'system',
          content: 'You are a physical security assessment expert. Analyze security findings and provide structured risk assessments. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON response
    const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiResult = JSON.parse(cleanedResponse);

    return {
      sectionId,
      sectionName: sectionDef.sectionName,
      riskScore: aiResult.riskScore || 5,
      riskLevel: aiResult.riskLevel || 'medium',
      summary: aiResult.summary || 'Analysis completed.',
      findings: (aiResult.findings || []).map((f: any) => ({
        type: f.type || 'concern',
        severity: f.severity || 'medium',
        finding: f.finding || '',
        questionId: f.questionId || '',
        evidence: f.evidence || '',
      })),
      recommendations: aiResult.recommendations || [],
      answeredCount,
      totalQuestions,
      completionPercentage: Math.round((answeredCount / totalQuestions) * 100),
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`AI analysis failed for section ${sectionId}:`, error);
    
    // Fallback: generate basic analysis from responses
    return generateFallbackAnalysis(sectionId, sectionDef, questions, answeredCount, totalQuestions);
  }
}

function generateFallbackAnalysis(
  sectionId: string,
  sectionDef: typeof SECTION_QUESTION_DETAILS[string],
  questions: { questionId: string; questionText: string; answer: string | null; expectedGoodAnswers: string[] }[],
  answeredCount: number,
  totalQuestions: number
): SectionAnalysisResult {
  const findings: SectionFinding[] = [];
  let riskScore = 5;

  // Check each question against expected good answers
  for (const q of questions) {
    if (!q.answer) {
      findings.push({
        type: 'concern',
        severity: 'medium',
        finding: `${q.questionText} - Not assessed`,
        questionId: q.questionId,
        evidence: 'No response provided',
      });
      continue;
    }

    const answerLower = q.answer.toLowerCase();
    const isGoodAnswer = q.expectedGoodAnswers.some(good => 
      answerLower.includes(good.toLowerCase())
    );

    if (isGoodAnswer) {
      findings.push({
        type: 'strength',
        severity: 'low',
        finding: `${q.questionText} - Adequate`,
        questionId: q.questionId,
        evidence: q.answer,
      });
    } else if (answerLower === 'no' || answerLower === 'none' || answerLower.includes('not ')) {
      findings.push({
        type: 'gap',
        severity: 'high',
        finding: `${q.questionText} - Security gap identified`,
        questionId: q.questionId,
        evidence: q.answer,
      });
      riskScore = Math.min(10, riskScore + 1);
    } else {
      findings.push({
        type: 'concern',
        severity: 'medium',
        finding: `${q.questionText} - Requires review`,
        questionId: q.questionId,
        evidence: q.answer,
      });
    }
  }

  const gapCount = findings.filter(f => f.type === 'gap').length;
  const riskLevel = riskScore >= 8 ? 'critical' : riskScore >= 6 ? 'high' : riskScore >= 4 ? 'medium' : 'low';

  return {
    sectionId,
    sectionName: sectionDef.sectionName,
    riskScore,
    riskLevel,
    summary: `${sectionDef.sectionName} analysis: ${gapCount} security gaps identified out of ${totalQuestions} assessed areas.`,
    findings,
    recommendations: gapCount > 0 
      ? [`Address ${gapCount} identified security gaps in ${sectionDef.sectionName}`]
      : [`Maintain current security posture in ${sectionDef.sectionName}`],
    answeredCount,
    totalQuestions,
    completionPercentage: Math.round((answeredCount / totalQuestions) * 100),
    analyzedAt: new Date().toISOString(),
  };
}

export async function analyzeAllSections(
  assessmentId: string,
  responses: Record<string, any>
): Promise<FullSectionAnalysis> {
  const sectionIds = Object.keys(SECTION_QUESTION_DETAILS);
  
  // Analyze all sections in parallel
  const analysisPromises = sectionIds.map(id => analyzeSingleSection(id, responses));
  const results = await Promise.all(analysisPromises);
  
  const sections = results.filter((r): r is SectionAnalysisResult => r !== null);
  
  // Calculate overall metrics
  const criticalGapsCount = sections.reduce((sum, s) => 
    sum + s.findings.filter(f => f.type === 'gap' && f.severity === 'critical').length, 0
  );
  const highGapsCount = sections.reduce((sum, s) => 
    sum + s.findings.filter(f => f.type === 'gap' && f.severity === 'high').length, 0
  );
  
  const overallRiskScores = sections.map(s => s.riskScore);
  const overallResidentialRisk = overallRiskScores.length > 0
    ? Math.round(overallRiskScores.reduce((a, b) => a + b, 0) / overallRiskScores.length * 10) // Scale to 0-100
    : 50;

  return {
    assessmentId,
    analyzedAt: new Date().toISOString(),
    sections,
    overallResidentialRisk,
    criticalGapsCount,
    highGapsCount,
  };
}
