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
import { ReportsTab } from "@/components/reports/ReportsTab";
import ExecutiveSurveyQuestions, { EP_PART1_CATEGORIES, EP_PART2_CATEGORIES } from "@/components/ExecutiveSurveyQuestions";
import ExecutiveInterview from "@/components/ExecutiveInterview";
import ExecutiveInterviewTabs from "@/components/ExecutiveInterviewTabs";
import ExecutivePhysicalSecurityWizard from "@/components/ExecutivePhysicalSecurityWizard";
import OfficeBuildingInterview from "@/components/OfficeBuildingInterview";
import { EnhancedRiskAssessment } from "@/components/EnhancedRiskAssessment";
import { RiskAssessmentNBS } from "@/components/RiskAssessmentNBS";
import WarehouseDashboard from "@/pages/assessments/WarehouseDashboard";
import RetailDashboard from "@/pages/assessments/RetailDashboard";
import ManufacturingDashboard from "@/pages/assessments/ManufacturingDashboard";
import DatacenterDashboard from "@/pages/assessments/DatacenterDashboard";
import OfficeDashboard from "@/pages/assessments/OfficeDashboard";
import ExecutiveDashboard from "@/pages/assessments/ExecutiveDashboard";
import { ArrowLeft, MapPin, User, Calendar, Building, Building2, Shield, FileText, CheckCircle, MessageSquare, Trash2, FileDown, ChevronDown, Warehouse, ShoppingBag, Factory, Server, Database, UserCheck, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Site } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Assessment, RiskScenario } from "@shared/schema";
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
  "executive-protection": { tabId: "executive", label: "Executive Protection", icon: UserCheck, dashboardComponent: ExecutiveDashboard },
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

// Generate formatted HTML for survey data export
function generateSurveyExportHTML(data: any): string {
  const escapeHtml = (str: string) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatResponse = (response: any) => {
    if (response === null || response === undefined) return '<em class="text-muted">No response</em>';
    if (typeof response === 'boolean') return response ? 'Yes' : 'No';
    if (typeof response === 'object') return `<pre>${escapeHtml(JSON.stringify(response, null, 2))}</pre>`;
    return escapeHtml(String(response));
  };

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey Data Export - ${escapeHtml(data.assessment?.name || 'Assessment')}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .header { background: #1a1a2e; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; }
    .header .meta { opacity: 0.8; font-size: 14px; }
    .site-info { background: white; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #4f46e5; }
    .category { background: white; border-radius: 8px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .category-header { background: #4f46e5; color: white; padding: 12px 16px; font-weight: 600; }
    .question { border-bottom: 1px solid #e5e5e5; padding: 16px; }
    .question:last-child { border-bottom: none; }
    .question-text { font-weight: 500; margin-bottom: 8px; }
    .response { background: #f0f9ff; padding: 12px; border-radius: 4px; margin-top: 8px; }
    .notes { background: #fef3c7; padding: 12px; border-radius: 4px; margin-top: 8px; font-style: italic; }
    .evidence { margin-top: 12px; }
    .evidence img { max-width: 300px; border-radius: 4px; margin: 4px; }
    .evidence-link { color: #4f46e5; text-decoration: none; display: inline-block; margin: 4px; }
    .stats { display: flex; gap: 16px; margin-top: 16px; }
    .stat { background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 4px; }
    .subcategory { color: #666; font-size: 12px; margin-bottom: 4px; }
    .standard { font-size: 11px; color: #888; margin-top: 4px; }
    pre { background: #f8f8f8; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
    .text-muted { color: #999; }
    .json-export { background: white; padding: 16px; border-radius: 8px; margin-top: 24px; }
    .json-export summary { cursor: pointer; font-weight: 500; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(data.assessment?.name || 'Survey Data Export')}</h1>
    <div class="meta">
      Template: ${escapeHtml(data.assessment?.templateId || 'N/A')} | 
      Status: ${escapeHtml(data.assessment?.status || 'N/A')} | 
      Exported: ${new Date(data.exportedAt).toLocaleString()}
    </div>
    <div class="stats">
      <div class="stat">Total Questions: ${data.surveyData?.totalQuestions || 0}</div>
      <div class="stat">Answered: ${data.surveyData?.answeredQuestions || 0}</div>
      <div class="stat">Completion: ${data.surveyData?.totalQuestions ? Math.round((data.surveyData.answeredQuestions / data.surveyData.totalQuestions) * 100) : 0}%</div>
    </div>
  </div>`;

  if (data.site) {
    html += `
  <div class="site-info">
    <strong>${escapeHtml(data.site.name)}</strong><br>
    ${escapeHtml([data.site.address, data.site.city, data.site.state, data.site.zip].filter(Boolean).join(', '))}
  </div>`;
  }

  // Render each category
  const categories = data.surveyData?.categories || {};
  for (const [categoryName, questions] of Object.entries(categories)) {
    const questionList = questions as any[];
    html += `
  <div class="category">
    <div class="category-header">${escapeHtml(categoryName)} (${questionList.length} questions)</div>`;
    
    for (const q of questionList) {
      html += `
    <div class="question">
      ${q.subcategory ? `<div class="subcategory">${escapeHtml(q.subcategory)}</div>` : ''}
      <div class="question-text">${escapeHtml(q.question)}</div>
      <div class="response"><strong>Response:</strong> ${formatResponse(q.response)}</div>`;
      
      if (q.notes) {
        html += `
      <div class="notes"><strong>Notes:</strong> ${escapeHtml(q.notes)}</div>`;
      }
      
      if (q.evidence && q.evidence.length > 0) {
        html += `
      <div class="evidence"><strong>Evidence Photos:</strong><br>`;
        for (const photo of q.evidence) {
          const url = typeof photo === 'string' ? photo : photo.url;
          if (url) {
            // Check if it's a base64 data URL or a regular path
            if (url.startsWith('data:image')) {
              html += `<img src="${url}" alt="Evidence photo" style="max-width: 300px; border-radius: 4px; margin: 4px;">`;
            } else {
              html += `<a href="${escapeHtml(url)}" target="_blank" class="evidence-link">${escapeHtml(url.split('/').pop() || 'Photo')}</a>`;
            }
          }
        }
        html += `</div>`;
      }
      
      if (q.standard) {
        html += `
      <div class="standard">Standard: ${escapeHtml(q.standard)}</div>`;
      }
      
      html += `
    </div>`;
    }
    
    html += `
  </div>`;
  }

  // Add raw JSON export at the bottom
  html += `
  <details class="json-export">
    <summary>View Raw JSON Data</summary>
    <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
  </details>
</body>
</html>`;

  return html;
}

interface AssessmentDetailProps {
  assessmentId?: string;
}

export default function AssessmentDetail({ assessmentId = "demo-001" }: AssessmentDetailProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSiteId, setEditSiteId] = useState<string | null>(null);
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

  // Fetch risk scenarios to determine if risk-assessment tab should be enabled
  const { data: riskScenarios } = useQuery<RiskScenario[]>({
    queryKey: ["/api/assessments", assessmentId, "risk-scenarios"],
    enabled: !!assessmentId
  });

  // Fetch site data if assessment has a siteId
  const { data: siteData } = useQuery<{ id: string; name: string }>({
    queryKey: ["/api/sites", assessmentData?.siteId],
    enabled: !!assessmentData?.siteId
  });

  // Fetch all sites for edit dialog
  const { data: allSites = [] } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
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

  // Export raw survey data mutation
  const exportSurveyDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', `/api/assessments/${assessmentId}/survey-export`);
      const exportData = await response.json();
      
      // Generate formatted HTML for better readability
      const html = generateSurveyExportHTML(exportData);
      
      // Create blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${exportData.assessment?.name || 'Survey'}_Data_Export_${new Date().toISOString().split('T')[0]}.html`;
      link.download = fileName.replace(/[^a-z0-9.-]/gi, '_');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { fileName };
    },
    onSuccess: (data) => {
      toast({
        title: "Survey Data Exported",
        description: "Your complete survey data has been downloaded.",
      });
    },
    onError: (error) => {
      console.error("Error exporting survey data:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export survey data. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Start with undefined tab - will be set after data loads
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  // Classic view sunsetted - wizard is now the only view
  
  // Set initial tab based on paradigm after data loads (only once to prevent reset on refetch)
  useEffect(() => {
    if (assessmentData && !hasInitializedTab.current) {
      const paradigm = assessmentData.surveyParadigm || "facility";
      const templateId = assessmentData.templateId || "";
      let correctTab: string;
      if (paradigm === "executive") {
        // EP assessments start with interview, legacy executive starts with executive-interview
        correctTab = templateId === "executive-protection" ? "ep-interview" : "executive-interview";
      } else {
        correctTab = "facility-survey";
      }
      setActiveTab(correctTab);
      hasInitializedTab.current = true;
    }
  }, [assessmentData]);
  
  // Helper to check if this is an EP assessment
  const isEPAssessment = assessmentData?.templateId === "executive-protection";

  // Get paradigm-specific workflow configuration
  const getWorkflowConfig = () => {
    const paradigm = assessmentData?.surveyParadigm || "facility";
    const templateId = assessmentData?.templateId || "";
    
    if (paradigm === "executive") {
      // Executive Protection: Interview collects data → Dashboard shows AI results
      if (templateId === "executive-protection") {
        return {
          tabs: [
            { id: "ep-interview", label: "Executive Interview", icon: MessageSquare },
            { id: "ep-physical", label: "Physical Security", icon: Building },
            { id: "executive", label: "EP Dashboard", icon: UserCheck },
            { id: "reports", label: "AI Reports", icon: FileText }
          ],
          phases: [
            { label: "Interview", completed: false },
            { label: "Physical Security", completed: false },
            { label: "Analysis", completed: false },
            { label: "Reports", completed: false }
          ]
        };
      }
      // Legacy executive templates use old workflow
      return {
        tabs: [
          { id: "executive-interview", label: "Executive Interview", icon: MessageSquare },
          { id: "physical-security", label: "Physical Security Review", icon: Building },
          { id: "risk-analysis", label: "Risk Analysis", icon: Shield },
          { id: "treatment-plan", label: "Security Treatment Plan", icon: FileText },
          { id: "executive-summary", label: "Executive Summary", icon: CheckCircle },
          { id: "reports", label: "AI Reports", icon: FileText }
        ],
        phases: [
          { label: "Profile & Threats", completed: false },
          { label: "Analysis", completed: false },
          { label: "Treatment & Reports", completed: false }
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
      // Executive paradigm - all tabs available from start
      // New EP Dashboard for executive-protection, legacy tabs for others
      return workflowConfig.tabs.reduce((acc, tab) => ({
        ...acc,
        [tab.id]: true
      }), {} as Record<string, boolean>);
    }
    
    // Check if specialized template profile is saved
    const hasProfileData = isSpecializedTemplate && !!(
      assessmentData?.warehouseProfile ||
      assessmentData?.retailProfile ||
      assessmentData?.manufacturingProfile ||
      assessmentData?.datacenterProfile ||
      assessmentData?.officeProfile
    );
    
    // Check if risk scenarios already exist for this assessment
    const hasScenariosData = (riskScenarios && riskScenarios.length > 0) || false;
    
    // Facility paradigm - sequential unlock
    const tabs: Record<string, boolean> = {
      "facility-survey": true,
      // Enable risk-assessment tab if:
      // 1. Profile data is saved (specialized templates), OR
      // 2. Facility survey is completed, OR
      // 3. Risk scenarios already exist (allows access to view existing data)
      "risk-assessment": isSpecializedTemplate
        ? (hasProfileData || assessmentData?.facilitySurveyCompleted || hasScenariosData || false)
        : (assessmentData?.facilitySurveyCompleted || hasScenariosData || false),
      // AI Reports tab is always available - allows report generation at any stage
      "reports": true
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
    setLocation("/app/assessments");
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

  // Open edit dialog and populate with current values
  const handleOpenEditDialog = () => {
    if (assessmentData) {
      setEditTitle(assessmentData.title);
      setEditSiteId(assessmentData.siteId || null);
      setEditDialogOpen(true);
    }
  };

  // Save edited assessment details
  const handleSaveEdit = () => {
    const updates: Partial<Assessment> = {
      title: editTitle,
    };
    
    if (editSiteId) {
      const selectedSite = allSites.find(s => s.id === editSiteId);
      updates.siteId = editSiteId;
      if (selectedSite) {
        updates.location = `${selectedSite.name} - ${selectedSite.city}, ${selectedSite.state}`;
      }
    } else {
      updates.siteId = null;
    }
    
    updateAssessmentMutation.mutate(updates, {
      onSuccess: () => {
        setEditDialogOpen(false);
        toast({
          title: "Assessment Updated",
          description: "Assessment details have been saved.",
        });
      },
    });
  };

  // Show loading state while data or activeTab are not ready
  // Also wait for initial tab to be correctly set based on actual assessment data
  if (isLoading || !activeTab || !hasInitializedTab.current) {
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
    <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full min-w-0 max-w-full">
      {/* Header with Phase Progress */}
      <div className="flex items-start gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleBack}
          data-testid="button-back"
          className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* Title Row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate max-w-full" data-testid="heading-assessment-title">
                  {assessmentData.title}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenEditDialog}
                  data-testid="button-edit-assessment"
                  className="h-7 w-7 flex-shrink-0"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <Badge 
                  variant={assessmentData.status === "completed" ? "default" : "secondary"}
                  data-testid="badge-status"
                  className="whitespace-nowrap text-[10px] sm:text-xs"
                >
                  {assessmentData.status === "completed" ? "Completed" : 
                   assessmentData.status === "risk-assessment" ? "Risk Assessment" :
                   assessmentData.status === "facility-survey" ? "Facility Survey" : "Draft"}
                </Badge>
              </div>
            </div>
            
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
              {siteData?.name && (
                <div className="flex items-center min-w-0">
                  <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none font-medium text-foreground">{siteData.name}</span>
                </div>
              )}
              <div className="flex items-center min-w-0">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{assessmentData.location}</span>
              </div>
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{assessmentData.assessor}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="hidden sm:inline">Created </span>{assessmentData.createdAt ? new Date(assessmentData.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            
            {/* Phase Progress + Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
              {/* Phase Progress Indicator */}
              <div className="horizontal-scroll-container flex-1 min-w-0">
                <div className="flex items-center gap-1 w-max">
                  {workflowConfig.phases.map((phase, index) => (
                    <div key={index} className="flex items-center gap-0.5 sm:gap-1">
                      <div className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap ${
                        phase.completed ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : 
                        currentPhase > index ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {phase.completed ? <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" /> : <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />}
                        <span className="hidden md:inline">{phase.label}</span>
                        <span className="md:hidden">{phase.label.split(' ')[0]}</span>
                      </div>
                      {index < workflowConfig.phases.length - 1 && (
                        <div className={`w-3 sm:w-4 md:w-6 h-0.5 ${currentPhase > index + 1 ? "bg-green-500" : "bg-muted"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
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
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Raw Data</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => exportSurveyDataMutation.mutate()}
                    disabled={exportSurveyDataMutation.isPending}
                    data-testid="menu-item-export-survey-data"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Export Survey Data
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
    </div>

      {/* Main Content - Paradigm-Aware Tabs */}
      <Tabs value={activeTab || ''} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 w-full min-w-0">
        <div className="w-full min-w-0 horizontal-scroll-container pb-1">
          <TabsList className="inline-flex gap-1 p-1 w-max bg-muted/50">
            {workflowConfig.tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  data-testid={`tab-${tab.id}`}
                  disabled={!(tabsAvailable as Record<string, boolean>)[tab.id]}
                  className="flex items-center gap-1 sm:gap-1.5 justify-center text-center min-h-8 sm:min-h-9 text-[11px] sm:text-xs md:text-sm whitespace-nowrap px-2 sm:px-3 flex-shrink-0"
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Facility Physical Security Survey - Not for EP assessments */}
        {!isEPAssessment && (
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
                  key={`facility-survey-${activeTab === 'facility-survey' ? 'active' : 'inactive'}`}
                  assessmentId={assessmentId}
                  templateId={assessmentData?.templateId || undefined}
                  onComplete={handleFacilitySurveyComplete}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ASIS Risk Assessment - Quantitative framework for facility assessments - Not for EP */}
        {!isEPAssessment && (
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
        )}

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

        {/* EP Interview Tab - Data collection for EP assessments */}
        {isEPAssessment && (
          <TabsContent value="ep-interview" className="space-y-4 min-w-0 overflow-hidden">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  Executive Interview
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Comprehensive interview covering daily routines, travel patterns, digital footprint, and threat awareness. This data feeds the AI risk analysis.
                </p>
              </CardHeader>
            </Card>
            <ExecutiveInterviewTabs 
              assessmentId={assessmentId}
              onComplete={() => setActiveTab('ep-physical')}
            />
          </TabsContent>
        )}

        {/* EP Physical Security Tab - Security assessment for EP assessments */}
        {isEPAssessment && (
          <TabsContent value="ep-physical" className="space-y-4">
            <ExecutivePhysicalSecurityWizard
              assessmentId={assessmentId}
              onComplete={() => setActiveTab('executive')}
            />
          </TabsContent>
        )}

        {/* Executive Protection Dashboard Tab - AI-generated analysis results */}
        <TabsContent value="executive" className="space-y-4">
          <ExecutiveDashboard />
        </TabsContent>

        {/* Professional Reports */}
        <TabsContent value="reports" className="space-y-4">
          <ReportsTab assessmentId={assessmentId} />
        </TabsContent>

        {/* Legacy Executive Paradigm Tabs - NOT for EP assessments using new dashboard */}
        {!isEPAssessment && (
          <>
            <TabsContent value="executive-interview" className="space-y-4 min-w-0 overflow-hidden">
              {assessmentData?.templateId === 'office-building' ? (
                <OfficeBuildingInterview 
                  assessmentId={assessmentId}
                  assessmentStatus={assessmentData?.status}
                  onComplete={() => setActiveTab('executive-profile')}
                />
              ) : (
                <>
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                        Executive Interview
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Conduct a comprehensive interview with the executive to gather critical security information.
                      </p>
                    </CardHeader>
                  </Card>
                  <ExecutiveInterview 
                    assessmentId={assessmentId}
                    onComplete={() => setActiveTab('physical-security')}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="physical-security" className="space-y-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                    Physical Security Review
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Assessment of residential security, executive office protection, and travel routes.
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
                    Comprehensive risk analysis combining all findings with threat intelligence.
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
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-muted-foreground">Treatment planning controls are managed within the Risk Analysis tab.</p>
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
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Executive Summary & Reports
                  </CardTitle>
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
          </>
        )}
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

      {/* Edit Assessment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-assessment" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Assessment</DialogTitle>
            <DialogDescription>
              Update the assessment name and associated site.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Assessment Name</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter assessment name"
                data-testid="input-edit-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-site">Associated Site</Label>
              <Select
                value={editSiteId || "none"}
                onValueChange={(value) => setEditSiteId(value === "none" ? null : value)}
              >
                <SelectTrigger id="edit-site" data-testid="select-edit-site">
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No site selected</SelectItem>
                  {allSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name} - {site.city}, {site.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Linking to a site enables geographic intelligence features
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || updateAssessmentMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateAssessmentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}