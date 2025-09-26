import { 
  type User, 
  type InsertUser,
  type Assessment,
  type InsertAssessment,
  type AssessmentQuestion,
  type InsertAssessmentQuestion,
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

  // Assessment Questions methods
  getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]>;
  createAssessmentQuestion(question: InsertAssessmentQuestion): Promise<AssessmentQuestion>;
  updateAssessmentQuestion(id: string, question: Partial<AssessmentQuestion>): Promise<AssessmentQuestion | undefined>;
  bulkUpsertQuestions(assessmentId: string, questions: InsertAssessmentQuestion[]): Promise<AssessmentQuestion[]>;

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
  private assessmentQuestions: Map<string, AssessmentQuestion>;
  private riskInsights: Map<string, RiskInsight>;
  private reports: Map<string, Report>;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.assessmentQuestions = new Map();
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

    const questions = Array.from(this.assessmentQuestions.values())
      .filter(q => q.assessmentId === id);
    const riskInsights = Array.from(this.riskInsights.values())
      .filter(r => r.assessmentId === id);
    const reports = Array.from(this.reports.values())
      .filter(r => r.assessmentId === id);

    return {
      ...assessment,
      questions,
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
      completedAt: null
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
      createdAt: new Date()
    };
    this.riskInsights.set(id, insight);
    return insight;
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
