'use client';

import React from 'react';
import { usePlcStore } from '@/store/plc-store';
import { format_relay_name } from '@/lib/utils/helpers';
import { StatusIndicator } from '@/components/common/status-indicator';

export function RelayStatus() {
  const relays = usePlcStore((state) => state.relay_states);

  return (
    <div className="grid grid-cols-3 gap-6">
      {relays.map((relay) => (
        <div key={relay.relay_id} className="flex items-center gap-3">
          <StatusIndicator
            status={relay.state === 'on' ? 'active' : 'inactive'}
            size="small"
            animated={relay.state === 'on'}
            title={format_relay_name(relay.relay_id)}
          />
          <div className="font-semibold">{format_relay_name(relay.relay_id)}</div>
          <div className="text-xs opacity-80">State: {relay.state}</div>
        </div>
      ))}
    </div>
  );
}
