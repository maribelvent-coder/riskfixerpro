CREATE TABLE IF NOT EXISTS "crime_data_imports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"data_source" text NOT NULL,
	"import_date" timestamp DEFAULT now() NOT NULL,
	"data_time_period" text,
	"coverage_area" text,
	"city" text,
	"county" text,
	"state" text,
	"zip_codes" text,
	"crime_statistics" text NOT NULL,
	"national_average" text,
	"state_average" text,
	"comparison_rating" text,
	"original_file_url" text,
	"original_file_name" text,
	"data_quality" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crime_incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crime_data_import_id" varchar,
	"assessment_id" varchar NOT NULL,
	"incident_type" text NOT NULL,
	"incident_category" text,
	"incident_date" timestamp,
	"incident_time" text,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"address" text,
	"distance_to_executive_location" real,
	"nearest_executive_location_id" varchar,
	"description" text,
	"severity" text,
	"source_agency" text,
	"case_number" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crime_observations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crime_source_id" varchar NOT NULL,
	"violent_crimes" jsonb,
	"property_crimes" jsonb,
	"other_crimes" jsonb,
	"overall_crime_index" integer,
	"national_average" jsonb,
	"state_average" jsonb,
	"comparison_rating" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crime_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" varchar,
	"assessment_id" varchar,
	"data_source" text NOT NULL,
	"import_date" timestamp DEFAULT now() NOT NULL,
	"data_time_period" text,
	"coverage_area" jsonb,
	"city" text,
	"county" text,
	"state" text,
	"zip_codes" jsonb,
	"original_file_url" text,
	"original_file_name" text,
	"data_quality" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "executive_interviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"executive_profile_id" varchar NOT NULL,
	"interview_date" timestamp NOT NULL,
	"interviewer_user_id" varchar,
	"interview_duration" integer,
	"responses" text NOT NULL,
	"perceived_threat_level" integer,
	"cooperation_level" text,
	"notes" text,
	"concerns_raised" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "executive_locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"executive_profile_id" varchar NOT NULL,
	"location_type" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text DEFAULT 'USA' NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"visit_frequency" text,
	"typical_visit_time" text,
	"predictable" boolean DEFAULT true,
	"security_rating" integer,
	"private_property" boolean DEFAULT true,
	"gated_community" boolean DEFAULT false,
	"has_on_site_security" boolean DEFAULT false,
	"publicly_known_address" boolean DEFAULT false,
	"media_photographed" boolean DEFAULT false,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "executive_points_of_interest" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"executive_location_id" varchar,
	"poi_type" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"distance_to_location" real,
	"estimated_response_time" integer,
	"phone_number" text,
	"hours" text,
	"capabilities" text,
	"threat_level" text,
	"threat_notes" text,
	"custom_category" text,
	"icon" text,
	"color" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "executive_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" varchar NOT NULL,
	"full_name" text NOT NULL,
	"title" text,
	"company_role" text,
	"primary_phone" text,
	"secondary_phone" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"public_profile" text DEFAULT 'medium' NOT NULL,
	"net_worth_range" text,
	"industry_category" text,
	"media_exposure" text,
	"family_members" text,
	"current_security_level" text DEFAULT 'minimal' NOT NULL,
	"has_personal_protection" boolean DEFAULT false,
	"has_panic_room" boolean DEFAULT false,
	"has_armored_vehicle" boolean DEFAULT false,
	"known_threats" text,
	"previous_incidents" text,
	"restraining_orders" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "executive_travel_routes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"executive_profile_id" varchar NOT NULL,
	"origin_location_id" varchar NOT NULL,
	"dest_location_id" varchar NOT NULL,
	"route_name" text,
	"frequency" text,
	"typical_time" text,
	"distance_miles" real,
	"estimated_duration" integer,
	"route_variation" text,
	"transport_mode" text,
	"vehicle_type" text,
	"risk_level" text,
	"choke_points" text,
	"vulnerable_segments" text,
	"route_geometry" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "osint_findings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"executive_profile_id" varchar NOT NULL,
	"finding_type" text NOT NULL,
	"source" text NOT NULL,
	"source_url" text,
	"discovery_date" timestamp NOT NULL,
	"publication_date" timestamp,
	"title" text,
	"summary" text,
	"full_content" text,
	"exposure_level" text,
	"exposure_type" text,
	"tags" text,
	"sentiment" text,
	"mitigation_required" boolean DEFAULT false,
	"mitigation_action" text,
	"mitigation_status" text,
	"attachments" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "points_of_interest" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" varchar,
	"assessment_id" varchar,
	"poi_type" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"distance_to_site" text,
	"estimated_response_time" integer,
	"phone_number" text,
	"hours" text,
	"capabilities" jsonb,
	"threat_level" text,
	"threat_notes" text,
	"custom_category" text,
	"icon" text,
	"color" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_control_map" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" varchar NOT NULL,
	"control_id" varchar NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_threat_map" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" varchar NOT NULL,
	"threat_id" varchar NOT NULL,
	"impact_driver" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" varchar NOT NULL,
	"incident_date" timestamp NOT NULL,
	"incident_type" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"description" text NOT NULL,
	"location_within_site" text,
	"outcome" text DEFAULT 'unresolved',
	"police_notified" boolean DEFAULT false,
	"police_report_number" text,
	"estimated_cost" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "control_library" ADD COLUMN IF NOT EXISTS "weight" real;--> statement-breakpoint
ALTER TABLE "facility_survey_questions" ADD COLUMN IF NOT EXISTS "control_library_id" varchar;--> statement-breakpoint
ALTER TABLE "facility_survey_questions" ADD COLUMN IF NOT EXISTS "conditional_on_question_id" text;--> statement-breakpoint
ALTER TABLE "facility_survey_questions" ADD COLUMN IF NOT EXISTS "show_when_answer" text;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD COLUMN IF NOT EXISTS "threat_library_id" varchar;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD COLUMN IF NOT EXISTS "likelihood_score" real;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD COLUMN IF NOT EXISTS "impact_score" real;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD COLUMN IF NOT EXISTS "inherent_risk" real;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD COLUMN IF NOT EXISTS "control_effectiveness" real;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD COLUMN IF NOT EXISTS "residual_risk" real;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "latitude" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "longitude" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "geocode_provider" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "geocode_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "geocode_timestamp" timestamp;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "normalized_address" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "county" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "timezone" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "template_questions" ADD COLUMN IF NOT EXISTS "control_library_id" varchar;--> statement-breakpoint
ALTER TABLE "template_questions" ADD COLUMN IF NOT EXISTS "conditional_on_question_id" text;--> statement-breakpoint
ALTER TABLE "template_questions" ADD COLUMN IF NOT EXISTS "show_when_answer" text;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD COLUMN IF NOT EXISTS "projected_risk_reduction" real;--> statement-breakpoint
ALTER TABLE "crime_data_imports" ADD CONSTRAINT "crime_data_imports_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crime_incidents" ADD CONSTRAINT "crime_incidents_crime_data_import_id_crime_data_imports_id_fk" FOREIGN KEY ("crime_data_import_id") REFERENCES "public"."crime_data_imports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crime_incidents" ADD CONSTRAINT "crime_incidents_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crime_incidents" ADD CONSTRAINT "crime_incidents_nearest_executive_location_id_executive_locations_id_fk" FOREIGN KEY ("nearest_executive_location_id") REFERENCES "public"."executive_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crime_observations" ADD CONSTRAINT "crime_observations_crime_source_id_crime_sources_id_fk" FOREIGN KEY ("crime_source_id") REFERENCES "public"."crime_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crime_sources" ADD CONSTRAINT "crime_sources_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crime_sources" ADD CONSTRAINT "crime_sources_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_interviews" ADD CONSTRAINT "executive_interviews_executive_profile_id_executive_profiles_id_fk" FOREIGN KEY ("executive_profile_id") REFERENCES "public"."executive_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_interviews" ADD CONSTRAINT "executive_interviews_interviewer_user_id_users_id_fk" FOREIGN KEY ("interviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_locations" ADD CONSTRAINT "executive_locations_executive_profile_id_executive_profiles_id_fk" FOREIGN KEY ("executive_profile_id") REFERENCES "public"."executive_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_points_of_interest" ADD CONSTRAINT "executive_points_of_interest_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_points_of_interest" ADD CONSTRAINT "executive_points_of_interest_executive_location_id_executive_locations_id_fk" FOREIGN KEY ("executive_location_id") REFERENCES "public"."executive_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_profiles" ADD CONSTRAINT "executive_profiles_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_travel_routes" ADD CONSTRAINT "executive_travel_routes_executive_profile_id_executive_profiles_id_fk" FOREIGN KEY ("executive_profile_id") REFERENCES "public"."executive_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_travel_routes" ADD CONSTRAINT "executive_travel_routes_origin_location_id_executive_locations_id_fk" FOREIGN KEY ("origin_location_id") REFERENCES "public"."executive_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_travel_routes" ADD CONSTRAINT "executive_travel_routes_dest_location_id_executive_locations_id_fk" FOREIGN KEY ("dest_location_id") REFERENCES "public"."executive_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "osint_findings" ADD CONSTRAINT "osint_findings_executive_profile_id_executive_profiles_id_fk" FOREIGN KEY ("executive_profile_id") REFERENCES "public"."executive_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_control_map" ADD CONSTRAINT "question_control_map_question_id_template_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."template_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_control_map" ADD CONSTRAINT "question_control_map_control_id_control_library_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."control_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_threat_map" ADD CONSTRAINT "question_threat_map_question_id_template_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."template_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_threat_map" ADD CONSTRAINT "question_threat_map_threat_id_threat_library_id_fk" FOREIGN KEY ("threat_id") REFERENCES "public"."threat_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_incidents" ADD CONSTRAINT "site_incidents_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_survey_questions" ADD CONSTRAINT "facility_survey_questions_control_library_id_control_library_id_fk" FOREIGN KEY ("control_library_id") REFERENCES "public"."control_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_scenarios" ADD CONSTRAINT "risk_scenarios_threat_library_id_threat_library_id_fk" FOREIGN KEY ("threat_library_id") REFERENCES "public"."threat_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_questions" ADD CONSTRAINT "template_questions_control_library_id_control_library_id_fk" FOREIGN KEY ("control_library_id") REFERENCES "public"."control_library"("id") ON DELETE no action ON UPDATE no action;