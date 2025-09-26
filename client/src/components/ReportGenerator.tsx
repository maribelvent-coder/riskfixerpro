import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Share, Mail } from "lucide-react";

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
  },
  {
    id: "compliance-report",
    title: "Compliance Checklist",
    description: "Regulatory compliance mapping and gap analysis",
    format: "docx",
    sections: ["Compliance Framework", "Gap Analysis", "Remediation Plan"],
    status: "generating",
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
  
  const handleGenerate = (reportId: string) => {
    console.log(`Generating report: ${reportId}`);
    onGenerate?.(reportId);
  };

  const handleDownload = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    onDownload?.(reportId);
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

              <div className="flex gap-2">
                {report.status === "ready" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(report.id)}
                      data-testid={`button-download-${report.id}`}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log(`Preview ${report.id}`)}
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
    </div>
  );
}