/**
 * Seed Executive Protection Interview Questions
 * 
 * Seeds template_questions table with EP-specific questions including options
 */

import { db } from './db';
import { templateQuestions } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface EPQuestion {
  id: string;
  section: string;
  questionText: string;
  questionType: string;
  options?: { value: string; label: string }[];
  required: boolean;
}

const EP_QUESTIONS: EPQuestion[] = [
  // Section 1: Executive Profile & Threat Perception
  {
    id: 'ep_public_profile_level',
    section: 'Executive Profile & Threat Perception',
    questionText: 'How would you characterize your public profile?',
    questionType: 'single_select',
    options: [
      { value: 'very_high', label: 'Very high - National/international recognition, frequent media coverage' },
      { value: 'high', label: 'High - Regional recognition, occasional media coverage' },
      { value: 'medium', label: 'Medium - Industry recognition, limited public exposure' },
      { value: 'low', label: 'Low - Professional network only, minimal public presence' },
      { value: 'private', label: 'Private - Actively maintain low profile' },
    ],
    required: true,
  },
  {
    id: 'ep_net_worth_range',
    section: 'Executive Profile & Threat Perception',
    questionText: 'What is your estimated net worth range?',
    questionType: 'single_select',
    options: [
      { value: 'over_100m', label: 'Over $100 million' },
      { value: '50m_to_100m', label: '$50 million - $100 million' },
      { value: '10m_to_50m', label: '$10 million - $50 million' },
      { value: '5m_to_10m', label: '$5 million - $10 million' },
      { value: 'under_5m', label: 'Under $5 million' },
      { value: 'prefer_not_disclose', label: 'Prefer not to disclose' },
    ],
    required: true,
  },
  {
    id: 'ep_industry_sector',
    section: 'Executive Profile & Threat Perception',
    questionText: 'What industry sector are you primarily associated with?',
    questionType: 'single_select',
    options: [
      { value: 'entertainment', label: 'Entertainment / Media / Sports' },
      { value: 'political', label: 'Political / Government' },
      { value: 'legal', label: 'Legal (high-profile litigation, criminal defense)' },
      { value: 'finance', label: 'Finance / Investment / Private Equity' },
      { value: 'technology', label: 'Technology / Social Media' },
      { value: 'healthcare', label: 'Healthcare / Pharmaceuticals' },
      { value: 'real_estate', label: 'Real Estate / Development' },
      { value: 'manufacturing', label: 'Manufacturing / Industrial' },
      { value: 'retail', label: 'Retail / Consumer Goods' },
      { value: 'energy', label: 'Energy / Natural Resources' },
      { value: 'nonprofit', label: 'Non-profit / Foundation' },
      { value: 'other', label: 'Other' },
    ],
    required: true,
  },
  {
    id: 'ep_threat_perception',
    section: 'Executive Profile & Threat Perception',
    questionText: 'How concerned are you about personal security threats?',
    questionType: 'single_select',
    options: [
      { value: 'very_concerned', label: 'Very concerned - Active security measures in place' },
      { value: 'moderately_concerned', label: 'Moderately concerned - Some precautions taken' },
      { value: 'somewhat_concerned', label: 'Somewhat concerned - Aware but limited action' },
      { value: 'minimal_concern', label: 'Minimally concerned - Basic awareness only' },
      { value: 'not_concerned', label: 'Not concerned - Have not considered security threats' },
    ],
    required: true,
  },
  {
    id: 'ep_known_threats',
    section: 'Executive Profile & Threat Perception',
    questionText: 'Have you received any specific threats or experienced concerning incidents?',
    questionType: 'single_select',
    options: [
      { value: 'yes_recent', label: 'Yes, within the past year' },
      { value: 'yes_past', label: 'Yes, but more than a year ago' },
      { value: 'no_but_concerned', label: 'No direct threats, but have specific concerns' },
      { value: 'no_incidents', label: 'No threats or incidents' },
    ],
    required: true,
  },
  {
    id: 'ep_current_security_level',
    section: 'Executive Profile & Threat Perception',
    questionText: 'What is your current level of personal security?',
    questionType: 'single_select',
    options: [
      { value: '24x7_detail', label: '24/7 executive protection detail' },
      { value: 'comprehensive', label: 'Comprehensive - Part-time detail, residential security, secure driver' },
      { value: 'moderate', label: 'Moderate - Residential security system, some precautions' },
      { value: 'minimal', label: 'Minimal - Basic home security only' },
      { value: 'none', label: 'No formal security measures' },
    ],
    required: true,
  },
  {
    id: 'ep_family_members',
    section: 'Executive Profile & Threat Perception',
    questionText: 'Do you have family members who could be vulnerable to targeting?',
    questionType: 'multi_select',
    options: [
      { value: 'spouse_partner', label: 'Spouse/partner' },
      { value: 'children_school_age', label: 'Children (school age)' },
      { value: 'children_college', label: 'Children (college age)' },
      { value: 'children_adult', label: 'Adult children' },
      { value: 'elderly_parents', label: 'Elderly parents' },
      { value: 'other_dependents', label: 'Other dependents' },
      { value: 'none', label: 'No family members at risk' },
    ],
    required: true,
  },
  {
    id: 'ep_controversial_involvement',
    section: 'Executive Profile & Threat Perception',
    questionText: 'Are you involved in any controversial issues or litigation that might increase threat exposure?',
    questionType: 'single_select',
    options: [
      { value: 'yes_high_profile', label: 'Yes, high-profile controversial matters' },
      { value: 'yes_moderate', label: 'Yes, some controversial involvement' },
      { value: 'yes_minor', label: 'Minor controversies, limited public awareness' },
      { value: 'no', label: 'No controversial involvement' },
    ],
    required: true,
  },

  // Section 2: Residence Security
  {
    id: 'ep_residence_type',
    section: 'Residence Security',
    questionText: 'What type of primary residence do you have?',
    questionType: 'single_select',
    options: [
      { value: 'gated_community_manned', label: 'Gated community with manned guardhouse' },
      { value: 'gated_community_unmanned', label: 'Gated community (unmanned/electronic access)' },
      { value: 'high_security_building', label: 'High-security apartment/condo building' },
      { value: 'private_estate', label: 'Private estate (acreage, separate from neighbors)' },
      { value: 'single_family_gated', label: 'Single-family home in gated neighborhood' },
      { value: 'single_family_ungated', label: 'Single-family home in standard neighborhood' },
      { value: 'condo_standard', label: 'Standard condominium/apartment' },
      { value: 'multiple_residences', label: 'Multiple primary residences' },
    ],
    required: true,
  },
  {
    id: 'ep_residence_visibility',
    section: 'Residence Security',
    questionText: 'How visible is your residence from public roads or neighboring properties?',
    questionType: 'single_select',
    options: [
      { value: 'highly_visible', label: 'Highly visible - No significant privacy barriers' },
      { value: 'somewhat_visible', label: 'Somewhat visible - Partial screening' },
      { value: 'moderately_private', label: 'Moderately private - Trees/landscaping provide screening' },
      { value: 'very_private', label: 'Very private - Cannot see residence from road' },
      { value: 'completely_secluded', label: 'Completely secluded - Long driveway, no visibility' },
    ],
    required: true,
  },
  {
    id: 'ep_residence_perimeter_security',
    section: 'Residence Security',
    questionText: 'What perimeter security does your residence have?',
    questionType: 'multi_select',
    options: [
      { value: 'none', label: 'No perimeter security' },
      { value: 'fence_basic', label: 'Basic fence (under 6 feet)' },
      { value: 'fence_security', label: 'Security fence (6+ feet, anti-climb)' },
      { value: 'wall', label: 'Perimeter wall' },
      { value: 'gate_automated', label: 'Automated vehicle gate' },
      { value: 'gate_manned', label: 'Manned gatehouse' },
      { value: 'intrusion_detection', label: 'Perimeter intrusion detection sensors' },
      { value: 'lighting', label: 'Perimeter lighting with motion activation' },
    ],
    required: true,
  },
  {
    id: 'ep_residence_alarm_system',
    section: 'Residence Security',
    questionText: 'What type of alarm/security system does your residence have?',
    questionType: 'single_select',
    options: [
      { value: 'none', label: 'No alarm system' },
      { value: 'basic_unmonitored', label: 'Basic alarm (local siren, not monitored)' },
      { value: 'monitored_basic', label: 'Professionally monitored (basic package)' },
      { value: 'monitored_comprehensive', label: 'Comprehensive monitored system with verification' },
      { value: 'monitored_with_armed_response', label: 'Monitored with armed response capability' },
    ],
    required: true,
  },
  {
    id: 'ep_safe_room',
    section: 'Residence Security',
    questionText: 'Do you have a panic room or safe room in your residence?',
    questionType: 'single_select',
    options: [
      { value: 'yes_purpose_built', label: 'Yes, purpose-built panic room with communications' },
      { value: 'yes_reinforced', label: 'Yes, reinforced room designated as safe room' },
      { value: 'designated_only', label: 'Designated safe room location, not reinforced' },
      { value: 'no', label: 'No panic room or safe room' },
    ],
    required: true,
  },
  {
    id: 'ep_residence_cctv',
    section: 'Residence Security',
    questionText: 'What CCTV coverage do you have at your residence?',
    questionType: 'multi_select',
    options: [
      { value: 'none', label: 'No cameras' },
      { value: 'doorbell_camera', label: 'Doorbell camera only' },
      { value: 'entry_points', label: 'Cameras at entry points' },
      { value: 'comprehensive_exterior', label: 'Comprehensive exterior coverage' },
      { value: 'interior_cameras', label: 'Interior cameras (common areas)' },
      { value: 'offsite_monitoring', label: 'Off-site professional monitoring' },
      { value: 'recording_30_days', label: 'Recording with 30+ days retention' },
      { value: 'analytics', label: 'Video analytics (motion detection, facial recognition)' },
    ],
    required: true,
  },
  {
    id: 'ep_police_response_time',
    section: 'Residence Security',
    questionText: 'What is the estimated police response time to your residence?',
    questionType: 'single_select',
    options: [
      { value: 'under_5_min', label: 'Under 5 minutes' },
      { value: '5_to_10_min', label: '5-10 minutes' },
      { value: '10_to_15_min', label: '10-15 minutes' },
      { value: 'over_15_min', label: 'Over 15 minutes' },
      { value: 'unknown', label: 'Unknown' },
    ],
    required: true,
  },

  // Section 3: Daily Routines & Pattern Predictability
  {
    id: 'ep_daily_routine_predictability',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'How predictable is your daily routine?',
    questionType: 'single_select',
    options: [
      { value: 'highly_predictable', label: 'Highly predictable - Same schedule most days' },
      { value: 'somewhat_predictable', label: 'Somewhat predictable - Regular patterns with some variation' },
      { value: 'variable', label: 'Variable - Changes frequently' },
      { value: 'unpredictable', label: 'Unpredictable - No regular pattern' },
      { value: 'randomized', label: 'Deliberately randomized for security' },
    ],
    required: true,
  },
  {
    id: 'ep_commute_pattern',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'What is your typical commute pattern?',
    questionType: 'single_select',
    options: [
      { value: 'same_route_same_time', label: 'Same route, same time daily' },
      { value: 'same_route_varied_time', label: 'Same route, varied times' },
      { value: 'varied_routes_same_time', label: 'Varied routes, same time' },
      { value: 'varied_routes_varied_times', label: 'Varied routes and times' },
      { value: 'driver_service', label: 'Driver service (varies routes)' },
      { value: 'work_from_home', label: 'Primarily work from home' },
    ],
    required: true,
  },
  {
    id: 'ep_parking_location',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'Where do you typically park at work?',
    questionType: 'single_select',
    options: [
      { value: 'secure_executive_parking', label: 'Secure executive parking with controlled access' },
      { value: 'building_parking_garage', label: 'Building parking garage' },
      { value: 'open_parking_lot', label: 'Open parking lot' },
      { value: 'street_parking_public', label: 'Street parking or public lot' },
      { value: 'driver_drops', label: 'Driver drops me off' },
      { value: 'work_from_home', label: 'Work from home primarily' },
    ],
    required: true,
  },
  {
    id: 'ep_frequent_locations',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'Do you have frequent, predictable locations you visit regularly (gym, restaurant, club)?',
    questionType: 'single_select',
    options: [
      { value: 'yes_very_regular', label: 'Yes, several regular locations on predictable schedule' },
      { value: 'yes_but_varied', label: 'Yes, but times and days vary' },
      { value: 'occasionally', label: 'Occasionally, but not predictable' },
      { value: 'no_regular_locations', label: 'No regular external locations' },
    ],
    required: true,
  },
  {
    id: 'ep_social_media_usage',
    section: 'Daily Routines & Pattern Predictability',
    questionText: 'How active are you on social media?',
    questionType: 'single_select',
    options: [
      { value: 'very_active_public', label: 'Very active - Public profiles, frequent posting' },
      { value: 'active_public', label: 'Active - Public profiles, regular posting' },
      { value: 'moderate_friends_only', label: 'Moderate - Private/friends-only, occasional posts' },
      { value: 'minimal_private', label: 'Minimal - Private profiles, rarely post' },
      { value: 'no_social_media', label: 'No social media presence' },
    ],
    required: true,
  },
  {
    id: 'ep_children_schedule',
    section: 'Daily Routines & Pattern Predictability',
    questionText: "How predictable are your children's schedules (if applicable)?",
    questionType: 'single_select',
    options: [
      { value: 'highly_predictable', label: 'Highly predictable - Same school/activities daily' },
      { value: 'somewhat_predictable', label: 'Somewhat predictable - Regular with some variation' },
      { value: 'secure_transport', label: 'Secure transportation provided' },
      { value: 'varied_schedule', label: 'Varied schedule, hard to predict' },
      { value: 'not_applicable', label: 'Not applicable - No school-age children' },
    ],
    required: true,
  },

  // Section 4: Workplace Security
  {
    id: 'ep_workplace_type',
    section: 'Workplace Security',
    questionText: 'What type of workplace do you primarily work in?',
    questionType: 'single_select',
    options: [
      { value: 'corporate_hq_high_security', label: 'Corporate headquarters with high security' },
      { value: 'corporate_office_moderate', label: 'Corporate office with moderate security' },
      { value: 'professional_office_building', label: 'Professional office building' },
      { value: 'open_office', label: 'Open office/shared workspace' },
      { value: 'retail_public_facing', label: 'Retail/public-facing location' },
      { value: 'co_working_space', label: 'Co-working space' },
      { value: 'home_office', label: 'Home office primarily' },
      { value: 'multiple_locations', label: 'Multiple locations/frequent travel' },
    ],
    required: true,
  },
  {
    id: 'ep_workplace_access_control',
    section: 'Workplace Security',
    questionText: 'What level of access control exists at your workplace?',
    questionType: 'single_select',
    options: [
      { value: 'open_public', label: 'Open to public - No access control' },
      { value: 'receptionist_only', label: 'Receptionist check-in only' },
      { value: 'badge_access_lobby', label: 'Badge access at lobby' },
      { value: 'badge_access_floor', label: 'Badge access at floor level' },
      { value: 'multi_layer', label: 'Multi-layer access control (lobby + floor + suite)' },
      { value: 'security_screening', label: 'Security screening (metal detection, bag check)' },
    ],
    required: true,
  },
  {
    id: 'ep_workplace_threat_history',
    section: 'Workplace Security',
    questionText: 'Has your workplace experienced any security incidents or threats?',
    questionType: 'single_select',
    options: [
      { value: 'yes_recent', label: 'Yes, within the past year' },
      { value: 'yes_past', label: 'Yes, but more than a year ago' },
      { value: 'no_but_concerned', label: 'No incidents, but concerns exist' },
      { value: 'no_incidents', label: 'No incidents or concerns' },
    ],
    required: true,
  },
  {
    id: 'ep_workplace_security_staff',
    section: 'Workplace Security',
    questionText: 'Does your workplace have dedicated security personnel?',
    questionType: 'single_select',
    options: [
      { value: 'none', label: 'No security personnel' },
      { value: 'contracted_limited', label: 'Contracted security, limited hours' },
      { value: 'contracted_24x7', label: 'Contracted security, 24/7' },
      { value: 'in_house_professional', label: 'In-house professional security team' },
      { value: 'executive_protection_available', label: 'Executive protection specialists available' },
    ],
    required: true,
  },
  {
    id: 'ep_workplace_emergency_procedures',
    section: 'Workplace Security',
    questionText: 'Are you familiar with workplace emergency and evacuation procedures?',
    questionType: 'single_select',
    options: [
      { value: 'no_procedures', label: 'No formal procedures exist' },
      { value: 'exists_unfamiliar', label: 'Procedures exist but I am not familiar' },
      { value: 'familiar_not_practiced', label: 'Familiar but never practiced' },
      { value: 'familiar_and_practiced', label: 'Familiar and regularly practiced' },
      { value: 'personal_evacuation_plan', label: 'Have personal evacuation/emergency plan' },
    ],
    required: true,
  },

  // Section 5: Travel & Transportation
  {
    id: 'ep_travel_frequency',
    section: 'Travel & Transportation',
    questionText: 'How frequently do you travel for business or personal reasons?',
    questionType: 'single_select',
    options: [
      { value: 'very_frequent', label: 'Very frequently (multiple times per month)' },
      { value: 'frequent', label: 'Frequently (monthly)' },
      { value: 'occasional', label: 'Occasionally (few times per year)' },
      { value: 'rarely', label: 'Rarely travel' },
    ],
    required: true,
  },
  {
    id: 'ep_international_travel',
    section: 'Travel & Transportation',
    questionText: 'Do you travel internationally to high-risk countries?',
    questionType: 'single_select',
    options: [
      { value: 'yes_frequently', label: 'Yes, frequently to high-risk areas' },
      { value: 'yes_occasionally', label: 'Yes, occasionally to high-risk areas' },
      { value: 'yes_low_risk', label: 'Yes, but only to low-risk countries' },
      { value: 'domestic_only', label: 'Domestic travel only' },
      { value: 'minimal_travel', label: 'Minimal travel' },
    ],
    required: true,
  },
  {
    id: 'ep_vehicle_type',
    section: 'Travel & Transportation',
    questionText: 'What type of vehicle do you typically use?',
    questionType: 'single_select',
    options: [
      { value: 'driver_service_armored', label: 'Professional driver with armored vehicle' },
      { value: 'driver_service_standard', label: 'Professional driver service (standard vehicle)' },
      { value: 'personal_low_profile', label: 'Personal vehicle (deliberately low-profile)' },
      { value: 'personal_standard', label: 'Personal vehicle (standard)' },
      { value: 'company_vehicle', label: 'Company vehicle' },
      { value: 'personal_luxury_conspicuous', label: 'Personal luxury vehicle (conspicuous)' },
    ],
    required: true,
  },
  {
    id: 'ep_vehicle_security_features',
    section: 'Travel & Transportation',
    questionText: 'What security features does your primary vehicle have?',
    questionType: 'multi_select',
    options: [
      { value: 'none', label: 'No special security features' },
      { value: 'alarm', label: 'Standard alarm system' },
      { value: 'gps_tracking', label: 'GPS tracking' },
      { value: 'dash_cam', label: 'Dashboard camera' },
      { value: 'panic_button', label: 'Panic button/emergency alert' },
      { value: 'run_flat_tires', label: 'Run-flat tires' },
      { value: 'armoring_partial', label: 'Partial armoring (doors/windows)' },
      { value: 'armoring_full', label: 'Full armoring (B4-B7 rated)' },
    ],
    required: true,
  },
  {
    id: 'ep_travel_arrangements_publicity',
    section: 'Travel & Transportation',
    questionText: 'How are your travel arrangements typically made and communicated?',
    questionType: 'single_select',
    options: [
      { value: 'public_calendar', label: 'Published on public calendar/social media' },
      { value: 'widely_shared', label: 'Shared widely within organization' },
      { value: 'limited_distribution', label: 'Limited distribution (need-to-know)' },
      { value: 'executive_assistant_only', label: 'Executive assistant only' },
      { value: 'highly_confidential', label: 'Highly confidential, minimal advance notice' },
    ],
    required: true,
  },

  // Section 6: Digital Footprint & Privacy
  {
    id: 'ep_public_records_exposure',
    section: 'Digital Footprint & Privacy',
    questionText: 'To your knowledge, what personal information is publicly available?',
    questionType: 'multi_select',
    options: [
      { value: 'home_address', label: 'Home address (property records, voter registration)' },
      { value: 'family_information', label: 'Family member information' },
      { value: 'net_worth_estimates', label: 'Net worth estimates' },
      { value: 'vehicle_registration', label: 'Vehicle registration information' },
      { value: 'business_filings', label: 'Business filings/corporate records' },
      { value: 'professional_info', label: 'Professional/educational background' },
      { value: 'minimal', label: 'Minimal publicly available information' },
      { value: 'unknown', label: 'Unknown' },
    ],
    required: true,
  },
  {
    id: 'ep_media_coverage',
    section: 'Digital Footprint & Privacy',
    questionText: 'What level of media coverage do you receive?',
    questionType: 'single_select',
    options: [
      { value: 'extensive', label: 'Extensive - Regular national/international coverage' },
      { value: 'frequent', label: 'Frequent - Regular industry/local coverage' },
      { value: 'occasional', label: 'Occasional - Periodic coverage of specific events' },
      { value: 'minimal', label: 'Minimal media coverage' },
      { value: 'none', label: 'No media coverage' },
    ],
    required: true,
  },
  {
    id: 'ep_online_presence_management',
    section: 'Digital Footprint & Privacy',
    questionText: 'Do you actively manage your online presence and digital footprint?',
    questionType: 'single_select',
    options: [
      { value: 'professional_services', label: 'Professional privacy/reputation services' },
      { value: 'active_management', label: 'Active personal management (privacy settings, data removal)' },
      { value: 'basic_privacy_settings', label: 'Basic privacy settings only' },
      { value: 'no_management', label: 'No active management' },
    ],
    required: true,
  },
  {
    id: 'ep_family_digital_exposure',
    section: 'Digital Footprint & Privacy',
    questionText: "What is your family members' digital footprint exposure?",
    questionType: 'single_select',
    options: [
      { value: 'high_exposure', label: 'High - Active public social media, tagged photos' },
      { value: 'moderate_exposure', label: 'Moderate - Some social media presence' },
      { value: 'low_exposure', label: 'Low - Private settings, limited posting' },
      { value: 'minimal_exposure', label: 'Minimal - Very limited or no digital presence' },
      { value: 'managed', label: 'Professionally managed' },
    ],
    required: true,
  },
  {
    id: 'ep_google_alerts',
    section: 'Digital Footprint & Privacy',
    questionText: 'Do you have monitoring in place for online mentions of your name/family?',
    questionType: 'single_select',
    options: [
      { value: 'professional_monitoring', label: 'Professional OSINT monitoring service' },
      { value: 'google_alerts_comprehensive', label: 'Google Alerts for name, family, company' },
      { value: 'google_alerts_basic', label: 'Basic Google Alerts' },
      { value: 'no_monitoring', label: 'No monitoring' },
    ],
    required: true,
  },

  // Section 7: Family Security
  {
    id: 'ep_family_security_awareness',
    section: 'Family Security',
    questionText: 'Have your family members received security awareness training?',
    questionType: 'single_select',
    options: [
      { value: 'professional_training', label: 'Professional security awareness training' },
      { value: 'basic_training', label: 'Basic training on security protocols' },
      { value: 'informal_discussions', label: 'Informal discussions only' },
      { value: 'no_training', label: 'No training or discussions' },
    ],
    required: true,
  },
  {
    id: 'ep_school_security_coordination',
    section: 'Family Security',
    questionText: "Do you coordinate with your children's school regarding security (if applicable)?",
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Comprehensive - Security team coordinates with school' },
      { value: 'moderate', label: 'Moderate - Regular communication, pickup protocols' },
      { value: 'basic', label: 'Basic - Emergency contacts only' },
      { value: 'none', label: 'No special coordination' },
      { value: 'not_applicable', label: 'Not applicable' },
    ],
    required: true,
  },
  {
    id: 'ep_nanny_staff_vetting',
    section: 'Family Security',
    questionText: 'How are household staff (nanny, housekeeper, etc.) vetted?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive_background', label: 'Comprehensive background investigation' },
      { value: 'professional_agency', label: 'Professional agency with background checks' },
      { value: 'references_only', label: 'References checked only' },
      { value: 'none', label: 'No formal vetting' },
      { value: 'not_applicable', label: 'No household staff' },
    ],
    required: true,
  },

  // Section 8: Emergency Preparedness
  {
    id: 'ep_emergency_contacts',
    section: 'Emergency Preparedness',
    questionText: 'Do you have established emergency contact protocols?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Comprehensive - Security team, family, medical, legal on call' },
      { value: 'moderate', label: 'Moderate - Key contacts identified and accessible' },
      { value: 'basic_contacts', label: 'Basic - Emergency contacts in phone' },
      { value: 'no_protocols', label: 'No formal protocols' },
    ],
    required: true,
  },
  {
    id: 'ep_duress_code',
    section: 'Emergency Preparedness',
    questionText: 'Do you have duress words/codes established with family and security?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive_system', label: 'Yes, comprehensive system with security team and family' },
      { value: 'family_code', label: 'Yes, code word with family only' },
      { value: 'security_only', label: 'Yes, with security team only' },
      { value: 'no_duress_codes', label: 'No duress codes established' },
    ],
    required: true,
  },
  {
    id: 'ep_evacuation_routes',
    section: 'Emergency Preparedness',
    questionText: 'Have you identified and practiced evacuation routes from your primary locations?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive_practiced', label: 'Yes, comprehensive plans practiced regularly' },
      { value: 'identified_practiced', label: 'Yes, identified and practiced' },
      { value: 'identified_not_practiced', label: 'Identified but not practiced' },
      { value: 'no_planning', label: 'No evacuation planning' },
    ],
    required: true,
  },
  {
    id: 'ep_medical_emergency_plan',
    section: 'Emergency Preparedness',
    questionText: 'Do you have a medical emergency plan?',
    questionType: 'single_select',
    options: [
      { value: 'comprehensive', label: 'Comprehensive - On-call physician, medical kit, trained staff' },
      { value: 'moderate', label: 'Moderate - Identified nearby hospitals, basic first aid' },
      { value: 'basic', label: 'Basic - Know location of nearest hospital' },
      { value: 'no_plan', label: 'No medical emergency plan' },
    ],
    required: true,
  },
];

async function seedEPQuestions() {
  console.log('Seeding Executive Protection interview questions...');
  
  // Clear existing EP questions
  await db.delete(templateQuestions).where(eq(templateQuestions.templateId, 'executive-protection'));
  console.log('Cleared existing EP questions');
  
  // Insert new questions
  let orderIndex = 1;
  for (const q of EP_QUESTIONS) {
    await db.insert(templateQuestions).values({
      templateId: 'executive-protection',
      questionId: q.id,
      question: q.questionText,
      category: q.section,
      type: q.questionType,
      options: q.options ? q.options.map(o => o.label) : null,
      orderIndex: orderIndex++,
    });
  }
  
  console.log(`Seeded ${EP_QUESTIONS.length} EP questions`);
  
  // Verify
  const count = await db.select().from(templateQuestions).where(eq(templateQuestions.templateId, 'executive-protection'));
  const withOptions = count.filter(q => q.options !== null);
  console.log(`Total: ${count.length}, With options: ${withOptions.length}`);
}

seedEPQuestions()
  .then(() => {
    console.log('EP questions seeded successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding EP questions:', err);
    process.exit(1);
  });
