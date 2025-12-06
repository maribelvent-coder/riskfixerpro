/**
 * Retail Store Interview Risk Mapper
 * 
 * Implements the T×V×I calculation pipeline per RiskFixer Retail Store Framework.
 * Transforms interview questionnaire responses into mathematically-derived risk scenarios.
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Retail-Store-Framework.md
 */

import { db } from '../db';
import { eq } from 'drizzle-orm';
import { assessments, riskScenarios, threats } from '@shared/schema';

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
  riskScenarioIds: number[];
}

// ============================================================================
// RETAIL STORE THREAT DEFINITIONS
// ============================================================================

export const RETAIL_STORE_THREATS = [
  {
    id: 'shoplifting',
    name: 'Shoplifting - Individual Theft',
    category: 'Theft',
    typicalLikelihood: 5,
    typicalImpact: 2,
    asisCode: 'PSC.1-2012-THF-003',
  },
  {
    id: 'organized_retail_crime',
    name: 'Organized Retail Crime (ORC)',
    category: 'Theft',
    typicalLikelihood: 3,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-THF-004',
  },
  {
    id: 'employee_theft',
    name: 'Employee Theft - Merchandise/Cash',
    category: 'Theft',
    typicalLikelihood: 4,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-005',
  },
  {
    id: 'armed_robbery',
    name: 'Armed Robbery',
    category: 'Robbery',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-ROB-001',
  },
  {
    id: 'cash_handling_theft',
    name: 'Cash Handling Theft',
    category: 'Theft',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-006',
  },
  {
    id: 'smash_and_grab',
    name: 'Smash & Grab Burglary',
    category: 'Burglary',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-BUR-002',
  },
  {
    id: 'customer_violence',
    name: 'Customer Violence/Aggression',
    category: 'Workplace Violence',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-WPV-004',
  },
  {
    id: 'return_fraud',
    name: 'Return Fraud',
    category: 'Fraud',
    typicalLikelihood: 4,
    typicalImpact: 2,
    asisCode: 'PSC.1-2012-FRD-001',
  },
  {
    id: 'vandalism',
    name: 'Vandalism - Storefront/Property',
    category: 'Vandalism',
    typicalLikelihood: 2,
    typicalImpact: 2,
    asisCode: 'PSC.1-2012-VAN-001',
  },
  {
    id: 'after_hours_burglary',
    name: 'After-Hours Burglary',
    category: 'Burglary',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-BUR-001',
  },
  {
    id: 'credit_card_fraud',
    name: 'Credit Card Fraud',
    category: 'Fraud',
    typicalLikelihood: 3,
    typicalImpact: 2,
    asisCode: 'PSC.1-2012-FRD-002',
  },
  {
    id: 'inventory_shrinkage',
    name: 'Inventory Shrinkage - Unknown Loss',
    category: 'Shrinkage',
    typicalLikelihood: 4,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-007',
  },
  {
    id: 'parking_lot_crime',
    name: 'Parking Lot Crime',
    category: 'Property Crime',
    typicalLikelihood: 3,
    typicalImpact: 2,
    asisCode: 'PSC.1-2012-PLC-001',
  },
  {
    id: 'counterfeit_currency',
    name: 'Counterfeit Currency',
    category: 'Fraud',
    typicalLikelihood: 2,
    typicalImpact: 2,
    asisCode: 'PSC.1-2012-FRD-003',
  },
  {
    id: 'display_tampering',
    name: 'Display Tampering/Price Switching',
    category: 'Fraud',
    typicalLikelihood: 3,
    typicalImpact: 2,
    asisCode: 'PSC.1-2012-FRD-004',
  },
];

// ============================================================================
// THREAT-TO-CONTROL MAPPING
// ============================================================================

export const THREAT_CONTROL_MAPPING: Record<string, string[]> = {
  shoplifting: [
    'eas_system_tags',
    'eas_system_gates',
    'cctv_sales_floor',
    'cctv_entrance_exit',
    'loss_prevention_plain_clothes',
    'security_guard_uniformed',
    'clear_sightlines_sales_floor',
    'mirrors_blind_spot_coverage',
    'signage_prosecution_policy',
    'dressing_room_attendant',
  ],
  organized_retail_crime: [
    'eas_system_tags',
    'eas_system_gates',
    'cctv_sales_floor',
    'facial_recognition_system',
    'security_guard_uniformed',
    'loss_prevention_plain_clothes',
    'high_value_display_security',
    'high_value_lockup',
    'display_case_locks',
    'orc_task_force_participation',
    'signage_prosecution_policy',
  ],
  employee_theft: [
    'cctv_pos_registers',
    'cctv_cash_room',
    'cctv_stockroom',
    'employee_background_checks',
    'dual_control_cash_procedures',
    'employee_package_inspection',
    'inventory_audit_cycle_counting',
    'bag_check_policy',
    'pos_exception_reporting',
    'stockroom_access_control',
  ],
  armed_robbery: [
    'cctv_pos_registers',
    'cctv_entrance_exit',
    'alarm_system_panic_buttons',
    'time_delay_safe',
    'drop_safe',
    'cash_limit_registers',
    'robbery_response_training',
    'closing_procedures_two_person',
    'adequate_lighting_exterior',
    'security_guard_uniformed',
    'bollards_storefront_protection',
  ],
  cash_handling_theft: [
    'dual_control_cash_procedures',
    'cctv_cash_room',
    'cash_room_access_control',
    'drop_safe',
    'time_delay_safe',
    'cash_limit_registers',
    'armored_car_service',
    'employee_background_checks',
    'pos_exception_reporting',
  ],
  smash_and_grab: [
    'bollards_storefront_protection',
    'reinforced_entrance_doors',
    'security_gates_after_hours',
    'alarm_system_intrusion',
    'cctv_entrance_exit',
    'high_value_lockup',
    'high_value_display_security',
    'adequate_lighting_exterior',
    'glass_break_sensors',
  ],
  customer_violence: [
    'security_guard_uniformed',
    'alarm_system_panic_buttons',
    'cctv_sales_floor',
    'cctv_pos_registers',
    'de_escalation_training',
    'robbery_response_training',
    'closing_procedures_two_person',
    'adequate_lighting_interior',
  ],
  return_fraud: [
    'refund_authorization_controls',
    'receipt_checking_policy',
    'cctv_pos_registers',
    'pos_exception_reporting',
    'frequent_returner_tracking',
    'return_validation_system',
    'employee_training_fraud_awareness',
  ],
  vandalism: [
    'cctv_entrance_exit',
    'cctv_parking_lot',
    'adequate_lighting_exterior',
    'security_guard_uniformed',
    'alarm_system_intrusion',
    'signage_security_warnings',
  ],
  after_hours_burglary: [
    'alarm_system_intrusion',
    'reinforced_entrance_doors',
    'security_gates_after_hours',
    'cctv_entrance_exit',
    'adequate_lighting_exterior',
    'key_control_system',
    'drop_safe',
    'high_value_lockup',
    'glass_break_sensors',
    'motion_detectors',
  ],
  credit_card_fraud: [
    'emv_chip_terminals',
    'cctv_pos_registers',
    'signature_verification_policy',
    'employee_training_fraud_awareness',
    'pos_exception_reporting',
    'id_verification_policy',
  ],
  inventory_shrinkage: [
    'inventory_audit_cycle_counting',
    'eas_system_tags',
    'cctv_stockroom',
    'stockroom_access_control',
    'receiving_verification_procedures',
    'loss_prevention_plain_clothes',
    'employee_background_checks',
    'pos_exception_reporting',
  ],
  parking_lot_crime: [
    'cctv_parking_lot',
    'adequate_lighting_exterior',
    'security_guard_uniformed',
    'cart_corral_placement',
    'emergency_call_stations',
    'security_patrol_parking',
  ],
  counterfeit_currency: [
    'counterfeit_detection_pens',
    'counterfeit_detection_machines',
    'employee_training_fraud_awareness',
    'cctv_pos_registers',
    'large_bill_verification_policy',
  ],
  display_tampering: [
    'cctv_sales_floor',
    'security_tag_placement',
    'barcode_verification_pos',
    'employee_training_fraud_awareness',
    'price_check_procedures',
    'item_count_policy',
  ],
};

// ============================================================================
// INCIDENT-TO-THREAT MAPPING
// ============================================================================

const INCIDENT_THREAT_MAP: Record<string, string[]> = {
  'Shoplifting': ['shoplifting', 'organized_retail_crime', 'inventory_shrinkage'],
  'Organized Retail Crime (ORC)': ['organized_retail_crime', 'shoplifting'],
  'Employee theft': ['employee_theft', 'cash_handling_theft', 'inventory_shrinkage'],
  'Robbery': ['armed_robbery'],
  'Burglary': ['after_hours_burglary', 'smash_and_grab'],
  'Customer violence': ['customer_violence'],
  'Return fraud': ['return_fraud'],
  'Credit card fraud': ['credit_card_fraud'],
  'Vandalism': ['vandalism'],
  'Parking lot crime': ['parking_lot_crime'],
  'Price switching': ['display_tampering'],
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
  return RETAIL_STORE_THREATS.find(t => t.id === threatId);
}

// ============================================================================
// VULNERABILITY CALCULATION
// ============================================================================

/**
 * Calculate vulnerability score (1-5) based on interview responses
 * Higher score = more vulnerable
 * 
 * Retail uses divisor of 2 (vs 3 for office) because retail has more frequent 
 * threat exposure and control gaps compound more quickly
 */
export function calculateVulnerabilityFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let vulnerabilityScore = 3; // Start at baseline (moderate)
  let riskFactorCount = 0;

  // -------------------------------------------------------------------------
  // SHRINKAGE & LOSS HISTORY ANALYSIS
  // -------------------------------------------------------------------------
  
  // High shrinkage rate = critical vulnerability indicator
  if (responseMatchesIndicator(responses.shrinkage_1, '3-5%') ||
      responseMatchesIndicator(responses.shrinkage_1, 'over 5%') ||
      responseMatchesIndicator(responses.shrinkage_1, 'unknown')) {
    riskFactorCount += 2;
  }
  
  // High shoplifting incident count
  if (responseMatchesIndicator(responses.shrinkage_3, '30+')) {
    riskFactorCount += 2;
  } else if (responseMatchesIndicator(responses.shrinkage_3, '16-30')) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // EAS (ELECTRONIC ARTICLE SURVEILLANCE) ANALYSIS
  // -------------------------------------------------------------------------
  
  // No EAS system = major shoplifting vulnerability
  if (responses.eas_1 === 'no') {
    riskFactorCount += 2;
  }
  
  // EAS gates not at all exits
  if (responses.eas_1b === 'no') {
    riskFactorCount += 1;
  }
  
  // Low EAS coverage
  if (responseMatchesIndicator(responses.eas_2, 'no eas') ||
      responseMatchesIndicator(responses.eas_2, 'under 25%')) {
    riskFactorCount += 2;
  }
  
  // Poor EAS alarm response
  if (responseMatchesIndicator(responses.eas_3, 'rarely approaches') ||
      responseMatchesIndicator(responses.eas_3, 'frequently ignored') ||
      responseMatchesIndicator(responses.eas_3, 'no formal')) {
    riskFactorCount += 1;
  }
  
  // Inconsistent EAS deactivation
  if (responseMatchesIndicator(responses.eas_4, 'inconsistent') ||
      responseMatchesIndicator(responses.eas_4, 'rarely')) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // VIDEO SURVEILLANCE (CCTV) ANALYSIS
  // -------------------------------------------------------------------------
  
  // No CCTV system = critical vulnerability
  if (responses.cctv_1 === 'no') {
    riskFactorCount += 2;
  }
  
  // Short video retention
  if (responseMatchesIndicator(responses.cctv_1b, 'less than 7 days')) {
    riskFactorCount += 1;
  }
  
  // Poor video quality for identification
  if (responseMatchesIndicator(responses.cctv_3, 'rarely') ||
      responseMatchesIndicator(responses.cctv_3, 'no - cameras')) {
    riskFactorCount += 1;
  }
  
  // CCTV rarely reviewed
  if (responseMatchesIndicator(responses.cctv_4, 'rarely reviewed')) {
    riskFactorCount += 1;
  }
  
  // No POS exception reporting
  if (responses.cctv_5 === 'no') {
    riskFactorCount += 1;
  }
  
  // Poor CCTV effectiveness rating
  if (typeof responses.cctv_6 === 'number' && responses.cctv_6 <= 2) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // CASH HANDLING ANALYSIS
  // -------------------------------------------------------------------------
  
  // High register cash = robbery magnet
  if (responseMatchesIndicator(responses.cash_1, 'over $2,000')) {
    riskFactorCount += 2;
  }
  
  // No register cash limits
  if (responses.cash_2 === 'no') {
    riskFactorCount += 1;
  }
  
  // No safe or basic safe only
  if (responseMatchesIndicator(responses.cash_3, 'no safe') ||
      responseMatchesIndicator(responses.cash_3, 'basic safe')) {
    riskFactorCount += 2;
  }
  
  // Too many people with safe access
  if (responseMatchesIndicator(responses.cash_4, 'more than 5') ||
      responseMatchesIndicator(responses.cash_4, 'no safe')) {
    riskFactorCount += 1;
  }
  
  // No armored car service
  if (responses.cash_5 === 'no') {
    riskFactorCount += 1;
  }
  
  // Poor manual deposit procedures
  if (responseMatchesIndicator(responses.cash_6, 'single person, predictable') ||
      responseMatchesIndicator(responses.cash_6, 'no formal')) {
    riskFactorCount += 2;
  }
  
  // No dual control cash procedures
  if (responses.cash_7 === 'no') {
    riskFactorCount += 1;
  }
  
  // Informal cash handling documentation
  if (responseMatchesIndicator(responses.cash_8, 'informal') ||
      responseMatchesIndicator(responses.cash_8, 'no formal')) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // PHYSICAL SECURITY ANALYSIS
  // -------------------------------------------------------------------------
  
  // Standard doors, no gates = burglary/smash-and-grab vulnerability
  if (responseMatchesIndicator(responses.physical_2, 'standard doors')) {
    riskFactorCount += 2;
  }
  
  // No bollards = vehicle ramraid vulnerability
  if (responses.physical_3 === 'no') {
    riskFactorCount += 1;
  }
  
  // Weak stockroom access control
  if (responseMatchesIndicator(responses.physical_4, 'loose key control') ||
      responseMatchesIndicator(responses.physical_4, 'unlocked') ||
      responseMatchesIndicator(responses.physical_4, 'no access')) {
    riskFactorCount += 2;
  }
  
  // No intrusion alarm
  if (responses.physical_5 === 'no') {
    riskFactorCount += 2;
  }
  
  // Alarm not centrally monitored
  if (responseMatchesIndicator(responses.physical_5a, 'local alarm only')) {
    riskFactorCount += 1;
  }
  
  // Excessive false alarms
  if (responseMatchesIndicator(responses.physical_5b, 'more than 10')) {
    riskFactorCount += 1;
  }
  
  // No panic/duress alarms
  if (responses.physical_6 === 'no') {
    riskFactorCount += 1;
  }
  
  // Poor physical security rating
  if (typeof responses.physical_7 === 'number' && responses.physical_7 <= 2) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // LOSS PREVENTION STAFFING ANALYSIS
  // -------------------------------------------------------------------------
  
  // No dedicated LP staff
  if (responseMatchesIndicator(responses.lp_staff_1, 'no - store staff') ||
      responseMatchesIndicator(responses.lp_staff_1, 'no dedicated')) {
    riskFactorCount += 2;
  }
  
  // Sporadic or no LP coverage
  if (responseMatchesIndicator(responses.lp_staff_3, 'sporadic') ||
      responseMatchesIndicator(responses.lp_staff_3, 'no lp coverage')) {
    riskFactorCount += 1;
  }
  
  // No visible security presence
  if (responses.lp_staff_4 === 'no') {
    riskFactorCount += 1;
  }
  
  // No prosecution policy
  if (responses.lp_staff_5 === 'no') {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // EMPLOYEE PROCEDURES ANALYSIS
  // -------------------------------------------------------------------------
  
  // No background checks
  if (responseMatchesIndicator(responses.employee_1, 'no background')) {
    riskFactorCount += 1;
  }
  
  // Informal or no theft training
  if (responseMatchesIndicator(responses.employee_2, 'informal') ||
      responseMatchesIndicator(responses.employee_2, 'no formal')) {
    riskFactorCount += 1;
  }
  
  // No robbery response training
  if (responses.employee_3 === 'no') {
    riskFactorCount += 1;
  }
  
  // No clear observed theft policy
  if (responseMatchesIndicator(responses.employee_4, 'no clear policy')) {
    riskFactorCount += 1;
  }
  
  // No two-person closing
  if (responses.employee_5 === 'no') {
    riskFactorCount += 1;
  }
  
  // No or rare employee bag inspections
  if (responseMatchesIndicator(responses.employee_6, 'rarely') ||
      responseMatchesIndicator(responses.employee_6, 'no inspections')) {
    riskFactorCount += 1;
  }
  
  // Informal employee discount policy
  if (responseMatchesIndicator(responses.employee_8, 'informal') ||
      responseMatchesIndicator(responses.employee_8, 'manager discretion')) {
    riskFactorCount += 1;
  }
  
  // No formal termination security procedures
  if (responseMatchesIndicator(responses.employee_9, 'no formal security procedures')) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // MERCHANDISE PROTECTION ANALYSIS
  // -------------------------------------------------------------------------
  
  // No high-value merchandise security
  if (responseMatchesIndicator(responses.merchandise_1, 'no special security')) {
    riskFactorCount += 2;
  }
  
  // No fitting room monitoring
  if (responseMatchesIndicator(responses.merchandise_2, 'no monitoring')) {
    riskFactorCount += 1;
  }
  
  // No security-focused fixtures
  if (responses.merchandise_3 === 'no') {
    riskFactorCount += 1;
  }
  
  // Poor sales floor visibility
  if (responseMatchesIndicator(responses.merchandise_4, 'limited') ||
      responseMatchesIndicator(responses.merchandise_4, 'poor')) {
    riskFactorCount += 1;
  }
  
  // No convex mirrors
  if (responses.merchandise_5 === 'no') {
    riskFactorCount += 1;
  }
  
  // Only annual inventory audits
  if (responseMatchesIndicator(responses.merchandise_6, 'only annual')) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // REFUND & RETURN POLICIES ANALYSIS
  // -------------------------------------------------------------------------
  
  // Weak refund authorization
  if (responseMatchesIndicator(responses.refunds_1, 'cashiers can process') ||
      responseMatchesIndicator(responses.refunds_1, 'no formal policy')) {
    riskFactorCount += 1;
  }
  
  // No receipt requirement
  if (responseMatchesIndicator(responses.refunds_2, 'no - accept returns')) {
    riskFactorCount += 1;
  }
  
  // No frequent returner tracking
  if (responses.refunds_3 === 'no') {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // EXTERNAL FACTORS ANALYSIS
  // -------------------------------------------------------------------------
  
  // High crime area
  if (responseMatchesIndicator(responses.external_1, 'high crime') ||
      responseMatchesIndicator(responses.external_1, 'very high')) {
    riskFactorCount += 1;
  }
  
  // No information sharing with neighbors
  if (responseMatchesIndicator(responses.external_3, 'rarely') ||
      responseMatchesIndicator(responses.external_3, 'no communication')) {
    riskFactorCount += 1;
  }
  
  // Standalone or urban street location (higher exposure)
  if (responseMatchesIndicator(responses.store_profile_6, 'standalone') ||
      responseMatchesIndicator(responses.store_profile_6, 'urban street')) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // CALCULATE FINAL SCORE
  // -------------------------------------------------------------------------
  
  // Retail uses divisor of 2 (more sensitive than office's 3)
  // Each 2 risk factors increases vulnerability by 1 point
  vulnerabilityScore = Math.min(5, vulnerabilityScore + Math.floor(riskFactorCount / 2));
  
  return vulnerabilityScore;
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
  let likelihood = 2; // Start at baseline (unlikely)

  // -------------------------------------------------------------------------
  // FACTOR 1: INCIDENT HISTORY (most important)
  // -------------------------------------------------------------------------
  
  // ORC history
  if (responses.shrinkage_4 === 'yes') {
    if (threatId === 'organized_retail_crime' || threatId === 'shoplifting') {
      likelihood += 2;
    }
    // Multiple ORC incidents
    if (responseMatchesIndicator(responses.shrinkage_4a, '6-10') ||
        responseMatchesIndicator(responses.shrinkage_4a, '10+')) {
      likelihood += 1;
    }
  }
  
  // Employee theft history
  if (responses.shrinkage_5 === 'yes') {
    if (threatId === 'employee_theft' || threatId === 'cash_handling_theft' ||
        threatId === 'inventory_shrinkage') {
      likelihood += 2;
    }
  }
  
  // Robbery history - significant likelihood increase
  if (responses.shrinkage_6 === 'yes') {
    if (threatId === 'armed_robbery') {
      likelihood += 2;
    }
    // Recent robbery is worse
    if (responseMatchesIndicator(responses.shrinkage_6a, 'within past 6 months') ||
        responseMatchesIndicator(responses.shrinkage_6a, '6-12 months')) {
      likelihood += 1;
    }
    // Armed robbery history
    if (responses.shrinkage_6b === 'yes') {
      likelihood += 1;
    }
  }
  
  // Burglary history
  if (responses.shrinkage_7 === 'yes') {
    if (threatId === 'after_hours_burglary' || threatId === 'smash_and_grab') {
      likelihood += 2;
    }
  }
  
  // Return fraud history
  if (responses.refunds_4 === 'yes') {
    if (threatId === 'return_fraud') {
      likelihood += 2;
    }
  }

  // -------------------------------------------------------------------------
  // FACTOR 2: THREAT-SPECIFIC PATTERNS
  // -------------------------------------------------------------------------
  
  // Shoplifting - High incident count increases likelihood
  if (threatId === 'shoplifting' || threatId === 'organized_retail_crime') {
    if (responseMatchesIndicator(responses.shrinkage_3, '30+')) {
      likelihood += 2;
    } else if (responseMatchesIndicator(responses.shrinkage_3, '16-30')) {
      likelihood += 1;
    }
  }
  
  // ORC - Area awareness increases likelihood
  if (threatId === 'organized_retail_crime') {
    if (responses.external_2 === 'yes') {
      likelihood += 1;
    }
  }
  
  // Armed Robbery - Store type and hours affect likelihood
  if (threatId === 'armed_robbery') {
    // High-value targets
    if (responseMatchesIndicator(responses.store_profile_1, 'jewelry') ||
        responseMatchesIndicator(responses.store_profile_1, 'electronics') ||
        responseMatchesIndicator(responses.store_profile_1, 'pharmacy')) {
      likelihood += 1;
    }
    // Extended hours = more opportunity
    if (responseMatchesIndicator(responses.store_profile_5, '24 hours') ||
        responseMatchesIndicator(responses.store_profile_5, 'extended hours')) {
      likelihood += 1;
    }
    // High crime area
    if (responseMatchesIndicator(responses.external_1, 'high crime') ||
        responseMatchesIndicator(responses.external_1, 'very high')) {
      likelihood += 1;
    }
  }
  
  // Smash and Grab - Physical factors
  if (threatId === 'smash_and_grab') {
    // Full glass storefront
    if (responseMatchesIndicator(responses.physical_1, 'full glass')) {
      likelihood += 1;
    }
    // High-value merchandise
    if (responses.store_profile_8 === 'yes') {
      if (responseMatchesIndicator(responses.store_profile_8a, 'electronics') ||
          responseMatchesIndicator(responses.store_profile_8a, 'jewelry')) {
        likelihood += 1;
      }
    }
  }
  
  // Customer Violence - operating conditions
  if (threatId === 'customer_violence') {
    // High traffic stores
    if (responseMatchesIndicator(responses.store_profile_4, '50+')) {
      likelihood += 1;
    }
    // Extended hours = more exposure
    if (responseMatchesIndicator(responses.store_profile_5, '24 hours') ||
        responseMatchesIndicator(responses.store_profile_5, 'extended hours')) {
      likelihood += 1;
    }
  }
  
  // Parking Lot Crime - exposure factors
  if (threatId === 'parking_lot_crime') {
    // High crime area
    if (responseMatchesIndicator(responses.external_1, 'high crime') ||
        responseMatchesIndicator(responses.external_1, 'very high')) {
      likelihood += 1;
    }
    // Standalone location
    if (responseMatchesIndicator(responses.store_profile_6, 'standalone')) {
      likelihood += 1;
    }
  }
  
  // Inventory Shrinkage - operational indicators
  if (threatId === 'inventory_shrinkage') {
    // High shrinkage rate is direct evidence
    if (responseMatchesIndicator(responses.shrinkage_1, '3-5%') ||
        responseMatchesIndicator(responses.shrinkage_1, 'over 5%')) {
      likelihood += 2;
    }
    // Unknown shrinkage = can't manage what you can't measure
    if (responseMatchesIndicator(responses.shrinkage_1, 'unknown')) {
      likelihood += 1;
    }
  }
  
  // Credit Card Fraud - transaction type exposure
  if (threatId === 'credit_card_fraud') {
    // Higher revenue = more transactions = more exposure
    if (responseMatchesIndicator(responses.store_profile_2, 'over $10m')) {
      likelihood += 1;
    }
  }

  // Cap at 5
  return Math.min(5, likelihood);
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

  // -------------------------------------------------------------------------
  // FACTOR 1: STORE SIZE & REVENUE
  // -------------------------------------------------------------------------
  
  const revenueImpactMap: Record<string, number> = {
    'under $500k': 0,
    '$500k - $1m': 0,
    '$1m - $3m': 1,
    '$3m - $10m': 1,
    'over $10m': 2,
  };
  
  const revenueResponse = responses.store_profile_2?.toLowerCase() || '';
  for (const [key, value] of Object.entries(revenueImpactMap)) {
    if (revenueResponse.includes(key)) {
      impact += value;
      break;
    }
  }

  // -------------------------------------------------------------------------
  // FACTOR 2: MERCHANDISE VALUE
  // -------------------------------------------------------------------------
  
  const merchValueMap: Record<string, number> = {
    'under $50,000': 0,
    '$50,000 - $100,000': 0,
    '$100,000 - $250,000': 1,
    '$250,000 - $500,000': 1,
    'over $500,000': 2,
  };
  
  const merchResponse = responses.store_profile_7?.toLowerCase() || '';
  for (const [key, value] of Object.entries(merchValueMap)) {
    if (merchResponse.includes(key)) {
      impact += value;
      break;
    }
  }

  // -------------------------------------------------------------------------
  // FACTOR 3: EMPLOYEE COUNT (life safety consideration)
  // -------------------------------------------------------------------------
  
  const employeeResponse = responses.store_profile_4 || '';
  if (responseMatchesIndicator(employeeResponse, '50+')) {
    impact += 1;
  } else if (responseMatchesIndicator(employeeResponse, '31-50')) {
    impact += 1;
  }

  // -------------------------------------------------------------------------
  // FACTOR 4: HIGH-VALUE MERCHANDISE
  // -------------------------------------------------------------------------
  
  if (responses.store_profile_8 === 'yes') {
    const highValueCategories = responses.store_profile_8a || [];
    // Firearms and jewelry have severe regulatory/liability implications
    if (responseMatchesIndicator(highValueCategories, 'firearms') ||
        responseMatchesIndicator(highValueCategories, 'jewelry')) {
      impact += 1;
    }
  }

  // -------------------------------------------------------------------------
  // FACTOR 5: STORE TYPE IMPACT MODIFIERS
  // -------------------------------------------------------------------------
  
  const storeType = responses.store_profile_1 || '';
  
  // Pharmacy has HIPAA and controlled substance concerns
  if (responseMatchesIndicator(storeType, 'pharmacy')) {
    impact += 1;
  }
  
  // Jewelry stores have concentrated high-value inventory
  if (responseMatchesIndicator(storeType, 'jewelry')) {
    impact += 1;
  }

  // -------------------------------------------------------------------------
  // THREAT-SPECIFIC IMPACT OVERRIDES
  // -------------------------------------------------------------------------
  
  // Armed Robbery - Always high impact due to life safety
  if (threatId === 'armed_robbery') {
    impact = Math.max(impact, 5);
  }
  
  // Customer Violence - Life safety concern
  if (threatId === 'customer_violence') {
    impact = Math.max(impact, 4);
  }
  
  // Organized Retail Crime - Typically higher loss amounts
  if (threatId === 'organized_retail_crime') {
    // Use ORC loss history if available
    if (responseMatchesIndicator(responses.shrinkage_4b, 'over $50,000') ||
        responseMatchesIndicator(responses.shrinkage_4b, '$100,000')) {
      impact = Math.max(impact, 4);
    }
  }
  
  // After-Hours Burglary - Can involve significant inventory loss
  if (threatId === 'after_hours_burglary') {
    if (responses.store_profile_8 === 'yes') {
      impact = Math.max(impact, 4);
    }
  }
  
  // Smash and Grab - High-value targets have higher impact
  if (threatId === 'smash_and_grab') {
    if (responseMatchesIndicator(responses.store_profile_8a, 'electronics') ||
        responseMatchesIndicator(responses.store_profile_8a, 'jewelry')) {
      impact = Math.max(impact, 4);
    }
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
  
  // -------------------------------------------------------------------------
  // EAS CONTROLS
  // -------------------------------------------------------------------------
  
  if (responses.eas_1 === 'no') {
    recommendations.add('eas_system_tags');
    recommendations.add('eas_system_gates');
  }
  
  if (responses.eas_1b === 'no') {
    recommendations.add('eas_system_gates');
  }
  
  if (responseMatchesIndicator(responses.eas_3, 'frequently ignored') ||
      responseMatchesIndicator(responses.eas_3, 'no formal')) {
    recommendations.add('eas_alarm_response_procedure');
  }
  
  // -------------------------------------------------------------------------
  // VIDEO SURVEILLANCE CONTROLS
  // -------------------------------------------------------------------------
  
  if (responses.cctv_1 === 'no') {
    recommendations.add('cctv_sales_floor');
    recommendations.add('cctv_pos_registers');
    recommendations.add('cctv_entrance_exit');
  }
  
  if (responseMatchesIndicator(responses.cctv_1b, 'less than 7 days')) {
    recommendations.add('video_storage_upgrade');
  }
  
  if (responseMatchesIndicator(responses.cctv_3, 'rarely') ||
      responseMatchesIndicator(responses.cctv_3, 'no - cameras')) {
    recommendations.add('cctv_hd_upgrade');
  }
  
  if (responses.cctv_5 === 'no') {
    recommendations.add('pos_exception_reporting');
  }
  
  // -------------------------------------------------------------------------
  // CASH HANDLING CONTROLS
  // -------------------------------------------------------------------------
  
  if (responseMatchesIndicator(responses.cash_1, 'over $2,000')) {
    recommendations.add('cash_limit_registers');
    recommendations.add('drop_safe');
  }
  
  if (responses.cash_2 === 'no') {
    recommendations.add('cash_limit_registers');
  }
  
  if (responseMatchesIndicator(responses.cash_3, 'no safe') ||
      responseMatchesIndicator(responses.cash_3, 'basic safe')) {
    recommendations.add('time_delay_safe');
    recommendations.add('drop_safe');
  }
  
  if (responses.cash_5 === 'no') {
    recommendations.add('armored_car_service');
  }
  
  if (responses.cash_7 === 'no') {
    recommendations.add('dual_control_cash_procedures');
  }
  
  // -------------------------------------------------------------------------
  // PHYSICAL SECURITY CONTROLS
  // -------------------------------------------------------------------------
  
  if (responseMatchesIndicator(responses.physical_2, 'standard doors')) {
    recommendations.add('reinforced_entrance_doors');
    recommendations.add('security_gates_after_hours');
  }
  
  if (responses.physical_3 === 'no') {
    recommendations.add('bollards_storefront_protection');
  }
  
  if (responseMatchesIndicator(responses.physical_4, 'unlocked') ||
      responseMatchesIndicator(responses.physical_4, 'no access')) {
    recommendations.add('stockroom_access_control');
    recommendations.add('key_control_system');
  }
  
  if (responses.physical_5 === 'no') {
    recommendations.add('alarm_system_intrusion');
    recommendations.add('motion_detectors');
  }
  
  if (responses.physical_6 === 'no') {
    recommendations.add('alarm_system_panic_buttons');
  }
  
  // -------------------------------------------------------------------------
  // LOSS PREVENTION STAFFING CONTROLS
  // -------------------------------------------------------------------------
  
  if (responseMatchesIndicator(responses.lp_staff_1, 'no - store staff') ||
      responseMatchesIndicator(responses.lp_staff_1, 'no dedicated')) {
    recommendations.add('loss_prevention_plain_clothes');
    recommendations.add('security_guard_uniformed');
  }
  
  if (responses.lp_staff_4 === 'no') {
    recommendations.add('security_guard_uniformed');
    recommendations.add('signage_security_warnings');
  }
  
  if (responses.lp_staff_5 === 'no') {
    recommendations.add('signage_prosecution_policy');
  }
  
  // -------------------------------------------------------------------------
  // EMPLOYEE PROCEDURE CONTROLS
  // -------------------------------------------------------------------------
  
  if (responseMatchesIndicator(responses.employee_1, 'no background')) {
    recommendations.add('employee_background_checks');
  }
  
  if (responses.employee_3 === 'no') {
    recommendations.add('robbery_response_training');
  }
  
  if (responses.employee_5 === 'no') {
    recommendations.add('closing_procedures_two_person');
  }
  
  if (responseMatchesIndicator(responses.employee_6, 'no inspections')) {
    recommendations.add('bag_check_policy');
    recommendations.add('employee_package_inspection');
  }
  
  // -------------------------------------------------------------------------
  // MERCHANDISE PROTECTION CONTROLS
  // -------------------------------------------------------------------------
  
  if (responseMatchesIndicator(responses.merchandise_1, 'no special security')) {
    recommendations.add('high_value_display_security');
    recommendations.add('display_case_locks');
    recommendations.add('high_value_lockup');
  }
  
  if (responseMatchesIndicator(responses.merchandise_2, 'no monitoring')) {
    recommendations.add('dressing_room_attendant');
    recommendations.add('item_count_policy');
  }
  
  if (responseMatchesIndicator(responses.merchandise_4, 'limited') ||
      responseMatchesIndicator(responses.merchandise_4, 'poor')) {
    recommendations.add('clear_sightlines_sales_floor');
    recommendations.add('cpted_principles_retail');
  }
  
  if (responses.merchandise_5 === 'no') {
    recommendations.add('mirrors_blind_spot_coverage');
  }
  
  if (responseMatchesIndicator(responses.merchandise_6, 'only annual')) {
    recommendations.add('inventory_audit_cycle_counting');
  }
  
  // -------------------------------------------------------------------------
  // REFUND & RETURN CONTROLS
  // -------------------------------------------------------------------------
  
  if (responseMatchesIndicator(responses.refunds_1, 'cashiers can process') ||
      responseMatchesIndicator(responses.refunds_1, 'no formal policy')) {
    recommendations.add('refund_authorization_controls');
  }
  
  if (responseMatchesIndicator(responses.refunds_2, 'no - accept returns')) {
    recommendations.add('receipt_checking_policy');
  }
  
  if (responses.refunds_3 === 'no') {
    recommendations.add('frequent_returner_tracking');
  }
  
  // -------------------------------------------------------------------------
  // LIGHTING CONTROLS
  // -------------------------------------------------------------------------
  
  // These are general recommendations based on crime area
  if (responseMatchesIndicator(responses.external_1, 'high crime') ||
      responseMatchesIndicator(responses.external_1, 'very high')) {
    recommendations.add('adequate_lighting_exterior');
    recommendations.add('cctv_parking_lot');
    recommendations.add('security_patrol_parking');
  }

  // -------------------------------------------------------------------------
  // THREAT-SPECIFIC RECOMMENDATIONS
  // -------------------------------------------------------------------------
  
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
  threat: typeof RETAIL_STORE_THREATS[0],
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
  
  // Add relevant findings based on threat type
  if (threat.id === 'shoplifting' || threat.id === 'organized_retail_crime') {
    if (responses.eas_1 === 'no') {
      observations.push('no EAS system installed');
    }
    if (responseMatchesIndicator(responses.shrinkage_3, '16-30') ||
        responseMatchesIndicator(responses.shrinkage_3, '30+')) {
      observations.push('elevated shoplifting incident history');
    }
  }
  
  if (threat.id === 'employee_theft' || threat.id === 'cash_handling_theft') {
    if (responses.cctv_5 === 'no') {
      observations.push('no POS exception reporting');
    }
    if (responses.cash_7 === 'no') {
      observations.push('no dual-control cash procedures');
    }
  }
  
  if (threat.id === 'armed_robbery') {
    if (responses.physical_6 === 'no') {
      observations.push('no panic/duress alarms');
    }
    if (responses.employee_3 === 'no') {
      observations.push('staff lack robbery response training');
    }
    if (responseMatchesIndicator(responses.cash_1, 'over $2,000')) {
      observations.push('high register cash levels');
    }
  }
  
  if (threat.id === 'after_hours_burglary' || threat.id === 'smash_and_grab') {
    if (responses.physical_5 === 'no') {
      observations.push('no intrusion alarm system');
    }
    if (responseMatchesIndicator(responses.physical_2, 'standard doors')) {
      observations.push('standard doors without security gates');
    }
  }
  
  if (threat.id === 'return_fraud') {
    if (responseMatchesIndicator(responses.refunds_1, 'cashiers can process')) {
      observations.push('weak refund authorization controls');
    }
    if (responses.refunds_3 === 'no') {
      observations.push('no frequent returner tracking');
    }
  }

  const observationText = observations.length > 0 
    ? ` Key findings: ${observations.join('; ')}.`
    : '';

  return `${threat.name} scenario assessed as ${likelihoodTerms[threatLikelihood]} to occur. ` +
         `The store is ${vulnerabilityTerms[vulnerability]} against this threat, with ` +
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

  // Process each threat in the Retail Store threat library
  for (const threat of RETAIL_STORE_THREATS) {
    
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
  const insertedIds: number[] = [];
  
  try {
    for (let i = 0; i < generatedScenarios.length; i++) {
      const scenario = generatedScenarios[i];
      const threat = RETAIL_STORE_THREATS[i];
      
      // Look up or create threat record
      const existingThreat = await db.query.threats.findFirst({
        where: eq(threats.name, threat.name),
      });
      
      let threatDbId: number;
      if (existingThreat) {
        threatDbId = existingThreat.id;
      } else {
        // Create the threat if it doesn't exist
        const [newThreat] = await db.insert(threats).values({
          name: threat.name,
          category: threat.category,
          description: `${threat.name} - ASIS Code: ${threat.asisCode}`,
        }).returning();
        threatDbId = newThreat.id;
      }
      
      // Insert risk scenario
      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId: scenario.assessmentId,
        threatId: threatDbId,
        threatLikelihood: scenario.threatLikelihood,
        vulnerability: scenario.vulnerability,
        impact: scenario.impact,
        inherentRisk: scenario.inherentRisk,
        residualRisk: scenario.residualRisk,
        controlEffectiveness: scenario.controlEffectiveness,
        riskLevel: scenario.riskLevel,
        scenarioDescription: scenario.scenarioDescription,
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
export function getRecommendedControlsForGaps(
  responses: InterviewResponses,
  priorityThreats?: string[]
): string[] {
  const allControls = new Set<string>();
  
  // Get response-based recommendations
  const responseControls = generateControlRecommendations(responses);
  responseControls.forEach(c => allControls.add(c));
  
  // Add threat-specific controls for priority threats
  if (priorityThreats) {
    for (const threatId of priorityThreats) {
      const threatControls = THREAT_CONTROL_MAPPING[threatId] || [];
      threatControls.forEach(c => allControls.add(c));
    }
  }
  
  return Array.from(allControls);
}

/**
 * Calculate overall store security posture score
 */
export function calculateOverallSecurityScore(
  responses: InterviewResponses
): { score: number; grade: string; findings: string[] } {
  let totalFactors = 0;
  let securityFactors = 0;
  const findings: string[] = [];
  
  // EAS System
  totalFactors++;
  if (responses.eas_1 === 'yes') {
    securityFactors++;
  } else {
    findings.push('No EAS system installed');
  }
  
  // CCTV System
  totalFactors++;
  if (responses.cctv_1 === 'yes') {
    securityFactors++;
  } else {
    findings.push('No CCTV system installed');
  }
  
  // Intrusion Alarm
  totalFactors++;
  if (responses.physical_5 === 'yes') {
    securityFactors++;
  } else {
    findings.push('No intrusion alarm system');
  }
  
  // Panic Alarms
  totalFactors++;
  if (responses.physical_6 === 'yes') {
    securityFactors++;
  } else {
    findings.push('No panic/duress alarms');
  }
  
  // LP Staff
  totalFactors++;
  if (!responseMatchesIndicator(responses.lp_staff_1, 'no')) {
    securityFactors++;
  } else {
    findings.push('No dedicated loss prevention staff');
  }
  
  // Robbery Training
  totalFactors++;
  if (responses.employee_3 === 'yes') {
    securityFactors++;
  } else {
    findings.push('No robbery response training');
  }
  
  // Cash Controls
  totalFactors++;
  if (responses.cash_2 === 'yes' && responses.cash_7 === 'yes') {
    securityFactors++;
  } else {
    findings.push('Weak cash handling controls');
  }
  
  // Calculate score
  const score = Math.round((securityFactors / totalFactors) * 100);
  
  let grade: string;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';
  
  return { score, grade, findings };
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
  RETAIL_STORE_THREATS,
  THREAT_CONTROL_MAPPING,
};
