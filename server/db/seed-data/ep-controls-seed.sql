-- ============================================================================
-- Executive Protection Security Controls Seed File
-- 
-- RiskFixer Executive Protection Assessment Module
-- Categories: Personal Protection, Residential Security, Digital/OSINT Countermeasures,
--             Travel Security, Family Protection, Communications Security
--
-- @version 1.0
-- @see RiskFixer-Executive-Protection-Framework.md
-- ============================================================================

-- Ensure we're in the correct database context
-- DELETE FROM security_controls WHERE facility_type = 'executive_protection';

-- ============================================================================
-- CATEGORY 1: PERSONAL PROTECTION (10 controls)
-- ============================================================================

INSERT INTO security_controls (
  name, 
  description, 
  category, 
  facility_type,
  implementation_cost,
  annual_cost,
  effectiveness_rating,
  implementation_time,
  asis_reference
) VALUES

-- EP-PP-001: Executive Protection Detail - 24/7
(
  'Executive Protection Detail - 24/7',
  'Full-time close protection officers providing around-the-clock personal security. Team typically includes 4-6 agents working in shifts to ensure continuous coverage at residence, workplace, and during travel. Agents are trained in threat recognition, defensive driving, emergency medical response, and evacuation procedures.',
  'Personal Protection',
  'executive_protection',
  150000,
  750000,
  95,
  '30-60 days',
  'ASIS GDL EP-01'
),

-- EP-PP-002: Executive Protection Detail - Part-time
(
  'Executive Protection Detail - Part-time',
  'Protection officers assigned during high-risk periods such as public events, travel, or when threat intelligence indicates elevated risk. Typically 8-12 hours per day coverage with on-call availability during off hours.',
  'Personal Protection',
  'executive_protection',
  50000,
  300000,
  75,
  '14-21 days',
  'ASIS GDL EP-02'
),

-- EP-PP-003: Secure Executive Driver Service
(
  'Secure Executive Driver Service',
  'Professional driver trained in defensive/evasive driving techniques, route surveillance, and emergency protocols. Driver conducts pre-trip vehicle inspections, maintains situational awareness, and coordinates with security team.',
  'Personal Protection',
  'executive_protection',
  25000,
  150000,
  70,
  '14 days',
  'ASIS GDL EP-03'
),

-- EP-PP-004: Advance Team Operations
(
  'Advance Team Operations',
  'Security personnel deployed ahead of principal to assess venues, identify threats, coordinate with local security, and establish evacuation routes. Critical for travel and public appearances.',
  'Personal Protection',
  'executive_protection',
  10000,
  100000,
  85,
  '7 days',
  'ASIS GDL EP-04'
),

-- EP-PP-005: Protective Intelligence Program
(
  'Protective Intelligence Program',
  'Dedicated intelligence gathering and analysis capability to identify potential threats before they materialize. Includes monitoring of persons of interest, threat assessment, and coordination with law enforcement.',
  'Personal Protection',
  'executive_protection',
  75000,
  200000,
  80,
  '60-90 days',
  'ASIS GDL TM-01'
),

-- EP-PP-006: Personal Defensive Training
(
  'Personal Defensive Training for Principal',
  'Training program for the executive covering situational awareness, basic self-defense, emergency procedures, and coordination with protection team. Includes scenario-based exercises and regular refresher training.',
  'Personal Protection',
  'executive_protection',
  15000,
  25000,
  60,
  '30 days',
  'ASIS GDL EP-05'
),

-- EP-PP-007: Medical Emergency Response Capability
(
  'Medical Emergency Response Capability',
  'Protection team members certified in advanced first aid, CPR, and trauma care. Includes portable medical kit, AED, and established protocols for medical evacuation. Some programs include on-call physician.',
  'Personal Protection',
  'executive_protection',
  20000,
  50000,
  65,
  '21 days',
  'ASIS GDL EP-06'
),

-- EP-PP-008: Personal Tracking/Duress Device
(
  'Personal Tracking/Duress Device',
  'Discrete wearable device enabling GPS tracking and silent duress alerts. Connects to 24/7 monitoring center capable of dispatching emergency response. May include two-way communication capability.',
  'Personal Protection',
  'executive_protection',
  5000,
  15000,
  55,
  '7 days',
  'ASIS GDL EP-07'
),

-- EP-PP-009: Counter-Surveillance Operations
(
  'Counter-Surveillance Operations',
  'Trained personnel conducting surveillance detection routes (SDRs) and identifying hostile reconnaissance. Critical for detecting pre-operational planning by threat actors.',
  'Personal Protection',
  'executive_protection',
  30000,
  120000,
  75,
  '30 days',
  'ASIS GDL EP-08'
),

-- EP-PP-010: Threat Assessment Consultation
(
  'Professional Threat Assessment Consultation',
  'Engagement with qualified threat assessment professionals to evaluate concerning communications, behaviors, or persons of interest using structured professional judgment protocols.',
  'Personal Protection',
  'executive_protection',
  25000,
  40000,
  70,
  '14 days',
  'ASIS GDL TM-02'
),

-- ============================================================================
-- CATEGORY 2: RESIDENTIAL SECURITY (10 controls)
-- ============================================================================

-- EP-RS-001: Residential Security Team - 24/7
(
  'Residential Security Team - 24/7',
  'Dedicated security officers stationed at residence providing access control, perimeter monitoring, CCTV surveillance, and alarm response. Team includes command post operator and roving patrol.',
  'Residential Security',
  'executive_protection',
  100000,
  500000,
  90,
  '30 days',
  'ASIS GDL RS-01'
),

-- EP-RS-002: Panic Room / Safe Room
(
  'Panic Room / Safe Room Installation',
  'Fortified room within residence with reinforced walls, ballistic-rated door, independent communication systems, emergency supplies, and air filtration. Designed for shelter-in-place during home invasion.',
  'Residential Security',
  'executive_protection',
  75000,
  5000,
  85,
  '60-90 days',
  'ASIS GDL RS-02'
),

-- EP-RS-003: Perimeter Intrusion Detection System
(
  'Perimeter Intrusion Detection System',
  'Integrated sensor system including ground-based sensors, motion detectors, beam barriers, and/or video analytics to detect unauthorized entry attempts at property boundary.',
  'Residential Security',
  'executive_protection',
  50000,
  15000,
  80,
  '30-45 days',
  'ASIS GDL RS-03'
),

-- EP-RS-004: Residential CCTV System - Comprehensive
(
  'Comprehensive Residential CCTV System',
  'Full coverage video surveillance including perimeter cameras, driveway monitoring, entry point coverage, and interior common areas. Includes analytics, 30+ day retention, and remote viewing capability.',
  'Residential Security',
  'executive_protection',
  40000,
  10000,
  75,
  '21-30 days',
  'ASIS GDL RS-04'
),

-- EP-RS-005: Controlled Access Gate System
(
  'Controlled Access Gate System',
  'Vehicle gate with intercom, CCTV, and access control. May include crash-rated barrier certification (K-rated), spike strips, or sally port configuration for high-threat environments.',
  'Residential Security',
  'executive_protection',
  45000,
  8000,
  80,
  '30-45 days',
  'ASIS GDL RS-05'
),

-- EP-RS-006: Residential Alarm System - Monitored
(
  'Professional Monitored Alarm System',
  'Comprehensive alarm system with door/window contacts, glass break sensors, motion detectors, and panic buttons. Connected to UL-listed central monitoring station with verified response protocols.',
  'Residential Security',
  'executive_protection',
  15000,
  5000,
  70,
  '7-14 days',
  'ASIS GDL RS-06'
),

-- EP-RS-007: Ballistic Window Film / Glazing
(
  'Ballistic Window Film / Security Glazing',
  'Window treatments providing resistance to forced entry and ballistic threats. Options range from security film (UL 972) to laminated glazing to full ballistic-rated glass (NIJ Level IIIA+).',
  'Residential Security',
  'executive_protection',
  35000,
  2000,
  65,
  '14-21 days',
  'ASIS GDL RS-07'
),

-- EP-RS-008: Reinforced Entry Doors
(
  'Reinforced Entry Doors and Frames',
  'High-security doors with reinforced frames, heavy-duty deadbolts, and anti-kick plates. May include ballistic rating for high-threat situations.',
  'Residential Security',
  'executive_protection',
  20000,
  1000,
  60,
  '7-14 days',
  'ASIS GDL RS-08'
),

-- EP-RS-009: Vehicle Barriers / Bollards
(
  'Vehicle Barriers / Bollards',
  'Physical barriers preventing unauthorized vehicle approach to residence. Options include decorative bollards, planters, and crash-rated barriers depending on threat assessment.',
  'Residential Security',
  'executive_protection',
  30000,
  2000,
  70,
  '21-30 days',
  'ASIS GDL RS-09'
),

-- EP-RS-010: Landscape Security Design (CPTED)
(
  'Landscape Security Design (CPTED)',
  'Landscaping modifications following Crime Prevention Through Environmental Design principles. Includes sight line management, natural surveillance enhancement, and elimination of concealment points.',
  'Residential Security',
  'executive_protection',
  25000,
  5000,
  55,
  '30-60 days',
  'ASIS GDL RS-10'
),

-- ============================================================================
-- CATEGORY 3: DIGITAL / OSINT COUNTERMEASURES (8 controls)
-- ============================================================================

-- EP-DO-001: Digital Privacy Service
(
  'Digital Privacy / Data Broker Removal Service',
  'Professional service to remove personal information from data broker sites, people search engines, and public records aggregators. Includes ongoing monitoring and re-removal as data resurfaces.',
  'Digital/OSINT Countermeasures',
  'executive_protection',
  5000,
  15000,
  70,
  '30-60 days',
  'ASIS GDL DO-01'
),

-- EP-DO-002: Social Media Privacy Lockdown
(
  'Social Media Privacy Lockdown',
  'Comprehensive review and hardening of social media accounts for principal and family members. Includes privacy settings optimization, content review, and OPSEC training on posting practices.',
  'Digital/OSINT Countermeasures',
  'executive_protection',
  10000,
  5000,
  65,
  '14-21 days',
  'ASIS GDL DO-02'
),

-- EP-DO-003: OSINT Monitoring Service
(
  'OSINT Monitoring / Brand Monitoring',
  'Continuous monitoring of online sources for mentions of principal, family, and organization. Includes dark web monitoring, social media tracking, and news alerts. Enables early threat detection.',
  'Digital/OSINT Countermeasures',
  'executive_protection',
  15000,
  30000,
  75,
  '7-14 days',
  'ASIS GDL DO-03'
),

-- EP-DO-004: Property Records Privacy
(
  'Property Records Privacy / LLC Structure',
  'Legal structure to remove principal''s name from public property records. Includes establishment of holding LLCs, trusts, or other vehicles to obscure ownership of residence and vehicles.',
  'Digital/OSINT Countermeasures',
  'executive_protection',
  25000,
  10000,
  80,
  '30-60 days',
  'ASIS GDL DO-04'
),

-- EP-DO-005: Secure Communications Platform
(
  'Secure Communications Platform',
  'End-to-end encrypted communication tools for voice, messaging, and file sharing. May include dedicated secure devices, encrypted email, and secure video conferencing.',
  'Digital/OSINT Countermeasures',
  'executive_protection',
  10000,
  8000,
  70,
  '7-14 days',
  'ASIS GDL DO-05'
),

-- EP-DO-006: Digital Footprint Assessment
(
  'Digital Footprint Assessment',
  'Comprehensive one-time assessment of principal''s digital exposure including OSINT audit, data broker inventory, social media analysis, and public records review. Provides remediation roadmap.',
  'Digital/OSINT Countermeasures',
  'executive_protection',
  15000,
  0,
  60,
  '14-21 days',
  'ASIS GDL DO-06'
),

-- EP-DO-007: Mail / Package Screening
(
  'Mail and Package Screening Program',
  'Protocols for screening incoming mail and packages before delivery to principal. May include off-site screening facility, X-ray equipment, or third-party screening service.',
  'Digital/OSINT Countermeasures',
  'executive_protection',
  20000,
  25000,
  65,
  '14-30 days',
  'ASIS GDL DO-07'
),

-- EP-DO-008: Cyber Security Hardening
(
  'Personal Cyber Security Hardening',
  'Technical security measures for principal''s personal devices and accounts including password management, multi-factor authentication, device encryption, and secure backup procedures.',
  'Digital/OSINT Countermeasures',
  'executive_protection',
  8000,
  5000,
  60,
  '7-14 days',
  'ASIS GDL DO-08'
),

-- ============================================================================
-- CATEGORY 4: TRAVEL SECURITY (8 controls)
-- ============================================================================

-- EP-TS-001: Armored Vehicle - B6 Rated
(
  'Armored Vehicle - B6/B7 Rated',
  'Ballistic-protected vehicle rated to stop rifle rounds. Includes run-flat tires, reinforced suspension, attack-resistant glass, and emergency escape features. Requires trained driver.',
  'Travel Security',
  'executive_protection',
  150000,
  25000,
  90,
  '90-180 days',
  'ASIS GDL TS-01'
),

-- EP-TS-002: Armored Vehicle - B4 Rated
(
  'Armored Vehicle - B4 Rated',
  'Ballistic-protected vehicle rated to stop handgun rounds. Lower-profile option suitable for moderate threat environments. Includes basic protective features.',
  'Travel Security',
  'executive_protection',
  80000,
  15000,
  75,
  '60-90 days',
  'ASIS GDL TS-02'
),

-- EP-TS-003: GPS Tracking - Executive Vehicle
(
  'GPS Vehicle Tracking System',
  'Real-time GPS tracking for executive vehicles enabling location monitoring, geofence alerts, and route analysis. Connected to security operations center.',
  'Travel Security',
  'executive_protection',
  2000,
  3000,
  55,
  '3-7 days',
  'ASIS GDL TS-03'
),

-- EP-TS-004: Route Analysis Protocol
(
  'Route Analysis / Randomization Protocol',
  'Formal protocols for route selection, variation, and analysis. Includes identification of choke points, safe havens, and emergency services. Routes rotated regularly to prevent pattern establishment.',
  'Travel Security',
  'executive_protection',
  5000,
  10000,
  70,
  '14 days',
  'ASIS GDL TS-04'
),

-- EP-TS-005: Vehicle Sweep Procedures
(
  'Vehicle Sweep / Anti-Tampering Procedures',
  'Protocols for inspecting vehicles before use including visual inspection, undercarriage checks, and electronic debugging. May include technical surveillance countermeasures (TSCM) capability.',
  'Travel Security',
  'executive_protection',
  15000,
  20000,
  65,
  '14 days',
  'ASIS GDL TS-05'
),

-- EP-TS-006: International Travel Security Program
(
  'International Travel Security Program',
  'Comprehensive program for travel to high-risk destinations including pre-travel intelligence, in-country security coordination, secure ground transportation, and extraction planning.',
  'Travel Security',
  'executive_protection',
  50000,
  100000,
  85,
  '30 days',
  'ASIS GDL TS-06'
),

-- EP-TS-007: Airport / Private Terminal Services
(
  'Private Terminal / FBO Services',
  'Use of fixed-base operator (FBO) facilities for private aviation or expedited processing through commercial terminals. Reduces exposure in crowded public areas.',
  'Travel Security',
  'executive_protection',
  0,
  50000,
  60,
  '1-7 days',
  'ASIS GDL TS-07'
),

-- EP-TS-008: Secure Accommodation Protocols
(
  'Secure Accommodation Protocols',
  'Procedures for selecting and securing hotel accommodations including room selection criteria, advance inspection, secondary egress verification, and security team positioning.',
  'Travel Security',
  'executive_protection',
  5000,
  15000,
  65,
  '7 days',
  'ASIS GDL TS-08'
),

-- ============================================================================
-- CATEGORY 5: FAMILY PROTECTION (6 controls)
-- ============================================================================

-- EP-FP-001: Family Security Training
(
  'Family Security Awareness Training',
  'Training program for spouse, children, and household members covering situational awareness, social engineering recognition, emergency procedures, and coordination with security team.',
  'Family Protection',
  'executive_protection',
  10000,
  15000,
  70,
  '14-21 days',
  'ASIS GDL FP-01'
),

-- EP-FP-002: School Security Coordination
(
  'School Security Coordination Program',
  'Formal coordination with children''s schools including authorized pickup lists, emergency notification procedures, secure dismissal protocols, and threat communication channels.',
  'Family Protection',
  'executive_protection',
  5000,
  5000,
  65,
  '14 days',
  'ASIS GDL FP-02'
),

-- EP-FP-003: Family Duress Code System
(
  'Family Duress Code / Signal System',
  'Established code words or signals enabling family members to covertly communicate distress. Includes verification protocols and response procedures.',
  'Family Protection',
  'executive_protection',
  2000,
  1000,
  60,
  '7 days',
  'ASIS GDL FP-03'
),

-- EP-FP-004: Nanny / Caregiver Background Investigation
(
  'Household Staff Background Investigations',
  'Comprehensive background investigations for nannies, caregivers, housekeepers, and other household staff including criminal history, employment verification, and reference interviews.',
  'Family Protection',
  'executive_protection',
  5000,
  10000,
  75,
  '14-21 days',
  'ASIS GDL FP-04'
),

-- EP-FP-005: Child GPS Tracking
(
  'Child Location Tracking Device/App',
  'Discrete GPS tracking capability for children via smartwatch, phone app, or dedicated device. Includes geofencing alerts and emergency communication features.',
  'Family Protection',
  'executive_protection',
  500,
  1000,
  55,
  '1-3 days',
  'ASIS GDL FP-05'
),

-- EP-FP-006: Secure Transportation for Family
(
  'Secure School / Activity Transportation',
  'Professional driver service for children''s school transportation and activities. Driver trained in security protocols and coordinates with protection team.',
  'Family Protection',
  'executive_protection',
  20000,
  80000,
  70,
  '14 days',
  'ASIS GDL FP-06'
),

-- ============================================================================
-- CATEGORY 6: EMERGENCY PREPAREDNESS (6 controls)
-- ============================================================================

-- EP-EP-001: Emergency Response Plan
(
  'Comprehensive Emergency Response Plan',
  'Documented plans covering various emergency scenarios including home invasion, medical emergency, fire, natural disaster, and targeted attack. Includes roles, responsibilities, and communication protocols.',
  'Emergency Preparedness',
  'executive_protection',
  15000,
  5000,
  75,
  '21-30 days',
  'ASIS GDL EP-01'
),

-- EP-EP-002: Evacuation Route Planning
(
  'Evacuation Route Planning and Practice',
  'Identified and practiced evacuation routes from residence, workplace, and frequent locations. Includes primary and alternate routes, safe haven locations, and rally points.',
  'Emergency Preparedness',
  'executive_protection',
  8000,
  3000,
  70,
  '14 days',
  'ASIS GDL EP-02'
),

-- EP-EP-003: Emergency Go-Bag
(
  'Emergency Go-Bag / Supplies',
  'Pre-packed emergency kit containing essential documents, cash, medications, communication devices, and supplies for rapid evacuation. Maintained at residence and vehicles.',
  'Emergency Preparedness',
  'executive_protection',
  2000,
  500,
  50,
  '3-7 days',
  'ASIS GDL EP-03'
),

-- EP-EP-004: Emergency Communication Protocol
(
  'Emergency Communication Protocol',
  'Established protocols for emergency notification including primary and backup communication methods, contact priority list, and verification procedures.',
  'Emergency Preparedness',
  'executive_protection',
  3000,
  2000,
  65,
  '7 days',
  'ASIS GDL EP-04'
),

-- EP-EP-005: Medical Evacuation Insurance
(
  'Medical Evacuation Insurance / Services',
  'Insurance policy or membership providing emergency medical evacuation services from anywhere in the world. Critical for international travel.',
  'Emergency Preparedness',
  'executive_protection',
  0,
  5000,
  60,
  '1-3 days',
  'ASIS GDL EP-05'
),

-- EP-EP-006: Law Enforcement Liaison
(
  'Law Enforcement Liaison Program',
  'Established relationship with local law enforcement including designated points of contact, information sharing protocols, and coordinated response planning.',
  'Emergency Preparedness',
  'executive_protection',
  5000,
  5000,
  70,
  '30 days',
  'ASIS GDL EP-06'
);

-- ============================================================================
-- THREAT-TO-CONTROL MAPPING FOR EXECUTIVE PROTECTION
-- ============================================================================

-- Create threat-control association table entries if not exists
-- These map which controls address which EP threats

/*
THREAT_CONTROL_MAPPING Reference:

kidnapping_abduction: [
  'executive_protection_detail_24x7',
  'executive_protection_detail_part_time', 
  'secure_executive_driver_service',
  'advance_team_operations',
  'armored_vehicle_b6',
  'armored_vehicle_b4',
  'route_analysis_protocol',
  'counter_surveillance_operations',
  'personal_tracking_duress_device',
  'family_duress_code_system',
  'evacuation_route_planning'
]

stalking_surveillance: [
  'counter_surveillance_operations',
  'protective_intelligence_program',
  'residential_security_team_24x7',
  'comprehensive_residential_cctv',
  'osint_monitoring_service',
  'social_media_privacy_lockdown',
  'digital_privacy_service',
  'property_records_privacy'
]

doxxing_privacy_breach: [
  'digital_privacy_service',
  'social_media_privacy_lockdown',
  'osint_monitoring_service',
  'property_records_privacy',
  'digital_footprint_assessment',
  'secure_communications_platform',
  'personal_cyber_security_hardening'
]

home_invasion: [
  'residential_security_team_24x7',
  'panic_room_safe_room',
  'perimeter_intrusion_detection',
  'controlled_access_gate',
  'residential_alarm_system_monitored',
  'reinforced_entry_doors',
  'ballistic_window_film',
  'vehicle_barriers_bollards',
  'emergency_response_plan',
  'family_duress_code_system'
]

extortion_blackmail: [
  'protective_intelligence_program',
  'threat_assessment_consultation',
  'secure_communications_platform',
  'digital_privacy_service',
  'law_enforcement_liaison',
  'osint_monitoring_service'
]

ambush_attack: [
  'executive_protection_detail_24x7',
  'secure_executive_driver_service',
  'armored_vehicle_b6',
  'armored_vehicle_b4',
  'route_analysis_protocol',
  'counter_surveillance_operations',
  'advance_team_operations',
  'vehicle_sweep_procedures',
  'evacuation_route_planning'
]

workplace_violence: [
  'executive_protection_detail_24x7',
  'executive_protection_detail_part_time',
  'protective_intelligence_program',
  'threat_assessment_consultation',
  'personal_defensive_training',
  'emergency_response_plan',
  'law_enforcement_liaison'
]

travel_security_incidents: [
  'international_travel_security_program',
  'advance_team_operations',
  'secure_accommodation_protocols',
  'armored_vehicle_b6',
  'gps_vehicle_tracking',
  'medical_evacuation_insurance',
  'emergency_communication_protocol'
]

cyber_targeting_social_engineering: [
  'personal_cyber_security_hardening',
  'secure_communications_platform',
  'digital_footprint_assessment',
  'family_security_training',
  'mail_package_screening'
]

family_member_targeting: [
  'family_security_training',
  'school_security_coordination',
  'family_duress_code_system',
  'household_staff_background_investigations',
  'child_gps_tracking',
  'secure_school_transportation',
  'residential_security_team_24x7',
  'panic_room_safe_room'
]

reputational_attack: [
  'osint_monitoring_service',
  'protective_intelligence_program',
  'digital_privacy_service',
  'social_media_privacy_lockdown',
  'law_enforcement_liaison'
]

protest_demonstration_targeting: [
  'executive_protection_detail_24x7',
  'advance_team_operations',
  'protective_intelligence_program',
  'route_analysis_protocol',
  'evacuation_route_planning',
  'emergency_response_plan'
]
*/

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- SELECT 
--   category,
--   COUNT(*) as control_count,
--   AVG(effectiveness_rating) as avg_effectiveness
-- FROM security_controls 
-- WHERE facility_type = 'executive_protection'
-- GROUP BY category
-- ORDER BY category;

-- Expected output:
-- Digital/OSINT Countermeasures: 8 controls
-- Emergency Preparedness: 6 controls
-- Family Protection: 6 controls
-- Personal Protection: 10 controls
-- Residential Security: 10 controls
-- Travel Security: 8 controls
-- TOTAL: 48 controls

-- ============================================================================
-- END OF EXECUTIVE PROTECTION CONTROLS SEED FILE
-- ============================================================================
