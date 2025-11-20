import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
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

export const organizationInvitations = pgTable("organization_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"), // admin, member (cannot invite owners)
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, revoked
  token: text("token").notNull().unique(), // Unique token for accepting invitation
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  acceptedAt: timestamp("accepted_at"),
});

export const sites = pgTable("sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id").references(() => organizations.id), // null for free tier users
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
  
  // Geographic Intelligence Fields
  latitude: text("latitude"), // Stored as text for precision
  longitude: text("longitude"), // Stored as text for precision
  geocodeProvider: text("geocode_provider"), // google_maps, manual, mapbox
  geocodeStatus: text("geocode_status").default("pending"), // pending, success, failed, manual
  geocodeTimestamp: timestamp("geocode_timestamp"),
  normalizedAddress: text("normalized_address"), // Provider-normalized full address
  county: text("county"), // County/region
  timezone: text("timezone"), // IANA timezone (e.g., America/New_York)
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const facilityZones = pgTable("facility_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").notNull().references(() => sites.id),
  name: text("name").notNull(), // e.g., "Main Entrance", "Server Room", "Parking Lot A"
  zoneType: text("zone_type").notNull(), // perimeter, entry, lobby, office, server_room, storage, parking, loading_dock, production, restricted
  floorNumber: integer("floor_number"), // For multi-story buildings
  securityLevel: text("security_level").notNull().default("public"), // public, restricted, controlled, high_security
  description: text("description"), // Additional details about the zone
  accessRequirements: text("access_requirements"), // Badge level, escort required, etc.
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Points of Interest - Emergency services, threats, custom locations
export const pointsOfInterest = pgTable("points_of_interest", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").references(() => sites.id), // null for assessment-specific POIs
  assessmentId: varchar("assessment_id").references(() => assessments.id), // null for site-level POIs
  
  poiType: text("poi_type").notNull(), // police_station, fire_station, hospital, er, threat, custom
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  
  // Distance and Response Time
  distanceToSite: text("distance_to_site"), // Miles from site, stored as text for precision
  estimatedResponseTime: integer("estimated_response_time"), // Minutes
  
  // POI Details
  phoneNumber: text("phone_number"),
  hours: text("hours"),
  capabilities: jsonb("capabilities"), // For hospitals: {trauma_level, specialties}, For police: {jurisdiction}
  
  // Threat Assessment (for threat-type POIs)
  threatLevel: text("threat_level"), // low, medium, high, critical
  threatNotes: text("threat_notes"),
  
  // Custom Fields
  customCategory: text("custom_category"),
  icon: text("icon"), // Icon name for map display
  color: text("color"), // Hex color for map display
  
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Crime Data Sources - Tracks where crime data came from
export const crimeSources = pgTable("crime_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").references(() => sites.id), // null for assessment-specific sources
  assessmentId: varchar("assessment_id").references(() => assessments.id), // null for site-level sources
  
  dataSource: text("data_source").notNull(), // cap_index, fbi_ucr, local_pd, manual_entry, pdf_import
  importDate: timestamp("import_date").default(sql`now()`).notNull(),
  dataTimePeriod: text("data_time_period"), // e.g., "2024 Annual", "Q3 2024"
  
  // Geographic Coverage
  coverageArea: jsonb("coverage_area"), // GeoJSON Polygon (optional)
  city: text("city"),
  county: text("county"),
  state: text("state"),
  zipCodes: jsonb("zip_codes"), // JSON array of zip codes
  
  // Original Files (for PDF imports)
  originalFileUrl: text("original_file_url"),
  originalFileName: text("original_file_name"),
  
  // Metadata
  dataQuality: text("data_quality"), // verified, estimated, preliminary, unverified
  notes: text("notes"),
  
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Crime Observations - Actual crime statistics data
export const crimeObservations = pgTable("crime_observations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crimeSourceId: varchar("crime_source_id").notNull().references(() => crimeSources.id),
  
  // Crime Statistics (JSON format with standardized structure)
  violentCrimes: jsonb("violent_crimes"), // {total, rate_per_100k, breakdown: {murder, assault, robbery, rape}}
  propertyCrimes: jsonb("property_crimes"), // {total, rate_per_100k, breakdown: {burglary, theft, auto_theft}}
  otherCrimes: jsonb("other_crimes"), // {drug_offenses, dui, vandalism, etc.}
  
  // Overall Index (0-100 scale, 100 = highest crime)
  overallCrimeIndex: integer("overall_crime_index"), // CAP Index style rating
  
  // Comparative Data
  nationalAverage: jsonb("national_average"), // Comparison metrics
  stateAverage: jsonb("state_average"), // Comparison metrics
  comparisonRating: text("comparison_rating"), // very_high, high, average, low, very_low
  
  // Time Period
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Site Incidents - Actual security events that occurred at a specific site
export const siteIncidents = pgTable("site_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: varchar("site_id").notNull().references(() => sites.id),
  
  // When and what
  incidentDate: timestamp("incident_date").notNull(),
  incidentType: text("incident_type").notNull(), // break-in, theft, vandalism, trespassing, assault, robbery, fire, flood, other
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  
  // Details
  description: text("description").notNull(), // What happened
  locationWithinSite: text("location_within_site"), // Specific area/zone (e.g., "Parking Lot A", "Server Room")
  
  // Outcome and Response
  outcome: text("outcome").default("unresolved"), // resolved, unresolved, ongoing, under_investigation
  policeNotified: boolean("police_notified").default(false),
  policeReportNumber: text("police_report_number"),
  
  // Financial Impact
  estimatedCost: integer("estimated_cost"), // Damage/loss in dollars
  
  // Additional Information
  notes: text("notes"),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id").references(() => organizations.id), // null for free tier users
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
  controlLibraryId: varchar("control_library_id").references(() => controlLibrary.id), // Link to control_library for risk calculation
  conditionalOnQuestionId: text("conditional_on_question_id"), // The questionId this question depends on (e.g., "1.1")
  showWhenAnswer: text("show_when_answer"), // The answer value that triggers showing this question (e.g., "yes")
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Question-Threat Mapping - Links survey questions to the threats they help assess/mitigate
export const questionThreatMap = pgTable("question_threat_map", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => templateQuestions.id),
  threatId: varchar("threat_id").notNull().references(() => threatLibrary.id),
  impactDriver: boolean("impact_driver").notNull().default(true), // Does this question affect this threat's likelihood or impact?
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Question-Control Mapping - Links survey questions to the controls they assess
export const questionControlMap = pgTable("question_control_map", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => templateQuestions.id),
  controlId: varchar("control_id").notNull().references(() => controlLibrary.id),
  isPrimary: boolean("is_primary").notNull().default(false), // Primary control for this question
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
  type: text("type").notNull(), // condition, measurement, yes-no, rating, text
  response: jsonb("response"), // Condition, measurements, ratings
  notes: text("notes"),
  evidence: text("evidence").array(), // Photo evidence
  recommendations: text("recommendations").array(), // Immediate fixes needed
  controlLibraryId: varchar("control_library_id").references(() => controlLibrary.id), // Link to control_library for risk calculation
  conditionalOnQuestionId: text("conditional_on_question_id"), // The questionId this question depends on (e.g., "1.1")
  showWhenAnswer: text("show_when_answer"), // The answer value that triggers showing this question (e.g., "yes")
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
  threatLibraryId: varchar("threat_library_id").references(() => threatLibrary.id), // Link to threat library
  threatDescription: text("threat_description"), // Specific threat
  vulnerabilityDescription: text("vulnerability_description"), // What makes this possible
  
  // LEGACY TEXT-BASED RISK (kept for backward compatibility)
  likelihood: text("likelihood").notNull(), // "very-low", "low", "medium", "high", "very-high"
  impact: text("impact").notNull(), // "negligible", "minor", "moderate", "major", "catastrophic"
  riskLevel: text("risk_level").notNull(), // "Low", "Medium", "High", "Critical" (auto-calculated)
  currentLikelihood: text("current_likelihood"), 
  currentImpact: text("current_impact"),
  currentRiskLevel: text("current_risk_level"),
  
  // "NO BS" NUMERIC RISK CALCULATIONS
  likelihoodScore: real("likelihood_score"), // L: 1-5 numeric scale
  impactScore: real("impact_score"), // I: 1-5 numeric scale (from asset criticality)
  inherentRisk: real("inherent_risk"), // R_inh = L × I (range 1-25)
  controlEffectiveness: real("control_effectiveness"), // Ce: 0.0 - 0.95 (sum of control weights × fidelity)
  residualRisk: real("residual_risk"), // R_res = R_inh × (1 - Ce)
  
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
  
  // "No BS" risk reduction calculation
  projectedRiskReduction: real("projected_risk_reduction"), // Estimated reduction in residual risk score (for before/after visualization)
  
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

// Threat Library - Master list of common security threats
export const threatLibrary = pgTable("threat_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "Unauthorized Access", "Active Shooter", etc.
  category: text("category").notNull(), // "Physical Intrusion", "Theft", "Vandalism", "Workplace Violence", "Natural Disaster", "Cyber-Physical", "Espionage", "Executive Protection"
  subcategory: text("subcategory"), // More specific categorization
  description: text("description").notNull(), // Detailed threat description
  typicalLikelihood: text("typical_likelihood"), // Typical likelihood level for this threat
  typicalImpact: text("typical_impact"), // Typical impact level for this threat
  asisCode: text("asis_code"), // ASIS International reference code
  mitigation: text("mitigation"), // Common mitigation strategies
  examples: text("examples").array(), // Real-world examples
  active: boolean("active").notNull().default(true), // Can be disabled without deletion
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Control Library - Master list of security controls
export const controlLibrary = pgTable("control_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "CCTV System", "Access Badges", etc.
  category: text("category").notNull(), // "Access Control", "Surveillance", "Physical Barriers", "Security Personnel", "Procedural Controls", "Environmental Design", "Cyber-Physical Security"
  controlType: text("control_type").notNull(), // "Detective", "Preventive", "Corrective", "Deterrent" or "PREVENTATIVE", "DETECTIVE", "PROCEDURAL", "ACTIVE"
  description: text("description").notNull(), // Detailed control description
  baseWeight: integer("base_weight"), // Effectiveness baseline (1-5) - LEGACY
  weight: real("weight"), // "No BS" weight (0.10, 0.20, 0.40, 0.50) for risk calculations
  reductionPercentage: integer("reduction_percentage"), // Typical risk reduction (0-100)
  implementationNotes: text("implementation_notes"), // Best practices for implementation
  estimatedCost: text("estimated_cost"), // Typical cost range
  maintenanceLevel: text("maintenance_level"), // Low, Medium, High
  trainingRequired: boolean("training_required").default(false),
  maintenanceRequired: boolean("maintenance_required").default(true),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
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
}).extend({
  templateId: z.string().min(1, "Template selection is required"),
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

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;
export const insertOrganizationInvitationSchema = createInsertSchema(organizationInvitations).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
});
export type InsertOrganizationInvitation = z.infer<typeof insertOrganizationInvitationSchema>;

export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;

export const insertFacilityZoneSchema = createInsertSchema(facilityZones).omit({
  id: true,
  createdAt: true,
});
export type FacilityZone = typeof facilityZones.$inferSelect;
export type InsertFacilityZone = z.infer<typeof insertFacilityZoneSchema>;

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
