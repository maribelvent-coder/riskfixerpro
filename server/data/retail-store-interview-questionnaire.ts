/**
 * Retail Store Security Assessment Interview Questionnaire
 * 
 * Comprehensive 70+ question framework covering loss prevention, shrinkage control,
 * EAS systems, CCTV, cash handling, merchandise protection, and employee procedures.
 * 
 * Each question includes threat/control mappings for automated risk analysis.
 */

export interface RetailInterviewQuestion {
  id: string;
  section: string;
  zoneApplicable?: string[]; // Sales floor, stockroom, cash office, etc.
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist' | 'number';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: RetailInterviewQuestion[];
  riskIndicators?: string[]; // Keywords that elevate risk
  riskDirection?: 'positive' | 'negative'; // 'positive' = Yes is good (default), 'negative' = Yes is bad (incidents)
  
  // Direct mapping to risk scenarios
  informsThreat?: string[]; // Threat IDs this question informs
  informsVulnerability?: boolean; // Does this assess vulnerability?
  informsImpact?: boolean; // Does this assess potential impact?
  suggestsControls?: string[]; // Control IDs this might reveal need for
}

const section1_storeProfile: RetailInterviewQuestion[] = [
  {
    id: 'store_profile_1',
    section: 'Store Profile & Operations',
    questionText: 'What is your store format?',
    questionType: 'multiple_choice',
    options: [
      'Department store (large format, multiple departments)',
      'Specialty store (focused product category)',
      'Convenience store',
      'Grocery/Supermarket',
      'Pharmacy',
      'Electronics store',
      'Jewelry store',
      'Clothing/Apparel store',
      'Discount/Dollar store',
      'Other (specify in notes)',
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['armed_robbery', 'shoplifting_organized_retail_crime'],
  },

  {
    id: 'store_profile_2',
    section: 'Store Profile & Operations',
    questionText: 'What is your approximate annual revenue?',
    questionType: 'multiple_choice',
    options: [
      'Under $500K',
      '$500K - $1M',
      '$1M - $3M',
      '$3M - $10M',
      'Over $10M',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'store_profile_3',
    section: 'Store Profile & Operations',
    questionText: 'What is the total square footage of your sales floor?',
    questionType: 'number',
    required: true,
    informsImpact: true,
    informsVulnerability: true, // Larger = harder to monitor
  },

  {
    id: 'store_profile_4',
    section: 'Store Profile & Operations',
    questionText: 'How many employees work at this location?',
    questionType: 'multiple_choice',
    options: [
      '1-5 employees',
      '6-15 employees',
      '16-30 employees',
      '31-50 employees',
      '50+ employees',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'store_profile_5',
    section: 'Store Profile & Operations',
    questionText: 'What are your typical operating hours?',
    questionType: 'multiple_choice',
    options: [
      '24 hours',
      'Extended hours (6 AM - 11 PM)',
      'Standard hours (9 AM - 9 PM)',
      'Limited hours (10 AM - 6 PM)',
      'Varies by day',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['armed_robbery', 'workplace_violence_customer'],
  },

  {
    id: 'store_profile_6',
    section: 'Store Profile & Operations',
    questionText: 'What is your store location type?',
    questionType: 'multiple_choice',
    options: [
      'Enclosed shopping mall (interior)',
      'Strip center/Shopping plaza',
      'Standalone building',
      'Downtown/Urban street front',
      'Airport/Transportation hub',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['armed_robbery', 'burglary_after_hours'],
    riskIndicators: ['standalone', 'urban street'],
  },

  {
    id: 'store_profile_7',
    section: 'Store Profile & Operations',
    questionText: 'What is the approximate value of merchandise on the sales floor at any given time?',
    questionType: 'multiple_choice',
    options: [
      'Under $50K',
      '$50K - $150K',
      '$150K - $500K',
      '$500K - $1M',
      'Over $1M',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'store_profile_8',
    section: 'Store Profile & Operations',
    questionText: 'Do you sell high-value merchandise (individual items over $200)?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['shoplifting_organized_retail_crime', 'armed_robbery', 'smash_and_grab'],
    followUpQuestions: [
      {
        id: 'store_profile_8a',
        section: 'Store Profile & Operations',
        questionText: 'What high-value categories do you carry? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Electronics (phones, tablets, laptops)',
          'Jewelry/Watches',
          'Designer handbags/accessories',
          'Cosmetics/Fragrances (premium)',
          'Power tools',
          'Firearms/Ammunition',
          'Alcohol (premium/spirits)',
          'Baby formula (ORC target)',
          'Other',
        ],
        required: true,
        informsImpact: true,
        informsThreat: ['shoplifting_organized_retail_crime'],
      },
    ],
  },
];
const section2_shrinkage: RetailInterviewQuestion[] = [
  {
    id: 'shrinkage_1',
    section: 'Shrinkage & Loss History',
    questionText: 'What was your shrinkage rate last year (as % of sales)?',
    questionType: 'multiple_choice',
    options: [
      'Under 1% (excellent)',
      '1-2% (industry average)',
      '2-3% (above average)',
      '3-5% (concerning)',
      'Over 5% (critical)',
      'Unknown/Not tracked',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['shoplifting_individual', 'employee_theft'],
    riskIndicators: ['3-5%', 'over 5%', 'unknown'],
  },

  {
    id: 'shrinkage_2',
    section: 'Shrinkage & Loss History',
    questionText: 'Based on your analysis, what are the primary causes of shrinkage? (Rank top 3)',
    questionType: 'checklist',
    options: [
      'External theft (shoplifting)',
      'Internal theft (employees)',
      'Administrative errors',
      'Vendor fraud',
      'Damage/spoilage',
      'Unknown shrinkage',
    ],
    required: true,
    informsThreat: ['shoplifting_individual', 'employee_theft'],
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
    informsThreat: ['shoplifting_individual', 'shoplifting_organized_retail_crime'],
    riskIndicators: ['16-30', '30+'],
    riskDirection: 'negative',
  },

  {
    id: 'shrinkage_4',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced organized retail crime (ORC) in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['shoplifting_organized_retail_crime'],
    riskDirection: 'negative',
    followUpQuestions: [
      {
        id: 'shrinkage_4a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many ORC incidents occurred?',
        questionType: 'multiple_choice',
        options: ['1-2', '3-5', '6-10', '10+'],
        required: true,
        riskIndicators: ['6-10', '10+'],
        riskDirection: 'negative',
      },
      {
        id: 'shrinkage_4b',
        section: 'Shrinkage & Loss History',
        questionText: 'What was the approximate total loss from ORC?',
        questionType: 'multiple_choice',
        options: [
          'Under $1,000',
          '$1,000 - $5,000',
          '$5,000 - $20,000',
          'Over $20,000',
        ],
        required: true,
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
    informsThreat: ['employee_theft'],
    riskDirection: 'negative',
    followUpQuestions: [
      {
        id: 'shrinkage_5a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many employee theft cases?',
        questionType: 'number',
        required: true,
        riskDirection: 'negative',
      },
      {
        id: 'shrinkage_5b',
        section: 'Shrinkage & Loss History',
        questionText: 'What type of employee theft occurred? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Merchandise theft',
          'Cash theft',
          'Fraudulent refunds/voids',
          'Time theft',
          'Discount abuse',
          'Gift card fraud',
        ],
        required: true,
        riskDirection: 'negative',
      },
    ],
  },

  {
    id: 'shrinkage_6',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced a robbery in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery'],
    riskDirection: 'negative',
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
        riskIndicators: ['within past 6 months', '6-12 months'],
        riskDirection: 'negative',
      },
      {
        id: 'shrinkage_6b',
        section: 'Shrinkage & Loss History',
        questionText: 'Was the robbery armed?',
        questionType: 'yes_no',
        required: true,
        riskDirection: 'negative',
      },
    ],
  },

  {
    id: 'shrinkage_7',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced a burglary (after-hours break-in) in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['burglary_after_hours'],
    riskDirection: 'negative',
    followUpQuestions: [
      {
        id: 'shrinkage_7a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many burglaries?',
        questionType: 'number',
        required: true,
        riskDirection: 'negative',
      },
    ],
  },
];
const section3_eas: RetailInterviewQuestion[] = [
  {
    id: 'eas_1',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'Do you have an EAS (security tag) system installed?',
    questionType: 'yes_no',
    required: true,
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
          'RFID',
          'Unknown',
        ],
        required: true,
      },
      {
        id: 'eas_1b',
        section: 'Electronic Article Surveillance (EAS)',
        questionText: 'Are EAS gates installed at all public exits?',
        questionType: 'yes_no',
        required: true,
        riskIndicators: ['no'],
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
      '75%+ (most merchandise)',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['no eas', 'under 25%'],
  },

  {
    id: 'eas_3',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'How do you respond when an EAS alarm sounds?',
    questionType: 'multiple_choice',
    options: [
      'Designated staff immediately approaches customer',
      'Staff approaches when available',
      'Staff observes but rarely approaches',
      'Alarms frequently ignored',
      'No formal procedure',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely approaches', 'frequently ignored', 'no formal'],
  },

  {
    id: 'eas_4',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'Are EAS tags properly deactivated/removed at point of sale?',
    questionType: 'multiple_choice',
    options: [
      'Always - part of checkout process',
      'Usually - occasional misses',
      'Inconsistent - depends on cashier',
      'Rarely - frequent customer issues',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['inconsistent', 'rarely'],
  },

  {
    id: 'eas_5',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'How often do you conduct EAS system testing/maintenance?',
    questionType: 'multiple_choice',
    options: [
      'Daily testing',
      'Weekly testing',
      'Monthly testing',
      'Rarely/Never',
      'Only when problems arise',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely', 'only when problems'],
  },
];
const section4_cctv: RetailInterviewQuestion[] = [
  {
    id: 'cctv_1',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Do you have a CCTV system installed?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_sales_floor', 'cctv_pos_registers'],
    followUpQuestions: [
      {
        id: 'cctv_1a',
        section: 'Video Surveillance (CCTV)',
        questionText: 'How many cameras are installed?',
        questionType: 'multiple_choice',
        options: [
          '1-4 cameras',
          '5-10 cameras',
          '11-20 cameras',
          '20+ cameras',
        ],
        required: true,
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
          '30-60 days',
          '60+ days',
        ],
        required: true,
        riskIndicators: ['less than 7 days'], // Insufficient for investigations
      },
    ],
  },

  {
    id: 'cctv_2',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Which areas have camera coverage? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'All POS registers',
      'Sales floor (general coverage)',
      'Main entrance/exit',
      'Emergency exits',
      'Stockroom',
      'Cash office/safe',
      'Parking lot',
      'Dressing rooms (exterior only)',
    ],
    required: true,
    informsVulnerability: true,
  },

  {
    id: 'cctv_3',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Can you clearly identify faces and read license plates in your current footage?',
    questionType: 'multiple_choice',
    options: [
      'Yes - high quality, clear identification',
      'Sometimes - depends on lighting/distance',
      'Rarely - resolution too low',
      'No - cameras are mostly deterrent',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely', 'no - cameras'],
  },

  {
    id: 'cctv_4',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Is CCTV footage actively monitored?',
    questionType: 'multiple_choice',
    options: [
      'Yes - dedicated monitoring station during all hours',
      'Yes - staff monitors when available',
      'Only reviewed after incidents',
      'Rarely reviewed',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely reviewed'],
  },

  {
    id: 'cctv_5',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Do you have a point-of-sale (POS) exception reporting system?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['employee_theft'],
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
          'Rarely',
        ],
        required: true,
        riskIndicators: ['rarely'],
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
      labels: ['Poor - Needs replacement', 'Fair', 'Adequate', 'Good', 'Excellent'] 
    },
    required: true,
    informsVulnerability: true,
  },
];
const section5_cash: RetailInterviewQuestion[] = [
  {
    id: 'cash_1',
    section: 'Cash Handling & Safe Security',
    questionText: 'What is the maximum amount of cash typically in registers during peak hours?',
    questionType: 'multiple_choice',
    options: [
      'Under $500 per register',
      '$500 - $1,000 per register',
      '$1,000 - $2,000 per register',
      'Over $2,000 per register',
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['armed_robbery'],
    riskIndicators: ['over $2,000'],
  },

  {
    id: 'cash_2',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you enforce register cash limits with mandatory drops?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cash_limit_registers'],
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
      'Drop safe (cannot retrieve without combination)',
      'Time-delay safe',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['drop_safe', 'time_delay_safe'],
    riskIndicators: ['no safe', 'basic safe'],
  },

  {
    id: 'cash_4',
    section: 'Cash Handling & Safe Security',
    questionText: 'How many people have access to the safe combination?',
    questionType: 'multiple_choice',
    options: [
      '1 person (manager only)',
      '2-3 people (managers)',
      '4-5 people (managers + supervisors)',
      'More than 5 people',
      'No safe / Not applicable',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['more than 5', 'no safe'],
  },

  {
    id: 'cash_5',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you use armored car service for bank deposits?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery'],
    suggestsControls: ['armored_car_service'],
    followUpQuestions: [
      {
        id: 'cash_5a',
        section: 'Cash Handling & Safe Security',
        questionText: 'How often does armored car pick up?',
        questionType: 'multiple_choice',
        options: [
          'Daily',
          '2-3 times per week',
          'Weekly',
          'Less than weekly',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'cash_6',
    section: 'Cash Handling & Safe Security',
    questionText: 'If you make manual bank deposits, what procedures do you follow?',
    questionType: 'multiple_choice',
    options: [
      'Not applicable - use armored car service',
      'Two-person team, varied times/routes',
      'Single person, varied times/routes',
      'Single person, predictable schedule',
      'No formal procedure',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['single person, predictable', 'no formal'],
  },

  {
    id: 'cash_7',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you have dual-control procedures for cash office activities?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dual_control_cash_procedures'],
  },

  {
    id: 'cash_8',
    section: 'Cash Handling & Safe Security',
    questionText: 'Are cash handling procedures clearly documented and trained?',
    questionType: 'multiple_choice',
    options: [
      'Yes - written procedures, regular training',
      'Yes - written procedures, minimal training',
      'Informal procedures, no documentation',
      'No formal procedures',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['informal', 'no formal'],
  },
];
const section6_physical: RetailInterviewQuestion[] = [
  {
    id: 'physical_1',
    section: 'Physical Security & Access Control',
    questionText: 'What type of storefront do you have?',
    questionType: 'multiple_choice',
    options: [
      'Full glass front (high visibility)',
      'Partial glass front',
      'Minimal windows',
      'Fully enclosed (mall interior)',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['smash_and_grab'],
  },

  {
    id: 'physical_2',
    section: 'Physical Security & Access Control',
    questionText: 'Are your entry doors reinforced or do you use security gates after hours?',
    questionType: 'multiple_choice',
    options: [
      'Both reinforced doors and security gates',
      'Reinforced doors only',
      'Security gates only',
      'Standard doors, no gates',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['burglary_after_hours', 'smash_and_grab'],
    suggestsControls: ['reinforced_entrance_doors', 'security_gates_after_hours'],
    riskIndicators: ['standard doors'],
  },

  {
    id: 'physical_3',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have bollards or barriers protecting your storefront from vehicle impact?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['smash_and_grab'],
    suggestsControls: ['bollards_storefront_protection'],
  },

  {
    id: 'physical_4',
    section: 'Physical Security & Access Control',
    questionText: 'How do you control access to stockrooms and back-of-house areas?',
    questionType: 'multiple_choice',
    options: [
      'Electronic access control (badge/keypad)',
      'Keyed locks with strict key control',
      'Keyed locks with loose key control',
      'Unlocked during business hours',
      'No access control',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['employee_theft'],
    suggestsControls: ['stockroom_access_control'],
    riskIndicators: ['loose key control', 'unlocked', 'no access'],
  },

  {
    id: 'physical_5',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have an intrusion alarm system?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['alarm_system_intrusion'],
    followUpQuestions: [
      {
        id: 'physical_5a',
        section: 'Physical Security & Access Control',
        questionText: 'Is the alarm system monitored?',
        questionType: 'multiple_choice',
        options: [
          'Yes - 24/7 central station monitoring',
          'Yes - police dispatch',
          'No - local alarm only',
        ],
        required: true,
        riskIndicators: ['local alarm only'],
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
        riskIndicators: ['more than 10'], // Suggests poor maintenance
      },
    ],
  },

  {
    id: 'physical_6',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have panic/duress alarms for employees?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery', 'workplace_violence_customer'],
    suggestsControls: ['alarm_system_panic_buttons'],
    followUpQuestions: [
      {
        id: 'physical_6a',
        section: 'Physical Security & Access Control',
        questionText: 'Where are panic buttons located? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'POS registers',
          'Manager office',
          'Cash office',
          'Customer service desk',
          'Other',
        ],
        required: true,
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
      labels: ['Very vulnerable', 'Below average', 'Average', 'Above average', 'Highly secure'] 
    },
    required: true,
    informsVulnerability: true,
  },
];
const section7_lp_staff: RetailInterviewQuestion[] = [
  {
    id: 'lp_staff_1',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you employ dedicated loss prevention staff?',
    questionType: 'multiple_choice',
    options: [
      'Yes - full-time LP team',
      'Yes - part-time LP staff',
      'Yes - security guard (uniformed)',
      'No - store staff handles LP duties',
      'No dedicated LP resources',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['loss_prevention_plain_clothes', 'security_guard_uniformed'],
    riskIndicators: ['no - store staff', 'no dedicated'],
  },

  {
    id: 'lp_staff_2',
    section: 'Loss Prevention Staffing',
    questionText: 'If you have LP staff, what are their primary activities? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Floor surveillance (plain clothes)',
      'CCTV monitoring',
      'Receipt checking',
      'Apprehensions',
      'Inventory audits',
      'Employee investigations',
      'Training staff',
      'Not applicable - no LP staff',
    ],
    required: true,
  },

  {
    id: 'lp_staff_3',
    section: 'Loss Prevention Staffing',
    questionText: 'What hours do you have LP/security coverage?',
    questionType: 'multiple_choice',
    options: [
      'All operating hours',
      'Peak hours only (weekends, holidays)',
      'Sporadic/as-needed',
      'No LP coverage',
    ],
    required: true,
    informsVulnerability: true,
  },

  {
    id: 'lp_staff_4',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you have a visible security presence (uniformed guard, signage)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['security_guard_uniformed', 'signage_prosecution_policy'],
  },

  {
    id: 'lp_staff_5',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you have a policy of prosecuting all theft cases regardless of value?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'lp_staff_5a',
        section: 'Loss Prevention Staffing',
        questionText: 'Is this policy posted/visible to customers?',
        questionType: 'yes_no',
        required: true,
        suggestsControls: ['signage_prosecution_policy'],
      },
    ],
  },
];
const section8_employee: RetailInterviewQuestion[] = [
  {
    id: 'employee_1',
    section: 'Employee Procedures & Training',
    questionText: 'Do you conduct background checks on all new hires?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive background checks',
      'Yes - criminal background only',
      'Selective - management positions only',
      'No background checks',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['employee_theft'],
    suggestsControls: ['employee_background_checks'],
    riskIndicators: ['no background'],
  },

  {
    id: 'employee_2',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees receive theft awareness training?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive training during onboarding',
      'Yes - brief mention during onboarding',
      'Informal on-the-job guidance',
      'No formal training',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['informal', 'no formal'],
  },

  {
    id: 'employee_3',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees receive robbery response training?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery'],
    suggestsControls: ['robbery_response_training'],
    followUpQuestions: [
      {
        id: 'employee_3a',
        section: 'Employee Procedures & Training',
        questionText: 'How often is robbery response training reinforced?',
        questionType: 'multiple_choice',
        options: [
          'Annually',
          'Every 2-3 years',
          'Only during initial training',
          'Never refreshed',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'employee_4',
    section: 'Employee Procedures & Training',
    questionText: 'What is your policy when employees observe theft?',
    questionType: 'multiple_choice',
    options: [
      'Approach and offer assistance (customer service approach)',
      'Notify LP/management immediately',
      'Do not confront - observe and report',
      'No clear policy',
    ],
    required: true,
    informsVulnerability: true,
  },

  {
    id: 'employee_5',
    section: 'Employee Procedures & Training',
    questionText: 'Do you have a two-person closing procedure policy?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery'],
    suggestsControls: ['closing_procedures_two_person'],
  },

  {
    id: 'employee_6',
    section: 'Employee Procedures & Training',
    questionText: 'Do you inspect employee bags/packages when they leave?',
    questionType: 'multiple_choice',
    options: [
      'Yes - routine inspections for all employees',
      'Yes - random inspections',
      'Rarely - only with cause',
      'No inspections',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['employee_theft'],
    suggestsControls: ['employee_package_inspection'],
    riskIndicators: ['rarely', 'no inspections'],
  },

  {
    id: 'employee_7',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees use a separate entrance/exit from customers?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
  },

  {
    id: 'employee_8',
    section: 'Employee Procedures & Training',
    questionText: 'What is your employee discount policy?',
    questionType: 'multiple_choice',
    options: [
      'Formal policy with transaction tracking',
      'Informal policy',
      'Manager discretion',
      'No employee discounts',
    ],
    required: true,
    informsThreat: ['employee_theft'],
  },

  {
    id: 'employee_9',
    section: 'Employee Procedures & Training',
    questionText: 'How do you handle employee terminations from a security perspective?',
    questionType: 'checklist',
    options: [
      'Keys/badges immediately collected',
      'POS access disabled same day',
      'Alarm codes changed if applicable',
      'Exit interview conducted',
      'Final paycheck delivered (not picked up)',
      'No formal security procedures',
    ],
    required: true,
    informsVulnerability: true,
  },
];
const section9_merchandise: RetailInterviewQuestion[] = [
  {
    id: 'merchandise_1',
    section: 'Merchandise Protection',
    questionText: 'How do you secure high-value merchandise on the sales floor?',
    questionType: 'checklist',
    options: [
      'Locked display cases',
      'Security cables/anchors',
      'Display alarms',
      'Spider wraps',
      'Keep high-value items in back (retrieve on request)',
      'No special security measures',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['high_value_display_security', 'merchandise_anchoring'],
    riskIndicators: ['no special security'],
  },

  {
    id: 'merchandise_2',
    section: 'Merchandise Protection',
    questionText: 'If you have fitting rooms, how are they monitored?',
    questionType: 'multiple_choice',
    options: [
      'Dedicated attendant with item count system',
      'Staff periodically checks',
      'CCTV monitoring exterior only',
      'No monitoring',
      'Not applicable - no fitting rooms',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dressing_room_attendant', 'item_count_policy'],
    riskIndicators: ['no monitoring'],
  },

  {
    id: 'merchandise_3',
    section: 'Merchandise Protection',
    questionText: 'Do you use retail display fixtures designed with security in mind?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'merchandise_3a',
        section: 'Merchandise Protection',
        questionText: 'What security-focused fixtures do you use? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Locking peg hooks',
          'Locking showcases',
          'High-security hangers',
          'Merchandise keepers (clear boxes)',
          'Display safers',
        ],
        required: true,
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
    informsVulnerability: true,
    suggestsControls: ['clear_sightlines_sales_floor', 'mirrors_blind_spot_coverage'],
    riskIndicators: ['limited', 'poor'],
  },

  {
    id: 'merchandise_5',
    section: 'Merchandise Protection',
    questionText: 'Do you use convex mirrors to cover blind spots?',
    questionType: 'yes_no',
    required: true,
    suggestsControls: ['mirrors_blind_spot_coverage'],
  },

  {
    id: 'merchandise_6',
    section: 'Merchandise Protection',
    questionText: 'How often do you conduct cycle counts/spot inventory audits?',
    questionType: 'multiple_choice',
    options: [
      'Daily on high-theft items',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Only annual inventory',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['inventory_audit_cycle_counting'],
  },
];
const section10_refunds: RetailInterviewQuestion[] = [
  {
    id: 'refunds_1',
    section: 'Refund & Return Policies',
    questionText: 'What authorization is required for refunds?',
    questionType: 'multiple_choice',
    options: [
      'Manager approval required for all refunds',
      'Manager approval over certain dollar threshold',
      'Cashiers can process independently',
      'No formal policy',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['return_fraud', 'employee_theft'],
    suggestsControls: ['refund_authorization_controls'],
    riskIndicators: ['cashiers can process', 'no formal policy'],
  },

  {
    id: 'refunds_2',
    section: 'Refund & Return Policies',
    questionText: 'Do you require receipts for all returns?',
    questionType: 'multiple_choice',
    options: [
      'Yes - receipt required, no exceptions',
      'Yes - but allow exceptions with ID tracking',
      'No - accept returns without receipts',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['return_fraud'],
    riskIndicators: ['no - accept returns'],
  },

  {
    id: 'refunds_3',
    section: 'Refund & Return Policies',
    questionText: 'Do you track customers who make frequent returns?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['return_fraud'],
  },

  {
    id: 'refunds_4',
    section: 'Refund & Return Policies',
    questionText: 'Have you had issues with return fraud in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['return_fraud'],
    followUpQuestions: [
      {
        id: 'refunds_4a',
        section: 'Refund & Return Policies',
        questionText: 'What type of return fraud? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Returning stolen merchandise',
          'Receipt fraud (altered/fake receipts)',
          'Price tag switching',
          'Returning used/worn items',
          'Wardrobing (buying for one-time use)',
          'Employee collusion',
        ],
        required: true,
      },
    ],
  },
];
const section11_external: RetailInterviewQuestion[] = [
  {
    id: 'external_1',
    section: 'Neighborhood & External Factors',
    questionText: 'How would you characterize the crime level in your immediate area?',
    questionType: 'multiple_choice',
    options: [
      'Very low crime area',
      'Low crime area',
      'Moderate crime area',
      'High crime area',
      'Very high crime area',
    ],
    required: true,
    informsThreat: ['shoplifting_individual', 'armed_robbery', 'burglary_after_hours'],
    informsVulnerability: true,
  },

  {
    id: 'external_2',
    section: 'Neighborhood & External Factors',
    questionText: 'Are you aware of organized retail crime (ORC) activity in your area?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['shoplifting_organized_retail_crime'],
  },

  {
    id: 'external_3',
    section: 'Neighborhood & External Factors',
    questionText: 'Do neighboring businesses share information about theft/security incidents?',
    questionType: 'multiple_choice',
    options: [
      'Yes - active information sharing network',
      'Occasionally - informal communication',
      'Rarely - minimal interaction',
      'No communication with other businesses',
    ],
    required: true,
    informsVulnerability: true,
  },
];

// Export all sections combined
export const RETAIL_STORE_INTERVIEW_QUESTIONS: RetailInterviewQuestion[] = [
  ...section1_storeProfile,
  ...section2_shrinkage,
  ...section3_eas,
  ...section4_cctv,
  ...section5_cash,
  ...section6_physical,
  ...section7_lp_staff,
  ...section8_employee,
  ...section9_merchandise,
  ...section10_refunds,
  ...section11_external,
];
