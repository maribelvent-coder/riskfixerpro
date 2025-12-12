import { db } from "../../db";
import { 
  assessments, 
  riskScenarios, 
  controls, 
  riskAssets,
  treatmentPlans,
  sites,
  executiveProfiles,
  interviewFindings,
  documentedIncidents,
  crimeIncidents,
  siteIncidents,
  pointsOfInterest,
  crimeSources,
  crimeObservations,
  executiveInterviewResponses
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { 
  ReportDataPackage, 
  ThreatDomain, 
  DocumentedIncident as DocIncidentType,
  InterviewFinding as InterviewFindingType,
  SiteWalkFinding,
  Recommendation,
  RiskScoreData,
  FacilityProfile,
  PrincipalProfile,
  GeographicIntelligence,
  CrimeDataSummary,
  SiteIncidentData,
  POIData,
  CAPIndexUpload,
  EPReportData,
  EPThreatAssessment
} from "../../types/report-data";
import type { AssessmentType } from "../../types/report-recipe";
import { generateEPDashboard, type EPDashboardOutput, type EPThreatScore } from "../ep-ai-risk-assessment";
import { prepareForAIEngine } from "../ep-interview-mapper-v2";

const TORCHSTONE_DOMAINS = [
  { id: "workplace-violence", name: "Workplace Violence", category: "Personnel" },
  { id: "theft-fraud", name: "Theft & Fraud", category: "Assets" },
  { id: "terrorism", name: "Terrorism", category: "External" },
  { id: "civil-unrest", name: "Civil Unrest", category: "External" },
  { id: "natural-disasters", name: "Natural Disasters", category: "Environmental" },
  { id: "cyber-physical", name: "Cyber-Physical", category: "Technology" },
  { id: "executive-targeting", name: "Executive Targeting", category: "Personnel" },
  { id: "supply-chain", name: "Supply Chain Disruption", category: "Operations" }
];

export function calculateRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score > 100) return 'critical';
  if (score > 75) return 'high';
  if (score > 50) return 'medium';
  if (score > 25) return 'low';
  return 'low';
}

function mapPriority(riskLevel: string): 'critical' | 'high' | 'medium' | 'low' {
  const level = riskLevel?.toLowerCase() || 'medium';
  if (level === 'extreme' || level === 'critical') return 'critical';
  if (level === 'high') return 'high';
  if (level === 'medium' || level === 'moderate') return 'medium';
  return 'low';
}

function mapToThreatDomains(scenarios: any[], controlsList: any[]): ThreatDomain[] {
  const domainMap = new Map<string, ThreatDomain>();
  
  for (const domain of TORCHSTONE_DOMAINS) {
    domainMap.set(domain.id, {
      id: domain.id,
      name: domain.name,
      category: domain.category,
      description: `${domain.name} threats and vulnerabilities`,
      likelihood: 0,
      impact: 0,
      riskScore: 0,
      priority: 'low',
      mitigatingControls: [],
      vulnerabilities: [],
      historicalIncidents: 0,
      trendDirection: 'stable'
    });
  }

  for (const scenario of scenarios) {
    const threatType = scenario.threatType?.toLowerCase() || '';
    let domainId = 'theft-fraud';
    
    if (threatType.includes('violence') || threatType.includes('assault')) {
      domainId = 'workplace-violence';
    } else if (threatType.includes('terror')) {
      domainId = 'terrorism';
    } else if (threatType.includes('civil') || threatType.includes('protest')) {
      domainId = 'civil-unrest';
    } else if (threatType.includes('natural') || threatType.includes('weather') || threatType.includes('flood')) {
      domainId = 'natural-disasters';
    } else if (threatType.includes('cyber') || threatType.includes('digital')) {
      domainId = 'cyber-physical';
    } else if (threatType.includes('executive') || threatType.includes('kidnap') || threatType.includes('extortion')) {
      domainId = 'executive-targeting';
    } else if (threatType.includes('supply') || threatType.includes('vendor')) {
      domainId = 'supply-chain';
    }

    const domain = domainMap.get(domainId);
    if (domain) {
      const likelihood = scenario.likelihoodScore || parseFloat(scenario.likelihood) || 3;
      const impact = scenario.impactScore || parseFloat(scenario.impact) || 3;
      const riskScore = scenario.inherentRisk || (likelihood * impact * 4);
      
      domain.likelihood = Math.max(domain.likelihood, likelihood);
      domain.impact = Math.max(domain.impact, impact);
      domain.riskScore += riskScore;
      domain.historicalIncidents++;
      
      if (scenario.vulnerabilityDescription) {
        domain.vulnerabilities.push(scenario.vulnerabilityDescription);
      }
      
      domain.priority = mapPriority(scenario.riskLevel);
    }
  }

  for (const control of controlsList) {
    const domains = Array.from(domainMap.values());
    for (const domain of domains) {
      if (domain.riskScore > 0) {
        domain.mitigatingControls.push(control.description);
      }
    }
  }

  return Array.from(domainMap.values()).filter(d => d.riskScore > 0);
}

function buildRecommendations(controlsList: any[], treatmentPlansList: any[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  const proposedControls = controlsList.filter(c => c.controlType === 'proposed' || c.treatmentType);
  
  for (const control of proposedControls) {
    recommendations.push({
      id: control.id,
      title: control.description?.substring(0, 50) || 'Security Enhancement',
      description: control.description || '',
      priority: mapRecPriority(control.treatmentEffectiveness),
      category: control.primaryEffect || 'General',
      estimatedCost: control.estimatedCost || 'TBD',
      estimatedTimeframe: control.targetDate || '90 days',
      linkedThreatDomains: [],
      linkedFindings: [],
      expectedImpact: `Reduces risk by ${control.treatmentEffectiveness || 20}%`,
      implementationComplexity: 'medium',
      responsibleParty: control.responsibleParty || undefined
    });
  }
  
  for (const plan of treatmentPlansList) {
    if (!recommendations.find(r => r.id === plan.id)) {
      recommendations.push({
        id: plan.id,
        title: plan.description?.substring(0, 50) || 'Treatment Plan',
        description: plan.description || '',
        priority: mapRecPriority(plan.projectedRiskReduction),
        category: plan.type || 'Mitigation',
        estimatedCost: String(plan.value || 'TBD'),
        estimatedTimeframe: '90 days',
        linkedThreatDomains: [],
        linkedFindings: [],
        expectedImpact: `Risk reduction: ${plan.projectedRiskReduction || 0}%`,
        implementationComplexity: 'medium',
        responsibleParty: plan.responsible || undefined
      });
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { immediate: 0, 'short-term': 1, 'medium-term': 2, 'long-term': 3 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });
}

function mapRecPriority(effectiveness?: number | null): 'immediate' | 'short-term' | 'medium-term' | 'long-term' {
  if (!effectiveness) return 'medium-term';
  if (effectiveness >= 80) return 'immediate';
  if (effectiveness >= 60) return 'short-term';
  if (effectiveness >= 40) return 'medium-term';
  return 'long-term';
}

function buildSiteWalkFindings(controlsList: any[]): SiteWalkFinding[] {
  const findings: SiteWalkFinding[] = [];
  
  const existingControls = controlsList.filter(c => 
    c.controlType === 'existing' && c.effectiveness !== undefined && c.effectiveness < 3
  );
  
  for (const control of existingControls) {
    findings.push({
      id: control.id,
      assessmentId: control.assessmentId,
      location: 'On-site',
      zone: 'General',
      category: control.primaryEffect || 'Security Control',
      finding: `${control.description} - rated as ${control.effectiveness}/5 effectiveness`,
      severity: control.effectiveness <= 1 ? 'critical' : control.effectiveness <= 2 ? 'high' : 'medium',
      recommendation: control.actionDescription || 'Review and enhance control effectiveness',
      estimatedCost: control.estimatedCost || undefined,
      priority: control.effectiveness <= 1 ? 1 : control.effectiveness <= 2 ? 2 : 3,
      linkedControlId: control.id,
      createdAt: control.createdAt?.toISOString() || new Date().toISOString()
    });
  }

  return findings;
}

function calculateOverallRiskScore(scenarios: any[]): RiskScoreData {
  if (scenarios.length === 0) {
    return {
      overallScore: 0,
      normalizedScore: 0,
      riskLevel: 'low',
      categoryBreakdown: [],
      controlEffectiveness: 0,
      residualRisk: 0
    };
  }

  const totalInherent = scenarios.reduce((sum, s) => sum + (s.inherentRisk || 0), 0);
  const totalResidual = scenarios.reduce((sum, s) => sum + (s.residualRisk || s.inherentRisk || 0), 0);
  const avgControlEffectiveness = scenarios.reduce((sum, s) => sum + (s.controlEffectiveness || 0), 0) / scenarios.length;
  
  const overallScore = totalInherent / scenarios.length;
  const normalizedScore = Math.min(100, overallScore);
  
  const categoryMap = new Map<string, number[]>();
  for (const scenario of scenarios) {
    const cat = scenario.threatType || 'General';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(scenario.inherentRisk || 0);
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, scores]) => ({
    category,
    score: scores.reduce((a, b) => a + b, 0) / scores.length,
    weight: scores.length / scenarios.length
  }));

  return {
    overallScore,
    normalizedScore,
    riskLevel: calculateRiskLevel(overallScore),
    categoryBreakdown,
    controlEffectiveness: avgControlEffectiveness,
    residualRisk: totalResidual / scenarios.length
  };
}

function mapTemplateToAssessmentType(templateId: string | null): AssessmentType {
  if (!templateId) return 'office-building';
  const t = templateId.toLowerCase();
  if (t.includes('executive') || t.includes('ep')) return 'executive-protection';
  if (t.includes('retail')) return 'retail-store';
  if (t.includes('warehouse')) return 'warehouse';
  if (t.includes('office')) return 'office-building';
  if (t.includes('datacenter') || t.includes('data-center')) return 'data-center';
  if (t.includes('manufacturing')) return 'manufacturing';
  return 'office-building';
}

async function fetchCAPIndexData(siteId: string, assessmentId: string): Promise<CAPIndexUpload | undefined> {
  try {
    // Query by assessmentId first (more specific), then fallback to siteId
    let sourcesList = await db.select().from(crimeSources)
      .where(eq(crimeSources.assessmentId, assessmentId))
      .orderBy(desc(crimeSources.importDate));

    // If no assessment-specific sources, try site-level sources
    if (sourcesList.length === 0 && siteId) {
      sourcesList = await db.select().from(crimeSources)
        .where(eq(crimeSources.siteId, siteId))
        .orderBy(desc(crimeSources.importDate));
    }

    if (sourcesList.length === 0) {
      return undefined;
    }

    const latestSource = sourcesList[0];
    
    const [observation] = await db.select().from(crimeObservations)
      .where(eq(crimeObservations.crimeSourceId, latestSource.id))
      .limit(1);

    if (!observation) {
      return undefined;
    }

    // Parse and normalize JSON data
    const parseViolentCrimes = (data: unknown): CAPIndexUpload['violentCrimes'] => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (!parsed || typeof parsed !== 'object') return { total: 0, rate_per_100k: 0 };
      return {
        total: Number(parsed.total) || 0,
        rate_per_100k: Number(parsed.rate_per_100k) || 0,
        breakdown: parsed.breakdown ? {
          murder: Number(parsed.breakdown.murder) || undefined,
          assault: Number(parsed.breakdown.assault) || undefined,
          robbery: Number(parsed.breakdown.robbery) || undefined,
          rape: Number(parsed.breakdown.rape) || undefined,
        } : undefined
      };
    };

    const parsePropertyCrimes = (data: unknown): CAPIndexUpload['propertyCrimes'] => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (!parsed || typeof parsed !== 'object') return { total: 0, rate_per_100k: 0 };
      return {
        total: Number(parsed.total) || 0,
        rate_per_100k: Number(parsed.rate_per_100k) || 0,
        breakdown: parsed.breakdown ? {
          burglary: Number(parsed.breakdown.burglary) || undefined,
          theft: Number(parsed.breakdown.theft) || undefined,
          auto_theft: Number(parsed.breakdown.auto_theft) || undefined,
        } : undefined
      };
    };

    return {
      overallCrimeIndex: Number(observation.overallCrimeIndex) || 0,
      violentCrimes: parseViolentCrimes(observation.violentCrimes),
      propertyCrimes: parsePropertyCrimes(observation.propertyCrimes),
      comparisonRating: observation.comparisonRating as CAPIndexUpload['comparisonRating'],
      dataTimePeriod: latestSource.dataTimePeriod || undefined,
      dataSource: latestSource.dataSource,
      city: latestSource.city || undefined,
      state: latestSource.state || undefined,
      importDate: latestSource.importDate?.toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error('[ReportDataAssembler] Error fetching CAP Index data:', error);
    return undefined;
  }
}

async function fetchGeographicIntelligence(siteId: string, assessmentId: string): Promise<GeographicIntelligence | undefined> {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [crimeList, incidentList, poiList, capIndexData] = await Promise.all([
      db.select().from(crimeIncidents)
        .where(eq(crimeIncidents.assessmentId, assessmentId))
        .orderBy(desc(crimeIncidents.incidentDate)),
      db.select().from(siteIncidents)
        .where(eq(siteIncidents.siteId, siteId))
        .orderBy(desc(siteIncidents.incidentDate)),
      db.select().from(pointsOfInterest)
        .where(eq(pointsOfInterest.siteId, siteId)),
      fetchCAPIndexData(siteId, assessmentId)
    ]);

    if (crimeList.length === 0 && incidentList.length === 0 && poiList.length === 0 && !capIndexData) {
      return undefined;
    }

    const crimeTypeCounts = new Map<string, { count: number; severity: string }>();
    for (const crime of crimeList) {
      const type = crime.incidentType || 'Unknown';
      const existing = crimeTypeCounts.get(type) || { count: 0, severity: 'medium' };
      existing.count++;
      if (crime.severity === 'critical' || crime.severity === 'high') {
        existing.severity = crime.severity;
      }
      crimeTypeCounts.set(type, existing);
    }

    const recentCrimes = crimeList.filter(c => {
      const date = c.incidentDate ? new Date(c.incidentDate) : null;
      return date && date >= oneYearAgo;
    });

    const totalCrimes = crimeList.length;
    let crimeRiskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
    if (totalCrimes > 50 || recentCrimes.length > 20) crimeRiskLevel = 'critical';
    else if (totalCrimes > 25 || recentCrimes.length > 10) crimeRiskLevel = 'high';
    else if (totalCrimes > 10 || recentCrimes.length > 5) crimeRiskLevel = 'medium';

    const crimeData: CrimeDataSummary = {
      totalIncidents: totalCrimes,
      recentIncidents: recentCrimes.length,
      crimeTypes: Array.from(crimeTypeCounts.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        severity: data.severity
      })).sort((a, b) => b.count - a.count),
      timeRange: {
        start: crimeList.length > 0 ? (crimeList[crimeList.length - 1].incidentDate?.toISOString() || '') : '',
        end: crimeList.length > 0 ? (crimeList[0].incidentDate?.toISOString() || '') : ''
      },
      hotspots: [...new Set(crimeList.map(c => c.location).filter(Boolean))].slice(0, 5) as string[],
      trendDirection: recentCrimes.length > totalCrimes / 2 ? 'increasing' : 'stable',
      riskLevel: crimeRiskLevel
    };

    const siteIncidentData: SiteIncidentData[] = incidentList.map(i => ({
      id: i.id,
      title: i.title || 'Incident',
      description: i.description || '',
      incidentDate: i.incidentDate?.toISOString() || '',
      incidentType: i.incidentType || 'Unknown',
      severity: (i.severity as 'critical' | 'high' | 'medium' | 'low') || 'medium',
      resolution: i.resolution || undefined
    }));

    const poiData: POIData[] = poiList.map(p => ({
      id: p.id,
      name: p.name,
      poiType: p.poiType || 'Unknown',
      distance: p.distance ? parseFloat(String(p.distance)) : undefined,
      riskLevel: mapPOIRisk(p.poiType || ''),
      notes: p.notes || undefined
    }));

    const riskContext = buildRiskContext(crimeData, siteIncidentData, poiData, capIndexData);

    return {
      crimeData,
      siteIncidents: siteIncidentData,
      pointsOfInterest: poiData,
      capIndexData,
      riskContext
    };
  } catch (error) {
    console.error('[ReportDataAssembler] Error fetching geographic intelligence:', error);
    return undefined;
  }
}

function mapPOIRisk(poiType: string): 'critical' | 'high' | 'medium' | 'low' | 'neutral' {
  const type = poiType.toLowerCase();
  if (type.includes('protest') || type.includes('crime') || type.includes('gang')) return 'critical';
  if (type.includes('bar') || type.includes('club') || type.includes('liquor')) return 'high';
  if (type.includes('transit') || type.includes('parking') || type.includes('homeless')) return 'medium';
  if (type.includes('school') || type.includes('hospital') || type.includes('police')) return 'low';
  return 'neutral';
}

// ===========================================
// EP Report Data Assembly
// Transforms AI assessment output to report format
// ===========================================

function mapEPThreatScoreToAssessment(score: EPThreatScore): EPThreatAssessment {
  return {
    threatId: score.threatId,
    threatName: score.threatName,
    category: score.category,
    threatLikelihood: score.threatLikelihood,
    vulnerability: score.vulnerability,
    impact: score.impact,
    exposureFactor: score.exposureFactor,
    riskScore: score.riskScore,
    scenarioDescription: score.scenarioDescription,
    evidenceTrail: score.evidenceTrail,
    priorityControls: score.priorityControls
  };
}

function generateComponentNarrative(
  componentType: 'threat' | 'vulnerability' | 'impact' | 'exposure',
  scores: EPThreatScore[]
): string {
  const avgScore = scores.reduce((sum, s) => {
    switch (componentType) {
      case 'threat': return sum + s.threatLikelihood.score;
      case 'vulnerability': return sum + s.vulnerability.score;
      case 'impact': return sum + s.impact.score;
      case 'exposure': return sum + s.exposureFactor.score;
    }
  }, 0) / scores.length;

  const topReasons = scores
    .filter(s => {
      const score = componentType === 'threat' ? s.threatLikelihood.score :
                    componentType === 'vulnerability' ? s.vulnerability.score :
                    componentType === 'impact' ? s.impact.score :
                    s.exposureFactor.score;
      return score >= 6;
    })
    .slice(0, 3)
    .map(s => {
      switch (componentType) {
        case 'threat': return s.threatLikelihood.reasoning;
        case 'vulnerability': return s.vulnerability.reasoning;
        case 'impact': return s.impact.reasoning;
        case 'exposure': return s.exposureFactor.reasoning;
      }
    });

  if (topReasons.length === 0) {
    return `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} factors are within acceptable parameters based on current assessment data.`;
  }

  return topReasons.join(' ');
}

async function buildEPReportData(
  assessmentId: string,
  assessment: any
): Promise<EPReportData | undefined> {
  try {
    console.log(`[ReportDataAssembler] Building EP report data for assessment ${assessmentId}`);
    
    // Fetch interview responses
    const interviewResponsesList = await db.select()
      .from(executiveInterviewResponses)
      .where(eq(executiveInterviewResponses.assessmentId, assessmentId));
    
    // Convert to response map
    const interviewResponses: Record<string, any> = {};
    for (const resp of interviewResponsesList) {
      if (resp.yesNoResponse !== null) {
        interviewResponses[resp.questionId] = resp.yesNoResponse;
      } else if (resp.textResponse) {
        try {
          interviewResponses[resp.questionId] = JSON.parse(resp.textResponse);
        } catch {
          interviewResponses[resp.questionId] = resp.textResponse;
        }
      }
    }
    
    // Merge epProfile if present
    const epProfile = (assessment.epProfile as Record<string, any>) || {};
    const mergedResponses = { ...interviewResponses, ...epProfile };
    
    if (Object.keys(mergedResponses).length < 5) {
      console.log(`[ReportDataAssembler] Insufficient EP data for report (${Object.keys(mergedResponses).length} responses)`);
      return undefined;
    }
    
    // Prepare mapper output
    const mapperOutput = prepareForAIEngine(
      parseInt(assessmentId) || 0,
      mergedResponses,
      []
    );
    
    // Generate dashboard output (includes AI assessment)
    const dashboardOutput: EPDashboardOutput = await generateEPDashboard({
      assessmentId,
      mapperOutput
    });
    
    // Transform to report format
    const threatAssessments: EPThreatAssessment[] = dashboardOutput.threatMatrix.map(mapEPThreatScoreToAssessment);
    
    // Calculate component averages
    const avgThreat = threatAssessments.reduce((sum, t) => sum + t.threatLikelihood.score, 0) / threatAssessments.length;
    const avgVuln = threatAssessments.reduce((sum, t) => sum + t.vulnerability.score, 0) / threatAssessments.length;
    const avgImpact = threatAssessments.reduce((sum, t) => sum + t.impact.score, 0) / threatAssessments.length;
    const avgExposure = threatAssessments.reduce((sum, t) => sum + t.exposureFactor.score, 0) / threatAssessments.length;
    
    // Extract principal info from interview responses
    const principalName = mergedResponses['ep_principal_name'] || 
                          mapperOutput.interviewData.responses?.ep_principal_name ||
                          'Principal';
    const principalTitle = mergedResponses['ep_principal_title'] || 
                           mapperOutput.interviewData.responses?.ep_principal_title ||
                           'Executive';
    const principalCompany = mergedResponses['ep_principal_company'] || 
                             mapperOutput.interviewData.responses?.ep_principal_company ||
                             '';
    
    const epReportData: EPReportData = {
      principalName,
      principalTitle,
      principalCompany,
      overallRiskScore: dashboardOutput.overviewMetrics.overallRiskScore,
      riskClassification: dashboardOutput.overviewMetrics.riskClassification,
      exposureFactor: dashboardOutput.overviewMetrics.exposureFactor,
      aiConfidence: dashboardOutput.aiConfidence,
      assessmentMode: dashboardOutput.mode,
      
      componentSummaries: {
        threat: {
          overallScore: Math.round(avgThreat * 10) / 10,
          narrative: generateComponentNarrative('threat', dashboardOutput.threatMatrix)
        },
        vulnerability: {
          overallScore: Math.round(avgVuln * 10) / 10,
          narrative: generateComponentNarrative('vulnerability', dashboardOutput.threatMatrix)
        },
        impact: {
          overallScore: Math.round(avgImpact * 10) / 10,
          narrative: generateComponentNarrative('impact', dashboardOutput.threatMatrix)
        },
        exposure: {
          overallScore: Math.round(avgExposure * 10) / 10,
          narrative: generateComponentNarrative('exposure', dashboardOutput.threatMatrix)
        }
      },
      
      threatAssessments,
      
      sectionAssessments: mapperOutput.sectionSummaries.map(s => {
        const keyFindings = s.riskSignals.map(rs => rs.signal);
        const riskIndicators = s.riskSignals.filter(rs => rs.severity === 'critical_indicator' || rs.severity === 'concern').length;
        return {
          sectionId: s.sectionId,
          sectionName: s.sectionName,
          completionPercentage: s.completionPercentage,
          riskIndicators,
          keyFindings,
          aiNarrative: keyFindings.length > 0 
            ? `Assessment of ${s.sectionName} identified ${riskIndicators} risk indicators. ${keyFindings.slice(0, 2).join('. ')}.`
            : `${s.sectionName} assessment is ${s.completionPercentage}% complete.`
        };
      }),
      
      prioritizedControls: dashboardOutput.prioritizedControls.map(c => ({
        controlId: c.controlId,
        controlName: c.controlName,
        category: c.category,
        urgency: c.urgency,
        addressesThreats: c.addressesThreats,
        rationale: c.rationale,
        estimatedCost: c.estimatedCost
      })),
      
      topRiskSignals: dashboardOutput.topRiskSignals.map(s => ({
        signal: s.signal,
        severity: s.severity,
        sourceQuestionId: s.sourceQuestionId,
        affectedThreats: s.affectedThreats
      })),
      
      dataGaps: dashboardOutput.completionGaps.map(g => ({
        section: g.section,
        missingQuestions: g.missingQuestions,
        impactOnAssessment: g.impactOnAssessment
      }))
    };
    
    console.log(`[ReportDataAssembler] EP report data built successfully:
    - Threat Assessments: ${threatAssessments.length}
    - Risk Score: ${epReportData.overallRiskScore}
    - Classification: ${epReportData.riskClassification}
    - AI Confidence: ${epReportData.aiConfidence}
    - Prioritized Controls: ${epReportData.prioritizedControls.length}`);
    
    return epReportData;
  } catch (error) {
    console.error('[ReportDataAssembler] Error building EP report data:', error);
    return undefined;
  }
}

function buildRiskContext(
  crimeData: CrimeDataSummary,
  siteIncidents: SiteIncidentData[],
  pois: POIData[],
  capIndexData?: CAPIndexUpload
): string {
  const parts: string[] = [];
  
  if (capIndexData && capIndexData.overallCrimeIndex > 0) {
    const ratingText = capIndexData.comparisonRating 
      ? ` (${capIndexData.comparisonRating.replace('_', ' ')} compared to national average)`
      : '';
    parts.push(`CAP Index Score: ${capIndexData.overallCrimeIndex}${ratingText}. Violent crime rate: ${capIndexData.violentCrimes.rate_per_100k}/100k. Property crime rate: ${capIndexData.propertyCrimes.rate_per_100k}/100k.`);
  }
  
  if (crimeData.totalIncidents > 0) {
    const topCrimes = crimeData.crimeTypes.slice(0, 3).map(c => c.type).join(', ');
    parts.push(`Crime data shows ${crimeData.totalIncidents} incidents in the area (${crimeData.recentIncidents} in the past year). Primary crime types: ${topCrimes}. Overall crime risk level: ${crimeData.riskLevel.toUpperCase()}.`);
  }
  
  if (siteIncidents.length > 0) {
    const criticalIncidents = siteIncidents.filter(i => i.severity === 'critical' || i.severity === 'high');
    parts.push(`${siteIncidents.length} documented site incidents on record${criticalIncidents.length > 0 ? `, including ${criticalIncidents.length} critical/high severity events` : ''}.`);
  }
  
  const highRiskPOIs = pois.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high');
  if (highRiskPOIs.length > 0) {
    parts.push(`${highRiskPOIs.length} high-risk points of interest identified in proximity to the site.`);
  }
  
  return parts.length > 0 
    ? parts.join(' ') 
    : 'No significant geographic risk factors identified in available data.';
}

export async function assembleReportData(assessmentId: string): Promise<ReportDataPackage> {
  console.log(`[ReportDataAssembler] Assembling data for assessment: ${assessmentId}`);
  
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, assessmentId));
  
  if (!assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`);
  }

  const [scenariosList, controlsList, assetsList, treatmentPlansList] = await Promise.all([
    db.select().from(riskScenarios).where(eq(riskScenarios.assessmentId, assessmentId)),
    db.select().from(controls).where(eq(controls.assessmentId, assessmentId)),
    db.select().from(riskAssets).where(eq(riskAssets.assessmentId, assessmentId)),
    db.select().from(treatmentPlans).where(eq(treatmentPlans.assessmentId, assessmentId))
  ]);

  const [interviewFindingsList, documentedIncidentsList] = await Promise.all([
    db.select().from(interviewFindings).where(eq(interviewFindings.assessmentId, assessmentId)),
    db.select().from(documentedIncidents).where(eq(documentedIncidents.assessmentId, assessmentId))
  ]);

  let siteData = null;
  if (assessment.siteId) {
    const [site] = await db.select().from(sites).where(eq(sites.id, assessment.siteId));
    siteData = site;
  }

  let executiveProfile = null;
  const assessmentType = mapTemplateToAssessmentType(assessment.templateId);
  if (assessmentType === 'executive-protection') {
    const [profile] = await db.select().from(executiveProfiles).where(eq(executiveProfiles.assessmentId, assessmentId));
    executiveProfile = profile;
  }

  const threatDomains = mapToThreatDomains(scenariosList, controlsList);
  const siteWalkFindings = buildSiteWalkFindings(controlsList);
  let recommendations = buildRecommendations(controlsList, treatmentPlansList);
  let riskScores = calculateOverallRiskScore(scenariosList);

  const mappedInterviewFindings: InterviewFindingType[] = interviewFindingsList.map(f => ({
    id: f.id,
    assessmentId: f.assessmentId,
    source: f.source,
    sourceRole: f.sourceRole || 'Unknown',
    interviewDate: f.interviewDate?.toISOString() || new Date().toISOString(),
    finding: f.finding,
    directQuote: f.directQuote || undefined,
    linkedVulnerabilityId: f.linkedVulnerabilityId || undefined,
    linkedThreatDomainId: f.linkedThreatDomainId || undefined,
    severity: (f.severity as 'critical' | 'high' | 'medium' | 'low') || 'medium',
    usedInReport: f.usedInReport,
    createdAt: f.createdAt?.toISOString() || new Date().toISOString()
  }));

  const mappedDocumentedIncidents: DocIncidentType[] = documentedIncidentsList.map(i => ({
    id: i.id,
    assessmentId: i.assessmentId,
    description: i.description,
    incidentDate: i.incidentDate?.toISOString() || new Date().toISOString(),
    source: i.source || 'Unknown',
    sourceRole: i.sourceRole || undefined,
    threatDomainId: i.threatDomainId || undefined,
    severity: (i.severity as 'critical' | 'high' | 'medium' | 'low') || 'medium',
    actionTaken: i.actionTaken || undefined,
    createdAt: i.createdAt?.toISOString() || new Date().toISOString()
  }));

  let facility: FacilityProfile | undefined;
  if (siteData) {
    facility = {
      id: siteData.id,
      name: siteData.name,
      address: siteData.address || '',
      city: siteData.city || '',
      state: siteData.state || '',
      country: siteData.country || 'USA',
      facilityType: 'Commercial',
      squareFootage: undefined,
      employeeCount: undefined,
      visitorVolume: 'medium',
      operatingHours: '24/7',
      criticalAssets: assetsList.map(a => a.name),
      adjacentOccupancies: [],
      parkingConfiguration: 'Standard',
      perimeterDescription: 'Standard perimeter'
    };
  }

  let principal: PrincipalProfile | undefined;
  if (executiveProfile) {
    principal = {
      id: executiveProfile.id,
      name: executiveProfile.fullName,
      title: executiveProfile.title || 'Executive',
      organization: executiveProfile.companyRole || '',
      publicExposure: 'medium',
      travelFrequency: 'moderate',
      mediaProfile: 'limited',
      politicalExposure: 'none',
      wealthIndicators: 'affluent',
      familyConsiderations: [],
      knownThreats: [],
      currentSecurityMeasures: []
    };
  }

  let geographicIntelligence: GeographicIntelligence | undefined;
  if (assessment.siteId) {
    geographicIntelligence = await fetchGeographicIntelligence(assessment.siteId, assessmentId);
  }

  // Build EP-specific report data if this is an executive protection assessment
  let epReportData: EPReportData | undefined;
  if (assessmentType === 'executive-protection') {
    epReportData = await buildEPReportData(assessmentId, assessment);
  }

  // For EP assessments, populate principal from epReportData and override riskScores
  if (epReportData) {
    // Populate principal from EP interview data
    if (epReportData.principalName) {
      principal = {
        id: assessmentId,
        name: epReportData.principalName,
        title: epReportData.principalTitle || 'Executive',
        organization: epReportData.principalCompany || '',
        publicExposure: 'medium',
        travelFrequency: 'moderate',
        mediaProfile: 'limited',
        politicalExposure: 'none',
        wealthIndicators: 'affluent',
        familyConsiderations: [],
        knownThreats: [],
        currentSecurityMeasures: []
      };
    }
    
    // Override riskScores with EP data (normalize riskClassification to lowercase)
    riskScores = {
      overallScore: epReportData.overallRiskScore,
      normalizedScore: epReportData.overallRiskScore,
      riskLevel: epReportData.riskClassification.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
      categoryBreakdown: [
        { category: 'Threat', score: epReportData.componentSummaries.threat.overallScore * 10, weight: 0.25 },
        { category: 'Vulnerability', score: epReportData.componentSummaries.vulnerability.overallScore * 10, weight: 0.25 },
        { category: 'Impact', score: epReportData.componentSummaries.impact.overallScore * 10, weight: 0.25 },
        { category: 'Exposure', score: epReportData.componentSummaries.exposure.overallScore * 10, weight: 0.25 }
      ],
      controlEffectiveness: 50,
      residualRisk: epReportData.overallRiskScore * 0.7
    };
    
    // Merge EP prioritized controls into recommendations (guard against undefined)
    const epRecommendations: Recommendation[] = (epReportData.prioritizedControls || []).map((c, idx) => ({
      id: c.controlId || `ep-control-${idx}`,
      title: c.controlName,
      description: c.rationale,
      priority: c.urgency === 'immediate' ? 'immediate' as const : 
                c.urgency === 'short_term' ? 'short-term' as const : 'medium-term' as const,
      category: c.category,
      estimatedCost: c.estimatedCost || 'TBD',
      estimatedTimeframe: c.urgency === 'immediate' ? '0-30 days' : 
                          c.urgency === 'short_term' ? '30-60 days' : '60-90 days',
      linkedThreatDomains: c.addressesThreats,
      linkedFindings: [],
      expectedImpact: `Addresses ${c.addressesThreats.length} threat(s)`,
      implementationComplexity: 'medium'
    }));
    
    // Prepend EP recommendations to existing recommendations
    recommendations = [...epRecommendations, ...recommendations];
  }

  const reportData: ReportDataPackage = {
    assessmentId,
    assessmentType,
    generatedAt: new Date().toISOString(),
    principal,
    facility,
    threatDomains,
    documentedIncidents: mappedDocumentedIncidents,
    activistGroups: [],
    siteWalkFindings,
    interviewFindings: mappedInterviewFindings,
    recommendations,
    riskScores,
    geographicIntelligence,
    epReportData
  };

  console.log(`[ReportDataAssembler] Data assembled successfully:
  - Threat Domains: ${threatDomains.length}
  - Interview Findings: ${mappedInterviewFindings.length}
  - Documented Incidents: ${mappedDocumentedIncidents.length}
  - Site Walk Findings: ${siteWalkFindings.length}
  - Recommendations: ${recommendations.length}
  - Overall Risk Level: ${riskScores.riskLevel}
  - Geographic Intelligence: ${geographicIntelligence ? 'included' : 'not available'}
  - EP Report Data: ${epReportData ? `included (${epReportData.threatAssessments.length} threats, ${epReportData.aiConfidence} confidence)` : 'not applicable'}`);

  return reportData;
}
