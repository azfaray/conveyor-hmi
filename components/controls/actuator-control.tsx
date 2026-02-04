'use client';

import React from 'react';
import { useActuatorStore } from '@/store/actuator-store';
import { useMQTT } from '@/hooks/use-mqtt';
import { MQTT_TOPICS } from '@/lib/mqtt/topics';

interface ActuatorControlsProps {
  is_enabled?: boolean;
}

export function ActuatorControls({ is_enabled = true }: ActuatorControlsProps) {
  const dl_actuator = useActuatorStore((state) => state.dl_actuator);
  const ld_actuator = useActuatorStore((state) => state.ld_actuator);
  const update_actuator_state = useActuatorStore((state) => state.update_actuator_state);
  const { publish } = useMQTT();

  const controls = [
    { id: 'dl', label: 'DL (Dalam Luar)', state: dl_actuator },
    { id: 'ld', label: 'LD (Luar Dalam)', state: ld_actuator },
  ] as const;

  async function move(id: 'dl' | 'ld', action: 'extend' | 'retract') {
    if (is_enabled) {
      const isPush = action === 'extend';

      // Optimistic Update
      update_actuator_state(id, { push: isPush, pull: !isPush });

      // Coupled Logic: Publish state for BOTH Push and Pull
      // If Pushing: Push=True, Pull=False
      // If Pulling: Push=False, Pull=True

      const pushTopic = id === 'dl' ? MQTT_TOPICS.ACTUATOR_DL_PUSH : MQTT_TOPICS.ACTUATOR_LD_PUSH;
      const pullTopic = id === 'dl' ? MQTT_TOPICS.ACTUATOR_DL_PULL : MQTT_TOPICS.ACTUATOR_LD_PULL;

      const pushNickname = id === 'dl' ? 'DL_Push' : 'LD_Push';
      const pullNickname = id === 'dl' ? 'DL_Pull' : 'LD_Pull';

      // Publish Push State
      publish(pushTopic, { [pushNickname]: [isPush] });

      // Publish Pull State
      publish(pullTopic, { [pullNickname]: [!isPush] });
    }
  }

  // Optional: Stop function if needed
  async function stop(id: 'dl' | 'ld') {
    if (is_enabled) {
      update_actuator_state(id, { push: false, pull: false });

      const pushTopic = id === 'dl' ? MQTT_TOPICS.ACTUATOR_DL_PUSH : MQTT_TOPICS.ACTUATOR_LD_PUSH;
      const pullTopic = id === 'dl' ? MQTT_TOPICS.ACTUATOR_DL_PULL : MQTT_TOPICS.ACTUATOR_LD_PULL;

      const pushNickname = id === 'dl' ? 'DL_Push' : 'LD_Push';
      const pullNickname = id === 'dl' ? 'DL_Pull' : 'LD_Pull';

      publish(pushTopic, { [pushNickname]: [false] });
      publish(pullTopic, { [pullNickname]: [false] });
    }
  }

  return (
    <div className="space-y-4">
      {controls.map((control) => (
        <div key={control.id} className="flex flex-col gap-2 border p-2 rounded">
          <div className="flex gap-2 items-center justify-between">
            <span className="font-bold">{control.label}</span>
            <div className="text-xs space-x-2">
              <span className={control.state.push ? "text-green-600 font-bold" : "text-gray-400"}>PUSH</span>
              <span className={control.state.pull ? "text-blue-600 font-bold" : "text-gray-400"}>PULL</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded bg-green-500 text-white flex-1 hover:bg-green-600 active:bg-green-700"
              disabled={!is_enabled}
              onClick={() => move(control.id, 'extend')}
            >
              Extend
            </button>
            <button
              className="px-3 py-2 rounded bg-yellow-500 text-white flex-1 hover:bg-yellow-600 active:bg-yellow-700"
              disabled={!is_enabled}
              onMouseDown={() => move(control.id, 'retract')} // Maybe onMouseDown for momentary? sticking to click for now
              onClick={() => move(control.id, 'retract')}
            >
              Retract
            </button>
            <button
              className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              disabled={!is_enabled}
              onClick={() => stop(control.id)}
            >
              Stop
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}