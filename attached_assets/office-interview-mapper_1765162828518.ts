/**
 * Office Building Interview Risk Mapper
 * 
 * Implements the T×V×I calculation pipeline per RiskFixer Office Building Framework.
 * Transforms interview questionnaire responses into mathematically-derived risk scenarios.
 * 
 * KEY FEATURES:
 * - 12 office-specific threats with individual calculation algorithms
 * - Risk factor counting with divisor of 3 (vs retail's 2) for stability
 * - Control recommendations mapped to specific vulnerability gaps
 * - Scenario descriptions with contextual observations
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Office-Building-Framework-UPGRADED.md
 * @see RiskFixer-Office-Building-Questions-With-Polarity.md
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

export interface SecurityScoreResult {
  score: number;
  grade: string;
  findings: string[];
  strengths: string[];
  categoryScores: Record<string, number>;
}

// ============================================================================
// OFFICE BUILDING THREAT DEFINITIONS
// ============================================================================

export const OFFICE_BUILDING_THREATS = [
  {
    id: 'unauthorized_access',
    name: 'Unauthorized Building Access',
    category: 'Access Control',
    description: 'Unauthorized individuals gaining entry to the facility through tailgating, social engineering, or inadequate access controls',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-ACC-001',
  },
  {
    id: 'workplace_violence',
    name: 'Workplace Violence',
    category: 'Violence',
    description: 'Physical violence, threats, or harassment by current/former employees, domestic spillover, or external actors',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-WPV-001',
  },
  {
    id: 'theft_burglary',
    name: 'Theft & Burglary',
    category: 'Property Crime',
    description: 'Theft of company assets, employee personal property, or burglary during or after business hours',
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-THF-001',
  },
  {
    id: 'executive_targeting',
    name: 'Executive Targeting',
    category: 'Targeted Violence',
    description: 'Targeting of executives including stalking, harassment, physical threats, or kidnapping attempts',
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-EPT-001',
  },
  {
    id: 'data_breach_physical',
    name: 'Physical Data Breach',
    category: 'Information Security',
    description: 'Unauthorized access to sensitive data through physical means including document theft, shoulder surfing, or device theft',
    typicalLikelihood: 3,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-INF-001',
  },
  {
    id: 'terrorism_bomb_threat',
    name: 'Terrorism / Bomb Threat',
    category: 'Terrorism',
    description: 'Terrorist attacks, bomb threats, suspicious packages, or VBIED threats against the facility',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-TER-001',
  },
  {
    id: 'civil_disturbance',
    name: 'Civil Disturbance / Protest',
    category: 'Civil Unrest',
    description: 'Protests, demonstrations, riots, or civil disturbances affecting facility operations or employee safety',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-CIV-001',
  },
  {
    id: 'insider_threat',
    name: 'Insider Threat',
    category: 'Internal',
    description: 'Malicious actions by current or former employees including sabotage, data theft, or facilitating external threats',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-INT-001',
  },
  {
    id: 'after_hours_intrusion',
    name: 'After-Hours Intrusion',
    category: 'Burglary',
    description: 'Unauthorized entry during non-business hours for theft, vandalism, or other criminal purposes',
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: 'PSC.1-2012-BUR-001',
  },
  {
    id: 'vehicle_ramming',
    name: 'Vehicle Ramming Attack',
    category: 'Terrorism',
    description: 'Vehicle-borne attack against building, lobby, or pedestrians including VBIED or vehicle as weapon',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-VBA-001',
  },
  {
    id: 'active_shooter',
    name: 'Active Shooter / Armed Intruder',
    category: 'Violence',
    description: 'Active threat situation involving an armed individual intent on causing mass casualties',
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: 'PSC.1-2012-ASH-001',
  },
  {
    id: 'corporate_espionage',
    name: 'Corporate Espionage',
    category: 'Information Security',
    description: 'Targeted theft of trade secrets, intellectual property, or competitive intelligence through physical or social means',
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: 'PSC.1-2012-ESP-001',
  },
];

// ============================================================================
// THREAT-TO-CONTROL MAPPING
// ============================================================================

export const THREAT_CONTROL_MAPPING: Record<string, string[]> = {
  unauthorized_access: [
    'badge_access_control_system',
    'anti_tailgating_measures',
    'turnstiles_mantraps',
    'visitor_management_system',
    'visitor_escort_policy',
    'cctv_entry_points',
    'security_officer_reception',
    'access_audit_logging',
    'zone_based_access_control',
    'after_hours_access_procedures',
  ],
  workplace_violence: [
    'security_officer_staffing',
    'panic_duress_alarms',
    'mass_notification_system',
    'workplace_violence_policy',
    'threat_assessment_team',
    'de_escalation_training',
    'employee_assistance_program',
    'anonymous_reporting_system',
    'cctv_common_areas',
    'lockdown_capability',
  ],
  theft_burglary: [
    'cctv_comprehensive_coverage',
    'intrusion_detection_system',
    'central_station_monitoring',
    'secure_asset_storage',
    'key_badge_management',
    'parking_cctv',
    'perimeter_lighting',
    'security_patrols',
    'inventory_controls',
    'employee_background_checks',
  ],
  executive_targeting: [
    'executive_suite_access_control',
    'executive_parking_security',
    'panic_duress_alarms',
    'cctv_executive_areas',
    'executive_security_training',
    'threat_assessment_monitoring',
    'secure_executive_entrance',
    'visitor_screening_enhanced',
    'executive_travel_security',
    'security_escort_service',
  ],
  data_breach_physical: [
    'clean_desk_policy',
    'secure_document_destruction',
    'secure_print_release',
    'server_room_access_control',
    'server_room_cctv',
    'visitor_escort_policy',
    'photography_recording_policy',
    'secure_file_storage',
    'screen_privacy_filters',
    'data_classification_policy',
  ],
  terrorism_bomb_threat: [
    'vehicle_barriers_bollards',
    'mail_package_screening',
    'setback_distance',
    'bomb_threat_procedures',
    'emergency_evacuation_plan',
    'cctv_perimeter',
    'security_officer_staffing',
    'loading_dock_security',
    'visitor_screening',
    'mass_notification_system',
  ],
  civil_disturbance: [
    'emergency_response_plan',
    'mass_notification_system',
    'lockdown_capability',
    'alternate_entry_exit_routes',
    'media_coordination_plan',
    'executive_protection_procedures',
    'cctv_perimeter',
    'liaison_law_enforcement',
    'business_continuity_plan',
    'employee_communication_procedures',
  ],
  insider_threat: [
    'employee_background_checks',
    'access_rights_management',
    'periodic_access_audits',
    'cctv_sensitive_areas',
    'anonymous_reporting_system',
    'termination_security_procedures',
    'need_to_know_access',
    'audit_trail_logging',
    'behavioral_monitoring',
    'security_awareness_training',
  ],
  after_hours_intrusion: [
    'intrusion_detection_system',
    'central_station_monitoring',
    'perimeter_door_alarms',
    'motion_detectors',
    'cctv_perimeter',
    'perimeter_lighting',
    'after_hours_access_control',
    'security_patrols',
    'glass_break_sensors',
    'door_contact_sensors',
  ],
  vehicle_ramming: [
    'vehicle_barriers_bollards',
    'setback_distance',
    'reinforced_entrance',
    'cctv_perimeter',
    'vehicle_screening',
    'parking_access_control',
    'hostile_vehicle_mitigation',
    'landscape_barriers',
    'security_planters',
    'rated_barrier_systems',
  ],
  active_shooter: [
    'lockdown_capability',
    'mass_notification_system',
    'panic_duress_alarms',
    'run_hide_fight_training',
    'emergency_response_plan',
    'law_enforcement_liaison',
    'ballistic_rated_barriers',
    'safe_rooms',
    'cctv_comprehensive_coverage',
    'threat_assessment_team',
  ],
  corporate_espionage: [
    'visitor_escort_policy',
    'visitor_screening_enhanced',
    'clean_desk_policy',
    'secure_meeting_rooms',
    'cctv_sensitive_areas',
    'network_segregation',
    'employee_background_checks',
    'non_disclosure_agreements',
    'photography_recording_policy',
    'secure_document_destruction',
  ],
};

// ============================================================================
// INCIDENT-TO-THREAT MAPPING
// ============================================================================

const INCIDENT_THREAT_MAP: Record<string, string[]> = {
  'workplace_violence': ['workplace_violence', 'active_shooter'],
  'unauthorized_entry': ['unauthorized_access', 'corporate_espionage'],
  'theft': ['theft_burglary', 'insider_threat'],
  'data_breach': ['data_breach_physical', 'corporate_espionage'],
  'bomb_threat': ['terrorism_bomb_threat'],
  'executive_harassment': ['executive_targeting', 'workplace_violence'],
  'burglary': ['after_hours_intrusion', 'theft_burglary'],
  'protest': ['civil_disturbance'],
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
  return OFFICE_BUILDING_THREATS.find(t => t.id === threatId);
}

// ============================================================================
// VULNERABILITY CALCULATION
// ============================================================================

/**
 * Calculate vulnerability score (1-5) based on interview responses
 * Higher score = more vulnerable
 * 
 * Office uses divisor of 3 (vs retail's 2) because office threats
 * are generally lower frequency than retail, requiring more gaps
 * to significantly increase vulnerability.
 */
export function calculateVulnerabilityFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let vulnerabilityScore = 3; // Start at baseline (moderate)
  let riskFactorCount = 0;

  // =========================================================================
  // PERIMETER SECURITY ANALYSIS
  // =========================================================================
  
  // No perimeter security = critical vulnerability
  if (responseMatchesIndicator(responses.perimeter_1, 'no - building is directly')) {
    riskFactorCount += 2;
  }
  
  // Poor exterior lighting
  if (isLowRating(responses.perimeter_2)) {
    riskFactorCount += 1;
  }
  
  // Concealment landscaping near entries
  if (isYesResponse(responses.perimeter_3)) {
    riskFactorCount += 1;
  }
  
  // No perimeter CCTV
  if (isNoResponse(responses.perimeter_4)) {
    riskFactorCount += 1;
  }
  
  // Poor perimeter camera coverage
  if (responseMatchesIndicator(responses.perimeter_4a, 'less than 25%') ||
      responseMatchesIndicator(responses.perimeter_4a, '25-49%')) {
    riskFactorCount += 1;
  }
  
  // Vulnerable entry points with weak security
  if (isYesResponse(responses.perimeter_5)) {
    if (responseMatchesIndicator(responses.perimeter_5a, 'physical locks only') ||
        responseMatchesIndicator(responses.perimeter_5a, 'no additional security')) {
      riskFactorCount += 2;
    }
  }
  
  // No perimeter intrusion detection
  if (isNoResponse(responses.perimeter_6)) {
    riskFactorCount += 1;
  }
  
  // Weak perimeter monitoring
  if (responseMatchesIndicator(responses.perimeter_7, 'notification via email') ||
      responseMatchesIndicator(responses.perimeter_7, 'no intrusion detection')) {
    riskFactorCount += 1;
  }
  
  // History of break-ins (increases threat likelihood more than vulnerability)
  if (isYesResponse(responses.perimeter_8)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // PARKING SECURITY ANALYSIS
  // =========================================================================
  
  // Unsecured parking
  if (responseMatchesIndicator(responses.parking_1, 'unsecured surface lot') ||
      responseMatchesIndicator(responses.parking_1, 'street parking only')) {
    riskFactorCount += 1;
  }
  
  // Weak parking access control
  if (responseMatchesIndicator(responses.parking_2, 'parking permit') ||
      responseMatchesIndicator(responses.parking_2, 'no access control')) {
    riskFactorCount += 1;
  }
  
  // No parking CCTV
  if (isNoResponse(responses.parking_3)) {
    riskFactorCount += 1;
  }
  
  // Poor parking camera coverage
  if (responseMatchesIndicator(responses.parking_3a, 'less than 50%')) {
    riskFactorCount += 1;
  }
  
  // Poor parking lighting
  if (isLowRating(responses.parking_4)) {
    riskFactorCount += 1;
  }
  
  // History of parking incidents
  if (isYesResponse(responses.parking_5)) {
    if (responseMatchesIndicator(responses.parking_5a, 'frequently') ||
        responseMatchesIndicator(responses.parking_5a, 'very frequently')) {
      riskFactorCount += 2;
    } else {
      riskFactorCount += 1;
    }
  }

  // =========================================================================
  // BUILDING ENTRY ANALYSIS
  // =========================================================================
  
  // Many entry points (harder to control)
  if (responseMatchesIndicator(responses.entry_1, '5+ entries')) {
    riskFactorCount += 1;
  }
  
  // Weak main entrance access control - CRITICAL
  if (responseMatchesIndicator(responses.entry_2, 'open access during business hours')) {
    riskFactorCount += 3;
  } else if (responseMatchesIndicator(responses.entry_2, 'intercom') ||
             responseMatchesIndicator(responses.entry_2, 'staffed reception desk only')) {
    riskFactorCount += 1;
  }
  
  // No anti-tailgating measures
  if (responseMatchesIndicator(responses.entry_3, 'no - open entry') ||
      responseMatchesIndicator(responses.entry_3, 'no - completely open')) {
    riskFactorCount += 2;
  }
  
  // No staffed reception
  if (isNoResponse(responses.entry_4)) {
    riskFactorCount += 1;
  }
  
  // Weak visitor management
  if (responseMatchesIndicator(responses.entry_5, 'paper sign-in log') ||
      responseMatchesIndicator(responses.entry_5, 'no formal visitor')) {
    riskFactorCount += 2;
  }
  
  // Weak visitor escort policy
  if (responseMatchesIndicator(responses.entry_6, 'recommended but not') ||
      responseMatchesIndicator(responses.entry_6, 'no escort policy')) {
    riskFactorCount += 1;
  }
  
  // No entry point CCTV
  if (isNoResponse(responses.entry_7)) {
    riskFactorCount += 1;
  }
  
  // Weak after-hours security
  if (responseMatchesIndicator(responses.entry_8, 'physical locks only')) {
    riskFactorCount += 1;
  }
  
  // No forced entry alarms
  if (isNoResponse(responses.entry_9)) {
    riskFactorCount += 1;
  }
  
  // History of unauthorized entry
  if (isYesResponse(responses.entry_10)) {
    if (responseMatchesIndicator(responses.entry_10a, 'frequently') ||
        responseMatchesIndicator(responses.entry_10a, 'very frequently')) {
      riskFactorCount += 2;
    } else {
      riskFactorCount += 1;
    }
  }

  // =========================================================================
  // INTERIOR ACCESS CONTROL ANALYSIS
  // =========================================================================
  
  // No zone-based access control
  if (isNoResponse(responses.interior_1)) {
    riskFactorCount += 1;
  }
  
  // No executive suite security - critical for EP threats
  if (responseMatchesIndicator(responses.interior_2, 'no - executive areas')) {
    riskFactorCount += 2;
  }
  
  // Weak server room security
  if (responseMatchesIndicator(responses.interior_3, 'physical key') ||
      responseMatchesIndicator(responses.interior_3, 'no dedicated IT')) {
    riskFactorCount += 2;
  }
  
  // No server room CCTV
  if (isNoResponse(responses.interior_4)) {
    riskFactorCount += 1;
  }
  
  // Open stairwell access
  if (responseMatchesIndicator(responses.interior_5, 'no - stairwells are open')) {
    riskFactorCount += 1;
  }
  
  // No elevator access control
  if (isNoResponse(responses.interior_6)) {
    riskFactorCount += 1;
  }
  
  // No interior CCTV
  if (isNoResponse(responses.interior_7)) {
    riskFactorCount += 1;
  }
  
  // Weak access rights management
  if (responseMatchesIndicator(responses.interior_8, 'rarely reviewed') ||
      responseMatchesIndicator(responses.interior_8, 'no formal access')) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // SURVEILLANCE SYSTEM ANALYSIS
  // =========================================================================
  
  // No cameras or minimal cameras - CRITICAL
  if (responseMatchesIndicator(responses.surveillance_1, 'no cameras')) {
    riskFactorCount += 3;
  } else if (responseMatchesIndicator(responses.surveillance_1, '1-10 cameras')) {
    riskFactorCount += 1;
  }
  
  // Short video retention
  if (responseMatchesIndicator(responses.surveillance_3, 'less than 7 days')) {
    riskFactorCount += 1;
  }
  
  // No real-time monitoring
  if (responseMatchesIndicator(responses.surveillance_4, 'no - recording only')) {
    riskFactorCount += 1;
  }
  
  // Poor camera maintenance
  if (responseMatchesIndicator(responses.surveillance_6, 'only when malfunction') ||
      responseMatchesIndicator(responses.surveillance_6, 'no regular maintenance')) {
    riskFactorCount += 1;
  }
  
  // Poor CCTV effectiveness rating
  if (isLowRating(responses.surveillance_7)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // INTRUSION DETECTION ANALYSIS
  // =========================================================================
  
  // No intrusion detection system - CRITICAL
  if (isNoResponse(responses.intrusion_1)) {
    riskFactorCount += 2;
  }
  
  // Weak monitoring
  if (responseMatchesIndicator(responses.intrusion_3, 'local alarm') ||
      responseMatchesIndicator(responses.intrusion_3, 'email/sms') ||
      responseMatchesIndicator(responses.intrusion_3, 'no monitoring')) {
    riskFactorCount += 1;
  }
  
  // System rarely tested
  if (responseMatchesIndicator(responses.intrusion_4, 'rarely or never')) {
    riskFactorCount += 1;
  }
  
  // Excessive false alarms (system often disabled)
  if (responseMatchesIndicator(responses.intrusion_5, 'excessive false alarms')) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // SECURITY PERSONNEL & PROCEDURES ANALYSIS
  // =========================================================================
  
  // No dedicated security
  if (responseMatchesIndicator(responses.personnel_1, 'no dedicated security')) {
    riskFactorCount += 1;
  }
  
  // No background checks - CRITICAL for insider threat
  if (responseMatchesIndicator(responses.personnel_3, 'no background checks')) {
    riskFactorCount += 2;
  }
  
  // Weak security training
  if (responseMatchesIndicator(responses.personnel_4, 'informal') ||
      responseMatchesIndicator(responses.personnel_4, 'no security training')) {
    riskFactorCount += 1;
  }
  
  // No executive security training
  if (isNoResponse(responses.personnel_5)) {
    riskFactorCount += 1;
  }
  
  // No documented policies
  if (responseMatchesIndicator(responses.personnel_6, 'no documented policies')) {
    riskFactorCount += 1;
  }
  
  // Policies rarely updated
  if (responseMatchesIndicator(responses.personnel_7, 'only when incidents') ||
      responseMatchesIndicator(responses.personnel_7, 'rarely or never')) {
    riskFactorCount += 1;
  }
  
  // No anonymous reporting
  if (isNoResponse(responses.personnel_8)) {
    riskFactorCount += 1;
  }
  
  // No designated security manager
  if (isNoResponse(responses.personnel_9)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // EMERGENCY PREPAREDNESS ANALYSIS
  // =========================================================================
  
  // No emergency plan - CRITICAL
  if (isNoResponse(responses.emergency_1)) {
    riskFactorCount += 2;
  }
  
  // No formal emergency plan
  if (responseMatchesIndicator(responses.emergency_2, 'no formal emergency plan')) {
    riskFactorCount += 2;
  }
  
  // No or rare emergency drills
  if (responseMatchesIndicator(responses.emergency_3, 'rarely') ||
      responseMatchesIndicator(responses.emergency_3, 'never')) {
    riskFactorCount += 1;
  }
  
  // No mass notification - CRITICAL for WPV
  if (responseMatchesIndicator(responses.emergency_4, 'no mass notification')) {
    riskFactorCount += 2;
  }
  
  // No panic buttons
  if (responseMatchesIndicator(responses.emergency_5, 'no panic buttons')) {
    riskFactorCount += 1;
  }
  
  // No lockdown capability
  if (isNoResponse(responses.emergency_6)) {
    riskFactorCount += 1;
  }
  
  // No rally points
  if (isNoResponse(responses.emergency_7)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // CYBER-PHYSICAL SECURITY ANALYSIS
  // =========================================================================
  
  // No network segregation
  if (isNoResponse(responses.cyber_1)) {
    riskFactorCount += 1;
  }
  
  // No visitor WiFi segregation
  if (isNoResponse(responses.cyber_2)) {
    riskFactorCount += 1;
  }
  
  // Security systems rarely updated
  if (responseMatchesIndicator(responses.cyber_3, 'rarely updated') ||
      responseMatchesIndicator(responses.cyber_3, 'unknown')) {
    riskFactorCount += 1;
  }
  
  // Using default passwords - CRITICAL
  if (isYesResponse(responses.cyber_4)) {
    riskFactorCount += 1;
  }
  
  // No physical/cyber coordination
  if (isNoResponse(responses.cyber_5)) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // DOCUMENT & DATA SECURITY ANALYSIS
  // =========================================================================
  
  // No clean desk policy
  if (isNoResponse(responses.document_1)) {
    riskFactorCount += 1;
  }
  
  // Clean desk policy not enforced
  if (responseMatchesIndicator(responses.document_1a, 'not enforced') ||
      responseMatchesIndicator(responses.document_1a, 'no enforcement')) {
    riskFactorCount += 1;
  }
  
  // No secure document destruction
  if (isNoResponse(responses.document_2)) {
    riskFactorCount += 1;
  }
  
  // No secure print release
  if (isNoResponse(responses.document_3)) {
    riskFactorCount += 1;
  }
  
  // Weak photography policy
  if (responseMatchesIndicator(responses.document_4, 'informal guidelines') ||
      responseMatchesIndicator(responses.document_4, 'no policy')) {
    riskFactorCount += 1;
  }
  
  // Open file storage
  if (responseMatchesIndicator(responses.document_5, 'open shelving in general')) {
    riskFactorCount += 1;
  }
  
  // No security audits
  if (responseMatchesIndicator(responses.document_6, 'no audits')) {
    riskFactorCount += 1;
  }

  // =========================================================================
  // LOADING DOCK ANALYSIS
  // =========================================================================
  
  if (isYesResponse(responses.loading_1)) {
    // Loading dock with open access
    if (responseMatchesIndicator(responses.loading_2, 'open access')) {
      riskFactorCount += 2;
    }
    
    // No loading dock CCTV
    if (isNoResponse(responses.loading_3)) {
      riskFactorCount += 1;
    }
    
    // Weak delivery verification
    if (responseMatchesIndicator(responses.loading_4, 'sometimes verified') ||
        responseMatchesIndicator(responses.loading_4, 'no formal verification')) {
      riskFactorCount += 1;
    }
    
    // No separation from office areas
    if (isNoResponse(responses.loading_5)) {
      riskFactorCount += 1;
    }
  }

  // =========================================================================
  // CALCULATE FINAL SCORE
  // =========================================================================
  
  // Office uses divisor of 3 (more stable than retail's 2)
  // Each 3 risk factors increases vulnerability by 1 point
  vulnerabilityScore = Math.min(5, vulnerabilityScore + Math.floor(riskFactorCount / 3));
  
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
  
  // Workplace violence history
  if (isYesResponse(responses.incident_1)) {
    if (threatId === 'workplace_violence' || threatId === 'active_shooter') {
      likelihood += 2;
    }
    // Weapon or active threat history is more severe
    if (responseMatchesIndicator(responses.incident_1a, 'weapon') ||
        responseMatchesIndicator(responses.incident_1a, 'active threat')) {
      likelihood += 1;
    }
  }
  
  // Theft history
  if (isYesResponse(responses.incident_2)) {
    if (threatId === 'theft_burglary' || threatId === 'insider_threat') {
      likelihood += 1;
    }
    // Frequent theft is worse
    if (responseMatchesIndicator(responses.incident_2a, 'frequently') ||
        responseMatchesIndicator(responses.incident_2a, 'very frequently')) {
      likelihood += 1;
    }
  }
  
  // Data breach history
  if (isYesResponse(responses.incident_3)) {
    if (threatId === 'data_breach_physical' || threatId === 'corporate_espionage') {
      likelihood += 2;
    }
  }
  
  // Bomb threat history
  if (isYesResponse(responses.incident_4)) {
    if (threatId === 'terrorism_bomb_threat') {
      likelihood += 2;
    }
  }
  
  // Executive targeting history
  if (isYesResponse(responses.incident_5)) {
    if (threatId === 'executive_targeting') {
      likelihood += 2;
    }
    if (threatId === 'workplace_violence') {
      likelihood += 1;
    }
  }
  
  // Break-in history
  if (isYesResponse(responses.perimeter_8)) {
    if (threatId === 'after_hours_intrusion' || threatId === 'theft_burglary') {
      likelihood += 2;
    }
  }
  
  // Unauthorized entry history
  if (isYesResponse(responses.entry_10)) {
    if (threatId === 'unauthorized_access') {
      likelihood += 2;
    }
    if (responseMatchesIndicator(responses.entry_10a, 'frequently') ||
        responseMatchesIndicator(responses.entry_10a, 'very frequently')) {
      likelihood += 1;
    }
  }
  
  // Parking incident history
  if (isYesResponse(responses.parking_5)) {
    if (threatId === 'theft_burglary' || threatId === 'executive_targeting') {
      likelihood += 1;
    }
  }

  // =========================================================================
  // FACTOR 2: FACILITY PROFILE & EXPOSURE
  // =========================================================================
  
  // High-profile executives present
  if (isYesResponse(responses.overview_5)) {
    if (threatId === 'executive_targeting') {
      likelihood += 2;
    }
    if (threatId === 'workplace_violence' || threatId === 'terrorism_bomb_threat') {
      likelihood += 1;
    }
  }
  
  // Highly sensitive data
  if (responseMatchesIndicator(responses.overview_4, 'highly sensitive')) {
    if (threatId === 'data_breach_physical' || threatId === 'corporate_espionage') {
      likelihood += 1;
    }
  }
  
  // High-value assets
  if (responseMatchesIndicator(responses.overview_8, 'over $5 million') ||
      responseMatchesIndicator(responses.overview_8, '$1 million - $5 million')) {
    if (threatId === 'theft_burglary' || threatId === 'after_hours_intrusion') {
      likelihood += 1;
    }
  }
  
  // Multi-tenant / shared space
  if (responseMatchesIndicator(responses.overview_3, 'multi-tenant') ||
      responseMatchesIndicator(responses.overview_3, 'shared floor') ||
      responseMatchesIndicator(responses.overview_3, 'co-working')) {
    if (threatId === 'unauthorized_access' || threatId === 'corporate_espionage') {
      likelihood += 1;
    }
  }
  
  // High visitor volume
  if (responseMatchesIndicator(responses.overview_7, 'very high') ||
      responseMatchesIndicator(responses.overview_7, 'high (50-100)')) {
    if (threatId === 'unauthorized_access' || threatId === 'workplace_violence') {
      likelihood += 1;
    }
  }
  
  // Large employee count (harder to know everyone)
  if (responseMatchesIndicator(responses.overview_2, '500+') ||
      responseMatchesIndicator(responses.overview_2, '251-500')) {
    if (threatId === 'insider_threat' || threatId === 'unauthorized_access') {
      likelihood += 1;
    }
  }
  
  // Business function increases specific threats
  const businessFunction = responses.overview_1 || '';
  if (responseMatchesIndicator(businessFunction, 'financial') ||
      responseMatchesIndicator(businessFunction, 'trading')) {
    if (threatId === 'data_breach_physical' || threatId === 'corporate_espionage') {
      likelihood += 1;
    }
  }
  if (responseMatchesIndicator(businessFunction, 'corporate headquarters')) {
    if (threatId === 'executive_targeting' || threatId === 'civil_disturbance') {
      likelihood += 1;
    }
  }
  if (responseMatchesIndicator(businessFunction, 'government')) {
    if (threatId === 'terrorism_bomb_threat' || threatId === 'civil_disturbance') {
      likelihood += 1;
    }
  }

  // =========================================================================
  // FACTOR 3: PHYSICAL CONFIGURATION
  // =========================================================================
  
  // No perimeter security (direct street access)
  if (responseMatchesIndicator(responses.perimeter_1, 'no - building is directly')) {
    if (threatId === 'vehicle_ramming' || threatId === 'unauthorized_access') {
      likelihood += 1;
    }
  }
  
  // Open access during business hours
  if (responseMatchesIndicator(responses.entry_2, 'open access during business hours')) {
    if (threatId === 'unauthorized_access' || threatId === 'active_shooter') {
      likelihood += 1;
    }
  }
  
  // 24/7 operations
  if (responseMatchesIndicator(responses.overview_6, '24/7')) {
    if (threatId === 'after_hours_intrusion') {
      // Less likely if 24/7 operations (people always present)
      likelihood -= 1;
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
  // FACTOR 1: EMPLOYEE COUNT (life safety)
  // =========================================================================
  
  const employeeResponse = responses.overview_2 || '';
  if (responseMatchesIndicator(employeeResponse, '500+')) {
    impact += 2;
  } else if (responseMatchesIndicator(employeeResponse, '251-500')) {
    impact += 1;
  } else if (responseMatchesIndicator(employeeResponse, '101-250')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 2: ASSET VALUE
  // =========================================================================
  
  const assetResponse = responses.overview_8 || '';
  if (responseMatchesIndicator(assetResponse, 'over $5 million')) {
    impact += 2;
  } else if (responseMatchesIndicator(assetResponse, '$1 million - $5 million')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 3: DATA SENSITIVITY
  // =========================================================================
  
  if (responseMatchesIndicator(responses.overview_4, 'highly sensitive')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 4: BUSINESS FUNCTION
  // =========================================================================
  
  const businessFunction = responses.overview_1 || '';
  
  // Corporate HQ - reputational impact is severe
  if (responseMatchesIndicator(businessFunction, 'corporate headquarters')) {
    impact += 1;
  }
  
  // Financial services - regulatory impact
  if (responseMatchesIndicator(businessFunction, 'financial') ||
      responseMatchesIndicator(businessFunction, 'trading')) {
    impact += 1;
  }
  
  // Healthcare - HIPAA impact
  if (responseMatchesIndicator(businessFunction, 'healthcare')) {
    impact += 1;
  }

  // =========================================================================
  // FACTOR 5: EXECUTIVE PRESENCE
  // =========================================================================
  
  if (isYesResponse(responses.overview_5)) {
    // Executive presence increases impact for targeting threats
    if (threatId === 'executive_targeting' || threatId === 'workplace_violence') {
      impact += 1;
    }
  }

  // =========================================================================
  // THREAT-SPECIFIC IMPACT OVERRIDES
  // =========================================================================
  
  // Active Shooter - Always maximum impact (life safety)
  if (threatId === 'active_shooter') {
    impact = 5;
  }
  
  // Workplace Violence - Life safety concern
  if (threatId === 'workplace_violence') {
    impact = Math.max(impact, 4);
  }
  
  // Executive Targeting - Severe business impact
  if (threatId === 'executive_targeting') {
    impact = Math.max(impact, 4);
  }
  
  // Terrorism/Bomb Threat - Mass casualty potential
  if (threatId === 'terrorism_bomb_threat') {
    impact = 5;
  }
  
  // Vehicle Ramming - Mass casualty potential
  if (threatId === 'vehicle_ramming') {
    impact = 5;
  }
  
  // Data Breach - Regulatory and reputational impact
  if (threatId === 'data_breach_physical') {
    if (responseMatchesIndicator(responses.overview_4, 'highly sensitive')) {
      impact = Math.max(impact, 4);
    }
  }
  
  // Corporate Espionage - Competitive impact
  if (threatId === 'corporate_espionage') {
    if (responseMatchesIndicator(responses.overview_1, 'research') ||
        responseMatchesIndicator(responses.overview_1, 'technology')) {
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

  // =========================================================================
  // PERIMETER SECURITY CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.perimeter_1, 'no - building is directly')) {
    recommendations.add('vehicle_barriers_bollards');
    recommendations.add('setback_distance');
  }
  
  if (isLowRating(responses.perimeter_2)) {
    recommendations.add('perimeter_lighting');
  }
  
  if (isYesResponse(responses.perimeter_3)) {
    recommendations.add('cpted_landscaping');
  }
  
  if (isNoResponse(responses.perimeter_4)) {
    recommendations.add('cctv_perimeter');
  }
  
  if (isNoResponse(responses.perimeter_6)) {
    recommendations.add('intrusion_detection_system');
    recommendations.add('door_contact_sensors');
  }
  
  if (responseMatchesIndicator(responses.perimeter_7, 'notification via email') ||
      responseMatchesIndicator(responses.perimeter_7, 'no intrusion detection')) {
    recommendations.add('central_station_monitoring');
  }

  // =========================================================================
  // PARKING SECURITY CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.parking_2, 'no access control')) {
    recommendations.add('parking_access_control');
  }
  
  if (isNoResponse(responses.parking_3)) {
    recommendations.add('parking_cctv');
  }
  
  if (isLowRating(responses.parking_4)) {
    recommendations.add('parking_lighting');
  }

  // =========================================================================
  // BUILDING ENTRY CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.entry_2, 'open access')) {
    recommendations.add('badge_access_control_system');
    recommendations.add('security_officer_reception');
  }
  
  if (responseMatchesIndicator(responses.entry_3, 'no - open entry') ||
      responseMatchesIndicator(responses.entry_3, 'no - completely open')) {
    recommendations.add('anti_tailgating_measures');
    recommendations.add('turnstiles_mantraps');
  }
  
  if (isNoResponse(responses.entry_4)) {
    recommendations.add('security_officer_reception');
  }
  
  if (responseMatchesIndicator(responses.entry_5, 'paper sign-in') ||
      responseMatchesIndicator(responses.entry_5, 'no formal visitor')) {
    recommendations.add('visitor_management_system');
  }
  
  if (responseMatchesIndicator(responses.entry_6, 'no escort policy')) {
    recommendations.add('visitor_escort_policy');
  }
  
  if (isNoResponse(responses.entry_7)) {
    recommendations.add('cctv_entry_points');
  }
  
  if (isNoResponse(responses.entry_9)) {
    recommendations.add('perimeter_door_alarms');
  }

  // =========================================================================
  // INTERIOR ACCESS CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.interior_1)) {
    recommendations.add('zone_based_access_control');
  }
  
  if (responseMatchesIndicator(responses.interior_2, 'no - executive areas')) {
    recommendations.add('executive_suite_access_control');
  }
  
  if (responseMatchesIndicator(responses.interior_3, 'physical key') ||
      responseMatchesIndicator(responses.interior_3, 'no dedicated IT')) {
    recommendations.add('server_room_access_control');
  }
  
  if (isNoResponse(responses.interior_4)) {
    recommendations.add('server_room_cctv');
  }
  
  if (isNoResponse(responses.interior_7)) {
    recommendations.add('cctv_common_areas');
  }
  
  if (responseMatchesIndicator(responses.interior_8, 'rarely reviewed') ||
      responseMatchesIndicator(responses.interior_8, 'no formal access')) {
    recommendations.add('access_rights_management');
    recommendations.add('periodic_access_audits');
  }

  // =========================================================================
  // SURVEILLANCE CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.surveillance_1, 'no cameras') ||
      responseMatchesIndicator(responses.surveillance_1, '1-10 cameras')) {
    recommendations.add('cctv_comprehensive_coverage');
  }
  
  if (responseMatchesIndicator(responses.surveillance_3, 'less than 7 days')) {
    recommendations.add('video_storage_upgrade');
  }
  
  if (responseMatchesIndicator(responses.surveillance_4, 'no - recording only')) {
    recommendations.add('real_time_monitoring');
  }

  // =========================================================================
  // INTRUSION DETECTION CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.intrusion_1)) {
    recommendations.add('intrusion_detection_system');
    recommendations.add('motion_detectors');
    recommendations.add('glass_break_sensors');
  }
  
  if (responseMatchesIndicator(responses.intrusion_3, 'local alarm') ||
      responseMatchesIndicator(responses.intrusion_3, 'email/sms')) {
    recommendations.add('central_station_monitoring');
  }

  // =========================================================================
  // PERSONNEL & PROCEDURE CONTROLS
  // =========================================================================
  
  if (responseMatchesIndicator(responses.personnel_1, 'no dedicated security')) {
    recommendations.add('security_officer_staffing');
  }
  
  if (responseMatchesIndicator(responses.personnel_3, 'no background checks')) {
    recommendations.add('employee_background_checks');
  }
  
  if (responseMatchesIndicator(responses.personnel_4, 'no security training')) {
    recommendations.add('security_awareness_training');
  }
  
  if (isNoResponse(responses.personnel_5)) {
    recommendations.add('executive_security_training');
  }
  
  if (isNoResponse(responses.personnel_8)) {
    recommendations.add('anonymous_reporting_system');
  }

  // =========================================================================
  // EMERGENCY PREPAREDNESS CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.emergency_1) ||
      responseMatchesIndicator(responses.emergency_2, 'no formal emergency plan')) {
    recommendations.add('emergency_response_plan');
  }
  
  if (responseMatchesIndicator(responses.emergency_3, 'rarely') ||
      responseMatchesIndicator(responses.emergency_3, 'never')) {
    recommendations.add('emergency_drill_program');
  }
  
  if (responseMatchesIndicator(responses.emergency_4, 'no mass notification')) {
    recommendations.add('mass_notification_system');
  }
  
  if (responseMatchesIndicator(responses.emergency_5, 'no panic buttons')) {
    recommendations.add('panic_duress_alarms');
  }
  
  if (isNoResponse(responses.emergency_6)) {
    recommendations.add('lockdown_capability');
  }

  // =========================================================================
  // CYBER-PHYSICAL CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.cyber_1)) {
    recommendations.add('network_segregation');
  }
  
  if (isYesResponse(responses.cyber_4)) {
    recommendations.add('password_management_program');
  }
  
  if (isNoResponse(responses.cyber_5)) {
    recommendations.add('converged_security_program');
  }

  // =========================================================================
  // DOCUMENT SECURITY CONTROLS
  // =========================================================================
  
  if (isNoResponse(responses.document_1)) {
    recommendations.add('clean_desk_policy');
  }
  
  if (isNoResponse(responses.document_2)) {
    recommendations.add('secure_document_destruction');
  }
  
  if (isNoResponse(responses.document_3)) {
    recommendations.add('secure_print_release');
  }
  
  if (responseMatchesIndicator(responses.document_4, 'no policy')) {
    recommendations.add('photography_recording_policy');
  }

  // =========================================================================
  // LOADING DOCK CONTROLS
  // =========================================================================
  
  if (isYesResponse(responses.loading_1)) {
    if (responseMatchesIndicator(responses.loading_2, 'open access')) {
      recommendations.add('loading_dock_access_control');
    }
    if (isNoResponse(responses.loading_3)) {
      recommendations.add('loading_dock_cctv');
    }
    if (responseMatchesIndicator(responses.loading_4, 'no formal verification')) {
      recommendations.add('delivery_verification_procedures');
    }
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
  threat: typeof OFFICE_BUILDING_THREATS[0],
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
  
  // Unauthorized Access observations
  if (threat.id === 'unauthorized_access') {
    if (responseMatchesIndicator(responses.entry_2, 'open access')) {
      observations.push('open building access during business hours');
    }
    if (responseMatchesIndicator(responses.entry_3, 'no - open entry')) {
      observations.push('no anti-tailgating measures');
    }
    if (responseMatchesIndicator(responses.entry_5, 'no formal visitor')) {
      observations.push('no formal visitor management');
    }
    if (isYesResponse(responses.entry_10)) {
      observations.push('history of unauthorized entry incidents');
    }
  }
  
  // Workplace Violence observations
  if (threat.id === 'workplace_violence' || threat.id === 'active_shooter') {
    if (responseMatchesIndicator(responses.emergency_4, 'no mass notification')) {
      observations.push('no mass notification system');
    }
    if (isNoResponse(responses.emergency_6)) {
      observations.push('no lockdown capability');
    }
    if (responseMatchesIndicator(responses.emergency_5, 'no panic buttons')) {
      observations.push('no panic/duress alarms');
    }
    if (isYesResponse(responses.incident_1)) {
      observations.push('history of workplace violence incidents');
    }
  }
  
  // Theft & Burglary observations
  if (threat.id === 'theft_burglary' || threat.id === 'after_hours_intrusion') {
    if (isNoResponse(responses.intrusion_1)) {
      observations.push('no intrusion detection system');
    }
    if (responseMatchesIndicator(responses.surveillance_1, 'no cameras')) {
      observations.push('no CCTV system installed');
    }
    if (isYesResponse(responses.incident_2)) {
      observations.push('history of theft incidents');
    }
    if (isYesResponse(responses.perimeter_8)) {
      observations.push('history of break-in attempts');
    }
  }
  
  // Executive Targeting observations
  if (threat.id === 'executive_targeting') {
    if (responseMatchesIndicator(responses.interior_2, 'no - executive areas')) {
      observations.push('executive areas lack enhanced security');
    }
    if (isNoResponse(responses.personnel_5)) {
      observations.push('no executive security training');
    }
    if (isYesResponse(responses.incident_5)) {
      observations.push('history of executive targeting incidents');
    }
  }
  
  // Data Breach observations
  if (threat.id === 'data_breach_physical' || threat.id === 'corporate_espionage') {
    if (isNoResponse(responses.document_1)) {
      observations.push('no clean desk policy');
    }
    if (responseMatchesIndicator(responses.interior_3, 'no dedicated IT')) {
      observations.push('weak server room security');
    }
    if (responseMatchesIndicator(responses.entry_6, 'no escort policy')) {
      observations.push('visitors not escorted');
    }
    if (isYesResponse(responses.incident_3)) {
      observations.push('history of suspected data breaches');
    }
  }
  
  // Terrorism observations
  if (threat.id === 'terrorism_bomb_threat' || threat.id === 'vehicle_ramming') {
    if (responseMatchesIndicator(responses.perimeter_1, 'no - building is directly')) {
      observations.push('no setback from public areas');
    }
    if (isYesResponse(responses.incident_4)) {
      observations.push('history of bomb threat incidents');
    }
  }
  
  // Insider Threat observations
  if (threat.id === 'insider_threat') {
    if (responseMatchesIndicator(responses.personnel_3, 'no background checks')) {
      observations.push('no employee background checks');
    }
    if (isNoResponse(responses.personnel_8)) {
      observations.push('no anonymous reporting system');
    }
    if (responseMatchesIndicator(responses.interior_8, 'no formal access')) {
      observations.push('no formal access management process');
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

  // Process each threat in the Office Building threat library
  for (const threat of OFFICE_BUILDING_THREATS) {
    
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
      const threat = OFFICE_BUILDING_THREATS[i];
      
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
          description: `${threat.description} - ASIS Code: ${threat.asisCode}`,
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
 * Calculate overall building security posture score
 */
export function calculateOverallSecurityScore(
  responses: InterviewResponses
): SecurityScoreResult {
  let totalFactors = 0;
  let securityFactors = 0;
  const findings: string[] = [];
  const strengths: string[] = [];
  const categoryScores: Record<string, number> = {};

  // =========================================================================
  // CATEGORY: ACCESS CONTROL (weight: 20%)
  // =========================================================================
  let accessControlScore = 0;
  let accessControlTotal = 0;
  
  // Badge access control
  accessControlTotal++;
  if (!responseMatchesIndicator(responses.entry_2, 'open access')) {
    accessControlScore++;
    strengths.push('Electronic access control at main entrance');
  } else {
    findings.push('Open access at main entrance');
  }
  
  // Anti-tailgating
  accessControlTotal++;
  if (!responseMatchesIndicator(responses.entry_3, 'no - open entry') &&
      !responseMatchesIndicator(responses.entry_3, 'no - completely open')) {
    accessControlScore++;
  } else {
    findings.push('No anti-tailgating measures');
  }
  
  // Visitor management
  accessControlTotal++;
  if (!responseMatchesIndicator(responses.entry_5, 'no formal visitor')) {
    accessControlScore++;
    if (responseMatchesIndicator(responses.entry_5, 'digital system with ID')) {
      strengths.push('Digital visitor management with ID verification');
    }
  } else {
    findings.push('No formal visitor management');
  }
  
  // Zone-based access
  accessControlTotal++;
  if (isYesResponse(responses.interior_1)) {
    accessControlScore++;
    strengths.push('Zone-based access control implemented');
  } else {
    findings.push('No zone-based access control');
  }
  
  categoryScores['accessControl'] = Math.round((accessControlScore / accessControlTotal) * 100);
  totalFactors += accessControlTotal;
  securityFactors += accessControlScore;

  // =========================================================================
  // CATEGORY: SURVEILLANCE (weight: 15%)
  // =========================================================================
  let surveillanceScore = 0;
  let surveillanceTotal = 0;
  
  // CCTV system exists
  surveillanceTotal++;
  if (!responseMatchesIndicator(responses.surveillance_1, 'no cameras')) {
    surveillanceScore++;
    if (responseMatchesIndicator(responses.surveillance_1, '50+') ||
        responseMatchesIndicator(responses.surveillance_1, '25-49')) {
      strengths.push('Comprehensive CCTV coverage');
    }
  } else {
    findings.push('No CCTV system installed');
  }
  
  // Entry point CCTV
  surveillanceTotal++;
  if (isYesResponse(responses.entry_7)) {
    surveillanceScore++;
  } else {
    findings.push('No CCTV at entry/exit points');
  }
  
  // Parking CCTV
  surveillanceTotal++;
  if (isYesResponse(responses.parking_3)) {
    surveillanceScore++;
  } else {
    findings.push('No parking area CCTV');
  }
  
  // Video retention
  surveillanceTotal++;
  if (!responseMatchesIndicator(responses.surveillance_3, 'less than 7 days')) {
    surveillanceScore++;
  } else {
    findings.push('Video retention less than 7 days');
  }
  
  categoryScores['surveillance'] = Math.round((surveillanceScore / surveillanceTotal) * 100);
  totalFactors += surveillanceTotal;
  securityFactors += surveillanceScore;

  // =========================================================================
  // CATEGORY: INTRUSION DETECTION (weight: 15%)
  // =========================================================================
  let intrusionScore = 0;
  let intrusionTotal = 0;
  
  // Intrusion detection system
  intrusionTotal++;
  if (isYesResponse(responses.intrusion_1)) {
    intrusionScore++;
    strengths.push('Intrusion detection system installed');
  } else {
    findings.push('No intrusion detection system');
  }
  
  // 24/7 monitoring
  intrusionTotal++;
  if (responseMatchesIndicator(responses.intrusion_3, 'central station') ||
      responseMatchesIndicator(responses.intrusion_3, 'security operations center')) {
    intrusionScore++;
    strengths.push('24/7 central station monitoring');
  } else {
    findings.push('No 24/7 professional alarm monitoring');
  }
  
  // Forced entry alarms
  intrusionTotal++;
  if (isYesResponse(responses.entry_9)) {
    intrusionScore++;
  } else {
    findings.push('No forced entry alarms on doors');
  }
  
  categoryScores['intrusionDetection'] = Math.round((intrusionScore / intrusionTotal) * 100);
  totalFactors += intrusionTotal;
  securityFactors += intrusionScore;

  // =========================================================================
  // CATEGORY: EMERGENCY PREPAREDNESS (weight: 20%)
  // =========================================================================
  let emergencyScore = 0;
  let emergencyTotal = 0;
  
  // Emergency plan
  emergencyTotal++;
  if (isYesResponse(responses.emergency_1)) {
    emergencyScore++;
    strengths.push('Written emergency response plan');
  } else {
    findings.push('No written emergency response plan');
  }
  
  // Emergency drills
  emergencyTotal++;
  if (!responseMatchesIndicator(responses.emergency_3, 'rarely') &&
      !responseMatchesIndicator(responses.emergency_3, 'never')) {
    emergencyScore++;
  } else {
    findings.push('Emergency drills conducted rarely or never');
  }
  
  // Mass notification
  emergencyTotal++;
  if (!responseMatchesIndicator(responses.emergency_4, 'no mass notification')) {
    emergencyScore++;
    if (responseMatchesIndicator(responses.emergency_4, 'multi-channel')) {
      strengths.push('Multi-channel mass notification system');
    }
  } else {
    findings.push('No mass notification system');
  }
  
  // Panic alarms
  emergencyTotal++;
  if (!responseMatchesIndicator(responses.emergency_5, 'no panic buttons')) {
    emergencyScore++;
  } else {
    findings.push('No panic/duress alarms');
  }
  
  // Lockdown capability
  emergencyTotal++;
  if (isYesResponse(responses.emergency_6)) {
    emergencyScore++;
    strengths.push('Lockdown capability available');
  } else {
    findings.push('No lockdown capability');
  }
  
  categoryScores['emergencyPreparedness'] = Math.round((emergencyScore / emergencyTotal) * 100);
  totalFactors += emergencyTotal;
  securityFactors += emergencyScore;

  // =========================================================================
  // CATEGORY: SECURITY PERSONNEL & TRAINING (weight: 15%)
  // =========================================================================
  let personnelScore = 0;
  let personnelTotal = 0;
  
  // Security personnel
  personnelTotal++;
  if (!responseMatchesIndicator(responses.personnel_1, 'no dedicated security')) {
    personnelScore++;
    if (responseMatchesIndicator(responses.personnel_1, '24/7')) {
      strengths.push('24/7 security personnel on-site');
    }
  } else {
    findings.push('No dedicated security personnel');
  }
  
  // Background checks
  personnelTotal++;
  if (!responseMatchesIndicator(responses.personnel_3, 'no background checks')) {
    personnelScore++;
    if (responseMatchesIndicator(responses.personnel_3, 'comprehensive')) {
      strengths.push('Comprehensive employee background checks');
    }
  } else {
    findings.push('No employee background checks');
  }
  
  // Security training
  personnelTotal++;
  if (!responseMatchesIndicator(responses.personnel_4, 'no security training')) {
    personnelScore++;
  } else {
    findings.push('No security awareness training');
  }
  
  // Security manager
  personnelTotal++;
  if (isYesResponse(responses.personnel_9)) {
    personnelScore++;
    strengths.push('Designated security manager');
  } else {
    findings.push('No designated security manager');
  }
  
  categoryScores['securityPersonnel'] = Math.round((personnelScore / personnelTotal) * 100);
  totalFactors += personnelTotal;
  securityFactors += personnelScore;

  // =========================================================================
  // CATEGORY: INFORMATION SECURITY (weight: 15%)
  // =========================================================================
  let infoSecScore = 0;
  let infoSecTotal = 0;
  
  // Clean desk policy
  infoSecTotal++;
  if (isYesResponse(responses.document_1)) {
    infoSecScore++;
  } else {
    findings.push('No clean desk policy');
  }
  
  // Secure document destruction
  infoSecTotal++;
  if (isYesResponse(responses.document_2)) {
    infoSecScore++;
    strengths.push('Secure document destruction');
  } else {
    findings.push('No secure document destruction');
  }
  
  // Server room security
  infoSecTotal++;
  if (responseMatchesIndicator(responses.interior_3, 'multi-factor') ||
      responseMatchesIndicator(responses.interior_3, 'card reader with audit')) {
    infoSecScore++;
    strengths.push('Server room access control');
  } else {
    findings.push('Weak server room security');
  }
  
  // Network segregation
  infoSecTotal++;
  if (isYesResponse(responses.cyber_1)) {
    infoSecScore++;
  } else {
    findings.push('Security systems not network-segregated');
  }
  
  categoryScores['informationSecurity'] = Math.round((infoSecScore / infoSecTotal) * 100);
  totalFactors += infoSecTotal;
  securityFactors += infoSecScore;

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

  // Count factors by category for transparency
  // This can be expanded for detailed reporting
  
  const categories = [
    'perimeter',
    'parking',
    'entry',
    'interior',
    'surveillance',
    'intrusion',
    'personnel',
    'emergency',
    'cyber',
    'document',
    'loading',
  ];
  
  for (const category of categories) {
    byCategory[category] = 0;
  }

  // Perimeter factors
  if (responseMatchesIndicator(responses.perimeter_1, 'no - building is directly')) {
    byCategory['perimeter'] += 2;
    details.push('No perimeter security (+2)');
  }
  if (isLowRating(responses.perimeter_2)) {
    byCategory['perimeter'] += 1;
    details.push('Poor exterior lighting (+1)');
  }
  if (isYesResponse(responses.perimeter_3)) {
    byCategory['perimeter'] += 1;
    details.push('Concealment landscaping (+1)');
  }
  if (isNoResponse(responses.perimeter_4)) {
    byCategory['perimeter'] += 1;
    details.push('No perimeter CCTV (+1)');
  }
  if (isNoResponse(responses.perimeter_6)) {
    byCategory['perimeter'] += 1;
    details.push('No perimeter intrusion detection (+1)');
  }

  // Entry factors
  if (responseMatchesIndicator(responses.entry_2, 'open access during business hours')) {
    byCategory['entry'] += 3;
    details.push('Open building access (+3)');
  }
  if (responseMatchesIndicator(responses.entry_3, 'no - open entry')) {
    byCategory['entry'] += 2;
    details.push('No anti-tailgating (+2)');
  }
  if (responseMatchesIndicator(responses.entry_5, 'no formal visitor')) {
    byCategory['entry'] += 2;
    details.push('No visitor management (+2)');
  }

  // Emergency factors
  if (isNoResponse(responses.emergency_1)) {
    byCategory['emergency'] += 2;
    details.push('No emergency plan (+2)');
  }
  if (responseMatchesIndicator(responses.emergency_4, 'no mass notification')) {
    byCategory['emergency'] += 2;
    details.push('No mass notification (+2)');
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
  const results = OFFICE_BUILDING_THREATS.map(threat => {
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
  OFFICE_BUILDING_THREATS,
  THREAT_CONTROL_MAPPING,
};
