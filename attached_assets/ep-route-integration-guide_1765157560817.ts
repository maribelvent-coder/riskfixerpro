/**
 * Executive Protection Route Integration Guide
 * 
 * This file provides the route definitions and integration instructions
 * for wiring the EP interview mapper into server/routes.ts
 * 
 * @author RiskFixer Team
 * @version 1.0
 */

// ============================================================================
// IMPORTS TO ADD TO server/routes.ts
// ============================================================================

/*
Add these imports at the top of server/routes.ts:

import { 
  generateEPRiskScenarios,
  EP_THREATS,
  EPGeneratedScenarioResult
} from './ep-interview-mapper';
*/

// ============================================================================
// ROUTE DEFINITIONS TO ADD
// ============================================================================

/**
 * Route: POST /api/assessments/:id/ep-interview/generate-risks
 * 
 * Generates risk scenarios from EP interview responses using T×V×I×E formula.
 * This is the main endpoint called when the user completes the EP interview.
 * 
 * Request Body:
 * {
 *   interviewResponses: {
 *     ep_public_profile: 'recognized_by_industry' | 'frequently_featured_media' | 'nationally_known' | 'internationally_known',
 *     ep_net_worth_range: string,
 *     ep_industry_sector: string,
 *     ep_threat_perception: number,
 *     ep_known_threats: 'none_known' | 'historical' | 'recent' | 'current_active',
 *     // ... all other EP interview fields
 *   }
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   generatedScenarios: number,
 *   criticalRisks: number,
 *   highRisks: number,
 *   mediumRisks: number,
 *   lowRisks: number,
 *   riskScenarioIds: number[],
 *   overallExposure: number
 * }
 */

// Example route implementation:
const epInterviewGenerateRisksRoute = `
app.post('/api/assessments/:id/ep-interview/generate-risks', async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewResponses } = req.body;
    
    // Validate assessment exists and is EP type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.facilityType !== 'executive_protection') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Executive Protection assessments only.' 
      });
    }
    
    // Generate risk scenarios using T×V×I×E formula
    const result = await generateEPRiskScenarios(parseInt(id), interviewResponses);
    
    res.json(result);
  } catch (error) {
    console.error('Error generating EP risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/ep-interview/threats
 * 
 * Returns the list of EP-specific threats for the interview workflow.
 * Used by the frontend to display threat categories during assessment.
 */
const epThreatsRoute = `
app.get('/api/assessments/:id/ep-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: EP_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        baselineThreat: t.baselineThreat,
        baselineImpact: t.baselineImpact,
        description: t.description
      }))
    });
  } catch (error) {
    console.error('Error fetching EP threats:', error);
    res.status(500).json({ error: 'Failed to fetch EP threats' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/ep-interview/calculate-exposure
 * 
 * Calculates the exposure factor in real-time as the user completes the interview.
 * Used to show the user their current exposure level during the assessment.
 */
const epExposureCalculationRoute = `
app.post('/api/assessments/:id/ep-interview/calculate-exposure', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    // Import the exposure calculation function
    const { calculateExposureFactor } = await import('./ep-interview-mapper');
    
    const exposureFactor = calculateExposureFactor(interviewResponses);
    
    // Classify exposure level
    let exposureLevel = 'low';
    if (exposureFactor >= 4.0) exposureLevel = 'critical';
    else if (exposureFactor >= 3.0) exposureLevel = 'high';
    else if (exposureFactor >= 2.0) exposureLevel = 'medium';
    
    res.json({
      exposureFactor,
      exposureLevel,
      components: {
        publicProfile: interviewResponses.ep_public_profile,
        socialMedia: interviewResponses.ep_social_media_activity,
        patternPredictability: interviewResponses.ep_daily_routine_predictability,
        mediaPresence: interviewResponses.ep_media_coverage
      }
    });
  } catch (error) {
    console.error('Error calculating exposure:', error);
    res.status(500).json({ error: 'Failed to calculate exposure' });
  }
});
`;

/**
 * Route: GET /api/controls/executive-protection
 * 
 * Returns all EP-specific security controls for recommendation engine.
 */
const epControlsRoute = `
app.get('/api/controls/executive-protection', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'executive_protection')
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
      byCategory: grouped
    });
  } catch (error) {
    console.error('Error fetching EP controls:', error);
    res.status(500).json({ error: 'Failed to fetch EP controls' });
  }
});
`;

// ============================================================================
// FULL ROUTE BLOCK TO COPY
// ============================================================================

export const EP_ROUTES_BLOCK = `
// ============================================================================
// EXECUTIVE PROTECTION INTERVIEW ROUTES
// ============================================================================

/**
 * Generate EP risk scenarios from interview responses
 * Uses T×V×I×E formula (Threat × Vulnerability × Impact × Exposure)
 */
app.post('/api/assessments/:id/ep-interview/generate-risks', async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewResponses } = req.body;
    
    // Validate assessment exists and is EP type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.facilityType !== 'executive_protection') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Executive Protection assessments only.' 
      });
    }
    
    // Generate risk scenarios using T×V×I×E formula
    const result = await generateEPRiskScenarios(parseInt(id), interviewResponses);
    
    res.json(result);
  } catch (error) {
    console.error('Error generating EP risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get EP threat definitions for interview workflow
 */
app.get('/api/assessments/:id/ep-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: EP_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        baselineThreat: t.baselineThreat,
        baselineImpact: t.baselineImpact,
        description: t.description
      }))
    });
  } catch (error) {
    console.error('Error fetching EP threats:', error);
    res.status(500).json({ error: 'Failed to fetch EP threats' });
  }
});

/**
 * Calculate real-time exposure factor during interview
 */
app.post('/api/assessments/:id/ep-interview/calculate-exposure', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    const exposureFactor = calculateExposureFactor(interviewResponses);
    
    let exposureLevel = 'low';
    if (exposureFactor >= 4.0) exposureLevel = 'critical';
    else if (exposureFactor >= 3.0) exposureLevel = 'high';
    else if (exposureFactor >= 2.0) exposureLevel = 'medium';
    
    res.json({
      exposureFactor,
      exposureLevel
    });
  } catch (error) {
    console.error('Error calculating exposure:', error);
    res.status(500).json({ error: 'Failed to calculate exposure' });
  }
});

/**
 * Get EP-specific security controls
 */
app.get('/api/controls/executive-protection', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'executive_protection')
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
    console.error('Error fetching EP controls:', error);
    res.status(500).json({ error: 'Failed to fetch EP controls' });
  }
});
`;

// ============================================================================
// SCHEMA UPDATES REQUIRED
// ============================================================================

/**
 * If not already present, add 'exposure' column to risk_scenarios table:
 * 
 * ALTER TABLE risk_scenarios ADD COLUMN IF NOT EXISTS exposure INTEGER DEFAULT 1;
 * 
 * Or in Drizzle schema (shared/schema.ts):
 * 
 * export const riskScenarios = pgTable('risk_scenarios', {
 *   // ... existing columns
 *   exposure: integer('exposure').default(1),
 * });
 */

// ============================================================================
// FRONTEND INTEGRATION NOTES
// ============================================================================

/**
 * The EP interview workflow in the frontend should:
 * 
 * 1. Load questions from EP_QUESTIONS (imported from ep-interview-questionnaire.ts)
 * 2. Display sections in order using EP_SECTION_METADATA
 * 3. Handle conditional questions based on previous responses
 * 4. Call /api/assessments/:id/ep-interview/calculate-exposure after key questions
 *    to show real-time exposure indicator
 * 5. On completion, call /api/assessments/:id/ep-interview/generate-risks
 * 6. Display generated risk scenarios with T×V×I×E breakdown
 * 
 * Key UI Elements:
 * - Exposure gauge showing 1.0-5.0 scale
 * - Risk level indicators (Critical/High/Medium/Low)
 * - Section progress tracker
 * - Conditional question reveals
 */

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Before deploying, verify:
 * 
 * □ EP controls are seeded in database (run ep-controls-seed.sql)
 * □ risk_scenarios table has 'exposure' column
 * □ Routes respond correctly with test data
 * □ All 12 threat calculations produce valid scores
 * □ Exposure factor calculation covers all profile combinations
 * □ Control recommendations map correctly to threats
 * □ Error handling works for missing/invalid data
 */

// ============================================================================
// AI-POWERED ROUTES (NEW)
// ============================================================================

/**
 * Route: POST /api/assessments/:id/ep-interview/generate-risks-ai
 * 
 * Generates risk scenarios using GPT-4 evidence-based assessment with
 * algorithmic fallback. This is the production endpoint for January 1st launch.
 * 
 * Request Body:
 * {
 *   interviewResponses: { ... },
 *   useAI: boolean,           // Optional, defaults to true
 *   photoFindings: string[],   // Optional GPT-4V photo analysis results
 *   incidentHistory: [...],    // Optional incident records
 *   osintFindings: {...}       // Optional OSINT assessment
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
 *   overallExposure: number,
 *   aiConfidence: 'high' | 'medium' | 'low' | 'fallback',
 *   processingTimeMs: number
 * }
 */
const epAIGenerateRisksRoute = `
app.post('/api/assessments/:id/ep-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true,
      photoFindings,
      incidentHistory,
      osintFindings 
    } = req.body;
    
    // Validate assessment exists and is EP type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.facilityType !== 'executive_protection') {
      return res.status(400).json({ 
        error: 'This endpoint is for Executive Protection assessments only.' 
      });
    }
    
    // Generate risk scenarios using AI with fallback
    const result = await generateEPRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, osintFindings }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating EP risk scenarios with AI:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/ep-interview/assess-single-threat
 * 
 * Assess a single threat using AI (for testing or real-time preview)
 */
const epSingleThreatRoute = `
app.post('/api/assessments/:id/ep-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    const result = await assessSingleEPThreat(threatId, interviewResponses, { useAI });
    
    res.json(result);
  } catch (error) {
    console.error('Error assessing single threat:', error);
    res.status(500).json({ error: 'Failed to assess threat' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/ep-interview/generate-narrative
 * 
 * Generate AI narrative summary for completed EP assessment
 */
const epNarrativeRoute = `
app.post('/api/assessments/:id/ep-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get all risk scenarios for this assessment
    const scenarios = await db.query.riskScenarios.findMany({
      where: eq(riskScenarios.assessmentId, parseInt(id))
    });
    
    if (scenarios.length === 0) {
      return res.status(400).json({ error: 'No risk scenarios found for this assessment' });
    }
    
    // Transform to EPAIAssessmentResponse format
    const results = scenarios.map(s => ({
      threatId: s.threatId?.toString() || '',
      threatLikelihood: { score: s.threatLikelihood, label: '', evidence: [], reasoning: '', confidence: 'medium' as const, dataGaps: [] },
      vulnerability: { score: s.vulnerability, label: '', controlGaps: [], protectiveFactors: [], reasoning: '', confidence: 'medium' as const, dataGaps: [] },
      impact: { score: s.impact, label: '', personalSafetyImpact: '', familyImpact: '', financialImpact: '', reputationalImpact: '', reasoning: '', confidence: 'medium' as const },
      exposure: { score: s.exposure || 1, label: '', publicProfileComponent: 0, patternPredictabilityComponent: 0, digitalFootprintComponent: 0, reasoning: '' },
      inherentRisk: { score: s.inherentRisk, normalizedScore: s.inherentRisk, classification: s.riskLevel as 'critical' | 'high' | 'medium' | 'low' },
      priorityControls: [],
      scenarioDescription: s.scenarioDescription || '',
      evidenceTrail: [],
      insufficientDataFlags: [],
    }));
    
    const context = {
      assessmentId: parseInt(id),
      interviewResponses: req.body.interviewResponses || {},
    };
    
    const narrative = await generateEPNarrativeSummary(results, context);
    
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});
`;

// ============================================================================
// UPDATED IMPORTS FOR AI INTEGRATION
// ============================================================================

export const EP_AI_IMPORTS = `
// Add these imports to server/routes.ts for AI integration
import { 
  generateEPRiskScenarios,
  calculateExposureFactor,
  EP_THREATS
} from './ep-interview-mapper';

import {
  generateEPRiskScenariosWithAI,
  assessSingleEPThreat,
  generateEPNarrativeSummary,
} from './ep-ai-risk-assessment';
`;

// ============================================================================
// COMPLETE AI-ENABLED ROUTES BLOCK
// ============================================================================

export const EP_AI_ROUTES_BLOCK = `
// ============================================================================
// EXECUTIVE PROTECTION AI-POWERED ROUTES
// ============================================================================

/**
 * Generate EP risk scenarios with AI (primary endpoint)
 * Uses GPT-4 for evidence-based assessment with algorithmic fallback
 */
app.post('/api/assessments/:id/ep-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true,
      photoFindings,
      incidentHistory,
      osintFindings 
    } = req.body;
    
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment || assessment.facilityType !== 'executive_protection') {
      return res.status(400).json({ error: 'Invalid EP assessment' });
    }
    
    const result = await generateEPRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, osintFindings }
    );
    
    res.json(result);
  } catch (error) {
    console.error('EP AI assessment error:', error);
    res.status(500).json({ error: 'Assessment failed' });
  }
});

/**
 * Assess single threat (for real-time preview during interview)
 */
app.post('/api/assessments/:id/ep-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    const result = await assessSingleEPThreat(threatId, interviewResponses, { useAI });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Threat assessment failed' });
  }
});

/**
 * Generate executive narrative summary
 */
app.post('/api/assessments/:id/ep-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const scenarios = await db.query.riskScenarios.findMany({
      where: eq(riskScenarios.assessmentId, parseInt(id))
    });
    
    if (scenarios.length === 0) {
      return res.status(400).json({ error: 'No scenarios found' });
    }
    
    // Transform and generate narrative
    const results = scenarios.map(transformScenarioToAIFormat);
    const context = { assessmentId: parseInt(id), interviewResponses: req.body.interviewResponses || {} };
    const narrative = await generateEPNarrativeSummary(results, context);
    
    res.json({ narrative });
  } catch (error) {
    res.status(500).json({ error: 'Narrative generation failed' });
  }
});
`;

export default {
  EP_ROUTES_BLOCK,
  EP_AI_ROUTES_BLOCK,
  EP_AI_IMPORTS,
  routes: {
    // Algorithmic (fallback)
    generateRisks: '/api/assessments/:id/ep-interview/generate-risks',
    // AI-powered (primary)
    generateRisksAI: '/api/assessments/:id/ep-interview/generate-risks-ai',
    assessSingleThreat: '/api/assessments/:id/ep-interview/assess-single-threat',
    generateNarrative: '/api/assessments/:id/ep-interview/generate-narrative',
    // Shared
    getThreats: '/api/assessments/:id/ep-interview/threats',
    calculateExposure: '/api/assessments/:id/ep-interview/calculate-exposure',
    getControls: '/api/controls/executive-protection'
  }
};
