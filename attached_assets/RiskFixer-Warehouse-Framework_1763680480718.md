# RiskFixer: Warehouse & Distribution Center Security Assessment Framework
## Comprehensive Specification for Logistics Facility Security

**Version:** 1.0  
**Integration Target:** RiskFixer Master Framework v2.0  
**Focus:** Warehouse, Distribution Center, and 3PL Facility Assessments  
**Last Updated:** November 20, 2025

---

## Table of Contents

1. [Warehouse Assessment Overview](#1-warehouse-assessment-overview)
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

## 1. Warehouse Assessment Overview

### 1.1 What Makes Warehouse Assessments Unique

**Standard Physical Security Assessment:**
- Generic facility protection
- Static perimeter security
- Office-centric thinking

**Warehouse Security Assessment:**
- **Cargo theft prevention** - The #1 threat facing logistics facilities
- **Loading dock vulnerability** - The most exploited entry point
- **Supply chain security** - Vendor/driver access management
- **High-value inventory concentration** - Target-rich environment
- **Insider threat** - Employee/driver collusion is common
- **24/7 operations** - Continuous activity, night shift vulnerabilities
- **Yard security** - Large footprint, parked trailers are targets
- **Inventory control** - Shrinkage tracking and prevention
- **Fleet/vehicle security** - Company assets and hijacking risk

### 1.2 Assessment Components

```
Warehouse Security Assessment = 
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. FACILITY & OPERATIONS PROFILE                            │
  │    - Warehouse type (3PL, distribution, cold storage)       │
  │    - Square footage and inventory value                     │
  │    - Employee/contractor population                         │
  │    - Operating hours and shift patterns                     │
  │    - High-value product lines                               │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. SECURITY INTERVIEW (9 Sections, 55+ Questions)          │
  │    - Cargo theft incident history                           │
  │    - Loading dock procedures and security                   │
  │    - Inventory shrinkage and control                        │
  │    - Perimeter and yard security                            │
  │    - Personnel vetting and access control                   │
  │    - Vehicle/fleet management                               │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. PHYSICAL SECURITY WALKTHROUGH                            │
  │    - Fence line condition and gaps                          │
  │    - Gate access control effectiveness                      │
  │    - Loading dock observations                              │
  │    - Yard lighting and visibility                           │
  │    - Surveillance coverage and blind spots                  │
  │    - Inventory storage security measures                    │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. AUTO-GENERATED RISK SCENARIOS (10-12 Threats)           │
  │    - Cargo theft (full truckload)                           │
  │    - Cargo theft (pilferage)                                │
  │    - Loading dock breach                                    │
  │    - Insider theft (employee/driver collusion)              │
  │    - Yard/trailer theft                                     │
  │    - Vehicle/fleet theft                                    │
  │    - Inventory shrinkage                                    │
  │    - Sabotage/vandalism                                     │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. CONTROL RECOMMENDATIONS                                  │
  │    - Loading dock CCTV and sensors                          │
  │    - Trailer seal verification system                       │
  │    - GPS fleet tracking                                     │
  │    - Perimeter intrusion detection                          │
  │    - High-value inventory caging                            │
  │    - Driver check-in/badge procedures                       │
  │    - Cycle counting protocols                               │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. PROFESSIONAL PDF REPORT                                  │
  │    - Cargo theft vulnerability assessment                   │
  │    - Loading dock security analysis                         │
  │    - Supply chain risk scenarios                            │
  │    - ROI-justified recommendations                          │
  │    - Industry benchmarking                                  │
  └─────────────────────────────────────────────────────────────┘
```

### 1.3 Key Threats for Warehouse Environments

| Priority | Threat Category | Typical Frequency | Average Loss |
|----------|----------------|-------------------|--------------|
| Critical | Cargo Theft - Full Truckload | Rare but catastrophic | $100K-$500K+ |
| Critical | Insider Theft - Employee/Driver Collusion | Monthly/Quarterly | $50K-$200K |
| High | Cargo Theft - Pilferage | Weekly/Monthly | $500-$5K per incident |
| High | Loading Dock Breach | Monthly | $10K-$50K |
| High | Inventory Shrinkage - Unknown Loss | Continuous | 1-3% of inventory value |
| Medium | Yard/Trailer Theft | Quarterly | $20K-$100K |
| Medium | Vehicle/Fleet Theft | Rare | $30K-$80K |
| Medium | Hijacking (In-Transit) | Rare but high impact | $100K-$500K+ |
| Low | Sabotage - Equipment/Product | Rare | Varies widely |
| Low | Vandalism | Occasional | $1K-$10K |

---

## 2. Assessment Template Specifications

### 2.1 Template Configuration

```typescript
{
  name: 'Warehouse & Distribution Center Security Assessment',
  templateType: 'warehouse',
  description: 'Comprehensive security assessment for logistics facilities focusing on cargo theft prevention and supply chain security',
  siteTypeRecommendation: 'warehouse',
  calculationMethod: 'tvi', // Using T×V×I for audit defensibility
  
  defaultThreats: [
    'cargo_theft_full_truckload',
    'cargo_theft_pilferage',
    'insider_theft_employee_driver_collusion',
    'loading_dock_breach',
    'inventory_shrinkage_unknown',
    'yard_trailer_theft',
    'vehicle_fleet_theft',
    'hijacking_in_transit',
    'sabotage_equipment',
    'vandalism_property',
    'unauthorized_access_facility',
    'workplace_violence_employee'
  ],
  
  defaultControls: [
    // Perimeter Security
    'high_security_fencing_8ft',
    'perimeter_intrusion_detection',
    'gate_access_control_with_guard',
    'vehicle_barrier_system',
    'perimeter_lighting_adequate',
    'clear_zone_perimeter',
    
    // Loading Dock Security
    'loading_dock_cctv_all_doors',
    'dock_door_sensors_open_close',
    'dock_intrusion_alarm',
    'dock_leveler_locks',
    'trailer_seal_verification_system',
    'dock_scheduling_system',
    
    // Yard Security
    'yard_cctv_coverage',
    'trailer_parking_designated_area',
    'yard_lighting',
    'yard_jockey_tracking',
    'kingpin_locks_parked_trailers',
    
    // Access Control
    'employee_badge_access_control',
    'visitor_check_in_system',
    'driver_check_in_procedures',
    'vendor_vetting_process',
    'contractor_background_checks',
    'two_person_rule_high_value',
    
    // Surveillance
    'cctv_perimeter',
    'cctv_yard',
    'cctv_loading_docks',
    'cctv_warehouse_interior',
    'cctv_high_value_storage',
    'video_retention_30_days',
    'video_analytics',
    
    // Inventory Control
    'high_value_inventory_caging',
    'cycle_counting_program',
    'inventory_audit_procedures',
    'lot_serial_tracking',
    'shipping_manifest_verification',
    'load_verification_procedures',
    'receiving_verification_procedures',
    
    // Fleet & Vehicle Security
    'gps_tracking_fleet_vehicles',
    'vehicle_immobilization_system',
    'fuel_theft_prevention',
    'vehicle_inspection_checklist',
    'two_driver_rule_high_value_loads',
    
    // Personnel Security
    'employee_background_checks_all',
    'driver_background_checks',
    'theft_reporting_hotline',
    'security_awareness_training',
    'insider_threat_program',
    
    // Procedural Controls
    'cargo_theft_response_plan',
    'shipping_receiving_procedures',
    'dock_procedure_documentation',
    'key_control_system',
    'alarm_response_procedures',
    
    // Physical Barriers
    'reinforced_warehouse_doors',
    'roll_up_door_locks',
    'interior_caging_high_value',
    'bollards_dock_area',
    
    // Technology
    'warehouse_management_system',
    'rfid_inventory_tracking',
    'real_time_inventory_visibility',
    'exception_based_reporting'
  ]
}
```

### 2.2 Threat Library (Warehouse-Specific)

**Warehouse-Focused Threats with ASIS GDL-RA Alignment:**

| Threat | Category | Typical Likelihood | Typical Impact | ASIS Code |
|--------|----------|-------------------|----------------|-----------|
| Cargo Theft - Full Truckload | Theft | 2 | 5 | PSC.1-2012-THF-007 |
| Cargo Theft - Pilferage | Theft | 4 | 3 | PSC.1-2012-THF-008 |
| Insider Theft - Employee/Driver Collusion | Insider Threat | 3 | 4 | PSC.1-2012-INS-001 |
| Loading Dock Breach | Physical Intrusion | 3 | 4 | PSC.1-2012-INT-004 |
| Inventory Shrinkage - Unknown Loss | Theft | 4 | 3 | PSC.1-2012-THF-009 |
| Yard/Trailer Theft | Theft | 2 | 4 | PSC.1-2012-THF-010 |
| Vehicle/Fleet Theft | Theft | 2 | 3 | PSC.1-2012-THF-011 |
| Hijacking - In-Transit | Robbery | 1 | 5 | PSC.1-2012-ROB-002 |
| Sabotage - Equipment/Product Damage | Sabotage | 1 | 4 | PSC.1-2012-SAB-002 |
| Vandalism - Property Damage | Vandalism | 2 | 2 | PSC.1-2012-VAN-002 |
| Unauthorized Access - Facility Breach | Physical Intrusion | 3 | 3 | PSC.1-2012-INT-005 |
| Workplace Violence - Employee Conflict | Workplace Violence | 2 | 3 | PSC.1-2012-WPV-002 |

---

## 3. Interview Protocol System

### 3.1 Interview Questionnaire Structure

**File Location:** `server/data/warehouse-interview-questionnaire.ts`

```typescript
export interface WarehouseInterviewQuestion {
  id: string;
  section: string;
  zoneApplicable?: string[]; // Yard, loading dock, warehouse interior, etc.
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist' | 'number';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: WarehouseInterviewQuestion[];
  riskIndicators?: string[]; // Keywords that elevate risk
  
  // Direct mapping to risk scenarios
  informsThreat?: string[]; // Threat IDs this question informs
  informsVulnerability?: boolean; // Does this assess vulnerability?
  informsImpact?: boolean; // Does this assess potential impact?
  suggestsControls?: string[]; // Control IDs this might reveal need for
}
```

### 3.2 Complete Interview Questions (9 Sections, 55+ Questions)

#### **SECTION 1: FACILITY & OPERATIONS PROFILE (7 questions)**

```typescript
const section1_facilityProfile: WarehouseInterviewQuestion[] = [
  {
    id: 'facility_1',
    section: 'Facility & Operations Profile',
    questionText: 'What type of warehouse operation is this?',
    questionType: 'multiple_choice',
    options: [
      'Distribution center (outbound focus)',
      'Fulfillment center (e-commerce)',
      'Third-party logistics (3PL) - multi-client',
      'Cold storage/Refrigerated warehouse',
      'Manufacturing warehouse (raw materials + finished goods)',
      'Cross-dock facility',
      'Bonded warehouse (customs)',
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['cargo_theft_full_truckload', 'insider_theft_employee_driver_collusion'],
  },

  {
    id: 'facility_2',
    section: 'Facility & Operations Profile',
    questionText: 'What is the approximate square footage of the warehouse?',
    questionType: 'multiple_choice',
    options: [
      'Under 50,000 sq ft',
      '50,000 - 150,000 sq ft',
      '150,000 - 300,000 sq ft',
      '300,000 - 500,000 sq ft',
      'Over 500,000 sq ft',
    ],
    required: true,
    informsImpact: true,
    informsVulnerability: true, // Larger = harder to secure
  },

  {
    id: 'facility_3',
    section: 'Facility & Operations Profile',
    questionText: 'What is the approximate total value of inventory typically stored in the facility?',
    questionType: 'multiple_choice',
    options: [
      'Under $1 million',
      '$1M - $5M',
      '$5M - $20M',
      '$20M - $50M',
      'Over $50M',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'facility_4',
    section: 'Facility & Operations Profile',
    questionText: 'Do you store high-value goods that are frequent cargo theft targets?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['cargo_theft_full_truckload', 'cargo_theft_pilferage'],
    followUpQuestions: [
      {
        id: 'facility_4a',
        section: 'Facility & Operations Profile',
        questionText: 'What high-value product categories do you handle? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Electronics (TVs, computers, phones)',
          'Pharmaceuticals',
          'Alcohol/Spirits',
          'Designer clothing/footwear',
          'Cosmetics/Fragrances',
          'Copper/metals',
          'Food (organic, premium brands)',
          'Auto parts (high-end)',
          'Tools/power tools',
        ],
        required: true,
        informsImpact: true,
      },
    ],
  },

  {
    id: 'facility_5',
    section: 'Facility & Operations Profile',
    questionText: 'How many total employees work at this facility?',
    questionType: 'multiple_choice',
    options: [
      '1-25 employees',
      '26-75 employees',
      '76-150 employees',
      '151-300 employees',
      'Over 300 employees',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'facility_6',
    section: 'Facility & Operations Profile',
    questionText: 'What are your typical operating hours?',
    questionType: 'multiple_choice',
    options: [
      '24/7 operations',
      'Extended hours (5 AM - 11 PM)',
      'Two shifts (6 AM - 10 PM)',
      'Single shift (8 AM - 5 PM)',
      'Varies by season/demand',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_full_truckload', 'loading_dock_breach'],
  },

  {
    id: 'facility_7',
    section: 'Facility & Operations Profile',
    questionText: 'Approximately how many trucks (inbound + outbound) do you handle per day?',
    questionType: 'multiple_choice',
    options: [
      '1-10 trucks/day',
      '11-30 trucks/day',
      '31-75 trucks/day',
      '76-150 trucks/day',
      'Over 150 trucks/day',
    ],
    required: true,
    informsVulnerability: true, // High volume = harder to monitor
  },
];
```

#### **SECTION 2: CARGO THEFT & INCIDENT HISTORY (8 questions)**

```typescript
const section2_incidentHistory: WarehouseInterviewQuestion[] = [
  {
    id: 'incident_1',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced a full truckload cargo theft in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['cargo_theft_full_truckload'],
    followUpQuestions: [
      {
        id: 'incident_1a',
        section: 'Cargo Theft & Incident History',
        questionText: 'How many full truckload theft incidents?',
        questionType: 'number',
        required: true,
      },
      {
        id: 'incident_1b',
        section: 'Cargo Theft & Incident History',
        questionText: 'What was the approximate total loss?',
        questionType: 'multiple_choice',
        options: [
          'Under $50K',
          '$50K - $200K',
          '$200K - $500K',
          'Over $500K',
        ],
        required: true,
        informsImpact: true,
      },
      {
        id: 'incident_1c',
        section: 'Cargo Theft & Incident History',
        questionText: 'Was insider involvement suspected or confirmed?',
        questionType: 'multiple_choice',
        options: [
          'Confirmed insider involvement',
          'Suspected insider involvement',
          'No insider involvement',
          'Unknown',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'incident_2',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced cargo pilferage (small-scale theft) in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['cargo_theft_pilferage'],
    followUpQuestions: [
      {
        id: 'incident_2a',
        section: 'Cargo Theft & Incident History',
        questionText: 'How frequently does pilferage occur?',
        questionType: 'multiple_choice',
        options: [
          'Rarely (1-2 incidents/year)',
          'Occasionally (3-6 incidents/year)',
          'Frequently (monthly)',
          'Constantly (weekly or more)',
        ],
        required: true,
        riskIndicators: ['frequently', 'constantly'],
      },
    ],
  },

  {
    id: 'incident_3',
    section: 'Cargo Theft & Incident History',
    questionText: 'What is your annual inventory shrinkage rate?',
    questionType: 'multiple_choice',
    options: [
      'Under 0.5% (excellent)',
      '0.5% - 1% (good)',
      '1% - 2% (industry average)',
      '2% - 3% (above average)',
      'Over 3% (concerning)',
      'Unknown/Not tracked',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['inventory_shrinkage_unknown', 'cargo_theft_pilferage'],
    riskIndicators: ['2% - 3%', 'over 3%', 'unknown'],
  },

  {
    id: 'incident_4',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you had any confirmed employee theft cases in the past 2 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    followUpQuestions: [
      {
        id: 'incident_4a',
        section: 'Cargo Theft & Incident History',
        questionText: 'How many employee theft cases?',
        questionType: 'number',
        required: true,
      },
    ],
  },

  {
    id: 'incident_5',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you experienced trailer theft from your yard in the past 3 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['yard_trailer_theft'],
  },

  {
    id: 'incident_6',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have you had any company vehicles stolen in the past 3 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['vehicle_fleet_theft'],
  },

  {
    id: 'incident_7',
    section: 'Cargo Theft & Incident History',
    questionText: 'Have any of your loads been hijacked in-transit in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['hijacking_in_transit'],
  },

  {
    id: 'incident_8',
    section: 'Cargo Theft & Incident History',
    questionText: 'Are you aware of cargo theft incidents at nearby warehouses or in your area?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['cargo_theft_full_truckload'],
    informsVulnerability: true,
  },
];
```

#### **SECTION 3: PERIMETER & YARD SECURITY (9 questions)**

```typescript
const section3_perimeter: WarehouseInterviewQuestion[] = [
  {
    id: 'perimeter_1',
    section: 'Perimeter & Yard Security',
    questionText: 'What type of perimeter fencing do you have?',
    questionType: 'multiple_choice',
    options: [
      'High-security chain link (8+ feet) with barbed wire/razor wire',
      'Standard chain link (6-8 feet) with barbed wire',
      'Standard chain link (6-8 feet) without barbed wire',
      'Other fencing (wooden, ornamental)',
      'No fencing',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['high_security_fencing_8ft'],
    riskIndicators: ['standard chain link', 'other fencing', 'no fencing'],
  },

  {
    id: 'perimeter_2',
    section: 'Perimeter & Yard Security',
    questionText: 'Is your perimeter fence in good condition with no gaps or damage?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    riskIndicators: ['no'],
  },

  {
    id: 'perimeter_3',
    section: 'Perimeter & Yard Security',
    questionText: 'Do you have perimeter intrusion detection (fence sensors, ground sensors, etc.)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_intrusion_detection'],
  },

  {
    id: 'perimeter_4',
    section: 'Perimeter & Yard Security',
    questionText: 'How is vehicle access to the property controlled?',
    questionType: 'multiple_choice',
    options: [
      'Manned guard gate with vehicle inspection',
      'Automated gate with access control (keycard/transponder)',
      'Gate that is locked after hours only',
      'Open access during business hours, locked after hours',
      'Open access 24/7',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['gate_access_control_with_guard'],
    riskIndicators: ['open access 24/7', 'open access during'],
  },

  {
    id: 'perimeter_5',
    section: 'Perimeter & Yard Security',
    questionText: 'Rate the adequacy of perimeter and yard lighting',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Poor - Many dark areas', 'Fair', 'Adequate', 'Good', 'Excellent - No dark areas'] 
    },
    required: true,
    informsVulnerability: true,
    suggestsControls: ['perimeter_lighting_adequate', 'yard_lighting'],
  },

  {
    id: 'perimeter_6',
    section: 'Perimeter & Yard Security',
    questionText: 'Do you have CCTV coverage of the perimeter and yard?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_perimeter', 'cctv_yard'],
    followUpQuestions: [
      {
        id: 'perimeter_6a',
        section: 'Perimeter & Yard Security',
        questionText: 'What percentage of the perimeter and yard has camera coverage?',
        questionType: 'multiple_choice',
        options: [
          '75-100% coverage',
          '50-75% coverage',
          '25-50% coverage',
          'Under 25% coverage',
        ],
        required: true,
        riskIndicators: ['under 25%'],
      },
    ],
  },

  {
    id: 'perimeter_7',
    section: 'Perimeter & Yard Security',
    questionText: 'Is there a clear zone (no vegetation, obstructions) around the perimeter fence?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['clear_zone_perimeter'],
  },

  {
    id: 'perimeter_8',
    section: 'Perimeter & Yard Security',
    questionText: 'How are parked trailers (loaded or empty) secured in the yard?',
    questionType: 'checklist',
    options: [
      'Designated secure parking area',
      'Kingpin locks on all trailers',
      'Yard jockey keys controlled',
      'CCTV monitoring of trailer parking',
      'Regular patrols of yard',
      'No specific security measures',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['trailer_parking_designated_area', 'kingpin_locks_parked_trailers'],
    riskIndicators: ['no specific security'],
  },

  {
    id: 'perimeter_9',
    section: 'Perimeter & Yard Security',
    questionText: 'Do you conduct regular perimeter security inspections?',
    questionType: 'multiple_choice',
    options: [
      'Daily inspections',
      'Weekly inspections',
      'Monthly inspections',
      'Rarely/Never',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely/never'],
  },
];
```

#### **SECTION 4: LOADING DOCK SECURITY (10 questions)**

```typescript
const section4_loadingDock: WarehouseInterviewQuestion[] = [
  {
    id: 'dock_1',
    section: 'Loading Dock Security',
    questionText: 'How many loading dock doors does your facility have?',
    questionType: 'multiple_choice',
    options: [
      '1-5 doors',
      '6-15 doors',
      '16-30 doors',
      '31-50 doors',
      'Over 50 doors',
    ],
    required: true,
    informsVulnerability: true, // More doors = more vulnerability
  },

  {
    id: 'dock_2',
    section: 'Loading Dock Security',
    questionText: 'Do you have CCTV cameras covering all loading dock doors?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['loading_dock_cctv_all_doors'],
    followUpQuestions: [
      {
        id: 'dock_2a',
        section: 'Loading Dock Security',
        questionText: 'Can the cameras capture activity inside trailers when doors are open?',
        questionType: 'yes_no',
        required: true,
      },
    ],
  },

  {
    id: 'dock_3',
    section: 'Loading Dock Security',
    questionText: 'Do you have electronic sensors that detect when dock doors are open/closed?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dock_door_sensors_open_close'],
  },

  {
    id: 'dock_4',
    section: 'Loading Dock Security',
    questionText: 'Do you use a trailer seal verification system?',
    questionType: 'multiple_choice',
    options: [
      'Yes - electronic seal verification with documentation',
      'Yes - manual seal verification with documentation',
      'Informal seal checking (not documented)',
      'No seal verification',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['trailer_seal_verification_system'],
    riskIndicators: ['informal', 'no seal'],
  },

  {
    id: 'dock_5',
    section: 'Loading Dock Security',
    questionText: 'What happens to dock doors when not actively loading/unloading?',
    questionType: 'multiple_choice',
    options: [
      'Doors locked, trailer disconnected',
      'Doors closed but not locked',
      'Doors may remain open between loads',
      'No formal procedure',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['doors may remain', 'no formal'],
  },

  {
    id: 'dock_6',
    section: 'Loading Dock Security',
    questionText: 'Do you use dock scheduling/appointment systems for arriving trucks?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dock_scheduling_system'],
  },

  {
    id: 'dock_7',
    section: 'Loading Dock Security',
    questionText: 'Are dock levelers secured (locked or raised) when not in use?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dock_leveler_locks'],
  },

  {
    id: 'dock_8',
    section: 'Loading Dock Security',
    questionText: 'Do you verify that outbound load contents match shipping manifests?',
    questionType: 'multiple_choice',
    options: [
      'Yes - 100% verification with documentation',
      'Yes - random verification',
      'Informal verification',
      'No verification process',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['cargo_theft_pilferage', 'insider_theft_employee_driver_collusion'],
    suggestsControls: ['shipping_manifest_verification', 'load_verification_procedures'],
    riskIndicators: ['informal', 'no verification'],
  },

  {
    id: 'dock_9',
    section: 'Loading Dock Security',
    questionText: 'How do you prevent drivers from entering the warehouse during loading/unloading?',
    questionType: 'multiple_choice',
    options: [
      'Drivers must remain in designated waiting area, physically separated',
      'Drivers are escorted if they need to enter warehouse',
      'Drivers restricted but no physical barrier',
      'No restrictions - drivers can enter',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['no restrictions'],
  },

  {
    id: 'dock_10',
    section: 'Loading Dock Security',
    questionText: 'Do you have an intrusion alarm system on loading dock doors?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dock_intrusion_alarm'],
  },
];
```

#### **SECTION 5: INVENTORY CONTROL & MANAGEMENT (7 questions)**

```typescript
const section5_inventory: WarehouseInterviewQuestion[] = [
  {
    id: 'inventory_1',
    section: 'Inventory Control & Management',
    questionText: 'Do you have a Warehouse Management System (WMS) in place?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['warehouse_management_system'],
    followUpQuestions: [
      {
        id: 'inventory_1a',
        section: 'Inventory Control & Management',
        questionText: 'Does your WMS provide real-time inventory visibility?',
        questionType: 'yes_no',
        required: true,
        suggestsControls: ['real_time_inventory_visibility'],
      },
    ],
  },

  {
    id: 'inventory_2',
    section: 'Inventory Control & Management',
    questionText: 'How often do you conduct cycle counts for inventory verification?',
    questionType: 'multiple_choice',
    options: [
      'Daily on high-value items',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Only annual physical inventory',
      'No formal cycle counting',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cycle_counting_program'],
    riskIndicators: ['only annual', 'no formal'],
  },

  {
    id: 'inventory_3',
    section: 'Inventory Control & Management',
    questionText: 'Is high-value inventory stored in secure caging or segregated areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['high_value_inventory_caging', 'interior_caging_high_value'],
    followUpQuestions: [
      {
        id: 'inventory_3a',
        section: 'Inventory Control & Management',
        questionText: 'How is access to high-value storage areas controlled?',
        questionType: 'multiple_choice',
        options: [
          'Electronic access control with audit trail',
          'Key control with sign-out log',
          'Manager-only access',
          'General employee access',
        ],
        required: true,
        riskIndicators: ['general employee'],
      },
    ],
  },

  {
    id: 'inventory_4',
    section: 'Inventory Control & Management',
    questionText: 'Do you use lot numbers or serial numbers to track inventory?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['lot_serial_tracking'],
  },

  {
    id: 'inventory_5',
    section: 'Inventory Control & Management',
    questionText: 'Do you have CCTV coverage of high-value storage areas?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_high_value_storage'],
  },

  {
    id: 'inventory_6',
    section: 'Inventory Control & Management',
    questionText: 'Do you use exception-based reporting to identify unusual transactions?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    suggestsControls: ['exception_based_reporting'],
  },

  {
    id: 'inventory_7',
    section: 'Inventory Control & Management',
    questionText: 'Do you require a two-person rule for accessing high-value inventory?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['two_person_rule_high_value'],
  },
];
```

#### **SECTION 6: PERSONNEL & ACCESS CONTROL (8 questions)**

```typescript
const section6_personnel: WarehouseInterviewQuestion[] = [
  {
    id: 'personnel_1',
    section: 'Personnel & Access Control',
    questionText: 'Do you conduct background checks on all warehouse employees?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive background checks on all employees',
      'Yes - criminal background only',
      'Selective - supervisors and high-access positions only',
      'No background checks',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    suggestsControls: ['employee_background_checks_all'],
    riskIndicators: ['no background'],
  },

  {
    id: 'personnel_2',
    section: 'Personnel & Access Control',
    questionText: 'Do you conduct background checks on drivers (company fleet and contractors)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['driver_background_checks'],
  },

  {
    id: 'personnel_3',
    section: 'Personnel & Access Control',
    questionText: 'What type of employee access control system do you have?',
    questionType: 'multiple_choice',
    options: [
      'Electronic badge access with audit trail',
      'Key card system',
      'Physical keys only',
      'No formal access control',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['employee_badge_access_control'],
    riskIndicators: ['physical keys only', 'no formal'],
  },

  {
    id: 'personnel_4',
    section: 'Personnel & Access Control',
    questionText: 'How do you manage visitor access (vendors, contractors, visitors)?',
    questionType: 'multiple_choice',
    options: [
      'Check-in with ID verification, visitor badge, escort required',
      'Check-in with visitor badge, no escort',
      'Informal sign-in',
      'Open access',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['visitor_check_in_system'],
    riskIndicators: ['informal', 'open access'],
  },

  {
    id: 'personnel_5',
    section: 'Personnel & Access Control',
    questionText: 'Do you have a driver check-in procedure for inbound/outbound trucks?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['driver_check_in_procedures'],
    followUpQuestions: [
      {
        id: 'personnel_5a',
        section: 'Personnel & Access Control',
        questionText: 'What does the driver check-in process include? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'ID verification',
          'License verification',
          'Vehicle inspection',
          'Appointment verification',
          'Temporary access badge issued',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'personnel_6',
    section: 'Personnel & Access Control',
    questionText: 'Do employees receive security awareness training?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive training during onboarding + annual refreshers',
      'Yes - brief training during onboarding',
      'Informal on-the-job guidance',
      'No formal training',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['security_awareness_training'],
    riskIndicators: ['informal', 'no formal'],
  },

  {
    id: 'personnel_7',
    section: 'Personnel & Access Control',
    questionText: 'Do you have a theft reporting hotline or anonymous reporting mechanism?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['theft_reporting_hotline'],
  },

  {
    id: 'personnel_8',
    section: 'Personnel & Access Control',
    questionText: 'Do you have an insider threat monitoring program?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['insider_theft_employee_driver_collusion'],
    suggestsControls: ['insider_threat_program'],
  },
];
```

#### **SECTION 7: VEHICLE & FLEET SECURITY (5 questions)**

```typescript
const section7_fleet: WarehouseInterviewQuestion[] = [
  {
    id: 'fleet_1',
    section: 'Vehicle & Fleet Security',
    questionText: 'How many company-owned vehicles (trucks, vans, forklifts) do you have?',
    questionType: 'multiple_choice',
    options: [
      'None - use contractors only',
      '1-10 vehicles',
      '11-25 vehicles',
      '26-50 vehicles',
      'Over 50 vehicles',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'fleet_2',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you have GPS tracking on company vehicles?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['gps_tracking_fleet_vehicles'],
  },

  {
    id: 'fleet_3',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you use vehicle immobilization systems (kill switches) on fleet vehicles?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['vehicle_fleet_theft', 'hijacking_in_transit'],
    suggestsControls: ['vehicle_immobilization_system'],
  },

  {
    id: 'fleet_4',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you require a two-driver rule for high-value loads?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    informsThreat: ['hijacking_in_transit'],
    suggestsControls: ['two_driver_rule_high_value_loads'],
  },

  {
    id: 'fleet_5',
    section: 'Vehicle & Fleet Security',
    questionText: 'Do you have fuel theft prevention measures in place?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['fuel_theft_prevention'],
  },
];
```

#### **SECTION 8: SURVEILLANCE & MONITORING (5 questions)**

```typescript
const section8_surveillance: WarehouseInterviewQuestion[] = [
  {
    id: 'surveillance_1',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you have CCTV coverage inside the warehouse?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_warehouse_interior'],
    followUpQuestions: [
      {
        id: 'surveillance_1a',
        section: 'Surveillance & Monitoring',
        questionText: 'What percentage of the warehouse interior has camera coverage?',
        questionType: 'multiple_choice',
        options: [
          '75-100% coverage',
          '50-75% coverage',
          '25-50% coverage',
          'Under 25% coverage',
        ],
        required: true,
        riskIndicators: ['under 25%'],
      },
    ],
  },

  {
    id: 'surveillance_2',
    section: 'Surveillance & Monitoring',
    questionText: 'What is your video retention period?',
    questionType: 'multiple_choice',
    options: [
      '60+ days',
      '30-60 days',
      '15-30 days',
      '7-14 days',
      'Less than 7 days',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_retention_30_days'],
    riskIndicators: ['less than 7 days', '7-14 days'],
  },

  {
    id: 'surveillance_3',
    section: 'Surveillance & Monitoring',
    questionText: 'Is CCTV footage actively monitored in real-time?',
    questionType: 'multiple_choice',
    options: [
      'Yes - dedicated monitoring 24/7',
      'Yes - during business hours only',
      'Only reviewed after incidents',
      'Rarely reviewed',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely reviewed'],
  },

  {
    id: 'surveillance_4',
    section: 'Surveillance & Monitoring',
    questionText: 'Do you use video analytics (motion detection, behavior analysis)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['video_analytics'],
  },

  {
    id: 'surveillance_5',
    section: 'Surveillance & Monitoring',
    questionText: 'Rate the overall quality and coverage of your CCTV system',
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

#### **SECTION 9: EMERGENCY RESPONSE & PROCEDURES (6 questions)**

```typescript
const section9_emergency: WarehouseInterviewQuestion[] = [
  {
    id: 'emergency_1',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have a documented cargo theft response plan?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cargo_theft_response_plan'],
  },

  {
    id: 'emergency_2',
    section: 'Emergency Response & Procedures',
    questionText: 'Are shipping and receiving procedures clearly documented?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['shipping_receiving_procedures', 'dock_procedure_documentation'],
  },

  {
    id: 'emergency_3',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have a key control system with documented accountability?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['key_control_system'],
  },

  {
    id: 'emergency_4',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have documented alarm response procedures?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['alarm_response_procedures'],
  },

  {
    id: 'emergency_5',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you conduct security drills or training exercises?',
    questionType: 'multiple_choice',
    options: [
      'Quarterly or more frequently',
      'Annually',
      'Rarely',
      'Never',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely', 'never'],
  },

  {
    id: 'emergency_6',
    section: 'Emergency Response & Procedures',
    questionText: 'Do you have relationships with local law enforcement for cargo theft prevention?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
  },
];
```

---

## 4. Risk Mapping & Calculation Integration

### 4.1 Interview → T×V×I Calculation Flow

```typescript
// server/services/warehouse-interview-risk-mapper.ts

export interface WarehouseRiskMapping {
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
  if (responses.perimeter_1?.includes('no fencing') || 
      responses.perimeter_1?.includes('other fencing')) {
    riskFactorCount += 2;
  }
  if (responses.perimeter_2 === 'no') riskFactorCount += 1; // Fence damage
  if (responses.perimeter_3 === 'no') riskFactorCount += 1; // No intrusion detection
  if (responses.perimeter_4?.includes('open access')) riskFactorCount += 2;
  if (responses.perimeter_5 <= 2) riskFactorCount += 1; // Poor lighting
  if (responses.perimeter_7 === 'no') riskFactorCount += 1; // No clear zone
  if (responses.perimeter_8?.includes('no specific security')) riskFactorCount += 2;
  
  // LOADING DOCK SECURITY ANALYSIS
  if (responses.dock_2 === 'no') riskFactorCount += 2; // No dock cameras
  if (responses.dock_3 === 'no') riskFactorCount += 1; // No door sensors
  if (responses.dock_4?.includes('no seal') || responses.dock_4?.includes('informal')) {
    riskFactorCount += 2; // Critical for cargo theft
  }
  if (responses.dock_5?.includes('no formal') || responses.dock_5?.includes('may remain')) {
    riskFactorCount += 1;
  }
  if (responses.dock_6 === 'no') riskFactorCount += 1; // No dock scheduling
  if (responses.dock_8?.includes('no verification') || responses.dock_8?.includes('informal')) {
    riskFactorCount += 2;
  }
  if (responses.dock_9?.includes('no restrictions')) riskFactorCount += 1;
  if (responses.dock_10 === 'no') riskFactorCount += 1; // No dock alarm
  
  // INVENTORY CONTROL ANALYSIS
  if (responses.inventory_1 === 'no') riskFactorCount += 1; // No WMS
  if (responses.inventory_2?.includes('no formal') || responses.inventory_2?.includes('only annual')) {
    riskFactorCount += 2;
  }
  if (responses.inventory_3 === 'no') riskFactorCount += 2; // High-value not caged
  if (responses.inventory_4 === 'no') riskFactorCount += 1; // No lot tracking
  if (responses.inventory_5 === 'no') riskFactorCount += 1; // No CCTV on high-value
  if (responses.inventory_6 === 'no') riskFactorCount += 1; // No exception reporting
  if (responses.inventory_7 === 'no') riskFactorCount += 1; // No two-person rule
  
  // PERSONNEL SECURITY ANALYSIS
  if (responses.personnel_1?.includes('no background')) riskFactorCount += 2;
  if (responses.personnel_2 === 'no') riskFactorCount += 1; // No driver checks
  if (responses.personnel_3?.includes('no formal') || responses.personnel_3?.includes('physical keys')) {
    riskFactorCount += 1;
  }
  if (responses.personnel_4?.includes('open access') || responses.personnel_4?.includes('informal')) {
    riskFactorCount += 1;
  }
  if (responses.personnel_5 === 'no') riskFactorCount += 1; // No driver check-in
  if (responses.personnel_6?.includes('no formal')) riskFactorCount += 1;
  if (responses.personnel_8 === 'no') riskFactorCount += 1; // No insider threat program
  
  // FLEET SECURITY ANALYSIS (for relevant threats)
  if (threatId === 'vehicle_fleet_theft' || threatId === 'hijacking_in_transit') {
    if (responses.fleet_2 === 'no') riskFactorCount += 2; // No GPS
    if (responses.fleet_3 === 'no') riskFactorCount += 1; // No kill switch
    if (responses.fleet_4 === 'no') riskFactorCount += 1; // No two-driver rule
  }
  
  // SURVEILLANCE ANALYSIS
  if (responses.surveillance_1 === 'no') riskFactorCount += 1;
  if (responses.surveillance_2?.includes('less than 7') || responses.surveillance_2?.includes('7-14')) {
    riskFactorCount += 1;
  }
  if (responses.surveillance_3?.includes('rarely')) riskFactorCount += 1;
  if (responses.surveillance_5 <= 2) riskFactorCount += 1; // Poor CCTV rating
  
  // SHRINKAGE RATE (critical indicator)
  if (responses.incident_3?.includes('over 3%') || responses.incident_3?.includes('unknown')) {
    riskFactorCount += 2;
  } else if (responses.incident_3?.includes('2% - 3%')) {
    riskFactorCount += 1;
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
  let likelihood = 3; // Baseline moderate
  
  switch (threatId) {
    case 'cargo_theft_full_truckload':
      if (responses.incident_1 === 'yes') {
        likelihood = 4; // History of incidents increases likelihood
      } else {
        likelihood = 2;
      }
      // Adjust for high-value goods
      if (responses.facility_4 === 'yes') likelihood += 1;
      // Adjust for area crime
      if (responses.incident_8 === 'yes') likelihood += 1;
      likelihood = Math.min(5, likelihood);
      break;
      
    case 'cargo_theft_pilferage':
      if (responses.incident_2 === 'yes') {
        likelihood = 4;
        if (responses.incident_2a?.includes('constantly') || 
            responses.incident_2a?.includes('frequently')) {
          likelihood = 5;
        }
      } else {
        likelihood = 3;
      }
      break;
      
    case 'insider_theft_employee_driver_collusion':
      if (responses.incident_4 === 'yes') {
        likelihood = 4;
      } else {
        likelihood = 3;
      }
      // Higher likelihood if poor personnel controls
      if (responses.personnel_1?.includes('no background')) likelihood += 1;
      likelihood = Math.min(5, likelihood);
      break;
      
    case 'loading_dock_breach':
      likelihood = 3; // Baseline
      // Increase if many doors
      if (responses.dock_1?.includes('over 50') || responses.dock_1?.includes('31-50')) {
        likelihood += 1;
      }
      break;
      
    case 'inventory_shrinkage_unknown':
      if (responses.incident_3?.includes('over 3%')) {
        likelihood = 5;
      } else if (responses.incident_3?.includes('2% - 3%')) {
        likelihood = 4;
      } else if (responses.incident_3?.includes('1% - 2%')) {
        likelihood = 3;
      } else {
        likelihood = 2;
      }
      break;
      
    case 'yard_trailer_theft':
      if (responses.incident_5 === 'yes') {
        likelihood = 4;
      } else {
        likelihood = 2;
      }
      break;
      
    case 'vehicle_fleet_theft':
      if (responses.incident_6 === 'yes') {
        likelihood = 4;
      } else {
        likelihood = 2;
      }
      break;
      
    case 'hijacking_in_transit':
      if (responses.incident_7 === 'yes') {
        likelihood = 3; // Elevated if history
      } else {
        likelihood = 1; // Rare event
      }
      if (responses.facility_4 === 'yes') likelihood += 1; // High-value goods
      break;
      
    default:
      likelihood = 3;
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
  
  // Inventory value affects impact
  const inventoryValue = responses.facility_3;
  if (inventoryValue?.includes('Over $50M')) impact = 5;
  else if (inventoryValue?.includes('$20M - $50M')) impact = 4;
  else if (inventoryValue?.includes('$5M - $20M')) impact = 3;
  else impact = 2;
  
  // High-value goods increase impact for theft threats
  if (responses.facility_4 === 'yes') {
    if (threatId.includes('cargo_theft') || 
        threatId === 'hijacking_in_transit' ||
        threatId === 'insider_theft_employee_driver_collusion') {
      impact += 1;
    }
  }
  
  // Full truckload theft always has high impact
  if (threatId === 'cargo_theft_full_truckload') {
    impact = Math.max(4, impact);
  }
  
  // Hijacking has maximum impact (safety + financial)
  if (threatId === 'hijacking_in_transit') {
    impact = 5;
  }
  
  return Math.min(5, impact);
}
```

### 4.5 Auto-Generation of Risk Scenarios

```typescript
export async function generateWarehouseRiskScenarios(
  assessmentId: number,
  surveyId: number
): Promise<RiskScenario[]> {
  
  const survey = await db.query.facilitySurveys.findFirst({
    where: eq(facilitySurveys.id, surveyId),
  });
  
  const responses = JSON.parse(survey.responses);
  const template = await getAssessmentTemplate(assessmentId);
  
  const scenarios: RiskScenario[] = [];
  
  for (const threat of template.threats) {
    const threatLikelihood = calculateThreatLikelihoodFromInterview(responses, threat.id);
    const vulnerability = calculateVulnerabilityFromInterview(responses, threat.id);
    const impact = calculateImpactFromInterview(responses, threat.id);
    const inherentRisk = threatLikelihood * vulnerability * impact;
    
    const scenario: RiskScenario = {
      assessmentId,
      threatId: threat.id,
      threatLikelihood,
      vulnerability,
      impact,
      inherentRisk,
      residualRisk: inherentRisk,
      riskLevel: classifyRiskLevel(inherentRisk),
      scenarioDescription: generateWarehouseScenarioDescription(threat.name, responses),
      suggestedControls: generateControlRecommendations(responses, threat.id),
    };
    
    scenarios.push(scenario);
  }
  
  return scenarios;
}

function generateWarehouseScenarioDescription(
  threatName: string,
  responses: InterviewResponses
): string {
  const inventoryValue = responses.facility_3 || 'unknown value';
  const hasHighValue = responses.facility_4 === 'yes';
  const shrinkageRate = responses.incident_3 || 'unknown';
  const operatingHours = responses.facility_6 || 'unknown hours';
  
  let description = `Risk Scenario: ${threatName}\n\n`;
  description += `This facility stores ${inventoryValue} of inventory`;
  
  if (hasHighValue) {
    description += ` including high-value theft targets`;
  }
  description += `. Operating ${operatingHours}`;
  
  if (shrinkageRate.includes('over 3%') || shrinkageRate.includes('unknown')) {
    description += `. Current shrinkage rate (${shrinkageRate}) indicates existing control gaps.`;
  }
  
  // Add specific vulnerabilities based on threat type
  if (threatName.includes('Cargo Theft')) {
    if (responses.dock_4?.includes('no seal')) {
      description += ` Critical vulnerability: No trailer seal verification system in place.`;
    }
    if (responses.dock_8?.includes('no verification')) {
      description += ` Load contents are not verified against shipping manifests.`;
    }
  }
  
  if (threatName.includes('Loading Dock')) {
    if (responses.dock_2 === 'no') {
      description += ` Loading docks lack CCTV coverage.`;
    }
    if (responses.dock_3 === 'no') {
      description += ` No sensors detect when dock doors are open.`;
    }
  }
  
  return description;
}
```

---

## 5. Control Selection & Recommendations

### 5.1 Control Recommendation Engine

```typescript
export function generateControlRecommendations(
  responses: InterviewResponses,
  threatId: string
): string[] {
  const recommendations = new Set<string>();
  
  // PERIMETER RECOMMENDATIONS
  if (responses.perimeter_1?.includes('no fencing') || 
      responses.perimeter_1?.includes('standard chain link')) {
    recommendations.add('high_security_fencing_8ft');
  }
  if (responses.perimeter_3 === 'no') {
    recommendations.add('perimeter_intrusion_detection');
  }
  if (responses.perimeter_4?.includes('open access')) {
    recommendations.add('gate_access_control_with_guard');
  }
  if (responses.perimeter_5 <= 2) {
    recommendations.add('perimeter_lighting_adequate');
    recommendations.add('yard_lighting');
  }
  if (responses.perimeter_6 === 'no') {
    recommendations.add('cctv_perimeter');
    recommendations.add('cctv_yard');
  }
  if (responses.perimeter_7 === 'no') {
    recommendations.add('clear_zone_perimeter');
  }
  if (responses.perimeter_8?.includes('no specific security')) {
    recommendations.add('trailer_parking_designated_area');
    recommendations.add('kingpin_locks_parked_trailers');
  }
  
  // LOADING DOCK RECOMMENDATIONS
  if (responses.dock_2 === 'no') {
    recommendations.add('loading_dock_cctv_all_doors');
  }
  if (responses.dock_3 === 'no') {
    recommendations.add('dock_door_sensors_open_close');
  }
  if (responses.dock_4?.includes('no seal') || responses.dock_4?.includes('informal')) {
    recommendations.add('trailer_seal_verification_system');
  }
  if (responses.dock_6 === 'no') {
    recommendations.add('dock_scheduling_system');
  }
  if (responses.dock_7 === 'no') {
    recommendations.add('dock_leveler_locks');
  }
  if (responses.dock_8?.includes('no verification') || responses.dock_8?.includes('informal')) {
    recommendations.add('shipping_manifest_verification');
    recommendations.add('load_verification_procedures');
  }
  if (responses.dock_10 === 'no') {
    recommendations.add('dock_intrusion_alarm');
  }
  
  // INVENTORY CONTROL RECOMMENDATIONS
  if (responses.inventory_1 === 'no') {
    recommendations.add('warehouse_management_system');
  }
  if (responses.inventory_2?.includes('no formal') || responses.inventory_2?.includes('only annual')) {
    recommendations.add('cycle_counting_program');
  }
  if (responses.inventory_3 === 'no') {
    recommendations.add('high_value_inventory_caging');
    recommendations.add('interior_caging_high_value');
  }
  if (responses.inventory_4 === 'no') {
    recommendations.add('lot_serial_tracking');
  }
  if (responses.inventory_5 === 'no') {
    recommendations.add('cctv_high_value_storage');
  }
  if (responses.inventory_6 === 'no') {
    recommendations.add('exception_based_reporting');
  }
  if (responses.inventory_7 === 'no') {
    recommendations.add('two_person_rule_high_value');
  }
  
  // PERSONNEL RECOMMENDATIONS
  if (responses.personnel_1?.includes('no background')) {
    recommendations.add('employee_background_checks_all');
  }
  if (responses.personnel_2 === 'no') {
    recommendations.add('driver_background_checks');
  }
  if (responses.personnel_3?.includes('no formal') || responses.personnel_3?.includes('physical keys')) {
    recommendations.add('employee_badge_access_control');
  }
  if (responses.personnel_4?.includes('open access') || responses.personnel_4?.includes('informal')) {
    recommendations.add('visitor_check_in_system');
  }
  if (responses.personnel_5 === 'no') {
    recommendations.add('driver_check_in_procedures');
  }
  if (responses.personnel_6?.includes('no formal')) {
    recommendations.add('security_awareness_training');
  }
  if (responses.personnel_7 === 'no') {
    recommendations.add('theft_reporting_hotline');
  }
  if (responses.personnel_8 === 'no') {
    recommendations.add('insider_threat_program');
  }
  
  // FLEET RECOMMENDATIONS
  if (responses.fleet_2 === 'no') {
    recommendations.add('gps_tracking_fleet_vehicles');
  }
  if (responses.fleet_3 === 'no') {
    recommendations.add('vehicle_immobilization_system');
  }
  if (responses.fleet_4 === 'no') {
    recommendations.add('two_driver_rule_high_value_loads');
  }
  if (responses.fleet_5 === 'no') {
    recommendations.add('fuel_theft_prevention');
  }
  
  // SURVEILLANCE RECOMMENDATIONS
  if (responses.surveillance_1 === 'no') {
    recommendations.add('cctv_warehouse_interior');
  }
  if (responses.surveillance_2?.includes('less than 7') || responses.surveillance_2?.includes('7-14')) {
    recommendations.add('video_retention_30_days');
  }
  if (responses.surveillance_4 === 'no') {
    recommendations.add('video_analytics');
  }
  
  // EMERGENCY RESPONSE RECOMMENDATIONS
  if (responses.emergency_1 === 'no') {
    recommendations.add('cargo_theft_response_plan');
  }
  if (responses.emergency_2 === 'no') {
    recommendations.add('shipping_receiving_procedures');
    recommendations.add('dock_procedure_documentation');
  }
  if (responses.emergency_3 === 'no') {
    recommendations.add('key_control_system');
  }
  if (responses.emergency_4 === 'no') {
    recommendations.add('alarm_response_procedures');
  }
  
  // Threat-specific recommendations
  const threatControlMap: Record<string, string[]> = {
    'cargo_theft_full_truckload': [
      'trailer_seal_verification_system',
      'loading_dock_cctv_all_doors',
      'gps_tracking_fleet_vehicles',
      'gate_access_control_with_guard',
    ],
    'cargo_theft_pilferage': [
      'cctv_warehouse_interior',
      'cctv_high_value_storage',
      'cycle_counting_program',
      'high_value_inventory_caging',
    ],
    'insider_theft_employee_driver_collusion': [
      'employee_background_checks_all',
      'exception_based_reporting',
      'two_person_rule_high_value',
      'insider_threat_program',
    ],
    'loading_dock_breach': [
      'loading_dock_cctv_all_doors',
      'dock_door_sensors_open_close',
      'dock_intrusion_alarm',
      'driver_check_in_procedures',
    ],
    'yard_trailer_theft': [
      'cctv_yard',
      'kingpin_locks_parked_trailers',
      'trailer_parking_designated_area',
      'yard_lighting',
    ],
    'vehicle_fleet_theft': [
      'gps_tracking_fleet_vehicles',
      'vehicle_immobilization_system',
      'key_control_system',
    ],
    'hijacking_in_transit': [
      'gps_tracking_fleet_vehicles',
      'two_driver_rule_high_value_loads',
      'vehicle_immobilization_system',
    ],
  };
  
  if (threatControlMap[threatId]) {
    threatControlMap[threatId].forEach(c => recommendations.add(c));
  }
  
  return Array.from(recommendations);
}
```

---

## 6-10. [Remaining Sections]

The remaining sections (Implementation Workflow, API Integration, UI Components, PDF Report Template, and Implementation Roadmap) follow the same pattern as the Office Building and Retail Store frameworks, adapted for warehouse-specific concerns.

**Key Warehouse-Specific Additions:**
- Cargo theft vulnerability heat map
- Loading dock security scoring dashboard
- Supply chain risk analysis
- Fleet tracking integration readiness
- Industry benchmarking (warehouse shrinkage rates)
- ROI calculator for cargo theft prevention investments

---

**END OF WAREHOUSE FRAMEWORK DOCUMENT**
