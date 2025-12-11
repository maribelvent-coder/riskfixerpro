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

-- Insert EP controls into control_library table
-- Using ON CONFLICT to avoid duplicates on re-run

INSERT INTO control_library (
  name, 
  description, 
  category, 
  control_type,
  estimated_cost,
  reduction_percentage,
  implementation_notes,
  training_required,
  maintenance_required,
  active
) VALUES

-- ============================================================================
-- CATEGORY 1: PERSONAL PROTECTION (10 controls)
-- ============================================================================

-- EP-PP-001: Executive Protection Detail - 24/7
(
  'Executive Protection Detail - 24/7',
  'Full-time close protection officers providing around-the-clock personal security. Team typically includes 4-6 agents working in shifts to ensure continuous coverage at residence, workplace, and during travel. Agents are trained in threat recognition, defensive driving, emergency medical response, and evacuation procedures.',
  'Personal Protection',
  'Physical',
  '$750,000/year',
  95,
  'ASIS GDL EP-01. Requires 30-60 days implementation. Initial setup cost ~$150,000.',
  true,
  true,
  true
),

-- EP-PP-002: Executive Protection Detail - Part-time
(
  'Executive Protection Detail - Part-time',
  'Protection officers assigned during high-risk periods such as public events, travel, or when threat intelligence indicates elevated risk. Typically 8-12 hours per day coverage with on-call availability during off hours.',
  'Personal Protection',
  'Physical',
  '$300,000/year',
  75,
  'ASIS GDL EP-02. Requires 14-21 days implementation. Initial setup cost ~$50,000.',
  true,
  true,
  true
),

-- EP-PP-003: Secure Executive Driver Service
(
  'Secure Executive Driver Service',
  'Professional driver trained in defensive/evasive driving techniques, route surveillance, and emergency protocols. Driver conducts pre-trip vehicle inspections, maintains situational awareness, and coordinates with security team.',
  'Personal Protection',
  'Physical',
  '$150,000/year',
  70,
  'ASIS GDL EP-03. Requires 14 days implementation. Initial setup cost ~$25,000.',
  true,
  true,
  true
),

-- EP-PP-004: Advance Team Operations
(
  'Advance Team Operations',
  'Security personnel deployed ahead of principal to assess venues, identify threats, coordinate with local security, and establish evacuation routes. Critical for travel and public appearances.',
  'Personal Protection',
  'Procedural',
  '$100,000/year',
  85,
  'ASIS GDL EP-04. Requires 7 days implementation. Initial setup cost ~$10,000.',
  true,
  true,
  true
),

-- EP-PP-005: Protective Intelligence Program
(
  'Protective Intelligence Program',
  'Dedicated intelligence gathering and analysis capability to identify potential threats before they materialize. Includes monitoring of persons of interest, threat assessment, and coordination with law enforcement.',
  'Personal Protection',
  'Procedural',
  '$200,000/year',
  80,
  'ASIS GDL TM-01. Requires 60-90 days implementation. Initial setup cost ~$75,000.',
  true,
  true,
  true
),

-- EP-PP-006: Personal Defensive Training
(
  'Personal Defensive Training for Principal',
  'Training program for the executive covering situational awareness, basic self-defense, emergency procedures, and coordination with protection team. Includes scenario-based exercises and regular refresher training.',
  'Personal Protection',
  'Procedural',
  '$25,000/year',
  60,
  'ASIS GDL EP-05. Requires 30 days implementation. Initial setup cost ~$15,000.',
  true,
  false,
  true
),

-- EP-PP-007: Medical Emergency Response Capability
(
  'Medical Emergency Response Capability',
  'Protection team members certified in advanced first aid, CPR, and trauma care. Includes portable medical kit, AED, and established protocols for medical evacuation. Some programs include on-call physician.',
  'Personal Protection',
  'Physical',
  '$50,000/year',
  65,
  'ASIS GDL EP-06. Requires 21 days implementation. Initial setup cost ~$20,000.',
  true,
  true,
  true
),

-- EP-PP-008: Personal Tracking/Duress Device
(
  'Personal Tracking/Duress Device',
  'Discrete wearable device enabling GPS tracking and silent duress alerts. Connects to 24/7 monitoring center capable of dispatching emergency response. May include two-way communication capability.',
  'Personal Protection',
  'Technical',
  '$15,000/year',
  55,
  'ASIS GDL EP-07. Requires 7 days implementation. Initial setup cost ~$5,000.',
  true,
  true,
  true
),

-- EP-PP-009: Armored Vehicle
(
  'Armored Executive Vehicle',
  'Vehicle with ballistic protection (typically B4-B6 level) and run-flat tires. May include additional features such as oxygen supply, fire suppression, and communication systems.',
  'Personal Protection',
  'Physical',
  '$50,000/year',
  80,
  'ASIS GDL EP-08. Requires 90 days implementation for custom build. Initial setup cost ~$250,000.',
  true,
  true,
  true
),

-- EP-PP-010: Security Command Center
(
  'Security Command Center',
  '24/7 monitoring facility coordinating all security operations. Integrates CCTV, access control, alarm systems, GPS tracking, and communication networks. Staffed by trained security personnel.',
  'Personal Protection',
  'Technical',
  '$300,000/year',
  85,
  'ASIS GDL SC-01. Requires 90-120 days implementation. Initial setup cost ~$500,000.',
  true,
  true,
  true
),

-- ============================================================================
-- CATEGORY 2: RESIDENTIAL SECURITY (8 controls)
-- ============================================================================

-- EP-RS-001: Residential Perimeter Security
(
  'Residential Perimeter Security System',
  'Comprehensive perimeter protection including security fencing, intrusion detection sensors, surveillance cameras, and controlled entry points. May include ground radar for large properties.',
  'Residential Security',
  'Physical',
  '$75,000/year',
  80,
  'ASIS GDL RS-01. Requires 60-90 days implementation. Initial setup cost ~$200,000.',
  true,
  true,
  true
),

-- EP-RS-002: Safe Room Installation
(
  'Safe Room / Panic Room',
  'Reinforced room with ballistic protection, independent air supply, communications, and supplies. Provides secure refuge during home invasion or attack while awaiting law enforcement response.',
  'Residential Security',
  'Physical',
  '$10,000/year',
  70,
  'ASIS GDL RS-02. Requires 30-60 days implementation. Initial setup cost ~$75,000-$150,000.',
  true,
  true,
  true
),

-- EP-RS-003: Residential CCTV System
(
  'Comprehensive Residential CCTV',
  'Multi-camera surveillance system covering all property access points, perimeter, and critical areas. Includes video analytics, recording, and remote monitoring capability.',
  'Residential Security',
  'Technical',
  '$25,000/year',
  65,
  'ASIS GDL RS-03. Requires 14-21 days implementation. Initial setup cost ~$50,000.',
  false,
  true,
  true
),

-- EP-RS-004: Residential Access Control
(
  'Residential Access Control System',
  'Electronic access control for all entry points including gates, doors, and garage. Integrates with security system for logging and alerts.',
  'Residential Security',
  'Technical',
  '$15,000/year',
  60,
  'ASIS GDL RS-04. Requires 14 days implementation. Initial setup cost ~$30,000.',
  true,
  true,
  true
),

-- EP-RS-005: 24/7 Residential Security Officer
(
  '24/7 Residential Security Officer',
  'Professional security officer stationed at residence around the clock. Monitors access, patrols property, and provides immediate response to incidents.',
  'Residential Security',
  'Physical',
  '$200,000/year',
  75,
  'ASIS GDL RS-05. Requires 14-21 days implementation. Initial setup cost ~$20,000.',
  true,
  true,
  true
),

-- EP-RS-006: Visitor Management System
(
  'Residential Visitor Management',
  'System for pre-registration, verification, and tracking of all visitors. Includes background screening capability for regular visitors and service providers.',
  'Residential Security',
  'Procedural',
  '$10,000/year',
  50,
  'ASIS GDL RS-06. Requires 7-14 days implementation. Initial setup cost ~$15,000.',
  true,
  false,
  true
),

-- EP-RS-007: Emergency Evacuation Routes
(
  'Multiple Emergency Evacuation Routes',
  'Pre-planned and practiced evacuation routes from residence to safe locations. Includes multiple options for various threat scenarios and regular drills.',
  'Residential Security',
  'Procedural',
  '$5,000/year',
  55,
  'ASIS GDL RS-07. Requires 7 days implementation. Initial setup cost ~$10,000.',
  true,
  false,
  true
),

-- EP-RS-008: Neighborhood Liaison Program
(
  'Neighborhood Security Liaison',
  'Formal relationships with neighbors, local law enforcement, and private security in area. Enables early warning of suspicious activity and coordinated response.',
  'Residential Security',
  'Procedural',
  '$5,000/year',
  40,
  'ASIS GDL RS-08. Requires 30 days implementation. Initial setup cost ~$5,000.',
  false,
  false,
  true
),

-- ============================================================================
-- CATEGORY 3: DIGITAL/OSINT COUNTERMEASURES (8 controls)
-- ============================================================================

-- EP-DO-001: Executive Digital Footprint Management
(
  'Executive Digital Footprint Management',
  'Ongoing service to monitor, minimize, and manage executive online presence. Includes removal of personal information from data brokers, social media monitoring, and reputation management.',
  'Digital/OSINT Countermeasures',
  'Technical',
  '$50,000/year',
  70,
  'ASIS GDL DO-01. Requires 30-60 days implementation. Initial setup cost ~$25,000.',
  false,
  true,
  true
),

-- EP-DO-002: Social Media Security Review
(
  'Social Media Security Review',
  'Comprehensive review and hardening of all family social media accounts. Implements privacy settings, removes location data, and establishes posting guidelines to prevent operational security leaks.',
  'Digital/OSINT Countermeasures',
  'Procedural',
  '$10,000/year',
  55,
  'ASIS GDL DO-02. Requires 7-14 days implementation. Initial setup cost ~$15,000.',
  true,
  false,
  true
),

-- EP-DO-003: Continuous OSINT Monitoring
(
  'Continuous OSINT Monitoring',
  '24/7 monitoring of open source intelligence for mentions of executive, family, and associated entities. Includes dark web monitoring and early threat detection.',
  'Digital/OSINT Countermeasures',
  'Technical',
  '$75,000/year',
  75,
  'ASIS GDL DO-03. Requires 14-21 days implementation. Initial setup cost ~$30,000.',
  true,
  true,
  true
),

-- EP-DO-004: Property Record Privacy
(
  'Property Record Privacy Measures',
  'Legal structures (trusts, LLCs) to remove executive name from public property records. Prevents address discovery through county assessor databases.',
  'Digital/OSINT Countermeasures',
  'Procedural',
  '$15,000/year',
  60,
  'ASIS GDL DO-04. Requires 60-90 days implementation. Initial setup cost ~$25,000.',
  false,
  false,
  true
),

-- EP-DO-005: Data Broker Opt-Out Service
(
  'Data Broker Opt-Out Service',
  'Systematic removal of executive and family information from data broker websites. Includes ongoing monitoring and re-removal as information reappears.',
  'Digital/OSINT Countermeasures',
  'Technical',
  '$20,000/year',
  50,
  'ASIS GDL DO-05. Requires 60-90 days implementation. Initial setup cost ~$10,000.',
  false,
  true,
  true
),

-- EP-DO-006: Secure Communications Protocol
(
  'Secure Communications Protocol',
  'Implementation of encrypted communication methods for sensitive discussions. Includes secure messaging apps, encrypted email, and secure voice calls.',
  'Digital/OSINT Countermeasures',
  'Technical',
  '$10,000/year',
  65,
  'ASIS GDL DO-06. Requires 7 days implementation. Initial setup cost ~$10,000.',
  true,
  true,
  true
),

-- EP-DO-007: Executive Device Security
(
  'Executive Device Security Program',
  'Comprehensive security for all executive devices including encrypted storage, mobile device management, and regular security audits. Includes secure backup procedures.',
  'Digital/OSINT Countermeasures',
  'Technical',
  '$25,000/year',
  70,
  'ASIS GDL DO-07. Requires 14 days implementation. Initial setup cost ~$20,000.',
  true,
  true,
  true
),

-- EP-DO-008: Counter-Surveillance Sweeps
(
  'Regular Counter-Surveillance Sweeps',
  'Periodic technical surveillance countermeasures (TSCM) inspections of residence, office, and vehicles to detect listening devices, cameras, or GPS trackers.',
  'Digital/OSINT Countermeasures',
  'Technical',
  '$50,000/year',
  60,
  'ASIS GDL DO-08. Requires 7 days implementation. Initial setup cost ~$10,000 per sweep.',
  false,
  true,
  true
),

-- ============================================================================
-- CATEGORY 4: TRAVEL SECURITY (8 controls)
-- ============================================================================

-- EP-TS-001: Travel Risk Assessment
(
  'Pre-Travel Risk Assessment',
  'Comprehensive assessment of travel destinations including crime data, political stability, medical facilities, and specific threats to executive. Includes route planning and emergency protocols.',
  'Travel Security',
  'Procedural',
  '$30,000/year',
  70,
  'ASIS GDL TS-01. Requires 7 days per trip. Initial setup cost ~$20,000 for methodology.',
  true,
  false,
  true
),

-- EP-TS-002: Secure Transportation Network
(
  'Secure Transportation Network',
  'Pre-vetted transportation providers at frequent destinations. Includes trained drivers, inspected vehicles, and established protocols.',
  'Travel Security',
  'Procedural',
  '$50,000/year',
  65,
  'ASIS GDL TS-02. Requires 30-60 days implementation. Initial setup cost ~$25,000.',
  true,
  true,
  true
),

-- EP-TS-003: Travel Security Advance
(
  'Travel Security Advance Operations',
  'Security team deployed to destination before executive arrival. Conducts venue assessments, establishes relationships with local security, and confirms emergency protocols.',
  'Travel Security',
  'Procedural',
  '$100,000/year',
  80,
  'ASIS GDL TS-03. Requires advance notice per trip. Initial setup cost ~$20,000.',
  true,
  false,
  true
),

-- EP-TS-004: Secure Hotel Protocols
(
  'Secure Hotel Stay Protocols',
  'Standard operating procedures for hotel stays including room selection criteria, sweep procedures, floor security assessment, and emergency evacuation planning.',
  'Travel Security',
  'Procedural',
  '$10,000/year',
  55,
  'ASIS GDL TS-04. Requires 7 days implementation. Initial setup cost ~$10,000.',
  true,
  false,
  true
),

-- EP-TS-005: International Extraction Capability
(
  'International Extraction/Evacuation Capability',
  'Contract with specialized firm providing emergency extraction from high-risk destinations. Includes 24/7 monitoring, crisis response team, and evacuation assets.',
  'Travel Security',
  'Procedural',
  '$75,000/year',
  85,
  'ASIS GDL TS-05. Requires 30 days implementation. Initial setup cost ~$50,000.',
  false,
  true,
  true
),

-- EP-TS-006: Itinerary Security Management
(
  'Secure Itinerary Management',
  'Protocols for limiting distribution of travel details. Includes need-to-know restrictions, last-minute scheduling changes, and cover stories for sensitive travel.',
  'Travel Security',
  'Procedural',
  '$15,000/year',
  60,
  'ASIS GDL TS-06. Requires 14 days implementation. Initial setup cost ~$10,000.',
  true,
  false,
  true
),

-- EP-TS-007: Travel Medical Preparedness
(
  'Travel Medical Preparedness',
  'Pre-travel medical planning including vaccinations, medication supply, identification of medical facilities at destination, and medical evacuation insurance.',
  'Travel Security',
  'Procedural',
  '$20,000/year',
  50,
  'ASIS GDL TS-07. Requires 14 days implementation. Initial setup cost ~$10,000.',
  false,
  true,
  true
),

-- EP-TS-008: Satellite Communication Device
(
  'Satellite Communication Capability',
  'Satellite phone or personal satellite communicator for use in areas without cellular coverage or during emergencies when local infrastructure may be compromised.',
  'Travel Security',
  'Technical',
  '$5,000/year',
  45,
  'ASIS GDL TS-08. Requires 7 days implementation. Initial setup cost ~$2,000.',
  true,
  true,
  true
),

-- ============================================================================
-- CATEGORY 5: FAMILY PROTECTION (8 controls)
-- ============================================================================

-- EP-FP-001: Family Security Awareness Training
(
  'Family Security Awareness Training',
  'Comprehensive training for family members covering threat awareness, emergency procedures, safe travel practices, and social media security. Age-appropriate programs for children.',
  'Family Protection',
  'Procedural',
  '$20,000/year',
  65,
  'ASIS GDL FP-01. Requires 14-30 days implementation. Initial setup cost ~$15,000.',
  true,
  false,
  true
),

-- EP-FP-002: School Security Coordination
(
  'School Security Coordination Program',
  'Formal relationship with childrens schools including authorized pickup protocols, emergency contact procedures, and coordination with school security.',
  'Family Protection',
  'Procedural',
  '$10,000/year',
  60,
  'ASIS GDL FP-02. Requires 14-21 days implementation. Initial setup cost ~$10,000.',
  true,
  false,
  true
),

-- EP-FP-003: Family Duress Code System
(
  'Family Duress Code System',
  'System of code words and signals for family members to indicate distress without alerting potential captors. Includes regular practice and periodic code changes.',
  'Family Protection',
  'Procedural',
  '$5,000/year',
  55,
  'ASIS GDL FP-03. Requires 7 days implementation. Initial setup cost ~$5,000.',
  true,
  false,
  true
),

-- EP-FP-004: Household Staff Vetting
(
  'Household Staff Security Vetting',
  'Comprehensive background investigation of all household employees including criminal history, financial review, reference verification, and ongoing monitoring.',
  'Family Protection',
  'Procedural',
  '$25,000/year',
  70,
  'ASIS GDL FP-04. Requires 14-30 days per employee. Initial setup cost ~$10,000.',
  false,
  true,
  true
),

-- EP-FP-005: Family Emergency Protocols
(
  'Family Emergency Response Protocols',
  'Documented procedures for various emergency scenarios including home invasion, natural disaster, medical emergency, and evacuation. Regular family drills.',
  'Family Protection',
  'Procedural',
  '$10,000/year',
  60,
  'ASIS GDL FP-05. Requires 14 days implementation. Initial setup cost ~$15,000.',
  true,
  false,
  true
),

-- EP-FP-006: Family Travel Security
(
  'Family Travel Security Protocols',
  'Security procedures for family travel separate from executive, including pre-travel briefings, check-in protocols, and emergency contacts.',
  'Family Protection',
  'Procedural',
  '$15,000/year',
  55,
  'ASIS GDL FP-06. Requires 7-14 days implementation. Initial setup cost ~$10,000.',
  true,
  false,
  true
),

-- EP-FP-007: Family GPS Tracking
(
  'Family Location Tracking System',
  'GPS tracking capability for family members with check-in features and geofencing alerts. Privacy-respecting implementation with family consent.',
  'Family Protection',
  'Technical',
  '$10,000/year',
  50,
  'ASIS GDL FP-07. Requires 7 days implementation. Initial setup cost ~$5,000.',
  true,
  true,
  true
),

-- EP-FP-008: Secure School Transportation
(
  'Secure School Transportation',
  'Protected transportation for children between home and school, including trained driver, vehicle tracking, and communication protocols.',
  'Family Protection',
  'Physical',
  '$75,000/year',
  70,
  'ASIS GDL FP-08. Requires 14-21 days implementation. Initial setup cost ~$30,000.',
  true,
  true,
  true
),

-- ============================================================================
-- CATEGORY 6: EMERGENCY PREPAREDNESS (6 controls)
-- ============================================================================

-- EP-EP-001: Comprehensive Emergency Plan
(
  'Comprehensive Emergency Response Plan',
  'Documented emergency procedures covering all threat scenarios with clear roles, communication protocols, and decision trees. Includes annual review and updates.',
  'Emergency Preparedness',
  'Procedural',
  '$20,000/year',
  75,
  'ASIS GDL EP-09. Requires 30-60 days implementation. Initial setup cost ~$30,000.',
  true,
  false,
  true
),

-- EP-EP-002: Emergency Go-Bags
(
  'Emergency Go-Bags',
  'Pre-packed bags at residence, office, and vehicles containing essentials for rapid evacuation including documents, cash, medication, communication devices, and supplies.',
  'Emergency Preparedness',
  'Physical',
  '$5,000/year',
  40,
  'ASIS GDL EP-10. Requires 7 days implementation. Initial setup cost ~$10,000.',
  true,
  true,
  true
),

-- EP-EP-003: Emergency Communication Tree
(
  'Emergency Communication Protocol',
  'Documented communication chain for emergencies including primary and backup methods, check-in procedures, and family notification protocols.',
  'Emergency Preparedness',
  'Procedural',
  '$5,000/year',
  50,
  'ASIS GDL EP-11. Requires 7 days implementation. Initial setup cost ~$5,000.',
  true,
  false,
  true
),

-- EP-EP-004: Safe Destination Network
(
  'Pre-Established Safe Destinations',
  'Network of pre-vetted safe locations for various emergency scenarios. Includes hotels, private residences, and secure facilities with established protocols for arrival.',
  'Emergency Preparedness',
  'Procedural',
  '$15,000/year',
  55,
  'ASIS GDL EP-12. Requires 30 days implementation. Initial setup cost ~$20,000.',
  false,
  true,
  true
),

-- EP-EP-005: Medical Emergency Kit
(
  'Advanced Medical Emergency Kit',
  'Professional-grade first aid equipment including trauma supplies, AED, and emergency medications. Security team trained in usage.',
  'Emergency Preparedness',
  'Physical',
  '$10,000/year',
  45,
  'ASIS GDL EP-13. Requires 7 days implementation. Initial setup cost ~$15,000.',
  true,
  true,
  true
),

-- EP-EP-006: Law Enforcement Liaison
(
  'Law Enforcement Liaison Program',
  'Established relationships with local, state, and federal law enforcement. Includes periodic meetings, emergency contact protocols, and information sharing agreements.',
  'Emergency Preparedness',
  'Procedural',
  '$10,000/year',
  60,
  'ASIS GDL EP-14. Requires 30-60 days implementation. Initial setup cost ~$10,000.',
  false,
  false,
  true
)

ON CONFLICT (name) DO NOTHING;
