# RiskFixer: Frontend UX & Report Generation Implementation
## Complete Replit Agent Instructions

**Priority:** HIGH  
**Dependencies:** Architecture Alignment (mapper rewrite) should be done first

---

# TABLE OF CONTENTS

1. [Overview](#overview)
2. [Step 1: Tab Navigation Structure](#step-1-tab-navigation-structure)
3. [Step 2: Risk Profile Dashboard](#step-2-risk-profile-dashboard)
4. [Step 3: Reports Tab](#step-3-reports-tab)
5. [Step 4: Report Generation API](#step-4-report-generation-api)
6. [Step 5: PDF Generation Service](#step-5-pdf-generation-service)
7. [Step 6: Photo Tab Enhancements](#step-6-photo-tab-enhancements)
8. [Step 7: Database Schema Updates](#step-7-database-schema-updates)
9. [Step 8: Testing Checklist](#step-8-testing-checklist)

---

# OVERVIEW

## Current State
- Interview questionnaire exists but navigation is fragmented
- Risk data displays in basic format
- No dedicated report generation
- No unified dashboard view

## Target State
- Clean tab-based navigation: INTERVIEW | RISK PROFILE | REPORTS | PHOTOS | SETTINGS
- Professional risk dashboard with T×V×I visualization
- One-click report generation (Executive Summary, Full Assessment, Gap Analysis)
- MacQuarrie-grade PDF output with branded cover, narratives, and photos

---

# STEP 1: TAB NAVIGATION STRUCTURE

## Task 1.1: Create Tab Navigation Component

Create file: `client/src/components/layout/TabNavigation.tsx`

```typescript
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type AssessmentTab = 'interview' | 'risk-profile' | 'reports' | 'photos' | 'settings';

interface TabNavigationProps {
  activeTab: AssessmentTab;
  onTabChange: (tab: AssessmentTab) => void;
  interviewProgress?: number; // 0-100
  hasRiskData?: boolean;
  reportCount?: number;
  photoCount?: number;
}

const TABS: { id: AssessmentTab; label: string; icon?: string }[] = [
  { id: 'interview', label: 'Interview' },
  { id: 'risk-profile', label: 'Risk Profile' },
  { id: 'reports', label: 'Reports' },
  { id: 'photos', label: 'Photos' },
  { id: 'settings', label: 'Settings' },
];

export function TabNavigation({
  activeTab,
  onTabChange,
  interviewProgress = 0,
  hasRiskData = false,
  reportCount = 0,
  photoCount = 0,
}: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6" aria-label="Assessment tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          
          // Build badge content
          let badge = null;
          if (tab.id === 'interview' && interviewProgress > 0 && interviewProgress < 100) {
            badge = <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{interviewProgress}%</span>;
          } else if (tab.id === 'risk-profile' && !hasRiskData) {
            badge = <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">No data</span>;
          } else if (tab.id === 'reports' && reportCount > 0) {
            badge = <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{reportCount}</span>;
          } else if (tab.id === 'photos' && photoCount > 0) {
            badge = <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{photoCount}</span>;
          }
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
              {badge}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
```

## Task 1.2: Create Assessment Header Component

Create file: `client/src/components/layout/AssessmentHeader.tsx`

```typescript
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Download, Share2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssessmentHeaderProps {
  assessmentName: string;
  facilityType: string;
  address?: string;
  createdAt: string;
  status: 'draft' | 'in_progress' | 'complete';
  overallRisk?: {
    score: number;
    classification: string;
    color: string;
  };
  onExport?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-green-100 text-green-800',
};

const RISK_COLORS: Record<string, string> = {
  NEGLIGIBLE: 'bg-green-500',
  LOW: 'bg-blue-500',
  MODERATE: 'bg-yellow-500',
  ELEVATED: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export function AssessmentHeader({
  assessmentName,
  facilityType,
  address,
  createdAt,
  status,
  overallRisk,
  onExport,
  onShare,
  onDelete,
}: AssessmentHeaderProps) {
  const facilityTypeLabels: Record<string, string> = {
    office_building: 'Office Building',
    retail_store: 'Retail Store',
    warehouse: 'Warehouse',
    datacenter: 'Datacenter',
    manufacturing: 'Manufacturing',
    executive_protection: 'Executive Protection',
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{assessmentName}</h1>
            <Badge className={STATUS_COLORS[status]}>
              {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {facilityTypeLabels[facilityType] || facilityType}
            {address && ` • ${address}`}
            {` • Created: ${new Date(createdAt).toLocaleDateString()}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {overallRisk && (
            <div className={`${RISK_COLORS[overallRisk.classification]} text-white px-4 py-2 rounded-lg`}>
              <div className="text-xs font-medium opacity-90">OVERALL RISK</div>
              <div className="text-lg font-bold">{overallRisk.score}/125 {overallRisk.classification}</div>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Assessment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Assessment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
```

## Task 1.3: Update Main Assessment Page

Find and update the main assessment page (likely `client/src/pages/assessment/[id].tsx` or similar):

```typescript
import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { TabNavigation, AssessmentTab } from '@/components/layout/TabNavigation';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { InterviewTab } from '@/components/interview/InterviewTab';
import { RiskProfileTab } from '@/components/risk-profile/RiskProfileTab';
import { ReportsTab } from '@/components/reports/ReportsTab';
import { PhotosTab } from '@/components/photos/PhotosTab';
import { SettingsTab } from '@/components/settings/SettingsTab';

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<AssessmentTab>('interview');
  
  // Fetch assessment data
  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch assessment');
      return res.json();
    },
  });
  
  // Fetch risk profile data
  const { data: riskProfile } = useQuery({
    queryKey: ['risk-profile', id],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/${id}/risk-profile`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });
  
  // Fetch reports
  const { data: reports } = useQuery({
    queryKey: ['reports', id],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/${id}/reports`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });
  
  // Fetch photos
  const { data: photos } = useQuery({
    queryKey: ['photos', id],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/${id}/photos`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!assessment) {
    return <div className="flex items-center justify-center h-screen">Assessment not found</div>;
  }
  
  // Calculate interview progress
  const interviewProgress = assessment.interviewProgress || 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentHeader
        assessmentName={assessment.name}
        facilityType={assessment.facilityType}
        address={assessment.address}
        createdAt={assessment.createdAt}
        status={assessment.status}
        overallRisk={riskProfile?.overallRisk}
      />
      
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        interviewProgress={interviewProgress}
        hasRiskData={!!riskProfile?.scenarios?.length}
        reportCount={reports?.length || 0}
        photoCount={photos?.length || 0}
      />
      
      <main className="p-6">
        {activeTab === 'interview' && (
          <InterviewTab assessmentId={parseInt(id)} facilityType={assessment.facilityType} />
        )}
        {activeTab === 'risk-profile' && (
          <RiskProfileTab assessmentId={parseInt(id)} riskProfile={riskProfile} />
        )}
        {activeTab === 'reports' && (
          <ReportsTab assessmentId={parseInt(id)} reports={reports || []} />
        )}
        {activeTab === 'photos' && (
          <PhotosTab assessmentId={parseInt(id)} photos={photos || []} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab assessmentId={parseInt(id)} assessment={assessment} />
        )}
      </main>
    </div>
  );
}
```

---

# STEP 2: RISK PROFILE DASHBOARD

## Task 2.1: Create Overall Risk Card Component

Create file: `client/src/components/risk-profile/OverallRiskCard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore: number;
  rating: string;
  color?: string;
}

function ScoreCard({ label, score, maxScore, rating, color }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{score}/{maxScore}</div>
      <div className="text-sm font-medium text-gray-600 mt-1">{rating}</div>
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface OverallRiskCardProps {
  threatScore: number;
  threatRating: string;
  vulnerabilityScore: number;
  vulnerabilityRating: string;
  impactScore: number;
  impactRating: string;
  overallScore: number;
  overallClassification: string;
  aiConfidence: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

const RISK_COLORS: Record<string, string> = {
  NEGLIGIBLE: '#22C55E',
  LOW: '#3B82F6',
  MODERATE: '#EAB308',
  ELEVATED: '#F97316',
  CRITICAL: '#EF4444',
};

const CONFIDENCE_LABELS = {
  high: { label: 'High Confidence', color: 'text-green-600' },
  medium: { label: 'Medium Confidence', color: 'text-yellow-600' },
  low: { label: 'Low Confidence', color: 'text-red-600' },
};

export function OverallRiskCard({
  threatScore,
  threatRating,
  vulnerabilityScore,
  vulnerabilityRating,
  impactScore,
  impactRating,
  overallScore,
  overallClassification,
  aiConfidence,
  lastUpdated,
}: OverallRiskCardProps) {
  const riskColor = RISK_COLORS[overallClassification] || '#6B7280';
  const confidenceInfo = CONFIDENCE_LABELS[aiConfidence];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Overall Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <ScoreCard
            label="THREAT"
            score={threatScore}
            maxScore={5}
            rating={threatRating}
            color="#6366F1"
          />
          <ScoreCard
            label="VULNERABILITY"
            score={vulnerabilityScore}
            maxScore={5}
            rating={vulnerabilityRating}
            color="#8B5CF6"
          />
          <ScoreCard
            label="IMPACT"
            score={impactScore}
            maxScore={5}
            rating={impactRating}
            color="#A855F7"
          />
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: riskColor + '20' }}>
            <div className="text-sm font-medium text-gray-500 mb-2">OVERALL RISK</div>
            <div className="text-3xl font-bold" style={{ color: riskColor }}>
              {overallScore}/125
            </div>
            <div
              className="text-lg font-bold mt-1 px-3 py-1 rounded inline-block"
              style={{ backgroundColor: riskColor, color: 'white' }}
            >
              {overallClassification}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t pt-4">
          <span className={confidenceInfo.color}>
            AI Assessment: {confidenceInfo.label}
          </span>
          <span>
            Last Updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Task 2.2: Create Risk Scenario List Component

Create file: `client/src/components/risk-profile/RiskScenarioList.tsx`

```typescript
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface RiskScenario {
  id: number;
  threatName: string;
  threatId: string;
  inherentRisk: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  scenarioDescription: string;
  threatLikelihood: number;
  vulnerability: number;
  impact: number;
}

interface RiskScenarioListProps {
  scenarios: RiskScenario[];
  onViewScenario: (scenario: RiskScenario) => void;
  maxVisible?: number;
}

const RISK_LEVEL_CONFIG = {
  critical: { color: 'bg-red-500', textColor: 'text-red-700', icon: '🔴' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-700', icon: '🟠' },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-700', icon: '🟡' },
  low: { color: 'bg-green-500', textColor: 'text-green-700', icon: '🟢' },
};

export function RiskScenarioList({
  scenarios,
  onViewScenario,
  maxVisible = 8,
}: RiskScenarioListProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Sort by inherent risk (highest first)
  const sortedScenarios = [...scenarios].sort((a, b) => b.inherentRisk - a.inherentRisk);
  const visibleScenarios = showAll ? sortedScenarios : sortedScenarios.slice(0, maxVisible);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Risk Scenarios ({scenarios.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visibleScenarios.map((scenario) => {
            const config = RISK_LEVEL_CONFIG[scenario.riskLevel];
            
            return (
              <button
                key={scenario.id}
                onClick={() => onViewScenario(scenario)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span>{config.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{scenario.threatName}</div>
                    <div className="text-sm text-gray-500">
                      T:{scenario.threatLikelihood} × V:{scenario.vulnerability} × I:{scenario.impact}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${config.textColor}`}>
                    {scenario.inherentRisk}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
        
        {scenarios.length > maxVisible && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `View All ${scenarios.length} Scenarios`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

## Task 2.3: Create Recommendations Summary Component

Create file: `client/src/components/risk-profile/RecommendationsSummary.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface Recommendation {
  priority: number;
  title: string;
  urgency: 'immediate' | 'short_term' | 'medium_term' | 'standard';
  rationale?: string;
}

interface RecommendationsSummaryProps {
  recommendations: Recommendation[];
  onViewAll: () => void;
  maxVisible?: number;
}

const URGENCY_CONFIG = {
  immediate: { label: 'Immediate', color: 'bg-red-100 text-red-800' },
  short_term: { label: 'Short Term', color: 'bg-orange-100 text-orange-800' },
  medium_term: { label: 'Medium Term', color: 'bg-yellow-100 text-yellow-800' },
  standard: { label: 'Standard', color: 'bg-gray-100 text-gray-800' },
};

export function RecommendationsSummary({
  recommendations,
  onViewAll,
  maxVisible = 6,
}: RecommendationsSummaryProps) {
  const sortedRecs = [...recommendations].sort((a, b) => a.priority - b.priority);
  const visibleRecs = sortedRecs.slice(0, maxVisible);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Top Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleRecs.map((rec) => {
            const urgencyConfig = URGENCY_CONFIG[rec.urgency];
            
            return (
              <div
                key={rec.priority}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                  {rec.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {rec.title}
                    </span>
                    <Badge className={urgencyConfig.color} variant="secondary">
                      {urgencyConfig.label}
                    </Badge>
                  </div>
                  {rec.rationale && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {rec.rationale}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onViewAll}
        >
          View Full Recommendations
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Task 2.4: Create Evidence Trail Component

Create file: `client/src/components/risk-profile/EvidenceTrail.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Camera, MapPin, AlertTriangle, User } from 'lucide-react';

interface EvidenceItem {
  id: string;
  source: string;
  type: 'interview' | 'site_walk' | 'cap_index' | 'incident' | 'photo';
  summary: string;
  timestamp?: string;
}

interface EvidenceTrailProps {
  evidence: EvidenceItem[];
  onViewComplete: () => void;
  maxVisible?: number;
}

const EVIDENCE_ICONS = {
  interview: User,
  site_walk: MapPin,
  cap_index: FileText,
  incident: AlertTriangle,
  photo: Camera,
};

const EVIDENCE_LABELS = {
  interview: 'Interview',
  site_walk: 'Site Walk',
  cap_index: 'CAP Index',
  incident: 'Incident',
  photo: 'Photo',
};

export function EvidenceTrail({
  evidence,
  onViewComplete,
  maxVisible = 5,
}: EvidenceTrailProps) {
  const visibleEvidence = evidence.slice(0, maxVisible);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evidence Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleEvidence.map((item) => {
            const Icon = EVIDENCE_ICONS[item.type];
            
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {EVIDENCE_LABELS[item.type]}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{item.source}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{item.summary}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {evidence.length > maxVisible && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={onViewComplete}
          >
            View Complete Evidence ({evidence.length} items)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

## Task 2.5: Create Scenario Detail Modal

Create file: `client/src/components/risk-profile/ScenarioDetailModal.tsx`

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ScenarioDetailModalProps {
  scenario: {
    id: number;
    threatName: string;
    scenarioDescription: string;
    threatLikelihood: number;
    vulnerability: number;
    impact: number;
    inherentRisk: number;
    riskLevel: string;
    evidence?: string[];
    recommendedControls?: string[];
  };
  onClose: () => void;
}

export function ScenarioDetailModal({ scenario, onClose }: ScenarioDetailModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{scenario.threatName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Risk Scores */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{scenario.threatLikelihood}</div>
              <div className="text-xs text-gray-500">Threat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{scenario.vulnerability}</div>
              <div className="text-xs text-gray-500">Vulnerability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{scenario.impact}</div>
              <div className="text-xs text-gray-500">Impact</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{scenario.inherentRisk}</div>
              <div className="text-xs text-gray-500">Risk Score</div>
            </div>
          </div>
          
          {/* Scenario Description */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Scenario Description</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{scenario.scenarioDescription}</p>
          </div>
          
          {/* Evidence */}
          {scenario.evidence && scenario.evidence.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supporting Evidence</h4>
              <ul className="list-disc list-inside space-y-1">
                {scenario.evidence.map((item, i) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recommended Controls */}
          {scenario.recommendedControls && scenario.recommendedControls.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommended Controls</h4>
              <ul className="list-disc list-inside space-y-1">
                {scenario.recommendedControls.map((control, i) => (
                  <li key={i} className="text-gray-700">{control}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Task 2.6: Create Main Risk Profile Tab

Create file: `client/src/components/risk-profile/RiskProfileTab.tsx`

```typescript
import { useState } from 'react';
import { OverallRiskCard } from './OverallRiskCard';
import { RiskScenarioList } from './RiskScenarioList';
import { RecommendationsSummary } from './RecommendationsSummary';
import { EvidenceTrail } from './EvidenceTrail';
import { ScenarioDetailModal } from './ScenarioDetailModal';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText } from 'lucide-react';

interface RiskProfileTabProps {
  assessmentId: number;
  riskProfile: any; // Will be typed properly
}

export function RiskProfileTab({ assessmentId, riskProfile }: RiskProfileTabProps) {
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Handle case when no risk data exists yet
  if (!riskProfile || !riskProfile.scenarios?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Risk Profile Generated Yet
        </h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Complete the interview questionnaire and generate risks to see your security risk profile.
        </p>
        <Button>
          Go to Interview
        </Button>
      </div>
    );
  }
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/generate-risks`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to regenerate');
      // Refresh data - you may want to use query invalidation here
      window.location.reload();
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Risk Profile</h2>
          <p className="text-sm text-gray-500">
            AI-powered risk assessment based on interview responses and analysis
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          Regenerate Analysis
        </Button>
      </div>
      
      {/* Overall Risk Card - Full Width */}
      <OverallRiskCard
        threatScore={riskProfile.threatScore}
        threatRating={riskProfile.threatRating}
        vulnerabilityScore={riskProfile.vulnerabilityScore}
        vulnerabilityRating={riskProfile.vulnerabilityRating}
        impactScore={riskProfile.impactScore}
        impactRating={riskProfile.impactRating}
        overallScore={riskProfile.overallScore}
        overallClassification={riskProfile.overallClassification}
        aiConfidence={riskProfile.aiConfidence || 'medium'}
        lastUpdated={riskProfile.lastUpdated}
      />
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskScenarioList
          scenarios={riskProfile.scenarios}
          onViewScenario={setSelectedScenario}
        />
        
        <RecommendationsSummary
          recommendations={riskProfile.recommendations || []}
          onViewAll={() => {
            // Navigate to recommendations or open modal
          }}
        />
      </div>
      
      {/* Evidence Trail - Full Width */}
      <EvidenceTrail
        evidence={riskProfile.evidence || []}
        onViewComplete={() => {
          // Open evidence modal
        }}
      />
      
      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <ScenarioDetailModal
          scenario={selectedScenario}
          onClose={() => setSelectedScenario(null)}
        />
      )}
    </div>
  );
}
```

---

# STEP 3: REPORTS TAB

## Task 3.1: Create Report Type Selector Component

Create file: `client/src/components/reports/ReportTypeSelector.tsx`

```typescript
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText, FileBarChart, ClipboardList } from 'lucide-react';

export type ReportType = 'executive_summary' | 'full_assessment' | 'gap_analysis';

interface ReportTypeOption {
  id: ReportType;
  title: string;
  description: string;
  pages: string;
  icon: React.ElementType;
}

const REPORT_TYPES: ReportTypeOption[] = [
  {
    id: 'executive_summary',
    title: 'Executive Summary',
    description: 'High-level overview for C-suite and board presentations',
    pages: '1-2 pages',
    icon: FileText,
  },
  {
    id: 'full_assessment',
    title: 'Full Assessment',
    description: 'Complete technical report with all findings and recommendations',
    pages: '15-25 pages',
    icon: FileBarChart,
  },
  {
    id: 'gap_analysis',
    title: 'Gap Analysis',
    description: 'Technical remediation guide with specifications and costs',
    pages: '8-12 pages',
    icon: ClipboardList,
  },
];

interface ReportTypeSelectorProps {
  selectedType: ReportType;
  onSelect: (type: ReportType) => void;
}

export function ReportTypeSelector({ selectedType, onSelect }: ReportTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {REPORT_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;
        
        return (
          <Card
            key={type.id}
            className={cn(
              'p-4 cursor-pointer transition-all hover:shadow-md',
              isSelected
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            )}
            onClick={() => onSelect(type.id)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isSelected ? 'bg-blue-100' : 'bg-gray-100'
              )}>
                <Icon className={cn(
                  'h-5 w-5',
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                )} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{type.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                <p className="text-xs text-gray-400 mt-2">{type.pages}</p>
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                isSelected
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              )}>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
```

## Task 3.2: Create Report Options Component

Create file: `client/src/components/reports/ReportOptions.tsx`

```typescript
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface ReportOptionsState {
  includeCoverPage: boolean;
  includeGeographicData: boolean;
  includePhotoAppendix: boolean;
  includeCostEstimates: boolean;
}

interface ReportOptionsProps {
  options: ReportOptionsState;
  onChange: (options: ReportOptionsState) => void;
  hasGeographicData?: boolean;
  hasPhotos?: boolean;
  hasCostData?: boolean;
}

export function ReportOptions({
  options,
  onChange,
  hasGeographicData = false,
  hasPhotos = false,
  hasCostData = false,
}: ReportOptionsProps) {
  const handleChange = (key: keyof ReportOptionsState, value: boolean) => {
    onChange({ ...options, [key]: value });
  };
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Include Options</h4>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="coverPage"
            checked={options.includeCoverPage}
            onCheckedChange={(checked) => handleChange('includeCoverPage', !!checked)}
          />
          <Label htmlFor="coverPage" className="text-sm text-gray-700">
            Cover Page with Branding
          </Label>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="geographicData"
            checked={options.includeGeographicData}
            onCheckedChange={(checked) => handleChange('includeGeographicData', !!checked)}
            disabled={!hasGeographicData}
          />
          <Label
            htmlFor="geographicData"
            className={`text-sm ${hasGeographicData ? 'text-gray-700' : 'text-gray-400'}`}
          >
            Geographic Risk Data (CAP Index)
            {!hasGeographicData && ' — No data available'}
          </Label>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="photoAppendix"
            checked={options.includePhotoAppendix}
            onCheckedChange={(checked) => handleChange('includePhotoAppendix', !!checked)}
            disabled={!hasPhotos}
          />
          <Label
            htmlFor="photoAppendix"
            className={`text-sm ${hasPhotos ? 'text-gray-700' : 'text-gray-400'}`}
          >
            Photo Appendix
            {!hasPhotos && ' — No photos uploaded'}
          </Label>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="costEstimates"
            checked={options.includeCostEstimates}
            onCheckedChange={(checked) => handleChange('includeCostEstimates', !!checked)}
            disabled={!hasCostData}
          />
          <Label
            htmlFor="costEstimates"
            className={`text-sm ${hasCostData ? 'text-gray-700' : 'text-gray-400'}`}
          >
            Cost Estimates
            {!hasCostData && ' — No estimates available'}
          </Label>
        </div>
      </div>
    </div>
  );
}
```

## Task 3.3: Create Report History Component

Create file: `client/src/components/reports/ReportHistory.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  typeName: string;
  createdAt: string;
  pageCount: number;
  fileSize: string;
  downloadUrl: string;
}

interface ReportHistoryProps {
  reports: Report[];
  onPreview: (report: Report) => void;
  onDownload: (report: Report) => void;
}

export function ReportHistory({ reports, onPreview, onDownload }: ReportHistoryProps) {
  if (reports.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Previously Generated Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{report.typeName}</div>
                  <div className="text-sm text-gray-500">
                    {report.pageCount} pages • PDF • {report.fileSize}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(report)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(report)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Task 3.4: Create Main Reports Tab

Create file: `client/src/components/reports/ReportsTab.tsx`

```typescript
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportTypeSelector, ReportType } from './ReportTypeSelector';
import { ReportOptions, ReportOptionsState } from './ReportOptions';
import { ReportHistory } from './ReportHistory';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportsTabProps {
  assessmentId: number;
  reports: any[];
  hasGeographicData?: boolean;
  hasPhotos?: boolean;
}

export function ReportsTab({
  assessmentId,
  reports,
  hasGeographicData = false,
  hasPhotos = false,
}: ReportsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedType, setSelectedType] = useState<ReportType>('full_assessment');
  const [options, setOptions] = useState<ReportOptionsState>({
    includeCoverPage: true,
    includeGeographicData: hasGeographicData,
    includePhotoAppendix: hasPhotos,
    includeCostEstimates: false,
  });
  
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/assessments/${assessmentId}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedType,
          options,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate report');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Report Generated',
        description: 'Your report is ready for download.',
      });
      queryClient.invalidateQueries({ queryKey: ['reports', assessmentId] });
      
      // Auto-download
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handlePreview = (report: any) => {
    window.open(`/api/assessments/${assessmentId}/reports/${report.id}/preview`, '_blank');
  };
  
  const handleDownload = (report: any) => {
    window.open(report.downloadUrl, '_blank');
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500">
          Generate professional PDF reports from your assessment data
        </p>
      </div>
      
      {/* Generate New Report Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selector */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Report Type</h4>
            <ReportTypeSelector
              selectedType={selectedType}
              onSelect={setSelectedType}
            />
          </div>
          
          {/* Options */}
          <ReportOptions
            options={options}
            onChange={setOptions}
            hasGeographicData={hasGeographicData}
            hasPhotos={hasPhotos}
            hasCostData={false}
          />
          
          {/* Generate Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Report History */}
      <ReportHistory
        reports={reports}
        onPreview={handlePreview}
        onDownload={handleDownload}
      />
    </div>
  );
}
```

---

# STEP 4: REPORT GENERATION API

## Task 4.1: Add Report Routes to Server

Add to `server/routes.ts`:

```typescript
import { generateReport, getReportById, listReports } from './services/report-generator';

// Generate a new report
app.post('/api/assessments/:id/reports/generate', async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    const { reportType, options } = req.body;
    
    // Validate assessment exists
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }
    
    // Check if risk data exists
    const scenarios = await db.query.riskScenarios.findMany({
      where: eq(riskScenarios.assessmentId, assessmentId),
    });
    
    if (scenarios.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No risk data available. Please generate risks first.',
      });
    }
    
    // Generate the report
    const result = await generateReport({
      assessmentId,
      reportType,
      options,
      assessment,
      scenarios,
    });
    
    return res.json({
      success: true,
      reportId: result.reportId,
      downloadUrl: `/api/assessments/${assessmentId}/reports/${result.reportId}/download`,
    });
    
  } catch (error) {
    console.error('[Report Generation] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List all reports for an assessment
app.get('/api/assessments/:id/reports', async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    const reports = await listReports(assessmentId);
    return res.json(reports);
  } catch (error) {
    console.error('[List Reports] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to list reports' });
  }
});

// Download a report
app.get('/api/assessments/:id/reports/:reportId/download', async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const report = await getReportById(reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    res.send(report.pdfBuffer);
    
  } catch (error) {
    console.error('[Download Report] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to download report' });
  }
});

// Get risk profile data for dashboard
app.get('/api/assessments/:id/risk-profile', async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    
    // Get assessment
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
    });
    
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }
    
    // Get scenarios
    const scenarios = await db.query.riskScenarios.findMany({
      where: eq(riskScenarios.assessmentId, assessmentId),
    });
    
    if (scenarios.length === 0) {
      return res.json(null);
    }
    
    // Calculate aggregate scores
    const threatScores = scenarios.map(s => s.threatLikelihood);
    const vulnScores = scenarios.map(s => s.vulnerability);
    const impactScores = scenarios.map(s => s.impact);
    
    const avgThreat = Math.round(threatScores.reduce((a, b) => a + b, 0) / threatScores.length);
    const avgVuln = Math.round(vulnScores.reduce((a, b) => a + b, 0) / vulnScores.length);
    const avgImpact = Math.round(impactScores.reduce((a, b) => a + b, 0) / impactScores.length);
    const overallScore = avgThreat * avgVuln * avgImpact;
    
    // Classify overall risk
    let overallClassification = 'NEGLIGIBLE';
    if (overallScore > 75) overallClassification = 'CRITICAL';
    else if (overallScore > 50) overallClassification = 'ELEVATED';
    else if (overallScore > 25) overallClassification = 'MODERATE';
    else if (overallScore > 10) overallClassification = 'LOW';
    
    // Get rating label for individual scores
    const getRating = (score: number) => {
      if (score >= 5) return 'Critical';
      if (score >= 4) return 'Significant';
      if (score >= 3) return 'Moderate';
      if (score >= 2) return 'Low';
      return 'Minimal';
    };
    
    return res.json({
      threatScore: avgThreat,
      threatRating: getRating(avgThreat),
      vulnerabilityScore: avgVuln,
      vulnerabilityRating: getRating(avgVuln),
      impactScore: avgImpact,
      impactRating: getRating(avgImpact),
      overallScore,
      overallClassification,
      aiConfidence: assessment.aiConfidence || 'medium',
      lastUpdated: assessment.updatedAt || assessment.createdAt,
      scenarios: scenarios.map(s => ({
        id: s.id,
        threatName: s.threatId?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Threat',
        threatId: s.threatId,
        inherentRisk: s.inherentRisk,
        riskLevel: s.riskLevel,
        scenarioDescription: s.scenarioDescription,
        threatLikelihood: s.threatLikelihood,
        vulnerability: s.vulnerability,
        impact: s.impact,
      })),
      recommendations: [], // TODO: Load from controls/recommendations table
      evidence: [], // TODO: Load evidence trail
    });
    
  } catch (error) {
    console.error('[Risk Profile] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load risk profile' });
  }
});
```

---

# STEP 5: PDF GENERATION SERVICE

## Task 5.1: Install Puppeteer

```bash
npm install puppeteer
```

## Task 5.2: Create Report Generator Service

Create file: `server/services/report-generator/index.ts`

```typescript
import puppeteer from 'puppeteer';
import { db } from '../../db';
import { reports } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateReportNarratives } from './narrative-generator';
import { renderReportHTML } from './html-renderer';

export interface GenerateReportOptions {
  assessmentId: number;
  reportType: 'executive_summary' | 'full_assessment' | 'gap_analysis';
  options: {
    includeCoverPage: boolean;
    includeGeographicData: boolean;
    includePhotoAppendix: boolean;
    includeCostEstimates: boolean;
  };
  assessment: any;
  scenarios: any[];
}

export async function generateReport(params: GenerateReportOptions) {
  const { assessmentId, reportType, options, assessment, scenarios } = params;
  
  // 1. Generate AI narratives
  const narratives = await generateReportNarratives({
    reportType,
    assessment,
    scenarios,
  });
  
  // 2. Build full report data object
  const reportData = {
    ...narratives,
    assessmentId,
    reportType,
    options,
    assessment,
    scenarios,
    generatedAt: new Date().toISOString(),
  };
  
  // 3. Render HTML
  const html = renderReportHTML(reportData);
  
  // 4. Generate PDF with Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    margin: {
      top: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
      right: '0.75in',
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 9px; width: 100%; text-align: center; color: #666; padding: 0 0.5in;">
        <span>CONFIDENTIAL</span> — 
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });
  
  await browser.close();
  
  // 5. Save to database
  const reportTypeNames: Record<string, string> = {
    executive_summary: 'Executive Summary',
    full_assessment: 'Full Assessment Report',
    gap_analysis: 'Gap Analysis Report',
  };
  
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const filename = `${assessment.name.replace(/\s+/g, '_')}_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Store in database
  await db.insert(reports).values({
    id: reportId,
    assessmentId,
    type: reportType,
    typeName: reportTypeNames[reportType],
    filename,
    pdfData: pdfBuffer,
    pageCount: 0,
    fileSize: `${Math.round(pdfBuffer.length / 1024)} KB`,
    createdAt: new Date(),
  });
  
  return {
    reportId,
    filename,
    downloadUrl: `/api/assessments/${assessmentId}/reports/${reportId}/download`,
  };
}

export async function listReports(assessmentId: number) {
  const reportsList = await db.query.reports.findMany({
    where: eq(reports.assessmentId, assessmentId),
    orderBy: [desc(reports.createdAt)],
  });
  
  return reportsList.map(r => ({
    id: r.id,
    type: r.type,
    typeName: r.typeName,
    createdAt: r.createdAt,
    pageCount: r.pageCount,
    fileSize: r.fileSize,
    downloadUrl: `/api/assessments/${assessmentId}/reports/${r.id}/download`,
  }));
}

export async function getReportById(reportId: string) {
  const report = await db.query.reports.findFirst({
    where: eq(reports.id, reportId),
  });
  
  if (!report) return null;
  
  return {
    ...report,
    pdfBuffer: report.pdfData,
  };
}
```

## Task 5.3: Create Narrative Generator

Create file: `server/services/report-generator/narrative-generator.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateNarrativesParams {
  reportType: string;
  assessment: any;
  scenarios: any[];
}

export async function generateReportNarratives(params: GenerateNarrativesParams) {
  const { reportType, assessment, scenarios } = params;
  
  // Generate executive summary narrative
  const executiveSummaryPrompt = `
You are writing an executive summary for a ${assessment.facilityType} security assessment report.
Write in a professional consulting tone. Use narrative prose, not bullet points.

ASSESSMENT:
- Name: ${assessment.name}
- Type: ${assessment.facilityType}
- Date: ${new Date(assessment.createdAt).toLocaleDateString()}

RISK SCENARIOS (${scenarios.length} total):
${scenarios.slice(0, 5).map(s => 
  `- ${s.threatId}: Risk Score ${s.inherentRisk}/125 (T:${s.threatLikelihood} V:${s.vulnerability} I:${s.impact})`
).join('\n')}

Generate a 2-3 paragraph executive summary that:
1. Introduces the assessment scope and methodology
2. Highlights the key risk findings
3. Provides forward-looking guidance on priorities

Return ONLY the narrative text, no JSON or formatting.
`;

  const executiveSummaryResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: executiveSummaryPrompt }],
    max_tokens: 1000,
  });
  
  const executiveSummary = executiveSummaryResponse.choices[0]?.message?.content || '';
  
  // Generate conclusion narrative
  const conclusionPrompt = `
Write a 2-paragraph conclusion for a security assessment of ${assessment.name}.

Key findings were:
${scenarios.slice(0, 3).map(s => `- ${s.threatId}: ${s.riskLevel} risk`).join('\n')}

The conclusion should:
1. Synthesize the main findings
2. Recommend where to begin implementation
3. End with a forward-looking statement

Return ONLY the narrative text.
`;

  const conclusionResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: conclusionPrompt }],
    max_tokens: 500,
  });
  
  const conclusion = conclusionResponse.choices[0]?.message?.content || '';
  
  return {
    executiveSummary,
    conclusion,
  };
}
```

## Task 5.4: Create HTML Renderer

Create file: `server/services/report-generator/html-renderer.ts`

```typescript
export function renderReportHTML(data: any): string {
  const {
    assessment,
    scenarios,
    executiveSummary,
    conclusion,
    options,
    reportType,
  } = data;
  
  // Calculate overall scores
  const threatScores = scenarios.map((s: any) => s.threatLikelihood);
  const vulnScores = scenarios.map((s: any) => s.vulnerability);
  const impactScores = scenarios.map((s: any) => s.impact);
  
  const avgThreat = Math.round(threatScores.reduce((a: number, b: number) => a + b, 0) / threatScores.length);
  const avgVuln = Math.round(vulnScores.reduce((a: number, b: number) => a + b, 0) / vulnScores.length);
  const avgImpact = Math.round(impactScores.reduce((a: number, b: number) => a + b, 0) / impactScores.length);
  const overallScore = avgThreat * avgVuln * avgImpact;
  
  let overallClassification = 'NEGLIGIBLE';
  let riskColor = '#22C55E';
  if (overallScore > 75) { overallClassification = 'CRITICAL'; riskColor = '#EF4444'; }
  else if (overallScore > 50) { overallClassification = 'ELEVATED'; riskColor = '#F97316'; }
  else if (overallScore > 25) { overallClassification = 'MODERATE'; riskColor = '#EAB308'; }
  else if (overallScore > 10) { overallClassification = 'LOW'; riskColor = '#3B82F6'; }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: Letter; margin: 0; }
    
    * { box-sizing: border-box; }
    
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
      color: white;
      page-break-after: always;
    }
    
    .cover-logo {
      font-size: 36pt;
      font-weight: bold;
      margin-bottom: 2rem;
    }
    
    .cover-title {
      font-size: 24pt;
      margin-bottom: 1rem;
    }
    
    .cover-subtitle {
      font-size: 14pt;
      opacity: 0.9;
      margin-bottom: 3rem;
    }
    
    .cover-risk-badge {
      display: inline-block;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 3rem;
    }
    
    .cover-meta {
      font-size: 11pt;
      opacity: 0.8;
    }
    
    .content-page {
      padding: 0.75in;
      page-break-after: always;
    }
    
    h1 {
      font-size: 24pt;
      color: #1a365d;
      border-bottom: 3px solid #1a365d;
      padding-bottom: 0.5rem;
      margin-top: 0;
    }
    
    h2 {
      font-size: 16pt;
      color: #2d3748;
      margin-top: 1.5rem;
    }
    
    h3 {
      font-size: 13pt;
      color: #4a5568;
    }
    
    .score-box {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
    }
    
    .score-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin: 1rem 0;
    }
    
    .score-item {
      text-align: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .score-value {
      font-size: 24pt;
      font-weight: bold;
      color: #1a365d;
    }
    
    .score-label {
      font-size: 10pt;
      color: #718096;
      text-transform: uppercase;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 10pt;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
      text-align: left;
    }
    
    th {
      background: #f7fafc;
      font-weight: bold;
    }
    
    .risk-critical { background: #EF4444; color: white; padding: 2px 8px; border-radius: 4px; }
    .risk-high { background: #F97316; color: white; padding: 2px 8px; border-radius: 4px; }
    .risk-medium { background: #EAB308; color: black; padding: 2px 8px; border-radius: 4px; }
    .risk-low { background: #22C55E; color: white; padding: 2px 8px; border-radius: 4px; }
  </style>
</head>
<body>
  ${options.includeCoverPage ? `
  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-logo">RiskFixer</div>
    <div class="cover-title">Security Assessment Report</div>
    <div class="cover-subtitle">${assessment.name}</div>
    <div class="cover-risk-badge" style="background: ${riskColor};">
      OVERALL RISK: ${overallClassification}<br>
      <span style="font-size: 14pt;">Score: ${overallScore}/125</span>
    </div>
    <div class="cover-meta">
      <strong>CONFIDENTIAL</strong><br><br>
      Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString()}<br>
      Prepared by: RiskFixer Security Consulting
    </div>
  </div>
  ` : ''}
  
  <!-- EXECUTIVE SUMMARY -->
  <div class="content-page">
    <h1>EXECUTIVE SUMMARY</h1>
    
    <div class="score-box">
      <div style="font-size: 14pt; font-weight: bold; color: ${riskColor};">
        OVERALL RISK RATING: ${overallClassification}
      </div>
      <div style="font-size: 18pt; font-weight: bold; margin-top: 0.5rem;">
        Score: ${overallScore}/125
      </div>
    </div>
    
    <div style="margin-top: 1.5rem;">
      ${executiveSummary.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
    </div>
    
    <h2>Risk Score Breakdown</h2>
    <div class="score-grid">
      <div class="score-item">
        <div class="score-value">${avgThreat}/5</div>
        <div class="score-label">Threat</div>
      </div>
      <div class="score-item">
        <div class="score-value">${avgVuln}/5</div>
        <div class="score-label">Vulnerability</div>
      </div>
      <div class="score-item">
        <div class="score-value">${avgImpact}/5</div>
        <div class="score-label">Impact</div>
      </div>
      <div class="score-item">
        <div class="score-value" style="color: ${riskColor};">${overallScore}</div>
        <div class="score-label">Overall</div>
      </div>
    </div>
  </div>
  
  <!-- RISK SCENARIOS -->
  <div class="content-page">
    <h1>RISK SCENARIOS</h1>
    
    <table>
      <thead>
        <tr>
          <th>Scenario</th>
          <th>T</th>
          <th>V</th>
          <th>I</th>
          <th>Risk</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        ${scenarios.map((s: any) => `
          <tr>
            <td>${s.threatId?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</td>
            <td>${s.threatLikelihood}</td>
            <td>${s.vulnerability}</td>
            <td>${s.impact}</td>
            <td><strong>${s.inherentRisk}</strong></td>
            <td><span class="risk-${s.riskLevel}">${s.riskLevel?.toUpperCase()}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <!-- CONCLUSION -->
  <div class="content-page">
    <h1>CONCLUSION</h1>
    ${conclusion.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
    
    <h2>Data Sources</h2>
    <ul>
      <li>Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString()}</li>
      <li>Methodology: ASIS International Security Risk Assessment (SRA) Standard</li>
      <li>Risk Calculation: T × V × I Formula</li>
    </ul>
  </div>
  
  <!-- APPENDIX: RATING SCALE -->
  <div class="content-page">
    <h1>APPENDIX: T×V×I Rating Scale</h1>
    
    <h2>Component Ratings (1-5)</h2>
    <table>
      <thead>
        <tr>
          <th>Score</th>
          <th>Rating</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1/5</td><td>Minimal</td><td>Minimal threat/vulnerability/impact</td></tr>
        <tr><td>2/5</td><td>Low</td><td>Low threat/vulnerability/impact</td></tr>
        <tr><td>3/5</td><td>Moderate</td><td>Moderate threat/vulnerability/impact</td></tr>
        <tr><td>4/5</td><td>Significant</td><td>Significant threat/vulnerability/impact</td></tr>
        <tr><td>5/5</td><td>Critical</td><td>Critical threat/vulnerability/impact</td></tr>
      </tbody>
    </table>
    
    <h2>Overall Risk Classification (1-125)</h2>
    <table>
      <thead>
        <tr>
          <th>Score Range</th>
          <th>Classification</th>
          <th>Action Required</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1–10</td><td class="risk-low">NEGLIGIBLE</td><td>Accept risk; document only</td></tr>
        <tr><td>11–25</td><td style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 4px;">LOW</td><td>Monitor and review quarterly</td></tr>
        <tr><td>26–50</td><td class="risk-medium">MODERATE</td><td>Address within 90 days</td></tr>
        <tr><td>51–75</td><td class="risk-high">ELEVATED</td><td>Address within 30 days</td></tr>
        <tr><td>76–125</td><td class="risk-critical">CRITICAL</td><td>Immediate action required</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>
`;
}
```

---

# STEP 6: PHOTO TAB ENHANCEMENTS

## Task 6.1: Create Enhanced Photos Tab

Create file: `client/src/components/photos/PhotosTab.tsx`

```typescript
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Camera, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: number;
  filename: string;
  url: string;
  caption: string;
  location?: string;
  aiAnalysis?: string;
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'failed';
}

interface PhotosTabProps {
  assessmentId: number;
  photos: Photo[];
}

export function PhotosTab({ assessmentId, photos }: PhotosTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    setIsUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }
    
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/photos`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      toast({ title: 'Photos uploaded successfully' });
      queryClient.invalidateQueries({ queryKey: ['photos', assessmentId] });
    } catch (error) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  
  const analyzePhoto = useMutation({
    mutationFn: async (photoId: number) => {
      const res = await fetch(`/api/assessments/${assessmentId}/photos/${photoId}/analyze`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Analysis failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', assessmentId] });
    },
  });
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Assessment Photos</h2>
          <p className="text-sm text-gray-500">
            Upload photos from site walks for AI analysis and report inclusion
          </p>
        </div>
        
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Button disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Photos
          </Button>
        </label>
      </div>
      
      {/* Photo Grid */}
      {photos.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Camera className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos Yet</h3>
            <p className="text-gray-500 mb-4">
              Upload photos from your site walk for AI-powered security analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square relative">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Assessment photo'}
                  className="w-full h-full object-cover"
                />
                {photo.analysisStatus === 'complete' && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    AI Analyzed
                  </div>
                )}
                {photo.analysisStatus === 'analyzing' && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Analyzing
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {photo.caption || 'Untitled Photo'}
                </p>
                {photo.location && (
                  <p className="text-xs text-gray-500 truncate">{photo.location}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Photo Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPhoto(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="w-full rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Caption</label>
                  <Input
                    value={selectedPhoto.caption || ''}
                    placeholder="Enter caption..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <Input
                    value={selectedPhoto.location || ''}
                    placeholder="e.g., Front Entry, Parking Area..."
                    className="mt-1"
                  />
                </div>
                
                {selectedPhoto.analysisStatus === 'complete' && selectedPhoto.aiAnalysis && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">AI Analysis</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      {selectedPhoto.aiAnalysis}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {selectedPhoto.analysisStatus !== 'complete' && (
                    <Button
                      onClick={() => analyzePhoto.mutate(selectedPhoto.id)}
                      disabled={analyzePhoto.isPending}
                    >
                      {analyzePhoto.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Run AI Analysis
                    </Button>
                  )}
                  <Button variant="outline">Save Changes</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

# STEP 7: DATABASE SCHEMA UPDATES

## Task 7.1: Add Reports Table

Add to your Drizzle schema (`server/db/schema.ts`):

```typescript
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  assessmentId: integer('assessment_id').references(() => assessments.id).notNull(),
  type: text('type').notNull(), // 'executive_summary', 'full_assessment', 'gap_analysis'
  typeName: text('type_name').notNull(),
  filename: text('filename').notNull(),
  pdfData: bytea('pdf_data'), // Store PDF binary
  pageCount: integer('page_count').default(0),
  fileSize: text('file_size'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## Task 7.2: Run Migration

```bash
npm run db:push
# or
npx drizzle-kit push:pg
```

---

# STEP 8: TESTING CHECKLIST

## Frontend Tests

- [ ] Tab navigation switches correctly between all 5 tabs
- [ ] Risk Profile shows "No data" state when no scenarios exist
- [ ] Risk Profile displays correct T×V×I scores
- [ ] Risk scenarios list sorts by score (highest first)
- [ ] Clicking a scenario opens the detail modal
- [ ] Report type selector highlights selected type
- [ ] Generate Report button shows loading state
- [ ] Report appears in history after generation
- [ ] Download button triggers PDF download
- [ ] Photo upload accepts multiple files
- [ ] Photo grid displays thumbnails correctly
- [ ] AI analysis runs and displays results

## API Tests

```bash
# Test risk profile endpoint
curl http://localhost:5000/api/assessments/1/risk-profile

# Test report generation
curl -X POST http://localhost:5000/api/assessments/1/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"reportType": "full_assessment", "options": {"includeCoverPage": true}}'

# Test report list
curl http://localhost:5000/api/assessments/1/reports

# Test report download
curl http://localhost:5000/api/assessments/1/reports/{reportId}/download --output report.pdf
```

## PDF Quality Tests

- [ ] Cover page renders with correct branding
- [ ] Risk scores display correctly
- [ ] Tables render without breaking across pages
- [ ] Footer shows page numbers
- [ ] PDF opens in standard viewers (Chrome, Adobe, Preview)

---

# SUMMARY

## Step Order

1. **Step 1:** Tab Navigation + Assessment Header
2. **Step 2:** Risk Profile Tab (all dashboard components)
3. **Step 3:** Reports Tab (frontend components)
4. **Step 4:** Report Generation API (backend routes)
5. **Step 5:** PDF Generation (Puppeteer + templates)
6. **Step 6:** Photos Tab enhancements
7. **Step 7:** Database schema updates
8. **Step 8:** Testing

## Files to Create

| Location | File |
|----------|------|
| `client/src/components/layout/` | `TabNavigation.tsx`, `AssessmentHeader.tsx` |
| `client/src/components/risk-profile/` | `RiskProfileTab.tsx`, `OverallRiskCard.tsx`, `RiskScenarioList.tsx`, `RecommendationsSummary.tsx`, `EvidenceTrail.tsx`, `ScenarioDetailModal.tsx` |
| `client/src/components/reports/` | `ReportsTab.tsx`, `ReportTypeSelector.tsx`, `ReportOptions.tsx`, `ReportHistory.tsx` |
| `client/src/components/photos/` | `PhotosTab.tsx` |
| `server/services/report-generator/` | `index.ts`, `narrative-generator.ts`, `html-renderer.ts` |
| `server/db/` | Update `schema.ts` with reports table |
| `server/` | Update `routes.ts` with new endpoints |

---

**END OF INSTRUCTIONS**
