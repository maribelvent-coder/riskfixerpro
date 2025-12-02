# RiskFixer: Office Building Security Assessment Framework
## Comprehensive Specification for Corporate Facility Security

**Version:** 1.0  
**Integration Target:** RiskFixer Master Framework v2.0  
**Focus:** Corporate Office Building Security Assessments  
**Last Updated:** November 20, 2025

---

## Table of Contents

1. [Office Building Assessment Overview](#1-office-building-assessment-overview)
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

## 1. Office Building Assessment Overview

### 1.1 What Makes Office Building Assessments Unique

**Standard Physical Security Assessment:**
- General facility security principles
- One-size-fits-all approach
- Generic threat considerations

**Office Building Assessment:**
- **Business operations focus** - Understanding what the company does
- **Multi-zone security** - Different security levels for different areas
- **Employee population** - Life safety considerations at scale
- **Visitor management** - Balancing accessibility with security
- **Data/IP protection** - Physical security supporting information security
- **Workplace violence** - Specific protocols and response planning

### 1.2 Assessment Components

```
Office Building Assessment = 
  ┌──────────────────────────────────────────────────────────────┐
  │ 1. FACILITY OVERVIEW                                         │
  │    - Business operations and criticality                     │
  │    - Employee population and operating hours                 │
  │    - High-value assets and data classification               │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 2. PERIMETER SECURITY                                        │
  │    - Property boundaries and barriers                        │
  │    - Lighting and CPTED principles                           │
  │    - Surveillance coverage                                   │
  │    - Clear zones and landscaping                             │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 3. PARKING FACILITIES                                        │
  │    - Access control and monitoring                           │
  │    - Lighting and surveillance                               │
  │    - Incident history and patterns                           │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 4. BUILDING ENTRY POINTS                                     │
  │    - Access control systems                                  │
  │    - Visitor management                                      │
  │    - Tailgating prevention                                   │
  │    - Reception/security desk operations                      │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 5. INTERIOR ACCESS CONTROL                                   │
  │    - Zone-based security                                     │
  │    - Executive suite protection                              │
  │    - Server room/IT security                                 │
  │    - Access rights management                                │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 6. SURVEILLANCE SYSTEMS                                      │
  │    - Camera coverage and quality                             │
  │    - Monitoring vs. recording                                │
  │    - Video analytics capabilities                            │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 7. INTRUSION DETECTION                                       │
  │    - Alarm systems and sensors                               │
  │    - Monitoring and response                                 │
  │    - Testing and maintenance                                 │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 8. SECURITY PERSONNEL & PROCEDURES                           │
  │    - Staffing levels and coverage                            │
  │    - Training and qualifications                             │
  │    - Security awareness programs                             │
  │    - Policy documentation                                    │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 9. EMERGENCY PREPAREDNESS                                    │
  │    - Emergency response plans                                │
  │    - Active threat procedures                                │
  │    - Evacuation and rally points                             │
  │    - Mass notification systems                               │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 10. INCIDENT HISTORY ANALYSIS                                │
  │    - Past security incidents                                 │
  │    - Threat patterns and trends                              │
  │    - Incident documentation practices                        │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 11. CYBER-PHYSICAL SECURITY                                  │
  │    - Network segmentation                                    │
  │    - System hardening                                        │
  │    - Patch management                                        │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 12. DOCUMENT & DATA SECURITY                                 │
  │    - Clean desk policies                                     │
  │    - Secure destruction                                      │
  │    - Visitor information protection                          │
  └──────────────────────────────────────────────────────────────┘
              ↓
  ┌──────────────────────────────────────────────────────────────┐
  │ 13. LOADING DOCK & RECEIVING                                 │
  │    - Access control and monitoring                           │
  │    - Delivery verification                                   │
  │    - Vendor management                                       │
  └──────────────────────────────────────────────────────────────┘
```

### 1.3 Key Facility Zones

Office buildings are assessed across multiple security zones:

| Zone Type | Security Level | Typical Controls |
|-----------|----------------|------------------|
| **Perimeter** | Public | Fencing, lighting, cameras |
| **Parking** | Restricted | Access gates, cameras, patrols |
| **Lobby/Reception** | Public | Reception desk, visitor management, cameras |
| **Office Floors (General)** | Restricted | Badge access, cameras in corridors |
| **Executive Suite** | Controlled | Enhanced access control, panic buttons |
| **Server Room/IT** | High Security | Biometric access, environmental monitoring |
| **HR Department** | Controlled | Badge access, secure file storage |
| **Loading Dock** | Restricted | Access control, delivery logs, cameras |

---

## 2. Assessment Template Specifications

### 2.1 Template Definition

**Database Entry:**

```typescript
{
  name: 'Corporate Office Building Assessment',
  templateType: 'office_building',
  description: 'Comprehensive security assessment for corporate office facilities including perimeter security, access control, surveillance, and workplace violence preparedness.',
  siteTypeRecommendation: 'office',
  calculationMethod: 'tvi', // Use T×V×I model for office buildings
  isPublic: true,
  
  // Associated facility zones (created automatically)
  defaultZones: [
    'perimeter',
    'parking',
    'lobby',
    'office_area',
    'executive_suite',
    'server_room',
    'loading_dock'
  ],
  
  // Template-associated threats (15 threats)
  threatIds: [
    'forced_entry',
    'tailgating',
    'piggybacking',
    'theft_property',
    'theft_intellectual_property',
    'vandalism',
    'sabotage',
    'workplace_violence_active_threat',
    'workplace_violence_employee',
    'workplace_violence_domestic',
    'cyber_physical_access_hack',
    'cyber_physical_cctv',
    'espionage_surveillance',
    'natural_disaster_earthquake', // If applicable
    'natural_disaster_flood' // If applicable
  ],
  
  // Recommended controls (40+ controls)
  recommendedControlIds: [
    // Access Control
    'access_control_electronic',
    'biometric_access_control',
    'security_guard_reception',
    'visitor_management_system',
    'turnstiles_speed_gates',
    'man_trap',
    
    // Surveillance
    'cctv_fixed_indoor',
    'cctv_outdoor',
    'cctv_ptz',
    'cctv_monitoring_24_7',
    'video_analytics',
    
    // Intrusion Detection
    'intrusion_alarm_door_window',
    'motion_detectors_pir',
    'glass_break_sensors',
    'monitored_alarm_system',
    
    // Physical Barriers
    'perimeter_fence',
    'perimeter_fence_anti_climb',
    'reinforced_doors',
    'security_film_windows',
    'bollards_vehicle_barriers',
    
    // Security Personnel
    'roving_security_patrol',
    'armed_security_personnel', // Optional based on threat
    
    // Procedural Controls
    'visitor_access_policy',
    'background_checks',
    'security_awareness_training',
    'badge_display_policy',
    'clean_desk_policy',
    'emergency_response_plan',
    'active_threat_response_training',
    'access_control_audit',
    
    // Environmental Design
    'cpted_principles',
    'exterior_lighting',
    'clear_zone_landscaping',
    'signage_security_warnings',
    
    // Cyber-Physical
    'network_segmentation',
    'multi_factor_authentication',
    'security_system_patching'
  ]
}
```

### 2.2 Threat Library (Office Building Specific)

**From Master Framework Section 4.1 - Threats applicable to office buildings:**

| Threat | Category | Typical Likelihood | Typical Impact | ASIS Code |
|--------|----------|-------------------|----------------|-----------|
| Unauthorized Entry - Forced Entry | Physical Intrusion | 3 | 4 | PSC.1-2012-INT-001 |
| Unauthorized Entry - Tailgating | Physical Intrusion | 4 | 3 | PSC.1-2012-INT-002 |
| Unauthorized Entry - Piggybacking | Physical Intrusion | 4 | 3 | PSC.1-2012-INT-003 |
| Theft - Property/Equipment | Theft | 3 | 3 | PSC.1-2012-THF-001 |
| Theft - Intellectual Property | Theft | 2 | 5 | PSC.1-2012-THF-002 |
| Vandalism - Property Damage | Vandalism | 2 | 3 | PSC.1-2012-VAN-001 |
| Sabotage - Operational Disruption | Sabotage | 1 | 5 | PSC.1-2012-SAB-001 |
| Workplace Violence - Active Threat | Workplace Violence | 1 | 5 | PSC.1-2012-WPV-001 |
| Workplace Violence - Employee Conflict | Workplace Violence | 2 | 3 | PSC.1-2012-WPV-002 |
| Workplace Violence - Domestic Violence Spillover | Workplace Violence | 2 | 4 | PSC.1-2012-WPV-003 |
| Cyber-Physical - Access Control Hack | Cyber-Physical | 2 | 4 | PSC.1-2012-CYB-001 |
| Cyber-Physical - CCTV System Compromise | Cyber-Physical | 2 | 3 | PSC.1-2012-CYB-002 |
| Espionage - Technical Surveillance | Espionage | 1 | 4 | PSC.1-2012-ESP-001 |
| Natural Disaster - Earthquake | Natural Disaster | 1 | 5 | PSC.1-2012-NAT-001 |
| Natural Disaster - Flood | Natural Disaster | 2 | 4 | PSC.1-2012-NAT-002 |

---

## 3. Interview Protocol System

### 3.1 Interview Questionnaire Structure

**File Location:** `server/data/office-building-interview-questionnaire.ts`

```typescript
export interface InterviewQuestion {
  id: string;
  section: string;
  zoneApplicable?: string[]; // Which facility zones this question applies to
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: InterviewQuestion[];
  riskIndicators?: string[]; // Keywords that elevate risk
  
  // Direct mapping to risk scenarios
  informsThreat?: string[]; // Threat IDs this question informs
  informsVulnerability?: boolean; // Does this assess vulnerability?
  informsImpact?: boolean; // Does this assess potential impact?
  suggestsControls?: string[]; // Control IDs this might reveal need for
}
```

### 3.2 Complete Interview Questions (13 Sections, 80+ Questions)

#### **SECTION 1: FACILITY OVERVIEW & OPERATIONS**

```typescript
{
  id: 'facility_overview_1',
  section: 'Facility Overview & Operations',
  questionText: 'What is the total square footage of this facility?',
  questionType: 'text',
  required: true,
  informsImpact: true,
},

{
  id: 'facility_overview_2',
  section: 'Facility Overview & Operations',
  questionText: 'How many employees work at this location?',
  questionType: 'multiple_choice',
  options: [
    '1-25 employees',
    '26-100 employees',
    '101-250 employees',
    '251-500 employees',
    '500+ employees',
  ],
  required: true,
  informsImpact: true,
},

{
  id: 'facility_overview_3',
  section: 'Facility Overview & Operations',
  questionText: 'What are the primary business operations conducted here?',
  questionType: 'checklist',
  options: [
    'Administrative/Corporate offices',
    'Research & Development',
    'Financial services/Banking',
    'Legal services',
    'Healthcare/Medical',
    'Technology/Software development',
    'Manufacturing/Production',
    'Customer service/Call center',
    'Data center operations',
    'Other (specify in notes)',
  ],
  required: true,
  informsThreat: ['theft_intellectual_property'],
  informsImpact: true,
},

{
  id: 'facility_overview_4',
  section: 'Facility Overview & Operations',
  questionText: 'What is the facility\'s classification regarding sensitive information?',
  questionType: 'multiple_choice',
  options: [
    'Handles classified government information',
    'Processes highly confidential corporate data (trade secrets, M&A)',
    'Standard corporate confidential information',
    'General business information only',
    'Public-facing operations with minimal sensitive data',
  ],
  required: true,
  informsThreat: ['theft_intellectual_property', 'espionage_surveillance'],
  informsImpact: true,
},

{
  id: 'facility_overview_5',
  section: 'Facility Overview & Operations',
  questionText: 'What are the facility\'s operating hours?',
  questionType: 'multiple_choice',
  options: [
    '24/7 operations',
    'Extended hours (6 AM - 10 PM)',
    'Standard business hours (8 AM - 6 PM)',
    'Limited hours (9 AM - 5 PM)',
    'Varies by department',
  ],
  required: true,
  informsVulnerability: true,
},

{
  id: 'facility_overview_6',
  section: 'Facility Overview & Operations',
  questionText: 'How many employees typically work after standard business hours (after 6 PM)?',
  questionType: 'multiple_choice',
  options: [
    'None - building closed',
    '1-10 employees',
    '11-25 employees',
    '26-50 employees',
    '50+ employees',
  ],
  required: true,
  informsVulnerability: true,
  informsThreat: ['workplace_violence_active_threat'],
  riskIndicators: ['none', '1-10'],
},

{
  id: 'facility_overview_7',
  section: 'Facility Overview & Operations',
  questionText: 'Does the facility have high-value equipment or assets?',
  questionType: 'yes_no',
  required: true,
  informsThreat: ['theft_property'],
  followUpQuestions: [
    {
      id: 'facility_overview_7a',
      section: 'Facility Overview & Operations',
      questionText: 'What types of high-value assets are present? (Select all that apply)',
      questionType: 'checklist',
      options: [
        'Computer equipment and servers',
        'Laboratory equipment',
        'Manufacturing equipment',
        'Medical equipment',
        'Audio/Visual equipment',
        'Company vehicles',
        'Prototypes or product samples',
        'Cash or negotiable instruments',
      ],
      required: true,
      informsImpact: true,
    },
    {
      id: 'facility_overview_7b',
      section: 'Facility Overview & Operations',
      questionText: 'What is the approximate total value of portable equipment/assets?',
      questionType: 'multiple_choice',
      options: [
        'Less than $50,000',
        '$50,000 - $250,000',
        '$250,000 - $1 million',
        '$1 million - $5 million',
        'Over $5 million',
      ],
      required: true,
      informsImpact: true,
    },
  ],
},
```

#### **SECTION 2: PERIMETER SECURITY**

```typescript
{
  id: 'perimeter_1',
  section: 'Perimeter Security',
  zoneApplicable: ['perimeter'],
  questionText: 'Is the property boundary clearly defined?',
  questionType: 'multiple_choice',
  options: [
    'Yes - fenced perimeter',
    'Yes - natural boundary (landscaping, terrain)',
    'Yes - building walls form perimeter',
    'No - open/undefined boundary',
  ],
  required: true,
  informsVulnerability: true,
  informsThreat: ['forced_entry', 'vandalism'],
  riskIndicators: ['no - open'],
  suggestsControls: ['perimeter_fence'],
},

{
  id: 'perimeter_2',
  section: 'Perimeter Security',
  zoneApplicable: ['perimeter'],
  questionText: 'If fenced, what is the fence height and type?',
  questionType: 'multiple_choice',
  options: [
    'No fence present',
    'Decorative/low fence (under 4 ft)',
    'Standard chain-link (6-8 ft)',
    'High security fence (8+ ft) with anti-climb features',
    'Reinforced/hardened perimeter barrier',
  ],
  required: true,
  informsVulnerability: true,
  riskIndicators: ['no fence', 'decorative'],
  suggestsControls: ['perimeter_fence_anti_climb'],
},

{
  id: 'perimeter_3',
  section: 'Perimeter Security',
  zoneApplicable: ['perimeter'],
  questionText: 'Are there perimeter intrusion detection systems?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  suggestsControls: ['perimeter_intrusion_detection'],
  followUpQuestions: [
    {
      id: 'perimeter_3a',
      section: 'Perimeter Security',
      questionText: 'What type of perimeter detection is installed?',
      questionType: 'checklist',
      options: [
        'Fence-mounted sensors',
        'Buried cable sensors',
        'Infrared/laser beams',
        'Video analytics on perimeter cameras',
        'Motion sensors',
      ],
      required: true,
    },
  ],
},

{
  id: 'perimeter_4',
  section: 'Perimeter Security',
  zoneApplicable: ['perimeter'],
  questionText: 'Is perimeter lighting adequate for nighttime security?',
  questionType: 'rating',
  ratingScale: {
    min: 1,
    max: 5,
    labels: ['No lighting', 'Poor lighting', 'Adequate', 'Good', 'Excellent'],
  },
  required: true,
  informsVulnerability: true,
  riskIndicators: ['1', '2'],
  suggestsControls: ['exterior_lighting'],
},

{
  id: 'perimeter_5',
  section: 'Perimeter Security',
  zoneApplicable: ['perimeter'],
  questionText: 'Are there clear zones maintained around the building perimeter?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  suggestsControls: ['clear_zone_landscaping'],
  followUpQuestions: [
    {
      id: 'perimeter_5a',
      section: 'Perimeter Security',
      questionText: 'Approximately how many feet is the clear zone around the building?',
      questionType: 'multiple_choice',
      options: [
        'Less than 5 feet',
        '5-10 feet',
        '10-15 feet',
        '15-25 feet',
        '25+ feet',
      ],
      required: true,
      riskIndicators: ['less than 5'],
    },
  ],
},

{
  id: 'perimeter_6',
  section: 'Perimeter Security',
  zoneApplicable: ['perimeter'],
  questionText: 'Are landscaping elements maintained to prevent concealment?',
  questionType: 'multiple_choice',
  options: [
    'Yes - vegetation kept below 3 ft near building',
    'Partially - some overgrown areas exist',
    'No - significant concealment opportunities',
    'Not applicable - no vegetation',
  ],
  required: true,
  informsVulnerability: true,
  riskIndicators: ['no - significant'],
  suggestsControls: ['clear_zone_landscaping'],
},

{
  id: 'perimeter_7',
  section: 'Perimeter Security',
  zoneApplicable: ['perimeter'],
  questionText: 'Are CCTV cameras covering the perimeter?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  suggestsControls: ['cctv_outdoor'],
  followUpQuestions: [
    {
      id: 'perimeter_7a',
      section: 'Perimeter Security',
      questionText: 'What percentage of the perimeter has camera coverage?',
      questionType: 'multiple_choice',
      options: [
        'Complete (100%)',
        'Most areas (75-99%)',
        'Partial coverage (50-74%)',
        'Limited coverage (25-49%)',
        'Minimal coverage (<25%)',
      ],
      required: true,
      riskIndicators: ['limited', 'minimal'],
    },
    {
      id: 'perimeter_7b',
      section: 'Perimeter Security',
      questionText: 'Are perimeter cameras monitored in real-time or recording only?',
      questionType: 'multiple_choice',
      options: [
        'Real-time monitoring 24/7',
        'Real-time monitoring during business hours only',
        'Recording only - reviewed after incidents',
        'Recording only - rarely reviewed',
      ],
      required: true,
      riskIndicators: ['rarely reviewed'],
      suggestsControls: ['cctv_monitoring_24_7'],
    },
  ],
},
```

#### **SECTION 3: PARKING FACILITIES**

```typescript
{
  id: 'parking_1',
  section: 'Parking Facilities',
  zoneApplicable: ['parking'],
  questionText: 'What type of parking does the facility provide?',
  questionType: 'checklist',
  options: [
    'Surface parking lot',
    'Multi-level parking structure',
    'Underground parking garage',
    'Street parking only',
    'No dedicated parking',
  ],
  required: true,
},

{
  id: 'parking_2',
  section: 'Parking Facilities',
  zoneApplicable: ['parking'],
  questionText: 'Is parking access controlled?',
  questionType: 'multiple_choice',
  options: [
    'Yes - gate with badge/card access',
    'Yes - gate with attendant/security',
    'Yes - permit system with visual verification',
    'No - open access',
  ],
  required: true,
  informsVulnerability: true,
  informsThreat: ['forced_entry', 'theft_property', 'workplace_violence_domestic'],
  riskIndicators: ['no - open'],
  suggestsControls: ['access_control_electronic', 'security_guard_reception'],
},

{
  id: 'parking_3',
  section: 'Parking Facilities',
  zoneApplicable: ['parking'],
  questionText: 'Rate the lighting in parking areas:',
  questionType: 'rating',
  ratingScale: {
    min: 1,
    max: 5,
    labels: ['Very poor', 'Poor', 'Adequate', 'Good', 'Excellent'],
  },
  required: true,
  informsVulnerability: true,
  riskIndicators: ['1', '2'],
  suggestsControls: ['exterior_lighting'],
},

{
  id: 'parking_4',
  section: 'Parking Facilities',
  zoneApplicable: ['parking'],
  questionText: 'Are parking areas monitored by CCTV?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  suggestsControls: ['cctv_outdoor'],
  followUpQuestions: [
    {
      id: 'parking_4a',
      section: 'Parking Facilities',
      questionText: 'What is the camera coverage in parking areas?',
      questionType: 'multiple_choice',
      options: [
        'Comprehensive coverage of all areas',
        'Coverage of entry/exit points only',
        'Partial coverage with blind spots',
        'Minimal coverage',
      ],
      required: true,
      riskIndicators: ['partial', 'minimal'],
    },
  ],
},

{
  id: 'parking_5',
  section: 'Parking Facilities',
  zoneApplicable: ['parking'],
  questionText: 'Have there been security incidents in parking areas in the past 12 months?',
  questionType: 'yes_no',
  required: true,
  informsThreat: ['theft_property', 'vandalism', 'workplace_violence_domestic'],
  followUpQuestions: [
    {
      id: 'parking_5a',
      section: 'Parking Facilities',
      questionText: 'What types of incidents have occurred? (Select all that apply)',
      questionType: 'checklist',
      options: [
        'Vehicle break-ins/theft from vehicles',
        'Vehicle theft',
        'Vandalism to vehicles',
        'Personal assaults or threats',
        'Suspicious persons/loitering',
        'Accidents/safety incidents',
      ],
      required: true,
      riskIndicators: ['break-ins', 'theft', 'assaults'],
    },
    {
      id: 'parking_5b',
      section: 'Parking Facilities',
      questionText: 'How many incidents occurred in the past 12 months?',
      questionType: 'multiple_choice',
      options: ['1-2', '3-5', '6-10', '10+'],
      required: true,
      riskIndicators: ['6-10', '10+'],
    },
  ],
},

{
  id: 'parking_6',
  section: 'Parking Facilities',
  zoneApplicable: ['parking'],
  questionText: 'Is there security patrol coverage of parking areas?',
  questionType: 'multiple_choice',
  options: [
    'Yes - 24/7 coverage',
    'Yes - during business hours only',
    'Yes - periodic random patrols',
    'No security patrol',
  ],
  required: true,
  informsVulnerability: true,
  suggestsControls: ['roving_security_patrol'],
},
```

#### **SECTION 4: BUILDING ENTRY POINTS & LOBBY**

```typescript
{
  id: 'entry_1',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'How many public entry points does the building have during business hours?',
  questionType: 'multiple_choice',
  options: [
    'One main entrance only',
    '2-3 entrances',
    '4-5 entrances',
    'More than 5 entrances',
  ],
  required: true,
  informsVulnerability: true,
  riskIndicators: ['more than 5'],
},

{
  id: 'entry_2',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'Is there a staffed reception desk at the main entrance?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  informsThreat: ['tailgating', 'piggybacking'],
  suggestsControls: ['security_guard_reception'],
  followUpQuestions: [
    {
      id: 'entry_2a',
      section: 'Building Entry Points & Lobby',
      questionText: 'What are the reception desk operating hours?',
      questionType: 'multiple_choice',
      options: [
        '24/7 coverage',
        'Extended hours (6 AM - 10 PM)',
        'Business hours only (8 AM - 6 PM)',
        'Limited hours',
      ],
      required: true,
      riskIndicators: ['limited hours'],
    },
  ],
},

{
  id: 'entry_3',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'What type of access control is used at main entry points?',
  questionType: 'multiple_choice',
  options: [
    'Badge/card reader with turnstiles or speed gates',
    'Badge/card reader on doors (no physical barriers)',
    'Security guard verification only',
    'Open access during business hours',
  ],
  required: true,
  informsVulnerability: true,
  informsThreat: ['tailgating', 'piggybacking', 'forced_entry'],
  riskIndicators: ['open access'],
  suggestsControls: ['access_control_electronic', 'turnstiles_speed_gates'],
},

{
  id: 'entry_4',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'Does the access control system prevent tailgating?',
  questionType: 'multiple_choice',
  options: [
    'Yes - physical barriers (turnstiles, man trap, speed gates)',
    'Partial - card readers with anti-passback but no physical barrier',
    'No - card readers only, no tailgating prevention',
    'No access control system',
  ],
  required: true,
  informsVulnerability: true,
  informsThreat: ['tailgating', 'piggybacking'],
  riskIndicators: ['no - card readers only', 'no access control'],
  suggestsControls: ['turnstiles_speed_gates', 'man_trap'],
},

{
  id: 'entry_5',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'Is there a visitor management system?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  informsThreat: ['tailgating'],
  suggestsControls: ['visitor_management_system'],
  followUpQuestions: [
    {
      id: 'entry_5a',
      section: 'Building Entry Points & Lobby',
      questionText: 'Describe the visitor management process: (Select all that apply)',
      questionType: 'checklist',
      options: [
        'Photo ID required and scanned',
        'Visitor badge issued',
        'Host notification (call/text/email)',
        'Sign-in log maintained',
        'Escort required at all times',
        'Background check for contractors/vendors',
      ],
      required: true,
    },
    {
      id: 'entry_5b',
      section: 'Building Entry Points & Lobby',
      questionText: 'Are visitors required to be escorted?',
      questionType: 'multiple_choice',
      options: [
        'Yes - always escorted',
        'Yes - escorted to sensitive areas only',
        'No - visitors can move freely once signed in',
      ],
      required: true,
      riskIndicators: ['no - visitors can move freely'],
    },
  ],
},

{
  id: 'entry_6',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'How many visitors does the facility receive on an average day?',
  questionType: 'multiple_choice',
  options: [
    'Very few (0-5)',
    'Low volume (6-20)',
    'Moderate volume (21-50)',
    'High volume (51-100)',
    'Very high volume (100+)',
  ],
  required: true,
  informsVulnerability: true,
},

{
  id: 'entry_7',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'Are entry doors equipped with forced-entry resistant hardware?',
  questionType: 'multiple_choice',
  options: [
    'Yes - reinforced doors, frames, and high-security locks',
    'Yes - commercial-grade locks and reinforced strike plates',
    'Partial - standard commercial doors with basic locks',
    'No - residential-grade or lightweight doors',
  ],
  required: true,
  informsVulnerability: true,
  informsThreat: ['forced_entry'],
  riskIndicators: ['partial', 'no'],
  suggestsControls: ['reinforced_doors'],
},

{
  id: 'entry_8',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'Are all entry points monitored by CCTV cameras?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  suggestsControls: ['cctv_fixed_indoor'],
  followUpQuestions: [
    {
      id: 'entry_8a',
      section: 'Building Entry Points & Lobby',
      questionText: 'Where are cameras positioned? (Select all that apply)',
      questionType: 'checklist',
      options: [
        'Main entrance exterior',
        'Main entrance interior/lobby',
        'All secondary entrances',
        'Reception desk area',
        'Elevator lobbies',
      ],
      required: true,
    },
  ],
},

{
  id: 'entry_9',
  section: 'Building Entry Points & Lobby',
  zoneApplicable: ['lobby'],
  questionText: 'How are after-hours entry points secured?',
  questionType: 'multiple_choice',
  options: [
    'All but one entrance locked; badge access required',
    'All entrances locked; security guard allows entry',
    'Multiple entrances remain badge-accessible',
    'Building remains open/unsecured after hours',
  ],
  required: true,
  informsVulnerability: true,
  informsThreat: ['forced_entry'],
  riskIndicators: ['remains open'],
},
```

#### **SECTION 5: INTERIOR ACCESS CONTROL**

```typescript
{
  id: 'interior_access_1',
  section: 'Interior Access Control',
  zoneApplicable: ['office_area'],
  questionText: 'Is internal access control used to segment different areas?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  informsThreat: ['unauthorized_entry'],
  suggestsControls: ['access_control_electronic'],
  followUpQuestions: [
    {
      id: 'interior_access_1a',
      section: 'Interior Access Control',
      questionText: 'Which areas require badge access? (Select all that apply)',
      questionType: 'checklist',
      options: [
        'Executive suite/C-level offices',
        'IT/Server rooms',
        'Research & Development areas',
        'HR department',
        'Finance/Accounting',
        'Conference rooms',
        'Supply/storage rooms',
        'Elevator access to certain floors',
      ],
      required: true,
    },
  ],
},

{
  id: 'interior_access_2',
  section: 'Interior Access Control',
  zoneApplicable: ['office_area'],
  questionText: 'How often are access rights reviewed and updated?',
  questionType: 'multiple_choice',
  options: [
    'Quarterly or more frequently',
    'Semi-annually',
    'Annually',
    'Only when employee status changes',
    'Rarely or never reviewed',
  ],
  required: true,
  informsVulnerability: true,
  riskIndicators: ['rarely or never'],
  suggestsControls: ['access_control_audit'],
},

{
  id: 'interior_access_3',
  section: 'Interior Access Control',
  zoneApplicable: ['office_area'],
  questionText: 'Are employee badges required to be visibly displayed?',
  questionType: 'multiple_choice',
  options: [
    'Yes - strictly enforced',
    'Yes - required but inconsistently enforced',
    'No - not required',
  ],
  required: true,
  informsVulnerability: true,
  riskIndicators: ['no - not required'],
  suggestsControls: ['badge_display_policy'],
},

{
  id: 'interior_access_4',
  section: 'Interior Access Control',
  zoneApplicable: ['server_room'],
  questionText: 'How is access to IT/server rooms controlled?',
  questionType: 'multiple_choice',
  options: [
    'Biometric access (fingerprint/retina) + badge',
    'Badge access with mantrap/two-factor entry',
    'Badge access only',
    'Key/lock only',
    'No dedicated access control',
  ],
  required: true,
  informsVulnerability: true,
  informsThreat: ['unauthorized_entry', 'sabotage', 'theft_intellectual_property'],
  riskIndicators: ['key/lock only', 'no dedicated'],
  suggestsControls: ['biometric_access_control', 'man_trap'],
},

{
  id: 'interior_access_5',
  section: 'Interior Access Control',
  zoneApplicable: ['server_room'],
  questionText: 'Is IT/server room access logged and monitored?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  followUpQuestions: [
    {
      id: 'interior_access_5a',
      section: 'Interior Access Control',
      questionText: 'How frequently are server room access logs reviewed?',
      questionType: 'multiple_choice',
      options: [
        'Daily',
        'Weekly',
        'Monthly',
        'Only after incidents',
        'Never reviewed',
      ],
      required: true,
      riskIndicators: ['only after incidents', 'never reviewed'],
    },
  ],
},

{
  id: 'interior_access_6',
  section: 'Interior Access Control',
  zoneApplicable: ['executive_suite'],
  questionText: 'Are there special security measures for executive areas?',
  questionType: 'yes_no',
  required: true,
  informsVulnerability: true,
  informsThreat: ['workplace_violence_active_threat', 'theft_intellectual_property'],
  followUpQuestions: [
    {
      id: 'interior_access_6a',
      section: 'Interior Access Control',
      questionText: 'What security measures are in place? (Select all that apply)',
      questionType: 'checklist',
      options: [
        'Separate access control (limited badge access)',
        'Security personnel stationed in executive area',
        'Panic buttons in executive offices',
        'Enhanced CCTV coverage',
        'Soundproofing/privacy measures',
        'Safe or secure storage for sensitive documents',
      ],
      required: true,
    },
  ],
},

{
  id: 'interior_access_7',
  section: 'Interior Access Control',
  zoneApplicable: ['office_area'],
  questionText: 'What happens when an employee is terminated or leaves the company?',
  questionType: 'multiple_choice',
  options: [
    'Badge immediately deactivated and collected; locks changed if applicable',
    'Badge deactivated same day',
    'Badge deactivated within 24-48 hours',
    'Badge eventually deactivated (no standard timeframe)',
  ],
  required: true,
  informsVulnerability: true,
  riskIndicators: ['eventually deactivated'],
  suggestsControls: ['access_control_audit'],
},
```

#### **SECTIONS 6-13 Continue with:**
- Surveillance Systems (6 questions)
- Intrusion Detection & Alarm Systems (5 questions)
- Security Personnel & Procedures (7 questions)
- Emergency Preparedness & Response (8 questions)
- Incident History (4 questions)
- Cyber-Physical Security (5 questions)
- Physical Document & Data Security (4 questions)
- Loading Dock & Receiving (1 question with 4 follow-ups)

**[Due to length, full questions are in the exported TypeScript file]**

---

## 4. Risk Mapping & Calculation Integration

### 4.1 Interview → T×V×I Calculation Flow

```typescript
// server/services/office-interview-risk-mapper.ts

export interface InterviewRiskMapping {
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
  // Get questions that inform this threat
  const relevantQuestions = getThreatQuestions(threatId);
  
  let vulnerabilityScore = 3; // Start at baseline (moderate)
  let riskFactorCount = 0;
  
  for (const questionId of relevantQuestions) {
    const response = responses[questionId];
    const question = getQuestion(questionId);
    
    // Check if response contains risk indicators
    if (question.riskIndicators && question.riskIndicators.length > 0) {
      for (const indicator of question.riskIndicators) {
        if (responseMatchesIndicator(response, indicator)) {
          riskFactorCount++;
        }
      }
    }
    
    // Check for missing controls
    if (question.suggestsControls && question.suggestsControls.length > 0) {
      if (response === 'no' || response === false) {
        riskFactorCount++;
      }
    }
    
    // Check rating scales (low ratings = higher vulnerability)
    if (question.questionType === 'rating' && typeof response === 'number') {
      if (response <= 2) {
        riskFactorCount += 2; // Poor ratings count double
      }
    }
  }
  
  // Adjust vulnerability score based on risk factors
  // Each 2 risk factors increases vulnerability by 1 point
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
  let likelihood = 2; // Start at baseline (unlikely)
  
  // FACTOR 1: Incident History (most important)
  if (responses.incident_history_1 === 'yes') {
    const incidentTypes = responses.incident_history_1a || [];
    
    // Map incident types to threats
    const incidentThreatMap: Record<string, string[]> = {
      'Unauthorized entry/intrusion': ['forced_entry', 'tailgating', 'piggybacking'],
      'Theft of company property': ['theft_property'],
      'Theft of personal property': ['theft_property'],
      'Vandalism': ['vandalism'],
      'Workplace violence (threat or actual)': ['workplace_violence_employee', 'workplace_violence_active_threat'],
      'Active threat/active shooter': ['workplace_violence_active_threat'],
      'Domestic violence spillover': ['workplace_violence_domestic'],
      'Cyber incident with physical component': ['cyber_physical_access_hack', 'cyber_physical_cctv'],
    };
    
    for (const incidentType of incidentTypes) {
      const threats = incidentThreatMap[incidentType] || [];
      if (threats.includes(threatId)) {
        likelihood += 2; // Historical incident = significantly higher likelihood
        break;
      }
    }
    
    // Check frequency
    const incidentCount = responses.incident_history_1b;
    if (incidentCount === '6-10 incidents' || incidentCount === '10+ incidents') {
      likelihood += 1; // Pattern of incidents
    }
  }
  
  // FACTOR 2: Specific Threat Patterns
  
  // Workplace Violence - Active Threat
  if (threatId === 'workplace_violence_active_threat') {
    if (responses.incident_history_3 === 'yes') {
      likelihood += 1; // Prior threats increase likelihood
    }
    if (responses.emergency_3 === 'no') {
      likelihood += 0; // No drill doesn't increase likelihood, but lack of preparedness increases vulnerability
    }
  }
  
  // Parking Theft/Vandalism
  if (threatId === 'theft_property' || threatId === 'vandalism') {
    if (responses.parking_5 === 'yes') {
      const parkingIncidents = responses.parking_5a || [];
      if (parkingIncidents.includes('Vehicle break-ins/theft from vehicles') ||
          parkingIncidents.includes('Vandalism to vehicles')) {
        likelihood += 1;
      }
    }
  }
  
  // Tailgating/Piggybacking
  if (threatId === 'tailgating' || threatId === 'piggybacking') {
    const visitorVolume = responses.entry_6;
    if (visitorVolume === 'High volume (51-100)' || 
        visitorVolume === 'Very high volume (100+)') {
      likelihood += 1; // High traffic = more tailgating opportunities
    }
  }
  
  // IP Theft/Espionage
  if (threatId === 'theft_intellectual_property' || threatId === 'espionage_surveillance') {
    const dataClass = responses.facility_overview_4;
    if (dataClass === 'Handles classified government information' ||
        dataClass === 'Processes highly confidential corporate data (trade secrets, M&A)') {
      likelihood += 1; // High-value targets attract sophisticated adversaries
    }
    
    const businessOps = responses.facility_overview_3 || [];
    if (businessOps.includes('Research & Development') ||
        businessOps.includes('Technology/Software development')) {
      likelihood += 1; // R&D targets
    }
  }
  
  // Cap at 5
  return Math.min(5, likelihood);
}
```

### 4.4 Impact Calculation

```typescript
export function calculateImpactFromInterview(
  responses: InterviewResponses,
  threatId: string
): number {
  let impact = 3; // Baseline moderate impact
  
  // FACTOR 1: Facility Size & Population
  const employeeCount = responses.facility_overview_2;
  const employeeImpactMap: Record<string, number> = {
    '1-25 employees': 0,
    '26-100 employees': 0,
    '101-250 employees': 1,
    '251-500 employees': 1,
    '500+ employees': 2,
  };
  impact += employeeImpactMap[employeeCount] || 0;
  
  // FACTOR 2: Business Criticality
  const businessType = responses.facility_overview_3 || [];
  const criticalOperations = [
    'Financial services/Banking',
    'Healthcare/Medical',
    'Data center operations',
  ];
  
  if (criticalOperations.some(op => businessType.includes(op))) {
    impact += 1; // Critical infrastructure
  }
  
  // FACTOR 3: Data Sensitivity
  const dataClass = responses.facility_overview_4;
  if (dataClass === 'Handles classified government information') {
    impact += 2; // National security implications
  } else if (dataClass === 'Processes highly confidential corporate data (trade secrets, M&A)') {
    impact += 1; // Significant business impact
  }
  
  // FACTOR 4: Asset Value
  if (responses.facility_overview_7 === 'yes') {
    const assetValue = responses.facility_overview_7b;
    const assetImpactMap: Record<string, number> = {
      'Less than $50,000': 0,
      '$50,000 - $250,000': 0,
      '$250,000 - $1 million': 1,
      '$1 million - $5 million': 1,
      'Over $5 million': 2,
    };
    impact += assetImpactMap[assetValue] || 0;
  }
  
  // THREAT-SPECIFIC IMPACT OVERRIDES
  
  // Workplace Violence - Always Catastrophic
  if (threatId === 'workplace_violence_active_threat') {
    impact = 5; // Life safety is always maximum impact
  }
  
  // Sabotage - Operational Disruption
  if (threatId === 'sabotage') {
    const businessOps = responses.facility_overview_3 || [];
    if (businessOps.includes('Manufacturing/Production') ||
        businessOps.includes('Data center operations')) {
      impact = Math.max(impact, 4); // Severe operational impact
    }
  }
  
  // IP Theft - Based on Data Classification
  if (threatId === 'theft_intellectual_property') {
    if (dataClass === 'Handles classified government information' ||
        dataClass === 'Processes highly confidential corporate data (trade secrets, M&A)') {
      impact = 5; // Catastrophic competitive/national security impact
    }
  }
  
  // Cap at 5
  return Math.min(5, impact);
}
```

### 4.5 Control Recommendation Engine

```typescript
export function generateControlRecommendations(
  responses: InterviewResponses,
  threatId?: string
): string[] {
  const recommendations = new Set<string>();
  
  // Scan all questions for suggested controls
  for (const question of officeInterviewQuestionnaire) {
    const response = responses[question.id];
    
    // If question suggests controls and vulnerability indicated
    if (question.suggestsControls && question.suggestsControls.length > 0) {
      
      // Yes/No questions - "no" indicates missing control
      if (question.questionType === 'yes_no' && response === 'no') {
        question.suggestsControls.forEach(c => recommendations.add(c));
      }
      
      // Multiple choice with risk indicators
      if (question.questionType === 'multiple_choice' && question.riskIndicators) {
        for (const indicator of question.riskIndicators) {
          if (responseMatchesIndicator(response, indicator)) {
            question.suggestsControls.forEach(c => recommendations.add(c));
            break;
          }
        }
      }
      
      // Rating scales - low scores indicate need
      if (question.questionType === 'rating' && typeof response === 'number') {
        if (response <= 2) { // Poor rating
          question.suggestsControls.forEach(c => recommendations.add(c));
        }
      }
    }
  }
  
  // Threat-specific control recommendations
  if (threatId) {
    const threatControlMap: Record<string, string[]> = {
      'forced_entry': ['reinforced_doors', 'intrusion_alarm_door_window', 'perimeter_fence_anti_climb'],
      'tailgating': ['turnstiles_speed_gates', 'man_trap', 'security_guard_reception'],
      'piggybacking': ['turnstiles_speed_gates', 'badge_display_policy'],
      'theft_property': ['cctv_fixed_indoor', 'cctv_outdoor', 'access_control_electronic'],
      'theft_intellectual_property': ['access_control_electronic', 'clean_desk_policy', 'visitor_management_system'],
      'workplace_violence_active_threat': ['active_threat_response_training', 'emergency_response_plan', 'cctv_monitoring_24_7'],
      'cyber_physical_access_hack': ['network_segmentation', 'multi_factor_authentication', 'security_system_patching'],
    };
    
    const threatControls = threatControlMap[threatId] || [];
    threatControls.forEach(c => recommendations.add(c));
  }
  
  return Array.from(recommendations);
}
```

### 4.6 Automated Risk Scenario Creation

```typescript
export async function initializeRiskScenariosFromInterview(
  assessmentId: number,
  interviewResponses: InterviewResponses
): Promise<RiskScenario[]> {
  
  // Get assessment template
  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, assessmentId),
    with: {
      template: {
        with: {
          threats: {
            with: { threat: true }
          }
        }
      }
    }
  });
  
  if (!assessment || !assessment.template) {
    throw new Error('Assessment or template not found');
  }
  
  const riskScenarios: NewRiskScenario[] = [];
  
  // Create risk scenario for each template threat
  for (const templateThreat of assessment.template.threats) {
    const threat = templateThreat.threat;
    
    // Calculate T×V×I from interview
    const threatLikelihood = calculateThreatLikelihoodFromInterview(
      interviewResponses,
      threat.id
    );
    
    const vulnerability = calculateVulnerabilityFromInterview(
      interviewResponses,
      threat.id
    );
    
    const impact = calculateImpactFromInterview(
      interviewResponses,
      threat.id
    );
    
    // Calculate inherent risk
    const inherentRisk = threatLikelihood * vulnerability * impact;
    
    // Classify risk level
    const riskLevel = classifyRiskLevel(inherentRisk);
    
    // Generate scenario description from interview context
    const scenarioDescription = generateScenarioDescription(
      threat,
      interviewResponses,
      threatLikelihood,
      vulnerability,
      impact
    );
    
    // Create risk scenario
    const scenario: NewRiskScenario = {
      assessmentId,
      threatId: threat.id,
      threatLikelihood,
      vulnerability,
      impact,
      inherentRisk,
      residualRisk: inherentRisk, // Initially same as inherent
      controlEffectiveness: 0,
      riskLevel,
      scenarioDescription,
    };
    
    riskScenarios.push(scenario);
  }
  
  // Bulk insert risk scenarios
  const insertedScenarios = await db
    .insert(riskScenarios)
    .values(riskScenarios)
    .returning();
  
  // Generate control recommendations for each scenario
  for (const scenario of insertedScenarios) {
    const suggestedControls = generateControlRecommendations(
      interviewResponses,
      scenario.threatId
    );
    
    // Store suggested controls in a separate table or field
    // (Implementation depends on your schema design)
  }
  
  return insertedScenarios;
}
```

---

## 5. Control Selection & Recommendations

### 5.1 Threat-to-Control Mapping

```typescript
export const officeBuildingThreatControlMapping: Record<string, string[]> = {
  // Physical Intrusion
  'forced_entry': [
    'perimeter_fence',
    'perimeter_fence_anti_climb',
    'reinforced_doors',
    'intrusion_alarm_door_window',
    'glass_break_sensors',
    'monitored_alarm_system',
    'exterior_lighting',
    'cctv_outdoor',
  ],
  
  'tailgating': [
    'turnstiles_speed_gates',
    'man_trap',
    'security_guard_reception',
    'visitor_management_system',
    'badge_display_policy',
    'cctv_fixed_indoor',
    'security_awareness_training',
  ],
  
  'piggybacking': [
    'turnstiles_speed_gates',
    'man_trap',
    'security_guard_reception',
    'badge_display_policy',
    'security_awareness_training',
  ],
  
  // Theft
  'theft_property': [
    'access_control_electronic',
    'cctv_fixed_indoor',
    'cctv_outdoor',
    'cctv_monitoring_24_7',
    'roving_security_patrol',
    'intrusion_alarm_door_window',
    'motion_detectors_pir',
    'exterior_lighting',
  ],
  
  'theft_intellectual_property': [
    'access_control_electronic',
    'biometric_access_control',
    'visitor_management_system',
    'clean_desk_policy',
    'background_checks',
    'access_control_audit',
    'cctv_fixed_indoor',
    'visitor_access_policy',
  ],
  
  // Vandalism
  'vandalism': [
    'perimeter_fence',
    'exterior_lighting',
    'cctv_outdoor',
    'roving_security_patrol',
    'signage_security_warnings',
  ],
  
  // Sabotage
  'sabotage': [
    'access_control_electronic',
    'biometric_access_control',
    'background_checks',
    'visitor_management_system',
    'cctv_fixed_indoor',
    'access_control_audit',
  ],
  
  // Workplace Violence
  'workplace_violence_active_threat': [
    'emergency_response_plan',
    'active_threat_response_training',
    'cctv_monitoring_24_7',
    'access_control_electronic',
    'visitor_management_system',
    'security_guard_reception',
    'roving_security_patrol',
  ],
  
  'workplace_violence_employee': [
    'background_checks',
    'security_awareness_training',
    'emergency_response_plan',
    'cctv_fixed_indoor',
  ],
  
  'workplace_violence_domestic': [
    'visitor_management_system',
    'security_guard_reception',
    'access_control_electronic',
    'cctv_outdoor',
  ],
  
  // Cyber-Physical
  'cyber_physical_access_hack': [
    'network_segmentation',
    'multi_factor_authentication',
    'security_system_patching',
    'access_control_audit',
  ],
  
  'cyber_physical_cctv': [
    'network_segmentation',
    'multi_factor_authentication',
    'security_system_patching',
  ],
  
  // Espionage
  'espionage_surveillance': [
    'visitor_management_system',
    'clean_desk_policy',
    'access_control_electronic',
    'biometric_access_control',
    'cctv_fixed_indoor',
    'background_checks',
  ],
};
```

### 5.2 Vulnerability-to-Control Mapping

```typescript
export const vulnerabilityControlMapping: Record<string, string[]> = {
  // Perimeter Vulnerabilities
  'no_perimeter_boundary': ['perimeter_fence', 'perimeter_fence_anti_climb', 'signage_security_warnings'],
  'inadequate_perimeter_lighting': ['exterior_lighting'],
  'no_clear_zones': ['clear_zone_landscaping', 'cpted_principles'],
  'concealment_opportunities': ['clear_zone_landscaping', 'exterior_lighting'],
  
  // Entry Point Vulnerabilities
  'no_access_control': ['access_control_electronic', 'security_guard_reception'],
  'tailgating_possible': ['turnstiles_speed_gates', 'man_trap'],
  'no_visitor_management': ['visitor_management_system', 'security_guard_reception'],
  'weak_doors': ['reinforced_doors'],
  'unsecured_after_hours': ['intrusion_alarm_door_window', 'monitored_alarm_system'],
  
  // Parking Vulnerabilities
  'open_parking_access': ['access_control_electronic', 'security_guard_reception'],
  'poor_parking_lighting': ['exterior_lighting'],
  'no_parking_surveillance': ['cctv_outdoor'],
  
  // Interior Vulnerabilities
  'no_internal_access_control': ['access_control_electronic'],
  'weak_server_room_access': ['biometric_access_control', 'man_trap'],
  'no_badge_display': ['badge_display_policy', 'security_awareness_training'],
  'no_access_audits': ['access_control_audit'],
  
  // Surveillance Vulnerabilities
  'no_cctv': ['cctv_fixed_indoor', 'cctv_outdoor'],
  'no_real_time_monitoring': ['cctv_monitoring_24_7'],
  'inadequate_camera_coverage': ['cctv_fixed_indoor', 'cctv_outdoor', 'cctv_ptz'],
  'poor_video_quality': ['cctv_fixed_indoor'], // Suggests upgrade
  
  // Intrusion Detection Vulnerabilities
  'no_alarm_system': ['intrusion_alarm_door_window', 'motion_detectors_pir', 'monitored_alarm_system'],
  'no_monitoring': ['monitored_alarm_system'],
  'alarm_not_tested': ['monitored_alarm_system'], // Suggests maintenance
  
  // Personnel Vulnerabilities
  'no_security_personnel': ['security_guard_reception', 'roving_security_patrol'],
  'no_patrols': ['roving_security_patrol'],
  'untrained_staff': ['security_awareness_training', 'active_threat_response_training'],
  'no_background_checks': ['background_checks'],
  
  // Emergency Preparedness Vulnerabilities
  'no_emergency_plan': ['emergency_response_plan'],
  'no_drills': ['emergency_response_plan', 'active_threat_response_training'],
  'no_active_threat_training': ['active_threat_response_training'],
  'slow_emergency_response': ['roving_security_patrol'], // On-site response capability
  
  // Cyber-Physical Vulnerabilities
  'no_network_segmentation': ['network_segmentation'],
  'no_mfa': ['multi_factor_authentication'],
  'unpatched_systems': ['security_system_patching'],
  
  // Document Security Vulnerabilities
  'no_clean_desk_policy': ['clean_desk_policy'],
  'unescorted_visitors': ['visitor_management_system', 'visitor_access_policy'],
};
```

---

## 6. Implementation Workflow

### 6.1 Complete Assessment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: CREATE ASSESSMENT                                   │
│ - Consultant selects "Office Building" template             │
│ - System creates assessment record                          │
│ - Facility zones auto-created from template                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: CONDUCT INTERVIEW                                   │
│ - 13 sections, 80+ questions                                │
│ - Progressive disclosure (follow-up questions)              │
│ - Responses stored in facilitySurveys table                 │
│ - Real-time risk indicator highlighting                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: AUTO-GENERATE RISK SCENARIOS                        │
│ - System calculates T×V×I for each threat                   │
│ - Threat Likelihood: from incident history + patterns       │
│ - Vulnerability: from control gaps + risk indicators        │
│ - Impact: from facility size + data classification          │
│ - Creates 15 risk scenario records                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: REVIEW & REFINE RISK SCENARIOS                      │
│ - Consultant reviews auto-calculated scores                 │
│ - Adjusts T/V/I based on field observations                 │
│ - Adds context-specific scenario descriptions               │
│ - Uploads photos for evidence                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: SELECT & IMPLEMENT CONTROLS                         │
│ - System suggests controls based on interview gaps          │
│ - Consultant selects applicable controls                    │
│ - Marks controls as "implemented" or "not implemented"      │
│ - Sets implementation fidelity (0-100%)                     │
│ - Adds observations and photos per control                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: SYSTEM RECALCULATES RESIDUAL RISK                   │
│ - For each risk scenario:                                   │
│   - Calculate total control effectiveness (C_e)             │
│   - Residual Risk = Inherent × (1 - C_e)                    │
│   - Reclassify risk level                                   │
│ - Update assessment-level metrics                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: AI NARRATIVE GENERATION (Optional)                  │
│ - Consultant clicks "Generate AI Narrative"                 │
│ - System sends to OpenAI GPT-4:                             │
│   - Threat description                                      │
│   - Interview context                                       │
│   - T×V×I scores                                            │
│   - Implemented controls                                    │
│ - AI returns structured narrative                           │
│ - Consultant can edit/refine                                │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: GENERATE PDF REPORT                                 │
│ - Consultant clicks "Generate Report"                       │
│ - System compiles:                                          │
│   - Executive summary with risk counts                      │
│   - Interview summary highlights                            │
│   - Risk matrix visualization                               │
│   - Detailed risk scenarios (all 15)                        │
│   - Photos with captions                                    │
│   - Prioritized recommendations                             │
│ - Puppeteer renders HTML → PDF                              │
│ - PDF saved to /outputs, link provided                      │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Data Storage Flow

```
Interview Responses
      ↓
facilitySurveys.responses (JSON)
      ↓
Risk Calculation Algorithm
      ↓
riskScenarios table:
  - threatLikelihood
  - vulnerability
  - impact
  - inherentRisk
  - scenarioDescription
      ↓
Consultant adds controls
      ↓
riskScenarioControls table:
  - controlId
  - isImplemented
  - implementationFidelity
  - observations
  - photoIds
      ↓
Risk Engine recalculates
      ↓
riskScenarios updated:
  - residualRisk
  - controlEffectiveness
  - riskLevel
      ↓
AI Narrative Generation
      ↓
riskScenarios.aiNarrative (text)
      ↓
PDF Report Generation
      ↓
assessments.pdfUrl (link)
```

---

## 7. API Integration Specifications

### 7.1 Interview API Endpoints

```typescript
// POST /api/assessments/[id]/interview/start
// Creates facility survey record and returns questionnaire
{
  "surveyType": "office_building_comprehensive",
  "conductedBy": userId,
  "conductedDate": "2025-11-20"
}

Response: {
  "success": true,
  "surveyId": 123,
  "questionnaire": InterviewQuestion[],
  "totalQuestions": 80,
  "estimatedDuration": "45-60 minutes"
}

// PATCH /api/assessments/[id]/interview/[surveyId]/save
// Auto-save responses (called every 30 seconds)
{
  "responses": {
    "facility_overview_1": "150000",
    "facility_overview_2": "101-250 employees",
    // ... partial responses
  }
}

Response: {
  "success": true,
  "lastSaved": "2025-11-20T14:32:15Z"
}

// POST /api/assessments/[id]/interview/[surveyId]/complete
// Finalize interview and trigger risk scenario generation
{
  "responses": { /* complete responses */ },
  "notes": "Additional observations from walk-through"
}

Response: {
  "success": true,
  "surveyId": 123,
  "generatedRiskScenarios": 15,
  "riskScenarioIds": [456, 457, 458, ...],
  "criticalRisks": 2,
  "highRisks": 5,
  "mediumRisks": 6,
  "lowRisks": 2
}
```

### 7.2 Risk Scenario Generation API

```typescript
// POST /api/assessments/[id]/risk-scenarios/generate-from-interview
// Called automatically after interview completion
Request: {
  "surveyId": 123,
  "templateId": 5
}

Response: {
  "success": true,
  "generatedScenarios": [
    {
      "id": 456,
      "threatName": "Unauthorized Entry - Forced Entry",
      "threatLikelihood": 3,
      "vulnerability": 4,
      "impact": 4,
      "inherentRisk": 48,
      "riskLevel": "medium",
      "scenarioDescription": "Based on interview findings: facility has inadequate perimeter fencing, poor lighting, and no intrusion detection on 60% of entry points...",
      "suggestedControls": [
        "perimeter_fence_anti_climb",
        "exterior_lighting",
        "intrusion_alarm_door_window",
        "monitored_alarm_system"
      ]
    },
    // ... 14 more scenarios
  ]
}
```

### 7.3 Control Recommendation API

```typescript
// GET /api/assessments/[id]/risk-scenarios/[scenarioId]/suggested-controls
Response: {
  "success": true,
  "riskScenario": {
    "id": 456,
    "threatName": "Unauthorized Entry - Forced Entry",
    "inherentRisk": 48,
    "riskLevel": "medium"
  },
  "suggestedControls": [
    {
      "id": 12,
      "name": "Perimeter Fence with Anti-Climb Features",
      "category": "physical_barriers",
      "baseWeight": 0.22,
      "estimatedCost": "medium",
      "suggestedBecause": [
        "Interview indicated: No fence present",
        "Interview indicated: Open/undefined boundary",
        "Common control for forced entry threats"
      ]
    },
    {
      "id": 34,
      "name": "Exterior Lighting (Perimeter & Parking)",
      "category": "environmental_design",
      "baseWeight": 0.15,
      "estimatedCost": "medium",
      "suggestedBecause": [
        "Interview response: Lighting rated 2/5 (Poor)",
        "Common control for forced entry threats"
      ]
    },
    // ... more controls
  ]
}

// POST /api/assessments/[id]/risk-scenarios/[scenarioId]/controls/add
Request: {
  "controlId": 12,
  "isImplemented": true,
  "implementationFidelity": 0.8,
  "observedCondition": "fair",
  "notes": "Fence present but shows signs of rust and has several gaps",
  "photoIds": [101, 102]
}

Response: {
  "success": true,
  "riskScenarioControl": { /* created record */ },
  "recalculatedRisk": {
    "inherentRisk": 48,
    "residualRisk": 39.4,
    "controlEffectiveness": 0.18,
    "riskLevel": "medium" // Still medium but reduced
  }
}
```

---

## 8. UI Components

### 8.1 Interview UI Component

```tsx
// app/assessments/[id]/interview/page.tsx

export default function AssessmentInterviewPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<InterviewResponses>({});
  const [followUpVisible, setFollowUpVisible] = useState<Set<string>>(new Set());
  
  const sections = [
    'Facility Overview & Operations',
    'Perimeter Security',
    'Parking Facilities',
    'Building Entry Points & Lobby',
    'Interior Access Control',
    'Surveillance Systems',
    'Intrusion Detection & Alarm Systems',
    'Security Personnel & Procedures',
    'Emergency Preparedness & Response',
    'Incident History',
    'Cyber-Physical Security',
    'Physical Document & Data Security',
    'Loading Dock & Receiving',
  ];
  
  return (
    <div className="container mx-auto py-8">
      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Section {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentSection / sections.length) * 100)}% Complete
            </span>
          </div>
          <Progress value={(currentSection / sections.length) * 100} />
        </CardContent>
      </Card>
      
      {/* Section Tabs */}
      <Tabs value={sections[currentSection]} className="mb-6">
        <TabsList className="grid grid-cols-7 gap-1">
          {sections.map((section, idx) => (
            <TabsTrigger
              key={section}
              value={section}
              onClick={() => setCurrentSection(idx)}
              className={idx < currentSection ? 'bg-green-100' : ''}
            >
              {idx + 1}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>{sections[currentSection]}</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewQuestionGroup
            section={sections[currentSection]}
            responses={responses}
            onResponseChange={(questionId, value) => {
              setResponses(prev => ({ ...prev, [questionId]: value }));
              autoSave();
            }}
            followUpVisible={followUpVisible}
            onFollowUpToggle={(questionId) => {
              setFollowUpVisible(prev => {
                const next = new Set(prev);
                if (next.has(questionId)) {
                  next.delete(questionId);
                } else {
                  next.add(questionId);
                }
                return next;
              });
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
            disabled={currentSection === 0}
          >
            ← Previous Section
          </Button>
          {currentSection < sections.length - 1 ? (
            <Button onClick={() => setCurrentSection(prev => prev + 1)}>
              Next Section →
            </Button>
          ) : (
            <Button onClick={handleCompleteInterview} className="bg-green-600">
              Complete Interview & Generate Risk Scenarios
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
```

### 8.2 Question Component with Risk Indicators

```tsx
function InterviewQuestion({ question, response, onChange }: Props) {
  const hasRiskIndicator = question.riskIndicators && 
    question.riskIndicators.some(indicator => 
      responseMatchesIndicator(response, indicator)
    );
  
  return (
    <div className={cn(
      "p-4 border rounded-lg mb-4",
      hasRiskIndicator && "border-orange-500 bg-orange-50"
    )}>
      {hasRiskIndicator && (
        <Alert variant="warning" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This response indicates a potential security vulnerability
          </AlertDescription>
        </Alert>
      )}
      
      <Label className="text-base font-medium mb-3 block">
        {question.questionText}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {question.questionType === 'multiple_choice' && (
        <RadioGroup value={response} onValueChange={onChange}>
          {question.options?.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${question.id}-${option}`} />
              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
      
      {question.questionType === 'yes_no' && (
        <div className="flex space-x-4">
          <Button
            type="button"
            variant={response === 'yes' ? 'default' : 'outline'}
            onClick={() => onChange('yes')}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={response === 'no' ? 'default' : 'outline'}
            onClick={() => onChange('no')}
          >
            No
          </Button>
        </div>
      )}
      
      {question.questionType === 'rating' && (
        <Slider
          value={[response || question.ratingScale?.min || 1]}
          onValueChange={([value]) => onChange(value)}
          min={question.ratingScale?.min || 1}
          max={question.ratingScale?.max || 5}
          step={1}
          className="mt-2"
        />
      )}
      
      {question.questionType === 'checklist' && (
        <div className="space-y-2">
          {question.options?.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${option}`}
                checked={response?.includes(option)}
                onCheckedChange={(checked) => {
                  const current = response || [];
                  onChange(
                    checked
                      ? [...current, option]
                      : current.filter((o: string) => o !== option)
                  );
                }}
              />
              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </div>
      )}
      
      {/* Follow-up questions */}
      {question.followUpQuestions && shouldShowFollowUp(question, response) && (
        <div className="mt-4 ml-6 border-l-2 border-gray-200 pl-4">
          {question.followUpQuestions.map(followUp => (
            <InterviewQuestion
              key={followUp.id}
              question={followUp}
              response={responses[followUp.id]}
              onChange={(value) => onChange(followUp.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 8.3 Auto-Generated Risk Scenarios Review

```tsx
function GeneratedRiskScenariosReview({ scenarios }: Props) {
  return (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          RiskFixer has automatically calculated risk scores based on your interview responses.
          Review these scenarios and adjust as needed based on your field observations.
        </AlertDescription>
      </Alert>
      
      {/* Risk Distribution Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {scenarios.filter(s => s.riskLevel === 'critical' || s.riskLevel === 'high').length}
              </div>
              <div className="text-sm text-gray-600">Critical/High</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {scenarios.filter(s => s.riskLevel === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {scenarios.filter(s => s.riskLevel === 'low').length}
              </div>
              <div className="text-sm text-gray-600">Low</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {scenarios.filter(s => s.riskLevel === 'negligible').length}
              </div>
              <div className="text-sm text-gray-600">Negligible</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Scenarios */}
      {scenarios.map(scenario => (
        <Card key={scenario.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{scenario.threat.name}</CardTitle>
              <Badge variant={getRiskBadgeVariant(scenario.riskLevel)}>
                {scenario.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <Label className="text-xs text-gray-500">Threat Likelihood</Label>
                <div className="text-2xl font-bold">{scenario.threatLikelihood}/5</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Vulnerability</Label>
                <div className="text-2xl font-bold">{scenario.vulnerability}/5</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Impact</Label>
                <div className="text-2xl font-bold">{scenario.impact}/5</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Inherent Risk</Label>
                <div className="text-2xl font-bold text-red-600">
                  {scenario.inherentRisk}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded mb-4">
              <Label className="text-xs text-gray-500 mb-1 block">
                Auto-Generated Description
              </Label>
              <p className="text-sm">{scenario.scenarioDescription}</p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditScenario(scenario.id)}
              >
                ✏️ Edit Scores
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewSuggestedControls(scenario.id)}
              >
                🛡️ View Suggested Controls
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddPhotos(scenario.id)}
              >
                📷 Add Photos
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 9. PDF Report Template

### 9.1 Report Structure

```
┌─────────────────────────────────────────────────────────────┐
│ COVER PAGE                                                   │
│ - Facility name and address                                 │
│ - Assessment number                                          │
│ - Assessment date                                            │
│ - Prepared by (consultant name)                             │
│ - Report generation date                                     │
│ - Confidentiality notice                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE OF CONTENTS                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EXECUTIVE SUMMARY                                            │
│ - Overall risk assessment                                    │
│ - Risk distribution (Critical/High/Medium/Low counts)        │
│ - Key findings (top 3-5 vulnerabilities)                     │
│ - Top recommendations                                        │
│ - Assessment scope and methodology                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FACILITY OVERVIEW                                            │
│ - Business operations summary                                │
│ - Employee population                                        │
│ - Operating hours                                            │
│ - Asset classification                                       │
│ - Data sensitivity level                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ INTERVIEW SUMMARY                                            │
│ - Key highlights from 13 interview sections                  │
│ - Identified vulnerabilities                                 │
│ - Existing security measures                                 │
│ - Incident history summary                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ RISK MATRIX                                                  │
│ - Visual heat map of all 15 risks                           │
│ - Inherent vs. Residual risk comparison                     │
│ - Risk level distribution chart                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DETAILED RISK SCENARIOS (15 scenarios)                       │
│ For each risk:                                               │
│ - Threat description                                         │
│ - T×V×I scores with explanation                             │
│ - Inherent risk calculation                                  │
│ - Implemented controls list                                  │
│ - Control effectiveness analysis                             │
│ - Residual risk calculation                                  │
│ - Photos with captions                                       │
│ - Recommendations                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PRIORITIZED RECOMMENDATIONS                                  │
│ - Immediate actions (0-30 days)                             │
│ - Short-term actions (30-90 days)                           │
│ - Long-term strategic measures                              │
│ - Estimated costs and implementation timeline                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ APPENDICES                                                   │
│ A. Complete Interview Responses                             │
│ B. Photo Gallery by Zone                                    │
│ C. Control Effectiveness Matrix                             │
│ D. Methodology & Calculation Details                        │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Interview Summary Section (Example)

```html
<h2>Interview Summary</h2>

<h3>Perimeter Security</h3>
<ul>
  <li>
    <strong>Property Boundary:</strong> 
    {{responses.perimeter_1}} 
    {{#if responses.perimeter_1.includes('No')}}
      <span class="risk-indicator">⚠️ Vulnerability: Undefined perimeter increases forced entry risk</span>
    {{/if}}
  </li>
  <li>
    <strong>Fence Type:</strong> 
    {{responses.perimeter_2}}
  </li>
  <li>
    <strong>Perimeter Lighting:</strong> 
    Rated {{responses.perimeter_4}}/5
    {{#if responses.perimeter_4 <= 2}}
      <span class="risk-indicator">⚠️ Vulnerability: Poor lighting enables concealment</span>
    {{/if}}
  </li>
  <li>
    <strong>CCTV Coverage:</strong> 
    {{responses.perimeter_7a}}
    {{#if responses.perimeter_7b.includes('rarely')}}
      <span class="risk-indicator">⚠️ Vulnerability: Cameras not monitored reduces effectiveness</span>
    {{/if}}
  </li>
</ul>

<h3>Access Control</h3>
<ul>
  <li>
    <strong>Main Entry Access Control:</strong> 
    {{responses.entry_3}}
    {{#if responses.entry_3.includes('Open access')}}
      <span class="risk-indicator">🚨 Critical Vulnerability: No access control during business hours</span>
    {{/if}}
  </li>
  <li>
    <strong>Tailgating Prevention:</strong> 
    {{responses.entry_4}}
    {{#if !responses.entry_4.includes('physical barriers')}}
      <span class="risk-indicator">⚠️ Vulnerability: Physical barriers recommended to prevent tailgating</span>
    {{/if}}
  </li>
  <li>
    <strong>Visitor Management:</strong> 
    {{responses.entry_5 ? 'System in place' : 'No formal system'}}
  </li>
</ul>

<!-- Continues for all 13 sections -->
```

---

## 10. Implementation Roadmap

### 10.1 Phase 1: Core Interview System (Week 1)

**Day 1-2: Database & Interview Data Structure**
```
AI Prompt:
"Implement the office building interview questionnaire structure per 
Section 3 of the Office Building Framework document. Create:
1. TypeScript interface for InterviewQuestion
2. Complete questionnaire array (13 sections, 80+ questions)
3. Export threat-question mapping
4. Export vulnerability-control mapping
Store in: server/data/office-building-interview-questionnaire.ts"
```

**Day 3-4: Interview UI Components**
```
AI Prompt:
"Build the assessment interview interface at app/assessments/[id]/interview:
1. Multi-section navigation with progress bar
2. Question components for all 5 question types
3. Progressive disclosure for follow-up questions
4. Risk indicator highlighting (visual warnings)
5. Auto-save functionality every 30 seconds
6. Use shadcn/ui components (Tabs, Card, RadioGroup, Checkbox, Slider)
Store responses in facilitySurveys table as JSON."
```

**Day 5: Interview API Routes**
```
AI Prompt:
"Create API routes for interview management:
1. POST /api/assessments/[id]/interview/start
2. PATCH /api/assessments/[id]/interview/[surveyId]/save (auto-save)
3. POST /api/assessments/[id]/interview/[surveyId]/complete
All routes should use Drizzle ORM with PostgreSQL."
```

### 10.2 Phase 2: Risk Calculation Integration (Week 2)

**Day 6-7: Risk Mapping Service**
```
AI Prompt:
"Implement the interview-to-risk mapping service per Section 4:
1. calculateVulnerabilityFromInterview() function
2. calculateThreatLikelihoodFromInterview() function
3. calculateImpactFromInterview() function
4. Include all threat-specific logic and patterns
File location: server/services/office-interview-risk-mapper.ts"
```

**Day 8-9: Auto Risk Scenario Generation**
```
AI Prompt:
"Create the auto-generation service that:
1. Triggers when interview is completed
2. Calculates T×V×I for all 15 template threats
3. Generates scenario descriptions with interview context
4. Bulk inserts risk scenarios into riskScenarios table
5. Returns summary to frontend
File: server/services/office-assessment-initializer.ts
API: POST /api/assessments/[id]/risk-scenarios/generate-from-interview"
```

**Day 10: Risk Scenarios Review UI**
```
AI Prompt:
"Build risk scenarios review interface showing:
1. Risk distribution summary cards
2. List of all generated scenarios with T/V/I scores
3. Edit capability for each scenario
4. Suggested controls display
5. Photo upload per scenario
Component: app/assessments/[id]/risk-scenarios/review"
```

### 10.3 Phase 3: Controls & Reporting (Week 3)

**Day 11-12: Control Recommendation Engine**
```
AI Prompt:
"Implement control suggestion system per Section 5:
1. generateControlRecommendations() function
2. Vulnerability-to-control mapping logic
3. Threat-to-control mapping logic
4. API: GET /api/assessments/[id]/risk-scenarios/[id]/suggested-controls
5. UI component showing control cards with 'why suggested' explanation"
```

**Day 13-14: Control Selection & Implementation**
```
AI Prompt:
"Build control management interface:
1. Search/filter controls library
2. Add controls to risk scenarios
3. Set implementation fidelity slider
4. Mark observed condition (excellent/good/fair/poor)
5. Add photos per control
6. Real-time residual risk recalculation
7. API: POST /api/assessments/[id]/risk-scenarios/[id]/controls/add"
```

**Day 15-16: PDF Report Template**
```
AI Prompt:
"Create PDF report template for office building assessments:
1. Extend base template from Master Framework Section 8
2. Add interview summary section with vulnerability highlighting
3. Include all 15 risk scenarios with photos
4. Add recommendations section grouped by priority
5. Include risk matrix visualization
Use Puppeteer with office-building-report-template.tsx"
```

**Day 17: Testing & Polish**
```
Tasks:
- Complete workflow test: interview → risk gen → controls → PDF
- Fix bugs and edge cases
- Performance optimization for 80+ question interview
- Mobile responsiveness check
- Create sample report with seed data
```

### 10.4 Integration Checklist

- [ ] Interview questionnaire (13 sections, 80+ questions)
- [ ] Interview UI with progressive disclosure
- [ ] Auto-save functionality
- [ ] Risk indicator highlighting in interview
- [ ] Risk mapping algorithms (T, V, I calculations)
- [ ] Auto-generation of 15 risk scenarios
- [ ] Risk scenarios review interface
- [ ] Control recommendation engine
- [ ] Suggested controls display
- [ ] Control selection and implementation UI
- [ ] Real-time residual risk calculation
- [ ] Interview summary in PDF report
- [ ] Risk matrix visualization
- [ ] Complete PDF report template
- [ ] End-to-end testing

---

## Conclusion

This Office Building Security Assessment Framework provides a complete, interview-driven methodology that:

1. **Captures comprehensive facility information** through 80+ structured questions
2. **Automatically calculates risk** using the T×V×I formula based on interview responses
3. **Maps vulnerabilities to controls** with intelligent recommendations
4. **Generates professional reports** with interview summaries and risk analysis
5. **Integrates seamlessly** with the RiskFixer Master Framework

The system transforms subjective security assessments into data-driven evaluations, ensuring consistent, defensible, and actionable security recommendations for corporate office facilities.

---

**END OF OFFICE BUILDING FRAMEWORK DOCUMENT**
