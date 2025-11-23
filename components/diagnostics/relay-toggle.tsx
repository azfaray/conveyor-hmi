'use client';

import React from 'react';
import { usePlcStore } from '@/store/plc-store';
import { format_relay_name } from '@/lib/utils/helpers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function RelayToggle() {
  const relays = usePlcStore((state) => state.relay_states);
  const update_state = usePlcStore((state) => state.update_relay_state);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {relays.map((relay) => (
        <div
          key={relay.relay_id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card"
        >
          <Label
            htmlFor={`relay-${relay.relay_id}`}
            className="font-medium cursor-pointer"
          >
            {format_relay_name(relay.relay_id)}
          </Label>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold uppercase ${relay.state === 'on'
                  ? 'text-green-600'
                  : 'text-gray-400'
                }`}
            >
              {relay.state}
            </span>
            <Switch
              id={`relay-${relay.relay_id}`}
              checked={relay.state === 'on'}
              onCheckedChange={(checked) =>
                update_state(relay.relay_id, checked ? 'on' : 'off')
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
