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

    // CRITICAL FIX: Read facility survey responses to calculate risk
    const surveyQuestions = await this.storage.getFacilitySurveyQuestions(assessment.id);
    
    // Get existing controls
    const controls = await this.storage.getControls(assessment.id);
    
    // If no survey data AND no controls, return low score with prompt to complete survey
    if ((!surveyQuestions || surveyQuestions.length === 0) && (!controls || controls.length === 0)) {
      keyVulnerabilities.push('Complete facility survey to enable comprehensive risk analysis');
      
      return {
        riskScore: 0,
        violenceRiskLevel: 'Low',
        dataRiskLevel: 'Low',
        keyVulnerabilities
      };
    }
    
    // ==================== FACILITY SURVEY ANALYSIS ====================
    
    // Analyze survey responses for risk indicators
    for (const question of surveyQuestions) {
      const response = question.response;
      const category = question.category?.toLowerCase() || '';
      const subcategory = question.subcategory?.toLowerCase() || '';
      const questionText = question.question?.toLowerCase() || '';
      
      // Rating questions (1-5 scale): Low ratings = high risk
      if (question.type === 'rating' && typeof response === 'string') {
        const rating = parseInt(response);
        if (!isNaN(rating)) {
          if (rating <= 2) {
            // Poor/Fair ratings (1-2) indicate high risk
            violenceRiskScore += 10;
            keyVulnerabilities.push(`Poor rating (${rating}/5) for ${subcategory} in ${category}`);
          } else if (rating === 3) {
            // Satisfactory rating indicates moderate risk
            violenceRiskScore += 5;
          }
        }
      }
      
      // Yes/No questions: "No" or "Partial" responses indicate vulnerabilities
      if (question.type === 'yes-no') {
        if (response === 'no' || response === 'partial') {
          const riskPoints = response === 'no' ? 15 : 10;
          
          // Categorize by threat type
          if (category.includes('perimeter') || category.includes('access') || category.includes('surveillance')) {
            violenceRiskScore += riskPoints;
            keyVulnerabilities.push(`${response === 'no' ? 'Missing' : 'Inadequate'} ${subcategory} for perimeter security`);
          } else if (category.includes('workplace violence') || category.includes('emergency')) {
            violenceRiskScore += riskPoints;
            keyVulnerabilities.push(`${response === 'no' ? 'No' : 'Partial'} workplace violence preparedness: ${subcategory}`);
          } else if (category.includes('information') || category.includes('cyber') || category.includes('data')) {
            dataRiskScore += riskPoints;
            keyVulnerabilities.push(`${response === 'no' ? 'Missing' : 'Inadequate'} data security control: ${subcategory}`);
          } else {
            // Generic security gap
            violenceRiskScore += riskPoints;
            keyVulnerabilities.push(`Security gap identified in ${category}`);
          }
        }
      }
      
      // Condition questions: Poor conditions indicate risk
      if (question.type === 'condition') {
        if (response === 'poor' || response === 'critical') {
          violenceRiskScore += 15;
          keyVulnerabilities.push(`${response.charAt(0).toUpperCase() + response.slice(1)} condition in ${category} - ${subcategory}`);
        } else if (response === 'adequate') {
          violenceRiskScore += 5;
        }
      }
    }
    
    // ==================== CONTROLS-BASED ANALYSIS (EXISTING LOGIC) ====================
    
    // Only proceed with controls analysis if controls exist
    if (controls && controls.length > 0) {
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
    } // End controls analysis block

    // Cap violence risk from survey analysis
    violenceRiskScore = Math.min(violenceRiskScore, 100);
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

/**
 * TOTAL COST OF RISK (TCOR) CALCULATION
 * Calculates comprehensive annual risk exposure including direct and indirect costs
 */

export interface TCORBreakdown {
  directLoss: number; // Direct losses from security incidents
  turnoverCost: number; // Security-related employee turnover costs
  liabilityCost: number; // Insurance, legal, workers' comp
  incidentCost: number; // Operational disruption from security incidents
  brandDamageCost: number; // Reputation/brand damage
  totalAnnualExposure: number; // Sum of all costs
}

/**
 * Calculate Total Annual Exposure for office environments
 * 
 * Formula:
 * Total Annual Exposure = Direct Loss + Turnover Cost + Liability Cost + Incident Cost + Brand Damage
 * 
 * Where:
 * - Direct Loss = Baseline estimate for office theft/property damage ($25K baseline)
 * - Turnover Cost = (Employee Count × Turnover Rate × Hiring Cost) × 0.25
 *   (Assumes 25% of turnover is security-related in office environments - higher due to workplace violence/harassment)
 * - Liability Cost = Annual liability/insurance/WC estimates
 * - Incident Cost = Security Incidents × Average Incident Cost ($15,000 per incident baseline for offices)
 * - Brand Damage = Estimated brand/reputation damage
 */
export function calculateTotalCostOfRisk(
  profile: OfficeProfile
): TCORBreakdown {
  // 1. DIRECT LOSS (Office theft/property damage baseline)
  const directLoss = 25000; // Baseline estimate for office environments

  // 2. TURNOVER COST
  // Office environments use categorical employee count, convert to numbers
  let employeeCount = 0;
  if (profile.employeeCount === '1000+') {
    employeeCount = 1500; // Estimate midpoint
  } else if (profile.employeeCount === '201-1000') {
    employeeCount = 600; // Estimate midpoint
  } else if (profile.employeeCount === '51-200') {
    employeeCount = 125; // Estimate midpoint
  } else if (profile.employeeCount === '1-50') {
    employeeCount = 25; // Estimate midpoint
  }

  const turnoverRate = profile.annualTurnoverRate || 0;
  const avgHiringCost = profile.avgHiringCost || 0;
  // Assume 25% of turnover is security-related (workplace violence, harassment, unsafe conditions)
  const securityRelatedTurnoverFactor = 0.25;
  const turnoverCost = employeeCount * (turnoverRate / 100) * avgHiringCost * securityRelatedTurnoverFactor;

  // 3. LIABILITY COST
  const liabilityCost = profile.annualLiabilityEstimates || 0;

  // 4. INCIDENT COST
  const incidentsPerYear = profile.securityIncidentsPerYear || 0;
  const avgIncidentCost = 15000; // $15K baseline (higher due to workplace violence, legal costs)
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
