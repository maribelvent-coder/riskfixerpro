import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Save, 
  Shield, 
  Lock, 
  Eye, 
  Lightbulb, 
  Building, 
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { FacilitySurveyQuestion } from "@shared/schema";
import { EvidenceUploader } from "./EvidenceUploader";

interface FacilitySurveyProps {
  assessmentId: string;
  onComplete?: () => void;
}

interface SurveyQuestion {
  templateId: string; // Stable template ID - primary identifier for UI lookups
  dbId?: string; // Optional database UUID - populated after first save
  category: string;
  subcategory: string;
  question: string;
  standard: string;
  type: "condition" | "measurement" | "yes-no" | "rating";
  response?: any;
  notes?: string;
  evidence?: string[];
  recommendations?: string[];
}

// NOTE: Hardcoded questions removed - now using template questions from database

export function FacilitySurvey({ assessmentId, onComplete }: FacilitySurveyProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isPersisting, setIsPersisting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Map template IDs to database UUIDs - preserves stable lookups while tracking database records
  const templateToDbIdMap = useRef<Map<string, string>>(new Map());

  // Load template questions from database (no hardcoded fallback)
  const { data: savedQuestions, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "facility-survey"],
    queryFn: async () => {
      const response = await fetch(`/api/assessments/${assessmentId}/facility-survey`);
      if (!response.ok) throw new Error('Failed to fetch facility survey');
      return response.json();
    }
  });

  // Load template questions directly from database - no merging needed
  useEffect(() => {
    if (savedQuestions && savedQuestions.length > 0) {
      // Populate the template-to-database ID mapping
      savedQuestions.forEach((sq: any) => {
        const templateId = sq.templateQuestionId;
        if (templateId && sq.id) {
          templateToDbIdMap.current.set(templateId, sq.id);
        }
      });
      
      // Map database questions to template-centric model
      const formattedQuestions: SurveyQuestion[] = savedQuestions.map((sq: any) => ({
        templateId: sq.templateQuestionId,
        dbId: sq.id,
        category: sq.category,
        subcategory: sq.subcategory,
        question: sq.question,
        standard: sq.standard,
        type: sq.type,
        response: sq.response,
        notes: sq.notes,
        evidence: sq.evidence || [],
        recommendations: sq.recommendations || []
      }));
      
      setQuestions(formattedQuestions);
    }
  }, [savedQuestions]);

  // Scroll to top when category changes
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentCategory]);

  const categories = Array.from(new Set(questions.map(q => q.category)));
  const currentCategoryQuestions = questions.filter(q => q.category === categories[currentCategory]);
  
  const completedQuestions = questions.filter(q => 
    q.response !== undefined && q.response !== null && q.response !== ""
  ).length;
  const progress = (completedQuestions / questions.length) * 100;

  // Autosave mutation for individual questions
  const autosaveQuestionMutation = useMutation({
    mutationFn: async ({ question, updateData }: { question: SurveyQuestion; updateData: any }) => {
      // Use templateId for stable identification
      const templateId = question.templateId;
      const dbId = templateToDbIdMap.current.get(templateId);
      
      if (dbId) {
        // Question exists in database - use PATCH to update it
        const response = await fetch(`/api/assessments/${assessmentId}/facility-survey-questions/${dbId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        if (!response.ok) throw new Error('Failed to update question');
        return { savedQuestion: await response.json(), templateId };
      } else {
        // Question doesn't exist yet - use POST to create it
        // Include all current field values to prevent data loss
        const questionData = {
          assessmentId,
          templateQuestionId: templateId,
          category: question.category,
          subcategory: question.subcategory,
          question: question.question,
          standard: question.standard,
          type: question.type,
          response: question.response,
          notes: question.notes || '',
          evidence: question.evidence || [],
          recommendations: question.recommendations || [],
          ...updateData // Apply the latest update on top
        };
        
        const response = await fetch(`/api/assessments/${assessmentId}/facility-survey`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: [questionData] }),
        });
        if (!response.ok) throw new Error('Failed to create question');
        const result = await response.json();
        const savedQuestion = result[0];
        
        return { savedQuestion, templateId, isNew: true };
      }
    },
    onSuccess: (data) => {
      const { savedQuestion, templateId, isNew } = data;
      
      if (isNew && savedQuestion && savedQuestion.id) {
        // Store the new database ID in the mapping
        templateToDbIdMap.current.set(templateId, savedQuestion.id);
        
        // Update local state immediately with the new database ID
        setQuestions(prev => prev.map(q => 
          q.templateId === templateId 
            ? { ...q, dbId: savedQuestion.id }
            : q
        ));
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "facility-survey"] });
    },
    onError: (error) => {
      console.error("Autosave failed:", error);
      // Silent fail for autosave - don't annoy users with error toasts on every keystroke
    },
  });

  // Save facility survey mutation (for manual save/complete actions)
  const saveSurveyMutation = useMutation({
    mutationFn: async (questionsData: any[]) => {
      setIsPersisting(true);
      const response = await fetch(`/api/assessments/${assessmentId}/facility-survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsData }),
      });
      if (!response.ok) throw new Error('Failed to save facility survey');
      return response.json();
    },
    onSuccess: (savedQuestions: any[]) => {
      setIsPersisting(false);
      // Eagerly update local state with new database IDs to prevent race condition
      // This ensures autosave uses correct IDs even if user starts typing immediately
      templateToDbIdMap.current.clear();
      const updatedQuestions: SurveyQuestion[] = savedQuestions.map((sq: any) => {
        const templateId = sq.templateQuestionId;
        if (templateId && sq.id) {
          templateToDbIdMap.current.set(templateId, sq.id);
        }
        return {
          templateId: templateId,
          dbId: sq.id,
          category: sq.category,
          subcategory: sq.subcategory,
          question: sq.question,
          standard: sq.standard,
          type: sq.type,
          response: sq.response,
          notes: sq.notes,
          evidence: sq.evidence || [],
          recommendations: sq.recommendations || []
        };
      });
      setQuestions(updatedQuestions);
      
      toast({
        title: "Survey Saved",
        description: "Your facility survey progress has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "facility-survey"] });
    },
    onError: (error) => {
      setIsPersisting(false);
      toast({
        title: "Save Failed",
        description: `Failed to save survey: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Debounced autosave function
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerAutosave = useCallback((question: SurveyQuestion, updateData: any) => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      autosaveQuestionMutation.mutate({ question, updateData });
    }, 1500); // Autosave after 1.5 seconds of inactivity
  }, [autosaveQuestionMutation]);

  const updateQuestion = (templateId: string, field: string, value: any) => {
    setQuestions(prev => {
      const updated = prev.map(q => 
        q.templateId === templateId ? { ...q, [field]: value } : q
      );
      
      // Find the updated question to trigger autosave
      const updatedQuestion = updated.find(q => q.templateId === templateId);
      if (updatedQuestion) {
        triggerAutosave(updatedQuestion, { [field]: value });
      }
      
      return updated;
    });
  };

  const handleSave = () => {
    const questionsData = questions.map(q => ({
      assessmentId,
      templateQuestionId: q.templateId, // Use the stable templateId field
      category: q.category,
      subcategory: q.subcategory,
      question: q.question,
      standard: q.standard,
      type: q.type,
      response: q.response,
      notes: q.notes,
      evidence: q.evidence || [],
      recommendations: q.recommendations || []
    }));

    saveSurveyMutation.mutate(questionsData);
  };

  const handleComplete = async () => {
    if (progress >= 80) {
      const questionsData = questions.map(q => ({
        assessmentId,
        templateQuestionId: q.templateId,
        category: q.category,
        subcategory: q.subcategory,
        question: q.question,
        standard: q.standard,
        type: q.type,
        response: q.response,
        notes: q.notes,
        evidence: q.evidence || [],
        recommendations: q.recommendations || []
      }));

      try {
        // Wait for save to complete before advancing workflow
        await saveSurveyMutation.mutateAsync(questionsData);
        onComplete?.();
        toast({
          title: "Facility Survey Complete",
          description: "Ready to proceed to ASIS Risk Assessment phase.",
        });
      } catch (error) {
        // Error toast already shown by mutation's onError handler
        console.error("Failed to complete survey:", error);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "barriers": return Building;
      case "lighting": return Lightbulb;
      case "surveillance": return Eye;
      case "access-control": return Lock;
      case "intrusion-detection": return Shield;
      default: return Info;
    }
  };

  const renderQuestionInput = (question: SurveyQuestion) => {
    switch (question.type) {
      case "measurement":
        return (
          <div className="space-y-2.5 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor={`${question.templateId}-value`} className="text-xs sm:text-sm">Measurement Value</Label>
              <Input
                id={`${question.templateId}-value`}
                type="number"
                step="0.1"
                value={question.response?.value || ""}
                onChange={(e) => updateQuestion(question.templateId, "response", { 
                  ...question.response, 
                  value: e.target.value,
                  unit: question.response?.unit || "fc" 
                })}
                placeholder="Enter measurement"
                className="text-xs sm:text-sm"
                data-testid={`input-${question.templateId}-value`}
              />
              <Input
                placeholder="Unit (fc, Px/ft, feet, etc.)"
                value={question.response?.unit || ""}
                onChange={(e) => updateQuestion(question.templateId, "response", { 
                  ...question.response, 
                  unit: e.target.value 
                })}
                className="text-xs sm:text-sm"
                data-testid={`input-${question.templateId}-unit`}
              />
            </div>
            
            {/* Add Assessment Response for measurement questions, especially lighting */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor={`${question.templateId}-assessment`} className="text-xs sm:text-sm">Assessment Response</Label>
              <Select 
                value={question.response?.assessment || ""} 
                onValueChange={(value) => updateQuestion(question.templateId, "response", { 
                  ...question.response, 
                  assessment: value 
                })}
              >
                <SelectTrigger data-testid={`select-${question.templateId}-assessment`} className="text-xs sm:text-sm">
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  {/* Add N/A option for system-related measurement questions */}
                  {(question.category === "surveillance" || 
                    question.category === "access-control" ||
                    question.category === "lighting" ||
                    question.category === "barriers" ||
                    question.category === "intrusion-detection" ||
                    question.subcategory === "visitor-management") && (
                    <SelectItem value="n/a">N/A - No system in place or not applicable</SelectItem>
                  )}
                  <SelectItem value="excellent">Excellent - Exceeds all standards</SelectItem>
                  <SelectItem value="good">Good - Meets standards well</SelectItem>
                  <SelectItem value="adequate">Adequate - Meets minimum standards</SelectItem>
                  <SelectItem value="poor">Poor - Below standards</SelectItem>
                  <SelectItem value="critical">Critical - Immediate attention required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "condition":
        return (
          <Select 
            value={question.response || ""} 
            onValueChange={(value) => updateQuestion(question.templateId, "response", value)}
          >
            <SelectTrigger data-testid={`select-${question.templateId}`} className="text-xs sm:text-sm">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {/* Add N/A option for all system-related questions */}
              {(question.category === "surveillance" || 
                question.category === "access-control" ||
                question.category === "lighting" ||
                question.category === "barriers" ||
                question.category === "intrusion-detection" ||
                question.subcategory === "visitor-management") && (
                <SelectItem value="n/a">N/A - No system in place or not applicable</SelectItem>
              )}
              <SelectItem value="excellent">Excellent - Exceeds all standards</SelectItem>
              <SelectItem value="good">Good - Meets standards well</SelectItem>
              <SelectItem value="adequate">Adequate - Meets minimum standards</SelectItem>
              <SelectItem value="poor">Poor - Below standards</SelectItem>
              <SelectItem value="critical">Critical - Immediate attention required</SelectItem>
            </SelectContent>
          </Select>
        );

      case "yes-no":
        return (
          <Select 
            value={question.response || ""} 
            onValueChange={(value) => updateQuestion(question.templateId, "response", value)}
          >
            <SelectTrigger data-testid={`select-${question.templateId}`} className="text-xs sm:text-sm">
              <SelectValue placeholder="Select response" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes - Compliant</SelectItem>
              <SelectItem value="no">No - Non-compliant</SelectItem>
              <SelectItem value="partial">Partial - Partially compliant</SelectItem>
              <SelectItem value="na">N/A - Not applicable</SelectItem>
            </SelectContent>
          </Select>
        );

      case "rating":
        return (
          <Select 
            value={question.response || ""} 
            onValueChange={(value) => updateQuestion(question.templateId, "response", value)}
          >
            <SelectTrigger data-testid={`select-${question.templateId}`} className="text-xs sm:text-sm">
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Poor</SelectItem>
              <SelectItem value="2">2 - Fair</SelectItem>
              <SelectItem value="3">3 - Satisfactory</SelectItem>
              <SelectItem value="4">4 - Good</SelectItem>
              <SelectItem value="5">5 - Excellent</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  // Show loading state while template questions are being fetched
  if (questionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading survey questions from template...</p>
        </div>
      </div>
    );
  }

  // Show message if no questions are available (shouldn't happen with proper templates)
  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No survey questions available.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This assessment may not have been created from a template with questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Facility Physical Security Survey</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Comprehensive assessment of existing physical security controls and systems
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
              Phase 1 of 2
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                <span>Survey Progress</span>
                <span className="text-[11px] sm:text-sm">{completedQuestions} of {questions.length} completed</span>
              </div>
              <Progress value={progress} className="w-full" data-testid="progress-survey" />
            </div>
            
            {/* Category Navigation */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {categories.map((category, index) => {
                const Icon = getCategoryIcon(category);
                const categoryQuestions = questions.filter(q => q.category === category);
                const categoryCompleted = categoryQuestions.filter(q => q.response !== undefined).length;
                const isComplete = categoryCompleted === categoryQuestions.length;
                
                return (
                  <Button
                    key={category}
                    variant={currentCategory === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentCategory(index)}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 min-h-8 sm:min-h-9"
                    data-testid={`nav-category-${category}`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden xs:inline sm:inline">{category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                    {isComplete && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Category Questions */}
      <div ref={contentRef} className="space-y-2 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
            {(() => {
              const Icon = getCategoryIcon(categories[currentCategory]);
              return <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />;
            })()}
            <span className="text-xs sm:text-base">{categories[currentCategory]?.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Skip this category - mark all questions with notes
              const categoryQuestions = questions.filter(q => q.category === categories[currentCategory]);
              categoryQuestions.forEach(q => {
                if (!q.notes) {
                  updateQuestion(q.templateId, "notes", "[Section Skipped]");
                }
              });
              // Move to next category or complete
              if (currentCategory < categories.length - 1) {
                setCurrentCategory(prev => prev + 1);
              } else {
                handleComplete();
              }
            }}
            className="text-xs sm:text-sm min-h-8 sm:min-h-9"
            data-testid={`button-skip-category-${categories[currentCategory]}`}
          >
            <span className="hidden xs:inline">Skip Section</span>
            <span className="xs:hidden">Skip</span>
          </Button>
        </div>

        {currentCategoryQuestions.map((question) => (
          <Card key={question.templateId}>
            <CardHeader className="p-2.5 sm:p-4 pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm sm:text-base leading-tight">{question.question}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">{question.subcategory}</Badge>
                </div>
                {question.response && (
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 sm:mt-1 shrink-0" />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4 space-y-2.5 sm:space-y-4">
              {/* Standard Reference */}
              <div className="bg-muted/50 p-2 sm:p-3 rounded-md">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Professional Standard:</p>
                <p className="text-xs sm:text-sm">{question.standard}</p>
              </div>

              {/* Response Input */}
              <div>
                <Label className="text-xs sm:text-sm font-medium">Assessment Response</Label>
                {renderQuestionInput(question)}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor={`${question.templateId}-notes`} className="text-xs sm:text-sm">Observations & Notes</Label>
                <Textarea
                  id={`${question.templateId}-notes`}
                  value={question.notes || ""}
                  onChange={(e) => updateQuestion(question.templateId, "notes", e.target.value)}
                  placeholder="Document specific observations, conditions, or concerns..."
                  rows={2}
                  className="text-xs sm:text-sm"
                  data-testid={`textarea-${question.templateId}-notes`}
                />
              </div>

              {/* Photo Evidence */}
              <div>
                <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Photo Evidence</Label>
                <EvidenceUploader
                  assessmentId={assessmentId}
                  questionId={question.dbId || ""}
                  questionType="facility"
                  evidence={question.evidence || []}
                  onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "facility-survey"] })}
                />
              </div>
              
              {/* Recommendations Badge */}
              {question.response && ["poor", "critical", "no"].includes(question.response) && (
                <Badge variant="destructive" className="text-[10px] sm:text-xs">
                  <AlertTriangle className="h-3 w-3 mr-0.5 sm:mr-1" />
                  Requires Attention
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-3 sm:pt-4">
        <Button 
          variant="outline"
          onClick={handleSave}
          disabled={isPersisting}
          className="text-sm min-h-11 w-full sm:w-auto"
          data-testid="button-save-survey"
        >
          <Save className="h-4 w-4 mr-2" />
          {isPersisting ? "Saving..." : "Save Progress"}
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {currentCategory > 0 && (
            <Button 
              variant="outline"
              onClick={() => setCurrentCategory(prev => prev - 1)}
              className="text-sm min-h-11 w-full sm:w-auto"
              data-testid="button-previous-category"
            >
              Previous Category
            </Button>
          )}
          
          {currentCategory < categories.length - 1 ? (
            <Button 
              onClick={() => setCurrentCategory(prev => prev + 1)}
              className="text-sm min-h-11 w-full sm:w-auto"
              data-testid="button-next-category"
            >
              Next Category
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={isPersisting}
              className="text-sm min-h-11 w-full sm:w-auto"
              data-testid="button-complete-survey"
            >
              Complete Survey & Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}