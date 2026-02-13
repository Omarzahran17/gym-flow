CREATE TABLE "trainer_attendance" (
	"id" serial PRIMARY KEY,
	"trainer_id" integer REFERENCES "trainers" ("id"),
	"check_in_time" timestamp DEFAULT now(),
	"check_out_time" timestamp,
	"date" date DEFAULT now(),
	"status" varchar(50) DEFAULT 'checked_in',
	"created_at" timestamp DEFAULT now()
);

CREATE INDEX "trainer_attendance_trainer_id_idx" ON "trainer_attendance" ("trainer_id");
CREATE INDEX "trainer_attendance_date_idx" ON "trainer_attendance" ("date");
