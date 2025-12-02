/**
 * Data-Driven Interview Risk Mapping Service (v2)
 * 
 * Refactored to consume questionnaire metadata and library registries dynamically
 * instead of hard-coded threat analysis logic.
 * 
 * Key improvements:
 * - Accepts questionnaire configuration objects
 * - Queries threat/control libraries by database IDs
 * - Iterates threats dynamically using metadata
 * - Preserves validated T×V×I calculation heuristics
 */
import { loadThreatLibrary, loadControlLibrary, loadThreatLibraryByName, loadControlLibraryByName } from './library-resolver';

// Questionnaire metadata structure
export interface QuestionMetadata {
  id: string;
  question: string;
  type: string;
  threatMappings: string[]; // Threat names (will be resolved to IDs)
  controlMappings: string[]; // Control names (will be resolved to IDs)
  riskIndicators: {
    highRisk: string;
    lowRisk: string;
  };
}

// Response data structure
export interface InterviewResponse {
  questionId: string;
  answer: string | number | boolean | null;
  notes?: string;
}

// Risk calculation result
export interface ThreatRiskScore {
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

export interface RiskAnalysisResult {
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  totalThreats: number;
  criticalThreats: number;
  threatScores: ThreatRiskScore[];
  summary: string;
}

/**
 * Analyze interview responses to generate risk scores for all threats
 * 
 * @param questions - Questionnaire metadata with threat/control mappings
 * @param responses - Interview responses keyed by question ID
 * @returns Risk analysis with threat scores and recommendations
 */
export async function analyzeInterviewRisks(
  questions: QuestionMetadata[],
  responses: Map<string, InterviewResponse>
): Promise<RiskAnalysisResult> {
  
  // Load library registries
  const threatLibraryById = await loadThreatLibrary();
  const controlLibraryById = await loadControlLibrary();
  const threatLibraryByName = await loadThreatLibraryByName();
  const controlLibraryByName = await loadControlLibraryByName();

  // Build threat-to-questions mapping
  const threatQuestionMap = new Map<string, QuestionMetadata[]>();
  
  for (const question of questions) {
    for (const threatName of question.threatMappings) {
      const threat = threatLibraryByName.get(threatName);
      if (threat) {
        const threatId = threat.id;
        if (!threatQuestionMap.has(threatId)) {
          threatQuestionMap.set(threatId, []);
        }
        threatQuestionMap.get(threatId)!.push(question);
      }
    }
  }

  // Build control detection map (which controls are detected from responses)
  const detectedControls = new Set<string>();
  
  for (const question of questions) {
    const response = responses.get(question.id);
    if (!response) continue;

    // Detect controls based on response
    const isControlPresent = analyzeControlPresence(question, response);
    
    if (isControlPresent) {
      for (const controlName of question.controlMappings) {
        const control = controlLibraryByName.get(controlName);
        if (control) {
          detectedControls.add(control.id);
        }
      }
    }
  }

  // Analyze each threat
  const threatScores: ThreatRiskScore[] = [];
  
  for (const [threatId, relatedQuestions] of Array.from(threatQuestionMap.entries())) {
    const threat = threatLibraryById.get(threatId);
    if (!threat) continue;

    const score = analyzeThreatScore(
      threat,
      relatedQuestions,
      responses,
      detectedControls,
      controlLibraryById,
      controlLibraryByName
    );
    
    threatScores.push(score);
  }

  // Sort by risk score (highest first)
  threatScores.sort((a, b) => b.inherentRisk - a.inherentRisk);

  // Calculate overall risk level
  const criticalThreats = threatScores.filter(t => t.isCritical).length;
  const avgRisk = threatScores.reduce((sum, t) => sum + t.inherentRisk, 0) / threatScores.length;
  
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
function analyzeThreatScore(
  threat: any,
  relatedQuestions: QuestionMetadata[],
  responses: Map<string, InterviewResponse>,
  detectedControls: Set<string>,
  controlLibraryById: Map<string, any>,
  controlLibraryByName: Map<string, any>
): ThreatRiskScore {
  
  // Extract likelihood and impact from threat library
  const likelihood = mapLikelihoodToNumber(threat.typicalLikelihood || 'medium');
  const impact = mapImpactToNumber(threat.typicalImpact || 'medium');
  
  // Calculate vulnerability based on control presence
  // Start with high vulnerability (5) and reduce based on detected controls
  let vulnerability = 5.0;
  const findings: string[] = [];
  const affectedControls: Array<{ id: string; name: string; detected: boolean }> = [];
  
  // Collect all controls relevant to this threat
  const relevantControlNames = new Set<string>();
  for (const question of relatedQuestions) {
    for (const controlName of question.controlMappings) {
      relevantControlNames.add(controlName);
    }
  }

  // Check each control and reduce vulnerability if detected
  for (const controlName of Array.from(relevantControlNames)) {
    const control = controlLibraryByName.get(controlName);
    if (!control) continue;

    const isDetected = detectedControls.has(control.id);
    affectedControls.push({
      id: control.id,
      name: control.name,
      detected: isDetected
    });

    if (isDetected) {
      // Reduce vulnerability based on control weight
      // High-weight controls (0.40-0.50) reduce vulnerability more
      const reductionFactor = control.weight || 0.20;
      vulnerability -= reductionFactor * 5; // Scale to vulnerability range
    }
  }

  // Check for high-risk findings from responses
  for (const question of relatedQuestions) {
    const response = responses.get(question.id);
    if (response && isHighRiskResponse(question, response)) {
      findings.push(question.riskIndicators.highRisk);
    }
  }

  // Clamp vulnerability to 1-5 range
  vulnerability = Math.max(1, Math.min(5, vulnerability));

  // Calculate inherent risk using T×V×I formula
  const inherentRisk = Math.round(likelihood * vulnerability * impact);

  // Determine if critical (risk >= 50 or vulnerability >= 4)
  const isCritical = inherentRisk >= 50 || vulnerability >= 4;

  // Generate recommendations for undetected controls
  const recommendations: string[] = [];
  for (const control of affectedControls) {
    if (!control.detected) {
      const controlDetails = controlLibraryById.get(control.id);
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
    vulnerability: Math.round(vulnerability * 10) / 10, // Round to 1 decimal
    impact,
    inherentRisk,
    isCritical,
    findings,
    recommendations: recommendations.slice(0, 3), // Top 3 recommendations
    affectedControls
  };
}

/**
 * Determine if a control is present based on question response
 */
function analyzeControlPresence(question: QuestionMetadata, response: InterviewResponse): boolean {
  const answer = response.answer;
  
  switch (question.type) {
    case 'yes-no':
      return answer === 'yes' || answer === true;
    
    case 'rating':
      // Consider control present if rating >= 3 (on 1-5 scale)
      return typeof answer === 'number' && answer >= 3;
    
    case 'text':
      // Consider present if text is provided (non-empty)
      return typeof answer === 'string' && answer.trim().length > 0;
    
    case 'photo':
      // Photo evidence suggests control is present
      return typeof answer === 'string' && answer.length > 0;
    
    default:
      return false;
  }
}

/**
 * Determine if a response indicates high risk
 */
function isHighRiskResponse(question: QuestionMetadata, response: InterviewResponse): boolean {
  const answer = response.answer;
  
  switch (question.type) {
    case 'yes-no':
      // "No" answers typically indicate high risk
      return answer === 'no' || answer === false;
    
    case 'rating':
      // Low ratings indicate high risk
      return typeof answer === 'number' && answer <= 2;
    
    case 'text':
      // Empty or short responses may indicate lack of controls
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
 * Generate summary text based on risk analysis
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
