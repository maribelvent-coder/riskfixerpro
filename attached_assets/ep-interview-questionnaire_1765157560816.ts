/**
 * Executive Protection Interview Questionnaire
 * 
 * Complete question definitions with polarity logic, risk weights,
 * and threat/control mappings for the EP interview workflow.
 * 
 * KEY DIFFERENCE FROM FACILITY TEMPLATES:
 * - Person-centric rather than facility-centric
 * - Uses T×V×I×E formula (adds Exposure factor)
 * - Pattern predictability is a major vulnerability factor
 * - Family considerations multiply attack surface
 * - Digital exposure is a critical attack surface
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Executive-Protection-Framework.md
 * @see RiskFixer-Executive-Protection-Questions-With-Polarity.md
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface EPInterviewQuestion {
  id: string;
  section: EPSection;
  questionText: string;
  questionType: 'text' | 'single_select' | 'multi_select' | 'rating' | 'yes_no' | 'number';
  options?: EPQuestionOption[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: EPInterviewQuestion[];
  condition?: {
    questionId: string;
    expectedValue: string | string[];
    operator?: 'equals' | 'notEquals' | 'includes' | 'notIncludes';
  };
  
  // Risk mapping fields
  polarity: 'YES_GOOD' | 'YES_BAD' | 'HIGHER_BETTER' | 'HIGHER_WORSE' | 'CONTEXT' | 'MULTI_SELECT';
  badAnswers?: string[];
  riskWeight: number;
  riskIndicators?: string[];
  ratingBadThreshold?: number;
  
  // T×V×I×E Linkage - EP-specific
  informsThreat?: string[];          // Which threats this affects likelihood
  informsVulnerability?: string[];   // Which threat vulnerabilities this affects
  informsImpact?: string[];          // Which threat impacts this affects
  informsExposure?: string[] | 'ALL_THREATS'; // EP-specific: Exposure factor
  
  suggestsControls?: string[];       // Controls recommended when bad answer
  weight?: number;                   // Overall weight in risk calculation
  helpText?: string;                 // Additional context for interviewer
}

export interface EPQuestionOption {
  value: string;
  label: string;
  riskIndicator?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  exposureModifier?: number;  // EP-specific: how much this affects exposure
}

export interface EPSectionMetadata {
  id: string;
  name: EPSection;
  description: string;
  order: number;
  questionCount: number;
  maxRiskWeight: number;
}

// ============================================================================
// TYPE-SAFE SECTION DEFINITIONS
// ============================================================================

export const EP_SECTIONS = [
  'Executive Profile & Threat Perception',
  'Residence Security',
  'Daily Routines & Pattern Predictability',
  'Workplace Security',
  'Travel & Transportation',
  'Digital Footprint & Privacy',
  'Family Security',
  'Emergency Preparedness',
] as const;

export type EPSection = typeof EP_SECTIONS[number];

// ============================================================================
// EXECUTIVE PROTECTION THREAT DEFINITIONS
// ============================================================================

export const EP_THREATS = [
  'kidnapping_abduction',
  'stalking_surveillance', 
  'doxxing_privacy_breach',
  'home_invasion',
  'extortion_blackmail',
  'ambush_attack',
  'workplace_violence',
  'travel_security_incidents',
  'cyber_targeting_social_engineering',
  'family_member_targeting',
  'reputational_attack',
  'protest_demonstration_targeting',
] as const;

export type EPThreat = typeof EP_THREATS[number];

// ============================================================================
// SECTION 1: EXECUTIVE PROFILE & THREAT PERCEPTION (8 questions)
// ============================================================================

const SECTION_1_EXECUTIVE_PROFILE: EPInterviewQuestion[] = [
  {
    id: 'ep_public_profile_level',
    section: 'Executive Profile & Threat Perception',
    questionText: 'How would you characterize your public profile?',
    questionType: 'single_select',
    options: [
      { value: 'very_high', label: 'Very high - National/international recognition, frequent media coverage', riskIndicator: 'critical', exposureModifier: 2.0 },
      { value: 'high', label: 'High - Regional recognition, occasional media coverage', riskIndicator: 'high', exposureModifier: 1.5 },
      { value: 'medium', label: 'Medium - Industry recognition, limited public exposure', riskIndicator: 'medium', exposureModifier: 1.0 },
      { value: 'low', label: 'Low - Professional network only, minimal public presence', riskIndicator: 'low', exposureModifier: 0.5 },
      { value: 'private', label: 'Private - Actively maintain low profile', riskIndicator: 'none', exposureModifier: 0 },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['very_high', 'high'],
    riskWeight: 3,
    riskIndicators: ['very high', 'national', 'international', 'frequent media'],
    informsExposure: 'ALL_THREATS',
    informsThreat: ['stalking_surveillance', 'doxxing_privacy_breach', 'extortion_blackmail'],
    weight: 10,
    helpText: 'Public profile directly affects exposure to targeted threats. Higher profiles attract more attention from potential threat actors.',
  },
  {
    id: 'ep_net_worth_range',
    section: 'Executive Profile & Threat Perception',
    questionText: 'What is your estimated net worth range?',
    questionType: 'single_select',
    options: [
      { value: 'over_100m', label: 'Over $100 million', riskIndicator: 'critical' },
      { value: '50m_to_100m', label: '$50 million - $100 million', riskIndicator: 'high' },
      { value: '10m_to_50m', label: '$10 million - $50 million', riskIndicator: 'medium' },
      { value: '5m_to_10m', label: '$5 million - $10 million', riskIndicator: 'low' },
      { value: 'under_5m', label: 'Under $5 million', riskIndicator: 'none' },
      { value: 'prefer_not_disclose', label: 'Prefer not to disclose', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['over_100m', '50m_to_100m'],
    riskWeight: 2,
    riskIndicators: ['over $100m', '$50m - $100m'],
    informsThreat: ['kidnapping_abduction', 'extortion_blackmail', 'home_invasion'],
    informsImpact: ['kidnapping_abduction', 'extortion_blackmail', 'home_invasion'],
    weight: 8,
    helpText: 'Net worth affects attractiveness to financially-motivated threat actors. This information is kept strictly confidential.',
  },
  {
    id: 'ep_industry_sector',
    section: 'Executive Profile & Threat Perception',
    questionText: 'What industry sector are you primarily associated with?',
    questionType: 'single_select',
    options: [
      { value: 'entertainment', label: 'Entertainment / Media / Sports', riskIndicator: 'high' },
      { value: 'political', label: 'Political / Government', riskIndicator: 'high' },
      { value: 'legal', label: 'Legal (high-profile litigation, criminal defense)', riskIndicator: 'high' },
      { value: 'finance', label: 'Finance / Investment / Private Equity', riskIndicator: 'medium' },
      { value: 'technology', label: 'Technology / Social Media', riskIndicator: 'medium' },
      { value: 'healthcare', label: 'Healthcare / Pharmaceuticals', riskIndicator: 'medium' },
      { value: 'real_estate', label: 'Real Estate / Development', riskIndicator: 'medium' },
      { value: 'manufacturing', label: 'Manufacturing / Industrial', riskIndicator: 'low' },
      { value: 'retail', label: 'Retail / Consumer Goods', riskIndicator: 'low' },
      { value: 'energy', label: 'Energy / Natural Resources', riskIndicator: 'medium' },
      { value: 'nonprofit', label: 'Non-profit / Foundation', riskIndicator: 'low' },
      { value: 'other', label: 'Other', riskIndicator: 'low' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['entertainment', 'political', 'legal'],
    riskWeight: 1,
    riskIndicators: ['entertainment', 'political', 'government', 'legal', 'high-profile'],
    informsThreat: ['workplace_violence', 'stalking_surveillance', 'extortion_blackmail'],
    weight: 5,
    helpText: 'Certain industries have inherently higher threat profiles due to public visibility, controversy, or wealth association.',
  },
  {
    id: 'ep_threat_perception',
    section: 'Executive Profile & Threat Perception',
    questionText: 'How concerned are you about personal security threats?',
    questionType: 'single_select',
    options: [
      { value: 'very_concerned', label: 'Very concerned - Active security measures in place', riskIndicator: 'none' },
      { value: 'moderately_concerned', label: 'Moderately concerned - Some precautions taken', riskIndicator: 'low' },
      { value: 'somewhat_concerned', label: 'Somewhat concerned - Aware but limited action', riskIndicator: 'medium' },
      { value: 'minimal_concern', label: 'Minimally concerned - Basic awareness only', riskIndicator: 'high' },
      { value: 'not_concerned', label: 'Not concerned - Have not considered security threats', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['not_concerned', 'minimal_concern'],
    riskWeight: 1,
    riskIndicators: ['not concerned', 'minimally concerned'],
    informsVulnerability: EP_THREATS as unknown as string[], // Complacency affects all threats
    weight: 4,
    helpText: 'Low concern may indicate security complacency, which increases vulnerability across all threat categories.',
  },
  {
    id: 'ep_known_threats',
    section: 'Executive Profile & Threat Perception',
    questionText: 'Have you received any specific threats or experienced concerning incidents?',
    questionType: 'single_select',
    options: [
      { value: 'yes_recent', label: 'Yes, within the past year', riskIndicator: 'critical' },
      { value: 'yes_past', label: 'Yes, but more than a year ago', riskIndicator: 'high' },
      { value: 'no_but_concerned', label: 'No direct threats, but have specific concerns', riskIndicator: 'medium' },
      { value: 'no_incidents', label: 'No threats or incidents', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes_recent', 'yes_past', 'no_but_concerned'],
    riskWeight: 3,
    riskIndicators: ['yes, within the past year', 'yes, but more than', 'concerns about specific'],
    informsThreat: EP_THREATS as unknown as string[], // Known threats affect all categories
    weight: 10,
    helpText: 'Prior threats are strong predictors of future targeting. Document any specific incidents for detailed analysis.',
    followUpQuestions: [
      {
        id: 'ep_known_threats_detail',
        section: 'Executive Profile & Threat Perception',
        questionText: 'Please describe the nature of the threat(s) or incident(s):',
        questionType: 'text',
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'ep_known_threats',
          expectedValue: ['yes_recent', 'yes_past', 'no_but_concerned'],
          operator: 'includes',
        },
      },
      {
        id: 'ep_known_threats_reported',
        section: 'Executive Profile & Threat Perception',
        questionText: 'Was this reported to law enforcement?',
        questionType: 'yes_no',
        required: true,
        polarity: 'YES_GOOD',
        badAnswers: ['no'],
        riskWeight: 1,
        condition: {
          questionId: 'ep_known_threats',
          expectedValue: ['yes_recent', 'yes_past'],
          operator: 'includes',
        },
      },
    ],
  },
  {
    id: 'ep_current_security_level',
    section: 'Executive Profile & Threat Perception',
    questionText: 'What is your current level of personal security?',
    questionType: 'single_select',
    options: [
      { value: '24x7_detail', label: '24/7 executive protection detail', riskIndicator: 'none' },
      { value: 'comprehensive', label: 'Comprehensive - Part-time detail, residential security, secure driver', riskIndicator: 'low' },
      { value: 'moderate', label: 'Moderate - Residential security system, some precautions', riskIndicator: 'medium' },
      { value: 'minimal', label: 'Minimal - Basic home security only', riskIndicator: 'high' },
      { value: 'none', label: 'No formal security measures', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['none', 'minimal'],
    riskWeight: 2,
    riskIndicators: ['no formal security', 'basic home security'],
    informsVulnerability: EP_THREATS as unknown as string[],
    weight: 8,
    helpText: 'Current security posture establishes baseline vulnerability across all threat categories.',
  },
  {
    id: 'ep_family_members',
    section: 'Executive Profile & Threat Perception',
    questionText: 'Do you have family members who could be vulnerable to targeting?',
    questionType: 'multi_select',
    options: [
      { value: 'spouse_partner', label: 'Spouse/partner', riskIndicator: 'medium' },
      { value: 'children_school_age', label: 'Children (school age)', riskIndicator: 'critical' },
      { value: 'children_college', label: 'Children (college age)', riskIndicator: 'high' },
      { value: 'children_adult', label: 'Adult children', riskIndicator: 'low' },
      { value: 'elderly_parents', label: 'Elderly parents', riskIndicator: 'medium' },
      { value: 'other_dependents', label: 'Other dependents', riskIndicator: 'medium' },
      { value: 'none', label: 'No family members at risk', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'MULTI_SELECT',
    badAnswers: ['children_school_age'],
    riskWeight: 2,
    riskIndicators: ['children (school age)'],
    informsThreat: ['family_member_targeting', 'kidnapping_abduction'],
    informsImpact: EP_THREATS as unknown as string[],
    weight: 8,
    helpText: 'Family members, especially children, multiply the attack surface and may be targeted for leverage.',
  },
  {
    id: 'ep_controversial_involvement',
    section: 'Executive Profile & Threat Perception',
    questionText: 'Are you involved in any controversial issues or litigation that might increase threat exposure?',
    questionType: 'single_select',
    options: [
      { value: 'yes_high_profile', label: 'Yes, high-profile controversial matters', riskIndicator: 'critical' },
      { value: 'yes_moderate', label: 'Yes, some controversial involvement', riskIndicator: 'high' },
      { value: 'yes_minor', label: 'Minor controversies, limited public awareness', riskIndicator: 'medium' },
      { value: 'no', label: 'No controversial involvement', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes_high_profile', 'yes_moderate'],
    riskWeight: 2,
    riskIndicators: ['yes, high-profile', 'yes, some controversial'],
    informsThreat: ['workplace_violence', 'stalking_surveillance', 'extortion_blackmail', 'protest_demonstration_targeting'],
    informsExposure: 'ALL_THREATS',
    weight: 7,
    helpText: 'Controversial involvement (labor disputes, environmental issues, political positions, litigation) attracts focused opposition.',
  },
];

// ============================================================================
// SECTION 2: RESIDENCE SECURITY (8 questions)
// ============================================================================

const SECTION_2_RESIDENCE_SECURITY: EPInterviewQuestion[] = [
  {
    id: 'ep_residence_type',
    section: 'Residence Security',
    questionText: 'What type of primary residence do you have?',
    questionType: 'single_select',
    options: [
      { value: 'gated_community_manned', label: 'Gated community with manned guardhouse', riskIndicator: 'none' },
      { value: 'gated_community_unmanned', label: 'Gated community (unmanned/electronic access)', riskIndicator: 'low' },
      { value: 'high_security_building', label: 'High-security apartment/condo building', riskIndicator: 'low' },
      { value: 'private_estate', label: 'Private estate (acreage, separate from neighbors)', riskIndicator: 'medium' },
      { value: 'single_family_gated', label: 'Single-family home in gated neighborhood', riskIndicator: 'low' },
      { value: 'single_family_ungated', label: 'Single-family home in standard neighborhood', riskIndicator: 'high' },
      { value: 'condo_standard', label: 'Standard condominium/apartment', riskIndicator: 'medium' },
      { value: 'multiple_residences', label: 'Multiple primary residences', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['single_family_ungated'],
    riskWeight: 1,
    riskIndicators: ['standard neighborhood'],
    informsVulnerability: ['home_invasion', 'stalking_surveillance', 'family_member_targeting'],
    weight: 6,
    helpText: 'Residence type determines baseline physical security posture and accessibility to threat actors.',
    followUpQuestions: [
      {
        id: 'ep_residence_multiple_detail',
        section: 'Residence Security',
        questionText: 'How many residences do you regularly occupy, and where are they located?',
        questionType: 'text',
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'ep_residence_type',
          expectedValue: 'multiple_residences',
        },
      },
    ],
  },
  {
    id: 'ep_residence_visibility',
    section: 'Residence Security',
    questionText: 'How visible is your residence from public roads or neighboring properties?',
    questionType: 'single_select',
    options: [
      { value: 'highly_visible', label: 'Highly visible - No significant privacy barriers', riskIndicator: 'critical' },
      { value: 'somewhat_visible', label: 'Somewhat visible - Partial screening', riskIndicator: 'high' },
      { value: 'moderately_private', label: 'Moderately private - Trees/landscaping provide screening', riskIndicator: 'medium' },
      { value: 'very_private', label: 'Very private - Cannot see residence from road', riskIndicator: 'low' },
      { value: 'completely_secluded', label: 'Completely secluded - Long driveway, no visibility', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['highly_visible', 'somewhat_visible'],
    riskWeight: 2,
    riskIndicators: ['highly visible', 'no significant privacy'],
    informsVulnerability: ['stalking_surveillance', 'home_invasion'],
    informsExposure: ['home_invasion', 'stalking_surveillance'],
    weight: 6,
    helpText: 'Visibility enables surveillance and reconnaissance by threat actors planning targeted attacks.',
  },
  {
    id: 'ep_residence_perimeter_security',
    section: 'Residence Security',
    questionText: 'What perimeter security does your residence have?',
    questionType: 'multi_select',
    options: [
      { value: 'none', label: 'No perimeter security', riskIndicator: 'critical' },
      { value: 'fence_basic', label: 'Basic fence (under 6 feet)', riskIndicator: 'high' },
      { value: 'fence_security', label: 'Security fence (6+ feet, anti-climb)', riskIndicator: 'medium' },
      { value: 'wall', label: 'Perimeter wall', riskIndicator: 'low' },
      { value: 'gate_automated', label: 'Automated vehicle gate', riskIndicator: 'medium' },
      { value: 'gate_manned', label: 'Manned gatehouse', riskIndicator: 'none' },
      { value: 'intrusion_detection', label: 'Perimeter intrusion detection sensors', riskIndicator: 'none' },
      { value: 'lighting', label: 'Perimeter lighting with motion activation', riskIndicator: 'low' },
    ],
    required: true,
    polarity: 'MULTI_SELECT',
    badAnswers: ['none', 'fence_basic'],
    riskWeight: 3,
    riskIndicators: ['no perimeter security', 'basic fence', 'under 6 feet'],
    informsVulnerability: ['home_invasion', 'stalking_surveillance', 'family_member_targeting'],
    suggestsControls: ['perimeter_intrusion_detection', 'controlled_access_gate', 'vehicle_barriers_bollards'],
    weight: 8,
    helpText: 'Perimeter security is the first line of defense against forced entry and unauthorized approach.',
  },
  {
    id: 'ep_residence_alarm_system',
    section: 'Residence Security',
    questionText: 'What type of alarm/security system does your residence have?',
    questionType: 'single_select',
    options: [
      { value: 'none', label: 'No alarm system', riskIndicator: 'critical' },
      { value: 'basic_unmonitored', label: 'Basic alarm (local siren, not monitored)', riskIndicator: 'high' },
      { value: 'monitored_basic', label: 'Professionally monitored (basic package)', riskIndicator: 'medium' },
      { value: 'monitored_comprehensive', label: 'Comprehensive monitored system with verification', riskIndicator: 'low' },
      { value: 'monitored_with_armed_response', label: 'Monitored with armed response capability', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['none', 'basic_unmonitored'],
    riskWeight: 3,
    riskIndicators: ['no alarm system', 'not monitored'],
    informsVulnerability: ['home_invasion', 'family_member_targeting'],
    suggestsControls: ['residential_alarm_system_monitored'],
    weight: 7,
    helpText: 'Professional monitoring with verified response significantly reduces vulnerability to home invasion.',
  },
  {
    id: 'ep_safe_room',
    section: 'Residence Security',
    questionText: 'Do you have a panic room or safe room in your residence?',
    questionType: 'single_select',
    options: [
      { value: 'yes_purpose_built', label: 'Yes, purpose-built panic room with communications', riskIndicator: 'none' },
      { value: 'yes_reinforced', label: 'Yes, reinforced room designated as safe room', riskIndicator: 'low' },
      { value: 'designated_only', label: 'Designated safe room location, not reinforced', riskIndicator: 'medium' },
      { value: 'no', label: 'No panic room or safe room', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no panic room'],
    informsVulnerability: ['home_invasion', 'family_member_targeting'],
    suggestsControls: ['panic_room_safe_room'],
    weight: 6,
    helpText: 'Safe rooms provide last-resort protection during home invasion allowing time for law enforcement response.',
  },
  {
    id: 'ep_residence_cctv',
    section: 'Residence Security',
    questionText: 'What CCTV coverage do you have at your residence?',
    questionType: 'multi_select',
    options: [
      { value: 'none', label: 'No cameras', riskIndicator: 'critical' },
      { value: 'doorbell_camera', label: 'Doorbell camera only', riskIndicator: 'high' },
      { value: 'entry_points', label: 'Cameras at entry points', riskIndicator: 'medium' },
      { value: 'comprehensive_exterior', label: 'Comprehensive exterior coverage', riskIndicator: 'low' },
      { value: 'interior_cameras', label: 'Interior cameras (common areas)', riskIndicator: 'low' },
      { value: 'offsite_monitoring', label: 'Off-site professional monitoring', riskIndicator: 'none' },
      { value: 'recording_30_days', label: 'Recording with 30+ days retention', riskIndicator: 'low' },
      { value: 'analytics', label: 'Video analytics (motion detection, facial recognition)', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'MULTI_SELECT',
    badAnswers: ['none', 'doorbell_camera'],
    riskWeight: 3,
    riskIndicators: ['no cameras', 'doorbell camera only'],
    informsVulnerability: ['home_invasion', 'stalking_surveillance', 'family_member_targeting'],
    suggestsControls: ['comprehensive_residential_cctv'],
    weight: 7,
    helpText: 'CCTV provides surveillance detection, evidence collection, and deterrence against targeting.',
  },
  {
    id: 'ep_household_staff',
    section: 'Residence Security',
    questionText: 'Do you have household staff with access to your residence?',
    questionType: 'single_select',
    options: [
      { value: 'yes_live_in', label: 'Yes, live-in staff', riskIndicator: 'medium' },
      { value: 'yes_regular_daily', label: 'Yes, regular daily staff', riskIndicator: 'medium' },
      { value: 'yes_occasional', label: 'Yes, occasional staff (weekly/monthly)', riskIndicator: 'low' },
      { value: 'no', label: 'No household staff', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['yes_live_in', 'yes_regular_daily'],
    riskWeight: 1,
    riskIndicators: ['live-in staff', 'regular daily staff'],
    informsVulnerability: ['home_invasion'], // Insider threat vector
    weight: 5,
    helpText: 'Household staff with access may be targeted for reconnaissance or inadvertently share information.',
    followUpQuestions: [
      {
        id: 'ep_staff_background_checks',
        section: 'Residence Security',
        questionText: 'Do you conduct background investigations on household staff?',
        questionType: 'single_select',
        options: [
          { value: 'comprehensive', label: 'Yes, comprehensive background investigation', riskIndicator: 'none' },
          { value: 'basic', label: 'Yes, basic background check', riskIndicator: 'medium' },
          { value: 'references_only', label: 'References only', riskIndicator: 'high' },
          { value: 'no', label: 'No background checks', riskIndicator: 'critical' },
        ],
        required: true,
        polarity: 'HIGHER_BETTER',
        badAnswers: ['references_only', 'no'],
        riskWeight: 2,
        condition: {
          questionId: 'ep_household_staff',
          expectedValue: ['yes_live_in', 'yes_regular_daily', 'yes_occasional'],
          operator: 'includes',
        },
      },
    ],
  },
  {
    id: 'ep_police_response_time',
    section: 'Residence Security',
    questionText: 'What is the estimated police response time to your residence?',
    questionType: 'single_select',
    options: [
      { value: 'under_5_min', label: 'Under 5 minutes', riskIndicator: 'none' },
      { value: '5_to_10_min', label: '5-10 minutes', riskIndicator: 'low' },
      { value: '10_to_15_min', label: '10-15 minutes', riskIndicator: 'medium' },
      { value: 'over_15_min', label: 'Over 15 minutes', riskIndicator: 'high' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['over_15_min', 'unknown'],
    riskWeight: 2,
    riskIndicators: ['over 15 minutes', 'unknown'],
    informsVulnerability: ['home_invasion', 'family_member_targeting'],
    informsImpact: ['home_invasion'],
    weight: 6,
    helpText: 'Extended response times increase severity of security incidents and necessitate enhanced physical controls.',
  },
];

// ============================================================================
// SECTION 3: DAILY ROUTINES & PATTERN PREDICTABILITY (7 questions)
// ============================================================================

const SECTION_3_DAILY_ROUTINES: EPInterviewQuestion[] = [
  {
    id: 'ep_daily_routine_predictability',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'How predictable is your daily schedule and routine?',
    questionType: 'single_select',
    options: [
      { value: 'highly_predictable', label: 'Highly predictable - Same schedule daily/weekly', riskIndicator: 'critical', exposureModifier: 1.5 },
      { value: 'somewhat_predictable', label: 'Somewhat predictable - Regular patterns with some variation', riskIndicator: 'high', exposureModifier: 1.0 },
      { value: 'variable', label: 'Variable - Schedule changes frequently', riskIndicator: 'medium', exposureModifier: 0.5 },
      { value: 'unpredictable', label: 'Unpredictable - Highly varied schedule', riskIndicator: 'low', exposureModifier: 0 },
      { value: 'randomized', label: 'Intentionally randomized for security', riskIndicator: 'none', exposureModifier: -0.5 },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['highly_predictable', 'somewhat_predictable'],
    riskWeight: 3,
    riskIndicators: ['highly predictable', 'same schedule daily'],
    informsExposure: 'ALL_THREATS',
    informsVulnerability: ['kidnapping_abduction', 'stalking_surveillance', 'ambush_attack'],
    weight: 10,
    helpText: 'Pattern predictability is the most critical vulnerability factor for targeted attacks. Predictable routines enable surveillance and attack planning.',
  },
  {
    id: 'ep_commute_pattern',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'How do you typically commute to work/office?',
    questionType: 'single_select',
    options: [
      { value: 'same_route_same_time', label: 'Same route, same time daily', riskIndicator: 'critical', exposureModifier: 1.5 },
      { value: 'same_route_varied_time', label: 'Same route, varied times', riskIndicator: 'high', exposureModifier: 1.0 },
      { value: 'varied_routes', label: 'Varied routes and times', riskIndicator: 'medium', exposureModifier: 0.5 },
      { value: 'driver_service', label: 'Professional driver with route variation', riskIndicator: 'low', exposureModifier: 0 },
      { value: 'no_regular_commute', label: 'No regular commute (work from home/travel)', riskIndicator: 'none', exposureModifier: -0.5 },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['same_route_same_time', 'same_route_varied_time'],
    riskWeight: 3,
    riskIndicators: ['same route, same time', 'same route, varied'],
    informsExposure: ['kidnapping_abduction', 'ambush_attack', 'stalking_surveillance'],
    informsVulnerability: ['kidnapping_abduction', 'ambush_attack'],
    suggestsControls: ['route_analysis_protocol', 'secure_executive_driver_service'],
    weight: 9,
    helpText: 'Commute routes are primary ambush points. Route predictability enables threat actors to identify choke points and plan attacks.',
    followUpQuestions: [
      {
        id: 'ep_commute_vulnerabilities',
        section: 'Daily Routines & Pattern Predictability',
        questionText: 'Are there any particularly vulnerable points on your commute route (isolated areas, traffic choke points)?',
        questionType: 'text',
        required: false,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'ep_commute_pattern',
          expectedValue: ['same_route_same_time', 'same_route_varied_time', 'varied_routes'],
          operator: 'includes',
        },
      },
    ],
  },
  {
    id: 'ep_parking_location',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'Where do you typically park at work/office?',
    questionType: 'single_select',
    options: [
      { value: 'street_parking_public', label: 'Public street parking', riskIndicator: 'critical' },
      { value: 'open_parking_lot', label: 'Open parking lot', riskIndicator: 'high' },
      { value: 'parking_garage_standard', label: 'Standard parking garage', riskIndicator: 'medium' },
      { value: 'reserved_spot_monitored', label: 'Reserved spot with CCTV monitoring', riskIndicator: 'low' },
      { value: 'secure_executive_parking', label: 'Secure executive parking with controlled access', riskIndicator: 'none' },
      { value: 'driver_drops', label: 'Professional driver drops and picks up', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['street_parking_public', 'open_parking_lot'],
    riskWeight: 2,
    riskIndicators: ['public street parking', 'open parking lot'],
    informsVulnerability: ['ambush_attack', 'kidnapping_abduction'],
    weight: 6,
    helpText: 'Parking areas are secondary ambush points with known arrival times and limited escape options.',
  },
  {
    id: 'ep_frequent_locations',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'Do you frequent the same restaurants, gym, or other locations regularly?',
    questionType: 'single_select',
    options: [
      { value: 'yes_very_regular', label: 'Yes, same places at predictable times', riskIndicator: 'high', exposureModifier: 0.5 },
      { value: 'yes_but_varied', label: 'Yes, but times and days vary', riskIndicator: 'medium', exposureModifier: 0.3 },
      { value: 'rotate_locations', label: 'I rotate between multiple locations', riskIndicator: 'low', exposureModifier: 0 },
      { value: 'rarely_same_place', label: 'I rarely go to the same place twice', riskIndicator: 'none', exposureModifier: -0.2 },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['yes_very_regular'],
    riskWeight: 2,
    riskIndicators: ['same places at predictable times'],
    informsExposure: ['stalking_surveillance', 'kidnapping_abduction', 'ambush_attack'],
    informsVulnerability: ['stalking_surveillance'],
    weight: 6,
    helpText: 'Regular frequented locations create additional predictable patterns that can be exploited.',
  },
  {
    id: 'ep_social_media_usage',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'How do you use social media?',
    questionType: 'single_select',
    options: [
      { value: 'very_active_public', label: 'Very active with public posts (location tags, real-time updates)', riskIndicator: 'critical', exposureModifier: 1.0 },
      { value: 'active_public', label: 'Active with public profile', riskIndicator: 'high', exposureModifier: 0.7 },
      { value: 'moderate_friends_only', label: 'Moderate use, friends/connections only', riskIndicator: 'medium', exposureModifier: 0.3 },
      { value: 'minimal_private', label: 'Minimal use, private settings', riskIndicator: 'low', exposureModifier: 0.1 },
      { value: 'no_social_media', label: 'No social media presence', riskIndicator: 'none', exposureModifier: 0 },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['very_active_public', 'active_public'],
    riskWeight: 3,
    riskIndicators: ['very active', 'public posts', 'location tags', 'real-time updates'],
    informsExposure: 'ALL_THREATS',
    informsVulnerability: ['stalking_surveillance', 'doxxing_privacy_breach'],
    suggestsControls: ['social_media_privacy_lockdown'],
    weight: 8,
    helpText: 'Social media provides threat actors with real-time location intelligence and pattern information.',
    followUpQuestions: [
      {
        id: 'ep_social_media_opsec',
        section: 'Daily Routines & Pattern Predictability',
        questionText: 'Do you post location information, travel plans, or family photos publicly?',
        questionType: 'yes_no',
        required: true,
        polarity: 'YES_BAD',
        badAnswers: ['yes'],
        riskWeight: 2,
        condition: {
          questionId: 'ep_social_media_usage',
          expectedValue: ['very_active_public', 'active_public'],
          operator: 'includes',
        },
      },
    ],
  },
  {
    id: 'ep_children_schedule',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'If you have children, how predictable are their schedules (school drop-off/pick-up, activities)?',
    questionType: 'single_select',
    options: [
      { value: 'not_applicable', label: 'Not applicable - No children', riskIndicator: 'none' },
      { value: 'highly_predictable', label: 'Highly predictable - Same schedule weekly', riskIndicator: 'critical', exposureModifier: 1.0 },
      { value: 'somewhat_predictable', label: 'Somewhat predictable with some variation', riskIndicator: 'high', exposureModifier: 0.7 },
      { value: 'varied', label: 'Varied schedule/transportation', riskIndicator: 'medium', exposureModifier: 0.3 },
      { value: 'secure_transport', label: 'Professional secure transportation service', riskIndicator: 'low', exposureModifier: 0 },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['highly_predictable', 'somewhat_predictable'],
    riskWeight: 3,
    riskIndicators: ['highly predictable', 'same schedule weekly'],
    informsExposure: ['family_member_targeting', 'kidnapping_abduction'],
    informsVulnerability: ['family_member_targeting'],
    suggestsControls: ['school_security_coordination', 'secure_school_transportation'],
    weight: 8,
    helpText: 'Children\'s predictable schedules create soft target opportunities for threat actors.',
    condition: {
      questionId: 'ep_family_members',
      expectedValue: ['children_school_age', 'children_college'],
      operator: 'includes',
    },
  },
  {
    id: 'ep_public_events_attendance',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'How often do you attend public events or high-profile gatherings?',
    questionType: 'single_select',
    options: [
      { value: 'very_frequent', label: 'Very frequently (weekly)', riskIndicator: 'high' },
      { value: 'frequent', label: 'Frequently (monthly)', riskIndicator: 'medium' },
      { value: 'occasional', label: 'Occasionally (few times per year)', riskIndicator: 'low' },
      { value: 'rarely', label: 'Rarely attend public events', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['very_frequent', 'frequent'],
    riskWeight: 1,
    riskIndicators: ['very frequently', 'weekly'],
    informsExposure: ['protest_demonstration_targeting', 'stalking_surveillance'],
    informsVulnerability: ['protest_demonstration_targeting'],
    weight: 4,
    helpText: 'Public events create exposure opportunities where security control is limited.',
  },
];

// ============================================================================
// SECTION 4: WORKPLACE SECURITY (6 questions)
// ============================================================================

const SECTION_4_WORKPLACE_SECURITY: EPInterviewQuestion[] = [
  {
    id: 'ep_workplace_type',
    section: 'Workplace Security',
    questionText: 'What type of workplace do you primarily work in?',
    questionType: 'single_select',
    options: [
      { value: 'secure_corporate_campus', label: 'Secure corporate campus with access control', riskIndicator: 'none' },
      { value: 'private_executive_suite', label: 'Private executive suite/floor with restricted access', riskIndicator: 'low' },
      { value: 'standard_office_building', label: 'Standard commercial office building', riskIndicator: 'medium' },
      { value: 'open_office', label: 'Open office environment', riskIndicator: 'high' },
      { value: 'co_working_space', label: 'Co-working space', riskIndicator: 'high' },
      { value: 'retail_public_facing', label: 'Retail/public-facing location', riskIndicator: 'critical' },
      { value: 'home_office', label: 'Home office (primary)', riskIndicator: 'medium' },
      { value: 'multiple_locations', label: 'Multiple locations', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['open_office', 'retail_public_facing', 'co_working_space'],
    riskWeight: 1,
    riskIndicators: ['open office', 'co-working', 'public-facing'],
    informsVulnerability: ['workplace_violence', 'stalking_surveillance'],
    weight: 5,
    helpText: 'Workplace type determines baseline access control and visibility to unauthorized persons.',
  },
  {
    id: 'ep_workplace_access_control',
    section: 'Workplace Security',
    questionText: 'What level of access control exists at your workplace?',
    questionType: 'single_select',
    options: [
      { value: 'open_public', label: 'Open to public - No access control', riskIndicator: 'critical' },
      { value: 'receptionist_only', label: 'Receptionist check-in only', riskIndicator: 'high' },
      { value: 'badge_access_lobby', label: 'Badge access at lobby', riskIndicator: 'medium' },
      { value: 'badge_access_floor', label: 'Badge access at floor level', riskIndicator: 'low' },
      { value: 'multi_layer', label: 'Multi-layer access control (lobby + floor + suite)', riskIndicator: 'none' },
      { value: 'security_screening', label: 'Security screening (metal detection, bag check)', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['open_public', 'receptionist_only'],
    riskWeight: 3,
    riskIndicators: ['open to public', 'no access control', 'receptionist check-in only'],
    informsVulnerability: ['workplace_violence', 'stalking_surveillance'],
    weight: 7,
    helpText: 'Access control is primary defense against unauthorized entry and workplace violence incidents.',
  },
  {
    id: 'ep_office_visibility',
    section: 'Workplace Security',
    questionText: 'How visible is your office location to the public?',
    questionType: 'single_select',
    options: [
      { value: 'highly_visible', label: 'Highly visible from public areas/street', riskIndicator: 'high' },
      { value: 'somewhat_visible', label: 'Somewhat visible - Identifiable signage', riskIndicator: 'medium' },
      { value: 'discreet', label: 'Discreet - No external signage identifying occupant', riskIndicator: 'low' },
      { value: 'anonymous', label: 'Anonymous location - No public association', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['highly_visible'],
    riskWeight: 1,
    riskIndicators: ['highly visible', 'from public areas'],
    informsVulnerability: ['stalking_surveillance', 'workplace_violence'],
    weight: 4,
    helpText: 'Office visibility affects reconnaissance opportunity and protest/demonstration targeting.',
  },
  {
    id: 'ep_workplace_threat_history',
    section: 'Workplace Security',
    questionText: 'Has your workplace experienced any security incidents or threats?',
    questionType: 'single_select',
    options: [
      { value: 'yes_recent', label: 'Yes, within the past year', riskIndicator: 'critical' },
      { value: 'yes_past', label: 'Yes, but more than a year ago', riskIndicator: 'high' },
      { value: 'no_but_concerned', label: 'No incidents, but concerns exist', riskIndicator: 'medium' },
      { value: 'no_incidents', label: 'No incidents or concerns', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes_recent', 'yes_past'],
    riskWeight: 2,
    riskIndicators: ['yes, within the past year', 'yes, but more than'],
    informsThreat: ['workplace_violence'],
    informsVulnerability: ['workplace_violence'],
    weight: 7,
    helpText: 'Prior workplace incidents are predictors of future targeting and indicate existing vulnerabilities.',
  },
  {
    id: 'ep_workplace_security_staff',
    section: 'Workplace Security',
    questionText: 'Does your workplace have dedicated security personnel?',
    questionType: 'single_select',
    options: [
      { value: 'none', label: 'No security personnel', riskIndicator: 'high' },
      { value: 'contracted_limited', label: 'Contracted security, limited hours', riskIndicator: 'medium' },
      { value: 'contracted_24x7', label: 'Contracted security, 24/7', riskIndicator: 'low' },
      { value: 'in_house_professional', label: 'In-house professional security team', riskIndicator: 'low' },
      { value: 'executive_protection_available', label: 'Executive protection specialists available', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['none', 'contracted_limited'],
    riskWeight: 2,
    riskIndicators: ['no security personnel', 'limited hours'],
    informsVulnerability: ['workplace_violence', 'stalking_surveillance'],
    weight: 6,
    helpText: 'Security personnel provide deterrence, response capability, and visitor management.',
  },
  {
    id: 'ep_workplace_emergency_procedures',
    section: 'Workplace Security',
    questionText: 'Are you familiar with workplace emergency and evacuation procedures?',
    questionType: 'single_select',
    options: [
      { value: 'no_procedures', label: 'No formal procedures exist', riskIndicator: 'high' },
      { value: 'exists_unfamiliar', label: 'Procedures exist but I am not familiar', riskIndicator: 'medium' },
      { value: 'familiar_not_practiced', label: 'Familiar but never practiced', riskIndicator: 'medium' },
      { value: 'familiar_and_practiced', label: 'Familiar and regularly practiced', riskIndicator: 'low' },
      { value: 'personal_evacuation_plan', label: 'Have personal evacuation/emergency plan', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_procedures', 'exists_unfamiliar'],
    riskWeight: 2,
    riskIndicators: ['no formal procedures', 'not familiar'],
    informsVulnerability: ['workplace_violence'],
    weight: 5,
    helpText: 'Emergency preparedness knowledge directly impacts survival outcome during active incidents.',
  },
];

// ============================================================================
// SECTION 5: TRAVEL & TRANSPORTATION SECURITY (6 questions)
// ============================================================================

const SECTION_5_TRAVEL_TRANSPORTATION: EPInterviewQuestion[] = [
  {
    id: 'ep_travel_frequency',
    section: 'Travel & Transportation',
    questionText: 'How frequently do you travel for business or personal reasons?',
    questionType: 'single_select',
    options: [
      { value: 'very_frequent', label: 'Very frequently (multiple times per month)', riskIndicator: 'high' },
      { value: 'frequent', label: 'Frequently (monthly)', riskIndicator: 'medium' },
      { value: 'occasional', label: 'Occasionally (few times per year)', riskIndicator: 'low' },
      { value: 'rarely', label: 'Rarely travel', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['very_frequent'],
    riskWeight: 1,
    riskIndicators: ['very frequently', 'multiple times per month'],
    informsExposure: ['kidnapping_abduction', 'travel_security_incidents'],
    informsVulnerability: ['kidnapping_abduction', 'ambush_attack'],
    weight: 5,
    helpText: 'Frequent travel increases exposure to unfamiliar environments with less security control.',
  },
  {
    id: 'ep_international_travel',
    section: 'Travel & Transportation',
    questionText: 'Do you travel internationally to high-risk countries?',
    questionType: 'single_select',
    options: [
      { value: 'yes_frequently', label: 'Yes, frequently to high-risk areas', riskIndicator: 'critical' },
      { value: 'yes_occasionally', label: 'Yes, occasionally to high-risk areas', riskIndicator: 'high' },
      { value: 'yes_low_risk', label: 'Yes, but only to low-risk countries', riskIndicator: 'medium' },
      { value: 'domestic_only', label: 'Domestic travel only', riskIndicator: 'low' },
      { value: 'minimal_travel', label: 'Minimal travel', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes_frequently', 'yes_occasionally'],
    riskWeight: 3,
    riskIndicators: ['yes, frequently to high-risk', 'yes, occasionally to high-risk'],
    informsThreat: ['kidnapping_abduction', 'extortion_blackmail', 'travel_security_incidents'],
    informsVulnerability: ['kidnapping_abduction'],
    suggestsControls: ['international_travel_security_program', 'advance_team_operations'],
    weight: 8,
    helpText: 'High-risk destination travel dramatically elevates kidnapping and security incident exposure.',
    followUpQuestions: [
      {
        id: 'ep_international_security_measures',
        section: 'Travel & Transportation',
        questionText: 'Do you coordinate security advance teams or use security services in these locations?',
        questionType: 'single_select',
        options: [
          { value: 'comprehensive', label: 'Yes, comprehensive security support in-country', riskIndicator: 'none' },
          { value: 'some_support', label: 'Yes, some security support', riskIndicator: 'medium' },
          { value: 'embassy_only', label: 'Embassy registration only', riskIndicator: 'high' },
          { value: 'none', label: 'No special security measures', riskIndicator: 'critical' },
        ],
        required: true,
        polarity: 'HIGHER_BETTER',
        badAnswers: ['embassy_only', 'none'],
        riskWeight: 2,
        condition: {
          questionId: 'ep_international_travel',
          expectedValue: ['yes_frequently', 'yes_occasionally'],
          operator: 'includes',
        },
      },
    ],
  },
  {
    id: 'ep_vehicle_type',
    section: 'Travel & Transportation',
    questionText: 'What type of vehicle do you typically use?',
    questionType: 'single_select',
    options: [
      { value: 'driver_service_armored', label: 'Professional driver with armored vehicle', riskIndicator: 'none' },
      { value: 'driver_service_standard', label: 'Professional driver service (standard vehicle)', riskIndicator: 'low' },
      { value: 'personal_low_profile', label: 'Personal vehicle (deliberately low-profile)', riskIndicator: 'low' },
      { value: 'personal_standard', label: 'Personal vehicle (standard)', riskIndicator: 'medium' },
      { value: 'company_vehicle', label: 'Company vehicle', riskIndicator: 'medium' },
      { value: 'personal_luxury_conspicuous', label: 'Personal luxury vehicle (conspicuous)', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['personal_luxury_conspicuous'],
    riskWeight: 1,
    riskIndicators: ['luxury vehicle', 'conspicuous'],
    informsVulnerability: ['ambush_attack', 'kidnapping_abduction'],
    informsExposure: ['kidnapping_abduction', 'stalking_surveillance'],
    weight: 7,
    helpText: 'Conspicuous vehicles attract attention and identify targets. Vehicle type also affects protection level during attacks.',
  },
  {
    id: 'ep_vehicle_security_features',
    section: 'Travel & Transportation',
    questionText: 'What security features does your primary vehicle have?',
    questionType: 'multi_select',
    options: [
      { value: 'none', label: 'No special security features', riskIndicator: 'high' },
      { value: 'alarm', label: 'Standard alarm system', riskIndicator: 'medium' },
      { value: 'gps_tracking', label: 'GPS tracking', riskIndicator: 'low' },
      { value: 'dash_cam', label: 'Dashboard camera', riskIndicator: 'low' },
      { value: 'panic_button', label: 'Panic button/emergency alert', riskIndicator: 'low' },
      { value: 'run_flat_tires', label: 'Run-flat tires', riskIndicator: 'none' },
      { value: 'armoring_partial', label: 'Partial armoring (doors/windows)', riskIndicator: 'none' },
      { value: 'armoring_full', label: 'Full armoring (B4-B7 rated)', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'MULTI_SELECT',
    badAnswers: ['none'],
    riskWeight: 2,
    riskIndicators: ['no special security features'],
    informsVulnerability: ['ambush_attack', 'kidnapping_abduction'],
    suggestsControls: ['gps_vehicle_tracking', 'armored_vehicle_b4', 'armored_vehicle_b6'],
    weight: 7,
    helpText: 'Vehicle security features affect survivability during ambush attacks and ability to flee.',
  },
  {
    id: 'ep_travel_arrangements_publicity',
    section: 'Travel & Transportation',
    questionText: 'How are your travel arrangements typically made and communicated?',
    questionType: 'single_select',
    options: [
      { value: 'public_calendar', label: 'Published on public calendar/social media', riskIndicator: 'critical', exposureModifier: 1.0 },
      { value: 'widely_shared', label: 'Shared widely within organization', riskIndicator: 'high', exposureModifier: 0.7 },
      { value: 'limited_distribution', label: 'Limited distribution (need-to-know)', riskIndicator: 'medium', exposureModifier: 0.3 },
      { value: 'executive_assistant_only', label: 'Executive assistant only', riskIndicator: 'low', exposureModifier: 0.1 },
      { value: 'highly_confidential', label: 'Highly confidential, minimal advance notice', riskIndicator: 'none', exposureModifier: 0 },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['public_calendar', 'widely_shared'],
    riskWeight: 3,
    riskIndicators: ['published on public calendar', 'social media', 'widely shared'],
    informsExposure: 'ALL_THREATS',
    informsVulnerability: ['kidnapping_abduction', 'ambush_attack', 'protest_demonstration_targeting'],
    weight: 8,
    helpText: 'Travel schedule publicity enables threat actors to plan attacks at known destinations and times.',
  },
  {
    id: 'ep_airport_procedures',
    section: 'Travel & Transportation',
    questionText: 'When traveling by air, what are your typical airport procedures?',
    questionType: 'single_select',
    options: [
      { value: 'commercial_standard', label: 'Commercial airline, standard procedures', riskIndicator: 'medium' },
      { value: 'commercial_priority', label: 'Commercial airline with priority services', riskIndicator: 'low' },
      { value: 'private_terminal', label: 'Private terminal/FBO services', riskIndicator: 'low' },
      { value: 'private_aircraft', label: 'Private aircraft', riskIndicator: 'none' },
      { value: 'minimal_air_travel', label: 'Minimal air travel', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['commercial_standard'],
    riskWeight: 1,
    riskIndicators: ['commercial airline, standard'],
    informsVulnerability: ['kidnapping_abduction', 'stalking_surveillance'],
    suggestsControls: ['private_terminal_fbo_services'],
    weight: 4,
    helpText: 'Commercial airports create exposure in crowded, predictable environments.',
  },
];

// ============================================================================
// SECTION 6: DIGITAL FOOTPRINT & PRIVACY (7 questions)
// ============================================================================

const SECTION_6_DIGITAL_FOOTPRINT: EPInterviewQuestion[] = [
  {
    id: 'ep_public_records_exposure',
    section: 'Digital Footprint & Privacy',
    questionText: 'To your knowledge, what personal information is publicly available?',
    questionType: 'multi_select',
    options: [
      { value: 'home_address', label: 'Home address (property records, voter registration)', riskIndicator: 'critical' },
      { value: 'family_information', label: 'Family member information', riskIndicator: 'high' },
      { value: 'net_worth_estimates', label: 'Net worth estimates', riskIndicator: 'high' },
      { value: 'vehicle_registration', label: 'Vehicle registration information', riskIndicator: 'medium' },
      { value: 'business_filings', label: 'Business filings/corporate records', riskIndicator: 'low' },
      { value: 'professional_info', label: 'Professional/educational background', riskIndicator: 'low' },
      { value: 'minimal', label: 'Minimal publicly available information', riskIndicator: 'none' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'MULTI_SELECT',
    badAnswers: ['home_address', 'family_information', 'net_worth_estimates'],
    riskWeight: 2,
    riskIndicators: ['home address', 'property records', 'family member information', 'net worth'],
    informsExposure: 'ALL_THREATS',
    informsVulnerability: ['doxxing_privacy_breach', 'stalking_surveillance', 'home_invasion'],
    suggestsControls: ['digital_privacy_service', 'property_records_privacy'],
    weight: 7,
    helpText: 'Public records are primary OSINT sources. Address exposure is critical vulnerability.',
  },
  {
    id: 'ep_media_coverage',
    section: 'Digital Footprint & Privacy',
    questionText: 'What level of media coverage do you receive?',
    questionType: 'single_select',
    options: [
      { value: 'extensive', label: 'Extensive - Regular national/international coverage', riskIndicator: 'critical', exposureModifier: 0.5 },
      { value: 'frequent', label: 'Frequent - Regular industry/local coverage', riskIndicator: 'high', exposureModifier: 0.3 },
      { value: 'occasional', label: 'Occasional - Periodic coverage of specific events', riskIndicator: 'medium', exposureModifier: 0.1 },
      { value: 'minimal', label: 'Minimal media coverage', riskIndicator: 'low', exposureModifier: 0 },
      { value: 'none', label: 'No media coverage', riskIndicator: 'none', exposureModifier: 0 },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['extensive', 'frequent'],
    riskWeight: 2,
    riskIndicators: ['extensive', 'regular national', 'international coverage', 'frequent'],
    informsExposure: 'ALL_THREATS',
    informsThreat: ['stalking_surveillance', 'extortion_blackmail'],
    weight: 6,
    helpText: 'Media coverage creates public awareness and can attract fixated persons.',
  },
  {
    id: 'ep_online_presence_management',
    section: 'Digital Footprint & Privacy',
    questionText: 'Do you actively manage your online presence and digital footprint?',
    questionType: 'single_select',
    options: [
      { value: 'professional_services', label: 'Professional privacy/reputation services', riskIndicator: 'none' },
      { value: 'active_management', label: 'Active personal management (privacy settings, data removal)', riskIndicator: 'low' },
      { value: 'basic_privacy_settings', label: 'Basic privacy settings only', riskIndicator: 'medium' },
      { value: 'no_management', label: 'No active management', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_management', 'basic_privacy_settings'],
    riskWeight: 2,
    riskIndicators: ['no active management', 'basic privacy settings'],
    informsVulnerability: ['doxxing_privacy_breach', 'stalking_surveillance', 'cyber_targeting_social_engineering'],
    suggestsControls: ['digital_privacy_service', 'digital_footprint_assessment'],
    weight: 6,
    helpText: 'Unmanaged digital footprints accumulate exposure over time and enable reconnaissance.',
  },
  {
    id: 'ep_family_digital_exposure',
    section: 'Digital Footprint & Privacy',
    questionText: 'What is your family members\' digital footprint exposure?',
    questionType: 'single_select',
    options: [
      { value: 'high_exposure', label: 'High - Active public social media, tagged photos', riskIndicator: 'critical' },
      { value: 'moderate_exposure', label: 'Moderate - Some social media presence', riskIndicator: 'high' },
      { value: 'low_exposure', label: 'Low - Private settings, limited posting', riskIndicator: 'medium' },
      { value: 'minimal_exposure', label: 'Minimal - Very limited or no digital presence', riskIndicator: 'low' },
      { value: 'managed', label: 'Professionally managed', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['high_exposure', 'moderate_exposure'],
    riskWeight: 2,
    riskIndicators: ['high - active public', 'moderate - some social media'],
    informsExposure: ['family_member_targeting', 'kidnapping_abduction', 'stalking_surveillance'],
    informsVulnerability: ['family_member_targeting', 'doxxing_privacy_breach'],
    weight: 6,
    helpText: 'Family digital exposure can undermine principal\'s OPSEC through association.',
  },
  {
    id: 'ep_google_alerts',
    section: 'Digital Footprint & Privacy',
    questionText: 'Do you have monitoring in place for online mentions of your name/family?',
    questionType: 'single_select',
    options: [
      { value: 'professional_monitoring', label: 'Professional OSINT monitoring service', riskIndicator: 'none' },
      { value: 'google_alerts_comprehensive', label: 'Google Alerts for name, family, company', riskIndicator: 'low' },
      { value: 'google_alerts_basic', label: 'Basic Google Alerts', riskIndicator: 'medium' },
      { value: 'no_monitoring', label: 'No monitoring', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_monitoring'],
    riskWeight: 1,
    riskIndicators: ['no monitoring'],
    informsVulnerability: ['doxxing_privacy_breach', 'stalking_surveillance', 'reputational_attack'],
    suggestsControls: ['osint_monitoring_service'],
    weight: 4,
    helpText: 'Online monitoring enables early detection of targeting, doxxing, or reputation attacks.',
  },
  {
    id: 'ep_email_phone_security',
    section: 'Digital Footprint & Privacy',
    questionText: 'What security measures do you use for email and phone communications?',
    questionType: 'multi_select',
    options: [
      { value: 'standard_only', label: 'Standard security only (no special measures)', riskIndicator: 'medium' },
      { value: 'mfa', label: 'Multi-factor authentication on all accounts', riskIndicator: 'low' },
      { value: 'password_manager', label: 'Password manager with unique passwords', riskIndicator: 'low' },
      { value: 'encrypted_email', label: 'Encrypted email service', riskIndicator: 'none' },
      { value: 'secure_phone', label: 'Secure/private phone number', riskIndicator: 'none' },
      { value: 'encrypted_messaging', label: 'Encrypted messaging apps (Signal, etc.)', riskIndicator: 'low' },
      { value: 'separate_devices', label: 'Separate devices for personal/business', riskIndicator: 'low' },
    ],
    required: true,
    polarity: 'MULTI_SELECT',
    badAnswers: ['standard_only'],
    riskWeight: 1,
    riskIndicators: ['standard security only'],
    informsVulnerability: ['cyber_targeting_social_engineering', 'doxxing_privacy_breach'],
    suggestsControls: ['secure_communications_platform', 'personal_cyber_security_hardening'],
    weight: 4,
    helpText: 'Communications security prevents interception and social engineering attacks.',
  },
  {
    id: 'ep_information_vetting',
    section: 'Digital Footprint & Privacy',
    questionText: 'Do you vet individuals before sharing personal information?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive_vetting', label: 'Comprehensive vetting protocols in place', riskIndicator: 'none' },
      { value: 'careful_vetting', label: 'Careful about sharing, verify identities', riskIndicator: 'low' },
      { value: 'some_caution', label: 'Some caution, but share with professional contacts', riskIndicator: 'medium' },
      { value: 'minimal_vetting', label: 'Minimal vetting, share relatively freely', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['minimal_vetting'],
    riskWeight: 2,
    riskIndicators: ['minimal vetting', 'share relatively freely'],
    informsVulnerability: ['cyber_targeting_social_engineering', 'doxxing_privacy_breach'],
    weight: 5,
    helpText: 'Social engineering attacks often succeed through trusted professional relationships.',
  },
];

// ============================================================================
// SECTION 7: FAMILY SECURITY (6 questions)
// ============================================================================

const SECTION_7_FAMILY_SECURITY: EPInterviewQuestion[] = [
  {
    id: 'ep_family_security_awareness',
    section: 'Family Security',
    questionText: 'Has your family received security awareness training?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive_training', label: 'Comprehensive professional training', riskIndicator: 'none' },
      { value: 'basic_training', label: 'Basic security awareness briefing', riskIndicator: 'low' },
      { value: 'informal_discussions', label: 'Informal family discussions only', riskIndicator: 'medium' },
      { value: 'no_training', label: 'No security training or discussions', riskIndicator: 'high' },
      { value: 'not_applicable', label: 'Not applicable - Live alone', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_training', 'informal_discussions'],
    riskWeight: 2,
    riskIndicators: ['no training', 'basic discussions'],
    informsVulnerability: ['family_member_targeting', 'kidnapping_abduction', 'home_invasion'],
    suggestsControls: ['family_security_training'],
    weight: 6,
    helpText: 'Untrained family members may inadvertently share information or fail to recognize threats.',
  },
  {
    id: 'ep_school_security_coordination',
    section: 'Family Security',
    questionText: 'If you have school-age children, have you coordinated security with their schools?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Comprehensive coordination - Pickup lists, notification protocols, emergency procedures', riskIndicator: 'none' },
      { value: 'basic', label: 'Basic coordination - Authorized pickup list only', riskIndicator: 'medium' },
      { value: 'none', label: 'No coordination with school', riskIndicator: 'high' },
      { value: 'not_applicable', label: 'Not applicable - No school-age children', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['none', 'basic'],
    riskWeight: 2,
    riskIndicators: ['no coordination', 'basic coordination'],
    informsVulnerability: ['family_member_targeting', 'kidnapping_abduction'],
    suggestsControls: ['school_security_coordination'],
    weight: 6,
    helpText: 'School pickup is predictable vulnerability. Schools must know who can collect children.',
    condition: {
      questionId: 'ep_family_members',
      expectedValue: ['children_school_age', 'children_college'],
      operator: 'includes',
    },
  },
  {
    id: 'ep_nanny_staff_vetting',
    section: 'Family Security',
    questionText: 'How do you vet childcare providers or household staff with family access?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Comprehensive investigation (background, references, verification)', riskIndicator: 'none' },
      { value: 'agency_vetted', label: 'Use agency that conducts vetting', riskIndicator: 'low' },
      { value: 'basic_check', label: 'Basic background check', riskIndicator: 'medium' },
      { value: 'references_only', label: 'References only', riskIndicator: 'high' },
      { value: 'none', label: 'No vetting process', riskIndicator: 'critical' },
      { value: 'not_applicable', label: 'Not applicable - No childcare/staff', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['references_only', 'none'],
    riskWeight: 2,
    riskIndicators: ['references only', 'no vetting'],
    informsVulnerability: ['family_member_targeting', 'home_invasion'],
    suggestsControls: ['household_staff_background_investigations'],
    weight: 5,
    helpText: 'Staff with intimate family access can be targeted for information or coerced.',
  },
  {
    id: 'ep_family_travel_protocol',
    section: 'Family Security',
    questionText: 'Do family members follow security protocols when traveling separately?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Yes, comprehensive protocols with check-ins', riskIndicator: 'none' },
      { value: 'basic', label: 'Basic protocols (share itineraries, emergency contacts)', riskIndicator: 'medium' },
      { value: 'minimal', label: 'Minimal - Share location occasionally', riskIndicator: 'high' },
      { value: 'none', label: 'No protocols in place', riskIndicator: 'critical' },
      { value: 'not_applicable', label: 'Not applicable - Always travel together or alone', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['minimal', 'none'],
    riskWeight: 2,
    riskIndicators: ['minimal', 'no protocols'],
    informsVulnerability: ['family_member_targeting', 'kidnapping_abduction'],
    weight: 5,
    helpText: 'Family members traveling alone face elevated risk and must maintain communication.',
  },
  {
    id: 'ep_spouse_partner_profile',
    section: 'Family Security',
    questionText: 'Does your spouse/partner have their own public profile or professional visibility?',
    questionType: 'single_select',
    options: [
      { value: 'high_profile', label: 'Yes, high public profile (executive, public figure)', riskIndicator: 'high' },
      { value: 'professional', label: 'Moderate professional visibility', riskIndicator: 'medium' },
      { value: 'low_profile', label: 'Low profile', riskIndicator: 'low' },
      { value: 'none', label: 'No public profile', riskIndicator: 'none' },
      { value: 'not_applicable', label: 'Not applicable - No spouse/partner', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['high_profile'],
    riskWeight: 1,
    riskIndicators: ['high public profile'],
    informsExposure: ['family_member_targeting'],
    informsThreat: ['family_member_targeting'],
    weight: 4,
    helpText: 'Spouse visibility can compound family exposure and create independent targeting.',
  },
  {
    id: 'ep_elderly_parent_considerations',
    section: 'Family Security',
    questionText: 'If you have elderly parents, are there security considerations for their residence?',
    questionType: 'single_select',
    options: [
      { value: 'security_in_place', label: 'Yes, security measures in place for their residence', riskIndicator: 'none' },
      { value: 'some_measures', label: 'Some measures (alarm, monitoring)', riskIndicator: 'medium' },
      { value: 'no_measures', label: 'No specific security measures', riskIndicator: 'high' },
      { value: 'assisted_living', label: 'In assisted living/secure facility', riskIndicator: 'low' },
      { value: 'not_applicable', label: 'Not applicable', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_measures'],
    riskWeight: 1,
    riskIndicators: ['no specific security measures'],
    informsVulnerability: ['family_member_targeting'],
    weight: 4,
    helpText: 'Elderly relatives may be targeted for leverage and are often more vulnerable.',
    condition: {
      questionId: 'ep_family_members',
      expectedValue: ['elderly_parents'],
      operator: 'includes',
    },
  },
];

// ============================================================================
// SECTION 8: EMERGENCY PREPAREDNESS (6 questions)
// ============================================================================

const SECTION_8_EMERGENCY_PREPAREDNESS: EPInterviewQuestion[] = [
  {
    id: 'ep_emergency_contacts',
    section: 'Emergency Preparedness',
    questionText: 'Do you have emergency contact protocols established?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Comprehensive protocols with priority lists, verification procedures', riskIndicator: 'none' },
      { value: 'documented', label: 'Documented emergency contacts shared with family/security', riskIndicator: 'low' },
      { value: 'basic_contacts', label: 'Basic emergency contacts identified', riskIndicator: 'medium' },
      { value: 'no_protocols', label: 'No formal emergency protocols', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_protocols', 'basic_contacts'],
    riskWeight: 2,
    riskIndicators: ['no formal emergency protocols', 'basic emergency contact'],
    informsVulnerability: EP_THREATS as unknown as string[],
    suggestsControls: ['emergency_communication_protocol'],
    weight: 5,
    helpText: 'Clear emergency protocols reduce response time and confusion during incidents.',
  },
  {
    id: 'ep_family_emergency_training',
    section: 'Emergency Preparedness',
    questionText: 'Has your family received emergency response training?',
    questionType: 'single_select',
    options: [
      { value: 'professional', label: 'Professional emergency response training', riskIndicator: 'none' },
      { value: 'basic', label: 'Basic emergency procedures discussed and practiced', riskIndicator: 'low' },
      { value: 'basic_discussion', label: 'Basic discussions, not practiced', riskIndicator: 'medium' },
      { value: 'no_training', label: 'No training or discussions', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_training', 'basic_discussion'],
    riskWeight: 2,
    riskIndicators: ['no training', 'basic discussions'],
    informsVulnerability: ['family_member_targeting', 'kidnapping_abduction', 'home_invasion'],
    suggestsControls: ['family_security_training'],
    weight: 5,
    helpText: 'Family emergency training ensures coordinated response when seconds matter.',
  },
  {
    id: 'ep_duress_code',
    section: 'Emergency Preparedness',
    questionText: 'Do you have duress codes or signals established with family/security?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Yes, comprehensive system with verification protocols', riskIndicator: 'none' },
      { value: 'basic', label: 'Yes, basic duress code/signal established', riskIndicator: 'low' },
      { value: 'no_duress_codes', label: 'No duress codes established', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no_duress_codes'],
    riskWeight: 2,
    riskIndicators: ['no duress codes established'],
    informsVulnerability: ['kidnapping_abduction', 'home_invasion', 'extortion_blackmail'],
    suggestsControls: ['family_duress_code_system'],
    weight: 5,
    helpText: 'Duress codes enable covert communication when under direct threat control.',
  },
  {
    id: 'ep_evacuation_routes',
    section: 'Emergency Preparedness',
    questionText: 'Have you identified and practiced evacuation routes from your primary locations?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Yes, multiple routes identified, mapped, and practiced', riskIndicator: 'none' },
      { value: 'identified', label: 'Routes identified but not practiced', riskIndicator: 'medium' },
      { value: 'identified_not_practiced', label: 'General awareness only', riskIndicator: 'high' },
      { value: 'no_planning', label: 'No evacuation planning', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_planning', 'identified_not_practiced'],
    riskWeight: 2,
    riskIndicators: ['no evacuation planning', 'never practiced'],
    informsVulnerability: ['home_invasion', 'workplace_violence'],
    suggestsControls: ['evacuation_route_planning'],
    weight: 6,
    helpText: 'Pre-planned evacuation routes enable rapid escape during home invasion or workplace incidents.',
  },
  {
    id: 'ep_go_bag_prepared',
    section: 'Emergency Preparedness',
    questionText: 'Do you maintain a "go bag" or emergency supplies?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Yes, comprehensive go-bags at residence and vehicles', riskIndicator: 'none' },
      { value: 'basic', label: 'Yes, basic emergency supplies', riskIndicator: 'low' },
      { value: 'partial', label: 'Some supplies, not organized', riskIndicator: 'medium' },
      { value: 'no_preparation', label: 'No emergency supplies prepared', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no_preparation'],
    riskWeight: 1,
    riskIndicators: ['no emergency supplies'],
    informsVulnerability: ['home_invasion', 'travel_security_incidents'],
    suggestsControls: ['emergency_go_bag'],
    weight: 4,
    helpText: 'Emergency supplies enable rapid departure and self-sufficiency during crisis.',
  },
  {
    id: 'ep_medical_emergency_plan',
    section: 'Emergency Preparedness',
    questionText: 'Do you have a medical emergency response plan?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Yes, medical evacuation plan with dedicated resources', riskIndicator: 'none' },
      { value: 'documented_plan', label: 'Documented plan with medical contacts and hospital locations', riskIndicator: 'low' },
      { value: 'basic', label: 'Know nearest hospital, basic first aid', riskIndicator: 'medium' },
      { value: 'no_plan', label: 'No specific medical emergency plan', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_BETTER',
    badAnswers: ['no_plan'],
    riskWeight: 1,
    riskIndicators: ['no specific medical emergency plan'],
    informsVulnerability: ['travel_security_incidents'],
    informsImpact: EP_THREATS as unknown as string[],
    suggestsControls: ['medical_evacuation_insurance', 'medical_emergency_response_capability'],
    weight: 4,
    helpText: 'Medical emergency plans reduce impact severity through rapid appropriate response.',
  },
];

// ============================================================================
// COMPLETE QUESTIONNAIRE EXPORT
// ============================================================================

export const EP_INTERVIEW_QUESTIONNAIRE: EPInterviewQuestion[] = [
  ...SECTION_1_EXECUTIVE_PROFILE,
  ...SECTION_2_RESIDENCE_SECURITY,
  ...SECTION_3_DAILY_ROUTINES,
  ...SECTION_4_WORKPLACE_SECURITY,
  ...SECTION_5_TRAVEL_TRANSPORTATION,
  ...SECTION_6_DIGITAL_FOOTPRINT,
  ...SECTION_7_FAMILY_SECURITY,
  ...SECTION_8_EMERGENCY_PREPAREDNESS,
];

// ============================================================================
// SECTION METADATA
// ============================================================================

export const EP_SECTION_METADATA: EPSectionMetadata[] = [
  {
    id: 'profile',
    name: 'Executive Profile & Threat Perception',
    description: 'Establishes baseline threat profile, exposure factors, and current security posture',
    order: 1,
    questionCount: 8,
    maxRiskWeight: 18,
  },
  {
    id: 'residence',
    name: 'Residence Security',
    description: 'Evaluates physical security controls at primary residence',
    order: 2,
    questionCount: 8,
    maxRiskWeight: 18,
  },
  {
    id: 'routines',
    name: 'Daily Routines & Pattern Predictability',
    description: 'Assesses pattern predictability - the most critical EP vulnerability factor',
    order: 3,
    questionCount: 7,
    maxRiskWeight: 16,
  },
  {
    id: 'workplace',
    name: 'Workplace Security',
    description: 'Evaluates workplace security controls and incident history',
    order: 4,
    questionCount: 6,
    maxRiskWeight: 11,
  },
  {
    id: 'travel',
    name: 'Travel & Transportation',
    description: 'Assesses travel frequency, destinations, and transportation security',
    order: 5,
    questionCount: 6,
    maxRiskWeight: 12,
  },
  {
    id: 'digital',
    name: 'Digital Footprint & Privacy',
    description: 'Evaluates digital exposure, OSINT vulnerability, and privacy controls',
    order: 6,
    questionCount: 7,
    maxRiskWeight: 12,
  },
  {
    id: 'family',
    name: 'Family Security',
    description: 'Assesses family member vulnerabilities and protection measures',
    order: 7,
    questionCount: 6,
    maxRiskWeight: 10,
  },
  {
    id: 'emergency',
    name: 'Emergency Preparedness',
    description: 'Evaluates emergency protocols, training, and response capabilities',
    order: 8,
    questionCount: 6,
    maxRiskWeight: 10,
  },
];

// ============================================================================
// POLARITY MAPPING EXPORT (for risk calculation)
// ============================================================================

export const EP_QUESTION_POLARITY_MAP = EP_INTERVIEW_QUESTIONNAIRE.map(q => ({
  id: q.id,
  section: q.section,
  polarity: q.polarity,
  riskWeight: q.riskWeight,
  badAnswers: q.badAnswers || [],
  riskIndicators: q.riskIndicators || [],
  informsThreat: q.informsThreat || [],
  informsVulnerability: q.informsVulnerability || [],
  informsImpact: q.informsImpact || [],
  informsExposure: q.informsExposure || [],
}));

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all questions for a specific section
 */
export function getQuestionsForSection(section: EPSection): EPInterviewQuestion[] {
  return EP_INTERVIEW_QUESTIONNAIRE.filter(q => q.section === section);
}

/**
 * Get question by ID
 */
export function getQuestionById(id: string): EPInterviewQuestion | undefined {
  return EP_INTERVIEW_QUESTIONNAIRE.find(q => q.id === id);
}

/**
 * Get all questions that inform a specific threat
 */
export function getQuestionsForThreat(threatId: string): EPInterviewQuestion[] {
  return EP_INTERVIEW_QUESTIONNAIRE.filter(q => 
    q.informsThreat?.includes(threatId) ||
    q.informsVulnerability?.includes(threatId) ||
    q.informsImpact?.includes(threatId) ||
    q.informsExposure === 'ALL_THREATS' ||
    (Array.isArray(q.informsExposure) && q.informsExposure.includes(threatId))
  );
}

/**
 * Calculate maximum possible risk score
 */
export function getMaximumRiskScore(): number {
  return EP_INTERVIEW_QUESTIONNAIRE.reduce((sum, q) => sum + q.riskWeight, 0);
}

/**
 * Get question IDs that affect exposure factor
 */
export function getExposureQuestionIds(): string[] {
  return EP_INTERVIEW_QUESTIONNAIRE
    .filter(q => q.informsExposure)
    .map(q => q.id);
}

/**
 * Validate interview responses against questionnaire
 */
export function validateResponses(responses: Record<string, any>): {
  valid: boolean;
  missingRequired: string[];
  invalidValues: string[];
} {
  const missingRequired: string[] = [];
  const invalidValues: string[] = [];

  EP_INTERVIEW_QUESTIONNAIRE.forEach(question => {
    // Check if question should be shown based on condition
    if (question.condition) {
      const conditionQuestion = question.condition.questionId;
      const conditionValue = responses[conditionQuestion];
      const expectedValue = question.condition.expectedValue;
      const operator = question.condition.operator || 'equals';

      let conditionMet = false;
      if (operator === 'equals') {
        conditionMet = conditionValue === expectedValue;
      } else if (operator === 'includes' && Array.isArray(expectedValue)) {
        conditionMet = expectedValue.includes(conditionValue) ||
          (Array.isArray(conditionValue) && conditionValue.some(v => expectedValue.includes(v)));
      }

      if (!conditionMet) return; // Skip this question if condition not met
    }

    // Check required fields
    if (question.required && !responses[question.id]) {
      missingRequired.push(question.id);
    }

    // Validate option values for select questions
    if (responses[question.id] && question.options) {
      const validValues = question.options.map(o => o.value);
      const responseValue = responses[question.id];

      if (question.questionType === 'multi_select' && Array.isArray(responseValue)) {
        responseValue.forEach(v => {
          if (!validValues.includes(v)) {
            invalidValues.push(`${question.id}: ${v}`);
          }
        });
      } else if (question.questionType === 'single_select' && !validValues.includes(responseValue)) {
        invalidValues.push(`${question.id}: ${responseValue}`);
      }
    }
  });

  return {
    valid: missingRequired.length === 0 && invalidValues.length === 0,
    missingRequired,
    invalidValues,
  };
}

// ============================================================================
// RISK LEVEL THRESHOLDS (Executive Protection specific)
// ============================================================================

export const EP_RISK_THRESHOLDS = {
  LOW: { min: 0, max: 15, label: 'Low', description: 'Well-protected with minimal exposure' },
  MEDIUM: { min: 16, max: 30, label: 'Medium', description: 'Some gaps requiring attention' },
  HIGH: { min: 31, max: 45, label: 'High', description: 'Significant vulnerabilities, priority remediation needed' },
  VERY_HIGH: { min: 46, max: 60, label: 'Very High', description: 'Critical gaps across multiple domains' },
  CRITICAL: { min: 61, max: Infinity, label: 'Critical', description: 'Immediate comprehensive security program required' },
};

/**
 * Get risk level from raw risk factor count
 */
export function getRiskLevel(riskFactorCount: number): keyof typeof EP_RISK_THRESHOLDS {
  if (riskFactorCount <= EP_RISK_THRESHOLDS.LOW.max) return 'LOW';
  if (riskFactorCount <= EP_RISK_THRESHOLDS.MEDIUM.max) return 'MEDIUM';
  if (riskFactorCount <= EP_RISK_THRESHOLDS.HIGH.max) return 'HIGH';
  if (riskFactorCount <= EP_RISK_THRESHOLDS.VERY_HIGH.max) return 'VERY_HIGH';
  return 'CRITICAL';
}

// ============================================================================
// END OF EXECUTIVE PROTECTION INTERVIEW QUESTIONNAIRE
// ============================================================================
