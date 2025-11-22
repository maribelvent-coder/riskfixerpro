import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Download, Eye, Share, Mail, AlertCircle, Loader2 } from "lucide-react";
import { generateExecutiveSummaryPDF } from "@/lib/executiveSummaryPDF";
import { generateTechnicalReportPDF } from "@/lib/technicalReportPDF";
import { canExportPDF, getUpgradeMessage, type AccountTier } from "@shared/tierLimits";
import { generateHTMLReport } from "@/lib/htmlReportGenerator";
import { apiRequest } from "@/lib/queryClient";

interface ReportConfig {
  id: string;
  title: string;
  description: string;
  format: "pdf" | "docx" | "html";
  sections: string[];
  status: "ready" | "generating" | "error";
  lastGenerated?: string;
  size?: string;
}

const mockReports: ReportConfig[] = [
  {
    id: "comprehensive-assessment",
    title: "Comprehensive Assessment Report",
    description: "Complete security assessment with AI analysis, risk matrix, and template-specific insights",
    format: "pdf",
    sections: ["Executive Summary", "Risk Matrix", "Detailed Findings", "Financial Impact", "Template-Specific Features"],
    status: "ready",
    lastGenerated: "Today",
    size: "5.2 MB"
  },
  {
    id: "exec-summary",
    title: "Executive Summary",
    description: "High-level overview for management with key findings and recommendations",
    format: "pdf",
    sections: ["Risk Overview", "Critical Findings", "Recommendations", "Action Items"],
    status: "ready",
    lastGenerated: "Dec 20, 2024",
    size: "2.3 MB"
  },
  {
    id: "detailed-technical",
    title: "Detailed Technical Report", 
    description: "Comprehensive technical assessment with all findings and evidence",
    format: "pdf",
    sections: ["Assessment Methodology", "Detailed Findings", "Risk Analysis", "Evidence", "Appendices"],
    status: "ready",
    lastGenerated: "Dec 20, 2024",
    size: "8.7 MB"
  }
];

interface ReportGeneratorProps {
  assessmentId?: string;
  reports?: ReportConfig[];
  onGenerate?: (reportId: string) => void;
  onDownload?: (reportId: string) => void;
  onShare?: (reportId: string) => void;
}

export function ReportGenerator({
  assessmentId = "sample-001",
  reports = mockReports,
  onGenerate,
  onDownload,
  onShare
}: ReportGeneratorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<ReportConfig | null>(null);
  const [previewHTML, setPreviewHTML] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  
  const tier = (user?.accountTier || "free") as AccountTier;
  const canExport = canExportPDF(tier);
  
  const handleGenerate = (reportId: string) => {
    console.log(`Generating report: ${reportId}`);
    onGenerate?.(reportId);
  };

  const handlePreview = async (report: ReportConfig) => {
    setPreviewReport(report);
    setPreviewOpen(true);
    setLoadingPreview(true);
    setPreviewHTML(null);
    setPreviewError(null);
    
    try {
      // Fetch comprehensive report data
      const response = await apiRequest('GET', `/api/assessments/${assessmentId}/comprehensive-report-data`);
      const reportData = await response.json();
      
      // Basic validation before passing to generator
      // Note: generateHTMLReport has defensive normalization for malformed data
      if (!reportData || typeof reportData !== 'object') {
        throw new Error('Invalid report data received from server');
      }
      
      // Generate HTML report (generator handles missing fields via normalizeReportData)
      const htmlContent = await generateHTMLReport(reportData);
      
      if (!htmlContent || typeof htmlContent !== 'string') {
        throw new Error('HTML generation failed - no content produced');
      }
      
      setPreviewHTML(htmlContent);
      setPreviewError(null);
    } catch (error) {
      const errorMessage = `Failed to generate preview: ${(error as Error).message}`;
      setPreviewError(errorMessage);
      toast({
        title: "Preview Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Keep dialog open to show error state
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    if (!canExport) {
      toast({
        title: "Upgrade Required",
        description: getUpgradeMessage(tier, "pdfExport"),
        variant: "destructive",
      });
      return;
    }

    setGeneratingPDF(reportId);
    
    try {
      if (reportId === 'comprehensive-assessment') {
        // Use native fetch for blob response (apiRequest doesn't support blobs)
        const response = await fetch(`/api/assessments/${assessmentId}/generate-report`, {
          method: 'POST',
          credentials: 'include', // Important: include session cookies
          headers: {
            'Accept': 'application/pdf',
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`PDF generation failed: ${errorText || response.statusText}`);
        }
        
        // Download the PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-assessment-${assessmentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Report Downloaded",
          description: "Comprehensive assessment report generated successfully",
        });
      } else if (reportId === 'exec-summary') {
        await generateExecutiveSummaryPDF(assessmentId);
        toast({
          title: "Report Downloaded",
          description: "Executive summary generated successfully",
        });
      } else if (reportId === 'detailed-technical') {
        await generateTechnicalReportPDF(assessmentId);
        toast({
          title: "Report Downloaded",
          description: "Technical report generated successfully",
        });
      } else if (reportId === 'compliance-report') {
        toast({
          title: "Coming Soon",
          description: "Compliance report generation will be available soon",
        });
        return;
      }
      
      onDownload?.(reportId);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to generate report: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(null);
    }
  };

  const handleShare = (reportId: string) => {
    console.log(`Sharing report: ${reportId}`);
    onShare?.(reportId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate professional security assessment reports in multiple formats
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id} data-testid={`card-report-${report.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {report.format.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className={
                      report.status === "ready" ? "bg-chart-2 text-chart-2-foreground" :
                      report.status === "generating" ? "bg-chart-3 text-chart-3-foreground" :
                      "bg-destructive text-destructive-foreground"
                    }
                  >
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Report Sections</h4>
                <div className="flex flex-wrap gap-1">
                  {report.sections.map((section) => (
                    <Badge key={section} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>

              {report.lastGenerated && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last generated: {report.lastGenerated}</span>
                  {report.size && <span>Size: {report.size}</span>}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  {report.status === "ready" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(report.id)}
                        disabled={generatingPDF === report.id || !canExport}
                        data-testid={`button-download-${report.id}`}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {generatingPDF === report.id ? "Generating..." : "Download PDF"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(report)}
                        data-testid={`button-preview-${report.id}`}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(report.id)}
                        data-testid={`button-share-${report.id}`}
                      >
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </>
                  ) : report.status === "generating" ? (
                    <Button size="sm" disabled>
                      Generating...
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleGenerate(report.id)}
                      data-testid={`button-generate-${report.id}`}
                    >
                      Generate Report
                    </Button>
                  )}
                </div>
                {!canExport && report.status === "ready" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="message-upgrade-pdf">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getUpgradeMessage(tier, "pdfExport")} <a href="/pricing" className="text-primary hover:underline">Upgrade now</a></span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Report Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" data-testid="button-custom-executive">
              <Mail className="h-4 w-4 mr-2" />
              Email Summary to Stakeholders
            </Button>
            <Button variant="outline" data-testid="button-custom-comparison">
              <FileText className="h-4 w-4 mr-2" />
              Generate Comparison Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" data-testid="dialog-report-preview">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewReport?.title} - Preview
            </DialogTitle>
          </DialogHeader>
          
          {loadingPreview ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating preview...</p>
              </div>
            </div>
          ) : previewError ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{previewError}</p>
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                  data-testid="button-close-preview-error"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : previewHTML ? (
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              <iframe
                srcDoc={previewHTML}
                className="w-full flex-1 border rounded-md"
                title="Report Preview"
                sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
                data-testid="iframe-report-preview"
              />
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                  data-testid="button-close-preview"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleDownload(previewReport!.id);
                  }}
                  disabled={generatingPDF === previewReport?.id || !canExport}
                  data-testid="button-download-from-preview"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {generatingPDF === previewReport?.id ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No preview available</p>
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                  data-testid="button-close-preview-empty"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}