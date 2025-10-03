import jsPDF from 'jspdf';

export interface RiskScenario {
  id: string;
  title: string;
  likelihood: number;
  impact: number;
  riskLevel: string;
  riskScore: number;
}

export interface PDFTextOptions {
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic';
  color?: number[];
  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
}

const COLORS = {
  primary: [41, 128, 185] as [number, number, number],
  primaryDark: [26, 82, 118] as [number, number, number],
  danger: [220, 53, 69] as [number, number, number],
  warning: [255, 152, 0] as [number, number, number],
  success: [40, 167, 69] as [number, number, number],
  info: [23, 162, 184] as [number, number, number],
  muted: [108, 117, 125] as [number, number, number],
  text: [33, 37, 41] as [number, number, number],
  textLight: [108, 117, 125] as [number, number, number],
  border: [222, 226, 230] as [number, number, number],
  background: [248, 249, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  
  critical: [220, 53, 69] as [number, number, number],
  high: [255, 152, 0] as [number, number, number],
  medium: [255, 193, 7] as [number, number, number],
  low: [23, 162, 184] as [number, number, number],
  veryLow: [40, 167, 69] as [number, number, number],
};

const FONTS = {
  header: { family: 'helvetica', style: 'bold' as const },
  body: { family: 'helvetica', style: 'normal' as const },
  italic: { family: 'helvetica', style: 'italic' as const },
};

const SPACING = {
  margin: 20,
  lineHeight: 7,
  sectionGap: 15,
  smallGap: 5,
  headerHeight: 25,
  footerHeight: 15,
};

const FONT_SIZES = {
  title: 18,
  heading: 14,
  subheading: 12,
  body: 10,
  small: 8,
};

export function getRiskLevelColor(riskLevel: string): [number, number, number] {
  const level = riskLevel.toLowerCase().replace(/\s+/g, '');
  switch (level) {
    case 'critical':
      return COLORS.critical;
    case 'high':
      return COLORS.high;
    case 'medium':
      return COLORS.medium;
    case 'low':
      return COLORS.low;
    case 'verylow':
      return COLORS.veryLow;
    default:
      return COLORS.muted;
  }
}

export function calculateRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

export function getRiskLevel(score: number): string {
  if (score >= 20) return 'Critical';
  if (score >= 15) return 'High';
  if (score >= 10) return 'Medium';
  if (score >= 5) return 'Low';
  return 'Very Low';
}

export function createPDF(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.setFontSize(FONT_SIZES.body);
  
  return doc;
}

export function addHeader(
  doc: jsPDF,
  title: string,
  assessmentId: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, SPACING.headerHeight, 'F');
  
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(FONT_SIZES.title);
  doc.text('RiskFixer', SPACING.margin, 12);
  
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.text(title, SPACING.margin, 19);
  
  doc.setFontSize(FONT_SIZES.small);
  doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
  const idText = `ID: ${assessmentId.substring(0, 8)}`;
  const idWidth = doc.getTextWidth(idText);
  doc.text(idText, pageWidth - SPACING.margin - idWidth, 19);
  
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  return SPACING.headerHeight + SPACING.sectionGap;
}

export function addFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const y = pageHeight - 10;
  
  doc.setFontSize(FONT_SIZES.small);
  doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
  doc.setFont(FONTS.body.family, FONTS.body.style);
  
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(timestamp, SPACING.margin, y);
  
  const pageText = `Page ${pageNum} of ${totalPages}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(pageText, pageWidth - SPACING.margin - pageTextWidth, y);
  
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
}

export function addSection(doc: jsPDF, title: string, y: number): number {
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(FONT_SIZES.heading);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  
  doc.text(title, SPACING.margin, y);
  
  const lineY = y + 2;
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(SPACING.margin, lineY, SPACING.margin + 60, lineY);
  
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.setFontSize(FONT_SIZES.body);
  
  return y + SPACING.lineHeight + SPACING.smallGap;
}

export function addText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: PDFTextOptions = {}
): number {
  const {
    fontSize = FONT_SIZES.body,
    fontStyle = 'normal',
    color = COLORS.text,
    align = 'left',
    maxWidth = doc.internal.pageSize.getWidth() - 2 * SPACING.margin,
  } = options;
  
  doc.setFontSize(fontSize);
  doc.setFont(FONTS.body.family, fontStyle);
  doc.setTextColor(color[0], color[1], color[2]);
  
  const lines = doc.splitTextToSize(text, maxWidth);
  
  lines.forEach((line: string, index: number) => {
    const currentY = y + index * SPACING.lineHeight;
    
    if (align === 'center') {
      const textWidth = doc.getTextWidth(line);
      const centerX = (doc.internal.pageSize.getWidth() - textWidth) / 2;
      doc.text(line, centerX, currentY);
    } else if (align === 'right') {
      const textWidth = doc.getTextWidth(line);
      const rightX = doc.internal.pageSize.getWidth() - SPACING.margin - textWidth;
      doc.text(line, rightX, currentY);
    } else {
      doc.text(line, x, currentY);
    }
  });
  
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.setFontSize(FONT_SIZES.body);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  return y + lines.length * SPACING.lineHeight;
}

export function drawRiskMatrix(
  doc: jsPDF,
  x: number,
  y: number,
  scenarios: RiskScenario[]
): number {
  const gridSize = 30;
  const cellSize = gridSize / 5;
  const padding = 15;
  
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(FONT_SIZES.small);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text('Impact', x + padding + gridSize / 2 - 5, y - 5);
  
  doc.text('Likelihood', x - 5, y + padding - 2);
  
  doc.setFont(FONTS.body.family, FONTS.body.style);
  
  for (let i = 0; i <= 5; i++) {
    for (let j = 0; j <= 5; j++) {
      if (i === 0 || j === 0) continue;
      
      const cellX = x + padding + (j - 1) * cellSize;
      const cellY = y + padding + (5 - i) * cellSize;
      
      const score = i * j;
      const level = getRiskLevel(score);
      const color = getRiskLevelColor(level);
      
      doc.setFillColor(color[0], color[1], color[2], 0.2);
      doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
      doc.rect(cellX, cellY, cellSize, cellSize, 'FD');
    }
  }
  
  doc.setFontSize(FONT_SIZES.small);
  doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
  for (let i = 1; i <= 5; i++) {
    doc.text(i.toString(), x + padding - 3, y + padding + (5.5 - i) * cellSize);
    doc.text(i.toString(), x + padding + (i - 0.7) * cellSize, y + padding + gridSize + 4);
  }
  
  scenarios.forEach((scenario) => {
    if (scenario.likelihood && scenario.impact) {
      const dotX = x + padding + (scenario.impact - 0.5) * cellSize;
      const dotY = y + padding + (5 - scenario.likelihood + 0.5) * cellSize;
      
      const color = getRiskLevelColor(scenario.riskLevel);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(dotX, dotY, 1.5, 'F');
      
      doc.setDrawColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
      doc.setLineWidth(0.3);
      doc.circle(dotX, dotY, 1.5, 'S');
    }
  });
  
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  return y + padding + gridSize + 10;
}

export function drawRiskBar(
  doc: jsPDF,
  x: number,
  y: number,
  riskLevel: string,
  score: number
): number {
  const barWidth = 80;
  const barHeight = 8;
  
  const color = getRiskLevelColor(riskLevel);
  
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.setLineWidth(0.3);
  doc.rect(x, y, barWidth, barHeight);
  
  const fillWidth = Math.min((score / 25) * barWidth, barWidth);
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(x, y, fillWidth, barHeight, 'F');
  
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  
  if (fillWidth > 20) {
    const text = `${riskLevel} (${score})`;
    const textWidth = doc.getTextWidth(text);
    doc.text(text, x + fillWidth - textWidth - 2, y + barHeight / 2 + 1.5);
  } else {
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    const text = `${riskLevel} (${score})`;
    doc.text(text, x + fillWidth + 2, y + barHeight / 2 + 1.5);
  }
  
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  return y + barHeight + SPACING.smallGap;
}

export function drawTable(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  startY: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = pageWidth - 2 * SPACING.margin;
  const colWidth = tableWidth / headers.length;
  
  let currentY = startY;
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(SPACING.margin, currentY, tableWidth, 8, 'F');
  
  doc.setFont(FONTS.header.family, FONTS.header.style);
  doc.setFontSize(FONT_SIZES.body);
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  
  headers.forEach((header, i) => {
    doc.text(
      header,
      SPACING.margin + i * colWidth + 2,
      currentY + 6
    );
  });
  
  currentY += 8;
  
  doc.setFont(FONTS.body.family, FONTS.body.style);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(FONT_SIZES.small);
  
  rows.forEach((row, rowIndex) => {
    const rowHeight = 7;
    
    if (rowIndex % 2 === 0) {
      doc.setFillColor(COLORS.background[0], COLORS.background[1], COLORS.background[2]);
      doc.rect(SPACING.margin, currentY, tableWidth, rowHeight, 'F');
    }
    
    row.forEach((cell, colIndex) => {
      const cellX = SPACING.margin + colIndex * colWidth + 2;
      const maxCellWidth = colWidth - 4;
      
      const lines = doc.splitTextToSize(cell, maxCellWidth);
      const displayText = lines[0] || '';
      
      doc.text(displayText, cellX, currentY + 5);
    });
    
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.1);
    doc.line(SPACING.margin, currentY + rowHeight, SPACING.margin + tableWidth, currentY + rowHeight);
    
    currentY += rowHeight;
  });
  
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  return currentY + SPACING.smallGap;
}

export function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  requiredSpace: number = 40
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 25;
  
  if (currentY + requiredSpace > pageHeight - bottomMargin) {
    doc.addPage();
    return SPACING.margin;
  }
  
  return currentY;
}

export function addPageNumbers(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
}

export const PDF_CONFIG = {
  COLORS,
  FONTS,
  SPACING,
  FONT_SIZES,
};
