// Type definitions for all data structures
// Ensure strict typing - no 'any' types allowed

// MQTT-related types
export interface MqttConnectionState {
  is_connected: boolean;
  last_message_time: string | null;
  error_message: string | null;
}

// Placing Point Types
// Placing Point Types
export type OuterPlacingPointState = 'non-occupied' | 'occupied' | 'occupied-metallic';
export type InnerPlacingPointState = 'occupied' | 'non-occupied';

export interface PlacingPoint {
  id: string;
  state: OuterPlacingPointState | InnerPlacingPointState;
  timestamp: string;
}

export interface OuterPlacingPoint {
  id: string; // O1-O10
  state: OuterPlacingPointState;
  timestamp: string;
}

export interface InnerPlacingPoint {
  id: string; // I1-I10
  state: InnerPlacingPointState;
  timestamp: string;
}

// Linear Actuator Types
// Matching schema: DL (Drop Lifter) and LD (Lifter Drop)
export interface ActuatorStatus {
  dlPush: boolean;
  dlPull: boolean;
  ldPush: boolean;
  ldPull: boolean;
  timestamp: string;
}

export interface StepperStatus {
  stepperInnerRotate: boolean;
  stepperOuterRotate: boolean;
  stepperSpeedSetting: number;
  timestamp: string;
}

// Conveyor Types
export type ConveyorDirection = 'CW' | 'CCW';

export interface ConveyorState {
  conveyor_id: number; // 1 or 2
  direction: ConveyorDirection;
  angle_deg: number; // 0-360
  // Merging new schema fields
  motorSpeedSensor: number; // D10
  objectCount: number; // D120 (Inner) or D130 (Outer)
  is_running: boolean; // Derived from Stepper Status
  timestamp: string;
}

// Relay Types
export type RelayState = 'on' | 'off';

export interface RelayStatus {
  relay_id: number; // 1-9
  state: RelayState;
  timestamp: string;
}

export const RELAY_MAPPING: Record<number, string> = {
  1: 'LA1 Forward',
  2: 'LA1 Backward',
  3: 'LA2 Forward',
  4: 'LA2 Backward',
  5: 'IR Sensor',
  6: 'Inductive Sensor',
  7: 'Capacitive Sensor',
  8: 'Stepper Motor 1',
  9: 'Stepper Motor 2',
};

// Sensor Types
export type BooleanSensorType = 
  | 'ir' 
  | 'inductive' 
  | 'capacitive' 
  | 'position_inner' 
  | 'position_outer'
  | 'stepper_inner'
  |  'stepper_outer';

export interface BooleanSensorStatus {
  sensor: BooleanSensorType;
  state: boolean; // mapped from boolean payload
  timestamp: string;
}

// System Configuration Types
export type SystemMode = 'manual' | 'automatic' | 'off';
export type ElectricityStatus = 'live' | 'not-live';

export interface SystemConfig {
  mode: SystemMode;
  speed_level: number; // 1-5
  electricity_status: ElectricityStatus;
  timestamp: string;
}

// MQTT Payload Types (for validation)
export interface MqttRelayPayload {
  relay_id: number;
  state: RelayState;
  timestamp: string;
}

export interface MqttOuterPointPayload {
  point_id: string;
  state: OuterPlacingPointState;
  timestamp: string;
}

export interface MqttInnerPointPayload {
  point_id: string;
  state: InnerPlacingPointState;
  timestamp: string;
}

export interface MqttConveyorPayload {
  conveyor_id: number | string;
  direction: ConveyorDirection;
  angle_deg: number;
  position: number;
  speed_rpm: number;
  timestamp: string;
}

export interface MqttActuatorBitPayload {
  state: boolean;
  timestamp?: string;
}

export interface MqttBooleanSensorPayload {
  state: boolean;
  timestamp?: string;
}

export interface MqttNumberPayload {
  value: number;
  timestamp?: string;
}

export interface MqttSystemConfigPayload {
  mode: SystemMode;
  speed_level: number;
  electricity_status: ElectricityStatus;
  timestamp: string;
}