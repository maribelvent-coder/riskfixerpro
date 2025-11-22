/**
 * Master Report HTML Template Generator
 * 
 * Generates HTML content for security assessment PDF reports
 * with template-specific "killer features"
 */

interface ReportData {
  assessment: any;
  risks: any[];
  photos: any[];
  executiveSummary: string;
  templateMetrics: Record<string, any>;
}

/**
 * Render complete HTML report for PDF generation
 */
export async function renderReportHTML(data: ReportData): Promise<string> {
  const { assessment, risks, photos, executiveSummary, templateMetrics } = data;
  
  // Extract high and critical risks for executive summary section
  const criticalRisks = risks.filter(r => r.riskLevel === 'Critical');
  const highRisks = risks.filter(r => r.riskLevel === 'High');
  
  // Calculate overall risk score (0-100)
  const avgInherentRisk = risks.length > 0 
    ? risks.reduce((sum, r) => sum + (r.inherentRisk || 0), 0) / risks.length
    : 0;
  const overallScore = Math.round((avgInherentRisk / 125) * 100);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Assessment Report - ${assessment.title || 'Untitled'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      font-size: 11pt;
    }
    
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      page-break-after: always;
    }
    
    .cover-page h1 {
      font-size: 42pt;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    .cover-page .subtitle {
      font-size: 18pt;
      margin-bottom: 60px;
    }
    
    .cover-page .score-gauge {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      border: 15px solid rgba(255,255,255,0.3);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-bottom: 40px;
    }
    
    .cover-page .score-number {
      font-size: 56pt;
      font-weight: bold;
    }
    
    .cover-page .score-label {
      font-size: 14pt;
      opacity: 0.9;
    }
    
    .cover-page .meta {
      font-size: 14pt;
      margin-top: 40px;
    }
    
    .section {
      page-break-before: always;
      padding: 40px 0;
    }
    
    .section-title {
      font-size: 24pt;
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 30px;
      padding-bottom: 10px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .executive-summary {
      font-size: 12pt;
      line-height: 1.8;
      margin-bottom: 30px;
      text-align: justify;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    
    .stat-card {
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      border-radius: 4px;
    }
    
    .stat-card .stat-label {
      font-size: 10pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .stat-card .stat-value {
      font-size: 28pt;
      font-weight: bold;
      color: #1e3a8a;
    }
    
    .risk-matrix-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    
    .risk-matrix-table th {
      background: #1e3a8a;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .risk-matrix-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10pt;
    }
    
    .risk-matrix-table tr:hover {
      background: #f8fafc;
    }
    
    .risk-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .risk-critical {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .risk-high {
      background: #fef3c7;
      color: #92400e;
    }
    
    .risk-medium {
      background: #fef9c3;
      color: #854d0e;
    }
    
    .risk-low {
      background: #d1fae5;
      color: #065f46;
    }
    
    .risk-detail {
      margin: 40px 0;
      padding: 30px;
      background: #f8fafc;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    
    .risk-detail h3 {
      font-size: 16pt;
      color: #1e3a8a;
      margin-bottom: 15px;
    }
    
    .risk-detail .description {
      font-size: 11pt;
      line-height: 1.7;
      margin-bottom: 20px;
    }
    
    .risk-detail .recommendations {
      background: white;
      padding: 20px;
      border-radius: 4px;
      border-left: 4px solid #10b981;
    }
    
    .risk-detail .recommendations h4 {
      font-size: 12pt;
      color: #10b981;
      margin-bottom: 10px;
    }
    
    .metric-section {
      margin: 40px 0;
      padding: 30px;
      background: #f0f9ff;
      border-radius: 8px;
      border-left: 6px solid #3b82f6;
    }
    
    .metric-section h3 {
      font-size: 18pt;
      color: #1e3a8a;
      margin-bottom: 20px;
    }
    
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    
    .metric-item {
      background: white;
      padding: 15px;
      border-radius: 4px;
    }
    
    .metric-item .label {
      font-size: 9pt;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .metric-item .value {
      font-size: 16pt;
      font-weight: bold;
      color: #1e3a8a;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <h1>Security Assessment Report</h1>
    <div class="subtitle">${assessment.title || 'Comprehensive Facility Assessment'}</div>
    
    <div class="score-gauge">
      <div class="score-number">${overallScore}</div>
      <div class="score-label">Risk Score</div>
    </div>
    
    <div class="meta">
      <div>Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString()}</div>
      <div>Template: ${formatTemplateName(assessment.templateId)}</div>
    </div>
  </div>

  <!-- Executive Summary Section -->
  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Risks Identified</div>
        <div class="stat-value">${risks.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Critical & High Risks</div>
        <div class="stat-value">${criticalRisks.length + highRisks.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Overall Risk Score</div>
        <div class="stat-value">${overallScore}%</div>
      </div>
    </div>
    
    <div class="executive-summary">
      ${executiveSummary}
    </div>
  </div>

  <!-- Risk Matrix Section -->
  <div class="section">
    <h2 class="section-title">Risk Matrix</h2>
    
    <table class="risk-matrix-table">
      <thead>
        <tr>
          <th>Risk Scenario</th>
          <th>Asset</th>
          <th>Threat Type</th>
          <th>Risk Level</th>
          <th>Inherent Risk</th>
        </tr>
      </thead>
      <tbody>
        ${risks.map(risk => `
          <tr>
            <td><strong>${risk.scenario || 'Unnamed Risk'}</strong></td>
            <td>${risk.asset || 'N/A'}</td>
            <td>${risk.threatType || 'N/A'}</td>
            <td><span class="risk-badge risk-${(risk.riskLevel || 'low').toLowerCase()}">${risk.riskLevel || 'Low'}</span></td>
            <td>${risk.inherentRisk || 0} / 125</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Detailed Findings Section -->
  <div class="section">
    <h2 class="section-title">Detailed Risk Findings</h2>
    <p style="margin-bottom: 20px; font-size: 10pt; color: #64748b;">
      Critical and High priority risks requiring immediate attention with professional security analysis.
    </p>
    
    ${risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').map(risk => `
      <div class="risk-detail">
        <h3>
          <span class="risk-badge risk-${(risk.riskLevel || 'low').toLowerCase()}">${risk.riskLevel || 'Low'}</span>
          ${risk.scenario || 'Unnamed Risk'}
        </h3>
        
        <div class="description">
          <strong>Asset at Risk:</strong> ${risk.asset || 'Not specified'}<br>
          <strong>Threat Type:</strong> ${risk.threatType || 'Not specified'}<br>
          <strong>Risk Score:</strong> ${risk.inherentRisk || 0} / 125
        </div>
        
        ${risk.threatDescription ? `
          <div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 6px; border-left: 5px solid #6366f1;">
            <h4 style="color: #1e40af; margin-bottom: 15px; font-size: 11.5pt; font-weight: 600;">
              Professional Security Analysis
            </h4>
            <div style="font-size: 10pt; line-height: 1.8; color: #334155; white-space: pre-wrap;">
              ${risk.threatDescription}
            </div>
          </div>
        ` : risk.vulnerabilityDescription ? `
          <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 6px;">
            <p style="font-size: 10pt; line-height: 1.7; color: #334155;">
              <strong>Vulnerability:</strong> ${risk.vulnerabilityDescription}
            </p>
          </div>
        ` : ''}
        
        ${risk.controlRecommendations ? `
          <div class="recommendations">
            <h4>Recommended Controls</h4>
            <p style="font-size: 10pt;">${risk.controlRecommendations}</p>
          </div>
        ` : ''}
      </div>
    `).join('')}
    
    ${risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length === 0 ? `
      <p style="text-align: center; padding: 40px; color: #64748b;">
        No critical or high-priority risks identified. Review medium and low risks in the Risk Matrix section above.
      </p>
    ` : ''}
  </div>

  <!-- Technical Report - Tabular Audit Format -->
  <div class="section">
    <h2 class="section-title">Technical Report: Control Audit Findings</h2>
    <p style="margin-bottom: 20px; font-size: 10pt; color: #64748b;">
      Engineering checklist format presenting specific security control gaps, technical requirements, and standards compliance.
    </p>
    
    <table class="risk-matrix-table">
      <thead>
        <tr>
          <th style="width: 20%;">Control Domain</th>
          <th style="width: 30%;">Specific Gap Identified</th>
          <th style="width: 30%;">Technical Requirement</th>
          <th style="width: 20%;">Standards Reference</th>
        </tr>
      </thead>
      <tbody>
        ${risks.map(risk => {
          // Determine control domain from threat type
          const domainMap: Record<string, string> = {
            'human': 'Access Control & Perimeter',
            'natural': 'Environmental Protection',
            'technical': 'Technical Safeguards',
            'environmental': 'Environmental Controls'
          };
          const domain = domainMap[risk.threatType || 'human'] || 'General Security';
          
          // Extract gap from vulnerability description or generate from scenario
          const gap = risk.vulnerabilityDescription 
            ? risk.vulnerabilityDescription.substring(0, 150) + (risk.vulnerabilityDescription.length > 150 ? '...' : '')
            : `${risk.scenario || 'Security vulnerability'} - inadequate controls`;
          
          // Generate technical requirement based on risk level
          const requirement = risk.controlRecommendations 
            ? risk.controlRecommendations.substring(0, 150) + (risk.controlRecommendations.length > 150 ? '...' : '')
            : (risk.riskLevel === 'Critical' || risk.riskLevel === 'High')
            ? 'Implement immediate corrective controls to mitigate exposure'
            : 'Enhance existing controls or implement compensating measures';
          
          // Map to relevant standards
          const standards = [];
          if (domain.includes('Access')) standards.push('ASIS PSC.1-2012 §4.1');
          if (domain.includes('Technical')) standards.push('NIST SP 800-53');
          if (domain.includes('Environmental')) standards.push('FM 3-19.30');
          if (risk.threatType === 'natural') standards.push('FEMA 426');
          const standardsRef = standards.length > 0 ? standards.join(', ') : 'Industry Best Practice';
          
          return `
            <tr>
              <td><strong>${domain}</strong></td>
              <td>${gap}</td>
              <td>${requirement}</td>
              <td style="font-size: 9pt;">${standardsRef}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    
    ${risks.length === 0 ? `
      <p style="text-align: center; padding: 40px; color: #64748b;">
        No technical control gaps identified during assessment.
      </p>
    ` : ''}
    
    <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
      <p style="font-size: 9pt; color: #1e40af; line-height: 1.6;">
        <strong>Standards Key:</strong><br>
        • ASIS PSC.1-2012: ASIS International Physical Security Professional Competency Standard<br>
        • NIST SP 800-53: Security and Privacy Controls for Information Systems<br>
        • FM 3-19.30: U.S. Army Field Manual - Physical Security<br>
        • FEMA 426: Reference Manual to Mitigate Potential Terrorist Attacks
      </p>
    </div>
  </div>

  <!-- Template-Specific Financial Impact Section -->
  ${renderTemplateMetrics(assessment.templateId, templateMetrics)}
</body>
</html>
  `;
}

/**
 * Format template ID into readable name
 */
function formatTemplateName(templateId: string | null): string {
  if (!templateId) return 'General Assessment';
  
  const names: Record<string, string> = {
    'warehouse-distribution': 'Warehouse & Distribution Center',
    'retail-store': 'Retail Store',
    'manufacturing-facility': 'Manufacturing Facility',
    'executive-protection': 'Executive Protection',
    'data-center': 'Data Center',
    'office-building': 'Office Building'
  };
  
  return names[templateId] || templateId;
}

/**
 * Render template-specific metrics section
 */
function renderTemplateMetrics(templateId: string | null, metrics: Record<string, any>): string {
  if (!templateId || Object.keys(metrics).length === 0) {
    return '';
  }
  
  switch (templateId) {
    case 'warehouse-distribution':
      return renderWarehouseMetrics(metrics);
    case 'retail-store':
      return renderRetailMetrics(metrics);
    case 'manufacturing-facility':
      return renderManufacturingMetrics(metrics);
    case 'executive-protection':
      return renderExecutiveProtectionMetrics(metrics);
    case 'data-center':
      return renderDataCenterMetrics(metrics);
    case 'office-building':
      return renderOfficeMetrics(metrics);
    default:
      return '';
  }
}

function renderWarehouseMetrics(metrics: any): string {
  const { cargoTheftROI, loadingDockHeatmap } = metrics;
  
  return `
  <div class="section">
    <h2 class="section-title">Cargo Theft ROI Analysis</h2>
    <div class="metric-section">
      <h3>Financial Impact Assessment</h3>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="label">Inventory Value</div>
          <div class="value">$${cargoTheftROI.inventoryValue.toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Estimated Annual Loss</div>
          <div class="value">$${Math.round(cargoTheftROI.estimatedAnnualLoss).toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Prevention Investment Needed</div>
          <div class="value">$${Math.round(cargoTheftROI.preventionInvestment).toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Potential Annual Savings</div>
          <div class="value">$${Math.round(cargoTheftROI.potentialSavings).toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="metric-section">
      <h3>Loading Dock Security Heatmap</h3>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="label">Total Loading Docks</div>
          <div class="value">${loadingDockHeatmap.totalDocks}</div>
        </div>
        <div class="metric-item">
          <div class="label">Daily Truck Volume</div>
          <div class="value">${loadingDockHeatmap.dailyTruckVolume}</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function renderRetailMetrics(metrics: any): string {
  const { shrinkageAnalysis, lossPreventionROI } = metrics;
  
  return `
  <div class="section">
    <h2 class="section-title">Shrinkage & Loss Prevention Analysis</h2>
    <div class="metric-section">
      <h3>Shrinkage Performance</h3>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="label">Current Shrinkage Rate</div>
          <div class="value">${shrinkageAnalysis.shrinkageRate.toFixed(2)}%</div>
        </div>
        <div class="metric-item">
          <div class="label">Industry Benchmark</div>
          <div class="value">${shrinkageAnalysis.industryBenchmark.toFixed(2)}%</div>
        </div>
        <div class="metric-item">
          <div class="label">Annual Shrinkage Loss</div>
          <div class="value">$${Math.round(shrinkageAnalysis.shrinkageDollars).toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Excess Loss vs Benchmark</div>
          <div class="value">$${Math.round(shrinkageAnalysis.excessLoss).toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="metric-section">
      <h3>Loss Prevention ROI</h3>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="label">Recommended LP Investment</div>
          <div class="value">$${Math.round(lossPreventionROI.recommendedInvestment).toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Potential Recovery</div>
          <div class="value">$${Math.round(lossPreventionROI.potentialRecovery).toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Net Benefit</div>
          <div class="value">$${Math.round(lossPreventionROI.netBenefit).toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Expected ROI</div>
          <div class="value">${lossPreventionROI.roi.toFixed(1)}x</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function renderManufacturingMetrics(metrics: any): string {
  const { downtimeCostCalculator } = metrics;
  
  return `
  <div class="section">
    <h2 class="section-title">Downtime Cost Analysis</h2>
    <div class="metric-section">
      <h3>Production Continuity Risk</h3>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="label">Annual Production Value</div>
          <div class="value">$${downtimeCostCalculator.annualProductionValue.toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Value Per Hour</div>
          <div class="value">$${Math.round(downtimeCostCalculator.valuePerHour).toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="label">Avg Incident Downtime</div>
          <div class="value">${downtimeCostCalculator.avgIncidentDowntime} hours</div>
        </div>
        <div class="metric-item">
          <div class="label">Potential Loss Per Incident</div>
          <div class="value">$${Math.round(downtimeCostCalculator.potentialLossPerIncident).toLocaleString()}</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function renderExecutiveProtectionMetrics(metrics: any): string {
  const { exposureFactor, threatRadar } = metrics;
  
  return `
  <div class="section">
    <h2 class="section-title">Executive Protection Analysis</h2>
    <div class="metric-section">
      <h3>Exposure Factor Assessment</h3>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="label">Exposure Score</div>
          <div class="value">${Math.round(exposureFactor.score)}/100</div>
        </div>
        <div class="metric-item">
          <div class="label">Risk Level</div>
          <div class="value">${exposureFactor.level}</div>
        </div>
        <div class="metric-item">
          <div class="label">Kidnapping Risks</div>
          <div class="value">${exposureFactor.kidnappingRisks}</div>
        </div>
        <div class="metric-item">
          <div class="label">Digital Exposure Risks</div>
          <div class="value">${exposureFactor.digitalExposureRisks}</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function renderDataCenterMetrics(metrics: any): string {
  const { slaGapAnalysis } = metrics;
  
  return `
  <div class="section">
    <h2 class="section-title">SLA Gap Analysis</h2>
    <div class="metric-section">
      <h3>Uptime & Compliance</h3>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="label">Uptime Target</div>
          <div class="value">${slaGapAnalysis.uptimeTarget.toFixed(2)}%</div>
        </div>
        <div class="metric-item">
          <div class="label">Allowed Downtime (Hours/Year)</div>
          <div class="value">${slaGapAnalysis.allowedDowntimeHours.toFixed(1)}</div>
        </div>
        <div class="metric-item">
          <div class="label">SLA Breach Risks</div>
          <div class="value">${slaGapAnalysis.slaBreachRisks}</div>
        </div>
        <div class="metric-item">
          <div class="label">Potential Penalty Per Hour</div>
          <div class="value">$${Math.round(slaGapAnalysis.potentialPenaltyPerHour).toLocaleString()}</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function renderOfficeMetrics(metrics: any): string {
  const { safetyScore, keyMetrics } = metrics;
  
  return `
  <div class="section">
    <h2 class="section-title">Workplace Safety Score</h2>
    <div class="metric-section">
      <h3>Safety Performance</h3>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="label">Overall Safety Score</div>
          <div class="value">${safetyScore.overall}/100</div>
        </div>
        <div class="metric-item">
          <div class="label">Safety Grade</div>
          <div class="value">${safetyScore.grade}</div>
        </div>
        <div class="metric-item">
          <div class="label">Violence Preparedness</div>
          <div class="value">${safetyScore.violencePreparedness}</div>
        </div>
        <div class="metric-item">
          <div class="label">Data Security Posture</div>
          <div class="value">${safetyScore.dataSecurityPosture}</div>
        </div>
      </div>
    </div>
  </div>
  `;
}
