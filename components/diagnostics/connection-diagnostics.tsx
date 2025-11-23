'use client';

import React from 'react';
import { useSystemStore } from '@/store/system-store';

export function ConnectionDiagnostics() {
  const { mqtt_connected, last_mqtt_update, error_message } = useSystemStore();

  return (
    <div>
      <h4 className="font-bold mb-2">MQTT Connection Diagnostics</h4>
      <div>Status: <span className={mqtt_connected ? 'text-green-600' : 'text-red-600'}>
        {mqtt_connected ? 'Connected' : 'Disconnected'}
      </span></div>
      <div>Last update: <span>{last_mqtt_update ?? 'Never'}</span></div>
      {error_message && (
        <div className="mt-2 text-red-500">
          Error: {error_message}
        </div>
      )}
    </div>
  );
}
