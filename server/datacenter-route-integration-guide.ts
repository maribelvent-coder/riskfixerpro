/**
 * Datacenter & Critical Infrastructure Route Integration Guide
 * 
 * This file provides the route definitions and integration instructions
 * for wiring the datacenter AI assessment into server/routes.ts
 * 
 * Datacenter-specific considerations:
 * - Uptime Institute Tier Standards (I-IV) compliance
 * - Power infrastructure security (UPS, generator, EPO)
 * - Cooling and environmental control protection
 * - Fire suppression system integrity (clean agent vs. water)
 * - Compliance certifications (SOC 2, ISO 27001, PCI-DSS)
 * - Customer SLA protection and downtime cost ($9,000/minute)
 * 
 * @author RiskFixer Team
 * @version 1.0
 * @see RiskFixer-Datacenter-Framework.md
 */

// ============================================================================
// IMPORTS TO ADD TO server/routes.ts
// ============================================================================

/*
Add these imports at the top of server/routes.ts:

import { 
  generateDatacenterRiskScenariosWithAI,
  assessSingleDatacenterThreat,
  generateDatacenterNarrativeSummary,
  getQuickSecurityScore,
  DatacenterAssessmentContext,
  DatacenterAIAssessmentResponse,
  DatacenterIncidentRecord,
  DatacenterComplianceProfile,
  UptimeMetrics,
} from './services/datacenter-ai-risk-assessment';

import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  calculateOverallSecurityScore,
  generateControlRecommendations,
  getThreatVulnerabilityBreakdown,
  DATACENTER_THREATS,
  THREAT_CONTROL_MAPPING,
  THREAT_QUESTION_MAP,
} from './services/datacenter-interview-mapper';

import {
  DATACENTER_INTERVIEW_QUESTIONS,
  DATACENTER_SECTION_METADATA,
  DATACENTER_SECTIONS,
  DATACENTER_THREATS as DATACENTER_THREAT_IDS,
  DATACENTER_CONTROLS,
} from './services/datacenter-interview-questionnaire';
*/

// ============================================================================
// ROUTE DEFINITIONS TO ADD
// ============================================================================

/**
 * Route: POST /api/assessments/:id/datacenter-interview/generate-risks-ai
 * 
 * Generates risk scenarios from datacenter interview responses using T×V×I formula
 * with GPT-4 AI assessment and algorithmic fallback.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   useAI?: boolean,                          // Default true
 *   photoFindings?: string[],                 // GPT-4V photo analysis results
 *   incidentHistory?: DatacenterIncidentRecord[],
 *   complianceRequirements?: DatacenterComplianceProfile,
 *   uptimeMetrics?: UptimeMetrics,
 *   facilityName?: string
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
 *   overallSecurityPosture: string,
 *   aiConfidence: 'high' | 'medium' | 'low' | 'fallback',
 *   processingTimeMs: number
 * }
 */

const datacenterGenerateRisksAIRoute = `
app.post('/api/assessments/:id/datacenter-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true, 
      photoFindings, 
      incidentHistory,
      complianceRequirements,
      uptimeMetrics,
      facilityName
    } = req.body;
    
    // Validate assessment exists and is datacenter type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'datacenter' && assessment.facilityType !== 'datacenter') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Datacenter assessments only.' 
      });
    }
    
    // Generate risk scenarios using AI with algorithmic fallback
    const result = await generateDatacenterRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { 
        useAI, 
        photoFindings, 
        incidentHistory,
        complianceRequirements,
        uptimeMetrics,
        facilityName
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating datacenter risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/datacenter-interview/assess-single-threat
 * 
 * Assess a single datacenter threat using AI (for testing or incremental assessment).
 * 
 * Request Body:
 * {
 *   threatId: string,              // e.g., 'power_failure_extended', 'insider_threat_privileged_access'
 *   interviewResponses: Record<string, any>,
 *   useAI?: boolean                // Default true
 * }
 * 
 * Response: DatacenterAIAssessmentResponse
 */

const datacenterAssessSingleThreatRoute = `
app.post('/api/assessments/:id/datacenter-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    // Validate threatId exists
    const validThreat = DATACENTER_THREATS.find(t => t.id === threatId);
    if (!validThreat) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validThreats: DATACENTER_THREATS.map(t => t.id)
      });
    }
    
    const result = await assessSingleDatacenterThreat(threatId, interviewResponses, { useAI });
    
    res.json(result);
  } catch (error) {
    console.error('Error assessing single datacenter threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/datacenter-interview/generate-narrative
 * 
 * Generate AI narrative report sections for datacenter assessment.
 * 
 * Request Body:
 * {
 *   results: DatacenterAIAssessmentResponse[],
 *   interviewResponses: Record<string, any>,
 *   facilityName?: string
 * }
 * 
 * Response:
 * {
 *   narrative: string
 * }
 */

const datacenterGenerateNarrativeRoute = `
app.post('/api/assessments/:id/datacenter-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, facilityName } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context: DatacenterAssessmentContext = {
      assessmentId: parseInt(id),
      interviewResponses: interviewResponses || {},
      facilityName,
    };
    
    const narrative = await generateDatacenterNarrativeSummary(results, context);
    
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating datacenter narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/datacenter-interview/threats
 * 
 * Returns the list of datacenter-specific threats for the interview workflow.
 */

const datacenterThreatsRoute = `
app.get('/api/assessments/:id/datacenter-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: DATACENTER_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode,
        description: t.description,
      })),
      totalThreats: DATACENTER_THREATS.length,
      threatCategories: [...new Set(DATACENTER_THREATS.map(t => t.category))],
    });
  } catch (error) {
    console.error('Error fetching datacenter threats:', error);
    res.status(500).json({ error: 'Failed to fetch datacenter threats' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/datacenter-interview/calculate-uptime-risk
 * 
 * Calculate real-time uptime and security risk score during interview.
 * Provides immediate feedback on security posture aligned with Uptime Institute Tier Standards.
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
 *   securityPosture: string,         // Strong/Adequate/Moderate/Weak/Critical
 *   tierClassification: string,      // I/II/III/IV/Unknown
 *   keyFindings: string[],
 *   strengths: string[],
 *   categoryScores: Record<string, number>,
 *   complianceStatus: {
 *     soc2Ready: boolean,
 *     iso27001Ready: boolean,
 *     pciDssReady: boolean,
 *     gaps: string[]
 *   },
 *   infrastructureHealth: {
 *     powerRedundancy: string,
 *     coolingRedundancy: string,
 *     fireProtection: string,
 *     accessControl: string
 *   }
 * }
 */

const datacenterUptimeRiskRoute = `
app.post('/api/assessments/:id/datacenter-interview/calculate-uptime-risk', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    // Get quick security score
    const { score, grade, posture, topGaps } = getQuickSecurityScore(interviewResponses);
    
    // Determine tier classification
    const tierResponse = String(interviewResponses.dc_tier_classification || '').toLowerCase();
    let tierClassification = 'Unknown';
    if (tierResponse.includes('tier iv') || tierResponse.includes('tier 4')) tierClassification = 'IV';
    else if (tierResponse.includes('tier iii') || tierResponse.includes('tier 3')) tierClassification = 'III';
    else if (tierResponse.includes('tier ii') || tierResponse.includes('tier 2')) tierClassification = 'II';
    else if (tierResponse.includes('tier i') || tierResponse.includes('tier 1')) tierClassification = 'I';
    
    // Calculate category scores
    const categoryScores: Record<string, number> = {};
    
    // Access Control (0-100)
    let accessScore = 0;
    if (interviewResponses.dc_mantrap === 'yes') accessScore += 35;
    if (interviewResponses.dc_biometric === 'yes') accessScore += 30;
    if (interviewResponses.dc_access_logging === 'yes') accessScore += 20;
    if (interviewResponses.dc_visitor_mgmt === 'yes') accessScore += 15;
    categoryScores.accessControl = accessScore;
    
    // Power Infrastructure (0-100)
    let powerScore = 0;
    if (String(interviewResponses.dc_utility_feeds).toLowerCase().includes('dual')) powerScore += 30;
    if (String(interviewResponses.dc_generator_config).toLowerCase().includes('n+1') ||
        String(interviewResponses.dc_generator_config).toLowerCase().includes('2n')) powerScore += 30;
    if (String(interviewResponses.dc_fuel_capacity).includes('72')) powerScore += 20;
    if (interviewResponses.dc_epo_protection === 'yes') powerScore += 20;
    categoryScores.powerInfrastructure = powerScore;
    
    // Cooling & Environmental (0-100)
    let coolingScore = 0;
    if (interviewResponses.dc_cooling_redundancy === 'yes') coolingScore += 40;
    if (interviewResponses.dc_temp_monitoring === 'yes') coolingScore += 30;
    if (interviewResponses.dc_leak_detection === 'yes') coolingScore += 30;
    categoryScores.coolingEnvironmental = coolingScore;
    
    // Fire Suppression (0-100)
    let fireScore = 0;
    if (interviewResponses.dc_vesda === 'yes') fireScore += 35;
    if (String(interviewResponses.dc_suppression_type).toLowerCase().includes('clean')) fireScore += 40;
    if (interviewResponses.dc_fire_testing === 'yes' || 
        String(interviewResponses.dc_fire_testing).includes('quarterly')) fireScore += 25;
    categoryScores.fireSuppression = fireScore;
    
    // Surveillance (0-100)
    let surveillanceScore = 0;
    if (interviewResponses.dc_noc_soc === 'yes') surveillanceScore += 35;
    if (interviewResponses.dc_cctv_hands_on === 'yes') surveillanceScore += 25;
    if (String(interviewResponses.dc_video_retention).includes('90')) surveillanceScore += 25;
    if (interviewResponses.dc_realtime_monitoring === 'yes') surveillanceScore += 15;
    categoryScores.surveillance = surveillanceScore;
    
    // Personnel Security (0-100)
    let personnelScore = 0;
    if (interviewResponses.dc_background_checks === 'yes') personnelScore += 35;
    if (interviewResponses.dc_security_training === 'yes') personnelScore += 25;
    if (interviewResponses.dc_termination_procedures === 'yes') personnelScore += 20;
    if (interviewResponses.dc_two_person_rule === 'yes') personnelScore += 20;
    categoryScores.personnelSecurity = personnelScore;
    
    // Compliance readiness
    const soc2Ready = interviewResponses.dc_background_checks === 'yes' &&
                      interviewResponses.dc_access_logging === 'yes' &&
                      String(interviewResponses.dc_access_review).includes('quarterly');
    const iso27001Ready = soc2Ready && 
                          interviewResponses.dc_security_training === 'yes' &&
                          interviewResponses.dc_change_mgmt === 'yes';
    const pciDssReady = interviewResponses.dc_cctv_hands_on === 'yes' &&
                        String(interviewResponses.dc_video_retention).includes('90') &&
                        interviewResponses.dc_background_checks === 'yes';
    
    const complianceGaps: string[] = [];
    if (!interviewResponses.dc_background_checks) complianceGaps.push('Background checks required for SOC 2/PCI-DSS');
    if (!interviewResponses.dc_access_logging) complianceGaps.push('Access logging required for SOC 2');
    if (!String(interviewResponses.dc_video_retention).includes('90')) complianceGaps.push('90-day video retention required for PCI-DSS');
    if (!interviewResponses.dc_change_mgmt) complianceGaps.push('Change management required for ISO 27001');
    
    // Infrastructure health assessment
    let powerRedundancy = 'Unknown';
    const generatorConfig = String(interviewResponses.dc_generator_config || '').toLowerCase();
    if (generatorConfig.includes('2n')) powerRedundancy = 'Excellent (2N)';
    else if (generatorConfig.includes('n+1')) powerRedundancy = 'Good (N+1)';
    else if (generatorConfig.includes('n')) powerRedundancy = 'Basic (N)';
    else powerRedundancy = 'Unknown/Not specified';
    
    let coolingRedundancy = interviewResponses.dc_cooling_redundancy === 'yes' ? 'Redundant' : 'Non-redundant';
    
    let fireProtection = 'Unknown';
    const suppressionType = String(interviewResponses.dc_suppression_type || '').toLowerCase();
    if (suppressionType.includes('clean') || suppressionType.includes('fm-200') || 
        suppressionType.includes('novec') || suppressionType.includes('inergen')) {
      fireProtection = 'Clean Agent (Best Practice)';
    } else if (suppressionType.includes('water') || suppressionType.includes('sprinkler')) {
      fireProtection = 'Water/Sprinkler (Risk to Equipment)';
    } else {
      fireProtection = 'Unknown/Not specified';
    }
    
    let accessControl = 'Unknown';
    if (interviewResponses.dc_mantrap === 'yes' && interviewResponses.dc_biometric === 'yes') {
      accessControl = 'Excellent (Man-trap + Biometric)';
    } else if (interviewResponses.dc_biometric === 'yes') {
      accessControl = 'Good (Biometric)';
    } else if (interviewResponses.dc_mantrap === 'yes') {
      accessControl = 'Good (Man-trap)';
    } else {
      accessControl = 'Basic/Unknown';
    }
    
    // Build key findings
    const keyFindings: string[] = [...topGaps];
    if (tierClassification === 'I' || tierClassification === 'Unknown') {
      keyFindings.push('Low/unknown tier classification limits redundancy expectations');
    }
    if (powerScore < 50) {
      keyFindings.push('Power infrastructure has significant gaps');
    }
    if (fireProtection.includes('Water')) {
      keyFindings.push('Water-based suppression creates equipment damage risk');
    }
    
    // Build strengths
    const strengths: string[] = [];
    if (accessScore >= 70) strengths.push('Strong access control measures');
    if (powerScore >= 70) strengths.push('Robust power infrastructure redundancy');
    if (coolingScore >= 70) strengths.push('Good cooling and environmental controls');
    if (fireScore >= 70) strengths.push('Appropriate fire protection');
    if (surveillanceScore >= 70) strengths.push('Comprehensive surveillance and monitoring');
    if (personnelScore >= 70) strengths.push('Strong personnel security program');
    if (interviewResponses.dc_soc2 === 'yes') strengths.push('SOC 2 Type II certified');
    if (interviewResponses.dc_iso27001 === 'yes') strengths.push('ISO 27001 certified');
    
    res.json({
      securityScore: score,
      securityGrade: grade,
      securityPosture: posture,
      tierClassification,
      keyFindings: keyFindings.slice(0, 5),
      strengths: strengths.slice(0, 5),
      categoryScores,
      complianceStatus: {
        soc2Ready,
        iso27001Ready,
        pciDssReady,
        gaps: complianceGaps,
      },
      infrastructureHealth: {
        powerRedundancy,
        coolingRedundancy,
        fireProtection,
        accessControl,
      }
    });
  } catch (error) {
    console.error('Error calculating uptime risk:', error);
    res.status(500).json({ error: 'Failed to calculate uptime risk' });
  }
});
`;

/**
 * Route: GET /api/controls/datacenter
 * 
 * Returns all datacenter-specific security controls for recommendation engine.
 */

const datacenterControlsRoute = `
app.get('/api/controls/datacenter', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'datacenter')
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
    console.error('Error fetching datacenter controls:', error);
    res.status(500).json({ error: 'Failed to fetch datacenter controls' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/datacenter-interview/get-control-recommendations
 * 
 * Get control recommendations based on interview responses and threat priorities.
 * Uses threat-specific control mapping from datacenter-interview-mapper.
 * 
 * Request Body:
 * {
 *   interviewResponses: Record<string, any>,
 *   priorityThreats?: string[],   // Optional: focus on specific threats
 *   includeRationale?: boolean    // Include why each control is recommended
 * }
 */

const datacenterControlRecommendationsRoute = `
app.post('/api/assessments/:id/datacenter-interview/get-control-recommendations', async (req, res) => {
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
        const controls = THREAT_CONTROL_MAPPING[threatId] || [];
        threatSpecificControls.push({
          threatId,
          controls: controls.map(c => ({
            controlId: c,
            controlName: c.replace(/_/g, ' ').replace(/\\b\\w/g, (char: string) => char.toUpperCase()),
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
          standardsReference: getStandardsReferenceForControl(controlId),
        };
      })
    );
    
    res.json({
      total: enrichedRecommendations.length,
      recommendations: enrichedRecommendations,
      threatSpecificControls: threatSpecificControls.length > 0 ? threatSpecificControls : undefined,
    });
  } catch (error) {
    console.error('Error getting datacenter control recommendations:', error);
    res.status(500).json({ error: 'Failed to get control recommendations' });
  }
});

// Helper function for standards references
function getStandardsReferenceForControl(controlId: string): string {
  const references: Record<string, string> = {
    // Access Control
    mantrap_portals: 'TIA-942 Section 5.3.3, SOC 2 CC6.4',
    biometric_authentication: 'SOC 2 CC6.1, ISO 27001 A.9.4',
    multi_factor_access: 'SOC 2 CC6.1, PCI-DSS 8.3',
    visitor_management_system: 'SOC 2 CC6.4, TIA-942',
    access_logging_audit: 'SOC 2 CC6.1, PCI-DSS 10.2',
    cabinet_level_locks: 'PCI-DSS 9.1, SOC 2 CC6.4',
    
    // Power
    redundant_utility_feeds: 'Uptime Institute Tier III+, TIA-942',
    ups_n_plus_1: 'Uptime Institute Tier Standards',
    generator_automatic_transfer: 'NFPA 110, TIA-942 Section 8',
    generator_fuel_72_hours: 'Uptime Institute Tier III+',
    epo_protection: 'TIA-942 Section 8.3',
    
    // Cooling
    cooling_redundancy: 'Uptime Institute Tier Standards',
    temperature_humidity_monitoring: 'ASHRAE Guidelines, TIA-942',
    water_leak_detection: 'NFPA 75, TIA-942 Section 10',
    
    // Fire
    vesda_early_detection: 'NFPA 75/76, TIA-942 Section 10',
    clean_agent_suppression: 'NFPA 75/76, TIA-942',
    fire_system_testing_quarterly: 'NFPA 72, NFPA 25',
    
    // Surveillance
    noc_soc_24x7: 'SOC 2 CC7.2, TIA-942',
    cctv_hands_on_servers: 'PCI-DSS 9.1, SOC 2 CC6.4',
    video_retention_90_days: 'PCI-DSS 9.1.1, SOC 2',
    
    // Personnel
    background_checks_comprehensive: 'SOC 2 CC1.4, PCI-DSS 12.7',
    security_training_annual: 'SOC 2 CC2.2, ISO 27001 A.7.2',
    termination_procedures: 'SOC 2 CC6.2, ISO 27001 A.7.3',
  };
  return references[controlId] || 'Industry Best Practice';
}
`;

/**
 * Route: POST /api/assessments/:id/datacenter-interview/get-threat-breakdown
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

const datacenterThreatBreakdownRoute = `
app.post('/api/assessments/:id/datacenter-interview/get-threat-breakdown', async (req, res) => {
  try {
    const { interviewResponses, threatId } = req.body;
    
    if (!interviewResponses || !threatId) {
      return res.status(400).json({ error: 'interviewResponses and threatId are required' });
    }
    
    // Get vulnerability breakdown
    const breakdown = getThreatVulnerabilityBreakdown(interviewResponses, threatId);
    
    // Get threat details
    const threat = DATACENTER_THREATS.find(t => t.id === threatId);
    
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
        description: threat.description,
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
      recommendedControls: THREAT_CONTROL_MAPPING[threatId] || [],
    });
  } catch (error) {
    console.error('Error getting threat breakdown:', error);
    res.status(500).json({ error: 'Failed to get threat breakdown' });
  }
});
`;

/**
 * Route: GET /api/assessments/:id/datacenter-interview/industry-benchmarks
 * 
 * Returns datacenter industry benchmarks and Uptime Institute standards.
 */

const datacenterBenchmarksRoute = `
app.get('/api/assessments/:id/datacenter-interview/industry-benchmarks', async (req, res) => {
  try {
    res.json({
      uptimeInstituteTiers: {
        tierI: {
          name: 'Tier I - Basic Capacity',
          uptime: '99.671%',
          annualDowntime: '28.8 hours',
          redundancy: 'N (no redundancy)',
          securityRequirements: 'Basic physical security',
        },
        tierII: {
          name: 'Tier II - Redundant Capacity',
          uptime: '99.741%',
          annualDowntime: '22 hours',
          redundancy: 'N+1 for critical components',
          securityRequirements: 'Enhanced access control, basic monitoring',
        },
        tierIII: {
          name: 'Tier III - Concurrently Maintainable',
          uptime: '99.982%',
          annualDowntime: '1.6 hours',
          redundancy: 'N+1 full system redundancy',
          securityRequirements: 'Multi-factor access, 24/7 monitoring, biometric authentication',
        },
        tierIV: {
          name: 'Tier IV - Fault Tolerant',
          uptime: '99.995%',
          annualDowntime: '26 minutes',
          redundancy: '2N (full dual redundancy)',
          securityRequirements: 'Man-trap entry, biometric, 24/7 NOC/SOC, comprehensive CCTV',
        },
      },
      downtimeCosts: {
        averagePerMinute: '$9,000',
        averagePerHour: '$540,000',
        averagePerIncident: '$740,357',
        financialServicesPerHour: '$5,600,000+',
        healthcarePerHour: '$690,000+',
        source: 'Ponemon Institute / Uptime Institute',
      },
      complianceRequirements: {
        soc2TypeII: {
          description: 'Service Organization Control 2',
          keyRequirements: [
            'Unique authentication per user',
            'Access logging and review',
            'Background checks for personnel',
            'Quarterly access reviews',
            'Incident response procedures',
          ],
        },
        iso27001: {
          description: 'Information Security Management System',
          keyRequirements: [
            'Risk assessment methodology',
            'Security awareness training',
            'Change management process',
            'Business continuity planning',
            'Regular security audits',
          ],
        },
        pciDss: {
          description: 'Payment Card Industry Data Security Standard',
          keyRequirements: [
            '90-day minimum video retention',
            'Unique user authentication',
            'Badge-in/badge-out logging',
            'Background checks',
            'Quarterly penetration testing',
          ],
        },
      },
      securityBenchmarks: {
        accessControl: {
          baseline: 'Badge + PIN minimum',
          good: 'Biometric authentication',
          excellent: 'Man-trap with dual biometric',
        },
        videoRetention: {
          minimum: '30 days',
          recommended: '90 days',
          pciDssRequired: '90 days minimum',
        },
        accessReview: {
          minimum: 'Annual',
          recommended: 'Quarterly',
          soc2Required: 'Quarterly',
        },
        backgroundChecks: {
          required: 'All personnel with datacenter access',
          scope: 'Criminal, employment, education verification',
        },
      },
      threatStatistics: {
        insiderThreatInvolvement: '60%+ of sabotage involves insiders (FBI)',
        tailgatingIntrusions: '30%+ of physical intrusions involve tailgating',
        powerOutageCause: 'UPS failure is #1 cause of datacenter outages',
        humanError: '70% of outages have human error as contributing factor',
      },
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/datacenter-interview/prioritize-threats
 * 
 * Get prioritized list of threats based on interview responses.
 */

const datacenterPrioritizeThreatsRoute = `
app.post('/api/assessments/:id/datacenter-interview/prioritize-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    // Calculate risk for all threats
    const allThreats = DATACENTER_THREATS.map(threat => {
      const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threat.id);
      const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threat.id);
      const impact = calculateImpactFromInterview(interviewResponses, threat.id);
      const inherentRisk = threatLikelihood * vulnerability * impact;
      const normalizedRisk = (inherentRisk / 125) * 100;
      
      let riskLevel: string;
      if (normalizedRisk >= 75) riskLevel = 'critical';
      else if (normalizedRisk >= 50) riskLevel = 'high';
      else if (normalizedRisk >= 25) riskLevel = 'medium';
      else riskLevel = 'low';
      
      return {
        id: threat.id,
        name: threat.name,
        category: threat.category,
        threatLikelihood,
        vulnerability,
        impact,
        inherentRisk,
        normalizedRisk,
        riskLevel,
      };
    }).sort((a, b) => b.normalizedRisk - a.normalizedRisk);
    
    const highestRisks = allThreats.filter(t => t.riskLevel === 'critical' || t.riskLevel === 'high');
    
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
 * Route: GET /api/assessments/:id/datacenter-interview/questions
 * 
 * Returns the datacenter interview questions with metadata.
 */

const datacenterQuestionsRoute = `
app.get('/api/assessments/:id/datacenter-interview/questions', async (req, res) => {
  try {
    res.json({
      questions: DATACENTER_INTERVIEW_QUESTIONS,
      sections: DATACENTER_SECTION_METADATA,
      sectionOrder: DATACENTER_SECTIONS,
      totalQuestions: DATACENTER_INTERVIEW_QUESTIONS.length,
      questionsBySection: DATACENTER_SECTIONS.reduce((acc, section) => {
        acc[section] = DATACENTER_INTERVIEW_QUESTIONS.filter(q => q.section === section).length;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching datacenter questions:', error);
    res.status(500).json({ error: 'Failed to fetch datacenter questions' });
  }
});
`;

/**
 * Route: POST /api/assessments/:id/datacenter-interview/quick-score
 * 
 * Get quick security score without full AI assessment.
 */

const datacenterQuickScoreRoute = `
app.post('/api/assessments/:id/datacenter-interview/quick-score', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const result = getQuickSecurityScore(interviewResponses);
    
    res.json(result);
  } catch (error) {
    console.error('Error calculating quick score:', error);
    res.status(500).json({ error: 'Failed to calculate quick score' });
  }
});
`;

// ============================================================================
// FULL ROUTE BLOCK TO COPY
// ============================================================================

export const DATACENTER_ROUTES_BLOCK = `
// ============================================================================
// DATACENTER & CRITICAL INFRASTRUCTURE AI INTERVIEW ROUTES
// ============================================================================

/**
 * Generate datacenter risk scenarios using AI with algorithmic fallback
 * Uses T×V×I formula (Threat × Vulnerability × Impact)
 */
app.post('/api/assessments/:id/datacenter-interview/generate-risks-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      interviewResponses, 
      useAI = true, 
      photoFindings, 
      incidentHistory,
      complianceRequirements,
      uptimeMetrics,
      facilityName
    } = req.body;
    
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, parseInt(id))
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    if (assessment.templateId !== 'datacenter' && assessment.facilityType !== 'datacenter') {
      return res.status(400).json({ 
        error: 'Invalid assessment type. This endpoint is for Datacenter assessments only.' 
      });
    }
    
    const result = await generateDatacenterRiskScenariosWithAI(
      parseInt(id), 
      interviewResponses,
      { useAI, photoFindings, incidentHistory, complianceRequirements, uptimeMetrics, facilityName }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error generating datacenter risk scenarios:', error);
    res.status(500).json({ 
      error: 'Failed to generate risk scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Assess a single datacenter threat (for testing or incremental assessment)
 */
app.post('/api/assessments/:id/datacenter-interview/assess-single-threat', async (req, res) => {
  try {
    const { threatId, interviewResponses, useAI = true } = req.body;
    
    if (!threatId) {
      return res.status(400).json({ error: 'threatId is required' });
    }
    
    const validThreat = DATACENTER_THREATS.find(t => t.id === threatId);
    if (!validThreat) {
      return res.status(400).json({ 
        error: 'Invalid threatId',
        validThreats: DATACENTER_THREATS.map(t => t.id)
      });
    }
    
    const result = await assessSingleDatacenterThreat(threatId, interviewResponses, { useAI });
    res.json(result);
  } catch (error) {
    console.error('Error assessing single datacenter threat:', error);
    res.status(500).json({ 
      error: 'Failed to assess threat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate AI narrative summary for datacenter assessment
 */
app.post('/api/assessments/:id/datacenter-interview/generate-narrative', async (req, res) => {
  try {
    const { id } = req.params;
    const { results, interviewResponses, facilityName } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }
    
    const context = {
      assessmentId: parseInt(id),
      interviewResponses: interviewResponses || {},
      facilityName,
    };
    
    const narrative = await generateDatacenterNarrativeSummary(results, context);
    res.json({ narrative });
  } catch (error) {
    console.error('Error generating datacenter narrative:', error);
    res.status(500).json({ error: 'Failed to generate narrative' });
  }
});

/**
 * Get datacenter threat definitions for interview workflow
 */
app.get('/api/assessments/:id/datacenter-interview/threats', async (req, res) => {
  try {
    res.json({
      threats: DATACENTER_THREATS.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        typicalLikelihood: t.typicalLikelihood,
        typicalImpact: t.typicalImpact,
        asisCode: t.asisCode,
        description: t.description,
      })),
      totalThreats: DATACENTER_THREATS.length,
    });
  } catch (error) {
    console.error('Error fetching datacenter threats:', error);
    res.status(500).json({ error: 'Failed to fetch datacenter threats' });
  }
});

/**
 * Calculate real-time uptime and security risk during interview
 */
app.post('/api/assessments/:id/datacenter-interview/calculate-uptime-risk', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const { score, grade, posture, topGaps } = getQuickSecurityScore(interviewResponses);
    
    // Tier classification
    const tierResponse = String(interviewResponses.dc_tier_classification || '').toLowerCase();
    let tierClassification = 'Unknown';
    if (tierResponse.includes('tier iv')) tierClassification = 'IV';
    else if (tierResponse.includes('tier iii')) tierClassification = 'III';
    else if (tierResponse.includes('tier ii')) tierClassification = 'II';
    else if (tierResponse.includes('tier i') && !tierResponse.includes('tier ii') && !tierResponse.includes('tier iv')) tierClassification = 'I';
    
    res.json({
      securityScore: score,
      securityGrade: grade,
      securityPosture: posture,
      tierClassification,
      topGaps,
    });
  } catch (error) {
    console.error('Error calculating uptime risk:', error);
    res.status(500).json({ error: 'Failed to calculate uptime risk' });
  }
});

/**
 * Get datacenter-specific security controls
 */
app.get('/api/controls/datacenter', async (req, res) => {
  try {
    const controls = await db.query.securityControls.findMany({
      where: eq(securityControls.facilityType, 'datacenter')
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
    console.error('Error fetching datacenter controls:', error);
    res.status(500).json({ error: 'Failed to fetch datacenter controls' });
  }
});

/**
 * Get control recommendations for datacenter
 */
app.post('/api/assessments/:id/datacenter-interview/get-control-recommendations', async (req, res) => {
  try {
    const { interviewResponses, priorityThreats } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const recommendations = generateControlRecommendations(
      interviewResponses, 
      priorityThreats?.[0]
    );
    
    res.json({
      total: recommendations.length,
      recommendations: recommendations.map(controlId => ({
        controlId,
        controlName: controlId.replace(/_/g, ' ').replace(/\\b\\w/g, (c: string) => c.toUpperCase()),
      })),
    });
  } catch (error) {
    console.error('Error getting control recommendations:', error);
    res.status(500).json({ error: 'Failed to get control recommendations' });
  }
});

/**
 * Get threat vulnerability breakdown
 */
app.post('/api/assessments/:id/datacenter-interview/get-threat-breakdown', async (req, res) => {
  try {
    const { interviewResponses, threatId } = req.body;
    
    if (!interviewResponses || !threatId) {
      return res.status(400).json({ error: 'interviewResponses and threatId are required' });
    }
    
    const threat = DATACENTER_THREATS.find(t => t.id === threatId);
    const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
    const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threatId);
    const impact = calculateImpactFromInterview(interviewResponses, threatId);
    const inherentRisk = threatLikelihood * vulnerability * impact;
    
    res.json({
      threat: threat ? { id: threat.id, name: threat.name, category: threat.category } : null,
      scores: {
        threatLikelihood,
        vulnerability,
        impact,
        inherentRisk,
        normalizedRisk: (inherentRisk / 125) * 100,
      },
      recommendedControls: THREAT_CONTROL_MAPPING[threatId] || [],
    });
  } catch (error) {
    console.error('Error getting threat breakdown:', error);
    res.status(500).json({ error: 'Failed to get threat breakdown' });
  }
});

/**
 * Get prioritized threat list
 */
app.post('/api/assessments/:id/datacenter-interview/prioritize-threats', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const allThreats = DATACENTER_THREATS.map(threat => {
      const threatLikelihood = calculateThreatLikelihoodFromInterview(interviewResponses, threat.id);
      const vulnerability = calculateVulnerabilityFromInterview(interviewResponses, threat.id);
      const impact = calculateImpactFromInterview(interviewResponses, threat.id);
      const inherentRisk = threatLikelihood * vulnerability * impact;
      const normalizedRisk = (inherentRisk / 125) * 100;
      
      return {
        id: threat.id,
        name: threat.name,
        category: threat.category,
        normalizedRisk,
        riskLevel: normalizedRisk >= 75 ? 'critical' : normalizedRisk >= 50 ? 'high' : normalizedRisk >= 25 ? 'medium' : 'low',
      };
    }).sort((a, b) => b.normalizedRisk - a.normalizedRisk);
    
    res.json({
      allThreats,
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

/**
 * Get interview questions
 */
app.get('/api/assessments/:id/datacenter-interview/questions', async (req, res) => {
  try {
    res.json({
      questions: DATACENTER_INTERVIEW_QUESTIONS,
      sections: DATACENTER_SECTION_METADATA,
      sectionOrder: DATACENTER_SECTIONS,
      totalQuestions: DATACENTER_INTERVIEW_QUESTIONS.length,
    });
  } catch (error) {
    console.error('Error fetching datacenter questions:', error);
    res.status(500).json({ error: 'Failed to fetch datacenter questions' });
  }
});

/**
 * Get industry benchmarks
 */
app.get('/api/assessments/:id/datacenter-interview/industry-benchmarks', async (req, res) => {
  try {
    res.json({
      downtimeCosts: {
        averagePerMinute: '$9,000',
        averagePerHour: '$540,000',
      },
      uptimeTiers: {
        tierI: '99.671% (28.8 hours downtime/year)',
        tierII: '99.741% (22 hours downtime/year)',
        tierIII: '99.982% (1.6 hours downtime/year)',
        tierIV: '99.995% (26 minutes downtime/year)',
      },
      threatStatistics: {
        insiderInvolvement: '60%+ of sabotage involves insiders',
        tailgating: '30%+ of intrusions involve tailgating',
      },
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});

/**
 * Quick security score
 */
app.post('/api/assessments/:id/datacenter-interview/quick-score', async (req, res) => {
  try {
    const { interviewResponses } = req.body;
    
    if (!interviewResponses) {
      return res.status(400).json({ error: 'interviewResponses is required' });
    }
    
    const result = getQuickSecurityScore(interviewResponses);
    res.json(result);
  } catch (error) {
    console.error('Error calculating quick score:', error);
    res.status(500).json({ error: 'Failed to calculate quick score' });
  }
});
`;

// ============================================================================
// REACT COMPONENT EXAMPLES
// ============================================================================

/**
 * Example React component for real-time uptime risk display
 */
const UptimeRiskDashboardComponent = `
interface UptimeRiskDashboardProps {
  securityScore: number;
  securityGrade: string;
  tierClassification: string;
  securityPosture: string;
  complianceStatus: {
    soc2Ready: boolean;
    iso27001Ready: boolean;
    pciDssReady: boolean;
  };
}

const UptimeRiskDashboard: React.FC<UptimeRiskDashboardProps> = ({
  securityScore,
  securityGrade,
  tierClassification,
  securityPosture,
  complianceStatus,
}) => {
  const getPostureColor = (posture: string) => {
    switch (posture.toLowerCase()) {
      case 'strong': return 'bg-green-500';
      case 'adequate': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'weak': return 'bg-orange-500';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'IV': return 'bg-green-600 text-white';
      case 'III': return 'bg-blue-600 text-white';
      case 'II': return 'bg-yellow-500 text-yellow-900';
      case 'I': return 'bg-orange-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4 p-4 bg-white rounded-lg shadow">
      {/* Security Score */}
      <div className="text-center">
        <div className="text-4xl font-bold">{securityScore}</div>
        <div className="text-2xl font-semibold text-gray-600">Grade: {securityGrade}</div>
        <div className="text-sm text-gray-500">Security Score</div>
      </div>

      {/* Tier Classification */}
      <div className="text-center">
        <div className={\`inline-block px-4 py-2 rounded-lg font-semibold \${getTierColor(tierClassification)}\`}>
          {tierClassification === 'Unknown' ? 'Not Classified' : \`Tier \${tierClassification}\`}
        </div>
        <div className="text-sm text-gray-500 mt-2">Tier Classification</div>
      </div>

      {/* Security Posture */}
      <div className="text-center">
        <div className={\`inline-block px-4 py-2 rounded-full text-white font-semibold \${getPostureColor(securityPosture)}\`}>
          {securityPosture.toUpperCase()}
        </div>
        <div className="text-sm text-gray-500 mt-2">Security Posture</div>
      </div>

      {/* Compliance Status */}
      <div className="text-center col-span-2">
        <div className="flex justify-center gap-2">
          <span className={\`px-2 py-1 rounded text-xs font-medium \${complianceStatus.soc2Ready ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
            SOC 2 {complianceStatus.soc2Ready ? '✓' : '✗'}
          </span>
          <span className={\`px-2 py-1 rounded text-xs font-medium \${complianceStatus.iso27001Ready ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
            ISO 27001 {complianceStatus.iso27001Ready ? '✓' : '✗'}
          </span>
          <span className={\`px-2 py-1 rounded text-xs font-medium \${complianceStatus.pciDssReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
            PCI-DSS {complianceStatus.pciDssReady ? '✓' : '✗'}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-2">Compliance Readiness</div>
      </div>
    </div>
  );
};
`;

/**
 * Example React component for infrastructure health display
 */
const InfrastructureHealthComponent = `
interface InfrastructureHealthProps {
  powerRedundancy: string;
  coolingRedundancy: string;
  fireProtection: string;
  accessControl: string;
}

const InfrastructureHealth: React.FC<InfrastructureHealthProps> = ({
  powerRedundancy,
  coolingRedundancy,
  fireProtection,
  accessControl,
}) => {
  const getHealthColor = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes('excellent') || lower.includes('2n') || lower.includes('best')) return 'text-green-600';
    if (lower.includes('good') || lower.includes('n+1') || lower.includes('redundant')) return 'text-blue-600';
    if (lower.includes('basic') || lower.includes('non-redundant')) return 'text-yellow-600';
    if (lower.includes('risk') || lower.includes('water')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getIcon = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes('excellent') || lower.includes('2n') || lower.includes('best')) return '✓✓';
    if (lower.includes('good') || lower.includes('n+1') || lower.includes('redundant')) return '✓';
    if (lower.includes('basic') || lower.includes('non-redundant')) return '○';
    if (lower.includes('risk') || lower.includes('water')) return '⚠';
    return '?';
  };

  const items = [
    { label: 'Power Redundancy', value: powerRedundancy },
    { label: 'Cooling Redundancy', value: coolingRedundancy },
    { label: 'Fire Protection', value: fireProtection },
    { label: 'Access Control', value: accessControl },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Infrastructure Health</h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-gray-600">{item.label}</span>
            <span className={\`font-medium \${getHealthColor(item.value)}\`}>
              {getIcon(item.value)} {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
`;

/**
 * Example React component for threat risk matrix
 */
const ThreatRiskMatrixComponent = `
interface ThreatRisk {
  id: string;
  name: string;
  category: string;
  normalizedRisk: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

interface ThreatRiskMatrixProps {
  threats: ThreatRisk[];
}

const ThreatRiskMatrix: React.FC<ThreatRiskMatrixProps> = ({ threats }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-yellow-900';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'physical intrusion': return '🚪';
      case 'insider threat': return '👤';
      case 'infrastructure': return '⚡';
      case 'life safety': return '🔥';
      case 'environmental': return '🌡️';
      case 'theft': return '📦';
      case 'sabotage': return '⚠️';
      case 'cyber': return '💻';
      case 'terrorism': return '🎯';
      default: return '•';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Threat Risk Assessment</h3>
      <div className="space-y-2">
        {threats.slice(0, 10).map(threat => (
          <div key={threat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <span>{getCategoryIcon(threat.category)}</span>
              <span className="font-medium">{threat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{threat.normalizedRisk.toFixed(0)}%</span>
              <span className={\`px-2 py-1 rounded text-xs font-semibold \${getRiskColor(threat.riskLevel)}\`}>
                {threat.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
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
 * □ Datacenter controls are seeded in database (run datacenter-controls-seed.sql)
 * □ risk_scenarios table has ai_evidence, ai_confidence columns
 * □ Routes respond correctly with test data
 * □ All 15 datacenter threat calculations produce valid scores (1-5)
 * □ Threat-specific vulnerability calculations work correctly
 * □ Security score calculation covers all 6 categories
 * □ Control recommendations map correctly to threats
 * □ AI fallback works when OpenAI API fails
 * □ Error handling works for missing/invalid data
 * □ Narrative generation produces coherent summary
 * □ Tier classification detection works correctly
 * □ Compliance readiness calculation is accurate
 * □ Downtime cost context is included in AI prompts
 * 
 * Test Scenarios:
 * 
 * 1. Tier IV datacenter (all controls implemented)
 *    Expected: High security score, Grade A, Strong posture
 * 
 * 2. Tier I datacenter (minimal controls)
 *    Expected: Low security score, Grade D/F, Weak/Critical posture
 * 
 * 3. SOC 2 compliant facility (required controls present)
 *    Expected: SOC 2 Ready = true
 * 
 * 4. Water sprinkler fire suppression
 *    Expected: Fire protection flagged as "Risk to Equipment"
 * 
 * 5. AI failure scenario (mock OpenAI failure)
 *    Expected: Algorithmic fallback with mode='algorithmic'
 * 
 * 6. Empty interview (no responses)
 *    Expected: Baseline scores (3 for each T/V/I), Unknown tier
 */

// ============================================================================
// API DOCUMENTATION
// ============================================================================

export const API_DOCUMENTATION = {
  baseUrl: '/api/assessments/:id/datacenter-interview',
  endpoints: [
    {
      method: 'POST',
      path: '/generate-risks-ai',
      description: 'Generate all risk scenarios using AI with algorithmic fallback',
      requestBody: {
        interviewResponses: 'Record<string, any> - Interview question responses',
        useAI: 'boolean (default: true) - Whether to use AI assessment',
        photoFindings: 'string[] (optional) - GPT-4V photo analysis results',
        incidentHistory: 'DatacenterIncidentRecord[] (optional) - Historical incidents',
        complianceRequirements: 'DatacenterComplianceProfile (optional) - Compliance certifications',
        uptimeMetrics: 'UptimeMetrics (optional) - Uptime tracking data',
        facilityName: 'string (optional) - Facility name for reports',
      },
      response: 'DatacenterGeneratedScenarioResult',
    },
    {
      method: 'POST',
      path: '/assess-single-threat',
      description: 'Assess a single threat (for testing or real-time feedback)',
      requestBody: {
        threatId: 'string - Datacenter threat identifier',
        interviewResponses: 'Record<string, any> - Interview question responses',
        useAI: 'boolean (default: true)',
      },
      response: 'DatacenterAIAssessmentResponse',
    },
    {
      method: 'POST',
      path: '/calculate-uptime-risk',
      description: 'Real-time security score and compliance readiness calculation',
      requestBody: {
        interviewResponses: 'Record<string, any>',
      },
      response: 'Security score, tier classification, compliance status, infrastructure health',
    },
    {
      method: 'POST',
      path: '/get-control-recommendations',
      description: 'Get prioritized control recommendations',
      requestBody: {
        interviewResponses: 'Record<string, any>',
        priorityThreats: 'string[] (optional) - Focus on specific threats',
      },
      response: 'Control recommendations with standards references',
    },
    {
      method: 'POST',
      path: '/get-threat-breakdown',
      description: 'Get detailed vulnerability breakdown for a threat',
      requestBody: {
        interviewResponses: 'Record<string, any>',
        threatId: 'string',
      },
      response: 'T/V/I scores, question-level breakdown, recommended controls',
    },
    {
      method: 'POST',
      path: '/prioritize-threats',
      description: 'Get threats sorted by risk level',
      requestBody: {
        interviewResponses: 'Record<string, any>',
      },
      response: 'All threats sorted by inherent risk, summary counts',
    },
    {
      method: 'GET',
      path: '/threats',
      description: 'Get datacenter threat definitions',
      response: 'Array of 15 datacenter threats with metadata',
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
      description: 'Get Uptime Institute standards and datacenter statistics',
      response: 'Tier requirements, downtime costs, threat statistics',
    },
    {
      method: 'POST',
      path: '/quick-score',
      description: 'Get quick security score without full AI assessment',
      requestBody: {
        interviewResponses: 'Record<string, any>',
      },
      response: 'Score, grade, posture, top gaps',
    },
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  DATACENTER_ROUTES_BLOCK,
  API_DOCUMENTATION,
  routes: {
    generateRisksAI: '/api/assessments/:id/datacenter-interview/generate-risks-ai',
    assessSingleThreat: '/api/assessments/:id/datacenter-interview/assess-single-threat',
    generateNarrative: '/api/assessments/:id/datacenter-interview/generate-narrative',
    getThreats: '/api/assessments/:id/datacenter-interview/threats',
    calculateUptimeRisk: '/api/assessments/:id/datacenter-interview/calculate-uptime-risk',
    getControls: '/api/controls/datacenter',
    getControlRecommendations: '/api/assessments/:id/datacenter-interview/get-control-recommendations',
    getThreatBreakdown: '/api/assessments/:id/datacenter-interview/get-threat-breakdown',
    prioritizeThreats: '/api/assessments/:id/datacenter-interview/prioritize-threats',
    getQuestions: '/api/assessments/:id/datacenter-interview/questions',
    getBenchmarks: '/api/assessments/:id/datacenter-interview/industry-benchmarks',
    quickScore: '/api/assessments/:id/datacenter-interview/quick-score',
  },
  testEndpoints: {
    sampleRequest: {
      interviewResponses: {
        dc_tier_classification: 'Tier III - Concurrently Maintainable (99.982% uptime)',
        dc_customer_type: 'Enterprise colocation',
        dc_customer_count: '50-100 customers',
        dc_mantrap: 'yes',
        dc_biometric: 'yes',
        dc_noc_soc: 'yes',
        dc_background_checks: 'yes',
        dc_utility_feeds: 'Dual utility feeds from separate substations',
        dc_generator_config: 'N+1 redundancy',
        dc_fuel_capacity: '72+ hours',
        dc_cooling_redundancy: 'yes',
        dc_vesda: 'yes',
        dc_suppression_type: 'Clean agent (FM-200/Novec)',
        dc_soc2: 'yes',
        dc_video_retention: '90+ days',
      },
      useAI: true,
    },
  },
  reactComponents: {
    UptimeRiskDashboard: UptimeRiskDashboardComponent,
    InfrastructureHealth: InfrastructureHealthComponent,
    ThreatRiskMatrix: ThreatRiskMatrixComponent,
  },
};
