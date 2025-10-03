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
 * Convert effectiveness rating (1-5) to reduction percentage
 * Uses a compound reduction model with diminishing returns
 */
export function effectivenessToReduction(effectiveness: number): number {
  // Each point of effectiveness = 10% reduction of REMAINING risk
  // This creates a realistic diminishing returns curve
  const reductionPerPoint = 0.10;
  return reductionPerPoint * effectiveness;
}

/**
 * Apply compound reduction from multiple controls
 * Each control reduces the REMAINING risk, not the original risk
 * 
 * Example: 3 controls with effectiveness 5 each (10% reduction each)
 * - After control 1: 100% - 10% = 90% remaining
 * - After control 2: 90% - (90% × 10%) = 81% remaining
 * - After control 3: 81% - (81% × 10%) = 72.9% remaining
 * Total reduction: 27.1% (not 30%)
 */
export function applyCompoundReduction(
  initialValue: number,
  reductions: number[]
): number {
  let remaining = initialValue;
  
  for (const reduction of reductions) {
    remaining = remaining * (1 - reduction);
  }
  
  return Math.max(1, Math.round(remaining));
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
  currentRiskLevel: string;
  likelihoodReduction: number;
  impactReduction: number;
} {
  // Separate controls by what they reduce
  const likelihoodControls = existingControls.filter(
    c => c.controlType === "existing" && c.effectiveness && !c.primaryEffect
  );
  const impactControls: Control[] = []; // Future: when we add primaryEffect to existing controls
  
  // Calculate likelihood reduction
  const likelihoodReductions = likelihoodControls
    .map(c => effectivenessToReduction(c.effectiveness!))
    .filter(r => r > 0);
  
  const currentLikelihood = applyCompoundReduction(
    inherentLikelihood,
    likelihoodReductions
  );
  
  // Calculate impact reduction
  const impactReductions = impactControls
    .map(c => effectivenessToReduction(c.effectiveness!))
    .filter(r => r > 0);
  
  const currentImpact = applyCompoundReduction(
    inherentImpact,
    impactReductions
  );
  
  // Convert back to risk level keys
  const currentLikelihoodKey = Object.keys(LIKELIHOOD_VALUES).find(
    k => LIKELIHOOD_VALUES[k as keyof typeof LIKELIHOOD_VALUES].value === currentLikelihood
  ) as keyof typeof LIKELIHOOD_VALUES || "very-low";
  
  const currentImpactKey = Object.keys(IMPACT_VALUES).find(
    k => IMPACT_VALUES[k as keyof typeof IMPACT_VALUES].value === currentImpact
  ) as keyof typeof IMPACT_VALUES || "negligible";
  
  const currentRiskLevel = calculateRiskLevel(currentLikelihoodKey, currentImpactKey);
  
  // Calculate total reduction percentages
  const likelihoodReduction = Math.round(
    (1 - (currentLikelihood / inherentLikelihood)) * 100
  );
  const impactReduction = Math.round(
    (1 - (currentImpact / inherentImpact)) * 100
  );
  
  return {
    currentLikelihood,
    currentImpact,
    currentRiskLevel,
    likelihoodReduction,
    impactReduction,
  };
}

/**
 * Calculate residual risk after applying proposed controls
 */
export function calculateResidualRisk(
  currentLikelihood: number,
  currentImpact: number,
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
  
  // Calculate likelihood reduction
  const likelihoodReductions = likelihoodControls
    .map(c => effectivenessToReduction(c.treatmentEffectiveness!))
    .filter(r => r > 0);
  
  const residualLikelihood = applyCompoundReduction(
    currentLikelihood,
    likelihoodReductions
  );
  
  // Calculate impact reduction
  const impactReductions = impactControls
    .map(c => effectivenessToReduction(c.treatmentEffectiveness!))
    .filter(r => r > 0);
  
  const residualImpact = applyCompoundReduction(
    currentImpact,
    impactReductions
  );
  
  // Convert back to risk level keys
  const residualLikelihoodKey = Object.keys(LIKELIHOOD_VALUES).find(
    k => LIKELIHOOD_VALUES[k as keyof typeof LIKELIHOOD_VALUES].value === residualLikelihood
  ) as keyof typeof LIKELIHOOD_VALUES || "very-low";
  
  const residualImpactKey = Object.keys(IMPACT_VALUES).find(
    k => IMPACT_VALUES[k as keyof typeof IMPACT_VALUES].value === residualImpact
  ) as keyof typeof IMPACT_VALUES || "negligible";
  
  const residualRiskLevel = calculateRiskLevel(residualLikelihoodKey, residualImpactKey);
  
  // Calculate total reduction percentages from current to residual
  const likelihoodReduction = Math.round(
    (1 - (residualLikelihood / currentLikelihood)) * 100
  );
  const impactReduction = Math.round(
    (1 - (residualImpact / currentImpact)) * 100
  );
  
  return {
    residualLikelihood,
    residualImpact,
    residualRiskLevel,
    likelihoodReduction,
    impactReduction,
  };
}
