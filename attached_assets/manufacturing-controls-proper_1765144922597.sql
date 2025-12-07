-- ============================================================================
-- MANUFACTURING SECURITY CONTROLS - PROPER SCHEMA
-- ============================================================================
-- Version: 1.0
-- Purpose: Manufacturing controls with correct column count (13 columns)
-- Matches schema: warehouse-controls-seed.sql format
-- ============================================================================

-- Clean up any existing manufacturing controls to prevent duplicates
DELETE FROM controls WHERE facility_type = 'manufacturing';

-- ============================================================================
-- MANUFACTURING-SPECIFIC CONTROLS (35+ controls)
-- ============================================================================

INSERT INTO controls (
  name, category, control_type, facility_type, description, 
  base_weight, reduction_percentage, estimated_cost, maintenance_level, 
  requires_training, requires_maintenance, is_active, tapa_reference
) VALUES

-- ============================================================================
-- PERIMETER SECURITY (INDUSTRIAL)
-- ============================================================================

('Industrial Fencing (8ft+)', 'physical_barriers', 'preventive', 'manufacturing',
 'High-security industrial fencing minimum 8 feet with anti-climb features, barbed wire/razor ribbon topping.',
 0.22, 0.30, 'medium', 'medium', false, true, true, 'ASIS POA'),

('Gate Access with Guard', 'access_control', 'preventive', 'manufacturing',
 'Staffed gate house controlling vehicle and pedestrian access with verification procedures.',
 0.25, 0.32, 'high', 'low', true, false, true, 'ASIS POA'),

('Vehicle Inspection Procedures', 'procedural', 'preventive', 'manufacturing',
 'Systematic inspection of vehicles entering/exiting facility for contraband, theft, and safety compliance.',
 0.15, 0.22, 'low', 'low', true, false, true, 'TAPA FSR'),

('Perimeter Intrusion Detection', 'perimeter_security', 'detective', 'manufacturing',
 'Sensor system detecting fence climbing, cutting, or lifting attempts. Early warning of perimeter breach.',
 0.28, 0.35, 'high', 'medium', true, true, true, 'ASIS POA'),

('Industrial Yard Lighting', 'perimeter_security', 'deterrent', 'manufacturing',
 'Comprehensive exterior lighting for facility yard, parking, and perimeter. Minimum 10 lux at fence, 50 lux at access points.',
 0.18, 0.22, 'medium', 'medium', false, true, true, 'ASIS POA'),

-- ============================================================================
-- PRODUCTION AREA SECURITY
-- ============================================================================

('Production Floor CCTV', 'surveillance', 'detective', 'manufacturing',
 'Comprehensive camera coverage of production floor capturing equipment operation and personnel activity.',
 0.18, 0.25, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('Work Cell Access Control', 'access_control', 'preventive', 'manufacturing',
 'Badge or biometric access control for individual work cells or production areas.',
 0.18, 0.25, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Equipment Lockout/Tagout', 'safety', 'preventive', 'manufacturing',
 'OSHA-compliant lockout/tagout procedures for equipment maintenance preventing accidental startup.',
 0.20, 0.28, 'low', 'low', true, false, true, 'OSHA'),

('Tool Crib Access Control', 'access_control', 'preventive', 'manufacturing',
 'Controlled access to tool storage with check-out logging and inventory management.',
 0.15, 0.22, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Parts Cage Security', 'physical_barriers', 'preventive', 'manufacturing',
 'Secure caging for high-value parts and components with restricted access.',
 0.18, 0.25, 'medium', 'low', false, true, true, 'ASIS GDL-RA'),

('Production Line Monitoring', 'technology', 'detective', 'manufacturing',
 'Real-time monitoring of production line status, output, and anomalies.',
 0.15, 0.22, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Emergency Shutdown System', 'safety', 'preventive', 'manufacturing',
 'Emergency stop capability for production equipment and processes with protected activation mechanisms.',
 0.22, 0.30, 'medium', 'medium', true, true, true, 'OSHA'),

-- ============================================================================
-- INTELLECTUAL PROPERTY PROTECTION
-- ============================================================================

('R&D Area Access Control', 'access_control', 'preventive', 'manufacturing',
 'High-security access control for research and development areas with biometric or multi-factor authentication.',
 0.28, 0.38, 'high', 'medium', true, true, true, 'ASIS GDL-RA'),

('Prototype Security Procedures', 'procedural', 'preventive', 'manufacturing',
 'Documented procedures for securing prototypes including storage, handling, transport, and destruction.',
 0.20, 0.28, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Document Control System', 'technology', 'preventive', 'manufacturing',
 'Systematic control of sensitive documents including classification, access logging, and retention policies.',
 0.18, 0.25, 'medium', 'medium', true, true, true, 'ISO 27001'),

('Data Loss Prevention (DLP)', 'technology', 'preventive', 'manufacturing',
 'Technical controls preventing unauthorized data exfiltration including USB blocking, email monitoring, and cloud restrictions.',
 0.22, 0.30, 'medium', 'high', true, true, true, 'ISO 27001'),

('Non-Disclosure Enforcement', 'procedural', 'preventive', 'manufacturing',
 'Active enforcement of NDA requirements including tracking, acknowledgment, and violation response.',
 0.12, 0.18, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Visitor NDA Procedures', 'procedural', 'preventive', 'manufacturing',
 'Requirement for visitors to sign NDAs before accessing sensitive areas with escort requirements.',
 0.15, 0.22, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Mobile Device Restrictions', 'procedural', 'preventive', 'manufacturing',
 'Policy restricting personal mobile devices in sensitive areas to prevent photography and data theft.',
 0.15, 0.22, 'low', 'low', true, false, true, 'ISO 27001'),

('Photography Prohibition Enforcement', 'procedural', 'preventive', 'manufacturing',
 'Active enforcement of no-photography policies in production and R&D areas including signage and monitoring.',
 0.12, 0.18, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Trade Secret Classification', 'procedural', 'preventive', 'manufacturing',
 'Formal classification system for trade secrets with handling requirements and access restrictions.',
 0.15, 0.22, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

-- ============================================================================
-- INVENTORY MANAGEMENT (MANUFACTURING)
-- ============================================================================

('Raw Material Tracking System', 'technology', 'detective', 'manufacturing',
 'System tracking raw materials from receiving through production including batch/lot tracking.',
 0.18, 0.25, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Finished Goods Inventory Control', 'technology', 'detective', 'manufacturing',
 'Systematic inventory control for finished goods including location tracking and shipment verification.',
 0.18, 0.25, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Material Reconciliation', 'procedural', 'detective', 'manufacturing',
 'Regular reconciliation of raw materials, WIP, and finished goods against production records.',
 0.15, 0.22, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Shipping/Receiving Verification', 'procedural', 'detective', 'manufacturing',
 'Verification procedures for all inbound and outbound shipments including piece count and documentation.',
 0.15, 0.22, 'low', 'low', true, false, true, 'TAPA FSR'),

('Bill of Materials Tracking', 'technology', 'detective', 'manufacturing',
 'System tracking bill of materials consumption against production output for variance analysis.',
 0.12, 0.18, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Raw Material Caging', 'physical_barriers', 'preventive', 'manufacturing',
 'Secure caging for high-value raw materials with restricted access and inventory control.',
 0.18, 0.25, 'medium', 'low', false, true, true, 'ASIS GDL-RA'),

('Finished Goods Caging', 'physical_barriers', 'preventive', 'manufacturing',
 'Secure caging for high-value finished goods awaiting shipment.',
 0.18, 0.25, 'medium', 'low', false, true, true, 'ASIS GDL-RA'),

-- ============================================================================
-- MANUFACTURING SURVEILLANCE
-- ============================================================================

('CCTV - Raw Material Storage', 'surveillance', 'detective', 'manufacturing',
 'Camera coverage of raw material storage areas capturing material handling and access.',
 0.15, 0.22, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('CCTV - Finished Goods Warehouse', 'surveillance', 'detective', 'manufacturing',
 'Camera coverage of finished goods warehouse capturing inventory handling and shipping.',
 0.15, 0.22, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('CCTV - R&D Areas', 'surveillance', 'detective', 'manufacturing',
 'Camera coverage of research and development areas with restricted access to footage.',
 0.18, 0.25, 'medium', 'medium', false, true, true, 'ASIS GDL-RA'),

('Video Analytics - Manufacturing', 'surveillance', 'detective', 'manufacturing',
 'AI-powered video analytics detecting suspicious behavior, safety violations, and process deviations.',
 0.18, 0.25, 'high', 'high', true, true, true, 'ASIS GDL-RA'),

('CCTV - Loading Dock', 'surveillance', 'detective', 'manufacturing',
 'Comprehensive camera coverage of loading dock areas capturing all shipping and receiving activity.',
 0.18, 0.25, 'medium', 'medium', false, true, true, 'TAPA FSR'),

-- ============================================================================
-- PERSONNEL SECURITY (MANUFACTURING)
-- ============================================================================

('Background Checks - Production Staff', 'procedural', 'preventive', 'manufacturing',
 'Pre-employment background checks for production and warehouse employees.',
 0.12, 0.18, 'low', 'low', false, false, true, 'ASIS GDL-RA'),

('Contractor Background Checks', 'procedural', 'preventive', 'manufacturing',
 'Background check requirements for contractors with ongoing access to facility.',
 0.12, 0.18, 'low', 'low', false, false, true, 'ASIS GDL-RA'),

('Security Awareness Training - Manufacturing', 'procedural', 'preventive', 'manufacturing',
 'Security awareness training tailored to manufacturing environment covering IP protection, theft prevention, and incident reporting.',
 0.15, 0.22, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Exit Interviews - IP Protection', 'procedural', 'detective', 'manufacturing',
 'Exit interview procedures focused on IP protection including equipment return, data handling, and ongoing obligations.',
 0.10, 0.15, 'low', 'low', true, false, true, 'ASIS GDL-RA'),

('Non-Compete Enforcement', 'procedural', 'preventive', 'manufacturing',
 'Active enforcement of non-compete agreements for employees with access to trade secrets.',
 0.12, 0.18, 'medium', 'medium', false, false, true, 'ASIS GDL-RA'),

-- ============================================================================
-- PHYSICAL BARRIERS & ACCESS (MANUFACTURING)
-- ============================================================================

('Tool Room Security Barrier', 'physical_barriers', 'preventive', 'manufacturing',
 'Physical barrier securing tool room with controlled access for tool check-out.',
 0.15, 0.22, 'medium', 'low', false, true, true, 'ASIS GDL-RA'),

('Hazmat Storage Compliance', 'environmental', 'preventive', 'manufacturing',
 'Compliant hazardous material storage meeting OSHA, EPA, and fire code requirements.',
 0.20, 0.28, 'medium', 'high', true, true, true, 'OSHA'),

('Prototype Secure Storage', 'physical_barriers', 'preventive', 'manufacturing',
 'Dedicated secure storage for prototypes with restricted access, logging, and environmental controls.',
 0.22, 0.30, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Cleanroom Access Control', 'access_control', 'preventive', 'manufacturing',
 'Controlled access to cleanroom environments with gowning requirements and contamination prevention.',
 0.20, 0.28, 'high', 'medium', true, true, true, 'ISO 14644'),

('Server Room Access Control', 'access_control', 'preventive', 'manufacturing',
 'Restricted access to manufacturing IT/server rooms with multi-factor authentication and audit logging.',
 0.22, 0.30, 'medium', 'medium', true, true, true, 'ISO 27001'),

-- ============================================================================
-- EMERGENCY RESPONSE & SAFETY
-- ============================================================================

('Manufacturing Incident Response Plan', 'procedural', 'preventive', 'manufacturing',
 'Documented response procedures for security incidents, equipment failures, and production emergencies.',
 0.18, 0.25, 'low', 'medium', true, false, true, 'ASIS GDL-RA'),

('Fire Suppression - Production Areas', 'environmental', 'preventive', 'manufacturing',
 'Fire suppression systems appropriate for production environment including wet/dry sprinklers or specialized agents.',
 0.25, 0.35, 'high', 'high', true, true, true, 'NFPA'),

('Emergency Evacuation Plan', 'procedural', 'preventive', 'manufacturing',
 'Documented evacuation procedures with assembly points, accountability, and drill requirements.',
 0.15, 0.22, 'low', 'medium', true, false, true, 'OSHA'),

('Safety Equipment Stations', 'safety', 'preventive', 'manufacturing',
 'Strategically placed eyewash, fire extinguishers, first aid kits, and emergency equipment.',
 0.12, 0.18, 'low', 'medium', false, true, true, 'OSHA'),

-- ============================================================================
-- TECHNOLOGY CONTROLS
-- ============================================================================

('Asset Tracking - RFID', 'technology', 'detective', 'manufacturing',
 'RFID-based asset tracking system for equipment, inventory, and high-value items.',
 0.18, 0.25, 'medium', 'medium', true, true, true, 'ISO 28000'),

('Equipment Monitoring System', 'technology', 'detective', 'manufacturing',
 'Remote monitoring of critical equipment status, performance, and security sensors.',
 0.15, 0.22, 'medium', 'medium', true, true, true, 'ISO 27001'),

('Production Data Encryption', 'technology', 'preventive', 'manufacturing',
 'Encryption of production data at rest and in transit protecting intellectual property.',
 0.18, 0.25, 'medium', 'medium', true, true, true, 'ISO 27001'),

('Network Segmentation (OT/IT)', 'technology', 'preventive', 'manufacturing',
 'Separation of operational technology (OT) networks from information technology (IT) networks.',
 0.22, 0.30, 'medium', 'high', true, true, true, 'NIST CSF'),

('Industrial Control System Security', 'technology', 'preventive', 'manufacturing',
 'Security controls for SCADA, PLCs, and industrial control systems including patching and monitoring.',
 0.25, 0.35, 'high', 'high', true, true, true, 'NIST CSF'),

('Badge Access System', 'access_control', 'preventive', 'manufacturing',
 'Electronic badge access control system with audit logging, anti-passback, and zone restrictions.',
 0.20, 0.28, 'medium', 'medium', true, true, true, 'ASIS GDL-RA'),

('Visitor Management System', 'access_control', 'preventive', 'manufacturing',
 'Automated visitor registration, badge printing, and tracking with pre-registration capability.',
 0.15, 0.22, 'medium', 'medium', true, true, true, 'ASIS GDL-RA');


-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify manufacturing controls were inserted:
-- SELECT COUNT(*) as manufacturing_count FROM controls WHERE facility_type = 'manufacturing';
-- Expected: 50+ controls

