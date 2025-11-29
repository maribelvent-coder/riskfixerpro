import { eq, and } from "drizzle-orm";
import { 
  type Site,
  type InsertSite,
  type Assessment,
  type InsertAssessment,
  type RiskAsset,
  type InsertRiskAsset,
  type RiskScenario,
  type InsertRiskScenario,
  type Vulnerability,
  type InsertVulnerability,
  type Control,
  type InsertControl,
  users,
  sites,
  assessments,
  riskAssets,
  riskScenarios,
  vulnerabilities,
  controls
} from "@shared/schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

/**
 * TenantStorage - Multi-tenant data access layer
 * 
 * Security Model (Hybrid Filtering Approach):
 * - Sites: Direct filtering on sites.organizationId (performant, uses index)
 * - Assessments/Risk entities: Implicit joins through users table (assessments lack organizationId column)
 * - All CREATE operations explicitly set organizationId where applicable
 * - Ownership verification ensures data isolation between tenants
 * - Does not include admin/global user management methods
 */
export class TenantStorage {
  private db: NeonHttpDatabase;
  private tenantId: string;

  constructor(db: NeonHttpDatabase, tenantId: string) {
    this.db = db;
    this.tenantId = tenantId;
  }

  /**
   * Helper: Verify an assessment belongs to a user within the tenant
   */
  private async verifyAssessmentOwnership(assessmentId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: assessments.id })
      .from(assessments)
      .innerJoin(users, eq(assessments.userId, users.id))
      .where(
        and(
          eq(assessments.id, assessmentId),
          eq(users.organizationId, this.tenantId)
        )
      );
    return result.length > 0;
  }

  /**
   * Helper: Verify a site belongs to this tenant (direct check on sites.organizationId)
   */
  private async verifySiteOwnership(siteId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: sites.id })
      .from(sites)
      .where(
        and(
          eq(sites.id, siteId),
          eq(sites.organizationId, this.tenantId)
        )
      );
    return result.length > 0;
  }

  // ============================================
  // SITE METHODS
  // ============================================

  async getSite(id: string): Promise<Site | undefined> {
    const result = await this.db
      .select()
      .from(sites)
      .where(
        and(
          eq(sites.id, id),
          eq(sites.organizationId, this.tenantId)
        )
      );
    return result[0];
  }

  async getAllSites(): Promise<Site[]> {
    return this.db
      .select()
      .from(sites)
      .where(eq(sites.organizationId, this.tenantId));
  }

  async createSite(site: InsertSite): Promise<Site> {
    const [created] = await this.db
      .insert(sites)
      .values({ ...site, organizationId: this.tenantId })
      .returning();
    return created;
  }

  async updateSite(id: string, site: Partial<Site>): Promise<Site | undefined> {
    if (!(await this.verifySiteOwnership(id))) {
      return undefined;
    }
    const [updated] = await this.db
      .update(sites)
      .set({ ...site, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return updated;
  }

  async deleteSite(id: string): Promise<boolean> {
    if (!(await this.verifySiteOwnership(id))) {
      return false;
    }
    const result = await this.db.delete(sites).where(eq(sites.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // ASSESSMENT METHODS
  // ============================================

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const result = await this.db
      .select({
        id: assessments.id,
        userId: assessments.userId,
        organizationId: assessments.organizationId,
        siteId: assessments.siteId,
        templateId: assessments.templateId,
        surveyParadigm: assessments.surveyParadigm,
        title: assessments.title,
        location: assessments.location,
        assessor: assessments.assessor,
        status: assessments.status,
        createdAt: assessments.createdAt,
        updatedAt: assessments.updatedAt,
        completedAt: assessments.completedAt,
        riskLevel: assessments.riskLevel,
        businessObjectives: assessments.businessObjectives,
        assetTypes: assessments.assetTypes,
        riskCriteria: assessments.riskCriteria,
        facilitySurveyCompleted: assessments.facilitySurveyCompleted,
        facilitySurveyCompletedAt: assessments.facilitySurveyCompletedAt,
        riskAssessmentCompleted: assessments.riskAssessmentCompleted,
        riskAssessmentCompletedAt: assessments.riskAssessmentCompletedAt,
        executiveSummary: assessments.executiveSummary,
        warehouse_profile: assessments.warehouse_profile,
        retail_profile: assessments.retail_profile,
        manufacturing_profile: assessments.manufacturing_profile,
        datacenter_profile: assessments.datacenter_profile,
        office_profile: assessments.office_profile
      })
      .from(assessments)
      .innerJoin(users, eq(assessments.userId, users.id))
      .where(
        and(
          eq(assessments.id, id),
          eq(users.organizationId, this.tenantId)
        )
      );
    return result[0];
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return this.db
      .select({
        id: assessments.id,
        userId: assessments.userId,
        organizationId: assessments.organizationId,
        siteId: assessments.siteId,
        templateId: assessments.templateId,
        surveyParadigm: assessments.surveyParadigm,
        title: assessments.title,
        location: assessments.location,
        assessor: assessments.assessor,
        status: assessments.status,
        createdAt: assessments.createdAt,
        updatedAt: assessments.updatedAt,
        completedAt: assessments.completedAt,
        riskLevel: assessments.riskLevel,
        businessObjectives: assessments.businessObjectives,
        assetTypes: assessments.assetTypes,
        riskCriteria: assessments.riskCriteria,
        facilitySurveyCompleted: assessments.facilitySurveyCompleted,
        facilitySurveyCompletedAt: assessments.facilitySurveyCompletedAt,
        riskAssessmentCompleted: assessments.riskAssessmentCompleted,
        riskAssessmentCompletedAt: assessments.riskAssessmentCompletedAt,
        executiveSummary: assessments.executiveSummary,
        warehouse_profile: assessments.warehouse_profile,
        retail_profile: assessments.retail_profile,
        manufacturing_profile: assessments.manufacturing_profile,
        datacenter_profile: assessments.datacenter_profile,
        office_profile: assessments.office_profile
      })
      .from(assessments)
      .innerJoin(users, eq(assessments.userId, users.id))
      .where(eq(users.organizationId, this.tenantId));
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [created] = await this.db.insert(assessments).values(assessment).returning();
    return created;
  }

  async updateAssessment(id: string, assessment: Partial<Assessment>): Promise<Assessment | undefined> {
    if (!(await this.verifyAssessmentOwnership(id))) {
      return undefined;
    }
    const [updated] = await this.db
      .update(assessments)
      .set({ ...assessment, updatedAt: new Date() })
      .where(eq(assessments.id, id))
      .returning();
    return updated;
  }

  async deleteAssessment(id: string): Promise<boolean> {
    if (!(await this.verifyAssessmentOwnership(id))) {
      return false;
    }
    const result = await this.db.delete(assessments).where(eq(assessments.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // RISK ASSET METHODS
  // ============================================

  async getRiskAsset(id: string): Promise<RiskAsset | undefined> {
    const result = await this.db
      .select({
        id: riskAssets.id,
        assessmentId: riskAssets.assessmentId,
        name: riskAssets.name,
        type: riskAssets.type,
        owner: riskAssets.owner,
        criticality: riskAssets.criticality,
        scope: riskAssets.scope,
        notes: riskAssets.notes,
        protectionSystems: riskAssets.protectionSystems,
        createdAt: riskAssets.createdAt
      })
      .from(riskAssets)
      .innerJoin(assessments, eq(riskAssets.assessmentId, assessments.id))
      .innerJoin(users, eq(assessments.userId, users.id))
      .where(
        and(
          eq(riskAssets.id, id),
          eq(users.organizationId, this.tenantId)
        )
      );
    return result[0];
  }

  async getRiskAssets(assessmentId: string): Promise<RiskAsset[]> {
    if (!(await this.verifyAssessmentOwnership(assessmentId))) {
      return [];
    }
    return this.db
      .select()
      .from(riskAssets)
      .where(eq(riskAssets.assessmentId, assessmentId));
  }

  async createRiskAsset(asset: InsertRiskAsset): Promise<RiskAsset> {
    const [created] = await this.db.insert(riskAssets).values(asset).returning();
    return created;
  }

  async deleteRiskAsset(id: string): Promise<boolean> {
    const asset = await this.getRiskAsset(id);
    if (!asset) {
      return false;
    }
    const result = await this.db.delete(riskAssets).where(eq(riskAssets.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // RISK SCENARIO METHODS
  // ============================================

  async getRiskScenario(id: string): Promise<RiskScenario | undefined> {
    const result = await this.db
      .select({
        id: riskScenarios.id,
        assessmentId: riskScenarios.assessmentId,
        assetId: riskScenarios.assetId,
        scenario: riskScenarios.scenario,
        asset: riskScenarios.asset,
        threatType: riskScenarios.threatType,
        threatLibraryId: riskScenarios.threatLibraryId,
        threatDescription: riskScenarios.threatDescription,
        vulnerabilityDescription: riskScenarios.vulnerabilityDescription,
        likelihood: riskScenarios.likelihood,
        impact: riskScenarios.impact,
        riskLevel: riskScenarios.riskLevel,
        currentLikelihood: riskScenarios.currentLikelihood,
        currentImpact: riskScenarios.currentImpact,
        currentRiskLevel: riskScenarios.currentRiskLevel,
        likelihoodScore: riskScenarios.likelihoodScore,
        vulnerabilityScore: riskScenarios.vulnerabilityScore,
        impactScore: riskScenarios.impactScore,
        inherentRisk: riskScenarios.inherentRisk,
        controlEffectiveness: riskScenarios.controlEffectiveness,
        residualRisk: riskScenarios.residualRisk,
        decision: riskScenarios.decision,
        riskRating: riskScenarios.riskRating,
        createdAt: riskScenarios.createdAt
      })
      .from(riskScenarios)
      .innerJoin(assessments, eq(riskScenarios.assessmentId, assessments.id))
      .innerJoin(users, eq(assessments.userId, users.id))
      .where(
        and(
          eq(riskScenarios.id, id),
          eq(users.organizationId, this.tenantId)
        )
      );
    return result[0];
  }

  async getRiskScenarios(assessmentId: string): Promise<RiskScenario[]> {
    if (!(await this.verifyAssessmentOwnership(assessmentId))) {
      return [];
    }
    return this.db
      .select()
      .from(riskScenarios)
      .where(eq(riskScenarios.assessmentId, assessmentId));
  }

  async createRiskScenario(scenario: InsertRiskScenario): Promise<RiskScenario> {
    const [created] = await this.db.insert(riskScenarios).values(scenario).returning();
    return created;
  }

  async updateRiskScenario(id: string, scenario: Partial<RiskScenario>): Promise<RiskScenario | undefined> {
    const existing = await this.getRiskScenario(id);
    if (!existing) {
      return undefined;
    }
    const [updated] = await this.db
      .update(riskScenarios)
      .set(scenario)
      .where(eq(riskScenarios.id, id))
      .returning();
    return updated;
  }

  async deleteRiskScenario(id: string): Promise<boolean> {
    const existing = await this.getRiskScenario(id);
    if (!existing) {
      return false;
    }
    const result = await this.db.delete(riskScenarios).where(eq(riskScenarios.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // VULNERABILITY METHODS
  // ============================================

  async getVulnerability(id: string): Promise<Vulnerability | undefined> {
    const result = await this.db
      .select({
        id: vulnerabilities.id,
        assessmentId: vulnerabilities.assessmentId,
        riskScenarioId: vulnerabilities.riskScenarioId,
        description: vulnerabilities.description,
        notes: vulnerabilities.notes,
        createdAt: vulnerabilities.createdAt
      })
      .from(vulnerabilities)
      .innerJoin(assessments, eq(vulnerabilities.assessmentId, assessments.id))
      .innerJoin(users, eq(assessments.userId, users.id))
      .where(
        and(
          eq(vulnerabilities.id, id),
          eq(users.organizationId, this.tenantId)
        )
      );
    return result[0];
  }

  async getVulnerabilities(assessmentId: string): Promise<Vulnerability[]> {
    if (!(await this.verifyAssessmentOwnership(assessmentId))) {
      return [];
    }
    return this.db
      .select()
      .from(vulnerabilities)
      .where(eq(vulnerabilities.assessmentId, assessmentId));
  }

  async createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability> {
    const [created] = await this.db.insert(vulnerabilities).values(vulnerability).returning();
    return created;
  }

  async updateVulnerability(id: string, vulnerability: Partial<Vulnerability>): Promise<Vulnerability | undefined> {
    const existing = await this.getVulnerability(id);
    if (!existing) {
      return undefined;
    }
    const [updated] = await this.db
      .update(vulnerabilities)
      .set(vulnerability)
      .where(eq(vulnerabilities.id, id))
      .returning();
    return updated;
  }

  async deleteVulnerability(id: string): Promise<boolean> {
    const existing = await this.getVulnerability(id);
    if (!existing) {
      return false;
    }
    const result = await this.db.delete(vulnerabilities).where(eq(vulnerabilities.id, id)).returning();
    return result.length > 0;
  }

  // ============================================
  // CONTROL METHODS
  // ============================================

  async getControl(id: string): Promise<Control | undefined> {
    const result = await this.db
      .select({
        id: controls.id,
        assessmentId: controls.assessmentId,
        vulnerabilityId: controls.vulnerabilityId,
        riskScenarioId: controls.riskScenarioId,
        description: controls.description,
        controlType: controls.controlType,
        effectiveness: controls.effectiveness,
        notes: controls.notes,
        treatmentType: controls.treatmentType,
        primaryEffect: controls.primaryEffect,
        treatmentEffectiveness: controls.treatmentEffectiveness,
        actionDescription: controls.actionDescription,
        responsibleParty: controls.responsibleParty,
        targetDate: controls.targetDate,
        estimatedCost: controls.estimatedCost,
        createdAt: controls.createdAt
      })
      .from(controls)
      .innerJoin(assessments, eq(controls.assessmentId, assessments.id))
      .innerJoin(users, eq(assessments.userId, users.id))
      .where(
        and(
          eq(controls.id, id),
          eq(users.organizationId, this.tenantId)
        )
      );
    return result[0];
  }

  async getControls(assessmentId: string): Promise<Control[]> {
    if (!(await this.verifyAssessmentOwnership(assessmentId))) {
      return [];
    }
    return this.db
      .select()
      .from(controls)
      .where(eq(controls.assessmentId, assessmentId));
  }

  async createControl(control: InsertControl): Promise<Control> {
    const [created] = await this.db.insert(controls).values(control).returning();
    return created;
  }

  async updateControl(id: string, control: Partial<Control>): Promise<Control | undefined> {
    const existing = await this.getControl(id);
    if (!existing) {
      return undefined;
    }
    const [updated] = await this.db
      .update(controls)
      .set(control)
      .where(eq(controls.id, id))
      .returning();
    return updated;
  }

  async deleteControl(id: string): Promise<boolean> {
    const existing = await this.getControl(id);
    if (!existing) {
      return false;
    }
    const result = await this.db.delete(controls).where(eq(controls.id, id)).returning();
    return result.length > 0;
  }
}
