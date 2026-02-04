'use client';

import { useEffect } from 'react';
import { useSystemStore } from '@/store/system-store';
import { useConveyorStore } from '@/store/conveyor-store';
import { useMQTT } from '@/hooks/use-mqtt';
import { MQTT_TOPICS } from '@/lib/mqtt/topics';

export function ModeSelector() {
  const mode = useSystemStore((s) => s.mode);
  const set_mode = useSystemStore((s) => s.set_mode);

  // Automation Logic
  const is_automate_mode = useConveyorStore((s) => s.is_automate_mode_active);
  const { publish } = useMQTT();

  // Determine if "TESTING MODE" is currently ON
  const isTestingMode = mode === 'manual';

  // Enforce Automate Mode / Safety Lock
  // If the system says we are in automatic mode, we must force Testing Mode OFF.
  useEffect(() => {
    if (is_automate_mode && isTestingMode) {
      set_mode('automatic');
      // Ensure MQTT knows we are forced off
      publish(MQTT_TOPICS.CONVEYOR_MODE_MANUAL, { "ManualMode": [false] });
    }
  }, [is_automate_mode, isTestingMode, set_mode, publish]);

  const handleToggle = () => {
    if (is_automate_mode) return; // Locked

    if (!isTestingMode) {
      // USER TURNS ON -> Switch to Manual
      set_mode('manual');
      publish(MQTT_TOPICS.CONVEYOR_MODE_MANUAL, { "ManualMode": [true] });
    } else {
      // USER TURNS OFF -> Switch to Automatic/Off
      set_mode('automatic');
      publish(MQTT_TOPICS.CONVEYOR_MODE_MANUAL, { "ManualMode": [false] });
    }
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col">
        <h3 className="font-bold text-gray-900 dark:text-white">TESTING MODE</h3>
        <span className="text-xs text-gray-500">
          {is_automate_mode 
            ? "Disabled by System Automation" 
            : isTestingMode 
              ? "Manual Control Active" 
              : "System Idle / Automatic"}
        </span>
      </div>

      {/* Custom Toggle Switch */}
      <button
        onClick={handleToggle}
        disabled={is_automate_mode}
        className={`
          relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
          ${isTestingMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
          ${is_automate_mode ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-pressed={isTestingMode}
      >
        <span className="sr-only">Use Testing Mode</span>
        <span
          className={`
            pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${isTestingMode ? 'translate-x-6' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}