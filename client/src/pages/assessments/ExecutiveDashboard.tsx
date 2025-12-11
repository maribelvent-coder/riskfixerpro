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
  
  principalSummary?: {
    name: string | null;
    publicExposure: string | null;
    travelRisk: string | null;
    familyExposure: string | null;
    digitalRisk: string | null;
    currentProtectionLevel: string;
  };
  
  threatMatrix?: {
    threatId: string;
    threatName: string;
    category: string;
    threatLikelihood: { score: number; label: string; evidence: string[]; };
    vulnerability: { score: number; label: string; controlGaps: string[]; existingControls: string[]; };
    impact: { score: number; label: string; };
    exposureFactor: { score: number; label: string; };
    riskScore: { raw: number; normalized: number; classification: string; };
    scenarioDescription: string;
    priorityControls: { controlId: string; controlName: string; urgency: string; rationale: string; }[];
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${getRiskColor(dashboardData.overviewMetrics!.riskClassification)}`}>
                      {dashboardData.overviewMetrics!.overallRiskScore}
                    </span>
                    <Badge variant={getRiskBadgeVariant(dashboardData.overviewMetrics!.riskClassification)}>
                      {dashboardData.overviewMetrics!.riskClassification.toUpperCase()}
                    </Badge>
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
                    <span className="text-4xl font-bold text-primary">
                      {dashboardData.overviewMetrics!.exposureFactor.toFixed(1)}x
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Visibility multiplier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Threat Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Critical</span>
                      <Badge variant="destructive">{dashboardData.overviewMetrics!.criticalThreats}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">High</span>
                      <Badge variant="secondary">{dashboardData.overviewMetrics!.highThreats}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total</span>
                      <Badge variant="outline">{dashboardData.overviewMetrics!.threatCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
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
              <div className="space-y-3">
                {dashboardData.threatMatrix.map((threat, i) => (
                  <Card key={threat.threatId || i}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{threat.threatName}</CardTitle>
                          <CardDescription>{threat.category}</CardDescription>
                        </div>
                        <Badge variant={getRiskBadgeVariant(threat.riskScore.classification)}>
                          Score: {threat.riskScore.normalized}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{threat.scenarioDescription}</p>
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                        <div className="p-2 rounded bg-muted">
                          <p className="font-semibold">{threat.threatLikelihood.score}</p>
                          <p className="text-xs text-muted-foreground">Threat</p>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <p className="font-semibold">{threat.vulnerability.score}</p>
                          <p className="text-xs text-muted-foreground">Vulnerability</p>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <p className="font-semibold">{threat.impact.score}</p>
                          <p className="text-xs text-muted-foreground">Impact</p>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <p className="font-semibold">{threat.exposureFactor.score}</p>
                          <p className="text-xs text-muted-foreground">Exposure</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No threat data available
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-4">
            {dashboardData.prioritizedControls && dashboardData.prioritizedControls.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.prioritizedControls.map((control, i) => (
                  <Card key={control.controlId || i}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            {control.controlName}
                          </CardTitle>
                          <CardDescription>{control.category}</CardDescription>
                        </div>
                        <Badge className={getUrgencyColor(control.urgency)}>
                          {control.urgency}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{control.rationale}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Difficulty: {control.implementationDifficulty}</span>
                        <Separator orientation="vertical" className="h-3" />
                        <span>Addresses {control.addressesThreats?.length || 0} threats</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No control recommendations available
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
