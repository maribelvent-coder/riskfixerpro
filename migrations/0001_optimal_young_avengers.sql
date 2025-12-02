CREATE TABLE "control_library" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"control_type" text NOT NULL,
	"description" text NOT NULL,
	"base_weight" integer,
	"reduction_percentage" integer,
	"implementation_notes" text,
	"estimated_cost" text,
	"maintenance_level" text,
	"training_required" boolean DEFAULT false,
	"maintenance_required" boolean DEFAULT true,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "threat_library" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"description" text NOT NULL,
	"typical_likelihood" text,
	"typical_impact" text,
	"asis_code" text,
	"mitigation" text,
	"examples" text[],
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
