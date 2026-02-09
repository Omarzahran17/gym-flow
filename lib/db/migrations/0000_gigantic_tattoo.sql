CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(255),
	"criteria_type" varchar(100),
	"criteria_value" integer,
	"points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
	"check_in_time" timestamp DEFAULT now(),
	"date" date DEFAULT now(),
	"method" varchar(50) DEFAULT 'qr_code',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "class_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer,
	"member_id" integer,
	"booking_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'confirmed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "class_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"room" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"trainer_id" integer,
	"max_capacity" integer DEFAULT 20,
	"duration_minutes" integer DEFAULT 60,
	"description" text,
	"color" varchar(50) DEFAULT '#3b82f6',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"purchase_date" date,
	"warranty_expiry" date,
	"last_maintenance" date,
	"next_maintenance" date,
	"status" varchar(50) DEFAULT 'active',
	"qr_code" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "equipment_maintenance" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer,
	"maintenance_date" date NOT NULL,
	"description" text,
	"cost" numeric(10, 2),
	"performed_by" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"muscle_group" varchar(100),
	"description" text,
	"default_video_url" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
	"date" date NOT NULL,
	"weight" numeric(5, 2),
	"body_fat" numeric(5, 2),
	"chest" numeric(5, 2),
	"waist" numeric(5, 2),
	"hips" numeric(5, 2),
	"arms" numeric(5, 2),
	"thighs" numeric(5, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
	"achievement_id" integer,
	"earned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
	"stripe_subscription_id" varchar(255),
	"plan_id" integer,
	"status" varchar(50) DEFAULT 'active',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"ended_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"seats" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"phone" varchar(50),
	"emergency_contact" varchar(255),
	"health_notes" text,
	"join_date" timestamp DEFAULT now(),
	"status" varchar(50) DEFAULT 'active',
	"qr_code" varchar(255),
	"stripe_customer_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "members_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" varchar(255) NOT NULL,
	"receiver_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personal_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
	"exercise_name" varchar(255) NOT NULL,
	"weight" numeric(10, 2),
	"reps" integer,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plan_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer,
	"exercise_id" integer,
	"sets" integer,
	"reps" varchar(50),
	"weight" numeric(10, 2),
	"rest_seconds" integer,
	"notes" text,
	"order_index" integer DEFAULT 0,
	"custom_video_url" varchar(500),
	"custom_video_blob_url" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
	"date" date NOT NULL,
	"url" varchar(500),
	"blob_url" varchar(500),
	"type" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"stripe_price_id" varchar(255),
	"stripe_annual_price_id" varchar(255),
	"interval" varchar(50) DEFAULT 'month',
	"price" numeric(10, 2),
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"bio" text,
	"specialization" varchar(255),
	"certifications" text,
	"max_clients" integer DEFAULT 20,
	"hourly_rate" numeric(10, 2),
	"video_storage_quota" integer DEFAULT 1073741824,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "trainers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"trainer_id" integer,
	"member_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" date,
	"end_date" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_bookings" ADD CONSTRAINT "class_bookings_schedule_id_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."class_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_bookings" ADD CONSTRAINT "class_bookings_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_maintenance" ADD CONSTRAINT "equipment_maintenance_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_achievements" ADD CONSTRAINT "member_achievements_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_achievements" ADD CONSTRAINT "member_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_subscriptions" ADD CONSTRAINT "member_subscriptions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_subscriptions" ADD CONSTRAINT "member_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_plan_id_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;