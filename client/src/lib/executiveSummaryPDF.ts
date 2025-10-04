import {
  createPDF,
  addHeader,
  addSection,
  addText,
  drawRiskBar,
  checkPageBreak,
  addPageNumbers,
  PDF_CONFIG,
  getRiskLevel,
  calculateRiskScore,
} from './pdfService';
import type { Assessment, RiskScenario, RiskAsset, TreatmentPlan, Vulnerability, Control } from '@shared/schema';

const { SPACING, FONT_SIZES, COLORS } = PDF_CONFIG;

function mapLikelihoodToNumber(likelihood: string): number {
  const mapping: Record<string, number> = {
    'very-low': 1,
    'low': 2,
    'medium': 3,
    'high': 4,
    'very-high': 5,
  };
  return mapping[likelihood.toLowerCase()] || 3;
}

function mapImpactToNumber(impact: string): number {
  const mapping: Record<string, number> = {
    'negligible': 1,
    'minor': 2,
    'moderate': 3,
    'major': 4,
    'catastrophic': 5,
  };
  return mapping[impact.toLowerCase()] || 3;
}

function calculateRiskLevel(likelihood: number, impact: number): { score: number; level: string } {
  const score = likelihood * impact;
  let level = '';
  
  if (score >= 20) level = 'Critical';
  else if (score >= 15) level = 'High';
  else if (score >= 10) level = 'Medium';
  else if (score >= 5) level = 'Low';
  else level = 'Very Low';
  
  return { score, level };
}

function calculateCurrentRisk(
  scenario: RiskScenario, 
  vulnerabilities: Vulnerability[], 
  controls: Control[]
): { currentLikelihood: number; currentImpact: number; currentRisk: { score: number; level: string }; reduction: number } {
  const inherentLikelihood = mapLikelihoodToNumber(scenario.likelihood);
  const inherentImpact = mapImpactToNumber(scenario.impact);

  // Get vulnerabilities for this scenario
  const scenarioVulns = vulnerabilities.filter(v => v.riskScenarioId === scenario.id);
  
  // Get existing controls - both via vulnerabilities and directly linked to scenario
  const existingControls = controls.filter(c => 
    (scenarioVulns.some(v => v.id === c.vulnerabilityId) || c.riskScenarioId === scenario.id) &&
    c.controlType === 'existing' && 
    c.effectiveness !== null
  );

  if (existingControls.length === 0) {
    const currentRisk = calculateRiskLevel(inherentLikelihood, inherentImpact);
    return { currentLikelihood: inherentLikelihood, currentImpact: inherentImpact, currentRisk, reduction: 0 };
  }

  // Calculate average effectiveness and reduction (10% per effectiveness point)
  const avgEffectiveness = existingControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / existingControls.length;
  const reductionPercentage = avgEffectiveness * 10;
  
  // Calculate current likelihood with floor-rounded reduction
  const reductionAmount = Math.floor((inherentLikelihood * reductionPercentage) / 100);
  const currentLikelihood = Math.max(1, inherentLikelihood - reductionAmount);
  const currentImpact = inherentImpact;

  const currentRisk = calculateRiskLevel(currentLikelihood, currentImpact);
  
  return { currentLikelihood, currentImpact, currentRisk, reduction: Math.round(reductionPercentage) };
}

function calculateResidualRisk(
  currentLikelihood: number,
  currentImpact: number,
  scenario: RiskScenario,
  treatment?: TreatmentPlan
): { residualLikelihood: number; residualImpact: number; residualRisk: { score: number; level: string } } {
  if (!treatment || !treatment.effect || !treatment.value) {
    return {
      residualLikelihood: currentLikelihood,
      residualImpact: currentImpact,
      residualRisk: calculateRiskLevel(currentLikelihood, currentImpact)
    };
  }

  const reductionValue = treatment.value || 0;
  let residualLikelihood = currentLikelihood;
  let residualImpact = currentImpact;

  if (treatment.effect === 'reduce_likelihood') {
    residualLikelihood = Math.max(1, currentLikelihood - reductionValue);
  } else if (treatment.effect === 'reduce_impact') {
    residualImpact = Math.max(1, currentImpact - reductionValue);
  }

  const residualRisk = calculateRiskLevel(residualLikelihood, residualImpact);
  return { residualLikelihood, residualImpact, residualRisk };
}

export async function generateExecutiveSummaryPDF(assessmentId: string): Promise<void> {
  try {
    console.log(`Starting Executive Summary PDF generation for assessment ${assessmentId}`);

    const [assessmentRes, scenariosRes, assetsRes, plansRes, vulnerabilitiesRes, controlsRes] = await Promise.all([
      fetch(`/api/assessments/${assessmentId}`),
      fetch(`/api/assessments/${assessmentId}/risk-scenarios`),
      fetch(`/api/assessments/${assessmentId}/risk-assets`),
      fetch(`/api/assessments/${assessmentId}/treatment-plans`),
      fetch(`/api/assessments/${assessmentId}/vulnerabilities`),
      fetch(`/api/assessments/${assessmentId}/controls`),
    ]);

    if (!assessmentRes.ok || !scenariosRes.ok || !assetsRes.ok || !plansRes.ok) {
      throw new Error('Failed to fetch assessment data');
    }

    const assessment: Assessment = await assessmentRes.json();
    const scenarios: RiskScenario[] = await scenariosRes.json();
    const assets: RiskAsset[] = await assetsRes.json();
    const plans: TreatmentPlan[] = await plansRes.json();
    const vulnerabilities: Vulnerability[] = vulnerabilitiesRes.ok ? await vulnerabilitiesRes.json() : [];
    const controls: Control[] = controlsRes.ok ? await controlsRes.json() : [];

    console.log('Data fetched successfully:', { 
      scenarios: scenarios.length, 
      assets: assets.length, 
      plans: plans.length,
      vulnerabilities: vulnerabilities.length,
      controls: controls.length
    });

    const doc = createPDF();
    let yPos = SPACING.margin;

    yPos = addHeader(doc, 'Executive Summary Report', assessmentId.substring(0, 8));

    yPos = checkPageBreak(doc, yPos, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text('EXECUTIVE SUMMARY', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_SIZES.body);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    
    yPos = addText(doc, `Facility: ${assessment.title}`, SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'bold',
    });
    yPos += SPACING.smallGap;

    yPos = addText(doc, `Location: ${assessment.location}`, SPACING.margin, yPos);
    yPos += SPACING.smallGap;

    yPos = addText(doc, `Assessor: ${assessment.assessor}`, SPACING.margin, yPos);
    yPos += SPACING.smallGap;

    const assessmentDate = assessment.createdAt 
      ? new Date(assessment.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'N/A';
    yPos = addText(doc, `Assessment Date: ${assessmentDate}`, SPACING.margin, yPos);
    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addSection(doc, 'EXECUTIVE SUMMARY', yPos);
    
    const summaryText = `This comprehensive security risk assessment was conducted for ${assessment.title} located in ${assessment.location}. The assessment identified ${assets.length} critical assets, evaluated ${scenarios.length} risk scenarios, and developed ${plans.length} treatment plans to address identified vulnerabilities and threats. This executive summary provides an overview of key findings, risk levels, and recommended actions.`;
    
    yPos = addText(doc, summaryText, SPACING.margin, yPos, {
      fontSize: FONT_SIZES.body,
    });
    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addSection(doc, 'RISK OVERVIEW', yPos);

    yPos = addText(doc, `Total Assets Identified: ${assets.length}`, SPACING.margin, yPos, {
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    yPos = addText(doc, `Total Risk Scenarios: ${scenarios.length}`, SPACING.margin, yPos, {
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    // Calculate triple risk metrics
    const inherentCritical = scenarios.filter(s => {
      const likelihood = mapLikelihoodToNumber(s.likelihood);
      const impact = mapImpactToNumber(s.impact);
      return calculateRiskLevel(likelihood, impact).level === 'Critical';
    }).length;

    const currentCritical = scenarios.filter(s => {
      const { currentRisk } = calculateCurrentRisk(s, vulnerabilities, controls);
      return currentRisk.level === 'Critical';
    }).length;

    const residualCritical = scenarios.filter(s => {
      const { currentLikelihood, currentImpact } = calculateCurrentRisk(s, vulnerabilities, controls);
      const treatment = plans.find(p => p.riskScenarioId === s.id);
      const { residualRisk } = calculateResidualRisk(currentLikelihood, currentImpact, s, treatment);
      return residualRisk.level === 'Critical';
    }).length;

    const criticalHighCount = inherentCritical;

    yPos = addText(doc, `Critical/High Risk Scenarios: ${criticalHighCount}`, SPACING.margin, yPos, {
      fontStyle: 'bold',
      color: criticalHighCount > 0 ? COLORS.danger : COLORS.success,
    });
    yPos += SPACING.sectionGap;

    // Add Triple Risk Progression
    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addSection(doc, 'RISK PROGRESSION (INHERENT -> CURRENT -> RESIDUAL)', yPos);

    yPos = addText(doc, 'The triple risk model shows how risks are reduced through existing controls and proposed treatments:', SPACING.margin, yPos);
    yPos += SPACING.lineHeight;

    yPos = addText(doc, `Inherent Risk (Critical): ${inherentCritical} scenarios`, SPACING.margin, yPos, {
      color: COLORS.danger,
      fontStyle: 'bold',
    });
    yPos += SPACING.smallGap;

    yPos = addText(doc, `Current Risk (Critical): ${currentCritical} scenarios (after existing controls)`, SPACING.margin, yPos, {
      color: COLORS.warning,
      fontStyle: 'bold',
    });
    yPos += SPACING.smallGap;

    yPos = addText(doc, `Residual Risk (Critical): ${residualCritical} scenarios (after proposed treatments)`, SPACING.margin, yPos, {
      color: COLORS.success,
      fontStyle: 'bold',
    });
    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addText(doc, 'Risk Distribution:', SPACING.margin, yPos, {
      fontStyle: 'bold',
      fontSize: FONT_SIZES.subheading,
    });
    yPos += SPACING.lineHeight;

    const riskCounts: Record<string, number> = {};
    scenarios.forEach(scenario => {
      const level = scenario.riskLevel || 'Unknown';
      riskCounts[level] = (riskCounts[level] || 0) + 1;
    });

    Object.entries(riskCounts).forEach(([level, count]) => {
      const likelihoodNum = mapLikelihoodToNumber(scenarios.find(s => s.riskLevel === level)?.likelihood || '3');
      const impactNum = mapImpactToNumber(scenarios.find(s => s.riskLevel === level)?.impact || '3');
      const score = calculateRiskScore(likelihoodNum, impactNum);
      
      yPos = checkPageBreak(doc, yPos, 15);
      yPos = addText(doc, `${level}: ${count} scenario${count !== 1 ? 's' : ''}`, SPACING.margin, yPos);
      yPos += SPACING.smallGap;
      yPos = drawRiskBar(doc, SPACING.margin + 5, yPos, level, score);
      yPos += SPACING.smallGap;
    });

    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addSection(doc, 'CRITICAL FINDINGS', yPos);

    const scenariosWithScores = scenarios.map(scenario => {
      const likelihoodNum = mapLikelihoodToNumber(scenario.likelihood);
      const impactNum = mapImpactToNumber(scenario.impact);
      const score = calculateRiskScore(likelihoodNum, impactNum);
      const { currentRisk } = calculateCurrentRisk(scenario, vulnerabilities, controls);
      return { ...scenario, numericScore: score, currentRisk };
    });

    const topScenarios = scenariosWithScores
      .sort((a, b) => b.numericScore - a.numericScore)
      .slice(0, 5);

    if (topScenarios.length === 0) {
      yPos = addText(doc, 'No risk scenarios have been identified yet.', SPACING.margin, yPos, {
        color: COLORS.textLight,
        fontStyle: 'italic',
      });
    } else {
      topScenarios.forEach((scenario, index) => {
        yPos = checkPageBreak(doc, yPos, 50);
        
        const scenarioTitle = scenario.threatDescription || scenario.scenario || 'Risk Scenario';
        yPos = addText(doc, `${index + 1}. ${scenarioTitle}`, SPACING.margin, yPos, {
          fontStyle: 'bold',
          fontSize: FONT_SIZES.subheading,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Affected Asset: ${scenario.asset}`, SPACING.margin, yPos, {
          color: COLORS.textLight,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Likelihood: ${scenario.likelihood} | Impact: ${scenario.impact}`, SPACING.margin, yPos, {
          color: COLORS.textLight,
        });
        yPos += SPACING.smallGap;

        // Show triple risk progression
        const likelihoodNum = mapLikelihoodToNumber(scenario.likelihood);
        const impactNum = mapImpactToNumber(scenario.impact);
        const inherentRisk = calculateRiskLevel(likelihoodNum, impactNum);
        const { currentLikelihood, currentImpact, currentRisk } = calculateCurrentRisk(scenario, vulnerabilities, controls);
        const treatment = plans.find(p => p.riskScenarioId === scenario.id);
        const { residualRisk } = calculateResidualRisk(currentLikelihood, currentImpact, scenario, treatment);

        yPos = addText(doc, `   Inherent -> Current -> Residual: ${inherentRisk.level} -> ${currentRisk.level} -> ${residualRisk.level}`, SPACING.margin, yPos, {
          color: residualRisk.level === 'Critical' ? COLORS.danger : residualRisk.level === 'High' ? COLORS.warning : COLORS.success,
          fontStyle: 'bold',
        });
        yPos += SPACING.lineHeight;
      });
    }

    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addSection(doc, 'KEY RECOMMENDATIONS', yPos);

    const priorityOrder: Record<string, number> = {
      'immediate': 1,
      'high': 2,
      'short-term': 3,
      'medium': 4,
      'long-term': 5,
      'low': 6,
    };

    const sortedPlans = [...plans].sort((a, b) => {
      const aPriority = priorityOrder[a.status?.toLowerCase() || 'medium'] || 99;
      const bPriority = priorityOrder[b.status?.toLowerCase() || 'medium'] || 99;
      return aPriority - bPriority;
    });

    if (sortedPlans.length === 0) {
      yPos = addText(doc, 'No treatment plans have been developed yet.', SPACING.margin, yPos, {
        color: COLORS.textLight,
        fontStyle: 'italic',
      });
    } else {
      sortedPlans.forEach((plan, index) => {
        yPos = checkPageBreak(doc, yPos, 40);

        const planTitle = plan.threatDescription || plan.risk || 'Treatment Plan';
        yPos = addText(doc, `${index + 1}. ${planTitle}`, SPACING.margin, yPos, {
          fontStyle: 'bold',
          fontSize: FONT_SIZES.subheading,
        });
        yPos += SPACING.smallGap;

        if (plan.description) {
          yPos = addText(doc, `   Action: ${plan.description}`, SPACING.margin, yPos, {
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        const strategyLabel = plan.strategy === 'control' ? 'Mitigate/Control' : plan.strategy || 'Planned';
        yPos = addText(doc, `   Strategy: ${strategyLabel}`, SPACING.margin, yPos, {
          color: COLORS.textLight,
        });
        yPos += SPACING.smallGap;

        if (plan.type) {
          yPos = addText(doc, `   Type: ${plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}`, SPACING.margin, yPos, {
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        if (plan.effect && plan.value) {
          const effectLabel = plan.effect === 'reduce_likelihood' ? 'Reduce Likelihood' : 'Reduce Impact';
          yPos = addText(doc, `   Effect: ${effectLabel} by ${plan.value} levels`, SPACING.margin, yPos, {
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        if (plan.status) {
          yPos = addText(doc, `   Status: ${plan.status}`, SPACING.margin, yPos, {
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        if (plan.responsible) {
          yPos = addText(doc, `   Responsible: ${plan.responsible}`, SPACING.margin, yPos, {
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        if (plan.deadline) {
          yPos = addText(doc, `   Timeline: ${plan.deadline}`, SPACING.margin, yPos, {
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        if (plan.cost) {
          yPos = addText(doc, `   Estimated Cost: ${plan.cost}`, SPACING.margin, yPos, {
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        yPos += SPACING.lineHeight;
      });
    }

    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addSection(doc, 'ACTION ITEMS', yPos);

    // Get proposed controls for action items
    const proposedControls = controls.filter(c => c.controlType === 'proposed');
    
    // Categorize by priority based on the risk scenarios they address
    const highPriorityActions: string[] = [];
    const mediumPriorityActions: string[] = [];
    const longTermActions: string[] = [];

    proposedControls.forEach(control => {
      const scenario = scenarios.find(s => 
        s.id === control.riskScenarioId || 
        vulnerabilities.some(v => v.id === control.vulnerabilityId && v.riskScenarioId === s.id)
      );
      
      if (scenario) {
        const likelihoodNum = mapLikelihoodToNumber(scenario.likelihood);
        const impactNum = mapImpactToNumber(scenario.impact);
        const inherentRisk = calculateRiskLevel(likelihoodNum, impactNum);
        
        const actionText = control.actionDescription || control.description || 'Control measure';
        
        if (inherentRisk.level === 'Critical' || inherentRisk.level === 'High') {
          highPriorityActions.push(actionText);
        } else if (inherentRisk.level === 'Medium') {
          mediumPriorityActions.push(actionText);
        } else {
          longTermActions.push(actionText);
        }
      }
    });

    yPos = addText(doc, 'Immediate Actions Needed (High/Critical Risks):', SPACING.margin, yPos, {
      fontStyle: 'bold',
      fontSize: FONT_SIZES.subheading,
      color: COLORS.danger,
    });
    yPos += SPACING.lineHeight;

    if (highPriorityActions.length === 0) {
      yPos = addText(doc, '• No immediate high-priority actions identified', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
      });
      yPos += SPACING.lineHeight;
    } else {
      highPriorityActions.slice(0, 5).forEach(action => {
        yPos = checkPageBreak(doc, yPos, 15);
        yPos = addText(doc, `• ${action}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;
      });
    }

    yPos += SPACING.smallGap;

    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addText(doc, 'Short-term Improvements (Medium Risks):', SPACING.margin, yPos, {
      fontStyle: 'bold',
      fontSize: FONT_SIZES.subheading,
      color: COLORS.warning,
    });
    yPos += SPACING.lineHeight;

    if (mediumPriorityActions.length === 0) {
      yPos = addText(doc, '• No medium-priority improvements identified', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
      });
      yPos += SPACING.lineHeight;
    } else {
      mediumPriorityActions.slice(0, 5).forEach(action => {
        yPos = checkPageBreak(doc, yPos, 15);
        yPos = addText(doc, `• ${action}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;
      });
    }

    yPos += SPACING.smallGap;

    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addText(doc, 'Long-term Strategic Initiatives (Low Risks):', SPACING.margin, yPos, {
      fontStyle: 'bold',
      fontSize: FONT_SIZES.subheading,
      color: COLORS.info,
    });
    yPos += SPACING.lineHeight;

    if (longTermActions.length === 0) {
      yPos = addText(doc, '• No long-term initiatives identified', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
      });
      yPos += SPACING.lineHeight;
    } else {
      longTermActions.slice(0, 5).forEach(action => {
        yPos = checkPageBreak(doc, yPos, 15);
        yPos = addText(doc, `• ${action}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;
      });
    }

    addPageNumbers(doc);

    const filename = `Executive-Summary-${assessmentId}.pdf`;
    doc.save(filename);

    console.log(`Executive Summary PDF generated successfully: ${filename}`);
  } catch (error) {
    console.error('Error generating Executive Summary PDF:', error);
    throw error;
  }
}
