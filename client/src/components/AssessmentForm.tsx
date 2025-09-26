import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { assessmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { EnhancedRiskAssessment } from "./EnhancedRiskAssessment";

interface AssessmentFormProps {
  assessmentId: string;
  title?: string;
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  phase?: "facility-survey" | "risk-assessment";
}

export function AssessmentForm({ 
  assessmentId,
  title = "Physical Security Assessment",
  onSave,
  onSubmit,
  phase
}: AssessmentFormProps) {
  const { toast } = useToast();

  // Load assessment data to determine phase if not provided
  const { data: assessment } = useQuery({
    queryKey: ["/api/assessments", assessmentId],
    queryFn: () => assessmentApi.getById(assessmentId),
    enabled: !!assessmentId && assessmentId !== "new",
  });

  // Determine the appropriate phase
  const currentPhase = phase || (assessment?.facilitySurveyCompleted ? "risk-assessment" : "facility-survey");

  // Always use enhanced risk assessment for Phase 2 - mock questions are deprecated
  if (currentPhase === "risk-assessment") {
    return (
      <EnhancedRiskAssessment 
        assessmentId={assessmentId}
        onComplete={() => {
          toast({
            title: "Assessment Complete",
            description: "Enhanced risk assessment has been completed successfully.",
          });
          onSubmit?.({});
        }}
      />
    );
  }

  // For facility-survey phase, show error - this component no longer handles Phase 1
  if (currentPhase === "facility-survey") {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            This component is for risk assessment only. Please use the FacilitySurvey component for Phase 1.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Fallback to enhanced risk assessment
  return (
    <EnhancedRiskAssessment 
      assessmentId={assessmentId}
      onComplete={() => {
        toast({
          title: "Assessment Complete", 
          description: "Enhanced risk assessment has been completed successfully.",
        });
        onSubmit?.({});
      }}
    />
  );
}