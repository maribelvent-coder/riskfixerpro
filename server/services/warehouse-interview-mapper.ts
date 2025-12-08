/**
 * Warehouse & Distribution Center Interview Risk Mapper
 * 
 * Implements the T×V×I calculation pipeline per RiskFixer Warehouse Framework.
 * Transforms interview questionnaire responses into mathematically-derived risk scenarios.
 * 
 * KEY FEATURES:
 * - 15 warehouse-specific threats with individual calculation algorithms
 * - Risk factor counting with divisor of 3 for stability
 * - Control recommendations mapped to specific vulnerability gaps
 * - Scenario descriptions with contextual observations
 * - Industry standards integration (TAPA FSR, CargoNet, ISO 28000)
 * 
 * LAYER INTEGRATION:
 * - Layer 1: Facility Data (interview responses)
 * - Layer 2: Methodology Framework (T×V×I formula)
 * - Layer 3: Industry Standards (TAPA, ASIS)
 * - Layer 4: Threat Intelligence (CargoNet statistics)
 * - Layer 5: Control Effectiveness (evidence-based controls)
 * - Layer 6: Scoring Rubrics (risk classification)
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Warehouse-Framework.md
 * @see RiskFixer-Warehouse-Questions-With-Polarity.md
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
  assessmentId: number;
  threatId: number;
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

// ============================================================================
// WAREHOUSE THREAT DEFINITIONS - Layer 4: Threat Intelligence
// ============================================================================

export const WAREHOUSE_THREATS = [
  {
    id: 'cargo_theft_full_truckload',
    name: 'Cargo Theft - Full Truckload',
    category: 'Theft',
    description: 'Theft of entire loaded trailer through fraudulent pickup, hijacking, or facility breach. Average loss $186,779 per CargoNet.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-THF-007',
  },
  {
    id: 'cargo_theft_pilferage',
    name: 'Cargo Theft - Pilferage',
    category: 'Theft',
    description: 'Small-scale theft of individual items or partial shipments, often by employees or dock workers with facility access.',
    typicalLikelihood: 4,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-008',
  },
  {
    id: 'insider_theft_employee_driver_collusion',
    name: 'Insider Theft - Employee/Driver Collusion',
    category: 'Insider Threat',
    description: 'Coordinated theft involving inside information from employees or drivers. FBI estimates 60-80% of cargo theft involves insiders.',
    typicalLikelihood: 3,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-INS-001',
  },
  {
    id: 'loading_dock_breach',
    name: 'Loading Dock Breach',
    category: 'Physical Intrusion',
    description: 'Unauthorized access through loading dock during operations or after hours. 47% of cargo theft occurs at loading docks per CargoNet.',
    typicalLikelihood: 3,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-INT-004',
  },
  {
    id: 'inventory_shrinkage_unknown',
    name: 'Inventory Shrinkage - Unknown Loss',
    category: 'Theft',
    description: 'Unaccounted inventory loss where the cause (theft vs error vs damage) is unknown. Industry average shrinkage is 1-2%.',
    typicalLikelihood: 4,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-009',
  },
  {
    id: 'yard_trailer_theft',
    name: 'Yard/Trailer Theft',
    category: 'Theft',
    description: 'Theft of trailers (loaded or empty) from the yard, often during nights or weekends.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-THF-010',
  },
  {
    id: 'vehicle_fleet_theft',
    name: 'Vehicle/Fleet Theft',
    category: 'Theft',
    description: 'Theft of company vehicles including trucks, forklifts, or other equipment.',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-011',
  },
  {
    id: 'hijacking_in_transit',
    name: 'Hijacking - In-Transit',
    category: 'Robbery',
    description: 'Armed takeover of vehicles and cargo during transit. Rare but catastrophic, average loss exceeds $250K per CargoNet.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-ROB-002',
  },
  {
    id: 'sabotage_equipment_product',
    name: 'Sabotage - Equipment/Product Damage',
    category: 'Sabotage',
    description: 'Intentional damage to equipment, inventory, or product, often by disgruntled employees.',
    typicalLikelihood: 1,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-SAB-002',
  },
  {
    id: 'vandalism',
    name: 'Vandalism - Property Damage',
    category: 'Vandalism',
    description: 'Deliberate destruction or defacement of facility property including fences, buildings, or vehicles.',
    typicalLikelihood: 2,
    typicalImpact: 2,
    asisCode: 'PSC.1-2012-VAN-002',
  },
  {
    id: 'unauthorized_access_facility',
    name: 'Unauthorized Access - Facility Breach',
    category: 'Physical Intrusion',
    description: 'Unauthorized individuals gaining entry to the warehouse through perimeter breach, tailgating, or social engineering.',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-INT-005',
  },
  {
    id: 'workplace_violence',
    name: 'Workplace Violence - Employee Conflict',
    category: 'Workplace Violence',
    description: 'Physical violence, threats, or harassment in the warehouse environment. Higher risk in high-stress logistics operations.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-WPV-002',
  },
  {
    id: 'after_hours_intrusion',
    name: 'After-Hours Intrusion',
    category: 'Burglary',
    description: 'Unauthorized entry to the facility during non-operational hours for theft or other criminal purposes.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-BUR-002',
  },
  {
    id: 'fire_emergency',
    name: 'Fire/Safety Emergency',
    category: 'Life Safety',
    description: 'Fire or other emergency requiring evacuation. High-volume warehouses have elevated fire risk.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-EMG-001',
  },
  {
    id: 'natural_disaster',
    name: 'Natural Disaster Impact',
    category: 'Natural Hazard',
    description: 'Weather events, earthquakes, or other natural disasters affecting facility operations and inventory.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-NAT-001',
  },
];

// ============================================================================
// THREAT-TO-CONTROL MAPPING - Layer 5: Control Effectiveness
// ============================================================================

export const THREAT_CONTROL_MAPPING: Record<string, string[]> = {
  cargo_theft_full_truckload: [
    'dock_cctv_coverage',
    'dock_scheduling_system',
    'trailer_seal_verification',
    'driver_check_in_procedures',
    'guard_house_checkpoint',
    'vehicle_gate_control',
    'gps_fleet_tracking',
    'cargo_theft_response_plan',
    'law_enforcement_partnership',
    'visitor_management',
  ],
  cargo_theft_pilferage: [
    'interior_warehouse_cctv',
    'cycle_counting_program',
    'exception_based_reporting',
    'high_value_caging',
    'two_person_rule',
    'badge_access_system',
    'employee_background_checks',
    'theft_reporting_hotline',
    'real_time_inventory_visibility',
    'video_analytics',
  ],
  insider_theft_employee_driver_collusion: [
    'employee_background_checks',
    'driver_background_checks',
    'insider_threat_program',
    'exception_based_reporting',
    'two_person_rule',
    'theft_reporting_hotline',
    'video_analytics',
    'badge_access_system',
    'driver_check_in_procedures',
    'cycle_counting_program',
  ],
  loading_dock_breach: [
    'dock_cctv_coverage',
    'dock_door_sensors',
    'dock_intrusion_alarm',
    'dock_leveler_locks',
    'dock_access_control',
    'driver_waiting_area',
    'dock_scheduling_system',
    'real_time_monitoring',
    'security_awareness_training',
    'documented_procedures',
  ],
  inventory_shrinkage_unknown: [
    'warehouse_management_system',
    'cycle_counting_program',
    'exception_based_reporting',
    'real_time_inventory_visibility',
    'lot_serial_tracking',
    'interior_warehouse_cctv',
    'video_retention_30_days',
    'video_analytics',
    'two_person_rule',
    'badge_access_system',
  ],
  yard_trailer_theft: [
    'trailer_king_pin_locks',
    'trailer_landing_gear_locks',
    'perimeter_cctv',
    'yard_lighting',
    'yard_management_system',
    'fence_intrusion_detection',
    'security_drills',
    'guard_house_checkpoint',
    'real_time_monitoring',
    'law_enforcement_partnership',
  ],
  vehicle_fleet_theft: [
    'gps_fleet_tracking',
    'vehicle_immobilizers',
    'key_control_system',
    'perimeter_cctv',
    'yard_lighting',
    'vehicle_gate_control',
    'fuel_theft_prevention',
    'vehicle_inspection_procedures',
    'guard_house_checkpoint',
    'alarm_response_procedures',
  ],
  hijacking_in_transit: [
    'gps_fleet_tracking',
    'vehicle_immobilizers',
    'two_driver_rule',
    'driver_background_checks',
    'cargo_theft_response_plan',
    'law_enforcement_partnership',
    'security_awareness_training',
    'driver_check_in_procedures',
    'documented_procedures',
    'security_drills',
  ],
  sabotage_equipment_product: [
    'interior_warehouse_cctv',
    'badge_access_system',
    'employee_background_checks',
    'insider_threat_program',
    'theft_reporting_hotline',
    'security_awareness_training',
    'video_analytics',
    'real_time_monitoring',
    'documented_procedures',
    'security_drills',
  ],
  vandalism: [
    'perimeter_cctv',
    'yard_lighting',
    'fence_intrusion_detection',
    'high_security_fencing',
    'real_time_monitoring',
    'clear_zone_maintenance',
    'guard_house_checkpoint',
    'law_enforcement_partnership',
    'alarm_response_procedures',
    'video_retention_30_days',
  ],
  unauthorized_access_facility: [
    'high_security_fencing',
    'vehicle_gate_control',
    'guard_house_checkpoint',
    'badge_access_system',
    'visitor_management',
    'perimeter_cctv',
    'fence_intrusion_detection',
    'dock_access_control',
    'security_awareness_training',
    'documented_procedures',
  ],
  workplace_violence: [
    'security_awareness_training',
    'theft_reporting_hotline',
    'employee_background_checks',
    'real_time_monitoring',
    'alarm_response_procedures',
    'documented_procedures',
    'law_enforcement_partnership',
    'security_drills',
    'interior_warehouse_cctv',
    'badge_access_system',
  ],
  after_hours_intrusion: [
    'fence_intrusion_detection',
    'dock_intrusion_alarm',
    'perimeter_cctv',
    'yard_lighting',
    'high_security_fencing',
    'real_time_monitoring',
    'alarm_response_procedures',
    'clear_zone_maintenance',
    'key_control_system',
    'law_enforcement_partnership',
  ],
  fire_emergency: [
    'documented_procedures',
    'security_drills',
    'alarm_response_procedures',
    'real_time_monitoring',
    'law_enforcement_partnership',
    'security_awareness_training',
    'interior_warehouse_cctv',
    'key_control_system',
    'badge_access_system',
    'cargo_theft_response_plan',
  ],
  natural_disaster: [
    'documented_procedures',
    'cargo_theft_response_plan',
    'security_drills',
    'alarm_response_procedures',
    'law_enforcement_partnership',
    'gps_fleet_tracking',
    'warehouse_management_system',
    'real_time_inventory_visibility',
    'security_awareness_training',
    'key_control_system',
  ],
};

// ============================================================================
// INCIDENT-TO-THREAT MAPPING
// ============================================================================

const INCIDENT_THREAT_MAP: Record<string, string[]> = {
  'full_truckload_theft': ['cargo_theft_full_truckload', 'insider_theft_employee_driver_collusion'],
  'pilferage': ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
  'employee_theft': ['insider_theft_employee_driver_collusion', 'cargo_theft_pilferage'],
  'trailer_theft': ['yard_trailer_theft', 'cargo_theft_full_truckload'],
  'vehicle_theft': ['vehicle_fleet_theft'],
  'hijacking': ['hijacking_in_transit'],
  'break_in': ['after_hours_intrusion', 'loading_dock_breach'],
  'shrinkage': ['inventory_shrinkage_unknown', 'cargo_theft_pilferage'],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a response string matches a risk indicator (case-insensitive partial match)
 */
function responseMatchesIndicator(response: any, indicator: string): boolean {
  if (typeof response === 'string') {
    return response.toLowerCase().includes(indicator.toLowerCase());
  }
  if (Array.isArray(response)) {
    return response.some(r => 
      typeof r === 'string' && r.toLowerCase().includes(indicator.toLowerCase())
    );
  }
  return false;
}

/**
 * Check if response is a "yes" value
 */
function isYesResponse(response: any): boolean {
  if (typeof response === 'string') {
    return response.toLowerCase() === 'yes';
  }
  if (typeof response === 'boolean') {
    return response === true;
  }
  return false;
}

/**
 * Check if response is a "no" value
 */
function isNoResponse(response: any): boolean {
  if (typeof response === 'string') {
    return response.toLowerCase() === 'no';
  }
  if (typeof response === 'boolean') {
    return response === false;
  }
  return false;
}

/**
 * Check if rating response is at or below a threshold
 */
function isLowRating(response: any, threshold: number = 2): boolean {
  if (typeof response === 'number') {
    return response <= threshold;
  }
  if (typeof response === 'string') {
    const parsed = parseInt(response, 10);
    if (!isNaN(parsed)) {
      return parsed <= threshold;
    }
  }
  return false;
}

/**
 * Classify risk level based on inherent risk score (T × V × I)
 * Scale: 1-125 mapped to Critical/High/Medium/Low
 */
function classifyRiskLevel(inherentRisk: number): 'critical' | 'high' | 'medium' | 'low' {
  // Normalize to 0-100 scale for consistency with RiskFixer UI
  const normalizedScore = (inherentRisk / 125) * 100;
  
  if (normalizedScore >= 75) return 'critical';
  if (normalizedScore >= 50) return 'high';
  if (normalizedScore >= 25) return 'medium';
  return 'low';
}

/**
 * Get the threat definition by ID
 */
function getThreatById(threatId: string) {
  return WAREHOUSE_THREATS.find(t => t.id === threatId);
}

// ============================================================================
// THREAT-TO-QUESTION MAPPING - Links Layer 1 (Facility Data) to Layer 4 (Threats)
// ============================================================================

/**
 * Maps each threat to the specific questions that inform its vulnerability.
 * This is derived from the questionnaire's informsThreat field.
 * Format: threatId -> { questionIds: string[], criticalQuestions: string[] }
 */
export const THREAT_QUESTION_MAP: Record<string, { 
  questionIds: string[]; 
  criticalQuestions: string[];  // riskWeight >= 2
  controlQuestions: string[];   // questions with suggestsControls
}> = {
  cargo_theft_full_truckload: {
    questionIds: ['facility_7', 'incident_1', 'perimeter_4', 'perimeter_6', 'perimeter_8', 'dock_4', 'dock_6', 'dock_8', 'fleet_2'],
    criticalQuestions: ['incident_1', 'perimeter_4', 'perimeter_6', 'perimeter_8', 'dock_4', 'dock_8'],
    controlQuestions: ['perimeter_4', 'perimeter_6', 'perimeter_8', 'dock_4', 'dock_6', 'dock_8', 'fleet_2'],
  },
  cargo_theft_pilferage: {
    questionIds: ['incident_2', 'incident_2a', 'incident_3', 'inventory_2', 'inventory_3', 'inventory_5', 'inventory_6', 'inventory_7', 'surveillance_1'],
    criticalQuestions: ['incident_2a', 'incident_3', 'inventory_2'],
    controlQuestions: ['incident_2a', 'incident_3', 'inventory_2', 'inventory_3', 'inventory_5', 'inventory_6', 'inventory_7', 'surveillance_1'],
  },
  insider_theft_employee_driver_collusion: {
    questionIds: ['incident_1c', 'incident_2', 'incident_4', 'personnel_1', 'personnel_2', 'personnel_5', 'personnel_7', 'personnel_8', 'inventory_6', 'inventory_7'],
    criticalQuestions: ['incident_1c', 'personnel_1'],
    controlQuestions: ['incident_1c', 'personnel_1', 'personnel_2', 'personnel_7', 'personnel_8', 'inventory_6', 'inventory_7'],
  },
  loading_dock_breach: {
    questionIds: ['facility_6', 'facility_7', 'dock_1', 'dock_2', 'dock_3', 'dock_5', 'dock_9', 'dock_10', 'perimeter_4'],
    criticalQuestions: ['dock_2', 'perimeter_4'],
    controlQuestions: ['dock_2', 'dock_3', 'dock_5', 'dock_9', 'dock_10', 'perimeter_4'],
  },
  inventory_shrinkage_unknown: {
    questionIds: ['incident_3', 'inventory_1', 'inventory_1a', 'inventory_2', 'inventory_4', 'inventory_6'],
    criticalQuestions: ['incident_3', 'inventory_2'],
    controlQuestions: ['incident_3', 'inventory_1', 'inventory_1a', 'inventory_2', 'inventory_4', 'inventory_6'],
  },
  yard_trailer_theft: {
    questionIds: ['incident_5', 'perimeter_3', 'perimeter_5', 'perimeter_6', 'perimeter_8'],
    criticalQuestions: ['perimeter_6', 'perimeter_8'],
    controlQuestions: ['incident_5', 'perimeter_3', 'perimeter_5', 'perimeter_6', 'perimeter_8'],
  },
  vehicle_fleet_theft: {
    questionIds: ['incident_6', 'fleet_1', 'fleet_2', 'fleet_3', 'fleet_5', 'perimeter_6'],
    criticalQuestions: ['fleet_2', 'perimeter_6'],
    controlQuestions: ['incident_6', 'fleet_2', 'fleet_3', 'fleet_5'],
  },
  hijacking_in_transit: {
    questionIds: ['incident_7', 'fleet_2', 'fleet_3', 'fleet_4', 'personnel_2'],
    criticalQuestions: ['incident_7', 'fleet_2'],
    controlQuestions: ['fleet_2', 'fleet_3', 'fleet_4', 'personnel_2'],
  },
  sabotage_equipment_product: {
    questionIds: ['personnel_1', 'personnel_6', 'personnel_7', 'personnel_8', 'surveillance_1'],
    criticalQuestions: ['personnel_1'],
    controlQuestions: ['personnel_1', 'personnel_6', 'personnel_7', 'personnel_8'],
  },
  vandalism: {
    questionIds: ['perimeter_1', 'perimeter_2', 'perimeter_5', 'perimeter_6', 'perimeter_7'],
    criticalQuestions: ['perimeter_1', 'perimeter_6'],
    controlQuestions: ['perimeter_1', 'perimeter_5', 'perimeter_6', 'perimeter_7'],
  },
  unauthorized_access_facility: {
    questionIds: ['perimeter_1', 'perimeter_2', 'perimeter_3', 'perimeter_4', 'perimeter_5', 'perimeter_6', 'perimeter_7', 'perimeter_9', 'personnel_3', 'personnel_4'],
    criticalQuestions: ['perimeter_1', 'perimeter_4', 'perimeter_6'],
    controlQuestions: ['perimeter_1', 'perimeter_2', 'perimeter_3', 'perimeter_4', 'perimeter_5', 'perimeter_6', 'perimeter_7', 'personnel_3', 'personnel_4'],
  },
  workplace_violence: {
    questionIds: ['personnel_1', 'personnel_6', 'personnel_7', 'emergency_2', 'emergency_4'],
    criticalQuestions: ['personnel_1'],
    controlQuestions: ['personnel_1', 'personnel_6', 'personnel_7', 'emergency_2', 'emergency_4'],
  },
  after_hours_intrusion: {
    questionIds: ['facility_6', 'perimeter_1', 'perimeter_2', 'perimeter_3', 'perimeter_5', 'perimeter_6', 'perimeter_7', 'dock_10', 'emergency_3', 'emergency_4'],
    criticalQuestions: ['perimeter_1', 'perimeter_6'],
    controlQuestions: ['perimeter_1', 'perimeter_3', 'perimeter_5', 'perimeter_6', 'perimeter_7', 'dock_10', 'emergency_3', 'emergency_4'],
  },
  fire_emergency: {
    questionIds: ['emergency_1', 'emergency_2', 'emergency_4', 'emergency_5'],
    criticalQuestions: [],
    controlQuestions: ['emergency_1', 'emergency_2', 'emergency_4', 'emergency_5'],
  },
  natural_disaster: {
    questionIds: ['emergency_1', 'emergency_2', 'emergency_5', 'emergency_6'],
    criticalQuestions: [],
    controlQuestions: ['emergency_1', 'emergency_2', 'emergency_5', 'emergency_6'],
  },
};

/**
 * Question-level risk weights from questionnaire
 * Maps questionId -> riskWeight for calculating weighted vulnerability
 */
const QUESTION_RISK_WEIGHTS: Record<string, number> = {
  // Incident History (high weights for YES_BAD indicators)
  incident_1: 2, incident_1c: 2, incident_2: 1, incident_2a: 2, incident_3: 2,
  incident_4: 1, incident_5: 1, incident_6: 1, incident_7: 2, incident_8: 1,
  // Perimeter
  perimeter_1: 2, perimeter_2: 1, perimeter_3: 1, perimeter_4: 2, perimeter_5: 1,
  perimeter_6: 2, perimeter_6a: 1, perimeter_7: 1, perimeter_8: 2, perimeter_9: 1,
  // Loading Dock
  dock_1: 0, dock_2: 2, dock_2a: 1, dock_3: 1, dock_4: 2, dock_5: 1,
  dock_6: 1, dock_7: 1, dock_8: 2, dock_9: 1, dock_10: 1,
  // Inventory
  inventory_1: 1, inventory_1a: 1, inventory_2: 2, inventory_3: 2, inventory_3a: 1,
  inventory_4: 1, inventory_5: 1, inventory_6: 1, inventory_7: 1,
  // Personnel
  personnel_1: 2, personnel_2: 1, personnel_3: 1, personnel_4: 1, personnel_5: 1,
  personnel_5a: 1, personnel_6: 1, personnel_7: 1, personnel_8: 1,
  // Fleet
  fleet_1: 0, fleet_2: 2, fleet_3: 1, fleet_4: 1, fleet_5: 1,
  // Surveillance
  surveillance_1: 1, surveillance_1a: 1, surveillance_2: 1, surveillance_3: 1,
  surveillance_4: 1, surveillance_5: 1,
  // Emergency
  emergency_1: 1, emergency_2: 1, emergency_3: 1, emergency_4: 1, emergency_5: 1, emergency_6: 1,
  // Facility (context only)
  facility_1: 0, facility_2: 0, facility_3: 0, facility_4: 0, facility_4a: 0,
  facility_5: 0, facility_6: 0, facility_7: 0,
};

// ============================================================================
// VULNERABILITY CALCULATION - Layer 6: Scoring Rubrics
// ============================================================================

/**
 * Calculate THREAT-SPECIFIC vulnerability score (1-5) based on interview responses
 * 
 * This is the key enhancement: instead of generic vulnerability calculation,
 * we only evaluate questions that specifically inform the given threat.
 * This links Layer 1 (Facility Data) → Layer 4 (Threat Intelligence) properly.
 * 
 * Algorithm:
 * 1. Get questions that inform this specific threat
 * 2. Evaluate each question's response against badAnswers/polarity
 * 3. Weight by riskWeight (0, 1, or 2 points)
 * 4. Apply divisor of 3 for score normalization
 */
export function calculateVulnerabilityFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let vulnerabilityScore = 3; // Start at baseline (moderate)
  let riskFactorCount = 0;
  
  // Get threat-specific questions
  const threatMapping = THREAT_QUESTION_MAP[threatId];
  
  if (threatMapping) {
    // THREAT-SPECIFIC CALCULATION using mapped questions
    riskFactorCount = calculateThreatSpecificRiskFactors(responses, threatId, threatMapping);
  } else {
    // FALLBACK: Generic calculation for unmapped threats
    riskFactorCount = calculateGenericRiskFactors(responses);
  }
  
  // Apply divisor of 3 (each 3 risk factors increases vulnerability by 1)
  vulnerabilityScore = Math.min(5, vulnerabilityScore + Math.floor(riskFactorCount / 3));
  
  return vulnerabilityScore;
}

/**
 * Calculate risk factors for a SPECIFIC threat using its mapped questions
 * Only evaluates questions that informsThreat includes this threatId
 */
function calculateThreatSpecificRiskFactors(
  responses: InterviewResponses,
  threatId: string,
  threatMapping: { questionIds: string[]; criticalQuestions: string[]; controlQuestions: string[] }
): number {
  let riskFactorCount = 0;
  
  for (const questionId of threatMapping.questionIds) {
    const response = responses[questionId];
    const weight = QUESTION_RISK_WEIGHTS[questionId] || 1;
    const isCritical = threatMapping.criticalQuestions.includes(questionId);
    
    // Evaluate response based on question type and add weighted risk factors
    const riskPoints = evaluateQuestionResponse(questionId, response, weight, isCritical);
    riskFactorCount += riskPoints;
  }
  
  return riskFactorCount;
}

/**
 * Evaluate a single question's response and return risk factor points
 * Uses polarity logic from the questionnaire
 */
function evaluateQuestionResponse(
  questionId: string,
  response: any,
  weight: number,
  isCritical: boolean
): number {
  if (response === undefined || response === null) return 0;
  
  let riskPoints = 0;
  
  // =========================================================================
  // YES_BAD Questions (incident indicators - "yes" increases risk)
  // =========================================================================
  const yesBadQuestions = [
    'incident_1', 'incident_2', 'incident_4', 'incident_5', 
    'incident_6', 'incident_7', 'incident_8'
  ];
  
  if (yesBadQuestions.includes(questionId)) {
    if (isYesResponse(response)) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1; // Extra point for critical questions
    }
    return riskPoints;
  }
  
  // =========================================================================
  // YES_GOOD Questions (controls - "no" increases risk)
  // =========================================================================
  const yesGoodQuestions = [
    'perimeter_2', 'perimeter_3', 'perimeter_6', 'perimeter_7',
    'dock_2', 'dock_3', 'dock_6', 'dock_7', 'dock_10',
    'inventory_1', 'inventory_1a', 'inventory_3', 'inventory_4', 'inventory_5', 'inventory_6', 'inventory_7',
    'personnel_2', 'personnel_5', 'personnel_7', 'personnel_8',
    'fleet_2', 'fleet_3', 'fleet_4', 'fleet_5',
    'surveillance_1', 'surveillance_4',
    'emergency_1', 'emergency_2', 'emergency_3', 'emergency_4', 'emergency_6'
  ];
  
  if (yesGoodQuestions.includes(questionId)) {
    if (isNoResponse(response)) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // =========================================================================
  // RATING Questions (score ≤2 is bad)
  // =========================================================================
  const ratingQuestions = ['perimeter_5', 'surveillance_5'];
  
  if (ratingQuestions.includes(questionId)) {
    if (isLowRating(response, 2)) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // =========================================================================
  // MULTIPLE_CHOICE Questions (specific bad answers)
  // =========================================================================
  
  // Perimeter fencing type
  if (questionId === 'perimeter_1') {
    if (responseMatchesIndicator(response, 'no fencing') ||
        responseMatchesIndicator(response, 'other fencing') ||
        responseMatchesIndicator(response, 'without barbed wire')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // Vehicle access control
  if (questionId === 'perimeter_4') {
    if (responseMatchesIndicator(response, 'open access 24/7') ||
        responseMatchesIndicator(response, 'open access during')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // Perimeter CCTV coverage
  if (questionId === 'perimeter_6a') {
    if (responseMatchesIndicator(response, 'under 25%') ||
        responseMatchesIndicator(response, '25-50%')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Trailer security
  if (questionId === 'perimeter_8') {
    if (responseMatchesIndicator(response, 'no specific security')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // Perimeter inspections
  if (questionId === 'perimeter_9') {
    if (responseMatchesIndicator(response, 'rarely') ||
        responseMatchesIndicator(response, 'never')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Dock CCTV coverage
  if (questionId === 'dock_2a') {
    if (isNoResponse(response)) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Seal verification
  if (questionId === 'dock_4') {
    if (responseMatchesIndicator(response, 'informal') ||
        responseMatchesIndicator(response, 'no seal')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // Dock door procedures
  if (questionId === 'dock_5') {
    if (responseMatchesIndicator(response, 'doors may remain') ||
        responseMatchesIndicator(response, 'no formal')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Outbound verification
  if (questionId === 'dock_8') {
    if (responseMatchesIndicator(response, 'informal') ||
        responseMatchesIndicator(response, 'no verification')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // Driver access restrictions
  if (questionId === 'dock_9') {
    if (responseMatchesIndicator(response, 'no restrictions')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Cycle counting
  if (questionId === 'inventory_2') {
    if (responseMatchesIndicator(response, 'only annual') ||
        responseMatchesIndicator(response, 'no formal')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // High-value access
  if (questionId === 'inventory_3a') {
    if (responseMatchesIndicator(response, 'general employee')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Background checks
  if (questionId === 'personnel_1') {
    if (responseMatchesIndicator(response, 'no background')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // Access control system
  if (questionId === 'personnel_3') {
    if (responseMatchesIndicator(response, 'physical keys only') ||
        responseMatchesIndicator(response, 'no formal')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Visitor management
  if (questionId === 'personnel_4') {
    if (responseMatchesIndicator(response, 'informal') ||
        responseMatchesIndicator(response, 'open access')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Security training
  if (questionId === 'personnel_6') {
    if (responseMatchesIndicator(response, 'informal') ||
        responseMatchesIndicator(response, 'no formal')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Interior CCTV coverage
  if (questionId === 'surveillance_1a') {
    if (responseMatchesIndicator(response, 'under 25%')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Video retention
  if (questionId === 'surveillance_2') {
    if (responseMatchesIndicator(response, 'less than 7 days') ||
        responseMatchesIndicator(response, '7-14 days')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Footage review
  if (questionId === 'surveillance_3') {
    if (responseMatchesIndicator(response, 'rarely reviewed')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Security drills
  if (questionId === 'emergency_5') {
    if (responseMatchesIndicator(response, 'rarely') ||
        responseMatchesIndicator(response, 'never')) {
      riskPoints = weight;
    }
    return riskPoints;
  }
  
  // Shrinkage rate
  if (questionId === 'incident_3') {
    if (responseMatchesIndicator(response, '2% - 3%') ||
        responseMatchesIndicator(response, 'over 3%') ||
        responseMatchesIndicator(response, 'unknown')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // Insider involvement (follow-up)
  if (questionId === 'incident_1c') {
    if (responseMatchesIndicator(response, 'confirmed insider') ||
        responseMatchesIndicator(response, 'suspected insider')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  // Pilferage frequency (follow-up)
  if (questionId === 'incident_2a') {
    if (responseMatchesIndicator(response, 'frequently') ||
        responseMatchesIndicator(response, 'constantly')) {
      riskPoints = weight;
      if (isCritical) riskPoints += 1;
    }
    return riskPoints;
  }
  
  return riskPoints;
}

/**
 * FALLBACK: Generic risk factor calculation for unmapped threats
 * This ensures backward compatibility and covers edge cases
 */
function calculateGenericRiskFactors(responses: InterviewResponses): number {
  let riskFactorCount = 0;

  // =========================================================================
  // PERIMETER & YARD SECURITY ANALYSIS
  // =========================================================================
  
  // Weak perimeter fencing - CRITICAL for cargo theft
  if (responseMatchesIndicator(responses.perimeter_1, 'without barbed wire') ||
      responseMatchesIndicator(responses.perimeter_1, 'other fencing') ||
      responseMatchesIndicator(responses.perimeter_1, 'no fencing')) {
    riskFactorCount += 2;
  }
  
  // Fence in poor condition
  if (isNoResponse(responses.perimeter_2)) {
    riskFactorCount += 1;
  }
  
  // No perimeter intrusion detection
  if (isNoResponse(responses.perimeter_3)) {
    riskFactorCount += 1;
  }
  
  // Weak vehicle access control - CRITICAL
  if (responseMatchesIndicator(responses.perimeter_4, 'open access 24/7') ||
      responseMatchesIndicator(responses.perimeter_4, 'open access during')) {
    riskFactorCount += 2;
  }
  
  // Poor perimeter/yard lighting
  if (isLowRating(responses.perimeter_5)) {
    riskFactorCount += 1;
  }
  
  // No perimeter/yard CCTV
  if (isNoResponse(responses.perimeter_6)) {
    riskFactorCount += 2;
  }
  
  // Poor CCTV coverage
  if (responseMatchesIndicator(responses.perimeter_6a, 'under 25%') ||
      responseMatchesIndicator(responses.perimeter_6a, '25-50%')) {
    riskFactorCount += 1;
  }
  
  // No clear zone around perimeter
  if (isNoResponse(responses.perimeter_7)) {
    riskFactorCount += 1;
  }
  
  // Weak trailer security in yard
  if (responseMatchesIndicator(responses.perimeter_8, 'no specific security')) {
    riskFactorCount += 2;
  }
  
  // Rare/no perimeter inspections
  if (responseMatchesIndicator(responses.perimeter_9, 'rarely') ||
      responseMatchesIndicator(responses.perimeter_9, 'never')) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // LOADING DOCK SECURITY ANALYSIS
  // =========================================================================
  
  // No loading dock CCTV - CRITICAL (47% of theft at docks)
  if (isNoResponse(responses.dock_2)) {
    riskFactorCount += 2;
  }
  
  // Cameras can't see inside trailers
  if (isNoResponse(responses.dock_2a)) {
    riskFactorCount += 1;
  }
  
  // No dock door sensors
  if (isNoResponse(responses.dock_3)) {
    riskFactorCount += 1;
  }
  
  // Weak seal verification - CRITICAL for fictitious pickup
  if (responseMatchesIndicator(responses.dock_4, 'informal') ||
      responseMatchesIndicator(responses.dock_4, 'no seal')) {
    riskFactorCount += 2;
  }
  
  // Weak dock door procedures
  if (responseMatchesIndicator(responses.dock_5, 'doors may remain') ||
      responseMatchesIndicator(responses.dock_5, 'no formal')) {
    riskFactorCount += 1;
  }
  
  // No dock scheduling
  if (isNoResponse(responses.dock_6)) {
    riskFactorCount += 1;
  }
  
  // Dock levelers not secured
  if (isNoResponse(responses.dock_7)) {
    riskFactorCount += 1;
  }
  
  // Weak outbound verification - CRITICAL
  if (responseMatchesIndicator(responses.dock_8, 'informal') ||
      responseMatchesIndicator(responses.dock_8, 'no verification')) {
    riskFactorCount += 2;
  }
  
  // Drivers can enter warehouse
  if (responseMatchesIndicator(responses.dock_9, 'no restrictions')) {
    riskFactorCount += 1;
  }
  
  // No dock intrusion alarm
  if (isNoResponse(responses.dock_10)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // INVENTORY CONTROL ANALYSIS
  // =========================================================================
  
  // No WMS system
  if (isNoResponse(responses.inventory_1)) {
    riskFactorCount += 1;
  }
  
  // No real-time inventory visibility
  if (isNoResponse(responses.inventory_1a)) {
    riskFactorCount += 1;
  }
  
  // Weak cycle counting - CRITICAL
  if (responseMatchesIndicator(responses.inventory_2, 'only annual') ||
      responseMatchesIndicator(responses.inventory_2, 'no formal')) {
    riskFactorCount += 2;
  }
  
  // No high-value caging - CRITICAL
  if (isNoResponse(responses.inventory_3)) {
    riskFactorCount += 2;
  }
  
  // General employee access to high-value
  if (responseMatchesIndicator(responses.inventory_3a, 'general employee')) {
    riskFactorCount += 1;
  }
  
  // No lot/serial tracking
  if (isNoResponse(responses.inventory_4)) {
    riskFactorCount += 1;
  }
  
  // No high-value area CCTV
  if (isNoResponse(responses.inventory_5)) {
    riskFactorCount += 1;
  }
  
  // No exception-based reporting
  if (isNoResponse(responses.inventory_6)) {
    riskFactorCount += 1;
  }
  
  // No two-person rule
  if (isNoResponse(responses.inventory_7)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // PERSONNEL & ACCESS CONTROL ANALYSIS
  // =========================================================================
  
  // No background checks - CRITICAL for insider threat
  if (responseMatchesIndicator(responses.personnel_1, 'no background')) {
    riskFactorCount += 2;
  }
  
  // No driver background checks
  if (isNoResponse(responses.personnel_2)) {
    riskFactorCount += 1;
  }
  
  // Weak access control system
  if (responseMatchesIndicator(responses.personnel_3, 'physical keys only') ||
      responseMatchesIndicator(responses.personnel_3, 'no formal')) {
    riskFactorCount += 1;
  }
  
  // Weak visitor management
  if (responseMatchesIndicator(responses.personnel_4, 'informal') ||
      responseMatchesIndicator(responses.personnel_4, 'open access')) {
    riskFactorCount += 1;
  }
  
  // No driver check-in procedure
  if (isNoResponse(responses.personnel_5)) {
    riskFactorCount += 1;
  }
  
  // Weak security training
  if (responseMatchesIndicator(responses.personnel_6, 'informal') ||
      responseMatchesIndicator(responses.personnel_6, 'no formal')) {
    riskFactorCount += 1;
  }
  
  // No theft reporting hotline
  if (isNoResponse(responses.personnel_7)) {
    riskFactorCount += 1;
  }
  
  // No insider threat program
  if (isNoResponse(responses.personnel_8)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // VEHICLE & FLEET SECURITY ANALYSIS
  // =========================================================================
  
  // No GPS tracking - CRITICAL for hijacking/theft response
  if (isNoResponse(responses.fleet_2)) {
    riskFactorCount += 2;
  }
  
  // No vehicle immobilizers
  if (isNoResponse(responses.fleet_3)) {
    riskFactorCount += 1;
  }
  
  // No two-driver rule for high-value
  if (isNoResponse(responses.fleet_4)) {
    riskFactorCount += 1;
  }
  
  // No fuel theft prevention
  if (isNoResponse(responses.fleet_5)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // SURVEILLANCE & MONITORING ANALYSIS
  // =========================================================================
  
  // No interior warehouse CCTV
  if (isNoResponse(responses.surveillance_1)) {
    riskFactorCount += 1;
  }
  
  // Poor interior coverage
  if (responseMatchesIndicator(responses.surveillance_1a, 'under 25%')) {
    riskFactorCount += 1;
  }
  
  // Short video retention
  if (responseMatchesIndicator(responses.surveillance_2, 'less than 7 days') ||
      responseMatchesIndicator(responses.surveillance_2, '7-14 days')) {
    riskFactorCount += 1;
  }
  
  // Footage rarely reviewed
  if (responseMatchesIndicator(responses.surveillance_3, 'rarely reviewed')) {
    riskFactorCount += 1;
  }
  
  // No video analytics
  if (isNoResponse(responses.surveillance_4)) {
    riskFactorCount += 1;
  }
  
  // Poor CCTV quality rating
  if (isLowRating(responses.surveillance_5)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // EMERGENCY RESPONSE ANALYSIS
  // =========================================================================
  
  // No cargo theft response plan
  if (isNoResponse(responses.emergency_1)) {
    riskFactorCount += 1;
  }
  
  // No documented procedures
  if (isNoResponse(responses.emergency_2)) {
    riskFactorCount += 1;
  }
  
  // No key control system
  if (isNoResponse(responses.emergency_3)) {
    riskFactorCount += 1;
  }
  
  // No alarm response procedures
  if (isNoResponse(responses.emergency_4)) {
    riskFactorCount += 1;
  }
  
  // Rare/no security drills
  if (responseMatchesIndicator(responses.emergency_5, 'rarely') ||
      responseMatchesIndicator(responses.emergency_5, 'never')) {
    riskFactorCount += 1;
  }
  
  // No law enforcement relationship
  if (isNoResponse(responses.emergency_6)) {
    riskFactorCount += 1;
  }

  // Return the raw risk factor count (caller will apply divisor of 3)
  return riskFactorCount;
}

// ============================================================================
// THREAT LIKELIHOOD CALCULATION
// ============================================================================

/**
 * Calculate threat likelihood (1-5) based on interview responses
 * Higher score = more likely to occur
 */
export function calculateThreatLikelihoodFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  const threat = getThreatById(threatId);
  let likelihood = threat?.typicalLikelihood || 2; // Start with typical baseline

  // =========================================================================
  // FACTOR 1: INCIDENT HISTORY (most important)
  // =========================================================================
  
  // Full truckload theft history - MAJOR INDICATOR
  if (isYesResponse(responses.incident_1)) {
    if (threatId === 'cargo_theft_full_truckload') {
      likelihood += 2;
    }
    if (threatId === 'insider_theft_employee_driver_collusion') {
      // Check for insider involvement
      if (responseMatchesIndicator(responses.incident_1c, 'confirmed insider') ||
          responseMatchesIndicator(responses.incident_1c, 'suspected insider')) {
        likelihood += 2;
      } else {
        likelihood += 1;
      }
    }
  }
  
  // Pilferage history
  if (isYesResponse(responses.incident_2)) {
    if (threatId === 'cargo_theft_pilferage' || threatId === 'insider_theft_employee_driver_collusion') {
      likelihood += 1;
    }
    // Frequent pilferage is more concerning
    if (responseMatchesIndicator(responses.incident_2a, 'frequently') ||
        responseMatchesIndicator(responses.incident_2a, 'constantly')) {
      likelihood += 1;
    }
  }
  
  // High shrinkage rate - indicates ongoing theft
  if (responseMatchesIndicator(responses.incident_3, '2% - 3%') ||
      responseMatchesIndicator(responses.incident_3, 'over 3%') ||
      responseMatchesIndicator(responses.incident_3, 'unknown')) {
    if (threatId === 'inventory_shrinkage_unknown' || threatId === 'cargo_theft_pilferage') {
      likelihood += 2;
    }
    if (threatId === 'insider_theft_employee_driver_collusion') {
      likelihood += 1;
    }
  }
  
  // Employee theft history
  if (isYesResponse(responses.incident_4)) {
    if (threatId === 'insider_theft_employee_driver_collusion') {
      likelihood += 2;
    }
    if (threatId === 'cargo_theft_pilferage') {
      likelihood += 1;
    }
  }
  
  // Trailer theft history
  if (isYesResponse(responses.incident_5)) {
    if (threatId === 'yard_trailer_theft') {
      likelihood += 2;
    }
  }
  
  // Vehicle theft history
  if (isYesResponse(responses.incident_6)) {
    if (threatId === 'vehicle_fleet_theft') {
      likelihood += 2;
    }
  }
  
  // Hijacking history - RARE but significant indicator
  if (isYesResponse(responses.incident_7)) {
    if (threatId === 'hijacking_in_transit') {
      likelihood += 2;
    }
    // Also increases full truckload theft likelihood
    if (threatId === 'cargo_theft_full_truckload') {
      likelihood += 1;
    }
  }
  
  // Area cargo theft activity - environmental threat indicator
  if (isYesResponse(responses.incident_8)) {
    if (threatId === 'cargo_theft_full_truckload' || 
        threatId === 'yard_trailer_theft' ||
        threatId === 'after_hours_intrusion') {
      likelihood += 1;
    }
  }

  // =========================================================================
  // FACTOR 2: FACILITY PROFILE & EXPOSURE
  // =========================================================================
  
  // High-value goods stored - major theft target
  if (isYesResponse(responses.facility_4)) {
    if (threatId === 'cargo_theft_full_truckload' || 
        threatId === 'hijacking_in_transit' ||
        threatId === 'insider_theft_employee_driver_collusion') {
      likelihood += 1;
    }
    
    // Check for most targeted product categories
    if (responseMatchesIndicator(responses.facility_4a, 'electronics') ||
        responseMatchesIndicator(responses.facility_4a, 'pharmaceuticals') ||
        responseMatchesIndicator(responses.facility_4a, 'alcohol')) {
      likelihood += 1; // Additional increase for high-target products
    }
  }
  
  // High inventory value
  if (responseMatchesIndicator(responses.facility_3, 'over $50 million') ||
      responseMatchesIndicator(responses.facility_3, '$25 million - $50 million')) {
    if (threatId === 'cargo_theft_full_truckload' || threatId === 'after_hours_intrusion') {
      likelihood += 1;
    }
  }
  
  // 3PL/multi-client operations - higher insider complexity
  if (responseMatchesIndicator(responses.facility_1, '3pl') ||
      responseMatchesIndicator(responses.facility_1, 'multi-client')) {
    if (threatId === 'insider_theft_employee_driver_collusion') {
      likelihood += 1;
    }
  }
  
  // Large workforce - harder to monitor
  if (responseMatchesIndicator(responses.facility_5, 'over 500') ||
      responseMatchesIndicator(responses.facility_5, '251-500')) {
    if (threatId === 'insider_theft_employee_driver_collusion' || 
        threatId === 'cargo_theft_pilferage') {
      likelihood += 1;
    }
  }
  
  // High truck volume - more opportunity for fraudulent pickup
  if (responseMatchesIndicator(responses.facility_7, 'over 100') ||
      responseMatchesIndicator(responses.facility_7, '51-100')) {
    if (threatId === 'cargo_theft_full_truckload' || threatId === 'loading_dock_breach') {
      likelihood += 1;
    }
  }
  
  // Extended/night operations
  if (responseMatchesIndicator(responses.facility_6, 'two shifts') ||
      responseMatchesIndicator(responses.facility_6, '24/7')) {
    if (threatId === 'loading_dock_breach' || threatId === 'insider_theft_employee_driver_collusion') {
      likelihood += 1;
    }
    // But reduces after-hours intrusion risk (people present)
    if (threatId === 'after_hours_intrusion') {
      likelihood -= 1;
    }
  }

  // =========================================================================
  // FACTOR 3: PHYSICAL CONFIGURATION
  // =========================================================================
  
  // Weak perimeter increases multiple threats
  if (responseMatchesIndicator(responses.perimeter_1, 'no fencing') ||
      responseMatchesIndicator(responses.perimeter_1, 'other fencing')) {
    if (threatId === 'unauthorized_access_facility' || threatId === 'yard_trailer_theft') {
      likelihood += 1;
    }
  }
  
  // Open vehicle access
  if (responseMatchesIndicator(responses.perimeter_4, 'open access 24/7')) {
    if (threatId === 'cargo_theft_full_truckload' || threatId === 'unauthorized_access_facility') {
      likelihood += 1;
    }
  }
  
  // Large facility = more vulnerability points
  if (responseMatchesIndicator(responses.facility_2, 'over 1,000,000') ||
      responseMatchesIndicator(responses.facility_2, '500,000 - 1,000,000')) {
    if (threatId === 'after_hours_intrusion' || threatId === 'loading_dock_breach') {
      likelihood += 1;
    }
  }

  // Cap at 5
  return Math.max(1, Math.min(5, likelihood));
}

// ============================================================================
// IMPACT CALCULATION
// ============================================================================

/**
 * Calculate impact score (1-5) based on interview responses
 * Higher score = more severe consequences
 */
export function calculateImpactFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let impact = 3; // Baseline moderate impact

  // =========================================================================
  // FACTOR 1: INVENTORY VALUE
  // =========================================================================
  
  const inventoryValue = responses.facility_3 || '';
  if (responseMatchesIndicator(inventoryValue, 'over $50 million')) {
    impact += 2;
  } else if (responseMatchesIndicator(inventoryValue, '$25 million - $50 million')) {
    impact += 2;
  } else if (responseMatchesIndicator(inventoryValue, '$10 million - $25 million')) {
    impact += 1;
  } else if (responseMatchesIndicator(inventoryValue, '$5 million - $10 million')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 2: HIGH-VALUE GOODS
  // =========================================================================
  
  if (isYesResponse(responses.facility_4)) {
    // High-value goods increase theft impact
    impact += 1;
    
    // Electronics and pharmaceuticals have highest per-unit value
    if (responseMatchesIndicator(responses.facility_4a, 'electronics') ||
        responseMatchesIndicator(responses.facility_4a, 'pharmaceuticals')) {
      impact += 1;
    }
  }

  // =========================================================================
  // FACTOR 3: EMPLOYEE COUNT (operational impact)
  // =========================================================================
  
  const employeeResponse = responses.facility_5 || '';
  if (responseMatchesIndicator(employeeResponse, 'over 500')) {
    impact += 1;
  } else if (responseMatchesIndicator(employeeResponse, '251-500')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 4: WAREHOUSE TYPE (business criticality)
  // =========================================================================
  
  const warehouseType = responses.facility_1 || '';
  
  // 3PL impacts multiple clients
  if (responseMatchesIndicator(warehouseType, '3pl') ||
      responseMatchesIndicator(warehouseType, 'multi-client')) {
    impact += 1;
  }
  
  // E-commerce fulfillment - time-critical
  if (responseMatchesIndicator(warehouseType, 'e-commerce') ||
      responseMatchesIndicator(warehouseType, 'fulfillment')) {
    impact += 1;
  }
  
  // Cold storage - product spoilage risk
  if (responseMatchesIndicator(warehouseType, 'cold storage') ||
      responseMatchesIndicator(warehouseType, 'refrigerated')) {
    impact += 1;
  }
  
  // Bonded warehouse - regulatory impact
  if (responseMatchesIndicator(warehouseType, 'bonded')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 5: HISTORICAL LOSS DATA
  // =========================================================================
  
  // Large historical losses indicate high impact potential
  if (responseMatchesIndicator(responses.incident_1b, 'over $500k')) {
    impact += 1;
  }

  // =========================================================================
  // THREAT-SPECIFIC IMPACT OVERRIDES
  // =========================================================================
  
  // Hijacking - Always maximum impact (life safety + cargo)
  if (threatId === 'hijacking_in_transit') {
    impact = 5;
  }
  
  // Full truckload theft - Severe business impact
  if (threatId === 'cargo_theft_full_truckload') {
    impact = Math.max(impact, 4);
  }
  
  // Fire emergency - Life safety
  if (threatId === 'fire_emergency') {
    impact = 5;
  }
  
  // Natural disaster - Catastrophic potential
  if (threatId === 'natural_disaster') {
    impact = 5;
  }
  
  // Workplace violence - Life safety
  if (threatId === 'workplace_violence') {
    impact = Math.max(impact, 4);
  }
  
  // Insider collusion - Major operational impact
  if (threatId === 'insider_theft_employee_driver_collusion') {
    impact = Math.max(impact, 4);
  }

  // Cap at 5
  return Math.min(5, impact);
}

// ============================================================================
// CONTROL RECOMMENDATION ENGINE
// ============================================================================

/**
 * Generate control recommendations based on interview responses
 */
export function generateControlRecommendations(
  responses: InterviewResponses,
  threatId?: string
): string[] {
  const recommendations = new Set<string>();

  // =========================================================================
  // PERIMETER & YARD SECURITY CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.perimeter_1, 'no fencing') ||
      responseMatchesIndicator(responses.perimeter_1, 'other fencing') ||
      responseMatchesIndicator(responses.perimeter_1, 'without barbed wire')) {
    recommendations.add('high_security_fencing');
  }
  
  if (isNoResponse(responses.perimeter_2)) {
    recommendations.add('clear_zone_maintenance');
  }
  
  if (isNoResponse(responses.perimeter_3)) {
    recommendations.add('fence_intrusion_detection');
  }
  
  if (responseMatchesIndicator(responses.perimeter_4, 'open access')) {
    recommendations.add('guard_house_checkpoint');
    recommendations.add('vehicle_gate_control');
  }
  
  if (isLowRating(responses.perimeter_5)) {
    recommendations.add('yard_lighting');
  }
  
  if (isNoResponse(responses.perimeter_6)) {
    recommendations.add('perimeter_cctv');
  }
  
  if (isNoResponse(responses.perimeter_7)) {
    recommendations.add('clear_zone_maintenance');
  }
  
  if (responseMatchesIndicator(responses.perimeter_8, 'no specific security')) {
    recommendations.add('trailer_king_pin_locks');
    recommendations.add('trailer_landing_gear_locks');
    recommendations.add('yard_management_system');
  }

  // =========================================================================
  // LOADING DOCK CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.dock_2)) {
    recommendations.add('dock_cctv_coverage');
  }
  
  if (isNoResponse(responses.dock_3)) {
    recommendations.add('dock_door_sensors');
  }
  
  if (responseMatchesIndicator(responses.dock_4, 'informal') ||
      responseMatchesIndicator(responses.dock_4, 'no seal')) {
    recommendations.add('trailer_seal_verification');
  }
  
  if (responseMatchesIndicator(responses.dock_5, 'no formal')) {
    recommendations.add('dock_leveler_locks');
    recommendations.add('documented_procedures');
  }
  
  if (isNoResponse(responses.dock_6)) {
    recommendations.add('dock_scheduling_system');
  }
  
  if (isNoResponse(responses.dock_7)) {
    recommendations.add('dock_leveler_locks');
  }
  
  if (responseMatchesIndicator(responses.dock_8, 'informal') ||
      responseMatchesIndicator(responses.dock_8, 'no verification')) {
    recommendations.add('documented_procedures');
  }
  
  if (responseMatchesIndicator(responses.dock_9, 'no restrictions')) {
    recommendations.add('driver_waiting_area');
    recommendations.add('dock_access_control');
  }
  
  if (isNoResponse(responses.dock_10)) {
    recommendations.add('dock_intrusion_alarm');
  }

  // =========================================================================
  // INVENTORY CONTROL CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.inventory_1)) {
    recommendations.add('warehouse_management_system');
  }
  
  if (isNoResponse(responses.inventory_1a)) {
    recommendations.add('real_time_inventory_visibility');
  }
  
  if (responseMatchesIndicator(responses.inventory_2, 'only annual') ||
      responseMatchesIndicator(responses.inventory_2, 'no formal')) {
    recommendations.add('cycle_counting_program');
  }
  
  if (isNoResponse(responses.inventory_3)) {
    recommendations.add('high_value_caging');
  }
  
  if (responseMatchesIndicator(responses.inventory_3a, 'general employee')) {
    recommendations.add('badge_access_system');
  }
  
  if (isNoResponse(responses.inventory_4)) {
    recommendations.add('lot_serial_tracking');
  }
  
  if (isNoResponse(responses.inventory_5)) {
    recommendations.add('high_value_area_cameras');
  }
  
  if (isNoResponse(responses.inventory_6)) {
    recommendations.add('exception_based_reporting');
  }
  
  if (isNoResponse(responses.inventory_7)) {
    recommendations.add('two_person_rule');
  }

  // =========================================================================
  // PERSONNEL & ACCESS CONTROL CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.personnel_1, 'no background')) {
    recommendations.add('employee_background_checks');
  }
  
  if (isNoResponse(responses.personnel_2)) {
    recommendations.add('driver_background_checks');
  }
  
  if (responseMatchesIndicator(responses.personnel_3, 'physical keys only') ||
      responseMatchesIndicator(responses.personnel_3, 'no formal')) {
    recommendations.add('badge_access_system');
  }
  
  if (responseMatchesIndicator(responses.personnel_4, 'informal') ||
      responseMatchesIndicator(responses.personnel_4, 'open access')) {
    recommendations.add('visitor_management');
  }
  
  if (isNoResponse(responses.personnel_5)) {
    recommendations.add('driver_check_in_procedures');
  }
  
  if (responseMatchesIndicator(responses.personnel_6, 'informal') ||
      responseMatchesIndicator(responses.personnel_6, 'no formal')) {
    recommendations.add('security_awareness_training');
  }
  
  if (isNoResponse(responses.personnel_7)) {
    recommendations.add('theft_reporting_hotline');
  }
  
  if (isNoResponse(responses.personnel_8)) {
    recommendations.add('insider_threat_program');
  }

  // =========================================================================
  // VEHICLE & FLEET CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.fleet_2)) {
    recommendations.add('gps_fleet_tracking');
  }
  
  if (isNoResponse(responses.fleet_3)) {
    recommendations.add('vehicle_immobilizers');
  }
  
  if (isNoResponse(responses.fleet_4)) {
    recommendations.add('two_driver_rule');
  }
  
  if (isNoResponse(responses.fleet_5)) {
    recommendations.add('fuel_theft_prevention');
  }

  // =========================================================================
  // SURVEILLANCE CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.surveillance_1)) {
    recommendations.add('interior_warehouse_cctv');
  }
  
  if (responseMatchesIndicator(responses.surveillance_2, 'less than 7 days') ||
      responseMatchesIndicator(responses.surveillance_2, '7-14 days')) {
    recommendations.add('video_retention_30_days');
  }
  
  if (responseMatchesIndicator(responses.surveillance_3, 'rarely reviewed')) {
    recommendations.add('real_time_monitoring');
  }
  
  if (isNoResponse(responses.surveillance_4)) {
    recommendations.add('video_analytics');
  }

  // =========================================================================
  // EMERGENCY RESPONSE CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.emergency_1)) {
    recommendations.add('cargo_theft_response_plan');
  }
  
  if (isNoResponse(responses.emergency_2)) {
    recommendations.add('documented_procedures');
  }
  
  if (isNoResponse(responses.emergency_3)) {
    recommendations.add('key_control_system');
  }
  
  if (isNoResponse(responses.emergency_4)) {
    recommendations.add('alarm_response_procedures');
  }
  
  if (responseMatchesIndicator(responses.emergency_5, 'rarely') ||
      responseMatchesIndicator(responses.emergency_5, 'never')) {
    recommendations.add('security_drills');
  }
  
  if (isNoResponse(responses.emergency_6)) {
    recommendations.add('law_enforcement_partnership');
  }

  // =========================================================================
  // THREAT-SPECIFIC RECOMMENDATIONS
  // =========================================================================
  
  if (threatId && THREAT_CONTROL_MAPPING[threatId]) {
    THREAT_CONTROL_MAPPING[threatId].forEach(c => recommendations.add(c));
  }

  return Array.from(recommendations);
}

// ============================================================================
// SCENARIO DESCRIPTION GENERATOR
// ============================================================================

/**
 * Generate a human-readable scenario description from interview context
 */
function generateScenarioDescription(
  threat: typeof WAREHOUSE_THREATS[0],
  responses: InterviewResponses,
  threatLikelihood: number,
  vulnerability: number,
  impact: number
): string {
  const likelihoodTerms: Record<number, string> = {
    1: 'rare',
    2: 'unlikely but possible',
    3: 'moderately likely',
    4: 'likely',
    5: 'highly likely',
  };
  
  const vulnerabilityTerms: Record<number, string> = {
    1: 'well-protected',
    2: 'adequately protected',
    3: 'moderately vulnerable',
    4: 'significantly vulnerable',
    5: 'highly vulnerable',
  };
  
  const impactTerms: Record<number, string> = {
    1: 'minimal',
    2: 'minor',
    3: 'moderate',
    4: 'significant',
    5: 'severe/catastrophic',
  };

  // Build context-specific observations
  const observations: string[] = [];
  
  // Cargo Theft - Full Truckload observations
  if (threat.id === 'cargo_theft_full_truckload') {
    if (responseMatchesIndicator(responses.dock_4, 'no seal')) {
      observations.push('no trailer seal verification');
    }
    if (responseMatchesIndicator(responses.dock_8, 'no verification')) {
      observations.push('no outbound load verification');
    }
    if (isYesResponse(responses.incident_1)) {
      observations.push('history of full truckload theft');
    }
    if (isYesResponse(responses.facility_4)) {
      observations.push('stores high-value theft-target goods');
    }
  }
  
  // Cargo Theft - Pilferage observations
  if (threat.id === 'cargo_theft_pilferage') {
    if (responseMatchesIndicator(responses.inventory_2, 'no formal')) {
      observations.push('no formal cycle counting');
    }
    if (isNoResponse(responses.inventory_6)) {
      observations.push('no exception-based reporting');
    }
    if (isYesResponse(responses.incident_2)) {
      observations.push('history of pilferage incidents');
    }
    if (responseMatchesIndicator(responses.incident_3, 'over 3%')) {
      observations.push('shrinkage rate above industry average');
    }
  }
  
  // Insider Theft observations
  if (threat.id === 'insider_theft_employee_driver_collusion') {
    if (responseMatchesIndicator(responses.personnel_1, 'no background')) {
      observations.push('no employee background checks');
    }
    if (isNoResponse(responses.personnel_8)) {
      observations.push('no insider threat program');
    }
    if (isYesResponse(responses.incident_4)) {
      observations.push('history of employee theft');
    }
    if (responseMatchesIndicator(responses.incident_1c, 'insider')) {
      observations.push('prior theft involved insider');
    }
  }
  
  // Loading Dock Breach observations
  if (threat.id === 'loading_dock_breach') {
    if (isNoResponse(responses.dock_2)) {
      observations.push('no dock CCTV coverage');
    }
    if (isNoResponse(responses.dock_10)) {
      observations.push('no dock intrusion alarm');
    }
    if (responseMatchesIndicator(responses.dock_9, 'no restrictions')) {
      observations.push('drivers have unrestricted warehouse access');
    }
  }
  
  // Yard/Trailer Theft observations
  if (threat.id === 'yard_trailer_theft') {
    if (responseMatchesIndicator(responses.perimeter_8, 'no specific security')) {
      observations.push('no trailer security measures');
    }
    if (isNoResponse(responses.perimeter_6)) {
      observations.push('no yard CCTV coverage');
    }
    if (isYesResponse(responses.incident_5)) {
      observations.push('history of trailer theft');
    }
  }
  
  // Hijacking observations
  if (threat.id === 'hijacking_in_transit') {
    if (isNoResponse(responses.fleet_2)) {
      observations.push('no GPS tracking on fleet');
    }
    if (isNoResponse(responses.fleet_4)) {
      observations.push('no two-driver rule for high-value');
    }
    if (isYesResponse(responses.incident_7)) {
      observations.push('history of hijacking incidents');
    }
  }
  
  // After-Hours Intrusion observations
  if (threat.id === 'after_hours_intrusion') {
    if (isNoResponse(responses.perimeter_3)) {
      observations.push('no perimeter intrusion detection');
    }
    if (isLowRating(responses.perimeter_5)) {
      observations.push('inadequate yard lighting');
    }
    if (responseMatchesIndicator(responses.perimeter_1, 'no fencing')) {
      observations.push('no perimeter fencing');
    }
  }
  
  // Unauthorized Access observations
  if (threat.id === 'unauthorized_access_facility') {
    if (responseMatchesIndicator(responses.perimeter_4, 'open access')) {
      observations.push('open vehicle access to property');
    }
    if (responseMatchesIndicator(responses.personnel_4, 'open access')) {
      observations.push('weak visitor management');
    }
  }
  
  // Workplace Violence observations
  if (threat.id === 'workplace_violence') {
    if (responseMatchesIndicator(responses.personnel_6, 'no formal')) {
      observations.push('no security awareness training');
    }
    if (isNoResponse(responses.personnel_7)) {
      observations.push('no anonymous reporting mechanism');
    }
  }

  const observationText = observations.length > 0 
    ? ` Key findings: ${observations.join('; ')}.`
    : '';

  return `${threat.name} scenario assessed as ${likelihoodTerms[threatLikelihood]} to occur. ` +
         `The facility is ${vulnerabilityTerms[vulnerability]} against this threat, with ` +
         `${impactTerms[impact]} potential impact.${observationText}`;
}

// ============================================================================
// MAIN RISK SCENARIO GENERATION FUNCTION
// ============================================================================

/**
 * Initialize risk scenarios from completed interview
 * This is the main entry point called after interview completion
 */
export async function initializeRiskScenariosFromInterview(
  assessmentId: number,
  interviewResponses: InterviewResponses
): Promise<GeneratedScenarioResult> {
  
  const generatedScenarios: NewRiskScenario[] = [];
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  // Process each threat in the Warehouse threat library
  for (const threat of WAREHOUSE_THREATS) {
    
    // Calculate T×V×I from interview
    const threatLikelihood = calculateThreatLikelihoodFromInterview(
      interviewResponses,
      threat.id
    );
    
    const vulnerability = calculateVulnerabilityFromInterview(
      interviewResponses,
      threat.id
    );
    
    const impact = calculateImpactFromInterview(
      interviewResponses,
      threat.id
    );
    
    // Calculate inherent risk
    const inherentRisk = threatLikelihood * vulnerability * impact;
    
    // Classify risk level
    const riskLevel = classifyRiskLevel(inherentRisk);
    
    // Update counters
    switch (riskLevel) {
      case 'critical': criticalCount++; break;
      case 'high': highCount++; break;
      case 'medium': mediumCount++; break;
      case 'low': lowCount++; break;
    }
    
    // Generate scenario description
    const scenarioDescription = generateScenarioDescription(
      threat,
      interviewResponses,
      threatLikelihood,
      vulnerability,
      impact
    );
    
    // Create risk scenario object
    generatedScenarios.push({
      assessmentId,
      threatId: 0, // Will be resolved during insert
      threatLikelihood,
      vulnerability,
      impact,
      inherentRisk,
      residualRisk: inherentRisk, // Initially same as inherent
      controlEffectiveness: 0,
      riskLevel,
      scenarioDescription,
    });
  }

  // Insert scenarios into database
  const insertedIds: string[] = [];
  
  try {
    for (let i = 0; i < generatedScenarios.length; i++) {
      const scenario = generatedScenarios[i];
      const threat = WAREHOUSE_THREATS[i];
      
      // Look up threat record from threat_library using select (pre-seeded)
      const existingThreats = await db.select().from(threatLibrary).where(eq(threatLibrary.id, threat.id));
      const threatDbId: string = existingThreats[0]?.id || threat.id;
      
      // Map numeric scores to text labels for the actual schema
      const likelihoodLabel = scenario.threatLikelihood <= 2 ? 'Low' : scenario.threatLikelihood === 3 ? 'Medium' : 'High';
      const impactLabel = scenario.impact <= 2 ? 'Low' : scenario.impact === 3 ? 'Medium' : scenario.impact >= 4 ? 'High' : 'Critical';
      
      // Insert risk scenario matching actual riskScenarios schema
      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId: String(scenario.assessmentId),
        threatLibraryId: threatDbId,
        scenario: scenario.scenarioDescription,
        asset: 'Warehouse Facility',
        threatType: threat.category,
        threatDescription: threat.description,
        likelihood: likelihoodLabel,
        impact: impactLabel,
        riskLevel: scenario.riskLevel,
        likelihoodScore: scenario.threatLikelihood,
        impactScore: scenario.impact,
        inherentRisk: scenario.inherentRisk,
        residualRisk: scenario.residualRisk,
        controlEffectiveness: scenario.controlEffectiveness,
      }).returning();
      
      insertedIds.push(inserted.id);
    }
  } catch (error) {
    console.error('Error inserting risk scenarios:', error);
    throw error;
  }

  return {
    success: true,
    generatedScenarios: generatedScenarios.length,
    criticalRisks: criticalCount,
    highRisks: highCount,
    mediumRisks: mediumCount,
    lowRisks: lowCount,
    riskScenarioIds: insertedIds,
  };
}

// ============================================================================
// UTILITY FUNCTIONS FOR ROUTE INTEGRATION
// ============================================================================

/**
 * Get all controls recommended for a set of identified gaps
 */
export function getRecommendedControlsForGaps(responses: InterviewResponses): {
  controlId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
}[] {
  const controls: Array<{
    controlId: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    rationale: string;
  }> = [];

  // Critical controls - dock and cargo theft prevention
  if (isNoResponse(responses.dock_2)) {
    controls.push({
      controlId: 'dock_cctv_coverage',
      priority: 'critical',
      rationale: 'Loading docks are the primary vulnerability point for cargo theft. TAPA FSR requires 100% dock coverage.',
    });
  }
  
  if (responseMatchesIndicator(responses.dock_4, 'no seal')) {
    controls.push({
      controlId: 'trailer_seal_verification',
      priority: 'critical',
      rationale: 'Seal verification prevents fictitious pickup schemes, a primary full truckload theft method.',
    });
  }
  
  if (isNoResponse(responses.fleet_2)) {
    controls.push({
      controlId: 'gps_fleet_tracking',
      priority: 'critical',
      rationale: 'GPS tracking enables rapid response to vehicle theft and hijacking. Average hijacking loss exceeds $250K.',
    });
  }
  
  if (responseMatchesIndicator(responses.personnel_1, 'no background')) {
    controls.push({
      controlId: 'employee_background_checks',
      priority: 'critical',
      rationale: 'FBI estimates 60-80% of cargo theft involves insider information. Background checks deter opportunistic hires.',
    });
  }
  
  // High priority controls
  if (isNoResponse(responses.perimeter_6)) {
    controls.push({
      controlId: 'perimeter_cctv',
      priority: 'high',
      rationale: 'Perimeter and yard CCTV provides detection and evidence for trailer theft and after-hours intrusion.',
    });
  }
  
  if (responseMatchesIndicator(responses.inventory_2, 'no formal')) {
    controls.push({
      controlId: 'cycle_counting_program',
      priority: 'high',
      rationale: 'Without cycle counting, theft can go undetected for months. Industry average shrinkage is 1-2%.',
    });
  }
  
  if (isNoResponse(responses.inventory_3)) {
    controls.push({
      controlId: 'high_value_caging',
      priority: 'high',
      rationale: 'High-value caging reduces opportunity for casual theft. Required for TAPA FSR Level A certification.',
    });
  }
  
  if (responseMatchesIndicator(responses.perimeter_8, 'no specific security')) {
    controls.push({
      controlId: 'trailer_king_pin_locks',
      priority: 'high',
      rationale: 'King pin locks prevent unauthorized trailer hookup. Essential for yards with loaded trailers.',
    });
  }
  
  // Medium priority controls
  if (isNoResponse(responses.dock_6)) {
    controls.push({
      controlId: 'dock_scheduling_system',
      priority: 'medium',
      rationale: 'Scheduling enables verification of expected arrivals. Unexpected trucks can be flagged for scrutiny.',
    });
  }
  
  if (isNoResponse(responses.personnel_7)) {
    controls.push({
      controlId: 'theft_reporting_hotline',
      priority: 'medium',
      rationale: 'Industry data shows 40% of theft is detected via employee tips. Anonymous reporting removes fear barriers.',
    });
  }
  
  if (isNoResponse(responses.surveillance_4)) {
    controls.push({
      controlId: 'video_analytics',
      priority: 'medium',
      rationale: 'Video analytics can detect unusual patterns without constant human monitoring.',
    });
  }

  return controls;
}

// ============================================================================
// SECURITY SCORE CALCULATOR
// ============================================================================

/**
 * Calculate overall security score based on interview responses
 * Returns percentage score, letter grade, and category breakdown
 */
export function calculateOverallSecurityScore(responses: InterviewResponses): SecurityScoreResult {
  let totalFactors = 0;
  let securityFactors = 0;
  const findings: string[] = [];
  const strengths: string[] = [];
  const categoryScores: Record<string, number> = {};

  // =========================================================================
  // CATEGORY: PERIMETER & YARD SECURITY (weight: 15%)
  // =========================================================================
  let perimeterScore = 0;
  let perimeterTotal = 0;
  
  // Fencing quality
  perimeterTotal++;
  if (!responseMatchesIndicator(responses.perimeter_1, 'no fencing') &&
      !responseMatchesIndicator(responses.perimeter_1, 'other fencing')) {
    perimeterScore++;
    if (responseMatchesIndicator(responses.perimeter_1, 'high-security')) {
      strengths.push('High-security perimeter fencing');
    }
  } else {
    findings.push('Inadequate perimeter fencing');
  }
  
  // Fence condition
  perimeterTotal++;
  if (isYesResponse(responses.perimeter_2)) {
    perimeterScore++;
  } else {
    findings.push('Perimeter fence in poor condition');
  }
  
  // Intrusion detection
  perimeterTotal++;
  if (isYesResponse(responses.perimeter_3)) {
    perimeterScore++;
    strengths.push('Perimeter intrusion detection installed');
  } else {
    findings.push('No perimeter intrusion detection');
  }
  
  // Vehicle access control
  perimeterTotal++;
  if (!responseMatchesIndicator(responses.perimeter_4, 'open access')) {
    perimeterScore++;
    if (responseMatchesIndicator(responses.perimeter_4, 'manned guard')) {
      strengths.push('Manned guard gate for vehicle access');
    }
  } else {
    findings.push('Open vehicle access to property');
  }
  
  // Lighting
  perimeterTotal++;
  if (!isLowRating(responses.perimeter_5)) {
    perimeterScore++;
  } else {
    findings.push('Inadequate perimeter/yard lighting');
  }
  
  // CCTV coverage
  perimeterTotal++;
  if (isYesResponse(responses.perimeter_6)) {
    perimeterScore++;
  } else {
    findings.push('No perimeter/yard CCTV');
  }
  
  categoryScores['perimeterSecurity'] = Math.round((perimeterScore / perimeterTotal) * 100);
  totalFactors += perimeterTotal;
  securityFactors += perimeterScore;

  // =========================================================================
  // CATEGORY: LOADING DOCK SECURITY (weight: 20%)
  // =========================================================================
  let dockScore = 0;
  let dockTotal = 0;
  
  // Dock CCTV
  dockTotal++;
  if (isYesResponse(responses.dock_2)) {
    dockScore++;
    strengths.push('Loading dock CCTV coverage');
  } else {
    findings.push('No loading dock CCTV');
  }
  
  // Door sensors
  dockTotal++;
  if (isYesResponse(responses.dock_3)) {
    dockScore++;
  } else {
    findings.push('No dock door sensors');
  }
  
  // Seal verification
  dockTotal++;
  if (!responseMatchesIndicator(responses.dock_4, 'informal') &&
      !responseMatchesIndicator(responses.dock_4, 'no seal')) {
    dockScore++;
    if (responseMatchesIndicator(responses.dock_4, 'electronic')) {
      strengths.push('Electronic seal verification system');
    }
  } else {
    findings.push('Weak or no seal verification');
  }
  
  // Dock scheduling
  dockTotal++;
  if (isYesResponse(responses.dock_6)) {
    dockScore++;
  } else {
    findings.push('No dock scheduling system');
  }
  
  // Outbound verification
  dockTotal++;
  if (!responseMatchesIndicator(responses.dock_8, 'informal') &&
      !responseMatchesIndicator(responses.dock_8, 'no verification')) {
    dockScore++;
  } else {
    findings.push('Weak outbound load verification');
  }
  
  // Driver access
  dockTotal++;
  if (!responseMatchesIndicator(responses.dock_9, 'no restrictions')) {
    dockScore++;
  } else {
    findings.push('Drivers have unrestricted warehouse access');
  }
  
  // Intrusion alarm
  dockTotal++;
  if (isYesResponse(responses.dock_10)) {
    dockScore++;
  } else {
    findings.push('No dock intrusion alarm');
  }
  
  categoryScores['loadingDockSecurity'] = Math.round((dockScore / dockTotal) * 100);
  totalFactors += dockTotal;
  securityFactors += dockScore;

  // =========================================================================
  // CATEGORY: INVENTORY CONTROL (weight: 20%)
  // =========================================================================
  let inventoryScore = 0;
  let inventoryTotal = 0;
  
  // WMS
  inventoryTotal++;
  if (isYesResponse(responses.inventory_1)) {
    inventoryScore++;
    strengths.push('Warehouse Management System in place');
  } else {
    findings.push('No Warehouse Management System');
  }
  
  // Real-time visibility
  inventoryTotal++;
  if (isYesResponse(responses.inventory_1a)) {
    inventoryScore++;
  } else {
    findings.push('No real-time inventory visibility');
  }
  
  // Cycle counting
  inventoryTotal++;
  if (!responseMatchesIndicator(responses.inventory_2, 'only annual') &&
      !responseMatchesIndicator(responses.inventory_2, 'no formal')) {
    inventoryScore++;
    if (responseMatchesIndicator(responses.inventory_2, 'daily') ||
        responseMatchesIndicator(responses.inventory_2, 'weekly')) {
      strengths.push('Frequent cycle counting');
    }
  } else {
    findings.push('Infrequent or no cycle counting');
  }
  
  // High-value caging
  inventoryTotal++;
  if (isYesResponse(responses.inventory_3)) {
    inventoryScore++;
    strengths.push('High-value inventory in secure caging');
  } else {
    findings.push('No high-value inventory caging');
  }
  
  // Exception reporting
  inventoryTotal++;
  if (isYesResponse(responses.inventory_6)) {
    inventoryScore++;
  } else {
    findings.push('No exception-based reporting');
  }
  
  // Two-person rule
  inventoryTotal++;
  if (isYesResponse(responses.inventory_7)) {
    inventoryScore++;
  } else {
    findings.push('No two-person rule for high-value');
  }
  
  categoryScores['inventoryControl'] = Math.round((inventoryScore / inventoryTotal) * 100);
  totalFactors += inventoryTotal;
  securityFactors += inventoryScore;

  // =========================================================================
  // CATEGORY: PERSONNEL SECURITY (weight: 15%)
  // =========================================================================
  let personnelScore = 0;
  let personnelTotal = 0;
  
  // Background checks
  personnelTotal++;
  if (!responseMatchesIndicator(responses.personnel_1, 'no background')) {
    personnelScore++;
    if (responseMatchesIndicator(responses.personnel_1, 'comprehensive')) {
      strengths.push('Comprehensive employee background checks');
    }
  } else {
    findings.push('No employee background checks');
  }
  
  // Driver checks
  personnelTotal++;
  if (isYesResponse(responses.personnel_2)) {
    personnelScore++;
  } else {
    findings.push('No driver background checks');
  }
  
  // Access control system
  personnelTotal++;
  if (!responseMatchesIndicator(responses.personnel_3, 'physical keys only') &&
      !responseMatchesIndicator(responses.personnel_3, 'no formal')) {
    personnelScore++;
    if (responseMatchesIndicator(responses.personnel_3, 'electronic badge')) {
      strengths.push('Electronic badge access system');
    }
  } else {
    findings.push('Weak access control system');
  }
  
  // Driver check-in
  personnelTotal++;
  if (isYesResponse(responses.personnel_5)) {
    personnelScore++;
  } else {
    findings.push('No driver check-in procedure');
  }
  
  // Security training
  personnelTotal++;
  if (!responseMatchesIndicator(responses.personnel_6, 'informal') &&
      !responseMatchesIndicator(responses.personnel_6, 'no formal')) {
    personnelScore++;
  } else {
    findings.push('No formal security training');
  }
  
  // Insider threat program
  personnelTotal++;
  if (isYesResponse(responses.personnel_8)) {
    personnelScore++;
    strengths.push('Insider threat program in place');
  } else {
    findings.push('No insider threat program');
  }
  
  categoryScores['personnelSecurity'] = Math.round((personnelScore / personnelTotal) * 100);
  totalFactors += personnelTotal;
  securityFactors += personnelScore;

  // =========================================================================
  // CATEGORY: VEHICLE & FLEET SECURITY (weight: 10%)
  // =========================================================================
  let fleetScore = 0;
  let fleetTotal = 0;
  
  // GPS tracking
  fleetTotal++;
  if (isYesResponse(responses.fleet_2)) {
    fleetScore++;
    strengths.push('GPS tracking on fleet vehicles');
  } else {
    findings.push('No GPS tracking on fleet');
  }
  
  // Vehicle immobilizers
  fleetTotal++;
  if (isYesResponse(responses.fleet_3)) {
    fleetScore++;
  } else {
    findings.push('No vehicle immobilizers');
  }
  
  // Two-driver rule
  fleetTotal++;
  if (isYesResponse(responses.fleet_4)) {
    fleetScore++;
  } else {
    findings.push('No two-driver rule for high-value');
  }
  
  categoryScores['fleetSecurity'] = Math.round((fleetScore / fleetTotal) * 100);
  totalFactors += fleetTotal;
  securityFactors += fleetScore;

  // =========================================================================
  // CATEGORY: SURVEILLANCE (weight: 10%)
  // =========================================================================
  let surveillanceScore = 0;
  let surveillanceTotal = 0;
  
  // Interior CCTV
  surveillanceTotal++;
  if (isYesResponse(responses.surveillance_1)) {
    surveillanceScore++;
  } else {
    findings.push('No interior warehouse CCTV');
  }
  
  // Video retention
  surveillanceTotal++;
  if (!responseMatchesIndicator(responses.surveillance_2, 'less than 7 days') &&
      !responseMatchesIndicator(responses.surveillance_2, '7-14 days')) {
    surveillanceScore++;
    if (responseMatchesIndicator(responses.surveillance_2, '90+') ||
        responseMatchesIndicator(responses.surveillance_2, '60-90')) {
      strengths.push('Long video retention period');
    }
  } else {
    findings.push('Short video retention period');
  }
  
  // Video analytics
  surveillanceTotal++;
  if (isYesResponse(responses.surveillance_4)) {
    surveillanceScore++;
    strengths.push('Video analytics capabilities');
  } else {
    findings.push('No video analytics');
  }
  
  categoryScores['surveillance'] = Math.round((surveillanceScore / surveillanceTotal) * 100);
  totalFactors += surveillanceTotal;
  securityFactors += surveillanceScore;

  // =========================================================================
  // CATEGORY: EMERGENCY PREPAREDNESS (weight: 10%)
  // =========================================================================
  let emergencyScore = 0;
  let emergencyTotal = 0;
  
  // Cargo theft response plan
  emergencyTotal++;
  if (isYesResponse(responses.emergency_1)) {
    emergencyScore++;
    strengths.push('Documented cargo theft response plan');
  } else {
    findings.push('No cargo theft response plan');
  }
  
  // Documented procedures
  emergencyTotal++;
  if (isYesResponse(responses.emergency_2)) {
    emergencyScore++;
  } else {
    findings.push('Shipping/receiving procedures not documented');
  }
  
  // Key control
  emergencyTotal++;
  if (isYesResponse(responses.emergency_3)) {
    emergencyScore++;
  } else {
    findings.push('No key control system');
  }
  
  // Security drills
  emergencyTotal++;
  if (!responseMatchesIndicator(responses.emergency_5, 'rarely') &&
      !responseMatchesIndicator(responses.emergency_5, 'never')) {
    emergencyScore++;
  } else {
    findings.push('No security drills conducted');
  }
  
  // Law enforcement relationship
  emergencyTotal++;
  if (isYesResponse(responses.emergency_6)) {
    emergencyScore++;
    strengths.push('Law enforcement partnership');
  } else {
    findings.push('No law enforcement relationship');
  }
  
  categoryScores['emergencyPreparedness'] = Math.round((emergencyScore / emergencyTotal) * 100);
  totalFactors += emergencyTotal;
  securityFactors += emergencyScore;

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

/**
 * Get risk factor count for debugging/transparency
 */
export function getRiskFactorAnalysis(
  responses: InterviewResponses
): { totalFactors: number; byCategory: Record<string, number>; details: string[] } {
  let totalFactors = 0;
  const byCategory: Record<string, number> = {};
  const details: string[] = [];

  // Initialize categories
  const categories = [
    'perimeter',
    'dock',
    'inventory',
    'personnel',
    'fleet',
    'surveillance',
    'emergency',
  ];
  
  for (const category of categories) {
    byCategory[category] = 0;
  }

  // Perimeter factors
  if (responseMatchesIndicator(responses.perimeter_1, 'no fencing')) {
    byCategory['perimeter'] += 2;
    details.push('No perimeter fencing (+2)');
  }
  if (responseMatchesIndicator(responses.perimeter_4, 'open access 24/7')) {
    byCategory['perimeter'] += 2;
    details.push('Open vehicle access (+2)');
  }
  if (isNoResponse(responses.perimeter_6)) {
    byCategory['perimeter'] += 2;
    details.push('No yard CCTV (+2)');
  }
  if (responseMatchesIndicator(responses.perimeter_8, 'no specific security')) {
    byCategory['perimeter'] += 2;
    details.push('No trailer security (+2)');
  }

  // Dock factors
  if (isNoResponse(responses.dock_2)) {
    byCategory['dock'] += 2;
    details.push('No dock CCTV (+2)');
  }
  if (responseMatchesIndicator(responses.dock_4, 'no seal')) {
    byCategory['dock'] += 2;
    details.push('No seal verification (+2)');
  }
  if (responseMatchesIndicator(responses.dock_8, 'no verification')) {
    byCategory['dock'] += 2;
    details.push('No outbound verification (+2)');
  }

  // Inventory factors
  if (responseMatchesIndicator(responses.inventory_2, 'no formal')) {
    byCategory['inventory'] += 2;
    details.push('No cycle counting (+2)');
  }
  if (isNoResponse(responses.inventory_3)) {
    byCategory['inventory'] += 2;
    details.push('No high-value caging (+2)');
  }

  // Personnel factors
  if (responseMatchesIndicator(responses.personnel_1, 'no background')) {
    byCategory['personnel'] += 2;
    details.push('No background checks (+2)');
  }

  // Fleet factors
  if (isNoResponse(responses.fleet_2)) {
    byCategory['fleet'] += 2;
    details.push('No GPS tracking (+2)');
  }

  // Sum total
  for (const count of Object.values(byCategory)) {
    totalFactors += count;
  }

  return { totalFactors, byCategory, details };
}

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
  const results = WAREHOUSE_THREATS.map(threat => {
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
 * Get warehouse-specific industry benchmarks
 */
export function getIndustryBenchmarks(): {
  averageShrinkage: string;
  targetShrinkage: string;
  averageTheftLoss: string;
  tapaRequirements: string[];
} {
  return {
    averageShrinkage: '1-2% industry average',
    targetShrinkage: 'Under 0.5% (best-in-class)',
    averageTheftLoss: '$186,779 per full truckload theft (CargoNet)',
    tapaRequirements: [
      'TAPA FSR Level A: 8ft+ fencing with intrusion detection',
      'TAPA FSR Level A: 100% CCTV coverage of docks and perimeter',
      'TAPA FSR Level A: Minimum 30-day video retention',
      'TAPA FSR Level A: High-value inventory in access-controlled caging',
      'TAPA FSR Level A: GPS tracking on all fleet vehicles',
    ],
  };
}

/**
 * Get threat-specific control recommendations based on failed questions
 * Uses the THREAT_QUESTION_MAP.controlQuestions to identify which controls
 * are needed based on the specific threat being assessed.
 * 
 * This is the Layer 1 → Layer 5 bridge: questionnaire responses → control recommendations
 */
export function getThreatSpecificControls(
  responses: InterviewResponses,
  threatId: string
): { controlId: string; rationale: string; priority: 'critical' | 'high' | 'medium' }[] {
  const threatMapping = THREAT_QUESTION_MAP[threatId];
  if (!threatMapping) return [];
  
  const controls: { controlId: string; rationale: string; priority: 'critical' | 'high' | 'medium' }[] = [];
  
  // Question → Control mapping with rationale
  const questionControlMap: Record<string, { controls: string[]; rationale: string }> = {
    perimeter_1: { controls: ['high_security_fencing'], rationale: 'Inadequate fencing allows unauthorized entry' },
    perimeter_3: { controls: ['fence_intrusion_detection'], rationale: 'No early warning of perimeter breach' },
    perimeter_4: { controls: ['guard_house_checkpoint', 'vehicle_gate_control'], rationale: 'Open vehicle access enables unauthorized entry' },
    perimeter_5: { controls: ['yard_lighting'], rationale: 'Poor lighting reduces detection and CCTV effectiveness' },
    perimeter_6: { controls: ['perimeter_cctv'], rationale: 'No surveillance coverage of yard and perimeter' },
    perimeter_7: { controls: ['clear_zone_maintenance'], rationale: 'Vegetation provides concealment for intruders' },
    perimeter_8: { controls: ['trailer_king_pin_locks', 'trailer_landing_gear_locks', 'yard_management_system'], rationale: 'Unprotected trailers vulnerable to theft' },
    dock_2: { controls: ['dock_cctv_coverage'], rationale: '47% of cargo theft occurs at loading docks - CCTV essential' },
    dock_3: { controls: ['dock_door_sensors'], rationale: 'No detection when dock doors are opened' },
    dock_4: { controls: ['trailer_seal_verification'], rationale: 'Without seal verification, fictitious pickup possible' },
    dock_5: { controls: ['documented_procedures'], rationale: 'Dock door procedures not standardized' },
    dock_6: { controls: ['dock_scheduling_system'], rationale: 'Cannot verify expected arrivals without scheduling' },
    dock_8: { controls: ['documented_procedures'], rationale: 'Outbound loads not verified for accuracy' },
    dock_9: { controls: ['driver_waiting_area', 'dock_access_control'], rationale: 'Drivers have access to warehouse interior' },
    dock_10: { controls: ['dock_intrusion_alarm'], rationale: 'No after-hours detection at dock doors' },
    inventory_1: { controls: ['warehouse_management_system'], rationale: 'No WMS for inventory tracking' },
    inventory_1a: { controls: ['real_time_inventory_visibility'], rationale: 'Cannot detect discrepancies in real-time' },
    inventory_2: { controls: ['cycle_counting_program'], rationale: 'Infrequent counting allows theft to go undetected' },
    inventory_3: { controls: ['high_value_caging'], rationale: 'High-value inventory not physically secured' },
    inventory_4: { controls: ['lot_serial_tracking'], rationale: 'Cannot trace stolen items to source' },
    inventory_5: { controls: ['high_value_area_cameras'], rationale: 'No surveillance of high-value storage' },
    inventory_6: { controls: ['exception_based_reporting'], rationale: 'Anomalies not automatically flagged' },
    inventory_7: { controls: ['two_person_rule'], rationale: 'Single employees can access high-value without oversight' },
    personnel_1: { controls: ['employee_background_checks'], rationale: 'FBI: 60-80% of cargo theft involves insiders' },
    personnel_2: { controls: ['driver_background_checks'], rationale: 'Drivers not vetted before facility access' },
    personnel_3: { controls: ['badge_access_system'], rationale: 'No audit trail of employee movements' },
    personnel_4: { controls: ['visitor_management'], rationale: 'Visitors not tracked or verified' },
    personnel_5: { controls: ['driver_check_in_procedures'], rationale: 'Drivers not verified against manifest' },
    personnel_6: { controls: ['security_awareness_training'], rationale: 'Staff not trained to identify threats' },
    personnel_7: { controls: ['theft_reporting_hotline'], rationale: '40% of theft detected via employee tips' },
    personnel_8: { controls: ['insider_threat_program'], rationale: 'No formal program to detect insider threats' },
    fleet_2: { controls: ['gps_fleet_tracking'], rationale: 'Cannot locate stolen vehicles or hijacked loads' },
    fleet_3: { controls: ['vehicle_immobilizers'], rationale: 'Vehicles can be started without authorization' },
    fleet_4: { controls: ['two_driver_rule'], rationale: 'Single drivers vulnerable to hijacking' },
    fleet_5: { controls: ['fuel_theft_prevention'], rationale: 'Fuel theft indicates weak vehicle security' },
    surveillance_1: { controls: ['interior_warehouse_cctv'], rationale: 'No surveillance inside warehouse' },
    surveillance_2: { controls: ['video_retention_30_days'], rationale: 'Retention too short for investigation' },
    surveillance_4: { controls: ['video_analytics'], rationale: 'Cannot detect anomalies automatically' },
    emergency_1: { controls: ['cargo_theft_response_plan'], rationale: 'No documented theft response plan' },
    emergency_2: { controls: ['documented_procedures'], rationale: 'Shipping/receiving procedures not documented' },
    emergency_3: { controls: ['key_control_system'], rationale: 'Keys not tracked or controlled' },
    emergency_4: { controls: ['alarm_response_procedures'], rationale: 'No documented alarm response' },
    emergency_5: { controls: ['security_drills'], rationale: 'Response procedures not practiced' },
    emergency_6: { controls: ['law_enforcement_partnership'], rationale: 'No relationship with local law enforcement' },
  };
  
  // Check each control question for this threat
  for (const questionId of threatMapping.controlQuestions) {
    const response = responses[questionId];
    const weight = QUESTION_RISK_WEIGHTS[questionId] || 1;
    const isCritical = threatMapping.criticalQuestions.includes(questionId);
    
    // Evaluate if this question indicates a control gap
    const riskPoints = evaluateQuestionResponse(questionId, response, weight, isCritical);
    
    if (riskPoints > 0 && questionControlMap[questionId]) {
      const mapping = questionControlMap[questionId];
      const priority: 'critical' | 'high' | 'medium' = isCritical ? 'critical' : (weight >= 2 ? 'high' : 'medium');
      
      for (const controlId of mapping.controls) {
        // Avoid duplicates
        if (!controls.find(c => c.controlId === controlId)) {
          controls.push({
            controlId,
            rationale: mapping.rationale,
            priority,
          });
        }
      }
    }
  }
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  return controls.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Get vulnerability breakdown by category for a specific threat
 * Useful for AI context and reporting
 */
export function getThreatVulnerabilityBreakdown(
  responses: InterviewResponses,
  threatId: string
): { 
  totalRiskFactors: number; 
  criticalGaps: string[]; 
  questionResults: Array<{ questionId: string; passed: boolean; weight: number }>;
} {
  const threatMapping = THREAT_QUESTION_MAP[threatId];
  if (!threatMapping) {
    return { totalRiskFactors: 0, criticalGaps: [], questionResults: [] };
  }
  
  let totalRiskFactors = 0;
  const criticalGaps: string[] = [];
  const questionResults: Array<{ questionId: string; passed: boolean; weight: number }> = [];
  
  for (const questionId of threatMapping.questionIds) {
    const response = responses[questionId];
    const weight = QUESTION_RISK_WEIGHTS[questionId] || 1;
    const isCritical = threatMapping.criticalQuestions.includes(questionId);
    
    const riskPoints = evaluateQuestionResponse(questionId, response, weight, isCritical);
    const passed = riskPoints === 0;
    
    questionResults.push({ questionId, passed, weight });
    
    if (riskPoints > 0) {
      totalRiskFactors += riskPoints;
      if (isCritical) {
        criticalGaps.push(questionId);
      }
    }
  }
  
  return { totalRiskFactors, criticalGaps, questionResults };
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
  getRecommendedControlsForGaps,
  calculateOverallSecurityScore,
  calculateSingleThreatRisk,
  getPrioritizedThreats,
  getHighestRiskThreats,
  getRiskFactorAnalysis,
  getIndustryBenchmarks,
  getThreatSpecificControls,
  getThreatVulnerabilityBreakdown,
  WAREHOUSE_THREATS,
  THREAT_CONTROL_MAPPING,
  THREAT_QUESTION_MAP,
  QUESTION_RISK_WEIGHTS,
};
