'use client';

import mqtt from 'mqtt';
import type { MqttClient } from 'mqtt';

export function create_mqtt_client(broker_url: string): MqttClient {
  console.log(`🔌 HMI Connecting to: ${broker_url}`);

  return mqtt.connect(broker_url, {
    protocol: 'ws', // Browser must use WebSocket
    // FIX: Random Client ID prevents "Zombie" connection rejections
    clientId: 'hmi_' + Math.random().toString(16).substr(2, 8),
    reconnectPeriod: 1000,
    keepalive: 60,
    clean: true,
  });
}

export function get_mqtt_broker_url(is_production: boolean): string {
  // 1. PRODUCTION
  if (is_production) {
    return 'wss://broker.iot.hmmitb.com:8884';
  }

  // 2. DEVELOPMENT (Localhost)
  // This must match your broker.js WebSocket port!
  return 'ws://localhost:8888';
}