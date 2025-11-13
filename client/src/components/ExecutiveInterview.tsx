import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, Shield, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ExecutiveInterviewQuestion, ExecutiveInterviewResponse } from "@shared/schema";

interface ExecutiveInterviewProps {
  assessmentId: string;
  onComplete?: () => void;
}

export default function ExecutiveInterview({ assessmentId, onComplete }: ExecutiveInterviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [localResponses, setLocalResponses] = useState<Record<string, { yesNoResponse?: boolean; textResponse?: string }>>({});
  
  // Track if we've initialized from server data
  const initializedRef = useRef(false);
  
  // Store debounce timers per question
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Always track the latest responses in a ref to avoid stale closures
  const latestResponsesRef = useRef<Record<string, { yesNoResponse?: boolean; textResponse?: string }>>({});

  // Fetch interview questions
  const { data: questions, isLoading: questionsLoading } = useQuery<ExecutiveInterviewQuestion[]>({
    queryKey: ['/api/assessments', assessmentId, 'executive-interview', 'questions'],
  });

  // Fetch existing responses
  const { data: responses, isLoading: responsesLoading } = useQuery<ExecutiveInterviewResponse[]>({
    queryKey: ['/api/assessments', assessmentId, 'executive-interview', 'responses'],
  });

  // Initialize local responses ONLY on first load - prevent wiping user edits
  useEffect(() => {
    if (responses && questions && !initializedRef.current) {
      const responsesMap: Record<string, { yesNoResponse?: boolean; textResponse?: string }> = {};
      responses.forEach(r => {
        responsesMap[r.questionId] = {
          yesNoResponse: r.yesNoResponse ?? undefined,
          textResponse: r.textResponse ?? undefined
        };
      });
      setLocalResponses(responsesMap);
      latestResponsesRef.current = responsesMap; // Keep ref in sync
      initializedRef.current = true;
    }
  }, [responses, questions]);

  // Auto-save mutation
  const saveResponseMutation = useMutation({
    mutationFn: async ({ questionId, yesNoResponse, textResponse }: { 
      questionId: string; 
      yesNoResponse?: boolean; 
      textResponse?: string 
    }) => {
      return apiRequest(
        'POST',
        `/api/assessments/${assessmentId}/executive-interview/responses`,
        { questionId, yesNoResponse, textResponse }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/assessments', assessmentId, 'executive-interview', 'responses'] 
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save response. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle yes/no response change
  const handleYesNoChange = (questionId: string, value: boolean) => {
    const updatedResponses = {
      ...latestResponsesRef.current,
      [questionId]: { ...latestResponsesRef.current[questionId], yesNoResponse: value }
    };
    
    // Update both state and ref
    setLocalResponses(updatedResponses);
    latestResponsesRef.current = updatedResponses;
    
    // Save immediately (yes/no changes are not debounced)
    saveResponseMutation.mutate({
      questionId,
      yesNoResponse: value,
      textResponse: updatedResponses[questionId]?.textResponse
    });
  };

  // Handle text response change with ref-based debounce
  const handleTextChange = (questionId: string, value: string) => {
    // Update both state and ref immediately for UI responsiveness
    const updatedResponses = {
      ...latestResponsesRef.current,
      [questionId]: { ...latestResponsesRef.current[questionId], textResponse: value }
    };
    
    setLocalResponses(updatedResponses);
    latestResponsesRef.current = updatedResponses;
    
    // Clear existing timer for this question
    if (debounceTimersRef.current[questionId]) {
      clearTimeout(debounceTimersRef.current[questionId]);
    }
    
    // Set new timer to auto-save after 1 second of inactivity
    debounceTimersRef.current[questionId] = setTimeout(() => {
      // Read from ref to get the latest state (avoids stale closure bug)
      const latestData = latestResponsesRef.current[questionId];
      saveResponseMutation.mutate({
        questionId,
        yesNoResponse: latestData?.yesNoResponse,
        textResponse: latestData?.textResponse
      });
      // Clean up timer after firing
      delete debounceTimersRef.current[questionId];
    }, 1000);
  };
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Group questions by category
  const groupedQuestions = questions?.reduce((acc, question) => {
    const category = question.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(question);
    return acc;
  }, {} as Record<string, ExecutiveInterviewQuestion[]>) || {};

  // Calculate progress
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => {
    const response = localResponses[q.id];
    if (q.responseType === 'yes-no-text') {
      return response?.yesNoResponse !== undefined || response?.textResponse;
    }
    return response?.textResponse;
  }).length || 0;
  const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  if (questionsLoading || responsesLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Executive Interview
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Conduct a comprehensive interview with the executive to gather critical security information
              </p>
            </div>
            <Badge variant={progressPercent === 100 ? "default" : "secondary"}>
              {answeredQuestions} / {totalQuestions} Questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>
        </CardContent>
      </Card>

      {/* Interview Questions */}
      <Accordion 
        type="multiple" 
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="space-y-4"
      >
        {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => {
          const categoryAnswered = categoryQuestions.filter(q => {
            const response = localResponses[q.id];
            if (q.responseType === 'yes-no-text') {
              return response?.yesNoResponse !== undefined || response?.textResponse;
            }
            return response?.textResponse;
          }).length;
          
          return (
            <AccordionItem key={category} value={category} className="border rounded-lg">
              <AccordionTrigger 
                className="px-6 hover:no-underline hover-elevate"
                data-testid={`accordion-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryAnswered} / {categoryQuestions.length}
                    </Badge>
                  </div>
                  {categoryAnswered === categoryQuestions.length && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-4 pb-6">
                <div className="space-y-6">
                  {categoryQuestions
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((question, index) => {
                      const response = localResponses[question.id] || {};
                      
                      return (
                        <div key={question.id} className="space-y-3 pb-6 border-b last:border-b-0">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">
                              Q{question.questionNumber}
                            </Badge>
                            <div className="flex-1 space-y-3">
                              <Label className="text-base font-normal leading-relaxed">
                                {question.question}
                              </Label>
                              
                              {question.responseType === 'yes-no-text' && (
                                <div className="space-y-3">
                                  <RadioGroup
                                    value={response.yesNoResponse === undefined ? "" : response.yesNoResponse ? "yes" : "no"}
                                    onValueChange={(value) => handleYesNoChange(question.id, value === "yes")}
                                    data-testid={`radio-question-${question.questionNumber}`}
                                  >
                                    <div className="flex items-center gap-6">
                                      <div className="flex items-center gap-2">
                                        <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                                        <Label htmlFor={`${question.id}-yes`} className="font-normal cursor-pointer">
                                          Yes
                                        </Label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <RadioGroupItem value="no" id={`${question.id}-no`} />
                                        <Label htmlFor={`${question.id}-no`} className="font-normal cursor-pointer">
                                          No
                                        </Label>
                                      </div>
                                    </div>
                                  </RadioGroup>
                                </div>
                              )}
                              
                              <Textarea
                                placeholder={question.responseType === 'yes-no-text' 
                                  ? "Add additional details or context..."
                                  : "Enter your response..."}
                                value={response.textResponse || ""}
                                onChange={(e) => handleTextChange(question.id, e.target.value)}
                                className="min-h-[100px] resize-none"
                                data-testid={`textarea-question-${question.questionNumber}`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Completion Message */}
      {progressPercent === 100 && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Interview Complete</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All questions have been answered. You can now proceed to the next phase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
