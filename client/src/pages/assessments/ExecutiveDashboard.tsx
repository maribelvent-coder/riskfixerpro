import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoGenerateRisks } from "@/hooks/useAutoGenerateRisks";
import { useAssessmentMetadataAutosave } from "@/hooks/useAssessmentMetadataAutosave";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Save,
  Loader2,
  User,
  DollarSign,
  Eye,
  Car,
  Home,
  Users,
  Target,
  MapPin,
  ListChecks,
  Download,
  TrendingUp,
  AlertCircle,
  FileText,
  Crosshair,
  Lock,
  Globe,
  Smartphone,
  Plane,
  ChevronRight
} from "lucide-react";

interface EPDashboardData {
  assessmentId: string;
  generatedAt: string;
  mode: 'ai' | 'algorithmic' | 'hybrid';
  aiConfidence: 'high' | 'medium' | 'low' | 'fallback';
  processingTimeMs: number;
  
  overviewMetrics: {
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
  
  principalSummary: {
    name: string | null;
    publicExposure: string | null;
    travelRisk: string | null;
    familyExposure: string | null;
    digitalRisk: string | null;
    currentProtectionLevel: string;
  };
  
  threatMatrix: {
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
  
  topRiskSignals: {
    category: string;
    signal: string;
    severity: string;
    sourceQuestionId: string;
  }[];
  
  prioritizedControls: {
    controlId: string;
    controlName: string;
    category: string;
    urgency: string;
    addressesThreats: string[];
    rationale: string;
    implementationDifficulty: string;
  }[];
  
  completionGaps: {
    section: string;
    missingQuestions: string[];
    impactOnAssessment: string;
  }[];
  
  nextSteps: {
    priority: string;
    action: string;
    rationale: string;
  }[];
}

interface InterviewResponses {
  [key: string]: any;
}

const PUBLIC_PROFILE_OPTIONS = [
  { value: 'private', label: 'Private (No Public Information)' },
  { value: 'low', label: 'Low (Minimal Public Presence)' },
  { value: 'medium', label: 'Medium (Industry Professional)' },
  { value: 'high', label: 'High (Public Figure)' },
  { value: 'very_high', label: 'Very High (Celebrity/Political)' },
];

const NET_WORTH_OPTIONS = [
  { value: 'under_1m', label: 'Under $1M' },
  { value: '1m_5m', label: '$1M - $5M' },
  { value: '5m_10m', label: '$5M - $10M' },
  { value: '10m_50m', label: '$10M - $50M' },
  { value: '50m_100m', label: '$50M - $100M' },
  { value: 'over_100m', label: 'Over $100M' },
];

const TRAVEL_FREQUENCY_OPTIONS = [
  { value: 'rare', label: 'Rare (Few times per year)' },
  { value: 'occasional', label: 'Occasional (Monthly)' },
  { value: 'frequent', label: 'Frequent (Weekly)' },
  { value: 'constant', label: 'Constant (Daily travel)' },
];

const SECURITY_LEVEL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'minimal', label: 'Minimal (Basic Awareness)' },
  { value: 'moderate', label: 'Moderate (Some Measures)' },
  { value: 'enhanced', label: 'Enhanced (Multiple Measures)' },
  { value: 'comprehensive', label: 'Comprehensive (24/7 Detail)' },
];

function getRiskColor(classification: string): string {
  switch (classification) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-muted-foreground';
  }
}

function getRiskBadgeVariant(classification: string): "destructive" | "secondary" | "outline" | "default" {
  switch (classification) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
}

export default function ExecutiveDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [assessmentTitle, setAssessmentTitle] = useState<string>('');
  const [assessmentLocation, setAssessmentLocation] = useState<string>('');
  const [assessmentAssessor, setAssessmentAssessor] = useState<string>('');
  const [metadataInitialized, setMetadataInitialized] = useState(false);

  const [interviewResponses, setInterviewResponses] = useState<InterviewResponses>({
    ep_principal_name: '',
    ep_public_profile_level: 'medium',
    ep_net_worth_range: '',
    ep_travel_frequency: 'occasional',
    ep_international_travel: 'no',
    ep_international_high_risk: 'no',
    ep_known_threats: 'no',
    ep_threat_perception: '5',
    ep_family_members: '',
    ep_minor_children: 'no',
    ep_family_public_exposure: 'no',
    ep_daily_routine_predictability: 'somewhat_predictable',
    ep_social_media_presence: 'moderate',
    ep_current_security_level: 'minimal',
    ep_protection_detail: 'no',
    ep_residence_security_level: 'basic',
    ep_vehicle_armored: 'no',
  });
  
  const [dashboardData, setDashboardData] = useState<EPDashboardData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const metadataData = useMemo(() => ({
    title: assessmentTitle,
    location: assessmentLocation,
    assessor: assessmentAssessor,
  }), [assessmentTitle, assessmentLocation, assessmentAssessor]);

  useAssessmentMetadataAutosave({
    assessmentId: id,
    data: metadataData,
    enabled: metadataInitialized,
    onSaveSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id] });
    },
  });

  useEffect(() => {
    setMetadataInitialized(false);
  }, [id]);

  const { data: assessment, isLoading } = useQuery<any>({
    queryKey: ['/api/assessments', id],
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const [interviewInitialized, setInterviewInitialized] = useState(false);

  useEffect(() => {
    if (assessment && !metadataInitialized) {
      setAssessmentTitle(assessment.title || '');
      setAssessmentLocation(assessment.location || '');
      setAssessmentAssessor(assessment.assessor || '');
      setMetadataInitialized(true);
    }
    if (assessment && !interviewInitialized) {
      const existingData = assessment.interviewData || assessment.executiveProfile || {};
      if (Object.keys(existingData).length > 0) {
        setInterviewResponses(prev => ({
          ...prev,
          ep_principal_name: existingData.ep_principal_name || existingData.fullName || prev.ep_principal_name,
          ep_public_profile_level: existingData.ep_public_profile_level || existingData.publicProfile || prev.ep_public_profile_level,
          ep_net_worth_range: existingData.ep_net_worth_range || existingData.netWorthRange || prev.ep_net_worth_range,
          ep_travel_frequency: existingData.ep_travel_frequency || prev.ep_travel_frequency,
          ep_international_travel: existingData.ep_international_travel || prev.ep_international_travel,
          ep_international_high_risk: existingData.ep_international_high_risk || prev.ep_international_high_risk,
          ep_known_threats: existingData.ep_known_threats || prev.ep_known_threats,
          ep_threat_perception: existingData.ep_threat_perception || prev.ep_threat_perception,
          ep_family_members: existingData.ep_family_members || prev.ep_family_members,
          ep_minor_children: existingData.ep_minor_children || prev.ep_minor_children,
          ep_family_public_exposure: existingData.ep_family_public_exposure || prev.ep_family_public_exposure,
          ep_daily_routine_predictability: existingData.ep_daily_routine_predictability || prev.ep_daily_routine_predictability,
          ep_social_media_presence: existingData.ep_social_media_presence || existingData.mediaExposure || prev.ep_social_media_presence,
          ep_current_security_level: existingData.ep_current_security_level || existingData.currentSecurityLevel || prev.ep_current_security_level,
          ep_protection_detail: existingData.ep_protection_detail || (existingData.hasPersonalProtection ? 'yes' : prev.ep_protection_detail),
          ep_residence_security_level: existingData.ep_residence_security_level || prev.ep_residence_security_level,
          ep_vehicle_armored: existingData.ep_vehicle_armored || (existingData.hasArmoredVehicle ? 'yes' : prev.ep_vehicle_armored),
        }));
      }
      setInterviewInitialized(true);
    }
  }, [assessment, metadataInitialized, interviewInitialized]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const profileData = {
        fullName: interviewResponses.ep_principal_name || '',
        publicProfile: interviewResponses.ep_public_profile_level || 'medium',
        netWorthRange: interviewResponses.ep_net_worth_range || '',
        mediaExposure: interviewResponses.ep_social_media_presence || 'moderate',
        currentSecurityLevel: interviewResponses.ep_current_security_level || 'minimal',
        hasPersonalProtection: interviewResponses.ep_protection_detail === 'yes',
        hasPanicRoom: false,
        hasArmoredVehicle: interviewResponses.ep_vehicle_armored === 'yes',
        annualProtectionBudget: 0,
        insuranceDeductible: 0,
        dailyLossOfValue: 0,
      };
      return apiRequest('POST', `/api/assessments/${id}/executive-profile`, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id] });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      await saveProfileMutation.mutateAsync();
      const response = await apiRequest('POST', `/api/assessments/${id}/ep-dashboard`, {
        interviewResponses,
        attachments: [],
      });
      return response as unknown as EPDashboardData;
    },
    onSuccess: (data) => {
      setDashboardData(data);
      setIsAnalyzing(false);
      toast({
        title: 'Analysis Complete',
        description: `Generated ${data.threatMatrix.length} threat assessments. Risk Level: ${data.overviewMetrics.riskClassification.toUpperCase()}`,
      });
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to generate risk assessment',
        variant: 'destructive',
      });
    },
  });

  const handleAnalyze = () => {
    if (!interviewResponses.ep_principal_name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Principal name is required.',
        variant: 'destructive',
      });
      return;
    }
    analyzeMutation.mutate();
  };

  const updateResponse = (key: string, value: any) => {
    setInterviewResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleExportSurvey = () => {
    const dataStr = JSON.stringify(interviewResponses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ep-survey-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Survey Exported', description: 'Survey data downloaded as JSON file.' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Executive Protection</h1>
            <p className="text-sm text-muted-foreground">
              T×V×I×E Risk Assessment Framework
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportSurvey}
            data-testid="button-export-survey"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Survey Data
          </Button>
          <Badge variant="outline" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            EP Framework
          </Badge>
        </div>
      </div>

      {dashboardData && dashboardData.completionGaps.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-orange-500">Interview Incomplete</p>
                <p className="text-sm text-muted-foreground">
                  {dashboardData.overviewMetrics.interviewCompletion}% complete. 
                  Complete more sections for a more accurate assessment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="risk" data-testid="tab-risk">Risk Matrix</TabsTrigger>
          <TabsTrigger value="controls" data-testid="tab-controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {!dashboardData ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete the Profile tab and run analysis to see the risk intelligence dashboard.
                </p>
                <Button onClick={() => setActiveTab('profile')} data-testid="button-go-to-profile">
                  Go to Profile
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Overall Risk Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-bold ${getRiskColor(dashboardData.overviewMetrics.riskClassification)}`}>
                        {dashboardData.overviewMetrics.overallRiskScore}
                      </span>
                      <Badge variant={getRiskBadgeVariant(dashboardData.overviewMetrics.riskClassification)}>
                        {dashboardData.overviewMetrics.riskClassification.toUpperCase()}
                      </Badge>
                    </div>
                    <Progress 
                      value={dashboardData.overviewMetrics.overallRiskScore} 
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
                        {dashboardData.overviewMetrics.exposureFactor.toFixed(1)}x
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Visibility multiplier based on public profile
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Threat Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-red-500">{dashboardData.overviewMetrics.criticalThreats}</span>
                        <p className="text-xs text-muted-foreground">Critical</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-orange-500">{dashboardData.overviewMetrics.highThreats}</span>
                        <p className="text-xs text-muted-foreground">High</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-muted-foreground">{dashboardData.overviewMetrics.threatCount}</span>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Top Risk Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.topRiskSignals.slice(0, 5).map((signal, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/50">
                          <Badge 
                            variant={signal.severity === 'critical_indicator' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {signal.severity.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm">{signal.signal}</span>
                        </div>
                      ))}
                      {dashboardData.topRiskSignals.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No critical risk signals identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.nextSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Badge 
                            variant={step.priority === 'high' ? 'destructive' : step.priority === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs shrink-0"
                          >
                            {step.priority}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{step.action}</p>
                            <p className="text-xs text-muted-foreground">{step.rationale}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Principal Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{dashboardData.principalSummary.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Public Exposure</p>
                      <p className="font-medium capitalize">{dashboardData.principalSummary.publicExposure || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Travel Risk</p>
                      <p className="font-medium capitalize">{dashboardData.principalSummary.travelRisk || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Family Exposure</p>
                      <p className="font-medium">{dashboardData.principalSummary.familyExposure}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Digital Risk</p>
                      <p className="font-medium">{dashboardData.principalSummary.digitalRisk}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Protection Level</p>
                      <p className="font-medium">{dashboardData.principalSummary.currentProtectionLevel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Principal Information
              </CardTitle>
              <CardDescription>
                Enter executive details for threat assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 pb-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Assessment Name</Label>
                    <input
                      type="text"
                      value={assessmentTitle}
                      onChange={(e) => setAssessmentTitle(e.target.value)}
                      placeholder="EP Assessment - John Smith"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      data-testid="input-assessment-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <input
                      type="text"
                      value={assessmentLocation}
                      onChange={(e) => setAssessmentLocation(e.target.value)}
                      placeholder="New York, NY"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      data-testid="input-assessment-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assessor</Label>
                    <input
                      type="text"
                      value={assessmentAssessor}
                      onChange={(e) => setAssessmentAssessor(e.target.value)}
                      placeholder="Jane Doe, CPP"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      data-testid="input-assessment-assessor"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Principal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <input
                      type="text"
                      value={interviewResponses.ep_principal_name}
                      onChange={(e) => updateResponse('ep_principal_name', e.target.value)}
                      placeholder="John Smith"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      data-testid="input-principal-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Net Worth Range</Label>
                    <Select 
                      value={interviewResponses.ep_net_worth_range} 
                      onValueChange={(v) => updateResponse('ep_net_worth_range', v)}
                    >
                      <SelectTrigger data-testid="select-net-worth">
                        <SelectValue placeholder="Select range..." />
                      </SelectTrigger>
                      <SelectContent>
                        {NET_WORTH_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Public Exposure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Public Profile Level</Label>
                    <Select 
                      value={interviewResponses.ep_public_profile_level} 
                      onValueChange={(v) => updateResponse('ep_public_profile_level', v)}
                    >
                      <SelectTrigger data-testid="select-public-profile">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PUBLIC_PROFILE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Social Media Presence</Label>
                    <Select 
                      value={interviewResponses.ep_social_media_presence} 
                      onValueChange={(v) => updateResponse('ep_social_media_presence', v)}
                    >
                      <SelectTrigger data-testid="select-social-media">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  Travel Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Travel Frequency</Label>
                    <Select 
                      value={interviewResponses.ep_travel_frequency} 
                      onValueChange={(v) => updateResponse('ep_travel_frequency', v)}
                    >
                      <SelectTrigger data-testid="select-travel-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAVEL_FREQUENCY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={interviewResponses.ep_international_travel === 'yes'}
                        onCheckedChange={(c) => updateResponse('ep_international_travel', c ? 'yes' : 'no')}
                        data-testid="checkbox-international-travel"
                      />
                      <Label className="cursor-pointer">International Travel</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={interviewResponses.ep_international_high_risk === 'yes'}
                        onCheckedChange={(c) => updateResponse('ep_international_high_risk', c ? 'yes' : 'no')}
                        data-testid="checkbox-high-risk-destinations"
                      />
                      <Label className="cursor-pointer">High-Risk Destinations</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Family Exposure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={interviewResponses.ep_minor_children === 'yes'}
                        onCheckedChange={(c) => updateResponse('ep_minor_children', c ? 'yes' : 'no')}
                        data-testid="checkbox-minor-children"
                      />
                      <Label className="cursor-pointer">Minor Children</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={interviewResponses.ep_family_public_exposure === 'yes'}
                        onCheckedChange={(c) => updateResponse('ep_family_public_exposure', c ? 'yes' : 'no')}
                        data-testid="checkbox-family-exposure"
                      />
                      <Label className="cursor-pointer">Family Has Public Exposure</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Threat History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={interviewResponses.ep_known_threats === 'yes'}
                        onCheckedChange={(c) => updateResponse('ep_known_threats', c ? 'yes' : 'no')}
                        data-testid="checkbox-known-threats"
                      />
                      <Label className="cursor-pointer text-orange-500">Known Threats or Adversaries</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Self-Rated Threat Perception (1-10)</Label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={interviewResponses.ep_threat_perception}
                      onChange={(e) => updateResponse('ep_threat_perception', e.target.value)}
                      className="flex h-9 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      data-testid="input-threat-perception"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Current Security Posture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Security Level</Label>
                    <Select 
                      value={interviewResponses.ep_current_security_level} 
                      onValueChange={(v) => updateResponse('ep_current_security_level', v)}
                    >
                      <SelectTrigger data-testid="select-security-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECURITY_LEVEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={interviewResponses.ep_protection_detail === 'yes'}
                        onCheckedChange={(c) => updateResponse('ep_protection_detail', c ? 'yes' : 'no')}
                        data-testid="checkbox-protection-detail"
                      />
                      <Label className="cursor-pointer">Has Protection Detail</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={interviewResponses.ep_vehicle_armored === 'yes'}
                        onCheckedChange={(c) => updateResponse('ep_vehicle_armored', c ? 'yes' : 'no')}
                        data-testid="checkbox-armored-vehicle"
                      />
                      <Label className="cursor-pointer">Armored Vehicle</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
                data-testid="button-analyze"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI Engine...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Analyze Threats (T×V×I×E)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          {!dashboardData ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Crosshair className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Threat Matrix</h3>
                <p className="text-muted-foreground mb-4">
                  Complete the profile and run analysis to see the threat matrix.
                </p>
                <Button onClick={() => setActiveTab('profile')}>
                  Go to Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crosshair className="h-5 w-5" />
                    Threat Matrix (T×V×I×E)
                  </CardTitle>
                  <CardDescription>
                    AI-generated threat assessments using Threat × Vulnerability × Impact × Exposure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.threatMatrix.map((threat, idx) => (
                      <Card key={idx} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-base">{threat.threatName}</CardTitle>
                              <CardDescription>{threat.category}</CardDescription>
                            </div>
                            <Badge variant={getRiskBadgeVariant(threat.riskScore.classification)}>
                              Risk: {threat.riskScore.normalized}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <p className="text-xs text-muted-foreground">Threat (T)</p>
                              <p className="text-lg font-bold">{threat.threatLikelihood.score}/10</p>
                            </div>
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <p className="text-xs text-muted-foreground">Vulnerability (V)</p>
                              <p className="text-lg font-bold">{threat.vulnerability.score}/10</p>
                            </div>
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <p className="text-xs text-muted-foreground">Impact (I)</p>
                              <p className="text-lg font-bold">{threat.impact.score}/10</p>
                            </div>
                            <div className="text-center p-2 bg-muted/50 rounded">
                              <p className="text-xs text-muted-foreground">Exposure (E)</p>
                              <p className="text-lg font-bold">{threat.exposureFactor.score}/5</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{threat.scenarioDescription}</p>
                          {threat.vulnerability.controlGaps.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium text-orange-500 mb-1">Control Gaps:</p>
                              <div className="flex flex-wrap gap-1">
                                {threat.vulnerability.controlGaps.map((gap, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{gap}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          {!dashboardData ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Control Recommendations</h3>
                <p className="text-muted-foreground mb-4">
                  Complete the profile and run analysis to see prioritized controls.
                </p>
                <Button onClick={() => setActiveTab('profile')}>
                  Go to Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Prioritized Control Recommendations
                </CardTitle>
                <CardDescription>
                  AI-recommended security controls based on identified threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.prioritizedControls.map((control, idx) => (
                    <Card key={idx}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={control.urgency === 'immediate' ? 'destructive' : control.urgency === 'short_term' ? 'secondary' : 'outline'}
                              >
                                {control.urgency.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {control.implementationDifficulty}
                              </Badge>
                            </div>
                            <h4 className="font-medium">{control.controlName}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{control.rationale}</p>
                            {control.addressesThreats.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-xs text-muted-foreground">Addresses:</span>
                                {control.addressesThreats.slice(0, 3).map((t, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{t.replace('_', ' ')}</Badge>
                                ))}
                                {control.addressesThreats.length > 3 && (
                                  <Badge variant="outline" className="text-xs">+{control.addressesThreats.length - 3} more</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {dashboardData.prioritizedControls.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">No additional controls recommended</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
