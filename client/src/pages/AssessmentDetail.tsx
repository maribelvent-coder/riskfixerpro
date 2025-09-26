import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssessmentForm } from "@/components/AssessmentForm";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { ReportGenerator } from "@/components/ReportGenerator";
import { ArrowLeft, MapPin, User, Calendar, Save, Send } from "lucide-react";

interface AssessmentDetailProps {
  assessmentId?: string;
}

export default function AssessmentDetail({ assessmentId = "demo-001" }: AssessmentDetailProps) {
  const [activeTab, setActiveTab] = useState("assessment");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  //todo: remove mock functionality - replace with real assessment data
  const assessmentData = {
    id: assessmentId,
    title: "Corporate Office Building Security Assessment",
    location: "123 Business Plaza, Suite 100, Downtown District",
    assessor: "Sarah Johnson",
    status: "in-progress",
    createdDate: "December 18, 2024",
    lastModified: "December 22, 2024"
  };

  const handleBack = () => {
    console.log("Navigate back to dashboard");
  };

  const handleSave = (data: any) => {
    console.log("Saving assessment data:", data);
  };

  const handleSubmit = (data: any) => {
    console.log("Submitting assessment for review:", data);
  };

  const handleGenerateAnalysis = () => {
    setIsAnalyzing(true);
    console.log("Generating AI risk analysis...");
    
    setTimeout(() => {
      setIsAnalyzing(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
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
                  Created {assessmentData.createdDate}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-chart-3 text-chart-3-foreground"
                data-testid="badge-status"
              >
                In Progress
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment" data-testid="tab-assessment">
            Assessment Form
          </TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-analysis">
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-4">
          <AssessmentForm
            assessmentId={assessmentId}
            title={assessmentData.title}
            onSave={handleSave}
            onSubmit={handleSubmit}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <RiskAnalysis
            assessmentId={assessmentId}
            isAnalyzing={isAnalyzing}
            onGenerateAnalysis={handleGenerateAnalysis}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportGenerator
            assessmentId={assessmentId}
            onGenerate={handleGenerateReport}
            onDownload={handleDownloadReport}
            onShare={handleShareReport}
          />
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Last saved: {assessmentData.lastModified}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-save-progress">
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button data-testid="button-submit-review">
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}