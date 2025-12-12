import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Shield, Eye, Activity, Smartphone, Save, AlertTriangle, CheckCircle, Info, Briefcase, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface TemplateQuestion {
  id: string;
  questionId: string;
  category: string;
  question: string;
  type: string;
  options: string[];
}

interface PrincipalProfileFormProps {
  assessmentId: string;
  onComplete?: () => void;
}

// Category icons and descriptions for security professionals
const CATEGORY_CONFIG: Record<string, { icon: typeof User; color: string; description: string }> = {
  "Executive Profile & Threat Perception": {
    icon: User,
    color: "text-blue-500",
    description: "Assess the principal's public profile, industry exposure, and current threat landscape based on your research and observations."
  },
  "Daily Routines & Pattern Predictability": {
    icon: Activity,
    color: "text-amber-500",
    description: "Evaluate the predictability of the principal's daily patterns. High predictability increases vulnerability to surveillance and targeting."
  },
  "Digital Footprint & Privacy": {
    icon: Smartphone,
    color: "text-purple-500",
    description: "Assess the principal's digital exposure including social media presence, public records, and online information availability."
  },
  "Residence Security": {
    icon: Shield,
    color: "text-green-500",
    description: "Evaluate the current security posture of the principal's primary residence based on site assessment."
  }
};

export default function PrincipalProfileForm({ assessmentId, onComplete }: PrincipalProfileFormProps) {
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch EP template questions
  const { data: questions, isLoading: loadingQuestions } = useQuery<TemplateQuestion[]>({
    queryKey: ["/api/template-questions", "executive_protection", "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/template-questions/executive_protection?prefix=ep_`);
      if (!res.ok) throw new Error("Failed to load questions");
      return res.json();
    }
  });

  // Fetch existing responses from EP profile endpoint
  const { data: existingResponses, isLoading: loadingResponses } = useQuery<Record<string, any>>({
    queryKey: ["/api/assessments", assessmentId, "ep-profile"],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/${assessmentId}/ep-profile`);
      if (!res.ok) throw new Error("Failed to load responses");
      return res.json();
    }
  });

  // Initialize responses from existing data
  useEffect(() => {
    if (existingResponses && Object.keys(existingResponses).length > 0) {
      setResponses(existingResponses);
    }
  }, [existingResponses]);

  // Save profile mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest("PUT", `/api/assessments/${assessmentId}/ep-profile`, { profile: data });
    },
    onSuccess: () => {
      toast({
        title: "Profile Saved",
        description: "Principal profile data has been saved successfully."
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "ep-profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "ep-dashboard"] });
      onComplete?.();
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save profile data. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSingleSelect = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    setHasChanges(true);
  };

  const handleMultiSelect = (questionId: string, option: string, checked: boolean) => {
    setResponses(prev => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] as string[] : [];
      const updated = checked
        ? [...current, option]
        : current.filter(o => o !== option);
      return { ...prev, [questionId]: updated };
    });
    setHasChanges(true);
  };

  const handleTextInput = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(responses);
  };

  // Group questions by category
  const questionsByCategory = questions?.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, TemplateQuestion[]>) || {};

  // Calculate completion stats
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => {
    const answer = responses[q.questionId];
    return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim() !== "");
  }).length || 0;
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  if (loadingQuestions || loadingResponses) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Principal Exposure Profile
              </CardTitle>
              <CardDescription className="text-sm">
                Security professional assessment of the principal's risk exposure factors. 
                Complete this based on your research, observations, and site assessments - not by asking the principal directly.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="text-2xl font-bold">{completionPercentage}%</div>
                <div className="text-xs text-muted-foreground">{answeredQuestions}/{totalQuestions} fields</div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !hasChanges}
                data-testid="button-save-profile"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>For Security Professionals:</strong> This profile drives the T×V×I×E risk calculation. 
          Assess each factor based on OSINT research, site visits, and professional judgment. 
          Higher exposure levels increase the Exposure (E) multiplier in risk scoring.
        </AlertDescription>
      </Alert>

      {/* Principal Information Section */}
      <Card data-testid="card-principal-information">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Principal Information
              </CardTitle>
              <CardDescription className="text-sm">
                Basic identification information for the principal being assessed. This will appear in the final report.
              </CardDescription>
            </div>
            <Badge variant={
              (responses['ep_principal_name'] && responses['ep_principal_company'] && responses['ep_principal_title']) 
                ? "default" : "secondary"
            }>
              {[responses['ep_principal_name'], responses['ep_principal_company'], responses['ep_principal_title']].filter(Boolean).length}/3
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {responses['ep_principal_name'] ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
                <Label htmlFor="ep_principal_name" className="text-sm font-medium">
                  Principal Name
                </Label>
              </div>
              <Input
                id="ep_principal_name"
                placeholder="e.g., John Smith"
                value={(responses['ep_principal_name'] as string) || ''}
                onChange={(e) => handleTextInput('ep_principal_name', e.target.value)}
                data-testid="input-principal-name"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {responses['ep_principal_company'] ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
                <Label htmlFor="ep_principal_company" className="text-sm font-medium">
                  Company / Organization
                </Label>
              </div>
              <Input
                id="ep_principal_company"
                placeholder="e.g., Acme Corporation"
                value={(responses['ep_principal_company'] as string) || ''}
                onChange={(e) => handleTextInput('ep_principal_company', e.target.value)}
                data-testid="input-principal-company"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {responses['ep_principal_title'] ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
                <Label htmlFor="ep_principal_title" className="text-sm font-medium">
                  Position / Title
                </Label>
              </div>
              <Input
                id="ep_principal_title"
                placeholder="e.g., Chief Executive Officer"
                value={(responses['ep_principal_title'] as string) || ''}
                onChange={(e) => handleTextInput('ep_principal_title', e.target.value)}
                data-testid="input-principal-title"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Categories */}
      {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => {
        const config = CATEGORY_CONFIG[category] || { icon: Shield, color: "text-primary", description: "" };
        const CategoryIcon = config.icon;
        const categoryAnswered = categoryQuestions.filter(q => {
          const answer = responses[q.questionId];
          return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim() !== "");
        }).length;

        return (
          <Card key={category} data-testid={`card-category-${category.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CategoryIcon className={`h-5 w-5 ${config.color}`} />
                    {category}
                  </CardTitle>
                  {config.description && (
                    <CardDescription className="text-sm">{config.description}</CardDescription>
                  )}
                </div>
                <Badge variant={categoryAnswered === categoryQuestions.length ? "default" : "secondary"}>
                  {categoryAnswered}/{categoryQuestions.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {categoryQuestions.map((question) => {
                const currentValue = responses[question.questionId];
                const hasAnswer = currentValue && (Array.isArray(currentValue) ? currentValue.length > 0 : currentValue.trim() !== "");

                return (
                  <div key={question.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      {hasAnswer ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      )}
                      <Label className="text-sm font-medium leading-tight">
                        {question.question}
                      </Label>
                    </div>

                    {question.type === "single_select" && (
                      <Select
                        value={currentValue as string || ""}
                        onValueChange={(value) => handleSingleSelect(question.questionId, value)}
                        data-testid={`select-${question.questionId}`}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options?.map((option, i) => (
                            <SelectItem key={i} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {question.type === "multi_select" && (
                      <div className="grid gap-2 pl-6">
                        {question.options?.map((option, i) => {
                          const isChecked = Array.isArray(currentValue) && currentValue.includes(option);
                          return (
                            <div key={i} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${question.questionId}-${i}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => 
                                  handleMultiSelect(question.questionId, option, checked as boolean)
                                }
                                data-testid={`checkbox-${question.questionId}-${i}`}
                              />
                              <Label
                                htmlFor={`${question.questionId}-${i}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {option}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Bottom Save Button */}
      {totalQuestions > 0 && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saveMutation.isPending || !hasChanges}
            data-testid="button-save-profile-bottom"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Principal Profile"}
          </Button>
        </div>
      )}
    </div>
  );
}
