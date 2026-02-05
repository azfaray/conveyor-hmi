import { 
  pgTable, 
  boolean, 
  integer, 
  timestamp, 
  index,
  bigint // <--- 1. Import bigint
} from "drizzle-orm/pg-core";

// ----------------------------------------------------------------------
// TABLE: CONVEYOR TELEMETRY
// Strictly mapped to the ITB/IIOT/conveyor MQTT topics 
// ----------------------------------------------------------------------
export const conveyorLogs = pgTable("conveyor_logs", {
  // 2. FIX: Changed from serial to bigint to match Supabase
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // -- SENSORS (Boolean / W Bits) --
  irSensor: boolean("ir_sensor").default(false),
  inductiveSensor: boolean("inductive_sensor").default(false),
  capacitiveSensor: boolean("capacitive_sensor").default(false),
  positionInnerSensor: boolean("position_inner_sensor").default(false),
  positionOuterSensor: boolean("position_outer_sensor").default(false),

  // -- SENSORS (Data / D Registers) --
  motorSpeedSensor: integer("motor_speed_sensor").default(0),
  objectInnerCount: integer("object_inner_count").default(0),
  objectOuterCount: integer("object_outer_count").default(0),

  // -- ACTUATORS & FEEDBACK (Boolean / W Bits) --
  dlPush: boolean("dl_push").default(false),
  dlPull: boolean("dl_pull").default(false),
  ldPush: boolean("ld_push").default(false),
  ldPull: boolean("ld_pull").default(false),
  stepperInnerRotate: boolean("stepper_inner_rotate").default(false),
  stepperOuterRotate: boolean("stepper_outer_rotate").default(false),
  stepperSpeedSetting: integer("stepper_speed_setting").default(0),

}, (table) => {
  return {
    createdAtIndex: index("created_at_idx").on(table.createdAt),
  };
});