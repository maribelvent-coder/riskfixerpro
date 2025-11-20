/**
 * Risk Calculation Engine with Compound Reduction Model
 * 
 * Implements a realistic control effectiveness model where:
 * - Multiple controls have diminishing returns (compound/multiplicative reduction)
 * - Each control reduces REMAINING risk, not original risk
 * - Separates Likelihood and Impact reducers for independent calculation
 */

export const LIKELIHOOD_VALUES = {
  "very-low": { value: 1, label: "Very Low" },
  "low": { value: 2, label: "Low" },
  "medium": { value: 3, label: "Medium" },
  "high": { value: 4, label: "High" },
  "very-high": { value: 5, label: "Very High" },
};

export const IMPACT_VALUES = {
  "negligible": { value: 1, label: "Negligible" },
  "minor": { value: 2, label: "Minor" },
  "moderate": { value: 3, label: "Moderate" },
  "major": { value: 4, label: "Major" },
  "catastrophic": { value: 5, label: "Catastrophic" },
};

/**
 * Calculate risk level from likelihood and impact scores
 */
export function calculateRiskLevel(
  likelihood: keyof typeof LIKELIHOOD_VALUES,
  impact: keyof typeof IMPACT_VALUES
): string {
  const lValue = LIKELIHOOD_VALUES[likelihood].value;
  const iValue = IMPACT_VALUES[impact].value;
  const riskScore = lValue * iValue;

  if (riskScore <= 3) return "Very Low";
  if (riskScore <= 6) return "Low";
  if (riskScore <= 12) return "Medium";
  if (riskScore <= 16) return "High";
  return "Critical";
}

/**
 * Apply compound reduction from multiple controls with effectiveness ratings
 * Each control reduces the REMAINING risk based on its effectiveness
 * 
 * Model: effectiveness 1-5 means 1-5 sequential 10% reductions
 * Example: effectiveness 3 = apply 10% reduction 3 times
 * - After reduction 1: 100% - 10% = 90% remaining
 * - After reduction 2: 90% - 9% = 81% remaining  
 * - After reduction 3: 81% - 8.1% = 72.9% remaining
 * Total reduction: 27.1% (not linear 30%)
 * 
 * Three controls at effectiveness 5 each:
 * Control 1: 100% → 59% remaining (41% reduction after 5 iterations)
 * Control 2: 59% → 35% remaining (24% additional reduction)
 * Control 3: 35% → 21% remaining (14% additional reduction)
 * Total: 79% reduction
 * 
 * Returns floating point value - caller rounds to discrete levels
 */
export function applyCompoundReduction(
  initialValue: number,
  effectivenessRatings: number[]
): number {
  const reductionPerIteration = 0.10; // 10% per iteration
  let remaining = initialValue;
  
  for (const effectiveness of effectivenessRatings) {
    // Apply the 10% reduction 'effectiveness' times
    for (let i = 0; i < effectiveness; i++) {
      remaining = remaining * (1 - reductionPerIteration);
    }
  }
  
  // Return TRUE floating point, no floor - caller handles min when mapping to tiers
  return remaining;
}

/**
 * Calculate current risk after applying existing controls
 */
export interface Control {
  id: string;
  controlType: "existing" | "proposed";
  effectiveness?: number | null;
  primaryEffect?: string | null;
  treatmentEffectiveness?: number | null;
}

export function calculateCurrentRisk(
  inherentLikelihood: number,
  inherentImpact: number,
  existingControls: Control[]
): {
  currentLikelihood: number;
  currentImpact: number;
  currentLikelihoodFloat: number;
  currentImpactFloat: number;
  currentRiskLevel: string;
  likelihoodReduction: number;
  impactReduction: number;
} {
  // Separate controls by what they reduce
  const likelihoodControls = existingControls.filter(
    c => c.controlType === "existing" && c.effectiveness && !c.primaryEffect
  );
  const impactControls: Control[] = []; // Future: when we add primaryEffect to existing controls
  
  // Extract effectiveness ratings
  const likelihoodEffectiveness = likelihoodControls
    .map(c => c.effectiveness!)
    .filter(e => e > 0);
  
  const currentLikelihoodFloat = applyCompoundReduction(
    inherentLikelihood,
    likelihoodEffectiveness
  );
  
  // Calculate impact reduction
  const impactEffectiveness = impactControls
    .map(c => c.effectiveness!)
    .filter(e => e > 0);
  
  const currentImpactFloat = applyCompoundReduction(
    inherentImpact,
    impactEffectiveness
  );
  
  // Round to nearest discrete level for tier mapping
  const currentLikelihood = Math.max(1, Math.round(currentLikelihoodFloat));
  const currentImpact = Math.max(1, Math.round(currentImpactFloat));
  
  // Convert back to risk level keys
  const currentLikelihoodKey = Object.keys(LIKELIHOOD_VALUES).find(
    k => LIKELIHOOD_VALUES[k as keyof typeof LIKELIHOOD_VALUES].value === currentLikelihood
  ) as keyof typeof LIKELIHOOD_VALUES || "very-low";
  
  const currentImpactKey = Object.keys(IMPACT_VALUES).find(
    k => IMPACT_VALUES[k as keyof typeof IMPACT_VALUES].value === currentImpact
  ) as keyof typeof IMPACT_VALUES || "negligible";
  
  const currentRiskLevel = calculateRiskLevel(currentLikelihoodKey, currentImpactKey);
  
  // Calculate total reduction percentages using FLOATING POINT for EXACT accuracy
  // Return as floats to preserve precision (e.g., 27.1% not 27%)
  const likelihoodReduction = (1 - (currentLikelihoodFloat / inherentLikelihood)) * 100;
  const impactReduction = (1 - (currentImpactFloat / inherentImpact)) * 100;
  
  return {
    currentLikelihood,
    currentImpact,
    currentLikelihoodFloat,
    currentImpactFloat,
    currentRiskLevel,
    likelihoodReduction, // Float value, UI can format with toFixed(1)
    impactReduction, // Float value, UI can format with toFixed(1)
  };
}

/**
 * Calculate residual risk after applying proposed controls
 * 
 * @param currentLikelihoodFloat - Floating point current likelihood value (not rounded)
 * @param currentImpactFloat - Floating point current impact value (not rounded)
 * @param proposedControls - Array of proposed controls to apply
 */
export function calculateResidualRisk(
  currentLikelihoodFloat: number,
  currentImpactFloat: number,
  proposedControls: Control[]
): {
  residualLikelihood: number;
  residualImpact: number;
  residualRiskLevel: string;
  likelihoodReduction: number;
  impactReduction: number;
} {
  // Separate controls by what they reduce
  const likelihoodControls = proposedControls.filter(
    c => c.controlType === "proposed" && 
         c.primaryEffect === "reduce_likelihood" && 
         c.treatmentEffectiveness
  );
  
  const impactControls = proposedControls.filter(
    c => c.controlType === "proposed" && 
         c.primaryEffect === "reduce_impact" && 
         c.treatmentEffectiveness
  );
  
  // Extract effectiveness ratings
  const likelihoodEffectiveness = likelihoodControls
    .map(c => c.treatmentEffectiveness!)
    .filter(e => e > 0);
  
  const residualLikelihoodFloat = applyCompoundReduction(
    currentLikelihoodFloat,
    likelihoodEffectiveness
  );
  
  // Calculate impact reduction
  const impactEffectiveness = impactControls
    .map(c => c.treatmentEffectiveness!)
    .filter(e => e > 0);
  
  const residualImpactFloat = applyCompoundReduction(
    currentImpactFloat,
    impactEffectiveness
  );
  
  // Round to nearest discrete level for display
  const residualLikelihood = Math.max(1, Math.round(residualLikelihoodFloat));
  const residualImpact = Math.max(1, Math.round(residualImpactFloat));
  
  // Convert back to risk level keys
  const residualLikelihoodKey = Object.keys(LIKELIHOOD_VALUES).find(
    k => LIKELIHOOD_VALUES[k as keyof typeof LIKELIHOOD_VALUES].value === residualLikelihood
  ) as keyof typeof LIKELIHOOD_VALUES || "very-low";
  
  const residualImpactKey = Object.keys(IMPACT_VALUES).find(
    k => IMPACT_VALUES[k as keyof typeof IMPACT_VALUES].value === residualImpact
  ) as keyof typeof IMPACT_VALUES || "negligible";
  
  const residualRiskLevel = calculateRiskLevel(residualLikelihoodKey, residualImpactKey);
  
  // Calculate total reduction percentages using FLOATING POINT for EXACT accuracy
  // Return as floats to preserve precision (e.g., 79.0% not 79%)
  const likelihoodReduction = (1 - (residualLikelihoodFloat / currentLikelihoodFloat)) * 100;
  const impactReduction = (1 - (residualImpactFloat / currentImpactFloat)) * 100;
  
  return {
    residualLikelihood,
    residualImpact,
    residualRiskLevel,
    likelihoodReduction, // Float value, UI can format with toFixed(1)
    impactReduction, // Float value, UI can format with toFixed(1)
  };
}

/**
 * ===================================================================
 * "No BS" Security Framework - Survey-Driven Risk Calculation
 * ===================================================================
 * 
 * Simpler model that uses survey responses to automatically calculate
 * control effectiveness rather than manual control entry.
 * 
 * Formula:
 * - R_inherent = Likelihood × Impact (1-25 scale)
 * - C_effectiveness = Σ(Control_Weight × Answer_Fidelity), capped at 0.95
 * - R_residual = R_inherent × (1 - C_effectiveness)
 */

export type AnswerValue = "yes" | "no" | "partial" | "compliant" | "non-compliant" | "n-a" | null | undefined;

/**
 * Map survey answer to fidelity score for control effectiveness calculation
 */
export function mapAnswerToFidelity(answer: AnswerValue): number {
  if (!answer || answer === "n-a" || answer === null || answer === undefined) {
    return 0.0; // Missing/N/A = no fidelity
  }
  
  switch (answer.toLowerCase()) {
    case "yes":
    case "compliant":
      return 1.0; // Full fidelity
    case "partial":
      return 0.5; // Partial fidelity
    case "no":
    case "non-compliant":
      return 0.0; // No fidelity
    default:
      return 0.0; // Unknown = no fidelity
  }
}

/**
 * Calculate inherent risk (before controls)
 */
export function calculateInherentRisk(
  likelihood: number, // 1-5 scale
  impact: number // 1-5 scale
): number {
  return likelihood * impact; // 1-25 scale
}

/**
 * Survey response with control link
 */
export interface SurveyResponseWithControl {
  answer: AnswerValue;
  controlWeight: number; // From control_library.weight
}

/**
 * Calculate control effectiveness from survey responses
 * 
 * @param responses - Survey responses linked to controls via question_threat_map
 * @returns Control effectiveness (0.0 to 0.95 max)
 */
export function calculateControlEffectiveness(
  responses: SurveyResponseWithControl[]
): number {
  if (responses.length === 0) {
    return 0.0; // No controls = no effectiveness
  }
  
  // Sum up weighted fidelity scores
  const totalEffectiveness = responses.reduce((sum, response) => {
    const fidelity = mapAnswerToFidelity(response.answer);
    const contribution = response.controlWeight * fidelity;
    return sum + contribution;
  }, 0.0);
  
  // Cap at 0.95 (95%) - can never eliminate risk entirely
  return Math.min(totalEffectiveness, 0.95);
}

/**
 * Calculate residual risk after applying controls
 */
export function calculateResidualRiskNBS(
  inherentRisk: number,
  controlEffectiveness: number
): number {
  const residualRisk = inherentRisk * (1 - controlEffectiveness);
  
  // Floor at 0.1 to avoid showing exactly zero risk
  return Math.max(residualRisk, 0.1);
}

/**
 * Complete risk calculation for a scenario using survey responses
 */
export interface RiskCalculationResult {
  inherentRisk: number; // L × I (1-25 scale)
  controlEffectiveness: number; // 0.0 to 0.95
  residualRisk: number; // R_inh × (1 - Ce)
  riskReduction: number; // Percentage reduction
  inherentRiskLevel: string; // "Very Low" to "Critical"
  residualRiskLevel: string; // "Very Low" to "Critical"
}

export function calculateScenarioRisk(
  likelihood: number, // 1-5 scale
  impact: number, // 1-5 scale
  surveyResponses: SurveyResponseWithControl[]
): RiskCalculationResult {
  // Step 1: Calculate inherent risk
  const inherentRisk = calculateInherentRisk(likelihood, impact);
  
  // Step 2: Calculate control effectiveness from survey
  const controlEffectiveness = calculateControlEffectiveness(surveyResponses);
  
  // Step 3: Calculate residual risk
  const residualRisk = calculateResidualRiskNBS(inherentRisk, controlEffectiveness);
  
  // Step 4: Calculate risk reduction percentage
  const riskReduction = ((inherentRisk - residualRisk) / inherentRisk) * 100;
  
  // Step 5: Map to risk level labels
  const inherentRiskLevel = getRiskLevel(inherentRisk);
  const residualRiskLevel = getRiskLevel(residualRisk);
  
  return {
    inherentRisk,
    controlEffectiveness,
    residualRisk,
    riskReduction,
    inherentRiskLevel,
    residualRiskLevel,
  };
}

/**
 * Map numeric risk score to risk level label
 */
function getRiskLevel(riskScore: number): string {
  if (riskScore <= 3) return "Very Low";
  if (riskScore <= 6) return "Low";
  if (riskScore <= 12) return "Medium";
  if (riskScore <= 16) return "High";
  return "Critical";
}
