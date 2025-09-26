import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RiskInsight } from "@shared/schema";

interface RiskInsight {
  id: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendation: string;
  impact: number; // 1-10
  probability: number; // 1-10
}

interface RiskAnalysisProps {
  assessmentId: string;
  isAnalyzing?: boolean;
  insights?: RiskInsight[];
  onGenerateAnalysis?: () => void;
}

const severityConfig = {
  low: { color: "bg-chart-2 text-chart-2-foreground", icon: CheckCircle },
  medium: { color: "bg-chart-3 text-chart-3-foreground", icon: TrendingUp },
  high: { color: "bg-chart-4 text-chart-4-foreground", icon: AlertTriangle },
  critical: { color: "bg-destructive text-destructive-foreground", icon: AlertTriangle }
};

export function RiskAnalysis({ 
  assessmentId,
  isAnalyzing = false,
  onGenerateAnalysis 
}: RiskAnalysisProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing insights for this assessment
  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "insights"],
    queryFn: () => assessmentApi.getInsights(assessmentId),
    enabled: !!assessmentId,
  });

  // Generate analysis mutation
  const generateAnalysisMutation = useMutation({
    mutationFn: () => assessmentApi.analyze(assessmentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Analysis Complete",
        description: `AI analysis generated ${data.insights.length} risk insights with ${data.riskLevel} overall risk level.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: `Failed to generate analysis: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleGenerateAnalysis = () => {
    generateAnalysisMutation.mutate();
    onGenerateAnalysis?.();
  };
  
  const riskScore = insights.reduce((acc, insight) => {
    return acc + (insight.impact * insight.probability);
  }, 0);
  
  const maxRiskScore = insights.length * 100; // 10 * 10 per insight
  const riskPercentage = maxRiskScore > 0 ? (riskScore / maxRiskScore) * 100 : 0;

  const currentlyAnalyzing = isAnalyzing || generateAnalysisMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Risk Analysis
            </CardTitle>
            <Button 
              onClick={handleGenerateAnalysis}
              disabled={currentlyAnalyzing}
              data-testid="button-generate-analysis"
            >
              {currentlyAnalyzing ? "Analyzing..." : "Generate Analysis"}
            </Button>
          </div>
        </CardHeader>
        
        {insights.length > 0 && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Risk Score</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(riskPercentage)}%
                  </span>
                </div>
                <Progress 
                  value={riskPercentage} 
                  className="h-2"
                  data-testid="progress-risk-score"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                {Object.entries(
                  insights.reduce((acc, insight) => {
                    acc[insight.severity] = (acc[insight.severity] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([severity, count]) => {
                  const config = severityConfig[severity as keyof typeof severityConfig];
                  return (
                    <div key={severity} className="space-y-1">
                      <div className="text-2xl font-bold font-mono">{count}</div>
                      <Badge variant="secondary" className={config.color}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {currentlyAnalyzing && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Brain className="h-8 w-8 animate-pulse mx-auto text-primary" />
              <p className="text-muted-foreground">AI is analyzing assessment data...</p>
              <Progress value={65} className="w-48" />
            </div>
          </CardContent>
        </Card>
      )}

      {insightsLoading && !currentlyAnalyzing && (
        <Card>
          <CardContent className="flex items-center justify-center py-4">
            <div className="text-center">
              <p className="text-muted-foreground">Loading analysis results...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Risk Insights & Recommendations</h3>
          
          {insights.map((insight) => {
            const config = severityConfig[insight.severity];
            const Icon = config.icon;
            
            return (
              <Card key={insight.id} data-testid={`card-insight-${insight.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {insight.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={config.color}>
                          {insight.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{insight.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Risk: {insight.impact}/10</div>
                      <div>Probability: {insight.probability}/10</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">AI Recommendation</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}