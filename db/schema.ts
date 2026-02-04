import { 
  pgTable, 
  serial, 
  boolean, 
  integer, 
  timestamp, 
  index 
} from "drizzle-orm/pg-core";

// ----------------------------------------------------------------------
// TABLE: CONVEYOR TELEMETRY
// Strictly mapped to the ITB/IIOT/conveyor MQTT topics 
// ----------------------------------------------------------------------
export const conveyorLogs = pgTable("conveyor_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // -- SENSORS (Boolean / W Bits) --
  // Topic: ITB/IIOT/conveyor/sensor/ir/state
  irSensor: boolean("ir_sensor").default(false),
  
  // Topic: ITB/IIOT/conveyor/sensor/inductive/state
  inductiveSensor: boolean("inductive_sensor").default(false),
  
  // Topic: ITB/IIOT/conveyor/sensor/capacitive/state
  capacitiveSensor: boolean("capacitive_sensor").default(false),
  
  // Topic: ITB/IIOT/conveyor/sensor/position_inner/state
  positionInnerSensor: boolean("position_inner_sensor").default(false),
  
  // Topic: ITB/IIOT/conveyor/sensor/position_outer/state
  positionOuterSensor: boolean("position_outer_sensor").default(false),

  // -- SENSORS (Data / D Registers) --
  // Topic: ITB/IIOT/conveyor/sensor/motor_speed/state (Address: D10)
  motorSpeedSensor: integer("motor_speed_sensor").default(0),

  // Topic: ITB/IIOT/conveyor/sensor/object_inner/state (Address: D120)
  objectInnerCount: integer("object_inner_count").default(0),

  // Topic: ITB/IIOT/conveyor/sensor/object_outer/state (Address: D130)
  objectOuterCount: integer("object_outer_count").default(0),

  // -- ACTUATORS & FEEDBACK (Boolean / W Bits) --
  // Note: MQTT topics exist for both 'actuator' and 'feedback', but they map 
  // to the same PLC addresses (e.g., W5.00). We store the consolidated state here.

  // Topic: .../actuator/DL/push (Address: W5.00)
  dlPush: boolean("dl_push").default(false),

  // Topic: .../actuator/OL/pull (Address: W5.01) -> Renamed to dl_pull to match pairing
  dlPull: boolean("dl_pull").default(false),

  // Topic: .../actuator/LD/push (Address: W5.02)
  ldPush: boolean("ld_push").default(false),

  // Topic: .../actuator/LD/pull (Address: W5.03)
  ldPull: boolean("ld_pull").default(false),

  // Topic: .../actuator/stepper/inner (Address: W5.04)
  stepperInnerRotate: boolean("stepper_inner_rotate").default(false),

  // Topic: .../actuator/stepper/outer (Address: W5.05)
  stepperOuterRotate: boolean("stepper_outer_rotate").default(false),

  // Topic: .../actuator/stepper/speed (Address: D2)
  stepperSpeedSetting: integer("stepper_speed_setting").default(0),

}, (table) => {
  return {
    // Index for fast time-range querying (e.g., graphing sensor data over time)
    createdAtIndex: index("created_at_idx").on(table.createdAt),
  };
});