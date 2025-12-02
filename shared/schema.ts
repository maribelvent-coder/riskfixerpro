import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  accountTier: text("account_tier").notNull().default("basic"), // basic, pro, enterprise (free users don't have orgs)
  ownerId: varchar("owner_id").notNull(), // References users.id but not enforced to avoid circular dependency
  maxMembers: integer("max_members").notNull().default(2), // Basic: 2, Pro: 10, Enterprise: unlimited (-1)
  maxSites: integer("max_sites").notNull().default(2), // Basic: 2, Pro: 10, Enterprise: unlimited (-1)
  maxAssessments: integer("max_assessments").notNull().default(5), // Basic: 5, Pro: 50, Enterprise: unlimited (-1)
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(), // nullable for now to allow migration
  password: text("password").notNull(),
  accountTier: text("account_tier").notNull().default("free"), // free, basic, pro, enterprise
  organizationId: varchar("organization_id").references(() => organizations.id), // null for free tier users
  organizationRole: text("organization_role").default("member"), // owner, admin, member
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const sites = pgTable("sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id").references(() => organizations.id), // Multi-tenancy: nullable for Free Tier users
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  facilityType: text("facility_type"), // office, warehouse, retail, manufacturing, datacenter, other
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id").references(() => organizations.id), // Multi-tenancy: nullable for Free Tier users
  siteId: varchar("site_id").references(() => sites.id),
  templateId: text("template_id"), // Source template: executive-protection, office-building, etc.
  surveyParadigm: text("survey_paradigm").notNull().default("facility"), // facility, executive, custom
  title: text("title").notNull(),
  location: text("location").notNull(),
  assessor: text("assessor").notNull(),
  status: text("status").notNull().default("draft"), // draft, facility-survey, risk-assessment, completed, reviewed
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
  riskLevel: text("risk_level"), // low, medium, high, critical
  
  // ASIS Step 1: Establish Context
  businessObjectives: jsonb("business_objectives"), // Array of business objectives
  assetTypes: text("asset_types").array(), // Types of assets being protected
  riskCriteria: jsonb("risk_criteria"), // Risk measurement criteria
  
  // Facility Survey completion status
  facilitySurveyCompleted: boolean("facility_survey_completed").default(false),
  facilitySurveyCompletedAt: timestamp("facility_survey_completed_at"),
  
  // Risk Assessment completion status
  riskAssessmentCompleted: boolean("risk_assessment_completed").default(false),
  riskAssessmentCompletedAt: timestamp("risk_assessment_completed_at"),
});

// Template Questions - Master survey questions for each template type
export const templateQuestions = pgTable("template_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: text("template_id").notNull(), // executive-protection, office-building, etc.
  questionId: text("question_id").notNull(), // 1.1.1, 1.1.2, etc.
  category: text("category").notNull(), // OSINT & Digital Footprint, Travel Security, etc.
  subcategory: text("subcategory"), // Secondary categorization
  question: text("question").notNull(), // The actual question text
  bestPractice: text("best_practice"), // How to conduct the review
  rationale: text("rationale"), // Risk being mitigated
  importance: text("importance"), // Critical, High, Medium, Low
  type: text("type").notNull().default("yes-no"), // yes-no, rating, text, checklist
  orderIndex: integer("order_index").notNull(), // Display order
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Executive Interview Questions - Master interview questions for executive protection assessments
export const executiveInterviewQuestions = pgTable("executive_interview_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionNumber: integer("question_number").notNull().unique(), // 1-34, unique to prevent duplicate seeds
  category: text("category").notNull(), // "Incident History & Threats", "Executive Protection", etc.
  question: text("question").notNull(), // The actual interview question
  responseType: text("response_type").notNull().default("text"), // "text" or "yes-no-text"
  orderIndex: integer("order_index").notNull(), // Display order within category
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Executive Interview Responses - Answers collected during executive interviews
export const executiveInterviewResponses = pgTable("executive_interview_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  questionId: varchar("question_id").notNull().references(() => executiveInterviewQuestions.id),
  yesNoResponse: boolean("yes_no_response"), // For yes-no-text questions
  textResponse: text("text_response"), // Detailed narrative response
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  uniqueAssessmentQuestion: sql`UNIQUE (${table.assessmentId}, ${table.questionId})` // Ensure one response per question per assessment for upserts
}));

// Facility Survey Questions - Physical assessment of existing controls
export const facilitySurveyQuestions = pgTable("facility_survey_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  templateQuestionId: text("template_question_id"), // Custom template ID like "barriers-001"
  category: text("category").notNull(), // barriers, lighting, access-control, surveillance, etc.
  subcategory: text("subcategory"), // doors, windows, cameras, etc.
  question: text("question").notNull(),
  bestPractice: text("best_practice"), // How to conduct the review
  rationale: text("rationale"), // Risk being mitigated
  importance: text("importance"), // Critical, High, Medium, Low
  orderIndex: integer("order_index"), // Display order from template
  standard: text("standard"), // Reference to CPP/Army FM standard
  type: text("type").notNull(), // condition, measurement, yes-no, rating
  response: jsonb("response"), // Condition, measurements, ratings
  notes: text("notes"),
  evidence: text("evidence").array(), // Photo evidence
  recommendations: text("recommendations").array(), // Immediate fixes needed
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Risk Assessment Questions - ASIS framework questions  
export const assessmentQuestions = pgTable("assessment_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  templateQuestionId: text("template_question_id"), // Custom template ID like "barriers-001" from templateQuestions
  questionId: text("question_id").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"), // Secondary categorization
  question: text("question").notNull(),
  bestPractice: text("best_practice"), // How to conduct the review
  rationale: text("rationale"), // Risk being mitigated
  importance: text("importance"), // Critical, High, Medium, Low
  orderIndex: integer("order_index"), // Display order from template
  type: text("type").notNull(), // yes-no, score, text
  weight: integer("weight").notNull().default(1),
  response: jsonb("response"), // boolean | number | string
  notes: text("notes"),
  evidence: text("evidence").array(), // file paths/urls
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Threats identified in ASIS Step 2: Identify Risks
export const identifiedThreats = pgTable("identified_threats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  threatType: text("threat_type").notNull(), // human, environmental, technical, operational
  threatName: text("threat_name").notNull(),
  description: text("description").notNull(),
  affectedAssets: text("affected_assets").array(),
  vulnerabilities: text("vulnerabilities").array(), // From facility survey findings
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Step 1: Assets to protect - valuable things the organization wants to safeguard
export const riskAssets = pgTable("risk_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  name: text("name").notNull(), // e.g., "Customer Database", "Executive Team", "Main Server Room"
  type: text("type").notNull(), // "People", "Property", "Information", "Reputation", "Other"
  owner: text("owner"), // Who owns/manages this asset
  criticality: integer("criticality").notNull(), // 1-5 rating (1=lowest, 5=highest)
  scope: text("scope"), // Physical or logical scope (e.g., "HQ Building", "IT Department") 
  notes: text("notes"), // Additional description
  protectionSystems: text("protection_systems").array(), // ["access-control", "surveillance", "barriers", "lighting", "intrusion-detection", "alarms"]
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Step 2-3: Risk Scenarios with quantitative analysis
export const riskScenarios = pgTable("risk_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  assetId: varchar("asset_id").references(() => riskAssets.id),
  scenario: text("scenario").notNull(), // "Theft of cash register"
  asset: text("asset").notNull(), // "Cash register" 
  
  // Threat information
  threatType: text("threat_type"), // human, environmental, technical, operational
  threatDescription: text("threat_description"), // Specific threat
  vulnerabilityDescription: text("vulnerability_description"), // What makes this possible
  
  // Inherent Risk (before any controls)
  likelihood: text("likelihood").notNull(), // "very-low", "low", "medium", "high", "very-high"
  impact: text("impact").notNull(), // "negligible", "minor", "moderate", "major", "catastrophic"
  riskLevel: text("risk_level").notNull(), // "Low", "Medium", "High", "Critical" (auto-calculated)
  
  // Current Risk (after existing controls)
  currentLikelihood: text("current_likelihood"), 
  currentImpact: text("current_impact"),
  currentRiskLevel: text("current_risk_level"),
  
  // Decision and treatment
  decision: text("decision").default("undecided"), // "undecided", "accept", "transfer", "remediate"
  
  riskRating: text("risk_rating"), // User's assessment
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Step 4: Vulnerabilities - specific weaknesses that enable threats
export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  riskScenarioId: varchar("risk_scenario_id").references(() => riskScenarios.id),
  description: text("description").notNull(), // "No controls in place", "Poor lighting"
  notes: text("notes"), // Additional context
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Step 4: Controls - existing and proposed controls for vulnerabilities
export const controls = pgTable("controls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  vulnerabilityId: varchar("vulnerability_id").references(() => vulnerabilities.id),
  riskScenarioId: varchar("risk_scenario_id").references(() => riskScenarios.id),
  description: text("description").notNull(), // "Cameras", "Access control system"
  controlType: text("control_type").notNull(), // "existing" or "proposed"
  effectiveness: integer("effectiveness"), // 1-5 rating (only for existing controls)
  notes: text("notes"), // Evidence, references, comments
  
  // Treatment plan fields (for proposed controls)
  treatmentType: text("treatment_type"), // "people", "process", "technology", "physical", "policy", "training", "vendor", "other"
  primaryEffect: text("primary_effect"), // "reduce_likelihood", "reduce_impact"
  treatmentEffectiveness: integer("treatment_effectiveness"), // 1-5 reduction value (for proposed controls)
  actionDescription: text("action_description"), // Detailed action plan
  responsibleParty: text("responsible_party"), // Who implements this
  targetDate: text("target_date"), // Implementation deadline
  estimatedCost: text("estimated_cost"), // Budget estimate
  
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Step 6: Treatment Plans  
export const treatmentPlans = pgTable("treatment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  riskScenarioId: varchar("risk_scenario_id").references(() => riskScenarios.id),
  risk: text("risk").notNull(), // Which risk this treats
  threatDescription: text("threat_description"), // Description of the threat being treated
  strategy: text("strategy").notNull(), // "Accept", "Avoid", "Control", "Transfer"
  description: text("description").notNull(), // The treatment action
  
  // Treatment details
  type: text("type"), // "people", "process", "technology", "physical", "policy", "training", "vendor", "other"
  effect: text("effect"), // "reduce_likelihood", "reduce_impact"
  value: integer("value"), // How much to reduce (1-5)
  
  responsible: text("responsible"), // Who is responsible
  deadline: text("deadline"), // When to implement
  cost: text("cost"), // Estimated cost
  status: text("status").default("planned"), // planned, in_progress, completed
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ASIS Step 3 & 4: Analyzed and Evaluated Risks (AI Generated)
export const riskInsights = pgTable("risk_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  threatId: varchar("threat_id").references(() => identifiedThreats.id),
  category: text("category").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation").notNull(),
  impact: integer("impact").notNull(), // 1-10
  probability: integer("probability").notNull(), // 1-10
  riskScore: integer("risk_score").notNull(), // impact * probability
  riskMatrix: text("risk_matrix").notNull(), // Position on risk matrix
  
  // ASIS Step 5: Risk Treatment
  treatmentStrategy: text("treatment_strategy"), // avoid, transfer, mitigate, accept
  treatmentPlan: text("treatment_plan"),
  priority: text("priority"), // immediate, short-term, long-term
  
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  type: text("type").notNull(), // exec-summary, detailed-technical, compliance-report
  title: text("title").notNull(),
  format: text("format").notNull(), // pdf, docx, html
  status: text("status").notNull().default("pending"), // pending, generating, ready, error
  filePath: text("file_path"),
  fileSize: text("file_size"),
  createdAt: timestamp("created_at").default(sql`now()`),
  generatedAt: timestamp("generated_at"),
});

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address").nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Insert schemas
export const insertTemplateQuestionSchema = createInsertSchema(templateQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertFacilitySurveyQuestionSchema = createInsertSchema(facilitySurveyQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentQuestionSchema = createInsertSchema(assessmentQuestions).omit({
  id: true,
});

export const insertIdentifiedThreatSchema = createInsertSchema(identifiedThreats).omit({
  id: true,
  createdAt: true,
});

export const insertRiskAssetSchema = createInsertSchema(riskAssets).omit({
  id: true,
  createdAt: true,
});

export const insertRiskScenarioSchema = createInsertSchema(riskScenarios).omit({
  id: true,
  createdAt: true,
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({
  id: true,
  createdAt: true,
});

export const insertControlSchema = createInsertSchema(controls).omit({
  id: true,
  createdAt: true,
});

export const insertTreatmentPlanSchema = createInsertSchema(treatmentPlans).omit({
  id: true,
  createdAt: true,
});

export const insertRiskInsightSchema = createInsertSchema(riskInsights).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
});

export const insertExecutiveInterviewQuestionSchema = createInsertSchema(executiveInterviewQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertExecutiveInterviewResponseSchema = createInsertSchema(executiveInterviewResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type TemplateQuestion = typeof templateQuestions.$inferSelect;
export type InsertTemplateQuestion = z.infer<typeof insertTemplateQuestionSchema>;

export type FacilitySurveyQuestion = typeof facilitySurveyQuestions.$inferSelect;
export type InsertFacilitySurveyQuestion = z.infer<typeof insertFacilitySurveyQuestionSchema>;

export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type InsertAssessmentQuestion = z.infer<typeof insertAssessmentQuestionSchema>;

export type IdentifiedThreat = typeof identifiedThreats.$inferSelect;
export type InsertIdentifiedThreat = z.infer<typeof insertIdentifiedThreatSchema>;

export type RiskAsset = typeof riskAssets.$inferSelect;
export type InsertRiskAsset = z.infer<typeof insertRiskAssetSchema>;

export type RiskScenario = typeof riskScenarios.$inferSelect;
export type InsertRiskScenario = z.infer<typeof insertRiskScenarioSchema>;

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;

export type Control = typeof controls.$inferSelect;
export type InsertControl = z.infer<typeof insertControlSchema>;

export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type InsertTreatmentPlan = z.infer<typeof insertTreatmentPlanSchema>;

export type RiskInsight = typeof riskInsights.$inferSelect;
export type InsertRiskInsight = z.infer<typeof insertRiskInsightSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type ExecutiveInterviewQuestion = typeof executiveInterviewQuestions.$inferSelect;
export type InsertExecutiveInterviewQuestion = z.infer<typeof insertExecutiveInterviewQuestionSchema>;

export type ExecutiveInterviewResponse = typeof executiveInterviewResponses.$inferSelect;
export type InsertExecutiveInterviewResponse = z.infer<typeof insertExecutiveInterviewResponseSchema>;

// Assessment with related data
export type AssessmentWithQuestions = Assessment & {
  questions: AssessmentQuestion[];
  facilityQuestions: FacilitySurveyQuestion[];
  threats: IdentifiedThreat[];
  riskAssets: RiskAsset[];
  riskScenarios: RiskScenario[];
  treatmentPlans: TreatmentPlan[];
  riskInsights: RiskInsight[];
  reports: Report[];
};
