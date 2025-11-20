# RiskFixer: Datacenter Security Assessment Framework
## Comprehensive Specification for Critical Infrastructure & Colocation Facilities

**Version:** 1.0  
**Integration Target:** RiskFixer Master Framework v2.0  
**Focus:** Datacenter, Colocation, and Critical IT Infrastructure Security Assessments  
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
- Single-tenant perspective
- Basic access control

**Datacenter Security Assessment:**
- **Compliance-driven security** - SOC 2, ISO 27001, PCI-DSS, HIPAA requirements
- **Defense in depth** - Multiple layers of physical security
- **Cyber-physical integration** - Physical security enables logical security
- **Environmental criticality** - Cooling/power failures = data loss
- **Multi-tenant complexity** - Customer isolation and cross-contamination prevention
- **Uptime requirements** - 99.9%+ availability SLAs
- **Cabinet-level security** - Granular access control beyond room access
- **Privileged access management** - Insider threat is primary concern
- **Tier classification** - Industry-standard architecture requirements (Uptime Institute)
- **Audit trail requirements** - Every access event must be logged

### 1.2 Datacenter Tier Classification

| Tier | Name | Uptime % | Annual Downtime | Redundancy | Description |
|------|------|----------|-----------------|------------|-------------|
| I | Basic | 99.671% | 28.8 hours | None (N) | Single path, no redundancy |
| II | Redundant Components | 99.741% | 22.0 hours | N+1 components | Single path, redundant components |
| III | Concurrently Maintainable | 99.982% | 1.6 hours | N+1 dual path | Active/passive distribution |
| IV | Fault Tolerant | 99.995% | 0.4 hours | 2N or 2(N+1) | Fully redundant, fault tolerant |

### 1.3 Assessment Components

```
Datacenter Security Assessment = 
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. DATACENTER PROFILE & CLASSIFICATION                      │
  │    - Tier classification (I-IV)                             │
  │    - Customer type (colocation, enterprise, cloud)          │
  │    - Compliance requirements (SOC 2, ISO, PCI, HIPAA)       │
  │    - Square footage and rack count                          │
  │    - Uptime SLA commitments                                 │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. COMPREHENSIVE SECURITY INTERVIEW (10 Sections, 65+ Q's) │
  │    - Physical perimeter security                            │
  │    - Multi-factor access control & biometrics               │
  │    - Surveillance and 24/7 monitoring                       │
  │    - Environmental controls (power, cooling, fire)          │
  │    - Logical security integration                           │
  │    - Personnel vetting and insider threat                   │
  │    - Multi-tenant isolation                                 │
  │    - Compliance audit history                               │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. PHYSICAL SECURITY WALKTHROUGH                            │
  │    - Perimeter barriers and standoff distance               │
  │    - Man-trap/portal effectiveness                          │
  │    - Cabinet lock inspection                                │
  │    - Hot/cold aisle containment                             │
  │    - Environmental monitoring systems                       │
  │    - SOC/NOC operations observation                         │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. AUTO-GENERATED RISK SCENARIOS (12-14 Threats)           │
  │    - Unauthorized physical access to customer data          │
  │    - Insider threat - privileged access abuse               │
  │    - Data theft - server/drive removal                      │
  │    - Environmental failure - cooling loss                   │
  │    - Power failure - service disruption                     │
  │    - Fire - catastrophic data loss                          │
  │    - Social engineering - unauthorized access               │
  │    - Multi-tenant breach - cross-contamination              │
  │    - Sabotage - infrastructure disruption                   │
  │    - Supply chain - hardware tampering                      │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. CONTROL RECOMMENDATIONS                                  │
  │    - Biometric authentication upgrades                      │
  │    - Man-trap/portal systems                                │
  │    - Cabinet-level electronic locks                         │
  │    - Environmental monitoring enhancement                   │
  │    - Redundancy improvements (power/cooling)                │
  │    - Compliance gap remediation                             │
  │    - Insider threat detection systems                       │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. COMPLIANCE-READY PDF REPORT                              │
  │    - SOC 2 control mapping                                  │
  │    - ISO 27001 physical security domains                    │
  │    - Tier classification analysis                           │
  │    - Risk scenarios with compliance impact                  │
  │    - Audit-ready recommendations                            │
  │    - Uptime risk analysis                                   │
  └─────────────────────────────────────────────────────────────┘
```

### 1.4 Key Threats for Datacenter Environments

| Priority | Threat Category | Typical Likelihood | Typical Impact | Compliance Relevance |
|----------|----------------|-------------------|----------------|---------------------|
| Critical | Unauthorized Physical Access - Customer Data | 2 | 5 | SOC 2, ISO, PCI, HIPAA |
| Critical | Insider Threat - Privileged Access Abuse | 3 | 5 | SOC 2, ISO |
| High | Environmental Failure - Cooling Loss | 2 | 5 | Business Continuity |
| High | Power Failure - Service Disruption | 2 | 5 | Uptime SLA |
| High | Data Theft - Server/Drive Removal | 2 | 5 | SOC 2, PCI |
| Medium | Fire - Data Loss | 1 | 5 | Business Continuity |
| Medium | Multi-Tenant Breach - Cross-Contamination | 2 | 4 | SOC 2 (Type II) |
| Medium | Social Engineering - Fake Technician | 2 | 4 | ISO 27001 |
| Medium | Sabotage - Infrastructure Disruption | 1 | 5 | Business Continuity |
| Low | Tailgating - Unauthorized Entry | 3 | 3 | SOC 2 |
| Low | Supply Chain - Hardware Tampering | 1 | 4 | ISO 27001 |
| Low | Physical Surveillance - Espionage | 1 | 4 | Customer Contracts |

---

## 2. Assessment Template Specifications

### 2.1 Template Configuration

```typescript
{
  name: 'Datacenter Security Assessment',
  templateType: 'datacenter',
  description: 'Comprehensive security assessment for datacenters and colocation facilities with compliance focus',
  siteTypeRecommendation: 'datacenter',
  calculationMethod: 'tvi', // Using T×V×I for audit defensibility
  
  defaultThreats: [
    'unauthorized_physical_access_customer_data',
    'insider_threat_privileged_access',
    'data_theft_server_drive_removal',
    'environmental_failure_cooling_loss',
    'power_failure_service_disruption',
    'fire_data_loss',
    'social_engineering_fake_technician',
    'multi_tenant_breach',
    'sabotage_infrastructure',
    'tailgating_unauthorized_entry',
    'supply_chain_hardware_tampering',
    'physical_surveillance_espionage'
  ],
  
  defaultControls: [
    // Perimeter Security
    'perimeter_barrier_standoff_distance',
    'perimeter_intrusion_detection_datacenter',
    'vehicle_barriers_bollards',
    'perimeter_lighting_datacenter',
    'perimeter_cctv',
    
    // Access Control - Authentication
    'biometric_fingerprint',
    'biometric_palm_vein',
    'biometric_iris_facial',
    'multi_factor_authentication_3_factors',
    'man_trap_portal_system',
    'turnstile_security_gates',
    'electronic_badge_access_control',
    'pin_code_secondary_authentication',
    'visitor_escort_mandatory',
    'access_logging_audit_trail',
    'access_revocation_immediate',
    
    // Cabinet-Level Security
    'cabinet_electronic_locks',
    'cabinet_access_logging',
    'customer_controlled_locks',
    'hands_on_server_cameras',
    
    // Surveillance & Monitoring
    'cctv_perimeter_datacenter',
    'cctv_all_entry_exit_points',
    'cctv_server_floor_aisles',
    'cctv_hands_on_servers',
    'cctv_man_trap_portals',
    'noc_soc_24x7_monitoring',
    'video_analytics_behavior_detection',
    'facial_recognition_system',
    'video_retention_90_days',
    
    // Environmental Controls
    'fire_suppression_clean_agent',
    'fire_detection_vesda_aspirating',
    'environmental_monitoring_system',
    'water_leak_detection',
    'temperature_humidity_monitoring',
    'redundant_cooling_n_plus_1',
    'redundant_cooling_2n',
    'hot_cold_aisle_containment',
    
    // Power & Infrastructure
    'redundant_power_n_plus_1',
    'redundant_power_2n',
    'ups_battery_backup',
    'generator_backup_fuel_48_hours',
    'automatic_transfer_switch',
    'power_distribution_monitoring',
    
    // Logical Security Integration
    'network_segmentation_customer_isolation',
    'out_of_band_management',
    'remote_hands_procedures',
    'jump_box_access_controlled',
    'logical_access_integration',
    
    // Personnel Security
    'background_checks_level_2',
    'insider_threat_monitoring_program',
    'two_person_rule_sensitive_ops',
    'privileged_access_management',
    'clean_desk_clear_screen_policy',
    'security_awareness_training_annual',
    'nda_confidentiality_agreements',
    
    // Compliance & Audit
    'soc_2_type_ii_certified',
    'iso_27001_certified',
    'pci_dss_compliant',
    'hipaa_compliant_if_applicable',
    'compliance_audit_annual',
    'penetration_testing_physical',
    'vulnerability_assessment_regular',
    
    // Incident Response
    'incident_response_plan_documented',
    'incident_response_team_24x7',
    'incident_communication_procedures',
    'forensic_investigation_capability',
    
    // Physical Security Operations
    'security_guard_24x7',
    'security_patrol_schedule',
    'visitor_check_in_id_verification',
    'vendor_vetting_background_checks',
    'asset_tracking_system',
    'secure_disposal_drive_shredding',
    'key_control_system_electronic',
    
    // Business Continuity
    'disaster_recovery_site',
    'business_continuity_plan',
    'emergency_power_off_epo',
    'seismic_protection_if_applicable'
  ]
}
```

### 2.2 Threat Library (Datacenter-Specific)

**Datacenter-Focused Threats with ASIS GDL-RA Alignment:**

| Threat | Category | Typical Likelihood | Typical Impact | ASIS Code | Compliance Domain |
|--------|----------|-------------------|----------------|-----------|------------------|
| Unauthorized Physical Access - Customer Data | Physical Intrusion | 2 | 5 | PSC.1-2012-INT-006 | SOC 2, ISO 27001, PCI |
| Insider Threat - Privileged Access Abuse | Insider Threat | 3 | 5 | PSC.1-2012-INS-002 | SOC 2, ISO 27001 |
| Data Theft - Server/Drive Removal | Theft | 2 | 5 | PSC.1-2012-THF-012 | SOC 2, PCI-DSS |
| Environmental Failure - Cooling Loss | Environmental | 2 | 5 | PSC.1-2012-ENV-001 | Business Continuity |
| Power Failure - Service Disruption | Environmental | 2 | 5 | PSC.1-2012-ENV-002 | Uptime SLA |
| Fire - Data Loss | Fire | 1 | 5 | PSC.1-2012-FIR-001 | Business Continuity |
| Social Engineering - Fake Technician | Social Engineering | 2 | 4 | PSC.1-2012-SOC-001 | ISO 27001 |
| Multi-Tenant Breach - Cross-Contamination | Physical Intrusion | 2 | 4 | PSC.1-2012-INT-007 | SOC 2 Type II |
| Sabotage - Infrastructure Disruption | Sabotage | 1 | 5 | PSC.1-2012-SAB-003 | Business Continuity |
| Tailgating - Unauthorized Entry | Physical Intrusion | 3 | 3 | PSC.1-2012-INT-008 | SOC 2 |
| Supply Chain - Hardware Tampering | Supply Chain | 1 | 4 | PSC.1-2012-SUP-001 | ISO 27001 |
| Physical Surveillance - Espionage | Espionage | 1 | 4 | PSC.1-2012-ESP-002 | Customer Contracts |

---

## 3. Interview Protocol System

### 3.1 Interview Questionnaire Structure

**File Location:** `server/data/datacenter-interview-questionnaire.ts`

```typescript
export interface DatacenterInterviewQuestion {
  id: string;
  section: string;
  zoneApplicable?: string[]; // Perimeter, lobby, server floor, NOC, etc.
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist' | 'number';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: DatacenterInterviewQuestion[];
  riskIndicators?: string[]; // Keywords that elevate risk
  complianceRelevance?: string[]; // SOC 2, ISO 27001, PCI-DSS, etc.
  
  // Direct mapping to risk scenarios
  informsThreat?: string[]; // Threat IDs this question informs
  informsVulnerability?: boolean; // Does this assess vulnerability?
  informsImpact?: boolean; // Does this assess potential impact?
  suggestsControls?: string[]; // Control IDs this might reveal need for
}
```

### 3.2 Complete Interview Questions (10 Sections, 65+ Questions)

#### **SECTION 1: DATACENTER PROFILE & CLASSIFICATION (8 questions)**

```typescript
const section1_profile: DatacenterInterviewQuestion[] = [
  {
    id: 'profile_1',
    section: 'Datacenter Profile & Classification',
    questionText: 'What is the Uptime Institute Tier classification of this datacenter?',
    questionType: 'multiple_choice',
    options: [
      'Tier I - Basic (99.671% uptime)',
      'Tier II - Redundant Components (99.741% uptime)',
      'Tier III - Concurrently Maintainable (99.982% uptime)',
      'Tier IV - Fault Tolerant (99.995% uptime)',
      'Not formally classified',
    ],
    required: true,
    informsImpact: true,
    complianceRelevance: ['Business Continuity', 'Customer SLA'],
  },

  {
    id: 'profile_2',
    section: 'Datacenter Profile & Classification',
    questionText: 'What type of datacenter operation is this?',
    questionType: 'multiple_choice',
    options: [
      'Colocation (multi-tenant hosting)',
      'Enterprise (single company)',
      'Cloud/Hyperscale',
      'Managed services provider',
      'Government/Defense',
      'Hybrid',
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['multi_tenant_breach'],
  },

  {
    id: 'profile_3',
    section: 'Datacenter Profile & Classification',
    questionText: 'What compliance certifications does the datacenter hold? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'SOC 2 Type II',
      'ISO 27001',
      'PCI-DSS',
      'HIPAA',
      'FedRAMP',
      'SSAE 18',
      'None',
      'In process',
    ],
    required: true,
    informsVulnerability: true,
    complianceRelevance: ['SOC 2', 'ISO 27001', 'PCI-DSS', 'HIPAA'],
    riskIndicators: ['none', 'in process'],
  },

  {
    id: 'profile_4',
    section: 'Datacenter Profile & Classification',
    questionText: 'Approximately how many racks/cabinets does the facility have?',
    questionType: 'multiple_choice',
    options: [
      'Under 50 racks',
      '50-200 racks',
      '201-500 racks',
      '501-1000 racks',
      'Over 1000 racks',
    ],
    required: true,
    informsImpact: true,
    informsVulnerability: true, // More racks = more complexity
  },

  {
    id: 'profile_5',
    section: 'Datacenter Profile & Classification',
    questionText: 'What is your contractual uptime SLA commitment?',
    questionType: 'multiple_choice',
    options: [
      '99.999% (Five Nines - 5.26 min/year)',
      '99.99% (Four Nines - 52.6 min/year)',
      '99.95% (4.38 hours/year)',
      '99.9% (8.76 hours/year)',
      'Below 99.9%',
      'No formal SLA',
    ],
    required: true,
    informsImpact: true,
    riskIndicators: ['below 99.9%', 'no formal'],
  },

  {
    id: 'profile_6',
    section: 'Datacenter Profile & Classification',
    questionText: 'What is the approximate square footage of the datacenter?',
    questionType: 'multiple_choice',
    options: [
      'Under 5,000 sq ft',
      '5,000 - 20,000 sq ft',
      '20,000 - 50,000 sq ft',
      '50,000 - 100,000 sq ft',
      'Over 100,000 sq ft',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'profile_7',
    section: 'Datacenter Profile & Classification',
    questionText: 'How many customers/tenants do you serve? (If colocation/multi-tenant)',
    questionType: 'multiple_choice',
    options: [
      'Not applicable - enterprise datacenter',
      '1-10 customers',
      '11-50 customers',
      '51-200 customers',
      'Over 200 customers',
    ],
    required: true,
    informsThreat: ['multi_tenant_breach'],
    informsVulnerability: true, // More customers = more complexity
  },

  {
    id: 'profile_8',
    section: 'Datacenter Profile & Classification',
    questionText: 'Have you experienced any significant security or availability incidents in the past 2 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['unauthorized_physical_access_customer_data', 'power_failure_service_disruption'],
    followUpQuestions: [
      {
        id: 'profile_8a',
        section: 'Datacenter Profile & Classification',
        questionText: 'What type of incidents? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Physical security breach',
          'Unauthorized access attempt',
          'Power outage',
          'Cooling failure',
          'Fire/suppression activation',
          'Data breach',
          'Insider incident',
        ],
        required: true,
      },
    ],
  },
];
```

#### **SECTION 2: PHYSICAL PERIMETER SECURITY (7 questions)**

```typescript
const section2_perimeter: DatacenterInterviewQuestion[] = [
  {
    id: 'perimeter_1',
    section: 'Physical Perimeter Security',
    questionText: 'What type of perimeter barrier protects the facility?',
    questionType: 'multiple_choice',
    options: [
      'High-security fencing (8+ feet) with anti-climb features',
      'Standard fencing',
      'Building walls only (urban setting)',
      'Natural barriers',
      'Minimal perimeter protection',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_barrier_standoff_distance'],
    riskIndicators: ['minimal perimeter'],
    complianceRelevance: ['ISO 27001'],
  },

  {
    id: 'perimeter_2',
    section: 'Physical Perimeter Security',
    questionText: 'What is the standoff distance from the building to public areas?',
    questionType: 'multiple_choice',
    options: [
      '100+ feet (excellent)',
      '50-100 feet (good)',
      '25-50 feet (adequate)',
      'Under 25 feet (minimal)',
      'Building directly on street (urban)',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['under 25', 'directly on street'],
  },

  {
    id: 'perimeter_3',
    section: 'Physical Perimeter Security',
    questionText: 'Do you have vehicle barriers (bollards, wedge barriers) to prevent vehicle attacks?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['vehicle_barriers_bollards'],
    complianceRelevance: ['Physical Security'],
  },

  {
    id: 'perimeter_4',
    section: 'Physical Perimeter Security',
    questionText: 'Is perimeter intrusion detection installed (fence sensors, ground sensors, infrared)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_intrusion_detection_datacenter'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'perimeter_5',
    section: 'Physical Perimeter Security',
    questionText: 'Rate the adequacy of perimeter lighting',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Poor', 'Fair', 'Adequate', 'Good', 'Excellent'] 
    },
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_lighting_datacenter'],
  },

  {
    id: 'perimeter_6',
    section: 'Physical Perimeter Security',
    questionText: 'Do you have CCTV coverage of the entire perimeter?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_perimeter_datacenter'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'perimeter_7',
    section: 'Physical Perimeter Security',
    questionText: 'Do you have 24/7 security personnel monitoring the facility?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['security_guard_24x7', 'noc_soc_24x7_monitoring'],
    complianceRelevance: ['SOC 2'],
  },
];
```

#### **SECTION 3: ACCESS CONTROL & AUTHENTICATION (12 questions)**

```typescript
const section3_access: DatacenterInterviewQuestion[] = [
  {
    id: 'access_1',
    section: 'Access Control & Authentication',
    questionText: 'How many factors of authentication are required for employee access to the server floor?',
    questionType: 'multiple_choice',
    options: [
      'Three factors (badge + biometric + PIN)',
      'Two factors (badge + biometric OR badge + PIN)',
      'One factor (badge only)',
      'Key/no electronic access control',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['multi_factor_authentication_3_factors'],
    riskIndicators: ['one factor', 'key/no electronic'],
    complianceRelevance: ['SOC 2', 'ISO 27001', 'PCI-DSS'],
  },

  {
    id: 'access_2',
    section: 'Access Control & Authentication',
    questionText: 'What biometric systems are in use? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Fingerprint',
      'Palm vein',
      'Iris scan',
      'Facial recognition',
      'None - no biometrics',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['biometric_fingerprint', 'biometric_palm_vein', 'biometric_iris_facial'],
    riskIndicators: ['none - no biometrics'],
    complianceRelevance: ['SOC 2', 'PCI-DSS'],
  },

  {
    id: 'access_3',
    section: 'Access Control & Authentication',
    questionText: 'Do you use man-trap or portal systems to prevent tailgating?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['tailgating_unauthorized_entry'],
    suggestsControls: ['man_trap_portal_system'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
    followUpQuestions: [
      {
        id: 'access_3a',
        section: 'Access Control & Authentication',
        questionText: 'Are man-traps/portals installed at all entry points to the server floor?',
        questionType: 'yes_no',
        required: true,
        riskIndicators: ['no'],
      },
    ],
  },

  {
    id: 'access_4',
    section: 'Access Control & Authentication',
    questionText: 'Do cabinets/racks have electronic locks with individual access control?',
    questionType: 'multiple_choice',
    options: [
      'Yes - all cabinets have electronic locks with audit trail',
      'Yes - high-security cabinets only',
      'Physical locks only (key control)',
      'No cabinet-level locks',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['data_theft_server_drive_removal', 'multi_tenant_breach'],
    suggestsControls: ['cabinet_electronic_locks', 'cabinet_access_logging'],
    riskIndicators: ['physical locks only', 'no cabinet'],
    complianceRelevance: ['SOC 2 Type II', 'PCI-DSS'],
  },

  {
    id: 'access_5',
    section: 'Access Control & Authentication',
    questionText: 'Are all physical access events logged and retained?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['access_logging_audit_trail'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
    followUpQuestions: [
      {
        id: 'access_5a',
        section: 'Access Control & Authentication',
        questionText: 'What is the retention period for access logs?',
        questionType: 'multiple_choice',
        options: [
          '1+ year',
          '6-12 months',
          '3-6 months',
          'Under 3 months',
        ],
        required: true,
        riskIndicators: ['under 3 months'],
        complianceRelevance: ['SOC 2'],
      },
    ],
  },

  {
    id: 'access_6',
    section: 'Access Control & Authentication',
    questionText: 'How quickly are access permissions revoked when an employee leaves?',
    questionType: 'multiple_choice',
    options: [
      'Immediately (same day)',
      'Within 24 hours',
      'Within 1 week',
      'No formal process',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    suggestsControls: ['access_revocation_immediate'],
    riskIndicators: ['within 1 week', 'no formal'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'access_7',
    section: 'Access Control & Authentication',
    questionText: 'Are visitors required to be escorted at all times in secure areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['social_engineering_fake_technician'],
    suggestsControls: ['visitor_escort_mandatory'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'access_8',
    section: 'Access Control & Authentication',
    questionText: 'What is your visitor check-in procedure?',
    questionType: 'multiple_choice',
    options: [
      'Government-issued ID verification + pre-authorization + escort',
      'ID verification + visitor badge + escort',
      'Sign-in sheet + escort',
      'Informal check-in',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['visitor_check_in_id_verification'],
    riskIndicators: ['informal check-in'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'access_9',
    section: 'Access Control & Authentication',
    questionText: 'Do customers have the ability to install their own locks on cabinets?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['customer_controlled_locks'],
    complianceRelevance: ['Customer Contracts'],
  },

  {
    id: 'access_10',
    section: 'Access Control & Authentication',
    questionText: 'Do you enforce the principle of least privilege for physical access?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'access_11',
    section: 'Access Control & Authentication',
    questionText: 'How often do you conduct access permission audits?',
    questionType: 'multiple_choice',
    options: [
      'Quarterly',
      'Semi-annually',
      'Annually',
      'Rarely/Never',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely/never'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'access_12',
    section: 'Access Control & Authentication',
    questionText: 'Rate the overall effectiveness of your access control system',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Poor', 'Fair', 'Adequate', 'Good', 'Excellent'] 
    },
    required: true,
    informsVulnerability: true,
  },
];
```

#### **SECTION 4: SURVEILLANCE & MONITORING (8 questions)**

```typescript
const section4_surveillance: DatacenterInterviewQuestion[] = [
  {
    id: 'surveillance_1',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you have CCTV cameras covering all critical areas? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'All entry/exit points',
      'All server floor aisles',
      'Man-traps/portals',
      'Loading dock/receiving',
      'Perimeter',
      'Parking areas',
      'Customer cabinets (hands-on-server cameras)',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: [
      'cctv_all_entry_exit_points',
      'cctv_server_floor_aisles',
      'cctv_man_trap_portals',
      'hands_on_server_cameras',
    ],
    complianceRelevance: ['SOC 2', 'PCI-DSS'],
  },

  {
    id: 'surveillance_2',
    section: 'Surveillance & Monitoring',
    questionText: 'What is your video retention period?',
    questionType: 'multiple_choice',
    options: [
      '90+ days',
      '60-90 days',
      '30-60 days',
      '15-30 days',
      'Under 15 days',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_retention_90_days'],
    riskIndicators: ['under 15 days'],
    complianceRelevance: ['SOC 2', 'PCI-DSS'],
  },

  {
    id: 'surveillance_3',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you have a 24/7 Security Operations Center (SOC) or Network Operations Center (NOC) monitoring video feeds?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['noc_soc_24x7_monitoring'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'surveillance_4',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use video analytics or AI-based behavior detection?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_analytics_behavior_detection'],
  },

  {
    id: 'surveillance_5',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use facial recognition for identity verification?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['social_engineering_fake_technician'],
    suggestsControls: ['facial_recognition_system'],
  },

  {
    id: 'surveillance_6',
    section: 'Surveillance & Monitoring',
    questionText: 'Are cameras positioned to capture "hands-on-server" activity at customer cabinets?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['data_theft_server_drive_removal', 'multi_tenant_breach'],
    suggestsControls: ['hands_on_server_cameras'],
    complianceRelevance: ['SOC 2 Type II'],
  },

  {
    id: 'surveillance_7',
    section: 'Surveillance & Monitoring',
    questionText: 'Can video footage be easily retrieved for incident investigation?',
    questionType: 'multiple_choice',
    options: [
      'Yes - searchable by time, location, person',
      'Yes - manual review required',
      'Difficult - limited search capability',
      'Very difficult - poor indexing',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['difficult', 'very difficult'],
  },

  {
    id: 'surveillance_8',
    section: 'Surveillance & Monitoring',
    questionText: 'Rate the overall quality and coverage of your surveillance system',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Poor', 'Fair', 'Adequate', 'Good', 'Excellent'] 
    },
    required: true,
    informsVulnerability: true,
  },
];
```

#### **SECTION 5: ENVIRONMENTAL & INFRASTRUCTURE SECURITY (10 questions)**

```typescript
const section5_environmental: DatacenterInterviewQuestion[] = [
  {
    id: 'environmental_1',
    section: 'Environmental & Infrastructure Security',
    questionText: 'What type of fire suppression system is installed in the server areas?',
    questionType: 'multiple_choice',
    options: [
      'Clean agent (FM-200, Novec 1230, Inergen)',
      'Water-based sprinkler (NOT recommended for datacenters)',
      'CO2 suppression',
      'Pre-action sprinkler',
      'No suppression system',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['fire_data_loss'],
    suggestsControls: ['fire_suppression_clean_agent'],
    riskIndicators: ['water-based', 'no suppression'],
    complianceRelevance: ['Fire Safety', 'Business Continuity'],
  },

  {
    id: 'environmental_2',
    section: 'Environmental & Infrastructure Security',
    questionText: 'What type of fire detection system do you have?',
    questionType: 'multiple_choice',
    options: [
      'VESDA (Very Early Smoke Detection Apparatus) or aspirating',
      'Smoke detectors (standard)',
      'Heat detectors',
      'Multiple systems',
      'Minimal detection',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['fire_detection_vesda_aspirating'],
    riskIndicators: ['minimal detection'],
  },

  {
    id: 'environmental_3',
    section: 'Environmental & Infrastructure Security',
    questionText: 'What is your cooling redundancy level?',
    questionType: 'multiple_choice',
    options: [
      '2N (fully redundant)',
      'N+2 (two redundant units)',
      'N+1 (one redundant unit)',
      'N (no redundancy)',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['environmental_failure_cooling_loss'],
    suggestsControls: ['redundant_cooling_n_plus_1', 'redundant_cooling_2n'],
    riskIndicators: ['n (no redundancy)'],
    complianceRelevance: ['Uptime SLA', 'Tier Classification'],
  },

  {
    id: 'environmental_4',
    section: 'Environmental & Infrastructure Security',
    questionText: 'What is your power redundancy level?',
    questionType: 'multiple_choice',
    options: [
      '2N (fully redundant power paths)',
      '2(N+1) (two redundant paths with N+1 components)',
      'N+1 (one redundant component)',
      'N (no redundancy)',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['power_failure_service_disruption'],
    suggestsControls: ['redundant_power_n_plus_1', 'redundant_power_2n'],
    riskIndicators: ['n (no redundancy)'],
    complianceRelevance: ['Uptime SLA', 'Tier Classification'],
  },

  {
    id: 'environmental_5',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you have backup generator(s)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['power_failure_service_disruption'],
    suggestsControls: ['generator_backup_fuel_48_hours'],
    complianceRelevance: ['Business Continuity'],
    followUpQuestions: [
      {
        id: 'environmental_5a',
        section: 'Environmental & Infrastructure Security',
        questionText: 'What is the fuel capacity (runtime at full load)?',
        questionType: 'multiple_choice',
        options: [
          '48+ hours',
          '24-48 hours',
          '12-24 hours',
          'Under 12 hours',
        ],
        required: true,
        riskIndicators: ['under 12 hours'],
      },
    ],
  },

  {
    id: 'environmental_6',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you have UPS (Uninterruptible Power Supply) battery backup?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['ups_battery_backup'],
    complianceRelevance: ['Uptime SLA'],
  },

  {
    id: 'environmental_7',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you have water leak detection systems under raised floors?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['water_leak_detection'],
  },

  {
    id: 'environmental_8',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you use hot/cold aisle containment?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['hot_cold_aisle_containment'],
    complianceRelevance: ['Energy Efficiency'],
  },

  {
    id: 'environmental_9',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Do you have continuous environmental monitoring (temperature, humidity, power)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['environmental_failure_cooling_loss'],
    suggestsControls: ['environmental_monitoring_system', 'temperature_humidity_monitoring'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'environmental_10',
    section: 'Environmental & Infrastructure Security',
    questionText: 'Have you tested your backup power and cooling systems in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    riskIndicators: ['no'],
    complianceRelevance: ['Business Continuity'],
  },
];
```

#### **SECTION 6: LOGICAL SECURITY INTEGRATION (7 questions)**

```typescript
const section6_logical: DatacenterInterviewQuestion[] = [
  {
    id: 'logical_1',
    section: 'Logical Security Integration',
    questionText: 'Do you implement network segmentation to isolate customer environments?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['multi_tenant_breach'],
    suggestsControls: ['network_segmentation_customer_isolation'],
    complianceRelevance: ['SOC 2 Type II', 'PCI-DSS'],
  },

  {
    id: 'logical_2',
    section: 'Logical Security Integration',
    questionText: 'Do you have out-of-band management for critical infrastructure?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['out_of_band_management'],
    complianceRelevance: ['ISO 27001'],
  },

  {
    id: 'logical_3',
    section: 'Logical Security Integration',
    questionText: 'Do you use jump boxes or bastion hosts for administrative access?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    suggestsControls: ['jump_box_access_controlled'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'logical_4',
    section: 'Logical Security Integration',
    questionText: 'Are remote hands procedures documented and controlled?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['remote_hands_procedures'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'logical_5',
    section: 'Logical Security Integration',
    questionText: 'Is physical access integrated with logical access control systems?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['logical_access_integration'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'logical_6',
    section: 'Logical Security Integration',
    questionText: 'Do you perform regular vulnerability assessments on physical security systems?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['supply_chain_hardware_tampering'],
    suggestsControls: ['vulnerability_assessment_regular'],
    complianceRelevance: ['ISO 27001'],
  },

  {
    id: 'logical_7',
    section: 'Logical Security Integration',
    questionText: 'Have you conducted physical penetration testing in the past 2 years?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['penetration_testing_physical'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },
];
```

#### **SECTION 7: PERSONNEL SECURITY (7 questions)**

```typescript
const section7_personnel: DatacenterInterviewQuestion[] = [
  {
    id: 'personnel_1',
    section: 'Personnel Security',
    questionText: 'What level of background checks do you conduct on datacenter staff?',
    questionType: 'multiple_choice',
    options: [
      'Level 2 (comprehensive - criminal, credit, employment, education)',
      'Level 1 (criminal background only)',
      'Basic checks',
      'No formal background checks',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    suggestsControls: ['background_checks_level_2'],
    riskIndicators: ['no formal'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'personnel_2',
    section: 'Personnel Security',
    questionText: 'Do you have an insider threat monitoring program?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_threat_privileged_access'],
    suggestsControls: ['insider_threat_monitoring_program'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'personnel_3',
    section: 'Personnel Security',
    questionText: 'Do you enforce a two-person rule for sensitive operations (equipment moves, cabling, etc.)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['data_theft_server_drive_removal', 'sabotage_infrastructure'],
    suggestsControls: ['two_person_rule_sensitive_ops'],
    complianceRelevance: ['SOC 2 Type II'],
  },

  {
    id: 'personnel_4',
    section: 'Personnel Security',
    questionText: 'Do all employees receive annual security awareness training?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['social_engineering_fake_technician'],
    suggestsControls: ['security_awareness_training_annual'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'personnel_5',
    section: 'Personnel Security',
    questionText: 'Do you enforce clean desk and clear screen policies?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['clean_desk_clear_screen_policy'],
    complianceRelevance: ['ISO 27001'],
  },

  {
    id: 'personnel_6',
    section: 'Personnel Security',
    questionText: 'Are all employees required to sign NDAs and confidentiality agreements?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['nda_confidentiality_agreements'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'personnel_7',
    section: 'Personnel Security',
    questionText: 'Do you conduct vendor background checks and vetting?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['supply_chain_hardware_tampering', 'social_engineering_fake_technician'],
    suggestsControls: ['vendor_vetting_background_checks'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },
];
```

#### **SECTION 8: MULTI-TENANT & CUSTOMER SECURITY (5 questions)**

```typescript
const section8_multiTenant: DatacenterInterviewQuestion[] = [
  {
    id: 'multi_tenant_1',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'If multi-tenant, how do you ensure physical separation between customer environments?',
    questionType: 'multiple_choice',
    options: [
      'Not applicable - single tenant',
      'Individual locked cabinets with unique access',
      'Caged areas per customer',
      'Separate rooms/suites',
      'Logical separation only (same open floor)',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['multi_tenant_breach'],
    riskIndicators: ['logical separation only'],
    complianceRelevance: ['SOC 2 Type II'],
  },

  {
    id: 'multi_tenant_2',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'Can customers install their own physical security (locks, cameras)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['customer_controlled_locks'],
    complianceRelevance: ['Customer Contracts'],
  },

  {
    id: 'multi_tenant_3',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'Do you provide cabinet-level access logs to customers upon request?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cabinet_access_logging'],
    complianceRelevance: ['SOC 2 Type II'],
  },

  {
    id: 'multi_tenant_4',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'How do you handle customer equipment decommissioning?',
    questionType: 'multiple_choice',
    options: [
      'Witnessed destruction with certificate (drive shredding)',
      'Secure disposal per customer specifications',
      'Customer removes own equipment',
      'Standard disposal procedures',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['data_theft_server_drive_removal'],
    suggestsControls: ['secure_disposal_drive_shredding'],
    riskIndicators: ['standard disposal'],
    complianceRelevance: ['PCI-DSS', 'HIPAA'],
  },

  {
    id: 'multi_tenant_5',
    section: 'Multi-Tenant & Customer Security',
    questionText: 'Have you had any customer-reported security incidents in the past 2 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['multi_tenant_breach', 'unauthorized_physical_access_customer_data'],
  },
];
```

#### **SECTION 9: COMPLIANCE & AUDIT HISTORY (6 questions)**

```typescript
const section9_compliance: DatacenterInterviewQuestion[] = [
  {
    id: 'compliance_1',
    section: 'Compliance & Audit History',
    questionText: 'When was your last SOC 2 audit?',
    questionType: 'multiple_choice',
    options: [
      'Within past 6 months',
      '6-12 months ago',
      'Over 1 year ago',
      'Never / Not applicable',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['over 1 year', 'never'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'compliance_2',
    section: 'Compliance & Audit History',
    questionText: 'Were there any findings related to physical security in your last audit?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    complianceRelevance: ['SOC 2', 'ISO 27001'],
    followUpQuestions: [
      {
        id: 'compliance_2a',
        section: 'Compliance & Audit History',
        questionText: 'Have all findings been remediated?',
        questionType: 'yes_no',
        required: true,
        riskIndicators: ['no'],
      },
    ],
  },

  {
    id: 'compliance_3',
    section: 'Compliance & Audit History',
    questionText: 'Do you conduct annual compliance audits?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['compliance_audit_annual'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'compliance_4',
    section: 'Compliance & Audit History',
    questionText: 'Do you maintain a compliance program with documented policies?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'compliance_5',
    section: 'Compliance & Audit History',
    questionText: 'Do you provide customers with audit reports (SOC 2, ISO certs)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    complianceRelevance: ['Customer Contracts'],
  },

  {
    id: 'compliance_6',
    section: 'Compliance & Audit History',
    questionText: 'Have you had any compliance violations or regulatory penalties in the past 3 years?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsImpact: true,
    complianceRelevance: ['All Compliance'],
  },
];
```

#### **SECTION 10: BUSINESS CONTINUITY & EMERGENCY RESPONSE (6 questions)**

```typescript
const section10_businessContinuity: DatacenterInterviewQuestion[] = [
  {
    id: 'bc_1',
    section: 'Business Continuity & Emergency Response',
    questionText: 'Do you have a documented incident response plan?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['incident_response_plan_documented'],
    complianceRelevance: ['SOC 2', 'ISO 27001'],
  },

  {
    id: 'bc_2',
    section: 'Business Continuity & Emergency Response',
    questionText: 'Do you have a 24/7 incident response team?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['incident_response_team_24x7'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'bc_3',
    section: 'Business Continuity & Emergency Response',
    questionText: 'Do you have a disaster recovery site?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsImpact: true,
    suggestsControls: ['disaster_recovery_site'],
    complianceRelevance: ['Business Continuity'],
  },

  {
    id: 'bc_4',
    section: 'Business Continuity & Emergency Response',
    questionText: 'When was your last business continuity plan test?',
    questionType: 'multiple_choice',
    options: [
      'Within past 6 months',
      '6-12 months ago',
      'Over 1 year ago',
      'Never tested',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['business_continuity_plan'],
    riskIndicators: ['over 1 year', 'never tested'],
    complianceRelevance: ['SOC 2'],
  },

  {
    id: 'bc_5',
    section: 'Business Continuity & Emergency Response',
    questionText: 'Do you have Emergency Power Off (EPO) systems?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['emergency_power_off_epo'],
  },

  {
    id: 'bc_6',
    section: 'Business Continuity & Emergency Response',
    questionText: 'If in a seismic zone, do you have earthquake protection measures?',
    questionType: 'multiple_choice',
    options: [
      'Not in seismic zone',
      'Yes - comprehensive seismic protection',
      'Basic seismic protection',
      'No seismic protection',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['seismic_protection_if_applicable'],
    riskIndicators: ['no seismic protection'],
  },
];
```

---

## 4. Risk Mapping & Calculation Integration

### 4.1 Interview → T×V×I Calculation Flow

```typescript
// server/services/datacenter-interview-risk-mapper.ts

export interface DatacenterRiskMapping {
  assessmentId: number;
  interviewResponses: Record<string, any>;
  threatId: string;
}

export interface CalculatedRiskInputs {
  threatLikelihood: number; // 1-5
  vulnerability: number; // 1-5
  impact: number; // 1-5
  inherentRisk: number; // T × V × I
  suggestedControls: string[]; // Control IDs
  complianceGaps: string[]; // SOC 2, ISO, PCI, etc.
}
```

### 4.2 Vulnerability Calculation Algorithm

```typescript
export function calculateVulnerabilityFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let vulnerabilityScore = 3; // Baseline moderate
  let riskFactorCount = 0;
  
  // PERIMETER SECURITY ANALYSIS
  if (responses.perimeter_1?.includes('minimal')) riskFactorCount += 2;
  if (responses.perimeter_2?.includes('under 25') || 
      responses.perimeter_2?.includes('directly on street')) {
    riskFactorCount += 1;
  }
  if (responses.perimeter_3 === 'no') riskFactorCount += 1; // No bollards
  if (responses.perimeter_4 === 'no') riskFactorCount += 2; // No intrusion detection
  if (responses.perimeter_5 <= 2) riskFactorCount += 1; // Poor lighting
  if (responses.perimeter_6 === 'no') riskFactorCount += 1; // No CCTV
  if (responses.perimeter_7 === 'no') riskFactorCount += 2; // No 24/7 security
  
  // ACCESS CONTROL ANALYSIS (CRITICAL for datacenters)
  if (responses.access_1?.includes('one factor') || 
      responses.access_1?.includes('key/no electronic')) {
    riskFactorCount += 3; // Critical vulnerability
  }
  if (responses.access_2?.includes('none - no biometrics')) {
    riskFactorCount += 2;
  }
  if (responses.access_3 === 'no') riskFactorCount += 2; // No man-trap
  if (responses.access_4?.includes('no cabinet') || 
      responses.access_4?.includes('physical locks only')) {
    riskFactorCount += 2;
  }
  if (responses.access_5 === 'no') riskFactorCount += 2; // No access logging
  if (responses.access_6?.includes('no formal') || 
      responses.access_6?.includes('within 1 week')) {
    riskFactorCount += 1;
  }
  if (responses.access_7 === 'no') riskFactorCount += 1; // No escort requirement
  if (responses.access_8?.includes('informal')) riskFactorCount += 1;
  if (responses.access_11?.includes('rarely/never')) riskFactorCount += 1;
  if (responses.access_12 <= 2) riskFactorCount += 1;
  
  // SURVEILLANCE ANALYSIS
  if (!responses.surveillance_1?.includes('All entry/exit points')) riskFactorCount += 1;
  if (!responses.surveillance_1?.includes('All server floor aisles')) riskFactorCount += 1;
  if (responses.surveillance_2?.includes('under 15 days')) riskFactorCount += 1;
  if (responses.surveillance_3 === 'no') riskFactorCount += 2; // No 24/7 monitoring
  if (responses.surveillance_6 === 'no') riskFactorCount += 1; // No hands-on-server cameras
  
  // ENVIRONMENTAL CONTROLS (for relevant threats)
  if (threatId === 'environmental_failure_cooling_loss' || 
      threatId === 'power_failure_service_disruption') {
    if (responses.environmental_3?.includes('n (no redundancy)')) riskFactorCount += 3;
    if (responses.environmental_4?.includes('n (no redundancy)')) riskFactorCount += 3;
    if (responses.environmental_5 === 'no') riskFactorCount += 2; // No generator
    if (responses.environmental_6 === 'no') riskFactorCount += 2; // No UPS
    if (responses.environmental_9 === 'no') riskFactorCount += 1; // No monitoring
    if (responses.environmental_10 === 'no') riskFactorCount += 1; // No testing
  }
  
  if (threatId === 'fire_data_loss') {
    if (responses.environmental_1?.includes('water-based') || 
        responses.environmental_1?.includes('no suppression')) {
      riskFactorCount += 3;
    }
    if (responses.environmental_2?.includes('minimal')) riskFactorCount += 1;
  }
  
  // LOGICAL SECURITY INTEGRATION
  if (responses.logical_1 === 'no') riskFactorCount += 2; // No network segmentation
  if (responses.logical_5 === 'no') riskFactorCount += 1; // No physical-logical integration
  if (responses.logical_7 === 'no') riskFactorCount += 1; // No pen testing
  
  // PERSONNEL SECURITY
  if (responses.personnel_1?.includes('no formal')) riskFactorCount += 2;
  if (responses.personnel_2 === 'no') riskFactorCount += 1; // No insider threat program
  if (responses.personnel_3 === 'no') riskFactorCount += 1; // No two-person rule
  if (responses.personnel_4 === 'no') riskFactorCount += 1; // No training
  
  // MULTI-TENANT SECURITY (if applicable)
  if (responses.profile_2?.includes('colocation') || 
      responses.profile_2?.includes('multi-tenant')) {
    if (responses.multi_tenant_1?.includes('logical separation only')) {
      riskFactorCount += 2;
    }
    if (responses.multi_tenant_3 === 'no') riskFactorCount += 1;
  }
  
  // COMPLIANCE GAPS
  if (responses.compliance_1?.includes('over 1 year') || 
      responses.compliance_1?.includes('never')) {
    riskFactorCount += 1;
  }
  if (responses.compliance_2 === 'yes' && responses.compliance_2a === 'no') {
    riskFactorCount += 2; // Unresolved audit findings
  }
  
  // Calculate final vulnerability (each 2 risk factors = +1 point)
  vulnerabilityScore = Math.min(5, vulnerabilityScore + Math.floor(riskFactorCount / 2));
  
  return vulnerabilityScore;
}
```

### 4.3 Threat Likelihood Calculation

```typescript
export function calculateThreatLikelihoodFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let likelihood = 2; // Baseline low-moderate for datacenters
  
  switch (threatId) {
    case 'unauthorized_physical_access_customer_data':
      if (responses.profile_8 === 'yes' && 
          responses.profile_8a?.includes('Physical security breach')) {
        likelihood = 4; // History of breaches
      } else {
        likelihood = 2;
      }
      // Increase if poor access control
      if (responses.access_1?.includes('one factor')) likelihood += 1;
      if (responses.access_3 === 'no') likelihood += 1; // No man-trap
      break;
      
    case 'insider_threat_privileged_access':
      likelihood = 3; // Always present threat in datacenters
      if (responses.personnel_1?.includes('no formal')) likelihood += 1;
      if (responses.personnel_2 === 'no') likelihood += 1;
      break;
      
    case 'environmental_failure_cooling_loss':
      if (responses.environmental_3?.includes('n (no redundancy)')) {
        likelihood = 4;
      } else if (responses.environmental_3?.includes('n+1')) {
        likelihood = 2;
      } else {
        likelihood = 1; // 2N redundancy
      }
      if (responses.profile_8a?.includes('Cooling failure')) likelihood = 4;
      break;
      
    case 'power_failure_service_disruption':
      if (responses.environmental_4?.includes('n (no redundancy)')) {
        likelihood = 4;
      } else if (responses.environmental_4?.includes('n+1')) {
        likelihood = 2;
      } else {
        likelihood = 1; // 2N redundancy
      }
      if (responses.profile_8a?.includes('Power outage')) likelihood = 4;
      break;
      
    case 'fire_data_loss':
      likelihood = 1; // Rare but catastrophic
      if (responses.environmental_1?.includes('no suppression')) likelihood = 2;
      if (responses.profile_8a?.includes('Fire')) likelihood = 3;
      break;
      
    case 'multi_tenant_breach':
      if (responses.profile_2?.includes('colocation') || 
          responses.profile_2?.includes('multi-tenant')) {
        likelihood = 3;
        if (responses.multi_tenant_5 === 'yes') likelihood = 4; // Customer reports
      } else {
        likelihood = 1; // Not applicable for single-tenant
      }
      break;
      
    case 'social_engineering_fake_technician':
      likelihood = 2;
      if (responses.access_7 === 'no') likelihood += 1; // No escort
      if (responses.personnel_4 === 'no') likelihood += 1; // No training
      break;
      
    case 'tailgating_unauthorized_entry':
      likelihood = 3;
      if (responses.access_3 === 'no') likelihood = 4; // No man-trap
      break;
      
    default:
      likelihood = 2;
  }
  
  return Math.min(5, Math.max(1, likelihood));
}
```

### 4.4 Impact Calculation

```typescript
export function calculateImpactFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let impact = 3; // Baseline
  
  // Tier classification affects impact
  const tier = responses.profile_1;
  if (tier?.includes('Tier IV')) impact = 5; // Highest uptime commitment
  else if (tier?.includes('Tier III')) impact = 4;
  else if (tier?.includes('Tier II')) impact = 3;
  else impact = 2;
  
  // SLA commitment affects impact
  const sla = responses.profile_5;
  if (sla?.includes('99.999%') || sla?.includes('99.99%')) {
    impact = Math.max(impact, 5);
  }
  
  // Rack count (scale affects impact)
  if (responses.profile_4?.includes('Over 1000')) impact += 1;
  else if (responses.profile_4?.includes('501-1000')) impact += 1;
  
  // Multi-tenant increases impact
  if (responses.profile_7?.includes('Over 200') || 
      responses.profile_7?.includes('51-200')) {
    impact += 1;
  }
  
  // Compliance requirements increase impact
  const compliance = responses.profile_3;
  if (compliance?.includes('SOC 2') || 
      compliance?.includes('ISO 27001') ||
      compliance?.includes('PCI-DSS')) {
    impact = Math.max(impact, 4);
  }
  if (compliance?.includes('HIPAA') || compliance?.includes('FedRAMP')) {
    impact = 5; // Regulatory penalties
  }
  
  // Threat-specific adjustments
  if (threatId === 'unauthorized_physical_access_customer_data' ||
      threatId === 'data_theft_server_drive_removal') {
    impact = Math.max(impact, 4); // Data breach is always high impact
  }
  
  if (threatId === 'power_failure_service_disruption' ||
      threatId === 'environmental_failure_cooling_loss') {
    // Impact tied directly to uptime SLA
    impact = Math.max(impact, 4);
  }
  
  if (threatId === 'fire_data_loss') {
    impact = 5; // Catastrophic
  }
  
  return Math.min(5, impact);
}
```

---

## 5-10. [Remaining Sections]

The remaining sections (Control Selection & Recommendations, Implementation Workflow, API Integration, UI Components, PDF Report Template, and Implementation Roadmap) follow the same pattern as previous frameworks, adapted for datacenter-specific concerns.

**Key Datacenter-Specific Additions:**
- **SOC 2 Control Mapping** - Align physical security to Trust Services Criteria
- **ISO 27001 Compliance Matrix** - Map controls to Annex A domains
- **Tier Classification Analysis** - Evaluate if facility meets stated tier
- **Uptime Risk Calculator** - Estimate financial impact of downtime
- **Multi-Tenant Isolation Assessment** - Cross-contamination risk scoring
- **Compliance Gap Report** - Identify remediation priorities
- **Environmental Monitoring Dashboard** - Real-time power/cooling status
- **Privileged Access Audit Trail** - Track all administrator activities

---

**END OF DATACENTER FRAMEWORK DOCUMENT**
