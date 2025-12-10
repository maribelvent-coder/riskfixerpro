import puppeteer from 'puppeteer';
import { db } from '../../db';
import { reports } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { generateReportNarratives } from './narrative-generator';
import { renderReportHTML } from './html-renderer';

export interface GenerateReportOptions {
  assessmentId: string;
  reportType: 'executive_summary' | 'full_assessment' | 'gap_analysis';
  options: {
    includeCoverPage: boolean;
    includeGeographicData: boolean;
    includePhotoAppendix: boolean;
    includeCostEstimates: boolean;
  };
  assessment: any;
  scenarios: any[];
}

export async function generateReportWithPDF(params: GenerateReportOptions) {
  const { assessmentId, reportType, options, assessment, scenarios } = params;
  
  const narratives = await generateReportNarratives({
    reportType,
    assessment,
    scenarios,
  });
  
  const reportData = {
    ...narratives,
    assessmentId,
    reportType,
    options,
    assessment,
    scenarios,
    generatedAt: new Date().toISOString(),
  };
  
  const html = renderReportHTML(reportData);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    margin: {
      top: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
      right: '0.75in',
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 9px; width: 100%; text-align: center; color: #666; padding: 0 0.5in;">
        <span>CONFIDENTIAL</span> — 
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });
  
  await browser.close();
  
  const reportTypeNames: Record<string, string> = {
    executive_summary: 'Executive Summary',
    full_assessment: 'Full Assessment Report',
    gap_analysis: 'Gap Analysis Report',
  };
  
  const filename = `${assessment.name.replace(/\s+/g, '_')}_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  const [insertedReport] = await db.insert(reports).values({
    assessmentId: assessmentId,
    type: reportType,
    reportType: reportType,
    title: reportTypeNames[reportType],
    format: 'pdf',
    status: 'completed',
    content: pdfBuffer.toString('base64'),
    fileSize: `${Math.round(pdfBuffer.length / 1024)} KB`,
    generatedAt: new Date(),
  }).returning();
  
  return {
    reportId: insertedReport.id,
    filename,
    downloadUrl: `/api/assessments/${assessmentId}/reports/${insertedReport.id}/download`,
  };
}

export async function listReportsForAssessment(assessmentId: string) {
  const reportsList = await db.query.reports.findMany({
    where: eq(reports.assessmentId, assessmentId),
    orderBy: [desc(reports.generatedAt)],
  });
  
  return reportsList.map(r => ({
    id: r.id,
    type: r.reportType || r.type,
    typeName: r.title,
    createdAt: r.generatedAt,
    pageCount: 0,
    fileSize: r.fileSize || (r.content ? `${Math.round(r.content.length / 1024)} KB` : '0 KB'),
    downloadUrl: `/api/assessments/${assessmentId}/reports/${r.id}/download`,
  }));
}

export async function getReportByIdFromDB(reportId: string) {
  const report = await db.query.reports.findFirst({
    where: eq(reports.id, reportId),
  });
  
  if (!report) return null;
  
  return {
    ...report,
    pdfBuffer: report.content ? Buffer.from(report.content, 'base64') : null,
    filename: `${report.title?.replace(/\s+/g, '_')}_${report.generatedAt?.toISOString().split('T')[0]}.pdf`,
  };
}
