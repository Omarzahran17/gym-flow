CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workout_plan_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer,
	"member_id" integer,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "workout_plans" DROP CONSTRAINT "workout_plans_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emergency_contact" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "health_notes" text;--> statement-breakpoint
ALTER TABLE "workout_plan_assignments" ADD CONSTRAINT "workout_plan_assignments_plan_id_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_assignments" ADD CONSTRAINT "workout_plan_assignments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" DROP COLUMN "member_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");