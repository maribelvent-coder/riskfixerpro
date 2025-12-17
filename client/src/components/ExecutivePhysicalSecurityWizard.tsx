import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Building,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  MessageSquare,
  AlertTriangle,
  Image,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EvidenceUploader } from "./EvidenceUploader";
import { EP_PART2_CATEGORIES } from "./ExecutiveSurveyQuestions";
import type { AssessmentWithQuestions } from "@shared/schema";

interface ExecutivePhysicalSecurityWizardProps {
  assessmentId: string;
  onComplete?: () => void;
}

interface SurveyQuestion {
  id: string;
  category: string | null;
  subcategory: string | null;
  question: string;
  type: string | null;
  response?: string | null;
  notes?: string | null;
  evidence?: string[] | null;
  options?: string[] | null;
}

type ViewMode = "standard" | "compact" | "focus";

export default function ExecutivePhysicalSecurityWizard({
  assessmentId,
  onComplete,
}: ExecutivePhysicalSecurityWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("standard");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [focusQuestionIndex, setFocusQuestionIndex] = useState(0);
  const [localResponses, setLocalResponses] = useState<Record<string, { response?: string; notes?: string; evidence?: string[] }>>({});
  const [showEvidenceUploader, setShowEvidenceUploader] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const latestResponsesRef = useRef<Record<string, { response?: string; notes?: string; evidence?: string[] }>>({});

  // Fetch assessment to determine paradigm
  const { data: assessment } = useQuery<AssessmentWithQuestions>({
    queryKey: ['/api/assessments', assessmentId],
  });

  const paradigm = assessment?.surveyParadigm || 'facility';

  // Fetch questions based on paradigm (Part 2 uses assessment-questions for EP)
  const { data: allQuestions, isLoading: questionsLoading } = useQuery<SurveyQuestion[]>({
    queryKey: paradigm === 'executive' 
      ? ['/api/assessments', assessmentId, 'assessment-questions']
      : ['/api/assessments', assessmentId, 'facility-survey-questions'],
    enabled: !!assessment,
  });

  // Filter to only Part 2 categories
  const questions = allQuestions?.filter(q => 
    EP_PART2_CATEGORIES.includes(q.category || '')
  ) || [];

  // Group questions by category
  const categories = EP_PART2_CATEGORIES.filter(cat =>
    questions.some(q => q.category === cat)
  );

  // Set active category when questions load
  useEffect(() => {
    if (questions && questions.length > 0 && !activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
      
      // Expand all questions in standard mode
      const expanded: Record<string, boolean> = {};
      questions.forEach((q) => {
        expanded[q.id] = true;
      });
      setExpandedQuestions(expanded);
    }
  }, [questions, activeCategory, categories]);

  // Initialize local responses from server data
  useEffect(() => {
    if (questions && questions.length > 0 && !initializedRef.current) {
      const responsesMap: Record<string, { response?: string; notes?: string; evidence?: string[] }> = {};
      questions.forEach((q) => {
        responsesMap[q.id] = {
          response: q.response || undefined,
          notes: q.notes || undefined,
          evidence: q.evidence || [],
        };
      });
      setLocalResponses(responsesMap);
      latestResponsesRef.current = responsesMap;
      initializedRef.current = true;
    }
  }, [questions]);

  // Determine endpoint based on paradigm
  const questionEndpoint = paradigm === 'executive' 
    ? `/api/assessments/${assessmentId}/assessment-questions`
    : `/api/assessments/${assessmentId}/facility-survey-questions`;

  const questionQueryKey = paradigm === 'executive'
    ? ['/api/assessments', assessmentId, 'assessment-questions']
    : ['/api/assessments', assessmentId, 'facility-survey-questions'];

  // Auto-save mutation
  const saveResponseMutation = useMutation({
    mutationFn: async ({
      questionId,
      response,
      notes,
      evidence,
    }: {
      questionId: string;
      response?: string;
      notes?: string;
      evidence?: string[];
    }) => {
      const allowedFields = {
        ...(response !== undefined && { response }),
        ...(notes !== undefined && { notes }),
        ...(evidence !== undefined && { evidence }),
      };
      
      const res = await fetch(`${questionEndpoint}/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(allowedFields),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update question');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionQueryKey });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResponseChange = (questionId: string, value: string) => {
    const updatedResponses = {
      ...latestResponsesRef.current,
      [questionId]: {
        ...latestResponsesRef.current[questionId],
        response: value,
      },
    };

    setLocalResponses(updatedResponses);
    latestResponsesRef.current = updatedResponses;

    saveResponseMutation.mutate({
      questionId,
      response: value,
      notes: updatedResponses[questionId]?.notes,
      evidence: updatedResponses[questionId]?.evidence,
    });
  };

  const handleNotesChange = (questionId: string, value: string) => {
    const updatedResponses = {
      ...latestResponsesRef.current,
      [questionId]: {
        ...latestResponsesRef.current[questionId],
        notes: value,
      },
    };

    setLocalResponses(updatedResponses);
    latestResponsesRef.current = updatedResponses;

    if (debounceTimersRef.current[questionId]) {
      clearTimeout(debounceTimersRef.current[questionId]);
    }

    debounceTimersRef.current[questionId] = setTimeout(() => {
      const latestData = latestResponsesRef.current[questionId];
      saveResponseMutation.mutate({
        questionId,
        response: latestData?.response,
        notes: latestData?.notes,
        evidence: latestData?.evidence,
      });
      delete debounceTimersRef.current[questionId];
    }, 1000);
  };

  const handleEvidenceUpdate = (questionId: string, urls: string[]) => {
    const updatedResponses = {
      ...latestResponsesRef.current,
      [questionId]: {
        ...latestResponsesRef.current[questionId],
        evidence: urls,
      },
    };

    setLocalResponses(updatedResponses);
    latestResponsesRef.current = updatedResponses;

    saveResponseMutation.mutate({
      questionId,
      response: updatedResponses[questionId]?.response,
      notes: updatedResponses[questionId]?.notes,
      evidence: urls,
    });
  };

  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
    };
  }, []);

  const getCategoryQuestions = (category: string) => {
    return questions.filter((q) => q.category === category) || [];
  };

  const getCategoryStats = (category: string) => {
    const categoryQuestions = getCategoryQuestions(category);
    const answered = categoryQuestions.filter((q) => {
      const response = localResponses[q.id];
      return response?.response || response?.notes;
    }).length;
    return { answered, total: categoryQuestions.length };
  };

  // Get subgroups (subcategories) for current category
  const getSubgroups = (category: string) => {
    const categoryQuestions = getCategoryQuestions(category);
    const subcategories = Array.from(new Set(categoryQuestions.map(q => q.subcategory || "General")));
    return subcategories.length > 0 ? subcategories : ["General"];
  };

  const getSubgroupQuestions = (category: string, subgroup: string) => {
    return getCategoryQuestions(category).filter(
      q => (q.subcategory || "General") === subgroup
    );
  };

  // Calculate overall stats
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((q) => {
    const response = localResponses[q.id];
    return response?.response || response?.notes;
  }).length;
  const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Stats for sidebar
  const issuesCount = questions.filter((q) => {
    const response = localResponses[q.id];
    return response?.response === "no" || response?.response === "No";
  }).length;

  const notesCount = questions.filter((q) => {
    const response = localResponses[q.id];
    return response?.notes && response.notes.length > 0;
  }).length;

  const evidenceCount = questions.filter((q) => {
    const response = localResponses[q.id];
    return response?.evidence && response.evidence.length > 0;
  }).length;

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const collapseAll = () => {
    const collapsed: Record<string, boolean> = {};
    questions.forEach((q) => {
      collapsed[q.id] = false;
    });
    setExpandedQuestions(collapsed);
  };

  const expandAll = () => {
    const expanded: Record<string, boolean> = {};
    questions.forEach((q) => {
      expanded[q.id] = true;
    });
    setExpandedQuestions(expanded);
  };

  // Navigation
  const currentCategoryIndex = categories.indexOf(activeCategory);
  const goToPrevCategory = () => {
    if (currentCategoryIndex > 0) {
      setActiveCategory(categories[currentCategoryIndex - 1]);
    }
  };
  const goToNextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setActiveCategory(categories[currentCategoryIndex + 1]);
    }
  };

  // Focus mode helpers
  const activeCategoryQuestions = getCategoryQuestions(activeCategory);
  const focusQuestion = activeCategoryQuestions[focusQuestionIndex];

  const goToNextFocusQuestion = () => {
    if (focusQuestionIndex < activeCategoryQuestions.length - 1) {
      setFocusQuestionIndex(focusQuestionIndex + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setActiveCategory(categories[currentCategoryIndex + 1]);
      setFocusQuestionIndex(0);
    }
  };

  const goToPrevFocusQuestion = () => {
    if (focusQuestionIndex > 0) {
      setFocusQuestionIndex(focusQuestionIndex - 1);
    } else if (currentCategoryIndex > 0) {
      const prevCategory = categories[currentCategoryIndex - 1];
      const prevQuestions = getCategoryQuestions(prevCategory);
      setActiveCategory(prevCategory);
      setFocusQuestionIndex(prevQuestions.length - 1);
    }
  };

  // Reset focus index when category changes
  useEffect(() => {
    setFocusQuestionIndex(0);
  }, [activeCategory]);

  if (questionsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Loading security assessment questions...
          </p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No security assessment questions available.
      </div>
    );
  }

  const allExpanded = Object.values(expandedQuestions).every((v) => v);

  // Render question card based on question type
  const renderQuestionCard = (q: SurveyQuestion, index: number) => {
    const response = localResponses[q.id] || {};
    const isYesNo = q.type === 'yes-no' || q.type === 'condition';
    const hasIssue = isYesNo && (response.response === "no" || response.response === "No");
    const hasNotes = response.notes && response.notes.length > 0;
    const hasEvidence = response.evidence && response.evidence.length > 0;
    const isAnswered = response.response || response.notes;
    const isExpanded = viewMode === "standard" || expandedQuestions[q.id];

    return (
      <Card
        key={q.id}
        data-testid={`question-card-${index + 1}`}
        className={cn(
          "transition-all ring-2",
          hasIssue 
            ? "border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 ring-blue-300 dark:ring-blue-800"
            : "ring-slate-200 dark:ring-slate-700/50"
        )}
      >
        {/* Question Header */}
        <div
          className={cn(
            "p-3 sm:p-4",
            viewMode === "compact" && "cursor-pointer"
          )}
          onClick={() => viewMode === "compact" && toggleQuestion(q.id)}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            {/* Question Number - royal blue */}
            <div
              className={cn(
                "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-medium",
                hasIssue
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : isAnswered
                    ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                    : "bg-blue-500 text-white dark:bg-blue-400 dark:text-white"
              )}
            >
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <h3 className="text-xs sm:text-sm font-medium leading-snug">
                  {q.question}
                </h3>

                {/* Status indicators */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  {hasIssue && (
                    <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">
                      Issue
                    </Badge>
                  )}
                  {hasEvidence && (
                    <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  )}
                  {hasNotes && (
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  )}
                  {isAnswered && !hasIssue && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  )}
                </div>
              </div>

              {/* Compact View - Show response inline */}
              {viewMode === "compact" && !expandedQuestions[q.id] && isAnswered && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  <span className="font-medium">
                    {response.response || ""}
                  </span>
                  {hasNotes && (
                    <span className="ml-2">
                      • {response.notes?.substring(0, 40)}...
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Expand/Collapse for compact mode */}
            {viewMode === "compact" && (
              <button 
                className="text-muted-foreground hover:text-foreground p-1"
                data-testid={`button-expand-question-${index + 1}`}
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-transform",
                    expandedQuestions[q.id] && "rotate-180"
                  )}
                />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
            <div className="pl-8 sm:pl-10 space-y-3 sm:space-y-4">
              {/* Response Field - Yes/No or other types */}
              {isYesNo ? (
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Response
                  </Label>
                  <RadioGroup
                    value={response.response || ""}
                    onValueChange={(value) => handleResponseChange(q.id, value)}
                    className="mt-2 flex items-center gap-4 sm:gap-6"
                    data-testid={`radio-question-${index + 1}`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                      <Label htmlFor={`${q.id}-yes`} className="font-normal cursor-pointer text-xs sm:text-sm">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <RadioGroupItem value="no" id={`${q.id}-no`} />
                      <Label htmlFor={`${q.id}-no`} className="font-normal cursor-pointer text-xs sm:text-sm">
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ) : q.options && q.options.length > 0 ? (
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Response
                  </Label>
                  <RadioGroup
                    value={response.response || ""}
                    onValueChange={(value) => handleResponseChange(q.id, value)}
                    className="mt-2 space-y-2"
                    data-testid={`radio-options-${index + 1}`}
                  >
                    {q.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <RadioGroupItem value={option} id={`${q.id}-opt-${optIdx}`} />
                        <Label htmlFor={`${q.id}-opt-${optIdx}`} className="font-normal cursor-pointer text-xs sm:text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                <div>
                  <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Response
                  </Label>
                  <Textarea
                    className="mt-1.5 text-xs sm:text-sm resize-none"
                    rows={2}
                    value={response.response || ""}
                    onChange={(e) => handleResponseChange(q.id, e.target.value)}
                    placeholder="Enter your response..."
                    data-testid={`textarea-response-${index + 1}`}
                  />
                </div>
              )}

              {/* Notes Field */}
              <div>
                <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Observations & Notes
                </Label>
                {response.notes ? (
                  <Textarea
                    className="mt-1.5 text-xs sm:text-sm resize-none"
                    rows={2}
                    value={response.notes}
                    onChange={(e) => handleNotesChange(q.id, e.target.value)}
                    placeholder="Add additional details or context..."
                    data-testid={`textarea-notes-${index + 1}`}
                  />
                ) : (
                  <button
                    className="mt-1.5 w-full px-3 py-2 sm:py-2.5 border border-dashed rounded-lg text-xs sm:text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-left"
                    onClick={() => handleNotesChange(q.id, " ")}
                    data-testid={`button-add-note-${index + 1}`}
                  >
                    + Add observation or note...
                  </button>
                )}
              </div>

              {/* Evidence Photos */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Photo Evidence
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEvidenceUploader(showEvidenceUploader === q.id ? null : q.id)}
                    className="h-6 px-2 text-xs"
                    data-testid={`button-toggle-evidence-${index + 1}`}
                  >
                    <Camera className="w-3 h-3 mr-1" />
                    {hasEvidence ? `${response.evidence?.length} photo${(response.evidence?.length || 0) > 1 ? 's' : ''}` : 'Add'}
                  </Button>
                </div>
                
                {showEvidenceUploader === q.id && (
                  <div className="mt-2">
                    <EvidenceUploader
                      assessmentId={assessmentId}
                      questionId={q.id}
                      questionType="assessment"
                      evidence={response.evidence || []}
                      onUpdate={(newEvidencePath) => {
                        // Update local state immediately for instant feedback
                        if (newEvidencePath) {
                          setLocalResponses(prev => {
                            const current = prev[q.id] || {};
                            return {
                              ...prev,
                              [q.id]: {
                                ...current,
                                evidence: [...(current.evidence || []), newEvidencePath]
                              }
                            };
                          });
                        }
                        // Also refetch to sync with server
                        queryClient.invalidateQueries({ queryKey: questionQueryKey });
                      }}
                    />
                  </div>
                )}

                {/* Evidence thumbnails */}
                {hasEvidence && showEvidenceUploader !== q.id && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {response.evidence?.slice(0, 3).map((url, imgIdx) => (
                      <div key={imgIdx} className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                        <img src={url} alt={`Evidence ${imgIdx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {(response.evidence?.length || 0) > 3 && (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        +{(response.evidence?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Render Focus Mode Question
  const renderFocusQuestion = () => {
    if (!focusQuestion) return null;
    
    const response = localResponses[focusQuestion.id] || {};
    const isYesNo = focusQuestion.type === 'yes-no' || focusQuestion.type === 'condition';
    const hasIssue = isYesNo && (response.response === "no" || response.response === "No");
    const globalIndex = questions.findIndex(q => q.id === focusQuestion.id);

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Focus Mode Header */}
        <div className="bg-card border-b p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Question {globalIndex + 1} of {totalQuestions}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {activeCategory}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("standard")}
              data-testid="button-exit-focus"
            >
              <X className="w-4 h-4 mr-1" />
              Exit Focus
            </Button>
          </div>
        </div>

        {/* Focus Mode Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className={cn(
              "transition-all ring-2",
              hasIssue 
                ? "border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 ring-blue-300 dark:ring-blue-800"
                : "ring-slate-200 dark:ring-slate-700/50"
            )}>
              <CardContent className="p-6">
                {/* Question Number */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold",
                    hasIssue
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                  )}>
                    {globalIndex + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-lg font-medium leading-relaxed">
                        {focusQuestion.question}
                      </h2>
                      {hasIssue && (
                        <Badge className="bg-blue-500 text-white shrink-0">
                          Issue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Response */}
                <div className="space-y-6">
                  {isYesNo ? (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Response
                      </Label>
                      <RadioGroup
                        value={response.response || ""}
                        onValueChange={(value) => handleResponseChange(focusQuestion.id, value)}
                        className="mt-3 flex items-center gap-6"
                        data-testid="focus-radio-response"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="focus-yes" />
                          <Label htmlFor="focus-yes" className="font-normal cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="focus-no" />
                          <Label htmlFor="focus-no" className="font-normal cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ) : focusQuestion.options && focusQuestion.options.length > 0 ? (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Response
                      </Label>
                      <RadioGroup
                        value={response.response || ""}
                        onValueChange={(value) => handleResponseChange(focusQuestion.id, value)}
                        className="mt-3 space-y-3"
                        data-testid="focus-radio-options"
                      >
                        {focusQuestion.options.map((option, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <RadioGroupItem value={option} id={`focus-opt-${optIdx}`} />
                            <Label htmlFor={`focus-opt-${optIdx}`} className="font-normal cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Response
                      </Label>
                      <Textarea
                        className="mt-2 resize-none"
                        rows={3}
                        value={response.response || ""}
                        onChange={(e) => handleResponseChange(focusQuestion.id, e.target.value)}
                        placeholder="Enter your response..."
                        data-testid="focus-textarea-response"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Observations & Notes
                    </Label>
                    <Textarea
                      className="mt-2 resize-none"
                      rows={3}
                      value={response.notes || ""}
                      onChange={(e) => handleNotesChange(focusQuestion.id, e.target.value)}
                      placeholder="Add additional details or context..."
                      data-testid="focus-textarea-notes"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Focus Mode Footer */}
        <div className="bg-card border-t p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={goToPrevFocusQuestion}
              disabled={focusQuestionIndex === 0 && currentCategoryIndex === 0}
              data-testid="button-focus-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <Progress value={(globalIndex / totalQuestions) * 100} className="w-32 h-2" />
            
            {globalIndex === totalQuestions - 1 ? (
              <Button onClick={onComplete} data-testid="button-focus-complete">
                Complete Assessment
                <CheckCircle className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={goToNextFocusQuestion} data-testid="button-focus-next">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Focus mode is handled inline when viewMode === "focus"
  // Render focus overlay if in focus mode
  if (viewMode === "focus" as ViewMode) {
    return renderFocusQuestion();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
            <div>
              <h1 className="text-base sm:text-lg font-semibold">
                Physical Security Assessment
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comprehensive residential security evaluation
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-muted rounded-lg p-1 text-xs sm:text-sm">
                <button
                  onClick={() => setViewMode("standard")}
                  className={cn(
                    "px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all",
                    viewMode === "standard"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="button-view-standard"
                >
                  Standard
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={cn(
                    "px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all",
                    viewMode === "compact"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="button-view-compact"
                >
                  Compact
                </button>
                <button
                  onClick={() => setViewMode("focus")}
                  className={cn(
                    "px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all",
                    viewMode === "focus"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="button-view-focus"
                >
                  Focus
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
              {answeredQuestions} of {totalQuestions} completed
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar - Category Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-28 sm:top-32">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Categories
                </h3>
                <nav className="space-y-1 max-h-[40vh] overflow-y-auto">
                  {categories.map((category) => {
                    const stats = getCategoryStats(category);
                    const isActive = activeCategory === category;
                    const isComplete = stats.answered === stats.total && stats.total > 0;
                    const displayName = category.replace("Residential Security - ", "");

                    return (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={cn(
                          "w-full text-left px-3 py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-between gap-2",
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                        data-testid={`nav-category-${displayName.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <span className="text-xs sm:text-sm font-medium truncate">
                          {displayName}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0",
                            isComplete
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {stats.answered}/{stats.total}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {/* Quick Stats */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                    Quick Stats
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issues Found</span>
                      <span className="font-medium text-blue-600">{issuesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notes Added</span>
                      <span className="font-medium">{notesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Photos</span>
                      <span className="font-medium">{evidenceCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(progressPercent)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Category Header */}
            <Card className="mb-4">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold">
                      {activeCategory.replace("Residential Security - ", "")}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Answer all questions in this section to continue
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={allExpanded ? collapseAll : expandAll}
                      className="text-xs"
                      data-testid="button-collapse-expand-all"
                    >
                      {allExpanded ? "Collapse All" : "Expand All"}
                    </Button>
                  </div>
                </div>

                {/* Section Progress */}
                <div className="mt-3 sm:mt-4 flex items-center gap-3">
                  <Progress
                    value={
                      getCategoryStats(activeCategory).total > 0
                        ? (getCategoryStats(activeCategory).answered / getCategoryStats(activeCategory).total) * 100
                        : 0
                    }
                    className="flex-1 h-1.5"
                  />
                  <span className="text-xs text-muted-foreground">
                    {getCategoryStats(activeCategory).answered} of {getCategoryStats(activeCategory).total}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Questions grouped by subcategory */}
            {getSubgroups(activeCategory).map((subgroup) => {
              const subgroupQuestions = getSubgroupQuestions(activeCategory, subgroup);
              if (subgroupQuestions.length === 0) return null;

              return (
                <div key={subgroup} className="mb-6" data-testid={`subgroup-${subgroup.toLowerCase().replace(/\s+/g, "-")}`}>
                  {/* Subgroup Header - only show if not "General" */}
                  {subgroup !== "General" && (
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {subgroup}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}

                  {/* Questions in this subgroup */}
                  <div className="space-y-3">
                    {subgroupQuestions.map((q, idx) => {
                      const globalIndex = questions.findIndex(gq => gq.id === q.id);
                      return renderQuestionCard(q, globalIndex);
                    })}
                  </div>
                </div>
              );
            })}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
              <Button
                variant="ghost"
                onClick={goToPrevCategory}
                disabled={currentCategoryIndex === 0}
                className="flex items-center gap-2"
                data-testid="button-prev-section"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous Section</span>
              </Button>
              {currentCategoryIndex === categories.length - 1 ? (
                <Button
                  onClick={onComplete}
                  disabled={progressPercent < 80}
                  className="flex items-center gap-2"
                  data-testid="button-complete-assessment"
                >
                  Complete Assessment
                  <CheckCircle className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={goToNextCategory}
                  className="flex items-center gap-2"
                  data-testid="button-next-section"
                >
                  <span className="hidden sm:inline">Next Section</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
