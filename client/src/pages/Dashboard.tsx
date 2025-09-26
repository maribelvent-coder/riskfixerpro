import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { AssessmentCard } from "@/components/AssessmentCard";
import { Plus, Search, Filter, TrendingUp, Users, Building2, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { dashboardApi, assessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Assessment } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => dashboardApi.getStats(),
  });

  // Fetch all assessments
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments"],
    queryFn: () => assessmentApi.getAll(),
  });

  // Create new assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: assessmentApi.create,
    onSuccess: (newAssessment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Assessment Created",
        description: `New assessment "${newAssessment.title}" has been created.`,
      });
      // Navigate to the new assessment
      setLocation(`/assessments/${newAssessment.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create assessment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateNew = () => {
    const newAssessment = {
      title: "New Security Assessment",
      location: "Enter facility location",
      assessor: "Current User", // In real app, get from auth context
      status: "draft" as const,
    };
    
    createAssessmentMutation.mutate(newAssessment);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredAssessments = assessments.filter(assessment =>
    assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="heading-dashboard">Physical Security Risk Assessment</h1>
          <p className="text-muted-foreground">
            Comprehensive facility surveys and professional risk analysis following ASIS International standards
          </p>
        </div>
        <Button 
          onClick={handleCreateNew} 
          disabled={createAssessmentMutation.isPending}
          data-testid="button-create-assessment"
        >
          <Plus className="h-4 w-4 mr-2" />
          {createAssessmentMutation.isPending ? "Creating..." : "New Assessment"}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-total-assessments">
              {statsLoading ? "..." : stats?.totalAssessments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total assessments created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-active-assessments">
              {statsLoading ? "..." : stats?.activeAssessments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-completed-month">
              {statsLoading ? "..." : stats?.completedThisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-avg-risk">
              {statsLoading ? "..." : (stats?.averageRiskScore || 0).toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Average risk level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Overview */}
      {stats?.riskDistribution && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <RiskScoreCard
              title="Low Risk Assessments"
              score={stats.riskDistribution.low}
              maxScore={stats.totalAssessments || 1}
              category="low"
              lastAssessed="Current"
            />
            <RiskScoreCard
              title="Medium Risk Assessments"
              score={stats.riskDistribution.medium}
              maxScore={stats.totalAssessments || 1}
              category="medium" 
              lastAssessed="Current"
            />
            <RiskScoreCard
              title="High Risk Assessments"
              score={stats.riskDistribution.high}
              maxScore={stats.totalAssessments || 1}
              category="high"
              lastAssessed="Current"
            />
            <RiskScoreCard
              title="Critical Risk Assessments"
              score={stats.riskDistribution.critical}
              maxScore={stats.totalAssessments || 1}
              category="critical"
              lastAssessed="Current"
            />
          </div>
        </div>
      )}

      {/* Recent Assessments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Assessments</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-9 w-64"
                data-testid="input-search-assessments"
              />
            </div>
            <Button variant="outline" size="sm" data-testid="button-filter">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {assessmentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessments Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No assessments match your search." : "Get started by creating your first security assessment."}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Assessment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                id={assessment.id}
                title={assessment.title}
                location={assessment.location}
                status={assessment.status as any}
                assessor={assessment.assessor}
                createdDate={formatDate(assessment.createdAt)}
                lastModified={formatDate(assessment.updatedAt)}
                riskLevel={assessment.riskLevel as any}
                onStart={(id) => setLocation(`/assessments/${id}`)}
                onView={(id) => setLocation(`/assessments/${id}`)}
                onGenerate={(id) => console.log(`Generate report for ${id}`)} // TODO: Implement report generation
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}