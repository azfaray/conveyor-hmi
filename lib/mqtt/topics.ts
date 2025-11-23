export const MQTT_TOPICS = {
  // Power Status
  POWER_ELECTRICITY: 'conveyor/power/electricity/status',
  
  // Relays (R1-R9)
  RELAY: (relay_id: number) => `conveyor/relay/${relay_id}/state`,
  
  // Placing Points - Outer Conveyor (O1-O10)
  OUTER_POINT: (point_id: number) => `conveyor/outer/point/${point_id}/state`,
  
  // Placing Points - Inner Conveyor (I1-I10)
  INNER_POINT: (point_id: number) => `conveyor/inner/point/${point_id}/state`,
  
  // Linear Actuators (LA1, LA2)
  ACTUATOR_STATE: (actuator_id: number) => `conveyor/actuator/${actuator_id}/state`,
  ACTUATOR_COMMAND: (actuator_id: number) => `conveyor/actuator/${actuator_id}/command`,
  
  // Conveyors
  OUTER_CONVEYOR_STATE: 'conveyor/outer/state',
  OUTER_CONVEYOR_COMMAND: 'conveyor/outer/command',
  INNER_CONVEYOR_STATE: 'conveyor/inner/state',
  INNER_CONVEYOR_COMMAND: 'conveyor/inner/command',
  
  // Sensors
  IR_SENSOR_STATE: 'conveyor/sensor/ir/state',
  INDUCTIVE_SENSOR_STATE: 'conveyor/sensor/inductive/state',
  CAPACITIVE_SENSOR_STATE: 'conveyor/sensor/capacitive/state',
  
  // System Configuration
  SYSTEM_MODE: 'conveyor/system/mode',
  SYSTEM_SPEED: 'conveyor/system/speed',
  SYSTEM_STATUS: 'conveyor/system/status',
  
  // Zero Position Reference
  OUTER_PROX_SWITCH: 'conveyor/outer/prox_switch',
  INNER_PROX_SWITCH: 'conveyor/inner/prox_switch',
} as const;

// All topics for subscription
export const SUBSCRIBE_TOPICS: string[] = [
  MQTT_TOPICS.POWER_ELECTRICITY,
  ...Array.from({ length: 9 }, (_, i) => MQTT_TOPICS.RELAY(i + 1)),
  ...Array.from({ length: 10 }, (_, i) => MQTT_TOPICS.OUTER_POINT(i + 1)),
  ...Array.from({ length: 10 }, (_, i) => MQTT_TOPICS.INNER_POINT(i + 1)),
  ...Array.from({ length: 2 }, (_, i) => MQTT_TOPICS.ACTUATOR_STATE(i + 1)),
  MQTT_TOPICS.OUTER_CONVEYOR_STATE,
  MQTT_TOPICS.INNER_CONVEYOR_STATE,
  MQTT_TOPICS.IR_SENSOR_STATE,
  MQTT_TOPICS.INDUCTIVE_SENSOR_STATE,
  MQTT_TOPICS.CAPACITIVE_SENSOR_STATE,
  MQTT_TOPICS.SYSTEM_MODE,
  MQTT_TOPICS.SYSTEM_SPEED,
  MQTT_TOPICS.SYSTEM_STATUS,
  MQTT_TOPICS.OUTER_PROX_SWITCH,
  MQTT_TOPICS.INNER_PROX_SWITCH,
];
