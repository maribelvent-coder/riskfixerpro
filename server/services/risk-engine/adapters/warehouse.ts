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

/**
 * CARGO THEFT VULNERABILITY SCORING
 * Standalone 0-100 scoring system for warehouse cargo theft risk
 * Framework: Warehouse Framework v2.0
 */

export interface CargoTheftVulnerabilityScore {
  score: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    locationRisk: number; // Max 20 pts
    highValueGoods: number; // Max 15 pts
    controlGaps: number; // Max 35 pts
    incidentHistory: number; // Max 20 pts
    operationalVulnerabilities: number; // Max 10 pts
  };
}

export interface WarehouseProfile {
  warehouseType?: string;
  squareFootage?: number;
  inventoryValue?: number;
  highValueProducts?: string[]; // e.g., ['electronics', 'pharmaceuticals', 'alcohol', 'designer_clothing']
  loadingDockCount?: number;
  dailyTruckVolume?: number;
  shrinkageRate?: number;
  cargoTheftIncidents?: Array<{
    date: string;
    loss: number;
    insiderInvolvement?: boolean;
  }>;
  locationRisk?: 'High' | 'Medium' | 'Low'; // Placeholder for future crime API integration
  // TCOR - Total Cost of Risk fields
  employeeCount?: number;
  annualTurnoverRate?: number; // percentage (e.g., 50 for 50%)
  avgHiringCost?: number; // dollars per hire
  annualLiabilityEstimates?: number; // annual legal/insurance/WC costs
  securityIncidentsPerYear?: number; // number of incidents
  brandDamageEstimate?: number; // estimated brand/reputation cost
}

export interface AssessmentWithWarehouseData {
  warehouse_profile?: WarehouseProfile;
  // Interview responses stored as key-value pairs
  // Keys like: 'dock_2', 'fleet_2', 'perimeter_4', 'inventory_3', 'dock_4', 'facility_6', 'facility_7', 'facility_5', 'personnel_2'
  [key: string]: any;
}

/**
 * Calculate Cargo Theft Vulnerability Score (0-100)
 * 
 * Scoring Components:
 * - Location Risk: 20 pts (crime data / hotspot analysis)
 * - High-Value Goods: 15 pts (electronics, pharma, alcohol, designer goods)
 * - Control Gaps: 35 pts (CCTV, GPS, gates, caging, seals)
 * - Incident History: 20 pts (past cargo theft incidents)
 * - Operational Vulnerabilities: 10 pts (24/7 ops, truck volume, employees, driver vetting)
 * 
 * Risk Levels:
 * - 0-24: LOW
 * - 25-49: MEDIUM
 * - 50-74: HIGH
 * - 75-100: CRITICAL
 */
export function calculateCargoTheftVulnerabilityScore(
  assessment: AssessmentWithWarehouseData
): CargoTheftVulnerabilityScore {
  const profile = assessment.warehouse_profile || {};
  const responses = assessment; // Interview responses at root level
  
  let locationRisk = 0;
  let highValueGoods = 0;
  let controlGaps = 0;
  let incidentHistory = 0;
  let operationalVulnerabilities = 0;

  // ============================================================
  // 1. LOCATION RISK (Max 20 pts)
  // ============================================================
  // Placeholder logic for crime API integration
  if (profile.locationRisk === 'High') {
    locationRisk = 20;
  } else if (profile.locationRisk === 'Medium') {
    locationRisk = 10;
  } else if (profile.locationRisk === 'Low') {
    locationRisk = 0;
  }

  // ============================================================
  // 2. HIGH-VALUE GOODS (Max 15 pts)
  // ============================================================
  if (profile.highValueProducts && Array.isArray(profile.highValueProducts)) {
    for (const product of profile.highValueProducts) {
      const productLower = product.toLowerCase();
      if (productLower.includes('electronics')) {
        highValueGoods += 5;
      } else if (productLower.includes('pharmaceuticals') || productLower.includes('pharma')) {
        highValueGoods += 5;
      } else if (productLower.includes('alcohol')) {
        highValueGoods += 3;
      } else if (productLower.includes('designer') || productLower.includes('clothing')) {
        highValueGoods += 2;
      }
    }
    // Cap at 15
    highValueGoods = Math.min(15, highValueGoods);
  }

  // ============================================================
  // 3. CONTROL GAPS (Max 35 pts)
  // ============================================================
  // Check interview responses for security control gaps
  
  // dock_2: Loading Dock CCTV (10 pts)
  if (responses.dock_2 === 'no' || responses.dock_2 === false) {
    controlGaps += 10;
  }

  // fleet_2: GPS Tracking (8 pts)
  if (responses.fleet_2 === 'no' || responses.fleet_2 === false) {
    controlGaps += 8;
  }

  // perimeter_4: Gate Access Control (7 pts)
  if (responses.perimeter_4) {
    const answer = typeof responses.perimeter_4 === 'string' 
      ? responses.perimeter_4.toLowerCase() 
      : String(responses.perimeter_4).toLowerCase();
    if (answer.includes('open access') || answer.includes('open_access') || answer.includes('no gate')) {
      controlGaps += 7;
    }
  }

  // inventory_3: High-Value Inventory Caging (5 pts)
  if (responses.inventory_3 === 'no' || responses.inventory_3 === false) {
    controlGaps += 5;
  }

  // dock_4: Trailer Seal Verification (5 pts)
  if (responses.dock_4) {
    const answer = typeof responses.dock_4 === 'string' 
      ? responses.dock_4.toLowerCase() 
      : String(responses.dock_4).toLowerCase();
    if (answer.includes('no seal') || answer.includes('informal') || answer.includes('none')) {
      controlGaps += 5;
    }
  }

  // Cap at 35
  controlGaps = Math.min(35, controlGaps);

  // ============================================================
  // 4. INCIDENT HISTORY (Max 20 pts)
  // ============================================================
  if (profile.cargoTheftIncidents && Array.isArray(profile.cargoTheftIncidents)) {
    const incidentCount = profile.cargoTheftIncidents.length;
    incidentHistory = Math.min(20, incidentCount * 4);
  }

  // ============================================================
  // 5. OPERATIONAL VULNERABILITIES (Max 10 pts)
  // ============================================================
  
  // facility_6: Operating Hours (3 pts if 24/7)
  if (responses.facility_6) {
    const answer = typeof responses.facility_6 === 'string' 
      ? responses.facility_6.toLowerCase() 
      : String(responses.facility_6).toLowerCase();
    if (answer.includes('24') || answer.includes('24/7') || answer.includes('24-7')) {
      operationalVulnerabilities += 3;
    }
  }

  // facility_7: Daily Truck Volume (3 pts if > 75)
  if (responses.facility_7) {
    const truckVolume = typeof responses.facility_7 === 'number' 
      ? responses.facility_7 
      : parseInt(String(responses.facility_7));
    if (!isNaN(truckVolume) && truckVolume > 75) {
      operationalVulnerabilities += 3;
    }
  }

  // facility_5: Employee Count (2 pts if > 150)
  if (responses.facility_5) {
    const employeeCount = typeof responses.facility_5 === 'number' 
      ? responses.facility_5 
      : parseInt(String(responses.facility_5));
    if (!isNaN(employeeCount) && employeeCount > 150) {
      operationalVulnerabilities += 2;
    }
  }

  // personnel_2: Driver Vetting (2 pts if no)
  if (responses.personnel_2 === 'no' || responses.personnel_2 === false) {
    operationalVulnerabilities += 2;
  }

  // Cap at 10
  operationalVulnerabilities = Math.min(10, operationalVulnerabilities);

  // ============================================================
  // TOTAL SCORE CALCULATION
  // ============================================================
  const totalScore = locationRisk + highValueGoods + controlGaps + incidentHistory + operationalVulnerabilities;

  // ============================================================
  // RISK LEVEL CLASSIFICATION
  // ============================================================
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
      locationRisk,
      highValueGoods,
      controlGaps,
      incidentHistory,
      operationalVulnerabilities,
    },
  };
}

/**
 * TOTAL COST OF RISK (TCOR) CALCULATION
 * Calculates comprehensive annual risk exposure including direct and indirect costs
 */

export interface TCORBreakdown {
  directLoss: number; // Annual cargo theft/shrinkage losses
  turnoverCost: number; // Security-related employee turnover costs
  liabilityCost: number; // Insurance, legal, workers' comp
  incidentCost: number; // Operational disruption from security incidents
  brandDamageCost: number; // Reputation/brand damage
  totalAnnualExposure: number; // Sum of all costs
}

/**
 * Calculate Total Annual Exposure for warehouse operations
 * 
 * Formula:
 * Total Annual Exposure = Direct Loss + Turnover Cost + Liability Cost + Incident Cost + Brand Damage
 * 
 * Where:
 * - Direct Loss = Historical cargo theft losses (average annual loss)
 * - Turnover Cost = (Employee Count × Turnover Rate × Hiring Cost) × 0.15
 *   (Assumes 15% of turnover is security-related in warehouse environments)
 * - Liability Cost = Annual liability/insurance/WC estimates
 * - Incident Cost = Security Incidents × Average Incident Cost ($8,000 per incident baseline for warehouses)
 * - Brand Damage = Estimated brand/reputation damage
 */
export function calculateTotalCostOfRisk(
  profile: WarehouseProfile
): TCORBreakdown {
  // 1. DIRECT LOSS (Historical cargo theft/shrinkage)
  let directLoss = 0;
  if (profile.cargoTheftIncidents && Array.isArray(profile.cargoTheftIncidents)) {
    const totalLosses = profile.cargoTheftIncidents.reduce((sum, incident) => sum + (incident.loss || 0), 0);
    const avgYears = profile.cargoTheftIncidents.length > 0 ? Math.max(1, profile.cargoTheftIncidents.length / 12) : 1;
    directLoss = totalLosses / avgYears; // Annualized loss
  }
  
  // Fallback to shrinkage rate if no theft incidents
  if (directLoss === 0 && profile.shrinkageRate && profile.inventoryValue) {
    directLoss = profile.inventoryValue * (profile.shrinkageRate / 100);
  }

  // 2. TURNOVER COST
  const employeeCount = profile.employeeCount || 0;
  const turnoverRate = profile.annualTurnoverRate || 0;
  const avgHiringCost = profile.avgHiringCost || 0;
  // Assume 15% of turnover is security-related (theft, violence, unsafe conditions)
  const securityRelatedTurnoverFactor = 0.15;
  const turnoverCost = employeeCount * (turnoverRate / 100) * avgHiringCost * securityRelatedTurnoverFactor;

  // 3. LIABILITY COST
  const liabilityCost = profile.annualLiabilityEstimates || 0;

  // 4. INCIDENT COST
  const incidentsPerYear = profile.securityIncidentsPerYear || 0;
  const avgIncidentCost = 8000; // $8K baseline (higher than retail due to larger operations, truck delays, cargo value)
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
