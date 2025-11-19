import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Crime-to-Threat Mapping
 * Maps FBI/BJS/City crime categories to specific threat types from the threat library
 */
const CRIME_TO_THREAT_MAPPING = {
  violent: [
    {
      threatName: "Active Shooter",
      category: "Workplace Violence",
      relevanceWeight: 0.3, // How strongly this crime data affects this threat
      likelihoodModifier: 1, // Multiplier for likelihood adjustment
    },
    {
      threatName: "Assault",
      category: "Workplace Violence",
      relevanceWeight: 0.8,
      likelihoodModifier: 1.5,
    },
    {
      threatName: "Robbery",
      category: "Theft",
      relevanceWeight: 0.9,
      likelihoodModifier: 1.8,
    },
    {
      threatName: "Workplace Assault",
      category: "Workplace Violence",
      relevanceWeight: 0.7,
      likelihoodModifier: 1.3,
    },
    {
      threatName: "Armed Robbery",
      category: "Theft",
      relevanceWeight: 0.85,
      likelihoodModifier: 1.6,
    },
  ],
  property: [
    {
      threatName: "Cash Theft",
      category: "Theft",
      relevanceWeight: 0.7,
      likelihoodModifier: 1.4,
    },
    {
      threatName: "Equipment Theft",
      category: "Theft",
      relevanceWeight: 0.8,
      likelihoodModifier: 1.5,
    },
    {
      threatName: "Inventory Shrinkage",
      category: "Theft",
      relevanceWeight: 0.6,
      likelihoodModifier: 1.2,
    },
    {
      threatName: "Vehicle Theft",
      category: "Theft",
      relevanceWeight: 0.85,
      likelihoodModifier: 1.6,
    },
    {
      threatName: "Graffiti",
      category: "Vandalism",
      relevanceWeight: 0.5,
      likelihoodModifier: 1.1,
    },
    {
      threatName: "Property Damage",
      category: "Vandalism",
      relevanceWeight: 0.6,
      likelihoodModifier: 1.2,
    },
    {
      threatName: "Forced Entry",
      category: "Physical Intrusion",
      relevanceWeight: 0.75,
      likelihoodModifier: 1.4,
    },
    {
      threatName: "Unauthorized Entry",
      category: "Physical Intrusion",
      relevanceWeight: 0.7,
      likelihoodModifier: 1.3,
    },
  ],
} as const;

/**
 * Crime severity thresholds for likelihood adjustments
 * Based on crime rates per 100k population
 */
const SEVERITY_THRESHOLDS = {
  violent: {
    veryLow: 100,
    low: 250,
    medium: 400,
    high: 600,
    veryHigh: 800,
  },
  property: {
    veryLow: 1000,
    low: 1800,
    medium: 2500,
    high: 3500,
    veryHigh: 4500,
  },
} as const;

export interface CrimeDataSummary {
  violentTotal: number;
  propertyTotal: number;
  violentRate?: number; // Per 100k
  propertyRate?: number; // Per 100k
  population?: number;
  year: number;
  source: string;
}

export interface ThreatIntelligence {
  threatName: string;
  category: string;
  suggestedLikelihood: string; // "very-low" | "low" | "medium" | "high" | "very-high"
  baselineLikelihood: string;
  rationale: string;
  crimeDataSupport: {
    violentCrimes?: number;
    propertyCrimes?: number;
    relevanceScore: number; // 0-1
  };
}

export interface RiskIntelligenceReport {
  siteId: string;
  siteName: string;
  crimeDataAvailable: boolean;
  crimeSummary?: CrimeDataSummary;
  threatIntelligence: ThreatIntelligence[];
  overallRiskLevel: "low" | "moderate" | "high" | "critical";
  keyInsights: string[];
  recommendedControls: string[];
}

/**
 * Determine crime severity level based on rate per 100k
 */
function getCrimeSeverity(
  crimeType: "violent" | "property",
  rate: number
): "very-low" | "low" | "medium" | "high" | "very-high" {
  const thresholds = SEVERITY_THRESHOLDS[crimeType];
  
  if (rate < thresholds.veryLow) return "very-low";
  if (rate < thresholds.low) return "low";
  if (rate < thresholds.medium) return "medium";
  if (rate < thresholds.high) return "high";
  return "very-high";
}

/**
 * Calculate suggested likelihood based on crime data
 */
function calculateThreatLikelihood(
  threat: (typeof CRIME_TO_THREAT_MAPPING.violent | typeof CRIME_TO_THREAT_MAPPING.property)[number],
  crimeSummary: CrimeDataSummary,
  crimeType: "violent" | "property"
): "very-low" | "low" | "medium" | "high" | "very-high" {
  const rate = crimeType === "violent" ? crimeSummary.violentRate : crimeSummary.propertyRate;
  
  if (!rate) {
    // No rate data, use total counts for rough estimate
    const total = crimeType === "violent" ? crimeSummary.violentTotal : crimeSummary.propertyTotal;
    if (total === 0) return "very-low";
    if (total < 100) return "low";
    if (total < 500) return "medium";
    if (total < 1000) return "high";
    return "very-high";
  }
  
  // Get base severity from crime rate
  const baseSeverity = getCrimeSeverity(crimeType, rate);
  const severityMap: Record<string, number> = {
    "very-low": 1,
    "low": 2,
    "medium": 3,
    "high": 4,
    "very-high": 5,
  };
  
  // Apply threat-specific modifier
  let adjustedLevel = severityMap[baseSeverity] * threat.likelihoodModifier;
  
  // Apply relevance weight (higher relevance = stronger signal)
  adjustedLevel = adjustedLevel * threat.relevanceWeight;
  
  // Round and clamp to 1-5 range
  const finalLevel = Math.max(1, Math.min(5, Math.round(adjustedLevel)));
  
  // Convert back to string key
  const levels = ["very-low", "low", "medium", "high", "very-high"] as const;
  return levels[finalLevel - 1];
}

/**
 * Generate threat intelligence from crime data
 */
async function generateThreatIntelligence(
  crimeSummary: CrimeDataSummary
): Promise<ThreatIntelligence[]> {
  const intelligence: ThreatIntelligence[] = [];
  
  // Fetch threat library for baseline data
  const threatLibrary = await db.select().from(schema.threatLibrary);
  
  // Process violent crime threats
  if (crimeSummary.violentTotal > 0) {
    for (const mapping of CRIME_TO_THREAT_MAPPING.violent) {
      const libraryThreat = threatLibrary.find(t => t.name === mapping.threatName);
      if (!libraryThreat) continue;
      
      const suggestedLikelihood = calculateThreatLikelihood(mapping, crimeSummary, "violent");
      const baselineLikelihood = libraryThreat.typicalLikelihood || "medium";
      
      const rateText = crimeSummary.violentRate 
        ? `${crimeSummary.violentRate.toFixed(1)} per 100k population`
        : `${crimeSummary.violentTotal.toLocaleString()} total incidents`;
      
      intelligence.push({
        threatName: mapping.threatName,
        category: mapping.category,
        suggestedLikelihood,
        baselineLikelihood,
        rationale: `Local violent crime rate (${rateText}) indicates ${suggestedLikelihood.replace('-', ' ')} likelihood for this threat type.`,
        crimeDataSupport: {
          violentCrimes: crimeSummary.violentTotal,
          relevanceScore: mapping.relevanceWeight,
        },
      });
    }
  }
  
  // Process property crime threats
  if (crimeSummary.propertyTotal > 0) {
    for (const mapping of CRIME_TO_THREAT_MAPPING.property) {
      const libraryThreat = threatLibrary.find(t => t.name === mapping.threatName);
      if (!libraryThreat) continue;
      
      const suggestedLikelihood = calculateThreatLikelihood(mapping, crimeSummary, "property");
      const baselineLikelihood = libraryThreat.typicalLikelihood || "medium";
      
      const rateText = crimeSummary.propertyRate 
        ? `${crimeSummary.propertyRate.toFixed(1)} per 100k population`
        : `${crimeSummary.propertyTotal.toLocaleString()} total incidents`;
      
      intelligence.push({
        threatName: mapping.threatName,
        category: mapping.category,
        suggestedLikelihood,
        baselineLikelihood,
        rationale: `Local property crime rate (${rateText}) indicates ${suggestedLikelihood.replace('-', ' ')} likelihood for this threat type.`,
        crimeDataSupport: {
          propertyCrimes: crimeSummary.propertyTotal,
          relevanceScore: mapping.relevanceWeight,
        },
      });
    }
  }
  
  // Sort by relevance score (most relevant first)
  return intelligence.sort((a, b) => 
    b.crimeDataSupport.relevanceScore - a.crimeDataSupport.relevanceScore
  );
}

/**
 * Generate control recommendations based on crime patterns
 */
function generateControlRecommendations(
  crimeSummary: CrimeDataSummary
): string[] {
  const recommendations: string[] = [];
  
  const violentRate = crimeSummary.violentRate || 0;
  const propertyRate = crimeSummary.propertyRate || 0;
  
  // High violent crime recommendations
  if (violentRate > SEVERITY_THRESHOLDS.violent.high || 
      crimeSummary.violentTotal > 500) {
    recommendations.push("Active Threat Response Training (Run-Hide-Fight)");
    recommendations.push("Panic Button System");
    recommendations.push("Armed Security Personnel");
    recommendations.push("Metal Detectors at Entry Points");
    recommendations.push("Lockdown Procedures and Drills");
  } else if (violentRate > SEVERITY_THRESHOLDS.violent.medium) {
    recommendations.push("Workplace Violence Prevention Training");
    recommendations.push("Visitor Screening Procedures");
    recommendations.push("Emergency Communication System");
  }
  
  // High property crime recommendations
  if (propertyRate > SEVERITY_THRESHOLDS.property.high || 
      crimeSummary.propertyTotal > 2000) {
    recommendations.push("Comprehensive CCTV System with 24/7 Monitoring");
    recommendations.push("Access Control System (Card/Biometric)");
    recommendations.push("Perimeter Intrusion Detection");
    recommendations.push("Asset Tracking System");
    recommendations.push("Security Patrol Services");
    recommendations.push("Reinforced Entry Points");
  } else if (propertyRate > SEVERITY_THRESHOLDS.property.medium) {
    recommendations.push("CCTV System at Critical Areas");
    recommendations.push("Alarm System with Local Monitoring");
    recommendations.push("Improved Lighting (Parking/Perimeter)");
    recommendations.push("Inventory Control Procedures");
  }
  
  // General recommendations for any elevated crime
  if (violentRate > SEVERITY_THRESHOLDS.violent.low || 
      propertyRate > SEVERITY_THRESHOLDS.property.low) {
    recommendations.push("Security Awareness Training for All Staff");
    recommendations.push("Crime Prevention Through Environmental Design (CPTED) Assessment");
  }
  
  return recommendations;
}

/**
 * Generate key insights from crime data
 */
function generateKeyInsights(crimeSummary: CrimeDataSummary): string[] {
  const insights: string[] = [];
  
  const violentRate = crimeSummary.violentRate || 0;
  const propertyRate = crimeSummary.propertyRate || 0;
  
  // Violent crime insights
  const violentSeverity = getCrimeSeverity("violent", violentRate);
  if (violentSeverity === "very-high" || violentSeverity === "high") {
    insights.push(`⚠️ High violent crime area - ${violentRate.toFixed(1)} incidents per 100k (${violentSeverity.replace('-', ' ')} risk)`);
  } else if (violentSeverity === "very-low") {
    insights.push(`✓ Low violent crime area - ${violentRate.toFixed(1)} incidents per 100k`);
  }
  
  // Property crime insights
  const propertySeverity = getCrimeSeverity("property", propertyRate);
  if (propertySeverity === "very-high" || propertySeverity === "high") {
    insights.push(`⚠️ High property crime area - ${propertyRate.toFixed(1)} incidents per 100k (${propertySeverity.replace('-', ' ')} risk)`);
  } else if (propertySeverity === "very-low") {
    insights.push(`✓ Low property crime area - ${propertyRate.toFixed(1)} incidents per 100k`);
  }
  
  // Ratio insights
  if (crimeSummary.violentTotal > 0 && crimeSummary.propertyTotal > 0) {
    const ratio = crimeSummary.propertyTotal / crimeSummary.violentTotal;
    if (ratio > 10) {
      insights.push(`Property crimes significantly outnumber violent crimes (${ratio.toFixed(1)}:1 ratio)`);
    } else if (ratio < 3) {
      insights.push(`Unusually high proportion of violent crime relative to property crime`);
    }
  }
  
  // Data source insight
  insights.push(`Data from ${crimeSummary.source} (${crimeSummary.year})`);
  
  return insights;
}

/**
 * Calculate overall risk level based on crime data
 */
function calculateOverallRiskLevel(crimeSummary: CrimeDataSummary): "low" | "moderate" | "high" | "critical" {
  const violentRate = crimeSummary.violentRate || 0;
  const propertyRate = crimeSummary.propertyRate || 0;
  
  const violentSeverity = getCrimeSeverity("violent", violentRate);
  const propertySeverity = getCrimeSeverity("property", propertyRate);
  
  // Critical: Very high in either category
  if (violentSeverity === "very-high") return "critical";
  
  // High: High violent or very high property
  if (violentSeverity === "high" || propertySeverity === "very-high") return "high";
  
  // Moderate: Medium violent or high property
  if (violentSeverity === "medium" || propertySeverity === "high") return "moderate";
  
  // Otherwise low
  return "low";
}

/**
 * Get most recent crime data for a site
 */
async function getSiteCrimeData(siteId: string): Promise<CrimeDataSummary | null> {
  // Get site's crime sources
  const crimeSources = await db
    .select()
    .from(schema.crimeSources)
    .where(eq(schema.crimeSources.siteId, siteId));
  
  if (crimeSources.length === 0) return null;
  
  // Get latest observation for each source and pick the best one
  let bestObservation: (typeof schema.crimeObservations.$inferSelect) | null = null;
  let bestSource: (typeof schema.crimeSources.$inferSelect) | null = null;
  
  for (const source of crimeSources) {
    const observations = await db
      .select()
      .from(schema.crimeObservations)
      .where(eq(schema.crimeObservations.crimeSourceId, source.id))
      .orderBy(desc(schema.crimeObservations.startDate));
    
    if (observations.length > 0 && !bestObservation) {
      bestObservation = observations[0];
      bestSource = source;
    }
  }
  
  if (!bestObservation || !bestSource) return null;
  
  // Parse JSONB data
  const violentData = bestObservation.violentCrimes as any;
  const propertyData = bestObservation.propertyCrimes as any;
  
  const violentTotal = violentData?.total || 0;
  const propertyTotal = propertyData?.total || 0;
  const violentRate = violentData?.rate_per_100k;
  const propertyRate = propertyData?.rate_per_100k;
  
  // Try to infer population from rate and total
  let population: number | undefined;
  if (violentRate && violentTotal > 0) {
    population = Math.round((violentTotal / violentRate) * 100000);
  } else if (propertyRate && propertyTotal > 0) {
    population = Math.round((propertyTotal / propertyRate) * 100000);
  }
  
  const year = bestObservation.startDate 
    ? new Date(bestObservation.startDate).getFullYear()
    : new Date().getFullYear();
  
  return {
    violentTotal,
    propertyTotal,
    violentRate,
    propertyRate,
    population,
    year,
    source: bestSource.dataSource,
  };
}

/**
 * Generate complete risk intelligence report for a site
 */
export async function generateRiskIntelligenceReport(
  siteId: string
): Promise<RiskIntelligenceReport | null> {
  // Get site info
  const sites = await db.select().from(schema.sites).where(eq(schema.sites.id, siteId));
  if (sites.length === 0) return null;
  
  const site = sites[0];
  
  // Get crime data
  const crimeSummary = await getSiteCrimeData(siteId);
  
  if (!crimeSummary) {
    return {
      siteId,
      siteName: site.name,
      crimeDataAvailable: false,
      threatIntelligence: [],
      overallRiskLevel: "low",
      keyInsights: ["No crime data available for this location"],
      recommendedControls: [],
    };
  }
  
  // Generate intelligence
  const threatIntelligence = await generateThreatIntelligence(crimeSummary);
  const keyInsights = generateKeyInsights(crimeSummary);
  const recommendedControls = generateControlRecommendations(crimeSummary);
  const overallRiskLevel = calculateOverallRiskLevel(crimeSummary);
  
  return {
    siteId,
    siteName: site.name,
    crimeDataAvailable: true,
    crimeSummary,
    threatIntelligence,
    overallRiskLevel,
    keyInsights,
    recommendedControls,
  };
}

/**
 * Get threat intelligence for specific threats (for risk scenario creation)
 */
export async function getThreatIntelligence(
  siteId: string,
  threatNames: string[]
): Promise<ThreatIntelligence[]> {
  const report = await generateRiskIntelligenceReport(siteId);
  if (!report || !report.crimeDataAvailable) return [];
  
  return report.threatIntelligence.filter(t => 
    threatNames.includes(t.threatName)
  );
}
