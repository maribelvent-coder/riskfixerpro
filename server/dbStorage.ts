import { db } from "./db";
import { eq, and, gt, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { IStorage } from "./storage";
import type {
  Organization,
  InsertOrganization,
  User,
  InsertUser,
  PasswordResetToken,
  InsertPasswordResetToken,
  Site,
  InsertSite,
  Assessment,
  InsertAssessment,
  TemplateQuestion,
  FacilitySurveyQuestion,
  InsertFacilitySurveyQuestion,
  ExecutiveInterviewQuestion,
  ExecutiveInterviewResponse,
  InsertExecutiveInterviewResponse,
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
  // Organization methods
  async getOrganization(id: string): Promise<Organization | undefined> {
    const results = await db.select().from(schema.organizations).where(eq(schema.organizations.id, id));
    return results[0];
  }

  async getOrganizationByOwnerId(ownerId: string): Promise<Organization | undefined> {
    const results = await db.select().from(schema.organizations).where(eq(schema.organizations.ownerId, ownerId));
    return results[0];
  }

  async createOrganization(insertOrganization: InsertOrganization): Promise<Organization> {
    const results = await db.insert(schema.organizations).values(insertOrganization).returning();
    return results[0];
  }

  async updateOrganization(id: string, partialOrganization: Partial<Organization>): Promise<Organization | undefined> {
    const results = await db.update(schema.organizations)
      .set(partialOrganization)
      .where(eq(schema.organizations.id, id))
      .returning();
    return results[0];
  }

  async getOrganizationMembers(organizationId: string): Promise<User[]> {
    const results = await db.select().from(schema.users)
      .where(eq(schema.users.organizationId, organizationId));
    return results;
  }

  async addUserToOrganization(userId: string, organizationId: string, role: string): Promise<void> {
    await db.update(schema.users)
      .set({ organizationId, organizationRole: role })
      .where(eq(schema.users.id, userId));
  }

  async removeUserFromOrganization(userId: string): Promise<void> {
    await db.update(schema.users)
      .set({ organizationId: null, organizationRole: 'member' })
      .where(eq(schema.users.id, userId));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(schema.users).values(insertUser).returning();
    return results[0];
  }

  async getAllUsers(): Promise<User[]> {
    const results = await db.select().from(schema.users);
    return results;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.id, userId));
  }

  async updateUserEmail(userId: string, email: string): Promise<void> {
    await db.update(schema.users)
      .set({ email })
      .where(eq(schema.users.id, userId));
  }

  async updateUserAccountTier(userId: string, accountTier: string): Promise<void> {
    await db.update(schema.users)
      .set({ accountTier })
      .where(eq(schema.users.id, userId));
  }

  // Password reset token methods
  async createPasswordResetToken(insertToken: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const results = await db.insert(schema.passwordResetTokens).values(insertToken).returning();
    return results[0];
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const results = await db.select().from(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.token, token));
    return results[0];
  }

  async getValidPasswordResetTokens(): Promise<PasswordResetToken[]> {
    const results = await db.select().from(schema.passwordResetTokens)
      .where(and(
        eq(schema.passwordResetTokens.used, false),
        gt(schema.passwordResetTokens.expiresAt, new Date())
      ));
    return results;
  }

  async markPasswordResetTokenAsUsed(tokenId: string): Promise<void> {
    await db.update(schema.passwordResetTokens)
      .set({ used: true })
      .where(eq(schema.passwordResetTokens.id, tokenId));
  }

  async invalidateUserPasswordResetTokens(userId: string): Promise<void> {
    await db.update(schema.passwordResetTokens)
      .set({ used: true })
      .where(and(
        eq(schema.passwordResetTokens.userId, userId),
        eq(schema.passwordResetTokens.used, false)
      ));
  }

  // Site methods
  async getSite(id: string): Promise<Site | undefined> {
    const results = await db.select().from(schema.sites).where(eq(schema.sites.id, id));
    return results[0];
  }

  async getAllSites(userId: string): Promise<Site[]> {
    const results = await db.select().from(schema.sites)
      .where(eq(schema.sites.userId, userId));
    return results;
  }

  async getOrganizationSites(organizationId: string): Promise<Site[]> {
    // Get all users in the organization first
    const orgMembers = await this.getOrganizationMembers(organizationId);
    const memberIds = orgMembers.map(m => m.id);
    
    if (memberIds.length === 0) {
      return [];
    }
    
    // Get sites for all organization members
    const results = await db.select().from(schema.sites)
      .where(
        memberIds.length === 1
          ? eq(schema.sites.userId, memberIds[0])
          : sql`${schema.sites.userId} = ANY(${memberIds})`
      );
    return results;
  }

  async getSitesByUserId(userId: string): Promise<Site[]> {
    const results = await db.select().from(schema.sites)
      .where(eq(schema.sites.userId, userId));
    return results;
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const results = await db.insert(schema.sites).values(insertSite).returning();
    return results[0];
  }

  async updateSite(id: string, updateData: Partial<Site>): Promise<Site | undefined> {
    const results = await db.update(schema.sites)
      .set(updateData)
      .where(eq(schema.sites.id, id))
      .returning();
    return results[0];
  }

  async deleteSite(id: string): Promise<boolean> {
    const results = await db.delete(schema.sites)
      .where(eq(schema.sites.id, id))
      .returning();
    return results.length > 0;
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
  // Template Questions methods
  async getTemplateQuestions(templateId: string): Promise<TemplateQuestion[]> {
    return await db.select().from(schema.templateQuestions)
      .where(eq(schema.templateQuestions.templateId, templateId))
      .orderBy(schema.templateQuestions.orderIndex);
  }

  // Executive Interview methods
  async getAllExecutiveInterviewQuestions(): Promise<ExecutiveInterviewQuestion[]> {
    return await db.select().from(schema.executiveInterviewQuestions)
      .orderBy(schema.executiveInterviewQuestions.orderIndex);
  }

  async getExecutiveInterviewResponses(assessmentId: string): Promise<ExecutiveInterviewResponse[]> {
    return await db.select().from(schema.executiveInterviewResponses)
      .where(eq(schema.executiveInterviewResponses.assessmentId, assessmentId));
  }

  async upsertExecutiveInterviewResponse(response: InsertExecutiveInterviewResponse): Promise<ExecutiveInterviewResponse> {
    const results = await db.insert(schema.executiveInterviewResponses)
      .values({
        ...response,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [schema.executiveInterviewResponses.assessmentId, schema.executiveInterviewResponses.questionId],
        set: {
          yesNoResponse: response.yesNoResponse,
          textResponse: response.textResponse,
          updatedAt: new Date()
        }
      })
      .returning();
    return results[0];
  }

  // Facility Survey methods
  async getFacilitySurveyQuestions(assessmentId: string): Promise<FacilitySurveyQuestion[]> {
    return await db.select().from(schema.facilitySurveyQuestions)
      .where(eq(schema.facilitySurveyQuestions.assessmentId, assessmentId));
  }

  async getFacilitySurveyQuestion(questionId: string): Promise<FacilitySurveyQuestion | null> {
    const results = await db.select().from(schema.facilitySurveyQuestions)
      .where(eq(schema.facilitySurveyQuestions.id, questionId));
    return results[0] || null;
  }

  async createFacilitySurveyQuestion(question: InsertFacilitySurveyQuestion): Promise<FacilitySurveyQuestion> {
    const results = await db.insert(schema.facilitySurveyQuestions).values(question).returning();
    return results[0];
  }

  async bulkCreateFacilityQuestions(questions: InsertFacilitySurveyQuestion[]): Promise<FacilitySurveyQuestion[]> {
    if (questions.length === 0) return [];
    const results = await db.insert(schema.facilitySurveyQuestions).values(questions).returning();
    return results;
  }

  async updateFacilitySurveyQuestion(questionId: string, data: Partial<FacilitySurveyQuestion>): Promise<FacilitySurveyQuestion | null> {
    const results = await db.update(schema.facilitySurveyQuestions)
      .set(data)
      .where(eq(schema.facilitySurveyQuestions.id, questionId))
      .returning();
    return results[0] || null;
  }

  async bulkUpsertFacilityQuestions(assessmentId: string, questions: InsertFacilitySurveyQuestion[]): Promise<FacilitySurveyQuestion[]> {
    // Delete existing and insert new
    await db.delete(schema.facilitySurveyQuestions)
      .where(eq(schema.facilitySurveyQuestions.assessmentId, assessmentId));
    
    if (questions.length === 0) return [];
    
    const results = await db.insert(schema.facilitySurveyQuestions).values(questions).returning();
    return results;
  }

  async appendFacilityQuestionEvidence(questionId: string, evidencePath: string): Promise<FacilitySurveyQuestion | null> {
    const results = await db.update(schema.facilitySurveyQuestions)
      .set({
        evidence: sql`array_append(COALESCE(evidence, ARRAY[]::text[]), ${evidencePath})`
      })
      .where(eq(schema.facilitySurveyQuestions.id, questionId))
      .returning();
    return results[0] || null;
  }

  // Assessment Questions methods
  async getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
    return await db.select().from(schema.assessmentQuestions)
      .where(eq(schema.assessmentQuestions.assessmentId, assessmentId));
  }

  async getAssessmentQuestion(questionId: string): Promise<AssessmentQuestion | null> {
    const results = await db.select().from(schema.assessmentQuestions)
      .where(eq(schema.assessmentQuestions.id, questionId));
    return results[0] || null;
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

  async appendAssessmentQuestionEvidence(questionId: string, evidencePath: string): Promise<AssessmentQuestion | null> {
    const results = await db.update(schema.assessmentQuestions)
      .set({
        evidence: sql`array_append(COALESCE(evidence, ARRAY[]::text[]), ${evidencePath})`
      })
      .where(eq(schema.assessmentQuestions.id, questionId))
      .returning();
    return results[0] || null;
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
