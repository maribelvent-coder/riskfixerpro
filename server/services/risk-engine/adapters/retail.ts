/**
 * Retail Store Risk Engine Adapter
 * Implements retail-specific shrinkage risk calculation
 * 
 * Key Features:
 * - Shrinkage rate assessment
 * - Loss prevention controls evaluation
 * - Organized retail crime (ORC) vulnerability
 */

import { RiskEngineAdapter, InterviewResponse, ThreatData, LIKELIHOOD_VALUES, IMPACT_VALUES } from '../types';

export class RetailAdapter implements RiskEngineAdapter {
  async calculateVulnerability(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let vulnerabilityScore = 3;
    let riskFactorCount = 0;

    const easSystemResponse = responses.get('eas_system');
    if (easSystemResponse?.answer === 'no' || easSystemResponse?.answer === false) {
      riskFactorCount += 3;
    }

    const posCctvResponse = responses.get('pos_cctv');
    if (posCctvResponse?.answer === 'no' || posCctvResponse?.answer === false) {
      riskFactorCount += 2;
    }

    const lpStaffResponse = responses.get('lp_staff');
    if (lpStaffResponse?.answer === 'no' || lpStaffResponse?.answer === false) {
      riskFactorCount += 2;
    }

    const changingRoomMonitoringResponse = responses.get('changing_room_monitoring');
    if (changingRoomMonitoringResponse?.answer === 'no' || changingRoomMonitoringResponse?.answer === false) {
      riskFactorCount += 1;
    }

    vulnerabilityScore = Math.min(5, vulnerabilityScore + Math.floor(riskFactorCount / 2));
    return vulnerabilityScore;
  }

  async calculateLikelihood(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let likelihood = 2;

    const priorShopliftingResponse = responses.get('prior_shoplifting');
    if (priorShopliftingResponse?.answer === 'yes' || priorShopliftingResponse?.answer === true) {
      likelihood += 2;
    }

    const priorOrcResponse = responses.get('prior_orc');
    if (priorOrcResponse?.answer === 'yes' || priorOrcResponse?.answer === true) {
      likelihood += 3;
    }

    const highFootTrafficResponse = responses.get('high_foot_traffic');
    if (highFootTrafficResponse?.answer === 'yes' || highFootTrafficResponse?.answer === true) {
      likelihood += 1;
    }

    return Math.min(5, likelihood);
  }

  async calculateImpact(
    responses: Map<string, InterviewResponse>,
    threatId: string,
    threat: ThreatData
  ): Promise<number> {
    const typicalImpact = threat.typicalImpact;
    let impact = IMPACT_VALUES[typicalImpact as keyof typeof IMPACT_VALUES]?.value || 3;

    const highValueMerchandiseResponse = responses.get('high_value_merchandise');
    if (highValueMerchandiseResponse?.answer === 'yes' || highValueMerchandiseResponse?.answer === true) {
      impact = Math.min(5, impact + 1);
    }

    return Math.round(impact);
  }

  calculateRisk(
    likelihood: number,
    vulnerability: number,
    impact: number,
    exposure?: number,
    controlEffectiveness: number = 0
  ): number {
    const inherentRisk = likelihood * vulnerability * impact;
    const risk = inherentRisk * (1 - controlEffectiveness);
    return Math.round(risk);
  }

  async generateRecommendations(
    responses: Map<string, InterviewResponse>,
    threatId: string,
    riskScore: number
  ): Promise<string[]> {
    const recommendations: string[] = [];

    const easSystemResponse = responses.get('eas_system');
    if (easSystemResponse?.answer === 'no' || easSystemResponse?.answer === false) {
      recommendations.push('Install Electronic Article Surveillance (EAS) system at store exits');
    }

    const posCctvResponse = responses.get('pos_cctv');
    if (posCctvResponse?.answer === 'no' || posCctvResponse?.answer === false) {
      recommendations.push('Install CCTV cameras covering all POS terminals and high-value merchandise areas');
    }

    const lpStaffResponse = responses.get('lp_staff');
    if (lpStaffResponse?.answer === 'no' || lpStaffResponse?.answer === false) {
      recommendations.push('Hire dedicated Loss Prevention staff to monitor store and deter theft');
    }

    return recommendations;
  }
}

/**
 * SHRINKAGE RISK SCORING
 * Standalone 0-100 scoring system for retail store shrinkage risk
 * Framework: Retail Store Framework Section 9.2
 */

export interface ShrinkageRiskScore {
  score: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    shrinkageRate: number; // Max 25 pts
    controlGaps: number; // Max 35 pts
    highValueGoods: number; // Max 10 pts
    incidentHistory: number; // Max 15 pts
  };
}

export interface RetailProfile {
  annualRevenue?: number;
  shrinkageRate?: number; // Percentage (e.g., 2.5 for 2.5%)
  highValueMerchandise?: string[]; // e.g., ['electronics', 'jewelry', 'cosmetics', 'designer_apparel']
  storeFormat?: string; // 'Mall', 'Standalone', 'Strip Center'
}

export interface AssessmentWithRetailData {
  retail_profile?: RetailProfile;
  [key: string]: any;
}

/**
 * Calculate Shrinkage Risk Score (0-100)
 * 
 * Scoring Components:
 * - Shrinkage Rate: 25 pts (>3% = Critical 25pts, >1.5% = Medium 10pts)
 * - Control Gaps: 35 pts (No EAS: 15pts, No POS CCTV: 10pts, No LP Staff: 10pts)
 * - High-Value Goods: 10 pts (+2pts per category, max 10)
 * - Incident History: 15 pts (Robbery: +8pts, ORC: +7pts)
 * 
 * Risk Levels:
 * - 0-24: LOW
 * - 25-49: MEDIUM
 * - 50-74: HIGH
 * - 75-100: CRITICAL
 */
export function calculateShrinkageRiskScore(
  assessment: AssessmentWithRetailData
): ShrinkageRiskScore {
  const profile = assessment.retail_profile || {};
  const responses = assessment;
  
  let shrinkageRate = 0;
  let controlGaps = 0;
  let highValueGoods = 0;
  let incidentHistory = 0;

  // 1. SHRINKAGE RATE (Max 25 pts)
  if (profile.shrinkageRate !== undefined && profile.shrinkageRate !== null) {
    if (profile.shrinkageRate > 3.0) {
      shrinkageRate = 25; // Critical
    } else if (profile.shrinkageRate > 1.5) {
      shrinkageRate = 10; // Medium
    } else {
      shrinkageRate = 0; // Low (industry baseline ~1.4-1.6%)
    }
  }

  // 2. CONTROL GAPS (Max 35 pts)
  
  // No EAS system (15 pts)
  if (responses.eas_system === 'no' || responses.eas_system === false) {
    controlGaps += 15;
  }

  // No POS CCTV (10 pts)
  if (responses.pos_cctv === 'no' || responses.pos_cctv === false) {
    controlGaps += 10;
  }

  // No LP Staff (10 pts)
  if (responses.lp_staff === 'no' || responses.lp_staff === false) {
    controlGaps += 10;
  }

  controlGaps = Math.min(35, controlGaps);

  // 3. HIGH-VALUE GOODS (Max 10 pts)
  if (profile.highValueMerchandise && Array.isArray(profile.highValueMerchandise)) {
    highValueGoods = Math.min(10, profile.highValueMerchandise.length * 2);
  }

  // 4. INCIDENT HISTORY (Max 15 pts)
  
  // Robbery incidents (+8 pts)
  if (responses.prior_robbery === 'yes' || responses.prior_robbery === true) {
    incidentHistory += 8;
  }

  // ORC incidents (+7 pts)
  if (responses.prior_orc === 'yes' || responses.prior_orc === true) {
    incidentHistory += 7;
  }

  incidentHistory = Math.min(15, incidentHistory);

  // TOTAL SCORE CALCULATION
  const totalScore = shrinkageRate + controlGaps + highValueGoods + incidentHistory;

  // RISK LEVEL DETERMINATION
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (totalScore >= 75) {
    riskLevel = 'CRITICAL';
  } else if (totalScore >= 50) {
    riskLevel = 'HIGH';
  } else if (totalScore >= 25) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  return {
    score: totalScore,
    riskLevel,
    breakdown: {
      shrinkageRate,
      controlGaps,
      highValueGoods,
      incidentHistory,
    },
  };
}
