'use client';

import React from 'react';

interface EmergencyStopProps {
  is_enabled?: boolean;
}
export function EmergencyStop({ is_enabled = true }: EmergencyStopProps) {
  function stop_system() {
    // send MQTT event/logic here
    alert('Emergency stop triggered!');
  }
  return (
    <button
      className="px-10 py-3 bg-red-600 rounded-lg text-white font-bold text-xl shadow-lg hover:bg-red-700"
      disabled={!is_enabled}
      onClick={stop_system}
    >
      EMERGENCY STOP
    </button>
  );
}
