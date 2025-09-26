import type { 
  Assessment, 
  InsertAssessment, 
  AssessmentWithQuestions,
  AssessmentQuestion,
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