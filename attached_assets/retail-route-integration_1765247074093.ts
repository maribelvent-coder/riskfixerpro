/**
 * Retail Store Route Integration Guide
 * 
 * This file provides the route definitions and integration instructions
 * for wiring the retail AI assessment into server/routes.ts
 * 
 * FACILITY TYPE: Retail Store (Big Box, Specialty, Grocery, Convenience, etc.)
 * ASSESSMENT FOCUS: Shrinkage prevention, ORC, cash handling, employee theft, robbery
 * THREATS: 15 retail-specific threats with T×V×I calculation
 * 
 * @author RiskFixer Team
 * @version 1.0
 */

// ============================================================================
// IMPORTS TO ADD TO server/routes.ts
// ============================================================================

/*
Add these imports at the top of server/routes.ts:

// Retail AI Assessment (GPT-4 powered with algorithmic fallback)
import { 
  generateRetailRiskScenariosWithAI,
  assessSingleRetailThreat,
  generateRetailNarrativeSummary,
  RetailAssessmentContext,
  RetailAIAssessmentResponse,
  RETAIL_STORE_THREATS,
} from './services/retail-ai-risk-assessment';

// Retail Algorithmic Assessment (pure calculation, no AI)
import {
  initializeRiskScenariosFromInterview,
  calculateOverallSecurityScore,
  generateControlRecommendations,
  getRecommendedControlsForGaps,
  RETAIL_STORE_THREATS as RETAIL_THREATS_ALGO,
  THREAT_CONTROL_MAPPING,
} from './services/retail-interview-mapper';

// Retail Interview Questions
import {
  RETAIL_INTERVIEW_QUESTIONS,
  getQuestionsBySection,
  getQuestionById,
  getQuestionsForThreat,
  getYesGoodQuestions,
  getYesBadQuestions,
  validateQuestionnaire,
  getQuestionnaireStats,
  RETAIL_SECTIONS,
  RETAIL_SECTION_METADATA,
} from './data/retail-interview-questionnaire';
*/

// ============================================================================
// ROUTE DEFINITIONS - DOCUMENTED
// ============================================================================

/**
 * Route: POST /api/assessments/:id/retail-interview/generate-risks-ai
 * 
 * Generates risk scenarios from retail interview responses using T×V×I formula
 * with GPT-4 AI assessment and algorithmic fallback.
 * 
 * This is the PRIMARY entry point for generating risk scenarios after
 * completing the interview questionnaire.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,  // All 70+ question responses
 *   useAI?: boolean,                          // Default true
 *   photoFindings?: string[],                 // GPT-4V photo analysis results
 *   incidentHistory?: Array<{
 *     date: string;
 *     type: 'shoplifting' | 'orc' | 'employee_theft' | 'robbery' | 'burglary' | 
 *           'fraud' | 'violence' | 'vandalism' | 'other';
 *     description: string;
 *     severity: 'low' | 'medium' | 'high' | 'critical';
 *     lossAmount?: number;
 *     apprehension?: boolean;
 *     prosecuted?: boolean;
 *   }>,
 *   capIndexData?: {
 *     overallScore?: number;
 *     theftScore?: number;
 *     violentCrimeScore?: number;
 *     burglaryScore?: number;
 *   },
 *   shrinkageData?: {
 *     currentRate: number;
 *     previousYearRate?: number;
 *     industryAverage?: number;
 *     primaryCauses: string[];
 *     annualLossDollars?: number;
 *   },
 *   storeName?: string                        // For narrative generation
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   mode: 'ai' | 'algorithmic' | 'hybrid',    // Which method was used
 *   generatedScenarios: number,               // Should be 15 for all retail threats
 *   criticalRisks: number,                    // T×V×I normalized ≥75
 *   highRisks: number,                        // T×V×I normalized ≥50
 *   mediumRisks: number,                      // T×V×I normalized ≥25
 *   lowRisks: number,                         // T×V×I normalized <25
 *   riskScenarioIds: number[],                // Database IDs for created scenarios
 *   overallShrinkageRisk: string,             // 'Critical' | 'High' | 'Moderate' | 'Low' | 'Minimal' | 'Unknown'
 *   aiConfidence: 'high' | 'medium' | 'low' | 'fallback',
 *   processingTimeMs: number
 * }
 */

const retailGenerateRisksAIRoute = `
app.post('/api/assessments/:id/retail-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true, 
      photoFindings, 
      incidentHistory,
      capIndexData,
      shrinkageData,
      storeName 
    } = req.body;
    
    // Validate assessment exists and is retail type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'retail_store' && assessment.facilityType !== 'retail_store') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Retail Store assessments only.' 
      });
    }
    
    // Generate risk scenarios using AI with algorithmic fallback
    const result = await generateRetailRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, capIndexData, shrinkageData }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating retail risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/retail-interview/assess-single-threat
 * 
 * Assess a single retail threat using AI (for testing or incremental assessment).
 * Useful for real-time feedback during interview or debugging.
 * 
 * Request Body:
 * {
 *   threatId: string,              // e.g., 'shoplifting', 'organized_retail_crime'
 *   interviewResponses: Record<string, any>,
 *   useAI?: boolean                // Default true
 * }
 * 
 * Response: RetailAIAssessmentResponse (full T×V×I breakdown with evidence)
 */

const retailAssessSingleThreatRoute = `
app.post('/api/assessments/:id/retail-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    // Validate threatId exists
    const validThreatIds = [
      'shoplifting', 'organized_retail_crime', 'employee_theft', 'armed_robbery',
      'cash_handling_theft', 'smash_and_grab', 'customer_violence', 'return_fraud',
      'vandalism', 'after_hours_burglary', 'credit_card_fraud', 'inventory_shrinkage',
      'parking_lot_crime', 'counterfeit_currency', 'display_tampering'
    ];
    
    if (!validThreatIds.includes(threatId)) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validOptions: validThreatIds
      });
    }
    
    const result = await assessSingleRetailThreat(threatId, interviewResponses, { useAI });
    
    res.json(result);
  } catch (error) {
    console.error('Error assessing single retail threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/retail-interview/generate-narrative
 * 
 * Generate AI executive summary narrative for retail assessment.
 * Best called AFTER generate-risks-ai to summarize the results.
 * 
 * Request Body:
 * {
 *   results: RetailAIAssessmentResponse[],    // Array from generate-risks-ai
 *   interviewResponses: Record<string, any>,
 *   storeName?: string
 * }
 * 
 * Response:
 * {
 *   narrative: string   // 300-500 word professional summary
 * }
 */

const retailGenerateNarrativeRoute = `
app.post('/api/assessments/:id/retail-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, storeName } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context = {
      assessmentId: parseInt(id),
      storeName,
      interviewResponses: interviewResponses || {},
    };
    
    const narrative = await generateRetailNarrativeSummary(results, context);
    
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating retail narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/retail-interview/threats
 * 
 * Returns the list of retail-specific threats for the interview workflow.
 */

const retailThreatsRoute = `
app.get('/api/assessments/:id/retail-interview/threats', async (req, res) => {
  try {
    res.json({
      threatCount: RETAIL_STORE_THREATS.length,
      threats: RETAIL_STORE_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode
      }))
    });
  } catch (error) {
    console.error('Error fetching retail threats:', error);
    res.status(500).json({ error: 'Failed to fetch retail threats' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/retail-interview/quick-security-score
 * 
 * Get quick security posture score without full AI assessment.
 * Use for real-time feedback during interview.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   score: number,          // 0-100
 *   grade: string,          // A/B/C/D/F
 *   findings: string[]      // Key security gaps identified
 * }
 */

const retailQuickSecurityScoreRoute = `
app.post('/api/assessments/:id/retail-interview/quick-security-score', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const { score, grade, findings } = calculateOverallSecurityScore(interviewResponses);
    
    res.json({
      score,
      grade,
      findings
    });
  } catch (error) {
    console.error('Error calculating quick security score:', error);
    res.status(500).json({ error: 'Failed to calculate security score' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/retail-interview/calculate-shrinkage-risk
 * 
 * Calculate comprehensive shrinkage and security posture during interview.
 * Provides real-time feedback on loss prevention effectiveness.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   securityScore: number,          // 0-100
 *   securityGrade: string,          // A/B/C/D/F
 *   shrinkageLevel: string,         // 'excellent' | 'acceptable' | 'moderate' | 'high' | 'critical' | 'unknown'
 *   keyFindings: string[],
 *   components: {
 *     hasEAS: boolean,
 *     hasCCTV: boolean,
 *     hasLPStaff: boolean,
 *     hasRobberyTraining: boolean,
 *     hasIntrusionAlarm: boolean,
 *     hasPanicAlarms: boolean,
 *     hasCashControls: boolean
 *   },
 *   riskIndicators: {
 *     orcHistory: boolean,
 *     highShrinkage: boolean,
 *     robberyHistory: boolean,
 *     highCrimeArea: boolean
 *   }
 * }
 */

const retailShrinkageRiskRoute = `
app.post('/api/assessments/:id/retail-interview/calculate-shrinkage-risk', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const { score, grade, findings } = calculateOverallSecurityScore(interviewResponses);
    
    // Determine shrinkage level from response
    const shrinkage = (interviewResponses.shrinkage_1 || '').toLowerCase();
    let shrinkageLevel = 'unknown';
    if (shrinkage.includes('over 5%')) shrinkageLevel = 'critical';
    else if (shrinkage.includes('3-5%')) shrinkageLevel = 'high';
    else if (shrinkage.includes('2-3%')) shrinkageLevel = 'moderate';
    else if (shrinkage.includes('1-2%')) shrinkageLevel = 'acceptable';
    else if (shrinkage.includes('under 1%')) shrinkageLevel = 'excellent';
    
    // Check for risk indicators
    const orcHistory = interviewResponses.shrinkage_4 === 'yes';
    const highShrinkage = shrinkage.includes('3-5%') || shrinkage.includes('over 5%');
    const robberyHistory = interviewResponses.shrinkage_6 === 'yes';
    const areaRisk = (interviewResponses.external_1 || '').toLowerCase();
    const highCrimeArea = areaRisk.includes('high') || areaRisk.includes('very high');
    
    res.json({
      securityScore: score,
      securityGrade: grade,
      shrinkageLevel,
      keyFindings: findings,
      components: {
        hasEAS: interviewResponses.eas_1 === 'yes',
        hasCCTV: interviewResponses.cctv_1 === 'yes',
        hasLPStaff: !(interviewResponses.lp_staff_1 || '').toLowerCase().includes('no'),
        hasRobberyTraining: interviewResponses.employee_3 === 'yes',
        hasIntrusionAlarm: interviewResponses.physical_5 === 'yes',
        hasPanicAlarms: interviewResponses.physical_6 === 'yes',
        hasCashControls: interviewResponses.cash_2 === 'yes' && interviewResponses.cash_7 === 'yes',
      },
      riskIndicators: {
        orcHistory,
        highShrinkage,
        robberyHistory,
        highCrimeArea,
      }
    });
  } catch (error) {
    console.error('Error calculating shrinkage risk:', error);
    res.status(500).json({ error: 'Failed to calculate shrinkage risk' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/retail-interview/prioritized-threats
 * 
 * Get threats sorted by calculated risk level for prioritization.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   prioritizedThreats: Array<{
 *     threatId: string,
 *     threatName: string,
 *     category: string,
 *     threatLikelihood: number,
 *     vulnerability: number,
 *     impact: number,
 *     inherentRisk: number,
 *     riskLevel: 'critical' | 'high' | 'medium' | 'low'
 *   }>
 * }
 */

const retailPrioritizedThreatsRoute = `
app.post('/api/assessments/:id/retail-interview/prioritized-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    // Import calculation functions
    const { 
      calculateThreatLikelihoodFromInterview,
      calculateVulnerabilityFromInterview,
      calculateImpactFromInterview 
    } = require('./services/retail-interview-mapper');
    
    const prioritizedThreats = RETAIL_STORE_THREATS.map(threat => {
      const T = calculateThreatLikelihoodFromInterview(interviewResponses, threat.id);
      const V = calculateVulnerabilityFromInterview(interviewResponses, threat.id);
      const I = calculateImpactFromInterview(interviewResponses, threat.id);
      const inherentRisk = T * V * I;
      const normalizedRisk = (inherentRisk / 125) * 100;
      
      let riskLevel: 'critical' | 'high' | 'medium' | 'low';
      if (normalizedRisk >= 75) riskLevel = 'critical';
      else if (normalizedRisk >= 50) riskLevel = 'high';
      else if (normalizedRisk >= 25) riskLevel = 'medium';
      else riskLevel = 'low';
      
      return {
        threatId: threat.id,
        threatName: threat.name,
        category: threat.category,
        threatLikelihood: T,
        vulnerability: V,
        impact: I,
        inherentRisk: Math.round(normalizedRisk),
        riskLevel
      };
    }).sort((a, b) => b.inherentRisk - a.inherentRisk);
    
    res.json({ prioritizedThreats });
  } catch (error) {
    console.error('Error calculating prioritized threats:', error);
    res.status(500).json({ error: 'Failed to calculate prioritized threats' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/retail-interview/risk-factor-analysis
 * 
 * Get detailed breakdown of risk factors from interview responses.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   totalRiskFactors: number,
 *   byCategory: Record<string, { factors: string[], count: number }>,
 *   criticalFactors: string[],
 *   positiveControls: string[]
 * }
 */

const retailRiskFactorAnalysisRoute = `
app.post('/api/assessments/:id/retail-interview/risk-factor-analysis', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const riskFactors: Record<string, string[]> = {
      shrinkage: [],
      eas: [],
      cctv: [],
      cashHandling: [],
      physicalSecurity: [],
      lpStaffing: [],
      employeeProcedures: [],
      merchandiseProtection: [],
      externalFactors: []
    };
    
    const positiveControls: string[] = [];
    
    // Analyze shrinkage
    if ((interviewResponses.shrinkage_1 || '').toLowerCase().includes('over 5%')) {
      riskFactors.shrinkage.push('Critical shrinkage rate (>5%)');
    } else if ((interviewResponses.shrinkage_1 || '').toLowerCase().includes('3-5%')) {
      riskFactors.shrinkage.push('High shrinkage rate (3-5%)');
    }
    if (interviewResponses.shrinkage_4 === 'yes') {
      riskFactors.shrinkage.push('ORC incidents in past 12 months');
    }
    if (interviewResponses.shrinkage_5 === 'yes') {
      riskFactors.shrinkage.push('Employee theft incidents confirmed');
    }
    if (interviewResponses.shrinkage_6 === 'yes') {
      riskFactors.shrinkage.push('Robbery history');
    }
    
    // Analyze EAS
    if (interviewResponses.eas_1 === 'no') {
      riskFactors.eas.push('No EAS system installed');
    } else {
      positiveControls.push('EAS system installed');
      if (interviewResponses.eas_1b === 'no') {
        riskFactors.eas.push('EAS gates not at all exits');
      }
    }
    
    // Analyze CCTV
    if (interviewResponses.cctv_1 === 'no') {
      riskFactors.cctv.push('No CCTV system');
    } else {
      positiveControls.push('CCTV system installed');
      if ((interviewResponses.cctv_1b || '').toLowerCase().includes('less than 7')) {
        riskFactors.cctv.push('Video retention less than 7 days');
      }
    }
    if (interviewResponses.cctv_5 === 'no') {
      riskFactors.cctv.push('No POS exception reporting');
    }
    
    // Analyze cash handling
    if ((interviewResponses.cash_1 || '').toLowerCase().includes('over $2,000')) {
      riskFactors.cashHandling.push('High register cash levels (>$2,000)');
    }
    if (interviewResponses.cash_2 === 'no') {
      riskFactors.cashHandling.push('No register cash limits');
    }
    if ((interviewResponses.cash_3 || '').toLowerCase().includes('no safe')) {
      riskFactors.cashHandling.push('No safe');
    }
    if (interviewResponses.cash_5 === 'no') {
      riskFactors.cashHandling.push('No armored car service');
    }
    if (interviewResponses.cash_7 === 'no') {
      riskFactors.cashHandling.push('No dual control cash procedures');
    }
    
    // Analyze physical security
    if (interviewResponses.physical_5 === 'no') {
      riskFactors.physicalSecurity.push('No intrusion alarm');
    } else {
      positiveControls.push('Intrusion alarm installed');
    }
    if (interviewResponses.physical_6 === 'no') {
      riskFactors.physicalSecurity.push('No panic/duress alarms');
    }
    if (interviewResponses.physical_3 === 'no') {
      riskFactors.physicalSecurity.push('No bollards for storefront protection');
    }
    
    // Analyze LP staffing
    if ((interviewResponses.lp_staff_1 || '').toLowerCase().includes('no')) {
      riskFactors.lpStaffing.push('No dedicated LP staff');
    }
    if (interviewResponses.lp_staff_5 === 'no') {
      riskFactors.lpStaffing.push('No prosecution policy');
    }
    
    // Analyze employee procedures
    if ((interviewResponses.employee_1 || '').toLowerCase().includes('no background')) {
      riskFactors.employeeProcedures.push('No employee background checks');
    }
    if (interviewResponses.employee_3 === 'no') {
      riskFactors.employeeProcedures.push('No robbery response training');
    }
    if (interviewResponses.employee_5 === 'no') {
      riskFactors.employeeProcedures.push('No two-person closing procedure');
    }
    
    // Analyze external factors
    const areaRisk = (interviewResponses.external_1 || '').toLowerCase();
    if (areaRisk.includes('high crime') || areaRisk.includes('very high')) {
      riskFactors.externalFactors.push('High crime area');
    }
    if (interviewResponses.external_2 === 'yes') {
      riskFactors.externalFactors.push('Known ORC activity in area');
    }
    
    // Calculate totals
    const allFactors = Object.values(riskFactors).flat();
    const criticalFactors = allFactors.filter(f => 
      f.includes('robbery') || f.includes('ORC') || f.includes('Critical') || 
      f.includes('No intrusion') || f.includes('>5%')
    );
    
    const byCategory = Object.entries(riskFactors).reduce((acc, [key, factors]) => {
      acc[key] = { factors, count: factors.length };
      return acc;
    }, {} as Record<string, { factors: string[], count: number }>);
    
    res.json({
      totalRiskFactors: allFactors.length,
      byCategory,
      criticalFactors,
      positiveControls
    });
  } catch (error) {
    console.error('Error analyzing risk factors:', error);
    res.status(500).json({ error: 'Failed to analyze risk factors' });
  }
});
`;

/**
 * Route: GET /api/controls/retail-store
 * 
 * Get all retail-specific security controls from database.
 * Groups controls by category for display.
 */

const retailControlsRoute = `
app.get('/api/controls/retail-store', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'retail_store')
    });
    
    const grouped = controls.reduce((acc, control) => {
      const category = control.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(control);
      return acc;
    }, {} as Record<string, typeof controls>);
    
    res.json({
      total: controls.length,
      byCategory: grouped
    });
  } catch (error) {
    console.error('Error fetching retail controls:', error);
    res.status(500).json({ error: 'Failed to fetch retail controls' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/retail-interview/get-control-recommendations
 * 
 * Get control recommendations based on interview responses.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   priorityThreats?: string[]   // Optional: focus on specific threats
 * }
 * 
 * Response:
 * {
 *   total: number,
 *   recommendations: Array<{
 *     controlId: string,
 *     controlName: string,
 *     category?: string,
 *     urgency?: 'immediate' | 'short_term' | 'medium_term'
 *   }>
 * }
 */

const retailControlRecommendationsRoute = `
app.post('/api/assessments/:id/retail-interview/get-control-recommendations', async (req, res) => {
  try {
    const { interviewResponses, priorityThreats } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const recommendations = getRecommendedControlsForGaps(interviewResponses, priorityThreats);
    
    // Determine urgency based on control type
    const getUrgency = (controlId: string): 'immediate' | 'short_term' | 'medium_term' => {
      const immediateControls = [
        'robbery_response_training', 'dual_control_cash_procedures', 
        'closing_procedures_two_person', 'alarm_system_panic_buttons'
      ];
      const shortTermControls = [
        'eas_system_tags', 'eas_system_gates', 'cctv_pos_registers',
        'time_delay_safe', 'drop_safe', 'employee_background_checks'
      ];
      
      if (immediateControls.includes(controlId)) return 'immediate';
      if (shortTermControls.includes(controlId)) return 'short_term';
      return 'medium_term';
    };
    
    res.json({
      total: recommendations.length,
      recommendations: recommendations.map(controlId => ({
        controlId,
        controlName: controlId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        urgency: getUrgency(controlId)
      }))
    });
  } catch (error) {
    console.error('Error getting control recommendations:', error);
    res.status(500).json({ error: 'Failed to get control recommendations' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/retail-interview/questions
 * 
 * Returns the complete retail interview questionnaire for the frontend.
 */

const retailQuestionsRoute = `
app.get('/api/assessments/:id/retail-interview/questions', async (req, res) => {
  try {
    const stats = getQuestionnaireStats();
    
    res.json({
      totalQuestions: stats.totalQuestions,
      topLevelQuestions: stats.topLevelQuestions,
      followUpQuestions: stats.followUpQuestions,
      sections: RETAIL_SECTION_METADATA,
      sectionCounts: stats.sectionCounts,
      questions: RETAIL_INTERVIEW_QUESTIONS
    });
  } catch (error) {
    console.error('Error fetching retail questions:', error);
    res.status(500).json({ error: 'Failed to fetch retail questions' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/retail-interview/questions/:section
 * 
 * Returns questions for a specific section.
 */

const retailQuestionsBySectionRoute = `
app.get('/api/assessments/:id/retail-interview/questions/:section', async (req, res) => {
  try {
    const { section } = req.params;
    
    // Find matching section
    const sectionMeta = RETAIL_SECTION_METADATA.find(
      s => s.id === section || s.name.toLowerCase().replace(/[^a-z]/g, '') === section.toLowerCase()
    );
    
    if (!sectionMeta) {
      return res.status(404).json({ 
        error: 'Section not found',
        availableSections: RETAIL_SECTIONS
      });
    }
    
    const questions = getQuestionsBySection(sectionMeta.name);
    
    res.json({
      section: sectionMeta,
      questionCount: questions.length,
      questions
    });
  } catch (error) {
    console.error('Error fetching retail questions by section:', error);
    res.status(500).json({ error: 'Failed to fetch retail questions' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/retail-interview/threat-questions/:threatId
 * 
 * Returns questions that inform a specific threat.
 * Useful for targeted follow-up assessments.
 */

const retailThreatQuestionsRoute = `
app.get('/api/assessments/:id/retail-interview/threat-questions/:threatId', async (req, res) => {
  try {
    const { threatId } = req.params;
    
    const validThreatIds = RETAIL_STORE_THREATS.map(t => t.id);
    if (!validThreatIds.includes(threatId)) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validOptions: validThreatIds
      });
    }
    
    const questions = getQuestionsForThreat(threatId);
    const threat = RETAIL_STORE_THREATS.find(t => t.id === threatId);
    
    res.json({
      threatId,
      threatName: threat?.name,
      category: threat?.category,
      questionCount: questions.length,
      questions
    });
  } catch (error) {
    console.error('Error fetching threat questions:', error);
    res.status(500).json({ error: 'Failed to fetch threat questions' });
  }
});
`;

// ============================================================================
// COMPLETE ROUTES BLOCK FOR COPY-PASTE
// ============================================================================

const RETAIL_ROUTES_BLOCK = `
// ============================================================================
// RETAIL STORE ASSESSMENT ROUTES
// ============================================================================

/**
 * Generate risk scenarios using AI with algorithmic fallback
 * PRIMARY ENTRY POINT after interview completion
 */
app.post('/api/assessments/:id/retail-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true, 
      photoFindings, 
      incidentHistory,
      capIndexData,
      shrinkageData,
      storeName 
    } = req.body;
    
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'retail_store' && assessment.facilityType !== 'retail_store') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Retail Store assessments only.' 
      });
    }
    
    const result = await generateRetailRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, capIndexData, shrinkageData }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating retail risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Assess a single retail threat (for testing or incremental assessment)
 */
app.post('/api/assessments/:id/retail-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    const validThreatIds = [
      'shoplifting', 'organized_retail_crime', 'employee_theft', 'armed_robbery',
      'cash_handling_theft', 'smash_and_grab', 'customer_violence', 'return_fraud',
      'vandalism', 'after_hours_burglary', 'credit_card_fraud', 'inventory_shrinkage',
      'parking_lot_crime', 'counterfeit_currency', 'display_tampering'
    ];
    
    if (!validThreatIds.includes(threatId)) {
      return res.status(400).json({ error: 'Invalid threatId', validOptions: validThreatIds });
    }
    
    const result = await assessSingleRetailThreat(threatId, interviewResponses, { useAI });
    res.json(result);
  } catch (error) {
    console.error('Error assessing single retail threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate AI narrative summary for retail assessment
 */
app.post('/api/assessments/:id/retail-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, storeName } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context = {
      assessmentId: parseInt(id),
      storeName,
      interviewResponses: interviewResponses || {},
    };
    
    const narrative = await generateRetailNarrativeSummary(results, context);
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating retail narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});

/**
 * Get retail threat definitions for interview workflow
 */
app.get('/api/assessments/:id/retail-interview/threats', async (req, res) => {
  try {
    res.json({
      threatCount: RETAIL_STORE_THREATS.length,
      threats: RETAIL_STORE_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode
      }))
    });
  } catch (error) {
    console.error('Error fetching retail threats:', error);
    res.status(500).json({ error: 'Failed to fetch retail threats' });
  }
});

/**
 * Quick security score (no AI, fast feedback)
 */
app.post('/api/assessments/:id/retail-interview/quick-security-score', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const { score, grade, findings } = calculateOverallSecurityScore(interviewResponses);
    res.json({ score, grade, findings });
  } catch (error) {
    console.error('Error calculating quick security score:', error);
    res.status(500).json({ error: 'Failed to calculate security score' });
  }
});

/**
 * Calculate comprehensive shrinkage and security posture
 */
app.post('/api/assessments/:id/retail-interview/calculate-shrinkage-risk', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const { score, grade, findings } = calculateOverallSecurityScore(interviewResponses);
    
    const shrinkage = (interviewResponses.shrinkage_1 || '').toLowerCase();
    let shrinkageLevel = 'unknown';
    if (shrinkage.includes('over 5%')) shrinkageLevel = 'critical';
    else if (shrinkage.includes('3-5%')) shrinkageLevel = 'high';
    else if (shrinkage.includes('2-3%')) shrinkageLevel = 'moderate';
    else if (shrinkage.includes('1-2%')) shrinkageLevel = 'acceptable';
    else if (shrinkage.includes('under 1%')) shrinkageLevel = 'excellent';
    
    res.json({
      securityScore: score,
      securityGrade: grade,
      shrinkageLevel,
      keyFindings: findings,
      components: {
        hasEAS: interviewResponses.eas_1 === 'yes',
        hasCCTV: interviewResponses.cctv_1 === 'yes',
        hasLPStaff: !(interviewResponses.lp_staff_1 || '').toLowerCase().includes('no'),
        hasRobberyTraining: interviewResponses.employee_3 === 'yes',
        hasIntrusionAlarm: interviewResponses.physical_5 === 'yes',
        hasPanicAlarms: interviewResponses.physical_6 === 'yes',
        hasCashControls: interviewResponses.cash_2 === 'yes' && interviewResponses.cash_7 === 'yes',
      },
      riskIndicators: {
        orcHistory: interviewResponses.shrinkage_4 === 'yes',
        highShrinkage: shrinkage.includes('3-5%') || shrinkage.includes('over 5%'),
        robberyHistory: interviewResponses.shrinkage_6 === 'yes',
        highCrimeArea: (interviewResponses.external_1 || '').toLowerCase().includes('high'),
      }
    });
  } catch (error) {
    console.error('Error calculating shrinkage risk:', error);
    res.status(500).json({ error: 'Failed to calculate shrinkage risk' });
  }
});

/**
 * Get prioritized threats sorted by risk level
 */
app.post('/api/assessments/:id/retail-interview/prioritized-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const { 
      calculateThreatLikelihoodFromInterview,
      calculateVulnerabilityFromInterview,
      calculateImpactFromInterview 
    } = require('./services/retail-interview-mapper');
    
    const prioritizedThreats = RETAIL_STORE_THREATS.map(threat => {
      const T = calculateThreatLikelihoodFromInterview(interviewResponses, threat.id);
      const V = calculateVulnerabilityFromInterview(interviewResponses, threat.id);
      const I = calculateImpactFromInterview(interviewResponses, threat.id);
      const inherentRisk = T * V * I;
      const normalizedRisk = (inherentRisk / 125) * 100;
      
      let riskLevel: 'critical' | 'high' | 'medium' | 'low';
      if (normalizedRisk >= 75) riskLevel = 'critical';
      else if (normalizedRisk >= 50) riskLevel = 'high';
      else if (normalizedRisk >= 25) riskLevel = 'medium';
      else riskLevel = 'low';
      
      return {
        threatId: threat.id,
        threatName: threat.name,
        category: threat.category,
        threatLikelihood: T,
        vulnerability: V,
        impact: I,
        inherentRisk: Math.round(normalizedRisk),
        riskLevel
      };
    }).sort((a, b) => b.inherentRisk - a.inherentRisk);
    
    res.json({ prioritizedThreats });
  } catch (error) {
    console.error('Error calculating prioritized threats:', error);
    res.status(500).json({ error: 'Failed to calculate prioritized threats' });
  }
});

/**
 * Get retail-specific security controls
 */
app.get('/api/controls/retail-store', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'retail_store')
    });
    
    const grouped = controls.reduce((acc, control) => {
      const category = control.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(control);
      return acc;
    }, {} as Record<string, typeof controls>);
    
    res.json({ total: controls.length, byCategory: grouped });
  } catch (error) {
    console.error('Error fetching retail controls:', error);
    res.status(500).json({ error: 'Failed to fetch retail controls' });
  }
});

/**
 * Get control recommendations based on interview responses
 */
app.post('/api/assessments/:id/retail-interview/get-control-recommendations', async (req, res) => {
  try {
    const { interviewResponses, priorityThreats } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const recommendations = getRecommendedControlsForGaps(interviewResponses, priorityThreats);
    
    res.json({
      total: recommendations.length,
      recommendations: recommendations.map(controlId => ({
        controlId,
        controlName: controlId.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase()),
      }))
    });
  } catch (error) {
    console.error('Error getting control recommendations:', error);
    res.status(500).json({ error: 'Failed to get control recommendations' });
  }
});

/**
 * Get complete retail interview questionnaire
 */
app.get('/api/assessments/:id/retail-interview/questions', async (req, res) => {
  try {
    const stats = getQuestionnaireStats();
    
    res.json({
      totalQuestions: stats.totalQuestions,
      topLevelQuestions: stats.topLevelQuestions,
      followUpQuestions: stats.followUpQuestions,
      sections: RETAIL_SECTION_METADATA,
      sectionCounts: stats.sectionCounts,
      questions: RETAIL_INTERVIEW_QUESTIONS
    });
  } catch (error) {
    console.error('Error fetching retail questions:', error);
    res.status(500).json({ error: 'Failed to fetch retail questions' });
  }
});

/**
 * Get questions for a specific section
 */
app.get('/api/assessments/:id/retail-interview/questions/:section', async (req, res) => {
  try {
    const { section } = req.params;
    
    const sectionMeta = RETAIL_SECTION_METADATA.find(
      s => s.id === section || s.name.toLowerCase().replace(/[^a-z]/g, '') === section.toLowerCase()
    );
    
    if (!sectionMeta) {
      return res.status(404).json({ error: 'Section not found', availableSections: RETAIL_SECTIONS });
    }
    
    const questions = getQuestionsBySection(sectionMeta.name);
    res.json({ section: sectionMeta, questionCount: questions.length, questions });
  } catch (error) {
    console.error('Error fetching retail questions by section:', error);
    res.status(500).json({ error: 'Failed to fetch retail questions' });
  }
});
`;

// ============================================================================
// SCHEMA UPDATES REQUIRED
// ============================================================================

const SCHEMA_UPDATES = `
-- Ensure risk_scenarios table has AI evidence columns
ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS ai_evidence JSONB;
ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20);
ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS assessment_mode VARCHAR(20);

-- Or in Drizzle schema (shared/schema.ts):
-- 
-- export const riskScenarios = pgTable('risk_scenarios', {
--   // ... existing columns
--   aiEvidence: jsonb('ai_evidence'),
--   aiConfidence: varchar('ai_confidence', { length: 20 }),
--   assessmentMode: varchar('assessment_mode', { length: 20 }),
-- });
`;

// ============================================================================
// FRONTEND INTEGRATION WORKFLOW
// ============================================================================

const FRONTEND_WORKFLOW = `
/**
 * React Hook for Retail Interview Workflow
 * 
 * Example implementation for the frontend interview experience.
 */

import { useState, useCallback } from 'react';

interface RetailInterviewState {
  responses: Record<string, any>;
  currentSection: number;
  securityScore: { score: number; grade: string; shrinkageLevel: string } | null;
  isGenerating: boolean;
  results: any | null;
}

export const useRetailInterview = (assessmentId: number) => {
  const [state, setState] = useState<RetailInterviewState>({
    responses: {},
    currentSection: 0,
    securityScore: null,
    isGenerating: false,
    results: null,
  });
  
  // Update response and recalculate shrinkage risk
  const updateResponse = async (questionId: string, value: any) => {
    const newResponses = { ...state.responses, [questionId]: value };
    setState(prev => ({ ...prev, responses: newResponses }));
    
    // Recalculate shrinkage risk after key questions
    const keyQuestions = [
      'shrinkage_1', 'eas_1', 'cctv_1', 'physical_5', 'lp_staff_1', 
      'employee_3', 'cash_2', 'external_1', 'shrinkage_4'
    ];
    
    if (keyQuestions.includes(questionId)) {
      const scoreResult = await fetch(
        \`/api/assessments/\${assessmentId}/retail-interview/calculate-shrinkage-risk\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewResponses: newResponses })
        }
      ).then(r => r.json());
      
      setState(prev => ({ ...prev, securityScore: scoreResult }));
    }
  };
  
  // Generate risk scenarios on completion
  const generateRisks = async (useAI = true) => {
    setState(prev => ({ ...prev, isGenerating: true }));
    try {
      const result = await fetch(
        \`/api/assessments/\${assessmentId}/retail-interview/generate-risks-ai\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            interviewResponses: state.responses,
            useAI,
            storeName: state.responses.overview_1 || 'Retail Store'
          })
        }
      ).then(r => r.json());
      
      setState(prev => ({ ...prev, results: result, isGenerating: false }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isGenerating: false }));
      throw error;
    }
  };
  
  // Generate executive narrative
  const generateNarrative = async (results: any[]) => {
    const response = await fetch(
      \`/api/assessments/\${assessmentId}/retail-interview/generate-narrative\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          results,
          interviewResponses: state.responses
        })
      }
    ).then(r => r.json());
    
    return response.narrative;
  };
  
  return {
    ...state,
    updateResponse,
    setCurrentSection: (section: number) => 
      setState(prev => ({ ...prev, currentSection: section })),
    generateRisks,
    generateNarrative,
  };
};

/**
 * UI Components to Build:
 * 
 * 1. SecurityScoreGauge - Circular gauge showing 0-100 score with A-F grade
 * 2. ShrinkageLevelIndicator - Color-coded badge (excellent→critical)
 * 3. RiskLevelBadge - Critical/High/Medium/Low with appropriate colors
 * 4. SectionProgress - Horizontal stepper showing 11 sections
 * 5. AIConfidenceIndicator - Shows ai/algorithmic/hybrid mode
 * 6. ThreatCard - Displays threat with T×V×I breakdown
 * 7. ControlRecommendationList - Prioritized control suggestions
 * 8. NarrativeSummary - AI-generated executive summary display
 * 
 * Key UI Flows:
 * 
 * 1. Interview Flow:
 *    - Display sections with progressive disclosure
 *    - Show real-time security score after key questions
 *    - Display shrinkage level indicator
 *    - Show section completion progress
 * 
 * 2. Results Flow:
 *    - Show generation progress (AI mode indicator)
 *    - Display risk scenario cards sorted by severity
 *    - Show T×V×I breakdown for each threat
 *    - Display prioritized control recommendations
 *    - Generate and display executive narrative
 * 
 * 3. Report Generation:
 *    - Combine narrative with risk scenarios
 *    - Include control recommendations
 *    - Show shrinkage benchmarks vs NRF data
 */
`;

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * DEPLOYMENT TESTING CHECKLIST
 * 
 * Before deploying, verify each item:
 * 
 * DATABASE SETUP:
 * □ Retail controls are seeded in database (run retail-controls-complete.sql)
 * □ risk_scenarios table has ai_evidence, ai_confidence, assessment_mode columns
 * □ threats table has all 15 retail threats seeded
 * □ security_controls table has retail_store facility type entries
 * 
 * ROUTE FUNCTIONALITY:
 * □ POST /retail-interview/generate-risks-ai returns 15 scenarios
 * □ POST /retail-interview/assess-single-threat works for each threat ID
 * □ POST /retail-interview/generate-narrative produces coherent summary
 * □ GET /retail-interview/threats returns all 15 retail threats
 * □ POST /retail-interview/quick-security-score returns score/grade
 * □ POST /retail-interview/calculate-shrinkage-risk returns full posture
 * □ POST /retail-interview/prioritized-threats returns sorted threat list
 * □ POST /retail-interview/risk-factor-analysis returns factor breakdown
 * □ GET /controls/retail-store returns controls grouped by category
 * □ POST /retail-interview/get-control-recommendations returns relevant controls
 * □ GET /retail-interview/questions returns all 70+ questions
 * □ GET /retail-interview/questions/:section returns section questions
 * 
 * CALCULATION ACCURACY:
 * □ All 15 threat T×V×I calculations produce valid scores (1-5 each)
 * □ Inherent risk normalization is correct (0-100 scale)
 * □ Risk classification thresholds work (critical≥75, high≥50, medium≥25)
 * □ Vulnerability divisor of 2 is correctly applied (retail-specific)
 * □ Impact minimums for life-safety threats (robbery, violence) are enforced
 * □ Security score calculation covers all question combinations
 * □ Control recommendations map correctly to identified gaps
 * □ Shrinkage level calculation matches NRF benchmarks
 * 
 * AI INTEGRATION:
 * □ GPT-4 assessment produces valid JSON responses
 * □ AI fallback works when OpenAI API fails or times out
 * □ Hybrid mode correctly reports AI vs algorithmic mix
 * □ AI confidence levels are accurately reported
 * □ Narrative generation produces professional LP-focused summary
 * □ Rate limiting delay (500ms) between AI calls works
 * 
 * ERROR HANDLING:
 * □ Invalid assessment ID returns 404
 * □ Wrong facility type returns 400 with clear message
 * □ Missing interviewResponses returns 400
 * □ Invalid threatId returns 400 with valid options list
 * □ AI timeout triggers algorithmic fallback gracefully
 * □ Database errors don't crash the server
 * 
 * EDGE CASES:
 * □ Empty interviewResponses object is handled
 * □ Partial interview responses produce reasonable scores
 * □ All conditional questions work correctly
 * □ Very high-risk scenarios (all bad answers) don't break calculations
 * □ Very low-risk scenarios (all good answers) produce low scores
 * □ ORC + Robbery history correctly elevates threat likelihood
 * 
 * PERFORMANCE:
 * □ Quick security score returns in <50ms
 * □ Shrinkage risk calculation returns in <100ms
 * □ Algorithmic-only generation completes in <1 second
 * □ Full AI assessment completes in <90 seconds (15 threats)
 * □ Database queries are optimized (check for N+1)
 */

// ============================================================================
// API TESTING EXAMPLES (cURL)
// ============================================================================

const API_TEST_EXAMPLES = `
# Test: Get retail threats
curl http://localhost:5000/api/assessments/1/retail-interview/threats

# Test: Quick security score
curl -X POST http://localhost:5000/api/assessments/1/retail-interview/quick-security-score \\
  -H "Content-Type: application/json" \\
  -d '{"interviewResponses": {"eas_1": "no", "cctv_1": "yes", "shrinkage_1": "2-3% (elevated)"}}'

# Test: Calculate shrinkage risk
curl -X POST http://localhost:5000/api/assessments/1/retail-interview/calculate-shrinkage-risk \\
  -H "Content-Type: application/json" \\
  -d '{"interviewResponses": {"shrinkage_1": "3-5% (concerning)", "eas_1": "no", "shrinkage_4": "yes"}}'

# Test: Generate risks (algorithmic only)
curl -X POST http://localhost:5000/api/assessments/1/retail-interview/generate-risks-ai \\
  -H "Content-Type: application/json" \\
  -d '{"interviewResponses": {"eas_1": "yes", "cctv_1": "yes", "shrinkage_1": "1-2% (acceptable)"}, "useAI": false}'

# Test: Assess single threat
curl -X POST http://localhost:5000/api/assessments/1/retail-interview/assess-single-threat \\
  -H "Content-Type: application/json" \\
  -d '{"threatId": "organized_retail_crime", "interviewResponses": {"shrinkage_4": "yes", "external_2": "yes"}, "useAI": false}'

# Test: Get prioritized threats
curl -X POST http://localhost:5000/api/assessments/1/retail-interview/prioritized-threats \\
  -H "Content-Type: application/json" \\
  -d '{"interviewResponses": {"shrinkage_1": "over 5% (critical)", "eas_1": "no", "cctv_1": "no"}}'

# Test: Get control recommendations
curl -X POST http://localhost:5000/api/assessments/1/retail-interview/get-control-recommendations \\
  -H "Content-Type: application/json" \\
  -d '{"interviewResponses": {"eas_1": "no", "cctv_1": "no", "physical_5": "no"}}'

# Test: Get questions
curl http://localhost:5000/api/assessments/1/retail-interview/questions

# Test: Get section questions
curl http://localhost:5000/api/assessments/1/retail-interview/questions/shrinkage
`;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Copy-paste block for routes.ts
  RETAIL_ROUTES_BLOCK,
  
  // Schema updates SQL
  SCHEMA_UPDATES,
  
  // Frontend workflow example
  FRONTEND_WORKFLOW,
  
  // Route endpoint reference
  routes: {
    generateRisksAI: '/api/assessments/:id/retail-interview/generate-risks-ai',
    assessSingleThreat: '/api/assessments/:id/retail-interview/assess-single-threat',
    generateNarrative: '/api/assessments/:id/retail-interview/generate-narrative',
    getThreats: '/api/assessments/:id/retail-interview/threats',
    quickSecurityScore: '/api/assessments/:id/retail-interview/quick-security-score',
    calculateShrinkageRisk: '/api/assessments/:id/retail-interview/calculate-shrinkage-risk',
    prioritizedThreats: '/api/assessments/:id/retail-interview/prioritized-threats',
    riskFactorAnalysis: '/api/assessments/:id/retail-interview/risk-factor-analysis',
    getControls: '/api/controls/retail-store',
    getControlRecommendations: '/api/assessments/:id/retail-interview/get-control-recommendations',
    getQuestions: '/api/assessments/:id/retail-interview/questions',
    getQuestionsBySection: '/api/assessments/:id/retail-interview/questions/:section',
    getThreatQuestions: '/api/assessments/:id/retail-interview/threat-questions/:threatId',
  },
  
  // Individual route definitions for reference
  individualRoutes: {
    retailGenerateRisksAIRoute,
    retailAssessSingleThreatRoute,
    retailGenerateNarrativeRoute,
    retailThreatsRoute,
    retailQuickSecurityScoreRoute,
    retailShrinkageRiskRoute,
    retailPrioritizedThreatsRoute,
    retailRiskFactorAnalysisRoute,
    retailControlsRoute,
    retailControlRecommendationsRoute,
    retailQuestionsRoute,
    retailQuestionsBySectionRoute,
    retailThreatQuestionsRoute,
  },
  
  // Testing examples
  API_TEST_EXAMPLES,
};

// ============================================================================
// INTEGRATION SUMMARY
// ============================================================================

/**
 * QUICK START:
 * 
 * 1. Add imports to server/routes.ts (see IMPORTS section above)
 * 2. Copy RETAIL_ROUTES_BLOCK into routes.ts
 * 3. Run SCHEMA_UPDATES SQL
 * 4. Seed retail controls with retail-controls-complete.sql
 * 5. Test endpoints with API_TEST_EXAMPLES
 * 
 * FILES REQUIRED:
 * - server/services/retail-ai-risk-assessment.ts
 * - server/services/retail-interview-mapper.ts
 * - server/data/retail-interview-questionnaire.ts
 * - retail-controls-complete.sql (database seed)
 * 
 * ENDPOINT COUNT: 13 routes
 * THREAT COUNT: 15 retail-specific threats
 * QUESTION COUNT: 70+ questions across 11 sections
 * 
 * KEY DIFFERENCES FROM OFFICE:
 * - Vulnerability divisor of 2 (vs 3 for office) - retail is more sensitive
 * - Shrinkage-focused metrics (unique to retail)
 * - ORC and loss prevention emphasis
 * - NRF/LPRC standards vs ASIS-only for office
 * - 15 threats (vs 12 for office)
 * - 11 sections (vs 13 for office)
 */
