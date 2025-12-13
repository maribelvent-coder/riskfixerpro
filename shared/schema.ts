import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, real, uniqueIndex, decimal } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Merchandise Display Models
 * Defines how merchandise is presented to customers in retail environments
 */
export const merchandiseDisplaySchema = z.enum([
  'Open Shelving',
  'Locked Cabinets / Tethered',
  'Behind Counter / Staff Access Only',
  'Service Only'
]);

export type MerchandiseDisplay = z.infer<typeof merchandiseDisplaySchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  accountTier: text("account_tier").notNull().default("free"),
  organizationId: varchar("organization_id").references(() => organizations.id),
  organizationRole: text("organization_role").default("member"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  accountTier: text("account_tier").notNull().default("basic"),
  ownerId: varchar("owner_id").notNull(),
  maxMembers: integer("max_members").notNull().default(2),
  maxSites: integer("max_sites").notNull().default(2),
  maxAssessments: integer("max_assessments").notNull().default(5),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const organizationInvitations = pgTable("organization_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  acceptedAt: timestamp("accepted_at"),
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
  facilityType: text("facility_type"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  notes: text("notes"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  geocodeProvider: text("geocode_provider"),
  geocodeStatus: text("geocode_status").default("pending"),
  geocodeTimestamp: timestamp("geocode_timestamp"),
  normalizedAddress: text("normalized_address"),
  county: text("county"),
  timezone: text("timezone"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const facilityZones = pgTable("facility_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").notNull().references(() => sites.id),
  name: text("name").notNull(),
  zoneType: text("zone_type").notNull(),
  floorNumber: integer("floor_number"),
  securityLevel: text("security_level").notNull().default("public"),
  description: text("description"),
  accessRequirements: text("access_requirements"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const loadingDocks = pgTable("loading_docks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  dockNumber: text("dock_number").notNull(),
  dockType: text("dock_type").notNull(),
  location: text("location"),
  hasLeveler: boolean("has_leveler").default(false),
  hasShelter: boolean("has_shelter").default(false),
  hasRestraint: boolean("has_restraint").default(false),
  lightingLevel: text("lighting_level"),
  securityMeasures: text("security_measures").array(),
  accessControl: text("access_control"),
  camerasCoverage: text("cameras_coverage"),
  trafficFlow: text("traffic_flow"),
  vulnerabilities: text("vulnerabilities"),
  recommendations: text("recommendations"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id").references(() => organizations.id), // Multi-tenancy: nullable for Free Tier users
  siteId: varchar("site_id").references(() => sites.id),
  templateId: text("template_id"),
  surveyParadigm: text("survey_paradigm").notNull().default("facility"),
  title: text("title").notNull(),
  location: text("location").notNull(),
  assessor: text("assessor").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
  riskLevel: text("risk_level"),
  businessObjectives: jsonb("business_objectives"),
  assetTypes: text("asset_types").array(),
  riskCriteria: jsonb("risk_criteria"),
  facilitySurveyCompleted: boolean("facility_survey_completed").default(false),
  facilitySurveyCompletedAt: timestamp("facility_survey_completed_at"),
  riskAssessmentCompleted: boolean("risk_assessment_completed").default(false),
  riskAssessmentCompletedAt: timestamp("risk_assessment_completed_at"),
  executiveSummary: text("executive_summary"),
  warehouseProfile: jsonb("warehouse_profile"),
  retailProfile: jsonb("retail_profile"),
  manufacturingProfile: jsonb("manufacturing_profile"),
  datacenterProfile: jsonb("datacenter_profile"),
  officeProfile: jsonb("office_profile"),
  epProfile: jsonb("ep_profile"), // EP principal exposure profile responses (ep_ prefixed questions)
  epDashboardCache: jsonb("ep_dashboard_cache"), // Cached EP AI dashboard results with interview hash for staleness check
  epInterviewHash: text("ep_interview_hash"), // Hash of interview responses to detect changes
  cachedSectionAnalysis: jsonb("cached_section_analysis"), // Cached AI section analysis results
  sectionAnalysisUpdatedAt: timestamp("section_analysis_updated_at"), // When section analysis was last run
});

export const templateQuestions = pgTable("template_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: text("template_id").notNull(),
  questionId: text("question_id").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  question: text("question").notNull(),
  bestPractice: text("best_practice"),
  rationale: text("rationale"),
  importance: text("importance"),
  type: text("type").notNull().default("yes-no"),
  options: text("options").array(),
  orderIndex: integer("order_index").notNull(),
  controlLibraryId: varchar("control_library_id"),
  conditionalOnQuestionId: text("conditional_on_question_id"),
  showWhenAnswer: text("show_when_answer"),
  riskDirection: text("risk_direction"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const facilitySurveyQuestions = pgTable("facility_survey_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  templateQuestionId: text("template_question_id"),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  question: text("question").notNull(),
  bestPractice: text("best_practice"),
  rationale: text("rationale"),
  importance: text("importance"),
  orderIndex: integer("order_index"),
  standard: text("standard"),
  type: text("type").notNull(),
  options: text("options").array(),
  response: jsonb("response"),
  notes: text("notes"),
  evidence: text("evidence").array(),
  recommendations: text("recommendations").array(),
  controlLibraryId: varchar("control_library_id").references(() => controlLibrary.id),
  conditionalOnQuestionId: text("conditional_on_question_id"),
  showWhenAnswer: text("show_when_answer"),
  riskDirection: text("risk_direction"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  templateQuestionId: text("template_question_id"),
  questionId: text("question_id").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  question: text("question").notNull(),
  bestPractice: text("best_practice"),
  rationale: text("rationale"),
  importance: text("importance"),
  orderIndex: integer("order_index"),
  type: text("type").notNull(),
  weight: integer("weight").notNull().default(1),
  response: jsonb("response"),
  notes: text("notes"),
  evidence: text("evidence").array(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const executiveInterviewQuestions = pgTable("executive_interview_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionNumber: integer("question_number").notNull().unique(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  responseType: text("response_type").notNull().default("text"),
  orderIndex: integer("order_index").notNull(),
  riskDirection: text("risk_direction").default("positive"), // "positive" = No is bad (YES_GOOD), "negative" = Yes is bad (YES_BAD)
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const executiveInterviewResponses = pgTable("executive_interview_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  questionId: varchar("question_id").notNull().references(() => executiveInterviewQuestions.id),
  yesNoResponse: boolean("yes_no_response"),
  textResponse: text("text_response"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  assessmentQuestionUnique: uniqueIndex("assessment_question_unique").on(table.assessmentId, table.questionId),
}));

export const identifiedThreats = pgTable("identified_threats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  threatType: text("threat_type").notNull(),
  threatName: text("threat_name").notNull(),
  description: text("description").notNull(),
  affectedAssets: text("affected_assets").array(),
  vulnerabilities: text("vulnerabilities").array(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const riskAssets = pgTable("risk_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  owner: text("owner"),
  criticality: integer("criticality").notNull(),
  scope: text("scope"),
  notes: text("notes"),
  protectionSystems: text("protection_systems").array(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const riskScenarios = pgTable("risk_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  assetId: varchar("asset_id").references(() => riskAssets.id),
  threatLibraryId: varchar("threat_library_id"),
  scenario: text("scenario").notNull(),
  asset: text("asset").notNull(),
  threatType: text("threat_type"),
  threatDescription: text("threat_description"),
  vulnerabilityDescription: text("vulnerability_description"),
  likelihood: text("likelihood").notNull(),
  impact: text("impact").notNull(),
  riskLevel: text("risk_level").notNull(),
  currentLikelihood: text("current_likelihood"),
  currentImpact: text("current_impact"),
  currentRiskLevel: text("current_risk_level"),
  decision: text("decision").default("undecided"),
  riskRating: text("risk_rating"),
  likelihoodScore: real("likelihood_score"),
  impactScore: real("impact_score"),
  inherentRisk: real("inherent_risk"),
  controlEffectiveness: real("control_effectiveness"),
  residualRisk: real("residual_risk"),
  exposure: decimal("exposure", { precision: 3, scale: 1 }).default("1.0"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  riskScenarioId: varchar("risk_scenario_id").references(() => riskScenarios.id),
  description: text("description").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const controls = pgTable("controls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  vulnerabilityId: varchar("vulnerability_id").references(() => vulnerabilities.id),
  riskScenarioId: varchar("risk_scenario_id").references(() => riskScenarios.id),
  description: text("description").notNull(),
  controlType: text("control_type").notNull(),
  effectiveness: integer("effectiveness"),
  notes: text("notes"),
  treatmentType: text("treatment_type"),
  primaryEffect: text("primary_effect"),
  treatmentEffectiveness: integer("treatment_effectiveness"),
  actionDescription: text("action_description"),
  responsibleParty: text("responsible_party"),
  targetDate: text("target_date"),
  estimatedCost: text("estimated_cost"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const treatmentPlans = pgTable("treatment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  riskScenarioId: varchar("risk_scenario_id").references(() => riskScenarios.id),
  risk: text("risk").notNull(),
  threatDescription: text("threat_description"),
  strategy: text("strategy").notNull(),
  description: text("description").notNull(),
  type: text("type"),
  effect: text("effect"),
  value: integer("value"),
  responsible: text("responsible"),
  deadline: text("deadline"),
  cost: text("cost"),
  status: text("status").default("planned"),
  projectedRiskReduction: real("projected_risk_reduction"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const riskInsights = pgTable("risk_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  threatId: varchar("threat_id").references(() => identifiedThreats.id),
  category: text("category").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation").notNull(),
  impact: integer("impact").notNull(),
  probability: integer("probability").notNull(),
  riskScore: integer("risk_score").notNull(),
  riskMatrix: text("risk_matrix").notNull(),
  treatmentStrategy: text("treatment_strategy"),
  treatmentPlan: text("treatment_plan"),
  priority: text("priority"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  format: text("format").notNull(),
  status: text("status").notNull().default("pending"),
  filePath: text("file_path"),
  fileSize: text("file_size"),
  content: text("content"),
  reportType: text("report_type"),
  createdAt: timestamp("created_at").default(sql`now()`),
  generatedAt: timestamp("generated_at"),
});

export const threatLibrary = pgTable("threat_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  description: text("description").notNull(),
  typicalLikelihood: text("typical_likelihood"),
  typicalImpact: text("typical_impact"),
  asIsCode: text("asis_code"),
  mitigation: text("mitigation"),
  examples: text("examples").array(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const controlLibrary = pgTable("control_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  controlType: text("control_type").notNull(),
  description: text("description").notNull(),
  baseWeight: integer("base_weight"),
  weight: real("weight"),
  reductionPercentage: integer("reduction_percentage"),
  implementationNotes: text("implementation_notes"),
  estimatedCost: text("estimated_cost"),
  maintenanceLevel: text("maintenance_level"),
  trainingRequired: boolean("training_required").default(false),
  maintenanceRequired: boolean("maintenance_required").default(true),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const pointsOfInterest = pgTable("points_of_interest", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").references(() => sites.id),
  assessmentId: varchar("assessment_id").references(() => assessments.id),
  poiType: text("poi_type").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  distanceToSite: text("distance_to_site"),
  estimatedResponseTime: integer("estimated_response_time"),
  phoneNumber: text("phone_number"),
  hours: text("hours"),
  capabilities: jsonb("capabilities"),
  threatLevel: text("threat_level"),
  threatNotes: text("threat_notes"),
  customCategory: text("custom_category"),
  icon: text("icon"),
  color: text("color"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const crimeSources = pgTable("crime_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").references(() => sites.id),
  assessmentId: varchar("assessment_id").references(() => assessments.id),
  dataSource: text("data_source").notNull(),
  importDate: timestamp("import_date").notNull().default(sql`now()`),
  dataTimePeriod: text("data_time_period"),
  coverageArea: jsonb("coverage_area"),
  city: text("city"),
  county: text("county"),
  state: text("state"),
  zipCodes: jsonb("zip_codes"),
  originalFileUrl: text("original_file_url"),
  originalFileName: text("original_file_name"),
  dataQuality: text("data_quality"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const crimeObservations = pgTable("crime_observations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crimeSourceId: varchar("crime_source_id").notNull().references(() => crimeSources.id),
  violentCrimes: jsonb("violent_crimes"),
  propertyCrimes: jsonb("property_crimes"),
  otherCrimes: jsonb("other_crimes"),
  overallCrimeIndex: integer("overall_crime_index"),
  nationalAverage: jsonb("national_average"),
  stateAverage: jsonb("state_average"),
  comparisonRating: text("comparison_rating"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const siteIncidents = pgTable("site_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").notNull().references(() => sites.id),
  incidentDate: timestamp("incident_date").notNull(),
  incidentType: text("incident_type").notNull(),
  severity: text("severity").notNull().default("medium"),
  description: text("description").notNull(),
  locationWithinSite: text("location_within_site"),
  outcome: text("outcome").default("unresolved"),
  policeNotified: boolean("police_notified").default(false),
  policeReportNumber: text("police_report_number"),
  estimatedCost: integer("estimated_cost"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const crimeDataImports = pgTable("crime_data_imports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  dataSource: text("data_source").notNull(),
  importDate: timestamp("import_date").notNull().default(sql`now()`),
  dataTimePeriod: text("data_time_period"),
  coverageArea: text("coverage_area"),
  city: text("city"),
  county: text("county"),
  state: text("state"),
  zipCodes: text("zip_codes"),
  crimeStatistics: text("crime_statistics").notNull(),
  nationalAverage: text("national_average"),
  stateAverage: text("state_average"),
  comparisonRating: text("comparison_rating"),
  originalFileUrl: text("original_file_url"),
  originalFileName: text("original_file_name"),
  dataQuality: text("data_quality"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const crimeIncidents = pgTable("crime_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crimeDataImportId: varchar("crime_data_import_id").references(() => crimeDataImports.id, { onDelete: "cascade" }),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  incidentType: text("incident_type").notNull(),
  incidentCategory: text("incident_category"),
  incidentDate: timestamp("incident_date"),
  incidentTime: text("incident_time"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  address: text("address"),
  distanceToExecutiveLocation: real("distance_to_executive_location"),
  nearestExecutiveLocationId: varchar("nearest_executive_location_id").references(() => executiveLocations.id, { onDelete: "set null" }),
  description: text("description"),
  severity: text("severity"),
  sourceAgency: text("source_agency"),
  caseNumber: text("case_number"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const executiveProfiles = pgTable("executive_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  title: text("title"),
  companyRole: text("company_role"),
  primaryPhone: text("primary_phone"),
  secondaryPhone: text("secondary_phone"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  publicProfile: text("public_profile").notNull().default("medium"),
  netWorthRange: text("net_worth_range"),
  industryCategory: text("industry_category"),
  mediaExposure: text("media_exposure"),
  familyMembers: text("family_members"),
  currentSecurityLevel: text("current_security_level").notNull().default("minimal"),
  hasPersonalProtection: boolean("has_personal_protection").default(false),
  hasPanicRoom: boolean("has_panic_room").default(false),
  hasArmoredVehicle: boolean("has_armored_vehicle").default(false),
  knownThreats: text("known_threats"),
  previousIncidents: text("previous_incidents"),
  restrainingOrders: text("restraining_orders"),
  annualProtectionBudget: integer("annual_protection_budget"),
  insuranceDeductible: integer("insurance_deductible"),
  dailyLossOfValue: integer("daily_loss_of_value"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const executiveLocations = pgTable("executive_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executiveProfileId: varchar("executive_profile_id").notNull().references(() => executiveProfiles.id, { onDelete: "cascade" }),
  locationType: text("location_type").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("USA"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  visitFrequency: text("visit_frequency"),
  typicalVisitTime: text("typical_visit_time"),
  predictable: boolean("predictable").default(true),
  securityRating: integer("security_rating"),
  privateProperty: boolean("private_property").default(true),
  gatedCommunity: boolean("gated_community").default(false),
  hasOnSiteSecurity: boolean("has_on_site_security").default(false),
  publiclyKnownAddress: boolean("publicly_known_address").default(false),
  mediaPhotographed: boolean("media_photographed").default(false),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const executiveTravelRoutes = pgTable("executive_travel_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executiveProfileId: varchar("executive_profile_id").notNull().references(() => executiveProfiles.id, { onDelete: "cascade" }),
  originLocationId: varchar("origin_location_id").notNull().references(() => executiveLocations.id, { onDelete: "cascade" }),
  destLocationId: varchar("dest_location_id").notNull().references(() => executiveLocations.id, { onDelete: "cascade" }),
  routeName: text("route_name"),
  frequency: text("frequency"),
  typicalTime: text("typical_time"),
  distanceMiles: real("distance_miles"),
  estimatedDuration: integer("estimated_duration"),
  routeVariation: text("route_variation"),
  transportMode: text("transport_mode"),
  vehicleType: text("vehicle_type"),
  riskLevel: text("risk_level"),
  chokePoints: text("choke_points"),
  vulnerableSegments: text("vulnerable_segments"),
  routeGeometry: text("route_geometry"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const executiveInterviews = pgTable("executive_interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executiveProfileId: varchar("executive_profile_id").notNull().references(() => executiveProfiles.id, { onDelete: "cascade" }),
  interviewDate: timestamp("interview_date").notNull(),
  interviewerUserId: varchar("interviewer_user_id").references(() => users.id, { onDelete: "set null" }),
  interviewDuration: integer("interview_duration"),
  responses: text("responses").notNull(),
  perceivedThreatLevel: integer("perceived_threat_level"),
  cooperationLevel: text("cooperation_level"),
  notes: text("notes"),
  concernsRaised: text("concerns_raised"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const executivePointsOfInterest = pgTable("executive_points_of_interest", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  executiveLocationId: varchar("executive_location_id").references(() => executiveLocations.id, { onDelete: "set null" }),
  poiType: text("poi_type").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  distanceToLocation: real("distance_to_location"),
  estimatedResponseTime: integer("estimated_response_time"),
  phoneNumber: text("phone_number"),
  hours: text("hours"),
  capabilities: text("capabilities"),
  threatLevel: text("threat_level"),
  threatNotes: text("threat_notes"),
  customCategory: text("custom_category"),
  icon: text("icon"),
  color: text("color"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const osintFindings = pgTable("osint_findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executiveProfileId: varchar("executive_profile_id").notNull().references(() => executiveProfiles.id, { onDelete: "cascade" }),
  findingType: text("finding_type").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  discoveryDate: timestamp("discovery_date").notNull(),
  publicationDate: timestamp("publication_date"),
  title: text("title"),
  summary: text("summary"),
  fullContent: text("full_content"),
  exposureLevel: text("exposure_level"),
  exposureType: text("exposure_type"),
  tags: text("tags"),
  sentiment: text("sentiment"),
  mitigationRequired: boolean("mitigation_required").default(false),
  mitigationAction: text("mitigation_action"),
  mitigationStatus: text("mitigation_status"),
  attachments: text("attachments"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const questionControlMap = pgTable("question_control_map", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => templateQuestions.id),
  controlId: varchar("control_id").notNull().references(() => controlLibrary.id),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const questionThreatMap = pgTable("question_threat_map", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => templateQuestions.id),
  threatId: varchar("threat_id").notNull().references(() => threatLibrary.id),
  impactDriver: boolean("impact_driver").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
  organizationId: true,
  organizationRole: true,
  accountTier: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertOrganizationInvitationSchema = createInsertSchema(organizationInvitations).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFacilityZoneSchema = createInsertSchema(facilityZones).omit({
  id: true,
  createdAt: true,
});

export const insertLoadingDockSchema = createInsertSchema(loadingDocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertFacilitySurveyQuestionSchema = createInsertSchema(facilitySurveyQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentQuestionSchema = createInsertSchema(assessmentQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertExecutiveInterviewResponseSchema = createInsertSchema(executiveInterviewResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertThreatLibrarySchema = createInsertSchema(threatLibrary).omit({
  id: true,
  createdAt: true,
});

export const insertControlLibrarySchema = createInsertSchema(controlLibrary).omit({
  id: true,
  createdAt: true,
});

export const insertPointOfInterestSchema = createInsertSchema(pointsOfInterest).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCrimeSourceSchema = createInsertSchema(crimeSources).omit({
  id: true,
  createdAt: true,
});

export const insertCrimeObservationSchema = createInsertSchema(crimeObservations).omit({
  id: true,
  createdAt: true,
});

export const insertSiteIncidentSchema = createInsertSchema(siteIncidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExecutiveProfileSchema = createInsertSchema(executiveProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;
export type InsertOrganizationInvitation = z.infer<typeof insertOrganizationInvitationSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;

export type FacilityZone = typeof facilityZones.$inferSelect;
export type InsertFacilityZone = z.infer<typeof insertFacilityZoneSchema>;

export type LoadingDock = typeof loadingDocks.$inferSelect;
export type InsertLoadingDock = z.infer<typeof insertLoadingDockSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type TemplateQuestion = typeof templateQuestions.$inferSelect;

export type FacilitySurveyQuestion = typeof facilitySurveyQuestions.$inferSelect;
export type InsertFacilitySurveyQuestion = z.infer<typeof insertFacilitySurveyQuestionSchema>;

export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type InsertAssessmentQuestion = z.infer<typeof insertAssessmentQuestionSchema>;

export const insertExecutiveInterviewQuestionSchema = createInsertSchema(executiveInterviewQuestions).omit({
  id: true,
  createdAt: true,
});

export type ExecutiveInterviewQuestion = typeof executiveInterviewQuestions.$inferSelect;
export type InsertExecutiveInterviewQuestion = z.infer<typeof insertExecutiveInterviewQuestionSchema>;

export type ExecutiveInterviewResponse = typeof executiveInterviewResponses.$inferSelect;
export type InsertExecutiveInterviewResponse = z.infer<typeof insertExecutiveInterviewResponseSchema>;

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

export type ThreatLibrary = typeof threatLibrary.$inferSelect;
export type InsertThreatLibrary = z.infer<typeof insertThreatLibrarySchema>;

export type ControlLibrary = typeof controlLibrary.$inferSelect;
export type InsertControlLibrary = z.infer<typeof insertControlLibrarySchema>;

export type PointOfInterest = typeof pointsOfInterest.$inferSelect;
export type InsertPointOfInterest = z.infer<typeof insertPointOfInterestSchema>;

export type CrimeSource = typeof crimeSources.$inferSelect;
export type InsertCrimeSource = z.infer<typeof insertCrimeSourceSchema>;

export type CrimeObservation = typeof crimeObservations.$inferSelect;
export type InsertCrimeObservation = z.infer<typeof insertCrimeObservationSchema>;

export type SiteIncident = typeof siteIncidents.$inferSelect;
export type InsertSiteIncident = z.infer<typeof insertSiteIncidentSchema>;

export type ExecutiveProfile = typeof executiveProfiles.$inferSelect;
export type InsertExecutiveProfile = z.infer<typeof insertExecutiveProfileSchema>;

export type AssessmentWithQuestions = Assessment & {
  facilityQuestions: FacilitySurveyQuestion[];
  questions: AssessmentQuestion[];
  threats: IdentifiedThreat[];
  riskAssets: RiskAsset[];
  riskScenarios: RiskScenario[];
  treatmentPlans: TreatmentPlan[];
  riskInsights: RiskInsight[];
  reports: Report[];
};

export const warehouseProfileSchema = z.object({
  squareFootage: z.number().optional(),
  dockCount: z.number().optional(),
  employeeCount: z.number().optional(),
  shiftsPerDay: z.number().optional(),
  inventoryValue: z.number().optional(),
  annualThroughput: z.number().optional(),
  hasHazmat: z.boolean().optional(),
  hasRefrigeration: z.boolean().optional(),
  hasHighValueGoods: z.boolean().optional(),
  securityStaffCount: z.number().optional(),
  annualTurnoverRate: z.number().optional(),
  avgHiringCost: z.number().optional(),
  annualLiabilityEstimates: z.number().optional(),
  securityIncidentsPerYear: z.number().optional(),
  brandDamageEstimate: z.number().optional(),
});

export const retailProfileSchema = z.object({
  squareFootage: z.number().optional(),
  annualRevenue: z.number().optional(),
  dailyFootTraffic: z.number().optional(),
  employeeCount: z.number().optional(),
  operatingHoursPerWeek: z.number().optional(),
  avgTransactionValue: z.number().optional(),
  inventoryValue: z.number().optional(),
  cashOnHand: z.number().optional(),
  hasPharmacy: z.boolean().optional(),
  hasHighValueMerchandise: z.boolean().optional(),
  shrinkageRate: z.number().optional(),
  annualTurnoverRate: z.number().optional(),
  avgHiringCost: z.number().optional(),
  annualLiabilityEstimates: z.number().optional(),
  securityIncidentsPerYear: z.number().optional(),
  brandDamageEstimate: z.number().optional(),
});

export const manufacturingProfileSchema = z.object({
  squareFootage: z.number().optional(),
  employeeCount: z.number().optional(),
  shiftsPerDay: z.number().optional(),
  productionValue: z.number().optional(),
  equipmentValue: z.number().optional(),
  hasHazmat: z.boolean().optional(),
  hasRobotics: z.boolean().optional(),
  hasCleanRoom: z.boolean().optional(),
  ipSensitivity: z.string().optional(),
  regulatoryBody: z.string().optional(),
  annualTurnoverRate: z.number().optional(),
  avgHiringCost: z.number().optional(),
  annualLiabilityEstimates: z.number().optional(),
  securityIncidentsPerYear: z.number().optional(),
  brandDamageEstimate: z.number().optional(),
  // Dashboard-specific field names
  annualProductionValue: z.number().optional(),
  shiftOperations: z.string().optional(),
  hazmatPresent: z.boolean().optional(),
  ipTypes: z.array(z.string()).optional(),
});

export const datacenterProfileSchema = z.object({
  squareFootage: z.number().optional(),
  rackCount: z.number().optional(),
  tierLevel: z.number().optional(),
  powerCapacity: z.number().optional(),
  criticalSystemsValue: z.number().optional(),
  dataClassification: z.string().optional(),
  hasColocation: z.boolean().optional(),
  hasDisasterRecovery: z.boolean().optional(),
  complianceFrameworks: z.array(z.string()).optional(),
  slaDowntimeCost: z.number().optional(),
  annualTurnoverRate: z.number().optional(),
  avgHiringCost: z.number().optional(),
  annualLiabilityEstimates: z.number().optional(),
  securityIncidentsPerYear: z.number().optional(),
  brandDamageEstimate: z.number().optional(),
  employeeCount: z.number().optional(),
  // Dashboard-specific field names
  tierClassification: z.string().optional(),
  uptimeSLA: z.string().optional(),
  complianceRequirements: z.array(z.string()).optional(),
});

export const officeProfileSchema = z.object({
  squareFootage: z.number().optional(),
  employeeCount: z.string().optional(),
  visitorVolume: z.string().optional(),
  floorCount: z.number().optional(),
  hasExecutivePresence: z.boolean().optional(),
  dataSensitivity: z.string().optional(),
  hasServerRoom: z.boolean().optional(),
  hasReception: z.boolean().optional(),
  parkingType: z.string().optional(),
  afterHoursAccess: z.boolean().optional(),
  annualTurnoverRate: z.number().optional(),
  avgHiringCost: z.number().optional(),
  annualLiabilityEstimates: z.number().optional(),
  securityIncidentsPerYear: z.number().optional(),
  brandDamageEstimate: z.number().optional(),
});

export type WarehouseProfile = z.infer<typeof warehouseProfileSchema>;
export type RetailProfile = z.infer<typeof retailProfileSchema>;
export type ManufacturingProfile = z.infer<typeof manufacturingProfileSchema>;
export type DatacenterProfile = z.infer<typeof datacenterProfileSchema>;
export type OfficeProfile = z.infer<typeof officeProfileSchema>;

export const reportRecipes = pgTable("report_recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  reportType: text("report_type").notNull(),
  assessmentTypes: jsonb("assessment_types").notNull(),
  sections: jsonb("sections").notNull(),
  toneSetting: text("tone_setting").notNull().default("executive"),
  branding: jsonb("branding"),
  pageLayout: jsonb("page_layout"),
  isActive: boolean("is_active").notNull().default(true),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const narrativePrompts = pgTable("narrative_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: text("section_id").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  userPromptTemplate: text("user_prompt_template").notNull(),
  outputConstraints: jsonb("output_constraints"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const generatedReports = pgTable("generated_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  recipeId: varchar("recipe_id").references(() => reportRecipes.id),
  reportType: text("report_type").notNull(),
  status: text("status").notNull().default("pending"),
  pdfUrl: text("pdf_url"),
  dataSnapshot: jsonb("data_snapshot"),
  generationLog: jsonb("generation_log"),
  generatedAt: timestamp("generated_at"),
  generatedBy: varchar("generated_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const interviewFindings = pgTable("interview_findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  source: text("source").notNull(),
  sourceRole: text("source_role"),
  interviewDate: timestamp("interview_date"),
  finding: text("finding").notNull(),
  directQuote: text("direct_quote"),
  linkedVulnerabilityId: varchar("linked_vulnerability_id"),
  linkedThreatDomainId: varchar("linked_threat_domain_id"),
  severity: text("severity").notNull().default("medium"),
  usedInReport: boolean("used_in_report").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const documentedIncidents = pgTable("documented_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  description: text("description").notNull(),
  incidentDate: timestamp("incident_date"),
  source: text("source"),
  sourceRole: text("source_role"),
  threatDomainId: varchar("threat_domain_id"),
  severity: text("severity").notNull().default("medium"),
  actionTaken: text("action_taken"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertReportRecipeSchema = createInsertSchema(reportRecipes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNarrativePromptSchema = createInsertSchema(narrativePrompts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGeneratedReportSchema = createInsertSchema(generatedReports).omit({ id: true, createdAt: true });
export const insertInterviewFindingSchema = createInsertSchema(interviewFindings).omit({ id: true, createdAt: true });
export const insertDocumentedIncidentSchema = createInsertSchema(documentedIncidents).omit({ id: true, createdAt: true });

export type InsertReportRecipe = z.infer<typeof insertReportRecipeSchema>;
export type InsertNarrativePrompt = z.infer<typeof insertNarrativePromptSchema>;
export type InsertGeneratedReport = z.infer<typeof insertGeneratedReportSchema>;
export type InsertInterviewFinding = z.infer<typeof insertInterviewFindingSchema>;
export type InsertDocumentedIncident = z.infer<typeof insertDocumentedIncidentSchema>;

export type ReportRecipe = typeof reportRecipes.$inferSelect;
export type NarrativePrompt = typeof narrativePrompts.$inferSelect;
export type GeneratedReport = typeof generatedReports.$inferSelect;
export type InterviewFinding = typeof interviewFindings.$inferSelect;
export type DocumentedIncident = typeof documentedIncidents.$inferSelect;
