# RiskFixer: Executive Protection Assessment Integration
## Comprehensive Specification for High-Net-Worth Individual Security

**Version:** 1.0  
**Integration Target:** RiskFixer Master Framework v2.0  
**Focus:** Executive/VIP/HNW Protection Assessments  
**Last Updated:** November 19, 2025

---

## Table of Contents

1. [Executive Protection Assessment Overview](#1-executive-protection-assessment-overview)
2. [Enhanced Database Schema Additions](#2-enhanced-database-schema-additions)
3. [Executive Interview Protocol System](#3-executive-interview-protocol-system)
4. [Geographic Intelligence & Mapping Integration](#4-geographic-intelligence--mapping-integration)
5. [CAP Index & Crime Data Integration](#5-cap-index--crime-data-integration)
6. [External Threat Assessment Methodology](#6-external-threat-assessment-methodology)
7. [Executive Protection-Specific Risk Engine](#7-executive-protection-specific-risk-engine)
8. [API Routes & Endpoints](#8-api-routes--endpoints)
9. [UI/UX Components](#9-uiux-components)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Executive Protection Assessment Overview

### 1.1 What Makes Executive Protection Different

**Standard Physical Security Assessment:**
- Focuses on facilities and assets
- Static threat environment
- Control-based risk reduction
- Facility-centric perspective

**Executive Protection Assessment:**
- Focuses on **individuals** and their patterns
- **Dynamic threat environment** (travel, public exposure, family)
- Intelligence-driven risk management
- **Holistic lifestyle security** perspective

### 1.2 Assessment Components

```
Executive Protection Assessment = 
  ┌─────────────────────────────────────────────────────────┐
  │ 1. EXECUTIVE INTERVIEW                                  │
  │    - Personal threat perceptions                        │
  │    - Daily routines & patterns                          │
  │    - Travel frequency & destinations                    │
  │    - Family security concerns                           │
  │    - Public profile & media exposure                    │
  └─────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────┐
  │ 2. EXTERNAL OBJECTIVE THREAT ASSESSMENT                 │
  │    - Public information research (OSINT)                │
  │    - Social media exposure analysis                     │
  │    - Geographic crime data (CAP Index)                  │
  │    - Proximity analysis (PD, hospitals, threats)        │
  │    - Industry/sector-specific threats                   │
  └─────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────┐
  │ 3. RESIDENTIAL SECURITY ASSESSMENT                      │
  │    - Physical security of primary residence             │
  │    - Neighborhood threat environment                    │
  │    - Response time analysis (PD, medical)               │
  │    - Escape routes & safe rooms                         │
  └─────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────┐
  │ 4. WORKPLACE SECURITY ASSESSMENT                        │
  │    - Office/workplace physical security                 │
  │    - Travel routes (home ↔ work)                        │
  │    - Parking security                                   │
  │    - Visitor management                                 │
  └─────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────┐
  │ 5. LIFESTYLE & PATTERN ANALYSIS                         │
  │    - Regular locations (gym, restaurants, etc.)         │
  │    - Predictable routines                               │
  │    - Family members & schools                           │
  │    - High-profile events & appearances                  │
  └─────────────────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────────────────┐
  │ 6. DIGITAL FOOTPRINT & OSINT ANALYSIS                   │
  │    - Social media exposure                              │
  │    - Public records (property, business)                │
  │    - News mentions & media coverage                     │
  │    - Threat actor research                              │
  └─────────────────────────────────────────────────────────┘
```

### 1.3 Key Differences from Standard Assessment

| Aspect | Standard Assessment | Executive Protection |
|--------|---------------------|---------------------|
| **Primary Focus** | Facility perimeter, access control | Individual protection, lifestyle patterns |
| **Threat Source** | Opportunistic criminals | Targeted threats, stalkers, kidnappers |
| **Geographic Scope** | Single facility | Multiple locations + travel routes |
| **Data Sources** | Physical inspection | OSINT, crime stats, public records |
| **Control Strategy** | Static defenses | Dynamic security posture |
| **Stakeholders** | Facility manager, security director | Executive, family, executive assistant |

---

## 2. Enhanced Database Schema Additions

### 2.1 New Tables for Executive Protection

**Add to `server/db/schema.ts`:**

```typescript
// ===================================================================
// EXECUTIVE PROFILES
// ===================================================================

export const executiveProfiles = pgTable('executive_profiles', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Personal Information (Encrypted/Sensitive)
  fullName: varchar('full_name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }),
  companyRole: varchar('company_role', { length: 255 }),
  
  // Contact Information
  primaryPhone: varchar('primary_phone', { length: 20 }),
  secondaryPhone: varchar('secondary_phone', { length: 20 }),
  emergencyContact: varchar('emergency_contact', { length: 255 }),
  emergencyPhone: varchar('emergency_phone', { length: 20 }),
  
  // Public Profile
  publicProfile: varchar('public_profile', { length: 50 }).notNull(),
  // Values: very_high, high, medium, low, private
  netWorthRange: varchar('net_worth_range', { length: 50 }),
  // Values: <1M, 1-10M, 10-50M, 50-100M, 100M+
  industryCategory: varchar('industry_category', { length: 100 }),
  mediaExposure: varchar('media_exposure', { length: 50 }),
  // Values: frequent, occasional, rare, none
  
  // Family Information
  familyMembers: text('family_members'), // JSON array
  // [{name, relationship, age, school?, workplace?}]
  
  // Security Posture
  currentSecurityLevel: varchar('current_security_level', { length: 50 })
    .notNull()
    .default('minimal'),
  // Values: none, minimal, moderate, comprehensive, 24_7_detail
  hasPersonalProtection: boolean('has_personal_protection').default(false),
  hasPanicRoom: boolean('has_panic_room').default(false),
  hasArmoredVehicle: boolean('has_armored_vehicle').default(false),
  
  // Threat Intelligence
  knownThreats: text('known_threats'), // JSON array
  previousIncidents: text('previous_incidents'), // JSON array
  restrainingOrders: text('restraining_orders'), // JSON array
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===================================================================
// EXECUTIVE INTERVIEW RESPONSES
// ===================================================================

export const executiveInterviews = pgTable('executive_interviews', {
  id: serial('id').primaryKey(),
  executiveProfileId: integer('executive_profile_id')
    .references(() => executiveProfiles.id, { onDelete: 'cascade' })
    .notNull(),
  
  interviewDate: date('interview_date').notNull(),
  interviewerUserId: integer('interviewer_user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  interviewDuration: integer('interview_duration'), // minutes
  
  // Interview Responses (JSON format)
  responses: text('responses').notNull(),
  // Structured questionnaire responses
  
  // Subjective Assessments
  perceivedThreatLevel: integer('perceived_threat_level'), // 1-5
  cooperationLevel: varchar('cooperation_level', { length: 50 }),
  // Values: excellent, good, fair, poor, resistant
  
  notes: text('notes'),
  concernsRaised: text('concerns_raised'), // JSON array
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// EXECUTIVE LOCATIONS (Residences, Offices, Regular Venues)
// ===================================================================

export const executiveLocations = pgTable('executive_locations', {
  id: serial('id').primaryKey(),
  executiveProfileId: integer('executive_profile_id')
    .references(() => executiveProfiles.id, { onDelete: 'cascade' })
    .notNull(),
  
  locationType: varchar('location_type', { length: 100 }).notNull(),
  // Types: primary_residence, secondary_residence, office, gym, 
  //        restaurant, club, school, frequent_destination
  
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zipCode: varchar('zip_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('USA'),
  
  // Geographic Coordinates
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  
  // Frequency & Patterns
  visitFrequency: varchar('visit_frequency', { length: 50 }),
  // Values: daily, weekly, monthly, occasional, seasonal
  typicalVisitTime: varchar('typical_visit_time', { length: 50 }),
  // Values: morning, afternoon, evening, night, varies
  predictable: boolean('predictable').default(true),
  // Is the schedule predictable?
  
  // Security Assessment
  securityRating: integer('security_rating'), // 1-5
  privateProperty: boolean('private_property').default(true),
  gatedCommunity: boolean('gated_community').default(false),
  hasOnSiteSecurity: boolean('has_on_site_security').default(false),
  
  // Public Exposure
  publiclyKnownAddress: boolean('publicly_known_address').default(false),
  mediaPhotographed: boolean('media_photographed').default(false),
  
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===================================================================
// TRAVEL ROUTES (Common Paths Between Locations)
// ===================================================================

export const executiveTravelRoutes = pgTable('executive_travel_routes', {
  id: serial('id').primaryKey(),
  executiveProfileId: integer('executive_profile_id')
    .references(() => executiveProfiles.id, { onDelete: 'cascade' })
    .notNull(),
  
  originLocationId: integer('origin_location_id')
    .references(() => executiveLocations.id, { onDelete: 'cascade' })
    .notNull(),
  destLocationId: integer('dest_location_id')
    .references(() => executiveLocations.id, { onDelete: 'cascade' })
    .notNull(),
  
  routeName: varchar('route_name', { length: 255 }),
  // e.g., "Home to Office - Route A"
  
  frequency: varchar('frequency', { length: 50 }),
  // Values: daily, weekly, monthly, occasional
  typicalTime: varchar('typical_time', { length: 50 }),
  // Values: morning_commute, evening_commute, midday, varies
  
  // Route Characteristics
  distanceMiles: doublePrecision('distance_miles'),
  estimatedDuration: integer('estimated_duration'), // minutes
  routeVariation: varchar('route_variation', { length: 50 }),
  // Values: fixed_route, varies_route, randomized
  
  // Transportation
  transportMode: varchar('transport_mode', { length: 50 }),
  // Values: personal_vehicle, driver, rideshare, public_transit, walk
  vehicleType: varchar('vehicle_type', { length: 100 }),
  
  // Route Security
  riskLevel: varchar('risk_level', { length: 50 }),
  // Values: low, medium, high, critical
  chokePoints: text('choke_points'), // JSON array of lat/lng
  // Traffic lights, narrow streets, predictable stops
  vulnerableSegments: text('vulnerable_segments'), // JSON array
  
  // Route Data (GeoJSON)
  routeGeometry: text('route_geometry'), // GeoJSON LineString
  
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// CRIME DATA IMPORTS (CAP Index & Other Sources)
// ===================================================================

export const crimeDataImports = pgTable('crime_data_imports', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  
  dataSource: varchar('data_source', { length: 100 }).notNull(),
  // Sources: cap_index, fbi_ucr, local_pd, manual_entry, pdf_import
  
  importDate: timestamp('import_date').defaultNow().notNull(),
  dataTimePeriod: varchar('data_time_period', { length: 100 }),
  // e.g., "2024 Annual", "Q3 2024", "Jan-Dec 2024"
  
  // Geographic Coverage
  coverageArea: text('coverage_area'), // GeoJSON Polygon
  city: varchar('city', { length: 100 }),
  county: varchar('county', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCodes: text('zip_codes'), // JSON array
  
  // Crime Statistics (JSON format)
  crimeStatistics: text('crime_statistics').notNull(),
  // {
  //   violent_crimes: {total, rate_per_100k, breakdown: {murder, assault, robbery, rape}},
  //   property_crimes: {total, rate_per_100k, breakdown: {burglary, theft, auto_theft}},
  //   other_crimes: {...}
  // }
  
  // Comparative Data
  nationalAverage: text('national_average'), // JSON
  stateAverage: text('state_average'), // JSON
  comparisonRating: varchar('comparison_rating', { length: 50 }),
  // Values: very_high, high, average, low, very_low
  
  // Original Files
  originalFileUrl: text('original_file_url'),
  originalFileName: varchar('original_file_name', { length: 255 }),
  
  // Metadata
  dataQuality: varchar('data_quality', { length: 50 }),
  // Values: verified, estimated, preliminary, unverified
  
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// CRIME INCIDENTS (Individual Crime Reports/Pins)
// ===================================================================

export const crimeIncidents = pgTable('crime_incidents', {
  id: serial('id').primaryKey(),
  crimeDataImportId: integer('crime_data_import_id')
    .references(() => crimeDataImports.id, { onDelete: 'cascade' }),
  assessmentId: integer('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Crime Details
  incidentType: varchar('incident_type', { length: 100 }).notNull(),
  // Types: murder, assault, robbery, burglary, theft, vandalism, etc.
  incidentCategory: varchar('incident_category', { length: 50 }),
  // Categories: violent, property, drug, quality_of_life, other
  
  incidentDate: date('incident_date'),
  incidentTime: time('incident_time'),
  
  // Location
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  address: text('address'),
  
  // Distance Analysis
  distanceToExecutiveLocation: doublePrecision('distance_to_executive_location'),
  // Miles from primary residence or selected location
  nearestExecutiveLocationId: integer('nearest_executive_location_id')
    .references(() => executiveLocations.id, { onDelete: 'set null' }),
  
  // Incident Details
  description: text('description'),
  severity: varchar('severity', { length: 50 }),
  // Values: minor, moderate, serious, critical
  
  // Source
  sourceAgency: varchar('source_agency', { length: 255 }),
  caseNumber: varchar('case_number', { length: 100 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================================================================
// POINTS OF INTEREST (Emergency Services, Threats, etc.)
// ===================================================================

export const executivePointsOfInterest = pgTable('executive_points_of_interest', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id')
    .references(() => assessments.id, { onDelete: 'cascade' })
    .notNull(),
  executiveLocationId: integer('executive_location_id')
    .references(() => executiveLocations.id, { onDelete: 'set null' }),
  // If POI is associated with specific executive location
  
  poiType: varchar('poi_type', { length: 100 }).notNull(),
  // Types: police_station, fire_station, hospital, er, security_company,
  //        private_security, known_threat, gang_territory, protest_location,
  //        paparazzi_hotspot, competitor_office, custom
  
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  
  // Geographic Coordinates
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  
  // Distance Analysis
  distanceToLocation: doublePrecision('distance_to_location'),
  // Miles from associated executive location
  estimatedResponseTime: integer('estimated_response_time'),
  // Minutes (for emergency services)
  
  // POI Details
  phoneNumber: varchar('phone_number', { length: 20 }),
  hours: varchar('hours', { length: 255 }),
  capabilities: text('capabilities'), // JSON array
  // For hospitals: trauma_level, specialties
  // For police: jurisdiction, dispatch_number
  
  // Threat Assessment (for threat-type POIs)
  threatLevel: varchar('threat_level', { length: 50 }),
  // Values: low, medium, high, critical
  threatNotes: text('threat_notes'),
  
  // Custom Fields
  customCategory: varchar('custom_category', { length: 100 }),
  icon: varchar('icon', { length: 50 }), // For map display
  color: varchar('color', { length: 20 }), // For map display
  
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===================================================================
// OSINT (Open Source Intelligence) FINDINGS
// ===================================================================

export const osintFindings = pgTable('osint_findings', {
  id: serial('id').primaryKey(),
  executiveProfileId: integer('executive_profile_id')
    .references(() => executiveProfiles.id, { onDelete: 'cascade' })
    .notNull(),
  
  findingType: varchar('finding_type', { length: 100 }).notNull(),
  // Types: social_media, news_article, public_record, property_record,
  //        business_filing, court_record, address_leak, photo_location
  
  source: varchar('source', { length: 255 }).notNull(),
  // e.g., "LinkedIn", "Facebook", "News Article", "Property Records"
  
  sourceUrl: text('source_url'),
  discoveryDate: date('discovery_date').notNull(),
  publicationDate: date('publication_date'),
  
  // Finding Details
  title: varchar('title', { length: 500 }),
  summary: text('summary'),
  fullContent: text('full_content'),
  
  // Risk Assessment
  exposureLevel: varchar('exposure_level', { length: 50 }),
  // Values: critical, high, medium, low, informational
  exposureType: varchar('exposure_type', { length: 100 }),
  // Types: location_disclosure, schedule_disclosure, family_info,
  //        financial_info, security_gap, personal_habits
  
  // Metadata
  tags: text('tags'), // JSON array
  sentiment: varchar('sentiment', { length: 50 }),
  // Values: positive, neutral, negative, threatening
  
  // Mitigation
  mitigationRequired: boolean('mitigation_required').default(false),
  mitigationAction: text('mitigation_action'),
  mitigationStatus: varchar('mitigation_status', { length: 50 }),
  // Values: pending, in_progress, completed, no_action
  
  attachments: text('attachments'), // JSON array of file URLs
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.2 Enhanced Indexes

```typescript
// Add these indexes for performance

// Executive Profiles
index('idx_executive_profiles_assessment').on(executiveProfiles.assessmentId);
index('idx_executive_profiles_public_profile').on(executiveProfiles.publicProfile);

// Executive Locations
index('idx_executive_locations_profile').on(executiveLocations.executiveProfileId);
index('idx_executive_locations_type').on(executiveLocations.locationType);
index('idx_executive_locations_coords').on(executiveLocations.latitude, executiveLocations.longitude);

// Travel Routes
index('idx_travel_routes_profile').on(executiveTravelRoutes.executiveProfileId);
index('idx_travel_routes_origin').on(executiveTravelRoutes.originLocationId);

// Crime Data
index('idx_crime_incidents_assessment').on(crimeIncidents.assessmentId);
index('idx_crime_incidents_coords').on(crimeIncidents.latitude, crimeIncidents.longitude);
index('idx_crime_incidents_date').on(crimeIncidents.incidentDate);

// POIs
index('idx_poi_assessment').on(executivePointsOfInterest.assessmentId);
index('idx_poi_type').on(executivePointsOfInterest.poiType);
index('idx_poi_coords').on(executivePointsOfInterest.latitude, executivePointsOfInterest.longitude);

// OSINT
index('idx_osint_profile').on(osintFindings.executiveProfileId);
index('idx_osint_exposure').on(osintFindings.exposureLevel);
index('idx_osint_date').on(osintFindings.discoveryDate);
```

---

## 3. Executive Interview Protocol System

### 3.1 Interview Questionnaire Structure

**File Location:** `server/data/executive-interview-questionnaire.ts`

```typescript
export interface InterviewQuestion {
  id: string;
  section: string;
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'yes_no' | 'checklist';
  options?: string[]; // For multiple choice or checklist
  ratingScale?: { min: number; max: number; labels: string[] };
  required: boolean;
  followUpQuestions?: InterviewQuestion[];
  riskIndicators?: string[]; // Keywords that indicate elevated risk
}

export const executiveInterviewQuestionnaire: InterviewQuestion[] = [
  // ===== SECTION 1: PERSONAL THREAT PERCEPTION =====
  {
    id: 'threat_perception_1',
    section: 'Personal Threat Perception',
    questionText: 'On a scale of 1-10, how concerned are you about your personal safety?',
    questionType: 'rating',
    ratingScale: {
      min: 1,
      max: 10,
      labels: ['Not Concerned', 'Moderately Concerned', 'Extremely Concerned'],
    },
    required: true,
  },
  {
    id: 'threat_perception_2',
    section: 'Personal Threat Perception',
    questionText: 'Have you ever received direct threats (verbal, written, digital)?',
    questionType: 'yes_no',
    required: true,
    followUpQuestions: [
      {
        id: 'threat_perception_2a',
        section: 'Personal Threat Perception',
        questionText: 'Please describe the nature and frequency of these threats.',
        questionType: 'text',
        required: true,
        riskIndicators: ['death threat', 'kidnapping', 'physical harm', 'stalking'],
      },
      {
        id: 'threat_perception_2b',
        section: 'Personal Threat Perception',
        questionText: 'Were these threats reported to law enforcement?',
        questionType: 'yes_no',
        required: true,
      },
    ],
  },
  {
    id: 'threat_perception_3',
    section: 'Personal Threat Perception',
    questionText: 'Do you have any active restraining orders or protective orders?',
    questionType: 'yes_no',
    required: true,
  },
  {
    id: 'threat_perception_4',
    section: 'Personal Threat Perception',
    questionText: 'Are you aware of any individuals or groups who may pose a threat to you?',
    questionType: 'yes_no',
    required: true,
    followUpQuestions: [
      {
        id: 'threat_perception_4a',
        section: 'Personal Threat Perception',
        questionText: 'Please describe these potential threat actors.',
        questionType: 'text',
        required: true,
        riskIndicators: ['disgruntled', 'terminated', 'lawsuit', 'stalker', 'obsessed'],
      },
    ],
  },
  {
    id: 'threat_perception_5',
    section: 'Personal Threat Perception',
    questionText: 'What types of threats concern you most? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Kidnapping or abduction',
      'Physical assault or assassination',
      'Home invasion',
      'Stalking or harassment',
      'Cyberstalking or doxxing',
      'Threats to family members',
      'Corporate espionage',
      'Extortion or blackmail',
      'Paparazzi or unwanted media attention',
      'Protests or demonstrations at residence',
    ],
    required: true,
  },

  // ===== SECTION 2: PUBLIC PROFILE & EXPOSURE =====
  {
    id: 'public_profile_1',
    section: 'Public Profile & Exposure',
    questionText: 'How would you describe your public profile?',
    questionType: 'multiple_choice',
    options: [
      'Very High (National/international recognition, frequent media coverage)',
      'High (Regional recognition, occasional media coverage)',
      'Medium (Industry recognition, professional visibility)',
      'Low (Limited public recognition)',
      'Private (Actively avoid public attention)',
    ],
    required: true,
  },
  {
    id: 'public_profile_2',
    section: 'Public Profile & Exposure',
    questionText: 'How frequently do you engage with media or give public statements?',
    questionType: 'multiple_choice',
    options: ['Weekly or more', 'Monthly', 'A few times per year', 'Rarely', 'Never'],
    required: true,
  },
  {
    id: 'public_profile_3',
    section: 'Public Profile & Exposure',
    questionText: 'Have you been the subject of negative media coverage or public controversy?',
    questionType: 'yes_no',
    required: true,
    followUpQuestions: [
      {
        id: 'public_profile_3a',
        section: 'Public Profile & Exposure',
        questionText: 'Please describe the nature and timing of this coverage.',
        questionType: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'public_profile_4',
    section: 'Public Profile & Exposure',
    questionText: 'Are you active on social media? Which platforms? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'LinkedIn',
      'Twitter/X',
      'Facebook',
      'Instagram',
      'TikTok',
      'YouTube',
      'None - I do not use social media',
    ],
    required: true,
  },
  {
    id: 'public_profile_5',
    section: 'Public Profile & Exposure',
    questionText: 'Do you post personal information or location data on social media?',
    questionType: 'multiple_choice',
    options: [
      'Frequently (daily posts with locations)',
      'Occasionally (some location tags)',
      'Rarely (minimal personal info)',
      'Never (professional only)',
    ],
    required: true,
  },

  // ===== SECTION 3: DAILY ROUTINES & PATTERNS =====
  {
    id: 'routines_1',
    section: 'Daily Routines & Patterns',
    questionText: 'How predictable is your daily schedule?',
    questionType: 'multiple_choice',
    options: [
      'Very predictable (same time, same routes daily)',
      'Somewhat predictable (consistent workweek, variable weekends)',
      'Variable (schedule changes frequently)',
      'Highly variable (unpredictable)',
    ],
    required: true,
    riskIndicators: ['very predictable', 'same time'],
  },
  {
    id: 'routines_2',
    section: 'Daily Routines & Patterns',
    questionText: 'Do you vary your routes between home and work?',
    questionType: 'yes_no',
    required: true,
  },
  {
    id: 'routines_3',
    section: 'Daily Routines & Patterns',
    questionText: 'What time do you typically leave home for work?',
    questionType: 'multiple_choice',
    options: [
      'Before 6:00 AM',
      '6:00-7:00 AM',
      '7:00-8:00 AM',
      '8:00-9:00 AM',
      'After 9:00 AM',
      'Varies significantly',
    ],
    required: true,
  },
  {
    id: 'routines_4',
    section: 'Daily Routines & Patterns',
    questionText: 'Do you have regular evening or weekend routines? (e.g., gym, dinner, club)',
    questionType: 'yes_no',
    required: true,
    followUpQuestions: [
      {
        id: 'routines_4a',
        section: 'Daily Routines & Patterns',
        questionText: 'Please list these regular activities and their typical frequency.',
        questionType: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'routines_5',
    section: 'Daily Routines & Patterns',
    questionText: 'How often do you travel for business?',
    questionType: 'multiple_choice',
    options: [
      'Weekly or more',
      'Monthly',
      'Quarterly',
      'A few times per year',
      'Rarely/Never',
    ],
    required: true,
  },

  // ===== SECTION 4: RESIDENTIAL SECURITY =====
  {
    id: 'residential_1',
    section: 'Residential Security',
    questionText: 'Is your primary residence in a gated community or secured building?',
    questionType: 'yes_no',
    required: true,
  },
  {
    id: 'residential_2',
    section: 'Residential Security',
    questionText: 'What security measures are currently in place at your residence? (Select all)',
    questionType: 'checklist',
    options: [
      'Monitored alarm system',
      'CCTV cameras',
      'Security guard or concierge',
      'Access control (gate code/keycard)',
      'Perimeter fence',
      'Motion sensors',
      'Safe room/panic room',
      'Guard dogs',
      'None',
    ],
    required: true,
  },
  {
    id: 'residential_3',
    section: 'Residential Security',
    questionText: 'Is your home address publicly available or easily found online?',
    questionType: 'yes_no',
    required: true,
  },
  {
    id: 'residential_4',
    section: 'Residential Security',
    questionText: 'Have you experienced any security incidents at your residence?',
    questionType: 'yes_no',
    required: true,
    followUpQuestions: [
      {
        id: 'residential_4a',
        section: 'Residential Security',
        questionText: 'Please describe these incidents.',
        questionType: 'text',
        required: true,
        riskIndicators: ['break-in', 'trespassing', 'vandalism', 'suspicious'],
      },
    ],
  },

  // ===== SECTION 5: FAMILY & DEPENDENTS =====
  {
    id: 'family_1',
    section: 'Family & Dependents',
    questionText: 'Do you have concerns about the safety of family members?',
    questionType: 'yes_no',
    required: true,
    followUpQuestions: [
      {
        id: 'family_1a',
        section: 'Family & Dependents',
        questionText: 'Please describe these concerns.',
        questionType: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'family_2',
    section: 'Family & Dependents',
    questionText: 'Do any family members have a public profile or media exposure?',
    questionType: 'yes_no',
    required: true,
  },
  {
    id: 'family_3',
    section: 'Family & Dependents',
    questionText: 'Are your children\'s schools or activities publicly known?',
    questionType: 'yes_no',
    required: true,
  },

  // ===== SECTION 6: TRANSPORTATION & TRAVEL =====
  {
    id: 'transportation_1',
    section: 'Transportation & Travel',
    questionText: 'How do you typically commute?',
    questionType: 'multiple_choice',
    options: [
      'Personal vehicle (self-driven)',
      'Personal vehicle (with driver)',
      'Rideshare (Uber/Lyft)',
      'Public transportation',
      'Company vehicle',
      'Walk',
      'Other',
    ],
    required: true,
  },
  {
    id: 'transportation_2',
    section: 'Transportation & Travel',
    questionText: 'Do you have an armored or security-enhanced vehicle?',
    questionType: 'yes_no',
    required: true,
  },
  {
    id: 'transportation_3',
    section: 'Transportation & Travel',
    questionText: 'When traveling, do you announce travel plans publicly or on social media?',
    questionType: 'multiple_choice',
    options: [
      'Yes, frequently post travel details',
      'Sometimes mention general destinations',
      'Rarely share travel information',
      'Never share travel plans',
    ],
    required: true,
  },

  // ===== SECTION 7: CURRENT SECURITY MEASURES =====
  {
    id: 'current_security_1',
    section: 'Current Security Measures',
    questionText: 'Do you currently have personal protection (bodyguards/security detail)?',
    questionType: 'yes_no',
    required: true,
    followUpQuestions: [
      {
        id: 'current_security_1a',
        section: 'Current Security Measures',
        questionText: 'Please describe your current protection detail.',
        questionType: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'current_security_2',
    section: 'Current Security Measures',
    questionText: 'Have you received any security awareness or self-defense training?',
    questionType: 'yes_no',
    required: true,
  },
  {
    id: 'current_security_3',
    section: 'Current Security Measures',
    questionText: 'Do you carry any personal safety devices? (Select all that apply)',
    questionType: 'checklist',
    options: [
      'Panic button/alert system',
      'Pepper spray',
      'Firearm',
      'Personal alarm',
      'GPS tracking device',
      'None',
    ],
    required: true,
  },
];
```

### 3.2 Interview UI Component

**Component:** `ExecutiveInterviewForm`

**Features:**
- Progressive disclosure (follow-up questions appear dynamically)
- Risk indicator highlighting (keywords trigger visual alerts)
- Auto-save functionality
- PDF export of interview responses
- Sentiment analysis of text responses

---

## 4. Geographic Intelligence & Mapping Integration

### 4.1 Google Maps Platform Integration

**Required APIs:**
- Maps JavaScript API (map display)
- Places API (POI search)
- Directions API (route analysis)
- Distance Matrix API (proximity calculations)
- Geocoding API (address → coordinates)
- Static Maps API (PDF report maps)

**Environment Variables:**
```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_MAPS_API_KEY_SERVER_SIDE=your_server_key_here # Restricted to backend
```

### 4.2 Map Service Module

**File Location:** `server/services/map-service.ts`

```typescript
import { Client, GeocodeResult, LatLng } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export interface GeocodedLocation {
  address: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
}

export interface ProximityAnalysis {
  targetLocation: GeocodedLocation;
  pois: Array<{
    type: string;
    name: string;
    location: GeocodedLocation;
    distance: number; // miles
    duration: number; // minutes
  }>;
}

// ===================================================================
// GEOCODING
// ===================================================================

export async function geocodeAddress(address: string): Promise<GeocodedLocation> {
  const response = await mapsClient.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY_SERVER_SIDE!,
    },
  });

  if (response.data.results.length === 0) {
    throw new Error('Address not found');
  }

  const result = response.data.results[0];

  return {
    address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  };
}

// ===================================================================
// FIND NEARBY EMERGENCY SERVICES
// ===================================================================

export async function findNearbyEmergencyServices(
  location: { lat: number; lng: number },
  radiusMiles: number = 10
): Promise<ProximityAnalysis> {
  const radiusMeters = radiusMiles * 1609.34;

  // Find Police Stations
  const policeResponse = await mapsClient.placesNearby({
    params: {
      location,
      radius: radiusMeters,
      type: 'police',
      key: process.env.GOOGLE_MAPS_API_KEY_SERVER_SIDE!,
    },
  });

  // Find Hospitals
  const hospitalResponse = await mapsClient.placesNearby({
    params: {
      location,
      radius: radiusMeters,
      type: 'hospital',
      keyword: 'emergency room',
      key: process.env.GOOGLE_MAPS_API_KEY_SERVER_SIDE!,
    },
  });

  // Find Fire Stations
  const fireResponse = await mapsClient.placesNearby({
    params: {
      location,
      radius: radiusMeters,
      type: 'fire_station',
      key: process.env.GOOGLE_MAPS_API_KEY_SERVER_SIDE!,
    },
  });

  // Calculate distances and durations
  const pois = [];

  for (const place of policeResponse.data.results.slice(0, 3)) {
    const distance = calculateDistance(
      location,
      place.geometry!.location as LatLng
    );
    pois.push({
      type: 'police_station',
      name: place.name!,
      location: {
        address: place.vicinity!,
        latitude: place.geometry!.location.lat,
        longitude: place.geometry!.location.lng,
        formattedAddress: place.formatted_address || place.vicinity!,
        placeId: place.place_id!,
      },
      distance: distance,
      duration: await estimateDrivingTime(location, place.geometry!.location as LatLng),
    });
  }

  for (const place of hospitalResponse.data.results.slice(0, 3)) {
    const distance = calculateDistance(
      location,
      place.geometry!.location as LatLng
    );
    pois.push({
      type: 'hospital',
      name: place.name!,
      location: {
        address: place.vicinity!,
        latitude: place.geometry!.location.lat,
        longitude: place.geometry!.location.lng,
        formattedAddress: place.formatted_address || place.vicinity!,
        placeId: place.place_id!,
      },
      distance: distance,
      duration: await estimateDrivingTime(location, place.geometry!.location as LatLng),
    });
  }

  return {
    targetLocation: {
      address: '',
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: '',
      placeId: '',
    },
    pois,
  };
}

// ===================================================================
// DISTANCE CALCULATIONS
// ===================================================================

export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  // Haversine formula
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ===================================================================
// DRIVING TIME ESTIMATION
// ===================================================================

export async function estimateDrivingTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number> {
  const response = await mapsClient.distancematrix({
    params: {
      origins: [`${origin.lat},${origin.lng}`],
      destinations: [`${destination.lat},${destination.lng}`],
      mode: 'driving',
      key: process.env.GOOGLE_MAPS_API_KEY_SERVER_SIDE!,
    },
  });

  const element = response.data.rows[0].elements[0];
  
  if (element.status !== 'OK') {
    throw new Error('Unable to calculate driving time');
  }

  return Math.round(element.duration.value / 60); // Convert seconds to minutes
}

// ===================================================================
// ROUTE ANALYSIS
// ===================================================================

export async function analyzeRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  const response = await mapsClient.directions({
    params: {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      alternatives: true,
      key: process.env.GOOGLE_MAPS_API_KEY_SERVER_SIDE!,
    },
  });

  return response.data.routes.map((route) => ({
    summary: route.summary,
    distance: route.legs[0].distance.value / 1609.34, // meters to miles
    duration: route.legs[0].duration.value / 60, // seconds to minutes
    polyline: route.overview_polyline.points,
    steps: route.legs[0].steps.map((step) => ({
      instruction: step.html_instructions,
      distance: step.distance.value / 1609.34,
      duration: step.duration.value / 60,
      startLocation: step.start_location,
      endLocation: step.end_location,
    })),
  }));
}
```

### 4.3 Interactive Map Component

**Component:** `ExecutiveSecurityMap`

**Features:**
1. **Layer Toggle:**
   - Executive locations (home, office, frequent venues)
   - Travel routes
   - Crime incidents (heat map)
   - Emergency services (PD, Fire, Hospitals)
   - Custom POIs

2. **Crime Heat Map:**
   - Color-coded by crime severity
   - Time-based filtering (last 30/90/365 days)
   - Crime type filtering

3. **Route Analysis:**
   - Primary/alternate routes
   - Chokepoint identification
   - Vulnerable segments highlighting
   - Escape route planning

4. **Custom POI Creation:**
   - Click to add custom markers
   - Category selection
   - Threat level tagging
   - Notes/annotations

**Implementation:**
```tsx
import { GoogleMap, LoadScript, Marker, HeatmapLayer, Polyline } from '@react-google-maps/api';

export function ExecutiveSecurityMap({
  executiveLocations,
  crimeData,
  pois,
  routes,
}: ExecutiveSecurityMapProps) {
  const [selectedLayers, setSelectedLayers] = useState({
    locations: true,
    crimes: true,
    emergency: true,
    routes: false,
    customPois: true,
  });

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        zoom={12}
        center={executiveLocations[0]}
      >
        {/* Executive Locations */}
        {selectedLayers.locations &&
          executiveLocations.map((loc) => (
            <Marker
              key={loc.id}
              position={{ lat: loc.latitude, lng: loc.longitude }}
              icon={{
                url: '/icons/executive-home.svg',
                scaledSize: new google.maps.Size(40, 40),
              }}
              onClick={() => showLocationDetails(loc)}
            />
          ))}

        {/* Crime Heat Map */}
        {selectedLayers.crimes && (
          <HeatmapLayer
            data={crimeData.map(
              (crime) =>
                new google.maps.LatLng(crime.latitude, crime.longitude)
            )}
            options={{
              radius: 30,
              opacity: 0.6,
            }}
          />
        )}

        {/* Emergency Services */}
        {selectedLayers.emergency &&
          pois
            .filter((poi) => poi.poiType.includes('police') || poi.poiType.includes('hospital'))
            .map((poi) => (
              <Marker
                key={poi.id}
                position={{ lat: poi.latitude, lng: poi.longitude }}
                icon={getPoiIcon(poi.poiType)}
                onClick={() => showPoiDetails(poi)}
              />
            ))}

        {/* Routes */}
        {selectedLayers.routes &&
          routes.map((route) => (
            <Polyline
              key={route.id}
              path={route.path}
              options={{
                strokeColor: route.riskLevel === 'high' ? '#dc2626' : '#0284c7',
                strokeWeight: 4,
              }}
            />
          ))}
      </GoogleMap>
    </LoadScript>
  );
}
```

---

## 5. CAP Index & Crime Data Integration

### 5.1 CAP Index Overview

**CAP Index** (Crime, Access, Profile) provides neighborhood crime statistics and risk ratings.

**Data Available:**
- Overall crime index (0-100, where 100 = highest crime)
- Violent crime breakdown (murder, assault, robbery, rape)
- Property crime breakdown (burglary, theft, auto theft)
- Historical trends
- Comparison to national/state averages

### 5.2 CAP Index Integration Options

#### **Option A: Manual PDF Import**

**User Workflow:**
1. User obtains CAP Index report (PDF) for executive's address
2. User uploads PDF to RiskFixer
3. System uses AI (GPT-4V) to extract data from PDF
4. Parsed data saved to `crimeDataImports` table

**Implementation:**
```typescript
// server/services/crime-data-parser.ts

export async function parseCAPIndexPDF(pdfBuffer: Buffer): Promise<CrimeStatistics> {
  // Step 1: Convert PDF to images using pdf-lib or similar
  const pdfImages = await convertPDFToImages(pdfBuffer);

  // Step 2: Use GPT-4V to extract structured data
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are extracting crime statistics from a CAP Index report PDF. 
        Extract the following data in JSON format:
        - Overall crime index (0-100)
        - Violent crimes: {murder, assault, robbery, rape, total, rate_per_100k}
        - Property crimes: {burglary, theft, auto_theft, total, rate_per_100k}
        - Time period covered
        - Geographic area (city, county, zip)
        - Comparison to national average`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract crime statistics from this CAP Index report:',
          },
          ...pdfImages.map((img) => ({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${img}`,
            },
          })),
        ],
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

#### **Option B: CAP Index API Integration (If Available)**

**If CAP Index offers an API:**
```typescript
// server/services/cap-index-api.ts

export async function fetchCAPIndexData(address: string): Promise<CrimeStatistics> {
  // Hypothetical API call
  const response = await fetch(`https://api.capindex.com/v1/crime-data`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CAP_INDEX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address }),
  });

  const data = await response.json();
  return data;
}
```

#### **Option C: Alternative Crime Data Sources**

**Free/Open Data Sources:**
1. **FBI UCR (Uniform Crime Reporting)** - Annual city/county data
2. **Local Police Department Open Data Portals**
3. **CrimeReports.com** API
4. **SpotCrime** API

**Implementation for Open Data:**
```typescript
export async function fetchFBIUCRData(city: string, state: string, year: number) {
  const response = await fetch(
    `https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/` +
    `${city}/${state}/${year}?API_KEY=${process.env.FBI_UCR_API_KEY}`
  );
  return response.json();
}
```

### 5.3 Crime Data Visualization

**Crime Dashboard Component:**

```tsx
export function CrimeDataDashboard({ crimeData }: { crimeData: CrimeDataImport }) {
  const stats = JSON.parse(crimeData.crimeStatistics);

  return (
    <div className="space-y-6">
      {/* Overall Crime Index */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Crime Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-6xl font-bold text-red-600">
              {stats.overall_index}
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Out of 100 (100 = Highest Crime)
              </p>
              <Badge variant={stats.comparison_rating}>
                {stats.comparison_rating.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violent Crimes Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Violent Crimes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Rate per 100K</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Murder</TableCell>
                <TableCell>{stats.violent_crimes.breakdown.murder}</TableCell>
                <TableCell>{stats.violent_crimes.breakdown.murder_rate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Assault</TableCell>
                <TableCell>{stats.violent_crimes.breakdown.assault}</TableCell>
                <TableCell>{stats.violent_crimes.breakdown.assault_rate}</TableCell>
              </TableRow>
              {/* ... more rows */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Property Crimes Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Property Crimes Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.property_crimes.breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 6. External Threat Assessment Methodology

### 6.1 OSINT (Open Source Intelligence) Framework

**Objective:** Identify publicly available information that could be exploited by threat actors.

**Key Areas:**
1. **Digital Footprint Analysis**
2. **Property Records Research**
3. **Social Media Exposure**
4. **News & Media Coverage**
5. **Business Affiliations**
6. **Legal Records**

### 6.2 OSINT Collection Workflow

**Manual Collection (Phase 1):**
```
Analyst Workflow:
1. Google Search: "[Executive Name]" + address, family, net worth, etc.
2. Social Media: LinkedIn, Facebook, Twitter/X, Instagram profiles
3. Property Records: Zillow, Redfin, county assessor sites
4. News Archives: Google News, LexisNexis
5. Court Records: PACER, state court systems
6. Business Records: SEC filings, corporate registries

Document findings in osintFindings table with:
- Source URL
- Exposure level (critical/high/medium/low)
- Screenshot/attachment
- Mitigation recommendations
```

**Semi-Automated Collection (Phase 2):**
```typescript
// server/services/osint-collection.ts

export async function conductOSINTResearch(executiveName: string) {
  const findings: OSINTFinding[] = [];

  // 1. Google Search via SerpAPI
  const googleResults = await searchGoogle(executiveName);
  findings.push(...analyzeSearchResults(googleResults));

  // 2. Social Media via API (where available)
  const linkedInProfile = await searchLinkedIn(executiveName);
  findings.push(...analyzeLinkedInProfile(linkedInProfile));

  // 3. Property Records (if address known)
  const propertyRecords = await searchPropertyRecords(address);
  findings.push(...analyzePropertyRecords(propertyRecords));

  // 4. News Mentions
  const newsArticles = await searchNews(executiveName);
  findings.push(...analyzeNewsArticles(newsArticles));

  return findings;
}
```

### 6.3 Threat Actor Profiling

**Categories:**
1. **Opportunistic Criminals** - Property crime, theft
2. **Targeted Criminals** - Kidnapping, extortion, home invasion
3. **Stalkers/Obsessed Individuals** - Harassment, physical threats
4. **Disgruntled Employees/Business Associates** - Retaliation threats
5. **Activists/Protesters** - Industry-specific threats
6. **Organized Crime/Cartels** - High-value targets
7. **Terrorists/Extremists** - Ideological targets

**Threat Matrix:**
```
Threat Actor Type | Motivation | Capability | Intent | Likelihood
------------------|------------|------------|--------|------------
Opportunist       | Financial  | Low-Medium | Low    | Medium-High
Kidnapper         | Ransom     | Medium-High| High   | Low-Medium
Stalker           | Obsession  | Low-Medium | Medium | Medium
Disgruntled       | Revenge    | Medium     | High   | Low
Activist          | Ideology   | Low-Medium | Low    | Medium
```

### 6.4 Threat Intelligence Report Generation

**Auto-Generated Report Sections:**
1. **Executive Summary**
2. **Digital Footprint Assessment**
3. **Geographic Threat Environment**
4. **Known/Suspected Threat Actors**
5. **Vulnerability Analysis**
6. **Recommended Mitigation Strategies**

---

## 7. Executive Protection-Specific Risk Engine

### 7.1 Modified Risk Formula

**Standard Formula:** `Risk = (T × V) × I × (1 - C_e)`

**Executive Protection Formula:**
```
Risk_EP = (T × V × E) × I × (1 - C_e)

Where:
  T = Threat (likelihood of adversary action)
  V = Vulnerability (security gaps)
  E = Exposure (public profile + pattern predictability) ← NEW
  I = Impact (consequences)
  C_e = Control Effectiveness
```

**Exposure (E) Calculation:**
```
E = (Public_Profile × 0.4) + (Pattern_Predictability × 0.3) + 
    (Digital_Footprint × 0.2) + (Geographic_Risk × 0.1)

Where each factor is scored 1-5:
  Public_Profile: 1 = Private, 5 = Internationally Known
  Pattern_Predictability: 1 = Highly Variable, 5 = Extremely Predictable
  Digital_Footprint: 1 = Minimal, 5 = Extensive Public Information
  Geographic_Risk: 1 = Low-Crime Area, 5 = High-Crime Area
```

### 7.2 Executive Protection Threat Library

**Add to seed data (`threats.ts`):**

```typescript
export const executiveProtectionThreats = [
  {
    name: 'Targeted Kidnapping - Ransom',
    category: 'executive_protection',
    subcategory: 'kidnapping',
    description: 'Planned abduction of executive or family member for financial ransom.',
    typicalLikelihood: 1, // Rare but possible
    typicalImpact: 5, // Catastrophic
    requiresExposureCalc: true, // Triggers E factor
  },
  {
    name: 'Express Kidnapping',
    category: 'executive_protection',
    subcategory: 'kidnapping',
    description: 'Short-term abduction to force ATM withdrawals or immediate ransom.',
    typicalLikelihood: 2,
    typicalImpact: 4,
    requiresExposureCalc: true,
  },
  {
    name: 'Home Invasion - Targeted',
    category: 'executive_protection',
    subcategory: 'property_crime',
    description: 'Planned invasion of residence targeting high-value assets or occupants.',
    typicalLikelihood: 2,
    typicalImpact: 5,
    requiresExposureCalc: true,
  },
  {
    name: 'Stalking - Physical',
    category: 'executive_protection',
    subcategory: 'harassment',
    description: 'Persistent following or surveillance of executive by obsessed individual.',
    typicalLikelihood: 2,
    typicalImpact: 3,
    requiresExposureCalc: true,
  },
  {
    name: 'Cyberstalking & Doxxing',
    category: 'executive_protection',
    subcategory: 'cyber_threats',
    description: 'Online harassment and public disclosure of private information.',
    typicalLikelihood: 3,
    typicalImpact: 3,
    requiresExposureCalc: true,
  },
  {
    name: 'Assassination/Physical Assault',
    category: 'executive_protection',
    subcategory: 'physical_harm',
    description: 'Targeted attack intending to cause death or serious injury.',
    typicalLikelihood: 1,
    typicalImpact: 5,
    requiresExposureCalc: true,
  },
  {
    name: 'Paparazzi/Media Harassment',
    category: 'executive_protection',
    subcategory: 'privacy_invasion',
    description: 'Aggressive pursuit by media creating safety and privacy concerns.',
    typicalLikelihood: 3, // For high-profile individuals
    typicalImpact: 2,
    requiresExposureCalc: true,
  },
  {
    name: 'Protest/Demonstration at Residence',
    category: 'executive_protection',
    subcategory: 'activism',
    description: 'Organized protest at executive residence creating security concerns.',
    typicalLikelihood: 2,
    typicalImpact: 3,
    requiresExposureCalc: true,
  },
];
```

---

## 8. API Routes & Endpoints

### Executive Protection-Specific APIs

```
/api/executive-protection/
├── profiles/
│   ├── (GET, POST)
│   └── [id]/
│       ├── (GET, PATCH, DELETE)
│       ├── interview (POST, GET)
│       ├── locations (GET, POST)
│       └── osint-findings (GET, POST)
│
├── locations/
│   ├── (GET, POST)
│   ├── [id]/ (GET, PATCH, DELETE)
│   └── geocode (POST)
│
├── crime-data/
│   ├── import (POST) # Upload CAP Index PDF
│   ├── [id]/ (GET, DELETE)
│   └── incidents/ (GET, POST)
│
├── map-services/
│   ├── geocode (POST)
│   ├── find-emergency-services (POST)
│   ├── analyze-route (POST)
│   └── calculate-proximity (POST)
│
├── pois/
│   ├── (GET, POST)
│   ├── [id]/ (GET, PATCH, DELETE)
│   └── auto-populate (POST) # Auto-find PD/hospitals
│
└── osint/
    ├── findings/ (GET, POST)
    ├── [id]/ (GET, PATCH, DELETE)
    └── automated-search (POST)
```

### Key Endpoint Example

**POST /api/executive-protection/locations/[id]/analyze**

**Purpose:** Comprehensive location threat analysis

**Request Body:**
```json
{
  "includeEmergencyServices": true,
  "includeCrimeData": true,
  "crimeDataRadiusMiles": 2,
  "includeRouteAnalysis": true,
  "destinationLocationIds": [123, 456]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "location": {
      "id": 789,
      "name": "Primary Residence",
      "address": "123 Main St, Beverly Hills, CA 90210",
      "coordinates": { "lat": 34.0736, "lng": -118.4004 }
    },
    "emergencyServices": {
      "nearestPoliceStation": {
        "name": "Beverly Hills PD",
        "distance": 1.2,
        "responseTime": 4
      },
      "nearestHospital": {
        "name": "Cedars-Sinai Medical Center",
        "distance": 2.8,
        "responseTime": 8
      }
    },
    "crimeEnvironment": {
      "overallCrimeIndex": 42,
      "violentCrimeRate": 178.5,
      "propertyCrimeRate": 1245.3,
      "recentIncidents": [
        {
          "type": "burglary",
          "date": "2025-10-15",
          "distance": 0.3
        }
      ]
    },
    "routes": [
      {
        "destination": "Corporate Office",
        "primaryRoute": {
          "distance": 8.5,
          "duration": 22,
          "riskLevel": "medium",
          "vulnerableSegments": [
            "Santa Monica Blvd - predictable timing, high traffic"
          ]
        }
      }
    ]
  }
}
```

---

## 9. UI/UX Components

### 9.1 Executive Protection Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ Executive Protection Assessment: [John Smith]                   │
│ Status: In Progress | Last Updated: Nov 19, 2025               │
├─────────────────────────────────────────────────────────────────┤
│ TABS: [ Overview ] [ Interview ] [ Locations ] [ Threats ]     │
│       [ Crime Data ] [ OSINT ] [ Report ]                       │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ OVERVIEW TAB                                                   │
├───────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Public       │ │ Threat       │ │ Security     │         │
│ │ Profile:     │ │ Level:       │ │ Posture:     │         │
│ │ VERY HIGH    │ │ MEDIUM       │ │ MINIMAL      │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 🗺️ Executive Security Map                              │  │
│ │ [Interactive map with locations, crimes, POIs]          │  │
│ │                                                          │  │
│ │ Layers: ☑ Locations ☑ Crimes ☑ Emergency ☐ Routes    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ Primary Residence:                                             │
│ 📍 123 Main St, Beverly Hills, CA                            │
│ Crime Index: 42/100 (Medium)                                  │
│ Nearest PD: 1.2 mi (4 min response)                          │
│ Nearest ER: 2.8 mi (8 min)                                    │
│                                                                │
│ [View Full Analysis]                                           │
└───────────────────────────────────────────────────────────────┘
```

### 9.2 Crime Data Import Wizard

```
┌───────────────────────────────────────────────────────────────┐
│ Import Crime Data                                              │
├───────────────────────────────────────────────────────────────┤
│ Step 1 of 3: Upload Report                                    │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 📄 Drag & Drop CAP Index PDF                           │  │
│ │    or [Browse Files]                                     │  │
│ │                                                          │  │
│ │ Supported: CAP Index, FBI UCR, Police Reports          │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ OR                                                             │
│                                                                │
│ Enter Address for Auto-Lookup:                                │
│ [_________________________]                                   │
│ [Search Crime Data] (Powered by FBI UCR)                      │
│                                                                │
│ [Cancel] [Continue →]                                         │
└───────────────────────────────────────────────────────────────┘

[After upload, Step 2:]

┌───────────────────────────────────────────────────────────────┐
│ Step 2 of 3: Review Extracted Data                            │
│                                                                │
│ 🤖 AI extracted the following from your report:               │
│                                                                │
│ Geographic Area: Beverly Hills, CA 90210                      │
│ Time Period: 2024 Annual                                      │
│ Overall Crime Index: 42/100                                   │
│                                                                │
│ Violent Crimes: 178.5 per 100K                                │
│   • Murder: 2                                                 │
│   • Assault: 45                                               │
│   • Robbery: 38                                               │
│                                                                │
│ Property Crimes: 1,245 per 100K                               │
│   • Burglary: 234                                             │
│   • Theft: 892                                                │
│   • Auto Theft: 119                                           │
│                                                                │
│ ☑ Data looks correct                                          │
│ ☐ I need to edit this data                                    │
│                                                                │
│ [← Back] [Continue →]                                         │
└───────────────────────────────────────────────────────────────┘
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Day 1-2: Database Schema**
```
AI Prompt:
"Extend the RiskFixer database schema with the Executive Protection tables 
from Section 2.1 of the EP Integration Document. Add: executiveProfiles, 
executiveInterviews, executiveLocations, executiveTravelRoutes, 
crimeDataImports, crimeIncidents, executivePointsOfInterest, osintFindings. 
Include all foreign keys and indexes."
```

**Day 3: Executive Interview Questionnaire**
```
AI Prompt:
"Implement the executive interview system using the questionnaire structure 
from Section 3.1. Create React components for progressive disclosure, 
follow-up questions, and risk indicator highlighting. Store responses in 
executiveInterviews table."
```

**Day 4-5: Google Maps Integration**
```
AI Prompt:
"Integrate Google Maps Platform per Section 4. Implement map-service.ts 
with geocoding, POI search, and proximity analysis. Create the 
ExecutiveSecurityMap React component with layer toggles."
```

---

### Phase 2: Crime Data & Intelligence (Week 2)

**Day 6-7: CAP Index PDF Import**
```
AI Prompt:
"Build the CAP Index PDF import system from Section 5.2. Use GPT-4V to 
extract crime statistics from uploaded PDFs. Parse into crimeDataImports 
table. Create the import wizard UI."
```

**Day 8: Emergency Services Auto-Population**
```
AI Prompt:
"Implement auto-discovery of emergency services (PD, hospitals, fire) using 
Google Places API. For each executiveLocation, automatically find and save 
the 3 nearest emergency services to executivePointsOfInterest table."
```

**Day 9-10: Crime Visualization**
```
AI Prompt:
"Create crime heat map overlay on ExecutiveSecurityMap using crimeIncidents 
data. Add filtering by crime type and date range. Display crime statistics 
dashboard per Section 5.3."
```

---

### Phase 3: OSINT & Threat Analysis (Week 3)

**Day 11-12: OSINT Framework**
```
AI Prompt:
"Build manual OSINT findings entry system. Create form for analysts to 
document findings per Section 6.1. Include source URL, exposure level 
classification, and screenshot upload. Display findings timeline."
```

**Day 13: Exposure Factor Calculation**
```
AI Prompt:
"Implement the Executive Protection Risk Engine from Section 7.1. Modify 
risk calculation to include Exposure (E) factor based on public profile, 
pattern predictability, and crime environment."
```

**Day 14: Executive Protection Report Template**
```
AI Prompt:
"Create Executive Protection PDF report template extending Section 8.3. 
Include: executive profile, interview summary, location analysis maps, 
crime environment assessment, OSINT findings, and recommendations."
```

---

### Integration Checklist

- [ ] Database schema extended with 8 new tables
- [ ] Executive interview questionnaire (40+ questions)
- [ ] Google Maps integration (geocoding, POI search, routing)
- [ ] CAP Index PDF import with AI parsing
- [ ] Crime heat map visualization
- [ ] Auto-population of emergency services
- [ ] Custom POI creation interface
- [ ] Travel route analysis
- [ ] OSINT findings management
- [ ] Modified risk engine with Exposure factor
- [ ] Executive protection report template
- [ ] Map-based report visualizations

---

## Appendix A: Sample Executive Protection Report Outline

```
EXECUTIVE PROTECTION SECURITY ASSESSMENT
[Executive Name] - Confidential

TABLE OF CONTENTS
1. Executive Summary
2. Methodology
3. Executive Profile & Threat Perception
4. Public Profile & Exposure Analysis
5. Geographic Threat Environment
   5.1 Primary Residence Analysis
   5.2 Workplace Security
   5.3 Travel Routes & Patterns
   5.4 Frequent Locations
6. Crime Data Analysis
   6.1 Neighborhood Crime Statistics
   6.2 Recent Incidents Near Residences
   6.3 Comparative Analysis
7. Emergency Response Capabilities
   7.1 Police Response Times
   7.2 Medical/Hospital Access
   7.3 Private Security Resources
8. OSINT Findings
   8.1 Digital Footprint Assessment
   8.2 Property Record Exposure
   8.3 Social Media Analysis
   8.4 News & Media Coverage
9. Threat Assessment
   9.1 Identified Threat Actors
   9.2 Vulnerability Analysis
   9.3 Risk Scenarios & Ratings
10. Current Security Posture
11. Recommendations
    11.1 Immediate Actions (0-30 days)
    11.2 Short-Term (30-90 days)
    11.3 Long-Term Strategic Measures
12. Appendices
    A. Interview Transcript
    B. Maps & Geographic Analysis
    C. Crime Data Details
    D. OSINT Source Documents
```

---

## Appendix B: Executive Protection Controls Library

**Add to controls seed data:**

```typescript
export const executiveProtectionControls = [
  {
    name: 'Executive Protection Detail - 24/7',
    category: 'personal_protection',
    controlType: 'preventive',
    description: 'Trained close protection officers providing continuous security.',
    baseWeight: 0.35,
    estimatedCost: 'high',
  },
  {
    name: 'Secure Driver Service',
    category: 'transportation',
    controlType: 'preventive',
    description: 'Professional driver with security training and defensive driving.',
    baseWeight: 0.20,
    estimatedCost: 'medium',
  },
  {
    name: 'Armored Vehicle',
    category: 'transportation',
    controlType: 'preventive',
    description: 'Ballistic-rated vehicle providing protection during transit.',
    baseWeight: 0.30,
    estimatedCost: 'high',
  },
  {
    name: 'Route Randomization Protocol',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Varying travel routes and timing to prevent pattern recognition.',
    baseWeight: 0.15,
    estimatedCost: 'low',
  },
  {
    name: 'Residential Security Team',
    category: 'security_personnel',
    controlType: 'preventive',
    description: 'On-site security at primary residence.',
    baseWeight: 0.30,
    estimatedCost: 'high',
  },
  {
    name: 'Panic Room with Communications',
    category: 'physical_barriers',
    controlType: 'preventive',
    description: 'Hardened safe room with independent power and communications.',
    baseWeight: 0.25,
    estimatedCost: 'high',
  },
  {
    name: 'Advanced CCTV with Off-Site Monitoring',
    category: 'surveillance',
    controlType: 'detective',
    description: 'High-resolution cameras with professional 24/7 monitoring.',
    baseWeight: 0.22,
    estimatedCost: 'medium',
  },
  {
    name: 'Threat Intelligence Monitoring',
    category: 'intelligence',
    controlType: 'detective',
    description: 'Ongoing monitoring of open-source intelligence for emerging threats.',
    baseWeight: 0.18,
    estimatedCost: 'medium',
  },
  {
    name: 'Digital Privacy Services',
    category: 'cyber_physical',
    controlType: 'preventive',
    description: 'Removal of personal information from public databases and websites.',
    baseWeight: 0.12,
    estimatedCost: 'medium',
  },
  {
    name: 'Family Security Training',
    category: 'procedural',
    controlType: 'preventive',
    description: 'Security awareness and response training for family members.',
    baseWeight: 0.15,
    estimatedCost: 'low',
  },
  {
    name: 'Executive Security App',
    category: 'technology',
    controlType: 'detective',
    description: 'Mobile app with panic button, GPS tracking, and direct security contact.',
    baseWeight: 0.18,
    estimatedCost: 'low',
  },
];
```

---

**END OF EXECUTIVE PROTECTION INTEGRATION DOCUMENT**

This document extends the RiskFixer Master Framework with comprehensive executive protection capabilities including interviews, geographic intelligence, crime data integration, and OSINT analysis.