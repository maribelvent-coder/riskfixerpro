/**
 * Datacenter & Critical Infrastructure Interview Risk Mapper
 * 
 * Implements the T×V×I calculation pipeline per RiskFixer Datacenter Framework.
 * Transforms interview questionnaire responses into mathematically-derived risk scenarios.
 * 
 * KEY FEATURES:
 * - 15 datacenter-specific threats with individual calculation algorithms
 * - Risk factor counting with divisor of 3 for stability
 * - Control recommendations mapped to specific vulnerability gaps
 * - Scenario descriptions with contextual observations
 * - Industry standards integration (SOC 2, ISO 27001, TIA-942, NFPA)
 * 
 * LAYER INTEGRATION:
 * - Layer 1: Facility Data (interview responses)
 * - Layer 2: Methodology Framework (T×V×I formula)
 * - Layer 3: Industry Standards (Uptime Institute, SOC 2, PCI-DSS)
 * - Layer 4: Threat Intelligence (datacenter outage statistics)
 * - Layer 5: Control Effectiveness (evidence-based controls)
 * - Layer 6: Scoring Rubrics (risk classification)
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Datacenter-Framework.md
 * @see RiskFixer-Datacenter-Questions-With-Polarity.md
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 */

import { db } from '../db';
import { eq } from 'drizzle-orm';
import { assessments, riskScenarios, threatLibrary } from '@shared/schema';

// ============================================================================
// INTERFACES
// ============================================================================

export type InterviewResponses = Record<string, any>;

export interface InterviewRiskMapping {
  assessmentId: number;
  interviewResponses: InterviewResponses;
  threatId: string;
}

export interface CalculatedRiskInputs {
  threatLikelihood: number; // 1-5
  vulnerability: number;    // 1-5
  impact: number;           // 1-5
  inherentRisk: number;     // T × V × I (1-125)
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  suggestedControls: string[];
}

export interface NewRiskScenario {
  assessmentId: string;
  threatLibraryId: string;
  threatLikelihood: number;
  vulnerability: number;
  impact: number;
  inherentRisk: number;
  residualRisk: number;
  controlEffectiveness: number;
  riskLevel: string;
  scenarioDescription: string;
}

export interface GeneratedScenarioResult {
  success: boolean;
  generatedScenarios: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScenarioIds: string[];
}

export interface SecurityScoreResult {
  score: number;
  grade: string;
  findings: string[];
  strengths: string[];
  categoryScores: Record<string, number>;
}

export interface ThreatVulnerabilityBreakdown {
  threatId: string;
  threatName: string;
  threatLikelihood: number;
  vulnerability: number;
  impact: number;
  inherentRisk: number;
  riskLevel: string;
  controlGaps: string[];
  existingControls: string[];
  questionBreakdown: QuestionContribution[];
}

export interface QuestionContribution {
  questionId: string;
  questionText: string;
  answer: any;
  contribution: 'increases_risk' | 'decreases_risk' | 'neutral';
  points: number;
  reasoning: string;
}

// ============================================================================
// DATACENTER THREAT DEFINITIONS - Layer 4: Threat Intelligence
// ============================================================================

export const DATACENTER_THREATS = [
  {
    id: 'unauthorized_physical_access',
    name: 'Unauthorized Physical Access',
    category: 'Physical Intrusion',
    description: 'Unauthorized individuals gaining entry to datacenter through perimeter breach, tailgating, or social engineering. Can lead to data theft, sabotage, or reconnaissance.',
    typicalLikelihood: 3,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-INT-001',
  },
  {
    id: 'insider_threat_privileged_access',
    name: 'Insider Threat - Privileged Access Abuse',
    category: 'Insider Threat',
    description: 'Malicious or negligent actions by employees, contractors, or vendors with authorized datacenter access. FBI estimates 60%+ of sabotage involves insiders.',
    typicalLikelihood: 3,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-INS-001',
  },
  {
    id: 'tailgating_mantrap_bypass',
    name: 'Tailgating / Man-trap Bypass',
    category: 'Physical Intrusion',
    description: 'Unauthorized entry by following authorized personnel through access control points. 30%+ of physical intrusions involve tailgating.',
    typicalLikelihood: 3,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-INT-002',
  },
  {
    id: 'power_failure_extended',
    name: 'Extended Power Failure',
    category: 'Infrastructure',
    description: 'Loss of utility power exceeding UPS and generator capacity, causing complete outage. Average datacenter downtime cost: $9,000/minute.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-INF-001',
  },
  {
    id: 'cooling_failure_thermal_event',
    name: 'Cooling Failure / Thermal Event',
    category: 'Infrastructure',
    description: 'Loss of cooling causing equipment to exceed thermal limits. Cascading failures can occur within minutes.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-INF-002',
  },
  {
    id: 'fire_equipment_damage',
    name: 'Fire / Equipment Damage',
    category: 'Life Safety',
    description: 'Fire in datacenter causing equipment destruction. Clean agent suppression critical - water destroys electronics.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-EMG-001',
  },
  {
    id: 'water_intrusion_damage',
    name: 'Water Intrusion / Equipment Damage',
    category: 'Environmental',
    description: 'Water damage from cooling system leaks, pipe bursts, or flooding. Leading cause of datacenter equipment damage.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-ENV-001',
  },
  {
    id: 'theft_equipment_components',
    name: 'Theft - Equipment/Components',
    category: 'Theft',
    description: 'Theft of servers, drives, memory, or other components. High value density makes datacenters attractive targets.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-THF-001',
  },
  {
    id: 'sabotage_infrastructure',
    name: 'Sabotage - Infrastructure',
    category: 'Sabotage',
    description: 'Intentional damage to power, cooling, fire suppression, or other critical infrastructure. EPO and manual release are primary targets.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-SAB-001',
  },
  {
    id: 'cyber_physical_attack',
    name: 'Cyber-Physical Attack',
    category: 'Cyber',
    description: 'Attack on physical security systems (access control, CCTV, BMS) through network exploitation. Can disable monitoring or enable unauthorized access.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-CYB-001',
  },
  {
    id: 'social_engineering_entry',
    name: 'Social Engineering - Unauthorized Entry',
    category: 'Social Engineering',
    description: 'Manipulating staff to gain unauthorized access through pretexting, impersonation, or deception.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-SOC-001',
  },
  {
    id: 'terrorism_vehicle_borne',
    name: 'Terrorism - Vehicle-Borne Attack',
    category: 'Terrorism',
    description: 'Vehicle ramming or vehicle-borne explosive device attack. Datacenters are critical infrastructure targets.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-TER-001',
  },
  {
    id: 'natural_disaster_impact',
    name: 'Natural Disaster Impact',
    category: 'Natural Hazard',
    description: 'Weather events, earthquakes, floods affecting facility operations. Extended utility outages common.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-NAT-001',
  },
  {
    id: 'vendor_contractor_breach',
    name: 'Vendor/Contractor Security Breach',
    category: 'Third Party',
    description: 'Security incident caused by vendor, contractor, or service provider with datacenter access.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-3RD-001',
  },
  {
    id: 'environmental_contamination',
    name: 'Environmental Contamination',
    category: 'Environmental',
    description: 'Airborne contaminants (dust, chemicals, smoke) entering facility and damaging equipment.',
    typicalLikelihood: 1,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-ENV-002',
  },
];

// ============================================================================
// THREAT-TO-CONTROL MAPPING - Layer 5: Control Effectiveness
// ============================================================================

export const THREAT_CONTROL_MAPPING: Record<string, string[]> = {
  unauthorized_physical_access: [
    'high_security_fencing',
    'perimeter_intrusion_detection',
    'biometric_authentication',
    'multi_factor_access',
    'mantrap_portals',
    'visitor_management_system',
    'access_logging_audit',
    'cctv_comprehensive_coverage',
    'noc_soc_24x7',
    'security_patrol_24x7',
  ],
  insider_threat_privileged_access: [
    'background_checks_comprehensive',
    'access_review_quarterly',
    'access_revocation_immediate',
    'two_person_rule',
    'cctv_hands_on_servers',
    'cabinet_level_locks',
    'termination_procedures',
    'tool_control',
    'media_destruction',
    'access_logging_audit',
  ],
  tailgating_mantrap_bypass: [
    'mantrap_portals',
    'tailgating_detection',
    'visitor_management_system',
    'escort_requirements',
    'cctv_comprehensive_coverage',
    'security_patrol_24x7',
    'video_analytics',
    'security_training_annual',
  ],
  power_failure_extended: [
    'redundant_utility_feeds',
    'ups_n_plus_1',
    'generator_automatic_transfer',
    'generator_fuel_72_hours',
    'fuel_storage_security',
    'electrical_room_access',
    'environmental_sensors',
    'noc_soc_24x7',
  ],
  cooling_failure_thermal_event: [
    'cooling_redundancy',
    'temperature_humidity_monitoring',
    'hot_cold_aisle_containment',
    'chiller_plant_security',
    'environmental_sensors',
    'noc_soc_24x7',
    'alarm_monitoring_central',
  ],
  fire_equipment_damage: [
    'vesda_early_detection',
    'clean_agent_suppression',
    'fire_zone_suppression',
    'manual_release_protection',
    'fire_system_monitoring',
    'fire_system_testing_quarterly',
    'noc_soc_24x7',
  ],
  water_intrusion_damage: [
    'water_leak_detection',
    'environmental_sensors',
    'chiller_plant_security',
    'clean_agent_suppression',
    'noc_soc_24x7',
    'alarm_monitoring_central',
  ],
  theft_equipment_components: [
    'cabinet_level_locks',
    'cctv_hands_on_servers',
    'escort_requirements',
    'visitor_management_system',
    'tool_control',
    'access_logging_audit',
    'mantrap_portals',
    'customer_access_segregation',
  ],
  sabotage_infrastructure: [
    'epo_protection',
    'electrical_room_access',
    'chiller_plant_security',
    'manual_release_protection',
    'fuel_storage_security',
    'two_person_rule',
    'cctv_comprehensive_coverage',
    'access_logging_audit',
    'background_checks_comprehensive',
  ],
  cyber_physical_attack: [
    'vulnerability_scanning',
    'change_management',
    'access_logging_audit',
    'noc_soc_24x7',
    'penetration_testing_annual',
    'incident_response_plan',
  ],
  social_engineering_entry: [
    'visitor_management_system',
    'escort_requirements',
    'security_training_annual',
    'mantrap_portals',
    'biometric_authentication',
    'cctv_comprehensive_coverage',
  ],
  terrorism_vehicle_borne: [
    'vehicle_barriers_k_rated',
    'standoff_distance_100ft',
    'high_security_fencing',
    'perimeter_intrusion_detection',
    'perimeter_cctv_coverage',
    'security_patrol_24x7',
    'guard_checkpoint',
  ],
  natural_disaster_impact: [
    'redundant_utility_feeds',
    'generator_fuel_72_hours',
    'cooling_redundancy',
    'ups_n_plus_1',
    'incident_response_plan',
    'noc_soc_24x7',
  ],
  vendor_contractor_breach: [
    'contractor_vetting',
    'escort_requirements',
    'visitor_management_system',
    'access_revocation_immediate',
    'cctv_comprehensive_coverage',
    'access_logging_audit',
    'security_training_annual',
  ],
  environmental_contamination: [
    'environmental_contamination_protection',
    'temperature_humidity_monitoring',
    'environmental_sensors',
    'hot_cold_aisle_containment',
  ],
};

// ============================================================================
// THREAT-TO-QUESTION MAPPING
// ============================================================================

export const THREAT_QUESTION_MAP: Record<string, string[]> = {
  unauthorized_physical_access: [
    'dc_perimeter_barrier', 'dc_access_authentication_method', 'dc_mantrap_portals',
    'dc_perimeter_cctv', 'dc_cabinet_level_access', 'dc_access_logging',
  ],
  insider_threat_privileged_access: [
    'dc_background_checks', 'dc_access_revocation', 'dc_access_review_frequency',
    'dc_two_person_rule', 'dc_cctv_hands_on_servers', 'dc_termination_procedures',
  ],
  tailgating_mantrap_bypass: [
    'dc_mantrap_portals', 'dc_tailgating_prevention', 'dc_visitor_management',
    'dc_escort_requirements', 'dc_24x7_monitoring',
  ],
  power_failure_extended: [
    'dc_power_redundancy', 'dc_utility_feeds', 'dc_generator_capacity',
    'dc_ups_runtime', 'dc_fuel_supply_agreement', 'dc_tier_classification',
  ],
  cooling_failure_thermal_event: [
    'dc_cooling_redundancy', 'dc_temp_humidity_monitoring', 'dc_water_leak_detection',
    'dc_hot_cold_aisle_containment', 'dc_tier_classification',
  ],
  fire_equipment_damage: [
    'dc_fire_detection_system', 'dc_fire_suppression_type', 'dc_fire_suppression_zones',
    'dc_fire_system_monitoring', 'dc_fire_system_testing',
  ],
  water_intrusion_damage: [
    'dc_water_leak_detection', 'dc_fire_suppression_type', 'dc_temp_humidity_monitoring',
  ],
  theft_equipment_components: [
    'dc_cabinet_level_access', 'dc_cctv_hands_on_servers', 'dc_escort_requirements',
    'dc_visitor_management', 'dc_tool_control',
  ],
  sabotage_infrastructure: [
    'dc_epo_protection', 'dc_electrical_room_access', 'dc_chiller_plant_security',
    'dc_manual_release_protection', 'dc_fuel_storage_security', 'dc_two_person_rule',
  ],
  cyber_physical_attack: [
    'dc_vulnerability_scanning', 'dc_change_management', 'dc_monitoring_integration',
    'dc_penetration_testing',
  ],
  social_engineering_entry: [
    'dc_visitor_management', 'dc_escort_requirements', 'dc_security_training',
    'dc_mantrap_portals',
  ],
  terrorism_vehicle_borne: [
    'dc_vehicle_barriers', 'dc_standoff_distance', 'dc_perimeter_barrier',
    'dc_perimeter_intrusion_detection', 'dc_perimeter_patrol',
  ],
  natural_disaster_impact: [
    'dc_power_redundancy', 'dc_generator_capacity', 'dc_fuel_supply_agreement',
    'dc_cooling_redundancy', 'dc_incident_response_plan',
  ],
  vendor_contractor_breach: [
    'dc_contractor_vetting', 'dc_escort_requirements', 'dc_visitor_management',
    'dc_access_revocation', 'dc_access_logging',
  ],
  environmental_contamination: [
    'dc_environmental_contamination_protection', 'dc_temp_humidity_monitoring',
    'dc_hot_cold_aisle_containment',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isYesResponse(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'yes' || lower === 'true' || lower === 'y';
  }
  return false;
}

function isNoResponse(value: any): boolean {
  if (typeof value === 'boolean') return !value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'no' || lower === 'false' || lower === 'n';
  }
  return false;
}

function responseMatchesIndicator(value: any, indicator: string): boolean {
  if (!value) return false;
  const valueStr = String(value).toLowerCase();
  const indicatorLower = indicator.toLowerCase();
  return valueStr.includes(indicatorLower);
}

function checkArrayForMatch(arr: string[] | undefined, indicators: string[]): boolean {
  if (!arr || !Array.isArray(arr)) return false;
  for (const item of arr) {
    for (const indicator of indicators) {
      if (item.toLowerCase().includes(indicator.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}

function getRatingValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

function classifyRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
  // T×V×I scale 1-125, normalized thresholds
  if (score >= 60) return 'critical';  // Top 48% of scale
  if (score >= 36) return 'high';      // 29-48%
  if (score >= 15) return 'medium';    // 12-29%
  return 'low';                        // Bottom 12%
}

// ============================================================================
// TIER CLASSIFICATION HELPER
// ============================================================================

function getTierLevel(responses: InterviewResponses): number {
  const tier = responses.dc_tier_classification || '';
  if (tier.includes('IV') || tier.includes('4')) return 4;
  if (tier.includes('III') || tier.includes('3')) return 3;
  if (tier.includes('II') || tier.includes('2')) return 2;
  if (tier.includes('I') || tier.includes('1')) return 1;
  return 0; // Unknown
}

function getTierExpectationModifier(responses: InterviewResponses): number {
  // Higher tier = higher expectations = more vulnerability if controls lacking
  const tier = getTierLevel(responses);
  if (tier === 4) return 1.5;
  if (tier === 3) return 1.2;
  if (tier === 2) return 1.0;
  return 0.8; // Tier 1 or unknown has lower expectations
}

// ============================================================================
// THREAT-SPECIFIC LIKELIHOOD CALCULATION
// ============================================================================

export function calculateThreatLikelihoodFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  const threat = DATACENTER_THREATS.find(t => t.id === threatId);
  let baseline = threat?.typicalLikelihood || 2;
  let modifier = 0;

  switch (threatId) {
    case 'unauthorized_physical_access':
      // Higher if: weak perimeter, single-factor auth, no monitoring
      if (responseMatchesIndicator(responses.dc_perimeter_barrier, 'no dedicated') ||
          responseMatchesIndicator(responses.dc_perimeter_barrier, '6ft or less')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_access_authentication_method, 'single factor') ||
          responseMatchesIndicator(responses.dc_access_authentication_method, 'keys only')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_24x7_monitoring, 'no active monitoring') ||
          responseMatchesIndicator(responses.dc_24x7_monitoring, 'business hours only')) {
        modifier += 1;
      }
      if (isYesResponse(responses.dc_perimeter_incidents)) {
        modifier += 1;
      }
      break;

    case 'insider_threat_privileged_access':
      // Higher if: weak background checks, delayed revocation, no two-person rule
      if (responseMatchesIndicator(responses.dc_background_checks, 'no background') ||
          responseMatchesIndicator(responses.dc_background_checks, 'basic criminal')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_access_revocation, 'delayed') ||
          responseMatchesIndicator(responses.dc_access_revocation, '24 hours')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_two_person_rule, 'not enforced')) {
        modifier += 1;
      }
      // More staff = higher insider threat surface
      if (responses.dc_staff_size && parseInt(responses.dc_staff_size) > 100) {
        modifier += 1;
      }
      break;

    case 'tailgating_mantrap_bypass':
      // Higher if: no man-traps, policy-only prevention
      if (responseMatchesIndicator(responses.dc_mantrap_portals, 'no man-trap') ||
          responseMatchesIndicator(responses.dc_mantrap_portals, 'standard doors')) {
        modifier += 2;
      }
      if (responseMatchesIndicator(responses.dc_tailgating_prevention, 'no specific') ||
          responseMatchesIndicator(responses.dc_tailgating_prevention, 'signage only')) {
        modifier += 1;
      }
      // Colocation = more customers = more opportunities
      if (responseMatchesIndicator(responses.dc_customer_type, 'colocation')) {
        modifier += 1;
      }
      break;

    case 'power_failure_extended':
      // Higher if: single utility, limited generator capacity, no fuel agreement
      if (responseMatchesIndicator(responses.dc_utility_feeds, 'single utility') ||
          responseMatchesIndicator(responses.dc_utility_feeds, 'single feed')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_generator_capacity, 'no generator') ||
          responseMatchesIndicator(responses.dc_generator_capacity, 'less than 24')) {
        modifier += 1;
      }
      if (isNoResponse(responses.dc_fuel_supply_agreement)) {
        modifier += 1;
      }
      break;

    case 'cooling_failure_thermal_event':
      // Higher if: no redundancy, poor monitoring
      if (responseMatchesIndicator(responses.dc_cooling_redundancy, 'no redundancy') ||
          responseMatchesIndicator(responses.dc_cooling_redundancy, 'single cooling')) {
        modifier += 2;
      }
      if (responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'no environmental') ||
          responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'manual checks')) {
        modifier += 1;
      }
      break;

    case 'fire_equipment_damage':
      // Higher if: poor detection, water sprinklers, no testing
      if (responseMatchesIndicator(responses.dc_fire_detection_system, 'no fire detection') ||
          responseMatchesIndicator(responses.dc_fire_detection_system, 'standard smoke')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_fire_system_testing, 'never') ||
          responseMatchesIndicator(responses.dc_fire_system_testing, 'annually')) {
        modifier += 1;
      }
      break;

    case 'water_intrusion_damage':
      // Higher if: water sprinklers, no leak detection
      if (responseMatchesIndicator(responses.dc_fire_suppression_type, 'water sprinklers') ||
          responseMatchesIndicator(responses.dc_fire_suppression_type, 'no suppression')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_water_leak_detection, 'no leak detection')) {
        modifier += 1;
      }
      break;

    case 'theft_equipment_components':
      // Higher if: no cabinet locks, can't see hands-on-servers
      if (responseMatchesIndicator(responses.dc_cabinet_level_access, 'no cabinet') ||
          responseMatchesIndicator(responses.dc_cabinet_level_access, 'same key')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_cctv_hands_on_servers, 'cannot see') ||
          responseMatchesIndicator(responses.dc_cctv_hands_on_servers, 'limited visibility')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_escort_requirements, 'no escort')) {
        modifier += 1;
      }
      break;

    case 'sabotage_infrastructure':
      // Higher if: EPO unprotected, electrical room unrestricted
      if (responseMatchesIndicator(responses.dc_epo_protection, 'no protection') ||
          responseMatchesIndicator(responses.dc_epo_protection, 'exposed button')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_electrical_room_access, 'unrestricted') ||
          responseMatchesIndicator(responses.dc_electrical_room_access, 'no access logging')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_manual_release_protection, 'not protected') ||
          responseMatchesIndicator(responses.dc_manual_release_protection, 'exposed')) {
        modifier += 1;
      }
      break;

    case 'cyber_physical_attack':
      // Higher if: no vulnerability scanning, no change management
      if (responseMatchesIndicator(responses.dc_vulnerability_scanning, 'never') ||
          responseMatchesIndicator(responses.dc_vulnerability_scanning, 'ad-hoc')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_change_management, 'no formal') ||
          responseMatchesIndicator(responses.dc_change_management, 'informal')) {
        modifier += 1;
      }
      break;

    case 'social_engineering_entry':
      // Higher if: weak visitor management, no escort, poor training
      if (responseMatchesIndicator(responses.dc_visitor_management, 'no formal') ||
          responseMatchesIndicator(responses.dc_visitor_management, 'sign-in log only')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_escort_requirements, 'no escort') ||
          responseMatchesIndicator(responses.dc_escort_requirements, 'optional')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_security_training, 'no security training') ||
          responseMatchesIndicator(responses.dc_security_training, 'onboarding only')) {
        modifier += 1;
      }
      break;

    case 'terrorism_vehicle_borne':
      // Higher if: no vehicle barriers, inadequate standoff
      if (responseMatchesIndicator(responses.dc_vehicle_barriers, 'no vehicle barriers') ||
          responseMatchesIndicator(responses.dc_vehicle_barriers, 'not rated')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_standoff_distance, 'less than 50') ||
          responseMatchesIndicator(responses.dc_standoff_distance, '50-100 feet')) {
        modifier += 1;
      }
      // Higher for higher-tier facilities (more attractive targets)
      if (getTierLevel(responses) >= 3) {
        modifier += 1;
      }
      break;

    case 'natural_disaster_impact':
      // Higher if: limited generator capacity, no fuel agreement
      if (responseMatchesIndicator(responses.dc_generator_capacity, 'less than 24') ||
          responseMatchesIndicator(responses.dc_generator_capacity, 'no generator')) {
        modifier += 1;
      }
      if (isNoResponse(responses.dc_fuel_supply_agreement)) {
        modifier += 1;
      }
      // Location-based would be ideal but not captured in interview
      break;

    case 'vendor_contractor_breach':
      // Higher if: poor contractor vetting, no escort
      if (responseMatchesIndicator(responses.dc_contractor_vetting, 'no vetting') ||
          responseMatchesIndicator(responses.dc_contractor_vetting, 'company verification only')) {
        modifier += 1;
      }
      if (responseMatchesIndicator(responses.dc_escort_requirements, 'no escort') ||
          responseMatchesIndicator(responses.dc_escort_requirements, 'optional')) {
        modifier += 1;
      }
      break;

    case 'environmental_contamination':
      // Higher if: no environmental protection
      if (responseMatchesIndicator(responses.dc_environmental_contamination_protection, 'no specific')) {
        modifier += 1;
      }
      break;
  }

  // Clamp to 1-5 range
  const finalLikelihood = Math.min(5, Math.max(1, baseline + modifier));
  return Math.round(finalLikelihood);
}

// ============================================================================
// VULNERABILITY CALCULATION
// ============================================================================

export function calculateVulnerabilityFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  // Count risk factors from bad answers
  let riskFactorCount = 0;
  const tierModifier = getTierExpectationModifier(responses);

  // Profile section
  if (responseMatchesIndicator(responses.dc_tier_classification, 'tier i') ||
      responseMatchesIndicator(responses.dc_tier_classification, 'unknown')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_compliance_requirements, 'no formal compliance')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_uptime_sla, 'no formal sla') ||
      responseMatchesIndicator(responses.dc_uptime_sla, '99.9%')) {
    riskFactorCount += 2;
  }

  // Perimeter section
  if (responseMatchesIndicator(responses.dc_perimeter_barrier, 'no dedicated') ||
      responseMatchesIndicator(responses.dc_perimeter_barrier, '6ft or less')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_standoff_distance, 'less than 50')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_vehicle_barriers, 'no vehicle barriers') ||
      responseMatchesIndicator(responses.dc_vehicle_barriers, 'not rated')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_perimeter_intrusion_detection, 'no intrusion')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_perimeter_lighting, 'no dedicated') ||
      responseMatchesIndicator(responses.dc_perimeter_lighting, 'inadequate')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_perimeter_cctv, 'no cctv') ||
      responseMatchesIndicator(responses.dc_perimeter_cctv, 'partial coverage')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_security_monitoring_location, 'no active monitoring') ||
      responseMatchesIndicator(responses.dc_security_monitoring_location, 'business hours only')) {
    riskFactorCount += 2;
  }

  // Access control section
  if (responseMatchesIndicator(responses.dc_access_authentication_method, 'card only') ||
      responseMatchesIndicator(responses.dc_access_authentication_method, 'keys only')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_mantrap_portals, 'no man-trap') ||
      responseMatchesIndicator(responses.dc_mantrap_portals, 'standard doors')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_tailgating_prevention, 'no specific') ||
      responseMatchesIndicator(responses.dc_tailgating_prevention, 'signage only')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_visitor_management, 'no formal') ||
      responseMatchesIndicator(responses.dc_visitor_management, 'sign-in log only')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_escort_requirements, 'no escort') ||
      responseMatchesIndicator(responses.dc_escort_requirements, 'optional')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_cabinet_level_access, 'no cabinet') ||
      responseMatchesIndicator(responses.dc_cabinet_level_access, 'same key')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_access_logging, 'no access logging') ||
      responseMatchesIndicator(responses.dc_access_logging, 'manual logs')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_access_review_frequency, 'never') ||
      responseMatchesIndicator(responses.dc_access_review_frequency, 'ad-hoc')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_access_revocation, 'delayed') ||
      responseMatchesIndicator(responses.dc_access_revocation, '24 hours')) {
    riskFactorCount += 2;
  }

  // Surveillance section
  if (responseMatchesIndicator(responses.dc_cctv_coverage_areas, 'no cctv')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_cctv_hands_on_servers, 'cannot see') ||
      responseMatchesIndicator(responses.dc_cctv_hands_on_servers, 'limited visibility')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_video_retention, 'less than 30') ||
      responseMatchesIndicator(responses.dc_video_retention, 'no retention')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_24x7_monitoring, 'no active monitoring') ||
      responseMatchesIndicator(responses.dc_24x7_monitoring, 'business hours only')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_alarm_monitoring, 'no alarm') ||
      responseMatchesIndicator(responses.dc_alarm_monitoring, 'local alarms only')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_monitoring_response_time, 'over 30') ||
      responseMatchesIndicator(responses.dc_monitoring_response_time, '15-30 minutes')) {
    riskFactorCount += 2;
  }

  // Power section
  if (responseMatchesIndicator(responses.dc_power_redundancy, 'single path') ||
      responseMatchesIndicator(responses.dc_power_redundancy, 'no redundancy')) {
    riskFactorCount += 3;
  }
  if (responseMatchesIndicator(responses.dc_utility_feeds, 'single utility') ||
      responseMatchesIndicator(responses.dc_utility_feeds, 'single feed')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_generator_capacity, 'no generator') ||
      responseMatchesIndicator(responses.dc_generator_capacity, 'less than 24')) {
    riskFactorCount += 3;
  }
  if (responseMatchesIndicator(responses.dc_ups_runtime, 'no ups') ||
      responseMatchesIndicator(responses.dc_ups_runtime, 'less than 5')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_fuel_storage_security, 'no security')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_epo_protection, 'no protection') ||
      responseMatchesIndicator(responses.dc_epo_protection, 'exposed')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_electrical_room_access, 'unrestricted') ||
      responseMatchesIndicator(responses.dc_electrical_room_access, 'no logging')) {
    riskFactorCount += 2;
  }

  // Cooling section
  if (responseMatchesIndicator(responses.dc_cooling_redundancy, 'no redundancy') ||
      responseMatchesIndicator(responses.dc_cooling_redundancy, 'single cooling')) {
    riskFactorCount += 3;
  }
  if (responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'no environmental') ||
      responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'manual checks')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_water_leak_detection, 'no leak detection')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_chiller_plant_security, 'not secured')) {
    riskFactorCount += 2;
  }

  // Fire section
  if (responseMatchesIndicator(responses.dc_fire_detection_system, 'no fire detection') ||
      responseMatchesIndicator(responses.dc_fire_detection_system, 'standard smoke')) {
    riskFactorCount += 3;
  }
  if (responseMatchesIndicator(responses.dc_fire_suppression_type, 'no suppression') ||
      responseMatchesIndicator(responses.dc_fire_suppression_type, 'water sprinklers')) {
    riskFactorCount += 3;
  }
  if (responseMatchesIndicator(responses.dc_manual_release_protection, 'not protected') ||
      responseMatchesIndicator(responses.dc_manual_release_protection, 'exposed')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_fire_system_monitoring, 'no monitoring') ||
      responseMatchesIndicator(responses.dc_fire_system_monitoring, 'local alarms only')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_fire_system_testing, 'never') ||
      responseMatchesIndicator(responses.dc_fire_system_testing, 'annually')) {
    riskFactorCount += 2;
  }

  // Personnel section
  if (responseMatchesIndicator(responses.dc_background_checks, 'no background') ||
      responseMatchesIndicator(responses.dc_background_checks, 'basic criminal')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_security_training, 'no security training') ||
      responseMatchesIndicator(responses.dc_security_training, 'onboarding only')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_contractor_vetting, 'no vetting') ||
      responseMatchesIndicator(responses.dc_contractor_vetting, 'company verification only')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_termination_procedures, 'no formal') ||
      responseMatchesIndicator(responses.dc_termination_procedures, '24 hours')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_incident_response_plan, 'no documented') ||
      responseMatchesIndicator(responses.dc_incident_response_plan, 'never tested')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_media_destruction, 'no formal') ||
      responseMatchesIndicator(responses.dc_media_destruction, 'software wipe only')) {
    riskFactorCount += 2;
  }

  // Compliance section
  if (responseMatchesIndicator(responses.dc_current_certifications, 'no certifications')) {
    riskFactorCount += 1;
  }
  if (responseMatchesIndicator(responses.dc_audit_frequency, 'never') ||
      responseMatchesIndicator(responses.dc_audit_frequency, 'ad-hoc')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_penetration_testing, 'never')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_vulnerability_scanning, 'never') ||
      responseMatchesIndicator(responses.dc_vulnerability_scanning, 'ad-hoc')) {
    riskFactorCount += 2;
  }
  if (responseMatchesIndicator(responses.dc_change_management, 'no formal') ||
      responseMatchesIndicator(responses.dc_change_management, 'informal')) {
    riskFactorCount += 2;
  }

  // Calculate vulnerability: baseline 3, +1 for every 3 risk factors
  const baselineVulnerability = 3;
  const vulnerabilityIncrease = Math.floor(riskFactorCount / 3);
  
  // Apply tier modifier for higher-tier facilities
  const adjustedVulnerability = baselineVulnerability + Math.round(vulnerabilityIncrease * tierModifier);
  
  // Clamp to 1-5 range
  return Math.min(5, Math.max(1, adjustedVulnerability));
}

// ============================================================================
// IMPACT CALCULATION
// ============================================================================

export function calculateImpactFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  const threat = DATACENTER_THREATS.find(t => t.id === threatId);
  let baseline = threat?.typicalImpact || 3;
  let modifier = 0;

  // Tier classification affects impact (higher tier = higher expectations = higher impact)
  const tier = getTierLevel(responses);
  if (tier === 4) modifier += 1;
  else if (tier === 3) modifier += 0.5;

  // SLA affects impact (stricter SLA = higher cost of failure)
  if (responseMatchesIndicator(responses.dc_uptime_sla, '99.999%') ||
      responseMatchesIndicator(responses.dc_uptime_sla, '99.99%')) {
    modifier += 1;
  }

  // Data sensitivity affects impact
  if (responseMatchesIndicator(responses.dc_customer_data_sensitivity, 'classified') ||
      responseMatchesIndicator(responses.dc_customer_data_sensitivity, 'regulated')) {
    modifier += 1;
  }

  // Compliance requirements affect impact (more compliance = more regulatory exposure)
  const complianceReqs = responses.dc_compliance_requirements || [];
  if (Array.isArray(complianceReqs) && complianceReqs.length >= 3) {
    modifier += 0.5;
  }

  // Colocation = more customers affected
  if (responseMatchesIndicator(responses.dc_customer_type, 'colocation') ||
      responseMatchesIndicator(responses.dc_customer_type, 'hyperscale')) {
    modifier += 0.5;
  }

  // Threat-specific impact modifiers
  switch (threatId) {
    case 'power_failure_extended':
    case 'cooling_failure_thermal_event':
    case 'fire_equipment_damage':
    case 'natural_disaster_impact':
      // These threats have facility-wide impact - always high for datacenters
      if (tier >= 3) modifier += 1;
      break;

    case 'theft_equipment_components':
      // Impact depends on data sensitivity
      if (responseMatchesIndicator(responses.dc_customer_data_sensitivity, 'regulated') ||
          responseMatchesIndicator(responses.dc_customer_data_sensitivity, 'classified')) {
        modifier += 1;
      }
      break;

    case 'cyber_physical_attack':
      // Can cascade to multiple systems
      if (responseMatchesIndicator(responses.dc_monitoring_integration, 'fully integrated')) {
        modifier += 0.5; // Integrated systems = more attack surface
      }
      break;
  }

  // Clamp to 1-5 range
  const finalImpact = Math.min(5, Math.max(1, baseline + modifier));
  return Math.round(finalImpact);
}

// ============================================================================
// CONTROL RECOMMENDATIONS
// ============================================================================

export function generateControlRecommendations(
  responses: InterviewResponses,
  threatId?: string
): string[] {
  const recommendations: string[] = [];
  const addedControls = new Set<string>();

  function addControl(controlId: string, reason: string): void {
    if (!addedControls.has(controlId)) {
      recommendations.push(controlId);
      addedControls.add(controlId);
    }
  }

  // If threat-specific, only recommend controls for that threat
  if (threatId) {
    const threatControls = THREAT_CONTROL_MAPPING[threatId] || [];
    for (const control of threatControls) {
      // Check if the control is missing based on interview responses
      if (isControlMissing(responses, control)) {
        addControl(control, `Addresses ${threatId}`);
      }
    }
    return recommendations;
  }

  // Otherwise, comprehensive gap-based recommendations
  
  // Perimeter gaps
  if (responseMatchesIndicator(responses.dc_perimeter_barrier, 'no dedicated') ||
      responseMatchesIndicator(responses.dc_perimeter_barrier, '6ft or less')) {
    addControl('high_security_fencing', 'Perimeter barrier inadequate');
  }
  if (responseMatchesIndicator(responses.dc_perimeter_intrusion_detection, 'no intrusion')) {
    addControl('perimeter_intrusion_detection', 'No perimeter detection');
  }
  if (responseMatchesIndicator(responses.dc_vehicle_barriers, 'no vehicle barriers') ||
      responseMatchesIndicator(responses.dc_vehicle_barriers, 'not rated')) {
    addControl('vehicle_barriers_k_rated', 'Vehicle-borne threat protection lacking');
  }
  if (responseMatchesIndicator(responses.dc_standoff_distance, 'less than 50')) {
    addControl('standoff_distance_100ft', 'Standoff distance inadequate');
  }

  // Access control gaps
  if (responseMatchesIndicator(responses.dc_access_authentication_method, 'card only') ||
      responseMatchesIndicator(responses.dc_access_authentication_method, 'keys only')) {
    addControl('multi_factor_access', 'Single-factor authentication');
    addControl('biometric_authentication', 'Biometric recommended for datacenter');
  }
  if (responseMatchesIndicator(responses.dc_mantrap_portals, 'no man-trap') ||
      responseMatchesIndicator(responses.dc_mantrap_portals, 'standard doors')) {
    addControl('mantrap_portals', 'No man-trap portals');
  }
  if (responseMatchesIndicator(responses.dc_tailgating_prevention, 'no specific') ||
      responseMatchesIndicator(responses.dc_tailgating_prevention, 'signage only')) {
    addControl('tailgating_detection', 'Tailgating prevention inadequate');
  }
  if (responseMatchesIndicator(responses.dc_visitor_management, 'no formal') ||
      responseMatchesIndicator(responses.dc_visitor_management, 'sign-in log only')) {
    addControl('visitor_management_system', 'Visitor management inadequate');
  }
  if (responseMatchesIndicator(responses.dc_escort_requirements, 'no escort') ||
      responseMatchesIndicator(responses.dc_escort_requirements, 'optional')) {
    addControl('escort_requirements', 'Escort not enforced');
  }
  if (responseMatchesIndicator(responses.dc_cabinet_level_access, 'no cabinet') ||
      responseMatchesIndicator(responses.dc_cabinet_level_access, 'same key')) {
    addControl('cabinet_level_locks', 'Cabinet-level security lacking');
  }

  // Surveillance gaps
  if (responseMatchesIndicator(responses.dc_cctv_coverage_areas, 'no cctv')) {
    addControl('cctv_comprehensive_coverage', 'No CCTV coverage');
  }
  if (responseMatchesIndicator(responses.dc_cctv_hands_on_servers, 'cannot see') ||
      responseMatchesIndicator(responses.dc_cctv_hands_on_servers, 'limited visibility')) {
    addControl('cctv_hands_on_servers', 'Cannot see hands-on-servers activity');
  }
  if (responseMatchesIndicator(responses.dc_video_retention, 'less than 30') ||
      responseMatchesIndicator(responses.dc_video_retention, 'no retention')) {
    addControl('video_retention_90_days', 'Video retention inadequate');
  }
  if (responseMatchesIndicator(responses.dc_24x7_monitoring, 'no active monitoring') ||
      responseMatchesIndicator(responses.dc_24x7_monitoring, 'business hours only')) {
    addControl('noc_soc_24x7', 'No 24/7 monitoring');
  }
  if (responseMatchesIndicator(responses.dc_alarm_monitoring, 'no alarm') ||
      responseMatchesIndicator(responses.dc_alarm_monitoring, 'local alarms only')) {
    addControl('alarm_monitoring_central', 'Alarm monitoring inadequate');
  }

  // Power infrastructure gaps
  if (responseMatchesIndicator(responses.dc_power_redundancy, 'single path')) {
    addControl('ups_n_plus_1', 'No power redundancy');
  }
  if (responseMatchesIndicator(responses.dc_utility_feeds, 'single utility') ||
      responseMatchesIndicator(responses.dc_utility_feeds, 'single feed')) {
    addControl('redundant_utility_feeds', 'Single utility feed');
  }
  if (responseMatchesIndicator(responses.dc_generator_capacity, 'no generator') ||
      responseMatchesIndicator(responses.dc_generator_capacity, 'less than 24')) {
    addControl('generator_automatic_transfer', 'Generator capacity inadequate');
    addControl('generator_fuel_72_hours', 'Fuel capacity inadequate');
  }
  if (responseMatchesIndicator(responses.dc_epo_protection, 'no protection') ||
      responseMatchesIndicator(responses.dc_epo_protection, 'exposed')) {
    addControl('epo_protection', 'EPO button unprotected');
  }

  // Cooling gaps
  if (responseMatchesIndicator(responses.dc_cooling_redundancy, 'no redundancy')) {
    addControl('cooling_redundancy', 'No cooling redundancy');
  }
  if (responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'no environmental') ||
      responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'manual checks')) {
    addControl('temperature_humidity_monitoring', 'Environmental monitoring inadequate');
  }
  if (responseMatchesIndicator(responses.dc_water_leak_detection, 'no leak detection')) {
    addControl('water_leak_detection', 'No water leak detection');
  }

  // Fire suppression gaps
  if (responseMatchesIndicator(responses.dc_fire_detection_system, 'no fire detection') ||
      responseMatchesIndicator(responses.dc_fire_detection_system, 'standard smoke')) {
    addControl('vesda_early_detection', 'Early smoke detection lacking');
  }
  if (responseMatchesIndicator(responses.dc_fire_suppression_type, 'no suppression') ||
      responseMatchesIndicator(responses.dc_fire_suppression_type, 'water sprinklers')) {
    addControl('clean_agent_suppression', 'Clean agent suppression needed');
  }
  if (responseMatchesIndicator(responses.dc_manual_release_protection, 'not protected') ||
      responseMatchesIndicator(responses.dc_manual_release_protection, 'exposed')) {
    addControl('manual_release_protection', 'Manual release unprotected');
  }

  // Personnel gaps
  if (responseMatchesIndicator(responses.dc_background_checks, 'no background') ||
      responseMatchesIndicator(responses.dc_background_checks, 'basic criminal')) {
    addControl('background_checks_comprehensive', 'Background checks inadequate');
  }
  if (responseMatchesIndicator(responses.dc_security_training, 'no security training') ||
      responseMatchesIndicator(responses.dc_security_training, 'onboarding only')) {
    addControl('security_training_annual', 'Security training inadequate');
  }
  if (responseMatchesIndicator(responses.dc_contractor_vetting, 'no vetting')) {
    addControl('contractor_vetting', 'Contractor vetting lacking');
  }
  if (responseMatchesIndicator(responses.dc_termination_procedures, 'no formal') ||
      responseMatchesIndicator(responses.dc_access_revocation, 'delayed')) {
    addControl('access_revocation_immediate', 'Access revocation delayed');
  }

  // Compliance gaps
  if (responseMatchesIndicator(responses.dc_audit_frequency, 'never') ||
      responseMatchesIndicator(responses.dc_audit_frequency, 'ad-hoc')) {
    addControl('audit_frequency_quarterly', 'Audit frequency inadequate');
  }
  if (responseMatchesIndicator(responses.dc_penetration_testing, 'never')) {
    addControl('penetration_testing_annual', 'No penetration testing');
  }
  if (responseMatchesIndicator(responses.dc_vulnerability_scanning, 'never') ||
      responseMatchesIndicator(responses.dc_vulnerability_scanning, 'ad-hoc')) {
    addControl('vulnerability_scanning', 'Vulnerability scanning inadequate');
  }
  if (responseMatchesIndicator(responses.dc_change_management, 'no formal') ||
      responseMatchesIndicator(responses.dc_change_management, 'informal')) {
    addControl('change_management', 'Change management lacking');
  }

  return recommendations;
}

function isControlMissing(responses: InterviewResponses, controlId: string): boolean {
  // Map controls to their corresponding question IDs and expected answers
  const controlQuestionMap: Record<string, { questionId: string; badIndicators: string[] }> = {
    high_security_fencing: { questionId: 'dc_perimeter_barrier', badIndicators: ['no dedicated', '6ft or less'] },
    perimeter_intrusion_detection: { questionId: 'dc_perimeter_intrusion_detection', badIndicators: ['no intrusion'] },
    vehicle_barriers_k_rated: { questionId: 'dc_vehicle_barriers', badIndicators: ['no vehicle barriers', 'not rated'] },
    standoff_distance_100ft: { questionId: 'dc_standoff_distance', badIndicators: ['less than 50', '50-100'] },
    biometric_authentication: { questionId: 'dc_access_authentication_method', badIndicators: ['card only', 'keys only'] },
    multi_factor_access: { questionId: 'dc_access_authentication_method', badIndicators: ['card only', 'keys only', 'single factor'] },
    mantrap_portals: { questionId: 'dc_mantrap_portals', badIndicators: ['no man-trap', 'standard doors'] },
    tailgating_detection: { questionId: 'dc_tailgating_prevention', badIndicators: ['no specific', 'signage only'] },
    visitor_management_system: { questionId: 'dc_visitor_management', badIndicators: ['no formal', 'sign-in log only'] },
    escort_requirements: { questionId: 'dc_escort_requirements', badIndicators: ['no escort', 'optional'] },
    cabinet_level_locks: { questionId: 'dc_cabinet_level_access', badIndicators: ['no cabinet', 'same key'] },
    access_logging_audit: { questionId: 'dc_access_logging', badIndicators: ['no access logging', 'manual logs'] },
    access_review_quarterly: { questionId: 'dc_access_review_frequency', badIndicators: ['never', 'ad-hoc', 'annually'] },
    access_revocation_immediate: { questionId: 'dc_access_revocation', badIndicators: ['delayed', '24 hours'] },
    cctv_comprehensive_coverage: { questionId: 'dc_cctv_coverage_areas', badIndicators: ['no cctv'] },
    cctv_hands_on_servers: { questionId: 'dc_cctv_hands_on_servers', badIndicators: ['cannot see', 'limited visibility'] },
    video_retention_90_days: { questionId: 'dc_video_retention', badIndicators: ['less than 30', 'no retention'] },
    noc_soc_24x7: { questionId: 'dc_24x7_monitoring', badIndicators: ['no active monitoring', 'business hours only'] },
    alarm_monitoring_central: { questionId: 'dc_alarm_monitoring', badIndicators: ['no alarm', 'local alarms only'] },
    redundant_utility_feeds: { questionId: 'dc_utility_feeds', badIndicators: ['single utility', 'single feed'] },
    ups_n_plus_1: { questionId: 'dc_power_redundancy', badIndicators: ['single path', 'no redundancy'] },
    generator_automatic_transfer: { questionId: 'dc_generator_capacity', badIndicators: ['no generator'] },
    generator_fuel_72_hours: { questionId: 'dc_generator_capacity', badIndicators: ['less than 24'] },
    epo_protection: { questionId: 'dc_epo_protection', badIndicators: ['no protection', 'exposed'] },
    electrical_room_access: { questionId: 'dc_electrical_room_access', badIndicators: ['unrestricted', 'no logging'] },
    cooling_redundancy: { questionId: 'dc_cooling_redundancy', badIndicators: ['no redundancy', 'single cooling'] },
    temperature_humidity_monitoring: { questionId: 'dc_temp_humidity_monitoring', badIndicators: ['no environmental', 'manual checks'] },
    water_leak_detection: { questionId: 'dc_water_leak_detection', badIndicators: ['no leak detection'] },
    chiller_plant_security: { questionId: 'dc_chiller_plant_security', badIndicators: ['not secured'] },
    vesda_early_detection: { questionId: 'dc_fire_detection_system', badIndicators: ['no fire detection', 'standard smoke'] },
    clean_agent_suppression: { questionId: 'dc_fire_suppression_type', badIndicators: ['no suppression', 'water sprinklers'] },
    manual_release_protection: { questionId: 'dc_manual_release_protection', badIndicators: ['not protected', 'exposed'] },
    fire_system_monitoring: { questionId: 'dc_fire_system_monitoring', badIndicators: ['no monitoring', 'local alarms only'] },
    background_checks_comprehensive: { questionId: 'dc_background_checks', badIndicators: ['no background', 'basic criminal'] },
    security_training_annual: { questionId: 'dc_security_training', badIndicators: ['no security training', 'onboarding only'] },
    contractor_vetting: { questionId: 'dc_contractor_vetting', badIndicators: ['no vetting', 'company verification only'] },
    termination_procedures: { questionId: 'dc_termination_procedures', badIndicators: ['no formal', '24 hours'] },
    incident_response_plan: { questionId: 'dc_incident_response_plan', badIndicators: ['no documented', 'never tested'] },
    audit_frequency_quarterly: { questionId: 'dc_audit_frequency', badIndicators: ['never', 'ad-hoc'] },
    penetration_testing_annual: { questionId: 'dc_penetration_testing', badIndicators: ['never'] },
    vulnerability_scanning: { questionId: 'dc_vulnerability_scanning', badIndicators: ['never', 'ad-hoc'] },
    change_management: { questionId: 'dc_change_management', badIndicators: ['no formal', 'informal'] },
  };

  const mapping = controlQuestionMap[controlId];
  if (!mapping) return false;

  const response = responses[mapping.questionId];
  if (!response) return true; // No answer = assume missing

  for (const indicator of mapping.badIndicators) {
    if (responseMatchesIndicator(response, indicator)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// SCENARIO DESCRIPTION GENERATOR
// ============================================================================

function generateScenarioDescription(
  responses: InterviewResponses,
  threatId: string,
  threatLikelihood: number,
  vulnerability: number,
  impact: number
): string {
  const threat = DATACENTER_THREATS.find(t => t.id === threatId);
  if (!threat) return '';

  const tier = getTierLevel(responses);
  const tierName = tier > 0 ? `Tier ${tier}` : 'unclassified';
  const customerType = responses.dc_customer_type || 'enterprise';

  const riskLevel = classifyRiskLevel(threatLikelihood * vulnerability * impact);
  const riskLevelDesc = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);

  let description = `${threat.name} scenario for this ${tierName} ${customerType} datacenter. `;

  // Add threat-specific context
  switch (threatId) {
    case 'unauthorized_physical_access':
      description += 'Unauthorized individuals could gain entry through perimeter breach, tailgating, or social engineering. ';
      if (responseMatchesIndicator(responses.dc_mantrap_portals, 'no man-trap')) {
        description += 'Lack of man-trap portals increases tailgating risk significantly. ';
      }
      break;

    case 'insider_threat_privileged_access':
      description += 'Employees, contractors, or vendors with authorized access could engage in malicious or negligent actions. ';
      if (responseMatchesIndicator(responses.dc_access_revocation, 'delayed')) {
        description += 'Delayed access revocation on termination creates extended exposure window. ';
      }
      break;

    case 'power_failure_extended':
      description += 'Extended utility outage could exceed backup power capacity. ';
      if (responseMatchesIndicator(responses.dc_generator_capacity, 'less than 24')) {
        description += 'Limited generator fuel capacity (under 24 hours) significantly increases risk. ';
      }
      description += `Average datacenter downtime costs $9,000/minute - critical for ${tierName} operations. `;
      break;

    case 'cooling_failure_thermal_event':
      description += 'Loss of cooling could cause thermal damage to equipment within minutes. ';
      if (responseMatchesIndicator(responses.dc_cooling_redundancy, 'no redundancy')) {
        description += 'Single cooling system creates single point of failure. ';
      }
      break;

    case 'fire_equipment_damage':
      description += 'Fire could cause catastrophic equipment damage. ';
      if (responseMatchesIndicator(responses.dc_fire_suppression_type, 'water sprinklers')) {
        description += 'Water sprinklers would destroy electronic equipment - clean agent suppression recommended. ';
      }
      break;

    case 'sabotage_infrastructure':
      description += 'Critical infrastructure (EPO, fire suppression, power) could be targeted for sabotage. ';
      if (responseMatchesIndicator(responses.dc_epo_protection, 'no protection')) {
        description += 'Unprotected EPO button is high-priority sabotage target. ';
      }
      break;

    case 'terrorism_vehicle_borne':
      description += 'Vehicle ramming or explosive attack targeting facility perimeter. ';
      if (responseMatchesIndicator(responses.dc_standoff_distance, 'less than 50')) {
        description += 'Inadequate standoff distance (under 50ft) limits protection. ';
      }
      break;

    default:
      description += threat.description;
  }

  description += `Risk classification: ${riskLevelDesc} (T=${threatLikelihood}, V=${vulnerability}, I=${impact}).`;

  return description;
}

// ============================================================================
// MAIN ENTRY POINT: Initialize Risk Scenarios from Interview
// ============================================================================

export async function initializeRiskScenariosFromInterview(
  assessmentId: number,
  interviewResponses: InterviewResponses
): Promise<GeneratedScenarioResult> {
  const scenarios: NewRiskScenario[] = [];
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  // Generate scenarios for all 15 datacenter threats
  for (const threat of DATACENTER_THREATS) {
    const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threat.id);
    const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threat.id);
    const impact = calculateImpactFromInterview(interviewResponses, threat.id);
    const inherentRisk = threatLikelihood * vulnerability * impact;
    const riskLevel = classifyRiskLevel(inherentRisk);

    // Count by risk level
    if (riskLevel === 'critical') criticalCount++;
    else if (riskLevel === 'high') highCount++;
    else if (riskLevel === 'medium') mediumCount++;
    else lowCount++;

    // Look up threat ID in database using the mapper's threat.id
    const [threatRecord] = await db.select().from(threatLibrary).where(eq(threatLibrary.id, threat.id)).limit(1);

    const scenarioDescription = generateScenarioDescription(
      interviewResponses,
      threat.id,
      threatLikelihood,
      vulnerability,
      impact
    );

    scenarios.push({
      assessmentId: assessmentId.toString(),
      threatLibraryId: threatRecord?.id || threat.id,
      threatLikelihood,
      vulnerability,
      impact,
      inherentRisk,
      residualRisk: inherentRisk, // No controls applied yet
      controlEffectiveness: 0,
      riskLevel,
      scenarioDescription,
    });
  }

  // Insert scenarios into database
  const insertedIds: string[] = [];
  
  for (const scenario of scenarios) {
    try {
      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId: scenario.assessmentId,
        threatLibraryId: scenario.threatLibraryId,
        scenario: scenario.scenarioDescription,
        asset: 'Datacenter Facility',
        likelihood: scenario.threatLikelihood.toString(),
        impact: scenario.impact.toString(),
        riskLevel: scenario.riskLevel,
        likelihoodScore: scenario.threatLikelihood,
        impactScore: scenario.impact,
        inherentRisk: scenario.inherentRisk,
        residualRisk: scenario.residualRisk,
        controlEffectiveness: scenario.controlEffectiveness,
      }).returning({ id: riskScenarios.id });
      
      if (inserted?.id) {
        insertedIds.push(inserted.id);
      }
    } catch (error) {
      console.error(`Failed to insert scenario:`, error);
    }
  }

  return {
    success: true,
    generatedScenarios: scenarios.length,
    criticalRisks: criticalCount,
    highRisks: highCount,
    mediumRisks: mediumCount,
    lowRisks: lowCount,
    riskScenarioIds: insertedIds,
  };
}

// ============================================================================
// SECURITY SCORE CALCULATION
// ============================================================================

export function calculateOverallSecurityScore(
  responses: InterviewResponses
): SecurityScoreResult {
  const findings: string[] = [];
  const strengths: string[] = [];
  const categoryScores: Record<string, number> = {};
  
  let totalFactors = 0;
  let securityFactors = 0;

  // =========================================================================
  // PERIMETER & SITE SECURITY
  // =========================================================================
  let perimeterScore = 0;
  let perimeterTotal = 0;

  // Perimeter barrier
  perimeterTotal++;
  if (responseMatchesIndicator(responses.dc_perimeter_barrier, 'anti-climb') &&
      responseMatchesIndicator(responses.dc_perimeter_barrier, 'intrusion detection')) {
    perimeterScore++;
    strengths.push('Anti-climb fencing with intrusion detection');
  } else if (responseMatchesIndicator(responses.dc_perimeter_barrier, 'no dedicated')) {
    findings.push('No dedicated perimeter barrier');
  }

  // Vehicle barriers
  perimeterTotal++;
  if (responseMatchesIndicator(responses.dc_vehicle_barriers, 'K12') ||
      responseMatchesIndicator(responses.dc_vehicle_barriers, 'K8')) {
    perimeterScore++;
    strengths.push('Rated vehicle barriers');
  } else if (responseMatchesIndicator(responses.dc_vehicle_barriers, 'no vehicle barriers')) {
    findings.push('No vehicle barriers');
  }

  // Standoff distance
  perimeterTotal++;
  if (responseMatchesIndicator(responses.dc_standoff_distance, '100+ feet')) {
    perimeterScore++;
  } else if (responseMatchesIndicator(responses.dc_standoff_distance, 'less than 50')) {
    findings.push('Inadequate standoff distance');
  }

  // Perimeter CCTV
  perimeterTotal++;
  if (responseMatchesIndicator(responses.dc_perimeter_cctv, 'complete coverage')) {
    perimeterScore++;
  } else if (responseMatchesIndicator(responses.dc_perimeter_cctv, 'no cctv')) {
    findings.push('No perimeter CCTV coverage');
  }

  // Security monitoring
  perimeterTotal++;
  if (responseMatchesIndicator(responses.dc_security_monitoring_location, '24/7')) {
    perimeterScore++;
    strengths.push('24/7 security monitoring');
  } else if (responseMatchesIndicator(responses.dc_security_monitoring_location, 'no active monitoring')) {
    findings.push('No active security monitoring');
  }

  categoryScores['perimeterSecurity'] = Math.round((perimeterScore / perimeterTotal) * 100);
  totalFactors += perimeterTotal;
  securityFactors += perimeterScore;

  // =========================================================================
  // ACCESS CONTROL
  // =========================================================================
  let accessScore = 0;
  let accessTotal = 0;

  // Authentication method
  accessTotal++;
  if (responseMatchesIndicator(responses.dc_access_authentication_method, 'three-factor') ||
      responseMatchesIndicator(responses.dc_access_authentication_method, 'biometric')) {
    accessScore++;
    strengths.push('Multi-factor authentication');
  } else if (responseMatchesIndicator(responses.dc_access_authentication_method, 'keys only') ||
             responseMatchesIndicator(responses.dc_access_authentication_method, 'card only')) {
    findings.push('Single-factor authentication');
  }

  // Man-traps
  accessTotal++;
  if (responseMatchesIndicator(responses.dc_mantrap_portals, 'all datacenter entry') ||
      responseMatchesIndicator(responses.dc_mantrap_portals, 'weight sensors')) {
    accessScore++;
    strengths.push('Man-trap portals at entries');
  } else if (responseMatchesIndicator(responses.dc_mantrap_portals, 'no man-trap')) {
    findings.push('No man-trap portals');
  }

  // Visitor management
  accessTotal++;
  if (responseMatchesIndicator(responses.dc_visitor_management, 'automated') ||
      responseMatchesIndicator(responses.dc_visitor_management, 'pre-registration')) {
    accessScore++;
  } else if (responseMatchesIndicator(responses.dc_visitor_management, 'no formal')) {
    findings.push('No formal visitor management');
  }

  // Cabinet-level access
  accessTotal++;
  if (responseMatchesIndicator(responses.dc_cabinet_level_access, 'electronic') ||
      responseMatchesIndicator(responses.dc_cabinet_level_access, 'biometric')) {
    accessScore++;
    strengths.push('Electronic cabinet locks');
  } else if (responseMatchesIndicator(responses.dc_cabinet_level_access, 'no cabinet')) {
    findings.push('No cabinet-level locks');
  }

  // Access logging
  accessTotal++;
  if (responseMatchesIndicator(responses.dc_access_logging, 'tamper-proof')) {
    accessScore++;
  } else if (responseMatchesIndicator(responses.dc_access_logging, 'no access logging')) {
    findings.push('No physical access logging');
  }

  // Access review
  accessTotal++;
  if (responseMatchesIndicator(responses.dc_access_review_frequency, 'quarterly')) {
    accessScore++;
  } else if (responseMatchesIndicator(responses.dc_access_review_frequency, 'never')) {
    findings.push('No access rights review process');
  }

  categoryScores['accessControl'] = Math.round((accessScore / accessTotal) * 100);
  totalFactors += accessTotal;
  securityFactors += accessScore;

  // =========================================================================
  // SURVEILLANCE & MONITORING
  // =========================================================================
  let surveillanceScore = 0;
  let surveillanceTotal = 0;

  // CCTV coverage
  surveillanceTotal++;
  const cctvAreas = responses.dc_cctv_coverage_areas || [];
  if (Array.isArray(cctvAreas) && cctvAreas.length >= 8) {
    surveillanceScore++;
    strengths.push('Comprehensive CCTV coverage');
  } else if (responseMatchesIndicator(responses.dc_cctv_coverage_areas, 'no cctv')) {
    findings.push('No CCTV coverage');
  }

  // Hands-on-servers visibility
  surveillanceTotal++;
  if (responseMatchesIndicator(responses.dc_cctv_hands_on_servers, 'clear view')) {
    surveillanceScore++;
  } else if (responseMatchesIndicator(responses.dc_cctv_hands_on_servers, 'cannot see')) {
    findings.push('Cannot see hands-on-servers activity');
  }

  // Video retention
  surveillanceTotal++;
  if (responseMatchesIndicator(responses.dc_video_retention, '90') ||
      responseMatchesIndicator(responses.dc_video_retention, '180')) {
    surveillanceScore++;
  } else if (responseMatchesIndicator(responses.dc_video_retention, 'less than 30') ||
             responseMatchesIndicator(responses.dc_video_retention, 'no retention')) {
    findings.push('Video retention under 30 days');
  }

  // 24/7 monitoring
  surveillanceTotal++;
  if (responseMatchesIndicator(responses.dc_24x7_monitoring, 'dedicated security') ||
      responseMatchesIndicator(responses.dc_24x7_monitoring, '24/7')) {
    surveillanceScore++;
  } else if (responseMatchesIndicator(responses.dc_24x7_monitoring, 'no active monitoring')) {
    findings.push('No active video monitoring');
  }

  // Alarm monitoring
  surveillanceTotal++;
  if (responseMatchesIndicator(responses.dc_alarm_monitoring, 'UL-listed') ||
      responseMatchesIndicator(responses.dc_alarm_monitoring, 'central station')) {
    surveillanceScore++;
  } else if (responseMatchesIndicator(responses.dc_alarm_monitoring, 'no alarm')) {
    findings.push('No alarm system');
  }

  categoryScores['surveillance'] = Math.round((surveillanceScore / surveillanceTotal) * 100);
  totalFactors += surveillanceTotal;
  securityFactors += surveillanceScore;

  // =========================================================================
  // POWER INFRASTRUCTURE
  // =========================================================================
  let powerScore = 0;
  let powerTotal = 0;

  // Power redundancy
  powerTotal++;
  if (responseMatchesIndicator(responses.dc_power_redundancy, '2N') ||
      responseMatchesIndicator(responses.dc_power_redundancy, '2(N+1)')) {
    powerScore++;
    strengths.push('Full power redundancy');
  } else if (responseMatchesIndicator(responses.dc_power_redundancy, 'single path')) {
    findings.push('No power redundancy');
  }

  // Utility feeds
  powerTotal++;
  if (responseMatchesIndicator(responses.dc_utility_feeds, 'dual feeds') &&
      responseMatchesIndicator(responses.dc_utility_feeds, 'separate substations')) {
    powerScore++;
  } else if (responseMatchesIndicator(responses.dc_utility_feeds, 'single utility')) {
    findings.push('Single utility feed');
  }

  // Generator capacity
  powerTotal++;
  if (responseMatchesIndicator(responses.dc_generator_capacity, '72+ hours') ||
      responseMatchesIndicator(responses.dc_generator_capacity, 'N+1')) {
    powerScore++;
    strengths.push('72+ hour generator fuel capacity');
  } else if (responseMatchesIndicator(responses.dc_generator_capacity, 'no generator')) {
    findings.push('No generator backup');
  }

  // UPS runtime
  powerTotal++;
  if (responseMatchesIndicator(responses.dc_ups_runtime, '30+ minutes') ||
      responseMatchesIndicator(responses.dc_ups_runtime, '15-30 minutes')) {
    powerScore++;
  } else if (responseMatchesIndicator(responses.dc_ups_runtime, 'no ups')) {
    findings.push('No UPS system');
  }

  // EPO protection
  powerTotal++;
  if (responseMatchesIndicator(responses.dc_epo_protection, 'cover') &&
      responseMatchesIndicator(responses.dc_epo_protection, 'access control')) {
    powerScore++;
  } else if (responseMatchesIndicator(responses.dc_epo_protection, 'no protection')) {
    findings.push('EPO button unprotected');
  }

  categoryScores['powerInfrastructure'] = Math.round((powerScore / powerTotal) * 100);
  totalFactors += powerTotal;
  securityFactors += powerScore;

  // =========================================================================
  // COOLING & ENVIRONMENTAL
  // =========================================================================
  let coolingScore = 0;
  let coolingTotal = 0;

  // Cooling redundancy
  coolingTotal++;
  if (responseMatchesIndicator(responses.dc_cooling_redundancy, '2N') ||
      responseMatchesIndicator(responses.dc_cooling_redundancy, 'N+1')) {
    coolingScore++;
  } else if (responseMatchesIndicator(responses.dc_cooling_redundancy, 'no redundancy')) {
    findings.push('No cooling redundancy');
  }

  // Environmental monitoring
  coolingTotal++;
  if (responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'per-rack') ||
      responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'automated alerting')) {
    coolingScore++;
    strengths.push('Per-rack environmental monitoring');
  } else if (responseMatchesIndicator(responses.dc_temp_humidity_monitoring, 'no environmental')) {
    findings.push('No environmental monitoring');
  }

  // Water leak detection
  coolingTotal++;
  if (responseMatchesIndicator(responses.dc_water_leak_detection, 'comprehensive') ||
      responseMatchesIndicator(responses.dc_water_leak_detection, 'cable-based')) {
    coolingScore++;
  } else if (responseMatchesIndicator(responses.dc_water_leak_detection, 'no leak detection')) {
    findings.push('No water leak detection');
  }

  categoryScores['coolingEnvironmental'] = Math.round((coolingScore / coolingTotal) * 100);
  totalFactors += coolingTotal;
  securityFactors += coolingScore;

  // =========================================================================
  // FIRE SUPPRESSION
  // =========================================================================
  let fireScore = 0;
  let fireTotal = 0;

  // Fire detection
  fireTotal++;
  if (responseMatchesIndicator(responses.dc_fire_detection_system, 'VESDA') ||
      responseMatchesIndicator(responses.dc_fire_detection_system, 'air sampling')) {
    fireScore++;
    strengths.push('VESDA early smoke detection');
  } else if (responseMatchesIndicator(responses.dc_fire_detection_system, 'no fire detection')) {
    findings.push('No fire detection');
  }

  // Suppression type
  fireTotal++;
  if (responseMatchesIndicator(responses.dc_fire_suppression_type, 'clean agent') ||
      responseMatchesIndicator(responses.dc_fire_suppression_type, 'FM-200') ||
      responseMatchesIndicator(responses.dc_fire_suppression_type, 'Novec')) {
    fireScore++;
    strengths.push('Clean agent fire suppression');
  } else if (responseMatchesIndicator(responses.dc_fire_suppression_type, 'water sprinklers')) {
    findings.push('Water sprinklers - will destroy equipment');
  } else if (responseMatchesIndicator(responses.dc_fire_suppression_type, 'no suppression')) {
    findings.push('No fire suppression system');
  }

  // Fire system testing
  fireTotal++;
  if (responseMatchesIndicator(responses.dc_fire_system_testing, 'quarterly')) {
    fireScore++;
  } else if (responseMatchesIndicator(responses.dc_fire_system_testing, 'never')) {
    findings.push('Fire system never tested');
  }

  categoryScores['fireSuppression'] = Math.round((fireScore / fireTotal) * 100);
  totalFactors += fireTotal;
  securityFactors += fireScore;

  // =========================================================================
  // PERSONNEL SECURITY
  // =========================================================================
  let personnelScore = 0;
  let personnelTotal = 0;

  // Background checks
  personnelTotal++;
  if (responseMatchesIndicator(responses.dc_background_checks, 'comprehensive')) {
    personnelScore++;
  } else if (responseMatchesIndicator(responses.dc_background_checks, 'no background')) {
    findings.push('No background checks');
  }

  // Security training
  personnelTotal++;
  if (responseMatchesIndicator(responses.dc_security_training, 'annual') &&
      responseMatchesIndicator(responses.dc_security_training, 'role-specific')) {
    personnelScore++;
  } else if (responseMatchesIndicator(responses.dc_security_training, 'no security training')) {
    findings.push('No security training');
  }

  // Contractor vetting
  personnelTotal++;
  if (responseMatchesIndicator(responses.dc_contractor_vetting, 'full vetting') ||
      responseMatchesIndicator(responses.dc_contractor_vetting, 'background check')) {
    personnelScore++;
  } else if (responseMatchesIndicator(responses.dc_contractor_vetting, 'no vetting')) {
    findings.push('No contractor vetting process');
  }

  // Termination procedures
  personnelTotal++;
  if (responseMatchesIndicator(responses.dc_termination_procedures, 'immediate') &&
      responseMatchesIndicator(responses.dc_termination_procedures, 'escort')) {
    personnelScore++;
  } else if (responseMatchesIndicator(responses.dc_termination_procedures, 'no formal')) {
    findings.push('No formal termination procedures');
  }

  // Incident response plan
  personnelTotal++;
  if (responseMatchesIndicator(responses.dc_incident_response_plan, 'documented') &&
      responseMatchesIndicator(responses.dc_incident_response_plan, 'tested')) {
    personnelScore++;
    strengths.push('Documented and tested incident response plan');
  } else if (responseMatchesIndicator(responses.dc_incident_response_plan, 'no documented')) {
    findings.push('No documented incident response plan');
  }

  categoryScores['personnelSecurity'] = Math.round((personnelScore / personnelTotal) * 100);
  totalFactors += personnelTotal;
  securityFactors += personnelScore;

  // =========================================================================
  // COMPLIANCE & AUDIT
  // =========================================================================
  let complianceScore = 0;
  let complianceTotal = 0;

  // Certifications
  complianceTotal++;
  const certs = responses.dc_current_certifications || [];
  if (Array.isArray(certs) && certs.includes('SOC 2 Type II')) {
    complianceScore++;
    strengths.push('SOC 2 Type II certified');
  } else if (responseMatchesIndicator(responses.dc_current_certifications, 'no certifications')) {
    findings.push('No security certifications');
  }

  // Audit frequency
  complianceTotal++;
  if (responseMatchesIndicator(responses.dc_audit_frequency, 'quarterly')) {
    complianceScore++;
  } else if (responseMatchesIndicator(responses.dc_audit_frequency, 'never')) {
    findings.push('No security audits conducted');
  }

  // Penetration testing
  complianceTotal++;
  if (responseMatchesIndicator(responses.dc_penetration_testing, 'annual')) {
    complianceScore++;
  } else if (responseMatchesIndicator(responses.dc_penetration_testing, 'never')) {
    findings.push('No penetration testing conducted');
  }

  // Change management
  complianceTotal++;
  if (responseMatchesIndicator(responses.dc_change_management, 'formal process') ||
      responseMatchesIndicator(responses.dc_change_management, 'approval workflow')) {
    complianceScore++;
  } else if (responseMatchesIndicator(responses.dc_change_management, 'no formal')) {
    findings.push('No formal change management process');
  }

  categoryScores['complianceAudit'] = Math.round((complianceScore / complianceTotal) * 100);
  totalFactors += complianceTotal;
  securityFactors += complianceScore;

  // =========================================================================
  // CALCULATE FINAL SCORE
  // =========================================================================
  
  const score = Math.round((securityFactors / totalFactors) * 100);
  
  let grade: string;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { 
    score, 
    grade, 
    findings: findings.slice(0, 10), // Top 10 findings
    strengths: strengths.slice(0, 5), // Top 5 strengths
    categoryScores,
  };
}

// ============================================================================
// THREAT-SPECIFIC VULNERABILITY BREAKDOWN
// ============================================================================

export function getThreatVulnerabilityBreakdown(
  responses: InterviewResponses,
  threatId: string
): ThreatVulnerabilityBreakdown {
  const threat = DATACENTER_THREATS.find(t => t.id === threatId);
  if (!threat) {
    throw new Error(`Unknown threat ID: ${threatId}`);
  }

  const threatLikelihood = calculateThreatLikelihoodFromInterview(responses, threatId);
  const vulnerability = calculateVulnerabilityFromInterview(responses, threatId);
  const impact = calculateImpactFromInterview(responses, threatId);
  const inherentRisk = threatLikelihood * vulnerability * impact;
  const riskLevel = classifyRiskLevel(inherentRisk);

  const relatedQuestions = THREAT_QUESTION_MAP[threatId] || [];
  const questionBreakdown: QuestionContribution[] = [];
  const controlGaps: string[] = [];
  const existingControls: string[] = [];

  // Analyze each related question
  for (const questionId of relatedQuestions) {
    const answer = responses[questionId];
    if (answer === undefined) continue;

    let contribution: 'increases_risk' | 'decreases_risk' | 'neutral' = 'neutral';
    let points = 0;
    let reasoning = '';

    // Simplified analysis - in production would have detailed per-question logic
    const answerStr = String(answer).toLowerCase();
    
    // Check for bad indicators
    const badIndicators = ['no ', 'none', 'never', 'not ', 'single', 'basic', 'standard'];
    const goodIndicators = ['yes', 'full', 'comprehensive', 'redundant', '24/7', 'automated'];
    
    if (badIndicators.some(ind => answerStr.includes(ind))) {
      contribution = 'increases_risk';
      points = 2;
      reasoning = 'Response indicates control gap';
    } else if (goodIndicators.some(ind => answerStr.includes(ind))) {
      contribution = 'decreases_risk';
      points = -1;
      reasoning = 'Response indicates control in place';
    }

    questionBreakdown.push({
      questionId,
      questionText: `Question ${questionId}`, // Would map to actual text
      answer,
      contribution,
      points,
      reasoning,
    });
  }

  // Determine control gaps and existing controls
  const recommendedControls = THREAT_CONTROL_MAPPING[threatId] || [];
  for (const controlId of recommendedControls) {
    if (isControlMissing(responses, controlId)) {
      controlGaps.push(controlId);
    } else {
      existingControls.push(controlId);
    }
  }

  return {
    threatId,
    threatName: threat.name,
    threatLikelihood,
    vulnerability,
    impact,
    inherentRisk,
    riskLevel,
    controlGaps,
    existingControls,
    questionBreakdown,
  };
}

// ============================================================================
// ADDITIONAL HELPER EXPORTS
// ============================================================================

/**
 * Calculate risk for a single threat (useful for API responses)
 */
export function calculateSingleThreatRisk(
  responses: InterviewResponses,
  threatId: string
): CalculatedRiskInputs {
  const threatLikelihood = calculateThreatLikelihoodFromInterview(responses, threatId);
  const vulnerability = calculateVulnerabilityFromInterview(responses, threatId);
  const impact = calculateImpactFromInterview(responses, threatId);
  const inherentRisk = threatLikelihood * vulnerability * impact;
  const riskLevel = classifyRiskLevel(inherentRisk);
  const suggestedControls = generateControlRecommendations(responses, threatId);

  return {
    threatLikelihood,
    vulnerability,
    impact,
    inherentRisk,
    riskLevel,
    suggestedControls,
  };
}

/**
 * Get prioritized threats based on calculated risk
 */
export function getPrioritizedThreats(
  responses: InterviewResponses
): Array<{ threatId: string; name: string; riskLevel: string; inherentRisk: number }> {
  const results = DATACENTER_THREATS.map(threat => {
    const risk = calculateSingleThreatRisk(responses, threat.id);
    return {
      threatId: threat.id,
      name: threat.name,
      riskLevel: risk.riskLevel,
      inherentRisk: risk.inherentRisk,
    };
  });

  // Sort by inherent risk descending
  return results.sort((a, b) => b.inherentRisk - a.inherentRisk);
}

/**
 * Get the highest risk threats (critical and high only)
 */
export function getHighestRiskThreats(
  responses: InterviewResponses
): Array<{ threatId: string; name: string; riskLevel: string; inherentRisk: number }> {
  return getPrioritizedThreats(responses).filter(
    t => t.riskLevel === 'critical' || t.riskLevel === 'high'
  );
}

/**
 * Get datacenter-specific industry benchmarks
 */
export function getIndustryBenchmarks(): {
  tierRequirements: Record<number, string[]>;
  complianceBaselines: string[];
  downtimeCosts: string;
  standards: string[];
} {
  return {
    tierRequirements: {
      1: ['Single path for power/cooling', '99.671% uptime', 'Basic security acceptable'],
      2: ['N+1 redundancy', '99.741% uptime', 'Enhanced security expected'],
      3: ['N+1 or 2N redundancy', '99.982% uptime', 'Advanced security required', 'MFA mandatory'],
      4: ['2N or 2(N+1) redundancy', '99.995% uptime', 'Maximum security essential', 'Full biometric'],
    },
    complianceBaselines: [
      'SOC 2 Type II - baseline for enterprise customers',
      'ISO 27001 - demonstrates systematic security management',
      'PCI-DSS - required for payment card data processing',
    ],
    downtimeCosts: 'Average datacenter downtime: $9,000/minute (Uptime Institute)',
    standards: [
      'Uptime Institute Tier Standards',
      'TIA-942 - Telecommunications Infrastructure Standard',
      'NFPA 75/76 - Fire Protection for IT Equipment',
      'ASHRAE - Environmental Guidelines (64.4°F-80.6°F)',
    ],
  };
}

// ============================================================================
// EXPORT FOR ROUTE INTEGRATION
// ============================================================================

export default {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  generateControlRecommendations,
  initializeRiskScenariosFromInterview,
  calculateOverallSecurityScore,
  calculateSingleThreatRisk,
  getPrioritizedThreats,
  getHighestRiskThreats,
  getThreatVulnerabilityBreakdown,
  getIndustryBenchmarks,
  DATACENTER_THREATS,
  THREAT_CONTROL_MAPPING,
  THREAT_QUESTION_MAP,
};
