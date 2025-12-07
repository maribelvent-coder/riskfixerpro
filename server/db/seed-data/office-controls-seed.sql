-- ============================================================================
-- Office Building Security Controls Seed File
-- 
-- RiskFixer Office Building Assessment Module
-- Categories: Access Control, Surveillance, Intrusion Detection, Emergency Preparedness,
--             Security Personnel, Visitor Management, Information Security, Physical Barriers
--
-- THREAT COVERAGE: 12 office-specific threats
--   - unauthorized_access, workplace_violence, theft_burglary
--   - executive_targeting, data_breach_physical, terrorism_bomb_threat
--   - civil_disturbance, insider_threat, after_hours_intrusion
--   - vehicle_ramming, active_shooter, corporate_espionage
--
-- @version 1.0
-- @see RiskFixer-Office-Building-Framework-UPGRADED.md
-- @see office-interview-mapper.ts THREAT_CONTROL_MAPPING
-- ============================================================================

-- Clean slate for office controls (optional - uncomment if re-seeding)
-- DELETE FROM security_controls WHERE facility_type = 'office_building';

-- ============================================================================
-- CATEGORY 1: ACCESS CONTROL (15 controls)
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

-- OB-AC-001: Badge Access Control System
(
  'Badge Access Control System',
  'Electronic access control using proximity cards or smart cards at building entry points. Includes card readers, electronic locks, and centralized management software with audit logging. Foundation of building access security.',
  'Access Control',
  'office_building',
  50000,
  12000,
  75,
  '30-45 days',
  'ASIS GDL FPSM-AC-01'
),

-- OB-AC-002: Mantrap / Vestibule Entry
(
  'Mantrap / Security Vestibule',
  'Dual-door interlocked entry system preventing tailgating by requiring one door to close before second opens. Includes anti-passback and optional weight sensors. Critical for high-security buildings.',
  'Access Control',
  'office_building',
  75000,
  8000,
  90,
  '45-60 days',
  'ASIS GDL FPSM-AC-02'
),

-- OB-AC-003: Turnstiles - Optical
(
  'Optical Turnstiles',
  'Speed gates with optical sensors detecting tailgating and unauthorized passage. Provides throughput control while maintaining professional lobby aesthetics. Integrates with badge system.',
  'Access Control',
  'office_building',
  45000,
  6000,
  80,
  '21-30 days',
  'ASIS GDL FPSM-AC-03'
),

-- OB-AC-004: Turnstiles - Full Height
(
  'Full Height Turnstiles',
  'Floor-to-ceiling turnstiles preventing climbing or crawling under. Maximum anti-tailgating protection. Typically used at service entrances or high-security perimeters.',
  'Access Control',
  'office_building',
  30000,
  4000,
  85,
  '21-30 days',
  'ASIS GDL FPSM-AC-04'
),

-- OB-AC-005: Biometric Access Control
(
  'Biometric Access Control',
  'Fingerprint, palm vein, or facial recognition authentication for high-security areas. May be combined with badge for multi-factor authentication. Prevents credential sharing.',
  'Access Control',
  'office_building',
  60000,
  15000,
  88,
  '30-45 days',
  'ASIS GDL FPSM-AC-05'
),

-- OB-AC-006: Zone-Based Access Control
(
  'Zone-Based Access Control',
  'Tiered access permissions restricting employees to authorized areas only. Typically includes general areas (all employees), restricted areas (department-specific), and secure areas (need-to-know).',
  'Access Control',
  'office_building',
  25000,
  8000,
  70,
  '14-21 days',
  'ASIS GDL FPSM-AC-06'
),

-- OB-AC-007: Elevator Floor Control
(
  'Elevator Floor Control System',
  'Badge-controlled elevator access restricting floors by authorization level. Prevents unauthorized access to executive floors, data centers, or restricted departments.',
  'Access Control',
  'office_building',
  40000,
  6000,
  75,
  '30-45 days',
  'ASIS GDL FPSM-AC-07'
),

-- OB-AC-008: Stairwell Access Control
(
  'Stairwell Access Control',
  'Electronic locks on stairwell doors with badge access. Prevents unauthorized floor-to-floor movement while maintaining emergency egress per fire code.',
  'Access Control',
  'office_building',
  20000,
  4000,
  65,
  '14-21 days',
  'ASIS GDL FPSM-AC-08'
),

-- OB-AC-009: Executive Suite Access Control
(
  'Executive Suite Enhanced Access Control',
  'Additional access layer for C-suite and executive areas. May include biometric + badge, video verification, or dedicated security officer. Protects executives and sensitive discussions.',
  'Access Control',
  'office_building',
  35000,
  10000,
  82,
  '21-30 days',
  'ASIS GDL FPSM-AC-09'
),

-- OB-AC-010: Server Room Access Control
(
  'Server Room / Data Center Access Control',
  'High-security access control for server rooms including biometric + badge, anti-tailgating, environmental monitoring integration, and detailed audit logging.',
  'Access Control',
  'office_building',
  45000,
  12000,
  85,
  '30-45 days',
  'ASIS GDL FPSM-AC-10'
),

-- OB-AC-011: After-Hours Access Protocol
(
  'After-Hours Access Protocol',
  'Documented procedures for after-hours building access including pre-authorization, guard notification, access logging, and restricted elevator/floor access.',
  'Access Control',
  'office_building',
  5000,
  2000,
  60,
  '7-14 days',
  'ASIS GDL FPSM-AC-11'
),

-- OB-AC-012: Loading Dock Access Control
(
  'Loading Dock Access Control',
  'Controlled access at loading dock with verification of deliveries, driver identification, and separation from general building access. Includes CCTV coverage.',
  'Access Control',
  'office_building',
  25000,
  5000,
  70,
  '21-30 days',
  'ASIS GDL FPSM-AC-12'
),

-- OB-AC-013: Parking Access Control
(
  'Parking Facility Access Control',
  'Controlled entry/exit for parking garage with badge, transponder, or LPR. Restricts unauthorized vehicles and provides audit trail of vehicle access.',
  'Access Control',
  'office_building',
  35000,
  8000,
  70,
  '30-45 days',
  'ASIS GDL FPSM-AC-13'
),

-- OB-AC-014: Anti-Passback System
(
  'Anti-Passback Access Control',
  'System preventing badge sharing by requiring badge-in before badge-out. Tracks personnel location for occupancy reporting and emergency mustering.',
  'Access Control',
  'office_building',
  15000,
  4000,
  65,
  '14-21 days',
  'ASIS GDL FPSM-AC-14'
),

-- OB-AC-015: Mobile Credential System
(
  'Mobile Credential Access System',
  'Smartphone-based access credentials using Bluetooth or NFC. Provides convenience while maintaining security with device binding and remote deactivation capability.',
  'Access Control',
  'office_building',
  30000,
  10000,
  72,
  '21-30 days',
  'ASIS GDL FPSM-AC-15'
),

-- ============================================================================
-- CATEGORY 2: SURVEILLANCE SYSTEMS (12 controls)
-- ============================================================================

-- OB-SV-001: CCTV - Entry Points
(
  'CCTV Coverage - Building Entry Points',
  'Camera coverage at all building entrances capturing facial images and access attempts. High-resolution for identification purposes. Integrates with access control events.',
  'Surveillance',
  'office_building',
  30000,
  6000,
  75,
  '14-21 days',
  'ASIS GDL VS-01'
),

-- OB-SV-002: CCTV - Lobby/Reception
(
  'CCTV Coverage - Lobby and Reception',
  'Comprehensive camera coverage of main lobby and reception areas capturing all visitor activity, deliveries, and general traffic patterns.',
  'Surveillance',
  'office_building',
  25000,
  5000,
  70,
  '14-21 days',
  'ASIS GDL VS-02'
),

-- OB-SV-003: CCTV - Parking Facility
(
  'CCTV Coverage - Parking Facility',
  'Camera coverage throughout parking structure including entry/exit lanes, stairwells, elevators, and general parking areas. Critical for employee safety.',
  'Surveillance',
  'office_building',
  45000,
  8000,
  72,
  '21-30 days',
  'ASIS GDL VS-03'
),

-- OB-SV-004: CCTV - Interior Common Areas
(
  'CCTV Coverage - Interior Common Areas',
  'Camera coverage of hallways, break rooms, copy centers, and other common areas. Balance coverage with privacy considerations.',
  'Surveillance',
  'office_building',
  40000,
  7000,
  68,
  '21-30 days',
  'ASIS GDL VS-04'
),

-- OB-SV-005: CCTV - Server Room
(
  'CCTV Coverage - Server Room / Data Center',
  'Dedicated camera coverage inside server room capturing all access and activity. High retention period for compliance requirements.',
  'Surveillance',
  'office_building',
  15000,
  4000,
  80,
  '7-14 days',
  'ASIS GDL VS-05'
),

-- OB-SV-006: CCTV - Perimeter
(
  'CCTV Coverage - Building Perimeter',
  'External camera coverage of building perimeter, service areas, and approach routes. May include thermal imaging for low-light conditions.',
  'Surveillance',
  'office_building',
  50000,
  10000,
  75,
  '21-30 days',
  'ASIS GDL VS-06'
),

-- OB-SV-007: Video Analytics - Motion Detection
(
  'Video Analytics - Motion Detection',
  'Automated motion detection triggering alerts and recording. Reduces false alarms through intelligent filtering. Critical for after-hours monitoring.',
  'Surveillance',
  'office_building',
  20000,
  8000,
  70,
  '14-21 days',
  'ASIS GDL VS-07'
),

-- OB-SV-008: Video Analytics - Facial Recognition
(
  'Video Analytics - Facial Recognition',
  'AI-powered facial recognition for identifying watchlist individuals or verifying credentials. Privacy policy compliance required.',
  'Surveillance',
  'office_building',
  40000,
  15000,
  78,
  '30-45 days',
  'ASIS GDL VS-08'
),

-- OB-SV-009: Video Analytics - Loitering Detection
(
  'Video Analytics - Loitering Detection',
  'Automated detection of prolonged presence in sensitive areas triggering security alerts. Useful for perimeter monitoring.',
  'Surveillance',
  'office_building',
  15000,
  6000,
  65,
  '14-21 days',
  'ASIS GDL VS-09'
),

-- OB-SV-010: Real-Time Video Monitoring
(
  'Real-Time Video Monitoring - 24/7',
  'Security operations center with continuous live monitoring of CCTV feeds. Enables immediate response to detected incidents.',
  'Surveillance',
  'office_building',
  0,
  180000,
  85,
  '30 days',
  'ASIS GDL VS-10'
),

-- OB-SV-011: Video Retention - 30 Days
(
  'Video Retention - 30 Day Minimum',
  'Storage infrastructure supporting minimum 30-day video retention across all cameras. Enables incident investigation and compliance.',
  'Surveillance',
  'office_building',
  25000,
  8000,
  65,
  '14-21 days',
  'ASIS GDL VS-11'
),

-- OB-SV-012: Video Retention - 90 Days
(
  'Video Retention - 90 Day Extended',
  'Extended video retention for 90+ days. Required for some compliance frameworks and provides longer investigation window.',
  'Surveillance',
  'office_building',
  50000,
  15000,
  70,
  '21-30 days',
  'ASIS GDL VS-12'
),

-- ============================================================================
-- CATEGORY 3: INTRUSION DETECTION (8 controls)
-- ============================================================================

-- OB-ID-001: Intrusion Detection System
(
  'Intrusion Detection System - Comprehensive',
  'Building-wide alarm system with door contacts, motion sensors, glass break detectors, and central monitoring. Foundation of after-hours security.',
  'Intrusion Detection',
  'office_building',
  35000,
  8000,
  80,
  '21-30 days',
  'NFPA 731 / ASIS GDL ID-01'
),

-- OB-ID-002: Motion Detectors
(
  'Motion Detectors - PIR/Dual-Tech',
  'Passive infrared and/or dual-technology motion detectors for interior intrusion detection. Strategic placement covers movement paths.',
  'Intrusion Detection',
  'office_building',
  15000,
  3000,
  70,
  '14-21 days',
  'NFPA 731 / ASIS GDL ID-02'
),

-- OB-ID-003: Glass Break Sensors
(
  'Glass Break Detection Sensors',
  'Acoustic or shock sensors detecting window breakage. Critical for ground floor and accessible window protection.',
  'Intrusion Detection',
  'office_building',
  8000,
  2000,
  65,
  '7-14 days',
  'NFPA 731 / ASIS GDL ID-03'
),

-- OB-ID-004: Door Forced Entry Alarm
(
  'Door Forced Entry Alarm',
  'Sensors detecting door forced open or held open beyond threshold. Immediate alert to security for response.',
  'Intrusion Detection',
  'office_building',
  12000,
  2500,
  72,
  '7-14 days',
  'NFPA 731 / ASIS GDL ID-04'
),

-- OB-ID-005: Central Station Monitoring
(
  'Central Station Monitoring - 24/7',
  'Professional UL-listed central monitoring station providing 24/7 alarm response, dispatch coordination, and escalation procedures.',
  'Intrusion Detection',
  'office_building',
  0,
  18000,
  82,
  '7-14 days',
  'UL 2050 / ASIS GDL ID-05'
),

-- OB-ID-006: Perimeter Intrusion Detection
(
  'Perimeter Intrusion Detection System',
  'Fence-mounted sensors, ground vibration detectors, or beam barriers detecting unauthorized perimeter entry attempts.',
  'Intrusion Detection',
  'office_building',
  60000,
  12000,
  78,
  '45-60 days',
  'ASIS GDL ID-06'
),

-- OB-ID-007: Roof Hatch Sensor
(
  'Roof Access Point Monitoring',
  'Sensors on roof hatches and access doors with immediate alarm on unauthorized opening. Often overlooked vulnerability.',
  'Intrusion Detection',
  'office_building',
  5000,
  1000,
  60,
  '3-7 days',
  'ASIS GDL ID-07'
),

-- OB-ID-008: Alarm System Testing
(
  'Alarm System Testing Protocol',
  'Regular testing of all intrusion detection components per NFPA and manufacturer requirements. Includes quarterly testing and annual inspection.',
  'Intrusion Detection',
  'office_building',
  0,
  5000,
  55,
  'Ongoing',
  'NFPA 731 / ASIS GDL ID-08'
),

-- ============================================================================
-- CATEGORY 4: VISITOR MANAGEMENT (8 controls)
-- ============================================================================

-- OB-VM-001: Visitor Management System
(
  'Visitor Management System - Electronic',
  'Electronic check-in system capturing visitor information, photo, and issuing temporary badge. Maintains visitor log and enables pre-registration.',
  'Visitor Management',
  'office_building',
  20000,
  8000,
  75,
  '14-21 days',
  'ASIS GDL VM-01'
),

-- OB-VM-002: Visitor Pre-Registration
(
  'Visitor Pre-Registration System',
  'Online or email-based pre-registration allowing hosts to register visitors in advance. Streamlines check-in and enables background screening.',
  'Visitor Management',
  'office_building',
  8000,
  4000,
  65,
  '7-14 days',
  'ASIS GDL VM-02'
),

-- OB-VM-003: Visitor Escort Policy
(
  'Visitor Escort Requirement',
  'Policy requiring visitors to be escorted by host employee at all times within secured areas. Prevents unaccompanied access.',
  'Visitor Management',
  'office_building',
  2000,
  1000,
  70,
  '7 days',
  'ASIS GDL VM-03'
),

-- OB-VM-004: Temporary Badge System
(
  'Temporary Visitor Badge System',
  'Distinctive visitor badges that are time-expiring, prominently visible, and easily distinguishable from employee badges.',
  'Visitor Management',
  'office_building',
  5000,
  2000,
  60,
  '3-7 days',
  'ASIS GDL VM-04'
),

-- OB-VM-005: Contractor Badge System
(
  'Contractor Credential Management',
  'Separate badge category for contractors with defined access permissions, expiration dates, and sponsoring department tracking.',
  'Visitor Management',
  'office_building',
  10000,
  4000,
  68,
  '14-21 days',
  'ASIS GDL VM-05'
),

-- OB-VM-006: Watchlist Screening
(
  'Visitor Watchlist Screening',
  'Integration with internal watchlist or external databases to screen visitors during registration. Alerts security for flagged individuals.',
  'Visitor Management',
  'office_building',
  15000,
  8000,
  72,
  '21-30 days',
  'ASIS GDL VM-06'
),

-- OB-VM-007: Staffed Reception Desk
(
  'Staffed Reception Desk',
  'Trained receptionist at main entrance greeting visitors, verifying appointments, and controlling lobby access. First line of visitor management.',
  'Visitor Management',
  'office_building',
  0,
  65000,
  78,
  '14 days',
  'ASIS GDL VM-07'
),

-- OB-VM-008: Delivery Verification
(
  'Delivery/Package Verification',
  'Procedures for verifying deliveries including advance notification, carrier verification, and package screening before acceptance.',
  'Visitor Management',
  'office_building',
  5000,
  3000,
  62,
  '7-14 days',
  'ASIS GDL VM-08'
),

-- ============================================================================
-- CATEGORY 5: SECURITY PERSONNEL (10 controls)
-- ============================================================================

-- OB-SP-001: Security Officers - 24/7
(
  'Security Officers - 24/7 Coverage',
  'Around-the-clock uniformed security officer presence providing access control, patrol, incident response, and emergency coordination.',
  'Security Personnel',
  'office_building',
  0,
  350000,
  85,
  '30 days',
  'ASIS GDL SP-01'
),

-- OB-SP-002: Security Officers - Business Hours
(
  'Security Officers - Business Hours',
  'Security officer presence during core business hours providing lobby coverage, visitor assistance, and incident response.',
  'Security Personnel',
  'office_building',
  0,
  150000,
  72,
  '14-21 days',
  'ASIS GDL SP-02'
),

-- OB-SP-003: Security Operations Center
(
  'Security Operations Center (SOC)',
  'Dedicated security command center with CCTV monitoring, alarm management, access control supervision, and incident coordination.',
  'Security Personnel',
  'office_building',
  75000,
  200000,
  88,
  '60-90 days',
  'ASIS GDL SP-03'
),

-- OB-SP-004: Security Manager
(
  'Dedicated Security Manager',
  'Full-time security manager responsible for program oversight, policy development, vendor management, and incident investigation.',
  'Security Personnel',
  'office_building',
  0,
  120000,
  75,
  '30-60 days',
  'ASIS GDL SP-04'
),

-- OB-SP-005: Roving Patrol
(
  'Roving Security Patrol',
  'Regular patrol routes covering parking, perimeter, and interior areas. Deters crime and identifies security issues.',
  'Security Personnel',
  'office_building',
  0,
  80000,
  68,
  '14 days',
  'ASIS GDL SP-05'
),

-- OB-SP-006: Parking Escort Service
(
  'Security Escort Service',
  'Escort service for employees to parking areas after hours. Critical for employee safety and liability reduction.',
  'Security Personnel',
  'office_building',
  0,
  25000,
  60,
  '7 days',
  'ASIS GDL SP-06'
),

-- OB-SP-007: Executive Protection - On-Site
(
  'Executive Protection - Office',
  'Dedicated protection officer for executives while at corporate headquarters. Manages executive floor access and provides personal security.',
  'Security Personnel',
  'office_building',
  0,
  180000,
  85,
  '30 days',
  'ASIS GDL EP-01'
),

-- OB-SP-008: Armed Response Team
(
  'Armed Security Response',
  'Armed security officers for high-risk environments. Requires additional licensing, training, and liability coverage.',
  'Security Personnel',
  'office_building',
  0,
  400000,
  82,
  '45-60 days',
  'ASIS GDL SP-08'
),

-- OB-SP-009: K-9 Security Team
(
  'K-9 Security / Bomb Detection',
  'Trained security dog team for patrol, detection, or response. Effective deterrent and detection capability.',
  'Security Personnel',
  'office_building',
  25000,
  150000,
  78,
  '60-90 days',
  'ASIS GDL SP-09'
),

-- OB-SP-010: Contract Security Review
(
  'Security Contractor Performance Review',
  'Regular performance reviews of contract security including post orders compliance, training verification, and quality audits.',
  'Security Personnel',
  'office_building',
  0,
  5000,
  55,
  'Ongoing',
  'ASIS GDL SP-10'
),

-- ============================================================================
-- CATEGORY 6: EMERGENCY PREPAREDNESS (12 controls)
-- ============================================================================

-- OB-EP-001: Emergency Response Plan
(
  'Emergency Response Plan - Comprehensive',
  'Documented emergency procedures covering fire, medical, active shooter, bomb threat, severe weather, and evacuation. Includes roles, responsibilities, and communication protocols.',
  'Emergency Preparedness',
  'office_building',
  15000,
  5000,
  78,
  '30-45 days',
  'NFPA 1600 / ASIS BCM-01'
),

-- OB-EP-002: Emergency Drills
(
  'Emergency Drill Program',
  'Regular emergency drills including fire evacuation, shelter-in-place, and lockdown. At minimum annual fire drill per code; quarterly recommended.',
  'Emergency Preparedness',
  'office_building',
  0,
  8000,
  72,
  'Ongoing',
  'NFPA 1600 / OSHA'
),

-- OB-EP-003: Mass Notification System
(
  'Mass Notification System',
  'System for rapid notification via email, text, voice, and desktop alerts. Critical for emergency communications and accountability.',
  'Emergency Preparedness',
  'office_building',
  25000,
  15000,
  80,
  '21-30 days',
  'ASIS GDL MN-01'
),

-- OB-EP-004: Panic/Duress Alarms
(
  'Panic / Duress Alarm System',
  'Silent alarm capability at reception, executive offices, and other risk areas. Triggers immediate security response without alerting threat.',
  'Emergency Preparedness',
  'office_building',
  12000,
  3000,
  75,
  '14-21 days',
  'ASIS WVPI'
),

-- OB-EP-005: Lockdown System
(
  'Remote Lockdown Capability',
  'Ability to secure building or zones remotely in emergency. Includes door lock-down, elevator recall, and HVAC shutdown capability.',
  'Emergency Preparedness',
  'office_building',
  45000,
  10000,
  82,
  '45-60 days',
  'ASIS GDL EP-05'
),

-- OB-EP-006: Rally Points
(
  'Designated Emergency Rally Points',
  'Defined assembly areas for evacuation accountability. Includes primary and alternate locations with clear signage and communication plan.',
  'Emergency Preparedness',
  'office_building',
  2000,
  500,
  60,
  '3-7 days',
  'OSHA / NFPA 1600'
),

-- OB-EP-007: AED Program
(
  'AED Program with Training',
  'Automated External Defibrillators placed throughout facility with trained responders. Critical for cardiac emergency response.',
  'Emergency Preparedness',
  'office_building',
  8000,
  3000,
  70,
  '14-21 days',
  'OSHA / AHA'
),

-- OB-EP-008: First Aid Supplies
(
  'First Aid / Trauma Supplies',
  'Stocked first aid stations and trauma kits (stop-the-bleed) distributed throughout facility. Trained responders identified.',
  'Emergency Preparedness',
  'office_building',
  5000,
  2000,
  55,
  '3-7 days',
  'OSHA'
),

-- OB-EP-009: Active Shooter Training
(
  'Active Shooter Response Training',
  'Run-Hide-Fight training for employees covering recognition, response options, and post-incident protocols. Annual training recommended.',
  'Emergency Preparedness',
  'office_building',
  15000,
  8000,
  75,
  '7-14 days',
  'DHS / ASIS WVPI'
),

-- OB-EP-010: Bomb Threat Procedures
(
  'Bomb Threat Response Procedures',
  'Documented procedures for bomb threat receipt, assessment, search, and evacuation decision. Includes threat assessment checklist.',
  'Emergency Preparedness',
  'office_building',
  5000,
  2000,
  65,
  '7-14 days',
  'DHS / ATF'
),

-- OB-EP-011: Safe Rooms
(
  'Safe Room / Shelter Locations',
  'Designated safe rooms for shelter during active threats. Includes lockable doors, communication capability, and medical supplies.',
  'Emergency Preparedness',
  'office_building',
  25000,
  3000,
  72,
  '30-45 days',
  'FEMA / ASIS WVPI'
),

-- OB-EP-012: Business Continuity Plan
(
  'Business Continuity Plan',
  'Documented plan for maintaining critical operations during and after incidents. Includes alternate site, communication plan, and recovery procedures.',
  'Emergency Preparedness',
  'office_building',
  20000,
  8000,
  70,
  '60-90 days',
  'NFPA 1600 / ASIS BCM-01'
),

-- ============================================================================
-- CATEGORY 7: INFORMATION SECURITY (PHYSICAL) (10 controls)
-- ============================================================================

-- OB-IS-001: Clean Desk Policy
(
  'Clean Desk Policy - Enforced',
  'Policy requiring sensitive documents to be secured when unattended. Includes regular audits and employee awareness training.',
  'Information Security',
  'office_building',
  2000,
  1000,
  55,
  '7-14 days',
  'ISO 27001 A.11.2.9'
),

-- OB-IS-002: Secure Document Destruction
(
  'Secure Document Destruction Program',
  'Locked shred bins and contracted secure destruction service. Includes certificate of destruction for compliance documentation.',
  'Information Security',
  'office_building',
  5000,
  12000,
  70,
  '7-14 days',
  'ISO 27001 A.11.2.7'
),

-- OB-IS-003: Secure Print Release
(
  'Secure Print Release System',
  'Print jobs held until user authenticates at printer. Prevents sensitive documents left on shared printers.',
  'Information Security',
  'office_building',
  15000,
  5000,
  65,
  '14-21 days',
  'ISO 27001 / NIST'
),

-- OB-IS-004: Media Destruction
(
  'Electronic Media Destruction',
  'Secure destruction of hard drives, USB devices, and other electronic media. Includes degaussing and physical destruction.',
  'Information Security',
  'office_building',
  8000,
  6000,
  72,
  '7-14 days',
  'NIST SP 800-88'
),

-- OB-IS-005: Locked File Cabinets
(
  'Locked File Cabinet Requirements',
  'Locking file cabinets for sensitive documents with key control. Required for regulated information.',
  'Information Security',
  'office_building',
  10000,
  1000,
  58,
  '7-14 days',
  'ISO 27001 A.11.2.9'
),

-- OB-IS-006: Photography Policy
(
  'Photography / Recording Policy',
  'Policy restricting photography and recording in sensitive areas. Includes signage and enforcement procedures.',
  'Information Security',
  'office_building',
  1000,
  500,
  50,
  '3-7 days',
  'ASIS GDL'
),

-- OB-IS-007: Network Segregation
(
  'Security System Network Segregation',
  'Physical and logical separation of security systems (CCTV, access control) from corporate IT network.',
  'Information Security',
  'office_building',
  25000,
  8000,
  78,
  '30-45 days',
  'NIST SP 800-82'
),

-- OB-IS-008: Visitor WiFi Segregation
(
  'Guest WiFi Network Segregation',
  'Separate wireless network for visitors isolated from corporate network. Prevents unauthorized network access.',
  'Information Security',
  'office_building',
  10000,
  3000,
  70,
  '14-21 days',
  'NIST / PCI-DSS'
),

-- OB-IS-009: Screen Privacy Filters
(
  'Monitor Privacy Screen Filters',
  'Privacy filters on monitors in public-facing or shared areas preventing visual eavesdropping.',
  'Information Security',
  'office_building',
  5000,
  2000,
  45,
  '3-7 days',
  'ISO 27001'
),

-- OB-IS-010: SCIF / Secure Area
(
  'Sensitive Compartmented Information Facility (SCIF)',
  'Specially constructed secure area meeting government requirements for classified information handling. Includes TEMPEST shielding.',
  'Information Security',
  'office_building',
  500000,
  50000,
  95,
  '180+ days',
  'ICD 705 / DCID 6/9'
),

-- ============================================================================
-- CATEGORY 8: PHYSICAL BARRIERS (10 controls)
-- ============================================================================

-- OB-PB-001: Vehicle Barriers - Bollards
(
  'Vehicle Barrier Bollards',
  'Fixed or retractable bollards protecting building entrances from vehicle attack. Rated options available for high-threat environments.',
  'Physical Barriers',
  'office_building',
  50000,
  5000,
  80,
  '30-45 days',
  'DOS SD-STD-02.01'
),

-- OB-PB-002: Vehicle Barriers - Planters
(
  'Decorative Security Planters',
  'Architectural planters providing vehicle barrier protection while maintaining aesthetics. Lower rating than bollards but more visually acceptable.',
  'Physical Barriers',
  'office_building',
  30000,
  3000,
  65,
  '21-30 days',
  'ASIS GDL'
),

-- OB-PB-003: Setback Distance
(
  'Building Setback / Standoff Distance',
  'Maintained distance between building and vehicle access points reducing blast and vehicle attack risk. Minimum 25 feet recommended.',
  'Physical Barriers',
  'office_building',
  0,
  0,
  70,
  'Design phase',
  'DOS / GSA'
),

-- OB-PB-004: Security Fencing
(
  'Perimeter Security Fencing',
  'Chain link, ornamental, or anti-climb fencing defining property boundary and controlling pedestrian access.',
  'Physical Barriers',
  'office_building',
  40000,
  5000,
  68,
  '30-45 days',
  'ASIS GDL FPSM'
),

-- OB-PB-005: Security Glazing
(
  'Security Window Film / Glazing',
  'Window treatments providing resistance to forced entry, blast mitigation, or ballistic protection. Options range from film to laminated glass.',
  'Physical Barriers',
  'office_building',
  35000,
  2000,
  65,
  '21-30 days',
  'GSA / DOS'
),

-- OB-PB-006: Reinforced Doors
(
  'Reinforced Exterior Doors',
  'Commercial-grade doors with reinforced frames, security hinges, and high-security locks. Resists forced entry.',
  'Physical Barriers',
  'office_building',
  25000,
  2000,
  70,
  '14-21 days',
  'ASIS GDL FPSM'
),

-- OB-PB-007: Security Lighting
(
  'Security Lighting - Perimeter',
  'Adequate lighting for parking, walkways, and building perimeter supporting CCTV and deterring criminal activity. Per IES RP-20 standards.',
  'Physical Barriers',
  'office_building',
  30000,
  8000,
  65,
  '21-30 days',
  'IES RP-20 / ASIS GDL'
),

-- OB-PB-008: CPTED Landscaping
(
  'CPTED Landscaping Design',
  'Landscaping designed per Crime Prevention Through Environmental Design principles. Eliminates concealment, maintains sightlines.',
  'Physical Barriers',
  'office_building',
  20000,
  5000,
  55,
  '30-60 days',
  'CPTED'
),

-- OB-PB-009: Mail Screening
(
  'Mail / Package Screening Room',
  'Dedicated room for mail and package screening separate from main building. May include X-ray equipment for high-threat environments.',
  'Physical Barriers',
  'office_building',
  75000,
  15000,
  75,
  '45-60 days',
  'DHS / USPS'
),

-- OB-PB-010: Lobby Checkpoint
(
  'Lobby Security Checkpoint',
  'Defined security screening point in lobby with x-ray, metal detection, and bag search capability.',
  'Physical Barriers',
  'office_building',
  100000,
  80000,
  85,
  '60-90 days',
  'TSA / ASIS GDL'
),

-- ============================================================================
-- CATEGORY 9: WORKPLACE VIOLENCE PREVENTION (8 controls)
-- ============================================================================

-- OB-WV-001: Threat Assessment Team
(
  'Threat Assessment Team (TAT)',
  'Multi-disciplinary team (HR, Security, Legal, EAP) for evaluating concerning behaviors and coordinating response. Per ASIS WVPI standard.',
  'Workplace Violence Prevention',
  'office_building',
  10000,
  15000,
  80,
  '30-45 days',
  'ASIS WVPI'
),

-- OB-WV-002: Workplace Violence Policy
(
  'Workplace Violence Prevention Policy',
  'Written policy prohibiting violence, defining reporting procedures, and outlining consequences. Foundation of WPV program.',
  'Workplace Violence Prevention',
  'office_building',
  5000,
  2000,
  65,
  '14-21 days',
  'ASIS WVPI / OSHA'
),

-- OB-WV-003: Employee Reporting System
(
  'Anonymous Reporting System',
  'Confidential mechanism for employees to report concerning behaviors, threats, or policy violations. May include hotline or web portal.',
  'Workplace Violence Prevention',
  'office_building',
  10000,
  8000,
  70,
  '14-21 days',
  'ASIS WVPI'
),

-- OB-WV-004: Background Checks
(
  'Employee Background Checks',
  'Pre-employment screening including criminal history, employment verification, and reference checks. Required for security-sensitive positions.',
  'Workplace Violence Prevention',
  'office_building',
  0,
  25000,
  68,
  'Ongoing',
  'ASIS / EEOC'
),

-- OB-WV-005: Termination Procedures
(
  'Secure Termination Procedures',
  'Security protocols for employee terminations including access revocation, escort, and risk assessment for contentious separations.',
  'Workplace Violence Prevention',
  'office_building',
  5000,
  2000,
  65,
  '7-14 days',
  'ASIS WVPI'
),

-- OB-WV-006: Security Awareness Training
(
  'Security Awareness Training Program',
  'Annual training covering threat recognition, reporting procedures, and emergency response. Tailored to office environment.',
  'Workplace Violence Prevention',
  'office_building',
  15000,
  10000,
  70,
  '30 days',
  'ASIS / OSHA'
),

-- OB-WV-007: Executive Security Training
(
  'Executive Security Awareness Training',
  'Specialized training for executives on personal security, travel safety, and threat recognition. Higher risk profile requires targeted content.',
  'Workplace Violence Prevention',
  'office_building',
  20000,
  8000,
  72,
  '7-14 days',
  'ASIS EP'
),

-- OB-WV-008: EAP Integration
(
  'EAP Integration with Security',
  'Coordination between Employee Assistance Program and security for managing employees in crisis. Confidentiality protocols maintained.',
  'Workplace Violence Prevention',
  'office_building',
  5000,
  3000,
  60,
  '14-21 days',
  'ASIS WVPI'
),

-- ============================================================================
-- CATEGORY 10: PROCEDURAL CONTROLS (9 controls)
-- ============================================================================

-- OB-PC-001: Security Policies Manual
(
  'Comprehensive Security Policies Manual',
  'Documented security policies covering access control, visitor management, incident reporting, and emergency procedures. Annual review required.',
  'Procedural',
  'office_building',
  10000,
  3000,
  60,
  '30-60 days',
  'ASIS GDL'
),

-- OB-PC-002: Incident Reporting System
(
  'Incident Reporting and Tracking',
  'Formal system for reporting, documenting, and tracking security incidents. Enables trend analysis and program improvement.',
  'Procedural',
  'office_building',
  15000,
  5000,
  65,
  '14-21 days',
  'ASIS GDL'
),

-- OB-PC-003: Key Control Program
(
  'Key Control Program',
  'Systematic management of physical keys including issuance, tracking, and retrieval. Includes restricted key systems.',
  'Procedural',
  'office_building',
  8000,
  3000,
  62,
  '14-21 days',
  'ASIS GDL FPSM'
),

-- OB-PC-004: Badge Retrieval Process
(
  'Badge Retrieval - Termination',
  'Procedure ensuring badge return and access deactivation upon employment termination. Integration with HR systems.',
  'Procedural',
  'office_building',
  5000,
  2000,
  68,
  '7-14 days',
  'ASIS GDL'
),

-- OB-PC-005: Access Rights Review
(
  'Periodic Access Rights Review',
  'Regular review of access permissions ensuring employees only have required access. Quarterly review recommended.',
  'Procedural',
  'office_building',
  0,
  8000,
  65,
  'Ongoing',
  'ISO 27001 / ASIS GDL'
),

-- OB-PC-006: Security Audit Program
(
  'Security Audit Program',
  'Regular internal audits of security controls effectiveness. May include third-party assessments for objectivity.',
  'Procedural',
  'office_building',
  20000,
  15000,
  70,
  'Ongoing',
  'ASIS GDL'
),

-- OB-PC-007: Vendor Management
(
  'Vendor / Contractor Security Management',
  'Security requirements for vendors and contractors including background checks, access limitations, and supervision requirements.',
  'Procedural',
  'office_building',
  5000,
  3000,
  60,
  '14-21 days',
  'ASIS GDL'
),

-- OB-PC-008: Lost Badge Procedure
(
  'Lost / Stolen Badge Procedure',
  'Immediate deactivation procedure for lost or stolen credentials. Includes reporting, replacement, and investigation protocols.',
  'Procedural',
  'office_building',
  2000,
  1000,
  65,
  '3-7 days',
  'ASIS GDL'
),

-- OB-PC-009: Law Enforcement Coordination
(
  'Law Enforcement Liaison Program',
  'Established relationship with local law enforcement including points of contact, information sharing, and response coordination.',
  'Procedural',
  'office_building',
  5000,
  2000,
  68,
  '30 days',
  'ASIS GDL'
);

-- ============================================================================
-- THREAT-TO-CONTROL MAPPING FOR OFFICE BUILDINGS
-- ============================================================================

/*
THREAT_CONTROL_MAPPING Reference (from office-interview-mapper.ts):

unauthorized_access: [
  'badge_access_control_system',
  'mantrap_security_vestibule', 
  'optical_turnstiles',
  'anti_passback_system',
  'visitor_management_system',
  'staffed_reception_desk',
  'cctv_entry_points',
  'zone_based_access_control',
  'after_hours_access_protocol',
  'security_officers_24x7'
]

workplace_violence: [
  'threat_assessment_team',
  'workplace_violence_policy',
  'anonymous_reporting_system',
  'panic_duress_alarms',
  'active_shooter_training',
  'security_officers_24x7',
  'mass_notification_system',
  'lockdown_capability',
  'employee_background_checks',
  'termination_procedures'
]

theft_burglary: [
  'badge_access_control_system',
  'intrusion_detection_system',
  'central_station_monitoring',
  'cctv_comprehensive',
  'security_lighting',
  'reinforced_doors',
  'after_hours_access_protocol',
  'security_officers_business_hours',
  'loading_dock_access_control',
  'key_control_program'
]

executive_targeting: [
  'executive_suite_access_control',
  'executive_protection_office',
  'panic_duress_alarms',
  'cctv_entry_points',
  'visitor_watchlist_screening',
  'executive_security_training',
  'parking_access_control',
  'security_escort_service',
  'threat_assessment_team',
  'protective_intelligence'
]

data_breach_physical: [
  'clean_desk_policy',
  'secure_document_destruction',
  'secure_print_release',
  'server_room_access_control',
  'cctv_server_room',
  'visitor_escort_policy',
  'locked_file_cabinets',
  'media_destruction',
  'photography_policy',
  'network_segregation'
]

terrorism_bomb_threat: [
  'vehicle_barriers_bollards',
  'setback_distance',
  'mail_screening_room',
  'bomb_threat_procedures',
  'mass_notification_system',
  'evacuation_drill_program',
  'cctv_perimeter',
  'security_officers_24x7',
  'k9_security',
  'lobby_checkpoint'
]

civil_disturbance: [
  'lockdown_capability',
  'mass_notification_system',
  'security_officers_24x7',
  'cctv_perimeter',
  'security_operations_center',
  'law_enforcement_liaison',
  'emergency_response_plan',
  'rally_points',
  'protective_intelligence'
]

insider_threat: [
  'employee_background_checks',
  'access_rights_review',
  'anonymous_reporting_system',
  'badge_retrieval_termination',
  'incident_reporting_tracking',
  'security_awareness_training',
  'cctv_interior',
  'zone_based_access_control',
  'anti_passback_system',
  'security_audit_program'
]

after_hours_intrusion: [
  'intrusion_detection_system',
  'central_station_monitoring',
  'motion_detectors',
  'glass_break_sensors',
  'door_forced_entry_alarm',
  'cctv_comprehensive',
  'security_lighting',
  'after_hours_access_protocol',
  'roof_access_monitoring',
  'perimeter_intrusion_detection'
]

vehicle_ramming: [
  'vehicle_barriers_bollards',
  'decorative_security_planters',
  'setback_distance',
  'cctv_perimeter',
  'security_lighting',
  'emergency_response_plan',
  'mass_notification_system'
]

active_shooter: [
  'active_shooter_training',
  'lockdown_capability',
  'mass_notification_system',
  'panic_duress_alarms',
  'safe_rooms',
  'first_aid_trauma_supplies',
  'aed_program',
  'security_officers_24x7',
  'rally_points',
  'law_enforcement_liaison'
]

corporate_espionage: [
  'clean_desk_policy',
  'secure_document_destruction',
  'visitor_escort_policy',
  'scif_secure_area',
  'employee_background_checks',
  'photography_policy',
  'network_segregation',
  'secure_print_release',
  'vendor_contractor_management',
  'security_awareness_training'
]
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count controls by category
-- SELECT 
--   category,
--   COUNT(*) as control_count,
--   ROUND(AVG(effectiveness_rating), 1) as avg_effectiveness
-- FROM security_controls 
-- WHERE facility_type = 'office_building'
-- GROUP BY category
-- ORDER BY control_count DESC;

-- Expected output:
-- Access Control: 15 controls
-- Surveillance: 12 controls
-- Intrusion Detection: 8 controls
-- Visitor Management: 8 controls
-- Security Personnel: 10 controls
-- Emergency Preparedness: 12 controls
-- Information Security: 10 controls
-- Physical Barriers: 10 controls
-- Workplace Violence Prevention: 8 controls
-- Procedural: 9 controls
-- TOTAL: 102 controls

-- Verify cost distribution
-- SELECT 
--   CASE 
--     WHEN implementation_cost = 0 THEN 'No upfront cost'
--     WHEN implementation_cost < 10000 THEN 'Low (<$10K)'
--     WHEN implementation_cost < 50000 THEN 'Medium ($10K-$50K)'
--     ELSE 'High (>$50K)'
--   END as cost_tier,
--   COUNT(*) as count
-- FROM security_controls 
-- WHERE facility_type = 'office_building'
-- GROUP BY 1
-- ORDER BY count DESC;

-- ============================================================================
-- END OF OFFICE BUILDING CONTROLS SEED FILE
-- ============================================================================
-- Total Controls: 102
-- 
-- Category Breakdown:
-- - Access Control: 15 controls
-- - Surveillance: 12 controls  
-- - Intrusion Detection: 8 controls
-- - Visitor Management: 8 controls
-- - Security Personnel: 10 controls
-- - Emergency Preparedness: 12 controls
-- - Information Security: 10 controls
-- - Physical Barriers: 10 controls
-- - Workplace Violence Prevention: 8 controls
-- - Procedural: 9 controls
--
-- Standards Referenced:
-- - ASIS International (GDL-RA, FPSM, WVPI, BCM, EP)
-- - NFPA 731, NFPA 1600
-- - ISO 27001 Physical Security
-- - NIST SP 800-53, 800-82, 800-88
-- - DOS SD-STD-02.01 (Vehicle Barriers)
-- - GSA P100 (Federal Buildings)
-- - OSHA General Duty Clause
-- - CPTED Guidelines
-- ============================================================================
