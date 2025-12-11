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
import { renderExecutiveSummaryHTML } from '../../templates/executive-summary-template';
import { renderEPReportHTML } from '../../templates/ep-report-template';
import fs from 'fs/promises';
import path from 'path';
import { calculateTemplateMetrics } from './template-metrics';
import { assembleReportData } from './report-data-assembler';
import type { GeneratedReportResult } from './report-generator';

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
    
    // 2. Determine assessment type from surveyParadigm
    const isExecutiveProtection = assessment.surveyParadigm === 'executive' || 
                                   assessment.surveyParadigm === 'executive-protection';
    
    let htmlContent: string;
    
    // 3. Route to appropriate template based on assessment type
    if (isExecutiveProtection) {
      console.log('📋 Using MacQuarrie EP report template...');
      
      // Assemble full EP report data package
      const reportDataPackage = await assembleReportData(assessmentId, userId);
      
      if (!reportDataPackage.epReportData) {
        throw new Error('Executive Protection report data could not be assembled. Please ensure the principal profile and interview questionnaire are complete before generating the report.');
      }
      
      // Comprehensive validation: EP reports require complete AI analysis data
      const epData = reportDataPackage.epReportData;
      const validationErrors: string[] = [];
      
      // 1. Validate threat domains exist with actual threat assessments
      if (!epData.threatDomains || epData.threatDomains.length === 0) {
        validationErrors.push('No threat domains generated');
      } else {
        const allThreats = epData.threatDomains.flatMap(d => d.threats || []);
        const threatsWithData = allThreats.filter(t => t.riskScore && t.riskScore.normalized > 0);
        
        if (threatsWithData.length === 0) {
          validationErrors.push('No threat risk scores calculated');
        }
        
        // Check for narrative content (at least some threats should have reasoning)
        const threatsWithNarratives = threatsWithData.filter(t => 
          (t.threatLikelihood?.reasoning && t.threatLikelihood.reasoning.length > 10) ||
          (t.vulnerability?.reasoning && t.vulnerability.reasoning.length > 10)
        );
        if (threatsWithNarratives.length < Math.min(3, threatsWithData.length)) {
          validationErrors.push('Insufficient AI narrative content for threats');
        }
        
        // Check for evidence trails on high-risk threats
        const highRiskThreats = threatsWithData.filter(t => t.riskScore.normalized >= 50);
        const highRiskWithEvidence = highRiskThreats.filter(t => 
          t.evidenceTrail && t.evidenceTrail.length > 0
        );
        if (highRiskThreats.length > 0 && highRiskWithEvidence.length === 0) {
          validationErrors.push('High-risk threats missing evidence trails');
        }
        
        // Check for priority controls on assessed threats
        const threatsWithControls = threatsWithData.filter(t => 
          t.priorityControls && t.priorityControls.length > 0
        );
        if (threatsWithData.length > 3 && threatsWithControls.length < 2) {
          validationErrors.push('Insufficient control recommendations generated');
        }
      }
      
      // 2. Validate component summaries exist for T×V×I×E breakdown
      if (!epData.componentSummaries) {
        validationErrors.push('T×V×I×E component summaries not generated');
      } else {
        const requiredComponents = ['threat', 'vulnerability', 'impact', 'exposure'];
        const missingComponents = requiredComponents.filter(c => 
          !epData.componentSummaries![c as keyof typeof epData.componentSummaries]
        );
        if (missingComponents.length > 0) {
          validationErrors.push(`Missing component summaries: ${missingComponents.join(', ')}`);
        }
      }
      
      // 3. Validate principal profile exists
      if (!epData.principalProfile || !epData.principalProfile.name) {
        validationErrors.push('Principal profile not configured');
      }
      
      if (validationErrors.length > 0) {
        console.error('❌ EP Report validation failed:', validationErrors);
        throw new Error(`Executive Protection report cannot be generated: ${validationErrors.join('; ')}. Please complete the interview questionnaire and run AI analysis from the dashboard.`);
      }
      
      console.log('✅ EP report data validation passed');
      
      htmlContent = renderEPReportHTML({
        reportData: reportDataPackage,
        assessorName: 'Security Consultant',
        organizationName: undefined
      });
    } else {
      // Standard facility assessment template
      console.log('📋 Using standard facility report template...');
      
      const risks = await db
        .select()
        .from(riskScenarios)
        .where(eq(riskScenarios.assessmentId, assessmentId))
        .orderBy(desc(riskScenarios.inherentRisk));
      
      const photos: any[] = [];
      const executiveSummary = assessment.executiveSummary || await fetchExecutiveSummary(assessmentId);
      const templateMetrics = calculateTemplateMetrics(assessment, risks);
      
      htmlContent = await renderReportHTML({
        assessment,
        risks,
        photos,
        executiveSummary,
        templateMetrics
      });
    }
    
    // 4. Generate PDF using Puppeteer
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

/**
 * Generate a PDF from a GeneratedReportResult using the appropriate template
 * 
 * @param report - The generated report result with sections and data
 * @param templateType - The template type to use for rendering
 * @returns PDF buffer
 */
export async function generateReportPDF(
  report: GeneratedReportResult,
  templateType: 'executive-summary' | 'comprehensive' | 'executive-protection'
): Promise<Buffer> {
  console.log(`📄 Generating PDF using ${templateType} template...`);
  
  let htmlContent: string;
  
  switch (templateType) {
    case 'executive-summary':
      htmlContent = renderExecutiveSummaryHTML(report);
      break;
    case 'executive-protection':
      if (!report.dataSnapshot) {
        throw new Error('Executive Protection report requires full data package');
      }
      htmlContent = renderEPReportHTML({
        reportData: report.dataSnapshot,
        assessorName: 'Security Consultant',
        organizationName: undefined
      });
      break;
    case 'comprehensive':
      const assessment = {
        id: report.assessmentId,
        title: report.dataSnapshot.principal?.name || report.dataSnapshot.facility?.name || 'Security Assessment',
        templateId: report.dataSnapshot.assessmentType,
        createdAt: report.generatedAt
      };
      const threatDomains = report.dataSnapshot.threatDomains || [];
      const risks = threatDomains.map(td => ({
        scenario: td.name || 'Unknown Threat',
        asset: td.category || 'General',
        threatType: td.category || 'General',
        riskLevel: td.priority ? td.priority.charAt(0).toUpperCase() + td.priority.slice(1) : 'Medium',
        inherentRisk: td.riskScore || 0,
        threatDescription: td.description || '',
        vulnerabilityDescription: Array.isArray(td.vulnerabilities) ? td.vulnerabilities.join(', ') : '',
        controlRecommendations: Array.isArray(td.mitigatingControls) ? td.mitigatingControls.join(', ') : ''
      }));
      const executiveSummary = report.sections.find(s => s.id === 'the-assessment')?.narrativeContent || '';
      const templateMetrics = {};
      htmlContent = await renderReportHTML({
        assessment,
        risks,
        photos: [],
        executiveSummary,
        templateMetrics
      });
      break;
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
  
  const pdfBuffer = await convertHTMLToPDFBuffer(htmlContent);
  
  console.log(`✅ PDF generated successfully (${pdfBuffer.length} bytes)`);
  
  return pdfBuffer;
}

/**
 * Convert HTML content to PDF buffer using Puppeteer (without saving to file)
 */
async function convertHTMLToPDFBuffer(htmlContent: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--disable-web-security',
    ],
    ...(process.env.PUPPETEER_EXECUTABLE_PATH && { 
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH 
    })
  });
  
  try {
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in'
      }
    });
    
    return Buffer.from(pdfBuffer);
    
  } finally {
    await browser.close();
  }
}
