/**
 * Retail Store Risk Engine Adapter
 * Implements retail-specific risk calculation with shrinkage rate adjustments
 * 
 * Key Features:
 * - Increases likelihood based on shrinkage rates
 * - Focus on loss prevention and organized retail crime
 * - Customer volume and traffic pattern analysis
 */

import { RiskEngineAdapter, InterviewResponse, ThreatData, LIKELIHOOD_VALUES, IMPACT_VALUES } from '../types';

export class RetailStoreAdapter implements RiskEngineAdapter {
  /**
   * Calculate vulnerability for retail environments
   * Focus on loss prevention controls and physical security
   */
  async calculateVulnerability(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let vulnerabilityScore = 3; // Start at baseline (moderate)
    let riskFactorCount = 0;

    // Loss prevention controls
    const easSystemResponse = responses.get('eas_system');
    if (easSystemResponse?.answer === 'no' || easSystemResponse?.answer === false) {
      riskFactorCount += 2; // EAS is critical for retail
    }

    const cctvCoverageResponse = responses.get('cctv_coverage');
    if (cctvCoverageResponse?.answer === 'no' || cctvCoverageResponse?.answer === false) {
      riskFactorCount += 2;
    }

    const securityPersonnelResponse = responses.get('security_personnel');
    if (securityPersonnelResponse?.answer === 'no' || securityPersonnelResponse?.answer === false) {
      riskFactorCount += 1;
    }

    const securityTagsResponse = responses.get('security_tags');
    if (securityTagsResponse?.answer === 'no' || securityTagsResponse?.answer === false) {
      riskFactorCount += 1;
    }

    // Inventory controls
    const inventoryAuditsResponse = responses.get('inventory_audits');
    if (inventoryAuditsResponse?.answer === 'no' || inventoryAuditsResponse?.answer === false) {
      riskFactorCount += 1;
    }

    // Access control for back areas
    const backAreaAccessResponse = responses.get('back_area_access_control');
    if (backAreaAccessResponse?.answer === 'no' || backAreaAccessResponse?.answer === false) {
      riskFactorCount += 1;
    }

    // Cash handling security
    const cashHandlingResponse = responses.get('cash_handling_procedures');
    if (cashHandlingResponse?.answer === 'no' || cashHandlingResponse?.answer === false) {
      riskFactorCount += 2;
    }

    // Fitting room monitoring (for apparel stores)
    const fittingRoomMonitoringResponse = responses.get('fitting_room_monitoring');
    if (fittingRoomMonitoringResponse?.answer === 'no' || fittingRoomMonitoringResponse?.answer === false) {
      riskFactorCount += 1;
    }

    // Adjust vulnerability score based on risk factors
    vulnerabilityScore = Math.min(5, vulnerabilityScore + Math.floor(riskFactorCount / 2));

    return vulnerabilityScore;
  }

  /**
   * Calculate likelihood with shrinkage rate adjustments (Section 4.3)
   * Higher shrinkage rates directly increase theft likelihood
   */
  async calculateLikelihood(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let likelihood = 2; // Start at baseline (low)

    // FACTOR 1: Shrinkage Rate (most important for retail)
    // Shrinkage rates directly correlate with theft likelihood
    const shrinkageRateResponse = responses.get('shrinkage_rate');
    if (shrinkageRateResponse?.answer) {
      const answer = shrinkageRateResponse.answer.toString().toLowerCase();
      
      // Industry average is 1.4% - 1.6%
      if (answer.includes('less than 1%') || answer.includes('<1%')) {
        likelihood += 0; // Below average = no increase
      } else if (answer.includes('1-2%') || answer.includes('average')) {
        likelihood += 1; // Average = slight increase
      } else if (answer.includes('2-3%') || answer.includes('above average')) {
        likelihood += 2; // Above average = significant increase
      } else if (answer.includes('3%+') || answer.includes('>3%') || answer.includes('high')) {
        likelihood += 3; // High shrinkage = major increase
      }
    }

    // FACTOR 2: Incident History
    const priorTheftIncidentsResponse = responses.get('prior_theft_incidents');
    if (priorTheftIncidentsResponse?.answer === 'yes' || priorTheftIncidentsResponse?.answer === true) {
      likelihood += 2;
    }

    // Check for organized retail crime
    const organizedRetailCrimeResponse = responses.get('organized_retail_crime');
    if (organizedRetailCrimeResponse?.answer === 'yes' || organizedRetailCrimeResponse?.answer === true) {
      likelihood += 2; // ORC significantly increases likelihood
    }

    // FACTOR 3: Location & Demographics
    const neighborhoodCrimeResponse = responses.get('neighborhood_crime_rate');
    if (neighborhoodCrimeResponse?.answer) {
      const answer = neighborhoodCrimeResponse.answer.toString().toLowerCase();
      if (answer.includes('high') || answer.includes('very high')) {
        likelihood += 1;
      }
    }

    // FACTOR 4: Store Layout & Blind Spots
    const blindSpotsResponse = responses.get('blind_spots');
    if (blindSpotsResponse?.answer === 'yes' || blindSpotsResponse?.answer === true) {
      likelihood += 1;
    }

    // FACTOR 5: Customer Volume
    const customerVolumeResponse = responses.get('customer_volume');
    if (customerVolumeResponse?.answer) {
      const answer = customerVolumeResponse.answer.toString().toLowerCase();
      if (answer.includes('high') || answer.includes('very high')) {
        likelihood += 1; // High traffic = more opportunities
      }
    }

    // FACTOR 6: High-value merchandise
    const highValueMerchandiseResponse = responses.get('high_value_merchandise');
    if (highValueMerchandiseResponse?.answer === 'yes' || highValueMerchandiseResponse?.answer === true) {
      likelihood += 1;
    }

    // FACTOR 7: Employee theft indicators
    const employeeTurnoverResponse = responses.get('employee_turnover');
    if (employeeTurnoverResponse?.answer) {
      const answer = employeeTurnoverResponse.answer.toString().toLowerCase();
      if (answer.includes('high') || answer.includes('very high')) {
        likelihood += 1; // High turnover correlates with internal theft
      }
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

    // Adjust based on store characteristics
    const annualRevenueResponse = responses.get('annual_revenue');
    if (annualRevenueResponse?.answer) {
      const answer = annualRevenueResponse.answer.toString().toLowerCase();
      if (answer.includes('high') || answer.includes('>$10m')) {
        impact = Math.min(5, impact + 1); // Higher revenue = higher impact
      }
    }

    // High-value merchandise increases impact
    const averageItemValueResponse = responses.get('average_item_value');
    if (averageItemValueResponse?.answer) {
      const answer = averageItemValueResponse.answer.toString().toLowerCase();
      if (answer.includes('high') || answer.includes('>$500')) {
        impact = Math.min(5, impact + 1);
      }
    }

    // Threat-specific adjustments
    if (threatId.includes('robbery') || threatId.includes('armed')) {
      impact = Math.min(5, impact + 1); // Violence threats have higher impact
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
    // Standard T×V×I formula for retail
    // Risk = (T × V) × I × (1 - C_e)
    
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

    // EAS system
    const easSystemResponse = responses.get('eas_system');
    if (easSystemResponse?.answer === 'no' || easSystemResponse?.answer === false) {
      recommendations.push('Install Electronic Article Surveillance (EAS) system at all exits');
    }

    // CCTV surveillance
    const cctvCoverageResponse = responses.get('cctv_coverage');
    if (cctvCoverageResponse?.answer === 'no' || cctvCoverageResponse?.answer === false) {
      recommendations.push('Install comprehensive CCTV coverage of sales floor, exits, and high-value merchandise areas');
    }

    // Loss prevention personnel
    const securityPersonnelResponse = responses.get('security_personnel');
    if (securityPersonnelResponse?.answer === 'no' || securityPersonnelResponse?.answer === false) {
      if (riskScore >= 40) {
        recommendations.push('Hire uniformed security officers or loss prevention personnel');
      } else {
        recommendations.push('Consider loss prevention personnel for peak hours');
      }
    }

    // Security tags
    const securityTagsResponse = responses.get('security_tags');
    if (securityTagsResponse?.answer === 'no' || securityTagsResponse?.answer === false) {
      recommendations.push('Implement security tagging program for high-value merchandise');
    }

    // Inventory audits
    const inventoryAuditsResponse = responses.get('inventory_audits');
    if (inventoryAuditsResponse?.answer === 'no' || inventoryAuditsResponse?.answer === false) {
      recommendations.push('Conduct regular inventory audits and shrink analysis');
    }

    // High shrinkage rate
    const shrinkageRateResponse = responses.get('shrinkage_rate');
    if (shrinkageRateResponse?.answer) {
      const answer = shrinkageRateResponse.answer.toString().toLowerCase();
      if (answer.includes('2-3%') || answer.includes('3%+') || answer.includes('above average')) {
        recommendations.push('Conduct comprehensive loss prevention audit to identify shrinkage sources');
        recommendations.push('Implement employee awareness training on theft prevention');
      }
    }

    // Organized retail crime
    const organizedRetailCrimeResponse = responses.get('organized_retail_crime');
    if (organizedRetailCrimeResponse?.answer === 'yes' || organizedRetailCrimeResponse?.answer === true) {
      recommendations.push('Coordinate with local law enforcement on organized retail crime');
      recommendations.push('Implement facial recognition or license plate recognition for known offenders');
    }

    // Cash handling
    const cashHandlingResponse = responses.get('cash_handling_procedures');
    if (cashHandlingResponse?.answer === 'no' || cashHandlingResponse?.answer === false) {
      recommendations.push('Implement secure cash handling procedures and time-delay safes');
    }

    // Fitting rooms
    const fittingRoomMonitoringResponse = responses.get('fitting_room_monitoring');
    if (fittingRoomMonitoringResponse?.answer === 'no' || fittingRoomMonitoringResponse?.answer === false) {
      recommendations.push('Implement fitting room monitoring and item count procedures');
    }

    // Employee screening
    const backgroundChecksResponse = responses.get('employee_background_checks');
    if (backgroundChecksResponse?.answer === 'no' || backgroundChecksResponse?.answer === false) {
      recommendations.push('Conduct background checks on all new hires');
    }

    return recommendations;
  }
}
