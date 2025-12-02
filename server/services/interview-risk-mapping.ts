/**
 * ID-Based Interview Risk Mapping Service (v3)
 * 
 * PROPER ID-BASED ARCHITECTURE:
 * - Queries question-threat and question-control mappings from database using IDs
 * - NO runtime name-matching (all linkages resolved at seed time)
 * - Fails fast if database relationships are missing
 * - Preserves validated T×V×I calculation logic from v2
 */
import { db } from '../db';
import {
  templateQuestions,
  questionThreatMap,
  questionControlMap,
  threatLibrary,
  controlLibrary
} from '../../shared/schema';
import { eq, inArray } from 'drizzle-orm';

// Response data structure (using database question IDs)
export interface InterviewResponseV3 {
  questionId: string; // Database UUID from template_questions.id
  questionCode: string; // Human-readable code like "1.1" for logging
  answer: string | number | boolean | null;
  notes?: string;
}

// Risk calculation result
export interface ThreatRiskScoreV3 {
  threatId: string;
  threatName: string;
  threatCategory: string;
  likelihood: number; // 1-5
  vulnerability: number; // 1-5
  impact: number; // 1-5
  inherentRisk: number; // L × V × I
  isCritical: boolean; // risk >= 50 or V >= 4
  findings: string[]; // High-risk findings
  recommendations: string[]; // Control recommendations
  affectedControls: Array<{ id: string; name: string; detected: boolean }>;
}

export interface RiskAnalysisResultV3 {
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  totalThreats: number;
  criticalThreats: number;
  threatScores: ThreatRiskScoreV3[];
  summary: string;
}

/**
 * Analyze interview responses using database ID linkages
 * 
 * @param templateId - Template identifier (e.g., "office-building")
 * @param responses - Interview responses array (will be converted to Map internally)
 * @returns Risk analysis with threat scores and recommendations
 */
export async function analyzeInterviewRisksV3(
  templateId: string,
  responses: InterviewResponseV3[]
): Promise<RiskAnalysisResultV3> {
  
  // Load all questions for this template FIRST
  const questions = await db
    .select()
    .from(templateQuestions)
    .where(eq(templateQuestions.templateId, templateId));
  
  if (questions.length === 0) {
    throw new Error(`No questions found for template: ${templateId}`);
  }
  
  const questionIds = questions.map(q => q.id);
  const validQuestionIdSet = new Set(questionIds);
  
  // Validate and filter responses to only include questions from this template
  const invalidResponses = responses.filter(r => !validQuestionIdSet.has(r.questionId));
  if (invalidResponses.length > 0) {
    throw new Error(
      `Invalid question IDs in responses: ${invalidResponses.map(r => r.questionCode || r.questionId).slice(0, 5).join(', ')}. ` +
      `These questions do not belong to template '${templateId}'.`
    );
  }
  
  // Convert filtered responses array to Map for efficient lookups
  const responsesMap = new Map(
    responses
      .filter(r => validQuestionIdSet.has(r.questionId))
      .map(r => [r.questionId, r])
  );
  
  // Load threat mappings for all questions
  const threatMappings = await db
    .select()
    .from(questionThreatMap)
    .where(inArray(questionThreatMap.questionId, questionIds));
  
  // Load control mappings for all questions
  const controlMappings = await db
    .select()
    .from(questionControlMap)
    .where(inArray(questionControlMap.questionId, questionIds));
  
  // Load full threat library
  const threats = await db.select().from(threatLibrary).where(eq(threatLibrary.active, true));
  const threatMap = new Map(threats.map(t => [t.id, t]));
  
  // Load full control library
  const controls = await db.select().from(controlLibrary).where(eq(controlLibrary.active, true));
  const controlMap = new Map(controls.map(c => [c.id, c]));
  
  // Build threat-to-questions mapping
  const threatQuestionMap = new Map<string, string[]>();
  for (const mapping of threatMappings) {
    if (!threatQuestionMap.has(mapping.threatId)) {
      threatQuestionMap.set(mapping.threatId, []);
    }
    threatQuestionMap.get(mapping.threatId)!.push(mapping.questionId);
  }
  
  // Build question-to-controls mapping
  const questionControlsMap = new Map<string, string[]>();
  for (const mapping of controlMappings) {
    if (!questionControlsMap.has(mapping.questionId)) {
      questionControlsMap.set(mapping.questionId, []);
    }
    questionControlsMap.get(mapping.questionId)!.push(mapping.controlId);
  }
  
  // Detect which controls are present based on responses
  const detectedControls = new Set<string>();
  for (const [questionId, response] of Array.from(responsesMap.entries())) {
    const question = questions.find(q => q.id === questionId);
    if (!question) continue;
    
    if (isControlPresent(question.type, response.answer)) {
      const controlIds = questionControlsMap.get(questionId) || [];
      for (const controlId of controlIds) {
        detectedControls.add(controlId);
      }
    }
  }
  
  // Analyze each threat
  const threatScores: ThreatRiskScoreV3[] = [];
  
  for (const [threatId, questionIds] of Array.from(threatQuestionMap.entries())) {
    const threat = threatMap.get(threatId);
    if (!threat) {
      console.warn(`⚠️  Threat ID ${threatId} not found in library`);
      continue;
    }
    
    const relatedQuestions = questions.filter(q => questionIds.includes(q.id));
    
    const score = analyzeThreatScoreV3(
      threat,
      relatedQuestions,
      responsesMap,
      detectedControls,
      questionControlsMap,
      controlMap
    );
    
    threatScores.push(score);
  }
  
  // Sort by risk score (highest first)
  threatScores.sort((a, b) => b.inherentRisk - a.inherentRisk);
  
  // Calculate overall risk level
  const criticalThreats = threatScores.filter(t => t.isCritical).length;
  const avgRisk = threatScores.length > 0
    ? threatScores.reduce((sum, t) => sum + t.inherentRisk, 0) / threatScores.length
    : 0;
  
  let overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  if (criticalThreats >= 3 || avgRisk >= 50) {
    overallRiskLevel = 'critical';
  } else if (criticalThreats >= 1 || avgRisk >= 35) {
    overallRiskLevel = 'high';
  } else if (avgRisk >= 20) {
    overallRiskLevel = 'medium';
  } else {
    overallRiskLevel = 'low';
  }
  
  return {
    overallRiskLevel,
    totalThreats: threatScores.length,
    criticalThreats,
    threatScores,
    summary: generateSummary(overallRiskLevel, criticalThreats, threatScores.length)
  };
}

/**
 * Analyze a single threat to generate risk score
 */
function analyzeThreatScoreV3(
  threat: any,
  relatedQuestions: any[],
  responses: Map<string, InterviewResponseV3>,
  detectedControls: Set<string>,
  questionControlsMap: Map<string, string[]>,
  controlMap: Map<string, any>
): ThreatRiskScoreV3 {
  
  // Extract likelihood and impact from threat library
  const likelihood = mapLikelihoodToNumber(threat.typicalLikelihood || 'medium');
  const impact = mapImpactToNumber(threat.typicalImpact || 'medium');
  
  // Calculate vulnerability based on control presence
  let vulnerability = 5.0;
  const findings: string[] = [];
  const affectedControls: Array<{ id: string; name: string; detected: boolean }> = [];
  
  // Collect all controls relevant to this threat
  const relevantControlIds = new Set<string>();
  for (const question of relatedQuestions) {
    const controlIds = questionControlsMap.get(question.id) || [];
    for (const controlId of controlIds) {
      relevantControlIds.add(controlId);
    }
  }
  
  // Check each control and reduce vulnerability if detected
  for (const controlId of Array.from(relevantControlIds)) {
    const control = controlMap.get(controlId);
    if (!control) continue;
    
    const isDetected = detectedControls.has(controlId);
    affectedControls.push({
      id: control.id,
      name: control.name,
      detected: isDetected
    });
    
    if (isDetected) {
      // Reduce vulnerability based on control weight
      const reductionFactor = control.weight || 0.20;
      vulnerability -= reductionFactor * 5; // Scale to vulnerability range
    }
  }
  
  // Check for high-risk findings from responses
  for (const question of relatedQuestions) {
    const response = responses.get(question.id);
    if (response && isHighRiskResponse(question.type, response.answer)) {
      findings.push(question.rationale || 'High risk identified');
    }
  }
  
  // Clamp vulnerability to 1-5 range
  vulnerability = Math.max(1, Math.min(5, vulnerability));
  
  // Calculate inherent risk using T×V×I formula
  const inherentRisk = Math.round(likelihood * vulnerability * impact);
  
  // Determine if critical
  const isCritical = inherentRisk >= 50 || vulnerability >= 4;
  
  // Generate recommendations for undetected controls
  const recommendations: string[] = [];
  for (const control of affectedControls) {
    if (!control.detected) {
      const controlDetails = controlMap.get(control.id);
      if (controlDetails) {
        recommendations.push(`Implement ${control.name}: ${controlDetails.description}`);
      }
    }
  }
  
  return {
    threatId: threat.id,
    threatName: threat.name,
    threatCategory: threat.category,
    likelihood,
    vulnerability: Math.round(vulnerability * 10) / 10,
    impact,
    inherentRisk,
    isCritical,
    findings,
    recommendations: recommendations.slice(0, 3),
    affectedControls
  };
}

/**
 * Determine if a control is present based on response
 */
function isControlPresent(questionType: string, answer: any): boolean {
  switch (questionType) {
    case 'yes-no':
      return answer === 'yes' || answer === true;
    case 'rating':
      return typeof answer === 'number' && answer >= 3;
    case 'text':
      return typeof answer === 'string' && answer.trim().length > 0;
    case 'photo':
      return typeof answer === 'string' && answer.length > 0;
    default:
      return false;
  }
}

/**
 * Determine if a response indicates high risk
 */
function isHighRiskResponse(questionType: string, answer: any): boolean {
  switch (questionType) {
    case 'yes-no':
      return answer === 'no' || answer === false;
    case 'rating':
      return typeof answer === 'number' && answer <= 2;
    case 'text':
      return typeof answer === 'string' && answer.trim().length < 10;
    default:
      return false;
  }
}

/**
 * Map likelihood text to numeric score (1-5)
 */
function mapLikelihoodToNumber(likelihood: string): number {
  const map: Record<string, number> = {
    'very low': 1,
    'low': 2,
    'medium': 3,
    'high': 4,
    'very high': 5
  };
  return map[likelihood.toLowerCase()] || 3;
}

/**
 * Map impact text to numeric score (1-5)
 */
function mapImpactToNumber(impact: string): number {
  const map: Record<string, number> = {
    'very low': 1,
    'low': 2,
    'medium': 3,
    'high': 4,
    'very high': 5,
    'critical': 5
  };
  return map[impact.toLowerCase()] || 3;
}

/**
 * Generate summary text
 */
function generateSummary(
  overallLevel: string,
  criticalCount: number,
  totalCount: number
): string {
  if (overallLevel === 'critical') {
    return `Critical security posture identified. ${criticalCount} of ${totalCount} threats require immediate attention. Comprehensive remediation plan needed.`;
  } else if (overallLevel === 'high') {
    return `Elevated security risks detected. ${criticalCount} critical threats identified among ${totalCount} total threats. Priority remediation recommended.`;
  } else if (overallLevel === 'medium') {
    return `Moderate security posture. ${totalCount} threats assessed with manageable risk levels. Continue monitoring and incremental improvements.`;
  } else {
    return `Strong security posture. ${totalCount} threats assessed with low risk levels. Maintain current controls and periodic reviews.`;
  }
}
