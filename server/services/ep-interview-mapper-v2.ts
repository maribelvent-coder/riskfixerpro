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
  { id: 'public_profile', name: 'Public Profile Assessment', requiredQuestions: 6 },
  { id: 'threat_history', name: 'Threat History', requiredQuestions: 6 },
  { id: 'family_composition', name: 'Family Composition', requiredQuestions: 6 },
  { id: 'daily_patterns', name: 'Daily Patterns & Travel', requiredQuestions: 6 },
  { id: 'digital_footprint', name: 'Digital Footprint', requiredQuestions: 6 },
  { id: 'residential_security', name: 'Residential Security', requiredQuestions: 6 },
  { id: 'transportation_security', name: 'Transportation Security', requiredQuestions: 6 },
  { id: 'current_measures', name: 'Current Security Measures', requiredQuestions: 6 },
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
  if (responses.ep_has_security_team === 'yes') measures.push('security_team');
  if (responses.ep_protection_detail === 'yes') measures.push('protection_detail');
  if (responses.ep_alarm_system === 'yes') measures.push('alarm_system');
  if (responses.ep_cctv === 'yes') measures.push('cctv_surveillance');
  if (responses.ep_access_control === 'yes') measures.push('access_control');
  if (responses.ep_safe_room === 'yes') measures.push('safe_room');
  if (responses.ep_armored_vehicle === 'yes') measures.push('armored_vehicle');
  if (responses.ep_trained_driver === 'yes') measures.push('trained_driver');
  if (responses.ep_cyber_security === 'yes') measures.push('cyber_security');
  if (responses.ep_current_security_measures) {
    const parsed = typeof responses.ep_current_security_measures === 'string'
      ? responses.ep_current_security_measures.split(',').map((s: string) => s.trim())
      : Array.isArray(responses.ep_current_security_measures) ? responses.ep_current_security_measures : [];
    measures.push(...parsed);
  }
  return Array.from(new Set(measures));
}

export function extractPrincipalProfile(responses: InterviewResponses): PrincipalProfile {
  return {
    publicExposureLevel: mapPublicExposure(responses.ep_public_profile_level),
    mediaPresence: responses.ep_media_coverage || null,
    industryCategory: responses.ep_industry_sector || null,
    netWorthRange: responses.ep_net_worth_range || null,
    publicCompanyRole: responses.ep_public_company_exec === 'yes',
    philanthropicVisibility: responses.ep_philanthropic_visibility === 'yes' || responses.ep_philanthropic_visibility === 'high',
    hasKnownThreats: responses.ep_known_threats === 'yes' || responses.ep_known_threats === 'active',
    threatPerceptionSelfRated: responses.ep_threat_perception ? parseInt(responses.ep_threat_perception) : null,
    hasActiveAdversary: responses.ep_active_adversary === 'yes',
    adversaryType: responses.ep_adversary_type || null,
    familyComposition: extractFamilyComposition(responses),
    dependentsAtRisk: responses.ep_dependents_at_risk === 'yes' || responses.ep_minor_children === 'yes',
    familyPublicExposure: responses.ep_family_public_exposure === 'yes' || responses.ep_family_public_exposure === 'high',
    travelFrequency: mapTravelFrequency(responses.ep_travel_frequency),
    internationalTravel: responses.ep_international_travel === 'yes' || responses.ep_international_travel === 'frequent',
    highRiskDestinations: extractHighRiskDestinations(responses),
    currentSecurityMeasures: extractCurrentMeasures(responses),
    hasProtectionDetail: responses.ep_protection_detail === 'yes' || responses.ep_current_security_level === '24x7',
    hasSecureResidence: responses.ep_residence_security_level === 'high' || responses.ep_residence_security_level === 'comprehensive',
    hasSecureTransportation: responses.ep_vehicle_armored === 'yes' || responses.ep_secure_transportation === 'yes',
  };
}

export function buildContextTags(responses: InterviewResponses): ContextTags {
  return {
    hasActiveThreat: responses.ep_known_threats === 'yes' || responses.ep_known_threats === 'active' || responses.ep_active_adversary === 'yes',
    hasKnownAdversary: responses.ep_active_adversary === 'yes' || responses.ep_adversary_identified === 'yes',
    hasPriorIncidents: responses.ep_prior_incidents === 'yes' || responses.ep_prior_incidents === 'multiple',
    hasOnlineHarassment: responses.ep_online_harassment === 'yes' || responses.ep_cyber_threats === 'yes',
    hasHighPublicProfile: ['very_high', 'high', 'celebrity', 'extensive'].includes(responses.ep_public_profile_level),
    hasDigitalExposure: responses.ep_social_media_presence === 'active' || responses.ep_digital_footprint === 'significant',
    hasPredictablePatterns: responses.ep_daily_routine_predictability === 'predictable' || responses.ep_daily_routine_predictability === 'very_predictable',
    hasExposedFamily: responses.ep_family_public_exposure === 'yes' || responses.ep_family_public_exposure === 'high',
    hasInternationalTravel: responses.ep_international_travel === 'yes' || responses.ep_international_travel === 'frequent',
    hasTravelToHighRiskAreas: responses.ep_international_high_risk === 'yes' || responses.ep_international_high_risk === 'frequently',
    hasExistingProtection: responses.ep_protection_detail === 'yes' || responses.ep_current_security_level === '24x7',
    hasSecureResidence: responses.ep_residence_security_level === 'high' || responses.ep_residence_security_level === 'comprehensive',
    hasSecureTransportation: responses.ep_vehicle_armored === 'yes' || responses.ep_secure_transportation === 'yes',
    hasIncidentResponsePlan: responses.ep_incident_response_plan === 'yes' || responses.ep_emergency_protocols === 'yes',
    requiresFamilyProtection: responses.ep_minor_children === 'yes' || responses.ep_dependents_at_risk === 'yes',
    requiresDigitalProtection: responses.ep_social_media_presence === 'active' || responses.ep_online_harassment === 'yes',
    requiresTravelSecurity: responses.ep_travel_frequency === 'frequent' || responses.ep_travel_frequency === 'constant' || responses.ep_international_high_risk === 'yes',
  };
}

export function extractRiskSignals(responses: InterviewResponses): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  for (const mapping of SIGNAL_MAPPINGS) {
    const answer = responses[mapping.questionId];
    if (answer && mapping.badAnswers.some(bad => 
      typeof answer === 'string' && answer.toLowerCase().includes(bad.toLowerCase())
    )) {
      signals.push({
        category: mapping.category,
        signal: mapping.signal,
        sourceQuestionId: mapping.questionId,
        sourceAnswer: String(answer),
        severity: mapping.severity,
        affectedThreats: mapping.affectedThreats,
      });
    }
  }
  
  return signals;
}

export function buildSectionSummaries(responses: InterviewResponses, signals: RiskSignal[]): SectionSummary[] {
  return EP_SECTIONS.map(section => {
    const sectionQuestionKeys = Object.keys(responses).filter(
      key => key.startsWith(`ep_${section.id}`) || key.includes(section.id)
    );
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
