import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  PageBreak,
  TabStopType,
  TabStopPosition,
} from 'docx';
import { format } from 'date-fns';

interface ComprehensiveReportData {
  assessment: {
    id: string;
    title: string;
    description?: string;
    assessor?: string;
    status?: string;
    createdAt?: Date | string | null;
  };
  site?: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  riskSummary: {
    totalScenarios: number;
    averageInherentRisk: number;
    averageCurrentRisk: number;
    averageResidualRisk: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    topThreats: Array<{
      scenario: string;
      likelihood: string;
      impact: string;
      riskScore: number;
    }>;
  };
  geoIntel?: {
    crimeData: Array<{
      source: {
        dataSource: string;
        jurisdiction?: string;
      };
      observations: Array<{
        startDate?: string | null;
        violentCrimes?: any;
        propertyCrimes?: any;
      }>;
    }>;
    incidents: Array<{
      incidentDate: string | Date;
      incidentType: string;
      description?: string;
      severity?: string;
    }>;
    riskIntelligence?: {
      overallRiskLevel: string;
      keyInsights: string[];
      recommendedControls: string[];
      threatIntelligence: Array<{
        threatName: string;
        suggestedLikelihood: string;
        rationale: string;
      }>;
    } | null;
  };
  photoEvidence: Array<{
    url: string;
    caption?: string;
    section: string;
  }>;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    scenario: string;
    risk: string;
    timeframe?: string;
  }>;
}

// Normalize and validate report data to ensure all required fields exist
function normalizeReportData(data: any): ComprehensiveReportData {
  const assessment = {
    id: data?.assessment?.id || 'unknown',
    title: data?.assessment?.title || 'Untitled Assessment',
    description: data?.assessment?.description,
    assessor: data?.assessment?.assessor,
    status: data?.assessment?.status,
    createdAt: data?.assessment?.createdAt || new Date().toISOString(),
  };
  
  if (assessment.createdAt && typeof assessment.createdAt === 'object') {
    assessment.createdAt = (assessment.createdAt as Date).toISOString();
  }
  
  const rawRiskSummary = data?.riskSummary || {};
  const riskSummary = {
    totalScenarios: Number(rawRiskSummary.totalScenarios) || 0,
    averageInherentRisk: Number(rawRiskSummary.averageInherentRisk) || 0,
    averageCurrentRisk: Number(rawRiskSummary.averageCurrentRisk) || 0,
    averageResidualRisk: Number(rawRiskSummary.averageResidualRisk) || 0,
    highRiskCount: Number(rawRiskSummary.highRiskCount) || 0,
    mediumRiskCount: Number(rawRiskSummary.mediumRiskCount) || 0,
    lowRiskCount: Number(rawRiskSummary.lowRiskCount) || 0,
    topThreats: Array.isArray(rawRiskSummary.topThreats) 
      ? rawRiskSummary.topThreats
          .filter((t: any) => t && typeof t === 'object')
          .map((t: any) => ({
            scenario: typeof t.scenario === 'string' ? t.scenario : 'Unknown Scenario',
            likelihood: typeof t.likelihood === 'string' ? t.likelihood : 'Unknown',
            impact: typeof t.impact === 'string' ? t.impact : 'Unknown',
            riskScore: Number(t.riskScore) || 0
          }))
      : []
  };
  
  let geoIntel: ComprehensiveReportData['geoIntel'];
  if (data?.geoIntel && typeof data.geoIntel === 'object') {
    geoIntel = {
      crimeData: Array.isArray(data.geoIntel.crimeData)
        ? data.geoIntel.crimeData.filter((c: any) => c && typeof c === 'object')
        : [],
      incidents: Array.isArray(data.geoIntel.incidents)
        ? data.geoIntel.incidents.filter((i: any) => i && typeof i === 'object')
        : [],
      riskIntelligence: data.geoIntel.riskIntelligence && typeof data.geoIntel.riskIntelligence === 'object'
        ? {
            overallRiskLevel: data.geoIntel.riskIntelligence.overallRiskLevel || 'Unknown',
            keyInsights: Array.isArray(data.geoIntel.riskIntelligence.keyInsights)
              ? data.geoIntel.riskIntelligence.keyInsights.filter((k: any) => typeof k === 'string')
              : [],
            recommendedControls: Array.isArray(data.geoIntel.riskIntelligence.recommendedControls)
              ? data.geoIntel.riskIntelligence.recommendedControls.filter((r: any) => typeof r === 'string')
              : [],
            threatIntelligence: Array.isArray(data.geoIntel.riskIntelligence.threatIntelligence)
              ? data.geoIntel.riskIntelligence.threatIntelligence.filter((t: any) => t && typeof t === 'object')
              : []
          }
        : null
    };
  }
  
  const photoEvidence = Array.isArray(data?.photoEvidence)
    ? data.photoEvidence
        .filter((p: any) => p && typeof p === 'object' && p.url && typeof p.url === 'string')
        .map((p: any) => ({
          url: p.url,
          caption: typeof p.caption === 'string' ? p.caption : undefined,
          section: typeof p.section === 'string' ? p.section : 'General'
        }))
    : [];
  
  const recommendations = Array.isArray(data?.recommendations)
    ? data.recommendations.filter((r: any) => r && typeof r === 'object')
    : [];
  
  return {
    assessment,
    site: data?.site && typeof data.site === 'object' ? data.site : undefined,
    riskSummary,
    geoIntel,
    photoEvidence,
    recommendations
  };
}

export async function generateDOCXReport(
  data: ComprehensiveReportData,
  organizationName?: string
): Promise<Blob> {
  // Normalize and validate data to prevent crashes from malformed payloads
  const normalizedData = normalizeReportData(data);
  
  const sections: any[] = [];
  
  // Cover Page
  sections.push(
    new Paragraph({
      text: 'PHYSICAL SECURITY',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: convertInchesToTwip(2), after: convertInchesToTwip(0.5) },
    }),
    new Paragraph({
      text: 'RISK ASSESSMENT REPORT',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: convertInchesToTwip(1) },
    }),
    new Paragraph({
      text: normalizedData.assessment.title || 'Untitled Assessment',
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: convertInchesToTwip(2) },
    })
  );
  
  // Site information
  if (normalizedData.site) {
    sections.push(
      new Paragraph({
        text: 'FACILITY INFORMATION',
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.CENTER,
        spacing: { before: convertInchesToTwip(1), after: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `Site: ${normalizedData.site.name}`,
            bold: true,
          }),
        ],
      })
    );
    
    if (normalizedData.site.address || normalizedData.site.city || normalizedData.site.state) {
      const locationParts = [normalizedData.site.address, normalizedData.site.city, normalizedData.site.state].filter(Boolean);
      sections.push(
        new Paragraph({
          text: `Location: ${locationParts.join(', ')}`,
          alignment: AlignmentType.CENTER,
        })
      );
    }
  }
  
  // Assessment metadata
  sections.push(
    new Paragraph({
      text: `Assessment Date: ${normalizedData.assessment.createdAt ? format(new Date(normalizedData.assessment.createdAt), 'MMMM dd, yyyy') : 'N/A'}`,
      alignment: AlignmentType.CENTER,
      spacing: { before: convertInchesToTwip(0.5) },
    })
  );
  
  if (normalizedData.assessment.assessor) {
    sections.push(
      new Paragraph({
        text: `Assessor: ${normalizedData.assessment.assessor}`,
        alignment: AlignmentType.CENTER,
      })
    );
  }
  
  if (organizationName) {
    sections.push(
      new Paragraph({
        text: `Organization: ${organizationName}`,
        alignment: AlignmentType.CENTER,
      })
    );
  }
  
  sections.push(
    new Paragraph({
      text: 'CONFIDENTIAL',
      alignment: AlignmentType.CENTER,
      spacing: { before: convertInchesToTwip(2) },
      children: [
        new TextRun({
          text: 'CONFIDENTIAL',
          bold: true,
          color: 'DC2626',
          size: 28,
        }),
      ],
    })
  );
  
  // Page break before Executive Summary
  sections.push(new Paragraph({ children: [new PageBreak()] }));
  
  // Executive Summary
  sections.push(
    new Paragraph({
      text: 'EXECUTIVE SUMMARY',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: convertInchesToTwip(0.3) },
    })
  );
  
  if (normalizedData.assessment.description) {
    sections.push(
      new Paragraph({
        text: normalizedData.assessment.description,
        spacing: { after: convertInchesToTwip(0.5) },
      })
    );
  }
  
  // Risk Overview
  sections.push(
    new Paragraph({
      text: 'Risk Overview',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: convertInchesToTwip(0.5), after: convertInchesToTwip(0.2) },
    })
  );
  
  const riskRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Metric', bold: true })] })],
          shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true })] })],
          shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Total Risk Scenarios')] }),
        new TableCell({ children: [new Paragraph(normalizedData.riskSummary.totalScenarios.toString())] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('High Risk Count')] }),
        new TableCell({ children: [new Paragraph(normalizedData.riskSummary.highRiskCount.toString())] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Medium Risk Count')] }),
        new TableCell({ children: [new Paragraph(normalizedData.riskSummary.mediumRiskCount.toString())] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Low Risk Count')] }),
        new TableCell({ children: [new Paragraph(normalizedData.riskSummary.lowRiskCount.toString())] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Average Inherent Risk')] }),
        new TableCell({ children: [new Paragraph(normalizedData.riskSummary.averageInherentRisk.toFixed(2))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Average Current Risk')] }),
        new TableCell({ children: [new Paragraph(normalizedData.riskSummary.averageCurrentRisk.toFixed(2))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Average Residual Risk')] }),
        new TableCell({ children: [new Paragraph(normalizedData.riskSummary.averageResidualRisk.toFixed(2))] }),
      ],
    }),
  ];
  
  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: riskRows,
    })
  );
  
  // Top Threats
  if (normalizedData.riskSummary.topThreats && normalizedData.riskSummary.topThreats.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Top Risk Scenarios',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: convertInchesToTwip(0.5), after: convertInchesToTwip(0.2) },
      })
    );
    
    const threatRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Scenario', bold: true })] })],
            shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Likelihood', bold: true })] })],
            shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Impact', bold: true })] })],
            shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Risk Score', bold: true })] })],
            shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
          }),
        ],
      }),
      ...normalizedData.riskSummary.topThreats.slice(0, 10).map(
        (threat) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(threat.scenario || 'N/A')] }),
              new TableCell({ children: [new Paragraph(threat.likelihood || 'N/A')] }),
              new TableCell({ children: [new Paragraph(threat.impact || 'N/A')] }),
              new TableCell({ children: [new Paragraph((threat.riskScore || 0).toFixed(2))] }),
            ],
          })
      ),
    ];
    
    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: threatRows,
      })
    );
  }
  
  // GeoIntel Insights
  if (normalizedData.geoIntel?.riskIntelligence) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(
      new Paragraph({
        text: 'GEOGRAPHIC INTELLIGENCE',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: convertInchesToTwip(0.3) },
      })
    );
    
    sections.push(
      new Paragraph({
        text: `Overall Risk Level: ${normalizedData.geoIntel.riskIntelligence.overallRiskLevel}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: convertInchesToTwip(0.3) },
      })
    );
    
    if (normalizedData.geoIntel.riskIntelligence.keyInsights && normalizedData.geoIntel.riskIntelligence.keyInsights.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Key Insights',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: convertInchesToTwip(0.3), after: convertInchesToTwip(0.2) },
        })
      );
      
      normalizedData.geoIntel.riskIntelligence.keyInsights.forEach((insight) => {
        sections.push(
          new Paragraph({
            text: `• ${insight}`,
            spacing: { before: convertInchesToTwip(0.1) },
          })
        );
      });
    }
    
    if (normalizedData.geoIntel.riskIntelligence.recommendedControls && normalizedData.geoIntel.riskIntelligence.recommendedControls.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Recommended Controls',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: convertInchesToTwip(0.3), after: convertInchesToTwip(0.2) },
        })
      );
      
      normalizedData.geoIntel.riskIntelligence.recommendedControls.forEach((control) => {
        sections.push(
          new Paragraph({
            text: `• ${control}`,
            spacing: { before: convertInchesToTwip(0.1) },
          })
        );
      });
    }
  }
  
  // Recommendations
  if (normalizedData.recommendations && normalizedData.recommendations.length > 0) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(
      new Paragraph({
        text: 'RECOMMENDATIONS',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: convertInchesToTwip(0.3) },
      })
    );
    
    const recommendationRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Priority', bold: true })] })],
            shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Scenario', bold: true })] })],
            shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Risk', bold: true })] })],
            shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Timeframe', bold: true })] })],
            shading: { fill: 'E5E7EB', type: ShadingType.CLEAR },
          }),
        ],
      }),
      ...normalizedData.recommendations.map(
        (rec) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(rec.priority?.toUpperCase() || 'N/A')] }),
              new TableCell({ children: [new Paragraph(rec.scenario || 'N/A')] }),
              new TableCell({ children: [new Paragraph(rec.risk || 'N/A')] }),
              new TableCell({ children: [new Paragraph(rec.timeframe || 'N/A')] }),
            ],
          })
      ),
    ];
    
    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: recommendationRows,
      })
    );
  }
  
  // Photo Evidence
  if (normalizedData.photoEvidence && normalizedData.photoEvidence.length > 0) {
    sections.push(new Paragraph({ children: [new PageBreak()] }));
    sections.push(
      new Paragraph({
        text: 'PHOTO EVIDENCE',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: convertInchesToTwip(0.3) },
      })
    );
    
    sections.push(
      new Paragraph({
        text: `Total Photos: ${normalizedData.photoEvidence.length}`,
        spacing: { after: convertInchesToTwip(0.2) },
      })
    );
    
    normalizedData.photoEvidence.forEach((photo, index) => {
      sections.push(
        new Paragraph({
          text: `Photo ${index + 1}: ${photo.caption || 'No caption'}`,
          spacing: { before: convertInchesToTwip(0.2) },
        }),
        new Paragraph({
          text: `Section: ${photo.section}`,
        }),
        new Paragraph({
          text: `URL: ${photo.url}`,
          spacing: { after: convertInchesToTwip(0.3) },
        })
      );
    });
  }
  
  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });
  
  // Generate and return blob
  const blob = await Packer.toBlob(doc);
  return blob;
}
