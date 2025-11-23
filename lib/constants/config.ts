// File: src/lib/constants/config.ts

export const APP_CONFIG = {
  // MQTT Configuration based on NODE_ENV
  MQTT_BROKER_PROD: 'wss://broker.iot.hmmitb.com:8884',
  MQTT_BROKER_DEV: 'ws://broker.iot.hmmitb.com:1884',
  MQTT_QOS: 1 as const,
  MQTT_KEEP_ALIVE: 60,
  MQTT_CONNECT_TIMEOUT: 30000,
  MQTT_RECONNECT_PERIOD: 1000,
  
  // Application Constants
  OUTER_PLACING_POINTS: Array.from({ length: 5 }, (_, i) => `O${i + 1}`),
  INNER_PLACING_POINTS: Array.from({ length: 5 }, (_, i) => `I${i + 1}`),
  TOTAL_RELAYS: 9,
  TOTAL_ACTUATORS: 2,
  TOTAL_CONVEYORS: 2,
  
  // Actuator Configuration
  ACTUATOR_MIN_POSITION: 0,
  ACTUATOR_MAX_POSITION: 100,
  ACTUATOR_STROKE_MM: 100,
  ACTUATOR_SPEED_MS: 10, // milliseconds
  
  // Conveyor Configuration
  CONVEYOR_MIN_ANGLE: 0,
  CONVEYOR_MAX_ANGLE: 360,
  CONVEYOR_ROTATION_SPEED: 360, // degrees per second
  
  // Speed Control
  SPEED_MIN_LEVEL: 1,
  SPEED_MAX_LEVEL: 5,
  SPEED_INCREMENTS: 0.2, // 20% per level
  
  // UI Refresh Rates (ms)
  STATE_UPDATE_INTERVAL: 500,
  QUERY_STALE_TIME: 100,
  QUERY_CACHE_TIME: 300,
  
  // Timeouts
  MESSAGE_TIMEOUT: 5000,
  CONNECTION_TIMEOUT: 10000,
  
  // Display Settings
  TIMESTAMP_FORMAT: 'HH:mm:ss',
  DATE_FORMAT: 'yyyy-MM-dd',
  
  // Modal Defaults
  MODAL_ANIMATION_DURATION: 200,
} as const;

export const MODE_COLORS = {
  light: {
    manual: '#2563eb', // blue
    automatic: '#16a34a', // green
    off: '#dc2626', // red
  },
  dark: {
    manual: '#60a5fa', // light blue
    automatic: '#86efac', // light green
    off: '#f87171', // light red
  },
} as const;

export const STATUS_COLORS = {
  light: {
    safe: '#16a34a', // green - non-metallic/non-occupied
    warning: '#d97706', // amber - occupied but not determined
    danger: '#dc2626', // red - metallic/error
    active: '#2563eb', // blue - system active/inner-occupied
    inactive: '#6b7280', // gray - disabled/offline
  },
  dark: {
    safe: '#86efac', // light green
    warning: '#fbbf24', // light amber
    danger: '#f87171', // light red
    active: '#60a5fa', // light blue
    inactive: '#9ca3af', // light gray
  },
} as const;

export const PLACING_POINT_COLORS = {
  light: {
    'non-occupied': '#16a34a', // green
    'occupied': '#d97706', // amber
    'occupied-metallic': '#dc2626', // red
  },
  dark: {
    'non-occupied': '#86efac',
    'occupied': '#fbbf24',
    'occupied-metallic': '#f87171',
  },
} as const;

export const INNER_POINT_COLORS = {
  light: {
    'non-occupied': '#16a34a', // green
    'occupied': '#2563eb', // blue
  },
  dark: {
    'non-occupied': '#86efac',
    'occupied': '#60a5fa',
  },
} as const;

export const RELAY_NAMES: Record<number, string> = {
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

export const SENSOR_LABELS: Record<string, string> = {
  ir: 'IR Proximity',
  inductive: 'Inductive Proximity',
  capacitive: 'Capacitive Proximity',
};

export const ACTUATOR_LABELS: Record<number, string> = {
  1: 'Linear Actuator 1',
  2: 'Linear Actuator 2',
};

export const CONVEYOR_LABELS: Record<number, string> = {
  1: 'Outer Conveyor',
  2: 'Inner Conveyor',
};