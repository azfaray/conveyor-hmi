'use client';

import mqtt from 'mqtt';
import type { MqttClient } from 'mqtt';

export function create_mqtt_client(broker_url: string): MqttClient {
return mqtt.connect(broker_url, {
protocol: typeof window !== 'undefined' ? 'ws' : 'mqtt',
reconnectPeriod: 1000,
keepalive: 60,
clean: true,
});
}

export function get_mqtt_broker_url(is_production: boolean): string {
return is_production
? 'wss://broker.iot.hmmitb.com:8884'
: 'ws://broker.iot.hmmitb.com:1884';
}