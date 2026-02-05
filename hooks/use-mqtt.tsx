// File: hooks/use-mqtt.ts
'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { useSystemStore } from '@/store/system-store';
import { usePlcStore } from '@/store/plc-store';
import { useConveyorStore } from '@/store/conveyor-store';
import { useSensorStore } from '@/store/sensor-store';
import { useActuatorStore } from '@/store/actuator-store';
import { MQTT_TOPICS, SUBSCRIBE_TOPICS } from '@/lib/mqtt/topics';
import { APP_CONFIG } from '@/lib/constants/config';

// --- Types ---
interface UseMqttReturn {
  is_connected: boolean;
  publish: (topic: string, payload: Record<string, unknown>) => void;
  reconnect: () => void;
  disconnect: () => void;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

// --- Context Definition ---
const MqttContext = createContext<UseMqttReturn | null>(null);

// --- 1. THE PROVIDER COMPONENT (Contains your Original Logic) ---
export function MqttProvider({ children }: { children: ReactNode }) {
  // =========================================================================
  //  BELOW IS YOUR EXACT ORIGINAL LOGIC (Just inside the component now)
  // =========================================================================
  
  const client_primary_ref = useRef<MqttClient | null>(null);
  const connection_state_ref = useRef<ConnectionState>('idle');
  const is_mounted_ref = useRef<boolean>(false);
  const reconnect_attempts = useRef<number>(0);
  const subscription_complete_ref = useRef<boolean>(false);
  
  // Stores
  const system_store = useSystemStore();
  const plc_store = usePlcStore();
  const conveyor_store = useConveyorStore();
  const sensor_store = useSensorStore();
  const actuator_store = useActuatorStore();

  // Stable broker URL getters
  const get_broker_urls = useCallback(() => {
    // Primary
    let primary: string = APP_CONFIG.MQTT_BROKER_DEV;
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
       primary = APP_CONFIG.MQTT_BROKER_PROD;
    }

    // --- FIX FOR LOCALHOST CONNECTION ISSUES ---
    // Force WebSocket port 8888 in development to match your running 'broker.js'
    if (process.env.NODE_ENV !== 'production') {
       primary = 'ws://localhost:8888';
    }
    
    return { primary };
  }, []);

  // Message handler
  const handle_message = useCallback((topic: string, message: Buffer): void => {
    try {
      let payload = JSON.parse(message.toString());
      let parsedValue: any = null;

      // 1. Try parsing 'd' structure (Legacy/IBMIoT)
      if (payload.d && typeof payload.d === 'object') {
        const keys = Object.keys(payload.d);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const dataValue = payload.d[firstKey];
          if (Array.isArray(dataValue) && dataValue.length > 0) {
            parsedValue = dataValue[0];
          }
        }
      } 
      // 2. Try parsing direct structure {"Nickname": [ value ]} (New Format)
      else {
         const keys = Object.keys(payload);
         for (const k of keys) {
            if (k !== 'ts' && Array.isArray(payload[k]) && payload[k].length > 0) {
              parsedValue = payload[k][0];
              break;
            }
         }
      }

      // Normalize payload
      if (parsedValue !== null) {
        payload = {
          ...payload,
          state: parsedValue,
          value: parsedValue,
          mode: parsedValue,
          speed_level: parsedValue,
          status: parsedValue, // For MQTT_STATUS
        };
      }

      system_store.set_last_mqtt_update(new Date().toISOString());

      // Helper to extract ID from topic
      const extractId = (t: string) => {
        const parts = t.split('/');
        const idx = parts.indexOf('point');
        if (idx !== -1 && parts[idx + 1]) return parseInt(parts[idx + 1]);
        const relayIdx = parts.indexOf('relay');
        if (relayIdx !== -1 && parts[relayIdx + 1]) return parseInt(parts[relayIdx + 1]);
        return null;
      };

      // --- SYSTEM STATUS ---
      if (topic === MQTT_TOPICS.MQTT_STATUS) { system_store.set_mqtt_online_status(payload.status ?? 0); return; }

      // --- ACTUATORS ---
      if (topic === MQTT_TOPICS.ACTUATOR_DL_PUSH || topic.includes('feedback/actuator/DL/push')) { actuator_store.update_actuator_state('dl', { push: payload.state }); return; }
      if (topic === MQTT_TOPICS.ACTUATOR_DL_PULL || topic.includes('feedback/actuator/DL/pull')) { actuator_store.update_actuator_state('dl', { pull: payload.state }); return; }
      if (topic === MQTT_TOPICS.ACTUATOR_LD_PUSH || topic.includes('feedback/actuator/LD/push')) { actuator_store.update_actuator_state('ld', { push: payload.state }); return; }
      if (topic === MQTT_TOPICS.ACTUATOR_LD_PULL || topic.includes('feedback/actuator/LD/pull')) { actuator_store.update_actuator_state('ld', { pull: payload.state }); return; }

      // --- SENSORS (Boolean) ---
      if (topic === MQTT_TOPICS.IR_SENSOR_STATE) { sensor_store.update_boolean_sensor('ir', payload.state); return; }
      if (topic === MQTT_TOPICS.INDUCTIVE_SENSOR_STATE) { sensor_store.update_boolean_sensor('inductive', payload.state); return; }
      if (topic === MQTT_TOPICS.CAPACITIVE_SENSOR_STATE) { sensor_store.update_boolean_sensor('capacitive', payload.state); return; }
      if (topic === MQTT_TOPICS.POSITION_INNER_SENSOR) { 
        sensor_store.update_boolean_sensor('position_inner', payload.state); 
        if (payload.state) conveyor_store.reset_conveyor_angle(2);
        return; 
      }
      if (topic === MQTT_TOPICS.POSITION_OUTER_SENSOR) { 
        sensor_store.update_boolean_sensor('position_outer', payload.state);
        if (payload.state) conveyor_store.reset_conveyor_angle(1);
        return; 
      }

      // --- STEPPERS ---
      if (topic === MQTT_TOPICS.STEPPER_INNER_SENSOR || topic.includes('feedback/actuator/stepper/inner')) { sensor_store.update_boolean_sensor('stepper_inner', payload.state); return; }
      if (topic === MQTT_TOPICS.STEPPER_OUTER_SENSOR || topic.includes('feedback/actuator/stepper/outer')) { sensor_store.update_boolean_sensor('stepper_outer', payload.state); return; }

// ... inside handle_message function ...

      // --- DATA ---
      if (topic === MQTT_TOPICS.MOTOR_SPEED_SENSOR) { sensor_store.update_data_sensor('motor_speed', payload.state ?? payload.value); return; }
      if (topic === MQTT_TOPICS.OBJECT_INNER_COUNT) { sensor_store.update_data_sensor('object_inner', payload.state ?? payload.value); return; }
      if (topic === MQTT_TOPICS.OBJECT_OUTER_COUNT) { sensor_store.update_data_sensor('object_outer', payload.state ?? payload.value); return; }

      // 🔥 ADD THIS NEW BLOCK HERE 🔥
      // --- STEPPER SPEED CONTROL ---
      if (topic === MQTT_TOPICS.STEPPER_SPEED_OUTPUT) {
        const actualSpeed = parsedValue ?? payload.state ?? payload.value;
        const numericSpeed = parseInt(actualSpeed);

        // Use isNaN to check if it's a valid number. 
        // This allows '0' to pass through, but stops 'undefined' or 'null'.
        if (!isNaN(numericSpeed)) {
          actuator_store.set_stepper_speed(numericSpeed); 
        }
        return;
      }
      // -----------------------------

      // --- CONVEYOR RUNNING STATE ---
      if (topic === MQTT_TOPICS.STEPPER_OUTER) { conveyor_store.update_conveyor(1, { is_running: payload.state === true }); return; }
// ...

      // --- POINTS ---
      if (topic.includes('/outer/point/')) { const id = extractId(topic); if (id !== null) plc_store.update_outer_point(`O${id}`, payload.state); return; }
      if (topic.includes('/inner/point/')) { const id = extractId(topic); if (id !== null) plc_store.update_inner_point(`I${id}`, payload.state); return; }
      if (topic.includes('/relay/')) { const id = extractId(topic); if (id !== null) plc_store.update_relay_state(id, payload.state); return; }

      // --- CONFIG ---
      if (topic === MQTT_TOPICS.SYSTEM_MODE) { system_store.set_mode(payload.mode); return; }
      if (topic === MQTT_TOPICS.SYSTEM_SPEED) { system_store.set_speed_level(payload.speed_level); return; }
      if (topic === MQTT_TOPICS.CONVEYOR_MODE_AUTOMATE) { 
        const isAutomate = payload.state === true || payload.value === true;
        conveyor_store.set_automate_mode(isAutomate);
        return; 
      }
      if (topic === MQTT_TOPICS.POWER_ELECTRICITY) { system_store.set_electricity_status(payload.status); return; }

    } catch (error) {
      console.error(`Failed to parse MQTT message from ${topic}:`, error);
      system_store.set_error_message(`MQTT parsing error on ${topic}`);
    }
  }, []);

  // Subscribe logic
  const subscribe_to_topics_primary = useCallback((): void => {
    if (!client_primary_ref.current?.connected || subscription_complete_ref.current) return;

    console.log('📡 Subscribing to topics on Primary...');
    let subscribed_count = 0;
    const total_topics = SUBSCRIBE_TOPICS.length;

    SUBSCRIBE_TOPICS.forEach((topic) => {
      client_primary_ref.current?.subscribe(topic, { qos: APP_CONFIG.MQTT_QOS }, (error) => {
        subscribed_count++;
        if (error) console.error(`❌ Failed to subscribe to ${topic}:`, error);
        
        if (subscribed_count === total_topics) {
          subscription_complete_ref.current = true;
          console.log('✅ All topic subscriptions completed (Primary)');
        }
      });
    });
  }, []);

  // Connect Logic
  const connect = useCallback((): void => {
    if (connection_state_ref.current === 'connecting' || connection_state_ref.current === 'connected' || client_primary_ref.current?.connected) {
      return;
    }
    if (!is_mounted_ref.current) return;

    try {
      const { primary } = get_broker_urls();
      connection_state_ref.current = 'connecting';
      subscription_complete_ref.current = false;
      
      console.log('🔄 MQTT Connection Details:', primary);
      
      const connection_options = {
        clientId: `hmi-${Math.random().toString(36).substr(2, 9)}`,
        clean: true,
        keepalive: APP_CONFIG.MQTT_KEEP_ALIVE,
        reconnectPeriod: APP_CONFIG.MQTT_RECONNECT_PERIOD * Math.pow(2, Math.min(reconnect_attempts.current, 3)),
        connectTimeout: APP_CONFIG.MQTT_CONNECT_TIMEOUT,
        protocol: 'ws' as 'ws', // <--- Add "as 'ws'"
      };
      
      client_primary_ref.current = mqtt.connect(primary, connection_options);

      client_primary_ref.current.on('connect', () => {
        console.log('✅ MQTT Primary Connected!');
        connection_state_ref.current = 'connected';
        reconnect_attempts.current = 0;
        system_store.set_mqtt_connected(true);
        system_store.set_error_message(null);
        subscribe_to_topics_primary();
      });

      client_primary_ref.current.on('message', handle_message);

      client_primary_ref.current.on('error', (error) => {
        console.error('❌ MQTT Primary Error:', error);
        system_store.set_mqtt_connected(false);
        system_store.set_error_message(`MQTT Error: ${error.message}`);
      });
      
      client_primary_ref.current.on('close', () => {
        console.log('🔌 MQTT Primary Closed');
        system_store.set_mqtt_connected(false);
      });

    } catch (error) {
      console.error('❌ Failed to initialize MQTT clients:', error);
      connection_state_ref.current = 'error';
      system_store.set_error_message('Failed to initialize MQTT connection');
    }
  }, [get_broker_urls, handle_message, subscribe_to_topics_primary]);

  // Reconnect
  const reconnect = useCallback((): void => {
    if (client_primary_ref.current) {
      client_primary_ref.current.end(true);
      client_primary_ref.current = null;
    }
    connection_state_ref.current = 'idle';
    reconnect_attempts.current = 0;
    setTimeout(() => { connect(); }, 1000);
  }, [connect]);

  // Disconnect
  const disconnect = useCallback((): void => {
    if (client_primary_ref.current) {
      client_primary_ref.current.removeAllListeners();
      client_primary_ref.current.end(true);
      client_primary_ref.current = null;
    }
    connection_state_ref.current = 'disconnected';
    subscription_complete_ref.current = false;
    system_store.set_mqtt_connected(false);
  }, []);

  // Publish
  const publish = useCallback((topic: string, payload: Record<string, unknown>): void => {
    const msgString = JSON.stringify(payload);
    if (client_primary_ref.current?.connected) {
      try {
        client_primary_ref.current.publish(topic, msgString, { qos: APP_CONFIG.MQTT_QOS }, (error) => {
          if (error) console.error(`Failed to publish to Primary ${topic}:`, error);
        });
      } catch (error) {
        console.error(`Error publishing to Primary ${topic}:`, error);
      }
    }
  }, []);

  // Lifecycle
  useEffect(() => {
    if (is_mounted_ref.current) return;
    is_mounted_ref.current = true;
    console.log('🚀 MQTT Provider mounted - initializing Global connection');
    connect();

    return () => {
      console.log('🔥 MQTT Provider unmounting (App Closed)');
      is_mounted_ref.current = false;
      if (client_primary_ref.current) {
        client_primary_ref.current.removeAllListeners();
        client_primary_ref.current.end(false);
        client_primary_ref.current = null;
      }
      connection_state_ref.current = 'idle';
      subscription_complete_ref.current = false;
      system_store.set_mqtt_connected(false);
    };
  }, []); 

  // Values to share
  const contextValue = {
    is_connected: system_store.mqtt_connected,
    publish,
    reconnect,
    disconnect,
  };

  return (
    <MqttContext.Provider value={contextValue}>
      {children}
    </MqttContext.Provider>
  );
}

// --- 2. THE HOOK (Now just consumes the shared Context) ---
export function useMQTT() {
  const context = useContext(MqttContext);
  // Optional: Return a dummy if context is missing (prevents crash, but warns)
  if (!context) {
    console.warn('⚠️ useMQTT used outside of MqttProvider. Wrap your app in <MqttProvider>.');
    return { 
      is_connected: false, 
      publish: () => {}, 
      reconnect: () => {}, 
      disconnect: () => {} 
    };
  }
  return context;
}