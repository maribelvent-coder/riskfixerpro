/**
 * Manufacturing Facility Interview Risk Mapper
 * 
 * Implements the T×V×I calculation pipeline per RiskFixer Manufacturing Framework.
 * Transforms interview questionnaire responses into mathematically-derived risk scenarios.
 * 
 * KEY FEATURES:
 * - 15 manufacturing-specific threats with individual calculation algorithms
 * - Risk factor counting with divisor of 3 for stability
 * - Control recommendations mapped to specific vulnerability gaps
 * - Scenario descriptions with contextual observations
 * - Industry standards integration (ASIS, CFATS, NIST, OSHA)
 * 
 * LAYER INTEGRATION:
 * - Layer 1: Facility Data (interview responses)
 * - Layer 2: Methodology Framework (T×V×I formula)
 * - Layer 3: Industry Standards (ASIS GDL-RA, CFATS)
 * - Layer 4: Threat Intelligence (manufacturing industry statistics)
 * - Layer 5: Control Effectiveness (evidence-based controls)
 * - Layer 6: Scoring Rubrics (risk classification)
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Manufacturing-Framework.md
 * @see RiskFixer-Manufacturing-Questions-With-Polarity.md
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 */

// Note: Database operations removed for schema compatibility
// The route layer should handle database persistence using storage.ts interface

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

export interface SecurityScoreResult {
  score: number;
  grade: string;
  findings: string[];
  strengths: string[];
  categoryScores: Record<string, number>;
}

export interface ControlRecommendation {
  controlId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
}

// ============================================================================
// MANUFACTURING THREAT DEFINITIONS - Layer 4: Threat Intelligence
// ============================================================================

export const MANUFACTURING_THREATS = [
  {
    id: 'industrial_espionage_ip_theft',
    name: 'Industrial Espionage / IP Theft',
    category: 'Intellectual Property',
    description: 'Theft of trade secrets, proprietary processes, formulas, designs, or confidential business information by competitors or foreign entities.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-ESP-001',
  },
  {
    id: 'equipment_sabotage',
    name: 'Equipment Sabotage',
    category: 'Sabotage',
    description: 'Intentional damage or tampering with production equipment, machinery, or control systems to disrupt operations.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-SAB-003',
  },
  {
    id: 'raw_material_theft',
    name: 'Raw Material Theft',
    category: 'Theft',
    description: 'Theft of high-value raw materials, components, or inputs used in manufacturing processes.',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-012',
  },
  {
    id: 'finished_goods_theft',
    name: 'Finished Goods Theft',
    category: 'Theft',
    description: 'Theft of completed products from warehouse, loading areas, or during shipping.',
    typicalLikelihood: 3,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-THF-013',
  },
  {
    id: 'insider_theft_ip_data',
    name: 'Insider Theft - IP/Data',
    category: 'Insider Threat',
    description: 'Data exfiltration or IP theft by employees with authorized access, often via digital means or physical documents.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-INS-002',
  },
  {
    id: 'insider_theft_physical',
    name: 'Insider Theft - Physical Goods',
    category: 'Insider Threat',
    description: 'Theft of materials, tools, or products by employees. FBI estimates 60%+ of manufacturing theft involves insiders.',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-INS-003',
  },
  {
    id: 'workplace_violence_production_floor',
    name: 'Workplace Violence - Production Floor',
    category: 'Workplace Violence',
    description: 'Physical violence, threats, or harassment in the production environment. Higher risk due to tool access and stress.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-WPV-003',
  },
  {
    id: 'contractor_vendor_exploitation',
    name: 'Contractor/Vendor Exploitation',
    category: 'Third Party',
    description: 'Misuse of contractor or vendor access for theft, espionage, or sabotage purposes.',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-VEN-001',
  },
  {
    id: 'hazmat_theft_diversion',
    name: 'Hazardous Material Theft/Diversion',
    category: 'Regulatory',
    description: 'Theft or diversion of hazardous materials subject to CFATS or other security regulations.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-HAZ-001',
  },
  {
    id: 'vandalism_equipment',
    name: 'Vandalism - Equipment',
    category: 'Vandalism',
    description: 'Deliberate damage to production equipment, machinery, or facility property.',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-VAN-003',
  },
  {
    id: 'trespassing_unauthorized_access',
    name: 'Trespassing / Unauthorized Access',
    category: 'Physical Intrusion',
    description: 'Unauthorized individuals gaining entry to the facility through perimeter breach, tailgating, or social engineering.',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-INT-006',
  },
  {
    id: 'production_line_disruption',
    name: 'Production Line Disruption',
    category: 'Operations',
    description: 'Intentional or accidental disruption of production processes causing downtime and revenue loss.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-OPS-001',
  },
  {
    id: 'trade_secret_theft',
    name: 'Trade Secret Theft',
    category: 'Intellectual Property',
    description: 'Theft of proprietary manufacturing processes, formulas, or methods through photography, documents, or digital means.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-ESP-002',
  },
  {
    id: 'theft_tooling_dies_molds',
    name: 'Theft of Tooling, Dies, or Molds',
    category: 'Theft',
    description: 'Theft of specialized tooling, dies, molds, or fixtures used in production. High value and difficult to replace.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-THF-014',
  },
  {
    id: 'counterfeit_parts_infiltration',
    name: 'Counterfeit Parts Infiltration',
    category: 'Supply Chain',
    description: 'Introduction of counterfeit or substandard components into production, causing quality and safety issues.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-SUP-002',
  },
];

// ============================================================================
// THREAT-TO-CONTROL MAPPING - Layer 5: Control Effectiveness
// ============================================================================

export const THREAT_CONTROL_MAPPING: Record<string, string[]> = {
  industrial_espionage_ip_theft: [
    'r_and_d_area_access_control',
    'biometric_access_critical_areas',
    'visitor_nda_procedures',
    'photography_prohibition_enforcement',
    'mobile_device_restrictions',
    'data_loss_prevention',
    'clean_desk_policy',
    'visitor_escort_requirements',
    'non_disclosure_enforcement',
    'exit_interviews_ip_protection',
  ],
  equipment_sabotage: [
    'production_floor_access_control',
    'employee_badge_access_control',
    'cctv_production_floor',
    'equipment_monitoring_system',
    'insider_threat_program',
    'immediate_access_revocation',
    'equipment_lockout_tagout',
    'video_analytics_manufacturing',
    'sabotage_incident_response',
    'security_awareness_training_manufacturing',
  ],
  raw_material_theft: [
    'raw_material_caging',
    'raw_material_tracking_system',
    'cycle_counting_program',
    'cctv_raw_material_storage',
    'two_person_rule_sensitive_areas',
    'employee_background_checks_production',
    'exception_based_reporting',
    'lot_serial_tracking',
    'badge_access_system',
    'exit_bag_checks',
  ],
  finished_goods_theft: [
    'finished_goods_caging',
    'finished_goods_inventory_control',
    'cctv_finished_goods_warehouse',
    'cctv_loading_docks',
    'shipping_receiving_verification',
    'badge_access_system',
    'cycle_counting_program',
    'employee_background_checks_production',
    'exception_based_reporting',
    'video_retention_30_days',
  ],
  insider_theft_ip_data: [
    'data_loss_prevention',
    'insider_threat_program',
    'exit_interviews_ip_protection',
    'clean_desk_policy',
    'mobile_device_restrictions',
    'non_compete_enforcement',
    'network_segmentation_ot_it',
    'employee_background_checks_production',
    'production_data_encryption',
    'immediate_access_revocation',
  ],
  insider_theft_physical: [
    'employee_background_checks_production',
    'insider_threat_program',
    'exit_bag_checks',
    'cctv_production_floor',
    'cycle_counting_program',
    'exception_based_reporting',
    'raw_material_caging',
    'two_person_rule_sensitive_areas',
    'theft_reporting_hotline',
    'video_analytics_manufacturing',
  ],
  workplace_violence_production_floor: [
    'workplace_violence_response_plan',
    'employee_background_checks_production',
    'security_awareness_training_manufacturing',
    'cctv_production_floor',
    'immediate_access_revocation',
    'tool_crib_access_control',
    'emergency_notification_system',
    'law_enforcement_partnership',
    'threat_assessment_team',
    'employee_assistance_program',
  ],
  contractor_vendor_exploitation: [
    'visitor_contractor_management',
    'visitor_escort_requirements',
    'contractor_background_checks',
    'visitor_nda_procedures',
    'temporary_badge_system',
    'maintenance_access_procedures',
    'vendor_security_program',
    'cctv_visitor_areas',
    'photography_prohibition_enforcement',
    'badge_access_system',
  ],
  hazmat_theft_diversion: [
    'hazmat_storage_compliance',
    'cfats_security_plan',
    'hazmat_access_control',
    'hazmat_inventory_tracking',
    'two_person_rule_sensitive_areas',
    'cctv_hazmat_areas',
    'employee_background_checks_production',
    'hazmat_incident_procedures',
    'regulatory_compliance_audit',
    'transportation_security_plan',
  ],
  vandalism_equipment: [
    'perimeter_intrusion_detection',
    'industrial_fencing_8ft_plus',
    'perimeter_lighting_industrial',
    'cctv_perimeter',
    'cctv_production_floor',
    'gate_access_with_guard',
    'after_hours_monitoring',
    'employee_background_checks_production',
    'video_retention_30_days',
    'law_enforcement_partnership',
  ],
  trespassing_unauthorized_access: [
    'industrial_fencing_8ft_plus',
    'gate_access_with_guard',
    'perimeter_intrusion_detection',
    'employee_badge_access_control',
    'visitor_contractor_management',
    'cctv_perimeter',
    'perimeter_lighting_industrial',
    'clear_zone_perimeter',
    'after_hours_monitoring',
    'access_zone_separation',
  ],
  production_line_disruption: [
    'equipment_monitoring_system',
    'production_continuity_plan',
    'equipment_lockout_tagout',
    'cctv_production_floor',
    'sabotage_incident_response',
    'network_segmentation_ot_it',
    'insider_threat_program',
    'redundant_systems',
    'emergency_response_procedures',
    'business_continuity_planning',
  ],
  trade_secret_theft: [
    'photography_prohibition_enforcement',
    'mobile_device_restrictions',
    'visitor_nda_procedures',
    'clean_desk_policy',
    'document_control_system',
    'prototype_security_procedures',
    'visitor_escort_requirements',
    'r_and_d_area_access_control',
    'non_disclosure_enforcement',
    'exit_interviews_ip_protection',
  ],
  theft_tooling_dies_molds: [
    'tool_crib_access_control',
    'tool_tracking_system',
    'asset_tracking_rfid',
    'cctv_tool_room',
    'badge_access_system',
    'two_person_rule_sensitive_areas',
    'employee_background_checks_production',
    'exception_based_reporting',
    'video_retention_30_days',
    'cycle_counting_program',
  ],
  counterfeit_parts_infiltration: [
    'supplier_vetting_program',
    'parts_authentication_procedures',
    'quality_management_system',
    'incoming_inspection_program',
    'lot_serial_tracking',
    'supply_chain_security_audit',
    'vendor_security_program',
    'approved_supplier_list',
    'material_certification_requirements',
    'traceability_system',
  ],
};

// ============================================================================
// QUESTION-TO-THREAT MAPPING - Which questions inform each threat
// ============================================================================

export const QUESTION_THREAT_MAPPING: Record<string, {
  questionIds: string[];
  criticalQuestions: string[];
  controlQuestions: string[];
}> = {
  industrial_espionage_ip_theft: {
    questionIds: ['facility_6', 'facility_6a', 'ip_1', 'ip_1a', 'ip_2', 'ip_3', 'ip_4', 'ip_5', 'ip_6', 'ip_7', 'production_5', 'contractor_2', 'emergency_2'],
    criticalQuestions: ['ip_1a', 'ip_2', 'ip_4', 'ip_5', 'production_5'],
    controlQuestions: ['ip_1a', 'ip_2', 'ip_3', 'ip_4', 'ip_5', 'ip_6', 'ip_7', 'production_5', 'contractor_2'],
  },
  equipment_sabotage: {
    questionIds: ['production_1', 'production_3', 'production_6', 'personnel_3', 'personnel_6', 'surveillance_1', 'surveillance_4', 'surveillance_5', 'emergency_2', 'emergency_5'],
    criticalQuestions: ['production_1', 'production_3', 'personnel_6', 'surveillance_5'],
    controlQuestions: ['production_1', 'production_3', 'surveillance_1', 'surveillance_4', 'surveillance_5', 'personnel_6', 'emergency_5'],
  },
  raw_material_theft: {
    questionIds: ['facility_7', 'inventory_1', 'inventory_1a', 'inventory_2', 'inventory_3', 'inventory_4', 'inventory_5', 'inventory_6', 'inventory_7', 'personnel_1', 'personnel_5', 'emergency_2'],
    criticalQuestions: ['inventory_1', 'inventory_3', 'inventory_7'],
    controlQuestions: ['inventory_1', 'inventory_2', 'inventory_3', 'inventory_4', 'inventory_5', 'inventory_6', 'inventory_7', 'personnel_5'],
  },
  finished_goods_theft: {
    questionIds: ['shipping_1', 'shipping_2', 'shipping_3', 'shipping_4', 'shipping_5', 'shipping_6', 'surveillance_1', 'personnel_1', 'emergency_2'],
    criticalQuestions: ['shipping_2', 'shipping_3', 'shipping_4'],
    controlQuestions: ['shipping_1', 'shipping_2', 'shipping_3', 'shipping_4', 'shipping_5', 'shipping_6'],
  },
  insider_theft_ip_data: {
    questionIds: ['facility_6', 'ip_5', 'ip_6', 'ip_7', 'personnel_1', 'personnel_3', 'personnel_6', 'personnel_7', 'emergency_2', 'emergency_4'],
    criticalQuestions: ['ip_5', 'ip_7', 'personnel_3', 'personnel_6'],
    controlQuestions: ['ip_5', 'ip_6', 'ip_7', 'personnel_3', 'personnel_6', 'personnel_7'],
  },
  insider_theft_physical: {
    questionIds: ['inventory_1', 'inventory_3', 'inventory_6', 'inventory_7', 'personnel_1', 'personnel_3', 'personnel_5', 'production_1', 'production_8', 'surveillance_1', 'emergency_2'],
    criticalQuestions: ['personnel_1', 'personnel_3', 'personnel_5', 'production_1'],
    controlQuestions: ['production_1', 'inventory_6', 'inventory_7', 'personnel_1', 'personnel_3', 'personnel_5', 'surveillance_1'],
  },
  workplace_violence_production_floor: {
    questionIds: ['personnel_1', 'personnel_3', 'personnel_4', 'personnel_6', 'emergency_1', 'emergency_2', 'surveillance_1'],
    criticalQuestions: ['emergency_1', 'personnel_6'],
    controlQuestions: ['emergency_1', 'personnel_1', 'personnel_4', 'personnel_6', 'surveillance_1'],
  },
  contractor_vendor_exploitation: {
    questionIds: ['contractor_1', 'contractor_2', 'contractor_3', 'contractor_4', 'contractor_5', 'ip_2', 'perimeter_2', 'emergency_2'],
    criticalQuestions: ['contractor_1', 'contractor_2', 'ip_2'],
    controlQuestions: ['contractor_1', 'contractor_2', 'contractor_3', 'contractor_4', 'contractor_5', 'ip_2'],
  },
  hazmat_theft_diversion: {
    questionIds: ['facility_8', 'facility_8a', 'personnel_1', 'inventory_3', 'inventory_7', 'emergency_2'],
    criticalQuestions: ['facility_8a'],
    controlQuestions: ['facility_8a', 'inventory_3', 'inventory_7', 'personnel_1'],
  },
  vandalism_equipment: {
    questionIds: ['perimeter_1', 'perimeter_3', 'perimeter_4', 'perimeter_5', 'perimeter_6', 'surveillance_1', 'emergency_2'],
    criticalQuestions: ['perimeter_1', 'perimeter_3', 'surveillance_1'],
    controlQuestions: ['perimeter_1', 'perimeter_3', 'perimeter_4', 'perimeter_5', 'perimeter_6', 'surveillance_1'],
  },
  trespassing_unauthorized_access: {
    questionIds: ['perimeter_1', 'perimeter_2', 'perimeter_3', 'perimeter_4', 'perimeter_5', 'perimeter_6', 'perimeter_7', 'production_1', 'emergency_2'],
    criticalQuestions: ['perimeter_1', 'perimeter_2', 'production_1'],
    controlQuestions: ['perimeter_1', 'perimeter_2', 'perimeter_3', 'perimeter_4', 'perimeter_5', 'perimeter_6', 'perimeter_7', 'production_1'],
  },
  production_line_disruption: {
    questionIds: ['production_3', 'surveillance_5', 'emergency_2', 'emergency_3', 'emergency_5'],
    criticalQuestions: ['production_3', 'emergency_3', 'emergency_5'],
    controlQuestions: ['production_3', 'surveillance_5', 'emergency_3', 'emergency_5'],
  },
  trade_secret_theft: {
    questionIds: ['facility_6', 'ip_2', 'ip_3', 'ip_4', 'production_5', 'contractor_2', 'emergency_2', 'emergency_4'],
    criticalQuestions: ['ip_2', 'ip_3', 'ip_4', 'production_5'],
    controlQuestions: ['ip_2', 'ip_3', 'ip_4', 'production_5', 'contractor_2'],
  },
  theft_tooling_dies_molds: {
    questionIds: ['production_4', 'production_4a', 'surveillance_1', 'personnel_1', 'emergency_2'],
    criticalQuestions: ['production_4', 'production_4a'],
    controlQuestions: ['production_4', 'production_4a', 'surveillance_1'],
  },
  counterfeit_parts_infiltration: {
    questionIds: ['contractor_3', 'inventory_4', 'contractor_5', 'emergency_2'],
    criticalQuestions: ['contractor_3', 'inventory_4'],
    controlQuestions: ['contractor_3', 'inventory_4', 'contractor_5'],
  },
};

/**
 * Question-level risk weights from questionnaire
 * Maps questionId -> riskWeight for calculating weighted vulnerability
 */
const QUESTION_RISK_WEIGHTS: Record<string, number> = {
  // Section 1: Facility Profile (mostly context)
  facility_1: 0, facility_2: 0, facility_3: 0, facility_4: 0, facility_5: 0,
  facility_6: 0, facility_6a: 0, facility_7: 0, facility_7a: 0, facility_8: 0,
  facility_8a: 1,
  
  // Section 2: Perimeter Security
  perimeter_1: 2, perimeter_2: 2, perimeter_3: 1, perimeter_4: 1, perimeter_5: 1,
  perimeter_5a: 1, perimeter_6: 1, perimeter_7: 1,
  
  // Section 3: Production Area Security
  production_1: 2, production_2: 1, production_2a: 1, production_3: 1, production_4: 1,
  production_4a: 1, production_5: 2, production_6: 1, production_7: 1, production_8: 1,
  
  // Section 4: IP Protection
  ip_1: 0, ip_1a: 2, ip_2: 2, ip_3: 1, ip_4: 2, ip_5: 2, ip_6: 1, ip_7: 1,
  
  // Section 5: Inventory Control
  inventory_1: 2, inventory_1a: 1, inventory_2: 1, inventory_3: 2, inventory_4: 1,
  inventory_5: 1, inventory_6: 1, inventory_7: 1,
  
  // Section 6: Shipping Security
  shipping_1: 1, shipping_2: 1, shipping_3: 2, shipping_4: 1, shipping_5: 1, shipping_6: 1,
  
  // Section 7: Personnel Security
  personnel_1: 2, personnel_2: 1, personnel_3: 2, personnel_4: 1, personnel_5: 1,
  personnel_6: 2, personnel_7: 1,
  
  // Section 8: Contractor Management
  contractor_1: 1, contractor_2: 2, contractor_3: 1, contractor_4: 1, contractor_5: 1,
  
  // Section 9: Surveillance
  surveillance_1: 2, surveillance_2: 1, surveillance_3: 1, surveillance_4: 1, surveillance_5: 1,
  
  // Section 10: Emergency Response
  emergency_1: 1, emergency_2: 1, emergency_3: 1, emergency_4: 1, emergency_5: 1, emergency_6: 1,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if response is affirmative (yes)
 */
function isYesResponse(response: any): boolean {
  if (!response) return false;
  const normalized = String(response).toLowerCase().trim();
  return normalized === 'yes' || normalized === 'true' || normalized === '1';
}

/**
 * Check if response is negative (no)
 */
function isNoResponse(response: any): boolean {
  if (!response) return false;
  const normalized = String(response).toLowerCase().trim();
  return normalized === 'no' || normalized === 'false' || normalized === '0';
}

/**
 * Check if rating is low (1-2 on 5-point scale)
 */
function isLowRating(response: any): boolean {
  if (!response) return false;
  const rating = parseInt(response, 10);
  return !isNaN(rating) && rating <= 2;
}

/**
 * Check if response contains indicator substring (case-insensitive)
 */
function responseMatchesIndicator(response: any, indicator: string): boolean {
  if (!response) return false;
  return String(response).toLowerCase().includes(indicator.toLowerCase());
}

/**
 * Classify risk level based on inherent risk score (T×V×I)
 */
function classifyRiskLevel(inherentRisk: number): 'critical' | 'high' | 'medium' | 'low' {
  // Normalize to 100-point scale for comparison
  const normalizedScore = (inherentRisk / 125) * 100;
  
  if (normalizedScore >= 60) return 'critical';  // 75+ on 1-125 scale
  if (normalizedScore >= 40) return 'high';      // 50-74 on 1-125 scale
  if (normalizedScore >= 25) return 'medium';    // 31-49 on 1-125 scale
  return 'low';                                   // 1-30 on 1-125 scale
}

/**
 * Get the threat definition by ID
 */
function getThreatById(threatId: string) {
  return MANUFACTURING_THREATS.find(t => t.id === threatId);
}

// ============================================================================
// VULNERABILITY CALCULATION - Layer 6: Scoring Rubrics
// ============================================================================

/**
 * Calculate vulnerability score (1-5) based on interview responses
 * Higher score = more vulnerable
 * 
 * Manufacturing uses divisor of 3 for stability across control domains.
 */
export function calculateVulnerabilityFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let vulnerabilityScore = 3; // Start at baseline (moderate)
  let riskFactorCount = 0;

  // =========================================================================
  // PERIMETER & ACCESS SECURITY ANALYSIS
  // =========================================================================
  
  // Weak perimeter fencing - CRITICAL for unauthorized access
  if (responseMatchesIndicator(responses.perimeter_1, 'under 6 feet') ||
      responseMatchesIndicator(responses.perimeter_1, 'no perimeter fence')) {
    riskFactorCount += 2;
  }
  
  // No staffed security gate
  if (isNoResponse(responses.perimeter_2)) {
    riskFactorCount += 2;
  }
  
  // No perimeter intrusion detection
  if (isNoResponse(responses.perimeter_3)) {
    riskFactorCount += 1;
  }
  
  // Poor perimeter lighting
  if (isLowRating(responses.perimeter_4)) {
    riskFactorCount += 1;
  }
  
  // No perimeter CCTV
  if (isNoResponse(responses.perimeter_5)) {
    riskFactorCount += 1;
  }
  
  // Poor perimeter CCTV coverage
  if (responseMatchesIndicator(responses.perimeter_5a, '0-25%') ||
      responseMatchesIndicator(responses.perimeter_5a, '26-50%')) {
    riskFactorCount += 1;
  }
  
  // Rare/no perimeter patrols
  if (responseMatchesIndicator(responses.perimeter_6, 'infrequently') ||
      responseMatchesIndicator(responses.perimeter_6, 'never')) {
    riskFactorCount += 1;
  }
  
  // No vehicle inspection
  if (isNoResponse(responses.perimeter_7)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // PRODUCTION AREA SECURITY ANALYSIS
  // =========================================================================
  
  // No production floor access control - CRITICAL
  if (isNoResponse(responses.production_1)) {
    riskFactorCount += 2;
  }
  
  // No production floor CCTV
  if (isNoResponse(responses.production_2)) {
    riskFactorCount += 1;
  }
  
  // Poor production CCTV coverage
  if (responseMatchesIndicator(responses.production_2a, '0-25%') ||
      responseMatchesIndicator(responses.production_2a, '26-50%')) {
    riskFactorCount += 1;
  }
  
  // Equipment not secured
  if (isNoResponse(responses.production_3)) {
    riskFactorCount += 1;
  }
  
  // No tool control system
  if (isNoResponse(responses.production_4)) {
    riskFactorCount += 1;
  }
  
  // No formal tool tracking
  if (responseMatchesIndicator(responses.production_4a, 'no formal tracking')) {
    riskFactorCount += 1;
  }
  
  // No photography prohibition - CRITICAL for IP
  if (isNoResponse(responses.production_5)) {
    riskFactorCount += 2;
  }
  
  // Minimal night/weekend supervision
  if (responseMatchesIndicator(responses.production_6, 'minimal supervision')) {
    riskFactorCount += 1;
  }
  
  // No WIP inventory procedures
  if (isNoResponse(responses.production_7)) {
    riskFactorCount += 1;
  }
  
  // No scrap disposal monitoring
  if (isNoResponse(responses.production_8)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // IP PROTECTION ANALYSIS
  // =========================================================================
  
  // Weak R&D access control - CRITICAL for espionage
  if (responseMatchesIndicator(responses.ip_1a, 'key/lock access') ||
      responseMatchesIndicator(responses.ip_1a, 'no formal access control')) {
    riskFactorCount += 2;
  }
  
  // No visitor NDA requirement - CRITICAL
  if (isNoResponse(responses.ip_2)) {
    riskFactorCount += 2;
  }
  
  // No clean desk policy
  if (isNoResponse(responses.ip_3)) {
    riskFactorCount += 1;
  }
  
  // No prototype security - CRITICAL
  if (isNoResponse(responses.ip_4)) {
    riskFactorCount += 2;
  }
  
  // No DLP measures - CRITICAL
  if (isNoResponse(responses.ip_5)) {
    riskFactorCount += 2;
  }
  
  // No mobile device restrictions
  if (isNoResponse(responses.ip_6)) {
    riskFactorCount += 1;
  }
  
  // No exit interview IP procedures
  if (isNoResponse(responses.ip_7)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // INVENTORY CONTROL ANALYSIS
  // =========================================================================
  
  // No automated inventory tracking - CRITICAL
  if (isNoResponse(responses.inventory_1)) {
    riskFactorCount += 2;
  }
  
  // Weak tracking system
  if (responseMatchesIndicator(responses.inventory_1a, 'manual spreadsheet') ||
      responseMatchesIndicator(responses.inventory_1a, 'no formal system')) {
    riskFactorCount += 1;
  }
  
  // Infrequent cycle counting
  if (responseMatchesIndicator(responses.inventory_2, 'annually') ||
      responseMatchesIndicator(responses.inventory_2, 'less frequently')) {
    riskFactorCount += 1;
  }
  
  // No high-value material caging - CRITICAL
  if (isNoResponse(responses.inventory_3)) {
    riskFactorCount += 2;
  }
  
  // No lot/serial tracking
  if (isNoResponse(responses.inventory_4)) {
    riskFactorCount += 1;
  }
  
  // No raw material storage CCTV
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
  // SHIPPING & FINISHED GOODS ANALYSIS
  // =========================================================================
  
  // No separate finished goods warehouse
  if (isNoResponse(responses.shipping_1)) {
    riskFactorCount += 1;
  }
  
  // No FG warehouse badge access
  if (isNoResponse(responses.shipping_2)) {
    riskFactorCount += 1;
  }
  
  // No manifest verification - CRITICAL
  if (isNoResponse(responses.shipping_3)) {
    riskFactorCount += 2;
  }
  
  // No loading dock CCTV
  if (isNoResponse(responses.shipping_4)) {
    riskFactorCount += 1;
  }
  
  // Infrequent FG inventory counts
  if (responseMatchesIndicator(responses.shipping_5, 'quarterly') ||
      responseMatchesIndicator(responses.shipping_5, 'annually')) {
    riskFactorCount += 1;
  }
  
  // Drivers move freely during loading
  if (responseMatchesIndicator(responses.shipping_6, 'move freely') ||
      responseMatchesIndicator(responses.shipping_6, 'no formal policy')) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // PERSONNEL SECURITY ANALYSIS
  // =========================================================================
  
  // Weak background checks - CRITICAL for insider threat
  if (responseMatchesIndicator(responses.personnel_1, 'no background checks') ||
      responseMatchesIndicator(responses.personnel_1, 'basic checks only')) {
    riskFactorCount += 2;
  }
  
  // No contractor background checks
  if (isNoResponse(responses.personnel_2)) {
    riskFactorCount += 1;
  }
  
  // No insider threat program - CRITICAL
  if (isNoResponse(responses.personnel_3)) {
    riskFactorCount += 2;
  }
  
  // No security awareness training
  if (isNoResponse(responses.personnel_4)) {
    riskFactorCount += 1;
  }
  
  // No exit bag checks
  if (isNoResponse(responses.personnel_5)) {
    riskFactorCount += 1;
  }
  
  // No immediate access revocation - CRITICAL
  if (isNoResponse(responses.personnel_6)) {
    riskFactorCount += 2;
  }
  
  // No NDA/non-compete agreements
  if (isNoResponse(responses.personnel_7)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // CONTRACTOR MANAGEMENT ANALYSIS
  // =========================================================================
  
  // No contractor sign-in
  if (isNoResponse(responses.contractor_1)) {
    riskFactorCount += 1;
  }
  
  // Contractors not escorted - CRITICAL
  if (responseMatchesIndicator(responses.contractor_2, 'not escorted') ||
      responseMatchesIndicator(responses.contractor_2, 'varies')) {
    riskFactorCount += 2;
  }
  
  // No supplier vetting
  if (isNoResponse(responses.contractor_3)) {
    riskFactorCount += 1;
  }
  
  // No maintenance access logging
  if (isNoResponse(responses.contractor_4)) {
    riskFactorCount += 1;
  }
  
  // No vendor security program
  if (isNoResponse(responses.contractor_5)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // SURVEILLANCE ANALYSIS
  // =========================================================================
  
  // Poor overall CCTV coverage - CRITICAL
  if (responseMatchesIndicator(responses.surveillance_1, '0-25%') ||
      responseMatchesIndicator(responses.surveillance_1, '26-50%')) {
    riskFactorCount += 2;
  }
  
  // Short video retention
  if (responseMatchesIndicator(responses.surveillance_2, 'less than 7 days') ||
      responseMatchesIndicator(responses.surveillance_2, '7-14 days')) {
    riskFactorCount += 1;
  }
  
  // No real-time monitoring
  if (isNoResponse(responses.surveillance_3)) {
    riskFactorCount += 1;
  }
  
  // No video analytics
  if (isNoResponse(responses.surveillance_4)) {
    riskFactorCount += 1;
  }
  
  // No equipment sensors/alarms
  if (isNoResponse(responses.surveillance_5)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // EMERGENCY RESPONSE ANALYSIS
  // =========================================================================
  
  // No workplace violence plan
  if (isNoResponse(responses.emergency_1)) {
    riskFactorCount += 1;
  }
  
  // No production continuity plan
  if (isNoResponse(responses.emergency_3)) {
    riskFactorCount += 1;
  }
  
  // No IP theft response procedures
  if (isNoResponse(responses.emergency_4)) {
    riskFactorCount += 1;
  }
  
  // No sabotage response plan
  if (isNoResponse(responses.emergency_5)) {
    riskFactorCount += 1;
  }
  
  // No incident documentation
  if (isNoResponse(responses.emergency_6)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // CALCULATE FINAL VULNERABILITY SCORE
  // =========================================================================
  
  // Apply divisor of 3 for manufacturing (same as warehouse/office)
  const vulnerabilityIncrease = Math.floor(riskFactorCount / 3);
  vulnerabilityScore = Math.min(5, vulnerabilityScore + vulnerabilityIncrease);

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
  const threat = getThreatById(threatId);
  let likelihood = threat?.typicalLikelihood || 2; // Start with typical baseline

  // =========================================================================
  // FACTOR 1: INCIDENT HISTORY (most important)
  // =========================================================================
  
  // Check incident history checklist for relevant incidents
  const incidentHistory = responses.emergency_2 || [];
  
  if (Array.isArray(incidentHistory)) {
    // Raw material theft history
    if (incidentHistory.includes('Theft of raw materials')) {
      if (threatId === 'raw_material_theft') likelihood += 2;
      if (threatId === 'insider_theft_physical') likelihood += 1;
    }
    
    // Finished goods theft history
    if (incidentHistory.includes('Theft of finished goods')) {
      if (threatId === 'finished_goods_theft') likelihood += 2;
      if (threatId === 'insider_theft_physical') likelihood += 1;
    }
    
    // Employee theft history
    if (incidentHistory.includes('Employee theft')) {
      if (threatId === 'insider_theft_physical') likelihood += 2;
      if (threatId === 'insider_theft_ip_data') likelihood += 1;
    }
    
    // IP theft/espionage history
    if (incidentHistory.includes('IP theft or suspected espionage')) {
      if (threatId === 'industrial_espionage_ip_theft') likelihood += 2;
      if (threatId === 'trade_secret_theft') likelihood += 2;
      if (threatId === 'insider_theft_ip_data') likelihood += 2;
    }
    
    // Sabotage history
    if (incidentHistory.includes('Equipment sabotage or tampering')) {
      if (threatId === 'equipment_sabotage') likelihood += 2;
      if (threatId === 'production_line_disruption') likelihood += 1;
    }
    
    // Workplace violence history
    if (incidentHistory.includes('Workplace violence incident')) {
      if (threatId === 'workplace_violence_production_floor') likelihood += 2;
    }
    
    // Unauthorized access history
    if (incidentHistory.includes('Unauthorized access or trespassing')) {
      if (threatId === 'trespassing_unauthorized_access') likelihood += 2;
      if (threatId === 'vandalism_equipment') likelihood += 1;
    }
    
    // Vandalism history
    if (incidentHistory.includes('Vandalism')) {
      if (threatId === 'vandalism_equipment') likelihood += 2;
    }
    
    // Counterfeit parts history
    if (incidentHistory.includes('Counterfeit parts discovered')) {
      if (threatId === 'counterfeit_parts_infiltration') likelihood += 2;
    }
  }

  // =========================================================================
  // FACTOR 2: FACILITY PROFILE & EXPOSURE
  // =========================================================================
  
  // IP/trade secrets present - major espionage target
  if (isYesResponse(responses.facility_6)) {
    if (threatId === 'industrial_espionage_ip_theft' || 
        threatId === 'trade_secret_theft' ||
        threatId === 'insider_theft_ip_data') {
      likelihood += 1;
    }
    
    // Check IP types for high-value targets
    const ipTypes = responses.facility_6a || [];
    if (Array.isArray(ipTypes)) {
      if (ipTypes.includes('Trade secret processes or methods') ||
          ipTypes.includes('Proprietary formulas or chemical compositions')) {
        likelihood += 1; // Additional for highest-value IP
      }
    }
  }
  
  // High-value materials - theft target
  if (isYesResponse(responses.facility_7)) {
    if (threatId === 'raw_material_theft' || 
        threatId === 'finished_goods_theft' ||
        threatId === 'insider_theft_physical') {
      likelihood += 1;
    }
    
    // Check material types
    const materialTypes = responses.facility_7a || [];
    if (Array.isArray(materialTypes)) {
      if (materialTypes.includes('Precious metals (gold, silver, platinum)') ||
          materialTypes.includes('Pharmaceuticals or active ingredients') ||
          materialTypes.includes('Electronics components or assemblies')) {
        likelihood += 1; // Additional for highest-target materials
      }
    }
  }
  
  // Hazmat handling - regulatory and theft concerns
  if (isYesResponse(responses.facility_8)) {
    if (threatId === 'hazmat_theft_diversion') {
      likelihood += 2;
    }
    // High CFATS tier
    if (responseMatchesIndicator(responses.facility_8a, 'tier 1') ||
        responseMatchesIndicator(responses.facility_8a, 'tier 2')) {
      likelihood += 1;
    }
  }
  
  // High production value
  if (responseMatchesIndicator(responses.facility_3, 'over $500 million') ||
      responseMatchesIndicator(responses.facility_3, '$100 million')) {
    if (threatId === 'industrial_espionage_ip_theft' || 
        threatId === 'finished_goods_theft') {
      likelihood += 1;
    }
  }
  
  // Large workforce - harder insider threat detection
  if (responseMatchesIndicator(responses.facility_5, 'over 500') ||
      responseMatchesIndicator(responses.facility_5, '301-500')) {
    if (threatId === 'insider_theft_physical' || 
        threatId === 'insider_theft_ip_data') {
      likelihood += 1;
    }
  }
  
  // 24/7 operations - more exposure windows
  if (responseMatchesIndicator(responses.facility_4, '3 shifts') ||
      responseMatchesIndicator(responses.facility_4, '24/7')) {
    if (threatId === 'insider_theft_physical' || 
        threatId === 'equipment_sabotage') {
      likelihood += 1;
    }
    // But reduces after-hours intrusion risk
    if (threatId === 'trespassing_unauthorized_access' ||
        threatId === 'vandalism_equipment') {
      likelihood -= 1;
    }
  }

  // =========================================================================
  // FACTOR 3: CONTROL GAPS (increases opportunity)
  // =========================================================================
  
  // Weak perimeter = easier unauthorized access
  if (responseMatchesIndicator(responses.perimeter_1, 'no perimeter fence')) {
    if (threatId === 'trespassing_unauthorized_access' || 
        threatId === 'vandalism_equipment') {
      likelihood += 1;
    }
  }
  
  // Open vehicle access
  if (isNoResponse(responses.perimeter_2)) {
    if (threatId === 'trespassing_unauthorized_access' ||
        threatId === 'contractor_vendor_exploitation') {
      likelihood += 1;
    }
  }
  
  // No production floor access control
  if (isNoResponse(responses.production_1)) {
    if (threatId === 'insider_theft_physical' ||
        threatId === 'equipment_sabotage') {
      likelihood += 1;
    }
  }
  
  // No photography prohibition
  if (isNoResponse(responses.production_5)) {
    if (threatId === 'industrial_espionage_ip_theft' ||
        threatId === 'trade_secret_theft') {
      likelihood += 1;
    }
  }
  
  // Contractors not escorted
  if (responseMatchesIndicator(responses.contractor_2, 'not escorted')) {
    if (threatId === 'contractor_vendor_exploitation' ||
        threatId === 'industrial_espionage_ip_theft') {
      likelihood += 1;
    }
  }
  
  // No supplier vetting
  if (isNoResponse(responses.contractor_3)) {
    if (threatId === 'counterfeit_parts_infiltration') {
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
  // FACTOR 1: PRODUCTION VALUE
  // =========================================================================
  
  const productionValue = responses.facility_3 || '';
  if (responseMatchesIndicator(productionValue, 'over $500 million')) {
    impact += 2;
  } else if (responseMatchesIndicator(productionValue, '$100 million - $500 million')) {
    impact += 2;
  } else if (responseMatchesIndicator(productionValue, '$25 million - $100 million')) {
    impact += 1;
  } else if (responseMatchesIndicator(productionValue, '$5 million - $25 million')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 2: INTELLECTUAL PROPERTY VALUE
  // =========================================================================
  
  if (isYesResponse(responses.facility_6)) {
    // IP present increases impact of espionage threats
    if (threatId === 'industrial_espionage_ip_theft' ||
        threatId === 'trade_secret_theft' ||
        threatId === 'insider_theft_ip_data') {
      impact += 1;
    }
    
    // Check IP types for highest-value targets
    const ipTypes = responses.facility_6a || [];
    if (Array.isArray(ipTypes)) {
      if (ipTypes.includes('Trade secret processes or methods') ||
          ipTypes.includes('Proprietary formulas or chemical compositions') ||
          ipTypes.includes('Patented manufacturing processes')) {
        impact += 1; // Additional for highest-value IP
      }
    }
  }

  // =========================================================================
  // FACTOR 3: HIGH-VALUE MATERIALS
  // =========================================================================
  
  if (isYesResponse(responses.facility_7)) {
    // High-value materials increase theft impact
    if (threatId === 'raw_material_theft' ||
        threatId === 'finished_goods_theft' ||
        threatId === 'insider_theft_physical') {
      impact += 1;
    }
    
    // Check material types
    const materialTypes = responses.facility_7a || [];
    if (Array.isArray(materialTypes)) {
      if (materialTypes.includes('Precious metals (gold, silver, platinum)') ||
          materialTypes.includes('Pharmaceuticals or active ingredients')) {
        impact += 1;
      }
    }
  }

  // =========================================================================
  // FACTOR 4: EMPLOYEE COUNT (operational impact)
  // =========================================================================
  
  const employeeResponse = responses.facility_5 || '';
  if (responseMatchesIndicator(employeeResponse, 'over 500')) {
    impact += 1;
  } else if (responseMatchesIndicator(employeeResponse, '301-500')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 5: MANUFACTURING TYPE (business criticality)
  // =========================================================================
  
  const manufacturingType = responses.facility_1 || '';
  
  // Process manufacturing - higher disruption impact
  if (responseMatchesIndicator(manufacturingType, 'process manufacturing')) {
    if (threatId === 'production_line_disruption' ||
        threatId === 'equipment_sabotage') {
      impact += 1;
    }
  }
  
  // Electronics/pharma - higher regulatory/quality impact
  if (responseMatchesIndicator(manufacturingType, 'electronics') ||
      responseMatchesIndicator(manufacturingType, 'pharmaceuticals')) {
    if (threatId === 'counterfeit_parts_infiltration') {
      impact += 1;
    }
  }

  // =========================================================================
  // FACTOR 6: REGULATORY EXPOSURE
  // =========================================================================
  
  // CFATS facilities have higher regulatory impact
  if (isYesResponse(responses.facility_8)) {
    if (threatId === 'hazmat_theft_diversion') {
      impact = 5; // Maximum regulatory impact
    }
  }

  // =========================================================================
  // THREAT-SPECIFIC IMPACT OVERRIDES
  // =========================================================================
  
  // Industrial espionage - Always high impact (competitive damage)
  if (threatId === 'industrial_espionage_ip_theft') {
    impact = Math.max(impact, 4);
  }
  
  // Trade secret theft - Always high impact
  if (threatId === 'trade_secret_theft') {
    impact = Math.max(impact, 4);
  }
  
  // Equipment sabotage - Production downtime impact
  if (threatId === 'equipment_sabotage') {
    impact = Math.max(impact, 4);
  }
  
  // Workplace violence - Life safety always critical
  if (threatId === 'workplace_violence_production_floor') {
    impact = Math.max(impact, 4);
  }
  
  // Hazmat incidents - Regulatory and safety critical
  if (threatId === 'hazmat_theft_diversion') {
    impact = Math.max(impact, 5);
  }
  
  // Production disruption - Direct revenue impact
  if (threatId === 'production_line_disruption') {
    impact = Math.max(impact, 4);
  }

  // Cap at 5
  return Math.max(1, Math.min(5, impact));
}

// ============================================================================
// CONTROL RECOMMENDATION ENGINE
// ============================================================================

/**
 * Generate control recommendations based on interview responses
 * Returns array of control IDs that address identified gaps
 */
export function generateControlRecommendations(
  responses: InterviewResponses,
  threatId?: string
): string[] {
  const recommendations = new Set<string>();

  // =========================================================================
  // PERIMETER SECURITY CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.perimeter_1, 'under 6 feet') ||
      responseMatchesIndicator(responses.perimeter_1, 'no perimeter fence')) {
    recommendations.add('industrial_fencing_8ft_plus');
    recommendations.add('clear_zone_perimeter');
  }
  
  if (isNoResponse(responses.perimeter_2)) {
    recommendations.add('gate_access_with_guard');
  }
  
  if (isNoResponse(responses.perimeter_3)) {
    recommendations.add('perimeter_intrusion_detection');
  }
  
  if (isLowRating(responses.perimeter_4)) {
    recommendations.add('perimeter_lighting_industrial');
  }
  
  if (isNoResponse(responses.perimeter_5)) {
    recommendations.add('cctv_perimeter');
  }
  
  if (isNoResponse(responses.perimeter_7)) {
    recommendations.add('vehicle_inspection_procedures');
  }

  // =========================================================================
  // PRODUCTION AREA CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.production_1)) {
    recommendations.add('employee_badge_access_control');
    recommendations.add('production_floor_access_control');
  }
  
  if (isNoResponse(responses.production_2)) {
    recommendations.add('cctv_production_floor');
  }
  
  if (isNoResponse(responses.production_3)) {
    recommendations.add('equipment_lockout_tagout');
  }
  
  if (isNoResponse(responses.production_4)) {
    recommendations.add('tool_crib_access_control');
  }
  
  if (responseMatchesIndicator(responses.production_4a, 'no formal tracking')) {
    recommendations.add('tool_tracking_system');
    recommendations.add('asset_tracking_rfid');
  }
  
  if (isNoResponse(responses.production_5)) {
    recommendations.add('photography_prohibition_enforcement');
    recommendations.add('mobile_device_restrictions');
  }
  
  if (responseMatchesIndicator(responses.production_6, 'minimal supervision')) {
    recommendations.add('after_hours_monitoring');
  }
  
  if (isNoResponse(responses.production_8)) {
    recommendations.add('scrap_disposal_procedures');
  }

  // =========================================================================
  // IP PROTECTION CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.ip_1a, 'key/lock access') ||
      responseMatchesIndicator(responses.ip_1a, 'no formal access control')) {
    recommendations.add('r_and_d_area_access_control');
    recommendations.add('biometric_access_critical_areas');
  }
  
  if (isNoResponse(responses.ip_2)) {
    recommendations.add('visitor_nda_procedures');
    recommendations.add('non_disclosure_enforcement');
  }
  
  if (isNoResponse(responses.ip_3)) {
    recommendations.add('clean_desk_policy');
  }
  
  if (isNoResponse(responses.ip_4)) {
    recommendations.add('prototype_security_procedures');
  }
  
  if (isNoResponse(responses.ip_5)) {
    recommendations.add('data_loss_prevention');
    recommendations.add('production_data_encryption');
  }
  
  if (isNoResponse(responses.ip_6)) {
    recommendations.add('mobile_device_restrictions');
  }
  
  if (isNoResponse(responses.ip_7)) {
    recommendations.add('exit_interviews_ip_protection');
  }

  // =========================================================================
  // INVENTORY CONTROL CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.inventory_1)) {
    recommendations.add('raw_material_tracking_system');
    recommendations.add('asset_tracking_rfid');
  }
  
  if (responseMatchesIndicator(responses.inventory_1a, 'manual spreadsheet') ||
      responseMatchesIndicator(responses.inventory_1a, 'no formal system')) {
    recommendations.add('manufacturing_execution_system');
  }
  
  if (responseMatchesIndicator(responses.inventory_2, 'annually')) {
    recommendations.add('cycle_counting_program');
  }
  
  if (isNoResponse(responses.inventory_3)) {
    recommendations.add('raw_material_caging');
  }
  
  if (isNoResponse(responses.inventory_4)) {
    recommendations.add('bill_of_materials_tracking');
  }
  
  if (isNoResponse(responses.inventory_5)) {
    recommendations.add('cctv_raw_material_storage');
  }
  
  if (isNoResponse(responses.inventory_6)) {
    recommendations.add('material_reconciliation');
  }
  
  if (isNoResponse(responses.inventory_7)) {
    recommendations.add('two_person_rule_sensitive_areas');
  }

  // =========================================================================
  // SHIPPING & FINISHED GOODS CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.shipping_1)) {
    recommendations.add('finished_goods_caging');
  }
  
  if (isNoResponse(responses.shipping_2)) {
    recommendations.add('finished_goods_inventory_control');
    recommendations.add('badge_access_system');
  }
  
  if (isNoResponse(responses.shipping_3)) {
    recommendations.add('shipping_receiving_verification');
  }
  
  if (isNoResponse(responses.shipping_4)) {
    recommendations.add('cctv_loading_docks');
  }
  
  if (responseMatchesIndicator(responses.shipping_5, 'quarterly') ||
      responseMatchesIndicator(responses.shipping_5, 'annually')) {
    recommendations.add('cycle_counting_program');
  }
  
  if (responseMatchesIndicator(responses.shipping_6, 'move freely') ||
      responseMatchesIndicator(responses.shipping_6, 'no formal policy')) {
    recommendations.add('driver_waiting_area');
    recommendations.add('dock_access_control');
  }

  // =========================================================================
  // PERSONNEL SECURITY CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.personnel_1, 'no background checks') ||
      responseMatchesIndicator(responses.personnel_1, 'basic checks only')) {
    recommendations.add('employee_background_checks_production');
  }
  
  if (isNoResponse(responses.personnel_2)) {
    recommendations.add('contractor_background_checks');
  }
  
  if (isNoResponse(responses.personnel_3)) {
    recommendations.add('insider_threat_program');
  }
  
  if (isNoResponse(responses.personnel_4)) {
    recommendations.add('security_awareness_training_manufacturing');
  }
  
  if (isNoResponse(responses.personnel_5)) {
    recommendations.add('exit_bag_checks');
  }
  
  if (isNoResponse(responses.personnel_6)) {
    recommendations.add('immediate_access_revocation');
  }
  
  if (isNoResponse(responses.personnel_7)) {
    recommendations.add('non_compete_enforcement');
  }

  // =========================================================================
  // CONTRACTOR MANAGEMENT CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.contractor_1)) {
    recommendations.add('visitor_contractor_management');
  }
  
  if (responseMatchesIndicator(responses.contractor_2, 'not escorted') ||
      responseMatchesIndicator(responses.contractor_2, 'varies')) {
    recommendations.add('visitor_escort_requirements');
  }
  
  if (isNoResponse(responses.contractor_3)) {
    recommendations.add('supplier_vetting_program');
    recommendations.add('parts_authentication_procedures');
  }
  
  if (isNoResponse(responses.contractor_4)) {
    recommendations.add('maintenance_access_procedures');
  }
  
  if (isNoResponse(responses.contractor_5)) {
    recommendations.add('vendor_security_program');
  }

  // =========================================================================
  // SURVEILLANCE CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.surveillance_1, '0-25%') ||
      responseMatchesIndicator(responses.surveillance_1, '26-50%')) {
    recommendations.add('cctv_production_floor');
    recommendations.add('cctv_raw_material_storage');
    recommendations.add('cctv_finished_goods_warehouse');
  }
  
  if (responseMatchesIndicator(responses.surveillance_2, 'less than 7 days') ||
      responseMatchesIndicator(responses.surveillance_2, '7-14 days')) {
    recommendations.add('video_retention_30_days');
  }
  
  if (isNoResponse(responses.surveillance_3)) {
    recommendations.add('real_time_monitoring');
  }
  
  if (isNoResponse(responses.surveillance_4)) {
    recommendations.add('video_analytics_manufacturing');
  }
  
  if (isNoResponse(responses.surveillance_5)) {
    recommendations.add('equipment_monitoring_system');
  }

  // =========================================================================
  // EMERGENCY RESPONSE CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.emergency_1)) {
    recommendations.add('workplace_violence_response_plan');
  }
  
  if (isNoResponse(responses.emergency_3)) {
    recommendations.add('production_continuity_plan');
  }
  
  if (isNoResponse(responses.emergency_4)) {
    recommendations.add('ip_theft_response_procedures');
  }
  
  if (isNoResponse(responses.emergency_5)) {
    recommendations.add('sabotage_incident_response');
  }
  
  if (isNoResponse(responses.emergency_6)) {
    recommendations.add('incident_documentation_procedures');
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
  threat: typeof MANUFACTURING_THREATS[0],
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
  
  // Industrial Espionage observations
  if (threat.id === 'industrial_espionage_ip_theft') {
    if (isNoResponse(responses.ip_2)) {
      observations.push('visitors not required to sign NDAs');
    }
    if (isNoResponse(responses.production_5)) {
      observations.push('photography not prohibited in production areas');
    }
    if (isYesResponse(responses.facility_6)) {
      observations.push('proprietary processes and trade secrets present');
    }
    if (responseMatchesIndicator(responses.ip_1a, 'no formal access control')) {
      observations.push('R&D area lacks adequate access control');
    }
  }
  
  // Equipment Sabotage observations
  if (threat.id === 'equipment_sabotage') {
    if (isNoResponse(responses.production_1)) {
      observations.push('no badge access control on production floor');
    }
    if (isNoResponse(responses.production_3)) {
      observations.push('equipment not secured when not in use');
    }
    if (isNoResponse(responses.surveillance_5)) {
      observations.push('critical equipment not monitored with sensors');
    }
    if (isNoResponse(responses.personnel_6)) {
      observations.push('no immediate access revocation on termination');
    }
  }
  
  // Raw Material Theft observations
  if (threat.id === 'raw_material_theft') {
    if (isNoResponse(responses.inventory_3)) {
      observations.push('high-value materials not stored in secured cages');
    }
    if (responseMatchesIndicator(responses.inventory_2, 'annually')) {
      observations.push('cycle counts only performed annually');
    }
    if (isNoResponse(responses.inventory_7)) {
      observations.push('no two-person rule for high-value access');
    }
    if (isYesResponse(responses.facility_7)) {
      observations.push('high-value materials present');
    }
  }
  
  // Finished Goods Theft observations
  if (threat.id === 'finished_goods_theft') {
    if (isNoResponse(responses.shipping_3)) {
      observations.push('shipping manifests not verified against loaded products');
    }
    if (isNoResponse(responses.shipping_4)) {
      observations.push('loading docks not monitored by CCTV');
    }
    if (responseMatchesIndicator(responses.shipping_6, 'move freely')) {
      observations.push('drivers can move freely during loading');
    }
  }
  
  // Insider Theft - IP observations
  if (threat.id === 'insider_theft_ip_data') {
    if (isNoResponse(responses.ip_5)) {
      observations.push('no data loss prevention measures');
    }
    if (isNoResponse(responses.ip_7)) {
      observations.push('no exit interview IP return procedures');
    }
    if (isNoResponse(responses.personnel_3)) {
      observations.push('no insider threat awareness program');
    }
  }
  
  // Insider Theft - Physical observations
  if (threat.id === 'insider_theft_physical') {
    if (responseMatchesIndicator(responses.personnel_1, 'no background checks')) {
      observations.push('no employee background checks');
    }
    if (isNoResponse(responses.personnel_5)) {
      observations.push('no exit bag checks');
    }
    if (isNoResponse(responses.inventory_6)) {
      observations.push('no exception-based reporting');
    }
  }
  
  // Workplace Violence observations
  if (threat.id === 'workplace_violence_production_floor') {
    if (isNoResponse(responses.emergency_1)) {
      observations.push('no workplace violence response plan');
    }
    if (isNoResponse(responses.personnel_6)) {
      observations.push('terminated employees may retain access');
    }
  }
  
  // Contractor Exploitation observations
  if (threat.id === 'contractor_vendor_exploitation') {
    if (responseMatchesIndicator(responses.contractor_2, 'not escorted')) {
      observations.push('contractors not escorted in facility');
    }
    if (isNoResponse(responses.contractor_1)) {
      observations.push('no contractor sign-in requirements');
    }
    if (isNoResponse(responses.ip_2)) {
      observations.push('contractors not required to sign NDAs');
    }
  }
  
  // Hazmat observations
  if (threat.id === 'hazmat_theft_diversion') {
    if (isYesResponse(responses.facility_8)) {
      observations.push('hazardous materials subject to CFATS regulation present');
    }
    if (responseMatchesIndicator(responses.facility_8a, 'tier 1') ||
        responseMatchesIndicator(responses.facility_8a, 'tier 2')) {
      observations.push('facility classified as high-risk CFATS tier');
    }
  }
  
  // Trespassing observations
  if (threat.id === 'trespassing_unauthorized_access') {
    if (responseMatchesIndicator(responses.perimeter_1, 'no perimeter fence')) {
      observations.push('no perimeter fencing');
    }
    if (isNoResponse(responses.perimeter_2)) {
      observations.push('no staffed security gate');
    }
    if (isNoResponse(responses.perimeter_3)) {
      observations.push('no perimeter intrusion detection');
    }
  }
  
  // Production Disruption observations
  if (threat.id === 'production_line_disruption') {
    if (isNoResponse(responses.emergency_3)) {
      observations.push('no production continuity plan');
    }
    if (isNoResponse(responses.emergency_5)) {
      observations.push('no sabotage incident response plan');
    }
  }
  
  // Trade Secret Theft observations
  if (threat.id === 'trade_secret_theft') {
    if (isNoResponse(responses.ip_3)) {
      observations.push('no clean desk policy');
    }
    if (isNoResponse(responses.ip_4)) {
      observations.push('prototypes not stored securely');
    }
    if (isNoResponse(responses.production_5)) {
      observations.push('photography not prohibited');
    }
  }
  
  // Tooling Theft observations
  if (threat.id === 'theft_tooling_dies_molds') {
    if (isNoResponse(responses.production_4)) {
      observations.push('no tool control system');
    }
    if (responseMatchesIndicator(responses.production_4a, 'no formal tracking')) {
      observations.push('tools not formally tracked');
    }
  }
  
  // Counterfeit Parts observations
  if (threat.id === 'counterfeit_parts_infiltration') {
    if (isNoResponse(responses.contractor_3)) {
      observations.push('suppliers not vetted for parts authenticity');
    }
    if (isNoResponse(responses.inventory_4)) {
      observations.push('no lot/serial number tracking');
    }
  }

  // Build the description
  let description = `${threat.description} `;
  description += `This threat is ${likelihoodTerms[threatLikelihood]} to occur at this facility, `;
  description += `which is ${vulnerabilityTerms[vulnerability]} to this type of incident. `;
  description += `If realized, impact would be ${impactTerms[impact]}. `;
  
  if (observations.length > 0) {
    description += `Key observations: ${observations.slice(0, 4).join('; ')}.`;
  }

  return description;
}

// ============================================================================
// RISK SCENARIO INITIALIZATION
// ============================================================================

/**
 * Initialize risk scenarios from completed interview (compute-only version)
 * Returns 15 manufacturing-specific risk scenarios for persistence by route layer
 * Note: Database persistence should be handled via storage.ts interface
 */
export function initializeRiskScenariosFromInterview(
  assessmentId: string | number,
  interviewResponses: InterviewResponses
): { scenarios: any[]; summary: GeneratedScenarioResult } {
  const result: GeneratedScenarioResult = {
    success: true,
    generatedScenarios: 0,
    criticalRisks: 0,
    highRisks: 0,
    mediumRisks: 0,
    lowRisks: 0,
    riskScenarioIds: [],
  };

  const scenarios: any[] = [];

  // Generate risk scenarios for each threat
  for (const threatDef of MANUFACTURING_THREATS) {
    const threatId = threatDef.id;
    
    // Calculate T×V×I
    const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
    const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threatId);
    const impact = calculateImpactFromInterview(interviewResponses, threatId);
    const inherentRisk = threatLikelihood * vulnerability * impact;
    const riskLevel = classifyRiskLevel(inherentRisk);
    
    // Generate scenario description
    const scenarioDescription = generateScenarioDescription(
      threatDef,
      interviewResponses,
      threatLikelihood,
      vulnerability,
      impact
    );
    
    // Build scenario object (ready for storage layer persistence)
    scenarios.push({
      assessmentId: String(assessmentId),
      threatName: threatDef.name,
      threatCategory: threatDef.category,
      threatCode: threatDef.id,
      threatLikelihood,
      vulnerability,
      impact,
      inherentRisk,
      residualRisk: inherentRisk, // Will be updated when controls assigned
      controlEffectiveness: 0,
      riskLevel,
      scenario: scenarioDescription,
      suggestedControls: generateControlRecommendations(interviewResponses, threatId),
    });
    
    result.generatedScenarios++;
    
    // Count by risk level
    switch (riskLevel) {
      case 'critical': result.criticalRisks++; break;
      case 'high': result.highRisks++; break;
      case 'medium': result.mediumRisks++; break;
      case 'low': result.lowRisks++; break;
    }
  }

  return { scenarios, summary: result };
}

/**
 * Calculate all risk inputs for a specific threat without database operations
 * Useful for preview/validation before saving
 */
export function calculateRiskForThreat(
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
 * Get prioritized control recommendations with rationale
 */
export function getPrioritizedControlRecommendations(
  responses: InterviewResponses
): ControlRecommendation[] {
  const controls: ControlRecommendation[] = [];

  // =========================================================================
  // CRITICAL PRIORITY - Immediate action required
  // =========================================================================
  
  // No production floor access control
  if (isNoResponse(responses.production_1)) {
    controls.push({
      controlId: 'employee_badge_access_control',
      priority: 'critical',
      rationale: 'Production floor access control is fundamental to preventing unauthorized access, insider theft, and sabotage. This is a baseline manufacturing security requirement.',
    });
  }
  
  // No visitor NDA with IP present
  if (isNoResponse(responses.ip_2) && isYesResponse(responses.facility_6)) {
    controls.push({
      controlId: 'visitor_nda_procedures',
      priority: 'critical',
      rationale: 'With proprietary processes present, NDAs are essential legal protection. Without them, trade secret claims may be unenforceable.',
    });
  }
  
  // No DLP with IP present
  if (isNoResponse(responses.ip_5) && isYesResponse(responses.facility_6)) {
    controls.push({
      controlId: 'data_loss_prevention',
      priority: 'critical',
      rationale: 'Data loss prevention is critical when intellectual property is present. Digital exfiltration is the primary method of industrial espionage.',
    });
  }
  
  // No immediate access revocation
  if (isNoResponse(responses.personnel_6)) {
    controls.push({
      controlId: 'immediate_access_revocation',
      priority: 'critical',
      rationale: 'Failure to immediately revoke access on termination creates windows for sabotage, theft, and IP exfiltration. Industry standard is same-day revocation.',
    });
  }
  
  // No insider threat program
  if (isNoResponse(responses.personnel_3)) {
    controls.push({
      controlId: 'insider_threat_program',
      priority: 'critical',
      rationale: 'FBI statistics show 60%+ of manufacturing theft involves insiders. Insider threat programs detect behavioral indicators before losses occur.',
    });
  }

  // =========================================================================
  // HIGH PRIORITY - Address within 30 days
  // =========================================================================
  
  // Weak perimeter
  if (responseMatchesIndicator(responses.perimeter_1, 'no perimeter fence') ||
      responseMatchesIndicator(responses.perimeter_1, 'under 6 feet')) {
    controls.push({
      controlId: 'industrial_fencing_8ft_plus',
      priority: 'high',
      rationale: 'Industrial security fencing (8ft+ with anti-climb) is the first line of defense. Without adequate perimeter barriers, all interior controls are compromised.',
    });
  }
  
  // No raw material caging with high-value present
  if (isNoResponse(responses.inventory_3) && isYesResponse(responses.facility_7)) {
    controls.push({
      controlId: 'raw_material_caging',
      priority: 'high',
      rationale: 'With high-value materials present, secured caging is essential. Industry standard for precious metals and pharmaceuticals.',
    });
  }
  
  // No photography prohibition with IP
  if (isNoResponse(responses.production_5) && isYesResponse(responses.facility_6)) {
    controls.push({
      controlId: 'photography_prohibition_enforcement',
      priority: 'high',
      rationale: 'Photography of production processes is primary espionage vector. Essential protection for facilities with proprietary processes.',
    });
  }
  
  // No manifest verification
  if (isNoResponse(responses.shipping_3)) {
    controls.push({
      controlId: 'shipping_receiving_verification',
      priority: 'high',
      rationale: 'Without manifest verification, overshipment and theft go undetected. Standard control for finished goods protection.',
    });
  }
  
  // Poor CCTV coverage
  if (responseMatchesIndicator(responses.surveillance_1, '0-25%') ||
      responseMatchesIndicator(responses.surveillance_1, '26-50%')) {
    controls.push({
      controlId: 'cctv_production_floor',
      priority: 'high',
      rationale: 'CCTV coverage below 50% leaves significant blind spots. Recommended minimum is 75% coverage for manufacturing facilities.',
    });
  }
  
  // Contractors not escorted
  if (responseMatchesIndicator(responses.contractor_2, 'not escorted')) {
    controls.push({
      controlId: 'visitor_escort_requirements',
      priority: 'high',
      rationale: 'Unescorted contractor access is primary vector for espionage and theft. Escort requirements are industry standard.',
    });
  }

  // =========================================================================
  // MEDIUM PRIORITY - Address within 90 days
  // =========================================================================
  
  // No cycle counting
  if (responseMatchesIndicator(responses.inventory_2, 'annually')) {
    controls.push({
      controlId: 'cycle_counting_program',
      priority: 'medium',
      rationale: 'Annual-only cycle counting allows theft to go undetected for months. Monthly counting is industry standard for manufacturing.',
    });
  }
  
  // No video analytics
  if (isNoResponse(responses.surveillance_4)) {
    controls.push({
      controlId: 'video_analytics_manufacturing',
      priority: 'medium',
      rationale: 'Video analytics can detect anomalies without constant human monitoring. Cost-effective enhancement to existing CCTV.',
    });
  }
  
  // No two-person rule
  if (isNoResponse(responses.inventory_7)) {
    controls.push({
      controlId: 'two_person_rule_sensitive_areas',
      priority: 'medium',
      rationale: 'Two-person rule for high-value access follows banking industry standards. Provides mutual accountability.',
    });
  }
  
  // No supplier vetting
  if (isNoResponse(responses.contractor_3)) {
    controls.push({
      controlId: 'supplier_vetting_program',
      priority: 'medium',
      rationale: 'Without supplier vetting, counterfeit parts can enter production. Growing supply chain security concern.',
    });
  }
  
  // Short video retention
  if (responseMatchesIndicator(responses.surveillance_2, 'less than 7 days') ||
      responseMatchesIndicator(responses.surveillance_2, '7-14 days')) {
    controls.push({
      controlId: 'video_retention_30_days',
      priority: 'medium',
      rationale: '30+ day retention is needed to investigate detected losses. Short retention eliminates evidence before discovery.',
    });
  }
  
  // No exit bag checks
  if (isNoResponse(responses.personnel_5)) {
    controls.push({
      controlId: 'exit_bag_checks',
      priority: 'medium',
      rationale: 'Random bag checks deter casual theft. Low-cost deterrent control.',
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
  // CATEGORY: PERIMETER SECURITY (weight: 12%)
  // =========================================================================
  let perimeterScore = 0;
  let perimeterTotal = 0;
  
  // Fencing quality
  perimeterTotal++;
  if (!responseMatchesIndicator(responses.perimeter_1, 'no perimeter fence') &&
      !responseMatchesIndicator(responses.perimeter_1, 'under 6 feet')) {
    perimeterScore++;
    if (responseMatchesIndicator(responses.perimeter_1, '8+ feet') ||
        responseMatchesIndicator(responses.perimeter_1, 'industrial')) {
      strengths.push('Industrial-grade perimeter fencing');
    }
  } else {
    findings.push('Inadequate perimeter fencing');
  }
  
  // Staffed gate
  perimeterTotal++;
  if (isYesResponse(responses.perimeter_2)) {
    perimeterScore++;
    strengths.push('Staffed security gate');
  } else {
    findings.push('No staffed security gate');
  }
  
  // Intrusion detection
  perimeterTotal++;
  if (isYesResponse(responses.perimeter_3)) {
    perimeterScore++;
  } else {
    findings.push('No perimeter intrusion detection');
  }
  
  // Lighting
  perimeterTotal++;
  if (!isLowRating(responses.perimeter_4)) {
    perimeterScore++;
  } else {
    findings.push('Inadequate perimeter lighting');
  }
  
  // CCTV
  perimeterTotal++;
  if (isYesResponse(responses.perimeter_5)) {
    perimeterScore++;
  } else {
    findings.push('No perimeter CCTV');
  }
  
  // Vehicle inspection
  perimeterTotal++;
  if (isYesResponse(responses.perimeter_7)) {
    perimeterScore++;
  } else {
    findings.push('No vehicle inspection procedures');
  }
  
  categoryScores['perimeterSecurity'] = Math.round((perimeterScore / perimeterTotal) * 100);
  totalFactors += perimeterTotal;
  securityFactors += perimeterScore;

  // =========================================================================
  // CATEGORY: PRODUCTION AREA SECURITY (weight: 15%)
  // =========================================================================
  let productionScore = 0;
  let productionTotal = 0;
  
  // Access control
  productionTotal++;
  if (isYesResponse(responses.production_1)) {
    productionScore++;
    strengths.push('Badge access control on production floor');
  } else {
    findings.push('No production floor access control');
  }
  
  // CCTV
  productionTotal++;
  if (isYesResponse(responses.production_2)) {
    productionScore++;
  } else {
    findings.push('No production floor CCTV');
  }
  
  // Equipment security
  productionTotal++;
  if (isYesResponse(responses.production_3)) {
    productionScore++;
  } else {
    findings.push('Equipment not secured when not in use');
  }
  
  // Tool control
  productionTotal++;
  if (isYesResponse(responses.production_4)) {
    productionScore++;
  } else {
    findings.push('No tool control system');
  }
  
  // Photography prohibition
  productionTotal++;
  if (isYesResponse(responses.production_5)) {
    productionScore++;
    strengths.push('Photography prohibited in production areas');
  } else {
    findings.push('Photography not prohibited in production areas');
  }
  
  categoryScores['productionSecurity'] = Math.round((productionScore / productionTotal) * 100);
  totalFactors += productionTotal;
  securityFactors += productionScore;

  // =========================================================================
  // CATEGORY: IP PROTECTION (weight: 18%)
  // =========================================================================
  let ipScore = 0;
  let ipTotal = 0;
  
  // R&D access control (if applicable)
  if (isYesResponse(responses.ip_1)) {
    ipTotal++;
    if (!responseMatchesIndicator(responses.ip_1a, 'no formal') &&
        !responseMatchesIndicator(responses.ip_1a, 'key/lock')) {
      ipScore++;
      if (responseMatchesIndicator(responses.ip_1a, 'biometric')) {
        strengths.push('Biometric access control on R&D areas');
      }
    } else {
      findings.push('Weak R&D area access control');
    }
  }
  
  // Visitor NDAs
  ipTotal++;
  if (isYesResponse(responses.ip_2)) {
    ipScore++;
    strengths.push('Visitor NDA requirements');
  } else {
    findings.push('Visitors not required to sign NDAs');
  }
  
  // Clean desk policy
  ipTotal++;
  if (isYesResponse(responses.ip_3)) {
    ipScore++;
  } else {
    findings.push('No clean desk policy');
  }
  
  // Prototype security
  ipTotal++;
  if (isYesResponse(responses.ip_4)) {
    ipScore++;
  } else {
    findings.push('Prototypes not stored securely');
  }
  
  // DLP
  ipTotal++;
  if (isYesResponse(responses.ip_5)) {
    ipScore++;
    strengths.push('Data loss prevention measures in place');
  } else {
    findings.push('No data loss prevention measures');
  }
  
  // Mobile restrictions
  ipTotal++;
  if (isYesResponse(responses.ip_6)) {
    ipScore++;
  } else {
    findings.push('No mobile device restrictions in sensitive areas');
  }
  
  // Exit interviews
  ipTotal++;
  if (isYesResponse(responses.ip_7)) {
    ipScore++;
  } else {
    findings.push('No exit interview IP procedures');
  }
  
  categoryScores['ipProtection'] = Math.round((ipScore / ipTotal) * 100);
  totalFactors += ipTotal;
  securityFactors += ipScore;

  // =========================================================================
  // CATEGORY: INVENTORY CONTROL (weight: 15%)
  // =========================================================================
  let inventoryScore = 0;
  let inventoryTotal = 0;
  
  // Tracking system
  inventoryTotal++;
  if (isYesResponse(responses.inventory_1)) {
    inventoryScore++;
    if (responseMatchesIndicator(responses.inventory_1a, 'erp') ||
        responseMatchesIndicator(responses.inventory_1a, 'rfid')) {
      strengths.push('Automated inventory tracking system');
    }
  } else {
    findings.push('No automated inventory tracking');
  }
  
  // Cycle counting
  inventoryTotal++;
  if (!responseMatchesIndicator(responses.inventory_2, 'annually') &&
      !responseMatchesIndicator(responses.inventory_2, 'less frequently')) {
    inventoryScore++;
    if (responseMatchesIndicator(responses.inventory_2, 'daily') ||
        responseMatchesIndicator(responses.inventory_2, 'weekly')) {
      strengths.push('Frequent inventory cycle counting');
    }
  } else {
    findings.push('Infrequent cycle counting');
  }
  
  // High-value caging
  inventoryTotal++;
  if (isYesResponse(responses.inventory_3)) {
    inventoryScore++;
    strengths.push('High-value materials in secured caging');
  } else {
    findings.push('High-value materials not in secured caging');
  }
  
  // Lot tracking
  inventoryTotal++;
  if (isYesResponse(responses.inventory_4)) {
    inventoryScore++;
  } else {
    findings.push('No lot/serial number tracking');
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
    findings.push('No two-person rule for high-value access');
  }
  
  categoryScores['inventoryControl'] = Math.round((inventoryScore / inventoryTotal) * 100);
  totalFactors += inventoryTotal;
  securityFactors += inventoryScore;

  // =========================================================================
  // CATEGORY: PERSONNEL SECURITY (weight: 20%)
  // =========================================================================
  let personnelScore = 0;
  let personnelTotal = 0;
  
  // Background checks
  personnelTotal++;
  if (!responseMatchesIndicator(responses.personnel_1, 'no background') &&
      !responseMatchesIndicator(responses.personnel_1, 'basic checks')) {
    personnelScore++;
    if (responseMatchesIndicator(responses.personnel_1, 'comprehensive')) {
      strengths.push('Comprehensive employee background checks');
    }
  } else {
    findings.push('Inadequate employee background checks');
  }
  
  // Contractor checks
  personnelTotal++;
  if (isYesResponse(responses.personnel_2)) {
    personnelScore++;
  } else {
    findings.push('No contractor background checks');
  }
  
  // Insider threat program
  personnelTotal++;
  if (isYesResponse(responses.personnel_3)) {
    personnelScore++;
    strengths.push('Insider threat awareness program');
  } else {
    findings.push('No insider threat program');
  }
  
  // Security training
  personnelTotal++;
  if (isYesResponse(responses.personnel_4)) {
    personnelScore++;
  } else {
    findings.push('No security awareness training');
  }
  
  // Access revocation
  personnelTotal++;
  if (isYesResponse(responses.personnel_6)) {
    personnelScore++;
    strengths.push('Immediate access revocation on termination');
  } else {
    findings.push('No immediate access revocation procedures');
  }
  
  // NDAs
  personnelTotal++;
  if (isYesResponse(responses.personnel_7)) {
    personnelScore++;
  } else {
    findings.push('No employee NDA/non-compete agreements');
  }
  
  categoryScores['personnelSecurity'] = Math.round((personnelScore / personnelTotal) * 100);
  totalFactors += personnelTotal;
  securityFactors += personnelScore;

  // =========================================================================
  // CATEGORY: SURVEILLANCE (weight: 10%)
  // =========================================================================
  let surveillanceScore = 0;
  let surveillanceTotal = 0;
  
  // CCTV coverage
  surveillanceTotal++;
  if (!responseMatchesIndicator(responses.surveillance_1, '0-25%') &&
      !responseMatchesIndicator(responses.surveillance_1, '26-50%')) {
    surveillanceScore++;
    if (responseMatchesIndicator(responses.surveillance_1, '76-100%')) {
      strengths.push('Comprehensive CCTV coverage (76%+)');
    }
  } else {
    findings.push('Insufficient CCTV coverage');
  }
  
  // Video retention
  surveillanceTotal++;
  if (!responseMatchesIndicator(responses.surveillance_2, 'less than 7') &&
      !responseMatchesIndicator(responses.surveillance_2, '7-14')) {
    surveillanceScore++;
  } else {
    findings.push('Insufficient video retention period');
  }
  
  // Real-time monitoring
  surveillanceTotal++;
  if (isYesResponse(responses.surveillance_3)) {
    surveillanceScore++;
  } else {
    findings.push('No real-time video monitoring');
  }
  
  // Analytics
  surveillanceTotal++;
  if (isYesResponse(responses.surveillance_4)) {
    surveillanceScore++;
    strengths.push('Video analytics for anomaly detection');
  }
  
  // Equipment monitoring
  surveillanceTotal++;
  if (isYesResponse(responses.surveillance_5)) {
    surveillanceScore++;
  } else {
    findings.push('Critical equipment not monitored with sensors');
  }
  
  categoryScores['surveillance'] = Math.round((surveillanceScore / surveillanceTotal) * 100);
  totalFactors += surveillanceTotal;
  securityFactors += surveillanceScore;

  // =========================================================================
  // CATEGORY: EMERGENCY RESPONSE (weight: 10%)
  // =========================================================================
  let emergencyScore = 0;
  let emergencyTotal = 0;
  
  // Workplace violence plan
  emergencyTotal++;
  if (isYesResponse(responses.emergency_1)) {
    emergencyScore++;
  } else {
    findings.push('No workplace violence response plan');
  }
  
  // Production continuity
  emergencyTotal++;
  if (isYesResponse(responses.emergency_3)) {
    emergencyScore++;
    strengths.push('Production continuity plan in place');
  } else {
    findings.push('No production continuity plan');
  }
  
  // IP theft response
  emergencyTotal++;
  if (isYesResponse(responses.emergency_4)) {
    emergencyScore++;
  } else {
    findings.push('No IP theft response procedures');
  }
  
  // Sabotage response
  emergencyTotal++;
  if (isYesResponse(responses.emergency_5)) {
    emergencyScore++;
  } else {
    findings.push('No sabotage incident response plan');
  }
  
  // Incident documentation
  emergencyTotal++;
  if (isYesResponse(responses.emergency_6)) {
    emergencyScore++;
  } else {
    findings.push('Security incidents not formally documented');
  }
  
  categoryScores['emergencyResponse'] = Math.round((emergencyScore / emergencyTotal) * 100);
  totalFactors += emergencyTotal;
  securityFactors += emergencyScore;

  // =========================================================================
  // CALCULATE OVERALL SCORE
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
    findings: findings.slice(0, 15), // Top 15 findings
    strengths: strengths.slice(0, 10), // Top 10 strengths
    categoryScores,
  };
}

// ============================================================================
// EXPORTS FOR ROUTE INTEGRATION
// Already exported at declaration: MANUFACTURING_THREATS, THREAT_CONTROL_MAPPING, 
// QUESTION_THREAT_MAPPING, QUESTION_RISK_WEIGHTS
// ============================================================================

export {
  classifyRiskLevel,
  getThreatById,
};
