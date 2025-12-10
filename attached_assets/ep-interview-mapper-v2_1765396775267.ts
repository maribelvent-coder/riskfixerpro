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
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 */

// ============================================================================
// INTERFACES — DATA STRUCTURES ONLY (NO SCORES)
// ============================================================================

export type InterviewResponses = Record<string, any>;

/**
 * Validation result — checks interview completion
 */
export interface ValidationResult {
  isComplete: boolean;
  completionPercentage: number;
  answeredQuestions: number;
  totalQuestions: number;
  missingRequired: string[];
  warnings: string[];
}

/**
 * Principal profile extracted from interview
 * Used by AI engine for threat assessment context
 */
export interface PrincipalProfile {
  // Public Exposure
  publicExposureLevel: 'minimal' | 'moderate' | 'significant' | 'extensive' | null;
  mediaPresence: string | null;
  industryCategory: string | null;
  
  // Financial Profile
  netWorthRange: string | null;
  publicCompanyRole: boolean;
  philanthropicVisibility: boolean;
  
  // Threat Indicators (qualitative, not scored)
  hasKnownThreats: boolean;
  threatPerceptionSelfRated: number | null; // 1-10 from interview
  hasActiveAdversary: boolean;
  adversaryType: string | null;
  
  // Family
  familyComposition: string[];
  dependentsAtRisk: boolean;
  familyPublicExposure: boolean;
  
  // Lifestyle
  travelFrequency: 'rare' | 'occasional' | 'frequent' | 'constant' | null;
  internationalTravel: boolean;
  highRiskDestinations: string[];
  
  // Security Posture (current state, not effectiveness score)
  currentSecurityMeasures: string[];
  hasProtectionDetail: boolean;
  hasSecureResidence: boolean;
  hasSecureTransportation: boolean;
}

/**
 * Contextual tags for AI engine
 * Boolean flags that help AI understand the assessment context
 */
export interface ContextTags {
  // Threat Indicators
  hasActiveThreat: boolean;
  hasKnownAdversary: boolean;
  hasPriorIncidents: boolean;
  hasOnlineHarassment: boolean;
  
  // Exposure Factors
  hasHighPublicProfile: boolean;
  hasDigitalExposure: boolean;
  hasPredictablePatterns: boolean;
  hasExposedFamily: boolean;
  
  // Travel Factors
  hasInternationalTravel: boolean;
  hasTravelToHighRiskAreas: boolean;
  
  // Security Posture
  hasExistingProtection: boolean;
  hasSecureResidence: boolean;
  hasSecureTransportation: boolean;
  hasIncidentResponsePlan: boolean;
  
  // Special Considerations
  requiresFamilyProtection: boolean;
  requiresDigitalProtection: boolean;
  requiresTravelSecurity: boolean;
}

/**
 * Risk signal — qualitative indicator extracted from interview
 * NOT a score — just a flag for the AI to consider
 */
export interface RiskSignal {
  category: 'threat' | 'vulnerability' | 'exposure' | 'impact_amplifier';
  signal: string;
  sourceQuestionId: string;
  sourceAnswer: string;
  severity: 'indicator' | 'concern' | 'critical_indicator';
  affectedThreats: string[];  // Which threat types this might affect
}

/**
 * Interview section summary
 */
export interface SectionSummary {
  sectionId: string;
  sectionName: string;
  questionCount: number;
  answeredCount: number;
  completionPercentage: number;
  riskSignals: RiskSignal[];
}

/**
 * Attachment reference for AI analysis
 */
export interface Attachment {
  type: 'photo' | 'document' | 'floor_plan' | 'report';
  filename: string;
  url: string;
  analysisRequired: boolean;
  notes?: string;
}

/**
 * Final output from mapper — ready for AI engine
 */
export interface EPMapperOutput {
  // Metadata
  assessmentId: number;
  templateType: 'executive_protection';
  preparedAt: string;
  mapperVersion: string;
  
  // Validation
  validation: ValidationResult;
  
  // Raw interview data (for AI reference)
  interviewData: {
    responses: InterviewResponses;
    completedAt: string;
    version: string;
  };
  
  // Structured profiles
  principalProfile: PrincipalProfile;
  
  // Context for AI
  contextTags: ContextTags;
  
  // Section summaries
  sectionSummaries: SectionSummary[];
  
  // Qualitative signals (NOT scores)
  riskSignals: RiskSignal[];
  
  // Attachments
  attachments: Attachment[];
}

// ============================================================================
// EP INTERVIEW SECTIONS (for validation)
// ============================================================================

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

// ============================================================================
// QUESTION-TO-SIGNAL MAPPINGS
// ============================================================================

/**
 * Maps specific answers to risk signals
 * This is QUALITATIVE flagging, not scoring
 */
const SIGNAL_MAPPINGS: {
  questionId: string;
  badAnswers: string[];
  signal: string;
  severity: 'indicator' | 'concern' | 'critical_indicator';
  category: 'threat' | 'vulnerability' | 'exposure' | 'impact_amplifier';
  affectedThreats: string[];
}[] = [
  // Public Profile Signals
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
  
  // Threat History Signals
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
  
  // Family Signals
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
  
  // Pattern Signals
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
  
  // Digital Signals
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
  
  // Residential Signals
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
  
  // Transportation Signals
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
  
  // Travel Signals
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

// ============================================================================
// DATA PREPARATION FUNCTIONS
// ============================================================================

/**
 * Validates interview completion
 */
export function validateInterviewCompletion(responses: InterviewResponses): ValidationResult {
  const answeredQuestions = Object.keys(responses).filter(
    key => responses[key] !== null && responses[key] !== undefined && responses[key] !== ''
  );
  
  const missingRequired = REQUIRED_QUESTION_IDS.filter(
    id => !responses[id] || responses[id] === '' || responses[id] === null
  );
  
  const warnings: string[] = [];
  
  // Check for partial section completion
  EP_SECTIONS.forEach(section => {
    const sectionQuestions = Object.keys(responses).filter(
      key => key.startsWith(`ep_${section.id}`) || key.includes(section.id)
    );
    if (sectionQuestions.length > 0 && sectionQuestions.length < section.requiredQuestions) {
      warnings.push(`Section "${section.name}" appears incomplete`);
    }
  });
  
  const totalExpected = 48; // EP interview has 48 questions
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

/**
 * Extracts principal profile from interview responses
 */
export function extractPrincipalProfile(responses: InterviewResponses): PrincipalProfile {
  return {
    // Public Exposure
    publicExposureLevel: mapPublicExposure(responses.ep_public_profile_level),
    mediaPresence: responses.ep_media_coverage || null,
    industryCategory: responses.ep_industry_sector || null,
    
    // Financial Profile
    netWorthRange: responses.ep_net_worth_range || null,
    publicCompanyRole: responses.ep_public_company_exec === 'yes',
    philanthropicVisibility: responses.ep_philanthropic_visibility === 'yes' || responses.ep_philanthropic_visibility === 'high',
    
    // Threat Indicators
    hasKnownThreats: responses.ep_known_threats === 'yes' || responses.ep_known_threats === 'active',
    threatPerceptionSelfRated: responses.ep_threat_perception ? parseInt(responses.ep_threat_perception) : null,
    hasActiveAdversary: responses.ep_active_adversary === 'yes',
    adversaryType: responses.ep_adversary_type || null,
    
    // Family
    familyComposition: extractFamilyComposition(responses),
    dependentsAtRisk: responses.ep_dependents_at_risk === 'yes' || responses.ep_minor_children === 'yes',
    familyPublicExposure: responses.ep_family_public_exposure === 'yes' || responses.ep_family_public_exposure === 'high',
    
    // Lifestyle
    travelFrequency: mapTravelFrequency(responses.ep_travel_frequency),
    internationalTravel: responses.ep_international_travel === 'yes' || responses.ep_international_travel === 'frequent',
    highRiskDestinations: extractHighRiskDestinations(responses),
    
    // Security Posture
    currentSecurityMeasures: extractCurrentMeasures(responses),
    hasProtectionDetail: responses.ep_protection_detail === 'yes' || responses.ep_current_security_level === '24x7' || responses.ep_current_security_level === 'part_time',
    hasSecureResidence: responses.ep_residence_security_level === 'high' || responses.ep_residence_security_level === 'comprehensive',
    hasSecureTransportation: responses.ep_vehicle_armored === 'yes' || responses.ep_secure_transportation === 'yes',
  };
}

/**
 * Builds context tags for AI engine
 */
export function buildContextTags(responses: InterviewResponses): ContextTags {
  return {
    // Threat Indicators
    hasActiveThreat: responses.ep_known_threats === 'yes' || responses.ep_known_threats === 'active' || responses.ep_active_adversary === 'yes',
    hasKnownAdversary: responses.ep_active_adversary === 'yes' || responses.ep_adversary_identified === 'yes',
    hasPriorIncidents: responses.ep_prior_incidents === 'yes' || responses.ep_prior_incidents === 'multiple',
    hasOnlineHarassment: responses.ep_online_harassment === 'yes' || responses.ep_cyber_threats === 'yes',
    
    // Exposure Factors
    hasHighPublicProfile: ['very_high', 'high', 'celebrity', 'extensive'].includes(responses.ep_public_profile_level),
    hasDigitalExposure: responses.ep_social_media_presence === 'active' || responses.ep_digital_footprint === 'significant',
    hasPredictablePatterns: responses.ep_daily_routine_predictability === 'predictable' || responses.ep_daily_routine_predictability === 'very_predictable',
    hasExposedFamily: responses.ep_family_public_exposure === 'yes' || responses.ep_family_public_exposure === 'high',
    
    // Travel Factors
    hasInternationalTravel: responses.ep_international_travel === 'yes' || responses.ep_international_travel === 'frequent',
    hasTravelToHighRiskAreas: responses.ep_international_high_risk === 'yes' || responses.ep_high_risk_destinations === 'yes',
    
    // Security Posture
    hasExistingProtection: responses.ep_protection_detail === 'yes' || responses.ep_current_security_level !== 'none',
    hasSecureResidence: responses.ep_residence_security_level === 'high' || responses.ep_residence_security_level === 'comprehensive',
    hasSecureTransportation: responses.ep_vehicle_armored === 'yes' || responses.ep_secure_transportation === 'yes',
    hasIncidentResponsePlan: responses.ep_incident_response_plan === 'yes',
    
    // Special Considerations
    requiresFamilyProtection: responses.ep_minor_children === 'yes' || responses.ep_family_at_risk === 'yes' || responses.ep_dependents_at_risk === 'yes',
    requiresDigitalProtection: responses.ep_digital_footprint === 'significant' || responses.ep_doxxing_concern === 'yes',
    requiresTravelSecurity: responses.ep_international_high_risk === 'yes' || responses.ep_travel_frequency === 'frequent' || responses.ep_travel_frequency === 'constant',
  };
}

/**
 * Extracts risk signals from responses
 * These are QUALITATIVE indicators, not scores
 */
export function extractRiskSignals(responses: InterviewResponses): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  SIGNAL_MAPPINGS.forEach(mapping => {
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
  });
  
  return signals;
}

/**
 * Builds section summaries
 */
export function buildSectionSummaries(responses: InterviewResponses, signals: RiskSignal[]): SectionSummary[] {
  return EP_SECTIONS.map(section => {
    // Find questions for this section
    const sectionQuestionKeys = Object.keys(responses).filter(
      key => key.startsWith(`ep_${section.id}`) || key.includes(section.id.replace('_', ''))
    );
    
    const answered = sectionQuestionKeys.filter(key => 
      responses[key] !== null && responses[key] !== undefined && responses[key] !== ''
    );
    
    // Find signals related to this section
    const sectionSignals = signals.filter(signal =>
      signal.sourceQuestionId.includes(section.id.replace('_', ''))
    );
    
    return {
      sectionId: section.id,
      sectionName: section.name,
      questionCount: section.requiredQuestions,
      answeredCount: answered.length,
      completionPercentage: Math.round((answered.length / section.requiredQuestions) * 100),
      riskSignals: sectionSignals,
    };
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapPublicExposure(value: string | undefined): PrincipalProfile['publicExposureLevel'] {
  if (!value) return null;
  const mapping: Record<string, PrincipalProfile['publicExposureLevel']> = {
    'minimal': 'minimal',
    'low': 'minimal',
    'moderate': 'moderate',
    'medium': 'moderate',
    'significant': 'significant',
    'high': 'significant',
    'extensive': 'extensive',
    'very_high': 'extensive',
    'celebrity': 'extensive',
  };
  return mapping[value.toLowerCase()] || null;
}

function mapTravelFrequency(value: string | undefined): PrincipalProfile['travelFrequency'] {
  if (!value) return null;
  const mapping: Record<string, PrincipalProfile['travelFrequency']> = {
    'rare': 'rare',
    'rarely': 'rare',
    'occasional': 'occasional',
    'sometimes': 'occasional',
    'frequent': 'frequent',
    'often': 'frequent',
    'constant': 'constant',
    'always': 'constant',
  };
  return mapping[value.toLowerCase()] || null;
}

function extractFamilyComposition(responses: InterviewResponses): string[] {
  const family: string[] = [];
  
  if (responses.ep_spouse === 'yes' || responses.ep_married === 'yes') family.push('spouse');
  if (responses.ep_minor_children === 'yes') family.push('minor_children');
  if (responses.ep_adult_children === 'yes') family.push('adult_children');
  if (responses.ep_elderly_parents === 'yes') family.push('elderly_parents');
  if (responses.ep_extended_family === 'yes') family.push('extended_family');
  
  // Handle array response
  if (Array.isArray(responses.ep_family_members)) {
    return [...new Set([...family, ...responses.ep_family_members])];
  }
  
  return family;
}

function extractHighRiskDestinations(responses: InterviewResponses): string[] {
  const destinations: string[] = [];
  
  if (responses.ep_high_risk_destinations) {
    if (Array.isArray(responses.ep_high_risk_destinations)) {
      return responses.ep_high_risk_destinations;
    }
    if (typeof responses.ep_high_risk_destinations === 'string') {
      return responses.ep_high_risk_destinations.split(',').map(d => d.trim());
    }
  }
  
  return destinations;
}

function extractCurrentMeasures(responses: InterviewResponses): string[] {
  const measures: string[] = [];
  
  if (responses.ep_protection_detail === 'yes') measures.push('protection_detail');
  if (responses.ep_residential_cctv === 'yes') measures.push('residential_cctv');
  if (responses.ep_vehicle_armored === 'yes') measures.push('armored_vehicle');
  if (responses.ep_secure_communications === 'yes') measures.push('secure_communications');
  if (responses.ep_advance_team === 'yes') measures.push('advance_operations');
  if (responses.ep_counter_surveillance === 'yes') measures.push('counter_surveillance');
  if (responses.ep_safe_room === 'yes') measures.push('safe_room');
  if (responses.ep_cyber_security === 'yes') measures.push('cyber_security');
  
  // Handle array response
  if (Array.isArray(responses.ep_current_measures)) {
    return [...new Set([...measures, ...responses.ep_current_measures])];
  }
  
  return measures;
}

// ============================================================================
// MAIN EXPORT FUNCTION — PREPARE FOR AI ENGINE
// ============================================================================

/**
 * Main function: Prepares interview data for the AI Assessment Engine
 * 
 * THIS FUNCTION DOES NOT:
 * - Calculate threat likelihood
 * - Calculate vulnerability scores
 * - Calculate impact scores
 * - Calculate exposure factors
 * - Compute T×V×I×E
 * - Generate risk scenarios
 * - Determine risk levels
 * 
 * ALL OF THAT IS DONE BY THE AI ENGINE.
 * 
 * This function ONLY:
 * - Validates completion
 * - Normalizes data
 * - Extracts profiles
 * - Builds context tags
 * - Identifies qualitative signals
 * - Packages for AI consumption
 */
export function prepareForAIEngine(
  assessmentId: number,
  responses: InterviewResponses,
  attachments: Attachment[] = []
): EPMapperOutput {
  
  // 1. Validate completion
  const validation = validateInterviewCompletion(responses);
  
  // 2. Extract principal profile
  const principalProfile = extractPrincipalProfile(responses);
  
  // 3. Build context tags
  const contextTags = buildContextTags(responses);
  
  // 4. Extract risk signals (qualitative only)
  const riskSignals = extractRiskSignals(responses);
  
  // 5. Build section summaries
  const sectionSummaries = buildSectionSummaries(responses, riskSignals);
  
  // 6. Package for AI engine
  return {
    // Metadata
    assessmentId,
    templateType: 'executive_protection',
    preparedAt: new Date().toISOString(),
    mapperVersion: '2.0',
    
    // Validation
    validation,
    
    // Raw interview data
    interviewData: {
      responses,
      completedAt: new Date().toISOString(),
      version: '1.0',
    },
    
    // Structured profiles
    principalProfile,
    
    // Context for AI
    contextTags,
    
    // Section summaries
    sectionSummaries,
    
    // Qualitative signals
    riskSignals,
    
    // Attachments
    attachments,
  };
}

// ============================================================================
// EXPORTS — DATA PREPARATION ONLY
// ============================================================================

export {
  EP_SECTIONS,
  REQUIRED_QUESTION_IDS,
  SIGNAL_MAPPINGS,
};
