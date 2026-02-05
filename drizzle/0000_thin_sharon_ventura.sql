CREATE TABLE "conveyor_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ir_sensor" boolean DEFAULT false,
	"inductive_sensor" boolean DEFAULT false,
	"capacitive_sensor" boolean DEFAULT false,
	"position_inner_sensor" boolean DEFAULT false,
	"position_outer_sensor" boolean DEFAULT false,
	"motor_speed_sensor" integer DEFAULT 0,
	"object_inner_count" integer DEFAULT 0,
	"object_outer_count" integer DEFAULT 0,
	"dl_push" boolean DEFAULT false,
	"dl_pull" boolean DEFAULT false,
	"ld_push" boolean DEFAULT false,
	"ld_pull" boolean DEFAULT false,
	"stepper_inner_rotate" boolean DEFAULT false,
	"stepper_outer_rotate" boolean DEFAULT false,
	"stepper_speed_setting" integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "conveyor_logs" USING btree ("created_at");