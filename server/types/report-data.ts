import type { AssessmentType } from './report-recipe';

export interface ReportDataPackage {
  assessmentId: string;
  assessmentType: AssessmentType;
  generatedAt: string;
  principal?: PrincipalProfile;
  facility?: FacilityProfile;
  threatDomains: ThreatDomain[];
  documentedIncidents: DocumentedIncident[];
  activistGroups: ActivistGroup[];
  siteWalkFindings: SiteWalkFinding[];
  interviewFindings: InterviewFinding[];
  capIndexData?: CAPIndexData;
  recommendations: Recommendation[];
  riskScores: RiskScoreData;
  tcorData?: TCORData;
  geographicIntelligence?: GeographicIntelligence;
}

export interface GeographicIntelligence {
  crimeData: CrimeDataSummary;
  siteIncidents: SiteIncidentData[];
  pointsOfInterest: POIData[];
  capIndexData?: CAPIndexUpload;
  riskContext: string;
}

export interface CAPIndexUpload {
  overallCrimeIndex: number;
  violentCrimes: {
    total: number;
    rate_per_100k: number;
    breakdown?: {
      murder?: number;
      assault?: number;
      robbery?: number;
      rape?: number;
    };
  };
  propertyCrimes: {
    total: number;
    rate_per_100k: number;
    breakdown?: {
      burglary?: number;
      theft?: number;
      auto_theft?: number;
    };
  };
  comparisonRating?: 'very_high' | 'high' | 'average' | 'low' | 'very_low';
  dataTimePeriod?: string;
  dataSource: string;
  city?: string;
  state?: string;
  importDate: string;
}

export interface CrimeDataSummary {
  totalIncidents: number;
  recentIncidents: number;
  crimeTypes: { type: string; count: number; severity: string }[];
  timeRange: { start: string; end: string };
  hotspots: string[];
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface SiteIncidentData {
  id: string;
  title: string;
  description: string;
  incidentDate: string;
  incidentType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  resolution?: string;
}

export interface POIData {
  id: string;
  name: string;
  poiType: string;
  distance?: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'neutral';
  notes?: string;
}

export interface PrincipalProfile {
  id: string;
  name: string;
  title: string;
  organization: string;
  publicExposure: 'low' | 'medium' | 'high' | 'very-high';
  travelFrequency: 'minimal' | 'moderate' | 'frequent' | 'extensive';
  mediaProfile: 'private' | 'limited' | 'public' | 'celebrity';
  politicalExposure: 'none' | 'indirect' | 'direct' | 'prominent';
  wealthIndicators: 'modest' | 'affluent' | 'wealthy' | 'ultra-high';
  familyConsiderations: string[];
  knownThreats: string[];
  currentSecurityMeasures: string[];
}

export interface FacilityProfile {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  facilityType: string;
  squareFootage?: number;
  employeeCount?: number;
  visitorVolume?: 'low' | 'medium' | 'high' | 'very-high';
  operatingHours: string;
  criticalAssets: string[];
  adjacentOccupancies: string[];
  parkingConfiguration: string;
  perimeterDescription: string;
}

export interface ThreatDomain {
  id: string;
  name: string;
  category: string;
  description: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  mitigatingControls: string[];
  vulnerabilities: string[];
  historicalIncidents: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
}

export interface DocumentedIncident {
  id: string;
  assessmentId: string;
  description: string;
  incidentDate: string;
  source: string;
  sourceRole?: string;
  threatDomainId?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  actionTaken?: string;
  createdAt: string;
}

export interface ActivistGroup {
  id: string;
  name: string;
  ideology: string;
  activityLevel: 'dormant' | 'low' | 'moderate' | 'active' | 'highly-active';
  geographicReach: 'local' | 'regional' | 'national' | 'international';
  tacticsUsed: string[];
  targetProfile: string;
  recentActivity: string[];
  threatAssessment: string;
  lastActivityDate?: string;
}

export interface SiteWalkFinding {
  id: string;
  assessmentId: string;
  location: string;
  zone: string;
  category: string;
  finding: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  photoEvidence?: string[];
  recommendation: string;
  estimatedCost?: string;
  priority: number;
  linkedControlId?: string;
  createdAt: string;
}

export interface InterviewFinding {
  id: string;
  assessmentId: string;
  source: string;
  sourceRole: string;
  interviewDate: string;
  finding: string;
  directQuote?: string;
  linkedVulnerabilityId?: string;
  linkedThreatDomainId?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  usedInReport: boolean;
  createdAt: string;
}

export interface CAPIndexData {
  overallScore: number;
  previousScore?: number;
  changeDirection: 'improved' | 'stable' | 'declined';
  categoryScores: {
    category: string;
    score: number;
    weight: number;
    findings: number;
  }[];
  benchmarkComparison?: {
    industryAverage: number;
    percentile: number;
  };
  assessmentDate: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  category: string;
  estimatedCost: string;
  estimatedTimeframe: string;
  linkedThreatDomains: string[];
  linkedFindings: string[];
  expectedImpact: string;
  implementationComplexity: 'low' | 'medium' | 'high';
  responsibleParty?: string;
}

export interface RiskScoreData {
  overallScore: number;
  normalizedScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  categoryBreakdown: {
    category: string;
    score: number;
    weight: number;
  }[];
  controlEffectiveness: number;
  residualRisk: number;
  trendData?: {
    date: string;
    score: number;
  }[];
}

export interface TCORData {
  totalAnnualExposure: number;
  directCosts: {
    annualLiabilityEstimates: number;
    securityIncidentCost: number;
    assetLossExposure: number;
  };
  indirectCosts: {
    turnoverCost: number;
    brandDamageEstimate: number;
    operationalDisruption: number;
  };
  potentialSavings: number;
  roiProjection: number;
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}
