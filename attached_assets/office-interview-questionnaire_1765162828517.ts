/**
 * Office Building Interview Questionnaire
 * 
 * Complete question definitions with polarity logic, risk weights,
 * and threat/control mappings for the office building interview workflow.
 * 
 * Implements the RiskFixer AI-First Assessment Framework with:
 * - T×V×I formula (Threat × Vulnerability × Impact)
 * - Risk factor counting for vulnerability adjustment
 * - Threat-specific control recommendations
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Office-Building-Questions-With-Polarity.md
 * @see RiskFixer-Office-Building-Framework-UPGRADED.md
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface InterviewQuestion {
  id: string;
  section: OfficeSection;
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist' | 'number';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: InterviewQuestion[];
  condition?: {
    questionId: string;
    expectedValue: string | string[];
  };
  
  // Risk mapping fields
  polarity: 'YES_GOOD' | 'YES_BAD' | 'RATING' | 'CONTEXT' | 'MULTIPLE_CHOICE';
  badAnswers?: string[];
  riskWeight: number;
  riskIndicators?: string[];
  ratingBadThreshold?: number;
  
  // Threat/control linkage
  informsThreat?: string[];
  informsVulnerability?: boolean;
  informsImpact?: boolean;
  suggestsControls?: string[];
  helpText?: string;
}

export interface SectionMetadata {
  id: string;
  name: OfficeSection;
  description: string;
  order: number;
}

// ============================================================================
// TYPE-SAFE SECTION DEFINITIONS
// ============================================================================

export const OFFICE_SECTIONS = [
  'Facility Overview',
  'Perimeter Security',
  'Parking Facilities',
  'Building Entry Points',
  'Interior Access Control',
  'Surveillance Systems',
  'Intrusion Detection',
  'Security Personnel & Procedures',
  'Emergency Preparedness',
  'Incident History Analysis',
  'Cyber-Physical Security',
  'Document & Data Security',
  'Loading Dock & Receiving',
] as const;

export type OfficeSection = typeof OFFICE_SECTIONS[number];

// ============================================================================
// OFFICE BUILDING THREAT DEFINITIONS
// ============================================================================

export const OFFICE_THREATS = [
  'unauthorized_access',
  'workplace_violence',
  'theft_burglary',
  'executive_targeting',
  'data_breach_physical',
  'terrorism_bomb_threat',
  'civil_disturbance',
  'insider_threat',
  'after_hours_intrusion',
  'vehicle_ramming',
  'active_shooter',
  'corporate_espionage',
] as const;

export type OfficeThreat = typeof OFFICE_THREATS[number];

// ============================================================================
// SECTION 1: FACILITY OVERVIEW (8 questions)
// ============================================================================

const SECTION_1_FACILITY_OVERVIEW: InterviewQuestion[] = [
  {
    id: 'overview_1',
    section: 'Facility Overview',
    questionText: 'What is the primary business function of this facility?',
    questionType: 'multiple_choice',
    options: [
      'Corporate headquarters',
      'Regional office',
      'Branch/satellite office',
      'Research & development',
      'Financial services/trading floor',
      'Legal/professional services',
      'Technology/software development',
      'Government/public sector',
      'Healthcare administration',
      'Call center/customer service',
      'Mixed use',
      'Other',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['data_breach_physical', 'corporate_espionage', 'executive_targeting'],
    informsImpact: true,
    helpText: 'Financial/legal/tech functions increase data theft threat likelihood',
  },
  {
    id: 'overview_2',
    section: 'Facility Overview',
    questionText: 'How many total employees work at this location?',
    questionType: 'multiple_choice',
    options: [
      '1-25 employees',
      '26-50 employees',
      '51-100 employees',
      '101-250 employees',
      '251-500 employees',
      '500+ employees',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsImpact: true,
    informsThreat: ['workplace_violence', 'insider_threat'],
    helpText: 'Larger workforce = harder to know everyone, increased insider threat surface',
  },
  {
    id: 'overview_3',
    section: 'Facility Overview',
    questionText: 'Is this a single-tenant building or multi-tenant shared space?',
    questionType: 'multiple_choice',
    options: [
      'Single-tenant - company occupies entire building',
      'Multi-tenant - company occupies entire floor(s)',
      'Multi-tenant - shared floor with other companies',
      'Co-working/shared office space',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    riskIndicators: ['multi-tenant', 'shared floor', 'co-working'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'theft_burglary', 'corporate_espionage'],
    helpText: 'Shared spaces reduce control over who enters the building',
  },
  {
    id: 'overview_4',
    section: 'Facility Overview',
    questionText: 'Does your company handle sensitive data or high-value intellectual property?',
    questionType: 'multiple_choice',
    options: [
      'Highly sensitive - regulated data (PII, PHI, financial)',
      'Moderately sensitive - proprietary business information',
      'Standard business data - no special sensitivity',
      'Unknown/unsure',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
    informsThreat: ['data_breach_physical', 'corporate_espionage'],
    helpText: '"Highly sensitive" increases impact for data theft scenarios',
  },
  {
    id: 'overview_5',
    section: 'Facility Overview',
    questionText: 'Are there high-profile executives or public figures who work at this location?',
    questionType: 'yes_no',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['executive_targeting', 'workplace_violence', 'terrorism_bomb_threat'],
    helpText: 'Executive presence increases targeting threat likelihood',
  },
  {
    id: 'overview_6',
    section: 'Facility Overview',
    questionText: 'What are your typical operating hours?',
    questionType: 'multiple_choice',
    options: [
      'Standard business hours (8am-6pm)',
      'Extended hours (6am-10pm)',
      '24/7 operations',
      'Variable/flexible hours',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'unauthorized_access'],
  },
  {
    id: 'overview_7',
    section: 'Facility Overview',
    questionText: 'Approximately how many visitors do you receive per day?',
    questionType: 'multiple_choice',
    options: [
      'Minimal (under 10)',
      'Moderate (10-50)',
      'High (50-100)',
      'Very high (100+)',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'workplace_violence'],
    helpText: 'Higher visitor volume makes screening more challenging',
  },
  {
    id: 'overview_8',
    section: 'Facility Overview',
    questionText: 'What is the approximate value of company assets at this location?',
    questionType: 'multiple_choice',
    options: [
      'Under $100,000',
      '$100,000 - $500,000',
      '$500,000 - $1 million',
      '$1 million - $5 million',
      'Over $5 million',
      'Unknown/prefer not to disclose',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
    informsThreat: ['theft_burglary', 'after_hours_intrusion'],
  },
];

// ============================================================================
// SECTION 2: PERIMETER SECURITY (10 questions with follow-ups)
// ============================================================================

const SECTION_2_PERIMETER_SECURITY: InterviewQuestion[] = [
  {
    id: 'perimeter_1',
    section: 'Perimeter Security',
    questionText: 'Does the building have defined perimeter security?',
    questionType: 'multiple_choice',
    options: [
      'Yes - fenced perimeter with controlled access points',
      'Yes - secured parking structure only',
      'Partial - some areas secured',
      'No - building is directly adjacent to public sidewalk/street',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No - building is directly adjacent to public sidewalk/street'],
    riskWeight: 2,
    riskIndicators: ['no - building is directly'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'vehicle_ramming', 'terrorism_bomb_threat'],
    suggestsControls: ['perimeter_fencing', 'vehicle_barriers', 'setback_requirements'],
  },
  {
    id: 'perimeter_2',
    section: 'Perimeter Security',
    questionText: 'How would you rate the exterior lighting around the building perimeter?',
    questionType: 'rating',
    ratingScale: { min: 1, max: 5, labels: ['Very Poor', 'Poor', 'Adequate', 'Good', 'Excellent'] },
    required: true,
    polarity: 'RATING',
    ratingBadThreshold: 2,
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'vehicle_ramming', 'workplace_violence'],
    suggestsControls: ['perimeter_lighting', 'motion_activated_lighting'],
  },
  {
    id: 'perimeter_3',
    section: 'Perimeter Security',
    questionText: 'Is there landscaping or vegetation that could provide concealment near entry points?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    riskIndicators: ['yes'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'workplace_violence', 'executive_targeting'],
    suggestsControls: ['cpted_landscaping', 'vegetation_management'],
  },
  {
    id: 'perimeter_4',
    section: 'Perimeter Security',
    questionText: 'Do you have CCTV coverage of the building perimeter?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'vehicle_ramming', 'after_hours_intrusion'],
    suggestsControls: ['perimeter_cctv', 'video_analytics'],
    followUpQuestions: [
      {
        id: 'perimeter_4a',
        section: 'Perimeter Security',
        questionText: 'What percentage of the building perimeter has camera coverage?',
        questionType: 'multiple_choice',
        options: [
          '100% coverage',
          '75-99% coverage',
          '50-74% coverage',
          '25-49%',
          'Less than 25%',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Less than 25%', '25-49%'],
        riskWeight: 1,
        riskIndicators: ['25-49%', 'less than 25%'],
        condition: {
          questionId: 'perimeter_4',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        suggestsControls: ['expand_cctv_coverage'],
      },
    ],
  },
  {
    id: 'perimeter_5',
    section: 'Perimeter Security',
    questionText: 'Are there any vulnerable entry points (basement doors, roof access, service entrances)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'after_hours_intrusion', 'corporate_espionage'],
    followUpQuestions: [
      {
        id: 'perimeter_5a',
        section: 'Perimeter Security',
        questionText: 'How are these vulnerable entry points secured?',
        questionType: 'checklist',
        options: [
          'Card reader access control',
          'CCTV monitoring',
          'Alarm sensors',
          'Physical locks only',
          'Security patrol coverage',
          'No additional security',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Physical locks only', 'No additional security'],
        riskWeight: 2,
        riskIndicators: ['physical locks only', 'no additional security'],
        condition: {
          questionId: 'perimeter_5',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        suggestsControls: ['secondary_entry_access_control', 'door_alarms', 'cctv_secondary_entries'],
      },
    ],
  },
  {
    id: 'perimeter_6',
    section: 'Perimeter Security',
    questionText: 'Do you have intrusion detection on perimeter doors/windows?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'unauthorized_access'],
    suggestsControls: ['perimeter_intrusion_detection', 'door_contacts', 'glass_break_sensors'],
  },
  {
    id: 'perimeter_7',
    section: 'Perimeter Security',
    questionText: 'Is the perimeter intrusion detection system monitored 24/7?',
    questionType: 'multiple_choice',
    options: [
      'Yes - 24/7 central station monitoring',
      'Yes - security operations center on-site',
      'Business hours monitoring only',
      'No - alarm notification via email/phone only',
      'No intrusion detection system',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No - alarm notification via email/phone only', 'No intrusion detection system'],
    riskWeight: 1,
    riskIndicators: ['notification via email', 'no intrusion detection'],
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'unauthorized_access'],
    suggestsControls: ['central_station_monitoring', '24_7_monitoring'],
  },
  {
    id: 'perimeter_8',
    section: 'Perimeter Security',
    questionText: 'Have there been any attempted break-ins or perimeter breaches in the past 2 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['after_hours_intrusion', 'theft_burglary'],
    informsVulnerability: true,
  },
];

// ============================================================================
// SECTION 3: PARKING FACILITIES (6 questions with follow-ups)
// ============================================================================

const SECTION_3_PARKING_FACILITIES: InterviewQuestion[] = [
  {
    id: 'parking_1',
    section: 'Parking Facilities',
    questionText: 'What type of employee parking do you have?',
    questionType: 'multiple_choice',
    options: [
      'Secured underground garage',
      'Secured above-ground parking structure',
      'Unsecured surface lot adjacent to building',
      'Street parking only',
      'No dedicated parking',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Unsecured surface lot adjacent to building', 'Street parking only'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['executive_targeting', 'theft_burglary', 'vehicle_ramming'],
    suggestsControls: ['parking_access_control', 'parking_cctv'],
  },
  {
    id: 'parking_2',
    section: 'Parking Facilities',
    questionText: 'How is access to the employee parking area controlled?',
    questionType: 'multiple_choice',
    options: [
      'Badge/card reader with vehicle gates',
      'Attendant staffed booth',
      'License plate recognition system',
      'Parking permit/sticker only',
      'No access control - open parking',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Parking permit/sticker only', 'No access control - open parking'],
    riskWeight: 1,
    riskIndicators: ['parking permit', 'no access control'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'executive_targeting', 'vehicle_ramming'],
    suggestsControls: ['parking_access_control', 'vehicle_gates', 'lpr_system'],
  },
  {
    id: 'parking_3',
    section: 'Parking Facilities',
    questionText: 'Do you have CCTV coverage in parking areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['theft_burglary', 'executive_targeting', 'workplace_violence'],
    suggestsControls: ['parking_cctv', 'parking_video_analytics'],
    followUpQuestions: [
      {
        id: 'parking_3a',
        section: 'Parking Facilities',
        questionText: 'What percentage of parking area has camera coverage?',
        questionType: 'multiple_choice',
        options: [
          '100% coverage',
          '75-99% coverage',
          '50-74% coverage',
          'Less than 50%',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Less than 50%'],
        riskWeight: 1,
        riskIndicators: ['less than 50%'],
        condition: {
          questionId: 'parking_3',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        suggestsControls: ['expand_parking_cctv'],
      },
    ],
  },
  {
    id: 'parking_4',
    section: 'Parking Facilities',
    questionText: 'How would you rate parking area lighting?',
    questionType: 'rating',
    ratingScale: { min: 1, max: 5, labels: ['Very Poor', 'Poor', 'Adequate', 'Good', 'Excellent'] },
    required: true,
    polarity: 'RATING',
    ratingBadThreshold: 2,
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['theft_burglary', 'workplace_violence', 'executive_targeting'],
    suggestsControls: ['parking_lighting', 'emergency_lighting'],
  },
  {
    id: 'parking_5',
    section: 'Parking Facilities',
    questionText: 'Have there been incidents of vehicle break-ins or theft in parking area in the past year?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['theft_burglary'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'parking_5a',
        section: 'Parking Facilities',
        questionText: 'How frequently do these incidents occur?',
        questionType: 'multiple_choice',
        options: [
          'Isolated incident (1-2 in past year)',
          'Occasionally (quarterly)',
          'Frequently (monthly)',
          'Very frequently (weekly or more)',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Frequently (monthly)', 'Very frequently (weekly or more)'],
        riskWeight: 2,
        riskIndicators: ['frequently', 'very frequently'],
        condition: {
          questionId: 'parking_5',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        informsThreat: ['theft_burglary'],
      },
    ],
  },
  {
    id: 'parking_6',
    section: 'Parking Facilities',
    questionText: 'Is there a security escort service available for employees?',
    questionType: 'multiple_choice',
    options: [
      'Yes - available 24/7',
      'Yes - available during non-business hours',
      'Yes - available upon request',
      'No escort service available',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No escort service available'],
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['workplace_violence', 'executive_targeting'],
    suggestsControls: ['security_escort_service'],
  },
];

// ============================================================================
// SECTION 4: BUILDING ENTRY POINTS (10 questions with follow-ups)
// ============================================================================

const SECTION_4_BUILDING_ENTRY: InterviewQuestion[] = [
  {
    id: 'entry_1',
    section: 'Building Entry Points',
    questionText: 'How many public entry doors does the building have during business hours?',
    questionType: 'multiple_choice',
    options: [
      '1 entry (single point of control)',
      '2 entries',
      '3-4 entries',
      '5+ entries',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['5+ entries'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'active_shooter', 'workplace_violence'],
    suggestsControls: ['reduce_entry_points', 'centralized_reception'],
  },
  {
    id: 'entry_2',
    section: 'Building Entry Points',
    questionText: 'What type of access control do you have at the main building entrance?',
    questionType: 'multiple_choice',
    options: [
      'Mantrap/vestibule with dual authentication',
      'Badge reader plus security guard',
      'Badge reader only',
      'Intercom/video verification',
      'Staffed reception desk only (no card reader)',
      'Open access during business hours',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Open access during business hours', 'Intercom/video verification', 'Staffed reception desk only (no card reader)'],
    riskWeight: 3,
    riskIndicators: ['open access during business hours'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'workplace_violence', 'active_shooter'],
    suggestsControls: ['main_entry_access_control', 'badge_reader_system', 'mantrap_vestibule'],
  },
  {
    id: 'entry_3',
    section: 'Building Entry Points',
    questionText: 'Do you have anti-tailgating measures at building entry?',
    questionType: 'multiple_choice',
    options: [
      'Yes - mantrap/security vestibule',
      'Yes - turnstiles/optical barriers',
      'Yes - security guard challenges unknown persons',
      'No - open entry with badge reader',
      'No - completely open entry',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No - open entry with badge reader', 'No - completely open entry'],
    riskWeight: 2,
    riskIndicators: ['no - open entry', 'no - completely open'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'active_shooter', 'corporate_espionage'],
    suggestsControls: ['anti_tailgating_measures', 'turnstiles', 'mantrap_vestibule'],
  },
  {
    id: 'entry_4',
    section: 'Building Entry Points',
    questionText: 'Is there a staffed reception/security desk during business hours?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'workplace_violence'],
    suggestsControls: ['reception_desk', 'security_officer'],
  },
  {
    id: 'entry_5',
    section: 'Building Entry Points',
    questionText: 'Do you use a visitor management system?',
    questionType: 'multiple_choice',
    options: [
      'Yes - digital system with ID scan and photo',
      'Yes - digital system with manual entry',
      'Yes - paper sign-in log only',
      'No formal visitor management',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Yes - paper sign-in log only', 'No formal visitor management'],
    riskWeight: 2,
    riskIndicators: ['paper sign-in log', 'no formal visitor'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'workplace_violence', 'corporate_espionage'],
    suggestsControls: ['visitor_management_system', 'visitor_badges'],
  },
  {
    id: 'entry_6',
    section: 'Building Entry Points',
    questionText: 'Are all visitors required to be escorted while on premises?',
    questionType: 'multiple_choice',
    options: [
      'Yes - strictly enforced escort policy',
      'Yes - required in secure areas only',
      'Recommended but not enforced',
      'No escort policy',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Recommended but not enforced', 'No escort policy'],
    riskWeight: 1,
    riskIndicators: ['recommended but not', 'no escort policy'],
    informsVulnerability: true,
    informsThreat: ['corporate_espionage', 'unauthorized_access', 'data_breach_physical'],
    suggestsControls: ['visitor_escort_policy'],
  },
  {
    id: 'entry_7',
    section: 'Building Entry Points',
    questionText: 'Do you have CCTV coverage at all building entry/exit points?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'theft_burglary', 'workplace_violence'],
    suggestsControls: ['entry_point_cctv'],
  },
  {
    id: 'entry_8',
    section: 'Building Entry Points',
    questionText: 'How are entry doors secured after business hours?',
    questionType: 'multiple_choice',
    options: [
      'Card reader required for all entry',
      'Physical locks plus alarm system',
      'Physical locks only',
      'Limited after-hours access',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Physical locks only'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'unauthorized_access'],
    suggestsControls: ['after_hours_access_control'],
  },
  {
    id: 'entry_9',
    section: 'Building Entry Points',
    questionText: 'Are entry doors equipped with forced entry alarms?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'unauthorized_access'],
    suggestsControls: ['door_forced_entry_alarms', 'door_contact_sensors'],
  },
  {
    id: 'entry_10',
    section: 'Building Entry Points',
    questionText: 'Have you experienced any incidents of unauthorized individuals entering the building?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['unauthorized_access'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'entry_10a',
        section: 'Building Entry Points',
        questionText: 'How frequently do these incidents occur?',
        questionType: 'multiple_choice',
        options: [
          'Isolated incident (1-2 in past year)',
          'Occasionally (quarterly)',
          'Frequently (monthly)',
          'Very frequently (weekly or more)',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Frequently (monthly)', 'Very frequently (weekly or more)'],
        riskWeight: 2,
        riskIndicators: ['frequently', 'very frequently'],
        condition: {
          questionId: 'entry_10',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        informsThreat: ['unauthorized_access'],
      },
    ],
  },
];

// ============================================================================
// SECTION 5: INTERIOR ACCESS CONTROL (8 questions)
// ============================================================================

const SECTION_5_INTERIOR_ACCESS: InterviewQuestion[] = [
  {
    id: 'interior_1',
    section: 'Interior Access Control',
    questionText: 'Do you have zone-based access control (different security levels for different areas)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'data_breach_physical', 'corporate_espionage'],
    suggestsControls: ['zone_based_access_control', 'tiered_access_permissions'],
  },
  {
    id: 'interior_2',
    section: 'Interior Access Control',
    questionText: 'Is there enhanced security for executive suites/offices?',
    questionType: 'multiple_choice',
    options: [
      'Yes - biometric access (fingerprint, facial recognition)',
      'Yes - separate card reader with elevated permissions',
      'Yes - physical key plus card reader',
      'No - executive areas have same access as general office',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No - executive areas have same access as general office'],
    riskWeight: 2,
    riskIndicators: ['no - executive areas'],
    informsVulnerability: true,
    informsThreat: ['executive_targeting', 'corporate_espionage', 'data_breach_physical'],
    suggestsControls: ['executive_suite_access_control', 'biometric_access'],
  },
  {
    id: 'interior_3',
    section: 'Interior Access Control',
    questionText: 'How is access to your server room/IT infrastructure controlled?',
    questionType: 'multiple_choice',
    options: [
      'Multi-factor authentication (badge + biometric)',
      'Card reader with audit logging',
      'Physical key/combination lock',
      'No dedicated IT space or minimal security',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Physical key/combination lock', 'No dedicated IT space or minimal security'],
    riskWeight: 2,
    riskIndicators: ['physical key', 'no dedicated IT'],
    informsVulnerability: true,
    informsThreat: ['data_breach_physical', 'corporate_espionage', 'insider_threat'],
    suggestsControls: ['server_room_access_control', 'it_area_mfa'],
  },
  {
    id: 'interior_4',
    section: 'Interior Access Control',
    questionText: 'Are server rooms/IT closets equipped with CCTV monitoring?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['data_breach_physical', 'insider_threat'],
    suggestsControls: ['server_room_cctv'],
  },
  {
    id: 'interior_5',
    section: 'Interior Access Control',
    questionText: 'Do you have stairwell access control (card readers on stairwell doors)?',
    questionType: 'multiple_choice',
    options: [
      'Yes - card readers on all stairwell doors',
      'Yes - card readers on select floors only',
      'Re-entry control only (can exit but not re-enter)',
      'No - stairwells are open access',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No - stairwells are open access'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'active_shooter'],
    suggestsControls: ['stairwell_access_control'],
  },
  {
    id: 'interior_6',
    section: 'Interior Access Control',
    questionText: 'Are elevator(s) equipped with floor access control?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access'],
    suggestsControls: ['elevator_access_control'],
  },
  {
    id: 'interior_7',
    section: 'Interior Access Control',
    questionText: 'Do you have CCTV coverage in interior common areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'workplace_violence', 'theft_burglary'],
    suggestsControls: ['interior_cctv'],
  },
  {
    id: 'interior_8',
    section: 'Interior Access Control',
    questionText: 'How do you manage access rights and badge permissions?',
    questionType: 'multiple_choice',
    options: [
      'Automated system with regular audits',
      'Manual review process (at least annually)',
      'Badge access set at hire, rarely reviewed',
      'No formal access management process',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Badge access set at hire, rarely reviewed', 'No formal access management process'],
    riskWeight: 1,
    riskIndicators: ['rarely reviewed', 'no formal access'],
    informsVulnerability: true,
    informsThreat: ['insider_threat', 'unauthorized_access'],
    suggestsControls: ['access_rights_management', 'periodic_access_audits'],
  },
];

// ============================================================================
// SECTION 6: SURVEILLANCE SYSTEMS (7 questions)
// ============================================================================

const SECTION_6_SURVEILLANCE: InterviewQuestion[] = [
  {
    id: 'surveillance_1',
    section: 'Surveillance Systems',
    questionText: 'What is the total number of cameras in your facility?',
    questionType: 'multiple_choice',
    options: [
      '50+ cameras',
      '25-49 cameras',
      '11-24 cameras',
      '1-10 cameras',
      'No cameras',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No cameras', '1-10 cameras'],
    riskWeight: 3,
    riskIndicators: ['no cameras'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'theft_burglary', 'workplace_violence'],
    suggestsControls: ['cctv_system', 'expand_camera_coverage'],
  },
  {
    id: 'surveillance_2',
    section: 'Surveillance Systems',
    questionText: 'What is the camera resolution/quality?',
    questionType: 'multiple_choice',
    options: [
      '4K/Ultra HD (8MP+)',
      '1080p Full HD (2MP)',
      '720p HD (1MP)',
      'Standard definition/analog',
      'Mixed quality/unknown',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    suggestsControls: ['upgrade_camera_resolution'],
  },
  {
    id: 'surveillance_3',
    section: 'Surveillance Systems',
    questionText: 'How long is video footage retained?',
    questionType: 'multiple_choice',
    options: [
      '90+ days',
      '60-89 days',
      '30-59 days',
      '7-29 days',
      'Less than 7 days',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Less than 7 days'],
    riskWeight: 1,
    riskIndicators: ['less than 7 days'],
    informsVulnerability: true,
    suggestsControls: ['increase_video_retention'],
  },
  {
    id: 'surveillance_4',
    section: 'Surveillance Systems',
    questionText: 'Are cameras actively monitored in real-time?',
    questionType: 'multiple_choice',
    options: [
      'Yes - 24/7 security operations center',
      'Yes - during business hours only',
      'Yes - remote monitoring service',
      'No - recording only, reviewed when needed',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No - recording only, reviewed when needed'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['workplace_violence', 'active_shooter'],
    suggestsControls: ['real_time_monitoring', 'security_operations_center'],
  },
  {
    id: 'surveillance_5',
    section: 'Surveillance Systems',
    questionText: 'Do you have video analytics capabilities?',
    questionType: 'checklist',
    options: [
      'Facial recognition',
      'License plate recognition',
      'Motion detection alerts',
      'Object detection (weapons, packages)',
      'Loitering detection',
      'People counting',
      'No video analytics',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No video analytics'],
    riskWeight: 0,
    informsVulnerability: true,
    suggestsControls: ['video_analytics'],
  },
  {
    id: 'surveillance_6',
    section: 'Surveillance Systems',
    questionText: 'How often are cameras inspected/maintained?',
    questionType: 'multiple_choice',
    options: [
      'Monthly preventive maintenance',
      'Quarterly inspections',
      'Annually',
      'Only when malfunction is reported',
      'No regular maintenance',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Only when malfunction is reported', 'No regular maintenance'],
    riskWeight: 1,
    riskIndicators: ['only when malfunction', 'no regular maintenance'],
    informsVulnerability: true,
    suggestsControls: ['cctv_maintenance_program'],
  },
  {
    id: 'surveillance_7',
    section: 'Surveillance Systems',
    questionText: 'Overall, how would you rate your current CCTV system effectiveness?',
    questionType: 'rating',
    ratingScale: { min: 1, max: 5, labels: ['Very Poor', 'Poor', 'Adequate', 'Good', 'Excellent'] },
    required: true,
    polarity: 'RATING',
    ratingBadThreshold: 2,
    riskWeight: 1,
    informsVulnerability: true,
    suggestsControls: ['cctv_system_upgrade'],
  },
];

// ============================================================================
// SECTION 7: INTRUSION DETECTION (5 questions)
// ============================================================================

const SECTION_7_INTRUSION_DETECTION: InterviewQuestion[] = [
  {
    id: 'intrusion_1',
    section: 'Intrusion Detection',
    questionText: 'Do you have an intrusion detection system (burglar alarm)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'theft_burglary'],
    suggestsControls: ['intrusion_detection_system'],
  },
  {
    id: 'intrusion_2',
    section: 'Intrusion Detection',
    questionText: 'What types of sensors are included in your system?',
    questionType: 'checklist',
    options: [
      'Door/window contacts',
      'Motion detectors (PIR)',
      'Glass break sensors',
      'Vibration sensors',
      'Beam sensors',
      'No intrusion detection system',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No intrusion detection system'],
    riskWeight: 0,
    informsVulnerability: true,
    suggestsControls: ['expand_sensor_coverage'],
  },
  {
    id: 'intrusion_3',
    section: 'Intrusion Detection',
    questionText: 'How is the intrusion detection system monitored?',
    questionType: 'multiple_choice',
    options: [
      '24/7 central station monitoring with police dispatch',
      '24/7 central station with call verification',
      'In-house security operations center',
      'Local alarm (audible/visual only)',
      'Email/SMS notifications only',
      'No monitoring',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Local alarm (audible/visual only)', 'Email/SMS notifications only', 'No monitoring'],
    riskWeight: 1,
    riskIndicators: ['local alarm', 'email/sms', 'no monitoring'],
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'theft_burglary'],
    suggestsControls: ['central_station_monitoring'],
  },
  {
    id: 'intrusion_4',
    section: 'Intrusion Detection',
    questionText: 'How often is the intrusion detection system tested?',
    questionType: 'multiple_choice',
    options: [
      'Monthly testing',
      'Quarterly testing',
      'Annually',
      'Rarely or never',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely or never'],
    riskWeight: 1,
    riskIndicators: ['rarely or never'],
    informsVulnerability: true,
    suggestsControls: ['alarm_testing_program'],
  },
  {
    id: 'intrusion_5',
    section: 'Intrusion Detection',
    questionText: 'Have there been false alarm issues with your intrusion detection system?',
    questionType: 'multiple_choice',
    options: [
      'No false alarm issues',
      'Occasional false alarms (addressed promptly)',
      'Frequent false alarms (ongoing issue)',
      'Excessive false alarms (system often disabled)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Excessive false alarms (system often disabled)'],
    riskWeight: 1,
    riskIndicators: ['frequent false alarms', 'excessive false alarms'],
    informsVulnerability: true,
    suggestsControls: ['alarm_system_tuning', 'false_alarm_reduction'],
  },
];

// ============================================================================
// SECTION 8: SECURITY PERSONNEL & PROCEDURES (9 questions)
// ============================================================================

const SECTION_8_PERSONNEL: InterviewQuestion[] = [
  {
    id: 'personnel_1',
    section: 'Security Personnel & Procedures',
    questionText: 'Do you have dedicated security personnel on-site?',
    questionType: 'multiple_choice',
    options: [
      'Yes - 24/7 security staff',
      'Yes - business hours only',
      'Yes - peak hours/events only',
      'Contract guard service on call',
      'No dedicated security',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No dedicated security'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['workplace_violence', 'unauthorized_access', 'active_shooter'],
    suggestsControls: ['security_personnel', 'security_guard_service'],
  },
  {
    id: 'personnel_2',
    section: 'Security Personnel & Procedures',
    questionText: 'Are security personnel armed or unarmed?',
    questionType: 'multiple_choice',
    options: [
      'Armed security officers',
      'Unarmed security officers',
      'Mixed (armed and unarmed)',
      'No security personnel',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
  },
  {
    id: 'personnel_3',
    section: 'Security Personnel & Procedures',
    questionText: 'Do you conduct background checks on all employees?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive (criminal, credit, employment verification)',
      'Yes - basic criminal background check',
      'Yes - for certain positions only',
      'No background checks',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No background checks'],
    riskWeight: 2,
    riskIndicators: ['no background checks'],
    informsVulnerability: true,
    informsThreat: ['insider_threat', 'workplace_violence'],
    suggestsControls: ['employee_background_checks'],
  },
  {
    id: 'personnel_4',
    section: 'Security Personnel & Procedures',
    questionText: 'Do employees receive security awareness training?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive program with annual refresher',
      'Yes - basic orientation training',
      'Informal on-the-job guidance',
      'No security training',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal on-the-job guidance', 'No security training'],
    riskWeight: 1,
    riskIndicators: ['informal', 'no security training'],
    informsVulnerability: true,
    informsThreat: ['corporate_espionage', 'workplace_violence', 'unauthorized_access'],
    suggestsControls: ['security_awareness_training'],
  },
  {
    id: 'personnel_5',
    section: 'Security Personnel & Procedures',
    questionText: 'Is there specific security training for executives?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['executive_targeting', 'corporate_espionage'],
    suggestsControls: ['executive_security_training'],
  },
  {
    id: 'personnel_6',
    section: 'Security Personnel & Procedures',
    questionText: 'Do you have documented security policies and procedures?',
    questionType: 'checklist',
    options: [
      'Access control policy',
      'Visitor management policy',
      'Emergency response procedures',
      'Workplace violence prevention',
      'Incident reporting procedures',
      'Key/badge management',
      'After-hours access policy',
      'No documented policies',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No documented policies'],
    riskWeight: 1,
    riskIndicators: ['no documented policies'],
    informsVulnerability: true,
    suggestsControls: ['security_policies_procedures'],
  },
  {
    id: 'personnel_7',
    section: 'Security Personnel & Procedures',
    questionText: 'How often are security policies reviewed and updated?',
    questionType: 'multiple_choice',
    options: [
      'Annually (or more frequently)',
      'Every 2-3 years',
      'Only when incidents occur',
      'Rarely or never updated',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Only when incidents occur', 'Rarely or never updated'],
    riskWeight: 1,
    riskIndicators: ['only when incidents', 'rarely or never'],
    informsVulnerability: true,
    suggestsControls: ['policy_review_program'],
  },
  {
    id: 'personnel_8',
    section: 'Security Personnel & Procedures',
    questionText: 'Do you have an anonymous incident reporting system?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['workplace_violence', 'insider_threat'],
    suggestsControls: ['anonymous_reporting_system'],
  },
  {
    id: 'personnel_9',
    section: 'Security Personnel & Procedures',
    questionText: 'Is there a designated security manager or director responsible for physical security?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    suggestsControls: ['security_manager', 'security_governance'],
  },
];

// ============================================================================
// SECTION 9: EMERGENCY PREPAREDNESS (7 questions)
// ============================================================================

const SECTION_9_EMERGENCY: InterviewQuestion[] = [
  {
    id: 'emergency_1',
    section: 'Emergency Preparedness',
    questionText: 'Do you have a written emergency response plan?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['workplace_violence', 'active_shooter', 'terrorism_bomb_threat'],
    suggestsControls: ['emergency_response_plan'],
  },
  {
    id: 'emergency_2',
    section: 'Emergency Preparedness',
    questionText: 'What emergency scenarios does your plan cover?',
    questionType: 'checklist',
    options: [
      'Fire/evacuation',
      'Medical emergency',
      'Active shooter/armed intruder',
      'Bomb threat/suspicious package',
      'Natural disaster',
      'Civil disturbance/protest',
      'Workplace violence',
      'Power outage/utility failure',
      'No formal emergency plan',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No formal emergency plan'],
    riskWeight: 2,
    riskIndicators: ['no formal emergency plan'],
    informsVulnerability: true,
    suggestsControls: ['comprehensive_emergency_plan'],
  },
  {
    id: 'emergency_3',
    section: 'Emergency Preparedness',
    questionText: 'Do you conduct emergency drills?',
    questionType: 'multiple_choice',
    options: [
      'Yes - multiple drill types quarterly',
      'Yes - fire drills annually, other drills occasionally',
      'Yes - fire drills only',
      'Rarely',
      'Never',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely', 'Never'],
    riskWeight: 1,
    riskIndicators: ['rarely', 'never'],
    informsVulnerability: true,
    suggestsControls: ['emergency_drill_program'],
  },
  {
    id: 'emergency_4',
    section: 'Emergency Preparedness',
    questionText: 'Do you have a mass notification system to alert employees during emergencies?',
    questionType: 'multiple_choice',
    options: [
      'Yes - multi-channel (text, email, PA, desktop alerts)',
      'Yes - single channel (text or email only)',
      'PA system only',
      'No mass notification system',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No mass notification system'],
    riskWeight: 2,
    riskIndicators: ['no mass notification'],
    informsVulnerability: true,
    informsThreat: ['workplace_violence', 'active_shooter'],
    suggestsControls: ['mass_notification_system'],
  },
  {
    id: 'emergency_5',
    section: 'Emergency Preparedness',
    questionText: 'Do you have panic buttons or duress alarms?',
    questionType: 'multiple_choice',
    options: [
      'Yes - at reception plus executive offices',
      'Yes - at reception only',
      'Yes - mobile panic buttons for key personnel',
      'No panic buttons',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No panic buttons'],
    riskWeight: 1,
    riskIndicators: ['no panic buttons'],
    informsVulnerability: true,
    informsThreat: ['workplace_violence', 'executive_targeting'],
    suggestsControls: ['panic_buttons', 'duress_alarms'],
  },
  {
    id: 'emergency_6',
    section: 'Emergency Preparedness',
    questionText: 'Do you have remote lockdown capability for active threat situations?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['active_shooter', 'workplace_violence'],
    suggestsControls: ['lockdown_capability'],
  },
  {
    id: 'emergency_7',
    section: 'Emergency Preparedness',
    questionText: 'Are there designated emergency rally points/safe areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    suggestsControls: ['designated_rally_points', 'evacuation_planning'],
  },
];

// ============================================================================
// SECTION 10: INCIDENT HISTORY ANALYSIS (6 questions with follow-ups)
// ============================================================================

const SECTION_10_INCIDENT_HISTORY: InterviewQuestion[] = [
  {
    id: 'incident_1',
    section: 'Incident History Analysis',
    questionText: 'Have you experienced any workplace violence incidents in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['workplace_violence'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'incident_1a',
        section: 'Incident History Analysis',
        questionText: 'What type of incident(s)? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Verbal threats/intimidation',
          'Physical altercation',
          'Harassment/stalking',
          'Domestic violence spillover',
          'Weapon brought to workplace',
          'Active threat incident',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Weapon brought to workplace', 'Active threat incident'],
        riskWeight: 3,
        riskIndicators: ['weapon', 'active threat'],
        condition: {
          questionId: 'incident_1',
          expectedValue: 'yes',
        },
        informsThreat: ['workplace_violence', 'active_shooter'],
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'incident_2',
    section: 'Incident History Analysis',
    questionText: 'Have there been any theft incidents (employee property or company assets)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['theft_burglary', 'insider_threat'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'incident_2a',
        section: 'Incident History Analysis',
        questionText: 'How frequently do theft incidents occur?',
        questionType: 'multiple_choice',
        options: [
          'Isolated incident (1-2 in past year)',
          'Occasionally (quarterly)',
          'Frequently (monthly)',
          'Very frequently (weekly or more)',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Frequently (monthly)', 'Very frequently (weekly or more)'],
        riskWeight: 2,
        riskIndicators: ['frequently', 'very frequently'],
        condition: {
          questionId: 'incident_2',
          expectedValue: 'yes',
        },
        informsThreat: ['theft_burglary'],
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'incident_3',
    section: 'Incident History Analysis',
    questionText: 'Have there been any suspected data breaches related to physical access?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 2,
    informsThreat: ['data_breach_physical', 'corporate_espionage'],
    informsVulnerability: true,
  },
  {
    id: 'incident_4',
    section: 'Incident History Analysis',
    questionText: 'Have you had any bomb threats or suspicious package incidents?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 0,
    informsThreat: ['terrorism_bomb_threat'],
    informsVulnerability: true,
  },
  {
    id: 'incident_5',
    section: 'Incident History Analysis',
    questionText: 'Have there been any incidents involving executives being targeted or harassed?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 2,
    informsThreat: ['executive_targeting'],
    informsVulnerability: true,
  },
  {
    id: 'incident_6',
    section: 'Incident History Analysis',
    questionText: 'Do you track and document security incidents in a centralized system?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    suggestsControls: ['incident_tracking_system'],
  },
];

// ============================================================================
// SECTION 11: CYBER-PHYSICAL SECURITY (5 questions)
// ============================================================================

const SECTION_11_CYBER_PHYSICAL: InterviewQuestion[] = [
  {
    id: 'cyber_1',
    section: 'Cyber-Physical Security',
    questionText: 'Are physical security systems (access control, cameras) on a segregated network?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['data_breach_physical', 'corporate_espionage'],
    suggestsControls: ['network_segregation', 'security_system_network_isolation'],
  },
  {
    id: 'cyber_2',
    section: 'Cyber-Physical Security',
    questionText: 'Do you have visitor WiFi that is segregated from the corporate network?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['data_breach_physical', 'corporate_espionage'],
    suggestsControls: ['visitor_wifi_segregation'],
  },
  {
    id: 'cyber_3',
    section: 'Cyber-Physical Security',
    questionText: 'Are security systems (access control, alarms, cameras) regularly updated/patched?',
    questionType: 'multiple_choice',
    options: [
      'Yes - automatic updates enabled',
      'Yes - quarterly manual updates',
      'Yes - annual updates',
      'Rarely updated',
      'Unknown',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely updated', 'Unknown'],
    riskWeight: 1,
    riskIndicators: ['rarely updated', 'unknown'],
    informsVulnerability: true,
    suggestsControls: ['security_system_patching'],
  },
  {
    id: 'cyber_4',
    section: 'Cyber-Physical Security',
    questionText: 'Do you use default passwords on security equipment?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    riskIndicators: ['yes'],
    informsVulnerability: true,
    suggestsControls: ['password_management', 'default_credential_audit'],
  },
  {
    id: 'cyber_5',
    section: 'Cyber-Physical Security',
    questionText: 'Is there a process to coordinate physical and cybersecurity teams?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    suggestsControls: ['converged_security_program'],
  },
];

// ============================================================================
// SECTION 12: DOCUMENT & DATA SECURITY (7 questions)
// ============================================================================

const SECTION_12_DOCUMENT_SECURITY: InterviewQuestion[] = [
  {
    id: 'document_1',
    section: 'Document & Data Security',
    questionText: 'Do you have a clean desk policy?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['data_breach_physical', 'corporate_espionage'],
    suggestsControls: ['clean_desk_policy'],
    followUpQuestions: [
      {
        id: 'document_1a',
        section: 'Document & Data Security',
        questionText: 'How is the clean desk policy enforced?',
        questionType: 'multiple_choice',
        options: [
          'Regular audits with consequences',
          'Periodic spot checks',
          'Policy exists but not enforced',
          'No enforcement',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Policy exists but not enforced', 'No enforcement'],
        riskWeight: 1,
        riskIndicators: ['not enforced', 'no enforcement'],
        condition: {
          questionId: 'document_1',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        suggestsControls: ['clean_desk_enforcement'],
      },
    ],
  },
  {
    id: 'document_2',
    section: 'Document & Data Security',
    questionText: 'Do you have secure document destruction (shredders, locked disposal)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['data_breach_physical', 'corporate_espionage'],
    suggestsControls: ['secure_document_destruction'],
  },
  {
    id: 'document_3',
    section: 'Document & Data Security',
    questionText: 'Are printers/copiers configured for secure print release?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['data_breach_physical'],
    suggestsControls: ['secure_print_release'],
  },
  {
    id: 'document_4',
    section: 'Document & Data Security',
    questionText: 'Do you have policies regarding photographing/recording in the office?',
    questionType: 'multiple_choice',
    options: [
      'Prohibited in all areas',
      'Prohibited in sensitive areas only',
      'Informal guidelines',
      'No policy',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal guidelines', 'No policy'],
    riskWeight: 1,
    riskIndicators: ['informal guidelines', 'no policy'],
    informsVulnerability: true,
    informsThreat: ['corporate_espionage', 'data_breach_physical'],
    suggestsControls: ['photography_policy'],
  },
  {
    id: 'document_5',
    section: 'Document & Data Security',
    questionText: 'How are physical files/documents with sensitive information secured?',
    questionType: 'multiple_choice',
    options: [
      'Locked in restricted access room',
      'Locked filing cabinets in general office',
      'Open shelving in general office',
      'Not applicable - fully digital',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Open shelving in general office'],
    riskWeight: 1,
    riskIndicators: ['open shelving in general'],
    informsVulnerability: true,
    informsThreat: ['data_breach_physical', 'corporate_espionage'],
    suggestsControls: ['secure_file_storage'],
  },
  {
    id: 'document_6',
    section: 'Document & Data Security',
    questionText: 'Do you conduct clean desk audits or information security spot checks?',
    questionType: 'multiple_choice',
    options: [
      'Yes - monthly',
      'Yes - quarterly',
      'Yes - annually',
      'No audits',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No audits'],
    riskWeight: 1,
    riskIndicators: ['no audits'],
    informsVulnerability: true,
    suggestsControls: ['security_audit_program'],
  },
];

// ============================================================================
// SECTION 13: LOADING DOCK & RECEIVING (5 questions)
// ============================================================================

const SECTION_13_LOADING_DOCK: InterviewQuestion[] = [
  {
    id: 'loading_1',
    section: 'Loading Dock & Receiving',
    questionText: 'Do you have a loading dock or receiving area?',
    questionType: 'yes_no',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'theft_burglary'],
  },
  {
    id: 'loading_2',
    section: 'Loading Dock & Receiving',
    questionText: 'How is access to the loading dock/receiving area controlled?',
    questionType: 'multiple_choice',
    options: [
      'Card reader plus CCTV monitoring',
      'Card reader only',
      'Physical key/lock',
      'Staffed during business hours',
      'Open access',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Open access'],
    riskWeight: 2,
    riskIndicators: ['open access'],
    condition: {
      questionId: 'loading_1',
      expectedValue: 'yes',
    },
    informsVulnerability: true,
    informsThreat: ['unauthorized_access', 'theft_burglary'],
    suggestsControls: ['loading_dock_access_control'],
  },
  {
    id: 'loading_3',
    section: 'Loading Dock & Receiving',
    questionText: 'Do you have CCTV coverage of the loading dock/receiving area?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    condition: {
      questionId: 'loading_1',
      expectedValue: 'yes',
    },
    informsVulnerability: true,
    informsThreat: ['theft_burglary', 'unauthorized_access'],
    suggestsControls: ['loading_dock_cctv'],
  },
  {
    id: 'loading_4',
    section: 'Loading Dock & Receiving',
    questionText: 'Do you verify all incoming deliveries and packages?',
    questionType: 'multiple_choice',
    options: [
      'Yes - formal verification process with logging',
      'Yes - visual inspection only',
      'Sometimes verified',
      'No formal verification',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Sometimes verified', 'No formal verification'],
    riskWeight: 1,
    riskIndicators: ['sometimes verified', 'no formal verification'],
    condition: {
      questionId: 'loading_1',
      expectedValue: 'yes',
    },
    informsVulnerability: true,
    informsThreat: ['terrorism_bomb_threat', 'theft_burglary'],
    suggestsControls: ['delivery_verification_process'],
  },
  {
    id: 'loading_5',
    section: 'Loading Dock & Receiving',
    questionText: 'Is the loading dock/receiving area separated from main office areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    condition: {
      questionId: 'loading_1',
      expectedValue: 'yes',
    },
    informsVulnerability: true,
    informsThreat: ['unauthorized_access'],
    suggestsControls: ['loading_dock_separation'],
  },
];

// ============================================================================
// SECTION METADATA
// ============================================================================

export const OFFICE_SECTION_METADATA: SectionMetadata[] = [
  {
    id: 'facility_overview',
    name: 'Facility Overview',
    description: 'Basic information about the facility, operations, and business context',
    order: 1,
  },
  {
    id: 'perimeter_security',
    name: 'Perimeter Security',
    description: 'External building security, lighting, and perimeter protection measures',
    order: 2,
  },
  {
    id: 'parking_facilities',
    name: 'Parking Facilities',
    description: 'Parking area security, access control, and employee safety measures',
    order: 3,
  },
  {
    id: 'building_entry',
    name: 'Building Entry Points',
    description: 'Main entry access control, visitor management, and entry point security',
    order: 4,
  },
  {
    id: 'interior_access',
    name: 'Interior Access Control',
    description: 'Zone-based access, executive areas, server rooms, and internal security',
    order: 5,
  },
  {
    id: 'surveillance',
    name: 'Surveillance Systems',
    description: 'CCTV coverage, video retention, monitoring, and analytics capabilities',
    order: 6,
  },
  {
    id: 'intrusion_detection',
    name: 'Intrusion Detection',
    description: 'Burglar alarm systems, sensors, monitoring, and response procedures',
    order: 7,
  },
  {
    id: 'personnel',
    name: 'Security Personnel & Procedures',
    description: 'Security staffing, training, policies, and organizational security',
    order: 8,
  },
  {
    id: 'emergency',
    name: 'Emergency Preparedness',
    description: 'Emergency plans, drills, notification systems, and response capabilities',
    order: 9,
  },
  {
    id: 'incident_history',
    name: 'Incident History Analysis',
    description: 'Past security incidents, trends, and incident tracking',
    order: 10,
  },
  {
    id: 'cyber_physical',
    name: 'Cyber-Physical Security',
    description: 'Network segregation, system security, and physical/cyber integration',
    order: 11,
  },
  {
    id: 'document_security',
    name: 'Document & Data Security',
    description: 'Clean desk policy, document destruction, and physical data protection',
    order: 12,
  },
  {
    id: 'loading_dock',
    name: 'Loading Dock & Receiving',
    description: 'Loading dock access, delivery verification, and receiving area security',
    order: 13,
  },
];

// ============================================================================
// MASTER QUESTION ARRAY
// ============================================================================

export const OFFICE_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  ...SECTION_1_FACILITY_OVERVIEW,
  ...SECTION_2_PERIMETER_SECURITY,
  ...SECTION_3_PARKING_FACILITIES,
  ...SECTION_4_BUILDING_ENTRY,
  ...SECTION_5_INTERIOR_ACCESS,
  ...SECTION_6_SURVEILLANCE,
  ...SECTION_7_INTRUSION_DETECTION,
  ...SECTION_8_PERSONNEL,
  ...SECTION_9_EMERGENCY,
  ...SECTION_10_INCIDENT_HISTORY,
  ...SECTION_11_CYBER_PHYSICAL,
  ...SECTION_12_DOCUMENT_SECURITY,
  ...SECTION_13_LOADING_DOCK,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get questions by section
 */
export function getQuestionsBySection(section: OfficeSection): InterviewQuestion[] {
  return OFFICE_INTERVIEW_QUESTIONS.filter(q => q.section === section);
}

/**
 * Get a question by ID
 */
export function getQuestionById(id: string): InterviewQuestion | undefined {
  for (const question of OFFICE_INTERVIEW_QUESTIONS) {
    if (question.id === id) {
      return question;
    }
    if (question.followUpQuestions) {
      const followUp = question.followUpQuestions.find(f => f.id === id);
      if (followUp) {
        return followUp;
      }
    }
  }
  return undefined;
}

/**
 * Get questions that inform a specific threat
 */
export function getQuestionsForThreat(threatId: string): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of OFFICE_INTERVIEW_QUESTIONS) {
    if (question.informsThreat?.includes(threatId)) {
      result.push(question);
    }
    if (question.followUpQuestions) {
      for (const followUp of question.followUpQuestions) {
        if (followUp.informsThreat?.includes(threatId)) {
          result.push(followUp);
        }
      }
    }
  }
  
  return result;
}

/**
 * Get all YES_GOOD questions (controls that should exist)
 */
export function getYesGoodQuestions(): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of OFFICE_INTERVIEW_QUESTIONS) {
    if (question.polarity === 'YES_GOOD') {
      result.push(question);
    }
    if (question.followUpQuestions) {
      for (const followUp of question.followUpQuestions) {
        if (followUp.polarity === 'YES_GOOD') {
          result.push(followUp);
        }
      }
    }
  }
  
  return result;
}

/**
 * Get all YES_BAD questions (incidents that indicate problems)
 */
export function getYesBadQuestions(): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of OFFICE_INTERVIEW_QUESTIONS) {
    if (question.polarity === 'YES_BAD') {
      result.push(question);
    }
    if (question.followUpQuestions) {
      for (const followUp of question.followUpQuestions) {
        if (followUp.polarity === 'YES_BAD') {
          result.push(followUp);
        }
      }
    }
  }
  
  return result;
}

/**
 * Get all RATING questions
 */
export function getRatingQuestions(): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of OFFICE_INTERVIEW_QUESTIONS) {
    if (question.polarity === 'RATING') {
      result.push(question);
    }
    if (question.followUpQuestions) {
      for (const followUp of question.followUpQuestions) {
        if (followUp.polarity === 'RATING') {
          result.push(followUp);
        }
      }
    }
  }
  
  return result;
}

/**
 * Calculate total possible risk weight
 */
export function getTotalPossibleRiskWeight(): number {
  let total = 0;
  
  for (const question of OFFICE_INTERVIEW_QUESTIONS) {
    total += question.riskWeight;
    if (question.followUpQuestions) {
      for (const followUp of question.followUpQuestions) {
        total += followUp.riskWeight;
      }
    }
  }
  
  return total;
}

/**
 * Get flattened list of all questions including follow-ups
 */
export function getAllQuestionsFlattened(): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of OFFICE_INTERVIEW_QUESTIONS) {
    result.push(question);
    if (question.followUpQuestions) {
      result.push(...question.followUpQuestions);
    }
  }
  
  return result;
}

/**
 * Get question count by section (including follow-ups)
 */
export function getQuestionCountBySection(): Record<OfficeSection, number> {
  const counts = {} as Record<OfficeSection, number>;
  
  for (const section of OFFICE_SECTIONS) {
    const questions = getQuestionsBySection(section);
    let count = questions.length;
    
    for (const q of questions) {
      if (q.followUpQuestions) {
        count += q.followUpQuestions.length;
      }
    }
    
    counts[section] = count;
  }
  
  return counts;
}

/**
 * Get section metadata by ID
 */
export function getSectionMetadataById(sectionId: string): SectionMetadata | undefined {
  return OFFICE_SECTION_METADATA.find(s => s.id === sectionId);
}

/**
 * Get section metadata by name
 */
export function getSectionMetadataByName(sectionName: OfficeSection): SectionMetadata | undefined {
  return OFFICE_SECTION_METADATA.find(s => s.name === sectionName);
}

// ============================================================================
// VALIDATION & STATISTICS
// ============================================================================

/**
 * Validate questionnaire integrity
 */
export function validateQuestionnaire(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  
  const allQuestions = getAllQuestionsFlattened();
  
  for (const question of allQuestions) {
    // Check for duplicate IDs
    if (seenIds.has(question.id)) {
      errors.push(`Duplicate question ID: ${question.id}`);
    }
    seenIds.add(question.id);
    
    // Check required fields
    if (!question.questionText) {
      errors.push(`Missing questionText for ${question.id}`);
    }
    if (!question.questionType) {
      errors.push(`Missing questionType for ${question.id}`);
    }
    if (!question.section) {
      errors.push(`Missing section for ${question.id}`);
    }
    if (question.polarity === undefined) {
      errors.push(`Missing polarity for ${question.id}`);
    }
    if (question.riskWeight === undefined) {
      errors.push(`Missing riskWeight for ${question.id}`);
    }
    
    // Validate section is in OFFICE_SECTIONS
    if (!OFFICE_SECTIONS.includes(question.section as OfficeSection)) {
      errors.push(`Invalid section "${question.section}" for ${question.id}`);
    }
    
    // Check multiple_choice has options
    if (question.questionType === 'multiple_choice' && !question.options?.length) {
      errors.push(`Missing options for multiple_choice question ${question.id}`);
    }
    
    // Check checklist has options
    if (question.questionType === 'checklist' && !question.options?.length) {
      errors.push(`Missing options for checklist question ${question.id}`);
    }
    
    // Check rating has scale
    if (question.questionType === 'rating' && !question.ratingScale) {
      errors.push(`Missing ratingScale for rating question ${question.id}`);
    }
    
    // Check condition references valid question
    if (question.condition) {
      const parentExists = seenIds.has(question.condition.questionId) ||
        OFFICE_INTERVIEW_QUESTIONS.some(q => q.id === question.condition!.questionId);
      if (!parentExists) {
        errors.push(`Invalid condition reference in ${question.id}: ${question.condition.questionId}`);
      }
    }
    
    // Check badAnswers exist in options for multiple_choice
    if (question.polarity === 'MULTIPLE_CHOICE' && question.badAnswers && question.options) {
      for (const badAnswer of question.badAnswers) {
        if (!question.options.includes(badAnswer)) {
          errors.push(`Bad answer "${badAnswer}" not found in options for ${question.id}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get comprehensive questionnaire statistics
 */
export function getQuestionnaireStats(): {
  totalQuestions: number;
  topLevelQuestions: number;
  followUpQuestions: number;
  questionsByType: Record<string, number>;
  questionsByPolarity: Record<string, number>;
  totalRiskWeight: number;
  sectionCounts: Record<OfficeSection, number>;
  yesGoodCount: number;
  yesBadCount: number;
  ratingCount: number;
  threatCoverage: Record<string, number>;
} {
  const allQuestions = getAllQuestionsFlattened();
  
  const questionsByType: Record<string, number> = {};
  const questionsByPolarity: Record<string, number> = {};
  const threatCoverage: Record<string, number> = {};
  
  for (const q of allQuestions) {
    questionsByType[q.questionType] = (questionsByType[q.questionType] || 0) + 1;
    questionsByPolarity[q.polarity] = (questionsByPolarity[q.polarity] || 0) + 1;
    
    if (q.informsThreat) {
      for (const threat of q.informsThreat) {
        threatCoverage[threat] = (threatCoverage[threat] || 0) + 1;
      }
    }
  }
  
  let followUpCount = 0;
  for (const q of OFFICE_INTERVIEW_QUESTIONS) {
    if (q.followUpQuestions) {
      followUpCount += q.followUpQuestions.length;
    }
  }
  
  return {
    totalQuestions: allQuestions.length,
    topLevelQuestions: OFFICE_INTERVIEW_QUESTIONS.length,
    followUpQuestions: followUpCount,
    questionsByType,
    questionsByPolarity,
    totalRiskWeight: getTotalPossibleRiskWeight(),
    sectionCounts: getQuestionCountBySection(),
    yesGoodCount: getYesGoodQuestions().length,
    yesBadCount: getYesBadQuestions().length,
    ratingCount: getRatingQuestions().length,
    threatCoverage,
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default OFFICE_INTERVIEW_QUESTIONS;
