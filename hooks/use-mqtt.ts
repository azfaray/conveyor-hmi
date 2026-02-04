// File: hooks/use-mqtt.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { useSystemStore } from '@/store/system-store';
import { usePlcStore } from '@/store/plc-store';
import { useConveyorStore } from '@/store/conveyor-store';
import { useSensorStore } from '@/store/sensor-store';
import { useActuatorStore } from '@/store/actuator-store';
import { MQTT_TOPICS, SUBSCRIBE_TOPICS } from '@/lib/mqtt/topics';
import { APP_CONFIG } from '@/lib/constants/config';

interface UseMqttReturn {
  is_connected: boolean;
  publish: (topic: string, payload: Record<string, unknown>) => void;
  reconnect: () => void;
  disconnect: () => void;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export function useMQTT(): UseMqttReturn {
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
    
    return { primary };
  }, []);

  // Message handler - Only for Primary Broker to avoid duplicate state updates
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
         // Filter out 'ts' or other metadata if present, look for array value
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
      // Expected format: .../point/5/state
      const extractId = (t: string) => {
        const parts = t.split('/');
        const idx = parts.indexOf('point');
        if (idx !== -1 && parts[idx + 1]) return parseInt(parts[idx + 1]);
        const relayIdx = parts.indexOf('relay');
        if (relayIdx !== -1 && parts[relayIdx + 1]) return parseInt(parts[relayIdx + 1]);
        return null;
      };

      // --- SYSTEM STATUS (Online/Offline) ---
      if (topic === MQTT_TOPICS.MQTT_STATUS) {
        system_store.set_mqtt_online_status(payload.status ?? 0);
        return;
      }

      // --- ACTUATORS (DL/LD) ---
      if (topic === MQTT_TOPICS.ACTUATOR_DL_PUSH) {
        actuator_store.update_actuator_state('dl', { push: payload.state });
        return;
      }
      if (topic === MQTT_TOPICS.ACTUATOR_DL_PULL) {
        actuator_store.update_actuator_state('dl', { pull: payload.state });
        return;
      }
      if (topic === MQTT_TOPICS.ACTUATOR_LD_PUSH) {
        actuator_store.update_actuator_state('ld', { push: payload.state });
        return;
      }
      if (topic === MQTT_TOPICS.ACTUATOR_LD_PULL) {
        actuator_store.update_actuator_state('ld', { pull: payload.state });
        return;
      }

      // --- SENSORS (Boolean) ---
      if (topic === MQTT_TOPICS.IR_SENSOR_STATE) {
        sensor_store.update_boolean_sensor('ir', payload.state);
        return;
      }
      if (topic === MQTT_TOPICS.INDUCTIVE_SENSOR_STATE) {
        sensor_store.update_boolean_sensor('inductive', payload.state);
        return;
      }
      if (topic === MQTT_TOPICS.CAPACITIVE_SENSOR_STATE) {
        sensor_store.update_boolean_sensor('capacitive', payload.state);
        return;
      }
      if (topic === MQTT_TOPICS.POSITION_INNER_SENSOR) {
        sensor_store.update_boolean_sensor('position_inner', payload.state);
        // Reset Inner Conveyor Position if sensor triggered
        if (payload.state) {
           conveyor_store.reset_conveyor_angle(2);
        }
        return;
      }
      if (topic === MQTT_TOPICS.POSITION_OUTER_SENSOR) {
        sensor_store.update_boolean_sensor('position_outer', payload.state);
        // Reset Outer Conveyor Position if sensor triggered
         if (payload.state) {
           conveyor_store.reset_conveyor_angle(1);
        }
        return;
      }

      // --- STEPPER SENSOR FEEDBACK (Boolean States) --- //NEW
      if (topic === MQTT_TOPICS.STEPPER_INNER_SENSOR) {
        sensor_store.update_boolean_sensor('stepper_inner', payload.state);
        return;
      }
      if (topic === MQTT_TOPICS.STEPPER_OUTER_SENSOR) {
        sensor_store.update_boolean_sensor('stepper_outer', payload.state);
        return;
      }
      
      // --- STEPPER SPEED FEEDBACK ---
      // if (topic === MQTT_TOPICS.STEPPER_SPEED_SENSOR) {
      //    // Payload likely: {"StepperSpeed" : [ 3 ]} or just value [3]
      //    // Handle both depending on parsing
      //    if (typeof payload.value === 'number') {
      //       system_store.set_speed_level(payload.value);
      //    }
      //    return;
      // }

      // --- SENSORS (Data) ---
      if (topic === MQTT_TOPICS.MOTOR_SPEED_SENSOR) {
        sensor_store.update_data_sensor('motor_speed', payload.state ?? payload.value);
        return;
      }
      if (topic === MQTT_TOPICS.OBJECT_INNER_COUNT) {
        sensor_store.update_data_sensor('object_inner', payload.state ?? payload.value);
        return;
      }
      if (topic === MQTT_TOPICS.OBJECT_OUTER_COUNT) {
        sensor_store.update_data_sensor('object_outer', payload.state ?? payload.value);
        return;
      }

      // --- CONVEYORS / STEPPERS ---
      if (topic === MQTT_TOPICS.STEPPER_OUTER) {
        // Boolean state determines if it is running
        conveyor_store.update_conveyor(1, { is_running: payload.state === true });
        return;
      }
      if (topic === MQTT_TOPICS.STEPPER_INNER) {
        conveyor_store.update_conveyor(2, { is_running: payload.state === true });
        return;
      }

      // --- PLACING POINTS (Dynamic IDs) ---
      if (topic.includes('/outer/point/')) {
        const id = extractId(topic);
        if (id !== null) plc_store.update_outer_point(`O${id}`, payload.state);
        return;
      }
      if (topic.includes('/inner/point/')) {
        const id = extractId(topic);
        if (id !== null) plc_store.update_inner_point(`I${id}`, payload.state);
        return;
      }
      
      // --- LEGACY RELAYS ---
      if (topic.includes('/relay/')) {
        const id = extractId(topic);
        if (id !== null) plc_store.update_relay_state(id, payload.state);
        return;
      }

      // --- SYSTEM CONFIG ---
      if (topic === MQTT_TOPICS.SYSTEM_MODE) {
        system_store.set_mode(payload.mode);
        return;
      }
      if (topic === MQTT_TOPICS.SYSTEM_SPEED) {
        system_store.set_speed_level(payload.speed_level);
        return;
      }
      
      // --- AUTOMATE MODE ---
      if (topic === MQTT_TOPICS.CONVEYOR_MODE_AUTOMATE) {
        // Payload expected: { "AutomateMode": [ true/false ] }
        // Parsed as payload.state or payload.value if normalized
        const isAutomate = payload.state === true || payload.value === true;
        conveyor_store.set_automate_mode(isAutomate);
        return;
      }

      if (topic === MQTT_TOPICS.POWER_ELECTRICITY) {
        system_store.set_electricity_status(payload.status);
        return;
      }

    } catch (error) {
      console.error(`Failed to parse MQTT message from ${topic}:`, error);
      system_store.set_error_message(`MQTT parsing error on ${topic}`);
    }
  }, []); // Empty deps - stores are stable

  // Subscribe to all topics - Only on Primary
  const subscribe_to_topics_primary = useCallback((): void => {
    if (!client_primary_ref.current?.connected || subscription_complete_ref.current) {
      return;
    }

    console.log('📡 Subscribing to topics on Primary...');
    let subscribed_count = 0;
    const total_topics = SUBSCRIBE_TOPICS.length;

    SUBSCRIBE_TOPICS.forEach((topic) => {
      client_primary_ref.current?.subscribe(topic, { qos: APP_CONFIG.MQTT_QOS }, (error) => {
        subscribed_count++;
        
        if (error) {
          console.error(`❌ Failed to subscribe to ${topic}:`, error);
        } else {
          // console.log(`✅ Subscribed to ${topic} (${subscribed_count}/${total_topics})`);
        }

        // Mark subscription as complete when all topics are processed
        if (subscribed_count === total_topics) {
          subscription_complete_ref.current = true;
          console.log('✅ All topic subscriptions completed (Primary)');
        }
      });
    });
  }, []);

  // Main connection function
  const connect = useCallback((): void => {
    // Prevent multiple connection attempts
    if (connection_state_ref.current === 'connecting' || 
        connection_state_ref.current === 'connected' ||
        (client_primary_ref.current?.connected)) {
      console.log('🔍 Connection already active or in progress');
      return;
    }

    // Skip if not mounted (React Strict Mode protection)
    if (!is_mounted_ref.current) {
      console.log('🔍 Component not mounted, skipping connection');
      return;
    }

    try {
      const { primary } = get_broker_urls();
      connection_state_ref.current = 'connecting';
      subscription_complete_ref.current = false;
      
      console.log('🔄 MQTT Connection Details:');
      console.log('  - Primary Broker:', primary);
      
      const connection_options = {
        clientId: `hmi-${Math.random().toString(36).substr(2, 9)}`,
        clean: true,
        keepalive: APP_CONFIG.MQTT_KEEP_ALIVE,
        reconnectPeriod: APP_CONFIG.MQTT_RECONNECT_PERIOD * Math.pow(2, Math.min(reconnect_attempts.current, 3)),
        connectTimeout: APP_CONFIG.MQTT_CONNECT_TIMEOUT,
      };
      
      // --- CONNECT PRIMARY ---
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

  // Manual reconnect function
  const reconnect = useCallback((): void => {
    console.log('🔄 Manual reconnect requested');
    
    // Disconnect first
    if (client_primary_ref.current) {
      client_primary_ref.current.end(true);
      client_primary_ref.current = null;
    }

    
    connection_state_ref.current = 'idle';
    reconnect_attempts.current = 0;
    
    // Reconnect after a brief delay
    setTimeout(() => {
      connect();
    }, 1000);
  }, [connect]);

  // Manual disconnect function
  const disconnect = useCallback((): void => {
    console.log('🔌 Manual disconnect requested');
    
    if (client_primary_ref.current) {
      client_primary_ref.current.removeAllListeners();
      client_primary_ref.current.end(true);
      client_primary_ref.current = null;
    }

    
    connection_state_ref.current = 'disconnected';
    subscription_complete_ref.current = false;
    system_store.set_mqtt_connected(false);
  }, []);

  // Publish function
  const publish = useCallback((topic: string, payload: Record<string, unknown>): void => {
    // Check primary connectivity
    if (!client_primary_ref.current?.connected) {
      console.warn('MQTT Primary not connected, cannot publish to:', topic);
      // We could try secondary only, but usually we want consistency.
      // Continue to try secondary anyway? Let's try.
    }

    // Payload raw without timestamp as requested
    const full_payload = payload;
    const msgString = JSON.stringify(full_payload);

    // 1. Publish to Primary
    if (client_primary_ref.current?.connected) {
      try {
        client_primary_ref.current.publish(topic, msgString, { qos: APP_CONFIG.MQTT_QOS }, (error) => {
          if (error) console.error(`Failed to publish to Primary ${topic}:`, error);
          else console.log(`📤 Published to Primary ${topic}`);
        });
      } catch (error) {
        console.error(`Error publishing to Primary ${topic}:`, error);
      }
    }



  }, []);

  // Main effect - runs once on mount
  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (is_mounted_ref.current) {
      console.log('🔍 Already mounted, skipping initialization');
      return;
    }
    
    is_mounted_ref.current = true;
    console.log('🚀 useMQTT hook mounted - initializing connection');
    
    // Start connection
    connect();

    // Cleanup function
    return () => {
      console.log('🔥 useMQTT hook unmounting');
      is_mounted_ref.current = false;
      
      if (client_primary_ref.current) {
        client_primary_ref.current.removeAllListeners();
        client_primary_ref.current.end(false);
        client_primary_ref.current = null;
      }

      
      // Reset state
      connection_state_ref.current = 'idle';
      subscription_complete_ref.current = false;
      system_store.set_mqtt_connected(false);
    };
  }, []); // Empty dependency array - run only on mount/unmount

  return {
    is_connected: system_store.mqtt_connected,
    publish,
    reconnect,
    disconnect,
  };
}
