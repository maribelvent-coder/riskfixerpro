import { useState } from "react";
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
  Camera
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { FacilitySurveyQuestion } from "@shared/schema";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ExecutiveSurveyQuestionsProps {
  assessmentId: string;
  sectionCategory?: string; // Optional filter by category
  onComplete?: () => void;
}

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

export default function ExecutiveSurveyQuestions({ assessmentId, sectionCategory, onComplete }: ExecutiveSurveyQuestionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Fetch questions
  const { data: questions, isLoading } = useQuery<FacilitySurveyQuestion[]>({
    queryKey: ['/api/assessments', assessmentId, 'facility-survey-questions'],
  });

  // Filter by section category if provided
  const filteredQuestions = questions?.filter(q => 
    !sectionCategory || q.category === sectionCategory
  ) || [];

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
  }, {} as Record<string, Record<string, FacilitySurveyQuestion[]>>);

  // Calculate progress
  const totalQuestions = filteredQuestions.length;
  const answeredQuestions = filteredQuestions.filter(q => q.response || q.notes).length;
  const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: Partial<FacilitySurveyQuestion> }) => {
      const response = await fetch(`/api/assessments/${assessmentId}/facility-survey-questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', assessmentId, 'facility-survey-questions'] });
      toast({
        title: "Saved",
        description: "Question response updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
    },
  });

  // Render input based on question type
  const renderInput = (question: FacilitySurveyQuestion) => {
    const handleSave = (field: keyof FacilitySurveyQuestion, value: any) => {
      updateQuestionMutation.mutate({
        questionId: question.id,
        data: { [field]: value }
      });
    };

    switch (question.type) {
      case 'yes-no':
        return (
          <div className="space-y-2">
            <RadioGroup
              value={question.response as string || ''}
              onValueChange={(value) => handleSave('response', value)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`${question.id}-yes`} data-testid={`radio-yes-${question.id}`} />
                  <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`${question.id}-no`} data-testid={`radio-no-${question.id}`} />
                  <Label htmlFor={`${question.id}-no`}>No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="n/a" id={`${question.id}-na`} data-testid={`radio-na-${question.id}`} />
                  <Label htmlFor={`${question.id}-na`}>N/A</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );
      
      case 'rating':
        return (
          <div className="space-y-2">
            <RadioGroup
              value={question.response as string || ''}
              onValueChange={(value) => handleSave('response', value)}
            >
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-1">
                    <RadioGroupItem value={String(rating)} id={`${question.id}-${rating}`} data-testid={`radio-rating-${rating}-${question.id}`} />
                    <Label htmlFor={`${question.id}-${rating}`}>{rating}</Label>
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
            value={question.response as string || ''}
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Assessment Progress</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {answeredQuestions} of {totalQuestions} questions completed
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {Math.round(progressPercent)}%
            </Badge>
          </div>
          <Progress value={progressPercent} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Questions by Category */}
      {Object.entries(groupedQuestions).map(([category, subcategories]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {Object.entries(subcategories).map(([subcategory, questions]) => (
                <AccordionItem key={subcategory} value={subcategory}>
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
                              value={question.notes || ''}
                              onChange={(e) => {
                                const value = e.target.value;
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
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      {/* Complete Button */}
      {onComplete && progressPercent === 100 && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-semibold">Assessment Complete</h4>
                  <p className="text-sm text-muted-foreground">All questions have been answered</p>
                </div>
              </div>
              <Button onClick={onComplete} data-testid="button-complete-section">
                Mark Section Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
