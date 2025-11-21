/**
 * Warehouse Risk Scenario Generator
 * 
 * Generates risk scenarios for warehouse assessments by combining:
 * 1. Warehouse Profile (Dashboard) - Quantitative operational data
 * 2. Physical Security Survey Responses - Qualitative security assessments
 * 
 * Based on Warehouse Framework v2.0
 */

import type { IStorage } from '../../../storage';
import type { 
  Assessment, 
  FacilitySurveyQuestion,
  LoadingDock,
  InsertRiskScenario 
} from '@shared/schema';

/**
 * Warehouse Profile structure (stored in assessment.warehouse_profile as JSONB)
 */
interface WarehouseProfile {
  warehouseType?: string;
  squareFootage?: number;
  inventoryValue?: number;
  highValueProducts?: string[];
  loadingDockCount?: number;
  dailyTruckVolume?: number;
  shrinkageRate?: number;
  cargoTheftIncidents?: number;
}

/**
 * Structured result from scenario generation
 */
export interface WarehouseScenarioGenerationResult {
  success: boolean;
  scenariosCreated: number;
  criticalScenarios: number;
  summary: string;
  errors?: string[];
}

/**
 * Generate comprehensive risk scenarios for warehouse assessments
 * Combines quantitative warehouse data with qualitative survey responses
 */
export async function generateWarehouseRiskScenarios(
  assessmentId: string,
  storage: IStorage
): Promise<WarehouseScenarioGenerationResult> {
  
  const errors: string[] = [];
  const scenarios: InsertRiskScenario[] = [];
  
  try {
    // Step 1: Data Ingestion - Retrieve assessment with warehouse profile
    const assessment = await storage.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    // Validate this is a warehouse assessment
    if (assessment.templateId !== 'warehouse-distribution') {
      throw new Error(`This generator is for warehouse assessments. Current template: ${assessment.templateId}`);
    }
    
    // Extract warehouse profile (quantitative data)
    const warehouseProfile = assessment.warehouse_profile as WarehouseProfile | null;
    if (!warehouseProfile) {
      errors.push('Warehouse profile not configured. Please complete the Warehouse Operations dashboard first.');
    }
    
    // Step 2: Retrieve facility survey responses (qualitative data)
    const surveyQuestions = await storage.getFacilitySurveyQuestions(assessmentId);
    const surveyMap = buildSurveyResponseMap(surveyQuestions);
    
    if (surveyQuestions.length === 0) {
      errors.push('No facility survey responses found. Complete the Physical Security Survey first.');
    }
    
    // Retrieve loading dock data for detailed vulnerability assessment
    const loadingDocks = await storage.getLoadingDocksByAssessment(assessmentId);
    
    console.log(`📊 Warehouse Data Retrieved:
      - Profile configured: ${!!warehouseProfile}
      - Survey questions: ${surveyQuestions.length}
      - Loading docks: ${loadingDocks.length}
    `);
    
    // Step 3: Generate scenarios based on framework logic
    
    // Scenario 1: Cargo Theft (Full Truckload)
    const cargoTheftScenario = generateCargoTheftScenario(
      assessmentId,
      warehouseProfile,
      surveyMap
    );
    if (cargoTheftScenario) {
      scenarios.push(cargoTheftScenario);
    }
    
    // Scenario 2: Loading Dock Breach
    const dockBreachScenario = generateLoadingDockBreachScenario(
      assessmentId,
      loadingDocks,
      surveyMap
    );
    if (dockBreachScenario) {
      scenarios.push(dockBreachScenario);
    }
    
    // Scenario 3: Insider Theft
    const insiderTheftScenario = generateInsiderTheftScenario(
      assessmentId,
      warehouseProfile,
      surveyMap
    );
    if (insiderTheftScenario) {
      scenarios.push(insiderTheftScenario);
    }
    
    // Scenario 4: Perimeter Intrusion
    const perimeterScenario = generatePerimeterIntrusionScenario(
      assessmentId,
      surveyMap
    );
    if (perimeterScenario) {
      scenarios.push(perimeterScenario);
    }
    
    // Step 4: Persist scenarios to database
    if (scenarios.length === 0) {
      errors.push('No risk scenarios could be generated. Ensure warehouse profile and survey data are complete.');
      return {
        success: false,
        scenariosCreated: 0,
        criticalScenarios: 0,
        summary: 'Failed to generate scenarios',
        errors
      };
    }
    
    // Create scenarios individually
    const createdScenarios = await Promise.all(
      scenarios.map(scenario => storage.createRiskScenario(scenario))
    );
    
    // Count critical scenarios (inherent risk >= 75 on 1-125 scale)
    const criticalCount = createdScenarios.filter((s: any) => 
      s.inherentRisk && s.inherentRisk >= 75
    ).length;
    
    console.log(`✅ Created ${createdScenarios.length} warehouse risk scenarios (${criticalCount} critical)`);
    
    return {
      success: true,
      scenariosCreated: createdScenarios.length,
      criticalScenarios: criticalCount,
      summary: `Generated ${createdScenarios.length} warehouse-specific risk scenarios based on operational data and security survey.`,
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error) {
    console.error('❌ Error generating warehouse risk scenarios:', error);
    
    return {
      success: false,
      scenariosCreated: 0,
      criticalScenarios: 0,
      summary: 'Failed to generate warehouse scenarios',
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}

/**
 * Build a map of survey responses by question ID for efficient lookup
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
 * Scenario 1: Cargo Theft (Full Truckload)
 * Impact driven by highValueProducts
 * Vulnerability driven by dock_4 (trailer seal verification)
 */
function generateCargoTheftScenario(
  assessmentId: string,
  profile: WarehouseProfile | null,
  surveyMap: Map<string, any>
): InsertRiskScenario | null {
  
  // Impact Assessment: High-value products = High Impact
  let impactScore = 3; // Default moderate
  let impactReason = "Moderate value inventory";
  
  if (profile?.highValueProducts && profile.highValueProducts.length > 0) {
    const hasElectronics = profile.highValueProducts.some(p => 
      p.toLowerCase().includes('electronic') || 
      p.toLowerCase().includes('computer') ||
      p.toLowerCase().includes('phone')
    );
    
    if (hasElectronics) {
      impactScore = 5;
      impactReason = `High-value electronics stored (${profile.highValueProducts.join(', ')})`;
    } else {
      impactScore = 4;
      impactReason = `High-value products stored (${profile.highValueProducts.join(', ')})`;
    }
  }
  
  // Vulnerability Assessment: dock_4 (trailer seal verification)
  let vulnerabilityScore = 3; // Default moderate
  let vulnerabilityReason = "Trailer seal verification process not assessed";
  
  const dock4Response = surveyMap.get('dock_4');
  if (dock4Response) {
    const answer = normalizeAnswer(dock4Response);
    
    // Match against actual option strings from warehouse questionnaire
    if (answer.includes('no seal') || answer.includes('no verification')) {
      vulnerabilityScore = 5;
      vulnerabilityReason = "No trailer seal verification performed";
    } else if (answer.includes('informal')) {
      vulnerabilityScore = 4;
      vulnerabilityReason = "Only informal seal checking (not documented)";
    } else if (answer.includes('manual')) {
      vulnerabilityScore = 2;
      vulnerabilityReason = "Manual seal verification with documentation in place";
    } else if (answer.includes('electronic')) {
      vulnerabilityScore = 1;
      vulnerabilityReason = "Electronic seal verification system with documentation in place";
    }
  }
  
  // Likelihood: Scale by cargo theft incidents
  let likelihoodScore = 3; // Baseline moderate
  if (profile?.cargoTheftIncidents && profile.cargoTheftIncidents > 0) {
    likelihoodScore = Math.min(5, 3 + profile.cargoTheftIncidents);
  }
  
  // Calculate inherent risk: T × V × I (range 1-125)
  const inherentRisk = likelihoodScore * vulnerabilityScore * impactScore;
  
  return {
    assessmentId,
    scenario: "Cargo Theft (Full Truckload)",
    asset: "High-value inventory in trailer",
    threatType: "human",
    threatDescription: "Organized cargo theft targeting full truckloads",
    vulnerabilityDescription: vulnerabilityReason,
    likelihood: mapScoreToText(likelihoodScore, 'likelihood'),
    impact: mapScoreToText(impactScore, 'impact'),
    riskLevel: calculateRiskLevel(inherentRisk),
    likelihoodScore,
    impactScore,
    inherentRisk,
    controlEffectiveness: 0,
    residualRisk: inherentRisk,
    // Include vulnerability score for schema compliance (same as likelihood in T×V×I)
    vulnerabilityScore
  };
}

/**
 * Scenario 2: Loading Dock Breach
 * Vulnerability based on CCTV coverage AND dock_9 (driver access restrictions)
 */
function generateLoadingDockBreachScenario(
  assessmentId: string,
  loadingDocks: LoadingDock[],
  surveyMap: Map<string, any>
): InsertRiskScenario | null {
  
  // Vulnerability Assessment: Loading dock CCTV coverage
  let vulnerabilityScore = 3;
  let vulnerabilityReason = "Loading dock security not assessed";
  
  if (loadingDocks.length > 0) {
    const docksWithCctv = loadingDocks.filter(d => d.hasCctv).length;
    const cctvCoverage = docksWithCctv / loadingDocks.length;
    
    if (cctvCoverage === 0) {
      vulnerabilityScore = 5;
      vulnerabilityReason = `No CCTV coverage on ${loadingDocks.length} loading docks`;
    } else if (cctvCoverage < 0.5) {
      vulnerabilityScore = 4;
      vulnerabilityReason = `Partial CCTV coverage (${docksWithCctv}/${loadingDocks.length} docks monitored)`;
    } else if (cctvCoverage < 1.0) {
      vulnerabilityScore = 3;
      vulnerabilityReason = `Majority CCTV coverage (${docksWithCctv}/${loadingDocks.length} docks monitored)`;
    } else {
      vulnerabilityScore = 2;
      vulnerabilityReason = `Full CCTV coverage on all ${loadingDocks.length} docks`;
    }
  }
  
  // Likelihood: Increase if drivers have unrestricted access (dock_9)
  let likelihoodScore = 3; // Baseline moderate
  let likelihoodReason = "Moderate driver activity";
  
  const dock9Response = surveyMap.get('dock_9');
  if (dock9Response) {
    const answer = normalizeAnswer(dock9Response);
    
    // Match against actual option strings from warehouse questionnaire
    if (answer.includes('no restrictions')) {
      likelihoodScore = 5;
      likelihoodReason = "Drivers have unrestricted access to warehouse during loading/unloading";
    } else if (answer.includes('restricted but no physical barrier')) {
      likelihoodScore = 4;
      likelihoodReason = "Drivers restricted but no physical barrier in place";
    } else if (answer.includes('escorted')) {
      likelihoodScore = 2;
      likelihoodReason = "Drivers are escorted if they need to enter warehouse";
    } else if (answer.includes('designated waiting area')) {
      likelihoodScore = 1;
      likelihoodReason = "Drivers must remain in physically separated waiting area";
    }
  }
  
  const impactScore = 4; // High impact - direct facility access
  const inherentRisk = likelihoodScore * vulnerabilityScore * impactScore;
  
  return {
    assessmentId,
    scenario: "Loading Dock Breach",
    asset: "Loading dock and warehouse interior",
    threatType: "human",
    threatDescription: "Unauthorized access through loading dock during operations",
    vulnerabilityDescription: `${vulnerabilityReason}. ${likelihoodReason}.`,
    likelihood: mapScoreToText(likelihoodScore, 'likelihood'),
    impact: mapScoreToText(impactScore, 'impact'),
    riskLevel: calculateRiskLevel(inherentRisk),
    likelihoodScore,
    impactScore,
    inherentRisk,
    controlEffectiveness: 0,
    residualRisk: inherentRisk,
    vulnerabilityScore
  };
}

/**
 * Scenario 3: Insider Theft
 * Triggered by personnel_1 (background checks)
 * Severity scaled by shrinkageRate
 */
function generateInsiderTheftScenario(
  assessmentId: string,
  profile: WarehouseProfile | null,
  surveyMap: Map<string, any>
): InsertRiskScenario | null {
  
  // Trigger: Check personnel_1 (background checks)
  const personnel1Response = surveyMap.get('personnel_1');
  if (!personnel1Response) {
    return null; // Don't create scenario if not assessed
  }
  
  const answer = normalizeAnswer(personnel1Response);
  
  // Only create scenario if background checks are insufficient
  // Check for various forms of "no" or "basic" responses
  if (!answer.includes('no') && !answer.includes('none') && !answer.includes('basic')) {
    return null; // Adequate background checks in place (comprehensive checks)
  }
  
  // Vulnerability: Unvetted staff
  let vulnerabilityScore = 5;
  let vulnerabilityReason = "No background checks performed on warehouse staff";
  
  if (answer === 'basic') {
    vulnerabilityScore = 4;
    vulnerabilityReason = "Only basic background checks performed (insufficient for high-value warehouse)";
  }
  
  // Impact: Scale by shrinkage rate
  let impactScore = 3; // Default moderate
  let impactReason = "Shrinkage rate not provided";
  
  if (profile?.shrinkageRate !== undefined && profile.shrinkageRate !== null) {
    if (profile.shrinkageRate > 2.0) {
      impactScore = 5;
      impactReason = `High shrinkage rate: ${profile.shrinkageRate}% (well above industry average of 1.4-1.6%)`;
    } else if (profile.shrinkageRate > 1.6) {
      impactScore = 4;
      impactReason = `Elevated shrinkage rate: ${profile.shrinkageRate}% (above industry average)`;
    } else if (profile.shrinkageRate >= 1.4) {
      impactScore = 3;
      impactReason = `Normal shrinkage rate: ${profile.shrinkageRate}% (industry baseline)`;
    } else {
      impactScore = 2;
      impactReason = `Low shrinkage rate: ${profile.shrinkageRate}% (below industry average)`;
    }
  }
  
  const likelihoodScore = 4; // High likelihood with unvetted staff
  const inherentRisk = likelihoodScore * vulnerabilityScore * impactScore;
  
  return {
    assessmentId,
    scenario: "Insider Theft Risk (Unvetted Staff)",
    asset: "Warehouse inventory",
    threatType: "human",
    threatDescription: "Theft by warehouse employees or contractors",
    vulnerabilityDescription: `${vulnerabilityReason}. ${impactReason}.`,
    likelihood: mapScoreToText(likelihoodScore, 'likelihood'),
    impact: mapScoreToText(impactScore, 'impact'),
    riskLevel: calculateRiskLevel(inherentRisk),
    likelihoodScore,
    impactScore,
    inherentRisk,
    controlEffectiveness: 0,
    residualRisk: inherentRisk,
    vulnerabilityScore
  };
}

/**
 * Scenario 4: Perimeter Intrusion
 * Triggered by perimeter_1 (fence condition)
 */
function generatePerimeterIntrusionScenario(
  assessmentId: string,
  surveyMap: Map<string, any>
): InsertRiskScenario | null {
  
  // Trigger: Check perimeter_1 (fence condition)
  const perimeter1Response = surveyMap.get('perimeter_1');
  if (!perimeter1Response) {
    return null; // Don't create scenario if not assessed
  }
  
  const answer = normalizeAnswer(perimeter1Response);
  
  // Only create scenario if fence is damaged or absent
  if (answer !== 'damaged' && answer !== 'none' && answer !== 'poor') {
    return null; // Adequate perimeter security
  }
  
  // Vulnerability: Based on fence condition
  let vulnerabilityScore = 5;
  let vulnerabilityReason = "No perimeter fencing";
  
  if (answer === 'damaged' || answer === 'poor') {
    vulnerabilityScore = 4;
    vulnerabilityReason = "Perimeter fence is damaged or in poor condition";
  }
  
  const likelihoodScore = 4; // High likelihood with compromised perimeter
  const impactScore = 4; // High impact - unrestricted site access
  const inherentRisk = likelihoodScore * vulnerabilityScore * impactScore;
  
  return {
    assessmentId,
    scenario: "Perimeter Security Gap",
    asset: "Warehouse facility and yard",
    threatType: "human",
    threatDescription: "Unauthorized intrusion through compromised perimeter",
    vulnerabilityDescription: vulnerabilityReason,
    likelihood: mapScoreToText(likelihoodScore, 'likelihood'),
    impact: mapScoreToText(impactScore, 'impact'),
    riskLevel: calculateRiskLevel(inherentRisk),
    likelihoodScore,
    impactScore,
    inherentRisk,
    controlEffectiveness: 0,
    residualRisk: inherentRisk,
    vulnerabilityScore
  };
}

/**
 * Normalize survey response to standard answer format
 */
function normalizeAnswer(response: any): string {
  if (typeof response === 'string') {
    return response.toLowerCase().trim();
  }
  
  if (typeof response === 'boolean') {
    return response ? 'yes' : 'no';
  }
  
  if (typeof response === 'object' && response !== null) {
    // Handle complex response objects
    if (response.condition) {
      return String(response.condition).toLowerCase();
    }
    if (response.answer) {
      return String(response.answer).toLowerCase();
    }
    if (response.value) {
      return String(response.value).toLowerCase();
    }
  }
  
  return String(response).toLowerCase();
}

/**
 * Map numeric score to text descriptor
 */
function mapScoreToText(score: number, type: 'likelihood' | 'impact'): string {
  if (type === 'likelihood') {
    if (score >= 4.5) return 'very-high';
    if (score >= 3.5) return 'high';
    if (score >= 2.5) return 'medium';
    if (score >= 1.5) return 'low';
    return 'very-low';
  } else {
    if (score >= 4.5) return 'catastrophic';
    if (score >= 3.5) return 'major';
    if (score >= 2.5) return 'moderate';
    if (score >= 1.5) return 'minor';
    return 'negligible';
  }
}

/**
 * Calculate overall risk level from inherent risk score (1-125 scale)
 */
function calculateRiskLevel(inherentRisk: number): string {
  // Based on 1-125 scale (T×V×I where each is 1-5)
  if (inherentRisk >= 75) return 'Critical'; // High scores across the board
  if (inherentRisk >= 45) return 'High'; // Elevated risk
  if (inherentRisk >= 15) return 'Medium'; // Moderate risk
  return 'Low'; // Lower risk
}
