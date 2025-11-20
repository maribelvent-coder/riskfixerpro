export interface InterviewResponse {
  questionId: string;
  answer: string | number | string[] | null;
  notes?: string;
}

export interface ThreatScore {
  threatName: string;
  likelihood: number; // 1-5
  vulnerability: number; // 1-5
  impact: number; // 1-5
  inherentRisk: number; // T × V × I
  contributingFactors: string[];
}

export interface RiskAnalysis {
  threats: ThreatScore[];
  overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  criticalFindings: string[];
  recommendations: string[];
}

/**
 * Main risk mapping service that analyzes interview responses and calculates
 * threat scores using the T×V×I formula from the "No BS" Security Framework
 */
export class InterviewRiskMapper {
  private responses: Map<string, InterviewResponse>;
  
  constructor(responses: InterviewResponse[]) {
    this.responses = new Map(responses.map(r => [r.questionId, r]));
  }
  
  /**
   * Analyze all interview responses and generate threat scores
   */
  analyzeInterview(): RiskAnalysis {
    const threats: ThreatScore[] = [];
    
    // Analyze each threat category
    threats.push(...this.analyzeForcedEntryThreats());
    threats.push(...this.analyzeTailgatingThreats());
    threats.push(...this.analyzeTheftThreats());
    threats.push(...this.analyzeWorkplaceViolenceThreats());
    threats.push(...this.analyzeCyberPhysicalThreats());
    threats.push(...this.analyzeEspionageThreats());
    
    // Calculate overall risk level
    const avgInherentRisk = threats.reduce((sum, t) => sum + t.inherentRisk, 0) / threats.length;
    const overallRiskLevel = this.calculateRiskLevel(avgInherentRisk);
    
    // Identify critical findings
    const criticalFindings = this.identifyCriticalFindings(threats);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(threats);
    
    return {
      threats,
      overallRiskLevel,
      criticalFindings,
      recommendations
    };
  }
  
  /**
   * Analyze forced entry threats (doors, windows, perimeter)
   */
  private analyzeForcedEntryThreats(): ThreatScore[] {
    const threats: ThreatScore[] = [];
    
    // Check perimeter security questions
    const hasFencing = this.getYesNoResponse('1.1');
    const fencingCondition = this.getRatingResponse('1.2');
    const hasPerimeterLighting = this.getYesNoResponse('1.3');
    const lightingQuality = this.getRatingResponse('1.4');
    
    // Check entry point security
    const doorCondition = this.getRatingResponse('2.1');
    const hasReinforcedDoors = this.getYesNoResponse('2.2');
    const windowSecurity = this.getRatingResponse('3.1');
    
    // Calculate Forced Entry threat
    let vulnerability = 5; // Start with maximum vulnerability
    let likelihood = 3; // Medium baseline
    const contributingFactors: string[] = [];
    
    // Reduce vulnerability based on controls
    if (hasFencing === 'yes') {
      vulnerability -= 1;
      if (fencingCondition >= 4) vulnerability -= 0.5;
    } else {
      contributingFactors.push('No perimeter fencing installed');
    }
    
    if (hasPerimeterLighting === 'yes' && lightingQuality >= 4) {
      vulnerability -= 0.5;
    } else {
      contributingFactors.push('Inadequate perimeter lighting');
    }
    
    if (hasReinforcedDoors === 'yes' && doorCondition >= 4) {
      vulnerability -= 1;
    } else {
      contributingFactors.push('Doors not adequately reinforced');
    }
    
    if (windowSecurity < 3) {
      contributingFactors.push('Windows lack adequate security measures');
    } else {
      vulnerability -= 0.5;
    }
    
    // Clamp vulnerability to 1-5 range
    vulnerability = Math.max(1, Math.min(5, vulnerability));
    
    // Impact for forced entry (business disruption, property damage)
    const impact = 4;
    
    threats.push({
      threatName: 'Forced Entry',
      likelihood,
      vulnerability,
      impact,
      inherentRisk: likelihood * vulnerability * impact,
      contributingFactors
    });
    
    return threats;
  }
  
  /**
   * Analyze tailgating and piggybacking threats
   */
  private analyzeTailgatingThreats(): ThreatScore[] {
    const threats: ThreatScore[] = [];
    
    const hasCardAccess = this.getYesNoResponse('4.1');
    const cardAccessQuality = this.getRatingResponse('4.2');
    const hasTurnstiles = this.getYesNoResponse('4.3');
    const hasVisitorManagement = this.getYesNoResponse('5.1');
    const badgeDisplayEnforced = this.getYesNoResponse('5.2');
    const hasSecurityAwareness = this.getYesNoResponse('9.1');
    
    // Tailgating
    let tailgatingVuln = 5;
    const tailgatingFactors: string[] = [];
    
    if (hasCardAccess === 'yes' && cardAccessQuality >= 4) {
      tailgatingVuln -= 1;
    } else {
      tailgatingFactors.push('Card access system not effective');
    }
    
    if (hasTurnstiles === 'yes') {
      tailgatingVuln -= 1.5;
    } else {
      tailgatingFactors.push('No anti-tailgating turnstiles installed');
    }
    
    if (hasVisitorManagement === 'yes') {
      tailgatingVuln -= 0.5;
    }
    
    if (badgeDisplayEnforced !== 'yes') {
      tailgatingFactors.push('Badge display policy not enforced');
    } else {
      tailgatingVuln -= 0.5;
    }
    
    if (hasSecurityAwareness === 'yes') {
      tailgatingVuln -= 0.5;
    } else {
      tailgatingFactors.push('No security awareness training conducted');
    }
    
    tailgatingVuln = Math.max(1, Math.min(5, tailgatingVuln));
    
    threats.push({
      threatName: 'Tailgating',
      likelihood: 4, // High likelihood without controls
      vulnerability: tailgatingVuln,
      impact: 2,
      inherentRisk: 4 * tailgatingVuln * 2,
      contributingFactors: tailgatingFactors
    });
    
    // Piggybacking (similar but with consent)
    let piggybackingVuln = 5;
    const piggybackingFactors: string[] = [];
    
    if (hasSecurityAwareness !== 'yes') {
      piggybackingFactors.push('Employees not trained on access control policy');
    } else {
      piggybackingVuln -= 1;
    }
    
    if (badgeDisplayEnforced !== 'yes') {
      piggybackingFactors.push('Visitors not easily identifiable');
    } else {
      piggybackingVuln -= 1;
    }
    
    if (hasTurnstiles === 'yes') {
      piggybackingVuln -= 1;
    } else {
      piggybackingFactors.push('No physical barriers prevent piggybacking');
    }
    
    piggybackingVuln = Math.max(1, Math.min(5, piggybackingVuln));
    
    threats.push({
      threatName: 'Piggybacking',
      likelihood: 5, // Very high likelihood
      vulnerability: piggybackingVuln,
      impact: 2,
      inherentRisk: 5 * piggybackingVuln * 2,
      contributingFactors: piggybackingFactors
    });
    
    return threats;
  }
  
  /**
   * Analyze theft threats (equipment, intellectual property)
   */
  private analyzeTheftThreats(): ThreatScore[] {
    const threats: ThreatScore[] = [];
    
    const hasCCTV = this.getYesNoResponse('6.1');
    const cctvCoverage = this.getRatingResponse('6.2');
    const hasAssetTracking = this.getYesNoResponse('7.1');
    const hasClearDeskPolicy = this.getYesNoResponse('8.1');
    const sensitiveDataProtection = this.getRatingResponse('8.2');
    const hasBackgroundChecks = this.getYesNoResponse('9.2');
    
    // Equipment Theft
    let equipmentTheftVuln = 4;
    const equipmentFactors: string[] = [];
    
    if (hasCCTV === 'yes' && cctvCoverage >= 4) {
      equipmentTheftVuln -= 1;
    } else {
      equipmentFactors.push('Inadequate video surveillance coverage');
    }
    
    if (hasAssetTracking === 'yes') {
      equipmentTheftVuln -= 1;
    } else {
      equipmentFactors.push('No asset tracking system in place');
    }
    
    if (hasBackgroundChecks === 'yes') {
      equipmentTheftVuln -= 0.5;
    }
    
    equipmentTheftVuln = Math.max(1, Math.min(5, equipmentTheftVuln));
    
    threats.push({
      threatName: 'Equipment Theft',
      likelihood: 3,
      vulnerability: equipmentTheftVuln,
      impact: 3,
      inherentRisk: 3 * equipmentTheftVuln * 3,
      contributingFactors: equipmentFactors
    });
    
    // Intellectual Property Theft
    let ipTheftVuln = 4;
    const ipFactors: string[] = [];
    
    if (hasClearDeskPolicy !== 'yes') {
      ipFactors.push('No clear desk policy to protect sensitive documents');
    } else {
      ipTheftVuln -= 0.5;
    }
    
    if (sensitiveDataProtection < 3) {
      ipFactors.push('Inadequate protection of confidential information');
    } else if (sensitiveDataProtection >= 4) {
      ipTheftVuln -= 1;
    }
    
    if (hasBackgroundChecks === 'yes') {
      ipTheftVuln -= 0.5;
    } else {
      ipFactors.push('Employees not vetted through background checks');
    }
    
    const hasCardAccess = this.getYesNoResponse('4.1');
    if (hasCardAccess === 'yes') {
      ipTheftVuln -= 0.5;
    }
    
    ipTheftVuln = Math.max(1, Math.min(5, ipTheftVuln));
    
    threats.push({
      threatName: 'Intellectual Property Theft',
      likelihood: 3,
      vulnerability: ipTheftVuln,
      impact: 5, // Catastrophic impact
      inherentRisk: 3 * ipTheftVuln * 5,
      contributingFactors: ipFactors
    });
    
    return threats;
  }
  
  /**
   * Analyze workplace violence threats
   */
  private analyzeWorkplaceViolenceThreats(): ThreatScore[] {
    const threats: ThreatScore[] = [];
    
    const hasActiveShooterTraining = this.getYesNoResponse('10.1');
    const hasPanicButtons = this.getYesNoResponse('10.2');
    const hasIncidentResponsePlan = this.getYesNoResponse('10.3');
    const hasWorkplaceViolencePolicy = this.getYesNoResponse('10.4');
    const hasLockdownProcedures = this.getYesNoResponse('10.5');
    
    // Active Shooter
    let activeShooterVuln = 5;
    const activeShooterFactors: string[] = [];
    
    if (hasActiveShooterTraining !== 'yes') {
      activeShooterFactors.push('No active threat response training provided');
    } else {
      activeShooterVuln -= 1;
    }
    
    if (hasPanicButtons !== 'yes') {
      activeShooterFactors.push('No panic buttons or duress alarms installed');
    } else {
      activeShooterVuln -= 0.5;
    }
    
    if (hasLockdownProcedures !== 'yes') {
      activeShooterFactors.push('No lockdown procedures established');
    } else {
      activeShooterVuln -= 1;
    }
    
    if (hasIncidentResponsePlan === 'yes') {
      activeShooterVuln -= 0.5;
    }
    
    activeShooterVuln = Math.max(1, Math.min(5, activeShooterVuln));
    
    threats.push({
      threatName: 'Active Shooter',
      likelihood: 1, // Very low likelihood
      vulnerability: activeShooterVuln,
      impact: 5, // Catastrophic
      inherentRisk: 1 * activeShooterVuln * 5,
      contributingFactors: activeShooterFactors
    });
    
    // Assault / Workplace Violence
    let assaultVuln = 4;
    const assaultFactors: string[] = [];
    
    if (hasWorkplaceViolencePolicy !== 'yes') {
      assaultFactors.push('No workplace violence policy in place');
    } else {
      assaultVuln -= 0.5;
    }
    
    if (hasPanicButtons === 'yes') {
      assaultVuln -= 0.5;
    }
    
    if (hasIncidentResponsePlan === 'yes') {
      assaultVuln -= 0.5;
    }
    
    assaultVuln = Math.max(1, Math.min(5, assaultVuln));
    
    threats.push({
      threatName: 'Assault',
      likelihood: 2,
      vulnerability: assaultVuln,
      impact: 3,
      inherentRisk: 2 * assaultVuln * 3,
      contributingFactors: assaultFactors
    });
    
    return threats;
  }
  
  /**
   * Analyze cyber-physical threats
   */
  private analyzeCyberPhysicalThreats(): ThreatScore[] {
    const threats: ThreatScore[] = [];
    
    const hasNetworkSegmentation = this.getYesNoResponse('11.1');
    const hasMFA = this.getYesNoResponse('11.2');
    const hasPatchManagement = this.getYesNoResponse('11.3');
    const cctvNetworkSecurity = this.getRatingResponse('11.4');
    
    // Access Control System Hack
    let acsHackVuln = 4;
    const acsFactors: string[] = [];
    
    if (hasNetworkSegmentation !== 'yes') {
      acsFactors.push('Security systems not segmented from corporate network');
    } else {
      acsHackVuln -= 1;
    }
    
    if (hasMFA !== 'yes') {
      acsFactors.push('Multi-factor authentication not implemented');
    } else {
      acsHackVuln -= 1;
    }
    
    if (hasPatchManagement !== 'yes') {
      acsFactors.push('No regular security patching schedule');
    } else {
      acsHackVuln -= 0.5;
    }
    
    acsHackVuln = Math.max(1, Math.min(5, acsHackVuln));
    
    threats.push({
      threatName: 'Access Control System Hack',
      likelihood: 2,
      vulnerability: acsHackVuln,
      impact: 4,
      inherentRisk: 2 * acsHackVuln * 4,
      contributingFactors: acsFactors
    });
    
    // Surveillance System Compromise
    let cctvHackVuln = 4;
    const cctvFactors: string[] = [];
    
    if (hasNetworkSegmentation !== 'yes') {
      cctvFactors.push('CCTV systems accessible from corporate network');
    } else {
      cctvHackVuln -= 1;
    }
    
    if (cctvNetworkSecurity < 3) {
      cctvFactors.push('CCTV network security inadequate');
    } else if (cctvNetworkSecurity >= 4) {
      cctvHackVuln -= 1;
    }
    
    if (hasPatchManagement === 'yes') {
      cctvHackVuln -= 0.5;
    }
    
    cctvHackVuln = Math.max(1, Math.min(5, cctvHackVuln));
    
    threats.push({
      threatName: 'Surveillance System Compromise',
      likelihood: 3,
      vulnerability: cctvHackVuln,
      impact: 3,
      inherentRisk: 3 * cctvHackVuln * 3,
      contributingFactors: cctvFactors
    });
    
    return threats;
  }
  
  /**
   * Analyze espionage threats
   */
  private analyzeEspionageThreats(): ThreatScore[] {
    const threats: ThreatScore[] = [];
    
    const hasVisitorEscort = this.getYesNoResponse('12.1');
    const hasClearDesk = this.getYesNoResponse('8.1');
    const hasBackgroundChecks = this.getYesNoResponse('9.2');
    const meetingRoomSecurity = this.getRatingResponse('12.2');
    const documentControlRating = this.getRatingResponse('12.3');
    
    // Corporate Espionage
    let espionageVuln = 4;
    const espionageFactors: string[] = [];
    
    if (hasVisitorEscort !== 'yes') {
      espionageFactors.push('Visitors not escorted in sensitive areas');
    } else {
      espionageVuln -= 0.5;
    }
    
    if (hasClearDesk !== 'yes') {
      espionageFactors.push('Confidential documents left unsecured');
    } else {
      espionageVuln -= 0.5;
    }
    
    if (hasBackgroundChecks !== 'yes') {
      espionageFactors.push('Staff not vetted for access to sensitive information');
    } else {
      espionageVuln -= 0.5;
    }
    
    if (meetingRoomSecurity < 3) {
      espionageFactors.push('Meeting rooms lack privacy controls');
    } else if (meetingRoomSecurity >= 4) {
      espionageVuln -= 0.5;
    }
    
    if (documentControlRating < 3) {
      espionageFactors.push('Document control procedures inadequate');
    } else if (documentControlRating >= 4) {
      espionageVuln -= 0.5;
    }
    
    espionageVuln = Math.max(1, Math.min(5, espionageVuln));
    
    threats.push({
      threatName: 'Corporate Espionage',
      likelihood: 3,
      vulnerability: espionageVuln,
      impact: 5, // Catastrophic
      inherentRisk: 3 * espionageVuln * 5,
      contributingFactors: espionageFactors
    });
    
    // Insider Threat
    let insiderVuln = 4;
    const insiderFactors: string[] = [];
    
    if (hasBackgroundChecks !== 'yes') {
      insiderFactors.push('No pre-employment screening');
    } else {
      insiderVuln -= 0.5;
    }
    
    if (documentControlRating < 3) {
      insiderFactors.push('Weak access controls on sensitive information');
    } else if (documentControlRating >= 4) {
      insiderVuln -= 1;
    }
    
    const hasAccessAudits = this.getYesNoResponse('13.1');
    if (hasAccessAudits !== 'yes') {
      insiderFactors.push('No regular access rights audits conducted');
    } else {
      insiderVuln -= 1;
    }
    
    insiderVuln = Math.max(1, Math.min(5, insiderVuln));
    
    threats.push({
      threatName: 'Insider Threat',
      likelihood: 3,
      vulnerability: insiderVuln,
      impact: 5,
      inherentRisk: 3 * insiderVuln * 5,
      contributingFactors: insiderFactors
    });
    
    return threats;
  }
  
  /**
   * Helper to get yes/no response
   */
  private getYesNoResponse(questionId: string): 'yes' | 'no' | 'unknown' {
    const response = this.responses.get(questionId);
    if (!response || !response.answer) return 'unknown';
    
    const answer = String(response.answer).toLowerCase();
    if (answer === 'yes' || answer === 'true') return 'yes';
    if (answer === 'no' || answer === 'false') return 'no';
    return 'unknown';
  }
  
  /**
   * Helper to get rating response (1-5 scale)
   */
  private getRatingResponse(questionId: string): number {
    const response = this.responses.get(questionId);
    if (!response || !response.answer) return 3; // Default to middle
    
    const rating = Number(response.answer);
    return isNaN(rating) ? 3 : Math.max(1, Math.min(5, rating));
  }
  
  /**
   * Calculate overall risk level from average inherent risk
   */
  private calculateRiskLevel(avgRisk: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (avgRisk < 20) return 'Low';
    if (avgRisk < 40) return 'Medium';
    if (avgRisk < 60) return 'High';
    return 'Critical';
  }
  
  /**
   * Identify critical findings from threat analysis
   */
  private identifyCriticalFindings(threats: ThreatScore[]): string[] {
    const findings: string[] = [];
    
    // Find high-risk threats (inherent risk >= 50)
    const highRiskThreats = threats.filter(t => t.inherentRisk >= 50);
    highRiskThreats.forEach(threat => {
      findings.push(`${threat.threatName}: Inherent Risk ${threat.inherentRisk.toFixed(1)} - ${threat.contributingFactors.join('; ')}`);
    });
    
    // Find threats with very high vulnerability (>= 4)
    const highVulnThreats = threats.filter(t => t.vulnerability >= 4 && !highRiskThreats.includes(t));
    highVulnThreats.forEach(threat => {
      findings.push(`${threat.threatName}: High vulnerability (${threat.vulnerability.toFixed(1)}) - immediate attention required`);
    });
    
    return findings;
  }
  
  /**
   * Generate control recommendations based on threat analysis
   */
  private generateRecommendations(threats: ThreatScore[]): string[] {
    const recommendations: string[] = [];
    const topThreats = threats.sort((a, b) => b.inherentRisk - a.inherentRisk).slice(0, 5);
    
    topThreats.forEach(threat => {
      switch (threat.threatName) {
        case 'Forced Entry':
          if (threat.vulnerability >= 4) {
            recommendations.push('Install perimeter fencing with anti-climb features');
            recommendations.push('Upgrade to reinforced doors and frames with commercial-grade locks');
            recommendations.push('Install security window film or bars on ground-floor windows');
          }
          break;
          
        case 'Tailgating':
        case 'Piggybacking':
          if (threat.vulnerability >= 4) {
            recommendations.push('Install optical turnstiles or speed gates at main entrances');
            recommendations.push('Implement mandatory security awareness training for all employees');
            recommendations.push('Enforce strict badge display policy');
          }
          break;
          
        case 'Active Shooter':
          if (threat.vulnerability >= 3) {
            recommendations.push('Conduct Run-Hide-Fight or ALICE active threat response training');
            recommendations.push('Install panic buttons in key locations (reception, conference rooms)');
            recommendations.push('Establish and test lockdown procedures quarterly');
          }
          break;
          
        case 'Intellectual Property Theft':
        case 'Corporate Espionage':
          if (threat.vulnerability >= 4) {
            recommendations.push('Implement and enforce clear desk/screen policy');
            recommendations.push('Require visitor escort in all non-public areas');
            recommendations.push('Conduct quarterly access rights audits');
            recommendations.push('Install video surveillance in sensitive areas');
          }
          break;
          
        case 'Access Control System Hack':
        case 'Surveillance System Compromise':
          if (threat.vulnerability >= 3) {
            recommendations.push('Implement network segmentation for security systems');
            recommendations.push('Deploy multi-factor authentication on all access control systems');
            recommendations.push('Establish quarterly security patch management schedule');
          }
          break;
      }
    });
    
    return Array.from(new Set(recommendations)); // Remove duplicates
  }
}
