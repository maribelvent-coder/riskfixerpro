# RiskFixer: Executive Protection Security Assessment Framework
## Comprehensive Specification for High-Net-Worth Individual Protection

**Version:** 2.0  
**Integration Target:** RiskFixer Master Framework v2.0  
**Focus:** Executive/VIP/HNW Protection Assessments  
**Last Updated:** November 20, 2025

---

## Table of Contents

1. [Executive Protection Assessment Overview](#1-executive-protection-assessment-overview)
2. [Assessment Template Specifications](#2-assessment-template-specifications)
3. [Interview Protocol System](#3-interview-protocol-system)
4. [Risk Mapping & Calculation Integration](#4-risk-mapping--calculation-integration)
5. [Control Selection & Recommendations](#5-control-selection--recommendations)
6. [Geographic Intelligence Integration](#6-geographic-intelligence-integration)
7. [OSINT & Threat Intelligence](#7-osint--threat-intelligence)
8. [API Integration Specifications](#8-api-integration-specifications)
9. [UI Components](#9-ui-components)
10. [PDF Report Template](#10-pdf-report-template)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Executive Protection Assessment Overview

### 1.1 What Makes Executive Protection Assessments Unique

**Standard Physical Security Assessment:**
- Focuses on facilities and assets
- Static threat environment
- Control-based risk reduction
- Facility-centric perspective

**Executive Protection Assessment:**
- **Person-centric security** - Focuses on individuals and their patterns
- **Dynamic threat environment** - Travel, public exposure, family vulnerabilities
- **Intelligence-driven** - OSINT, crime data, pattern analysis
- **Lifestyle security** - Holistic assessment of daily routines and exposures
- **Multi-location analysis** - Home, office, frequent destinations, travel routes
- **Targeted threat focus** - Kidnapping, extortion, stalking, workplace violence
- **Privacy & exposure** - Digital footprint and public profile management

### 1.2 Assessment Components

```
Executive Protection Assessment = 
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. EXECUTIVE PROFILE & INTERVIEW                            │
  │    - Threat perception and security concerns                │
  │    - Daily routines and predictable patterns                │
  │    - Travel frequency and destinations                      │
  │    - Family security considerations                         │
  │    - Public profile and media exposure                      │
  │    - Current security measures                              │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. PRIMARY RESIDENCE SECURITY                               │
  │    - Physical security of home                              │
  │    - Neighborhood crime environment                         │
  │    - Emergency response capabilities                        │
  │    - Escape routes and safe rooms                           │
  │    - Family member vulnerabilities                          │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. WORKPLACE & TRAVEL SECURITY                              │
  │    - Office/workplace security posture                      │
  │    - Commute routes and patterns                            │
  │    - Parking security                                       │
  │    - Travel frequency and risk exposure                     │
  │    - International travel security                          │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. LIFESTYLE & PATTERN ANALYSIS                             │
  │    - Frequent locations (gym, restaurants, clubs)           │
  │    - Predictable routines and schedules                     │
  │    - Children's schools and activities                      │
  │    - High-profile events and appearances                    │
  │    - Social activities and exposure                         │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. GEOGRAPHIC INTELLIGENCE                                  │
  │    - Crime data analysis (CAP Index)                        │
  │    - Proximity analysis (police, hospitals, threats)        │
  │    - Neighborhood risk assessment                           │
  │    - Travel route vulnerability analysis                    │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. DIGITAL FOOTPRINT & OSINT                                │
  │    - Social media exposure assessment                       │
  │    - Public records (property, business filings)            │
  │    - News mentions and media coverage                       │
  │    - Family member digital exposure                         │
  │    - Potential threat actor identification                  │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 7. RISK CALCULATION (T×V×I×E FORMULA)                       │
  │    - Threat assessment (targeted vs opportunistic)          │
  │    - Vulnerability analysis (security gaps + patterns)      │
  │    - Impact evaluation (personal, family, business)         │
  │    - EXPOSURE FACTOR (public profile + predictability)      │
  └─────────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │ 8. PROTECTION RECOMMENDATIONS                               │
  │    - Physical security upgrades (residence/office)          │
  │    - Personal protection detail recommendations             │
  │    - Transportation security measures                       │
  │    - Digital privacy and OPSEC improvements                 │
  │    - Family security protocols                              │
  │    - Emergency response procedures                          │
  └─────────────────────────────────────────────────────────────┘
```

### 1.3 Key Differences from Standard Facility Assessments

| Aspect | Facility Assessment | Executive Protection |
|--------|---------------------|---------------------|
| **Primary Asset** | Building/equipment | Individual person |
| **Threat Focus** | Opportunistic criminals | Targeted attacks, stalking, kidnapping |
| **Geographic Scope** | Single location | Multiple locations + travel routes |
| **Pattern Analysis** | Access patterns | Lifestyle routines and predictability |
| **Data Sources** | Physical inspection | OSINT + crime data + interviews |
| **Control Strategy** | Static defenses | Dynamic security posture |
| **Risk Formula** | T×V×I | T×V×I×**E** (Exposure Factor) |

---

## 2. Assessment Template Specifications

### 2.1 Template Configuration

```typescript
{
  name: 'Executive Protection Security Assessment',
  templateType: 'executive_protection',
  description: 'Comprehensive security assessment for high-net-worth individuals focusing on personal safety and lifestyle security',
  siteTypeRecommendation: 'executive_residence',
  calculationMethod: 'tvie', // T×V×I×E formula (adds Exposure factor)
  
  defaultThreats: [
    'kidnapping_ransom',
    'kidnapping_express',
    'stalking_harassment',
    'home_invasion_targeted',
    'workplace_targeted_violence',
    'extortion_threat',
    'assassination_threat',
    'family_member_targeting',
    'vehicular_ambush',
    'public_event_attack',
    'swatting_attack',
    'doxxing_privacy_violation',
    'identity_theft_fraud',
    'robbery_opportunistic'
  ],
  
  defaultControls: [
    // Personal Protection
    'executive_protection_detail_24x7',
    'close_protection_officers',
    'secure_driver_service',
    'family_security_training',
    
    // Transportation
    'armored_vehicle_b6_rated',
    'gps_tracking_executive_vehicle',
    'route_randomization_protocol',
    'secure_parking_protocols',
    'vehicle_sweep_procedures',
    
    // Residential Security
    'residential_security_team_24x7',
    'panic_room_with_comms',
    'perimeter_intrusion_detection_residential',
    'safe_room_provisions',
    'duress_code_system',
    'residential_cctv_comprehensive',
    'remote_gate_access_control',
    'bollards_vehicle_barriers_residential',
    
    // Digital & Privacy
    'digital_privacy_services',
    'osint_monitoring_continuous',
    'social_media_privacy_lockdown',
    'threat_intelligence_monitoring',
    'executive_security_app',
    'secure_communications_encrypted',
    
    // Travel Security
    'travel_security_advance_team',
    'hotel_security_protocols',
    'international_travel_security_brief',
    'low_profile_travel_procedures',
    'medical_evacuation_insurance',
    
    // Family Protection
    'family_member_protection_detail',
    'school_security_liaison',
    'child_abduction_prevention_training',
    'family_emergency_protocols',
    'family_tracking_system',
    
    // Emergency Response
    'emergency_response_plan_executive',
    'medical_emergency_protocols',
    'evacuation_routes_planned',
    'safe_house_arrangements',
    'executive_protection_hotline_24x7',
    
    // Intelligence & Monitoring
    'background_checks_household_staff',
    'visitor_vetting_procedures',
    'threat_assessment_regular',
    'counter_surveillance_detection',
    'security_awareness_briefings_regular'
  ],
  
  riskMapping: {
    // Detailed T×V×I×E mappings defined in Section 4
  }
}
```

---

## 3. Interview Protocol System

### 3.1 Complete Interview Questionnaire (48 Questions)

#### **SECTION 1: EXECUTIVE PROFILE & THREAT PERCEPTION** (8 questions)

```typescript
const executiveProfileQuestions = [
  {
    id: 'ep_public_profile_level',
    question: 'How would you characterize your public profile?',
    type: 'single_select',
    options: [
      { value: 'very_high', label: 'Very High - National/international recognition, frequent media coverage', riskIndicator: 'critical' },
      { value: 'high', label: 'High - Regional recognition, regular media mentions', riskIndicator: 'high' },
      { value: 'medium', label: 'Medium - Known in industry/community, occasional media', riskIndicator: 'medium' },
      { value: 'low', label: 'Low - Minimal public exposure', riskIndicator: 'low' },
      { value: 'private', label: 'Private - Actively avoid public exposure', riskIndicator: 'none' }
    ],
    informsExposure: 'ALL_THREATS', // Public profile is core to exposure factor
    informsThreat: ['stalking_harassment', 'doxxing_privacy_violation', 'extortion_threat'],
    weight: 10,
    followUpQuestions: [
      {
        condition: 'very_high || high',
        question: 'What security measures do you currently have given your public profile?',
        id: 'ep_current_security_measures_detail'
      }
    ]
  },
  
  {
    id: 'ep_net_worth_range',
    question: 'What is your estimated net worth range? (This affects kidnapping/extortion risk)',
    type: 'single_select',
    options: [
      { value: 'under_1m', label: 'Under $1M', riskIndicator: 'none' },
      { value: '1m_to_10m', label: '$1M - $10M', riskIndicator: 'low' },
      { value: '10m_to_50m', label: '$10M - $50M', riskIndicator: 'medium' },
      { value: '50m_to_100m', label: '$50M - $100M', riskIndicator: 'high' },
      { value: 'over_100m', label: 'Over $100M', riskIndicator: 'critical' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
    ],
    informsThreat: ['kidnapping_ransom', 'kidnapping_express', 'extortion_threat', 'home_invasion_targeted'],
    informsImpact: ['kidnapping_ransom', 'extortion_threat'],
    weight: 9
  },
  
  {
    id: 'ep_industry_sector',
    question: 'What industry sector are you primarily associated with?',
    type: 'single_select',
    options: [
      { value: 'tech', label: 'Technology/Startups' },
      { value: 'finance', label: 'Finance/Banking/Investment', riskIndicator: 'medium' },
      { value: 'real_estate', label: 'Real Estate Development', riskIndicator: 'medium' },
      { value: 'entertainment', label: 'Entertainment/Media', riskIndicator: 'high' },
      { value: 'pharmaceutical', label: 'Pharmaceutical/Healthcare' },
      { value: 'energy', label: 'Energy/Oil & Gas', riskIndicator: 'medium' },
      { value: 'political', label: 'Political/Government', riskIndicator: 'high' },
      { value: 'legal', label: 'Legal (High-Profile Cases)', riskIndicator: 'high' },
      { value: 'retail', label: 'Retail/Consumer Goods' },
      { value: 'other', label: 'Other' }
    ],
    informsThreat: ['workplace_targeted_violence', 'extortion_threat', 'stalking_harassment'],
    weight: 4
  },
  
  {
    id: 'ep_threat_perception',
    question: 'How concerned are you about personal security threats?',
    type: 'single_select',
    options: [
      { value: 'very_concerned', label: 'Very concerned - I think about it daily', riskIndicator: 'high' },
      { value: 'somewhat_concerned', label: 'Somewhat concerned - It crosses my mind occasionally', riskIndicator: 'medium' },
      { value: 'minimal_concern', label: 'Minimally concerned - I give it little thought', riskIndicator: 'low' },
      { value: 'not_concerned', label: 'Not concerned - I feel very safe', riskIndicator: 'none' }
    ],
    informsVulnerability: 'ALL_THREATS', // Low concern can indicate vulnerability through complacency
    weight: 5,
    followUpQuestions: [
      {
        condition: 'very_concerned || somewhat_concerned',
        question: 'What specific threats concern you most?',
        id: 'ep_specific_threat_concerns',
        type: 'text'
      }
    ]
  },
  
  {
    id: 'ep_known_threats',
    question: 'Have you received any specific threats or experienced concerning incidents?',
    type: 'single_select',
    options: [
      { value: 'yes_recent', label: 'Yes, within the past year', riskIndicator: 'critical' },
      { value: 'yes_past', label: 'Yes, but more than a year ago', riskIndicator: 'high' },
      { value: 'no_but_concerned', label: 'No, but I have concerns about specific individuals/situations', riskIndicator: 'medium' },
      { value: 'no_threats', label: 'No known threats', riskIndicator: 'none' }
    ],
    informsThreat: 'ALL_THREATS',
    weight: 10,
    followUpQuestions: [
      {
        condition: 'yes_recent || yes_past || no_but_concerned',
        question: 'Please describe the nature of these threats or concerns:',
        id: 'ep_threat_details',
        type: 'text'
      },
      {
        condition: 'yes_recent || yes_past',
        question: 'Was law enforcement notified? Any restraining orders?',
        id: 'ep_legal_actions'
      }
    ]
  },
  
  {
    id: 'ep_current_security_level',
    question: 'What is your current level of personal security?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No formal security measures', riskIndicator: 'critical' },
      { value: 'minimal', label: 'Basic home security (alarm, cameras)', riskIndicator: 'high' },
      { value: 'moderate', label: 'Enhanced security (monitored system, occasional security presence)', riskIndicator: 'medium' },
      { value: 'comprehensive', label: 'Comprehensive (regular security detail, armored vehicle)', riskIndicator: 'low' },
      { value: '24x7_detail', label: '24/7 protection detail', riskIndicator: 'none' }
    ],
    informsVulnerability: 'ALL_THREATS',
    weight: 8
  },
  
  {
    id: 'ep_family_members',
    question: 'Do you have family members who could be vulnerable to targeting?',
    type: 'multi_select',
    options: [
      { value: 'spouse_partner', label: 'Spouse/Partner' },
      { value: 'children_school_age', label: 'Children (school age)', riskIndicator: 'high' },
      { value: 'children_college', label: 'Children (college age)' },
      { value: 'children_adult', label: 'Adult children' },
      { value: 'elderly_parents', label: 'Elderly parents living with you' },
      { value: 'none', label: 'No vulnerable family members' }
    ],
    informsThreat: ['family_member_targeting', 'kidnapping_ransom', 'extortion_threat'],
    informsImpact: 'ALL_THREATS',
    weight: 7,
    followUpQuestions: [
      {
        condition: 'children_school_age',
        question: 'Do your children attend school with other high-profile families? Is there school security?',
        id: 'ep_school_security_context'
      }
    ]
  },
  
  {
    id: 'ep_controversial_involvement',
    question: 'Are you involved in any controversial issues or litigation that might increase threat exposure?',
    type: 'single_select',
    options: [
      { value: 'yes_high_profile', label: 'Yes, high-profile controversial involvement', riskIndicator: 'critical' },
      { value: 'yes_moderate', label: 'Yes, some controversial involvement', riskIndicator: 'high' },
      { value: 'minor', label: 'Minor/occasional controversial matters', riskIndicator: 'medium' },
      { value: 'no', label: 'No controversial involvement', riskIndicator: 'none' }
    ],
    informsThreat: ['workplace_targeted_violence', 'stalking_harassment', 'extortion_threat', 'assassination_threat'],
    informsExposure: ['stalking_harassment', 'doxxing_privacy_violation'],
    weight: 8,
    followUpQuestions: [
      {
        condition: 'yes_high_profile || yes_moderate',
        question: 'What is the nature of this controversy and have you received threats related to it?',
        id: 'ep_controversy_details'
      }
    ]
  }
];
```

#### **SECTION 2: RESIDENCE SECURITY** (8 questions)

```typescript
const residenceSecurityQuestions = [
  {
    id: 'ep_residence_type',
    question: 'What type of primary residence do you have?',
    type: 'single_select',
    options: [
      { value: 'single_family_gated', label: 'Single-family home in gated community', riskIndicator: 'low' },
      { value: 'single_family_ungated', label: 'Single-family home in standard neighborhood', riskIndicator: 'medium' },
      { value: 'estate_large_property', label: 'Estate/large property with acreage', riskIndicator: 'medium' },
      { value: 'condo_highrise', label: 'Condominium/high-rise apartment', riskIndicator: 'low' },
      { value: 'penthouse', label: 'Penthouse apartment', riskIndicator: 'low' },
      { value: 'compound', label: 'Secured compound', riskIndicator: 'none' }
    ],
    informsVulnerability: ['home_invasion_targeted', 'stalking_harassment', 'family_member_targeting'],
    weight: 5
  },
  
  {
    id: 'ep_residence_visibility',
    question: 'How visible is your residence from public roads or neighboring properties?',
    type: 'single_select',
    options: [
      { value: 'highly_visible', label: 'Highly visible - No significant privacy screening', riskIndicator: 'high' },
      { value: 'somewhat_visible', label: 'Somewhat visible - Limited screening', riskIndicator: 'medium' },
      { value: 'minimal_visibility', label: 'Minimal visibility - Good screening/setback', riskIndicator: 'low' },
      { value: 'not_visible', label: 'Not visible - Fully screened/gated', riskIndicator: 'none' }
    ],
    informsVulnerability: ['stalking_harassment', 'home_invasion_targeted', 'family_member_targeting'],
    informsExposure: ['stalking_harassment'],
    weight: 6
  },
  
  {
    id: 'ep_residence_perimeter_security',
    question: 'What perimeter security does your residence have?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No perimeter security', riskIndicator: 'critical' },
      { value: 'fence_basic', label: 'Basic fence (under 6 feet)', riskIndicator: 'high' },
      { value: 'fence_secure', label: 'Secure fence (6+ feet)', riskIndicator: 'medium' },
      { value: 'gate_automatic', label: 'Automatic gate with access control', riskIndicator: 'low' },
      { value: 'gate_manned', label: 'Manned security gate', riskIndicator: 'none' },
      { value: 'wall', label: 'Perimeter wall', riskIndicator: 'low' },
      { value: 'intrusion_detection', label: 'Perimeter intrusion detection', riskIndicator: 'none' },
      { value: 'cctv_perimeter', label: 'CCTV coverage of perimeter', riskIndicator: 'low' }
    ],
    informsVulnerability: ['home_invasion_targeted', 'stalking_harassment', 'family_member_targeting'],
    weight: 8
  },
  
  {
    id: 'ep_residence_alarm_system',
    question: 'What type of alarm/security system does your residence have?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No alarm system', riskIndicator: 'critical' },
      { value: 'basic_unmonitored', label: 'Basic alarm, not monitored', riskIndicator: 'high' },
      { value: 'monitored_standard', label: 'Monitored alarm system (standard)', riskIndicator: 'medium' },
      { value: 'monitored_enhanced', label: 'Enhanced monitored system with video verification', riskIndicator: 'low' },
      { value: 'professional_monitoring_24x7', label: 'Professional 24/7 monitoring with rapid response', riskIndicator: 'none' }
    ],
    informsVulnerability: ['home_invasion_targeted', 'family_member_targeting'],
    weight: 8
  },
  
  {
    id: 'ep_safe_room',
    question: 'Do you have a panic room or safe room in your residence?',
    type: 'single_select',
    options: [
      { value: 'yes_full_featured', label: 'Yes, with communications and supplies', riskIndicator: 'none' },
      { value: 'yes_basic', label: 'Yes, basic hardened room', riskIndicator: 'low' },
      { value: 'designated_room', label: 'Designated room but not hardened', riskIndicator: 'medium' },
      { value: 'no', label: 'No panic room', riskIndicator: 'high' }
    ],
    informsVulnerability: ['home_invasion_targeted', 'family_member_targeting'],
    weight: 6
  },
  
  {
    id: 'ep_residence_cctv',
    question: 'What CCTV coverage do you have at your residence?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No cameras', riskIndicator: 'critical' },
      { value: 'doorbell_camera', label: 'Doorbell camera only', riskIndicator: 'high' },
      { value: 'entry_points', label: 'Cameras at entry points', riskIndicator: 'medium' },
      { value: 'comprehensive_exterior', label: 'Comprehensive exterior coverage', riskIndicator: 'low' },
      { value: 'interior_cameras', label: 'Interior cameras', riskIndicator: 'low' },
      { value: 'offsite_monitoring', label: 'Off-site professional monitoring', riskIndicator: 'none' },
      { value: 'recording_30_days', label: 'Recording with 30+ days retention', riskIndicator: 'low' }
    ],
    informsVulnerability: ['home_invasion_targeted', 'stalking_harassment', 'family_member_targeting'],
    weight: 7
  },
  
  {
    id: 'ep_household_staff',
    question: 'Do you have household staff with access to your residence?',
    type: 'single_select',
    options: [
      { value: 'yes_live_in', label: 'Yes, live-in staff', riskIndicator: 'medium' },
      { value: 'yes_regular_daily', label: 'Yes, regular daily staff', riskIndicator: 'medium' },
      { value: 'yes_occasional', label: 'Yes, occasional staff (weekly/monthly)', riskIndicator: 'low' },
      { value: 'no', label: 'No household staff', riskIndicator: 'none' }
    ],
    informsVulnerability: ['insider_threat_staff', 'home_invasion_targeted'],
    weight: 5,
    followUpQuestions: [
      {
        condition: 'yes_live_in || yes_regular_daily || yes_occasional',
        question: 'Do you conduct background checks on household staff?',
        id: 'ep_staff_background_checks'
      }
    ]
  },
  
  {
    id: 'ep_police_response_time',
    question: 'What is the estimated police response time to your residence?',
    type: 'single_select',
    options: [
      { value: 'under_5_min', label: 'Under 5 minutes', riskIndicator: 'none' },
      { value: '5_to_10_min', label: '5-10 minutes', riskIndicator: 'low' },
      { value: '10_to_15_min', label: '10-15 minutes', riskIndicator: 'medium' },
      { value: 'over_15_min', label: 'Over 15 minutes', riskIndicator: 'high' },
      { value: 'unknown', label: 'Unknown', riskIndicator: 'high' }
    ],
    informsVulnerability: ['home_invasion_targeted', 'family_member_targeting'],
    informsImpact: ['home_invasion_targeted'],
    weight: 6
  }
];
```

#### **SECTION 3: DAILY ROUTINES & PATTERN PREDICTABILITY** (7 questions)

```typescript
const dailyRoutinesQuestions = [
  {
    id: 'ep_daily_routine_predictability',
    question: 'How predictable is your daily schedule and routine?',
    type: 'single_select',
    options: [
      { value: 'highly_predictable', label: 'Highly predictable - Same schedule daily/weekly', riskIndicator: 'critical' },
      { value: 'somewhat_predictable', label: 'Somewhat predictable - Regular patterns with some variation', riskIndicator: 'high' },
      { value: 'variable', label: 'Variable - Schedule changes frequently', riskIndicator: 'medium' },
      { value: 'unpredictable', label: 'Unpredictable - Highly varied schedule', riskIndicator: 'low' },
      { value: 'randomized', label: 'Intentionally randomized for security', riskIndicator: 'none' }
    ],
    informsExposure: 'ALL_THREATS', // Predictability is core to exposure
    informsVulnerability: ['kidnapping_ransom', 'stalking_harassment', 'vehicular_ambush'],
    weight: 10
  },
  
  {
    id: 'ep_commute_pattern',
    question: 'How do you typically commute to work/office?',
    type: 'single_select',
    options: [
      { value: 'same_route_same_time', label: 'Same route, same time daily', riskIndicator: 'critical' },
      { value: 'same_route_varied_time', label: 'Same route, varied times', riskIndicator: 'high' },
      { value: 'varied_routes', label: 'Varied routes and times', riskIndicator: 'medium' },
      { value: 'driver_service', label: 'Professional driver with route variation', riskIndicator: 'low' },
      { value: 'no_regular_commute', label: 'No regular commute (work from home/travel)', riskIndicator: 'none' }
    ],
    informsExposure: ['kidnapping_ransom', 'vehicular_ambush', 'stalking_harassment'],
    informsVulnerability: ['kidnapping_ransom', 'vehicular_ambush'],
    weight: 9,
    followUpQuestions: [
      {
        condition: 'same_route_same_time || same_route_varied_time',
        question: 'Are there any particularly vulnerable points on your commute route (isolated areas, traffic choke points)?',
        id: 'ep_commute_vulnerabilities'
      }
    ]
  },
  
  {
    id: 'ep_parking_location',
    question: 'Where do you typically park at work/office?',
    type: 'single_select',
    options: [
      { value: 'street_parking_public', label: 'Public street parking', riskIndicator: 'critical' },
      { value: 'open_parking_lot', label: 'Open parking lot', riskIndicator: 'high' },
      { value: 'parking_garage_standard', label: 'Standard parking garage', riskIndicator: 'medium' },
      { value: 'reserved_spot_monitored', label: 'Reserved spot with CCTV monitoring', riskIndicator: 'low' },
      { value: 'secure_executive_parking', label: 'Secure executive parking with controlled access', riskIndicator: 'none' }
    ],
    informsVulnerability: ['vehicular_ambush', 'kidnapping_ransom', 'robbery_opportunistic'],
    weight: 6
  },
  
  {
    id: 'ep_frequent_locations',
    question: 'Do you frequent the same restaurants, gym, or other locations regularly?',
    type: 'single_select',
    options: [
      { value: 'yes_very_regular', label: 'Yes, same places at predictable times', riskIndicator: 'high' },
      { value: 'yes_but_varied', label: 'Yes, but times and days vary', riskIndicator: 'medium' },
      { value: 'rotate_locations', label: 'I rotate between multiple locations', riskIndicator: 'low' },
      { value: 'rarely_same_place', label: 'I rarely go to the same place twice', riskIndicator: 'none' }
    ],
    informsExposure: ['stalking_harassment', 'kidnapping_ransom', 'vehicular_ambush'],
    informsVulnerability: ['stalking_harassment'],
    weight: 6
  },
  
  {
    id: 'ep_social_media_usage',
    question: 'How do you use social media?',
    type: 'single_select',
    options: [
      { value: 'very_active_public', label: 'Very active with public posts (location tags, real-time updates)', riskIndicator: 'critical' },
      { value: 'active_public', label: 'Active with public profile', riskIndicator: 'high' },
      { value: 'moderate_friends_only', label: 'Moderate use, friends/connections only', riskIndicator: 'medium' },
      { value: 'minimal_private', label: 'Minimal use, private settings', riskIndicator: 'low' },
      { value: 'no_social_media', label: 'No social media presence', riskIndicator: 'none' }
    ],
    informsExposure: 'ALL_THREATS',
    informsVulnerability: ['stalking_harassment', 'doxxing_privacy_violation'],
    weight: 8,
    followUpQuestions: [
      {
        condition: 'very_active_public || active_public',
        question: 'Do you post location information, travel plans, or family photos publicly?',
        id: 'ep_social_media_opsec'
      }
    ]
  },
  
  {
    id: 'ep_children_schedule',
    question: 'If you have children, how predictable are their schedules (school drop-off/pick-up, activities)?',
    type: 'single_select',
    options: [
      { value: 'not_applicable', label: 'Not applicable - No children' },
      { value: 'highly_predictable', label: 'Highly predictable - Same schedule weekly', riskIndicator: 'critical' },
      { value: 'somewhat_predictable', label: 'Somewhat predictable with some variation', riskIndicator: 'high' },
      { value: 'varied', label: 'Varied schedule/transportation', riskIndicator: 'medium' },
      { value: 'secure_transport', label: 'Professional secure transportation service', riskIndicator: 'low' }
    ],
    informsExposure: ['family_member_targeting', 'kidnapping_ransom'],
    informsVulnerability: ['family_member_targeting'],
    weight: 8,
    conditionalDisplay: {
      dependsOn: 'ep_family_members',
      showIf: ['children_school_age', 'children_college']
    }
  },
  
  {
    id: 'ep_public_events_attendance',
    question: 'How often do you attend public events or high-profile gatherings?',
    type: 'single_select',
    options: [
      { value: 'very_frequent', label: 'Very frequently (weekly)', riskIndicator: 'high' },
      { value: 'frequent', label: 'Frequently (monthly)', riskIndicator: 'medium' },
      { value: 'occasional', label: 'Occasionally (few times per year)', riskIndicator: 'low' },
      { value: 'rarely', label: 'Rarely/Never', riskIndicator: 'none' }
    ],
    informsExposure: ['public_event_attack', 'stalking_harassment'],
    informsVulnerability: ['public_event_attack'],
    weight: 5,
    followUpQuestions: [
      {
        condition: 'very_frequent || frequent',
        question: 'Are these events publicly announced in advance? Do you coordinate security?',
        id: 'ep_public_events_security'
      }
    ]
  }
];
```

#### **SECTION 4: WORKPLACE SECURITY** (6 questions)

```typescript
const workplaceSecurityQuestions = [
  {
    id: 'ep_workplace_type',
    question: 'What type of workplace do you primarily work in?',
    type: 'single_select',
    options: [
      { value: 'corporate_office_secure', label: 'Corporate office with security', riskIndicator: 'low' },
      { value: 'corporate_office_minimal', label: 'Corporate office with minimal security', riskIndicator: 'medium' },
      { value: 'executive_suite', label: 'Executive suite/private office', riskIndicator: 'low' },
      { value: 'open_office', label: 'Open office/co-working space', riskIndicator: 'high' },
      { value: 'retail_public_facing', label: 'Retail or public-facing location', riskIndicator: 'high' },
      { value: 'work_from_home', label: 'Work primarily from home', riskIndicator: 'medium' },
      { value: 'multiple_locations', label: 'Multiple locations/frequent travel', riskIndicator: 'medium' }
    ],
    informsVulnerability: ['workplace_targeted_violence', 'stalking_harassment'],
    weight: 5
  },
  
  {
    id: 'ep_workplace_access_control',
    question: 'What level of access control exists at your workplace?',
    type: 'single_select',
    options: [
      { value: 'open_public', label: 'Open to public, no access control', riskIndicator: 'critical' },
      { value: 'receptionist_only', label: 'Receptionist check-in only', riskIndicator: 'high' },
      { value: 'badge_access', label: 'Badge/card access required', riskIndicator: 'medium' },
      { value: 'reception_plus_escort', label: 'Reception with visitor escort required', riskIndicator: 'low' },
      { value: 'multi_layer_security', label: 'Multi-layer security with executive floor protection', riskIndicator: 'none' }
    ],
    informsVulnerability: ['workplace_targeted_violence', 'stalking_harassment'],
    weight: 7
  },
  
  {
    id: 'ep_office_visibility',
    question: 'How visible is your office location to the public?',
    type: 'single_select',
    options: [
      { value: 'highly_visible', label: 'Highly visible from public areas/street', riskIndicator: 'high' },
      { value: 'somewhat_visible', label: 'Somewhat visible', riskIndicator: 'medium' },
      { value: 'interior_office', label: 'Interior office, not visible from outside', riskIndicator: 'low' },
      { value: 'secured_floor', label: 'Secured executive floor with no public access', riskIndicator: 'none' }
    ],
    informsVulnerability: ['stalking_harassment', 'workplace_targeted_violence'],
    weight: 4
  },
  
  {
    id: 'ep_workplace_threat_history',
    question: 'Has your workplace experienced any security incidents or threats?',
    type: 'single_select',
    options: [
      { value: 'yes_recent', label: 'Yes, within the past year', riskIndicator: 'critical' },
      { value: 'yes_past', label: 'Yes, but more than a year ago', riskIndicator: 'high' },
      { value: 'no_but_concerned', label: 'No incidents, but concerns exist', riskIndicator: 'medium' },
      { value: 'no_incidents', label: 'No incidents or concerns', riskIndicator: 'none' }
    ],
    informsThreat: ['workplace_targeted_violence'],
    informsVulnerability: ['workplace_targeted_violence'],
    weight: 7
  },
  
  {
    id: 'ep_workplace_security_staff',
    question: 'Does your workplace have dedicated security personnel?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No security personnel', riskIndicator: 'high' },
      { value: 'contracted_limited', label: 'Contracted security, limited hours', riskIndicator: 'medium' },
      { value: 'contracted_24x7', label: 'Contracted security, 24/7', riskIndicator: 'low' },
      { value: 'in_house_professional', label: 'In-house professional security team', riskIndicator: 'none' },
      { value: 'executive_protection_available', label: 'Executive protection specialists available', riskIndicator: 'none' }
    ],
    informsVulnerability: ['workplace_targeted_violence', 'stalking_harassment'],
    weight: 6
  },
  
  {
    id: 'ep_workplace_emergency_procedures',
    question: 'Are you familiar with workplace emergency and evacuation procedures?',
    type: 'single_select',
    options: [
      { value: 'no_procedures', label: 'No formal procedures exist', riskIndicator: 'high' },
      { value: 'exists_unfamiliar', label: 'Procedures exist but I am not familiar', riskIndicator: 'medium' },
      { value: 'familiar_not_practiced', label: 'Familiar but never practiced', riskIndicator: 'medium' },
      { value: 'familiar_and_practiced', label: 'Familiar and regularly practiced', riskIndicator: 'low' },
      { value: 'personal_evacuation_plan', label: 'Have personal evacuation/emergency plan', riskIndicator: 'none' }
    ],
    informsVulnerability: ['workplace_targeted_violence'],
    weight: 5
  }
];
```

#### **SECTION 5: TRAVEL & TRANSPORTATION SECURITY** (6 questions)

```typescript
const travelTransportationQuestions = [
  {
    id: 'ep_travel_frequency',
    question: 'How frequently do you travel for business or personal reasons?',
    type: 'single_select',
    options: [
      { value: 'very_frequent', label: 'Very frequently (multiple times per month)', riskIndicator: 'high' },
      { value: 'frequent', label: 'Frequently (monthly)', riskIndicator: 'medium' },
      { value: 'occasional', label: 'Occasionally (few times per year)', riskIndicator: 'low' },
      { value: 'rarely', label: 'Rarely travel', riskIndicator: 'none' }
    ],
    informsExposure: ['kidnapping_ransom', 'robbery_opportunistic'],
    informsVulnerability: ['kidnapping_ransom', 'vehicular_ambush'],
    weight: 5
  },
  
  {
    id: 'ep_international_travel',
    question: 'Do you travel internationally to high-risk countries?',
    type: 'single_select',
    options: [
      { value: 'yes_frequently', label: 'Yes, frequently to high-risk areas', riskIndicator: 'critical' },
      { value: 'yes_occasionally', label: 'Yes, occasionally to high-risk areas', riskIndicator: 'high' },
      { value: 'yes_low_risk', label: 'Yes, but only to low-risk countries', riskIndicator: 'medium' },
      { value: 'domestic_only', label: 'Domestic travel only', riskIndicator: 'low' },
      { value: 'minimal_travel', label: 'Minimal travel', riskIndicator: 'none' }
    ],
    informsThreat: ['kidnapping_ransom', 'extortion_threat'],
    informsVulnerability: ['kidnapping_ransom'],
    weight: 8,
    followUpQuestions: [
      {
        condition: 'yes_frequently || yes_occasionally',
        question: 'Do you coordinate security advance teams or use security services in these locations?',
        id: 'ep_international_security_measures'
      }
    ]
  },
  
  {
    id: 'ep_vehicle_type',
    question: 'What type of vehicle do you typically use?',
    type: 'single_select',
    options: [
      { value: 'personal_standard', label: 'Personal vehicle (standard)', riskIndicator: 'medium' },
      { value: 'personal_luxury_conspicuous', label: 'Personal luxury vehicle (conspicuous)', riskIndicator: 'high' },
      { value: 'personal_low_profile', label: 'Personal vehicle (deliberately low-profile)', riskIndicator: 'low' },
      { value: 'company_vehicle', label: 'Company vehicle', riskIndicator: 'medium' },
      { value: 'driver_service_standard', label: 'Professional driver service (standard vehicle)', riskIndicator: 'low' },
      { value: 'driver_service_armored', label: 'Professional driver with armored vehicle', riskIndicator: 'none' }
    ],
    informsVulnerability: ['vehicular_ambush', 'kidnapping_ransom', 'robbery_opportunistic'],
    informsExposure: ['kidnapping_ransom', 'stalking_harassment'],
    weight: 7
  },
  
  {
    id: 'ep_vehicle_security_features',
    question: 'What security features does your primary vehicle have?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No special security features', riskIndicator: 'high' },
      { value: 'alarm', label: 'Standard alarm system', riskIndicator: 'medium' },
      { value: 'gps_tracking', label: 'GPS tracking', riskIndicator: 'low' },
      { value: 'dash_cam', label: 'Dashboard camera', riskIndicator: 'low' },
      { value: 'armoring_partial', label: 'Partial armoring (doors/windows)', riskIndicator: 'none' },
      { value: 'armoring_full', label: 'Full armoring (B4-B7 rated)', riskIndicator: 'none' },
      { value: 'run_flat_tires', label: 'Run-flat tires', riskIndicator: 'none' },
      { value: 'panic_button', label: 'Panic button/emergency alert', riskIndicator: 'low' }
    ],
    informsVulnerability: ['vehicular_ambush', 'kidnapping_ransom'],
    weight: 7
  },
  
  {
    id: 'ep_travel_arrangements_publicity',
    question: 'How are your travel arrangements typically made and communicated?',
    type: 'single_select',
    options: [
      { value: 'public_calendar', label: 'Published on public calendar/social media', riskIndicator: 'critical' },
      { value: 'widely_shared', label: 'Shared widely within organization', riskIndicator: 'high' },
      { value: 'limited_distribution', label: 'Limited distribution (need-to-know)', riskIndicator: 'medium' },
      { value: 'executive_assistant_only', label: 'Executive assistant only', riskIndicator: 'low' },
      { value: 'highly_confidential', label: 'Highly confidential, minimal advance notice', riskIndicator: 'none' }
    ],
    informsExposure: 'ALL_THREATS',
    informsVulnerability: ['kidnapping_ransom', 'vehicular_ambush', 'public_event_attack'],
    weight: 8
  },
  
  {
    id: 'ep_airport_procedures',
    question: 'When traveling by air, what are your typical airport procedures?',
    type: 'single_select',
    options: [
      { value: 'commercial_standard', label: 'Commercial airline, standard procedures', riskIndicator: 'medium' },
      { value: 'commercial_priority', label: 'Commercial airline with priority services', riskIndicator: 'low' },
      { value: 'private_terminal', label: 'Private terminal/FBO services', riskIndicator: 'low' },
      { value: 'private_aircraft', label: 'Private aircraft', riskIndicator: 'none' },
      { value: 'minimal_air_travel', label: 'Minimal air travel', riskIndicator: 'none' }
    ],
    informsVulnerability: ['kidnapping_ransom', 'stalking_harassment', 'robbery_opportunistic'],
    weight: 4
  }
];
```

#### **SECTION 6: DIGITAL FOOTPRINT & PRIVACY** (7 questions)

```typescript
const digitalFootprintQuestions = [
  {
    id: 'ep_public_records_exposure',
    question: 'To your knowledge, what personal information is publicly available?',
    type: 'multi_select',
    options: [
      { value: 'home_address', label: 'Home address (property records)', riskIndicator: 'high' },
      { value: 'phone_numbers', label: 'Phone numbers', riskIndicator: 'medium' },
      { value: 'business_affiliations', label: 'Business affiliations and investments', riskIndicator: 'medium' },
      { value: 'family_information', label: 'Family member information', riskIndicator: 'high' },
      { value: 'net_worth_estimates', label: 'Net worth estimates/financial information', riskIndicator: 'high' },
      { value: 'vehicle_information', label: 'Vehicle registration information', riskIndicator: 'medium' },
      { value: 'legal_records', label: 'Legal proceedings/court records', riskIndicator: 'medium' },
      { value: 'minimal_exposure', label: 'Minimal public information available', riskIndicator: 'low' }
    ],
    informsExposure: 'ALL_THREATS',
    informsVulnerability: ['doxxing_privacy_violation', 'stalking_harassment', 'home_invasion_targeted'],
    weight: 8
  },
  
  {
    id: 'ep_media_coverage',
    question: 'What level of media coverage do you receive?',
    type: 'single_select',
    options: [
      { value: 'extensive', label: 'Extensive (regular national/international coverage)', riskIndicator: 'critical' },
      { value: 'frequent', label: 'Frequent (regular local/regional coverage)', riskIndicator: 'high' },
      { value: 'occasional', label: 'Occasional (sporadic mentions)', riskIndicator: 'medium' },
      { value: 'minimal', label: 'Minimal (rare mentions)', riskIndicator: 'low' },
      { value: 'none', label: 'No media coverage', riskIndicator: 'none' }
    ],
    informsExposure: 'ALL_THREATS',
    informsThreat: ['stalking_harassment', 'extortion_threat'],
    weight: 7
  },
  
  {
    id: 'ep_online_presence_management',
    question: 'Do you actively manage your online presence and digital footprint?',
    type: 'single_select',
    options: [
      { value: 'no_management', label: 'No active management', riskIndicator: 'high' },
      { value: 'basic_privacy_settings', label: 'Basic privacy settings on social media', riskIndicator: 'medium' },
      { value: 'active_monitoring', label: 'Actively monitor online mentions', riskIndicator: 'low' },
      { value: 'professional_service', label: 'Use professional privacy protection service', riskIndicator: 'none' },
      { value: 'comprehensive_program', label: 'Comprehensive digital privacy program', riskIndicator: 'none' }
    ],
    informsVulnerability: ['doxxing_privacy_violation', 'stalking_harassment', 'social_engineering'],
    weight: 6
  },
  
  {
    id: 'ep_family_digital_exposure',
    question: 'What is your family members\' digital footprint exposure?',
    type: 'single_select',
    options: [
      { value: 'not_applicable', label: 'Not applicable - No family' },
      { value: 'high_exposure', label: 'High - Active public social media presence', riskIndicator: 'critical' },
      { value: 'moderate_exposure', label: 'Moderate - Some social media, mixed privacy settings', riskIndicator: 'high' },
      { value: 'low_exposure', label: 'Low - Private settings, limited sharing', riskIndicator: 'medium' },
      { value: 'minimal_controlled', label: 'Minimal - Actively controlled for privacy', riskIndicator: 'low' },
      { value: 'security_trained', label: 'Family is security-trained on digital OpSec', riskIndicator: 'none' }
    ],
    informsExposure: ['family_member_targeting', 'kidnapping_ransom', 'stalking_harassment'],
    informsVulnerability: ['family_member_targeting', 'doxxing_privacy_violation'],
    weight: 7
  },
  
  {
    id: 'ep_google_alerts',
    question: 'Do you have monitoring in place for online mentions of your name/family?',
    type: 'single_select',
    options: [
      { value: 'no_monitoring', label: 'No monitoring', riskIndicator: 'medium' },
      { value: 'google_alerts', label: 'Google Alerts or similar', riskIndicator: 'low' },
      { value: 'professional_monitoring', label: 'Professional reputation monitoring service', riskIndicator: 'none' },
      { value: 'comprehensive_osint', label: 'Comprehensive OSINT monitoring', riskIndicator: 'none' }
    ],
    informsVulnerability: ['doxxing_privacy_violation', 'stalking_harassment', 'reputation_damage'],
    weight: 5
  },
  
  {
    id: 'ep_email_phone_security',
    question: 'What security measures do you use for email and phone communications?',
    type: 'multi_select',
    options: [
      { value: 'standard_only', label: 'Standard security only', riskIndicator: 'medium' },
      { value: 'two_factor_auth', label: 'Two-factor authentication', riskIndicator: 'low' },
      { value: 'encrypted_email', label: 'Encrypted email service', riskIndicator: 'low' },
      { value: 'secure_phone_service', label: 'Secure/encrypted phone service', riskIndicator: 'none' },
      { value: 'burner_numbers', label: 'Use of burner/secondary numbers for public use', riskIndicator: 'low' },
      { value: 'vpn_usage', label: 'Regular VPN usage', riskIndicator: 'low' }
    ],
    informsVulnerability: ['social_engineering', 'doxxing_privacy_violation', 'cyber_enabled_threats'],
    weight: 5
  },
  
  {
    id: 'ep_information_vetting',
    question: 'Do you vet individuals before sharing personal information?',
    type: 'single_select',
    options: [
      { value: 'minimal_vetting', label: 'Minimal vetting - Share relatively freely', riskIndicator: 'high' },
      { value: 'selective_sharing', label: 'Selective about what I share', riskIndicator: 'medium' },
      { value: 'careful_vetting', label: 'Careful vetting before sharing personal details', riskIndicator: 'low' },
      { value: 'strict_protocol', label: 'Strict protocols for information sharing', riskIndicator: 'none' }
    ],
    informsVulnerability: ['social_engineering', 'insider_threat_staff', 'doxxing_privacy_violation'],
    weight: 5
  }
];
```

#### **SECTION 7: EMERGENCY PREPAREDNESS** (6 questions)

```typescript
const emergencyPreparednessQuestions = [
  {
    id: 'ep_emergency_contacts',
    question: 'Do you have emergency contact protocols established?',
    type: 'single_select',
    options: [
      { value: 'no_protocols', label: 'No formal emergency protocols', riskIndicator: 'high' },
      { value: 'basic_contacts', label: 'Basic emergency contact list', riskIndicator: 'medium' },
      { value: 'documented_protocols', label: 'Documented emergency response protocols', riskIndicator: 'low' },
      { value: 'comprehensive_plan', label: 'Comprehensive emergency plan with family', riskIndicator: 'none' },
      { value: 'professional_response_team', label: 'Professional emergency response team on retainer', riskIndicator: 'none' }
    ],
    informsVulnerability: 'ALL_THREATS',
    weight: 7
  },
  
  {
    id: 'ep_family_emergency_training',
    question: 'Has your family received emergency/security awareness training?',
    type: 'single_select',
    options: [
      { value: 'not_applicable', label: 'Not applicable - No family' },
      { value: 'no_training', label: 'No training', riskIndicator: 'high' },
      { value: 'basic_discussion', label: 'Basic discussions about safety', riskIndicator: 'medium' },
      { value: 'formal_training_once', label: 'Formal training conducted once', riskIndicator: 'low' },
      { value: 'regular_training', label: 'Regular training and drills', riskIndicator: 'none' }
    ],
    informsVulnerability: ['family_member_targeting', 'kidnapping_ransom', 'home_invasion_targeted'],
    weight: 6
  },
  
  {
    id: 'ep_duress_code',
    question: 'Do you have duress codes or signals established with family/security?',
    type: 'single_select',
    options: [
      { value: 'no_duress_codes', label: 'No duress codes established', riskIndicator: 'high' },
      { value: 'informal_signals', label: 'Informal signals only', riskIndicator: 'medium' },
      { value: 'established_with_family', label: 'Established duress codes with family', riskIndicator: 'low' },
      { value: 'comprehensive_system', label: 'Comprehensive duress system including security team', riskIndicator: 'none' }
    ],
    informsVulnerability: ['kidnapping_ransom', 'home_invasion_targeted', 'extortion_threat'],
    weight: 6
  },
  
  {
    id: 'ep_evacuation_routes',
    question: 'Have you identified and practiced evacuation routes from your primary locations?',
    type: 'single_select',
    options: [
      { value: 'no_planning', label: 'No evacuation planning', riskIndicator: 'high' },
      { value: 'identified_not_practiced', label: 'Routes identified but never practiced', riskIndicator: 'medium' },
      { value: 'practiced_occasionally', label: 'Practiced occasionally', riskIndicator: 'low' },
      { value: 'regularly_practiced', label: 'Regularly practiced and updated', riskIndicator: 'none' }
    ],
    informsVulnerability: ['home_invasion_targeted', 'workplace_targeted_violence', 'natural_disaster'],
    weight: 5
  },
  
  {
    id: 'ep_go_bag_prepared',
    question: 'Do you maintain a "go bag" or emergency supplies?',
    type: 'single_select',
    options: [
      { value: 'no_preparation', label: 'No emergency supplies prepared', riskIndicator: 'medium' },
      { value: 'basic_supplies', label: 'Basic emergency supplies', riskIndicator: 'low' },
      { value: 'comprehensive_go_bag', label: 'Comprehensive "go bag" prepared', riskIndicator: 'none' },
      { value: 'multiple_locations', label: 'Go bags at multiple locations', riskIndicator: 'none' }
    ],
    informsVulnerability: ['natural_disaster', 'evacuation_scenarios'],
    weight: 3
  },
  
  {
    id: 'ep_medical_emergency_plan',
    question: 'Do you have a medical emergency response plan?',
    type: 'single_select',
    options: [
      { value: 'no_plan', label: 'No specific medical emergency plan', riskIndicator: 'medium' },
      { value: 'basic_knowledge', label: 'Know nearest hospitals', riskIndicator: 'low' },
      { value: 'documented_plan', label: 'Documented plan with medical contacts', riskIndicator: 'low' },
      { value: 'medical_evacuation_insurance', label: 'Medical evacuation insurance and protocols', riskIndicator: 'none' },
      { value: 'on_call_medical', label: 'On-call medical professional', riskIndicator: 'none' }
    ],
    informsVulnerability: ['medical_emergency_response_delay'],
    informsImpact: 'ALL_THREATS',
    weight: 5
  }
];
```

### 3.2 Interview Response Storage

```typescript
// Store in executiveInterviews table
interface ExecutiveInterviewResponse {
  executiveProfileId: number;
  interviewDate: Date;
  responses: {
    // Section 1: Executive Profile
    ep_public_profile_level: string;
    ep_net_worth_range: string;
    ep_industry_sector: string;
    ep_threat_perception: string;
    ep_known_threats: string;
    ep_current_security_level: string;
    ep_family_members: string[];
    ep_controversial_involvement: string;
    
    // Section 2: Residence Security
    ep_residence_type: string;
    ep_residence_visibility: string;
    ep_residence_perimeter_security: string[];
    ep_residence_alarm_system: string;
    ep_safe_room: string;
    ep_residence_cctv: string[];
    ep_household_staff: string;
    ep_police_response_time: string;
    
    // Section 3: Daily Routines & Patterns
    ep_daily_routine_predictability: string;
    ep_commute_pattern: string;
    ep_parking_location: string;
    ep_frequent_locations: string;
    ep_social_media_usage: string;
    ep_children_schedule: string;
    ep_public_events_attendance: string;
    
    // Section 4: Workplace Security
    ep_workplace_type: string;
    ep_workplace_access_control: string;
    ep_office_visibility: string;
    ep_workplace_threat_history: string;
    ep_workplace_security_staff: string;
    ep_workplace_emergency_procedures: string;
    
    // Section 5: Travel & Transportation
    ep_travel_frequency: string;
    ep_international_travel: string;
    ep_vehicle_type: string;
    ep_vehicle_security_features: string[];
    ep_travel_arrangements_publicity: string;
    ep_airport_procedures: string;
    
    // Section 6: Digital Footprint
    ep_public_records_exposure: string[];
    ep_media_coverage: string;
    ep_online_presence_management: string;
    ep_family_digital_exposure: string;
    ep_google_alerts: string;
    ep_email_phone_security: string[];
    ep_information_vetting: string;
    
    // Section 7: Emergency Preparedness
    ep_emergency_contacts: string;
    ep_family_emergency_training: string;
    ep_duress_code: string;
    ep_evacuation_routes: string;
    ep_go_bag_prepared: string;
    ep_medical_emergency_plan: string;
    
    // Follow-up responses
    followUpResponses: Record<string, string>;
  };
  
  // Subjective assessments
  perceivedThreatLevel: number; // 1-5
  cooperationLevel: string;
  notes: string;
  concernsRaised: string[];
}
```

---

## 4. Risk Mapping & Calculation Integration

### 4.1 Executive Protection-Specific Threats

```typescript
const executiveProtectionThreats = [
  {
    id: 'kidnapping_ransom',
    name: 'Kidnapping for Ransom',
    category: 'Targeted Violence',
    baselineThreatScore: 6,
    baselineImpactScore: 10, // Maximum impact
    description: 'Abduction of the executive or family member for financial ransom',
    affectedAssets: ['Personal safety', 'Family safety', 'Financial assets', 'Business operations']
  },
  
  {
    id: 'kidnapping_express',
    name: 'Express Kidnapping',
    category: 'Opportunistic Crime',
    baselineThreatScore: 4,
    baselineImpactScore: 7,
    description: 'Short-term abduction for immediate financial gain (ATM withdrawals, etc.)',
    affectedAssets: ['Personal safety', 'Financial assets']
  },
  
  {
    id: 'stalking_harassment',
    name: 'Stalking / Harassment',
    category: 'Personal Security',
    baselineThreatScore: 7,
    baselineImpactScore: 6,
    description: 'Persistent unwanted attention, following, or harassment',
    affectedAssets: ['Personal safety', 'Family safety', 'Quality of life', 'Privacy']
  },
  
  {
    id: 'home_invasion_targeted',
    name: 'Targeted Home Invasion',
    category: 'Property Crime',
    baselineThreatScore: 5,
    baselineImpactScore: 8,
    description: 'Forced entry into residence with knowledge of occupant wealth',
    affectedAssets: ['Personal safety', 'Family safety', 'Property', 'Sense of security']
  },
  
  {
    id: 'workplace_targeted_violence',
    name: 'Workplace Targeted Violence',
    category: 'Workplace Violence',
    baselineThreatScore: 5,
    baselineImpactScore: 9,
    description: 'Intentional violence at workplace directed at the executive',
    affectedAssets: ['Personal safety', 'Employee safety', 'Business operations']
  },
  
  {
    id: 'extortion_threat',
    name: 'Extortion / Blackmail',
    category: 'Financial Crime',
    baselineThreatScore: 6,
    baselineImpactScore: 7,
    description: 'Demands for payment under threat of harm or exposure',
    affectedAssets: ['Financial assets', 'Reputation', 'Privacy', 'Business operations']
  },
  
  {
    id: 'assassination_threat',
    name: 'Assassination Threat',
    category: 'Targeted Violence',
    baselineThreatScore: 2, // Low likelihood but catastrophic
    baselineImpactScore: 10,
    description: 'Intentional plot to kill the executive',
    affectedAssets: ['Personal safety', 'Life']
  },
  
  {
    id: 'family_member_targeting',
    name: 'Family Member Targeting',
    category: 'Targeted Violence',
    baselineThreatScore: 6,
    baselineImpactScore: 9,
    description: 'Targeting of family members (children, spouse) for leverage',
    affectedAssets: ['Family safety', 'Financial assets', 'Emotional wellbeing']
  },
  
  {
    id: 'vehicular_ambush',
    name: 'Vehicular Ambush / Carjacking',
    category: 'Targeted Violence',
    baselineThreatScore: 5,
    baselineImpactScore: 8,
    description: 'Attack or abduction during vehicle transit',
    affectedAssets: ['Personal safety', 'Financial assets', 'Transportation']
  },
  
  {
    id: 'public_event_attack',
    name: 'Public Event Attack',
    category: 'Targeted Violence',
    baselineThreatScore: 4,
    baselineImpactScore: 8,
    description: 'Attack during public appearance or event',
    affectedAssets: ['Personal safety', 'Reputation', 'Public confidence']
  },
  
  {
    id: 'swatting_attack',
    name: 'Swatting Attack',
    category: 'Harassment',
    baselineThreatScore: 5,
    baselineImpactScore: 6,
    description: 'False emergency report triggering armed law enforcement response',
    affectedAssets: ['Personal safety', 'Family safety', 'Property', 'Reputation']
  },
  
  {
    id: 'doxxing_privacy_violation',
    name: 'Doxxing / Privacy Violation',
    category: 'Digital Threat',
    baselineThreatScore: 7,
    baselineImpactScore: 5,
    description: 'Public release of personal information with malicious intent',
    affectedAssets: ['Privacy', 'Personal security', 'Family safety']
  },
  
  {
    id: 'identity_theft_fraud',
    name: 'Identity Theft / Financial Fraud',
    category: 'Financial Crime',
    baselineThreatScore: 6,
    baselineImpactScore: 5,
    description: 'Theft of identity or financial fraud targeting high-net-worth individual',
    affectedAssets: ['Financial assets', 'Credit', 'Reputation']
  },
  
  {
    id: 'robbery_opportunistic',
    name: 'Opportunistic Robbery',
    category: 'Opportunistic Crime',
    baselineThreatScore: 5,
    baselineImpactScore: 4,
    description: 'Robbery based on perceived wealth (jewelry, watch, etc.)',
    affectedAssets: ['Personal safety', 'Property', 'Valuables']
  }
];
```

### 4.2 T×V×I×E Calculation Logic

**The Executive Protection formula adds the EXPOSURE (E) factor:**

```
Risk Score = Threat (T) × Vulnerability (V) × Impact (I) × Exposure (E)

Where:
- T = 1-10 (Threat likelihood based on profile and intelligence)
- V = 1-10 (Vulnerability based on security gaps and patterns)
- I = 1-10 (Impact severity)
- E = 1-5 (Exposure multiplier based on public profile and predictability)
```

**Exposure Factor (E) Calculation:**

```typescript
function calculateExposureFactor(responses: InterviewResponses): number {
  let exposureScore = 1.0; // Baseline
  
  // PUBLIC PROFILE COMPONENT (up to +2.0)
  if (responses.ep_public_profile_level === 'very_high') {
    exposureScore += 2.0;
  } else if (responses.ep_public_profile_level === 'high') {
    exposureScore += 1.5;
  } else if (responses.ep_public_profile_level === 'medium') {
    exposureScore += 1.0;
  } else if (responses.ep_public_profile_level === 'low') {
    exposureScore += 0.5;
  }
  // 'private' adds nothing
  
  // PATTERN PREDICTABILITY COMPONENT (up to +1.5)
  if (responses.ep_daily_routine_predictability === 'highly_predictable') {
    exposureScore += 1.5;
  } else if (responses.ep_daily_routine_predictability === 'somewhat_predictable') {
    exposureScore += 1.0;
  } else if (responses.ep_daily_routine_predictability === 'variable') {
    exposureScore += 0.5;
  }
  // 'unpredictable' or 'randomized' adds nothing
  
  // SOCIAL MEDIA COMPONENT (up to +1.0)
  if (responses.ep_social_media_usage === 'very_active_public') {
    exposureScore += 1.0;
  } else if (responses.ep_social_media_usage === 'active_public') {
    exposureScore += 0.7;
  } else if (responses.ep_social_media_usage === 'moderate_friends_only') {
    exposureScore += 0.3;
  }
  
  // MEDIA COVERAGE COMPONENT (up to +0.5)
  if (responses.ep_media_coverage === 'extensive') {
    exposureScore += 0.5;
  } else if (responses.ep_media_coverage === 'frequent') {
    exposureScore += 0.3;
  }
  
  // Cap exposure factor at 5.0
  return Math.min(5.0, exposureScore);
}
```

### 4.3 Complete Risk Calculation Example

```typescript
// Example: Calculating risk for "Kidnapping for Ransom"
function calculateExecutiveProtectionRisk(
  interviewResponses: InterviewResponses,
  threatId: string,
  osintFindings: OSINTFindings,
  crimeData: CrimeData
): RiskScore {
  let T = getBaselineThreatScore(threatId); // Start with 6 for kidnapping_ransom
  let V = 5; // Start at median
  let I = getBaselineImpactScore(threatId); // 10 for kidnapping
  
  // === THREAT MODIFIERS ===
  if (threatId === 'kidnapping_ransom') {
    // Net worth increases attractiveness
    if (responses.ep_net_worth_range === 'over_100m') T += 3;
    else if (responses.ep_net_worth_range === '50m_to_100m') T += 2;
    else if (responses.ep_net_worth_range === '10m_to_50m') T += 1;
    
    // Public profile increases targeting likelihood
    if (responses.ep_public_profile_level === 'very_high') T += 2;
    else if (responses.ep_public_profile_level === 'high') T += 1;
    
    // Known threats
    if (responses.ep_known_threats === 'yes_recent') T += 3;
    else if (responses.ep_known_threats === 'yes_past') T += 1;
    
    // Industry risks
    if (responses.ep_industry_sector === 'finance' || 
        responses.ep_industry_sector === 'real_estate') T += 1;
    
    // International travel to high-risk areas
    if (responses.ep_international_travel === 'yes_frequently') T += 2;
    else if (responses.ep_international_travel === 'yes_occasionally') T += 1;
    
    // Crime environment (from CAP Index data)
    if (crimeData.kidnappingRate > nationalAverage * 2) T += 2;
    else if (crimeData.kidnappingRate > nationalAverage) T += 1;
  }
  
  // === VULNERABILITY MODIFIERS ===
  if (threatId === 'kidnapping_ransom') {
    // Pattern predictability increases vulnerability
    if (responses.ep_daily_routine_predictability === 'highly_predictable') V += 3;
    else if (responses.ep_daily_routine_predictability === 'somewhat_predictable') V += 2;
    else if (responses.ep_daily_routine_predictability === 'variable') V += 1;
    else if (responses.ep_daily_routine_predictability === 'randomized') V -= 2;
    
    // Commute pattern
    if (responses.ep_commute_pattern === 'same_route_same_time') V += 3;
    else if (responses.ep_commute_pattern === 'same_route_varied_time') V += 2;
    else if (responses.ep_commute_pattern === 'varied_routes') V += 1;
    else if (responses.ep_commute_pattern === 'driver_service') V -= 1;
    
    // Current security level
    if (responses.ep_current_security_level === 'none') V += 3;
    else if (responses.ep_current_security_level === 'minimal') V += 2;
    else if (responses.ep_current_security_level === 'moderate') V += 0;
    else if (responses.ep_current_security_level === 'comprehensive') V -= 2;
    else if (responses.ep_current_security_level === '24x7_detail') V -= 3;
    
    // Vehicle security
    if (responses.ep_vehicle_type === 'driver_service_armored') V -= 3;
    else if (responses.ep_vehicle_type === 'driver_service_standard') V -= 1;
    else if (responses.ep_vehicle_type === 'personal_luxury_conspicuous') V += 2;
    
    // Residence security
    const residenceSecurity = responses.ep_residence_perimeter_security || [];
    if (residenceSecurity.includes('none')) V += 2;
    if (residenceSecurity.includes('gate_manned')) V -= 2;
    if (residenceSecurity.includes('intrusion_detection')) V -= 1;
    
    // Police response time
    if (responses.ep_police_response_time === 'over_15_min') V += 2;
    else if (responses.ep_police_response_time === 'under_5_min') V -= 1;
    
    // Travel arrangements publicity
    if (responses.ep_travel_arrangements_publicity === 'public_calendar') V += 3;
    else if (responses.ep_travel_arrangements_publicity === 'widely_shared') V += 2;
    else if (responses.ep_travel_arrangements_publicity === 'highly_confidential') V -= 2;
    
    // Family vulnerability
    const familyMembers = responses.ep_family_members || [];
    if (familyMembers.includes('children_school_age')) V += 1;
    if (responses.ep_children_schedule === 'highly_predictable') V += 2;
  }
  
  // === IMPACT MODIFIERS ===
  // Impact for kidnapping is already maximum (10), but can consider:
  // - Family members increase emotional impact
  // - Business role (CEO) increases business disruption impact
  if (familyMembers.includes('children_school_age') || 
      familyMembers.includes('children_college')) {
    I = 10; // Already max, but reinforces
  }
  
  // === EXPOSURE FACTOR ===
  const E = calculateExposureFactor(responses);
  
  // Ensure scores stay in valid range
  T = Math.max(1, Math.min(10, T));
  V = Math.max(1, Math.min(10, V));
  I = Math.max(1, Math.min(10, I));
  
  const riskScore = T * V * I * E;
  const riskLevel = getRiskLevel(riskScore); // With E factor, max is 5000
  
  return {
    threat: T,
    vulnerability: V,
    impact: I,
    exposure: E,
    totalRisk: riskScore,
    riskLevel: riskLevel,
    confidenceLevel: calculateConfidenceLevel(interviewResponses, osintFindings, crimeData)
  };
}
```

### 4.4 Risk Level Thresholds (Adjusted for E Factor)

```typescript
function getRiskLevel(riskScore: number): string {
  // With Exposure factor, max score is 10×10×10×5 = 5000
  if (riskScore >= 2000) return 'CRITICAL';
  if (riskScore >= 1000) return 'HIGH';
  if (riskScore >= 400) return 'MEDIUM';
  if (riskScore >= 150) return 'LOW';
  return 'MINIMAL';
}
```

---

## 5. Control Selection & Recommendations

### 5.1 Gap-Based Control Recommendations

```typescript
function generateExecutiveProtectionRecommendations(
  interviewResponses: InterviewResponses,
  calculatedRisks: RiskScore[],
  osintFindings: OSINTFindings,
  crimeData: CrimeData
): ControlRecommendation[] {
  const recommendations: ControlRecommendation[] = [];
  
  // === CRITICAL: CURRENT SECURITY LEVEL ASSESSMENT ===
  const currentSecurity = responses.ep_current_security_level;
  const netWorth = responses.ep_net_worth_range;
  const publicProfile = responses.ep_public_profile_level;
  const knownThreats = responses.ep_known_threats;
  
  // High-net-worth with minimal security is critical gap
  if ((netWorth === 'over_100m' || netWorth === '50m_to_100m') &&
      (currentSecurity === 'none' || currentSecurity === 'minimal')) {
    recommendations.push({
      control: 'executive_protection_detail_24x7',
      priority: 'CRITICAL',
      category: 'Personal Protection',
      estimatedCost: '$500K-1.5M annually',
      riskReduction: 45,
      threatsAddressed: ['kidnapping_ransom', 'stalking_harassment', 'vehicular_ambush', 'home_invasion_targeted'],
      justification: 'Net worth and profile create significant kidnapping/extortion risk that requires professional protection detail'
    });
  }
  
  // Known threats require immediate protection
  if (knownThreats === 'yes_recent' && currentSecurity !== '24x7_detail') {
    recommendations.push({
      control: 'close_protection_officers',
      priority: 'CRITICAL',
      category: 'Personal Protection',
      estimatedCost: '$300K-800K annually',
      riskReduction: 40,
      threatsAddressed: ['stalking_harassment', 'assassination_threat', 'workplace_targeted_violence'],
      justification: 'Active threats require immediate professional protection'
    });
  }
  
  // === PATTERN PREDICTABILITY REMEDIATION ===
  if (responses.ep_daily_routine_predictability === 'highly_predictable' ||
      responses.ep_commute_pattern === 'same_route_same_time') {
    recommendations.push({
      control: 'route_randomization_protocol',
      priority: 'HIGH',
      category: 'Procedural',
      estimatedCost: '$0 (operational change)',
      riskReduction: 20,
      threatsAddressed: ['kidnapping_ransom', 'vehicular_ambush', 'stalking_harassment'],
      justification: 'Predictable patterns enable surveillance and planning for targeted attacks'
    });
  }
  
  // === TRANSPORTATION SECURITY ===
  if ((netWorth === 'over_100m' || netWorth === '50m_to_100m' || netWorth === '10m_to_50m') &&
      responses.ep_vehicle_type !== 'driver_service_armored') {
    
    // Recommend armored vehicle for high net worth
    if (netWorth === 'over_100m' || netWorth === '50m_to_100m') {
      recommendations.push({
        control: 'armored_vehicle_b6_rated',
        priority: 'HIGH',
        category: 'Transportation',
        estimatedCost: '$150K-500K (vehicle cost)',
        riskReduction: 35,
        threatsAddressed: ['vehicular_ambush', 'kidnapping_ransom', 'assassination_threat'],
        justification: 'Net worth justifies armored vehicle protection during transit'
      });
    }
    
    // Professional driver service minimum
    if (responses.ep_vehicle_type === 'personal_standard' || 
        responses.ep_vehicle_type === 'personal_luxury_conspicuous') {
      recommendations.push({
        control: 'secure_driver_service',
        priority: 'HIGH',
        category: 'Transportation',
        estimatedCost: '$75K-150K annually',
        riskReduction: 25,
        threatsAddressed: ['vehicular_ambush', 'kidnapping_ransom', 'robbery_opportunistic'],
        justification: 'Professional driver enables counter-surveillance detection and evasive driving'
      });
    }
  }
  
  // === RESIDENCE SECURITY ===
  const residenceSecurity = responses.ep_residence_perimeter_security || [];
  
  if (residenceSecurity.includes('none') || residenceSecurity.includes('fence_basic')) {
    recommendations.push({
      control: 'perimeter_intrusion_detection_residential',
      priority: 'HIGH',
      category: 'Residential Security',
      estimatedCost: '$30K-80K',
      riskReduction: 20,
      threatsAddressed: ['home_invasion_targeted', 'stalking_harassment', 'family_member_targeting'],
      justification: 'Perimeter detection provides early warning of threats approaching residence'
    });
  }
  
  if (!residenceSecurity.includes('cctv_perimeter')) {
    recommendations.push({
      control: 'residential_cctv_comprehensive',
      priority: 'HIGH',
      category: 'Surveillance',
      estimatedCost: '$15K-40K',
      riskReduction: 15,
      threatsAddressed: ['home_invasion_targeted', 'stalking_harassment'],
      justification: 'CCTV provides evidence and deterrent effect for residential threats'
    });
  }
  
  if (responses.ep_safe_room === 'no' || responses.ep_safe_room === 'designated_room') {
    const hasFamilyRisk = (responses.ep_family_members || []).length > 0;
    recommendations.push({
      control: 'panic_room_with_comms',
      priority: hasFamilyRisk ? 'HIGH' : 'MEDIUM',
      category: 'Residential Security',
      estimatedCost: '$50K-200K',
      riskReduction: 25,
      threatsAddressed: ['home_invasion_targeted', 'family_member_targeting'],
      justification: 'Safe room provides last-resort protection during home invasion'
    });
  }
  
  if (responses.ep_residence_alarm_system === 'none' || 
      responses.ep_residence_alarm_system === 'basic_unmonitored') {
    recommendations.push({
      control: 'residential_monitoring_24x7',
      priority: 'HIGH',
      category: 'Surveillance',
      estimatedCost: '$5K-15K annually',
      riskReduction: 18,
      threatsAddressed: ['home_invasion_targeted', 'family_member_targeting'],
      justification: '24/7 professional monitoring ensures rapid response to residential incidents'
    });
  }
  
  // === DIGITAL FOOTPRINT & PRIVACY ===
  if (responses.ep_social_media_usage === 'very_active_public' ||
      responses.ep_social_media_usage === 'active_public') {
    recommendations.push({
      control: 'digital_privacy_services',
      priority: 'MEDIUM',
      category: 'Digital Privacy',
      estimatedCost: '$5K-20K annually',
      riskReduction: 15,
      threatsAddressed: ['doxxing_privacy_violation', 'stalking_harassment', 'social_engineering'],
      justification: 'Digital privacy services remove personal information from public databases'
    });
    
    recommendations.push({
      control: 'social_media_privacy_lockdown',
      priority: 'HIGH',
      category: 'Digital Privacy',
      estimatedCost: '$0 (immediate action)',
      riskReduction: 12,
      threatsAddressed: ['doxxing_privacy_violation', 'stalking_harassment'],
      justification: 'Public social media provides surveillance opportunities for threat actors'
    });
  }
  
  if (responses.ep_online_presence_management === 'no_management' ||
      responses.ep_google_alerts === 'no_monitoring') {
    recommendations.push({
      control: 'osint_monitoring_continuous',
      priority: 'MEDIUM',
      category: 'Intelligence',
      estimatedCost: '$10K-30K annually',
      riskReduction: 10,
      threatsAddressed: ['doxxing_privacy_violation', 'reputation_damage', 'early_threat_detection'],
      justification: 'OSINT monitoring provides early warning of emerging threats and privacy violations'
    });
  }
  
  // === FAMILY PROTECTION ===
  const familyMembers = responses.ep_family_members || [];
  
  if (familyMembers.includes('children_school_age')) {
    if (responses.ep_children_schedule === 'highly_predictable' &&
        !responses.ep_current_security_level.includes('detail')) {
      recommendations.push({
        control: 'family_member_protection_detail',
        priority: 'HIGH',
        category: 'Family Protection',
        estimatedCost: '$200K-400K annually',
        riskReduction: 30,
        threatsAddressed: ['family_member_targeting', 'kidnapping_ransom'],
        justification: 'Children with predictable schedules are vulnerable to targeting'
      });
    }
    
    if (responses.ep_family_emergency_training === 'no_training') {
      recommendations.push({
        control: 'family_security_training',
        priority: 'HIGH',
        category: 'Training',
        estimatedCost: '$5K-15K (one-time)',
        riskReduction: 15,
        threatsAddressed: ['family_member_targeting', 'kidnapping_ransom', 'social_engineering'],
        justification: 'Family security training reduces vulnerability through awareness'
      });
    }
  }
  
  if (responses.ep_family_digital_exposure === 'high_exposure') {
    recommendations.push({
      control: 'family_digital_privacy_program',
      priority: 'MEDIUM',
      category: 'Digital Privacy',
      estimatedCost: '$3K-10K annually',
      riskReduction: 12,
      threatsAddressed: ['family_member_targeting', 'doxxing_privacy_violation', 'stalking_harassment'],
      justification: 'Family digital exposure enables threat actors to identify vulnerabilities'
    });
  }
  
  // === WORKPLACE SECURITY ===
  if (responses.ep_workplace_access_control === 'open_public' ||
      responses.ep_workplace_access_control === 'receptionist_only') {
    recommendations.push({
      control: 'workplace_executive_access_enhancements',
      priority: 'MEDIUM',
      category: 'Workplace',
      estimatedCost: '$20K-60K',
      riskReduction: 15,
      threatsAddressed: ['workplace_targeted_violence', 'stalking_harassment'],
      justification: 'Enhanced workplace access control prevents unauthorized approach'
    });
  }
  
  // === TRAVEL SECURITY ===
  if (responses.ep_international_travel === 'yes_frequently' ||
      responses.ep_international_travel === 'yes_occasionally') {
    recommendations.push({
      control: 'travel_security_advance_team',
      priority: 'MEDIUM',
      category: 'Travel',
      estimatedCost: '$10K-40K per trip',
      riskReduction: 20,
      threatsAddressed: ['kidnapping_ransom', 'robbery_opportunistic', 'foreign_intelligence_targeting'],
      justification: 'High-risk international travel requires advance security coordination'
    });
    
    recommendations.push({
      control: 'medical_evacuation_insurance',
      priority: 'MEDIUM',
      category: 'Travel',
      estimatedCost: '$5K-15K annually',
      riskReduction: 5, // Doesn't prevent but mitigates impact
      threatsAddressed: ['medical_emergency_abroad', 'kidnapping_ransom'],
      justification: 'Medical evacuation capability critical for international travel'
    });
  }
  
  if (responses.ep_travel_arrangements_publicity === 'public_calendar' ||
      responses.ep_travel_arrangements_publicity === 'widely_shared') {
    recommendations.push({
      control: 'travel_information_security_protocol',
      priority: 'HIGH',
      category: 'Procedural',
      estimatedCost: '$0 (operational change)',
      riskReduction: 18,
      threatsAddressed: ['kidnapping_ransom', 'vehicular_ambush', 'public_event_attack'],
      justification: 'Public travel information enables threat actors to plan attacks'
    });
  }
  
  // === EMERGENCY PREPAREDNESS ===
  if (responses.ep_emergency_contacts === 'no_protocols' ||
      responses.ep_emergency_contacts === 'basic_contacts') {
    recommendations.push({
      control: 'emergency_response_plan_executive',
      priority: 'HIGH',
      category: 'Emergency Response',
      estimatedCost: '$10K-30K (development + training)',
      riskReduction: 15,
      threatsAddressed: 'ALL_THREATS',
      justification: 'Comprehensive emergency plan critical for coordinated response to incidents'
    });
  }
  
  if (responses.ep_duress_code === 'no_duress_codes') {
    recommendations.push({
      control: 'duress_code_system',
      priority: 'MEDIUM',
      category: 'Emergency Response',
      estimatedCost: '$0 (operational implementation)',
      riskReduction: 10,
      threatsAddressed: ['kidnapping_ransom', 'home_invasion_targeted', 'extortion_threat'],
      justification: 'Duress codes enable covert distress communication'
    });
  }
  
  // === INTELLIGENCE & MONITORING ===
  if (!responses.ep_current_security_level.includes('comprehensive') &&
      !responses.ep_current_security_level.includes('24x7')) {
    recommendations.push({
      control: 'threat_intelligence_monitoring',
      priority: 'MEDIUM',
      category: 'Intelligence',
      estimatedCost: '$15K-50K annually',
      riskReduction: 12,
      threatsAddressed: 'ALL_THREATS',
      justification: 'Proactive threat intelligence enables early warning and prevention'
    });
  }
  
  // === HOUSEHOLD STAFF VETTING ===
  if (responses.ep_household_staff !== 'no' && 
      !responses.followUpResponses?.ep_staff_background_checks) {
    recommendations.push({
      control: 'background_checks_household_staff',
      priority: 'HIGH',
      category: 'Personnel Security',
      estimatedCost: '$500-1K per employee',
      riskReduction: 15,
      threatsAddressed: ['insider_threat_staff', 'home_invasion_targeted', 'privacy_violation'],
      justification: 'Household staff have intimate access to family life and security vulnerabilities'
    });
  }
  
  // === TECHNOLOGY SOLUTIONS ===
  if (!responses.ep_email_phone_security?.includes('secure_phone_service')) {
    recommendations.push({
      control: 'secure_communications_encrypted',
      priority: 'MEDIUM',
      category: 'Technology',
      estimatedCost: '$2K-5K annually',
      riskReduction: 8,
      threatsAddressed: ['social_engineering', 'eavesdropping', 'communications_intercept'],
      justification: 'Encrypted communications prevent interception of sensitive information'
    });
  }
  
  recommendations.push({
    control: 'executive_security_app',
    priority: 'MEDIUM',
    category: 'Technology',
    estimatedCost: '$1K-3K annually',
    riskReduction: 10,
    threatsAddressed: ['kidnapping_ransom', 'medical_emergency', 'stalking_harassment'],
    justification: 'Security app provides panic button and real-time location sharing with security team'
  });
  
  // Sort by priority and risk reduction
  return recommendations.sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.riskReduction - a.riskReduction;
  });
}
```

### 5.2 Phased Implementation Roadmap

```typescript
function generateImplementationRoadmap(
  recommendations: ControlRecommendation[]
): PhaseRoadmap[] {
  const phases = [];
  
  // Phase 1: Immediate Actions (0-30 days) - Critical priority
  const phase1 = recommendations.filter(r => r.priority === 'CRITICAL');
  phases.push({
    name: 'Phase 1: Immediate Actions (0-30 days)',
    controls: phase1,
    totalCost: calculateTotalCost(phase1),
    totalRiskReduction: calculateTotalRiskReduction(phase1),
    description: 'Address critical vulnerabilities and known threats'
  });
  
  // Phase 2: Short-Term (30-90 days) - High priority
  const phase2 = recommendations.filter(r => r.priority === 'HIGH');
  phases.push({
    name: 'Phase 2: Short-Term (30-90 days)',
    controls: phase2,
    totalCost: calculateTotalCost(phase2),
    totalRiskReduction: calculateTotalRiskReduction(phase2),
    description: 'Implement core protective measures and establish protocols'
  });
  
  // Phase 3: Medium-Term (90-180 days) - Medium priority
  const phase3 = recommendations.filter(r => r.priority === 'MEDIUM');
  phases.push({
    name: 'Phase 3: Medium-Term (90-180 days)',
    controls: phase3,
    totalCost: calculateTotalCost(phase3),
    totalRiskReduction: calculateTotalRiskReduction(phase3),
    description: 'Enhance security posture and implement monitoring systems'
  });
  
  // Phase 4: Long-Term (180-365 days) - Low priority + ongoing
  const phase4 = recommendations.filter(r => r.priority === 'LOW');
  phases.push({
    name: 'Phase 4: Long-Term (6-12 months)',
    controls: phase4,
    totalCost: calculateTotalCost(phase4),
    totalRiskReduction: calculateTotalRiskReduction(phase4),
    description: 'Continuous improvement and advanced security measures'
  });
  
  return phases;
}
```

---

## 6. Geographic Intelligence Integration

### 6.1 Location Data Collection

```typescript
interface ExecutiveLocation {
  id: number;
  executiveProfileId: number;
  locationType: 'primary_residence' | 'secondary_residence' | 'office' | 
                'gym' | 'restaurant' | 'club' | 'school' | 'frequent_destination';
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  
  // Visit frequency
  visitFrequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  typicalVisitTimes: string; // JSON: ["morning", "evening"]
  durationTypical: number; // minutes
  
  // Security assessment
  securityRating: number; // 1-10
  notes: string;
  
  // Automatic data from APIs
  nearestPoliceStation: string;
  policeDistance: number; // meters
  estimatedPoliceResponseTime: number; // minutes
  
  nearestHospital: string;
  hospitalDistance: number; // meters
  
  crimeScore: number; // From CAP Index
  crimeData: object; // JSON crime statistics
}
```

### 6.2 Google Maps Integration

```typescript
// Geocode addresses
async function geocodeAddress(address: string): Promise<{lat: number, lng: number}> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();
  if (data.results[0]) {
    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng
    };
  }
  throw new Error('Geocoding failed');
}

// Auto-discover nearby emergency services
async function discoverEmergencyServices(
  lat: number,
  lng: number
): Promise<EmergencyServices> {
  // Find nearest police station
  const policeResponse = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=police&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  const policeData = await policeResponse.json();
  
  // Find nearest hospital
  const hospitalResponse = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=hospital&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  const hospitalData = await hospitalResponse.json();
  
  return {
    nearestPolice: policeData.results[0],
    nearestHospital: hospitalData.results[0],
    // Calculate distances and response times
  };
}

// Analyze travel route vulnerability
async function analyzeRoute(
  origin: {lat: number, lng: number},
  destination: {lat: number, lng: number}
): Promise<RouteAnalysis> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&alternatives=true&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();
  
  // Analyze each route alternative
  const routes = data.routes.map(route => ({
    summary: route.summary,
    distance: route.legs[0].distance.value,
    duration: route.legs[0].duration.value,
    steps: route.legs[0].steps,
    // Identify vulnerable points (isolated areas, traffic choke points)
    vulnerablePoints: identifyVulnerablePoints(route),
    securityRating: calculateRouteSecurityRating(route)
  }));
  
  return { routes };
}
```

### 6.3 Crime Data Integration (CAP Index)

```typescript
// Import CAP Index crime data from PDF
async function parseCAPIndexPDF(pdfBuffer: Buffer): Promise<CrimeData> {
  // Use GPT-4V to extract crime statistics from uploaded PDF
  const extractedData = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all crime statistics from this CAP Index report. Return JSON with: {zipCode, totalCrimeIndex, violentCrimeRate, propertyCrimeRate, homicideRate, robberyRate, assaultRate, burglaryRate, theftRate, autoTheftRate, comparisonToNational}"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`
            }
          }
        ]
      }
    ]
  });
  
  return JSON.parse(extractedData.choices[0].message.content);
}

// Calculate crime environment risk score
function calculateCrimeEnvironmentScore(crimeData: CrimeData): number {
  let score = 0;
  
  // Violent crime is most relevant for executive protection
  if (crimeData.violentCrimeRate > nationalAverage * 2) score += 3;
  else if (crimeData.violentCrimeRate > nationalAverage * 1.5) score += 2;
  else if (crimeData.violentCrimeRate > nationalAverage) score += 1;
  
  // Robbery and assault are direct threats
  if (crimeData.robberyRate > nationalAverage * 1.5) score += 2;
  if (crimeData.assaultRate > nationalAverage * 1.5) score += 2;
  
  // Property crime indicates general area security
  if (crimeData.propertyCrimeRate > nationalAverage * 2) score += 1;
  
  return Math.min(10, score); // Cap at 10
}
```

---

## 7. OSINT & Threat Intelligence

### 7.1 OSINT Findings Management

```typescript
interface OSINTFinding {
  id: number;
  executiveProfileId: number;
  findingDate: Date;
  analystUserId: number;
  
  sourceType: 'social_media' | 'news_article' | 'public_record' | 
               'court_filing' | 'business_registry' | 'property_record' | 
               'dark_web' | 'other';
  sourceUrl: string;
  sourceName: string;
  
  findingCategory: 'address_exposure' | 'family_information' | 'financial_information' |
                   'travel_plans' | 'routine_patterns' | 'security_gaps' | 
                   'threat_indication' | 'reputation_risk';
  
  exposureLevel: 'critical' | 'high' | 'medium' | 'low';
  
  summary: string;
  details: text;
  
  screenshotUrl: string; // Uploaded screenshot
  
  actionTaken: string;
  status: 'active' | 'mitigated' | 'monitoring';
  
  createdAt: timestamp;
}

// OSINT analysis workflow
async function conductOSINTAnalysis(
  executiveProfile: ExecutiveProfile
): Promise<OSINTFindings[]> {
  const findings: OSINTFindings[] = [];
  
  // Manual analysis by security consultant
  // Document findings in system
  
  // Automated monitoring can be added via:
  // - Google Alerts
  // - Social media monitoring tools
  // - Public records monitoring
  // - Dark web monitoring services
  
  return findings;
}
```

### 7.2 Threat Actor Tracking

```typescript
interface ThreatActor {
  id: number;
  executiveProfileId: number;
  
  actorType: 'individual' | 'organization' | 'unknown';
  name: string; // May be pseudonym
  knownAliases: string[];
  
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  threatType: 'stalker' | 'disgruntled_employee' | 'competitor' | 
              'activist' | 'criminal' | 'unknown';
  
  description: text;
  capabilities: text;
  motivations: text;
  
  firstIdentified: date;
  lastActivity: date;
  
  incidentHistory: text; // JSON array of incidents
  
  lawEnforcementNotified: boolean;
  restrainingOrder: boolean;
  restrainingOrderDetails: text;
  
  status: 'active' | 'monitored' | 'inactive' | 'incarcerated';
  
  notes: text;
}
```

---

## 8. API Integration Specifications

### 8.1 API Routes

```typescript
// POST /api/executive-protection/create-profile
export async function createExecutiveProfile(assessmentId: number, profileData: ExecutiveProfileData) {
  // Create executive profile
  // Initialize interview
  // Set up location tracking
}

// POST /api/executive-protection/interview/submit
export async function submitExecutiveInterview(profileId: number, responses: InterviewResponses) {
  // Save interview responses
  // Trigger risk calculations
  // Initiate OSINT tasking
}

// POST /api/executive-protection/locations/add
export async function addExecutiveLocation(profileId: number, locationData: LocationData) {
  // Geocode address
  // Auto-discover emergency services
  // Fetch crime data for area
  // Calculate security rating
}

// POST /api/executive-protection/routes/analyze
export async function analyzeExecutiveRoute(origin: Location, destination: Location) {
  // Get route alternatives
  // Identify vulnerable points
  // Calculate security ratings
  // Recommend optimal route
}

// POST /api/executive-protection/osint/add-finding
export async function addOSINTFinding(profileId: number, finding: OSINTFindingData) {
  // Save OSINT finding
  // Update exposure factor
  // Trigger risk recalculation
  // Generate alert if critical
}

// POST /api/executive-protection/calculate-risks
export async function calculateExecutiveRisks(profileId: number) {
  const profile = await getExecutiveProfile(profileId);
  const interview = await getInterviewResponses(profileId);
  const locations = await getExecutiveLocations(profileId);
  const osint = await getOSINTFindings(profileId);
  const crimeData = await getCrimeDataForLocations(locations);
  
  const risks = [];
  for (const threat of executiveProtectionThreats) {
    const riskScore = calculateExecutiveProtectionRisk(
      interview,
      threat.id,
      osint,
      crimeData
    );
    risks.push({
      threatId: threat.id,
      ...riskScore,
      scenario: generateRiskScenario(threat, interview, riskScore)
    });
  }
  
  return risks;
}

// GET /api/executive-protection/recommendations
export async function getExecutiveRecommendations(profileId: number) {
  const interview = await getInterviewResponses(profileId);
  const risks = await getRiskScenarios(profileId);
  const osint = await getOSINTFindings(profileId);
  const crimeData = await getCrimeData(profileId);
  
  return generateExecutiveProtectionRecommendations(interview, risks, osint, crimeData);
}
```

---

## 9. UI Components

### 9.1 Executive Security Map

**Interactive map showing:**
- Executive locations with security ratings
- Crime heat map overlay
- Emergency services (police, hospitals)
- Travel routes with vulnerability analysis
- OSINT exposure points

```tsx
<ExecutiveSecurityMap
  locations={executiveLocations}
  crimeData={crimeIncidents}
  emergencyServices={emergencyPOIs}
  routes={analyzedRoutes}
  osintFindings={osintLocations}
/>
```

### 9.2 Risk Dashboard

**Visual dashboard showing:**
- Overall risk score with T×V×I×E breakdown
- Risk by threat category
- Exposure factor visualization
- Trend analysis over time
- Critical findings requiring attention

### 9.3 Recommendation Matrix

**Prioritized recommendations:**
- Phased implementation roadmap
- Cost-benefit analysis
- Risk reduction calculations
- Resource requirements
- Timeline visualization

---

## 10. PDF Report Template

### 10.1 Executive Protection Report Structure

```
=====================================
EXECUTIVE PROTECTION SECURITY ASSESSMENT
[Executive Name] - CONFIDENTIAL
=====================================

Assessment ID: [NUMBER]
Assessment Date: [DATE]
Consultant: [NAME]

TABLE OF CONTENTS
1. Executive Summary
2. Methodology & Scope
3. Executive Profile
4. Threat Assessment
5. Vulnerability Analysis
6. Geographic Threat Environment
7. Digital Footprint & OSINT Findings
8. Risk Scenarios & Ratings
9. Current Security Posture
10. Recommendations & Implementation Roadmap
11. Appendices

---

1. EXECUTIVE SUMMARY

Executive: [Full Name]
Public Profile: [Level]
Net Worth Range: [Range]
Primary Residence: [City, State]
Family Members: [Count]

Overall Risk Rating: [HIGH/MEDIUM/LOW]

Key Findings:
• [Critical Finding 1]
• [Critical Finding 2]
• [Critical Finding 3]

Critical Recommendations:
1. [Recommendation 1] - Priority: CRITICAL
2. [Recommendation 2] - Priority: CRITICAL
3. [Recommendation 3] - Priority: HIGH

---

2. METHODOLOGY & SCOPE

This assessment utilized a comprehensive T×V×I×E risk methodology:
- Threat (T): Likelihood based on profile, intelligence, and environment
- Vulnerability (V): Security gaps and pattern predictability
- Impact (I): Severity of consequences
- Exposure (E): Public profile and routine predictability multiplier

Data Sources:
✓ Executive interview (48-question protocol)
✓ Residential security assessment
✓ Geographic intelligence (Google Maps)
✓ Crime data analysis (CAP Index)
✓ Open-source intelligence (OSINT)
✓ Workplace security evaluation
✓ Travel pattern analysis

---

3. EXECUTIVE PROFILE

[Map showing primary residence, office, and frequent locations]

Public Profile: [Very High/High/Medium/Low/Private]
Media Exposure: [Extensive/Frequent/Occasional/Minimal/None]
Industry: [Sector]
Net Worth Range: [Range]

Pattern Predictability Analysis:
- Daily Routine: [Highly Predictable / Variable / Randomized]
- Commute: [Same route daily / Varied / Driver service]
- Social Media: [Very Active Public / Private]

Family Considerations:
- [Family member details relevant to security]
- [Children's school information if applicable]
- [Security training status]

Known Threats:
- [Any specific threats or incidents]
- [Restraining orders]
- [Previous incidents]

---

4. THREAT ASSESSMENT

[Table of identified threats with T×V×I×E scores]

| Threat | Threat (T) | Vulnerability (V) | Impact (I) | Exposure (E) | Total Risk | Level |
|--------|------------|-------------------|------------|--------------|------------|-------|
| Kidnapping for Ransom | 8 | 7 | 10 | 4.2 | 2,352 | CRITICAL |
| Stalking/Harassment | 7 | 6 | 6 | 4.2 | 1,058 | HIGH |
| [...]  | [...] | [...] | [...] | [...] | [...] | [...] |

Exposure Factor Breakdown:
- Public Profile Component: +2.0
- Pattern Predictability: +1.5
- Social Media: +0.7
- Media Coverage: +0.0
**Total Exposure Factor: 4.2**

---

5. VULNERABILITY ANALYSIS

Critical Vulnerabilities Identified:
1. [Vulnerability 1] - Risk Impact: [HIGH/MEDIUM/LOW]
2. [Vulnerability 2] - Risk Impact: [HIGH/MEDIUM/LOW]
3. [Vulnerability 3] - Risk Impact: [HIGH/MEDIUM/LOW]

Pattern Analysis:
- Commute route: [Analysis of predictability and vulnerable points]
- Frequent locations: [Analysis of patterns]
- Travel habits: [Analysis of exposure]

Current Security Posture:
Level: [None / Minimal / Moderate / Comprehensive / 24/7 Detail]

Gaps Identified:
- [Gap 1 and associated risks]
- [Gap 2 and associated risks]
- [Gap 3 and associated risks]

---

6. GEOGRAPHIC THREAT ENVIRONMENT

[Interactive map with crime heat overlay]

Primary Residence Analysis:
Address: [Address withheld for security]
Crime Environment Score: [X/10]

Crime Statistics (CAP Index):
- Total Crime Index: [X] (National Average: 100)
- Violent Crime Rate: [X per 1,000] ([X%] above/below national average)
- Property Crime Rate: [X per 1,000]
- Notable: [Specific relevant statistics]

Emergency Response Capabilities:
- Nearest Police Station: [Name] - [X miles] - Est. Response: [X minutes]
- Nearest Hospital: [Name] - [X miles] - [Level I/II/III Trauma Center]
- Private Security Response: [Available / Not Available]

Workplace Security:
Location: [City]
Crime Environment Score: [X/10]
Security Level: [Assessment]

Travel Route Vulnerability:
[Map showing primary commute route with vulnerability points marked]
- Vulnerable Point 1: [Description]
- Vulnerable Point 2: [Description]
Alternative Route Recommendation: [Yes/No]

---

7. DIGITAL FOOTPRINT & OSINT FINDINGS

Public Exposure Analysis:

Information Available Online:
☑ Home address (property records)
☑ Phone numbers
☑ Business affiliations
☑ Net worth estimates
☐ Family member information
☑ Vehicle information

Social Media Exposure:
Platform: [Platform name]
Profile Type: Public / Private
Exposure Level: [Critical / High / Medium / Low]
Findings: [Summary of concerning posts]

OSINT Findings:
[Table of OSINT findings]

| Date | Source | Category | Exposure Level | Status |
|------|--------|----------|----------------|--------|
| [Date] | [Source] | [Category] | [Level] | [Status] |
| [Date] | [Source] | [Category] | [Level] | [Status] |

Recommendations:
- [Digital privacy action 1]
- [Digital privacy action 2]

---

8. RISK SCENARIOS & RATINGS

CRITICAL RISK: Kidnapping for Ransom
Risk Score: 2,352 (T:8 × V:7 × I:10 × E:4.2)

Scenario:
[Detailed scenario description based on interview data, patterns, and threat intelligence]

Current State:
[Analysis of current vulnerabilities enabling this threat]

Likelihood Assessment:
[Why this threat is rated at current level]

Impact Analysis:
- Personal: [Life-threatening situation]
- Family: [Severe trauma and ongoing fear]
- Financial: [Potential ransom demands in $X-Y range]
- Business: [Operational disruption]
- Reputation: [Media attention and publicity]

---

9. CURRENT SECURITY POSTURE

Residential Security:
- Perimeter: [Assessment]
- Access Control: [Assessment]
- Surveillance: [Assessment]
- Monitoring: [Assessment]
- Safe Room: [Yes/No]
Rating: [X/10]

Transportation Security:
- Vehicle Type: [Description]
- Security Features: [List]
- Driver: [Professional / Personal]
Rating: [X/10]

Personal Protection:
- Current Level: [None / Minimal / 24/7]
- Training: [Status]
Rating: [X/10]

Digital Security:
- Social Media: [Status]
- Privacy Services: [Yes/No]
- Monitoring: [Yes/No]
Rating: [X/10]

---

10. RECOMMENDATIONS & IMPLEMENTATION ROADMAP

PHASE 1: IMMEDIATE ACTIONS (0-30 days)
Priority: CRITICAL

1. Executive Protection Detail - 24/7
   Category: Personal Protection
   Cost: $500K-1.5M annually
   Risk Reduction: 45%
   Threats Addressed: Kidnapping, Stalking, Ambush, Home Invasion
   Justification: [Specific reasoning based on assessment]

2. Route Randomization Protocol
   Category: Procedural
   Cost: $0 (operational change)
   Risk Reduction: 20%
   Threats Addressed: Kidnapping, Ambush, Stalking
   Justification: [Specific reasoning]

[Continue for all Critical recommendations]

Phase 1 Total Investment: $[X]
Phase 1 Risk Reduction: [X%]

---

PHASE 2: SHORT-TERM (30-90 days)
Priority: HIGH

[Similar format for High priority recommendations]

Phase 2 Total Investment: $[X]
Phase 2 Risk Reduction: [X%]

---

PHASE 3: MEDIUM-TERM (90-180 days)
Priority: MEDIUM

[Medium priority recommendations]

---

PHASE 4: LONG-TERM (6-12 months)
Priority: ONGOING

[Long-term and ongoing measures]

---

TOTAL PROGRAM COST: $[X] (Year 1)
TOTAL RISK REDUCTION: [X%]

---

11. APPENDICES

A. Interview Transcript
B. Maps & Geographic Analysis
   - Residence security map
   - Commute route analysis
   - Crime heat maps
C. Crime Data Details (CAP Index Reports)
D. OSINT Source Documents
E. Threat Actor Profiles (if applicable)
F. Control Catalog
G. Emergency Contact Protocol
H. Travel Security Brief Template

---

CONFIDENTIAL - FOR AUTHORIZED PERSONNEL ONLY
```

---

## 11. Implementation Roadmap

### 11.1 14-Day Executive Protection Sprint

#### **Days 1-2: Database & Core Setup**
- Extend database schema (8 new tables)
- Add executive protection template configuration
- Seed threats and controls
- Set up interview data structures

#### **Days 3-4: Interview System**
- Build 48-question interview interface
- Implement section-by-section progression
- Add follow-up question logic
- Save/resume functionality

#### **Days 5-6: Risk Calculation Engine**
- Implement T×V×I×E calculation
- Build exposure factor calculator
- Add threat/vulnerability/impact modifiers
- Test risk scoring accuracy

#### **Days 7-8: Geographic Intelligence**
- Integrate Google Maps API
- Build location management
- Auto-discover emergency services
- Route analysis functionality

#### **Days 9-10: OSINT & Crime Data**
- Build OSINT findings management
- CAP Index PDF import (GPT-4V)
- Crime data visualization
- Heat map overlay

#### **Days 11-12: Control Recommendations**
- Implement gap-based recommendation engine
- Build phased roadmap generator
- ROI calculations
- Priority matrix

#### **Days 13-14: PDF Report & Testing**
- Executive protection report template
- Map integration in PDFs
- End-to-end testing
- Bug fixes and polish

---

## Conclusion

This Executive Protection Security Assessment Framework provides:

1. **Comprehensive 48-Question Interview** - Covers profile, residence, patterns, workplace, travel, digital, and emergency preparedness
2. **T×V×I×E Risk Formula** - Unique exposure factor accounts for public profile and predictability
3. **Geographic Intelligence** - Crime data, emergency services, route analysis
4. **OSINT Integration** - Digital footprint assessment and threat intelligence
5. **Sophisticated Recommendations** - Gap-based, phased, ROI-justified
6. **Professional Deliverables** - Detailed PDF reports with maps and intelligence analysis

The framework recognizes that executive protection is fundamentally different from facility security:
- **Person-centric** rather than location-centric
- **Dynamic threat environment** requiring intelligence-driven approach
- **Lifestyle patterns** as vulnerability factors
- **Multi-location analysis** across residences, offices, and frequent destinations
- **Family considerations** as force multipliers for impact
- **Digital exposure** as a critical attack surface

This assessment methodology transforms executive protection from reactive bodyguard services to proactive, intelligence-driven risk management.

---

**END OF EXECUTIVE PROTECTION FRAMEWORK DOCUMENT**
