import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  User,
  Target,
  ListChecks,
  TrendingUp,
  AlertCircle,
  FileText,
  Lock,
  RefreshCw,
  ClipboardCheck,
  ChevronRight,
  Info
} from "lucide-react";

interface EvidenceChainItem {
  source: 'interview' | 'cap_index' | 'osint' | 'site_observation' | 'threat_intel';
  questionId?: string;
  finding: string;
  weight: 'critical' | 'significant' | 'moderate' | 'minor';
}

interface SectionAssessment {
  sectionId: string;
  sectionName: string;
  riskIndicators: number;
  totalQuestions: number;
  keyFindings: string[];
  aiNarrative: string;
}

interface EPDashboardData {
  cached: boolean;
  interviewCompletion: number;
  answeredQuestions: number;
  totalQuestions: number;
  
  overviewMetrics?: {
    overallRiskScore: number;
    riskClassification: 'critical' | 'high' | 'medium' | 'low';
    exposureFactor: number;
    threatCount: number;
    criticalThreats: number;
    highThreats: number;
    interviewCompletion: number;
    activeControls: number;
    controlGaps: number;
  };
  
  componentSummaries?: {
    threat: { overallScore: number; narrative: string; };
    vulnerability: { overallScore: number; narrative: string; };
    impact: { overallScore: number; narrative: string; };
    exposure: { overallScore: number; narrative: string; };
  };
  
  principalSummary?: {
    name: string | null;
    publicExposure: string | null;
    travelRisk: string | null;
    familyExposure: string | null;
    digitalRisk: string | null;
    currentProtectionLevel: string;
  };
  
  sectionAssessments?: SectionAssessment[];
  
  threatMatrix?: {
    threatId: string;
    threatName: string;
    category: string;
    threatLikelihood: { score: number; label: string; evidence: string[]; reasoning?: string; };
    vulnerability: { score: number; label: string; controlGaps: string[]; existingControls: string[]; reasoning?: string; };
    impact: { score: number; label: string; reasoning?: string; };
    exposureFactor: { score: number; label: string; reasoning?: string; };
    riskScore: { raw: number; normalized: number; classification: string; };
    scenarioDescription: string;
    evidenceTrail?: string[] | EvidenceChainItem[];
    confidence?: 'high' | 'medium' | 'low';
    confidenceReasoning?: string;
    priorityControls: { 
      controlId: string; 
      controlName: string; 
      urgency: string; 
      rationale: string;
      estimatedCost?: number;
      effectivenessRating?: number;
    }[];
  }[];
  
  topRiskSignals?: {
    category: string;
    signal: string;
    severity: string;
    sourceQuestionId: string;
  }[];
  
  prioritizedControls?: {
    controlId: string;
    controlName: string;
    category: string;
    urgency: string;
    addressesThreats: string[];
    rationale: string;
    implementationDifficulty: string;
    estimatedCost?: string | number;
    effectivenessRating?: number;
  }[];
  
  completionGaps?: {
    section: string;
    missingQuestions: string[];
    impactOnAssessment: string;
  }[];
  
  nextSteps?: {
    priority: string;
    action: string;
    rationale: string;
  }[];
  
  aiConfidence?: 'high' | 'medium' | 'low';
  assessmentMode?: 'ai' | 'hybrid' | 'fallback';
  confidenceFactors?: string[];
}

// Helper functions for styling
const getRiskColor = (classification: string) => {
  switch (classification) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-muted-foreground';
  }
};

const getRiskBadgeVariant = (classification: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (classification) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'secondary';
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency?.toLowerCase()) {
    case 'immediate': return 'text-red-600';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-muted-foreground';
  }
};

const getEvidenceWeightColor = (weight: string) => {
  switch (weight) {
    case 'critical': return 'bg-red-500/20 text-red-600 border-red-500/30';
    case 'significant': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    case 'moderate': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'minor': return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getSourceLabel = (source: string) => {
  switch (source) {
    case 'interview': return 'Interview';
    case 'cap_index': return 'CAP Index';
    case 'osint': return 'OSINT';
    case 'site_observation': return 'Site Survey';
    case 'threat_intel': return 'Threat Intel';
    default: return source;
  }
};

const formatCurrency = (amount: number | string | undefined) => {
  if (!amount) return 'N/A';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'N/A';
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
};

export default function ExecutiveDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch cached dashboard data including interview completion status
  const { data: dashboardData, isLoading, refetch } = useQuery<EPDashboardData>({
    queryKey: ['/api/assessments', id, 'ep-dashboard'],
    enabled: !!id,
  });

  // Mutation to trigger AI analysis
  const analyzeMutation = useMutation({
    mutationFn: async (forceRefresh: boolean = false) => {
      setIsAnalyzing(true);
      const response = await apiRequest('POST', `/api/assessments/${id}/ep-dashboard`, {
        forceRefresh,
      });
      return response as unknown as EPDashboardData;
    },
    onSuccess: (data) => {
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'ep-dashboard'] });
      toast({
        title: 'Analysis Complete',
        description: `Generated ${data.threatMatrix?.length || 0} threat assessments. Risk Level: ${data.overviewMetrics?.riskClassification?.toUpperCase() || 'UNKNOWN'}`,
      });
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      const errorData = error?.response?.data || error;
      toast({
        title: 'Analysis Failed',
        description: errorData?.message || error.message || 'Failed to generate risk assessment',
        variant: 'destructive',
      });
    },
  });

  const handleRunAnalysis = () => {
    analyzeMutation.mutate(false);
  };

  const handleForceRefresh = () => {
    analyzeMutation.mutate(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasResults = dashboardData?.overviewMetrics;
  const interviewCompletion = dashboardData?.interviewCompletion || 0;
  const answeredQuestions = dashboardData?.answeredQuestions || 0;
  const totalQuestions = dashboardData?.totalQuestions || 43;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Executive Protection Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              6-Layer AI Framework: Logic, Math &amp; Standards-Based Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasResults && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceRefresh}
              disabled={isAnalyzing}
              data-testid="button-refresh-analysis"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Re-Analyze
            </Button>
          )}
          <Badge variant="outline" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            6-Layer AI
          </Badge>
        </div>
      </div>

      {/* Interview Completion Status */}
      <Card className={interviewCompletion < 50 ? "border-orange-500/50 bg-orange-500/5" : interviewCompletion < 100 ? "border-yellow-500/50 bg-yellow-500/5" : "border-green-500/50 bg-green-500/5"}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <ClipboardCheck className={`h-5 w-5 ${interviewCompletion < 50 ? 'text-orange-500' : interviewCompletion < 100 ? 'text-yellow-500' : 'text-green-500'}`} />
              <div>
                <p className="font-medium">Interview Progress: {interviewCompletion}%</p>
                <p className="text-sm text-muted-foreground">
                  {answeredQuestions} of {totalQuestions} questions answered
                </p>
              </div>
            </div>
            <Progress value={interviewCompletion} className="w-32 h-2" />
          </div>
          {interviewCompletion < 20 && (
            <div className="mt-3 flex items-start gap-2 text-sm text-orange-600">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Complete the Executive Interview and Physical Security tabs to enable AI analysis.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      {isAnalyzing ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center text-center mb-6">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <h3 className="text-lg font-medium">Running 6-Layer AI Analysis</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Processing your interview data through our rigorous framework rooted in logic, math, and industry standards
              </p>
            </div>
            
            {/* 6-Layer Framework Description */}
            <div className="max-w-lg mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {[
                  { num: 1, name: "Data Collection" },
                  { num: 2, name: "T×V×I×E Formula" },
                  { num: 3, name: "Industry Standards" },
                  { num: 4, name: "Threat Intelligence" },
                  { num: 5, name: "Control Mapping" },
                  { num: 6, name: "Quantified Scoring" },
                ].map((item) => (
                  <div key={item.num} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                      {item.num}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !hasResults ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">Ready for 6-Layer Analysis</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {interviewCompletion < 20 
                  ? "Complete the Executive Interview to provide data for AI analysis."
                  : "Run the AI to process your data through our rigorous 6-layer framework."}
              </p>
            </div>
            
            {/* 6-Layer Preview */}
            <div className="max-w-lg mx-auto mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {[
                  { num: 1, name: "Data Collection" },
                  { num: 2, name: "Methodology (T×V×I×E)" },
                  { num: 3, name: "Industry Standards" },
                  { num: 4, name: "Threat Intelligence" },
                  { num: 5, name: "Control Mapping" },
                  { num: 6, name: "Quantified Scoring" },
                ].map((item) => (
                  <div key={item.num} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                      {item.num}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleRunAnalysis} 
                disabled={interviewCompletion < 10}
                data-testid="button-run-analysis"
              >
                <Shield className="h-4 w-4 mr-2" />
                Run 6-Layer AI Analysis
              </Button>
              {interviewCompletion < 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Minimum 10% interview completion required
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="threats" data-testid="tab-threats">Risk Matrix</TabsTrigger>
            <TabsTrigger value="controls" data-testid="tab-controls">Controls</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Overall Risk & AI Confidence */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-5xl font-bold ${getRiskColor(dashboardData.overviewMetrics!.riskClassification)}`}>
                      {dashboardData.overviewMetrics!.overallRiskScore}
                    </span>
                    <div>
                      <Badge variant={getRiskBadgeVariant(dashboardData.overviewMetrics!.riskClassification)} className="text-sm">
                        {dashboardData.overviewMetrics!.riskClassification.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">T×V×I×E Score</p>
                    </div>
                  </div>
                  <Progress 
                    value={dashboardData.overviewMetrics!.overallRiskScore} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Exposure Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {dashboardData.overviewMetrics!.exposureFactor.toFixed(1)}
                    </span>
                    <span className="text-lg text-muted-foreground">/5</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Public visibility multiplier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant={dashboardData.aiConfidence === 'high' ? 'default' : 'secondary'}>
                      {(dashboardData.aiConfidence || 'medium').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {dashboardData.assessmentMode === 'ai' ? 'Full AI Analysis' : 
                     dashboardData.assessmentMode === 'hybrid' ? 'Hybrid Analysis' : 'Algorithmic'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* T×V×I×E Component Cards with AI Narratives */}
            {dashboardData.componentSummaries && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-red-500" />
                      Threat (T)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold">{dashboardData.componentSummaries.threat.overallScore.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {dashboardData.componentSummaries.threat.narrative}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Vulnerability (V)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold">{dashboardData.componentSummaries.vulnerability.overallScore.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {dashboardData.componentSummaries.vulnerability.narrative}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                      Impact (I)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold">{dashboardData.componentSummaries.impact.overallScore.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {dashboardData.componentSummaries.impact.narrative}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      Exposure (E)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold">{dashboardData.componentSummaries.exposure.overallScore.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">/5</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {dashboardData.componentSummaries.exposure.narrative}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Threat Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Threat Scenario Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <p className="text-2xl font-bold text-red-500">{dashboardData.overviewMetrics!.criticalThreats}</p>
                    <p className="text-xs text-muted-foreground">Critical</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-500/10">
                    <p className="text-2xl font-bold text-orange-500">{dashboardData.overviewMetrics!.highThreats}</p>
                    <p className="text-xs text-muted-foreground">High</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <p className="text-2xl font-bold text-yellow-600">{(dashboardData.overviewMetrics!.threatCount - dashboardData.overviewMetrics!.criticalThreats - dashboardData.overviewMetrics!.highThreats)}</p>
                    <p className="text-xs text-muted-foreground">Medium/Low</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{dashboardData.overviewMetrics!.threatCount}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Principal Summary */}
            {dashboardData.principalSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Principal Profile Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Public Exposure</p>
                      <p className="font-medium">{dashboardData.principalSummary.publicExposure || 'Not assessed'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Risk</p>
                      <p className="font-medium">{dashboardData.principalSummary.travelRisk || 'Not assessed'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Family Exposure</p>
                      <p className="font-medium">{dashboardData.principalSummary.familyExposure || 'Not assessed'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Digital Risk</p>
                      <p className="font-medium">{dashboardData.principalSummary.digitalRisk || 'Not assessed'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Protection</p>
                      <p className="font-medium">{dashboardData.principalSummary.currentProtectionLevel || 'Not assessed'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section Assessments (7 EP Sections with AI Narratives) */}
            {dashboardData.sectionAssessments && dashboardData.sectionAssessments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5" />
                    Section Assessments
                  </CardTitle>
                  <CardDescription>AI analysis of each interview section with risk indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.sectionAssessments.map((section) => (
                      <div 
                        key={section.sectionId} 
                        data-testid={`section-assessment-${section.sectionId}`}
                        className="p-4 rounded-lg bg-muted/30 border border-muted"
                      >
                        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                          <span className="font-medium text-sm">{section.sectionName}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            section.riskIndicators > 3 ? 'bg-red-500/20 text-red-600' : 
                            section.riskIndicators > 2 ? 'bg-yellow-500/20 text-yellow-600' : 
                            'bg-green-500/20 text-green-600'
                          }`}>
                            {section.riskIndicators}/{section.totalQuestions} risk indicators
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{section.aiNarrative}</p>
                        {section.keyFindings && section.keyFindings.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {section.keyFindings.slice(0, 4).map((finding, j) => (
                              <Badge 
                                key={`${section.sectionId}-finding-${j}`}
                                variant="outline" 
                                className="text-xs"
                              >
                                {finding}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Risk Signals */}
            {dashboardData.topRiskSignals && dashboardData.topRiskSignals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Top Risk Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.topRiskSignals.slice(0, 5).map((signal, i) => (
                      <div key={`signal-${signal.sourceQuestionId}-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <AlertCircle className={`h-5 w-5 mt-0.5 ${getUrgencyColor(signal.severity)}`} />
                        <div>
                          <p className="font-medium">{signal.signal}</p>
                          <p className="text-sm text-muted-foreground">{signal.category}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">{signal.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 6-Layer Methodology Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <ListChecks className="h-4 w-4" />
                  Assessment Methodology: 6-Layer AI Framework
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3">
                  This assessment was processed through our rigorous 6-layer framework:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {[
                    { num: 1, name: "Data Collection", desc: "Interview responses" },
                    { num: 2, name: "T×V×I×E Formula", desc: "Risk calculation" },
                    { num: 3, name: "Industry Standards", desc: "ASIS/CPP guidelines" },
                    { num: 4, name: "Threat Intelligence", desc: "EP threat patterns" },
                    { num: 5, name: "Control Mapping", desc: "Gap analysis" },
                    { num: 6, name: "Quantified Output", desc: "Recommendations" },
                  ].map((layer) => (
                    <div key={layer.num} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                        {layer.num}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{layer.name}</p>
                        <p className="text-muted-foreground truncate">{layer.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Evidence-based scoring rooted in logic, math, and industry standards
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threats Tab */}
          <TabsContent value="threats" className="space-y-4">
            {dashboardData.threatMatrix && dashboardData.threatMatrix.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.threatMatrix.map((threat, i) => (
                  <Card key={threat.threatId || i} className="overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {threat.threatName}
                            {threat.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {threat.confidence} confidence
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{threat.category}</CardDescription>
                        </div>
                        <Badge variant={getRiskBadgeVariant(threat.riskScore.classification)} className="text-sm">
                          {threat.riskScore.classification.toUpperCase()} ({threat.riskScore.normalized})
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-4">{threat.scenarioDescription}</p>
                      
                      {/* T×V×I×E Component Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-red-600">Threat</span>
                            <span className="text-lg font-bold">{threat.threatLikelihood.score}</span>
                          </div>
                          {threat.threatLikelihood.reasoning && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{threat.threatLikelihood.reasoning}</p>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-orange-600">Vulnerability</span>
                            <span className="text-lg font-bold">{threat.vulnerability.score}</span>
                          </div>
                          {threat.vulnerability.reasoning && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{threat.vulnerability.reasoning}</p>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-yellow-600">Impact</span>
                            <span className="text-lg font-bold">{threat.impact.score}</span>
                          </div>
                          {threat.impact.reasoning && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{threat.impact.reasoning}</p>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-blue-600">Exposure</span>
                            <span className="text-lg font-bold">{threat.exposureFactor.score}</span>
                          </div>
                          {threat.exposureFactor.reasoning && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{threat.exposureFactor.reasoning}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Confidence Reasoning */}
                      {threat.confidenceReasoning && (
                        <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Confidence Assessment
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">{threat.confidenceReasoning}</p>
                        </div>
                      )}
                      
                      {/* Evidence Trail - Supports both string arrays and structured objects */}
                      {threat.evidenceTrail && threat.evidenceTrail.length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Evidence Trail
                          </p>
                          <ul className="space-y-2">
                            {threat.evidenceTrail.slice(0, 6).map((evidence, j) => {
                              const isStructured = typeof evidence === 'object' && evidence !== null;
                              const evidenceItem = evidence as EvidenceChainItem;
                              
                              if (isStructured) {
                                return (
                                  <li 
                                    key={`${threat.threatId}-evidence-${j}`} 
                                    data-testid={`text-evidence-${threat.threatId}-${j}`}
                                    className="text-xs flex items-start gap-2 p-2 rounded bg-amber-100/50 dark:bg-amber-900/30"
                                  >
                                    <div className="flex flex-col gap-1 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge 
                                          variant="outline" 
                                          className={`text-[10px] py-0 ${getEvidenceWeightColor(evidenceItem.weight)}`}
                                        >
                                          {evidenceItem.weight}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                          Source: {getSourceLabel(evidenceItem.source)}
                                          {evidenceItem.questionId && ` (${evidenceItem.questionId})`}
                                        </span>
                                      </div>
                                      <span className="text-amber-700 dark:text-amber-300">{evidenceItem.finding}</span>
                                    </div>
                                  </li>
                                );
                              }
                              
                              return (
                                <li 
                                  key={`${threat.threatId}-evidence-${j}`} 
                                  data-testid={`text-evidence-${threat.threatId}-${j}`}
                                  className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2"
                                >
                                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                                  {evidence as string}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      
                      {/* Control Gaps */}
                      {threat.vulnerability.controlGaps && threat.vulnerability.controlGaps.length > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Control Gaps Identified
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {threat.vulnerability.controlGaps.slice(0, 4).map((gap, j) => (
                              <Badge 
                                key={`${threat.threatId}-gap-${j}`} 
                                data-testid={`badge-control-gap-${threat.threatId}-${j}`}
                                variant="outline" 
                                className="text-xs"
                              >
                                {gap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No threat data available. Run AI analysis to generate threat assessments.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-4">
            {dashboardData.prioritizedControls && dashboardData.prioritizedControls.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.prioritizedControls.map((control, i) => (
                  <Card key={control.controlId || i} className="overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {i + 1}
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              {control.controlName}
                            </CardTitle>
                            <CardDescription>{control.category}</CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={control.urgency === 'immediate' ? 'destructive' : 
                                   control.urgency === 'short_term' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {control.urgency.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm mb-4">{control.rationale}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                          <p className="font-medium">{control.implementationDifficulty}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Est. Cost</p>
                          <p className="font-medium">{formatCurrency(control.estimatedCost)}</p>
                        </div>
                        {control.effectivenessRating && (
                          <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Effectiveness</p>
                            <div className="flex items-center gap-2">
                              <Progress value={control.effectivenessRating} className="h-2 flex-1" />
                              <span className="font-medium text-green-600">{control.effectivenessRating}%</span>
                            </div>
                          </div>
                        )}
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Threats Addressed</p>
                          <p className="font-medium">{control.addressesThreats?.length || 0}</p>
                        </div>
                      </div>
                      
                      {control.addressesThreats && control.addressesThreats.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Addresses Threats:</p>
                          <div className="flex flex-wrap gap-1">
                            {control.addressesThreats.slice(0, 5).map((threatName, j) => (
                              <Badge key={`${control.controlId}-threat-${j}`} variant="outline" className="text-xs">
                                {threatName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No control recommendations available. Run AI analysis to generate recommendations.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
