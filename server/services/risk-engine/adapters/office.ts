import type { IStorage } from '../../../storage';
import type { Assessment, OfficeProfile } from '../../../shared/schema';

export interface OfficeSafetyScore {
  riskScore: number; // 0-100 (0 = minimal risk, 100 = critical risk)
  violenceRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  dataRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyVulnerabilities: string[]; // Human-readable risk factors
}

export class OfficeAdapter {
  constructor(private storage: IStorage) {}

  /**
   * Calculate Office Safety Score focusing on Workplace Violence and Data Security
   * 
   * Workplace Violence Risk Scoring:
   * - Base Score: 0
   * - +40 pts: Large employee count (>200) without active shooter training
   * - +30 pts: High visitor volume without visitor management system
   * - +20 pts: Missing panic buttons
   * - +15 pts: Missing mass notification system
   * - +10 pts per missing critical emergency control
   * 
   * Data Security Risk Scoring:
   * - +40 pts: Restricted data without clean desk policy
   * - +30 pts: Restricted data without full disk encryption
   * - +20 pts: Confidential/Restricted data without MFA
   * - +15 pts: Executive presence without executive protection
   * - +10 pts per missing critical data control
   * 
   * Risk Level Thresholds:
   * - 0-24: Low
   * - 25-49: Medium
   * - 50-74: High
   * - 75-100: Critical
   */
  async calculateOfficeSafety(assessment: Assessment): Promise<OfficeSafetyScore> {
    const profile: OfficeProfile = (assessment.office_profile as any) || {};
    let violenceRiskScore = 0;
    let dataRiskScore = 0;
    const keyVulnerabilities: string[] = [];

    // Get existing controls
    const controls = await this.storage.getControls(assessment.id);
    
    // Guardrail: Check if controls data exists
    if (!controls || controls.length === 0) {
      keyVulnerabilities.push('No security controls documented - complete control inventory to enable safety analysis');
      
      return {
        riskScore: 0,
        violenceRiskLevel: 'Low',
        dataRiskLevel: 'Low',
        keyVulnerabilities
      };
    }
    
    // Normalize control names for robust matching
    const normalizeControlName = (name: string) => 
      name.toLowerCase()
        .replace(/[\u002D\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')  // Normalize all dash/hyphen characters
        .replace(/\s+/g, ' ')
        .trim();
    
    const existingControlNames = controls
      .filter(c => c.controlType === 'existing')
      .map(c => normalizeControlName((c as any).name || c.description || ''));

    // Helper function to check if a control exists
    const hasControl = (controlName: string): boolean => {
      const normalized = normalizeControlName(controlName);
      return existingControlNames.some(name => {
        if (!name || name.length < 3 || !normalized || normalized.length < 3) return false;
        if (name === normalized) return true;
        if (name.includes(normalized) && normalized.length >= 10) return true;
        if (normalized.includes(name) && name.length >= 10) return true;
        return false;
      });
    };

    // ==================== WORKPLACE VIOLENCE RISK ====================
    
    // Factor 1: Employee Count + Active Shooter Preparedness
    if (profile.employeeCount) {
      const largePopulation = profile.employeeCount === '201-1000' || profile.employeeCount === '1000+';
      
      if (largePopulation && !hasControl('Active Shooter Training')) {
        violenceRiskScore += 40;
        keyVulnerabilities.push(`${profile.employeeCount} employees without active shooter training creates critical mass casualty risk`);
      }
      
      if (largePopulation && !hasControl('Panic Buttons')) {
        violenceRiskScore += 20;
        keyVulnerabilities.push('Large employee population lacks panic button emergency alert capability');
      }
    }

    // Factor 2: Visitor Volume + Access Control
    if (profile.visitorVolume === 'High') {
      if (!hasControl('Visitor Management System')) {
        violenceRiskScore += 30;
        keyVulnerabilities.push('High visitor volume without digital tracking system increases unauthorized access risk');
      }
      
      if (!hasControl('Visitor Escort Policy')) {
        violenceRiskScore += 15;
        keyVulnerabilities.push('Unescorted visitors in high-traffic facility pose security risk');
      }
    }

    // Factor 3: Critical Emergency Response Controls
    const criticalEmergencyControls = [
      { name: 'Mass Notification System', points: 15, reason: 'No mass alert system delays emergency response' },
      { name: 'Evacuation Plan', points: 10, reason: 'Missing evacuation procedures increase casualty risk' },
      { name: 'AED - Automated External Defibrillator', points: 10, reason: 'No AED equipment reduces cardiac emergency survival rates' },
      { name: 'Lockdown Procedure', points: 10, reason: 'No lockdown protocol for active threat situations' },
      { name: 'First Aid Kits', points: 5, reason: 'Insufficient medical supplies for emergency treatment' },
      { name: 'Emergency Communication Plan', points: 5, reason: 'No structured crisis communication protocol' }
    ];

    criticalEmergencyControls.forEach(control => {
      if (!hasControl(control.name)) {
        violenceRiskScore += control.points;
        keyVulnerabilities.push(control.reason);
      }
    });

    // Cap violence risk score at 100
    violenceRiskScore = Math.min(violenceRiskScore, 100);

    // ==================== DATA SECURITY RISK ====================
    
    // Factor 1: Data Sensitivity + Clean Desk Policy
    if (profile.dataSensitivity === 'Restricted') {
      if (!hasControl('Clean Desk Policy')) {
        dataRiskScore += 40;
        keyVulnerabilities.push('Restricted data without clean desk policy creates document exposure risk');
      }
      
      if (!hasControl('Full Disk Encryption')) {
        dataRiskScore += 30;
        keyVulnerabilities.push('Restricted data on unencrypted devices vulnerable to theft');
      }
      
      if (!hasControl('Data Loss Prevention')) {
        dataRiskScore += 20;
        keyVulnerabilities.push('No DLP system to prevent data exfiltration');
      }
    }

    if (profile.dataSensitivity === 'Confidential' || profile.dataSensitivity === 'Restricted') {
      if (!hasControl('Multi-Factor Authentication')) {
        dataRiskScore += 20;
        keyVulnerabilities.push('Sensitive data accessible without MFA increases credential compromise risk');
      }
      
      if (!hasControl('Security Awareness Training')) {
        dataRiskScore += 15;
        keyVulnerabilities.push('No employee training on phishing and social engineering threats');
      }
    }

    // Factor 2: Executive Presence + Protection
    if (profile.hasExecutivePresence) {
      if (!hasControl('Executive Protection')) {
        dataRiskScore += 15;
        keyVulnerabilities.push('High-value executives without enhanced security measures');
      }
      
      if (!hasControl('Threat Assessment Team')) {
        violenceRiskScore += 10;
        keyVulnerabilities.push('No team to evaluate concerning behaviors targeting executives');
      }
    }

    // Factor 3: Critical Data Security Controls
    const criticalDataControls = [
      { name: 'Paper Shredders', points: 10, reason: 'No document destruction process for sensitive materials' },
      { name: 'Locked Filing Cabinets', points: 10, reason: 'Physical documents lack secure storage' },
      { name: 'USB Port Locks', points: 10, reason: 'No prevention of unauthorized data transfer via USB' },
      { name: 'Mobile Device Management', points: 10, reason: 'No remote wipe capability for lost/stolen devices' },
      { name: 'Background Checks - All Staff', points: 10, reason: 'No pre-employment screening for insider threat risk' },
      { name: 'Network Segmentation', points: 10, reason: 'Flat network allows lateral movement after breach' }
    ];

    criticalDataControls.forEach(control => {
      if (!hasControl(control.name)) {
        dataRiskScore += control.points;
        keyVulnerabilities.push(control.reason);
      }
    });

    // Cap data risk score at 100
    dataRiskScore = Math.min(dataRiskScore, 100);

    // Calculate overall risk score (weighted average: 60% violence + 40% data)
    const riskScore = Math.round((violenceRiskScore * 0.6) + (dataRiskScore * 0.4));

    // Determine risk levels
    const getRiskLevel = (score: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
      if (score >= 75) return 'Critical';
      if (score >= 50) return 'High';
      if (score >= 25) return 'Medium';
      return 'Low';
    };

    return {
      riskScore,
      violenceRiskLevel: getRiskLevel(violenceRiskScore),
      dataRiskLevel: getRiskLevel(dataRiskScore),
      keyVulnerabilities
    };
  }

  /**
   * Standard T×V×I risk calculation for office scenarios
   */
  async calculateRisk(assessment: Assessment): Promise<number> {
    // Placeholder for standard risk calculation
    return 0;
  }
}
