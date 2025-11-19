import { 
  type User, 
  type InsertUser,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type Site,
  type InsertSite,
  type FacilityZone,
  type InsertFacilityZone,
  type Assessment,
  type InsertAssessment,
  type TemplateQuestion,
  type FacilitySurveyQuestion,
  type InsertFacilitySurveyQuestion,
  type ExecutiveInterviewQuestion,
  type InsertExecutiveInterviewQuestion,
  type ExecutiveInterviewResponse,
  type InsertExecutiveInterviewResponse,
  type AssessmentQuestion,
  type InsertAssessmentQuestion,
  type IdentifiedThreat,
  type InsertIdentifiedThreat,
  type RiskAsset,
  type InsertRiskAsset,
  type RiskScenario,
  type InsertRiskScenario,
  type Vulnerability,
  type InsertVulnerability,
  type Control,
  type InsertControl,
  type TreatmentPlan,
  type InsertTreatmentPlan,
  type RiskInsight,
  type InsertRiskInsight,
  type Report,
  type InsertReport,
  type AssessmentWithQuestions,
  type Organization,
  type InsertOrganization,
  type OrganizationInvitation,
  type InsertOrganizationInvitation,
  type ThreatLibrary,
  type InsertThreatLibrary,
  type ControlLibrary,
  type InsertControlLibrary
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Organization methods
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationByOwnerId(ownerId: string): Promise<Organization | undefined>;
  getAllOrganizations(): Promise<Organization[]>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, organization: Partial<Organization>): Promise<Organization | undefined>;
  deleteOrganization(id: string): Promise<boolean>;
  getOrganizationMembers(organizationId: string): Promise<User[]>;
  addUserToOrganization(userId: string, organizationId: string, role: string): Promise<void>;
  removeUserFromOrganization(userId: string): Promise<void>;

  // Organization Invitation methods
  createInvitation(invitation: InsertOrganizationInvitation): Promise<OrganizationInvitation>;
  getInvitation(id: string): Promise<OrganizationInvitation | undefined>;
  getInvitationByToken(token: string): Promise<OrganizationInvitation | undefined>;
  listOrganizationInvitations(organizationId: string): Promise<OrganizationInvitation[]>;
  updateInvitation(id: string, updates: Partial<OrganizationInvitation>): Promise<OrganizationInvitation | undefined>;
  deleteInvitation(id: string): Promise<boolean>;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  updateUserEmail(userId: string, email: string): Promise<void>;
  updateUserAccountTier(userId: string, accountTier: string): Promise<void>;

  // Password reset token methods
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  getValidPasswordResetTokens(): Promise<PasswordResetToken[]>;
  markPasswordResetTokenAsUsed(tokenId: string): Promise<void>;
  invalidateUserPasswordResetTokens(userId: string): Promise<void>;

  // Site methods
  getSite(id: string): Promise<Site | undefined>;
  getAllSites(userId: string): Promise<Site[]>;
  getOrganizationSites(organizationId: string): Promise<Site[]>;
  getSitesByUserId(userId: string): Promise<Site[]>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: string, site: Partial<Site>): Promise<Site | undefined>;
  deleteSite(id: string): Promise<boolean>;

  // Facility Zone methods
  getFacilityZone(id: string): Promise<FacilityZone | undefined>;
  getFacilityZonesBySite(siteId: string): Promise<FacilityZone[]>;
  createFacilityZone(zone: InsertFacilityZone): Promise<FacilityZone>;
  updateFacilityZone(id: string, zone: Partial<FacilityZone>): Promise<FacilityZone | undefined>;
  deleteFacilityZone(id: string): Promise<boolean>;

  // Assessment methods
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAssessmentWithQuestions(id: string): Promise<AssessmentWithQuestions | undefined>;
  getAllAssessments(userId?: string): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<Assessment>): Promise<Assessment | undefined>;
  deleteAssessment(id: string): Promise<boolean>;

  // Template Questions methods
  getTemplateQuestions(templateId: string): Promise<TemplateQuestion[]>;
  
  // Executive Interview methods
  getAllExecutiveInterviewQuestions(): Promise<ExecutiveInterviewQuestion[]>;
  getExecutiveInterviewResponses(assessmentId: string): Promise<ExecutiveInterviewResponse[]>;
  upsertExecutiveInterviewResponse(response: InsertExecutiveInterviewResponse): Promise<ExecutiveInterviewResponse>;
  
  // Facility Survey methods
  getFacilitySurveyQuestions(assessmentId: string): Promise<FacilitySurveyQuestion[]>;
  getFacilitySurveyQuestion(questionId: string): Promise<FacilitySurveyQuestion | null>;
  createFacilitySurveyQuestion(question: InsertFacilitySurveyQuestion): Promise<FacilitySurveyQuestion>;
  bulkCreateFacilityQuestions(questions: InsertFacilitySurveyQuestion[]): Promise<FacilitySurveyQuestion[]>;
  updateFacilitySurveyQuestion(questionId: string, data: Partial<FacilitySurveyQuestion>): Promise<FacilitySurveyQuestion | null>;
  bulkUpsertFacilityQuestions(assessmentId: string, questions: InsertFacilitySurveyQuestion[]): Promise<FacilitySurveyQuestion[]>;
  appendFacilityQuestionEvidence(questionId: string, evidencePath: string): Promise<FacilitySurveyQuestion | null>;

  // Assessment Questions methods
  getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]>;
  getAssessmentQuestion(questionId: string): Promise<AssessmentQuestion | null>;
  createAssessmentQuestion(question: InsertAssessmentQuestion): Promise<AssessmentQuestion>;
  bulkCreateAssessmentQuestions(questions: InsertAssessmentQuestion[]): Promise<AssessmentQuestion[]>;
  updateAssessmentQuestion(id: string, question: Partial<AssessmentQuestion>): Promise<AssessmentQuestion | undefined>;
  bulkUpsertQuestions(assessmentId: string, questions: InsertAssessmentQuestion[]): Promise<AssessmentQuestion[]>;
  appendAssessmentQuestionEvidence(questionId: string, evidencePath: string): Promise<AssessmentQuestion | null>;

  // Threat Identification methods
  getIdentifiedThreats(assessmentId: string): Promise<IdentifiedThreat[]>;
  createIdentifiedThreat(threat: InsertIdentifiedThreat): Promise<IdentifiedThreat>;
  bulkCreateIdentifiedThreats(threats: InsertIdentifiedThreat[]): Promise<IdentifiedThreat[]>;

  // Risk Assets methods
  getRiskAsset(id: string): Promise<RiskAsset | undefined>;
  getRiskAssets(assessmentId: string): Promise<RiskAsset[]>;
  createRiskAsset(asset: InsertRiskAsset): Promise<RiskAsset>;
  deleteRiskAsset(id: string): Promise<boolean>;
  bulkCreateRiskAssets(assets: InsertRiskAsset[]): Promise<RiskAsset[]>;
  bulkUpsertRiskAssets(assessmentId: string, assets: InsertRiskAsset[]): Promise<RiskAsset[]>;

  // Risk Scenarios methods
  getRiskScenario(id: string): Promise<RiskScenario | undefined>;
  getRiskScenarios(assessmentId: string): Promise<RiskScenario[]>;
  createRiskScenario(scenario: InsertRiskScenario): Promise<RiskScenario>;
  updateRiskScenario(id: string, scenario: Partial<RiskScenario>): Promise<RiskScenario | undefined>;
  deleteRiskScenario(id: string): Promise<boolean>;
  bulkUpsertRiskScenarios(assessmentId: string, scenarios: InsertRiskScenario[]): Promise<RiskScenario[]>;

  // Vulnerabilities methods
  getVulnerability(id: string): Promise<Vulnerability | undefined>;
  getVulnerabilities(assessmentId: string): Promise<Vulnerability[]>;
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  updateVulnerability(id: string, vulnerability: Partial<Vulnerability>): Promise<Vulnerability | undefined>;
  deleteVulnerability(id: string): Promise<boolean>;

  // Controls methods
  getControl(id: string): Promise<Control | undefined>;
  getControls(assessmentId: string): Promise<Control[]>;
  createControl(control: InsertControl): Promise<Control>;
  updateControl(id: string, control: Partial<Control>): Promise<Control | undefined>;
  deleteControl(id: string): Promise<boolean>;

  // Treatment Plans methods
  getTreatmentPlan(id: string): Promise<TreatmentPlan | undefined>;
  getTreatmentPlans(assessmentId: string): Promise<TreatmentPlan[]>;
  createTreatmentPlan(plan: InsertTreatmentPlan): Promise<TreatmentPlan>;
  updateTreatmentPlan(id: string, plan: Partial<TreatmentPlan>): Promise<TreatmentPlan | undefined>;
  deleteTreatmentPlan(id: string): Promise<boolean>;
  bulkUpsertTreatmentPlans(assessmentId: string, plans: InsertTreatmentPlan[]): Promise<TreatmentPlan[]>;

  // Risk Insights methods
  getRiskInsights(assessmentId: string): Promise<RiskInsight[]>;
  createRiskInsight(insight: InsertRiskInsight): Promise<RiskInsight>;
  bulkCreateRiskInsights(insights: InsertRiskInsight[]): Promise<RiskInsight[]>;

  // Reports methods
  getReports(assessmentId: string): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<Report>): Promise<Report | undefined>;

  // Threat Library methods
  getThreatLibrary(): Promise<ThreatLibrary[]>;
  getThreatLibraryByCategory(category: string): Promise<ThreatLibrary[]>;
  getThreatLibraryItem(id: string): Promise<ThreatLibrary | undefined>;

  // Control Library methods
  getControlLibrary(): Promise<ControlLibrary[]>;
  getControlLibraryByCategory(category: string): Promise<ControlLibrary[]>;
  getControlLibraryItem(id: string): Promise<ControlLibrary | undefined>;
}

export class MemStorage implements IStorage {
  private organizations: Map<string, Organization>;
  private users: Map<string, User>;
  private passwordResetTokens: Map<string, PasswordResetToken>;
  private organizationInvitations: Map<string, OrganizationInvitation>;
  private sites: Map<string, Site>;
  private facilityZones: Map<string, FacilityZone>;
  private assessments: Map<string, Assessment>;
  private facilitySurveyQuestions: Map<string, FacilitySurveyQuestion>;
  private assessmentQuestions: Map<string, AssessmentQuestion>;
  private identifiedThreats: Map<string, IdentifiedThreat>;
  private riskAssets: Map<string, RiskAsset>;
  private riskScenarios: Map<string, RiskScenario>;
  private vulnerabilities: Map<string, Vulnerability>;
  private controls: Map<string, Control>;
  private treatmentPlans: Map<string, TreatmentPlan>;
  private riskInsights: Map<string, RiskInsight>;
  private reports: Map<string, Report>;

  constructor() {
    this.organizations = new Map();
    this.users = new Map();
    this.passwordResetTokens = new Map();
    this.organizationInvitations = new Map();
    this.sites = new Map();
    this.facilityZones = new Map();
    this.assessments = new Map();
    this.facilitySurveyQuestions = new Map();
    this.assessmentQuestions = new Map();
    this.identifiedThreats = new Map();
    this.riskAssets = new Map();
    this.riskScenarios = new Map();
    this.vulnerabilities = new Map();
    this.controls = new Map();
    this.treatmentPlans = new Map();
    this.riskInsights = new Map();
    this.reports = new Map();
  }

  // Organization methods
  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async getOrganizationByOwnerId(ownerId: string): Promise<Organization | undefined> {
    return Array.from(this.organizations.values()).find(
      (org) => org.ownerId === ownerId,
    );
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  async createOrganization(insertOrganization: InsertOrganization): Promise<Organization> {
    const id = randomUUID();
    const createdAt = new Date();
    const organization: Organization = {
      id,
      name: insertOrganization.name,
      accountTier: insertOrganization.accountTier || 'basic',
      ownerId: insertOrganization.ownerId,
      maxMembers: insertOrganization.maxMembers || 2,
      maxSites: insertOrganization.maxSites || 2,
      maxAssessments: insertOrganization.maxAssessments || 5,
      createdAt,
    };
    this.organizations.set(id, organization);
    return organization;
  }

  async updateOrganization(id: string, partialOrganization: Partial<Organization>): Promise<Organization | undefined> {
    const organization = this.organizations.get(id);
    if (!organization) return undefined;
    
    const updated = { ...organization, ...partialOrganization };
    this.organizations.set(id, updated);
    return updated;
  }

  async deleteOrganization(id: string): Promise<boolean> {
    return this.organizations.delete(id);
  }

  async getOrganizationMembers(organizationId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.organizationId === organizationId
    );
  }

  async addUserToOrganization(userId: string, organizationId: string, role: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.organizationId = organizationId;
      user.organizationRole = role;
      this.users.set(userId, user);
    }
  }

  async removeUserFromOrganization(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.organizationId = null;
      user.organizationRole = 'member';
      this.users.set(userId, user);
    }
  }

  // Organization Invitation methods
  async createInvitation(insertInvitation: InsertOrganizationInvitation): Promise<OrganizationInvitation> {
    const id = randomUUID();
    const createdAt = new Date();
    const invitation: OrganizationInvitation = {
      ...insertInvitation,
      id,
      createdAt,
      acceptedAt: null,
    };
    this.organizationInvitations.set(id, invitation);
    return invitation;
  }

  async getInvitation(id: string): Promise<OrganizationInvitation | undefined> {
    return this.organizationInvitations.get(id);
  }

  async getInvitationByToken(token: string): Promise<OrganizationInvitation | undefined> {
    return Array.from(this.organizationInvitations.values()).find(
      (inv) => inv.token === token
    );
  }

  async listOrganizationInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
    return Array.from(this.organizationInvitations.values()).filter(
      (inv) => inv.organizationId === organizationId
    );
  }

  async updateInvitation(id: string, updates: Partial<OrganizationInvitation>): Promise<OrganizationInvitation | undefined> {
    const invitation = this.organizationInvitations.get(id);
    if (!invitation) return undefined;
    
    const updated = { ...invitation, ...updates };
    this.organizationInvitations.set(id, updated);
    return updated;
  }

  async deleteInvitation(id: string): Promise<boolean> {
    return this.organizationInvitations.delete(id);
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const createdAt = new Date();
    const user: User = { 
      ...insertUser,
      email: insertUser.email || null, // Convert undefined to null
      id,
      accountTier: "free",
      organizationId: null,
      organizationRole: 'member',
      isAdmin: false,
      createdAt
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.password = hashedPassword;
      this.users.set(userId, user);
    }
  }

  async updateUserEmail(userId: string, email: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.email = email;
      this.users.set(userId, user);
    }
  }

  async updateUserAccountTier(userId: string, accountTier: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.accountTier = accountTier;
      this.users.set(userId, user);
    }
  }

  // Password reset token methods
  async createPasswordResetToken(insertToken: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const id = randomUUID();
    const createdAt = new Date();
    const token: PasswordResetToken = {
      ...insertToken,
      id,
      used: insertToken.used ?? false,
      createdAt
    };
    this.passwordResetTokens.set(token.token, token);
    return token;
  }

  async getPasswordResetToken(tokenValue: string): Promise<PasswordResetToken | undefined> {
    return this.passwordResetTokens.get(tokenValue);
  }

  async getValidPasswordResetTokens(): Promise<PasswordResetToken[]> {
    const now = new Date();
    return Array.from(this.passwordResetTokens.values()).filter(
      (token) => !token.used && new Date(token.expiresAt) > now
    );
  }

  async markPasswordResetTokenAsUsed(tokenId: string): Promise<void> {
    const token = Array.from(this.passwordResetTokens.values()).find(t => t.id === tokenId);
    if (token) {
      token.used = true;
      this.passwordResetTokens.set(token.token, token);
    }
  }

  async invalidateUserPasswordResetTokens(userId: string): Promise<void> {
    const userTokens = Array.from(this.passwordResetTokens.values()).filter(
      (token) => token.userId === userId && !token.used
    );
    for (const token of userTokens) {
      token.used = true;
      this.passwordResetTokens.set(token.token, token);
    }
  }

  // Site methods
  async getSite(id: string): Promise<Site | undefined> {
    return this.sites.get(id);
  }

  async getAllSites(userId: string): Promise<Site[]> {
    return Array.from(this.sites.values())
      .filter(site => site.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getOrganizationSites(organizationId: string): Promise<Site[]> {
    // Get all users in the organization
    const orgMembers = await this.getOrganizationMembers(organizationId);
    const memberIds = orgMembers.map(m => m.id);
    
    // Return sites belonging to any organization member
    return Array.from(this.sites.values())
      .filter(site => memberIds.includes(site.userId))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getSitesByUserId(userId: string): Promise<Site[]> {
    return Array.from(this.sites.values())
      .filter(site => site.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const id = randomUUID();
    const createdAt = new Date();
    const site: Site = {
      ...insertSite,
      id,
      organizationId: insertSite.organizationId ?? null,
      address: insertSite.address ?? null,
      city: insertSite.city ?? null,
      state: insertSite.state ?? null,
      zipCode: insertSite.zipCode ?? null,
      country: insertSite.country ?? null,
      facilityType: insertSite.facilityType ?? null,
      contactName: insertSite.contactName ?? null,
      contactPhone: insertSite.contactPhone ?? null,
      contactEmail: insertSite.contactEmail ?? null,
      notes: insertSite.notes ?? null,
      createdAt
    };
    this.sites.set(id, site);
    return site;
  }

  async updateSite(id: string, updateData: Partial<Site>): Promise<Site | undefined> {
    const site = this.sites.get(id);
    if (!site) return undefined;

    const updated: Site = {
      ...site,
      ...updateData
    };
    this.sites.set(id, updated);
    return updated;
  }

  async deleteSite(id: string): Promise<boolean> {
    return this.sites.delete(id);
  }

  // Facility Zone methods
  async getFacilityZone(id: string): Promise<FacilityZone | undefined> {
    return this.facilityZones.get(id);
  }

  async getFacilityZonesBySite(siteId: string): Promise<FacilityZone[]> {
    return Array.from(this.facilityZones.values()).filter(zone => zone.siteId === siteId);
  }

  async createFacilityZone(zone: InsertFacilityZone): Promise<FacilityZone> {
    const newZone: FacilityZone = {
      id: randomUUID(),
      ...zone,
      createdAt: new Date(),
    };
    this.facilityZones.set(newZone.id, newZone);
    return newZone;
  }

  async updateFacilityZone(id: string, zone: Partial<FacilityZone>): Promise<FacilityZone | undefined> {
    const existing = this.facilityZones.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...zone };
    this.facilityZones.set(id, updated);
    return updated;
  }

  async deleteFacilityZone(id: string): Promise<boolean> {
    return this.facilityZones.delete(id);
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
    const riskAssets = Array.from(this.riskAssets.values())
      .filter(a => a.assessmentId === id);
    const riskScenarios = Array.from(this.riskScenarios.values())
      .filter(s => s.assessmentId === id);
    const treatmentPlans = Array.from(this.treatmentPlans.values())
      .filter(p => p.assessmentId === id);
    const riskInsights = Array.from(this.riskInsights.values())
      .filter(r => r.assessmentId === id);
    const reports = Array.from(this.reports.values())
      .filter(r => r.assessmentId === id);

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
      organizationId: insertAssessment.organizationId ?? null,
      siteId: insertAssessment.siteId ?? null,
      templateId: insertAssessment.templateId ?? null,
      surveyParadigm: insertAssessment.surveyParadigm || "facility",
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

  // Template Questions methods
  async getTemplateQuestions(templateId: string): Promise<TemplateQuestion[]> {
    // MemStorage doesn't track template questions - return empty array
    return [];
  }

  // Executive Interview methods
  async getAllExecutiveInterviewQuestions(): Promise<ExecutiveInterviewQuestion[]> {
    // MemStorage doesn't track executive interview questions - return empty array
    return [];
  }

  async getExecutiveInterviewResponses(assessmentId: string): Promise<ExecutiveInterviewResponse[]> {
    // MemStorage doesn't track executive interview responses - return empty array
    return [];
  }

  async upsertExecutiveInterviewResponse(response: InsertExecutiveInterviewResponse): Promise<ExecutiveInterviewResponse> {
    // MemStorage doesn't support executive interview responses
    throw new Error("Executive interview responses not supported in MemStorage");
  }

  // Facility Survey methods
  async getFacilitySurveyQuestions(assessmentId: string): Promise<FacilitySurveyQuestion[]> {
    return Array.from(this.facilitySurveyQuestions.values())
      .filter(q => q.assessmentId === assessmentId);
  }

  async getFacilitySurveyQuestion(questionId: string): Promise<FacilitySurveyQuestion | null> {
    return this.facilitySurveyQuestions.get(questionId) || null;
  }

  async createFacilitySurveyQuestion(insertQuestion: InsertFacilitySurveyQuestion): Promise<FacilitySurveyQuestion> {
    const id = randomUUID();
    const question: FacilitySurveyQuestion = {
      ...insertQuestion,
      id,
      subcategory: insertQuestion.subcategory || null,
      standard: insertQuestion.standard || null,
      response: insertQuestion.response || null,
      notes: insertQuestion.notes || null,
      evidence: insertQuestion.evidence || null,
      recommendations: insertQuestion.recommendations || null,
      bestPractice: insertQuestion.bestPractice || null,
      rationale: insertQuestion.rationale || null,
      importance: insertQuestion.importance || null,
      orderIndex: insertQuestion.orderIndex || null,
      templateQuestionId: insertQuestion.templateQuestionId || null,
      createdAt: new Date()
    };
    this.facilitySurveyQuestions.set(id, question);
    return question;
  }

  async bulkCreateFacilityQuestions(questions: InsertFacilitySurveyQuestion[]): Promise<FacilitySurveyQuestion[]> {
    const results: FacilitySurveyQuestion[] = [];
    for (const questionData of questions) {
      const created = await this.createFacilitySurveyQuestion(questionData);
      results.push(created);
    }
    return results;
  }

  async updateFacilitySurveyQuestion(questionId: string, data: Partial<FacilitySurveyQuestion>): Promise<FacilitySurveyQuestion | null> {
    const existing = this.facilitySurveyQuestions.get(questionId);
    if (!existing) {
      return null;
    }
    const updated: FacilitySurveyQuestion = {
      ...existing,
      ...data
    };
    this.facilitySurveyQuestions.set(questionId, updated);
    return updated;
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

  async appendFacilityQuestionEvidence(questionId: string, evidencePath: string): Promise<FacilitySurveyQuestion | null> {
    const existing = this.facilitySurveyQuestions.get(questionId);
    if (!existing) {
      return null;
    }

    const currentEvidence = existing.evidence || [];
    const updated: FacilitySurveyQuestion = {
      ...existing,
      evidence: [...currentEvidence, evidencePath]
    };
    this.facilitySurveyQuestions.set(questionId, updated);
    return updated;
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

  // Risk Assets methods
  async getRiskAsset(id: string): Promise<RiskAsset | undefined> {
    return this.riskAssets.get(id);
  }

  async getRiskAssets(assessmentId: string): Promise<RiskAsset[]> {
    return Array.from(this.riskAssets.values())
      .filter(a => a.assessmentId === assessmentId);
  }

  async createRiskAsset(insertAsset: InsertRiskAsset): Promise<RiskAsset> {
    const id = randomUUID();
    const asset: RiskAsset = {
      ...insertAsset,
      id,
      owner: insertAsset.owner || null,
      scope: insertAsset.scope || null,
      notes: insertAsset.notes || null,
      protectionSystems: insertAsset.protectionSystems || null,
      createdAt: new Date()
    };
    this.riskAssets.set(id, asset);
    return asset;
  }

  async deleteRiskAsset(id: string): Promise<boolean> {
    return this.riskAssets.delete(id);
  }

  async bulkUpsertRiskAssets(assessmentId: string, assets: InsertRiskAsset[]): Promise<RiskAsset[]> {
    const results: RiskAsset[] = [];
    
    for (const assetData of assets) {
      // Find existing asset by name to prevent duplicates
      const existing = Array.from(this.riskAssets.values())
        .find(a => a.assessmentId === assessmentId && a.name === assetData.name);
      
      if (existing) {
        // Update existing asset while preserving ID
        const updated: RiskAsset = {
          ...existing,
          ...assetData,
          id: existing.id,
          createdAt: existing.createdAt
        };
        this.riskAssets.set(existing.id, updated);
        results.push(updated);
      } else {
        const created = await this.createRiskAsset(assetData);
        results.push(created);
      }
    }
    
    return results;
  }

  // Legacy method for backward compatibility - delegates to upsert
  async bulkCreateRiskAssets(assets: InsertRiskAsset[]): Promise<RiskAsset[]> {
    if (assets.length === 0) return [];
    const assessmentId = assets[0].assessmentId;
    return this.bulkUpsertRiskAssets(assessmentId, assets);
  }

  // Risk Scenarios methods
  async getRiskScenario(id: string): Promise<RiskScenario | undefined> {
    return this.riskScenarios.get(id);
  }

  async getRiskScenarios(assessmentId: string): Promise<RiskScenario[]> {
    return Array.from(this.riskScenarios.values())
      .filter(s => s.assessmentId === assessmentId);
  }

  async createRiskScenario(insertScenario: InsertRiskScenario): Promise<RiskScenario> {
    const id = randomUUID();
    const scenario: RiskScenario = {
      ...insertScenario,
      id,
      assetId: insertScenario.assetId || null,
      riskRating: insertScenario.riskRating || null,
      threatType: insertScenario.threatType || null,
      threatDescription: insertScenario.threatDescription || null,
      vulnerabilityDescription: insertScenario.vulnerabilityDescription || null,
      currentLikelihood: insertScenario.currentLikelihood || null,
      currentImpact: insertScenario.currentImpact || null,
      currentRiskLevel: insertScenario.currentRiskLevel || null,
      decision: insertScenario.decision || "undecided",
      createdAt: new Date()
    };
    this.riskScenarios.set(id, scenario);
    return scenario;
  }

  async updateRiskScenario(id: string, updateData: Partial<RiskScenario>): Promise<RiskScenario | undefined> {
    const scenario = this.riskScenarios.get(id);
    if (!scenario) return undefined;

    const updated: RiskScenario = {
      ...scenario,
      ...updateData
    };
    this.riskScenarios.set(id, updated);
    return updated;
  }

  async deleteRiskScenario(id: string): Promise<boolean> {
    return this.riskScenarios.delete(id);
  }

  async bulkUpsertRiskScenarios(assessmentId: string, scenarios: InsertRiskScenario[]): Promise<RiskScenario[]> {
    const results: RiskScenario[] = [];
    
    for (const scenarioData of scenarios) {
      // Use stable identifiers: assessmentId + assetId + scenario for uniqueness
      const existing = Array.from(this.riskScenarios.values())
        .find(s => s.assessmentId === assessmentId && 
                   s.assetId === scenarioData.assetId &&
                   s.scenario === scenarioData.scenario &&
                   s.asset === scenarioData.asset);
      
      if (existing) {
        const updated = await this.updateRiskScenario(existing.id, scenarioData);
        if (updated) results.push(updated);
      } else {
        const created = await this.createRiskScenario(scenarioData);
        results.push(created);
      }
    }
    
    return results;
  }

  // Vulnerabilities methods
  async getVulnerability(id: string): Promise<Vulnerability | undefined> {
    return this.vulnerabilities.get(id);
  }

  async getVulnerabilities(assessmentId: string): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values())
      .filter(v => v.assessmentId === assessmentId);
  }

  async createVulnerability(insertVulnerability: InsertVulnerability): Promise<Vulnerability> {
    const id = randomUUID();
    const vulnerability: Vulnerability = {
      ...insertVulnerability,
      id,
      riskScenarioId: insertVulnerability.riskScenarioId || null,
      notes: insertVulnerability.notes || null,
      createdAt: new Date()
    };
    this.vulnerabilities.set(id, vulnerability);
    return vulnerability;
  }

  async updateVulnerability(id: string, updateData: Partial<Vulnerability>): Promise<Vulnerability | undefined> {
    const vulnerability = this.vulnerabilities.get(id);
    if (!vulnerability) return undefined;

    const updated: Vulnerability = {
      ...vulnerability,
      ...updateData
    };
    this.vulnerabilities.set(id, updated);
    return updated;
  }

  async deleteVulnerability(id: string): Promise<boolean> {
    return this.vulnerabilities.delete(id);
  }

  // Controls methods
  async getControl(id: string): Promise<Control | undefined> {
    return this.controls.get(id);
  }

  async getControls(assessmentId: string): Promise<Control[]> {
    return Array.from(this.controls.values())
      .filter(c => c.assessmentId === assessmentId);
  }

  async createControl(insertControl: InsertControl): Promise<Control> {
    const id = randomUUID();
    const control: Control = {
      ...insertControl,
      id,
      vulnerabilityId: insertControl.vulnerabilityId || null,
      riskScenarioId: insertControl.riskScenarioId || null,
      effectiveness: insertControl.effectiveness || null,
      notes: insertControl.notes || null,
      treatmentType: insertControl.treatmentType || null,
      primaryEffect: insertControl.primaryEffect || null,
      treatmentEffectiveness: insertControl.treatmentEffectiveness || null,
      actionDescription: insertControl.actionDescription || null,
      responsibleParty: insertControl.responsibleParty || null,
      targetDate: insertControl.targetDate || null,
      estimatedCost: insertControl.estimatedCost || null,
      createdAt: new Date()
    };
    this.controls.set(id, control);
    return control;
  }

  async updateControl(id: string, updateData: Partial<Control>): Promise<Control | undefined> {
    const control = this.controls.get(id);
    if (!control) return undefined;

    const updated: Control = {
      ...control,
      ...updateData
    };
    this.controls.set(id, updated);
    return updated;
  }

  async deleteControl(id: string): Promise<boolean> {
    return this.controls.delete(id);
  }

  // Treatment Plans methods
  async getTreatmentPlan(id: string): Promise<TreatmentPlan | undefined> {
    return this.treatmentPlans.get(id);
  }

  async getTreatmentPlans(assessmentId: string): Promise<TreatmentPlan[]> {
    return Array.from(this.treatmentPlans.values())
      .filter(p => p.assessmentId === assessmentId);
  }

  async createTreatmentPlan(insertPlan: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const id = randomUUID();
    const plan: TreatmentPlan = {
      ...insertPlan,
      id,
      riskScenarioId: insertPlan.riskScenarioId || null,
      threatDescription: insertPlan.threatDescription || null,
      type: insertPlan.type || null,
      effect: insertPlan.effect || null,
      value: insertPlan.value || null,
      responsible: insertPlan.responsible || null,
      deadline: insertPlan.deadline || null,
      cost: insertPlan.cost || null,
      status: insertPlan.status || "planned",
      createdAt: new Date()
    };
    this.treatmentPlans.set(id, plan);
    return plan;
  }

  async updateTreatmentPlan(id: string, updateData: Partial<TreatmentPlan>): Promise<TreatmentPlan | undefined> {
    const plan = this.treatmentPlans.get(id);
    if (!plan) return undefined;

    const updated: TreatmentPlan = {
      ...plan,
      ...updateData
    };
    this.treatmentPlans.set(id, updated);
    return updated;
  }

  async deleteTreatmentPlan(id: string): Promise<boolean> {
    return this.treatmentPlans.delete(id);
  }

  async bulkUpsertTreatmentPlans(assessmentId: string, plans: InsertTreatmentPlan[]): Promise<TreatmentPlan[]> {
    const results: TreatmentPlan[] = [];
    
    for (const planData of plans) {
      // Use stable identifiers: assessmentId + riskScenarioId + strategy for uniqueness
      // This allows multiple treatment strategies per risk scenario
      const existing = Array.from(this.treatmentPlans.values())
        .find(p => p.assessmentId === assessmentId && 
                   p.riskScenarioId === planData.riskScenarioId &&
                   p.strategy === planData.strategy &&
                   p.risk === planData.risk);
      
      if (existing) {
        const updated = await this.updateTreatmentPlan(existing.id, planData);
        if (updated) results.push(updated);
      } else {
        const created = await this.createTreatmentPlan(planData);
        results.push(created);
      }
    }
    
    return results;
  }

  // Assessment Questions methods
  async getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
    return Array.from(this.assessmentQuestions.values())
      .filter(q => q.assessmentId === assessmentId);
  }

  async getAssessmentQuestion(questionId: string): Promise<AssessmentQuestion | null> {
    return this.assessmentQuestions.get(questionId) || null;
  }

  async createAssessmentQuestion(insertQuestion: InsertAssessmentQuestion): Promise<AssessmentQuestion> {
    const id = randomUUID();
    const question: AssessmentQuestion = {
      ...insertQuestion,
      id,
      createdAt: new Date(),
      response: insertQuestion.response || null,
      notes: insertQuestion.notes || null,
      evidence: insertQuestion.evidence || null
    };
    this.assessmentQuestions.set(id, question);
    return question;
  }

  async bulkCreateAssessmentQuestions(questions: InsertAssessmentQuestion[]): Promise<AssessmentQuestion[]> {
    const results: AssessmentQuestion[] = [];
    for (const question of questions) {
      const created = await this.createAssessmentQuestion(question);
      results.push(created);
    }
    return results;
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

  async appendAssessmentQuestionEvidence(questionId: string, evidencePath: string): Promise<AssessmentQuestion | null> {
    const existing = this.assessmentQuestions.get(questionId);
    if (!existing) {
      return null;
    }

    const currentEvidence = existing.evidence || [];
    const updated: AssessmentQuestion = {
      ...existing,
      evidence: [...currentEvidence, evidencePath]
    };
    this.assessmentQuestions.set(questionId, updated);
    return updated;
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

  // Threat Library methods (not supported in MemStorage)
  async getThreatLibrary(): Promise<ThreatLibrary[]> {
    throw new Error("Threat Library not supported in MemStorage - use DbStorage");
  }

  async getThreatLibraryByCategory(category: string): Promise<ThreatLibrary[]> {
    throw new Error("Threat Library not supported in MemStorage - use DbStorage");
  }

  async getThreatLibraryItem(id: string): Promise<ThreatLibrary | undefined> {
    throw new Error("Threat Library not supported in MemStorage - use DbStorage");
  }

  // Control Library methods (not supported in MemStorage)
  async getControlLibrary(): Promise<ControlLibrary[]> {
    throw new Error("Control Library not supported in MemStorage - use DbStorage");
  }

  async getControlLibraryByCategory(category: string): Promise<ControlLibrary[]> {
    throw new Error("Control Library not supported in MemStorage - use DbStorage");
  }

  async getControlLibraryItem(id: string): Promise<ControlLibrary | undefined> {
    throw new Error("Control Library not supported in MemStorage - use DbStorage");
  }
}

import { DbStorage } from "./dbStorage";

export const storage = new DbStorage();
