import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FacilitySurvey } from "@/components/FacilitySurvey";
import { AssessmentForm } from "@/components/AssessmentForm";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { ReportGenerator } from "@/components/ReportGenerator";
import ExecutiveSurveyQuestions from "@/components/ExecutiveSurveyQuestions";
import ExecutiveInterview from "@/components/ExecutiveInterview";
import { EnhancedRiskAssessment } from "@/components/EnhancedRiskAssessment";
import { ArrowLeft, MapPin, User, Calendar, Building, Shield, FileText, CheckCircle, MessageSquare, Trash2, FileDown } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Assessment } from "@shared/schema";
import { generateComprehensiveReport } from "@/lib/comprehensiveReportGenerator";

interface AssessmentDetailProps {
  assessmentId?: string;
}

export default function AssessmentDetail({ assessmentId = "demo-001" }: AssessmentDetailProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const hasInitializedTab = useRef(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch assessment data with proper typing
  const { data: assessmentData, isLoading, error } = useQuery<Assessment>({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId
  });

  // Delete assessment mutation
  const deleteAssessmentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/assessments/${assessmentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Assessment Deleted",
        description: "The assessment has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
      setLocation('/app/assessments');
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate comprehensive report
  const handleGenerateComprehensiveReport = async () => {
    if (!assessmentData) return;
    
    setIsGeneratingReport(true);
    
    try {
      // Fetch comprehensive report data from API
      const response = await fetch(`/api/assessments/${assessmentId}/comprehensive-report-data`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const reportData = await response.json();
      
      // Generate PDF using the comprehensive report generator
      const pdf = await generateComprehensiveReport(reportData);
      
      // Download the PDF
      const fileName = `${assessmentData.title.replace(/[^a-z0-9]/gi, '_')}_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Report Generated",
        description: "Your comprehensive security assessment report has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate comprehensive report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  // Derive initial tab directly from assessment data (defaults to facility-survey for loading state)
  const paradigm = assessmentData?.surveyParadigm || "facility";
  const defaultTab = paradigm === "executive" ? "executive-interview" : "facility-survey";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  
  // Set initial tab based on paradigm after data loads (only once to prevent reset on refetch)
  useEffect(() => {
    if (assessmentData && !hasInitializedTab.current) {
      const paradigm = assessmentData.surveyParadigm || "facility";
      const correctTab = paradigm === "executive" ? "executive-interview" : "facility-survey";
      setActiveTab(correctTab);
      hasInitializedTab.current = true;
    }
  }, [assessmentData]);

  // Get paradigm-specific workflow configuration
  const getWorkflowConfig = () => {
    const paradigm = assessmentData?.surveyParadigm || "facility";
    
    if (paradigm === "executive") {
      return {
        tabs: [
          { id: "executive-interview", label: "Executive Interview", icon: MessageSquare },
          { id: "executive-profile", label: "Executive Profile & Threat Assessment", icon: User },
          { id: "digital-footprint", label: "Digital Footprint Analysis", icon: Shield },
          { id: "physical-security", label: "Physical Security Review", icon: Building },
          { id: "risk-analysis", label: "Risk Analysis", icon: Shield },
          { id: "treatment-plan", label: "Security Treatment Plan", icon: FileText },
          { id: "executive-summary", label: "Executive Summary", icon: CheckCircle }
        ],
        phases: [
          { label: "Profile & Threats", completed: false },
          { label: "Analysis", completed: false },
          { label: "Treatment & Summary", completed: false }
        ]
      };
    }
    
    // Default facility paradigm
    return {
      tabs: [
        { id: "facility-survey", label: "Facility Survey", icon: Building },
        { id: "risk-assessment", label: "Security Risk Assessment", icon: Shield },
        { id: "reports", label: "Reports", icon: FileText }
      ],
      phases: [
        { label: "Phase 1: Facility Survey", completed: assessmentData?.facilitySurveyCompleted || false },
        { label: "Phase 2: Risk Assessment", completed: assessmentData?.riskAssessmentCompleted || false },
        { label: "Reports", completed: false }
      ]
    };
  };

  const workflowConfig = getWorkflowConfig();
  
  // Determine current phase based on assessment status and paradigm
  const getCurrentPhase = () => {
    if (!assessmentData) return 1;
    
    const paradigm = assessmentData.surveyParadigm || "facility";
    
    if (paradigm === "executive") {
      // Executive paradigm - simpler phase tracking for now
      // In the future, this could track executive-specific completion flags
      return 1;
    }
    
    // Facility paradigm - sequential phase tracking
    if (!assessmentData.facilitySurveyCompleted) return 1;
    if (!assessmentData.riskAssessmentCompleted) return 2;
    return 3;
  };

  const currentPhase = getCurrentPhase();
  
  // Auto-advance tabs based on completion
  const getTabsAvailability = () => {
    const paradigm = assessmentData?.surveyParadigm || "facility";
    
    if (paradigm === "executive") {
      // Executive paradigm - all tabs available from start for now
      return workflowConfig.tabs.reduce((acc, tab) => ({
        ...acc,
        [tab.id]: true
      }), {});
    }
    
    // Facility paradigm - sequential unlock
    const tabs = {
      "facility-survey": true,
      "risk-assessment": assessmentData?.facilitySurveyCompleted || false,
      "reports": assessmentData?.riskAssessmentCompleted || false
    };
    return tabs;
  };

  const tabsAvailable = getTabsAvailability();

  const handleBack = () => {
    console.log("Navigate back to dashboard");
  };

  const handleSave = (data: any) => {
    console.log("Saving assessment data:", data);
  };

  const handleSubmit = (data: any) => {
    console.log("Submitting assessment for review:", data);
  };

  const handleFacilitySurveyComplete = () => {
    console.log("Facility survey completed, advancing to risk assessment");
    setActiveTab("risk-assessment");
  };

  const handleRiskAssessmentComplete = () => {
    console.log("Risk assessment completed, advancing to reports");
    setActiveTab("reports");
  };

  const handleGenerateAnalysis = () => {
    setIsAnalyzing(true);
    console.log("Generating AI risk analysis...");
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveTab("reports");
      console.log("Analysis complete!");
    }, 3000);
  };

  const handleGenerateReport = (reportId: string) => {
    console.log("Generating report:", reportId);
  };

  const handleDownloadReport = (reportId: string) => {
    console.log("Downloading report:", reportId);
  };

  const handleShareReport = (reportId: string) => {
    console.log("Sharing report:", reportId);
  };

  // Show loading state while data or activeTab are not ready
  if (isLoading || !activeTab) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Assessment not found or failed to load.</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Phase Progress */}
      <div className="flex items-start gap-2 sm:gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleBack}
          data-testid="button-back"
          className="flex-shrink-0 min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate" data-testid="heading-assessment-title">
                {assessmentData.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center min-w-0">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{assessmentData.location}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{assessmentData.assessor}</span>
                </div>
                <div className="flex items-center whitespace-nowrap">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  Created {new Date(assessmentData.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {/* Phase Progress Indicator - Paradigm-Aware */}
              <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4 overflow-x-auto">
                <div className="flex items-center gap-1 sm:gap-2">
                  {workflowConfig.phases.map((phase, index) => (
                    <div key={index} className="flex items-center gap-1 sm:gap-2">
                      <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-[10px] sm:text-xs whitespace-nowrap ${
                        phase.completed ? "bg-green-100 text-green-700" : 
                        currentPhase > index ? "bg-blue-100 text-blue-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {phase.completed ? <CheckCircle className="h-3 w-3 flex-shrink-0" /> : <Shield className="h-3 w-3 flex-shrink-0" />}
                        <span className="hidden sm:inline">{phase.label}</span>
                        <span className="sm:hidden">{phase.label.split(':')[0]}</span>
                      </div>
                      {index < workflowConfig.phases.length - 1 && (
                        <div className={`w-4 sm:w-8 h-0.5 ${currentPhase > index + 1 ? "bg-green-500" : "bg-muted"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge 
                variant={assessmentData.status === "completed" ? "default" : "secondary"}
                data-testid="badge-status"
                className="whitespace-nowrap"
              >
                {assessmentData.status === "completed" ? "Completed" : 
                 assessmentData.status === "risk-assessment" ? "Risk Assessment" :
                 assessmentData.status === "facility-survey" ? "Facility Survey" : "Draft"}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={handleGenerateComprehensiveReport}
                className="flex-shrink-0 min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
                disabled={isGeneratingReport}
                data-testid="button-generate-report"
                title="Generate comprehensive report"
              >
                <FileDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="flex-shrink-0 min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
                disabled={deleteAssessmentMutation.isPending}
                data-testid="button-delete-assessment"
                title="Delete assessment"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Paradigm-Aware Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full grid gap-2 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 h-auto p-2">
          {workflowConfig.tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                data-testid={`tab-${tab.id}`}
                disabled={!tabsAvailable[tab.id]}
                className="flex flex-wrap items-center gap-2 justify-center text-center min-h-11"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Phase 1: Facility Physical Security Survey */}
        <TabsContent value="facility-survey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Phase 1: Facility Physical Security Survey
              </CardTitle>
              <p className="text-muted-foreground">
                Professional assessment of existing physical security controls following CPP standards and Army FM guidelines.
              </p>
            </CardHeader>
            <CardContent>
              <FacilitySurvey 
                assessmentId={assessmentId} 
                onComplete={handleFacilitySurveyComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase 2: ASIS Risk Assessment */}
        <TabsContent value="risk-assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Phase 2: Security Risk Assessment
              </CardTitle>
              <p className="text-muted-foreground">
                Systematic identification and analysis of security risks using ASIS International methodology.
              </p>
            </CardHeader>
            <CardContent>
              <AssessmentForm 
                assessmentId={assessmentId}
                phase="risk-assessment"
                onSave={handleSave}
                onSubmit={handleRiskAssessmentComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI-Powered Risk Analysis - Temporarily Disabled */}
        {/* <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI-Powered Security Risk Analysis
              </CardTitle>
              <p className="text-muted-foreground">
                Advanced analysis combining facility survey findings with ASIS risk assessment data.
              </p>
            </CardHeader>
            <CardContent>
              <RiskAnalysis 
                assessmentId={assessmentId}
                onGenerateAnalysis={handleGenerateAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Professional Reports */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Professional Security Assessment Reports
              </CardTitle>
              <p className="text-muted-foreground">
                Generate comprehensive reports for stakeholders, compliance, and remediation planning.
              </p>
            </CardHeader>
            <CardContent>
              <ReportGenerator 
                assessmentId={assessmentId}
                onGenerate={handleGenerateReport}
                onDownload={handleDownloadReport}
                onShare={handleShareReport}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executive Protection Paradigm Tabs */}
        <TabsContent value="executive-interview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Executive Interview
              </CardTitle>
              <p className="text-muted-foreground">
                Conduct a comprehensive interview with the executive to gather critical security information about their daily routines, travel patterns, digital footprint, and threat awareness.
              </p>
            </CardHeader>
          </Card>
          
          <ExecutiveInterview 
            assessmentId={assessmentId}
            onComplete={() => setActiveTab('executive-profile')}
          />
        </TabsContent>

        <TabsContent value="executive-profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Executive Profile & Threat Assessment
              </CardTitle>
              <p className="text-muted-foreground">
                Comprehensive assessment of the executive's profile, public visibility, and threat landscape based on industry, position, and known threats.
              </p>
            </CardHeader>
          </Card>
          
          <ExecutiveSurveyQuestions 
            assessmentId={assessmentId}
            onComplete={() => setActiveTab('digital-footprint')}
          />
        </TabsContent>

        <TabsContent value="digital-footprint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Digital Footprint Analysis
              </CardTitle>
              <p className="text-muted-foreground">
                OSINT assessment, social media analysis, PII exposure, and dark web monitoring for the executive and their family.
              </p>
            </CardHeader>
          </Card>
          
          <ExecutiveSurveyQuestions 
            assessmentId={assessmentId} 
            sectionCategory="OSINT & Digital Footprint Analysis"
            onComplete={() => setActiveTab('physical-security')}
          />
        </TabsContent>

        <TabsContent value="physical-security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Physical Security Review
              </CardTitle>
              <p className="text-muted-foreground">
                Assessment of residential security, executive office protection, travel routes, and pattern-of-life analysis.
              </p>
            </CardHeader>
          </Card>
          
          <ExecutiveSurveyQuestions 
            assessmentId={assessmentId} 
            sectionCategory="Residential Security Assessment"
          />
          
          <ExecutiveSurveyQuestions 
            assessmentId={assessmentId} 
            sectionCategory="Executive Office & Corporate Security"
            onComplete={() => setActiveTab('risk-analysis')}
          />
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Executive Risk Analysis
              </CardTitle>
              <p className="text-muted-foreground">
                Comprehensive risk analysis combining digital footprint findings, physical security assessment, and threat intelligence.
              </p>
            </CardHeader>
            <CardContent>
              <EnhancedRiskAssessment 
                assessmentId={assessmentId}
                onComplete={() => setActiveTab('treatment-plan')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Security Treatment Plan
              </CardTitle>
              <p className="text-muted-foreground">
                Protective measures, security controls, procedures, and recommendations for executive protection.
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Treatment planning controls are managed within the Risk Analysis tab above. Navigate to Risk Analysis to define and implement security controls for identified risks.</p>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('risk-analysis')}
                className="mt-4"
                data-testid="button-goto-risk-analysis"
              >
                Go to Risk Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive-summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Executive Summary & Reports
              </CardTitle>
              <p className="text-muted-foreground">
                Final executive summary with key findings, priority risks, and recommended protective measures.
              </p>
            </CardHeader>
            <CardContent>
              <ReportGenerator 
                assessmentId={assessmentId}
                onGenerate={handleGenerateReport}
                onDownload={handleDownloadReport}
                onShare={handleShareReport}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progress Summary */}
      {assessmentData.status === "completed" && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Assessment Complete</p>
                <p className="text-sm text-green-600">
                  Both facility survey and risk assessment phases completed successfully
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600">
              Completed {new Date(assessmentData.completedAt).toLocaleDateString()}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assessmentData.title}"? This action cannot be undone.
              All associated data including survey responses, risk assessments, and reports will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAssessmentMutation.mutate()}
              disabled={deleteAssessmentMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteAssessmentMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}