//SPEED CONTROL
'use client';

import React from 'react';
import { useSystemStore } from '@/store/system-store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useMQTT } from '@/hooks/use-mqtt';
import { MQTT_TOPICS } from '@/lib/mqtt/topics';

interface SpeedControlProps {
  is_enabled?: boolean;
}

export function SpeedControl({ is_enabled = true }: SpeedControlProps) {
  const speed_level = useSystemStore((s) => s.speed_level);
  const set_speed_level = useSystemStore((s) => s.set_speed_level);
  const mode = useSystemStore((s) => s.mode);
  const { publish } = useMQTT();

  // Enabled only if power ON and MANUAL mode
  const really_enabled = is_enabled && mode === 'manual';

  return (
    <div className={`space-y-4 ${!really_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Speed Level Display */}
      <div className="flex items-baseline gap-2">
        <Label className="text-sm font-medium">Speed Level:</Label>
        <span className="text-sm font-bold text-blue-600">{speed_level}</span>
      </div>

      {/* Slider */}
      <div className="relative pt-2">
        <Slider
          value={[speed_level]}
          min={0}
          max={4}
          step={1}
          disabled={!really_enabled}
          className="w-full cursor-pointer"
          onValueChange={(value) => {
            const targetLevel = value[0];

            console.log('Slider onValueChange:', targetLevel);

            set_speed_level(targetLevel);

            // Single topic, single value, atomic
            publish(MQTT_TOPICS.STEPPER_SPEED_OUTPUT, {
              StepperSpeedActuator: [targetLevel]
            });
          }}
        />

        {/* Labels */}
        <div className="flex justify-between mt-2 px-0.5">
          {[0, 1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={`text-xs font-medium ${
                step === speed_level ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}