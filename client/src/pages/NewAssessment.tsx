import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { assessmentApi } from "@/lib/api";
import { ASSESSMENT_TEMPLATES } from "@shared/templates";
import { insertAssessmentSchema, type Site } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

const newAssessmentFormSchema = insertAssessmentSchema
  .omit({ userId: true })
  .extend({
    siteId: z.string().optional(),
    location: z.string().optional(),
  })
  .refine((data) => {
    // Require location if siteId is not provided or is "manual"
    if (!data.siteId || data.siteId === "manual") {
      return !!data.location && data.location.length > 0;
    }
    return true;
  }, {
    message: "Location is required when no site is selected",
    path: ["location"],
  });

type NewAssessmentForm = z.infer<typeof newAssessmentFormSchema>;

export default function NewAssessment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch all sites for site selection
  const { data: sites = [], isLoading: sitesLoading, isError: sitesError } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });
  
  const form = useForm<NewAssessmentForm>({
    resolver: zodResolver(newAssessmentFormSchema),
    defaultValues: {
      title: "",
      location: "",
      assessor: user?.username || "",
      status: "draft",
      siteId: "",
      templateId: "",
      surveyParadigm: "facility",
    },
  });

  // Watch siteId to conditionally show location field
  const selectedSiteId = form.watch("siteId");

  const createMutation = useMutation({
    mutationFn: async (data: NewAssessmentForm) => {
      const selectedTemplate = ASSESSMENT_TEMPLATES.find(t => t.id === data.templateId);
      
      // Prepare assessment payload based on site selection
      let assessmentPayload: any;
      
      // If a site is selected (not manual), include siteId
      if (data.siteId && data.siteId !== "manual") {
        const selectedSite = sites.find(s => s.id.toString() === data.siteId);
        assessmentPayload = {
          title: data.title,
          assessor: data.assessor,
          status: "draft" as const,
          templateId: data.templateId,
          siteId: data.siteId,
          location: selectedSite 
            ? `${selectedSite.name} - ${selectedSite.city}, ${selectedSite.state}`
            : "Site Location",
          surveyParadigm: selectedTemplate?.surveyParadigm || "facility"
        };
      } else {
        // Manual location entry - no siteId
        assessmentPayload = {
          title: data.title,
          assessor: data.assessor,
          status: "draft" as const,
          templateId: data.templateId,
          location: data.location || "",
          surveyParadigm: selectedTemplate?.surveyParadigm || "facility"
        };
      }
      
      return assessmentApi.create(assessmentPayload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "Assessment Created",
        description: "Your new assessment has been created successfully",
      });
      setLocation(`/app/assessments/${data.id}`);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create assessment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: NewAssessmentForm) => {
    createMutation.mutate(data);
  };

  const watchedTemplateId = form.watch("templateId");
  const selectedTemplate = watchedTemplateId 
    ? ASSESSMENT_TEMPLATES.find(t => t.id === watchedTemplateId)
    : undefined;

  return (
    <div className="space-y-6" data-testid="page-new-assessment">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/app/assessments")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-create-assessment">Create New Assessment</h1>
          <p className="text-muted-foreground mt-1">
            Start a new security risk assessment
          </p>
        </div>
      </div>

      <Card data-testid="card-assessment-form">
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>
            Enter the basic information for your security assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Title *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-title"
                        placeholder="e.g., Headquarters Security Assessment"
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
                    <FormLabel>Assessment Template *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-template">
                          <SelectValue placeholder="Select an assessment template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASSESSMENT_TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.id} data-testid={`template-option-${template.id}`}>
                            <div className="flex flex-col">
                              <span className="font-medium">{template.name}</span>
                              <span className="text-xs text-muted-foreground">{template.category} • {template.surveyParadigm === 'facility' ? 'Facility Survey' : 'Executive Interview'}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate && (
                      <FormDescription data-testid="template-description">
                        {selectedTemplate.description}
                      </FormDescription>
                    )}
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
                    <FormDescription>
                      {selectedSiteId && selectedSiteId !== "manual" 
                        ? "Assessment will be linked to the selected site"
                        : "Select a site or enter location manually below"}
                    </FormDescription>
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
                          {...field}
                          data-testid="input-location"
                          placeholder="e.g., 123 Main St, New York, NY"
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
                        {...field}
                        data-testid="input-assessor"
                        placeholder="Your name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/app/assessments")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-create"
                >
                  {createMutation.isPending ? "Creating..." : "Create Assessment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
