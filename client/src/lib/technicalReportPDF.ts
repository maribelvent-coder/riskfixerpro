import {
  createPDF,
  addHeader,
  addSection,
  addText,
  drawRiskBar,
  drawRiskMatrix,
  drawTable,
  checkPageBreak,
  addPageNumbers,
  PDF_CONFIG,
  getRiskLevel,
  calculateRiskScore,
  getRiskLevelColor,
} from './pdfService';
import type { 
  Assessment, 
  RiskScenario, 
  RiskAsset, 
  TreatmentPlan,
  FacilitySurveyQuestion,
  RiskInsight
} from '@shared/schema';

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

export async function generateTechnicalReportPDF(assessmentId: string): Promise<void> {
  try {
    console.log(`Starting Technical Report PDF generation for assessment ${assessmentId}`);

    const [
      assessmentRes,
      facilitySurveyRes,
      scenariosRes,
      assetsRes,
      plansRes,
      insightsRes
    ] = await Promise.all([
      fetch(`/api/assessments/${assessmentId}`),
      fetch(`/api/assessments/${assessmentId}/facility-survey`),
      fetch(`/api/assessments/${assessmentId}/risk-scenarios`),
      fetch(`/api/assessments/${assessmentId}/risk-assets`),
      fetch(`/api/assessments/${assessmentId}/treatment-plans`),
      fetch(`/api/assessments/${assessmentId}/insights`).catch(() => null),
    ]);

    if (!assessmentRes.ok || !facilitySurveyRes.ok || !scenariosRes.ok || !assetsRes.ok || !plansRes.ok) {
      throw new Error('Failed to fetch assessment data');
    }

    const assessment: Assessment = await assessmentRes.json();
    const facilityQuestions: FacilitySurveyQuestion[] = await facilitySurveyRes.json();
    const scenarios: RiskScenario[] = await scenariosRes.json();
    const assets: RiskAsset[] = await assetsRes.json();
    const plans: TreatmentPlan[] = await plansRes.json();
    const insights: RiskInsight[] = insightsRes?.ok ? await insightsRes.json() : [];

    console.log('Data fetched successfully:', {
      facilityQuestions: facilityQuestions.length,
      scenarios: scenarios.length,
      assets: assets.length,
      plans: plans.length,
      insights: insights.length,
    });

    const doc = createPDF();
    let yPos = SPACING.margin;

    yPos = addHeader(doc, 'Detailed Technical Assessment Report', assessmentId);

    yPos = checkPageBreak(doc, yPos, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text('DETAILED TECHNICAL', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 10;
    doc.text('ASSESSMENT REPORT', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_SIZES.subheading);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    
    yPos = addText(doc, `Facility: ${assessment.title}`, SPACING.margin, yPos, {
      fontSize: FONT_SIZES.heading,
      fontStyle: 'bold',
    });
    yPos += SPACING.smallGap;

    yPos = addText(doc, `Location: ${assessment.location}`, SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
    });
    yPos += SPACING.smallGap;

    yPos = addText(doc, `Assessor: ${assessment.assessor}`, SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
    });
    yPos += SPACING.smallGap;

    const assessmentDate = assessment.createdAt 
      ? new Date(assessment.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'N/A';
    yPos = addText(doc, `Assessment Date: ${assessmentDate}`, SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
    });
    yPos += SPACING.sectionGap * 2;

    doc.addPage();
    yPos = SPACING.margin;

    yPos = addSection(doc, 'TABLE OF CONTENTS', yPos);
    const tocItems = [
      '1. Assessment Methodology',
      '2. Facility Survey Results',
      '3. Risk Analysis',
      '4. Detailed Findings',
      '5. Treatment Plans',
      '6. Evidence & Appendices',
    ];
    
    tocItems.forEach((item) => {
      yPos = addText(doc, item, SPACING.margin + 5, yPos, {
        fontSize: FONT_SIZES.body,
      });
      yPos += SPACING.lineHeight;
    });
    yPos += SPACING.sectionGap;

    doc.addPage();
    yPos = SPACING.margin;

    yPos = addSection(doc, '1. ASSESSMENT METHODOLOGY', yPos);
    
    const methodology = `This comprehensive security risk assessment was conducted following industry-standard frameworks and methodologies to ensure a thorough evaluation of physical security measures and potential vulnerabilities.

Standards and Frameworks Applied:

• ASIS International Certified Protection Professional (CPP) Standards
  - Physical security design principles
  - Risk assessment and management frameworks
  - Security systems performance criteria

• U.S. Army Field Manual (FM 3-19.30)
  - Physical security standards for critical infrastructure
  - Perimeter security and access control requirements
  - Defense-in-depth security principles

Assessment Process:

Phase 1 - Facility Physical Security Survey:
Conducted comprehensive on-site evaluation of existing physical security controls, including barriers, lighting systems, surveillance equipment, access control mechanisms, and intrusion detection systems. Each element was assessed against professional standards and documented with observations and recommendations.

Phase 2 - Risk Assessment and Analysis:
Identified critical assets, evaluated potential threat scenarios, analyzed likelihood and impact factors, and calculated risk levels using standardized risk matrices. Applied ASIS risk management methodology for systematic evaluation.

This report presents detailed findings from both assessment phases, including quantitative measurements, qualitative assessments, and evidence-based recommendations for security improvements.`;

    yPos = addText(doc, methodology, SPACING.margin, yPos, {
      fontSize: FONT_SIZES.body,
    });
    yPos += SPACING.sectionGap;

    doc.addPage();
    yPos = SPACING.margin;

    yPos = addSection(doc, '2. FACILITY SURVEY RESULTS', yPos);

    const categories = ['barriers', 'lighting', 'surveillance', 'access-control', 'intrusion-detection'];
    const categoryTitles: Record<string, string> = {
      'barriers': 'Physical Barriers & Perimeter Security',
      'lighting': 'Lighting Systems',
      'surveillance': 'Surveillance & CCTV Systems',
      'access-control': 'Access Control Systems',
      'intrusion-detection': 'Intrusion Detection Systems',
    };

    for (const category of categories) {
      const categoryQuestions = facilityQuestions.filter(q => q.category === category);
      
      if (categoryQuestions.length === 0) continue;

      yPos = checkPageBreak(doc, yPos, 60);
      
      yPos = addText(doc, categoryTitles[category] || category, SPACING.margin, yPos, {
        fontSize: FONT_SIZES.subheading,
        fontStyle: 'bold',
        color: COLORS.primary,
      });
      yPos += SPACING.lineHeight;

      for (const question of categoryQuestions) {
        yPos = checkPageBreak(doc, yPos, 50);

        yPos = addText(doc, `Q: ${question.question}`, SPACING.margin, yPos, {
          fontSize: FONT_SIZES.body,
          fontStyle: 'bold',
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `Standard: ${question.standard || 'N/A'}`, SPACING.margin + 5, yPos, {
          fontSize: FONT_SIZES.small,
          color: COLORS.textLight,
          fontStyle: 'italic',
        });
        yPos += SPACING.lineHeight;

        let responseText = 'No response recorded';
        if (question.response) {
          if (typeof question.response === 'object') {
            const resp = question.response as any;
            if (resp.value !== undefined) {
              responseText = `${resp.value} ${resp.unit || ''} - Assessment: ${resp.assessment || 'N/A'}`;
            } else {
              responseText = JSON.stringify(question.response);
            }
          } else {
            responseText = String(question.response);
          }
        }

        yPos = addText(doc, `Response: ${responseText}`, SPACING.margin + 5, yPos, {
          fontSize: FONT_SIZES.body,
          color: COLORS.text,
        });
        yPos += SPACING.lineHeight;

        if (question.notes) {
          yPos = checkPageBreak(doc, yPos, 20);
          yPos = addText(doc, `Notes: ${question.notes}`, SPACING.margin + 5, yPos, {
            fontSize: FONT_SIZES.small,
            color: COLORS.textLight,
          });
          yPos += SPACING.lineHeight;
        }

        yPos += SPACING.smallGap;
      }

      yPos += SPACING.sectionGap;
    }

    doc.addPage();
    yPos = SPACING.margin;

    yPos = addSection(doc, '3. RISK ANALYSIS', yPos);

    yPos = addText(doc, '3.1 Identified Critical Assets', SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    if (assets.length === 0) {
      yPos = addText(doc, 'No assets have been identified yet.', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
        fontStyle: 'italic',
      });
      yPos += SPACING.lineHeight;
    } else {
      const assetHeaders = ['Asset Name', 'Type', 'Criticality', 'Owner'];
      const assetRows = assets.map(asset => [
        asset.name,
        asset.type || 'N/A',
        asset.criticality ? `${asset.criticality}/5` : 'N/A',
        asset.owner || 'N/A',
      ]);

      yPos = checkPageBreak(doc, yPos, 40);
      yPos = drawTable(doc, assetHeaders, assetRows, yPos);
      yPos += SPACING.sectionGap;
    }

    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addText(doc, '3.2 Risk Scenarios', SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    if (scenarios.length === 0) {
      yPos = addText(doc, 'No risk scenarios have been identified yet.', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
        fontStyle: 'italic',
      });
      yPos += SPACING.lineHeight;
    } else {
      for (const scenario of scenarios) {
        yPos = checkPageBreak(doc, yPos, 40);

        yPos = addText(doc, `Scenario: ${scenario.scenario}`, SPACING.margin + 5, yPos, {
          fontSize: FONT_SIZES.body,
          fontStyle: 'bold',
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `Asset: ${scenario.asset}`, SPACING.margin + 10, yPos, {
          fontSize: FONT_SIZES.small,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `Likelihood: ${scenario.likelihood} | Impact: ${scenario.impact}`, SPACING.margin + 10, yPos, {
          fontSize: FONT_SIZES.small,
        });
        yPos += SPACING.smallGap;

        const likelihoodNum = mapLikelihoodToNumber(scenario.likelihood);
        const impactNum = mapImpactToNumber(scenario.impact);
        const score = calculateRiskScore(likelihoodNum, impactNum);
        
        yPos = drawRiskBar(doc, SPACING.margin + 10, yPos, scenario.riskLevel, score);
        yPos += SPACING.lineHeight;
      }
    }

    yPos += SPACING.sectionGap;

    if (scenarios.length > 0) {
      yPos = checkPageBreak(doc, yPos, 80);
      yPos = addText(doc, '3.3 Risk Matrix Visualization', SPACING.margin, yPos, {
        fontSize: FONT_SIZES.subheading,
        fontStyle: 'bold',
      });
      yPos += SPACING.lineHeight;

      const scenariosForMatrix = scenarios.map(s => ({
        id: s.id,
        title: s.scenario,
        likelihood: mapLikelihoodToNumber(s.likelihood),
        impact: mapImpactToNumber(s.impact),
        riskLevel: s.riskLevel,
        riskScore: calculateRiskScore(mapLikelihoodToNumber(s.likelihood), mapImpactToNumber(s.impact)),
      }));

      yPos = drawRiskMatrix(doc, SPACING.margin, yPos, scenariosForMatrix);
      yPos += SPACING.sectionGap;
    }

    if (scenarios.length > 0) {
      yPos = checkPageBreak(doc, yPos, 60);
      yPos = addText(doc, '3.4 Risk Distribution', SPACING.margin, yPos, {
        fontSize: FONT_SIZES.subheading,
        fontStyle: 'bold',
      });
      yPos += SPACING.lineHeight;

      const riskCounts: Record<string, number> = {};
      scenarios.forEach(scenario => {
        const level = scenario.riskLevel || 'Unknown';
        riskCounts[level] = (riskCounts[level] || 0) + 1;
      });

      Object.entries(riskCounts).forEach(([level, count]) => {
        yPos = checkPageBreak(doc, yPos, 15);
        yPos = addText(doc, `${level}: ${count} scenario${count !== 1 ? 's' : ''}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;
      });

      yPos += SPACING.sectionGap;
    }

    doc.addPage();
    yPos = SPACING.margin;

    yPos = addSection(doc, '4. DETAILED FINDINGS', yPos);

    yPos = addText(doc, '4.1 Critical Issues Identified', SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    const criticalScenarios = scenarios.filter(s => {
      const level = s.riskLevel?.toLowerCase() || '';
      return level === 'critical' || level === 'extreme' || level === 'high';
    });

    if (criticalScenarios.length === 0) {
      yPos = addText(doc, 'No critical risk scenarios identified.', SPACING.margin + 5, yPos, {
        color: COLORS.success,
      });
      yPos += SPACING.lineHeight;
    } else {
      criticalScenarios.forEach((scenario, index) => {
        yPos = checkPageBreak(doc, yPos, 30);
        
        yPos = addText(doc, `${index + 1}. ${scenario.scenario}`, SPACING.margin + 5, yPos, {
          fontStyle: 'bold',
          color: COLORS.danger,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Risk Level: ${scenario.riskLevel}`, SPACING.margin + 10, yPos, {
          fontSize: FONT_SIZES.small,
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Affected Asset: ${scenario.asset}`, SPACING.margin + 10, yPos, {
          fontSize: FONT_SIZES.small,
        });
        yPos += SPACING.lineHeight;
      });
    }

    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addText(doc, '4.2 Vulnerabilities Discovered', SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    const poorResponses = facilityQuestions.filter(q => {
      if (typeof q.response === 'string') {
        return ['poor', 'critical', 'no'].includes(q.response.toLowerCase());
      }
      if (typeof q.response === 'object' && q.response !== null) {
        const resp = q.response as any;
        return resp.assessment && ['poor', 'critical'].includes(resp.assessment.toLowerCase());
      }
      return false;
    });

    if (poorResponses.length === 0) {
      yPos = addText(doc, 'No significant vulnerabilities identified in facility survey.', SPACING.margin + 5, yPos, {
        color: COLORS.success,
      });
      yPos += SPACING.lineHeight;
    } else {
      poorResponses.forEach((question, index) => {
        yPos = checkPageBreak(doc, yPos, 30);
        
        yPos = addText(doc, `${index + 1}. ${question.question}`, SPACING.margin + 5, yPos, {
          fontSize: FONT_SIZES.body,
          fontStyle: 'bold',
        });
        yPos += SPACING.smallGap;

        yPos = addText(doc, `   Category: ${question.category}`, SPACING.margin + 10, yPos, {
          fontSize: FONT_SIZES.small,
        });
        yPos += SPACING.smallGap;

        if (question.notes) {
          yPos = addText(doc, `   Notes: ${question.notes}`, SPACING.margin + 10, yPos, {
            fontSize: FONT_SIZES.small,
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        yPos += SPACING.lineHeight;
      });
    }

    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addText(doc, '4.3 Gap Analysis', SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    const gapAnalysis = `Based on the comprehensive facility survey and risk assessment, the following gaps have been identified between current security posture and industry best practices:

Security Control Gaps:
• Physical barriers and perimeter security deficiencies
• Inadequate lighting coverage in critical areas
• Surveillance system blind spots or insufficient camera resolution
• Access control vulnerabilities and unauthorized entry points
• Intrusion detection system gaps or maintenance issues

Standards Compliance Gaps:
• Areas not meeting ASIS CPP professional standards
• Deviations from Army FM 3-19.30 physical security requirements
• Performance criteria not achieved for critical security systems

These gaps represent opportunities for security improvements and risk mitigation through the implementation of recommended treatment plans.`;

    yPos = addText(doc, gapAnalysis, SPACING.margin + 5, yPos, {
      fontSize: FONT_SIZES.small,
    });
    yPos += SPACING.sectionGap;

    doc.addPage();
    yPos = SPACING.margin;

    yPos = addSection(doc, '5. TREATMENT PLANS', yPos);

    yPos = addText(doc, 'Comprehensive Risk Mitigation Strategies', SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'italic',
      color: COLORS.textLight,
    });
    yPos += SPACING.lineHeight * 2;

    if (plans.length === 0) {
      yPos = addText(doc, 'No treatment plans have been developed yet.', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
        fontStyle: 'italic',
      });
      yPos += SPACING.lineHeight;
    } else {
      plans.forEach((plan, index) => {
        yPos = checkPageBreak(doc, yPos, 60);

        yPos = addText(doc, `${index + 1}. ${plan.description}`, SPACING.margin, yPos, {
          fontSize: FONT_SIZES.subheading,
          fontStyle: 'bold',
        });
        yPos += SPACING.lineHeight;

        yPos = addText(doc, `Risk: ${plan.risk}`, SPACING.margin + 5, yPos, {
          fontSize: FONT_SIZES.body,
        });
        yPos += SPACING.smallGap;

        if (plan.threatDescription) {
          yPos = addText(doc, `Threat: ${plan.threatDescription}`, SPACING.margin + 5, yPos, {
            fontSize: FONT_SIZES.small,
            color: COLORS.textLight,
          });
          yPos += SPACING.smallGap;
        }

        yPos = addText(doc, `Strategy: ${plan.strategy}`, SPACING.margin + 5, yPos, {
          fontSize: FONT_SIZES.body,
          fontStyle: 'bold',
        });
        yPos += SPACING.smallGap;

        if (plan.responsible) {
          yPos = addText(doc, `Responsible Party: ${plan.responsible}`, SPACING.margin + 5, yPos, {
            fontSize: FONT_SIZES.small,
          });
          yPos += SPACING.smallGap;
        }

        if (plan.deadline) {
          yPos = addText(doc, `Timeline: ${plan.deadline}`, SPACING.margin + 5, yPos, {
            fontSize: FONT_SIZES.small,
          });
          yPos += SPACING.smallGap;
        }

        if (plan.cost) {
          yPos = addText(doc, `Estimated Cost: ${plan.cost}`, SPACING.margin + 5, yPos, {
            fontSize: FONT_SIZES.small,
          });
          yPos += SPACING.smallGap;
        }

        yPos = addText(doc, `Status: ${plan.status || 'Planned'}`, SPACING.margin + 5, yPos, {
          fontSize: FONT_SIZES.small,
          color: plan.status === 'completed' ? COLORS.success : COLORS.warning,
        });
        yPos += SPACING.lineHeight * 2;
      });
    }

    doc.addPage();
    yPos = SPACING.margin;

    yPos = addSection(doc, '6. EVIDENCE & APPENDICES', yPos);

    yPos = addText(doc, '6.1 Supporting Documentation', SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    const questionsWithNotes = facilityQuestions.filter(q => q.notes && q.notes.trim().length > 0);
    
    if (questionsWithNotes.length === 0) {
      yPos = addText(doc, 'No additional documentation notes recorded.', SPACING.margin + 5, yPos, {
        color: COLORS.textLight,
        fontStyle: 'italic',
      });
      yPos += SPACING.lineHeight;
    } else {
      yPos = addText(doc, `${questionsWithNotes.length} documentation notes recorded during facility survey.`, SPACING.margin + 5, yPos);
      yPos += SPACING.lineHeight;
    }

    yPos += SPACING.sectionGap;

    yPos = checkPageBreak(doc, yPos, 80);
    yPos = addText(doc, '6.2 Standards References', SPACING.margin, yPos, {
      fontSize: FONT_SIZES.subheading,
      fontStyle: 'bold',
    });
    yPos += SPACING.lineHeight;

    const standardsRef = `This assessment was conducted in accordance with the following professional standards and frameworks:

ASIS International Standards:
• ASIS Certified Protection Professional (CPP) Body of Knowledge
• Physical Security Design Principles
• Risk Assessment and Management Frameworks
• Security Systems Performance Criteria
• Lighting Standards: Detection (0.5fc), Recognition (1.0fc), Identification (2.0fc)
• CCTV Resolution: Recognition (35 Px/ft), Identification (46 Px/ft), License Plates (70 Px/ft)

U.S. Army Field Manual Standards:
• FM 3-19.30 - Physical Security
• Perimeter Security Requirements: Minimum 7-foot chain link with 3-strand barbed wire
• Defense-in-Depth Security Principles
• Access Control Performance Standards
• Balanced Design Principle: Each barrier element provides equal delay

Additional References:
• Life Safety Codes for Emergency Lighting
• Parking Structure Lighting: 5 fc with uniformity ratio of 4:1 maximum
• Intrusion Detection System Classifications: Passive/Active, Covert/Visible
• AC&D System Requirements for Central Monitoring

All assessments and recommendations in this report are based on these professional standards to ensure industry best practices are applied throughout the security evaluation process.`;

    yPos = addText(doc, standardsRef, SPACING.margin + 5, yPos, {
      fontSize: FONT_SIZES.small,
    });

    addPageNumbers(doc);

    const filename = `Technical-Report-${assessmentId}.pdf`;
    doc.save(filename);

    console.log(`Technical Report PDF generated successfully: ${filename}`);
  } catch (error) {
    console.error('Error generating Technical Report PDF:', error);
    throw error;
  }
}
