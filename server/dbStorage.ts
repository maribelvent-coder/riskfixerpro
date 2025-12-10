import { db } from "./db";
import { eq, and, gt, sql, desc, asc } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { IStorage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import type {
  Organization,
  InsertOrganization,
  OrganizationInvitation,
  InsertOrganizationInvitation,
  User,
  InsertUser,
  PasswordResetToken,
  InsertPasswordResetToken,
  Site,
  InsertSite,
  FacilityZone,
  InsertFacilityZone,
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
  AssessmentWithQuestions,
  ThreatLibrary,
  ControlLibrary,
  PointOfInterest,
  InsertPointOfInterest,
  CrimeSource,
  InsertCrimeSource,
  CrimeObservation,
  InsertCrimeObservation,
  SiteIncident,
  InsertSiteIncident,
  LoadingDock,
  InsertLoadingDock,
  ExecutiveProfile,
  InsertExecutiveProfile
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

  async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(schema.organizations);
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

  async deleteOrganization(id: string): Promise<boolean> {
    const results = await db.delete(schema.organizations)
      .where(eq(schema.organizations.id, id))
      .returning();
    return results.length > 0;
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

  // Organization Invitation methods
  async createInvitation(invitation: InsertOrganizationInvitation): Promise<OrganizationInvitation> {
    const results = await db.insert(schema.organizationInvitations).values(invitation).returning();
    return results[0];
  }

  async getInvitation(id: string): Promise<OrganizationInvitation | undefined> {
    const results = await db.select().from(schema.organizationInvitations)
      .where(eq(schema.organizationInvitations.id, id));
    return results[0];
  }

  async getInvitationByToken(token: string): Promise<OrganizationInvitation | undefined> {
    const results = await db.select().from(schema.organizationInvitations)
      .where(eq(schema.organizationInvitations.token, token));
    return results[0];
  }

  async listOrganizationInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
    return await db.select().from(schema.organizationInvitations)
      .where(eq(schema.organizationInvitations.organizationId, organizationId));
  }

  async updateInvitation(id: string, updates: Partial<OrganizationInvitation>): Promise<OrganizationInvitation | undefined> {
    const results = await db.update(schema.organizationInvitations)
      .set(updates)
      .where(eq(schema.organizationInvitations.id, id))
      .returning();
    return results[0];
  }

  async deleteInvitation(id: string): Promise<boolean> {
    const results = await db.delete(schema.organizationInvitations)
      .where(eq(schema.organizationInvitations.id, id))
      .returning();
    return results.length > 0;
  }

  async acceptInvitation(token: string, userId: string): Promise<void> {
    // Get the invitation by token
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Update the user with organization info
    await db.update(schema.users)
      .set({ 
        organizationId: invitation.organizationId, 
        organizationRole: invitation.role 
      })
      .where(eq(schema.users.id, userId));

    // Update the invitation status
    await db.update(schema.organizationInvitations)
      .set({ 
        status: 'accepted', 
        acceptedAt: new Date() 
      })
      .where(eq(schema.organizationInvitations.token, token));
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

  async deleteUser(userId: string): Promise<boolean> {
    const results = await db.delete(schema.users).where(eq(schema.users.id, userId)).returning();
    return results.length > 0;
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

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    await db.update(schema.users)
      .set({ isAdmin })
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

  // Facility Zone methods
  async getFacilityZone(id: string): Promise<FacilityZone | undefined> {
    const results = await db.select().from(schema.facilityZones).where(eq(schema.facilityZones.id, id));
    return results[0];
  }

  async getFacilityZonesBySite(siteId: string): Promise<FacilityZone[]> {
    return await db.select().from(schema.facilityZones).where(eq(schema.facilityZones.siteId, siteId));
  }

  async createFacilityZone(zone: InsertFacilityZone): Promise<FacilityZone> {
    const results = await db.insert(schema.facilityZones).values(zone).returning();
    return results[0];
  }

  async updateFacilityZone(id: string, zone: Partial<FacilityZone>): Promise<FacilityZone | undefined> {
    const results = await db.update(schema.facilityZones)
      .set(zone)
      .where(eq(schema.facilityZones.id, id))
      .returning();
    return results[0];
  }

  async deleteFacilityZone(id: string): Promise<boolean> {
    const results = await db.delete(schema.facilityZones)
      .where(eq(schema.facilityZones.id, id))
      .returning();
    return results.length > 0;
  }

  // Loading Dock methods (Warehouse Framework v2.0)
  async getLoadingDock(id: string): Promise<LoadingDock | undefined> {
    const results = await db.select().from(schema.loadingDocks).where(eq(schema.loadingDocks.id, id));
    return results[0];
  }

  async getLoadingDocksByAssessment(assessmentId: string): Promise<LoadingDock[]> {
    return await db.select().from(schema.loadingDocks).where(eq(schema.loadingDocks.assessmentId, assessmentId));
  }

  async createLoadingDock(dock: InsertLoadingDock): Promise<LoadingDock> {
    const results = await db.insert(schema.loadingDocks).values(dock).returning();
    return results[0];
  }

  async updateLoadingDock(id: string, updateData: Partial<LoadingDock>): Promise<LoadingDock | undefined> {
    const results = await db.update(schema.loadingDocks)
      .set(updateData)
      .where(eq(schema.loadingDocks.id, id))
      .returning();
    return results[0];
  }

  async deleteLoadingDock(id: string): Promise<boolean> {
    const results = await db.delete(schema.loadingDocks)
      .where(eq(schema.loadingDocks.id, id))
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
    console.log('[dbStorage.updateAssessment] id:', id);
    console.log('[dbStorage.updateAssessment] updateData keys:', Object.keys(updateData));
    console.log('[dbStorage.updateAssessment] updateData:', JSON.stringify(updateData, null, 2));
    
    const results = await db
      .update(schema.assessments)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.assessments.id, id))
      .returning();
    
    console.log('[dbStorage.updateAssessment] result officeProfile:', results[0]?.officeProfile);
    return results[0];
  }

  async deleteAssessment(id: string): Promise<boolean> {
    const objectStorage = new ObjectStorageService();
    
    try {
      console.log(`[deleteAssessment] Starting deletion for assessment ${id}`);
      
      // Step 1: Collect evidence file paths (will delete AFTER successful database deletion)
      console.log(`[deleteAssessment] Collecting evidence files...`);
      const facilityQuestions = await db.select()
        .from(schema.facilitySurveyQuestions)
        .where(eq(schema.facilitySurveyQuestions.assessmentId, id));
      
      const assessmentQuestions = await db.select()
        .from(schema.assessmentQuestions)
        .where(eq(schema.assessmentQuestions.assessmentId, id));
      
      const allEvidencePaths: string[] = [];
      facilityQuestions.forEach(q => {
        if (q.evidence && Array.isArray(q.evidence)) {
          allEvidencePaths.push(...q.evidence);
        }
      });
      assessmentQuestions.forEach(q => {
        if (q.evidence && Array.isArray(q.evidence)) {
          allEvidencePaths.push(...q.evidence);
        }
      });
      
      console.log(`[deleteAssessment] Found ${allEvidencePaths.length} evidence files to delete after database deletion`);
      
      // Step 2: Delete all related database records
      // Order: controls → treatmentPlans → riskInsights → identifiedThreats → vulnerabilities → riskScenarios → riskAssets → remaining tables
      // Note: Neon HTTP driver doesn't support transactions, so we execute sequentially
      console.log(`[deleteAssessment] Starting database cascade deletion...`);
      
      console.log(`[deleteAssessment] Deleting controls...`);
      await db.delete(schema.controls)
        .where(eq(schema.controls.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting treatmentPlans...`);
      await db.delete(schema.treatmentPlans)
        .where(eq(schema.treatmentPlans.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting riskInsights...`);
      await db.delete(schema.riskInsights)
        .where(eq(schema.riskInsights.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting identifiedThreats...`);
      await db.delete(schema.identifiedThreats)
        .where(eq(schema.identifiedThreats.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting vulnerabilities...`);
      await db.delete(schema.vulnerabilities)
        .where(eq(schema.vulnerabilities.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting riskScenarios...`);
      await db.delete(schema.riskScenarios)
        .where(eq(schema.riskScenarios.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting riskAssets...`);
      await db.delete(schema.riskAssets)
        .where(eq(schema.riskAssets.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting reports...`);
      await db.delete(schema.reports)
        .where(eq(schema.reports.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting facilitySurveyQuestions...`);
      await db.delete(schema.facilitySurveyQuestions)
        .where(eq(schema.facilitySurveyQuestions.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting assessmentQuestions...`);
      await db.delete(schema.assessmentQuestions)
        .where(eq(schema.assessmentQuestions.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting executiveInterviewResponses...`);
      await db.delete(schema.executiveInterviewResponses)
        .where(eq(schema.executiveInterviewResponses.assessmentId, id));
      
      console.log(`[deleteAssessment] Deleting assessment...`);
      const results = await db.delete(schema.assessments)
        .where(eq(schema.assessments.id, id))
        .returning();
      
      if (results.length === 0) {
        throw new Error(`Assessment ${id} not found`);
      }
      
      console.log(`[deleteAssessment] Database deletion successful`);
      
      // Step 3: Delete evidence files AFTER successful database deletion (ignore errors for missing files)
      console.log(`[deleteAssessment] Deleting ${allEvidencePaths.length} evidence files from storage...`);
      for (const evidencePath of allEvidencePaths) {
        try {
          await objectStorage.deleteEvidence(evidencePath);
          console.log(`[deleteAssessment] Deleted evidence: ${evidencePath}`);
        } catch (error) {
          if (error instanceof ObjectNotFoundError) {
            console.log(`[deleteAssessment] Evidence file not found (already deleted): ${evidencePath}`);
          } else {
            console.error(`[deleteAssessment] Error deleting evidence ${evidencePath}:`, error);
          }
        }
      }
      
      console.log(`[deleteAssessment] Successfully completed deletion for assessment ${id}`);
      return true;
    } catch (error) {
      console.error(`[deleteAssessment] Failed to delete assessment ${id}:`, error);
      throw error;
    }
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
  async getFacilitySurveyQuestions(assessmentId: string): Promise<any[]> {
    // Simple query - no JOIN needed, all data is in facility_survey_questions
    const results = await db
      .select()
      .from(schema.facilitySurveyQuestions)
      .where(eq(schema.facilitySurveyQuestions.assessmentId, assessmentId))
      .orderBy(schema.facilitySurveyQuestions.orderIndex, schema.facilitySurveyQuestions.templateQuestionId);
    
    return results;
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
    // Order by orderIndex first (matches template seeding), then category/subcategory as tie-breakers
    // Use NULLS LAST to handle any records with null orderIndex
    return await db.select().from(schema.assessmentQuestions)
      .where(eq(schema.assessmentQuestions.assessmentId, assessmentId))
      .orderBy(
        asc(schema.assessmentQuestions.orderIndex),
        asc(schema.assessmentQuestions.category),
        asc(schema.assessmentQuestions.subcategory),
        asc(schema.assessmentQuestions.id)
      );
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

  async bulkCreateAssessmentQuestions(questions: InsertAssessmentQuestion[]): Promise<AssessmentQuestion[]> {
    if (questions.length === 0) return [];
    const results = await db.insert(schema.assessmentQuestions).values(questions).returning();
    return results;
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

  // Threat Library methods
  async getThreatLibrary(): Promise<ThreatLibrary[]> {
    return await db.select().from(schema.threatLibrary).where(eq(schema.threatLibrary.active, true));
  }

  async getThreatLibraryByCategory(category: string): Promise<ThreatLibrary[]> {
    return await db.select().from(schema.threatLibrary)
      .where(and(eq(schema.threatLibrary.category, category), eq(schema.threatLibrary.active, true)));
  }

  async getThreatLibraryItem(id: string): Promise<ThreatLibrary | undefined> {
    const results = await db.select().from(schema.threatLibrary)
      .where(and(eq(schema.threatLibrary.id, id), eq(schema.threatLibrary.active, true)));
    return results[0];
  }

  // Control Library methods
  async getControlLibrary(): Promise<ControlLibrary[]> {
    return await db.select().from(schema.controlLibrary).where(eq(schema.controlLibrary.active, true));
  }

  async getControlLibraryByCategory(category: string): Promise<ControlLibrary[]> {
    return await db.select().from(schema.controlLibrary)
      .where(and(eq(schema.controlLibrary.category, category), eq(schema.controlLibrary.active, true)));
  }

  async getControlLibraryItem(id: string): Promise<ControlLibrary | undefined> {
    const results = await db.select().from(schema.controlLibrary)
      .where(and(eq(schema.controlLibrary.id, id), eq(schema.controlLibrary.active, true)));
    return results[0];
  }
  
  // Risk Calculation methods
  async getSurveyResponsesWithControlWeights(assessmentId: string, threatId: string): Promise<{answer: any, controlWeight: number}[]> {
    // Query: Get survey responses with their linked control weights for a specific threat
    // This joins facility_survey_questions → template_questions → question_threat_map → control_library
    const results = await db
      .select({
        answer: schema.facilitySurveyQuestions.response,
        controlWeight: schema.controlLibrary.weight,
      })
      .from(schema.facilitySurveyQuestions)
      .innerJoin(
        schema.templateQuestions,
        eq(schema.facilitySurveyQuestions.templateQuestionId, schema.templateQuestions.id)
      )
      .innerJoin(
        schema.questionThreatMap,
        eq(schema.templateQuestions.id, schema.questionThreatMap.questionId)
      )
      .innerJoin(
        schema.controlLibrary,
        eq(schema.templateQuestions.controlLibraryId, schema.controlLibrary.id)
      )
      .where(
        and(
          eq(schema.facilitySurveyQuestions.assessmentId, assessmentId),
          eq(schema.questionThreatMap.threatId, threatId)
        )
      );
    
    return results.map(row => ({
      answer: row.answer,
      controlWeight: row.controlWeight || 0,
    }));
  }

  // Geographic Intelligence - Points of Interest methods
  async getPointsOfInterest(siteId?: string, assessmentId?: string): Promise<PointOfInterest[]> {
    const conditions = [];
    
    if (siteId !== undefined) {
      conditions.push(eq(schema.pointsOfInterest.siteId, siteId));
    }
    
    if (assessmentId !== undefined) {
      conditions.push(eq(schema.pointsOfInterest.assessmentId, assessmentId));
    }
    
    if (conditions.length === 0) {
      return await db.select().from(schema.pointsOfInterest);
    }
    
    if (conditions.length === 1) {
      return await db.select().from(schema.pointsOfInterest).where(conditions[0]);
    }
    
    return await db.select().from(schema.pointsOfInterest).where(and(...conditions));
  }

  async getPointOfInterest(id: string): Promise<PointOfInterest | undefined> {
    const results = await db.select().from(schema.pointsOfInterest)
      .where(eq(schema.pointsOfInterest.id, id));
    return results[0];
  }

  async createPointOfInterest(poi: InsertPointOfInterest): Promise<PointOfInterest> {
    const results = await db.insert(schema.pointsOfInterest).values(poi).returning();
    return results[0];
  }

  async updatePointOfInterest(id: string, poi: Partial<PointOfInterest>): Promise<PointOfInterest | undefined> {
    const results = await db.update(schema.pointsOfInterest)
      .set({ ...poi, updatedAt: new Date() })
      .where(eq(schema.pointsOfInterest.id, id))
      .returning();
    return results[0];
  }

  async deletePointOfInterest(id: string): Promise<boolean> {
    const results = await db.update(schema.pointsOfInterest)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.pointsOfInterest.id, id))
      .returning();
    return results.length > 0;
  }

  // Geographic Intelligence - Crime Data methods
  async getCrimeSource(id: string): Promise<CrimeSource | undefined> {
    const results = await db.select().from(schema.crimeSources)
      .where(eq(schema.crimeSources.id, id));
    return results[0];
  }

  async getCrimeSources(siteId?: string, assessmentId?: string): Promise<CrimeSource[]> {
    const conditions = [];
    
    if (siteId !== undefined) {
      conditions.push(eq(schema.crimeSources.siteId, siteId));
    }
    
    if (assessmentId !== undefined) {
      conditions.push(eq(schema.crimeSources.assessmentId, assessmentId));
    }
    
    if (conditions.length === 0) {
      return await db.select().from(schema.crimeSources);
    }
    
    if (conditions.length === 1) {
      return await db.select().from(schema.crimeSources).where(conditions[0]);
    }
    
    return await db.select().from(schema.crimeSources).where(and(...conditions));
  }

  async createCrimeSource(source: InsertCrimeSource): Promise<CrimeSource> {
    const results = await db.insert(schema.crimeSources).values(source).returning();
    return results[0];
  }

  async deleteCrimeSource(id: string): Promise<boolean> {
    const results = await db.delete(schema.crimeSources)
      .where(eq(schema.crimeSources.id, id))
      .returning();
    return results.length > 0;
  }

  async getCrimeObservation(id: string): Promise<CrimeObservation | undefined> {
    const results = await db.select().from(schema.crimeObservations)
      .where(eq(schema.crimeObservations.id, id));
    return results[0];
  }

  async getCrimeObservationsBySource(crimeSourceId: string): Promise<CrimeObservation[]> {
    return await db.select().from(schema.crimeObservations)
      .where(eq(schema.crimeObservations.crimeSourceId, crimeSourceId));
  }

  async createCrimeObservation(observation: InsertCrimeObservation): Promise<CrimeObservation> {
    const results = await db.insert(schema.crimeObservations).values(observation).returning();
    return results[0];
  }

  // Site Incidents methods
  async getSiteIncidents(siteId: string): Promise<SiteIncident[]> {
    return await db.select().from(schema.siteIncidents)
      .where(eq(schema.siteIncidents.siteId, siteId))
      .orderBy(desc(schema.siteIncidents.incidentDate));
  }

  async getSiteIncident(id: string): Promise<SiteIncident | undefined> {
    const results = await db.select().from(schema.siteIncidents)
      .where(eq(schema.siteIncidents.id, id));
    return results[0];
  }

  async createSiteIncident(incident: InsertSiteIncident): Promise<SiteIncident> {
    const results = await db.insert(schema.siteIncidents).values(incident).returning();
    return results[0];
  }

  async bulkCreateSiteIncidents(incidents: InsertSiteIncident[]): Promise<SiteIncident[]> {
    if (incidents.length === 0) return [];
    return await db.insert(schema.siteIncidents).values(incidents).returning();
  }

  async deleteSiteIncident(id: string): Promise<boolean> {
    const results = await db.delete(schema.siteIncidents)
      .where(eq(schema.siteIncidents.id, id))
      .returning();
    return results.length > 0;
  }

  // Executive Profile methods
  async getExecutiveProfile(id: string): Promise<ExecutiveProfile | undefined> {
    const results = await db.select().from(schema.executiveProfiles)
      .where(eq(schema.executiveProfiles.id, id));
    return results[0];
  }

  async getExecutiveProfileByAssessment(assessmentId: string): Promise<ExecutiveProfile | undefined> {
    const results = await db.select().from(schema.executiveProfiles)
      .where(eq(schema.executiveProfiles.assessmentId, assessmentId));
    return results[0];
  }

  async createExecutiveProfile(profile: InsertExecutiveProfile): Promise<ExecutiveProfile> {
    const results = await db.insert(schema.executiveProfiles).values(profile).returning();
    return results[0];
  }

  async updateExecutiveProfile(id: string, updateData: Partial<ExecutiveProfile>): Promise<ExecutiveProfile | undefined> {
    const results = await db.update(schema.executiveProfiles)
      .set(updateData)
      .where(eq(schema.executiveProfiles.id, id))
      .returning();
    return results[0];
  }

  async deleteExecutiveProfile(id: string): Promise<boolean> {
    const results = await db.delete(schema.executiveProfiles)
      .where(eq(schema.executiveProfiles.id, id))
      .returning();
    return results.length > 0;
  }
}
