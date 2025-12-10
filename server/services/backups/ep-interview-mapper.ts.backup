/**
 * Executive Protection Interview Risk Mapper
 * 
 * Implements the T×V×I×E calculation pipeline per RiskFixer Executive Protection Framework.
 * Transforms interview questionnaire responses into mathematically-derived risk scenarios.
 * 
 * KEY DIFFERENCE FROM FACILITY MAPPERS:
 * - Uses T×V×I×E formula (adds Exposure factor unique to EP)
 * - Person-centric rather than facility-centric
 * - Pattern predictability is weighted heavily
 * - Family considerations multiply attack surface
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Executive-Protection-Framework.md
 */

import { db } from '../db';
import { eq } from 'drizzle-orm';
import { assessments, riskScenarios, threatLibrary } from '@shared/schema';

// ============================================================================
// INTERFACES
// ============================================================================

export type InterviewResponses = Record<string, any>;

export interface EPInterviewRiskMapping {
  assessmentId: number;
  interviewResponses: InterviewResponses;
  threatId: string;
}

export interface EPCalculatedRiskInputs {
  threatLikelihood: number;
  vulnerability: number;
  impact: number;
  exposure: number;
  inherentRisk: number;
  normalizedRisk: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  suggestedControls: string[];
  riskFactorCount: number;
}

export interface EPNewRiskScenario {
  assessmentId: number;
  threatId: number;
  threatLikelihood: number;
  vulnerability: number;
  impact: number;
  exposure: number;
  inherentRisk: number;
  residualRisk: number;
  controlEffectiveness: number;
  riskLevel: string;
  scenarioDescription: string;
}

export interface EPGeneratedScenarioResult {
  success: boolean;
  generatedScenarios: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScenarioIds: number[];
  overallExposure: number;
}

// ============================================================================
// EXECUTIVE PROTECTION THREAT DEFINITIONS (12 threats)
// ============================================================================

export const EP_THREATS = [
  {
    id: 'kidnapping_abduction',
    name: 'Kidnapping / Abduction',
    category: 'Targeted Violence',
    baselineThreat: 4,
    baselineImpact: 10,
    description: 'Abduction of principal or family member for ransom or leverage',
    asisCode: 'EP-TV-001',
  },
  {
    id: 'stalking_surveillance',
    name: 'Stalking / Surveillance',
    category: 'Personal Security',
    baselineThreat: 5,
    baselineImpact: 6,
    description: 'Persistent unwanted attention, following, or hostile reconnaissance',
    asisCode: 'EP-PS-001',
  },
  {
    id: 'doxxing_privacy_breach',
    name: 'Doxxing / Privacy Breach',
    category: 'Digital Threat',
    baselineThreat: 6,
    baselineImpact: 5,
    description: 'Public release of personal information with malicious intent',
    asisCode: 'EP-DT-001',
  },
  {
    id: 'home_invasion',
    name: 'Home Invasion',
    category: 'Property Crime',
    baselineThreat: 4,
    baselineImpact: 8,
    description: 'Forced entry into residence with knowledge of occupant wealth',
    asisCode: 'EP-PC-001',
  },
  {
    id: 'extortion_blackmail',
    name: 'Extortion / Blackmail',
    category: 'Financial Crime',
    baselineThreat: 5,
    baselineImpact: 7,
    description: 'Demands for payment under threat of harm or exposure',
    asisCode: 'EP-FC-001',
  },
  {
    id: 'ambush_attack',
    name: 'Ambush / Attack',
    category: 'Targeted Violence',
    baselineThreat: 3,
    baselineImpact: 9,
    description: 'Pre-planned attack during transit or at known location',
    asisCode: 'EP-TV-002',
  },
  {
    id: 'workplace_violence',
    name: 'Workplace Violence',
    category: 'Workplace Security',
    baselineThreat: 4,
    baselineImpact: 8,
    description: 'Violence directed at principal at workplace',
    asisCode: 'EP-WS-001',
  },
  {
    id: 'travel_security_incidents',
    name: 'Travel Security Incidents',
    category: 'Travel Risk',
    baselineThreat: 4,
    baselineImpact: 7,
    description: 'Security incidents during domestic or international travel',
    asisCode: 'EP-TR-001',
  },
  {
    id: 'cyber_targeting_social_engineering',
    name: 'Cyber Targeting / Social Engineering',
    category: 'Digital Threat',
    baselineThreat: 6,
    baselineImpact: 5,
    description: 'Targeted cyber attacks or social engineering against principal',
    asisCode: 'EP-DT-002',
  },
  {
    id: 'family_member_targeting',
    name: 'Family Member Targeting',
    category: 'Targeted Violence',
    baselineThreat: 4,
    baselineImpact: 9,
    description: 'Targeting family members for leverage or harm',
    asisCode: 'EP-TV-003',
  },
  {
    id: 'reputational_attack',
    name: 'Reputational Attack',
    category: 'Information Threat',
    baselineThreat: 5,
    baselineImpact: 6,
    description: 'Coordinated campaign to damage reputation',
    asisCode: 'EP-IT-001',
  },
  {
    id: 'protest_demonstration_targeting',
    name: 'Protest / Demonstration Targeting',
    category: 'Public Safety',
    baselineThreat: 4,
    baselineImpact: 6,
    description: 'Targeting during public appearances by protest groups',
    asisCode: 'EP-PS-002',
  },
];

// ============================================================================
// THREAT-TO-CONTROL MAPPING
// ============================================================================

export const EP_THREAT_CONTROL_MAPPING: Record<string, string[]> = {
  kidnapping_abduction: [
    'executive_protection_detail_24x7',
    'executive_protection_detail_part_time',
    'secure_executive_driver_service',
    'advance_team_operations',
    'armored_vehicle_b6',
    'armored_vehicle_b4',
    'route_analysis_protocol',
    'counter_surveillance_operations',
    'personal_tracking_duress_device',
    'family_duress_code_system',
    'evacuation_route_planning',
    'international_travel_security_program',
  ],
  stalking_surveillance: [
    'counter_surveillance_operations',
    'protective_intelligence_program',
    'residential_security_team_24x7',
    'comprehensive_residential_cctv',
    'osint_monitoring_service',
    'social_media_privacy_lockdown',
    'digital_privacy_service',
    'property_records_privacy',
    'perimeter_intrusion_detection',
  ],
  doxxing_privacy_breach: [
    'digital_privacy_service',
    'social_media_privacy_lockdown',
    'osint_monitoring_service',
    'property_records_privacy',
    'digital_footprint_assessment',
    'secure_communications_platform',
    'personal_cyber_security_hardening',
  ],
  home_invasion: [
    'residential_security_team_24x7',
    'panic_room_safe_room',
    'perimeter_intrusion_detection',
    'controlled_access_gate',
    'residential_alarm_system_monitored',
    'reinforced_entry_doors',
    'ballistic_window_film',
    'vehicle_barriers_bollards',
    'emergency_response_plan',
    'family_duress_code_system',
    'comprehensive_residential_cctv',
  ],
  extortion_blackmail: [
    'protective_intelligence_program',
    'threat_assessment_consultation',
    'secure_communications_platform',
    'digital_privacy_service',
    'law_enforcement_liaison',
    'osint_monitoring_service',
  ],
  ambush_attack: [
    'executive_protection_detail_24x7',
    'secure_executive_driver_service',
    'armored_vehicle_b6',
    'armored_vehicle_b4',
    'route_analysis_protocol',
    'counter_surveillance_operations',
    'advance_team_operations',
    'vehicle_sweep_procedures',
    'evacuation_route_planning',
    'gps_vehicle_tracking',
  ],
  workplace_violence: [
    'executive_protection_detail_24x7',
    'executive_protection_detail_part_time',
    'protective_intelligence_program',
    'threat_assessment_consultation',
    'personal_defensive_training',
    'emergency_response_plan',
    'law_enforcement_liaison',
  ],
  travel_security_incidents: [
    'international_travel_security_program',
    'advance_team_operations',
    'secure_accommodation_protocols',
    'armored_vehicle_b6',
    'gps_vehicle_tracking',
    'medical_evacuation_insurance',
    'emergency_communication_protocol',
    'personal_tracking_duress_device',
  ],
  cyber_targeting_social_engineering: [
    'personal_cyber_security_hardening',
    'secure_communications_platform',
    'digital_footprint_assessment',
    'family_security_training',
    'mail_package_screening',
  ],
  family_member_targeting: [
    'family_security_training',
    'school_security_coordination',
    'family_duress_code_system',
    'household_staff_background_investigations',
    'child_gps_tracking',
    'secure_school_transportation',
    'residential_security_team_24x7',
    'panic_room_safe_room',
  ],
  reputational_attack: [
    'osint_monitoring_service',
    'protective_intelligence_program',
    'digital_privacy_service',
    'social_media_privacy_lockdown',
    'law_enforcement_liaison',
  ],
  protest_demonstration_targeting: [
    'executive_protection_detail_24x7',
    'advance_team_operations',
    'protective_intelligence_program',
    'route_analysis_protocol',
    'evacuation_route_planning',
    'emergency_response_plan',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

function responseEquals(response: any, value: string): boolean {
  if (typeof response === 'string') {
    return response === value;
  }
  if (Array.isArray(response)) {
    return response.includes(value);
  }
  return false;
}

function responseIncludes(response: any, value: string): boolean {
  if (Array.isArray(response)) {
    return response.includes(value);
  }
  return false;
}

export function classifyRiskLevel(normalizedRisk: number): 'critical' | 'high' | 'medium' | 'low' {
  if (normalizedRisk >= 75) return 'critical';
  if (normalizedRisk >= 50) return 'high';
  if (normalizedRisk >= 25) return 'medium';
  return 'low';
}

function getThreatById(threatId: string) {
  return EP_THREATS.find(t => t.id === threatId);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// EXPOSURE FACTOR CALCULATION (EP-SPECIFIC)
// ============================================================================

export function calculateExposureFactor(responses: InterviewResponses): number {
  if (!responses || typeof responses !== 'object') {
    return 2.5; // Safe default for missing responses
  }
  
  let exposureScore = 1.0;

  const profileLevel = responses.ep_public_profile_level;
  if (profileLevel === 'very_high') {
    exposureScore += 2.0;
  } else if (profileLevel === 'high') {
    exposureScore += 1.5;
  } else if (profileLevel === 'medium') {
    exposureScore += 1.0;
  } else if (profileLevel === 'low') {
    exposureScore += 0.5;
  }

  const routinePredictability = responses.ep_daily_routine_predictability;
  if (routinePredictability === 'highly_predictable') {
    exposureScore += 1.5;
  } else if (routinePredictability === 'somewhat_predictable') {
    exposureScore += 1.0;
  } else if (routinePredictability === 'variable') {
    exposureScore += 0.5;
  } else if (routinePredictability === 'randomized') {
    exposureScore -= 0.3;
  }

  const commutePattern = responses.ep_commute_pattern;
  if (commutePattern === 'same_route_same_time') {
    exposureScore += 0.5;
  } else if (commutePattern === 'same_route_varied_time') {
    exposureScore += 0.3;
  }

  const socialMedia = responses.ep_social_media_usage;
  if (socialMedia === 'very_active_public') {
    exposureScore += 1.0;
  } else if (socialMedia === 'active_public') {
    exposureScore += 0.7;
  } else if (socialMedia === 'moderate_friends_only') {
    exposureScore += 0.3;
  }

  if (responses.ep_social_media_opsec === 'yes') {
    exposureScore += 0.3;
  }

  const mediaCoverage = responses.ep_media_coverage;
  if (mediaCoverage === 'extensive') {
    exposureScore += 0.5;
  } else if (mediaCoverage === 'frequent') {
    exposureScore += 0.3;
  } else if (mediaCoverage === 'occasional') {
    exposureScore += 0.1;
  }

  const publicRecords = responses.ep_public_records_exposure || [];
  if (responseIncludes(publicRecords, 'home_address')) {
    exposureScore += 0.3;
  }
  if (responseIncludes(publicRecords, 'family_information')) {
    exposureScore += 0.2;
  }

  const familyDigital = responses.ep_family_digital_exposure;
  if (familyDigital === 'high_exposure') {
    exposureScore += 0.3;
  } else if (familyDigital === 'moderate_exposure') {
    exposureScore += 0.15;
  }

  const travelPublicity = responses.ep_travel_arrangements_publicity;
  if (travelPublicity === 'public_calendar') {
    exposureScore += 0.3;
  } else if (travelPublicity === 'widely_shared') {
    exposureScore += 0.2;
  }

  return clamp(exposureScore, 1.0, 5.0);
}

// ============================================================================
// THREAT LIKELIHOOD CALCULATION
// ============================================================================

export function calculateThreatLikelihood(
  responses: InterviewResponses,
  threatId: string
): number {
  const threat = getThreatById(threatId);
  let likelihood = threat?.baselineThreat || 4;

  const knownThreats = responses.ep_known_threats;
  if (knownThreats === 'yes_recent') {
    likelihood += 3;
  } else if (knownThreats === 'yes_past') {
    likelihood += 2;
  } else if (knownThreats === 'no_but_concerned') {
    likelihood += 1;
  }

  const netWorth = responses.ep_net_worth_range;
  const financialThreats = ['kidnapping_abduction', 'extortion_blackmail', 'home_invasion'];
  
  if (financialThreats.includes(threatId)) {
    if (netWorth === 'over_100m') {
      likelihood += 3;
    } else if (netWorth === '50m_to_100m') {
      likelihood += 2;
    } else if (netWorth === '10m_to_50m') {
      likelihood += 1;
    }
  }

  const profileLevel = responses.ep_public_profile_level;
  const visibilityThreats = ['stalking_surveillance', 'doxxing_privacy_breach', 'reputational_attack', 'protest_demonstration_targeting'];
  
  if (visibilityThreats.includes(threatId)) {
    if (profileLevel === 'very_high') {
      likelihood += 2;
    } else if (profileLevel === 'high') {
      likelihood += 1;
    }
  }

  const controversial = responses.ep_controversial_involvement;
  const controversyThreats = ['workplace_violence', 'stalking_surveillance', 'extortion_blackmail', 'protest_demonstration_targeting', 'reputational_attack'];
  
  if (controversyThreats.includes(threatId)) {
    if (controversial === 'yes_high_profile') {
      likelihood += 2;
    } else if (controversial === 'yes_moderate') {
      likelihood += 1;
    }
  }

  const industry = responses.ep_industry_sector;
  if (threatId === 'stalking_surveillance' || threatId === 'workplace_violence') {
    if (industry === 'entertainment' || industry === 'political' || industry === 'legal') {
      likelihood += 1;
    }
  }
  
  if (threatId === 'extortion_blackmail' || threatId === 'cyber_targeting_social_engineering') {
    if (industry === 'finance' || industry === 'technology') {
      likelihood += 1;
    }
  }

  const intlTravel = responses.ep_international_travel;
  const travelThreats = ['kidnapping_abduction', 'travel_security_incidents'];
  
  if (travelThreats.includes(threatId)) {
    if (intlTravel === 'yes_frequently') {
      likelihood += 2;
    } else if (intlTravel === 'yes_occasionally') {
      likelihood += 1;
    }
  }

  const familyMembers = responses.ep_family_members || [];
  if (threatId === 'family_member_targeting' || threatId === 'kidnapping_abduction') {
    if (responseIncludes(familyMembers, 'children_school_age')) {
      likelihood += 2;
    } else if (responseIncludes(familyMembers, 'children_college')) {
      likelihood += 1;
    }
  }

  const workplaceHistory = responses.ep_workplace_threat_history;
  if (threatId === 'workplace_violence') {
    if (workplaceHistory === 'yes_recent') {
      likelihood += 3;
    } else if (workplaceHistory === 'yes_past') {
      likelihood += 2;
    } else if (workplaceHistory === 'no_but_concerned') {
      likelihood += 1;
    }
  }

  const socialMediaUsage = responses.ep_social_media_usage;
  const socialThreats = ['stalking_surveillance', 'doxxing_privacy_breach', 'cyber_targeting_social_engineering'];
  
  if (socialThreats.includes(threatId)) {
    if (socialMediaUsage === 'very_active_public') {
      likelihood += 2;
    } else if (socialMediaUsage === 'active_public') {
      likelihood += 1;
    }
  }

  return clamp(likelihood, 1, 10);
}

// ============================================================================
// VULNERABILITY CALCULATION
// ============================================================================

export function calculateVulnerability(
  responses: InterviewResponses,
  threatId: string
): number {
  let vulnerability = 5;
  let riskFactorCount = 0;

  // Security posture (affects all threats)
  const securityLevel = responses.ep_current_security_level;
  if (securityLevel === 'none') {
    riskFactorCount += 3;
  } else if (securityLevel === 'minimal') {
    riskFactorCount += 2;
  } else if (securityLevel === 'moderate') {
    riskFactorCount += 1;
  } else if (securityLevel === '24x7_detail') {
    riskFactorCount -= 2;
  } else if (securityLevel === 'comprehensive') {
    riskFactorCount -= 1;
  }

  // Threat perception
  const threatPerception = responses.ep_threat_perception;
  if (threatPerception === 'not_concerned') {
    riskFactorCount += 2;
  } else if (threatPerception === 'minimal_concern') {
    riskFactorCount += 1;
  }

  // Residential security
  const residentialThreats = ['home_invasion', 'stalking_surveillance', 'family_member_targeting'];
  if (residentialThreats.includes(threatId)) {
    const visibility = responses.ep_residence_visibility;
    if (visibility === 'highly_visible') {
      riskFactorCount += 2;
    } else if (visibility === 'somewhat_visible') {
      riskFactorCount += 1;
    } else if (visibility === 'completely_secluded') {
      riskFactorCount -= 1;
    }

    const perimeter = responses.ep_residence_perimeter_security || [];
    if (responseIncludes(perimeter, 'none')) {
      riskFactorCount += 3;
    } else if (responseIncludes(perimeter, 'fence_basic') && !responseIncludes(perimeter, 'intrusion_detection')) {
      riskFactorCount += 1;
    }
    if (responseIncludes(perimeter, 'gate_manned') || responseIncludes(perimeter, 'intrusion_detection')) {
      riskFactorCount -= 1;
    }

    const alarm = responses.ep_residence_alarm_system;
    if (alarm === 'none') {
      riskFactorCount += 3;
    } else if (alarm === 'basic_unmonitored') {
      riskFactorCount += 2;
    } else if (alarm === 'monitored_with_armed_response') {
      riskFactorCount -= 1;
    }

    const safeRoom = responses.ep_safe_room;
    if (safeRoom === 'no') {
      riskFactorCount += 2;
    } else if (safeRoom === 'yes_purpose_built') {
      riskFactorCount -= 1;
    }

    const cctv = responses.ep_residence_cctv || [];
    if (responseIncludes(cctv, 'none')) {
      riskFactorCount += 3;
    } else if (responseIncludes(cctv, 'doorbell_camera') && cctv.length === 1) {
      riskFactorCount += 1;
    }
    if (responseIncludes(cctv, 'offsite_monitoring') || responseIncludes(cctv, 'analytics')) {
      riskFactorCount -= 1;
    }

    const policeTime = responses.ep_police_response_time;
    if (policeTime === 'over_15_min' || policeTime === 'unknown') {
      riskFactorCount += 2;
    }
  }

  // Pattern predictability
  const patternThreats = ['ambush_attack', 'kidnapping_abduction', 'stalking_surveillance'];
  if (patternThreats.includes(threatId)) {
    const routine = responses.ep_daily_routine_predictability;
    if (routine === 'highly_predictable') {
      riskFactorCount += 3;
    } else if (routine === 'somewhat_predictable') {
      riskFactorCount += 2;
    } else if (routine === 'variable') {
      riskFactorCount += 1;
    } else if (routine === 'randomized') {
      riskFactorCount -= 2;
    }

    const commute = responses.ep_commute_pattern;
    if (commute === 'same_route_same_time') {
      riskFactorCount += 3;
    } else if (commute === 'same_route_varied_time') {
      riskFactorCount += 2;
    } else if (commute === 'driver_service') {
      riskFactorCount -= 1;
    }
  }

  // Workplace security
  if (threatId === 'workplace_violence') {
    const accessControl = responses.ep_workplace_access_control;
    if (accessControl === 'open_public') {
      riskFactorCount += 3;
    } else if (accessControl === 'receptionist_only') {
      riskFactorCount += 2;
    } else if (accessControl === 'multi_layer' || accessControl === 'security_screening') {
      riskFactorCount -= 1;
    }

    const securityStaff = responses.ep_workplace_security_staff;
    if (securityStaff === 'none') {
      riskFactorCount += 2;
    } else if (securityStaff === 'contracted_limited') {
      riskFactorCount += 1;
    } else if (securityStaff === 'executive_protection_available') {
      riskFactorCount -= 1;
    }
  }

  // Travel & transportation
  const travelThreats = ['kidnapping_abduction', 'ambush_attack', 'travel_security_incidents'];
  if (travelThreats.includes(threatId)) {
    const vehicleType = responses.ep_vehicle_type;
    if (vehicleType === 'personal_luxury_conspicuous') {
      riskFactorCount += 2;
    } else if (vehicleType === 'driver_service_armored') {
      riskFactorCount -= 3;
    } else if (vehicleType === 'driver_service_standard') {
      riskFactorCount -= 1;
    }

    const vehicleSecurity = responses.ep_vehicle_security_features || [];
    if (responseIncludes(vehicleSecurity, 'none')) {
      riskFactorCount += 2;
    }
    if (responseIncludes(vehicleSecurity, 'armoring_full')) {
      riskFactorCount -= 2;
    }
  }

  // Digital threats
  const digitalThreats = ['doxxing_privacy_breach', 'cyber_targeting_social_engineering', 'stalking_surveillance'];
  if (digitalThreats.includes(threatId)) {
    const onlineManagement = responses.ep_online_presence_management;
    if (onlineManagement === 'no_management') {
      riskFactorCount += 2;
    } else if (onlineManagement === 'basic_privacy_settings') {
      riskFactorCount += 1;
    } else if (onlineManagement === 'professional_services') {
      riskFactorCount -= 1;
    }

    const publicRecords = responses.ep_public_records_exposure || [];
    if (responseIncludes(publicRecords, 'home_address')) {
      riskFactorCount += 2;
    }
    if (responseIncludes(publicRecords, 'family_information')) {
      riskFactorCount += 1;
    }
  }

  // Family security
  if (threatId === 'family_member_targeting' || threatId === 'kidnapping_abduction') {
    const familyTraining = responses.ep_family_security_awareness;
    if (familyTraining === 'no_training') {
      riskFactorCount += 2;
    } else if (familyTraining === 'informal_discussions') {
      riskFactorCount += 1;
    }

    const schoolCoord = responses.ep_school_security_coordination;
    if (schoolCoord === 'none') {
      riskFactorCount += 2;
    } else if (schoolCoord === 'basic') {
      riskFactorCount += 1;
    }
  }

  // Emergency preparedness
  const emergencyContacts = responses.ep_emergency_contacts;
  if (emergencyContacts === 'no_protocols') {
    riskFactorCount += 2;
  } else if (emergencyContacts === 'basic_contacts') {
    riskFactorCount += 1;
  }

  const duressCode = responses.ep_duress_code;
  if (duressCode === 'no_duress_codes') {
    riskFactorCount += 2;
  }

  // EP uses divisor of 3
  vulnerability = vulnerability + Math.floor(riskFactorCount / 3);
  
  return clamp(vulnerability, 1, 10);
}

// Alias for compatibility with other frameworks
export function calculateVulnerabilityFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  return calculateVulnerability(responses, threatId);
}

// ============================================================================
// IMPACT CALCULATION
// ============================================================================

export function calculateImpact(
  responses: InterviewResponses,
  threatId: string
): number {
  const threat = getThreatById(threatId);
  let impact = threat?.baselineImpact || 5;

  const familyMembers = responses.ep_family_members || [];
  const violenceThreats = ['kidnapping_abduction', 'home_invasion', 'ambush_attack', 'family_member_targeting'];
  
  if (violenceThreats.includes(threatId)) {
    if (responseIncludes(familyMembers, 'children_school_age')) {
      impact = Math.max(impact, 9);
    } else if (responseIncludes(familyMembers, 'children_college')) {
      impact = Math.max(impact, 8);
    } else if (responseIncludes(familyMembers, 'spouse_partner')) {
      impact = Math.max(impact, 7);
    }
  }

  const netWorth = responses.ep_net_worth_range;
  const financialThreats = ['extortion_blackmail', 'kidnapping_abduction'];
  
  if (financialThreats.includes(threatId)) {
    if (netWorth === 'over_100m') {
      impact += 1;
    }
  }

  const profileLevel = responses.ep_public_profile_level;
  if (threatId === 'reputational_attack' || threatId === 'doxxing_privacy_breach') {
    if (profileLevel === 'very_high') {
      impact = Math.max(impact, 8);
    } else if (profileLevel === 'high') {
      impact = Math.max(impact, 7);
    }
  }

  const medicalPlan = responses.ep_medical_emergency_plan;
  if (violenceThreats.includes(threatId)) {
    if (medicalPlan === 'no_plan') {
      impact += 1;
    } else if (medicalPlan === 'comprehensive') {
      impact -= 1;
    }
  }

  // Threat-specific impact floors
  if (threatId === 'kidnapping_abduction') {
    impact = Math.max(impact, 9);
  }
  if (threatId === 'ambush_attack') {
    impact = Math.max(impact, 8);
  }
  if (threatId === 'workplace_violence') {
    impact = Math.max(impact, 7);
  }

  return clamp(impact, 1, 10);
}

// ============================================================================
// COMPLETE RISK CALCULATION (T×V×I×E)
// ============================================================================

export function calculateThreatRisk(
  responses: InterviewResponses,
  threatId: string
): EPCalculatedRiskInputs {
  // Validate inputs
  if (!responses || typeof responses !== 'object') {
    responses = {};
  }
  
  const T = calculateThreatLikelihood(responses, threatId);
  const V = calculateVulnerability(responses, threatId);
  const I = calculateImpact(responses, threatId);
  const E = calculateExposureFactor(responses);

  // T×V×I×E formula with safe clamping
  // Max theoretical: 10 × 10 × 10 × 5 = 5000
  const inherentRisk = clamp(T * V * I * E, 0, 5000);
  
  // Normalize to 0-100 scale (5000 -> 100)
  const normalizedRisk = clamp((inherentRisk / 5000) * 100, 0, 100);
  
  const riskLevel = classifyRiskLevel(normalizedRisk);
  const suggestedControls = EP_THREAT_CONTROL_MAPPING[threatId] || [];

  return {
    threatLikelihood: T,
    vulnerability: V,
    impact: I,
    exposure: E,
    inherentRisk: Math.round(inherentRisk * 10) / 10,
    normalizedRisk: Math.round(normalizedRisk * 10) / 10,
    riskLevel,
    suggestedControls,
    riskFactorCount: 0,
  };
}

// ============================================================================
// RISK SCENARIO GENERATION
// ============================================================================

export async function generateEPRiskScenarios(
  assessmentId: number,
  interviewResponses: InterviewResponses
): Promise<EPGeneratedScenarioResult> {
  const result: EPGeneratedScenarioResult = {
    success: false,
    generatedScenarios: 0,
    criticalRisks: 0,
    highRisks: 0,
    mediumRisks: 0,
    lowRisks: 0,
    riskScenarioIds: [],
    overallExposure: calculateExposureFactor(interviewResponses),
  };

  try {
    for (const threatDef of EP_THREATS) {
      const riskInputs = calculateThreatRisk(interviewResponses, threatDef.id);
      
      result.generatedScenarios++;
      
      switch (riskInputs.riskLevel) {
        case 'critical': result.criticalRisks++; break;
        case 'high': result.highRisks++; break;
        case 'medium': result.mediumRisks++; break;
        case 'low': result.lowRisks++; break;
      }
    }

    result.success = true;
  } catch (error) {
    console.error('Error generating EP risk scenarios:', error);
    result.success = false;
  }

  return result;
}

// ============================================================================
// CONTROL RECOMMENDATIONS
// ============================================================================

export function generateControlRecommendations(
  responses: InterviewResponses,
  threatId: string
): string[] {
  return EP_THREAT_CONTROL_MAPPING[threatId] || [];
}
