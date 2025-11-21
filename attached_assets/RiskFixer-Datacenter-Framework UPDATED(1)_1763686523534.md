# RiskFixer: Datacenter Security Assessment Framework
## Comprehensive Specification for Critical Infrastructure Security

**Version:** 1.0  
**Integration Target:** RiskFixer Master Framework v2.0  
**Focus:** Datacenter, Colocation, and Mission-Critical Facility Assessments  
**Last Updated:** November 20, 2025

---

## Table of Contents

1. [Datacenter Assessment Overview](#1-datacenter-assessment-overview)
2. [Assessment Template Specifications](#2-assessment-template-specifications)
3. [Interview Protocol System](#3-interview-protocol-system)
4. [Risk Mapping & Calculation Integration](#4-risk-mapping--calculation-integration)
5. [Control Selection & Recommendations](#5-control-selection--recommendations)
6. [Implementation Workflow](#6-implementation-workflow)
7. [API Integration Specifications](#7-api-integration-specifications)
8. [UI Components](#8-ui-components)
9. [PDF Report Template](#9-pdf-report-template)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Datacenter Assessment Overview

### 1.1 What Makes Datacenter Assessments Unique

**Standard Physical Security Assessment:**
- Generic facility protection
- Basic access control
- Standard surveillance

**Datacenter Security Assessment:**
- **Uptime criticality** - Every minute of downtime costs thousands to millions
- **Compliance-driven** - SOC 2, ISO 27001, PCI-DSS, HIPAA requirements
- **Defense in depth** - Multiple security layers (perimeter → building → floor → cage → cabinet)
- **Cyber-physical integration** - Physical security directly impacts data security
- **Environmental controls** - Power, cooling, fire suppression are security issues
- **Multi-tenant security** - Customer separation and data protection
- **Insider threat** - Privileged access to critical infrastructure
- **High-value target** - Nation-state actors, organized crime, competitors
- **24/7 operations** - Continuous monitoring and incident response
- **Business continuity** - Redundancy and failover capabilities

### 1.2 Assessment Components

```
Datacenter Security Assessment = 
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. DATACENTER PROFILE                                       │
  │    - Tier classification (I-IV)                             │
  │    - Size (square footage, rack count, power capacity)      │
  │    - Customer type (colocation, wholesale, enterprise)      │
  │    - Compliance requirements (SOC 2, ISO, PCI, HIPAA)       │
  │    - Uptime SLA commitments (99.9% to 99.995%)              │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. PHYSICAL LAYER SECURITY ASSESSMENT                       │
  │    - Perimeter defense (fencing, barriers, standoff)        │
  │    - Access control (biometrics, multi-factor, man-traps)   │
  │    - Surveillance (CCTV, analytics, 24/7 monitoring)        │
  │    - Cabinet-level security (locks, access logging)         │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. ENVIRONMENTAL & INFRASTRUCTURE SECURITY                  │
  │    - Power redundancy (N+1, 2N, 2(N+1))                     │
  │    - Cooling redundancy                                     │
  │    - Fire suppression (clean agent, not water)              │
  │    - Environmental monitoring (temp, humidity, leak)        │
  │    - Generator fuel capacity (48+ hours)                    │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. COMPLIANCE & OPERATIONAL SECURITY                        │
  │    - Audit compliance (SOC 2 Type II, ISO 27001)            │
  │    - Personnel security (background checks, training)       │
  │    - Incident response procedures                           │
  │    - Change management controls                             │
  │    - Visitor management and escort requirements             │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. RISK CALCULATION (T×V×I FORMULA)                         │
  │    - Automated risk scoring from interview responses        │
  │    - Compliance gap analysis                                │
  │    - SLA impact assessment                                  │
  │    - Financial exposure calculation                         │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. CONTROL RECOMMENDATIONS                                  │
  │    - Gap-based recommendations                              │
  │    - Compliance-driven controls                             │
  │    - Tier upgrade pathway                                   │
  │    - ROI-justified investments                              │
  └─────────────────────────────────────────────────────────────┘
```

### 1.3 Datacenter Tier Classification Context

**Tier I - Basic Capacity:**
- Single path for power and cooling
- No redundancy
- 99.671% uptime (28.8 hours downtime/year)
- Basic security acceptable

**Tier II - Redundant Capacity Components:**
- Single path with redundant components (N+1)
- 99.741% uptime (22 hours downtime/year)
- Enhanced security expected

**Tier III - Concurrently Maintainable:**
- Multiple paths, one active (N+1 or 2N)
- 99.982% uptime (1.6 hours downtime/year)
- Advanced security required

**Tier IV - Fault Tolerant:**
- Multiple active paths (2N or 2(N+1))
- 99.995% uptime (26.3 minutes downtime/year)
- Maximum security essential

**Assessment Consideration:** Security requirements scale with tier level. Higher tiers demand more sophisticated controls and redundancy.

---

## 2. Assessment Template Specifications

### 2.1 Template Configuration

```typescript
{
  name: 'Datacenter Security Assessment',
  templateType: 'datacenter',
  description: 'Comprehensive security assessment for mission-critical infrastructure focusing on uptime protection and compliance',
  siteTypeRecommendation: 'datacenter',
  calculationMethod: 'tvi', // Using T×V×I for audit defensibility
  
  defaultThreats: [
    'unauthorized_physical_access_datacenter',
    'insider_threat_privileged_access',
    'power_failure_extended',
    'cooling_failure_thermal_event',
    'fire_equipment_damage',
    'water_intrusion_equipment_damage',
    'cyber_physical_attack',
    'tailgating_mantrap_bypass',
    'theft_equipment_components',
    'sabotage_infrastructure',
    'terrorism_targeted_attack',
    'social_engineering_unauthorized_entry',
    'natural_disaster_facility_damage',
    'vendor_contractor_security_breach',
    'environmental_contamination'
  ],
  
  defaultControls: [
    // Perimeter & Site Security
    'high_security_fencing_8ft_anticlimb',
    'perimeter_intrusion_detection_system',
    'vehicle_barrier_system_k12_rated',
    'standoff_distance_100ft',
    'perimeter_lighting_meets_iesna',
    'clear_zone_perimeter_maintenance',
    'security_guard_patrol_24x7',
    'perimeter_cctv_coverage',
    
    // Building Access Control
    'biometric_access_control_multi_factor',
    'mantrap_portal_all_entries',
    'visitor_management_system_advanced',
    'visitor_escort_mandatory',
    'employee_badge_photo_id',
    'access_control_integration_all_systems',
    'access_audit_logging_tamper_proof',
    'access_revocation_immediate',
    'tailgating_detection_sensors',
    
    // Floor & Cage Level Security
    'floor_access_control_separate_zones',
    'cabinet_row_cctv_coverage',
    'cage_perimeter_fencing_full_height',
    'cage_access_control_individual',
    'cabinet_lock_electronic_or_biometric',
    'two_person_rule_sensitive_equipment',
    'customer_separation_physical_logical',
    
    // Surveillance & Monitoring
    'cctv_perimeter_complete',
    'cctv_building_exterior_all_sides',
    'cctv_lobby_reception',
    'cctv_datacenter_floor_comprehensive',
    'cctv_server_aisle_hands_on_servers',
    'cctv_loading_dock',
    'video_analytics_behavior_detection',
    'video_retention_90_days_minimum',
    'noc_soc_monitoring_24x7',
    'alarm_monitoring_central_station',
    
    // Power Infrastructure Security
    'redundant_utility_feeds_diverse_paths',
    'ups_systems_n_plus_1_minimum',
    'generator_onsite_automatic_transfer',
    'generator_fuel_72_hours_minimum',
    'fuel_storage_security_monitoring',
    'power_distribution_redundancy',
    'epo_emergency_power_off_protected',
    'electrical_room_restricted_access',
    
    // Cooling Infrastructure Security
    'cooling_redundancy_n_plus_1',
    'cooling_monitoring_automated',
    'chiller_plant_physical_security',
    'temperature_humidity_monitoring_continuous',
    'hot_aisle_cold_aisle_containment',
    'airflow_monitoring_per_cabinet',
    
    // Fire Suppression & Detection
    'fire_detection_vesda_or_equivalent',
    'fire_suppression_clean_agent_fm200_novec',
    'fire_suppression_zone_segregation',
    'manual_release_stations_protected',
    'fire_alarm_monitoring_central_station',
    'fire_system_inspection_quarterly',
    'smoke_detector_under_floor_above_ceiling',
    
    // Environmental Monitoring
    'water_leak_detection_under_floor',
    'water_leak_detection_above_ceiling',
    'environmental_monitoring_temp_humidity',
    'environmental_alerts_automated',
    'building_management_system_integrated',
    
    // Personnel Security
    'background_checks_all_datacenter_staff',
    'security_clearance_required_roles',
    'security_awareness_training_annual',
    'clean_desk_policy_enforced',
    'visitor_logs_detailed_maintained',
    'contractor_vetting_process',
    'termination_procedures_access_revocation',
    
    // Procedural & Operational Controls
    'incident_response_plan_documented',
    'disaster_recovery_plan_tested_annually',
    'change_management_process_formal',
    'work_order_system_all_maintenance',
    'tool_control_program',
    'media_destruction_policy_shredding_degaussing',
    'asset_tracking_system',
    'inventory_audit_procedures_quarterly',
    'key_card_audit_quarterly',
    'security_audit_annual_third_party',
    
    // Compliance Controls
    'soc_2_type_ii_audit_current',
    'iso_27001_certification',
    'pci_dss_compliance_if_applicable',
    'hipaa_compliance_if_applicable',
    'compliance_documentation_current',
    'penetration_testing_annual',
    'vulnerability_scanning_continuous',
    
    // Network & Logical Security
    'network_segmentation_customer_isolation',
    'network_monitoring_intrusion_detection',
    'secure_remote_access_vpn_mfa',
    'patch_management_process',
    'antivirus_endpoint_protection',
    
    // Physical Infrastructure
    'loading_dock_security_separate_entrance',
    'loading_dock_cctv_monitoring',
    'delivery_inspection_procedures',
    'secure_storage_spare_parts',
    'cable_management_secure_labeled'
  ],
  
  riskMapping: {
    // Detailed T×V×I mappings defined in Section 4
  }
}
```

---

## 3. Interview Protocol System

### 3.1 Complete Interview Questionnaire (65 Questions)

#### **SECTION 1: DATACENTER PROFILE & OPERATIONS** (7 questions)

```typescript
const datacenterProfileQuestions = [
  {
    id: 'dc_tier_classification',
    question: 'What is the datacenter tier classification?',
    type: 'single_select',
    options: [
      { value: 'tier_1', label: 'Tier I - Basic Capacity', riskIndicator: 'high' },
      { value: 'tier_2', label: 'Tier II - Redundant Components', riskIndicator: 'medium' },
      { value: 'tier_3', label: 'Tier III - Concurrently Maintainable', riskIndicator: 'low' },
      { value: 'tier_4', label: 'Tier IV - Fault Tolerant', riskIndicator: 'none' },
      { value: 'unknown', label: 'Unknown/Not Classified', riskIndicator: 'critical' }
    ],
    informsVulnerability: [
      'power_failure_extended',
      'cooling_failure_thermal_event',
      'natural_disaster_facility_damage'
    ],
    informsImpact: 'ALL_THREATS', // Tier determines overall impact
    weight: 10,
    followUpQuestions: [
      {
        condition: 'tier_1 || tier_2',
        question: 'Has there been consideration for tier upgrade? What are the barriers?',
        id: 'dc_tier_upgrade_consideration'
      }
    ]
  },
  
  {
    id: 'dc_size_capacity',
    question: 'What is the datacenter size and capacity?',
    type: 'multi_field',
    fields: [
      { name: 'square_footage', label: 'Square Footage', type: 'number' },
      { name: 'rack_count', label: 'Total Rack Count', type: 'number' },
      { name: 'power_capacity_mw', label: 'Total Power Capacity (MW)', type: 'number' },
      { name: 'current_utilization', label: 'Current Utilization %', type: 'number' }
    ],
    informsImpact: [
      'unauthorized_physical_access_datacenter',
      'fire_equipment_damage',
      'power_failure_extended'
    ],
    weight: 5
  },
  
  {
    id: 'dc_customer_type',
    question: 'What type of datacenter operation is this?',
    type: 'single_select',
    options: [
      { value: 'colocation', label: 'Colocation (Multi-Tenant)' },
      { value: 'wholesale', label: 'Wholesale Datacenter' },
      { value: 'enterprise_dedicated', label: 'Enterprise Dedicated' },
      { value: 'cloud_service_provider', label: 'Cloud Service Provider' },
      { value: 'hybrid', label: 'Hybrid Model' }
    ],
    informsThreat: [
      'insider_threat_privileged_access',
      'social_engineering_unauthorized_entry',
      'vendor_contractor_security_breach'
    ],
    weight: 3
  },
  
  {
    id: 'dc_compliance_requirements',
    question: 'What compliance certifications or requirements apply?',
    type: 'multi_select',
    options: [
      { value: 'soc2_type2', label: 'SOC 2 Type II' },
      { value: 'iso_27001', label: 'ISO 27001' },
      { value: 'pci_dss', label: 'PCI-DSS' },
      { value: 'hipaa', label: 'HIPAA' },
      { value: 'fisma', label: 'FISMA' },
      { value: 'fedramp', label: 'FedRAMP' },
      { value: 'tia_942', label: 'TIA-942' },
      { value: 'uptime_institute', label: 'Uptime Institute Certified' },
      { value: 'none', label: 'No formal compliance requirements', riskIndicator: 'high' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'cyber_physical_attack'
    ],
    weight: 8,
    followUpQuestions: [
      {
        condition: 'none',
        question: 'Why are there no compliance requirements? Does this concern customers?',
        id: 'dc_compliance_justification'
      }
    ]
  },
  
  {
    id: 'dc_uptime_sla',
    question: 'What uptime SLA is committed to customers?',
    type: 'single_select',
    options: [
      { value: 'sla_99.9', label: '99.9% (8.76 hours downtime/year)', riskIndicator: 'high' },
      { value: 'sla_99.95', label: '99.95% (4.38 hours downtime/year)', riskIndicator: 'medium' },
      { value: 'sla_99.99', label: '99.99% (52.6 minutes downtime/year)', riskIndicator: 'low' },
      { value: 'sla_99.995', label: '99.995% (26.3 minutes downtime/year)', riskIndicator: 'none' },
      { value: 'no_sla', label: 'No formal SLA', riskIndicator: 'critical' }
    ],
    informsImpact: 'ALL_THREATS',
    weight: 9,
    followUpQuestions: [
      {
        condition: 'ALL',
        question: 'What is the financial penalty for SLA violations per hour?',
        id: 'dc_sla_penalty_cost',
        type: 'currency'
      }
    ]
  },
  
  {
    id: 'dc_customer_data_sensitivity',
    question: 'What is the highest sensitivity level of data hosted?',
    type: 'single_select',
    options: [
      { value: 'public', label: 'Public/Non-Sensitive', riskIndicator: 'none' },
      { value: 'internal', label: 'Internal Business Data', riskIndicator: 'low' },
      { value: 'confidential', label: 'Confidential', riskIndicator: 'medium' },
      { value: 'regulated', label: 'Regulated (PCI, PHI, PII)', riskIndicator: 'high' },
      { value: 'classified', label: 'Government Classified', riskIndicator: 'critical' }
    ],
    informsImpact: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'theft_equipment_components',
      'cyber_physical_attack'
    ],
    weight: 8
  },
  
  {
    id: 'dc_staff_size',
    question: 'How many personnel have physical access to the datacenter?',
    type: 'multi_field',
    fields: [
      { name: 'fulltime_staff', label: 'Full-Time Staff', type: 'number' },
      { name: 'contractors', label: 'Regular Contractors', type: 'number' },
      { name: 'customer_tech', label: 'Customer Technical Staff', type: 'number' },
      { name: 'vendor_count', label: 'Regular Vendor Count', type: 'number' }
    ],
    informsThreat: [
      'insider_threat_privileged_access',
      'social_engineering_unauthorized_entry',
      'vendor_contractor_security_breach'
    ],
    weight: 4
  }
];
```

#### **SECTION 2: PERIMETER & SITE SECURITY** (8 questions)

```typescript
const perimeterSecurityQuestions = [
  {
    id: 'dc_perimeter_barrier',
    question: 'What type of perimeter barrier surrounds the datacenter facility?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No dedicated perimeter barrier', riskIndicator: 'critical' },
      { value: 'standard_fence', label: 'Standard chain-link fence (6ft or less)', riskIndicator: 'high' },
      { value: 'high_security_fence', label: 'High-security fence (8ft+) with anti-climb features', riskIndicator: 'low' },
      { value: 'wall_barrier', label: 'Concrete wall or similar solid barrier', riskIndicator: 'none' },
      { value: 'combined', label: 'Combination of barriers with depth', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'terrorism_targeted_attack',
      'theft_equipment_components'
    ],
    weight: 7,
    followUpQuestions: [
      {
        condition: 'none || standard_fence',
        question: 'Have there been any perimeter breaches or incidents?',
        id: 'dc_perimeter_incidents'
      }
    ]
  },
  
  {
    id: 'dc_standoff_distance',
    question: 'What is the standoff distance from public roads/parking to the datacenter building?',
    type: 'single_select',
    options: [
      { value: 'less_50ft', label: 'Less than 50 feet', riskIndicator: 'critical' },
      { value: '50_to_100ft', label: '50-100 feet', riskIndicator: 'high' },
      { value: '100_to_150ft', label: '100-150 feet', riskIndicator: 'medium' },
      { value: 'over_150ft', label: 'Over 150 feet', riskIndicator: 'low' },
      { value: 'vehicle_barriers', label: 'Less than recommended but has K12-rated barriers', riskIndicator: 'low' }
    ],
    informsVulnerability: [
      'terrorism_targeted_attack',
      'sabotage_infrastructure',
      'vehicle_borne_threat'
    ],
    weight: 6
  },
  
  {
    id: 'dc_perimeter_intrusion_detection',
    question: 'Does the perimeter have intrusion detection capability?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No intrusion detection', riskIndicator: 'high' },
      { value: 'motion_sensors', label: 'Motion sensors only', riskIndicator: 'medium' },
      { value: 'fence_mounted', label: 'Fence-mounted sensors (vibration/cut detection)', riskIndicator: 'low' },
      { value: 'integrated_system', label: 'Integrated system (multiple technologies)', riskIndicator: 'none' },
      { value: 'ai_analytics', label: 'AI-powered video analytics with behavioral detection', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'terrorism_targeted_attack'
    ],
    weight: 6
  },
  
  {
    id: 'dc_perimeter_lighting',
    question: 'Does perimeter lighting meet IESNA security lighting standards?',
    type: 'single_select',
    options: [
      { value: 'no_lighting', label: 'No dedicated security lighting', riskIndicator: 'critical' },
      { value: 'inadequate', label: 'Lighting present but inadequate coverage', riskIndicator: 'high' },
      { value: 'meets_minimum', label: 'Meets minimum IESNA standards', riskIndicator: 'low' },
      { value: 'exceeds_standards', label: 'Exceeds standards with redundancy', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'theft_equipment_components',
      'sabotage_infrastructure'
    ],
    weight: 5
  },
  
  {
    id: 'dc_vehicle_barriers',
    question: 'Are there vehicle barriers to prevent vehicle-borne attacks?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No vehicle barriers', riskIndicator: 'critical' },
      { value: 'bollards_standard', label: 'Standard bollards (not rated)', riskIndicator: 'high' },
      { value: 'k4_rated', label: 'K4-rated barriers', riskIndicator: 'medium' },
      { value: 'k8_rated', label: 'K8-rated barriers', riskIndicator: 'low' },
      { value: 'k12_rated', label: 'K12-rated barriers (highest protection)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'terrorism_targeted_attack',
      'vehicle_borne_threat',
      'sabotage_infrastructure'
    ],
    weight: 7
  },
  
  {
    id: 'dc_perimeter_patrol',
    question: 'Is there security patrol of the perimeter?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No patrol', riskIndicator: 'high' },
      { value: 'periodic', label: 'Periodic patrol (not 24/7)', riskIndicator: 'medium' },
      { value: 'guard_24x7', label: '24/7 guard patrol', riskIndicator: 'low' },
      { value: 'guard_plus_k9', label: '24/7 guard with K-9 units', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'terrorism_targeted_attack',
      'theft_equipment_components'
    ],
    weight: 5
  },
  
  {
    id: 'dc_perimeter_cctv',
    question: 'What is the CCTV coverage of the perimeter?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No CCTV coverage', riskIndicator: 'critical' },
      { value: 'partial', label: 'Partial coverage (gaps exist)', riskIndicator: 'high' },
      { value: 'complete', label: 'Complete coverage, no blind spots', riskIndicator: 'low' },
      { value: 'complete_plus_analytics', label: 'Complete + AI analytics for threat detection', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'terrorism_targeted_attack',
      'theft_equipment_components'
    ],
    weight: 6
  },
  
  {
    id: 'dc_security_monitoring_location',
    question: 'Where is security monitoring conducted?',
    type: 'single_select',
    options: [
      { value: 'no_monitoring', label: 'No active monitoring', riskIndicator: 'critical' },
      { value: 'onsite_business_hours', label: 'On-site during business hours only', riskIndicator: 'high' },
      { value: 'onsite_24x7', label: 'On-site 24/7 NOC/SOC', riskIndicator: 'low' },
      { value: 'offsite_monitoring', label: 'Off-site monitoring center', riskIndicator: 'medium' },
      { value: 'redundant_monitoring', label: 'Redundant monitoring (on-site + off-site)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'fire_equipment_damage',
      'power_failure_extended'
    ],
    weight: 8
  }
];
```

#### **SECTION 3: ACCESS CONTROL & AUTHENTICATION** (12 questions)

```typescript
const accessControlQuestions = [
  {
    id: 'dc_access_authentication_method',
    question: 'What authentication method is used for datacenter access?',
    type: 'single_select',
    options: [
      { value: 'key_only', label: 'Physical keys only', riskIndicator: 'critical' },
      { value: 'card_only', label: 'Access card only (single factor)', riskIndicator: 'high' },
      { value: 'card_plus_pin', label: 'Card + PIN (two-factor)', riskIndicator: 'medium' },
      { value: 'card_plus_biometric', label: 'Card + Biometric (fingerprint/palm)', riskIndicator: 'low' },
      { value: 'three_factor', label: 'Three-factor (card + biometric + PIN)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'social_engineering_unauthorized_entry',
      'tailgating_mantrap_bypass'
    ],
    weight: 9,
    followUpQuestions: [
      {
        condition: 'key_only || card_only',
        question: 'Have there been incidents of lost credentials or unauthorized duplication?',
        id: 'dc_credential_incidents'
      }
    ]
  },
  
  {
    id: 'dc_biometric_type',
    question: 'If biometrics are used, what type?',
    type: 'single_select',
    options: [
      { value: 'not_used', label: 'Biometrics not used' },
      { value: 'fingerprint', label: 'Fingerprint' },
      { value: 'palm_vein', label: 'Palm vein (more secure)' },
      { value: 'facial_recognition', label: 'Facial recognition' },
      { value: 'iris_scan', label: 'Iris scan' },
      { value: 'multiple_biometric', label: 'Multiple biometric options available' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access'
    ],
    weight: 4,
    conditionalDisplay: {
      dependsOn: 'dc_access_authentication_method',
      showIf: ['card_plus_biometric', 'three_factor']
    }
  },
  
  {
    id: 'dc_mantrap_portals',
    question: 'Are man-trap portals (security vestibules) used at datacenter entrances?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No man-traps, standard doors', riskIndicator: 'high' },
      { value: 'main_entrance_only', label: 'Main entrance only', riskIndicator: 'medium' },
      { value: 'all_entrances', label: 'All datacenter entrances', riskIndicator: 'low' },
      { value: 'all_plus_weight_sensors', label: 'All entrances + weight sensors (anti-tailgating)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'tailgating_mantrap_bypass',
      'social_engineering_unauthorized_entry'
    ],
    weight: 8
  },
  
  {
    id: 'dc_tailgating_prevention',
    question: 'What measures prevent tailgating (piggybacking)?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No specific measures', riskIndicator: 'critical' },
      { value: 'signage_only', label: 'Signage and policy only', riskIndicator: 'high' },
      { value: 'guard_observation', label: 'Guard observation', riskIndicator: 'medium' },
      { value: 'mantrap_portals', label: 'Man-trap portals', riskIndicator: 'low' },
      { value: 'weight_sensors', label: 'Weight sensors in portals', riskIndicator: 'none' },
      { value: 'turnstiles', label: 'Full-height turnstiles', riskIndicator: 'low' },
      { value: 'video_analytics', label: 'Video analytics for tailgating detection', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'tailgating_mantrap_bypass'
    ],
    weight: 7
  },
  
  {
    id: 'dc_visitor_management',
    question: 'Describe the visitor management process:',
    type: 'multi_select',
    options: [
      { value: 'no_formal_process', label: 'No formal process', riskIndicator: 'critical' },
      { value: 'sign_in_log', label: 'Sign-in log only', riskIndicator: 'high' },
      { value: 'automated_system', label: 'Automated visitor management system', riskIndicator: 'low' },
      { value: 'id_verification', label: 'ID verification and photo capture', riskIndicator: 'low' },
      { value: 'background_checks', label: 'Background checks for frequent visitors', riskIndicator: 'none' },
      { value: 'escort_required', label: 'Escort required at all times', riskIndicator: 'none' },
      { value: 'advance_approval', label: 'Advance approval required', riskIndicator: 'low' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'social_engineering_unauthorized_entry',
      'vendor_contractor_security_breach'
    ],
    weight: 7
  },
  
  {
    id: 'dc_escort_requirements',
    question: 'Are visitors required to be escorted in the datacenter at all times?',
    type: 'single_select',
    options: [
      { value: 'no_escort', label: 'No escort required', riskIndicator: 'critical' },
      { value: 'escort_optional', label: 'Escort optional or situational', riskIndicator: 'high' },
      { value: 'escort_required_floor', label: 'Escort required on datacenter floor only', riskIndicator: 'medium' },
      { value: 'escort_required_all', label: 'Escort required in all areas', riskIndicator: 'low' },
      { value: 'two_person_escort', label: 'Two-person escort for sensitive areas', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'theft_equipment_components'
    ],
    weight: 8
  },
  
  {
    id: 'dc_cabinet_level_access',
    question: 'How is access controlled at the cabinet/rack level?',
    type: 'single_select',
    options: [
      { value: 'no_cabinet_locks', label: 'No cabinet-level locks', riskIndicator: 'critical' },
      { value: 'standard_locks', label: 'Standard mechanical locks (same key)', riskIndicator: 'high' },
      { value: 'unique_keys', label: 'Unique mechanical locks per cabinet', riskIndicator: 'medium' },
      { value: 'electronic_locks', label: 'Electronic locks with access logging', riskIndicator: 'low' },
      { value: 'biometric_cabinet', label: 'Biometric locks on cabinets', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'theft_equipment_components'
    ],
    weight: 7
  },
  
  {
    id: 'dc_access_logging',
    question: 'Is all physical access logged and auditable?',
    type: 'single_select',
    options: [
      { value: 'no_logging', label: 'No access logging', riskIndicator: 'critical' },
      { value: 'manual_logs', label: 'Manual logs only', riskIndicator: 'high' },
      { value: 'automated_entry_exit', label: 'Automated logging of entry/exit', riskIndicator: 'medium' },
      { value: 'automated_all_doors', label: 'Automated logging at all access points', riskIndicator: 'low' },
      { value: 'tamper_proof_audit', label: 'Tamper-proof audit trail with video correlation', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'compliance_audit_failure'
    ],
    weight: 8
  },
  
  {
    id: 'dc_access_review_frequency',
    question: 'How often are access rights reviewed and updated?',
    type: 'single_select',
    options: [
      { value: 'never', label: 'Never or ad-hoc only', riskIndicator: 'critical' },
      { value: 'annually', label: 'Annually', riskIndicator: 'high' },
      { value: 'quarterly', label: 'Quarterly', riskIndicator: 'medium' },
      { value: 'monthly', label: 'Monthly', riskIndicator: 'low' },
      { value: 'continuous', label: 'Continuous monitoring with automated alerts', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'insider_threat_privileged_access',
      'unauthorized_physical_access_datacenter'
    ],
    weight: 6
  },
  
  {
    id: 'dc_access_revocation',
    question: 'How quickly are access rights revoked when employment ends?',
    type: 'single_select',
    options: [
      { value: 'delayed', label: 'Delayed (24+ hours)', riskIndicator: 'critical' },
      { value: 'same_day', label: 'Same business day', riskIndicator: 'high' },
      { value: 'within_hours', label: 'Within hours', riskIndicator: 'medium' },
      { value: 'immediate', label: 'Immediate (automated)', riskIndicator: 'low' },
      { value: 'before_notification', label: 'Before termination notification', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'insider_threat_privileged_access',
      'unauthorized_physical_access_datacenter',
      'sabotage_infrastructure'
    ],
    weight: 8
  },
  
  {
    id: 'dc_customer_access_control',
    question: 'For colocation/multi-tenant: How is customer access segregated?',
    type: 'multi_select',
    options: [
      { value: 'not_applicable', label: 'Not applicable (dedicated facility)' },
      { value: 'no_segregation', label: 'No segregation', riskIndicator: 'critical' },
      { value: 'floor_level', label: 'Segregation at floor level', riskIndicator: 'medium' },
      { value: 'cage_level', label: 'Individual cages with separate access', riskIndicator: 'low' },
      { value: 'cabinet_level', label: 'Cabinet-level access control', riskIndicator: 'low' },
      { value: 'zoned_access', label: 'Zoned access (customers can only access their zones)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'customer_data_compromise',
      'insider_threat_privileged_access'
    ],
    weight: 7,
    conditionalDisplay: {
      dependsOn: 'dc_customer_type',
      showIf: ['colocation', 'hybrid']
    }
  },
  
  {
    id: 'dc_two_person_rule',
    question: 'Is a two-person rule enforced for sensitive areas or equipment?',
    type: 'single_select',
    options: [
      { value: 'not_enforced', label: 'Not enforced', riskIndicator: 'high' },
      { value: 'policy_only', label: 'Policy exists but not technically enforced', riskIndicator: 'medium' },
      { value: 'enforced_critical_areas', label: 'Technically enforced for critical areas', riskIndicator: 'low' },
      { value: 'enforced_all_sensitive', label: 'Enforced for all sensitive access', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'insider_threat_privileged_access',
      'sabotage_infrastructure',
      'theft_equipment_components'
    ],
    weight: 6
  }
];
```

#### **SECTION 4: SURVEILLANCE & MONITORING** (8 questions)

```typescript
const surveillanceQuestions = [
  {
    id: 'dc_cctv_coverage_areas',
    question: 'Which areas have CCTV coverage?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No CCTV coverage', riskIndicator: 'critical' },
      { value: 'perimeter', label: 'Perimeter', required: true },
      { value: 'building_exterior', label: 'Building exterior (all sides)', required: true },
      { value: 'parking_areas', label: 'Parking areas', required: true },
      { value: 'lobby_reception', label: 'Lobby/reception', required: true },
      { value: 'datacenter_floor', label: 'Datacenter floor (general)', required: true },
      { value: 'server_aisles', label: 'Server aisles (between racks)', required: true },
      { value: 'cage_entrances', label: 'Cage entrances', required: true },
      { value: 'loading_dock', label: 'Loading dock', required: true },
      { value: 'electrical_rooms', label: 'Electrical/mechanical rooms', required: true },
      { value: 'emergency_exits', label: 'Emergency exits', required: true }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'theft_equipment_components'
    ],
    weight: 9,
    followUpQuestions: [
      {
        condition: 'missing_critical_areas',
        question: 'What is preventing CCTV installation in uncovered areas?',
        id: 'dc_cctv_gaps_reason'
      }
    ]
  },
  
  {
    id: 'dc_cctv_hands_on_servers',
    question: 'Can CCTV see hands-on-servers activity?',
    type: 'single_select',
    options: [
      { value: 'no_coverage', label: 'Cannot see server work', riskIndicator: 'critical' },
      { value: 'limited_coverage', label: 'Limited visibility', riskIndicator: 'high' },
      { value: 'aisle_level_only', label: 'Can see aisle activity but not into cabinets', riskIndicator: 'medium' },
      { value: 'cabinet_front_visible', label: 'Can see cabinet front (hands-on activity)', riskIndicator: 'low' },
      { value: 'multi_angle_coverage', label: 'Multi-angle coverage capturing all hands-on work', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'insider_threat_privileged_access',
      'theft_equipment_components',
      'sabotage_infrastructure'
    ],
    weight: 8
  },
  
  {
    id: 'dc_video_retention',
    question: 'How long is video footage retained?',
    type: 'single_select',
    options: [
      { value: 'less_than_7_days', label: 'Less than 7 days', riskIndicator: 'critical' },
      { value: '7_to_30_days', label: '7-30 days', riskIndicator: 'high' },
      { value: '30_to_90_days', label: '30-90 days', riskIndicator: 'medium' },
      { value: '90_days_plus', label: '90+ days', riskIndicator: 'low' },
      { value: '1_year_plus', label: '1 year or more (compliance-driven)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'insider_threat_privileged_access',
      'compliance_audit_failure',
      'incident_investigation_difficulty'
    ],
    weight: 6
  },
  
  {
    id: 'dc_video_analytics',
    question: 'Does the CCTV system use video analytics?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No video analytics', riskIndicator: 'medium' },
      { value: 'motion_detection', label: 'Basic motion detection', riskIndicator: 'low' },
      { value: 'object_detection', label: 'Object detection and classification', riskIndicator: 'none' },
      { value: 'facial_recognition', label: 'Facial recognition', riskIndicator: 'none' },
      { value: 'behavior_analysis', label: 'Behavioral analysis (loitering, tailgating)', riskIndicator: 'none' },
      { value: 'license_plate_recognition', label: 'License plate recognition (LPR)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'tailgating_mantrap_bypass'
    ],
    weight: 5
  },
  
  {
    id: 'dc_24x7_monitoring',
    question: 'Is there 24/7 active monitoring of surveillance systems?',
    type: 'single_select',
    options: [
      { value: 'no_monitoring', label: 'No active monitoring (recording only)', riskIndicator: 'critical' },
      { value: 'business_hours', label: 'Business hours only', riskIndicator: 'high' },
      { value: 'offsite_monitoring', label: '24/7 off-site monitoring center', riskIndicator: 'medium' },
      { value: 'onsite_noc_soc', label: '24/7 on-site NOC/SOC', riskIndicator: 'low' },
      { value: 'redundant_monitoring', label: 'Redundant (on-site + off-site)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'insider_threat_privileged_access',
      'fire_equipment_damage',
      'power_failure_extended'
    ],
    weight: 9
  },
  
  {
    id: 'dc_alarm_monitoring',
    question: 'How are intrusion alarms monitored?',
    type: 'single_select',
    options: [
      { value: 'no_alarms', label: 'No alarm system', riskIndicator: 'critical' },
      { value: 'local_only', label: 'Local alarms only (audio/visual)', riskIndicator: 'high' },
      { value: 'onsite_response', label: 'On-site security response', riskIndicator: 'medium' },
      { value: 'central_station', label: 'Central monitoring station', riskIndicator: 'low' },
      { value: 'integrated_response', label: 'Integrated with video and automated law enforcement dispatch', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'theft_equipment_components',
      'sabotage_infrastructure'
    ],
    weight: 7
  },
  
  {
    id: 'dc_monitoring_integration',
    question: 'Are physical security systems integrated with IT/network monitoring?',
    type: 'single_select',
    options: [
      { value: 'no_integration', label: 'No integration (separate systems)', riskIndicator: 'high' },
      { value: 'basic_integration', label: 'Basic integration (shared dashboard)', riskIndicator: 'medium' },
      { value: 'correlated_events', label: 'Correlated event analysis', riskIndicator: 'low' },
      { value: 'siem_integration', label: 'Integrated into SIEM for cyber-physical threat detection', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'cyber_physical_attack',
      'insider_threat_privileged_access',
      'incident_investigation_difficulty'
    ],
    weight: 6
  },
  
  {
    id: 'dc_monitoring_response_time',
    question: 'What is the average response time for physical security alerts?',
    type: 'single_select',
    options: [
      { value: 'over_30_min', label: 'Over 30 minutes', riskIndicator: 'critical' },
      { value: '15_to_30_min', label: '15-30 minutes', riskIndicator: 'high' },
      { value: '5_to_15_min', label: '5-15 minutes', riskIndicator: 'medium' },
      { value: 'under_5_min', label: 'Under 5 minutes', riskIndicator: 'low' },
      { value: 'immediate', label: 'Immediate (under 2 minutes)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'fire_equipment_damage',
      'sabotage_infrastructure'
    ],
    weight: 7
  }
];
```

#### **SECTION 5: POWER & INFRASTRUCTURE SECURITY** (7 questions)

```typescript
const powerInfrastructureQuestions = [
  {
    id: 'dc_power_redundancy',
    question: 'What is the power infrastructure redundancy level?',
    type: 'single_select',
    options: [
      { value: 'single_path', label: 'Single path (no redundancy)', riskIndicator: 'critical' },
      { value: 'n_plus_1', label: 'N+1 redundancy', riskIndicator: 'medium' },
      { value: '2n', label: '2N redundancy (fully redundant)', riskIndicator: 'low' },
      { value: '2n_plus_1', label: '2(N+1) redundancy (fault tolerant)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'power_failure_extended',
      'equipment_failure_downtime'
    ],
    informsImpact: 'ALL_THREATS',
    weight: 10
  },
  
  {
    id: 'dc_utility_feeds',
    question: 'How many diverse utility feeds supply the datacenter?',
    type: 'single_select',
    options: [
      { value: 'single_feed', label: 'Single utility feed', riskIndicator: 'critical' },
      { value: 'dual_same_substation', label: 'Dual feeds from same substation', riskIndicator: 'high' },
      { value: 'dual_different_substations', label: 'Dual feeds from different substations', riskIndicator: 'medium' },
      { value: 'dual_diverse_paths', label: 'Dual feeds with diverse geographic paths', riskIndicator: 'low' },
      { value: 'three_plus_diverse', label: 'Three or more diverse feeds', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'power_failure_extended',
      'natural_disaster_facility_damage'
    ],
    weight: 8
  },
  
  {
    id: 'dc_generator_capacity',
    question: 'What is the on-site generator fuel capacity?',
    type: 'single_select',
    options: [
      { value: 'no_generator', label: 'No generator', riskIndicator: 'critical' },
      { value: 'less_24_hours', label: 'Less than 24 hours at full load', riskIndicator: 'high' },
      { value: '24_to_48_hours', label: '24-48 hours', riskIndicator: 'medium' },
      { value: '48_to_72_hours', label: '48-72 hours', riskIndicator: 'low' },
      { value: 'over_72_hours', label: 'Over 72 hours', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'power_failure_extended',
      'natural_disaster_facility_damage'
    ],
    informsImpact: 'ALL_THREATS',
    weight: 9,
    followUpQuestions: [
      {
        condition: 'ALL',
        question: 'Is there a fuel supply agreement for emergency refueling?',
        id: 'dc_fuel_supply_agreement'
      }
    ]
  },
  
  {
    id: 'dc_ups_runtime',
    question: 'What is the UPS battery runtime at full load?',
    type: 'single_select',
    options: [
      { value: 'no_ups', label: 'No UPS system', riskIndicator: 'critical' },
      { value: 'less_5_min', label: 'Less than 5 minutes', riskIndicator: 'high' },
      { value: '5_to_15_min', label: '5-15 minutes', riskIndicator: 'medium' },
      { value: '15_to_30_min', label: '15-30 minutes', riskIndicator: 'low' },
      { value: 'over_30_min', label: 'Over 30 minutes', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'power_failure_extended',
      'equipment_failure_downtime'
    ],
    weight: 7
  },
  
  {
    id: 'dc_fuel_storage_security',
    question: 'How is generator fuel storage secured?',
    type: 'multi_select',
    options: [
      { value: 'not_applicable', label: 'No generator/No fuel storage' },
      { value: 'no_security', label: 'No security measures', riskIndicator: 'critical' },
      { value: 'locked_cap', label: 'Locked fuel cap', riskIndicator: 'medium' },
      { value: 'fenced_area', label: 'Fenced area with locked access', riskIndicator: 'low' },
      { value: 'monitored_cctv', label: 'CCTV monitoring', riskIndicator: 'low' },
      { value: 'leak_detection', label: 'Leak detection system', riskIndicator: 'none' },
      { value: 'level_monitoring', label: 'Fuel level monitoring for theft detection', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'sabotage_infrastructure',
      'theft_fuel_supplies',
      'environmental_contamination'
    ],
    weight: 5
  },
  
  {
    id: 'dc_epo_protection',
    question: 'Is the Emergency Power Off (EPO) system protected against accidental or malicious activation?',
    type: 'single_select',
    options: [
      { value: 'no_protection', label: 'No protection (exposed button)', riskIndicator: 'critical' },
      { value: 'cover_only', label: 'Protective cover only', riskIndicator: 'high' },
      { value: 'cover_plus_signage', label: 'Cover + clear signage', riskIndicator: 'medium' },
      { value: 'two_button_activation', label: 'Two-button activation required', riskIndicator: 'low' },
      { value: 'secured_logged', label: 'Secured with access logging and video coverage', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'sabotage_infrastructure',
      'insider_threat_privileged_access',
      'accidental_activation_downtime'
    ],
    weight: 7
  },
  
  {
    id: 'dc_electrical_room_access',
    question: 'How is access to electrical and mechanical rooms controlled?',
    type: 'single_select',
    options: [
      { value: 'unrestricted', label: 'Unrestricted access', riskIndicator: 'critical' },
      { value: 'locked_no_logging', label: 'Locked but no access logging', riskIndicator: 'high' },
      { value: 'card_access', label: 'Card access with logging', riskIndicator: 'medium' },
      { value: 'restricted_authorized_only', label: 'Restricted to authorized personnel only', riskIndicator: 'low' },
      { value: 'two_person_rule', label: 'Two-person rule enforced', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'sabotage_infrastructure',
      'insider_threat_privileged_access',
      'unauthorized_physical_access_datacenter'
    ],
    weight: 8
  }
];
```

#### **SECTION 6: COOLING & ENVIRONMENTAL CONTROLS** (6 questions)

```typescript
const coolingEnvironmentalQuestions = [
  {
    id: 'dc_cooling_redundancy',
    question: 'What is the cooling system redundancy level?',
    type: 'single_select',
    options: [
      { value: 'no_redundancy', label: 'No redundancy (single cooling system)', riskIndicator: 'critical' },
      { value: 'n_plus_1', label: 'N+1 redundancy', riskIndicator: 'medium' },
      { value: '2n', label: '2N redundancy', riskIndicator: 'low' },
      { value: '2n_plus_1', label: '2(N+1) redundancy', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'cooling_failure_thermal_event',
      'equipment_failure_downtime'
    ],
    informsImpact: 'ALL_THREATS',
    weight: 10
  },
  
  {
    id: 'dc_temp_humidity_monitoring',
    question: 'How is temperature and humidity monitored?',
    type: 'single_select',
    options: [
      { value: 'no_monitoring', label: 'No environmental monitoring', riskIndicator: 'critical' },
      { value: 'manual_checks', label: 'Manual checks only', riskIndicator: 'high' },
      { value: 'automated_alerts', label: 'Automated with alert thresholds', riskIndicator: 'medium' },
      { value: 'continuous_multi_zone', label: 'Continuous monitoring across multiple zones', riskIndicator: 'low' },
      { value: 'rack_level_monitoring', label: 'Rack-level monitoring with predictive analytics', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'cooling_failure_thermal_event',
      'equipment_failure_downtime'
    ],
    weight: 8
  },
  
  {
    id: 'dc_hot_cold_aisle_containment',
    question: 'Is hot aisle/cold aisle containment implemented?',
    type: 'single_select',
    options: [
      { value: 'no_containment', label: 'No containment strategy', riskIndicator: 'high' },
      { value: 'partial_containment', label: 'Partial containment', riskIndicator: 'medium' },
      { value: 'hot_aisle_containment', label: 'Hot aisle containment', riskIndicator: 'low' },
      { value: 'cold_aisle_containment', label: 'Cold aisle containment', riskIndicator: 'low' },
      { value: 'both_containment', label: 'Both hot and cold aisle containment', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'cooling_failure_thermal_event',
      'energy_efficiency_impact'
    ],
    weight: 5
  },
  
  {
    id: 'dc_water_leak_detection',
    question: 'Is water leak detection installed?',
    type: 'multi_select',
    options: [
      { value: 'no_detection', label: 'No leak detection', riskIndicator: 'critical' },
      { value: 'under_floor', label: 'Under raised floor', required: true },
      { value: 'above_ceiling', label: 'Above drop ceiling', required: true },
      { value: 'near_cooling', label: 'Near cooling equipment', required: true },
      { value: 'automated_shutoff', label: 'Integrated with automated water shutoff', riskIndicator: 'none' },
      { value: 'building_management_system', label: 'Integrated with BMS for alerts', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'water_intrusion_equipment_damage',
      'cooling_failure_thermal_event'
    ],
    weight: 8
  },
  
  {
    id: 'dc_chiller_plant_security',
    question: 'How is the chiller plant/cooling infrastructure physically secured?',
    type: 'multi_select',
    options: [
      { value: 'not_secured', label: 'Not secured (exposed/accessible)', riskIndicator: 'critical' },
      { value: 'fenced_locked', label: 'Fenced and locked area', riskIndicator: 'medium' },
      { value: 'cctv_monitoring', label: 'CCTV monitoring', riskIndicator: 'low' },
      { value: 'access_control', label: 'Access control with logging', riskIndicator: 'low' },
      { value: 'intrusion_detection', label: 'Intrusion detection', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'sabotage_infrastructure',
      'cooling_failure_thermal_event',
      'theft_equipment_components'
    ],
    weight: 6
  },
  
  {
    id: 'dc_environmental_contamination_protection',
    question: 'What protections exist against environmental contamination?',
    type: 'multi_select',
    options: [
      { value: 'no_protection', label: 'No specific protections', riskIndicator: 'high' },
      { value: 'air_filtration', label: 'HEPA air filtration', riskIndicator: 'low' },
      { value: 'positive_pressure', label: 'Positive air pressure', riskIndicator: 'low' },
      { value: 'air_quality_monitoring', label: 'Air quality monitoring', riskIndicator: 'none' },
      { value: 'isolation_from_industrial', label: 'Isolated from industrial areas', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'environmental_contamination',
      'equipment_failure_downtime'
    ],
    weight: 4
  }
];
```

#### **SECTION 7: FIRE SUPPRESSION & LIFE SAFETY** (6 questions)

```typescript
const fireSuppressionQuestions = [
  {
    id: 'dc_fire_detection_system',
    question: 'What type of fire detection system is installed?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No fire detection', riskIndicator: 'critical' },
      { value: 'smoke_detectors_standard', label: 'Standard smoke detectors', riskIndicator: 'high' },
      { value: 'smoke_detectors_enhanced', label: 'Enhanced smoke detectors (under floor + above ceiling)', riskIndicator: 'medium' },
      { value: 'vesda', label: 'VESDA (Very Early Smoke Detection Apparatus)', riskIndicator: 'low' },
      { value: 'vesda_plus_thermal', label: 'VESDA + thermal detection', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'fire_equipment_damage',
      'delayed_incident_response'
    ],
    weight: 9
  },
  
  {
    id: 'dc_fire_suppression_type',
    question: 'What fire suppression system is installed in the datacenter?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No suppression system', riskIndicator: 'critical' },
      { value: 'water_sprinklers', label: 'Water sprinklers', riskIndicator: 'critical' },
      { value: 'pre_action_sprinklers', label: 'Pre-action sprinklers (double interlock)', riskIndicator: 'high' },
      { value: 'fm200', label: 'FM-200 (clean agent)', riskIndicator: 'low' },
      { value: 'novec_1230', label: 'Novec 1230 (clean agent)', riskIndicator: 'low' },
      { value: 'inert_gas', label: 'Inert gas (IG-541, etc.)', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'fire_equipment_damage',
      'water_intrusion_equipment_damage'
    ],
    informsImpact: 'ALL_THREATS',
    weight: 10,
    followUpQuestions: [
      {
        condition: 'water_sprinklers',
        question: 'Why are water sprinklers used in a datacenter? What is the plan to mitigate equipment damage risk?',
        id: 'dc_water_sprinkler_justification'
      }
    ]
  },
  
  {
    id: 'dc_fire_suppression_zones',
    question: 'Is the fire suppression system zoned for selective discharge?',
    type: 'single_select',
    options: [
      { value: 'no_zoning', label: 'No zoning (entire facility discharges together)', riskIndicator: 'high' },
      { value: 'basic_zoning', label: 'Basic zoning (2-3 zones)', riskIndicator: 'medium' },
      { value: 'detailed_zoning', label: 'Detailed zoning by datacenter area', riskIndicator: 'low' },
      { value: 'row_level_zoning', label: 'Row-level or cage-level zoning', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'fire_equipment_damage',
      'unnecessary_downtime_adjacent_areas'
    ],
    weight: 5
  },
  
  {
    id: 'dc_manual_release_protection',
    question: 'Are manual fire suppression release stations protected against accidental activation?',
    type: 'single_select',
    options: [
      { value: 'not_protected', label: 'Not protected (exposed)', riskIndicator: 'critical' },
      { value: 'signage_only', label: 'Signage only', riskIndicator: 'high' },
      { value: 'cover_protection', label: 'Protective cover', riskIndicator: 'medium' },
      { value: 'double_action', label: 'Double-action release (pull + twist)', riskIndicator: 'low' },
      { value: 'secured_logged', label: 'Secured with access logging and CCTV coverage', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'accidental_suppression_activation',
      'insider_threat_privileged_access',
      'sabotage_infrastructure'
    ],
    weight: 7
  },
  
  {
    id: 'dc_fire_system_monitoring',
    question: 'How is the fire detection/suppression system monitored?',
    type: 'single_select',
    options: [
      { value: 'no_monitoring', label: 'No monitoring (local alarms only)', riskIndicator: 'critical' },
      { value: 'onsite_only', label: 'On-site monitoring only', riskIndicator: 'high' },
      { value: 'central_station', label: 'Central monitoring station', riskIndicator: 'medium' },
      { value: 'central_plus_onsite', label: 'Central station + on-site NOC', riskIndicator: 'low' },
      { value: 'integrated_bms', label: 'Fully integrated with BMS and automated response', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'fire_equipment_damage',
      'delayed_incident_response'
    ],
    weight: 7
  },
  
  {
    id: 'dc_fire_system_testing',
    question: 'How often is the fire detection and suppression system tested?',
    type: 'single_select',
    options: [
      { value: 'never', label: 'Never tested', riskIndicator: 'critical' },
      { value: 'annually', label: 'Annually', riskIndicator: 'high' },
      { value: 'semi_annually', label: 'Semi-annually', riskIndicator: 'medium' },
      { value: 'quarterly', label: 'Quarterly', riskIndicator: 'low' },
      { value: 'monthly', label: 'Monthly with detailed documentation', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'fire_equipment_damage',
      'system_failure_untested'
    ],
    weight: 6
  }
];
```

#### **SECTION 8: PERSONNEL SECURITY & OPERATIONAL CONTROLS** (7 questions)

```typescript
const personnelSecurityQuestions = [
  {
    id: 'dc_background_checks',
    question: 'What level of background checks are required for datacenter personnel?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No background checks', riskIndicator: 'critical' },
      { value: 'basic_criminal', label: 'Basic criminal history check', riskIndicator: 'high' },
      { value: 'level_1', label: 'Level 1 (criminal + employment verification)', riskIndicator: 'medium' },
      { value: 'level_2', label: 'Level 2 (criminal + employment + education + credit)', riskIndicator: 'low' },
      { value: 'government_clearance', label: 'Government security clearance required', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'insider_threat_privileged_access',
      'social_engineering_unauthorized_entry'
    ],
    weight: 8
  },
  
  {
    id: 'dc_security_training',
    question: 'What security awareness training is provided to personnel?',
    type: 'multi_select',
    options: [
      { value: 'no_training', label: 'No security training', riskIndicator: 'critical' },
      { value: 'onboarding_only', label: 'One-time onboarding only', riskIndicator: 'high' },
      { value: 'annual_refresher', label: 'Annual refresher training', riskIndicator: 'medium' },
      { value: 'phishing_testing', label: 'Phishing simulation testing', riskIndicator: 'low' },
      { value: 'social_engineering', label: 'Social engineering awareness', riskIndicator: 'low' },
      { value: 'insider_threat_awareness', label: 'Insider threat indicators training', riskIndicator: 'none' },
      { value: 'incident_response', label: 'Incident response procedures', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'insider_threat_privileged_access',
      'social_engineering_unauthorized_entry',
      'human_error_incidents'
    ],
    weight: 6
  },
  
  {
    id: 'dc_contractor_vetting',
    question: 'How are contractors and vendors vetted before access is granted?',
    type: 'multi_select',
    options: [
      { value: 'no_vetting', label: 'No vetting process', riskIndicator: 'critical' },
      { value: 'company_verification', label: 'Company verification only', riskIndicator: 'high' },
      { value: 'individual_background_checks', label: 'Individual background checks', riskIndicator: 'medium' },
      { value: 'nda_required', label: 'NDA required', riskIndicator: 'low' },
      { value: 'security_briefing', label: 'Security briefing before access', riskIndicator: 'low' },
      { value: 'escort_required', label: 'Escort required at all times', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'vendor_contractor_security_breach',
      'insider_threat_privileged_access',
      'social_engineering_unauthorized_entry'
    ],
    weight: 7
  },
  
  {
    id: 'dc_termination_procedures',
    question: 'What procedures are followed when an employee with datacenter access is terminated?',
    type: 'multi_select',
    options: [
      { value: 'no_formal_process', label: 'No formal termination process', riskIndicator: 'critical' },
      { value: 'access_revoked_eventually', label: 'Access revoked within 24 hours', riskIndicator: 'high' },
      { value: 'immediate_badge_collection', label: 'Immediate badge collection', riskIndicator: 'medium' },
      { value: 'immediate_system_access_revocation', label: 'Immediate system access revocation', riskIndicator: 'low' },
      { value: 'exit_interview', label: 'Exit interview with security', riskIndicator: 'low' },
      { value: 'access_audit_post_term', label: 'Access audit after termination', riskIndicator: 'none' },
      { value: 'escort_from_facility', label: 'Escort from facility immediately', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'insider_threat_privileged_access',
      'sabotage_infrastructure',
      'theft_equipment_components'
    ],
    weight: 8
  },
  
  {
    id: 'dc_incident_response_plan',
    question: 'Is there a documented physical security incident response plan?',
    type: 'single_select',
    options: [
      { value: 'no_plan', label: 'No documented plan', riskIndicator: 'critical' },
      { value: 'plan_exists_not_tested', label: 'Plan exists but never tested', riskIndicator: 'high' },
      { value: 'tested_annually', label: 'Plan tested annually', riskIndicator: 'medium' },
      { value: 'tested_quarterly', label: 'Plan tested quarterly', riskIndicator: 'low' },
      { value: 'tested_integrated', label: 'Regularly tested and integrated with cyber IR', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'delayed_incident_response',
      'unauthorized_physical_access_datacenter',
      'fire_equipment_damage'
    ],
    weight: 7
  },
  
  {
    id: 'dc_tool_control',
    question: 'Is there a tool control program for equipment brought into the datacenter?',
    type: 'single_select',
    options: [
      { value: 'no_control', label: 'No tool control', riskIndicator: 'high' },
      { value: 'visual_inspection_only', label: 'Visual inspection only', riskIndicator: 'medium' },
      { value: 'logged_checkoutin', label: 'Tools logged at check-in/check-out', riskIndicator: 'low' },
      { value: 'approved_tools_only', label: 'Only pre-approved tools allowed', riskIndicator: 'none' },
      { value: 'rfid_tracking', label: 'RFID tracking of all tools', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'theft_equipment_components',
      'sabotage_infrastructure',
      'insider_threat_privileged_access'
    ],
    weight: 5
  },
  
  {
    id: 'dc_media_destruction',
    question: 'What is the process for destroying decommissioned storage media?',
    type: 'single_select',
    options: [
      { value: 'no_formal_process', label: 'No formal destruction process', riskIndicator: 'critical' },
      { value: 'software_wipe_only', label: 'Software wipe only', riskIndicator: 'high' },
      { value: 'degaussing', label: 'Degaussing for magnetic media', riskIndicator: 'medium' },
      { value: 'physical_destruction', label: 'Physical destruction (shredding/crushing)', riskIndicator: 'low' },
      { value: 'certified_destruction', label: 'Certified destruction with chain of custody', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'data_breach_physical_access',
      'customer_data_compromise',
      'compliance_audit_failure'
    ],
    weight: 7
  }
];
```

#### **SECTION 9: COMPLIANCE & AUDIT** (6 questions)

```typescript
const complianceAuditQuestions = [
  {
    id: 'dc_current_certifications',
    question: 'What current security certifications does the datacenter hold?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No certifications', riskIndicator: 'high' },
      { value: 'soc2_type1', label: 'SOC 2 Type I' },
      { value: 'soc2_type2', label: 'SOC 2 Type II' },
      { value: 'iso27001', label: 'ISO 27001' },
      { value: 'pci_dss', label: 'PCI-DSS' },
      { value: 'hipaa_compliant', label: 'HIPAA Compliant' },
      { value: 'fisma', label: 'FISMA' },
      { value: 'fedramp', label: 'FedRAMP' },
      { value: 'tia942', label: 'TIA-942' },
      { value: 'uptime_institute', label: 'Uptime Institute Tier Certification' }
    ],
    informsVulnerability: [
      'compliance_audit_failure',
      'customer_contract_violations',
      'regulatory_penalties'
    ],
    weight: 8
  },
  
  {
    id: 'dc_audit_frequency',
    question: 'How often are independent security audits conducted?',
    type: 'single_select',
    options: [
      { value: 'never', label: 'Never', riskIndicator: 'critical' },
      { value: 'ad_hoc', label: 'Ad-hoc/as needed', riskIndicator: 'high' },
      { value: 'every_2_3_years', label: 'Every 2-3 years', riskIndicator: 'medium' },
      { value: 'annually', label: 'Annually', riskIndicator: 'low' },
      { value: 'semi_annually', label: 'Semi-annually or more frequent', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'compliance_audit_failure',
      'undetected_vulnerabilities',
      'drift_from_best_practices'
    ],
    weight: 7
  },
  
  {
    id: 'dc_penetration_testing',
    question: 'How often is physical penetration testing conducted?',
    type: 'single_select',
    options: [
      { value: 'never', label: 'Never conducted', riskIndicator: 'critical' },
      { value: 'once_ever', label: 'Conducted once in the past', riskIndicator: 'high' },
      { value: 'every_2_years', label: 'Every 2 years', riskIndicator: 'medium' },
      { value: 'annually', label: 'Annually', riskIndicator: 'low' },
      { value: 'semi_annually', label: 'Semi-annually or continuous red teaming', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'unauthorized_physical_access_datacenter',
      'undetected_vulnerabilities',
      'tailgating_mantrap_bypass'
    ],
    weight: 7
  },
  
  {
    id: 'dc_compliance_documentation',
    question: 'Is security compliance documentation current and accessible for customer audits?',
    type: 'single_select',
    options: [
      { value: 'no_documentation', label: 'No formal documentation', riskIndicator: 'critical' },
      { value: 'outdated', label: 'Documentation exists but outdated', riskIndicator: 'high' },
      { value: 'current_manual', label: 'Current but manual updates', riskIndicator: 'medium' },
      { value: 'current_automated', label: 'Current with automated tracking', riskIndicator: 'low' },
      { value: 'grc_platform', label: 'Managed in GRC platform with continuous monitoring', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'compliance_audit_failure',
      'customer_audit_failures',
      'lost_business_opportunities'
    ],
    weight: 6
  },
  
  {
    id: 'dc_vulnerability_scanning',
    question: 'Is vulnerability scanning performed on physical security systems?',
    type: 'single_select',
    options: [
      { value: 'never', label: 'Never performed', riskIndicator: 'critical' },
      { value: 'ad_hoc', label: 'Ad-hoc when issues arise', riskIndicator: 'high' },
      { value: 'quarterly', label: 'Quarterly', riskIndicator: 'medium' },
      { value: 'monthly', label: 'Monthly', riskIndicator: 'low' },
      { value: 'continuous', label: 'Continuous scanning with automated remediation', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'cyber_physical_attack',
      'undetected_vulnerabilities',
      'system_compromise_outdated_firmware'
    ],
    weight: 7
  },
  
  {
    id: 'dc_change_management',
    question: 'Is there a formal change management process for physical security systems?',
    type: 'single_select',
    options: [
      { value: 'no_process', label: 'No formal process', riskIndicator: 'critical' },
      { value: 'informal', label: 'Informal/undocumented process', riskIndicator: 'high' },
      { value: 'documented_not_enforced', label: 'Documented but not enforced', riskIndicator: 'medium' },
      { value: 'enforced_manual', label: 'Enforced with manual approvals', riskIndicator: 'low' },
      { value: 'automated_workflow', label: 'Automated workflow with audit trail', riskIndicator: 'none' }
    ],
    informsVulnerability: [
      'system_compromise_misconfiguration',
      'unauthorized_changes',
      'compliance_audit_failure'
    ],
    weight: 6
  }
];
```

---

## 4. Risk Mapping & Calculation Integration

### 4.1 Datacenter-Specific Threats

```typescript
const datacenterThreats = [
  {
    id: 'unauthorized_physical_access_datacenter',
    name: 'Unauthorized Physical Access to Datacenter',
    category: 'Access Control',
    baselineThreatScore: 8, // High-value target
    baselineImpactScore: 9, // Severe consequences
    description: 'Unauthorized individuals gaining physical access to datacenter infrastructure',
    affectedAssets: ['Server infrastructure', 'Network equipment', 'Customer data', 'Critical systems']
  },
  
  {
    id: 'insider_threat_privileged_access',
    name: 'Insider Threat - Privileged Access Abuse',
    category: 'Personnel',
    baselineThreatScore: 7,
    baselineImpactScore: 9,
    description: 'Employees or contractors with authorized access exploiting privileges',
    affectedAssets: ['Customer data', 'Infrastructure', 'Intellectual property']
  },
  
  {
    id: 'power_failure_extended',
    name: 'Extended Power Failure',
    category: 'Infrastructure',
    baselineThreatScore: 6,
    baselineImpactScore: 10, // Maximum impact for datacenter
    description: 'Loss of power beyond UPS/generator capacity',
    affectedAssets: ['All systems', 'SLA commitments', 'Customer operations']
  },
  
  {
    id: 'cooling_failure_thermal_event',
    name: 'Cooling System Failure / Thermal Event',
    category: 'Environmental',
    baselineThreatScore: 6,
    baselineImpactScore: 9,
    description: 'HVAC failure leading to overheating and equipment damage',
    affectedAssets: ['Server hardware', 'Network equipment', 'Storage systems']
  },
  
  {
    id: 'fire_equipment_damage',
    name: 'Fire Causing Equipment Damage',
    category: 'Fire/Life Safety',
    baselineThreatScore: 3, // Lower likelihood with modern systems
    baselineImpactScore: 10,
    description: 'Fire event causing physical damage or suppression system collateral damage',
    affectedAssets: ['All physical infrastructure', 'Data', 'Facility']
  },
  
  {
    id: 'water_intrusion_equipment_damage',
    name: 'Water Intrusion Equipment Damage',
    category: 'Environmental',
    baselineThreatScore: 5,
    baselineImpactScore: 8,
    description: 'Water leaks from cooling, plumbing, or weather damaging equipment',
    affectedAssets: ['Server infrastructure', 'Electrical systems', 'Network equipment']
  },
  
  {
    id: 'cyber_physical_attack',
    name: 'Cyber-Physical Attack',
    category: 'Hybrid',
    baselineThreatScore: 7,
    baselineImpactScore: 9,
    description: 'Coordinated attack combining cyber intrusion with physical access',
    affectedAssets: ['All systems', 'Customer data', 'Infrastructure control systems']
  },
  
  {
    id: 'tailgating_mantrap_bypass',
    name: 'Tailgating / Man-Trap Bypass',
    category: 'Access Control',
    baselineThreatScore: 6,
    baselineImpactScore: 7,
    description: 'Unauthorized entry by following authorized personnel',
    affectedAssets: ['Datacenter access', 'Infrastructure', 'Customer separation']
  },
  
  {
    id: 'theft_equipment_components',
    name: 'Theft of Equipment or Components',
    category: 'Theft',
    baselineThreatScore: 5,
    baselineImpactScore: 7,
    description: 'Physical theft of servers, drives, network equipment, or components',
    affectedAssets: ['Customer data', 'Equipment', 'Service availability']
  },
  
  {
    id: 'sabotage_infrastructure',
    name: 'Sabotage of Infrastructure',
    category: 'Sabotage',
    baselineThreatScore: 4,
    baselineImpactScore: 9,
    description: 'Intentional disruption or destruction of critical infrastructure',
    affectedAssets: ['Power systems', 'Cooling', 'Network infrastructure', 'Operations']
  },
  
  {
    id: 'terrorism_targeted_attack',
    name: 'Terrorism / Targeted Attack',
    category: 'Terrorism',
    baselineThreatScore: 2, // Low likelihood but catastrophic
    baselineImpactScore: 10,
    description: 'Coordinated terrorist attack or nation-state targeting',
    affectedAssets: ['Entire facility', 'Personnel', 'All customer operations']
  },
  
  {
    id: 'social_engineering_unauthorized_entry',
    name: 'Social Engineering for Unauthorized Entry',
    category: 'Social Engineering',
    baselineThreatScore: 7,
    baselineImpactScore: 7,
    description: 'Manipulating personnel to gain unauthorized access',
    affectedAssets: ['Access control', 'Datacenter floor', 'Sensitive areas']
  },
  
  {
    id: 'natural_disaster_facility_damage',
    name: 'Natural Disaster Facility Damage',
    category: 'Natural Disaster',
    baselineThreatScore: 4, // Location-dependent
    baselineImpactScore: 9,
    description: 'Earthquake, hurricane, tornado, or flood causing facility damage',
    affectedAssets: ['Entire facility', 'All infrastructure', 'Business continuity']
  },
  
  {
    id: 'vendor_contractor_security_breach',
    name: 'Vendor/Contractor Security Breach',
    category: 'Third Party',
    baselineThreatScore: 6,
    baselineImpactScore: 7,
    description: 'Third parties exploiting access for malicious purposes',
    affectedAssets: ['Customer data', 'Infrastructure', 'Access control integrity']
  },
  
  {
    id: 'environmental_contamination',
    name: 'Environmental Contamination',
    category: 'Environmental',
    baselineThreatScore: 3,
    baselineImpactScore: 6,
    description: 'Air quality issues, dust, or chemical contamination damaging equipment',
    affectedAssets: ['Server hardware', 'Network equipment', 'Cooling systems']
  }
];
```

### 4.2 T×V×I Calculation Logic

```typescript
// Example: Calculating risk for "Unauthorized Physical Access"
function calculateDatacenterRisk(
  interviewResponses: InterviewResponses,
  threatId: string
): RiskScore {
  let T = getBaselineThreatScore(threatId); // Start with baseline
  let V = 5; // Start at median
  let I = getBaselineImpactScore(threatId);
  
  // === THREAT MODIFIERS ===
  if (threatId === 'unauthorized_physical_access_datacenter') {
    // Location intelligence (from crime data)
    if (facilityInHighCrimeArea) T += 2;
    
    // Customer data sensitivity increases attractiveness
    if (responses.dc_customer_data_sensitivity === 'regulated') T += 1;
    if (responses.dc_customer_data_sensitivity === 'classified') T += 2;
    
    // Tier IV datacenters are higher-value targets
    if (responses.dc_tier_classification === 'tier_4') T += 1;
  }
  
  // === VULNERABILITY MODIFIERS ===
  if (threatId === 'unauthorized_physical_access_datacenter') {
    // Perimeter security
    if (responses.dc_perimeter_barrier === 'none') V += 3;
    else if (responses.dc_perimeter_barrier === 'standard_fence') V += 2;
    else if (responses.dc_perimeter_barrier === 'high_security_fence') V -= 1;
    else if (responses.dc_perimeter_barrier === 'combined') V -= 2;
    
    // Access authentication
    if (responses.dc_access_authentication_method === 'key_only') V += 3;
    else if (responses.dc_access_authentication_method === 'card_only') V += 2;
    else if (responses.dc_access_authentication_method === 'card_plus_pin') V += 0;
    else if (responses.dc_access_authentication_method === 'card_plus_biometric') V -= 1;
    else if (responses.dc_access_authentication_method === 'three_factor') V -= 2;
    
    // Man-trap portals
    if (responses.dc_mantrap_portals === 'none') V += 2;
    else if (responses.dc_mantrap_portals === 'main_entrance_only') V += 1;
    else if (responses.dc_mantrap_portals === 'all_entrances') V -= 1;
    else if (responses.dc_mantrap_portals === 'all_plus_weight_sensors') V -= 2;
    
    // CCTV coverage
    if (responses.dc_perimeter_cctv === 'none') V += 2;
    else if (responses.dc_perimeter_cctv === 'partial') V += 1;
    else if (responses.dc_perimeter_cctv === 'complete_plus_analytics') V -= 2;
    
    // 24/7 monitoring
    if (responses.dc_24x7_monitoring === 'no_monitoring') V += 2;
    else if (responses.dc_24x7_monitoring === 'redundant_monitoring') V -= 2;
  }
  
  // === IMPACT MODIFIERS ===
  // SLA commitments dramatically affect impact
  if (responses.dc_uptime_sla === 'sla_99.995') {
    I = 10; // Maximum impact for 99.995% SLA
  } else if (responses.dc_uptime_sla === 'sla_99.99') {
    I = 9;
  } else if (responses.dc_uptime_sla === 'sla_99.95') {
    I = 8;
  }
  
  // Tier classification affects impact
  if (responses.dc_tier_classification === 'tier_4') I = Math.max(I, 9);
  if (responses.dc_tier_classification === 'tier_1') I = Math.max(I - 2, 3);
  
  // Compliance requirements increase impact
  const complianceRequirements = responses.dc_compliance_requirements || [];
  if (complianceRequirements.includes('fedramp') || complianceRequirements.includes('pci_dss')) {
    I += 1;
  }
  
  // Customer count (for colocation)
  if (responses.dc_size_capacity?.rack_count > 1000) I += 1;
  
  // Ensure scores stay in valid range
  T = Math.max(1, Math.min(10, T));
  V = Math.max(1, Math.min(10, V));
  I = Math.max(1, Math.min(10, I));
  
  const riskScore = T * V * I;
  const riskLevel = getRiskLevel(riskScore);
  
  return {
    threat: T,
    vulnerability: V,
    impact: I,
    totalRisk: riskScore,
    riskLevel: riskLevel,
    confidenceLevel: calculateConfidenceLevel(interviewResponses)
  };
}
```

---

## 5. Control Selection & Recommendations

### 5.1 Gap-Based Control Recommendations

```typescript
function generateDatacenterControlRecommendations(
  interviewResponses: InterviewResponses,
  calculatedRisks: RiskScore[]
): ControlRecommendation[] {
  const recommendations: ControlRecommendation[] = [];
  
  // CRITICAL: Tier-appropriate controls
  if (responses.dc_tier_classification === 'tier_1' || responses.dc_tier_classification === 'tier_2') {
    if (highImpactSLA(responses)) {
      recommendations.push({
        control: 'Consider tier upgrade to match SLA commitments',
        priority: 'CRITICAL',
        category: 'Infrastructure',
        estimatedCost: '$2M-10M (major capital investment)',
        riskReduction: 30,
        justification: 'Current tier insufficient for stated uptime SLA'
      });
    }
  }
  
  // PERIMETER SECURITY
  if (responses.dc_perimeter_barrier === 'none' || responses.dc_perimeter_barrier === 'standard_fence') {
    recommendations.push({
      control: 'high_security_fencing_8ft_anticlimb',
      priority: 'HIGH',
      category: 'Perimeter',
      estimatedCost: '$100K-300K',
      riskReduction: 15,
      threatsAddressed: ['unauthorized_physical_access_datacenter', 'terrorism_targeted_attack']
    });
  }
  
  if (responses.dc_standoff_distance === 'less_50ft' && !responses.dc_vehicle_barriers) {
    recommendations.push({
      control: 'vehicle_barrier_system_k12_rated',
      priority: 'HIGH',
      category: 'Perimeter',
      estimatedCost: '$200K-500K',
      riskReduction: 20,
      threatsAddressed: ['terrorism_targeted_attack', 'sabotage_infrastructure']
    });
  }
  
  // ACCESS CONTROL
  if (responses.dc_access_authentication_method === 'key_only' || 
      responses.dc_access_authentication_method === 'card_only') {
    recommendations.push({
      control: 'biometric_access_control_multi_factor',
      priority: 'CRITICAL',
      category: 'Access Control',
      estimatedCost: '$150K-400K',
      riskReduction: 25,
      threatsAddressed: ['unauthorized_physical_access_datacenter', 'social_engineering_unauthorized_entry'],
      justification: 'Single-factor authentication inadequate for datacenter security'
    });
  }
  
  if (responses.dc_mantrap_portals === 'none') {
    recommendations.push({
      control: 'mantrap_portal_all_entries',
      priority: 'HIGH',
      category: 'Access Control',
      estimatedCost: '$100K-250K per entrance',
      riskReduction: 18,
      threatsAddressed: ['tailgating_mantrap_bypass', 'unauthorized_physical_access_datacenter']
    });
  }
  
  if (!responses.dc_cabinet_level_access || responses.dc_cabinet_level_access === 'no_cabinet_locks') {
    recommendations.push({
      control: 'cabinet_lock_electronic_or_biometric',
      priority: 'MEDIUM',
      category: 'Access Control',
      estimatedCost: '$200-500 per cabinet',
      riskReduction: 12,
      threatsAddressed: ['insider_threat_privileged_access', 'theft_equipment_components']
    });
  }
  
  // SURVEILLANCE
  const cctvCoverage = responses.dc_cctv_coverage_areas || [];
  const criticalAreas = ['perimeter', 'building_exterior', 'datacenter_floor', 'server_aisles'];
  const missingCoverage = criticalAreas.filter(area => !cctvCoverage.includes(area));
  
  if (missingCoverage.length > 0) {
    recommendations.push({
      control: 'comprehensive_cctv_coverage',
      priority: 'HIGH',
      category: 'Surveillance',
      estimatedCost: '$50K-150K',
      riskReduction: 15,
      threatsAddressed: ['insider_threat_privileged_access', 'unauthorized_physical_access_datacenter'],
      justification: `Missing CCTV in: ${missingCoverage.join(', ')}`
    });
  }
  
  if (responses.dc_24x7_monitoring === 'no_monitoring' || 
      responses.dc_24x7_monitoring === 'business_hours') {
    recommendations.push({
      control: 'noc_soc_monitoring_24x7',
      priority: 'CRITICAL',
      category: 'Operations',
      estimatedCost: '$500K-1M annually',
      riskReduction: 30,
      threatsAddressed: 'ALL_THREATS',
      justification: 'Datacenter requires continuous monitoring for SLA compliance'
    });
  }
  
  // POWER INFRASTRUCTURE
  if (responses.dc_power_redundancy === 'single_path' || 
      responses.dc_power_redundancy === 'n_plus_1') {
    if (responses.dc_tier_classification === 'tier_3' || responses.dc_tier_classification === 'tier_4') {
      recommendations.push({
        control: 'power_distribution_redundancy_2n',
        priority: 'CRITICAL',
        category: 'Infrastructure',
        estimatedCost: '$1M-3M',
        riskReduction: 35,
        threatsAddressed: ['power_failure_extended', 'equipment_failure_downtime'],
        justification: 'Tier classification requires higher redundancy'
      });
    }
  }
  
  if (!responses.dc_generator_capacity || 
      responses.dc_generator_capacity === 'no_generator' ||
      responses.dc_generator_capacity === 'less_24_hours') {
    recommendations.push({
      control: 'generator_fuel_72_hours_minimum',
      priority: 'CRITICAL',
      category: 'Infrastructure',
      estimatedCost: '$50K-200K (fuel storage expansion)',
      riskReduction: 25,
      threatsAddressed: ['power_failure_extended', 'natural_disaster_facility_damage'],
      justification: 'Insufficient fuel capacity for extended outages'
    });
  }
  
  // COOLING INFRASTRUCTURE
  if (responses.dc_cooling_redundancy === 'no_redundancy') {
    recommendations.push({
      control: 'cooling_redundancy_n_plus_1',
      priority: 'CRITICAL',
      category: 'Infrastructure',
      estimatedCost: '$500K-2M',
      riskReduction: 30,
      threatsAddressed: ['cooling_failure_thermal_event', 'equipment_failure_downtime'],
      justification: 'No cooling redundancy is unacceptable for datacenter operations'
    });
  }
  
  if (!responses.dc_water_leak_detection || 
      !responses.dc_water_leak_detection.includes('under_floor')) {
    recommendations.push({
      control: 'water_leak_detection_comprehensive',
      priority: 'HIGH',
      category: 'Environmental',
      estimatedCost: '$30K-80K',
      riskReduction: 15,
      threatsAddressed: ['water_intrusion_equipment_damage']
    });
  }
  
  // FIRE SUPPRESSION
  if (responses.dc_fire_suppression_type === 'none' || 
      responses.dc_fire_suppression_type === 'water_sprinklers') {
    recommendations.push({
      control: 'fire_suppression_clean_agent_fm200_novec',
      priority: 'CRITICAL',
      category: 'Life Safety',
      estimatedCost: '$200K-600K',
      riskReduction: 40,
      threatsAddressed: ['fire_equipment_damage', 'water_intrusion_equipment_damage'],
      justification: 'Water suppression creates secondary damage risk'
    });
  }
  
  if (responses.dc_fire_detection_system !== 'vesda' && 
      responses.dc_fire_detection_system !== 'vesda_plus_thermal') {
    recommendations.push({
      control: 'fire_detection_vesda_or_equivalent',
      priority: 'HIGH',
      category: 'Life Safety',
      estimatedCost: '$100K-250K',
      riskReduction: 18,
      threatsAddressed: ['fire_equipment_damage']
    });
  }
  
  // PERSONNEL SECURITY
  if (responses.dc_background_checks === 'none' || 
      responses.dc_background_checks === 'basic_criminal') {
    recommendations.push({
      control: 'background_checks_level_2_all_staff',
      priority: 'HIGH',
      category: 'Personnel',
      estimatedCost: '$200-500 per employee',
      riskReduction: 15,
      threatsAddressed: ['insider_threat_privileged_access', 'social_engineering_unauthorized_entry']
    });
  }
  
  // COMPLIANCE
  const complianceRequirements = responses.dc_compliance_requirements || [];
  if (complianceRequirements.includes('none') && responses.dc_customer_type === 'colocation') {
    recommendations.push({
      control: 'soc_2_type_ii_audit_current',
      priority: 'HIGH',
      category: 'Compliance',
      estimatedCost: '$50K-150K annually',
      riskReduction: 10,
      threatsAddressed: ['compliance_audit_failure', 'customer_contract_violations'],
      justification: 'SOC 2 expected for colocation providers'
    });
  }
  
  if (responses.dc_penetration_testing === 'never' || 
      responses.dc_penetration_testing === 'once_ever') {
    recommendations.push({
      control: 'penetration_testing_annual',
      priority: 'MEDIUM',
      category: 'Compliance',
      estimatedCost: '$25K-75K annually',
      riskReduction: 12,
      threatsAddressed: ['unauthorized_physical_access_datacenter', 'undetected_vulnerabilities']
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
```

---

## 6. Implementation Workflow

### 6.1 Database Schema Extensions

```typescript
// Extend assessmentTemplates table
interface DatacenterAssessmentTemplate extends BaseAssessmentTemplate {
  tierClassification: 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4' | 'unknown';
  powerCapacityMW: number;
  rackCount: number;
  customerType: 'colocation' | 'wholesale' | 'enterprise_dedicated' | 'cloud_service_provider' | 'hybrid';
  complianceRequirements: string[]; // ['soc2_type2', 'iso27001', 'pci_dss', etc.]
  uptimeSLA: string; // '99.9', '99.95', '99.99', '99.995'
  slaViolationCostPerHour: number;
}

// Extend riskScenarios table for datacenter-specific fields
interface DatacenterRiskScenario extends BaseRiskScenario {
  impactOnSLA: string; // Narrative description
  downtimeCostEstimate: number; // Financial impact calculation
  complianceImplications: string[]; // Which compliance frameworks affected
}
```

### 6.2 API Endpoints

```typescript
// POST /api/assessments/[id]/datacenter-interview
// Start or continue datacenter interview
export async function startDatacenterInterview(assessmentId: string) {
  // Initialize interview state
  // Return first section of questions
}

// POST /api/assessments/[id]/datacenter-interview/submit-section
// Submit responses for a section and get next section
export async function submitInterviewSection(
  assessmentId: string,
  sectionId: string,
  responses: Record<string, any>
) {
  // Save responses
  // Calculate preliminary risks for this section
  // Determine follow-up questions
  // Return next section or completion status
}

// POST /api/assessments/[id]/calculate-datacenter-risks
// Calculate all risks based on complete interview
export async function calculateDatacenterRisks(assessmentId: string) {
  const responses = await getInterviewResponses(assessmentId);
  const risks = [];
  
  for (const threat of datacenterThreats) {
    const riskScore = calculateDatacenterRisk(responses, threat.id);
    risks.push({
      threatId: threat.id,
      ...riskScore,
      scenario: generateRiskScenario(threat, responses, riskScore)
    });
  }
  
  return risks;
}

// GET /api/assessments/[id]/datacenter-recommendations
// Generate control recommendations
export async function getDatacenterRecommendations(assessmentId: string) {
  const responses = await getInterviewResponses(assessmentId);
  const risks = await getRiskScenarios(assessmentId);
  
  return generateDatacenterControlRecommendations(responses, risks);
}
```

### 6.3 UI Components

**Component: DatacenterInterviewWizard**
- Multi-step form with progress indicator
- Section-by-section progression
- Real-time risk indicators for vulnerable responses
- Follow-up question handling
- Save and resume capability

**Component: DatacenterProfileSummary**
- Visual tier classification display
- Key metrics dashboard (power capacity, rack count, SLA)
- Compliance status badges
- Quick-view facility characteristics

**Component: DatacenterRiskMatrix**
- Risk heat map specialized for datacenter threats
- Grouping by category (Infrastructure, Access Control, Environmental, etc.)
- SLA impact visualization
- Downtime cost calculations

**Component: DatacenterControlRecommendations**
- Prioritized recommendations with tier-upgrade pathway
- ROI calculator showing downtime cost avoidance
- Compliance gap analysis
- Implementation complexity scoring

---

## 7. API Integration Specifications

### 7.1 Tier Classification Intelligence

```typescript
// Analyze tier classification and recommend upgrades
interface TierAnalysis {
  currentTier: string;
  infrastructureCapabilities: {
    powerRedundancy: string;
    coolingRedundancy: string;
    networkPaths: number;
    compartmentalization: boolean;
  };
  recommendedTier: string;
  gapsToNextTier: string[];
  estimatedUpgradeCost: number;
  justification: string;
}

async function analyzeTierClassification(
  responses: InterviewResponses
): Promise<TierAnalysis> {
  // Analyze actual capabilities vs stated tier
  // Identify gaps
  // Calculate upgrade path and costs
}
```

### 7.2 SLA Impact Calculator

```typescript
// Calculate financial impact of downtime based on SLA
interface SLAImpactCalculation {
  slaCommitment: string; // "99.995%"
  allowedDowntimePerYear: string; // "26.3 minutes"
  riskScenarioDowntimeEstimate: number; // minutes
  slaViolation: boolean;
  financialPenalty: number;
  reputationalImpact: string;
  customerChurnRisk: string;
}

function calculateSLAImpact(
  slaCommitment: string,
  downtimeEstimate: number,
  costPerHour: number
): SLAImpactCalculation {
  // Complex calculation based on SLA tier
  // Factor in customer contracts
  // Estimate cascading impacts
}
```

---

## 8. UI Components

### 8.1 Datacenter Dashboard

**Visual Elements:**
- Tier classification badge (prominent display)
- Uptime SLA gauge (with current year performance)
- Compliance certification status grid
- Key metrics tiles:
  - Power capacity utilization
  - Cooling capacity utilization
  - Rack utilization
  - Current risk score distribution

**Interactive Features:**
- Drill-down into each compliance requirement
- Historical SLA performance trend
- Risk heat map by datacenter zone

### 8.2 Interview Progress Visualization

**Section Progress:**
```
Datacenter Security Assessment Progress:

✓ 1. Datacenter Profile & Operations
✓ 2. Perimeter & Site Security  
► 3. Access Control & Authentication (In Progress: 8/12 questions)
  4. Surveillance & Monitoring
  5. Power & Infrastructure Security
  6. Cooling & Environmental Controls
  7. Fire Suppression & Life Safety
  8. Personnel Security & Operational Controls
  9. Compliance & Audit

Overall: 35% Complete (23/65 questions answered)
```

---

## 9. PDF Report Template

### 9.1 Datacenter Report Structure

```
=====================================
DATACENTER SECURITY ASSESSMENT
[Facility Name] | [Date]
Assessment ID: [NUMBER]
=====================================

TABLE OF CONTENTS
1. Executive Summary
2. Facility Profile
3. Compliance & Certification Status
4. Risk Assessment Results
5. Control Recommendations
6. Implementation Roadmap
7. Appendices

---

1. EXECUTIVE SUMMARY

Facility: [Name]
Location: [Address]
Tier Classification: [Tier X]
SLA Commitment: [99.XX%]
Assessment Date: [Date]
Consultant: [Name]

Overall Security Posture: [Rating]
Critical Findings: [Count]
High-Priority Recommendations: [Count]
Estimated Investment for Compliance: [$X]

Key Findings:
- [Finding 1]
- [Finding 2]
- [Finding 3]

---

2. FACILITY PROFILE

Classification & Capacity:
- Tier: [I/II/III/IV]
- Square Footage: [X sq ft]
- Rack Count: [X racks]
- Power Capacity: [X MW]
- Current Utilization: [X%]

Customer Profile:
- Type: [Colocation/Wholesale/Enterprise]
- Customer Count: [X customers]
- Data Sensitivity: [Level]

Compliance Requirements:
- [Cert 1]: [Status]
- [Cert 2]: [Status]

---

3. COMPLIANCE & CERTIFICATION STATUS

Current Certifications:
✓ SOC 2 Type II (Expires: [Date])
✗ ISO 27001 (Not Certified)
✓ PCI-DSS (Audited: [Date])

Gap Analysis:
- Missing Control 1
- Missing Control 2

---

4. RISK ASSESSMENT RESULTS

[Risk Matrix Heat Map]

Critical Risks (Risk Score > 700):
1. [Risk Name] - Score: [XXX]
   - Threat: [X]
   - Vulnerability: [X]
   - Impact: [X]
   - Scenario: [Description]
   - SLA Impact: [Description]
   - Downtime Cost: [$X]

High Risks (Risk Score 400-700):
[...]

---

5. CONTROL RECOMMENDATIONS

Priority Matrix:
[Visual grid showing recommendations by priority and category]

Critical Recommendations:
1. [Control Name]
   - Category: [Access Control/Infrastructure/etc.]
   - Estimated Cost: [$X]
   - Risk Reduction: [X%]
   - Threats Addressed: [List]
   - Implementation Timeline: [X months]
   - ROI Justification: [Description]

---

6. IMPLEMENTATION ROADMAP

Phase 1 (0-3 months) - Critical Controls:
- [Control 1] - $[X]
- [Control 2] - $[X]
Total Investment: $[X]
Risk Reduction: [X%]

Phase 2 (3-6 months) - High Priority:
[...]

Phase 3 (6-12 months) - Medium Priority:
[...]

Total Program Cost: $[X]
Total Risk Reduction: [X%]

---

7. APPENDICES

A. Interview Responses Summary
B. Risk Calculation Methodology
C. Control Catalog
D. Compliance Mapping Matrix
E. Photos & Observations
F. Vendor Recommendations
```

---

## 10. Implementation Roadmap

### 10.1 17-Day Development Sprint

#### **Day 1-2: Template Configuration & Database**
- Create datacenter template configuration
- Extend database schema for datacenter-specific fields
- Add datacenter threats to seed data
- Add datacenter controls to seed data

#### **Day 3-5: Interview System**
- Build interview questionnaire data structure
- Create interview wizard UI component
- Implement section-by-section progression
- Add follow-up question logic
- Build save/resume functionality

#### **Day 6-7: Risk Calculation Engine**
- Implement T×V×I calculation for each threat
- Build threat modifier logic
- Build vulnerability modifier logic
- Build impact modifier logic
- Add SLA impact calculator
- Add downtime cost calculator

#### **Day 8-9: Control Recommendations**
- Build gap analysis engine
- Implement control recommendation logic
- Create tier upgrade pathway calculator
- Build ROI justification generator
- Implement prioritization algorithm

#### **Day 10-11: UI Components**
- Build datacenter dashboard
- Create risk visualization components
- Build recommendation cards with filtering
- Create compliance status grid
- Add tier classification visual

#### **Day 12-13: Compliance Integration**
- Build compliance gap analyzer
- Create compliance mapping matrix
- Add certification status tracking
- Build audit documentation generator

#### **Day 14-15: PDF Report Generation**
- Create datacenter report template
- Build tier-specific report sections
- Add SLA impact visualizations
- Generate compliance documentation
- Add implementation roadmap

#### **Day 16: Testing & Refinement**
- End-to-end workflow testing
- Risk calculation validation
- Recommendation engine testing
- PDF generation testing
- Bug fixes

#### **Day 17: Documentation & Deployment**
- Create user documentation
- Write deployment notes
- Final testing
- Deploy to production

---

## Conclusion

This Datacenter Security Assessment Framework provides:

1. **Comprehensive Coverage** - 65+ questions across 9 critical sections
2. **Audit Defensibility** - Rigorous T×V×I methodology with datacenter-specific modifiers
3. **Compliance Focus** - Built-in gap analysis for SOC 2, ISO 27001, PCI-DSS, etc.
4. **Tier Intelligence** - Analysis of actual capabilities vs tier classification
5. **SLA Protection** - Downtime cost calculations and SLA impact assessment
6. **ROI Justification** - Financial modeling for control investments
7. **Professional Deliverables** - Sophisticated PDF reports for enterprise clients

The framework recognizes that datacenters are mission-critical infrastructure where physical security directly impacts:
- Uptime and SLA compliance
- Customer data protection
- Regulatory compliance
- Financial exposure
- Business reputation

By systematically assessing all layers of physical security—from perimeter to cabinet level—and integrating with environmental, power, and operational controls, this template delivers the sophistication enterprise datacenter operators demand.

---

**END OF DATACENTER FRAMEWORK DOCUMENT**
