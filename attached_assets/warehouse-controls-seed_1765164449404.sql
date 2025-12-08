-- ============================================================================
-- WAREHOUSE & DISTRIBUTION CENTER SECURITY CONTROLS
-- Complete seed file for RiskFixer
-- 
-- 65+ controls organized by category:
-- - Perimeter & Yard Security (12 controls)
-- - Loading Dock Security (10 controls)
-- - Inventory Control (9 controls)
-- - Personnel & Access Control (10 controls)
-- - Vehicle & Fleet Security (7 controls)
-- - Surveillance & Monitoring (8 controls)
-- - Emergency Response (6 controls)
-- - Environmental Design (3 controls)
-- 
-- Standards References:
-- - TAPA FSR (Facility Security Requirements) Level A/B/C
-- - TAPA TSR (Trucking Security Requirements)
-- - ISO 28000 (Supply Chain Security Management)
-- - C-TPAT (Customs-Trade Partnership Against Terrorism)
-- - CargoNet Theft Prevention Best Practices
-- - ASIS GDL-RA (General Security Risk Assessment)
-- 
-- @author RiskFixer Team
-- @version 1.0
-- ============================================================================

-- Clean up any existing warehouse controls to prevent duplicates
DELETE FROM controls WHERE facility_type = 'warehouse';

-- Also clean by name to catch any miscategorized controls
DELETE FROM controls WHERE name IN (
  -- Perimeter & Yard
  'High Security Fencing', 'Fence Intrusion Detection', 'Perimeter CCTV Coverage',
  'Yard Lighting System', 'Vehicle Gate Control', 'Guard House Checkpoint',
  'Trailer King Pin Locks', 'Trailer Landing Gear Locks', 'Yard Management System',
  'Clear Zone Maintenance', 'Perimeter Patrol Program', 'Yard CCTV Coverage',
  -- Loading Dock
  'Dock CCTV Coverage', 'Dock Door Sensors', 'Dock Scheduling System',
  'Trailer Seal Verification', 'Dock Leveler Locks', 'Dock Intrusion Alarm',
  'Driver Waiting Area', 'Dock Access Control', 'Outbound Verification Process',
  'Dock Appointment System',
  -- Inventory Control
  'Warehouse Management System (WMS)', 'RFID Inventory Tracking', 'Real-Time Inventory Visibility',
  'Cycle Counting Program', 'High-Value Caging', 'Exception-Based Reporting',
  'Lot/Serial Number Tracking', 'Two-Person Rule (High-Value)', 'Inventory Reconciliation Process',
  -- Personnel & Access
  'Employee Background Checks', 'Driver Background Checks', 'Badge Access System',
  'Visitor Management System', 'Driver Check-In Procedures', 'Security Awareness Training',
  'Theft Reporting Hotline', 'Insider Threat Program', 'Contractor Vetting Program',
  'Temporary Worker Screening',
  -- Fleet Security
  'GPS Fleet Tracking', 'Vehicle Immobilizers', 'Two-Driver Rule (High-Value)',
  'Fuel Theft Prevention', 'Geofencing Alerts', 'Covert Tracking Devices',
  'Fleet Key Control System',
  -- Surveillance
  'Interior Warehouse CCTV', 'High-Value Area Cameras', 'Video Analytics System',
  'Video Retention (30+ Days)', 'Real-Time Monitoring Center', 'License Plate Recognition',
  'Thermal Imaging Cameras', 'Mobile Surveillance Units',
  -- Emergency Response
  'Cargo Theft Response Plan', 'Documented Security Procedures', 'Key Control System',
  'Alarm Response Procedures', 'Security Drill Program', 'Law Enforcement Partnership',
  -- Environmental
  'CPTED Principles - Warehouse', 'Adequate Interior Lighting', 'Signage - Monitored Facility'
);

-- ============================================================================
-- PERIMETER & YARD SECURITY (12 controls)
-- TAPA FSR Level A requires comprehensive perimeter protection
-- ============================================================================

INSERT INTO controls (
  name, category, control_type, facility_type, description, 
  base_weight, reduction_percentage, estimated_cost, maintenance_level, 
  requires_training, requires_maintenance, is_active, tapa_reference
) VALUES

('High Security Fencing', 'perimeter_security', 'preventive', 'warehouse',
 'Minimum 8-foot chain link fence with 3-strand barbed wire or razor wire topping. TAPA FSR Level A requires this as baseline perimeter protection for cargo facilities.',
 0.40, 0.35, 'medium', 'medium', false, true, true, 'TAPA FSR 1.3.1'),

('Fence Intrusion Detection', 'perimeter_security', 'detective', 'warehouse',
 'Sensor system detecting fence climbing, cutting, or lifting attempts. Options include vibration sensors, taut wire, or fiber optic detection. Provides early warning of perimeter breach.',
 0.35, 0.30, 'high', 'medium', true, true, true, 'TAPA FSR 1.3.2'),

('Perimeter CCTV Coverage', 'perimeter_security', 'detective', 'warehouse',
 '100% camera coverage of perimeter fence line with no blind spots. TAPA Level A requires full coverage with minimum 30-day retention. Night vision or IR capability required.',
 0.38, 0.32, 'high', 'medium', true, true, true, 'TAPA FSR 3.3.1'),

('Yard Lighting System', 'perimeter_security', 'deterrent', 'warehouse',
 'Comprehensive exterior lighting for yard, parking, and perimeter areas. ASIS guidelines: minimum 10 lux at fence line, 50 lux at access points, 100 lux at loading docks.',
 0.25, 0.22, 'medium', 'medium', false, true, true, 'ASIS POA'),

('Vehicle Gate Control', 'perimeter_security', 'preventive', 'warehouse',
 'Controlled vehicle entry/exit points with automated gates, barriers, or guard-operated access. Prevents unauthorized vehicle access to yard and dock areas.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'TAPA FSR 1.5.1'),

('Guard House Checkpoint', 'perimeter_security', 'preventive', 'warehouse',
 'Manned guard station at primary vehicle entry controlling access, verifying credentials, and logging all vehicle movements. TAPA Level A requires 24/7 staffing.',
 0.42, 0.38, 'high', 'low', true, false, true, 'TAPA FSR 1.4.1'),

('Trailer King Pin Locks', 'perimeter_security', 'preventive', 'warehouse',
 'Mechanical locks preventing trailer from being connected to unauthorized tractor. Critical for preventing yard trailer theft. Should be applied to all staged trailers.',
 0.32, 0.28, 'low', 'low', true, true, true, 'CargoNet'),

('Trailer Landing Gear Locks', 'perimeter_security', 'preventive', 'warehouse',
 'Locks preventing landing gear from being raised, immobilizing unattended trailers. Used in conjunction with king pin locks for comprehensive trailer security.',
 0.28, 0.25, 'low', 'low', true, true, true, 'CargoNet'),

('Yard Management System', 'perimeter_security', 'detective', 'warehouse',
 'Software system tracking all trailer locations, movements, and status within the yard. Enables real-time visibility of yard assets and rapid identification of missing trailers.',
 0.30, 0.26, 'medium', 'medium', true, true, true, 'TAPA FSR'),

('Clear Zone Maintenance', 'perimeter_security', 'deterrent', 'warehouse',
 'Maintained clear zone (minimum 3 meters) on both sides of perimeter fence free of vegetation, materials, or objects that could aid climbing or concealment.',
 0.18, 0.15, 'low', 'medium', false, true, true, 'TAPA FSR 1.3.3'),

('Perimeter Patrol Program', 'perimeter_security', 'detective', 'warehouse',
 'Regular security patrols of perimeter fence, gates, and yard areas. Can be guard-based or mobile patrol. Documented patrol routes and checkpoints.',
 0.28, 0.24, 'medium', 'low', true, false, true, 'ASIS GDL-RA'),

('Yard CCTV Coverage', 'perimeter_security', 'detective', 'warehouse',
 'Camera coverage of yard areas including trailer staging, employee parking, and vehicle circulation. Overlapping coverage with perimeter cameras.',
 0.32, 0.28, 'medium', 'medium', false, true, true, 'TAPA FSR 3.3.2'),

-- ============================================================================
-- LOADING DOCK SECURITY (10 controls)
-- CargoNet: 47% of cargo theft occurs at loading docks
-- ============================================================================

('Dock CCTV Coverage', 'loading_dock_security', 'detective', 'warehouse',
 'Camera coverage of all dock doors capturing trailer connections, seal verification, and loading/unloading activity. Cameras should see inside trailers when doors open. Critical control - 47% of cargo theft at docks.',
 0.40, 0.35, 'medium', 'medium', false, true, true, 'TAPA FSR 3.3.3'),

('Dock Door Sensors', 'loading_dock_security', 'detective', 'warehouse',
 'Sensors detecting dock door open/close status integrated with building management or security system. Alerts on unauthorized door openings.',
 0.25, 0.22, 'medium', 'medium', true, true, true, 'TAPA FSR'),

('Dock Scheduling System', 'loading_dock_security', 'preventive', 'warehouse',
 'Appointment system for inbound/outbound shipments enabling pre-verification of expected carriers and drivers. Reduces fictitious pickup risk.',
 0.35, 0.30, 'medium', 'low', true, true, true, 'C-TPAT'),

('Trailer Seal Verification', 'loading_dock_security', 'detective', 'warehouse',
 'Documented process for inspecting and recording ISO 17712 compliant seal numbers at receipt and shipment. Includes seal log and photo documentation.',
 0.38, 0.32, 'low', 'low', true, false, true, 'TAPA FSR 5.6'),

('Dock Leveler Locks', 'loading_dock_security', 'preventive', 'warehouse',
 'Locks preventing dock levelers from being operated during non-operational hours. Prevents unauthorized dock access when facility is closed.',
 0.22, 0.18, 'low', 'low', false, true, true, 'TAPA FSR'),

('Dock Intrusion Alarm', 'loading_dock_security', 'detective', 'warehouse',
 'Alarm system monitoring dock doors and levelers during non-operational hours. Connected to central monitoring with defined response procedures.',
 0.32, 0.28, 'medium', 'medium', true, true, true, 'TAPA FSR 2.2'),

('Driver Waiting Area', 'loading_dock_security', 'preventive', 'warehouse',
 'Designated area for drivers to wait during loading/unloading, away from warehouse interior. Restricts driver access to sensitive areas.',
 0.20, 0.18, 'low', 'low', true, false, true, 'TAPA FSR 1.7'),

('Dock Access Control', 'loading_dock_security', 'preventive', 'warehouse',
 'Controlled access between dock area and warehouse interior. Badge readers or locks preventing unauthorized movement from dock to warehouse.',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'TAPA FSR 1.6'),

('Outbound Verification Process', 'loading_dock_security', 'detective', 'warehouse',
 'Documented verification of outbound shipments against pick tickets/BOL before sealing. Includes piece count, product verification, and photo documentation.',
 0.35, 0.30, 'low', 'low', true, false, true, 'C-TPAT'),

('Dock Appointment System', 'loading_dock_security', 'preventive', 'warehouse',
 'Web-based or phone appointment system for carriers scheduling dock times. Enables driver verification and prevents unexpected arrivals.',
 0.30, 0.26, 'medium', 'low', true, true, true, 'TAPA FSR'),

-- ============================================================================
-- INVENTORY CONTROL (9 controls)
-- Industry average shrinkage: 1-2% | Best-in-class: Under 0.5%
-- ============================================================================

('Warehouse Management System (WMS)', 'inventory_control', 'detective', 'warehouse',
 'Enterprise WMS tracking all inventory movements, locations, and transactions. Provides audit trail and enables exception identification.',
 0.35, 0.30, 'high', 'medium', true, true, true, 'ISO 28000'),

('RFID Inventory Tracking', 'inventory_control', 'detective', 'warehouse',
 'RFID-based inventory tracking enabling real-time visibility without manual scanning. Reduces shrinkage through automated reconciliation.',
 0.32, 0.28, 'high', 'medium', true, true, true, 'TAPA FSR'),

('Real-Time Inventory Visibility', 'inventory_control', 'detective', 'warehouse',
 'System providing real-time inventory levels and locations. Enables immediate detection of discrepancies vs periodic counts.',
 0.30, 0.26, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Cycle Counting Program', 'inventory_control', 'detective', 'warehouse',
 'Regular partial inventory counts (daily/weekly) covering all locations over defined period. More effective than annual inventory for shrinkage detection.',
 0.28, 0.25, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('High-Value Caging', 'inventory_control', 'preventive', 'warehouse',
 'Physically secured cage or vault for high-value inventory with restricted access. TAPA Level A requires caging for items over defined threshold.',
 0.38, 0.32, 'medium', 'low', true, true, true, 'TAPA FSR 4.2'),

('Exception-Based Reporting', 'inventory_control', 'detective', 'warehouse',
 'Automated system flagging unusual patterns: inventory adjustments, void transactions, off-hours access, or deviation from expected activity.',
 0.30, 0.26, 'medium', 'medium', true, true, true, 'CargoNet'),

('Lot/Serial Number Tracking', 'inventory_control', 'detective', 'warehouse',
 'System tracking individual lot or serial numbers enabling trace of specific items and identification of theft points.',
 0.25, 0.22, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Two-Person Rule (High-Value)', 'inventory_control', 'preventive', 'warehouse',
 'Requirement for two authorized employees when accessing high-value inventory or secure areas. Reduces opportunity for single-person theft.',
 0.28, 0.25, 'low', 'low', true, false, true, 'TAPA FSR 4.3'),

('Inventory Reconciliation Process', 'inventory_control', 'detective', 'warehouse',
 'Formal process for investigating and documenting inventory discrepancies. Includes root cause analysis and corrective action tracking.',
 0.22, 0.18, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

-- ============================================================================
-- PERSONNEL & ACCESS CONTROL (10 controls)
-- FBI: 60-80% of cargo theft involves insider participation
-- ============================================================================

('Employee Background Checks', 'personnel_security', 'preventive', 'warehouse',
 'Pre-employment criminal background, employment history, and reference verification for all warehouse employees. FBI: 60-80% of cargo theft involves insiders.',
 0.35, 0.30, 'low', 'low', false, false, true, 'TAPA FSR 6.1'),

('Driver Background Checks', 'personnel_security', 'preventive', 'warehouse',
 'Background verification for contract carriers and drivers accessing the facility. Includes FMCSA compliance verification.',
 0.28, 0.25, 'low', 'low', false, false, true, 'C-TPAT'),

('Badge Access System', 'personnel_security', 'preventive', 'warehouse',
 'Electronic badge-based access control system with audit logging. Enables zone-based access restrictions and real-time access reporting.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'TAPA FSR 1.6'),

('Visitor Management System', 'personnel_security', 'preventive', 'warehouse',
 'System for registering, credentialing, and tracking visitors. Includes photo ID verification, badge issuance, and host notification.',
 0.25, 0.22, 'medium', 'low', true, true, true, 'TAPA FSR 1.7'),

('Driver Check-In Procedures', 'personnel_security', 'preventive', 'warehouse',
 'Documented procedures for verifying driver identity, BOL, and pickup authorization before dock access. Critical for preventing fictitious pickups.',
 0.38, 0.32, 'low', 'low', true, false, true, 'TAPA FSR 5.3'),

('Security Awareness Training', 'personnel_security', 'preventive', 'warehouse',
 'Annual security training for all employees covering cargo theft prevention, reporting procedures, and insider threat awareness.',
 0.22, 0.18, 'low', 'medium', true, false, true, 'TAPA FSR 6.3'),

('Theft Reporting Hotline', 'personnel_security', 'detective', 'warehouse',
 'Anonymous hotline for reporting suspected theft or security violations. Industry data shows 40% of internal theft detected through tips.',
 0.28, 0.25, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Insider Threat Program', 'personnel_security', 'detective', 'warehouse',
 'Formal program for identifying and responding to insider threat indicators. Includes behavioral monitoring, investigation procedures, and HR coordination.',
 0.32, 0.28, 'medium', 'medium', true, false, true, 'C-TPAT'),

('Contractor Vetting Program', 'personnel_security', 'preventive', 'warehouse',
 'Background verification and security requirements for contractors and temporary service providers accessing the facility.',
 0.22, 0.18, 'low', 'low', false, false, true, 'C-TPAT'),

('Temporary Worker Screening', 'personnel_security', 'preventive', 'warehouse',
 'Background screening for temporary and seasonal workers. Critical during peak seasons when temporary staffing increases.',
 0.25, 0.22, 'low', 'low', false, false, true, 'TAPA FSR 6.1'),

-- ============================================================================
-- VEHICLE & FLEET SECURITY (7 controls)
-- CargoNet: Average hijacking loss exceeds $250K
-- ============================================================================

('GPS Fleet Tracking', 'fleet_security', 'detective', 'warehouse',
 'Real-time GPS tracking on all company vehicles and trailers. Enables route monitoring, geofencing alerts, and rapid response to hijacking.',
 0.40, 0.35, 'medium', 'medium', true, true, true, 'TAPA TSR'),

('Vehicle Immobilizers', 'fleet_security', 'preventive', 'warehouse',
 'Engine immobilization devices preventing unauthorized vehicle operation. Includes remote disable capability for stolen vehicle recovery.',
 0.32, 0.28, 'medium', 'low', true, true, true, 'TAPA TSR'),

('Two-Driver Rule (High-Value)', 'fleet_security', 'preventive', 'warehouse',
 'Requirement for two drivers on high-value shipments. Reduces hijacking vulnerability and enables one driver to call for help.',
 0.35, 0.30, 'medium', 'low', true, false, true, 'CargoNet'),

('Fuel Theft Prevention', 'fleet_security', 'preventive', 'warehouse',
 'Locking fuel caps, fuel monitoring systems, and fuel card controls preventing fuel theft. Also detects unauthorized fuel purchases.',
 0.18, 0.15, 'low', 'low', true, true, true, 'Fleet Management'),

('Geofencing Alerts', 'fleet_security', 'detective', 'warehouse',
 'GPS-based alerts when vehicles deviate from planned routes or enter unauthorized areas. Early detection of hijacking or theft.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'TAPA TSR'),

('Covert Tracking Devices', 'fleet_security', 'detective', 'warehouse',
 'Hidden GPS trackers separate from visible fleet tracking. Enables recovery when primary tracking is disabled by thieves.',
 0.30, 0.26, 'medium', 'low', false, true, true, 'CargoNet'),

('Fleet Key Control System', 'fleet_security', 'preventive', 'warehouse',
 'Secure key storage with sign-out logging for all fleet vehicles. Prevents unauthorized vehicle access and enables accountability.',
 0.22, 0.18, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

-- ============================================================================
-- SURVEILLANCE & MONITORING (8 controls)
-- TAPA Level A: 100% coverage, 30-day retention minimum
-- ============================================================================

('Interior Warehouse CCTV', 'surveillance', 'detective', 'warehouse',
 'Comprehensive camera coverage of warehouse interior including aisles, staging areas, and work stations. Minimum 720p resolution.',
 0.35, 0.30, 'medium', 'medium', false, true, true, 'TAPA FSR 3.3'),

('High-Value Area Cameras', 'surveillance', 'detective', 'warehouse',
 'Enhanced camera coverage and resolution for high-value storage areas including cage interior. May include PTZ capability.',
 0.32, 0.28, 'medium', 'medium', false, true, true, 'TAPA FSR 3.3'),

('Video Analytics System', 'surveillance', 'detective', 'warehouse',
 'AI-powered video analytics detecting anomalies such as loitering, unauthorized access, or unusual activity patterns.',
 0.30, 0.26, 'high', 'high', true, true, true, 'TAPA FSR'),

('Video Retention (30+ Days)', 'surveillance', 'detective', 'warehouse',
 'Minimum 30-day video retention for all cameras. TAPA Level A requires 30 days; 90 days recommended for investigation capability.',
 0.28, 0.25, 'medium', 'medium', false, true, true, 'TAPA FSR 3.5'),

('Real-Time Monitoring Center', 'surveillance', 'detective', 'warehouse',
 '24/7 manned monitoring of CCTV, access control, and alarm systems. Can be on-site or remote central monitoring.',
 0.40, 0.35, 'high', 'low', true, false, true, 'TAPA FSR 3.4'),

('License Plate Recognition', 'surveillance', 'detective', 'warehouse',
 'Automated license plate capture and recognition at vehicle entry/exit points. Enables verification and logging of all vehicles.',
 0.25, 0.22, 'medium', 'medium', true, true, true, 'TAPA FSR'),

('Thermal Imaging Cameras', 'surveillance', 'detective', 'warehouse',
 'Thermal cameras for perimeter detection in low-visibility conditions. Effective for detecting intruders regardless of lighting.',
 0.28, 0.25, 'high', 'medium', false, true, true, 'TAPA FSR'),

('Mobile Surveillance Units', 'surveillance', 'detective', 'warehouse',
 'Temporary or mobile camera units for targeted surveillance of problem areas or during heightened risk periods.',
 0.22, 0.18, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

-- ============================================================================
-- EMERGENCY RESPONSE (6 controls)
-- ============================================================================

('Cargo Theft Response Plan', 'emergency_response', 'procedural', 'warehouse',
 'Documented procedures for responding to discovered or in-progress cargo theft. Includes law enforcement notification, evidence preservation, and communication protocols.',
 0.25, 0.22, 'low', 'medium', true, false, true, 'CargoNet'),

('Documented Security Procedures', 'emergency_response', 'procedural', 'warehouse',
 'Written procedures for shipping, receiving, access control, and incident response. Regularly reviewed and employee-signed acknowledgment.',
 0.22, 0.18, 'low', 'medium', true, false, true, 'TAPA FSR 8.1'),

('Key Control System', 'emergency_response', 'preventive', 'warehouse',
 'Formal key management including secure storage, sign-out logs, restricted duplication, and periodic rekeying schedule.',
 0.22, 0.18, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Alarm Response Procedures', 'emergency_response', 'procedural', 'warehouse',
 'Documented procedures for responding to alarm activations including verification, escalation, and law enforcement dispatch.',
 0.25, 0.22, 'low', 'low', true, false, true, 'TAPA FSR 2.3'),

('Security Drill Program', 'emergency_response', 'procedural', 'warehouse',
 'Regular drills testing security procedures including theft response, alarm response, and emergency evacuation.',
 0.18, 0.15, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Law Enforcement Partnership', 'emergency_response', 'procedural', 'warehouse',
 'Established relationship with local law enforcement including emergency contact information, facility tours, and joint training.',
 0.20, 0.18, 'low', 'low', false, false, true, 'CargoNet'),

-- ============================================================================
-- ENVIRONMENTAL DESIGN (3 controls)
-- ============================================================================

('CPTED Principles - Warehouse', 'environmental_design', 'deterrent', 'warehouse',
 'Crime Prevention Through Environmental Design principles applied to warehouse including natural surveillance, access control, and territorial reinforcement.',
 0.18, 0.15, 'medium', 'low', false, true, true, 'ASIS GDL-RA'),

('Adequate Interior Lighting', 'environmental_design', 'deterrent', 'warehouse',
 'Proper interior lighting levels throughout warehouse eliminating dark areas. Minimum 100 lux in work areas, 50 lux in aisles.',
 0.15, 0.12, 'medium', 'low', false, true, true, 'ASIS POA'),

('Signage - Monitored Facility', 'environmental_design', 'deterrent', 'warehouse',
 'Visible signage indicating CCTV monitoring, alarm systems, and prosecution policy. Serves as deterrent and legal notice.',
 0.08, 0.06, 'low', 'low', false, false, true, 'ASIS GDL-RA');

-- ============================================================================
-- CREATE CONTROL-TO-THREAT MAPPING TABLE
-- Links controls to specific warehouse threats they address
-- ============================================================================

-- Create junction table if not exists
CREATE TABLE IF NOT EXISTS control_threat_mapping (
  id SERIAL PRIMARY KEY,
  control_name VARCHAR(255) NOT NULL,
  threat_id VARCHAR(100) NOT NULL,
  effectiveness_rating INTEGER DEFAULT 3, -- 1-5 scale
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing warehouse mappings
DELETE FROM control_threat_mapping WHERE threat_id LIKE '%theft%' OR threat_id LIKE '%cargo%' OR threat_id LIKE 'warehouse_%';

-- Insert control-to-threat mappings for warehouse threats
INSERT INTO control_threat_mapping (control_name, threat_id, effectiveness_rating, is_primary) VALUES

-- Cargo Theft - Full Truckload
('Dock CCTV Coverage', 'cargo_theft_full_truckload', 5, true),
('Dock Scheduling System', 'cargo_theft_full_truckload', 4, true),
('Trailer Seal Verification', 'cargo_theft_full_truckload', 5, true),
('Driver Check-In Procedures', 'cargo_theft_full_truckload', 5, true),
('Guard House Checkpoint', 'cargo_theft_full_truckload', 4, true),
('Vehicle Gate Control', 'cargo_theft_full_truckload', 4, false),
('GPS Fleet Tracking', 'cargo_theft_full_truckload', 4, false),
('Cargo Theft Response Plan', 'cargo_theft_full_truckload', 3, false),
('Law Enforcement Partnership', 'cargo_theft_full_truckload', 3, false),
('Visitor Management System', 'cargo_theft_full_truckload', 3, false),

-- Cargo Theft - Pilferage
('Interior Warehouse CCTV', 'cargo_theft_pilferage', 5, true),
('Cycle Counting Program', 'cargo_theft_pilferage', 5, true),
('Exception-Based Reporting', 'cargo_theft_pilferage', 4, true),
('High-Value Caging', 'cargo_theft_pilferage', 5, true),
('Two-Person Rule (High-Value)', 'cargo_theft_pilferage', 4, true),
('Badge Access System', 'cargo_theft_pilferage', 4, false),
('Employee Background Checks', 'cargo_theft_pilferage', 4, false),
('Theft Reporting Hotline', 'cargo_theft_pilferage', 4, false),
('Real-Time Inventory Visibility', 'cargo_theft_pilferage', 4, false),
('Video Analytics System', 'cargo_theft_pilferage', 3, false),

-- Insider Theft - Employee/Driver Collusion
('Employee Background Checks', 'insider_theft_employee_driver_collusion', 5, true),
('Driver Background Checks', 'insider_theft_employee_driver_collusion', 5, true),
('Insider Threat Program', 'insider_theft_employee_driver_collusion', 5, true),
('Exception-Based Reporting', 'insider_theft_employee_driver_collusion', 4, true),
('Two-Person Rule (High-Value)', 'insider_theft_employee_driver_collusion', 4, true),
('Theft Reporting Hotline', 'insider_theft_employee_driver_collusion', 5, true),
('Video Analytics System', 'insider_theft_employee_driver_collusion', 4, false),
('Badge Access System', 'insider_theft_employee_driver_collusion', 4, false),
('Driver Check-In Procedures', 'insider_theft_employee_driver_collusion', 4, false),
('Cycle Counting Program', 'insider_theft_employee_driver_collusion', 3, false),

-- Loading Dock Breach
('Dock CCTV Coverage', 'loading_dock_breach', 5, true),
('Dock Door Sensors', 'loading_dock_breach', 4, true),
('Dock Intrusion Alarm', 'loading_dock_breach', 5, true),
('Dock Leveler Locks', 'loading_dock_breach', 4, true),
('Dock Access Control', 'loading_dock_breach', 4, true),
('Driver Waiting Area', 'loading_dock_breach', 3, false),
('Dock Scheduling System', 'loading_dock_breach', 3, false),
('Real-Time Monitoring Center', 'loading_dock_breach', 4, false),
('Security Awareness Training', 'loading_dock_breach', 2, false),
('Documented Security Procedures', 'loading_dock_breach', 2, false),

-- Yard/Trailer Theft
('Trailer King Pin Locks', 'yard_trailer_theft', 5, true),
('Trailer Landing Gear Locks', 'yard_trailer_theft', 5, true),
('Yard CCTV Coverage', 'yard_trailer_theft', 5, true),
('Yard Management System', 'yard_trailer_theft', 4, true),
('Perimeter CCTV Coverage', 'yard_trailer_theft', 4, false),
('High Security Fencing', 'yard_trailer_theft', 4, false),
('Yard Lighting System', 'yard_trailer_theft', 3, false),
('Fence Intrusion Detection', 'yard_trailer_theft', 3, false),
('Guard House Checkpoint', 'yard_trailer_theft', 3, false),
('GPS Fleet Tracking', 'yard_trailer_theft', 4, false),

-- Hijacking In-Transit
('GPS Fleet Tracking', 'hijacking_in_transit', 5, true),
('Geofencing Alerts', 'hijacking_in_transit', 5, true),
('Two-Driver Rule (High-Value)', 'hijacking_in_transit', 5, true),
('Covert Tracking Devices', 'hijacking_in_transit', 5, true),
('Vehicle Immobilizers', 'hijacking_in_transit', 4, true),
('Driver Background Checks', 'hijacking_in_transit', 4, false),
('Security Awareness Training', 'hijacking_in_transit', 3, false),
('Law Enforcement Partnership', 'hijacking_in_transit', 4, false),
('Cargo Theft Response Plan', 'hijacking_in_transit', 3, false),

-- Unauthorized Access
('High Security Fencing', 'unauthorized_access_facility', 5, true),
('Badge Access System', 'unauthorized_access_facility', 5, true),
('Fence Intrusion Detection', 'unauthorized_access_facility', 4, true),
('Perimeter CCTV Coverage', 'unauthorized_access_facility', 4, true),
('Vehicle Gate Control', 'unauthorized_access_facility', 4, true),
('Guard House Checkpoint', 'unauthorized_access_facility', 5, true),
('Visitor Management System', 'unauthorized_access_facility', 4, false),
('Clear Zone Maintenance', 'unauthorized_access_facility', 3, false),
('Yard Lighting System', 'unauthorized_access_facility', 3, false),
('Perimeter Patrol Program', 'unauthorized_access_facility', 4, false),

-- After-Hours Intrusion
('Dock Intrusion Alarm', 'after_hours_intrusion', 5, true),
('Fence Intrusion Detection', 'after_hours_intrusion', 5, true),
('Perimeter CCTV Coverage', 'after_hours_intrusion', 5, true),
('Real-Time Monitoring Center', 'after_hours_intrusion', 5, true),
('Dock Leveler Locks', 'after_hours_intrusion', 4, true),
('High Security Fencing', 'after_hours_intrusion', 4, false),
('Yard Lighting System', 'after_hours_intrusion', 4, false),
('Thermal Imaging Cameras', 'after_hours_intrusion', 4, false),
('Alarm Response Procedures', 'after_hours_intrusion', 4, false),
('Key Control System', 'after_hours_intrusion', 3, false);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count controls by category
SELECT 'Warehouse controls by category:' as info;
SELECT category, COUNT(*) as count 
FROM controls 
WHERE facility_type = 'warehouse'
GROUP BY category
ORDER BY count DESC;

-- Count total controls
SELECT 'Total warehouse controls: ' || COUNT(*) as result 
FROM controls 
WHERE facility_type = 'warehouse';

-- Count control-threat mappings
SELECT 'Total control-threat mappings: ' || COUNT(*) as result 
FROM control_threat_mapping;

-- Show controls with TAPA references
SELECT 'Controls with TAPA FSR references:' as info;
SELECT name, tapa_reference 
FROM controls 
WHERE facility_type = 'warehouse' AND tapa_reference IS NOT NULL
ORDER BY tapa_reference;

-- ============================================================================
-- SAMPLE QUERIES FOR APPLICATION USE
-- ============================================================================

/*
-- Get all controls for a specific threat
SELECT c.name, c.category, c.control_type, c.reduction_percentage, ctm.effectiveness_rating, ctm.is_primary
FROM controls c
JOIN control_threat_mapping ctm ON c.name = ctm.control_name
WHERE ctm.threat_id = 'cargo_theft_full_truckload'
ORDER BY ctm.is_primary DESC, ctm.effectiveness_rating DESC;

-- Get recommended controls for multiple threats
SELECT DISTINCT c.name, c.category, c.estimated_cost, 
       MAX(ctm.effectiveness_rating) as max_effectiveness,
       COUNT(DISTINCT ctm.threat_id) as threats_addressed
FROM controls c
JOIN control_threat_mapping ctm ON c.name = ctm.control_name
WHERE ctm.threat_id IN ('cargo_theft_full_truckload', 'insider_theft_employee_driver_collusion', 'loading_dock_breach')
GROUP BY c.name, c.category, c.estimated_cost
ORDER BY threats_addressed DESC, max_effectiveness DESC;

-- Get TAPA Level A required controls
SELECT name, category, tapa_reference, estimated_cost
FROM controls
WHERE facility_type = 'warehouse' 
  AND tapa_reference LIKE 'TAPA FSR%'
ORDER BY category, name;

-- Calculate theoretical maximum risk reduction for a threat
SELECT ctm.threat_id,
       SUM(c.reduction_percentage * CASE WHEN ctm.is_primary THEN 1.0 ELSE 0.5 END) as max_reduction
FROM controls c
JOIN control_threat_mapping ctm ON c.name = ctm.control_name
WHERE ctm.threat_id = 'cargo_theft_full_truckload'
GROUP BY ctm.threat_id;
*/

-- ============================================================================
-- END OF WAREHOUSE CONTROLS SEED
-- ============================================================================
