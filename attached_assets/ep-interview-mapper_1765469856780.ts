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
import { assessments, riskScenarios, threats } from '@shared/schema';

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
  threatLikelihood: number;  // 1-10 (EP uses 1-10 scale)
  vulnerability: number;     // 1-10
  impact: number;            // 1-10
  exposure: number;          // 1-5 (EP-specific multiplier)
  inherentRisk: number;      // T × V × I × E (1-5000 theoretical max)
  normalizedRisk: number;    // Normalized to 0-100 scale
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
 * Check if response equals specific value
 */
function responseEquals(response: any, value: string): boolean {
  if (typeof response === 'string') {
    return response === value;
  }
  if (Array.isArray(response)) {
    return response.includes(value);
  }
  return false;
}

/**
 * Check if multi-select response includes value
 */
function responseIncludes(response: any, value: string): boolean {
  if (Array.isArray(response)) {
    return response.includes(value);
  }
  return false;
}

/**
 * Classify risk level based on normalized risk score (0-100)
 */
function classifyRiskLevel(normalizedRisk: number): 'critical' | 'high' | 'medium' | 'low' {
  if (normalizedRisk >= 75) return 'critical';
  if (normalizedRisk >= 50) return 'high';
  if (normalizedRisk >= 25) return 'medium';
  return 'low';
}

/**
 * Get the threat definition by ID
 */
function getThreatById(threatId: string) {
  return EP_THREATS.find(t => t.id === threatId);
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// EXPOSURE FACTOR CALCULATION (EP-SPECIFIC)
// ============================================================================

/**
 * Calculate Exposure Factor (E) - unique to Executive Protection
 * 
 * Exposure combines:
 * - Public profile level
 * - Pattern predictability  
 * - Social media activity
 * - Media coverage
 * - Digital footprint
 * 
 * Scale: 1.0 - 5.0
 */
export function calculateExposureFactor(responses: InterviewResponses): number {
  let exposureScore = 1.0; // Baseline - minimum exposure

  // =========================================================================
  // PUBLIC PROFILE COMPONENT (up to +2.0)
  // =========================================================================
  
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
  // 'private' adds nothing

  // =========================================================================
  // PATTERN PREDICTABILITY COMPONENT (up to +1.5)
  // =========================================================================
  
  const routinePredictability = responses.ep_daily_routine_predictability;
  if (routinePredictability === 'highly_predictable') {
    exposureScore += 1.5;
  } else if (routinePredictability === 'somewhat_predictable') {
    exposureScore += 1.0;
  } else if (routinePredictability === 'variable') {
    exposureScore += 0.5;
  } else if (routinePredictability === 'randomized') {
    exposureScore -= 0.3; // Active counter-measure reduces exposure
  }
  // 'unpredictable' adds nothing

  // Commute pattern amplifier
  const commutePattern = responses.ep_commute_pattern;
  if (commutePattern === 'same_route_same_time') {
    exposureScore += 0.5;
  } else if (commutePattern === 'same_route_varied_time') {
    exposureScore += 0.3;
  }

  // =========================================================================
  // SOCIAL MEDIA COMPONENT (up to +1.0)
  // =========================================================================
  
  const socialMedia = responses.ep_social_media_usage;
  if (socialMedia === 'very_active_public') {
    exposureScore += 1.0;
  } else if (socialMedia === 'active_public') {
    exposureScore += 0.7;
  } else if (socialMedia === 'moderate_friends_only') {
    exposureScore += 0.3;
  }
  // 'minimal_private' and 'no_social_media' add nothing

  // Real-time location posting amplifier
  if (responses.ep_social_media_opsec === 'yes') {
    exposureScore += 0.3;
  }

  // =========================================================================
  // MEDIA COVERAGE COMPONENT (up to +0.5)
  // =========================================================================
  
  const mediaCoverage = responses.ep_media_coverage;
  if (mediaCoverage === 'extensive') {
    exposureScore += 0.5;
  } else if (mediaCoverage === 'frequent') {
    exposureScore += 0.3;
  } else if (mediaCoverage === 'occasional') {
    exposureScore += 0.1;
  }

  // =========================================================================
  // DIGITAL FOOTPRINT COMPONENT (up to +0.5)
  // =========================================================================
  
  const publicRecords = responses.ep_public_records_exposure || [];
  if (responseIncludes(publicRecords, 'home_address')) {
    exposureScore += 0.3;
  }
  if (responseIncludes(publicRecords, 'family_information')) {
    exposureScore += 0.2;
  }

  // Family digital exposure adds to overall exposure
  const familyDigital = responses.ep_family_digital_exposure;
  if (familyDigital === 'high_exposure') {
    exposureScore += 0.3;
  } else if (familyDigital === 'moderate_exposure') {
    exposureScore += 0.15;
  }

  // =========================================================================
  // TRAVEL ARRANGEMENTS PUBLICITY (up to +0.3)
  // =========================================================================
  
  const travelPublicity = responses.ep_travel_arrangements_publicity;
  if (travelPublicity === 'public_calendar') {
    exposureScore += 0.3;
  } else if (travelPublicity === 'widely_shared') {
    exposureScore += 0.2;
  }

  // Cap exposure factor at 5.0
  return clamp(exposureScore, 1.0, 5.0);
}

// ============================================================================
// THREAT LIKELIHOOD CALCULATION
// ============================================================================

/**
 * Calculate threat likelihood (1-10) based on interview responses
 * Higher score = more likely to occur
 */
export function calculateThreatLikelihood(
  responses: InterviewResponses,
  threatId: string
): number {
  const threat = getThreatById(threatId);
  let likelihood = threat?.baselineThreat || 4;

  // =========================================================================
  // FACTOR 1: KNOWN THREATS / INCIDENT HISTORY (most important)
  // =========================================================================
  
  const knownThreats = responses.ep_known_threats;
  if (knownThreats === 'yes_recent') {
    likelihood += 3;
  } else if (knownThreats === 'yes_past') {
    likelihood += 2;
  } else if (knownThreats === 'no_but_concerned') {
    likelihood += 1;
  }

  // =========================================================================
  // FACTOR 2: NET WORTH (affects financially-motivated threats)
  // =========================================================================
  
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

  // =========================================================================
  // FACTOR 3: PUBLIC PROFILE (affects visibility-related threats)
  // =========================================================================
  
  const profileLevel = responses.ep_public_profile_level;
  const visibilityThreats = ['stalking_surveillance', 'doxxing_privacy_breach', 'reputational_attack', 'protest_demonstration_targeting'];
  
  if (visibilityThreats.includes(threatId)) {
    if (profileLevel === 'very_high') {
      likelihood += 2;
    } else if (profileLevel === 'high') {
      likelihood += 1;
    }
  }

  // =========================================================================
  // FACTOR 4: CONTROVERSIAL INVOLVEMENT
  // =========================================================================
  
  const controversial = responses.ep_controversial_involvement;
  const controversyThreats = ['workplace_violence', 'stalking_surveillance', 'extortion_blackmail', 'protest_demonstration_targeting', 'reputational_attack'];
  
  if (controversyThreats.includes(threatId)) {
    if (controversial === 'yes_high_profile') {
      likelihood += 2;
    } else if (controversial === 'yes_moderate') {
      likelihood += 1;
    }
  }

  // =========================================================================
  // FACTOR 5: INDUSTRY SECTOR
  // =========================================================================
  
  const industry = responses.ep_industry_sector;
  
  // Entertainment/Political/Legal = elevated stalking, workplace violence
  if (threatId === 'stalking_surveillance' || threatId === 'workplace_violence') {
    if (industry === 'entertainment' || industry === 'political' || industry === 'legal') {
      likelihood += 1;
    }
  }
  
  // Finance = elevated extortion, cyber targeting
  if (threatId === 'extortion_blackmail' || threatId === 'cyber_targeting_social_engineering') {
    if (industry === 'finance' || industry === 'technology') {
      likelihood += 1;
    }
  }

  // =========================================================================
  // FACTOR 6: INTERNATIONAL TRAVEL (affects kidnapping, travel incidents)
  // =========================================================================
  
  const intlTravel = responses.ep_international_travel;
  const travelThreats = ['kidnapping_abduction', 'travel_security_incidents'];
  
  if (travelThreats.includes(threatId)) {
    if (intlTravel === 'yes_frequently') {
      likelihood += 2;
    } else if (intlTravel === 'yes_occasionally') {
      likelihood += 1;
    }
  }

  // =========================================================================
  // FACTOR 7: FAMILY COMPOSITION (affects family targeting)
  // =========================================================================
  
  const familyMembers = responses.ep_family_members || [];
  
  if (threatId === 'family_member_targeting' || threatId === 'kidnapping_abduction') {
    if (responseIncludes(familyMembers, 'children_school_age')) {
      likelihood += 2;
    } else if (responseIncludes(familyMembers, 'children_college')) {
      likelihood += 1;
    }
  }

  // =========================================================================
  // FACTOR 8: WORKPLACE INCIDENT HISTORY
  // =========================================================================
  
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

  // =========================================================================
  // FACTOR 9: SOCIAL MEDIA EXPOSURE
  // =========================================================================
  
  const socialMedia = responses.ep_social_media_usage;
  const socialThreats = ['stalking_surveillance', 'doxxing_privacy_breach', 'cyber_targeting_social_engineering'];
  
  if (socialThreats.includes(threatId)) {
    if (socialMedia === 'very_active_public') {
      likelihood += 2;
    } else if (socialMedia === 'active_public') {
      likelihood += 1;
    }
  }

  // Cap at 10
  return clamp(likelihood, 1, 10);
}

// ============================================================================
// VULNERABILITY CALCULATION
// ============================================================================

/**
 * Calculate vulnerability score (1-10) based on interview responses
 * Higher score = more vulnerable
 */
export function calculateVulnerability(
  responses: InterviewResponses,
  threatId: string
): number {
  let vulnerability = 5; // Start at baseline (moderate)
  let riskFactorCount = 0;

  // =========================================================================
  // SECTION 1: SECURITY POSTURE (affects all threats)
  // =========================================================================
  
  const securityLevel = responses.ep_current_security_level;
  if (securityLevel === 'none') {
    riskFactorCount += 3;
  } else if (securityLevel === 'minimal') {
    riskFactorCount += 2;
  } else if (securityLevel === '24x7_detail') {
    riskFactorCount -= 2;
  } else if (securityLevel === 'comprehensive') {
    riskFactorCount -= 1;
  }

  // Complacency factor
  const threatPerception = responses.ep_threat_perception;
  if (threatPerception === 'not_concerned') {
    riskFactorCount += 2;
  } else if (threatPerception === 'minimal_concern') {
    riskFactorCount += 1;
  }

  // =========================================================================
  // SECTION 2: RESIDENCE SECURITY (home invasion, family targeting)
  // =========================================================================
  
  const residenceThreats = ['home_invasion', 'family_member_targeting', 'stalking_surveillance'];
  
  if (residenceThreats.includes(threatId)) {
    // Perimeter security
    const perimeter = responses.ep_residence_perimeter_security || [];
    if (responseIncludes(perimeter, 'none')) {
      riskFactorCount += 3;
    } else if (responseIncludes(perimeter, 'fence_basic')) {
      riskFactorCount += 1;
    }
    if (responseIncludes(perimeter, 'gate_manned')) {
      riskFactorCount -= 2;
    }
    if (responseIncludes(perimeter, 'intrusion_detection')) {
      riskFactorCount -= 1;
    }

    // Alarm system
    const alarm = responses.ep_residence_alarm_system;
    if (alarm === 'none') {
      riskFactorCount += 3;
    } else if (alarm === 'basic_unmonitored') {
      riskFactorCount += 2;
    } else if (alarm === 'monitored_with_armed_response') {
      riskFactorCount -= 1;
    }

    // Safe room
    const safeRoom = responses.ep_safe_room;
    if (safeRoom === 'no') {
      riskFactorCount += 2;
    } else if (safeRoom === 'yes_purpose_built') {
      riskFactorCount -= 1;
    }

    // CCTV coverage
    const cctv = responses.ep_residence_cctv || [];
    if (responseIncludes(cctv, 'none')) {
      riskFactorCount += 3;
    } else if (responseIncludes(cctv, 'doorbell_camera') && cctv.length === 1) {
      riskFactorCount += 1;
    }
    if (responseIncludes(cctv, 'offsite_monitoring')) {
      riskFactorCount -= 1;
    }

    // Police response time
    const policeTime = responses.ep_police_response_time;
    if (policeTime === 'over_15_min' || policeTime === 'unknown') {
      riskFactorCount += 2;
    } else if (policeTime === 'under_5_min') {
      riskFactorCount -= 1;
    }

    // Residence visibility
    const visibility = responses.ep_residence_visibility;
    if (visibility === 'highly_visible') {
      riskFactorCount += 2;
    } else if (visibility === 'somewhat_visible') {
      riskFactorCount += 1;
    } else if (visibility === 'completely_secluded') {
      riskFactorCount -= 1;
    }
  }

  // =========================================================================
  // SECTION 3: PATTERN PREDICTABILITY (kidnapping, ambush, stalking)
  // =========================================================================
  
  const patternThreats = ['kidnapping_abduction', 'ambush_attack', 'stalking_surveillance'];
  
  if (patternThreats.includes(threatId)) {
    // Daily routine predictability
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

    // Commute pattern
    const commute = responses.ep_commute_pattern;
    if (commute === 'same_route_same_time') {
      riskFactorCount += 3;
    } else if (commute === 'same_route_varied_time') {
      riskFactorCount += 2;
    } else if (commute === 'driver_service') {
      riskFactorCount -= 1;
    }

    // Frequent locations
    const frequentLocations = responses.ep_frequent_locations;
    if (frequentLocations === 'yes_very_regular') {
      riskFactorCount += 2;
    } else if (frequentLocations === 'yes_but_varied') {
      riskFactorCount += 1;
    }

    // Children's schedule
    const childSchedule = responses.ep_children_schedule;
    if (childSchedule === 'highly_predictable') {
      riskFactorCount += 2;
    } else if (childSchedule === 'somewhat_predictable') {
      riskFactorCount += 1;
    } else if (childSchedule === 'secure_transport') {
      riskFactorCount -= 1;
    }
  }

  // =========================================================================
  // SECTION 4: WORKPLACE SECURITY
  // =========================================================================
  
  if (threatId === 'workplace_violence') {
    // Access control
    const accessControl = responses.ep_workplace_access_control;
    if (accessControl === 'open_public') {
      riskFactorCount += 3;
    } else if (accessControl === 'receptionist_only') {
      riskFactorCount += 2;
    } else if (accessControl === 'multi_layer' || accessControl === 'security_screening') {
      riskFactorCount -= 1;
    }

    // Security staff
    const securityStaff = responses.ep_workplace_security_staff;
    if (securityStaff === 'none') {
      riskFactorCount += 2;
    } else if (securityStaff === 'contracted_limited') {
      riskFactorCount += 1;
    } else if (securityStaff === 'executive_protection_available') {
      riskFactorCount -= 1;
    }

    // Emergency procedures
    const emergencyProc = responses.ep_workplace_emergency_procedures;
    if (emergencyProc === 'no_procedures') {
      riskFactorCount += 2;
    } else if (emergencyProc === 'exists_unfamiliar') {
      riskFactorCount += 1;
    } else if (emergencyProc === 'personal_evacuation_plan') {
      riskFactorCount -= 1;
    }
  }

  // =========================================================================
  // SECTION 5: TRAVEL & TRANSPORTATION
  // =========================================================================
  
  const travelThreats = ['kidnapping_abduction', 'ambush_attack', 'travel_security_incidents'];
  
  if (travelThreats.includes(threatId)) {
    // Vehicle type
    const vehicleType = responses.ep_vehicle_type;
    if (vehicleType === 'personal_luxury_conspicuous') {
      riskFactorCount += 2;
    } else if (vehicleType === 'driver_service_armored') {
      riskFactorCount -= 3;
    } else if (vehicleType === 'driver_service_standard') {
      riskFactorCount -= 1;
    }

    // Vehicle security features
    const vehicleSecurity = responses.ep_vehicle_security_features || [];
    if (responseIncludes(vehicleSecurity, 'none')) {
      riskFactorCount += 2;
    }
    if (responseIncludes(vehicleSecurity, 'armoring_full')) {
      riskFactorCount -= 2;
    }
    if (responseIncludes(vehicleSecurity, 'run_flat_tires')) {
      riskFactorCount -= 1;
    }

    // Parking location
    const parking = responses.ep_parking_location;
    if (parking === 'street_parking_public') {
      riskFactorCount += 2;
    } else if (parking === 'open_parking_lot') {
      riskFactorCount += 1;
    } else if (parking === 'secure_executive_parking' || parking === 'driver_drops') {
      riskFactorCount -= 1;
    }

    // International travel security
    const intlSecurity = responses.ep_international_security_measures;
    if (intlSecurity === 'none') {
      riskFactorCount += 2;
    } else if (intlSecurity === 'comprehensive') {
      riskFactorCount -= 1;
    }
  }

  // =========================================================================
  // SECTION 6: DIGITAL FOOTPRINT (doxxing, cyber, stalking)
  // =========================================================================
  
  const digitalThreats = ['doxxing_privacy_breach', 'cyber_targeting_social_engineering', 'stalking_surveillance'];
  
  if (digitalThreats.includes(threatId)) {
    // Online presence management
    const onlineManagement = responses.ep_online_presence_management;
    if (onlineManagement === 'no_management') {
      riskFactorCount += 2;
    } else if (onlineManagement === 'basic_privacy_settings') {
      riskFactorCount += 1;
    } else if (onlineManagement === 'professional_services') {
      riskFactorCount -= 1;
    }

    // Public records exposure
    const publicRecords = responses.ep_public_records_exposure || [];
    if (responseIncludes(publicRecords, 'home_address')) {
      riskFactorCount += 2;
    }
    if (responseIncludes(publicRecords, 'family_information')) {
      riskFactorCount += 1;
    }

    // Information vetting
    const vetting = responses.ep_information_vetting;
    if (vetting === 'minimal_vetting') {
      riskFactorCount += 2;
    }

    // Email/phone security
    const commSecurity = responses.ep_email_phone_security || [];
    if (responseIncludes(commSecurity, 'standard_only') && commSecurity.length === 1) {
      riskFactorCount += 1;
    }
    if (responseIncludes(commSecurity, 'encrypted_email')) {
      riskFactorCount -= 1;
    }

    // OSINT monitoring
    const monitoring = responses.ep_google_alerts;
    if (monitoring === 'no_monitoring') {
      riskFactorCount += 1;
    } else if (monitoring === 'professional_monitoring') {
      riskFactorCount -= 1;
    }
  }

  // =========================================================================
  // SECTION 7: FAMILY SECURITY
  // =========================================================================
  
  if (threatId === 'family_member_targeting' || threatId === 'kidnapping_abduction') {
    // Family security training
    const familyTraining = responses.ep_family_security_awareness;
    if (familyTraining === 'no_training') {
      riskFactorCount += 2;
    } else if (familyTraining === 'informal_discussions') {
      riskFactorCount += 1;
    }

    // School coordination
    const schoolCoord = responses.ep_school_security_coordination;
    if (schoolCoord === 'none') {
      riskFactorCount += 2;
    } else if (schoolCoord === 'basic') {
      riskFactorCount += 1;
    }

    // Staff vetting
    const staffVetting = responses.ep_nanny_staff_vetting;
    if (staffVetting === 'none') {
      riskFactorCount += 2;
    } else if (staffVetting === 'references_only') {
      riskFactorCount += 1;
    }

    // Family digital exposure
    const familyDigital = responses.ep_family_digital_exposure;
    if (familyDigital === 'high_exposure') {
      riskFactorCount += 2;
    } else if (familyDigital === 'moderate_exposure') {
      riskFactorCount += 1;
    }
  }

  // =========================================================================
  // SECTION 8: EMERGENCY PREPAREDNESS (affects all threats)
  // =========================================================================
  
  // Emergency protocols
  const emergencyContacts = responses.ep_emergency_contacts;
  if (emergencyContacts === 'no_protocols') {
    riskFactorCount += 2;
  } else if (emergencyContacts === 'basic_contacts') {
    riskFactorCount += 1;
  }

  // Duress codes
  const duressCode = responses.ep_duress_code;
  if (duressCode === 'no_duress_codes') {
    riskFactorCount += 2;
  }

  // Evacuation planning
  const evacuation = responses.ep_evacuation_routes;
  if (evacuation === 'no_planning') {
    riskFactorCount += 2;
  } else if (evacuation === 'identified_not_practiced') {
    riskFactorCount += 1;
  }

  // =========================================================================
  // CALCULATE FINAL VULNERABILITY SCORE
  // =========================================================================
  
  // EP uses divisor of 3 (more conservative than retail's 2)
  vulnerability = vulnerability + Math.floor(riskFactorCount / 3);
  
  return clamp(vulnerability, 1, 10);
}

// ============================================================================
// IMPACT CALCULATION
// ============================================================================

/**
 * Calculate impact score (1-10) based on interview responses
 * Higher score = more severe consequences
 */
export function calculateImpact(
  responses: InterviewResponses,
  threatId: string
): number {
  const threat = getThreatById(threatId);
  let impact = threat?.baselineImpact || 5;

  // =========================================================================
  // FACTOR 1: FAMILY COMPOSITION (multiplies impact for violence threats)
  // =========================================================================
  
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

  // =========================================================================
  // FACTOR 2: NET WORTH (affects financial crime impacts)
  // =========================================================================
  
  const netWorth = responses.ep_net_worth_range;
  const financialThreats = ['extortion_blackmail', 'kidnapping_abduction'];
  
  if (financialThreats.includes(threatId)) {
    if (netWorth === 'over_100m') {
      impact += 1; // Higher stakes
    }
  }

  // =========================================================================
  // FACTOR 3: PUBLIC PROFILE (affects reputation threats)
  // =========================================================================
  
  const profileLevel = responses.ep_public_profile_level;
  
  if (threatId === 'reputational_attack' || threatId === 'doxxing_privacy_breach') {
    if (profileLevel === 'very_high') {
      impact = Math.max(impact, 8);
    } else if (profileLevel === 'high') {
      impact = Math.max(impact, 7);
    }
  }

  // =========================================================================
  // FACTOR 4: MEDICAL EMERGENCY PREPAREDNESS (affects impact severity)
  // =========================================================================
  
  const medicalPlan = responses.ep_medical_emergency_plan;
  
  // Lack of medical planning increases impact of violence
  if (violenceThreats.includes(threatId)) {
    if (medicalPlan === 'no_plan') {
      impact += 1;
    } else if (medicalPlan === 'comprehensive') {
      impact -= 1;
    }
  }

  // =========================================================================
  // FACTOR 5: POLICE RESPONSE TIME (affects violence impact)
  // =========================================================================
  
  const policeTime = responses.ep_police_response_time;
  
  if (threatId === 'home_invasion') {
    if (policeTime === 'over_15_min') {
      impact += 1;
    }
  }

  // =========================================================================
  // THREAT-SPECIFIC IMPACT FLOORS
  // =========================================================================
  
  // Life-threatening events always have high minimum impact
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

/**
 * Calculate complete risk for a specific threat using T×V×I×E formula
 */
export function calculateThreatRisk(
  responses: InterviewResponses,
  threatId: string
): EPCalculatedRiskInputs {
  // Calculate each component
  const T = calculateThreatLikelihood(responses, threatId);
  const V = calculateVulnerability(responses, threatId);
  const I = calculateImpact(responses, threatId);
  const E = calculateExposureFactor(responses);

  // Calculate inherent risk using EP formula
  // T×V×I×E = (1-10) × (1-10) × (1-10) × (1-5) = theoretical max 5000
  const inherentRisk = T * V * I * E;

  // Normalize to 0-100 scale
  // Using 5000 as theoretical max, but realistic max is lower
  const normalizedRisk = Math.min(100, (inherentRisk / 2500) * 100);

  // Classify risk level
  const riskLevel = classifyRiskLevel(normalizedRisk);

  // Get suggested controls
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
    riskFactorCount: 0, // Will be tracked separately
  };
}

// ============================================================================
// RISK FACTOR COUNTING
// ============================================================================

/**
 * Count total risk factors from interview responses
 * Returns breakdown by section and total count
 */
export function countRiskFactors(responses: InterviewResponses): {
  total: number;
  bySection: Record<string, number>;
} {
  let total = 0;
  const bySection: Record<string, number> = {
    profile: 0,
    residence: 0,
    routines: 0,
    workplace: 0,
    travel: 0,
    digital: 0,
    family: 0,
    emergency: 0,
  };

  // =========================================================================
  // SECTION 1: EXECUTIVE PROFILE
  // =========================================================================
  
  if (responses.ep_public_profile_level === 'very_high') { bySection.profile += 3; }
  else if (responses.ep_public_profile_level === 'high') { bySection.profile += 2; }
  
  if (responses.ep_net_worth_range === 'over_100m') { bySection.profile += 2; }
  else if (responses.ep_net_worth_range === '50m_to_100m') { bySection.profile += 1; }
  
  if (responses.ep_known_threats === 'yes_recent') { bySection.profile += 3; }
  else if (responses.ep_known_threats === 'yes_past') { bySection.profile += 2; }
  else if (responses.ep_known_threats === 'no_but_concerned') { bySection.profile += 1; }
  
  if (responses.ep_current_security_level === 'none') { bySection.profile += 3; }
  else if (responses.ep_current_security_level === 'minimal') { bySection.profile += 2; }
  
  if (responses.ep_controversial_involvement === 'yes_high_profile') { bySection.profile += 2; }
  else if (responses.ep_controversial_involvement === 'yes_moderate') { bySection.profile += 1; }

  const familyMembers = responses.ep_family_members || [];
  if (responseIncludes(familyMembers, 'children_school_age')) { bySection.profile += 2; }

  // =========================================================================
  // SECTION 2: RESIDENCE SECURITY
  // =========================================================================
  
  if (responses.ep_residence_visibility === 'highly_visible') { bySection.residence += 2; }
  else if (responses.ep_residence_visibility === 'somewhat_visible') { bySection.residence += 1; }
  
  const perimeter = responses.ep_residence_perimeter_security || [];
  if (responseIncludes(perimeter, 'none')) { bySection.residence += 3; }
  else if (responseIncludes(perimeter, 'fence_basic') && !responseIncludes(perimeter, 'intrusion_detection')) { bySection.residence += 1; }
  
  if (responses.ep_residence_alarm_system === 'none') { bySection.residence += 3; }
  else if (responses.ep_residence_alarm_system === 'basic_unmonitored') { bySection.residence += 2; }
  
  if (responses.ep_safe_room === 'no') { bySection.residence += 2; }
  
  const cctv = responses.ep_residence_cctv || [];
  if (responseIncludes(cctv, 'none')) { bySection.residence += 3; }
  else if (responseIncludes(cctv, 'doorbell_camera') && cctv.length === 1) { bySection.residence += 1; }
  
  if (responses.ep_police_response_time === 'over_15_min' || responses.ep_police_response_time === 'unknown') { bySection.residence += 2; }

  // =========================================================================
  // SECTION 3: DAILY ROUTINES
  // =========================================================================
  
  if (responses.ep_daily_routine_predictability === 'highly_predictable') { bySection.routines += 3; }
  else if (responses.ep_daily_routine_predictability === 'somewhat_predictable') { bySection.routines += 2; }
  
  if (responses.ep_commute_pattern === 'same_route_same_time') { bySection.routines += 3; }
  else if (responses.ep_commute_pattern === 'same_route_varied_time') { bySection.routines += 2; }
  
  if (responses.ep_parking_location === 'street_parking_public') { bySection.routines += 2; }
  else if (responses.ep_parking_location === 'open_parking_lot') { bySection.routines += 1; }
  
  if (responses.ep_frequent_locations === 'yes_very_regular') { bySection.routines += 2; }
  
  if (responses.ep_social_media_usage === 'very_active_public') { bySection.routines += 3; }
  else if (responses.ep_social_media_usage === 'active_public') { bySection.routines += 2; }
  
  if (responses.ep_children_schedule === 'highly_predictable') { bySection.routines += 3; }
  else if (responses.ep_children_schedule === 'somewhat_predictable') { bySection.routines += 2; }

  // =========================================================================
  // SECTION 4: WORKPLACE SECURITY
  // =========================================================================
  
  if (responses.ep_workplace_access_control === 'open_public') { bySection.workplace += 3; }
  else if (responses.ep_workplace_access_control === 'receptionist_only') { bySection.workplace += 2; }
  
  if (responses.ep_workplace_threat_history === 'yes_recent') { bySection.workplace += 2; }
  else if (responses.ep_workplace_threat_history === 'yes_past') { bySection.workplace += 1; }
  
  if (responses.ep_workplace_security_staff === 'none') { bySection.workplace += 2; }
  else if (responses.ep_workplace_security_staff === 'contracted_limited') { bySection.workplace += 1; }
  
  if (responses.ep_workplace_emergency_procedures === 'no_procedures') { bySection.workplace += 2; }
  else if (responses.ep_workplace_emergency_procedures === 'exists_unfamiliar') { bySection.workplace += 1; }

  // =========================================================================
  // SECTION 5: TRAVEL & TRANSPORTATION
  // =========================================================================
  
  if (responses.ep_travel_frequency === 'very_frequent') { bySection.travel += 1; }
  
  if (responses.ep_international_travel === 'yes_frequently') { bySection.travel += 3; }
  else if (responses.ep_international_travel === 'yes_occasionally') { bySection.travel += 2; }
  
  if (responses.ep_vehicle_type === 'personal_luxury_conspicuous') { bySection.travel += 1; }
  
  const vehicleSecurity = responses.ep_vehicle_security_features || [];
  if (responseIncludes(vehicleSecurity, 'none')) { bySection.travel += 2; }
  
  if (responses.ep_travel_arrangements_publicity === 'public_calendar') { bySection.travel += 3; }
  else if (responses.ep_travel_arrangements_publicity === 'widely_shared') { bySection.travel += 2; }

  // =========================================================================
  // SECTION 6: DIGITAL FOOTPRINT
  // =========================================================================
  
  const publicRecords = responses.ep_public_records_exposure || [];
  if (responseIncludes(publicRecords, 'home_address')) { bySection.digital += 2; }
  if (responseIncludes(publicRecords, 'family_information')) { bySection.digital += 2; }
  if (responseIncludes(publicRecords, 'net_worth_estimates')) { bySection.digital += 1; }
  
  if (responses.ep_media_coverage === 'extensive') { bySection.digital += 2; }
  else if (responses.ep_media_coverage === 'frequent') { bySection.digital += 1; }
  
  if (responses.ep_online_presence_management === 'no_management') { bySection.digital += 2; }
  else if (responses.ep_online_presence_management === 'basic_privacy_settings') { bySection.digital += 1; }
  
  if (responses.ep_family_digital_exposure === 'high_exposure') { bySection.digital += 2; }
  else if (responses.ep_family_digital_exposure === 'moderate_exposure') { bySection.digital += 1; }
  
  if (responses.ep_google_alerts === 'no_monitoring') { bySection.digital += 1; }
  
  if (responses.ep_information_vetting === 'minimal_vetting') { bySection.digital += 2; }

  // =========================================================================
  // SECTION 7: FAMILY SECURITY
  // =========================================================================
  
  if (responses.ep_family_security_awareness === 'no_training') { bySection.family += 2; }
  else if (responses.ep_family_security_awareness === 'informal_discussions') { bySection.family += 1; }
  
  if (responses.ep_school_security_coordination === 'none') { bySection.family += 2; }
  else if (responses.ep_school_security_coordination === 'basic') { bySection.family += 1; }
  
  if (responses.ep_nanny_staff_vetting === 'none') { bySection.family += 2; }
  else if (responses.ep_nanny_staff_vetting === 'references_only') { bySection.family += 1; }
  
  if (responses.ep_family_travel_protocol === 'none') { bySection.family += 2; }
  else if (responses.ep_family_travel_protocol === 'minimal') { bySection.family += 1; }

  // =========================================================================
  // SECTION 8: EMERGENCY PREPAREDNESS
  // =========================================================================
  
  if (responses.ep_emergency_contacts === 'no_protocols') { bySection.emergency += 2; }
  else if (responses.ep_emergency_contacts === 'basic_contacts') { bySection.emergency += 1; }
  
  if (responses.ep_family_emergency_training === 'no_training') { bySection.emergency += 2; }
  else if (responses.ep_family_emergency_training === 'basic_discussion') { bySection.emergency += 1; }
  
  if (responses.ep_duress_code === 'no_duress_codes') { bySection.emergency += 2; }
  
  if (responses.ep_evacuation_routes === 'no_planning') { bySection.emergency += 2; }
  else if (responses.ep_evacuation_routes === 'identified_not_practiced') { bySection.emergency += 1; }
  
  if (responses.ep_go_bag_prepared === 'no_preparation') { bySection.emergency += 1; }
  
  if (responses.ep_medical_emergency_plan === 'no_plan') { bySection.emergency += 1; }

  // Calculate total
  total = Object.values(bySection).reduce((sum, val) => sum + val, 0);

  return { total, bySection };
}

// ============================================================================
// MAIN RISK GENERATION FUNCTION
// ============================================================================

/**
 * Generate all risk scenarios for an EP assessment
 */
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
    overallExposure: 0,
  };

  try {
    // Calculate overall exposure factor
    result.overallExposure = calculateExposureFactor(interviewResponses);

    // Process each threat
    for (const threat of EP_THREATS) {
      const riskInputs = calculateThreatRisk(interviewResponses, threat.id);

      // Generate scenario description
      const scenarioDescription = generateScenarioDescription(
        threat,
        riskInputs,
        interviewResponses
      );

      // Look up threat ID in database
      const threatRecord = await db.query.threats.findFirst({
        where: eq(threats.name, threat.name),
      });

      if (!threatRecord) {
        console.warn(`Threat not found in database: ${threat.name}`);
        continue;
      }

      // Insert risk scenario
      const [newScenario] = await db.insert(riskScenarios).values({
        assessmentId,
        threatId: threatRecord.id,
        threatLikelihood: riskInputs.threatLikelihood,
        vulnerability: riskInputs.vulnerability,
        impact: riskInputs.impact,
        inherentRisk: Math.round(riskInputs.normalizedRisk),
        residualRisk: Math.round(riskInputs.normalizedRisk * 0.8), // Placeholder
        controlEffectiveness: 20, // Placeholder
        riskLevel: riskInputs.riskLevel,
        scenarioDescription,
      }).returning();

      result.riskScenarioIds.push(newScenario.id);
      result.generatedScenarios++;

      // Track risk levels
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
// SCENARIO DESCRIPTION GENERATION
// ============================================================================

/**
 * Generate human-readable scenario description
 */
function generateScenarioDescription(
  threat: typeof EP_THREATS[number],
  riskInputs: EPCalculatedRiskInputs,
  responses: InterviewResponses
): string {
  const { threatLikelihood, vulnerability, impact, exposure, riskLevel } = riskInputs;

  let description = `${threat.name}: `;

  // Add threat likelihood context
  if (threatLikelihood >= 7) {
    description += 'High probability threat based on profile factors. ';
  } else if (threatLikelihood >= 5) {
    description += 'Moderate probability requiring attention. ';
  } else {
    description += 'Lower probability but significant impact potential. ';
  }

  // Add vulnerability context
  if (vulnerability >= 7) {
    description += 'Significant security gaps identified. ';
  } else if (vulnerability >= 5) {
    description += 'Some protective measures in place but improvements needed. ';
  } else {
    description += 'Good security posture with minor enhancements recommended. ';
  }

  // Add exposure context
  if (exposure >= 4) {
    description += 'High exposure due to public profile and predictable patterns. ';
  } else if (exposure >= 2.5) {
    description += 'Moderate exposure level. ';
  } else {
    description += 'Lower exposure profile. ';
  }

  // Add threat-specific context
  description += getTheThreatSpecificContext(threat.id, responses);

  return description;
}

/**
 * Get threat-specific contextual notes
 */
function getTheThreatSpecificContext(
  threatId: string,
  responses: InterviewResponses
): string {
  switch (threatId) {
    case 'kidnapping_abduction':
      if (responses.ep_international_travel === 'yes_frequently') {
        return 'Elevated risk due to frequent high-risk international travel. ';
      }
      if (responses.ep_net_worth_range === 'over_100m') {
        return 'Net worth significantly elevates attractiveness to threat actors. ';
      }
      return '';

    case 'stalking_surveillance':
      if (responses.ep_public_profile_level === 'very_high') {
        return 'High public profile attracts unwanted attention. ';
      }
      if (responses.ep_social_media_usage === 'very_active_public') {
        return 'Active public social media presence enables tracking. ';
      }
      return '';

    case 'home_invasion':
      if (responses.ep_residence_perimeter_security?.includes('none')) {
        return 'Lack of perimeter security creates significant vulnerability. ';
      }
      if (responses.ep_safe_room === 'no') {
        return 'Absence of safe room limits protection options. ';
      }
      return '';

    case 'ambush_attack':
      if (responses.ep_commute_pattern === 'same_route_same_time') {
        return 'Fixed commute pattern enables surveillance and planning. ';
      }
      if (responses.ep_daily_routine_predictability === 'highly_predictable') {
        return 'Highly predictable schedule creates targeting opportunity. ';
      }
      return '';

    case 'family_member_targeting':
      if (responses.ep_family_members?.includes('children_school_age')) {
        return 'School-age children create high-value soft targets. ';
      }
      if (responses.ep_children_schedule === 'highly_predictable') {
        return 'Predictable children schedules increase vulnerability. ';
      }
      return '';

    case 'workplace_violence':
      if (responses.ep_workplace_access_control === 'open_public') {
        return 'Open access workplace significantly elevates risk. ';
      }
      if (responses.ep_workplace_threat_history === 'yes_recent') {
        return 'Recent workplace threats indicate active risk. ';
      }
      return '';

    default:
      return '';
  }
}

// ============================================================================
// EXPORT UTILITY FUNCTIONS
// ============================================================================

export {
  responseMatchesIndicator,
  responseEquals,
  responseIncludes,
  classifyRiskLevel,
  getThreatById,
  clamp,
};

// ============================================================================
// END OF EXECUTIVE PROTECTION INTERVIEW RISK MAPPER
// ============================================================================
