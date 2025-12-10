/**
 * RiskFixer EP Route Integration v2.0
 * 
 * ALIGNED WITH 6-LAYER AI FRAMEWORK
 * 
 * This file shows how API routes should connect the mapper (data prep)
 * to the AI engine (all risk scoring and narrative generation).
 * 
 * ARCHITECTURAL CHANGE:
 * - Mapper ONLY prepares data
 * - AI Engine does ALL scoring, scenario generation, and narrative creation
 * - Routes orchestrate the flow
 * 
 * @author RiskFixer Team
 * @version 2.0
 * @see RiskFixer-Architecture-Alignment-MVP.md
 */

import { Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { assessments, riskScenarios, threats } from '@shared/schema';

// Import the NEW mapper (data prep only)
import { 
  prepareForAIEngine,
  validateInterviewCompletion,
  EPMapperOutput,
} from './services/ep-interview-mapper-v2';

// Import the AI Assessment Engine (does ALL scoring)
import {
  assessAllThreats,
  generateExecutiveSummary,
  AIAssessmentResult,
} from './services/ai/ai-risk-assessment-v2';

// ============================================================================
// INTERFACES
// ============================================================================

interface GenerateRisksRequest {
  interviewResponses: Record<string, any>;
  attachments?: {
    type: 'photo' | 'document' | 'floor_plan' | 'report';
    filename: string;
    url: string;
    analysisRequired?: boolean;
  }[];
}

interface GenerateRisksResponse {
  success: boolean;
  mode: 'ai' | 'fallback';
  assessmentId: number;
  results: {
    generatedScenarios: number;
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    scenarioIds: number[];
  };
  aiConfidence: 'high' | 'medium' | 'low';
  executiveSummary?: string;
  errors?: string[];
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * POST /api/assessments/:id/ep-interview/generate-risks
 * 
 * This is the main endpoint for generating EP risk scenarios.
 * 
 * FLOW:
 * 1. Validate assessment exists and is EP type
 * 2. Use MAPPER to prepare interview data (NO scoring in mapper)
 * 3. Use AI ENGINE to generate all scenarios, scores, and narratives
 * 4. Save results to database
 * 5. Return summary to frontend
 */
export async function generateEPRisks(req: Request, res: Response) {
  try {
    const assessmentId = parseInt(req.params.id);
    const { interviewResponses, attachments = [] } = req.body as GenerateRisksRequest;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Validate Assessment
    // ─────────────────────────────────────────────────────────────────────────
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
    });

    if (!assessment) {
      return res.status(404).json({ 
        success: false,
        error: 'Assessment not found',
      });
    }

    if (assessment.facilityType !== 'executive_protection') {
      return res.status(400).json({
        success: false,
        error: 'Invalid assessment type. This endpoint is for Executive Protection assessments only.',
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Prepare Data Using Mapper (NO SCORING HERE)
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`[EP-Generate] Preparing interview data for assessment ${assessmentId}`);
    
    const mapperOutput: EPMapperOutput = prepareForAIEngine(
      assessmentId,
      interviewResponses,
      attachments
    );

    // Check validation
    if (!mapperOutput.validation.isComplete) {
      console.log(`[EP-Generate] Interview incomplete: ${mapperOutput.validation.completionPercentage}%`);
      // Allow partial assessments but warn
      if (mapperOutput.validation.completionPercentage < 50) {
        return res.status(400).json({
          success: false,
          error: 'Interview too incomplete for risk assessment',
          validation: mapperOutput.validation,
        });
      }
    }

    console.log(`[EP-Generate] Mapper output ready. Risk signals: ${mapperOutput.riskSignals.length}`);

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Generate All Scenarios Using AI Engine
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`[EP-Generate] Calling AI Assessment Engine...`);
    
    const aiResults: AIAssessmentResult = await assessAllThreats({
      assessmentId,
      templateType: 'executive_protection',
      interviewResponses,
      principalProfile: mapperOutput.principalProfile,
      contextTags: mapperOutput.contextTags,
      riskSignals: mapperOutput.riskSignals,
      attachments,
    });

    console.log(`[EP-Generate] AI generated ${aiResults.scenarios.length} scenarios`);

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: Save AI Results to Database
    // ─────────────────────────────────────────────────────────────────────────
    const scenarioIds: number[] = [];
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const scenario of aiResults.scenarios) {
      // Insert scenario into database
      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId,
        threatId: scenario.threatId,
        threatLikelihood: scenario.threatLikelihood.score,
        vulnerability: scenario.vulnerability.score,
        impact: scenario.impact.score,
        exposure: scenario.exposure?.score || 1, // EP has exposure
        inherentRisk: scenario.inherentRisk.score,
        residualRisk: scenario.residualRisk || scenario.inherentRisk.score,
        controlEffectiveness: scenario.controlEffectiveness || 0,
        riskLevel: scenario.inherentRisk.classification,
        scenarioDescription: scenario.scenarioDescription,
        
        // AI-specific fields (new columns needed)
        aiConfidence: scenario.confidence,
        threatLikelihoodEvidence: JSON.stringify(scenario.threatLikelihood.evidence),
        threatLikelihoodReasoning: scenario.threatLikelihood.reasoning,
        vulnerabilityEvidence: JSON.stringify(scenario.vulnerability.evidence),
        vulnerabilityReasoning: scenario.vulnerability.reasoning,
        impactEvidence: JSON.stringify(scenario.impact.evidence),
        impactReasoning: scenario.impact.reasoning,
        evidenceTrail: JSON.stringify(scenario.evidenceTrail),
        
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: riskScenarios.id });

      scenarioIds.push(inserted.id);

      // Count risk levels
      switch (scenario.inherentRisk.classification) {
        case 'critical': criticalCount++; break;
        case 'high': highCount++; break;
        case 'medium': mediumCount++; break;
        case 'low': lowCount++; break;
      }

      // Save suggested controls for this scenario
      if (scenario.priorityControls && scenario.priorityControls.length > 0) {
        for (const control of scenario.priorityControls) {
          await db.insert(scenarioControls).values({
            scenarioId: inserted.id,
            controlId: control.controlId,
            urgency: control.urgency,
            rationale: control.rationale,
            createdAt: new Date(),
          });
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: Generate Executive Summary
    // ─────────────────────────────────────────────────────────────────────────
    let executiveSummary: string | undefined;
    
    try {
      executiveSummary = await generateExecutiveSummary({
        assessmentId,
        principalProfile: mapperOutput.principalProfile,
        scenarios: aiResults.scenarios,
        overallRiskLevel: aiResults.overallRiskLevel,
      });
    } catch (summaryError) {
      console.error('[EP-Generate] Failed to generate executive summary:', summaryError);
      // Continue without summary - not critical
    }

    // Update assessment with completion data
    await db.update(assessments)
      .set({
        status: 'complete',
        overallRiskLevel: aiResults.overallRiskLevel,
        executiveSummary,
        aiConfidence: aiResults.confidence,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, assessmentId));

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6: Return Response
    // ─────────────────────────────────────────────────────────────────────────
    const response: GenerateRisksResponse = {
      success: true,
      mode: aiResults.mode,
      assessmentId,
      results: {
        generatedScenarios: scenarioIds.length,
        criticalRisks: criticalCount,
        highRisks: highCount,
        mediumRisks: mediumCount,
        lowRisks: lowCount,
        scenarioIds,
      },
      aiConfidence: aiResults.confidence,
      executiveSummary,
    };

    console.log(`[EP-Generate] Complete. ${scenarioIds.length} scenarios saved.`);
    return res.json(response);

  } catch (error) {
    console.error('[EP-Generate] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate risk assessment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/assessments/:id/ep-interview/validate
 * 
 * Validates interview completion without generating risks.
 * Useful for progress tracking during interview.
 */
export async function validateEPInterview(req: Request, res: Response) {
  try {
    const assessmentId = parseInt(req.params.id);
    const { interviewResponses } = req.body;

    // Validate assessment exists
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Use mapper to validate (no scoring)
    const validation = validateInterviewCompletion(interviewResponses);

    return res.json({
      assessmentId,
      validation,
      canGenerateRisks: validation.isComplete || validation.completionPercentage >= 50,
    });

  } catch (error) {
    console.error('[EP-Validate] Error:', error);
    return res.status(500).json({ error: 'Failed to validate interview' });
  }
}

/**
 * GET /api/assessments/:id/ep-interview/scenarios
 * 
 * Returns generated scenarios with AI narratives.
 */
export async function getEPScenarios(req: Request, res: Response) {
  try {
    const assessmentId = parseInt(req.params.id);

    const scenarios = await db.query.riskScenarios.findMany({
      where: eq(riskScenarios.assessmentId, assessmentId),
      with: {
        threat: true,
        controls: true,
      },
      orderBy: (scenarios, { desc }) => [desc(scenarios.inherentRisk)],
    });

    // Format for frontend with AI narrative data
    const formattedScenarios = scenarios.map(scenario => ({
      id: scenario.id,
      threatId: scenario.threatId,
      threatName: scenario.threat?.name,
      threatCategory: scenario.threat?.category,
      
      // Scores
      threatLikelihood: scenario.threatLikelihood,
      vulnerability: scenario.vulnerability,
      impact: scenario.impact,
      exposure: scenario.exposure,
      inherentRisk: scenario.inherentRisk,
      riskLevel: scenario.riskLevel,
      
      // AI-generated content
      scenarioDescription: scenario.scenarioDescription,
      confidence: scenario.aiConfidence,
      
      // Evidence (parsed from JSON)
      evidence: {
        threatLikelihood: tryParseJSON(scenario.threatLikelihoodEvidence),
        vulnerability: tryParseJSON(scenario.vulnerabilityEvidence),
        impact: tryParseJSON(scenario.impactEvidence),
      },
      
      // Reasoning
      reasoning: {
        threatLikelihood: scenario.threatLikelihoodReasoning,
        vulnerability: scenario.vulnerabilityReasoning,
        impact: scenario.impactReasoning,
      },
      
      // Evidence trail
      evidenceTrail: tryParseJSON(scenario.evidenceTrail),
      
      // Controls
      suggestedControls: scenario.controls?.map(c => ({
        controlId: c.controlId,
        urgency: c.urgency,
        rationale: c.rationale,
      })),
    }));

    return res.json({
      assessmentId,
      scenarioCount: formattedScenarios.length,
      scenarios: formattedScenarios,
    });

  } catch (error) {
    console.error('[EP-Scenarios] Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve scenarios' });
  }
}

/**
 * GET /api/assessments/:id/ep-interview/executive-summary
 * 
 * Returns the AI-generated executive summary.
 */
export async function getEPExecutiveSummary(req: Request, res: Response) {
  try {
    const assessmentId = parseInt(req.params.id);

    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
      columns: {
        id: true,
        name: true,
        executiveSummary: true,
        overallRiskLevel: true,
        aiConfidence: true,
        completedAt: true,
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    return res.json({
      assessmentId,
      assessmentName: assessment.name,
      executiveSummary: assessment.executiveSummary,
      overallRiskLevel: assessment.overallRiskLevel,
      aiConfidence: assessment.aiConfidence,
      completedAt: assessment.completedAt,
    });

  } catch (error) {
    console.error('[EP-Summary] Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve executive summary' });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function tryParseJSON(value: string | null | undefined): any[] | null {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

/**
 * Register EP routes with Express app
 */
export function registerEPRoutes(app: any) {
  // Main risk generation endpoint
  app.post('/api/assessments/:id/ep-interview/generate-risks', generateEPRisks);
  
  // Validation endpoint
  app.post('/api/assessments/:id/ep-interview/validate', validateEPInterview);
  
  // Scenario retrieval
  app.get('/api/assessments/:id/ep-interview/scenarios', getEPScenarios);
  
  // Executive summary
  app.get('/api/assessments/:id/ep-interview/executive-summary', getEPExecutiveSummary);
  
  console.log('[Routes] EP Interview routes registered (AI-first architecture)');
}

// ============================================================================
// DEPRECATED ENDPOINTS (REMOVE THESE)
// ============================================================================

/*
 * The following endpoints are from the legacy Phase 1 architecture.
 * They should be REMOVED or redirected to the AI-first endpoints above.
 * 
 * DEPRECATED: POST /api/assessments/:id/ep-interview/calculate-exposure
 *   - Exposure is now calculated by AI engine as part of full assessment
 *   - Remove this endpoint
 * 
 * DEPRECATED: GET /api/assessments/:id/ep-interview/threats
 *   - Static threat list no longer needed
 *   - AI generates threat scenarios dynamically
 *   - Remove this endpoint
 * 
 * DEPRECATED: Any endpoint that calls:
 *   - calculateThreatLikelihood()
 *   - calculateVulnerability()
 *   - calculateImpact()
 *   - calculateExposureFactor()
 *   - generateEPRiskScenarios()
 *   - classifyRiskLevel()
 */
