import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { AssessmentCard } from "@/components/AssessmentCard";
import { Plus, Search, Filter, TrendingUp, Users, Building2, Clock, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Assessment } from "@shared/schema";
import { getTierLimits, getUpgradeMessage, type AccountTier } from "@shared/tierLimits";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [minLoadComplete, setMinLoadComplete] = useState(false);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // 3-second minimum loading time for purposeful UX
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => dashboardApi.getStats(),
  });

  // Fetch all assessments
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments"],
  });

  // Show loading spinner until both data is loaded AND minimum time has passed
  const isInitialLoading = !minLoadComplete || statsLoading || assessmentsLoading;

  // Check tier limitations
  const tier = (user?.accountTier || "free") as AccountTier;
  const tierLimits = getTierLimits(tier);
  const hasReachedLimit = tierLimits.assessments !== null && assessments.length >= tierLimits.assessments;

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

  // Show full-page loading spinner during initial load
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="xl" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="heading-dashboard">Physical Security Risk Assessment</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive facility surveys and professional risk analysis following ASIS International standards
          </p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-2">
          <Button 
            onClick={() => setLocation("/app/assessments/new")} 
            disabled={hasReachedLimit}
            data-testid="button-create-assessment"
            className="w-full sm:w-auto text-xs sm:text-sm min-h-9 sm:min-h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
          {hasReachedLimit && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground" data-testid="message-upgrade-assessment">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{getUpgradeMessage(tier, "assessments")} <a href="/pricing" className="text-primary hover:underline">Upgrade now.</a></span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-2xl font-bold font-mono" data-testid="stat-total-assessments">
              {statsLoading ? "..." : stats?.totalAssessments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total assessments created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-2xl font-bold font-mono" data-testid="stat-active-assessments">
              {statsLoading ? "..." : stats?.activeAssessments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-2xl font-bold font-mono" data-testid="stat-completed-month">
              {statsLoading ? "..." : stats?.completedThisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
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
          <h2 className="text-base sm:text-lg font-semibold mb-4">Risk Distribution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base sm:text-lg font-semibold">Recent Assessments</h2>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-9 w-full sm:w-64"
                data-testid="input-search-assessments"
              />
            </div>
            <Button variant="outline" size="sm" data-testid="button-filter" className="flex-shrink-0 text-xs sm:text-sm min-h-9">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {assessmentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="xl" message="Loading assessments..." />
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
                  <Button onClick={() => setLocation("/app/assessments/new")} className="text-xs sm:text-sm min-h-9 sm:min-h-10">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Assessment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                onStart={(id) => setLocation(`/app/assessments/${id}`)}
                onView={(id) => setLocation(`/app/assessments/${id}`)}
                onGenerate={(id) => console.log(`Generate report for ${id}`)} // TODO: Implement report generation
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}