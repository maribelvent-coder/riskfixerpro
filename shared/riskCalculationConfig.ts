export type RiskCalculationMethod = 'compound' | 'tvi' | 'hybrid';

export interface CompoundReductionConfig {
  method: 'compound';
  usesLikelihood: true;
  usesImpact: true;
  controlReductionPercentages: true;
}

export interface TVIConfig {
  method: 'tvi';
  usesThreatLikelihood: true;
  usesVulnerability: true;
  usesImpact: true;
  controlWeights: true;
  implementationFidelity: true;
  maxControlEffectiveness: number;
}

export interface HybridConfig {
  method: 'hybrid';
  primaryMethod: 'compound' | 'tvi';
  allowMethodSelection: true;
}

export type RiskCalculationConfig = 
  | CompoundReductionConfig 
  | TVIConfig 
  | HybridConfig;

export const COMPOUND_REDUCTION_CONFIG: CompoundReductionConfig = {
  method: 'compound',
  usesLikelihood: true,
  usesImpact: true,
  controlReductionPercentages: true,
};

export const TVI_CONFIG: TVIConfig = {
  method: 'tvi',
  usesThreatLikelihood: true,
  usesVulnerability: true,
  usesImpact: true,
  controlWeights: true,
  implementationFidelity: true,
  maxControlEffectiveness: 0.95,
};

export const HYBRID_CONFIG: HybridConfig = {
  method: 'hybrid',
  primaryMethod: 'compound',
  allowMethodSelection: true,
};

export interface RiskScoreInput {
  likelihood?: number;
  impact?: number;
  threatLikelihood?: number;
  vulnerability?: number;
  controls?: Array<{
    reductionPercentage?: number;
    weight?: number;
    fidelity?: number;
  }>;
}

export interface RiskScoreOutput {
  inherentRisk: number;
  residualRisk: number;
  controlEffectiveness: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'negligible';
}

export function getRiskLevel(score: number, maxScore: number = 125): RiskScoreOutput['riskLevel'] {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 61) return 'critical';
  if (percentage >= 41) return 'high';
  if (percentage >= 21) return 'medium';
  if (percentage >= 9) return 'low';
  return 'negligible';
}

export function calculateCompoundReduction(input: RiskScoreInput): RiskScoreOutput {
  if (input.likelihood === undefined || input.impact === undefined) {
    throw new Error('Compound reduction requires likelihood and impact');
  }
  
  const inherentRisk = input.likelihood * input.impact;
  let remainingRisk = inherentRisk;
  
  if (input.controls && input.controls.length > 0) {
    for (const control of input.controls) {
      const reduction = control.reductionPercentage ?? 0;
      remainingRisk = remainingRisk * (1 - reduction);
    }
  }
  
  const controlEffectiveness = inherentRisk > 0 ? 1 - (remainingRisk / inherentRisk) : 0;
  
  return {
    inherentRisk,
    residualRisk: remainingRisk,
    controlEffectiveness,
    riskLevel: getRiskLevel(remainingRisk, 25),
  };
}

export function calculateTVI(input: RiskScoreInput, config: TVIConfig = TVI_CONFIG): RiskScoreOutput {
  if (input.threatLikelihood === undefined || input.vulnerability === undefined || input.impact === undefined) {
    throw new Error('TVI calculation requires threat likelihood, vulnerability, and impact');
  }
  
  const inherentRisk = input.threatLikelihood * input.vulnerability * input.impact;
  
  let totalControlEffectiveness = 0;
  
  if (input.controls && input.controls.length > 0) {
    for (const control of input.controls) {
      const weight = control.weight ?? 0;
      const fidelity = control.fidelity ?? 1.0;
      totalControlEffectiveness += weight * fidelity;
    }
  }
  
  totalControlEffectiveness = Math.min(totalControlEffectiveness, config.maxControlEffectiveness);
  
  const residualRisk = inherentRisk * (1 - totalControlEffectiveness);
  
  return {
    inherentRisk,
    residualRisk,
    controlEffectiveness: totalControlEffectiveness,
    riskLevel: getRiskLevel(residualRisk, 125),
  };
}

export function calculateRisk(
  input: RiskScoreInput,
  config: RiskCalculationConfig
): RiskScoreOutput {
  if (config.method === 'compound') {
    return calculateCompoundReduction(input);
  } else if (config.method === 'tvi') {
    return calculateTVI(input, config);
  } else {
    const primaryMethod = config.primaryMethod;
    if (primaryMethod === 'compound') {
      return calculateCompoundReduction(input);
    } else {
      return calculateTVI(input);
    }
  }
}
