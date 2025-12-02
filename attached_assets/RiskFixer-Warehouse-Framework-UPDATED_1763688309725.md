# RiskFixer: Warehouse & Distribution Center Security Assessment Framework
## Comprehensive Specification for Logistics Facility Security

**Version:** 2.0 - COMPREHENSIVE UPDATE  
**Integration Target:** RiskFixer Master Framework v2.1  
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
    
    // Inventory Management
    'warehouse_management_system',
    'cycle_counting_program',
    'high_value_inventory_caging',
    'lot_serial_tracking',
    'real_time_inventory_visibility',
    'exception_based_reporting',
    
    // Fleet Security
    'gps_tracking_fleet_vehicles',
    'vehicle_immobilization_system',
    'two_driver_rule_high_value_loads',
    'fuel_theft_prevention',
    
    // Surveillance
    'cctv_warehouse_interior',
    'cctv_high_value_storage',
    'cctv_yard',
    'video_retention_30_days',
    'video_analytics',
    
    // Personnel
    'employee_background_checks_all',
    'driver_background_checks',
    'security_awareness_training',
    'insider_threat_program',
    'theft_reporting_hotline',
    
    // Procedures
    'shipping_receiving_procedures',
    'dock_procedure_documentation',
    'load_verification_procedures',
    'manifest_verification',
    'cargo_theft_response_plan',
    'alarm_response_procedures',
    'key_control_system',
    
    // Physical Barriers
    'bollards_dock_area',
    'roll_up_door_locks',
    'interior_caging_high_value',
    'loading_dock_barriers',
    
    // Technology
    'rfid_inventory_tracking',
    'license_plate_recognition',
    'dock_scheduling_automation'
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

## 3-5. [Previous Sections Remain Unchanged]

[Sections 3, 4, and 5 remain as originally specified in the warehouse framework - Interview Protocol System, Risk Mapping & Calculation Integration, and Control Selection & Recommendations]

---

## 6. Implementation Workflow

### 6.1 Complete Assessment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: CREATE WAREHOUSE ASSESSMENT                        │
│ - Consultant selects "Warehouse" template                  │
│ - System creates assessment record                          │
│ - Warehouse facility zones auto-created:                    │
│   * Perimeter/Fence Line                                    │
│   * Main Gate/Entry                                         │
│   * Yard/Trailer Parking                                    │
│   * Loading Docks (multiple)                                │
│   * Warehouse Interior                                      │
│   * High-Value Storage Area                                 │
│   * Office Area                                             │
│   * Fleet Parking                                           │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: CONDUCT CARGO SECURITY INTERVIEW                   │
│ - 9 sections, 55+ questions                                 │
│ - Progressive disclosure for follow-ups                     │
│ - Real-time risk indicator highlighting:                    │
│   * "No CCTV on loading docks" → RED FLAG                   │
│   * "No seal verification" → RED FLAG                       │
│   * "History of cargo theft" → HIGH THREAT                  │
│   * "High-value goods without caging" → VULNERABILITY       │
│ - Shrinkage/loss rate calculation                           │
│ - Cargo theft incident history tracking                     │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: AUTO-GENERATE RISK SCENARIOS                       │
│ - System calculates T×V×I for 10-12 warehouse threats      │
│ - Threat Likelihood:                                        │
│   * Cargo theft history → increases likelihood             │
│   * Location crime data → adjusts threat level             │
│   * High-value goods presence → elevates threat            │
│ - Vulnerability:                                            │
│   * Missing dock controls → high vulnerability             │
│   * No GPS tracking → fleet vulnerability                  │
│   * Weak access control → insider threat vulnerability     │
│ - Impact:                                                   │
│   * Total inventory value → financial impact               │
│   * High-value product categories → loss potential         │
│   * Business disruption → operational impact               │
│ - Creates risk scenario records with zones                  │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: PHYSICAL WALKTHROUGH WITH AI PHOTO ANALYSIS        │
│ - Consultant photographs vulnerabilities:                   │
│   * Fence gaps or damage                                    │
│   * Unsecured loading docks                                 │
│   * Poor yard lighting                                      │
│   * Blind spots in surveillance                             │
│   * Parked trailers without kingpin locks                   │
│   * Open high-value storage areas                           │
│ - AI photo analysis identifies:                             │
│   * "Gap in perimeter fence - potential entry point"        │
│   * "Loading dock door open without truck present"          │
│   * "No visible CCTV coverage in yard area"                 │
│   * "Trailers parked without security measures"             │
│   * "Poor lighting creates concealment opportunities"       │
│ - Associates photos with risk scenarios automatically       │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: AI-GENERATED RISK NARRATIVES                       │
│ - System generates professional descriptions:               │
│   * "Loading Dock Breach" scenario:                         │
│     "The facility operates 12 loading docks handling 75+    │
│     trucks daily. Current vulnerabilities include lack of   │
│     CCTV coverage on 8 of 12 docks, no door sensors, and   │
│     informal seal verification procedures. This creates     │
│     significant opportunity for unauthorized cargo access." │
│ - Consultant reviews and refines AI-generated text          │
│ - Adds site-specific observations                           │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: SELECT CONTROLS & CALCULATE RESIDUAL RISK          │
│ - System recommends controls from interview gaps:           │
│   * Dock CCTV (missing) → Priority 1                        │
│   * GPS tracking (missing) → Priority 1                     │
│   * Kingpin locks (missing) → Priority 2                    │
│   * High-value caging (missing) → Priority 1                │
│ - Consultant selects applicable controls                    │
│ - Marks implementation status (existing/proposed)           │
│ - Sets fidelity for existing controls (25-100%)             │
│ - Real-time residual risk calculation updates               │
│ - ROI calculation shows risk reduction value                │
└─────────────────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: GENERATE PROFESSIONAL PDF REPORT                   │
│ - Executive summary with cargo theft vulnerability score    │
│ - Risk scenarios with AI-generated descriptions             │
│ - Photos with AI analysis annotations                       │
│ - Control recommendations with ROI justification            │
│ - Cargo theft prevention best practices                     │
│ - Industry benchmarking data                                │
│ - Implementation roadmap                                    │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Warehouse-Specific Workflow Enhancements

**Loading Dock Security Focus:**
- Dedicated dock-by-dock assessment capability
- Individual dock photo documentation
- Seal verification procedure evaluation
- Truck staging area analysis

**Cargo Theft Risk Scoring:**
- Automated cargo theft vulnerability score (1-100)
- Based on: location crime data, high-value goods, control gaps
- Industry benchmarking against similar facilities
- ROI calculator for theft prevention investments

**Fleet Management Integration:**
- GPS tracking status assessment
- Vehicle security control evaluation
- Driver vetting procedure review
- Hijacking risk evaluation

---

## 7. API Integration Specifications

### 7.1 Core API Endpoints

**Assessment Management:**
```typescript
// Create warehouse assessment
POST /api/assessments/create
{
  templateType: 'warehouse',
  siteName: 'ABC Distribution Center',
  address: {...},
  consultantId: 123
}

// Get assessment with interview responses
GET /api/assessments/[id]
Response: {
  assessment: {...},
  interviewResponses: {...},
  facilityZones: [...],
  riskScenarios: [...]
}

// Update assessment
PATCH /api/assessments/[id]
{
  status: 'in_progress' | 'interview_complete' | 'controls_complete' | 'finalized'
}
```

**Interview Management:**
```typescript
// Save interview responses
POST /api/assessments/[id]/interview/save
{
  section: 'loading_dock_security',
  responses: {
    dock_1: 'yes',
    dock_2: 'no',
    dock_3: 'partial',
    ...
  }
}

// Get interview progress
GET /api/assessments/[id]/interview/progress
Response: {
  totalQuestions: 55,
  answeredQuestions: 42,
  sectionsComplete: 7,
  sectionsTotal: 9,
  riskIndicatorCount: 8
}
```

**Risk Scenario Generation:**
```typescript
// Auto-generate risk scenarios from interview
POST /api/assessments/[id]/generate-risks
{
  useAI: true, // Generate narratives with GPT-4
  includePhotos: true
}

Response: {
  scenariosCreated: 12,
  highRiskCount: 3,
  mediumRiskCount: 6,
  lowRiskCount: 3
}

// Get risk scenario with calculations
GET /api/assessments/[id]/risk-scenarios/[scenarioId]
Response: {
  id: 456,
  threat: {...},
  threatLikelihood: 4,
  vulnerability: 7,
  impact: 8,
  inherentRisk: 224, // T×V×I
  riskLevel: 'high',
  description: "AI-generated narrative...",
  photos: [...],
  controls: [...],
  residualRisk: 89 // After controls
}
```

**AI Integration Endpoints:**
```typescript
// AI Photo Analysis
POST /api/photos/[photoId]/analyze
{
  context: 'warehouse_loading_dock',
  focusAreas: ['security_controls', 'vulnerabilities', 'access_points']
}

Response: {
  summary: "Loading dock with roll-up door open...",
  detectedObjects: ['trailer', 'forklift', 'dock door', 'no camera visible'],
  securityObservations: [
    "No visible CCTV coverage",
    "Dock door open without trailer present",
    "No access control visible"
  ],
  recommendations: [
    "Install CCTV camera with view of dock door",
    "Implement door sensor system",
    "Add access control for dock area"
  ],
  vulnerabilityScore: 8
}

// AI Narrative Generation
POST /api/risk-scenarios/[id]/generate-narrative
{
  includePhotos: true,
  includeStatistics: true,
  tone: 'professional' | 'technical' | 'executive'
}

Response: {
  description: "Professional narrative...",
  currentState: "Current conditions assessment...",
  vulnerabilityAnalysis: "Specific vulnerabilities identified...",
  potentialConsequences: "Impact analysis...",
  recommendations: "Control recommendations..."
}
```

**Control Management:**
```typescript
// Get recommended controls for risk scenario
GET /api/risk-scenarios/[id]/suggested-controls
Response: {
  gapBasedControls: [
    {
      control: {...},
      reason: "Interview responses indicate no CCTV on loading docks",
      priority: 1
    }
  ],
  threatBasedControls: [
    {
      control: {...},
      reason: "Highly effective against cargo theft",
      priority: 1
    }
  ]
}

// Add control to risk scenario
POST /api/risk-scenarios/[id]/controls/add
{
  controlId: 789,
  implementationStatus: 'proposed',
  fidelity: 85,
  estimatedCost: 50000,
  notes: "GPS tracking for all fleet vehicles"
}

// Bulk update control fidelity
PATCH /api/risk-scenarios/[id]/controls/bulk-update
{
  updates: [
    { controlId: 1, fidelity: 75 },
    { controlId: 2, fidelity: 90 }
  ]
}
```

**PDF Report Generation:**
```typescript
// Generate warehouse security report
POST /api/assessments/[id]/generate-report
{
  includeInterview: true,
  includePhotos: true,
  includeCargoTheftAnalysis: true,
  includeROICalculation: true,
  includeBenchmarking: true
}

Response: {
  reportUrl: '/reports/warehouse-assessment-123.pdf',
  pageCount: 45,
  generatedAt: '2025-11-20T10:30:00Z'
}
```

### 7.2 Data Flow Architecture

```
┌─────────────────┐
│   Frontend UI   │
│  (Next.js App)  │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  API Routes     │
│  (/api/...)     │
└────────┬────────┘
         │
         ├─────────────────┬──────────────────┬─────────────────┐
         │                 │                  │                 │
┌────────▼────────┐ ┌─────▼──────┐  ┌───────▼────────┐ ┌──────▼──────┐
│ Risk Calculation│ │AI Services │  │ PDF Generation │ │  Database   │
│     Engine      │ │  Module    │  │    Service     │ │ (Drizzle)   │
└─────────────────┘ └────┬───────┘  └────────────────┘ └─────────────┘
                         │
                    ┌────▼────┐
                    │ OpenAI  │
                    │GPT-4/4V │
                    └─────────┘
```

---

## 8. UI Components

### 8.1 Warehouse Assessment Dashboard

**Component:** `WarehouseAssessmentDashboard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, ShieldAlert, TrendingUp } from 'lucide-react';

export function WarehouseAssessmentDashboard({ assessment }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cargo Theft Risk</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">High</div>
            <p className="text-xs text-muted-foreground">Score: 78/100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Loading Docks</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Docks</div>
            <p className="text-xs text-muted-foreground">8 vulnerable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15.2M</div>
            <p className="text-xs text-muted-foreground">At risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shrinkage Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground">Above industry avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Interview Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Cargo Security Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Progress</span>
              <span className="text-sm font-medium">42/55 questions</span>
            </div>
            <Progress value={76} className="h-2" />
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="destructive">8 Red Flags</Badge>
              <Badge variant="outline">3 High-Value Areas</Badge>
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
              <span className="text-sm">No CCTV coverage on 8 of 12 loading docks</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">No GPS tracking on fleet vehicles</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">High-value goods stored without caging</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 8.2 Cargo Theft Interview Component

**Component:** `CargoSecurityInterview.tsx`

**Features:**
- Progressive disclosure with conditional follow-ups
- Real-time risk indicator highlighting
- Auto-save every 30 seconds
- Section-by-section navigation
- Visual progress tracking
- Dock-by-dock assessment capability

**Risk Indicator Logic:**
```typescript
function evaluateRiskIndicators(questionId: string, response: any): RiskFlag {
  const criticalResponses = {
    // Loading Dock Security
    dock_2: { value: 'no', flag: 'No CCTV on loading docks', severity: 'critical' },
    dock_3: { value: 'no', flag: 'No door sensors on docks', severity: 'high' },
    dock_4: { value: ['no seal', 'informal'], flag: 'No seal verification', severity: 'critical' },
    
    // Inventory Control
    inventory_3: { value: 'no', flag: 'High-value goods not caged', severity: 'critical' },
    inventory_1: { value: 'no', flag: 'No WMS system', severity: 'high' },
    
    // Fleet Security
    fleet_2: { value: 'no', flag: 'No GPS tracking', severity: 'critical' },
    
    // Personnel
    personnel_1: { value: ['no background'], flag: 'No employee background checks', severity: 'high' }
  };

  if (criticalResponses[questionId]) {
    const indicator = criticalResponses[questionId];
    if (
      indicator.value === response ||
      (Array.isArray(indicator.value) && indicator.value.some(v => response.includes(v)))
    ) {
      return {
        show: true,
        message: indicator.flag,
        severity: indicator.severity
      };
    }
  }

  return { show: false };
}
```

### 8.3 Loading Dock Assessment Grid

**Component:** `LoadingDockGrid.tsx`

**Visual dock-by-dock assessment:**
- Grid layout showing all docks
- Color-coded by security level (green/yellow/red)
- Click to view/edit dock details
- Photo attachment per dock
- Individual control checklist

```typescript
export function LoadingDockGrid({ assessment }) {
  const docks = assessment.loadingDocks || [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {docks.map((dock) => (
        <Card 
          key={dock.id}
          className={cn(
            "cursor-pointer hover:shadow-lg transition-shadow",
            dock.securityScore >= 80 && "border-green-500",
            dock.securityScore >= 50 && dock.securityScore < 80 && "border-yellow-500",
            dock.securityScore < 50 && "border-red-500"
          )}
          onClick={() => openDockDetails(dock)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dock {dock.number}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Security:</span>
                <Badge variant={dock.securityScore < 50 ? 'destructive' : 'default'}>
                  {dock.securityScore}%
                </Badge>
              </div>
              <div className="flex gap-1 flex-wrap">
                {dock.hasCCTV && <Badge variant="outline" className="text-xs">CCTV</Badge>}
                {dock.hasSensor && <Badge variant="outline" className="text-xs">Sensor</Badge>}
                {dock.hasAlarm && <Badge variant="outline" className="text-xs">Alarm</Badge>}
              </div>
              {dock.photoCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  {dock.photoCount} photos
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 8.4 AI Photo Analysis Display

**Component:** `WarehousePhotoAnalysis.tsx`

**Enhanced for warehouse contexts:**
- Dock vulnerability detection
- Fence gap identification
- Trailer security assessment
- Yard lighting analysis
- Access control verification

```typescript
export function WarehousePhotoAnalysis({ photo, analysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Security Analysis</span>
          <Badge variant="outline">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Photo */}
          <div className="relative">
            <img src={photo.url} alt={photo.caption} className="rounded-lg" />
            {analysis.vulnerabilityScore >= 7 && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                High Risk
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

### 8.5 Cargo Theft ROI Calculator

**Component:** `CargoTheftROICalculator.tsx`

**Calculates ROI for theft prevention investments:**

```typescript
export function CargoTheftROICalculator({ assessment, proposedControls }) {
  // Current state calculations
  const annualShrinkage = assessment.inventoryValue * (assessment.shrinkageRate / 100);
  const cargoTheftIncidents = assessment.cargoTheftHistory.length;
  const avgTheftLoss = assessment.cargoTheftHistory.reduce((sum, incident) => sum + incident.loss, 0) / cargoTheftIncidents;
  const projectedAnnualLoss = annualShrinkage + (avgTheftLoss * (cargoTheftIncidents > 0 ? cargoTheftIncidents : 1));

  // Calculate risk reduction from proposed controls
  const totalReduction = proposedControls.reduce((sum, control) => {
    return sum + (control.reductionPercentage / 100);
  }, 0);

  const projectedAnnualSavings = projectedAnnualLoss * Math.min(totalReduction, 0.85); // Cap at 85% reduction
  const totalImplementationCost = proposedControls.reduce((sum, c) => sum + c.estimatedCost, 0);
  const paybackPeriod = totalImplementationCost / projectedAnnualSavings;
  const threeYearROI = ((projectedAnnualSavings * 3) - totalImplementationCost) / totalImplementationCost * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargo Theft Prevention ROI Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current State */}
          <div>
            <h4 className="font-medium mb-2">Current Annual Loss Exposure</h4>
            <div className="text-3xl font-bold text-red-600">
              ${projectedAnnualLoss.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {assessment.shrinkageRate}% shrinkage rate and cargo theft history
            </p>
          </div>

          {/* Proposed Controls */}
          <div>
            <h4 className="font-medium mb-2">Proposed Security Investment</h4>
            <div className="text-2xl font-bold">
              ${totalImplementationCost.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {proposedControls.length} controls, {(totalReduction * 100).toFixed(0)}% risk reduction
            </p>
          </div>

          {/* Projected Savings */}
          <div>
            <h4 className="font-medium mb-2">Projected Annual Savings</h4>
            <div className="text-3xl font-bold text-green-600">
              ${projectedAnnualSavings.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Through reduced cargo theft and shrinkage
            </p>
          </div>

          {/* ROI Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Payback Period</div>
              <div className="text-xl font-bold">
                {paybackPeriod.toFixed(1)} years
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">3-Year ROI</div>
              <div className="text-xl font-bold text-green-600">
                {threeYearROI.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Industry Benchmark */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Industry Benchmark</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your shrinkage rate:</span>
                <span className="font-medium">{assessment.shrinkageRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Industry average:</span>
                <span>1.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best-in-class:</span>
                <span>0.8%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 9. PDF Report Template

### 9.1 Warehouse Security Report Structure

**Template File:** `server/templates/warehouse-security-report.tsx`

**Report Sections:**

```typescript
interface WarehouseSecurityReport {
  // Cover Page
  facilityName: string;
  address: string;
  assessmentDate: Date;
  consultantName: string;
  cargoTheftVulnerabilityScore: number; // 1-100

  // Executive Summary (2-3 pages)
  executiveSummary: {
    facilityOverview: string;
    keyFindings: string[];
    criticalVulnerabilities: string[];
    cargoTheftRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendedInvestment: number;
    projectedROI: number;
    topPriorities: string[];
  };

  // Facility Profile (1-2 pages)
  facilityProfile: {
    warehouseType: string;
    squareFootage: number;
    inventoryValue: number;
    employeeCount: number;
    operatingHours: string;
    highValueProducts: string[];
    loadingDockCount: number;
    dailyTruckVolume: number;
  };

  // Cargo Theft Analysis (3-4 pages)
  cargoTheftAnalysis: {
    incidentHistory: {
      fullTruckloadThefts: number;
      pilferageIncidents: number;
      totalLosses: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    };
    vulnerabilityAssessment: {
      dockSecurity: { score: number; findings: string[] };
      yardSecurity: { score: number; findings: string[] };
      accessControl: { score: number; findings: string[] };
      inventoryControl: { score: number; findings: string[] };
    };
    threatProfile: {
      mostLikelyThreats: Array<{ threat: string; likelihood: number; impact: number }>;
      locationRisk: string;
      seasonalFactors: string[];
    };
  };

  // Interview Summary (3-4 pages)
  interviewSummary: {
    sectionsCompleted: number;
    totalQuestions: number;
    redFlags: Array<{ question: string; response: string; concern: string }>;
    strengthsIdentified: string[];
    gapsIdentified: string[];
  };

  // Risk Scenarios (10-15 pages)
  riskScenarios: Array<{
    threat: string;
    description: string; // AI-generated
    likelihood: number;
    vulnerability: number;
    impact: number;
    inherentRisk: number;
    riskLevel: string;
    photos: Array<{ url: string; caption: string; aiAnalysis?: string }>;
    currentControls: Array<{ name: string; effectiveness: number }>;
    proposedControls: Array<{ name: string; cost: number; reduction: number }>;
    residualRisk: number;
  }>;

  // Loading Dock Security Analysis (2-3 pages)
  loadingDockAnalysis: {
    dockCount: number;
    secureDoorsCount: number;
    vulnerableDoorsCount: number;
    dockDetails: Array<{
      dockNumber: number;
      securityScore: number;
      cctvPresent: boolean;
      sensorPresent: boolean;
      alarmPresent: boolean;
      findings: string[];
      photos: string[];
    }>;
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
    currentAnnualLoss: number;
    proposedInvestment: number;
    projectedAnnualSavings: number;
    paybackPeriod: number;
    threeYearROI: number;
    comparison: {
      industryAverage: number;
      bestInClass: number;
      currentPerformance: number;
    };
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
    industryBestPractices: string[];
    cargoTheftStatistics: any;
    complianceRequirements: string[];
  };
}
```

### 9.2 Cargo Theft Vulnerability Scoring Algorithm

**Displayed prominently in executive summary:**

```typescript
function calculateCargoTheftVulnerabilityScore(assessment: Assessment): number {
  let score = 0;
  const maxScore = 100;

  // Location Risk (20 points)
  const locationRisk = getLocationCargoTheftRate(assessment.address);
  score += (locationRisk / 5) * 20; // Scale 1-5 rating to 20 points

  // High-Value Goods (15 points)
  if (assessment.highValueProducts.includes('electronics')) score += 5;
  if (assessment.highValueProducts.includes('pharmaceuticals')) score += 5;
  if (assessment.highValueProducts.includes('alcohol')) score += 3;
  if (assessment.highValueProducts.includes('designer_clothing')) score += 2;

  // Control Gaps (35 points)
  const criticalControls = [
    { id: 'loading_dock_cctv', weight: 10 },
    { id: 'gps_tracking', weight: 8 },
    { id: 'gate_access_control', weight: 7 },
    { id: 'high_value_caging', weight: 5 },
    { id: 'seal_verification', weight: 5 }
  ];

  criticalControls.forEach(control => {
    if (!hasControl(assessment, control.id)) {
      score += control.weight;
    }
  });

  // Incident History (20 points)
  const incidents = assessment.cargoTheftIncidents || [];
  if (incidents.length > 0) {
    score += Math.min(incidents.length * 4, 20);
  }

  // Operational Vulnerabilities (10 points)
  if (assessment.operatingHours === '24/7') score += 3;
  if (assessment.dailyTruckVolume > 75) score += 3;
  if (assessment.employeeCount > 150) score += 2;
  if (!assessment.hasDriverVetting) score += 2;

  return Math.min(score, maxScore);
}

// Risk Level Classification
function classifyCargoTheftRisk(score: number): string {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}
```

### 9.3 Report Generation with AI Enhancements

**Service:** `server/services/warehouse-report-generator.ts`

```typescript
export async function generateWarehouseSecurityReport(
  assessmentId: number,
  options: ReportOptions
): Promise<string> {
  // 1. Fetch all assessment data
  const assessment = await getAssessmentWithRelations(assessmentId);
  const riskScenarios = await getRiskScenarios(assessmentId);
  const photos = await getPhotos(assessmentId);
  const controls = await getControls(assessmentId);

  // 2. Generate AI narratives if requested
  if (options.useAI) {
    for (const scenario of riskScenarios) {
      if (!scenario.description || options.regenerateNarratives) {
        scenario.description = await generateRiskNarrative(scenario, assessment);
      }
    }
  }

  // 3. Calculate scores and metrics
  const cargoTheftScore = calculateCargoTheftVulnerabilityScore(assessment);
  const roiAnalysis = calculateROI(assessment, controls);
  const dockAnalysis = analyzeDockSecurity(assessment);

  // 4. Compile report data
  const reportData: WarehouseSecurityReport = {
    facilityName: assessment.site.name,
    cargoTheftVulnerabilityScore: cargoTheftScore,
    executiveSummary: generateExecutiveSummary(assessment, riskScenarios, roiAnalysis),
    facilityProfile: extractFacilityProfile(assessment),
    cargoTheftAnalysis: analyzeCargoTheft(assessment, riskScenarios),
    interviewSummary: summarizeInterview(assessment.interviewResponses),
    riskScenarios: riskScenarios,
    loadingDockAnalysis: dockAnalysis,
    controlRecommendations: prioritizeRecommendations(controls, roiAnalysis),
    roiAnalysis: roiAnalysis,
    implementationRoadmap: createImplementationRoadmap(controls),
    appendices: compileAppendices(assessment)
  };

  // 5. Render PDF using Puppeteer
  const html = await renderReportTemplate(reportData);
  const pdfBuffer = await generatePDF(html, options);

  // 6. Save and return
  const pdfPath = await savePDF(pdfBuffer, assessmentId);
  return pdfPath;
}
```

### 9.4 Visual Elements in Report

**Key visual components:**

1. **Cargo Theft Vulnerability Meter** (cover page)
   - Speedometer-style gauge showing 0-100 score
   - Color-coded zones: green (0-25), yellow (26-50), orange (51-75), red (76-100)

2. **Loading Dock Security Heat Map** (dock analysis section)
   - Visual grid of all docks
   - Color-coded by security score
   - Icons showing CCTV/sensor/alarm presence

3. **Risk Matrix** (risk scenarios section)
   - Heat map plotting all threats by T×V
   - Before/after view showing residual risk reduction

4. **ROI Timeline Chart** (ROI section)
   - Bar chart showing investment vs. savings over 3 years
   - Break-even point highlighted

5. **Zone-Based Photo Documentation**
   - Organized by facility zone (perimeter, docks, yard, interior)
   - AI analysis annotations overlaid on photos

---

## 10. Implementation Roadmap

### 10.1 17-Day Development Sprint

**Pre-Development (Day 0):**
```
Tasks:
- Review complete warehouse framework document
- Set up Replit environment with PostgreSQL
- Create project structure
- Install dependencies (Drizzle, OpenAI SDK, Puppeteer, etc.)
```

---

### **Week 1: Foundation & Interview System (Days 1-7)**

#### **Day 1-2: Database Schema & Seed Data**
**AI Prompt (Day 1):**
```
Create warehouse-specific database tables extending master schema:
1. Add warehouseProfile to assessments table (JSON column):
   - warehouseType, squareFootage, inventoryValue
   - highValueProducts[], loadingDockCount, dailyTruckVolume
   - shrinkageRate, cargoTheftIncidents[]
2. Add loadingDocks table:
   - id, assessmentId, dockNumber, securityScore
   - hasCCTV, hasSensor, hasAlarm, photoIds[]
3. Generate migration file
4. Apply schema changes
```

**AI Prompt (Day 2):**
```
Create seed data for warehouse template:
1. 12 warehouse-specific threats with likelihood/impact defaults
2. 60+ warehouse controls (perimeter, dock, fleet, inventory)
3. Create 'warehouse' template with threat/control associations
4. Add sample facility zones (8 zones)
5. Run seed script
```

**Tasks:**
- [ ] Extend database schema
- [ ] Create warehouse threats/controls seed data
- [ ] Test seed script
- [ ] Verify data in database

---

#### **Day 3-5: Cargo Security Interview System**
**AI Prompt (Day 3):**
```
Create warehouse interview questionnaire data file:
server/data/warehouse-interview-questionnaire.ts

Include all 9 sections with 55+ questions:
1. Facility & Operations Profile (7 questions)
2. Cargo Theft & Incident History (8 questions)
3. Loading Dock Security (10 questions)
4. Inventory Control & Shrinkage (7 questions)
5. Perimeter & Yard Security (7 questions)
6. Personnel & Access Control (8 questions)
7. Fleet & Vehicle Security (5 questions)
8. Surveillance Systems (4 questions)
9. Emergency Response & Procedures (4 questions)

Each question must have:
- informsThreat, informsVulnerability, informsImpact mappings
- riskIndicators for red flags
- followUpQuestions for progressive disclosure
```

**AI Prompt (Day 4):**
```
Create interview UI component:
app/assessments/[id]/interview/page.tsx

Features:
1. Section-by-section navigation
2. Question type rendering (text, multiple_choice, yes_no, checklist, number)
3. Progressive disclosure for follow-ups
4. Real-time risk indicator highlighting:
   - "No CCTV on docks" → RED FLAG badge
   - "No GPS tracking" → RED FLAG badge
   - "High-value goods present" → INFO badge
5. Auto-save every 30 seconds
6. Progress tracking with visual indicator
7. Dock-by-dock sub-assessment capability
```

**AI Prompt (Day 5):**
```
Create API routes for interview management:
1. POST /api/assessments/[id]/interview/save
   - Validate and save responses
   - Update progress tracking
   - Identify risk indicators
2. GET /api/assessments/[id]/interview/progress
   - Calculate completion percentage
   - Count red flags
   - List critical gaps
3. POST /api/assessments/[id]/loading-docks/create
   - Create individual dock records
   - Associate photos with specific docks
```

**Tasks:**
- [ ] Create interview questionnaire data
- [ ] Build interview UI with conditional logic
- [ ] Implement auto-save functionality
- [ ] Create loading dock sub-assessment
- [ ] Test all question types

---

#### **Day 6-7: Risk Mapping & Auto-Generation**
**AI Prompt (Day 6):**
```
Create warehouse risk mapping service:
server/services/warehouse-risk-mapper.ts

Implement algorithms from Section 4:
1. calculateThreatLikelihood(threat, responses)
   - Use incident history from responses
   - Adjust for location crime data
   - Factor in high-value product presence
2. calculateVulnerability(threat, responses)
   - Analyze control gaps from interview
   - Calculate dock security score
   - Evaluate access control weaknesses
3. calculateImpact(threat, responses)
   - Use inventory value and shrinkage rate
   - Factor in business disruption potential
   - Consider regulatory implications
```

**AI Prompt (Day 7):**
```
Create risk scenario auto-generation endpoint:
POST /api/assessments/[id]/generate-risks

Process:
1. Fetch interview responses
2. Calculate T, V, I for each warehouse threat
3. Create risk scenario records
4. Associate with relevant facility zones
5. Mark control gaps
6. Return summary with risk distribution
```

**Tasks:**
- [ ] Implement risk mapping algorithms
- [ ] Create auto-generation service
- [ ] Test T×V×I calculations
- [ ] Verify scenario creation

---

### **Week 2: AI Integration & Controls (Days 8-14)**

#### **Day 8-9: AI Photo Analysis for Warehouse**
**AI Prompt (Day 8):**
```
Create warehouse-specific photo analysis service:
server/services/warehouse-photo-analysis.ts

Use OpenAI GPT-4 Vision with warehouse-specific prompts:
1. Loading dock analysis:
   - Detect CCTV cameras
   - Identify dock doors (open/closed)
   - Check for access control
   - Assess lighting conditions
   - Note trailer seal visibility
2. Perimeter analysis:
   - Detect fence condition and gaps
   - Identify gate access systems
   - Assess lighting coverage
   - Note vegetation or obstructions
3. Yard analysis:
   - Count parked trailers
   - Check for kingpin locks
   - Assess surveillance coverage
   - Note security presence
4. Interior analysis:
   - Identify high-value storage areas
   - Check for caging/barriers
   - Assess CCTV coverage
   - Note access control points

Return JSON with:
- summary
- detectedObjects[]
- securityObservations[]
- recommendations[]
- vulnerabilityScore (1-10)
```

**AI Prompt (Day 9):**
```
Create photo analysis UI component:
components/WarehousePhotoAnalysis.tsx

Features:
1. "Analyze with AI" button on photo upload
2. Context selection (dock, perimeter, yard, interior)
3. Loading state during analysis
4. Display AI results in expandable card
5. Dock-specific annotations for dock photos
6. Link to relevant risk scenarios
7. Edit/override AI observations
8. Batch analysis capability
```

**Tasks:**
- [ ] Implement warehouse photo analysis service
- [ ] Create specialized prompts for each zone type
- [ ] Build photo analysis UI
- [ ] Test with sample warehouse photos
- [ ] Optimize API costs

---

#### **Day 10-11: AI Narrative Generation**
**AI Prompt (Day 10):**
```
Create narrative generation service:
server/services/warehouse-narrative-generator.ts

Generate professional risk narratives:
1. Risk description (2-3 paragraphs)
   - Explain the threat in warehouse context
   - Reference interview findings
   - Cite industry statistics
2. Current state analysis (2-3 paragraphs)
   - Describe existing conditions
   - Identify vulnerabilities
   - Reference photos with AI analysis
3. Potential consequences (1-2 paragraphs)
   - Financial impact estimation
   - Business disruption scenarios
   - Regulatory implications
4. Control recommendations (2-3 paragraphs)
   - Suggested controls with rationale
   - Implementation priorities
   - ROI justification

Use GPT-4 with structured prompts and cargo theft domain knowledge.
```

**AI Prompt (Day 11):**
```
Create narrative generation UI:
1. "Generate with AI" button on risk scenarios
2. Tone selection (professional/technical/executive)
3. Include/exclude options (photos, statistics, ROI)
4. Loading state with progress indicator
5. Side-by-side editor for refinement
6. Save/regenerate functionality
7. Batch generation for all scenarios
```

**Tasks:**
- [ ] Implement narrative generation service
- [ ] Create structured prompts
- [ ] Build narrative UI
- [ ] Test with various risk scenarios
- [ ] Refine prompt engineering

---

#### **Day 12-13: Control Selection & ROI Calculator**
**AI Prompt (Day 12):**
```
Implement control recommendation engine:
server/services/warehouse-control-recommender.ts

Use algorithms from Section 5:
1. analyzeInterviewGaps() - identify missing controls
2. mapThreatsToControls() - threat-based recommendations
3. prioritizeByROI() - calculate risk reduction value
4. generateRecommendations() - return prioritized list

Also implement:
- CargoTheftROICalculator component
- Calculate payback period
- Industry benchmarking
- 3-year ROI projection
```

**AI Prompt (Day 13):**
```
Create control selection interface:
app/assessments/[id]/controls/page.tsx

Features:
1. Suggested controls from interview (gap-based)
2. Threat-based control recommendations
3. Search/filter controls library
4. Add controls to risk scenarios
5. Set implementation status (existing/proposed)
6. Fidelity slider for existing controls
7. Estimated cost input
8. Real-time residual risk calculation
9. ROI calculator integration
10. Bulk actions (add to multiple scenarios)
```

**Tasks:**
- [ ] Implement control recommendation engine
- [ ] Create ROI calculator
- [ ] Build control selection UI
- [ ] Test residual risk calculations
- [ ] Verify ROI accuracy

---

#### **Day 14: Loading Dock Grid & Dashboard**
**AI Prompt:**
```
Create warehouse-specific UI components:

1. LoadingDockGrid component (Section 8.3)
   - Grid layout of all docks
   - Color-coded by security score
   - Click to view/edit details
   - Photo attachment per dock

2. WarehouseAssessmentDashboard (Section 8.1)
   - Cargo theft risk score
   - Loading dock vulnerabilities
   - Inventory value at risk
   - Shrinkage rate comparison
   - Critical findings list
   - Interview progress

3. CargoTheftAnalysisCard
   - Incident history timeline
   - Vulnerability heat map
   - Threat profile
```

**Tasks:**
- [ ] Build dock grid component
- [ ] Create warehouse dashboard
- [ ] Add cargo theft analysis
- [ ] Test interactive elements

---

### **Week 3: PDF Reports & Testing (Days 15-17)**

#### **Day 15-16: PDF Report Generation**
**AI Prompt (Day 15):**
```
Create warehouse PDF report template:
server/templates/warehouse-security-report.tsx

Use structure from Section 9.1:
1. Cover page with cargo theft vulnerability score
2. Executive summary (2-3 pages)
3. Facility profile (1-2 pages)
4. Cargo theft analysis (3-4 pages)
5. Interview summary (3-4 pages)
6. Risk scenarios (10-15 pages)
7. Loading dock analysis (2-3 pages)
8. Control recommendations (4-5 pages)
9. ROI analysis (2-3 pages)
10. Implementation roadmap (2 pages)
11. Appendices

Include visual elements:
- Cargo theft vulnerability meter
- Loading dock heat map
- Risk matrix
- ROI timeline chart
- Zone-based photo documentation
```

**AI Prompt (Day 16):**
```
Implement report generation service:
server/services/warehouse-report-generator.ts

Process:
1. Fetch all assessment data
2. Generate AI narratives (if requested)
3. Calculate cargo theft score
4. Analyze loading dock security
5. Calculate ROI metrics
6. Compile report data structure
7. Render HTML template
8. Generate PDF with Puppeteer
9. Save and return path

API endpoint: POST /api/assessments/[id]/generate-report
```

**Tasks:**
- [ ] Create report template
- [ ] Implement visual elements
- [ ] Build report generator service
- [ ] Test PDF generation
- [ ] Optimize layout and styling

---

#### **Day 17: End-to-End Testing & Polish**
**AI Prompt:**
```
Create comprehensive test suite:
1. Create test warehouse assessment
2. Complete full 55-question interview
3. Verify risk auto-generation
4. Upload and analyze photos (all zones)
5. Generate AI narratives
6. Select controls and verify ROI
7. Generate PDF report
8. Review for accuracy and completeness

Also:
- Performance optimization
- Mobile responsiveness check
- Error handling verification
- Create demo video/tutorial
```

**Tasks:**
- [ ] Complete end-to-end workflow test
- [ ] Fix bugs and edge cases
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Create sample assessment for demos

---

### 10.2 Integration Checklist

**Before Launch:**
- [ ] Warehouse interview questionnaire (9 sections, 55+ questions)
- [ ] Interview UI with progressive disclosure and risk indicators
- [ ] Loading dock grid component
- [ ] Auto-save functionality
- [ ] Risk mapping algorithms (T×V×I for warehouse threats)
- [ ] Auto-generation of 10-12 risk scenarios
- [ ] AI photo analysis (warehouse-specific contexts)
- [ ] AI narrative generation (cargo theft focus)
- [ ] Control recommendation engine
- [ ] Cargo theft ROI calculator
- [ ] Loading dock security analysis
- [ ] Warehouse assessment dashboard
- [ ] Complete PDF report template
- [ ] Visual elements (vulnerability meter, heat maps, charts)
- [ ] Industry benchmarking integration
- [ ] End-to-end testing completed
- [ ] Demo assessment created

---

## Conclusion

This comprehensive Warehouse & Distribution Center Security Assessment Framework provides a complete, interview-driven methodology that:

1. **Captures detailed logistics facility information** through 55+ structured questions across 9 sections
2. **Automatically calculates risk** using the T×V×I formula based on interview responses, with special focus on cargo theft vulnerability
3. **Leverages AI for insights** through intelligent photo analysis and professional narrative generation
4. **Maps vulnerabilities to controls** with cargo theft-focused recommendations and ROI justification
5. **Generates professional reports** with cargo theft analysis, loading dock security assessment, and industry benchmarking
6. **Integrates seamlessly** with the RiskFixer Master Framework v2.1

The system transforms warehouse security consulting from subjective assessments into data-driven, audit-defensible evaluations with particular emphasis on the #1 threat facing logistics facilities: cargo theft.

**Key Differentiators:**
- **Cargo theft vulnerability scoring** - Quantitative 0-100 score for executive decision-making
- **Loading dock security analysis** - Dock-by-dock assessment with visual heat mapping
- **ROI calculator** - Justified investments in theft prevention with payback analysis
- **Supply chain focus** - Driver vetting, seal verification, fleet tracking evaluation
- **Industry benchmarking** - Compare shrinkage rates and security posture

This framework establishes RiskFixer as the premier tool for warehouse and distribution center security assessments.

---

**END OF COMPREHENSIVE WAREHOUSE FRAMEWORK DOCUMENT v2.0**
