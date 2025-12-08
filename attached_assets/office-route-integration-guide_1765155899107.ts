/**
 * Office Building Route Integration Guide
 * 
 * This file provides the route definitions and integration instructions
 * for wiring the office AI assessment into server/routes.ts
 * 
 * FACILITY TYPE: Office Building (Corporate, Multi-tenant, Professional)
 * ASSESSMENT FOCUS: Access control, life safety, workplace violence, information security
 * THREATS: 12 office-specific threats with T×V×I calculation
 * 
 * @author RiskFixer Team
 * @version 1.0
 */

// ============================================================================
// IMPORTS TO ADD TO server/routes.ts
// ============================================================================

/*
Add these imports at the top of server/routes.ts:

// Office AI Assessment (GPT-4 powered with algorithmic fallback)
import { 
  generateOfficeRiskScenariosWithAI,
  assessSingleOfficeThreat,
  generateOfficeNarrativeSummary,
  getQuickSecurityScore,
  OfficeAssessmentContext,
  OfficeAIAssessmentResponse,
  OFFICE_BUILDING_THREATS,
} from './services/office-ai-risk-assessment';

// Office Algorithmic Assessment (pure calculation, no AI)
import {
  initializeRiskScenariosFromInterview,
  calculateOverallSecurityScore,
  generateControlRecommendations,
  getPrioritizedThreats,
  getRiskFactorAnalysis,
  OFFICE_BUILDING_THREATS as OFFICE_THREATS_ALGO,
  THREAT_CONTROL_MAPPING,
} from './services/office-interview-mapper';

// Office Interview Questions
import {
  OFFICE_INTERVIEW_QUESTIONS,
  getQuestionsBySection,
  getQuestionById,
  validateQuestionnaire,
  getQuestionnaireStats,
} from './data/office-interview-questionnaire';
*/

// ============================================================================
// ROUTE DEFINITIONS - DOCUMENTED
// ============================================================================

/**
 * Route: POST /api/assessments/:id/office-interview/generate-risks-ai
 * 
 * Generates risk scenarios from office interview responses using T×V×I formula
 * with GPT-4 AI assessment and algorithmic fallback.
 * 
 * This is the PRIMARY entry point for generating risk scenarios after
 * completing the interview questionnaire.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,  // All 98 question responses
 *   useAI?: boolean,                          // Default true
 *   photoFindings?: string[],                 // GPT-4V photo analysis results
 *   incidentHistory?: Array<{
 *     date: string;
 *     type: 'unauthorized_access' | 'workplace_violence' | 'theft' | 'data_breach' | 
 *           'executive_threat' | 'bomb_threat' | 'intrusion' | 'civil_disturbance' | 'other';
 *     description: string;
 *     severity: 'low' | 'medium' | 'high' | 'critical';
 *     policeReport?: boolean;
 *     injuriesReported?: boolean;
 *   }>,
 *   facilityName?: string                     // For narrative generation
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   mode: 'ai' | 'algorithmic' | 'hybrid',    // Which method was used
 *   generatedScenarios: number,               // Should be 12 for all office threats
 *   criticalRisks: number,                    // T×V×I normalized ≥75
 *   highRisks: number,                        // T×V×I normalized ≥50
 *   mediumRisks: number,                      // T×V×I normalized ≥25
 *   lowRisks: number,                         // T×V×I normalized <25
 *   riskScenarioIds: number[],                // Database IDs for created scenarios
 *   overallSecurityPosture: string,           // 'Strong' | 'Adequate' | 'Moderate' | 'Weak' | 'Critical'
 *   aiConfidence: 'high' | 'medium' | 'low' | 'fallback',
 *   processingTimeMs: number
 * }
 */

const officeGenerateRisksAIRoute = `
app.post('/api/assessments/:id/office-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewResponses, useAI = true, photoFindings, incidentHistory, facilityName } = req.body;
    
    // Validate assessment exists and is office type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'office_building' && assessment.facilityType !== 'office_building') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Office Building assessments only.' 
      });
    }
    
    // Generate risk scenarios using AI with algorithmic fallback
    const result = await generateOfficeRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, facilityName }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating office risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/office-interview/assess-single-threat
 * 
 * Assess a single office threat using AI (for testing or incremental assessment).
 * Useful for real-time feedback during interview or debugging.
 * 
 * Request Body:
 * {
 *   threatId: string,              // e.g., 'unauthorized_access', 'workplace_violence'
 *   interviewResponses: Record<string, any>,
 *   useAI?: boolean                // Default true
 * }
 * 
 * Response: OfficeAIAssessmentResponse (full T×V×I breakdown with evidence)
 */

const officeAssessSingleThreatRoute = `
app.post('/api/assessments/:id/office-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    // Validate threatId exists
    const validThreatIds = [
      'unauthorized_access', 'workplace_violence', 'theft_burglary', 
      'executive_targeting', 'data_breach_physical', 'terrorism_bomb_threat',
      'civil_disturbance', 'insider_threat', 'after_hours_intrusion',
      'vehicle_ramming', 'active_shooter', 'corporate_espionage'
    ];
    
    if (!validThreatIds.includes(threatId)) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validOptions: validThreatIds
      });
    }
    
    const result = await assessSingleOfficeThreat(threatId, interviewResponses, { useAI });
    
    res.json(result);
  } catch (error) {
    console.error('Error assessing single office threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/office-interview/generate-narrative
 * 
 * Generate AI executive summary narrative for office assessment.
 * Best called AFTER generate-risks-ai to summarize the results.
 * 
 * Request Body:
 * {
 *   results: OfficeAIAssessmentResponse[],    // Array from generate-risks-ai
 *   interviewResponses: Record<string, any>,
 *   facilityName?: string
 * }
 * 
 * Response:
 * {
 *   narrative: string   // 400-600 word professional summary
 * }
 */

const officeGenerateNarrativeRoute = `
app.post('/api/assessments/:id/office-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, facilityName } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context = {
      assessmentId: parseInt(id),
      facilityName: facilityName || 'Office Building',
      interviewResponses: interviewResponses || {},
    };
    
    const narrative = await generateOfficeNarrativeSummary(results, context);
    
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating office narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/office-interview/threats
 * 
 * Returns the list of office-specific threats for the interview workflow.
 * Use this to populate threat selection UI or display threat information.
 */

const officeThreatsRoute = `
app.get('/api/assessments/:id/office-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: OFFICE_BUILDING_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode
      })),
      totalThreats: OFFICE_BUILDING_THREATS.length
    });
  } catch (error) {
    console.error('Error fetching office threats:', error);
    res.status(500).json({ error: 'Failed to fetch office threats' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/office-interview/quick-security-score
 * 
 * Calculate quick security score without full AI assessment.
 * Ideal for real-time feedback during interview completion.
 * Much faster than full AI assessment (~10ms vs ~30 seconds).
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   score: number,           // 0-100
 *   grade: string,           // A/B/C/D/F
 *   posture: string,         // 'Strong' | 'Adequate' | 'Moderate' | 'Weak' | 'Critical'
 *   topGaps: string[]        // Top 5 control gaps identified
 * }
 */

const officeQuickSecurityScoreRoute = `
app.post('/api/assessments/:id/office-interview/quick-security-score', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const result = getQuickSecurityScore(interviewResponses);
    
    res.json(result);
  } catch (error) {
    console.error('Error calculating quick security score:', error);
    res.status(500).json({ error: 'Failed to calculate security score' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/office-interview/calculate-security-posture
 * 
 * Calculate comprehensive security posture with category breakdowns.
 * More detailed than quick-security-score but still algorithmic (no AI).
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   score: number,           // 0-100
 *   grade: string,           // A-F
 *   findings: string[],      // Key findings
 *   strengths: string[],     // Identified strengths
 *   categoryScores: {
 *     accessControl: { score: number, weight: number },
 *     surveillance: { score: number, weight: number },
 *     intrusionDetection: { score: number, weight: number },
 *     emergencyPreparedness: { score: number, weight: number },
 *     securityPersonnel: { score: number, weight: number },
 *     informationSecurity: { score: number, weight: number }
 *   }
 * }
 */

const officeSecurityPostureRoute = `
app.post('/api/assessments/:id/office-interview/calculate-security-posture', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const result = calculateOverallSecurityScore(interviewResponses);
    
    res.json(result);
  } catch (error) {
    console.error('Error calculating security posture:', error);
    res.status(500).json({ error: 'Failed to calculate security posture' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/office-interview/prioritized-threats
 * 
 * Get threats prioritized by calculated risk score.
 * Useful for showing which threats need immediate attention.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   threats: Array<{
 *     threatId: string,
 *     name: string,
 *     riskLevel: 'critical' | 'high' | 'medium' | 'low',
 *     inherentRisk: number,
 *     threatLikelihood: number,
 *     vulnerability: number,
 *     impact: number
 *   }>
 * }
 */

const officePrioritizedThreatsRoute = `
app.post('/api/assessments/:id/office-interview/prioritized-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const threats = getPrioritizedThreats(interviewResponses);
    
    res.json({ threats });
  } catch (error) {
    console.error('Error getting prioritized threats:', error);
    res.status(500).json({ error: 'Failed to get prioritized threats' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/office-interview/risk-factor-analysis
 * 
 * Get detailed breakdown of which factors contributed to vulnerability scores.
 * Useful for transparency and audit documentation.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   totalFactors: number,
 *   byCategory: Record<string, number>,
 *   details: string[]
 * }
 */

const officeRiskFactorAnalysisRoute = `
app.post('/api/assessments/:id/office-interview/risk-factor-analysis', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const analysis = getRiskFactorAnalysis(interviewResponses);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error getting risk factor analysis:', error);
    res.status(500).json({ error: 'Failed to get risk factor analysis' });
  }
});
`;

/**
 * Route: GET /api/controls/office-building
 * 
 * Returns all office-building specific security controls from the database.
 * Grouped by category for UI display.
 */

const officeControlsRoute = `
app.get('/api/controls/office-building', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'office_building')
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
      categories: Object.keys(grouped)
    });
  } catch (error) {
    console.error('Error fetching office controls:', error);
    res.status(500).json({ error: 'Failed to fetch office controls' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/office-interview/get-control-recommendations
 * 
 * Get control recommendations based on interview responses and identified gaps.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   threatId?: string                        // Optional: focus on specific threat
 * }
 * 
 * Response:
 * {
 *   total: number,
 *   recommendations: Array<{
 *     controlId: string,
 *     controlName: string,
 *     category?: string,
 *     priority?: 'high' | 'medium' | 'low'
 *   }>
 * }
 */

const officeControlRecommendationsRoute = `
app.post('/api/assessments/:id/office-interview/get-control-recommendations', async (req, res) => {
  try {
    const { interviewResponses, threatId } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const recommendations = generateControlRecommendations(interviewResponses, threatId);
    
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
`;

/**
 * Route: GET /api/assessments/:id/office-interview/questions
 * 
 * Returns the office interview questionnaire for rendering in frontend.
 * Includes all 98 questions with metadata for dynamic form generation.
 */

const officeQuestionsRoute = `
app.get('/api/assessments/:id/office-interview/questions', async (req, res) => {
  try {
    const stats = getQuestionnaireStats();
    const bySection = getQuestionsBySection();
    
    res.json({
      questions: OFFICE_INTERVIEW_QUESTIONS,
      sections: Object.keys(bySection),
      bySection,
      stats: {
        totalQuestions: stats.totalQuestions,
        totalRiskWeight: stats.totalRiskWeight,
        sectionCount: stats.sectionCount,
        questionTypes: stats.questionTypes
      }
    });
  } catch (error) {
    console.error('Error fetching office questions:', error);
    res.status(500).json({ error: 'Failed to fetch office questions' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/office-interview/questions/:section
 * 
 * Returns questions for a specific section only.
 * Useful for paginated/section-by-section interview UI.
 */

const officeQuestionsBySectionRoute = `
app.get('/api/assessments/:id/office-interview/questions/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const bySection = getQuestionsBySection();
    
    // Convert section param to match section names
    const sectionName = section.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const questions = bySection[sectionName];
    
    if (!questions) {
      return res.status(404).json({ 
        error: 'Section not found',
        availableSections: Object.keys(bySection)
      });
    }
    
    res.json({
      section: sectionName,
      questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error fetching section questions:', error);
    res.status(500).json({ error: 'Failed to fetch section questions' });
  }
});
`;

// ============================================================================
// COPY-PASTE ROUTES BLOCK
// ============================================================================

/**
 * COPY THIS ENTIRE BLOCK INTO server/routes.ts
 * 
 * Add after your existing assessment routes.
 * Make sure imports are added at the top of the file.
 */

const OFFICE_ROUTES_BLOCK = `
// ============================================================================
// OFFICE BUILDING INTERVIEW ROUTES
// ============================================================================

/**
 * Generate AI-powered risk scenarios from office interview responses
 * Uses T×V×I formula with GPT-4 assessment and algorithmic fallback
 */
app.post('/api/assessments/:id/office-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewResponses, useAI = true, photoFindings, incidentHistory, facilityName } = req.body;
    
    // Validate assessment exists and is office type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'office_building' && assessment.facilityType !== 'office_building') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Office Building assessments only.' 
      });
    }
    
    const result = await generateOfficeRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, facilityName }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating office risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Assess a single office threat (for testing or incremental assessment)
 */
app.post('/api/assessments/:id/office-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    const validThreatIds = [
      'unauthorized_access', 'workplace_violence', 'theft_burglary', 
      'executive_targeting', 'data_breach_physical', 'terrorism_bomb_threat',
      'civil_disturbance', 'insider_threat', 'after_hours_intrusion',
      'vehicle_ramming', 'active_shooter', 'corporate_espionage'
    ];
    
    if (!validThreatIds.includes(threatId)) {
      return res.status(400).json({ error: 'Invalid threatId', validOptions: validThreatIds });
    }
    
    const result = await assessSingleOfficeThreat(threatId, interviewResponses, { useAI });
    res.json(result);
  } catch (error) {
    console.error('Error assessing single office threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate AI narrative summary for office assessment
 */
app.post('/api/assessments/:id/office-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, facilityName } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context = {
      assessmentId: parseInt(id),
      facilityName: facilityName || 'Office Building',
      interviewResponses: interviewResponses || {},
    };
    
    const narrative = await generateOfficeNarrativeSummary(results, context);
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating office narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});

/**
 * Get office threat definitions for interview workflow
 */
app.get('/api/assessments/:id/office-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: OFFICE_BUILDING_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode
      })),
      totalThreats: OFFICE_BUILDING_THREATS.length
    });
  } catch (error) {
    console.error('Error fetching office threats:', error);
    res.status(500).json({ error: 'Failed to fetch office threats' });
  }
});

/**
 * Quick security score calculation (no AI, instant feedback)
 */
app.post('/api/assessments/:id/office-interview/quick-security-score', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const result = getQuickSecurityScore(interviewResponses);
    res.json(result);
  } catch (error) {
    console.error('Error calculating quick security score:', error);
    res.status(500).json({ error: 'Failed to calculate security score' });
  }
});

/**
 * Comprehensive security posture with category breakdowns
 */
app.post('/api/assessments/:id/office-interview/calculate-security-posture', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const result = calculateOverallSecurityScore(interviewResponses);
    res.json(result);
  } catch (error) {
    console.error('Error calculating security posture:', error);
    res.status(500).json({ error: 'Failed to calculate security posture' });
  }
});

/**
 * Get threats prioritized by risk score
 */
app.post('/api/assessments/:id/office-interview/prioritized-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const threats = getPrioritizedThreats(interviewResponses);
    res.json({ threats });
  } catch (error) {
    console.error('Error getting prioritized threats:', error);
    res.status(500).json({ error: 'Failed to get prioritized threats' });
  }
});

/**
 * Risk factor analysis for audit transparency
 */
app.post('/api/assessments/:id/office-interview/risk-factor-analysis', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const analysis = getRiskFactorAnalysis(interviewResponses);
    res.json(analysis);
  } catch (error) {
    console.error('Error getting risk factor analysis:', error);
    res.status(500).json({ error: 'Failed to get risk factor analysis' });
  }
});

/**
 * Get office-specific security controls
 */
app.get('/api/controls/office-building', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'office_building')
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
      categories: Object.keys(grouped)
    });
  } catch (error) {
    console.error('Error fetching office controls:', error);
    res.status(500).json({ error: 'Failed to fetch office controls' });
  }
});

/**
 * Get control recommendations based on interview responses
 */
app.post('/api/assessments/:id/office-interview/get-control-recommendations', async (req, res) => {
  try {
    const { interviewResponses, threatId } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const recommendations = generateControlRecommendations(interviewResponses, threatId);
    
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
 * Get office interview questionnaire
 */
app.get('/api/assessments/:id/office-interview/questions', async (req, res) => {
  try {
    const stats = getQuestionnaireStats();
    const bySection = getQuestionsBySection();
    
    res.json({
      questions: OFFICE_INTERVIEW_QUESTIONS,
      sections: Object.keys(bySection),
      bySection,
      stats: {
        totalQuestions: stats.totalQuestions,
        totalRiskWeight: stats.totalRiskWeight,
        sectionCount: stats.sectionCount,
        questionTypes: stats.questionTypes
      }
    });
  } catch (error) {
    console.error('Error fetching office questions:', error);
    res.status(500).json({ error: 'Failed to fetch office questions' });
  }
});

/**
 * Get questions for a specific section
 */
app.get('/api/assessments/:id/office-interview/questions/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const bySection = getQuestionsBySection();
    
    const sectionName = section.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const questions = bySection[sectionName];
    
    if (!questions) {
      return res.status(404).json({ 
        error: 'Section not found',
        availableSections: Object.keys(bySection)
      });
    }
    
    res.json({
      section: sectionName,
      questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error fetching section questions:', error);
    res.status(500).json({ error: 'Failed to fetch section questions' });
  }
});
`;

// ============================================================================
// SCHEMA UPDATES REQUIRED
// ============================================================================

/**
 * Ensure risk_scenarios table has AI evidence columns.
 * 
 * Run these SQL commands if columns don't exist:
 * 
 * ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS ai_evidence JSONB;
 * ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20);
 * ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS assessment_mode VARCHAR(20);
 * 
 * Or update your Drizzle schema (shared/schema.ts):
 * 
 * export const riskScenarios = pgTable('risk_scenarios', {
 *   // ... existing columns
 *   aiEvidence: jsonb('ai_evidence'),
 *   aiConfidence: varchar('ai_confidence', { length: 20 }),
 *   assessmentMode: varchar('assessment_mode', { length: 20 }),
 * });
 */

const SCHEMA_UPDATES = `
-- SQL to add AI evidence columns to risk_scenarios table
ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS ai_evidence JSONB;
ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20);
ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS assessment_mode VARCHAR(20);

-- Index for filtering by confidence level
CREATE INDEX IF NOT EXISTS idx_risk_scenarios_ai_confidence ON risk_scenarios(ai_confidence);

-- Index for filtering by assessment mode
CREATE INDEX IF NOT EXISTS idx_risk_scenarios_assessment_mode ON risk_scenarios(assessment_mode);
`;

// ============================================================================
// FRONTEND INTEGRATION NOTES
// ============================================================================

/**
 * OFFICE INTERVIEW WORKFLOW
 * 
 * The office interview workflow in the frontend should:
 * 
 * 1. INITIALIZATION
 *    - Load questions from /office-interview/questions
 *    - Display sections with progressive disclosure (13 sections)
 *    - Initialize empty interviewResponses object
 * 
 * 2. DURING INTERVIEW
 *    - Store responses in interviewResponses[questionId] = value
 *    - After completing each section, optionally call /quick-security-score
 *      to show real-time security posture feedback
 *    - Handle conditional questions (follow-ups) based on parent answers
 * 
 * 3. ON COMPLETION
 *    a) Call /office-interview/generate-risks-ai with:
 *       - interviewResponses (all 98 answers)
 *       - useAI: true (or false to skip AI and use algorithmic only)
 *       - photoFindings (if GPT-4V photo analysis was done)
 *       - facilityName (for narrative generation)
 *    
 *    b) Display results:
 *       - Risk distribution chart (critical/high/medium/low)
 *       - Overall security posture indicator
 *       - Processing mode (AI/algorithmic/hybrid)
 *       - AI confidence level
 * 
 * 4. POST-COMPLETION
 *    a) Call /generate-narrative to get executive summary
 *    b) Call /get-control-recommendations for action items
 *    c) Generate PDF report with all findings
 * 
 * KEY UI ELEMENTS:
 * 
 * - Security Score Gauge: 0-100 with A-F grade and posture label
 * - Risk Distribution: Pie/bar chart showing critical/high/medium/low counts
 * - Threat Table: Sortable by risk score, showing T×V×I breakdown
 * - Control Recommendations: Prioritized list with urgency indicators
 * - Section Progress: Visual tracker for 13 interview sections
 * - AI Confidence Badge: Shows 'AI' | 'Algorithmic' | 'Hybrid' mode
 * 
 * REAL-TIME FEEDBACK TRIGGERS:
 * 
 * Call /quick-security-score after these key questions to update gauge:
 * - entry_2 (Main entrance access control)
 * - surveillance_1 (CCTV system)
 * - intrusion_1 (Intrusion detection)
 * - emergency_1 (Emergency plan)
 * - personnel_1 (Security personnel)
 * 
 * CONDITIONAL QUESTION HANDLING:
 * 
 * Questions with followUpQuestions should:
 * 1. Check condition.questionId and condition.answerContains
 * 2. Show follow-up only if parent answer matches condition
 * 3. Clear follow-up answers if parent answer changes
 * 
 * Example:
 * if (responses['perimeter_4'] === 'yes') {
 *   showQuestion('perimeter_4a'); // Camera coverage follow-up
 * }
 */

const FRONTEND_WORKFLOW = `
// Example React hook for office interview workflow

const useOfficeInterview = (assessmentId: number) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [securityScore, setSecurityScore] = useState<QuickSecurityScore | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<OfficeGeneratedScenarioResult | null>(null);
  
  // Update response and trigger real-time score update
  const updateResponse = async (questionId: string, value: any) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    
    // Real-time score update for key questions
    const keyQuestions = ['entry_2', 'surveillance_1', 'intrusion_1', 'emergency_1', 'personnel_1'];
    if (keyQuestions.includes(questionId)) {
      const scoreResult = await fetch(
        \`/api/assessments/\${assessmentId}/office-interview/quick-security-score\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewResponses: newResponses })
        }
      ).then(r => r.json());
      setSecurityScore(scoreResult);
    }
  };
  
  // Generate risk scenarios on completion
  const generateRisks = async (useAI = true) => {
    setIsGenerating(true);
    try {
      const result = await fetch(
        \`/api/assessments/\${assessmentId}/office-interview/generate-risks-ai\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            interviewResponses: responses,
            useAI,
            facilityName: responses.overview_1 || 'Office Building'
          })
        }
      ).then(r => r.json());
      setResults(result);
      return result;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    responses,
    updateResponse,
    currentSection,
    setCurrentSection,
    securityScore,
    isGenerating,
    results,
    generateRisks,
  };
};
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
 * □ Office controls are seeded in database (run office-controls-complete.sql)
 * □ risk_scenarios table has ai_evidence, ai_confidence, assessment_mode columns
 * □ threats table has all 12 office threats seeded
 * □ security_controls table has office_building facility type entries
 * 
 * ROUTE FUNCTIONALITY:
 * □ POST /office-interview/generate-risks-ai returns 12 scenarios
 * □ POST /office-interview/assess-single-threat works for each threat ID
 * □ POST /office-interview/generate-narrative produces coherent summary
 * □ GET /office-interview/threats returns all 12 office threats
 * □ POST /office-interview/quick-security-score returns score/grade/posture
 * □ POST /office-interview/calculate-security-posture returns category breakdowns
 * □ POST /office-interview/prioritized-threats returns sorted threat list
 * □ POST /office-interview/risk-factor-analysis returns factor breakdown
 * □ GET /controls/office-building returns controls grouped by category
 * □ POST /office-interview/get-control-recommendations returns relevant controls
 * □ GET /office-interview/questions returns all 98 questions
 * 
 * CALCULATION ACCURACY:
 * □ All 12 threat T×V×I calculations produce valid scores (1-5 each)
 * □ Inherent risk normalization is correct (0-100 scale)
 * □ Risk classification thresholds work (critical≥75, high≥50, medium≥25)
 * □ Vulnerability divisor of 3 is correctly applied
 * □ Impact minimums for life-safety threats are enforced
 * □ Security score calculation covers all question combinations
 * □ Control recommendations map correctly to identified gaps
 * 
 * AI INTEGRATION:
 * □ GPT-4 assessment produces valid JSON responses
 * □ AI fallback works when OpenAI API fails or times out
 * □ Hybrid mode correctly reports AI vs algorithmic mix
 * □ AI confidence levels are accurately reported
 * □ Narrative generation produces professional summary
 * □ Rate limiting delay (500ms) between AI calls works
 * 
 * ERROR HANDLING:
 * □ Invalid assessment ID returns 404
 * □ Wrong facility type returns 400 with clear message
 * □ Missing interviewResponses returns 400
 * □ Invalid threatId returns 400 with valid options
 * □ AI timeout triggers algorithmic fallback gracefully
 * □ Database errors don't crash the server
 * 
 * EDGE CASES:
 * □ Empty interviewResponses object is handled
 * □ Partial interview responses produce reasonable scores
 * □ All conditional questions work correctly
 * □ Very high-risk scenarios (all bad answers) don't break calculations
 * □ Very low-risk scenarios (all good answers) produce low scores
 * 
 * PERFORMANCE:
 * □ Quick security score returns in <50ms
 * □ Algorithmic-only generation completes in <1 second
 * □ Full AI assessment completes in <60 seconds
 * □ Database queries are optimized (check for N+1)
 */

// ============================================================================
// API TESTING EXAMPLES (cURL)
// ============================================================================

const API_TEST_EXAMPLES = `
# Test: Get office threats
curl http://localhost:5000/api/assessments/1/office-interview/threats

# Test: Quick security score
curl -X POST http://localhost:5000/api/assessments/1/office-interview/quick-security-score \\
  -H "Content-Type: application/json" \\
  -d '{"interviewResponses": {"entry_2": "Open access during business hours", "surveillance_1": "No cameras"}}'

# Test: Generate risks (algorithmic only)
curl -X POST http://localhost:5000/api/assessments/1/office-interview/generate-risks-ai \\
  -H "Content-Type: application/json" \\
  -d '{"interviewResponses": {"entry_2": "Badge only", "surveillance_1": "10-25 cameras"}, "useAI": false}'

# Test: Assess single threat
curl -X POST http://localhost:5000/api/assessments/1/office-interview/assess-single-threat \\
  -H "Content-Type: application/json" \\
  -d '{"threatId": "unauthorized_access", "interviewResponses": {"entry_2": "Open access"}, "useAI": false}'

# Test: Get control recommendations
curl -X POST http://localhost:5000/api/assessments/1/office-interview/get-control-recommendations \\
  -H "Content-Type: application/json" \\
  -d '{"interviewResponses": {"entry_4": "no", "intrusion_1": "no"}}'

# Test: Get questions
curl http://localhost:5000/api/assessments/1/office-interview/questions
`;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Copy-paste block for routes.ts
  OFFICE_ROUTES_BLOCK,
  
  // Schema updates SQL
  SCHEMA_UPDATES,
  
  // Route endpoint reference
  routes: {
    generateRisksAI: '/api/assessments/:id/office-interview/generate-risks-ai',
    assessSingleThreat: '/api/assessments/:id/office-interview/assess-single-threat',
    generateNarrative: '/api/assessments/:id/office-interview/generate-narrative',
    getThreats: '/api/assessments/:id/office-interview/threats',
    quickSecurityScore: '/api/assessments/:id/office-interview/quick-security-score',
    calculateSecurityPosture: '/api/assessments/:id/office-interview/calculate-security-posture',
    prioritizedThreats: '/api/assessments/:id/office-interview/prioritized-threats',
    riskFactorAnalysis: '/api/assessments/:id/office-interview/risk-factor-analysis',
    getControls: '/api/controls/office-building',
    getControlRecommendations: '/api/assessments/:id/office-interview/get-control-recommendations',
    getQuestions: '/api/assessments/:id/office-interview/questions',
    getQuestionsBySection: '/api/assessments/:id/office-interview/questions/:section',
  },
  
  // Individual route definitions for reference
  individualRoutes: {
    officeGenerateRisksAIRoute,
    officeAssessSingleThreatRoute,
    officeGenerateNarrativeRoute,
    officeThreatsRoute,
    officeQuickSecurityScoreRoute,
    officeSecurityPostureRoute,
    officePrioritizedThreatsRoute,
    officeRiskFactorAnalysisRoute,
    officeControlsRoute,
    officeControlRecommendationsRoute,
    officeQuestionsRoute,
    officeQuestionsBySectionRoute,
  },
  
  // Testing examples
  API_TEST_EXAMPLES,
  FRONTEND_WORKFLOW,
};

// ============================================================================
// INTEGRATION SUMMARY
// ============================================================================

/**
 * QUICK START:
 * 
 * 1. Add imports to server/routes.ts (see IMPORTS section above)
 * 2. Copy OFFICE_ROUTES_BLOCK into routes.ts
 * 3. Run SCHEMA_UPDATES SQL
 * 4. Seed office controls with office-controls-complete.sql
 * 5. Test endpoints with API_TEST_EXAMPLES
 * 
 * FILES REQUIRED:
 * - server/services/office-ai-risk-assessment.ts
 * - server/services/office-interview-mapper.ts
 * - server/data/office-interview-questionnaire.ts
 * - office-controls-complete.sql (database seed)
 * 
 * ENDPOINT COUNT: 12 routes
 * THREAT COUNT: 12 office-specific threats
 * QUESTION COUNT: 98 questions across 13 sections
 */
