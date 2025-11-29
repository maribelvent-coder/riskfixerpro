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
import { AIReportGenerator } from "@/components/AIReportGenerator";
import ExecutiveSurveyQuestions from "@/components/ExecutiveSurveyQuestions";
import ExecutiveInterview from "@/components/ExecutiveInterview";
import OfficeBuildingInterview from "@/components/OfficeBuildingInterview";
import { EnhancedRiskAssessment } from "@/components/EnhancedRiskAssessment";
import { RiskAssessmentNBS } from "@/components/RiskAssessmentNBS";
import WarehouseDashboard from "@/pages/assessments/WarehouseDashboard";
import RetailDashboard from "@/pages/assessments/RetailDashboard";
import ManufacturingDashboard from "@/pages/assessments/ManufacturingDashboard";
import DatacenterDashboard from "@/pages/assessments/DatacenterDashboard";
import OfficeDashboard from "@/pages/assessments/OfficeDashboard";
import ExecutiveDashboard from "@/pages/assessments/ExecutiveDashboard";
import { ArrowLeft, MapPin, User, Calendar, Building, Building2, Shield, FileText, CheckCircle, MessageSquare, Trash2, FileDown, ChevronDown, Warehouse, ShoppingBag, Factory, Server } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Assessment } from "@shared/schema";
import { generateComprehensiveReport } from "@/lib/comprehensiveReportGenerator";
import { generateDOCXReport } from "@/lib/docxReportGenerator";
import { exportHTMLReport } from "@/lib/htmlReportGenerator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Global Template Configuration - Single source of truth for all templates
const TEMPLATE_CONFIG: Record<string, { tabId: string; label: string; icon: typeof Warehouse; dashboardComponent: any }> = {
  "warehouse-distribution": { tabId: "warehouse", label: "Warehouse Operations", icon: Warehouse, dashboardComponent: WarehouseDashboard },
  "retail-store": { tabId: "retail", label: "Retail Operations", icon: ShoppingBag, dashboardComponent: RetailDashboard },
  "manufacturing-facility": { tabId: "manufacturing", label: "Production Operations", icon: Factory, dashboardComponent: ManufacturingDashboard },
  "data-center": { tabId: "datacenter", label: "Infrastructure Operations", icon: Server, dashboardComponent: DatacenterDashboard },
  "office-building": { tabId: "office", label: "Corporate Operations", icon: Building2, dashboardComponent: OfficeDashboard },
};

// Survey type display names for dynamic headings
const SURVEY_TYPE_LABELS: Record<string, string> = {
  "office-building": "Office",
  "retail-store": "Retail Store",
  "warehouse-distribution": "Warehouse",
  "manufacturing-facility": "Manufacturing Facility",
  "data-center": "Data Center",
  "executive-protection": "Executive Protection",
};

interface AssessmentDetailProps {
  assessmentId?: string;
}

export default function AssessmentDetail({ assessmentId = "demo-001" }: AssessmentDetailProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const hasInitializedTab = useRef(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Helper to get survey type label from templateId
  const getSurveyTypeLabel = (templateId?: string) => {
    return templateId ? (SURVEY_TYPE_LABELS[templateId] || "Facility") : "Facility";
  };

  // Fetch assessment data with proper typing
  const { data: assessmentData, isLoading, error } = useQuery<Assessment>({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId
  });

  // Update assessment mutation
  const updateAssessmentMutation = useMutation({
    mutationFn: async (updateData: Partial<Assessment>) => {
      const response = await apiRequest('PUT', `/api/assessments/${assessmentId}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', assessmentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: `Failed to save assessment changes: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
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

  // Generate comprehensive report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'docx' | 'html' = 'pdf') => {
      if (!assessmentData) {
        throw new Error('Assessment data not available');
      }

      // Fetch comprehensive report data using apiRequest
      const response = await apiRequest('GET', `/api/assessments/${assessmentId}/comprehensive-report-data`);
      const reportData = await response.json();
      
      // Validate the response payload shape before passing to generator
      if (!reportData || typeof reportData !== 'object') {
        throw new Error('Invalid report data received from server');
      }
      
      // Validate critical fields exist (minimal validation)
      if (!reportData.assessment) {
        console.warn('Report data missing assessment object - using defaults');
      }
      
      if (!reportData.riskSummary) {
        console.warn('Report data missing risk summary - report will have limited content');
      }
      
      // Generate filename using normalized assessment title
      const reportTitle = reportData.assessment?.title || assessmentData.title || 'Assessment_Report';
      const baseFileName = `${reportTitle.replace(/[^a-z0-9]/gi, '_')}_Comprehensive_Report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'pdf') {
        // Generate PDF using the comprehensive report generator
        const pdf = await generateComprehensiveReport(reportData);
        pdf.save(`${baseFileName}.pdf`);
        return { fileName: `${baseFileName}.pdf`, format: 'PDF' };
      } else if (format === 'docx') {
        // Generate DOCX using the DOCX report generator
        const docxBlob = await generateDOCXReport(reportData);
        
        // Create download link
        const url = window.URL.createObjectURL(docxBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseFileName}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { fileName: `${baseFileName}.docx`, format: 'DOCX' };
      } else {
        // Generate HTML and open in new tab
        await exportHTMLReport(reportData, reportTitle);
        return { fileName: `${baseFileName}.html`, format: 'HTML' };
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: `Your comprehensive security assessment report (${data.format}) has been downloaded.`,
      });
    },
    onError: (error) => {
      console.error("Error generating report:", error);
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate comprehensive report. Please try again.",
        variant: "destructive",
      });
    },
  });
  
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
    const templateId = assessmentData?.templateId || "";
    
    if (paradigm === "executive") {
      const isEPTemplate = templateId === 'executive-protection';
      return {
        tabs: [
          { id: "executive-interview", label: "Executive Interview", icon: MessageSquare },
          { id: "executive-profile", label: isEPTemplate ? "Principal Profile" : "Executive Profile & Threat Assessment", icon: User },
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
    
    // Check for specialized templates that skip Asset Inventory
    const specializedTemplates = ["warehouse-distribution", "retail-store", "manufacturing-facility", "data-center"];
    const isSpecializedTemplate = specializedTemplates.includes(templateId);
    
    // Base tabs for facility paradigm - always start with Facility Survey
    const baseTabs = [
      { id: "facility-survey", label: "Facility Survey", icon: Building },
    ];
    
    // Add template-specific tabs OR Asset Inventory (configuration-driven)
    const templateConfig = TEMPLATE_CONFIG[templateId];
    if (templateConfig) {
      baseTabs.push({
        id: templateConfig.tabId,
        label: templateConfig.label,
        icon: templateConfig.icon
      });
    } else {
      // Other non-specialized templates use standard Asset Inventory
      baseTabs.push({ id: "assets", label: "Asset Inventory", icon: Building });
    }
    
    // Add Risk Assessment and Reports tabs for all facility templates
    baseTabs.push(
      { id: "risk-assessment", label: "Security Risk Assessment", icon: Shield },
      { id: "reports", label: "Reports", icon: FileText }
    );
    
    const surveyTypeLabel = getSurveyTypeLabel(assessmentData?.templateId || undefined);
    
    return {
      tabs: baseTabs,
      phases: [
        { label: `${surveyTypeLabel} Survey`, completed: assessmentData?.facilitySurveyCompleted || false },
        { label: "Risk Assessment", completed: assessmentData?.riskAssessmentCompleted || false },
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
    const templateId = assessmentData?.templateId || "";
    const specializedTemplates = ["warehouse-distribution", "retail-store", "manufacturing-facility", "data-center", "office-building"];
    const isSpecializedTemplate = specializedTemplates.includes(templateId);
    
    if (paradigm === "executive") {
      // Executive paradigm - all tabs available from start for now
      return workflowConfig.tabs.reduce((acc, tab) => ({
        ...acc,
        [tab.id]: true
      }), {});
    }
    
    // Check if specialized template profile is saved
    const hasProfileData = isSpecializedTemplate && !!(
      assessmentData?.warehouse_profile ||
      assessmentData?.retail_profile ||
      assessmentData?.manufacturing_profile ||
      assessmentData?.datacenter_profile ||
      assessmentData?.office_profile
    );
    
    // Facility paradigm - sequential unlock
    const tabs: Record<string, boolean> = {
      "facility-survey": true,
      // For specialized templates: enable risk-assessment once profile is saved OR facility survey is complete
      // For standard templates: enable risk-assessment only after facility survey is complete
      "risk-assessment": isSpecializedTemplate
        ? (hasProfileData || assessmentData?.facilitySurveyCompleted || false)
        : (assessmentData?.facilitySurveyCompleted || false),
      // For specialized templates: enable Reports once profile is saved
      // For standard templates: enable Reports once risk assessment is complete
      "reports": isSpecializedTemplate 
        ? (hasProfileData || false)
        : (assessmentData?.riskAssessmentCompleted || false)
    };
    
    // Add specialized template tabs OR standard Asset Inventory (configuration-driven)
    const templateConfig = TEMPLATE_CONFIG[templateId];
    if (templateConfig) {
      tabs[templateConfig.tabId] = true; // Always available for specialized templates
    } else {
      // Non-specialized templates use Asset Inventory (unlocked after survey completion)
      tabs["assets"] = assessmentData?.facilitySurveyCompleted || false;
    }
    
    return tabs;
  };

  const tabsAvailable = getTabsAvailability();

  const handleBack = () => {
    setLocation("/assessments");
  };

  const handleSave = (data: Partial<Assessment>) => {
    updateAssessmentMutation.mutate(data);
  };

  const handleSubmit = (data: Partial<Assessment>) => {
    // Save and mark as submitted
    updateAssessmentMutation.mutate({
      ...data,
      status: "in_review"
    });
    toast({
      title: "Assessment Submitted",
      description: "Your assessment has been submitted for review.",
    });
  };

  const handleFacilitySurveyComplete = () => {
    const templateId = assessmentData?.templateId || "";
    console.log("Facility survey completed, checking templateId:", templateId);
    
    // Redirect to specialized tabs for specialized templates (configuration-driven)
    const templateConfig = TEMPLATE_CONFIG[templateId];
    if (templateConfig) {
      console.log(`${templateId} template detected, advancing to ${templateConfig.label}`);
      setActiveTab(templateConfig.tabId);
    } else {
      // Default behavior for non-specialized templates
      console.log("Standard template, advancing to asset inventory");
      setActiveTab("assets");
    }
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
          className="flex-shrink-0 min-h-9 sm:min-h-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate" data-testid="heading-assessment-title">
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
                  Created {assessmentData.createdAt ? new Date(assessmentData.createdAt).toLocaleDateString() : 'N/A'}
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
                className="whitespace-nowrap text-[10px] sm:text-xs"
              >
                {assessmentData.status === "completed" ? "Completed" : 
                 assessmentData.status === "risk-assessment" ? "Risk Assessment" :
                 assessmentData.status === "facility-survey" ? "Facility Survey" : "Draft"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 gap-2 text-xs sm:text-sm min-h-9 sm:min-h-10"
                    disabled={generateReportMutation.isPending}
                    data-testid="button-generate-report"
                  >
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => generateReportMutation.mutate('pdf')}
                    disabled={generateReportMutation.isPending}
                    data-testid="menu-item-export-pdf"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => generateReportMutation.mutate('docx')}
                    disabled={generateReportMutation.isPending}
                    data-testid="menu-item-export-docx"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as DOCX
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => generateReportMutation.mutate('html')}
                    disabled={generateReportMutation.isPending}
                    data-testid="menu-item-export-html"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as HTML
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="flex-shrink-0 min-h-9 sm:min-h-10"
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
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex gap-1 sm:gap-2 p-1 sm:p-2 w-max min-w-full">
            {workflowConfig.tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  data-testid={`tab-${tab.id}`}
                  disabled={!(tabsAvailable as Record<string, boolean>)[tab.id]}
                  className="flex items-center gap-1 sm:gap-2 justify-center text-center min-h-11 text-sm whitespace-nowrap px-3 flex-shrink-0"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Facility Physical Security Survey */}
        <TabsContent value="facility-survey" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                {getSurveyTypeLabel(assessmentData?.templateId || undefined)} Survey
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Professional assessment of existing physical security controls following ASIS and ANSI standards.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <FacilitySurvey 
                assessmentId={assessmentId}
                templateId={assessmentData?.templateId || undefined}
                onComplete={handleFacilitySurveyComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASIS Risk Assessment - Quantitative framework for facility assessments */}
        <TabsContent value="risk-assessment" className="space-y-4">
          {assessmentData.surveyParadigm === "facility" ? (
            <RiskAssessmentNBS 
              assessmentId={assessmentId}
              onComplete={handleRiskAssessmentComplete}
            />
          ) : (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  Security Risk Assessment
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Systematic identification and analysis of security risks using ASIS International methodology.
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <AssessmentForm 
                  assessmentId={assessmentId}
                  phase="risk-assessment"
                  onSave={handleSave}
                  onSubmit={handleRiskAssessmentComplete}
                />
              </CardContent>
            </Card>
          )}
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

        {/* Warehouse Operations Tab */}
        <TabsContent value="warehouse" className="space-y-4">
          <WarehouseDashboard />
        </TabsContent>

        {/* Retail Operations Tab */}
        <TabsContent value="retail" className="space-y-4">
          <RetailDashboard />
        </TabsContent>

        {/* Manufacturing Operations Tab */}
        <TabsContent value="manufacturing" className="space-y-4">
          <ManufacturingDashboard />
        </TabsContent>

        {/* Infrastructure Operations Tab (Data Center) */}
        <TabsContent value="datacenter" className="space-y-4">
          <DatacenterDashboard />
        </TabsContent>

        {/* Corporate Operations Tab (Office Building) */}
        <TabsContent value="office" className="space-y-4">
          <OfficeDashboard />
        </TabsContent>

        {/* Professional Reports */}
        <TabsContent value="reports" className="space-y-4">
          <AIReportGenerator
            assessmentId={assessmentId}
            assessmentName={assessmentData?.title || 'Assessment'}
            assessmentType={assessmentData?.templateId || 'executive-protection'}
          />
          
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Additional Report Options
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Generate additional reports using pre-built templates
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
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
          {assessmentData?.templateId === 'office-building' ? (
            // Office Building Security Interview (91 questions, 13 sections)
            <OfficeBuildingInterview 
              assessmentId={assessmentId}
              assessmentStatus={assessmentData?.status}
              onComplete={() => setActiveTab('executive-profile')}
            />
          ) : (
            // Standard Executive Protection Interview
            <>
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    Executive Interview
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Conduct a comprehensive interview with the executive to gather critical security information about their daily routines, travel patterns, digital footprint, and threat awareness.
                  </p>
                </CardHeader>
              </Card>
              
              <ExecutiveInterview 
                assessmentId={assessmentId}
                onComplete={() => setActiveTab('executive-profile')}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="executive-profile" className="space-y-4">
          {assessmentData?.templateId === 'executive-protection' ? (
            // Executive Protection Framework - Principal Profile Dashboard
            <ExecutiveDashboard />
          ) : (
            // Legacy Executive Templates - Survey Questions
            <>
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    Executive Profile & Threat Assessment
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Comprehensive assessment of the executive's profile, public visibility, and threat landscape based on industry, position, and known threats.
                  </p>
                </CardHeader>
              </Card>
              
              <ExecutiveSurveyQuestions 
                assessmentId={assessmentId}
                onComplete={() => setActiveTab('digital-footprint')}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="digital-footprint" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                Digital Footprint Analysis
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                Physical Security Review
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                Executive Risk Analysis
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comprehensive risk analysis combining digital footprint findings, physical security assessment, and threat intelligence.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <EnhancedRiskAssessment 
                assessmentId={assessmentId}
                onComplete={() => setActiveTab('treatment-plan')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment-plan" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Security Treatment Plan
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Protective measures, security controls, procedures, and recommendations for executive protection.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-muted-foreground">Treatment planning controls are managed within the Risk Analysis tab above. Navigate to Risk Analysis to define and implement security controls for identified risks.</p>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('risk-analysis')}
                className="mt-4 w-full sm:w-auto text-xs sm:text-sm min-h-9 sm:min-h-10"
                data-testid="button-goto-risk-analysis"
              >
                Go to Risk Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive-summary" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Executive Summary & Reports
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Final executive summary with key findings, priority risks, and recommended protective measures.
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
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
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-4 p-3 sm:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-medium text-green-800">Assessment Complete</p>
                <p className="text-xs sm:text-sm text-green-600">
                  Both facility survey and risk assessment phases completed successfully
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600 text-[10px] sm:text-xs whitespace-nowrap">
              Completed {assessmentData.completedAt ? new Date(assessmentData.completedAt).toLocaleDateString() : 'N/A'}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirmation" className="p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete "{assessmentData.title}"? This action cannot be undone.
              All associated data including survey responses, risk assessments, and reports will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel data-testid="button-cancel-delete" className="w-full sm:w-auto text-xs sm:text-sm min-h-9 sm:min-h-10 m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAssessmentMutation.mutate()}
              disabled={deleteAssessmentMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto text-xs sm:text-sm min-h-9 sm:min-h-10"
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