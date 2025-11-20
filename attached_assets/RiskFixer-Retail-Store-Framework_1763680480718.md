# RiskFixer: Retail Store Security Assessment Framework
## Comprehensive Specification for Retail Facility Security

**Version:** 1.0  
**Integration Target:** RiskFixer Master Framework v2.0  
**Focus:** Retail Store Security Assessments  
**Last Updated:** November 20, 2025

---

## Table of Contents

1. [Retail Store Assessment Overview](#1-retail-store-assessment-overview)
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

## 1. Retail Store Assessment Overview

### 1.1 What Makes Retail Store Assessments Unique

**Standard Physical Security Assessment:**
- Generic facility protection
- Static threat environment
- One-dimensional risk view

**Retail Store Security Assessment:**
- **Customer-facing operations** - Balancing security with welcoming environment
- **High-volume traffic** - Managing hundreds of daily visitors
- **Merchandise protection** - Inventory shrinkage prevention (shoplifting, employee theft)
- **Cash handling** - Point-of-sale and back-office vulnerabilities
- **Employee safety** - Robbery response, workplace violence, closing procedures
- **After-hours risks** - Break-ins during closed periods
- **Seasonal variations** - Holiday rush security challenges
- **Location context** - Mall anchor vs. strip center vs. standalone considerations

### 1.2 Assessment Components

```
Retail Store Assessment = 
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. STORE PROFILE & OPERATIONS                               │
  │    - Store format and merchandise type                      │
  │    - Operating hours and traffic patterns                   │
  │    - Annual revenue and inventory value                     │
  │    - Employee count and shift structure                     │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. LOSS PREVENTION INTERVIEW (11 Sections, 70+ Questions)  │
  │    - Shrinkage history and patterns                         │
  │    - Existing security measures                             │
  │    - Incident history (theft, robbery, violence)            │
  │    - Staff awareness and training                           │
  │    - Cash handling procedures                               │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. PHYSICAL SECURITY WALKTHROUGH                            │
  │    - Storefront visibility and CPTED                        │
  │    - Surveillance coverage and blind spots                  │
  │    - Access control and key management                      │
  │    - Alarm systems and monitoring                           │
  │    - Safe/cash room security                                │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. AUTO-GENERATED RISK SCENARIOS (12-15 Threats)           │
  │    - Shoplifting (organized retail crime)                   │
  │    - Armed robbery                                          │
  │    - Employee theft                                         │
  │    - After-hours burglary                                   │
  │    - Smash-and-grab                                         │
  │    - Check/credit card fraud                                │
  │    - Workplace violence                                     │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. CONTROL RECOMMENDATIONS                                  │
  │    - EAS (Electronic Article Surveillance) systems          │
  │    - CCTV with facial recognition                           │
  │    - Receipt checking procedures                            │
  │    - Cash management controls                               │
  │    - Employee training programs                             │
  │    - Robbery response protocols                             │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. PROFESSIONAL PDF REPORT                                  │
  │    - Shrinkage analysis and trends                          │
  │    - Risk scenarios with photos                             │
  │    - ROI-justified recommendations                          │
  │    - Incident response procedures                           │
  └─────────────────────────────────────────────────────────────┘
```

### 1.3 Key Threats for Retail Environments

| Priority | Threat Category | Typical Frequency |
|----------|----------------|------------------|
| Critical | Shoplifting (Individual) | Daily/Weekly |
| Critical | Employee Theft | Ongoing |
| High | Organized Retail Crime | Monthly |
| High | Armed Robbery | Rare but high impact |
| High | After-Hours Burglary | Occasional |
| Medium | Check/Card Fraud | Weekly |
| Medium | Return Fraud | Weekly |
| Medium | Smash-and-Grab | Rare |
| Medium | Workplace Violence | Rare |
| Low | Vandalism | Occasional |

---

## 2. Assessment Template Specifications

### 2.1 Template Configuration

```typescript
{
  name: 'Retail Store Security Assessment',
  templateType: 'retail_store',
  description: 'Comprehensive security and loss prevention assessment for retail facilities',
  siteTypeRecommendation: 'retail',
  calculationMethod: 'tvi', // Using T×V×I for audit defensibility
  
  defaultThreats: [
    'shoplifting_individual',
    'shoplifting_organized_retail_crime',
    'employee_theft',
    'armed_robbery',
    'burglary_after_hours',
    'smash_and_grab',
    'return_fraud',
    'check_credit_card_fraud',
    'workplace_violence_customer',
    'workplace_violence_employee',
    'vandalism',
    'slip_fall_liability'
  ],
  
  defaultControls: [
    // Electronic Article Surveillance
    'eas_system_tags',
    'eas_system_gates',
    'eas_deactivation_at_pos',
    
    // Surveillance
    'cctv_sales_floor',
    'cctv_pos_registers',
    'cctv_cash_room',
    'cctv_stockroom',
    'cctv_parking_lot',
    'cctv_entrance_exit',
    'facial_recognition_system',
    
    // Access Control
    'stockroom_access_control',
    'cash_room_access_control',
    'key_control_system',
    'alarm_system_intrusion',
    'alarm_system_panic_buttons',
    
    // Cash Management
    'drop_safe',
    'time_delay_safe',
    'cash_limit_registers',
    'dual_control_cash_procedures',
    'armored_car_service',
    
    // Physical Barriers
    'reinforced_entrance_doors',
    'security_gates_after_hours',
    'bollards_storefront_protection',
    'display_case_locks',
    'high_value_lockup',
    
    // Personnel & Procedures
    'security_guard_uniformed',
    'loss_prevention_plain_clothes',
    'employee_background_checks',
    'robbery_response_training',
    'closing_procedures_two_person',
    'receipt_checking_policy',
    'bag_check_policy',
    'employee_package_inspection',
    'refund_authorization_controls',
    
    // Merchandise Protection
    'high_value_display_security',
    'merchandise_anchoring',
    'dressing_room_attendant',
    'item_count_policy',
    'inventory_audit_cycle_counting',
    
    // Environmental Design
    'cpted_principles_retail',
    'clear_sightlines_sales_floor',
    'mirrors_blind_spot_coverage',
    'adequate_lighting_interior',
    'adequate_lighting_exterior',
    'signage_prosecution_policy'
  ]
}
```

### 2.2 Threat Library (Retail Store Specific)

**Retail-Focused Threats with ASIS GDL-RA Alignment:**

| Threat | Category | Typical Likelihood | Typical Impact | ASIS Code |
|--------|----------|-------------------|----------------|-----------|
| Shoplifting - Individual | Theft | 5 | 2 | PSC.1-2012-THF-003 |
| Shoplifting - Organized Retail Crime | Theft | 3 | 4 | PSC.1-2012-THF-004 |
| Employee Theft - Merchandise | Theft | 4 | 3 | PSC.1-2012-THF-005 |
| Employee Theft - Cash | Theft | 3 | 3 | PSC.1-2012-THF-006 |
| Armed Robbery | Robbery | 2 | 5 | PSC.1-2012-ROB-001 |
| After-Hours Burglary | Burglary | 2 | 4 | PSC.1-2012-BUR-001 |
| Smash-and-Grab | Burglary | 2 | 3 | PSC.1-2012-BUR-002 |
| Return Fraud | Fraud | 4 | 2 | PSC.1-2012-FRD-001 |
| Check/Credit Card Fraud | Fraud | 3 | 2 | PSC.1-2012-FRD-002 |
| Workplace Violence - Customer Aggression | Workplace Violence | 3 | 3 | PSC.1-2012-WPV-004 |
| Workplace Violence - Employee Conflict | Workplace Violence | 2 | 3 | PSC.1-2012-WPV-002 |
| Vandalism - Storefront | Vandalism | 2 | 2 | PSC.1-2012-VAN-001 |
| Slip/Fall - Customer Liability | Liability | 3 | 4 | PSC.1-2012-LIA-001 |

---

## 3. Interview Protocol System

### 3.1 Interview Questionnaire Structure

**File Location:** `server/data/retail-store-interview-questionnaire.ts`

```typescript
export interface RetailInterviewQuestion {
  id: string;
  section: string;
  zoneApplicable?: string[]; // Sales floor, stockroom, cash office, etc.
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist' | 'number';
  options?: string[];
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: RetailInterviewQuestion[];
  riskIndicators?: string[]; // Keywords that elevate risk
  
  // Direct mapping to risk scenarios
  informsThreat?: string[]; // Threat IDs this question informs
  informsVulnerability?: boolean; // Does this assess vulnerability?
  informsImpact?: boolean; // Does this assess potential impact?
  suggestsControls?: string[]; // Control IDs this might reveal need for
}
```

### 3.2 Complete Interview Questions (11 Sections, 70+ Questions)

#### **SECTION 1: STORE PROFILE & OPERATIONS (8 questions)**

```typescript
const section1_storeProfile: RetailInterviewQuestion[] = [
  {
    id: 'store_profile_1',
    section: 'Store Profile & Operations',
    questionText: 'What is your store format?',
    questionType: 'multiple_choice',
    options: [
      'Department store (large format, multiple departments)',
      'Specialty store (focused product category)',
      'Convenience store',
      'Grocery/Supermarket',
      'Pharmacy',
      'Electronics store',
      'Jewelry store',
      'Clothing/Apparel store',
      'Discount/Dollar store',
      'Other (specify in notes)',
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['armed_robbery', 'shoplifting_organized_retail_crime'],
  },

  {
    id: 'store_profile_2',
    section: 'Store Profile & Operations',
    questionText: 'What is your approximate annual revenue?',
    questionType: 'multiple_choice',
    options: [
      'Under $500K',
      '$500K - $1M',
      '$1M - $3M',
      '$3M - $10M',
      'Over $10M',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'store_profile_3',
    section: 'Store Profile & Operations',
    questionText: 'What is the total square footage of your sales floor?',
    questionType: 'number',
    required: true,
    informsImpact: true,
    informsVulnerability: true, // Larger = harder to monitor
  },

  {
    id: 'store_profile_4',
    section: 'Store Profile & Operations',
    questionText: 'How many employees work at this location?',
    questionType: 'multiple_choice',
    options: [
      '1-5 employees',
      '6-15 employees',
      '16-30 employees',
      '31-50 employees',
      '50+ employees',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'store_profile_5',
    section: 'Store Profile & Operations',
    questionText: 'What are your typical operating hours?',
    questionType: 'multiple_choice',
    options: [
      '24 hours',
      'Extended hours (6 AM - 11 PM)',
      'Standard hours (9 AM - 9 PM)',
      'Limited hours (10 AM - 6 PM)',
      'Varies by day',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['armed_robbery', 'workplace_violence_customer'],
  },

  {
    id: 'store_profile_6',
    section: 'Store Profile & Operations',
    questionText: 'What is your store location type?',
    questionType: 'multiple_choice',
    options: [
      'Enclosed shopping mall (interior)',
      'Strip center/Shopping plaza',
      'Standalone building',
      'Downtown/Urban street front',
      'Airport/Transportation hub',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['armed_robbery', 'burglary_after_hours'],
    riskIndicators: ['standalone', 'urban street'],
  },

  {
    id: 'store_profile_7',
    section: 'Store Profile & Operations',
    questionText: 'What is the approximate value of merchandise on the sales floor at any given time?',
    questionType: 'multiple_choice',
    options: [
      'Under $50K',
      '$50K - $150K',
      '$150K - $500K',
      '$500K - $1M',
      'Over $1M',
    ],
    required: true,
    informsImpact: true,
  },

  {
    id: 'store_profile_8',
    section: 'Store Profile & Operations',
    questionText: 'Do you sell high-value merchandise (individual items over $200)?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['shoplifting_organized_retail_crime', 'armed_robbery', 'smash_and_grab'],
    followUpQuestions: [
      {
        id: 'store_profile_8a',
        section: 'Store Profile & Operations',
        questionText: 'What high-value categories do you carry? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Electronics (phones, tablets, laptops)',
          'Jewelry/Watches',
          'Designer handbags/accessories',
          'Cosmetics/Fragrances (premium)',
          'Power tools',
          'Firearms/Ammunition',
          'Alcohol (premium/spirits)',
          'Baby formula (ORC target)',
          'Other',
        ],
        required: true,
        informsImpact: true,
        informsThreat: ['shoplifting_organized_retail_crime'],
      },
    ],
  },
];
```

#### **SECTION 2: SHRINKAGE & LOSS HISTORY (7 questions)**

```typescript
const section2_shrinkage: RetailInterviewQuestion[] = [
  {
    id: 'shrinkage_1',
    section: 'Shrinkage & Loss History',
    questionText: 'What was your shrinkage rate last year (as % of sales)?',
    questionType: 'multiple_choice',
    options: [
      'Under 1% (excellent)',
      '1-2% (industry average)',
      '2-3% (above average)',
      '3-5% (concerning)',
      'Over 5% (critical)',
      'Unknown/Not tracked',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['shoplifting_individual', 'employee_theft'],
    riskIndicators: ['3-5%', 'over 5%', 'unknown'],
  },

  {
    id: 'shrinkage_2',
    section: 'Shrinkage & Loss History',
    questionText: 'Based on your analysis, what are the primary causes of shrinkage? (Rank top 3)',
    questionType: 'checklist',
    options: [
      'External theft (shoplifting)',
      'Internal theft (employees)',
      'Administrative errors',
      'Vendor fraud',
      'Damage/spoilage',
      'Unknown shrinkage',
    ],
    required: true,
    informsThreat: ['shoplifting_individual', 'employee_theft'],
  },

  {
    id: 'shrinkage_3',
    section: 'Shrinkage & Loss History',
    questionText: 'How many shoplifting incidents were reported in the past 12 months?',
    questionType: 'multiple_choice',
    options: [
      'None',
      '1-5 incidents',
      '6-15 incidents',
      '16-30 incidents',
      '30+ incidents',
    ],
    required: true,
    informsThreat: ['shoplifting_individual', 'shoplifting_organized_retail_crime'],
    riskIndicators: ['16-30', '30+'],
  },

  {
    id: 'shrinkage_4',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced organized retail crime (ORC) in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['shoplifting_organized_retail_crime'],
    followUpQuestions: [
      {
        id: 'shrinkage_4a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many ORC incidents occurred?',
        questionType: 'multiple_choice',
        options: ['1-2', '3-5', '6-10', '10+'],
        required: true,
        riskIndicators: ['6-10', '10+'],
      },
      {
        id: 'shrinkage_4b',
        section: 'Shrinkage & Loss History',
        questionText: 'What was the approximate total loss from ORC?',
        questionType: 'multiple_choice',
        options: [
          'Under $1,000',
          '$1,000 - $5,000',
          '$5,000 - $20,000',
          'Over $20,000',
        ],
        required: true,
        informsImpact: true,
      },
    ],
  },

  {
    id: 'shrinkage_5',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you had any confirmed employee theft incidents in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['employee_theft'],
    followUpQuestions: [
      {
        id: 'shrinkage_5a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many employee theft cases?',
        questionType: 'number',
        required: true,
      },
      {
        id: 'shrinkage_5b',
        section: 'Shrinkage & Loss History',
        questionText: 'What type of employee theft occurred? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Merchandise theft',
          'Cash theft',
          'Fraudulent refunds/voids',
          'Time theft',
          'Discount abuse',
          'Gift card fraud',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'shrinkage_6',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced a robbery in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery'],
    followUpQuestions: [
      {
        id: 'shrinkage_6a',
        section: 'Shrinkage & Loss History',
        questionText: 'When was the most recent robbery?',
        questionType: 'multiple_choice',
        options: [
          'Within past 6 months',
          '6-12 months ago',
          '1-2 years ago',
          '2-5 years ago',
        ],
        required: true,
        riskIndicators: ['within past 6 months', '6-12 months'],
      },
      {
        id: 'shrinkage_6b',
        section: 'Shrinkage & Loss History',
        questionText: 'Was the robbery armed?',
        questionType: 'yes_no',
        required: true,
      },
    ],
  },

  {
    id: 'shrinkage_7',
    section: 'Shrinkage & Loss History',
    questionText: 'Have you experienced a burglary (after-hours break-in) in the past 5 years?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['burglary_after_hours'],
    followUpQuestions: [
      {
        id: 'shrinkage_7a',
        section: 'Shrinkage & Loss History',
        questionText: 'How many burglaries?',
        questionType: 'number',
        required: true,
      },
    ],
  },
];
```

#### **SECTION 3: ELECTRONIC ARTICLE SURVEILLANCE (EAS) (5 questions)**

```typescript
const section3_eas: RetailInterviewQuestion[] = [
  {
    id: 'eas_1',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'Do you have an EAS (security tag) system installed?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['eas_system_tags', 'eas_system_gates'],
    followUpQuestions: [
      {
        id: 'eas_1a',
        section: 'Electronic Article Surveillance (EAS)',
        questionText: 'What type of EAS system?',
        questionType: 'multiple_choice',
        options: [
          'RF (Radio Frequency)',
          'AM (Acousto-Magnetic)',
          'RFID',
          'Unknown',
        ],
        required: true,
      },
      {
        id: 'eas_1b',
        section: 'Electronic Article Surveillance (EAS)',
        questionText: 'Are EAS gates installed at all public exits?',
        questionType: 'yes_no',
        required: true,
        riskIndicators: ['no'],
      },
    ],
  },

  {
    id: 'eas_2',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'What percentage of your merchandise is protected with EAS tags?',
    questionType: 'multiple_choice',
    options: [
      'No EAS system',
      'Under 25% (high-value only)',
      '25-50%',
      '50-75%',
      '75%+ (most merchandise)',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['no eas', 'under 25%'],
  },

  {
    id: 'eas_3',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'How do you respond when an EAS alarm sounds?',
    questionType: 'multiple_choice',
    options: [
      'Designated staff immediately approaches customer',
      'Staff approaches when available',
      'Staff observes but rarely approaches',
      'Alarms frequently ignored',
      'No formal procedure',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely approaches', 'frequently ignored', 'no formal'],
  },

  {
    id: 'eas_4',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'Are EAS tags properly deactivated/removed at point of sale?',
    questionType: 'multiple_choice',
    options: [
      'Always - part of checkout process',
      'Usually - occasional misses',
      'Inconsistent - depends on cashier',
      'Rarely - frequent customer issues',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['inconsistent', 'rarely'],
  },

  {
    id: 'eas_5',
    section: 'Electronic Article Surveillance (EAS)',
    questionText: 'How often do you conduct EAS system testing/maintenance?',
    questionType: 'multiple_choice',
    options: [
      'Daily testing',
      'Weekly testing',
      'Monthly testing',
      'Rarely/Never',
      'Only when problems arise',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely', 'only when problems'],
  },
];
```

#### **SECTION 4: VIDEO SURVEILLANCE (CCTV) (6 questions)**

```typescript
const section4_cctv: RetailInterviewQuestion[] = [
  {
    id: 'cctv_1',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Do you have a CCTV system installed?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cctv_sales_floor', 'cctv_pos_registers'],
    followUpQuestions: [
      {
        id: 'cctv_1a',
        section: 'Video Surveillance (CCTV)',
        questionText: 'How many cameras are installed?',
        questionType: 'multiple_choice',
        options: [
          '1-4 cameras',
          '5-10 cameras',
          '11-20 cameras',
          '20+ cameras',
        ],
        required: true,
      },
      {
        id: 'cctv_1b',
        section: 'Video Surveillance (CCTV)',
        questionText: 'What is the video recording retention period?',
        questionType: 'multiple_choice',
        options: [
          'Less than 7 days',
          '7-14 days',
          '15-30 days',
          '30-60 days',
          '60+ days',
        ],
        required: true,
        riskIndicators: ['less than 7 days'], // Insufficient for investigations
      },
    ],
  },

  {
    id: 'cctv_2',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Which areas have camera coverage? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'All POS registers',
      'Sales floor (general coverage)',
      'Main entrance/exit',
      'Emergency exits',
      'Stockroom',
      'Cash office/safe',
      'Parking lot',
      'Dressing rooms (exterior only)',
    ],
    required: true,
    informsVulnerability: true,
  },

  {
    id: 'cctv_3',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Can you clearly identify faces and read license plates in your current footage?',
    questionType: 'multiple_choice',
    options: [
      'Yes - high quality, clear identification',
      'Sometimes - depends on lighting/distance',
      'Rarely - resolution too low',
      'No - cameras are mostly deterrent',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely', 'no - cameras'],
  },

  {
    id: 'cctv_4',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Is CCTV footage actively monitored?',
    questionType: 'multiple_choice',
    options: [
      'Yes - dedicated monitoring station during all hours',
      'Yes - staff monitors when available',
      'Only reviewed after incidents',
      'Rarely reviewed',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['rarely reviewed'],
  },

  {
    id: 'cctv_5',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Do you have a point-of-sale (POS) exception reporting system?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['employee_theft'],
    suggestsControls: ['pos_exception_reporting'],
    followUpQuestions: [
      {
        id: 'cctv_5a',
        section: 'Video Surveillance (CCTV)',
        questionText: 'How often do you review POS exception reports?',
        questionType: 'multiple_choice',
        options: [
          'Daily',
          'Weekly',
          'Monthly',
          'Rarely',
        ],
        required: true,
        riskIndicators: ['rarely'],
      },
    ],
  },

  {
    id: 'cctv_6',
    section: 'Video Surveillance (CCTV)',
    questionText: 'Rate the overall effectiveness of your current CCTV system',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Poor - Needs replacement', 'Fair', 'Adequate', 'Good', 'Excellent'] 
    },
    required: true,
    informsVulnerability: true,
  },
];
```

#### **SECTION 5: CASH HANDLING & SAFE SECURITY (8 questions)**

```typescript
const section5_cash: RetailInterviewQuestion[] = [
  {
    id: 'cash_1',
    section: 'Cash Handling & Safe Security',
    questionText: 'What is the maximum amount of cash typically in registers during peak hours?',
    questionType: 'multiple_choice',
    options: [
      'Under $500 per register',
      '$500 - $1,000 per register',
      '$1,000 - $2,000 per register',
      'Over $2,000 per register',
    ],
    required: true,
    informsImpact: true,
    informsThreat: ['armed_robbery'],
    riskIndicators: ['over $2,000'],
  },

  {
    id: 'cash_2',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you enforce register cash limits with mandatory drops?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['cash_limit_registers'],
  },

  {
    id: 'cash_3',
    section: 'Cash Handling & Safe Security',
    questionText: 'What type of safe do you have?',
    questionType: 'multiple_choice',
    options: [
      'No safe',
      'Basic safe (key lock)',
      'Combination safe',
      'Drop safe (cannot retrieve without combination)',
      'Time-delay safe',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['drop_safe', 'time_delay_safe'],
    riskIndicators: ['no safe', 'basic safe'],
  },

  {
    id: 'cash_4',
    section: 'Cash Handling & Safe Security',
    questionText: 'How many people have access to the safe combination?',
    questionType: 'multiple_choice',
    options: [
      '1 person (manager only)',
      '2-3 people (managers)',
      '4-5 people (managers + supervisors)',
      'More than 5 people',
      'No safe / Not applicable',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['more than 5', 'no safe'],
  },

  {
    id: 'cash_5',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you use armored car service for bank deposits?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery'],
    suggestsControls: ['armored_car_service'],
    followUpQuestions: [
      {
        id: 'cash_5a',
        section: 'Cash Handling & Safe Security',
        questionText: 'How often does armored car pick up?',
        questionType: 'multiple_choice',
        options: [
          'Daily',
          '2-3 times per week',
          'Weekly',
          'Less than weekly',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'cash_6',
    section: 'Cash Handling & Safe Security',
    questionText: 'If you make manual bank deposits, what procedures do you follow?',
    questionType: 'multiple_choice',
    options: [
      'Not applicable - use armored car service',
      'Two-person team, varied times/routes',
      'Single person, varied times/routes',
      'Single person, predictable schedule',
      'No formal procedure',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['single person, predictable', 'no formal'],
  },

  {
    id: 'cash_7',
    section: 'Cash Handling & Safe Security',
    questionText: 'Do you have dual-control procedures for cash office activities?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dual_control_cash_procedures'],
  },

  {
    id: 'cash_8',
    section: 'Cash Handling & Safe Security',
    questionText: 'Are cash handling procedures clearly documented and trained?',
    questionType: 'multiple_choice',
    options: [
      'Yes - written procedures, regular training',
      'Yes - written procedures, minimal training',
      'Informal procedures, no documentation',
      'No formal procedures',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['informal', 'no formal'],
  },
];
```

#### **SECTION 6: PHYSICAL SECURITY & ACCESS CONTROL (7 questions)**

```typescript
const section6_physical: RetailInterviewQuestion[] = [
  {
    id: 'physical_1',
    section: 'Physical Security & Access Control',
    questionText: 'What type of storefront do you have?',
    questionType: 'multiple_choice',
    options: [
      'Full glass front (high visibility)',
      'Partial glass front',
      'Minimal windows',
      'Fully enclosed (mall interior)',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['smash_and_grab'],
  },

  {
    id: 'physical_2',
    section: 'Physical Security & Access Control',
    questionText: 'Are your entry doors reinforced or do you use security gates after hours?',
    questionType: 'multiple_choice',
    options: [
      'Both reinforced doors and security gates',
      'Reinforced doors only',
      'Security gates only',
      'Standard doors, no gates',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['burglary_after_hours', 'smash_and_grab'],
    suggestsControls: ['reinforced_entrance_doors', 'security_gates_after_hours'],
    riskIndicators: ['standard doors'],
  },

  {
    id: 'physical_3',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have bollards or barriers protecting your storefront from vehicle impact?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['smash_and_grab'],
    suggestsControls: ['bollards_storefront_protection'],
  },

  {
    id: 'physical_4',
    section: 'Physical Security & Access Control',
    questionText: 'How do you control access to stockrooms and back-of-house areas?',
    questionType: 'multiple_choice',
    options: [
      'Electronic access control (badge/keypad)',
      'Keyed locks with strict key control',
      'Keyed locks with loose key control',
      'Unlocked during business hours',
      'No access control',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['employee_theft'],
    suggestsControls: ['stockroom_access_control'],
    riskIndicators: ['loose key control', 'unlocked', 'no access'],
  },

  {
    id: 'physical_5',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have an intrusion alarm system?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['alarm_system_intrusion'],
    followUpQuestions: [
      {
        id: 'physical_5a',
        section: 'Physical Security & Access Control',
        questionText: 'Is the alarm system monitored?',
        questionType: 'multiple_choice',
        options: [
          'Yes - 24/7 central station monitoring',
          'Yes - police dispatch',
          'No - local alarm only',
        ],
        required: true,
        riskIndicators: ['local alarm only'],
      },
      {
        id: 'physical_5b',
        section: 'Physical Security & Access Control',
        questionText: 'How many false alarms have you had in the past 12 months?',
        questionType: 'multiple_choice',
        options: [
          'None',
          '1-3',
          '4-10',
          'More than 10',
        ],
        required: true,
        riskIndicators: ['more than 10'], // Suggests poor maintenance
      },
    ],
  },

  {
    id: 'physical_6',
    section: 'Physical Security & Access Control',
    questionText: 'Do you have panic/duress alarms for employees?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery', 'workplace_violence_customer'],
    suggestsControls: ['alarm_system_panic_buttons'],
    followUpQuestions: [
      {
        id: 'physical_6a',
        section: 'Physical Security & Access Control',
        questionText: 'Where are panic buttons located? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'POS registers',
          'Manager office',
          'Cash office',
          'Customer service desk',
          'Other',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'physical_7',
    section: 'Physical Security & Access Control',
    questionText: 'Rate the overall physical security of your facility',
    questionType: 'rating',
    ratingScale: { 
      min: 1, 
      max: 5, 
      labels: ['Very vulnerable', 'Below average', 'Average', 'Above average', 'Highly secure'] 
    },
    required: true,
    informsVulnerability: true,
  },
];
```

#### **SECTION 7: LOSS PREVENTION STAFFING (5 questions)**

```typescript
const section7_lp_staff: RetailInterviewQuestion[] = [
  {
    id: 'lp_staff_1',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you employ dedicated loss prevention staff?',
    questionType: 'multiple_choice',
    options: [
      'Yes - full-time LP team',
      'Yes - part-time LP staff',
      'Yes - security guard (uniformed)',
      'No - store staff handles LP duties',
      'No dedicated LP resources',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['loss_prevention_plain_clothes', 'security_guard_uniformed'],
    riskIndicators: ['no - store staff', 'no dedicated'],
  },

  {
    id: 'lp_staff_2',
    section: 'Loss Prevention Staffing',
    questionText: 'If you have LP staff, what are their primary activities? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Floor surveillance (plain clothes)',
      'CCTV monitoring',
      'Receipt checking',
      'Apprehensions',
      'Inventory audits',
      'Employee investigations',
      'Training staff',
      'Not applicable - no LP staff',
    ],
    required: true,
  },

  {
    id: 'lp_staff_3',
    section: 'Loss Prevention Staffing',
    questionText: 'What hours do you have LP/security coverage?',
    questionType: 'multiple_choice',
    options: [
      'All operating hours',
      'Peak hours only (weekends, holidays)',
      'Sporadic/as-needed',
      'No LP coverage',
    ],
    required: true,
    informsVulnerability: true,
  },

  {
    id: 'lp_staff_4',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you have a visible security presence (uniformed guard, signage)?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    suggestsControls: ['security_guard_uniformed', 'signage_prosecution_policy'],
  },

  {
    id: 'lp_staff_5',
    section: 'Loss Prevention Staffing',
    questionText: 'Do you have a policy of prosecuting all theft cases regardless of value?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'lp_staff_5a',
        section: 'Loss Prevention Staffing',
        questionText: 'Is this policy posted/visible to customers?',
        questionType: 'yes_no',
        required: true,
        suggestsControls: ['signage_prosecution_policy'],
      },
    ],
  },
];
```

#### **SECTION 8: EMPLOYEE PROCEDURES & TRAINING (9 questions)**

```typescript
const section8_employee: RetailInterviewQuestion[] = [
  {
    id: 'employee_1',
    section: 'Employee Procedures & Training',
    questionText: 'Do you conduct background checks on all new hires?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive background checks',
      'Yes - criminal background only',
      'Selective - management positions only',
      'No background checks',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['employee_theft'],
    suggestsControls: ['employee_background_checks'],
    riskIndicators: ['no background'],
  },

  {
    id: 'employee_2',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees receive theft awareness training?',
    questionType: 'multiple_choice',
    options: [
      'Yes - comprehensive training during onboarding',
      'Yes - brief mention during onboarding',
      'Informal on-the-job guidance',
      'No formal training',
    ],
    required: true,
    informsVulnerability: true,
    riskIndicators: ['informal', 'no formal'],
  },

  {
    id: 'employee_3',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees receive robbery response training?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery'],
    suggestsControls: ['robbery_response_training'],
    followUpQuestions: [
      {
        id: 'employee_3a',
        section: 'Employee Procedures & Training',
        questionText: 'How often is robbery response training reinforced?',
        questionType: 'multiple_choice',
        options: [
          'Annually',
          'Every 2-3 years',
          'Only during initial training',
          'Never refreshed',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'employee_4',
    section: 'Employee Procedures & Training',
    questionText: 'What is your policy when employees observe theft?',
    questionType: 'multiple_choice',
    options: [
      'Approach and offer assistance (customer service approach)',
      'Notify LP/management immediately',
      'Do not confront - observe and report',
      'No clear policy',
    ],
    required: true,
    informsVulnerability: true,
  },

  {
    id: 'employee_5',
    section: 'Employee Procedures & Training',
    questionText: 'Do you have a two-person closing procedure policy?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['armed_robbery'],
    suggestsControls: ['closing_procedures_two_person'],
  },

  {
    id: 'employee_6',
    section: 'Employee Procedures & Training',
    questionText: 'Do you inspect employee bags/packages when they leave?',
    questionType: 'multiple_choice',
    options: [
      'Yes - routine inspections for all employees',
      'Yes - random inspections',
      'Rarely - only with cause',
      'No inspections',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['employee_theft'],
    suggestsControls: ['employee_package_inspection'],
    riskIndicators: ['rarely', 'no inspections'],
  },

  {
    id: 'employee_7',
    section: 'Employee Procedures & Training',
    questionText: 'Do employees use a separate entrance/exit from customers?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
  },

  {
    id: 'employee_8',
    section: 'Employee Procedures & Training',
    questionText: 'What is your employee discount policy?',
    questionType: 'multiple_choice',
    options: [
      'Formal policy with transaction tracking',
      'Informal policy',
      'Manager discretion',
      'No employee discounts',
    ],
    required: true,
    informsThreat: ['employee_theft'],
  },

  {
    id: 'employee_9',
    section: 'Employee Procedures & Training',
    questionText: 'How do you handle employee terminations from a security perspective?',
    questionType: 'checklist',
    options: [
      'Keys/badges immediately collected',
      'POS access disabled same day',
      'Alarm codes changed if applicable',
      'Exit interview conducted',
      'Final paycheck delivered (not picked up)',
      'No formal security procedures',
    ],
    required: true,
    informsVulnerability: true,
  },
];
```

#### **SECTION 9: MERCHANDISE PROTECTION (6 questions)**

```typescript
const section9_merchandise: RetailInterviewQuestion[] = [
  {
    id: 'merchandise_1',
    section: 'Merchandise Protection',
    questionText: 'How do you secure high-value merchandise on the sales floor?',
    questionType: 'checklist',
    options: [
      'Locked display cases',
      'Security cables/anchors',
      'Display alarms',
      'Spider wraps',
      'Keep high-value items in back (retrieve on request)',
      'No special security measures',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['high_value_display_security', 'merchandise_anchoring'],
    riskIndicators: ['no special security'],
  },

  {
    id: 'merchandise_2',
    section: 'Merchandise Protection',
    questionText: 'If you have fitting rooms, how are they monitored?',
    questionType: 'multiple_choice',
    options: [
      'Dedicated attendant with item count system',
      'Staff periodically checks',
      'CCTV monitoring exterior only',
      'No monitoring',
      'Not applicable - no fitting rooms',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['dressing_room_attendant', 'item_count_policy'],
    riskIndicators: ['no monitoring'],
  },

  {
    id: 'merchandise_3',
    section: 'Merchandise Protection',
    questionText: 'Do you use retail display fixtures designed with security in mind?',
    questionType: 'yes_no',
    required: true,
    informsVulnerability: true,
    followUpQuestions: [
      {
        id: 'merchandise_3a',
        section: 'Merchandise Protection',
        questionText: 'What security-focused fixtures do you use? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Locking peg hooks',
          'Locking showcases',
          'High-security hangers',
          'Merchandise keepers (clear boxes)',
          'Display safers',
        ],
        required: true,
      },
    ],
  },

  {
    id: 'merchandise_4',
    section: 'Merchandise Protection',
    questionText: 'How visible is your sales floor from checkout positions?',
    questionType: 'multiple_choice',
    options: [
      'Excellent - clear sightlines throughout',
      'Good - most areas visible',
      'Limited - many blind spots',
      'Poor - high shelving/displays block view',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['clear_sightlines_sales_floor', 'mirrors_blind_spot_coverage'],
    riskIndicators: ['limited', 'poor'],
  },

  {
    id: 'merchandise_5',
    section: 'Merchandise Protection',
    questionText: 'Do you use convex mirrors to cover blind spots?',
    questionType: 'yes_no',
    required: true,
    suggestsControls: ['mirrors_blind_spot_coverage'],
  },

  {
    id: 'merchandise_6',
    section: 'Merchandise Protection',
    questionText: 'How often do you conduct cycle counts/spot inventory audits?',
    questionType: 'multiple_choice',
    options: [
      'Daily on high-theft items',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Only annual inventory',
    ],
    required: true,
    informsVulnerability: true,
    suggestsControls: ['inventory_audit_cycle_counting'],
  },
];
```

#### **SECTION 10: REFUND & RETURN POLICIES (4 questions)**

```typescript
const section10_refunds: RetailInterviewQuestion[] = [
  {
    id: 'refunds_1',
    section: 'Refund & Return Policies',
    questionText: 'What authorization is required for refunds?',
    questionType: 'multiple_choice',
    options: [
      'Manager approval required for all refunds',
      'Manager approval over certain dollar threshold',
      'Cashiers can process independently',
      'No formal policy',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['return_fraud', 'employee_theft'],
    suggestsControls: ['refund_authorization_controls'],
    riskIndicators: ['cashiers can process', 'no formal policy'],
  },

  {
    id: 'refunds_2',
    section: 'Refund & Return Policies',
    questionText: 'Do you require receipts for all returns?',
    questionType: 'multiple_choice',
    options: [
      'Yes - receipt required, no exceptions',
      'Yes - but allow exceptions with ID tracking',
      'No - accept returns without receipts',
    ],
    required: true,
    informsVulnerability: true,
    informsThreat: ['return_fraud'],
    riskIndicators: ['no - accept returns'],
  },

  {
    id: 'refunds_3',
    section: 'Refund & Return Policies',
    questionText: 'Do you track customers who make frequent returns?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['return_fraud'],
  },

  {
    id: 'refunds_4',
    section: 'Refund & Return Policies',
    questionText: 'Have you had issues with return fraud in the past 12 months?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['return_fraud'],
    followUpQuestions: [
      {
        id: 'refunds_4a',
        section: 'Refund & Return Policies',
        questionText: 'What type of return fraud? (Select all that apply)',
        questionType: 'checklist',
        options: [
          'Returning stolen merchandise',
          'Receipt fraud (altered/fake receipts)',
          'Price tag switching',
          'Returning used/worn items',
          'Wardrobing (buying for one-time use)',
          'Employee collusion',
        ],
        required: true,
      },
    ],
  },
];
```

#### **SECTION 11: NEIGHBORHOOD & EXTERNAL FACTORS (3 questions)**

```typescript
const section11_external: RetailInterviewQuestion[] = [
  {
    id: 'external_1',
    section: 'Neighborhood & External Factors',
    questionText: 'How would you characterize the crime level in your immediate area?',
    questionType: 'multiple_choice',
    options: [
      'Very low crime area',
      'Low crime area',
      'Moderate crime area',
      'High crime area',
      'Very high crime area',
    ],
    required: true,
    informsThreat: ['shoplifting_individual', 'armed_robbery', 'burglary_after_hours'],
    informsVulnerability: true,
  },

  {
    id: 'external_2',
    section: 'Neighborhood & External Factors',
    questionText: 'Are you aware of organized retail crime (ORC) activity in your area?',
    questionType: 'yes_no',
    required: true,
    informsThreat: ['shoplifting_organized_retail_crime'],
  },

  {
    id: 'external_3',
    section: 'Neighborhood & External Factors',
    questionText: 'Do neighboring businesses share information about theft/security incidents?',
    questionType: 'multiple_choice',
    options: [
      'Yes - active information sharing network',
      'Occasionally - informal communication',
      'Rarely - minimal interaction',
      'No communication with other businesses',
    ],
    required: true,
    informsVulnerability: true,
  },
];
```

---

## 4. Risk Mapping & Calculation Integration

### 4.1 Interview → T×V×I Calculation Flow

```typescript
// server/services/retail-interview-risk-mapper.ts

export interface RetailRiskMapping {
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
  const relevantQuestions = getThreatQuestions(threatId);
  
  let vulnerabilityScore = 3; // Baseline moderate
  let riskFactorCount = 0;
  
  // SHRINKAGE ANALYSIS
  if (responses.shrinkage_1?.includes('3-5%') || responses.shrinkage_1?.includes('over 5%')) {
    riskFactorCount += 2; // High shrinkage = major vulnerability
  }
  
  // EAS SYSTEM EFFECTIVENESS
  if (responses.eas_1 === 'no' || responses.eas_2?.includes('no eas')) {
    riskFactorCount += 2;
  }
  if (responses.eas_3?.includes('ignored') || responses.eas_3?.includes('no formal')) {
    riskFactorCount += 1;
  }
  
  // CCTV COVERAGE
  if (responses.cctv_1 === 'no') {
    riskFactorCount += 2;
  }
  if (responses.cctv_3?.includes('rarely') || responses.cctv_3?.includes('deterrent')) {
    riskFactorCount += 1;
  }
  
  // CASH SECURITY
  if (threatId === 'armed_robbery') {
    if (responses.cash_1?.includes('over $2,000')) riskFactorCount += 2;
    if (responses.cash_3?.includes('no safe') || responses.cash_3?.includes('basic')) {
      riskFactorCount += 1;
    }
    if (responses.cash_6?.includes('predictable') || responses.cash_6?.includes('no formal')) {
      riskFactorCount += 1;
    }
  }
  
  // PHYSICAL SECURITY
  if (responses.physical_2?.includes('standard doors')) riskFactorCount += 1;
  if (responses.physical_4?.includes('no access') || responses.physical_4?.includes('unlocked')) {
    riskFactorCount += 1;
  }
  if (responses.physical_5 === 'no') riskFactorCount += 1;
  
  // LP STAFFING
  if (responses.lp_staff_1?.includes('no dedicated')) riskFactorCount += 2;
  
  // EMPLOYEE PROCEDURES
  if (responses.employee_1?.includes('no background')) riskFactorCount += 1;
  if (responses.employee_6?.includes('no inspections')) riskFactorCount += 1;
  
  // MERCHANDISE PROTECTION
  if (responses.merchandise_1?.includes('no special security')) riskFactorCount += 1;
  if (responses.merchandise_4?.includes('poor') || responses.merchandise_4?.includes('limited')) {
    riskFactorCount += 1;
  }
  
  // REFUND CONTROLS
  if (threatId === 'return_fraud' || threatId === 'employee_theft') {
    if (responses.refunds_1?.includes('no formal') || responses.refunds_1?.includes('independently')) {
      riskFactorCount += 1;
    }
  }
  
  // EXTERNAL FACTORS
  if (responses.external_1?.includes('high crime') || responses.external_1?.includes('very high')) {
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
    case 'shoplifting_individual':
      // High shrinkage + incidents = higher likelihood
      if (responses.shrinkage_1?.includes('3-5%') || responses.shrinkage_1?.includes('over 5%')) {
        likelihood = 4;
      }
      if (responses.shrinkage_3?.includes('30+')) likelihood = 5;
      if (responses.shrinkage_3?.includes('16-30')) likelihood = 4;
      break;
      
    case 'shoplifting_organized_retail_crime':
      if (responses.shrinkage_4 === 'yes') {
        likelihood = 3;
        if (responses.shrinkage_4a?.includes('10+')) likelihood = 5;
        if (responses.shrinkage_4a?.includes('6-10')) likelihood = 4;
      } else {
        likelihood = 2;
      }
      break;
      
    case 'employee_theft':
      if (responses.shrinkage_2?.includes('internal theft')) likelihood = 4;
      if (responses.shrinkage_5 === 'yes') likelihood = 4;
      break;
      
    case 'armed_robbery':
      if (responses.shrinkage_6 === 'yes') {
        likelihood = 3;
        if (responses.shrinkage_6a?.includes('within past 6 months')) likelihood = 4;
      } else {
        likelihood = 2;
      }
      if (responses.external_1?.includes('high crime')) likelihood += 1;
      likelihood = Math.min(5, likelihood);
      break;
      
    case 'burglary_after_hours':
      if (responses.shrinkage_7 === 'yes') {
        likelihood = 3;
      } else {
        likelihood = 2;
      }
      if (responses.external_1?.includes('high crime')) likelihood += 1;
      break;
      
    case 'return_fraud':
      if (responses.refunds_4 === 'yes') likelihood = 4;
      else likelihood = 3;
      break;
      
    default:
      likelihood = 3; // Default moderate for other threats
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
  
  // Revenue scale affects impact
  const revenue = responses.store_profile_2;
  if (revenue?.includes('Over $10M')) impact = 5;
  else if (revenue?.includes('$3M - $10M')) impact = 4;
  else if (revenue?.includes('$1M - $3M')) impact = 3;
  else impact = 2;
  
  // High-value merchandise increases impact
  if (responses.store_profile_8 === 'yes') {
    if (threatId === 'armed_robbery' || 
        threatId === 'shoplifting_organized_retail_crime' ||
        threatId === 'smash_and_grab') {
      impact += 1;
    }
  }
  
  // Armed robbery always has high impact due to safety concerns
  if (threatId === 'armed_robbery') {
    impact = Math.max(4, impact);
  }
  
  return Math.min(5, impact);
}
```

### 4.5 Auto-Generation of Risk Scenarios

```typescript
export async function generateRetailRiskScenarios(
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
      residualRisk: inherentRisk, // Initially same as inherent
      riskLevel: classifyRiskLevel(inherentRisk),
      scenarioDescription: generateScenarioDescription(threat.name, responses),
      suggestedControls: generateControlRecommendations(responses, threat.id),
    };
    
    scenarios.push(scenario);
  }
  
  return scenarios;
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
  
  // EAS RECOMMENDATIONS
  if (responses.eas_1 === 'no' || responses.eas_2?.includes('no eas')) {
    recommendations.add('eas_system_tags');
    recommendations.add('eas_system_gates');
  }
  
  // CCTV RECOMMENDATIONS
  if (responses.cctv_1 === 'no') {
    recommendations.add('cctv_sales_floor');
    recommendations.add('cctv_pos_registers');
    recommendations.add('cctv_entrance_exit');
  }
  if (responses.cctv_2 && !responses.cctv_2.includes('Cash office/safe')) {
    recommendations.add('cctv_cash_room');
  }
  if (responses.cctv_2 && !responses.cctv_2.includes('Parking lot')) {
    recommendations.add('cctv_parking_lot');
  }
  
  // CASH SECURITY RECOMMENDATIONS
  if (responses.cash_2 === 'no') {
    recommendations.add('cash_limit_registers');
  }
  if (responses.cash_3?.includes('no safe') || responses.cash_3?.includes('basic')) {
    recommendations.add('drop_safe');
    recommendations.add('time_delay_safe');
  }
  if (responses.cash_5 === 'no') {
    recommendations.add('armored_car_service');
  }
  if (responses.cash_7 === 'no') {
    recommendations.add('dual_control_cash_procedures');
  }
  
  // PHYSICAL SECURITY RECOMMENDATIONS
  if (responses.physical_2?.includes('standard doors')) {
    recommendations.add('reinforced_entrance_doors');
    recommendations.add('security_gates_after_hours');
  }
  if (responses.physical_3 === 'no') {
    recommendations.add('bollards_storefront_protection');
  }
  if (responses.physical_4?.includes('no access') || responses.physical_4?.includes('unlocked')) {
    recommendations.add('stockroom_access_control');
    recommendations.add('cash_room_access_control');
  }
  if (responses.physical_5 === 'no') {
    recommendations.add('alarm_system_intrusion');
  }
  if (responses.physical_6 === 'no') {
    recommendations.add('alarm_system_panic_buttons');
  }
  
  // LP STAFFING RECOMMENDATIONS
  if (responses.lp_staff_1?.includes('no dedicated')) {
    recommendations.add('loss_prevention_plain_clothes');
    // OR
    recommendations.add('security_guard_uniformed');
  }
  if (responses.lp_staff_4 === 'no') {
    recommendations.add('signage_prosecution_policy');
  }
  
  // EMPLOYEE PROCEDURE RECOMMENDATIONS
  if (responses.employee_1?.includes('no background')) {
    recommendations.add('employee_background_checks');
  }
  if (responses.employee_3 === 'no') {
    recommendations.add('robbery_response_training');
  }
  if (responses.employee_5 === 'no') {
    recommendations.add('closing_procedures_two_person');
  }
  if (responses.employee_6?.includes('no inspections')) {
    recommendations.add('employee_package_inspection');
  }
  
  // MERCHANDISE PROTECTION RECOMMENDATIONS
  if (responses.merchandise_1?.includes('no special security')) {
    recommendations.add('high_value_display_security');
    recommendations.add('merchandise_anchoring');
  }
  if (responses.merchandise_2?.includes('no monitoring')) {
    recommendations.add('dressing_room_attendant');
    recommendations.add('item_count_policy');
  }
  if (responses.merchandise_4?.includes('limited') || responses.merchandise_4?.includes('poor')) {
    recommendations.add('clear_sightlines_sales_floor');
  }
  if (responses.merchandise_5 === 'no') {
    recommendations.add('mirrors_blind_spot_coverage');
  }
  
  // REFUND CONTROLS RECOMMENDATIONS
  if (responses.refunds_1?.includes('no formal') || responses.refunds_1?.includes('independently')) {
    recommendations.add('refund_authorization_controls');
  }
  
  // Threat-specific recommendations
  const threatControlMap: Record<string, string[]> = {
    'shoplifting_individual': ['eas_system_tags', 'cctv_sales_floor', 'loss_prevention_plain_clothes'],
    'shoplifting_organized_retail_crime': ['facial_recognition_system', 'loss_prevention_plain_clothes', 'signage_prosecution_policy'],
    'employee_theft': ['cctv_pos_registers', 'employee_background_checks', 'employee_package_inspection', 'dual_control_cash_procedures'],
    'armed_robbery': ['robbery_response_training', 'alarm_system_panic_buttons', 'time_delay_safe', 'cash_limit_registers'],
    'burglary_after_hours': ['alarm_system_intrusion', 'reinforced_entrance_doors', 'security_gates_after_hours'],
    'smash_and_grab': ['bollards_storefront_protection', 'reinforced_entrance_doors', 'alarm_system_intrusion'],
    'return_fraud': ['refund_authorization_controls', 'cctv_pos_registers'],
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
│ STEP 1: CREATE RETAIL ASSESSMENT                           │
│ - Consultant selects "Retail Store" template               │
│ - System creates assessment record                          │
│ - Retail facility zones auto-created                        │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: CONDUCT LOSS PREVENTION INTERVIEW                  │
│ - 11 sections, 70+ questions                                │
│ - Progressive disclosure for follow-ups                     │
│ - Real-time risk indicator highlighting                     │
│ - Shrinkage analysis integrated                             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: AUTO-GENERATE RISK SCENARIOS                       │
│ - System calculates T×V×I for 12-15 retail threats         │
│ - Threat Likelihood: from incident history                  │
│ - Vulnerability: from control gaps & shrinkage              │
│ - Impact: from revenue, merchandise value                   │
│ - Creates risk scenario records                             │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: REVIEW & REFINE RISKS                              │
│ - Consultant reviews auto-calculated scores                 │
│ - Adjusts based on floor walk observations                  │
│ - Adds photos of vulnerabilities                            │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: SELECT CONTROLS                                    │
│ - System suggests controls from interview gaps              │
│ - Consultant selects applicable controls                    │
│ - Marks implementation status                               │
│ - Sets fidelity for existing controls                       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: GENERATE PDF REPORT                                │
│ - Executive summary with shrinkage ROI analysis             │
│ - Risk scenarios with control recommendations               │
│ - Incident response procedures                              │
│ - Photos and evidence                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 7-10. [Remaining Sections]

*The remaining sections (API Integration, UI Components, PDF Report Template, and Implementation Roadmap) follow the same pattern as the Office Building Framework, adapted for retail-specific concerns.*

**Key Retail-Specific Additions:**
- Shrinkage analysis dashboard
- ROI calculator for loss prevention investments
- Incident response procedures for robbery
- ORC intelligence sharing recommendations
- Employee awareness training templates

---

**END OF RETAIL STORE FRAMEWORK DOCUMENT**
