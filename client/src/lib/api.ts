import type { 
  Assessment, 
  InsertAssessment, 
  AssessmentWithQuestions,
  AssessmentQuestion,
  RiskAsset,
  InsertRiskAsset,
  RiskScenario,
  InsertRiskScenario,
  TreatmentPlan,
  InsertTreatmentPlan,
  RiskInsight,
  Report,
  InsertReport
} from "@shared/schema";

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`/api${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Assessment API functions
export const assessmentApi = {
  getAll: (): Promise<Assessment[]> => 
    apiRequest('/assessments'),

  getById: (id: string): Promise<AssessmentWithQuestions> => 
    apiRequest(`/assessments/${id}`),

  create: (data: InsertAssessment): Promise<Assessment> => 
    apiRequest('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Assessment>): Promise<Assessment> => 
    apiRequest(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => 
    apiRequest(`/assessments/${id}`, {
      method: 'DELETE',
    }),

  saveQuestions: (id: string, questions: any[]): Promise<AssessmentQuestion[]> => 
    apiRequest(`/assessments/${id}/questions/bulk`, {
      method: 'POST',
      body: JSON.stringify({ questions }),
    }),

  analyze: (id: string): Promise<{
    overallRiskScore: number;
    riskLevel: string;
    insights: RiskInsight[];
    executiveSummary: string;
  }> => 
    apiRequest(`/assessments/${id}/analyze`, {
      method: 'POST',
    }),

  getInsights: (id: string): Promise<RiskInsight[]> => 
    apiRequest(`/assessments/${id}/insights`),

  getReports: (id: string): Promise<Report[]> => 
    apiRequest(`/assessments/${id}/reports`),

  generateReport: (id: string, data: {
    type: string;
    title: string;
    format: string;
  }): Promise<Report> => 
    apiRequest(`/assessments/${id}/reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Asset Bridge - Extract assets from facility survey for Phase 2
  extractAssets: (id: string): Promise<{
    message: string;
    extractedCount: number;
    assets: RiskAsset[];
  }> => 
    apiRequest(`/assessments/${id}/extract-assets`, {
      method: 'POST',
    }),
};

// Risk Assets API functions
export const riskAssetApi = {
  getAll: (assessmentId: string): Promise<RiskAsset[]> => 
    apiRequest(`/assessments/${assessmentId}/risk-assets`),

  create: (data: InsertRiskAsset): Promise<RiskAsset> => 
    apiRequest(`/assessments/${data.assessmentId}/risk-assets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => 
    apiRequest(`/risk-assets/${id}`, {
      method: 'DELETE',
    }),

  bulkUpsert: (assessmentId: string, assets: InsertRiskAsset[]): Promise<RiskAsset[]> => 
    apiRequest(`/assessments/${assessmentId}/risk-assets/bulk`, {
      method: 'POST',
      body: JSON.stringify({ assets }),
    }),
};

// Risk Scenarios API functions  
export const riskScenarioApi = {
  getAll: (assessmentId: string): Promise<RiskScenario[]> => 
    apiRequest(`/assessments/${assessmentId}/risk-scenarios`),

  create: (data: InsertRiskScenario): Promise<RiskScenario> => 
    apiRequest(`/assessments/${data.assessmentId}/risk-scenarios`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<RiskScenario>): Promise<RiskScenario> => 
    apiRequest(`/risk-scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => 
    apiRequest(`/risk-scenarios/${id}`, {
      method: 'DELETE',
    }),

  bulkUpsert: (assessmentId: string, scenarios: InsertRiskScenario[]): Promise<RiskScenario[]> => 
    apiRequest(`/assessments/${assessmentId}/risk-scenarios/bulk`, {
      method: 'POST',
      body: JSON.stringify({ scenarios }),
    }),
};

// Treatment Plans API functions
export const treatmentPlanApi = {
  getAll: (assessmentId: string): Promise<TreatmentPlan[]> => 
    apiRequest(`/assessments/${assessmentId}/treatment-plans`),

  create: (data: InsertTreatmentPlan): Promise<TreatmentPlan> => 
    apiRequest(`/assessments/${data.assessmentId}/treatment-plans`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<TreatmentPlan>): Promise<TreatmentPlan> => 
    apiRequest(`/treatment-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => 
    apiRequest(`/treatment-plans/${id}`, {
      method: 'DELETE',
    }),

  bulkUpsert: (assessmentId: string, plans: InsertTreatmentPlan[]): Promise<TreatmentPlan[]> => 
    apiRequest(`/assessments/${assessmentId}/treatment-plans/bulk`, {
      method: 'POST',  
      body: JSON.stringify({ plans }),
    }),
};

// Dashboard API functions
export const dashboardApi = {
  getStats: (): Promise<{
    totalAssessments: number;
    activeAssessments: number;
    completedThisMonth: number;
    averageRiskScore: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  }> => apiRequest('/dashboard/stats'),
};

// Report API functions
export const reportApi = {
  download: (id: string): Promise<{
    id: string;
    title: string;
    format: string;
    downloadUrl: string;
    message: string;
  }> => apiRequest(`/reports/${id}/download`),
};