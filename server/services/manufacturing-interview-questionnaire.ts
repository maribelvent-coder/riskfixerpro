/**
 * Manufacturing Facility Interview Questionnaire
 * 
 * Complete question definitions with polarity logic, risk weights,
 * and threat/control mappings for the manufacturing interview workflow.
 * 
 * Implements the RiskFixer AI-First Assessment Framework with:
 * - T×V×I formula (Threat × Vulnerability × Impact)
 * - Risk factor counting for vulnerability adjustment
 * - Threat-specific control recommendations
 * - 6-Layer Context Library compliance
 * 
 * Industry Standards Referenced:
 * - ASIS GDL-RA (General Security Risk Assessment)
 * - CFATS (Chemical Facility Anti-Terrorism Standards)
 * - NIST Manufacturing Security Guidelines
 * - ISO 28000 Supply Chain Security
 * - OSHA Workplace Safety Integration
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Manufacturing-Questions-With-Polarity.md
 * @see RiskFixer-Manufacturing-Framework.md
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface InterviewQuestion {
  id: string;
  section: ManufacturingSection;
  zoneApplicable?: ManufacturingZone[];
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
  name: ManufacturingSection;
  description: string;
  order: number;
  aiContextNotes?: string; // Layer 3: Industry-specific context for AI
}

// ============================================================================
// TYPE-SAFE SECTION DEFINITIONS
// ============================================================================

export const MANUFACTURING_SECTIONS = [
  'Facility & Production Profile',
  'Perimeter & Access Security',
  'Production Area Security',
  'Intellectual Property Protection',
  'Raw Material & Inventory Control',
  'Finished Goods & Shipping Security',
  'Personnel Security',
  'Contractor & Vendor Management',
  'Surveillance & Monitoring',
  'Emergency Response & Incident History',
] as const;

export type ManufacturingSection = typeof MANUFACTURING_SECTIONS[number];

// ============================================================================
// MANUFACTURING ZONE DEFINITIONS
// ============================================================================

export const MANUFACTURING_ZONES = [
  'perimeter',
  'parking_lot',
  'visitor_entrance',
  'production_floor',
  'r_and_d_area',
  'raw_material_storage',
  'finished_goods_warehouse',
  'loading_dock',
  'tool_room',
  'hazmat_storage',
  'office_area',
  'break_room',
  'server_room',
] as const;

export type ManufacturingZone = typeof MANUFACTURING_ZONES[number];

// ============================================================================
// MANUFACTURING THREAT DEFINITIONS - Layer 4: Threat Intelligence
// ============================================================================

export const MANUFACTURING_THREATS = [
  'industrial_espionage_ip_theft',
  'equipment_sabotage',
  'raw_material_theft',
  'finished_goods_theft',
  'insider_theft_ip_data',
  'insider_theft_physical',
  'workplace_violence_production_floor',
  'contractor_vendor_exploitation',
  'hazmat_theft_diversion',
  'vandalism_equipment',
  'trespassing_unauthorized_access',
  'production_line_disruption',
  'trade_secret_theft',
  'theft_tooling_dies_molds',
  'counterfeit_parts_infiltration',
] as const;

export type ManufacturingThreat = typeof MANUFACTURING_THREATS[number];

// ============================================================================
// SECTION METADATA WITH AI CONTEXT - Layer 3: Industry Standards
// ============================================================================

export const MANUFACTURING_SECTION_METADATA: SectionMetadata[] = [
  {
    id: 'facility_profile',
    name: 'Facility & Production Profile',
    description: 'Establish facility context, production type, value, and special considerations',
    order: 1,
    aiContextNotes: 'Profile questions establish impact levels and threat applicability. Manufacturing type (process vs discrete) affects threat profile. IP presence triggers espionage assessment. High-value materials elevate theft risk. CFATS status requires regulatory compliance verification.',
  },
  {
    id: 'perimeter',
    name: 'Perimeter & Access Security',
    description: 'Evaluate perimeter barriers, access controls, and external security measures',
    order: 2,
    aiContextNotes: 'Manufacturing facilities require industrial-grade perimeter security. ASIS recommends 8ft+ fencing with detection for high-value operations. Gate staffing and vehicle inspection critical for cargo theft prevention. Perimeter CCTV provides deterrence and investigation support.',
  },
  {
    id: 'production',
    name: 'Production Area Security',
    description: 'Assess production floor access control, equipment security, and process protection',
    order: 3,
    aiContextNotes: 'Production floor security prevents both theft and sabotage. Badge access to production areas is baseline control. Equipment securing during off-hours reduces sabotage risk. Photography prohibition essential for IP protection. Tool control prevents both theft and quality issues.',
  },
  {
    id: 'ip_protection',
    name: 'Intellectual Property Protection',
    description: 'Evaluate trade secret, process, and proprietary information protection measures',
    order: 4,
    aiContextNotes: 'IP protection is often the highest-value security function in manufacturing. R&D areas require enhanced access control (biometric preferred). NDA enforcement is legal foundation for trade secret protection. DLP measures prevent digital exfiltration. Exit interview procedures critical for departing employees with IP access.',
  },
  {
    id: 'inventory',
    name: 'Raw Material & Inventory Control',
    description: 'Assess raw material tracking, storage security, and inventory management',
    order: 5,
    aiContextNotes: 'Raw material theft often occurs gradually through pilferage. Automated tracking systems (ERP/RFID) provide visibility. Cycle counting frequency indicates control maturity. High-value material caging is essential. Two-person rule for precious materials follows banking industry standards.',
  },
  {
    id: 'shipping',
    name: 'Finished Goods & Shipping Security',
    description: 'Evaluate finished goods warehouse, shipping controls, and dock security',
    order: 6,
    aiContextNotes: 'Finished goods represent maximum production investment. Shipping manifest verification prevents over-shipment and theft. Loading dock CCTV is critical evidence collection point. Driver control during loading reduces collusion opportunity. TAPA standards provide comprehensive shipping security guidance.',
  },
  {
    id: 'personnel',
    name: 'Personnel Security',
    description: 'Assess employee screening, insider threat awareness, and termination procedures',
    order: 7,
    aiContextNotes: 'Insider threat is primary concern for IP theft and sabotage. Background checks should be comprehensive for production employees. Insider threat programs detect behavioral indicators. Immediate access revocation on termination is critical. NDA/non-compete agreements provide legal protection.',
  },
  {
    id: 'contractor',
    name: 'Contractor & Vendor Management',
    description: 'Evaluate contractor access controls, supplier vetting, and third-party security',
    order: 8,
    aiContextNotes: 'Contractors and vendors represent significant vulnerability. Escort requirements prevent unauthorized access to sensitive areas. Supplier vetting prevents counterfeit part infiltration. Maintenance personnel access logging supports investigation. Formal vendor security programs extend security perimeter.',
  },
  {
    id: 'surveillance',
    name: 'Surveillance & Monitoring',
    description: 'Assess CCTV coverage, video retention, monitoring practices, and analytics',
    order: 9,
    aiContextNotes: 'CCTV is essential for deterrence, detection, and investigation. 75%+ coverage is recommended for manufacturing facilities. 30+ day retention supports investigation of detected losses. Real-time monitoring enables rapid response. Video analytics can detect anomalies in production environments.',
  },
  {
    id: 'emergency',
    name: 'Emergency Response & Incident History',
    description: 'Review incident history, response plans, and emergency procedures',
    order: 10,
    aiContextNotes: 'Past incidents are strongest predictor of future threats. Production continuity plans should address security disruptions. IP theft response procedures enable rapid containment. Sabotage response requires coordination with law enforcement and regulatory bodies. Formal incident documentation supports pattern analysis.',
  },
];

// ============================================================================
// SECTION 1: FACILITY & PRODUCTION PROFILE (11 questions)
// ============================================================================

const section1_facility_profile: InterviewQuestion[] = [
  {
    id: 'facility_1',
    section: 'Facility & Production Profile',
    questionText: 'What type of manufacturing does this facility perform?',
    questionType: 'multiple_choice',
    options: [
      'Discrete manufacturing (assembly, machining)',
      'Process manufacturing (chemicals, pharmaceuticals, food)',
      'Fabrication (metal, plastics)',
      'Electronics manufacturing',
      'Mixed/hybrid manufacturing',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['industrial_espionage_ip_theft', 'hazmat_theft_diversion'],
    informsImpact: true,
    helpText: 'Process manufacturing (chemicals, pharma) increases hazmat threat relevance; discrete/fabrication increases IP theft threat.',
  },
  {
    id: 'facility_2',
    section: 'Facility & Production Profile',
    questionText: 'What is the approximate square footage of the manufacturing facility?',
    questionType: 'multiple_choice',
    options: [
      'Under 25,000 sq ft',
      '25,000 - 50,000 sq ft',
      '50,001 - 100,000 sq ft',
      '100,001 - 250,000 sq ft',
      'Over 250,000 sq ft',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    helpText: 'Larger facilities have more area to secure and increased vulnerability to coverage gaps.',
  },
  {
    id: 'facility_3',
    section: 'Facility & Production Profile',
    questionText: 'What is the approximate annual production value?',
    questionType: 'multiple_choice',
    options: [
      'Under $5 million',
      '$5 million - $25 million',
      '$25 million - $100 million',
      '$100 million - $500 million',
      'Over $500 million',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
    helpText: 'Production value directly informs impact calculations for all production-related threats.',
  },
  {
    id: 'facility_4',
    section: 'Facility & Production Profile',
    questionText: 'How many shifts does the facility operate?',
    questionType: 'multiple_choice',
    options: [
      '1 shift (8 hours)',
      '2 shifts (16 hours)',
      '3 shifts (24/7 continuous)',
      'Variable shifts',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'insider_theft_physical', 'trespassing_unauthorized_access'],
    helpText: '24/7 operations increase exposure windows but may reduce after-hours intrusion risk.',
  },
  {
    id: 'facility_5',
    section: 'Facility & Production Profile',
    questionText: 'How many total employees work at this facility?',
    questionType: 'multiple_choice',
    options: [
      '1-50 employees',
      '51-150 employees',
      '151-300 employees',
      '301-500 employees',
      'Over 500 employees',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
    informsThreat: ['insider_theft_physical', 'insider_theft_ip_data', 'workplace_violence_production_floor'],
    helpText: 'Larger workforce increases insider threat detection difficulty.',
  },
  {
    id: 'facility_6',
    section: 'Facility & Production Profile',
    questionText: 'Does your facility manufacture products that contain proprietary processes, formulas, or trade secrets?',
    questionType: 'yes_no',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft', 'insider_theft_ip_data'],
    helpText: 'Yes triggers IP protection assessment and elevates espionage threat relevance.',
    followUpQuestions: [
      {
        id: 'facility_6a',
        section: 'Facility & Production Profile',
        questionText: 'What types of intellectual property are present in your manufacturing processes? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Proprietary formulas or chemical compositions',
          'Patented manufacturing processes',
          'Trade secret processes or methods',
          'Proprietary tooling, dies, or molds',
          'Custom software or control systems',
          'Unique equipment configurations',
          'Confidential customer specifications',
        ],
        required: true,
        condition: {
          questionId: 'facility_6',
          expectedValue: 'yes',
        },
        polarity: 'CONTEXT',
        riskWeight: 0,
        riskIndicators: ['proprietary formulas', 'trade secret', 'patented'],
        informsImpact: true,
        informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
      },
    ],
  },
  {
    id: 'facility_7',
    section: 'Facility & Production Profile',
    questionText: 'Do you manufacture high-value products or use high-value raw materials?',
    questionType: 'yes_no',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['raw_material_theft', 'finished_goods_theft'],
    helpText: 'Yes elevates theft threat relevance and may require enhanced controls.',
    followUpQuestions: [
      {
        id: 'facility_7a',
        section: 'Facility & Production Profile',
        questionText: 'What types of high-value materials or products? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Precious metals (gold, silver, platinum)',
          'Electronics components or assemblies',
          'Pharmaceuticals or active ingredients',
          'Aerospace components',
          'Automotive parts (catalytic converters, etc.)',
          'Industrial chemicals',
          'Copper or other valuable metals',
          'Finished consumer electronics',
        ],
        required: true,
        condition: {
          questionId: 'facility_7',
          expectedValue: 'yes',
        },
        polarity: 'CONTEXT',
        riskWeight: 0,
        riskIndicators: ['precious metals', 'pharmaceuticals', 'electronics', 'aerospace'],
        informsImpact: true,
        informsThreat: ['raw_material_theft', 'finished_goods_theft'],
      },
    ],
  },
  {
    id: 'facility_8',
    section: 'Facility & Production Profile',
    questionText: 'Does your facility handle hazardous materials subject to CFATS or other security regulations?',
    questionType: 'yes_no',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['hazmat_theft_diversion'],
    helpText: 'Yes activates hazmat threat scenarios and requires CFATS compliance evaluation.',
    followUpQuestions: [
      {
        id: 'facility_8a',
        section: 'Facility & Production Profile',
        questionText: 'What is your CFATS tier classification (if applicable)?',
        questionType: 'multiple_choice',
        options: [
          'Tier 1 (highest risk)',
          'Tier 2',
          'Tier 3',
          'Tier 4 (lowest regulated tier)',
          'Not CFATS regulated',
        ],
        required: true,
        condition: {
          questionId: 'facility_8',
          expectedValue: 'yes',
        },
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Tier 1 (highest risk)', 'Tier 2'],
        riskWeight: 1,
        riskIndicators: ['tier 1', 'tier 2'],
        informsThreat: ['hazmat_theft_diversion'],
        informsImpact: true,
      },
    ],
  },
];

// ============================================================================
// SECTION 2: PERIMETER & ACCESS SECURITY (8 questions)
// ============================================================================

const section2_perimeter: InterviewQuestion[] = [
  {
    id: 'perimeter_1',
    section: 'Perimeter & Access Security',
    zoneApplicable: ['perimeter'],
    questionText: 'What type of perimeter barrier surrounds the facility?',
    questionType: 'multiple_choice',
    options: [
      'Industrial security fence (8+ feet with anti-climb)',
      'Chain-link fence (6-8 feet)',
      'Chain-link fence (under 6 feet)',
      'Decorative fence or wall',
      'No perimeter fence',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Chain-link fence (under 6 feet)', 'No perimeter fence'],
    riskWeight: 2,
    riskIndicators: ['no perimeter fence', 'under 6 feet'],
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access', 'vandalism_equipment', 'raw_material_theft'],
    suggestsControls: ['industrial_fencing_8ft_plus', 'clear_zone_perimeter'],
  },
  {
    id: 'perimeter_2',
    section: 'Perimeter & Access Security',
    zoneApplicable: ['perimeter', 'visitor_entrance'],
    questionText: 'Is there a staffed security gate or guard shack at the main entrance?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access', 'contractor_vendor_exploitation'],
    suggestsControls: ['gate_access_with_guard'],
  },
  {
    id: 'perimeter_3',
    section: 'Perimeter & Access Security',
    zoneApplicable: ['perimeter'],
    questionText: 'Does the perimeter have intrusion detection sensors or monitoring?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access', 'vandalism_equipment'],
    suggestsControls: ['perimeter_intrusion_detection'],
  },
  {
    id: 'perimeter_4',
    section: 'Perimeter & Access Security',
    zoneApplicable: ['perimeter', 'parking_lot'],
    questionText: 'How would you rate perimeter lighting adequacy for nighttime security?',
    questionType: 'rating',
    ratingScale: { min: 1, max: 5, labels: ['Very Poor', 'Poor', 'Adequate', 'Good', 'Excellent'] },
    required: true,
    polarity: 'RATING',
    ratingBadThreshold: 2,
    riskWeight: 1,
    riskIndicators: ['1', '2', 'poor', 'inadequate'],
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access', 'vandalism_equipment', 'raw_material_theft'],
    suggestsControls: ['perimeter_lighting_industrial'],
  },
  {
    id: 'perimeter_5',
    section: 'Perimeter & Access Security',
    zoneApplicable: ['perimeter'],
    questionText: 'Are there CCTV cameras covering the perimeter?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access', 'vandalism_equipment'],
    suggestsControls: ['cctv_perimeter'],
    followUpQuestions: [
      {
        id: 'perimeter_5a',
        section: 'Perimeter & Access Security',
        zoneApplicable: ['perimeter'],
        questionText: 'What percentage of the perimeter is covered by CCTV?',
        questionType: 'multiple_choice',
        options: ['0-25%', '26-50%', '51-75%', '76-100%'],
        required: true,
        condition: {
          questionId: 'perimeter_5',
          expectedValue: 'yes',
        },
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['0-25%', '26-50%'],
        riskWeight: 1,
        riskIndicators: ['0-25%', '26-50%'],
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'perimeter_6',
    section: 'Perimeter & Access Security',
    zoneApplicable: ['perimeter'],
    questionText: 'How often are perimeter patrols or inspections conducted?',
    questionType: 'multiple_choice',
    options: [
      'Multiple times per shift',
      'Once per shift',
      'Daily',
      'Weekly',
      'Infrequently or never',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Infrequently or never'],
    riskWeight: 1,
    riskIndicators: ['infrequently', 'never'],
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access', 'vandalism_equipment'],
  },
  {
    id: 'perimeter_7',
    section: 'Perimeter & Access Security',
    zoneApplicable: ['perimeter', 'loading_dock'],
    questionText: 'Are vehicle inspection procedures in place for incoming trucks and deliveries?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'finished_goods_theft', 'counterfeit_parts_infiltration'],
    suggestsControls: ['vehicle_inspection_procedures'],
  },
];

// ============================================================================
// SECTION 3: PRODUCTION AREA SECURITY (10 questions)
// ============================================================================

const section3_production: InterviewQuestion[] = [
  {
    id: 'production_1',
    section: 'Production Area Security',
    zoneApplicable: ['production_floor'],
    questionText: 'Is access to the production floor controlled by badge/card readers?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'equipment_sabotage', 'trespassing_unauthorized_access'],
    suggestsControls: ['employee_badge_access_control', 'production_floor_access_control'],
  },
  {
    id: 'production_2',
    section: 'Production Area Security',
    zoneApplicable: ['production_floor'],
    questionText: 'Are there CCTV cameras on the production floor?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'equipment_sabotage', 'workplace_violence_production_floor'],
    suggestsControls: ['cctv_production_floor'],
    followUpQuestions: [
      {
        id: 'production_2a',
        section: 'Production Area Security',
        zoneApplicable: ['production_floor'],
        questionText: 'What percentage of production areas have CCTV coverage?',
        questionType: 'multiple_choice',
        options: ['0-25%', '26-50%', '51-75%', '76-100%'],
        required: true,
        condition: {
          questionId: 'production_2',
          expectedValue: 'yes',
        },
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['0-25%', '26-50%'],
        riskWeight: 1,
        riskIndicators: ['0-25%', '26-50%'],
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'production_3',
    section: 'Production Area Security',
    zoneApplicable: ['production_floor'],
    questionText: 'Are critical production equipment or machinery secured when not in use?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'production_line_disruption'],
    suggestsControls: ['equipment_lockout_tagout'],
  },
  {
    id: 'production_4',
    section: 'Production Area Security',
    zoneApplicable: ['production_floor', 'tool_room'],
    questionText: 'Do you have a tool control system in place?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['theft_tooling_dies_molds', 'insider_theft_physical'],
    suggestsControls: ['tool_crib_access_control'],
    followUpQuestions: [
      {
        id: 'production_4a',
        section: 'Production Area Security',
        zoneApplicable: ['tool_room'],
        questionText: 'How are tools tracked?',
        questionType: 'multiple_choice',
        options: [
          'RFID/barcode tracking system',
          'Tool crib sign-out log',
          'Shadow board system',
          'No formal tracking',
        ],
        required: true,
        condition: {
          questionId: 'production_4',
          expectedValue: 'yes',
        },
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['No formal tracking'],
        riskWeight: 1,
        riskIndicators: ['no formal tracking'],
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'production_5',
    section: 'Production Area Security',
    zoneApplicable: ['production_floor', 'r_and_d_area'],
    questionText: 'Are visitors and contractors prohibited from photographing or recording in production areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
    suggestsControls: ['photography_prohibition_enforcement', 'mobile_device_restrictions'],
  },
  {
    id: 'production_6',
    section: 'Production Area Security',
    zoneApplicable: ['production_floor'],
    questionText: 'What level of supervision is present on night/weekend shifts?',
    questionType: 'multiple_choice',
    options: [
      'Full management supervision',
      'Shift supervisor with security presence',
      'Shift supervisor only',
      'Minimal supervision (operators only)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Minimal supervision (operators only)'],
    riskWeight: 1,
    riskIndicators: ['minimal supervision', 'operators only'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'equipment_sabotage'],
  },
  {
    id: 'production_7',
    section: 'Production Area Security',
    zoneApplicable: ['production_floor'],
    questionText: 'Do you have procedures for securing work-in-progress (WIP) inventory?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'raw_material_theft'],
    suggestsControls: ['parts_cage_security'],
  },
  {
    id: 'production_8',
    section: 'Production Area Security',
    zoneApplicable: ['production_floor'],
    questionText: 'Is scrap material disposal monitored and controlled?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'raw_material_theft'],
    suggestsControls: ['scrap_disposal_procedures'],
  },
];

// ============================================================================
// SECTION 4: INTELLECTUAL PROPERTY PROTECTION (8 questions)
// ============================================================================

const section4_ip_protection: InterviewQuestion[] = [
  {
    id: 'ip_1',
    section: 'Intellectual Property Protection',
    zoneApplicable: ['r_and_d_area'],
    questionText: 'Do you have an R&D or engineering area that requires enhanced security?',
    questionType: 'yes_no',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
    followUpQuestions: [
      {
        id: 'ip_1a',
        section: 'Intellectual Property Protection',
        zoneApplicable: ['r_and_d_area'],
        questionText: 'How is access to R&D/engineering areas controlled?',
        questionType: 'multiple_choice',
        options: [
          'Biometric access (fingerprint/iris)',
          'Badge + PIN access',
          'Badge-only access',
          'Key/lock access',
          'No formal access control',
        ],
        required: true,
        condition: {
          questionId: 'ip_1',
          expectedValue: 'yes',
        },
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Key/lock access', 'No formal access control'],
        riskWeight: 2,
        riskIndicators: ['no formal access control', 'key/lock access'],
        informsVulnerability: true,
        informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
        suggestsControls: ['r_and_d_area_access_control', 'biometric_access_critical_areas'],
      },
    ],
  },
  {
    id: 'ip_2',
    section: 'Intellectual Property Protection',
    questionText: 'Are all visitors and contractors required to sign NDAs before accessing the facility?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft', 'contractor_vendor_exploitation'],
    suggestsControls: ['visitor_nda_procedures', 'non_disclosure_enforcement'],
  },
  {
    id: 'ip_3',
    section: 'Intellectual Property Protection',
    zoneApplicable: ['r_and_d_area', 'office_area'],
    questionText: 'Do you have a clean desk/clear screen policy for protecting sensitive documents and data?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
    suggestsControls: ['clean_desk_policy'],
  },
  {
    id: 'ip_4',
    section: 'Intellectual Property Protection',
    zoneApplicable: ['r_and_d_area'],
    questionText: 'Are prototypes and pre-production samples stored securely?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft', 'theft_tooling_dies_molds'],
    suggestsControls: ['prototype_security_procedures'],
  },
  {
    id: 'ip_5',
    section: 'Intellectual Property Protection',
    zoneApplicable: ['server_room', 'office_area'],
    questionText: 'Do you have data loss prevention (DLP) measures to prevent unauthorized data transfer?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_ip_data', 'industrial_espionage_ip_theft'],
    suggestsControls: ['data_loss_prevention'],
  },
  {
    id: 'ip_6',
    section: 'Intellectual Property Protection',
    zoneApplicable: ['production_floor', 'r_and_d_area'],
    questionText: 'Are personal mobile devices restricted in sensitive areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
    suggestsControls: ['mobile_device_restrictions'],
  },
  {
    id: 'ip_7',
    section: 'Intellectual Property Protection',
    questionText: 'Do you conduct exit interviews that include IP return procedures when employees leave?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_ip_data', 'trade_secret_theft'],
    suggestsControls: ['exit_interviews_ip_protection'],
  },
];

// ============================================================================
// SECTION 5: RAW MATERIAL & INVENTORY CONTROL (8 questions)
// ============================================================================

const section5_inventory: InterviewQuestion[] = [
  {
    id: 'inventory_1',
    section: 'Raw Material & Inventory Control',
    zoneApplicable: ['raw_material_storage'],
    questionText: 'Do you have an automated inventory tracking system?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    suggestsControls: ['raw_material_tracking_system', 'asset_tracking_rfid'],
    followUpQuestions: [
      {
        id: 'inventory_1a',
        section: 'Raw Material & Inventory Control',
        zoneApplicable: ['raw_material_storage'],
        questionText: 'What type of tracking system?',
        questionType: 'multiple_choice',
        options: [
          'ERP with real-time tracking',
          'RFID/barcode system',
          'Periodic inventory system',
          'Manual spreadsheet/paper logs',
          'No formal system',
        ],
        required: true,
        condition: {
          questionId: 'inventory_1',
          expectedValue: 'yes',
        },
        polarity: 'MULTIPLE_CHOICE',
        badAnswers: ['Manual spreadsheet/paper logs', 'No formal system'],
        riskWeight: 1,
        riskIndicators: ['manual spreadsheet', 'no formal system'],
        informsVulnerability: true,
      },
    ],
  },
  {
    id: 'inventory_2',
    section: 'Raw Material & Inventory Control',
    zoneApplicable: ['raw_material_storage'],
    questionText: 'How frequently do you conduct cycle counts of raw materials and components?',
    questionType: 'multiple_choice',
    options: [
      'Daily for critical items',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Annually or less frequently',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Annually or less frequently'],
    riskWeight: 1,
    riskIndicators: ['annually', 'less frequently'],
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    suggestsControls: ['cycle_counting_program'],
  },
  {
    id: 'inventory_3',
    section: 'Raw Material & Inventory Control',
    zoneApplicable: ['raw_material_storage'],
    questionText: 'Are high-value raw materials stored in secured cages or locked areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    suggestsControls: ['raw_material_caging'],
  },
  {
    id: 'inventory_4',
    section: 'Raw Material & Inventory Control',
    zoneApplicable: ['raw_material_storage'],
    questionText: 'Do you track materials by lot/serial numbers?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'counterfeit_parts_infiltration'],
    suggestsControls: ['bill_of_materials_tracking'],
  },
  {
    id: 'inventory_5',
    section: 'Raw Material & Inventory Control',
    zoneApplicable: ['raw_material_storage'],
    questionText: 'Are CCTV cameras covering raw material storage areas?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    suggestsControls: ['cctv_raw_material_storage'],
  },
  {
    id: 'inventory_6',
    section: 'Raw Material & Inventory Control',
    zoneApplicable: ['raw_material_storage'],
    questionText: 'Do you have exception-based reporting for inventory discrepancies?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    suggestsControls: ['material_reconciliation'],
  },
  {
    id: 'inventory_7',
    section: 'Raw Material & Inventory Control',
    zoneApplicable: ['raw_material_storage'],
    questionText: 'Do you require two-person authorization for accessing high-value materials?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    suggestsControls: ['two_person_rule_sensitive_areas'],
  },
];

// ============================================================================
// SECTION 6: FINISHED GOODS & SHIPPING SECURITY (6 questions)
// ============================================================================

const section6_shipping: InterviewQuestion[] = [
  {
    id: 'shipping_1',
    section: 'Finished Goods & Shipping Security',
    zoneApplicable: ['finished_goods_warehouse'],
    questionText: 'Are finished goods stored in a separate, secured warehouse or area?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'insider_theft_physical'],
    suggestsControls: ['finished_goods_caging'],
  },
  {
    id: 'shipping_2',
    section: 'Finished Goods & Shipping Security',
    zoneApplicable: ['finished_goods_warehouse'],
    questionText: 'Is access to the finished goods warehouse controlled by badge readers?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'insider_theft_physical'],
    suggestsControls: ['finished_goods_inventory_control'],
  },
  {
    id: 'shipping_3',
    section: 'Finished Goods & Shipping Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Do you verify shipping manifests against actual loaded products?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'insider_theft_physical'],
    suggestsControls: ['shipping_receiving_verification'],
  },
  {
    id: 'shipping_4',
    section: 'Finished Goods & Shipping Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Are loading docks monitored by CCTV?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'contractor_vendor_exploitation'],
    suggestsControls: ['cctv_loading_docks'],
  },
  {
    id: 'shipping_5',
    section: 'Finished Goods & Shipping Security',
    zoneApplicable: ['finished_goods_warehouse'],
    questionText: 'How frequently do you conduct inventory counts of finished goods?',
    questionType: 'multiple_choice',
    options: [
      'Daily',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Annually',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Quarterly', 'Annually'],
    riskWeight: 1,
    riskIndicators: ['quarterly', 'annually'],
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'insider_theft_physical'],
    suggestsControls: ['finished_goods_inventory_control'],
  },
  {
    id: 'shipping_6',
    section: 'Finished Goods & Shipping Security',
    zoneApplicable: ['loading_dock'],
    questionText: 'Do drivers/carriers remain with their vehicles during loading, or are they escorted away?',
    questionType: 'multiple_choice',
    options: [
      'Escorted to waiting area, not allowed in loading zone',
      'Remain in cab, supervised by dock personnel',
      'Drivers can move freely in loading area',
      'No formal policy',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Drivers can move freely in loading area', 'No formal policy'],
    riskWeight: 1,
    riskIndicators: ['move freely', 'no formal policy'],
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'contractor_vendor_exploitation'],
  },
];

// ============================================================================
// SECTION 7: PERSONNEL SECURITY (7 questions)
// ============================================================================

const section7_personnel: InterviewQuestion[] = [
  {
    id: 'personnel_1',
    section: 'Personnel Security',
    questionText: 'Do you conduct background checks on production employees?',
    questionType: 'multiple_choice',
    options: [
      'Comprehensive (criminal, credit, employment, education)',
      'Standard (criminal history, employment verification)',
      'Basic checks only (criminal history)',
      'No background checks',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Basic checks only (criminal history)', 'No background checks'],
    riskWeight: 2,
    riskIndicators: ['no background checks', 'basic checks only'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'insider_theft_ip_data', 'equipment_sabotage'],
    suggestsControls: ['employee_background_checks_production'],
  },
  {
    id: 'personnel_2',
    section: 'Personnel Security',
    questionText: 'Do you require background checks for contractors and temporary workers?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'insider_theft_physical'],
    suggestsControls: ['contractor_background_checks'],
  },
  {
    id: 'personnel_3',
    section: 'Personnel Security',
    questionText: 'Do you have an insider threat awareness program?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'insider_theft_ip_data', 'equipment_sabotage'],
    suggestsControls: ['insider_threat_program'],
  },
  {
    id: 'personnel_4',
    section: 'Personnel Security',
    questionText: 'Do employees receive security awareness training specific to manufacturing environments?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'industrial_espionage_ip_theft'],
    suggestsControls: ['security_awareness_training_manufacturing'],
  },
  {
    id: 'personnel_5',
    section: 'Personnel Security',
    questionText: 'Are employees subject to random bag checks or inspections when exiting?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'raw_material_theft'],
  },
  {
    id: 'personnel_6',
    section: 'Personnel Security',
    questionText: 'Do you have procedures for immediately revoking access when employees are terminated?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 2,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'insider_theft_ip_data', 'equipment_sabotage'],
    suggestsControls: ['immediate_access_revocation'],
  },
  {
    id: 'personnel_7',
    section: 'Personnel Security',
    questionText: 'Do employees sign non-compete or non-disclosure agreements?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['insider_theft_ip_data', 'trade_secret_theft'],
    suggestsControls: ['non_compete_enforcement'],
  },
];

// ============================================================================
// SECTION 8: CONTRACTOR & VENDOR MANAGEMENT (5 questions)
// ============================================================================

const section8_contractor: InterviewQuestion[] = [
  {
    id: 'contractor_1',
    section: 'Contractor & Vendor Management',
    questionText: 'Are all contractors and vendors required to sign in/out when visiting?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'trespassing_unauthorized_access'],
    suggestsControls: ['visitor_contractor_management'],
  },
  {
    id: 'contractor_2',
    section: 'Contractor & Vendor Management',
    questionText: 'Are contractors and visitors escorted at all times?',
    questionType: 'multiple_choice',
    options: [
      'Yes, always escorted',
      'Escorted in sensitive areas only',
      'Not escorted',
      'Varies by contractor',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Not escorted', 'Varies by contractor'],
    riskWeight: 2,
    riskIndicators: ['not escorted', 'varies'],
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'industrial_espionage_ip_theft'],
    suggestsControls: ['visitor_escort_requirements'],
  },
  {
    id: 'contractor_3',
    section: 'Contractor & Vendor Management',
    questionText: 'Do you vet suppliers and verify the authenticity of parts/materials received?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    riskIndicators: ['no'],
    informsVulnerability: true,
    informsThreat: ['counterfeit_parts_infiltration'],
    suggestsControls: ['supplier_vetting_program'],
  },
  {
    id: 'contractor_4',
    section: 'Contractor & Vendor Management',
    questionText: 'Are maintenance and service personnel access logged and tracked?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'equipment_sabotage'],
    suggestsControls: ['maintenance_access_procedures'],
  },
  {
    id: 'contractor_5',
    section: 'Contractor & Vendor Management',
    questionText: 'Do you have a formal vendor security requirements program?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'counterfeit_parts_infiltration'],
    suggestsControls: ['vendor_security_program'],
  },
];

// ============================================================================
// SECTION 9: SURVEILLANCE & MONITORING (5 questions)
// ============================================================================

const section9_surveillance: InterviewQuestion[] = [
  {
    id: 'surveillance_1',
    section: 'Surveillance & Monitoring',
    questionText: 'What percentage of your facility is covered by CCTV?',
    questionType: 'multiple_choice',
    options: ['0-25%', '26-50%', '51-75%', '76-100%'],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['0-25%', '26-50%'],
    riskWeight: 2,
    riskIndicators: ['0-25%', '26-50%'],
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'equipment_sabotage', 'trespassing_unauthorized_access'],
    suggestsControls: ['cctv_production_floor', 'cctv_raw_material_storage', 'cctv_finished_goods_warehouse'],
  },
  {
    id: 'surveillance_2',
    section: 'Surveillance & Monitoring',
    questionText: 'How long is video footage retained?',
    questionType: 'multiple_choice',
    options: [
      'Less than 7 days',
      '7-14 days',
      '15-30 days',
      '31-60 days',
      'Over 60 days',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Less than 7 days', '7-14 days'],
    riskWeight: 1,
    riskIndicators: ['less than 7', '7-14 days'],
    informsVulnerability: true,
    suggestsControls: ['video_retention_30_days'],
  },
  {
    id: 'surveillance_3',
    section: 'Surveillance & Monitoring',
    questionText: 'Is video monitored in real-time by security staff?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'trespassing_unauthorized_access'],
  },
  {
    id: 'surveillance_4',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use video analytics or AI-based monitoring for anomaly detection?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'insider_theft_physical'],
    suggestsControls: ['video_analytics_manufacturing'],
  },
  {
    id: 'surveillance_5',
    section: 'Surveillance & Monitoring',
    zoneApplicable: ['production_floor'],
    questionText: 'Are critical equipment and assets monitored with sensors or alarms?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'production_line_disruption'],
    suggestsControls: ['equipment_monitoring_system'],
  },
];

// ============================================================================
// SECTION 10: EMERGENCY RESPONSE & INCIDENT HISTORY (6 questions)
// ============================================================================

const section10_emergency: InterviewQuestion[] = [
  {
    id: 'emergency_1',
    section: 'Emergency Response & Incident History',
    questionText: 'Do you have a workplace violence response plan specific to the production environment?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['workplace_violence_production_floor'],
    suggestsControls: ['workplace_violence_response_plan'],
  },
  {
    id: 'emergency_2',
    section: 'Emergency Response & Incident History',
    questionText: 'Have you experienced any security incidents in the past 3 years? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Theft of raw materials',
      'Theft of finished goods',
      'Employee theft',
      'IP theft or suspected espionage',
      'Equipment sabotage or tampering',
      'Workplace violence incident',
      'Unauthorized access or trespassing',
      'Vandalism',
      'Counterfeit parts discovered',
      'None of the above',
    ],
    required: true,
    polarity: 'YES_BAD',
    riskWeight: 1, // Per incident type selected
    informsThreat: [
      'raw_material_theft',
      'finished_goods_theft',
      'insider_theft_physical',
      'industrial_espionage_ip_theft',
      'equipment_sabotage',
      'workplace_violence_production_floor',
      'trespassing_unauthorized_access',
      'vandalism_equipment',
      'counterfeit_parts_infiltration',
    ],
    helpText: 'Each incident type selected increases likelihood for corresponding threat.',
  },
  {
    id: 'emergency_3',
    section: 'Emergency Response & Incident History',
    questionText: 'Do you have a production continuity plan that addresses security disruptions?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['production_line_disruption', 'equipment_sabotage'],
    suggestsControls: ['production_continuity_plan'],
  },
  {
    id: 'emergency_4',
    section: 'Emergency Response & Incident History',
    questionText: 'Are there documented procedures for responding to IP theft or espionage?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'insider_theft_ip_data', 'trade_secret_theft'],
    suggestsControls: ['ip_theft_response_procedures'],
  },
  {
    id: 'emergency_5',
    section: 'Emergency Response & Incident History',
    questionText: 'Do you have a formal sabotage incident response plan?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'production_line_disruption'],
    suggestsControls: ['sabotage_incident_response'],
  },
  {
    id: 'emergency_6',
    section: 'Emergency Response & Incident History',
    questionText: 'Are security incidents formally investigated and documented?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsVulnerability: true,
  },
];

// ============================================================================
// COMBINED QUESTIONS EXPORT
// ============================================================================

export const MANUFACTURING_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  ...section1_facility_profile,
  ...section2_perimeter,
  ...section3_production,
  ...section4_ip_protection,
  ...section5_inventory,
  ...section6_shipping,
  ...section7_personnel,
  ...section8_contractor,
  ...section9_surveillance,
  ...section10_emergency,
];

// ============================================================================
// HELPER FUNCTIONS - Query Interface
// ============================================================================

/**
 * Get all questions for a specific section
 */
export function getQuestionsBySection(section: ManufacturingSection): InterviewQuestion[] {
  return MANUFACTURING_INTERVIEW_QUESTIONS.filter(q => q.section === section);
}

/**
 * Get a question by ID, including follow-up questions
 */
export function getQuestionById(id: string): InterviewQuestion | undefined {
  for (const question of MANUFACTURING_INTERVIEW_QUESTIONS) {
    if (question.id === id) return question;
    if (question.followUpQuestions) {
      const followUp = question.followUpQuestions.find(f => f.id === id);
      if (followUp) return followUp;
    }
  }
  return undefined;
}

/**
 * Get all questions that inform a specific threat
 */
export function getQuestionsForThreat(threatId: ManufacturingThreat): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of MANUFACTURING_INTERVIEW_QUESTIONS) {
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
  
  for (const question of MANUFACTURING_INTERVIEW_QUESTIONS) {
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
 * Get all YES_BAD questions (incident indicators)
 */
export function getYesBadQuestions(): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of MANUFACTURING_INTERVIEW_QUESTIONS) {
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
  
  for (const question of MANUFACTURING_INTERVIEW_QUESTIONS) {
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
  
  for (const question of MANUFACTURING_INTERVIEW_QUESTIONS) {
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
 * Get all questions flattened (including follow-ups)
 */
export function getAllQuestionsFlattened(): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of MANUFACTURING_INTERVIEW_QUESTIONS) {
    result.push(question);
    if (question.followUpQuestions) {
      for (const followUp of question.followUpQuestions) {
        result.push(followUp);
      }
    }
  }
  
  return result;
}

/**
 * Get question count by section
 */
export function getQuestionCountBySection(): Record<ManufacturingSection, number> {
  const counts: Record<ManufacturingSection, number> = {} as Record<ManufacturingSection, number>;
  
  for (const section of MANUFACTURING_SECTIONS) {
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
  return MANUFACTURING_SECTION_METADATA.find(s => s.id === sectionId);
}

/**
 * Get section metadata by name
 */
export function getSectionMetadataByName(sectionName: ManufacturingSection): SectionMetadata | undefined {
  return MANUFACTURING_SECTION_METADATA.find(s => s.name === sectionName);
}

/**
 * Get questions that suggest specific controls
 */
export function getQuestionsForControl(controlId: string): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of MANUFACTURING_INTERVIEW_QUESTIONS) {
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
export function getCriticalQuestionsForThreat(threatId: ManufacturingThreat): string[] {
  const criticalQuestionMap: Record<ManufacturingThreat, string[]> = {
    industrial_espionage_ip_theft: ['ip_1a', 'ip_2', 'ip_4', 'ip_5', 'production_5'],
    equipment_sabotage: ['production_1', 'production_3', 'personnel_6', 'surveillance_5'],
    raw_material_theft: ['inventory_1', 'inventory_3', 'inventory_7', 'perimeter_1'],
    finished_goods_theft: ['shipping_2', 'shipping_3', 'shipping_4', 'shipping_5'],
    insider_theft_ip_data: ['ip_5', 'ip_7', 'personnel_3', 'personnel_6'],
    insider_theft_physical: ['personnel_1', 'personnel_3', 'personnel_5', 'production_1'],
    workplace_violence_production_floor: ['emergency_1', 'personnel_6'],
    contractor_vendor_exploitation: ['contractor_1', 'contractor_2', 'ip_2', 'perimeter_2'],
    hazmat_theft_diversion: ['facility_8a'],
    vandalism_equipment: ['perimeter_1', 'perimeter_3', 'surveillance_1'],
    trespassing_unauthorized_access: ['perimeter_1', 'perimeter_2', 'production_1'],
    production_line_disruption: ['production_3', 'emergency_3', 'emergency_5'],
    trade_secret_theft: ['ip_2', 'ip_3', 'ip_4', 'production_5'],
    theft_tooling_dies_molds: ['production_4', 'production_4a'],
    counterfeit_parts_infiltration: ['contractor_3', 'inventory_4'],
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
    
    // Validate section is in MANUFACTURING_SECTIONS
    if (!MANUFACTURING_SECTIONS.includes(question.section as ManufacturingSection)) {
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
        MANUFACTURING_INTERVIEW_QUESTIONS.some(q => q.id === question.condition!.questionId);
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
  sectionCounts: Record<ManufacturingSection, number>;
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
  for (const q of MANUFACTURING_INTERVIEW_QUESTIONS) {
    if (q.followUpQuestions) {
      followUpCount += q.followUpQuestions.length;
    }
  }
  
  return {
    totalQuestions: allQuestions.length,
    topLevelQuestions: MANUFACTURING_INTERVIEW_QUESTIONS.length,
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
 * Get AI context prompt for manufacturing assessments
 * Layer 3: Industry-Specific Standards integration
 */
export function getAIContextPrompt(): string {
  return `
## Manufacturing Facility Security Assessment Context

### Industry Standards Applied
- **ASIS GDL-RA**: General Security Risk Assessment methodology
- **CFATS**: Chemical Facility Anti-Terrorism Standards for hazmat facilities
- **NIST Manufacturing Security**: Framework for industrial cybersecurity
- **ISO 28000**: Supply chain security management
- **OSHA**: Workplace safety integration with security

### Key Manufacturing Threats (by Impact)
1. **Industrial Espionage / IP Theft**: Average loss $500K-$10M+. Targets proprietary processes, formulas, and designs.
2. **Equipment Sabotage**: Rare but devastating. Can cause days/weeks of production downtime.
3. **Trade Secret Theft**: Average loss $100K-$500K. Often via departing employees.
4. **Raw Material Theft**: Monthly occurrence. High-value materials (precious metals, pharma ingredients) most targeted.
5. **Finished Goods Theft**: Common at shipping/loading. TAPA standards provide guidance.
6. **Insider Theft (Physical)**: 60%+ of manufacturing theft involves insiders (FBI statistics).
7. **Counterfeit Parts**: Growing supply chain threat. Quality and safety implications.

### Critical Control Points
- **Production Floor Access**: Badge control is baseline. Biometric for sensitive processes.
- **R&D Areas**: Enhanced access control, NDA enforcement, photography prohibition.
- **Raw Material Storage**: Caging for high-value materials, two-person rule.
- **Loading Docks**: CCTV, manifest verification, driver control during loading.
- **Tool Room**: Tracking systems prevent tool theft and ensure quality control.

### Assessment Scoring Guidance
- **Vulnerability increases** when: incident history present, controls missing, IP unprotected
- **Impact factors**: production value, IP types, material value, downtime cost
- **Threat likelihood factors**: industry sector, material attractiveness, competitor activity

### Production Continuity Analysis
Calculate potential downtime costs:
- Direct costs: Lost production, expediting, overtime
- Indirect costs: Customer penalties, reputation damage, market share loss
- Use client's annual production value to estimate per-day impact

### Report Focus Areas
1. IP protection measures (highest value for most manufacturing clients)
2. Insider threat mitigation (largest threat vector)
3. Raw material and finished goods security
4. Production floor access control
5. Supply chain security (counterfeit prevention)
`;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default MANUFACTURING_INTERVIEW_QUESTIONS;
