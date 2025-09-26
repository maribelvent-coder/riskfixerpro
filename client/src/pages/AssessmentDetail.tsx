import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacilitySurvey } from "@/components/FacilitySurvey";
import { AssessmentForm } from "@/components/AssessmentForm";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { ReportGenerator } from "@/components/ReportGenerator";
import { ArrowLeft, MapPin, User, Calendar, Building, Shield, FileText, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AssessmentDetailProps {
  assessmentId?: string;
}

export default function AssessmentDetail({ assessmentId = "demo-001" }: AssessmentDetailProps) {
  const [activeTab, setActiveTab] = useState("facility-survey");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch assessment data
  const { data: assessmentData, isLoading, error } = useQuery({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId
  });

  // Determine current phase based on assessment status
  const getCurrentPhase = () => {
    if (!assessmentData) return 1;
    if (!assessmentData.facilitySurveyCompleted) return 1;
    if (!assessmentData.riskAssessmentCompleted) return 2;
    return 3;
  };

  const currentPhase = getCurrentPhase();
  
  // Auto-advance tabs based on completion
  const getTabsAvailability = () => {
    const tabs = {
      "facility-survey": true,
      "risk-assessment": assessmentData?.facilitySurveyCompleted || false,
      "analysis": assessmentData?.riskAssessmentCompleted || false,
      "reports": assessmentData?.status === "completed"
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
    console.log("Risk assessment completed, advancing to analysis");
    setActiveTab("analysis");
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

  if (isLoading) {
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
              
              {/* Phase Progress Indicator */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    currentPhase >= 1 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {assessmentData.facilitySurveyCompleted ? <CheckCircle className="h-3 w-3" /> : <Building className="h-3 w-3" />}
                    Phase 1: Facility Survey
                  </div>
                  <div className={`w-8 h-0.5 ${currentPhase >= 2 ? "bg-green-500" : "bg-muted"}`} />
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    currentPhase >= 2 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {assessmentData.riskAssessmentCompleted ? <CheckCircle className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    Phase 2: Risk Assessment
                  </div>
                  <div className={`w-8 h-0.5 ${currentPhase >= 3 ? "bg-green-500" : "bg-muted"}`} />
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    currentPhase >= 3 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    <FileText className="h-3 w-3" />
                    Analysis & Reports
                  </div>
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

      {/* Main Content - Two Phase Assessment */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="facility-survey" 
            data-testid="tab-facility-survey"
            className="flex items-center gap-2"
          >
            <Building className="h-4 w-4" />
            Facility Survey
            {assessmentData.facilitySurveyCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger 
            value="risk-assessment" 
            data-testid="tab-risk-assessment"
            disabled={!tabsAvailable["risk-assessment"]}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            ASIS Risk Assessment
            {assessmentData.riskAssessmentCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            data-testid="tab-analysis"
            disabled={!tabsAvailable["analysis"]}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            data-testid="tab-reports"
            disabled={!tabsAvailable["reports"]}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
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
                Phase 2: ASIS International Risk Assessment
              </CardTitle>
              <p className="text-muted-foreground">
                Systematic identification and analysis of security risks using ASIS International methodology.
              </p>
            </CardHeader>
            <CardContent>
              <AssessmentForm 
                assessmentId={assessmentId}
                onSave={handleSave}
                onSubmit={handleRiskAssessmentComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI-Powered Risk Analysis */}
        <TabsContent value="analysis" className="space-y-4">
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
        </TabsContent>

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