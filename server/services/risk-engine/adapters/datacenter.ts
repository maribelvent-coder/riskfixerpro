import type { IStorage } from '../../../storage';
import type { Assessment, DatacenterProfile } from '@/shared/schema';

export interface UptimeReliabilityScore {
  riskScore: number; // 0-100 (0 = minimal risk, 100 = critical risk)
  slaRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  complianceScore: number; // 0-100 (0 = no compliance, 100 = full compliance)
  complianceGaps: string[]; // Missing controls for compliance
  riskFactors: string[]; // Human-readable explanations
}

// Tier classification definitions (Uptime Institute Tier Standards)
const TIER_SPECS = {
  'Tier 1': { uptime: 99.671, annualDowntime: 28.8 }, // 28.8 hours/year
  'Tier 2': { uptime: 99.741, annualDowntime: 22.0 }, // 22.0 hours/year
  'Tier 3': { uptime: 99.982, annualDowntime: 1.6 },  // 1.6 hours/year
  'Tier 4': { uptime: 99.995, annualDowntime: 0.4 }   // 0.4 hours/year (26 minutes/year)
};

// Compliance requirement mappings to critical controls
const COMPLIANCE_CONTROL_MAP: Record<string, string[]> = {
  'SOC 2': [
    'Multi-Factor Authentication (MFA)',
    'Privileged Access Management (PAM)',
    'Security Information & Event Management (SIEM)',
    'Access Log Retention - 1 Year',
    'Backup System - 3-2-1 Rule',
    'Change Management Process',
    'Incident Response Plan',
    'SOC 2 Type II Audit - Annual'
  ],
  'ISO 27001': [
    'Security Information & Event Management (SIEM)',
    'Access Log Retention - 1 Year',
    'Multi-Factor Authentication (MFA)',
    'Background Checks - All Staff',
    'Security Awareness Training',
    'Incident Response Plan',
    'Disaster Recovery Plan',
    'ISO 27001 Certification'
  ],
  'PCI-DSS': [
    'Network Segmentation - VLANs',
    'Next-Gen Firewall with IPS',
    'Multi-Factor Authentication (MFA)',
    'Vulnerability Scanning - Weekly',
    'Patch Management Process',
    'Access Log Retention - 1 Year',
    'PCI-DSS Compliance'
  ],
  'HIPAA': [
    'Endpoint Detection & Response (EDR)',
    'Multi-Factor Authentication (MFA)',
    'Access Log Retention - 1 Year',
    'Backup System - 3-2-1 Rule',
    'Disaster Recovery Plan',
    'Incident Response Plan'
  ],
  'FedRAMP': [
    'Multi-Factor Authentication (MFA)',
    'Privileged Access Management (PAM)',
    'Security Information & Event Management (SIEM)',
    'Endpoint Detection & Response (EDR)',
    'Vulnerability Scanning - Weekly',
    'Patch Management Process',
    'Incident Response Plan',
    'Disaster Recovery Plan'
  ]
};

export class DatacenterAdapter {
  constructor(private storage: IStorage) {}

  /**
   * Calculate Uptime Reliability and Compliance Score
   * 
   * SLA Risk Scoring:
   * - Base Score: 0
   * - +30 pts: Tier classification below required SLA threshold
   * - +20 pts: Missing redundant power (N+1 UPS, generators)
   * - +20 pts: Missing redundant cooling (N+1 CRAC)
   * - +10 pts: Missing fire suppression (VESDA, clean agent)
   * - +10 pts: Missing backup testing
   * - +5 pts per missing critical infrastructure control
   * 
   * Compliance Scoring:
   * - Calculate % of required controls present for each compliance standard
   * - Average across all declared compliance requirements
   * 
   * Risk Level Thresholds:
   * - 0-24: Low
   * - 25-49: Medium
   * - 50-74: High
   * - 75-100: Critical
   */
  async calculateUptimeReliability(assessment: Assessment): Promise<UptimeReliabilityScore> {
    const profile: DatacenterProfile = (assessment.datacenter_profile as any) || {};
    let riskScore = 0;
    const riskFactors: string[] = [];
    const complianceGaps: string[] = [];

    // Factor 1: Tier Classification vs. SLA Risk
    if (profile.tierClassification && profile.uptimeSLA) {
      const requiredUptime = parseFloat(profile.uptimeSLA);
      const tierSpec = TIER_SPECS[profile.tierClassification];
      
      if (tierSpec && requiredUptime > tierSpec.uptime) {
        riskScore += 30;
        riskFactors.push(`${profile.tierClassification} (${tierSpec.uptime}% uptime) cannot meet ${requiredUptime}% SLA target`);
      } else if (tierSpec) {
        riskFactors.push(`${profile.tierClassification} supports ${tierSpec.uptime}% uptime (${tierSpec.annualDowntime} hrs/year downtime)`);
      }
    }

    // Factor 2: Power Capacity Risk
    if (profile.powerCapacity) {
      if (profile.powerCapacity < 100) {
        riskScore += 5;
        riskFactors.push('Low power capacity may limit future growth');
      } else if (profile.powerCapacity > 1000) {
        riskScore += 10;
        riskFactors.push('High power capacity increases criticality of power infrastructure');
      }
    }

    // Factor 3: Infrastructure Control Gaps
    const controls = await this.storage.getControls(assessment.id);
    
    // Guardrail: Check if controls data exists
    if (!controls || controls.length === 0) {
      riskFactors.push('No security controls documented yet - complete control inventory to enable infrastructure risk analysis');
      complianceGaps.push('Complete the facility survey and document existing security controls before calculating compliance gaps');
      
      // Return early with default compliance score since we can't calculate without control data
      return {
        riskScore,
        slaRiskLevel: riskScore >= 75 ? 'Critical' : riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low',
        complianceScore: 0,
        complianceGaps,
        riskFactors
      };
    }
    
    // Normalize control names for robust matching (handles ALL Unicode dash/hyphen variations, spacing, casing)
    const normalizeControlName = (name: string) => 
      name.toLowerCase()
        .replace(/\p{Pd}/gu, '-')  // Unicode-aware: normalize ALL dash/hyphen characters (includes U+2011 non-breaking hyphen, en-dash, em-dash, etc.)
        .replace(/\s+/g, ' ')       // Normalize whitespace
        .trim();
    
    const existingControlNames = controls
      .filter(c => c.controlType === 'existing')
      .map(c => normalizeControlName(c.name || c.description || ''));

    const criticalInfraControls = [
      { name: 'UPS System - N+1 Redundancy', points: 20, reason: 'No redundant UPS increases power outage risk' },
      { name: 'Diesel Generator - N+1', points: 20, reason: 'No redundant generators increases extended outage risk' },
      { name: 'CRAC Units - N+1 Redundancy', points: 20, reason: 'No redundant cooling increases thermal shutdown risk' },
      { name: 'VESDA Fire Detection', points: 10, reason: 'Missing early smoke detection increases fire damage risk' },
      { name: 'Clean Agent Suppression (FM-200/Novec)', points: 10, reason: 'No gas suppression increases equipment damage from fire' },
      { name: 'Backup Testing - Monthly', points: 10, reason: 'No backup testing increases data loss risk' },
      { name: 'Dual Utility Power Feeds', points: 5, reason: 'Single utility feed is single point of failure' },
      { name: 'A+B Power Distribution', points: 5, reason: 'No dual power paths increases single-point failure risk' },
      { name: 'Network Redundancy - N+1 Switches', points: 5, reason: 'No redundant networking increases connectivity failure risk' },
      { name: 'Immutable Backup Storage', points: 5, reason: 'No immutable backups increases ransomware data loss risk' }
    ];

    criticalInfraControls.forEach(control => {
      const normalizedControlName = normalizeControlName(control.name);
      const exists = existingControlNames.some(name => {
        // Skip empty or very short strings to prevent false matches
        if (!name || name.length < 3 || !normalizedControlName || normalizedControlName.length < 3) {
          return false;
        }
        // Exact match
        if (name === normalizedControlName) return true;
        
        // Substring matching: allow if the substring is substantial (>= 10 chars) to prevent generic matches
        // Example: "UPS System - N+1 Redundancy – Model XYZ" contains "UPS System - N+1 Redundancy" (27 chars) ✅
        // Example: "Network Segmentation" contains "Network" (7 chars) ✗
        if (name.includes(normalizedControlName) && normalizedControlName.length >= 10) return true;
        if (normalizedControlName.includes(name) && name.length >= 10) return true;
        
        return false;
      });
      if (!exists) {
        riskScore += control.points;
        riskFactors.push(control.reason);
      }
    });

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Determine SLA risk level
    let slaRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (riskScore >= 75) {
      slaRiskLevel = 'Critical';
    } else if (riskScore >= 50) {
      slaRiskLevel = 'High';
    } else if (riskScore >= 25) {
      slaRiskLevel = 'Medium';
    }

    // Factor 4: Compliance Scoring
    let complianceScore = 100; // Start at 100%, deduct for gaps
    
    if (profile.complianceRequirements && profile.complianceRequirements.length > 0) {
      const complianceScores: number[] = [];
      
      for (const requirement of profile.complianceRequirements) {
        const requiredControls = COMPLIANCE_CONTROL_MAP[requirement] || [];
        if (requiredControls.length === 0) {
          complianceScores.push(100); // Unknown standard, assume compliant
          continue;
        }

        const presentControls = requiredControls.filter(controlName => {
          const normalizedRequired = normalizeControlName(controlName);
          return existingControlNames.some(name => {
            // Skip empty or very short strings to prevent false matches
            if (!name || name.length < 3 || !normalizedRequired || normalizedRequired.length < 3) {
              return false;
            }
            // Exact match
            if (name === normalizedRequired) return true;
            
            // Substring matching: allow if the substring is substantial (>= 10 chars) to prevent generic matches
            if (name.includes(normalizedRequired) && normalizedRequired.length >= 10) return true;
            if (normalizedRequired.includes(name) && name.length >= 10) return true;
            
            return false;
          });
        });

        const standardScore = (presentControls.length / requiredControls.length) * 100;
        complianceScores.push(standardScore);

        // Identify gaps
        const missingControls = requiredControls.filter(controlName => {
          const normalizedRequired = normalizeControlName(controlName);
          return !existingControlNames.some(name => {
            // Skip empty or very short strings to prevent false matches
            if (!name || name.length < 3 || !normalizedRequired || normalizedRequired.length < 3) {
              return false;
            }
            // Exact match
            if (name === normalizedRequired) return true;
            
            // Substring matching: allow if the substring is substantial (>= 10 chars) to prevent generic matches
            if (name.includes(normalizedRequired) && normalizedRequired.length >= 10) return true;
            if (normalizedRequired.includes(name) && name.length >= 10) return true;
            
            return false;
          });
        });

        missingControls.forEach(missing => {
          complianceGaps.push(`${requirement}: ${missing}`);
        });

        riskFactors.push(`${requirement} Compliance: ${Math.round(standardScore)}% (${presentControls.length}/${requiredControls.length} controls present)`);
      }

      // Average compliance across all standards
      complianceScore = complianceScores.length > 0
        ? Math.round(complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length)
        : 100;
    } else {
      riskFactors.push('No compliance requirements declared');
    }

    return {
      riskScore,
      slaRiskLevel,
      complianceScore,
      complianceGaps,
      riskFactors
    };
  }

  /**
   * Standard T×V×I risk calculation for datacenter scenarios
   */
  async calculateRisk(assessment: Assessment): Promise<number> {
    // Placeholder for standard risk calculation
    // Would typically calculate Threat × Vulnerability × Impact
    return 0;
  }
}
