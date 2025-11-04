import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacilitySurvey } from "@/components/FacilitySurvey";
import { AssessmentForm } from "@/components/AssessmentForm";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { ReportGenerator } from "@/components/ReportGenerator";
import ExecutiveSurveyQuestions from "@/components/ExecutiveSurveyQuestions";
import { ArrowLeft, MapPin, User, Calendar, Building, Shield, FileText, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Assessment } from "@shared/schema";

interface AssessmentDetailProps {
  assessmentId?: string;
}

export default function AssessmentDetail({ assessmentId = "demo-001" }: AssessmentDetailProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const hasInitializedTab = useRef(false);

  // Fetch assessment data with proper typing
  const { data: assessmentData, isLoading, error } = useQuery<Assessment>({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId
  });
  
  // Initialize activeTab to null, then set via useEffect when data loads
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // Set initial tab based on paradigm after data loads (only once)
  useEffect(() => {
    if (assessmentData && !hasInitializedTab.current) {
      const paradigm = assessmentData.surveyParadigm || "facility";
      const initialTab = paradigm === "executive" ? "executive-profile" : "facility-survey";
      setActiveTab(initialTab);
      hasInitializedTab.current = true;
    }
  }, [assessmentData]);

  // Get paradigm-specific workflow configuration
  const getWorkflowConfig = () => {
    const paradigm = assessmentData?.surveyParadigm || "facility";
    
    if (paradigm === "executive") {
      return {
        tabs: [
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
    <div className="space-y-6">
      {/* Header with Phase Progress */}
      <div className="flex items-start gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleBack}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="heading-assessment-title">
                {assessmentData.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {assessmentData.location}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {assessmentData.assessor}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {new Date(assessmentData.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {/* Phase Progress Indicator - Paradigm-Aware */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  {workflowConfig.phases.map((phase, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        phase.completed ? "bg-green-100 text-green-700" : 
                        currentPhase > index ? "bg-blue-100 text-blue-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {phase.completed ? <CheckCircle className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        {phase.label}
                      </div>
                      {index < workflowConfig.phases.length - 1 && (
                        <div className={`w-8 h-0.5 ${currentPhase > index + 1 ? "bg-green-500" : "bg-muted"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={assessmentData.status === "completed" ? "default" : "secondary"}
                data-testid="badge-status"
              >
                {assessmentData.status === "completed" ? "Completed" : 
                 assessmentData.status === "risk-assessment" ? "Risk Assessment" :
                 assessmentData.status === "facility-survey" ? "Facility Survey" : "Draft"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Paradigm-Aware Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`w-full ${
          workflowConfig.tabs.length === 3 
            ? 'grid grid-cols-3' 
            : 'flex flex-wrap justify-start gap-1'
        }`}>
          {workflowConfig.tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                data-testid={`tab-${tab.id}`}
                disabled={!tabsAvailable[tab.id]}
                className={`flex items-center gap-2 ${
                  workflowConfig.tabs.length === 6 ? 'flex-1 min-w-[140px]' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className={workflowConfig.tabs.length === 6 ? 'text-xs' : ''}>{tab.label}</span>
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
          />
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
              <p className="text-muted-foreground">
                Comprehensive risk analysis combining digital footprint findings, physical security assessment, and threat intelligence.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Executive Risk Analysis</h3>
                <p className="text-muted-foreground">Risk prioritization and analysis for executive protection scenarios.</p>
              </div>
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
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Security Treatment Planning</h3>
                <p className="text-muted-foreground">Develop comprehensive security measures and protective controls.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive-summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Executive Summary
              </CardTitle>
              <p className="text-muted-foreground">
                Final executive summary with key findings, priority risks, and recommended protective measures.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Executive Summary Report</h3>
                <p className="text-muted-foreground">Comprehensive summary of findings and recommendations for leadership.</p>
              </div>
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
    </div>
  );
}