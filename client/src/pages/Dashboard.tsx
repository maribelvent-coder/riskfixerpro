import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { AssessmentCard } from "@/components/AssessmentCard";
import { Plus, Search, Filter, TrendingUp, Users, Building2, Clock, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { dashboardApi, assessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Assessment, Site, InsertAssessment } from "@shared/schema";
import { getTierLimits, getUpgradeMessage, type AccountTier } from "@shared/tierLimits";

const createAssessmentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  templateId: z.string().optional(),
  siteId: z.string().optional(),
  location: z.string().optional(),
  assessor: z.string().min(1, "Assessor name is required"),
}).refine((data) => {
  // Require location if siteId is not provided or is "manual"
  if (!data.siteId || data.siteId === "manual") {
    return !!data.location && data.location.length > 0;
  }
  return true;
}, {
  message: "Location is required when no site is selected",
  path: ["location"],
});

type CreateAssessmentFormData = z.infer<typeof createAssessmentFormSchema>;

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

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

  // Fetch all sites for site selection
  const { data: sites = [], isLoading: sitesLoading, isError: sitesError } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  // Fetch assessment templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Check tier limitations
  const tier = (user?.accountTier || "free") as AccountTier;
  const tierLimits = getTierLimits(tier);
  const hasReachedLimit = tierLimits.assessments !== null && assessments.length >= tierLimits.assessments;

  // Form for creating assessments
  const form = useForm<CreateAssessmentFormData>({
    resolver: zodResolver(createAssessmentFormSchema),
    defaultValues: {
      title: "New Security Assessment",
      templateId: "none",
      siteId: "",
      location: "",
      assessor: user?.username || "Current User",
    },
  });

  // Watch siteId to conditionally require location
  const selectedSiteId = form.watch("siteId");

  // Create new assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: (data: CreateAssessmentFormData) => {
      // Prepare assessment payload based on site selection
      let assessmentPayload: Omit<InsertAssessment, "userId">;

      // If a site is selected (not manual), include siteId
      if (data.siteId && data.siteId !== "manual") {
        const selectedSite = sites.find(s => s.id.toString() === data.siteId);
        assessmentPayload = {
          title: data.title,
          assessor: data.assessor,
          status: "draft" as const,
          templateId: data.templateId && data.templateId !== "none" ? data.templateId : undefined,
          siteId: data.siteId,
          location: selectedSite 
            ? `${selectedSite.name} - ${selectedSite.city}, ${selectedSite.state}`
            : "Site Location",
        };
      } else {
        // Manual location entry - no siteId
        assessmentPayload = {
          title: data.title,
          assessor: data.assessor,
          status: "draft" as const,
          templateId: data.templateId && data.templateId !== "none" ? data.templateId : undefined,
          location: data.location || "",
        };
      }

      return assessmentApi.create(assessmentPayload);
    },
    onSuccess: (newAssessment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Assessment Created",
        description: `New assessment "${newAssessment.title}" has been created.`,
      });
      // Navigate to the new assessment
      setLocation(`/app/assessments/${newAssessment.id}`);
    },
    onError: (error: any) => {
      if (error.needsUpgrade) {
        toast({
          title: "Upgrade Required",
          description: error.message || "Free accounts are limited to 1 assessment. Upgrade to create more.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to create assessment: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });

  const handleCreateNew = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (data: CreateAssessmentFormData) => {
    createAssessmentMutation.mutate(data);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" data-testid="heading-dashboard">Physical Security Risk Assessment</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive facility surveys and professional risk analysis following ASIS International standards
          </p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-2">
          <Button 
            onClick={handleCreateNew} 
            disabled={createAssessmentMutation.isPending || hasReachedLimit}
            data-testid="button-create-assessment"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createAssessmentMutation.isPending ? "Creating..." : "New Assessment"}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
            <Button variant="outline" size="sm" data-testid="button-filter" className="flex-shrink-0">
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
                onStart={(id) => setLocation(`/app/assessments/${id}`)}
                onView={(id) => setLocation(`/app/assessments/${id}`)}
                onGenerate={(id) => console.log(`Generate report for ${id}`)} // TODO: Implement report generation
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Assessment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-assessment">
          <DialogHeader>
            <DialogTitle>Create New Assessment</DialogTitle>
            <DialogDescription>
              Create a new physical security risk assessment for a facility or site.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Main Office Security Assessment"
                        {...field}
                        data-testid="input-assessment-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Template (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={templatesLoading}>
                      <FormControl>
                        <SelectTrigger data-testid="select-template">
                          <SelectValue placeholder={
                            templatesLoading 
                              ? "Loading templates..." 
                              : "Select a template (optional)"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No template (blank assessment)</SelectItem>
                        {templates.length > 0 && templates.map((template: any) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Templates pre-load survey questions and set the assessment workflow
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={sitesLoading}>
                      <FormControl>
                        <SelectTrigger data-testid="select-site">
                          <SelectValue placeholder={
                            sitesLoading 
                              ? "Loading sites..." 
                              : sitesError 
                              ? "Error loading sites - enter manually" 
                              : "Select a site or enter manually"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Enter location manually</SelectItem>
                        {sites.length > 0 ? (
                          sites.map((site) => (
                            <SelectItem key={site.id} value={site.id.toString()}>
                              {site.name} - {site.city}, {site.state}
                            </SelectItem>
                          ))
                        ) : !sitesLoading && (
                          <SelectItem value="no-sites" disabled>
                            No sites available - create one first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {selectedSiteId && selectedSiteId !== "manual" 
                        ? "Assessment will be linked to the selected site"
                        : "Select a site or enter location manually below"}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(!selectedSiteId || selectedSiteId === "manual") && (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 123 Main St, New York, NY"
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="assessor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessor</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name"
                        {...field}
                        data-testid="input-assessor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createAssessmentMutation.isError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">
                    Failed to create assessment. Please try again.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    form.reset();
                    createAssessmentMutation.reset();
                  }}
                  disabled={createAssessmentMutation.isPending}
                  data-testid="button-cancel-assessment"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAssessmentMutation.isPending || sitesLoading}
                  data-testid="button-submit-assessment"
                >
                  {createAssessmentMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assessment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}