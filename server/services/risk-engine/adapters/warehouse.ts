/**
 * Warehouse/Distribution Center Risk Engine Adapter
 * Implements warehouse-specific risk calculation with cargo theft focus
 * 
 * Key Features:
 * - Cargo theft vulnerability assessment
 * - Vehicle and loading dock security
 * - Perimeter and yard security
 */

import { RiskEngineAdapter, InterviewResponse, ThreatData, LIKELIHOOD_VALUES, IMPACT_VALUES } from '../types';

export class WarehouseAdapter implements RiskEngineAdapter {
  /**
   * Calculate vulnerability for warehouse environments
   * Focus on cargo theft, perimeter security, and loading dock controls
   */
  async calculateVulnerability(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let vulnerabilityScore = 3; // Start at baseline (moderate)
    let riskFactorCount = 0;

    // Perimeter security
    const perimeterFencingResponse = responses.get('perimeter_fencing');
    if (perimeterFencingResponse?.answer === 'no' || perimeterFencingResponse?.answer === false) {
      riskFactorCount += 3; // Critical for warehouses
    }

    const fenceHeightResponse = responses.get('fence_height');
    if (fenceHeightResponse?.answer) {
      const height = typeof fenceHeightResponse.answer === 'number' 
        ? fenceHeightResponse.answer 
        : parseInt(fenceHeightResponse.answer.toString());
      
      if (!isNaN(height) && height < 8) {
        riskFactorCount += 1; // Fence too low
      }
    }

    // Vehicle gates
    const vehicleGatesResponse = responses.get('vehicle_gates_automated');
    if (vehicleGatesResponse?.answer === 'no' || vehicleGatesResponse?.answer === false) {
      riskFactorCount += 2;
    }

    // Yard and loading dock surveillance
    const yardCCTVResponse = responses.get('yard_cctv_coverage');
    if (yardCCTVResponse?.answer === 'no' || yardCCTVResponse?.answer === false) {
      riskFactorCount += 2;
    }

    const dockCCTVResponse = responses.get('loading_dock_cctv');
    if (dockCCTVResponse?.answer === 'no' || dockCCTVResponse?.answer === false) {
      riskFactorCount += 2;
    }

    // Security seals and trailer security
    const securitySealsResponse = responses.get('security_seals');
    if (securitySealsResponse?.answer === 'no' || securitySealsResponse?.answer === false) {
      riskFactorCount += 2; // Critical for cargo theft prevention
    }

    const sealInspectionResponse = responses.get('seal_inspection_procedures');
    if (sealInspectionResponse?.answer === 'no' || sealInspectionResponse?.answer === false) {
      riskFactorCount += 1;
    }

    // Vehicle inspection
    const vehicleInspectionResponse = responses.get('vehicle_inspection');
    if (vehicleInspectionResponse?.answer === 'no' || vehicleInspectionResponse?.answer === false) {
      riskFactorCount += 2;
    }

    // Trailer parking security
    const trailerParkingSecurityResponse = responses.get('trailer_parking_security');
    if (trailerParkingSecurityResponse?.answer === 'no' || trailerParkingSecurityResponse?.answer === false) {
      riskFactorCount += 1;
    }

    // Lighting
    const yardLightingResponse = responses.get('yard_lighting');
    if (yardLightingResponse?.answer === 'no' || yardLightingResponse?.answer === false) {
      riskFactorCount += 1;
    }

    // Security guards
    const securityGuardsResponse = responses.get('security_guards');
    if (securityGuardsResponse?.answer === 'no' || securityGuardsResponse?.answer === false) {
      riskFactorCount += 1;
    }

    // Threat-specific adjustments
    if (threatId.includes('cargo_theft')) {
      // Additional cargo theft vulnerability factors
      const highValueCargoResponse = responses.get('high_value_cargo');
      if (highValueCargoResponse?.answer === 'yes' || highValueCargoResponse?.answer === true) {
        riskFactorCount += 2; // High-value cargo = prime target
      }

      const overnightStorageResponse = responses.get('overnight_trailer_storage');
      if (overnightStorageResponse?.answer === 'yes' || overnightStorageResponse?.answer === true) {
        riskFactorCount += 1; // Overnight storage increases risk
      }
    }

    // Adjust vulnerability score based on risk factors
    vulnerabilityScore = Math.min(5, vulnerabilityScore + Math.floor(riskFactorCount / 2));

    return vulnerabilityScore;
  }

  /**
   * Calculate likelihood for warehouse threats
   * Cargo theft likelihood based on location, history, and cargo value
   */
  async calculateLikelihood(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let likelihood = 2; // Start at baseline (low)

    // FACTOR 1: Incident History
    const priorCargoTheftResponse = responses.get('prior_cargo_theft');
    if (priorCargoTheftResponse?.answer === 'yes' || priorCargoTheftResponse?.answer === true) {
      likelihood += 3; // Historical cargo theft significantly increases likelihood
    }

    const priorBreakInsResponse = responses.get('prior_break_ins');
    if (priorBreakInsResponse?.answer === 'yes' || priorBreakInsResponse?.answer === true) {
      likelihood += 2;
    }

    // FACTOR 2: Location & Regional Cargo Theft Rates
    const cargoTheftHotspotResponse = responses.get('cargo_theft_hotspot');
    if (cargoTheftHotspotResponse?.answer === 'yes' || cargoTheftHotspotResponse?.answer === true) {
      likelihood += 2; // Regional hotspots = higher likelihood
    }

    const neighborhoodCrimeResponse = responses.get('neighborhood_crime_rate');
    if (neighborhoodCrimeResponse?.answer) {
      const answer = neighborhoodCrimeResponse.answer.toString().toLowerCase();
      if (answer.includes('high') || answer.includes('very high')) {
        likelihood += 1;
      }
    }

    // FACTOR 3: Cargo Characteristics
    if (threatId.includes('cargo_theft')) {
      const highValueCargoResponse = responses.get('high_value_cargo');
      if (highValueCargoResponse?.answer === 'yes' || highValueCargoResponse?.answer === true) {
        likelihood += 2; // High-value cargo attracts organized theft rings
      }

      const cargoTypeResponse = responses.get('cargo_type');
      if (cargoTypeResponse?.answer) {
        const answer = cargoTypeResponse.answer.toString().toLowerCase();
        // High-risk cargo types
        if (answer.includes('electronics') || answer.includes('pharmaceuticals') || 
            answer.includes('tobacco') || answer.includes('alcohol')) {
          likelihood += 1;
        }
      }

      const overnightStorageResponse = responses.get('overnight_trailer_storage');
      if (overnightStorageResponse?.answer === 'yes' || overnightStorageResponse?.answer === true) {
        likelihood += 1; // Overnight storage = more opportunity
      }
    }

    // FACTOR 4: Visibility and Isolation
    const isolatedLocationResponse = responses.get('isolated_location');
    if (isolatedLocationResponse?.answer === 'yes' || isolatedLocationResponse?.answer === true) {
      likelihood += 1; // Isolated locations are easier targets
    }

    const visibilityFromRoadResponse = responses.get('visibility_from_road');
    if (visibilityFromRoadResponse?.answer === 'no' || visibilityFromRoadResponse?.answer === false) {
      likelihood += 1; // Low visibility = easier to operate undetected
    }

    // FACTOR 5: Operational Patterns
    const predictableScheduleResponse = responses.get('predictable_shipping_schedule');
    if (predictableScheduleResponse?.answer === 'yes' || predictableScheduleResponse?.answer === true) {
      likelihood += 1; // Predictable patterns enable planning
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

    // CARGO-SPECIFIC IMPACT AMPLIFICATION
    // For cargo theft threats, significantly increase impact based on cargo characteristics
    if (threatId.includes('cargo_theft') || threat.name.toLowerCase().includes('cargo')) {
      
      // Factor 1: Cargo Value
      const averageCargoValueResponse = responses.get('average_cargo_value');
      if (averageCargoValueResponse?.answer) {
        const answer = averageCargoValueResponse.answer.toString().toLowerCase();
        if (answer.includes('very high') || answer.includes('>$1m')) {
          impact = Math.min(5, impact + 2); // Major financial impact
        } else if (answer.includes('high') || answer.includes('>$500k')) {
          impact = Math.min(5, impact + 1.5);
        } else if (answer.includes('medium') || answer.includes('>$250k')) {
          impact = Math.min(5, impact + 0.5);
        }
      }

      // Factor 2: Cargo Type - High-risk commodities
      const cargoTypeResponse = responses.get('cargo_type');
      if (cargoTypeResponse?.answer) {
        const answer = cargoTypeResponse.answer.toString().toLowerCase();
        // Highest-risk cargo types (organized crime targets)
        if (answer.includes('pharmaceuticals') || answer.includes('electronics')) {
          impact = Math.min(5, impact + 1); // High resale value
        } else if (answer.includes('tobacco') || answer.includes('alcohol')) {
          impact = Math.min(5, impact + 0.5); // Moderate resale value
        }
      }

      // Factor 3: High-value cargo flag
      const highValueCargoResponse = responses.get('high_value_cargo');
      if (highValueCargoResponse?.answer === 'yes' || highValueCargoResponse?.answer === true) {
        impact = Math.min(5, impact + 0.5); // Additional amplification
      }

      // Factor 4: Business criticality
      const businessCriticalCargoResponse = responses.get('business_critical_cargo');
      if (businessCriticalCargoResponse?.answer === 'yes' || businessCriticalCargoResponse?.answer === true) {
        impact = Math.min(5, impact + 1); // Loss disrupts operations
      }

      // Factor 5: Client relationships and contracts
      const clientContractsResponse = responses.get('client_contracts_at_risk');
      if (clientContractsResponse?.answer === 'yes' || clientContractsResponse?.answer === true) {
        impact = Math.min(5, impact + 1); // Reputational and contractual damage
      }

      // Factor 6: Volume/throughput
      const cargoVolumeResponse = responses.get('cargo_volume');
      if (cargoVolumeResponse?.answer) {
        const answer = cargoVolumeResponse.answer.toString().toLowerCase();
        if (answer.includes('high') || answer.includes('very high')) {
          impact = Math.min(5, impact + 0.5); // High volume = larger potential losses
        }
      }
    } else {
      // Non-cargo theft threats - standard adjustments
      const averageCargoValueResponse = responses.get('average_cargo_value');
      if (averageCargoValueResponse?.answer) {
        const answer = averageCargoValueResponse.answer.toString().toLowerCase();
        if (answer.includes('very high') || answer.includes('>$1m')) {
          impact = Math.min(5, impact + 1);
        } else if (answer.includes('high') || answer.includes('>$500k')) {
          impact = Math.min(5, impact + 0.5);
        }
      }

      const businessCriticalCargoResponse = responses.get('business_critical_cargo');
      if (businessCriticalCargoResponse?.answer === 'yes' || businessCriticalCargoResponse?.answer === true) {
        impact = Math.min(5, impact + 1);
      }
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
    // Standard T×V×I formula for warehouses
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

    // Perimeter security
    const perimeterFencingResponse = responses.get('perimeter_fencing');
    if (perimeterFencingResponse?.answer === 'no' || perimeterFencingResponse?.answer === false) {
      recommendations.push('Install chain-link perimeter fencing (minimum 8 feet height) with barbed wire topping');
    }

    // Vehicle gates
    const vehicleGatesResponse = responses.get('vehicle_gates_automated');
    if (vehicleGatesResponse?.answer === 'no' || vehicleGatesResponse?.answer === false) {
      recommendations.push('Install automated vehicle gates with access control and logging');
    }

    // CCTV surveillance
    const yardCCTVResponse = responses.get('yard_cctv_coverage');
    if (yardCCTVResponse?.answer === 'no' || yardCCTVResponse?.answer === false) {
      recommendations.push('Install comprehensive CCTV coverage of yard, loading docks, and trailer parking areas');
    }

    // Security seals
    const securitySealsResponse = responses.get('security_seals');
    if (securitySealsResponse?.answer === 'no' || securitySealsResponse?.answer === false) {
      recommendations.push('Implement tamper-evident seal program for all trailers and containers');
    }

    const sealInspectionResponse = responses.get('seal_inspection_procedures');
    if (sealInspectionResponse?.answer === 'no' || sealInspectionResponse?.answer === false) {
      recommendations.push('Develop seal inspection and logging procedures for all shipments');
    }

    // Vehicle inspection
    const vehicleInspectionResponse = responses.get('vehicle_inspection');
    if (vehicleInspectionResponse?.answer === 'no' || vehicleInspectionResponse?.answer === false) {
      recommendations.push('Implement vehicle inspection procedures for incoming and outgoing vehicles');
    }

    // Lighting
    const yardLightingResponse = responses.get('yard_lighting');
    if (yardLightingResponse?.answer === 'no' || yardLightingResponse?.answer === false) {
      recommendations.push('Install perimeter and yard lighting for 24/7 illumination');
    }

    // Security guards
    if (riskScore >= 40) {
      const securityGuardsResponse = responses.get('security_guards');
      if (securityGuardsResponse?.answer === 'no' || securityGuardsResponse?.answer === false) {
        recommendations.push('Consider security guards for gate control and after-hours monitoring');
      }
    }

    // High-value cargo specific
    const highValueCargoResponse = responses.get('high_value_cargo');
    if (highValueCargoResponse?.answer === 'yes' || highValueCargoResponse?.answer === true) {
      recommendations.push('Implement GPS tracking for high-value shipments');
      recommendations.push('Consider secure parking area with enhanced security for high-value trailers');
      recommendations.push('Coordinate with law enforcement on cargo theft prevention');
    }

    // Trailer parking
    const trailerParkingSecurityResponse = responses.get('trailer_parking_security');
    if (trailerParkingSecurityResponse?.answer === 'no' || trailerParkingSecurityResponse?.answer === false) {
      recommendations.push('Secure trailer parking area with fencing, lighting, and surveillance');
    }

    // Access control
    const accessControlResponse = responses.get('employee_access_control');
    if (accessControlResponse?.answer === 'no' || accessControlResponse?.answer === false) {
      recommendations.push('Implement employee access control system with badge readers');
    }

    // Driver verification
    const driverVerificationResponse = responses.get('driver_verification');
    if (driverVerificationResponse?.answer === 'no' || driverVerificationResponse?.answer === false) {
      recommendations.push('Implement driver verification procedures with ID checks and pre-registration');
    }

    return recommendations;
  }
}
