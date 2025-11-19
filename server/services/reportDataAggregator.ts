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

  // Fetch site data if linked
  let site: Site | undefined;
  if (assessment.siteId) {
    site = await storage.getSite(assessment.siteId);
  }

  // Calculate risk summary
  const riskSummary = calculateRiskSummary(assessment.riskScenarios || []);

  // Fetch GeoIntel data if site exists
  let geoIntel: ComprehensiveReportData['geoIntel'];
  if (site) {
    const [pointsOfInterest, crimeSources, incidents] = await Promise.all([
      storage.getPointsOfInterest(site.id),
      storage.getCrimeSources(site.id),
      storage.getSiteIncidents(site.id)
    ]);

    // Fetch crime observations for each source
    const crimeData = await Promise.all(
      crimeSources.map(async (source) => ({
        source,
        observations: await storage.getCrimeObservationsBySource(source.id)
      }))
    );

    // Get risk intelligence if crime data exists
    let riskIntelligence: RiskIntelligenceReport | null = null;
    if (crimeData.length > 0 && crimeData.some(cd => cd.observations.length > 0)) {
      try {
        riskIntelligence = await generateRiskIntelligenceReport(site.id);
      } catch (error) {
        console.warn('Could not fetch risk intelligence:', error);
      }
    }

    geoIntel = {
      pointsOfInterest,
      crimeData,
      incidents,
      riskIntelligence
    };
  }

  // Extract photo evidence from assessment questions
  const photoEvidence = extractPhotoEvidence(assessment);

  // Generate prioritized recommendations
  const recommendations = generateRecommendations(assessment, geoIntel);

  return {
    assessment,
    site,
    riskSummary,
    geoIntel,
    photoEvidence,
    recommendations
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

  // Extract from facility survey questions
  if (assessment.facilityQuestions) {
    assessment.facilityQuestions.forEach(q => {
      if (q.evidence && Array.isArray(q.evidence)) {
        q.evidence.forEach((path: string) => {
          photos.push({
            url: path,
            caption: q.question,
            section: 'Facility Survey'
          });
        });
      }
    });
  }

  // Extract from assessment questions (executive interviews)
  if (assessment.questions) {
    assessment.questions.forEach(q => {
      if (q.evidence && Array.isArray(q.evidence)) {
        q.evidence.forEach((path: string) => {
          photos.push({
            url: path,
            caption: q.question,
            section: 'Executive Interview'
          });
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

  // Generate recommendations from risk scenarios
  if (assessment.riskScenarios) {
    assessment.riskScenarios.forEach(scenario => {
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
        scenario: scenario.scenario,
        risk: scenario.riskLevel,
        timeframe
      });
    });
  }

  // Add GeoIntel-based recommendations
  if (geoIntel?.riskIntelligence) {
    geoIntel.riskIntelligence.threatIntelligence
      .filter((ti: ThreatIntelligence) => ti.suggestedLikelihood !== ti.baselineLikelihood)
      .forEach((ti: ThreatIntelligence) => {
        recommendations.push({
          priority: 'high',
          scenario: ti.threatName,
          risk: `Crime-informed: ${ti.rationale}`,
          timeframe: '60 days'
        });
      });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
