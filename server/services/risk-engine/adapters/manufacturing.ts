import type { IStorage } from '../../../storage';
import type { Assessment } from '@/shared/schema';

export interface ProductionContinuityScore {
  score: number; // 0-100 (0 = minimal risk, 100 = critical risk)
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedDailyDowntimeCost: number; // USD
  riskFactors: string[]; // Human-readable explanations
}

export interface ManufacturingProfile {
  annualProductionValue?: number;
  shiftOperations?: '1' | '2' | '24/7';
  ipTypes?: string[]; // e.g., ['Patents', 'Trade Secrets', 'Proprietary Processes']
  hazmatPresent?: boolean;
  // TCOR - Total Cost of Risk fields
  employeeCount?: number;
  annualTurnoverRate?: number; // percentage (e.g., 50 for 50%)
  avgHiringCost?: number; // dollars per hire
  annualLiabilityEstimates?: number; // annual legal/insurance/WC costs
  securityIncidentsPerYear?: number; // number of incidents
  brandDamageEstimate?: number; // estimated brand/reputation cost
}

export class ManufacturingAdapter {
  constructor(private storage: IStorage) {}

  /**
   * Calculate Production Continuity Score based on Section 9.2 of Manufacturing Framework
   * 
   * Scoring Rubric:
   * - Base Score: 0
   * - +20 pts: Annual Production Value > $100M (high-value disruption target)
   * - +10 pts: 24/7 Operations (higher impact of downtime)
   * - +10 pts: Missing 'Production Continuity Plan' control
   * - +5 pts per missing critical control (Fire Suppression, Backup Power, Network Segmentation)
   * 
   * Risk Level Thresholds:
   * - 0-24: Low
   * - 25-49: Medium
   * - 50-74: High
   * - 75-100: Critical
   */
  async calculateProductionContinuityScore(assessment: Assessment): Promise<ProductionContinuityScore> {
    const profile: ManufacturingProfile = (assessment.manufacturing_profile as any) || {};
    let score = 0;
    const riskFactors: string[] = [];

    // Factor 1: Annual Production Value Risk
    if (profile.annualProductionValue && profile.annualProductionValue > 100000000) {
      score += 20;
      riskFactors.push('High-value production exceeding $100M annually increases downtime impact');
    } else if (profile.annualProductionValue && profile.annualProductionValue > 10000000) {
      score += 10;
      riskFactors.push('Significant production value creates moderate downtime risk');
    }

    // Factor 2: Shift Operations Risk
    if (profile.shiftOperations === '24/7') {
      score += 10;
      riskFactors.push('24/7 operations mean any disruption has immediate business impact');
    } else if (profile.shiftOperations === '2') {
      score += 5;
      riskFactors.push('Multi-shift operations increase complexity and disruption impact');
    }

    // Factor 3: HAZMAT Presence
    if (profile.hazmatPresent) {
      score += 10;
      riskFactors.push('Hazardous materials present require enhanced safety protocols');
    }

    // Factor 4: IP Protection Needs
    if (profile.ipTypes && profile.ipTypes.length > 0) {
      score += 5 * Math.min(profile.ipTypes.length, 3); // Max +15 pts for IP
      riskFactors.push(`${profile.ipTypes.length} types of intellectual property requiring protection`);
    }

    // Factor 5: Control Gaps (Detective)
    const controls = await this.storage.getControls(assessment.id);
    const existingControls = controls.filter(c => c.controlType === 'existing');
    
    const criticalControls = [
      'Production Continuity Plan',
      'Automated Fire Suppression - Production Areas',
      'Backup Generator - UPS',
      'Network Segmentation - OT/IT'
    ];

    const missingControls = criticalControls.filter(critical => 
      !existingControls.some(c => c.description?.includes(critical) || c.name === critical)
    );

    if (missingControls.includes('Production Continuity Plan')) {
      score += 10;
      riskFactors.push('No documented production continuity plan increases recovery time');
    }

    missingControls.filter(c => c !== 'Production Continuity Plan').forEach(control => {
      score += 5;
      riskFactors.push(`Missing control: ${control}`);
    });

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine risk level
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (score >= 75) {
      riskLevel = 'Critical';
    } else if (score >= 50) {
      riskLevel = 'High';
    } else if (score >= 25) {
      riskLevel = 'Medium';
    }

    // Calculate estimated daily downtime cost
    // Formula: Annual Production Value / 365 days
    const estimatedDailyDowntimeCost = profile.annualProductionValue 
      ? Math.round(profile.annualProductionValue / 365) 
      : 0;

    return {
      score,
      riskLevel,
      estimatedDailyDowntimeCost,
      riskFactors
    };
  }

  /**
   * Standard T×V×I risk calculation for manufacturing scenarios
   * Implements threat × vulnerability × impact with control effectiveness reduction
   */
  calculateRisk(
    likelihood: number,
    vulnerability: number,
    impact: number,
    exposure?: number,
    controlEffectiveness: number = 0
  ): number {
    // Standard formula for manufacturing (same as retail/warehouse)
    const inherentRisk = likelihood * vulnerability * impact;
    const residualRisk = inherentRisk * (1 - controlEffectiveness);
    // Normalize to 0-100 scale (max raw score is 5×5×5 = 125)
    return Math.round((residualRisk / 125) * 100);
  }
}

/**
 * TOTAL COST OF RISK (TCOR) CALCULATION
 * Calculates comprehensive annual risk exposure including direct and indirect costs
 */

export interface TCORBreakdown {
  directLoss: number; // Production downtime costs
  turnoverCost: number; // Security-related employee turnover costs
  liabilityCost: number; // Insurance, legal, workers' comp
  incidentCost: number; // Operational disruption from security incidents
  brandDamageCost: number; // Reputation/brand damage
  totalAnnualExposure: number; // Sum of all costs
}

/**
 * Calculate Total Annual Exposure for manufacturing operations
 * 
 * Formula:
 * Total Annual Exposure = Direct Loss + Turnover Cost + Liability Cost + Incident Cost + Brand Damage
 * 
 * Where:
 * - Direct Loss = Estimated production downtime costs (based on daily downtime cost)
 * - Turnover Cost = (Employee Count × Turnover Rate × Hiring Cost) × 0.10
 *   (Assumes 10% of turnover is security-related in manufacturing environments)
 * - Liability Cost = Annual liability/insurance/WC estimates
 * - Incident Cost = Security Incidents × Average Incident Cost ($10,000 per incident baseline for manufacturing)
 * - Brand Damage = Estimated brand/reputation damage
 */
export function calculateTotalCostOfRisk(
  profile: ManufacturingProfile,
  estimatedDailyDowntimeCost: number = 0
): TCORBreakdown {
  // 1. DIRECT LOSS (Production downtime)
  // Assume 2-3 days of downtime risk per year from security incidents
  const assumedDowntimeDays = 2.5;
  const directLoss = estimatedDailyDowntimeCost * assumedDowntimeDays;

  // 2. TURNOVER COST
  const employeeCount = profile.employeeCount || 0;
  const turnoverRate = profile.annualTurnoverRate || 0;
  const avgHiringCost = profile.avgHiringCost || 0;
  // Assume 10% of turnover is security-related (theft, violence, safety issues)
  const securityRelatedTurnoverFactor = 0.10;
  const turnoverCost = employeeCount * (turnoverRate / 100) * avgHiringCost * securityRelatedTurnoverFactor;

  // 3. LIABILITY COST
  const liabilityCost = profile.annualLiabilityEstimates || 0;

  // 4. INCIDENT COST
  const incidentsPerYear = profile.securityIncidentsPerYear || 0;
  const avgIncidentCost = 10000; // $10K baseline (higher than retail/warehouse due to production impact)
  const incidentCost = incidentsPerYear * avgIncidentCost;

  // 5. BRAND DAMAGE COST
  const brandDamageCost = profile.brandDamageEstimate || 0;

  // TOTAL ANNUAL EXPOSURE
  const totalAnnualExposure = 
    directLoss + 
    turnoverCost + 
    liabilityCost + 
    incidentCost + 
    brandDamageCost;

  return {
    directLoss,
    turnoverCost,
    liabilityCost,
    incidentCost,
    brandDamageCost,
    totalAnnualExposure,
  };
}
