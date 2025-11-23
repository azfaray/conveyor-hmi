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
  const client_ref = useRef<MqttClient | null>(null);
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

  // Stable broker URL getter
  const get_broker_url = useCallback((): string => {
    if (typeof process === 'undefined' || !process.env) {
      return APP_CONFIG.MQTT_BROKER_DEV;
    }
    
    const is_production = process.env.NODE_ENV === 'production';
    return is_production 
      ? APP_CONFIG.MQTT_BROKER_PROD
      : APP_CONFIG.MQTT_BROKER_DEV;
  }, []);

  // Message handler - stable with no dependencies
  const handle_message = useCallback((topic: string, message: Buffer): void => {
    try {
      const payload = JSON.parse(message.toString());
      system_store.set_last_mqtt_update(new Date().toISOString());

      // Handle relay states
      if (topic.match(/conveyor\/relay\/\d+\/state/)) {
        const relay_id = parseInt(topic.split('/')[2]);
        plc_store.update_relay_state(relay_id, payload.state);
        return;
      }

      // Handle outer placing points
      if (topic.match(/conveyor\/outer\/point\/\d+\/state/)) {
        const point_id = parseInt(topic.split('/')[3]);
        plc_store.update_outer_point(`O${point_id}`, payload.state);
        return;
      }

      // Handle inner placing points
      if (topic.match(/conveyor\/inner\/point\/\d+\/state/)) {
        const point_id = parseInt(topic.split('/')[3]);
        plc_store.update_inner_point(`I${point_id}`, payload.state);
        return;
      }

      // Handle conveyor states
      if (topic === MQTT_TOPICS.OUTER_CONVEYOR_STATE) {
        conveyor_store.update_conveyor(1, payload);
        return;
      }

      if (topic === MQTT_TOPICS.INNER_CONVEYOR_STATE) {
        conveyor_store.update_conveyor(2, payload);
        return;
      }

      // Handle sensors
      if (topic === MQTT_TOPICS.IR_SENSOR_STATE) {
        sensor_store.update_sensor('ir', payload.state);
        return;
      }

      if (topic === MQTT_TOPICS.INDUCTIVE_SENSOR_STATE) {
        sensor_store.update_sensor('inductive', payload.state);
        return;
      }

      if (topic === MQTT_TOPICS.CAPACITIVE_SENSOR_STATE) {
        sensor_store.update_sensor('capacitive', payload.state);
        return;
      }

      // Handle actuators
      if (topic.match(/conveyor\/actuator\/\d+\/state/)) {
        const actuator_id = parseInt(topic.split('/')[2]);
        actuator_store.update_actuator(actuator_id, payload);
        return;
      }

      // Handle system config
      if (topic === MQTT_TOPICS.SYSTEM_MODE) {
        system_store.set_mode(payload.mode);
        return;
      }

      if (topic === MQTT_TOPICS.SYSTEM_SPEED) {
        system_store.set_speed_level(payload.speed_level);
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

  // Subscribe to all topics
  const subscribe_to_topics = useCallback((): void => {
    if (!client_ref.current?.connected || subscription_complete_ref.current) {
      return;
    }

    console.log('📡 Subscribing to topics...');
    let subscribed_count = 0;
    const total_topics = SUBSCRIBE_TOPICS.length;

    SUBSCRIBE_TOPICS.forEach((topic) => {
      client_ref.current?.subscribe(topic, { qos: APP_CONFIG.MQTT_QOS }, (error) => {
        subscribed_count++;
        
        if (error) {
          console.error(`❌ Failed to subscribe to ${topic}:`, error);
        } else {
          console.log(`✅ Subscribed to ${topic} (${subscribed_count}/${total_topics})`);
        }

        // Mark subscription as complete when all topics are processed
        if (subscribed_count === total_topics) {
          subscription_complete_ref.current = true;
          console.log('✅ All topic subscriptions completed');
        }
      });
    });
  }, []);

  // Main connection function
  const connect = useCallback((): void => {
    // Prevent multiple connection attempts
    if (connection_state_ref.current === 'connecting' || 
        connection_state_ref.current === 'connected' ||
        client_ref.current?.connected) {
      console.log('🔍 Connection already active or in progress');
      return;
    }

    // Skip if not mounted (React Strict Mode protection)
    if (!is_mounted_ref.current) {
      console.log('🔍 Component not mounted, skipping connection');
      return;
    }

    try {
      const broker_url = get_broker_url();
      connection_state_ref.current = 'connecting';
      subscription_complete_ref.current = false;
      
      console.log('🔄 MQTT Connection Details:');
      console.log('  - Broker URL:', broker_url);
      console.log('  - NODE_ENV:', process.env.NODE_ENV);
      console.log('  - Connection State:', connection_state_ref.current);
      
      const connection_options = {
        clientId: `hmi-${Math.random().toString(36).substr(2, 9)}`,
        clean: true,
        keepalive: APP_CONFIG.MQTT_KEEP_ALIVE,
        reconnectPeriod: APP_CONFIG.MQTT_RECONNECT_PERIOD * Math.pow(2, Math.min(reconnect_attempts.current, 3)),
        connectTimeout: APP_CONFIG.MQTT_CONNECT_TIMEOUT,
      };
      
      console.log('  - Connection Options:', connection_options);
      console.log('🔄 Attempting connection...');
      
      client_ref.current = mqtt.connect(broker_url, connection_options);

      // Connection successful
      client_ref.current.on('connect', () => {
        console.log('✅ MQTT Connected successfully!');
        console.log('  - Client ID:', client_ref.current?.options.clientId);
        
        connection_state_ref.current = 'connected';
        reconnect_attempts.current = 0;
        
        system_store.set_mqtt_connected(true);
        system_store.set_error_message(null);
        
        // Subscribe to topics
        subscribe_to_topics();
      });

      // Handle incoming messages
      client_ref.current.on('message', handle_message);

      // Connection errors
      client_ref.current.on('error', (error) => {
        console.error('❌ MQTT Connection Error:', error);
        console.error('  - Error Message:', error.message);
        
        connection_state_ref.current = 'error';
        system_store.set_mqtt_connected(false);
        system_store.set_error_message(`MQTT Error: ${error.message}`);
      });

      // Connection closed
      client_ref.current.on('close', () => {
        console.log('🔌 MQTT Connection Closed');
        connection_state_ref.current = 'disconnected';
        subscription_complete_ref.current = false;
        system_store.set_mqtt_connected(false);
      });

      // Disconnected
      client_ref.current.on('disconnect', () => {
        console.log('📡 MQTT Disconnected');
        connection_state_ref.current = 'disconnected';
        subscription_complete_ref.current = false;
        system_store.set_mqtt_connected(false);
        reconnect_attempts.current += 1;
      });

      // Client offline
      client_ref.current.on('offline', () => {
        console.log('📴 MQTT Client Offline');
        connection_state_ref.current = 'disconnected';
        subscription_complete_ref.current = false;
        system_store.set_mqtt_connected(false);
      });

      // Reconnection attempt
      client_ref.current.on('reconnect', () => {
        console.log('🔄 MQTT Reconnecting... (attempt:', reconnect_attempts.current + 1, ')');
        connection_state_ref.current = 'connecting';
        subscription_complete_ref.current = false;
      });

      // Connection ended
      client_ref.current.on('end', () => {
        console.log('🔚 MQTT Connection Ended');
        connection_state_ref.current = 'disconnected';
        subscription_complete_ref.current = false;
        system_store.set_mqtt_connected(false);
      });

    } catch (error) {
      console.error('❌ Failed to initialize MQTT client:', error);
      connection_state_ref.current = 'error';
      system_store.set_error_message('Failed to initialize MQTT connection');
    }
  }, [get_broker_url, handle_message, subscribe_to_topics]);

  // Manual reconnect function
  const reconnect = useCallback((): void => {
    console.log('🔄 Manual reconnect requested');
    
    // Disconnect first if connected
    if (client_ref.current) {
      client_ref.current.end(true);
      client_ref.current = null;
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
    
    if (client_ref.current) {
      client_ref.current.removeAllListeners();
      client_ref.current.end(true);
      client_ref.current = null;
    }
    
    connection_state_ref.current = 'disconnected';
    subscription_complete_ref.current = false;
    system_store.set_mqtt_connected(false);
  }, []);

  // Publish function
  const publish = useCallback((topic: string, payload: Record<string, unknown>): void => {
    if (!client_ref.current?.connected) {
      console.warn('MQTT not connected, cannot publish to:', topic);
      return;
    }

    const full_payload = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    try {
      client_ref.current.publish(topic, JSON.stringify(full_payload), { qos: APP_CONFIG.MQTT_QOS }, (error) => {
        if (error) {
          console.error(`Failed to publish to ${topic}:`, error);
        } else {
          console.log(`📤 Published to ${topic}`);
        }
      });
    } catch (error) {
      console.error(`Error publishing to ${topic}:`, error);
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
      
      if (client_ref.current) {
        console.log('🔍 Cleaning up MQTT connection');
        
        // Remove all listeners to prevent memory leaks
        client_ref.current.removeAllListeners();
        
        // End connection gracefully
        client_ref.current.end(false, {}, () => {
          console.log('🔍 MQTT connection ended gracefully');
        });
        
        client_ref.current = null;
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
