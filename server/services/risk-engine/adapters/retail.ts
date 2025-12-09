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
import type { MerchandiseDisplay } from '@shared/schema';

/**
 * Helper: Determine if EAS system absence should penalize vulnerability score
 * Context-aware logic based on merchandise display model
 * 
 * @param merchandiseDisplay - How merchandise is displayed in the store
 * @param easAnswer - Whether EAS system is present (yes/true = present, no/false = absent)
 * @returns true if missing EAS should increase vulnerability
 */
function shouldPenalizeEAS(
  merchandiseDisplay: MerchandiseDisplay | undefined,
  easAnswer: string | number | boolean | null | undefined
): boolean {
  // If EAS is present, never penalize
  if (easAnswer === 'yes' || easAnswer === true) {
    return false;
  }

  // Missing EAS: check if it's relevant to the display model
  const displayModel = merchandiseDisplay || 'Open Shelving'; // default to most permissive

  switch (displayModel) {
    case 'Open Shelving':
      // EAS Critical - customers pick items freely
      return true;
    case 'Locked Cabinets / Tethered':
      // EAS Moderate - items physically secured but still accessible
      return true;
    case 'Behind Counter / Staff Access Only':
      // EAS Not Needed - no customer access to merchandise
      return false;
    case 'Service Only':
      // EAS Not Needed - no physical goods to protect
      return false;
    default:
      // Unknown model: default to penalizing (safer)
      return true;
  }
}

export class RetailAdapter implements RiskEngineAdapter {
  async calculateVulnerability(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let vulnerabilityScore = 3;
    let riskFactorCount = 0;

    // Extract merchandise display from special profile response
    const merchandiseDisplayResponse = responses.get('__profile_merchandiseDisplay');
    const merchandiseDisplay = merchandiseDisplayResponse?.answer as MerchandiseDisplay | undefined;

    // Context-aware EAS vulnerability scoring
    const easSystemResponse = responses.get('eas_system');
    const easAnswer = easSystemResponse?.answer;
    
    if (shouldPenalizeEAS(merchandiseDisplay, easAnswer)) {
      riskFactorCount += 3;
      console.log(`[Retail Adapter] Missing EAS penalty applied for display model: ${merchandiseDisplay || 'Open Shelving'}`);
    } else {
      console.log(`[Retail Adapter] EAS penalty skipped - display model "${merchandiseDisplay}" does not require EAS`);
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
    const residualRisk = inherentRisk * (1 - controlEffectiveness);
    // Normalize to 0-100 scale (max raw score is 5×5×5 = 125)
    return Math.round((residualRisk / 125) * 100);
  }

  async generateRecommendations(
    responses: Map<string, InterviewResponse>,
    threatId: string,
    riskScore: number
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Extract merchandise display for context-aware recommendations
    const merchandiseDisplayResponse = responses.get('__profile_merchandiseDisplay');
    const merchandiseDisplay = merchandiseDisplayResponse?.answer as MerchandiseDisplay | undefined;

    // Context-aware EAS recommendation
    const easSystemResponse = responses.get('eas_system');
    const easAnswer = easSystemResponse?.answer;
    
    if (shouldPenalizeEAS(merchandiseDisplay, easAnswer)) {
      recommendations.push('Install Electronic Article Surveillance (EAS) system at store exits');
      console.log(`[Retail Adapter] EAS recommendation added for display model: ${merchandiseDisplay || 'Open Shelving'}`);
    } else if (easAnswer === 'no' || easAnswer === false) {
      console.log(`[Retail Adapter] EAS recommendation suppressed - display model "${merchandiseDisplay}" does not require EAS`);
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
 * T×V×I methodology per RiskFixer Retail Store Framework
 * 
 * IMPORTS the authoritative calculation functions from retail-interview-mapper.ts:
 * - calculateVulnerabilityFromInterview: 10+ section vulnerability analysis
 * - calculateThreatLikelihoodFromInterview: Incident history & threat patterns
 * - calculateImpactFromInterview: Revenue, merchandise, employee impact
 * - generateControlRecommendations: Gap-based recommendations
 * 
 * Formula: Risk Score = (T × V × I / 125) × 100
 * Scale: 1-5 for each factor, inherent risk 1-125, normalized to 0-100
 */

import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  generateControlRecommendations,
  RETAIL_STORE_THREATS,
  type InterviewResponses,
} from '../../retail-interview-mapper';

export interface ShrinkageRiskScore {
  score: number; // 0-100 (normalized T×V×I)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    threatLikelihood: number; // 1-5 scale
    vulnerability: number; // 1-5 scale
    impact: number; // 1-5 scale
    inherentRisk: number; // T×V×I raw score (1-125)
  };
  riskFactors: string[]; // Contributing factors from survey
}

export interface RetailProfile {
  annualRevenue?: number;
  shrinkageRate?: number; // Percentage (e.g., 2.5 for 2.5%)
  highValueMerchandise?: string[]; // e.g., ['electronics', 'jewelry', 'cosmetics', 'designer_apparel']
  storeFormat?: string; // 'Mall', 'Standalone', 'Strip Center'
  merchandiseDisplay?: MerchandiseDisplay; // How merchandise is presented to customers
  // TCOR - Total Cost of Risk fields
  employeeCount?: number;
  annualTurnoverRate?: number; // percentage (e.g., 50 for 50%)
  avgHiringCost?: number; // dollars per hire
  annualLiabilityEstimates?: number; // annual legal/insurance/WC costs
  securityIncidentsPerYear?: number; // number of incidents
  brandDamageEstimate?: number; // estimated brand/reputation cost
}

export interface AssessmentWithRetailData {
  retailProfile?: RetailProfile;  // camelCase to match Drizzle ORM output
  retail_profile?: RetailProfile; // snake_case fallback for legacy
  [key: string]: any;
}

/**
 * Determine if EAS absence should contribute to vulnerability
 * Context-aware based on merchandise display model
 * (Used to conditionally skip EAS vulnerability for service-only stores)
 */
function shouldApplyEASVulnerability(merchandiseDisplay: MerchandiseDisplay | undefined): boolean {
  const displayModel = merchandiseDisplay || 'Open Shelving';
  
  switch (displayModel) {
    case 'Behind Counter / Staff Access Only':
    case 'Service Only':
      // EAS not needed - no customer access to merchandise
      return false;
    case 'Open Shelving':
    case 'Locked Cabinets / Tethered':
    default:
      // EAS is relevant for these display models
      return true;
  }
}

/**
 * Shrinkage-relevant threat IDs from retail-interview-mapper.ts
 * These threats are combined into a weighted composite shrinkage score
 */
const SHRINKAGE_THREATS = [
  'shoplifting',
  'organized_retail_crime', 
  'employee_theft',
  'cash_handling_theft',
  'inventory_shrinkage',
];

/**
 * Get threat weight dynamically from RETAIL_STORE_THREATS.typicalLikelihood
 * Falls back to 3 if threat not found
 */
function getThreatWeight(threatId: string): number {
  const threat = RETAIL_STORE_THREATS.find(t => t.id === threatId);
  return threat?.typicalLikelihood ?? 3;
}

/**
 * Convert assessment data to InterviewResponses format for framework functions
 * Maps both direct properties and survey response Map entries
 */
function toInterviewResponses(assessment: AssessmentWithRetailData): InterviewResponses {
  const responses: InterviewResponses = {};
  
  // Copy all direct properties (survey responses stored on assessment)
  for (const [key, value] of Object.entries(assessment)) {
    if (key !== 'retailProfile' && key !== 'retail_profile') {
      responses[key] = value;
    }
  }
  
  // Add profile data to responses for framework functions
  const profile = assessment.retailProfile || assessment.retail_profile;
  if (profile) {
    if (profile.shrinkageRate !== undefined) {
      // Map profile shrinkage rate to survey response format
      if (profile.shrinkageRate > 5) {
        responses.shrinkage_1 = 'over 5%';
      } else if (profile.shrinkageRate > 3) {
        responses.shrinkage_1 = '3-5%';
      } else if (profile.shrinkageRate > 1.5) {
        responses.shrinkage_1 = '1.5-3%';
      }
    }
    
    // Map merchandise display for EAS conditionals
    if (profile.merchandiseDisplay) {
      responses.merchandise_display = profile.merchandiseDisplay;
    }
    
    // Map high-value merchandise for impact/likelihood
    if (profile.highValueMerchandise && profile.highValueMerchandise.length > 0) {
      const hasElectronics = profile.highValueMerchandise.some(c => 
        c.toLowerCase().includes('electronic')
      );
      const hasJewelry = profile.highValueMerchandise.some(c => 
        c.toLowerCase().includes('jewelry')
      );
      if (hasElectronics || hasJewelry) {
        responses.store_profile_4 = 'High-value merchandise';
      }
    }
    
    // Map annual revenue for impact calculations
    if (profile.annualRevenue !== undefined) {
      if (profile.annualRevenue > 10000000) {
        responses.store_profile_3 = 'over 10 million';
      } else if (profile.annualRevenue > 3000000) {
        responses.store_profile_3 = '3-10 million';
      }
    }
  }
  
  return responses;
}

/**
 * Calculate Shrinkage Risk Score using Multi-Threat T×V×I Aggregation
 * 
 * Uses authoritative framework functions from retail-interview-mapper.ts
 * Aggregates scores across shrinkage-relevant threats with weighted average
 * 
 * Formula per threat: Risk Score = (T × V × I / 125) × 100
 * Aggregate: Weighted average of threat scores, with MAX guardrail for criticality
 * 
 * Risk Levels (normalized 0-100):
 * - 0-24: LOW
 * - 25-49: MEDIUM  
 * - 50-74: HIGH
 * - 75-100: CRITICAL
 */
export function calculateShrinkageRiskScore(
  assessment: AssessmentWithRetailData
): ShrinkageRiskScore {
  const profile = assessment.retailProfile || assessment.retail_profile || {};
  
  // Convert to InterviewResponses format for framework functions
  const responses = toInterviewResponses(assessment);
  
  // Track aggregated scores and risk factors
  const allRiskFactors: string[] = [];
  let weightedSum = 0;
  let totalWeight = 0;
  let maxNormalizedScore = 0; // Track max normalized score per threat
  let avgVulnerability = 0;
  let avgThreatLikelihood = 0;
  let avgImpact = 0;
  let peakInherentRisk = 0; // For breakdown display
  
  // Calculate T×V×I for each shrinkage-relevant threat
  for (const threatId of SHRINKAGE_THREATS) {
    // Pull weight dynamically from RETAIL_STORE_THREATS
    const weight = getThreatWeight(threatId);
    
    // Call authoritative framework functions
    const vulnerability = calculateVulnerabilityFromInterview(responses, threatId);
    const threatLikelihood = calculateThreatLikelihoodFromInterview(responses, threatId);
    const impact = calculateImpactFromInterview(responses, threatId);
    
    // T×V×I calculation
    const inherentRisk = threatLikelihood * vulnerability * impact;
    
    // Calculate normalized score PER THREAT (for proper CRITICAL detection)
    const threatNormalizedScore = (inherentRisk / 125) * 100;
    
    // Accumulate weighted scores
    weightedSum += threatNormalizedScore * weight;
    totalWeight += weight;
    
    // Track maximum normalized score (for CRITICAL guardrail)
    if (threatNormalizedScore > maxNormalizedScore) {
      maxNormalizedScore = threatNormalizedScore;
      peakInherentRisk = inherentRisk;
    }
    
    // Accumulate for average breakdown
    avgVulnerability += vulnerability * weight;
    avgThreatLikelihood += threatLikelihood * weight;
    avgImpact += impact * weight;
    
    // Capture control recommendations/risk factors PER THREAT
    // generateControlRecommendations returns string[] (control IDs)
    const threatControlRecs = generateControlRecommendations(responses, threatId);
    for (const controlId of threatControlRecs) {
      // Convert control IDs to human-readable format
      const readableControl = controlId
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      allRiskFactors.push(readableControl);
    }
    
    // Add threat-specific risk indicators based on score level
    if (threatNormalizedScore >= 50) {
      const threatName = RETAIL_STORE_THREATS.find(t => t.id === threatId)?.name || threatId;
      allRiskFactors.push(`Elevated ${threatName} risk (${Math.round(threatNormalizedScore)})`);
    }
  }
  
  // Calculate weighted average score
  const weightedAvgScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Use MAX guardrail: if any threat's NORMALIZED score hits CRITICAL (≥75), use that maximum
  // This ensures a single critical threat properly escalates overall risk
  const finalScore = Math.round(maxNormalizedScore >= 75 ? maxNormalizedScore : weightedAvgScore);
  
  // Calculate average breakdown values (weighted)
  const finalVulnerability = totalWeight > 0 ? Math.round(avgVulnerability / totalWeight) : 3;
  const finalThreatLikelihood = totalWeight > 0 ? Math.round(avgThreatLikelihood / totalWeight) : 2;
  const finalImpact = totalWeight > 0 ? Math.round(avgImpact / totalWeight) : 3;
  
  // Add profile-based risk factors
  if (profile.shrinkageRate !== undefined && profile.shrinkageRate > 2.5) {
    allRiskFactors.push(`Elevated shrinkage rate: ${profile.shrinkageRate}%`);
  }
  if (profile.highValueMerchandise && profile.highValueMerchandise.length > 0) {
    allRiskFactors.push(`High-value merchandise: ${profile.highValueMerchandise.join(', ')}`);
  }
  if (profile.storeFormat === 'Standalone') {
    allRiskFactors.push('Standalone location (higher exposure)');
  }
  
  // Check EAS conditional penalty - filter out EAS factors for service-only stores
  if (!shouldApplyEASVulnerability(profile.merchandiseDisplay)) {
    // Remove EAS-related factors for service-only stores (EAS not applicable)
    const easRelatedTerms = ['eas', 'electronic article surveillance', 'tags', 'gates'];
    const filteredFactors = allRiskFactors.filter(f => {
      const lower = f.toLowerCase();
      return !easRelatedTerms.some(term => lower.includes(term));
    });
    // Clear and replace with filtered factors
    allRiskFactors.length = 0;
    allRiskFactors.push(...filteredFactors);
  }

  // Risk level determination per framework thresholds
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (finalScore >= 75) {
    riskLevel = 'CRITICAL';
  } else if (finalScore >= 50) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 25) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Deduplicate risk factors
  const uniqueRiskFactors = Array.from(new Set(allRiskFactors));

  return {
    score: finalScore,
    riskLevel,
    breakdown: {
      threatLikelihood: Math.min(5, finalThreatLikelihood),
      vulnerability: Math.min(5, finalVulnerability),
      impact: Math.min(5, finalImpact),
      inherentRisk: Math.round(peakInherentRisk),
    },
    riskFactors: uniqueRiskFactors,
  };
}

/**
 * TOTAL COST OF RISK (TCOR) CALCULATION
 * Calculates comprehensive annual risk exposure including direct and indirect costs
 */

export interface TCORBreakdown {
  directLoss: number; // Annual shrinkage/theft losses
  turnoverCost: number; // Security-related employee turnover costs
  liabilityCost: number; // Insurance, legal, workers' comp
  incidentCost: number; // Operational disruption from security incidents
  brandDamageCost: number; // Reputation/brand damage
  totalAnnualExposure: number; // Sum of all costs
}

/**
 * Calculate Total Annual Exposure for retail operations
 * 
 * Formula:
 * Total Annual Exposure = Direct Loss + Turnover Cost + Liability Cost + Incident Cost + Brand Damage
 * 
 * Where:
 * - Direct Loss = Annual Revenue × Shrinkage Rate
 * - Turnover Cost = (Employee Count × Turnover Rate × Hiring Cost) × 0.20
 *   (Assumes 20% of turnover is security-related in high-risk retail environments)
 * - Liability Cost = Annual liability/insurance/WC estimates
 * - Incident Cost = Security Incidents × Average Incident Cost ($5,000 per incident baseline)
 * - Brand Damage = Estimated brand/reputation damage
 */
export function calculateTotalCostOfRisk(
  profile: RetailProfile
): TCORBreakdown {
  // 1. DIRECT LOSS (Shrinkage)
  const annualRevenue = profile.annualRevenue || 0;
  const shrinkageRate = profile.shrinkageRate || 0;
  const directLoss = annualRevenue * (shrinkageRate / 100);

  // 2. TURNOVER COST
  const employeeCount = profile.employeeCount || 0;
  const turnoverRate = profile.annualTurnoverRate || 0;
  const avgHiringCost = profile.avgHiringCost || 0;
  // Assume 20% of turnover is security-related (theft, violence, unsafe conditions)
  const securityRelatedTurnoverFactor = 0.20;
  const turnoverCost = employeeCount * (turnoverRate / 100) * avgHiringCost * securityRelatedTurnoverFactor;

  // 3. LIABILITY COST
  const liabilityCost = profile.annualLiabilityEstimates || 0;

  // 4. INCIDENT COST
  const incidentsPerYear = profile.securityIncidentsPerYear || 0;
  const avgIncidentCost = 5000; // $5K baseline (police response, staff time, lost sales, cleanup)
  const incidentCost = incidentsPerYear * avgIncidentCost;

  // 5. BRAND DAMAGE COST
  const brandDamageCost = profile.brandDamageEstimate || 0;

  // TOTAL ANNUAL EXPOSURE
  const totalAnnualExposure = 
    directLoss + 
    turnoverCost + 
    liabilityCost + 
    incidentCost + 
    brandDamageCost;

  return {
    directLoss,
    turnoverCost,
    liabilityCost,
    incidentCost,
    brandDamageCost,
    totalAnnualExposure,
  };
}
