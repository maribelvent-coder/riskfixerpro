import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, FileText, Play, Eye } from "lucide-react";

interface AssessmentCardProps {
  id: string;
  title: string;
  location: string;
  status: "draft" | "in-progress" | "completed" | "reviewed";
  assessor: string;
  createdDate: string;
  lastModified: string;
  riskLevel?: "low" | "medium" | "high" | "critical";
  onStart?: (id: string) => void;
  onView?: (id: string) => void;
  onGenerate?: (id: string) => void;
}

const statusConfig = {
  draft: { color: "bg-muted text-muted-foreground", label: "Draft" },
  "in-progress": { color: "bg-chart-3 text-chart-3-foreground", label: "In Progress" },
  completed: { color: "bg-chart-2 text-chart-2-foreground", label: "Completed" },
  reviewed: { color: "bg-chart-1 text-chart-1-foreground", label: "Reviewed" }
};

export function AssessmentCard({
  id,
  title,
  location,
  status,
  assessor,
  createdDate,
  lastModified,
  riskLevel,
  onStart,
  onView,
  onGenerate
}: AssessmentCardProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  console.log('AssessmentCard status:', status, 'for id:', id);
  
  return (
    <Card data-testid={`card-assessment-${id}`} className="hover-elevate">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Badge variant="secondary" className={config.color}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {location}
          </div>
          <div className="flex items-center text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            {assessor}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Created {createdDate}
          </div>
        </div>

        {riskLevel && (
          <div className="pt-2">
            <Badge 
              variant="secondary" 
              className={
                riskLevel === "critical" ? "bg-destructive text-destructive-foreground" :
                riskLevel === "high" ? "bg-chart-4 text-chart-4-foreground" :
                riskLevel === "medium" ? "bg-chart-3 text-chart-3-foreground" :
                "bg-chart-2 text-chart-2-foreground"
              }
            >
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
            </Badge>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {status === "draft" ? (
            <Button 
              size="sm" 
              onClick={() => onStart?.(id)}
              data-testid={`button-start-${id}`}
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onView?.(id)}
              data-testid={`button-view-${id}`}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
          
          {(status === "completed" || status === "reviewed") && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onGenerate?.(id)}
              data-testid={`button-generate-${id}`}
            >
              <FileText className="h-3 w-3 mr-1" />
              Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}