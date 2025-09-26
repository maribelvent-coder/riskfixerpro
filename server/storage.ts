import { 
  type User, 
  type InsertUser,
  type Assessment,
  type InsertAssessment,
  type FacilitySurveyQuestion,
  type InsertFacilitySurveyQuestion,
  type AssessmentQuestion,
  type InsertAssessmentQuestion,
  type IdentifiedThreat,
  type InsertIdentifiedThreat,
  type RiskInsight,
  type InsertRiskInsight,
  type Report,
  type InsertReport,
  type AssessmentWithQuestions
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Assessment methods
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAssessmentWithQuestions(id: string): Promise<AssessmentWithQuestions | undefined>;
  getAllAssessments(): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<Assessment>): Promise<Assessment | undefined>;
  deleteAssessment(id: string): Promise<boolean>;

  // Facility Survey methods
  getFacilitySurveyQuestions(assessmentId: string): Promise<FacilitySurveyQuestion[]>;
  createFacilitySurveyQuestion(question: InsertFacilitySurveyQuestion): Promise<FacilitySurveyQuestion>;
  bulkUpsertFacilityQuestions(assessmentId: string, questions: InsertFacilitySurveyQuestion[]): Promise<FacilitySurveyQuestion[]>;

  // Assessment Questions methods
  getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]>;
  createAssessmentQuestion(question: InsertAssessmentQuestion): Promise<AssessmentQuestion>;
  updateAssessmentQuestion(id: string, question: Partial<AssessmentQuestion>): Promise<AssessmentQuestion | undefined>;
  bulkUpsertQuestions(assessmentId: string, questions: InsertAssessmentQuestion[]): Promise<AssessmentQuestion[]>;

  // Threat Identification methods
  getIdentifiedThreats(assessmentId: string): Promise<IdentifiedThreat[]>;
  createIdentifiedThreat(threat: InsertIdentifiedThreat): Promise<IdentifiedThreat>;
  bulkCreateIdentifiedThreats(threats: InsertIdentifiedThreat[]): Promise<IdentifiedThreat[]>;

  // Risk Insights methods
  getRiskInsights(assessmentId: string): Promise<RiskInsight[]>;
  createRiskInsight(insight: InsertRiskInsight): Promise<RiskInsight>;
  bulkCreateRiskInsights(insights: InsertRiskInsight[]): Promise<RiskInsight[]>;

  // Reports methods
  getReports(assessmentId: string): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<Report>): Promise<Report | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assessments: Map<string, Assessment>;
  private facilitySurveyQuestions: Map<string, FacilitySurveyQuestion>;
  private assessmentQuestions: Map<string, AssessmentQuestion>;
  private identifiedThreats: Map<string, IdentifiedThreat>;
  private riskInsights: Map<string, RiskInsight>;
  private reports: Map<string, Report>;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.facilitySurveyQuestions = new Map();
    this.assessmentQuestions = new Map();
    this.identifiedThreats = new Map();
    this.riskInsights = new Map();
    this.reports = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Assessment methods
  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentWithQuestions(id: string): Promise<AssessmentWithQuestions | undefined> {
    const assessment = this.assessments.get(id);
    if (!assessment) return undefined;

    const facilityQuestions = Array.from(this.facilitySurveyQuestions.values())
      .filter(q => q.assessmentId === id);
    const questions = Array.from(this.assessmentQuestions.values())
      .filter(q => q.assessmentId === id);
    const threats = Array.from(this.identifiedThreats.values())
      .filter(t => t.assessmentId === id);
    const riskInsights = Array.from(this.riskInsights.values())
      .filter(r => r.assessmentId === id);
    const reports = Array.from(this.reports.values())
      .filter(r => r.assessmentId === id);

    return {
      ...assessment,
      facilityQuestions,
      questions,
      threats,
      riskInsights,
      reports
    };
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values())
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const now = new Date();
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      status: insertAssessment.status || "draft",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      riskLevel: null,
      businessObjectives: null,
      assetTypes: null,
      riskCriteria: null,
      facilitySurveyCompleted: false,
      facilitySurveyCompletedAt: null,
      riskAssessmentCompleted: false,
      riskAssessmentCompletedAt: null
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: string, updateData: Partial<Assessment>): Promise<Assessment | undefined> {
    const assessment = this.assessments.get(id);
    if (!assessment) return undefined;

    const updated: Assessment = {
      ...assessment,
      ...updateData,
      updatedAt: new Date()
    };
    this.assessments.set(id, updated);
    return updated;
  }

  async deleteAssessment(id: string): Promise<boolean> {
    return this.assessments.delete(id);
  }

  // Facility Survey methods
  async getFacilitySurveyQuestions(assessmentId: string): Promise<FacilitySurveyQuestion[]> {
    return Array.from(this.facilitySurveyQuestions.values())
      .filter(q => q.assessmentId === assessmentId);
  }

  async createFacilitySurveyQuestion(insertQuestion: InsertFacilitySurveyQuestion): Promise<FacilitySurveyQuestion> {
    const id = randomUUID();
    const question: FacilitySurveyQuestion = {
      ...insertQuestion,
      id,
      subcategory: insertQuestion.subcategory || null,
      standard: insertQuestion.standard || null,
      notes: insertQuestion.notes || null,
      evidence: insertQuestion.evidence || null,
      recommendations: insertQuestion.recommendations || null,
      createdAt: new Date()
    };
    this.facilitySurveyQuestions.set(id, question);
    return question;
  }

  async bulkUpsertFacilityQuestions(assessmentId: string, questions: InsertFacilitySurveyQuestion[]): Promise<FacilitySurveyQuestion[]> {
    const results: FacilitySurveyQuestion[] = [];
    
    for (const questionData of questions) {
      // Find existing question by assessmentId, category, and subcategory
      const existing = Array.from(this.facilitySurveyQuestions.values())
        .find(q => q.assessmentId === assessmentId && 
                   q.category === questionData.category && 
                   q.subcategory === questionData.subcategory);
      
      if (existing) {
        // Update existing question
        const updated: FacilitySurveyQuestion = {
          ...existing,
          ...questionData
        };
        this.facilitySurveyQuestions.set(existing.id, updated);
        results.push(updated);
      } else {
        const created = await this.createFacilitySurveyQuestion(questionData);
        results.push(created);
      }
    }
    
    return results;
  }

  // Threat Identification methods
  async getIdentifiedThreats(assessmentId: string): Promise<IdentifiedThreat[]> {
    return Array.from(this.identifiedThreats.values())
      .filter(t => t.assessmentId === assessmentId);
  }

  async createIdentifiedThreat(insertThreat: InsertIdentifiedThreat): Promise<IdentifiedThreat> {
    const id = randomUUID();
    const threat: IdentifiedThreat = {
      ...insertThreat,
      id,
      affectedAssets: insertThreat.affectedAssets || null,
      vulnerabilities: insertThreat.vulnerabilities || null,
      createdAt: new Date()
    };
    this.identifiedThreats.set(id, threat);
    return threat;
  }

  async bulkCreateIdentifiedThreats(threats: InsertIdentifiedThreat[]): Promise<IdentifiedThreat[]> {
    const results: IdentifiedThreat[] = [];
    
    for (const insertThreat of threats) {
      const created = await this.createIdentifiedThreat(insertThreat);
      results.push(created);
    }
    
    return results;
  }

  // Assessment Questions methods
  async getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
    return Array.from(this.assessmentQuestions.values())
      .filter(q => q.assessmentId === assessmentId);
  }

  async createAssessmentQuestion(insertQuestion: InsertAssessmentQuestion): Promise<AssessmentQuestion> {
    const id = randomUUID();
    const question: AssessmentQuestion = {
      ...insertQuestion,
      id,
      response: insertQuestion.response || null,
      notes: insertQuestion.notes || null,
      evidence: insertQuestion.evidence || null
    };
    this.assessmentQuestions.set(id, question);
    return question;
  }

  async updateAssessmentQuestion(id: string, updateData: Partial<AssessmentQuestion>): Promise<AssessmentQuestion | undefined> {
    const question = this.assessmentQuestions.get(id);
    if (!question) return undefined;

    const updated: AssessmentQuestion = {
      ...question,
      ...updateData
    };
    this.assessmentQuestions.set(id, updated);
    return updated;
  }

  async bulkUpsertQuestions(assessmentId: string, questions: InsertAssessmentQuestion[]): Promise<AssessmentQuestion[]> {
    const results: AssessmentQuestion[] = [];
    
    for (const questionData of questions) {
      // Find existing question by assessmentId and questionId
      const existing = Array.from(this.assessmentQuestions.values())
        .find(q => q.assessmentId === assessmentId && q.questionId === questionData.questionId);
      
      if (existing) {
        const updated = await this.updateAssessmentQuestion(existing.id, questionData);
        if (updated) results.push(updated);
      } else {
        const created = await this.createAssessmentQuestion(questionData);
        results.push(created);
      }
    }
    
    return results;
  }

  // Risk Insights methods
  async getRiskInsights(assessmentId: string): Promise<RiskInsight[]> {
    return Array.from(this.riskInsights.values())
      .filter(r => r.assessmentId === assessmentId);
  }

  async createRiskInsight(insertInsight: InsertRiskInsight): Promise<RiskInsight> {
    const id = randomUUID();
    const insight: RiskInsight = {
      ...insertInsight,
      id,
      threatId: insertInsight.threatId || null,
      riskScore: insertInsight.impact * insertInsight.probability,
      riskMatrix: this.calculateRiskMatrix(insertInsight.impact, insertInsight.probability),
      treatmentStrategy: insertInsight.treatmentStrategy || null,
      treatmentPlan: insertInsight.treatmentPlan || null,
      priority: insertInsight.priority || null,
      createdAt: new Date()
    };
    this.riskInsights.set(id, insight);
    return insight;
  }

  private calculateRiskMatrix(impact: number, probability: number): string {
    const score = impact * probability;
    if (score >= 70) return "extreme";
    if (score >= 50) return "high";
    if (score >= 30) return "medium";
    return "low";
  }

  async bulkCreateRiskInsights(insights: InsertRiskInsight[]): Promise<RiskInsight[]> {
    const results: RiskInsight[] = [];
    
    for (const insertInsight of insights) {
      const created = await this.createRiskInsight(insertInsight);
      results.push(created);
    }
    
    return results;
  }

  // Reports methods
  async getReports(assessmentId: string): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(r => r.assessmentId === assessmentId);
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = {
      ...insertReport,
      id,
      status: insertReport.status || "pending",
      filePath: insertReport.filePath || null,
      fileSize: insertReport.fileSize || null,
      createdAt: new Date(),
      generatedAt: null
    };
    this.reports.set(id, report);
    return report;
  }

  async updateReport(id: string, updateData: Partial<Report>): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;

    const updated: Report = {
      ...report,
      ...updateData
    };
    this.reports.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
