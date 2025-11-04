import { useState, useEffect, useRef } from "react";
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

interface FacilitySurveyProps {
  assessmentId: string;
  onComplete?: () => void;
}

interface SurveyQuestion {
  id: string;
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

// Professional facility survey questions based on CPP presentation and Army FM standards
const facilityQuestions: SurveyQuestion[] = [
  // BARRIERS & PERIMETER
  {
    id: "barriers-004",
    category: "barriers", 
    subcategory: "perimeter-fencing",
    question: "Describe the current fencing and barriers around the facility",
    standard: "Perimeter protection and barrier effectiveness assessment",
    type: "condition",
  },
  {
    id: "barriers-001",
    category: "barriers",
    subcategory: "perimeter-fencing",
    question: "What is the height and condition of perimeter fencing?",
    standard: "ASIS Standard: Minimum 7-foot chain link with 3-strand barbed wire topping",
    type: "measurement",
  },
  {
    id: "barriers-002", 
    category: "barriers",
    subcategory: "gates-access",
    question: "Are vehicle and pedestrian gates properly secured with adequate locking mechanisms?",
    standard: "Access control performance standards - balanced design principle",
    type: "condition",
  },
  {
    id: "barriers-003",
    category: "barriers", 
    subcategory: "walls-structure",
    question: "What is the condition of building walls, windows, and structural barriers?",
    standard: "Physical protection system structural integrity requirements",
    type: "condition",
  },

  // LIGHTING SYSTEMS
  {
    id: "lighting-001",
    category: "lighting",
    subcategory: "perimeter",
    question: "Measure lighting levels at critical perimeter areas (foot-candles)",
    standard: "CPP Standard: Detection 0.5fc, Recognition 1.0fc, Identification 2.0fc",
    type: "measurement",
  },
  {
    id: "lighting-002",
    category: "lighting", 
    subcategory: "parking",
    question: "What are the lighting levels in parking areas?",
    standard: "5 fc with uniformity ratio of 4:1 maximum for parking structures",
    type: "measurement",
  },
  {
    id: "lighting-003",
    category: "lighting",
    subcategory: "emergency",
    question: "Are emergency lighting systems operational and properly maintained?",
    standard: "Life safety codes and backup power requirements",
    type: "condition",
  },
  {
    id: "lighting-004",
    category: "lighting",
    subcategory: "perimeter",
    question: "Are perimeter lighting systems adequate for night-time security?",
    standard: "Perimeter lighting coverage and illumination standards",
    type: "condition",
  },

  // SURVEILLANCE SYSTEMS
  {
    id: "surveillance-001",
    category: "surveillance",
    subcategory: "camera-coverage",
    question: "Assess camera field of view and coverage gaps",
    standard: "Identify blind spots and coverage gaps in surveillance system",
    type: "condition",
  },
  {
    id: "surveillance-002",
    category: "surveillance",
    subcategory: "camera-resolution",
    question: "What is the camera resolution at critical detection points (Pixels per foot)?",
    standard: "CPP Standards: 35 Px/ft for recognition, 46 Px/ft for identification, 70 Px/ft for license plates",
    type: "measurement",
  },
  {
    id: "surveillance-003",
    category: "surveillance",
    subcategory: "monitoring",
    question: "Is there 24/7 monitoring capability and recording retention?",
    standard: "Continuous monitoring and adequate storage capacity requirements",
    type: "yes-no",
  },

  // ACCESS CONTROL
  {
    id: "access-001",
    category: "access-control",
    subcategory: "entry-points",
    question: "What types of access control systems are installed at entry points?", 
    standard: "Entry control performance and redundancy requirements",
    type: "condition",
  },
  {
    id: "access-002",
    category: "access-control",
    subcategory: "doors-locks",
    question: "Assess the condition and security rating of doors and locking mechanisms",
    standard: "Balanced design: each barrier element should provide equal delay",
    type: "condition",
  },
  {
    id: "access-004",
    category: "access-control",
    subcategory: "entry-points", 
    question: "Are all entry points secured with appropriate locking mechanisms?",
    standard: "Entry point security and redundant locking systems",
    type: "condition",
  },
  {
    id: "access-003",
    category: "access-control",
    subcategory: "visitor-management", 
    question: "What visitor screening and management processes are in place?",
    standard: "Identity verification and background screening capabilities",
    type: "condition",
  },
  {
    id: "access-005",
    category: "access-control",
    subcategory: "visitor-management", 
    question: "Rate the effectiveness of visitor management systems",
    standard: "Visitor tracking, identification, and escort procedures",
    type: "rating",
  },

  // INTRUSION DETECTION
  {
    id: "intrusion-001",
    category: "intrusion-detection",
    subcategory: "sensors",
    question: "What types of intrusion detection sensors are deployed and their coverage?",
    standard: "Sensor types: passive/active, covert/visible, line-of-sight/volumetric",
    type: "condition",
  },
  {
    id: "intrusion-002",
    category: "intrusion-detection", 
    subcategory: "alarm-communication",
    question: "How are alarms communicated and displayed to operators?",
    standard: "AC&D system - alarm information to central monitoring point",
    type: "condition",
  }
];

export function FacilitySurvey({ assessmentId, onComplete }: FacilitySurveyProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>(facilityQuestions);
  const [currentCategory, setCurrentCategory] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);

  // Load existing facility survey data
  const { data: savedQuestions } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "facility-survey"],
    queryFn: async () => {
      const response = await fetch(`/api/assessments/${assessmentId}/facility-survey`);
      if (!response.ok) throw new Error('Failed to fetch facility survey');
      return response.json();
    }
  });

  // Merge saved responses with static questions structure
  useEffect(() => {
    if (savedQuestions && savedQuestions.length > 0) {
      const mergedQuestions = facilityQuestions.map(staticQ => {
        const savedQ = savedQuestions.find((sq: any) => 
          sq.category === staticQ.category && sq.subcategory === staticQ.subcategory
        );
        
        if (savedQ) {
          return {
            ...staticQ,
            response: savedQ.response,
            notes: savedQ.notes,
            evidence: savedQ.evidence,
            recommendations: savedQ.recommendations
          };
        }
        return staticQ;
      });
      setQuestions(mergedQuestions);
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

  // Save facility survey mutation
  const saveSurveyMutation = useMutation({
    mutationFn: async (questionsData: any[]) => {
      const response = await fetch(`/api/assessments/${assessmentId}/facility-survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsData }),
      });
      if (!response.ok) throw new Error('Failed to save facility survey');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Survey Saved",
        description: "Your facility survey progress has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: `Failed to save survey: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSave = () => {
    const questionsData = questions.map(q => ({
      assessmentId,
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

  const handleComplete = () => {
    if (progress >= 80) {
      handleSave();
      setTimeout(() => {
        onComplete?.();
        toast({
          title: "Facility Survey Complete",
          description: "Ready to proceed to ASIS Risk Assessment phase.",
        });
      }, 1000);
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${question.id}-value`}>Measurement Value</Label>
              <Input
                id={`${question.id}-value`}
                type="number"
                step="0.1"
                value={question.response?.value || ""}
                onChange={(e) => updateQuestion(question.id, "response", { 
                  ...question.response, 
                  value: e.target.value,
                  unit: question.response?.unit || "fc" 
                })}
                placeholder="Enter measurement"
                data-testid={`input-${question.id}-value`}
              />
              <Input
                placeholder="Unit (fc, Px/ft, feet, etc.)"
                value={question.response?.unit || ""}
                onChange={(e) => updateQuestion(question.id, "response", { 
                  ...question.response, 
                  unit: e.target.value 
                })}
                data-testid={`input-${question.id}-unit`}
              />
            </div>
            
            {/* Add Assessment Response for measurement questions, especially lighting */}
            <div className="space-y-2">
              <Label htmlFor={`${question.id}-assessment`}>Assessment Response</Label>
              <Select 
                value={question.response?.assessment || ""} 
                onValueChange={(value) => updateQuestion(question.id, "response", { 
                  ...question.response, 
                  assessment: value 
                })}
              >
                <SelectTrigger data-testid={`select-${question.id}-assessment`}>
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
            onValueChange={(value) => updateQuestion(question.id, "response", value)}
          >
            <SelectTrigger data-testid={`select-${question.id}`}>
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
            onValueChange={(value) => updateQuestion(question.id, "response", value)}
          >
            <SelectTrigger data-testid={`select-${question.id}`}>
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
            onValueChange={(value) => updateQuestion(question.id, "response", value)}
          >
            <SelectTrigger data-testid={`select-${question.id}`}>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Facility Physical Security Survey
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Comprehensive assessment of existing physical security controls and systems
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Phase 1 of 2
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Survey Progress</span>
                <span>{completedQuestions} of {questions.length} completed</span>
              </div>
              <Progress value={progress} className="w-full" data-testid="progress-survey" />
            </div>
            
            {/* Category Navigation */}
            <div className="flex flex-wrap gap-2">
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
                    className="flex items-center gap-2"
                    data-testid={`nav-category-${category}`}
                  >
                    <Icon className="h-3 w-3" />
                    {category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    {isComplete && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Category Questions */}
      <div ref={contentRef} className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {(() => {
            const Icon = getCategoryIcon(categories[currentCategory]);
            return <Icon className="h-4 w-4" />;
          })()}
          {categories[currentCategory]?.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </h3>

        {currentCategoryQuestions.map((question) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base leading-tight">{question.question}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{question.subcategory}</Badge>
                </div>
                {question.response && (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Standard Reference */}
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground font-medium">Professional Standard:</p>
                <p className="text-sm">{question.standard}</p>
              </div>

              {/* Response Input */}
              <div>
                <Label className="text-sm font-medium">Assessment Response</Label>
                {renderQuestionInput(question)}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor={`${question.id}-notes`}>Observations & Notes</Label>
                <Textarea
                  id={`${question.id}-notes`}
                  value={question.notes || ""}
                  onChange={(e) => updateQuestion(question.id, "notes", e.target.value)}
                  placeholder="Document specific observations, conditions, or concerns..."
                  rows={2}
                  data-testid={`textarea-${question.id}-notes`}
                />
              </div>

              {/* Evidence & Recommendations */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("Upload evidence for", question.id)}
                  data-testid={`button-evidence-${question.id}`}
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Add Photo Evidence
                </Button>
                
                {question.response && ["poor", "critical", "no"].includes(question.response) && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Requires Attention
                  </Badge>
                )}
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
            disabled={saveSurveyMutation.isPending}
            data-testid="button-save-survey"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveSurveyMutation.isPending ? "Saving..." : "Save Progress"}
          </Button>
          <Button 
            variant="outline"
            onClick={handleComplete}
            data-testid="button-skip-survey"
          >
            Skip to Risk Assessment
          </Button>
        </div>
        
        <div className="flex gap-2">
          {currentCategory > 0 && (
            <Button 
              variant="outline"
              onClick={() => setCurrentCategory(prev => prev - 1)}
              data-testid="button-previous-category"
            >
              Previous Category
            </Button>
          )}
          
          {currentCategory < categories.length - 1 ? (
            <Button 
              onClick={() => setCurrentCategory(prev => prev + 1)}
              data-testid="button-next-category"
            >
              Next Category
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              data-testid="button-complete-survey"
            >
              Complete Survey & Start Risk Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}