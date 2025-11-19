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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { assessmentApi } from "@/lib/api";
import { ASSESSMENT_TEMPLATES } from "@shared/templates";
import { insertAssessmentSchema } from "@shared/schema";

console.log("Templates loaded:", ASSESSMENT_TEMPLATES.length, ASSESSMENT_TEMPLATES);

const newAssessmentFormSchema = insertAssessmentSchema
  .omit({ userId: true })
  .extend({
    title: z.string().min(1, "Title is required"),
    location: z.string().optional(),
    templateId: z.string().min(1, "Please select an assessment template"),
  });

type NewAssessmentForm = z.infer<typeof newAssessmentFormSchema>;

export default function NewAssessment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<NewAssessmentForm>({
    resolver: zodResolver(newAssessmentFormSchema),
    defaultValues: {
      title: "",
      location: "",
      assessor: "",
      status: "draft",
      templateId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: NewAssessmentForm) => {
      const selectedTemplate = ASSESSMENT_TEMPLATES.find(t => t.id === data.templateId);
      return assessmentApi.create({
        ...data,
        location: data.location || "",
        templateId: data.templateId,
        surveyParadigm: selectedTemplate?.surveyParadigm || data.surveyParadigm
      });
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-location"
                        placeholder="e.g., San Francisco, CA"
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
                            {template.name}
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
