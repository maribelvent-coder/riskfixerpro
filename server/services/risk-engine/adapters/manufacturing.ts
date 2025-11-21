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
    const risk = inherentRisk * (1 - controlEffectiveness);
    return Math.round(risk);
  }
}
