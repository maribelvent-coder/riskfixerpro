import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Shield,
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
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type {
  ExecutiveInterviewQuestion,
  ExecutiveInterviewResponse,
} from "@shared/schema";

interface ExecutiveInterviewWizardProps {
  assessmentId: string;
  onComplete?: () => void;
  onSwitchToClassic?: () => void;
}

type ViewMode = "standard" | "compact" | "focus";

export default function ExecutiveInterviewWizard({
  assessmentId,
  onComplete,
  onSwitchToClassic,
}: ExecutiveInterviewWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("standard");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});
  const [focusQuestionIndex, setFocusQuestionIndex] = useState(0);
  const [localResponses, setLocalResponses] = useState<
    Record<string, { yesNoResponse?: boolean; textResponse?: string }>
  >({});

  const initializedRef = useRef(false);
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const latestResponsesRef = useRef<
    Record<string, { yesNoResponse?: boolean; textResponse?: string }>
  >({});

  // Fetch interview questions
  const { data: questions, isLoading: questionsLoading } = useQuery<
    ExecutiveInterviewQuestion[]
  >({
    queryKey: [
      "/api/assessments",
      assessmentId,
      "executive-interview",
      "questions",
    ],
  });

  // Fetch existing responses
  const { data: responses, isLoading: responsesLoading } = useQuery<
    ExecutiveInterviewResponse[]
  >({
    queryKey: [
      "/api/assessments",
      assessmentId,
      "executive-interview",
      "responses",
    ],
  });

  // Set active category when questions load
  useEffect(() => {
    if (questions && questions.length > 0 && !activeCategory) {
      const firstCategory = questions[0].category || "Uncategorized";
      setActiveCategory(firstCategory);

      // Expand all questions in standard mode
      const expanded: Record<string, boolean> = {};
      questions.forEach((q) => {
        expanded[q.id] = true;
      });
      setExpandedQuestions(expanded);
    }
  }, [questions, activeCategory]);

  // Initialize local responses from server data
  useEffect(() => {
    if (responses && questions && !initializedRef.current) {
      const responsesMap: Record<
        string,
        { yesNoResponse?: boolean; textResponse?: string }
      > = {};
      responses.forEach((r) => {
        responsesMap[r.questionId] = {
          yesNoResponse: r.yesNoResponse ?? undefined,
          textResponse: r.textResponse ?? undefined,
        };
      });
      setLocalResponses(responsesMap);
      latestResponsesRef.current = responsesMap;
      initializedRef.current = true;
    }
  }, [responses, questions]);

  // Auto-save mutation
  const saveResponseMutation = useMutation({
    mutationFn: async ({
      questionId,
      yesNoResponse,
      textResponse,
    }: {
      questionId: string;
      yesNoResponse?: boolean;
      textResponse?: string;
    }) => {
      return apiRequest(
        "POST",
        `/api/assessments/${assessmentId}/executive-interview/responses`,
        { questionId, yesNoResponse, textResponse }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "/api/assessments",
          assessmentId,
          "executive-interview",
          "responses",
        ],
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleYesNoChange = (questionId: string, value: boolean) => {
    const updatedResponses = {
      ...latestResponsesRef.current,
      [questionId]: {
        ...latestResponsesRef.current[questionId],
        yesNoResponse: value,
      },
    };

    setLocalResponses(updatedResponses);
    latestResponsesRef.current = updatedResponses;

    saveResponseMutation.mutate({
      questionId,
      yesNoResponse: value,
      textResponse: updatedResponses[questionId]?.textResponse,
    });
  };

  const handleTextChange = (questionId: string, value: string) => {
    const updatedResponses = {
      ...latestResponsesRef.current,
      [questionId]: {
        ...latestResponsesRef.current[questionId],
        textResponse: value,
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
        yesNoResponse: latestData?.yesNoResponse,
        textResponse: latestData?.textResponse,
      });
      delete debounceTimersRef.current[questionId];
    }, 1000);
  };

  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
    };
  }, []);

  // Group questions by category
  const categories = questions
    ? Array.from(new Set(questions.map((q) => q.category || "Uncategorized")))
    : [];

  const getCategoryQuestions = (category: string) => {
    return (
      questions?.filter((q) => (q.category || "Uncategorized") === category) ||
      []
    );
  };

  const getCategoryStats = (category: string) => {
    const categoryQuestions = getCategoryQuestions(category);
    const answered = categoryQuestions.filter((q) => {
      const response = localResponses[q.id];
      if (q.responseType === "yes-no-text") {
        return response?.yesNoResponse !== undefined || response?.textResponse;
      }
      return response?.textResponse;
    }).length;
    return { answered, total: categoryQuestions.length };
  };

  // Get subgroups for current category
  // Since ExecutiveInterviewQuestion doesn't have subcategory, we use "General" as default
  const getSubgroups = (_category: string) => {
    return ["General"];
  };

  const getSubgroupQuestions = (category: string, _subgroup: string) => {
    return getCategoryQuestions(category).sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
  };

  // Calculate overall stats
  const totalQuestions = questions?.length || 0;
  const answeredQuestions =
    questions?.filter((q) => {
      const response = localResponses[q.id];
      if (q.responseType === "yes-no-text") {
        return response?.yesNoResponse !== undefined || response?.textResponse;
      }
      return response?.textResponse;
    }).length || 0;
  const progressPercent =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Stats for sidebar
  const issuesCount =
    questions?.filter((q) => {
      const response = localResponses[q.id];
      return response?.yesNoResponse === false;
    }).length || 0;

  const notesCount =
    questions?.filter((q) => {
      const response = localResponses[q.id];
      return response?.textResponse && response.textResponse.length > 0;
    }).length || 0;

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const collapseAll = () => {
    const collapsed: Record<string, boolean> = {};
    questions?.forEach((q) => {
      collapsed[q.id] = false;
    });
    setExpandedQuestions(collapsed);
  };

  const expandAll = () => {
    const expanded: Record<string, boolean> = {};
    questions?.forEach((q) => {
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

  if (questionsLoading || responsesLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Loading interview questions...
          </p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No interview questions available.
      </div>
    );
  }

  const allExpanded = Object.values(expandedQuestions).every((v) => v);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
            <div>
              <h1 className="text-base sm:text-lg font-semibold">
                Executive Protection Interview
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comprehensive security interview questionnaire
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
              {onSwitchToClassic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSwitchToClassic}
                  className="text-xs"
                  data-testid="button-switch-classic"
                >
                  Classic
                </Button>
              )}
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
                <nav className="space-y-1">
                  {categories.map((category) => {
                    const stats = getCategoryStats(category);
                    const isActive = activeCategory === category;
                    const isComplete = stats.answered === stats.total;

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
                        data-testid={`nav-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <span className="text-xs sm:text-sm font-medium truncate">
                          {category}
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
                      <span className="text-muted-foreground">
                        Issues Found
                      </span>
                      <span className="font-medium text-blue-600">
                        {issuesCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notes Added</span>
                      <span className="font-medium">{notesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {Math.round(progressPercent)}%
                      </span>
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
                      {activeCategory}
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
                      (getCategoryStats(activeCategory).answered /
                        getCategoryStats(activeCategory).total) *
                      100
                    }
                    className="flex-1 h-1.5"
                  />
                  <span className="text-xs text-muted-foreground">
                    {getCategoryStats(activeCategory).answered} of{" "}
                    {getCategoryStats(activeCategory).total}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Questions grouped by subgroup */}
            {getSubgroups(activeCategory).map((subgroup) => (
              <div key={subgroup} className="mb-6" data-testid={`subgroup-${subgroup.toLowerCase().replace(/\s+/g, "-")}`}>
                {/* Subgroup Header - only show if not "General" (EP questions don't have subcategories) */}
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
                  {getSubgroupQuestions(activeCategory, subgroup).map((q) => {
                    const response = localResponses[q.id] || {};
                    const hasIssue = response.yesNoResponse === false;
                    const hasNotes =
                      response.textResponse &&
                      response.textResponse.length > 0;
                    const isAnswered =
                      q.responseType === "yes-no-text"
                        ? response.yesNoResponse !== undefined ||
                          response.textResponse
                        : response.textResponse;
                    const isExpanded =
                      viewMode === "standard" || expandedQuestions[q.id];

                    return (
                      <Card
                        key={q.id}
                        data-testid={`question-card-${q.questionNumber}`}
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
                          onClick={() =>
                            viewMode === "compact" && toggleQuestion(q.id)
                          }
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
                              {q.questionNumber}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 sm:gap-4">
                                <h3 className="text-xs sm:text-sm font-medium leading-snug">
                                  {q.question}
                                </h3>

                                {/* Status indicators */}
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                  {hasNotes && (
                                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                                  )}
                                  {isAnswered && (
                                    <CheckCircle
                                      className={cn(
                                        "w-4 h-4 sm:w-5 sm:h-5",
                                        hasIssue
                                          ? "text-blue-500"
                                          : "text-primary"
                                      )}
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Compact View - Show response inline */}
                              {viewMode === "compact" &&
                                !expandedQuestions[q.id] &&
                                isAnswered && (
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    <span className="font-medium">
                                      {response.yesNoResponse !== undefined
                                        ? response.yesNoResponse
                                          ? "Yes"
                                          : "No"
                                        : ""}
                                    </span>
                                    {hasNotes && (
                                      <span className="ml-2">
                                        •{" "}
                                        {response.textResponse?.substring(
                                          0,
                                          40
                                        )}
                                        ...
                                      </span>
                                    )}
                                  </p>
                                )}
                            </div>

                            {/* Expand/Collapse for compact mode */}
                            {viewMode === "compact" && (
                              <button 
                                className="text-muted-foreground hover:text-foreground p-1"
                                data-testid={`button-expand-question-${q.questionNumber}`}
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
                              {/* Yes/No Response */}
                              {q.responseType === "yes-no-text" && (
                                <div>
                                  <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Response
                                  </Label>
                                  <RadioGroup
                                    value={
                                      response.yesNoResponse === undefined
                                        ? ""
                                        : response.yesNoResponse
                                          ? "yes"
                                          : "no"
                                    }
                                    onValueChange={(value) =>
                                      handleYesNoChange(q.id, value === "yes")
                                    }
                                    className="mt-2 flex items-center gap-4 sm:gap-6"
                                    data-testid={`radio-question-${q.questionNumber}`}
                                  >
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                      <RadioGroupItem
                                        value="yes"
                                        id={`${q.id}-yes`}
                                      />
                                      <Label
                                        htmlFor={`${q.id}-yes`}
                                        className="font-normal cursor-pointer text-xs sm:text-sm"
                                      >
                                        Yes
                                      </Label>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                      <RadioGroupItem
                                        value="no"
                                        id={`${q.id}-no`}
                                      />
                                      <Label
                                        htmlFor={`${q.id}-no`}
                                        className="font-normal cursor-pointer text-xs sm:text-sm"
                                      >
                                        No
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                              )}

                              {/* Notes Field */}
                              <div>
                                <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Observations & Notes
                                </Label>
                                {response.textResponse ? (
                                  <Textarea
                                    className="mt-1.5 text-xs sm:text-sm resize-none"
                                    rows={2}
                                    value={response.textResponse}
                                    onChange={(e) =>
                                      handleTextChange(q.id, e.target.value)
                                    }
                                    placeholder={
                                      q.responseType === "yes-no-text"
                                        ? "Add additional details or context..."
                                        : "Enter your response..."
                                    }
                                    data-testid={`textarea-question-${q.questionNumber}`}
                                  />
                                ) : (
                                  <button
                                    className="mt-1.5 w-full px-3 py-2 sm:py-2.5 border border-dashed rounded-lg text-xs sm:text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-left"
                                    onClick={() => handleTextChange(q.id, " ")}
                                    data-testid={`button-add-note-${q.questionNumber}`}
                                  >
                                    + Add observation or note...
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

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
                  data-testid="button-complete-interview"
                >
                  Complete Interview
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

      {/* Focus Mode Overlay */}
      {viewMode === "focus" && focusQuestion && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 flex items-center justify-center p-4 sm:p-6">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Focus Mode Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Question {focusQuestionIndex + 1} of{" "}
                  {activeCategoryQuestions.length}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs sm:text-sm font-medium text-primary">
                  {activeCategory}
                </span>
              </div>
              <button
                onClick={() => setViewMode("standard")}
                className="text-muted-foreground hover:text-foreground p-1"
                data-testid="button-close-focus"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Focus Mode Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                {focusQuestion.question}
              </h2>

              <div className="space-y-4 sm:space-y-5">
                {focusQuestion.responseType === "yes-no-text" && (
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">
                      Response
                    </Label>
                    <RadioGroup
                      value={
                        localResponses[focusQuestion.id]?.yesNoResponse ===
                        undefined
                          ? ""
                          : localResponses[focusQuestion.id]?.yesNoResponse
                            ? "yes"
                            : "no"
                      }
                      onValueChange={(value) =>
                        handleYesNoChange(focusQuestion.id, value === "yes")
                      }
                      className="mt-2 flex items-center gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id={`focus-${focusQuestion.id}-yes`}
                        />
                        <Label
                          htmlFor={`focus-${focusQuestion.id}-yes`}
                          className="font-normal cursor-pointer"
                        >
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="no"
                          id={`focus-${focusQuestion.id}-no`}
                        />
                        <Label
                          htmlFor={`focus-${focusQuestion.id}-no`}
                          className="font-normal cursor-pointer"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <div>
                  <Label className="text-xs sm:text-sm font-medium">
                    Observations & Notes
                  </Label>
                  <Textarea
                    className="mt-2 text-sm resize-none"
                    rows={3}
                    placeholder={
                      focusQuestion.responseType === "yes-no-text"
                        ? "Add additional details or context..."
                        : "Enter your response..."
                    }
                    value={localResponses[focusQuestion.id]?.textResponse || ""}
                    onChange={(e) =>
                      handleTextChange(focusQuestion.id, e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Focus Mode Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={goToPrevFocusQuestion}
                disabled={focusQuestionIndex === 0 && currentCategoryIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {/* Progress dots */}
              <div className="flex items-center gap-1">
                {activeCategoryQuestions.slice(0, 10).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors",
                      idx === focusQuestionIndex
                        ? "bg-primary"
                        : idx < focusQuestionIndex
                          ? "bg-primary/50"
                          : "bg-muted"
                    )}
                  />
                ))}
                {activeCategoryQuestions.length > 10 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{activeCategoryQuestions.length - 10}
                  </span>
                )}
              </div>

              <Button
                onClick={goToNextFocusQuestion}
                disabled={
                  focusQuestionIndex === activeCategoryQuestions.length - 1 &&
                  currentCategoryIndex === categories.length - 1
                }
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
