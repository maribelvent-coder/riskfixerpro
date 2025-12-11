/**
 * Executive Protection MacQuarrie-Format Report Template
 * 
 * Generates professional, narrative-driven PDF reports following the 
 * MacQuarrie Executive Protection Assessment format with T×V×I×E scoring.
 * 
 * Structure:
 * 1. Cover Page
 * 2. Executive Summary
 * 3. Methodology
 * 4. Geographic Risk Analysis
 * 5. Principal Profile
 * 6. Threat Assessment (T×V×I×E)
 * 7. Vulnerability Analysis
 * 8. Impact Assessment
 * 9. Risk Calculation
 * 10. Security Recommendations
 * 11. Implementation Roadmap
 * 12. Conclusion
 * 13. Data Sources
 * 14. Appendix (Rating Scales, Photos)
 */

import type { ReportDataPackage, EPReportData, EPThreatAssessment } from '../types/report-data';

interface EPReportInput {
  reportData: ReportDataPackage;
  assessorName?: string;
  organizationName?: string;
}

function getRiskColor(classification: string): string {
  switch (classification.toLowerCase()) {
    case 'critical': return '#991b1b';
    case 'high': return '#c2410c';
    case 'elevated':
    case 'medium': return '#b45309';
    case 'moderate': return '#ca8a04';
    case 'low': return '#15803d';
    default: return '#64748b';
  }
}

function getRiskBadgeClass(classification: string): string {
  switch (classification.toLowerCase()) {
    case 'critical': return 'risk-critical';
    case 'high': return 'risk-high';
    case 'elevated':
    case 'medium': return 'risk-medium';
    case 'low': return 'risk-low';
    default: return 'risk-low';
  }
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function getScoreLabel(score: number, maxScore: number = 10): string {
  const ratio = score / maxScore;
  if (ratio >= 0.8) return 'Critical';
  if (ratio >= 0.6) return 'High';
  if (ratio >= 0.4) return 'Moderate';
  if (ratio >= 0.2) return 'Low';
  return 'Minimal';
}

export function renderEPReportHTML(input: EPReportInput): string {
  const { reportData, assessorName = 'Security Consultant', organizationName } = input;
  const epData = reportData.epReportData;
  
  if (!epData) {
    return renderFallbackReport(reportData);
  }

  const principal = reportData.principal;
  const principalName = principal?.name || 'Principal';
  const principalTitle = principal?.title || 'Executive';
  const overallScore = epData.overallRiskScore;
  const riskClassification = epData.riskClassification.toUpperCase();
  const riskColor = getRiskColor(epData.riskClassification);
  const generatedDate = new Date(reportData.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Protection Assessment - ${principalName}</title>
  <style>
    ${getReportStyles()}
  </style>
</head>
<body>
  ${renderCoverPage(principalName, principalTitle, overallScore, riskClassification, riskColor, generatedDate, assessorName)}
  ${renderExecutiveSummary(epData, principal)}
  ${renderMethodology(epData)}
  ${renderGeographicRisk(reportData)}
  ${renderPrincipalProfile(principal, epData)}
  ${renderThreatAssessment(epData)}
  ${renderVulnerabilityAnalysis(epData)}
  ${renderImpactAssessment(epData)}
  ${renderRiskCalculation(epData)}
  ${renderRecommendations(epData)}
  ${renderImplementationRoadmap(epData)}
  ${renderConclusion(epData, principalName)}
  ${renderDataSources(epData)}
  ${renderAppendix(epData)}
</body>
</html>
`;
}

function getReportStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: Letter;
      margin: 0;
    }
    
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      font-size: 11pt;
      background: #e5e7eb;
    }
    
    .page {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto 20px;
      background: white;
      padding: 0.75in;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      page-break-after: always;
    }
    
    .cover-page {
      min-height: 11in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      margin: -0.75in;
      padding: 0.75in;
    }
    
    .cover-logo {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 3px;
      opacity: 0.9;
      margin-bottom: 60px;
    }
    
    .cover-type {
      font-size: 14pt;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .cover-title {
      font-size: 36pt;
      font-weight: bold;
      margin-bottom: 40px;
      text-align: center;
    }
    
    .cover-score-box {
      background: rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 30px 60px;
      text-align: center;
      margin: 30px 0;
    }
    
    .cover-score-label {
      font-size: 12pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    
    .cover-score-value {
      font-size: 48pt;
      font-weight: bold;
    }
    
    .cover-classification {
      font-size: 18pt;
      font-weight: bold;
      margin-top: 10px;
      padding: 8px 24px;
      border-radius: 20px;
      display: inline-block;
    }
    
    .cover-confidential {
      margin-top: 60px;
      font-size: 12pt;
      text-transform: uppercase;
      letter-spacing: 2px;
      padding: 8px 24px;
      border: 2px solid rgba(255,255,255,0.5);
    }
    
    .cover-meta {
      margin-top: 40px;
      font-size: 11pt;
      opacity: 0.9;
    }
    
    .section-title {
      font-size: 24pt;
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 25px;
      padding-bottom: 10px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .section-subtitle {
      font-size: 14pt;
      font-weight: bold;
      color: #374151;
      margin: 25px 0 15px;
    }
    
    .score-box {
      background: #f1f5f9;
      border-left: 4px solid #3b82f6;
      padding: 15px 20px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .score-box-value {
      font-size: 28pt;
      font-weight: bold;
      color: #1e3a8a;
    }
    
    .score-box-label {
      font-size: 11pt;
      color: #64748b;
    }
    
    .narrative-text {
      font-size: 11pt;
      line-height: 1.8;
      margin-bottom: 15px;
      text-align: justify;
    }
    
    .bullet-list {
      margin: 15px 0 15px 25px;
    }
    
    .bullet-list li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
    
    .component-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    
    .component-card {
      background: #f8fafc;
      border-radius: 6px;
      padding: 15px;
      text-align: center;
    }
    
    .component-label {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .component-score {
      font-size: 24pt;
      font-weight: bold;
      color: #1e3a8a;
    }
    
    .component-scale {
      font-size: 9pt;
      color: #94a3b8;
    }
    
    .threat-domain {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin: 20px 0;
      overflow: hidden;
    }
    
    .threat-domain-header {
      background: #f8fafc;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .threat-domain-name {
      font-size: 12pt;
      font-weight: bold;
      color: #1e293b;
    }
    
    .threat-domain-score {
      font-size: 10pt;
      font-weight: bold;
    }
    
    .threat-domain-body {
      padding: 15px 20px;
    }
    
    .threat-domain-narrative {
      font-size: 10pt;
      line-height: 1.7;
      color: #374151;
      margin-bottom: 12px;
    }
    
    .evidence-list {
      background: #fef3c7;
      border-radius: 4px;
      padding: 10px 15px;
      margin-top: 12px;
    }
    
    .evidence-title {
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
      color: #92400e;
      margin-bottom: 8px;
    }
    
    .evidence-item {
      font-size: 9pt;
      color: #78350f;
      margin-bottom: 4px;
    }
    
    .recommendation-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin: 15px 0;
      overflow: hidden;
    }
    
    .recommendation-header {
      background: #1e3a8a;
      color: white;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .recommendation-priority {
      font-size: 12pt;
      font-weight: bold;
    }
    
    .recommendation-urgency {
      font-size: 9pt;
      text-transform: uppercase;
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 10px;
    }
    
    .recommendation-body {
      padding: 15px 20px;
    }
    
    .recommendation-title {
      font-size: 12pt;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 10px;
    }
    
    .recommendation-rationale {
      font-size: 10pt;
      color: #475569;
      line-height: 1.6;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .data-table th {
      background: #1e3a8a;
      color: white;
      padding: 10px 15px;
      text-align: left;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .data-table td {
      padding: 10px 15px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10pt;
    }
    
    .data-table tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .risk-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .risk-critical { background: #fee2e2; color: #991b1b; }
    .risk-high { background: #ffedd5; color: #c2410c; }
    .risk-medium { background: #fef9c3; color: #854d0e; }
    .risk-low { background: #dcfce7; color: #15803d; }
    
    .calculation-box {
      background: #f1f5f9;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    }
    
    .calculation-formula {
      font-size: 14pt;
      color: #1e3a8a;
      margin-bottom: 15px;
    }
    
    .calculation-result {
      font-size: 20pt;
      font-weight: bold;
      color: #1e3a8a;
    }
    
    .roadmap-item {
      display: flex;
      gap: 20px;
      padding: 15px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .roadmap-week {
      width: 80px;
      font-size: 10pt;
      font-weight: bold;
      color: #3b82f6;
    }
    
    .roadmap-content {
      flex: 1;
    }
    
    .appendix-scale {
      margin: 20px 0;
    }
    
    .scale-row {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .scale-score {
      width: 60px;
      padding: 10px;
      font-weight: bold;
      text-align: center;
      background: #f8fafc;
    }
    
    .scale-label {
      width: 120px;
      padding: 10px;
      font-weight: bold;
    }
    
    .scale-description {
      flex: 1;
      padding: 10px;
      font-size: 10pt;
      color: #475569;
    }
  `;
}

function renderCoverPage(
  principalName: string,
  principalTitle: string,
  overallScore: number,
  riskClassification: string,
  riskColor: string,
  generatedDate: string,
  assessorName: string
): string {
  return `
  <div class="page">
    <div class="cover-page">
      <div class="cover-logo">RISKFIXER</div>
      <div class="cover-type">Executive Protection Assessment</div>
      <h1 class="cover-title">${principalName}</h1>
      <div style="font-size: 14pt; opacity: 0.9;">${principalTitle}</div>
      
      <div class="cover-score-box">
        <div class="cover-score-label">Overall Risk Score</div>
        <div class="cover-score-value">${overallScore}</div>
        <div class="cover-classification" style="background: ${riskColor};">
          ${riskClassification}
        </div>
      </div>
      
      <div class="cover-confidential">CONFIDENTIAL</div>
      
      <div class="cover-meta">
        Prepared by: ${assessorName}<br>
        Date: ${generatedDate}
      </div>
    </div>
  </div>
  `;
}

function renderExecutiveSummary(epData: EPReportData, principal: any): string {
  const topThreats = epData.threatAssessments
    .sort((a, b) => b.riskScore.normalized - a.riskScore.normalized)
    .slice(0, 5);
  
  const criticalSignals = epData.topRiskSignals
    .filter(s => s.severity === 'critical_indicator')
    .slice(0, 5);
  
  const topControls = epData.prioritizedControls
    .filter(c => c.urgency === 'immediate')
    .slice(0, 6);

  return `
  <div class="page">
    <h1 class="section-title">Executive Summary</h1>
    
    <div class="score-box">
      <div class="score-box-value">${epData.overallRiskScore}</div>
      <div>
        <div style="font-weight: bold; color: ${getRiskColor(epData.riskClassification)};">
          ${epData.riskClassification.toUpperCase()} RISK
        </div>
        <div class="score-box-label">Based on T×V×I×E Assessment</div>
      </div>
    </div>
    
    <p class="narrative-text">
      This Executive Protection Assessment evaluates the security posture and risk profile for 
      ${principal?.name || 'the principal'}. The assessment follows the T×V×I×E (Threat × Vulnerability × Impact × Exposure) 
      methodology aligned with ASIS International standards and executive protection best practices.
    </p>
    
    <h2 class="section-subtitle">Key Risk Indicators</h2>
    <ul class="bullet-list">
      ${criticalSignals.map(s => `<li>${s.signal}</li>`).join('\n')}
      ${criticalSignals.length === 0 ? '<li>No critical indicators identified at this time</li>' : ''}
    </ul>
    
    <h2 class="section-subtitle">Top Threat Scenarios</h2>
    <ul class="bullet-list">
      ${topThreats.map(t => `
        <li><strong>${t.threatName}</strong>: ${t.riskScore.classification.toUpperCase()} risk 
        (Score: ${t.riskScore.normalized})</li>
      `).join('\n')}
    </ul>
    
    <h2 class="section-subtitle">Recommended Priorities</h2>
    <ol class="bullet-list">
      ${topControls.map((c, i) => `
        <li><strong>${c.controlName}</strong>: ${c.rationale}</li>
      `).join('\n')}
      ${topControls.length === 0 ? '<li>Complete assessment data to generate recommendations</li>' : ''}
    </ol>
  </div>
  `;
}

function renderMethodology(epData: EPReportData): string {
  return `
  <div class="page">
    <h1 class="section-title">Assessment Methodology</h1>
    
    <p class="narrative-text">
      This assessment follows the ASIS International General Security Risk Assessment (GSRA) Guidelines 
      adapted for executive protection contexts. The methodology employs a quantitative T×V×I×E 
      framework specifically designed for principal-centric security evaluation.
    </p>
    
    <h2 class="section-subtitle">T×V×I×E Framework</h2>
    <p class="narrative-text">
      The Executive Protection risk calculation uses four component factors:
    </p>
    
    <div class="data-table">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="background: #1e3a8a; color: white; padding: 10px; text-align: left;">Component</th>
          <th style="background: #1e3a8a; color: white; padding: 10px; text-align: left;">Scale</th>
          <th style="background: #1e3a8a; color: white; padding: 10px; text-align: left;">Description</th>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Threat (T)</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">1-10</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Probability of threat actor targeting the principal</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Vulnerability (V)</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">1-10</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Gaps in current protective measures</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Impact (I)</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">1-10</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Consequence severity if threat materializes</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Exposure (E)</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">1-5</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Public visibility and accessibility multiplier</td>
        </tr>
      </table>
    </div>
    
    <h2 class="section-subtitle">Data Sources</h2>
    <ul class="bullet-list">
      <li><strong>Principal Interview</strong>: Structured questionnaire covering 7 security domains</li>
      <li><strong>Security Professional Profile</strong>: Expert assessment of exposure factors</li>
      ${epData.dataGaps.length === 0 ? '<li><strong>Complete Data</strong>: All assessment sections fully completed</li>' : ''}
    </ul>
    
    <h2 class="section-subtitle">Assessment Confidence</h2>
    <p class="narrative-text">
      AI Confidence Level: <strong>${epData.aiConfidence.toUpperCase()}</strong><br>
      Assessment Mode: ${epData.assessmentMode === 'ai' ? 'Full AI Analysis' : 
                        epData.assessmentMode === 'hybrid' ? 'Hybrid (AI + Algorithmic)' : 
                        'Algorithmic Fallback'}
    </p>
  </div>
  `;
}

function renderGeographicRisk(reportData: ReportDataPackage): string {
  const geoIntel = reportData.geographicIntelligence;
  
  if (!geoIntel) {
    return `
    <div class="page">
      <h1 class="section-title">Geographic Risk Analysis</h1>
      <p class="narrative-text">
        Geographic crime data was not available for this assessment. For a complete risk picture, 
        consider adding CAP Index data or local crime statistics for the principal's primary 
        residence and workplace locations.
      </p>
    </div>
    `;
  }
  
  const capData = geoIntel.capIndexData;
  
  return `
  <div class="page">
    <h1 class="section-title">Geographic Risk Analysis</h1>
    
    ${capData ? `
    <h2 class="section-subtitle">CAP Index Data</h2>
    <div class="score-box">
      <div class="score-box-value">${capData.overallCrimeIndex}</div>
      <div>
        <div style="font-weight: bold;">Overall Crime Index</div>
        <div class="score-box-label">${capData.city || ''}, ${capData.state || ''}</div>
      </div>
    </div>
    
    <div class="component-grid">
      <div class="component-card">
        <div class="component-label">Violent Crime</div>
        <div class="component-score">${capData.violentCrimes.rate_per_100k.toFixed(0)}</div>
        <div class="component-scale">per 100k</div>
      </div>
      <div class="component-card">
        <div class="component-label">Property Crime</div>
        <div class="component-score">${capData.propertyCrimes.rate_per_100k.toFixed(0)}</div>
        <div class="component-scale">per 100k</div>
      </div>
    </div>
    ` : ''}
    
    <h2 class="section-subtitle">Local Crime Summary</h2>
    <p class="narrative-text">
      ${geoIntel.riskContext}
    </p>
    
    ${geoIntel.crimeData.crimeTypes.length > 0 ? `
    <h2 class="section-subtitle">Crime Type Breakdown</h2>
    <table class="data-table">
      <tr>
        <th>Crime Type</th>
        <th>Incidents</th>
        <th>Severity</th>
      </tr>
      ${geoIntel.crimeData.crimeTypes.slice(0, 8).map(ct => `
        <tr>
          <td>${ct.type}</td>
          <td>${ct.count}</td>
          <td><span class="risk-badge ${getRiskBadgeClass(ct.severity)}">${ct.severity}</span></td>
        </tr>
      `).join('\n')}
    </table>
    ` : ''}
  </div>
  `;
}

function renderPrincipalProfile(principal: any, epData: EPReportData): string {
  return `
  <div class="page">
    <h1 class="section-title">Principal Profile</h1>
    
    <h2 class="section-subtitle">Executive Overview</h2>
    <table style="width: 100%; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; width: 40%;"><strong>Name</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${principal?.name || 'Not specified'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Title</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${principal?.title || 'Not specified'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Organization</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${principal?.organization || 'Not specified'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Public Exposure</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${principal?.publicExposure || 'Not specified'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Travel Frequency</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${principal?.travelFrequency || 'Not specified'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Media Profile</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${principal?.mediaProfile || 'Not specified'}</td>
      </tr>
    </table>
    
    <h2 class="section-subtitle">Exposure Factor Analysis</h2>
    <div class="score-box">
      <div class="score-box-value">${epData.exposureFactor.toFixed(1)}</div>
      <div>
        <div style="font-weight: bold;">Exposure Factor</div>
        <div class="score-box-label">Combined public visibility and accessibility</div>
      </div>
    </div>
    
    <p class="narrative-text">
      ${epData.componentSummaries.exposure.narrative}
    </p>
    
    ${principal?.knownThreats?.length > 0 ? `
    <h2 class="section-subtitle">Documented Threat History</h2>
    <ul class="bullet-list">
      ${principal.knownThreats.map((t: string) => `<li>${t}</li>`).join('\n')}
    </ul>
    ` : ''}
    
    ${principal?.currentSecurityMeasures?.length > 0 ? `
    <h2 class="section-subtitle">Current Security Measures</h2>
    <ul class="bullet-list">
      ${principal.currentSecurityMeasures.map((m: string) => `<li>${m}</li>`).join('\n')}
    </ul>
    ` : ''}
  </div>
  `;
}

function renderThreatAssessment(epData: EPReportData): string {
  const sortedThreats = [...epData.threatAssessments]
    .sort((a, b) => b.riskScore.normalized - a.riskScore.normalized);
  
  return `
  <div class="page">
    <h1 class="section-title">Threat Assessment</h1>
    
    <div class="score-box">
      <div class="score-box-value">${epData.componentSummaries.threat.overallScore}/10</div>
      <div>
        <div style="font-weight: bold;">Overall Threat Score</div>
        <div class="score-box-label">${getScoreLabel(epData.componentSummaries.threat.overallScore)}</div>
      </div>
    </div>
    
    <p class="narrative-text">
      ${epData.componentSummaries.threat.narrative}
    </p>
    
    <h2 class="section-subtitle">Threat Scenario Analysis</h2>
    
    ${sortedThreats.slice(0, 6).map(threat => `
    <div class="threat-domain">
      <div class="threat-domain-header">
        <span class="threat-domain-name">${threat.threatName}</span>
        <span class="threat-domain-score">
          <span class="risk-badge ${getRiskBadgeClass(threat.riskScore.classification)}">
            ${threat.riskScore.classification.toUpperCase()} (${threat.riskScore.normalized})
          </span>
        </span>
      </div>
      <div class="threat-domain-body">
        <p class="threat-domain-narrative">${threat.scenarioDescription}</p>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 9pt; color: #64748b;">Threat</div>
            <div style="font-size: 16pt; font-weight: bold; color: #1e3a8a;">${threat.threatLikelihood.score}/10</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 9pt; color: #64748b;">Vulnerability</div>
            <div style="font-size: 16pt; font-weight: bold; color: #1e3a8a;">${threat.vulnerability.score}/10</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 9pt; color: #64748b;">Impact</div>
            <div style="font-size: 16pt; font-weight: bold; color: #1e3a8a;">${threat.impact.score}/10</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 9pt; color: #64748b;">Exposure</div>
            <div style="font-size: 16pt; font-weight: bold; color: #1e3a8a;">${threat.exposureFactor.score}/5</div>
          </div>
        </div>
        
        ${threat.evidenceTrail.length > 0 ? `
        <div class="evidence-list">
          <div class="evidence-title">Evidence Trail</div>
          ${threat.evidenceTrail.map(e => `<div class="evidence-item">• ${e}</div>`).join('\n')}
        </div>
        ` : ''}
      </div>
    </div>
    `).join('\n')}
  </div>
  
  ${sortedThreats.length > 6 ? `
  <div class="page">
    <h1 class="section-title">Threat Assessment (Continued)</h1>
    ${sortedThreats.slice(6).map(threat => `
    <div class="threat-domain">
      <div class="threat-domain-header">
        <span class="threat-domain-name">${threat.threatName}</span>
        <span class="threat-domain-score">
          <span class="risk-badge ${getRiskBadgeClass(threat.riskScore.classification)}">
            ${threat.riskScore.classification.toUpperCase()} (${threat.riskScore.normalized})
          </span>
        </span>
      </div>
      <div class="threat-domain-body">
        <p class="threat-domain-narrative">${threat.scenarioDescription}</p>
        <p class="threat-domain-narrative"><strong>Reasoning:</strong> ${threat.threatLikelihood.reasoning}</p>
      </div>
    </div>
    `).join('\n')}
  </div>
  ` : ''}
  `;
}

function renderVulnerabilityAnalysis(epData: EPReportData): string {
  const controlGaps = epData.threatAssessments
    .flatMap(t => t.vulnerability.controlGaps)
    .filter((gap, index, self) => self.indexOf(gap) === index)
    .slice(0, 10);
  
  return `
  <div class="page">
    <h1 class="section-title">Vulnerability Analysis</h1>
    
    <div class="score-box">
      <div class="score-box-value">${epData.componentSummaries.vulnerability.overallScore}/10</div>
      <div>
        <div style="font-weight: bold;">Overall Vulnerability Score</div>
        <div class="score-box-label">${getScoreLabel(epData.componentSummaries.vulnerability.overallScore)}</div>
      </div>
    </div>
    
    <p class="narrative-text">
      ${epData.componentSummaries.vulnerability.narrative}
    </p>
    
    <h2 class="section-subtitle">Identified Control Gaps</h2>
    <table class="data-table">
      <tr>
        <th>#</th>
        <th>Vulnerability</th>
        <th>Implication</th>
      </tr>
      ${controlGaps.map((gap, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${gap}</td>
          <td>Increases exposure to targeted threats</td>
        </tr>
      `).join('\n')}
      ${controlGaps.length === 0 ? `
        <tr>
          <td colspan="3" style="text-align: center; color: #64748b;">
            No significant control gaps identified
          </td>
        </tr>
      ` : ''}
    </table>
    
    <h2 class="section-subtitle">Section-by-Section Assessment</h2>
    ${epData.sectionAssessments.map(section => `
      <div style="margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong>${section.sectionName}</strong>
          <span style="font-size: 10pt; color: #64748b;">${section.completionPercentage}% complete</span>
        </div>
        <p style="font-size: 10pt; color: #475569;">${section.aiNarrative}</p>
        ${section.riskIndicators > 0 ? `
          <div style="margin-top: 8px; font-size: 9pt; color: #dc2626;">
            ⚠ ${section.riskIndicators} risk indicator${section.riskIndicators > 1 ? 's' : ''} identified
          </div>
        ` : ''}
      </div>
    `).join('\n')}
  </div>
  `;
}

function renderImpactAssessment(epData: EPReportData): string {
  const topImpacts = epData.threatAssessments
    .sort((a, b) => b.impact.score - a.impact.score)
    .slice(0, 5);
  
  return `
  <div class="page">
    <h1 class="section-title">Impact Assessment</h1>
    
    <div class="score-box">
      <div class="score-box-value">${epData.componentSummaries.impact.overallScore}/10</div>
      <div>
        <div style="font-weight: bold;">Overall Impact Score</div>
        <div class="score-box-label">${getScoreLabel(epData.componentSummaries.impact.overallScore)}</div>
      </div>
    </div>
    
    <p class="narrative-text">
      ${epData.componentSummaries.impact.narrative}
    </p>
    
    <h2 class="section-subtitle">Impact Categories</h2>
    
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
      <div style="padding: 15px; background: #fef2f2; border-radius: 6px;">
        <div style="font-weight: bold; color: #991b1b; margin-bottom: 10px;">Personal & Family Safety</div>
        <ul style="margin-left: 15px; font-size: 10pt; color: #7f1d1d;">
          ${topImpacts.slice(0, 2).map(t => `<li>${t.impact.personalImpact || 'Direct physical harm risk'}</li>`).join('\n')}
        </ul>
      </div>
      <div style="padding: 15px; background: #fff7ed; border-radius: 6px;">
        <div style="font-weight: bold; color: #c2410c; margin-bottom: 10px;">Financial Exposure</div>
        <ul style="margin-left: 15px; font-size: 10pt; color: #9a3412;">
          ${topImpacts.slice(0, 2).map(t => `<li>${t.impact.financialImpact || 'Financial loss potential'}</li>`).join('\n')}
        </ul>
      </div>
      <div style="padding: 15px; background: #fefce8; border-radius: 6px;">
        <div style="font-weight: bold; color: #854d0e; margin-bottom: 10px;">Reputational Risk</div>
        <ul style="margin-left: 15px; font-size: 10pt; color: #713f12;">
          ${topImpacts.slice(0, 2).map(t => `<li>${t.impact.reputationalImpact || 'Reputation damage potential'}</li>`).join('\n')}
        </ul>
      </div>
      <div style="padding: 15px; background: #f0fdf4; border-radius: 6px;">
        <div style="font-weight: bold; color: #15803d; margin-bottom: 10px;">Family Impact</div>
        <ul style="margin-left: 15px; font-size: 10pt; color: #166534;">
          ${topImpacts.slice(0, 2).map(t => `<li>${t.impact.familyImpact || 'Family security considerations'}</li>`).join('\n')}
        </ul>
      </div>
    </div>
  </div>
  `;
}

function renderRiskCalculation(epData: EPReportData): string {
  const t = epData.componentSummaries.threat.overallScore;
  const v = epData.componentSummaries.vulnerability.overallScore;
  const i = epData.componentSummaries.impact.overallScore;
  const e = epData.componentSummaries.exposure.overallScore;
  
  return `
  <div class="page">
    <h1 class="section-title">Risk Calculation</h1>
    
    <p class="narrative-text">
      The overall risk score is calculated using the T×V×I×E formula, which multiplies the 
      Threat, Vulnerability, Impact, and Exposure factors to produce a composite risk score.
    </p>
    
    <div class="calculation-box">
      <div class="calculation-formula">
        Risk = Threat × Vulnerability × Impact × Exposure
      </div>
      <div class="calculation-result">
        ${t.toFixed(1)} × ${v.toFixed(1)} × ${i.toFixed(1)} × ${e.toFixed(1)} = ${epData.overallRiskScore}
      </div>
    </div>
    
    <h2 class="section-subtitle">Component Breakdown</h2>
    <table class="data-table">
      <tr>
        <th>Component</th>
        <th>Score</th>
        <th>Rating</th>
        <th>Assessment</th>
      </tr>
      <tr>
        <td><strong>Threat (T)</strong></td>
        <td>${t.toFixed(1)}/10</td>
        <td><span class="risk-badge ${getRiskBadgeClass(getScoreLabel(t))}">${getScoreLabel(t)}</span></td>
        <td style="font-size: 9pt;">${epData.componentSummaries.threat.narrative.substring(0, 100)}...</td>
      </tr>
      <tr>
        <td><strong>Vulnerability (V)</strong></td>
        <td>${v.toFixed(1)}/10</td>
        <td><span class="risk-badge ${getRiskBadgeClass(getScoreLabel(v))}">${getScoreLabel(v)}</span></td>
        <td style="font-size: 9pt;">${epData.componentSummaries.vulnerability.narrative.substring(0, 100)}...</td>
      </tr>
      <tr>
        <td><strong>Impact (I)</strong></td>
        <td>${i.toFixed(1)}/10</td>
        <td><span class="risk-badge ${getRiskBadgeClass(getScoreLabel(i))}">${getScoreLabel(i)}</span></td>
        <td style="font-size: 9pt;">${epData.componentSummaries.impact.narrative.substring(0, 100)}...</td>
      </tr>
      <tr>
        <td><strong>Exposure (E)</strong></td>
        <td>${e.toFixed(1)}/5</td>
        <td><span class="risk-badge ${getRiskBadgeClass(getScoreLabel(e, 5))}">${getScoreLabel(e, 5)}</span></td>
        <td style="font-size: 9pt;">${epData.componentSummaries.exposure.narrative.substring(0, 100)}...</td>
      </tr>
    </table>
    
    <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 6px; text-align: center;">
      <div style="font-size: 12pt; color: #64748b; margin-bottom: 10px;">TOTAL RISK SCORE</div>
      <div style="font-size: 36pt; font-weight: bold; color: ${getRiskColor(epData.riskClassification)};">
        ${epData.overallRiskScore}
      </div>
      <div style="font-size: 14pt; font-weight: bold; margin-top: 10px;">
        <span class="risk-badge ${getRiskBadgeClass(epData.riskClassification)}" style="font-size: 14pt; padding: 8px 20px;">
          ${epData.riskClassification.toUpperCase()}
        </span>
      </div>
    </div>
  </div>
  `;
}

function renderRecommendations(epData: EPReportData): string {
  const recommendations = epData.prioritizedControls.slice(0, 10);
  
  return `
  <div class="page">
    <h1 class="section-title">Security Recommendations</h1>
    
    <p class="narrative-text">
      The following recommendations are prioritized based on their potential to reduce risk and 
      the urgency with which they should be implemented. Each recommendation addresses specific 
      vulnerabilities and threats identified in this assessment.
    </p>
    
    ${recommendations.slice(0, 5).map((rec, i) => `
    <div class="recommendation-card">
      <div class="recommendation-header">
        <span class="recommendation-priority">Priority ${i + 1}</span>
        <span class="recommendation-urgency">${rec.urgency.replace('_', ' ')}</span>
      </div>
      <div class="recommendation-body">
        <div class="recommendation-title">${rec.controlName}</div>
        <p class="recommendation-rationale">${rec.rationale}</p>
        ${rec.addressesThreats.length > 0 ? `
        <div style="margin-top: 10px; font-size: 9pt; color: #64748b;">
          <strong>Addresses:</strong> ${rec.addressesThreats.slice(0, 3).join(', ')}
        </div>
        ` : ''}
        ${rec.estimatedCost ? `
        <div style="margin-top: 5px; font-size: 9pt; color: #64748b;">
          <strong>Estimated Cost:</strong> ${rec.estimatedCost}
        </div>
        ` : ''}
      </div>
    </div>
    `).join('\n')}
  </div>
  
  ${recommendations.length > 5 ? `
  <div class="page">
    <h1 class="section-title">Security Recommendations (Continued)</h1>
    ${recommendations.slice(5).map((rec, i) => `
    <div class="recommendation-card">
      <div class="recommendation-header">
        <span class="recommendation-priority">Priority ${i + 6}</span>
        <span class="recommendation-urgency">${rec.urgency.replace('_', ' ')}</span>
      </div>
      <div class="recommendation-body">
        <div class="recommendation-title">${rec.controlName}</div>
        <p class="recommendation-rationale">${rec.rationale}</p>
      </div>
    </div>
    `).join('\n')}
  </div>
  ` : ''}
  `;
}

function renderImplementationRoadmap(epData: EPReportData): string {
  const immediate = epData.prioritizedControls.filter(c => c.urgency === 'immediate');
  const shortTerm = epData.prioritizedControls.filter(c => c.urgency === 'short_term');
  const mediumTerm = epData.prioritizedControls.filter(c => c.urgency === 'medium_term');
  
  return `
  <div class="page">
    <h1 class="section-title">Implementation Roadmap</h1>
    
    <p class="narrative-text">
      The following roadmap provides a phased approach to implementing the recommended 
      security enhancements based on urgency and resource requirements.
    </p>
    
    <h2 class="section-subtitle">Week 1-2: Immediate Actions</h2>
    <table class="data-table">
      <tr>
        <th>Priority</th>
        <th>Control</th>
        <th>Category</th>
      </tr>
      ${immediate.map((c, i) => `
        <tr>
          <td style="font-weight: bold;">${i + 1}</td>
          <td>${c.controlName}</td>
          <td>${c.category}</td>
        </tr>
      `).join('\n')}
      ${immediate.length === 0 ? '<tr><td colspan="3" style="text-align: center;">No immediate actions required</td></tr>' : ''}
    </table>
    
    <h2 class="section-subtitle">Week 3-6: Short-Term Implementation</h2>
    <table class="data-table">
      <tr>
        <th>Priority</th>
        <th>Control</th>
        <th>Category</th>
      </tr>
      ${shortTerm.map((c, i) => `
        <tr>
          <td style="font-weight: bold;">${immediate.length + i + 1}</td>
          <td>${c.controlName}</td>
          <td>${c.category}</td>
        </tr>
      `).join('\n')}
      ${shortTerm.length === 0 ? '<tr><td colspan="3" style="text-align: center;">No short-term actions identified</td></tr>' : ''}
    </table>
    
    <h2 class="section-subtitle">Month 2-3: Medium-Term Enhancement</h2>
    <table class="data-table">
      <tr>
        <th>Priority</th>
        <th>Control</th>
        <th>Category</th>
      </tr>
      ${mediumTerm.map((c, i) => `
        <tr>
          <td style="font-weight: bold;">${immediate.length + shortTerm.length + i + 1}</td>
          <td>${c.controlName}</td>
          <td>${c.category}</td>
        </tr>
      `).join('\n')}
      ${mediumTerm.length === 0 ? '<tr><td colspan="3" style="text-align: center;">No medium-term actions identified</td></tr>' : ''}
    </table>
  </div>
  `;
}

function renderConclusion(epData: EPReportData, principalName: string): string {
  const topThreat = epData.threatAssessments
    .sort((a, b) => b.riskScore.normalized - a.riskScore.normalized)[0];
  
  const topControl = epData.prioritizedControls[0];
  
  return `
  <div class="page">
    <h1 class="section-title">Conclusion</h1>
    
    <p class="narrative-text">
      This Executive Protection Assessment has evaluated the security posture for ${principalName} 
      across 12 threat scenarios using the T×V×I×E methodology. The assessment resulted in an 
      overall risk classification of <strong>${epData.riskClassification.toUpperCase()}</strong> 
      with a composite score of <strong>${epData.overallRiskScore}</strong>.
    </p>
    
    <p class="narrative-text">
      ${topThreat ? `The highest-priority threat scenario identified is <strong>${topThreat.threatName}</strong> 
      with a risk score of ${topThreat.riskScore.normalized}. ${topThreat.scenarioDescription}` : 
      'Risk scenarios were evaluated but no critical threats were identified at this time.'}
    </p>
    
    <p class="narrative-text">
      ${epData.componentSummaries.vulnerability.narrative}
    </p>
    
    <h2 class="section-subtitle">Key Risk Drivers</h2>
    <ul class="bullet-list">
      <li><strong>Threat Likelihood (${epData.componentSummaries.threat.overallScore.toFixed(1)}/10):</strong> 
          ${getScoreLabel(epData.componentSummaries.threat.overallScore)} probability of targeted action</li>
      <li><strong>Vulnerability (${epData.componentSummaries.vulnerability.overallScore.toFixed(1)}/10):</strong> 
          ${getScoreLabel(epData.componentSummaries.vulnerability.overallScore)} gaps in current protection</li>
      <li><strong>Impact (${epData.componentSummaries.impact.overallScore.toFixed(1)}/10):</strong> 
          ${getScoreLabel(epData.componentSummaries.impact.overallScore)} severity if incident occurs</li>
      <li><strong>Exposure (${epData.componentSummaries.exposure.overallScore.toFixed(1)}/5):</strong> 
          ${getScoreLabel(epData.componentSummaries.exposure.overallScore, 5)} public visibility</li>
    </ul>
    
    <h2 class="section-subtitle">Recommended Starting Point</h2>
    <p class="narrative-text">
      ${topControl ? `We recommend beginning with <strong>${topControl.controlName}</strong>. 
      ${topControl.rationale}` : 'Complete the assessment interview to receive prioritized recommendations.'}
    </p>
    
    <p class="narrative-text">
      This assessment should be reviewed and updated on an annual basis, or sooner if there are 
      significant changes in the principal's profile, travel patterns, or threat environment.
    </p>
  </div>
  `;
}

function renderDataSources(epData: EPReportData): string {
  return `
  <div class="page">
    <h1 class="section-title">Data Sources</h1>
    
    <h2 class="section-subtitle">Assessment Inputs</h2>
    <table class="data-table">
      <tr>
        <th>Source Type</th>
        <th>Description</th>
        <th>Completion</th>
      </tr>
      ${epData.sectionAssessments.map(s => `
        <tr>
          <td>${s.sectionName}</td>
          <td>Interview questionnaire section</td>
          <td>${s.completionPercentage}%</td>
        </tr>
      `).join('\n')}
      <tr>
        <td>Principal Profile</td>
        <td>Security professional assessment</td>
        <td>Integrated</td>
      </tr>
    </table>
    
    ${epData.dataGaps.length > 0 ? `
    <h2 class="section-subtitle">Data Gaps</h2>
    <p class="narrative-text">
      The following data gaps may impact the accuracy of this assessment:
    </p>
    <ul class="bullet-list">
      ${epData.dataGaps.map(g => `<li><strong>${g.section}:</strong> ${g.impactOnAssessment}</li>`).join('\n')}
    </ul>
    ` : ''}
    
    <h2 class="section-subtitle">Methodology Reference</h2>
    <ul class="bullet-list">
      <li>ASIS International General Security Risk Assessment Guidelines</li>
      <li>Executive Protection T×V×I×E Framework</li>
      <li>CPP (Certified Protection Professional) Standards</li>
    </ul>
  </div>
  `;
}

function renderAppendix(epData: EPReportData): string {
  return `
  <div class="page">
    <h1 class="section-title">Appendix: T×V×I×E Rating Scales</h1>
    
    <h2 class="section-subtitle">Threat Likelihood Scale (1-10)</h2>
    <div class="appendix-scale">
      <div class="scale-row" style="background: #1e3a8a; color: white;">
        <div class="scale-score" style="background: transparent;">Score</div>
        <div class="scale-label">Rating</div>
        <div class="scale-description">Description</div>
      </div>
      <div class="scale-row"><div class="scale-score">1-2</div><div class="scale-label">Minimal</div><div class="scale-description">Highly unlikely to be targeted</div></div>
      <div class="scale-row"><div class="scale-score">3-4</div><div class="scale-label">Low</div><div class="scale-description">Unlikely but possible</div></div>
      <div class="scale-row"><div class="scale-score">5-6</div><div class="scale-label">Moderate</div><div class="scale-description">Reasonably possible</div></div>
      <div class="scale-row"><div class="scale-score">7-8</div><div class="scale-label">High</div><div class="scale-description">Likely to be targeted</div></div>
      <div class="scale-row"><div class="scale-score">9-10</div><div class="scale-label">Critical</div><div class="scale-description">Almost certain to be targeted</div></div>
    </div>
    
    <h2 class="section-subtitle">Vulnerability Scale (1-10)</h2>
    <div class="appendix-scale">
      <div class="scale-row" style="background: #1e3a8a; color: white;">
        <div class="scale-score" style="background: transparent;">Score</div>
        <div class="scale-label">Rating</div>
        <div class="scale-description">Description</div>
      </div>
      <div class="scale-row"><div class="scale-score">1-2</div><div class="scale-label">Minimal</div><div class="scale-description">Comprehensive protection in place</div></div>
      <div class="scale-row"><div class="scale-score">3-4</div><div class="scale-label">Low</div><div class="scale-description">Good controls with minor gaps</div></div>
      <div class="scale-row"><div class="scale-score">5-6</div><div class="scale-label">Moderate</div><div class="scale-description">Basic controls with notable gaps</div></div>
      <div class="scale-row"><div class="scale-score">7-8</div><div class="scale-label">High</div><div class="scale-description">Significant gaps in protection</div></div>
      <div class="scale-row"><div class="scale-score">9-10</div><div class="scale-label">Critical</div><div class="scale-description">Little to no protective measures</div></div>
    </div>
    
    <h2 class="section-subtitle">Exposure Factor Scale (1-5)</h2>
    <div class="appendix-scale">
      <div class="scale-row" style="background: #1e3a8a; color: white;">
        <div class="scale-score" style="background: transparent;">Score</div>
        <div class="scale-label">Rating</div>
        <div class="scale-description">Description</div>
      </div>
      <div class="scale-row"><div class="scale-score">1</div><div class="scale-label">Private</div><div class="scale-description">Anonymous, no public presence</div></div>
      <div class="scale-row"><div class="scale-score">2</div><div class="scale-label">Low</div><div class="scale-description">Limited public exposure</div></div>
      <div class="scale-row"><div class="scale-score">3</div><div class="scale-label">Moderate</div><div class="scale-description">Industry recognition, some media</div></div>
      <div class="scale-row"><div class="scale-score">4</div><div class="scale-label">High</div><div class="scale-description">Significant public profile</div></div>
      <div class="scale-row"><div class="scale-score">5</div><div class="scale-label">Celebrity</div><div class="scale-description">Widely recognized VIP</div></div>
    </div>
    
    <h2 class="section-subtitle">Risk Classification</h2>
    <div class="appendix-scale">
      <div class="scale-row" style="background: #1e3a8a; color: white;">
        <div class="scale-score" style="background: transparent;">Score</div>
        <div class="scale-label">Classification</div>
        <div class="scale-description">Required Action</div>
      </div>
      <div class="scale-row"><div class="scale-score">75-100</div><div class="scale-label" style="color: #991b1b;">Critical</div><div class="scale-description">Immediate intervention required</div></div>
      <div class="scale-row"><div class="scale-score">50-74</div><div class="scale-label" style="color: #c2410c;">High</div><div class="scale-description">Urgent attention needed</div></div>
      <div class="scale-row"><div class="scale-score">25-49</div><div class="scale-label" style="color: #b45309;">Medium</div><div class="scale-description">Address in security program</div></div>
      <div class="scale-row"><div class="scale-score">0-24</div><div class="scale-label" style="color: #15803d;">Low</div><div class="scale-description">Monitor and maintain</div></div>
    </div>
  </div>
  `;
}

function renderFallbackReport(reportData: ReportDataPackage): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive Protection Assessment</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #1e3a8a; }
    .warning { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Executive Protection Assessment</h1>
  <div class="warning">
    <h2>Assessment Data Required</h2>
    <p>Complete the Executive Protection interview and profile forms to generate a full assessment report.</p>
    <p>The T×V×I×E analysis requires interview responses to calculate risk scores and generate recommendations.</p>
  </div>
</body>
</html>
  `;
}
