export function renderReportHTML(data: any): string {
  const {
    assessment,
    scenarios,
    executiveSummary,
    conclusion,
    options,
    reportType,
  } = data;
  
  const threatScores = scenarios.map((s: any) => s.threatLikelihood || 0);
  const vulnScores = scenarios.map((s: any) => s.vulnerability || 0);
  const impactScores = scenarios.map((s: any) => s.impact || 0);
  
  const avgThreat = Math.round(threatScores.reduce((a: number, b: number) => a + b, 0) / threatScores.length);
  const avgVuln = Math.round(vulnScores.reduce((a: number, b: number) => a + b, 0) / vulnScores.length);
  const avgImpact = Math.round(impactScores.reduce((a: number, b: number) => a + b, 0) / impactScores.length);
  const overallScore = avgThreat * avgVuln * avgImpact;
  
  let overallClassification = 'NEGLIGIBLE';
  let riskColor = '#22C55E';
  if (overallScore > 75) { overallClassification = 'CRITICAL'; riskColor = '#EF4444'; }
  else if (overallScore > 50) { overallClassification = 'ELEVATED'; riskColor = '#F97316'; }
  else if (overallScore > 25) { overallClassification = 'MODERATE'; riskColor = '#EAB308'; }
  else if (overallScore > 10) { overallClassification = 'LOW'; riskColor = '#3B82F6'; }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: Letter; margin: 0; }
    
    * { box-sizing: border-box; }
    
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
      color: white;
      page-break-after: always;
    }
    
    .cover-logo {
      font-size: 36pt;
      font-weight: bold;
      margin-bottom: 2rem;
    }
    
    .cover-title {
      font-size: 24pt;
      margin-bottom: 1rem;
    }
    
    .cover-subtitle {
      font-size: 14pt;
      opacity: 0.9;
      margin-bottom: 3rem;
    }
    
    .cover-risk-badge {
      display: inline-block;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 3rem;
    }
    
    .cover-meta {
      font-size: 11pt;
      opacity: 0.8;
    }
    
    .content-page {
      padding: 0.75in;
      page-break-after: always;
    }
    
    h1 {
      font-size: 24pt;
      color: #1a365d;
      border-bottom: 3px solid #1a365d;
      padding-bottom: 0.5rem;
      margin-top: 0;
    }
    
    h2 {
      font-size: 16pt;
      color: #2d3748;
      margin-top: 1.5rem;
    }
    
    h3 {
      font-size: 13pt;
      color: #4a5568;
    }
    
    .score-box {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
    }
    
    .score-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin: 1rem 0;
    }
    
    .score-item {
      text-align: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .score-value {
      font-size: 24pt;
      font-weight: bold;
      color: #1a365d;
    }
    
    .score-label {
      font-size: 10pt;
      color: #718096;
      text-transform: uppercase;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 10pt;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
      text-align: left;
    }
    
    th {
      background: #f7fafc;
      font-weight: bold;
    }
    
    .risk-critical { background: #EF4444; color: white; padding: 2px 8px; border-radius: 4px; }
    .risk-high { background: #F97316; color: white; padding: 2px 8px; border-radius: 4px; }
    .risk-medium { background: #EAB308; color: black; padding: 2px 8px; border-radius: 4px; }
    .risk-low { background: #22C55E; color: white; padding: 2px 8px; border-radius: 4px; }
  </style>
</head>
<body>
  ${options.includeCoverPage ? `
  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-logo">RiskFixer</div>
    <div class="cover-title">Security Assessment Report</div>
    <div class="cover-subtitle">${assessment.name}</div>
    <div class="cover-risk-badge" style="background: ${riskColor};">
      OVERALL RISK: ${overallClassification}<br>
      <span style="font-size: 14pt;">Score: ${overallScore}/125</span>
    </div>
    <div class="cover-meta">
      <strong>CONFIDENTIAL</strong><br><br>
      Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString()}<br>
      Prepared by: RiskFixer Security Consulting
    </div>
  </div>
  ` : ''}
  
  <!-- EXECUTIVE SUMMARY -->
  <div class="content-page">
    <h1>EXECUTIVE SUMMARY</h1>
    
    <div class="score-box">
      <div style="font-size: 14pt; font-weight: bold; color: ${riskColor};">
        OVERALL RISK RATING: ${overallClassification}
      </div>
      <div style="font-size: 18pt; font-weight: bold; margin-top: 0.5rem;">
        Score: ${overallScore}/125
      </div>
    </div>
    
    <div style="margin-top: 1.5rem;">
      ${executiveSummary.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
    </div>
    
    <h2>Risk Score Breakdown</h2>
    <div class="score-grid">
      <div class="score-item">
        <div class="score-value">${avgThreat}/5</div>
        <div class="score-label">Threat</div>
      </div>
      <div class="score-item">
        <div class="score-value">${avgVuln}/5</div>
        <div class="score-label">Vulnerability</div>
      </div>
      <div class="score-item">
        <div class="score-value">${avgImpact}/5</div>
        <div class="score-label">Impact</div>
      </div>
      <div class="score-item">
        <div class="score-value" style="color: ${riskColor};">${overallScore}</div>
        <div class="score-label">Overall</div>
      </div>
    </div>
  </div>
  
  <!-- RISK SCENARIOS -->
  <div class="content-page">
    <h1>RISK SCENARIOS</h1>
    
    <table>
      <thead>
        <tr>
          <th>Scenario</th>
          <th>T</th>
          <th>V</th>
          <th>I</th>
          <th>Risk</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        ${scenarios.map((s: any) => `
          <tr>
            <td>${s.threatId?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</td>
            <td>${s.threatLikelihood}</td>
            <td>${s.vulnerability}</td>
            <td>${s.impact}</td>
            <td><strong>${s.inherentRisk}</strong></td>
            <td><span class="risk-${s.riskLevel}">${s.riskLevel?.toUpperCase()}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <!-- CONCLUSION -->
  <div class="content-page">
    <h1>CONCLUSION</h1>
    ${conclusion.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
    
    <h2>Data Sources</h2>
    <ul>
      <li>Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString()}</li>
      <li>Methodology: ASIS International Security Risk Assessment (SRA) Standard</li>
      <li>Risk Calculation: T x V x I Formula</li>
    </ul>
  </div>
  
  <!-- APPENDIX: RATING SCALE -->
  <div class="content-page">
    <h1>APPENDIX: TxVxI Rating Scale</h1>
    
    <h2>Component Ratings (1-5)</h2>
    <table>
      <thead>
        <tr>
          <th>Score</th>
          <th>Rating</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1/5</td><td>Minimal</td><td>Minimal threat/vulnerability/impact</td></tr>
        <tr><td>2/5</td><td>Low</td><td>Low threat/vulnerability/impact</td></tr>
        <tr><td>3/5</td><td>Moderate</td><td>Moderate threat/vulnerability/impact</td></tr>
        <tr><td>4/5</td><td>Significant</td><td>Significant threat/vulnerability/impact</td></tr>
        <tr><td>5/5</td><td>Critical</td><td>Critical threat/vulnerability/impact</td></tr>
      </tbody>
    </table>
    
    <h2>Overall Risk Classification (1-125)</h2>
    <table>
      <thead>
        <tr>
          <th>Score Range</th>
          <th>Classification</th>
          <th>Action Required</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1-10</td><td class="risk-low">NEGLIGIBLE</td><td>Accept risk; document only</td></tr>
        <tr><td>11-25</td><td style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 4px;">LOW</td><td>Monitor and review quarterly</td></tr>
        <tr><td>26-50</td><td class="risk-medium">MODERATE</td><td>Address within 90 days</td></tr>
        <tr><td>51-75</td><td class="risk-high">ELEVATED</td><td>Address within 30 days</td></tr>
        <tr><td>76-125</td><td class="risk-critical">CRITICAL</td><td>Immediate action required</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>
`;
}
