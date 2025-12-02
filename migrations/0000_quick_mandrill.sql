CREATE TABLE "assessment_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"template_question_id" text,
	"question_id" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"question" text NOT NULL,
	"best_practice" text,
	"rationale" text,
	"importance" text,
	"order_index" integer,
	"type" text NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"response" jsonb,
	"notes" text,
	"evidence" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" varchar,
	"site_id" varchar,
	"template_id" text,
	"survey_paradigm" text DEFAULT 'facility' NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"assessor" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"risk_level" text,
	"business_objectives" jsonb,
	"asset_types" text[],
	"risk_criteria" jsonb,
	"facility_survey_completed" boolean DEFAULT false,
	"facility_survey_completed_at" timestamp,
	"risk_assessment_completed" boolean DEFAULT false,
	"risk_assessment_completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "controls" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"vulnerability_id" varchar,
	"risk_scenario_id" varchar,
	"description" text NOT NULL,
	"control_type" text NOT NULL,
	"effectiveness" integer,
	"notes" text,
	"treatment_type" text,
	"primary_effect" text,
	"treatment_effectiveness" integer,
	"action_description" text,
	"responsible_party" text,
	"target_date" text,
	"estimated_cost" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "executive_interview_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_number" integer NOT NULL,
	"category" text NOT NULL,
	"question" text NOT NULL,
	"response_type" text DEFAULT 'text' NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "executive_interview_questions_question_number_unique" UNIQUE("question_number")
);
--> statement-breakpoint
CREATE TABLE "executive_interview_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"question_id" varchar NOT NULL,
	"yes_no_response" boolean,
	"text_response" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "facility_survey_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"template_question_id" text,
	"category" text NOT NULL,
	"subcategory" text,
	"question" text NOT NULL,
	"best_practice" text,
	"rationale" text,
	"importance" text,
	"order_index" integer,
	"standard" text,
	"type" text NOT NULL,
	"response" jsonb,
	"notes" text,
	"evidence" text[],
	"recommendations" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "facility_zones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" varchar NOT NULL,
	"name" text NOT NULL,
	"zone_type" text NOT NULL,
	"floor_number" integer,
	"security_level" text DEFAULT 'public' NOT NULL,
	"description" text,
	"access_requirements" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "identified_threats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"threat_type" text NOT NULL,
	"threat_name" text NOT NULL,
	"description" text NOT NULL,
	"affected_assets" text[],
	"vulnerabilities" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"invited_by" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"accepted_at" timestamp,
	CONSTRAINT "organization_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"account_tier" text DEFAULT 'basic' NOT NULL,
	"owner_id" varchar NOT NULL,
	"max_members" integer DEFAULT 2 NOT NULL,
	"max_sites" integer DEFAULT 2 NOT NULL,
	"max_assessments" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"format" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"file_path" text,
	"file_size" text,
	"created_at" timestamp DEFAULT now(),
	"generated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "risk_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"owner" text,
	"criticality" integer NOT NULL,
	"scope" text,
	"notes" text,
	"protection_systems" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "risk_insights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"threat_id" varchar,
	"category" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"recommendation" text NOT NULL,
	"impact" integer NOT NULL,
	"probability" integer NOT NULL,
	"risk_score" integer NOT NULL,
	"risk_matrix" text NOT NULL,
	"treatment_strategy" text,
	"treatment_plan" text,
	"priority" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "risk_scenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"asset_id" varchar,
	"scenario" text NOT NULL,
	"asset" text NOT NULL,
	"threat_type" text,
	"threat_description" text,
	"vulnerability_description" text,
	"likelihood" text NOT NULL,
	"impact" text NOT NULL,
	"risk_level" text NOT NULL,
	"current_likelihood" text,
	"current_impact" text,
	"current_risk_level" text,
	"decision" text DEFAULT 'undecided',
	"risk_rating" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" varchar,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"facility_type" text,
	"contact_name" text,
	"contact_phone" text,
	"contact_email" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "template_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" text NOT NULL,
	"question_id" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"question" text NOT NULL,
	"best_practice" text,
	"rationale" text,
	"importance" text,
	"type" text DEFAULT 'yes-no' NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "treatment_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"risk_scenario_id" varchar,
	"risk" text NOT NULL,
	"threat_description" text,
	"strategy" text NOT NULL,
	"description" text NOT NULL,
	"type" text,
	"effect" text,
	"value" integer,
	"responsible" text,
	"deadline" text,
	"cost" text,
	"status" text DEFAULT 'planned',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password" text NOT NULL,
	"account_tier" text DEFAULT 'free' NOT NULL,
	"organization_id" varchar,
	"organization_role" text DEFAULT 'member',
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vulnerabilities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"risk_scenario_id" varchar,
	"description" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controls" ADD CONSTRAINT "controls_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controls" ADD CONSTRAINT "controls_vulnerability_id_vulnerabilities_id_fk" FOREIGN KEY ("vulnerability_id") REFERENCES "public"."vulnerabilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controls" ADD CONSTRAINT "controls_risk_scenario_id_risk_scenarios_id_fk" FOREIGN KEY ("risk_scenario_id") REFERENCES "public"."risk_scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_interview_responses" ADD CONSTRAINT "executive_interview_responses_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_interview_responses" ADD CONSTRAINT "executive_interview_responses_question_id_executive_interview_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."executive_interview_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_survey_questions" ADD CONSTRAINT "facility_survey_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_zones" ADD CONSTRAINT "facility_zones_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identified_threats" ADD CONSTRAINT "identified_threats_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assets" ADD CONSTRAINT "risk_assets_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_insights" ADD CONSTRAINT "risk_insights_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_insights" ADD CONSTRAINT "risk_insights_threat_id_identified_threats_id_fk" FOREIGN KEY ("threat_id") REFERENCES "public"."identified_threats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD CONSTRAINT "risk_scenarios_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD CONSTRAINT "risk_scenarios_asset_id_risk_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."risk_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_risk_scenario_id_risk_scenarios_id_fk" FOREIGN KEY ("risk_scenario_id") REFERENCES "public"."risk_scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vulnerabilities" ADD CONSTRAINT "vulnerabilities_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vulnerabilities" ADD CONSTRAINT "vulnerabilities_risk_scenario_id_risk_scenarios_id_fk" FOREIGN KEY ("risk_scenario_id") REFERENCES "public"."risk_scenarios"("id") ON DELETE no action ON UPDATE no action;