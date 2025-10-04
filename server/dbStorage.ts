import { db } from "./db";
import { eq, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  Assessment,
  InsertAssessment,
  FacilitySurveyQuestion,
  InsertFacilitySurveyQuestion,
  AssessmentQuestion,
  InsertAssessmentQuestion,
  IdentifiedThreat,
  InsertIdentifiedThreat,
  RiskAsset,
  InsertRiskAsset,
  RiskScenario,
  InsertRiskScenario,
  Vulnerability,
  InsertVulnerability,
  Control,
  InsertControl,
  TreatmentPlan,
  InsertTreatmentPlan,
  RiskInsight,
  InsertRiskInsight,
  Report,
  InsertReport,
  AssessmentWithQuestions
} from "@shared/schema";

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(schema.users).values(insertUser).returning();
    return results[0];
  }

  // Assessment methods
  async getAssessment(id: string): Promise<Assessment | undefined> {
    const results = await db.select().from(schema.assessments).where(eq(schema.assessments.id, id));
    return results[0];
  }

  async getAssessmentWithQuestions(id: string): Promise<AssessmentWithQuestions | undefined> {
    const assessment = await this.getAssessment(id);
    if (!assessment) return undefined;

    const [facilityQuestions, questions, threats, riskAssets, riskScenarios, treatmentPlans, riskInsights, reports] = await Promise.all([
      this.getFacilitySurveyQuestions(id),
      this.getAssessmentQuestions(id),
      this.getIdentifiedThreats(id),
      this.getRiskAssets(id),
      this.getRiskScenarios(id),
      this.getTreatmentPlans(id),
      this.getRiskInsights(id),
      this.getReports(id),
    ]);

    return {
      ...assessment,
      facilityQuestions,
      questions,
      threats,
      riskAssets,
      riskScenarios,
      treatmentPlans,
      riskInsights,
      reports
    };
  }

  async getAllAssessments(userId?: string): Promise<Assessment[]> {
    try {
      if (userId) {
        const results = await db.select().from(schema.assessments)
          .where(eq(schema.assessments.userId, userId));
        console.log('getAllAssessments query results:', results.length, 'assessments for user', userId);
        return results;
      }
      const results = await db.select().from(schema.assessments);
      console.log('getAllAssessments query results:', results.length, 'assessments');
      return results;
    } catch (error) {
      console.error('Error in getAllAssessments:', error);
      throw error;
    }
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const results = await db.insert(schema.assessments).values(insertAssessment).returning();
    return results[0];
  }

  async updateAssessment(id: string, updateData: Partial<Assessment>): Promise<Assessment | undefined> {
    const results = await db
      .update(schema.assessments)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.assessments.id, id))
      .returning();
    return results[0];
  }

  async deleteAssessment(id: string): Promise<boolean> {
    const results = await db.delete(schema.assessments).where(eq(schema.assessments.id, id)).returning();
    return results.length > 0;
  }

  // Facility Survey methods
  async getFacilitySurveyQuestions(assessmentId: string): Promise<FacilitySurveyQuestion[]> {
    return await db.select().from(schema.facilitySurveyQuestions)
      .where(eq(schema.facilitySurveyQuestions.assessmentId, assessmentId));
  }

  async createFacilitySurveyQuestion(question: InsertFacilitySurveyQuestion): Promise<FacilitySurveyQuestion> {
    const results = await db.insert(schema.facilitySurveyQuestions).values(question).returning();
    return results[0];
  }

  async bulkUpsertFacilityQuestions(assessmentId: string, questions: InsertFacilitySurveyQuestion[]): Promise<FacilitySurveyQuestion[]> {
    // Delete existing and insert new
    await db.delete(schema.facilitySurveyQuestions)
      .where(eq(schema.facilitySurveyQuestions.assessmentId, assessmentId));
    
    if (questions.length === 0) return [];
    
    const results = await db.insert(schema.facilitySurveyQuestions).values(questions).returning();
    return results;
  }

  // Assessment Questions methods
  async getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
    return await db.select().from(schema.assessmentQuestions)
      .where(eq(schema.assessmentQuestions.assessmentId, assessmentId));
  }

  async createAssessmentQuestion(question: InsertAssessmentQuestion): Promise<AssessmentQuestion> {
    const results = await db.insert(schema.assessmentQuestions).values(question).returning();
    return results[0];
  }

  async updateAssessmentQuestion(id: string, updateData: Partial<AssessmentQuestion>): Promise<AssessmentQuestion | undefined> {
    const results = await db
      .update(schema.assessmentQuestions)
      .set(updateData)
      .where(eq(schema.assessmentQuestions.id, id))
      .returning();
    return results[0];
  }

  async bulkUpsertQuestions(assessmentId: string, questions: InsertAssessmentQuestion[]): Promise<AssessmentQuestion[]> {
    await db.delete(schema.assessmentQuestions)
      .where(eq(schema.assessmentQuestions.assessmentId, assessmentId));
    
    if (questions.length === 0) return [];
    
    const results = await db.insert(schema.assessmentQuestions).values(questions).returning();
    return results;
  }

  // Threat Identification methods
  async getIdentifiedThreats(assessmentId: string): Promise<IdentifiedThreat[]> {
    return await db.select().from(schema.identifiedThreats)
      .where(eq(schema.identifiedThreats.assessmentId, assessmentId));
  }

  async createIdentifiedThreat(threat: InsertIdentifiedThreat): Promise<IdentifiedThreat> {
    const results = await db.insert(schema.identifiedThreats).values(threat).returning();
    return results[0];
  }

  async bulkCreateIdentifiedThreats(threats: InsertIdentifiedThreat[]): Promise<IdentifiedThreat[]> {
    if (threats.length === 0) return [];
    const results = await db.insert(schema.identifiedThreats).values(threats).returning();
    return results;
  }

  // Risk Assets methods
  async getRiskAsset(id: string): Promise<RiskAsset | undefined> {
    const results = await db.select().from(schema.riskAssets).where(eq(schema.riskAssets.id, id));
    return results[0];
  }

  async getRiskAssets(assessmentId: string): Promise<RiskAsset[]> {
    return await db.select().from(schema.riskAssets)
      .where(eq(schema.riskAssets.assessmentId, assessmentId));
  }

  async createRiskAsset(asset: InsertRiskAsset): Promise<RiskAsset> {
    const results = await db.insert(schema.riskAssets).values(asset).returning();
    return results[0];
  }

  async deleteRiskAsset(id: string): Promise<boolean> {
    const results = await db.delete(schema.riskAssets).where(eq(schema.riskAssets.id, id)).returning();
    return results.length > 0;
  }

  async bulkCreateRiskAssets(assets: InsertRiskAsset[]): Promise<RiskAsset[]> {
    if (assets.length === 0) return [];
    const results = await db.insert(schema.riskAssets).values(assets).returning();
    return results;
  }

  async bulkUpsertRiskAssets(assessmentId: string, assets: InsertRiskAsset[]): Promise<RiskAsset[]> {
    await db.delete(schema.riskAssets).where(eq(schema.riskAssets.assessmentId, assessmentId));
    if (assets.length === 0) return [];
    const results = await db.insert(schema.riskAssets).values(assets).returning();
    return results;
  }

  // Risk Scenarios methods
  async getRiskScenario(id: string): Promise<RiskScenario | undefined> {
    const results = await db.select().from(schema.riskScenarios).where(eq(schema.riskScenarios.id, id));
    return results[0];
  }

  async getRiskScenarios(assessmentId: string): Promise<RiskScenario[]> {
    return await db.select().from(schema.riskScenarios)
      .where(eq(schema.riskScenarios.assessmentId, assessmentId));
  }

  async createRiskScenario(scenario: InsertRiskScenario): Promise<RiskScenario> {
    const results = await db.insert(schema.riskScenarios).values(scenario).returning();
    return results[0];
  }

  async updateRiskScenario(id: string, updateData: Partial<RiskScenario>): Promise<RiskScenario | undefined> {
    const results = await db
      .update(schema.riskScenarios)
      .set(updateData)
      .where(eq(schema.riskScenarios.id, id))
      .returning();
    return results[0];
  }

  async deleteRiskScenario(id: string): Promise<boolean> {
    const results = await db.delete(schema.riskScenarios).where(eq(schema.riskScenarios.id, id)).returning();
    return results.length > 0;
  }

  async bulkUpsertRiskScenarios(assessmentId: string, scenarios: InsertRiskScenario[]): Promise<RiskScenario[]> {
    await db.delete(schema.riskScenarios).where(eq(schema.riskScenarios.assessmentId, assessmentId));
    if (scenarios.length === 0) return [];
    const results = await db.insert(schema.riskScenarios).values(scenarios).returning();
    return results;
  }

  // Vulnerabilities methods
  async getVulnerability(id: string): Promise<Vulnerability | undefined> {
    const results = await db.select().from(schema.vulnerabilities).where(eq(schema.vulnerabilities.id, id));
    return results[0];
  }

  async getVulnerabilities(assessmentId: string): Promise<Vulnerability[]> {
    return await db.select().from(schema.vulnerabilities)
      .where(eq(schema.vulnerabilities.assessmentId, assessmentId));
  }

  async createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability> {
    const results = await db.insert(schema.vulnerabilities).values(vulnerability).returning();
    return results[0];
  }

  async updateVulnerability(id: string, updateData: Partial<Vulnerability>): Promise<Vulnerability | undefined> {
    const results = await db
      .update(schema.vulnerabilities)
      .set(updateData)
      .where(eq(schema.vulnerabilities.id, id))
      .returning();
    return results[0];
  }

  async deleteVulnerability(id: string): Promise<boolean> {
    const results = await db.delete(schema.vulnerabilities).where(eq(schema.vulnerabilities.id, id)).returning();
    return results.length > 0;
  }

  // Controls methods
  async getControl(id: string): Promise<Control | undefined> {
    const results = await db.select().from(schema.controls).where(eq(schema.controls.id, id));
    return results[0];
  }

  async getControls(assessmentId: string): Promise<Control[]> {
    return await db.select().from(schema.controls)
      .where(eq(schema.controls.assessmentId, assessmentId));
  }

  async createControl(control: InsertControl): Promise<Control> {
    const results = await db.insert(schema.controls).values(control).returning();
    return results[0];
  }

  async updateControl(id: string, updateData: Partial<Control>): Promise<Control | undefined> {
    const results = await db
      .update(schema.controls)
      .set(updateData)
      .where(eq(schema.controls.id, id))
      .returning();
    return results[0];
  }

  async deleteControl(id: string): Promise<boolean> {
    const results = await db.delete(schema.controls).where(eq(schema.controls.id, id)).returning();
    return results.length > 0;
  }

  // Treatment Plans methods
  async getTreatmentPlan(id: string): Promise<TreatmentPlan | undefined> {
    const results = await db.select().from(schema.treatmentPlans).where(eq(schema.treatmentPlans.id, id));
    return results[0];
  }

  async getTreatmentPlans(assessmentId: string): Promise<TreatmentPlan[]> {
    return await db.select().from(schema.treatmentPlans)
      .where(eq(schema.treatmentPlans.assessmentId, assessmentId));
  }

  async createTreatmentPlan(plan: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const results = await db.insert(schema.treatmentPlans).values(plan).returning();
    return results[0];
  }

  async updateTreatmentPlan(id: string, updateData: Partial<TreatmentPlan>): Promise<TreatmentPlan | undefined> {
    const results = await db
      .update(schema.treatmentPlans)
      .set(updateData)
      .where(eq(schema.treatmentPlans.id, id))
      .returning();
    return results[0];
  }

  async deleteTreatmentPlan(id: string): Promise<boolean> {
    const results = await db.delete(schema.treatmentPlans).where(eq(schema.treatmentPlans.id, id)).returning();
    return results.length > 0;
  }

  async bulkUpsertTreatmentPlans(assessmentId: string, plans: InsertTreatmentPlan[]): Promise<TreatmentPlan[]> {
    await db.delete(schema.treatmentPlans).where(eq(schema.treatmentPlans.assessmentId, assessmentId));
    if (plans.length === 0) return [];
    const results = await db.insert(schema.treatmentPlans).values(plans).returning();
    return results;
  }

  // Risk Insights methods
  async getRiskInsights(assessmentId: string): Promise<RiskInsight[]> {
    return await db.select().from(schema.riskInsights)
      .where(eq(schema.riskInsights.assessmentId, assessmentId));
  }

  async createRiskInsight(insight: InsertRiskInsight): Promise<RiskInsight> {
    const results = await db.insert(schema.riskInsights).values(insight).returning();
    return results[0];
  }

  async bulkCreateRiskInsights(insights: InsertRiskInsight[]): Promise<RiskInsight[]> {
    if (insights.length === 0) return [];
    const results = await db.insert(schema.riskInsights).values(insights).returning();
    return results;
  }

  // Reports methods
  async getReports(assessmentId: string): Promise<Report[]> {
    return await db.select().from(schema.reports)
      .where(eq(schema.reports.assessmentId, assessmentId));
  }

  async getReport(id: string): Promise<Report | undefined> {
    const results = await db.select().from(schema.reports).where(eq(schema.reports.id, id));
    return results[0];
  }

  async createReport(report: InsertReport): Promise<Report> {
    const results = await db.insert(schema.reports).values(report).returning();
    return results[0];
  }

  async updateReport(id: string, updateData: Partial<Report>): Promise<Report | undefined> {
    const results = await db
      .update(schema.reports)
      .set(updateData)
      .where(eq(schema.reports.id, id))
      .returning();
    return results[0];
  }
}
