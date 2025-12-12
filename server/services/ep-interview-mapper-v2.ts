/**
 * RiskFixer Executive Protection Interview Mapper v2.0
 * 
 * DATA PREPARATION ONLY — NO RISK SCORING
 * 
 * This mapper follows the 6-Layer AI Framework architecture where:
 * - Mapper prepares and normalizes interview data
 * - AI Engine performs ALL risk scoring, scenario generation, and narrative creation
 * 
 * ARCHITECTURAL CHANGE (v2.0):
 * Previous versions calculated T×V×I×E directly in the mapper.
 * This version ONLY prepares data for the AI assessment engine.
 * 
 * The mapper's sole job: Convert structured human answers → structured AI input
 * 
 * @author RiskFixer Team
 * @version 2.0
 * @see RiskFixer-Architecture-Alignment-MVP.md
 */

export type InterviewResponses = Record<string, any>;

/**
 * Extract string value from interview response - handles both old string format
 * and new structured format {answer, details, raw, fullResponse}
 */
export function getResponseValue(response: any): string | undefined {
  if (!response) return undefined;
  if (typeof response === 'string') return response;
  if (typeof response === 'object') return response.fullResponse || response.answer || undefined;
  return String(response);
}

/**
 * Extract boolean from interview response
 */
export function getResponseBool(response: any): boolean | null {
  if (response === null || response === undefined) return null;
  if (typeof response === 'boolean') return response;
  if (typeof response === 'object' && response.raw !== undefined) return response.raw;
  if (typeof response === 'object' && response.answer) {
    return response.answer.toLowerCase() === 'yes';
  }
  if (typeof response === 'string') return response.toLowerCase() === 'yes';
  return null;
}

/**
 * Check if response matches expected values (handles both formats)
 */
function responseMatches(response: any, expectedValues: string[]): boolean {
  const value = getResponseValue(response);
  if (!value) return false;
  const lowerValue = value.toLowerCase();
  return expectedValues.some(exp => lowerValue === exp.toLowerCase() || lowerValue.includes(exp.toLowerCase()));
}

/**
 * Check if response is affirmative (yes, true, active, etc.)
 */
function isAffirmative(response: any): boolean {
  return responseMatches(response, ['yes', 'true', 'active', 'multiple', 'frequent', 'high', 'extensive']);
}

export interface ValidationResult {
  isComplete: boolean;
  completionPercentage: number;
  answeredQuestions: number;
  totalQuestions: number;
  missingRequired: string[];
  warnings: string[];
}

export interface PrincipalProfile {
  publicExposureLevel: 'minimal' | 'moderate' | 'significant' | 'extensive' | null;
  mediaPresence: string | null;
  industryCategory: string | null;
  netWorthRange: string | null;
  publicCompanyRole: boolean;
  philanthropicVisibility: boolean;
  hasKnownThreats: boolean;
  threatPerceptionSelfRated: number | null;
  hasActiveAdversary: boolean;
  adversaryType: string | null;
  familyComposition: string[];
  dependentsAtRisk: boolean;
  familyPublicExposure: boolean;
  travelFrequency: 'rare' | 'occasional' | 'frequent' | 'constant' | null;
  internationalTravel: boolean;
  highRiskDestinations: string[];
  currentSecurityMeasures: string[];
  hasProtectionDetail: boolean;
  hasSecureResidence: boolean;
  hasSecureTransportation: boolean;
}

export interface ContextTags {
  hasActiveThreat: boolean;
  hasKnownAdversary: boolean;
  hasPriorIncidents: boolean;
  hasOnlineHarassment: boolean;
  hasHighPublicProfile: boolean;
  hasDigitalExposure: boolean;
  hasPredictablePatterns: boolean;
  hasExposedFamily: boolean;
  hasInternationalTravel: boolean;
  hasTravelToHighRiskAreas: boolean;
  hasExistingProtection: boolean;
  hasSecureResidence: boolean;
  hasSecureTransportation: boolean;
  hasIncidentResponsePlan: boolean;
  requiresFamilyProtection: boolean;
  requiresDigitalProtection: boolean;
  requiresTravelSecurity: boolean;
}

export interface RiskSignal {
  category: 'threat' | 'vulnerability' | 'exposure' | 'impact_amplifier';
  signal: string;
  sourceQuestionId: string;
  sourceAnswer: string;
  severity: 'indicator' | 'concern' | 'critical_indicator';
  affectedThreats: string[];
}

export interface SectionSummary {
  sectionId: string;
  sectionName: string;
  questionCount: number;
  answeredCount: number;
  completionPercentage: number;
  riskSignals: RiskSignal[];
}

export interface Attachment {
  type: 'photo' | 'document' | 'floor_plan' | 'report';
  filename: string;
  url: string;
  analysisRequired?: boolean;
  notes?: string;
}

export interface EPMapperOutput {
  assessmentId: number;
  templateType: 'executive_protection';
  preparedAt: string;
  mapperVersion: string;
  validation: ValidationResult;
  interviewData: {
    responses: InterviewResponses;
    completedAt: string;
    version: string;
  };
  principalProfile: PrincipalProfile;
  contextTags: ContextTags;
  sectionSummaries: SectionSummary[];
  riskSignals: RiskSignal[];
  attachments: Attachment[];
}

const EP_SECTIONS = [
  { id: 'public_profile', name: 'Public Profile Assessment', requiredQuestions: 6, questionPrefix: 'ep_public' },
  { id: 'threat_history', name: 'Threat History', requiredQuestions: 6, questionPrefix: 'ep_threat' },
  { id: 'family_composition', name: 'Family Composition', requiredQuestions: 6, questionPrefix: 'ep_family' },
  { id: 'daily_patterns', name: 'Daily Patterns & Travel', requiredQuestions: 6, questionPrefix: 'ep_daily' },
  { id: 'digital_footprint', name: 'Digital Footprint', requiredQuestions: 6, questionPrefix: 'ep_digital' },
  { id: 'residential_security', name: 'Residential Security', requiredQuestions: 6, questionPrefix: 'ep_residence' },
  { id: 'transportation_security', name: 'Transportation Security', requiredQuestions: 6, questionPrefix: 'ep_transport' },
  { id: 'current_measures', name: 'Current Security Measures', requiredQuestions: 6, questionPrefix: 'ep_current' },
];

const PHYSICAL_SECURITY_SECTIONS = [
  { id: 'res_property', name: 'Property Profile', requiredQuestions: 7, questionIds: ['res_crime_score', 'res_incident_details', 'res_incident_history', 'res_neighborhood_type', 'res_police_response', 'res_property_type', 'res_visibility'] },
  { id: 'res_perimeter', name: 'Perimeter Security', requiredQuestions: 9, questionIds: ['res_address_visible', 'res_boundary_defined', 'res_clear_zone', 'res_fence_condition', 'res_fence_type', 'res_gate_access_method', 'res_gate_type', 'res_perimeter_detection', 'res_warning_signs'] },
  { id: 'res_access', name: 'Access Control (Doors)', requiredQuestions: 8, questionIds: ['res_deadbolt_throw', 'res_door_count', 'res_door_frame', 'res_door_glass_access', 'res_door_viewer', 'res_front_door_material', 'res_front_lock_type', 'res_strike_plate'] },
  { id: 'res_alarms', name: 'Alarm Systems', requiredQuestions: 7, questionIds: ['res_alarm_backup', 'res_alarm_installed', 'res_alarm_sensors', 'res_alarm_tested', 'res_alarm_usage', 'res_panel_location', 'res_sensor_coverage'] },
  { id: 'res_surveillance', name: 'Surveillance Systems', requiredQuestions: 6, questionIds: ['res_camera_coverage', 'res_camera_protected', 'res_cctv_installed', 'res_night_vision', 'res_remote_view', 'res_video_retention'] },
  { id: 'res_lighting', name: 'Lighting Security', requiredQuestions: 6, questionIds: ['res_driveway_lighting', 'res_entry_lighting', 'res_lighting_type', 'res_lights_backup', 'res_lights_protected', 'res_perimeter_lighting'] },
  { id: 'res_interior', name: 'Interior Security', requiredQuestions: 6, questionIds: ['res_bedroom_door', 'res_firearm_storage', 'res_safe', 'res_smart_home', 'res_smart_security', 'res_valuables_visible'] },
  { id: 'res_windows', name: 'Windows & Glass', requiredQuestions: 5, questionIds: ['res_security_film', 'res_sliding_door', 'res_window_bars', 'res_window_lock_type', 'res_window_locks'] },
  { id: 'res_landscaping', name: 'Landscaping & CPTED', requiredQuestions: 5, questionIds: ['res_climbing_aids', 'res_concealment_vegetation', 'res_defensive_landscaping', 'res_street_sightline', 'res_tree_access'] },
  { id: 'res_vehicles', name: 'Vehicle Security', requiredQuestions: 6, questionIds: ['res_emergency_release', 'res_garage_interior_door', 'res_garage_opener', 'res_garage_type', 'res_garage_windows', 'res_vehicle_parking'] },
  { id: 'res_saferoom', name: 'Safe Room & Emergency', requiredQuestions: 5, questionIds: ['res_emergency_plan', 'res_emergency_supplies', 'res_safe_room', 'res_safe_room_comms', 'res_smoke_co'] },
  { id: 'res_monitoring', name: 'Monitoring & Response', requiredQuestions: 5, questionIds: ['res_duress_code', 'res_emergency_contacts', 'res_monitoring_level', 'res_perceived_security', 'res_security_training'] },
];

const REQUIRED_QUESTION_IDS = [
  'ep_public_profile_level',
  'ep_media_coverage',
  'ep_net_worth_range',
  'ep_known_threats',
  'ep_threat_perception',
  'ep_family_members',
  'ep_daily_routine_predictability',
  'ep_travel_frequency',
  'ep_social_media_presence',
  'ep_residence_type',
  'ep_transportation_method',
  'ep_current_security_level',
];

const SIGNAL_MAPPINGS: {
  questionId: string;
  badAnswers: string[];
  signal: string;
  severity: 'indicator' | 'concern' | 'critical_indicator';
  category: 'threat' | 'vulnerability' | 'exposure' | 'impact_amplifier';
  affectedThreats: string[];
}[] = [
  {
    questionId: 'ep_public_profile_level',
    badAnswers: ['very_high', 'high', 'celebrity'],
    signal: 'High public visibility increases targeting likelihood',
    severity: 'concern',
    category: 'exposure',
    affectedThreats: ['stalking_surveillance', 'kidnapping_abduction', 'doxxing_privacy_breach'],
  },
  {
    questionId: 'ep_controversial_involvement',
    badAnswers: ['yes', 'significant', 'frequent'],
    signal: 'Controversial activities generate adversarial attention',
    severity: 'critical_indicator',
    category: 'threat',
    affectedThreats: ['targeted_harassment', 'physical_assault', 'mail_package_threats'],
  },
  {
    questionId: 'ep_known_threats',
    badAnswers: ['yes', 'active', 'current', 'recent'],
    signal: 'Active or recent threat history present',
    severity: 'critical_indicator',
    category: 'threat',
    affectedThreats: ['all'],
  },
  {
    questionId: 'ep_prior_incidents',
    badAnswers: ['yes', 'multiple'],
    signal: 'Prior security incidents documented',
    severity: 'concern',
    category: 'threat',
    affectedThreats: ['all'],
  },
  {
    questionId: 'ep_family_public_exposure',
    badAnswers: ['yes', 'high', 'moderate'],
    signal: 'Family members have public exposure (soft target potential)',
    severity: 'concern',
    category: 'impact_amplifier',
    affectedThreats: ['kidnapping_abduction', 'stalking_surveillance', 'home_invasion'],
  },
  {
    questionId: 'ep_children_predictable_schedule',
    badAnswers: ['yes', 'very_predictable'],
    signal: 'Children have predictable schedules (vulnerability)',
    severity: 'critical_indicator',
    category: 'vulnerability',
    affectedThreats: ['kidnapping_abduction', 'stalking_surveillance'],
  },
  {
    questionId: 'ep_daily_routine_predictability',
    badAnswers: ['very_predictable', 'predictable', 'regular'],
    signal: 'Daily patterns are predictable (surveillance advantage)',
    severity: 'concern',
    category: 'vulnerability',
    affectedThreats: ['stalking_surveillance', 'kidnapping_abduction', 'physical_assault'],
  },
  {
    questionId: 'ep_same_routes_daily',
    badAnswers: ['yes', 'always', 'usually'],
    signal: 'Uses same routes daily (ambush vulnerability)',
    severity: 'critical_indicator',
    category: 'vulnerability',
    affectedThreats: ['kidnapping_abduction', 'physical_assault', 'vehicle_attack'],
  },
  {
    questionId: 'ep_social_media_presence',
    badAnswers: ['active', 'very_active', 'public_profiles'],
    signal: 'Active public social media presence (OSINT vulnerability)',
    severity: 'concern',
    category: 'exposure',
    affectedThreats: ['doxxing_privacy_breach', 'stalking_surveillance', 'social_engineering'],
  },
  {
    questionId: 'ep_location_sharing',
    badAnswers: ['yes', 'often', 'real_time'],
    signal: 'Shares location on social media (tracking vulnerability)',
    severity: 'critical_indicator',
    category: 'vulnerability',
    affectedThreats: ['stalking_surveillance', 'kidnapping_abduction'],
  },
  {
    questionId: 'ep_property_records_exposed',
    badAnswers: ['yes', 'public', 'easily_found'],
    signal: 'Property records are publicly accessible (residence exposed)',
    severity: 'concern',
    category: 'exposure',
    affectedThreats: ['home_invasion', 'stalking_surveillance', 'doxxing_privacy_breach'],
  },
  {
    questionId: 'ep_residence_visibility',
    badAnswers: ['high', 'very_visible', 'no_privacy'],
    signal: 'Residence has high visibility from public areas',
    severity: 'indicator',
    category: 'vulnerability',
    affectedThreats: ['stalking_surveillance', 'home_invasion'],
  },
  {
    questionId: 'ep_perimeter_security',
    badAnswers: ['none', 'minimal', 'basic'],
    signal: 'Limited perimeter security at residence',
    severity: 'concern',
    category: 'vulnerability',
    affectedThreats: ['home_invasion', 'stalking_surveillance'],
  },
  {
    questionId: 'ep_vehicle_armored',
    badAnswers: ['no', 'standard'],
    signal: 'Uses non-armored vehicle',
    severity: 'indicator',
    category: 'vulnerability',
    affectedThreats: ['kidnapping_abduction', 'vehicle_attack', 'physical_assault'],
  },
  {
    questionId: 'ep_driver_trained',
    badAnswers: ['no', 'basic', 'untrained'],
    signal: 'Driver lacks protective/evasive driving training',
    severity: 'concern',
    category: 'vulnerability',
    affectedThreats: ['kidnapping_abduction', 'vehicle_attack'],
  },
  {
    questionId: 'ep_international_high_risk',
    badAnswers: ['yes', 'frequently', 'sometimes'],
    signal: 'Travels to high-risk international destinations',
    severity: 'critical_indicator',
    category: 'exposure',
    affectedThreats: ['kidnapping_abduction', 'express_kidnapping', 'extortion'],
  },
  {
    questionId: 'ep_travel_advance_planning',
    badAnswers: ['no', 'rarely', 'sometimes'],
    signal: 'Limited advance security planning for travel',
    severity: 'concern',
    category: 'vulnerability',
    affectedThreats: ['kidnapping_abduction', 'physical_assault'],
  },
];

const PHYSICAL_SECURITY_SIGNAL_MAPPINGS: typeof SIGNAL_MAPPINGS = [
  { questionId: 'res_alarm_installed', badAnswers: ['no', 'none'], signal: 'No alarm system installed', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion', 'stalking_surveillance'] },
  { questionId: 'res_alarm_usage', badAnswers: ['never', 'rarely'], signal: 'Alarm system not regularly used', severity: 'indicator', category: 'vulnerability', affectedThreats: ['home_invasion'] },
  { questionId: 'res_monitoring_level', badAnswers: ['none', 'self', 'self-monitored'], signal: 'No professional monitoring service', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion'] },
  { questionId: 'res_cctv_installed', badAnswers: ['no', 'none'], signal: 'No surveillance cameras installed', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion', 'stalking_surveillance'] },
  { questionId: 'res_fence_type', badAnswers: ['none', 'no fence'], signal: 'No perimeter fencing', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion', 'stalking_surveillance'] },
  { questionId: 'res_gate_type', badAnswers: ['none', 'no gate'], signal: 'No access gate', severity: 'indicator', category: 'vulnerability', affectedThreats: ['home_invasion'] },
  { questionId: 'res_perimeter_lighting', badAnswers: ['no', 'none', 'inadequate'], signal: 'Inadequate perimeter lighting', severity: 'indicator', category: 'vulnerability', affectedThreats: ['home_invasion', 'stalking_surveillance'] },
  { questionId: 'res_front_door_material', badAnswers: ['hollow', 'glass', 'weak'], signal: 'Front door lacks reinforcement', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion'] },
  { questionId: 'res_front_lock_type', badAnswers: ['basic', 'standard', 'single'], signal: 'Basic lock security on main entry', severity: 'indicator', category: 'vulnerability', affectedThreats: ['home_invasion'] },
  { questionId: 'res_safe_room', badAnswers: ['no', 'none'], signal: 'No safe room or hardened shelter', severity: 'indicator', category: 'vulnerability', affectedThreats: ['home_invasion', 'kidnapping_abduction'] },
  { questionId: 'res_emergency_plan', badAnswers: ['no', 'none'], signal: 'No emergency response plan', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion', 'kidnapping_abduction'] },
  { questionId: 'res_crime_score', badAnswers: ['high', 'very high', 'elevated'], signal: 'Property in high-crime area', severity: 'critical_indicator', category: 'threat', affectedThreats: ['home_invasion', 'stalking_surveillance', 'physical_assault'] },
  { questionId: 'res_incident_history', badAnswers: ['yes', 'multiple'], signal: 'Prior security incidents at residence', severity: 'critical_indicator', category: 'threat', affectedThreats: ['home_invasion', 'stalking_surveillance'] },
  { questionId: 'res_visibility', badAnswers: ['high', 'very visible', 'exposed'], signal: 'Residence highly visible from public areas', severity: 'indicator', category: 'exposure', affectedThreats: ['stalking_surveillance', 'home_invasion'] },
  { questionId: 'res_concealment_vegetation', badAnswers: ['yes', 'significant'], signal: 'Vegetation provides concealment for intruders', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion', 'stalking_surveillance'] },
  { questionId: 'res_window_locks', badAnswers: ['no', 'none', 'broken'], signal: 'Windows lack adequate locks', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion'] },
  { questionId: 'res_garage_interior_door', badAnswers: ['unlocked', 'weak', 'no door'], signal: 'Garage interior access unsecured', severity: 'concern', category: 'vulnerability', affectedThreats: ['home_invasion'] },
  { questionId: 'res_security_training', badAnswers: ['no', 'none'], signal: 'Household lacks security awareness training', severity: 'indicator', category: 'vulnerability', affectedThreats: ['home_invasion', 'social_engineering'] },
];

export function validateInterviewCompletion(responses: InterviewResponses): ValidationResult {
  const answeredQuestions = Object.keys(responses).filter(
    key => responses[key] !== null && responses[key] !== undefined && responses[key] !== ''
  );
  
  const missingRequired = REQUIRED_QUESTION_IDS.filter(
    id => !responses[id] || responses[id] === '' || responses[id] === null
  );
  
  const warnings: string[] = [];
  EP_SECTIONS.forEach(section => {
    const sectionQuestions = Object.keys(responses).filter(
      key => key.startsWith(`ep_${section.id}`) || key.includes(section.id)
    );
    if (sectionQuestions.length > 0 && sectionQuestions.length < section.requiredQuestions) {
      warnings.push(`Section "${section.name}" appears incomplete`);
    }
  });
  
  const totalExpected = 48;
  const completionPercentage = Math.round((answeredQuestions.length / totalExpected) * 100);
  
  return {
    isComplete: missingRequired.length === 0 && completionPercentage >= 90,
    completionPercentage,
    answeredQuestions: answeredQuestions.length,
    totalQuestions: totalExpected,
    missingRequired,
    warnings,
  };
}

function mapPublicExposure(value: string | undefined): PrincipalProfile['publicExposureLevel'] {
  if (!value) return null;
  const mapping: Record<string, PrincipalProfile['publicExposureLevel']> = {
    'very_low': 'minimal',
    'low': 'minimal',
    'minimal': 'minimal',
    'moderate': 'moderate',
    'medium': 'moderate',
    'high': 'significant',
    'significant': 'significant',
    'very_high': 'extensive',
    'celebrity': 'extensive',
    'extensive': 'extensive',
  };
  return mapping[value.toLowerCase()] || null;
}

function mapTravelFrequency(value: string | undefined): PrincipalProfile['travelFrequency'] {
  if (!value) return null;
  const mapping: Record<string, PrincipalProfile['travelFrequency']> = {
    'never': 'rare',
    'rarely': 'rare',
    'rare': 'rare',
    'occasional': 'occasional',
    'sometimes': 'occasional',
    'monthly': 'occasional',
    'frequent': 'frequent',
    'weekly': 'frequent',
    'often': 'frequent',
    'constant': 'constant',
    'daily': 'constant',
    'continuous': 'constant',
  };
  return mapping[value.toLowerCase()] || null;
}

function extractFamilyComposition(responses: InterviewResponses): string[] {
  const members: string[] = [];
  if (responses.ep_spouse === 'yes' || responses.ep_partner === 'yes') members.push('spouse/partner');
  if (responses.ep_minor_children === 'yes') members.push('minor_children');
  if (responses.ep_adult_children === 'yes') members.push('adult_children');
  if (responses.ep_elderly_parents === 'yes') members.push('elderly_parents');
  if (responses.ep_live_in_staff === 'yes') members.push('live_in_staff');
  if (responses.ep_family_members) {
    const parsed = typeof responses.ep_family_members === 'string' 
      ? responses.ep_family_members.split(',').map((s: string) => s.trim())
      : Array.isArray(responses.ep_family_members) ? responses.ep_family_members : [];
    members.push(...parsed);
  }
  return Array.from(new Set(members));
}

function extractHighRiskDestinations(responses: InterviewResponses): string[] {
  const destinations: string[] = [];
  if (responses.ep_high_risk_destinations) {
    const parsed = typeof responses.ep_high_risk_destinations === 'string'
      ? responses.ep_high_risk_destinations.split(',').map((s: string) => s.trim())
      : Array.isArray(responses.ep_high_risk_destinations) ? responses.ep_high_risk_destinations : [];
    destinations.push(...parsed);
  }
  if (responses.ep_recent_travel_destinations) {
    const parsed = typeof responses.ep_recent_travel_destinations === 'string'
      ? responses.ep_recent_travel_destinations.split(',').map((s: string) => s.trim())
      : Array.isArray(responses.ep_recent_travel_destinations) ? responses.ep_recent_travel_destinations : [];
    destinations.push(...parsed);
  }
  return Array.from(new Set(destinations));
}

function extractCurrentMeasures(responses: InterviewResponses): string[] {
  const measures: string[] = [];
  if (getResponseBool(responses.ep_has_security_team) === true) measures.push('security_team');
  if (getResponseBool(responses.ep_protection_detail) === true) measures.push('protection_detail');
  if (getResponseBool(responses.ep_alarm_system) === true) measures.push('alarm_system');
  if (getResponseBool(responses.ep_cctv) === true) measures.push('cctv_surveillance');
  if (getResponseBool(responses.ep_access_control) === true) measures.push('access_control');
  if (getResponseBool(responses.ep_safe_room) === true) measures.push('safe_room');
  if (getResponseBool(responses.ep_armored_vehicle) === true) measures.push('armored_vehicle');
  if (getResponseBool(responses.ep_trained_driver) === true) measures.push('trained_driver');
  if (getResponseBool(responses.ep_cyber_security) === true) measures.push('cyber_security');
  const measuresValue = getResponseValue(responses.ep_current_security_measures);
  if (measuresValue) {
    const parsed = measuresValue.split(',').map((s: string) => s.trim());
    measures.push(...parsed);
  }
  return Array.from(new Set(measures));
}

export function extractPrincipalProfile(responses: InterviewResponses): PrincipalProfile {
  return {
    publicExposureLevel: mapPublicExposure(getResponseValue(responses.ep_public_profile_level)),
    mediaPresence: getResponseValue(responses.ep_media_coverage) ?? null,
    industryCategory: getResponseValue(responses.ep_industry_sector) ?? null,
    netWorthRange: getResponseValue(responses.ep_net_worth_range) ?? null,
    publicCompanyRole: getResponseBool(responses.ep_public_company_exec) === true,
    philanthropicVisibility: getResponseBool(responses.ep_philanthropic_visibility) === true || responseMatches(responses.ep_philanthropic_visibility, ['high']),
    hasKnownThreats: getResponseBool(responses.ep_known_threats) === true || responseMatches(responses.ep_known_threats, ['active']),
    threatPerceptionSelfRated: getResponseValue(responses.ep_threat_perception) ? parseInt(getResponseValue(responses.ep_threat_perception)!) : null,
    hasActiveAdversary: getResponseBool(responses.ep_active_adversary) === true,
    adversaryType: getResponseValue(responses.ep_adversary_type) ?? null,
    familyComposition: extractFamilyComposition(responses),
    dependentsAtRisk: getResponseBool(responses.ep_dependents_at_risk) === true || getResponseBool(responses.ep_minor_children) === true,
    familyPublicExposure: getResponseBool(responses.ep_family_public_exposure) === true || responseMatches(responses.ep_family_public_exposure, ['high']),
    travelFrequency: mapTravelFrequency(getResponseValue(responses.ep_travel_frequency)),
    internationalTravel: getResponseBool(responses.ep_international_travel) === true || responseMatches(responses.ep_international_travel, ['frequent']),
    highRiskDestinations: extractHighRiskDestinations(responses),
    currentSecurityMeasures: extractCurrentMeasures(responses),
    hasProtectionDetail: getResponseBool(responses.ep_protection_detail) === true || responseMatches(responses.ep_current_security_level, ['24x7']),
    hasSecureResidence: responseMatches(responses.ep_residence_security_level, ['high', 'comprehensive']),
    hasSecureTransportation: getResponseBool(responses.ep_vehicle_armored) === true || getResponseBool(responses.ep_secure_transportation) === true,
  };
}

export function buildContextTags(responses: InterviewResponses): ContextTags {
  return {
    hasActiveThreat: getResponseBool(responses.ep_known_threats) === true || responseMatches(responses.ep_known_threats, ['active']) || getResponseBool(responses.ep_active_adversary) === true,
    hasKnownAdversary: getResponseBool(responses.ep_active_adversary) === true || getResponseBool(responses.ep_adversary_identified) === true,
    hasPriorIncidents: getResponseBool(responses.ep_prior_incidents) === true || responseMatches(responses.ep_prior_incidents, ['multiple']),
    hasOnlineHarassment: getResponseBool(responses.ep_online_harassment) === true || getResponseBool(responses.ep_cyber_threats) === true,
    hasHighPublicProfile: responseMatches(responses.ep_public_profile_level, ['very_high', 'high', 'celebrity', 'extensive']),
    hasDigitalExposure: responseMatches(responses.ep_social_media_presence, ['active']) || responseMatches(responses.ep_digital_footprint, ['significant']),
    hasPredictablePatterns: responseMatches(responses.ep_daily_routine_predictability, ['predictable', 'very_predictable']),
    hasExposedFamily: getResponseBool(responses.ep_family_public_exposure) === true || responseMatches(responses.ep_family_public_exposure, ['high']),
    hasInternationalTravel: getResponseBool(responses.ep_international_travel) === true || responseMatches(responses.ep_international_travel, ['frequent']),
    hasTravelToHighRiskAreas: getResponseBool(responses.ep_international_high_risk) === true || responseMatches(responses.ep_international_high_risk, ['frequently']),
    hasExistingProtection: getResponseBool(responses.ep_protection_detail) === true || responseMatches(responses.ep_current_security_level, ['24x7']),
    hasSecureResidence: responseMatches(responses.ep_residence_security_level, ['high', 'comprehensive']),
    hasSecureTransportation: getResponseBool(responses.ep_vehicle_armored) === true || getResponseBool(responses.ep_secure_transportation) === true,
    hasIncidentResponsePlan: getResponseBool(responses.ep_incident_response_plan) === true || getResponseBool(responses.ep_emergency_protocols) === true,
    requiresFamilyProtection: getResponseBool(responses.ep_minor_children) === true || getResponseBool(responses.ep_dependents_at_risk) === true,
    requiresDigitalProtection: responseMatches(responses.ep_social_media_presence, ['active']) || getResponseBool(responses.ep_online_harassment) === true,
    requiresTravelSecurity: responseMatches(responses.ep_travel_frequency, ['frequent', 'constant']) || getResponseBool(responses.ep_international_high_risk) === true,
  };
}

export function extractRiskSignals(responses: InterviewResponses): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  const allMappings = [...SIGNAL_MAPPINGS, ...PHYSICAL_SECURITY_SIGNAL_MAPPINGS];
  
  for (const mapping of allMappings) {
    const rawAnswer = responses[mapping.questionId];
    const answerValue = getResponseValue(rawAnswer);
    if (answerValue && mapping.badAnswers.some(bad => 
      answerValue.toLowerCase().includes(bad.toLowerCase())
    )) {
      signals.push({
        category: mapping.category,
        signal: mapping.signal,
        sourceQuestionId: mapping.questionId,
        sourceAnswer: answerValue,
        severity: mapping.severity,
        affectedThreats: mapping.affectedThreats,
      });
    }
  }
  
  return signals;
}

function matchesSectionPrefix(key: string, prefixPattern: string): boolean {
  const prefixes = prefixPattern.split('|');
  return prefixes.some(prefix => key.startsWith(prefix));
}

export function buildSectionSummaries(responses: InterviewResponses, signals: RiskSignal[]): SectionSummary[] {
  const allSections = [...EP_SECTIONS, ...PHYSICAL_SECURITY_SECTIONS];
  
  return allSections.map(section => {
    const sectionQuestionKeys = Object.keys(responses).filter(key => {
      if ('questionIds' in section && section.questionIds) {
        return section.questionIds.includes(key);
      }
      if ('questionPrefix' in section && section.questionPrefix) {
        return matchesSectionPrefix(key, section.questionPrefix);
      }
      return key.startsWith(`ep_${section.id}`) || key.includes(section.id);
    });
    
    const answeredCount = sectionQuestionKeys.filter(
      key => responses[key] !== null && responses[key] !== undefined && responses[key] !== ''
    ).length;
    
    const sectionSignals = signals.filter(sig => 
      sectionQuestionKeys.includes(sig.sourceQuestionId)
    );
    
    return {
      sectionId: section.id,
      sectionName: section.name,
      questionCount: section.requiredQuestions,
      answeredCount,
      completionPercentage: section.requiredQuestions > 0 
        ? Math.round((answeredCount / section.requiredQuestions) * 100) 
        : 0,
      riskSignals: sectionSignals,
    };
  });
}

export function prepareForAIEngine(
  assessmentId: number,
  responses: InterviewResponses,
  attachments: Attachment[] = []
): EPMapperOutput {
  const validation = validateInterviewCompletion(responses);
  const principalProfile = extractPrincipalProfile(responses);
  const contextTags = buildContextTags(responses);
  const riskSignals = extractRiskSignals(responses);
  const sectionSummaries = buildSectionSummaries(responses, riskSignals);
  
  return {
    assessmentId,
    templateType: 'executive_protection',
    preparedAt: new Date().toISOString(),
    mapperVersion: '2.0',
    validation,
    interviewData: {
      responses,
      completedAt: new Date().toISOString(),
      version: '2.0',
    },
    principalProfile,
    contextTags,
    sectionSummaries,
    riskSignals,
    attachments: attachments.map(att => ({
      ...att,
      analysisRequired: att.analysisRequired ?? true,
    })),
  };
}
