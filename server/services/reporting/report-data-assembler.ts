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
  documentedIncidents
} from "@shared/schema";
import { eq } from "drizzle-orm";
import type { 
  ReportDataPackage, 
  ThreatDomain, 
  DocumentedIncident as DocIncidentType,
  InterviewFinding as InterviewFindingType,
  SiteWalkFinding,
  Recommendation,
  RiskScoreData,
  FacilityProfile,
  PrincipalProfile
} from "../../types/report-data";
import type { AssessmentType } from "../../types/report-recipe";

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
  const recommendations = buildRecommendations(controlsList, treatmentPlansList);
  const riskScores = calculateOverallRiskScore(scenariosList);

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
    riskScores
  };

  console.log(`[ReportDataAssembler] Data assembled successfully:
  - Threat Domains: ${threatDomains.length}
  - Interview Findings: ${mappedInterviewFindings.length}
  - Documented Incidents: ${mappedDocumentedIncidents.length}
  - Site Walk Findings: ${siteWalkFindings.length}
  - Recommendations: ${recommendations.length}
  - Overall Risk Level: ${riskScores.riskLevel}`);

  return reportData;
}
