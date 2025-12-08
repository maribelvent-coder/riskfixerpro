/**
 * Datacenter Threats and Controls Data
 * Matches the IDs used in datacenter-interview-mapper.ts
 */

export interface DatacenterThreat {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  typicalLikelihood?: string;
  typicalImpact?: string;
  asIsCode?: string;
  examples?: string[];
  active: boolean;
}

export interface DatacenterControl {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  controlType?: string;
  description: string;
  implementation?: string;
  cost?: string;
  effectiveness?: number;
  frameworks?: string[];
  active: boolean;
}

export const DATACENTER_THREATS: DatacenterThreat[] = [
  {
    id: 'unauthorized_physical_access',
    name: 'Unauthorized Physical Access',
    category: 'Physical Intrusion',
    description: 'Unauthorized individuals gaining entry to datacenter through perimeter breach, tailgating, or social engineering. Can lead to data theft, sabotage, or reconnaissance.',
    typicalLikelihood: 'Medium',
    typicalImpact: 'Critical',
    asIsCode: 'PSC.1-2012-INT-001',
    active: true
  },
  {
    id: 'insider_threat_privileged_access',
    name: 'Insider Threat - Privileged Access Abuse',
    category: 'Insider Threat',
    description: 'Malicious or negligent actions by employees, contractors, or vendors with authorized datacenter access. FBI estimates 60%+ of sabotage involves insiders.',
    typicalLikelihood: 'Medium',
    typicalImpact: 'Critical',
    asIsCode: 'PSC.1-2012-INS-001',
    active: true
  },
  {
    id: 'tailgating_mantrap_bypass',
    name: 'Tailgating / Man-trap Bypass',
    category: 'Physical Intrusion',
    description: 'Unauthorized entry by following authorized personnel through access control points. 30%+ of physical intrusions involve tailgating.',
    typicalLikelihood: 'Medium',
    typicalImpact: 'Major',
    asIsCode: 'PSC.1-2012-INT-002',
    active: true
  },
  {
    id: 'power_failure_extended',
    name: 'Extended Power Failure',
    category: 'Infrastructure',
    description: 'Loss of utility power exceeding UPS and generator capacity, causing complete outage. Average datacenter downtime cost: $9,000/minute.',
    typicalLikelihood: 'Low',
    typicalImpact: 'Critical',
    asIsCode: 'PSC.1-2012-INF-001',
    active: true
  },
  {
    id: 'cooling_failure_thermal_event',
    name: 'Cooling Failure / Thermal Event',
    category: 'Infrastructure',
    description: 'Loss of cooling causing equipment to exceed thermal limits. Cascading failures can occur within minutes.',
    typicalLikelihood: 'Low',
    typicalImpact: 'Critical',
    asIsCode: 'PSC.1-2012-INF-002',
    active: true
  },
  {
    id: 'fire_equipment_damage',
    name: 'Fire / Equipment Damage',
    category: 'Life Safety',
    description: 'Fire in datacenter causing equipment destruction. Clean agent suppression critical - water destroys electronics.',
    typicalLikelihood: 'Very Low',
    typicalImpact: 'Critical',
    asIsCode: 'PSC.1-2012-EMG-001',
    active: true
  },
  {
    id: 'water_intrusion_damage',
    name: 'Water Intrusion / Equipment Damage',
    category: 'Environmental',
    description: 'Water damage from cooling system leaks, pipe bursts, or flooding. Leading cause of datacenter equipment damage.',
    typicalLikelihood: 'Low',
    typicalImpact: 'Major',
    asIsCode: 'PSC.1-2012-ENV-001',
    active: true
  },
  {
    id: 'theft_equipment_components',
    name: 'Theft - Equipment/Components',
    category: 'Theft',
    description: 'Theft of servers, drives, memory, or other components. High value density makes datacenters attractive targets.',
    typicalLikelihood: 'Low',
    typicalImpact: 'Major',
    asIsCode: 'PSC.1-2012-THF-001',
    active: true
  },
  {
    id: 'sabotage_infrastructure',
    name: 'Sabotage - Infrastructure',
    category: 'Sabotage',
    description: 'Intentional damage to power, cooling, fire suppression, or other critical infrastructure. EPO and manual release are primary targets.',
    typicalLikelihood: 'Very Low',
    typicalImpact: 'Critical',
    asIsCode: 'PSC.1-2012-SAB-001',
    active: true
  },
  {
    id: 'cyber_physical_attack',
    name: 'Cyber-Physical Attack',
    category: 'Cyber',
    description: 'Attack on physical security systems (access control, CCTV, BMS) through network exploitation. Can disable monitoring or enable unauthorized access.',
    typicalLikelihood: 'Low',
    typicalImpact: 'Major',
    asIsCode: 'PSC.1-2012-CYB-001',
    active: true
  },
  {
    id: 'social_engineering_entry',
    name: 'Social Engineering - Unauthorized Entry',
    category: 'Social Engineering',
    description: 'Manipulating staff to gain unauthorized access through pretexting, impersonation, or deception.',
    typicalLikelihood: 'Low',
    typicalImpact: 'Major',
    asIsCode: 'PSC.1-2012-SOC-001',
    active: true
  },
  {
    id: 'terrorism_vehicle_borne',
    name: 'Terrorism - Vehicle-Borne Attack',
    category: 'Terrorism',
    description: 'Vehicle ramming or vehicle-borne explosive device attack. Datacenters are critical infrastructure targets.',
    typicalLikelihood: 'Very Low',
    typicalImpact: 'Critical',
    asIsCode: 'PSC.1-2012-TER-001',
    active: true
  },
  {
    id: 'natural_disaster_impact',
    name: 'Natural Disaster Impact',
    category: 'Natural Hazard',
    description: 'Weather events, earthquakes, floods affecting facility operations. Extended utility outages common.',
    typicalLikelihood: 'Low',
    typicalImpact: 'Critical',
    asIsCode: 'PSC.1-2012-NAT-001',
    active: true
  },
  {
    id: 'vendor_contractor_breach',
    name: 'Vendor/Contractor Security Breach',
    category: 'Third Party',
    description: 'Security incident caused by vendor, contractor, or service provider with datacenter access.',
    typicalLikelihood: 'Low',
    typicalImpact: 'Major',
    asIsCode: 'PSC.1-2012-3RD-001',
    active: true
  },
  {
    id: 'environmental_contamination',
    name: 'Environmental Contamination',
    category: 'Environmental',
    description: 'Airborne contaminants (dust, chemicals, smoke) entering facility and damaging equipment.',
    typicalLikelihood: 'Very Low',
    typicalImpact: 'Moderate',
    asIsCode: 'PSC.1-2012-ENV-002',
    active: true
  }
];

export const DATACENTER_CONTROLS: DatacenterControl[] = [
  // Perimeter Controls
  {
    id: 'high_security_fencing',
    name: 'High Security Fencing',
    category: 'Perimeter',
    subcategory: 'Barriers',
    controlType: 'Preventive',
    description: '8ft+ anti-climb fencing with barbed wire or PIDS integration around datacenter perimeter',
    effectiveness: 8,
    active: true
  },
  {
    id: 'standoff_distance_100ft',
    name: 'Standoff Distance (100ft+)',
    category: 'Perimeter',
    subcategory: 'Design',
    controlType: 'Preventive',
    description: 'Minimum 100ft standoff distance from public areas to building for blast protection',
    effectiveness: 9,
    active: true
  },
  {
    id: 'vehicle_barriers_k_rated',
    name: 'Vehicle Barriers (K-Rated)',
    category: 'Perimeter',
    subcategory: 'Barriers',
    controlType: 'Preventive',
    description: 'K4-K12 rated bollards or barriers preventing vehicle-borne attacks',
    effectiveness: 9,
    active: true
  },
  {
    id: 'perimeter_intrusion_detection',
    name: 'Perimeter Intrusion Detection System',
    category: 'Perimeter',
    subcategory: 'Detection',
    controlType: 'Detective',
    description: 'Fence-mounted or ground sensors detecting perimeter breach attempts',
    effectiveness: 8,
    active: true
  },
  {
    id: 'perimeter_lighting_iesna',
    name: 'Perimeter Lighting (IESNA Standards)',
    category: 'Perimeter',
    subcategory: 'Deterrence',
    controlType: 'Deterrent',
    description: 'Security lighting meeting IESNA RP-20 standards for uniform coverage',
    effectiveness: 6,
    active: true
  },
  {
    id: 'perimeter_cctv_coverage',
    name: 'Perimeter CCTV Coverage',
    category: 'Perimeter',
    subcategory: 'Surveillance',
    controlType: 'Detective',
    description: '100% CCTV coverage of perimeter with analytics capability',
    effectiveness: 7,
    active: true
  },
  {
    id: 'security_patrol_24x7',
    name: 'Security Patrol (24/7)',
    category: 'Perimeter',
    subcategory: 'Guard Force',
    controlType: 'Detective',
    description: 'Armed or unarmed security patrols around facility perimeter',
    effectiveness: 7,
    active: true
  },
  {
    id: 'guard_checkpoint',
    name: 'Guard Checkpoint',
    category: 'Perimeter',
    subcategory: 'Guard Force',
    controlType: 'Preventive',
    description: 'Staffed checkpoint for vehicle and personnel screening at entry',
    effectiveness: 8,
    active: true
  },
  // Access Control
  {
    id: 'biometric_authentication',
    name: 'Biometric Authentication',
    category: 'Access Control',
    subcategory: 'Identity Verification',
    controlType: 'Preventive',
    description: 'Fingerprint, palm vein, or iris recognition for access control',
    effectiveness: 9,
    active: true
  },
  {
    id: 'multi_factor_access',
    name: 'Multi-Factor Authentication',
    category: 'Access Control',
    subcategory: 'Identity Verification',
    controlType: 'Preventive',
    description: 'Card + PIN + biometric for high-security areas',
    effectiveness: 9,
    active: true
  },
  {
    id: 'mantrap_portals',
    name: 'Man-trap Portal System',
    category: 'Access Control',
    subcategory: 'Anti-Tailgating',
    controlType: 'Preventive',
    description: 'Interlocking door system with weight/occupancy detection preventing tailgating',
    effectiveness: 9,
    active: true
  },
  {
    id: 'tailgating_detection',
    name: 'Tailgating Detection System',
    category: 'Access Control',
    subcategory: 'Anti-Tailgating',
    controlType: 'Detective',
    description: 'Optical sensors or video analytics detecting tailgating attempts',
    effectiveness: 7,
    active: true
  },
  {
    id: 'visitor_management_system',
    name: 'Visitor Management System',
    category: 'Access Control',
    subcategory: 'Visitor Control',
    controlType: 'Preventive',
    description: 'Pre-registration, ID verification, badge printing, and tracking system',
    effectiveness: 7,
    active: true
  },
  {
    id: 'escort_requirements',
    name: 'Escort Requirements',
    category: 'Access Control',
    subcategory: 'Visitor Control',
    controlType: 'Preventive',
    description: 'Mandatory escort for all visitors and non-badged personnel',
    effectiveness: 8,
    active: true
  },
  {
    id: 'cabinet_level_locks',
    name: 'Cabinet-Level Locks',
    category: 'Access Control',
    subcategory: 'Server Access',
    controlType: 'Preventive',
    description: 'Electronic locks on individual server cabinets with audit logging',
    effectiveness: 8,
    active: true
  },
  {
    id: 'access_logging_audit',
    name: 'Access Logging & Audit',
    category: 'Access Control',
    subcategory: 'Monitoring',
    controlType: 'Detective',
    description: 'Comprehensive logging of all access events with regular audit review',
    effectiveness: 7,
    active: true
  },
  {
    id: 'access_review_quarterly',
    name: 'Quarterly Access Reviews',
    category: 'Access Control',
    subcategory: 'Administration',
    controlType: 'Detective',
    description: 'Regular review of access rights to identify and remove unnecessary privileges',
    effectiveness: 7,
    active: true
  },
  {
    id: 'access_revocation_immediate',
    name: 'Immediate Access Revocation',
    category: 'Access Control',
    subcategory: 'Administration',
    controlType: 'Preventive',
    description: 'Same-day access revocation for terminated personnel',
    effectiveness: 8,
    active: true
  },
  {
    id: 'customer_access_segregation',
    name: 'Customer Access Segregation',
    category: 'Access Control',
    subcategory: 'Multi-Tenant',
    controlType: 'Preventive',
    description: 'Physical or logical separation preventing cross-customer access',
    effectiveness: 8,
    active: true
  },
  {
    id: 'two_person_rule',
    name: 'Two-Person Rule',
    category: 'Access Control',
    subcategory: 'High Security',
    controlType: 'Preventive',
    description: 'Dual authorization required for sensitive areas or operations',
    effectiveness: 8,
    active: true
  },
  // Surveillance
  {
    id: 'cctv_comprehensive_coverage',
    name: 'CCTV Comprehensive Coverage',
    category: 'Surveillance',
    subcategory: 'Video',
    controlType: 'Detective',
    description: '100% camera coverage of all areas with no blind spots',
    effectiveness: 8,
    active: true
  },
  {
    id: 'cctv_hands_on_servers',
    name: 'Hands-On-Server Cameras',
    category: 'Surveillance',
    subcategory: 'Video',
    controlType: 'Detective',
    description: 'High-resolution cameras focused on server racks capturing all interactions',
    effectiveness: 9,
    active: true
  },
  {
    id: 'video_analytics',
    name: 'Video Analytics',
    category: 'Surveillance',
    subcategory: 'Video',
    controlType: 'Detective',
    description: 'AI-powered video analytics detecting suspicious behavior patterns',
    effectiveness: 7,
    active: true
  },
  {
    id: 'noc_soc_24x7',
    name: 'NOC/SOC 24/7 Monitoring',
    category: 'Surveillance',
    subcategory: 'Monitoring',
    controlType: 'Detective',
    description: '24/7 staffed operations center monitoring all security systems',
    effectiveness: 9,
    active: true
  },
  {
    id: 'alarm_monitoring_central',
    name: 'Central Alarm Monitoring',
    category: 'Surveillance',
    subcategory: 'Monitoring',
    controlType: 'Detective',
    description: 'All alarms monitored centrally with defined response procedures',
    effectiveness: 8,
    active: true
  },
  // Power Infrastructure
  {
    id: 'ups_n_plus_1',
    name: 'UPS (N+1 Redundancy)',
    category: 'Power',
    subcategory: 'UPS',
    controlType: 'Preventive',
    description: 'Redundant UPS configuration ensuring continuity during component failure',
    effectiveness: 9,
    active: true
  },
  {
    id: 'redundant_utility_feeds',
    name: 'Redundant Utility Feeds',
    category: 'Power',
    subcategory: 'Utility',
    controlType: 'Preventive',
    description: 'Dual utility feeds from independent substations',
    effectiveness: 9,
    active: true
  },
  {
    id: 'generator_automatic_transfer',
    name: 'Generator Automatic Transfer',
    category: 'Power',
    subcategory: 'Generator',
    controlType: 'Preventive',
    description: 'Automatic transfer switch with <10 second transfer time',
    effectiveness: 9,
    active: true
  },
  {
    id: 'generator_fuel_72_hours',
    name: 'Generator Fuel (72+ Hours)',
    category: 'Power',
    subcategory: 'Generator',
    controlType: 'Preventive',
    description: 'On-site fuel storage for minimum 72 hours of generator operation',
    effectiveness: 8,
    active: true
  },
  {
    id: 'fuel_storage_security',
    name: 'Fuel Storage Security',
    category: 'Power',
    subcategory: 'Generator',
    controlType: 'Preventive',
    description: 'Physical security for fuel tanks preventing tampering or theft',
    effectiveness: 7,
    active: true
  },
  {
    id: 'epo_protection',
    name: 'EPO Protection',
    category: 'Power',
    subcategory: 'Safety',
    controlType: 'Preventive',
    description: 'Emergency Power Off button protection preventing accidental or malicious activation',
    effectiveness: 8,
    active: true
  },
  {
    id: 'electrical_room_access',
    name: 'Electrical Room Access Control',
    category: 'Power',
    subcategory: 'Access',
    controlType: 'Preventive',
    description: 'Restricted access to electrical rooms with logging',
    effectiveness: 8,
    active: true
  },
  // Cooling Infrastructure
  {
    id: 'cooling_redundancy',
    name: 'Cooling Redundancy (N+1 or 2N)',
    category: 'Cooling',
    subcategory: 'HVAC',
    controlType: 'Preventive',
    description: 'Redundant cooling capacity ensuring operation during unit failure',
    effectiveness: 9,
    active: true
  },
  {
    id: 'temperature_humidity_monitoring',
    name: 'Temperature & Humidity Monitoring',
    category: 'Cooling',
    subcategory: 'Environmental',
    controlType: 'Detective',
    description: 'Real-time monitoring with alerting for environmental conditions',
    effectiveness: 8,
    active: true
  },
  {
    id: 'hot_cold_aisle_containment',
    name: 'Hot/Cold Aisle Containment',
    category: 'Cooling',
    subcategory: 'Design',
    controlType: 'Preventive',
    description: 'Physical containment improving cooling efficiency',
    effectiveness: 7,
    active: true
  },
  {
    id: 'chiller_plant_security',
    name: 'Chiller Plant Security',
    category: 'Cooling',
    subcategory: 'Access',
    controlType: 'Preventive',
    description: 'Physical security for chiller plant preventing tampering',
    effectiveness: 7,
    active: true
  },
  {
    id: 'environmental_sensors',
    name: 'Environmental Sensors',
    category: 'Cooling',
    subcategory: 'Environmental',
    controlType: 'Detective',
    description: 'Comprehensive sensor network for temperature, humidity, airflow',
    effectiveness: 8,
    active: true
  },
  {
    id: 'environmental_contamination_protection',
    name: 'Environmental Contamination Protection',
    category: 'Cooling',
    subcategory: 'Environmental',
    controlType: 'Preventive',
    description: 'Air filtration and positive pressure preventing contamination ingress',
    effectiveness: 7,
    active: true
  },
  // Fire Protection
  {
    id: 'vesda_early_detection',
    name: 'VESDA Early Detection',
    category: 'Fire',
    subcategory: 'Detection',
    controlType: 'Detective',
    description: 'Very Early Smoke Detection Apparatus providing earliest possible warning',
    effectiveness: 9,
    active: true
  },
  {
    id: 'clean_agent_suppression',
    name: 'Clean Agent Suppression',
    category: 'Fire',
    subcategory: 'Suppression',
    controlType: 'Corrective',
    description: 'FM-200, Novec 1230, or inert gas suppression protecting electronics',
    effectiveness: 9,
    active: true
  },
  {
    id: 'fire_zone_suppression',
    name: 'Zone-Based Suppression',
    category: 'Fire',
    subcategory: 'Suppression',
    controlType: 'Corrective',
    description: 'Independent fire suppression zones limiting agent discharge area',
    effectiveness: 8,
    active: true
  },
  {
    id: 'manual_release_protection',
    name: 'Manual Release Protection',
    category: 'Fire',
    subcategory: 'Safety',
    controlType: 'Preventive',
    description: 'Protected manual release controls preventing accidental discharge',
    effectiveness: 7,
    active: true
  },
  {
    id: 'fire_system_monitoring',
    name: 'Fire System Monitoring',
    category: 'Fire',
    subcategory: 'Monitoring',
    controlType: 'Detective',
    description: '24/7 monitoring of fire detection and suppression systems',
    effectiveness: 8,
    active: true
  },
  {
    id: 'fire_system_testing_quarterly',
    name: 'Fire System Testing (Quarterly)',
    category: 'Fire',
    subcategory: 'Maintenance',
    controlType: 'Detective',
    description: 'Regular testing of fire detection and suppression systems',
    effectiveness: 7,
    active: true
  },
  {
    id: 'water_leak_detection',
    name: 'Water Leak Detection',
    category: 'Fire',
    subcategory: 'Environmental',
    controlType: 'Detective',
    description: 'Sensors detecting water leaks under raised floor and critical areas',
    effectiveness: 8,
    active: true
  },
  // Personnel Security
  {
    id: 'background_checks_comprehensive',
    name: 'Comprehensive Background Checks',
    category: 'Personnel',
    subcategory: 'Screening',
    controlType: 'Preventive',
    description: 'Criminal, credit, education, and employment verification for all staff',
    effectiveness: 7,
    active: true
  },
  {
    id: 'security_training_annual',
    name: 'Annual Security Training',
    category: 'Personnel',
    subcategory: 'Training',
    controlType: 'Preventive',
    description: 'Mandatory security awareness training for all personnel',
    effectiveness: 6,
    active: true
  },
  {
    id: 'contractor_vetting',
    name: 'Contractor Vetting',
    category: 'Personnel',
    subcategory: 'Screening',
    controlType: 'Preventive',
    description: 'Background screening and security requirements for all contractors',
    effectiveness: 7,
    active: true
  },
  {
    id: 'termination_procedures',
    name: 'Termination Procedures',
    category: 'Personnel',
    subcategory: 'Administration',
    controlType: 'Preventive',
    description: 'Documented procedures for access revocation upon termination',
    effectiveness: 8,
    active: true
  },
  // Operations
  {
    id: 'incident_response_plan',
    name: 'Incident Response Plan',
    category: 'Operations',
    subcategory: 'Planning',
    controlType: 'Corrective',
    description: 'Documented incident response procedures with regular testing',
    effectiveness: 8,
    active: true
  },
  {
    id: 'tool_control',
    name: 'Tool Control Program',
    category: 'Operations',
    subcategory: 'Physical Security',
    controlType: 'Preventive',
    description: 'Tracking and control of tools that could be used for theft or sabotage',
    effectiveness: 6,
    active: true
  },
  {
    id: 'media_destruction',
    name: 'Media Destruction',
    category: 'Operations',
    subcategory: 'Data Protection',
    controlType: 'Preventive',
    description: 'Secure destruction of storage media preventing data recovery',
    effectiveness: 9,
    active: true
  },
  // Compliance & Audit
  {
    id: 'audit_frequency_quarterly',
    name: 'Quarterly Security Audits',
    category: 'Compliance',
    subcategory: 'Audit',
    controlType: 'Detective',
    description: 'Regular internal security audits of physical controls',
    effectiveness: 7,
    active: true
  },
  {
    id: 'penetration_testing_annual',
    name: 'Annual Penetration Testing',
    category: 'Compliance',
    subcategory: 'Testing',
    controlType: 'Detective',
    description: 'Annual physical penetration testing by qualified third party',
    effectiveness: 8,
    active: true
  },
  {
    id: 'vulnerability_scanning',
    name: 'Vulnerability Scanning',
    category: 'Compliance',
    subcategory: 'Testing',
    controlType: 'Detective',
    description: 'Regular scanning for physical security vulnerabilities',
    effectiveness: 7,
    active: true
  },
  {
    id: 'change_management',
    name: 'Change Management',
    category: 'Compliance',
    subcategory: 'Process',
    controlType: 'Preventive',
    description: 'Documented change management for physical security systems',
    effectiveness: 7,
    active: true
  },
  {
    id: 'soc2_type_ii',
    name: 'SOC 2 Type II Certification',
    category: 'Compliance',
    subcategory: 'Certification',
    controlType: 'Detective',
    description: 'Annual SOC 2 Type II audit and certification',
    effectiveness: 8,
    active: true
  }
];
