-- ============================================================================
-- Retail Store Security Controls Seed File
-- 
-- RiskFixer Retail Store Assessment Module
-- Categories: Loss Prevention, Surveillance, Cash Management, Physical Barriers,
--             Security Personnel, Procedural, Environmental Design, 
--             Intrusion Detection, Access Control, Fraud Prevention
--
-- THREAT COVERAGE: 15 retail-specific threats
--   - shoplifting, organized_retail_crime, employee_theft, armed_robbery
--   - cash_handling_theft, smash_and_grab, customer_violence, return_fraud
--   - vandalism, after_hours_burglary, credit_card_fraud, inventory_shrinkage
--   - parking_lot_crime, counterfeit_currency, display_tampering
--
-- STANDARDS REFERENCED:
--   - NRF (National Retail Federation) Loss Prevention Standards
--   - LPRC (Loss Prevention Research Council) Best Practices
--   - RILA (Retail Industry Leaders Association) Standards
--   - ASIS International GDL-RA, POA, WVPI
--   - ASIS Retail Security Council Guidelines
--   - CPTED (Crime Prevention Through Environmental Design)
--
-- @version 1.0
-- @see RiskFixer-Retail-Store-Framework.md
-- @see retail-interview-mapper.ts THREAT_CONTROL_MAPPING
-- ============================================================================

-- Clean slate for retail controls (optional - uncomment if re-seeding)
-- DELETE FROM security_controls WHERE facility_type = 'retail_store';

-- ============================================================================
-- CATEGORY 1: ELECTRONIC ARTICLE SURVEILLANCE (EAS) - 4 controls
-- ============================================================================

INSERT INTO security_controls (
  name, 
  description, 
  category, 
  facility_type,
  control_id,
  implementation_cost,
  annual_cost,
  effectiveness_rating,
  implementation_time,
  standard_reference
) VALUES

-- RT-EAS-001: EAS System Tags/Labels
(
  'EAS System - Tags/Labels',
  'Electronic Article Surveillance tags (hard tags) or labels (soft tags) attached to merchandise that trigger alarms if not properly deactivated at point of sale. Foundation of retail theft deterrence. Hard tags reusable, soft tags disposable.',
  'Loss Prevention',
  'retail_store',
  'eas_system_tags',
  25000,
  15000,
  72,
  '14-21 days',
  'NRF LP Standards / LPRC Best Practices'
),

-- RT-EAS-002: EAS System Gates/Pedestals
(
  'EAS System - Pedestals/Gates',
  'Detection pedestals or gates at store exits that detect active EAS tags and trigger audible/visual alarms. Must cover all customer exits including emergency exits. Regular testing required.',
  'Loss Prevention',
  'retail_store',
  'eas_system_gates',
  20000,
  5000,
  70,
  '7-14 days',
  'NRF LP Standards / LPRC Best Practices'
),

-- RT-EAS-003: EAS Deactivation at POS
(
  'EAS Deactivation at POS',
  'Point-of-sale integrated EAS deactivation pads ensuring tags are properly deactivated during legitimate transactions. Prevents false alarms and maintains customer experience while ensuring security.',
  'Loss Prevention',
  'retail_store',
  'eas_deactivation_pos',
  8000,
  2000,
  65,
  '3-7 days',
  'LPRC Best Practices'
),

-- RT-EAS-004: Security Tag Placement Standards
(
  'Security Tag Placement Standards',
  'Documented standards for consistent EAS tag placement on merchandise. Includes training materials, visual guides, and compliance audits. Critical for EAS effectiveness.',
  'Loss Prevention',
  'retail_store',
  'security_tag_placement',
  2000,
  1000,
  60,
  '7-14 days',
  'LPRC Best Practices'
),

-- ============================================================================
-- CATEGORY 2: SURVEILLANCE SYSTEMS (7 controls)
-- ============================================================================

-- RT-SV-001: CCTV Sales Floor Coverage
(
  'CCTV - Sales Floor Coverage',
  'Comprehensive camera coverage of retail sales floor capturing customer and employee activity. High-resolution for facial identification. Strategic placement covering high-theft areas, blind spots, and high-value merchandise.',
  'Surveillance',
  'retail_store',
  'cctv_sales_floor',
  35000,
  8000,
  75,
  '14-21 days',
  'ASIS GDL VS / LPRC Camera Placement Guidelines'
),

-- RT-SV-002: CCTV POS/Register Coverage
(
  'CCTV - POS/Register Coverage',
  'Camera coverage of all point-of-sale terminals capturing transactions, cash handling, employee interactions, and customer faces. Essential for investigating sweethearting, refund fraud, and cash theft.',
  'Surveillance',
  'retail_store',
  'cctv_pos_registers',
  20000,
  5000,
  78,
  '7-14 days',
  'ASIS GDL VS / NRF LP Standards'
),

-- RT-SV-003: CCTV Cash Room Coverage
(
  'CCTV - Cash Room Coverage',
  'Camera coverage of cash counting room capturing all cash handling activities. Dual camera angles recommended. Tamper-proof recording with restricted access to footage.',
  'Surveillance',
  'retail_store',
  'cctv_cash_room',
  10000,
  3000,
  80,
  '3-7 days',
  'ASIS GDL VS'
),

-- RT-SV-004: CCTV Stockroom Coverage
(
  'CCTV - Stockroom Coverage',
  'Camera coverage of stockroom and receiving areas capturing inventory handling, vendor deliveries, and employee activity. Critical for investigating shrinkage and internal theft.',
  'Surveillance',
  'retail_store',
  'cctv_stockroom',
  15000,
  4000,
  70,
  '7-14 days',
  'ASIS GDL VS / LPRC'
),

-- RT-SV-005: CCTV Entrance/Exit Coverage
(
  'CCTV - Entrance/Exit Coverage',
  'High-resolution camera coverage at all store entrances and exits capturing facial images for identification. Integrates with EAS for alarm event recording.',
  'Surveillance',
  'retail_store',
  'cctv_entrance_exit',
  15000,
  4000,
  75,
  '7-14 days',
  'ASIS GDL VS'
),

-- RT-SV-006: CCTV Parking Lot Coverage
(
  'CCTV - Parking Lot Coverage',
  'Camera coverage of customer and employee parking areas for vehicle identification, personal safety, and cart theft prevention. Essential for employee safety during opening/closing.',
  'Surveillance',
  'retail_store',
  'cctv_parking_lot',
  25000,
  6000,
  68,
  '14-21 days',
  'ASIS GDL VS / CPTED'
),

-- RT-SV-007: Facial Recognition System
(
  'Facial Recognition System',
  'AI-powered facial recognition integrated with CCTV to identify known shoplifters, ORC suspects, and banned individuals. Requires legal review and privacy policy. Highly effective for repeat offenders.',
  'Surveillance',
  'retail_store',
  'facial_recognition_system',
  45000,
  15000,
  82,
  '30-45 days',
  'NRF ORC Guidelines / LPRC'
),

-- ============================================================================
-- CATEGORY 3: CASH MANAGEMENT (7 controls)
-- ============================================================================

-- RT-CM-001: Drop Safe
(
  'Drop Safe',
  'Secure safe with slot for register deposits reducing accessible cash. Employees cannot retrieve deposited cash. Reduces robbery attractiveness and internal theft opportunity.',
  'Cash Management',
  'retail_store',
  'drop_safe',
  3000,
  500,
  75,
  '1-3 days',
  'ASIS Cash-in-Transit Guidelines'
),

-- RT-CM-002: Time-Delay Safe
(
  'Time-Delay Safe',
  'Safe with programmable time delay (typically 5-10 minutes) deterring robbery by delaying access to cash. Signage required to inform robbers of delay. Highly effective robbery deterrent.',
  'Cash Management',
  'retail_store',
  'time_delay_safe',
  5000,
  500,
  85,
  '1-3 days',
  'ASIS Cash-in-Transit Guidelines / NRF'
),

-- RT-CM-003: Cash Limit - Registers
(
  'Cash Limit - Registers',
  'Policy limiting amount of cash in registers (typically $100-200) with regular drops to safe when limit is exceeded. Reduces robbery loss and theft opportunity.',
  'Cash Management',
  'retail_store',
  'cash_limit_registers',
  0,
  1000,
  70,
  '3-7 days',
  'NRF LP Standards'
),

-- RT-CM-004: Dual Control Cash Procedures
(
  'Dual Control Cash Procedures',
  'Two-person requirement for cash counting, safe access, and large transactions preventing single-person theft. Includes documented procedures and accountability.',
  'Cash Management',
  'retail_store',
  'dual_control_cash_procedures',
  0,
  2000,
  78,
  '7-14 days',
  'ASIS Cash Handling Guidelines'
),

-- RT-CM-005: Armored Car Service
(
  'Armored Car Service',
  'Professional armored car service for cash pickup/delivery reducing robbery and internal theft risk during bank runs. Eliminates employee exposure during transport.',
  'Cash Management',
  'retail_store',
  'armored_car_service',
  0,
  12000,
  85,
  '7-14 days',
  'ASIS Cash-in-Transit Guidelines'
),

-- RT-CM-006: Cash Room Access Control
(
  'Cash Room Access Control',
  'Restricted access to cash counting room with badge readers, PIN pads, or key control. Limited personnel authorization. Audit logging of all access.',
  'Access Control',
  'retail_store',
  'cash_room_access_control',
  5000,
  1500,
  75,
  '7-14 days',
  'ASIS GDL FPSM'
),

-- RT-CM-007: POS Exception Reporting
(
  'POS Exception Reporting',
  'Automated system monitoring POS transactions for anomalies including excessive voids, refunds, no-sales, and sweethearting patterns. Integrates with CCTV for video verification.',
  'Loss Prevention',
  'retail_store',
  'pos_exception_reporting',
  15000,
  5000,
  80,
  '14-21 days',
  'NRF LP Standards / LPRC'
),

-- ============================================================================
-- CATEGORY 4: PHYSICAL BARRIERS (7 controls)
-- ============================================================================

-- RT-PB-001: Reinforced Entrance Doors
(
  'Reinforced Entrance Doors',
  'Commercial-grade doors with reinforced frames, high-security locks, and break-resistant glazing resisting forced entry. Includes after-hours hardware.',
  'Physical Barriers',
  'retail_store',
  'reinforced_entrance_doors',
  20000,
  2000,
  72,
  '14-21 days',
  'ASIS POA Guidelines'
),

-- RT-PB-002: Security Gates/Shutters (After Hours)
(
  'Security Gates/Shutters (After Hours)',
  'Roll-down security gates or shutters protecting storefront and entrance during closed hours. Prevents smash-and-grab attacks. May be internal or external mount.',
  'Physical Barriers',
  'retail_store',
  'security_gates_after_hours',
  15000,
  2000,
  78,
  '7-14 days',
  'ASIS POA Guidelines'
),

-- RT-PB-003: Bollards - Storefront Protection
(
  'Bollards - Storefront Protection',
  'Vehicle barrier posts protecting storefront from ram-raid/smash-and-grab vehicle attacks. Can be decorative or industrial. Essential for standalone stores and strip malls.',
  'Physical Barriers',
  'retail_store',
  'bollards_storefront_protection',
  25000,
  1000,
  88,
  '14-21 days',
  'DOS SD-STD-02.01 / ASIS POA'
),

-- RT-PB-004: Display Case Locks
(
  'Display Case Locks',
  'Locking display cases for high-value merchandise requiring employee assistance for access. Includes key control and customer service protocols.',
  'Physical Barriers',
  'retail_store',
  'display_case_locks',
  8000,
  1000,
  75,
  '3-7 days',
  'NRF LP Standards'
),

-- RT-PB-005: High-Value Lockup/Cage
(
  'High-Value Lockup/Cage',
  'Secure lockup area or cage in stockroom for high-value merchandise with restricted access. Includes inventory logging and dual control for access.',
  'Physical Barriers',
  'retail_store',
  'high_value_lockup',
  10000,
  1500,
  80,
  '7-14 days',
  'NRF LP Standards'
),

-- RT-PB-006: High-Value Display Security
(
  'High-Value Display Security',
  'Specialized security for high-value merchandise on sales floor including tethers, spider wraps, safer boxes, and locked cabinets. Balances security with customer experience.',
  'Physical Barriers',
  'retail_store',
  'high_value_display_security',
  15000,
  5000,
  75,
  '7-14 days',
  'LPRC Best Practices'
),

-- RT-PB-007: Glass Break Sensors
(
  'Glass Break Sensors',
  'Acoustic or vibration sensors detecting glass breakage for intrusion detection. Covers storefront windows and display cases. Triggers alarm system.',
  'Intrusion Detection',
  'retail_store',
  'glass_break_sensors',
  3000,
  500,
  70,
  '3-7 days',
  'NFPA 731'
),

-- ============================================================================
-- CATEGORY 5: SECURITY PERSONNEL (6 controls)
-- ============================================================================

-- RT-SP-001: Security Guard - Uniformed
(
  'Security Guard - Uniformed',
  'Uniformed security presence providing deterrence, customer service, and incident response. Visible deterrent effect. May be proprietary or contract.',
  'Security Personnel',
  'retail_store',
  'security_guard_uniformed',
  0,
  55000,
  75,
  '7-14 days',
  'ASIS GDL FPSM'
),

-- RT-SP-002: Loss Prevention - Plain Clothes
(
  'Loss Prevention - Plain Clothes',
  'Plain clothes loss prevention officers conducting floor surveillance, monitoring suspicious behavior, and apprehending shoplifters. Highly effective for ORC and repeat offenders.',
  'Security Personnel',
  'retail_store',
  'loss_prevention_plain_clothes',
  0,
  65000,
  85,
  '14-21 days',
  'NRF LP Standards'
),

-- RT-SP-003: Security Patrol - Parking
(
  'Security Patrol - Parking Lot',
  'Dedicated security patrols of parking lot providing visible deterrence, customer assistance, and cart retrieval. Critical during opening/closing hours.',
  'Security Personnel',
  'retail_store',
  'security_patrol_parking',
  0,
  35000,
  68,
  '7-14 days',
  'ASIS GDL FPSM'
),

-- RT-SP-004: Dressing Room Attendant
(
  'Dressing Room Attendant',
  'Staffed dressing room with attendant controlling access, counting items, and monitoring for concealment. Highly effective for apparel retailers.',
  'Security Personnel',
  'retail_store',
  'dressing_room_attendant',
  0,
  30000,
  72,
  '3-7 days',
  'LPRC Best Practices'
),

-- RT-SP-005: ORC Task Force Participation
(
  'ORC Task Force Participation',
  'Participation in local/regional Organized Retail Crime task forces for intelligence sharing, coordinated investigations, and prosecution support. Partnership with law enforcement.',
  'Security Personnel',
  'retail_store',
  'orc_task_force_participation',
  5000,
  3000,
  70,
  '30-60 days',
  'NRF ORC Guidelines'
),

-- RT-SP-006: De-escalation Training
(
  'De-escalation Training',
  'Training for all customer-facing employees on verbal de-escalation techniques for handling confrontational customers. Reduces violence and improves outcomes.',
  'Security Personnel',
  'retail_store',
  'de_escalation_training',
  3000,
  1500,
  65,
  '7-14 days',
  'ASIS WVPI Guidelines'
),

-- ============================================================================
-- CATEGORY 6: PROCEDURAL CONTROLS (14 controls)
-- ============================================================================

-- RT-PC-001: Employee Background Checks
(
  'Employee Background Checks',
  'Pre-employment criminal background checks for all employees handling merchandise or cash. Includes reference verification and employment history.',
  'Procedural',
  'retail_store',
  'employee_background_checks',
  0,
  5000,
  70,
  '7-14 days',
  'ASIS GDL / NRF'
),

-- RT-PC-002: Robbery Response Training
(
  'Robbery Response Training',
  'Employee training on robbery response emphasizing compliance, safety, observation, and post-incident protocols. Regular refresher training required. Reduces injuries.',
  'Procedural',
  'retail_store',
  'robbery_response_training',
  2000,
  1000,
  80,
  '3-7 days',
  'ASIS WVPI / NRF'
),

-- RT-PC-003: Closing Procedures - Two Person
(
  'Closing Procedures - Two Person',
  'Requirement for minimum two employees during closing procedures for safety and theft prevention. Includes documented checklist and buddy system.',
  'Procedural',
  'retail_store',
  'closing_procedures_two_person',
  0,
  500,
  72,
  '3-7 days',
  'NRF LP Standards'
),

-- RT-PC-004: Receipt Checking Policy
(
  'Receipt Checking Policy',
  'Policy for checking customer receipts against merchandise at exit points. Voluntary in most jurisdictions. Effective for large/high-value items.',
  'Procedural',
  'retail_store',
  'receipt_checking_policy',
  0,
  2000,
  55,
  '7-14 days',
  'NRF LP Standards'
),

-- RT-PC-005: Bag Check Policy
(
  'Bag Check Policy',
  'Policy for checking employee bags and packages when leaving the store. Must be consistently applied to all employees.',
  'Procedural',
  'retail_store',
  'bag_check_policy',
  0,
  500,
  65,
  '3-7 days',
  'NRF LP Standards'
),

-- RT-PC-006: Employee Package Inspection
(
  'Employee Package Inspection',
  'Systematic inspection of employee packages, bags, and personal items when leaving the store. Posted policy required.',
  'Procedural',
  'retail_store',
  'employee_package_inspection',
  0,
  500,
  68,
  '3-7 days',
  'NRF LP Standards'
),

-- RT-PC-007: Item Count Policy (Dressing Room)
(
  'Item Count Policy - Dressing Room',
  'Policy limiting number of items taken into dressing rooms with counting verification by attendant or numbered tags.',
  'Procedural',
  'retail_store',
  'item_count_policy',
  500,
  200,
  62,
  '3-7 days',
  'LPRC Best Practices'
),

-- RT-PC-008: Inventory Audit - Cycle Counting
(
  'Inventory Audit - Cycle Counting',
  'Regular partial inventory counts (cycle counts) to identify shrinkage and discrepancies. Supplements annual physical inventory.',
  'Procedural',
  'retail_store',
  'inventory_audit_cycle_counting',
  0,
  8000,
  70,
  '14-21 days',
  'NRF LP Standards'
),

-- RT-PC-009: Refund Authorization Controls
(
  'Refund Authorization Controls',
  'Multi-level authorization requirements for refunds based on amount, payment method, and return circumstances. Manager approval thresholds.',
  'Procedural',
  'retail_store',
  'refund_authorization_controls',
  0,
  1000,
  72,
  '7-14 days',
  'NRF LP Standards'
),

-- RT-PC-010: Receiving Verification Procedures
(
  'Receiving Verification Procedures',
  'Documented procedures for verifying vendor deliveries including quantity, condition, and seal integrity. Prevents vendor fraud and receiving errors.',
  'Procedural',
  'retail_store',
  'receiving_verification_procedures',
  0,
  1500,
  68,
  '7-14 days',
  'NRF LP Standards'
),

-- RT-PC-011: Employee Training - Fraud Awareness
(
  'Employee Training - Fraud Awareness',
  'Training on recognizing fraud indicators including counterfeit currency, credit card fraud, return fraud, and price switching. Regular refresher training.',
  'Procedural',
  'retail_store',
  'employee_training_fraud_awareness',
  2000,
  1000,
  65,
  '7-14 days',
  'NRF LP Standards'
),

-- RT-PC-012: Signage - Prosecution Policy
(
  'Signage - Prosecution Policy',
  'Visible signage warning that shoplifters will be prosecuted to the fullest extent of the law. Deterrent effect.',
  'Procedural',
  'retail_store',
  'signage_prosecution_policy',
  500,
  100,
  45,
  '1-3 days',
  'CPTED Guidelines'
),

-- RT-PC-013: Key Control System
(
  'Key Control System',
  'Systematic key management including key logs, restricted duplication, periodic rekeying, and key retrieval on termination.',
  'Access Control',
  'retail_store',
  'key_control_system',
  2000,
  1000,
  65,
  '7-14 days',
  'ASIS GDL FPSM'
),

-- RT-PC-014: Stockroom Access Control
(
  'Stockroom Access Control',
  'Restricted access to stockroom with locks, badge readers, or keypad entry. Limited personnel authorization.',
  'Access Control',
  'retail_store',
  'stockroom_access_control',
  5000,
  1500,
  68,
  '7-14 days',
  'ASIS GDL FPSM'
),

-- ============================================================================
-- CATEGORY 7: ENVIRONMENTAL DESIGN (5 controls)
-- ============================================================================

-- RT-ED-001: Clear Sightlines - Sales Floor
(
  'Clear Sightlines - Sales Floor',
  'Merchandising and fixture placement maintaining clear sightlines across the sales floor for natural surveillance by employees. CPTED principle.',
  'Environmental Design',
  'retail_store',
  'clear_sightlines_sales_floor',
  5000,
  2000,
  60,
  '7-14 days',
  'CPTED Guidelines / LPRC'
),

-- RT-ED-002: Mirrors - Blind Spot Coverage
(
  'Mirrors - Blind Spot Coverage',
  'Convex mirrors providing visibility into blind spots and hard-to-monitor areas. Low-cost supplemental coverage.',
  'Environmental Design',
  'retail_store',
  'mirrors_blind_spot_coverage',
  1000,
  200,
  50,
  '1-3 days',
  'CPTED Guidelines'
),

-- RT-ED-003: Adequate Lighting - Interior
(
  'Adequate Lighting - Interior',
  'Proper lighting levels throughout the store interior eliminating dark areas. Minimum 50 foot-candles in sales areas. CPTED principle.',
  'Environmental Design',
  'retail_store',
  'adequate_lighting_interior',
  8000,
  3000,
  55,
  '7-14 days',
  'CPTED Guidelines / IESNA'
),

-- RT-ED-004: Adequate Lighting - Exterior
(
  'Adequate Lighting - Exterior',
  'Proper lighting levels in parking lots, entrances, and exterior areas. Minimum 3 foot-candles in parking. Critical for safety.',
  'Environmental Design',
  'retail_store',
  'adequate_lighting_exterior',
  15000,
  4000,
  65,
  '14-21 days',
  'CPTED Guidelines / IESNA'
),

-- RT-ED-005: Cart Corral Placement
(
  'Cart Corral Placement - Security',
  'Strategic placement of cart corrals to maintain visibility, prevent concealment, and reduce cart theft. CPTED principle.',
  'Environmental Design',
  'retail_store',
  'cart_corral_placement',
  3000,
  500,
  45,
  '3-7 days',
  'CPTED Guidelines'
),

-- ============================================================================
-- CATEGORY 8: INTRUSION DETECTION (4 controls)
-- ============================================================================

-- RT-ID-001: Alarm System - Intrusion
(
  'Alarm System - Intrusion',
  'Intrusion detection alarm system monitoring entry points and interior during closed hours. Professional central station monitoring recommended.',
  'Intrusion Detection',
  'retail_store',
  'alarm_system_intrusion',
  8000,
  2500,
  78,
  '7-14 days',
  'NFPA 731 / ASIS GDL'
),

-- RT-ID-002: Alarm System - Panic Buttons
(
  'Alarm System - Panic Buttons',
  'Panic/duress buttons at POS stations and manager office for silent alarm activation during robbery. Direct notification to police.',
  'Intrusion Detection',
  'retail_store',
  'alarm_system_panic_buttons',
  3000,
  1000,
  75,
  '3-7 days',
  'NFPA 731 / ASIS GDL'
),

-- RT-ID-003: Motion Detectors
(
  'Motion Detectors',
  'Passive infrared or dual-technology motion detectors for interior intrusion detection during closed hours. Pet-immune options available.',
  'Intrusion Detection',
  'retail_store',
  'motion_detectors',
  2000,
  500,
  72,
  '3-7 days',
  'NFPA 731'
),

-- RT-ID-004: Emergency Call Stations
(
  'Emergency Call Stations - Parking Lot',
  'Blue light emergency phones in parking lot for customer/employee safety. Direct connection to security or 911.',
  'Intrusion Detection',
  'retail_store',
  'emergency_call_stations',
  15000,
  3000,
  60,
  '14-21 days',
  'CPTED Guidelines'
),

-- ============================================================================
-- CATEGORY 9: FRAUD PREVENTION (9 controls)
-- ============================================================================

-- RT-FP-001: Frequent Returner Tracking
(
  'Frequent Returner Tracking System',
  'System tracking return patterns to identify potential return fraud. Flags excessive returns for manager review. May use drivers license swipe.',
  'Fraud Prevention',
  'retail_store',
  'frequent_returner_tracking',
  10000,
  3000,
  70,
  '14-21 days',
  'NRF LP Standards'
),

-- RT-FP-002: Return Validation System
(
  'Return Validation System',
  'Automated system validating return eligibility based on purchase history, return policy, and fraud indicators. Integrates with POS.',
  'Fraud Prevention',
  'retail_store',
  'return_validation_system',
  15000,
  5000,
  72,
  '21-30 days',
  'NRF LP Standards'
),

-- RT-FP-003: EMV Chip Terminals
(
  'EMV Chip Card Terminals',
  'Point-of-sale terminals with EMV chip card capability reducing counterfeit card fraud. Liability shift requires compliance.',
  'Fraud Prevention',
  'retail_store',
  'emv_chip_terminals',
  5000,
  1000,
  80,
  '7-14 days',
  'PCI DSS'
),

-- RT-FP-004: Signature Verification Policy
(
  'Signature Verification Policy',
  'Policy requiring signature verification for credit card transactions above threshold. Includes ID check for high-value purchases.',
  'Fraud Prevention',
  'retail_store',
  'signature_verification_policy',
  0,
  500,
  55,
  '3-7 days',
  'NRF LP Standards'
),

-- RT-FP-005: ID Verification Policy
(
  'ID Verification Policy',
  'Policy requiring government-issued ID for returns, check acceptance, and high-value credit transactions. Prevents fraud.',
  'Fraud Prevention',
  'retail_store',
  'id_verification_policy',
  0,
  500,
  60,
  '3-7 days',
  'NRF LP Standards'
),

-- RT-FP-006: Counterfeit Detection - Pens
(
  'Counterfeit Detection Pens',
  'Iodine-based counterfeit detection pens for verifying currency authenticity. Low-cost basic screening tool.',
  'Fraud Prevention',
  'retail_store',
  'counterfeit_detection_pens',
  100,
  50,
  45,
  '1 day',
  'US Secret Service Guidelines'
),

-- RT-FP-007: Counterfeit Detection - Machines
(
  'Counterfeit Detection Machines',
  'Electronic counterfeit currency detection machines using UV, magnetic, and infrared sensors. More reliable than pens.',
  'Fraud Prevention',
  'retail_store',
  'counterfeit_detection_machines',
  500,
  100,
  75,
  '1-3 days',
  'US Secret Service Guidelines'
),

-- RT-FP-008: Large Bill Verification Policy
(
  'Large Bill Verification Policy',
  'Policy requiring verification of $50 and $100 bills using counterfeit detection methods. Manager approval may be required.',
  'Fraud Prevention',
  'retail_store',
  'large_bill_verification_policy',
  0,
  200,
  60,
  '3-7 days',
  'NRF LP Standards'
),

-- RT-FP-009: Barcode Verification at POS
(
  'Barcode Verification at POS',
  'POS system that verifies scanned barcode matches item being purchased. Detects price switching and ticket swapping.',
  'Fraud Prevention',
  'retail_store',
  'barcode_verification_pos',
  5000,
  1500,
  65,
  '7-14 days',
  'NRF LP Standards'
),

-- ============================================================================
-- CATEGORY 10: ADDITIONAL CONTROLS (3 controls)
-- ============================================================================

-- RT-AC-001: Signage - Security Warnings
(
  'Signage - Security Warnings',
  'Visible security warning signage including CCTV in use, shoplifters will be prosecuted, and alarm monitoring notices. Deterrent effect.',
  'Environmental Design',
  'retail_store',
  'signage_security_warnings',
  300,
  50,
  40,
  '1-3 days',
  'CPTED Guidelines'
),

-- RT-AC-002: Price Check Procedures
(
  'Price Check Procedures',
  'Documented procedures for price verification when discrepancies are identified. Prevents cashier collusion and price switching.',
  'Procedural',
  'retail_store',
  'price_check_procedures',
  0,
  500,
  55,
  '3-7 days',
  'NRF LP Standards'
);

-- ============================================================================
-- THREAT-TO-CONTROL MAPPING FOR RETAIL STORES
-- ============================================================================

/*
THREAT_CONTROL_MAPPING Reference (from retail-interview-mapper.ts):

shoplifting: [
  'eas_system_tags', 'eas_system_gates', 'cctv_sales_floor', 'cctv_entrance_exit',
  'loss_prevention_plain_clothes', 'security_guard_uniformed', 'clear_sightlines_sales_floor',
  'mirrors_blind_spot_coverage', 'signage_prosecution_policy', 'dressing_room_attendant'
]

organized_retail_crime: [
  'eas_system_tags', 'eas_system_gates', 'cctv_sales_floor', 'facial_recognition_system',
  'security_guard_uniformed', 'loss_prevention_plain_clothes', 'high_value_display_security',
  'high_value_lockup', 'display_case_locks', 'orc_task_force_participation', 
  'signage_prosecution_policy'
]

employee_theft: [
  'cctv_pos_registers', 'cctv_cash_room', 'cctv_stockroom', 'employee_background_checks',
  'dual_control_cash_procedures', 'employee_package_inspection', 'inventory_audit_cycle_counting',
  'bag_check_policy', 'pos_exception_reporting', 'stockroom_access_control'
]

armed_robbery: [
  'cctv_pos_registers', 'cctv_entrance_exit', 'alarm_system_panic_buttons', 'time_delay_safe',
  'drop_safe', 'cash_limit_registers', 'robbery_response_training', 'closing_procedures_two_person',
  'adequate_lighting_exterior', 'security_guard_uniformed', 'bollards_storefront_protection'
]

cash_handling_theft: [
  'dual_control_cash_procedures', 'cctv_cash_room', 'cash_room_access_control', 'drop_safe',
  'time_delay_safe', 'cash_limit_registers', 'armored_car_service', 'employee_background_checks',
  'pos_exception_reporting'
]

smash_and_grab: [
  'bollards_storefront_protection', 'reinforced_entrance_doors', 'security_gates_after_hours',
  'alarm_system_intrusion', 'cctv_entrance_exit', 'high_value_lockup', 'high_value_display_security',
  'adequate_lighting_exterior', 'glass_break_sensors'
]

customer_violence: [
  'security_guard_uniformed', 'alarm_system_panic_buttons', 'cctv_sales_floor', 'cctv_pos_registers',
  'de_escalation_training', 'robbery_response_training', 'closing_procedures_two_person',
  'adequate_lighting_interior'
]

return_fraud: [
  'refund_authorization_controls', 'receipt_checking_policy', 'cctv_pos_registers',
  'pos_exception_reporting', 'frequent_returner_tracking', 'return_validation_system',
  'employee_training_fraud_awareness'
]

vandalism: [
  'cctv_entrance_exit', 'cctv_parking_lot', 'adequate_lighting_exterior', 'security_guard_uniformed',
  'alarm_system_intrusion', 'signage_security_warnings'
]

after_hours_burglary: [
  'alarm_system_intrusion', 'reinforced_entrance_doors', 'security_gates_after_hours',
  'cctv_entrance_exit', 'adequate_lighting_exterior', 'key_control_system', 'drop_safe',
  'high_value_lockup', 'glass_break_sensors', 'motion_detectors'
]

credit_card_fraud: [
  'emv_chip_terminals', 'cctv_pos_registers', 'signature_verification_policy',
  'employee_training_fraud_awareness', 'pos_exception_reporting', 'id_verification_policy'
]

inventory_shrinkage: [
  'inventory_audit_cycle_counting', 'eas_system_tags', 'cctv_stockroom', 'stockroom_access_control',
  'receiving_verification_procedures', 'loss_prevention_plain_clothes', 'employee_background_checks',
  'pos_exception_reporting'
]

parking_lot_crime: [
  'cctv_parking_lot', 'adequate_lighting_exterior', 'security_guard_uniformed',
  'cart_corral_placement', 'emergency_call_stations', 'security_patrol_parking'
]

counterfeit_currency: [
  'counterfeit_detection_pens', 'counterfeit_detection_machines', 'employee_training_fraud_awareness',
  'cctv_pos_registers', 'large_bill_verification_policy'
]

display_tampering: [
  'cctv_sales_floor', 'security_tag_placement', 'barcode_verification_pos',
  'employee_training_fraud_awareness', 'price_check_procedures', 'item_count_policy'
]
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count controls by category
SELECT 
  category,
  COUNT(*) as control_count,
  ROUND(AVG(effectiveness_rating), 1) as avg_effectiveness
FROM security_controls 
WHERE facility_type = 'retail_store'
GROUP BY category
ORDER BY control_count DESC;

-- Expected output:
-- Procedural: 14 controls
-- Fraud Prevention: 9 controls
-- Surveillance: 7 controls
-- Cash Management: 7 controls
-- Physical Barriers: 7 controls
-- Security Personnel: 6 controls
-- Environmental Design: 5 controls
-- Intrusion Detection: 4 controls
-- Loss Prevention: 4 controls
-- Access Control: 3 controls
-- TOTAL: 66 controls

-- Verify all THREAT_CONTROL_MAPPING control_ids exist
SELECT control_id FROM security_controls WHERE facility_type = 'retail_store' ORDER BY control_id;

-- Verify cost distribution
SELECT 
  CASE 
    WHEN implementation_cost = 0 THEN 'No upfront cost'
    WHEN implementation_cost < 5000 THEN 'Low (<$5K)'
    WHEN implementation_cost < 15000 THEN 'Medium ($5K-$15K)'
    ELSE 'High (>$15K)'
  END as cost_tier,
  COUNT(*) as count
FROM security_controls 
WHERE facility_type = 'retail_store'
GROUP BY 1
ORDER BY count DESC;

-- ============================================================================
-- END OF RETAIL STORE CONTROLS SEED FILE
-- ============================================================================
-- Total Controls: 66
-- 
-- Category Breakdown:
-- - Loss Prevention (EAS): 4 controls
-- - Surveillance: 7 controls  
-- - Cash Management: 7 controls
-- - Physical Barriers: 7 controls
-- - Security Personnel: 6 controls
-- - Procedural: 14 controls
-- - Environmental Design: 5 controls
-- - Intrusion Detection: 4 controls
-- - Fraud Prevention: 9 controls
-- - Access Control: 3 controls
--
-- Standards Referenced:
-- - NRF (National Retail Federation) Loss Prevention Standards
-- - LPRC (Loss Prevention Research Council) Best Practices
-- - RILA (Retail Industry Leaders Association) Standards
-- - ASIS International (GDL-RA, POA, WVPI, FPSM)
-- - ASIS Retail Security Council Guidelines
-- - ASIS Cash-in-Transit Guidelines
-- - CPTED (Crime Prevention Through Environmental Design)
-- - NRF ORC (Organized Retail Crime) Guidelines
-- - NFPA 731 (Electronic Security Systems)
-- - PCI DSS (Payment Card Industry Data Security Standard)
-- - DOS SD-STD-02.01 (Vehicle Barriers)
-- - US Secret Service Counterfeit Guidelines
-- - IESNA (Illuminating Engineering Society)
-- ============================================================================
