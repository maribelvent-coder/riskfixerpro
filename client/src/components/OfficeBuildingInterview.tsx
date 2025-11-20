import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Save,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AssessmentQuestion } from "@shared/schema";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OfficeBuildingInterviewProps {
  assessmentId: string;
  onComplete?: () => void;
}

// Section definitions matching the 13-section office building questionnaire structure
const SECTION_DEFINITIONS = [
  { section: 1, title: "Perimeter Security & CPTED", icon: Shield },
  { section: 2, title: "Access Control Systems", icon: Shield },
  { section: 3, title: "Building Entry & Reception", icon: Shield },
  { section: 4, title: "Interior Security", icon: Shield },
  { section: 5, title: "Surveillance & Monitoring", icon: Shield },
  { section: 6, title: "Key & Lock Management", icon: Shield },
  { section: 7, title: "Workplace Violence Prevention", icon: AlertTriangle },
  { section: 8, title: "Active Threat Preparedness", icon: AlertTriangle },
  { section: 9, title: "Cyber-Physical Security", icon: Shield },
  { section: 10, title: "Espionage & Insider Threat", icon: AlertTriangle },
  { section: 11, title: "Mail Room & Package Handling", icon: Shield },
  { section: 12, title: "Parking & Transportation", icon: Shield },
  { section: 13, title: "Emergency & Continuity", icon: CheckCircle }
];

export default function OfficeBuildingInterview({ assessmentId, onComplete }: OfficeBuildingInterviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Fetch questions
  const { data: questions = [], isLoading, error: fetchError } = useQuery<AssessmentQuestion[]>({
    queryKey: ['/api/assessments', assessmentId, 'assessment-questions'],
  });

  // Validate that questions are from office-building template
  const hasValidQuestions = questions.length > 0;
  const hasOfficeStructure = questions.length >= 80; // Office building should have ~91 questions
  
  // Log warning if data structure looks incorrect
  useEffect(() => {
    if (hasValidQuestions && !hasOfficeStructure) {
      console.warn(
        `Office Building Interview: Expected ~91 questions but got ${questions.length}. ` +
        `This may not be an office-building assessment.`
      );
    }
  }, [hasValidQuestions, hasOfficeStructure, questions.length]);

  // Auto-save mutation
  const autosaveQuestionMutation = useMutation({
    mutationFn: async ({ questionId, updateData }: { questionId: string; updateData: Partial<AssessmentQuestion> }) => {
      const response = await apiRequest("PATCH", `/api/assessments/${assessmentId}/assessment-questions/${questionId}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      // Silent success - no toast for autosave
    },
    onError: (error) => {
      console.error("Autosave failed:", error);
    },
  });

  // Debounced autosave
  const autosaveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const triggerAutosave = useCallback((questionId: string, updateData: Partial<AssessmentQuestion>) => {
    if (autosaveTimeoutRef.current[questionId]) {
      clearTimeout(autosaveTimeoutRef.current[questionId]);
    }
    autosaveTimeoutRef.current[questionId] = setTimeout(() => {
      autosaveQuestionMutation.mutate({ questionId, updateData });
    }, 1500);
  }, [autosaveQuestionMutation]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(autosaveTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  // Group questions by section (extracted from questionId like "1.1", "2.3", etc.)
  // Safe parsing with fallback to section 0 for malformed IDs
  const questionsBySection = questions.reduce((acc, q) => {
    let sectionNum = 0;
    if (q.questionId) {
      const parts = q.questionId.split('.');
      const parsed = parseInt(parts[0]);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 13) {
        sectionNum = parsed;
      } else {
        console.warn(`Office Building Interview: Invalid questionId format "${q.questionId}" - expected format like "1.1" or "2.3"`);
      }
    }
    if (!acc[sectionNum]) acc[sectionNum] = [];
    acc[sectionNum].push(q);
    return acc;
  }, {} as Record<number, AssessmentQuestion[]>);

  // Calculate section progress
  const getSectionProgress = (sectionNum: number) => {
    const sectionQuestions = questionsBySection[sectionNum] || [];
    if (sectionQuestions.length === 0) return 0;
    const answered = sectionQuestions.filter(q => q.response !== null && q.response !== '').length;
    return Math.round((answered / sectionQuestions.length) * 100);
  };

  // Calculate overall progress
  const overallProgress = questions.length > 0
    ? Math.round((questions.filter(q => q.response !== null && q.response !== '').length / questions.length) * 100)
    : 0;

  // Render question input based on type
  const renderQuestionInput = (question: AssessmentQuestion) => {
    const handleUpdate = (field: string, value: any) => {
      triggerAutosave(question.id, { [field]: value });
    };

    switch (question.type) {
      case 'yes-no':
        return (
          <RadioGroup
            value={question.response?.toString() || ''}
            onValueChange={(value) => handleUpdate('response', value)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} data-testid={`radio-${question.questionId}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}-no`} data-testid={`radio-${question.questionId}-no`} />
                <Label htmlFor={`${question.id}-no`} className="cursor-pointer">No</Label>
              </div>
            </div>
          </RadioGroup>
        );

      case 'rating':
        return (
          <div className="space-y-2">
            <RadioGroup
              value={question.response?.toString() || ''}
              onValueChange={(value) => handleUpdate('response', value)}
            >
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-1">
                    <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} data-testid={`radio-${question.questionId}-${rating}`} />
                    <Label htmlFor={`${question.id}-${rating}`} className="cursor-pointer text-sm">{rating}</Label>
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
            value={question.response?.toString() || ''}
            onChange={(e) => handleUpdate('response', e.target.value)}
            placeholder="Enter your response..."
            className="min-h-[80px]"
            data-testid={`textarea-${question.questionId}`}
          />
        );
    }
  };

  // Render risk indicators
  const renderRiskIndicators = (question: AssessmentQuestion) => {
    if (!question.rationale) return null;

    return (
      <div className="mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded-md">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-destructive">High Risk Indicator:</p>
            <p className="text-xs text-muted-foreground mt-1">{question.rationale}</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading interview questions...</div>
        </CardContent>
      </Card>
    );
  }

  // Error state - API fetch failed
  if (fetchError) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm font-medium text-destructive">Failed to load interview questions</p>
            <p className="text-xs text-muted-foreground">
              Error: {(fetchError as Error).message || 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validation warning - questions loaded but may not be office-building template
  if (hasValidQuestions && !hasOfficeStructure) {
    return (
      <Card className="border-yellow-500">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Incomplete Office Building Questionnaire</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expected ~91 questions for office building assessment, but only {questions.length} found. 
                  This assessment may not be using the office-building template, or questions haven't been seeded yet.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                To fix this, ensure the assessment was created with <code className="px-1 py-0.5 bg-muted rounded text-xs">templateId='office-building'</code> and
                that the office building questions have been seeded.
              </p>
              <Button
                variant="outline"
                onClick={() => toast({
                  title: "Template Information",
                  description: `This assessment has templateId: ${assessmentId.slice(0, 20)}... | Questions: ${questions.length}`,
                })}
                className="w-full sm:w-auto"
              >
                Show Template Info
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - no questions found
  if (!hasValidQuestions) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Info className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium">No Questions Found</p>
            <p className="text-xs text-muted-foreground">
              This assessment doesn't have any interview questions yet. 
              Ensure the assessment was created from the office-building template.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSectionQuestions = questionsBySection[currentSection] || [];
  const currentSectionDef = SECTION_DEFINITIONS.find(s => s.section === currentSection);

  // Group current section questions by category
  const questionsByCategory = currentSectionQuestions.reduce((acc, q) => {
    const category = q.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(q);
    return acc;
  }, {} as Record<string, AssessmentQuestion[]>);

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">Office Building Security Interview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete all {questions.length} questions across 13 security domains
              </p>
            </div>
            <Badge variant={overallProgress === 100 ? "default" : "secondary"} className="ml-2">
              {overallProgress}% Complete
            </Badge>
          </div>
          <Progress value={overallProgress} className="mt-3" />
        </CardHeader>
      </Card>

      {/* Section Navigation Tabs */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="flex space-x-1 px-3 sm:px-0 min-w-max sm:min-w-0">
              {SECTION_DEFINITIONS.map((section) => {
                const progress = getSectionProgress(section.section);
                const isActive = currentSection === section.section;
                return (
                  <Button
                    key={section.section}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentSection(section.section)}
                    className="flex-shrink-0 text-xs"
                    data-testid={`button-section-${section.section}`}
                  >
                    <span className="font-semibold mr-1">{section.section}</span>
                    {progress > 0 && <CheckCircle className="w-3 h-3 ml-1" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Section Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {currentSectionDef && <currentSectionDef.icon className="w-5 h-5 text-primary flex-shrink-0" />}
              <CardTitle className="text-base sm:text-lg truncate">
                Section {currentSection}: {currentSectionDef?.title}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {getSectionProgress(currentSection)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {currentSectionQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No questions in this section</p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={expandedCategories}
              onValueChange={setExpandedCategories}
              className="space-y-2"
            >
              {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                <AccordionItem key={category} value={category} className="border rounded-md">
                  <AccordionTrigger className="px-4 py-2 hover:no-underline hover-elevate" data-testid={`accordion-${category.replace(/\s+/g, '-').toLowerCase()}`}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{category}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {categoryQuestions.filter(q => q.response !== null && q.response !== '').length}/{categoryQuestions.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                    {categoryQuestions.map((question) => (
                      <div key={question.id} className="space-y-3 p-3 border rounded-md bg-card" data-testid={`question-${question.questionId}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Label className="text-sm font-medium flex items-start gap-2">
                              <span className="text-xs text-muted-foreground flex-shrink-0">{question.questionId}</span>
                              <span className="flex-1">{question.question}</span>
                            </Label>
                            {question.bestPractice && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                                <Info className="w-3 h-3 inline mr-1" />
                                {question.bestPractice}
                              </div>
                            )}
                          </div>
                          {question.importance && (
                            <Badge
                              variant={question.importance === 'Critical' ? 'destructive' : 'default'}
                              className="text-xs flex-shrink-0"
                            >
                              {question.importance}
                            </Badge>
                          )}
                        </div>

                        {renderQuestionInput(question)}
                        {renderRiskIndicators(question)}

                        {/* Notes */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
                          <Input
                            value={question.notes || ''}
                            onChange={(e) => triggerAutosave(question.id, { notes: e.target.value })}
                            placeholder="Add any additional notes..."
                            className="text-sm"
                            data-testid={`input-notes-${question.questionId}`}
                          />
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Section Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(prev => Math.max(1, prev - 1))}
              disabled={currentSection === 1}
              data-testid="button-previous-section"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Section {currentSection} of {SECTION_DEFINITIONS.length}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentSection(prev => Math.min(SECTION_DEFINITIONS.length, prev + 1))}
              disabled={currentSection === SECTION_DEFINITIONS.length}
              data-testid="button-next-section"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Action */}
      {overallProgress === 100 && onComplete && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Interview Complete!</p>
                  <p className="text-xs text-muted-foreground">
                    All questions answered. Proceed to risk analysis.
                  </p>
                </div>
              </div>
              <Button onClick={onComplete} className="flex-shrink-0" data-testid="button-complete-interview">
                Continue to Risk Analysis
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
