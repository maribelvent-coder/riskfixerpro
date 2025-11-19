import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Info,
  CheckCircle2,
  XCircle,
  Lightbulb
} from "lucide-react";

interface ThreatIntelligence {
  threatName: string;
  category: string;
  suggestedLikelihood: string;
  baselineLikelihood: string;
  rationale: string;
  crimeDataSupport: {
    violentCrimes?: number;
    propertyCrimes?: number;
    relevanceScore: number;
  };
}

interface CrimeDataSummary {
  violentTotal: number;
  propertyTotal: number;
  violentRate?: number;
  propertyRate?: number;
  population?: number;
  year: number;
  source: string;
}

interface RiskIntelligenceReport {
  siteId: string;
  siteName: string;
  crimeDataAvailable: boolean;
  crimeSummary?: CrimeDataSummary;
  threatIntelligence: ThreatIntelligence[];
  overallRiskLevel: "low" | "moderate" | "high" | "critical";
  keyInsights: string[];
  recommendedControls: string[];
}

interface RiskIntelligencePanelProps {
  siteId: string;
  threatName?: string; // Optional: highlight specific threat
  compact?: boolean; // Show compact view
}

const LIKELIHOOD_COLORS = {
  "very-low": "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  "low": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  "medium": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  "high": "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  "very-high": "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
} as const;

const RISK_LEVEL_CONFIG = {
  low: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    icon: CheckCircle2,
    label: "Low Risk Area",
  },
  moderate: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10",
    icon: Info,
    label: "Moderate Risk Area",
  },
  high: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
    icon: AlertTriangle,
    label: "High Risk Area",
  },
  critical: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    icon: XCircle,
    label: "Critical Risk Area",
  },
} as const;

export function RiskIntelligencePanel({ 
  siteId, 
  threatName,
  compact = false 
}: RiskIntelligencePanelProps) {
  const { data: report, isLoading } = useQuery<{ success: boolean; data: RiskIntelligenceReport }>({
    queryKey: ["/api/sites", siteId, "risk-intelligence"],
    enabled: !!siteId,
  });

  if (isLoading) {
    return (
      <Card data-testid="card-risk-intelligence-loading">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!report?.data || !report.data.crimeDataAvailable) {
    return (
      <Alert data-testid="alert-no-crime-data">
        <Info className="h-4 w-4" />
        <AlertDescription>
          No crime data available for this location. Risk intelligence requires imported crime statistics.
        </AlertDescription>
      </Alert>
    );
  }

  const intelligence = report.data;
  const RiskIcon = RISK_LEVEL_CONFIG[intelligence.overallRiskLevel].icon;

  // Filter to specific threat if provided
  const displayedThreats = threatName
    ? intelligence.threatIntelligence.filter(t => t.threatName === threatName)
    : intelligence.threatIntelligence.slice(0, compact ? 3 : 10);

  return (
    <div className="space-y-4" data-testid="container-risk-intelligence">
      {/* Overall Risk Level Banner */}
      <Card className={RISK_LEVEL_CONFIG[intelligence.overallRiskLevel].bgColor}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <RiskIcon className={`h-5 w-5 ${RISK_LEVEL_CONFIG[intelligence.overallRiskLevel].color}`} />
            <div className="flex-1">
              <CardTitle className="text-base">
                {RISK_LEVEL_CONFIG[intelligence.overallRiskLevel].label}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Based on local crime data for {intelligence.siteName}
              </CardDescription>
            </div>
            <Badge variant="outline" data-testid="badge-overall-risk-level">
              {intelligence.overallRiskLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key Insights */}
      {!compact && intelligence.keyInsights.length > 0 && (
        <Card data-testid="card-key-insights">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <CardTitle className="text-sm">Key Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {intelligence.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2" data-testid={`insight-${index}`}>
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Threat Intelligence */}
      {displayedThreats.length > 0 && (
        <Card data-testid="card-threat-intelligence">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <CardTitle className="text-sm">
                {threatName ? `Intelligence: ${threatName}` : "Threat Likelihood Intelligence"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Crime data-informed threat likelihood recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayedThreats.map((threat, index) => {
              const isUpgraded = threat.suggestedLikelihood !== threat.baselineLikelihood;
              const likelihoodClass = LIKELIHOOD_COLORS[threat.suggestedLikelihood as keyof typeof LIKELIHOOD_COLORS] || LIKELIHOOD_COLORS["medium"];

              return (
                <div 
                  key={index} 
                  className="border-l-2 border-border pl-4 py-2"
                  data-testid={`threat-${threat.threatName.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{threat.threatName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {threat.category}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${likelihoodClass} text-xs`}
                      data-testid={`badge-likelihood-${index}`}
                    >
                      {threat.suggestedLikelihood.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {threat.rationale}
                  </p>

                  {isUpgraded && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>
                        Adjusted from baseline: {threat.baselineLikelihood.replace('-', ' ')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">Relevance:</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${threat.crimeDataSupport.relevanceScore * 100}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground">
                      {(threat.crimeDataSupport.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}

            {!threatName && intelligence.threatIntelligence.length > displayedThreats.length && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                +{intelligence.threatIntelligence.length - displayedThreats.length} more threats analyzed
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommended Controls */}
      {!compact && intelligence.recommendedControls.length > 0 && (
        <Card data-testid="card-recommended-controls">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <CardTitle className="text-sm">Recommended Security Controls</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Based on prevalent local crime patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {intelligence.recommendedControls.map((control, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2"
                  data-testid={`control-${index}`}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{control}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Crime Data Source Info */}
      {intelligence.crimeSummary && (
        <div className="text-xs text-muted-foreground text-center" data-testid="text-crime-source">
          Data source: {intelligence.crimeSummary.source} ({intelligence.crimeSummary.year})
          {intelligence.crimeSummary.population && (
            <> • Population: {intelligence.crimeSummary.population.toLocaleString()}</>
          )}
        </div>
      )}
    </div>
  );
}
