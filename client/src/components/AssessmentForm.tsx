import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Camera, Save, Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { AssessmentQuestion } from "@shared/schema";

interface Question {
  id: string;
  category: string;
  question: string;
  type: "yes-no" | "score" | "text";
  weight: number;
  response?: boolean | number | string;
  evidence?: File[];
  notes?: string;
}

const mockQuestions: Question[] = [
  {
    id: "ac-001",
    category: "Access Control",
    question: "Are all entry points secured with appropriate locking mechanisms?",
    type: "yes-no",
    weight: 5
  },
  {
    id: "ac-002", 
    category: "Access Control",
    question: "Rate the effectiveness of visitor management systems (1-10)",
    type: "score",
    weight: 4
  },
  {
    id: "ps-001",
    category: "Perimeter Security",
    question: "Describe the current fencing and barriers around the facility",
    type: "text",
    weight: 3
  },
  {
    id: "ps-002",
    category: "Perimeter Security", 
    question: "Are perimeter lighting systems adequate for night-time security?",
    type: "yes-no",
    weight: 4
  },
];

interface AssessmentFormProps {
  assessmentId: string;
  title?: string;
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
}

export function AssessmentForm({ 
  assessmentId,
  title = "Physical Security Assessment",
  onSave,
  onSubmit 
}: AssessmentFormProps) {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [currentSection, setCurrentSection] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load existing questions if assessment exists
  const { data: assessment } = useQuery({
    queryKey: ["/api/assessments", assessmentId],
    queryFn: () => assessmentApi.getById(assessmentId),
    enabled: !!assessmentId && assessmentId !== "new",
  });

  // Save questions mutation
  const saveQuestionsMutation = useMutation({
    mutationFn: (questionsData: any[]) => 
      assessmentApi.saveQuestions(assessmentId, questionsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId] });
      toast({
        title: "Progress Saved",
        description: "Your assessment answers have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: `Failed to save progress: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Load existing questions data when assessment is loaded
  useEffect(() => {
    if (assessment?.questions && assessment.questions.length > 0) {
      const loadedQuestions = questions.map(defaultQuestion => {
        const existingQuestion = assessment.questions.find(
          q => q.questionId === defaultQuestion.id
        );
        
        if (existingQuestion) {
          return {
            ...defaultQuestion,
            response: existingQuestion.response,
            notes: existingQuestion.notes || "",
            evidence: existingQuestion.evidence || []
          };
        }
        
        return defaultQuestion;
      });
      
      setQuestions(loadedQuestions);
    }
  }, [assessment]);
  
  const categories = Array.from(new Set(questions.map(q => q.category)));
  const currentCategory = categories[currentSection];
  const currentQuestions = questions.filter(q => q.category === currentCategory);
  
  const answeredQuestions = questions.filter(q => 
    q.response !== undefined && q.response !== ""
  ).length;
  const progress = (answeredQuestions / questions.length) * 100;

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
    console.log(`Updated question ${id}: ${field} = ${value}`);
  };

  const handleSave = () => {
    const questionsData = questions.map(q => ({
      questionId: q.id,
      assessmentId,
      category: q.category,
      question: q.question,
      type: q.type,
      weight: q.weight,
      response: q.response,
      notes: q.notes,
      evidence: q.evidence
    }));

    saveQuestionsMutation.mutate(questionsData);
    onSave?.(questions);
  };

  const handleSubmit = () => {
    const questionsData = questions.map(q => ({
      questionId: q.id,
      assessmentId,
      category: q.category,
      question: q.question,
      type: q.type,
      weight: q.weight,
      response: q.response,
      notes: q.notes,
      evidence: q.evidence
    }));

    saveQuestionsMutation.mutate(questionsData);
    onSubmit?.(questions);
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Badge variant="secondary" data-testid="badge-progress">
              {answeredQuestions}/{questions.length} completed
            </Badge>
          </div>
          <Progress value={progress} className="mt-2" data-testid="progress-assessment" />
        </CardHeader>
      </Card>

      {/* Category Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category, index) => {
          const categoryQuestions = questions.filter(q => q.category === category);
          const categoryAnswered = categoryQuestions.filter(q => 
            q.response !== undefined && q.response !== ""
          ).length;
          const isComplete = categoryAnswered === categoryQuestions.length;
          
          return (
            <Button
              key={category}
              variant={currentSection === index ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentSection(index)}
              data-testid={`button-category-${category.toLowerCase().replace(' ', '-')}`}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {isComplete && <CheckCircle className="h-3 w-3" />}
              {category} ({categoryAnswered}/{categoryQuestions.length})
            </Button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {currentQuestions.map((question) => (
          <Card key={question.id} data-testid={`card-question-${question.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{question.question}</CardTitle>
                <Badge variant="secondary">Weight: {question.weight}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Response Input */}
              {question.type === "yes-no" && (
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.id}-yes`}
                      checked={question.response === true}
                      onCheckedChange={(checked) => 
                        updateQuestion(question.id, "response", checked ? true : undefined)
                      }
                      data-testid={`checkbox-${question.id}-yes`}
                    />
                    <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.id}-no`}
                      checked={question.response === false}
                      onCheckedChange={(checked) => 
                        updateQuestion(question.id, "response", checked ? false : undefined)
                      }
                      data-testid={`checkbox-${question.id}-no`}
                    />
                    <Label htmlFor={`${question.id}-no`}>No</Label>
                  </div>
                </div>
              )}

              {question.type === "score" && (
                <div className="space-y-2">
                  <Label htmlFor={`${question.id}-score`}>Score (1-10)</Label>
                  <Input
                    id={`${question.id}-score`}
                    type="number"
                    min="1"
                    max="10"
                    value={question.response?.toString() || ""}
                    onChange={(e) => updateQuestion(question.id, "response", parseInt(e.target.value) || undefined)}
                    data-testid={`input-${question.id}-score`}
                  />
                </div>
              )}

              {question.type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor={`${question.id}-text`}>Response</Label>
                  <Textarea
                    id={`${question.id}-text`}
                    value={question.response?.toString() || ""}
                    onChange={(e) => updateQuestion(question.id, "response", e.target.value)}
                    data-testid={`textarea-${question.id}-text`}
                    rows={3}
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor={`${question.id}-notes`}>Additional Notes</Label>
                <Textarea
                  id={`${question.id}-notes`}
                  value={question.notes || ""}
                  onChange={(e) => updateQuestion(question.id, "notes", e.target.value)}
                  placeholder="Optional notes about this assessment point..."
                  data-testid={`textarea-${question.id}-notes`}
                  rows={2}
                />
              </div>

              {/* Evidence Upload */}
              <div className="space-y-2">
                <Label>Photographic Evidence</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("Upload photo evidence for", question.id)}
                  data-testid={`button-upload-${question.id}`}
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Add Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleSave}
            disabled={saveQuestionsMutation.isPending}
            data-testid="button-save-draft"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveQuestionsMutation.isPending ? "Saving..." : "Save Draft"}
          </Button>
        </div>
        
        <div className="flex gap-2">
          {currentSection > 0 && (
            <Button 
              variant="outline"
              onClick={() => setCurrentSection(prev => prev - 1)}
              data-testid="button-previous-section"
            >
              Previous
            </Button>
          )}
          
          {currentSection < categories.length - 1 ? (
            <Button 
              onClick={() => setCurrentSection(prev => prev + 1)}
              data-testid="button-next-section"
            >
              Next Section
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={progress < 80}
              data-testid="button-submit-assessment"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}