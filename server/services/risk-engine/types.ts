/**
 * Risk Engine Types & Interfaces
 * Framework-agnostic type definitions for modular risk calculation
 */

export interface InterviewResponse {
  questionId: string;
  answer: string | number | boolean | null;
  notes?: string;
}

export interface Control {
  id: string;
  name?: string;
  controlType: "existing" | "proposed";
  effectiveness?: number | null;
  primaryEffect?: string | null;
  treatmentEffectiveness?: number | null;
}

export interface ThreatData {
  id: string;
  name: string;
  category: string;
  typicalLikelihood: string;
  typicalImpact: string;
  requiresExposureCalc?: boolean; // EP-specific threats
}

export interface RiskCalculationResult {
  threatId: string;
  threatName: string;
  likelihood: number;
  vulnerability: number;
  exposure?: number; // Optional: only for EP
  impact: number;
  inherentRisk: number;
  currentRisk?: number;
  residualRisk?: number;
  controlEffectiveness?: number;
  recommendations: string[];
  findings: string[];
}

export interface RiskEngineAdapter {
  /**
   * Calculate vulnerability from interview responses
   * @param responses - Interview responses
   * @param threatId - Threat identifier
   * @returns Vulnerability score (1-5)
   */
  calculateVulnerability(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number>;

  /**
   * Calculate threat likelihood from interview responses
   * @param responses - Interview responses
   * @param threatId - Threat identifier
   * @returns Likelihood score (1-5)
   */
  calculateLikelihood(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number>;

  /**
   * Calculate impact from interview responses
   * @param responses - Interview responses
   * @param threatId - Threat identifier
   * @param threat - Threat data from library
   * @returns Impact score (1-5)
   */
  calculateImpact(
    responses: Map<string, InterviewResponse>,
    threatId: string,
    threat: ThreatData
  ): Promise<number>;

  /**
   * Calculate final risk score using framework-specific formula
   * @param likelihood - Likelihood score (1-5)
   * @param vulnerability - Vulnerability score (1-5)
   * @param impact - Impact score (1-5)
   * @param exposure - Optional exposure score (1-5) for EP
   * @param controlEffectiveness - Control effectiveness (0-1)
   * @returns Final risk score
   */
  calculateRisk(
    likelihood: number,
    vulnerability: number,
    impact: number,
    exposure?: number,
    controlEffectiveness?: number
  ): number;

  /**
   * Generate recommendations based on risk assessment
   * @param responses - Interview responses
   * @param threatId - Threat identifier
   * @param riskScore - Calculated risk score
   * @param profile - Optional profile data for context-aware recommendations
   * @returns Array of recommendations
   */
  generateRecommendations(
    responses: Map<string, InterviewResponse>,
    threatId: string,
    riskScore: number,
    profile?: any
  ): Promise<string[]>;
}

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
