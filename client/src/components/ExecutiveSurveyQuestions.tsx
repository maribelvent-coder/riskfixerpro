import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  Save, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Info,
  Camera,
  FileDown,
  ArrowRight,
  Home
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { FacilitySurveyQuestion, AssessmentQuestion, AssessmentWithQuestions } from "@shared/schema";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateSurveyFindingsPDF } from "@/lib/surveyFindingsPDF";
import { EvidenceUploader } from "./EvidenceUploader";

// Executive Protection Part 1 - Executive Interview (43 questions, 8 sections)
export const EP_PART1_CATEGORIES = [
  'Executive Profile & Threat Perception',
  'Residence Security',
  'Daily Routines & Pattern Predictability',
  'Workplace Security',
  'Travel & Transportation',
  'Digital Footprint & Privacy',
  'Family Security',
  'Emergency Preparedness',
];

// Executive Protection Part 2 - Residential Security Assessment (75 questions, 12 sections)
export const EP_PART2_CATEGORIES = [
  'Residential Security - Property Profile',
  'Residential Security - Perimeter',
  'Residential Security - Lighting',
  'Residential Security - Landscaping',
  'Residential Security - Doors',
  'Residential Security - Windows',
  'Residential Security - Vehicles',
  'Residential Security - Alarms',
  'Residential Security - Surveillance',
  'Residential Security - Interior',
  'Residential Security - Safe Room',
  'Residential Security - Monitoring',
];

interface ExecutiveSurveyQuestionsProps {
  assessmentId: string;
  sectionCategory?: string; // Optional filter by single category
  sectionCategories?: string[]; // Optional filter by multiple categories (for Part filtering)
  onComplete?: () => void;
}

type SurveyQuestion = FacilitySurveyQuestion | AssessmentQuestion;

// Map importance to badge variant
const getImportanceBadge = (importance: string | null) => {
  if (!importance) return null;
  
  const variants: { [key: string]: "default" | "destructive" | "secondary" } = {
    'Critical': 'destructive',
    'High': 'default',
    'Medium': 'secondary',
    'Low': 'secondary'
  };
  
  return (
    <Badge variant={variants[importance] || 'secondary'} className="text-xs">
      {importance}
    </Badge>
  );
};

export default function ExecutiveSurveyQuestions({ assessmentId, sectionCategory, sectionCategories, onComplete }: ExecutiveSurveyQuestionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Local state for optimistic updates - show changes instantly while backend processes
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, Partial<SurveyQuestion>>>(new Map());

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await generateSurveyFindingsPDF(assessmentId);
      toast({
        title: "PDF Generated",
        description: "Survey findings have been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch assessment to determine paradigm
  const { data: assessment } = useQuery<AssessmentWithQuestions>({
    queryKey: ['/api/assessments', assessmentId],
  });

  const paradigm = assessment?.surveyParadigm || 'facility';

  // Fetch questions based on paradigm
  const { data: questions, isLoading } = useQuery<SurveyQuestion[]>({
    queryKey: paradigm === 'executive' 
      ? ['/api/assessments', assessmentId, 'assessment-questions']
      : ['/api/assessments', assessmentId, 'facility-survey-questions'],
    enabled: !!assessment,
  });

  // Filter by section category/categories if provided
  const filteredQuestions = questions?.filter(q => {
    // If sectionCategories array is provided, filter by it
    if (sectionCategories && sectionCategories.length > 0) {
      return sectionCategories.includes(q.category || '');
    }
    // If single sectionCategory is provided, filter by it
    if (sectionCategory) {
      return q.category === sectionCategory;
    }
    // No filter - return all questions
    return true;
  }) || [];

  // Group questions by category and subcategory
  const groupedQuestions = filteredQuestions.reduce((acc, question) => {
    const category = question.category || 'Uncategorized';
    const subcategory = question.subcategory || 'General';
    
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][subcategory]) {
      acc[category][subcategory] = [];
    }
    acc[category][subcategory].push(question);
    
    return acc;
  }, {} as Record<string, Record<string, SurveyQuestion[]>>);

  // Create a stable key for detecting section changes
  const sectionKey = sectionCategory || (sectionCategories?.join(',') || '');

  // Compute the first group's composite key for dependency tracking
  const firstGroupKey = useMemo(() => {
    if (Object.keys(groupedQuestions).length === 0) return null;
    const firstCategory = Object.keys(groupedQuestions)[0];
    const firstSubcategory = Object.keys(groupedQuestions[firstCategory])[0];
    return firstSubcategory ? `${firstCategory}:${firstSubcategory}` : null;
  }, [groupedQuestions]);

  // Auto-expand the first subcategory when section changes or questions load
  useEffect(() => {
    // Set the first group as expanded when data is available
    if (firstGroupKey) {
      setExpandedCategories([firstGroupKey]);
    } else {
      setExpandedCategories([]);
    }
  }, [sectionKey, assessmentId, firstGroupKey]); // Include firstGroupKey so it runs when data loads

  // Calculate progress
  const totalQuestions = filteredQuestions.length;
  const answeredQuestions = filteredQuestions.filter(q => q.response || q.notes).length;
  const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Determine endpoint based on paradigm
  const questionEndpoint = paradigm === 'executive' 
    ? `/api/assessments/${assessmentId}/assessment-questions`
    : `/api/assessments/${assessmentId}/facility-survey-questions`;

  const questionQueryKey = paradigm === 'executive'
    ? ['/api/assessments', assessmentId, 'assessment-questions']
    : ['/api/assessments', assessmentId, 'facility-survey-questions'];

  // Update question mutation with optimistic updates for instant UI feedback
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: Partial<SurveyQuestion> }) => {
      // Only send allowed fields to match backend validation
      const allowedFields = {
        ...(data.response !== undefined && { response: data.response }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.evidence !== undefined && { evidence: data.evidence }),
      };
      
      const response = await fetch(`${questionEndpoint}/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(allowedFields),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update question');
      }
      
      return response.json();
    },
    onMutate: async ({ questionId, data }) => {
      // Optimistically update local state immediately for snappy UI
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        const existing = next.get(questionId) || {};
        next.set(questionId, { ...existing, ...data });
        return next;
      });
    },
    onSuccess: (_, { questionId }) => {
      // Silently sync - no toast needed for routine saves
      // Clear optimistic update for this question since server confirmed
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(questionId);
        return next;
      });
      // Background refresh to sync with server
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
    },
    onError: (_, { questionId }) => {
      // Rollback optimistic update on error
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(questionId);
        return next;
      });
      toast({
        title: "Error",
        description: "Failed to save response. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Render input based on question type
  const renderInput = (question: SurveyQuestion) => {
    // Get optimistic value if pending, otherwise use server value
    const optimistic = optimisticUpdates.get(question.id);
    const effectiveResponse = optimistic?.response !== undefined ? optimistic.response : question.response;
    const effectiveNotes = optimistic?.notes !== undefined ? optimistic.notes : question.notes;
    
    const handleSave = (field: string, value: any) => {
      updateQuestionMutation.mutate({
        questionId: question.id,
        data: { [field]: value }
      });
    };

    // Get options from the question (enriched from template_questions)
    const options = (question as any).options as string[] | undefined;
    
    switch (question.type) {
      case 'single_select':
        if (options && options.length > 0) {
          return (
            <div className="space-y-2">
              <RadioGroup
                value={effectiveResponse as string || ''}
                onValueChange={(value) => handleSave('response', value)}
              >
                <div className="flex flex-col gap-2">
                  {options.map((option, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <RadioGroupItem 
                        value={option} 
                        id={`${question.id}-opt-${idx}`} 
                        data-testid={`radio-option-${idx}-${question.id}`}
                        className="mt-1"
                      />
                      <Label htmlFor={`${question.id}-opt-${idx}`} className="cursor-pointer text-sm leading-relaxed">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          );
        }
        // Fallback to text if no options
        return (
          <Textarea
            placeholder="Enter your response..."
            value={effectiveResponse as string || ''}
            onChange={(e) => {
              const value = e.target.value;
              setTimeout(() => handleSave('response', value), 500);
            }}
            className="min-h-[80px]"
            data-testid={`textarea-response-${question.id}`}
          />
        );
      
      case 'multi_select':
        if (options && options.length > 0) {
          const selectedValues = Array.isArray(effectiveResponse) 
            ? effectiveResponse 
            : (effectiveResponse ? [effectiveResponse] : []);
          
          return (
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                {options.map((option, idx) => {
                  const isChecked = selectedValues.includes(option);
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id={`${question.id}-opt-${idx}`}
                        checked={isChecked}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...selectedValues, option]
                            : selectedValues.filter((v: string) => v !== option);
                          handleSave('response', newValues);
                        }}
                        className="mt-1 h-4 w-4 rounded border-border"
                        data-testid={`checkbox-option-${idx}-${question.id}`}
                      />
                      <Label htmlFor={`${question.id}-opt-${idx}`} className="cursor-pointer text-sm leading-relaxed">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">Select all that apply</p>
            </div>
          );
        }
        return (
          <Textarea
            placeholder="Enter your response..."
            value={effectiveResponse as string || ''}
            onChange={(e) => {
              const value = e.target.value;
              setTimeout(() => handleSave('response', value), 500);
            }}
            className="min-h-[80px]"
            data-testid={`textarea-response-${question.id}`}
          />
        );

      case 'yes_no':
      case 'yes-no':
        return (
          <div className="space-y-2">
            <RadioGroup
              value={effectiveResponse as string || ''}
              onValueChange={(value) => handleSave('response', value)}
            >
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id={`${question.id}-yes`} data-testid={`radio-yes-${question.id}`} />
                  <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id={`${question.id}-no`} data-testid={`radio-no-${question.id}`} />
                  <Label htmlFor={`${question.id}-no`} className="cursor-pointer">No</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="n/a" id={`${question.id}-na`} data-testid={`radio-na-${question.id}`} />
                  <Label htmlFor={`${question.id}-na`} className="cursor-pointer">N/A</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );
      
      case 'rating':
        return (
          <div className="space-y-2">
            <RadioGroup
              value={effectiveResponse as string || ''}
              onValueChange={(value) => handleSave('response', value)}
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center gap-1">
                    <RadioGroupItem value={String(rating)} id={`${question.id}-${rating}`} data-testid={`radio-rating-${rating}-${question.id}`} />
                    <Label htmlFor={`${question.id}-${rating}`} className="cursor-pointer">{rating}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">1 = Poor, 5 = Excellent</p>
          </div>
        );
      
      case 'text':
      default:
        return (
          <Textarea
            placeholder="Enter your response..."
            value={effectiveResponse as string || ''}
            onChange={(e) => {
              // Auto-save after typing stops
              const value = e.target.value;
              setTimeout(() => handleSave('response', value), 500);
            }}
            className="min-h-[80px]"
            data-testid={`textarea-response-${question.id}`}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No questions found for this section.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-base">Assessment Progress</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={isExporting || answeredQuestions === 0}
                  data-testid="button-export-survey-pdf"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {isExporting ? "Generating..." : "Export Findings (PDF)"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {answeredQuestions} of {totalQuestions} questions completed
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progressPercent} className="flex-1" />
                <Badge variant="outline" className="text-sm">
                  {Math.round(progressPercent)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questions by Category */}
      {Object.entries(groupedQuestions).map(([category, subcategories]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {category}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Mark all questions in this category as skipped and collapse
                  const categoryQuestions = filteredQuestions.filter(q => q.category === category);
                  categoryQuestions.forEach(q => {
                    updateQuestionMutation.mutate({
                      questionId: q.id,
                      data: { notes: q.notes || '[Section Skipped]' }
                    });
                  });
                  // Collapse all subcategories in this category
                  setExpandedCategories(prev => prev.filter(c => !c.startsWith(`${category}:`)));
                }}
                data-testid={`button-skip-category-${category}`}
              >
                Skip Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion 
              type="multiple" 
              className="w-full"
              value={expandedCategories}
              onValueChange={setExpandedCategories}
            >
              {Object.entries(subcategories).map(([subcategory, questions]) => {
                const compositeKey = `${category}:${subcategory}`;
                return (
                <AccordionItem key={compositeKey} value={compositeKey}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{subcategory}</span>
                      <Badge variant="secondary" className="text-xs">
                        {questions.length} questions
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      {questions.map((question, index) => (
                        <div key={question.id} className="border-l-2 border-primary/20 pl-4 space-y-3">
                          {/* Question Header */}
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm" data-testid={`question-text-${question.id}`}>
                                  {question.question}
                                </h4>
                                {question.importance && getImportanceBadge(question.importance)}
                              </div>
                            </div>
                          </div>

                          {/* Best Practice */}
                          {question.bestPractice && (
                            <div className="bg-muted/50 rounded p-3 text-sm">
                              <p className="font-medium text-xs text-muted-foreground mb-1">Best Practice:</p>
                              <p className="text-sm">{question.bestPractice}</p>
                            </div>
                          )}

                          {/* Rationale */}
                          {question.rationale && (
                            <div className="bg-muted/30 rounded p-3 text-sm">
                              <p className="font-medium text-xs text-muted-foreground mb-1">Risk Mitigated:</p>
                              <p className="text-sm">{question.rationale}</p>
                            </div>
                          )}

                          {/* Response Input */}
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Response</Label>
                            {renderInput(question)}
                          </div>

                          {/* Notes */}
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Additional Notes</Label>
                            <Textarea
                              placeholder="Add notes, observations, or recommendations..."
                              value={(optimisticUpdates.get(question.id)?.notes !== undefined 
                                ? optimisticUpdates.get(question.id)?.notes 
                                : question.notes) || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Optimistically update immediately
                                setOptimisticUpdates(prev => {
                                  const next = new Map(prev);
                                  const existing = next.get(question.id) || {};
                                  next.set(question.id, { ...existing, notes: value });
                                  return next;
                                });
                                // Then save to backend
                                setTimeout(() => {
                                  updateQuestionMutation.mutate({
                                    questionId: question.id,
                                    data: { notes: value }
                                  });
                                }, 500);
                              }}
                              className="min-h-[60px]"
                              data-testid={`textarea-notes-${question.id}`}
                            />
                          </div>

                          {/* Photo Evidence */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Photo Evidence</Label>
                            <EvidenceUploader
                              assessmentId={assessmentId}
                              questionId={question.id}
                              questionType="facility"
                              evidence={question.evidence || []}
                              onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "facility-survey"] })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
              })}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons - Always visible */}
      <Card className={progressPercent === 100 ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : ""}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {progressPercent === 100 ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Section Complete</h4>
                    <p className="text-sm text-muted-foreground">All questions have been answered</p>
                  </div>
                </>
              ) : (
                <>
                  <Save className="h-6 w-6 text-muted-foreground shrink-0" />
                  <div>
                    <h4 className="font-semibold">Progress: {Math.round(progressPercent)}%</h4>
                    <p className="text-sm text-muted-foreground">{answeredQuestions} of {totalQuestions} questions answered</p>
                    <p className="text-xs text-muted-foreground mt-1">Responses save automatically</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {onComplete ? (
                <Button 
                  onClick={onComplete} 
                  className="flex-1 sm:flex-none"
                  data-testid="button-complete-section"
                >
                  {progressPercent === 100 ? "Continue to Next Section" : "Save & Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Progress Saved",
                        description: `${answeredQuestions} responses saved. Return anytime to continue.`,
                      });
                    }}
                    className="flex-1 sm:flex-none"
                    data-testid="button-save-progress"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Progress
                  </Button>
                  <Link href="/app/dashboard">
                    <Button 
                      variant="secondary"
                      className="w-full sm:w-auto"
                      data-testid="button-return-dashboard"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
