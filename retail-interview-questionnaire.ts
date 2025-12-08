/**
 * Retail Store Interview Questionnaire
 * 
 * Complete interview question definitions for retail store security assessments.
 * Implements risk polarity logic per RiskFixer-Retail-Store-Questions-With-Polarity.md
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Retail-Store-Framework.md
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface InterviewQuestion {
  id: string;
  section: string;
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
}

// ============================================================================
// SECTION DEFINITIONS
// ============================================================================

export const RETAIL_SECTIONS = [
  'Store Profile & Operations',
  'Shrinkage & Loss History',
  'Electronic Article Surveillance (EAS)',
  'Video Surveillance (CCTV)',
  'Cash Handling & Safe Security',
  'Physical Security & Access Control',
  'Loss Prevention Staffing',
  'Employee Procedures & Training',
  'Merchandise Protection',
  'Refund & Return Policies',
  'Neighborhood & External Factors',
] as const;

export type RetailSection = typeof RETAIL_SECTIONS[number];

// ============================================================================
// SECTION 1: STORE PROFILE & OPERATIONS (8 questions)
// ============================================================================

const STORE_PROFILE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'store_profile_1',
    section: 'Store Profile & Operations',
    questionText: 'What is your store format?',
    questionType: 'multiple_choice',
    options: [
      'Big box / warehouse store',
      'Department store',
      'Specialty retail (apparel, shoes, accessories)',
      'Electronics/appliance store',
      'Grocery/supermarket',
      'Drug store/pharmacy',
      'Convenience store',
      'Jewelry store',
      'Home improvement',
      'Discount/dollar store',
      'Other',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['shoplifting', 'organized_retail_crime', 'armed_robbery', 'smash_and_grab'],
    informsImpact: true,
  },
  {
    id: 'store_profile_2',
    section: 'Store Profile & Operations',
    questionText: 'What is your approximate annual revenue?',
    questionType: 'multiple_choice',
    options: [
      'Under $1 million',
      '$1-5 million',
      '$5-15 million',
      '$15-50 million',
      'Over $50 million',
      'Prefer not to disclose',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
  },
  {
    id: 'store_profile_3',
    section: 'Store Profile & Operations',
    questionText: 'What is the total square footage of your sales floor?',
    questionType: 'number',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['shoplifting', 'organized_retail_crime'],
  },
  {
    id: 'store_profile_4',
    section: 'Store Profile & Operations',
    questionText: 'How many employees work at this location?',
    questionType: 'multiple_choice',
    options: [
      '1-10 employees',
      '11-25 employees',
      '26-50 employees',
      '51-100 employees',
      '100+ employees',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['employee_theft'],
    informsVulnerability: true,
  },
  {
    id: 'store_profile_5',
    section: 'Store Profile & Operations',
    questionText: 'What are your typical operating hours?',
    questionType: 'multiple_choice',
    options: [
      'Standard retail (9am-9pm)',
      'Extended hours (6am-midnight)',
      '24 hours',
      'Limited hours (under 10 hours/day)',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['armed_robbery', 'customer_violence'],
    informsVulnerability: true,
  },
  {
    id: 'store_profile_6',
    section: 'Store Profile & Operations',
    questionText: 'What is your store location type?',
    questionType: 'multiple_choice',
    options: [
      'Enclosed mall',
      'Strip mall/shopping center',
      'Standalone building',
      'Downtown/Urban street front',
      'Suburban retail plaza',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Standalone building', 'Downtown/Urban street front'],
    riskWeight: 1,
    riskIndicators: ['standalone', 'urban street'],
    informsThreat: ['armed_robbery', 'smash_and_grab', 'after_hours_burglary', 'vandalism'],
    informsVulnerability: true,
  },
  {
    id: 'store_profile_7',
    section: 'Store Profile & Operations',
    questionText: 'What is the approximate value of merchandise on the sales floor at any given time?',
    questionType: 'multiple_choice',
    options: [
      'Under $50,000',
      '$50,000-$250,000',
      '$250,000-$1 million',
      '$1-5 million',
      'Over $5 million',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
    informsThreat: ['shoplifting', 'organized_retail_crime', 'after_hours_burglary'],
  },
  {
    id: 'store_profile_8',
    section: 'Store Profile & Operations',
    questionText: 'Do you sell high-value merchandise (individual items over $200)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['organized_retail_crime', 'armed_robbery', 'smash_and_grab'],
    followUpQuestions: [
      {
        id: 'store_profile_8a',
        section: 'Store Profile & Operations',
        questionText: 'What high-value categories do you carry? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Electronics (phones, tablets, laptops)',
          'Jewelry/watches',
          'Designer apparel/accessories',
          'Firearms/ammunition',
          'Power tools',
          'Baby formula',
          'Fragrances/cosmetics',
          'Over-the-counter medications',
          'Alcohol/tobacco',
          'Sporting goods',
          'Other',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        riskIndicators: ['electronics', 'jewelry', 'firearms', 'baby formula'],
        condition: {
          questionId: 'store_profile_8',
          expectedValue: 'yes',
        },
        informsThreat: ['organized_retail_crime', 'shoplifting', 'smash_and_grab'],
      },
    ],
  },
];

// ============================================================================
// SECTION 2: SHRINKAGE & LOSS HISTORY (7 questions + follow-ups)
// ============================================================================

const SHRINKAGE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'shrinkage_1',
    section: 'Shrinkage & Loss History',
    questionText: 'What was your shrinkage rate last year (as % of sales)?',
    questionType: 'multiple_choice',
    options: [
      'Under 1% (excellent)',
      '1-2% (acceptable)',
      '2-3% (elevated)',
      '3-5% (concerning)',
      'Over 5% (critical)',
      'Unknown/Not tracked',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['3-5% (concerning)', 'Over 5% (critical)', 'Unknown/Not tracked'],
    riskWeight: 2,
    riskIndicators: ['3-5%', 'over 5%', 'unknown'],
    informsThreat: ['shoplifting', 'employee_theft', 'organized_retail_crime', 'inventory_shrinkage'],
    informsVulnerability: true,
  },
  {
    id: 'shrinkage_2',
    section: 'Shrinkage & Loss History',
    questionText: 'Based on your analysis, what are the primary causes of shrinkage? (Rank top 3)',
    questionType: 'checklist',
    options: [
      'External theft (shoplifting)',
      'Internal theft (employees)',
      'Organized retail crime',
      'Administrative/paperwork errors',
      'Vendor fraud',
      'Damage/waste',
      'Unknown',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['shoplifting', 'employee_theft', 'organized_retail_crime', 'inventory_shrinkage'],
  },
  {
    id: 'shrinkage_3',
    section: 'Shrinkage & Loss History',
    questionText: 'How many shoplifting incidents were reported in the past 12 months?',
    questionType: 'multiple_choice',
    options: [
      'None',
      '1-5 incidents',
      '6-15 incidents',
      '16-30 incidents',
      '30+ incidents',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['16-30 incidents', '30+ incidents'],
    riskWeight: 2,
    riskIndicators: ['16-30', '30+'],
    informsThreat: ['shoplifting'],
    informsVulnerability: true,
  },
  {
    id: 'shrinkage_4',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced organized retail crime (ORC) in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['organized_retail_crime'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'shrinkage_4a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many ORC incidents occurred?',
        questionType: 'multiple_choice',
        options: [
          '0 incidents',
          '1-2 incidents',
          '3-5 incidents',
          '6-10 incidents',
          '10+ incidents',
          'Unknown',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['6-10 incidents', '10+ incidents'],
        riskWeight: 1,
        riskIndicators: ['6-10', '10+'],
        condition: {
          questionId: 'shrinkage_4',
          expectedValue: 'yes',
        },
        informsThreat: ['organized_retail_crime'],
      },
      {
        id: 'shrinkage_4b',
        section: 'Shrinkage & Loss History',
        questionText: 'What was the approximate total loss from ORC?',
        questionType: 'multiple_choice',
        options: [
          'Under $5,000',
          '$5,000-$25,000',
          '$25,000-$100,000',
          'Over $100,000',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'shrinkage_4',
          expectedValue: 'yes',
        },
        informsThreat: ['organized_retail_crime'],
        informsImpact: true,
      },
    ],
  },
  {
    id: 'shrinkage_5',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you had any confirmed employee theft incidents in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['employee_theft', 'cash_handling_theft'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'shrinkage_5a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many employee theft cases?',
        questionType: 'number',
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'shrinkage_5',
          expectedValue: 'yes',
        },
        informsThreat: ['employee_theft'],
      },
      {
        id: 'shrinkage_5b',
        section: 'Shrinkage & Loss History',
        questionText: 'What type of employee theft occurred? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Cash theft from registers',
          'Merchandise theft',
          'Sweethearting (giving discounts to friends)',
          'Refund/void abuse',
          'Time theft',
          'Collusion with external parties',
          'Other',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'shrinkage_5',
          expectedValue: 'yes',
        },
        informsThreat: ['employee_theft', 'cash_handling_theft', 'return_fraud'],
      },
    ],
  },
  {
    id: 'shrinkage_6',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced a robbery in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 2,
    informsThreat: ['armed_robbery'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'shrinkage_6a',
        section: 'Shrinkage & Loss History',
        questionText: 'When was the most recent robbery?',
        questionType: 'multiple_choice',
        options: [
          'Within past 6 months',
          '6-12 months ago',
          '1-2 years ago',
          '2-5 years ago',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Within past 6 months', '6-12 months ago'],
        riskWeight: 1,
        riskIndicators: ['within past 6 months', '6-12 months'],
        condition: {
          questionId: 'shrinkage_6',
          expectedValue: 'yes',
        },
        informsThreat: ['armed_robbery'],
      },
      {
        id: 'shrinkage_6b',
        section: 'Shrinkage & Loss History',
        questionText: 'Was the robbery armed?',
        questionType: 'yes_no',
        required: true,
        polarity: 'YES_BAD',
        badAnswers: ['yes'],
        riskWeight: 1,
        condition: {
          questionId: 'shrinkage_6',
          expectedValue: 'yes',
        },
        informsThreat: ['armed_robbery'],
      },
    ],
  },
  {
    id: 'shrinkage_7',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced a burglary (after-hours break-in) in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['after_hours_burglary', 'smash_and_grab'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'shrinkage_7a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many burglaries?',
        questionType: 'number',
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'shrinkage_7',
          expectedValue: 'yes',
        },
        informsThreat: ['after_hours_burglary'],
      },
    ],
  },
];

// ============================================================================
// SECTION 3: ELECTRONIC ARTICLE SURVEILLANCE (EAS) (5 questions)
// ============================================================================

const EAS_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'eas_1',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'Do you have an EAS (security tag) system installed?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsThreat: ['shoplifting', 'organized_retail_crime'],
    informsVulnerability: true,
    suggestsControls: ['eas_system_tags', 'eas_system_gates'],
    followUpQuestions: [
      {
        id: 'eas_1a',
        section: 'Electronic Article Surveillance (EAS)',
        questionText: 'What type of EAS system?',
        questionType: 'multiple_choice',
        options: [
          'RF (Radio Frequency)',
          'AM (Acousto-Magnetic)',
          'EM (Electromagnetic)',
          'RFID-based',
          'Unsure',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'eas_1',
          expectedValue: 'yes',
        },
      },
      {
        id: 'eas_1b',
        section: 'Electronic Article Surveillance (EAS)',
        questionText: 'Are EAS gates installed at all public exits?',
        questionType: 'yes_no',
        required: true,
        polarity: 'YES_GOOD',
        badAnswers: ['no'],
        riskWeight: 1,
        riskIndicators: ['no'],
        condition: {
          questionId: 'eas_1',
          expectedValue: 'yes',
        },
        informsThreat: ['shoplifting'],
        informsVulnerability: true,
        suggestsControls: ['eas_system_gates'],
      },
    ],
  },
  {
    id: 'eas_2',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'What percentage of your merchandise is protected with EAS tags?',
    questionType: 'multiple_choice',
    options: [
      'No EAS system',
      'Under 25% (high-value only)',
      '25-50%',
      '50-75%',
      'Over 75% (most merchandise)',
      '100% (all merchandise)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No EAS system', 'Under 25% (high-value only)'],
    riskWeight: 2,
    riskIndicators: ['no eas', 'under 25%'],
    informsThreat: ['shoplifting', 'organized_retail_crime'],
    informsVulnerability: true,
  },
  {
    id: 'eas_3',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'How do you respond when an EAS alarm sounds?',
    questionType: 'multiple_choice',
    options: [
      'Staff immediately approaches customer politely',
      'Staff observes but rarely approaches',
      'Alarms frequently ignored',
      'No formal procedure',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Staff observes but rarely approaches', 'Alarms frequently ignored', 'No formal procedure'],
    riskWeight: 1,
    riskIndicators: ['rarely approaches', 'frequently ignored', 'no formal'],
    informsThreat: ['shoplifting'],
    informsVulnerability: true,
  },
  {
    id: 'eas_4',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'Are EAS tags properly deactivated/removed at point of sale?',
    questionType: 'multiple_choice',
    options: [
      'Always - rigorous process',
      'Usually - occasional misses',
      'Inconsistent - depends on cashier',
      'Rarely - frequent customer issues',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Inconsistent - depends on cashier', 'Rarely - frequent customer issues'],
    riskWeight: 1,
    riskIndicators: ['inconsistent', 'rarely'],
    informsThreat: ['shoplifting'],
    informsVulnerability: true,
  },
  {
    id: 'eas_5',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'How often do you conduct EAS system testing/maintenance?',
    questionType: 'multiple_choice',
    options: [
      'Daily testing',
      'Weekly testing',
      'Monthly maintenance',
      'Quarterly/Annual service only',
      'Rarely/Never',
      'Only when problems arise',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely/Never', 'Only when problems arise'],
    riskWeight: 1,
    riskIndicators: ['rarely', 'only when problems'],
    informsThreat: ['shoplifting'],
    informsVulnerability: true,
  },
];

// ============================================================================
// SECTION 4: VIDEO SURVEILLANCE (CCTV) (6 questions)
// ============================================================================

const CCTV_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'cctv_1',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Do you have a CCTV system installed?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsThreat: ['shoplifting', 'employee_theft', 'armed_robbery', 'organized_retail_crime'],
    informsVulnerability: true,
    suggestsControls: ['cctv_sales_floor', 'cctv_entrance_exit', 'cctv_pos_registers'],
    followUpQuestions: [
      {
        id: 'cctv_1a',
        section: 'Video Surveillance (CCTV)',
        questionText: 'How many cameras are installed?',
        questionType: 'multiple_choice',
        options: [
          '1-5 cameras',
          '6-15 cameras',
          '16-30 cameras',
          '31-50 cameras',
          '50+ cameras',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'cctv_1',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
      },
      {
        id: 'cctv_1b',
        section: 'Video Surveillance (CCTV)',
        questionText: 'What is the video recording retention period?',
        questionType: 'multiple_choice',
        options: [
          'Less than 7 days',
          '7-14 days',
          '15-30 days',
          '31-60 days',
          '60+ days',
          'Cloud-based (unlimited)',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Less than 7 days'],
        riskWeight: 1,
        riskIndicators: ['less than 7 days'],
        condition: {
          questionId: 'cctv_1',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'cctv_2',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Which areas have camera coverage? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Sales floor',
      'POS registers/checkout',
      'Entrances/exits',
      'Stockroom',
      'Cash office',
      'Loading dock/receiving',
      'Parking lot',
      'Dressing rooms (exterior only)',
      'High-value merchandise areas',
      'Employee break room',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['shoplifting', 'employee_theft', 'cash_handling_theft'],
    informsVulnerability: true,
  },
  {
    id: 'cctv_3',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Can you clearly identify faces and read license plates in your current footage?',
    questionType: 'multiple_choice',
    options: [
      'Yes - high resolution throughout',
      'Mostly - some areas need upgrade',
      'Rarely - resolution too low',
      'No - cameras are mostly deterrent',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely - resolution too low', 'No - cameras are mostly deterrent'],
    riskWeight: 1,
    riskIndicators: ['rarely', 'no - cameras'],
    informsThreat: ['shoplifting', 'armed_robbery', 'parking_lot_crime'],
    informsVulnerability: true,
  },
  {
    id: 'cctv_4',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Is CCTV footage actively monitored?',
    questionType: 'multiple_choice',
    options: [
      'Live monitoring during all operating hours',
      'Monitored during peak hours only',
      'Spot-checked periodically',
      'Reviewed only after incidents',
      'Rarely reviewed',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely reviewed'],
    riskWeight: 1,
    riskIndicators: ['rarely reviewed'],
    informsThreat: ['shoplifting', 'employee_theft'],
    informsVulnerability: true,
  },
  {
    id: 'cctv_5',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Do you have a point-of-sale (POS) exception reporting system?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['employee_theft', 'cash_handling_theft', 'return_fraud'],
    informsVulnerability: true,
    suggestsControls: ['pos_exception_reporting'],
    followUpQuestions: [
      {
        id: 'cctv_5a',
        section: 'Video Surveillance (CCTV)',
        questionText: 'How often do you review POS exception reports?',
        questionType: 'multiple_choice',
        options: [
          'Daily',
          'Weekly',
          'Monthly',
          'Quarterly',
          'Rarely',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Rarely'],
        riskWeight: 1,
        riskIndicators: ['rarely'],
        condition: {
          questionId: 'cctv_5',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'cctv_6',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Rate the overall effectiveness of your current CCTV system',
    questionType: 'rating',
    ratingScale: {
      min: 1,
      max: 5,
      labels: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'],
    },
    required: true,
    polarity: 'RATING',
    ratingBadThreshold: 2,
    riskWeight: 1,
    informsThreat: ['shoplifting', 'employee_theft', 'armed_robbery'],
    informsVulnerability: true,
  },
];

// ============================================================================
// SECTION 5: CASH HANDLING & SAFE SECURITY (8 questions)
// ============================================================================

const CASH_HANDLING_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'cash_1',
    section: 'Cash Handling & Safe Security',
    questionText: 'What is the maximum amount of cash typically in registers during peak hours?',
    questionType: 'multiple_choice',
    options: [
      'Under $200 per register',
      '$200-$500 per register',
      '$500-$1,000 per register',
      '$1,000-$2,000 per register',
      'Over $2,000 per register',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Over $2,000 per register'],
    riskWeight: 2,
    riskIndicators: ['over $2,000'],
    informsThreat: ['armed_robbery', 'cash_handling_theft'],
    informsVulnerability: true,
    informsImpact: true,
  },
  {
    id: 'cash_2',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you enforce register cash limits with mandatory drops?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['armed_robbery', 'cash_handling_theft'],
    informsVulnerability: true,
    suggestsControls: ['cash_limit_registers', 'drop_safe'],
  },
  {
    id: 'cash_3',
    section: 'Cash Handling & Safe Security',
    questionText: 'What type of safe do you have?',
    questionType: 'multiple_choice',
    options: [
      'No safe',
      'Basic safe (key lock)',
      'Combination safe',
      'Electronic keypad safe',
      'Drop safe (time-delay)',
      'TL-rated commercial safe',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No safe', 'Basic safe (key lock)'],
    riskWeight: 2,
    riskIndicators: ['no safe', 'basic safe'],
    informsThreat: ['armed_robbery', 'cash_handling_theft', 'after_hours_burglary'],
    informsVulnerability: true,
    suggestsControls: ['drop_safe', 'time_delay_safe'],
  },
  {
    id: 'cash_4',
    section: 'Cash Handling & Safe Security',
    questionText: 'How many people have access to the safe combination?',
    questionType: 'multiple_choice',
    options: [
      '1-2 people (management only)',
      '3-5 people',
      'More than 5 people',
      'No safe / Not applicable',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['More than 5 people', 'No safe / Not applicable'],
    riskWeight: 1,
    riskIndicators: ['more than 5', 'no safe'],
    informsThreat: ['cash_handling_theft', 'employee_theft'],
    informsVulnerability: true,
  },
  {
    id: 'cash_5',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you use armored car service for bank deposits?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['armed_robbery', 'cash_handling_theft'],
    informsVulnerability: true,
    suggestsControls: ['armored_car_service'],
    followUpQuestions: [
      {
        id: 'cash_5a',
        section: 'Cash Handling & Safe Security',
        questionText: 'How often does armored car pick up?',
        questionType: 'multiple_choice',
        options: [
          'Daily',
          'Every other day',
          'Weekly',
          'As needed',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'cash_5',
          expectedValue: 'yes',
        },
      },
    ],
  },
  {
    id: 'cash_6',
    section: 'Cash Handling & Safe Security',
    questionText: 'If you make manual bank deposits, what procedures do you follow?',
    questionType: 'multiple_choice',
    options: [
      'Not applicable - armored car only',
      'Two-person minimum, varied routes/times',
      'Two-person minimum, predictable schedule',
      'Single person, varied schedule',
      'Single person, predictable schedule',
      'No formal procedure',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Single person, predictable schedule', 'No formal procedure'],
    riskWeight: 2,
    riskIndicators: ['single person, predictable', 'no formal'],
    informsThreat: ['armed_robbery', 'cash_handling_theft'],
    informsVulnerability: true,
  },
  {
    id: 'cash_7',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you have dual-control procedures for cash office activities?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['cash_handling_theft', 'employee_theft'],
    informsVulnerability: true,
    suggestsControls: ['dual_control_cash_procedures'],
  },
  {
    id: 'cash_8',
    section: 'Cash Handling & Safe Security',
    questionText: 'Are cash handling procedures clearly documented and trained?',
    questionType: 'multiple_choice',
    options: [
      'Formal written procedures with annual training',
      'Written procedures, training at hire only',
      'Informal procedures, no documentation',
      'No formal procedures',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal procedures, no documentation', 'No formal procedures'],
    riskWeight: 1,
    riskIndicators: ['informal', 'no formal'],
    informsThreat: ['cash_handling_theft', 'employee_theft'],
    informsVulnerability: true,
  },
];

// ============================================================================
// SECTION 6: PHYSICAL SECURITY & ACCESS CONTROL (7 questions)
// ============================================================================

const PHYSICAL_SECURITY_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'physical_1',
    section: 'Physical Security & Access Control',
    questionText: 'What type of storefront do you have?',
    questionType: 'multiple_choice',
    options: [
      'Full glass storefront',
      'Partial glass with solid walls',
      'Mostly solid construction with display windows',
      'Enclosed mall entrance',
      'Interior mall location',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['smash_and_grab', 'after_hours_burglary', 'vandalism'],
    informsVulnerability: true,
  },
  {
    id: 'physical_2',
    section: 'Physical Security & Access Control',
    questionText: 'Are your entry doors reinforced or do you use security gates after hours?',
    questionType: 'multiple_choice',
    options: [
      'Steel security gates that fully cover',
      'Reinforced doors with deadbolts',
      'Security film on glass doors',
      'Standard doors with security gates',
      'Standard doors, no gates',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Standard doors, no gates'],
    riskWeight: 2,
    riskIndicators: ['standard doors'],
    informsThreat: ['after_hours_burglary', 'smash_and_grab'],
    informsVulnerability: true,
    suggestsControls: ['reinforced_entrance_doors', 'security_gates_after_hours'],
  },
  {
    id: 'physical_3',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have bollards or barriers protecting your storefront from vehicle impact?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['smash_and_grab', 'armed_robbery'],
    informsVulnerability: true,
    suggestsControls: ['bollards_storefront_protection'],
  },
  {
    id: 'physical_4',
    section: 'Physical Security & Access Control',
    questionText: 'How do you control access to stockrooms and back-of-house areas?',
    questionType: 'multiple_choice',
    options: [
      'Electronic access control (badge/key card)',
      'Keyed locks with strict key control',
      'Keyed locks with loose key control',
      'Unlocked during business hours',
      'No access control',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Keyed locks with loose key control', 'Unlocked during business hours', 'No access control'],
    riskWeight: 2,
    riskIndicators: ['loose key control', 'unlocked', 'no access'],
    informsThreat: ['employee_theft', 'organized_retail_crime'],
    informsVulnerability: true,
    suggestsControls: ['stockroom_access_control'],
  },
  {
    id: 'physical_5',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have an intrusion alarm system?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsThreat: ['after_hours_burglary', 'smash_and_grab'],
    informsVulnerability: true,
    suggestsControls: ['alarm_system_intrusion'],
    followUpQuestions: [
      {
        id: 'physical_5a',
        section: 'Physical Security & Access Control',
        questionText: 'Is the alarm system monitored?',
        questionType: 'multiple_choice',
        options: [
          'Central station monitoring 24/7',
          'Central station during closed hours only',
          'Self-monitored (notifications to owner)',
          'No - local alarm only',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['No - local alarm only'],
        riskWeight: 1,
        riskIndicators: ['local alarm only'],
        condition: {
          questionId: 'physical_5',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
      },
      {
        id: 'physical_5b',
        section: 'Physical Security & Access Control',
        questionText: 'How many false alarms have you had in the past 12 months?',
        questionType: 'multiple_choice',
        options: [
          'None',
          '1-3',
          '4-10',
          'More than 10',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['More than 10'],
        riskWeight: 1,
        riskIndicators: ['more than 10'],
        condition: {
          questionId: 'physical_5',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'physical_6',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have panic/duress alarms for employees?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['armed_robbery', 'customer_violence'],
    informsVulnerability: true,
    suggestsControls: ['alarm_system_panic_buttons'],
    followUpQuestions: [
      {
        id: 'physical_6a',
        section: 'Physical Security & Access Control',
        questionText: 'Where are panic buttons located? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Cash registers/POS stations',
          'Cash office/back room',
          'Manager\'s office',
          'Customer service desk',
          'Mobile/wireless panic buttons',
          'Under counters (hidden)',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'physical_6',
          expectedValue: 'yes',
        },
      },
    ],
  },
  {
    id: 'physical_7',
    section: 'Physical Security & Access Control',
    questionText: 'Rate the overall physical security of your facility',
    questionType: 'rating',
    ratingScale: {
      min: 1,
      max: 5,
      labels: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'],
    },
    required: true,
    polarity: 'RATING',
    ratingBadThreshold: 2,
    riskWeight: 1,
    informsThreat: ['after_hours_burglary', 'smash_and_grab', 'vandalism'],
    informsVulnerability: true,
  },
];

// ============================================================================
// SECTION 7: LOSS PREVENTION STAFFING (5 questions)
// ============================================================================

const LP_STAFFING_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'lp_staff_1',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you employ dedicated loss prevention staff?',
    questionType: 'multiple_choice',
    options: [
      'Full-time dedicated LP staff',
      'Part-time or shared LP staff',
      'Contract security/LP services',
      'No - store staff handles LP duties',
      'No dedicated LP resources',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No - store staff handles LP duties', 'No dedicated LP resources'],
    riskWeight: 2,
    riskIndicators: ['no - store staff', 'no dedicated'],
    informsThreat: ['shoplifting', 'organized_retail_crime', 'employee_theft'],
    informsVulnerability: true,
    suggestsControls: ['loss_prevention_plain_clothes', 'security_guard_uniformed'],
  },
  {
    id: 'lp_staff_2',
    section: 'Loss Prevention Staffing',
    questionText: 'If you have LP staff, what are their primary activities? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Floor surveillance (plain clothes)',
      'Floor surveillance (uniformed)',
      'CCTV monitoring',
      'Apprehensions',
      'Investigations',
      'Employee training',
      'Inventory audits',
      'Alarm monitoring',
      'Not applicable',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
  },
  {
    id: 'lp_staff_3',
    section: 'Loss Prevention Staffing',
    questionText: 'What hours do you have LP/security coverage?',
    questionType: 'multiple_choice',
    options: [
      'All operating hours',
      'Peak hours only (weekends, evenings)',
      'Weekdays only',
      'Sporadic/as-needed',
      'No LP coverage',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Sporadic/as-needed', 'No LP coverage'],
    riskWeight: 1,
    riskIndicators: ['sporadic', 'no lp coverage'],
    informsThreat: ['shoplifting', 'organized_retail_crime'],
    informsVulnerability: true,
  },
  {
    id: 'lp_staff_4',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you have a visible security presence (uniformed guard, signage)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['shoplifting', 'armed_robbery', 'customer_violence'],
    informsVulnerability: true,
    suggestsControls: ['security_guard_uniformed', 'signage_security_warnings'],
  },
  {
    id: 'lp_staff_5',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you have a policy of prosecuting all theft cases regardless of value?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['shoplifting', 'organized_retail_crime'],
    informsVulnerability: true,
    suggestsControls: ['signage_prosecution_policy'],
    followUpQuestions: [
      {
        id: 'lp_staff_5a',
        section: 'Loss Prevention Staffing',
        questionText: 'Is this policy posted/visible to customers?',
        questionType: 'yes_no',
        required: true,
        polarity: 'YES_GOOD',
        badAnswers: ['no'],
        riskWeight: 1,
        condition: {
          questionId: 'lp_staff_5',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        suggestsControls: ['signage_prosecution_policy'],
      },
    ],
  },
];

// ============================================================================
// SECTION 8: EMPLOYEE PROCEDURES & TRAINING (9 questions)
// ============================================================================

const EMPLOYEE_PROCEDURES_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'employee_1',
    section: 'Employee Procedures & Training',
    questionText: 'Do you conduct background checks on all new hires?',
    questionType: 'multiple_choice',
    options: [
      'Comprehensive (criminal, credit, references)',
      'Criminal background only',
      'Reference checks only',
      'Management positions only',
      'No background checks',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No background checks'],
    riskWeight: 1,
    riskIndicators: ['no background'],
    informsThreat: ['employee_theft', 'cash_handling_theft'],
    informsVulnerability: true,
    suggestsControls: ['employee_background_checks'],
  },
  {
    id: 'employee_2',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees receive theft awareness training?',
    questionType: 'multiple_choice',
    options: [
      'Comprehensive initial + refresher training',
      'Initial training at hire',
      'Informal on-the-job guidance',
      'No formal training',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal on-the-job guidance', 'No formal training'],
    riskWeight: 1,
    riskIndicators: ['informal', 'no formal'],
    informsThreat: ['shoplifting', 'employee_theft'],
    informsVulnerability: true,
    suggestsControls: ['employee_training_fraud_awareness'],
  },
  {
    id: 'employee_3',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees receive robbery response training?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['armed_robbery', 'customer_violence'],
    informsVulnerability: true,
    suggestsControls: ['robbery_response_training'],
    followUpQuestions: [
      {
        id: 'employee_3a',
        section: 'Employee Procedures & Training',
        questionText: 'How often is robbery response training reinforced?',
        questionType: 'multiple_choice',
        options: [
          'Quarterly drills/refreshers',
          'Annual refresher',
          'Initial training only',
          'Not tracked',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'employee_3',
          expectedValue: 'yes',
        },
      },
    ],
  },
  {
    id: 'employee_4',
    section: 'Employee Procedures & Training',
    questionText: 'What is your policy when employees observe theft?',
    questionType: 'multiple_choice',
    options: [
      'Clear written policy - observe and report only',
      'Verbal guidance - do not confront',
      'Employees may approach customer',
      'No clear policy',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No clear policy'],
    riskWeight: 1,
    riskIndicators: ['no clear policy'],
    informsThreat: ['shoplifting', 'customer_violence'],
    informsVulnerability: true,
  },
  {
    id: 'employee_5',
    section: 'Employee Procedures & Training',
    questionText: 'Do you have a two-person closing procedure policy?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['armed_robbery', 'cash_handling_theft'],
    informsVulnerability: true,
    suggestsControls: ['closing_procedures_two_person'],
  },
  {
    id: 'employee_6',
    section: 'Employee Procedures & Training',
    questionText: 'Do you inspect employee bags/packages when they leave?',
    questionType: 'multiple_choice',
    options: [
      'Routine inspection of all employees',
      'Random inspections',
      'Rarely - only with cause',
      'No inspections',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely - only with cause', 'No inspections'],
    riskWeight: 1,
    riskIndicators: ['rarely', 'no inspections'],
    informsThreat: ['employee_theft'],
    informsVulnerability: true,
    suggestsControls: ['bag_check_policy', 'employee_package_inspection'],
  },
  {
    id: 'employee_7',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees use a separate entrance/exit from customers?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 0,
    informsThreat: ['employee_theft'],
    informsVulnerability: true,
  },
  {
    id: 'employee_8',
    section: 'Employee Procedures & Training',
    questionText: 'What is your employee discount policy?',
    questionType: 'multiple_choice',
    options: [
      'Formal policy with transaction tracking',
      'Formal policy without tracking',
      'Informal policy',
      'Manager discretion',
      'No employee discounts',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal policy', 'Manager discretion'],
    riskWeight: 1,
    riskIndicators: ['informal', 'manager discretion'],
    informsThreat: ['employee_theft'],
    informsVulnerability: true,
  },
  {
    id: 'employee_9',
    section: 'Employee Procedures & Training',
    questionText: 'How do you handle employee terminations from a security perspective?',
    questionType: 'checklist',
    options: [
      'Immediate access revocation (badges, keys, codes)',
      'Escort off premises',
      'Exit interview with LP',
      'Review recent transactions/inventory',
      'Change alarm codes',
      'No formal security procedures',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No formal security procedures'],
    riskWeight: 1,
    riskIndicators: ['no formal security procedures'],
    informsThreat: ['employee_theft', 'after_hours_burglary'],
    informsVulnerability: true,
  },
];

// ============================================================================
// SECTION 9: MERCHANDISE PROTECTION (6 questions)
// ============================================================================

const MERCHANDISE_PROTECTION_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'merchandise_1',
    section: 'Merchandise Protection',
    questionText: 'How do you secure high-value merchandise on the sales floor?',
    questionType: 'checklist',
    options: [
      'Locked display cases',
      'Cable locks/tethers',
      'Spider wraps/security boxes',
      'Keeper cases',
      'Employee assistance required',
      'High-value in stockroom (display samples only)',
      'No special security measures',
      'N/A - No high-value merchandise',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No special security measures'],
    riskWeight: 2,
    riskIndicators: ['no special security'],
    informsThreat: ['shoplifting', 'organized_retail_crime', 'smash_and_grab'],
    informsVulnerability: true,
    suggestsControls: ['high_value_display_security', 'high_value_lockup', 'display_case_locks'],
  },
  {
    id: 'merchandise_2',
    section: 'Merchandise Protection',
    questionText: 'If you have fitting rooms, how are they monitored?',
    questionType: 'multiple_choice',
    options: [
      'Attendant counts items in/out',
      'Attendant present but no item counting',
      'Employee checks periodically',
      'No monitoring',
      'Not applicable (no fitting rooms)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No monitoring'],
    riskWeight: 1,
    riskIndicators: ['no monitoring'],
    informsThreat: ['shoplifting'],
    informsVulnerability: true,
    suggestsControls: ['dressing_room_attendant'],
  },
  {
    id: 'merchandise_3',
    section: 'Merchandise Protection',
    questionText: 'Do you use retail display fixtures designed with security in mind?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['shoplifting', 'organized_retail_crime'],
    informsVulnerability: true,
    suggestsControls: ['clear_sightlines_sales_floor'],
    followUpQuestions: [
      {
        id: 'merchandise_3a',
        section: 'Merchandise Protection',
        questionText: 'What security-focused fixtures do you use? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Low-profile shelving (visibility)',
          'Angled displays',
          'Security pegs/hooks',
          'Lockable merchandise panels',
          'Security showcase counters',
          'End-cap security fixtures',
          'None required for this store type',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'merchandise_3',
          expectedValue: 'yes',
        },
      },
    ],
  },
  {
    id: 'merchandise_4',
    section: 'Merchandise Protection',
    questionText: 'How visible is your sales floor from checkout positions?',
    questionType: 'multiple_choice',
    options: [
      'Excellent - clear sightlines throughout',
      'Good - most areas visible',
      'Limited - many blind spots',
      'Poor - high shelving/displays block view',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Limited - many blind spots', 'Poor - high shelving/displays block view'],
    riskWeight: 1,
    riskIndicators: ['limited', 'poor'],
    informsThreat: ['shoplifting'],
    informsVulnerability: true,
    suggestsControls: ['clear_sightlines_sales_floor'],
  },
  {
    id: 'merchandise_5',
    section: 'Merchandise Protection',
    questionText: 'Do you use convex mirrors to cover blind spots?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['shoplifting'],
    informsVulnerability: true,
    suggestsControls: ['mirrors_blind_spot_coverage'],
  },
  {
    id: 'merchandise_6',
    section: 'Merchandise Protection',
    questionText: 'How often do you conduct cycle counts/spot inventory audits?',
    questionType: 'multiple_choice',
    options: [
      'Daily (high-value items)',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Only annual inventory',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Only annual inventory'],
    riskWeight: 1,
    riskIndicators: ['only annual'],
    informsThreat: ['shoplifting', 'employee_theft', 'inventory_shrinkage'],
    informsVulnerability: true,
    suggestsControls: ['inventory_audit_cycle_counting'],
  },
];

// ============================================================================
// SECTION 10: REFUND & RETURN POLICIES (4 questions)
// ============================================================================

const REFUND_RETURN_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'refunds_1',
    section: 'Refund & Return Policies',
    questionText: 'What authorization is required for refunds?',
    questionType: 'multiple_choice',
    options: [
      'Manager approval required for all refunds',
      'Manager approval over threshold amount',
      'Cashiers can process independently',
      'No formal policy',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Cashiers can process independently', 'No formal policy'],
    riskWeight: 1,
    riskIndicators: ['cashiers can process', 'no formal policy'],
    informsThreat: ['return_fraud', 'employee_theft'],
    informsVulnerability: true,
    suggestsControls: ['refund_authorization_controls'],
  },
  {
    id: 'refunds_2',
    section: 'Refund & Return Policies',
    questionText: 'Do you require receipts for all returns?',
    questionType: 'multiple_choice',
    options: [
      'Yes - no exceptions',
      'Yes - with limited exceptions (store credit)',
      'No - accept returns without receipts',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No - accept returns without receipts'],
    riskWeight: 1,
    riskIndicators: ['no - accept returns'],
    informsThreat: ['return_fraud'],
    informsVulnerability: true,
    suggestsControls: ['receipt_checking_policy'],
  },
  {
    id: 'refunds_3',
    section: 'Refund & Return Policies',
    questionText: 'Do you track customers who make frequent returns?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['return_fraud'],
    informsVulnerability: true,
    suggestsControls: ['frequent_returner_tracking'],
  },
  {
    id: 'refunds_4',
    section: 'Refund & Return Policies',
    questionText: 'Have you had issues with return fraud in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['return_fraud'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'refunds_4a',
        section: 'Refund & Return Policies',
        questionText: 'What type of return fraud? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Wardrobing (wear and return)',
          'Receipt fraud (fake/altered receipts)',
          'Price tag switching',
          'Return of stolen merchandise',
          'Employee collusion',
          'Cross-retailer returns',
          'Other',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'refunds_4',
          expectedValue: 'yes',
        },
        informsThreat: ['return_fraud'],
      },
    ],
  },
];

// ============================================================================
// SECTION 11: NEIGHBORHOOD & EXTERNAL FACTORS (3 questions)
// ============================================================================

const EXTERNAL_FACTORS_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'external_1',
    section: 'Neighborhood & External Factors',
    questionText: 'How would you characterize the crime level in your immediate area?',
    questionType: 'multiple_choice',
    options: [
      'Low crime area',
      'Moderate crime area',
      'Elevated crime area',
      'High crime area',
      'Very high crime area',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['High crime area', 'Very high crime area'],
    riskWeight: 1,
    riskIndicators: ['high crime', 'very high'],
    informsThreat: ['armed_robbery', 'shoplifting', 'vandalism', 'parking_lot_crime'],
    informsVulnerability: true,
  },
  {
    id: 'external_2',
    section: 'Neighborhood & External Factors',
    questionText: 'Are you aware of organized retail crime (ORC) activity in your area?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    informsThreat: ['organized_retail_crime'],
    informsVulnerability: true,
  },
  {
    id: 'external_3',
    section: 'Neighborhood & External Factors',
    questionText: 'Do neighboring businesses share information about theft/security incidents?',
    questionType: 'multiple_choice',
    options: [
      'Active sharing network/alliance',
      'Informal communication with some neighbors',
      'Rarely - minimal interaction',
      'No communication with other businesses',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely - minimal interaction', 'No communication with other businesses'],
    riskWeight: 1,
    riskIndicators: ['rarely', 'no communication'],
    informsThreat: ['organized_retail_crime', 'shoplifting'],
    informsVulnerability: true,
    suggestsControls: ['orc_task_force_participation'],
  },
];

// ============================================================================
// COMBINED EXPORT
// ============================================================================

/**
 * Complete retail store interview questionnaire
 * 70+ questions organized by 11 sections
 */
export const RETAIL_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  ...STORE_PROFILE_QUESTIONS,
  ...SHRINKAGE_QUESTIONS,
  ...EAS_QUESTIONS,
  ...CCTV_QUESTIONS,
  ...CASH_HANDLING_QUESTIONS,
  ...PHYSICAL_SECURITY_QUESTIONS,
  ...LP_STAFFING_QUESTIONS,
  ...EMPLOYEE_PROCEDURES_QUESTIONS,
  ...MERCHANDISE_PROTECTION_QUESTIONS,
  ...REFUND_RETURN_QUESTIONS,
  ...EXTERNAL_FACTORS_QUESTIONS,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all questions for a specific section
 */
export function getQuestionsBySection(section: RetailSection): InterviewQuestion[] {
  return RETAIL_INTERVIEW_QUESTIONS.filter(q => q.section === section);
}

/**
 * Get a question by ID (including nested follow-ups)
 */
export function getQuestionById(id: string): InterviewQuestion | undefined {
  for (const question of RETAIL_INTERVIEW_QUESTIONS) {
    if (question.id === id) return question;
    if (question.followUpQuestions) {
      const followUp = question.followUpQuestions.find(fq => fq.id === id);
      if (followUp) return followUp;
    }
  }
  return undefined;
}

/**
 * Get all questions that inform a specific threat
 */
export function getQuestionsForThreat(threatId: string): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of RETAIL_INTERVIEW_QUESTIONS) {
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
  
  for (const question of RETAIL_INTERVIEW_QUESTIONS) {
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
  
  for (const question of RETAIL_INTERVIEW_QUESTIONS) {
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
 * Calculate total possible risk weight
 */
export function getTotalPossibleRiskWeight(): number {
  let total = 0;
  
  for (const question of RETAIL_INTERVIEW_QUESTIONS) {
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
  
  for (const question of RETAIL_INTERVIEW_QUESTIONS) {
    result.push(question);
    if (question.followUpQuestions) {
      result.push(...question.followUpQuestions);
    }
  }
  
  return result;
}

/**
 * Get question count by section
 */
export function getQuestionCountBySection(): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const section of RETAIL_SECTIONS) {
    const questions = getQuestionsBySection(section);
    let count = questions.length;
    
    // Count follow-ups
    for (const q of questions) {
      if (q.followUpQuestions) {
        count += q.followUpQuestions.length;
      }
    }
    
    counts[section] = count;
  }
  
  return counts;
}

// ============================================================================
// VALIDATION & STATS
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
        RETAIL_INTERVIEW_QUESTIONS.some(q => q.id === question.condition!.questionId);
      if (!parentExists) {
        errors.push(`Invalid condition reference in ${question.id}: ${question.condition.questionId}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get questionnaire statistics
 */
export function getQuestionnaireStats(): {
  totalQuestions: number;
  topLevelQuestions: number;
  followUpQuestions: number;
  questionsByType: Record<string, number>;
  questionsByPolarity: Record<string, number>;
  totalRiskWeight: number;
  sectionCounts: Record<string, number>;
} {
  const allQuestions = getAllQuestionsFlattened();
  
  const questionsByType: Record<string, number> = {};
  const questionsByPolarity: Record<string, number> = {};
  
  for (const q of allQuestions) {
    questionsByType[q.questionType] = (questionsByType[q.questionType] || 0) + 1;
    questionsByPolarity[q.polarity] = (questionsByPolarity[q.polarity] || 0) + 1;
  }
  
  let followUpCount = 0;
  for (const q of RETAIL_INTERVIEW_QUESTIONS) {
    if (q.followUpQuestions) {
      followUpCount += q.followUpQuestions.length;
    }
  }
  
  return {
    totalQuestions: allQuestions.length,
    topLevelQuestions: RETAIL_INTERVIEW_QUESTIONS.length,
    followUpQuestions: followUpCount,
    questionsByType,
    questionsByPolarity,
    totalRiskWeight: getTotalPossibleRiskWeight(),
    sectionCounts: getQuestionCountBySection(),
  };
}

// Export default for convenience
export default RETAIL_INTERVIEW_QUESTIONS;
