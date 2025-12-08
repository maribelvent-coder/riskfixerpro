/**
 * Warehouse & Distribution Center Interview Questionnaire
 * 
 * Complete question definitions with polarity logic, risk weights,
 * and threat/control mappings for the warehouse interview workflow.
 * 
 * Implements the RiskFixer AI-First Assessment Framework with:
 * - T×V×I formula (Threat × Vulnerability × Impact)
 * - Risk factor counting for vulnerability adjustment
 * - Threat-specific control recommendations
 * - 6-Layer Context Library compliance
 * 
 * Industry Standards Referenced:
 * - TAPA FSR (Facility Security Requirements)
 * - ASIS GDL-RA (General Security Risk Assessment)
 * - CargoNet Theft Prevention Guidelines
 * - ISO 28000 Supply Chain Security
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Warehouse-Questions-With-Polarity.md
 * @see RiskFixer-Warehouse-Framework.md
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface InterviewQuestion {
  id: string;
  section: WarehouseSection;
  zoneApplicable?: WarehouseZone[];
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
  
  // Risk mapping fields - Layer 6: Scoring Rubrics
  polarity: 'YES_GOOD' | 'YES_BAD' | 'RATING' | 'CONTEXT' | 'MULTIPLE_CHOICE';
  badAnswers?: string[];
  riskWeight: number;
  riskIndicators?: string[];
  ratingBadThreshold?: number;
  
  // Threat/control linkage - Layer 1: Facility Data → Layer 4: Threat Intelligence
  informsThreat?: string[];
  informsVulnerability?: boolean;
  informsImpact?: boolean;
  suggestsControls?: string[];
  helpText?: string;
}

export interface SectionMetadata {
  id: string;
  name: WarehouseSection;
  description: string;
  order: number;
  aiContextNotes?: string; // Layer 3: Industry-specific context for AI
}

// ============================================================================
// TYPE-SAFE SECTION DEFINITIONS
// ============================================================================

export const WAREHOUSE_SECTIONS = [
  'Facility & Operations Profile',
  'Cargo Theft & Incident History',
  'Perimeter & Yard Security',
  'Loading Dock Security',
  'Inventory Control & Management',
  'Personnel & Access Control',
  'Vehicle & Fleet Security',
  'Surveillance & Monitoring',
  'Emergency Response & Procedures',
] as const;

export type WarehouseSection = typeof WAREHOUSE_SECTIONS[number];

// ============================================================================
// WAREHOUSE ZONE DEFINITIONS
// ============================================================================

export const WAREHOUSE_ZONES = [
  'perimeter',
  'yard',
  'loading_dock',
  'warehouse_interior',
  'high_value_storage',
  'office_area',
  'break_room',
  'parking_lot',
] as const;

export type WarehouseZone = typeof WAREHOUSE_ZONES[number];

// ============================================================================
// WAREHOUSE THREAT DEFINITIONS - Layer 4: Threat Intelligence
// ============================================================================

export const WAREHOUSE_THREATS = [
  'cargo_theft_full_truckload',
  'cargo_theft_pilferage',
  'insider_theft_employee_driver_collusion',
  'loading_dock_breach',
  'inventory_shrinkage_unknown',
  'yard_trailer_theft',
  'vehicle_fleet_theft',
  'hijacking_in_transit',
  'sabotage_equipment_product',
  'vandalism',
  'unauthorized_access_facility',
  'workplace_violence',
  'after_hours_intrusion',
  'fire_emergency',
  'natural_disaster',
] as const;

export type WarehouseThreat = typeof WAREHOUSE_THREATS[number];

// ============================================================================
// WAREHOUSE CONTROL DEFINITIONS - Layer 5: Control Effectiveness
// ============================================================================

export const WAREHOUSE_CONTROLS = [
  // Perimeter & Yard
  'high_security_fencing',
  'fence_intrusion_detection',
  'perimeter_cctv',
  'yard_lighting',
  'vehicle_gate_control',
  'guard_house_checkpoint',
  'trailer_king_pin_locks',
  'trailer_landing_gear_locks',
  'yard_management_system',
  'clear_zone_maintenance',
  
  // Loading Dock
  'dock_cctv_coverage',
  'dock_door_sensors',
  'dock_scheduling_system',
  'trailer_seal_verification',
  'dock_leveler_locks',
  'dock_intrusion_alarm',
  'driver_waiting_area',
  'dock_access_control',
  
  // Inventory
  'warehouse_management_system',
  'rfid_inventory_tracking',
  'real_time_inventory_visibility',
  'cycle_counting_program',
  'high_value_caging',
  'exception_based_reporting',
  'lot_serial_tracking',
  'two_person_rule',
  
  // Personnel
  'employee_background_checks',
  'driver_background_checks',
  'badge_access_system',
  'visitor_management',
  'driver_check_in_procedures',
  'security_awareness_training',
  'theft_reporting_hotline',
  'insider_threat_program',
  
  // Fleet & Vehicle
  'gps_fleet_tracking',
  'vehicle_immobilizers',
  'two_driver_rule',
  'fuel_theft_prevention',
  'vehicle_inspection_procedures',
  
  // Surveillance
  'interior_warehouse_cctv',
  'video_analytics',
  'video_retention_30_days',
  'real_time_monitoring',
  'high_value_area_cameras',
  
  // Emergency
  'cargo_theft_response_plan',
  'documented_procedures',
  'key_control_system',
  'alarm_response_procedures',
  'security_drills',
  'law_enforcement_partnership',
] as const;

export type WarehouseControl = typeof WAREHOUSE_CONTROLS[number];

// ============================================================================
// SECTION METADATA - Layer 2: Methodology Framework
// ============================================================================

export const WAREHOUSE_SECTION_METADATA: SectionMetadata[] = [
  {
    id: 'facility',
    name: 'Facility & Operations Profile',
    description: 'Baseline facility characteristics that inform threat applicability and impact calculations',
    order: 1,
    aiContextNotes: 'Use to calibrate threat likelihood based on warehouse type, inventory value, and operational complexity. 3PL operations have higher insider threat surface. High-value goods attract organized theft rings.',
  },
  {
    id: 'incident_history',
    name: 'Cargo Theft & Incident History',
    description: 'Historical incidents that demonstrate active threats and inform likelihood scoring',
    order: 2,
    aiContextNotes: 'Past incidents are the strongest indicator of future threat likelihood. Full truckload thefts suggest organized crime targeting. Pilferage patterns indicate insider threat. CargoNet data: average loss per full truckload theft is $186,779.',
  },
  {
    id: 'perimeter',
    name: 'Perimeter & Yard Security',
    description: 'First line of defense - TAPA FSR Level A requires high-security fencing with intrusion detection',
    order: 3,
    aiContextNotes: 'Per TAPA FSR: perimeter must delay intrusion long enough for response. 8ft+ fencing with 3-strand barbed wire is minimum for high-value facilities. Yard lighting minimum 10 lux per ASIS guidelines.',
  },
  {
    id: 'loading_dock',
    name: 'Loading Dock Security',
    description: 'Highest vulnerability point - 47% of cargo theft occurs at loading docks per CargoNet',
    order: 4,
    aiContextNotes: 'Loading docks are primary vulnerability. Seal verification prevents fictitious pickup. Driver separation from warehouse prevents reconnaissance. TAPA requires 100% CCTV coverage of all dock doors.',
  },
  {
    id: 'inventory',
    name: 'Inventory Control & Management',
    description: 'Detective controls for identifying theft and shrinkage - WMS integration critical',
    order: 5,
    aiContextNotes: 'Industry average shrinkage 1-2%. Above 2% indicates control gaps. Real-time visibility enables rapid exception detection. High-value caging with restricted access is essential per TAPA Level A.',
  },
  {
    id: 'personnel',
    name: 'Personnel & Access Control',
    description: 'Insider threat mitigation through vetting, access control, and monitoring',
    order: 6,
    aiContextNotes: 'Per FBI: 60-80% of cargo theft involves inside information. Background checks deter opportunistic hires. Badge systems create audit trails. Visitor management prevents unauthorized access.',
  },
  {
    id: 'fleet',
    name: 'Vehicle & Fleet Security',
    description: 'Protection of vehicles and cargo in transit - extends security beyond facility',
    order: 7,
    aiContextNotes: 'GPS tracking enables rapid response to theft/hijacking. Vehicle immobilizers prevent unauthorized movement. Two-driver rule deters driver collusion. Average hijacking loss exceeds $250K per CargoNet.',
  },
  {
    id: 'surveillance',
    name: 'Surveillance & Monitoring',
    description: 'CCTV and monitoring systems for deterrence, detection, and evidence',
    order: 8,
    aiContextNotes: 'TAPA requires minimum 30-day retention for high-value facilities. Video analytics can detect unusual activity patterns. Real-time monitoring enables immediate response. Camera quality must support facial identification.',
  },
  {
    id: 'emergency',
    name: 'Emergency Response & Procedures',
    description: 'Documented procedures and response capabilities for security incidents',
    order: 9,
    aiContextNotes: 'Documented procedures ensure consistent response. Law enforcement partnerships improve recovery rates. Key control prevents unauthorized duplication. Regular drills validate response effectiveness.',
  },
];

// ============================================================================
// SECTION 1: FACILITY & OPERATIONS PROFILE (7 questions)
// ============================================================================

const SECTION_1_FACILITY_PROFILE: InterviewQuestion[] = [
  {
    id: 'facility_1',
    section: 'Facility & Operations Profile',
    questionText: 'What type of warehouse operation is this?',
    questionType: 'multiple_choice',
    options: [
      'Owned distribution center (single company)',
      'Third-party logistics (3PL) - multi-client',
      'Cold storage/refrigerated warehouse',
      'E-commerce fulfillment center',
      'Manufacturing/production warehouse',
      'Cross-dock facility',
      'Bonded warehouse/customs facility',
      'Other',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['insider_theft_employee_driver_collusion', 'cargo_theft_full_truckload'],
    informsImpact: true,
    helpText: '3PL multi-client operations increase insider threat complexity due to multiple access requirements. Bonded warehouses have regulatory compliance requirements.',
  },
  {
    id: 'facility_2',
    section: 'Facility & Operations Profile',
    questionText: 'What is the approximate square footage of the warehouse?',
    questionType: 'multiple_choice',
    options: [
      'Under 25,000 sq ft',
      '25,000 - 100,000 sq ft',
      '100,000 - 250,000 sq ft',
      '250,000 - 500,000 sq ft',
      '500,000 - 1,000,000 sq ft',
      'Over 1,000,000 sq ft',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsImpact: true,
    helpText: 'Larger facilities require more surveillance coverage and have more potential vulnerability points. Impacts response time for security incidents.',
  },
  {
    id: 'facility_3',
    section: 'Facility & Operations Profile',
    questionText: 'What is the approximate total value of inventory typically stored in the facility?',
    questionType: 'multiple_choice',
    options: [
      'Under $1 million',
      '$1 million - $5 million',
      '$5 million - $10 million',
      '$10 million - $25 million',
      '$25 million - $50 million',
      'Over $50 million',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
    informsThreat: ['cargo_theft_full_truckload', 'cargo_theft_pilferage', 'after_hours_intrusion'],
    helpText: 'Higher inventory values increase impact severity for all theft scenarios. Per TAPA FSR, facilities over $10M require Level A security.',
  },
  {
    id: 'facility_4',
    section: 'Facility & Operations Profile',
    questionText: 'Do you store high-value goods that are frequent cargo theft targets?',
    questionType: 'yes_no',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['cargo_theft_full_truckload', 'cargo_theft_pilferage', 'hijacking_in_transit'],
    helpText: 'High-value commodities (electronics, pharmaceuticals, alcohol, tobacco) attract organized theft rings.',
    followUpQuestions: [
      {
        id: 'facility_4a',
        section: 'Facility & Operations Profile',
        questionText: 'What high-value product categories do you handle? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Consumer electronics (phones, computers, TVs)',
          'Pharmaceuticals/medical supplies',
          'Alcohol/spirits',
          'Tobacco products',
          'Designer apparel/accessories',
          'Automotive parts',
          'Cosmetics/personal care',
          'Tools/equipment',
          'Food/beverages',
          'Household goods',
          'Other high-value items',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'facility_4',
          expectedValue: 'yes',
        },
        informsImpact: true,
        informsThreat: ['cargo_theft_full_truckload', 'hijacking_in_transit'],
        helpText: 'Per CargoNet: Electronics #1 theft target (23%), Food/Beverage #2 (19%), Home goods #3 (11%).',
      },
    ],
  },
  {
    id: 'facility_5',
    section: 'Facility & Operations Profile',
    questionText: 'How many total employees work at this facility?',
    questionType: 'multiple_choice',
    options: [
      'Under 25 employees',
      '25-50 employees',
      '51-100 employees',
      '101-250 employees',
      '251-500 employees',
      'Over 500 employees',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion', 'workplace_violence'],
    helpText: 'Larger workforce = harder to monitor, increased insider threat surface. Also impacts badge management complexity.',
  },
  {
    id: 'facility_6',
    section: 'Facility & Operations Profile',
    questionText: 'What are your typical operating hours?',
    questionType: 'multiple_choice',
    options: [
      'Single shift (8-10 hours)',
      'Two shifts (16-18 hours)',
      '24/7 operations',
      'Variable/seasonal',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'loading_dock_breach'],
    helpText: 'Extended/night operations require different security coverage. 24/7 has less "unoccupied" vulnerability but higher staffing needs.',
  },
  {
    id: 'facility_7',
    section: 'Facility & Operations Profile',
    questionText: 'Approximately how many trucks (inbound + outbound) do you handle per day?',
    questionType: 'multiple_choice',
    options: [
      'Under 10 trucks/day',
      '10-25 trucks/day',
      '26-50 trucks/day',
      '51-100 trucks/day',
      'Over 100 trucks/day',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['loading_dock_breach', 'cargo_theft_full_truckload'],
    helpText: 'Higher volume = more difficult to verify each shipment. Increases opportunity for fraudulent pickups.',
  },
];

// ============================================================================
// SECTION 2: CARGO THEFT & INCIDENT HISTORY (8 questions with follow-ups)
// ============================================================================

const SECTION_2_INCIDENT_HISTORY: InterviewQuestion[] = [
  {
    id: 'incident_1',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced a full truckload cargo theft in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 2,
    riskIndicators: ['yes'],
    informsThreat: ['cargo_theft_full_truckload'],
    informsVulnerability: true,
    helpText: 'Full truckload theft indicates organized criminal targeting. Average loss: $186,779 per incident (CargoNet).',
    followUpQuestions: [
      {
        id: 'incident_1a',
        section: 'Cargo Theft & Incident History',
        questionText: 'How many full truckload theft incidents?',
        questionType: 'number',
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'incident_1',
          expectedValue: 'yes',
        },
        informsThreat: ['cargo_theft_full_truckload'],
      },
      {
        id: 'incident_1b',
        section: 'Cargo Theft & Incident History',
        questionText: 'What was the approximate total loss?',
        questionType: 'multiple_choice',
        options: [
          'Under $50K',
          '$50K - $200K',
          '$200K - $500K',
          'Over $500K',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'incident_1',
          expectedValue: 'yes',
        },
        informsImpact: true,
      },
      {
        id: 'incident_1c',
        section: 'Cargo Theft & Incident History',
        questionText: 'Was insider involvement suspected or confirmed?',
        questionType: 'multiple_choice',
        options: [
          'Confirmed insider involvement',
          'Suspected insider involvement',
          'No insider involvement',
          'Unknown',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Confirmed insider involvement', 'Suspected insider involvement'],
        riskWeight: 2,
        riskIndicators: ['confirmed insider', 'suspected insider'],
        condition: {
          questionId: 'incident_1',
          expectedValue: 'yes',
        },
        informsThreat: ['insider_theft_employee_driver_collusion'],
        suggestsControls: ['insider_threat_program', 'employee_background_checks'],
      },
    ],
  },
  {
    id: 'incident_2',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced cargo pilferage (small-scale theft) in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    riskIndicators: ['yes'],
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    informsVulnerability: true,
    helpText: 'Pilferage often indicates employee theft opportunity. Pattern analysis can reveal organized activity.',
    followUpQuestions: [
      {
        id: 'incident_2a',
        section: 'Cargo Theft & Incident History',
        questionText: 'How frequently does pilferage occur?',
        questionType: 'multiple_choice',
        options: [
          'Rarely (1-2 incidents/year)',
          'Occasionally (3-6 incidents/year)',
          'Frequently (monthly)',
          'Constantly (weekly or more)',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Frequently (monthly)', 'Constantly (weekly or more)'],
        riskWeight: 2,
        riskIndicators: ['frequently', 'constantly'],
        condition: {
          questionId: 'incident_2',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        informsThreat: ['cargo_theft_pilferage'],
        suggestsControls: ['cctv_coverage', 'exception_based_reporting', 'two_person_rule'],
      },
    ],
  },
  {
    id: 'incident_3',
    section: 'Cargo Theft & Incident History',
    questionText: 'What is your annual inventory shrinkage rate?',
    questionType: 'multiple_choice',
    options: [
      'Under 0.5% (excellent)',
      '0.5% - 1% (good)',
      '1% - 2% (industry average)',
      '2% - 3% (above average)',
      'Over 3% (concerning)',
      'Unknown/Not tracked',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['2% - 3% (above average)', 'Over 3% (concerning)', 'Unknown/Not tracked'],
    riskWeight: 2,
    riskIndicators: ['2% - 3%', 'over 3%', 'unknown', 'not tracked'],
    informsVulnerability: true,
    informsThreat: ['inventory_shrinkage_unknown', 'cargo_theft_pilferage'],
    suggestsControls: ['warehouse_management_system', 'cycle_counting_program', 'exception_based_reporting'],
    helpText: 'Industry average shrinkage 1-2%. Above 2% indicates significant control gaps. Not tracking is a red flag.',
  },
  {
    id: 'incident_4',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you had any confirmed employee theft cases in the past 2 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    riskIndicators: ['yes'],
    informsThreat: ['insider_theft_employee_driver_collusion'],
    informsVulnerability: true,
    helpText: 'Confirmed employee theft indicates vulnerability in hiring, access control, or monitoring.',
    followUpQuestions: [
      {
        id: 'incident_4a',
        section: 'Cargo Theft & Incident History',
        questionText: 'How many employee theft cases?',
        questionType: 'number',
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'incident_4',
          expectedValue: 'yes',
        },
        informsThreat: ['insider_theft_employee_driver_collusion'],
      },
    ],
  },
  {
    id: 'incident_5',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced trailer theft from your yard in the past 3 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    riskIndicators: ['yes'],
    informsThreat: ['yard_trailer_theft'],
    informsVulnerability: true,
    suggestsControls: ['trailer_king_pin_locks', 'yard_management_system', 'perimeter_cctv'],
    helpText: 'Yard trailer theft often indicates perimeter vulnerability or inadequate trailer security.',
  },
  {
    id: 'incident_6',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you had any company vehicles stolen in the past 3 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    riskIndicators: ['yes'],
    informsThreat: ['vehicle_fleet_theft'],
    informsVulnerability: true,
    suggestsControls: ['gps_fleet_tracking', 'vehicle_immobilizers'],
    helpText: 'Vehicle theft may be opportunistic or part of organized theft scheme.',
  },
  {
    id: 'incident_7',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have any of your loads been hijacked in-transit in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 2,
    riskIndicators: ['yes'],
    informsThreat: ['hijacking_in_transit'],
    informsVulnerability: true,
    informsImpact: true,
    suggestsControls: ['gps_fleet_tracking', 'two_driver_rule', 'vehicle_immobilizers'],
    helpText: 'Hijacking is rare but high-impact. Indicates organized criminal targeting. Average loss exceeds $250K.',
  },
  {
    id: 'incident_8',
    section: 'Cargo Theft & Incident History',
    questionText: 'Are you aware of cargo theft incidents at nearby warehouses or in your area?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_BAD',
    badAnswers: ['yes'],
    riskWeight: 1,
    riskIndicators: ['yes'],
    informsThreat: ['cargo_theft_full_truckload', 'cargo_theft_pilferage', 'yard_trailer_theft'],
    helpText: 'Area cargo theft activity indicates elevated threat environment. Organized rings often work geographic areas.',
  },
];

// ============================================================================
// SECTION 3: PERIMETER & YARD SECURITY (9 questions with follow-ups)
// ============================================================================

const SECTION_3_PERIMETER_SECURITY: InterviewQuestion[] = [
  {
    id: 'perimeter_1',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['perimeter', 'yard'],
    questionText: 'What type of perimeter fencing do you have?',
    questionType: 'multiple_choice',
    options: [
      'High-security fencing (8ft+) with barbed/razor wire',
      'Standard chain link (6-8 feet) with barbed wire top',
      'Standard chain link (6-8 feet) without barbed wire',
      'Other fencing (wooden, ornamental)',
      'No fencing',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Standard chain link (6-8 feet) without barbed wire', 'Other fencing (wooden, ornamental)', 'No fencing'],
    riskWeight: 2,
    riskIndicators: ['other fencing', 'no fencing', 'without barbed wire'],
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'yard_trailer_theft', 'unauthorized_access_facility', 'after_hours_intrusion'],
    suggestsControls: ['high_security_fencing'],
    helpText: 'TAPA FSR Level A requires 8ft+ fencing with 3-strand barbed wire or equivalent. Fencing provides delay, not absolute prevention.',
  },
  {
    id: 'perimeter_2',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['perimeter'],
    questionText: 'Is your perimeter fence in good condition with no gaps or damage?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access_facility', 'after_hours_intrusion'],
    suggestsControls: ['clear_zone_maintenance'],
    helpText: 'Fence integrity inspections should be conducted weekly. Gaps provide easy entry points.',
  },
  {
    id: 'perimeter_3',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['perimeter'],
    questionText: 'Do you have perimeter intrusion detection (fence sensors, ground sensors, etc.)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access_facility', 'after_hours_intrusion', 'yard_trailer_theft'],
    suggestsControls: ['fence_intrusion_detection'],
    helpText: 'Intrusion detection provides early warning of perimeter breach. TAPA Level A requires perimeter detection.',
  },
  {
    id: 'perimeter_4',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['perimeter', 'yard'],
    questionText: 'How is vehicle access to the property controlled?',
    questionType: 'multiple_choice',
    options: [
      'Manned guard gate 24/7',
      'Manned guard gate during business hours, automated after hours',
      'Automated gate with card/code access',
      'Open access during business hours, locked after hours',
      'Open access 24/7',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Open access during business hours, locked after hours', 'Open access 24/7'],
    riskWeight: 2,
    riskIndicators: ['open access 24/7', 'open access during'],
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'unauthorized_access_facility', 'loading_dock_breach'],
    suggestsControls: ['guard_house_checkpoint', 'vehicle_gate_control'],
    helpText: 'Vehicle access control is first point of verification. TAPA requires controlled access with vehicle and driver verification.',
  },
  {
    id: 'perimeter_5',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['perimeter', 'yard'],
    questionText: 'Rate the adequacy of perimeter and yard lighting',
    questionType: 'rating',
    ratingScale: { min: 1, max: 5, labels: ['Very Poor', 'Poor', 'Adequate', 'Good', 'Excellent'] },
    required: true,
    polarity: 'RATING',
    ratingBadThreshold: 2,
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['yard_trailer_theft', 'after_hours_intrusion', 'unauthorized_access_facility'],
    suggestsControls: ['yard_lighting'],
    helpText: 'ASIS guideline: minimum 10 lux at perimeter, 50 lux at access points. Good lighting deters and enables CCTV effectiveness.',
  },
  {
    id: 'perimeter_6',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['perimeter', 'yard'],
    questionText: 'Do you have CCTV coverage of the perimeter and yard?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['yard_trailer_theft', 'unauthorized_access_facility', 'after_hours_intrusion', 'cargo_theft_full_truckload'],
    suggestsControls: ['perimeter_cctv'],
    helpText: 'Perimeter CCTV provides detection and forensic evidence. TAPA requires 100% perimeter coverage.',
    followUpQuestions: [
      {
        id: 'perimeter_6a',
        section: 'Perimeter & Yard Security',
        questionText: 'What percentage of the perimeter and yard has camera coverage?',
        questionType: 'multiple_choice',
        options: [
          '100% coverage',
          '75-99% coverage',
          '50-74% coverage',
          '25-50% coverage',
          'Under 25% coverage',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['25-50% coverage', 'Under 25% coverage'],
        riskWeight: 1,
        riskIndicators: ['under 25%', '25-50%'],
        condition: {
          questionId: 'perimeter_6',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        suggestsControls: ['perimeter_cctv'],
      },
    ],
  },
  {
    id: 'perimeter_7',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['perimeter'],
    questionText: 'Is there a clear zone (no vegetation, obstructions) around the perimeter fence?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access_facility', 'after_hours_intrusion'],
    suggestsControls: ['clear_zone_maintenance'],
    helpText: 'Clear zones (minimum 3m inside and outside fence) enable detection and prevent concealment.',
  },
  {
    id: 'perimeter_8',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['yard'],
    questionText: 'How are parked trailers (loaded or empty) secured in the yard?',
    questionType: 'checklist',
    options: [
      'King pin locks',
      'Landing gear locks',
      'Glad hand locks (air line locks)',
      'GPS tracking on trailers',
      'Dedicated secured staging area',
      'Regular yard checks/patrols',
      'No specific security measures',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No specific security measures'],
    riskWeight: 2,
    riskIndicators: ['no specific security'],
    informsVulnerability: true,
    informsThreat: ['yard_trailer_theft', 'cargo_theft_full_truckload'],
    suggestsControls: ['trailer_king_pin_locks', 'trailer_landing_gear_locks', 'yard_management_system'],
    helpText: 'Unattended trailers are vulnerable to theft. King pin locks prevent unauthorized hookup.',
  },
  {
    id: 'perimeter_9',
    section: 'Perimeter & Yard Security',
    zoneApplicable: ['perimeter', 'yard'],
    questionText: 'Do you conduct regular perimeter security inspections?',
    questionType: 'multiple_choice',
    options: [
      'Daily inspections (documented)',
      'Weekly inspections (documented)',
      'Monthly inspections',
      'Rarely/Never',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely/Never'],
    riskWeight: 1,
    riskIndicators: ['rarely', 'never'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access_facility'],
    suggestsControls: ['documented_procedures'],
    helpText: 'Regular inspections identify fence damage, lighting issues, and other vulnerabilities before exploitation.',
  },
];

// ============================================================================
// SECTION 4: LOADING DOCK SECURITY (10 questions with follow-ups)
// ============================================================================

const SECTION_4_LOADING_DOCK: InterviewQuestion[] = [
  {
    id: 'dock_1',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'How many loading dock doors does your facility have?',
    questionType: 'multiple_choice',
    options: [
      '1-5 doors',
      '6-10 doors',
      '11-20 doors',
      '21-50 doors',
      'Over 50 doors',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['loading_dock_breach'],
    helpText: 'More doors = more vulnerability points requiring coverage. Impacts CCTV and monitoring requirements.',
  },
  {
    id: 'dock_2',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Do you have CCTV cameras covering all loading dock doors?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['loading_dock_breach', 'cargo_theft_full_truckload', 'cargo_theft_pilferage'],
    suggestsControls: ['dock_cctv_coverage'],
    helpText: 'TAPA requires 100% CCTV coverage of all dock doors. Critical for detecting unauthorized activity and providing evidence.',
    followUpQuestions: [
      {
        id: 'dock_2a',
        section: 'Loading Dock Security',
        questionText: 'Can the cameras capture activity inside trailers when doors are open?',
        questionType: 'yes_no',
        required: true,
        polarity: 'YES_GOOD',
        badAnswers: ['no'],
        riskWeight: 1,
        condition: {
          questionId: 'dock_2',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        informsThreat: ['cargo_theft_pilferage'],
        helpText: 'Cameras should capture loading/unloading activity inside the trailer to detect pilferage.',
      },
    ],
  },
  {
    id: 'dock_3',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Do you have electronic sensors that detect when dock doors are open/closed?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['loading_dock_breach', 'after_hours_intrusion'],
    suggestsControls: ['dock_door_sensors'],
    helpText: 'Door sensors enable real-time monitoring of dock activity and can trigger alerts for unauthorized access.',
  },
  {
    id: 'dock_4',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Do you use a trailer seal verification system?',
    questionType: 'multiple_choice',
    options: [
      'Electronic seal verification with audit trail',
      'Manual seal logging with verification procedures',
      'Informal seal checking (not documented)',
      'No seal verification',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal seal checking (not documented)', 'No seal verification'],
    riskWeight: 2,
    riskIndicators: ['informal', 'no seal'],
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'cargo_theft_pilferage'],
    suggestsControls: ['trailer_seal_verification'],
    helpText: 'Seal verification prevents fictitious pickup schemes. Electronic seals provide tamper evidence and audit trail.',
  },
  {
    id: 'dock_5',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'What happens to dock doors when not actively loading/unloading?',
    questionType: 'multiple_choice',
    options: [
      'Doors closed and locked, trailer disconnected',
      'Doors closed but may not be locked',
      'Doors may remain open between loads',
      'No formal procedure',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Doors may remain open between loads', 'No formal procedure'],
    riskWeight: 1,
    riskIndicators: ['doors may remain', 'no formal'],
    informsVulnerability: true,
    informsThreat: ['loading_dock_breach', 'unauthorized_access_facility'],
    suggestsControls: ['dock_leveler_locks', 'documented_procedures'],
    helpText: 'Open dock doors are significant vulnerability. TAPA requires doors locked when not in use.',
  },
  {
    id: 'dock_6',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Do you use dock scheduling/appointment systems for arriving trucks?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'loading_dock_breach'],
    suggestsControls: ['dock_scheduling_system'],
    helpText: 'Scheduling enables verification of expected arrivals. Unexpected trucks can be flagged for additional scrutiny.',
  },
  {
    id: 'dock_7',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Are dock levelers secured (locked or raised) when not in use?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['loading_dock_breach', 'unauthorized_access_facility'],
    suggestsControls: ['dock_leveler_locks'],
    helpText: 'Secured dock levelers prevent unauthorized entry through dock openings.',
  },
  {
    id: 'dock_8',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Do you verify that outbound load contents match shipping manifests?',
    questionType: 'multiple_choice',
    options: [
      '100% verification with documented process',
      'Spot-check verification (sampling)',
      'Informal verification',
      'No verification process',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal verification', 'No verification process'],
    riskWeight: 2,
    riskIndicators: ['informal', 'no verification'],
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'cargo_theft_pilferage'],
    suggestsControls: ['documented_procedures'],
    helpText: 'Load verification prevents over-shipment fraud and detects pilferage before departure.',
  },
  {
    id: 'dock_9',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock', 'warehouse_interior'],
    questionText: 'How do you prevent drivers from entering the warehouse during loading/unloading?',
    questionType: 'multiple_choice',
    options: [
      'Physical barrier/separate driver waiting area',
      'Escort policy enforced',
      'Badge-controlled access to warehouse',
      'Verbal policy (not enforced)',
      'No restrictions - drivers can enter',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No restrictions - drivers can enter'],
    riskWeight: 1,
    riskIndicators: ['no restrictions'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion', 'cargo_theft_pilferage'],
    suggestsControls: ['driver_waiting_area', 'dock_access_control'],
    helpText: 'Driver separation prevents reconnaissance and collusion opportunity. TAPA requires driver restriction from warehouse.',
  },
  {
    id: 'dock_10',
    section: 'Loading Dock Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Do you have an intrusion alarm system on loading dock doors?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['loading_dock_breach', 'after_hours_intrusion'],
    suggestsControls: ['dock_intrusion_alarm'],
    helpText: 'Intrusion alarms provide detection when dock doors are accessed outside normal operations.',
  },
];

// ============================================================================
// SECTION 5: INVENTORY CONTROL & MANAGEMENT (7 questions with follow-ups)
// ============================================================================

const SECTION_5_INVENTORY_CONTROL: InterviewQuestion[] = [
  {
    id: 'inventory_1',
    section: 'Inventory Control & Management',
    zoneApplicable: ['warehouse_interior', 'high_value_storage'],
    questionText: 'Do you have a Warehouse Management System (WMS) in place?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['inventory_shrinkage_unknown', 'cargo_theft_pilferage'],
    suggestsControls: ['warehouse_management_system'],
    helpText: 'WMS provides inventory visibility and transaction tracking essential for loss detection.',
    followUpQuestions: [
      {
        id: 'inventory_1a',
        section: 'Inventory Control & Management',
        questionText: 'Does your WMS provide real-time inventory visibility?',
        questionType: 'yes_no',
        required: true,
        polarity: 'YES_GOOD',
        badAnswers: ['no'],
        riskWeight: 1,
        condition: {
          questionId: 'inventory_1',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        suggestsControls: ['real_time_inventory_visibility'],
        helpText: 'Real-time visibility enables rapid detection of discrepancies.',
      },
    ],
  },
  {
    id: 'inventory_2',
    section: 'Inventory Control & Management',
    zoneApplicable: ['warehouse_interior'],
    questionText: 'How often do you conduct cycle counts for inventory verification?',
    questionType: 'multiple_choice',
    options: [
      'Daily (high-value items)/Weekly (all items)',
      'Weekly cycle counts',
      'Monthly cycle counts',
      'Only annual physical inventory',
      'No formal cycle counting',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Only annual physical inventory', 'No formal cycle counting'],
    riskWeight: 2,
    riskIndicators: ['only annual', 'no formal'],
    informsVulnerability: true,
    informsThreat: ['inventory_shrinkage_unknown', 'cargo_theft_pilferage'],
    suggestsControls: ['cycle_counting_program'],
    helpText: 'Frequent cycle counting detects losses quickly. Annual-only counting allows theft to go undetected for months.',
  },
  {
    id: 'inventory_3',
    section: 'Inventory Control & Management',
    zoneApplicable: ['high_value_storage'],
    questionText: 'Is high-value inventory stored in secure caging or segregated areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['high_value_caging'],
    helpText: 'TAPA Level A requires high-value items in controlled access caging. Reduces opportunity for casual theft.',
    followUpQuestions: [
      {
        id: 'inventory_3a',
        section: 'Inventory Control & Management',
        questionText: 'How is access to high-value storage areas controlled?',
        questionType: 'multiple_choice',
        options: [
          'Electronic badge access with audit trail',
          'Key control with sign-out log',
          'Supervisor authorization required',
          'General employee access',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['General employee access'],
        riskWeight: 1,
        riskIndicators: ['general employee'],
        condition: {
          questionId: 'inventory_3',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        informsThreat: ['cargo_theft_pilferage'],
        suggestsControls: ['badge_access_system'],
      },
    ],
  },
  {
    id: 'inventory_4',
    section: 'Inventory Control & Management',
    zoneApplicable: ['warehouse_interior'],
    questionText: 'Do you use lot numbers or serial numbers to track inventory?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'inventory_shrinkage_unknown'],
    suggestsControls: ['lot_serial_tracking'],
    helpText: 'Lot/serial tracking enables tracing of specific items and aids in theft investigation.',
  },
  {
    id: 'inventory_5',
    section: 'Inventory Control & Management',
    zoneApplicable: ['high_value_storage'],
    questionText: 'Do you have CCTV coverage of high-value storage areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['high_value_area_cameras'],
    helpText: 'CCTV in high-value areas deters theft and provides evidence. Should cover all access points.',
  },
  {
    id: 'inventory_6',
    section: 'Inventory Control & Management',
    zoneApplicable: ['warehouse_interior'],
    questionText: 'Do you use exception-based reporting to identify unusual transactions?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['inventory_shrinkage_unknown', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['exception_based_reporting'],
    helpText: 'Exception reporting flags anomalies like unusual quantities, timing, or patterns indicating theft.',
  },
  {
    id: 'inventory_7',
    section: 'Inventory Control & Management',
    zoneApplicable: ['high_value_storage'],
    questionText: 'Do you require a two-person rule for accessing high-value inventory?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['two_person_rule'],
    helpText: 'Two-person rule prevents individual opportunity and provides witness accountability.',
  },
];

// ============================================================================
// SECTION 6: PERSONNEL & ACCESS CONTROL (8 questions with follow-ups)
// ============================================================================

const SECTION_6_PERSONNEL_SECURITY: InterviewQuestion[] = [
  {
    id: 'personnel_1',
    section: 'Personnel & Access Control',
    questionText: 'Do you conduct background checks on all warehouse employees?',
    questionType: 'multiple_choice',
    options: [
      'Comprehensive checks (criminal, employment, references)',
      'Basic criminal background check only',
      'Only for certain positions',
      'No background checks',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No background checks'],
    riskWeight: 2,
    riskIndicators: ['no background'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion', 'cargo_theft_pilferage'],
    suggestsControls: ['employee_background_checks'],
    helpText: 'Background checks deter applicants with theft history and provide due diligence. TAPA requires criminal checks.',
  },
  {
    id: 'personnel_2',
    section: 'Personnel & Access Control',
    questionText: 'Do you conduct background checks on drivers (company fleet and contractors)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion', 'hijacking_in_transit'],
    suggestsControls: ['driver_background_checks'],
    helpText: 'Drivers have access to high-value cargo. Background verification is essential for fleet security.',
  },
  {
    id: 'personnel_3',
    section: 'Personnel & Access Control',
    questionText: 'What type of employee access control system do you have?',
    questionType: 'multiple_choice',
    options: [
      'Electronic badge system with audit trail',
      'Electronic badge system without audit',
      'Physical keys only',
      'No formal access control',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Physical keys only', 'No formal access control'],
    riskWeight: 1,
    riskIndicators: ['physical keys only', 'no formal'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access_facility', 'after_hours_intrusion'],
    suggestsControls: ['badge_access_system'],
    helpText: 'Electronic badge systems provide audit trail of access. Physical keys cannot be tracked and are easily duplicated.',
  },
  {
    id: 'personnel_4',
    section: 'Personnel & Access Control',
    questionText: 'How do you manage visitor access (vendors, contractors, visitors)?',
    questionType: 'multiple_choice',
    options: [
      'ID verification, badge issued, escort required',
      'Sign-in log with temporary badge',
      'Informal sign-in',
      'Open access',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal sign-in', 'Open access'],
    riskWeight: 1,
    riskIndicators: ['informal', 'open access'],
    informsVulnerability: true,
    informsThreat: ['unauthorized_access_facility', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['visitor_management'],
    helpText: 'Visitor management provides accountability and prevents unauthorized access. TAPA requires ID verification.',
  },
  {
    id: 'personnel_5',
    section: 'Personnel & Access Control',
    questionText: 'Do you have a driver check-in procedure for inbound/outbound trucks?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'loading_dock_breach'],
    suggestsControls: ['driver_check_in_procedures'],
    helpText: 'Driver check-in verifies identity and authorization. Prevents fictitious pickup schemes.',
    followUpQuestions: [
      {
        id: 'personnel_5a',
        section: 'Personnel & Access Control',
        questionText: 'What does the driver check-in process include? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Photo ID verification',
          'Bill of lading verification',
          'Appointment confirmation',
          'Company authorization check',
          'Vehicle inspection',
          'Photo/video capture of driver',
          'Biometric verification',
        ],
        required: true,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'personnel_5',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        helpText: 'Multiple verification steps increase security. Photo capture aids in theft investigation.',
      },
    ],
  },
  {
    id: 'personnel_6',
    section: 'Personnel & Access Control',
    questionText: 'Do employees receive security awareness training?',
    questionType: 'multiple_choice',
    options: [
      'Comprehensive training with annual refreshers',
      'Initial training only',
      'Informal on-the-job guidance',
      'No formal training',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal on-the-job guidance', 'No formal training'],
    riskWeight: 1,
    riskIndicators: ['informal', 'no formal'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion', 'cargo_theft_pilferage'],
    suggestsControls: ['security_awareness_training'],
    helpText: 'Security awareness training creates culture of vigilance. Employees should know how to report suspicious activity.',
  },
  {
    id: 'personnel_7',
    section: 'Personnel & Access Control',
    questionText: 'Do you have a theft reporting hotline or anonymous reporting mechanism?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion', 'cargo_theft_pilferage'],
    suggestsControls: ['theft_reporting_hotline'],
    helpText: 'Anonymous reporting allows employees to report theft without fear. Industry data shows 40% of theft detected via tips.',
  },
  {
    id: 'personnel_8',
    section: 'Personnel & Access Control',
    questionText: 'Do you have an insider threat monitoring program?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    suggestsControls: ['insider_threat_program'],
    helpText: 'Insider threat programs monitor for behavioral indicators and anomalies suggesting employee theft.',
  },
];

// ============================================================================
// SECTION 7: VEHICLE & FLEET SECURITY (5 questions)
// ============================================================================

const SECTION_7_FLEET_SECURITY: InterviewQuestion[] = [
  {
    id: 'fleet_1',
    section: 'Vehicle & Fleet Security',
    questionText: 'How many company-owned vehicles (trucks, vans, forklifts) do you have?',
    questionType: 'multiple_choice',
    options: [
      'No company vehicles',
      '1-10 vehicles',
      '11-25 vehicles',
      '26-50 vehicles',
      'Over 50 vehicles',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
    informsThreat: ['vehicle_fleet_theft'],
    helpText: 'Fleet size determines exposure and informs impact for vehicle theft scenarios.',
  },
  {
    id: 'fleet_2',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you have GPS tracking on company vehicles?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['vehicle_fleet_theft', 'hijacking_in_transit', 'cargo_theft_full_truckload'],
    suggestsControls: ['gps_fleet_tracking'],
    helpText: 'GPS tracking enables rapid response to theft/hijacking and provides route accountability. Essential for high-value loads.',
  },
  {
    id: 'fleet_3',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you use vehicle immobilization systems (kill switches) on fleet vehicles?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['vehicle_fleet_theft', 'hijacking_in_transit'],
    suggestsControls: ['vehicle_immobilizers'],
    helpText: 'Immobilizers prevent unauthorized movement even if vehicle is accessed. Remote disable capability aids in hijacking response.',
  },
  {
    id: 'fleet_4',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you require a two-driver rule for high-value loads?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['hijacking_in_transit', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['two_driver_rule'],
    helpText: 'Two-driver rule deters driver collusion and provides witness/assistance during hijacking. TAPA Level A requires for high-value.',
  },
  {
    id: 'fleet_5',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you have fuel theft prevention measures in place?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['vehicle_fleet_theft'],
    suggestsControls: ['fuel_theft_prevention'],
    helpText: 'Fuel theft indicates security gaps. Lockable fuel caps, fuel monitoring, and secure fueling procedures reduce risk.',
  },
];

// ============================================================================
// SECTION 8: SURVEILLANCE & MONITORING (5 questions with follow-ups)
// ============================================================================

const SECTION_8_SURVEILLANCE: InterviewQuestion[] = [
  {
    id: 'surveillance_1',
    section: 'Surveillance & Monitoring',
    zoneApplicable: ['warehouse_interior'],
    questionText: 'Do you have CCTV coverage inside the warehouse?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['interior_warehouse_cctv'],
    helpText: 'Interior CCTV provides deterrence and evidence. Should cover aisles, staging areas, and exits.',
    followUpQuestions: [
      {
        id: 'surveillance_1a',
        section: 'Surveillance & Monitoring',
        questionText: 'What percentage of the warehouse interior has camera coverage?',
        questionType: 'multiple_choice',
        options: [
          '100% coverage',
          '75-99% coverage',
          '50-74% coverage',
          '25-49% coverage',
          'Under 25% coverage',
        ],
        required: true,
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Under 25% coverage'],
        riskWeight: 1,
        riskIndicators: ['under 25%'],
        condition: {
          questionId: 'surveillance_1',
          expectedValue: 'yes',
        },
        informsVulnerability: true,
        suggestsControls: ['interior_warehouse_cctv'],
      },
    ],
  },
  {
    id: 'surveillance_2',
    section: 'Surveillance & Monitoring',
    questionText: 'What is your video retention period?',
    questionType: 'multiple_choice',
    options: [
      '90+ days',
      '60-90 days',
      '30-60 days',
      '14-30 days',
      '7-14 days',
      'Less than 7 days',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['7-14 days', 'Less than 7 days'],
    riskWeight: 1,
    riskIndicators: ['less than 7 days', '7-14 days'],
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['video_retention_30_days'],
    helpText: 'TAPA Level A requires minimum 30-day retention. Many theft schemes are detected weeks after occurrence.',
  },
  {
    id: 'surveillance_3',
    section: 'Surveillance & Monitoring',
    questionText: 'Is CCTV footage actively monitored in real-time?',
    questionType: 'multiple_choice',
    options: [
      '24/7 dedicated monitoring',
      'Business hours monitoring',
      'Spot-check monitoring',
      'Reviewed only after incidents',
      'Rarely reviewed',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely reviewed'],
    riskWeight: 1,
    riskIndicators: ['rarely reviewed'],
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'loading_dock_breach'],
    suggestsControls: ['real_time_monitoring'],
    helpText: 'Real-time monitoring enables immediate response. After-incident review is valuable but provides no prevention.',
  },
  {
    id: 'surveillance_4',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use video analytics (motion detection, behavior analysis)?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'after_hours_intrusion'],
    suggestsControls: ['video_analytics'],
    helpText: 'Video analytics can detect unusual patterns, loitering, and after-hours activity without constant human monitoring.',
  },
  {
    id: 'surveillance_5',
    section: 'Surveillance & Monitoring',
    questionText: 'Rate the overall quality and coverage of your CCTV system',
    questionType: 'rating',
    ratingScale: { min: 1, max: 5, labels: ['Very Poor', 'Poor', 'Adequate', 'Good', 'Excellent'] },
    required: true,
    polarity: 'RATING',
    ratingBadThreshold: 2,
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    helpText: 'Camera quality should support facial identification. Coverage should eliminate blind spots in critical areas.',
  },
];

// ============================================================================
// SECTION 9: EMERGENCY RESPONSE & PROCEDURES (6 questions)
// ============================================================================

const SECTION_9_EMERGENCY_RESPONSE: InterviewQuestion[] = [
  {
    id: 'emergency_1',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have a documented cargo theft response plan?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'hijacking_in_transit'],
    suggestsControls: ['cargo_theft_response_plan'],
    helpText: 'Response plan ensures rapid, coordinated action when theft is discovered. Should include notification chain, evidence preservation, law enforcement contact.',
  },
  {
    id: 'emergency_2',
    section: 'Emergency Response & Procedures',
    questionText: 'Are shipping and receiving procedures clearly documented?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'loading_dock_breach'],
    suggestsControls: ['documented_procedures'],
    helpText: 'Documented procedures ensure consistent security practices. Enables training and accountability.',
  },
  {
    id: 'emergency_3',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have a key control system with documented accountability?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['unauthorized_access_facility', 'vehicle_fleet_theft'],
    suggestsControls: ['key_control_system'],
    helpText: 'Key control prevents unauthorized duplication and tracks who has access. Critical for vehicles, gates, and secure areas.',
  },
  {
    id: 'emergency_4',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have documented alarm response procedures?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['after_hours_intrusion', 'loading_dock_breach'],
    suggestsControls: ['alarm_response_procedures'],
    helpText: 'Alarm response procedures ensure appropriate action for different alarm types. Should include response times and escalation.',
  },
  {
    id: 'emergency_5',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you conduct security drills or training exercises?',
    questionType: 'multiple_choice',
    options: [
      'Quarterly or more frequently',
      'Semi-annually',
      'Annually',
      'Rarely',
      'Never',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Rarely', 'Never'],
    riskWeight: 1,
    riskIndicators: ['rarely', 'never'],
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'hijacking_in_transit'],
    suggestsControls: ['security_drills'],
    helpText: 'Security drills validate response effectiveness and identify gaps. Should include theft scenarios.',
  },
  {
    id: 'emergency_6',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have relationships with local law enforcement for cargo theft prevention?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'hijacking_in_transit'],
    suggestsControls: ['law_enforcement_partnership'],
    helpText: 'Law enforcement partnerships improve response time and recovery rates. Many areas have cargo theft task forces.',
  },
];

// ============================================================================
// COMBINED QUESTIONNAIRE EXPORT
// ============================================================================

export const WAREHOUSE_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  ...SECTION_1_FACILITY_PROFILE,
  ...SECTION_2_INCIDENT_HISTORY,
  ...SECTION_3_PERIMETER_SECURITY,
  ...SECTION_4_LOADING_DOCK,
  ...SECTION_5_INVENTORY_CONTROL,
  ...SECTION_6_PERSONNEL_SECURITY,
  ...SECTION_7_FLEET_SECURITY,
  ...SECTION_8_SURVEILLANCE,
  ...SECTION_9_EMERGENCY_RESPONSE,
];

// ============================================================================
// UTILITY FUNCTIONS - Layer 6: Scoring Rubrics Integration
// ============================================================================

/**
 * Get questions by section
 */
export function getQuestionsBySection(section: WarehouseSection): InterviewQuestion[] {
  return WAREHOUSE_INTERVIEW_QUESTIONS.filter(q => q.section === section);
}

/**
 * Get questions that inform a specific threat
 * Used for threat-specific vulnerability calculations
 */
export function getQuestionsForThreat(threatId: string): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of WAREHOUSE_INTERVIEW_QUESTIONS) {
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
  
  for (const question of WAREHOUSE_INTERVIEW_QUESTIONS) {
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
  
  for (const question of WAREHOUSE_INTERVIEW_QUESTIONS) {
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
  
  for (const question of WAREHOUSE_INTERVIEW_QUESTIONS) {
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
  
  for (const question of WAREHOUSE_INTERVIEW_QUESTIONS) {
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
  
  for (const question of WAREHOUSE_INTERVIEW_QUESTIONS) {
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
export function getQuestionCountBySection(): Record<WarehouseSection, number> {
  const counts = {} as Record<WarehouseSection, number>;
  
  for (const section of WAREHOUSE_SECTIONS) {
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
  return WAREHOUSE_SECTION_METADATA.find(s => s.id === sectionId);
}

/**
 * Get section metadata by name
 */
export function getSectionMetadataByName(sectionName: WarehouseSection): SectionMetadata | undefined {
  return WAREHOUSE_SECTION_METADATA.find(s => s.name === sectionName);
}

/**
 * Get questions that suggest specific controls
 */
export function getQuestionsForControl(controlId: string): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of WAREHOUSE_INTERVIEW_QUESTIONS) {
    if (question.suggestsControls?.includes(controlId)) {
      result.push(question);
    }
    if (question.followUpQuestions) {
      for (const followUp of question.followUpQuestions) {
        if (followUp.suggestsControls?.includes(controlId)) {
          result.push(followUp);
        }
      }
    }
  }
  
  return result;
}

/**
 * Get threat-specific critical questions
 * These questions have extra weight for specific threats
 */
export function getCriticalQuestionsForThreat(threatId: WarehouseThreat): string[] {
  const criticalQuestionMap: Record<WarehouseThreat, string[]> = {
    cargo_theft_full_truckload: ['dock_2', 'dock_4', 'dock_8', 'perimeter_4', 'perimeter_6', 'fleet_2'],
    cargo_theft_pilferage: ['inventory_2', 'inventory_3', 'inventory_5', 'inventory_6', 'surveillance_1'],
    insider_theft_employee_driver_collusion: ['personnel_1', 'personnel_8', 'inventory_6', 'incident_1c'],
    loading_dock_breach: ['dock_2', 'dock_3', 'dock_10', 'dock_9'],
    inventory_shrinkage_unknown: ['incident_3', 'inventory_2', 'inventory_6'],
    yard_trailer_theft: ['perimeter_8', 'perimeter_6', 'perimeter_5'],
    vehicle_fleet_theft: ['fleet_2', 'fleet_3', 'emergency_3'],
    hijacking_in_transit: ['fleet_2', 'fleet_3', 'fleet_4'],
    sabotage_equipment_product: ['surveillance_1', 'personnel_6'],
    vandalism: ['perimeter_6', 'perimeter_5'],
    unauthorized_access_facility: ['perimeter_1', 'perimeter_4', 'personnel_3'],
    workplace_violence: ['personnel_6', 'personnel_7'],
    after_hours_intrusion: ['perimeter_3', 'dock_10', 'emergency_4'],
    fire_emergency: ['emergency_4'],
    natural_disaster: ['emergency_4'],
  };
  
  return criticalQuestionMap[threatId] || [];
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
    
    // Validate section is in WAREHOUSE_SECTIONS
    if (!WAREHOUSE_SECTIONS.includes(question.section as WarehouseSection)) {
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
        WAREHOUSE_INTERVIEW_QUESTIONS.some(q => q.id === question.condition!.questionId);
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
  sectionCounts: Record<WarehouseSection, number>;
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
  for (const q of WAREHOUSE_INTERVIEW_QUESTIONS) {
    if (q.followUpQuestions) {
      followUpCount += q.followUpQuestions.length;
    }
  }
  
  return {
    totalQuestions: allQuestions.length,
    topLevelQuestions: WAREHOUSE_INTERVIEW_QUESTIONS.length,
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

/**
 * Get AI context prompt for warehouse assessments
 * Layer 3: Industry-Specific Standards integration
 */
export function getAIContextPrompt(): string {
  return `
## Warehouse & Distribution Center Security Assessment Context

### Industry Standards Applied
- **TAPA FSR** (Facility Security Requirements): International standard for supply chain security
- **ASIS GDL-RA**: General Security Risk Assessment methodology
- **CargoNet**: Cargo theft intelligence and statistics
- **ISO 28000**: Supply chain security management

### Key Warehouse Threats (by Impact)
1. **Cargo Theft - Full Truckload**: Average loss $186,779 (CargoNet). Often involves organized crime, insider information.
2. **Hijacking - In-Transit**: Average loss >$250K. Rare but catastrophic. Requires rapid response capability.
3. **Insider Theft - Employee/Driver Collusion**: 60-80% of cargo theft involves inside information (FBI).
4. **Loading Dock Breach**: 47% of cargo theft occurs at loading docks. Highest vulnerability point.
5. **Inventory Shrinkage**: Industry average 1-2%. Above 2% indicates significant control gaps.

### Critical Control Points
- **Perimeter**: First line of defense. TAPA Level A requires 8ft+ fencing with detection.
- **Loading Dock**: Most vulnerable. Requires CCTV, seal verification, driver separation.
- **High-Value Storage**: Caging, restricted access, two-person rule per TAPA.
- **Fleet**: GPS tracking essential for response to theft/hijacking.

### Assessment Scoring Guidance
- **Vulnerability increases** when: incident history present, controls missing, documentation lacking
- **Impact factors**: inventory value, high-value product categories, operational criticality
- **Threat likelihood factors**: location, product attractiveness, prior targeting

### Report Focus Areas
1. Loading dock security improvements (highest ROI)
2. Insider threat mitigation
3. Perimeter and yard hardening
4. Inventory visibility and cycle counting
5. Driver/visitor management procedures
`;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default WAREHOUSE_INTERVIEW_QUESTIONS;
