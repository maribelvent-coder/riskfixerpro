# RiskFixer: Manufacturing Facility Security Assessment Framework
## Comprehensive Specification for Industrial Production Security

**Version:** 1.0  
**Integration Target:** RiskFixer Master Framework v2.1  
**Focus:** Manufacturing Plant, Production Facility, and Industrial Site Assessments  
**Last Updated:** November 20, 2025

---

## Table of Contents

1. [Manufacturing Assessment Overview](#1-manufacturing-assessment-overview)
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

## 1. Manufacturing Assessment Overview

### 1.1 What Makes Manufacturing Assessments Unique

**Standard Physical Security Assessment:**
- Generic facility protection
- Static security posture
- Office-centric thinking

**Manufacturing Facility Security Assessment:**
- **Production continuity** - Security failures = production downtime = revenue loss
- **Trade secret protection** - Intellectual property in processes, formulas, and designs
- **Raw material theft** - High-value inputs (metals, chemicals, electronics components)
- **Finished goods protection** - Inventory security at scale
- **Industrial espionage** - Competitive intelligence targeting
- **Insider threat** - Disgruntled employees with production access
- **OSHA compliance integration** - Safety and security overlap
- **Supply chain security** - Vendor/contractor access management
- **Equipment sabotage** - Production line disruption threats
- **Hazardous material security** - CFATS compliance for chemical facilities

### 1.2 Assessment Components

```
Manufacturing Security Assessment = 
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. FACILITY & PRODUCTION PROFILE                            │
  │    - Manufacturing type and processes                       │
  │    - Production value and capacity                          │
  │    - Shift operations and employee count                    │
  │    - High-value materials and finished goods                │
  │    - Trade secret classification                            │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. SECURITY INTERVIEW (10 Sections, 65+ Questions)         │
  │    - Production area security and access control            │
  │    - Raw material receiving and storage                     │
  │    - Finished goods inventory management                    │
  │    - Intellectual property protection measures              │
  │    - Employee vetting and insider threat program            │
  │    - Contractor/vendor access management                    │
  │    - Equipment and machinery security                       │
  │    - OSHA/safety-security integration                       │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. PHYSICAL SECURITY WALKTHROUGH                            │
  │    - Perimeter fence condition and security                 │
  │    - Production floor access controls                       │
  │    - Raw material storage security                          │
  │    - Finished goods warehouse security                      │
  │    - R&D/engineering area protection                        │
  │    - Equipment room/utility access                          │
  │    - Loading dock procedures                                │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. AUTO-GENERATED RISK SCENARIOS (12-15 Threats)           │
  │    - Theft of raw materials                                 │
  │    - Theft of finished goods                                │
  │    - Industrial espionage / IP theft                        │
  │    - Equipment sabotage                                     │
  │    - Insider theft / data exfiltration                      │
  │    - Workplace violence on production floor                 │
  │    - Contractor/vendor exploitation                         │
  │    - Production line disruption                             │
  │    - Hazardous material theft/diversion                     │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. CONTROL RECOMMENDATIONS                                  │
  │    - Production area access control                         │
  │    - IP/trade secret protection measures                    │
  │    - Raw material tracking systems                          │
  │    - Finished goods inventory control                       │
  │    - Equipment security and monitoring                      │
  │    - Insider threat detection program                       │
  │    - Vendor management procedures                           │
  │    - Production continuity safeguards                       │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. PROFESSIONAL PDF REPORT                                  │
  │    - Production continuity risk analysis                    │
  │    - IP protection vulnerability assessment                 │
  │    - Raw material and finished goods security               │
  │    - Insider threat profile                                 │
  │    - ROI-justified recommendations                          │
  │    - Production downtime cost analysis                      │
  └─────────────────────────────────────────────────────────────┘
```

### 1.3 Key Threats for Manufacturing Environments

| Priority | Threat Category | Typical Frequency | Average Impact | Downtime Risk |
|----------|----------------|-------------------|----------------|---------------|
| Critical | Industrial Espionage / IP Theft | Rare but devastating | $500K-$10M+ | Moderate |
| Critical | Equipment Sabotage | Rare | $100K-$1M+ | High (days/weeks) |
| High | Raw Material Theft | Monthly/Quarterly | $10K-$100K | Low-Moderate |
| High | Finished Goods Theft | Monthly/Quarterly | $20K-$200K | Low |
| High | Insider Theft - IP/Data | Quarterly | $100K-$500K | Moderate |
| High | Insider Theft - Physical Goods | Monthly | $5K-$50K | Low |
| Medium | Workplace Violence - Production Floor | Rare | $50K-$500K | Moderate |
| Medium | Contractor/Vendor Exploitation | Quarterly | $10K-$100K | Low |
| Medium | Hazardous Material Theft/Diversion | Rare | $50K-$500K | High (regulatory) |
| Low | Vandalism - Equipment | Occasional | $5K-$50K | Low-Moderate |
| Low | Trespassing - Unauthorized Access | Monthly | $1K-$10K | Low |

### 1.4 Manufacturing-Specific Security Zones

| Zone Type | Security Level | Typical Controls | AI Photo Analysis Focus |
|-----------|----------------|------------------|------------------------|
| **Perimeter** | Restricted | Fencing, gates, CCTV, lighting | Fence gaps, gate control, lighting |
| **Parking/Yard** | Restricted | Access control, patrols | Unauthorized vehicles, staging areas |
| **Loading Dock** | Controlled | Badge access, CCTV, logs | Delivery verification, material handling |
| **Raw Material Storage** | Controlled | Inventory tracking, access logs | Storage security, material organization |
| **Production Floor** | Controlled | Badge access, CCTV, supervision | Process visibility, equipment access |
| **R&D/Engineering** | High Security | Biometric access, NDA enforcement | Document security, prototype protection |
| **Finished Goods Warehouse** | Controlled | Inventory system, cycle counting | Stock organization, access control |
| **Quality Control Lab** | Controlled | Limited access, cameras | Sample security, testing area |
| **Maintenance Shop** | Controlled | Tool control, equipment logs | Tool security, parts inventory |
| **Hazmat Storage** | High Security | Specialized controls, monitoring | Compliance signage, containment |

---

## 2. Assessment Template Specifications

### 2.1 Template Configuration

```typescript
{
  name: 'Manufacturing Facility Security Assessment',
  templateType: 'manufacturing',
  description: 'Comprehensive security assessment for industrial production facilities focusing on IP protection, production continuity, and supply chain security',
  siteTypeRecommendation: 'manufacturing',
  calculationMethod: 'tvi', // Using T×V×I for audit defensibility
  
  defaultThreats: [
    'industrial_espionage_ip_theft',
    'equipment_sabotage',
    'raw_material_theft',
    'finished_goods_theft',
    'insider_theft_ip_data',
    'insider_theft_physical',
    'workplace_violence_production_floor',
    'contractor_vendor_exploitation',
    'hazmat_theft_diversion',
    'vandalism_equipment',
    'trespassing_unauthorized_access',
    'production_line_disruption',
    'trade_secret_theft',
    'theft_tooling_dies_molds',
    'counterfeit_parts_infiltration'
  ],
  
  defaultControls: [
    // Perimeter Security
    'industrial_fencing_8ft_plus',
    'perimeter_intrusion_detection',
    'gate_access_with_guard',
    'vehicle_inspection_procedures',
    'perimeter_lighting_industrial',
    'clear_zone_perimeter',
    
    // Access Control
    'employee_badge_access_control',
    'biometric_access_critical_areas',
    'visitor_contractor_management',
    'temporary_badge_system',
    'access_zone_separation',
    'two_person_rule_sensitive_areas',
    
    // Production Area Security
    'production_floor_cctv',
    'work_cell_access_control',
    'equipment_lockout_tagout',
    'tool_crib_access_control',
    'parts_cage_security',
    'production_line_monitoring',
    
    // Intellectual Property Protection
    'r_and_d_area_access_control',
    'prototype_security_procedures',
    'document_control_system',
    'data_loss_prevention',
    'non_disclosure_enforcement',
    'visitor_nda_procedures',
    'mobile_device_restrictions',
    'photography_prohibition_enforcement',
    
    // Inventory Management
    'raw_material_tracking_system',
    'finished_goods_inventory_control',
    'cycle_counting_program',
    'material_reconciliation',
    'shipping_receiving_verification',
    'bill_of_materials_tracking',
    
    // Surveillance
    'cctv_production_floor',
    'cctv_raw_material_storage',
    'cctv_finished_goods_warehouse',
    'cctv_loading_docks',
    'cctv_r_and_d_areas',
    'video_retention_30_days',
    'video_analytics_manufacturing',
    
    // Personnel Security
    'employee_background_checks_production',
    'contractor_background_checks',
    'insider_threat_program',
    'security_awareness_training_manufacturing',
    'exit_interviews_ip_protection',
    'non_compete_enforcement',
    
    // Physical Barriers
    'raw_material_caging',
    'finished_goods_caging',
    'tool_room_security_barrier',
    'hazmat_storage_compliance',
    'prototype_secure_storage',
    
    // Procedural Controls
    'clean_desk_policy',
    'visitor_escort_requirements',
    'production_area_access_procedures',
    'material_handling_procedures',
    'scrap_disposal_procedures',
    'equipment_key_control',
    'maintenance_access_procedures',
    'production_shutdown_security',
    
    // Technology
    'asset_tracking_rfid',
    'equipment_monitoring_system',
    'production_data_encryption',
    'network_segmentation_ot_it',
    'manufacturing_execution_system',
    'quality_management_system',
    
    // Emergency Response
    'workplace_violence_response_plan',
    'sabotage_incident_response',
    'ip_theft_response_procedures',
    'production_continuity_plan',
    'hazmat_incident_procedures'
  ]
}
```

### 2.2 Threat Library (Manufacturing-Specific)

**Manufacturing-Focused Threats with ASIS GDL-RA Alignment:**

```typescript
export const manufacturingThreats: Threat[] = [
  {
    id: 'industrial_espionage_ip_theft',
    name: 'Industrial Espionage / IP Theft',
    category: 'Intellectual Property',
    description: 'Theft of trade secrets, proprietary processes, formulas, designs, or confidential business information by competitors or foreign entities',
    baselineLikelihood: 2,
    baselineImpact: 5,
    asisCode: 'PSC.1-2012-ESP-001',
    indicators: [
      'R&D area lacks adequate access control',
      'No visitor escort requirements',
      'Employees can freely photograph production areas',
      'No NDA enforcement for visitors',
      'Contractors have unrestricted access'
    ]
  },
  
  {
    id: 'equipment_sabotage',
    name: 'Equipment Sabotage',
    category: 'Sabotage',
    description: 'Intentional damage or tampering with production equipment, machinery, or control systems to disrupt operations',
    baselineLikelihood: 1,
    baselineImpact: 5,
    asisCode: 'PSC.1-2012-SAB-003',
    indicators: [
      'No access control on production equipment',
      'Inadequate supervision on night shifts',
      'No equipment monitoring systems',
      'Recent labor disputes or terminations',
      'Lack of equipment security protocols'
    ]
  },
  
  {
    id: 'raw_material_theft',
    name: 'Raw Material Theft',
    category: 'Theft',
    description: 'Theft of high-value raw materials, components, or inputs used in manufacturing processes',
    baselineLikelihood: 3,
    baselineImpact: 3,
    asisCode: 'PSC.1-2012-THF-012',
    indicators: [
      'Raw materials stored in unsecured areas',
      'No inventory tracking system',
      'Infrequent cycle counting',
      'High-value materials (metals, electronics)',
      'Loading dock access not controlled'
    ]
  },
  
  {
    id: 'finished_goods_theft',
    name: 'Finished Goods Theft',
    category: 'Theft',
    description: 'Theft of completed products from warehouse, loading areas, or during shipping',
    baselineLikelihood: 3,
    baselineImpact: 4,
    asisCode: 'PSC.1-2012-THF-013',
    indicators: [
      'Finished goods warehouse lacks security',
      'No manifest verification procedures',
      'Inadequate shipping/receiving controls',
      'Products easily resold on secondary market',
      'No CCTV on loading docks'
    ]
  },
  
  {
    id: 'insider_theft_ip_data',
    name: 'Insider Theft - IP/Data',
    category: 'Insider Threat',
    description: 'Employee or contractor theft of proprietary information, customer data, or manufacturing processes',
    baselineLikelihood: 3,
    baselineImpact: 4,
    asisCode: 'PSC.1-2012-INS-002',
    indicators: [
      'No data loss prevention system',
      'Employees can email documents externally',
      'USB drives not restricted',
      'No exit interview process for IP return',
      'Lack of non-compete agreements'
    ]
  },
  
  {
    id: 'insider_theft_physical',
    name: 'Insider Theft - Physical Goods',
    category: 'Insider Threat',
    description: 'Employee theft of tools, materials, components, or finished products',
    baselineLikelihood: 4,
    baselineImpact: 2,
    asisCode: 'PSC.1-2012-INS-003',
    indicators: [
      'No bag checks at exit',
      'Tools not controlled or tracked',
      'Scrap disposal not monitored',
      'Employee vehicles park near production',
      'No random inspections'
    ]
  },
  
  {
    id: 'workplace_violence_production_floor',
    name: 'Workplace Violence - Production Floor',
    category: 'Workplace Violence',
    description: 'Violent incidents on production floor including active threats, assaults, or domestic violence spillover',
    baselineLikelihood: 2,
    baselineImpact: 4,
    asisCode: 'PSC.1-2012-WPV-003',
    indicators: [
      'No workplace violence policy',
      'Inadequate threat assessment procedures',
      'No panic buttons on production floor',
      'Limited security presence during all shifts',
      'No lockdown procedures'
    ]
  },
  
  {
    id: 'contractor_vendor_exploitation',
    name: 'Contractor/Vendor Exploitation',
    category: 'Supply Chain',
    description: 'Unauthorized access or theft by contractors, vendors, or maintenance personnel',
    baselineLikelihood: 3,
    baselineImpact: 3,
    asisCode: 'PSC.1-2012-SUP-001',
    indicators: [
      'Contractors not escorted',
      'No background checks for contractors',
      'Vendors have unrestricted access',
      'No sign-in/sign-out procedures',
      'Maintenance access not logged'
    ]
  },
  
  {
    id: 'hazmat_theft_diversion',
    name: 'Hazardous Material Theft/Diversion',
    category: 'Hazmat',
    description: 'Theft or unauthorized diversion of hazardous chemicals, materials, or substances',
    baselineLikelihood: 1,
    baselineImpact: 5,
    asisCode: 'PSC.1-2012-HAZ-001',
    indicators: [
      'Hazmat storage not secured',
      'No inventory reconciliation for chemicals',
      'Inadequate access control',
      'No two-person rule for hazmat access',
      'CFATS compliance gaps'
    ]
  },
  
  {
    id: 'vandalism_equipment',
    name: 'Vandalism - Equipment',
    category: 'Vandalism',
    description: 'Deliberate damage to equipment, machinery, or facility infrastructure',
    baselineLikelihood: 2,
    baselineImpact: 3,
    asisCode: 'PSC.1-2012-VAN-003',
    indicators: [
      'Equipment accessible after hours',
      'No intrusion detection',
      'Perimeter security gaps',
      'Recent labor tensions',
      'Graffiti or minor vandalism observed'
    ]
  },
  
  {
    id: 'trespassing_unauthorized_access',
    name: 'Trespassing / Unauthorized Access',
    category: 'Physical Intrusion',
    description: 'Unauthorized individuals gaining access to facility or production areas',
    baselineLikelihood: 3,
    baselineImpact: 2,
    asisCode: 'PSC.1-2012-INT-006',
    indicators: [
      'Perimeter fence in poor condition',
      'No gate controls or guards',
      'Previous trespassing incidents',
      'Production areas visible from public roads',
      'Inadequate signage'
    ]
  },
  
  {
    id: 'production_line_disruption',
    name: 'Production Line Disruption',
    category: 'Operational Disruption',
    description: 'Intentional or accidental disruption of production processes causing downtime',
    baselineLikelihood: 2,
    baselineImpact: 4,
    asisCode: 'PSC.1-2012-OPS-001',
    indicators: [
      'Single points of failure not protected',
      'Critical systems lack redundancy',
      'No production continuity plan',
      'Equipment monitoring inadequate',
      'Emergency shutdown procedures unclear'
    ]
  },
  
  {
    id: 'trade_secret_theft',
    name: 'Trade Secret Theft',
    category: 'Intellectual Property',
    description: 'Theft of proprietary manufacturing processes, formulas, or methods',
    baselineLikelihood: 2,
    baselineImpact: 5,
    asisCode: 'PSC.1-2012-ESP-002',
    indicators: [
      'Process documentation not secured',
      'No clean desk policy',
      'Visitors can view production processes',
      'Employees can photograph production',
      'No trade secret identification program'
    ]
  },
  
  {
    id: 'theft_tooling_dies_molds',
    name: 'Theft of Tooling, Dies, or Molds',
    category: 'Theft',
    description: 'Theft of specialized tooling, dies, molds, or fixtures used in production',
    baselineLikelihood: 2,
    baselineImpact: 4,
    asisCode: 'PSC.1-2012-THF-014',
    indicators: [
      'Tooling not tracked or controlled',
      'Tool crib lacks security',
      'High-value dies/molds not secured',
      'No inventory system for tooling',
      'Maintenance area unsecured'
    ]
  },
  
  {
    id: 'counterfeit_parts_infiltration',
    name: 'Counterfeit Parts Infiltration',
    category: 'Supply Chain',
    description: 'Introduction of counterfeit or substandard components into production',
    baselineLikelihood: 2,
    baselineImpact: 4,
    asisCode: 'PSC.1-2012-SUP-002',
    indicators: [
      'No parts verification procedures',
      'Supplier vetting inadequate',
      'No quality checks on incoming materials',
      'Grey market parts used',
      'Supply chain visibility lacking'
    ]
  }
];
```

---

## 3. Interview Protocol System

### 3.1 Interview Questionnaire Structure

**File Location:** `server/data/manufacturing-interview-questionnaire.ts`

```typescript
export interface ManufacturingInterviewQuestion {
  id: string;
  section: string;
  zoneApplicable?: string[]; // Production floor, R&D, warehouse, etc.
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist' | 'number';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: ManufacturingInterviewQuestion[];
  riskIndicators?: string[]; // Keywords that elevate risk
  
  // Direct mapping to risk scenarios
  informsThreat?: string[]; // Threat IDs this question informs
  informsVulnerability?: boolean; // Does this assess vulnerability?
  informsImpact?: boolean; // Does this assess potential impact?
  suggestsControls?: string[]; // Control IDs this might reveal need for
}
```

### 3.2 Complete Interview Questions (10 Sections, 65+ Questions)

#### **SECTION 1: FACILITY & PRODUCTION PROFILE (8 questions)**

```typescript
const section1_facilityProfile: ManufacturingInterviewQuestion[] = [
  {
    id: 'facility_1',
    section: 'Facility & Production Profile',
    questionText: 'What type of manufacturing does this facility perform?',
    questionType: 'multiple_choice',
    options: [
      'Discrete manufacturing (automotive, electronics, machinery)',
      'Process manufacturing (chemicals, food/beverage, pharmaceuticals)',
      'Fabrication (metal working, plastics, textiles)',
      'Assembly (electronics assembly, product assembly)',
      'Job shop (custom/made-to-order)',
      'Mixed/hybrid manufacturing'
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft']
  },

  {
    id: 'facility_2',
    section: 'Facility & Production Profile',
    questionText: 'What is the approximate square footage of the manufacturing facility?',
    questionType: 'multiple_choice',
    options: [
      'Under 25,000 sq ft',
      '25,000 - 100,000 sq ft',
      '100,000 - 300,000 sq ft',
      '300,000 - 500,000 sq ft',
      'Over 500,000 sq ft'
    ],
    required: true,
    informsImpact: true,
    informsVulnerability: true
  },

  {
    id: 'facility_3',
    section: 'Facility & Production Profile',
    questionText: 'What is the approximate annual production value?',
    questionType: 'multiple_choice',
    options: [
      'Under $5 million',
      '$5M - $25M',
      '$25M - $100M',
      '$100M - $500M',
      'Over $500M'
    ],
    required: true,
    informsImpact: true
  },

  {
    id: 'facility_4',
    section: 'Facility & Production Profile',
    questionText: 'How many shifts does the facility operate?',
    questionType: 'multiple_choice',
    options: [
      '1 shift (8 hours)',
      '2 shifts (16 hours)',
      '3 shifts (24/7 continuous)',
      'Variable shifts'
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'insider_theft_physical']
  },

  {
    id: 'facility_5',
    section: 'Facility & Production Profile',
    questionText: 'How many total employees work at this facility?',
    questionType: 'multiple_choice',
    options: [
      '1-50 employees',
      '51-150 employees',
      '151-300 employees',
      '301-500 employees',
      'Over 500 employees'
    ],
    required: true,
    informsImpact: true
  },

  {
    id: 'facility_6',
    section: 'Facility & Production Profile',
    questionText: 'Does your facility manufacture products that contain proprietary processes, formulas, or trade secrets?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft', 'insider_theft_ip_data'],
    followUpQuestions: [
      {
        id: 'facility_6a',
        section: 'Facility & Production Profile',
        questionText: 'What types of intellectual property are present in your manufacturing processes? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Proprietary formulas or chemical compositions',
          'Patented manufacturing processes',
          'Trade secret processes or methods',
          'Proprietary tooling, dies, or molds',
          'Custom software or control systems',
          'Unique equipment configurations',
          'Confidential customer specifications'
        ],
        required: true,
        informsImpact: true
      }
    ]
  },

  {
    id: 'facility_7',
    section: 'Facility & Production Profile',
    questionText: 'Do you manufacture high-value products or use high-value raw materials?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['raw_material_theft', 'finished_goods_theft'],
    followUpQuestions: [
      {
        id: 'facility_7a',
        section: 'Facility & Production Profile',
        questionText: 'What types of high-value materials or products? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Precious metals (gold, silver, platinum)',
          'Electronics components or assemblies',
          'Pharmaceuticals or active ingredients',
          'Aerospace components',
          'Automotive parts (catalytic converters, etc.)',
          'Industrial chemicals',
          'Copper or other valuable metals',
          'Finished consumer electronics'
        ],
        required: true,
        informsImpact: true
      }
    ]
  },

  {
    id: 'facility_8',
    section: 'Facility & Production Profile',
    questionText: 'Does your facility handle hazardous materials subject to CFATS or other security regulations?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['hazmat_theft_diversion'],
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'facility_8a',
        section: 'Facility & Production Profile',
        questionText: 'What is your CFATS tier classification (if applicable)?',
        questionType: 'multiple_choice',
        options: [
          'Tier 1 (highest risk)',
          'Tier 2',
          'Tier 3',
          'Tier 4',
          'Not subject to CFATS'
        ],
        required: true,
        informsVulnerability: true
      }
    ]
  }
];
```

#### **SECTION 2: PERIMETER & ACCESS SECURITY (7 questions)**

```typescript
const section2_perimeterSecurity: ManufacturingInterviewQuestion[] = [
  {
    id: 'perimeter_1',
    section: 'Perimeter & Access Security',
    questionText: 'What type of perimeter barrier surrounds the facility?',
    questionType: 'multiple_choice',
    options: [
      'Chain-link fence (8+ feet with barbed wire)',
      'Chain-link fence (6-7 feet)',
      'Chain-link fence (under 6 feet)',
      'Other fencing type (wood, concrete wall, etc.)',
      'No perimeter fence'
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access'],
    riskIndicators: ['no perimeter fence', 'under 6 feet']
  },

  {
    id: 'perimeter_2',
    section: 'Perimeter & Access Security',
    questionText: 'Is there a staffed security gate or guard shack at the main entrance?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access', 'contractor_vendor_exploitation'],
    suggestsControls: ['gate_access_with_guard']
  },

  {
    id: 'perimeter_3',
    section: 'Perimeter & Access Security',
    questionText: 'Does the perimeter have intrusion detection sensors or monitoring?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['trespassing_unauthorized_access', 'equipment_sabotage'],
    suggestsControls: ['perimeter_intrusion_detection']
  },

  {
    id: 'perimeter_4',
    section: 'Perimeter & Access Security',
    questionText: 'Is perimeter lighting adequate for nighttime security?',
    questionType: 'rating',
    ratingScale: {
      min: 1,
      max: 5,
      labels: ['Poor/None', 'Inadequate', 'Adequate', 'Good', 'Excellent']
    },
    required: true,
    informsVulnerability: true,
    riskIndicators: ['1', '2']
  },

  {
    id: 'perimeter_5',
    section: 'Perimeter & Access Security',
    questionText: 'Are there CCTV cameras covering the perimeter?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_outdoor'],
    followUpQuestions: [
      {
        id: 'perimeter_5a',
        section: 'Perimeter & Access Security',
        questionText: 'What percentage of the perimeter is covered by CCTV?',
        questionType: 'multiple_choice',
        options: [
          '0-25%',
          '26-50%',
          '51-75%',
          '76-100%'
        ],
        required: true,
        informsVulnerability: true,
        riskIndicators: ['0-25%', '26-50%']
      }
    ]
  },

  {
    id: 'perimeter_6',
    section: 'Perimeter & Access Security',
    questionText: 'How often are perimeter patrols or inspections conducted?',
    questionType: 'multiple_choice',
    options: [
      'Continuously (24/7 guards)',
      'Multiple times per shift',
      'Once per shift',
      'Daily',
      'Infrequently or never'
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['infrequently', 'never']
  },

  {
    id: 'perimeter_7',
    section: 'Perimeter & Access Security',
    questionText: 'Are vehicle inspection procedures in place for incoming trucks and deliveries?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['counterfeit_parts_infiltration', 'contractor_vendor_exploitation'],
    suggestsControls: ['vehicle_inspection_procedures']
  }
];
```

#### **SECTION 3: PRODUCTION AREA SECURITY (8 questions)**

```typescript
const section3_productionSecurity: ManufacturingInterviewQuestion[] = [
  {
    id: 'production_1',
    section: 'Production Area Security',
    questionText: 'Is access to the production floor controlled by badge/card readers?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'equipment_sabotage', 'trespassing_unauthorized_access'],
    suggestsControls: ['employee_badge_access_control', 'access_zone_separation'],
    riskIndicators: ['no']
  },

  {
    id: 'production_2',
    section: 'Production Area Security',
    questionText: 'Are there CCTV cameras on the production floor?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_production_floor'],
    followUpQuestions: [
      {
        id: 'production_2a',
        section: 'Production Area Security',
        questionText: 'What percentage of production areas have CCTV coverage?',
        questionType: 'multiple_choice',
        options: [
          '0-25%',
          '26-50%',
          '51-75%',
          '76-100%'
        ],
        required: true,
        informsVulnerability: true,
        riskIndicators: ['0-25%', '26-50%']
      }
    ]
  },

  {
    id: 'production_3',
    section: 'Production Area Security',
    questionText: 'Are critical production equipment or machinery secured when not in use?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'vandalism_equipment'],
    suggestsControls: ['equipment_lockout_tagout'],
    riskIndicators: ['no']
  },

  {
    id: 'production_4',
    section: 'Production Area Security',
    questionText: 'Do you have a tool control system in place?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'theft_tooling_dies_molds'],
    suggestsControls: ['tool_crib_access_control'],
    followUpQuestions: [
      {
        id: 'production_4a',
        section: 'Production Area Security',
        questionText: 'How are tools tracked?',
        questionType: 'multiple_choice',
        options: [
          'Automated tool tracking system (RFID, barcode)',
          'Manual sign-out log',
          'Shadow boards with visual management',
          'No formal tracking'
        ],
        required: true,
        informsVulnerability: true,
        riskIndicators: ['no formal tracking']
      }
    ]
  },

  {
    id: 'production_5',
    section: 'Production Area Security',
    questionText: 'Are visitors and contractors prohibited from photographing or recording in production areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
    suggestsControls: ['photography_prohibition_enforcement', 'mobile_device_restrictions'],
    riskIndicators: ['no']
  },

  {
    id: 'production_6',
    section: 'Production Area Security',
    questionText: 'What level of supervision is present on night/weekend shifts?',
    questionType: 'multiple_choice',
    options: [
      'Full supervisory staff (same as day shift)',
      'Reduced supervision (lead person present)',
      'Minimal supervision (operators only)',
      'No production on nights/weekends'
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'insider_theft_physical'],
    riskIndicators: ['minimal supervision', 'operators only']
  },

  {
    id: 'production_7',
    section: 'Production Area Security',
    questionText: 'Do you have procedures for securing work-in-progress (WIP) inventory?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'finished_goods_theft']
  },

  {
    id: 'production_8',
    section: 'Production Area Security',
    questionText: 'Is scrap material disposal monitored and controlled?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'raw_material_theft'],
    suggestsControls: ['scrap_disposal_procedures'],
    riskIndicators: ['no']
  }
];
```

#### **SECTION 4: INTELLECTUAL PROPERTY PROTECTION (7 questions)**

```typescript
const section4_ipProtection: ManufacturingInterviewQuestion[] = [
  {
    id: 'ip_1',
    section: 'Intellectual Property Protection',
    questionText: 'Do you have an R&D or engineering area that requires enhanced security?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
    followUpQuestions: [
      {
        id: 'ip_1a',
        section: 'Intellectual Property Protection',
        questionText: 'How is access to R&D/engineering areas controlled?',
        questionType: 'multiple_choice',
        options: [
          'Biometric access control (fingerprint, facial recognition)',
          'Badge/card reader access',
          'Key/lock access',
          'No formal access control'
        ],
        required: true,
        informsVulnerability: true,
        suggestsControls: ['r_and_d_area_access_control', 'biometric_access_critical_areas'],
        riskIndicators: ['no formal access control', 'key/lock access']
      }
    ]
  },

  {
    id: 'ip_2',
    section: 'Intellectual Property Protection',
    questionText: 'Are all visitors and contractors required to sign NDAs before accessing the facility?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'contractor_vendor_exploitation'],
    suggestsControls: ['visitor_nda_procedures', 'non_disclosure_enforcement'],
    riskIndicators: ['no']
  },

  {
    id: 'ip_3',
    section: 'Intellectual Property Protection',
    questionText: 'Do you have a clean desk/clear screen policy for protecting sensitive documents and data?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'insider_theft_ip_data'],
    suggestsControls: ['clean_desk_policy', 'document_control_system'],
    riskIndicators: ['no']
  },

  {
    id: 'ip_4',
    section: 'Intellectual Property Protection',
    questionText: 'Are prototypes and pre-production samples stored securely?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
    suggestsControls: ['prototype_security_procedures', 'prototype_secure_storage'],
    riskIndicators: ['no']
  },

  {
    id: 'ip_5',
    section: 'Intellectual Property Protection',
    questionText: 'Do you have data loss prevention (DLP) measures to prevent unauthorized data transfer?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_ip_data', 'industrial_espionage_ip_theft'],
    suggestsControls: ['data_loss_prevention', 'production_data_encryption'],
    riskIndicators: ['no']
  },

  {
    id: 'ip_6',
    section: 'Intellectual Property Protection',
    questionText: 'Are personal mobile devices restricted in sensitive areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'trade_secret_theft'],
    suggestsControls: ['mobile_device_restrictions'],
    riskIndicators: ['no']
  },

  {
    id: 'ip_7',
    section: 'Intellectual Property Protection',
    questionText: 'Do you conduct exit interviews that include IP return procedures when employees leave?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_ip_data', 'trade_secret_theft'],
    suggestsControls: ['exit_interviews_ip_protection'],
    riskIndicators: ['no']
  }
];
```

#### **SECTION 5: RAW MATERIAL & INVENTORY CONTROL (7 questions)**

```typescript
const section5_inventoryControl: ManufacturingInterviewQuestion[] = [
  {
    id: 'inventory_1',
    section: 'Raw Material & Inventory Control',
    questionText: 'Do you have an automated inventory tracking system?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    suggestsControls: ['raw_material_tracking_system', 'asset_tracking_rfid'],
    followUpQuestions: [
      {
        id: 'inventory_1a',
        section: 'Raw Material & Inventory Control',
        questionText: 'What type of tracking system?',
        questionType: 'multiple_choice',
        options: [
          'ERP/MRP system with real-time tracking',
          'Barcode scanning system',
          'RFID tracking',
          'Manual spreadsheet/paper logs',
          'No formal system'
        ],
        required: true,
        informsVulnerability: true,
        riskIndicators: ['manual spreadsheet', 'no formal system']
      }
    ]
  },

  {
    id: 'inventory_2',
    section: 'Raw Material & Inventory Control',
    questionText: 'How frequently do you conduct cycle counts of raw materials and components?',
    questionType: 'multiple_choice',
    options: [
      'Continuous (ABC analysis with frequent counts)',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Annually or less frequently'
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    riskIndicators: ['annually', 'less frequently']
  },

  {
    id: 'inventory_3',
    section: 'Raw Material & Inventory Control',
    questionText: 'Are high-value raw materials stored in secured cages or locked areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft'],
    suggestsControls: ['raw_material_caging', 'parts_cage_security'],
    riskIndicators: ['no']
  },

  {
    id: 'inventory_4',
    section: 'Raw Material & Inventory Control',
    questionText: 'Do you track materials by lot/serial numbers?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['counterfeit_parts_infiltration', 'raw_material_theft'],
    suggestsControls: ['bill_of_materials_tracking']
  },

  {
    id: 'inventory_5',
    section: 'Raw Material & Inventory Control',
    questionText: 'Are CCTV cameras covering raw material storage areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical'],
    suggestsControls: ['cctv_raw_material_storage']
  },

  {
    id: 'inventory_6',
    section: 'Raw Material & Inventory Control',
    questionText: 'Do you have exception-based reporting for inventory discrepancies?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'insider_theft_physical']
  },

  {
    id: 'inventory_7',
    section: 'Raw Material & Inventory Control',
    questionText: 'Do you require two-person authorization for accessing high-value materials?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['raw_material_theft', 'hazmat_theft_diversion'],
    suggestsControls: ['two_person_rule_sensitive_areas']
  }
];
```

#### **SECTION 6: FINISHED GOODS & SHIPPING SECURITY (6 questions)**

```typescript
const section6_finishedGoods: ManufacturingInterviewQuestion[] = [
  {
    id: 'shipping_1',
    section: 'Finished Goods & Shipping Security',
    questionText: 'Are finished goods stored in a separate, secured warehouse or area?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft'],
    suggestsControls: ['finished_goods_caging']
  },

  {
    id: 'shipping_2',
    section: 'Finished Goods & Shipping Security',
    questionText: 'Is access to the finished goods warehouse controlled by badge readers?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'insider_theft_physical'],
    riskIndicators: ['no']
  },

  {
    id: 'shipping_3',
    section: 'Finished Goods & Shipping Security',
    questionText: 'Do you verify shipping manifests against actual loaded products?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'insider_theft_physical'],
    suggestsControls: ['shipping_receiving_verification'],
    riskIndicators: ['no']
  },

  {
    id: 'shipping_4',
    section: 'Finished Goods & Shipping Security',
    questionText: 'Are loading docks monitored by CCTV?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['finished_goods_theft', 'contractor_vendor_exploitation'],
    suggestsControls: ['cctv_loading_docks']
  },

  {
    id: 'shipping_5',
    section: 'Finished Goods & Shipping Security',
    questionText: 'How frequently do you conduct inventory counts of finished goods?',
    questionType: 'multiple_choice',
    options: [
      'Daily or continuous',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Annually'
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['quarterly', 'annually']
  },

  {
    id: 'shipping_6',
    section: 'Finished Goods & Shipping Security',
    questionText: 'Do drivers/carriers remain with their vehicles during loading, or are they escorted away?',
    questionType: 'multiple_choice',
    options: [
      'Drivers escorted to separate waiting area',
      'Drivers remain with vehicles under supervision',
      'Drivers can move freely in loading area',
      'No formal policy'
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['move freely', 'no formal policy']
  }
];
```

#### **SECTION 7: PERSONNEL SECURITY (7 questions)**

```typescript
const section7_personnelSecurity: ManufacturingInterviewQuestion[] = [
  {
    id: 'personnel_1',
    section: 'Personnel Security',
    questionText: 'Do you conduct background checks on production employees?',
    questionType: 'multiple_choice',
    options: [
      'Yes, comprehensive checks for all employees',
      'Yes, for employees in sensitive positions only',
      'Basic checks only (criminal history)',
      'No background checks'
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'insider_theft_ip_data', 'workplace_violence_production_floor'],
    suggestsControls: ['employee_background_checks_production'],
    riskIndicators: ['no background checks', 'basic checks only']
  },

  {
    id: 'personnel_2',
    section: 'Personnel Security',
    questionText: 'Do you require background checks for contractors and temporary workers?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'insider_theft_physical'],
    suggestsControls: ['contractor_background_checks'],
    riskIndicators: ['no']
  },

  {
    id: 'personnel_3',
    section: 'Personnel Security',
    questionText: 'Do you have an insider threat awareness program?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_ip_data', 'insider_theft_physical', 'equipment_sabotage'],
    suggestsControls: ['insider_threat_program']
  },

  {
    id: 'personnel_4',
    section: 'Personnel Security',
    questionText: 'Do employees receive security awareness training specific to manufacturing environments?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'insider_theft_physical'],
    suggestsControls: ['security_awareness_training_manufacturing']
  },

  {
    id: 'personnel_5',
    section: 'Personnel Security',
    questionText: 'Are employees subject to random bag checks or inspections when exiting?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_physical', 'raw_material_theft'],
    riskIndicators: ['no']
  },

  {
    id: 'personnel_6',
    section: 'Personnel Security',
    questionText: 'Do you have procedures for immediately revoking access when employees are terminated?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_ip_data', 'equipment_sabotage'],
    riskIndicators: ['no']
  },

  {
    id: 'personnel_7',
    section: 'Personnel Security',
    questionText: 'Do employees sign non-compete or non-disclosure agreements?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['trade_secret_theft', 'insider_theft_ip_data'],
    suggestsControls: ['non_compete_enforcement']
  }
];
```

#### **SECTION 8: CONTRACTOR & VENDOR MANAGEMENT (5 questions)**

```typescript
const section8_contractorManagement: ManufacturingInterviewQuestion[] = [
  {
    id: 'contractor_1',
    section: 'Contractor & Vendor Management',
    questionText: 'Are all contractors and vendors required to sign in/out when visiting?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation'],
    suggestsControls: ['visitor_contractor_management'],
    riskIndicators: ['no']
  },

  {
    id: 'contractor_2',
    section: 'Contractor & Vendor Management',
    questionText: 'Are contractors and visitors escorted at all times?',
    questionType: 'multiple_choice',
    options: [
      'Yes, always escorted',
      'Escorted in sensitive areas only',
      'Not escorted',
      'Varies by contractor'
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'industrial_espionage_ip_theft'],
    suggestsControls: ['visitor_escort_requirements'],
    riskIndicators: ['not escorted', 'varies']
  },

  {
    id: 'contractor_3',
    section: 'Contractor & Vendor Management',
    questionText: 'Do you vet suppliers and verify the authenticity of parts/materials received?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['counterfeit_parts_infiltration'],
    riskIndicators: ['no']
  },

  {
    id: 'contractor_4',
    section: 'Contractor & Vendor Management',
    questionText: 'Are maintenance and service personnel access logged and tracked?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'equipment_sabotage'],
    suggestsControls: ['maintenance_access_procedures']
  },

  {
    id: 'contractor_5',
    section: 'Contractor & Vendor Management',
    questionText: 'Do you have a formal vendor security requirements program?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['contractor_vendor_exploitation', 'counterfeit_parts_infiltration']
  }
];
```

#### **SECTION 9: SURVEILLANCE & MONITORING (5 questions)**

```typescript
const section9_surveillance: ManufacturingInterviewQuestion[] = [
  {
    id: 'surveillance_1',
    section: 'Surveillance & Monitoring',
    questionText: 'What percentage of your facility is covered by CCTV?',
    questionType: 'multiple_choice',
    options: [
      '0-25%',
      '26-50%',
      '51-75%',
      '76-100%'
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['0-25%', '26-50%']
  },

  {
    id: 'surveillance_2',
    section: 'Surveillance & Monitoring',
    questionText: 'How long is video footage retained?',
    questionType: 'multiple_choice',
    options: [
      'Less than 7 days',
      '7-14 days',
      '15-30 days',
      '31-60 days',
      'Over 60 days'
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_retention_30_days'],
    riskIndicators: ['less than 7', '7-14 days']
  },

  {
    id: 'surveillance_3',
    section: 'Surveillance & Monitoring',
    questionText: 'Is video monitored in real-time by security staff?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true
  },

  {
    id: 'surveillance_4',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use video analytics or AI-based monitoring for anomaly detection?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_analytics_manufacturing']
  },

  {
    id: 'surveillance_5',
    section: 'Surveillance & Monitoring',
    questionText: 'Are critical equipment and assets monitored with sensors or alarms?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'production_line_disruption'],
    suggestsControls: ['equipment_monitoring_system']
  }
];
```

#### **SECTION 10: EMERGENCY RESPONSE & INCIDENT HISTORY (6 questions)**

```typescript
const section10_emergencyResponse: ManufacturingInterviewQuestion[] = [
  {
    id: 'emergency_1',
    section: 'Emergency Response & Incident History',
    questionText: 'Do you have a workplace violence response plan specific to the production environment?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['workplace_violence_production_floor'],
    suggestsControls: ['workplace_violence_response_plan']
  },

  {
    id: 'emergency_2',
    section: 'Emergency Response & Incident History',
    questionText: 'Have you experienced any security incidents in the past 3 years? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Theft of raw materials or components',
      'Theft of finished goods',
      'Theft of tooling, dies, or molds',
      'Intellectual property theft or espionage',
      'Equipment sabotage or vandalism',
      'Workplace violence incident',
      'Insider threat incident',
      'Contractor/vendor security breach',
      'Hazmat theft or diversion',
      'No security incidents'
    ],
    required: true,
    informsThreat: ['raw_material_theft', 'finished_goods_theft', 'industrial_espionage_ip_theft', 'equipment_sabotage']
  },

  {
    id: 'emergency_3',
    section: 'Emergency Response & Incident History',
    questionText: 'Do you have a production continuity plan that addresses security disruptions?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['production_line_disruption'],
    suggestsControls: ['production_continuity_plan']
  },

  {
    id: 'emergency_4',
    section: 'Emergency Response & Incident History',
    questionText: 'Are there documented procedures for responding to IP theft or espionage?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['industrial_espionage_ip_theft', 'insider_theft_ip_data'],
    suggestsControls: ['ip_theft_response_procedures']
  },

  {
    id: 'emergency_5',
    section: 'Emergency Response & Incident History',
    questionText: 'Do you have a formal sabotage incident response plan?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['equipment_sabotage', 'production_line_disruption'],
    suggestsControls: ['sabotage_incident_response']
  },

  {
    id: 'emergency_6',
    section: 'Emergency Response & Incident History',
    questionText: 'Are security incidents formally investigated and documented?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true
  }
];
```

---

## 4. Risk Mapping & Calculation Integration

### 4.1 Risk Calculation Algorithms

**Service Location:** `server/services/manufacturing-risk-mapper.ts`

```typescript
export function calculateManufacturingThreatLikelihood(
  threat: Threat,
  responses: InterviewResponses
): number {
  let likelihood = threat.baselineLikelihood; // Start with baseline (1-5)

  // Adjust based on incident history
  if (responses.emergency_2?.includes(getThreatKeyword(threat.id))) {
    likelihood += 2; // Recent incidents significantly increase likelihood
  }

  // Adjust based on security controls
  const criticalGaps = identifyCriticalGaps(threat.id, responses);
  if (criticalGaps.length >= 3) {
    likelihood += 1;
  } else if (criticalGaps.length >= 5) {
    likelihood += 2;
  }

  // IP theft specific adjustments
  if (threat.id === 'industrial_espionage_ip_theft') {
    if (responses.facility_6 === 'yes') likelihood += 1; // Has trade secrets
    if (responses.ip_2 === 'no') likelihood += 1; // No NDAs
    if (responses.ip_5 === 'no') likelihood += 1; // No DLP
  }

  // Equipment sabotage adjustments
  if (threat.id === 'equipment_sabotage') {
    if (responses.production_6?.includes('minimal')) likelihood += 1;
    if (responses.production_3 === 'no') likelihood += 1;
  }

  // Raw material theft adjustments
  if (threat.id === 'raw_material_theft') {
    if (responses.facility_7 === 'yes') likelihood += 1; // High-value materials
    if (responses.inventory_3 === 'no') likelihood += 1; // Not caged
    if (responses.inventory_2?.includes('annually')) likelihood += 1;
  }

  // Insider threat adjustments
  if (threat.category === 'Insider Threat') {
    if (responses.personnel_3 === 'no') likelihood += 1; // No insider threat program
    if (responses.personnel_1?.includes('no background')) likelihood += 1;
  }

  // Contractor exploitation adjustments
  if (threat.id === 'contractor_vendor_exploitation') {
    if (responses.contractor_2?.includes('not escorted')) likelihood += 2;
    if (responses.contractor_4 === 'no') likelihood += 1;
  }

  return Math.min(Math.max(likelihood, 1), 5); // Clamp between 1-5
}

export function calculateManufacturingVulnerability(
  threat: Threat,
  responses: InterviewResponses
): number {
  let vulnerability = 5; // Start at medium (1-10 scale)

  // Perimeter security factors
  if (responses.perimeter_1?.includes('no perimeter') || 
      responses.perimeter_1?.includes('under 6 feet')) {
    vulnerability += 2;
  }
  if (responses.perimeter_2 === 'no') vulnerability += 1;
  if (responses.perimeter_3 === 'no') vulnerability += 1;

  // Production area security factors
  if (responses.production_1 === 'no') vulnerability += 2; // No access control
  if (responses.production_2 === 'no') vulnerability += 1; // No CCTV

  // IP protection factors (for IP-related threats)
  if (threat.category === 'Intellectual Property') {
    if (responses.ip_1a?.length === 0) vulnerability -= 1; // No IP present = less vulnerable
    if (responses.ip_2 === 'no') vulnerability += 2; // No NDAs
    if (responses.ip_3 === 'no') vulnerability += 1; // No clean desk
    if (responses.ip_4 === 'no') vulnerability += 1; // Prototypes not secured
    if (responses.ip_5 === 'no') vulnerability += 2; // No DLP
  }

  // Inventory control factors (for theft threats)
  if (threat.category === 'Theft') {
    if (responses.inventory_1a?.includes('no formal system')) vulnerability += 2;
    if (responses.inventory_3 === 'no') vulnerability += 2; // High-value not caged
    if (responses.inventory_5 === 'no') vulnerability += 1; // No CCTV
  }

  // Personnel security factors (for insider threats)
  if (threat.category === 'Insider Threat') {
    if (responses.personnel_1?.includes('no background')) vulnerability += 2;
    if (responses.personnel_3 === 'no') vulnerability += 1;
    if (responses.personnel_5 === 'no') vulnerability += 1;
  }

  // Contractor management factors
  if (threat.id === 'contractor_vendor_exploitation') {
    if (responses.contractor_1 === 'no') vulnerability += 2;
    if (responses.contractor_2?.includes('not escorted')) vulnerability += 2;
  }

  // Surveillance coverage
  if (responses.surveillance_1?.includes('0-25%') ||
      responses.surveillance_1?.includes('26-50%')) {
    vulnerability += 1;
  }

  return Math.min(Math.max(vulnerability, 1), 10); // Clamp between 1-10
}

export function calculateManufacturingImpact(
  threat: Threat,
  responses: InterviewResponses
): number {
  let impact = threat.baselineImpact; // Start with baseline (1-5)

  // Scale based on production value
  if (responses.facility_3?.includes('Over $500M')) {
    impact += 2;
  } else if (responses.facility_3?.includes('$100M - $500M')) {
    impact += 1;
  }

  // Scale based on employee count (life safety)
  if (threat.category === 'Workplace Violence') {
    if (responses.facility_5?.includes('Over 500')) impact += 1;
    else if (responses.facility_5?.includes('301-500')) impact += 0.5;
  }

  // IP theft impact based on presence of trade secrets
  if (threat.category === 'Intellectual Property') {
    if (responses.facility_6 === 'yes') {
      const ipTypes = responses.facility_6a?.length || 0;
      impact += Math.min(ipTypes * 0.5, 2); // More IP types = higher impact
    }
  }

  // Equipment sabotage impact based on production continuity
  if (threat.id === 'equipment_sabotage' || threat.id === 'production_line_disruption') {
    if (responses.facility_4?.includes('3 shifts')) impact += 1; // 24/7 = high impact
    if (responses.emergency_3 === 'no') impact += 1; // No continuity plan
  }

  // Raw material theft based on value
  if (threat.id === 'raw_material_theft') {
    const highValueMaterials = responses.facility_7a?.length || 0;
    impact += Math.min(highValueMaterials * 0.3, 1.5);
  }

  // Hazmat theft - always critical impact
  if (threat.id === 'hazmat_theft_diversion') {
    if (responses.facility_8 === 'yes') {
      if (responses.facility_8a?.includes('Tier 1')) impact = 5;
      else if (responses.facility_8a?.includes('Tier 2')) impact = Math.max(impact, 4);
    }
  }

  return Math.min(Math.max(impact, 1), 5); // Clamp between 1-5
}

// Main risk calculation function
export function calculateManufacturingRisk(
  threat: Threat,
  responses: InterviewResponses
): RiskScore {
  const T = calculateManufacturingThreatLikelihood(threat, responses);
  const V = calculateManufacturingVulnerability(threat, responses);
  const I = calculateManufacturingImpact(threat, responses);

  const inherentRisk = T * V * I;
  const riskLevel = classifyRiskLevel(inherentRisk);

  return {
    threatLikelihood: T,
    vulnerability: V,
    impact: I,
    inherentRisk,
    riskLevel,
    calculationMethod: 'tvi'
  };
}
```

### 4.2 Production Continuity Risk Score

**Unique to Manufacturing:**

```typescript
export function calculateProductionContinuityRisk(
  assessment: Assessment,
  riskScenarios: RiskScenario[]
): ProductionContinuityScore {
  // Identify threats that could disrupt production
  const disruptiveThreats = riskScenarios.filter(scenario =>
    [
      'equipment_sabotage',
      'production_line_disruption',
      'workplace_violence_production_floor',
      'hazmat_theft_diversion'
    ].includes(scenario.threat.id)
  );

  // Calculate aggregate disruption risk
  const totalDisruptionRisk = disruptiveThreats.reduce(
    (sum, scenario) => sum + scenario.inherentRisk,
    0
  );

  // Calculate potential downtime cost
  const annualProductionValue = parseProductionValue(assessment.responses.facility_3);
  const dailyProductionValue = annualProductionValue / 365;
  
  // Estimate downtime days for each scenario
  const estimatedDowntimeDays = disruptiveThreats.map(scenario => {
    if (scenario.threat.id === 'equipment_sabotage') return 3;
    if (scenario.threat.id === 'workplace_violence_production_floor') return 2;
    if (scenario.threat.id === 'hazmat_theft_diversion') return 7;
    return 1;
  });

  const totalEstimatedDowntime = estimatedDowntimeDays.reduce((sum, days) => sum + days, 0);
  const potentialDowntimeCost = dailyProductionValue * totalEstimatedDowntime;

  // Score 0-100
  const score = Math.min((totalDisruptionRisk / 500) * 100, 100);

  return {
    score,
    level: score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW',
    disruptiveThreatsCount: disruptiveThreats.length,
    estimatedDowntimeDays: totalEstimatedDowntime,
    potentialDowntimeCost,
    annualProductionValue
  };
}
```

---

## 5. Control Selection & Recommendations

### 5.1 Control Recommendation Engine

```typescript
export function generateManufacturingControlRecommendations(
  threatId: string,
  responses: InterviewResponses
): string[] {
  const recommendations = new Set<string>();

  // PERIMETER SECURITY RECOMMENDATIONS
  if (responses.perimeter_1?.includes('no perimeter') ||
      responses.perimeter_1?.includes('under 6 feet')) {
    recommendations.add('industrial_fencing_8ft_plus');
  }
  if (responses.perimeter_2 === 'no') {
    recommendations.add('gate_access_with_guard');
  }
  if (responses.perimeter_3 === 'no') {
    recommendations.add('perimeter_intrusion_detection');
  }

  // PRODUCTION AREA RECOMMENDATIONS
  if (responses.production_1 === 'no') {
    recommendations.add('employee_badge_access_control');
    recommendations.add('access_zone_separation');
  }
  if (responses.production_2 === 'no') {
    recommendations.add('cctv_production_floor');
  }
  if (responses.production_3 === 'no') {
    recommendations.add('equipment_lockout_tagout');
  }
  if (responses.production_4 === 'no') {
    recommendations.add('tool_crib_access_control');
  }
  if (responses.production_8 === 'no') {
    recommendations.add('scrap_disposal_procedures');
  }

  // IP PROTECTION RECOMMENDATIONS
  if (responses.facility_6 === 'yes') {
    if (responses.ip_2 === 'no') {
      recommendations.add('visitor_nda_procedures');
      recommendations.add('non_disclosure_enforcement');
    }
    if (responses.ip_3 === 'no') {
      recommendations.add('clean_desk_policy');
      recommendations.add('document_control_system');
    }
    if (responses.ip_4 === 'no') {
      recommendations.add('prototype_security_procedures');
      recommendations.add('prototype_secure_storage');
    }
    if (responses.ip_5 === 'no') {
      recommendations.add('data_loss_prevention');
      recommendations.add('production_data_encryption');
    }
    if (responses.ip_6 === 'no') {
      recommendations.add('mobile_device_restrictions');
    }
    if (responses.ip_1a?.length > 0) {
      recommendations.add('r_and_d_area_access_control');
      recommendations.add('biometric_access_critical_areas');
    }
  }

  // INVENTORY CONTROL RECOMMENDATIONS
  if (responses.inventory_1 === 'no' ||
      responses.inventory_1a?.includes('no formal system')) {
    recommendations.add('raw_material_tracking_system');
    recommendations.add('manufacturing_execution_system');
  }
  if (responses.inventory_3 === 'no') {
    recommendations.add('raw_material_caging');
    recommendations.add('parts_cage_security');
  }
  if (responses.inventory_5 === 'no') {
    recommendations.add('cctv_raw_material_storage');
  }
  if (responses.inventory_7 === 'no') {
    recommendations.add('two_person_rule_sensitive_areas');
  }

  // FINISHED GOODS RECOMMENDATIONS
  if (responses.shipping_1 === 'no') {
    recommendations.add('finished_goods_caging');
  }
  if (responses.shipping_2 === 'no') {
    recommendations.add('employee_badge_access_control');
  }
  if (responses.shipping_3 === 'no') {
    recommendations.add('shipping_receiving_verification');
    recommendations.add('material_handling_procedures');
  }
  if (responses.shipping_4 === 'no') {
    recommendations.add('cctv_loading_docks');
  }

  // PERSONNEL SECURITY RECOMMENDATIONS
  if (responses.personnel_1?.includes('no background checks')) {
    recommendations.add('employee_background_checks_production');
  }
  if (responses.personnel_2 === 'no') {
    recommendations.add('contractor_background_checks');
  }
  if (responses.personnel_3 === 'no') {
    recommendations.add('insider_threat_program');
  }
  if (responses.personnel_4 === 'no') {
    recommendations.add('security_awareness_training_manufacturing');
  }
  if (responses.personnel_7 === 'no') {
    recommendations.add('non_compete_enforcement');
    recommendations.add('exit_interviews_ip_protection');
  }

  // CONTRACTOR MANAGEMENT RECOMMENDATIONS
  if (responses.contractor_1 === 'no') {
    recommendations.add('visitor_contractor_management');
  }
  if (responses.contractor_2?.includes('not escorted')) {
    recommendations.add('visitor_escort_requirements');
  }
  if (responses.contractor_4 === 'no') {
    recommendations.add('maintenance_access_procedures');
  }

  // SURVEILLANCE RECOMMENDATIONS
  if (responses.surveillance_1?.includes('0-25%') ||
      responses.surveillance_1?.includes('26-50%')) {
    recommendations.add('cctv_production_floor');
    recommendations.add('cctv_raw_material_storage');
    recommendations.add('cctv_finished_goods_warehouse');
  }
  if (responses.surveillance_2?.includes('less than 7') ||
      responses.surveillance_2?.includes('7-14')) {
    recommendations.add('video_retention_30_days');
  }
  if (responses.surveillance_4 === 'no') {
    recommendations.add('video_analytics_manufacturing');
  }
  if (responses.surveillance_5 === 'no') {
    recommendations.add('equipment_monitoring_system');
  }

  // EMERGENCY RESPONSE RECOMMENDATIONS
  if (responses.emergency_1 === 'no') {
    recommendations.add('workplace_violence_response_plan');
  }
  if (responses.emergency_3 === 'no') {
    recommendations.add('production_continuity_plan');
  }
  if (responses.emergency_4 === 'no') {
    recommendations.add('ip_theft_response_procedures');
  }
  if (responses.emergency_5 === 'no') {
    recommendations.add('sabotage_incident_response');
  }

  // Threat-specific recommendations
  const threatControlMap: Record<string, string[]> = {
    'industrial_espionage_ip_theft': [
      'r_and_d_area_access_control',
      'visitor_nda_procedures',
      'mobile_device_restrictions',
      'data_loss_prevention'
    ],
    'equipment_sabotage': [
      'equipment_lockout_tagout',
      'equipment_monitoring_system',
      'cctv_production_floor',
      'production_continuity_plan'
    ],
    'raw_material_theft': [
      'raw_material_tracking_system',
      'raw_material_caging',
      'cctv_raw_material_storage',
      'cycle_counting_program'
    ],
    'finished_goods_theft': [
      'finished_goods_caging',
      'shipping_receiving_verification',
      'cctv_loading_docks',
      'cctv_finished_goods_warehouse'
    ],
    'insider_theft_ip_data': [
      'data_loss_prevention',
      'insider_threat_program',
      'exit_interviews_ip_protection',
      'production_data_encryption'
    ],
    'insider_theft_physical': [
      'employee_badge_access_control',
      'insider_threat_program',
      'tool_crib_access_control',
      'scrap_disposal_procedures'
    ],
    'workplace_violence_production_floor': [
      'workplace_violence_response_plan',
      'employee_background_checks_production',
      'cctv_production_floor',
      'access_zone_separation'
    ],
    'contractor_vendor_exploitation': [
      'visitor_contractor_management',
      'visitor_escort_requirements',
      'contractor_background_checks',
      'maintenance_access_procedures'
    ],
    'hazmat_theft_diversion': [
      'hazmat_storage_compliance',
      'two_person_rule_sensitive_areas',
      'cctv_production_floor',
      'hazmat_incident_procedures'
    ],
    'theft_tooling_dies_molds': [
      'tool_crib_access_control',
      'asset_tracking_rfid',
      'parts_cage_security',
      'cctv_production_floor'
    ],
    'counterfeit_parts_infiltration': [
      'vehicle_inspection_procedures',
      'bill_of_materials_tracking',
      'quality_management_system',
      'visitor_contractor_management'
    ]
  };

  if (threatControlMap[threatId]) {
    threatControlMap[threatId].forEach(c => recommendations.add(c));
  }

  return Array.from(recommendations);
}
```

---

## 6. Implementation Workflow

### 6.1 Complete Assessment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: CREATE MANUFACTURING ASSESSMENT                    │
│ - Consultant selects "Manufacturing" template              │
│ - System creates assessment record                          │
│ - Manufacturing facility zones auto-created:                │
│   * Perimeter/Fence Line                                    │
│   * Parking/Yard                                            │
│   * Loading Dock                                            │
│   * Raw Material Storage                                    │
│   * Production Floor (by cell/line)                         │
│   * R&D/Engineering Lab                                     │
│   * Finished Goods Warehouse                                │
│   * Quality Control Lab                                     │
│   * Maintenance Shop/Tool Room                              │
│   * Hazmat Storage (if applicable)                          │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: CONDUCT MANUFACTURING SECURITY INTERVIEW           │
│ - 10 sections, 65+ questions                                │
│ - Progressive disclosure for follow-ups                     │
│ - Real-time risk indicator highlighting:                    │
│   * "No access control on production floor" → RED FLAG     │
│   * "No NDAs for visitors" → RED FLAG (if IP present)      │
│   * "Trade secrets present" → HIGH VALUE ASSET             │
│   * "No background checks" → RED FLAG                       │
│   * "Tools not tracked" → VULNERABILITY                     │
│ - IP protection assessment                                  │
│ - Production value and downtime cost analysis               │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: AUTO-GENERATE RISK SCENARIOS                       │
│ - System calculates T×V×I for 12-15 manufacturing threats  │
│ - Threat Likelihood:                                        │
│   * Incident history → increases likelihood                │
│   * Critical control gaps → elevates threat                │
│   * IP presence → affects espionage likelihood             │
│ - Vulnerability:                                            │
│   * Missing access controls → high vulnerability           │
│   * No IP protection measures → IP vulnerability           │
│   * Weak inventory controls → theft vulnerability          │
│ - Impact:                                                   │
│   * Annual production value → financial impact             │
│   * IP/trade secret presence → catastrophic impact         │
│   * Production disruption potential → downtime cost        │
│ - Production Continuity Risk Score (0-100)                  │
│ - Creates risk scenario records with zones                  │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: PHYSICAL WALKTHROUGH WITH AI PHOTO ANALYSIS        │
│ - Consultant photographs vulnerabilities:                   │
│   * Perimeter fence gaps or damage                          │
│   * Production floor access control                         │
│   * Raw material storage security                           │
│   * R&D area protection measures                            │
│   * Finished goods warehouse layout                         │
│   * Tool crib security                                      │
│   * Prototype storage areas                                 │
│   * Equipment access controls                               │
│ - AI photo analysis identifies:                             │
│   * "No access control visible on production entrance"      │
│   * "High-value materials stored without caging"            │
│   * "R&D area lacks physical barriers"                      │
│   * "Prototypes visible and unsecured"                      │
│   * "Tools accessible without controls"                     │
│   * "Production processes visible from entry"               │
│ - Associates photos with risk scenarios automatically       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: AI-GENERATED RISK NARRATIVES                       │
│ - System generates professional descriptions:               │
│   * "Industrial Espionage" scenario:                        │
│     "This facility manufactures proprietary automotive      │
│     components using patented processes. Current            │
│     vulnerabilities include lack of NDA enforcement for     │
│     visitors, no R&D area access control, and unrestricted  │
│     photography in production areas. Combined with visible  │
│     processes from public areas, this creates significant   │
│     opportunity for competitor intelligence gathering."     │
│ - Consultant reviews and refines AI-generated text          │
│ - Adds production-specific observations                     │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: SELECT CONTROLS & CALCULATE RESIDUAL RISK          │
│ - System recommends controls from interview gaps:           │
│   * R&D access control (missing) → Priority 1               │
│   * Production floor CCTV (missing) → Priority 1            │
│   * Raw material tracking (missing) → Priority 1            │
│   * NDA enforcement (missing) → Priority 1 (if IP)          │
│ - Consultant selects applicable controls                    │
│ - Marks implementation status (existing/proposed)           │
│ - Sets fidelity for existing controls (25-100%)             │
│ - Real-time residual risk calculation updates               │
│ - Production downtime cost analysis                         │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: GENERATE PROFESSIONAL PDF REPORT                   │
│ - Executive summary with production continuity risk score   │
│ - Risk scenarios with AI-generated descriptions             │
│ - Photos with AI analysis annotations                       │
│ - Control recommendations with ROI justification            │
│ - IP protection vulnerability assessment                    │
│ - Production downtime cost analysis                         │
│ - Implementation roadmap                                    │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Manufacturing-Specific Workflow Enhancements

**Production Continuity Focus:**
- Automated production downtime cost calculation
- Disruption-capable threat identification
- Continuity plan gap analysis
- Single point of failure assessment

**IP Protection Assessment:**
- Trade secret classification review
- R&D area security evaluation
- Document control assessment
- Data exfiltration vulnerability scoring

**Insider Threat Profiling:**
- Employee vetting analysis
- Access level risk assessment
- Termination procedure review
- Exit interview IP return verification

---

## 7. API Integration Specifications

### 7.1 Core API Endpoints

**Assessment Management:**
```typescript
// Create manufacturing assessment
POST /api/assessments/create
{
  templateType: 'manufacturing',
  siteName: 'Acme Manufacturing Plant',
  address: {...},
  consultantId: 123
}

// Get assessment with interview responses
GET /api/assessments/[id]
Response: {
  assessment: {...},
  interviewResponses: {...},
  facilityZones: [...],
  riskScenarios: [...],
  productionContinuityScore: {...}
}
```

**Interview Management:**
```typescript
// Save interview responses
POST /api/assessments/[id]/interview/save
{
  section: 'production_area_security',
  responses: {
    production_1: 'no',
    production_2: 'yes',
    production_2a: '51-75%',
    ...
  }
}

// Get interview progress with risk indicators
GET /api/assessments/[id]/interview/progress
Response: {
  totalQuestions: 65,
  answeredQuestions: 52,
  sectionsComplete: 8,
  sectionsTotal: 10,
  riskIndicatorCount: 12,
  criticalGaps: [
    "No access control on production floor",
    "No NDAs for visitors (IP present)",
    "Tools not tracked"
  ]
}
```

**Risk Scenario Generation:**
```typescript
// Auto-generate manufacturing risk scenarios
POST /api/assessments/[id]/generate-risks
{
  useAI: true,
  includePhotos: true
}

Response: {
  scenariosCreated: 15,
  criticalRiskCount: 3,
  highRiskCount: 6,
  mediumRiskCount: 4,
  lowRiskCount: 2,
  productionContinuityScore: {
    score: 78,
    level: 'HIGH',
    estimatedDowntimeDays: 12,
    potentialDowntimeCost: 850000
  }
}
```

**AI Integration Endpoints:**
```typescript
// AI Photo Analysis (Manufacturing Context)
POST /api/photos/[photoId]/analyze
{
  context: 'manufacturing_production_floor',
  focusAreas: [
    'access_control',
    'equipment_security',
    'material_storage',
    'ip_visibility'
  ]
}

Response: {
  summary: "Production floor showing CNC machines and assembly area...",
  detectedObjects: [
    'cnc_machines',
    'assembly_stations',
    'material_bins',
    'forklift',
    'no_access_control_visible',
    'no_cameras_visible'
  ],
  securityObservations: [
    "No visible access control at production entrance",
    "High-value equipment accessible without barriers",
    "Material storage lacks organized security",
    "No CCTV cameras detected in this area",
    "Production process visible from walkway"
  ],
  ipRisks: [
    "Manufacturing process visible to unauthorized viewers",
    "No barriers preventing photography of equipment",
    "Proprietary tooling exposed"
  ],
  recommendations: [
    "Install badge reader at production entrance",
    "Add CCTV coverage of production floor",
    "Implement material caging for high-value items",
    "Add visual barriers for IP-sensitive processes"
  ],
  vulnerabilityScore: 8
}

// AI Narrative Generation (Manufacturing-Specific)
POST /api/risk-scenarios/[id]/generate-narrative
{
  includePhotos: true,
  includeProductionImpact: true,
  includeIPAnalysis: true,
  tone: 'professional'
}

Response: {
  description: "Professional manufacturing risk narrative...",
  currentState: "Current production security assessment...",
  vulnerabilityAnalysis: "Specific vulnerabilities in manufacturing context...",
  ipExposure: "Intellectual property risk analysis...",
  productionImpact: "Potential production disruption analysis...",
  potentialConsequences: "Financial and operational impact...",
  recommendations: "Manufacturing-specific control recommendations..."
}
```

**Production Continuity Analysis:**
```typescript
// Calculate production continuity risk
GET /api/assessments/[id]/production-continuity
Response: {
  score: 78,
  level: 'HIGH',
  disruptiveThreatsCount: 4,
  estimatedDowntimeDays: 12,
  potentialDowntimeCost: 850000,
  annualProductionValue: 25000000,
  criticalSinglePointsOfFailure: [
    'Main production line control system',
    'Raw material receiving dock'
  ],
  recommendations: [
    'Implement production continuity plan',
    'Add redundancy to critical systems',
    'Enhance equipment monitoring'
  ]
}
```

**Control Management:**
```typescript
// Get recommended controls for manufacturing risk
GET /api/risk-scenarios/[id]/suggested-controls
Response: {
  gapBasedControls: [
    {
      control: {...},
      reason: "Interview indicates no access control on production floor",
      priority: 1,
      riskReduction: 35
    },
    {
      control: {...},
      reason: "R&D area lacks biometric access (IP present)",
      priority: 1,
      riskReduction: 42
    }
  ],
  threatBasedControls: [
    {
      control: {...},
      reason: "Critical for industrial espionage prevention",
      priority: 1,
      riskReduction: 40
    }
  ]
}
```

**PDF Report Generation:**
```typescript
// Generate manufacturing security report
POST /api/assessments/[id]/generate-report
{
  includeInterview: true,
  includePhotos: true,
  includeIPAnalysis: true,
  includeProductionContinuityAnalysis: true,
  includeROICalculation: true
}

Response: {
  reportUrl: '/reports/manufacturing-assessment-456.pdf',
  pageCount: 52,
  generatedAt: '2025-11-20T15:45:00Z'
}
```

---

## 8. UI Components

### 8.1 Manufacturing Assessment Dashboard

**Component:** `ManufacturingAssessmentDashboard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Factory, ShieldAlert, Lock, TrendingDown, DollarSign } from 'lucide-react';

export function ManufacturingAssessmentDashboard({ assessment }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Production Continuity Risk</CardTitle>
            <Factory className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">High</div>
            <p className="text-xs text-muted-foreground">Score: 78/100</p>
            <p className="text-xs text-muted-foreground mt-1">12 days potential downtime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">IP Protection</CardTitle>
            <Lock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Vulnerable</div>
            <p className="text-xs text-muted-foreground">7 trade secrets at risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Production Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$25M</div>
            <p className="text-xs text-muted-foreground">Annual output</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Downtime Cost Exposure</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$850K</div>
            <p className="text-xs text-muted-foreground">Potential loss</p>
          </CardContent>
        </Card>
      </div>

      {/* Interview Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Manufacturing Security Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Progress</span>
              <span className="text-sm font-medium">52/65 questions</span>
            </div>
            <Progress value={80} className="h-2" />
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="destructive">12 Red Flags</Badge>
              <Badge variant="outline">7 Trade Secrets</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">No access control on production floor</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">No NDA enforcement for visitors (IP present)</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">R&D area lacks biometric access</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">High-value materials not caged</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="border-orange-500">High</Badge>
              <span className="text-sm">No data loss prevention system</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* IP Protection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Intellectual Property at Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Proprietary formulas</span>
              <Badge variant="destructive">Exposed</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Patented processes</span>
              <Badge variant="destructive">Exposed</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Custom tooling/dies</span>
              <Badge variant="outline" className="border-orange-500">Moderate Risk</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Proprietary software</span>
              <Badge variant="outline" className="border-green-500">Protected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 8.2 Production Continuity Risk Meter

**Component:** `ProductionContinuityMeter.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

export function ProductionContinuityMeter({ continuityScore }) {
  const getColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getGaugeColor = (score: number) => {
    if (score >= 75) return '#dc2626';
    if (score >= 50) return '#ea580c';
    if (score >= 25) return '#ca8a04';
    return '#16a34a';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5" />
          Production Continuity Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gauge Visualization */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 mb-4">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 20 80 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                {/* Score arc */}
                <path
                  d={`M 20 80 A 80 80 0 0 1 ${20 + (160 * continuityScore.score / 100)} ${80 - Math.sin(Math.PI * continuityScore.score / 100) * 80}`}
                  fill="none"
                  stroke={getGaugeColor(continuityScore.score)}
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Score text */}
                <text
                  x="100"
                  y="70"
                  textAnchor="middle"
                  className="text-3xl font-bold"
                  fill={getGaugeColor(continuityScore.score)}
                >
                  {continuityScore.score}
                </text>
              </svg>
            </div>
            <div className={`text-2xl font-bold ${getColor(continuityScore.score)}`}>
              {continuityScore.level} RISK
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                Disruptive Threats
              </div>
              <div className="text-2xl font-bold">
                {continuityScore.disruptiveThreatsCount}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Est. Downtime
              </div>
              <div className="text-2xl font-bold">
                {continuityScore.estimatedDowntimeDays} days
              </div>
            </div>

            <div className="space-y-1 col-span-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Potential Downtime Cost
              </div>
              <div className="text-3xl font-bold text-red-600">
                ${(continuityScore.potentialDowntimeCost / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Based on ${(continuityScore.annualProductionValue / 1000000).toFixed(1)}M annual production
              </p>
            </div>
          </div>

          {/* Key Risks */}
          {continuityScore.score >= 50 && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Primary Disruption Risks:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Equipment sabotage potential</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>No production continuity plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span>Single points of failure not protected</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 8.3 IP Protection Vulnerability Matrix

**Component:** `IPProtectionMatrix.tsx`

```typescript
export function IPProtectionMatrix({ assessment, ipTypes }) {
  const protectionLevels = {
    'r_and_d_access': {
      name: 'R&D Access Control',
      status: assessment.responses.ip_1a ? 'implemented' : 'missing',
      criticality: 'critical'
    },
    'nda_enforcement': {
      name: 'NDA Enforcement',
      status: assessment.responses.ip_2 === 'yes' ? 'implemented' : 'missing',
      criticality: 'critical'
    },
    'clean_desk': {
      name: 'Clean Desk Policy',
      status: assessment.responses.ip_3 === 'yes' ? 'implemented' : 'missing',
      criticality: 'high'
    },
    'prototype_security': {
      name: 'Prototype Security',
      status: assessment.responses.ip_4 === 'yes' ? 'implemented' : 'missing',
      criticality: 'high'
    },
    'dlp_system': {
      name: 'Data Loss Prevention',
      status: assessment.responses.ip_5 === 'yes' ? 'implemented' : 'missing',
      criticality: 'critical'
    },
    'mobile_restrictions': {
      name: 'Mobile Device Restrictions',
      status: assessment.responses.ip_6 === 'yes' ? 'implemented' : 'missing',
      criticality: 'high'
    }
  };

  const criticalMissing = Object.values(protectionLevels).filter(
    p => p.status === 'missing' && p.criticality === 'critical'
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            IP Protection Vulnerability Matrix
          </span>
          {criticalMissing > 0 && (
            <Badge variant="destructive">
              {criticalMissing} Critical Gaps
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* IP Types Present */}
          <div>
            <h4 className="font-medium text-sm mb-2">Intellectual Property Present:</h4>
            <div className="flex flex-wrap gap-2">
              {ipTypes.map((type, i) => (
                <Badge key={i} variant="outline" className="border-blue-500">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Protection Controls Matrix */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm mb-2">Protection Controls:</h4>
            {Object.entries(protectionLevels).map(([key, control]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  {control.status === 'implemented' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">{control.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={control.criticality === 'critical' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {control.criticality}
                  </Badge>
                  <Badge
                    variant={control.status === 'implemented' ? 'default' : 'outline'}
                    className={
                      control.status === 'implemented'
                        ? 'bg-green-100 text-green-800'
                        : 'border-red-500 text-red-600'
                    }
                  >
                    {control.status === 'implemented' ? '✓ Active' : '✗ Missing'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              {criticalMissing > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Critical IP Exposure</p>
                    <p className="text-sm text-muted-foreground">
                      {criticalMissing} critical protection{criticalMissing > 1 ? 's' : ''} missing. 
                      Trade secrets and proprietary processes are vulnerable to theft.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">IP Protections in Place</p>
                    <p className="text-sm text-muted-foreground">
                      All critical IP protection controls are implemented.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 8.4 AI Photo Analysis (Manufacturing Context)

**Component:** `ManufacturingPhotoAnalysis.tsx`

Enhanced for manufacturing-specific observations:
- Production floor layout and access control
- Material storage security
- R&D area protection
- IP visibility assessment
- Equipment security
- Tool and parts security

```typescript
export function ManufacturingPhotoAnalysis({ photo, analysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Security Analysis - {photo.zone}</span>
          <Badge variant="outline">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Photo with Vulnerability Badge */}
          <div className="relative">
            <img src={photo.url} alt={photo.caption} className="rounded-lg" />
            {analysis.vulnerabilityScore >= 7 && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                High Risk
              </Badge>
            )}
            {analysis.ipRisks && analysis.ipRisks.length > 0 && (
              <Badge className="absolute top-2 left-2 bg-orange-500">
                IP Exposure
              </Badge>
            )}
          </div>

          {/* AI Summary */}
          <div>
            <h4 className="font-medium text-sm mb-1">Summary</h4>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </div>

          {/* Security Observations */}
          {analysis.securityObservations.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Security Observations</h4>
              <ul className="space-y-1">
                {analysis.securityObservations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* IP Risks (Manufacturing-Specific) */}
          {analysis.ipRisks && analysis.ipRisks.length > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-orange-600" />
                Intellectual Property Risks
              </h4>
              <ul className="space-y-1">
                {analysis.ipRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-600 mt-1.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">AI Recommendations</h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => linkToRiskScenario(photo, analysis)}>
              <Link className="h-3 w-3 mr-1" />
              Link to Risk Scenario
            </Button>
            <Button size="sm" variant="outline" onClick={() => editAnalysis(analysis)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit Analysis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 9. PDF Report Template

### 9.1 Manufacturing Security Report Structure

**Template File:** `server/templates/manufacturing-security-report.tsx`

```typescript
interface ManufacturingSecurityReport {
  // Cover Page
  facilityName: string;
  address: string;
  assessmentDate: Date;
  consultantName: string;
  productionContinuityScore: number; // 0-100
  ipVulnerabilityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  // Executive Summary (3-4 pages)
  executiveSummary: {
    facilityOverview: string;
    keyFindings: string[];
    criticalVulnerabilities: string[];
    productionContinuityRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    ipProtectionStatus: 'ADEQUATE' | 'MODERATE' | 'VULNERABLE' | 'CRITICAL';
    recommendedInvestment: number;
    projectedROI: number;
    topPriorities: string[];
  };

  // Facility Profile (2-3 pages)
  facilityProfile: {
    manufacturingType: string;
    squareFootage: number;
    annualProductionValue: number;
    employeeCount: number;
    shiftOperations: string;
    intellectualPropertyTypes: string[];
    highValueMaterials: string[];
    hazmatPresent: boolean;
    cfatsTier: string | null;
  };

  // Production Continuity Analysis (3-4 pages)
  productionContinuityAnalysis: {
    score: number;
    riskLevel: string;
    disruptiveThreats: Array<{ threat: string; likelihood: number; downtime: number }>;
    estimatedTotalDowntime: number;
    potentialDowntimeCost: number;
    criticalSinglePointsOfFailure: string[];
    continuityPlanStatus: 'COMPREHENSIVE' | 'BASIC' | 'INADEQUATE' | 'MISSING';
    recommendations: string[];
  };

  // IP Protection Assessment (3-4 pages)
  ipProtectionAssessment: {
    ipTypesPresent: string[];
    protectionControls: Array<{
      control: string;
      status: 'IMPLEMENTED' | 'PARTIAL' | 'MISSING';
      criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    }>;
    criticalGaps: string[];
    espionageRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    rdAreaSecurity: { score: number; findings: string[] };
    documentControlScore: number;
    dataLossPreventionScore: number;
    visitorManagementScore: number;
  };

  // Interview Summary (3-4 pages)
  interviewSummary: {
    sectionsCompleted: number;
    totalQuestions: number;
    redFlags: Array<{ question: string; response: string; concern: string }>;
    strengthsIdentified: string[];
    gapsIdentified: string[];
  };

  // Risk Scenarios (12-18 pages)
  riskScenarios: Array<{
    threat: string;
    description: string; // AI-generated
    likelihood: number;
    vulnerability: number;
    impact: number;
    inherentRisk: number;
    riskLevel: string;
    productionImpact: string; // Downtime, cost
    photos: Array<{ url: string; caption: string; aiAnalysis?: string }>;
    currentControls: Array<{ name: string; effectiveness: number }>;
    proposedControls: Array<{ name: string; cost: number; reduction: number }>;
    residualRisk: number;
  }>;

  // Production Floor Security Analysis (2-3 pages)
  productionFloorAnalysis: {
    accessControlStatus: string;
    cctvCoverage: number; // percentage
    equipmentSecurity: string;
    toolControlSystem: string;
    materialStorageSecurity: string;
    supervisionLevels: string;
    findings: string[];
    recommendations: string[];
  };

  // Raw Material & Inventory Security (2-3 pages)
  inventorySecurityAnalysis: {
    trackingSystemStatus: string;
    cycleCounting Frequency: string;
    highValueStorageSecurity: string;
    receiv ingVerification: string;
    shrinkageRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    findings: string[];
    recommendations: string[];
  };

  // Finished Goods & Shipping Security (2-3 pages)
  shippingSecurityAnalysis: {
    warehouseAccessControl: string;
    loadingDockSecurity: string;
    manifestVerification: string;
    driverManagement: string;
    inventoryAccuracy: string;
    findings: string[];
    recommendations: string[];
  };

  // Personnel & Insider Threat Analysis (2-3 pages)
  personnelSecurityAnalysis: {
    backgroundCheckStatus: string;
    insiderThreatProgramStatus: string;
    securityAwarenessTraining: string;
    terminationProcedures: string;
    accessRevocationProcess: string;
    insiderThreatRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    findings: string[];
    recommendations: string[];
  };

  // Control Recommendations (4-5 pages)
  controlRecommendations: {
    priority1: Array<{ control: string; reason: string; cost: number; roi: string }>;
    priority2: Array<{ control: string; reason: string; cost: number; roi: string }>;
    priority3: Array<{ control: string; reason: string; cost: number; roi: string }>;
    quickWins: Array<{ control: string; reason: string; cost: number }>;
  };

  // ROI Analysis (2-3 pages)
  roiAnalysis: {
    currentRiskExposure: number;
    proposedInvestment: number;
    projectedRiskReduction: number;
    productionDowntimeSavings: number;
    ipProtectionValue: number;
    paybackPeriod: number;
    threeYearROI: number;
  };

  // Implementation Roadmap (2 pages)
  implementationRoadmap: {
    phase1: { timeline: string; controls: string[]; cost: number };
    phase2: { timeline: string; controls: string[]; cost: number };
    phase3: { timeline: string; controls: string[]; cost: number };
    quickWins: { timeline: string; controls: string[]; cost: number };
  };

  // Appendices
  appendices: {
    interviewQuestionnaire: any;
    controlLibrary: any;
    manufacturingBestPractices: string[];
    industryBenchmarks: any;
    complianceRequirements: string[];
  };
}
```

### 9.2 Production Continuity Risk Scoring Algorithm

**Displayed prominently in executive summary:**

```typescript
function calculateProductionContinuityRiskScore(assessment: Assessment): number {
  let score = 0;
  const maxScore = 100;

  // Production Value Risk (20 points)
  const productionValue = parseProductionValue(assessment.responses.facility_3);
  if (productionValue > 500000000) score += 20; // >$500M
  else if (productionValue > 100000000) score += 15; // $100M-$500M
  else if (productionValue > 25000000) score += 10; // $25M-$100M
  else score += 5;

  // Control Gaps - Production Disruption (30 points)
  const disruptionControls = [
    { response: 'production_3', missing: 'no', points: 8 }, // Equipment not secured
    { response: 'surveillance_5', missing: 'no', points: 6 }, // No equipment monitoring
    { response: 'emergency_3', missing: 'no', points: 10 }, // No continuity plan
    { response: 'emergency_5', missing: 'no', points: 6 } // No sabotage response
  ];

  disruptionControls.forEach(control => {
    if (assessment.responses[control.response] === control.missing) {
      score += control.points;
    }
  });

  // Shift Operations Risk (10 points)
  if (assessment.responses.facility_4?.includes('3 shifts')) {
    score += 10; // 24/7 = high disruption impact
  } else if (assessment.responses.facility_4?.includes('2 shifts')) {
    score += 6;
  }

  // Recent Security Incidents (15 points)
  const incidents = assessment.responses.emergency_2 || [];
  if (incidents.includes('Equipment sabotage')) score += 10;
  if (incidents.includes('Workplace violence')) score += 5;

  // Access Control Gaps (10 points)
  if (assessment.responses.production_1 === 'no') score += 5;
  if (assessment.responses.production_6?.includes('minimal')) score += 5;

  // Surveillance Gaps (10 points)
  if (assessment.responses.surveillance_1?.includes('0-25%') ||
      assessment.responses.surveillance_1?.includes('26-50%')) {
    score += 10;
  } else if (assessment.responses.surveillance_1?.includes('51-75%')) {
    score += 5;
  }

  // Hazmat Present (5 points)
  if (assessment.responses.facility_8 === 'yes') {
    if (assessment.responses.facility_8a?.includes('Tier 1')) score += 5;
    else if (assessment.responses.facility_8a?.includes('Tier 2')) score += 3;
  }

  return Math.min(score, maxScore);
}

// Risk Level Classification
function classifyProductionContinuityRisk(score: number): string {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}
```

### 9.3 IP Vulnerability Scoring Algorithm

```typescript
function calculateIPVulnerabilityScore(assessment: Assessment): number {
  let score = 0;
  const maxScore = 100;

  // IP Present? (Base requirement)
  if (assessment.responses.facility_6 !== 'yes') {
    return 0; // No IP = no IP vulnerability
  }

  // Types of IP Present (20 points)
  const ipTypes = assessment.responses.facility_6a?.length || 0;
  score += Math.min(ipTypes * 3, 20);

  // Critical IP Protection Gaps (60 points total)
  const criticalControls = [
    { response: 'ip_1a', hasValue: true, points: 10 }, // R&D access control
    { response: 'ip_2', value: 'no', points: 12 }, // No NDAs
    { response: 'ip_5', value: 'no', points: 15 }, // No DLP
    { response: 'ip_6', value: 'no', points: 8 }, // Mobile devices not restricted
    { response: 'production_5', value: 'no', points: 10 }, // Photography allowed
    { response: 'ip_3', value: 'no', points: 5 } // No clean desk
  ];

  criticalControls.forEach(control => {
    if (control.hasValue) {
      if (!assessment.responses[control.response]) score += control.points;
    } else {
      if (assessment.responses[control.response] === control.value) score += control.points;
    }
  });

  // Visitor/Contractor Access (10 points)
  if (assessment.responses.contractor_2?.includes('not escorted')) score += 10;

  // Recent IP Theft Incidents (10 points)
  const incidents = assessment.responses.emergency_2 || [];
  if (incidents.includes('Intellectual property theft') ||
      incidents.includes('Industrial espionage')) {
    score += 10;
  }

  return Math.min(score, maxScore);
}

function classifyIPVulnerability(score: number): string {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}
```

### 9.4 Report Visual Elements

**Key visual components in the PDF:**

1. **Production Continuity Risk Gauge** (cover page + executive summary)
   - Speedometer showing 0-100 score
   - Color zones: green (0-25), yellow (26-50), orange (51-75), red (76-100)
   - Downtime days and cost annotations

2. **IP Protection Matrix** (IP assessment section)
   - Grid showing IP types vs. protection controls
   - Color-coded: green (protected), yellow (partial), red (exposed)
   - Critical gap highlighting

3. **Production Floor Heat Map** (facility analysis section)
   - Visual facility layout with security zones
   - Color-coded areas by vulnerability score
   - CCTV coverage overlay

4. **Risk Matrix** (risk scenarios section)
   - Plot all threats by T×V
   - Before/after comparison showing residual risk

5. **Downtime Cost Timeline** (ROI section)
   - Bar chart showing potential losses by threat
   - Cumulative downtime calculation
   - Investment vs. savings comparison

6. **Zone-Based Photo Documentation**
   - Organized by facility zone
   - AI analysis annotations
   - IP visibility indicators

---

## 10. Implementation Roadmap

### 10.1 17-Day Development Sprint

**Pre-Development (Day 0):**
```
Tasks:
- Review complete manufacturing framework document
- Set up Replit environment with PostgreSQL
- Create project structure
- Install dependencies
```

---

### **Week 1: Foundation & Interview System (Days 1-7)**

#### **Day 1-2: Database Schema & Seed Data**
**AI Prompt (Day 1):**
```
Create manufacturing-specific database extensions:
1. Add manufacturingProfile to assessments table (JSON):
   - manufacturingType, annualProductionValue
   - intellectualPropertyTypes[], highValueMaterials[]
   - shiftOperations, hazmatPresent, cfatsTier
2. Add productionContinuityScore table:
   - id, assessmentId, score, level, estimatedDowntime, potentialCost
3. Add ipProtectionScore table:
   - id, assessmentId, score, level, criticalGaps[]
4. Generate migration and apply
```

**AI Prompt (Day 2):**
```
Create seed data for manufacturing template:
1. 15 manufacturing-specific threats
2. 70+ manufacturing controls
3. Create 'manufacturing' template with associations
4. Add facility zones (10 zones)
5. Run seed script
```

---

#### **Day 3-5: Manufacturing Security Interview**
**AI Prompt (Day 3):**
```
Create manufacturing interview questionnaire:
server/data/manufacturing-interview-questionnaire.ts

Include all 10 sections with 65+ questions:
1. Facility & Production Profile (8 questions)
2. Perimeter & Access Security (7 questions)
3. Production Area Security (8 questions)
4. Intellectual Property Protection (7 questions)
5. Raw Material & Inventory Control (7 questions)
6. Finished Goods & Shipping Security (6 questions)
7. Personnel Security (7 questions)
8. Contractor & Vendor Management (5 questions)
9. Surveillance & Monitoring (5 questions)
10. Emergency Response & Incident History (6 questions)

Each question must have risk mapping.
```

**AI Prompt (Day 4):**
```
Create interview UI:
app/assessments/[id]/interview/page.tsx

Features:
1. Section navigation
2. Progressive disclosure
3. Real-time risk indicators:
   - "No production floor access control" → RED FLAG
   - "Trade secrets present" → HIGH VALUE indicator
   - "No NDAs" → RED FLAG (if IP present)
4. Auto-save
5. Progress tracking
```

**AI Prompt (Day 5):**
```
Create interview API routes:
1. POST /api/assessments/[id]/interview/save
2. GET /api/assessments/[id]/interview/progress
3. POST /api/assessments/[id]/ip-types/update
```

---

#### **Day 6-7: Risk Mapping & Auto-Generation**
**AI Prompt (Day 6):**
```
Create manufacturing risk mapping service:
server/services/manufacturing-risk-mapper.ts

Implement:
1. calculateThreatLikelihood() - IP presence, incident history
2. calculateVulnerability() - control gaps, IP protection, inventory security
3. calculateImpact() - production value, IP types, downtime potential
4. calculateProductionContinuityRisk()
5. calculateIPVulnerabilityScore()
```

**AI Prompt (Day 7):**
```
Create risk auto-generation endpoint:
POST /api/assessments/[id]/generate-risks

Include:
- 12-15 manufacturing risk scenarios
- Production continuity score
- IP vulnerability score
```

---

### **Week 2: AI Integration & Advanced Features (Days 8-14)**

#### **Day 8-9: AI Photo Analysis (Manufacturing)**
**AI Prompt (Day 8):**
```
Create manufacturing photo analysis service:
server/services/manufacturing-photo-analysis.ts

Manufacturing-specific contexts:
1. Production floor: access control, equipment security, process visibility
2. Raw material storage: caging, organization, CCTV
3. R&D area: barriers, access control, IP visibility
4. Finished goods: warehouse security, organization
5. Tool room: tool control, access
6. Perimeter: fence condition, gates, lighting

Return:
- summary
- detectedObjects[]
- securityObservations[]
- ipRisks[] (NEW - manufacturing specific)
- recommendations[]
- vulnerabilityScore
```

**AI Prompt (Day 9):**
```
Create manufacturing photo analysis UI:
components/ManufacturingPhotoAnalysis.tsx

Features:
1. Zone-specific analysis
2. IP exposure indicators
3. Production continuity impact
4. Link to relevant scenarios
```

---

#### **Day 10-11: AI Narrative Generation**
**AI Prompt (Day 10):**
```
Create manufacturing narrative generator:
server/services/manufacturing-narrative-generator.ts

Generate:
1. Risk description with manufacturing context
2. Current state with production implications
3. IP exposure analysis (if relevant)
4. Production downtime impact
5. Control recommendations with ROI
```

**AI Prompt (Day 11):**
```
Create narrative generation UI with:
- Manufacturing-specific tone options
- IP analysis toggle
- Production impact toggle
```

---

#### **Day 12-13: Advanced Components**
**AI Prompt (Day 12):**
```
Create manufacturing-specific components:
1. ProductionContinuityMeter component
2. IPProtectionMatrix component  
3. ManufacturingAssessmentDashboard
```

**AI Prompt (Day 13):**
```
Create control recommendation engine:
server/services/manufacturing-control-recommender.ts

Include:
- Gap-based recommendations
- Threat-based recommendations
- IP-specific recommendations
- Production continuity enhancements
- ROI calculations
```

---

#### **Day 14: Integration & Testing**
**Tasks:**
- Integrate all components
- Test end-to-end workflow
- Fix bugs
- Performance optimization

---

### **Week 3: PDF Reports & Final Testing (Days 15-17)**

#### **Day 15-16: PDF Report Generation**
**AI Prompt (Day 15):**
```
Create manufacturing PDF template:
server/templates/manufacturing-security-report.tsx

Sections:
1. Cover with production continuity gauge
2. Executive summary (3-4 pages)
3. Facility profile (2-3 pages)
4. Production continuity analysis (3-4 pages)
5. IP protection assessment (3-4 pages)
6. Interview summary (3-4 pages)
7. Risk scenarios (12-18 pages)
8. Production floor analysis (2-3 pages)
9. Inventory security (2-3 pages)
10. Shipping security (2-3 pages)
11. Personnel security (2-3 pages)
12. Control recommendations (4-5 pages)
13. ROI analysis (2-3 pages)
14. Implementation roadmap (2 pages)
15. Appendices

Visual elements:
- Production continuity gauge
- IP protection matrix
- Production floor heat map
- Risk matrix
- Downtime cost timeline
```

**AI Prompt (Day 16):**
```
Implement report generator:
server/services/manufacturing-report-generator.ts

Process:
1. Fetch all data
2. Calculate scores
3. Generate AI narratives
4. Compile report structure
5. Render HTML
6. Generate PDF
```

---

#### **Day 17: Final Testing & Polish**
**Tasks:**
- Complete end-to-end test
- Create demo manufacturing assessment
- Performance optimization
- Documentation
- Bug fixes

---

### 10.2 Integration Checklist

**Before Launch:**
- [ ] Manufacturing interview (10 sections, 65+ questions)
- [ ] Interview UI with risk indicators
- [ ] Auto-save functionality
- [ ] Risk mapping algorithms (manufacturing-specific T×V×I)
- [ ] Production continuity score calculation
- [ ] IP vulnerability score calculation
- [ ] Auto-generation of 12-15 risk scenarios
- [ ] AI photo analysis (manufacturing contexts)
- [ ] IP exposure detection in photos
- [ ] AI narrative generation
- [ ] Production continuity meter component
- [ ] IP protection matrix component
- [ ] Manufacturing dashboard
- [ ] Control recommendation engine
- [ ] Complete PDF report template
- [ ] Visual elements (gauges, heat maps, charts)
- [ ] End-to-end testing
- [ ] Demo assessment created

---

## Conclusion

This comprehensive Manufacturing Facility Security Assessment Framework provides:

1. **65+ structured questions** across 10 sections capturing production security, IP protection, and supply chain vulnerabilities
2. **Automated risk calculation** using T×V×I with manufacturing-specific adjustments
3. **Production Continuity Risk Score** - quantifying downtime exposure and disruption costs
4. **IP Vulnerability Score** - assessing trade secret and proprietary process protection
5. **AI-powered insights** through intelligent photo analysis and narrative generation  
6. **Professional PDF reports** with production continuity analysis, IP assessment, and ROI justification
7. **Seamless integration** with RiskFixer Master Framework v2.1

The system transforms manufacturing security consulting from subjective walkthroughs into data-driven, mathematically rigorous assessments that justify security investments through production continuity protection and IP safeguarding.

**Key Differentiators:**
- **Production continuity risk scoring** - Quantifies downtime exposure (0-100 score)
- **IP protection vulnerability matrix** - Systematic trade secret risk assessment
- **Downtime cost analysis** - ROI justification based on production value
- **Manufacturing-specific AI analysis** - IP visibility detection, process exposure assessment
- **Insider threat profiling** - Employee vetting and access control evaluation

This framework establishes RiskFixer as the premier tool for manufacturing facility security assessments, addressing the unique challenges of production environments, intellectual property protection, and supply chain security.

---

**END OF MANUFACTURING FACILITY SECURITY ASSESSMENT FRAMEWORK**
