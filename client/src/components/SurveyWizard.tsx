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
  Circle,
  Info,
  Camera,
  FileText,
  Menu,
  X,
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
  onSwitchToClassic?: () => void;
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
  onSwitchToClassic,
}: SurveyWizardProps) {
  const surveyType = templateId
    ? SURVEY_TYPE_LABELS[templateId] || "Facility"
    : "Facility";

  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPersisting, setIsPersisting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [notesOpen, setNotesOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
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

  const categories = Array.from(new Set(questions.map((q) => q.category)));

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
    const expectedAnswer = q.showWhenAnswer.toLowerCase();

    return response === expectedAnswer || response.startsWith(expectedAnswer);
  };

  const currentCategoryQuestions = questions
    .filter((q) => q.category === categories[currentCategory])
    .filter(shouldShowQuestion);

  const currentQuestion = currentCategoryQuestions[currentQuestionIndex];

  const isQuestionCompleted = (q: SurveyQuestion): boolean => {
    if (q.conditionalOnQuestionId && q.showWhenAnswer) {
      const prereqQuestion = questions.find(
        (pq) => pq.templateId === q.conditionalOnQuestionId
      );

      if (!prereqQuestion || !prereqQuestion.response) {
        return true;
      }

      const response = String(prereqQuestion.response).toLowerCase();
      const expectedAnswer = q.showWhenAnswer.toLowerCase();
      const matches =
        response === expectedAnswer || response.startsWith(expectedAnswer);

      if (!matches) {
        return true;
      }
    }

    if (!q.response) return false;

    if (q.type === "measurement") {
      if (typeof q.response === "object") {
        return !!(q.response.value && q.response.assessment);
      }
      return false;
    }

    if (q.type === "text") {
      if (typeof q.response === "object") {
        return !!q.response.assessment;
      }
      return false;
    }

    if (q.type === "checklist") {
      if (typeof q.response === "object" && q.response.selectedOptions) {
        return (
          Array.isArray(q.response.selectedOptions) &&
          q.response.selectedOptions.length > 0
        );
      }
      return false;
    }

    if (typeof q.response === "string") {
      return q.response !== "";
    }
    if (typeof q.response === "number") {
      return true;
    }
    return false;
  };

  const completedQuestions = questions.filter(isQuestionCompleted).length;
  const progress =
    questions.length > 0 ? (completedQuestions / questions.length) * 100 : 0;

  // Get completion stats per category
  const getCategoryStats = (category: string) => {
    const categoryQuestions = questions
      .filter((q) => q.category === category)
      .filter(shouldShowQuestion);
    const completed = categoryQuestions.filter(isQuestionCompleted).length;
    return { completed, total: categoryQuestions.length };
  };

  // Get subcategories for a category
  const getSubcategories = (category: string) => {
    return Array.from(
      new Set(
        questions
          .filter((q) => q.category === category)
          .filter(shouldShowQuestion)
          .map((q) => q.subcategory)
      )
    );
  };

  // Get questions for a subcategory
  const getSubcategoryQuestions = (category: string, subcategory: string) => {
    return questions
      .filter((q) => q.category === category && q.subcategory === subcategory)
      .filter(shouldShowQuestion);
  };

  // Autosave mutation
  const autosaveQuestionMutation = useMutation({
    mutationFn: async ({
      question,
      updateData,
    }: {
      question: SurveyQuestion;
      updateData: any;
    }) => {
      const templateId = question.templateId;
      const dbId = templateToDbIdMap.current.get(templateId);

      if (dbId) {
        const response = await fetch(
          `/api/assessments/${assessmentId}/facility-survey-questions/${dbId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          }
        );
        if (!response.ok) throw new Error("Failed to update question");
        return { savedQuestion: await response.json(), templateId };
      } else {
        const questionData = {
          assessmentId,
          templateQuestionId: templateId,
          category: question.category,
          subcategory: question.subcategory,
          question: question.question,
          standard: question.standard,
          type: question.type,
          response: question.response,
          notes: question.notes || "",
          evidence: question.evidence || [],
          recommendations: question.recommendations || [],
          ...updateData,
        };

        const response = await fetch(
          `/api/assessments/${assessmentId}/facility-survey-questions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(questionData),
          }
        );
        if (!response.ok) throw new Error("Failed to create question");
        const savedQuestion = await response.json();

        return { savedQuestion, templateId, isNew: true };
      }
    },
    onSuccess: (data) => {
      const { savedQuestion, templateId, isNew } = data;
      pendingChangesMap.current.delete(templateId);

      if (pendingChangesMap.current.size === 0) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }

      if (isNew && savedQuestion && savedQuestion.id) {
        templateToDbIdMap.current.set(templateId, savedQuestion.id);

        setQuestions((prev) =>
          prev.map((q) =>
            q.templateId === templateId ? { ...q, dbId: savedQuestion.id } : q
          )
        );
      }
    },
    onError: () => {
      setSaveStatus("error");
    },
  });

  const triggerAutosave = useCallback(
    (question: SurveyQuestion, updateData: any) => {
      const templateId = question.templateId;
      pendingChangesMap.current.set(templateId, { question, updateData });
      setSaveStatus("saving");

      const existingTimer = autosaveTimersMap.current.get(templateId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        autosaveQuestionMutation.mutate({ question, updateData });
        autosaveTimersMap.current.delete(templateId);
      }, 1500);

      autosaveTimersMap.current.set(templateId, timer);
    },
    [autosaveQuestionMutation]
  );

  const updateQuestion = (templateId: string, field: string, value: any) => {
    setQuestions((prev) => {
      const updated = prev.map((q) =>
        q.templateId === templateId ? { ...q, [field]: value } : q
      );

      const updatedQuestion = updated.find((q) => q.templateId === templateId);
      if (updatedQuestion) {
        triggerAutosave(updatedQuestion, { [field]: value });
      }

      return updated;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "barriers":
        return Building;
      case "lighting":
        return Lightbulb;
      case "surveillance":
        return Eye;
      case "access-control":
        return Lock;
      case "intrusion-detection":
        return Shield;
      default:
        return Info;
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentCategoryQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setNotesOpen(false);
      setEvidenceOpen(false);
    } else if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
      setCurrentQuestionIndex(0);
      setNotesOpen(false);
      setEvidenceOpen(false);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setNotesOpen(false);
      setEvidenceOpen(false);
    } else if (currentCategory > 0) {
      const prevCategoryQuestions = questions
        .filter((q) => q.category === categories[currentCategory - 1])
        .filter(shouldShowQuestion);
      setCurrentCategory(currentCategory - 1);
      setCurrentQuestionIndex(prevCategoryQuestions.length - 1);
      setNotesOpen(false);
      setEvidenceOpen(false);
    }
  };

  const jumpToQuestion = (categoryIndex: number, questionIndex: number) => {
    setCurrentCategory(categoryIndex);
    setCurrentQuestionIndex(questionIndex);
    setNotesOpen(false);
    setEvidenceOpen(false);
    setNavOpen(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToNextQuestion();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToPrevQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestionIndex, currentCategory, currentCategoryQuestions.length]);

  const renderQuestionInput = (question: SurveyQuestion) => {
    switch (question.type) {
      case "measurement":
        const isCountQuestion = question.question
          .toLowerCase()
          .startsWith("how many");
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`${question.templateId}-value`} className="text-sm">
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
              <Label
                htmlFor={`${question.templateId}-assessment`}
                className="text-sm"
              >
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
              <SelectValue placeholder="Select response" />
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
              rows={3}
              className="text-sm"
              data-testid={`textarea-${question.templateId}`}
            />
            <div className="space-y-2">
              <Label className="text-sm">Assessment</Label>
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

  if (questionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading survey questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No questions available for this assessment template.
      </div>
    );
  }

  const isFirstQuestion = currentCategory === 0 && currentQuestionIndex === 0;
  const isLastQuestion =
    currentCategory === categories.length - 1 &&
    currentQuestionIndex === currentCategoryQuestions.length - 1;

  // Calculate global question position
  let globalQuestionNumber = 0;
  for (let i = 0; i < currentCategory; i++) {
    globalQuestionNumber += questions
      .filter((q) => q.category === categories[i])
      .filter(shouldShowQuestion).length;
  }
  globalQuestionNumber += currentQuestionIndex + 1;

  const totalVisibleQuestions = questions.filter(shouldShowQuestion).length;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Mobile Nav Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden flex items-center gap-2"
        onClick={() => setNavOpen(!navOpen)}
        data-testid="button-toggle-nav"
      >
        {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        {navOpen ? "Close Navigation" : "Show Navigation"}
      </Button>

      {/* Navigation Rail */}
      <div
        className={cn(
          "lg:w-64 shrink-0 overflow-y-auto",
          navOpen ? "block" : "hidden lg:block"
        )}
      >
        <Card className="sticky top-0">
          <CardContent className="p-3 space-y-3">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{surveyType} Survey</span>
                <span className="text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <div className="text-xs text-muted-foreground">
                {completedQuestions} of {questions.length} complete
              </div>
            </div>

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
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-red-600">Save failed</span>
                </>
              )}
            </div>

            {/* Category Navigation */}
            <div className="space-y-1">
              {categories.map((category, catIndex) => {
                const Icon = getCategoryIcon(category);
                const stats = getCategoryStats(category);
                const isCurrentCategory = catIndex === currentCategory;
                const subcategories = getSubcategories(category);

                return (
                  <Collapsible
                    key={category}
                    open={isCurrentCategory}
                    onOpenChange={() => {
                      if (!isCurrentCategory) {
                        setCurrentCategory(catIndex);
                        setCurrentQuestionIndex(0);
                      }
                    }}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md text-left text-sm hover-elevate",
                          isCurrentCategory && "bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="capitalize">
                            {category.replace("-", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              stats.completed === stats.total
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px] px-1.5"
                          >
                            {stats.completed}/{stats.total}
                          </Badge>
                          {isCurrentCategory ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-0.5">
                        {subcategories.map((subcategory) => {
                          const subQuestions = getSubcategoryQuestions(
                            category,
                            subcategory
                          );
                          return (
                            <div key={subcategory} className="space-y-0.5">
                              <div className="text-xs text-muted-foreground px-2 py-1 font-medium">
                                {subcategory}
                              </div>
                              {subQuestions.map((q, qIdx) => {
                                const globalIdx =
                                  currentCategoryQuestions.findIndex(
                                    (cq) => cq.templateId === q.templateId
                                  );
                                const isActive =
                                  isCurrentCategory &&
                                  globalIdx === currentQuestionIndex;
                                const isCompleted = isQuestionCompleted(q);

                                return (
                                  <button
                                    key={q.templateId}
                                    onClick={() =>
                                      jumpToQuestion(catIndex, globalIdx)
                                    }
                                    className={cn(
                                      "w-full flex items-center gap-2 px-2 py-1 rounded text-xs text-left hover-elevate",
                                      isActive && "bg-primary/10 text-primary"
                                    )}
                                    data-testid={`nav-question-${q.templateId}`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                                    ) : (
                                      <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
                                    )}
                                    <span className="truncate">
                                      Q{globalIdx + 1}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            {/* Switch to Classic View */}
            {onSwitchToClassic && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={onSwitchToClassic}
                data-testid="button-switch-classic"
              >
                Switch to Classic View
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Question Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {currentQuestion && (
          <>
            {/* Question Header */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {categories[currentCategory]
                      ?.replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {currentQuestion.subcategory}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Question {globalQuestionNumber} of {totalVisibleQuestions}
                </div>
              </div>

              {/* Category Progress */}
              <div className="flex items-center gap-2">
                <Progress
                  value={
                    ((currentQuestionIndex + 1) /
                      currentCategoryQuestions.length) *
                    100
                  }
                  className="h-1 flex-1"
                />
                <span className="text-xs text-muted-foreground">
                  {currentQuestionIndex + 1}/{currentCategoryQuestions.length} in
                  section
                </span>
              </div>
            </div>

            {/* Question Card */}
            <Card className="flex-1">
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Question Text */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold leading-snug">
                    {currentQuestion.question}
                  </h3>

                  {/* Standard Reference */}
                  {currentQuestion.standard && (
                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                      <span className="font-medium text-muted-foreground">
                        Standard:{" "}
                      </span>
                      {currentQuestion.standard}
                    </div>
                  )}
                </div>

                {/* Response Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Your Response</Label>
                  {renderQuestionInput(currentQuestion)}
                </div>

                {/* Collapsible Notes */}
                <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      data-testid="button-toggle-notes"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Notes & Observations</span>
                        {currentQuestion.notes && (
                          <Badge variant="secondary" className="text-[10px]">
                            Has notes
                          </Badge>
                        )}
                      </div>
                      {notesOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <Textarea
                      value={currentQuestion.notes || ""}
                      onChange={(e) =>
                        updateQuestion(
                          currentQuestion.templateId,
                          "notes",
                          e.target.value
                        )
                      }
                      placeholder="Document specific observations, conditions, or concerns..."
                      rows={3}
                      className="text-sm"
                      data-testid={`textarea-${currentQuestion.templateId}-notes`}
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* Collapsible Evidence */}
                <Collapsible open={evidenceOpen} onOpenChange={setEvidenceOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      data-testid="button-toggle-evidence"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        <span>Photo Evidence</span>
                        {currentQuestion.evidence &&
                          currentQuestion.evidence.length > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              {currentQuestion.evidence.length} photo
                              {currentQuestion.evidence.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                      </div>
                      {evidenceOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <EvidenceUploader
                      assessmentId={assessmentId}
                      questionId={currentQuestion.dbId || ""}
                      questionType="facility"
                      evidence={currentQuestion.evidence || []}
                      onUpdate={() =>
                        queryClient.invalidateQueries({
                          queryKey: [
                            "/api/assessments",
                            assessmentId,
                            "facility-survey",
                          ],
                        })
                      }
                    />
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={goToPrevQuestion}
                disabled={isFirstQuestion}
                className="flex items-center gap-2"
                data-testid="button-prev-question"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                {isLastQuestion ? (
                  <Button
                    onClick={onComplete}
                    disabled={progress < 80}
                    className="flex items-center gap-2"
                    data-testid="button-complete-survey"
                  >
                    <Save className="h-4 w-4" />
                    Complete Survey
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextQuestion}
                    className="flex items-center gap-2"
                    data-testid="button-next-question"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="text-center text-xs text-muted-foreground mt-2 hidden sm:block">
              Use arrow keys to navigate between questions
            </div>
          </>
        )}
      </div>
    </div>
  );
}
