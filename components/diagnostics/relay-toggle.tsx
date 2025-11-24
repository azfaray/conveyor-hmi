'use client';

import React from 'react';
import { usePlcStore } from '@/store/plc-store';
import { format_relay_name } from '@/lib/utils/helpers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function RelayToggle() {
  const relays = usePlcStore((state) => state.relay_states);
  const update_state = usePlcStore((state) => state.update_relay_state);

  // Helper to check if a specific relay is ON
  const is_relay_on = (id: number) => relays.find((r) => r.relay_id === id)?.state === 'on';

  // Define mutually exclusive pairs
  // Key = Relay ID, Value = The ID of its opposite direction
  const INTERLOCKS: Record<number, number> = {
    1: 2, // If 1 (LA1 Fwd) is target, check 2 (LA1 Bwd)
    2: 1, // If 2 (LA1 Bwd) is target, check 1 (LA1 Fwd)
    3: 4, // If 3 (LA2 Fwd) is target, check 4 (LA2 Bwd)
    4: 3, // If 4 (LA2 Bwd) is target, check 3 (LA2 Fwd)
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {relays.map((relay) => {
        // Determine if this specific switch should be disabled
        const opposite_id = INTERLOCKS[relay.relay_id];
        const is_disabled = opposite_id ? is_relay_on(opposite_id) : false;

        return (
          <div
            key={relay.relay_id}
            className={`flex items-center justify-between p-3 rounded-lg border bg-card ${
              is_disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Label
              htmlFor={`relay-${relay.relay_id}`}
              className={`font-medium ${is_disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {format_relay_name(relay.relay_id)}
            </Label>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold uppercase ${
                  relay.state === 'on' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {relay.state}
              </span>
              <Switch
                id={`relay-${relay.relay_id}`}
                checked={relay.state === 'on'}
                disabled={is_disabled} // Block user interaction if opposite is ON
                onCheckedChange={(checked) =>
                  update_state(relay.relay_id, checked ? 'on' : 'off')
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}