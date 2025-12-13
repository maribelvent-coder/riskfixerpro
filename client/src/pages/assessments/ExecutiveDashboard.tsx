import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  Loader2,
  User,
  Target,
  TrendingUp,
  FileText,
  Lock,
  RefreshCw,
  ClipboardCheck,
  ChevronRight,
  ChevronDown,
  Info,
  Activity,
  Briefcase,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  Zap,
  Search
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

interface SectionFinding {
  type: 'gap' | 'concern' | 'strength';
  severity: 'critical' | 'high' | 'medium' | 'low';
  finding: string;
  questionId: string;
  evidence: string;
}

interface EnhancedSectionAnalysis {
  sectionId: string;
  sectionName: string;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  findings: SectionFinding[];
  recommendations: string[];
  answeredCount: number;
  totalQuestions: number;
  completionPercentage: number;
  analyzedAt: string;
}

interface FullSectionAnalysisResult {
  assessmentId: string;
  analyzedAt: string;
  sections: EnhancedSectionAnalysis[];
  overallResidentialRisk: number;
  criticalGapsCount: number;
  highGapsCount: number;
}

interface EPDashboardData {
  cached: boolean;
  interviewCompletion: number;
  answeredQuestions: number;
  totalQuestions: number;
  epInterviewAnswered?: number;
  epInterviewTotal?: number;
  physicalSecurityAnswered?: number;
  physicalSecurityTotal?: number;
  
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
    title?: string | null;
    assessorName?: string | null;
    assessmentDate?: string | null;
    executiveSummary?: string;
    keyFindings?: string[];
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
      category?: string;
      justification?: {
        threat: string;
        vulnerability: string;
        mitigation: string;
        roi: string;
      };
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
    justification?: {
      threat: string;
      vulnerability: string;
      mitigation: string;
      roi: string;
    };
  }[];
  
  controlStatus?: {
    category: string;
    implemented: number;
    inProgress: number;
    recommended: number;
    total: number;
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

const StatusBadge = ({ level, size = 'normal' }: { level: string; size?: 'normal' | 'large' }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critical' },
    high: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'High' },
    elevated: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Elevated' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Medium' },
    moderate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Moderate' },
    low: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Low' },
  };
  const c = config[level] || config.moderate;
  const sizeClass = size === 'large' ? 'px-4 py-2 text-sm' : 'px-2 py-1 text-xs';
  return <span className={`${sizeClass} rounded font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
};

const ConfidenceBadge = ({ confidence }: { confidence: 'high' | 'medium' | 'low' }) => {
  const config = {
    high: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2 },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
    low: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
  };
  const c = config[confidence] || config.medium;
  const Icon = c.icon;
  return (
    <span className={`px-3 py-1.5 rounded text-xs font-medium ${c.bg} ${c.text} flex items-center gap-1.5`}>
      <Icon className="w-3.5 h-3.5" />
      {confidence} confidence
    </span>
  );
};

const ScoreGauge = ({ label, score, maxScore = 5, color }: { label: string; score: number; maxScore?: number; color: string }) => {
  const percentage = (score / maxScore) * 100;
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="relative w-16 h-16 mx-auto">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/30" />
          <circle 
            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" 
            className={color}
            strokeDasharray={`${percentage * 1.76} 176`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{score.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colors: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500', orange: 'bg-orange-500'
  };
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div className={`h-2 rounded-full transition-all ${colors[color] || colors.blue}`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

const getEvidenceWeightColor = (weight: string) => {
  switch (weight) {
    case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
    case 'significant': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
    case 'moderate': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    case 'minor': return 'bg-muted text-muted-foreground border-muted';
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
  // If already formatted string with $ or /year, return as-is
  if (typeof amount === 'string') {
    if (amount.includes('$') || amount.includes('/year') || amount.includes('/month')) {
      return amount;
    }
    // Try to parse numeric string
    const num = parseFloat(amount.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return amount; // Return original if can't parse
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  }
  // Number input
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
};

const THREAT_SECTION_MAPPING: Record<string, string[]> = {
  'home_invasion': ['res_perimeter', 'res_access', 'res_alarms', 'res_saferoom', 'res_windows'],
  'residential_burglary': ['res_perimeter', 'res_access', 'res_alarms', 'res_windows', 'res_surveillance'],
  'stalking_surveillance': ['res_perimeter', 'res_surveillance', 'res_monitoring', 'res_landscaping'],
  'stalking': ['res_perimeter', 'res_surveillance', 'res_monitoring', 'res_landscaping'],
  'kidnapping_abduction': ['res_perimeter', 'res_saferoom', 'res_vehicles', 'res_monitoring', 'res_access'],
  'kidnapping': ['res_perimeter', 'res_saferoom', 'res_vehicles', 'res_monitoring', 'res_access'],
  'doxxing_privacy_breach': ['res_property', 'res_monitoring', 'res_interior'],
  'doxxing': ['res_property', 'res_monitoring', 'res_interior'],
  'extortion_blackmail': ['res_monitoring', 'res_saferoom', 'res_interior'],
  'extortion': ['res_monitoring', 'res_saferoom', 'res_interior'],
  'ambush_attack': ['res_perimeter', 'res_vehicles', 'res_surveillance', 'res_landscaping'],
  'ambush': ['res_perimeter', 'res_vehicles', 'res_surveillance', 'res_landscaping'],
  'workplace_violence': ['res_access', 'res_alarms', 'res_saferoom', 'res_monitoring'],
  'travel_incident': ['res_vehicles'],
  'cyber_targeting_social_engineering': ['res_interior', 'res_monitoring'],
  'cyber_targeting': ['res_interior', 'res_monitoring'],
  'family_member_targeting': ['res_perimeter', 'res_access', 'res_saferoom', 'res_monitoring', 'res_alarms'],
  'family_targeting': ['res_perimeter', 'res_access', 'res_saferoom', 'res_monitoring', 'res_alarms'],
  'reputational_attack': ['res_monitoring', 'res_property'],
  'protest_targeting': ['res_perimeter', 'res_surveillance', 'res_saferoom', 'res_access'],
  'burglary': ['res_perimeter', 'res_access', 'res_alarms', 'res_windows', 'res_surveillance'],
  'invasion': ['res_perimeter', 'res_access', 'res_alarms', 'res_saferoom', 'res_windows'],
};

const normalizeEpThreatId = (threatId: string): string => {
  let normalized = threatId.toLowerCase();
  if (normalized.startsWith('threat_')) {
    normalized = normalized.substring(7);
  }
  const severitySuffixes = ['_critical', '_high', '_medium', '_low', '_elevated'];
  for (const suffix of severitySuffixes) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length);
      break;
    }
  }
  return normalized;
};

const getRelatedSections = (threatId: string, category: string): string[] => {
  const normalizedThreat = normalizeEpThreatId(threatId);
  const categoryLower = category.toLowerCase();
  
  if (THREAT_SECTION_MAPPING[normalizedThreat]) {
    return THREAT_SECTION_MAPPING[normalizedThreat];
  }
  
  for (const [key, sections] of Object.entries(THREAT_SECTION_MAPPING)) {
    if (normalizedThreat.includes(key) || key.includes(normalizedThreat) || categoryLower.includes(key)) {
      return sections;
    }
  }
  
  console.warn(`[EP Dashboard] Unmapped threat ID: ${threatId} (normalized: ${normalizedThreat})`);
  return ['res_perimeter', 'res_access', 'res_alarms', 'res_surveillance'];
};

type ThreatScenario = NonNullable<EPDashboardData['threatMatrix']>[number];

export default function ExecutiveDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios' | 'controls' | 'evidence'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ThreatScenario | null>(null);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [sectionAnalysis, setSectionAnalysis] = useState<FullSectionAnalysisResult | null>(null);
  const [isAnalyzingSections, setIsAnalyzingSections] = useState(false);

  // Reset section analysis when assessment id changes and load cached analysis
  useEffect(() => {
    setSectionAnalysis(null);
    setIsAnalyzingSections(false);
    setSelectedScenario(null);
    
    // Load cached section analysis from database (GET request - no AI call)
    if (id) {
      const loadCachedAnalysis = async () => {
        try {
          const response = await fetch(`/api/assessments/${id}/ep-interview/section-analysis`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          if (response.ok) {
            const data = await response.json() as FullSectionAnalysisResult & { cached?: boolean; success?: boolean };
            if (data.success && data.cached && data.sections && Array.isArray(data.sections)) {
              console.log('[EP Dashboard] Loaded cached section analysis');
              setSectionAnalysis(data);
            }
          }
        } catch (error) {
          console.error('Error loading cached section analysis:', error);
        }
      };
      loadCachedAnalysis();
    }
  }, [id]);

  const { data: dashboardData, isLoading, refetch } = useQuery<EPDashboardData>({
    queryKey: ['/api/assessments', id, 'ep-dashboard'],
    enabled: !!id,
  });

  const runSectionAnalysis = async () => {
    try {
      setIsAnalyzingSections(true);
      const response = await apiRequest('POST', `/api/assessments/${id}/ep-interview/section-analysis`, {});
      const data = await response.json() as FullSectionAnalysisResult;
      
      if (data && data.sections && Array.isArray(data.sections)) {
        setSectionAnalysis(data);
      } else {
        console.error('[Section Analysis] Invalid response structure:', data);
      }
    } catch (error: any) {
      console.error('Section analysis error:', error);
    } finally {
      setIsAnalyzingSections(false);
    }
  };

  const analyzeMutation = useMutation({
    mutationFn: async (forceRefresh: boolean = false) => {
      setIsAnalyzing(true);
      const response = await apiRequest('POST', `/api/assessments/${id}/ep-dashboard`, {
        forceRefresh,
      });
      return await response.json() as EPDashboardData;
    },
    onSuccess: async (data) => {
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'ep-dashboard'] });
      toast({
        title: 'Analysis Complete',
        description: `Generated ${data.threatMatrix?.length || 0} threat assessments. Risk Level: ${data.overviewMetrics?.riskClassification?.toUpperCase() || 'UNKNOWN'}`,
      });
      
      // Automatically run section analysis after main analysis
      await runSectionAnalysis();
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      toast({
        title: 'Analysis Failed',
        description: error?.message || 'Failed to generate risk assessment',
        variant: 'destructive',
      });
    },
  });

  const handleRunAnalysis = () => analyzeMutation.mutate(false);
  const handleForceRefresh = () => analyzeMutation.mutate(true);

  const handleGenerateReport = async (reportType: 'executive-summary' | 'full-assessment' | 'gap-analysis') => {
    if (!id) return;
    
    setIsGeneratingReport(true);
    setShowReportMenu(false);
    
    toast({
      title: 'Generating Report',
      description: 'This may take 30-60 seconds...',
    });
    
    try {
      const response = await fetch(`/api/assessments/${id}/reports/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipeId: 'executive-summary-ep-v1',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ep-assessment-${id.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Report Generated',
        description: 'Your PDF report has been downloaded.',
      });
    } catch (error: any) {
      console.error('Report generation error:', error);
      toast({
        title: 'Report Generation Failed',
        description: error?.message || 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
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
  const epInterviewAnswered = dashboardData?.epInterviewAnswered || 0;
  const epInterviewTotal = dashboardData?.epInterviewTotal || 43;
  const physicalSecurityAnswered = dashboardData?.physicalSecurityAnswered || 0;
  const physicalSecurityTotal = dashboardData?.physicalSecurityTotal || 0;

  const controlStatus = dashboardData?.controlStatus || [];
  const totalControls = controlStatus.reduce((sum, c) => sum + c.total, 0);
  const implementedControls = controlStatus.reduce((sum, c) => sum + c.implemented, 0);
  const inProgressControls = controlStatus.reduce((sum, c) => sum + c.inProgress, 0);
  const completionPercentage = totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0;

  const allRecommendations = (dashboardData?.threatMatrix || [])
    .flatMap(s => s.priorityControls || [])
    .reduce((acc, control) => {
      if (!acc.find(c => c.controlId === control.controlId)) {
        acc.push(control);
      }
      return acc;
    }, [] as NonNullable<EPDashboardData['threatMatrix']>[0]['priorityControls']);

  // Use prioritizedControls (has DB costs) for immediate actions, fallback to allRecommendations
  const prioritizedControlsList = dashboardData?.prioritizedControls || [];
  const immediateControls = prioritizedControlsList.length > 0
    ? prioritizedControlsList.filter(c => c.urgency?.toLowerCase() === 'immediate')
    : allRecommendations.filter(c => c.urgency?.toLowerCase() === 'immediate');
  
  // Parse cost strings like "$750,000/year" to extract numeric values
  const parseCostToNumber = (cost: string | number | undefined): number => {
    if (typeof cost === 'number') return cost;
    if (!cost) return 0;
    // Remove commas and extract first numeric sequence (e.g., "$750,000/year" -> 750000)
    const cleaned = cost.replace(/,/g, '');
    const match = cleaned.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };
  
  const totalInvestment = prioritizedControlsList.reduce((sum, c) => {
    return sum + parseCostToNumber(c.estimatedCost);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Confidential Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-red-500/20 text-red-400 px-3 py-1.5 rounded text-sm font-medium">
            <Lock className="w-4 h-4 mr-2" />
            Executive Protection — Confidential
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            6-Layer AI Engine
          </Badge>
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
              Reassess
            </Button>
          )}
          {hasResults && (
            <div className="relative">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowReportMenu(!showReportMenu)}
                disabled={isGeneratingReport}
                data-testid="button-generate-report"
              >
                {isGeneratingReport ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showReportMenu ? 'rotate-90' : ''}`} />
              </Button>
              {showReportMenu && !isGeneratingReport && (
                <Card className="absolute right-0 mt-2 w-72 z-50 shadow-xl">
                  <CardContent className="p-2">
                    <div className="text-xs text-muted-foreground px-2 py-1">Select Report Type</div>
                    <Separator className="my-1" />
                    <button 
                      className="w-full px-3 py-2 text-left hover:bg-muted rounded flex items-start gap-3"
                      onClick={() => handleGenerateReport('executive-summary')}
                      data-testid="button-report-executive-summary"
                    >
                      <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Executive Summary</div>
                        <div className="text-muted-foreground text-xs">3-4 pages for C-Suite</div>
                      </div>
                    </button>
                    <button 
                      className="w-full px-3 py-2 text-left hover:bg-muted rounded flex items-start gap-3 opacity-50 cursor-not-allowed"
                      disabled
                      title="Coming soon"
                      data-testid="button-report-full-assessment"
                    >
                      <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Full Assessment Report</div>
                        <div className="text-muted-foreground text-xs">Coming soon</div>
                      </div>
                    </button>
                    <button 
                      className="w-full px-3 py-2 text-left hover:bg-muted rounded flex items-start gap-3 opacity-50 cursor-not-allowed"
                      disabled
                      title="Coming soon"
                      data-testid="button-report-gap-analysis"
                    >
                      <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center shrink-0">
                        <Scale className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Technical Gap Analysis</div>
                        <div className="text-muted-foreground text-xs">Coming soon</div>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interview Completion Status */}
      <Card className={interviewCompletion < 50 ? "border-orange-500/50 bg-orange-500/5" : interviewCompletion < 100 ? "border-yellow-500/50 bg-yellow-500/5" : "border-green-500/50 bg-green-500/5"}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <ClipboardCheck className={`h-5 w-5 ${interviewCompletion < 50 ? 'text-orange-500' : interviewCompletion < 100 ? 'text-yellow-500' : 'text-green-500'}`} />
              <div>
                <p className="font-medium">Survey Progress: {interviewCompletion}%</p>
                <p className="text-sm text-muted-foreground">
                  {answeredQuestions} of {totalQuestions} questions answered
                </p>
                {physicalSecurityTotal > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    EP Interview: {epInterviewAnswered}/{epInterviewTotal} | Physical Security: {physicalSecurityAnswered}/{physicalSecurityTotal}
                  </p>
                )}
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
                Processing through our rigorous framework: Logic, Math & Industry Standards
              </p>
            </div>
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
        <>
          {/* Principal Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-orange-500/20">
                <User className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{dashboardData?.principalSummary?.name || 'Principal'}</h1>
                <div className="text-muted-foreground">{dashboardData?.principalSummary?.title || 'Executive'}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {dashboardData?.principalSummary?.assessmentDate && `Assessed: ${dashboardData.principalSummary.assessmentDate}`}
                  {dashboardData?.principalSummary?.assessorName && ` by ${dashboardData.principalSummary.assessorName}`}
                </div>
              </div>
            </div>
            <ConfidenceBadge confidence={dashboardData?.aiConfidence || 'medium'} />
          </div>

          {/* Overall Risk Card */}
          <Card className="bg-gradient-to-r from-card to-muted/30">
            <CardContent className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Risk Score */}
                <div className="lg:col-span-3 lg:border-r border-border lg:pr-6">
                  <div className="text-muted-foreground text-sm mb-2">Overall Risk Score</div>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-bold">{dashboardData?.overviewMetrics?.overallRiskScore || 0}</span>
                    <span className="text-xl text-muted-foreground mb-2">/100</span>
                  </div>
                  <div className="mt-3">
                    <StatusBadge level={dashboardData?.overviewMetrics?.riskClassification || 'medium'} size="large" />
                  </div>
                  {dashboardData?.componentSummaries && (
                    <div className="mt-4 text-xs text-muted-foreground">
                      T×V×I×E = {dashboardData.componentSummaries.threat.overallScore.toFixed(0)}×
                      {dashboardData.componentSummaries.vulnerability.overallScore.toFixed(0)}×
                      {dashboardData.componentSummaries.impact.overallScore.toFixed(0)}×
                      {dashboardData.componentSummaries.exposure.overallScore.toFixed(0)}
                    </div>
                  )}
                </div>
                
                {/* T×V×I×E Gauges */}
                {dashboardData?.componentSummaries && (
                  <div className="lg:col-span-4 flex items-center justify-around flex-wrap gap-4">
                    <ScoreGauge label="Threat" score={dashboardData.componentSummaries.threat.overallScore} maxScore={10} color="text-red-500" />
                    <ScoreGauge label="Vulnerability" score={dashboardData.componentSummaries.vulnerability.overallScore} maxScore={10} color="text-purple-500" />
                    <ScoreGauge label="Impact" score={dashboardData.componentSummaries.impact.overallScore} maxScore={10} color="text-pink-500" />
                    <ScoreGauge label="Exposure" score={dashboardData.componentSummaries.exposure.overallScore} maxScore={5} color="text-orange-500" />
                  </div>
                )}
                
                {/* Key Stats */}
                <div className="lg:col-span-5 grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-muted-foreground text-xs mb-1">Scenarios Analyzed</div>
                    <div className="text-2xl font-bold">{dashboardData?.threatMatrix?.length || 0}</div>
                    <div className="text-xs text-red-400">
                      {dashboardData?.overviewMetrics?.criticalThreats || 0} critical
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-muted-foreground text-xs mb-1">Controls Status</div>
                    <div className="text-2xl font-bold">{completionPercentage}%</div>
                    <ProgressBar value={completionPercentage} color="blue" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-muted-foreground text-xs mb-1">Immediate Actions</div>
                    <div className="text-2xl font-bold text-orange-400">{immediateControls.length}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(totalInvestment)} total
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assessment Summary */}
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold">AI Assessment Summary</h3>
                <Badge variant="secondary" className="text-xs">Generated by 6-Layer AI Engine</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {dashboardData?.principalSummary?.executiveSummary || 
                  `Risk assessment completed with ${dashboardData?.threatMatrix?.length || 0} threat scenarios analyzed. 
                   Overall risk classification: ${dashboardData?.overviewMetrics?.riskClassification?.toUpperCase() || 'UNKNOWN'}. 
                   Current protection level: ${dashboardData?.principalSummary?.currentProtectionLevel || 'Unknown'}.`}
              </p>
              {(dashboardData?.principalSummary?.keyFindings?.length || dashboardData?.confidenceFactors?.length) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData?.principalSummary?.keyFindings && dashboardData.principalSummary.keyFindings.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Key Findings</div>
                      <ul className="space-y-1">
                        {dashboardData.principalSummary.keyFindings.slice(0, 4).map((finding, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-orange-400 mt-1 shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dashboardData?.confidenceFactors && dashboardData.confidenceFactors.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Confidence Factors</div>
                      <ul className="space-y-1">
                        {dashboardData.confidenceFactors.slice(0, 4).map((factor, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Info className="w-3 h-3 mt-1 shrink-0" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-6">
              {(['overview', 'scenarios', 'controls', 'evidence'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`tab-${tab}`}
                >
                  {tab === 'evidence' ? 'Evidence Trail' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section Assessments - Enhanced with AI Analysis */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Physical Security Section Analysis</CardTitle>
                      {isAnalyzingSections && (
                        <Badge variant="outline" className="text-xs">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Analyzing...
                        </Badge>
                      )}
                      {sectionAnalysis && !isAnalyzingSections && (
                        <Badge variant="outline" className="text-xs">
                          AI Analyzed
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {!sectionAnalysis && !isAnalyzingSections && 'Click "Reassess" to analyze'}
                    </span>
                  </div>
                  {sectionAnalysis && (
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Overall Risk:</span>
                        <Badge variant={sectionAnalysis.overallResidentialRisk >= 70 ? 'destructive' : sectionAnalysis.overallResidentialRisk >= 40 ? 'default' : 'secondary'}>
                          {sectionAnalysis.overallResidentialRisk}/100
                        </Badge>
                      </div>
                      {sectionAnalysis.criticalGapsCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {sectionAnalysis.criticalGapsCount} Critical Gaps
                        </Badge>
                      )}
                      {sectionAnalysis.highGapsCount > 0 && (
                        <Badge variant="default" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                          {sectionAnalysis.highGapsCount} High Gaps
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {sectionAnalysis ? (
                    <Accordion type="multiple" className="w-full">
                      {sectionAnalysis.sections.map((section) => {
                        const gapCount = section.findings.filter(f => f.type === 'gap').length;
                        const concernCount = section.findings.filter(f => f.type === 'concern').length;
                        const strengthCount = section.findings.filter(f => f.type === 'strength').length;
                        const criticalFindings = section.findings.filter(f => f.severity === 'critical');
                        const highFindings = section.findings.filter(f => f.severity === 'high');
                        
                        return (
                          <AccordionItem key={section.sectionId} value={section.sectionId} className="border-b-0 mb-2">
                            <AccordionTrigger 
                              className="bg-muted/50 rounded-lg px-4 py-3 hover:bg-muted/70 hover:no-underline [&[data-state=open]]:rounded-b-none"
                              data-testid={`accordion-section-${section.sectionId}`}
                            >
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    section.riskLevel === 'critical' ? 'bg-red-500' :
                                    section.riskLevel === 'high' ? 'bg-orange-500' :
                                    section.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`} />
                                  <span className="font-medium text-sm">{section.sectionName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground">
                                    {section.completionPercentage}% complete
                                  </span>
                                  <Badge 
                                    variant={section.riskLevel === 'critical' ? 'destructive' : 
                                             section.riskLevel === 'high' ? 'default' : 'secondary'}
                                    className={`text-xs ${
                                      section.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''
                                    }`}
                                  >
                                    Risk: {section.riskScore}/10
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-muted/30 rounded-b-lg px-4 pt-0 pb-4">
                              <div className="space-y-4">
                                {/* Summary */}
                                <div className="pt-3">
                                  <p className="text-sm text-muted-foreground">{section.summary}</p>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex items-center gap-4 text-xs">
                                  {gapCount > 0 && (
                                    <span className="flex items-center gap-1 text-red-400">
                                      <XCircle className="w-3 h-3" /> {gapCount} gaps
                                    </span>
                                  )}
                                  {concernCount > 0 && (
                                    <span className="flex items-center gap-1 text-yellow-400">
                                      <AlertTriangle className="w-3 h-3" /> {concernCount} concerns
                                    </span>
                                  )}
                                  {strengthCount > 0 && (
                                    <span className="flex items-center gap-1 text-green-400">
                                      <CheckCircle2 className="w-3 h-3" /> {strengthCount} strengths
                                    </span>
                                  )}
                                </div>

                                {/* Critical/High Findings */}
                                {(criticalFindings.length > 0 || highFindings.length > 0) && (
                                  <div className="space-y-2">
                                    <h5 className="text-xs font-medium text-red-400 flex items-center gap-1">
                                      <Zap className="w-3 h-3" /> Priority Findings
                                    </h5>
                                    <div className="space-y-2">
                                      {[...criticalFindings, ...highFindings].slice(0, 5).map((finding, idx) => (
                                        <div 
                                          key={idx} 
                                          className={`p-2 rounded text-xs border-l-2 ${
                                            finding.severity === 'critical' 
                                              ? 'bg-red-500/10 border-l-red-500' 
                                              : 'bg-orange-500/10 border-l-orange-500'
                                          }`}
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <span className="flex-1">{finding.finding}</span>
                                            <Badge variant="outline" className="text-[10px] shrink-0">
                                              {finding.severity}
                                            </Badge>
                                          </div>
                                          {finding.evidence && (
                                            <p className="text-muted-foreground mt-1 text-[10px]">
                                              Evidence: {finding.evidence}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Recommendations */}
                                {section.recommendations.length > 0 && (
                                  <div className="space-y-2">
                                    <h5 className="text-xs font-medium text-blue-400 flex items-center gap-1">
                                      <Target className="w-3 h-3" /> Recommendations
                                    </h5>
                                    <ul className="space-y-1">
                                      {section.recommendations.map((rec, idx) => {
                                        const recText = typeof rec === 'string' ? rec : (rec as any)?.recommendation || JSON.stringify(rec);
                                        return (
                                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-blue-400" />
                                            <span>{recText}</span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                )}

                                {/* All Findings (Collapsed) */}
                                {section.findings.length > 0 && (
                                  <details className="text-xs">
                                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                      View all {section.findings.length} findings
                                    </summary>
                                    <div className="mt-2 space-y-1 pl-4">
                                      {section.findings.map((finding, idx) => (
                                        <div key={idx} className="flex items-start gap-2 py-1">
                                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                            finding.type === 'gap' ? 'bg-red-500' :
                                            finding.type === 'concern' ? 'bg-yellow-500' : 'bg-green-500'
                                          }`} />
                                          <span className="text-muted-foreground">{finding.finding}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </details>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  ) : (
                    /* Fallback to basic section display if no AI analysis */
                    <div className="space-y-3">
                      {(dashboardData?.sectionAssessments || []).map(section => (
                        <div key={section.sectionId} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{section.sectionName}</span>
                            <span className={`text-sm ${section.riskIndicators > 3 ? 'text-red-400' : section.riskIndicators > 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {section.riskIndicators}/{section.totalQuestions} risk indicators
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{section.aiNarrative}</p>
                        </div>
                      ))}
                      {(!dashboardData?.sectionAssessments || dashboardData.sectionAssessments.length === 0) && (
                        <div className="text-center py-8">
                          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground mb-3">
                            No section analysis available yet.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Click "Run AI Analysis" to analyze physical security responses and identify gaps.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Control Implementation by Category */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Control Implementation by Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {controlStatus.map(category => (
                    <div key={category.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{category.category}</span>
                        <span className="text-xs text-muted-foreground">{category.implemented}/{category.total}</span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className="bg-green-500 rounded" style={{ width: `${(category.implemented/Math.max(category.total,1))*100}%` }} />
                        <div className="bg-blue-500 rounded" style={{ width: `${(category.inProgress/Math.max(category.total,1))*100}%` }} />
                        <div className="bg-muted rounded" style={{ width: `${(category.recommended/Math.max(category.total,1))*100}%` }} />
                      </div>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded" /> Implemented: {category.implemented}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded" /> In Progress: {category.inProgress}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-muted rounded" /> Recommended: {category.recommended}
                        </span>
                      </div>
                    </div>
                  ))}
                  {controlStatus.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No control status data available</p>
                  )}
                </CardContent>
              </Card>

              {/* T×V×I×E Component Narratives */}
              {dashboardData?.componentSummaries && (
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">T×V×I×E Component Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border-l-4 border-l-red-500 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-red-500" />
                          <span className="font-medium">Threat (T): {dashboardData.componentSummaries.threat.overallScore.toFixed(1)}/10</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dashboardData.componentSummaries.threat.narrative}</p>
                      </div>
                      <div className="p-4 rounded-lg border-l-4 border-l-purple-500 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">Vulnerability (V): {dashboardData.componentSummaries.vulnerability.overallScore.toFixed(1)}/10</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dashboardData.componentSummaries.vulnerability.narrative}</p>
                      </div>
                      <div className="p-4 rounded-lg border-l-4 border-l-pink-500 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-pink-500" />
                          <span className="font-medium">Impact (I): {dashboardData.componentSummaries.impact.overallScore.toFixed(1)}/10</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dashboardData.componentSummaries.impact.narrative}</p>
                      </div>
                      <div className="p-4 rounded-lg border-l-4 border-l-orange-500 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">Exposure (E): {dashboardData.componentSummaries.exposure.overallScore.toFixed(1)}/5</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dashboardData.componentSummaries.exposure.narrative}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scenario List */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Threat Scenarios ({dashboardData?.threatMatrix?.length || 0})</h3>
                {(dashboardData?.threatMatrix || []).map(scenario => (
                  <Card 
                    key={scenario.threatId}
                    className={`cursor-pointer transition-colors ${selectedScenario?.threatId === scenario.threatId ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                    onClick={() => setSelectedScenario(scenario)}
                    data-testid={`scenario-card-${scenario.threatId}`}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">{scenario.threatName}</span>
                        <StatusBadge level={scenario.riskScore.classification} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Score: {scenario.riskScore.normalized}</span>
                        {scenario.confidence && (
                          <span className="flex items-center gap-1">
                            {scenario.confidence === 'high' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : 
                             scenario.confidence === 'medium' ? <Clock className="w-3 h-3 text-yellow-400" /> : 
                             <XCircle className="w-3 h-3 text-red-400" />}
                            {scenario.confidence}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!dashboardData?.threatMatrix || dashboardData.threatMatrix.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No threat scenarios generated yet</p>
                )}
              </div>

              {/* Scenario Detail */}
              <div className="lg:col-span-2">
                {selectedScenario ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{selectedScenario.threatName}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{selectedScenario.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{selectedScenario.riskScore.normalized}</div>
                          <StatusBadge level={selectedScenario.riskScore.classification} size="large" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Scenario Description */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Scenario Description</h4>
                        <p className="text-sm text-muted-foreground">{selectedScenario.scenarioDescription}</p>
                      </div>

                      {/* T×V×I×E Breakdown */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">T×V×I×E Analysis</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-red-500/10 rounded-lg">
                            <div className="text-2xl font-bold text-red-400">{selectedScenario.threatLikelihood.score}</div>
                            <div className="text-xs text-muted-foreground">Threat</div>
                            <p className="text-xs mt-1 text-red-300">{selectedScenario.threatLikelihood.label}</p>
                          </div>
                          <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400">{selectedScenario.vulnerability.score}</div>
                            <div className="text-xs text-muted-foreground">Vulnerability</div>
                            <p className="text-xs mt-1 text-purple-300">{selectedScenario.vulnerability.label}</p>
                          </div>
                          <div className="text-center p-3 bg-pink-500/10 rounded-lg">
                            <div className="text-2xl font-bold text-pink-400">{selectedScenario.impact.score}</div>
                            <div className="text-xs text-muted-foreground">Impact</div>
                            <p className="text-xs mt-1 text-pink-300">{selectedScenario.impact.label}</p>
                          </div>
                          <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                            <div className="text-2xl font-bold text-orange-400">{selectedScenario.exposureFactor.score}</div>
                            <div className="text-xs text-muted-foreground">Exposure</div>
                            <p className="text-xs mt-1 text-orange-300">{selectedScenario.exposureFactor.label}</p>
                          </div>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedScenario.threatLikelihood.reasoning && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <h5 className="text-xs font-medium text-red-400 mb-1">Threat Reasoning</h5>
                            <p className="text-xs text-muted-foreground">{selectedScenario.threatLikelihood.reasoning}</p>
                          </div>
                        )}
                        {selectedScenario.vulnerability.reasoning && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <h5 className="text-xs font-medium text-purple-400 mb-1">Vulnerability Reasoning</h5>
                            <p className="text-xs text-muted-foreground">{selectedScenario.vulnerability.reasoning}</p>
                          </div>
                        )}
                      </div>

                      {/* Recommended Controls */}
                      {selectedScenario.priorityControls && selectedScenario.priorityControls.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3">Recommended Controls</h4>
                          <div className="space-y-2">
                            {selectedScenario.priorityControls.map((control, idx) => (
                              <div key={idx} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{control.controlName}</span>
                                    <Badge variant={control.urgency === 'immediate' ? 'destructive' : 'secondary'} className="text-xs">
                                      {control.urgency}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{control.rationale}</p>
                                </div>
                                <div className="text-right ml-4">
                                  {control.estimatedCost && (
                                    <div className="text-sm font-medium">{formatCurrency(control.estimatedCost)}</div>
                                  )}
                                  {control.effectivenessRating && (
                                    <div className="text-xs text-muted-foreground">{control.effectivenessRating}% effective</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence Chain */}
                      {selectedScenario.evidenceTrail && selectedScenario.evidenceTrail.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3">Evidence Chain</h4>
                          <div className="space-y-2">
                            {(selectedScenario.evidenceTrail as (string | EvidenceChainItem)[]).map((evidence, idx) => {
                              if (typeof evidence === 'string') {
                                return (
                                  <div key={idx} className="flex items-start gap-2 text-xs">
                                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 shrink-0" />
                                    <span className="text-muted-foreground">{evidence}</span>
                                  </div>
                                );
                              }
                              return (
                                <div key={idx} className="flex items-start gap-3 p-2 bg-muted/20 rounded">
                                  <Badge variant="outline" className={`text-xs shrink-0 ${getEvidenceWeightColor(evidence.weight)}`}>
                                    {evidence.weight}
                                  </Badge>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <Badge variant="secondary" className="text-xs">{getSourceLabel(evidence.source)}</Badge>
                                      {evidence.questionId && <span className="text-muted-foreground">({evidence.questionId})</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{evidence.finding}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Confidence */}
                      {selectedScenario.confidenceReasoning && (
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Info className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Confidence: {selectedScenario.confidence}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{selectedScenario.confidenceReasoning}</p>
                        </div>
                      )}

                      {/* Related Security Sections */}
                      {sectionAnalysis && sectionAnalysis.sections.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Search className="h-4 w-4 text-blue-400" />
                            Related Security Assessments
                          </h4>
                          <div className="space-y-2">
                            {(() => {
                              const relatedSectionIds = getRelatedSections(selectedScenario.threatId, selectedScenario.category);
                              const relatedSections = sectionAnalysis.sections.filter(s => 
                                relatedSectionIds.includes(s.sectionId)
                              );
                              
                              if (relatedSections.length === 0) {
                                return (
                                  <p className="text-xs text-muted-foreground">
                                    No related section assessments available. Click "Reassess" to generate section analysis.
                                  </p>
                                );
                              }
                              
                              return relatedSections.map(section => {
                                const criticalFindings = section.findings.filter(f => f.type === 'gap' && (f.severity === 'critical' || f.severity === 'high'));
                                return (
                                  <div 
                                    key={section.sectionId}
                                    className="p-3 bg-muted/30 rounded-lg border-l-4"
                                    style={{ borderColor: section.riskLevel === 'critical' ? 'rgb(239 68 68)' : section.riskLevel === 'high' ? 'rgb(249 115 22)' : section.riskLevel === 'medium' ? 'rgb(234 179 8)' : 'rgb(34 197 94)' }}
                                    data-testid={`related-section-${section.sectionId}`}
                                  >
                                    <div className="flex items-start justify-between mb-1">
                                      <span className="font-medium text-sm">{section.sectionName}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Risk: {section.riskScore}/10</span>
                                        <StatusBadge level={section.riskLevel} />
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{section.summary}</p>
                                    {criticalFindings.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-muted">
                                        <p className="text-xs font-medium text-orange-400 mb-1">Key Gaps ({criticalFindings.length}):</p>
                                        <ul className="space-y-1">
                                          {criticalFindings.slice(0, 3).map((finding, idx) => (
                                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                              <AlertTriangle className="h-3 w-3 text-orange-400 mt-0.5 shrink-0" />
                                              {finding.finding}
                                            </li>
                                          ))}
                                          {criticalFindings.length > 3 && (
                                            <li className="text-xs text-muted-foreground italic">
                                              +{criticalFindings.length - 3} more findings
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full">
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Select a scenario to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-6">
              {/* Immediate Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      Immediate Actions Required
                    </CardTitle>
                    <Badge variant="destructive">{immediateControls.length} items</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {immediateControls.slice(0, 6).map((control, idx) => (
                      <div key={idx} className="p-4 border border-orange-500/30 bg-orange-500/5 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm">{control.controlName}</span>
                          <span className="text-sm font-bold">{formatCurrency(control.estimatedCost)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{control.rationale}</p>
                        {control.effectivenessRating && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Effectiveness:</span>
                            <ProgressBar value={control.effectivenessRating} color="green" />
                            <span className="text-xs">{control.effectivenessRating}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* All Prioritized Controls */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">All Prioritized Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(dashboardData?.prioritizedControls || allRecommendations).map((control, idx) => (
                      <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{control.controlName}</span>
                            <Badge variant={control.urgency === 'immediate' ? 'destructive' : control.urgency === 'high' ? 'default' : 'secondary'} className="text-xs">
                              {control.urgency}
                            </Badge>
                            {'category' in control && control.category && (
                              <Badge variant="outline" className="text-xs">{control.category}</Badge>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-bold">{formatCurrency(control.estimatedCost)}</div>
                            {'implementationDifficulty' in control && control.implementationDifficulty && (
                              <div className="text-xs text-muted-foreground">{control.implementationDifficulty}</div>
                            )}
                          </div>
                        </div>
                        
                        {'justification' in control && control.justification ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex gap-2">
                              <span className="font-semibold text-red-400 shrink-0 w-28">THREAT:</span>
                              <span className="text-muted-foreground">{control.justification.threat}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-orange-400 shrink-0 w-28">VULNERABILITY:</span>
                              <span className="text-muted-foreground">{control.justification.vulnerability}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-blue-400 shrink-0 w-28">MITIGATION:</span>
                              <span className="text-muted-foreground">{control.justification.mitigation}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-green-400 shrink-0 w-28">ROI:</span>
                              <span className="text-muted-foreground">{control.justification.roi}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{control.rationale}</p>
                        )}
                        
                        {control.effectivenessRating && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-muted">
                            <span className="text-xs text-muted-foreground">Effectiveness:</span>
                            <ProgressBar value={control.effectivenessRating} color="green" />
                            <span className="text-xs">{control.effectivenessRating}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {(!dashboardData?.prioritizedControls || dashboardData.prioritizedControls.length === 0) && allRecommendations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No control recommendations available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Investment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(totalInvestment)}</div>
                      <div className="text-xs text-muted-foreground">Total Investment</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-400">{immediateControls.length}</div>
                      <div className="text-xs text-muted-foreground">Immediate Priority</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="text-2xl font-bold">{allRecommendations.length}</div>
                      <div className="text-xs text-muted-foreground">Total Controls</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-400">{completionPercentage}%</div>
                      <div className="text-xs text-muted-foreground">Currently Implemented</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Complete Evidence Trail</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Full audit trail of all data sources and findings used in the AI risk assessment
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Evidence by Scenario */}
                  <div className="space-y-6">
                    {(dashboardData?.threatMatrix || []).map(scenario => {
                      const evidenceItems = scenario.evidenceTrail || [];
                      if (evidenceItems.length === 0) return null;
                      
                      return (
                        <div key={scenario.threatId} className="border-l-2 border-muted pl-4">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="font-medium text-sm">{scenario.threatName}</h4>
                            <StatusBadge level={scenario.riskScore.classification} />
                            <span className="text-xs text-muted-foreground">
                              ({evidenceItems.length} evidence items)
                            </span>
                          </div>
                          <div className="space-y-2">
                            {(evidenceItems as (string | EvidenceChainItem)[]).map((evidence, idx) => {
                              if (typeof evidence === 'string') {
                                return (
                                  <div key={idx} className="flex items-start gap-3 p-2 bg-muted/20 rounded text-sm">
                                    <span className="text-muted-foreground">{evidence}</span>
                                  </div>
                                );
                              }
                              return (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/20 rounded">
                                  <Badge variant="outline" className={`text-xs shrink-0 ${getEvidenceWeightColor(evidence.weight)}`}>
                                    {evidence.weight}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {getSourceLabel(evidence.source)}
                                  </Badge>
                                  <div className="flex-1">
                                    <p className="text-sm">{evidence.finding}</p>
                                    {evidence.questionId && (
                                      <p className="text-xs text-muted-foreground mt-1">Source: {evidence.questionId}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Confidence Factors */}
                  {dashboardData?.confidenceFactors && dashboardData.confidenceFactors.length > 0 && (
                    <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Assessment Confidence Factors
                      </h4>
                      <ul className="space-y-2">
                        {dashboardData.confidenceFactors.map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(!dashboardData?.threatMatrix || dashboardData.threatMatrix.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No evidence trail available. Run AI analysis to generate evidence-based assessments.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
