/**
 * Manufacturing Facility Route Integration Guide
 * 
 * This file provides the route definitions and integration instructions
 * for wiring the manufacturing AI assessment into server/routes.ts
 * 
 * Manufacturing-specific considerations:
 * - Industrial espionage and IP theft prevention
 * - Production area security and photography prohibition
 * - Equipment sabotage prevention
 * - CFATS compliance (for facilities with hazmat)
 * - Tool, die, and mold security
 * - Counterfeit parts prevention
 * - Insider threat programs
 * - Raw material and finished goods protection
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Manufacturing-Framework.md
 */

// ============================================================================
// IMPORTS TO ADD TO server/routes.ts
// ============================================================================

/*
Add these imports at the top of server/routes.ts:

import { 
  generateManufacturingRiskScenariosWithAI,
  assessSingleManufacturingThreat,
  generateManufacturingNarrative,
  ManufacturingAssessmentContext,
  ManufacturingAIAssessmentResponse,
  ManufacturingIncidentRecord,
  IPAssetProfile,
  CFATSProfile,
} from './services/manufacturing-ai-risk-assessment';

import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  calculateOverallSecurityScore,
  generateControlRecommendations,
  getPrioritizedControlRecommendations,
  calculateRiskForThreat,
  initializeRiskScenariosFromInterview,
  MANUFACTURING_THREATS,
  THREAT_CONTROL_MAPPING,
  QUESTION_THREAT_MAPPING,
} from './services/manufacturing-interview-mapper';

import {
  MANUFACTURING_INTERVIEW_QUESTIONS,
  SECTION_METADATA,
  MANUFACTURING_SECTIONS,
  MANUFACTURING_THREATS as MANUFACTURING_THREAT_IDS,
  MANUFACTURING_ZONES,
  getQuestionsBySection,
  getQuestionById,
  getQuestionsForThreat,
  getAllQuestionsFlattened,
  getQuestionnaireStats,
  getAIContextPrompt,
} from './services/manufacturing-interview-questionnaire';
*/

// ============================================================================
// ROUTE DEFINITIONS TO ADD
// ============================================================================

/**
 * Route: POST /api/assessments/:id/manufacturing-interview/generate-risks-ai
 * 
 * Generates risk scenarios from manufacturing interview responses using T×V×I formula
 * with GPT-4 AI assessment and algorithmic fallback.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   useAI?: boolean,           // Default true
 *   photoFindings?: string[],  // GPT-4V photo analysis results
 *   incidentHistory?: ManufacturingIncidentRecord[],
 *   ipAssets?: IPAssetProfile,
 *   cfatsProfile?: CFATSProfile,
 *   productionValue?: string
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
 *   overallIPTheftRisk: string,
 *   aiConfidence: 'high' | 'medium' | 'low' | 'fallback',
 *   processingTimeMs: number
 * }
 */

const manufacturingGenerateRisksAIRoute = `
app.post('/api/assessments/:id/manufacturing-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true, 
      photoFindings, 
      incidentHistory,
      ipAssets,
      cfatsProfile,
      productionValue 
    } = req.body;
    
    // Validate assessment exists and is manufacturing type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'manufacturing' && assessment.facilityType !== 'manufacturing') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Manufacturing assessments only.' 
      });
    }
    
    // Generate risk scenarios using AI with algorithmic fallback
    const result = await generateManufacturingRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { 
        useAI, 
        photoFindings, 
        incidentHistory,
        ipAssets,
        cfatsProfile,
        productionValue 
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating manufacturing risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/manufacturing-interview/assess-single-threat
 * 
 * Assess a single manufacturing threat using AI (for testing or incremental assessment).
 * 
 * Request Body:
 * {
 *   threatId: string,              // e.g., 'industrial_espionage_ip_theft', 'equipment_sabotage'
 *   interviewResponses: Record<string, any>,
 *   useAI?: boolean                // Default true
 * }
 * 
 * Response: ManufacturingAIAssessmentResponse
 */

const manufacturingAssessSingleThreatRoute = `
app.post('/api/assessments/:id/manufacturing-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    // Validate threatId exists
    const validThreat = MANUFACTURING_THREATS.find(t => t.id === threatId);
    if (!validThreat) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validThreats: MANUFACTURING_THREATS.map(t => t.id)
      });
    }
    
    const result = await assessSingleManufacturingThreat(threatId, interviewResponses, useAI);
    
    res.json(result);
  } catch (error) {
    console.error('Error assessing single manufacturing threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/manufacturing-interview/generate-narrative
 * 
 * Generate AI narrative report sections for manufacturing assessment.
 * 
 * Request Body:
 * {
 *   results: ManufacturingAIAssessmentResponse[],
 *   interviewResponses: Record<string, any>,
 *   narrativeType?: 'executive_summary' | 'risk_landscape' | 'recommendations' | 'full_report'
 * }
 * 
 * Response:
 * {
 *   narrative: string
 * }
 */

const manufacturingGenerateNarrativeRoute = `
app.post('/api/assessments/:id/manufacturing-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, narrativeType = 'executive_summary' } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context: ManufacturingAssessmentContext = {
      assessmentId: parseInt(id),
      interviewResponses: interviewResponses || {},
    };
    
    const narrative = await generateManufacturingNarrative({
      assessmentId: parseInt(id),
      riskScenarios: results,
      facilityContext: context,
      narrativeType,
    });
    
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating manufacturing narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/manufacturing-interview/threats
 * 
 * Returns the list of manufacturing-specific threats for the interview workflow.
 */

const manufacturingThreatsRoute = `
app.get('/api/assessments/:id/manufacturing-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: MANUFACTURING_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode,
        description: t.description,
      })),
      totalThreats: MANUFACTURING_THREATS.length,
      threatCategories: [...new Set(MANUFACTURING_THREATS.map(t => t.category))],
    });
  } catch (error) {
    console.error('Error fetching manufacturing threats:', error);
    res.status(500).json({ error: 'Failed to fetch manufacturing threats' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/manufacturing-interview/calculate-ip-theft-risk
 * 
 * Calculate real-time IP theft and security risk score during interview.
 * Provides immediate feedback on security posture aligned with FBI and ASIS standards.
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
 *   ipProtectionLevel: string,       // excellent/good/average/concerning/critical
 *   insiderThreatRisk: string,       // low/moderate/high/critical
 *   keyFindings: string[],
 *   strengths: string[],
 *   categoryScores: Record<string, number>,
 *   cfatsCompliance: {
 *     applicable: boolean,
 *     tier: string | null,
 *     gaps: string[]
 *   },
 *   components: {
 *     hasProductionAccessControl: boolean,
 *     hasIPProtectionMeasures: boolean,
 *     hasDLPSystem: boolean,
 *     hasBackgroundChecks: boolean,
 *     hasInsiderThreatProgram: boolean,
 *     hasPhotographyProhibition: boolean,
 *     hasVisitorNDA: boolean
 *   }
 * }
 */

const manufacturingIPTheftRiskRoute = `
app.post('/api/assessments/:id/manufacturing-interview/calculate-ip-theft-risk', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    // Get overall security score
    const { score, grade, findings, strengths, categoryScores } = calculateOverallSecurityScore(interviewResponses);
    
    // Calculate IP protection level
    const hasNDAs = interviewResponses.ip_2 === 'yes';
    const hasDLP = interviewResponses.ip_5 === 'yes';
    const hasCleanDesk = interviewResponses.ip_3 === 'yes';
    const hasPhotographyProhibition = interviewResponses.production_5 === 'yes';
    const hasExitInterviews = interviewResponses.ip_7 === 'yes';
    const hasRDAccessControl = !(interviewResponses.ip_1a || '').toLowerCase().includes('no formal');
    
    const ipControlCount = [hasNDAs, hasDLP, hasCleanDesk, hasPhotographyProhibition, hasExitInterviews, hasRDAccessControl]
      .filter(Boolean).length;
    
    let ipProtectionLevel = 'concerning';
    if (ipControlCount >= 6) ipProtectionLevel = 'excellent';
    else if (ipControlCount >= 5) ipProtectionLevel = 'good';
    else if (ipControlCount >= 3) ipProtectionLevel = 'average';
    else if (ipControlCount >= 1) ipProtectionLevel = 'concerning';
    else ipProtectionLevel = 'critical';
    
    // Calculate insider threat risk based on history and controls
    let insiderThreatRisk = 'moderate';
    const incidentHistory = interviewResponses.emergency_2 || [];
    const hasEmployeeTheftHistory = Array.isArray(incidentHistory) && incidentHistory.includes('Employee theft');
    const hasIPTheftHistory = Array.isArray(incidentHistory) && incidentHistory.includes('IP theft or suspected espionage');
    const hasSabotageHistory = Array.isArray(incidentHistory) && incidentHistory.includes('Equipment sabotage or tampering');
    const hasInsiderProgram = interviewResponses.personnel_3 === 'yes';
    const hasAccessRevocation = interviewResponses.personnel_6 === 'yes';
    const hasBackgroundChecks = !(interviewResponses.personnel_1 || '').toLowerCase().includes('no background');
    
    const hasInsiderHistory = hasEmployeeTheftHistory || hasIPTheftHistory || hasSabotageHistory;
    const hasInsiderControls = hasInsiderProgram && hasAccessRevocation && hasBackgroundChecks;
    
    if (hasInsiderHistory && !hasInsiderControls) insiderThreatRisk = 'critical';
    else if (hasInsiderHistory || !hasInsiderControls) insiderThreatRisk = 'high';
    else if (!hasInsiderProgram || !hasAccessRevocation) insiderThreatRisk = 'moderate';
    else insiderThreatRisk = 'low';
    
    // Check CFATS applicability
    const hasHazmat = interviewResponses.facility_8 === 'yes';
    const cfatsTier = interviewResponses.facility_8a || null;
    const cfatsGaps: string[] = [];
    
    if (hasHazmat) {
      if (interviewResponses.inventory_3 !== 'yes') {
        cfatsGaps.push('High-value/hazmat materials not in secured caging');
      }
      if (interviewResponses.inventory_7 !== 'yes') {
        cfatsGaps.push('No two-person rule for sensitive material access');
      }
      if (!(interviewResponses.personnel_1 || '').toLowerCase().includes('comprehensive')) {
        cfatsGaps.push('Background checks not comprehensive for CFATS');
      }
    }
    
    res.json({
      securityScore: score,
      securityGrade: grade,
      ipProtectionLevel,
      insiderThreatRisk,
      keyFindings: findings,
      strengths,
      categoryScores,
      cfatsCompliance: {
        applicable: hasHazmat,
        tier: hasHazmat ? cfatsTier : null,
        gaps: cfatsGaps,
      },
      components: {
        hasProductionAccessControl: interviewResponses.production_1 === 'yes',
        hasIPProtectionMeasures: hasDLP || hasNDAs,
        hasDLPSystem: hasDLP,
        hasBackgroundChecks,
        hasInsiderThreatProgram: hasInsiderProgram,
        hasPhotographyProhibition,
        hasVisitorNDA: hasNDAs,
      }
    });
  } catch (error) {
    console.error('Error calculating IP theft risk:', error);
    res.status(500).json({ error: 'Failed to calculate IP theft risk' });
  }
});
`;

/**
 * Route: GET /api/controls/manufacturing
 * 
 * Returns all manufacturing-specific security controls for recommendation engine.
 */

const manufacturingControlsRoute = `
app.get('/api/controls/manufacturing', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'manufacturing')
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
    console.error('Error fetching manufacturing controls:', error);
    res.status(500).json({ error: 'Failed to fetch manufacturing controls' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/manufacturing-interview/get-control-recommendations
 * 
 * Get control recommendations based on interview responses and threat priorities.
 * Uses threat-specific control mapping from manufacturing-interview-mapper.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   priorityThreats?: string[],   // Optional: focus on specific threats
 *   includeRationale?: boolean    // Include why each control is recommended
 * }
 */

const manufacturingControlRecommendationsRoute = `
app.post('/api/assessments/:id/manufacturing-interview/get-control-recommendations', async (req, res) => {
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
    
    // Get prioritized recommendations with rationale
    const prioritizedControls = includeRationale 
      ? getPrioritizedControlRecommendations(interviewResponses)
      : [];
    
    // If specific threats are requested, get threat-specific controls
    let threatSpecificControls: any[] = [];
    if (priorityThreats && priorityThreats.length > 0) {
      for (const threatId of priorityThreats) {
        const threatControls = THREAT_CONTROL_MAPPING[threatId] || [];
        threatSpecificControls.push({
          threatId,
          controls: threatControls.map(controlId => ({
            controlId,
            controlName: controlId.replace(/_/g, ' ').replace(/\\b\\w/g, (char: string) => char.toUpperCase()),
          }))
        });
      }
    }
    
    // Enrich general recommendations with control details if available
    const enrichedRecommendations = await Promise.all(
      generalRecommendations.map(async (controlId) => {
        const control = await db.query.securityControls.findFirst({
          where: and(
            eq(securityControls.facilityType, 'manufacturing'),
            sql\`LOWER(REPLACE(name, ' ', '_')) LIKE LOWER(\${controlId})\`
          )
        });
        
        return {
          controlId,
          controlName: control?.name || controlId.replace(/_/g, ' ').replace(/\\b\\w/g, (char: string) => char.toUpperCase()),
          category: control?.category || 'general',
          description: control?.description || '',
          estimatedCost: control?.estimatedCost || 'medium',
          baseWeight: control?.baseWeight || 0.3,
        };
      })
    );
    
    res.json({
      total: generalRecommendations.length,
      recommendations: enrichedRecommendations,
      prioritizedControls: prioritizedControls.length > 0 ? prioritizedControls : undefined,
      threatSpecificControls: threatSpecificControls.length > 0 ? threatSpecificControls : undefined,
    });
  } catch (error) {
    console.error('Error getting control recommendations:', error);
    res.status(500).json({ error: 'Failed to get control recommendations' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/manufacturing-interview/get-threat-breakdown
 * 
 * Get detailed T×V×I breakdown for a specific threat.
 * Shows which interview questions contributed to each score.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   threatId: string
 * }
 */

const manufacturingThreatBreakdownRoute = `
app.post('/api/assessments/:id/manufacturing-interview/get-threat-breakdown', async (req, res) => {
  try {
    const { interviewResponses, threatId } = req.body;
    
    if (!interviewResponses || !threatId) {
      return res.status(400).json({ error: 'interviewResponses and threatId are required' });
    }
    
    // Get threat definition
    const threat = MANUFACTURING_THREATS.find(t => t.id === threatId);
    if (!threat) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validThreats: MANUFACTURING_THREATS.map(t => t.id)
      });
    }
    
    // Get question mapping for this threat
    const questionMapping = QUESTION_THREAT_MAPPING[threatId] || {
      questionIds: [],
      criticalQuestions: [],
      controlQuestions: [],
    };
    
    // Calculate T, V, I scores
    const T = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
    const V = calculateVulnerabilityFromInterview(interviewResponses, threatId);
    const I = calculateImpactFromInterview(interviewResponses, threatId);
    const inherentRisk = T * V * I;
    
    // Determine risk level
    let riskLevel = 'low';
    const normalizedRisk = (inherentRisk / 125) * 100;
    if (normalizedRisk >= 60) riskLevel = 'critical';
    else if (normalizedRisk >= 40) riskLevel = 'high';
    else if (normalizedRisk >= 25) riskLevel = 'medium';
    
    // Get contributing factors
    const contributingFactors: string[] = [];
    
    // Check key questions for this threat
    if (threatId === 'industrial_espionage_ip_theft' || threatId === 'trade_secret_theft') {
      if (interviewResponses.ip_2 !== 'yes') contributingFactors.push('Visitors not required to sign NDAs');
      if (interviewResponses.ip_5 !== 'yes') contributingFactors.push('No data loss prevention measures');
      if (interviewResponses.production_5 !== 'yes') contributingFactors.push('Photography not prohibited in production areas');
    }
    
    if (threatId === 'equipment_sabotage' || threatId === 'production_line_disruption') {
      if (interviewResponses.production_1 !== 'yes') contributingFactors.push('No production floor access control');
      if (interviewResponses.personnel_6 !== 'yes') contributingFactors.push('No immediate access revocation on termination');
      if (interviewResponses.emergency_5 !== 'yes') contributingFactors.push('No sabotage incident response plan');
    }
    
    if (threatId === 'insider_theft_physical' || threatId === 'raw_material_theft') {
      if ((interviewResponses.personnel_1 || '').toLowerCase().includes('no background')) {
        contributingFactors.push('No employee background checks');
      }
      if (interviewResponses.inventory_3 !== 'yes') contributingFactors.push('High-value materials not secured');
      if (interviewResponses.personnel_5 !== 'yes') contributingFactors.push('No exit bag checks');
    }
    
    res.json({
      threat: {
        id: threat.id,
        name: threat.name,
        category: threat.category,
        description: threat.description,
        asisCode: threat.asisCode,
      },
      scores: {
        threatLikelihood: T,
        vulnerability: V,
        impact: I,
        inherentRisk,
        riskLevel,
      },
      questionMapping: {
        totalQuestions: questionMapping.questionIds.length,
        criticalQuestions: questionMapping.criticalQuestions,
        controlQuestions: questionMapping.controlQuestions,
      },
      contributingFactors,
      recommendedControls: THREAT_CONTROL_MAPPING[threatId] || [],
    });
  } catch (error) {
    console.error('Error getting threat breakdown:', error);
    res.status(500).json({ error: 'Failed to get threat breakdown' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/manufacturing-interview/prioritize-threats
 * 
 * Get all threats sorted by calculated risk level.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>
 * }
 */

const manufacturingPrioritizeThreatsRoute = `
app.post('/api/assessments/:id/manufacturing-interview/prioritize-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    // Calculate risk for all threats
    const threatRisks = MANUFACTURING_THREATS.map(threat => {
      const riskData = calculateRiskForThreat(interviewResponses, threat.id);
      return {
        id: threat.id,
        name: threat.name,
        category: threat.category,
        ...riskData,
      };
    });
    
    // Sort by inherent risk (highest first)
    const sortedThreats = threatRisks.sort((a, b) => b.inherentRisk - a.inherentRisk);
    
    // Get highest risks (critical and high)
    const highestRisks = sortedThreats.filter(t => 
      t.riskLevel === 'critical' || t.riskLevel === 'high'
    );
    
    res.json({
      allThreats: sortedThreats,
      highestRisks,
      summary: {
        critical: sortedThreats.filter(t => t.riskLevel === 'critical').length,
        high: sortedThreats.filter(t => t.riskLevel === 'high').length,
        medium: sortedThreats.filter(t => t.riskLevel === 'medium').length,
        low: sortedThreats.filter(t => t.riskLevel === 'low').length,
      },
    });
  } catch (error) {
    console.error('Error prioritizing threats:', error);
    res.status(500).json({ error: 'Failed to prioritize threats' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/manufacturing-interview/questions
 * 
 * Get manufacturing interview questions with section metadata.
 */

const manufacturingQuestionsRoute = `
app.get('/api/assessments/:id/manufacturing-interview/questions', async (req, res) => {
  try {
    const questions = getAllQuestionsFlattened();
    const stats = getQuestionnaireStats();
    
    // Group by section
    const bySection: Record<string, any[]> = {};
    MANUFACTURING_SECTIONS.forEach(section => {
      bySection[section.id] = getQuestionsBySection(section.id);
    });
    
    res.json({
      totalQuestions: stats.totalQuestions,
      sections: MANUFACTURING_SECTIONS.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        order: s.order,
        questionCount: bySection[s.id]?.length || 0,
      })),
      questionsBySection: bySection,
      aiContextPrompt: getAIContextPrompt(),
    });
  } catch (error) {
    console.error('Error fetching manufacturing questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/manufacturing-interview/industry-benchmarks
 * 
 * Get manufacturing industry benchmarks and compliance standards.
 */

const manufacturingBenchmarksRoute = `
app.get('/api/assessments/:id/manufacturing-interview/industry-benchmarks', async (req, res) => {
  try {
    res.json({
      industryStandards: {
        asis: {
          name: 'ASIS GDL-RA',
          description: 'General Security Risk Assessment Guidelines',
          applicability: 'All manufacturing facilities',
        },
        cfats: {
          name: 'CFATS (Chemical Facility Anti-Terrorism Standards)',
          description: 'DHS requirements for facilities handling chemicals of interest',
          applicability: 'Facilities with hazardous materials',
          tiers: ['Tier 1 (highest risk)', 'Tier 2', 'Tier 3', 'Tier 4'],
        },
        nist: {
          name: 'NIST Manufacturing Security Guidelines',
          description: 'Security framework for manufacturing operations',
          applicability: 'All manufacturing facilities',
        },
        iso28000: {
          name: 'ISO 28000',
          description: 'Supply Chain Security Management Systems',
          applicability: 'Supply chain operations',
        },
      },
      ipTheftStatistics: {
        annualCost: '$600+ billion annually in US (FBI estimate)',
        insiderInvolvement: '60%+ involves current or former employees',
        methodBreakdown: {
          digitalExfiltration: '45%',
          physicalDocuments: '25%',
          photographyVideo: '20%',
          verbal: '10%',
        },
        targetIndustries: [
          'Aerospace/Defense',
          'Pharmaceuticals',
          'Semiconductors/Electronics',
          'Automotive',
          'Energy/Chemical',
        ],
      },
      manufacturingTheftStatistics: {
        averageLoss: '$100K-$500K per major incident',
        topTargets: [
          'Finished electronics',
          'Pharmaceuticals/APIs',
          'Precious metals',
          'Specialty chemicals',
          'Tooling/dies/molds',
        ],
      },
      securityMaturityLevels: {
        level1: {
          name: 'Initial',
          description: 'Basic physical security, minimal procedures',
          typicalScore: '0-40',
        },
        level2: {
          name: 'Developing',
          description: 'Documented procedures, some electronic controls',
          typicalScore: '41-60',
        },
        level3: {
          name: 'Defined',
          description: 'Comprehensive access control, CCTV, training',
          typicalScore: '61-75',
        },
        level4: {
          name: 'Managed',
          description: 'Integrated systems, insider threat program, incident response',
          typicalScore: '76-90',
        },
        level5: {
          name: 'Optimized',
          description: 'Full DLP, biometrics, continuous monitoring, intelligence-driven',
          typicalScore: '91-100',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching industry benchmarks:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/manufacturing-interview/zones
 * 
 * Get manufacturing facility zones for spatial context.
 */

const manufacturingZonesRoute = `
app.get('/api/assessments/:id/manufacturing-interview/zones', async (req, res) => {
  try {
    res.json({
      zones: MANUFACTURING_ZONES,
      zoneCategories: {
        perimeter: ['perimeter', 'parking', 'gate'],
        production: ['production_floor', 'assembly', 'cleanroom', 'tool_room'],
        sensitive: ['rd_engineering', 'prototype_lab', 'server_room'],
        storage: ['raw_material_warehouse', 'finished_goods_warehouse', 'hazmat_storage'],
        shipping: ['loading_docks', 'shipping_receiving'],
        administrative: ['offices', 'lobby', 'conference_rooms'],
      },
    });
  } catch (error) {
    console.error('Error fetching manufacturing zones:', error);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/manufacturing-interview/save-responses
 * 
 * Save interview responses and optionally generate risk scenarios.
 */

const manufacturingSaveResponsesRoute = `
app.post('/api/assessments/:id/manufacturing-interview/save-responses', async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewResponses, generateScenarios = false } = req.body;
    
    // Update assessment with interview responses
    await db.update(assessments)
      .set({ 
        interviewResponses,
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, parseInt(id)));
    
    let scenarioResult = null;
    if (generateScenarios) {
      scenarioResult = await initializeRiskScenariosFromInterview(
        parseInt(id),
        interviewResponses
      );
    }
    
    res.json({
      success: true,
      assessmentId: parseInt(id),
      savedAt: new Date().toISOString(),
      scenarioResult,
    });
  } catch (error) {
    console.error('Error saving interview responses:', error);
    res.status(500).json({ error: 'Failed to save responses' });
  }
});
`;

// ============================================================================
// COMPLETE ROUTES BLOCK FOR COPY/PASTE
// ============================================================================

export const MANUFACTURING_ROUTES_BLOCK = `
// ============================================================================
// MANUFACTURING ASSESSMENT ROUTES
// ============================================================================

/**
 * Generate risk scenarios using AI with algorithmic fallback
 */
app.post('/api/assessments/:id/manufacturing-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true, 
      photoFindings, 
      incidentHistory,
      ipAssets,
      cfatsProfile,
      productionValue 
    } = req.body;
    
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'manufacturing' && assessment.facilityType !== 'manufacturing') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Manufacturing assessments only.' 
      });
    }
    
    const result = await generateManufacturingRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, ipAssets, cfatsProfile, productionValue }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating manufacturing risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Assess a single manufacturing threat (for testing or incremental assessment)
 */
app.post('/api/assessments/:id/manufacturing-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    const validThreat = MANUFACTURING_THREATS.find(t => t.id === threatId);
    if (!validThreat) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validThreats: MANUFACTURING_THREATS.map(t => t.id)
      });
    }
    
    const result = await assessSingleManufacturingThreat(threatId, interviewResponses, useAI);
    res.json(result);
  } catch (error) {
    console.error('Error assessing single manufacturing threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate AI narrative summary for manufacturing assessment
 */
app.post('/api/assessments/:id/manufacturing-interview/generate-narrative', async (req, res) => {
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
    
    const narrative = await generateManufacturingNarrative({
      assessmentId: parseInt(id),
      riskScenarios: results,
      facilityContext: context,
      narrativeType,
    });
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating manufacturing narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});

/**
 * Get manufacturing threat definitions for interview workflow
 */
app.get('/api/assessments/:id/manufacturing-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: MANUFACTURING_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode,
        description: t.description,
      })),
      totalThreats: MANUFACTURING_THREATS.length,
    });
  } catch (error) {
    console.error('Error fetching manufacturing threats:', error);
    res.status(500).json({ error: 'Failed to fetch manufacturing threats' });
  }
});

/**
 * Calculate real-time IP theft and security risk during interview
 */
app.post('/api/assessments/:id/manufacturing-interview/calculate-ip-theft-risk', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const { score, grade, findings, strengths, categoryScores } = calculateOverallSecurityScore(interviewResponses);
    
    // IP protection level
    const hasNDAs = interviewResponses.ip_2 === 'yes';
    const hasDLP = interviewResponses.ip_5 === 'yes';
    const hasCleanDesk = interviewResponses.ip_3 === 'yes';
    const hasPhotographyProhibition = interviewResponses.production_5 === 'yes';
    const hasExitInterviews = interviewResponses.ip_7 === 'yes';
    const hasRDAccessControl = !(interviewResponses.ip_1a || '').toLowerCase().includes('no formal');
    
    const ipControlCount = [hasNDAs, hasDLP, hasCleanDesk, hasPhotographyProhibition, hasExitInterviews, hasRDAccessControl]
      .filter(Boolean).length;
    
    let ipProtectionLevel = 'concerning';
    if (ipControlCount >= 6) ipProtectionLevel = 'excellent';
    else if (ipControlCount >= 5) ipProtectionLevel = 'good';
    else if (ipControlCount >= 3) ipProtectionLevel = 'average';
    else if (ipControlCount >= 1) ipProtectionLevel = 'concerning';
    else ipProtectionLevel = 'critical';
    
    // Insider threat risk
    const incidentHistory = interviewResponses.emergency_2 || [];
    const hasInsiderHistory = Array.isArray(incidentHistory) && (
      incidentHistory.includes('Employee theft') ||
      incidentHistory.includes('IP theft or suspected espionage') ||
      incidentHistory.includes('Equipment sabotage or tampering')
    );
    const hasInsiderProgram = interviewResponses.personnel_3 === 'yes';
    const hasAccessRevocation = interviewResponses.personnel_6 === 'yes';
    const hasBackgroundChecks = !(interviewResponses.personnel_1 || '').toLowerCase().includes('no background');
    const hasInsiderControls = hasInsiderProgram && hasAccessRevocation && hasBackgroundChecks;
    
    let insiderThreatRisk = 'moderate';
    if (hasInsiderHistory && !hasInsiderControls) insiderThreatRisk = 'critical';
    else if (hasInsiderHistory || !hasInsiderControls) insiderThreatRisk = 'high';
    else if (!hasInsiderProgram || !hasAccessRevocation) insiderThreatRisk = 'moderate';
    else insiderThreatRisk = 'low';
    
    // CFATS
    const hasHazmat = interviewResponses.facility_8 === 'yes';
    const cfatsTier = interviewResponses.facility_8a || null;
    
    res.json({
      securityScore: score,
      securityGrade: grade,
      ipProtectionLevel,
      insiderThreatRisk,
      keyFindings: findings,
      strengths,
      categoryScores,
      cfatsCompliance: {
        applicable: hasHazmat,
        tier: hasHazmat ? cfatsTier : null,
      },
      components: {
        hasProductionAccessControl: interviewResponses.production_1 === 'yes',
        hasIPProtectionMeasures: hasDLP || hasNDAs,
        hasDLPSystem: hasDLP,
        hasBackgroundChecks,
        hasInsiderThreatProgram: hasInsiderProgram,
        hasPhotographyProhibition,
        hasVisitorNDA: hasNDAs,
      }
    });
  } catch (error) {
    console.error('Error calculating IP theft risk:', error);
    res.status(500).json({ error: 'Failed to calculate IP theft risk' });
  }
});

/**
 * Get manufacturing-specific security controls
 */
app.get('/api/controls/manufacturing', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'manufacturing')
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
    console.error('Error fetching manufacturing controls:', error);
    res.status(500).json({ error: 'Failed to fetch manufacturing controls' });
  }
});

/**
 * Get control recommendations based on interview responses
 */
app.post('/api/assessments/:id/manufacturing-interview/get-control-recommendations', async (req, res) => {
  try {
    const { interviewResponses, priorityThreats, includeRationale = true } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const recommendations = generateControlRecommendations(interviewResponses, priorityThreats?.[0]);
    const prioritizedControls = includeRationale ? getPrioritizedControlRecommendations(interviewResponses) : [];
    
    let threatSpecificControls = [];
    if (priorityThreats && priorityThreats.length > 0) {
      for (const threatId of priorityThreats) {
        const controls = THREAT_CONTROL_MAPPING[threatId] || [];
        threatSpecificControls.push({ 
          threatId, 
          controls: controls.map(c => ({ controlId: c, controlName: c.replace(/_/g, ' ') }))
        });
      }
    }
    
    res.json({
      total: recommendations.length,
      recommendations: recommendations.map(controlId => ({
        controlId,
        controlName: controlId.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase()),
      })),
      prioritizedControls: prioritizedControls.length > 0 ? prioritizedControls : undefined,
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
app.post('/api/assessments/:id/manufacturing-interview/get-threat-breakdown', async (req, res) => {
  try {
    const { interviewResponses, threatId } = req.body;
    
    if (!interviewResponses || !threatId) {
      return res.status(400).json({ error: 'interviewResponses and threatId are required' });
    }
    
    const threat = MANUFACTURING_THREATS.find(t => t.id === threatId);
    if (!threat) {
      return res.status(400).json({ error: 'Invalid threatId' });
    }
    
    const T = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
    const V = calculateVulnerabilityFromInterview(interviewResponses, threatId);
    const I = calculateImpactFromInterview(interviewResponses, threatId);
    const inherentRisk = T * V * I;
    
    let riskLevel = 'low';
    const normalizedRisk = (inherentRisk / 125) * 100;
    if (normalizedRisk >= 60) riskLevel = 'critical';
    else if (normalizedRisk >= 40) riskLevel = 'high';
    else if (normalizedRisk >= 25) riskLevel = 'medium';
    
    res.json({
      threat: { id: threat.id, name: threat.name, category: threat.category },
      scores: { threatLikelihood: T, vulnerability: V, impact: I, inherentRisk, riskLevel },
      recommendedControls: THREAT_CONTROL_MAPPING[threatId] || [],
    });
  } catch (error) {
    console.error('Error getting threat breakdown:', error);
    res.status(500).json({ error: 'Failed to get threat breakdown' });
  }
});

/**
 * Prioritize threats by calculated risk
 */
app.post('/api/assessments/:id/manufacturing-interview/prioritize-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const threatRisks = MANUFACTURING_THREATS.map(threat => {
      const riskData = calculateRiskForThreat(interviewResponses, threat.id);
      return { id: threat.id, name: threat.name, category: threat.category, ...riskData };
    });
    
    const sortedThreats = threatRisks.sort((a, b) => b.inherentRisk - a.inherentRisk);
    const highestRisks = sortedThreats.filter(t => t.riskLevel === 'critical' || t.riskLevel === 'high');
    
    res.json({
      allThreats: sortedThreats,
      highestRisks,
      summary: {
        critical: sortedThreats.filter(t => t.riskLevel === 'critical').length,
        high: sortedThreats.filter(t => t.riskLevel === 'high').length,
        medium: sortedThreats.filter(t => t.riskLevel === 'medium').length,
        low: sortedThreats.filter(t => t.riskLevel === 'low').length,
      },
    });
  } catch (error) {
    console.error('Error prioritizing threats:', error);
    res.status(500).json({ error: 'Failed to prioritize threats' });
  }
});

/**
 * Get interview questions with section metadata
 */
app.get('/api/assessments/:id/manufacturing-interview/questions', async (req, res) => {
  try {
    const questions = getAllQuestionsFlattened();
    const stats = getQuestionnaireStats();
    
    const bySection = {};
    MANUFACTURING_SECTIONS.forEach(section => {
      bySection[section.id] = getQuestionsBySection(section.id);
    });
    
    res.json({
      totalQuestions: stats.totalQuestions,
      sections: MANUFACTURING_SECTIONS.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        order: s.order,
        questionCount: bySection[s.id]?.length || 0,
      })),
      questionsBySection: bySection,
    });
  } catch (error) {
    console.error('Error fetching manufacturing questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

/**
 * Get industry benchmarks and standards
 */
app.get('/api/assessments/:id/manufacturing-interview/industry-benchmarks', async (req, res) => {
  try {
    res.json({
      industryStandards: {
        asis: { name: 'ASIS GDL-RA', description: 'General Security Risk Assessment Guidelines' },
        cfats: { name: 'CFATS', description: 'Chemical Facility Anti-Terrorism Standards' },
        nist: { name: 'NIST Manufacturing', description: 'Manufacturing Security Guidelines' },
        iso28000: { name: 'ISO 28000', description: 'Supply Chain Security Management' },
      },
      ipTheftStatistics: {
        annualCost: '$600+ billion annually (FBI)',
        insiderInvolvement: '60%+ involves employees',
      },
      securityMaturityLevels: {
        level1: { name: 'Initial', typicalScore: '0-40' },
        level2: { name: 'Developing', typicalScore: '41-60' },
        level3: { name: 'Defined', typicalScore: '61-75' },
        level4: { name: 'Managed', typicalScore: '76-90' },
        level5: { name: 'Optimized', typicalScore: '91-100' },
      },
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});

/**
 * Get manufacturing facility zones
 */
app.get('/api/assessments/:id/manufacturing-interview/zones', async (req, res) => {
  try {
    res.json({
      zones: MANUFACTURING_ZONES,
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

/**
 * Save interview responses
 */
app.post('/api/assessments/:id/manufacturing-interview/save-responses', async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewResponses, generateScenarios = false } = req.body;
    
    await db.update(assessments)
      .set({ interviewResponses, updatedAt: new Date() })
      .where(eq(assessments.id, parseInt(id)));
    
    let scenarioResult = null;
    if (generateScenarios) {
      scenarioResult = await initializeRiskScenariosFromInterview(parseInt(id), interviewResponses);
    }
    
    res.json({
      success: true,
      assessmentId: parseInt(id),
      savedAt: new Date().toISOString(),
      scenarioResult,
    });
  } catch (error) {
    console.error('Error saving responses:', error);
    res.status(500).json({ error: 'Failed to save responses' });
  }
});
`;

// ============================================================================
// FRONTEND INTEGRATION GUIDE
// ============================================================================

/**
 * FRONTEND INTEGRATION WORKFLOW
 * 
 * 1. User creates manufacturing assessment from dashboard
 * 2. Frontend loads interview questions from /questions endpoint
 * 3. User progresses through 10 sections
 * 4. After each section, optionally call /calculate-ip-theft-risk for live feedback
 * 5. On completion, call /generate-risks-ai to create all 15 risk scenarios
 * 6. Display risk matrix with:
 *    - IP Theft Risk indicator (excellent → critical)
 *    - Insider Threat Risk level (low → critical)
 *    - Security Score gauge (0-100 with A-F grade)
 *    - CFATS compliance status (if applicable)
 *    - Risk level badges (Critical/High/Medium/Low)
 *    - AI confidence indicator
 *    - Control recommendations with rationale
 * 
 * 7. Generate narrative summary for executive report
 * 
 * Key UI Elements:
 * - Security Score gauge (0-100 with A-F grade)
 * - IP Protection Level indicator (excellent → critical)
 * - Insider Threat Risk level (low → critical)
 * - CFATS Compliance badge (if applicable)
 * - Risk level badges per threat
 * - Section progress tracker (10 sections)
 * - AI confidence indicator
 * - Industry benchmarks comparison
 * 
 * Color Coding:
 * - Critical: Red (#DC2626)
 * - High: Orange (#EA580C)
 * - Medium: Yellow (#CA8A04)
 * - Low: Green (#16A34A)
 * - CFATS Tier 1: Red (#DC2626)
 * - CFATS Tier 2: Orange (#EA580C)
 * - CFATS Tier 3-4: Yellow (#CA8A04)
 */

// ============================================================================
// REACT COMPONENT EXAMPLE - IP THEFT RISK INDICATOR
// ============================================================================

export const IPTheftRiskIndicatorExample = `
interface IPTheftRiskIndicatorProps {
  securityScore: number;
  securityGrade: string;
  ipProtectionLevel: string;
  insiderThreatRisk: string;
  cfatsApplicable: boolean;
  cfatsTier: string | null;
}

const IPTheftRiskIndicator: React.FC<IPTheftRiskIndicatorProps> = ({
  securityScore,
  securityGrade,
  ipProtectionLevel,
  insiderThreatRisk,
  cfatsApplicable,
  cfatsTier,
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      case 'excellent': return 'bg-green-600';
      case 'good': return 'bg-green-500';
      case 'average': return 'bg-yellow-500';
      case 'concerning': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getCfatsColor = (tier: string | null) => {
    if (!tier) return 'bg-gray-200 text-gray-600';
    if (tier.includes('1')) return 'bg-red-600 text-white';
    if (tier.includes('2')) return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-gray-900';
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow">
      {/* Security Score */}
      <div className="text-center">
        <div className="text-4xl font-bold">{securityScore}</div>
        <div className="text-2xl font-semibold text-gray-600">Grade: {securityGrade}</div>
        <div className="text-sm text-gray-500">Security Score</div>
      </div>

      {/* IP Protection Level */}
      <div className="text-center">
        <div className={\`inline-block px-4 py-2 rounded-full text-white font-semibold \${getRiskColor(ipProtectionLevel)}\`}>
          {ipProtectionLevel.toUpperCase()}
        </div>
        <div className="text-sm text-gray-500 mt-2">IP Protection</div>
      </div>

      {/* Insider Threat Risk */}
      <div className="text-center">
        <div className={\`inline-block px-4 py-2 rounded-full text-white font-semibold \${getRiskColor(insiderThreatRisk)}\`}>
          {insiderThreatRisk.toUpperCase()}
        </div>
        <div className="text-sm text-gray-500 mt-2">Insider Threat Risk</div>
      </div>

      {/* CFATS Compliance */}
      <div className="text-center">
        {cfatsApplicable ? (
          <div className={\`inline-block px-4 py-2 rounded-lg font-semibold \${getCfatsColor(cfatsTier)}\`}>
            CFATS {cfatsTier || 'Pending'}
          </div>
        ) : (
          <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-gray-500 font-semibold">
            Not Applicable
          </div>
        )}
        <div className="text-sm text-gray-500 mt-2">CFATS Status</div>
      </div>
    </div>
  );
};
`;

// ============================================================================
// REACT HOOK EXAMPLE - USE MANUFACTURING ASSESSMENT
// ============================================================================

export const useManufacturingAssessmentHookExample = `
import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface ManufacturingRiskResult {
  securityScore: number;
  securityGrade: string;
  ipProtectionLevel: string;
  insiderThreatRisk: string;
  keyFindings: string[];
  strengths: string[];
  categoryScores: Record<string, number>;
  cfatsCompliance: {
    applicable: boolean;
    tier: string | null;
  };
  components: Record<string, boolean>;
}

interface ThreatRisk {
  id: string;
  name: string;
  category: string;
  threatLikelihood: number;
  vulnerability: number;
  impact: number;
  inherentRisk: number;
  riskLevel: string;
}

export function useManufacturingAssessment(assessmentId: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskResult, setRiskResult] = useState<ManufacturingRiskResult | null>(null);
  const [threatRisks, setThreatRisks] = useState<ThreatRisk[]>([]);

  const calculateRisk = useCallback(async (responses: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest(
        \`/api/assessments/\${assessmentId}/manufacturing-interview/calculate-ip-theft-risk\`,
        { method: 'POST', body: JSON.stringify({ interviewResponses: responses }) }
      );
      setRiskResult(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate risk');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  const prioritizeThreats = useCallback(async (responses: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest(
        \`/api/assessments/\${assessmentId}/manufacturing-interview/prioritize-threats\`,
        { method: 'POST', body: JSON.stringify({ interviewResponses: responses }) }
      );
      setThreatRisks(result.allThreats);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prioritize threats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  const generateScenarios = useCallback(async (responses: Record<string, any>, useAI = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest(
        \`/api/assessments/\${assessmentId}/manufacturing-interview/generate-risks-ai\`,
        { method: 'POST', body: JSON.stringify({ interviewResponses: responses, useAI }) }
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate scenarios');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  const saveResponses = useCallback(async (responses: Record<string, any>, generateScenarios = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest(
        \`/api/assessments/\${assessmentId}/manufacturing-interview/save-responses\`,
        { method: 'POST', body: JSON.stringify({ interviewResponses: responses, generateScenarios }) }
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save responses');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  return {
    isLoading,
    error,
    riskResult,
    threatRisks,
    calculateRisk,
    prioritizeThreats,
    generateScenarios,
    saveResponses,
  };
}
`;

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Before deploying, verify:
 * 
 * □ Manufacturing controls are seeded in database (run manufacturing-controls-seed.sql)
 * □ risk_scenarios table has ai_evidence, ai_confidence columns
 * □ Routes respond correctly with test data
 * □ All 15 manufacturing threat calculations produce valid scores (1-5)
 * □ Threat-specific vulnerability calculations work correctly
 * □ Security score calculation covers all 7 categories
 * □ Control recommendations map correctly to threats
 * □ AI fallback works when OpenAI API fails
 * □ Error handling works for missing/invalid data
 * □ Narrative generation produces coherent summary
 * □ IP protection level calculation is accurate
 * □ Insider threat risk calculation matches controls
 * □ CFATS compliance detection works correctly
 * 
 * Test Scenarios:
 * 
 * 1. High-risk manufacturing (IP theft history, no controls)
 *    Expected: Critical IP theft risk, Grade F, high insider threat
 * 
 * 2. Secure manufacturing (all IP controls, insider program)
 *    Expected: Excellent IP protection, Grade A, low insider threat
 * 
 * 3. CFATS facility (hazmat handling)
 *    Expected: CFATS tier detected, compliance gaps identified
 * 
 * 4. Partial controls (some questions answered, some gaps)
 *    Expected: Moderate risk, Grade C, specific recommendations
 * 
 * 5. AI failure scenario (mock OpenAI failure)
 *    Expected: Algorithmic fallback with mode='algorithmic'
 * 
 * 6. Empty interview (no responses)
 *    Expected: Baseline scores (3 for each T/V/I)
 */

// ============================================================================
// API DOCUMENTATION
// ============================================================================

export const API_DOCUMENTATION = {
  baseUrl: '/api/assessments/:id/manufacturing-interview',
  endpoints: [
    {
      method: 'POST',
      path: '/generate-risks-ai',
      description: 'Generate all risk scenarios using AI with algorithmic fallback',
      requestBody: {
        interviewResponses: 'Record<string, any> - Interview question responses',
        useAI: 'boolean (default: true) - Whether to use AI assessment',
        photoFindings: 'string[] (optional) - GPT-4V photo analysis results',
        incidentHistory: 'ManufacturingIncidentRecord[] (optional) - Historical incidents',
        ipAssets: 'IPAssetProfile (optional) - IP asset details',
        cfatsProfile: 'CFATSProfile (optional) - CFATS compliance data',
        productionValue: 'string (optional) - Annual production value',
      },
      response: 'ManufacturingGeneratedScenarioResult',
    },
    {
      method: 'POST',
      path: '/assess-single-threat',
      description: 'Assess a single threat (for testing or real-time feedback)',
      requestBody: {
        threatId: 'string - Manufacturing threat identifier',
        interviewResponses: 'Record<string, any> - Interview question responses',
        useAI: 'boolean (default: true)',
      },
      response: 'ManufacturingAIAssessmentResponse',
    },
    {
      method: 'POST',
      path: '/calculate-ip-theft-risk',
      description: 'Real-time security score and IP theft risk calculation',
      requestBody: {
        interviewResponses: 'Record<string, any>',
      },
      response: 'Security score, grade, IP protection level, insider threat risk, CFATS compliance',
    },
    {
      method: 'POST',
      path: '/get-control-recommendations',
      description: 'Get prioritized control recommendations',
      requestBody: {
        interviewResponses: 'Record<string, any>',
        priorityThreats: 'string[] (optional) - Focus on specific threats',
        includeRationale: 'boolean (default: true)',
      },
      response: 'Control recommendations with rationale and threat-specific details',
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
      method: 'POST',
      path: '/generate-narrative',
      description: 'Generate AI narrative for executive summary',
      requestBody: {
        results: 'ManufacturingAIAssessmentResponse[]',
        interviewResponses: 'Record<string, any>',
        narrativeType: "'executive_summary' | 'risk_landscape' | 'recommendations' | 'full_report'",
      },
      response: 'Generated narrative string',
    },
    {
      method: 'POST',
      path: '/save-responses',
      description: 'Save interview responses and optionally generate scenarios',
      requestBody: {
        interviewResponses: 'Record<string, any>',
        generateScenarios: 'boolean (default: false)',
      },
      response: 'Save confirmation with optional scenario result',
    },
    {
      method: 'GET',
      path: '/threats',
      description: 'Get manufacturing threat definitions',
      response: 'Array of 15 manufacturing threats with metadata',
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
      description: 'Get ASIS, CFATS standards and IP theft statistics',
      response: 'Benchmarks, standards, statistics',
    },
    {
      method: 'GET',
      path: '/zones',
      description: 'Get manufacturing facility zones',
      response: 'Zone definitions for spatial context',
    },
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  MANUFACTURING_ROUTES_BLOCK,
  API_DOCUMENTATION,
  routes: {
    generateRisksAI: '/api/assessments/:id/manufacturing-interview/generate-risks-ai',
    assessSingleThreat: '/api/assessments/:id/manufacturing-interview/assess-single-threat',
    generateNarrative: '/api/assessments/:id/manufacturing-interview/generate-narrative',
    getThreats: '/api/assessments/:id/manufacturing-interview/threats',
    calculateIPTheftRisk: '/api/assessments/:id/manufacturing-interview/calculate-ip-theft-risk',
    getControls: '/api/controls/manufacturing',
    getControlRecommendations: '/api/assessments/:id/manufacturing-interview/get-control-recommendations',
    getThreatBreakdown: '/api/assessments/:id/manufacturing-interview/get-threat-breakdown',
    prioritizeThreats: '/api/assessments/:id/manufacturing-interview/prioritize-threats',
    getQuestions: '/api/assessments/:id/manufacturing-interview/questions',
    getBenchmarks: '/api/assessments/:id/manufacturing-interview/industry-benchmarks',
    getZones: '/api/assessments/:id/manufacturing-interview/zones',
    saveResponses: '/api/assessments/:id/manufacturing-interview/save-responses',
  },
  testEndpoints: {
    sampleRequest: {
      interviewResponses: {
        facility_1: 'discrete_manufacturing',
        facility_2: '200,001 - 500,000 sq ft',
        facility_3: '$100 million - $500 million',
        facility_5: '101-300',
        facility_6: 'yes',
        facility_6a: ['Trade secret processes or methods', 'Proprietary product designs'],
        facility_8: 'no',
        production_1: 'yes',
        production_5: 'yes',
        ip_2: 'yes',
        ip_5: 'yes',
        personnel_1: 'Yes, comprehensive checks for all employees',
        personnel_3: 'yes',
        personnel_6: 'yes',
      },
      useAI: true,
    },
  },
};
