/**
 * Retail Store Risk Scenario Generator
 * 
 * Generates risk scenarios for retail store assessments by combining:
 * 1. Retail Profile (Dashboard) - Quantitative operational data
 * 2. Physical Security Survey Responses - Qualitative security assessments
 * 
 * Based on Retail Store Framework v2.0
 */

import type { IStorage } from '../../../storage';
import type { 
  Assessment, 
  FacilitySurveyQuestion,
  InsertRiskScenario,
  MerchandiseDisplay
} from '@shared/schema';

/**
 * Retail Profile structure (stored in assessment.retail_profile as JSONB)
 */
interface RetailProfile {
  annualRevenue?: number;
  shrinkageRate?: number;
  highValueMerchandise?: string[];
  storeFormat?: string;
  merchandiseDisplay?: MerchandiseDisplay;
}

/**
 * Structured result from scenario generation
 */
export interface RetailScenarioGenerationResult {
  success: boolean;
  scenariosCreated: number;
  criticalScenarios: number;
  summary: string;
  errors?: string[];
}

/**
 * Helper function to extract survey response from JSONB field
 */
function getSurveyResponse(surveyMap: Map<string, any>, questionId: string): any {
  const responseData = surveyMap.get(questionId);
  
  if (!responseData) {
    return null;
  }
  
  // Handle structured response objects
  if (typeof responseData === 'object' && responseData !== null) {
    if ('value' in responseData) return responseData.value;
    if ('text' in responseData) return responseData.text;
    if ('optionId' in responseData) return responseData.optionId;
    if ('answer' in responseData) return responseData.answer;
    if ('selected' in responseData) return responseData.selected;
    if ('condition' in responseData) return responseData.condition;
  }
  
  return responseData;
}

/**
 * Normalize answer to lowercase string for comparison
 */
function normalizeAnswer(answer: any): string {
  if (answer === null || answer === undefined) {
    return '';
  }
  
  if (typeof answer === 'boolean') {
    return answer ? 'yes' : 'no';
  }
  
  return String(answer).toLowerCase().trim();
}

/**
 * Calculate overall risk level from inherent risk score (1-125 scale)
 */
function classifyRiskLevel(inherentRisk: number): string {
  if (inherentRisk >= 75) return 'Critical';
  if (inherentRisk >= 50) return 'High';
  if (inherentRisk >= 25) return 'Medium';
  return 'Low';
}

/**
 * Map numeric score to text descriptor for likelihood
 */
function mapLikelihoodToText(score: number): string {
  if (score >= 4.5) return 'very-high';
  if (score >= 3.5) return 'high';
  if (score >= 2.5) return 'medium';
  if (score >= 1.5) return 'low';
  return 'very-low';
}

/**
 * Map numeric score to text descriptor for impact
 */
function mapImpactToText(score: number): string {
  if (score >= 4.5) return 'catastrophic';
  if (score >= 3.5) return 'major';
  if (score >= 2.5) return 'moderate';
  if (score >= 1.5) return 'minor';
  return 'negligible';
}

/**
 * Generate comprehensive risk scenarios for retail assessments
 */
export async function generateRetailRiskScenarios(
  assessmentId: string,
  storage: IStorage
): Promise<RetailScenarioGenerationResult> {
  
  const errors: string[] = [];
  const scenarios: InsertRiskScenario[] = [];
  
  try {
    // Step 1: Retrieve assessment with retail profile
    const assessment = await storage.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    // Validate this is a retail assessment
    if (assessment.templateId !== 'retail-store') {
      throw new Error(`This generator is for retail assessments. Current template: ${assessment.templateId}`);
    }
    
    // Extract retail profile (non-fatal if missing - will use defaults)
    const retailProfile = assessment.retail_profile as RetailProfile | null;
    if (!retailProfile) {
      errors.push('Retail profile not configured. Scenarios will use default assumptions.');
    }
    
    // Step 2: Retrieve facility survey responses
    const surveyQuestions = await storage.getFacilitySurveyQuestions(assessmentId);
    const surveyMap = buildSurveyResponseMap(surveyQuestions);
    
    // Inject retail profile fields into surveyMap for adapter access
    // Must wrap in object with 'answer' field to match InterviewResponse structure
    if (retailProfile?.merchandiseDisplay) {
      surveyMap.set('__profile_merchandiseDisplay', { answer: retailProfile.merchandiseDisplay });
      console.log(`🏪 Merchandise Display Model: ${retailProfile.merchandiseDisplay}`);
    } else {
      // Default to 'Open Shelving' for backward compatibility
      surveyMap.set('__profile_merchandiseDisplay', { answer: 'Open Shelving' });
      console.log(`🏪 Merchandise Display Model: Open Shelving (default)`);
    }
    
    if (surveyQuestions.length === 0) {
      errors.push('No facility survey responses found. Complete the Physical Security Survey first.');
    }
    
    console.log(`📊 Retail Data Retrieved:
      - Profile configured: ${!!retailProfile}
      - Survey questions: ${surveyQuestions.length}
    `);
    
    // Step 3: Generate scenario candidates (validate before persisting)
    
    // Scenario 1: Shoplifting / ORC (always created)
    const shopliftingScenario = generateShopliftingScenario(
      assessmentId,
      retailProfile,
      surveyMap
    );
    if (shopliftingScenario) {
      scenarios.push(shopliftingScenario);
    }
    
    // Scenario 2: Employee Theft (conditional - shrinkage > 1.5%)
    const employeeTheftScenario = generateEmployeeTheftScenario(
      assessmentId,
      retailProfile,
      surveyMap
    );
    if (employeeTheftScenario) {
      scenarios.push(employeeTheftScenario);
    }
    
    // Scenario 3: Armed Robbery (conditional - cash limits)
    const armedRobberyScenario = generateArmedRobberyScenario(
      assessmentId,
      surveyMap
    );
    if (armedRobberyScenario) {
      scenarios.push(armedRobberyScenario);
    }
    
    // Step 4: Validate scenarios were generated
    if (scenarios.length === 0) {
      errors.push('No risk scenarios could be generated. Ensure retail profile and survey data are complete.');
      return {
        success: false,
        scenariosCreated: 0,
        criticalScenarios: 0,
        summary: 'Failed to generate scenarios',
        errors
      };
    }
    
    // Step 5: Persist new scenarios FIRST (with atomic rollback on failure)
    // Only delete old scenarios if new ones are successfully created
    const createdScenarios: any[] = [];
    try {
      // Create all new scenarios first
      for (const scenario of scenarios) {
        const created = await storage.createRiskScenario(scenario);
        createdScenarios.push(created);
      }
      
      console.log(`✅ Created ${createdScenarios.length} new retail risk scenarios`);
      
      // Step 6: Only now delete old scenarios (creation succeeded)
      const existingScenarios = await storage.getRiskScenarios(assessmentId);
      const retailScenarioNames = [
        'Shoplifting / Organized Retail Crime (ORC)',
        'Employee Theft',
        'Armed Robbery'
      ];
      
      // Don't delete the scenarios we just created
      const createdIds = new Set(createdScenarios.map(s => s.id));
      const scenariosToDelete = existingScenarios.filter(s => 
        retailScenarioNames.includes(s.scenario) && !createdIds.has(s.id)
      );
      
      for (const scenario of scenariosToDelete) {
        await storage.deleteRiskScenario(scenario.id);
      }
      
      console.log(`🗑️  Cleared ${scenariosToDelete.length} old retail scenarios`);
      
      // Count critical scenarios
      const criticalCount = createdScenarios.filter((s: any) => 
        s.inherentRisk && s.inherentRisk >= 75
      ).length;
      
      return {
        success: true,
        scenariosCreated: createdScenarios.length,
        criticalScenarios: criticalCount,
        summary: `Generated ${createdScenarios.length} retail-specific risk scenarios based on operational data and security survey.`,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (createError) {
      // Rollback: Delete any new scenarios that were created before the error
      // This preserves the original scenarios
      console.error(`❌ Error creating scenarios, rolling back ${createdScenarios.length} new scenarios (preserving originals)`);
      for (const created of createdScenarios) {
        try {
          await storage.deleteRiskScenario(created.id);
        } catch (deleteError) {
          console.error(`⚠️ Failed to rollback scenario ${created.id}:`, deleteError);
        }
      }
      
      throw createError; // Re-throw to propagate error to caller
    }
    
  } catch (error) {
    console.error('❌ Error generating retail risk scenarios:', error);
    
    return {
      success: false,
      scenariosCreated: 0,
      criticalScenarios: 0,
      summary: 'Failed to generate retail scenarios',
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}

/**
 * Build a map of survey responses by question ID
 */
function buildSurveyResponseMap(questions: FacilitySurveyQuestion[]): Map<string, any> {
  const map = new Map<string, any>();
  
  questions.forEach(q => {
    if (q.templateQuestionId && q.response !== null) {
      map.set(q.templateQuestionId, q.response);
    }
  });
  
  return map;
}

/**
 * Scenario 1: Shoplifting / Organized Retail Crime (ORC)
 * Trigger: Always created
 * Vulnerability: High if retail-store-001 (EAS) is "No" OR retail-store-002 (CCTV) is "No"
 * Impact: High if highValueMerchandise includes electronics, jewelry, or designer_clothing
 */
function generateShopliftingScenario(
  assessmentId: string,
  profile: RetailProfile | null,
  surveyMap: Map<string, any>
): InsertRiskScenario | null {
  
  // Vulnerability Assessment: EAS System and CCTV Coverage
  let vulnerabilityScore = 3; // Default moderate
  let vulnerabilityReasons: string[] = [];
  
  // Check retail-store-001 (EAS System)
  const easAnswer = normalizeAnswer(getSurveyResponse(surveyMap, 'retail-store-001'));
  const hasNoEAS = easAnswer === 'no' || easAnswer.includes('no eas') || easAnswer.includes('none');
  
  if (hasNoEAS) {
    vulnerabilityScore = 5;
    vulnerabilityReasons.push('No Electronic Article Surveillance (EAS) system installed');
  }
  
  // Check retail-store-002 (CCTV Coverage)
  const cctvAnswer = normalizeAnswer(getSurveyResponse(surveyMap, 'retail-store-002'));
  const hasNoCCTV = cctvAnswer === 'no' || cctvAnswer.includes('no') || cctvAnswer.includes('none');
  
  if (hasNoCCTV) {
    if (vulnerabilityScore < 5) {
      vulnerabilityScore = 5;
    }
    vulnerabilityReasons.push('No CCTV coverage in customer areas and high-value merchandise zones');
  }
  
  // If both controls are missing, emphasize critical vulnerability
  if (hasNoEAS && hasNoCCTV) {
    vulnerabilityReasons = ['Critical control gaps: No EAS system AND no CCTV coverage'];
  } else if (vulnerabilityReasons.length === 0) {
    vulnerabilityScore = 2;
    vulnerabilityReasons.push('EAS system and CCTV coverage present');
  }
  
  // Impact Assessment: High-value merchandise
  let impactScore = 3; // Default moderate
  let impactReason = "Standard merchandise mix";
  
  if (profile?.highValueMerchandise && profile.highValueMerchandise.length > 0) {
    const hasElectronics = profile.highValueMerchandise.includes('electronics');
    const hasJewelry = profile.highValueMerchandise.includes('jewelry');
    const hasDesigner = profile.highValueMerchandise.includes('designer_clothing');
    
    if (hasElectronics || hasJewelry || hasDesigner) {
      impactScore = 5;
      const highValueItems = [
        hasElectronics ? 'electronics' : null,
        hasJewelry ? 'jewelry' : null,
        hasDesigner ? 'designer clothing' : null
      ].filter(Boolean);
      impactReason = `High-value merchandise targeted by ORC rings: ${highValueItems.join(', ')}`;
    } else {
      impactScore = 4;
      impactReason = `Moderate-value merchandise: ${profile.highValueMerchandise.join(', ')}`;
    }
  }
  
  // Likelihood: Baseline high for retail (shoplifting is common)
  const likelihoodScore = 4;
  
  // Calculate inherent risk
  const inherentRisk = likelihoodScore * vulnerabilityScore * impactScore;
  
  const likelihoodText = mapLikelihoodToText(likelihoodScore);
  const impactText = mapImpactToText(impactScore);
  const riskLevel = classifyRiskLevel(inherentRisk);
  
  return {
    assessmentId,
    scenario: "Shoplifting / Organized Retail Crime (ORC)",
    asset: "Retail merchandise and inventory",
    threatType: "human",
    threatDescription: "External theft by customers and organized retail crime rings targeting high-value merchandise",
    vulnerabilityDescription: `${vulnerabilityReasons.join('. ')}. ${impactReason}.`,
    
    likelihood: likelihoodText,
    impact: impactText,
    riskLevel: riskLevel,
    
    currentLikelihood: likelihoodText,
    currentImpact: impactText,
    currentRiskLevel: riskLevel,
    
    likelihoodScore,
    impactScore,
    inherentRisk,
    controlEffectiveness: 0,
    residualRisk: inherentRisk
  };
}

/**
 * Scenario 2: Employee Theft
 * Trigger: If shrinkageRate > 1.5%
 * Vulnerability: High if retail-store-006 (Background Checks) is "No"
 */
function generateEmployeeTheftScenario(
  assessmentId: string,
  profile: RetailProfile | null,
  surveyMap: Map<string, any>
): InsertRiskScenario | null {
  
  // Trigger check: shrinkage rate > 1.5%
  if (!profile?.shrinkageRate || profile.shrinkageRate <= 1.5) {
    return null; // Don't create scenario if shrinkage is acceptable
  }
  
  // Vulnerability Assessment: Background checks
  let vulnerabilityScore = 3;
  let vulnerabilityReason = "Employee vetting controls not fully assessed";
  
  const backgroundCheckAnswer = normalizeAnswer(getSurveyResponse(surveyMap, 'retail-store-006'));
  if (backgroundCheckAnswer) {
    const hasNoBackgroundChecks = backgroundCheckAnswer === 'no' || 
                                  backgroundCheckAnswer.includes('no background') || 
                                  backgroundCheckAnswer.includes('none');
    
    if (hasNoBackgroundChecks) {
      vulnerabilityScore = 5;
      vulnerabilityReason = "No background checks on employees with cash or inventory access";
    } else {
      vulnerabilityScore = 2;
      vulnerabilityReason = "Background checks performed on employees";
    }
  }
  
  // Impact: Scale by shrinkage rate severity
  let impactScore = 4;
  let impactReason = `Elevated shrinkage rate: ${profile.shrinkageRate}% (above industry average of 1.4-1.6%)`;
  
  if (profile.shrinkageRate > 3.0) {
    impactScore = 5;
    impactReason = `Critical shrinkage rate: ${profile.shrinkageRate}% (double industry average)`;
  } else if (profile.shrinkageRate > 2.0) {
    impactScore = 4;
    impactReason = `High shrinkage rate: ${profile.shrinkageRate}% (significantly above average)`;
  }
  
  const likelihoodScore = 4; // High likelihood with elevated shrinkage
  const inherentRisk = likelihoodScore * vulnerabilityScore * impactScore;
  
  const likelihoodText = mapLikelihoodToText(likelihoodScore);
  const impactText = mapImpactToText(impactScore);
  const riskLevel = classifyRiskLevel(inherentRisk);
  
  return {
    assessmentId,
    scenario: "Employee Theft",
    asset: "Store inventory and cash",
    threatType: "human",
    threatDescription: "Internal theft by store employees exploiting access to merchandise and cash handling",
    vulnerabilityDescription: `${vulnerabilityReason}. ${impactReason}.`,
    
    likelihood: likelihoodText,
    impact: impactText,
    riskLevel: riskLevel,
    
    currentLikelihood: likelihoodText,
    currentImpact: impactText,
    currentRiskLevel: riskLevel,
    
    likelihoodScore,
    impactScore,
    inherentRisk,
    controlEffectiveness: 0,
    residualRisk: inherentRisk
  };
}

/**
 * Scenario 3: Armed Robbery
 * Trigger: If retail-store-008 (Cash Management) is "No" or indicates inadequate controls
 * Description: Excessive cash in registers creates high-value target
 */
function generateArmedRobberyScenario(
  assessmentId: string,
  surveyMap: Map<string, any>
): InsertRiskScenario | null {
  
  // Trigger check: retail-store-008 (Cash Management Procedures)
  const cashMgmtAnswer = normalizeAnswer(getSurveyResponse(surveyMap, 'retail-store-008'));
  if (!cashMgmtAnswer) {
    return null; // Don't create scenario if not assessed
  }
  
  // Check for inadequate cash management (no till limits, no safe drops, no procedures)
  const hasHighCashRisk = cashMgmtAnswer === 'no' || 
                         cashMgmtAnswer.includes('no procedures') ||
                         cashMgmtAnswer.includes('no limit') ||
                         cashMgmtAnswer.includes('none');
  
  if (!hasHighCashRisk) {
    return null; // Adequate cash controls in place
  }
  
  // Vulnerability: Excessive cash on hand
  const vulnerabilityScore = 5;
  const vulnerabilityReason = "Excessive cash in registers creates high-value target for robbery";
  
  // Impact: Armed robbery has severe consequences
  const impactScore = 5;
  const impactReason = "Armed robbery poses risk to employee safety and significant cash loss";
  
  // Likelihood: Moderate (robbery less common than theft but high-impact)
  const likelihoodScore = 3;
  
  const inherentRisk = likelihoodScore * vulnerabilityScore * impactScore;
  
  const likelihoodText = mapLikelihoodToText(likelihoodScore);
  const impactText = mapImpactToText(impactScore);
  const riskLevel = classifyRiskLevel(inherentRisk);
  
  return {
    assessmentId,
    scenario: "Armed Robbery",
    asset: "Cash registers and employee safety",
    threatType: "human",
    threatDescription: "Armed criminals targeting stores with high cash volumes, posing risk to employee safety",
    vulnerabilityDescription: `${vulnerabilityReason}. ${impactReason}.`,
    
    likelihood: likelihoodText,
    impact: impactText,
    riskLevel: riskLevel,
    
    currentLikelihood: likelihoodText,
    currentImpact: impactText,
    currentRiskLevel: riskLevel,
    
    likelihoodScore,
    impactScore,
    inherentRisk,
    controlEffectiveness: 0,
    residualRisk: inherentRisk
  };
}
