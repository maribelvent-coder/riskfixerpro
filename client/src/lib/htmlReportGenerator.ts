import type { ComprehensiveReportData } from './comprehensiveReportGenerator';

// Extend ComprehensiveReportData to include template-specific metrics
interface ExtendedReportData extends ComprehensiveReportData {
  templateMetrics?: Record<string, any>;
  templateId?: string | null;
}

// Normalize report data with defensive programming
function normalizeReportData(data: ExtendedReportData) {
  return {
    assessment: {
      id: data.assessment?.id || '',
      title: data.assessment?.title || 'Untitled Assessment',
      description: data.assessment?.description,
      assessor: data.assessment?.assessor,
      status: data.assessment?.status || 'draft',
      createdAt: data.assessment?.createdAt || new Date().toISOString(),
    },
    site: data.site
      ? {
          name: data.site.name || 'N/A',
          address: data.site.address,
          city: data.site.city,
          state: data.site.state,
          latitude: data.site.latitude,
          longitude: data.site.longitude,
        }
      : undefined,
    riskSummary: {
      totalScenarios: Number(data.riskSummary?.totalScenarios) || 0,
      highRiskCount: Number(data.riskSummary?.highRiskCount) || 0,
      mediumRiskCount: Number(data.riskSummary?.mediumRiskCount) || 0,
      lowRiskCount: Number(data.riskSummary?.lowRiskCount) || 0,
      averageInherentRisk: Number(data.riskSummary?.averageInherentRisk) || 0,
      averageCurrentRisk: Number(data.riskSummary?.averageCurrentRisk) || 0,
      averageResidualRisk: Number(data.riskSummary?.averageResidualRisk) || 0,
      topThreats: Array.isArray(data.riskSummary?.topThreats)
        ? data.riskSummary.topThreats
            .filter((t: any) => t && typeof t === 'object')
            .map((threat: any) => ({
              scenario: threat.scenario || 'Unknown Scenario',
              likelihood: threat.likelihood || 'N/A',
              impact: threat.impact || 'N/A',
              riskScore: Number(threat.riskScore) || 0,
            }))
        : [],
    },
    geoIntel: data.geoIntel
      ? {
          crimeData: data.geoIntel.crimeData || [],
          incidents: data.geoIntel.incidents || [],
          riskIntelligence: data.geoIntel.riskIntelligence
            ? {
                overallRiskLevel: data.geoIntel.riskIntelligence.overallRiskLevel || 'Unknown',
                keyInsights: Array.isArray(data.geoIntel.riskIntelligence.keyInsights)
                  ? data.geoIntel.riskIntelligence.keyInsights.filter((i: any) => typeof i === 'string')
                  : [],
                recommendedControls: Array.isArray(data.geoIntel.riskIntelligence.recommendedControls)
                  ? data.geoIntel.riskIntelligence.recommendedControls.filter((c: any) => typeof c === 'string')
                  : [],
                threatIntelligence: data.geoIntel.riskIntelligence.threatIntelligence || [],
              }
            : null,
        }
      : undefined,
    photoEvidence: Array.isArray(data.photoEvidence)
      ? data.photoEvidence
          .filter((p: any) => p && typeof p === 'object' && p.url)
          .map((photo: any) => ({
            url: photo.url,
            caption: photo.caption || 'No caption',
            section: photo.section || 'General',
          }))
      : [],
    recommendations: Array.isArray(data.recommendations)
      ? data.recommendations
          .filter((r: any) => r && typeof r === 'object')
          .map((rec: any) => ({
            priority: rec.priority || 'medium',
            scenario: rec.scenario || 'N/A',
            risk: rec.risk || 'N/A',
            timeframe: rec.timeframe || 'N/A',
          }))
      : [],
    templateMetrics: data.templateMetrics || {},
    templateId: (data.assessment as any)?.templateId || null,
  };
}

// Generate HTML report
export async function generateHTMLReport(data: ExtendedReportData): Promise<string> {
  const normalizedData = normalizeReportData(data);
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(normalizedData.assessment.title)} - Security Assessment Report</title>
  <style>
    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary: #3b82f6;
      --primary-dark: #2563eb;
      --background: #0a0a0a;
      --surface: #1a1a1a;
      --surface-elevated: #252525;
      --text-primary: #ffffff;
      --text-secondary: #a3a3a3;
      --text-tertiary: #737373;
      --border: #333333;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
      --high-risk: #ef4444;
      --medium-risk: #f59e0b;
      --low-risk: #22c55e;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--background);
      color: var(--text-primary);
      line-height: 1.6;
      font-size: 16px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Navigation */
    .nav {
      position: sticky;
      top: 0;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      z-index: 100;
      backdrop-filter: blur(10px);
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .nav-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .nav-link:hover {
      color: var(--primary);
    }

    /* Cover Page */
    .cover {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, var(--surface) 0%, var(--background) 100%);
      border-radius: 0.75rem;
      margin-bottom: 3rem;
    }

    .cover-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .cover-subtitle {
      font-size: 1.5rem;
      color: var(--text-secondary);
      margin-bottom: 3rem;
    }

    .cover-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      width: 100%;
      max-width: 800px;
      margin-top: 2rem;
    }

    .cover-meta-item {
      text-align: left;
    }

    .cover-meta-label {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .cover-meta-value {
      font-size: 1.125rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Sections */
    .section {
      margin-bottom: 4rem;
      scroll-margin-top: 80px;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
      border-bottom: 2px solid var(--primary);
      padding-bottom: 0.5rem;
    }

    .section-subtitle {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: var(--text-primary);
    }

    .section-content {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 2rem;
    }

    /* Cards */
    .card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .stat-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      text-align: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Tables */
    .table-container {
      overflow-x: auto;
      margin: 1.5rem 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--surface-elevated);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    thead {
      background: var(--surface);
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      color: var(--text-secondary);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover {
      background: var(--surface);
    }

    /* Risk Badges */
    .risk-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .risk-high {
      background: rgba(239, 68, 68, 0.1);
      color: var(--high-risk);
      border: 1px solid var(--high-risk);
    }

    .risk-medium {
      background: rgba(245, 158, 11, 0.1);
      color: var(--medium-risk);
      border: 1px solid var(--medium-risk);
    }

    .risk-low {
      background: rgba(34, 197, 94, 0.1);
      color: var(--low-risk);
      border: 1px solid var(--low-risk);
    }

    /* Priority Badges */
    .priority-critical {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
      border: 1px solid var(--danger);
    }

    .priority-high {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning);
      border: 1px solid var(--warning);
    }

    .priority-medium {
      background: rgba(59, 130, 246, 0.1);
      color: var(--primary);
      border: 1px solid var(--primary);
    }

    .priority-low {
      background: rgba(34, 197, 94, 0.1);
      color: var(--success);
      border: 1px solid var(--success);
    }

    /* Lists */
    .insight-list {
      list-style: none;
      padding: 0;
    }

    .insight-item {
      padding: 1rem;
      background: var(--surface-elevated);
      border-left: 3px solid var(--primary);
      margin-bottom: 1rem;
      border-radius: 0.5rem;
    }

    /* Photo Gallery */
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .photo-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      overflow: hidden;
      transition: transform 0.2s;
    }

    .photo-card:hover {
      transform: translateY(-4px);
    }

    .photo-img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: var(--surface);
    }

    .photo-caption {
      padding: 1rem;
    }

    .photo-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .photo-section {
      font-size: 0.875rem;
      color: var(--text-tertiary);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .nav-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .cover-title {
        font-size: 2rem;
      }

      .cover-subtitle {
        font-size: 1.25rem;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .photo-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Print Styles */
    @media print {
      body {
        background: white;
        color: black;
      }

      .nav {
        display: none;
      }

      .section {
        page-break-inside: avoid;
      }

      .cover {
        page-break-after: always;
      }

      .card, .stat-card, .photo-card {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-content">
      <div class="nav-title">Security Assessment Report</div>
      <div class="nav-links">
        <a href="#executive-summary" class="nav-link">Executive Summary</a>
        <a href="#risk-analysis" class="nav-link">Risk Analysis</a>
        ${normalizedData.templateId && Object.keys(normalizedData.templateMetrics).length > 0 ? '<a href="#template-metrics" class="nav-link">Financial Analysis</a>' : ''}
        ${normalizedData.geoIntel?.riskIntelligence ? '<a href="#geointel" class="nav-link">GeoIntel</a>' : ''}
        ${normalizedData.recommendations.length > 0 ? '<a href="#recommendations" class="nav-link">Recommendations</a>' : ''}
        ${normalizedData.photoEvidence.length > 0 ? '<a href="#photos" class="nav-link">Photos</a>' : ''}
      </div>
    </div>
  </nav>

  <div class="container">
    <!-- Cover Page -->
    <section class="cover">
      <h1 class="cover-title">${escapeHtml(normalizedData.assessment.title)}</h1>
      <p class="cover-subtitle">Physical Security Risk Assessment</p>
      
      <div class="cover-meta">
        <div class="cover-meta-item">
          <div class="cover-meta-label">Facility</div>
          <div class="cover-meta-value">${escapeHtml(normalizedData.site?.name || 'N/A')}</div>
        </div>
        <div class="cover-meta-item">
          <div class="cover-meta-label">Location</div>
          <div class="cover-meta-value">${escapeHtml(normalizedData.site?.city || 'N/A')}, ${escapeHtml(normalizedData.site?.state || 'N/A')}</div>
        </div>
        <div class="cover-meta-item">
          <div class="cover-meta-label">Status</div>
          <div class="cover-meta-value">${escapeHtml(normalizedData.assessment.status)}</div>
        </div>
        <div class="cover-meta-item">
          <div class="cover-meta-label">Report Date</div>
          <div class="cover-meta-value">${generatedDate}</div>
        </div>
      </div>
    </section>

    <!-- Executive Summary -->
    <section id="executive-summary" class="section">
      <h2 class="section-title">Executive Summary</h2>
      <div class="section-content">
        <p style="color: var(--text-secondary); white-space: pre-wrap;">${escapeHtml(normalizedData.assessment.description || 'This security assessment evaluates the physical security posture of the facility, identifying potential vulnerabilities and risk scenarios. The assessment includes risk analysis, geographic intelligence, and actionable recommendations to enhance the overall security posture.')}</p>
      </div>
    </section>

    <!-- Risk Analysis -->
    <section id="risk-analysis" class="section">
      <h2 class="section-title">Risk Analysis</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${normalizedData.riskSummary.totalScenarios}</div>
          <div class="stat-label">Total Scenarios</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--high-risk);">${normalizedData.riskSummary.highRiskCount}</div>
          <div class="stat-label">High Risk</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--medium-risk);">${normalizedData.riskSummary.mediumRiskCount}</div>
          <div class="stat-label">Medium Risk</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--low-risk);">${normalizedData.riskSummary.lowRiskCount}</div>
          <div class="stat-label">Low Risk</div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Risk Metrics</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Average Inherent Risk</td>
                <td>${normalizedData.riskSummary.averageInherentRisk.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Average Current Risk</td>
                <td>${normalizedData.riskSummary.averageCurrentRisk.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Average Residual Risk</td>
                <td>${normalizedData.riskSummary.averageResidualRisk.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      ${
        normalizedData.riskSummary.topThreats.length > 0
          ? `
      <div class="card">
        <h3 class="card-title">Top Risk Scenarios</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Likelihood</th>
                <th>Impact</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              ${normalizedData.riskSummary.topThreats
                .slice(0, 10)
                .map(
                  (threat) => `
                <tr>
                  <td>${escapeHtml(threat.scenario)}</td>
                  <td>${escapeHtml(threat.likelihood)}</td>
                  <td>${escapeHtml(threat.impact)}</td>
                  <td><strong>${threat.riskScore.toFixed(2)}</strong></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
      `
          : ''
      }
    </section>

    ${renderTemplateMetrics(normalizedData.templateId, normalizedData.templateMetrics)}

    ${
      normalizedData.geoIntel?.riskIntelligence
        ? `
    <!-- GeoIntel -->
    <section id="geointel" class="section">
      <h2 class="section-title">Geographic Intelligence</h2>
      
      <div class="card">
        <h3 class="card-title">Overall Risk Level: ${escapeHtml(normalizedData.geoIntel.riskIntelligence.overallRiskLevel)}</h3>
        
        ${
          normalizedData.geoIntel.riskIntelligence.keyInsights.length > 0
            ? `
        <h4 class="section-subtitle">Key Insights</h4>
        <ul class="insight-list">
          ${normalizedData.geoIntel.riskIntelligence.keyInsights
            .map(
              (insight) => `
            <li class="insight-item">${escapeHtml(insight)}</li>
          `
            )
            .join('')}
        </ul>
        `
            : ''
        }
        
        ${
          normalizedData.geoIntel.riskIntelligence.recommendedControls.length > 0
            ? `
        <h4 class="section-subtitle">Recommended Controls</h4>
        <ul class="insight-list">
          ${normalizedData.geoIntel.riskIntelligence.recommendedControls
            .map(
              (control) => `
            <li class="insight-item">${escapeHtml(control)}</li>
          `
            )
            .join('')}
        </ul>
        `
            : ''
        }
      </div>
    </section>
    `
        : ''
    }

    ${
      normalizedData.recommendations.length > 0
        ? `
    <!-- Recommendations -->
    <section id="recommendations" class="section">
      <h2 class="section-title">Recommendations</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Scenario</th>
              <th>Risk</th>
              <th>Timeframe</th>
            </tr>
          </thead>
          <tbody>
            ${normalizedData.recommendations
              .map(
                (rec) => `
              <tr>
                <td><span class="risk-badge priority-${rec.priority}">${escapeHtml(rec.priority.toUpperCase())}</span></td>
                <td>${escapeHtml(rec.scenario)}</td>
                <td>${escapeHtml(rec.risk)}</td>
                <td>${escapeHtml(rec.timeframe)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
    `
        : ''
    }

    ${
      normalizedData.photoEvidence.length > 0
        ? `
    <!-- Photo Evidence -->
    <section id="photos" class="section">
      <h2 class="section-title">Photo Evidence</h2>
      <p style="color: var(--text-secondary); margin-bottom: 2rem;">Total Photos: ${normalizedData.photoEvidence.length}</p>
      
      <div class="photo-grid">
        ${normalizedData.photoEvidence
          .map(
            (photo) => `
          <div class="photo-card">
            <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.caption)}" class="photo-img" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%231a1a1a%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23737373%22 font-family=%22sans-serif%22%3EImage Not Available%3C/text%3E%3C/svg%3E'" />
            <div class="photo-caption">
              <div class="photo-title">${escapeHtml(photo.caption)}</div>
              <div class="photo-section">Section: ${escapeHtml(photo.section)}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>
    `
        : ''
    }
  </div>

  <script>
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Add print functionality
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });
  </script>
</body>
</html>`;

  return html;
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper function to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Render template-specific metrics sections
function renderTemplateMetrics(templateId: string | null, metrics: Record<string, any>): string {
  if (!templateId || !metrics || Object.keys(metrics).length === 0) {
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

// Warehouse metrics: Cargo Theft ROI
function renderWarehouseMetrics(metrics: Record<string, any>): string {
  const roi = metrics.cargoTheftROI;
  const heatmap = metrics.loadingDockHeatmap;
  
  if (!roi) return '';
  
  return `
    <section id="template-metrics" class="section">
      <h2 class="section-title">Financial Impact Analysis</h2>
      
      <div class="card">
        <h3 class="card-title">Cargo Theft ROI Calculator</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(roi.estimatedAnnualLoss || 0)}</div>
            <div class="stat-label">Estimated Annual Loss</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(roi.preventionInvestment || 0)}</div>
            <div class="stat-label">Prevention Investment</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(roi.potentialSavings || 0)}</div>
            <div class="stat-label">Potential Savings</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${((roi.roi || 0) * 100).toFixed(0)}%</div>
            <div class="stat-label">ROI</div>
          </div>
        </div>
      </div>
      
      ${heatmap ? `
      <div class="card">
        <h3 class="card-title">Loading Dock Security Heatmap</h3>
        <div class="table-container">
          <table>
            <tbody>
              <tr>
                <td>Total Loading Docks</td>
                <td><strong>${heatmap.totalDocks || 0}</strong></td>
              </tr>
              <tr>
                <td>Daily Truck Volume</td>
                <td><strong>${heatmap.dailyTruckVolume || 0}</strong></td>
              </tr>
              <tr>
                <td>High-Risk Docks</td>
                <td><strong style="color: var(--high-risk);">${heatmap.highRiskDocks || 0}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        ${heatmap.recommendations?.length > 0 ? `
        <h4 class="section-subtitle">Recommendations</h4>
        <ul class="insight-list">
          ${heatmap.recommendations.map((rec: string) => `<li class="insight-item">${escapeHtml(rec)}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
      ` : ''}
    </section>
  `;
}

// Retail metrics: Shrinkage Analysis
function renderRetailMetrics(metrics: Record<string, any>): string {
  const shrinkage = metrics.shrinkageAnalysis;
  const roi = metrics.lossPreventionROI;
  
  if (!shrinkage) return '';
  
  return `
    <section id="template-metrics" class="section">
      <h2 class="section-title">Loss Prevention Analysis</h2>
      
      <div class="card">
        <h3 class="card-title">Shrinkage Analysis</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(shrinkage.shrinkageDollars || 0)}</div>
            <div class="stat-label">Annual Shrinkage</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${(shrinkage.shrinkageRate || 0).toFixed(2)}%</div>
            <div class="stat-label">Shrinkage Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${(shrinkage.industryBenchmark || 0).toFixed(2)}%</div>
            <div class="stat-label">Industry Benchmark</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(shrinkage.excessLoss || 0)}</div>
            <div class="stat-label">Excess Loss</div>
          </div>
        </div>
      </div>
      
      ${roi ? `
      <div class="card">
        <h3 class="card-title">Loss Prevention ROI</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(roi.recommendedInvestment || 0)}</div>
            <div class="stat-label">Recommended Investment</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(roi.potentialRecovery || 0)}</div>
            <div class="stat-label">Potential Recovery</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(roi.netBenefit || 0)}</div>
            <div class="stat-label">Net Benefit</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${((roi.roi || 0) * 100).toFixed(0)}%</div>
            <div class="stat-label">ROI</div>
          </div>
        </div>
      </div>
      ` : ''}
    </section>
  `;
}

// Manufacturing metrics: Downtime Calculator
function renderManufacturingMetrics(metrics: Record<string, any>): string {
  const downtime = metrics.downtimeCostCalculator;
  
  if (!downtime) return '';
  
  return `
    <section id="template-metrics" class="section">
      <h2 class="section-title">Downtime Impact Analysis</h2>
      
      <div class="card">
        <h3 class="card-title">Downtime Cost Calculator</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(downtime.annualProductionValue || 0)}</div>
            <div class="stat-label">Annual Production Value</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(downtime.valuePerHour || 0)}</div>
            <div class="stat-label">Value Per Hour</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${downtime.avgIncidentDowntime || 0}h</div>
            <div class="stat-label">Avg Incident Downtime</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--high-risk);">${formatCurrency(downtime.potentialLossPerIncident || 0)}</div>
            <div class="stat-label">Loss Per Incident</div>
          </div>
        </div>
        ${downtime.mitigationRecommendations?.length > 0 ? `
        <h4 class="section-subtitle">Mitigation Recommendations</h4>
        <ul class="insight-list">
          ${downtime.mitigationRecommendations.map((rec: string) => `<li class="insight-item">${escapeHtml(rec)}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
    </section>
  `;
}

// Executive Protection metrics: Exposure Factor
function renderExecutiveProtectionMetrics(metrics: Record<string, any>): string {
  const exposure = metrics.exposureFactor;
  const radar = metrics.threatRadar;
  
  if (!exposure) return '';
  
  return `
    <section id="template-metrics" class="section">
      <h2 class="section-title">Threat Intelligence Analysis</h2>
      
      <div class="card">
        <h3 class="card-title">Exposure Factor</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value" style="color: ${exposure.level === 'High' ? 'var(--high-risk)' : exposure.level === 'Medium' ? 'var(--medium-risk)' : 'var(--low-risk)'};">
              ${(exposure.score || 0).toFixed(0)}
            </div>
            <div class="stat-label">Exposure Score (${exposure.level || 'Low'})</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${exposure.kidnappingRisks || 0}</div>
            <div class="stat-label">Kidnapping Risks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${exposure.stalkingRisks || 0}</div>
            <div class="stat-label">Stalking Risks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${exposure.digitalExposureRisks || 0}</div>
            <div class="stat-label">Digital Exposure Risks</div>
          </div>
        </div>
      </div>
      
      ${radar ? `
      <div class="card">
        <h3 class="card-title">Threat Radar</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              ${radar.categories?.map((cat: any) => `
                <tr>
                  <td>${escapeHtml(cat.name)}</td>
                  <td><strong>${cat.count}</strong></td>
                  <td><span class="badge badge-${cat.severity}">${escapeHtml(cat.severity)}</span></td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}
    </section>
  `;
}

// Data Center metrics: SLA Gap Analysis
function renderDataCenterMetrics(metrics: Record<string, any>): string {
  const sla = metrics.slaGapAnalysis;
  
  if (!sla) return '';
  
  return `
    <section id="template-metrics" class="section">
      <h2 class="section-title">SLA & Compliance Analysis</h2>
      
      <div class="card">
        <h3 class="card-title">SLA Gap Analysis</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${(sla.uptimeTarget || 0).toFixed(2)}%</div>
            <div class="stat-label">Uptime Target</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${(sla.allowedDowntimeHours || 0).toFixed(2)}h</div>
            <div class="stat-label">Allowed Downtime/Year</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${sla.slaBreachRisks || 0}</div>
            <div class="stat-label">SLA Breach Risks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--high-risk);">${formatCurrency(sla.potentialPenaltyPerHour || 0)}</div>
            <div class="stat-label">Penalty Per Hour</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Office Building metrics: Safety Score
function renderOfficeMetrics(metrics: Record<string, any>): string {
  const safety = metrics.safetyScore;
  
  if (!safety) return '';
  
  const gradeColor = safety.grade === 'A' ? 'var(--success)' : 
                     safety.grade === 'B' ? 'var(--low-risk)' :
                     safety.grade === 'C' ? 'var(--medium-risk)' : 'var(--high-risk)';
  
  return `
    <section id="template-metrics" class="section">
      <h2 class="section-title">Workplace Safety Analysis</h2>
      
      <div class="card">
        <h3 class="card-title">Safety Score</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value" style="color: ${gradeColor};">${safety.overall || 0}</div>
            <div class="stat-label">Overall Score (Grade: ${safety.grade || 'F'})</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${escapeHtml(safety.violencePreparedness || 'N/A')}</div>
            <div class="stat-label">Violence Preparedness</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${escapeHtml(safety.dataSecurityPosture || 'N/A')}</div>
            <div class="stat-label">Data Security Posture</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${escapeHtml(safety.employeeCount || 'N/A')}</div>
            <div class="stat-label">Employee Count</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Export HTML report and open in new tab with download option
export async function exportHTMLReport(data: ComprehensiveReportData, assessmentTitle: string) {
  const html = await generateHTMLReport(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new tab for immediate viewing
  const newWindow = window.open(url, '_blank');
  
  if (!newWindow) {
    // If popup was blocked, fall back to download only
    console.warn('Popup blocked - downloading HTML report instead');
  }
  
  // Also trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${assessmentTitle.replace(/[^a-z0-9]/gi, '_')}_Report_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup after a delay to ensure download completes
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  
  return { success: true, window: newWindow };
}
