/**
 * Datacenter & Critical Infrastructure Interview Questionnaire
 * 
 * Complete question definitions with polarity logic, risk weights,
 * and threat/control mappings for the datacenter interview workflow.
 * 
 * Implements the RiskFixer AI-First Assessment Framework with:
 * - T×V×I formula (Threat × Vulnerability × Impact)
 * - Risk factor counting for vulnerability adjustment
 * - Threat-specific control recommendations
 * - 6-Layer Context Library compliance
 * 
 * Industry Standards Referenced:
 * - Uptime Institute Tier Standards (I-IV)
 * - SOC 2 Type II
 * - ISO 27001
 * - PCI-DSS
 * - TIA-942 (Telecommunications Infrastructure Standard)
 * - ASHRAE (Environmental Guidelines)
 * - NFPA 75/76 (Fire Protection)
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Datacenter-Questions-With-Polarity.md
 * @see RiskFixer-Datacenter-Framework.md
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface InterviewQuestion {
  id: string;
  section: DatacenterSection;
  zoneApplicable?: DatacenterZone[];
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist' | 'number' | 'currency' | 'multi_field';
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
  name: DatacenterSection;
  description: string;
  order: number;
  aiContextNotes?: string; // Layer 3: Industry-specific context for AI
}

// ============================================================================
// TYPE-SAFE SECTION DEFINITIONS
// ============================================================================

export const DATACENTER_SECTIONS = [
  'Datacenter Profile & Operations',
  'Perimeter & Site Security',
  'Access Control & Authentication',
  'Surveillance & Monitoring',
  'Power Infrastructure Security',
  'Cooling & Environmental Controls',
  'Fire Suppression & Life Safety',
  'Personnel Security & Training',
  'Compliance & Audit',
] as const;

export type DatacenterSection = typeof DATACENTER_SECTIONS[number];

// ============================================================================
// DATACENTER ZONE DEFINITIONS
// ============================================================================

export const DATACENTER_ZONES = [
  'perimeter',
  'building_exterior',
  'lobby_reception',
  'datacenter_floor',
  'server_aisles',
  'customer_cages',
  'mdf_idf_rooms',
  'electrical_rooms',
  'generator_yard',
  'cooling_plant',
  'loading_dock',
  'noc_soc',
  'administrative_offices',
] as const;

export type DatacenterZone = typeof DATACENTER_ZONES[number];

// ============================================================================
// DATACENTER THREAT DEFINITIONS - Layer 4: Threat Intelligence
// ============================================================================

export const DATACENTER_THREATS = [
  'unauthorized_physical_access',
  'insider_threat_privileged_access',
  'tailgating_mantrap_bypass',
  'power_failure_extended',
  'cooling_failure_thermal_event',
  'fire_equipment_damage',
  'water_intrusion_damage',
  'theft_equipment_components',
  'sabotage_infrastructure',
  'cyber_physical_attack',
  'social_engineering_entry',
  'terrorism_vehicle_borne',
  'natural_disaster_impact',
  'vendor_contractor_breach',
  'environmental_contamination',
] as const;

export type DatacenterThreat = typeof DATACENTER_THREATS[number];

// ============================================================================
// DATACENTER CONTROL DEFINITIONS - Layer 5: Control Effectiveness
// ============================================================================

export const DATACENTER_CONTROLS = [
  // Perimeter & Site Security
  'high_security_fencing',
  'perimeter_intrusion_detection',
  'vehicle_barriers_k_rated',
  'standoff_distance_100ft',
  'perimeter_lighting_iesna',
  'perimeter_cctv_coverage',
  'security_patrol_24x7',
  'guard_checkpoint',
  
  // Access Control
  'biometric_authentication',
  'multi_factor_access',
  'mantrap_portals',
  'tailgating_detection',
  'visitor_management_system',
  'escort_requirements',
  'cabinet_level_locks',
  'access_logging_audit',
  'access_review_quarterly',
  'access_revocation_immediate',
  'customer_access_segregation',
  'two_person_rule',
  
  // Surveillance & Monitoring
  'cctv_comprehensive_coverage',
  'cctv_hands_on_servers',
  'video_retention_90_days',
  'video_analytics',
  'noc_soc_24x7',
  'alarm_monitoring_central',
  'environmental_sensors',
  
  // Power Infrastructure
  'redundant_utility_feeds',
  'ups_n_plus_1',
  'generator_automatic_transfer',
  'generator_fuel_72_hours',
  'fuel_storage_security',
  'epo_protection',
  'electrical_room_access',
  
  // Cooling & Environmental
  'cooling_redundancy',
  'temperature_humidity_monitoring',
  'water_leak_detection',
  'chiller_plant_security',
  'hot_cold_aisle_containment',
  'environmental_contamination_protection',
  
  // Fire Suppression
  'vesda_early_detection',
  'clean_agent_suppression',
  'fire_zone_suppression',
  'manual_release_protection',
  'fire_system_monitoring',
  'fire_system_testing_quarterly',
  
  // Personnel Security
  'background_checks_comprehensive',
  'security_training_annual',
  'contractor_vetting',
  'termination_procedures',
  'incident_response_plan',
  'tool_control',
  'media_destruction',
  
  // Compliance
  'soc2_type_ii',
  'iso_27001',
  'pci_dss',
  'audit_frequency_quarterly',
  'penetration_testing_annual',
  'vulnerability_scanning',
  'change_management',
] as const;

export type DatacenterControl = typeof DATACENTER_CONTROLS[number];

// ============================================================================
// SECTION METADATA - Layer 2: Methodology Framework
// ============================================================================

export const DATACENTER_SECTION_METADATA: SectionMetadata[] = [
  {
    id: 'profile',
    name: 'Datacenter Profile & Operations',
    description: 'Baseline facility characteristics including tier classification, capacity, compliance requirements, and SLA commitments',
    order: 1,
    aiContextNotes: 'Tier classification drives security requirements. Tier IV requires 99.995% uptime and maximum security controls. Colocation introduces multi-tenant risk. SLA penalties inform impact calculations - some datacenters face $10,000+ per hour of downtime.',
  },
  {
    id: 'perimeter',
    name: 'Perimeter & Site Security',
    description: 'First line of defense - critical for preventing vehicle-borne threats and unauthorized approach',
    order: 2,
    aiContextNotes: 'Per TIA-942: datacenters should have 100ft+ standoff distance from public roads. K12-rated vehicle barriers stop 15,000lb vehicles at 50mph. IESNA recommends 5 foot-candles minimum at perimeter.',
  },
  {
    id: 'access_control',
    name: 'Access Control & Authentication',
    description: 'Defense in depth from perimeter to cabinet - multi-factor authentication is baseline for Tier III+',
    order: 3,
    aiContextNotes: 'SOC 2 requires unique authentication and access logging. Man-traps prevent tailgating - critical control since 30%+ of physical intrusions involve tailgating. Cabinet-level locks protect individual customer equipment in colocation.',
  },
  {
    id: 'surveillance',
    name: 'Surveillance & Monitoring',
    description: 'Comprehensive visibility and rapid response capability - NOC/SOC operations center essential',
    order: 4,
    aiContextNotes: 'PCI-DSS requires 90-day video retention for areas where cardholder data is processed. CCTV must capture hands-on-servers activity for forensic investigation. 24/7 monitoring required for Tier III+ facilities.',
  },
  {
    id: 'power',
    name: 'Power Infrastructure Security',
    description: 'Power is the most critical dependency - extended outage causes catastrophic downtime',
    order: 5,
    aiContextNotes: 'Uptime Institute: Tier III requires N+1 redundancy, Tier IV requires 2N. Generator fuel for 72+ hours protects against extended utility outages. EPO buttons are sabotage targets - must be protected. Average cost of datacenter downtime: $9,000/minute.',
  },
  {
    id: 'cooling',
    name: 'Cooling & Environmental Controls',
    description: 'Thermal events can cause catastrophic equipment failure within minutes',
    order: 6,
    aiContextNotes: 'ASHRAE recommends 64.4°F-80.6°F for server inlet temperatures. Hot aisle containment improves efficiency 30-40%. Water leaks from cooling systems are leading cause of datacenter damage. Chiller plants are external and need physical protection.',
  },
  {
    id: 'fire',
    name: 'Fire Suppression & Life Safety',
    description: 'Fire protection must balance equipment protection with life safety - clean agents preferred over water',
    order: 7,
    aiContextNotes: 'NFPA 75/76 governs datacenter fire protection. Water sprinklers destroy electronics - clean agents (FM-200, Novec, Inergen) are standard. VESDA provides early smoke detection. Zoned suppression prevents full-facility discharge. Manual release buttons are sabotage targets.',
  },
  {
    id: 'personnel',
    name: 'Personnel Security & Training',
    description: 'Insider threat is primary concern - privileged access to critical infrastructure creates high risk',
    order: 8,
    aiContextNotes: 'FBI estimates 60%+ of sabotage involves insiders. SOC 2 requires background checks for employees with datacenter access. Immediate access revocation on termination is critical - disgruntled ex-employees are highest risk. Tool control prevents equipment theft and sabotage.',
  },
  {
    id: 'compliance',
    name: 'Compliance & Audit',
    description: 'Compliance drives customer confidence and identifies control gaps through independent verification',
    order: 9,
    aiContextNotes: 'SOC 2 Type II is baseline for enterprise customers. ISO 27001 demonstrates systematic security management. PCI-DSS required for payment card processing. Regular audits identify control degradation before incidents occur.',
  },
];

// ============================================================================
// INTERVIEW QUESTIONS - Layer 1: Facility-Specific Data Collection
// ============================================================================

export const DATACENTER_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // =========================================================================
  // SECTION 1: DATACENTER PROFILE & OPERATIONS
  // =========================================================================
  
  {
    id: 'dc_tier_classification',
    section: 'Datacenter Profile & Operations',
    questionText: 'What is the datacenter tier classification?',
    questionType: 'multiple_choice',
    options: [
      'Tier IV - Fault Tolerant (99.995% uptime)',
      'Tier III - Concurrently Maintainable (99.982% uptime)',
      'Tier II - Redundant Capacity (99.741% uptime)',
      'Tier I - Basic Capacity (99.671% uptime)',
      'Unknown/Not Classified',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Tier I - Basic Capacity (99.671% uptime)', 'Unknown/Not Classified'],
    riskWeight: 2,
    riskIndicators: ['tier i', 'tier 1', 'basic capacity', 'unknown', 'not classified'],
    informsThreat: ['power_failure_extended', 'cooling_failure_thermal_event', 'fire_equipment_damage'],
    informsVulnerability: true,
    informsImpact: true,
    helpText: 'Tier classification per Uptime Institute determines baseline security and redundancy requirements.',
    followUpQuestions: [
      {
        id: 'dc_tier_upgrade_consideration',
        section: 'Datacenter Profile & Operations',
        questionText: 'Has there been consideration for tier upgrade? What are the barriers?',
        questionType: 'text',
        required: false,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'dc_tier_classification',
          expectedValue: ['Tier II - Redundant Capacity (99.741% uptime)', 'Tier I - Basic Capacity (99.671% uptime)'],
        },
      },
    ],
  },
  
  {
    id: 'dc_size_capacity',
    section: 'Datacenter Profile & Operations',
    questionText: 'What is the datacenter size and capacity?',
    questionType: 'multi_field',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsImpact: true,
    helpText: 'Larger capacity increases impact severity for all downtime-related threats.',
  },
  
  {
    id: 'dc_customer_type',
    section: 'Datacenter Profile & Operations',
    questionText: 'What type of datacenter operation is this?',
    questionType: 'multiple_choice',
    options: [
      'Enterprise (single organization)',
      'Colocation (multi-tenant)',
      'Wholesale (large dedicated spaces)',
      'Hyperscale (cloud provider)',
      'Hybrid (combination)',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    riskIndicators: ['colocation', 'multi-tenant'],
    informsThreat: ['tailgating_mantrap_bypass', 'insider_threat_privileged_access', 'vendor_contractor_breach'],
    helpText: 'Colocation introduces customer segregation requirements and increased insider threat surface.',
  },
  
  {
    id: 'dc_compliance_requirements',
    section: 'Datacenter Profile & Operations',
    questionText: 'What compliance certifications or requirements apply?',
    questionType: 'checklist',
    options: [
      'SOC 2 Type II',
      'ISO 27001',
      'PCI-DSS',
      'HIPAA',
      'FedRAMP',
      'FISMA',
      'GDPR',
      'No formal compliance requirements',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No formal compliance requirements'],
    riskWeight: 2,
    riskIndicators: ['none', 'no formal compliance'],
    informsVulnerability: true,
    suggestsControls: ['soc2_type_ii', 'iso_27001', 'pci_dss', 'audit_frequency_quarterly'],
    helpText: 'Compliance drives baseline security controls and audit requirements.',
    followUpQuestions: [
      {
        id: 'dc_compliance_justification',
        section: 'Datacenter Profile & Operations',
        questionText: 'Why are there no compliance requirements? Does this concern customers?',
        questionType: 'text',
        required: false,
        polarity: 'CONTEXT',
        riskWeight: 0,
        condition: {
          questionId: 'dc_compliance_requirements',
          expectedValue: 'No formal compliance requirements',
        },
      },
    ],
  },
  
  {
    id: 'dc_uptime_sla',
    section: 'Datacenter Profile & Operations',
    questionText: 'What uptime SLA is committed to customers?',
    questionType: 'multiple_choice',
    options: [
      '99.999% (5.26 minutes downtime/year)',
      '99.99% (52.6 minutes downtime/year)',
      '99.95% (4.38 hours downtime/year)',
      '99.9% (8.76 hours downtime/year)',
      'No formal SLA',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['99.9% (8.76 hours downtime/year)', 'No formal SLA'],
    riskWeight: 2,
    riskIndicators: ['99.9%', 'no formal sla', 'no sla'],
    informsImpact: true,
    helpText: 'SLA determines impact severity for all downtime-related threats.',
    followUpQuestions: [
      {
        id: 'dc_sla_penalty_cost',
        section: 'Datacenter Profile & Operations',
        questionText: 'What is the financial penalty for SLA violations per hour?',
        questionType: 'currency',
        required: false,
        polarity: 'CONTEXT',
        riskWeight: 0,
        informsImpact: true,
      },
    ],
  },
  
  {
    id: 'dc_customer_data_sensitivity',
    section: 'Datacenter Profile & Operations',
    questionText: 'What is the highest sensitivity level of data hosted?',
    questionType: 'multiple_choice',
    options: [
      'Classified/Government',
      'Regulated (PCI, PHI, PII)',
      'Confidential business data',
      'General business data',
      'Public/Non-sensitive',
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    riskIndicators: ['regulated', 'classified', 'pci', 'phi', 'pii'],
    informsImpact: true,
    informsThreat: ['theft_equipment_components', 'cyber_physical_attack', 'insider_threat_privileged_access'],
    helpText: 'Data sensitivity affects impact severity for breach scenarios.',
  },
  
  {
    id: 'dc_staff_size',
    section: 'Datacenter Profile & Operations',
    questionText: 'How many personnel have physical access to the datacenter?',
    questionType: 'multi_field',
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 0,
    informsThreat: ['insider_threat_privileged_access', 'tailgating_mantrap_bypass'],
    helpText: 'Higher personnel count increases insider threat surface. Include full-time, contractors, customer techs, and vendors.',
  },
  
  // =========================================================================
  // SECTION 2: PERIMETER & SITE SECURITY
  // =========================================================================
  
  {
    id: 'dc_perimeter_barrier',
    section: 'Perimeter & Site Security',
    zoneApplicable: ['perimeter'],
    questionText: 'What type of perimeter barrier surrounds the datacenter facility?',
    questionType: 'multiple_choice',
    options: [
      'Anti-climb fence (8ft+) with intrusion detection',
      'Anti-climb fence (8ft+) without detection',
      'Standard chain-link fence (8ft)',
      'Standard chain-link fence (6ft or less)',
      'No dedicated perimeter barrier',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Standard chain-link fence (6ft or less)', 'No dedicated perimeter barrier'],
    riskWeight: 2,
    riskIndicators: ['no dedicated', 'no perimeter', 'chain-link', '6ft or less', '6 feet'],
    informsThreat: ['unauthorized_physical_access', 'terrorism_vehicle_borne', 'theft_equipment_components'],
    informsVulnerability: true,
    suggestsControls: ['high_security_fencing', 'perimeter_intrusion_detection'],
    helpText: 'TIA-942 recommends anti-climb fencing with intrusion detection for Tier III+ facilities.',
    followUpQuestions: [
      {
        id: 'dc_perimeter_incidents',
        section: 'Perimeter & Site Security',
        zoneApplicable: ['perimeter'],
        questionText: 'Have there been any perimeter breaches or incidents?',
        questionType: 'yes_no',
        required: false,
        polarity: 'YES_BAD',
        badAnswers: ['yes'],
        riskWeight: 1,
        informsThreat: ['unauthorized_physical_access'],
        condition: {
          questionId: 'dc_perimeter_barrier',
          expectedValue: ['Standard chain-link fence (6ft or less)', 'No dedicated perimeter barrier'],
        },
      },
    ],
  },
  
  {
    id: 'dc_standoff_distance',
    section: 'Perimeter & Site Security',
    zoneApplicable: ['perimeter', 'building_exterior'],
    questionText: 'What is the standoff distance from public roads/parking to the datacenter building?',
    questionType: 'multiple_choice',
    options: [
      '100+ feet with vehicle barriers',
      '100+ feet without barriers',
      '50-100 feet',
      'Less than 50 feet',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Less than 50 feet', '50-100 feet'],
    riskWeight: 2,
    riskIndicators: ['less than 50', '<50', '50-100'],
    informsThreat: ['terrorism_vehicle_borne', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['standoff_distance_100ft', 'vehicle_barriers_k_rated'],
    helpText: 'TIA-942 recommends 100ft minimum standoff for vehicle-borne threat mitigation.',
  },
  
  {
    id: 'dc_vehicle_barriers',
    section: 'Perimeter & Site Security',
    zoneApplicable: ['perimeter'],
    questionText: 'Are there vehicle barriers to prevent vehicle-borne attacks?',
    questionType: 'multiple_choice',
    options: [
      'K12-rated crash barriers (stops 15,000lb at 50mph)',
      'K8-rated crash barriers',
      'K4-rated crash barriers',
      'Standard bollards (not rated)',
      'No vehicle barriers',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Standard bollards (not rated)', 'No vehicle barriers'],
    riskWeight: 2,
    riskIndicators: ['no vehicle barriers', 'not rated', 'standard bollards'],
    informsThreat: ['terrorism_vehicle_borne', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['vehicle_barriers_k_rated'],
    helpText: 'K12-rated provides highest vehicle threat protection per DOS/ASTM standards.',
  },
  
  {
    id: 'dc_perimeter_intrusion_detection',
    section: 'Perimeter & Site Security',
    zoneApplicable: ['perimeter'],
    questionText: 'Does the perimeter have intrusion detection capability?',
    questionType: 'multiple_choice',
    options: [
      'Vibration sensors with fence detection',
      'Fiber optic fence detection',
      'Motion sensors only',
      'CCTV with analytics only',
      'No intrusion detection',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No intrusion detection'],
    riskWeight: 2,
    riskIndicators: ['no intrusion', 'none'],
    informsThreat: ['unauthorized_physical_access', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['perimeter_intrusion_detection'],
    helpText: 'Fence-mounted detection provides earliest warning of perimeter breach attempt.',
  },
  
  {
    id: 'dc_perimeter_lighting',
    section: 'Perimeter & Site Security',
    zoneApplicable: ['perimeter', 'building_exterior'],
    questionText: 'Does perimeter lighting meet IESNA security lighting standards?',
    questionType: 'multiple_choice',
    options: [
      'Full IESNA compliance (5+ fc at perimeter, 10+ fc at entries)',
      'Adequate lighting but not measured to standards',
      'Lighting present but inadequate coverage',
      'No dedicated security lighting',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Lighting present but inadequate coverage', 'No dedicated security lighting'],
    riskWeight: 2,
    riskIndicators: ['no dedicated', 'no security lighting', 'inadequate'],
    informsThreat: ['unauthorized_physical_access', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['perimeter_lighting_iesna'],
    helpText: 'IESNA recommends 5 foot-candles minimum at perimeter fence line.',
  },
  
  {
    id: 'dc_perimeter_cctv',
    section: 'Perimeter & Site Security',
    zoneApplicable: ['perimeter'],
    questionText: 'What is the CCTV coverage of the perimeter?',
    questionType: 'multiple_choice',
    options: [
      'Complete coverage with overlapping fields of view',
      'Complete coverage with minimal overlap',
      'Partial coverage (gaps exist)',
      'No CCTV coverage',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Partial coverage (gaps exist)', 'No CCTV coverage'],
    riskWeight: 2,
    riskIndicators: ['no cctv', 'partial coverage', 'gaps exist'],
    informsThreat: ['unauthorized_physical_access', 'terrorism_vehicle_borne'],
    informsVulnerability: true,
    suggestsControls: ['perimeter_cctv_coverage'],
    helpText: 'Complete perimeter CCTV with no blind spots required for SOC 2 compliance.',
  },
  
  {
    id: 'dc_perimeter_patrol',
    section: 'Perimeter & Site Security',
    zoneApplicable: ['perimeter'],
    questionText: 'Is there security patrol of the perimeter?',
    questionType: 'multiple_choice',
    options: [
      '24/7 dedicated patrol with guard tours',
      '24/7 patrol with random intervals',
      'Business hours patrol only',
      'No patrol',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No patrol'],
    riskWeight: 1,
    riskIndicators: ['no patrol'],
    informsThreat: ['unauthorized_physical_access', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['security_patrol_24x7', 'guard_checkpoint'],
    helpText: 'Tier III+ facilities typically require 24/7 security presence.',
  },
  
  {
    id: 'dc_security_monitoring_location',
    section: 'Perimeter & Site Security',
    zoneApplicable: ['noc_soc'],
    questionText: 'Where is security monitoring conducted?',
    questionType: 'multiple_choice',
    options: [
      '24/7 on-site NOC/SOC with redundant off-site backup',
      '24/7 on-site NOC/SOC only',
      '24/7 off-site central monitoring station',
      'On-site during business hours only',
      'No active monitoring',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['On-site during business hours only', 'No active monitoring'],
    riskWeight: 2,
    riskIndicators: ['no active monitoring', 'business hours only'],
    informsThreat: ['unauthorized_physical_access', 'fire_equipment_damage', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['noc_soc_24x7', 'alarm_monitoring_central'],
    helpText: 'Tier III+ facilities require 24/7 monitoring capability.',
  },
  
  // =========================================================================
  // SECTION 3: ACCESS CONTROL & AUTHENTICATION
  // =========================================================================
  
  {
    id: 'dc_access_authentication_method',
    section: 'Access Control & Authentication',
    zoneApplicable: ['lobby_reception', 'datacenter_floor'],
    questionText: 'What authentication method is used for datacenter access?',
    questionType: 'multiple_choice',
    options: [
      'Three-factor (card + biometric + PIN)',
      'Card + biometric (two-factor)',
      'Card + PIN (two-factor)',
      'Access card only (single factor)',
      'Physical keys only',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Access card only (single factor)', 'Physical keys only'],
    riskWeight: 2,
    riskIndicators: ['key only', 'physical keys', 'card only', 'single factor'],
    informsThreat: ['unauthorized_physical_access', 'tailgating_mantrap_bypass', 'social_engineering_entry'],
    informsVulnerability: true,
    suggestsControls: ['biometric_authentication', 'multi_factor_access'],
    helpText: 'Multi-factor authentication required for SOC 2 compliance and Tier III+ facilities.',
    followUpQuestions: [
      {
        id: 'dc_credential_incidents',
        section: 'Access Control & Authentication',
        questionText: 'Have there been incidents of lost credentials or unauthorized duplication?',
        questionType: 'yes_no',
        required: false,
        polarity: 'YES_BAD',
        badAnswers: ['yes'],
        riskWeight: 1,
        informsThreat: ['unauthorized_physical_access'],
        condition: {
          questionId: 'dc_access_authentication_method',
          expectedValue: ['Access card only (single factor)', 'Physical keys only'],
        },
      },
    ],
  },
  
  {
    id: 'dc_biometric_type',
    section: 'Access Control & Authentication',
    questionText: 'If biometrics are used, what type?',
    questionType: 'multiple_choice',
    options: [
      'Palm vein (highest security)',
      'Iris scan',
      'Fingerprint',
      'Facial recognition',
      'Not applicable - no biometrics',
    ],
    required: false,
    polarity: 'CONTEXT',
    riskWeight: 0,
    condition: {
      questionId: 'dc_access_authentication_method',
      expectedValue: ['Three-factor (card + biometric + PIN)', 'Card + biometric (two-factor)'],
    },
    helpText: 'Palm vein and iris provide highest security - difficult to spoof.',
  },
  
  {
    id: 'dc_mantrap_portals',
    section: 'Access Control & Authentication',
    zoneApplicable: ['lobby_reception', 'datacenter_floor'],
    questionText: 'Are man-trap portals (security vestibules) used at datacenter entrances?',
    questionType: 'multiple_choice',
    options: [
      'Yes, at all datacenter entry points with weight sensors',
      'Yes, at main entrance only',
      'Partial implementation (some entries)',
      'No man-traps, standard doors',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No man-traps, standard doors'],
    riskWeight: 2,
    riskIndicators: ['no man-trap', 'no mantrap', 'standard doors'],
    informsThreat: ['tailgating_mantrap_bypass', 'unauthorized_physical_access', 'social_engineering_entry'],
    informsVulnerability: true,
    suggestsControls: ['mantrap_portals', 'tailgating_detection'],
    helpText: 'Man-traps prevent tailgating - critical since 30%+ of intrusions involve tailgating.',
  },
  
  {
    id: 'dc_tailgating_prevention',
    section: 'Access Control & Authentication',
    questionText: 'What measures prevent tailgating (piggybacking)?',
    questionType: 'checklist',
    options: [
      'Man-trap portals (single occupancy)',
      'Optical turnstiles with tailgating detection',
      'Weight/floor sensors',
      'Video analytics for tailgating detection',
      'Security guard observation',
      'Signage and policy only',
      'No specific measures',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Signage and policy only', 'No specific measures'],
    riskWeight: 2,
    riskIndicators: ['no specific measures', 'signage only', 'policy only'],
    informsThreat: ['tailgating_mantrap_bypass', 'unauthorized_physical_access'],
    informsVulnerability: true,
    suggestsControls: ['mantrap_portals', 'tailgating_detection'],
    helpText: 'Technical controls required - policy-only approaches are ineffective.',
  },
  
  {
    id: 'dc_visitor_management',
    section: 'Access Control & Authentication',
    zoneApplicable: ['lobby_reception'],
    questionText: 'Describe the visitor management process:',
    questionType: 'checklist',
    options: [
      'Automated visitor management system',
      'Pre-registration required',
      'Photo ID verification',
      'Background check for recurring visitors',
      'Visitor badges printed on-site',
      'Sign-in log only',
      'No formal process',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Sign-in log only', 'No formal process'],
    riskWeight: 2,
    riskIndicators: ['no formal process', 'sign-in log only', 'sign-in only'],
    informsThreat: ['social_engineering_entry', 'vendor_contractor_breach', 'unauthorized_physical_access'],
    informsVulnerability: true,
    suggestsControls: ['visitor_management_system'],
    helpText: 'SOC 2 requires visitor identification and logging.',
  },
  
  {
    id: 'dc_escort_requirements',
    section: 'Access Control & Authentication',
    questionText: 'Are visitors required to be escorted in the datacenter at all times?',
    questionType: 'multiple_choice',
    options: [
      'Yes, mandatory escort with documented handoff',
      'Yes, escort required but not always enforced',
      'Escort optional or situational',
      'No escort required',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Escort optional or situational', 'No escort required'],
    riskWeight: 2,
    riskIndicators: ['no escort', 'escort optional', 'situational'],
    informsThreat: ['social_engineering_entry', 'vendor_contractor_breach', 'theft_equipment_components'],
    informsVulnerability: true,
    suggestsControls: ['escort_requirements'],
    helpText: 'Mandatory escort prevents unauthorized access to customer equipment.',
  },
  
  {
    id: 'dc_cabinet_level_access',
    section: 'Access Control & Authentication',
    zoneApplicable: ['server_aisles', 'customer_cages'],
    questionText: 'How is access controlled at the cabinet/rack level?',
    questionType: 'multiple_choice',
    options: [
      'Electronic locks with individual access logging',
      'Biometric cabinet locks',
      'Individual mechanical locks (unique keys)',
      'Standard mechanical locks (same key)',
      'No cabinet-level locks',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Standard mechanical locks (same key)', 'No cabinet-level locks'],
    riskWeight: 2,
    riskIndicators: ['no cabinet', 'no locks', 'same key', 'standard mechanical'],
    informsThreat: ['theft_equipment_components', 'insider_threat_privileged_access', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['cabinet_level_locks'],
    helpText: 'Individual cabinet security critical for colocation - protects customer equipment.',
  },
  
  {
    id: 'dc_access_logging',
    section: 'Access Control & Authentication',
    questionText: 'Is all physical access logged and auditable?',
    questionType: 'multiple_choice',
    options: [
      'Automated logging with tamper-proof audit trail',
      'Automated logging with standard retention',
      'Manual logs maintained',
      'No access logging',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Manual logs only', 'No access logging'],
    riskWeight: 2,
    riskIndicators: ['no access logging', 'no logging', 'manual logs only'],
    informsThreat: ['unauthorized_physical_access', 'insider_threat_privileged_access'],
    informsVulnerability: true,
    suggestsControls: ['access_logging_audit'],
    helpText: 'SOC 2 requires automated access logging with audit capability.',
  },
  
  {
    id: 'dc_access_review_frequency',
    section: 'Access Control & Authentication',
    questionText: 'How often are access rights reviewed and updated?',
    questionType: 'multiple_choice',
    options: [
      'Quarterly with management sign-off',
      'Semi-annually',
      'Annually',
      'Never or ad-hoc only',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Annually', 'Never or ad-hoc only'],
    riskWeight: 2,
    riskIndicators: ['never', 'ad-hoc only', 'ad hoc'],
    informsThreat: ['insider_threat_privileged_access'],
    informsVulnerability: true,
    suggestsControls: ['access_review_quarterly'],
    helpText: 'SOC 2 requires regular access reviews - quarterly is best practice.',
  },
  
  {
    id: 'dc_access_revocation',
    section: 'Access Control & Authentication',
    questionText: 'How quickly are access rights revoked when employment ends?',
    questionType: 'multiple_choice',
    options: [
      'Immediately upon termination',
      'Same business day',
      'Within 24 hours',
      'Delayed (24+ hours)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Within 24 hours', 'Delayed (24+ hours)'],
    riskWeight: 2,
    riskIndicators: ['delayed', '24+ hours', '24 hours'],
    informsThreat: ['insider_threat_privileged_access', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['access_revocation_immediate'],
    helpText: 'Immediate revocation critical - disgruntled ex-employees are highest insider threat risk.',
  },
  
  {
    id: 'dc_customer_access_control',
    section: 'Access Control & Authentication',
    zoneApplicable: ['customer_cages', 'datacenter_floor'],
    questionText: 'For colocation/multi-tenant: How is customer access segregated?',
    questionType: 'checklist',
    options: [
      'Physical cages with individual access control',
      'Zoned access (customers limited to their area)',
      'Cabinet-level access control',
      'Time-of-day restrictions',
      'Escort required outside assigned area',
      'No segregation',
    ],
    required: false,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No segregation'],
    riskWeight: 2,
    riskIndicators: ['no segregation'],
    informsThreat: ['theft_equipment_components', 'sabotage_infrastructure', 'vendor_contractor_breach'],
    informsVulnerability: true,
    suggestsControls: ['customer_access_segregation'],
    condition: {
      questionId: 'dc_customer_type',
      expectedValue: ['Colocation (multi-tenant)', 'Hybrid (combination)'],
    },
    helpText: 'Customer segregation prevents unauthorized access to other tenant equipment.',
  },
  
  {
    id: 'dc_two_person_rule',
    section: 'Access Control & Authentication',
    questionText: 'Is a two-person rule enforced for sensitive areas or equipment?',
    questionType: 'multiple_choice',
    options: [
      'Yes, technically enforced (requires two credentials)',
      'Yes, policy-enforced with monitoring',
      'Policy exists but inconsistently enforced',
      'Not enforced',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Not enforced'],
    riskWeight: 1,
    riskIndicators: ['not enforced'],
    informsThreat: ['insider_threat_privileged_access', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['two_person_rule'],
    helpText: 'Two-person rule for MDF/IDF, electrical rooms, and critical infrastructure.',
  },
  
  // =========================================================================
  // SECTION 4: SURVEILLANCE & MONITORING
  // =========================================================================
  
  {
    id: 'dc_cctv_coverage_areas',
    section: 'Surveillance & Monitoring',
    questionText: 'Which areas have CCTV coverage?',
    questionType: 'checklist',
    options: [
      'Perimeter fence line',
      'Building exterior all sides',
      'Lobby/reception',
      'Datacenter floor/aisles',
      'Customer cages',
      'Loading dock',
      'Electrical rooms',
      'Generator yard',
      'MDF/IDF rooms',
      'NOC/SOC',
      'No CCTV coverage',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No CCTV coverage'],
    riskWeight: 2,
    riskIndicators: ['no cctv', 'none'],
    informsThreat: ['unauthorized_physical_access', 'theft_equipment_components', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['cctv_comprehensive_coverage'],
    helpText: 'Server aisles and cage entrances are critical areas for forensic capability.',
    followUpQuestions: [
      {
        id: 'dc_cctv_gaps_reason',
        section: 'Surveillance & Monitoring',
        questionText: 'What is preventing CCTV installation in uncovered areas?',
        questionType: 'text',
        required: false,
        polarity: 'CONTEXT',
        riskWeight: 0,
      },
    ],
  },
  
  {
    id: 'dc_cctv_hands_on_servers',
    section: 'Surveillance & Monitoring',
    zoneApplicable: ['server_aisles', 'customer_cages'],
    questionText: 'Can CCTV see hands-on-servers activity?',
    questionType: 'multiple_choice',
    options: [
      'Yes, clear view of hands working on equipment',
      'Yes, but limited angle',
      'Limited visibility (aisle view only)',
      'Cannot see server work',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Limited visibility (aisle view only)', 'Cannot see server work'],
    riskWeight: 2,
    riskIndicators: ['cannot see', 'no coverage', 'limited visibility'],
    informsThreat: ['theft_equipment_components', 'sabotage_infrastructure', 'insider_threat_privileged_access'],
    informsVulnerability: true,
    suggestsControls: ['cctv_hands_on_servers'],
    helpText: 'Critical for detecting unauthorized equipment tampering and component theft.',
  },
  
  {
    id: 'dc_video_retention',
    section: 'Surveillance & Monitoring',
    questionText: 'How long is video footage retained?',
    questionType: 'multiple_choice',
    options: [
      '180+ days',
      '90-180 days',
      '30-90 days',
      'Less than 30 days',
      'No retention (live view only)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Less than 30 days', 'No retention (live view only)'],
    riskWeight: 2,
    riskIndicators: ['less than 30', 'no retention', 'live view only'],
    informsVulnerability: true,
    suggestsControls: ['video_retention_90_days'],
    helpText: 'PCI-DSS requires 90-day retention for areas where cardholder data is processed.',
  },
  
  {
    id: 'dc_video_analytics',
    section: 'Surveillance & Monitoring',
    questionText: 'Are video analytics used for threat detection?',
    questionType: 'multiple_choice',
    options: [
      'Yes, AI-powered behavior analytics',
      'Yes, basic motion detection with alerts',
      'Motion detection for recording only',
      'No analytics',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No analytics'],
    riskWeight: 1,
    riskIndicators: ['no analytics'],
    informsThreat: ['unauthorized_physical_access', 'tailgating_mantrap_bypass'],
    informsVulnerability: true,
    suggestsControls: ['video_analytics'],
    helpText: 'Video analytics enable proactive threat detection vs reactive review.',
  },
  
  {
    id: 'dc_24x7_monitoring',
    section: 'Surveillance & Monitoring',
    zoneApplicable: ['noc_soc'],
    questionText: 'Is there 24/7 active video monitoring?',
    questionType: 'multiple_choice',
    options: [
      'Yes, dedicated security operators',
      'Yes, combined NOC/security staff',
      'Yes, off-site monitoring center',
      'Business hours only',
      'No active monitoring (recording only)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Business hours only', 'No active monitoring (recording only)'],
    riskWeight: 2,
    riskIndicators: ['no active monitoring', 'recording only', 'business hours only'],
    informsThreat: ['unauthorized_physical_access', 'fire_equipment_damage', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['noc_soc_24x7'],
    helpText: 'Tier III+ facilities require 24/7 monitoring for rapid incident response.',
  },
  
  {
    id: 'dc_alarm_monitoring',
    section: 'Surveillance & Monitoring',
    questionText: 'How are security alarms monitored?',
    questionType: 'multiple_choice',
    options: [
      'UL-listed central station monitoring with armed response',
      'Central station monitoring (no armed response)',
      'On-site monitoring only',
      'Local alarms only (audio/visual)',
      'No alarm system',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Local alarms only (audio/visual)', 'No alarm system'],
    riskWeight: 2,
    riskIndicators: ['no alarm', 'local alarms only', 'local only'],
    informsThreat: ['unauthorized_physical_access', 'sabotage_infrastructure', 'fire_equipment_damage'],
    informsVulnerability: true,
    suggestsControls: ['alarm_monitoring_central'],
    helpText: 'UL-listed central station monitoring ensures rapid response.',
  },
  
  {
    id: 'dc_monitoring_integration',
    section: 'Surveillance & Monitoring',
    questionText: 'Are security systems integrated?',
    questionType: 'multiple_choice',
    options: [
      'Fully integrated (access control, CCTV, alarms, environmental)',
      'Partially integrated (access + CCTV)',
      'Minimal integration (CCTV only)',
      'No integration (separate systems)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No integration (separate systems)'],
    riskWeight: 1,
    riskIndicators: ['no integration', 'separate systems'],
    informsVulnerability: true,
    helpText: 'Integration enables correlation of events and faster incident response.',
  },
  
  {
    id: 'dc_monitoring_response_time',
    section: 'Surveillance & Monitoring',
    questionText: 'What is the expected response time for security alarms?',
    questionType: 'multiple_choice',
    options: [
      'Under 5 minutes (on-site security)',
      '5-15 minutes (patrol response)',
      '15-30 minutes',
      'Over 30 minutes',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['15-30 minutes', 'Over 30 minutes'],
    riskWeight: 2,
    riskIndicators: ['over 30', '>30', '15-30 minutes'],
    informsVulnerability: true,
    helpText: 'Faster response time reduces potential damage from incidents.',
  },
  
  // =========================================================================
  // SECTION 5: POWER INFRASTRUCTURE SECURITY
  // =========================================================================
  
  {
    id: 'dc_power_redundancy',
    section: 'Power Infrastructure Security',
    zoneApplicable: ['electrical_rooms'],
    questionText: 'What level of power redundancy is implemented?',
    questionType: 'multiple_choice',
    options: [
      '2(N+1) - Fault tolerant with full redundancy',
      '2N - Full parallel redundancy',
      'N+1 - Basic redundancy',
      'Single path (no redundancy)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Single path (no redundancy)'],
    riskWeight: 3,
    riskIndicators: ['single path', 'no redundancy'],
    informsThreat: ['power_failure_extended'],
    informsVulnerability: true,
    suggestsControls: ['ups_n_plus_1'],
    helpText: 'Uptime Institute: Tier III requires N+1, Tier IV requires 2N or 2(N+1).',
  },
  
  {
    id: 'dc_utility_feeds',
    section: 'Power Infrastructure Security',
    questionText: 'How many utility power feeds serve the facility?',
    questionType: 'multiple_choice',
    options: [
      'Dual feeds from separate substations',
      'Dual feeds from same substation',
      'Single utility feed with generator backup',
      'Single utility feed',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Single utility feed', 'Dual feeds from same substation'],
    riskWeight: 2,
    riskIndicators: ['single utility', 'single feed', 'same substation'],
    informsThreat: ['power_failure_extended', 'natural_disaster_impact'],
    informsVulnerability: true,
    suggestsControls: ['redundant_utility_feeds'],
    helpText: 'Separate substations provide protection from single point of failure.',
  },
  
  {
    id: 'dc_generator_capacity',
    section: 'Power Infrastructure Security',
    zoneApplicable: ['generator_yard'],
    questionText: 'What is the generator backup capacity?',
    questionType: 'multiple_choice',
    options: [
      'N+1 or 2N redundancy with 72+ hours fuel',
      'N+1 redundancy with 48-72 hours fuel',
      'Single generator with 24-48 hours fuel',
      'Less than 24 hours at full load',
      'No generator',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Less than 24 hours at full load', 'No generator'],
    riskWeight: 3,
    riskIndicators: ['no generator', 'less than 24', '<24'],
    informsThreat: ['power_failure_extended', 'natural_disaster_impact'],
    informsVulnerability: true,
    suggestsControls: ['generator_automatic_transfer', 'generator_fuel_72_hours'],
    helpText: '72+ hours fuel capacity protects against extended utility outages.',
  },
  
  {
    id: 'dc_fuel_supply_agreement',
    section: 'Power Infrastructure Security',
    questionText: 'Is there a priority fuel supply agreement for extended outages?',
    questionType: 'yes_no',
    required: true,
    polarity: 'YES_GOOD',
    badAnswers: ['no'],
    riskWeight: 1,
    informsThreat: ['power_failure_extended', 'natural_disaster_impact'],
    informsVulnerability: true,
    suggestsControls: ['generator_fuel_72_hours'],
    helpText: 'Priority fuel agreements ensure continued operation during regional emergencies.',
  },
  
  {
    id: 'dc_ups_runtime',
    section: 'Power Infrastructure Security',
    questionText: 'What is the UPS battery runtime at full load?',
    questionType: 'multiple_choice',
    options: [
      '30+ minutes',
      '15-30 minutes',
      '5-15 minutes',
      'Less than 5 minutes',
      'No UPS system',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Less than 5 minutes', 'No UPS system'],
    riskWeight: 2,
    riskIndicators: ['no ups', 'less than 5', '<5'],
    informsThreat: ['power_failure_extended'],
    informsVulnerability: true,
    suggestsControls: ['ups_n_plus_1'],
    helpText: 'Minimum 15 minutes recommended to bridge until generator start.',
  },
  
  {
    id: 'dc_fuel_storage_security',
    section: 'Power Infrastructure Security',
    zoneApplicable: ['generator_yard'],
    questionText: 'How is fuel storage protected?',
    questionType: 'multiple_choice',
    options: [
      'Secure enclosure with access control and leak detection',
      'Fenced area with CCTV',
      'Locked enclosure only',
      'No security measures',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No security measures'],
    riskWeight: 2,
    riskIndicators: ['no security measures', 'no security'],
    informsThreat: ['sabotage_infrastructure', 'theft_equipment_components'],
    informsVulnerability: true,
    suggestsControls: ['fuel_storage_security'],
    helpText: 'Fuel contamination or theft can disable backup power capability.',
  },
  
  {
    id: 'dc_epo_protection',
    section: 'Power Infrastructure Security',
    zoneApplicable: ['datacenter_floor', 'electrical_rooms'],
    questionText: 'How are Emergency Power Off (EPO) buttons protected?',
    questionType: 'multiple_choice',
    options: [
      'Protected with cover + access control + duress alarm',
      'Protected with cover and access logging',
      'Protective cover only',
      'No protection (exposed button)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Protective cover only', 'No protection (exposed button)'],
    riskWeight: 2,
    riskIndicators: ['no protection', 'exposed button', 'cover only'],
    informsThreat: ['sabotage_infrastructure', 'insider_threat_privileged_access'],
    informsVulnerability: true,
    suggestsControls: ['epo_protection'],
    helpText: 'EPO buttons are sabotage targets - accidental or malicious activation causes outage.',
  },
  
  {
    id: 'dc_electrical_room_access',
    section: 'Power Infrastructure Security',
    zoneApplicable: ['electrical_rooms'],
    questionText: 'How is access to electrical rooms controlled?',
    questionType: 'multiple_choice',
    options: [
      'Restricted access with badge + logging + two-person rule',
      'Restricted access with badge and logging',
      'Locked but no access logging',
      'Unrestricted access',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Locked but no access logging', 'Unrestricted access'],
    riskWeight: 2,
    riskIndicators: ['unrestricted', 'no access logging', 'no logging'],
    informsThreat: ['sabotage_infrastructure', 'insider_threat_privileged_access'],
    informsVulnerability: true,
    suggestsControls: ['electrical_room_access'],
    helpText: 'Critical infrastructure rooms require restricted access and audit trail.',
  },
  
  // =========================================================================
  // SECTION 6: COOLING & ENVIRONMENTAL CONTROLS
  // =========================================================================
  
  {
    id: 'dc_cooling_redundancy',
    section: 'Cooling & Environmental Controls',
    zoneApplicable: ['cooling_plant', 'datacenter_floor'],
    questionText: 'What level of cooling redundancy is implemented?',
    questionType: 'multiple_choice',
    options: [
      '2N - Full parallel redundancy',
      'N+1 - Basic redundancy',
      'N+20% - Minimal overhead',
      'No redundancy (single cooling system)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No redundancy (single cooling system)'],
    riskWeight: 3,
    riskIndicators: ['no redundancy', 'single cooling'],
    informsThreat: ['cooling_failure_thermal_event'],
    informsVulnerability: true,
    suggestsControls: ['cooling_redundancy'],
    helpText: 'Cooling failure causes thermal event within minutes - high redundancy required.',
  },
  
  {
    id: 'dc_temp_humidity_monitoring',
    section: 'Cooling & Environmental Controls',
    zoneApplicable: ['datacenter_floor', 'server_aisles'],
    questionText: 'How is temperature and humidity monitored?',
    questionType: 'multiple_choice',
    options: [
      'Per-rack sensors with automated alerting',
      'Zone-level sensors with automated alerting',
      'Building-level HVAC monitoring',
      'Manual checks only',
      'No environmental monitoring',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Manual checks only', 'No environmental monitoring'],
    riskWeight: 2,
    riskIndicators: ['no environmental', 'no monitoring', 'manual checks only'],
    informsThreat: ['cooling_failure_thermal_event', 'environmental_contamination'],
    informsVulnerability: true,
    suggestsControls: ['temperature_humidity_monitoring', 'environmental_sensors'],
    helpText: 'ASHRAE recommends 64.4°F-80.6°F for server inlet temperatures.',
  },
  
  {
    id: 'dc_hot_cold_aisle_containment',
    section: 'Cooling & Environmental Controls',
    zoneApplicable: ['server_aisles'],
    questionText: 'Is hot/cold aisle containment implemented?',
    questionType: 'multiple_choice',
    options: [
      'Full containment (hot or cold aisle enclosed)',
      'Partial containment (blanking panels, raised floor management)',
      'Basic aisle separation',
      'No containment strategy',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No containment strategy'],
    riskWeight: 1,
    riskIndicators: ['no containment'],
    informsThreat: ['cooling_failure_thermal_event'],
    informsVulnerability: true,
    suggestsControls: ['hot_cold_aisle_containment'],
    helpText: 'Hot aisle containment improves cooling efficiency 30-40%.',
  },
  
  {
    id: 'dc_water_leak_detection',
    section: 'Cooling & Environmental Controls',
    zoneApplicable: ['datacenter_floor', 'cooling_plant'],
    questionText: 'Is water leak detection installed?',
    questionType: 'multiple_choice',
    options: [
      'Comprehensive cable-based detection under floor and at CRAC units',
      'Spot sensors at high-risk areas',
      'CRAC unit sensors only',
      'No leak detection',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No leak detection'],
    riskWeight: 2,
    riskIndicators: ['no leak detection', 'no detection'],
    informsThreat: ['water_intrusion_damage', 'cooling_failure_thermal_event'],
    informsVulnerability: true,
    suggestsControls: ['water_leak_detection'],
    helpText: 'Water leaks from cooling systems are leading cause of datacenter damage.',
  },
  
  {
    id: 'dc_chiller_plant_security',
    section: 'Cooling & Environmental Controls',
    zoneApplicable: ['cooling_plant'],
    questionText: 'How is the chiller plant physically secured?',
    questionType: 'multiple_choice',
    options: [
      'Enclosed and access controlled with CCTV',
      'Fenced with access control',
      'Fenced only',
      'Not secured (exposed/accessible)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Not secured (exposed/accessible)'],
    riskWeight: 2,
    riskIndicators: ['not secured', 'exposed', 'accessible'],
    informsThreat: ['sabotage_infrastructure', 'cooling_failure_thermal_event'],
    informsVulnerability: true,
    suggestsControls: ['chiller_plant_security'],
    helpText: 'External chiller plants are vulnerable to tampering and sabotage.',
  },
  
  {
    id: 'dc_environmental_contamination_protection',
    section: 'Cooling & Environmental Controls',
    questionText: 'What protections exist against environmental contamination?',
    questionType: 'checklist',
    options: [
      'Positive pressure HVAC',
      'Air filtration (MERV 13+)',
      'Particulate monitoring',
      'Chemical detection sensors',
      'No specific protections',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No specific protections'],
    riskWeight: 1,
    riskIndicators: ['no specific protections', 'no protection'],
    informsThreat: ['environmental_contamination'],
    informsVulnerability: true,
    suggestsControls: ['environmental_contamination_protection'],
    helpText: 'Airborne contaminants can damage sensitive equipment.',
  },
  
  // =========================================================================
  // SECTION 7: FIRE SUPPRESSION & LIFE SAFETY
  // =========================================================================
  
  {
    id: 'dc_fire_detection_system',
    section: 'Fire Suppression & Life Safety',
    zoneApplicable: ['datacenter_floor', 'electrical_rooms'],
    questionText: 'What type of fire detection system is installed?',
    questionType: 'multiple_choice',
    options: [
      'VESDA (Very Early Smoke Detection Apparatus)',
      'Air sampling smoke detection',
      'Spot-type smoke detectors (addressable)',
      'Standard smoke detectors',
      'No fire detection',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Standard smoke detectors', 'No fire detection'],
    riskWeight: 3,
    riskIndicators: ['no fire detection', 'standard smoke detectors'],
    informsThreat: ['fire_equipment_damage'],
    informsVulnerability: true,
    suggestsControls: ['vesda_early_detection'],
    helpText: 'VESDA provides earliest detection - critical minutes before visible smoke.',
  },
  
  {
    id: 'dc_fire_suppression_type',
    section: 'Fire Suppression & Life Safety',
    zoneApplicable: ['datacenter_floor'],
    questionText: 'What type of fire suppression system is installed?',
    questionType: 'multiple_choice',
    options: [
      'Clean agent (FM-200, Novec 1230, Inergen)',
      'Pre-action sprinkler (requires two triggers)',
      'Dry-pipe sprinkler',
      'Water sprinklers',
      'No suppression system',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Water sprinklers', 'No suppression system'],
    riskWeight: 3,
    riskIndicators: ['no suppression', 'water sprinklers', 'water'],
    informsThreat: ['fire_equipment_damage', 'water_intrusion_damage'],
    informsVulnerability: true,
    suggestsControls: ['clean_agent_suppression'],
    helpText: 'Water sprinklers destroy electronics - clean agents are datacenter standard.',
  },
  
  {
    id: 'dc_fire_suppression_zones',
    section: 'Fire Suppression & Life Safety',
    questionText: 'Is fire suppression zoned?',
    questionType: 'multiple_choice',
    options: [
      'Yes, per-room or per-area zones',
      'Yes, floor-level zones',
      'Partial zoning',
      'No zoning (entire facility discharges together)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No zoning (entire facility discharges together)'],
    riskWeight: 1,
    riskIndicators: ['no zoning', 'entire facility'],
    informsThreat: ['fire_equipment_damage'],
    informsVulnerability: true,
    suggestsControls: ['fire_zone_suppression'],
    helpText: 'Zoned suppression limits impact of discharge to affected area only.',
  },
  
  {
    id: 'dc_manual_release_protection',
    section: 'Fire Suppression & Life Safety',
    questionText: 'How are manual fire suppression release buttons protected?',
    questionType: 'multiple_choice',
    options: [
      'Protected with cover + access control + abort timer',
      'Protected with cover and access logging',
      'Signage only',
      'Not protected (exposed)',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Signage only', 'Not protected (exposed)'],
    riskWeight: 2,
    riskIndicators: ['not protected', 'exposed', 'signage only'],
    informsThreat: ['sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['manual_release_protection'],
    helpText: 'Manual release buttons are sabotage targets - false discharge is catastrophic.',
  },
  
  {
    id: 'dc_fire_system_monitoring',
    section: 'Fire Suppression & Life Safety',
    questionText: 'How is the fire system monitored?',
    questionType: 'multiple_choice',
    options: [
      'UL-listed central station + on-site NOC + fire department',
      'Central station + fire department',
      'On-site monitoring only',
      'Local alarms only',
      'No monitoring',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Local alarms only', 'No monitoring'],
    riskWeight: 2,
    riskIndicators: ['no monitoring', 'local alarms only', 'local only'],
    informsThreat: ['fire_equipment_damage'],
    informsVulnerability: true,
    suggestsControls: ['fire_system_monitoring'],
    helpText: 'Multiple monitoring paths ensure rapid fire department response.',
  },
  
  {
    id: 'dc_fire_system_testing',
    section: 'Fire Suppression & Life Safety',
    questionText: 'How often is the fire system tested?',
    questionType: 'multiple_choice',
    options: [
      'Quarterly with documented results',
      'Semi-annually',
      'Annually',
      'Never tested',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Annually', 'Never tested'],
    riskWeight: 2,
    riskIndicators: ['never', 'annually'],
    informsVulnerability: true,
    suggestsControls: ['fire_system_testing_quarterly'],
    helpText: 'NFPA requires regular testing - quarterly is best practice.',
  },
  
  // =========================================================================
  // SECTION 8: PERSONNEL SECURITY & TRAINING
  // =========================================================================
  
  {
    id: 'dc_background_checks',
    section: 'Personnel Security & Training',
    questionText: 'What level of background checks are performed for datacenter staff?',
    questionType: 'multiple_choice',
    options: [
      'Comprehensive (criminal, credit, employment, education verification)',
      'Enhanced criminal history (multiple jurisdictions)',
      'Basic criminal history check',
      'No background checks',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Basic criminal history check', 'No background checks'],
    riskWeight: 2,
    riskIndicators: ['no background', 'basic criminal', 'basic only'],
    informsThreat: ['insider_threat_privileged_access', 'theft_equipment_components'],
    informsVulnerability: true,
    suggestsControls: ['background_checks_comprehensive'],
    helpText: 'SOC 2 requires background checks for employees with datacenter access.',
  },
  
  {
    id: 'dc_security_training',
    section: 'Personnel Security & Training',
    questionText: 'What security awareness training is provided?',
    questionType: 'multiple_choice',
    options: [
      'Annual training with role-specific modules and testing',
      'Annual general security training',
      'One-time onboarding only',
      'No security training',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['One-time onboarding only', 'No security training'],
    riskWeight: 2,
    riskIndicators: ['no security training', 'no training', 'onboarding only'],
    informsThreat: ['social_engineering_entry', 'insider_threat_privileged_access'],
    informsVulnerability: true,
    suggestsControls: ['security_training_annual'],
    helpText: 'Regular training reinforces security procedures and threat awareness.',
  },
  
  {
    id: 'dc_contractor_vetting',
    section: 'Personnel Security & Training',
    questionText: 'How are contractors and vendors vetted?',
    questionType: 'multiple_choice',
    options: [
      'Full vetting (background check + company verification + insurance)',
      'Background check and company verification',
      'Company verification only',
      'No vetting process',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Company verification only', 'No vetting process'],
    riskWeight: 2,
    riskIndicators: ['no vetting', 'company verification only'],
    informsThreat: ['vendor_contractor_breach', 'insider_threat_privileged_access'],
    informsVulnerability: true,
    suggestsControls: ['contractor_vetting'],
    helpText: 'Contractors often have privileged access - vetting is critical.',
  },
  
  {
    id: 'dc_termination_procedures',
    section: 'Personnel Security & Training',
    questionText: 'What are the termination procedures for access revocation?',
    questionType: 'multiple_choice',
    options: [
      'Documented process with immediate revocation and escort',
      'Same-day access revocation',
      'Access revoked within 24 hours',
      'No formal termination process',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Access revoked within 24 hours', 'No formal termination process'],
    riskWeight: 2,
    riskIndicators: ['no formal', 'within 24 hours', '24 hours'],
    informsThreat: ['insider_threat_privileged_access', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['termination_procedures', 'access_revocation_immediate'],
    helpText: 'Disgruntled ex-employees are highest insider threat - immediate revocation required.',
  },
  
  {
    id: 'dc_incident_response_plan',
    section: 'Personnel Security & Training',
    questionText: 'Is there a documented physical security incident response plan?',
    questionType: 'multiple_choice',
    options: [
      'Yes, documented and tested annually',
      'Yes, documented but never tested',
      'Informal/undocumented procedures',
      'No documented plan',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Yes, documented but never tested', 'Informal/undocumented procedures', 'No documented plan'],
    riskWeight: 2,
    riskIndicators: ['no documented', 'no plan', 'never tested'],
    informsVulnerability: true,
    suggestsControls: ['incident_response_plan'],
    helpText: 'SOC 2 requires documented incident response procedures.',
  },
  
  {
    id: 'dc_tool_control',
    section: 'Personnel Security & Training',
    questionText: 'Is there a tool control program?',
    questionType: 'multiple_choice',
    options: [
      'Yes, tracked inventory with sign-out procedures',
      'Yes, basic inventory',
      'Informal tracking',
      'No tool control',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No tool control'],
    riskWeight: 1,
    riskIndicators: ['no tool control', 'no control'],
    informsThreat: ['theft_equipment_components', 'sabotage_infrastructure'],
    informsVulnerability: true,
    suggestsControls: ['tool_control'],
    helpText: 'Tools can be used for theft or sabotage - tracking required.',
  },
  
  {
    id: 'dc_media_destruction',
    section: 'Personnel Security & Training',
    questionText: 'What process exists for secure media destruction?',
    questionType: 'multiple_choice',
    options: [
      'On-site destruction with certificate of destruction',
      'Certified third-party destruction with chain of custody',
      'Software wipe only',
      'No formal destruction process',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Software wipe only', 'No formal destruction process'],
    riskWeight: 2,
    riskIndicators: ['no formal', 'no destruction', 'software wipe only'],
    informsThreat: ['theft_equipment_components', 'insider_threat_privileged_access'],
    informsVulnerability: true,
    suggestsControls: ['media_destruction'],
    helpText: 'PCI-DSS requires physical destruction of media containing cardholder data.',
  },
  
  // =========================================================================
  // SECTION 9: COMPLIANCE & AUDIT
  // =========================================================================
  
  {
    id: 'dc_current_certifications',
    section: 'Compliance & Audit',
    questionText: 'What current security certifications does the facility hold?',
    questionType: 'checklist',
    options: [
      'SOC 2 Type II',
      'SOC 1 Type II',
      'ISO 27001',
      'PCI-DSS Level 1',
      'HIPAA',
      'FedRAMP',
      'SOC 2 Type I (initial)',
      'No certifications',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['No certifications'],
    riskWeight: 1,
    riskIndicators: ['no certifications', 'none'],
    informsVulnerability: true,
    suggestsControls: ['soc2_type_ii', 'iso_27001', 'pci_dss'],
    helpText: 'SOC 2 Type II is baseline for enterprise datacenter customers.',
  },
  
  {
    id: 'dc_audit_frequency',
    section: 'Compliance & Audit',
    questionText: 'How often are physical security audits conducted?',
    questionType: 'multiple_choice',
    options: [
      'Quarterly internal + annual external',
      'Semi-annual internal + annual external',
      'Annual external only',
      'Ad-hoc/as needed',
      'Never',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Ad-hoc/as needed', 'Never'],
    riskWeight: 2,
    riskIndicators: ['never', 'ad-hoc', 'ad hoc', 'as needed'],
    informsVulnerability: true,
    suggestsControls: ['audit_frequency_quarterly'],
    helpText: 'Regular audits identify control degradation before incidents occur.',
  },
  
  {
    id: 'dc_penetration_testing',
    section: 'Compliance & Audit',
    questionText: 'Is physical penetration testing conducted?',
    questionType: 'multiple_choice',
    options: [
      'Annual with remediation tracking',
      'Conducted once in the past',
      'Planned but not yet conducted',
      'Never conducted',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Conducted once in the past', 'Never conducted'],
    riskWeight: 2,
    riskIndicators: ['never', 'once in the past', 'once ever'],
    informsVulnerability: true,
    suggestsControls: ['penetration_testing_annual'],
    helpText: 'Physical pen testing identifies control gaps that audits miss.',
  },
  
  {
    id: 'dc_compliance_documentation',
    section: 'Compliance & Audit',
    questionText: 'Is compliance documentation maintained and current?',
    questionType: 'multiple_choice',
    options: [
      'Yes, comprehensive with version control',
      'Yes, basic documentation',
      'Documentation exists but outdated',
      'No formal documentation',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Documentation exists but outdated', 'No formal documentation'],
    riskWeight: 2,
    riskIndicators: ['no formal', 'no documentation', 'outdated'],
    informsVulnerability: true,
    helpText: 'Current documentation required for audit compliance.',
  },
  
  {
    id: 'dc_vulnerability_scanning',
    section: 'Compliance & Audit',
    questionText: 'How often are physical security systems scanned for vulnerabilities?',
    questionType: 'multiple_choice',
    options: [
      'Quarterly with remediation tracking',
      'Semi-annually',
      'Annually',
      'Ad-hoc when issues arise',
      'Never performed',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Ad-hoc when issues arise', 'Never performed'],
    riskWeight: 2,
    riskIndicators: ['never', 'ad-hoc', 'when issues'],
    informsThreat: ['cyber_physical_attack'],
    informsVulnerability: true,
    suggestsControls: ['vulnerability_scanning'],
    helpText: 'Access control and CCTV systems need security patching like IT systems.',
  },
  
  {
    id: 'dc_change_management',
    section: 'Compliance & Audit',
    questionText: 'Is there a change management process for physical security systems?',
    questionType: 'multiple_choice',
    options: [
      'Formal process with approval workflow and documentation',
      'Documented process with review',
      'Informal/undocumented process',
      'No formal process',
    ],
    required: true,
    polarity: 'MULTIPLE_CHOICE',
    badAnswers: ['Informal/undocumented process', 'No formal process'],
    riskWeight: 2,
    riskIndicators: ['no formal', 'no process', 'informal', 'undocumented'],
    informsVulnerability: true,
    suggestsControls: ['change_management'],
    helpText: 'SOC 2 requires documented change management for security systems.',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all questions including nested follow-ups as flat array
 */
export function getAllQuestionsFlattened(): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of DATACENTER_INTERVIEW_QUESTIONS) {
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
 * Get questions by section
 */
export function getQuestionsBySection(sectionName: DatacenterSection): InterviewQuestion[] {
  return DATACENTER_INTERVIEW_QUESTIONS.filter(q => q.section === sectionName);
}

/**
 * Get questions that inform a specific threat
 */
export function getQuestionsInformingThreat(threatId: DatacenterThreat): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of getAllQuestionsFlattened()) {
    if (question.informsThreat?.includes(threatId)) {
      result.push(question);
    }
  }
  
  return result;
}

/**
 * Get all questions with YES_GOOD polarity (controls that should exist)
 */
export function getYesGoodQuestions(): InterviewQuestion[] {
  return getAllQuestionsFlattened().filter(q => q.polarity === 'YES_GOOD');
}

/**
 * Get all questions with YES_BAD polarity (incident indicators)
 */
export function getYesBadQuestions(): InterviewQuestion[] {
  return getAllQuestionsFlattened().filter(q => q.polarity === 'YES_BAD');
}

/**
 * Get all questions with RATING polarity
 */
export function getRatingQuestions(): InterviewQuestion[] {
  return getAllQuestionsFlattened().filter(q => q.polarity === 'RATING');
}

/**
 * Get total possible risk weight for risk factor calculation
 */
export function getTotalPossibleRiskWeight(): number {
  return getAllQuestionsFlattened().reduce((sum, q) => sum + q.riskWeight, 0);
}

/**
 * Get question count by section
 */
export function getQuestionCountBySection(): Record<DatacenterSection, number> {
  const counts = {} as Record<DatacenterSection, number>;
  
  for (const section of DATACENTER_SECTIONS) {
    counts[section] = getQuestionsBySection(section).length;
  }
  
  return counts;
}

/**
 * Get questions that suggest a specific control
 */
export function getQuestionsSuggestingControl(controlId: string): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  
  for (const question of DATACENTER_INTERVIEW_QUESTIONS) {
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
export function getCriticalQuestionsForThreat(threatId: DatacenterThreat): string[] {
  const criticalQuestionMap: Record<DatacenterThreat, string[]> = {
    unauthorized_physical_access: ['dc_access_authentication_method', 'dc_mantrap_portals', 'dc_perimeter_barrier', 'dc_cabinet_level_access'],
    insider_threat_privileged_access: ['dc_background_checks', 'dc_access_revocation', 'dc_access_review_frequency', 'dc_two_person_rule'],
    tailgating_mantrap_bypass: ['dc_mantrap_portals', 'dc_tailgating_prevention', 'dc_visitor_management'],
    power_failure_extended: ['dc_power_redundancy', 'dc_generator_capacity', 'dc_ups_runtime', 'dc_utility_feeds'],
    cooling_failure_thermal_event: ['dc_cooling_redundancy', 'dc_temp_humidity_monitoring', 'dc_water_leak_detection'],
    fire_equipment_damage: ['dc_fire_detection_system', 'dc_fire_suppression_type', 'dc_fire_system_monitoring'],
    water_intrusion_damage: ['dc_water_leak_detection', 'dc_fire_suppression_type'],
    theft_equipment_components: ['dc_cabinet_level_access', 'dc_cctv_hands_on_servers', 'dc_escort_requirements'],
    sabotage_infrastructure: ['dc_epo_protection', 'dc_electrical_room_access', 'dc_chiller_plant_security', 'dc_manual_release_protection'],
    cyber_physical_attack: ['dc_vulnerability_scanning', 'dc_monitoring_integration'],
    social_engineering_entry: ['dc_visitor_management', 'dc_escort_requirements', 'dc_security_training'],
    terrorism_vehicle_borne: ['dc_vehicle_barriers', 'dc_standoff_distance', 'dc_perimeter_barrier'],
    natural_disaster_impact: ['dc_power_redundancy', 'dc_generator_capacity', 'dc_fuel_supply_agreement'],
    vendor_contractor_breach: ['dc_contractor_vetting', 'dc_escort_requirements', 'dc_visitor_management'],
    environmental_contamination: ['dc_environmental_contamination_protection', 'dc_temp_humidity_monitoring'],
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
    
    // Validate section is in DATACENTER_SECTIONS
    if (!DATACENTER_SECTIONS.includes(question.section as DatacenterSection)) {
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
        DATACENTER_INTERVIEW_QUESTIONS.some(q => q.id === question.condition!.questionId);
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
  sectionCounts: Record<DatacenterSection, number>;
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
  for (const q of DATACENTER_INTERVIEW_QUESTIONS) {
    if (q.followUpQuestions) {
      followUpCount += q.followUpQuestions.length;
    }
  }
  
  return {
    totalQuestions: allQuestions.length,
    topLevelQuestions: DATACENTER_INTERVIEW_QUESTIONS.length,
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
 * Get AI context prompt for datacenter assessments
 * Layer 3: Industry-Specific Standards integration
 */
export function getAIContextPrompt(): string {
  return `
## Datacenter & Critical Infrastructure Security Assessment Context

### Industry Standards Applied
- **Uptime Institute**: Tier I-IV classification standards for redundancy and availability
- **SOC 2 Type II**: Trust Services Criteria for security, availability, processing integrity
- **ISO 27001**: Information Security Management System requirements
- **PCI-DSS**: Payment Card Industry Data Security Standard
- **TIA-942**: Telecommunications Infrastructure Standard for Data Centers
- **NFPA 75/76**: Fire Protection standards for IT equipment
- **ASHRAE**: Environmental guidelines (temperature, humidity)

### Key Datacenter Threats (by Impact)
1. **Power Failure - Extended**: Average cost $9,000/minute. Cascading failure can affect all customers.
2. **Cooling Failure - Thermal Event**: Equipment damage within minutes. Can trigger fire suppression.
3. **Fire - Equipment Damage**: Clean agent suppression critical. Water sprinklers destroy equipment.
4. **Insider Threat - Privileged Access**: 60%+ of sabotage involves insiders (FBI). Immediate revocation critical.
5. **Unauthorized Physical Access**: Tailgating is primary vector - 30%+ of intrusions.

### Critical Control Points
- **Access Control**: Multi-factor required for Tier III+. Man-traps prevent tailgating.
- **Power Infrastructure**: N+1 minimum (Tier III), 2N for Tier IV. 72+ hour fuel capacity.
- **Cooling**: Redundancy critical - thermal events cause catastrophic damage.
- **Fire Suppression**: Clean agents (FM-200, Novec) - water destroys equipment.
- **Monitoring**: 24/7 NOC/SOC required for rapid incident response.

### Assessment Scoring Guidance
- **Vulnerability increases** when: controls below tier classification expectations, no redundancy
- **Impact factors**: SLA penalties, data sensitivity, customer count, tier classification
- **Threat likelihood factors**: location, insider threat surface, control gaps

### Report Focus Areas
1. Tier classification vs actual capability gaps
2. Power and cooling redundancy improvements
3. Access control hardening (MFA, man-traps)
4. Fire protection adequacy
5. 24/7 monitoring capability
`;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default DATACENTER_INTERVIEW_QUESTIONS;
