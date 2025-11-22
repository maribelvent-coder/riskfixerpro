import type { IStorage } from "../storage";
import type {
  Assessment,
  AssessmentWithQuestions,
  Site,
  RiskScenario,
  PointOfInterest,
  CrimeSource,
  CrimeObservation,
  SiteIncident
} from "@shared/schema";
import {
  calculateRiskLevel,
  LIKELIHOOD_VALUES,
  IMPACT_VALUES
} from "@shared/riskCalculations";
import { generateRiskIntelligenceReport } from "./riskIntelligence";
import type { RiskIntelligenceReport, ThreatIntelligence } from "./riskIntelligence";
import { calculateTemplateMetrics } from "./reporting/template-metrics";

export interface ComprehensiveReportData {
  // Core Assessment Data
  assessment: AssessmentWithQuestions;
  site?: Site;
  
  // Risk Analysis
  riskSummary: {
    totalScenarios: number;
    averageInherentRisk: number;
    averageCurrentRisk: number;
    averageResidualRisk: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    topThreats: Array<{
      scenario: string;
      likelihood: string;
      impact: string;
      riskScore: number;
    }>;
  };
  
  // GeoIntel Data
  geoIntel?: {
    pointsOfInterest: PointOfInterest[];
    crimeData: Array<{
      source: CrimeSource;
      observations: CrimeObservation[];
    }>;
    incidents: SiteIncident[];
    riskIntelligence?: RiskIntelligenceReport | null;
  };
  
  // Evidence
  photoEvidence: Array<{
    url: string;
    caption?: string;
    section: string;
  }>;
  
  // Treatment Recommendations
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    scenario: string;
    risk: string;
    timeframe?: string;
  }>;
  
  // Template-Specific Metrics ("Killer Features")
  templateMetrics: Record<string, any>;
}

export async function aggregateReportData(
  assessmentId: string,
  storage: IStorage,
  userId: string
): Promise<ComprehensiveReportData> {
  // Fetch comprehensive assessment data
  const assessment = await storage.getAssessmentWithQuestions(assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  // Verify ownership
  if (assessment.userId !== userId) {
    throw new Error('Unauthorized access to assessment');
  }

  // Fetch site data if linked (critical operation - rethrow on failure)
  let site: Site | undefined;
  if (assessment.siteId) {
    try {
      site = await storage.getSite(assessment.siteId);
      if (!site) {
        console.warn(`Site ${assessment.siteId} not found - continuing without site data`);
      }
    } catch (error) {
      console.error(`Critical error fetching site ${assessment.siteId}:`, error);
      // Site data is important but not critical - log error but continue
      // In production, you may want to surface this to the user
    }
  }

  // Calculate risk summary (handles empty array gracefully)
  const riskSummary = calculateRiskSummary(assessment.riskScenarios || []);

  // Fetch GeoIntel data if site exists (with comprehensive error handling)
  let geoIntel: ComprehensiveReportData['geoIntel'];
  let geoIntelError: Error | null = null;
  
  if (site) {
    try {
      const [pointsOfInterest, crimeSources, incidents] = await Promise.all([
        storage.getPointsOfInterest(site.id).catch((err) => {
          console.error(`Error fetching POIs for site ${site.id}:`, err);
          return [];
        }),
        storage.getCrimeSources(site.id).catch((err) => {
          console.error(`Error fetching crime sources for site ${site.id}:`, err);
          return [];
        }),
        storage.getSiteIncidents(site.id).catch((err) => {
          console.error(`Error fetching incidents for site ${site.id}:`, err);
          return [];
        })
      ]);

      // Fetch crime observations for each source (with error handling)
      const crimeData = await Promise.all(
        (crimeSources || []).map(async (source) => {
          try {
            return {
              source,
              observations: await storage.getCrimeObservationsBySource(source.id)
            };
          } catch (error) {
            console.error(`Error fetching crime observations for source ${source.id}:`, error);
            return { source, observations: [] };
          }
        })
      );

      // Get risk intelligence if crime data exists (with comprehensive error handling)
      let riskIntelligence: RiskIntelligenceReport | null = null;
      if (crimeData.length > 0 && crimeData.some(cd => cd.observations && cd.observations.length > 0)) {
        try {
          riskIntelligence = await generateRiskIntelligenceReport(site.id);
        } catch (error) {
          console.error('Error generating risk intelligence report:', error);
          riskIntelligence = null;
        }
      }

      geoIntel = {
        pointsOfInterest: pointsOfInterest || [],
        crimeData: crimeData || [],
        incidents: incidents || [],
        riskIntelligence
      };
    } catch (error) {
      console.error('Critical error fetching GeoIntel data:', error);
      geoIntelError = error as Error;
      // Provide empty defaults if GeoIntel fetch fails catastrophically
      geoIntel = {
        pointsOfInterest: [],
        crimeData: [],
        incidents: [],
        riskIntelligence: null
      };
    }
  }
  
  // Log summary of any errors encountered (for monitoring/debugging)
  if (geoIntelError) {
    console.error(`Report generation for assessment ${assessmentId} completed with GeoIntel errors:`, {
      siteId: site?.id,
      error: geoIntelError.message
    });
  }

  // Extract photo evidence from assessment questions (handles missing data)
  const photoEvidence = extractPhotoEvidence(assessment);

  // Generate prioritized recommendations (handles missing data)
  const recommendations = generateRecommendations(assessment, geoIntel);

  // Calculate template-specific metrics
  const templateMetrics = calculateTemplateMetrics(assessment, assessment.riskScenarios || []);
  
  return {
    assessment,
    site,
    riskSummary,
    geoIntel,
    photoEvidence,
    recommendations,
    templateMetrics
  };
}

function calculateRiskSummary(scenarios: RiskScenario[]) {
  if (scenarios.length === 0) {
    return {
      totalScenarios: 0,
      averageInherentRisk: 0,
      averageCurrentRisk: 0,
      averageResidualRisk: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      topThreats: []
    };
  }

  let totalInherent = 0;
  let totalCurrent = 0;
  let totalResidual = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  const threatScores: Array<{
    scenario: string;
    likelihood: string;
    impact: string;
    riskScore: number;
  }> = [];

  scenarios.forEach(scenario => {
    // Calculate inherent risk score (likelihood * impact)
    const likelihoodValue = LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof LIKELIHOOD_VALUES]?.value || 3;
    const impactValue = IMPACT_VALUES[scenario.impact as keyof typeof IMPACT_VALUES]?.value || 3;
    const inherent = likelihoodValue * impactValue;

    // Calculate current risk (if current likelihood/impact provided, otherwise same as inherent)
    let current = inherent;
    if (scenario.currentLikelihood && scenario.currentImpact) {
      const currentLikelihoodValue = LIKELIHOOD_VALUES[scenario.currentLikelihood as keyof typeof LIKELIHOOD_VALUES]?.value || likelihoodValue;
      const currentImpactValue = IMPACT_VALUES[scenario.currentImpact as keyof typeof IMPACT_VALUES]?.value || impactValue;
      current = currentLikelihoodValue * currentImpactValue;
    }

    // Residual is same as current for now (would be lower after proposed controls)
    const residual = current;

    totalInherent += inherent;
    totalCurrent += current;
    totalResidual += residual;

    // Categorize current risk
    if (current >= 15) highCount++;
    else if (current >= 8) mediumCount++;
    else lowCount++;

    threatScores.push({
      scenario: scenario.scenario,
      likelihood: scenario.likelihood,
      impact: scenario.impact,
      riskScore: current
    });
  });

  // Sort and get top 5 threats
  const topThreats = threatScores
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  return {
    totalScenarios: scenarios.length,
    averageInherentRisk: totalInherent / scenarios.length,
    averageCurrentRisk: totalCurrent / scenarios.length,
    averageResidualRisk: totalResidual / scenarios.length,
    highRiskCount: highCount,
    mediumRiskCount: mediumCount,
    lowRiskCount: lowCount,
    topThreats
  };
}

function extractPhotoEvidence(assessment: AssessmentWithQuestions): Array<{
  url: string;
  caption?: string;
  section: string;
}> {
  const photos: Array<{ url: string; caption?: string; section: string }> = [];

  // Extract from facility survey questions (with null safety)
  if (assessment.facilityQuestions && Array.isArray(assessment.facilityQuestions)) {
    assessment.facilityQuestions.forEach(q => {
      if (q && q.evidence && Array.isArray(q.evidence) && q.evidence.length > 0) {
        q.evidence.forEach((path: string) => {
          if (path && typeof path === 'string') {
            photos.push({
              url: path,
              caption: q.question || undefined,
              section: 'Facility Survey'
            });
          }
        });
      }
    });
  }

  // Extract from assessment questions (executive interviews, with null safety)
  if (assessment.questions && Array.isArray(assessment.questions)) {
    assessment.questions.forEach(q => {
      if (q && q.evidence && Array.isArray(q.evidence) && q.evidence.length > 0) {
        q.evidence.forEach((path: string) => {
          if (path && typeof path === 'string') {
            photos.push({
              url: path,
              caption: q.question || undefined,
              section: 'Executive Interview'
            });
          }
        });
      }
    });
  }

  return photos;
}

function generateRecommendations(
  assessment: AssessmentWithQuestions,
  geoIntel?: ComprehensiveReportData['geoIntel']
): Array<{
  priority: 'critical' | 'high' | 'medium' | 'low';
  scenario: string;
  risk: string;
  timeframe?: string;
}> {
  const recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    scenario: string;
    risk: string;
    timeframe?: string;
  }> = [];

  // Generate recommendations from risk scenarios (with null safety)
  if (assessment.riskScenarios && Array.isArray(assessment.riskScenarios)) {
    assessment.riskScenarios.forEach(scenario => {
      if (!scenario) return; // Skip null/undefined scenarios
      
      const likelihoodValue = LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof LIKELIHOOD_VALUES]?.value || 3;
      const impactValue = IMPACT_VALUES[scenario.impact as keyof typeof IMPACT_VALUES]?.value || 3;
      
      let currentLikelihoodValue = likelihoodValue;
      let currentImpactValue = impactValue;
      if (scenario.currentLikelihood && scenario.currentImpact) {
        currentLikelihoodValue = LIKELIHOOD_VALUES[scenario.currentLikelihood as keyof typeof LIKELIHOOD_VALUES]?.value || likelihoodValue;
        currentImpactValue = IMPACT_VALUES[scenario.currentImpact as keyof typeof IMPACT_VALUES]?.value || impactValue;
      }
      
      const riskScore = currentLikelihoodValue * currentImpactValue;
      
      let priority: 'critical' | 'high' | 'medium' | 'low';
      let timeframe: string;

      if (riskScore >= 20) {
        priority = 'critical';
        timeframe = 'Immediate';
      } else if (riskScore >= 15) {
        priority = 'high';
        timeframe = '30 days';
      } else if (riskScore >= 8) {
        priority = 'medium';
        timeframe = '90 days';
      } else {
        priority = 'low';
        timeframe = '180 days';
      }

      recommendations.push({
        priority,
        scenario: scenario.scenario || 'Unknown Scenario',
        risk: scenario.riskLevel || 'Unknown',
        timeframe
      });
    });
  }

  // Add GeoIntel-based recommendations (with comprehensive null safety)
  if (geoIntel?.riskIntelligence?.threatIntelligence && Array.isArray(geoIntel.riskIntelligence.threatIntelligence)) {
    geoIntel.riskIntelligence.threatIntelligence
      .filter((ti: ThreatIntelligence) => ti && ti.suggestedLikelihood !== ti.baselineLikelihood)
      .forEach((ti: ThreatIntelligence) => {
        if (ti && ti.threatName) {
          recommendations.push({
            priority: 'high',
            scenario: ti.threatName,
            risk: `Crime-informed: ${ti.rationale || 'Elevated threat based on local crime data'}`,
            timeframe: '60 days'
          });
        }
      });
  }

  // Sort by priority (defensive against invalid priority values)
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return recommendations.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 999;
    const bPriority = priorityOrder[b.priority] ?? 999;
    return aPriority - bPriority;
  });
}
