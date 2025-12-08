/**
 * RiskFixer Residential Security Site Walk Questionnaire
 * 
 * Implements ASIS GDL-RA Standards, ANSI Physical Security Standards, and CPTED Principles
 * for comprehensive residential security assessments.
 * 
 * 72 Questions across 12 Sections
 * T×V×I Risk Calculation Ready
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see ASIS International Security Risk Assessment Standard (2024)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ResidentialSection =
  | 'Property Profile & Environment'
  | 'Perimeter Security & Boundaries'
  | 'Exterior Lighting'
  | 'Landscaping & Natural Surveillance'
  | 'Entry Points - Doors'
  | 'Entry Points - Windows'
  | 'Garage & Vehicle Security'
  | 'Alarm & Intrusion Detection'
  | 'CCTV & Video Surveillance'
  | 'Interior Security'
  | 'Safe Room & Emergency Preparedness'
  | 'Monitoring & Response';

export type QuestionType = 'single_select' | 'multi_select' | 'yes_no' | 'rating' | 'text';

export type RiskIndicator = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type Polarity = 'HIGHER_WORSE' | 'LOWER_WORSE' | 'CONTEXT';

export type CPTEDPrinciple = 
  | 'natural_surveillance' 
  | 'natural_access_control' 
  | 'territorial_reinforcement' 
  | 'maintenance';

export interface QuestionOption {
  value: string;
  label: string;
  riskIndicator: RiskIndicator;
}

export interface ConditionalDisplay {
  questionId: string;
  expectedValue: string | string[];
  operator?: 'equals' | 'includes' | 'not_equals';
}

export interface ResidentialInterviewQuestion {
  id: string;
  section: ResidentialSection;
  questionText: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  polarity: Polarity;
  badAnswers?: string[];
  riskWeight: number;
  riskIndicators?: string[];
  informsVulnerability?: string[] | boolean;
  informsThreat?: string[];
  informsImpact?: boolean;
  suggestsControls?: string[];
  CPTED?: CPTEDPrinciple;
  weight: number;
  helpText?: string;
  condition?: ConditionalDisplay;
  followUpQuestions?: ResidentialInterviewQuestion[];
}

// ============================================================================
// RESIDENTIAL THREAT DEFINITIONS
// ============================================================================

export const RESIDENTIAL_THREATS = [
  { id: 'burglary', name: 'Residential Burglary', category: 'Property Crime' },
  { id: 'home_invasion', name: 'Home Invasion', category: 'Violent Crime' },
  { id: 'vehicle_theft', name: 'Vehicle Theft', category: 'Property Crime' },
  { id: 'vehicle_burglary', name: 'Vehicle Burglary', category: 'Property Crime' },
  { id: 'package_theft', name: 'Package Theft', category: 'Property Crime' },
  { id: 'trespassing', name: 'Trespassing', category: 'Property Crime' },
  { id: 'vandalism', name: 'Vandalism/Property Damage', category: 'Property Crime' },
  { id: 'stalking', name: 'Stalking/Harassment', category: 'Personal Safety' },
  { id: 'assault', name: 'Assault', category: 'Violent Crime' },
  { id: 'fire', name: 'Fire Emergency', category: 'Life Safety' },
  { id: 'natural_disaster', name: 'Natural Disaster', category: 'Environmental' },
] as const;

// ============================================================================
// SECTION 1: PROPERTY PROFILE & ENVIRONMENT (6 questions)
// ============================================================================

const SECTION_1_PROPERTY_PROFILE: ResidentialInterviewQuestion[] = [
  {
    id: 'res_property_type',
    section: 'Property Profile & Environment',
    questionText: 'What type of residential property is being assessed?',
    questionType: 'single_select',
    options: [
      { value: 'single_family_detached', label: 'Single-family detached home', riskIndicator: 'none' },
      { value: 'townhouse', label: 'Townhouse/row house', riskIndicator: 'low' },
      { value: 'condo_highrise', label: 'Condominium unit (mid/high-rise)', riskIndicator: 'low' },
      { value: 'duplex_triplex', label: 'Duplex/triplex', riskIndicator: 'low' },
      { value: 'estate_large', label: 'Estate/large property (1+ acres)', riskIndicator: 'medium' },
      { value: 'gated_community', label: 'Gated community residence', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 2,
    informsVulnerability: true,
    informsImpact: true,
    weight: 6,
    helpText: 'Property type affects applicable security measures and threat profile.',
  },
  {
    id: 'res_neighborhood_type',
    section: 'Property Profile & Environment',
    questionText: 'What is the neighborhood classification?',
    questionType: 'single_select',
    options: [
      { value: 'urban_city_center', label: 'Urban/city center', riskIndicator: 'high' },
      { value: 'suburban_residential', label: 'Suburban residential', riskIndicator: 'low' },
      { value: 'rural_semirural', label: 'Rural/semi-rural', riskIndicator: 'medium' },
      { value: 'mixed_use', label: 'Mixed-use (residential/commercial)', riskIndicator: 'medium' },
      { value: 'gated_private', label: 'Gated/private community', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['urban_city_center', 'mixed_use'],
    riskWeight: 3,
    informsThreat: ['burglary', 'home_invasion', 'vehicle_theft'],
    weight: 7,
    helpText: 'Urban and mixed-use areas typically have higher crime rates.',
  },
  {
    id: 'res_crime_score',
    section: 'Property Profile & Environment',
    questionText: 'What is the crime environment score for this location? (CAP Index or equivalent)',
    questionType: 'single_select',
    options: [
      { value: 'very_low_0_50', label: 'Very Low (0-50) - Well below national average', riskIndicator: 'none' },
      { value: 'low_51_80', label: 'Low (51-80) - Below national average', riskIndicator: 'low' },
      { value: 'moderate_81_120', label: 'Moderate (81-120) - Near national average', riskIndicator: 'medium' },
      { value: 'elevated_121_200', label: 'Elevated (121-200) - Above national average', riskIndicator: 'high' },
      { value: 'high_201_plus', label: 'High (201+) - Significantly above average', riskIndicator: 'critical' },
      { value: 'unknown', label: 'Unknown/Not assessed', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['elevated_121_200', 'high_201_plus'],
    riskWeight: 4,
    riskIndicators: ['high crime', 'elevated crime', 'above average'],
    informsThreat: ['burglary', 'home_invasion', 'vehicle_theft', 'vandalism', 'assault'],
    weight: 10,
    helpText: 'CAP Index scores provide objective geographic crime risk assessment.',
  },
  {
    id: 'res_visibility',
    section: 'Property Profile & Environment',
    questionText: 'Is the property visible from neighboring properties or public areas?',
    questionType: 'single_select',
    options: [
      { value: 'highly_visible', label: 'Highly visible from multiple vantage points', riskIndicator: 'none' },
      { value: 'moderately_visible', label: 'Moderately visible from street and some neighbors', riskIndicator: 'low' },
      { value: 'limited_visibility', label: 'Limited visibility - significant screening/setback', riskIndicator: 'medium' },
      { value: 'not_visible', label: 'Not visible - fully isolated/screened', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['limited_visibility', 'not_visible'],
    riskWeight: 2,
    informsVulnerability: true,
    CPTED: 'natural_surveillance',
    weight: 6,
    helpText: 'CPTED principle: Natural surveillance deters criminal activity through visibility.',
  },
  {
    id: 'res_police_response',
    section: 'Property Profile & Environment',
    questionText: 'What is the estimated police response time to this location?',
    questionType: 'single_select',
    options: [
      { value: 'under_5_min', label: 'Under 5 minutes', riskIndicator: 'none' },
      { value: '5_to_10_min', label: '5-10 minutes', riskIndicator: 'low' },
      { value: '10_to_15_min', label: '10-15 minutes', riskIndicator: 'medium' },
      { value: '15_to_30_min', label: '15-30 minutes', riskIndicator: 'high' },
      { value: 'over_30_min', label: 'Over 30 minutes', riskIndicator: 'critical' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['15_to_30_min', 'over_30_min'],
    riskWeight: 3,
    riskIndicators: ['slow response', 'long response time', 'rural'],
    informsVulnerability: true,
    weight: 8,
    helpText: 'Response time directly affects ability to interrupt crimes in progress.',
  },
  {
    id: 'res_incident_history',
    section: 'Property Profile & Environment',
    questionText: 'Have there been any security incidents at or near this property in the past 24 months?',
    questionType: 'single_select',
    options: [
      { value: 'yes_at_property', label: 'Yes - incidents at this property', riskIndicator: 'critical' },
      { value: 'yes_immediate_area', label: 'Yes - incidents on this street/immediate area', riskIndicator: 'high' },
      { value: 'yes_neighborhood', label: 'Yes - incidents in the neighborhood', riskIndicator: 'medium' },
      { value: 'no_incidents', label: 'No known incidents', riskIndicator: 'none' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'low' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['yes_at_property', 'yes_immediate_area'],
    riskWeight: 4,
    riskIndicators: ['previous burglary', 'prior incident', 'break-in history'],
    informsThreat: ['burglary', 'home_invasion', 'vehicle_theft', 'vandalism'],
    weight: 9,
    helpText: 'Prior victimization is a strong predictor of future targeting.',
    followUpQuestions: [
      {
        id: 'res_incident_details',
        section: 'Property Profile & Environment',
        questionText: 'Describe the incident type, date, and outcome:',
        questionType: 'text',
        required: false,
        polarity: 'CONTEXT',
        riskWeight: 0,
        weight: 5,
        condition: {
          questionId: 'res_incident_history',
          expectedValue: ['yes_at_property', 'yes_immediate_area'],
          operator: 'includes',
        },
      },
    ],
  },
];

// ============================================================================
// SECTION 2: PERIMETER SECURITY & BOUNDARIES (8 questions)
// ============================================================================

const SECTION_2_PERIMETER: ResidentialInterviewQuestion[] = [
  {
    id: 'res_boundary_defined',
    section: 'Perimeter Security & Boundaries',
    questionText: 'Is the property boundary clearly defined?',
    questionType: 'single_select',
    options: [
      { value: 'yes_full_fence', label: 'Yes - physical fence/wall surrounds entire property', riskIndicator: 'none' },
      { value: 'yes_fence_natural', label: 'Yes - combination of fence and natural boundary', riskIndicator: 'low' },
      { value: 'partial', label: 'Partial - some boundaries undefined', riskIndicator: 'medium' },
      { value: 'no_undefined', label: 'No - open/undefined boundaries', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['partial', 'no_undefined'],
    riskWeight: 2,
    informsVulnerability: true,
    CPTED: 'territorial_reinforcement',
    weight: 6,
    helpText: 'CPTED principle: Clear boundaries define ownership and deter trespass.',
  },
  {
    id: 'res_fence_type',
    section: 'Perimeter Security & Boundaries',
    questionText: 'If fenced, what type and height is the perimeter fence?',
    questionType: 'single_select',
    options: [
      { value: 'none', label: 'No fence present', riskIndicator: 'high' },
      { value: 'decorative_under_4ft', label: 'Decorative/ornamental (under 4 ft)', riskIndicator: 'medium' },
      { value: 'privacy_wood_4_6ft', label: 'Privacy fence - wood (4-6 ft)', riskIndicator: 'low' },
      { value: 'chainlink_4_6ft', label: 'Chain-link (4-6 ft)', riskIndicator: 'low' },
      { value: 'wrought_iron_6ft_plus', label: 'Wrought iron/steel (6+ ft)', riskIndicator: 'none' },
      { value: 'masonry_wall_6ft_plus', label: 'Masonry wall (6+ ft)', riskIndicator: 'none' },
      { value: 'security_8ft_anticlimb', label: 'Security fence with anti-climb features (8+ ft)', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['none', 'decorative_under_4ft'],
    riskWeight: 3,
    informsVulnerability: true,
    suggestsControls: ['perimeter_fence', 'perimeter_fence_anti_climb'],
    weight: 7,
    helpText: 'Fence height of 6+ feet provides meaningful delay; 8+ with anti-climb is optimal.',
  },
  {
    id: 'res_fence_condition',
    section: 'Perimeter Security & Boundaries',
    questionText: 'What is the condition of the perimeter fence/barrier?',
    questionType: 'single_select',
    options: [
      { value: 'excellent', label: 'Excellent - No gaps, damage, or deterioration', riskIndicator: 'none' },
      { value: 'good', label: 'Good - Minor wear, fully functional', riskIndicator: 'none' },
      { value: 'fair', label: 'Fair - Some repairs needed', riskIndicator: 'medium' },
      { value: 'poor', label: 'Poor - Significant gaps or damage', riskIndicator: 'high' },
      { value: 'na_no_fence', label: 'N/A - No fence present', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['poor', 'na_no_fence'],
    riskWeight: 2,
    informsVulnerability: true,
    CPTED: 'maintenance',
    weight: 5,
    helpText: 'CPTED principle: Well-maintained properties signal active ownership.',
  },
  {
    id: 'res_gate_type',
    section: 'Perimeter Security & Boundaries',
    questionText: 'Does the property have a gate or controlled entry point?',
    questionType: 'single_select',
    options: [
      { value: 'automatic_access_control', label: 'Yes - Automatic gate with access control', riskIndicator: 'none' },
      { value: 'manual_with_lock', label: 'Yes - Manual gate with lock', riskIndicator: 'low' },
      { value: 'gate_no_lock', label: 'Yes - Gate present but no lock', riskIndicator: 'medium' },
      { value: 'no_gate', label: 'No gate', riskIndicator: 'high' },
      { value: 'na_no_perimeter', label: 'N/A - No fence/perimeter barrier', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['gate_no_lock', 'no_gate', 'na_no_perimeter'],
    riskWeight: 2,
    informsVulnerability: true,
    suggestsControls: ['automatic_gate', 'gate_intercom'],
    weight: 6,
    helpText: 'Gates provide access control and delay for vehicle/pedestrian entry.',
    followUpQuestions: [
      {
        id: 'res_gate_access_method',
        section: 'Perimeter Security & Boundaries',
        questionText: 'What access control methods are used for the gate?',
        questionType: 'multi_select',
        options: [
          { value: 'keypad', label: 'Keypad/PIN', riskIndicator: 'low' },
          { value: 'remote', label: 'Remote control', riskIndicator: 'low' },
          { value: 'intercom', label: 'Intercom/video intercom', riskIndicator: 'none' },
          { value: 'card_reader', label: 'Card/fob reader', riskIndicator: 'none' },
          { value: 'phone_app', label: 'Smartphone app', riskIndicator: 'none' },
        ],
        required: false,
        polarity: 'CONTEXT',
        riskWeight: 1,
        weight: 4,
        condition: {
          questionId: 'res_gate_type',
          expectedValue: 'automatic_access_control',
          operator: 'equals',
        },
      },
    ],
  },
  {
    id: 'res_warning_signs',
    section: 'Perimeter Security & Boundaries',
    questionText: 'Are security warning signs displayed?',
    questionType: 'single_select',
    options: [
      { value: 'yes_alarm_signs', label: 'Yes - Alarm company signs prominently displayed', riskIndicator: 'none' },
      { value: 'yes_video_signs', label: 'Yes - Video surveillance warning signs', riskIndicator: 'none' },
      { value: 'yes_multiple', label: 'Yes - Multiple types of warning signs', riskIndicator: 'none' },
      { value: 'no_signs', label: 'No warning signs', riskIndicator: 'low' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_signs'],
    riskWeight: 1,
    informsVulnerability: true,
    CPTED: 'territorial_reinforcement',
    suggestsControls: ['signage_security_warnings'],
    weight: 3,
    helpText: 'Warning signs provide deterrence even without actual systems.',
  },
  {
    id: 'res_clear_zone',
    section: 'Perimeter Security & Boundaries',
    questionText: 'Is there a clear zone maintained around the structure?',
    questionType: 'single_select',
    options: [
      { value: 'yes_10ft_plus', label: 'Yes - 10+ feet of clear space around building', riskIndicator: 'none' },
      { value: 'partial', label: 'Partial - Some clear space maintained', riskIndicator: 'low' },
      { value: 'no_vegetation_close', label: 'No - Vegetation/objects close to structure', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_vegetation_close'],
    riskWeight: 2,
    informsVulnerability: true,
    CPTED: 'natural_surveillance',
    suggestsControls: ['clear_zone_landscaping'],
    weight: 5,
    helpText: 'Clear zones eliminate hiding spots and improve surveillance.',
  },
  {
    id: 'res_perimeter_detection',
    section: 'Perimeter Security & Boundaries',
    questionText: 'Are there any perimeter intrusion detection systems?',
    questionType: 'single_select',
    options: [
      { value: 'fence_sensors', label: 'Yes - Fence-mounted sensors', riskIndicator: 'none' },
      { value: 'motion_lights_cameras', label: 'Yes - Motion-activated lights/cameras', riskIndicator: 'low' },
      { value: 'ground_sensors', label: 'Yes - Ground sensors/buried cable', riskIndicator: 'none' },
      { value: 'multiple_systems', label: 'Yes - Multiple detection systems', riskIndicator: 'none' },
      { value: 'none', label: 'No perimeter detection', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['none'],
    riskWeight: 2,
    informsVulnerability: true,
    suggestsControls: ['perimeter_intrusion_detection'],
    weight: 6,
    helpText: 'Perimeter detection provides early warning before structure breach.',
  },
  {
    id: 'res_address_visible',
    section: 'Perimeter Security & Boundaries',
    questionText: 'Is the property address clearly visible from the street?',
    questionType: 'single_select',
    options: [
      { value: 'yes_day_night', label: 'Yes - Clearly visible day and night (illuminated)', riskIndicator: 'none' },
      { value: 'yes_daylight_only', label: 'Yes - Visible during daylight only', riskIndicator: 'low' },
      { value: 'partial', label: 'Partially visible - obstructed or small', riskIndicator: 'medium' },
      { value: 'not_visible', label: 'Not visible from street', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['partial', 'not_visible'],
    riskWeight: 1,
    informsVulnerability: ['emergency_response'],
    suggestsControls: ['address_visibility'],
    weight: 4,
    helpText: 'Address visibility is critical for emergency responder access.',
  },
];

// ============================================================================
// SECTION 3: EXTERIOR LIGHTING (6 questions)
// ============================================================================

const SECTION_3_LIGHTING: ResidentialInterviewQuestion[] = [
  {
    id: 'res_entry_lighting',
    section: 'Exterior Lighting',
    questionText: 'Is there lighting at all entry points (doors, gates)?',
    questionType: 'single_select',
    options: [
      { value: 'yes_all', label: 'Yes - All entry points well-lit', riskIndicator: 'none' },
      { value: 'partial', label: 'Partial - Some entry points lit', riskIndicator: 'medium' },
      { value: 'minimal', label: 'Minimal - Only main entry lit', riskIndicator: 'medium' },
      { value: 'none', label: 'No entry point lighting', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['partial', 'minimal', 'none'],
    riskWeight: 3,
    riskIndicators: ['dark entry', 'no lighting', 'unlit'],
    informsVulnerability: true,
    CPTED: 'natural_surveillance',
    suggestsControls: ['exterior_lighting'],
    weight: 7,
    helpText: 'Entry point lighting is essential for surveillance and deterrence.',
  },
  {
    id: 'res_lighting_type',
    section: 'Exterior Lighting',
    questionText: 'What type of exterior lighting is installed?',
    questionType: 'multi_select',
    options: [
      { value: 'dusk_to_dawn', label: 'Dusk-to-dawn automatic lights', riskIndicator: 'none' },
      { value: 'motion_activated', label: 'Motion-activated lights', riskIndicator: 'none' },
      { value: 'timer_controlled', label: 'Timer-controlled lights', riskIndicator: 'low' },
      { value: 'manual_only', label: 'Manual switch only', riskIndicator: 'medium' },
      { value: 'smart_connected', label: 'Smart/connected lighting', riskIndicator: 'none' },
      { value: 'solar_powered', label: 'Solar-powered lights', riskIndicator: 'low' },
      { value: 'none', label: 'None', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['manual_only', 'none'],
    riskWeight: 2,
    suggestsControls: ['motion_activated_lighting', 'smart_lighting'],
    weight: 5,
    helpText: 'Automatic lighting ensures consistent coverage without manual action.',
  },
  {
    id: 'res_perimeter_lighting',
    section: 'Exterior Lighting',
    questionText: 'Rate the overall perimeter lighting coverage:',
    questionType: 'single_select',
    options: [
      { value: 'excellent', label: 'Excellent - Full coverage, no dark areas', riskIndicator: 'none' },
      { value: 'good', label: 'Good - Most areas lit, minor gaps', riskIndicator: 'low' },
      { value: 'fair', label: 'Fair - Significant gaps in coverage', riskIndicator: 'medium' },
      { value: 'poor', label: 'Poor - Minimal or ineffective lighting', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['fair', 'poor'],
    riskWeight: 3,
    informsVulnerability: true,
    weight: 7,
    helpText: 'Gaps in lighting create opportunities for concealment.',
  },
  {
    id: 'res_driveway_lighting',
    section: 'Exterior Lighting',
    questionText: 'Is the driveway and parking area adequately lit?',
    questionType: 'single_select',
    options: [
      { value: 'yes_full', label: 'Yes - Fully illuminated', riskIndicator: 'none' },
      { value: 'partial', label: 'Partial - Some areas dark', riskIndicator: 'medium' },
      { value: 'no_dark', label: 'No - Dark/unlit', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No driveway', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['partial', 'no_dark'],
    riskWeight: 2,
    informsVulnerability: true,
    informsThreat: ['vehicle_theft', 'vehicle_burglary'],
    weight: 5,
    helpText: 'Dark driveways facilitate vehicle crimes and ambush attacks.',
  },
  {
    id: 'res_lights_protected',
    section: 'Exterior Lighting',
    questionText: 'Are exterior light fixtures protected from tampering?',
    questionType: 'single_select',
    options: [
      { value: 'yes_protected', label: 'Yes - High-mounted or enclosed fixtures', riskIndicator: 'none' },
      { value: 'partial', label: 'Partial - Some fixtures accessible', riskIndicator: 'medium' },
      { value: 'no_accessible', label: 'No - Easily accessible/tampered', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_accessible'],
    riskWeight: 1,
    informsVulnerability: true,
    weight: 4,
    helpText: 'Accessible fixtures can be disabled as attack precursor.',
  },
  {
    id: 'res_lights_backup',
    section: 'Exterior Lighting',
    questionText: 'Is there backup power for exterior lighting?',
    questionType: 'single_select',
    options: [
      { value: 'yes_generator_battery', label: 'Yes - Generator/battery backup', riskIndicator: 'none' },
      { value: 'partial_solar', label: 'Partial - Some solar-powered fixtures', riskIndicator: 'low' },
      { value: 'no_backup', label: 'No backup power', riskIndicator: 'low' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    riskWeight: 1,
    suggestsControls: ['backup_power_lighting'],
    weight: 3,
    helpText: 'Backup power maintains lighting during outages or power cuts.',
  },
];

// ============================================================================
// SECTION 4: LANDSCAPING & NATURAL SURVEILLANCE (5 questions)
// ============================================================================

const SECTION_4_LANDSCAPING: ResidentialInterviewQuestion[] = [
  {
    id: 'res_concealment_vegetation',
    section: 'Landscaping & Natural Surveillance',
    questionText: 'Are there shrubs or vegetation that could conceal an intruder near entry points?',
    questionType: 'single_select',
    options: [
      { value: 'no_low_trimmed', label: 'No - All vegetation is low or trimmed (under 3 ft)', riskIndicator: 'none' },
      { value: 'some_minor', label: 'Some - Minor concealment possible', riskIndicator: 'medium' },
      { value: 'yes_dense', label: 'Yes - Dense vegetation near doors/windows', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['some_minor', 'yes_dense'],
    riskWeight: 2,
    riskIndicators: ['overgrown', 'dense bushes', 'concealment'],
    informsVulnerability: true,
    CPTED: 'natural_surveillance',
    suggestsControls: ['clear_zone_landscaping'],
    weight: 6,
    helpText: 'CPTED recommendation: Keep shrubs under 3 feet near windows and doors.',
  },
  {
    id: 'res_street_sightline',
    section: 'Landscaping & Natural Surveillance',
    questionText: 'Is there clear sightline from the street to the front door?',
    questionType: 'single_select',
    options: [
      { value: 'yes_unobstructed', label: 'Yes - Unobstructed view', riskIndicator: 'none' },
      { value: 'partial_obstruction', label: 'Partial - Some obstruction', riskIndicator: 'medium' },
      { value: 'no_not_visible', label: 'No - Door not visible from street', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_not_visible'],
    riskWeight: 2,
    informsVulnerability: true,
    CPTED: 'natural_surveillance',
    weight: 5,
    helpText: 'Street visibility enables neighbor/passerby surveillance.',
  },
  {
    id: 'res_tree_access',
    section: 'Landscaping & Natural Surveillance',
    questionText: 'Are trees trimmed to prevent access to upper floors or roof?',
    questionType: 'single_select',
    options: [
      { value: 'yes_trimmed', label: 'Yes - No trees near structure or properly trimmed', riskIndicator: 'none' },
      { value: 'some_access', label: 'Some trees could provide access', riskIndicator: 'medium' },
      { value: 'yes_easy_access', label: 'Trees provide easy access to windows/roof', riskIndicator: 'high' },
      { value: 'na_no_trees', label: 'N/A - No trees on property', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['some_access', 'yes_easy_access'],
    riskWeight: 2,
    informsVulnerability: ['second_floor_access'],
    suggestsControls: ['landscaping_maintenance'],
    weight: 5,
    helpText: 'Trees within 8 feet of structure can enable second-story access.',
  },
  {
    id: 'res_defensive_landscaping',
    section: 'Landscaping & Natural Surveillance',
    questionText: 'Is defensive landscaping used? (thorny plants under windows, etc.)',
    questionType: 'single_select',
    options: [
      { value: 'yes_thorny', label: 'Yes - Thorny/defensive plants at vulnerable points', riskIndicator: 'none' },
      { value: 'some', label: 'Some defensive plantings', riskIndicator: 'low' },
      { value: 'none', label: 'No defensive landscaping', riskIndicator: 'low' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    riskWeight: 1,
    informsVulnerability: true,
    CPTED: 'natural_access_control',
    suggestsControls: ['defensive_landscaping'],
    weight: 4,
    helpText: 'Defensive plants (roses, hawthorn, pyracantha) deter window access.',
  },
  {
    id: 'res_climbing_aids',
    section: 'Landscaping & Natural Surveillance',
    questionText: 'Are there objects near the structure that could be used as climbing aids?',
    questionType: 'single_select',
    options: [
      { value: 'no_none', label: 'No - No ladders, furniture, or climbable objects', riskIndicator: 'none' },
      { value: 'yes_unsecured', label: 'Yes - Unsecured items present', riskIndicator: 'medium' },
      { value: 'yes_multiple', label: 'Yes - Multiple climbing aids available', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['yes_unsecured', 'yes_multiple'],
    riskWeight: 2,
    informsVulnerability: true,
    weight: 5,
    helpText: 'Secure or remove ladders, lawn furniture, trash cans near structure.',
  },
];

// ============================================================================
// SECTION 5: ENTRY POINTS - DOORS (8 questions)
// ============================================================================

const SECTION_5_DOORS: ResidentialInterviewQuestion[] = [
  {
    id: 'res_door_count',
    section: 'Entry Points - Doors',
    questionText: 'How many exterior doors does the residence have?',
    questionType: 'single_select',
    options: [
      { value: '1_to_2', label: '1-2 doors', riskIndicator: 'none' },
      { value: '3_to_4', label: '3-4 doors', riskIndicator: 'low' },
      { value: '5_to_6', label: '5-6 doors', riskIndicator: 'medium' },
      { value: '7_plus', label: '7+ doors', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    riskWeight: 1,
    informsVulnerability: ['multiple_entry_points'],
    weight: 4,
    helpText: 'More doors = more potential entry points to secure.',
  },
  {
    id: 'res_front_door_material',
    section: 'Entry Points - Doors',
    questionText: 'What is the front door construction material?',
    questionType: 'single_select',
    options: [
      { value: 'solid_wood', label: 'Solid wood (1-3/4" minimum)', riskIndicator: 'none' },
      { value: 'solid_metal', label: 'Solid metal/steel', riskIndicator: 'none' },
      { value: 'fiberglass', label: 'Fiberglass reinforced', riskIndicator: 'low' },
      { value: 'hollow_core', label: 'Hollow core', riskIndicator: 'critical' },
      { value: 'glass_decorative', label: 'Glass/decorative glass', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['hollow_core', 'glass_decorative'],
    riskWeight: 3,
    riskIndicators: ['hollow door', 'glass door', 'weak door'],
    informsVulnerability: ['forced_entry'],
    suggestsControls: ['reinforced_doors'],
    weight: 7,
    helpText: 'Hollow core doors can be breached in seconds with minimal effort.',
  },
  {
    id: 'res_front_lock_type',
    section: 'Entry Points - Doors',
    questionText: 'What type of lock is on the front door?',
    questionType: 'single_select',
    options: [
      { value: 'high_security_grade1', label: 'High-security deadbolt (ANSI Grade 1)', riskIndicator: 'none' },
      { value: 'standard_grade2', label: 'Standard deadbolt (ANSI Grade 2)', riskIndicator: 'low' },
      { value: 'smart_lock_deadbolt', label: 'Smart lock with deadbolt', riskIndicator: 'low' },
      { value: 'basic_grade3', label: 'Basic deadbolt (ANSI Grade 3)', riskIndicator: 'medium' },
      { value: 'knob_only_no_deadbolt', label: 'Knob lock only - no deadbolt', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['basic_grade3', 'knob_only_no_deadbolt'],
    riskWeight: 3,
    riskIndicators: ['no deadbolt', 'basic lock', 'knob lock only'],
    informsVulnerability: ['forced_entry'],
    suggestsControls: ['high_security_locks'],
    weight: 8,
    helpText: 'ANSI Grade 1 locks withstand 10x more force than Grade 3.',
  },
  {
    id: 'res_deadbolt_throw',
    section: 'Entry Points - Doors',
    questionText: 'What is the deadbolt throw length?',
    questionType: 'single_select',
    options: [
      { value: '1_inch_plus', label: '1 inch or longer (recommended)', riskIndicator: 'none' },
      { value: 'less_than_1_inch', label: 'Less than 1 inch', riskIndicator: 'medium' },
      { value: 'no_deadbolt', label: 'No deadbolt', riskIndicator: 'critical' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['less_than_1_inch', 'no_deadbolt'],
    riskWeight: 2,
    informsVulnerability: ['forced_entry'],
    weight: 5,
    helpText: '1" minimum throw prevents spreading attack on door frame.',
  },
  {
    id: 'res_strike_plate',
    section: 'Entry Points - Doors',
    questionText: 'Is there a reinforced strike plate with 3"+ screws?',
    questionType: 'single_select',
    options: [
      { value: 'yes_heavy_duty', label: 'Yes - Heavy-duty strike plate with long screws', riskIndicator: 'none' },
      { value: 'standard', label: 'Standard strike plate', riskIndicator: 'medium' },
      { value: 'no_damaged', label: 'No/damaged strike plate', riskIndicator: 'high' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['standard', 'no_damaged'],
    riskWeight: 2,
    informsVulnerability: ['kick_in_attack'],
    suggestsControls: ['door_frame_reinforcement'],
    weight: 6,
    helpText: 'Standard strike plates with short screws fail under kick attack.',
  },
  {
    id: 'res_door_frame',
    section: 'Entry Points - Doors',
    questionText: 'Is the door frame solid and in good condition?',
    questionType: 'single_select',
    options: [
      { value: 'yes_solid', label: 'Yes - Solid wood or metal frame, good condition', riskIndicator: 'none' },
      { value: 'wear_functional', label: 'Frame shows wear but functional', riskIndicator: 'low' },
      { value: 'damaged_deteriorated', label: 'Frame is damaged or deteriorated', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['damaged_deteriorated'],
    riskWeight: 2,
    informsVulnerability: ['forced_entry'],
    suggestsControls: ['door_frame_reinforcement'],
    weight: 6,
    helpText: 'Weak frames fail before locks do; frame reinforcement is critical.',
  },
  {
    id: 'res_door_glass_access',
    section: 'Entry Points - Doors',
    questionText: 'If there is glass in or near the door, can locks be reached by breaking it?',
    questionType: 'single_select',
    options: [
      { value: 'no_glass', label: 'No glass in or near door', riskIndicator: 'none' },
      { value: 'glass_no_reach', label: 'Glass present but cannot reach lock', riskIndicator: 'low' },
      { value: 'glass_reinforced', label: 'Glass is reinforced/laminated', riskIndicator: 'low' },
      { value: 'yes_accessible', label: 'Yes - Lock accessible through glass', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['yes_accessible'],
    riskWeight: 3,
    riskIndicators: ['glass near lock', 'reach through glass'],
    informsVulnerability: ['glass_break_entry'],
    suggestsControls: ['security_film', 'double_cylinder_deadbolt'],
    weight: 7,
    helpText: 'Glass within arm\'s reach of lock enables simple bypass.',
  },
  {
    id: 'res_door_viewer',
    section: 'Entry Points - Doors',
    questionText: 'Does the front door have a peephole or video doorbell?',
    questionType: 'single_select',
    options: [
      { value: 'video_doorbell', label: 'Yes - Video doorbell with recording', riskIndicator: 'none' },
      { value: 'peephole', label: 'Yes - Wide-angle peephole', riskIndicator: 'low' },
      { value: 'both', label: 'Yes - Both peephole and video doorbell', riskIndicator: 'none' },
      { value: 'none', label: 'No - No way to see visitors', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['none'],
    riskWeight: 2,
    informsVulnerability: ['social_engineering'],
    suggestsControls: ['video_doorbell'],
    weight: 5,
    helpText: 'Visitor identification prevents push-in attacks and scams.',
  },
];

// ============================================================================
// SECTION 6: ENTRY POINTS - WINDOWS (5 questions)
// ============================================================================

const SECTION_6_WINDOWS: ResidentialInterviewQuestion[] = [
  {
    id: 'res_window_locks',
    section: 'Entry Points - Windows',
    questionText: 'Are all ground-floor windows secured with locks?',
    questionType: 'single_select',
    options: [
      { value: 'yes_all', label: 'Yes - All windows have functioning locks', riskIndicator: 'none' },
      { value: 'most', label: 'Most windows locked', riskIndicator: 'low' },
      { value: 'some_unlocked', label: 'Some windows unlocked or broken locks', riskIndicator: 'high' },
      { value: 'few_none', label: 'Few/no window locks', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['some_unlocked', 'few_none'],
    riskWeight: 3,
    riskIndicators: ['unlocked windows', 'no window locks'],
    informsVulnerability: ['window_entry'],
    suggestsControls: ['window_locks'],
    weight: 7,
    helpText: 'Windows are common entry points for residential burglaries.',
  },
  {
    id: 'res_window_lock_type',
    section: 'Entry Points - Windows',
    questionText: 'What type of window locks are installed?',
    questionType: 'multi_select',
    options: [
      { value: 'keyed_locks', label: 'Keyed window locks', riskIndicator: 'none' },
      { value: 'pin_sash_locks', label: 'Pin locks/sash locks', riskIndicator: 'low' },
      { value: 'standard_latches', label: 'Standard latches only', riskIndicator: 'medium' },
      { value: 'secondary_blocking', label: 'Secondary blocking devices (dowels, bars)', riskIndicator: 'low' },
      { value: 'smart_locks', label: 'Smart/connected locks', riskIndicator: 'none' },
      { value: 'none', label: 'No locks', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['standard_latches', 'none'],
    riskWeight: 2,
    suggestsControls: ['window_security_locks'],
    weight: 5,
    helpText: 'Standard latches can be easily jimmied; secondary locks recommended.',
  },
  {
    id: 'res_security_film',
    section: 'Entry Points - Windows',
    questionText: 'Is security film applied to accessible windows?',
    questionType: 'single_select',
    options: [
      { value: 'yes_all', label: 'Yes - All ground-floor/accessible windows', riskIndicator: 'none' },
      { value: 'some', label: 'Some windows have security film', riskIndicator: 'low' },
      { value: 'none', label: 'No security film', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['none'],
    riskWeight: 2,
    informsVulnerability: ['glass_break_entry'],
    suggestsControls: ['security_window_film'],
    weight: 5,
    helpText: 'Security film delays glass penetration by 60-90 seconds.',
  },
  {
    id: 'res_window_bars',
    section: 'Entry Points - Windows',
    questionText: 'Are there window bars, grilles, or security screens on vulnerable windows?',
    questionType: 'single_select',
    options: [
      { value: 'yes_quick_release', label: 'Yes - With quick-release for egress', riskIndicator: 'none' },
      { value: 'yes_fixed', label: 'Yes - Fixed (verify fire egress compliance)', riskIndicator: 'low' },
      { value: 'some', label: 'Some windows protected', riskIndicator: 'medium' },
      { value: 'none', label: 'No window bars/grilles', riskIndicator: 'low' },
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 2,
    informsVulnerability: ['window_entry'],
    suggestsControls: ['window_bars_grilles'],
    weight: 6,
    helpText: 'Bars must have quick-release for fire egress compliance.',
  },
  {
    id: 'res_sliding_door',
    section: 'Entry Points - Windows',
    questionText: 'Are sliding glass doors properly secured?',
    questionType: 'single_select',
    options: [
      { value: 'yes_secondary_antilift', label: 'Yes - Secondary locks and anti-lift devices', riskIndicator: 'none' },
      { value: 'yes_bar_dowel', label: 'Yes - Security bar/dowel in track', riskIndicator: 'low' },
      { value: 'factory_only', label: 'Factory lock only', riskIndicator: 'medium' },
      { value: 'no_defeated', label: 'No - Easily defeated', riskIndicator: 'critical' },
      { value: 'na', label: 'N/A - No sliding doors', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['factory_only', 'no_defeated'],
    riskWeight: 3,
    informsVulnerability: ['sliding_door_entry'],
    suggestsControls: ['sliding_door_security'],
    weight: 7,
    helpText: 'Factory sliding door locks are easily defeated; secondary locks essential.',
  },
];

// ============================================================================
// SECTION 7: GARAGE & VEHICLE SECURITY (6 questions)
// ============================================================================

const SECTION_7_GARAGE: ResidentialInterviewQuestion[] = [
  {
    id: 'res_garage_type',
    section: 'Garage & Vehicle Security',
    questionText: 'What type of garage does the property have?',
    questionType: 'single_select',
    options: [
      { value: 'attached_interior', label: 'Attached garage with interior access to home', riskIndicator: 'medium' },
      { value: 'attached_no_interior', label: 'Attached garage - no interior access', riskIndicator: 'low' },
      { value: 'detached', label: 'Detached garage', riskIndicator: 'none' },
      { value: 'carport', label: 'Carport only', riskIndicator: 'medium' },
      { value: 'none', label: 'No garage or carport', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 2,
    informsVulnerability: ['garage_entry'],
    weight: 6,
    helpText: 'Attached garages with interior access create secondary entry vulnerability.',
  },
  {
    id: 'res_garage_interior_door',
    section: 'Garage & Vehicle Security',
    questionText: 'If attached garage, is the interior door secured like an exterior door?',
    questionType: 'single_select',
    options: [
      { value: 'yes_solid_deadbolt', label: 'Yes - Solid door with deadbolt', riskIndicator: 'none' },
      { value: 'solid_basic_lock', label: 'Solid door but basic lock', riskIndicator: 'medium' },
      { value: 'hollow_weak', label: 'Hollow door/weak lock', riskIndicator: 'high' },
      { value: 'no_unsecured', label: 'No door or unsecured', riskIndicator: 'critical' },
      { value: 'na', label: 'N/A - No attached garage', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['hollow_weak', 'no_unsecured'],
    riskWeight: 3,
    informsVulnerability: ['garage_entry'],
    suggestsControls: ['reinforced_garage_door'],
    weight: 7,
    helpText: 'Garage-to-house door is often weakest entry point in a home.',
  },
  {
    id: 'res_garage_opener',
    section: 'Garage & Vehicle Security',
    questionText: 'Is the garage door opener secured?',
    questionType: 'single_select',
    options: [
      { value: 'yes_rolling_code', label: 'Yes - Rolling code technology (post-2000)', riskIndicator: 'none' },
      { value: 'yes_vacation_lock', label: 'Yes - With vacation lock/disable switch', riskIndicator: 'none' },
      { value: 'old_fixed_code', label: 'Old technology - fixed code', riskIndicator: 'high' },
      { value: 'manual', label: 'Manual garage door', riskIndicator: 'low' },
      { value: 'na', label: 'N/A', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['old_fixed_code'],
    riskWeight: 2,
    informsVulnerability: ['garage_code_theft'],
    suggestsControls: ['rolling_code_opener'],
    weight: 5,
    helpText: 'Fixed-code openers can be captured with $30 code grabber.',
  },
  {
    id: 'res_emergency_release',
    section: 'Garage & Vehicle Security',
    questionText: 'Is the emergency release cord secured against fishing attacks?',
    questionType: 'single_select',
    options: [
      { value: 'yes_secured', label: 'Yes - Zip-tied or shielded', riskIndicator: 'none' },
      { value: 'no_standard', label: 'No - Standard hanging cord', riskIndicator: 'medium' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'medium' },
      { value: 'na', label: 'N/A - No automatic opener', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_standard'],
    riskWeight: 1,
    informsVulnerability: ['garage_fishing_attack'],
    suggestsControls: ['emergency_release_shield'],
    weight: 4,
    helpText: 'Fishing attack uses coat hanger through door top to pull release.',
  },
  {
    id: 'res_garage_windows',
    section: 'Garage & Vehicle Security',
    questionText: 'Are garage windows covered or frosted?',
    questionType: 'single_select',
    options: [
      { value: 'yes_covered', label: 'Yes - Cannot see inside garage', riskIndicator: 'none' },
      { value: 'partial', label: 'Partial covering', riskIndicator: 'low' },
      { value: 'no_visible', label: 'No - Contents visible', riskIndicator: 'medium' },
      { value: 'na', label: 'N/A - No garage windows', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_visible'],
    riskWeight: 1,
    informsVulnerability: ['casing'],
    CPTED: 'natural_surveillance',
    weight: 3,
    helpText: 'Visible garage contents reveal vehicles, tools, and valuables.',
  },
  {
    id: 'res_vehicle_parking',
    section: 'Garage & Vehicle Security',
    questionText: 'Where are vehicles typically parked?',
    questionType: 'single_select',
    options: [
      { value: 'garage_secured', label: 'Inside garage (secured)', riskIndicator: 'none' },
      { value: 'driveway_lit', label: 'Driveway with good lighting/visibility', riskIndicator: 'low' },
      { value: 'street', label: 'Street parking', riskIndicator: 'high' },
      { value: 'unsecured_dark', label: 'Unsecured/dark area', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['street', 'unsecured_dark'],
    riskWeight: 2,
    informsThreat: ['vehicle_theft', 'vehicle_burglary'],
    informsVulnerability: true,
    weight: 6,
    helpText: 'Vehicle location significantly affects theft and burglary risk.',
  },
];

// ============================================================================
// SECTION 8: ALARM & INTRUSION DETECTION (7 questions)
// ============================================================================

const SECTION_8_ALARM: ResidentialInterviewQuestion[] = [
  {
    id: 'res_alarm_installed',
    section: 'Alarm & Intrusion Detection',
    questionText: 'Is there an alarm system installed?',
    questionType: 'single_select',
    options: [
      { value: 'yes_professional_24x7', label: 'Yes - Professionally monitored 24/7', riskIndicator: 'none' },
      { value: 'yes_self_monitored', label: 'Yes - Self-monitored (app notifications)', riskIndicator: 'low' },
      { value: 'yes_local_only', label: 'Yes - Local alarm only (no monitoring)', riskIndicator: 'medium' },
      { value: 'no_system', label: 'No alarm system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['yes_local_only', 'no_system'],
    riskWeight: 4,
    riskIndicators: ['no alarm', 'no monitoring', 'unmonitored'],
    informsVulnerability: true,
    suggestsControls: ['monitored_alarm_system'],
    weight: 9,
    helpText: 'Monitored alarms reduce burglary risk by 50-60%.',
  },
  {
    id: 'res_alarm_sensors',
    section: 'Alarm & Intrusion Detection',
    questionText: 'What sensors are included in the alarm system?',
    questionType: 'multi_select',
    options: [
      { value: 'door_window_contacts', label: 'Door/window contact sensors', riskIndicator: 'none' },
      { value: 'motion_pir', label: 'Motion detectors (PIR)', riskIndicator: 'none' },
      { value: 'glass_break', label: 'Glass break sensors', riskIndicator: 'none' },
      { value: 'smoke_fire', label: 'Smoke/fire detectors', riskIndicator: 'none' },
      { value: 'co_detectors', label: 'Carbon monoxide detectors', riskIndicator: 'none' },
      { value: 'water_flood', label: 'Water/flood sensors', riskIndicator: 'none' },
      { value: 'panic_buttons', label: 'Panic buttons', riskIndicator: 'none' },
      { value: 'none', label: 'None/No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['none'],
    riskWeight: 3,
    informsVulnerability: true,
    weight: 7,
    helpText: 'Layered detection with contacts, motion, and glass break is optimal.',
  },
  {
    id: 'res_sensor_coverage',
    section: 'Alarm & Intrusion Detection',
    questionText: 'Are all entry points (doors/windows) covered by sensors?',
    questionType: 'single_select',
    options: [
      { value: 'yes_all', label: 'Yes - All entry points monitored', riskIndicator: 'none' },
      { value: 'most', label: 'Most entry points covered', riskIndicator: 'low' },
      { value: 'doors_only', label: 'Only doors covered', riskIndicator: 'medium' },
      { value: 'minimal', label: 'Minimal coverage', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['doors_only', 'minimal', 'na'],
    riskWeight: 3,
    informsVulnerability: true,
    suggestsControls: ['comprehensive_sensor_coverage'],
    weight: 7,
    helpText: 'Incomplete coverage leaves bypass opportunities.',
  },
  {
    id: 'res_alarm_usage',
    section: 'Alarm & Intrusion Detection',
    questionText: 'Is the alarm system regularly armed when residents are away/sleeping?',
    questionType: 'single_select',
    options: [
      { value: 'always', label: 'Yes - Always armed', riskIndicator: 'none' },
      { value: 'usually', label: 'Usually armed', riskIndicator: 'low' },
      { value: 'sometimes', label: 'Sometimes armed', riskIndicator: 'medium' },
      { value: 'rarely', label: 'Rarely armed', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['sometimes', 'rarely', 'na'],
    riskWeight: 2,
    riskIndicators: ['not armed', 'forget to arm', 'rarely use'],
    informsVulnerability: ['operational_security'],
    weight: 6,
    helpText: 'An alarm that is not armed provides zero protection.',
  },
  {
    id: 'res_alarm_backup',
    section: 'Alarm & Intrusion Detection',
    questionText: 'Does the alarm system have cellular/radio backup?',
    questionType: 'single_select',
    options: [
      { value: 'yes_cellular', label: 'Yes - Cellular backup', riskIndicator: 'none' },
      { value: 'yes_dual_path', label: 'Yes - Dual-path (cellular + internet)', riskIndicator: 'none' },
      { value: 'landline_only', label: 'Landline only', riskIndicator: 'high' },
      { value: 'no_backup', label: 'No backup - single communication path', riskIndicator: 'medium' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['landline_only'],
    riskWeight: 2,
    informsVulnerability: ['line_cut_defeat'],
    suggestsControls: ['cellular_backup_alarm'],
    weight: 6,
    helpText: 'Landline-only systems are defeated by cutting phone line.',
  },
  {
    id: 'res_panel_location',
    section: 'Alarm & Intrusion Detection',
    questionText: 'Is the alarm control panel in a secured location?',
    questionType: 'single_select',
    options: [
      { value: 'yes_hidden', label: 'Yes - Not visible from windows/entry points', riskIndicator: 'none' },
      { value: 'partial', label: 'Partially visible', riskIndicator: 'medium' },
      { value: 'visible_outside', label: 'Visible from outside', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['visible_outside', 'na'],
    riskWeight: 1,
    informsVulnerability: ['panel_tampering'],
    weight: 4,
    helpText: 'Visible panels reveal countdown timing and system type.',
  },
  {
    id: 'res_alarm_tested',
    section: 'Alarm & Intrusion Detection',
    questionText: 'When was the alarm system last tested/serviced?',
    questionType: 'single_select',
    options: [
      { value: 'within_6_months', label: 'Within past 6 months', riskIndicator: 'none' },
      { value: '6_to_12_months', label: '6-12 months ago', riskIndicator: 'low' },
      { value: 'over_1_year', label: 'Over 1 year ago', riskIndicator: 'medium' },
      { value: 'never_unknown', label: 'Never tested/unknown', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['over_1_year', 'never_unknown', 'na'],
    riskWeight: 1,
    informsVulnerability: ['system_reliability'],
    CPTED: 'maintenance',
    weight: 4,
    helpText: 'Untested systems may have dead batteries or faulty sensors.',
  },
];

// ============================================================================
// SECTION 9: CCTV & VIDEO SURVEILLANCE (6 questions)
// ============================================================================

const SECTION_9_CCTV: ResidentialInterviewQuestion[] = [
  {
    id: 'res_cctv_installed',
    section: 'CCTV & Video Surveillance',
    questionText: 'Is there a video surveillance system installed?',
    questionType: 'single_select',
    options: [
      { value: 'yes_comprehensive', label: 'Yes - Comprehensive coverage (4+ cameras)', riskIndicator: 'none' },
      { value: 'yes_partial', label: 'Yes - Partial coverage (1-3 cameras)', riskIndicator: 'low' },
      { value: 'doorbell_only', label: 'Video doorbell only', riskIndicator: 'medium' },
      { value: 'none', label: 'No video surveillance', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['doorbell_only', 'none'],
    riskWeight: 3,
    informsVulnerability: true,
    suggestsControls: ['cctv_residential'],
    weight: 7,
    helpText: 'CCTV provides deterrence, evidence, and remote monitoring.',
  },
  {
    id: 'res_camera_coverage',
    section: 'CCTV & Video Surveillance',
    questionText: 'What areas are covered by cameras?',
    questionType: 'multi_select',
    options: [
      { value: 'front_door', label: 'Front door/entrance', riskIndicator: 'none' },
      { value: 'back_door', label: 'Back door/rear entrance', riskIndicator: 'none' },
      { value: 'side_doors', label: 'Side doors', riskIndicator: 'none' },
      { value: 'driveway', label: 'Driveway', riskIndicator: 'none' },
      { value: 'garage', label: 'Garage', riskIndicator: 'none' },
      { value: 'backyard_perimeter', label: 'Backyard/perimeter', riskIndicator: 'none' },
      { value: 'interior', label: 'Interior common areas', riskIndicator: 'none' },
      { value: 'none', label: 'None', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['none'],
    riskWeight: 2,
    informsVulnerability: ['camera_coverage'],
    weight: 6,
    helpText: 'Critical areas: all entry points, driveway, perimeter.',
  },
  {
    id: 'res_video_retention',
    section: 'CCTV & Video Surveillance',
    questionText: 'What is the video recording retention period?',
    questionType: 'single_select',
    options: [
      { value: '30_plus_days', label: '30+ days (cloud or local)', riskIndicator: 'none' },
      { value: '14_to_30_days', label: '14-30 days', riskIndicator: 'low' },
      { value: '7_to_14_days', label: '7-14 days', riskIndicator: 'low' },
      { value: 'less_7_days', label: 'Less than 7 days', riskIndicator: 'medium' },
      { value: 'no_recording', label: 'No recording/live view only', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_recording', 'na'],
    riskWeight: 2,
    informsVulnerability: ['evidence_retention'],
    weight: 5,
    helpText: 'Minimum 7 days retention for evidence; 30+ days optimal.',
  },
  {
    id: 'res_remote_view',
    section: 'CCTV & Video Surveillance',
    questionText: 'Can cameras be viewed remotely?',
    questionType: 'single_select',
    options: [
      { value: 'yes_app_notifications', label: 'Yes - Mobile app with notifications', riskIndicator: 'none' },
      { value: 'yes_web_only', label: 'Yes - Web access only', riskIndicator: 'low' },
      { value: 'no_local_only', label: 'No - Local viewing only', riskIndicator: 'medium' },
      { value: 'na', label: 'N/A - No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_local_only', 'na'],
    riskWeight: 2,
    informsVulnerability: ['real_time_awareness'],
    suggestsControls: ['remote_video_monitoring'],
    weight: 5,
    helpText: 'Remote access enables real-time response to alerts.',
  },
  {
    id: 'res_camera_protected',
    section: 'CCTV & Video Surveillance',
    questionText: 'Are cameras protected from tampering?',
    questionType: 'single_select',
    options: [
      { value: 'yes_protected', label: 'Yes - High-mounted and/or vandal-resistant housings', riskIndicator: 'none' },
      { value: 'partial', label: 'Partial - Some cameras accessible', riskIndicator: 'medium' },
      { value: 'no_accessible', label: 'No - Cameras easily accessible', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_accessible', 'na'],
    riskWeight: 1,
    informsVulnerability: ['camera_defeat'],
    weight: 4,
    helpText: 'Cameras should be 10+ feet high or in vandal housings.',
  },
  {
    id: 'res_night_vision',
    section: 'CCTV & Video Surveillance',
    questionText: 'Do cameras have adequate night vision capability?',
    questionType: 'single_select',
    options: [
      { value: 'yes_excellent', label: 'Yes - Excellent IR/night vision', riskIndicator: 'none' },
      { value: 'yes_adequate', label: 'Yes - Adequate for identification', riskIndicator: 'low' },
      { value: 'limited', label: 'Limited night capability', riskIndicator: 'medium' },
      { value: 'no_night_vision', label: 'No night vision', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No system', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['limited', 'no_night_vision', 'na'],
    riskWeight: 2,
    informsVulnerability: ['nighttime_surveillance'],
    weight: 5,
    helpText: 'Most residential burglaries occur during darkness.',
  },
];

// ============================================================================
// SECTION 10: INTERIOR SECURITY (5 questions)
// ============================================================================

const SECTION_10_INTERIOR: ResidentialInterviewQuestion[] = [
  {
    id: 'res_safe',
    section: 'Interior Security',
    questionText: 'Is there a safe or secure storage for valuables?',
    questionType: 'single_select',
    options: [
      { value: 'yes_bolted', label: 'Yes - Fireproof safe bolted to floor/wall', riskIndicator: 'none' },
      { value: 'yes_basic', label: 'Yes - Basic safe (not secured)', riskIndicator: 'low' },
      { value: 'lockbox', label: 'Lockbox only', riskIndicator: 'medium' },
      { value: 'none', label: 'No secure storage', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    riskWeight: 2,
    informsVulnerability: ['valuable_theft'],
    suggestsControls: ['residential_safe'],
    weight: 5,
    helpText: 'Safes under 500 lbs should be bolted to prevent removal.',
  },
  {
    id: 'res_bedroom_door',
    section: 'Interior Security',
    questionText: 'Are master bedroom doors reinforced or lockable?',
    questionType: 'single_select',
    options: [
      { value: 'yes_solid_deadbolt', label: 'Yes - Solid door with deadbolt (safe room capable)', riskIndicator: 'none' },
      { value: 'yes_standard_lock', label: 'Yes - Standard lock', riskIndicator: 'low' },
      { value: 'no_standard_door', label: 'No - Standard interior door', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    riskWeight: 2,
    informsVulnerability: ['home_invasion'],
    suggestsControls: ['bedroom_security_door'],
    weight: 5,
    helpText: 'Reinforced bedroom provides final defensive position.',
  },
  {
    id: 'res_firearm_storage',
    section: 'Interior Security',
    questionText: 'Are firearms stored securely (if applicable)?',
    questionType: 'single_select',
    options: [
      { value: 'yes_gun_safe', label: 'Yes - Gun safe/cabinet (locked)', riskIndicator: 'none' },
      { value: 'yes_trigger_locks', label: 'Yes - Trigger locks', riskIndicator: 'low' },
      { value: 'no_accessible', label: 'No - Firearms accessible', riskIndicator: 'critical' },
      { value: 'na', label: 'N/A - No firearms', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_accessible'],
    riskWeight: 3,
    riskIndicators: ['unsecured firearms', 'guns accessible'],
    informsVulnerability: ['firearm_theft'],
    suggestsControls: ['gun_safe'],
    weight: 8,
    helpText: 'Unsecured firearms are high-value burglary targets.',
  },
  {
    id: 'res_valuables_visible',
    section: 'Interior Security',
    questionText: 'Are valuables visible from windows?',
    questionType: 'single_select',
    options: [
      { value: 'no_hidden', label: 'No - Nothing visible from outside', riskIndicator: 'none' },
      { value: 'some_visible', label: 'Some items visible', riskIndicator: 'medium' },
      { value: 'yes_high_value', label: 'Yes - High-value items visible', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['some_visible', 'yes_high_value'],
    riskWeight: 2,
    informsThreat: ['burglary'],
    CPTED: 'natural_surveillance',
    weight: 4,
    helpText: 'Visible electronics, jewelry, or cash invite targeting.',
  },
  {
    id: 'res_smart_home',
    section: 'Interior Security',
    questionText: 'Is there a home automation/smart home system?',
    questionType: 'single_select',
    options: [
      { value: 'yes_integrated', label: 'Yes - Integrated security and automation', riskIndicator: 'low' },
      { value: 'yes_basic', label: 'Yes - Basic smart devices', riskIndicator: 'low' },
      { value: 'none', label: 'No smart home features', riskIndicator: 'none' },
    ],
    required: true,
    polarity: 'CONTEXT',
    riskWeight: 1,
    informsVulnerability: ['cyber_physical'],
    weight: 4,
    helpText: 'Smart home devices can enhance or weaken security.',
    followUpQuestions: [
      {
        id: 'res_smart_security',
        section: 'Interior Security',
        questionText: 'Are default passwords changed and firmware updated?',
        questionType: 'yes_no',
        options: [
          { value: 'yes', label: 'Yes', riskIndicator: 'none' },
          { value: 'no', label: 'No', riskIndicator: 'high' },
        ],
        required: false,
        polarity: 'LOWER_WORSE',
        badAnswers: ['no'],
        riskWeight: 2,
        weight: 5,
        condition: {
          questionId: 'res_smart_home',
          expectedValue: ['yes_integrated', 'yes_basic'],
          operator: 'includes',
        },
      },
    ],
  },
];

// ============================================================================
// SECTION 11: SAFE ROOM & EMERGENCY PREPAREDNESS (5 questions)
// ============================================================================

const SECTION_11_EMERGENCY: ResidentialInterviewQuestion[] = [
  {
    id: 'res_safe_room',
    section: 'Safe Room & Emergency Preparedness',
    questionText: 'Is there a designated safe room or shelter-in-place location?',
    questionType: 'single_select',
    options: [
      { value: 'yes_purpose_built', label: 'Yes - Purpose-built safe room', riskIndicator: 'none' },
      { value: 'yes_reinforced', label: 'Yes - Reinforced room with communications', riskIndicator: 'none' },
      { value: 'designated_not_reinforced', label: 'Designated room (not reinforced)', riskIndicator: 'low' },
      { value: 'none', label: 'No designated location', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    riskWeight: 2,
    informsVulnerability: ['home_invasion'],
    suggestsControls: ['safe_room'],
    weight: 6,
    helpText: 'Safe rooms provide final defensive position and time for response.',
  },
  {
    id: 'res_safe_room_comms',
    section: 'Safe Room & Emergency Preparedness',
    questionText: 'Does the safe room/shelter location have independent communication?',
    questionType: 'single_select',
    options: [
      { value: 'yes_landline_cell', label: 'Yes - Landline and cell phone charging', riskIndicator: 'none' },
      { value: 'cell_only', label: 'Cell phone only', riskIndicator: 'low' },
      { value: 'no_independent', label: 'No independent communication', riskIndicator: 'high' },
      { value: 'na', label: 'N/A - No designated room', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_independent'],
    riskWeight: 2,
    informsVulnerability: ['communication_during_emergency'],
    suggestsControls: ['safe_room_communications'],
    weight: 5,
    helpText: 'Communication from safe room enables emergency response.',
  },
  {
    id: 'res_emergency_supplies',
    section: 'Safe Room & Emergency Preparedness',
    questionText: 'Are emergency supplies readily accessible?',
    questionType: 'multi_select',
    options: [
      { value: 'first_aid', label: 'First aid kit', riskIndicator: 'none' },
      { value: 'flashlights', label: 'Flashlights/batteries', riskIndicator: 'none' },
      { value: 'fire_extinguisher', label: 'Fire extinguisher', riskIndicator: 'none' },
      { value: 'emergency_contacts', label: 'Emergency contact list', riskIndicator: 'none' },
      { value: 'water_supplies', label: 'Water/basic supplies', riskIndicator: 'none' },
      { value: 'phone_charger', label: 'Backup phone charger', riskIndicator: 'none' },
      { value: 'none', label: 'None', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'CONTEXT',
    badAnswers: ['none'],
    riskWeight: 1,
    suggestsControls: ['emergency_supplies_kit'],
    weight: 4,
    helpText: 'Basic emergency supplies should be centrally located.',
  },
  {
    id: 'res_emergency_plan',
    section: 'Safe Room & Emergency Preparedness',
    questionText: 'Does the family have an emergency/evacuation plan?',
    questionType: 'single_select',
    options: [
      { value: 'yes_documented_practiced', label: 'Yes - Documented and practiced', riskIndicator: 'none' },
      { value: 'yes_discussed', label: 'Yes - Discussed but not practiced', riskIndicator: 'low' },
      { value: 'no_plan', label: 'No plan', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_plan'],
    riskWeight: 1,
    informsVulnerability: ['emergency_response'],
    suggestsControls: ['family_emergency_plan'],
    weight: 5,
    helpText: 'Practiced plans improve response during high-stress events.',
  },
  {
    id: 'res_smoke_co',
    section: 'Safe Room & Emergency Preparedness',
    questionText: 'Are smoke detectors and CO detectors installed and functional?',
    questionType: 'single_select',
    options: [
      { value: 'yes_tested', label: 'Yes - All required locations, tested recently', riskIndicator: 'none' },
      { value: 'installed_not_tested', label: 'Installed but not recently tested', riskIndicator: 'medium' },
      { value: 'partial', label: 'Partial installation', riskIndicator: 'high' },
      { value: 'none', label: 'None', riskIndicator: 'critical' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['partial', 'none'],
    riskWeight: 3,
    riskIndicators: ['no smoke detector', 'no CO detector'],
    informsVulnerability: ['fire_safety'],
    suggestsControls: ['smoke_co_detectors'],
    weight: 7,
    helpText: 'Life safety: Smoke/CO detectors required on every level.',
  },
];

// ============================================================================
// SECTION 12: MONITORING & RESPONSE (5 questions)
// ============================================================================

const SECTION_12_MONITORING: ResidentialInterviewQuestion[] = [
  {
    id: 'res_monitoring_level',
    section: 'Monitoring & Response',
    questionText: 'What monitoring service level is in place?',
    questionType: 'single_select',
    options: [
      { value: 'professional_ul_24x7', label: 'Professional 24/7 UL-listed central station', riskIndicator: 'none' },
      { value: 'professional_non_ul', label: 'Professional monitoring (non-UL)', riskIndicator: 'low' },
      { value: 'self_monitoring', label: 'Self-monitoring via app', riskIndicator: 'medium' },
      { value: 'no_monitoring', label: 'No monitoring', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['self_monitoring', 'no_monitoring'],
    riskWeight: 3,
    informsVulnerability: true,
    suggestsControls: ['ul_listed_monitoring'],
    weight: 8,
    helpText: 'UL-listed stations meet rigorous response time standards.',
  },
  {
    id: 'res_emergency_contacts',
    section: 'Monitoring & Response',
    questionText: 'Are emergency contact and verification procedures established?',
    questionType: 'single_select',
    options: [
      { value: 'yes_current', label: 'Yes - Current contact list with monitoring company', riskIndicator: 'none' },
      { value: 'partial_outdated', label: 'Partial - Some contacts outdated', riskIndicator: 'low' },
      { value: 'no_procedures', label: 'No - No established procedures', riskIndicator: 'medium' },
      { value: 'na', label: 'N/A - No monitoring service', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_procedures', 'na'],
    riskWeight: 1,
    informsVulnerability: ['verification_procedures'],
    weight: 5,
    helpText: 'Current contact list ensures proper notification sequence.',
  },
  {
    id: 'res_duress_code',
    section: 'Monitoring & Response',
    questionText: 'Is there a duress code or panic procedure?',
    questionType: 'single_select',
    options: [
      { value: 'yes_duress_code', label: 'Yes - Duress code with monitoring company', riskIndicator: 'none' },
      { value: 'yes_panic_button', label: 'Yes - Panic button on system', riskIndicator: 'none' },
      { value: 'no_procedure', label: 'No duress/panic procedure', riskIndicator: 'medium' },
      { value: 'na', label: 'N/A - No monitoring', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_procedure', 'na'],
    riskWeight: 2,
    informsVulnerability: ['coercion_scenario'],
    suggestsControls: ['duress_code_system'],
    weight: 5,
    helpText: 'Duress code triggers silent emergency dispatch during coercion.',
  },
  {
    id: 'res_security_training',
    section: 'Monitoring & Response',
    questionText: 'Have residents received any security awareness training?',
    questionType: 'single_select',
    options: [
      { value: 'yes_formal', label: 'Yes - Formal security briefing', riskIndicator: 'none' },
      { value: 'yes_basic', label: 'Yes - Basic awareness (system use)', riskIndicator: 'low' },
      { value: 'no_training', label: 'No training', riskIndicator: 'medium' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['no_training'],
    riskWeight: 1,
    informsVulnerability: ['operational_security'],
    suggestsControls: ['security_awareness_training'],
    weight: 4,
    helpText: 'Training improves recognition of threats and proper response.',
  },
  {
    id: 'res_perceived_security',
    section: 'Monitoring & Response',
    questionText: 'Overall, does the resident feel secure in their home?',
    questionType: 'rating',
    options: [
      { value: 'very_secure_5', label: 'Very secure (5)', riskIndicator: 'none' },
      { value: 'somewhat_secure_4', label: 'Somewhat secure (4)', riskIndicator: 'none' },
      { value: 'neutral_3', label: 'Neutral (3)', riskIndicator: 'low' },
      { value: 'somewhat_insecure_2', label: 'Somewhat insecure (2)', riskIndicator: 'medium' },
      { value: 'very_insecure_1', label: 'Very insecure (1)', riskIndicator: 'high' },
    ],
    required: true,
    polarity: 'HIGHER_WORSE',
    badAnswers: ['somewhat_insecure_2', 'very_insecure_1'],
    riskWeight: 1,
    informsImpact: true,
    weight: 3,
    helpText: 'Subjective security perception affects quality of life.',
  },
];

// ============================================================================
// COMPLETE QUESTIONNAIRE EXPORT
// ============================================================================

export const RESIDENTIAL_INTERVIEW_QUESTIONNAIRE: ResidentialInterviewQuestion[] = [
  ...SECTION_1_PROPERTY_PROFILE,
  ...SECTION_2_PERIMETER,
  ...SECTION_3_LIGHTING,
  ...SECTION_4_LANDSCAPING,
  ...SECTION_5_DOORS,
  ...SECTION_6_WINDOWS,
  ...SECTION_7_GARAGE,
  ...SECTION_8_ALARM,
  ...SECTION_9_CCTV,
  ...SECTION_10_INTERIOR,
  ...SECTION_11_EMERGENCY,
  ...SECTION_12_MONITORING,
];

// ============================================================================
// SECTION EXPORTS
// ============================================================================

export const RESIDENTIAL_SECTIONS = {
  'Property Profile & Environment': SECTION_1_PROPERTY_PROFILE,
  'Perimeter Security & Boundaries': SECTION_2_PERIMETER,
  'Exterior Lighting': SECTION_3_LIGHTING,
  'Landscaping & Natural Surveillance': SECTION_4_LANDSCAPING,
  'Entry Points - Doors': SECTION_5_DOORS,
  'Entry Points - Windows': SECTION_6_WINDOWS,
  'Garage & Vehicle Security': SECTION_7_GARAGE,
  'Alarm & Intrusion Detection': SECTION_8_ALARM,
  'CCTV & Video Surveillance': SECTION_9_CCTV,
  'Interior Security': SECTION_10_INTERIOR,
  'Safe Room & Emergency Preparedness': SECTION_11_EMERGENCY,
  'Monitoring & Response': SECTION_12_MONITORING,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all questions including nested follow-ups (flattened)
 */
export function getAllQuestionsFlattened(): ResidentialInterviewQuestion[] {
  const allQuestions: ResidentialInterviewQuestion[] = [];
  
  for (const question of RESIDENTIAL_INTERVIEW_QUESTIONNAIRE) {
    allQuestions.push(question);
    if (question.followUpQuestions) {
      allQuestions.push(...question.followUpQuestions);
    }
  }
  
  return allQuestions;
}

/**
 * Get questions by section
 */
export function getQuestionsBySection(section: ResidentialSection): ResidentialInterviewQuestion[] {
  return RESIDENTIAL_INTERVIEW_QUESTIONNAIRE.filter(q => q.section === section);
}

/**
 * Get question count by section
 */
export function getQuestionCountBySection(): Record<ResidentialSection, number> {
  const counts: Record<string, number> = {};
  
  for (const question of RESIDENTIAL_INTERVIEW_QUESTIONNAIRE) {
    counts[question.section] = (counts[question.section] || 0) + 1;
  }
  
  return counts as Record<ResidentialSection, number>;
}

/**
 * Get questions that have "bad answers" (risk elevating responses)
 */
export function getQuestionsWithBadAnswers(): ResidentialInterviewQuestion[] {
  return getAllQuestionsFlattened().filter(q => q.badAnswers && q.badAnswers.length > 0);
}

/**
 * Get questions that inform a specific threat
 */
export function getQuestionsForThreat(threatId: string): ResidentialInterviewQuestion[] {
  return getAllQuestionsFlattened().filter(
    q => q.informsThreat && q.informsThreat.includes(threatId)
  );
}

/**
 * Get questions tagged with CPTED principle
 */
export function getQuestionsForCPTED(principle: CPTEDPrinciple): ResidentialInterviewQuestion[] {
  return getAllQuestionsFlattened().filter(q => q.CPTED === principle);
}

/**
 * Calculate total possible risk weight
 */
export function getTotalPossibleRiskWeight(): number {
  return getAllQuestionsFlattened().reduce((sum, q) => sum + q.riskWeight, 0);
}

/**
 * Get section list in order
 */
export function getSectionOrder(): ResidentialSection[] {
  return [
    'Property Profile & Environment',
    'Perimeter Security & Boundaries',
    'Exterior Lighting',
    'Landscaping & Natural Surveillance',
    'Entry Points - Doors',
    'Entry Points - Windows',
    'Garage & Vehicle Security',
    'Alarm & Intrusion Detection',
    'CCTV & Video Surveillance',
    'Interior Security',
    'Safe Room & Emergency Preparedness',
    'Monitoring & Response',
  ];
}

/**
 * Validate questionnaire structure
 */
export function validateQuestionnaire(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allQuestions = getAllQuestionsFlattened();
  const seenIds = new Set<string>();
  
  for (const question of allQuestions) {
    // Check for duplicate IDs
    if (seenIds.has(question.id)) {
      errors.push(`Duplicate question ID: ${question.id}`);
    }
    seenIds.add(question.id);
    
    // Check that options exist for select questions
    if ((question.questionType === 'single_select' || question.questionType === 'multi_select') && 
        (!question.options || question.options.length === 0)) {
      errors.push(`Question ${question.id} is select type but has no options`);
    }
    
    // Check that badAnswers exist in options
    if (question.badAnswers && question.options) {
      for (const badAnswer of question.badAnswers) {
        const optionValues = question.options.map(o => o.value);
        if (!optionValues.includes(badAnswer)) {
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
 * Get questionnaire statistics
 */
export function getQuestionnaireStats(): {
  totalQuestions: number;
  topLevelQuestions: number;
  followUpQuestions: number;
  questionsBySection: Record<ResidentialSection, number>;
  questionsByType: Record<QuestionType, number>;
  totalRiskWeight: number;
  cpTEDQuestions: number;
  threatCoverage: Record<string, number>;
} {
  const allQuestions = getAllQuestionsFlattened();
  
  let followUpCount = 0;
  for (const q of RESIDENTIAL_INTERVIEW_QUESTIONNAIRE) {
    if (q.followUpQuestions) {
      followUpCount += q.followUpQuestions.length;
    }
  }
  
  const questionsByType: Record<string, number> = {};
  const threatCoverage: Record<string, number> = {};
  let cpTEDCount = 0;
  
  for (const q of allQuestions) {
    questionsByType[q.questionType] = (questionsByType[q.questionType] || 0) + 1;
    
    if (q.CPTED) cpTEDCount++;
    
    if (q.informsThreat) {
      for (const threat of q.informsThreat) {
        threatCoverage[threat] = (threatCoverage[threat] || 0) + 1;
      }
    }
  }
  
  return {
    totalQuestions: allQuestions.length,
    topLevelQuestions: RESIDENTIAL_INTERVIEW_QUESTIONNAIRE.length,
    followUpQuestions: followUpCount,
    questionsBySection: getQuestionCountBySection(),
    questionsByType: questionsByType as Record<QuestionType, number>,
    totalRiskWeight: getTotalPossibleRiskWeight(),
    cpTEDQuestions: cpTEDCount,
    threatCoverage,
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default RESIDENTIAL_INTERVIEW_QUESTIONNAIRE;
