import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Sparkles,
  Trash2,
  RefreshCw
} from "lucide-react";

interface ReportRecipe {
  id: string;
  name: string;
  description: string;
  reportType: string;
  assessmentTypes: string[];
  sections: { id: string; title: string; order: number }[];
  isActive: boolean;
}

interface GeneratedReport {
  id: string;
  assessmentId: string;
  recipeId: string;
  reportType: string;
  status: string;
  generatedAt: string;
  generatedBy?: string;
}

interface AIReportGeneratorProps {
  assessmentId: string;
  assessmentName: string;
  assessmentType?: string;
}

export function AIReportGenerator({ 
  assessmentId, 
  assessmentName,
  assessmentType = 'executive-protection'
}: AIReportGeneratorProps) {
  const { toast } = useToast();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reportStatus } = useQuery<{ anthropicConfigured: boolean; message: string }>({
    queryKey: ['/api/reports/status'],
  });

  const { data: recipes, isLoading: recipesLoading } = useQuery<ReportRecipe[]>({
    queryKey: ['/api/reports/recipes'],
    enabled: !!reportStatus?.anthropicConfigured,
  });

  const { data: existingReports, isLoading: reportsLoading } = useQuery<GeneratedReport[]>({
    queryKey: ['/api/assessments', assessmentId, 'reports'],
    enabled: !!assessmentId,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const response = await apiRequest('POST', `/api/assessments/${assessmentId}/reports/generate`, {
        recipeId
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', assessmentId, 'reports'] });
      toast({
        title: "Report Generated",
        description: `Successfully generated report with ${data.sectionsGenerated} sections.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: `Failed to generate report: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const downloadPDFMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Accept': 'application/pdf',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/assessments/${assessmentId}/reports/${reportId}/pdf`, {
        method: 'POST',
        credentials: 'include',
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to download PDF');
      }
      
      return response.blob();
    },
    onSuccess: (blob, reportId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF Downloaded",
        description: "Your report has been downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: `Failed to download PDF: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const generateAndDownloadPDFMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      setIsGenerating(true);
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/assessments/${assessmentId}/reports/generate-pdf`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ recipeId })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate PDF');
      }
      
      const reportId = response.headers.get('X-Report-Id') || 'report';
      const blob = await response.blob();
      
      return { blob, reportId };
    },
    onSuccess: ({ blob, reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', assessmentId, 'reports'] });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Report Generated & Downloaded",
        description: "Your AI-generated report has been created and downloaded.",
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: `Failed to generate report: ${(error as Error).message}`,
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateReport = () => {
    if (!selectedRecipeId) {
      toast({
        title: "Select a Recipe",
        description: "Please select a report template before generating.",
        variant: "destructive",
      });
      return;
    }
    generateReportMutation.mutate(selectedRecipeId);
  };

  const handleGenerateAndDownload = () => {
    if (!selectedRecipeId) {
      toast({
        title: "Select a Recipe",
        description: "Please select a report template before generating.",
        variant: "destructive",
      });
      return;
    }
    generateAndDownloadPDFMutation.mutate(selectedRecipeId);
  };

  const handleDownloadPDF = (reportId: string) => {
    downloadPDFMutation.mutate(reportId);
  };

  const filteredRecipes = recipes?.filter(r => 
    r.isActive && r.assessmentTypes.includes(assessmentType)
  ) || [];

  const isAIReady = reportStatus?.anthropicConfigured;

  return (
    <div className="space-y-6">
      <Card data-testid="card-ai-report-generator">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Report Generator</CardTitle>
          </div>
          <CardDescription>
            Generate professional security assessment reports using AI-powered narrative generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAIReady ? (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">AI Generation Unavailable</p>
                <p className="text-sm text-muted-foreground">
                  The Anthropic API is not configured. Please contact your administrator.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Report Template</label>
                {recipesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select 
                    value={selectedRecipeId} 
                    onValueChange={setSelectedRecipeId}
                    data-testid="select-recipe"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a report template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRecipes.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No templates available for this assessment type
                        </SelectItem>
                      ) : (
                        filteredRecipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            <div className="flex flex-col">
                              <span>{recipe.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {recipe.sections.length} sections
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedRecipeId && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Template Details</h4>
                  {filteredRecipes.find(r => r.id === selectedRecipeId) && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {filteredRecipes.find(r => r.id === selectedRecipeId)?.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {filteredRecipes.find(r => r.id === selectedRecipeId)?.sections
                          .sort((a, b) => a.order - b.order)
                          .map(section => (
                            <Badge key={section.id} variant="outline" className="text-xs">
                              {section.title}
                            </Badge>
                          ))
                        }
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 flex-wrap">
          <Button
            onClick={handleGenerateAndDownload}
            disabled={!isAIReady || !selectedRecipeId || isGenerating || generateAndDownloadPDFMutation.isPending}
            className="gap-2"
            data-testid="button-generate-pdf"
          >
            {isGenerating || generateAndDownloadPDFMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate PDF Report
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            disabled={!isAIReady || !selectedRecipeId || generateReportMutation.isPending}
            className="gap-2"
            data-testid="button-generate-only"
          >
            {generateReportMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate & Save
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card data-testid="card-generated-reports">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Generated Reports</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/assessments', assessmentId, 'reports'] })}
              data-testid="button-refresh-reports"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Previously generated reports for this assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !existingReports || existingReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reports generated yet</p>
              <p className="text-sm">Use the generator above to create your first report</p>
            </div>
          ) : (
            <div className="space-y-3">
              {existingReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`report-item-${report.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {report.recipeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {report.reportType}
                        </Badge>
                        {report.status === 'completed' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(report.generatedAt).toLocaleDateString()} at{' '}
                          {new Date(report.generatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPDF(report.id)}
                      disabled={downloadPDFMutation.isPending}
                      className="gap-1"
                      data-testid={`button-download-${report.id}`}
                    >
                      {downloadPDFMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
