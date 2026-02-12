ALTER TABLE "subscription_plans" ADD COLUMN "tier" varchar(50) DEFAULT 'basic';--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "max_classes_per_week" integer DEFAULT 3;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "max_check_ins_per_day" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_trainer_access" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_personal_training" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_progress_tracking" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_achievements" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "trainers" ADD COLUMN "is_active" boolean DEFAULT true;