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
import type { Assessment, RiskScenario, RiskAsset, TreatmentPlan } from '@shared/schema';

const { SPACING, FONT_SIZES, COLORS } = PDF_CONFIG;

function mapLikelihoodToNumber(likelihood: string): number {
  const mapping: Record<string, number> = {
    'rare': 1,
    'unlikely': 2,
    'possible': 3,
    'likely': 4,
    'almost certain': 5,
  };
  return mapping[likelihood.toLowerCase()] || 3;
}

function mapImpactToNumber(impact: string): number {
  const mapping: Record<string, number> = {
    'insignificant': 1,
    'minor': 2,
    'moderate': 3,
    'major': 4,
    'catastrophic': 5,
  };
  return mapping[impact.toLowerCase()] || 3;
}

export async function generateExecutiveSummaryPDF(assessmentId: string): Promise<void> {
  try {
    console.log(`Starting Executive Summary PDF generation for assessment ${assessmentId}`);

    const [assessmentRes, scenariosRes, assetsRes, plansRes] = await Promise.all([
      fetch(`/api/assessments/${assessmentId}`),
      fetch(`/api/assessments/${assessmentId}/risk-scenarios`),
      fetch(`/api/assessments/${assessmentId}/risk-assets`),
      fetch(`/api/assessments/${assessmentId}/treatment-plans`),
    ]);

    if (!assessmentRes.ok || !scenariosRes.ok || !assetsRes.ok || !plansRes.ok) {
      throw new Error('Failed to fetch assessment data');
    }

    const assessment: Assessment = await assessmentRes.json();
    const scenarios: RiskScenario[] = await scenariosRes.json();
    const assets: RiskAsset[] = await assetsRes.json();
    const plans: TreatmentPlan[] = await plansRes.json();

    console.log('Data fetched successfully:', { 
      scenarios: scenarios.length, 
      assets: assets.length, 
      plans: plans.length 
    });

    const doc = createPDF();
    let yPos = SPACING.margin;

    yPos = addHeader(doc, 'Executive Summary Report', assessmentId);

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

    const criticalHighCount = scenarios.filter(s => {
      const level = s.riskLevel?.toLowerCase() || '';
      return level === 'critical' || level === 'high' || level === 'extreme';
    }).length;

    yPos = addText(doc, `Critical/High Risk Scenarios: ${criticalHighCount}`, SPACING.margin, yPos, {
      fontStyle: 'bold',
      color: criticalHighCount > 0 ? COLORS.danger : COLORS.success,
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
      return { ...scenario, numericScore: score };
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
        yPos = checkPageBreak(doc, yPos, 35);
        
        yPos = addText(doc, `${index + 1}. ${scenario.scenario}`, SPACING.margin, yPos, {
          fontStyle: 'bold',
          fontSize: FONT_SIZES.subheading,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Risk Level: ${scenario.riskLevel}`, SPACING.margin, yPos, {
          color: COLORS.textLight,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Affected Asset: ${scenario.asset}`, SPACING.margin, yPos, {
          color: COLORS.textLight,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Likelihood: ${scenario.likelihood} | Impact: ${scenario.impact}`, SPACING.margin, yPos, {
          color: COLORS.textLight,
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

        yPos = addText(doc, `${index + 1}. ${plan.description}`, SPACING.margin, yPos, {
          fontStyle: 'bold',
          fontSize: FONT_SIZES.subheading,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Strategy: ${plan.strategy}`, SPACING.margin, yPos, {
          color: COLORS.textLight,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Status: ${plan.status || 'Planned'}`, SPACING.margin, yPos, {
          color: COLORS.textLight,
        });
        yPos += SPACING.smallGap;

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

    const immediatePlans = plans.filter(p => 
      p.status?.toLowerCase().includes('immediate') || 
      p.deadline?.toLowerCase().includes('immediate')
    );
    const shortTermPlans = plans.filter(p => 
      p.status?.toLowerCase().includes('short') || 
      p.deadline?.toLowerCase().includes('short') ||
      p.deadline?.toLowerCase().includes('30') ||
      p.deadline?.toLowerCase().includes('days')
    );
    const longTermPlans = plans.filter(p => 
      p.status?.toLowerCase().includes('long') || 
      p.deadline?.toLowerCase().includes('long') ||
      p.deadline?.toLowerCase().includes('months') ||
      p.deadline?.toLowerCase().includes('year')
    );

    yPos = addText(doc, 'Immediate Actions Needed:', SPACING.margin, yPos, {
      fontStyle: 'bold',
      fontSize: FONT_SIZES.subheading,
      color: COLORS.danger,
    });
    yPos += SPACING.lineHeight;

    if (immediatePlans.length === 0) {
      yPos = addText(doc, '• No immediate actions identified', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
      });
      yPos += SPACING.lineHeight;
    } else {
      immediatePlans.slice(0, 5).forEach(plan => {
        yPos = checkPageBreak(doc, yPos, 15);
        yPos = addText(doc, `• ${plan.description}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;
      });
    }

    yPos += SPACING.smallGap;

    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addText(doc, 'Short-term Improvements:', SPACING.margin, yPos, {
      fontStyle: 'bold',
      fontSize: FONT_SIZES.subheading,
      color: COLORS.warning,
    });
    yPos += SPACING.lineHeight;

    if (shortTermPlans.length === 0) {
      yPos = addText(doc, '• No short-term improvements identified', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
      });
      yPos += SPACING.lineHeight;
    } else {
      shortTermPlans.slice(0, 5).forEach(plan => {
        yPos = checkPageBreak(doc, yPos, 15);
        yPos = addText(doc, `• ${plan.description}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;
      });
    }

    yPos += SPACING.smallGap;

    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addText(doc, 'Long-term Strategic Initiatives:', SPACING.margin, yPos, {
      fontStyle: 'bold',
      fontSize: FONT_SIZES.subheading,
      color: COLORS.info,
    });
    yPos += SPACING.lineHeight;

    if (longTermPlans.length === 0) {
      yPos = addText(doc, '• No long-term initiatives identified', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
      });
      yPos += SPACING.lineHeight;
    } else {
      longTermPlans.slice(0, 5).forEach(plan => {
        yPos = checkPageBreak(doc, yPos, 15);
        yPos = addText(doc, `• ${plan.description}`, SPACING.margin + 5, yPos);
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
