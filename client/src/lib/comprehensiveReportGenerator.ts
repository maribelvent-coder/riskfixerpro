import jsPDF from 'jspdf';
import {
  createPDF,
  addHeader,
  addSection,
  addText,
  drawRiskMatrix,
  drawRiskBar,
  drawTable,
  checkPageBreak,
  addPageNumbers,
  PDF_CONFIG,
  getRiskLevelColor,
  type RiskScenario as PDFRiskScenario
} from './pdfService';

const { COLORS, SPACING, FONT_SIZES, FONTS } = PDF_CONFIG;

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

export async function generateComprehensiveReport(
  data: ComprehensiveReportData,
  organizationName?: string
): Promise<jsPDF> {
  const doc = createPDF();
  
  let yPos = SPACING.margin;
  
  // Cover Page
  yPos = addCoverPage(doc, data, organizationName);
  
  // Executive Summary
  doc.addPage();
  yPos = SPACING.margin;
  yPos = addExecutiveSummary(doc, data, yPos);
  
  // Risk Analysis Section
  doc.addPage();
  yPos = SPACING.margin;
  yPos = addRiskAnalysis(doc, data, yPos);
  
  // Site Information & GeoIntel
  if (data.site || data.geoIntel) {
    doc.addPage();
    yPos = SPACING.margin;
    yPos = addSiteInformation(doc, data, yPos);
  }
  
  // Recommendations
  doc.addPage();
  yPos = SPACING.margin;
  yPos = addRecommendations(doc, data, yPos);
  
  // Appendix - Photo Evidence
  if (data.photoEvidence.length > 0) {
    doc.addPage();
    yPos = SPACING.margin;
    yPos = addPhotoEvidenceSection(doc, data, yPos);
  }
  
  // Add page numbers to all pages
  addPageNumbers(doc);
  
  return doc;
}

function addCoverPage(
  doc: jsPDF,
  data: ComprehensiveReportData,
  organizationName?: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header bar
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Title
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(24);
  doc.text('Security Risk Assessment', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text('Comprehensive Report', pageWidth / 2, 45, { align: 'center' });
  
  // Assessment Title
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(16);
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.text(data.assessment.title, pageWidth / 2, 80, { align: 'center' });
  
  // Site Name (if available)
  if (data.site) {
    doc.setFontSize(14);
    doc.setFont(FONTS.body.family, FONTS.body.style);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text(data.site.name, pageWidth / 2, 95, { align: 'center' });
    
    if (data.site.city && data.site.state) {
      doc.setFontSize(12);
      doc.text(`${data.site.city}, ${data.site.state}`, pageWidth / 2, 105, { align: 'center' });
    }
  }
  
  // Date and Assessor
  doc.setFontSize(12);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  const date = data.assessment.createdAt 
    ? new Date(data.assessment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  
  doc.text(`Assessment Date: ${date}`, pageWidth / 2, pageHeight - 80, { align: 'center' });
  
  if (data.assessment.assessor) {
    doc.text(`Assessor: ${data.assessment.assessor}`, pageWidth / 2, pageHeight - 70, { align: 'center' });
  }
  
  // Organization Name
  if (organizationName) {
    doc.setFont(FONTS.header.family, FONTS.header.style);
    doc.text(organizationName, pageWidth / 2, pageHeight - 50, { align: 'center' });
  }
  
  // Footer bar
  doc.setFillColor(COLORS.primaryDark[0], COLORS.primaryDark[1], COLORS.primaryDark[2]);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFontSize(10);
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.text('Confidential - For Internal Use Only', pageWidth / 2, pageHeight - 15, { align: 'center' });
  
  return 0;
}

function addExecutiveSummary(
  doc: jsPDF,
  data: ComprehensiveReportData,
  startY: number
): number {
  let yPos = startY;
  
  yPos = addSection(doc, 'Executive Summary', yPos);
  yPos += SPACING.smallGap;
  
  // Overall Risk Assessment
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(FONT_SIZES.subheading);
  doc.text('Overall Risk Profile', SPACING.margin, yPos);
  yPos += SPACING.lineHeight;
  
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.setFontSize(FONT_SIZES.body);
  
  const summary = `This assessment identified ${data.riskSummary.totalScenarios} risk scenarios across the facility. ` +
    `The analysis reveals ${data.riskSummary.highRiskCount} high-risk areas requiring immediate attention, ` +
    `${data.riskSummary.mediumRiskCount} medium-risk areas requiring planned mitigation, and ` +
    `${data.riskSummary.lowRiskCount} low-risk areas for ongoing monitoring.`;
  
  yPos = addText(doc, summary, SPACING.margin, yPos);
  yPos += SPACING.smallGap;
  
  // Risk Metrics
  yPos = checkPageBreak(doc, yPos, 50);
  yPos += SPACING.smallGap;
  
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(FONT_SIZES.subheading);
  doc.text('Risk Metrics', SPACING.margin, yPos);
  yPos += SPACING.lineHeight;
  
  const metrics = [
    ['Metric', 'Score'],
    ['Average Inherent Risk', data.riskSummary.averageInherentRisk.toFixed(1)],
    ['Average Current Risk', data.riskSummary.averageCurrentRisk.toFixed(1)],
    ['Average Residual Risk', data.riskSummary.averageResidualRisk.toFixed(1)],
  ];
  
  yPos = drawTable(doc, metrics[0], metrics.slice(1), yPos);
  yPos += SPACING.sectionGap;
  
  // Top Threats
  yPos = checkPageBreak(doc, yPos, 60);
  
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(FONT_SIZES.subheading);
  doc.text('Top Threats', SPACING.margin, yPos);
  yPos += SPACING.lineHeight;
  
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.setFontSize(FONT_SIZES.body);
  
  data.riskSummary.topThreats.slice(0, 5).forEach((threat, index) => {
    yPos = checkPageBreak(doc, yPos, 15);
    doc.text(`${index + 1}. ${threat.scenario}`, SPACING.margin + 5, yPos);
    yPos += SPACING.lineHeight;
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.setFontSize(FONT_SIZES.small);
    doc.text(`   Risk Score: ${threat.riskScore} | Likelihood: ${threat.likelihood} | Impact: ${threat.impact}`, SPACING.margin + 5, yPos);
    yPos += SPACING.lineHeight;
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFontSize(FONT_SIZES.body);
  });
  
  yPos += SPACING.sectionGap;
  
  // Key Findings from GeoIntel
  if (data.geoIntel?.riskIntelligence?.keyInsights && data.geoIntel.riskIntelligence.keyInsights.length > 0) {
    yPos = checkPageBreak(doc, yPos, 40);
    
    doc.setFont(FONTS.header.family, FONTS.header.style);
    doc.setFontSize(FONT_SIZES.subheading);
    doc.text('Geographic Intelligence Insights', SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    
    doc.setFont(FONTS.body.family, FONTS.body.style);
    doc.setFontSize(FONT_SIZES.body);
    
    data.geoIntel.riskIntelligence.keyInsights.forEach((insight) => {
      yPos = checkPageBreak(doc, yPos, 12);
      doc.text('•', SPACING.margin + 2, yPos);
      yPos = addText(doc, insight, SPACING.margin + 7, yPos, { maxWidth: 160 });
      yPos += 2;
    });
  }
  
  return yPos;
}

function addRiskAnalysis(
  doc: jsPDF,
  data: ComprehensiveReportData,
  startY: number
): number {
  let yPos = startY;
  
  yPos = addSection(doc, 'Risk Analysis', yPos);
  yPos += SPACING.smallGap;
  
  // Risk Distribution
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(FONT_SIZES.subheading);
  doc.text('Risk Distribution', SPACING.margin, yPos);
  yPos += SPACING.lineHeight + SPACING.smallGap;
  
  // Draw risk distribution bars
  const riskCounts = [
    { level: 'High Risk', count: data.riskSummary.highRiskCount, color: COLORS.high },
    { level: 'Medium Risk', count: data.riskSummary.mediumRiskCount, color: COLORS.medium },
    { level: 'Low Risk', count: data.riskSummary.lowRiskCount, color: COLORS.low },
  ];
  
  riskCounts.forEach(({ level, count, color }) => {
    doc.setFont(FONTS.body.family, FONTS.body.style);
    doc.setFontSize(FONT_SIZES.body);
    doc.text(level, SPACING.margin, yPos);
    
    const barX = SPACING.margin + 40;
    const maxBarWidth = 100;
    const barWidth = data.riskSummary.totalScenarios > 0 
      ? (count / data.riskSummary.totalScenarios) * maxBarWidth 
      : 0;
    
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(barX, yPos - 4, barWidth, 6, 'F');
    
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.rect(barX, yPos - 4, maxBarWidth, 6);
    
    doc.text(`${count}`, barX + maxBarWidth + 5, yPos);
    
    yPos += 10;
  });
  
  yPos += SPACING.sectionGap;
  
  // Risk Matrix (if we have scenarios with likelihood and impact)
  const hasRiskMatrix = data.riskSummary.topThreats.some(t => t.likelihood && t.impact);
  if (hasRiskMatrix) {
    yPos = checkPageBreak(doc, yPos, 80);
    
    doc.setFont(FONTS.header.family, FONTS.header.style);
    doc.setFontSize(FONT_SIZES.subheading);
    doc.text('Risk Matrix', SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    
    // Convert top threats to PDFRiskScenario format for the matrix
    const matrixScenarios: PDFRiskScenario[] = data.riskSummary.topThreats.map((threat, idx) => {
      // Map likelihood and impact strings to numeric values (1-5)
      const likelihoodMap: Record<string, number> = {
        'very-low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very-high': 5
      };
      const impactMap: Record<string, number> = {
        'negligible': 1, 'minor': 2, 'moderate': 3, 'major': 4, 'catastrophic': 5
      };
      
      const likelihood = likelihoodMap[threat.likelihood] || 3;
      const impact = impactMap[threat.impact] || 3;
      const riskScore = likelihood * impact;
      
      let riskLevel = 'Medium';
      if (riskScore >= 20) riskLevel = 'Critical';
      else if (riskScore >= 15) riskLevel = 'High';
      else if (riskScore >= 10) riskLevel = 'Medium';
      else if (riskScore >= 5) riskLevel = 'Low';
      else riskLevel = 'Very Low';
      
      return {
        id: idx.toString(),
        title: threat.scenario,
        likelihood,
        impact,
        riskLevel,
        riskScore
      };
    });
    
    yPos = drawRiskMatrix(doc, SPACING.margin + 20, yPos, matrixScenarios);
  }
  
  return yPos;
}

function addSiteInformation(
  doc: jsPDF,
  data: ComprehensiveReportData,
  startY: number
): number {
  let yPos = startY;
  
  yPos = addSection(doc, 'Site Information & Geographic Intelligence', yPos);
  yPos += SPACING.smallGap;
  
  // Site Details
  if (data.site) {
    doc.setFont(FONTS.header.family, FONTS.header.style);
    doc.setFontSize(FONT_SIZES.subheading);
    doc.text('Site Details', SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    
    doc.setFont(FONTS.body.family, FONTS.body.style);
    doc.setFontSize(FONT_SIZES.body);
    
    doc.text(`Name: ${data.site.name}`, SPACING.margin + 5, yPos);
    yPos += SPACING.lineHeight;
    
    if (data.site.address) {
      doc.text(`Address: ${data.site.address}`, SPACING.margin + 5, yPos);
      yPos += SPACING.lineHeight;
    }
    
    if (data.site.city && data.site.state) {
      doc.text(`Location: ${data.site.city}, ${data.site.state}`, SPACING.margin + 5, yPos);
      yPos += SPACING.lineHeight;
    }
    
    yPos += SPACING.sectionGap;
  }
  
  // Crime Data Summary
  if (data.geoIntel?.crimeData && data.geoIntel.crimeData.length > 0) {
    yPos = checkPageBreak(doc, yPos, 40);
    
    doc.setFont(FONTS.header.family, FONTS.header.style);
    doc.setFontSize(FONT_SIZES.subheading);
    doc.text('Local Crime Context', SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    
    doc.setFont(FONTS.body.family, FONTS.body.style);
    doc.setFontSize(FONT_SIZES.body);
    
    data.geoIntel.crimeData.forEach(({ source, observations }) => {
      if (observations.length > 0) {
        yPos = checkPageBreak(doc, yPos, 20);
        doc.text(`Source: ${source.dataSource}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;
        
        if (source.jurisdiction) {
          doc.text(`Jurisdiction: ${source.jurisdiction}`, SPACING.margin + 5, yPos);
          yPos += SPACING.lineHeight;
        }
        
        const latestObs = observations[observations.length - 1];
        if (latestObs.violentCrimes) {
          const violentTotal = latestObs.violentCrimes.total || 0;
          doc.text(`Violent Crimes: ${violentTotal}`, SPACING.margin + 5, yPos);
          yPos += SPACING.lineHeight;
        }
        
        if (latestObs.propertyCrimes) {
          const propertyTotal = latestObs.propertyCrimes.total || 0;
          doc.text(`Property Crimes: ${propertyTotal}`, SPACING.margin + 5, yPos);
          yPos += SPACING.lineHeight;
        }
        
        yPos += SPACING.smallGap;
      }
    });
  }
  
  // Site Incidents
  if (data.geoIntel?.incidents && data.geoIntel.incidents.length > 0) {
    yPos += SPACING.sectionGap;
    yPos = checkPageBreak(doc, yPos, 40);
    
    doc.setFont(FONTS.header.family, FONTS.header.style);
    doc.setFontSize(FONT_SIZES.subheading);
    doc.text('Recorded Site Incidents', SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    
    doc.setFont(FONTS.body.family, FONTS.body.style);
    doc.setFontSize(FONT_SIZES.small);
    
    const incidentRows = data.geoIntel.incidents.slice(0, 10).map(incident => [
      new Date(incident.incidentDate).toLocaleDateString(),
      incident.incidentType,
      incident.severity || 'N/A',
      incident.description?.substring(0, 40) || ''
    ]);
    
    yPos = drawTable(
      doc,
      ['Date', 'Type', 'Severity', 'Description'],
      incidentRows,
      yPos
    );
  }
  
  return yPos;
}

function addRecommendations(
  doc: jsPDF,
  data: ComprehensiveReportData,
  startY: number
): number {
  let yPos = startY;
  
  yPos = addSection(doc, 'Prioritized Recommendations', yPos);
  yPos += SPACING.smallGap;
  
  if (data.recommendations.length === 0) {
    doc.setFont(FONTS.body.family, FONTS.italic.style);
    doc.setFontSize(FONT_SIZES.body);
    doc.text('No specific recommendations generated.', SPACING.margin, yPos);
    return yPos + SPACING.lineHeight;
  }
  
  // Group by priority
  const critical = data.recommendations.filter(r => r.priority === 'critical');
  const high = data.recommendations.filter(r => r.priority === 'high');
  const medium = data.recommendations.filter(r => r.priority === 'medium');
  const low = data.recommendations.filter(r => r.priority === 'low');
  
  const groups = [
    { title: 'Critical Priority', items: critical, color: COLORS.critical },
    { title: 'High Priority', items: high, color: COLORS.high },
    { title: 'Medium Priority', items: medium, color: COLORS.medium },
    { title: 'Low Priority', items: low, color: COLORS.low },
  ];
  
  groups.forEach(({ title, items, color }) => {
    if (items.length > 0) {
      yPos = checkPageBreak(doc, yPos, 30);
      
      doc.setFont(FONTS.header.family, FONTS.header.style);
      doc.setFontSize(FONT_SIZES.subheading);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, SPACING.margin, yPos);
      yPos += SPACING.lineHeight;
      
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.setFont(FONTS.body.family, FONTS.body.style);
      doc.setFontSize(FONT_SIZES.body);
      
      items.forEach((rec, idx) => {
        yPos = checkPageBreak(doc, yPos, 20);
        
        doc.setFont(FONTS.header.family, FONTS.header.style);
        doc.text(`${idx + 1}. ${rec.scenario}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;
        
        doc.setFont(FONTS.body.family, FONTS.body.style);
        doc.setFontSize(FONT_SIZES.small);
        doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
        
        doc.text(`   Risk Level: ${rec.risk}`, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight - 1;
        
        if (rec.timeframe) {
          doc.text(`   Timeframe: ${rec.timeframe}`, SPACING.margin + 5, yPos);
          yPos += SPACING.lineHeight - 1;
        }
        
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        doc.setFontSize(FONT_SIZES.body);
        yPos += SPACING.smallGap;
      });
      
      yPos += SPACING.sectionGap;
    }
  });
  
  return yPos;
}

function addPhotoEvidenceSection(
  doc: jsPDF,
  data: ComprehensiveReportData,
  startY: number
): number {
  let yPos = startY;
  
  yPos = addSection(doc, 'Appendix: Photo Evidence', yPos);
  yPos += SPACING.smallGap;
  
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.setFontSize(FONT_SIZES.body);
  
  if (data.photoEvidence.length === 0) {
    doc.text('No photo evidence attached to this assessment.', SPACING.margin, yPos);
    return yPos + SPACING.lineHeight;
  }
  
  doc.text(`Total Photos: ${data.photoEvidence.length}`, SPACING.margin, yPos);
  yPos += SPACING.lineHeight + SPACING.smallGap;
  
  // List photo evidence with captions
  data.photoEvidence.forEach((photo, idx) => {
    yPos = checkPageBreak(doc, yPos, 20);
    
    doc.setFont(FONTS.header.family, FONTS.header.style);
    doc.setFontSize(FONT_SIZES.body);
    doc.text(`Photo ${idx + 1}: ${photo.section}`, SPACING.margin + 5, yPos);
    yPos += SPACING.lineHeight;
    
    if (photo.caption) {
      doc.setFont(FONTS.body.family, FONTS.body.style);
      doc.setFontSize(FONT_SIZES.small);
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      yPos = addText(doc, photo.caption, SPACING.margin + 5, yPos, { maxWidth: 160, fontSize: FONT_SIZES.small });
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    }
    
    doc.setFontSize(FONT_SIZES.small);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text(`Path: ${photo.url}`, SPACING.margin + 5, yPos);
    yPos += SPACING.lineHeight;
    
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    yPos += SPACING.smallGap;
  });
  
  return yPos;
}
