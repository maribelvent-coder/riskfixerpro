/**
 * Warehouse & Distribution Center Security Assessment Interview Questionnaire
 * 
 * Comprehensive 55+ question framework covering cargo theft prevention, loading dock security,
 * perimeter/yard security, inventory control, personnel access, and fleet management.
 * 
 * Each question includes threat/control mappings for automated risk analysis.
 */

export interface WarehouseInterviewQuestion {
  id: string;
  section: string;
  zoneApplicable?: string[]; // Yard, loading dock, warehouse interior, etc.
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist' | 'number';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: WarehouseInterviewQuestion[];
  riskIndicators?: string[]; // Keywords that elevate risk
  
  // Direct mapping to risk scenarios
  informsThreat?: string[]; // Threat IDs this question informs
  informsVulnerability?: boolean; // Does this assess vulnerability?
  informsImpact?: boolean; // Does this assess potential impact?
  suggestsControls?: string[]; // Control IDs this might reveal need for
}

const section1_facilityProfile: WarehouseInterviewQuestion[] = [
  {
    id: 'facility_1',
    section: 'Facility & Operations Profile',
    questionText: 'What type of warehouse operation is this?',
    questionType: 'multiple_choice',
    options: [
      'Distribution center (outbound focus)',
      'Fulfillment center (e-commerce)',
      'Third-party logistics (3PL) - multi-client',
      'Cold storage/Refrigerated warehouse',
      'Manufacturing warehouse (raw materials + finished goods)',
      'Cross-dock facility',
      'Bonded warehouse (customs)',
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['cargo_theft_full_truckload', 'insider_theft_employee_driver_collusion'],
  },

  {
    id: 'facility_2',
    section: 'Facility & Operations Profile',
    questionText: 'What is the approximate square footage of the warehouse?',
    questionType: 'multiple_choice',
    options: [
      'Under 50,000 sq ft',
      '50,000 - 150,000 sq ft',
      '150,000 - 300,000 sq ft',
      '300,000 - 500,000 sq ft',
      'Over 500,000 sq ft',
    ],
    required: true,
    informsImpact: true,
    informsVulnerability: true, // Larger = harder to secure
  },

  {
    id: 'facility_3',
    section: 'Facility & Operations Profile',
    questionText: 'What is the approximate total value of inventory typically stored in the facility?',
    questionType: 'multiple_choice',
    options: [
      'Under $1 million',
      '$1M - $5M',
      '$5M - $20M',
      '$20M - $50M',
      'Over $50M',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'facility_4',
    section: 'Facility & Operations Profile',
    questionText: 'Do you store high-value goods that are frequent cargo theft targets?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['cargo_theft_full_truckload', 'cargo_theft_pilferage'],
    followUpQuestions: [
      {
        id: 'facility_4a',
        section: 'Facility & Operations Profile',
        questionText: 'What high-value product categories do you handle? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Electronics (TVs, computers, phones)',
          'Pharmaceuticals',
          'Alcohol/Spirits',
          'Designer clothing/footwear',
          'Cosmetics/Fragrances',
          'Copper/metals',
          'Food (organic, premium brands)',
          'Auto parts (high-end)',
          'Tools/power tools',
        ],
        required: true,
        informsImpact: true,
      },
    ],
  },

  {
    id: 'facility_5',
    section: 'Facility & Operations Profile',
    questionText: 'How many total employees work at this facility?',
    questionType: 'multiple_choice',
    options: [
      '1-25 employees',
      '26-75 employees',
      '76-150 employees',
      '151-300 employees',
      'Over 300 employees',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'facility_6',
    section: 'Facility & Operations Profile',
    questionText: 'What are your typical operating hours?',
    questionType: 'multiple_choice',
    options: [
      '24/7 operations',
      'Extended hours (5 AM - 11 PM)',
      'Two shifts (6 AM - 10 PM)',
      'Single shift (8 AM - 5 PM)',
      'Varies by season/demand',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'loading_dock_breach'],
  },

  {
    id: 'facility_7',
    section: 'Facility & Operations Profile',
    questionText: 'Approximately how many trucks (inbound + outbound) do you handle per day?',
    questionType: 'multiple_choice',
    options: [
      '1-10 trucks/day',
      '11-30 trucks/day',
      '31-75 trucks/day',
      '76-150 trucks/day',
      'Over 150 trucks/day',
    ],
    required: true,
    informsVulnerability: true, // High volume = harder to monitor
  },
];
const section2_incidentHistory: WarehouseInterviewQuestion[] = [
  {
    id: 'incident_1',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced a full truckload cargo theft in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['cargo_theft_full_truckload'],
    followUpQuestions: [
      {
        id: 'incident_1a',
        section: 'Cargo Theft & Incident History',
        questionText: 'How many full truckload theft incidents?',
        questionType: 'number',
        required: true,
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
      },
    ],
  },

  {
    id: 'incident_2',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced cargo pilferage (small-scale theft) in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['cargo_theft_pilferage'],
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
        riskIndicators: ['frequently', 'constantly'],
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
    informsVulnerability: true,
    informsThreat: ['inventory_shrinkage_unknown', 'cargo_theft_pilferage'],
    riskIndicators: ['2% - 3%', 'over 3%', 'unknown'],
  },

  {
    id: 'incident_4',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you had any confirmed employee theft cases in the past 2 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    followUpQuestions: [
      {
        id: 'incident_4a',
        section: 'Cargo Theft & Incident History',
        questionText: 'How many employee theft cases?',
        questionType: 'number',
        required: true,
      },
    ],
  },

  {
    id: 'incident_5',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced trailer theft from your yard in the past 3 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['yard_trailer_theft'],
  },

  {
    id: 'incident_6',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you had any company vehicles stolen in the past 3 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['vehicle_fleet_theft'],
  },

  {
    id: 'incident_7',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have any of your loads been hijacked in-transit in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['hijacking_in_transit'],
  },

  {
    id: 'incident_8',
    section: 'Cargo Theft & Incident History',
    questionText: 'Are you aware of cargo theft incidents at nearby warehouses or in your area?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['cargo_theft_full_truckload'],
    informsVulnerability: true,
  },
];
const section3_perimeter: WarehouseInterviewQuestion[] = [
  {
    id: 'perimeter_1',
    section: 'Perimeter & Yard Security',
    questionText: 'What type of perimeter fencing do you have?',
    questionType: 'multiple_choice',
    options: [
      'High-security chain link (8+ feet) with barbed wire/razor wire',
      'Standard chain link (6-8 feet) with barbed wire',
      'Standard chain link (6-8 feet) without barbed wire',
      'Other fencing (wooden, ornamental)',
      'No fencing',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['high_security_fencing_8ft'],
    riskIndicators: ['standard chain link', 'other fencing', 'no fencing'],
  },

  {
    id: 'perimeter_2',
    section: 'Perimeter & Yard Security',
    questionText: 'Is your perimeter fence in good condition with no gaps or damage?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    riskIndicators: ['no'],
  },

  {
    id: 'perimeter_3',
    section: 'Perimeter & Yard Security',
    questionText: 'Do you have perimeter intrusion detection (fence sensors, ground sensors, etc.)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_intrusion_detection'],
  },

  {
    id: 'perimeter_4',
    section: 'Perimeter & Yard Security',
    questionText: 'How is vehicle access to the property controlled?',
    questionType: 'multiple_choice',
    options: [
      'Manned guard gate with vehicle inspection',
      'Automated gate with access control (keycard/transponder)',
      'Gate that is locked after hours only',
      'Open access during business hours, locked after hours',
      'Open access 24/7',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['gate_access_control_with_guard'],
    riskIndicators: ['open access 24/7', 'open access during'],
  },

  {
    id: 'perimeter_5',
    section: 'Perimeter & Yard Security',
    questionText: 'Rate the adequacy of perimeter and yard lighting',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Poor - Many dark areas', 'Fair', 'Adequate', 'Good', 'Excellent - No dark areas'] 
    },
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_lighting_adequate', 'yard_lighting'],
  },

  {
    id: 'perimeter_6',
    section: 'Perimeter & Yard Security',
    questionText: 'Do you have CCTV coverage of the perimeter and yard?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_perimeter', 'cctv_yard'],
    followUpQuestions: [
      {
        id: 'perimeter_6a',
        section: 'Perimeter & Yard Security',
        questionText: 'What percentage of the perimeter and yard has camera coverage?',
        questionType: 'multiple_choice',
        options: [
          '75-100% coverage',
          '50-75% coverage',
          '25-50% coverage',
          'Under 25% coverage',
        ],
        required: true,
        riskIndicators: ['under 25%'],
      },
    ],
  },

  {
    id: 'perimeter_7',
    section: 'Perimeter & Yard Security',
    questionText: 'Is there a clear zone (no vegetation, obstructions) around the perimeter fence?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['clear_zone_perimeter'],
  },

  {
    id: 'perimeter_8',
    section: 'Perimeter & Yard Security',
    questionText: 'How are parked trailers (loaded or empty) secured in the yard?',
    questionType: 'checklist',
    options: [
      'Designated secure parking area',
      'Kingpin locks on all trailers',
      'Yard jockey keys controlled',
      'CCTV monitoring of trailer parking',
      'Regular patrols of yard',
      'No specific security measures',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['trailer_parking_designated_area', 'kingpin_locks_parked_trailers'],
    riskIndicators: ['no specific security'],
  },

  {
    id: 'perimeter_9',
    section: 'Perimeter & Yard Security',
    questionText: 'Do you conduct regular perimeter security inspections?',
    questionType: 'multiple_choice',
    options: [
      'Daily inspections',
      'Weekly inspections',
      'Monthly inspections',
      'Rarely/Never',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely/never'],
  },
];
const section4_loadingDock: WarehouseInterviewQuestion[] = [
  {
    id: 'dock_1',
    section: 'Loading Dock Security',
    questionText: 'How many loading dock doors does your facility have?',
    questionType: 'multiple_choice',
    options: [
      '1-5 doors',
      '6-15 doors',
      '16-30 doors',
      '31-50 doors',
      'Over 50 doors',
    ],
    required: true,
    informsVulnerability: true, // More doors = more vulnerability
  },

  {
    id: 'dock_2',
    section: 'Loading Dock Security',
    questionText: 'Do you have CCTV cameras covering all loading dock doors?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['loading_dock_cctv_all_doors'],
    followUpQuestions: [
      {
        id: 'dock_2a',
        section: 'Loading Dock Security',
        questionText: 'Can the cameras capture activity inside trailers when doors are open?',
        questionType: 'yes_no',
        required: true,
      },
    ],
  },

  {
    id: 'dock_3',
    section: 'Loading Dock Security',
    questionText: 'Do you have electronic sensors that detect when dock doors are open/closed?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dock_door_sensors_open_close'],
  },

  {
    id: 'dock_4',
    section: 'Loading Dock Security',
    questionText: 'Do you use a trailer seal verification system?',
    questionType: 'multiple_choice',
    options: [
      'Yes - electronic seal verification with documentation',
      'Yes - manual seal verification with documentation',
      'Informal seal checking (not documented)',
      'No seal verification',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['trailer_seal_verification_system'],
    riskIndicators: ['informal', 'no seal'],
  },

  {
    id: 'dock_5',
    section: 'Loading Dock Security',
    questionText: 'What happens to dock doors when not actively loading/unloading?',
    questionType: 'multiple_choice',
    options: [
      'Doors locked, trailer disconnected',
      'Doors closed but not locked',
      'Doors may remain open between loads',
      'No formal procedure',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['doors may remain', 'no formal'],
  },

  {
    id: 'dock_6',
    section: 'Loading Dock Security',
    questionText: 'Do you use dock scheduling/appointment systems for arriving trucks?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dock_scheduling_system'],
  },

  {
    id: 'dock_7',
    section: 'Loading Dock Security',
    questionText: 'Are dock levelers secured (locked or raised) when not in use?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dock_leveler_locks'],
  },

  {
    id: 'dock_8',
    section: 'Loading Dock Security',
    questionText: 'Do you verify that outbound load contents match shipping manifests?',
    questionType: 'multiple_choice',
    options: [
      'Yes - 100% verification with documentation',
      'Yes - random verification',
      'Informal verification',
      'No verification process',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['shipping_manifest_verification', 'load_verification_procedures'],
    riskIndicators: ['informal', 'no verification'],
  },

  {
    id: 'dock_9',
    section: 'Loading Dock Security',
    questionText: 'How do you prevent drivers from entering the warehouse during loading/unloading?',
    questionType: 'multiple_choice',
    options: [
      'Drivers must remain in designated waiting area, physically separated',
      'Drivers are escorted if they need to enter warehouse',
      'Drivers restricted but no physical barrier',
      'No restrictions - drivers can enter',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['no restrictions'],
  },

  {
    id: 'dock_10',
    section: 'Loading Dock Security',
    questionText: 'Do you have an intrusion alarm system on loading dock doors?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dock_intrusion_alarm'],
  },
];
const section5_inventory: WarehouseInterviewQuestion[] = [
  {
    id: 'inventory_1',
    section: 'Inventory Control & Management',
    questionText: 'Do you have a Warehouse Management System (WMS) in place?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['warehouse_management_system'],
    followUpQuestions: [
      {
        id: 'inventory_1a',
        section: 'Inventory Control & Management',
        questionText: 'Does your WMS provide real-time inventory visibility?',
        questionType: 'yes_no',
        required: true,
        suggestsControls: ['real_time_inventory_visibility'],
      },
    ],
  },

  {
    id: 'inventory_2',
    section: 'Inventory Control & Management',
    questionText: 'How often do you conduct cycle counts for inventory verification?',
    questionType: 'multiple_choice',
    options: [
      'Daily on high-value items',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Only annual physical inventory',
      'No formal cycle counting',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cycle_counting_program'],
    riskIndicators: ['only annual', 'no formal'],
  },

  {
    id: 'inventory_3',
    section: 'Inventory Control & Management',
    questionText: 'Is high-value inventory stored in secure caging or segregated areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['high_value_inventory_caging', 'interior_caging_high_value'],
    followUpQuestions: [
      {
        id: 'inventory_3a',
        section: 'Inventory Control & Management',
        questionText: 'How is access to high-value storage areas controlled?',
        questionType: 'multiple_choice',
        options: [
          'Electronic access control with audit trail',
          'Key control with sign-out log',
          'Manager-only access',
          'General employee access',
        ],
        required: true,
        riskIndicators: ['general employee'],
      },
    ],
  },

  {
    id: 'inventory_4',
    section: 'Inventory Control & Management',
    questionText: 'Do you use lot numbers or serial numbers to track inventory?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['lot_serial_tracking'],
  },

  {
    id: 'inventory_5',
    section: 'Inventory Control & Management',
    questionText: 'Do you have CCTV coverage of high-value storage areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_high_value_storage'],
  },

  {
    id: 'inventory_6',
    section: 'Inventory Control & Management',
    questionText: 'Do you use exception-based reporting to identify unusual transactions?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    suggestsControls: ['exception_based_reporting'],
  },

  {
    id: 'inventory_7',
    section: 'Inventory Control & Management',
    questionText: 'Do you require a two-person rule for accessing high-value inventory?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['two_person_rule_high_value'],
  },
];
const section6_personnel: WarehouseInterviewQuestion[] = [
  {
    id: 'personnel_1',
    section: 'Personnel & Access Control',
    questionText: 'Do you conduct background checks on all warehouse employees?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive background checks on all employees',
      'Yes - criminal background only',
      'Selective - supervisors and high-access positions only',
      'No background checks',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    suggestsControls: ['employee_background_checks_all'],
    riskIndicators: ['no background'],
  },

  {
    id: 'personnel_2',
    section: 'Personnel & Access Control',
    questionText: 'Do you conduct background checks on drivers (company fleet and contractors)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['driver_background_checks'],
  },

  {
    id: 'personnel_3',
    section: 'Personnel & Access Control',
    questionText: 'What type of employee access control system do you have?',
    questionType: 'multiple_choice',
    options: [
      'Electronic badge access with audit trail',
      'Key card system',
      'Physical keys only',
      'No formal access control',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['employee_badge_access_control'],
    riskIndicators: ['physical keys only', 'no formal'],
  },

  {
    id: 'personnel_4',
    section: 'Personnel & Access Control',
    questionText: 'How do you manage visitor access (vendors, contractors, visitors)?',
    questionType: 'multiple_choice',
    options: [
      'Check-in with ID verification, visitor badge, escort required',
      'Check-in with visitor badge, no escort',
      'Informal sign-in',
      'Open access',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['visitor_check_in_system'],
    riskIndicators: ['informal', 'open access'],
  },

  {
    id: 'personnel_5',
    section: 'Personnel & Access Control',
    questionText: 'Do you have a driver check-in procedure for inbound/outbound trucks?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['driver_check_in_procedures'],
    followUpQuestions: [
      {
        id: 'personnel_5a',
        section: 'Personnel & Access Control',
        questionText: 'What does the driver check-in process include? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'ID verification',
          'License verification',
          'Vehicle inspection',
          'Appointment verification',
          'Temporary access badge issued',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'personnel_6',
    section: 'Personnel & Access Control',
    questionText: 'Do employees receive security awareness training?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive training during onboarding + annual refreshers',
      'Yes - brief training during onboarding',
      'Informal on-the-job guidance',
      'No formal training',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['security_awareness_training'],
    riskIndicators: ['informal', 'no formal'],
  },

  {
    id: 'personnel_7',
    section: 'Personnel & Access Control',
    questionText: 'Do you have a theft reporting hotline or anonymous reporting mechanism?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['theft_reporting_hotline'],
  },

  {
    id: 'personnel_8',
    section: 'Personnel & Access Control',
    questionText: 'Do you have an insider threat monitoring program?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    suggestsControls: ['insider_threat_program'],
  },
];
const section7_fleet: WarehouseInterviewQuestion[] = [
  {
    id: 'fleet_1',
    section: 'Vehicle & Fleet Security',
    questionText: 'How many company-owned vehicles (trucks, vans, forklifts) do you have?',
    questionType: 'multiple_choice',
    options: [
      'None - use contractors only',
      '1-10 vehicles',
      '11-25 vehicles',
      '26-50 vehicles',
      'Over 50 vehicles',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'fleet_2',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you have GPS tracking on company vehicles?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['gps_tracking_fleet_vehicles'],
  },

  {
    id: 'fleet_3',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you use vehicle immobilization systems (kill switches) on fleet vehicles?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['vehicle_fleet_theft', 'hijacking_in_transit'],
    suggestsControls: ['vehicle_immobilization_system'],
  },

  {
    id: 'fleet_4',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you require a two-driver rule for high-value loads?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['hijacking_in_transit'],
    suggestsControls: ['two_driver_rule_high_value_loads'],
  },

  {
    id: 'fleet_5',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you have fuel theft prevention measures in place?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['fuel_theft_prevention'],
  },
];
const section8_surveillance: WarehouseInterviewQuestion[] = [
  {
    id: 'surveillance_1',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you have CCTV coverage inside the warehouse?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_warehouse_interior'],
    followUpQuestions: [
      {
        id: 'surveillance_1a',
        section: 'Surveillance & Monitoring',
        questionText: 'What percentage of the warehouse interior has camera coverage?',
        questionType: 'multiple_choice',
        options: [
          '75-100% coverage',
          '50-75% coverage',
          '25-50% coverage',
          'Under 25% coverage',
        ],
        required: true,
        riskIndicators: ['under 25%'],
      },
    ],
  },

  {
    id: 'surveillance_2',
    section: 'Surveillance & Monitoring',
    questionText: 'What is your video retention period?',
    questionType: 'multiple_choice',
    options: [
      '60+ days',
      '30-60 days',
      '15-30 days',
      '7-14 days',
      'Less than 7 days',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_retention_30_days'],
    riskIndicators: ['less than 7 days', '7-14 days'],
  },

  {
    id: 'surveillance_3',
    section: 'Surveillance & Monitoring',
    questionText: 'Is CCTV footage actively monitored in real-time?',
    questionType: 'multiple_choice',
    options: [
      'Yes - dedicated monitoring 24/7',
      'Yes - during business hours only',
      'Only reviewed after incidents',
      'Rarely reviewed',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely reviewed'],
  },

  {
    id: 'surveillance_4',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use video analytics (motion detection, behavior analysis)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_analytics'],
  },

  {
    id: 'surveillance_5',
    section: 'Surveillance & Monitoring',
    questionText: 'Rate the overall quality and coverage of your CCTV system',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Poor', 'Fair', 'Adequate', 'Good', 'Excellent'] 
    },
    required: true,
    informsVulnerability: true,
  },
];
const section9_emergency: WarehouseInterviewQuestion[] = [
  {
    id: 'emergency_1',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have a documented cargo theft response plan?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cargo_theft_response_plan'],
  },

  {
    id: 'emergency_2',
    section: 'Emergency Response & Procedures',
    questionText: 'Are shipping and receiving procedures clearly documented?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['shipping_receiving_procedures', 'dock_procedure_documentation'],
  },

  {
    id: 'emergency_3',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have a key control system with documented accountability?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['key_control_system'],
  },

  {
    id: 'emergency_4',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have documented alarm response procedures?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['alarm_response_procedures'],
  },

  {
    id: 'emergency_5',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you conduct security drills or training exercises?',
    questionType: 'multiple_choice',
    options: [
      'Quarterly or more frequently',
      'Annually',
      'Rarely',
      'Never',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely', 'never'],
  },

  {
    id: 'emergency_6',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have relationships with local law enforcement for cargo theft prevention?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
  },
];

// Export all sections combined
export const WAREHOUSE_INTERVIEW_QUESTIONS: WarehouseInterviewQuestion[] = [
  ...section1_facilityProfile,
  ...section2_incidentHistory,
  ...section3_perimeter,
  ...section4_loadingDock,
  ...section5_inventory,
  ...section6_personnel,
  ...section7_fleet,
  ...section8_surveillance,
  ...section9_emergency,
];
