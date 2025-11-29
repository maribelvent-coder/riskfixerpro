import type { GeneratedReportResult, GeneratedSection } from "../services/reporting/report-generator";

export function renderExecutiveSummaryHTML(report: GeneratedReportResult): string {
  const { dataSnapshot, generatedAt, assessmentId } = report;
  const sections = report.sections || [];
  
  const principalName = dataSnapshot?.principal?.name || dataSnapshot?.facility?.name || 'Assessment Subject';
  const reportDate = generatedAt || dataSnapshot?.generatedAt;
  const assessmentDate = reportDate 
    ? new Date(reportDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  const consultantName = 'RiskFixer Security Consulting';
  const organizationName = dataSnapshot?.principal?.organization || '';
  const principalTitle = dataSnapshot?.principal?.title || '';

  const overallRiskScore = dataSnapshot?.riskScores?.overallScore || 0;
  const riskLevel = getRiskLevelLabel(overallRiskScore);
  const riskColor = getRiskLevelColor(riskLevel);

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Summary - ${principalName}</title>
  <style>
    @page {
      size: Letter;
      margin: 1in;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-break {
        page-break-before: always;
      }
      .no-break {
        page-break-inside: avoid;
      }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #2d3748;
      background: #fff;
    }

    /* Cover Page Styles */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(180deg, #1a365d 0%, #2d4a77 100%);
      color: white;
      margin: -1in;
      padding: 2in 1in;
    }

    .cover-logo {
      font-size: 24pt;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 60px;
      color: #e2e8f0;
    }

    .cover-title {
      font-size: 36pt;
      font-weight: bold;
      margin-bottom: 20px;
      max-width: 80%;
    }

    .cover-subtitle {
      font-size: 16pt;
      color: #a0aec0;
      margin-bottom: 60px;
    }

    .cover-risk-badge {
      display: inline-block;
      padding: 12px 40px;
      border-radius: 30px;
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 80px;
    }

    .cover-meta {
      font-size: 11pt;
      color: #a0aec0;
    }

    .cover-meta div {
      margin: 8px 0;
    }

    /* Table of Contents */
    .toc {
      padding: 40px 0;
    }

    .toc-title {
      font-size: 24pt;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 3px solid #1a365d;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 12px 0;
      border-bottom: 1px dotted #cbd5e0;
      font-size: 12pt;
    }

    .toc-item-title {
      color: #2d3748;
    }

    .toc-item-page {
      color: #718096;
    }

    /* Section Styles */
    .section {
      padding: 40px 0;
    }

    .section-header {
      font-size: 18pt;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #1a365d;
    }

    .section-content {
      font-size: 11pt;
      line-height: 1.8;
      color: #2d3748;
      text-align: justify;
    }

    .section-content p {
      margin-bottom: 16px;
    }

    /* Risk Score Box */
    .risk-score-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 30px;
      margin: 30px 0;
      background: #f7fafc;
      border-radius: 8px;
      border-left: 6px solid ${riskColor};
    }

    .risk-score-number {
      font-size: 48pt;
      font-weight: bold;
      color: ${riskColor};
    }

    .risk-score-details {
      text-align: left;
    }

    .risk-score-label {
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #718096;
      margin-bottom: 8px;
    }

    .risk-score-level {
      font-size: 18pt;
      font-weight: bold;
      color: #1a365d;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 10pt;
    }

    .data-table th {
      background: #1a365d;
      color: white;
      padding: 12px 10px;
      text-align: left;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 9pt;
      letter-spacing: 0.5px;
    }

    .data-table td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }

    .data-table tr:nth-child(even) {
      background: #f7fafc;
    }

    .data-table tr:hover {
      background: #edf2f7;
    }

    /* Risk Level Badges */
    .risk-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
    }

    .risk-critical {
      background: #fed7d7;
      color: #c53030;
    }

    .risk-high {
      background: #feebc8;
      color: #c05621;
    }

    .risk-medium {
      background: #fefcbf;
      color: #b7791f;
    }

    .risk-low {
      background: #c6f6d5;
      color: #276749;
    }

    /* About Section */
    .about-section {
      margin-top: 60px;
      padding: 30px;
      background: #f7fafc;
      border-radius: 8px;
    }

    .about-section h3 {
      font-size: 14pt;
      color: #1a365d;
      margin-bottom: 16px;
    }

    .about-section p {
      font-size: 10pt;
      color: #4a5568;
      line-height: 1.6;
    }

    /* Footer */
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 15px 1in;
      font-size: 9pt;
      color: #718096;
      border-top: 1px solid #e2e8f0;
      background: white;
    }

    .page-footer-content {
      display: flex;
      justify-content: space-between;
    }

    /* Priority Badge */
    .priority-critical { color: #c53030; font-weight: bold; }
    .priority-high { color: #c05621; font-weight: bold; }
    .priority-medium { color: #b7791f; }
    .priority-low { color: #276749; }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }

    .stat-card {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #1a365d;
    }

    .stat-value {
      font-size: 28pt;
      font-weight: bold;
      color: #1a365d;
    }

    .stat-label {
      font-size: 10pt;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-logo">RISKFIXER</div>
    <h1 class="cover-title">Executive Security Summary</h1>
    <div class="cover-subtitle">${principalName}${principalTitle ? ` - ${principalTitle}` : ''}</div>
    
    <div class="cover-risk-badge" style="background: ${riskColor};">
      Overall Risk: ${riskLevel.toUpperCase()}
    </div>
    
    <div class="cover-meta">
      <div><strong>Assessment Date:</strong> ${assessmentDate}</div>
      <div><strong>Prepared By:</strong> ${consultantName}</div>
      ${organizationName ? `<div><strong>Organization:</strong> ${organizationName}</div>` : ''}
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="page-break"></div>
  <div class="toc">
    <h2 class="toc-title">Table of Contents</h2>
    ${sortedSections.map((section, index) => `
      <div class="toc-item">
        <span class="toc-item-title">${index + 1}. ${section.title}</span>
        <span class="toc-item-page">${index + 2}</span>
      </div>
    `).join('')}
  </div>

  <!-- Report Sections -->
  ${sortedSections.map((section, index) => 
    renderSection(section, index === 0 ? false : section.pageBreakBefore, dataSnapshot)
  ).join('')}

  <!-- About RiskFixer -->
  <div class="about-section no-break">
    <h3>About RiskFixer</h3>
    <p>
      RiskFixer provides enterprise-grade security risk assessment solutions for organizations 
      seeking to protect their people, assets, and operations. Our platform combines industry-leading 
      methodologies with advanced analytics to deliver actionable security intelligence. 
      Aligned with ASIS International standards and Army FM guidelines, RiskFixer transforms 
      complex security data into clear, prioritized recommendations.
    </p>
  </div>
</body>
</html>
  `;
}

function getRiskLevelLabel(score: number): string {
  if (score > 100) return 'critical';
  if (score > 75) return 'high';
  if (score > 50) return 'medium';
  return 'low';
}

function getRiskLevelColor(level: string): string {
  const colors: Record<string, string> = {
    'critical': '#c53030',
    'high': '#c05621',
    'medium': '#b7791f',
    'low': '#276749'
  };
  return colors[level] || '#718096';
}

function renderSection(section: GeneratedSection, pageBreak: boolean, dataSnapshot: any): string {
  let content = '';

  if (section.narrativeContent) {
    const paragraphs = section.narrativeContent.split('\n\n').filter(p => p.trim());
    content += paragraphs.map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
  }

  if (section.tableContent) {
    content += renderTableHTML(section.tableContent);
  }

  if (section.id === 'mathematical-reality') {
    content = renderRiskScoreSection(dataSnapshot) + content;
  }

  if (section.id === 'cover') {
    return '';
  }

  return `
    <div class="section${pageBreak ? ' page-break' : ''} no-break">
      <h2 class="section-header">${section.title}</h2>
      <div class="section-content">
        ${content || '<p><em>No content available for this section.</em></p>'}
      </div>
    </div>
  `;
}

function renderRiskScoreSection(dataSnapshot: any): string {
  const riskScores = dataSnapshot.riskScores || {};
  const categoryBreakdown = riskScores.categoryBreakdown || [];
  
  const threatCategory = categoryBreakdown.find((c: any) => c.category === 'threat') || { score: 0 };
  const vulnCategory = categoryBreakdown.find((c: any) => c.category === 'vulnerability') || { score: 0 };
  const impactCategory = categoryBreakdown.find((c: any) => c.category === 'impact') || { score: 0 };
  
  const threatScore = threatCategory.score || 0;
  const vulnerabilityScore = vulnCategory.score || 0;
  const impactScore = impactCategory.score || 0;
  const overallScore = riskScores.overallScore || 0;
  const riskLevel = getRiskLevelLabel(overallScore);
  const riskColor = getRiskLevelColor(riskLevel);

  return `
    <div class="risk-score-box" style="border-left-color: ${riskColor};">
      <div class="risk-score-number" style="color: ${riskColor};">${Math.round(overallScore)}</div>
      <div class="risk-score-details">
        <div class="risk-score-label">Overall Risk Score</div>
        <div class="risk-score-level">${riskLevel.toUpperCase()} RISK</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${Math.round(threatScore)}</div>
        <div class="stat-label">Threat Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(vulnerabilityScore)}</div>
        <div class="stat-label">Vulnerability Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(impactScore)}</div>
        <div class="stat-label">Impact Score</div>
      </div>
    </div>
  `;
}

function renderTableHTML(tableContent: any): string {
  if (!tableContent || !tableContent.columns || !tableContent.rows) {
    return '';
  }

  const { columns, rows } = tableContent;

  return `
    <table class="data-table">
      <thead>
        <tr>
          ${columns.map((col: any) => `<th style="width: ${col.width || 'auto'};">${escapeHtml(col.header)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row: any) => `
          <tr>
            ${columns.map((col: any) => {
              const value = row[col.field];
              const formattedValue = formatCellValue(value, col.format);
              const boldStyle = col.bold ? 'font-weight: bold;' : '';
              return `<td style="${boldStyle}">${formattedValue}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function formatCellValue(value: any, format?: string): string {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (format) {
    case 'severity-badge':
    case 'priority-badge':
      const level = String(value).toLowerCase();
      return `<span class="risk-badge risk-${level}">${escapeHtml(String(value))}</span>`;
    
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : escapeHtml(String(value));
    
    case 'percentage':
      return typeof value === 'number' ? `${value.toFixed(1)}%` : escapeHtml(String(value));
    
    case 'multiplier':
      return typeof value === 'number' ? `${value.toFixed(1)}x` : escapeHtml(String(value));
    
    case 'date':
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return escapeHtml(String(value));
      }
    
    case 'comma-list':
      if (Array.isArray(value)) {
        return value.map(v => escapeHtml(String(v))).join(', ');
      }
      return escapeHtml(String(value));
    
    default:
      return escapeHtml(String(value));
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}
