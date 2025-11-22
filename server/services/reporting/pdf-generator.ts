/**
 * PDF Report Generator Service
 * 
 * Generates comprehensive security assessment reports with template-specific
 * "killer features" using Puppeteer for HTML-to-PDF conversion
 */

import puppeteer from 'puppeteer';
import { db } from '../../db';
import { assessments, riskScenarios } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { renderReportHTML } from '../../templates/master-report';
import fs from 'fs/promises';
import path from 'path';
import { calculateTemplateMetrics } from './template-metrics';

/**
 * Generate a comprehensive PDF report for an assessment
 * 
 * @param assessmentId - The assessment ID to generate a report for
 * @param userId - The user requesting the report (for authorization)
 * @returns Path to the generated PDF file
 */
export async function generateAssessmentReport(
  assessmentId: string,
  userId: string
): Promise<string> {
  
  try {
    console.log(`📊 Starting PDF report generation for assessment ${assessmentId}...`);
    
    // 1. Fetch assessment with authorization check
    const assessment = await db
      .select()
      .from(assessments)
      .where(
        and(
          eq(assessments.id, assessmentId),
          eq(assessments.userId, userId)
        )
      )
      .limit(1)
      .then(rows => rows[0]);
    
    if (!assessment) {
      throw new Error('Assessment not found or access denied');
    }
    
    // 2. Fetch risk scenarios ordered by severity
    const risks = await db
      .select()
      .from(riskScenarios)
      .where(eq(riskScenarios.assessmentId, assessmentId))
      .orderBy(desc(riskScenarios.inherentRisk));
    
    // 3. Fetch photo evidence (if table exists)
    // TODO: Re-enable when photoEvidence table is available
    const photos: any[] = [];
    
    // 4. Use AI-generated Executive Summary from assessment record
    const executiveSummary = assessment.executiveSummary || await fetchExecutiveSummary(assessmentId);
    
    // 5. Calculate template-specific metrics
    const templateMetrics = calculateTemplateMetrics(assessment, risks);
    
    // 6. Render HTML report with all data
    const htmlContent = await renderReportHTML({
      assessment,
      risks,
      photos,
      executiveSummary,
      templateMetrics
    });
    
    // 7. Generate PDF using Puppeteer
    const pdfPath = await convertHTMLToPDF(htmlContent, assessmentId);
    
    console.log(`✅ PDF report generated successfully: ${pdfPath}`);
    
    return pdfPath;
    
  } catch (error) {
    console.error('❌ Error generating PDF report:', error);
    throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate fallback executive summary when AI summary is not available
 * This provides a basic data-driven summary based on risk scenario counts
 * Exported for reuse in preview endpoint to ensure parity with PDF generation
 */
export async function fetchExecutiveSummary(assessmentId: string): Promise<string> {
  try {
    // Generate a data-driven summary based on risk counts as fallback
    const riskCount = await db
      .select()
      .from(riskScenarios)
      .where(eq(riskScenarios.assessmentId, assessmentId))
      .then(rows => rows.length);
    
    if (riskCount > 0) {
      const criticalCount = await db
        .select()
        .from(riskScenarios)
        .where(
          and(
            eq(riskScenarios.assessmentId, assessmentId),
            eq(riskScenarios.riskLevel, 'Critical')
          )
        )
        .then(rows => rows.length);
      
      const highCount = await db
        .select()
        .from(riskScenarios)
        .where(
          and(
            eq(riskScenarios.assessmentId, assessmentId),
            eq(riskScenarios.riskLevel, 'High')
          )
        )
        .then(rows => rows.length);
      
      return `This comprehensive security assessment identified ${riskCount} risk scenarios, including ${criticalCount} critical-priority and ${highCount} high-priority findings requiring attention. The assessment provides data-driven analysis of vulnerabilities, threat likelihood, and potential business impact. Key recommendations focus on implementing layered security controls, enhancing monitoring capabilities, and establishing formal incident response procedures to strengthen the facility's overall security posture.`;
    }
    
    // Fallback summary if no risk data exists
    return `This security assessment provides a comprehensive evaluation of the facility's security posture, identifying vulnerabilities and providing actionable recommendations to enhance protection of people, assets, and operations.`;
    
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    // Return generic fallback on error
    return `This comprehensive security assessment evaluates the facility's current security posture and provides strategic recommendations for risk mitigation and security enhancement.`;
  }
}

// Template metrics calculation moved to ./template-metrics.ts for code reuse

/**
 * Convert HTML content to PDF using Puppeteer
 */
async function convertHTMLToPDF(htmlContent: string, assessmentId: string): Promise<string> {
  
  // Launch browser with production-ready configuration for serverless/container environments
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Overcome limited shared memory in containers
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--disable-web-security', // Allow loading local assets
    ],
    // Use bundled Chromium from puppeteer package
    // In production, consider setting executablePath to system Chrome if available
    ...(process.env.PUPPETEER_EXECUTABLE_PATH && { 
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH 
    })
  });
  
  try {
    const page = await browser.newPage();
    
    // Set content and wait for any dynamic rendering
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF with professional settings
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });
    
    // Save PDF to temporary location
    const outputDir = path.join(process.cwd(), 'tmp', 'reports');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `assessment-${assessmentId}-${timestamp}.pdf`;
    const filePath = path.join(outputDir, fileName);
    
    await fs.writeFile(filePath, pdfBuffer);
    
    return filePath;
    
  } finally {
    await browser.close();
  }
}
