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
    riskScore: number
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // High-risk recommendations
    if (riskScore >= 50) {
      recommendations.push('Consider 24/7 executive protection detail');
      recommendations.push('Implement route randomization protocols');
      recommendations.push('Conduct comprehensive threat assessment');
    }

    // Residential security recommendations
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
      recommendations.push('Consider installing panic room with independent communications');
    }

    // Transportation security recommendations
    const hasDriverResponse = responses.get('transport_professional_driver');
    if (hasDriverResponse?.answer === 'no' || hasDriverResponse?.answer === false) {
      recommendations.push('Employ professional security driver service');
    }

    const armoredVehicleResponse = responses.get('transport_armored_vehicle');
    if (armoredVehicleResponse?.answer === 'no' || armoredVehicleResponse?.answer === false && riskScore >= 40) {
      recommendations.push('Consider armored vehicle for high-risk situations');
    }

    // Digital privacy recommendations
    const addressExposureResponse = responses.get('residence_publicly_known');
    if (addressExposureResponse?.answer === 'yes' || addressExposureResponse?.answer === true) {
      recommendations.push('Engage digital privacy services to remove PII from public databases');
    }

    // Family security recommendations
    const familyTrainingResponse = responses.get('family_security_training');
    if (familyTrainingResponse?.answer === 'no' || familyTrainingResponse?.answer === false) {
      recommendations.push('Provide family security awareness training');
    }

    return recommendations;
  }
}
