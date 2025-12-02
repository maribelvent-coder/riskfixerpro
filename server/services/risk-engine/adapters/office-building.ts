/**
 * Office Building Risk Engine Adapter
 * Implements office-specific vulnerability calculation based on interview responses
 * 
 * Key Features:
 * - Maps specific question responses to vulnerability scores
 * - Detects risk indicators from interview answers
 * - Analyzes incident history for likelihood adjustments
 */

import { RiskEngineAdapter, InterviewResponse, ThreatData, LIKELIHOOD_VALUES, IMPACT_VALUES } from '../types';

export class OfficeBuildingAdapter implements RiskEngineAdapter {
  /**
   * Calculate vulnerability from interview responses (Section 4.2)
   * Analyzes responses for risk indicators, missing controls, and low ratings
   */
  async calculateVulnerability(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let vulnerabilityScore = 3; // Start at baseline (moderate)
    let riskFactorCount = 0;

    // Risk indicators map for different question types
    const riskIndicators: Record<string, string[]> = {
      'perimeter_fencing': ['no'],
      'entry_access_control': ['open access', 'security guard only'],
      'tailgating_prevention': ['no - card readers only', 'no access control'],
      'visitor_management': ['no', 'no - visitors can move freely'],
      'after_hours_security': ['remains open', 'unsecured'],
      'cctv_coverage': ['no', 'minimal'],
      'interior_access_control': ['no'],
      'alarm_system': ['no'],
      'security_guards': ['no'],
      'background_checks': ['no'],
      'emergency_response': ['no plan'],
    };

    // Analyze each response for risk indicators
    for (const [questionId, response] of responses) {
      const answer = response.answer?.toString().toLowerCase() || '';
      
      // Check for explicit risk indicators
      if (riskIndicators[questionId]) {
        for (const indicator of riskIndicators[questionId]) {
          if (answer.includes(indicator.toLowerCase())) {
            riskFactorCount++;
            break;
          }
        }
      }

      // Check for "no" responses to control presence questions
      if (questionId.includes('has_') || questionId.includes('is_') || questionId.includes('are_')) {
        if (answer === 'no' || response.answer === false) {
          riskFactorCount++;
        }
      }

      // Check rating scales (low ratings = higher vulnerability)
      if (typeof response.answer === 'number') {
        const rating = response.answer;
        if (rating <= 2) {
          riskFactorCount += 2; // Poor ratings count double
        } else if (rating === 3) {
          riskFactorCount += 1; // Moderate ratings count single
        }
      }
    }

    // Specific vulnerability adjustments by threat type
    if (threatId.includes('forced_entry')) {
      const perimeterFencing = responses.get('perimeter_fencing');
      if (perimeterFencing?.answer === 'no' || perimeterFencing?.answer === false) {
        riskFactorCount += 2;
      }

      const reinforcedDoors = responses.get('reinforced_doors');
      if (reinforcedDoors?.answer === 'no' || reinforcedDoors?.answer === false) {
        riskFactorCount += 2;
      }
    }

    if (threatId.includes('tailgating')) {
      const tailgatingPrevention = responses.get('tailgating_prevention');
      const answer = tailgatingPrevention?.answer?.toString().toLowerCase() || '';
      if (answer.includes('no access control') || answer.includes('no - card readers only')) {
        riskFactorCount += 3;
      }
    }

    if (threatId.includes('theft_property')) {
      const cctvCoverage = responses.get('cctv_coverage');
      if (cctvCoverage?.answer === 'no' || cctvCoverage?.answer === false) {
        riskFactorCount += 2;
      }

      const securityGuards = responses.get('security_guards');
      if (securityGuards?.answer === 'no' || securityGuards?.answer === false) {
        riskFactorCount += 1;
      }
    }

    if (threatId.includes('workplace_violence')) {
      const backgroundChecks = responses.get('background_checks');
      if (backgroundChecks?.answer === 'no' || backgroundChecks?.answer === false) {
        riskFactorCount += 2;
      }

      const emergencyPlan = responses.get('emergency_response_plan');
      if (emergencyPlan?.answer === 'no' || emergencyPlan?.answer === false) {
        riskFactorCount += 1;
      }
    }

    // Adjust vulnerability score based on risk factors
    // Each 2 risk factors increases vulnerability by 1 point
    vulnerabilityScore = Math.min(5, vulnerabilityScore + Math.floor(riskFactorCount / 2));

    return vulnerabilityScore;
  }

  async calculateLikelihood(
    responses: Map<string, InterviewResponse>,
    threatId: string
  ): Promise<number> {
    let likelihood = 2; // Start at baseline (low)

    // FACTOR 1: Incident History (most important)
    const incidentHistoryResponse = responses.get('incident_history');
    if (incidentHistoryResponse?.answer === 'yes' || incidentHistoryResponse?.answer === true) {
      likelihood += 2; // Historical incident significantly increases likelihood
    }

    // Check incident frequency
    const incidentFrequencyResponse = responses.get('incident_frequency');
    if (incidentFrequencyResponse?.answer) {
      const frequency = incidentFrequencyResponse.answer.toString().toLowerCase();
      if (frequency.includes('monthly') || frequency.includes('weekly')) {
        likelihood += 1; // Pattern of incidents
      }
    }

    // FACTOR 2: Location & Environment
    const neighborhoodCrimeResponse = responses.get('neighborhood_crime_rate');
    if (neighborhoodCrimeResponse?.answer) {
      const answer = neighborhoodCrimeResponse.answer.toString().toLowerCase();
      if (answer.includes('high') || answer.includes('very high')) {
        likelihood += 1;
      }
    }

    // FACTOR 3: Operational Characteristics
    const visitorVolumeResponse = responses.get('visitor_volume');
    if (visitorVolumeResponse?.answer) {
      const answer = visitorVolumeResponse.answer.toString().toLowerCase();
      if (answer.includes('high volume') || answer.includes('very high')) {
        likelihood += 1; // High traffic = more opportunities
      }
    }

    // FACTOR 4: After-hours activity
    const afterHoursActivityResponse = responses.get('after_hours_activity');
    if (afterHoursActivityResponse?.answer === 'yes' || afterHoursActivityResponse?.answer === true) {
      likelihood += 1;
    }

    // FACTOR 5: Threat-specific adjustments
    if (threatId.includes('theft_intellectual_property') || threatId.includes('espionage')) {
      const dataClassificationResponse = responses.get('data_classification');
      if (dataClassificationResponse?.answer) {
        const answer = dataClassificationResponse.answer.toString().toLowerCase();
        if (answer.includes('classified') || answer.includes('trade secrets')) {
          likelihood += 1; // High-value targets attract sophisticated adversaries
        }
      }

      const rdOperationsResponse = responses.get('rd_operations');
      if (rdOperationsResponse?.answer === 'yes' || rdOperationsResponse?.answer === true) {
        likelihood += 1; // R&D facilities are prime targets
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

    // Adjust based on facility characteristics
    const employeeCountResponse = responses.get('employee_count');
    if (employeeCountResponse?.answer) {
      const count = typeof employeeCountResponse.answer === 'number' 
        ? employeeCountResponse.answer 
        : parseInt(employeeCountResponse.answer.toString());
      
      if (!isNaN(count)) {
        if (count > 500) {
          impact = Math.min(5, impact + 1); // Large facilities have higher impact
        } else if (count > 100) {
          impact = Math.min(5, impact + 0.5);
        }
      }
    }

    // Critical infrastructure or data
    const dataClassificationResponse = responses.get('data_classification');
    if (dataClassificationResponse?.answer) {
      const answer = dataClassificationResponse.answer.toString().toLowerCase();
      if (answer.includes('classified') || answer.includes('trade secrets')) {
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
    // Standard T×V×I formula for office buildings
    // Risk = (T × V) × I × (1 - C_e)
    
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

    // Perimeter security recommendations
    const perimeterFencing = responses.get('perimeter_fencing');
    if (perimeterFencing?.answer === 'no' || perimeterFencing?.answer === false) {
      recommendations.push('Install perimeter fencing with anti-climb features');
    }

    // Access control recommendations
    const accessControl = responses.get('entry_access_control');
    if (accessControl?.answer) {
      const answer = accessControl.answer.toString().toLowerCase();
      if (answer.includes('open access') || answer.includes('security guard only')) {
        recommendations.push('Implement electronic access control system with badge readers');
      }
    }

    // Tailgating prevention
    const tailgatingPrevention = responses.get('tailgating_prevention');
    if (tailgatingPrevention?.answer) {
      const answer = tailgatingPrevention.answer.toString().toLowerCase();
      if (answer.includes('no - card readers only') || answer.includes('no access control')) {
        recommendations.push('Install turnstiles or speed gates to prevent tailgating');
      }
    }

    // Visitor management
    const visitorManagement = responses.get('visitor_management');
    if (visitorManagement?.answer === 'no' || visitorManagement?.answer === false) {
      recommendations.push('Implement visitor management system with photo ID scanning and badges');
    }

    // CCTV surveillance
    const cctvCoverage = responses.get('cctv_coverage');
    if (cctvCoverage?.answer === 'no' || cctvCoverage?.answer === false) {
      recommendations.push('Install IP-based CCTV system covering all entry points and critical areas');
    }

    // Security guards
    if (riskScore >= 40) {
      const securityGuards = responses.get('security_guards');
      if (securityGuards?.answer === 'no' || securityGuards?.answer === false) {
        recommendations.push('Consider hiring security officers for lobby and after-hours coverage');
      }
    }

    // Alarm system
    const alarmSystem = responses.get('alarm_system');
    if (alarmSystem?.answer === 'no' || alarmSystem?.answer === false) {
      recommendations.push('Install intrusion detection alarm system with monitoring');
    }

    // Emergency response
    const emergencyPlan = responses.get('emergency_response_plan');
    if (emergencyPlan?.answer === 'no' || emergencyPlan?.answer === false) {
      recommendations.push('Develop and implement comprehensive emergency response plan');
      recommendations.push('Conduct regular active shooter/workplace violence drills');
    }

    return recommendations;
  }
}
