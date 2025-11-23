// File: src/components/common/mqtt-status.tsx (Client Component)
'use client';

import React from 'react';
import { format } from 'date-fns';
import { useSystemStore } from '@/store/system-store';

interface MqttStatusProps {
  is_connected: boolean;
}

export function MqttStatus({ is_connected }: MqttStatusProps) {
  const { last_mqtt_update } = useSystemStore();

  const get_status_text = (): string => {
    if (!is_connected) return 'MQTT Disconnected';
    if (!last_mqtt_update) return 'MQTT Connected (no data)';
    return `Last: ${format(new Date(last_mqtt_update), 'HH:mm:ss')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-3 h-3 rounded-full animate-pulse
          ${is_connected ? 'bg-green-500' : 'bg-red-500'}
        `}
      />
      <span className={`text-sm font-medium ${is_connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
        {get_status_text()}
      </span>
    </div>
  );
}
