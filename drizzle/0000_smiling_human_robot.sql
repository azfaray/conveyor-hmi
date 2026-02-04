CREATE TYPE "public"."motor_identifier" AS ENUM('stepper_1', 'stepper_2');--> statement-breakpoint
CREATE TYPE "public"."point_state" AS ENUM('empty', 'occupied', 'occupied_metallic');--> statement-breakpoint
CREATE TABLE "machine_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"la1_forward" boolean NOT NULL,
	"la1_backward" boolean NOT NULL,
	"la2_forward" boolean NOT NULL,
	"la2_backward" boolean NOT NULL,
	"stepper1_relay" boolean NOT NULL,
	"stepper2_relay" boolean NOT NULL,
	"ir_relay" boolean NOT NULL,
	"inductive_relay" boolean NOT NULL,
	"capacitive_relay" boolean NOT NULL,
	"ir_sensor" boolean NOT NULL,
	"inductive_sensor" boolean NOT NULL,
	"capacitive_sensor" boolean NOT NULL,
	"stepper1_rpm" real NOT NULL,
	"stepper1_pos" real NOT NULL,
	"stepper2_rpm" real NOT NULL,
	"stepper2_pos" real NOT NULL,
	"is_power_live" boolean NOT NULL,
	"outer_point_1" "point_state" NOT NULL,
	"outer_point_2" "point_state" NOT NULL,
	"outer_point_3" "point_state" NOT NULL,
	"outer_point_4" "point_state" NOT NULL,
	"outer_point_5" "point_state" NOT NULL,
	"inner_point_1_occupied" boolean NOT NULL,
	"inner_point_2_occupied" boolean NOT NULL,
	"inner_point_3_occupied" boolean NOT NULL,
	"inner_point_4_occupied" boolean NOT NULL,
	"inner_point_5_occupied" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stepper_drift_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"motor_id" "motor_identifier" NOT NULL,
	"commanded_position" real NOT NULL,
	"drift_value" real NOT NULL
);
--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "machine_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "motor_time_idx" ON "stepper_drift_logs" USING btree ("motor_id","created_at");