import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, AlertCircle } from "lucide-react";

interface RiskScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  category: "low" | "medium" | "high" | "critical";
  lastAssessed?: string;
  trends?: "up" | "down" | "stable";
}

const riskConfig = {
  low: {
    color: "bg-chart-2 text-chart-2-foreground",
    icon: Shield,
    label: "Low Risk"
  },
  medium: {
    color: "bg-chart-3 text-chart-3-foreground", 
    icon: AlertCircle,
    label: "Medium Risk"
  },
  high: {
    color: "bg-chart-4 text-chart-4-foreground",
    icon: AlertTriangle,
    label: "High Risk"
  },
  critical: {
    color: "bg-destructive text-destructive-foreground",
    icon: AlertTriangle,
    label: "Critical Risk"
  }
};

export function RiskScoreCard({ 
  title, 
  score, 
  maxScore, 
  category, 
  lastAssessed,
  trends 
}: RiskScoreCardProps) {
  const config = riskConfig[category];
  const Icon = config.icon;
  const percentage = Math.round((score / maxScore) * 100);

  return (
    <Card data-testid={`card-risk-${category}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-bold font-mono" data-testid={`text-score-${category}`}>
            {score}/{maxScore}
          </div>
          <Badge variant="secondary" className={config.color}>
            {config.label}
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full ${config.color.split(' ')[0]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {lastAssessed && (
          <p className="text-xs text-muted-foreground">
            Last assessed: {lastAssessed}
          </p>
        )}
      </CardContent>
    </Card>
  );
}