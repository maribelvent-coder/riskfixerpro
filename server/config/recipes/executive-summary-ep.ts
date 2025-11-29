import { ReportRecipe } from '../../types/report-recipe';

export const executiveSummaryRecipe: ReportRecipe = {
  id: 'executive-summary-ep-v1',
  name: 'Executive Protection Summary',
  description: 'Strategic, story-driven executive summary for executive protection assessments',
  reportType: 'executive-summary',
  assessmentTypes: ['executive-protection'],
  toneSetting: 'executive',
  sections: [
    {
      id: 'cover',
      title: 'Cover Page',
      order: 1,
      required: true,
      pageBreakBefore: false,
      contentType: 'mixed',
      requiredData: ['principalName', 'assessmentDate', 'consultantName'],
      optionalData: ['principalTitle', 'organizationName']
    },
    {
      id: 'the-assessment',
      title: 'The Assessment',
      order: 2,
      required: true,
      pageBreakBefore: true,
      contentType: 'narrative',
      narrativePromptId: 'assessment-intro',
      requiredData: ['methodology', 'dataSources', 'siteWalkDates'],
      maxWords: 150,
      minWords: 80
    },
    {
      id: 'risk-landscape',
      title: 'The Risk Landscape',
      order: 3,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      narrativePromptId: 'risk-landscape',
      requiredData: ['principalProfile', 'threatDomains', 'documentedIncidents'],
      optionalData: ['activistGroups', 'laborTensions', 'industryContext'],
      maxWords: 800,
      minWords: 400
    },
    {
      id: 'vulnerability-reality',
      title: 'The Vulnerability Reality',
      order: 4,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      narrativePromptId: 'vulnerability-reality',
      requiredData: ['siteWalkFindings', 'interviewFindings'],
      optionalData: ['accessControlGaps', 'travelPatterns'],
      maxWords: 600,
      minWords: 300
    },
    {
      id: 'geographic-intelligence',
      title: 'Geographic Intelligence',
      order: 5,
      required: false,
      pageBreakBefore: false,
      contentType: 'mixed',
      narrativePromptId: 'geographic-summary',
      requiredData: ['capIndexData'],
      displayCondition: { field: 'capIndexData', operator: 'exists' },
      maxWords: 200
    },
    {
      id: 'mathematical-reality',
      title: 'The Mathematical Reality',
      order: 6,
      required: true,
      pageBreakBefore: false,
      contentType: 'mixed',
      narrativePromptId: 'risk-calculation-explanation',
      requiredData: ['threatScore', 'vulnerabilityScore', 'impactScore', 'overallRiskScore'],
      maxWords: 400
    },
    {
      id: 'path-forward',
      title: 'The Path Forward',
      order: 7,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      narrativePromptId: 'recommendations-narrative',
      requiredData: ['prioritizedRecommendations'],
      maxWords: 500
    },
    {
      id: 'bottom-line',
      title: 'The Bottom Line',
      order: 8,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      narrativePromptId: 'conclusion',
      requiredData: ['keyFindings', 'topPriorities'],
      maxWords: 300
    },
    {
      id: 'about',
      title: 'About RiskFixer',
      order: 9,
      required: true,
      pageBreakBefore: false,
      contentType: 'narrative',
      requiredData: [],
      maxWords: 100
    }
  ],
  branding: {
    primaryColor: '#1a365d',
    secondaryColor: '#2d3748',
    fontFamily: 'Arial, sans-serif'
  },
  pageLayout: {
    pageSize: 'Letter',
    margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
  }
};
