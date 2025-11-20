export interface DatacenterInterviewQuestion {
  id: string;
  section: string;
  zoneApplicable?: string[];
  questionText: string;
  questionType: 'text' | 'multiple-choice' | 'rating' | 'yes-no' | 'checklist' | 'number';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: DatacenterInterviewQuestion[];
  riskIndicators?: string[];
  complianceRelevance?: string[];
  informsThreat?: string[];
  informsVulnerability?: boolean;
  informsImpact?: boolean;
  suggestsControls?: string[];
}

const section1_profile: DatacenterInterviewQuestion[] = [
  {
    id: 'profile_1',
    section: 'Datacenter Profile & Classification',
    questionText: 'What is the Uptime Institute Tier classification of this datacenter?',
    questionType: 'multiple-choice',
    options: [
      'Tier I - Basic (99.671% uptime)',
      'Tier II - Redundant Components (99.741% uptime)',
      'Tier III - Concurrently Maintainable (99.982% uptime)',
      'Tier IV - Fault Tolerant (99.995% uptime)',
      'Not formally classified',
    ],
    required: true,
    informsImpact: true,
    complianceRelevance: ['Business Continuity', 'Customer SLA'],
  },

  {
    id: 'profile_2',
    section: 'Datacenter Profile & Classification',
    questionText: 'What type of datacenter operation is this?',
    questionType: 'multiple-choice',
    options: [
      'Colocation (multi-tenant hosting)',
      'Enterprise (single company)',
      'Cloud/Hyperscale',
      'Managed services provider',
      'Government/Defense',
      'Hybrid',
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['multi_tenant_breach'],
  },

  {
    id: 'profile_3',
    section: 'Datacenter Profile & Classification',
    questionText: 'What compliance certifications does the datacenter hold? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'SOC 2 Type II',
      'ISO 27001',
      'PCI-DSS',
      'HIPAA',
      'FedRAMP',
      'SSAE 18',
      'None',
      'In process',
    ],
    required: true,
    informsVulnerability: true,
    complianceRelevance: ['SOC 2', 'ISO 27001', 'PCI-DSS', 'HIPAA'],
    riskIndicators: ['none', 'in process'],
  },

  {
    id: 'profile_4',
    section: 'Datacenter Profile & Classification',
    questionText: 'Approximately how many racks/cabinets does the facility have?',
    questionType: 'multiple-choice',
    options: [
      'Under 50 racks',
      '50-200 racks',
      '201-500 racks',
      '501-1000 racks',
      'Over 1000 racks',
    ],
    required: true,
    informsImpact: true,
    informsVulnerability: true,
  },

  {
    id: 'profile_5',
    section: 'Datacenter Profile & Classification',
    questionText: 'What is your contractual uptime SLA commitment?',
    questionType: 'multiple-choice',
    options: [
      '99.999% (Five Nines - 5.26 min/year)',
      '99.99% (Four Nines - 52.6 min/year)',
      '99.95% (4.38 hours/year)',
      '99.9% (8.76 hours/year)',
      'Below 99.9%',
      'No formal SLA',
    ],
    required: true,
    informsImpact: true,
    riskIndicators: ['below 99.9%', 'no formal'],
  },

  {
    id: 'profile_6',
    section: 'Datacenter Profile & Classification',
    questionText: 'What is the approximate square footage of the datacenter?',
    questionType: 'multiple-choice',
    options: [
      'Under 5,000 sq ft',
      '5,000 - 20,000 sq ft',
      '20,000 - 50,000 sq ft',
      '50,000 - 100,000 sq ft',
      'Over 100,000 sq ft',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'profile_7',
    section: 'Datacenter Profile & Classification',
    questionText: 'How many customers/tenants do you serve? (If colocation/multi-tenant)',
    questionType: 'multiple-choice',
    options: [
      'Not applicable - enterprise datacenter',
      '1-10 customers',
      '11-50 customers',
      '51-200 customers',
      'Over 200 customers',
    ],
    required: true,
    informsThreat: ['multi_tenant_breach'],
    informsVulnerability: true,
  },

  {
    id: 'profile_8',
    section: 'Datacenter Profile & Classification',
    questionText: 'Have you experienced any significant security or availability incidents in the past 2 years?',
    questionType: 'yes-no',
    required: true,
    informsThreat: ['unauthorized_physical_access_customer_data', 'power_failure_service_disruption'],
    followUpQuestions: [
      {
        id: 'profile_8a',
        section: 'Datacenter Profile & Classification',
        questionText: 'What type of incidents? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Physical security breach',
          'Unauthorized access attempt',
          'Power outage',
          'Cooling failure',
          'Fire/suppression activation',
          'Data breach',
          'Insider incident',
        ],
        required: true,
      },
    ],
  },
];

const section2_perimeter: DatacenterInterviewQuestion[] = [
  {
    id: 'perimeter_1',
    section: 'Physical Perimeter Security',
    questionText: 'What type of perimeter barrier protects the facility?',
    questionType: 'multiple-choice',
    options: [
      'High-security fencing (8+ feet) with anti-climb features',
      'Standard fencing',
      'Building walls only (urban setting)',
      'Natural barriers',
      'Minimal perimeter protection',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_barrier_standoff_distance'],
    riskIndicators: ['minimal perimeter'],
    complianceRelevance: ['ISO 27001'],
  },

  {
    id: 'perimeter_2',
    section: 'Physical Perimeter Security',
    questionText: 'What is the standoff distance from the building to public areas?',
    questionType: 'multiple-choice',
    options: [
      '100+ feet (excellent)',
      '50-100 feet (good)',
      '25-50 feet (adequate)',
      'Under 25 feet (minimal)',
      'Building directly on street (urban)',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['under 25', 'directly on street'],
  },

  {
    id: 'perimeter_3',
    section: 'Physical Perimeter Security',
    questionText: 'Do you have vehicle barriers (bollards, wedge barriers) to prevent vehicle attacks?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['vehicle_barriers_bollards'],
    complianceRelevance: ['Physical Security'],
  },

  {
    id: 'perimeter_4',
    section: 'Physical Perimeter Security',
    questionText: 'Is perimeter intrusion detection installed (fence sensors, ground sensors, infrared)?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_intrusion_detection_datacenter'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'perimeter_5',
    section: 'Physical Perimeter Security',
    questionText: 'Rate the adequacy of perimeter lighting',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Poor', 'Fair', 'Adequate', 'Good', 'Excellent'] 
    },
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_lighting_datacenter'],
  },

  {
    id: 'perimeter_6',
    section: 'Physical Perimeter Security',
    questionText: 'Do you have CCTV coverage of the entire perimeter?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_perimeter_datacenter'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'perimeter_7',
    section: 'Physical Perimeter Security',
    questionText: 'Do you have 24/7 security personnel monitoring the facility?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['security_guard_24x7', 'noc_soc_24x7_monitoring'],
    complianceRelevance: ['SOC 2'],
  },
];

const section3_access: DatacenterInterviewQuestion[] = [
  {
    id: 'access_1',
    section: 'Access Control & Authentication',
    questionText: 'How many factors of authentication are required for employee access to the server floor?',
    questionType: 'multiple-choice',
    options: [
      'Three factors (badge + biometric + PIN)',
      'Two factors (badge + biometric OR badge + PIN)',
      'One factor (badge only)',
      'Key/no electronic access control',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['multi_factor_authentication_3_factors'],
    riskIndicators: ['one factor', 'key/no electronic'],
    complianceRelevance: ['SOC 2', 'ISO 27001', 'PCI-DSS'],
  },

  {
    id: 'access_2',
    section: 'Access Control & Authentication',
    questionText: 'What biometric systems are in use? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Fingerprint',
      'Palm vein',
      'Iris scan',
      'Facial recognition',
      'None - no biometrics',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['biometric_fingerprint', 'biometric_palm_vein', 'biometric_iris_facial'],
    riskIndicators: ['none - no biometrics'],
    complianceRelevance: ['SOC 2', 'PCI-DSS'],
  },

  {
    id: 'access_3',
    section: 'Access Control & Authentication',
    questionText: 'Do you use man-trap or portal systems to prevent tailgating?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['tailgating_unauthorized_entry'],
    suggestsControls: ['man_trap_portal_system'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
    followUpQuestions: [
      {
        id: 'access_3a',
        section: 'Access Control & Authentication',
        questionText: 'Are man-traps/portals installed at all entry points to the server floor?',
        questionType: 'yes-no',
        required: true,
        riskIndicators: ['no'],
      },
    ],
  },

  {
    id: 'access_4',
    section: 'Access Control & Authentication',
    questionText: 'Do cabinets/racks have electronic locks with individual access control?',
    questionType: 'multiple-choice',
    options: [
      'Yes - all cabinets have electronic locks with audit trail',
      'Yes - high-security cabinets only',
      'Physical locks only (key control)',
      'No cabinet-level locks',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['data_theft_server_drive_removal', 'multi_tenant_breach'],
    suggestsControls: ['cabinet_electronic_locks', 'cabinet_access_logging'],
    riskIndicators: ['physical locks only', 'no cabinet'],
    complianceRelevance: ['SOC 2 Type II', 'PCI-DSS'],
  },

  {
    id: 'access_5',
    section: 'Access Control & Authentication',
    questionText: 'Are all physical access events logged and retained?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['access_logging_audit_trail'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
    followUpQuestions: [
      {
        id: 'access_5a',
        section: 'Access Control & Authentication',
        questionText: 'What is the retention period for access logs?',
        questionType: 'multiple-choice',
        options: [
          '1+ year',
          '6-12 months',
          '3-6 months',
          'Under 3 months',
        ],
        required: true,
        riskIndicators: ['under 3 months'],
        complianceRelevance: ['SOC 2'],
      },
    ],
  },

  {
    id: 'access_6',
    section: 'Access Control & Authentication',
    questionText: 'How quickly are access permissions revoked when an employee leaves?',
    questionType: 'multiple-choice',
    options: [
      'Immediately (same day)',
      'Within 24 hours',
      'Within 1 week',
      'No formal process',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    suggestsControls: ['access_revocation_immediate'],
    riskIndicators: ['within 1 week', 'no formal'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'access_7',
    section: 'Access Control & Authentication',
    questionText: 'Are visitors required to be escorted at all times in secure areas?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['social_engineering_fake_technician'],
    suggestsControls: ['visitor_escort_mandatory'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'access_8',
    section: 'Access Control & Authentication',
    questionText: 'What is your visitor check-in procedure?',
    questionType: 'multiple-choice',
    options: [
      'Government-issued ID verification + pre-authorization + escort',
      'ID verification + visitor badge + escort',
      'Sign-in sheet + escort',
      'Informal check-in',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['visitor_check_in_id_verification'],
    riskIndicators: ['informal check-in'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'access_9',
    section: 'Access Control & Authentication',
    questionText: 'Do customers have the ability to install their own locks on cabinets?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['customer_controlled_locks'],
    complianceRelevance: ['Customer Contracts'],
  },

  {
    id: 'access_10',
    section: 'Access Control & Authentication',
    questionText: 'Do you enforce the principle of least privilege for physical access?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'access_11',
    section: 'Access Control & Authentication',
    questionText: 'How often do you conduct access permission audits?',
    questionType: 'multiple-choice',
    options: [
      'Quarterly',
      'Semi-annually',
      'Annually',
      'Rarely/Never',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely/never'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'access_12',
    section: 'Access Control & Authentication',
    questionText: 'Rate the overall effectiveness of your access control system',
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

const section4_surveillance: DatacenterInterviewQuestion[] = [
  {
    id: 'surveillance_1',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you have CCTV cameras covering all critical areas? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'All entry/exit points',
      'All server floor aisles',
      'Man-traps/portals',
      'Loading dock/receiving',
      'Perimeter',
      'Parking areas',
      'Customer cabinets (hands-on-server cameras)',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: [
      'cctv_all_entry_exit_points',
      'cctv_server_floor_aisles',
      'cctv_man_trap_portals',
      'hands_on_server_cameras',
    ],
    complianceRelevance: ['SOC 2', 'PCI-DSS'],
  },

  {
    id: 'surveillance_2',
    section: 'Surveillance & Monitoring',
    questionText: 'What is your video retention period?',
    questionType: 'multiple-choice',
    options: [
      '90+ days',
      '60-90 days',
      '30-60 days',
      '15-30 days',
      'Under 15 days',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_retention_90_days'],
    riskIndicators: ['under 15 days'],
    complianceRelevance: ['SOC 2', 'PCI-DSS'],
  },

  {
    id: 'surveillance_3',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you have a 24/7 Security Operations Center (SOC) or Network Operations Center (NOC) monitoring video feeds?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['noc_soc_24x7_monitoring'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'surveillance_4',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use video analytics or AI-based behavior detection?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_analytics_behavior_detection'],
  },

  {
    id: 'surveillance_5',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use facial recognition for identity verification?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['social_engineering_fake_technician'],
    suggestsControls: ['facial_recognition_system'],
  },

  {
    id: 'surveillance_6',
    section: 'Surveillance & Monitoring',
    questionText: 'Are cameras positioned to capture "hands-on-server" activity at customer cabinets?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['data_theft_server_drive_removal', 'multi_tenant_breach'],
    suggestsControls: ['hands_on_server_cameras'],
    complianceRelevance: ['SOC 2 Type II'],
  },

  {
    id: 'surveillance_7',
    section: 'Surveillance & Monitoring',
    questionText: 'Can video footage be easily retrieved for incident investigation?',
    questionType: 'multiple-choice',
    options: [
      'Yes - searchable by time, location, person',
      'Yes - manual review required',
      'Difficult - limited search capability',
      'Very difficult - poor indexing',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['difficult', 'very difficult'],
  },

  {
    id: 'surveillance_8',
    section: 'Surveillance & Monitoring',
    questionText: 'Rate the overall quality and coverage of your surveillance system',
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

const section5_environmental: DatacenterInterviewQuestion[] = [
  {
    id: 'environmental_1',
    section: 'Environmental & Infrastructure Security',
    questionText: 'What type of fire suppression system is installed in the server areas?',
    questionType: 'multiple-choice',
    options: [
      'Clean agent (FM-200, Novec 1230, Inergen)',
      'Water-based sprinkler (NOT recommended for datacenters)',
      'CO2 suppression',
      'Pre-action sprinkler',
      'No suppression system',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['fire_data_loss'],
    suggestsControls: ['fire_suppression_clean_agent'],
    riskIndicators: ['water-based', 'no suppression'],
    complianceRelevance: ['Fire Safety', 'Business Continuity'],
  },

  {
    id: 'environmental_2',
    section: 'Environmental & Infrastructure Security',
    questionText: 'What type of fire detection system do you have?',
    questionType: 'multiple-choice',
    options: [
      'VESDA (Very Early Smoke Detection Apparatus) or aspirating',
      'Smoke detectors (standard)',
      'Heat detectors',
      'Multiple systems',
      'Minimal detection',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['fire_detection_vesda_aspirating'],
    riskIndicators: ['minimal detection'],
  },

  {
    id: 'environmental_3',
    section: 'Environmental & Infrastructure Security',
    questionText: 'What is your cooling redundancy level?',
    questionType: 'multiple-choice',
    options: [
      '2N (fully redundant)',
      'N+2 (two redundant units)',
      'N+1 (one redundant unit)',
      'N (no redundancy)',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['environmental_failure_cooling_loss'],
    suggestsControls: ['redundant_cooling_n_plus_1', 'redundant_cooling_2n'],
    riskIndicators: ['n (no redundancy)'],
    complianceRelevance: ['Uptime SLA', 'Tier Classification'],
  },

  {
    id: 'environmental_4',
    section: 'Environmental & Infrastructure Security',
    questionText: 'What is your power redundancy level?',
    questionType: 'multiple-choice',
    options: [
      '2N (fully redundant power paths)',
      '2(N+1) (two redundant paths with N+1 components)',
      'N+1 (one redundant component)',
      'N (no redundancy)',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['power_failure_service_disruption'],
    suggestsControls: ['redundant_power_n_plus_1', 'redundant_power_2n'],
    riskIndicators: ['n (no redundancy)'],
    complianceRelevance: ['Uptime SLA', 'Tier Classification'],
  },

  {
    id: 'environmental_5',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you have backup generator(s)?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['power_failure_service_disruption'],
    suggestsControls: ['generator_backup_fuel_48_hours'],
    complianceRelevance: ['Business Continuity'],
    followUpQuestions: [
      {
        id: 'environmental_5a',
        section: 'Environmental & Infrastructure Security',
        questionText: 'What is the fuel capacity (runtime at full load)?',
        questionType: 'multiple-choice',
        options: [
          '48+ hours',
          '24-48 hours',
          '12-24 hours',
          'Under 12 hours',
        ],
        required: true,
        riskIndicators: ['under 12 hours'],
      },
    ],
  },

  {
    id: 'environmental_6',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you have UPS (Uninterruptible Power Supply) battery backup?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['ups_battery_backup'],
    complianceRelevance: ['Uptime SLA'],
  },

  {
    id: 'environmental_7',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you have water leak detection systems under raised floors?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['water_leak_detection'],
  },

  {
    id: 'environmental_8',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you use hot/cold aisle containment?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['hot_cold_aisle_containment'],
    complianceRelevance: ['Energy Efficiency'],
  },

  {
    id: 'environmental_9',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you have continuous environmental monitoring (temperature, humidity, power)?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['environmental_failure_cooling_loss'],
    suggestsControls: ['environmental_monitoring_system', 'temperature_humidity_monitoring'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'environmental_10',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Have you tested your backup power and cooling systems in the past 12 months?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    riskIndicators: ['no'],
    complianceRelevance: ['Business Continuity'],
  },
];

const section6_logical: DatacenterInterviewQuestion[] = [
  {
    id: 'logical_1',
    section: 'Logical Security Integration',
    questionText: 'Do you implement network segmentation to isolate customer environments?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['multi_tenant_breach'],
    suggestsControls: ['network_segmentation_customer_isolation'],
    complianceRelevance: ['SOC 2 Type II', 'PCI-DSS'],
  },

  {
    id: 'logical_2',
    section: 'Logical Security Integration',
    questionText: 'Do you have out-of-band management for critical infrastructure?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['out_of_band_management'],
    complianceRelevance: ['ISO 27001'],
  },

  {
    id: 'logical_3',
    section: 'Logical Security Integration',
    questionText: 'Do you use jump boxes or bastion hosts for administrative access?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    suggestsControls: ['jump_box_access_controlled'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'logical_4',
    section: 'Logical Security Integration',
    questionText: 'Are remote hands procedures documented and controlled?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['remote_hands_procedures'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'logical_5',
    section: 'Logical Security Integration',
    questionText: 'Is physical access integrated with logical access control systems?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['logical_access_integration'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'logical_6',
    section: 'Logical Security Integration',
    questionText: 'Do you perform regular vulnerability assessments on physical security systems?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['supply_chain_hardware_tampering'],
    suggestsControls: ['vulnerability_assessment_regular'],
    complianceRelevance: ['ISO 27001'],
  },

  {
    id: 'logical_7',
    section: 'Logical Security Integration',
    questionText: 'Have you conducted physical penetration testing in the past 2 years?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['penetration_testing_physical'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },
];

const section7_personnel: DatacenterInterviewQuestion[] = [
  {
    id: 'personnel_1',
    section: 'Personnel Security',
    questionText: 'What level of background checks do you conduct on datacenter staff?',
    questionType: 'multiple-choice',
    options: [
      'Level 2 (comprehensive - criminal, credit, employment, education)',
      'Level 1 (criminal background only)',
      'Basic checks',
      'No formal background checks',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    suggestsControls: ['background_checks_level_2'],
    riskIndicators: ['no formal'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'personnel_2',
    section: 'Personnel Security',
    questionText: 'Do you have an insider threat monitoring program?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    suggestsControls: ['insider_threat_monitoring_program'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'personnel_3',
    section: 'Personnel Security',
    questionText: 'Do you enforce a two-person rule for sensitive operations (equipment moves, cabling, etc.)?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['data_theft_server_drive_removal', 'sabotage_infrastructure'],
    suggestsControls: ['two_person_rule_sensitive_ops'],
    complianceRelevance: ['SOC 2 Type II'],
  },

  {
    id: 'personnel_4',
    section: 'Personnel Security',
    questionText: 'Do all employees receive annual security awareness training?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['social_engineering_fake_technician'],
    suggestsControls: ['security_awareness_training_annual'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'personnel_5',
    section: 'Personnel Security',
    questionText: 'Do you enforce clean desk and clear screen policies?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['clean_desk_clear_screen_policy'],
    complianceRelevance: ['ISO 27001'],
  },

  {
    id: 'personnel_6',
    section: 'Personnel Security',
    questionText: 'Are all employees required to sign NDAs and confidentiality agreements?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['nda_confidentiality_agreements'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'personnel_7',
    section: 'Personnel Security',
    questionText: 'Do you conduct vendor background checks and vetting?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['supply_chain_hardware_tampering', 'social_engineering_fake_technician'],
    suggestsControls: ['vendor_vetting_background_checks'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },
];

const section8_multiTenant: DatacenterInterviewQuestion[] = [
  {
    id: 'multi_tenant_1',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'If multi-tenant, how do you ensure physical separation between customer environments?',
    questionType: 'multiple-choice',
    options: [
      'Not applicable - single tenant',
      'Individual locked cabinets with unique access',
      'Caged areas per customer',
      'Separate rooms/suites',
      'Logical separation only (same open floor)',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['multi_tenant_breach'],
    riskIndicators: ['logical separation only'],
    complianceRelevance: ['SOC 2 Type II'],
  },

  {
    id: 'multi_tenant_2',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'Can customers install their own physical security (locks, cameras)?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['customer_controlled_locks'],
    complianceRelevance: ['Customer Contracts'],
  },

  {
    id: 'multi_tenant_3',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'Do you provide cabinet-level access logs to customers upon request?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cabinet_access_logging'],
    complianceRelevance: ['SOC 2 Type II'],
  },

  {
    id: 'multi_tenant_4',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'How do you handle customer equipment decommissioning?',
    questionType: 'multiple-choice',
    options: [
      'Witnessed destruction with certificate (drive shredding)',
      'Secure disposal per customer specifications',
      'Customer removes own equipment',
      'Standard disposal procedures',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['data_theft_server_drive_removal'],
    suggestsControls: ['secure_disposal_drive_shredding'],
    riskIndicators: ['standard disposal'],
    complianceRelevance: ['PCI-DSS', 'HIPAA'],
  },

  {
    id: 'multi_tenant_5',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'Have you had any customer-reported security incidents in the past 2 years?',
    questionType: 'yes-no',
    required: true,
    informsThreat: ['multi_tenant_breach', 'unauthorized_physical_access_customer_data'],
  },
];

const section9_compliance: DatacenterInterviewQuestion[] = [
  {
    id: 'compliance_1',
    section: 'Compliance & Audit History',
    questionText: 'When was your last SOC 2 audit?',
    questionType: 'multiple-choice',
    options: [
      'Within past 6 months',
      '6-12 months ago',
      'Over 1 year ago',
      'Never / Not applicable',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['over 1 year', 'never'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'compliance_2',
    section: 'Compliance & Audit History',
    questionText: 'Were there any findings related to physical security in your last audit?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    complianceRelevance: ['SOC 2', 'ISO 27001'],
    followUpQuestions: [
      {
        id: 'compliance_2a',
        section: 'Compliance & Audit History',
        questionText: 'Have all findings been remediated?',
        questionType: 'yes-no',
        required: true,
        riskIndicators: ['no'],
      },
    ],
  },

  {
    id: 'compliance_3',
    section: 'Compliance & Audit History',
    questionText: 'Do you conduct annual compliance audits?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['compliance_audit_annual'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'compliance_4',
    section: 'Compliance & Audit History',
    questionText: 'Do you maintain a compliance program with documented policies?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'compliance_5',
    section: 'Compliance & Audit History',
    questionText: 'Do you provide customers with audit reports (SOC 2, ISO certs)?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    complianceRelevance: ['Customer Contracts'],
  },

  {
    id: 'compliance_6',
    section: 'Compliance & Audit History',
    questionText: 'Have you had any compliance violations or regulatory penalties in the past 3 years?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsImpact: true,
    complianceRelevance: ['All Compliance'],
  },
];

const section10_businessContinuity: DatacenterInterviewQuestion[] = [
  {
    id: 'bc_1',
    section: 'Business Continuity & Emergency Response',
    questionText: 'Do you have a documented incident response plan?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['incident_response_plan_documented'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'bc_2',
    section: 'Business Continuity & Emergency Response',
    questionText: 'Do you have a 24/7 incident response team?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['incident_response_team_24x7'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'bc_3',
    section: 'Business Continuity & Emergency Response',
    questionText: 'Do you have a disaster recovery site?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    informsImpact: true,
    suggestsControls: ['disaster_recovery_site'],
    complianceRelevance: ['Business Continuity'],
  },

  {
    id: 'bc_4',
    section: 'Business Continuity & Emergency Response',
    questionText: 'When was your last business continuity plan test?',
    questionType: 'multiple-choice',
    options: [
      'Within past 6 months',
      '6-12 months ago',
      'Over 1 year ago',
      'Never tested',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['business_continuity_plan'],
    riskIndicators: ['over 1 year', 'never tested'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'bc_5',
    section: 'Business Continuity & Emergency Response',
    questionText: 'Do you have Emergency Power Off (EPO) systems?',
    questionType: 'yes-no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['emergency_power_off_epo'],
  },

  {
    id: 'bc_6',
    section: 'Business Continuity & Emergency Response',
    questionText: 'If in a seismic zone, do you have earthquake protection measures?',
    questionType: 'multiple-choice',
    options: [
      'Not in seismic zone',
      'Yes - comprehensive seismic protection',
      'Basic seismic protection',
      'No seismic protection',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['seismic_protection_if_applicable'],
    riskIndicators: ['no seismic protection'],
  },
];

export const datacenterInterviewQuestions: DatacenterInterviewQuestion[] = [
  ...section1_profile,
  ...section2_perimeter,
  ...section3_access,
  ...section4_surveillance,
  ...section5_environmental,
  ...section6_logical,
  ...section7_personnel,
  ...section8_multiTenant,
  ...section9_compliance,
  ...section10_businessContinuity,
];
