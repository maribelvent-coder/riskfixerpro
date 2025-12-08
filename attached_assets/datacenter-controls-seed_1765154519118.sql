-- ============================================================================
-- DATACENTER & CRITICAL INFRASTRUCTURE SECURITY CONTROLS
-- Complete seed file for RiskFixer
-- 
-- 70+ controls organized by category:
-- - Perimeter & Site Security (10 controls)
-- - Access Control & Authentication (14 controls)
-- - Surveillance & Monitoring (9 controls)
-- - Power Infrastructure Security (10 controls)
-- - Cooling & Environmental Controls (8 controls)
-- - Fire Suppression & Life Safety (8 controls)
-- - Personnel Security & Training (8 controls)
-- - Compliance & Audit (5 controls)
-- 
-- Standards References:
-- - Uptime Institute Tier Standards (I-IV)
-- - TIA-942 (Telecommunications Infrastructure Standard for Data Centers)
-- - SOC 2 Type II (Trust Services Criteria)
-- - ISO 27001 (Information Security Management)
-- - PCI-DSS (Payment Card Industry Data Security Standard)
-- - NFPA 75/76 (Fire Protection for IT Equipment)
-- - ASHRAE (Environmental Guidelines)
-- - ASIS GDL-RA (General Security Risk Assessment)
-- 
-- Key Metrics:
-- - Average downtime cost: $9,000/minute ($540,000/hour)
-- - 60%+ of sabotage involves insiders (FBI)
-- - 30%+ of physical intrusions involve tailgating
-- - Tier IV requires 99.995% uptime (26 minutes/year max)
-- 
-- @author RiskFixer Team
-- @version 1.0
-- ============================================================================

-- Clean up any existing datacenter controls to prevent duplicates
DELETE FROM controls WHERE facility_type = 'datacenter';

-- Also clean by name to catch any miscategorized controls
DELETE FROM controls WHERE name IN (
  -- Perimeter & Site
  'High Security Perimeter Fencing', 'Perimeter Intrusion Detection System', 'K-Rated Vehicle Barriers',
  'Standoff Distance Enforcement', 'Perimeter Lighting System', 'Perimeter CCTV Array',
  'Security Patrol 24/7', 'Guard Checkpoint', 'Clear Zone Maintenance', 'Vehicle Screening Area',
  -- Access Control
  'Biometric Authentication', 'Multi-Factor Access Control', 'Man-Trap Portal Entry',
  'Anti-Tailgating Detection', 'Visitor Management System', 'Escort Requirements',
  'Cabinet-Level Electronic Locks', 'Access Logging and Audit', 'Quarterly Access Reviews',
  'Immediate Access Revocation', 'Customer Cage Segregation', 'Two-Person Integrity Rule',
  'Badge-In/Badge-Out System', 'PIN Code Secondary Authentication',
  -- Surveillance
  'Comprehensive CCTV Coverage', 'Hands-On-Servers Camera Coverage', '90-Day Video Retention',
  'Video Analytics System', 'NOC/SOC Operations Center', 'Central Alarm Monitoring',
  'Environmental Sensor Network', 'Real-Time Monitoring Dashboard', 'Incident Recording System',
  -- Power
  'Redundant Utility Feeds', 'UPS N+1 Redundancy', 'Automatic Transfer Switch',
  '72-Hour Generator Fuel Capacity', 'Secure Fuel Storage', 'EPO Button Protection',
  'Electrical Room Access Control', 'Power Monitoring System', 'Generator Testing Program',
  'Battery Monitoring System',
  -- Cooling
  'Cooling System Redundancy', 'Temperature/Humidity Monitoring', 'Water Leak Detection System',
  'Chiller Plant Security', 'Hot/Cold Aisle Containment', 'Environmental Contamination Protection',
  'CRAC/CRAH Unit Monitoring', 'Cooling Plant Alarm System',
  -- Fire
  'VESDA Early Warning Detection', 'Clean Agent Fire Suppression', 'Zoned Fire Suppression',
  'Manual Release Protection', 'Fire System Central Monitoring', 'Quarterly Fire System Testing',
  'Fire Extinguisher Program', 'Emergency Lighting System',
  -- Personnel
  'Comprehensive Background Checks', 'Annual Security Training', 'Contractor Vetting Program',
  'Termination Procedures', 'Incident Response Plan', 'Tool Control System',
  'Media Destruction Program', 'Security Clearance Verification',
  -- Compliance
  'SOC 2 Type II Certification', 'ISO 27001 Certification', 'PCI-DSS Compliance',
  'Quarterly Security Audits', 'Annual Penetration Testing'
);

-- ============================================================================
-- PERIMETER & SITE SECURITY (10 controls)
-- TIA-942: 100ft+ standoff, K12 barriers stop 15,000lb vehicle at 50mph
-- ============================================================================

INSERT INTO controls (
  name, category, control_type, facility_type, description, 
  base_weight, reduction_percentage, estimated_cost, maintenance_level, 
  requires_training, requires_maintenance, is_active, standards_reference
) VALUES

('High Security Perimeter Fencing', 'perimeter_security', 'preventive', 'datacenter',
 'Minimum 8-foot fence with anti-climb features (outriggers, razor wire). TIA-942 requires secure perimeter for all datacenters. PIDS integration recommended.',
 0.40, 0.35, 'medium', 'medium', false, true, true, 'TIA-942 Section 5.2'),

('Perimeter Intrusion Detection System', 'perimeter_security', 'detective', 'datacenter',
 'Sensor system detecting fence climbing, cutting, or breach attempts. Technologies include vibration sensors, taut wire, microwave, or video analytics. Integration with alarm monitoring required.',
 0.38, 0.32, 'high', 'medium', true, true, true, 'TIA-942 Section 5.3'),

('K-Rated Vehicle Barriers', 'perimeter_security', 'preventive', 'datacenter',
 'K12-rated bollards or barriers capable of stopping 15,000lb vehicle at 50mph. Critical for preventing vehicle-borne explosive attacks. Required at all vehicle approach points.',
 0.45, 0.40, 'high', 'low', false, true, true, 'TIA-942 Section 5.2.3, DOS SD-STD-02.01'),

('Standoff Distance Enforcement', 'perimeter_security', 'preventive', 'datacenter',
 'Minimum 100ft setback from public roads and parking areas per TIA-942. Reduces blast impact and provides detection/response time for approaching threats.',
 0.35, 0.30, 'high', 'low', false, false, true, 'TIA-942 Section 5.2.1'),

('Perimeter Lighting System', 'perimeter_security', 'deterrent', 'datacenter',
 'IESNA-compliant lighting: minimum 5 foot-candles at fence line, 10 fc at access points, overlapping coverage eliminating shadows. Emergency backup required.',
 0.28, 0.25, 'medium', 'medium', false, true, true, 'IESNA RP-20, TIA-942'),

('Perimeter CCTV Array', 'perimeter_security', 'detective', 'datacenter',
 '100% camera coverage of perimeter with no blind spots. Minimum 720p resolution, IR/night vision capability. Integration with video analytics for automated alerts.',
 0.38, 0.32, 'high', 'medium', true, true, true, 'TIA-942 Section 5.5'),

('Security Patrol 24/7', 'perimeter_security', 'detective', 'datacenter',
 'Round-the-clock security officer presence with documented patrol routes and checkpoints. Required for Tier III+ facilities. Mobile and foot patrols.',
 0.42, 0.38, 'high', 'low', true, false, true, 'Uptime Institute, SOC 2'),

('Guard Checkpoint', 'perimeter_security', 'preventive', 'datacenter',
 'Manned security checkpoint at primary vehicle entry. Verifies credentials, inspects vehicles, logs all access. 24/7 staffing for Tier III+ facilities.',
 0.40, 0.35, 'high', 'low', true, false, true, 'TIA-942 Section 5.4'),

('Clear Zone Maintenance', 'perimeter_security', 'deterrent', 'datacenter',
 'Maintained clear zone (minimum 10 meters) around perimeter free of vegetation, equipment, or concealment. Enables clear CCTV coverage and eliminates hiding spots.',
 0.20, 0.18, 'low', 'medium', false, true, true, 'TIA-942, ASIS'),

('Vehicle Screening Area', 'perimeter_security', 'preventive', 'datacenter',
 'Designated area for vehicle inspection before entry to secure compound. Includes under-vehicle inspection capability and delivery verification procedures.',
 0.32, 0.28, 'medium', 'low', true, true, true, 'TIA-942, C-TPAT'),

-- ============================================================================
-- ACCESS CONTROL & AUTHENTICATION (14 controls)
-- SOC 2: Unique authentication, access logging, quarterly reviews
-- ============================================================================

('Biometric Authentication', 'access_control', 'preventive', 'datacenter',
 'Biometric readers (fingerprint, hand geometry, iris) for datacenter floor access. Non-transferable credential eliminates badge sharing. Required for Tier III+ facilities.',
 0.45, 0.40, 'high', 'medium', true, true, true, 'SOC 2 CC6.1, ISO 27001 A.9.4'),

('Multi-Factor Access Control', 'access_control', 'preventive', 'datacenter',
 'Minimum two-factor authentication (badge + PIN, badge + biometric) for all datacenter access points. Something you have + something you know/are.',
 0.42, 0.38, 'medium', 'medium', true, true, true, 'SOC 2 CC6.1, PCI-DSS 8.3'),

('Man-Trap Portal Entry', 'access_control', 'preventive', 'datacenter',
 'Interlocking door system preventing tailgating - only one person can pass at a time. Weight sensors detect piggybacking. Required for Tier III+ datacenter floor entry.',
 0.48, 0.42, 'high', 'medium', true, true, true, 'TIA-942 Section 5.3.3, SOC 2 CC6.4'),

('Anti-Tailgating Detection', 'access_control', 'detective', 'datacenter',
 'Sensors detecting multiple persons attempting to pass through single credential scan. Options include optical turnstiles, weight sensors, or video analytics. Alarms to SOC.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'SOC 2 CC6.4, TIA-942'),

('Visitor Management System', 'access_control', 'preventive', 'datacenter',
 'Electronic system for registering visitors, capturing ID, issuing temporary badges, and tracking access. Photo ID verification and host authorization required.',
 0.30, 0.26, 'medium', 'low', true, true, true, 'SOC 2 CC6.4, TIA-942'),

('Escort Requirements', 'access_control', 'preventive', 'datacenter',
 'Policy requiring authorized employee escort for all visitors and contractors on datacenter floor. Escort-to-visitor ratio limits (typically 1:3 max).',
 0.28, 0.25, 'low', 'low', true, false, true, 'SOC 2 CC6.4, ISO 27001'),

('Cabinet-Level Electronic Locks', 'access_control', 'preventive', 'datacenter',
 'Electronic locks on individual server cabinets with access logging. Critical for colocation environments. Customer-specific access credentials.',
 0.38, 0.32, 'high', 'medium', true, true, true, 'PCI-DSS 9.1, SOC 2 CC6.4'),

('Access Logging and Audit', 'access_control', 'detective', 'datacenter',
 'Comprehensive logging of all access events with timestamp, credential ID, access point, and grant/deny status. Minimum 1-year retention. SOC 2 requirement.',
 0.35, 0.30, 'medium', 'low', true, true, true, 'SOC 2 CC6.1, PCI-DSS 10.2'),

('Quarterly Access Reviews', 'access_control', 'detective', 'datacenter',
 'Formal quarterly review of all access privileges by management. Removes terminated employees, validates need-to-access. SOC 2 mandatory control.',
 0.32, 0.28, 'low', 'low', true, false, true, 'SOC 2 CC6.2, ISO 27001 A.9.2.5'),

('Immediate Access Revocation', 'access_control', 'preventive', 'datacenter',
 'Procedure for immediate credential deactivation upon termination. Same-day removal of physical and logical access. Critical for insider threat mitigation.',
 0.38, 0.32, 'low', 'low', true, false, true, 'SOC 2 CC6.2, ISO 27001 A.7.3'),

('Customer Cage Segregation', 'access_control', 'preventive', 'datacenter',
 'Physical separation of customer equipment in locked cages with customer-specific access. Prevents cross-customer access in multi-tenant environments.',
 0.35, 0.30, 'medium', 'low', false, true, true, 'SOC 2 CC6.4, PCI-DSS 9.1'),

('Two-Person Integrity Rule', 'access_control', 'preventive', 'datacenter',
 'Requirement for two authorized personnel when accessing critical infrastructure (electrical, fire suppression). Prevents single-person sabotage opportunity.',
 0.35, 0.30, 'low', 'low', true, false, true, 'NIST SP 800-53, TIA-942'),

('Badge-In/Badge-Out System', 'access_control', 'detective', 'datacenter',
 'Access system requiring badge presentation at both entry and exit. Enables real-time occupancy tracking and identifies credential lending.',
 0.30, 0.26, 'medium', 'medium', true, true, true, 'PCI-DSS 9.1.1, SOC 2'),

('PIN Code Secondary Authentication', 'access_control', 'preventive', 'datacenter',
 'Personal identification number required in addition to badge for high-security areas. Knowledge factor prevents use of stolen/lost credentials.',
 0.28, 0.25, 'low', 'low', true, true, true, 'SOC 2 CC6.1, PCI-DSS 8.3'),

-- ============================================================================
-- SURVEILLANCE & MONITORING (9 controls)
-- PCI-DSS: 90-day retention, hands-on-servers coverage
-- ============================================================================

('Comprehensive CCTV Coverage', 'surveillance', 'detective', 'datacenter',
 '100% camera coverage of all datacenter areas including entry points, corridors, and datacenter floor. Minimum 720p resolution with 30-day retention baseline.',
 0.40, 0.35, 'high', 'medium', false, true, true, 'TIA-942 Section 5.5, SOC 2'),

('Hands-On-Servers Camera Coverage', 'surveillance', 'detective', 'datacenter',
 'Camera positioning that captures activity at server cabinet level. Essential for forensic investigation of equipment tampering or data theft. PCI-DSS requirement.',
 0.42, 0.38, 'high', 'medium', false, true, true, 'PCI-DSS 9.1, SOC 2 CC6.4'),

('90-Day Video Retention', 'surveillance', 'detective', 'datacenter',
 'Minimum 90-day video retention for all datacenter areas. PCI-DSS mandatory requirement. Enables forensic investigation of security incidents.',
 0.35, 0.30, 'medium', 'medium', false, true, true, 'PCI-DSS 9.1.1, SOC 2'),

('Video Analytics System', 'surveillance', 'detective', 'datacenter',
 'AI-powered video analytics for automated detection of loitering, tailgating, unusual behavior. Reduces operator fatigue and improves detection rates.',
 0.32, 0.28, 'high', 'medium', true, true, true, 'Industry Best Practice'),

('NOC/SOC Operations Center', 'surveillance', 'detective', 'datacenter',
 '24/7 staffed Network/Security Operations Center for real-time monitoring of all security systems. Single pane of glass for alarms, video, and access control.',
 0.48, 0.42, 'high', 'low', true, false, true, 'SOC 2 CC7.2, Uptime Institute'),

('Central Alarm Monitoring', 'surveillance', 'detective', 'datacenter',
 'All security alarms (intrusion, fire, environmental) monitored by NOC/SOC with documented response procedures. Escalation protocols defined.',
 0.40, 0.35, 'medium', 'low', true, true, true, 'SOC 2 CC7.2, TIA-942'),

('Environmental Sensor Network', 'surveillance', 'detective', 'datacenter',
 'Distributed sensors monitoring temperature, humidity, water, and air quality throughout datacenter. Integration with BMS and alarm systems.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'ASHRAE, TIA-942 Section 10'),

('Real-Time Monitoring Dashboard', 'surveillance', 'detective', 'datacenter',
 'Unified dashboard displaying all critical metrics: security events, environmental conditions, power status, and system health. Executive visibility.',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'Industry Best Practice'),

('Incident Recording System', 'surveillance', 'detective', 'datacenter',
 'System for documenting all security incidents, response actions, and outcomes. Enables trend analysis and continuous improvement. SOC 2 evidence.',
 0.25, 0.22, 'low', 'low', true, false, true, 'SOC 2 CC7.3, ISO 27001'),

-- ============================================================================
-- POWER INFRASTRUCTURE SECURITY (10 controls)
-- Uptime Institute: Tier III = N+1, Tier IV = 2N redundancy
-- Average downtime cost: $9,000/minute
-- ============================================================================

('Redundant Utility Feeds', 'power_infrastructure', 'preventive', 'datacenter',
 'Dual utility feeds from separate substations/grids. Eliminates single point of failure from utility provider. Required for Tier III+ facilities.',
 0.48, 0.42, 'high', 'low', false, true, true, 'Uptime Institute Tier III+, TIA-942'),

('UPS N+1 Redundancy', 'power_infrastructure', 'preventive', 'datacenter',
 'Uninterruptible Power Supply with N+1 redundancy - one more module than needed for full load. Enables maintenance without downtime. Tier III baseline.',
 0.45, 0.40, 'high', 'medium', true, true, true, 'Uptime Institute, TIA-942 Section 8'),

('Automatic Transfer Switch', 'power_infrastructure', 'preventive', 'datacenter',
 'Automatic transfer to generator power within 10 seconds of utility failure. Seamless transition during UPS runtime. Regular testing required.',
 0.42, 0.38, 'medium', 'medium', true, true, true, 'NFPA 110, TIA-942 Section 8'),

('72-Hour Generator Fuel Capacity', 'power_infrastructure', 'preventive', 'datacenter',
 'On-site fuel storage for minimum 72 hours of generator operation at full load. Protects against extended utility outages. Fuel contracts for emergency delivery.',
 0.40, 0.35, 'high', 'medium', false, true, true, 'Uptime Institute Tier III+'),

('Secure Fuel Storage', 'power_infrastructure', 'preventive', 'datacenter',
 'Fuel tanks in secured area with spill containment, monitoring for theft/leaks, and fire protection. Prevents sabotage of fuel supply.',
 0.32, 0.28, 'medium', 'medium', true, true, true, 'NFPA 30, TIA-942'),

('EPO Button Protection', 'power_infrastructure', 'preventive', 'datacenter',
 'Emergency Power Off buttons protected with covers, dual-action switches, or relocated to secure locations. Prevents accidental or malicious activation.',
 0.38, 0.32, 'low', 'low', true, false, true, 'TIA-942 Section 8.3, NFPA 70'),

('Electrical Room Access Control', 'power_infrastructure', 'preventive', 'datacenter',
 'Restricted access to electrical rooms with badge/biometric authentication. Separate from general datacenter access. Audit logging required.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'SOC 2 CC6.4, TIA-942'),

('Power Monitoring System', 'power_infrastructure', 'detective', 'datacenter',
 'Real-time monitoring of all power infrastructure: utility status, UPS load/battery, generator status. Alerts for anomalies and predictive maintenance.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'TIA-942, Industry Best Practice'),

('Generator Testing Program', 'power_infrastructure', 'preventive', 'datacenter',
 'Monthly generator testing under load. Annual full-failover test. Documented maintenance program per manufacturer specifications.',
 0.30, 0.26, 'low', 'medium', true, false, true, 'NFPA 110, Uptime Institute'),

('Battery Monitoring System', 'power_infrastructure', 'detective', 'datacenter',
 'Continuous monitoring of UPS battery health: voltage, temperature, impedance. Early warning of degradation enables proactive replacement.',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'IEEE 1188, TIA-942'),

-- ============================================================================
-- COOLING & ENVIRONMENTAL CONTROLS (8 controls)
-- ASHRAE: 64.4°F-80.6°F server inlet temperature
-- ============================================================================

('Cooling System Redundancy', 'cooling_environmental', 'preventive', 'datacenter',
 'N+1 or greater redundancy for cooling systems (CRAC/CRAH, chillers). Enables maintenance without thermal risk. Required for Tier III+ facilities.',
 0.45, 0.40, 'high', 'medium', true, true, true, 'Uptime Institute, TIA-942 Section 9'),

('Temperature/Humidity Monitoring', 'cooling_environmental', 'detective', 'datacenter',
 'Distributed sensors monitoring temperature and humidity at cabinet inlet level. ASHRAE guidelines: 64.4-80.6°F, 20-80% RH. Real-time alerts.',
 0.38, 0.32, 'medium', 'medium', true, true, true, 'ASHRAE A1-A4, TIA-942'),

('Water Leak Detection System', 'cooling_environmental', 'detective', 'datacenter',
 'Rope sensors or spot detectors under raised floor and near cooling units. Water leaks from cooling systems are leading cause of datacenter damage.',
 0.40, 0.35, 'medium', 'medium', true, true, true, 'NFPA 75, TIA-942 Section 10'),

('Chiller Plant Security', 'cooling_environmental', 'preventive', 'datacenter',
 'Physical security for external chiller plant including fencing, CCTV, and tamper alarms. Prevents sabotage of cooling infrastructure.',
 0.35, 0.30, 'medium', 'medium', false, true, true, 'TIA-942, Industry Best Practice'),

('Hot/Cold Aisle Containment', 'cooling_environmental', 'preventive', 'datacenter',
 'Physical containment separating hot exhaust air from cold supply air. Improves cooling efficiency 30-40% and enables higher density.',
 0.25, 0.22, 'medium', 'low', false, true, true, 'ASHRAE, TIA-942'),

('Environmental Contamination Protection', 'cooling_environmental', 'preventive', 'datacenter',
 'Air filtration, positive pressure, and contamination monitoring. Protects equipment from dust, corrosive gases, and particulates.',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'ASHRAE, ISO 14644'),

('CRAC/CRAH Unit Monitoring', 'cooling_environmental', 'detective', 'datacenter',
 'Real-time monitoring of all cooling units: operating status, temperature differential, airflow, and filter status. Predictive maintenance alerts.',
 0.30, 0.26, 'medium', 'medium', true, true, true, 'TIA-942, Industry Best Practice'),

('Cooling Plant Alarm System', 'cooling_environmental', 'detective', 'datacenter',
 'Alarms for cooling system failures, high temperature conditions, and chiller trips. Escalation to NOC/SOC with defined response procedures.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'TIA-942, SOC 2'),

-- ============================================================================
-- FIRE SUPPRESSION & LIFE SAFETY (8 controls)
-- NFPA 75/76: Clean agents preferred, water damages electronics
-- ============================================================================

('VESDA Early Warning Detection', 'fire_suppression', 'detective', 'datacenter',
 'Very Early Smoke Detection Apparatus using air sampling. Detects smoke at pre-combustion stage. Provides maximum response time. Standard for Tier III+.',
 0.45, 0.40, 'high', 'medium', true, true, true, 'NFPA 75/76, TIA-942 Section 10'),

('Clean Agent Fire Suppression', 'fire_suppression', 'preventive', 'datacenter',
 'Gaseous fire suppression (FM-200, Novec 1230, Inergen) that extinguishes fire without damaging electronics. Does not require equipment replacement after discharge.',
 0.48, 0.42, 'high', 'medium', true, true, true, 'NFPA 75/76, TIA-942'),

('Zoned Fire Suppression', 'fire_suppression', 'preventive', 'datacenter',
 'Fire suppression zones limiting discharge to affected area. Prevents unnecessary full-facility discharge and reduces business impact.',
 0.35, 0.30, 'high', 'low', true, true, true, 'NFPA 75, TIA-942'),

('Manual Release Protection', 'fire_suppression', 'preventive', 'datacenter',
 'Manual fire suppression release buttons protected with covers, key locks, or relocated to secure locations. Prevents malicious activation.',
 0.32, 0.28, 'low', 'low', true, false, true, 'NFPA 72, TIA-942'),

('Fire System Central Monitoring', 'fire_suppression', 'detective', 'datacenter',
 'All fire detection and suppression systems monitored by NOC/SOC with defined response procedures. Automatic notification to fire department.',
 0.38, 0.32, 'medium', 'low', true, true, true, 'NFPA 72, SOC 2'),

('Quarterly Fire System Testing', 'fire_suppression', 'preventive', 'datacenter',
 'Quarterly testing of fire detection and suppression per NFPA 72 and 25. Documented results with deficiency tracking and remediation.',
 0.30, 0.26, 'medium', 'medium', true, false, true, 'NFPA 72, NFPA 25'),

('Fire Extinguisher Program', 'fire_suppression', 'preventive', 'datacenter',
 'Properly placed and maintained portable fire extinguishers. Annual inspections. Employee training on proper use. CO2 or clean agent type for electronics.',
 0.20, 0.18, 'low', 'medium', true, true, true, 'NFPA 10, OSHA'),

('Emergency Lighting System', 'fire_suppression', 'preventive', 'datacenter',
 'Battery-backed emergency lighting throughout datacenter for evacuation. Minimum 90-minute runtime. Monthly testing required.',
 0.18, 0.15, 'low', 'medium', false, true, true, 'NFPA 101, IBC'),

-- ============================================================================
-- PERSONNEL SECURITY & TRAINING (8 controls)
-- FBI: 60%+ of sabotage involves insiders
-- ============================================================================

('Comprehensive Background Checks', 'personnel_security', 'preventive', 'datacenter',
 'Pre-employment background verification including criminal history, employment verification, and education verification. Required for all datacenter access. FBI: 60%+ sabotage involves insiders.',
 0.42, 0.38, 'low', 'low', false, false, true, 'SOC 2 CC1.4, PCI-DSS 12.7'),

('Annual Security Training', 'personnel_security', 'preventive', 'datacenter',
 'Mandatory annual security awareness training covering physical security, insider threat, social engineering, and incident reporting. Documented completion.',
 0.28, 0.25, 'low', 'medium', true, false, true, 'SOC 2 CC2.2, ISO 27001 A.7.2'),

('Contractor Vetting Program', 'personnel_security', 'preventive', 'datacenter',
 'Background verification and security requirements for all contractors with datacenter access. NDA requirements. Supervision or escort requirements.',
 0.32, 0.28, 'low', 'low', true, false, true, 'SOC 2 CC1.4, ISO 27001'),

('Termination Procedures', 'personnel_security', 'preventive', 'datacenter',
 'Documented procedures for employee termination including immediate credential revocation, property return, and exit interview. Same-day access removal critical.',
 0.38, 0.32, 'low', 'low', true, false, true, 'SOC 2 CC6.2, ISO 27001 A.7.3'),

('Incident Response Plan', 'personnel_security', 'detective', 'datacenter',
 'Documented incident response procedures covering security breaches, physical intrusion, fire, power failure, and environmental events. Regular testing.',
 0.35, 0.30, 'low', 'medium', true, false, true, 'SOC 2 CC7.4, ISO 27001 A.16'),

('Tool Control System', 'personnel_security', 'preventive', 'datacenter',
 'Check-out system for tools that could be used for equipment theft or sabotage. Inventory tracking and accountability. Prevents insider equipment theft.',
 0.25, 0.22, 'low', 'low', true, false, true, 'Industry Best Practice'),

('Media Destruction Program', 'personnel_security', 'preventive', 'datacenter',
 'Documented procedures for secure destruction of storage media. On-site shredding or degaussing. Certificate of destruction. PCI-DSS requirement.',
 0.30, 0.26, 'medium', 'low', true, false, true, 'PCI-DSS 9.8, NIST SP 800-88'),

('Security Clearance Verification', 'personnel_security', 'preventive', 'datacenter',
 'For government or classified facilities: verification of security clearance level. Access restricted to clearance-appropriate areas.',
 0.35, 0.30, 'low', 'low', false, false, true, 'NISPOM, FedRAMP'),

-- ============================================================================
-- COMPLIANCE & AUDIT (5 controls)
-- SOC 2, ISO 27001, PCI-DSS requirements
-- ============================================================================

('SOC 2 Type II Certification', 'compliance', 'preventive', 'datacenter',
 'Annual SOC 2 Type II audit validating security controls over 6+ month period. Trust Services Criteria for security, availability, and confidentiality.',
 0.45, 0.40, 'high', 'low', true, false, true, 'AICPA SOC 2'),

('ISO 27001 Certification', 'compliance', 'preventive', 'datacenter',
 'ISO 27001 Information Security Management System certification. Demonstrates comprehensive security management framework. Annual surveillance audits.',
 0.42, 0.38, 'high', 'low', true, false, true, 'ISO/IEC 27001:2022'),

('PCI-DSS Compliance', 'compliance', 'preventive', 'datacenter',
 'Payment Card Industry Data Security Standard compliance for facilities processing cardholder data. Annual assessment and quarterly network scans.',
 0.40, 0.35, 'high', 'medium', true, false, true, 'PCI-DSS v4.0'),

('Quarterly Security Audits', 'compliance', 'detective', 'datacenter',
 'Internal security audits quarterly reviewing access logs, CCTV coverage, environmental conditions, and procedure compliance. Documented findings and remediation.',
 0.32, 0.28, 'low', 'medium', true, false, true, 'SOC 2, ISO 27001'),

('Annual Penetration Testing', 'compliance', 'detective', 'datacenter',
 'Annual physical and logical penetration testing by qualified third party. Tests physical security, social engineering, and network security. Required for PCI-DSS.',
 0.35, 0.30, 'high', 'low', false, false, true, 'PCI-DSS 11.3, ISO 27001');

-- ============================================================================
-- CONTROL-THREAT MAPPING TABLE
-- Maps controls to the 15 datacenter threats with effectiveness ratings
-- ============================================================================

-- First, clean up any existing datacenter control-threat mappings
DELETE FROM control_threat_mapping WHERE threat_id IN (
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
  'environmental_contamination'
);

-- Create control-threat mapping table if not exists
-- (This may already exist from other facility types)
CREATE TABLE IF NOT EXISTS control_threat_mapping (
  id SERIAL PRIMARY KEY,
  control_name VARCHAR(255) NOT NULL,
  threat_id VARCHAR(100) NOT NULL,
  effectiveness_rating INTEGER NOT NULL CHECK (effectiveness_rating BETWEEN 1 AND 5),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(control_name, threat_id)
);

-- Insert control-threat mappings
INSERT INTO control_threat_mapping (control_name, threat_id, effectiveness_rating, is_primary) VALUES

-- Unauthorized Physical Access
('High Security Perimeter Fencing', 'unauthorized_physical_access', 5, true),
('Perimeter Intrusion Detection System', 'unauthorized_physical_access', 5, true),
('Guard Checkpoint', 'unauthorized_physical_access', 5, true),
('Biometric Authentication', 'unauthorized_physical_access', 5, true),
('Multi-Factor Access Control', 'unauthorized_physical_access', 5, true),
('Man-Trap Portal Entry', 'unauthorized_physical_access', 5, true),
('Perimeter CCTV Array', 'unauthorized_physical_access', 4, false),
('Security Patrol 24/7', 'unauthorized_physical_access', 4, false),
('Perimeter Lighting System', 'unauthorized_physical_access', 3, false),
('NOC/SOC Operations Center', 'unauthorized_physical_access', 4, false),

-- Insider Threat - Privileged Access
('Comprehensive Background Checks', 'insider_threat_privileged_access', 5, true),
('Two-Person Integrity Rule', 'insider_threat_privileged_access', 5, true),
('Quarterly Access Reviews', 'insider_threat_privileged_access', 5, true),
('Immediate Access Revocation', 'insider_threat_privileged_access', 5, true),
('Hands-On-Servers Camera Coverage', 'insider_threat_privileged_access', 5, true),
('Access Logging and Audit', 'insider_threat_privileged_access', 4, true),
('Cabinet-Level Electronic Locks', 'insider_threat_privileged_access', 4, false),
('Annual Security Training', 'insider_threat_privileged_access', 3, false),
('Tool Control System', 'insider_threat_privileged_access', 4, false),
('Termination Procedures', 'insider_threat_privileged_access', 5, false),

-- Tailgating / Man-trap Bypass
('Man-Trap Portal Entry', 'tailgating_mantrap_bypass', 5, true),
('Anti-Tailgating Detection', 'tailgating_mantrap_bypass', 5, true),
('Biometric Authentication', 'tailgating_mantrap_bypass', 4, true),
('Badge-In/Badge-Out System', 'tailgating_mantrap_bypass', 4, true),
('Comprehensive CCTV Coverage', 'tailgating_mantrap_bypass', 4, false),
('Security Patrol 24/7', 'tailgating_mantrap_bypass', 3, false),
('Annual Security Training', 'tailgating_mantrap_bypass', 3, false),
('NOC/SOC Operations Center', 'tailgating_mantrap_bypass', 3, false),

-- Power Failure - Extended Outage
('Redundant Utility Feeds', 'power_failure_extended', 5, true),
('UPS N+1 Redundancy', 'power_failure_extended', 5, true),
('Automatic Transfer Switch', 'power_failure_extended', 5, true),
('72-Hour Generator Fuel Capacity', 'power_failure_extended', 5, true),
('Generator Testing Program', 'power_failure_extended', 4, true),
('Battery Monitoring System', 'power_failure_extended', 4, false),
('Power Monitoring System', 'power_failure_extended', 4, false),
('Secure Fuel Storage', 'power_failure_extended', 4, false),
('NOC/SOC Operations Center', 'power_failure_extended', 3, false),

-- Cooling Failure - Thermal Event
('Cooling System Redundancy', 'cooling_failure_thermal_event', 5, true),
('Temperature/Humidity Monitoring', 'cooling_failure_thermal_event', 5, true),
('CRAC/CRAH Unit Monitoring', 'cooling_failure_thermal_event', 4, true),
('Cooling Plant Alarm System', 'cooling_failure_thermal_event', 4, true),
('Hot/Cold Aisle Containment', 'cooling_failure_thermal_event', 3, false),
('Chiller Plant Security', 'cooling_failure_thermal_event', 3, false),
('NOC/SOC Operations Center', 'cooling_failure_thermal_event', 4, false),
('Environmental Sensor Network', 'cooling_failure_thermal_event', 4, false),

-- Fire - Equipment Damage
('VESDA Early Warning Detection', 'fire_equipment_damage', 5, true),
('Clean Agent Fire Suppression', 'fire_equipment_damage', 5, true),
('Zoned Fire Suppression', 'fire_equipment_damage', 4, true),
('Fire System Central Monitoring', 'fire_equipment_damage', 4, true),
('Quarterly Fire System Testing', 'fire_equipment_damage', 4, false),
('Manual Release Protection', 'fire_equipment_damage', 4, false),
('Fire Extinguisher Program', 'fire_equipment_damage', 3, false),
('Emergency Lighting System', 'fire_equipment_damage', 2, false),

-- Water Intrusion - Damage
('Water Leak Detection System', 'water_intrusion_damage', 5, true),
('Environmental Sensor Network', 'water_intrusion_damage', 5, true),
('Cooling Plant Alarm System', 'water_intrusion_damage', 4, false),
('NOC/SOC Operations Center', 'water_intrusion_damage', 4, false),
('Incident Response Plan', 'water_intrusion_damage', 3, false),
('Real-Time Monitoring Dashboard', 'water_intrusion_damage', 3, false),

-- Theft - Equipment/Components
('Cabinet-Level Electronic Locks', 'theft_equipment_components', 5, true),
('Hands-On-Servers Camera Coverage', 'theft_equipment_components', 5, true),
('Comprehensive Background Checks', 'theft_equipment_components', 4, true),
('Access Logging and Audit', 'theft_equipment_components', 4, true),
('Customer Cage Segregation', 'theft_equipment_components', 4, false),
('90-Day Video Retention', 'theft_equipment_components', 4, false),
('Tool Control System', 'theft_equipment_components', 4, false),
('Visitor Management System', 'theft_equipment_components', 3, false),
('Two-Person Integrity Rule', 'theft_equipment_components', 4, false),

-- Sabotage - Infrastructure
('EPO Button Protection', 'sabotage_infrastructure', 5, true),
('Manual Release Protection', 'sabotage_infrastructure', 5, true),
('Two-Person Integrity Rule', 'sabotage_infrastructure', 5, true),
('Comprehensive Background Checks', 'sabotage_infrastructure', 5, true),
('Electrical Room Access Control', 'sabotage_infrastructure', 4, true),
('Hands-On-Servers Camera Coverage', 'sabotage_infrastructure', 4, false),
('Immediate Access Revocation', 'sabotage_infrastructure', 5, false),
('NOC/SOC Operations Center', 'sabotage_infrastructure', 4, false),
('Secure Fuel Storage', 'sabotage_infrastructure', 4, false),
('Chiller Plant Security', 'sabotage_infrastructure', 4, false),

-- Cyber-Physical Attack
('Biometric Authentication', 'cyber_physical_attack', 4, true),
('Multi-Factor Access Control', 'cyber_physical_attack', 5, true),
('Access Logging and Audit', 'cyber_physical_attack', 4, true),
('NOC/SOC Operations Center', 'cyber_physical_attack', 5, true),
('Video Analytics System', 'cyber_physical_attack', 4, false),
('Annual Penetration Testing', 'cyber_physical_attack', 4, false),
('Quarterly Security Audits', 'cyber_physical_attack', 3, false),
('Incident Response Plan', 'cyber_physical_attack', 4, false),

-- Social Engineering Entry
('Visitor Management System', 'social_engineering_entry', 5, true),
('Escort Requirements', 'social_engineering_entry', 5, true),
('Annual Security Training', 'social_engineering_entry', 5, true),
('Guard Checkpoint', 'social_engineering_entry', 4, true),
('Biometric Authentication', 'social_engineering_entry', 4, false),
('Contractor Vetting Program', 'social_engineering_entry', 4, false),
('Badge-In/Badge-Out System', 'social_engineering_entry', 3, false),
('Hands-On-Servers Camera Coverage', 'social_engineering_entry', 3, false),

-- Terrorism - Vehicle-Borne
('K-Rated Vehicle Barriers', 'terrorism_vehicle_borne', 5, true),
('Standoff Distance Enforcement', 'terrorism_vehicle_borne', 5, true),
('Vehicle Screening Area', 'terrorism_vehicle_borne', 5, true),
('Guard Checkpoint', 'terrorism_vehicle_borne', 4, true),
('Perimeter CCTV Array', 'terrorism_vehicle_borne', 4, false),
('Security Patrol 24/7', 'terrorism_vehicle_borne', 3, false),
('Perimeter Intrusion Detection System', 'terrorism_vehicle_borne', 3, false),
('High Security Perimeter Fencing', 'terrorism_vehicle_borne', 3, false),

-- Natural Disaster Impact
('Redundant Utility Feeds', 'natural_disaster_impact', 4, true),
('72-Hour Generator Fuel Capacity', 'natural_disaster_impact', 5, true),
('Cooling System Redundancy', 'natural_disaster_impact', 4, true),
('Water Leak Detection System', 'natural_disaster_impact', 4, false),
('Environmental Sensor Network', 'natural_disaster_impact', 4, false),
('Incident Response Plan', 'natural_disaster_impact', 5, false),
('UPS N+1 Redundancy', 'natural_disaster_impact', 4, false),

-- Vendor/Contractor Breach
('Contractor Vetting Program', 'vendor_contractor_breach', 5, true),
('Escort Requirements', 'vendor_contractor_breach', 5, true),
('Visitor Management System', 'vendor_contractor_breach', 4, true),
('Comprehensive Background Checks', 'vendor_contractor_breach', 4, true),
('Hands-On-Servers Camera Coverage', 'vendor_contractor_breach', 4, false),
('Access Logging and Audit', 'vendor_contractor_breach', 4, false),
('90-Day Video Retention', 'vendor_contractor_breach', 4, false),
('Cabinet-Level Electronic Locks', 'vendor_contractor_breach', 3, false),

-- Environmental Contamination
('Environmental Contamination Protection', 'environmental_contamination', 5, true),
('Environmental Sensor Network', 'environmental_contamination', 5, true),
('Hot/Cold Aisle Containment', 'environmental_contamination', 3, false),
('Temperature/Humidity Monitoring', 'environmental_contamination', 3, false),
('Real-Time Monitoring Dashboard', 'environmental_contamination', 3, false),
('NOC/SOC Operations Center', 'environmental_contamination', 3, false);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count controls by category
SELECT 'Datacenter controls by category:' as info;
SELECT category, COUNT(*) as count 
FROM controls 
WHERE facility_type = 'datacenter'
GROUP BY category
ORDER BY count DESC;

-- Count total controls
SELECT 'Total datacenter controls: ' || COUNT(*) as result 
FROM controls 
WHERE facility_type = 'datacenter';

-- Count control-threat mappings for datacenter threats
SELECT 'Total datacenter control-threat mappings: ' || COUNT(*) as result 
FROM control_threat_mapping
WHERE threat_id IN (
  'unauthorized_physical_access', 'insider_threat_privileged_access',
  'tailgating_mantrap_bypass', 'power_failure_extended',
  'cooling_failure_thermal_event', 'fire_equipment_damage',
  'water_intrusion_damage', 'theft_equipment_components',
  'sabotage_infrastructure', 'cyber_physical_attack',
  'social_engineering_entry', 'terrorism_vehicle_borne',
  'natural_disaster_impact', 'vendor_contractor_breach',
  'environmental_contamination'
);

-- Show controls by standards reference
SELECT 'Controls with Uptime Institute references:' as info;
SELECT name, standards_reference 
FROM controls 
WHERE facility_type = 'datacenter' AND standards_reference LIKE '%Uptime%'
ORDER BY name;

-- Show controls with SOC 2 references
SELECT 'Controls with SOC 2 references:' as info;
SELECT name, standards_reference 
FROM controls 
WHERE facility_type = 'datacenter' AND standards_reference LIKE '%SOC 2%'
ORDER BY name;

-- ============================================================================
-- SAMPLE QUERIES FOR APPLICATION USE
-- ============================================================================

/*
-- Get all controls for a specific datacenter threat
SELECT c.name, c.category, c.control_type, c.reduction_percentage, ctm.effectiveness_rating, ctm.is_primary
FROM controls c
JOIN control_threat_mapping ctm ON c.name = ctm.control_name
WHERE ctm.threat_id = 'power_failure_extended'
ORDER BY ctm.is_primary DESC, ctm.effectiveness_rating DESC;

-- Get recommended controls for multiple threats
SELECT DISTINCT c.name, c.category, c.estimated_cost, 
       MAX(ctm.effectiveness_rating) as max_effectiveness,
       COUNT(DISTINCT ctm.threat_id) as threats_addressed
FROM controls c
JOIN control_threat_mapping ctm ON c.name = ctm.control_name
WHERE ctm.threat_id IN ('unauthorized_physical_access', 'insider_threat_privileged_access', 'sabotage_infrastructure')
GROUP BY c.name, c.category, c.estimated_cost
ORDER BY threats_addressed DESC, max_effectiveness DESC;

-- Get Tier III required controls (SOC 2 + high availability)
SELECT name, category, standards_reference, estimated_cost
FROM controls
WHERE facility_type = 'datacenter' 
  AND (standards_reference LIKE '%SOC 2%' OR standards_reference LIKE '%Uptime%')
ORDER BY category, name;

-- Get compliance-critical controls
SELECT name, category, standards_reference
FROM controls
WHERE facility_type = 'datacenter'
  AND (standards_reference LIKE '%PCI-DSS%' OR standards_reference LIKE '%SOC 2%' OR standards_reference LIKE '%ISO 27001%')
ORDER BY standards_reference, name;

-- Calculate theoretical maximum risk reduction for a threat
SELECT ctm.threat_id,
       SUM(c.reduction_percentage * CASE WHEN ctm.is_primary THEN 1.0 ELSE 0.5 END) as max_reduction
FROM controls c
JOIN control_threat_mapping ctm ON c.name = ctm.control_name
WHERE ctm.threat_id = 'power_failure_extended'
GROUP BY ctm.threat_id;

-- Get high-cost vs low-cost control options for budgeting
SELECT estimated_cost, COUNT(*) as control_count,
       ARRAY_AGG(name ORDER BY name) as controls
FROM controls
WHERE facility_type = 'datacenter'
GROUP BY estimated_cost
ORDER BY 
  CASE estimated_cost 
    WHEN 'low' THEN 1 
    WHEN 'medium' THEN 2 
    WHEN 'high' THEN 3 
  END;
*/

-- ============================================================================
-- END OF DATACENTER CONTROLS SEED
-- ============================================================================
