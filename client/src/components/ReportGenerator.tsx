import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Download, Eye, Share, Mail, AlertCircle } from "lucide-react";
import { generateExecutiveSummaryPDF } from "@/lib/executiveSummaryPDF";
import { generateTechnicalReportPDF } from "@/lib/technicalReportPDF";

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
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  
  const isFreeAccount = user?.accountTier === "free";
  
  const handleGenerate = (reportId: string) => {
    console.log(`Generating report: ${reportId}`);
    onGenerate?.(reportId);
  };

  const handlePreview = (report: ReportConfig) => {
    setPreviewReport(report);
    setPreviewOpen(true);
  };

  const handleDownload = async (reportId: string) => {
    if (isFreeAccount) {
      toast({
        title: "Upgrade Required",
        description: "PDF exports require a Pro or Enterprise account",
        variant: "destructive",
      });
      return;
    }

    setGeneratingPDF(reportId);
    
    try {
      if (reportId === 'exec-summary') {
        await generateExecutiveSummaryPDF(assessmentId);
      } else if (reportId === 'detailed-technical') {
        await generateTechnicalReportPDF(assessmentId);
      } else if (reportId === 'compliance-report') {
        toast({
          title: "Coming Soon",
          description: "Compliance report generation will be available soon",
        });
        return;
      }
      
      toast({
        title: "Report Downloaded",
        description: `${reportId} has been generated and downloaded successfully`,
      });
      
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
                        disabled={generatingPDF === report.id || isFreeAccount}
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
                {isFreeAccount && report.status === "ready" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="message-upgrade-pdf">
                    <AlertCircle className="h-4 w-4" />
                    <span>PDF exports require a Pro or Enterprise account. <a href="/pricing" className="text-primary hover:underline">Upgrade now</a></span>
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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" data-testid="dialog-report-preview">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewReport?.title}
            </DialogTitle>
          </DialogHeader>
          
          {previewReport && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {previewReport.format.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className={
                      previewReport.status === "ready" ? "bg-chart-2 text-chart-2-foreground" :
                      previewReport.status === "generating" ? "bg-chart-3 text-chart-3-foreground" :
                      "bg-destructive text-destructive-foreground"
                    }
                  >
                    {previewReport.status.charAt(0).toUpperCase() + previewReport.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {previewReport.description}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Report Metadata</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Assessment ID:</span>
                    <span className="ml-2 font-mono">{assessmentId}</span>
                  </div>
                  {previewReport.lastGenerated && (
                    <div>
                      <span className="text-muted-foreground">Last Generated:</span>
                      <span className="ml-2">{previewReport.lastGenerated}</span>
                    </div>
                  )}
                  {previewReport.size && (
                    <div>
                      <span className="text-muted-foreground">File Size:</span>
                      <span className="ml-2">{previewReport.size}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Report ID:</span>
                    <span className="ml-2 font-mono">{previewReport.id}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Report Sections</h3>
                <div className="space-y-2">
                  {previewReport.sections.map((section, idx) => (
                    <div key={section} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground font-mono">{idx + 1}.</span>
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  {previewReport.format === 'pdf' && 
                    'This preview shows the report structure. The actual PDF will include formatted content, charts, and images.'
                  }
                  {previewReport.format === 'docx' && 
                    'This preview shows the report structure. The actual DOCX will include formatted content with proper styling.'
                  }
                  {previewReport.format === 'html' && 
                    'This preview shows the report structure. The actual HTML will include interactive elements and embedded charts.'
                  }
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                  data-testid="button-close-preview"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleDownload(previewReport.id);
                    setPreviewOpen(false);
                  }}
                  disabled={generatingPDF === previewReport.id}
                  data-testid="button-download-from-preview"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {generatingPDF === previewReport.id ? "Generating..." : "Download Report"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}