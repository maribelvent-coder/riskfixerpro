/**
 * Warehouse & Distribution Center Route Integration Guide
 * 
 * This file provides the route definitions and integration instructions
 * for wiring the warehouse AI assessment into server/routes.ts
 * 
 * Warehouse-specific considerations:
 * - Cargo theft prevention (full truckload, pilferage, fictitious pickup)
 * - Loading dock security and seal verification
 * - TAPA FSR compliance levels (A/B/C)
 * - Inventory shrinkage tracking
 * - Fleet security and hijacking prevention
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Warehouse-Framework.md
 */

// ============================================================================
// IMPORTS TO ADD TO server/routes.ts
// ============================================================================

/*
Add these imports at the top of server/routes.ts:

import { 
  generateWarehouseRiskScenariosWithAI,
  assessSingleWarehouseThreat,
  generateWarehouseNarrative,
  WarehouseAssessmentContext,
  WarehouseAIAssessmentResponse,
  WarehouseIncidentRecord,
  ShrinkageProfile,
  CAPIndexData,
} from './services/warehouse-ai-risk-assessment';

import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  calculateOverallSecurityScore,
  generateControlRecommendations,
  getThreatSpecificControls,
  getThreatVulnerabilityBreakdown,
  getPrioritizedThreats,
  getHighestRiskThreats,
  getIndustryBenchmarks,
  WAREHOUSE_THREATS,
  THREAT_CONTROL_MAPPING,
  THREAT_QUESTION_MAP,
} from './services/warehouse-interview-mapper';

import {
  WAREHOUSE_INTERVIEW_QUESTIONS,
  SECTION_METADATA,
  WAREHOUSE_SECTIONS,
  WAREHOUSE_THREATS as WAREHOUSE_THREAT_IDS,
  WAREHOUSE_CONTROLS,
} from './services/warehouse-interview-questionnaire';
*/

// ============================================================================
// ROUTE DEFINITIONS TO ADD
// ============================================================================

/**
 * Route: POST /api/assessments/:id/warehouse-interview/generate-risks-ai
 * 
 * Generates risk scenarios from warehouse interview responses using T×V×I formula
 * with GPT-4 AI assessment and algorithmic fallback.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   useAI?: boolean,           // Default true
 *   photoFindings?: string[],  // GPT-4V photo analysis results
 *   incidentHistory?: WarehouseIncidentRecord[],
 *   shrinkageData?: ShrinkageProfile,
 *   capIndexData?: CAPIndexData,
 *   tapaLevel?: 'A' | 'B' | 'C' | 'none'
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   mode: 'ai' | 'algorithmic' | 'hybrid',
 *   generatedScenarios: number,
 *   criticalRisks: number,
 *   highRisks: number,
 *   mediumRisks: number,
 *   lowRisks: number,
 *   riskScenarioIds: number[],
 *   overallCargoTheftRisk: string,
 *   aiConfidence: 'high' | 'medium' | 'low' | 'fallback',
 *   processingTimeMs: number
 * }
 */

const warehouseGenerateRisksAIRoute = `
app.post('/api/assessments/:id/warehouse-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true, 
      photoFindings, 
      incidentHistory,
      shrinkageData,
      capIndexData,
      tapaLevel 
    } = req.body;
    
    // Validate assessment exists and is warehouse type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'warehouse' && assessment.facilityType !== 'warehouse') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Warehouse assessments only.' 
      });
    }
    
    // Generate risk scenarios using AI with algorithmic fallback
    const result = await generateWarehouseRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { 
        useAI, 
        photoFindings, 
        incidentHistory,
        shrinkageData,
        capIndexData,
        tapaLevel 
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating warehouse risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/warehouse-interview/assess-single-threat
 * 
 * Assess a single warehouse threat using AI (for testing or incremental assessment).
 * 
 * Request Body:
 * {
 *   threatId: string,              // e.g., 'cargo_theft_full_truckload', 'insider_theft_employee_driver_collusion'
 *   interviewResponses: Record<string, any>,
 *   useAI?: boolean                // Default true
 * }
 * 
 * Response: WarehouseAIAssessmentResponse
 */

const warehouseAssessSingleThreatRoute = `
app.post('/api/assessments/:id/warehouse-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    // Validate threatId exists
    const validThreat = WAREHOUSE_THREATS.find(t => t.id === threatId);
    if (!validThreat) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validThreats: WAREHOUSE_THREATS.map(t => t.id)
      });
    }
    
    const result = await assessSingleWarehouseThreat(threatId, interviewResponses, useAI);
    
    res.json(result);
  } catch (error) {
    console.error('Error assessing single warehouse threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/warehouse-interview/generate-narrative
 * 
 * Generate AI narrative report sections for warehouse assessment.
 * 
 * Request Body:
 * {
 *   results: WarehouseAIAssessmentResponse[],
 *   interviewResponses: Record<string, any>,
 *   narrativeType?: 'executive_summary' | 'risk_landscape' | 'recommendations' | 'full_report'
 * }
 * 
 * Response:
 * {
 *   narrative: string
 * }
 */

const warehouseGenerateNarrativeRoute = `
app.post('/api/assessments/:id/warehouse-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, narrativeType = 'executive_summary' } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context: WarehouseAssessmentContext = {
      assessmentId: parseInt(id),
      interviewResponses: interviewResponses || {},
    };
    
    const narrative = await generateWarehouseNarrative({
      assessmentId: parseInt(id),
      riskScenarios: results,
      facilityContext: context,
      narrativeType,
    });
    
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating warehouse narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/warehouse-interview/threats
 * 
 * Returns the list of warehouse-specific threats for the interview workflow.
 */

const warehouseThreatsRoute = `
app.get('/api/assessments/:id/warehouse-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: WAREHOUSE_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode,
        description: t.description,
        averageLoss: t.averageLoss,
      })),
      totalThreats: WAREHOUSE_THREATS.length,
      threatCategories: [...new Set(WAREHOUSE_THREATS.map(t => t.category))],
    });
  } catch (error) {
    console.error('Error fetching warehouse threats:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse threats' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/warehouse-interview/calculate-cargo-theft-risk
 * 
 * Calculate real-time cargo theft and security risk score during interview.
 * Provides immediate feedback on security posture aligned with TAPA FSR.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   securityScore: number,           // 0-100
 *   securityGrade: string,           // A/B/C/D/F
 *   shrinkageLevel: string,          // excellent/good/average/concerning/critical/unknown
 *   cargoTheftRisk: string,          // low/moderate/high/critical
 *   keyFindings: string[],
 *   strengths: string[],
 *   categoryScores: Record<string, number>,
 *   tapaCompliance: {
 *     estimatedLevel: 'A' | 'B' | 'C' | 'none',
 *     gaps: string[]
 *   },
 *   components: {
 *     hasPerimeterSecurity: boolean,
 *     hasDockCCTV: boolean,
 *     hasGPSTracking: boolean,
 *     hasBackgroundChecks: boolean,
 *     hasWMS: boolean,
 *     hasSealVerification: boolean,
 *     hasInsiderThreatProgram: boolean
 *   }
 * }
 */

const warehouseCargoTheftRiskRoute = `
app.post('/api/assessments/:id/warehouse-interview/calculate-cargo-theft-risk', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    // Get overall security score
    const { score, grade, findings, strengths, categoryScores } = calculateOverallSecurityScore(interviewResponses);
    
    // Calculate shrinkage level from reported rate
    const shrinkage = (interviewResponses.incident_3 || '').toLowerCase();
    let shrinkageLevel = 'unknown';
    if (shrinkage.includes('under 0.5%')) shrinkageLevel = 'excellent';
    else if (shrinkage.includes('0.5% - 1%')) shrinkageLevel = 'good';
    else if (shrinkage.includes('1% - 2%')) shrinkageLevel = 'average';
    else if (shrinkage.includes('2% - 3%')) shrinkageLevel = 'concerning';
    else if (shrinkage.includes('over 3%')) shrinkageLevel = 'critical';
    else if (shrinkage.includes('unknown')) shrinkageLevel = 'unknown';
    
    // Calculate cargo theft risk based on history and controls
    let cargoTheftRisk = 'moderate';
    const hasTheftHistory = interviewResponses.incident_1 === 'yes';
    const hasPilferageHistory = interviewResponses.incident_2 === 'yes';
    const hasInsiderHistory = interviewResponses.incident_4 === 'yes';
    const hasTrailerTheft = interviewResponses.incident_5 === 'yes';
    const hasHijackingHistory = interviewResponses.incident_7 === 'yes';
    
    const incidentCount = [hasTheftHistory, hasPilferageHistory, hasInsiderHistory, hasTrailerTheft, hasHijackingHistory]
      .filter(Boolean).length;
    
    if (incidentCount >= 3 || hasHijackingHistory) cargoTheftRisk = 'critical';
    else if (incidentCount >= 2 || hasTheftHistory) cargoTheftRisk = 'high';
    else if (incidentCount >= 1) cargoTheftRisk = 'moderate';
    else cargoTheftRisk = 'low';
    
    // Estimate TAPA compliance level
    const hasFencing = !(interviewResponses.perimeter_1 || '').toLowerCase().includes('no fencing');
    const hasIntrusionDetection = interviewResponses.perimeter_3 === 'yes';
    const hasDockCCTV = interviewResponses.dock_2 === 'yes';
    const hasBackgroundChecks = !(interviewResponses.personnel_1 || '').toLowerCase().includes('no background');
    const has100Coverage = (interviewResponses.perimeter_6a || '').includes('100%');
    const has30DayRetention = (interviewResponses.surveillance_2 || '').toLowerCase().includes('30') || 
                              (interviewResponses.surveillance_2 || '').toLowerCase().includes('90');
    const hasSealVerification = !(interviewResponses.dock_4 || '').toLowerCase().includes('no seal');
    const hasGPSTracking = interviewResponses.fleet_2 === 'yes';
    
    let estimatedTapaLevel: 'A' | 'B' | 'C' | 'none' = 'none';
    const tapaGaps: string[] = [];
    
    // TAPA Level C requirements
    if (hasFencing && hasDockCCTV && hasBackgroundChecks) {
      estimatedTapaLevel = 'C';
      
      // TAPA Level B requirements
      if (hasIntrusionDetection && hasSealVerification) {
        estimatedTapaLevel = 'B';
        
        // TAPA Level A requirements
        if (has100Coverage && has30DayRetention && hasGPSTracking) {
          estimatedTapaLevel = 'A';
        } else {
          if (!has100Coverage) tapaGaps.push('TAPA-A: 100% CCTV coverage required');
          if (!has30DayRetention) tapaGaps.push('TAPA-A: Minimum 30-day video retention');
          if (!hasGPSTracking) tapaGaps.push('TAPA-A: GPS tracking on all fleet vehicles');
        }
      } else {
        if (!hasIntrusionDetection) tapaGaps.push('TAPA-B: Perimeter intrusion detection');
        if (!hasSealVerification) tapaGaps.push('TAPA-B: Documented seal verification process');
      }
    } else {
      if (!hasFencing) tapaGaps.push('TAPA-C: Security fencing required');
      if (!hasDockCCTV) tapaGaps.push('TAPA-C: Dock CCTV coverage');
      if (!hasBackgroundChecks) tapaGaps.push('TAPA-C: Background checks for employees');
    }
    
    res.json({
      securityScore: score,
      securityGrade: grade,
      shrinkageLevel,
      cargoTheftRisk,
      keyFindings: findings,
      strengths,
      categoryScores,
      tapaCompliance: {
        estimatedLevel: estimatedTapaLevel,
        gaps: tapaGaps,
      },
      components: {
        hasPerimeterSecurity: hasFencing && interviewResponses.perimeter_6 === 'yes',
        hasDockCCTV,
        hasGPSTracking,
        hasBackgroundChecks,
        hasWMS: interviewResponses.inventory_1 === 'yes',
        hasSealVerification,
        hasInsiderThreatProgram: interviewResponses.personnel_8 === 'yes',
      }
    });
  } catch (error) {
    console.error('Error calculating cargo theft risk:', error);
    res.status(500).json({ error: 'Failed to calculate cargo theft risk' });
  }
});
`;

/**
 * Route: GET /api/controls/warehouse
 * 
 * Returns all warehouse-specific security controls for recommendation engine.
 */

const warehouseControlsRoute = `
app.get('/api/controls/warehouse', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'warehouse')
    });
    
    // Group by category
    const grouped = controls.reduce((acc, control) => {
      const category = control.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(control);
      return acc;
    }, {} as Record<string, typeof controls>);
    
    res.json({
      total: controls.length,
      byCategory: grouped,
      categories: Object.keys(grouped),
    });
  } catch (error) {
    console.error('Error fetching warehouse controls:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse controls' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/warehouse-interview/get-control-recommendations
 * 
 * Get control recommendations based on interview responses and threat priorities.
 * Uses threat-specific control mapping from warehouse-interview-mapper.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   priorityThreats?: string[],   // Optional: focus on specific threats
 *   includeRationale?: boolean    // Include why each control is recommended
 * }
 */

const warehouseControlRecommendationsRoute = `
app.post('/api/assessments/:id/warehouse-interview/get-control-recommendations', async (req, res) => {
  try {
    const { interviewResponses, priorityThreats, includeRationale = true } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    // Get general recommendations
    const generalRecommendations = generateControlRecommendations(
      interviewResponses, 
      priorityThreats?.[0]
    );
    
    // If specific threats are requested, get threat-specific controls
    let threatSpecificControls: any[] = [];
    if (priorityThreats && priorityThreats.length > 0) {
      for (const threatId of priorityThreats) {
        const controls = getThreatSpecificControls(interviewResponses, threatId);
        threatSpecificControls.push({
          threatId,
          controls: controls.map(c => ({
            ...c,
            controlName: c.controlId.replace(/_/g, ' ').replace(/\\b\\w/g, (char: string) => char.toUpperCase()),
          }))
        });
      }
    }
    
    // Enrich general recommendations with control details if available
    const enrichedRecommendations = await Promise.all(
      generalRecommendations.map(async (controlId) => {
        const control = await db.query.securityControls.findFirst({
          where: eq(securityControls.controlId, controlId)
        });
        
        return {
          controlId,
          controlName: control?.name || controlId.replace(/_/g, ' ').replace(/\\b\\w/g, (c: string) => c.toUpperCase()),
          category: control?.category || 'general',
          description: control?.description || '',
          estimatedCost: control?.estimatedCost || 'medium',
          implementationPriority: control?.priority || 'medium',
          tapaReference: control?.tapaReference || null,
        };
      })
    );
    
    res.json({
      total: enrichedRecommendations.length,
      recommendations: enrichedRecommendations,
      threatSpecificControls: threatSpecificControls.length > 0 ? threatSpecificControls : undefined,
    });
  } catch (error) {
    console.error('Error getting warehouse control recommendations:', error);
    res.status(500).json({ error: 'Failed to get control recommendations' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/warehouse-interview/get-threat-breakdown
 * 
 * Get detailed vulnerability breakdown for a specific threat.
 * Shows which questions passed/failed and their risk weights.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   threatId: string
 * }
 */

const warehouseThreatBreakdownRoute = `
app.post('/api/assessments/:id/warehouse-interview/get-threat-breakdown', async (req, res) => {
  try {
    const { interviewResponses, threatId } = req.body;
    
    if (!interviewResponses || !threatId) {
      return res.status(400).json({ error: 'interviewResponses and threatId are required' });
    }
    
    // Get vulnerability breakdown
    const breakdown = getThreatVulnerabilityBreakdown(interviewResponses, threatId);
    
    // Get threat details
    const threat = WAREHOUSE_THREATS.find(t => t.id === threatId);
    
    // Calculate T, V, I scores
    const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
    const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threatId);
    const impact = calculateImpactFromInterview(interviewResponses, threatId);
    const inherentRisk = threatLikelihood * vulnerability * impact;
    
    res.json({
      threat: threat ? {
        id: threat.id,
        name: threat.name,
        category: threat.category,
        asisCode: threat.asisCode,
      } : null,
      scores: {
        threatLikelihood,
        vulnerability,
        impact,
        inherentRisk,
        normalizedRisk: (inherentRisk / 125) * 100,
        riskLevel: inherentRisk >= 75 ? 'critical' : inherentRisk >= 50 ? 'high' : inherentRisk >= 25 ? 'medium' : 'low',
      },
      vulnerabilityBreakdown: breakdown,
      questionMapping: THREAT_QUESTION_MAP[threatId] || null,
    });
  } catch (error) {
    console.error('Error getting threat breakdown:', error);
    res.status(500).json({ error: 'Failed to get threat breakdown' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/warehouse-interview/industry-benchmarks
 * 
 * Returns warehouse industry benchmarks and TAPA standards.
 */

const warehouseBenchmarksRoute = `
app.get('/api/assessments/:id/warehouse-interview/industry-benchmarks', async (req, res) => {
  try {
    const benchmarks = getIndustryBenchmarks();
    
    res.json({
      ...benchmarks,
      cargoTheftStatistics: {
        averageLoss: '$186,779 per full truckload incident (CargoNet)',
        insiderInvolvement: '60-80% of cargo theft involves insiders (FBI)',
        dockTheft: '47% of cargo theft occurs at loading docks (CargoNet)',
        highRiskCommodities: ['Electronics', 'Pharmaceuticals', 'Consumer goods', 'Food/beverage', 'Clothing/apparel'],
        highRiskStates: ['California', 'Texas', 'Florida', 'Georgia', 'New Jersey'],
        peakTheftTimes: ['Weekends', 'Holidays', 'Overnight shifts'],
      },
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/warehouse-interview/prioritize-threats
 * 
 * Get prioritized list of threats based on interview responses.
 */

const warehousePrioritizeThreatsRoute = `
app.post('/api/assessments/:id/warehouse-interview/prioritize-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const allThreats = getPrioritizedThreats(interviewResponses);
    const highestRisks = getHighestRiskThreats(interviewResponses);
    
    res.json({
      allThreats,
      highestRisks,
      summary: {
        criticalCount: allThreats.filter(t => t.riskLevel === 'critical').length,
        highCount: allThreats.filter(t => t.riskLevel === 'high').length,
        mediumCount: allThreats.filter(t => t.riskLevel === 'medium').length,
        lowCount: allThreats.filter(t => t.riskLevel === 'low').length,
      }
    });
  } catch (error) {
    console.error('Error prioritizing threats:', error);
    res.status(500).json({ error: 'Failed to prioritize threats' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/warehouse-interview/questions
 * 
 * Returns the warehouse interview questions with metadata.
 */

const warehouseQuestionsRoute = `
app.get('/api/assessments/:id/warehouse-interview/questions', async (req, res) => {
  try {
    res.json({
      questions: WAREHOUSE_INTERVIEW_QUESTIONS,
      sections: SECTION_METADATA,
      sectionOrder: WAREHOUSE_SECTIONS,
      totalQuestions: WAREHOUSE_INTERVIEW_QUESTIONS.length,
      questionsBySections: WAREHOUSE_SECTIONS.reduce((acc, section) => {
        acc[section] = WAREHOUSE_INTERVIEW_QUESTIONS.filter(q => q.section === section).length;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching warehouse questions:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse questions' });
  }
});
`;

// ============================================================================
// FULL ROUTE BLOCK TO COPY
// ============================================================================

export const WAREHOUSE_ROUTES_BLOCK = `
// ============================================================================
// WAREHOUSE & DISTRIBUTION CENTER AI INTERVIEW ROUTES
// ============================================================================

/**
 * Generate warehouse risk scenarios using AI with algorithmic fallback
 * Uses T×V×I formula (Threat × Vulnerability × Impact)
 */
app.post('/api/assessments/:id/warehouse-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true, 
      photoFindings, 
      incidentHistory,
      shrinkageData,
      capIndexData,
      tapaLevel 
    } = req.body;
    
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'warehouse' && assessment.facilityType !== 'warehouse') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Warehouse assessments only.' 
      });
    }
    
    const result = await generateWarehouseRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, shrinkageData, capIndexData, tapaLevel }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating warehouse risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Assess a single warehouse threat (for testing or incremental assessment)
 */
app.post('/api/assessments/:id/warehouse-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    const validThreat = WAREHOUSE_THREATS.find(t => t.id === threatId);
    if (!validThreat) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validThreats: WAREHOUSE_THREATS.map(t => t.id)
      });
    }
    
    const result = await assessSingleWarehouseThreat(threatId, interviewResponses, useAI);
    res.json(result);
  } catch (error) {
    console.error('Error assessing single warehouse threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate AI narrative summary for warehouse assessment
 */
app.post('/api/assessments/:id/warehouse-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, narrativeType = 'executive_summary' } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context = {
      assessmentId: parseInt(id),
      interviewResponses: interviewResponses || {},
    };
    
    const narrative = await generateWarehouseNarrative({
      assessmentId: parseInt(id),
      riskScenarios: results,
      facilityContext: context,
      narrativeType,
    });
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating warehouse narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});

/**
 * Get warehouse threat definitions for interview workflow
 */
app.get('/api/assessments/:id/warehouse-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: WAREHOUSE_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode,
        description: t.description,
      })),
      totalThreats: WAREHOUSE_THREATS.length,
    });
  } catch (error) {
    console.error('Error fetching warehouse threats:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse threats' });
  }
});

/**
 * Calculate real-time cargo theft and security risk during interview
 */
app.post('/api/assessments/:id/warehouse-interview/calculate-cargo-theft-risk', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const { score, grade, findings, strengths, categoryScores } = calculateOverallSecurityScore(interviewResponses);
    
    // Shrinkage level
    const shrinkage = (interviewResponses.incident_3 || '').toLowerCase();
    let shrinkageLevel = 'unknown';
    if (shrinkage.includes('under 0.5%')) shrinkageLevel = 'excellent';
    else if (shrinkage.includes('0.5% - 1%')) shrinkageLevel = 'good';
    else if (shrinkage.includes('1% - 2%')) shrinkageLevel = 'average';
    else if (shrinkage.includes('2% - 3%')) shrinkageLevel = 'concerning';
    else if (shrinkage.includes('over 3%')) shrinkageLevel = 'critical';
    
    // Cargo theft risk
    const incidentCount = [
      interviewResponses.incident_1 === 'yes',
      interviewResponses.incident_2 === 'yes',
      interviewResponses.incident_4 === 'yes',
      interviewResponses.incident_5 === 'yes',
      interviewResponses.incident_7 === 'yes',
    ].filter(Boolean).length;
    
    let cargoTheftRisk = 'low';
    if (incidentCount >= 3 || interviewResponses.incident_7 === 'yes') cargoTheftRisk = 'critical';
    else if (incidentCount >= 2 || interviewResponses.incident_1 === 'yes') cargoTheftRisk = 'high';
    else if (incidentCount >= 1) cargoTheftRisk = 'moderate';
    
    // TAPA compliance estimate
    const hasFencing = !(interviewResponses.perimeter_1 || '').toLowerCase().includes('no fencing');
    const hasIntrusionDetection = interviewResponses.perimeter_3 === 'yes';
    const hasDockCCTV = interviewResponses.dock_2 === 'yes';
    const hasBackgroundChecks = !(interviewResponses.personnel_1 || '').toLowerCase().includes('no background');
    const hasSealVerification = !(interviewResponses.dock_4 || '').toLowerCase().includes('no seal');
    const hasGPSTracking = interviewResponses.fleet_2 === 'yes';
    
    let estimatedTapaLevel = 'none';
    if (hasFencing && hasDockCCTV && hasBackgroundChecks) {
      estimatedTapaLevel = 'C';
      if (hasIntrusionDetection && hasSealVerification) {
        estimatedTapaLevel = 'B';
        const has100Coverage = (interviewResponses.perimeter_6a || '').includes('100%');
        const has30DayRetention = (interviewResponses.surveillance_2 || '').toLowerCase().includes('30');
        if (has100Coverage && has30DayRetention && hasGPSTracking) {
          estimatedTapaLevel = 'A';
        }
      }
    }
    
    res.json({
      securityScore: score,
      securityGrade: grade,
      shrinkageLevel,
      cargoTheftRisk,
      keyFindings: findings,
      strengths,
      categoryScores,
      tapaCompliance: { estimatedLevel: estimatedTapaLevel },
      components: {
        hasPerimeterSecurity: hasFencing && interviewResponses.perimeter_6 === 'yes',
        hasDockCCTV,
        hasGPSTracking,
        hasBackgroundChecks,
        hasWMS: interviewResponses.inventory_1 === 'yes',
        hasSealVerification,
        hasInsiderThreatProgram: interviewResponses.personnel_8 === 'yes',
      }
    });
  } catch (error) {
    console.error('Error calculating cargo theft risk:', error);
    res.status(500).json({ error: 'Failed to calculate cargo theft risk' });
  }
});

/**
 * Get warehouse-specific security controls
 */
app.get('/api/controls/warehouse', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'warehouse')
    });
    
    const grouped = controls.reduce((acc, control) => {
      const category = control.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(control);
      return acc;
    }, {} as Record<string, typeof controls>);
    
    res.json({
      total: controls.length,
      byCategory: grouped,
      categories: Object.keys(grouped),
    });
  } catch (error) {
    console.error('Error fetching warehouse controls:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse controls' });
  }
});

/**
 * Get control recommendations based on interview responses
 */
app.post('/api/assessments/:id/warehouse-interview/get-control-recommendations', async (req, res) => {
  try {
    const { interviewResponses, priorityThreats } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const recommendations = generateControlRecommendations(interviewResponses, priorityThreats?.[0]);
    
    let threatSpecificControls = [];
    if (priorityThreats && priorityThreats.length > 0) {
      for (const threatId of priorityThreats) {
        const controls = getThreatSpecificControls(interviewResponses, threatId);
        threatSpecificControls.push({ threatId, controls });
      }
    }
    
    res.json({
      total: recommendations.length,
      recommendations: recommendations.map(controlId => ({
        controlId,
        controlName: controlId.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase()),
      })),
      threatSpecificControls: threatSpecificControls.length > 0 ? threatSpecificControls : undefined,
    });
  } catch (error) {
    console.error('Error getting control recommendations:', error);
    res.status(500).json({ error: 'Failed to get control recommendations' });
  }
});

/**
 * Get detailed threat vulnerability breakdown
 */
app.post('/api/assessments/:id/warehouse-interview/get-threat-breakdown', async (req, res) => {
  try {
    const { interviewResponses, threatId } = req.body;
    
    if (!interviewResponses || !threatId) {
      return res.status(400).json({ error: 'interviewResponses and threatId are required' });
    }
    
    const breakdown = getThreatVulnerabilityBreakdown(interviewResponses, threatId);
    const threat = WAREHOUSE_THREATS.find(t => t.id === threatId);
    
    const T = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
    const V = calculateVulnerabilityFromInterview(interviewResponses, threatId);
    const I = calculateImpactFromInterview(interviewResponses, threatId);
    const inherentRisk = T * V * I;
    
    res.json({
      threat: threat ? { id: threat.id, name: threat.name, category: threat.category } : null,
      scores: { threatLikelihood: T, vulnerability: V, impact: I, inherentRisk },
      vulnerabilityBreakdown: breakdown,
    });
  } catch (error) {
    console.error('Error getting threat breakdown:', error);
    res.status(500).json({ error: 'Failed to get threat breakdown' });
  }
});

/**
 * Get industry benchmarks and TAPA standards
 */
app.get('/api/assessments/:id/warehouse-interview/industry-benchmarks', async (req, res) => {
  try {
    const benchmarks = getIndustryBenchmarks();
    res.json({
      ...benchmarks,
      cargoTheftStatistics: {
        averageLoss: '$186,779 per full truckload incident',
        insiderInvolvement: '60-80% involves insiders',
        dockTheft: '47% occurs at loading docks',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});

/**
 * Prioritize threats based on interview responses
 */
app.post('/api/assessments/:id/warehouse-interview/prioritize-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const allThreats = getPrioritizedThreats(interviewResponses);
    const highestRisks = getHighestRiskThreats(interviewResponses);
    
    res.json({ allThreats, highestRisks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to prioritize threats' });
  }
});

/**
 * Get warehouse interview questions
 */
app.get('/api/assessments/:id/warehouse-interview/questions', async (req, res) => {
  try {
    res.json({
      questions: WAREHOUSE_INTERVIEW_QUESTIONS,
      sections: SECTION_METADATA,
      sectionOrder: WAREHOUSE_SECTIONS,
      totalQuestions: WAREHOUSE_INTERVIEW_QUESTIONS.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});
`;

// ============================================================================
// SCHEMA UPDATES REQUIRED
// ============================================================================

/**
 * Ensure risk_scenarios table has AI evidence columns:
 * 
 * ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS ai_evidence JSONB;
 * ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20);
 * ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS assessment_mode VARCHAR(20);
 * 
 * Or in Drizzle schema (shared/schema.ts):
 * 
 * export const riskScenarios = pgTable('risk_scenarios', {
 *   // ... existing columns
 *   aiEvidence: jsonb('ai_evidence'),
 *   aiConfidence: varchar('ai_confidence', { length: 20 }),
 *   assessmentMode: varchar('assessment_mode', { length: 20 }),
 * });
 * 
 * Additional columns for warehouse-specific tracking:
 * 
 * ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tapa_level VARCHAR(10);
 * ALTER TABLE assessments ADD COLUMN IF NOT EXISTS cargo_theft_risk VARCHAR(20);
 * ALTER TABLE assessments ADD COLUMN IF NOT EXISTS shrinkage_rate DECIMAL(5,2);
 */

// ============================================================================
// FRONTEND INTEGRATION NOTES
// ============================================================================

/**
 * The warehouse interview workflow in the frontend should:
 * 
 * 1. Load questions from WAREHOUSE_INTERVIEW_QUESTIONS
 * 2. Display 9 sections with progressive disclosure:
 *    - Facility & Operations Profile
 *    - Cargo Theft & Incident History
 *    - Perimeter & Yard Security
 *    - Loading Dock Security
 *    - Inventory Control & Management
 *    - Personnel & Access Control
 *    - Vehicle & Fleet Security
 *    - Surveillance & Monitoring
 *    - Emergency Response & Procedures
 * 
 * 3. Call /warehouse-interview/calculate-cargo-theft-risk after key sections
 *    (particularly after Incident History and Perimeter sections)
 *    to show real-time security score and cargo theft risk indicator
 * 
 * 4. Show TAPA compliance level estimate (A/B/C/None) with gap list
 * 
 * 5. On completion, call /warehouse-interview/generate-risks-ai with useAI=true
 * 
 * 6. Display generated risk scenarios with T×V×I breakdown and:
 *    - Risk level badges (Critical/High/Medium/Low)
 *    - AI confidence indicator
 *    - Control recommendations with TAPA references
 * 
 * 7. Generate narrative summary for executive report
 * 
 * Key UI Elements:
 * - Security Score gauge (0-100 with A-F grade)
 * - Shrinkage Level indicator (excellent → critical)
 * - Cargo Theft Risk level (low → critical)
 * - TAPA Compliance badge (Level A/B/C or Non-compliant)
 * - Risk level badges per threat
 * - Section progress tracker (9 sections)
 * - AI confidence indicator
 * - Industry benchmarks comparison
 * 
 * Color Coding:
 * - Critical: Red (#DC2626)
 * - High: Orange (#EA580C)
 * - Medium: Yellow (#CA8A04)
 * - Low: Green (#16A34A)
 * - TAPA Level A: Gold (#EAB308)
 * - TAPA Level B: Silver (#9CA3AF)
 * - TAPA Level C: Bronze (#92400E)
 */

// ============================================================================
// REACT COMPONENT EXAMPLE - CARGO THEFT RISK INDICATOR
// ============================================================================

export const CargoTheftRiskIndicatorExample = `
interface CargoTheftRiskIndicatorProps {
  securityScore: number;
  securityGrade: string;
  shrinkageLevel: string;
  cargoTheftRisk: string;
  tapaLevel: 'A' | 'B' | 'C' | 'none';
}

const CargoTheftRiskIndicator: React.FC<CargoTheftRiskIndicatorProps> = ({
  securityScore,
  securityGrade,
  shrinkageLevel,
  cargoTheftRisk,
  tapaLevel,
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getTapaColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-yellow-400 text-yellow-900';
      case 'B': return 'bg-gray-300 text-gray-800';
      case 'C': return 'bg-amber-700 text-white';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow">
      {/* Security Score */}
      <div className="text-center">
        <div className="text-4xl font-bold">{securityScore}</div>
        <div className="text-2xl font-semibold text-gray-600">Grade: {securityGrade}</div>
        <div className="text-sm text-gray-500">Security Score</div>
      </div>

      {/* Cargo Theft Risk */}
      <div className="text-center">
        <div className={\`inline-block px-4 py-2 rounded-full text-white font-semibold \${getRiskColor(cargoTheftRisk)}\`}>
          {cargoTheftRisk.toUpperCase()}
        </div>
        <div className="text-sm text-gray-500 mt-2">Cargo Theft Risk</div>
      </div>

      {/* Shrinkage Level */}
      <div className="text-center">
        <div className="text-xl font-semibold capitalize">{shrinkageLevel}</div>
        <div className="text-sm text-gray-500">Shrinkage Level</div>
      </div>

      {/* TAPA Compliance */}
      <div className="text-center">
        <div className={\`inline-block px-4 py-2 rounded-lg font-semibold \${getTapaColor(tapaLevel)}\`}>
          {tapaLevel === 'none' ? 'Non-Compliant' : \`TAPA Level \${tapaLevel}\`}
        </div>
        <div className="text-sm text-gray-500 mt-2">TAPA FSR Status</div>
      </div>
    </div>
  );
};
`;

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Before deploying, verify:
 * 
 * □ Warehouse controls are seeded in database (run warehouse-controls-seed.sql)
 * □ risk_scenarios table has ai_evidence, ai_confidence columns
 * □ Routes respond correctly with test data
 * □ All 15 warehouse threat calculations produce valid scores (1-5)
 * □ Threat-specific vulnerability calculations work correctly
 * □ Security score calculation covers all 7 categories
 * □ Control recommendations map correctly to threats
 * □ AI fallback works when OpenAI API fails
 * □ Error handling works for missing/invalid data
 * □ Narrative generation produces coherent summary
 * □ TAPA compliance estimation is accurate
 * □ Shrinkage level mapping works correctly
 * □ Cargo theft risk calculation matches incident history
 * 
 * Test Scenarios:
 * 
 * 1. High-risk warehouse (all incidents = yes, no controls)
 *    Expected: Critical cargo theft risk, Grade F, no TAPA compliance
 * 
 * 2. TAPA Level A warehouse (all controls implemented)
 *    Expected: Low cargo theft risk, Grade A, TAPA Level A
 * 
 * 3. Partial controls (some questions answered, some gaps)
 *    Expected: Moderate risk, Grade C, TAPA Level C
 * 
 * 4. AI failure scenario (mock OpenAI failure)
 *    Expected: Algorithmic fallback with mode='algorithmic'
 * 
 * 5. Empty interview (no responses)
 *    Expected: Baseline scores (3 for each T/V/I)
 */

// ============================================================================
// API DOCUMENTATION
// ============================================================================

export const API_DOCUMENTATION = {
  baseUrl: '/api/assessments/:id/warehouse-interview',
  endpoints: [
    {
      method: 'POST',
      path: '/generate-risks-ai',
      description: 'Generate all risk scenarios using AI with algorithmic fallback',
      requestBody: {
        interviewResponses: 'Record<string, any> - Interview question responses',
        useAI: 'boolean (default: true) - Whether to use AI assessment',
        photoFindings: 'string[] (optional) - GPT-4V photo analysis results',
        incidentHistory: 'WarehouseIncidentRecord[] (optional) - Historical incidents',
        shrinkageData: 'ShrinkageProfile (optional) - Shrinkage metrics',
        capIndexData: 'CAPIndexData (optional) - Geographic crime data',
        tapaLevel: "'A' | 'B' | 'C' | 'none' (optional) - Current TAPA certification",
      },
      response: 'WarehouseGeneratedScenarioResult',
    },
    {
      method: 'POST',
      path: '/assess-single-threat',
      description: 'Assess a single threat (for testing or real-time feedback)',
      requestBody: {
        threatId: 'string - Warehouse threat identifier',
        interviewResponses: 'Record<string, any> - Interview question responses',
        useAI: 'boolean (default: true)',
      },
      response: 'WarehouseAIAssessmentResponse',
    },
    {
      method: 'POST',
      path: '/calculate-cargo-theft-risk',
      description: 'Real-time security score and cargo theft risk calculation',
      requestBody: {
        interviewResponses: 'Record<string, any>',
      },
      response: 'Security score, grade, shrinkage level, TAPA compliance, components',
    },
    {
      method: 'POST',
      path: '/get-control-recommendations',
      description: 'Get prioritized control recommendations',
      requestBody: {
        interviewResponses: 'Record<string, any>',
        priorityThreats: 'string[] (optional) - Focus on specific threats',
      },
      response: 'Control recommendations with threat-specific details',
    },
    {
      method: 'POST',
      path: '/get-threat-breakdown',
      description: 'Get detailed vulnerability breakdown for a threat',
      requestBody: {
        interviewResponses: 'Record<string, any>',
        threatId: 'string',
      },
      response: 'T/V/I scores, question-level breakdown, risk factors',
    },
    {
      method: 'POST',
      path: '/prioritize-threats',
      description: 'Get threats sorted by risk level',
      requestBody: {
        interviewResponses: 'Record<string, any>',
      },
      response: 'All threats sorted by inherent risk, highest risks only',
    },
    {
      method: 'GET',
      path: '/threats',
      description: 'Get warehouse threat definitions',
      response: 'Array of 15 warehouse threats with metadata',
    },
    {
      method: 'GET',
      path: '/questions',
      description: 'Get interview questions with section metadata',
      response: 'Questions, sections, ordering',
    },
    {
      method: 'GET',
      path: '/industry-benchmarks',
      description: 'Get TAPA standards and cargo theft statistics',
      response: 'Benchmarks, TAPA requirements, theft statistics',
    },
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  WAREHOUSE_ROUTES_BLOCK,
  API_DOCUMENTATION,
  routes: {
    generateRisksAI: '/api/assessments/:id/warehouse-interview/generate-risks-ai',
    assessSingleThreat: '/api/assessments/:id/warehouse-interview/assess-single-threat',
    generateNarrative: '/api/assessments/:id/warehouse-interview/generate-narrative',
    getThreats: '/api/assessments/:id/warehouse-interview/threats',
    calculateCargoTheftRisk: '/api/assessments/:id/warehouse-interview/calculate-cargo-theft-risk',
    getControls: '/api/controls/warehouse',
    getControlRecommendations: '/api/assessments/:id/warehouse-interview/get-control-recommendations',
    getThreatBreakdown: '/api/assessments/:id/warehouse-interview/get-threat-breakdown',
    prioritizeThreats: '/api/assessments/:id/warehouse-interview/prioritize-threats',
    getQuestions: '/api/assessments/:id/warehouse-interview/questions',
    getBenchmarks: '/api/assessments/:id/warehouse-interview/industry-benchmarks',
  },
  testEndpoints: {
    sampleRequest: {
      interviewResponses: {
        facility_1: 'distribution_center',
        facility_2: '200,001 - 500,000 sq ft',
        facility_3: '101-250 employees',
        incident_1: 'no',
        incident_3: '1% - 2% (industry average)',
        perimeter_1: '8ft+ chain link with 3-strand barbed wire',
        perimeter_6: 'yes',
        dock_2: 'yes',
        dock_4: 'Documented process with seal log',
        personnel_1: 'Yes, background checks for all warehouse employees',
        fleet_2: 'yes',
      },
      useAI: true,
    },
  },
};
