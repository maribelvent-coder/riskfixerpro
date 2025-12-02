/**
 * Executive Protection Risk Engine Adapter
 * Implements EP-specific risk formula: Risk_EP = (T × V × E) × I × (1 - C_e)
 * 
 * Key Difference: Introduces Exposure (E) factor based on:
 * - Public profile and visibility
 * - Pattern predictability
 * - Digital footprint
 * - Geographic crime risk
 */

import { RiskEngineAdapter, InterviewResponse, ThreatData, LIKELIHOOD_VALUES, IMPACT_VALUES } from '../types';

/**
 * Executive Protection Profile (subset used for TCOR)
 */
export interface ExecutiveProfile {
  annualProtectionBudget?: number;
  insuranceDeductible?: number;
  dailyLossOfValue?: number;
  netWorthRange?: string;
}

/**
 * TCOR Breakdown for Executive Protection
 */
export interface EPTCORBreakdown {
  ransomExposure: number; // Potential ransom payment (K&R insurance deductible)
  incapacitationCost: number; // Cost of executive unavailability
  directSecurityCost: number; // Annual protection budget
  totalPotentialLoss: number; // Ransom + Incapacitation
  totalAnnualExposure: number; // Protection cost vs potential loss
  costBenefitRatio: number; // Ratio of protection cost to potential loss
}

/**
 * Calculate Total Cost of Risk (TCOR) for Executive Protection
 * 
 * Formula:
 * Total Annual Exposure = Ransom Exposure + Incapacitation Cost
 * 
 * Where:
 * - Ransom Exposure = K&R Insurance Deductible (out-of-pocket cost)
 * - Incapacitation Cost = Daily Loss of Value × 30 days (avg kidnapping duration)
 * - Direct Security Cost = Annual Protection Budget
 * - Cost-Benefit Ratio = Protection Cost / Total Potential Loss
 * 
 * Note: This is EP-specific and does NOT use corporate turnover metrics
 */
export function calculateTCOR(profile: ExecutiveProfile): EPTCORBreakdown {
  // 1. RANSOM EXPOSURE (K&R Insurance Deductible)
  const ransomExposure = profile.insuranceDeductible || 0;

  // 2. INCAPACITATION COST
  // Average kidnapping duration: 30 days (based on K&R industry data)
  const avgKidnapDuration = 30;
  const dailyLoss = profile.dailyLossOfValue || 0;
  const incapacitationCost = dailyLoss * avgKidnapDuration;

  // 3. DIRECT SECURITY COST (Annual Protection Budget)
  const directSecurityCost = profile.annualProtectionBudget || 0;

  // 4. TOTAL POTENTIAL LOSS
  const totalPotentialLoss = ransomExposure + incapacitationCost;

  // 5. TOTAL ANNUAL EXPOSURE (Protection Cost vs Potential Loss)
  // For EP, we compare what we spend vs what we could lose
  const totalAnnualExposure = Math.max(directSecurityCost, totalPotentialLoss);

  // 6. COST-BENEFIT RATIO (Protection ROI indicator)
  const costBenefitRatio = totalPotentialLoss > 0 
    ? directSecurityCost / totalPotentialLoss 
    : 0;

  return {
    ransomExposure,
    incapacitationCost,
    directSecurityCost,
    totalPotentialLoss,
    totalAnnualExposure,
    costBenefitRatio,
  };
}

export class ExecutiveProtectionAdapter implements RiskEngineAdapter {
  /**
   * Calculate Exposure factor (E) - unique to Executive Protection
   * E = (Public_Profile × 0.4) + (Pattern_Predictability × 0.3) + 
   *     (Digital_Footprint × 0.2) + (Geographic_Risk × 0.1)
   * 
   * @param responses - Interview responses
   * @returns Exposure score (1-5)
   */
  async calculateExposure(responses: Map<string, InterviewResponse>): Promise<number> {
    let publicProfile = 3; // Default: medium
    let patternPredictability = 3; // Default: medium
    let digitalFootprint = 3; // Default: medium
    let geographicRisk = 2; // Default: low-medium

    // PUBLIC PROFILE (40% weight)
    const publicProfileResponse = responses.get('profile_public_visibility');
    if (publicProfileResponse?.answer) {
      const answer = publicProfileResponse.answer.toString().toLowerCase();
      if (answer.includes('private') || answer.includes('very low')) {
        publicProfile = 1;
      } else if (answer.includes('low')) {
        publicProfile = 2;
      } else if (answer.includes('medium')) {
        publicProfile = 3;
      } else if (answer.includes('high') && !answer.includes('very')) {
        publicProfile = 4;
      } else if (answer.includes('very high') || answer.includes('internationally known')) {
        publicProfile = 5;
      }
    }

    // PATTERN PREDICTABILITY (30% weight)
    const routineResponse = responses.get('routine_predictability');
    if (routineResponse?.answer) {
      const answer = routineResponse.answer.toString().toLowerCase();
      if (answer.includes('highly variable') || answer.includes('unpredictable')) {
        patternPredictability = 1;
      } else if (answer.includes('somewhat variable')) {
        patternPredictability = 2;
      } else if (answer.includes('moderately predictable')) {
        patternPredictability = 3;
      } else if (answer.includes('very predictable')) {
        patternPredictability = 4;
      } else if (answer.includes('extremely predictable') || answer.includes('fixed schedule')) {
        patternPredictability = 5;
      }
    }

    // Check for fixed routes
    const fixedRouteResponse = responses.get('travel_route_variation');
    if (fixedRouteResponse?.answer === 'no' || fixedRouteResponse?.answer === false) {
      patternPredictability = Math.min(5, patternPredictability + 1);
    }

    // DIGITAL FOOTPRINT (20% weight)
    const socialMediaResponse = responses.get('social_media_exposure');
    if (socialMediaResponse?.answer) {
      const answer = socialMediaResponse.answer.toString().toLowerCase();
      if (answer.includes('minimal') || answer.includes('none')) {
        digitalFootprint = 1;
      } else if (answer.includes('low')) {
        digitalFootprint = 2;
      } else if (answer.includes('moderate')) {
        digitalFootprint = 3;
      } else if (answer.includes('high')) {
        digitalFootprint = 4;
      } else if (answer.includes('extensive')) {
        digitalFootprint = 5;
      }
    }

    // Check if address is publicly known
    const addressExposureResponse = responses.get('residence_publicly_known');
    if (addressExposureResponse?.answer === 'yes' || addressExposureResponse?.answer === true) {
      digitalFootprint = Math.min(5, digitalFootprint + 1);
    }

    // GEOGRAPHIC RISK (10% weight)
    // This could be enhanced with actual crime data integration
    const neighborhoodResponse = responses.get('residence_neighborhood_safety');
    if (neighborhoodResponse?.answer) {
      const rating = typeof neighborhoodResponse.answer === 'number' 
        ? neighborhoodResponse.answer 
        : parseInt(neighborhoodResponse.answer.toString());
      
      if (!isNaN(rating)) {
        // Invert the rating (higher safety rating = lower geographic risk)
        geographicRisk = 6 - rating;
      }
    }

    // Calculate weighted Exposure score (return exact decimal, no rounding)
    const exposure = (
      publicProfile * 0.4 +
      patternPredictability * 0.3 +
      digitalFootprint * 0.2 +
      geographicRisk * 0.1
    );

    // Return exact weighted value for use in Risk_EP formula
    // Clamp to 1-5 range but preserve decimal precision
    return Math.min(5, Math.max(1, exposure));
  }

  async calculateVulnerability(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let vulnerability = 3; // Start at baseline (moderate)
    let riskFactorCount = 0;

    // RESIDENTIAL SECURITY
    const hasSecuritySystemResponse = responses.get('residence_alarm_system');
    if (hasSecuritySystemResponse?.answer === 'no' || hasSecuritySystemResponse?.answer === false) {
      riskFactorCount += 2;
    }

    const hasCCTVResponse = responses.get('residence_cctv');
    if (hasCCTVResponse?.answer === 'no' || hasCCTVResponse?.answer === false) {
      riskFactorCount++;
    }

    const gatedCommunityResponse = responses.get('residence_gated_community');
    if (gatedCommunityResponse?.answer === 'no' || gatedCommunityResponse?.answer === false) {
      riskFactorCount++;
    }

    // TRANSPORTATION SECURITY
    const hasDriverResponse = responses.get('transport_professional_driver');
    if (hasDriverResponse?.answer === 'no' || hasDriverResponse?.answer === false) {
      riskFactorCount++;
    }

    const armoredVehicleResponse = responses.get('transport_armored_vehicle');
    if (armoredVehicleResponse?.answer === 'no' || armoredVehicleResponse?.answer === false) {
      riskFactorCount++;
    }

    // PERSONAL PROTECTION
    const hasProtectionDetailResponse = responses.get('security_protection_detail');
    if (hasProtectionDetailResponse?.answer === 'no' || hasProtectionDetailResponse?.answer === false) {
      riskFactorCount += 2;
    }

    // FAMILY SECURITY
    const familyTrainingResponse = responses.get('family_security_training');
    if (familyTrainingResponse?.answer === 'no' || familyTrainingResponse?.answer === false) {
      riskFactorCount++;
    }

    // Adjust vulnerability score based on risk factors
    vulnerability = Math.min(5, vulnerability + Math.floor(riskFactorCount / 2));

    return vulnerability;
  }

  async calculateLikelihood(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let likelihood = 2; // Start at baseline (low)

    // INCIDENT HISTORY (most important)
    const priorIncidentsResponse = responses.get('threats_prior_incidents');
    if (priorIncidentsResponse?.answer === 'yes' || priorIncidentsResponse?.answer === true) {
      likelihood += 2;
    }

    const priorThreatsResponse = responses.get('threats_received_threats');
    if (priorThreatsResponse?.answer === 'yes' || priorThreatsResponse?.answer === true) {
      likelihood += 1;
    }

    // THREAT PERCEPTION
    const perceivedThreatResponse = responses.get('threats_perceived_level');
    if (perceivedThreatResponse?.answer) {
      const answer = perceivedThreatResponse.answer.toString().toLowerCase();
      if (answer.includes('high') || answer.includes('very high')) {
        likelihood += 1;
      }
    }

    // RESTRAINING ORDERS
    const restrainingOrdersResponse = responses.get('threats_restraining_orders');
    if (restrainingOrdersResponse?.answer === 'yes' || restrainingOrdersResponse?.answer === true) {
      likelihood += 1;
    }

    return Math.min(5, likelihood);
  }

  async calculateImpact(
    responses: Map<string, InterviewResponse>,
    threatId: string,
    threat: ThreatData
  ): Promise<number> {
    // Use threat library's typical impact as baseline
    const typicalImpact = threat.typicalImpact;
    let impact = IMPACT_VALUES[typicalImpact as keyof typeof IMPACT_VALUES]?.value || 3;

    // For EP, impact can be adjusted based on family situation
    const hasFamilyResponse = responses.get('family_members_count');
    if (hasFamilyResponse?.answer) {
      const count = typeof hasFamilyResponse.answer === 'number' 
        ? hasFamilyResponse.answer 
        : parseInt(hasFamilyResponse.answer.toString());
      
      if (count > 0) {
        // Presence of family increases impact for most threats
        impact = Math.min(5, impact + 1);
      }
    }

    return impact;
  }

  calculateRisk(
    likelihood: number,
    vulnerability: number,
    impact: number,
    exposure?: number,
    controlEffectiveness: number = 0
  ): number {
    // EP-specific formula: Risk_EP = (T × V × E) × I × (1 - C_e)
    // T = Threat (likelihood)
    // V = Vulnerability
    // E = Exposure
    // I = Impact
    // C_e = Control Effectiveness (0-1)

    const exposureValue = exposure || 3; // Default to medium if not provided
    
    const inherentRisk = likelihood * vulnerability * exposureValue * impact;
    const risk = inherentRisk * (1 - controlEffectiveness);

    return Math.round(risk);
  }

  async generateRecommendations(
    responses: Map<string, InterviewResponse>,
    threatId: string,
    riskScore: number,
    profile?: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Extract profile context for EP-specific filtering
    const netWorthRange = profile?.netWorthRange || '';
    const publicProfile = profile?.publicProfile || 'medium';
    
    // Determine if this is a low-value target (<$10M net worth)
    const isLowValueTarget = !netWorthRange || 
      netWorthRange === 'under_1m' || 
      netWorthRange === '1m_5m' || 
      netWorthRange === '5m_10m';
    
    // Determine if this is a private/low-profile individual
    const isPrivateProfile = publicProfile === 'private' || publicProfile === 'very_low';
    
    // Determine if this is a low-risk scenario (low net worth + low risk score)
    const isLowRisk = isLowValueTarget && riskScore < 25;

    // HIGH-RISK RECOMMENDATIONS (Context-Aware)
    if (riskScore >= 50) {
      // Only recommend 24/7 protection for high-value targets OR high-risk scenarios
      if (!isLowValueTarget || riskScore >= 75) {
        recommendations.push('Consider 24/7 executive protection detail');
      } else {
        // For lower net worth but high risk, recommend part-time protection
        recommendations.push('Consider part-time executive protection for high-risk activities');
      }
      
      recommendations.push('Implement route randomization protocols');
      recommendations.push('Conduct comprehensive threat assessment');
    }

    // RESIDENTIAL SECURITY (Priority for Low-Risk Profiles)
    const hasSecuritySystemResponse = responses.get('residence_alarm_system');
    if (hasSecuritySystemResponse?.answer === 'no' || hasSecuritySystemResponse?.answer === false) {
      recommendations.push('Install comprehensive residential alarm system with monitoring');
    }

    const hasCCTVResponse = responses.get('residence_cctv');
    if (hasCCTVResponse?.answer === 'no' || hasCCTVResponse?.answer === false) {
      recommendations.push('Install CCTV surveillance with off-site monitoring');
    }

    const hasPanicRoomResponse = responses.get('residence_panic_room');
    if (hasPanicRoomResponse?.answer === 'no' || hasPanicRoomResponse?.answer === false) {
      // Prioritize for low-risk profiles as cost-effective hardening
      if (isLowRisk) {
        recommendations.push('Install panic room with independent communications (cost-effective hardening)');
      } else {
        recommendations.push('Consider installing panic room with independent communications');
      }
    }

    // TRANSPORTATION SECURITY (Context-Aware)
    const hasDriverResponse = responses.get('transport_professional_driver');
    if (hasDriverResponse?.answer === 'no' || hasDriverResponse?.answer === false && riskScore >= 30) {
      recommendations.push('Employ professional security driver service');
    }

    // Armored vehicle - only for high-value targets OR critical risk
    const armoredVehicleResponse = responses.get('transport_armored_vehicle');
    if (armoredVehicleResponse?.answer === 'no' || armoredVehicleResponse?.answer === false) {
      if (!isLowValueTarget && riskScore >= 40) {
        recommendations.push('Consider armored vehicle for high-risk situations');
      }
      // Suppress for low net worth + low risk scenarios
    }

    // DIGITAL PRIVACY (Priority for Low-Risk Profiles & Always Relevant)
    const addressExposureResponse = responses.get('residence_publicly_known');
    if (addressExposureResponse?.answer === 'yes' || addressExposureResponse?.answer === true) {
      if (isLowRisk) {
        recommendations.push('Engage digital privacy services to remove PII from public databases (high ROI for low-risk profiles)');
      } else {
        recommendations.push('Engage digital privacy services to remove PII from public databases');
      }
    }

    // MEDIA MONITORING - Only for public profiles
    if (!isPrivateProfile && (publicProfile === 'high' || publicProfile === 'very_high')) {
      const hasMediaMonitoringResponse = responses.get('media_monitoring');
      if (hasMediaMonitoringResponse?.answer === 'no' || hasMediaMonitoringResponse?.answer === false) {
        recommendations.push('Implement media and social media monitoring for threat intelligence');
      }
    }
    // Suppress media monitoring for private profiles

    // TRAVEL INTELLIGENCE (Priority for Low-Risk Profiles)
    if (isLowRisk || riskScore >= 25) {
      const hasTravelIntelResponse = responses.get('travel_intelligence');
      if (hasTravelIntelResponse?.answer === 'no' || hasTravelIntelResponse?.answer === false) {
        if (isLowRisk) {
          recommendations.push('Implement travel security intelligence briefings (high ROI for frequent travelers)');
        } else {
          recommendations.push('Implement travel security intelligence briefings');
        }
      }
    }

    // FAMILY SECURITY AWARENESS (Always Relevant)
    const familyTrainingResponse = responses.get('family_security_training');
    if (familyTrainingResponse?.answer === 'no' || familyTrainingResponse?.answer === false) {
      recommendations.push('Provide family security awareness training');
    }

    return recommendations;
  }
}
