# RiskFixer: Retail Store Security Assessment Framework
## Comprehensive Specification for Retail Facility Security

**Version:** 2.0 - COMPREHENSIVE UPDATE  
**Integration Target:** RiskFixer Master Framework v2.1  
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

## 1-6. [Previous Sections]

**Note:** Sections 1-6 remain as originally specified in the Retail Store Framework, covering:
- Section 1: Retail Store Assessment Overview
- Section 2: Assessment Template Specifications
- Section 3: Interview Protocol System (11 sections, 70+ questions)
- Section 4: Risk Mapping & Calculation Integration
- Section 5: Control Selection & Recommendations  
- Section 6: Implementation Workflow (7-step process)

---

## 7. API Integration Specifications

### 7.1 Core API Endpoints

**Assessment Management:**
```typescript
// Create retail store assessment
POST /api/assessments/create
{
  templateType: 'retail_store',
  siteName: 'Fashion Boutique Downtown',
  address: {...},
  consultantId: 123
}

// Get assessment with retail-specific data
GET /api/assessments/[id]
Response: {
  assessment: {...},
  interviewResponses: {...},
  facilityZones: [...],
  riskScenarios: [...],
  shrinkageAnalysis: {
    currentRate: 2.8,
    industryAverage: 1.5,
    annualLoss: 168000,
    breakdown: {
      shoplifting: 45,
      employeeTheft: 35,
      administrative: 15,
      vendorFraud: 5
    }
  }
}
```

**Interview Management:**
```typescript
// Save retail interview responses
POST /api/assessments/[id]/interview/save
{
  section: 'merchandise_protection',
  responses: {
    merch_1: 'yes',
    merch_2: ['electronics', 'cosmetics', 'designer_apparel'],
    merch_3: 'no',
    ...
  }
}

// Get interview progress with retail-specific risk indicators
GET /api/assessments/[id]/interview/progress
Response: {
  totalQuestions: 70,
  answeredQuestions: 58,
  sectionsComplete: 9,
  sectionsTotal: 11,
  riskIndicatorCount: 14,
  criticalGaps: [
    "No EAS system present",
    "Shrinkage rate above 3%",
    "No CCTV on POS registers",
    "Cash not counted before/after shift"
  ],
  shrinkageRiskScore: 78 // 0-100
}
```

**Risk Scenario Generation:**
```typescript
// Auto-generate retail risk scenarios
POST /api/assessments/[id]/generate-risks
{
  useAI: true,
  includePhotos: true,
  includeShrinkageAnalysis: true
}

Response: {
  scenariosCreated: 12,
  criticalRiskCount: 2,
  highRiskCount: 5,
  mediumRiskCount: 4,
  lowRiskCount: 1,
  shrinkageRiskLevel: 'HIGH',
  estimatedAnnualLoss: 168000,
  topThreats: [
    { threat: 'shoplifting_orc', riskScore: 245 },
    { threat: 'employee_theft', riskScore: 189 },
    { threat: 'armed_robbery', riskScore: 156 }
  ]
}
```

**AI Integration Endpoints:**
```typescript
// AI Photo Analysis (Retail Context)
POST /api/photos/[photoId]/analyze
{
  context: 'retail_sales_floor',
  focusAreas: [
    'merchandise_visibility',
    'blind_spots',
    'eas_coverage',
    'surveillance_coverage',
    'cpted_principles'
  ]
}

Response: {
  summary: "Sales floor showing clothing displays and checkout area...",
  detectedObjects: [
    'clothing_racks',
    'checkout_counter',
    'eas_gates',
    'security_mirrors',
    'no_camera_visible_this_area'
  ],
  securityObservations: [
    "High-value merchandise near exit without EAS tags",
    "Blind spots behind clothing racks",
    "No direct sightline to dressing rooms",
    "POS register not covered by CCTV",
    "Cash drawer visible to customers"
  ],
  shrinkageRisks: [
    "Easy concealment opportunities in blind spots",
    "High-value items not secured",
    "No employee visibility of fitting rooms"
  ],
  recommendations: [
    "Install CCTV camera covering POS area",
    "Add convex mirrors to eliminate blind spots",
    "Install EAS tags on high-value merchandise",
    "Reposition displays for better sightlines",
    "Add fitting room attendant station"
  ],
  vulnerabilityScore: 7
}

// AI Narrative Generation (Retail-Specific)
POST /api/risk-scenarios/[id]/generate-narrative
{
  includePhotos: true,
  includeShrinkageImpact: true,
  includeROI: true,
  tone: 'professional'
}

Response: {
  description: "Professional retail risk narrative...",
  currentState: "Current loss prevention posture...",
  vulnerabilityAnalysis: "Specific retail vulnerabilities...",
  shrinkageImpact: "Annual loss estimation and breakdown...",
  employeeTheftIndicators: "Red flags for internal theft...",
  potentialConsequences: "Financial and operational impact...",
  recommendations: "Retail-specific control recommendations..."
}
```

**Shrinkage Analysis Endpoints:**
```typescript
// Calculate shrinkage risk score
GET /api/assessments/[id]/shrinkage-analysis
Response: {
  currentShrinkageRate: 2.8,
  industryAverage: 1.5,
  riskLevel: 'HIGH',
  annualRevenue: 6000000,
  estimatedAnnualLoss: 168000,
  breakdown: {
    shoplifting: { percentage: 45, amount: 75600 },
    employeeTheft: { percentage: 35, amount: 58800 },
    administrativeError: { percentage: 15, amount: 25200 },
    vendorFraud: { percentage: 5, amount: 8400 }
  },
  trendAnalysis: {
    lastQuarter: 2.5,
    thisQuarter: 2.8,
    trend: 'INCREASING',
    percentageChange: 12
  },
  vulnerabilityFactors: [
    'No EAS system',
    'Limited CCTV coverage',
    'High employee turnover',
    'Inadequate inventory controls'
  ]
}

// Calculate loss prevention ROI
POST /api/assessments/[id]/loss-prevention-roi
{
  proposedControls: [
    { controlId: 123, estimatedCost: 15000 },
    { controlId: 124, estimatedCost: 8000 }
  ]
}

Response: {
  totalInvestment: 23000,
  currentAnnualLoss: 168000,
  projectedShrinkageReduction: 45, // percentage
  projectedAnnualSavings: 75600,
  paybackPeriod: 0.3, // years (3.6 months)
  threeYearROI: 883, // percentage
  breakdown: [
    {
      control: 'EAS System',
      cost: 15000,
      shrinkageReduction: 30,
      annualSavings: 50400,
      payback: 0.3
    },
    {
      control: 'CCTV Expansion',
      cost: 8000,
      shrinkageReduction: 15,
      annualSavings: 25200,
      payback: 0.32
    }
  ]
}
```

**Control Management:**
```typescript
// Get recommended controls for retail risk
GET /api/risk-scenarios/[id]/suggested-controls
Response: {
  gapBasedControls: [
    {
      control: {
        id: 123,
        name: 'EAS System - Full Coverage',
        category: 'Merchandise Protection',
        estimatedCost: 15000
      },
      reason: "Interview indicates no EAS system present",
      priority: 1,
      shrinkageReduction: 30
    },
    {
      control: {
        id: 124,
        name: 'CCTV - POS & Sales Floor',
        category: 'Surveillance',
        estimatedCost: 8000
      },
      reason: "POS registers and sales floor lack camera coverage",
      priority: 1,
      shrinkageReduction: 15
    }
  ],
  threatBasedControls: [
    {
      control: {
        id: 125,
        name: 'Loss Prevention Officer',
        category: 'Personnel',
        estimatedCost: 45000 // annual
      },
      reason: "Critical for ORC prevention and employee deterrence",
      priority: 1,
      shrinkageReduction: 25
    }
  ],
  quickWins: [
    {
      control: 'Receipt Checking Policy',
      estimatedCost: 0,
      reason: 'Low cost deterrent',
      shrinkageReduction: 5
    }
  ]
}
```

**PDF Report Generation:**
```typescript
// Generate retail security report
POST /api/assessments/[id]/generate-report
{
  includeInterview: true,
  includePhotos: true,
  includeShrinkageAnalysis: true,
  includeROICalculation: true,
  includeIncidentResponse: true
}

Response: {
  reportUrl: '/reports/retail-assessment-789.pdf',
  pageCount: 38,
  generatedAt: '2025-11-20T16:30:00Z',
  sections: {
    executiveSummary: true,
    shrinkageAnalysis: true,
    riskScenarios: 12,
    controlRecommendations: 18,
    roiAnalysis: true,
    robberyResponseProcedures: true
  }
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
         ├─────────────────┬──────────────────┬─────────────────┬────────────────┐
         │                 │                  │                 │                │
┌────────▼────────┐ ┌─────▼──────┐  ┌───────▼────────┐ ┌──────▼──────┐ ┌─────▼──────┐
│ Risk Calculation│ │AI Services │  │ PDF Generation │ │  Database   │ │ Shrinkage  │
│     Engine      │ │  Module    │  │    Service     │ │ (Drizzle)   │ │  Analysis  │
└─────────────────┘ └────┬───────┘  └────────────────┘ └─────────────┘ └────────────┘
                         │
                    ┌────▼────┐
                    │ OpenAI  │
                    │GPT-4/4V │
                    └─────────┘
```

---

## 8. UI Components

### 8.1 Retail Store Assessment Dashboard

**Component:** `RetailAssessmentDashboard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, TrendingDown, DollarSign, AlertTriangle, Users } from 'lucide-react';

export function RetailAssessmentDashboard({ assessment }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shrinkage Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">High</div>
            <p className="text-xs text-muted-foreground">2.8% rate vs 1.5% avg</p>
            <p className="text-xs text-muted-foreground mt-1">Score: 78/100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Annual Loss</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$168K</div>
            <p className="text-xs text-muted-foreground">Based on shrinkage rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Store Revenue</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$6.0M</div>
            <p className="text-xs text-muted-foreground">Annual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Risk Scenarios</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">5 high-risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Interview Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Loss Prevention Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Progress</span>
              <span className="text-sm font-medium">58/70 questions</span>
            </div>
            <Progress value={83} className="h-2" />
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="destructive">14 Red Flags</Badge>
              <Badge variant="outline" className="border-orange-500">High Shrinkage</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shrinkage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Shrinkage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Shoplifting</span>
                <span className="text-sm font-medium">$75.6K (45%)</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Employee Theft</span>
                <span className="text-sm font-medium">$58.8K (35%)</span>
              </div>
              <Progress value={35} className="h-2 bg-orange-200" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Administrative Error</span>
                <span className="text-sm font-medium">$25.2K (15%)</span>
              </div>
              <Progress value={15} className="h-2 bg-yellow-200" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Vendor Fraud</span>
                <span className="text-sm font-medium">$8.4K (5%)</span>
              </div>
              <Progress value={5} className="h-2 bg-blue-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Vulnerabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">No EAS system installed</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">No CCTV on POS registers</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="destructive">Critical</Badge>
              <span className="text-sm">Cash not counted before/after shifts</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="border-orange-500">High</Badge>
              <span className="text-sm">No loss prevention staff</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline" className="border-orange-500">High</Badge>
              <span className="text-sm">Dressing rooms unsupervised</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 8.2 Shrinkage Analysis Component

**Component:** `ShrinkageAnalysisDashboard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export function ShrinkageAnalysisDashboard({ shrinkageData }) {
  const getTrendIcon = (trend: string) => {
    return trend === 'INCREASING' ? 
      <TrendingUp className="h-4 w-4 text-red-500" /> : 
      <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'INCREASING' ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Shrinkage Risk Analysis</span>
            {shrinkageData.riskLevel === 'HIGH' && (
              <Badge variant="destructive">High Risk</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Rate</div>
              <div className="text-3xl font-bold text-red-600">
                {shrinkageData.currentShrinkageRate}%
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getTrendIcon(shrinkageData.trendAnalysis.trend)}
                <span className={`text-sm ${getTrendColor(shrinkageData.trendAnalysis.trend)}`}>
                  {shrinkageData.trendAnalysis.percentageChange}% vs last quarter
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Industry Average</div>
              <div className="text-3xl font-bold">
                {shrinkageData.industryAverage}%
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                You are {(shrinkageData.currentShrinkageRate - shrinkageData.industryAverage).toFixed(1)}% above average
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-muted-foreground mb-1">Estimated Annual Loss</div>
            <div className="text-4xl font-bold text-red-600">
              ${(shrinkageData.estimatedAnnualLoss / 1000).toFixed(0)}K
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on ${(shrinkageData.annualRevenue / 1000000).toFixed(1)}M annual revenue
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Loss Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(shrinkageData.breakdown).map(([category, data]: [string, any]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      ${(data.amount / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {data.percentage}%
                    </div>
                  </div>
                </div>
                <Progress 
                  value={data.percentage} 
                  className="h-2"
                  indicatorClassName={
                    data.percentage > 40 ? 'bg-red-500' :
                    data.percentage > 20 ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Contributing Vulnerability Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {shrinkageData.vulnerabilityFactors.map((factor, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-sm">{factor}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Quarter</span>
              <span className="text-lg font-medium">
                {shrinkageData.trendAnalysis.lastQuarter}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Quarter</span>
              <span className="text-lg font-bold text-red-600">
                {shrinkageData.trendAnalysis.thisQuarter}%
              </span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2">
                {getTrendIcon(shrinkageData.trendAnalysis.trend)}
                <span className={`font-medium ${getTrendColor(shrinkageData.trendAnalysis.trend)}`}>
                  {shrinkageData.trendAnalysis.trend === 'INCREASING' ? 'Increasing' : 'Decreasing'} trend
                </span>
                <span className="text-muted-foreground">
                  ({shrinkageData.trendAnalysis.percentageChange}% change)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 8.3 Loss Prevention ROI Calculator

**Component:** `LossPreventionROICalculator.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export function LossPreventionROICalculator({ roiData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Loss Prevention Investment ROI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current State */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Current Annual Loss</div>
            <div className="text-3xl font-bold text-red-600">
              ${(roiData.currentAnnualLoss / 1000).toFixed(0)}K
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Due to shrinkage and theft
            </p>
          </div>

          {/* Proposed Investment */}
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-1">Proposed Security Investment</div>
            <div className="text-2xl font-bold">
              ${(roiData.totalInvestment / 1000).toFixed(0)}K
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              One-time capital investment
            </p>
          </div>

          {/* Projected Savings */}
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-1">Projected Annual Savings</div>
            <div className="text-3xl font-bold text-green-600">
              ${(roiData.projectedAnnualSavings / 1000).toFixed(0)}K
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {roiData.projectedShrinkageReduction}% reduction in shrinkage
            </p>
          </div>

          {/* ROI Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Payback Period
              </div>
              <div className="text-2xl font-bold">
                {(roiData.paybackPeriod * 12).toFixed(1)} months
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                3-Year ROI
              </div>
              <div className="text-2xl font-bold text-green-600">
                {roiData.threeYearROI}%
              </div>
            </div>
          </div>

          {/* Control Breakdown */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-3">Investment Breakdown</h4>
            <div className="space-y-3">
              {roiData.breakdown.map((item, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{item.control}</span>
                    <span className="text-sm font-bold">
                      ${(item.cost / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Shrinkage ↓</div>
                      <div className="font-medium">{item.shrinkageReduction}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Annual Savings</div>
                      <div className="font-medium text-green-600">
                        ${(item.annualSavings / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Payback</div>
                      <div className="font-medium">
                        {(item.payback * 12).toFixed(1)}mo
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t bg-green-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-green-900">Strong ROI Case</p>
                <p className="text-sm text-green-700 mt-1">
                  Investment pays for itself in {(roiData.paybackPeriod * 12).toFixed(1)} months. 
                  Over 3 years, you'll save ${((roiData.projectedAnnualSavings * 3 - roiData.totalInvestment) / 1000).toFixed(0)}K 
                  in reduced shrinkage losses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 8.4 AI Photo Analysis (Retail Context)

**Component:** `RetailPhotoAnalysis.tsx`

Enhanced for retail-specific observations:
- Merchandise visibility and security
- EAS tag coverage
- Blind spots and concealment opportunities
- POS security
- CPTED principles
- Dressing room visibility

```typescript
export function RetailPhotoAnalysis({ photo, analysis }) {
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
          {/* Photo with Risk Badges */}
          <div className="relative">
            <img src={photo.url} alt={photo.caption} className="rounded-lg" />
            {analysis.vulnerabilityScore >= 7 && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                High Risk
              </Badge>
            )}
            {analysis.shrinkageRisks && analysis.shrinkageRisks.length > 0 && (
              <Badge className="absolute top-2 left-2 bg-orange-500">
                Shrinkage Risk
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

          {/* Shrinkage Risks (Retail-Specific) */}
          {analysis.shrinkageRisks && analysis.shrinkageRisks.length > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
                Shrinkage Vulnerability Factors
              </h4>
              <ul className="space-y-1">
                {analysis.shrinkageRisks.map((risk, i) => (
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

### 8.5 Retail Interview Component

**Component:** `RetailSecurityInterview.tsx`

**Features:**
- Progressive disclosure with conditional follow-ups
- Real-time shrinkage risk indicators
- Auto-save every 30 seconds
- Section-by-section navigation
- Visual progress tracking
- EAS system assessment
- Cash handling evaluation

**Risk Indicator Logic:**
```typescript
function evaluateRetailRiskIndicators(questionId: string, response: any): RiskFlag {
  const criticalResponses = {
    // Shrinkage & Loss Prevention
    shrink_1: { value: ['3-5%', 'Over 5%'], flag: 'High shrinkage rate', severity: 'critical' },
    shrink_4: { value: 'no', flag: 'No inventory controls', severity: 'high' },
    
    // EAS System
    merch_3: { value: 'no', flag: 'No EAS system', severity: 'critical' },
    
    // Surveillance
    surveillance_1: { value: 'no', flag: 'No CCTV on POS', severity: 'critical' },
    surveillance_2: { value: ['0-25%', '26-50%'], flag: 'Insufficient CCTV coverage', severity: 'high' },
    
    // Cash Handling
    cash_1: { value: ['over $5000', 'no limit'], flag: 'Excessive register cash', severity: 'high' },
    cash_3: { value: 'no', flag: 'Cash not counted per shift', severity: 'critical' },
    cash_4: { value: 'no', flag: 'No drop safe', severity: 'high' },
    
    // Personnel
    personnel_2: { value: 'no', flag: 'No background checks', severity: 'high' },
    personnel_5: { value: 'no', flag: 'No loss prevention staff', severity: 'high' },
    
    // Incident History
    incident_1: { value: 'yes', flag: 'Recent robbery history', severity: 'critical' },
    incident_2: { value: 'yes', flag: 'Recent ORC activity', severity: 'high' }
  };

  if (criticalResponses[questionId]) {
    const indicator = criticalResponses[questionId];
    if (
      indicator.value === response ||
      (Array.isArray(indicator.value) && indicator.value.some(v => response?.includes(v)))
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

---

## 9. PDF Report Template

### 9.1 Retail Security Report Structure

**Template File:** `server/templates/retail-security-report.tsx`

```typescript
interface RetailSecurityReport {
  // Cover Page
  storeName: string;
  address: string;
  assessmentDate: Date;
  consultantName: string;
  shrinkageRiskScore: number; // 0-100

  // Executive Summary (2-3 pages)
  executiveSummary: {
    storeOverview: string;
    keyFindings: string[];
    criticalVulnerabilities: string[];
    shrinkageRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendedInvestment: number;
    projectedROI: number;
    projectedSavings: number;
    topPriorities: string[];
  };

  // Store Profile (1-2 pages)
  storeProfile: {
    storeFormat: string;
    squareFootage: number;
    annualRevenue: number;
    employeeCount: number;
    operatingHours: string;
    storeLocation: string; // Mall, strip center, standalone
    merchandiseCategories: string[];
    highValueMerchandise: string[];
  };

  // Shrinkage Analysis (3-4 pages)
  shrinkageAnalysis: {
    currentRate: number;
    industryAverage: number;
    riskLevel: string;
    estimatedAnnualLoss: number;
    breakdown: {
      shoplifting: { percentage: number; amount: number };
      employeeTheft: { percentage: number; amount: number };
      administrativeError: { percentage: number; amount: number };
      vendorFraud: { percentage: number; amount: number };
    };
    trendAnalysis: {
      lastQuarter: number;
      thisQuarter: number;
      trend: 'INCREASING' | 'STABLE' | 'DECREASING';
      percentageChange: number;
    };
    contributingFactors: string[];
    industryBenchmark: {
      bestInClass: number;
      average: number;
      belowAverage: number;
      currentPosition: string;
    };
  };

  // Interview Summary (2-3 pages)
  interviewSummary: {
    sectionsCompleted: number;
    totalQuestions: number;
    redFlags: Array<{ question: string; response: string; concern: string }>;
    strengthsIdentified: string[];
    gapsIdentified: string[];
    easSystemStatus: string;
    cctvCoverage: string;
    cashHandlingScore: number;
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
    shrinkageContribution: number; // percentage
    photos: Array<{ url: string; caption: string; aiAnalysis?: string }>;
    currentControls: Array<{ name: string; effectiveness: number }>;
    proposedControls: Array<{ name: string; cost: number; reduction: number }>;
    residualRisk: number;
  }>;

  // Loss Prevention Analysis (2-3 pages)
  lossPreventionAnalysis: {
    easSystemEffectiveness: string;
    cctvCoverageAssessment: string;
    personnelSecurityPosture: string;
    cashControlEffectiveness: string;
    inventoryControlRating: string;
    findings: string[];
    recommendations: string[];
  };

  // Employee Theft Indicators (2 pages)
  employeeTheftAnalysis: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    indicators: string[];
    backgroundCheckStatus: string;
    accessControlStatus: string;
    inventoryDiscrepancies: string;
    recommendations: string[];
  };

  // Organized Retail Crime Assessment (2 pages)
  orcAssessment: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    recentActivity: boolean;
    targetMerchandise: string[];
    vulnerabilityFactors: string[];
    recommendations: string[];
  };

  // Cash Handling Security (2 pages)
  cashHandlingSecurity: {
    securityScore: number; // 0-100
    registerCashLimits: string;
    dropSafeStatus: string;
    countingProcedures: string;
    armoredCarService: string;
    vulnerabilities: string[];
    recommendations: string[];
  };

  // Control Recommendations (4-5 pages)
  controlRecommendations: {
    priority1: Array<{ 
      control: string; 
      reason: string; 
      cost: number; 
      shrinkageReduction: number;
      roi: string 
    }>;
    priority2: Array<{ control: string; reason: string; cost: number; roi: string }>;
    priority3: Array<{ control: string; reason: string; cost: number; roi: string }>;
    quickWins: Array<{ control: string; reason: string; cost: number }>;
  };

  // ROI Analysis (2-3 pages)
  roiAnalysis: {
    currentAnnualLoss: number;
    proposedInvestment: number;
    projectedShrinkageReduction: number;
    projectedAnnualSavings: number;
    paybackPeriod: number;
    threeYearROI: number;
    breakdown: Array<{
      control: string;
      cost: number;
      shrinkageReduction: number;
      annualSavings: number;
      payback: number;
    }>;
  };

  // Incident Response Procedures (2 pages)
  incidentResponse: {
    robberyResponseProtocol: string;
    activeShooterProcedures: string;
    shoplifterDetentionPolicy: string;
    orcResponseGuidelines: string;
    employeeTheftInvestigation: string;
    emergencyContacts: any[];
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
    retailBestPractices: string[];
    industryBenchmarks: any;
    orcIntelligence: string[];
    complianceRequirements: string[];
  };
}
```

### 9.2 Shrinkage Risk Scoring Algorithm

**Displayed prominently in executive summary:**

```typescript
function calculateShrinkageRiskScore(assessment: Assessment): number {
  let score = 0;
  const maxScore = 100;

  // Current Shrinkage Rate (25 points)
  const currentRate = parseShrinkageRate(assessment.responses.shrink_1);
  if (currentRate > 5) score += 25;
  else if (currentRate > 3) score += 20;
  else if (currentRate > 2) score += 15;
  else if (currentRate > 1.5) score += 10;
  else score += 5;

  // Critical Control Gaps (50 points total)
  const criticalControls = [
    { response: 'merch_3', missing: 'no', points: 15 }, // No EAS
    { response: 'surveillance_1', missing: 'no', points: 10 }, // No POS CCTV
    { response: 'cash_3', missing: 'no', points: 8 }, // Cash not counted
    { response: 'cash_4', missing: 'no', points: 7 }, // No drop safe
    { response: 'personnel_5', missing: 'no', points: 10 } // No LP staff
  ];

  criticalControls.forEach(control => {
    if (assessment.responses[control.response] === control.missing) {
      score += control.points;
    }
  });

  // Incident History (15 points)
  if (assessment.responses.incident_1 === 'yes') score += 8; // Recent robbery
  if (assessment.responses.incident_2 === 'yes') score += 7; // ORC activity

  // High-Value Merchandise (10 points)
  const highValueCount = assessment.responses.merch_2?.length || 0;
  score += Math.min(highValueCount * 2, 10);

  return Math.min(score, maxScore);
}

// Risk Level Classification
function classifyShrinkageRisk(score: number): string {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}
```

### 9.3 Report Visual Elements

**Key visual components in the PDF:**

1. **Shrinkage Risk Gauge** (cover page + executive summary)
   - Speedometer showing 0-100 score
   - Color zones: green (0-25), yellow (26-50), orange (51-75), red (76-100)
   - Current rate vs. industry average comparison

2. **Shrinkage Breakdown Pie Chart** (shrinkage analysis section)
   - Visual breakdown: shoplifting, employee theft, admin error, vendor fraud
   - Color-coded segments with percentages and dollar amounts

3. **Quarterly Trend Line Chart** (shrinkage analysis section)
   - Line graph showing shrinkage rate over past 4 quarters
   - Trend direction indicator

4. **Store Layout Heat Map** (loss prevention section)
   - Floor plan with color-coded zones by theft risk
   - CCTV coverage overlay
   - Blind spot identification

5. **Risk Matrix** (risk scenarios section)
   - Plot all threats by T×V
   - Before/after comparison showing residual risk

6. **ROI Timeline Chart** (ROI section)
   - Bar chart showing investment vs. savings over 3 years
   - Break-even point highlighted
   - Cumulative savings line

7. **Zone-Based Photo Documentation**
   - Organized by store zone (entrance, sales floor, POS, stockroom, etc.)
   - AI analysis annotations
   - Shrinkage risk indicators

### 9.4 Report Generation with AI Enhancements

**Service:** `server/services/retail-report-generator.ts`

```typescript
export async function generateRetailSecurityReport(
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
        scenario.description = await generateRetailRiskNarrative(scenario, assessment);
      }
    }
  }

  // 3. Calculate retail-specific scores
  const shrinkageScore = calculateShrinkageRiskScore(assessment);
  const roiAnalysis = calculateLossPreventionROI(assessment, controls);
  const shrinkageAnalysis = analyzeShrinkageData(assessment);

  // 4. Compile report data
  const reportData: RetailSecurityReport = {
    storeName: assessment.site.name,
    shrinkageRiskScore: shrinkageScore,
    executiveSummary: generateExecutiveSummary(assessment, riskScenarios, roiAnalysis),
    storeProfile: extractStoreProfile(assessment),
    shrinkageAnalysis: shrinkageAnalysis,
    interviewSummary: summarizeInterview(assessment.interviewResponses),
    riskScenarios: riskScenarios,
    lossPreventionAnalysis: analyzeLossPrevention(assessment),
    employeeTheftAnalysis: analyzeEmployeeTheft(assessment),
    orcAssessment: assessORC(assessment),
    cashHandlingSecurity: analyzeCashHandling(assessment),
    controlRecommendations: prioritizeRecommendations(controls, roiAnalysis),
    roiAnalysis: roiAnalysis,
    incidentResponse: compileIncidentProcedures(assessment),
    implementationRoadmap: createImplementationRoadmap(controls),
    appendices: compileAppendices(assessment)
  };

  // 5. Render PDF using Puppeteer
  const html = await renderRetailReportTemplate(reportData);
  const pdfBuffer = await generatePDF(html, options);

  // 6. Save and return
  const pdfPath = await savePDF(pdfBuffer, assessmentId);
  return pdfPath;
}
```

---

## 10. Implementation Roadmap

### 10.1 17-Day Development Sprint

**Pre-Development (Day 0):**
```
Tasks:
- Review complete retail framework document
- Set up Replit environment with PostgreSQL
- Create project structure
- Install dependencies
```

---

### **Week 1: Foundation & Interview System (Days 1-7)**

#### **Day 1-2: Database Schema & Seed Data**
**AI Prompt (Day 1):**
```
Create retail-specific database extensions:
1. Add retailProfile to assessments table (JSON):
   - storeFormat, annualRevenue, shrinkageRate
   - merchandiseCategories[], highValueItems[]
   - easSystemPresent, lpStaffCount
2. Add shrinkageAnalysis table:
   - id, assessmentId, currentRate, riskScore, breakdown
3. Add orcActivity table:
   - id, assessmentId, recentActivity, targetItems[]
4. Generate migration and apply
```

**AI Prompt (Day 2):**
```
Create seed data for retail template:
1. 12-15 retail-specific threats
2. 60+ retail controls (EAS, CCTV, cash management, personnel)
3. Create 'retail_store' template with associations
4. Add facility zones (9 zones: entrance, sales floor, POS, etc.)
5. Run seed script
```

---

#### **Day 3-5: Loss Prevention Interview**
**AI Prompt (Day 3):**
```
Create retail interview questionnaire:
server/data/retail-interview-questionnaire.ts

Include all 11 sections with 70+ questions:
1. Store Profile & Operations (7 questions)
2. Shrinkage & Loss History (8 questions)
3. Merchandise Protection (7 questions)
4. Surveillance Systems (6 questions)
5. Cash Handling (7 questions)
6. Personnel Security (7 questions)
7. Incident History (8 questions)
8. Physical Security (6 questions)
9. Loss Prevention Program (6 questions)
10. Customer Service vs Security (5 questions)
11. Emergency Response (5 questions)

Each question must have risk mapping and shrinkage indicators.
```

**AI Prompt (Day 4):**
```
Create retail interview UI:
app/assessments/[id]/interview/page.tsx

Features:
1. Section navigation
2. Progressive disclosure
3. Real-time shrinkage risk indicators:
   - "Shrinkage rate >3%" → RED FLAG
   - "No EAS system" → CRITICAL
   - "No CCTV on POS" → CRITICAL
4. Auto-save
5. Progress tracking
6. EAS effectiveness scoring
```

**AI Prompt (Day 5):**
```
Create interview API routes:
1. POST /api/assessments/[id]/interview/save
2. GET /api/assessments/[id]/interview/progress
3. POST /api/assessments/[id]/shrinkage-data/update
```

---

#### **Day 6-7: Risk Mapping & Shrinkage Scoring**
**AI Prompt (Day 6):**
```
Create retail risk mapping service:
server/services/retail-risk-mapper.ts

Implement:
1. calculateThreatLikelihood() - incident history, ORC activity
2. calculateVulnerability() - control gaps, EAS status, CCTV coverage
3. calculateImpact() - revenue, merchandise value, location
4. calculateShrinkageRiskScore()
5. calculateLossPreventionROI()
```

**AI Prompt (Day 7):**
```
Create risk auto-generation endpoint:
POST /api/assessments/[id]/generate-risks

Include:
- 12-15 retail risk scenarios
- Shrinkage risk score
- ROI analysis
- Loss breakdown
```

---

### **Week 2: AI Integration & Advanced Features (Days 8-14)**

#### **Day 8-9: AI Photo Analysis (Retail)**
**AI Prompt (Day 8):**
```
Create retail photo analysis service:
server/services/retail-photo-analysis.ts

Retail-specific contexts:
1. Sales floor: merchandise security, blind spots, EAS coverage
2. POS area: cash handling, CCTV, customer view
3. Entrance: EAS gates, visibility, access control
4. Stockroom: inventory security, access
5. Dressing rooms: supervision, concealment risk

Return:
- summary
- detectedObjects[]
- securityObservations[]
- shrinkageRisks[] (NEW - retail specific)
- recommendations[]
- vulnerabilityScore
```

**AI Prompt (Day 9):**
```
Create retail photo analysis UI:
components/RetailPhotoAnalysis.tsx

Features:
1. Zone-specific analysis
2. Shrinkage risk indicators
3. EAS coverage assessment
4. Link to scenarios
```

---

#### **Day 10-11: AI Narrative Generation & Shrinkage Analysis**
**AI Prompt (Day 10):**
```
Create retail narrative generator:
server/services/retail-narrative-generator.ts

Generate:
1. Risk description with retail context
2. Current state with shrinkage implications
3. Loss prevention gap analysis
4. Control recommendations with ROI
```

**AI Prompt (Day 11):**
```
Create shrinkage analysis components:
1. ShrinkageAnalysisDashboard
2. LossPreventionROICalculator
3. RetailAssessmentDashboard
```

---

#### **Day 12-13: Control Recommendations & ROI**
**AI Prompt (Day 12):**
```
Create retail control recommender:
server/services/retail-control-recommender.ts

Include:
- Gap-based recommendations (EAS, CCTV, cash controls)
- Threat-based recommendations
- Shrinkage reduction calculations
- ROI for each control
```

**AI Prompt (Day 13):**
```
Create ROI calculator with:
- Current shrinkage loss calculation
- Proposed control costs
- Shrinkage reduction estimates
- Payback period
- 3-year ROI
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
Create retail PDF template:
server/templates/retail-security-report.tsx

Sections:
1. Cover with shrinkage risk gauge
2. Executive summary (2-3 pages)
3. Store profile (1-2 pages)
4. Shrinkage analysis (3-4 pages)
5. Interview summary (2-3 pages)
6. Risk scenarios (10-15 pages)
7. Loss prevention analysis (2-3 pages)
8. Employee theft indicators (2 pages)
9. ORC assessment (2 pages)
10. Cash handling security (2 pages)
11. Control recommendations (4-5 pages)
12. ROI analysis (2-3 pages)
13. Incident response procedures (2 pages)
14. Implementation roadmap (2 pages)
15. Appendices

Visual elements:
- Shrinkage risk gauge
- Breakdown pie chart
- Quarterly trend chart
- Store layout heat map
- Risk matrix
- ROI timeline chart
```

**AI Prompt (Day 16):**
```
Implement retail report generator:
server/services/retail-report-generator.ts

Process:
1. Fetch all data
2. Calculate shrinkage score
3. Generate AI narratives
4. Compile report structure
5. Render HTML
6. Generate PDF
```

---

#### **Day 17: Final Testing & Polish**
**Tasks:**
- Complete end-to-end test
- Create demo retail assessment
- Performance optimization
- Documentation
- Bug fixes

---

### 10.2 Integration Checklist

**Before Launch:**
- [ ] Retail interview (11 sections, 70+ questions)
- [ ] Interview UI with shrinkage risk indicators
- [ ] Auto-save functionality
- [ ] Risk mapping algorithms (retail-specific T×V×I)
- [ ] Shrinkage risk score calculation
- [ ] Loss prevention ROI calculator
- [ ] Auto-generation of 12-15 risk scenarios
- [ ] AI photo analysis (retail contexts)
- [ ] Shrinkage vulnerability detection in photos
- [ ] AI narrative generation
- [ ] Shrinkage analysis dashboard
- [ ] Loss prevention ROI component
- [ ] Retail assessment dashboard
- [ ] Control recommendation engine
- [ ] Complete PDF report template
- [ ] Visual elements (gauges, charts, heat maps)
- [ ] End-to-end testing
- [ ] Demo assessment created

---

## Conclusion

This comprehensive Retail Store Security Assessment Framework provides:

1. **70+ structured questions** across 11 sections capturing loss prevention, shrinkage, and customer-facing security challenges
2. **Automated risk calculation** using T×V×I with retail-specific adjustments
3. **Shrinkage Risk Score** - quantifying inventory loss exposure (0-100 scale)
4. **Loss Prevention ROI Calculator** - justifying security investments through shrinkage reduction
5. **AI-powered insights** through intelligent photo analysis and narrative generation
6. **Professional PDF reports** with shrinkage analysis, ROI justification, and incident response procedures
7. **Seamless integration** with RiskFixer Master Framework v2.1

The system transforms retail security consulting from subjective walkthroughs into data-driven, mathematically rigorous assessments that justify loss prevention investments through quantifiable shrinkage reduction.

**Key Differentiators:**
- **Shrinkage risk scoring** - Quantifies inventory loss vulnerability (0-100 score)
- **Loss prevention ROI calculator** - Payback period and 3-year ROI for security investments
- **Employee theft indicators** - Red flags for internal theft
- **ORC assessment** - Organized retail crime vulnerability evaluation
- **Cash handling security analysis** - POS and back-office risk scoring

This framework establishes RiskFixer as the premier tool for retail store security assessments, addressing the unique challenges of customer-facing operations, merchandise protection, and loss prevention.

---

**END OF COMPREHENSIVE RETAIL STORE FRAMEWORK v2.0**
