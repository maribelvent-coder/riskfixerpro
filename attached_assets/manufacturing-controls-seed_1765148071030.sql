-- ============================================================================
-- MANUFACTURING FACILITY SECURITY CONTROLS
-- Complete seed file for RiskFixer
-- 
-- 75+ controls organized by category:
-- - Perimeter Security (10 controls)
-- - Production Area Security (12 controls)
-- - Intellectual Property Protection (10 controls)
-- - Inventory & Material Control (10 controls)
-- - Shipping & Finished Goods (8 controls)
-- - Personnel Security (10 controls)
-- - Contractor & Vendor Management (7 controls)
-- - Surveillance & Monitoring (10 controls)
-- - Emergency Response (8 controls)
-- 
-- Standards References:
-- - ASIS GDL-RA (General Security Risk Assessment)
-- - CFATS (Chemical Facility Anti-Terrorism Standards)
-- - NIST Manufacturing Security Guidelines
-- - ISO 28000 (Supply Chain Security Management)
-- - OSHA Workplace Safety Requirements
-- - NIST SP 800-82 (ICS Security)
-- - FBI Industrial Espionage Prevention Guidelines
-- 
-- @author RiskFixer Team
-- @version 1.0
-- ============================================================================

-- Clean up any existing manufacturing controls to prevent duplicates
DELETE FROM controls WHERE facility_type = 'manufacturing';

-- Also clean by name to catch any miscategorized controls
DELETE FROM controls WHERE name IN (
  -- Perimeter Security
  'Industrial Fencing (8ft+)', 'Staffed Security Gate', 'Perimeter Intrusion Detection',
  'Perimeter Lighting (Industrial)', 'Perimeter CCTV', 'Vehicle Inspection Procedures',
  'Clear Zone - Perimeter', 'Guard Patrol Program', 'After-Hours Monitoring', 'Perimeter Alarm System',
  -- Production Area
  'Production Floor Access Control', 'Employee Badge Access Control', 'CCTV - Production Floor',
  'Equipment Lockout/Tagout', 'Tool Crib Access Control', 'Tool Tracking System',
  'Photography Prohibition Enforcement', 'Production Area Zoning', 'Access Zone Separation',
  'Scrap Disposal Procedures', 'Work-in-Progress Security', 'Equipment Monitoring System',
  -- IP Protection
  'R&D Area Access Control', 'Biometric Access - Critical Areas', 'Visitor NDA Procedures',
  'Clean Desk Policy', 'Prototype Security Procedures', 'Data Loss Prevention (DLP)',
  'Mobile Device Restrictions', 'Exit Interviews - IP Protection', 'Document Control System',
  'Production Data Encryption',
  -- Inventory
  'Raw Material Tracking System', 'Manufacturing Execution System (MES)', 'Cycle Counting Program',
  'Raw Material Caging', 'Bill of Materials Tracking', 'CCTV - Raw Material Storage',
  'Material Reconciliation', 'Two-Person Rule - Sensitive Areas', 'Lot/Serial Tracking',
  'Asset Tracking (RFID)',
  -- Shipping
  'Finished Goods Caging', 'Finished Goods Inventory Control', 'CCTV - Finished Goods Warehouse',
  'CCTV - Loading Docks', 'Shipping/Receiving Verification', 'Driver Waiting Area',
  'Dock Access Control', 'Outbound Manifest Verification',
  -- Personnel
  'Employee Background Checks (Production)', 'Contractor Background Checks', 'Insider Threat Program',
  'Security Awareness Training (Manufacturing)', 'Exit Bag Checks', 'Immediate Access Revocation',
  'Non-Compete Enforcement', 'Employee Assistance Program', 'Threat Assessment Team',
  'Theft Reporting Hotline',
  -- Contractor
  'Visitor/Contractor Management', 'Visitor Escort Requirements', 'Supplier Vetting Program',
  'Maintenance Access Procedures', 'Vendor Security Program', 'Temporary Badge System',
  'Parts Authentication Procedures',
  -- Surveillance
  'Video Retention (30+ Days)', 'Video Analytics (Manufacturing)', 'Real-Time Monitoring',
  'Network Segmentation (OT/IT)', 'License Plate Recognition', 'CCTV - Tool Room',
  'CCTV - Visitor Areas', 'Motion Detection Sensors', 'Intrusion Detection System',
  'Remote Monitoring Capability',
  -- Emergency
  'Workplace Violence Response Plan', 'Production Continuity Plan', 'IP Theft Response Procedures',
  'Sabotage Incident Response', 'Incident Documentation Procedures', 'Emergency Notification System',
  'Law Enforcement Partnership', 'Business Continuity Planning'
);

-- ============================================================================
-- PERIMETER SECURITY (10 controls)
-- ASIS: Perimeter is first line of defense for manufacturing facilities
-- ============================================================================

INSERT INTO controls (
  name, category, control_type, facility_type, description, 
  base_weight, reduction_percentage, estimated_cost, maintenance_level, 
  requires_training, requires_maintenance, is_active, standard_reference
) VALUES

('Industrial Fencing (8ft+)', 'perimeter_security', 'preventive', 'manufacturing',
 'Minimum 8-foot industrial-grade fencing with anti-climb features (razor wire, coyote roller, or outrigger). Critical for preventing unauthorized access to manufacturing facilities with valuable equipment and IP.',
 0.40, 0.35, 'medium', 'medium', false, true, true, 'ASIS POA 1.3'),

('Staffed Security Gate', 'perimeter_security', 'preventive', 'manufacturing',
 'Manned security checkpoint at primary vehicle/pedestrian entry controlling access, verifying credentials, and logging all visitors and deliveries. 24/7 staffing recommended for high-value manufacturing.',
 0.42, 0.38, 'high', 'low', true, false, true, 'ASIS GDL-RA'),

('Perimeter Intrusion Detection', 'perimeter_security', 'detective', 'manufacturing',
 'Electronic detection system for fence line intrusion including vibration sensors, microwave barriers, or video analytics. Provides early warning of perimeter breach attempts.',
 0.35, 0.30, 'high', 'medium', true, true, true, 'ASIS POA 1.5'),

('Perimeter Lighting (Industrial)', 'perimeter_security', 'deterrent', 'manufacturing',
 'High-intensity lighting covering perimeter, parking areas, and building exterior. ASIS guidelines: minimum 10 lux at fence line, 50 lux at access points, 100 lux at critical areas.',
 0.25, 0.22, 'medium', 'medium', false, true, true, 'ASIS POA'),

('Perimeter CCTV', 'perimeter_security', 'detective', 'manufacturing',
 'Camera coverage of entire perimeter fence line and grounds with no blind spots. Night vision/IR capability required. Minimum 30-day retention for investigation support.',
 0.38, 0.32, 'high', 'medium', true, true, true, 'ASIS GDL-RA'),

('Vehicle Inspection Procedures', 'perimeter_security', 'preventive', 'manufacturing',
 'Documented procedures for inspecting incoming and outgoing vehicles. Includes trunk/cab checks for personal vehicles and cargo inspection for commercial vehicles.',
 0.30, 0.26, 'low', 'low', true, false, true, 'CFATS RBPS'),

('Clear Zone - Perimeter', 'perimeter_security', 'deterrent', 'manufacturing',
 'Maintained clear zone (minimum 3 meters) on both sides of perimeter fence free of vegetation, equipment, or materials that could aid climbing or concealment.',
 0.18, 0.15, 'low', 'medium', false, true, true, 'ASIS POA 1.4'),

('Guard Patrol Program', 'perimeter_security', 'detective', 'manufacturing',
 'Regular security patrols of perimeter, parking areas, and building exterior. Documented patrol routes with checkpoint verification. Critical for large manufacturing campuses.',
 0.28, 0.24, 'medium', 'low', true, false, true, 'ASIS GDL-RA'),

('After-Hours Monitoring', 'perimeter_security', 'detective', 'manufacturing',
 'Enhanced monitoring during non-production hours including increased patrol frequency, motion detection activation, and remote monitoring services.',
 0.32, 0.28, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Perimeter Alarm System', 'perimeter_security', 'detective', 'manufacturing',
 'Integrated alarm system covering perimeter gates, doors, and fence line. Connected to central monitoring with defined response procedures and escalation paths.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'ASIS POA'),

-- ============================================================================
-- PRODUCTION AREA SECURITY (12 controls)
-- Critical for protecting manufacturing processes, equipment, and WIP inventory
-- ============================================================================

('Production Floor Access Control', 'production_security', 'preventive', 'manufacturing',
 'Badge-based electronic access control restricting production floor entry to authorized personnel only. Audit logging of all access events. Foundation control for manufacturing security.',
 0.40, 0.35, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Employee Badge Access Control', 'production_security', 'preventive', 'manufacturing',
 'Enterprise badge access system with role-based permissions enabling zone restrictions throughout facility. Real-time access reporting and automatic lockout capability.',
 0.38, 0.32, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('CCTV - Production Floor', 'production_security', 'detective', 'manufacturing',
 'Comprehensive camera coverage of production areas capturing equipment operation, material handling, and employee activity. Minimum 720p resolution, 30-day retention.',
 0.35, 0.30, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('Equipment Lockout/Tagout', 'production_security', 'preventive', 'manufacturing',
 'OSHA-compliant lockout/tagout program preventing unauthorized equipment operation. Extends security benefit by restricting equipment access during non-operational periods.',
 0.25, 0.22, 'low', 'low', true, false, true, 'OSHA 1910.147'),

('Tool Crib Access Control', 'production_security', 'preventive', 'manufacturing',
 'Secured tool storage with badge access and sign-out requirements. Prevents unauthorized access to valuable tools, dies, molds, and specialized equipment.',
 0.32, 0.28, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Tool Tracking System', 'production_security', 'detective', 'manufacturing',
 'Automated system tracking tool assignments, locations, and returns. Options include barcode, RFID, or shadow board systems. Critical for preventing tooling theft.',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Photography Prohibition Enforcement', 'production_security', 'preventive', 'manufacturing',
 'Enforced prohibition on photography/video in production areas. Includes signage, mobile device policies, and visitor briefings. Critical IP protection for proprietary processes.',
 0.35, 0.30, 'low', 'low', true, false, true, 'FBI Industrial Espionage'),

('Production Area Zoning', 'production_security', 'preventive', 'manufacturing',
 'Physical or electronic segmentation of production areas by sensitivity level. Restricts access to specialized processes, cleanrooms, or proprietary operations.',
 0.30, 0.26, 'medium', 'low', true, true, true, 'ASIS GDL-RA'),

('Access Zone Separation', 'production_security', 'preventive', 'manufacturing',
 'Physical barriers and access controls separating manufacturing zones from administrative, visitor, and shipping areas. Prevents unauthorized movement through facility.',
 0.28, 0.25, 'medium', 'low', true, true, true, 'CFATS RBPS'),

('Scrap Disposal Procedures', 'production_security', 'procedural', 'manufacturing',
 'Controlled procedures for disposing of production scrap, defective products, and waste materials. Prevents theft concealment and IP exposure through discarded materials.',
 0.20, 0.18, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Work-in-Progress Security', 'production_security', 'preventive', 'manufacturing',
 'Procedures securing work-in-progress inventory between shifts including designated storage, counts, and handoff documentation. Prevents pilferage during production gaps.',
 0.22, 0.18, 'low', 'low', true, false, true, 'ISO 28000'),

('Equipment Monitoring System', 'production_security', 'detective', 'manufacturing',
 'Sensors and alarms monitoring critical equipment status, access, and tampering. Integration with building management or SCADA systems for real-time alerts.',
 0.30, 0.26, 'high', 'medium', true, true, true, 'NIST SP 800-82'),

-- ============================================================================
-- INTELLECTUAL PROPERTY PROTECTION (10 controls)
-- FBI: IP theft costs U.S. companies $600B+ annually
-- ============================================================================

('R&D Area Access Control', 'ip_protection', 'preventive', 'manufacturing',
 'Enhanced access control for R&D and engineering areas beyond standard badge access. May include dual authentication, time restrictions, or biometric verification.',
 0.42, 0.38, 'medium', 'medium', true, true, true, 'FBI Industrial Espionage'),

('Biometric Access - Critical Areas', 'ip_protection', 'preventive', 'manufacturing',
 'Biometric authentication (fingerprint, iris, facial recognition) for highest-security areas containing trade secrets or proprietary processes.',
 0.45, 0.40, 'high', 'medium', true, true, true, 'ASIS GDL-RA'),

('Visitor NDA Procedures', 'ip_protection', 'preventive', 'manufacturing',
 'Mandatory non-disclosure agreement execution for all visitors before facility access. Legal foundation for IP protection and trade secret claims.',
 0.35, 0.30, 'low', 'low', true, false, true, 'FBI Industrial Espionage'),

('Clean Desk Policy', 'ip_protection', 'preventive', 'manufacturing',
 'Enforced policy requiring sensitive documents, prototypes, and materials to be secured when unattended. Includes secure storage and shredding requirements.',
 0.22, 0.18, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Prototype Security Procedures', 'ip_protection', 'preventive', 'manufacturing',
 'Controlled procedures for prototype handling including secure storage, chain of custody documentation, and destruction protocols. Critical for pre-production IP protection.',
 0.38, 0.32, 'low', 'low', true, false, true, 'FBI Industrial Espionage'),

('Data Loss Prevention (DLP)', 'ip_protection', 'detective', 'manufacturing',
 'Technical controls monitoring and preventing unauthorized data exfiltration via email, USB, cloud upload, or printing. Essential for digital IP protection.',
 0.40, 0.35, 'high', 'medium', true, true, true, 'NIST CSF'),

('Mobile Device Restrictions', 'ip_protection', 'preventive', 'manufacturing',
 'Policy and technical controls restricting personal mobile devices in sensitive areas. May include device lockers, RF shielding, or mandatory check-in.',
 0.32, 0.28, 'low', 'low', true, false, true, 'FBI Industrial Espionage'),

('Exit Interviews - IP Protection', 'ip_protection', 'procedural', 'manufacturing',
 'Structured exit interview process for departing employees addressing return of materials, NDA reminders, and identification of IP exposure risks.',
 0.25, 0.22, 'low', 'low', true, false, true, 'FBI Industrial Espionage'),

('Document Control System', 'ip_protection', 'preventive', 'manufacturing',
 'Formal system for controlling sensitive documents including classification, distribution tracking, copy control, and destruction verification.',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'ISO 27001'),

('Production Data Encryption', 'ip_protection', 'preventive', 'manufacturing',
 'Encryption of production data, process parameters, and engineering files at rest and in transit. Protects digital IP from unauthorized access.',
 0.32, 0.28, 'medium', 'medium', true, true, true, 'NIST SP 800-82'),

-- ============================================================================
-- INVENTORY & MATERIAL CONTROL (10 controls)
-- Manufacturing industry average shrinkage: 1-3%
-- ============================================================================

('Raw Material Tracking System', 'inventory_control', 'detective', 'manufacturing',
 'System tracking raw material receipt, storage locations, consumption, and disposal. Enables identification of shrinkage and theft points in material flow.',
 0.32, 0.28, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Manufacturing Execution System (MES)', 'inventory_control', 'detective', 'manufacturing',
 'Enterprise system tracking production operations, material consumption, and inventory movements in real-time. Provides audit trail for all material transactions.',
 0.35, 0.30, 'high', 'medium', true, true, true, 'NIST Manufacturing'),

('Cycle Counting Program', 'inventory_control', 'detective', 'manufacturing',
 'Regular partial inventory counts (daily/weekly) covering all material locations over defined period. More effective than annual inventory for shrinkage detection.',
 0.28, 0.25, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Raw Material Caging', 'inventory_control', 'preventive', 'manufacturing',
 'Physically secured cage or vault for high-value raw materials with restricted badge access. Essential for precious metals, pharmaceuticals, and high-cost components.',
 0.40, 0.35, 'medium', 'low', true, true, true, 'ASIS GDL-RA'),

('Bill of Materials Tracking', 'inventory_control', 'detective', 'manufacturing',
 'System reconciling actual material usage against BOM requirements. Flags variances indicating potential theft, waste, or process issues.',
 0.25, 0.22, 'medium', 'medium', true, true, true, 'ISO 28000'),

('CCTV - Raw Material Storage', 'inventory_control', 'detective', 'manufacturing',
 'Camera coverage of raw material storage areas, receiving docks, and staging zones. Supports investigation of material discrepancies and theft.',
 0.30, 0.26, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('Material Reconciliation', 'inventory_control', 'detective', 'manufacturing',
 'Formal process for investigating and documenting material discrepancies. Includes root cause analysis and corrective action tracking.',
 0.22, 0.18, 'low', 'low', true, false, true, 'ISO 28000'),

('Two-Person Rule - Sensitive Areas', 'inventory_control', 'preventive', 'manufacturing',
 'Requirement for two authorized employees when accessing high-value materials, controlled substances, or secure areas. Provides mutual accountability.',
 0.30, 0.26, 'low', 'low', true, false, true, 'CFATS RBPS'),

('Lot/Serial Tracking', 'inventory_control', 'detective', 'manufacturing',
 'System tracking individual lot or serial numbers throughout production. Enables trace of specific items and identification of theft points.',
 0.25, 0.22, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Asset Tracking (RFID)', 'inventory_control', 'detective', 'manufacturing',
 'RFID-based tracking of materials, tools, and work-in-progress enabling real-time visibility and automated inventory reconciliation.',
 0.32, 0.28, 'high', 'medium', true, true, true, 'ISO 28000'),

-- ============================================================================
-- SHIPPING & FINISHED GOODS (8 controls)
-- Finished goods theft often occurs during shipping/staging
-- ============================================================================

('Finished Goods Caging', 'shipping_security', 'preventive', 'manufacturing',
 'Secured storage area for high-value finished goods awaiting shipment. Badge access restriction and CCTV coverage required.',
 0.35, 0.30, 'medium', 'low', true, true, true, 'ASIS GDL-RA'),

('Finished Goods Inventory Control', 'shipping_security', 'detective', 'manufacturing',
 'System tracking finished goods from production completion through shipment. Real-time visibility prevents staging area theft.',
 0.30, 0.26, 'medium', 'medium', true, true, true, 'ISO 28000'),

('CCTV - Finished Goods Warehouse', 'shipping_security', 'detective', 'manufacturing',
 'Camera coverage of finished goods storage, picking areas, and staging zones. Critical for high-value product facilities.',
 0.32, 0.28, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('CCTV - Loading Docks', 'shipping_security', 'detective', 'manufacturing',
 'Camera coverage of all loading dock doors capturing trailer connections, product loading, and seal application. Essential evidence for shortage claims.',
 0.35, 0.30, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('Shipping/Receiving Verification', 'shipping_security', 'detective', 'manufacturing',
 'Documented verification of inbound receipts and outbound shipments against manifests/BOL. Includes piece count, product verification, and photo documentation.',
 0.38, 0.32, 'low', 'low', true, false, true, 'ISO 28000'),

('Driver Waiting Area', 'shipping_security', 'preventive', 'manufacturing',
 'Designated area for drivers to wait during loading/unloading, away from production and storage areas. Restricts driver access to sensitive areas.',
 0.22, 0.18, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Dock Access Control', 'shipping_security', 'preventive', 'manufacturing',
 'Controlled access between dock area and production/warehouse interior. Badge readers or locks preventing unauthorized movement from dock to facility.',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Outbound Manifest Verification', 'shipping_security', 'detective', 'manufacturing',
 'Process for verifying shipped quantities against production records, pick tickets, and customer orders. Identifies overshipment and theft.',
 0.30, 0.26, 'low', 'low', true, false, true, 'ISO 28000'),

-- ============================================================================
-- PERSONNEL SECURITY (10 controls)
-- FBI: 60%+ of manufacturing theft involves insider participation
-- ============================================================================

('Employee Background Checks (Production)', 'personnel_security', 'preventive', 'manufacturing',
 'Pre-employment criminal background, employment history, and reference verification for production employees. FBI: 60%+ of manufacturing theft involves insiders.',
 0.38, 0.32, 'low', 'low', false, false, true, 'FBI Industrial Espionage'),

('Contractor Background Checks', 'personnel_security', 'preventive', 'manufacturing',
 'Background verification for contractors and temporary workers accessing the facility. Especially critical for those with production area or IT system access.',
 0.28, 0.25, 'low', 'low', false, false, true, 'CFATS RBPS'),

('Insider Threat Program', 'personnel_security', 'detective', 'manufacturing',
 'Formal program for identifying and responding to insider threat indicators. Includes behavioral monitoring, investigation procedures, and HR coordination.',
 0.40, 0.35, 'medium', 'medium', true, false, true, 'FBI Industrial Espionage'),

('Security Awareness Training (Manufacturing)', 'personnel_security', 'preventive', 'manufacturing',
 'Annual security training covering IP protection, theft prevention, espionage awareness, and reporting procedures. Tailored for manufacturing environment.',
 0.25, 0.22, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Exit Bag Checks', 'personnel_security', 'detective', 'manufacturing',
 'Random or systematic inspection of employee bags, lunch boxes, and personal items at exits. Low-cost deterrent against casual pilferage.',
 0.22, 0.18, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Immediate Access Revocation', 'personnel_security', 'preventive', 'manufacturing',
 'Procedures for immediately revoking badge access, system access, and collecting credentials upon termination. Prevents post-termination sabotage or theft.',
 0.42, 0.38, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Non-Compete Enforcement', 'personnel_security', 'procedural', 'manufacturing',
 'Employee agreements restricting competitive employment and requiring return of proprietary information. Legal foundation for IP protection upon departure.',
 0.25, 0.22, 'low', 'low', false, false, true, 'FBI Industrial Espionage'),

('Employee Assistance Program', 'personnel_security', 'preventive', 'manufacturing',
 'Confidential counseling and support services addressing financial, personal, and workplace issues that may contribute to insider threat behavior.',
 0.18, 0.15, 'medium', 'low', true, false, true, 'ASIS WPV'),

('Threat Assessment Team', 'personnel_security', 'detective', 'manufacturing',
 'Cross-functional team (HR, Security, Legal, Management) for evaluating potential workplace violence and insider threat situations. ASIS-recommended practice.',
 0.30, 0.26, 'low', 'medium', true, false, true, 'ASIS WPV'),

('Theft Reporting Hotline', 'personnel_security', 'detective', 'manufacturing',
 'Anonymous hotline for reporting suspected theft, IP exposure, or security violations. Industry data shows 40% of internal theft detected through tips.',
 0.28, 0.25, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

-- ============================================================================
-- CONTRACTOR & VENDOR MANAGEMENT (7 controls)
-- Third-party access is a major espionage and theft vector
-- ============================================================================

('Visitor/Contractor Management', 'contractor_management', 'preventive', 'manufacturing',
 'System for registering, credentialing, and tracking visitors and contractors. Includes photo ID verification, badge issuance, and host notification.',
 0.30, 0.26, 'medium', 'low', true, true, true, 'ASIS GDL-RA'),

('Visitor Escort Requirements', 'contractor_management', 'preventive', 'manufacturing',
 'Policy requiring contractor/visitor escort in production, R&D, and sensitive areas. Prevents unsupervised access to proprietary information and materials.',
 0.35, 0.30, 'low', 'low', true, false, true, 'FBI Industrial Espionage'),

('Supplier Vetting Program', 'contractor_management', 'preventive', 'manufacturing',
 'Due diligence process for vetting suppliers including quality systems, security practices, and counterfeit prevention measures. Critical for supply chain integrity.',
 0.32, 0.28, 'medium', 'medium', true, false, true, 'ISO 28000'),

('Maintenance Access Procedures', 'contractor_management', 'preventive', 'manufacturing',
 'Controlled procedures for external maintenance personnel including escort requirements, work area restrictions, and equipment access logging.',
 0.25, 0.22, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Vendor Security Program', 'contractor_management', 'preventive', 'manufacturing',
 'Requirements for vendors to meet minimum security standards before facility access. May include background checks, training, and NDA requirements.',
 0.28, 0.25, 'low', 'low', true, false, true, 'ISO 28000'),

('Temporary Badge System', 'contractor_management', 'preventive', 'manufacturing',
 'System for issuing time-limited, visually distinct badges to visitors and contractors. Enables easy identification of non-employees.',
 0.22, 0.18, 'low', 'low', true, true, true, 'ASIS GDL-RA'),

('Parts Authentication Procedures', 'contractor_management', 'detective', 'manufacturing',
 'Procedures for verifying authenticity of incoming parts and materials including supplier certificates, inspection protocols, and testing requirements.',
 0.30, 0.26, 'medium', 'medium', true, false, true, 'SAE AS6174'),

-- ============================================================================
-- SURVEILLANCE & MONITORING (10 controls)
-- ============================================================================

('Video Retention (30+ Days)', 'surveillance', 'detective', 'manufacturing',
 'Minimum 30-day video retention for all cameras. 90 days recommended for manufacturing facilities to support theft and quality investigations.',
 0.28, 0.25, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('Video Analytics (Manufacturing)', 'surveillance', 'detective', 'manufacturing',
 'AI-powered video analytics detecting anomalies such as loitering in restricted areas, unauthorized access attempts, or unusual movement patterns.',
 0.32, 0.28, 'high', 'high', true, true, true, 'ASIS GDL-RA'),

('Real-Time Monitoring', 'surveillance', 'detective', 'manufacturing',
 'Staffed monitoring of CCTV, access control, and alarm systems during operational hours. May be on-site security or remote monitoring center.',
 0.38, 0.32, 'high', 'low', true, false, true, 'ASIS GDL-RA'),

('Network Segmentation (OT/IT)', 'surveillance', 'preventive', 'manufacturing',
 'Network architecture separating operational technology (production systems) from IT networks. Prevents lateral movement from compromised systems.',
 0.35, 0.30, 'high', 'medium', true, true, true, 'NIST SP 800-82'),

('License Plate Recognition', 'surveillance', 'detective', 'manufacturing',
 'Automated license plate capture and recognition at vehicle entry/exit points. Enables verification and logging of all vehicles accessing facility.',
 0.25, 0.22, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('CCTV - Tool Room', 'surveillance', 'detective', 'manufacturing',
 'Dedicated camera coverage of tool cribs, die/mold storage, and specialized equipment areas. Supports investigation of tooling theft.',
 0.28, 0.25, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('CCTV - Visitor Areas', 'surveillance', 'detective', 'manufacturing',
 'Camera coverage of lobbies, conference rooms, and visitor-accessible areas. Documents visitor movements and interactions.',
 0.22, 0.18, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('Motion Detection Sensors', 'surveillance', 'detective', 'manufacturing',
 'Motion sensors in sensitive areas activating during non-operational hours. Provides intrusion detection layer complementing camera systems.',
 0.25, 0.22, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Intrusion Detection System', 'surveillance', 'detective', 'manufacturing',
 'Integrated system monitoring doors, windows, and openings with sensors connected to central monitoring. Provides after-hours intrusion alerting.',
 0.32, 0.28, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Remote Monitoring Capability', 'surveillance', 'detective', 'manufacturing',
 'Capability for security staff to monitor facility systems remotely. Enables after-hours response and reduces overnight staffing requirements.',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

-- ============================================================================
-- EMERGENCY RESPONSE (8 controls)
-- ============================================================================

('Workplace Violence Response Plan', 'emergency_response', 'procedural', 'manufacturing',
 'Documented procedures for responding to workplace violence incidents including active shooter scenarios. Includes evacuation, lockdown, and communication protocols.',
 0.30, 0.26, 'low', 'medium', true, false, true, 'ASIS WPV'),

('Production Continuity Plan', 'emergency_response', 'procedural', 'manufacturing',
 'Plan for maintaining or resuming production following security incidents, equipment failures, or sabotage events. Includes redundancy and recovery procedures.',
 0.28, 0.25, 'low', 'medium', true, false, true, 'NIST Manufacturing'),

('IP Theft Response Procedures', 'emergency_response', 'procedural', 'manufacturing',
 'Documented procedures for responding to suspected IP theft including evidence preservation, legal notification, and investigation protocols.',
 0.25, 0.22, 'low', 'medium', true, false, true, 'FBI Industrial Espionage'),

('Sabotage Incident Response', 'emergency_response', 'procedural', 'manufacturing',
 'Procedures for responding to suspected sabotage including equipment isolation, evidence preservation, and investigation coordination with law enforcement.',
 0.28, 0.25, 'low', 'medium', true, false, true, 'CFATS RBPS'),

('Incident Documentation Procedures', 'emergency_response', 'procedural', 'manufacturing',
 'Formal procedures for documenting all security incidents including standardized forms, investigation requirements, and retention policies.',
 0.22, 0.18, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Emergency Notification System', 'emergency_response', 'procedural', 'manufacturing',
 'Mass notification system for alerting employees to security incidents, evacuations, or shelter-in-place situations. Multi-modal (PA, text, email).',
 0.28, 0.25, 'medium', 'medium', true, true, true, 'OSHA'),

('Law Enforcement Partnership', 'emergency_response', 'procedural', 'manufacturing',
 'Established relationship with local law enforcement including facility familiarization, contact protocols, and response coordination procedures.',
 0.25, 0.22, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Business Continuity Planning', 'emergency_response', 'procedural', 'manufacturing',
 'Comprehensive planning for business continuity following major incidents. Includes alternate site procedures, supply chain backup, and customer communication.',
 0.25, 0.22, 'low', 'medium', true, false, true, 'NIST Manufacturing'),

-- ============================================================================
-- HAZMAT SECURITY (5 controls)
-- Required for CFATS-regulated facilities
-- ============================================================================

('CFATS Security Plan', 'hazmat_security', 'procedural', 'manufacturing',
 'Site Security Plan (SSP) meeting CFATS requirements for facilities handling chemicals of interest. Risk-Based Performance Standards (RBPS) compliance.',
 0.45, 0.40, 'high', 'medium', true, false, true, 'CFATS'),

('Hazmat Storage Compliance', 'hazmat_security', 'preventive', 'manufacturing',
 'Storage facilities meeting regulatory requirements for chemicals of interest including access control, containment, and monitoring.',
 0.40, 0.35, 'high', 'medium', true, true, true, 'CFATS RBPS'),

('Hazmat Access Control', 'hazmat_security', 'preventive', 'manufacturing',
 'Enhanced access controls for areas containing hazardous materials including additional authentication, two-person rules, and continuous monitoring.',
 0.42, 0.38, 'medium', 'medium', true, true, true, 'CFATS RBPS'),

('Hazmat Inventory Tracking', 'hazmat_security', 'detective', 'manufacturing',
 'Real-time tracking of hazardous material quantities, locations, and access. Regulatory requirement for CFATS facilities.',
 0.35, 0.30, 'medium', 'medium', true, true, true, 'CFATS RBPS'),

('Transportation Security Plan', 'hazmat_security', 'procedural', 'manufacturing',
 'Security plan for transportation of hazardous materials including route planning, driver vetting, and tracking requirements.',
 0.30, 0.26, 'low', 'medium', true, false, true, 'DOT HMSP');

-- ============================================================================
-- CREATE CONTROL CODE MAPPING
-- Maps control IDs from mapper to control names for API integration
-- ============================================================================

-- Create mapping table if not exists
CREATE TABLE IF NOT EXISTS control_code_mapping (
  control_code VARCHAR(100) PRIMARY KEY,
  control_name VARCHAR(200) NOT NULL,
  facility_type VARCHAR(50) NOT NULL
);

-- Clean existing manufacturing mappings
DELETE FROM control_code_mapping WHERE facility_type = 'manufacturing';

-- Insert manufacturing control code mappings
INSERT INTO control_code_mapping (control_code, control_name, facility_type) VALUES
-- Perimeter
('industrial_fencing_8ft_plus', 'Industrial Fencing (8ft+)', 'manufacturing'),
('gate_access_with_guard', 'Staffed Security Gate', 'manufacturing'),
('perimeter_intrusion_detection', 'Perimeter Intrusion Detection', 'manufacturing'),
('perimeter_lighting_industrial', 'Perimeter Lighting (Industrial)', 'manufacturing'),
('cctv_perimeter', 'Perimeter CCTV', 'manufacturing'),
('vehicle_inspection_procedures', 'Vehicle Inspection Procedures', 'manufacturing'),
('clear_zone_perimeter', 'Clear Zone - Perimeter', 'manufacturing'),
('guard_patrol_program', 'Guard Patrol Program', 'manufacturing'),
('after_hours_monitoring', 'After-Hours Monitoring', 'manufacturing'),
('perimeter_alarm_system', 'Perimeter Alarm System', 'manufacturing'),

-- Production
('production_floor_access_control', 'Production Floor Access Control', 'manufacturing'),
('employee_badge_access_control', 'Employee Badge Access Control', 'manufacturing'),
('cctv_production_floor', 'CCTV - Production Floor', 'manufacturing'),
('equipment_lockout_tagout', 'Equipment Lockout/Tagout', 'manufacturing'),
('tool_crib_access_control', 'Tool Crib Access Control', 'manufacturing'),
('tool_tracking_system', 'Tool Tracking System', 'manufacturing'),
('photography_prohibition_enforcement', 'Photography Prohibition Enforcement', 'manufacturing'),
('production_area_zoning', 'Production Area Zoning', 'manufacturing'),
('access_zone_separation', 'Access Zone Separation', 'manufacturing'),
('scrap_disposal_procedures', 'Scrap Disposal Procedures', 'manufacturing'),
('wip_security', 'Work-in-Progress Security', 'manufacturing'),
('equipment_monitoring_system', 'Equipment Monitoring System', 'manufacturing'),

-- IP Protection
('r_and_d_area_access_control', 'R&D Area Access Control', 'manufacturing'),
('biometric_access_critical_areas', 'Biometric Access - Critical Areas', 'manufacturing'),
('visitor_nda_procedures', 'Visitor NDA Procedures', 'manufacturing'),
('clean_desk_policy', 'Clean Desk Policy', 'manufacturing'),
('prototype_security_procedures', 'Prototype Security Procedures', 'manufacturing'),
('data_loss_prevention', 'Data Loss Prevention (DLP)', 'manufacturing'),
('mobile_device_restrictions', 'Mobile Device Restrictions', 'manufacturing'),
('exit_interviews_ip_protection', 'Exit Interviews - IP Protection', 'manufacturing'),
('document_control_system', 'Document Control System', 'manufacturing'),
('production_data_encryption', 'Production Data Encryption', 'manufacturing'),
('non_disclosure_enforcement', 'Visitor NDA Procedures', 'manufacturing'),

-- Inventory
('raw_material_tracking_system', 'Raw Material Tracking System', 'manufacturing'),
('manufacturing_execution_system', 'Manufacturing Execution System (MES)', 'manufacturing'),
('cycle_counting_program', 'Cycle Counting Program', 'manufacturing'),
('raw_material_caging', 'Raw Material Caging', 'manufacturing'),
('bill_of_materials_tracking', 'Bill of Materials Tracking', 'manufacturing'),
('cctv_raw_material_storage', 'CCTV - Raw Material Storage', 'manufacturing'),
('material_reconciliation', 'Material Reconciliation', 'manufacturing'),
('two_person_rule_sensitive_areas', 'Two-Person Rule - Sensitive Areas', 'manufacturing'),
('lot_serial_tracking', 'Lot/Serial Tracking', 'manufacturing'),
('asset_tracking_rfid', 'Asset Tracking (RFID)', 'manufacturing'),

-- Shipping
('finished_goods_caging', 'Finished Goods Caging', 'manufacturing'),
('finished_goods_inventory_control', 'Finished Goods Inventory Control', 'manufacturing'),
('cctv_finished_goods_warehouse', 'CCTV - Finished Goods Warehouse', 'manufacturing'),
('cctv_loading_docks', 'CCTV - Loading Docks', 'manufacturing'),
('shipping_receiving_verification', 'Shipping/Receiving Verification', 'manufacturing'),
('driver_waiting_area', 'Driver Waiting Area', 'manufacturing'),
('dock_access_control', 'Dock Access Control', 'manufacturing'),
('outbound_manifest_verification', 'Outbound Manifest Verification', 'manufacturing'),

-- Personnel
('employee_background_checks_production', 'Employee Background Checks (Production)', 'manufacturing'),
('contractor_background_checks', 'Contractor Background Checks', 'manufacturing'),
('insider_threat_program', 'Insider Threat Program', 'manufacturing'),
('security_awareness_training_manufacturing', 'Security Awareness Training (Manufacturing)', 'manufacturing'),
('exit_bag_checks', 'Exit Bag Checks', 'manufacturing'),
('immediate_access_revocation', 'Immediate Access Revocation', 'manufacturing'),
('non_compete_enforcement', 'Non-Compete Enforcement', 'manufacturing'),
('employee_assistance_program', 'Employee Assistance Program', 'manufacturing'),
('threat_assessment_team', 'Threat Assessment Team', 'manufacturing'),
('theft_reporting_hotline', 'Theft Reporting Hotline', 'manufacturing'),

-- Contractor
('visitor_contractor_management', 'Visitor/Contractor Management', 'manufacturing'),
('visitor_escort_requirements', 'Visitor Escort Requirements', 'manufacturing'),
('supplier_vetting_program', 'Supplier Vetting Program', 'manufacturing'),
('maintenance_access_procedures', 'Maintenance Access Procedures', 'manufacturing'),
('vendor_security_program', 'Vendor Security Program', 'manufacturing'),
('temporary_badge_system', 'Temporary Badge System', 'manufacturing'),
('parts_authentication_procedures', 'Parts Authentication Procedures', 'manufacturing'),

-- Surveillance
('video_retention_30_days', 'Video Retention (30+ Days)', 'manufacturing'),
('video_analytics_manufacturing', 'Video Analytics (Manufacturing)', 'manufacturing'),
('real_time_monitoring', 'Real-Time Monitoring', 'manufacturing'),
('network_segmentation_ot_it', 'Network Segmentation (OT/IT)', 'manufacturing'),
('license_plate_recognition', 'License Plate Recognition', 'manufacturing'),
('cctv_tool_room', 'CCTV - Tool Room', 'manufacturing'),
('cctv_visitor_areas', 'CCTV - Visitor Areas', 'manufacturing'),
('motion_detection_sensors', 'Motion Detection Sensors', 'manufacturing'),
('intrusion_detection_system', 'Intrusion Detection System', 'manufacturing'),
('remote_monitoring_capability', 'Remote Monitoring Capability', 'manufacturing'),

-- Emergency
('workplace_violence_response_plan', 'Workplace Violence Response Plan', 'manufacturing'),
('production_continuity_plan', 'Production Continuity Plan', 'manufacturing'),
('ip_theft_response_procedures', 'IP Theft Response Procedures', 'manufacturing'),
('sabotage_incident_response', 'Sabotage Incident Response', 'manufacturing'),
('incident_documentation_procedures', 'Incident Documentation Procedures', 'manufacturing'),
('emergency_notification_system', 'Emergency Notification System', 'manufacturing'),
('law_enforcement_partnership', 'Law Enforcement Partnership', 'manufacturing'),
('business_continuity_planning', 'Business Continuity Planning', 'manufacturing'),

-- Hazmat
('cfats_security_plan', 'CFATS Security Plan', 'manufacturing'),
('hazmat_storage_compliance', 'Hazmat Storage Compliance', 'manufacturing'),
('hazmat_access_control', 'Hazmat Access Control', 'manufacturing'),
('hazmat_inventory_tracking', 'Hazmat Inventory Tracking', 'manufacturing'),
('transportation_security_plan', 'Transportation Security Plan', 'manufacturing'),
('hazmat_incident_procedures', 'Sabotage Incident Response', 'manufacturing'),
('regulatory_compliance_audit', 'CFATS Security Plan', 'manufacturing');

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Controls: 80
-- Categories:
--   Perimeter Security: 10
--   Production Area Security: 12
--   IP Protection: 10
--   Inventory & Material Control: 10
--   Shipping & Finished Goods: 8
--   Personnel Security: 10
--   Contractor Management: 7
--   Surveillance: 10
--   Emergency Response: 8
--   Hazmat Security: 5
-- 
-- Standards Referenced:
--   ASIS GDL-RA - General Security Risk Assessment
--   CFATS - Chemical Facility Anti-Terrorism Standards
--   NIST Manufacturing - Manufacturing Security Guidelines
--   ISO 28000 - Supply Chain Security Management
--   OSHA - Workplace Safety Requirements
--   NIST SP 800-82 - ICS Security
--   FBI Industrial Espionage - Prevention Guidelines
--   ASIS WPV - Workplace Violence Prevention
--   SAE AS6174 - Counterfeit Parts Prevention
-- ============================================================================
