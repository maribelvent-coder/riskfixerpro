import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Save,
  Shield,
  Lock,
  Eye,
  Lightbulb,
  Building,
  CheckCircle,
  Camera,
  FileText,
  Menu,
  X,
  MessageSquare,
  Image,
  AlertTriangle,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { EvidenceUploader } from "./EvidenceUploader";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SurveyWizardProps {
  assessmentId: string;
  templateId?: string;
  onComplete?: () => void;
}

interface SurveyQuestion {
  templateId: string;
  dbId?: string;
  category: string;
  subcategory: string;
  question: string;
  standard: string;
  type:
    | "condition"
    | "measurement"
    | "yes-no"
    | "rating"
    | "text"
    | "checklist"
    | "multiple-choice"
    | "number";
  response?: any;
  notes?: string;
  evidence?: string[];
  recommendations?: string[];
  options?: string[];
  conditionalOnQuestionId?: string;
  showWhenAnswer?: string;
  riskDirection?: "positive" | "negative";
}

const SURVEY_TYPE_LABELS: Record<string, string> = {
  "office-building": "Office",
  "retail-store": "Retail Store",
  "warehouse-distribution": "Warehouse",
  "manufacturing-facility": "Manufacturing Facility",
  "data-center": "Data Center",
  "executive-protection": "Executive Protection",
};

export function SurveyWizard({
  assessmentId,
  templateId,
  onComplete,
}: SurveyWizardProps) {
  const surveyType = templateId
    ? SURVEY_TYPE_LABELS[templateId] || "Facility"
    : "Facility";

  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [showEvidenceUploader, setShowEvidenceUploader] = useState<string | null>(null);
  const [isPersisting, setIsPersisting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [navOpen, setNavOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const templateToDbIdMap = useRef<Map<string, string>>(new Map());
  const pendingChangesMap = useRef<
    Map<string, { question: SurveyQuestion; updateData: any }>
  >(new Map());
  const autosaveTimersMap = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load template questions from database
  const { data: savedQuestions, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "facility-survey"],
    queryFn: async () => {
      const response = await fetch(
        `/api/assessments/${assessmentId}/facility-survey`
      );
      if (!response.ok) throw new Error("Failed to fetch facility survey");
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Initialize questions from server data
  useEffect(() => {
    if (savedQuestions && savedQuestions.length > 0) {
      savedQuestions.forEach((sq: any) => {
        const templateId = sq.templateQuestionId;
        if (templateId && sq.id) {
          templateToDbIdMap.current.set(templateId, sq.id);
        }
      });

      const formattedQuestions: SurveyQuestion[] = savedQuestions.map(
        (sq: any) => {
          let normalizedResponse = sq.response;
          if (
            sq.type === "rating" ||
            sq.type === "yes-no" ||
            sq.type === "condition"
          ) {
            if (typeof sq.response === "number") {
              normalizedResponse = String(sq.response);
            }
          }

          return {
            templateId: sq.templateQuestionId,
            dbId: sq.id,
            category: sq.category,
            subcategory: sq.subcategory,
            question: sq.question,
            standard: sq.standard,
            type: sq.type,
            options: sq.options || [],
            response: normalizedResponse,
            notes: sq.notes,
            evidence: sq.evidence || [],
            recommendations: sq.recommendations || [],
            conditionalOnQuestionId: sq.conditionalOnQuestionId,
            showWhenAnswer: sq.showWhenAnswer,
            riskDirection: sq.riskDirection || "positive",
          };
        }
      );

      setQuestions((prevQuestions) => {
        if (prevQuestions.length === 0) {
          return formattedQuestions;
        }

        return formattedQuestions.map((serverQuestion) => {
          const localQuestion = prevQuestions.find(
            (q) => q.templateId === serverQuestion.templateId
          );

          if (!localQuestion) {
            return serverQuestion;
          }

          return {
            ...serverQuestion,
            response:
              localQuestion.response !== undefined &&
              localQuestion.response !== serverQuestion.response
                ? localQuestion.response
                : serverQuestion.response,
            notes:
              localQuestion.notes !== serverQuestion.notes
                ? localQuestion.notes
                : serverQuestion.notes,
            evidence: serverQuestion.evidence,
            recommendations:
              localQuestion.recommendations &&
              localQuestion.recommendations.length > 0 &&
              JSON.stringify(localQuestion.recommendations) !==
                JSON.stringify(serverQuestion.recommendations)
                ? localQuestion.recommendations
                : serverQuestion.recommendations,
          };
        });
      });
    }
  }, [savedQuestions]);

  // Get unique categories
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  // Set initial active category when questions load
  useEffect(() => {
    if (questions.length > 0 && !activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
      
      // Expand all questions initially
      const expanded: Record<string, boolean> = {};
      questions.forEach((q) => {
        expanded[q.templateId] = true;
      });
      setExpandedQuestions(expanded);
    }
  }, [questions, activeCategory, categories]);

  const shouldShowQuestion = (q: SurveyQuestion): boolean => {
    if (!q.conditionalOnQuestionId || !q.showWhenAnswer) {
      return true;
    }

    const prereqQuestion = questions.find(
      (pq) => pq.templateId === q.conditionalOnQuestionId
    );

    if (!prereqQuestion?.response) {
      return false;
    }

    const response = String(prereqQuestion.response).toLowerCase();
    const expected = q.showWhenAnswer.toLowerCase();
    return response === expected;
  };

  const isQuestionCompleted = (q: SurveyQuestion): boolean => {
    if (!q.response) return false;

    if (q.type === "measurement") {
      return !!q.response?.value && !!q.response?.assessment;
    }

    if (q.type === "text") {
      return !!q.response?.textResponse && !!q.response?.assessment;
    }

    if (q.type === "checklist") {
      return q.response?.selectedOptions?.length > 0;
    }

    return !!q.response;
  };

  // Get questions for a category
  const getCategoryQuestions = (category: string) => {
    return questions
      .filter((q) => q.category === category)
      .filter(shouldShowQuestion);
  };

  // Get subcategories for a category
  const getSubcategories = (category: string) => {
    const categoryQuestions = getCategoryQuestions(category);
    return Array.from(new Set(categoryQuestions.map((q) => q.subcategory || "General")));
  };

  // Get questions for a subcategory
  const getSubcategoryQuestions = (category: string, subcategory: string) => {
    return getCategoryQuestions(category).filter(
      (q) => (q.subcategory || "General") === subcategory
    );
  };

  // Calculate category stats
  const getCategoryStats = (category: string) => {
    const categoryQuestions = getCategoryQuestions(category);
    const completed = categoryQuestions.filter(isQuestionCompleted).length;
    return { completed, total: categoryQuestions.length };
  };

  // Overall progress
  const visibleQuestions = questions.filter(shouldShowQuestion);
  const completedQuestions = visibleQuestions.filter(isQuestionCompleted).length;
  const progress = visibleQuestions.length > 0
    ? (completedQuestions / visibleQuestions.length) * 100
    : 0;

  // Issues count (No responses)
  const issuesCount = visibleQuestions.filter((q) => {
    if (q.type !== "yes-no") return false;
    const response = String(q.response || "").toLowerCase();
    if (q.riskDirection === "negative") {
      return response === "yes";
    }
    return response === "no";
  }).length;

  // Notes and evidence counts
  const notesCount = visibleQuestions.filter((q) => q.notes && q.notes.length > 0).length;
  const evidenceCount = visibleQuestions.filter((q) => q.evidence && q.evidence.length > 0).length;

  // Category navigation
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

  // Expand/collapse all
  const allExpanded = Object.values(expandedQuestions).every((v) => v);

  const collapseAll = () => {
    const collapsed: Record<string, boolean> = {};
    questions.forEach((q) => {
      collapsed[q.templateId] = false;
    });
    setExpandedQuestions(collapsed);
  };

  const expandAll = () => {
    const expanded: Record<string, boolean> = {};
    questions.forEach((q) => {
      expanded[q.templateId] = true;
    });
    setExpandedQuestions(expanded);
  };

  const toggleQuestion = (templateId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }));
  };

  // Category icons
  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("access") || lowerCategory.includes("entry"))
      return Lock;
    if (
      lowerCategory.includes("surveillance") ||
      lowerCategory.includes("cctv")
    )
      return Eye;
    if (
      lowerCategory.includes("lighting") ||
      lowerCategory.includes("electric")
    )
      return Lightbulb;
    if (lowerCategory.includes("perimeter") || lowerCategory.includes("fence"))
      return Shield;
    return Building;
  };

  // Update question
  const updateQuestion = useCallback(
    (templateId: string, field: keyof SurveyQuestion, value: any) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.templateId === templateId ? { ...q, [field]: value } : q
        )
      );

      const question = questions.find((q) => q.templateId === templateId);
      if (!question) return;

      const updateData = { [field]: value };

      pendingChangesMap.current.set(templateId, {
        question: { ...question, [field]: value },
        updateData,
      });

      const existingTimer = autosaveTimersMap.current.get(templateId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        persistQuestionToServer(templateId);
        autosaveTimersMap.current.delete(templateId);
      }, 1000);

      autosaveTimersMap.current.set(templateId, timer);
    },
    [questions]
  );

  // Persist to server
  const persistQuestionToServer = async (templateId: string) => {
    const pendingChange = pendingChangesMap.current.get(templateId);
    if (!pendingChange) return;

    const { question, updateData } = pendingChange;
    const dbId = templateToDbIdMap.current.get(templateId) || question.dbId;

    if (!dbId) {
      console.error(`No dbId found for templateId: ${templateId}`);
      return;
    }

    setSaveStatus("saving");

    try {
      const response = await fetch(
        `/api/assessments/${assessmentId}/facility-survey-questions/${dbId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      pendingChangesMap.current.delete(templateId);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving question:", error);
      setSaveStatus("error");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      autosaveTimersMap.current.forEach((timer) => clearTimeout(timer));

      const pendingEntries = Array.from(pendingChangesMap.current.entries());
      pendingEntries.forEach(([templateId, { question, updateData }]) => {
        const dbId = templateToDbIdMap.current.get(templateId) || question.dbId;
        if (dbId) {
          fetch(`/api/assessments/${assessmentId}/facility-survey-questions/${dbId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updateData),
            keepalive: true,
          }).catch(() => {});
        }
      });
    };
  }, [assessmentId]);

  // Render question input based on type
  const renderQuestionInput = (question: SurveyQuestion) => {
    switch (question.type) {
      case "measurement":
        const isCountQuestion = question.question
          .toLowerCase()
          .startsWith("how many");
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`${question.templateId}-value`} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isCountQuestion ? "Count" : "Measurement Value"}
              </Label>
              <Input
                id={`${question.templateId}-value`}
                type="number"
                step={isCountQuestion ? "1" : "0.1"}
                value={question.response?.value || ""}
                onChange={(e) =>
                  updateQuestion(question.templateId, "response", {
                    ...question.response,
                    value: e.target.value,
                    unit: isCountQuestion
                      ? "count"
                      : question.response?.unit || "fc",
                  })
                }
                placeholder={isCountQuestion ? "Enter count" : "Enter measurement"}
                className="text-sm"
                data-testid={`input-${question.templateId}-value`}
              />
              {!isCountQuestion && (
                <Input
                  placeholder="Unit (fc, Px/ft, feet, etc.)"
                  value={question.response?.unit || ""}
                  onChange={(e) =>
                    updateQuestion(question.templateId, "response", {
                      ...question.response,
                      unit: e.target.value,
                    })
                  }
                  className="text-sm"
                  data-testid={`input-${question.templateId}-unit`}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Assessment Response
              </Label>
              <Select
                value={question.response?.assessment || ""}
                onValueChange={(value) =>
                  updateQuestion(question.templateId, "response", {
                    ...question.response,
                    assessment: value,
                  })
                }
              >
                <SelectTrigger
                  data-testid={`select-${question.templateId}-assessment`}
                  className="text-sm"
                >
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="n/a">N/A - Not applicable</SelectItem>
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
            value={String(question.response || "")}
            onValueChange={(value) =>
              updateQuestion(question.templateId, "response", value)
            }
          >
            <SelectTrigger
              data-testid={`select-${question.templateId}`}
              className="text-sm"
            >
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="n/a">N/A - Not applicable</SelectItem>
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
            value={String(question.response || "")}
            onValueChange={(value) =>
              updateQuestion(question.templateId, "response", value)
            }
          >
            <SelectTrigger
              data-testid={`select-${question.templateId}`}
              className="text-sm"
            >
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="n/a">N/A - Not applicable</SelectItem>
            </SelectContent>
          </Select>
        );

      case "rating":
        return (
          <Select
            value={String(question.response || "")}
            onValueChange={(value) =>
              updateQuestion(question.templateId, "response", value)
            }
          >
            <SelectTrigger
              data-testid={`select-${question.templateId}`}
              className="text-sm"
            >
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 - Excellent</SelectItem>
              <SelectItem value="4">4 - Good</SelectItem>
              <SelectItem value="3">3 - Adequate</SelectItem>
              <SelectItem value="2">2 - Poor</SelectItem>
              <SelectItem value="1">1 - Critical</SelectItem>
            </SelectContent>
          </Select>
        );

      case "text":
        return (
          <div className="space-y-3">
            <Textarea
              value={question.response?.textResponse || ""}
              onChange={(e) =>
                updateQuestion(question.templateId, "response", {
                  ...question.response,
                  textResponse: e.target.value,
                })
              }
              placeholder="Enter your response..."
              rows={2}
              className="text-sm resize-none"
              data-testid={`textarea-${question.templateId}`}
            />
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assessment</Label>
              <Select
                value={question.response?.assessment || ""}
                onValueChange={(value) =>
                  updateQuestion(question.templateId, "response", {
                    ...question.response,
                    assessment: value,
                  })
                }
              >
                <SelectTrigger
                  data-testid={`select-${question.templateId}-assessment`}
                  className="text-sm"
                >
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="adequate">Adequate</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "multiple-choice":
        return (
          <Select
            value={String(question.response || "")}
            onValueChange={(value) =>
              updateQuestion(question.templateId, "response", value)
            }
          >
            <SelectTrigger
              data-testid={`select-${question.templateId}`}
              className="text-sm"
            >
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checklist":
        const selectedOptions = question.response?.selectedOptions || [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => {
                    const newSelected = e.target.checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter((o: string) => o !== option);
                    updateQuestion(question.templateId, "response", {
                      ...question.response,
                      selectedOptions: newSelected,
                    });
                  }}
                  className="h-4 w-4"
                  data-testid={`checkbox-${question.templateId}-${option}`}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={question.response || ""}
            onChange={(e) =>
              updateQuestion(question.templateId, "response", e.target.value)
            }
            placeholder="Enter a number"
            className="text-sm"
            data-testid={`input-${question.templateId}`}
          />
        );

      default:
        return (
          <Input
            value={question.response || ""}
            onChange={(e) =>
              updateQuestion(question.templateId, "response", e.target.value)
            }
            placeholder="Enter response"
            className="text-sm"
            data-testid={`input-${question.templateId}`}
          />
        );
    }
  };

  // Render question card (multi-question layout like EP wizard)
  const renderQuestionCard = (question: SurveyQuestion, globalIndex: number) => {
    const isExpanded = expandedQuestions[question.templateId];
    const isAnswered = isQuestionCompleted(question);
    const hasNotes = question.notes && question.notes.length > 0;
    const hasEvidence = question.evidence && question.evidence.length > 0;
    
    // Determine if this is an issue (No response for yes-no questions)
    const hasIssue = question.type === "yes-no" && 
      ((question.riskDirection === "negative" && String(question.response || "").toLowerCase() === "yes") ||
       (question.riskDirection !== "negative" && String(question.response || "").toLowerCase() === "no"));

    return (
      <Card
        key={question.templateId}
        data-testid={`question-card-${globalIndex + 1}`}
        className={cn(
          "transition-all ring-2",
          hasIssue 
            ? "border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 ring-blue-300 dark:ring-blue-800"
            : "ring-slate-200 dark:ring-slate-700/50"
        )}
      >
        {/* Question Header */}
        <div
          className="p-3 sm:p-4 cursor-pointer"
          onClick={() => toggleQuestion(question.templateId)}
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
              {globalIndex + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <h3 className="text-xs sm:text-sm font-medium leading-snug">
                  {question.question}
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
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 transition-transform text-muted-foreground",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
              </div>

              {/* Collapsed view - show response inline */}
              {!isExpanded && isAnswered && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  <span className="font-medium">
                    {typeof question.response === 'object' 
                      ? question.response?.textResponse || question.response?.value || ""
                      : question.response || ""}
                  </span>
                  {hasNotes && (
                    <span className="ml-2">
                      • {question.notes?.substring(0, 40)}...
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
            <div className="pl-8 sm:pl-10 space-y-3 sm:space-y-4">
              {/* Standard Reference */}
              {question.standard && (
                <div className="bg-muted/50 p-2 sm:p-3 rounded-md text-xs sm:text-sm">
                  <span className="font-medium text-muted-foreground">Standard: </span>
                  {question.standard}
                </div>
              )}

              {/* Response Field */}
              <div>
                <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Response
                </Label>
                <div className="mt-1.5">
                  {renderQuestionInput(question)}
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Observations & Notes
                </Label>
                {question.notes ? (
                  <Textarea
                    className="mt-1.5 text-xs sm:text-sm resize-none"
                    rows={2}
                    value={question.notes}
                    onChange={(e) => updateQuestion(question.templateId, "notes", e.target.value)}
                    placeholder="Add additional details or context..."
                    data-testid={`textarea-notes-${question.templateId}`}
                  />
                ) : (
                  <button
                    className="mt-1.5 w-full px-3 py-2 sm:py-2.5 border border-dashed rounded-lg text-xs sm:text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-left"
                    onClick={() => updateQuestion(question.templateId, "notes", " ")}
                    data-testid={`button-add-note-${question.templateId}`}
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
                    onClick={() => setShowEvidenceUploader(showEvidenceUploader === question.templateId ? null : question.templateId)}
                    className="h-6 px-2 text-xs"
                    data-testid={`button-toggle-evidence-${question.templateId}`}
                  >
                    <Camera className="w-3 h-3 mr-1" />
                    {hasEvidence ? `${question.evidence?.length} photo${(question.evidence?.length || 0) > 1 ? 's' : ''}` : 'Add'}
                  </Button>
                </div>
                
                {showEvidenceUploader === question.templateId && (
                  <div className="mt-2">
                    <EvidenceUploader
                      assessmentId={assessmentId}
                      questionId={question.dbId || ""}
                      questionType="facility"
                      evidence={question.evidence || []}
                      onUpdate={() => {
                        queryClient.refetchQueries({
                          queryKey: ["/api/assessments", assessmentId, "facility-survey"],
                        });
                      }}
                    />
                  </div>
                )}

                {/* Evidence thumbnails */}
                {hasEvidence && showEvidenceUploader !== question.templateId && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {question.evidence?.slice(0, 3).map((url, imgIdx) => (
                      <div key={imgIdx} className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                        <img src={url} alt={`Evidence ${imgIdx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {(question.evidence?.length || 0) > 3 && (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        +{(question.evidence?.length || 0) - 3}
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

  if (questionsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Loading survey questions...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No questions available for this assessment template.
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b border-t rounded-t-lg">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
            <div>
              <h1 className="text-base sm:text-lg font-semibold">
                {surveyType} Survey
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comprehensive security assessment
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Save Status */}
              <div className="flex items-center gap-2 text-xs">
                {saveStatus === "saving" && (
                  <>
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Saved</span>
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Error</span>
                  </>
                )}
              </div>
              
              {/* Mobile Nav Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setNavOpen(!navOpen)}
                data-testid="button-toggle-nav"
              >
                {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
              {completedQuestions} of {visibleQuestions.length} completed
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar - Category Navigation (Sticky) */}
          <div className={cn(
            "lg:w-64 flex-shrink-0",
            navOpen ? "block" : "hidden lg:block"
          )}>
            <div className="lg:sticky lg:top-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                  <nav className="space-y-1 max-h-[35vh] overflow-y-auto">
                  {categories.map((category) => {
                    const stats = getCategoryStats(category);
                    const isActive = activeCategory === category;
                    const isComplete = stats.completed === stats.total && stats.total > 0;
                    const Icon = getCategoryIcon(category);

                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setActiveCategory(category);
                          setNavOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-between gap-2",
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                        data-testid={`nav-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium truncate capitalize">
                            {category.replace("-", " ")}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0",
                            isComplete
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {stats.completed}/{stats.total}
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
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Category Header */}
            <Card className="mb-4">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold capitalize">
                      {activeCategory.replace("-", " ")}
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
                        ? (getCategoryStats(activeCategory).completed / getCategoryStats(activeCategory).total) * 100
                        : 0
                    }
                    className="flex-1 h-1.5"
                  />
                  <span className="text-xs text-muted-foreground">
                    {getCategoryStats(activeCategory).completed} of {getCategoryStats(activeCategory).total}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Questions grouped by subcategory */}
            {getSubcategories(activeCategory).map((subcategory) => {
              const subcategoryQuestions = getSubcategoryQuestions(activeCategory, subcategory);
              if (subcategoryQuestions.length === 0) return null;

              return (
                <div key={subcategory} className="mb-6" data-testid={`subgroup-${(subcategory || "general").toLowerCase().replace(/\s+/g, "-")}`}>
                  {/* Subcategory Header */}
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {subcategory}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Questions in this subcategory */}
                  <div className="space-y-3">
                    {subcategoryQuestions.map((q) => {
                      const globalIndex = visibleQuestions.findIndex(vq => vq.templateId === q.templateId);
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
                  disabled={progress < 80}
                  className="flex items-center gap-2"
                  data-testid="button-complete-assessment"
                >
                  Complete Survey
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
