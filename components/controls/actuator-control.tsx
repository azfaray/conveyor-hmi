'use client';

import React from 'react';
import { useActuatorStore } from '@/store/actuator-store';

interface ActuatorControlsProps {
  is_enabled?: boolean;
}
export function ActuatorControls({ is_enabled = true }: ActuatorControlsProps) {
  const actuator_1 = useActuatorStore((state) => state.actuator_1);
  const actuator_2 = useActuatorStore((state) => state.actuator_2);
  const update_actuator = useActuatorStore((state) => state.update_actuator);

  function move(id: number, direction: 'forward' | 'backward') {
    if (is_enabled) {
      update_actuator(id, { state: `moving-${direction}` });
    }
  }
  return (
    <div className="space-y-4">
      {[1, 2].map((id) => (
        <div key={id} className="flex gap-2 items-center">
          <span className="font-bold">LA{id}</span>
          <button
            className="px-3 py-2 rounded bg-green-500 text-white"
            disabled={!is_enabled}
            onClick={() => move(id, 'forward')}
          >
            Extend
          </button>
          <button
            className="px-3 py-2 rounded bg-yellow-500 text-white"
            disabled={!is_enabled}
            onClick={() => move(id, 'backward')}
          >
            Retract
          </button>
          <span className="text-xs ml-2">State: {id === 1 ? actuator_1.state : actuator_2.state}</span>
        </div>
      ))}
    </div>
  );
}
