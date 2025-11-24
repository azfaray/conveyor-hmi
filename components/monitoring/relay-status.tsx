'use client';

import React from 'react';
import { usePlcStore } from '@/store/plc-store';
import { format_relay_name } from '@/lib/utils/helpers';
import { StatusIndicator } from '@/components/common/status-indicator';

export function RelayStatus() {
  const relays = usePlcStore((state) => state.relay_states);
  const update_relay_state = usePlcStore((state) => state.update_relay_state);

  const handleRelayClick = (relay_id: number) => {
    const relay = relays.find((r) => r.relay_id === relay_id);
    if (!relay) return;

    const new_state = relay.state === 'on' ? 'off' : 'on';

    // Enforce mutual exclusivity for LA1 (1 & 2) and LA2 (3 & 4)
    if (new_state === 'on') {
      if (relay_id === 1) update_relay_state(2, 'off'); // LA1 Forward -> Turn off LA1 Backward
      if (relay_id === 2) update_relay_state(1, 'off'); // LA1 Backward -> Turn off LA1 Forward
      if (relay_id === 3) update_relay_state(4, 'off'); // LA2 Forward -> Turn off LA2 Backward
      if (relay_id === 4) update_relay_state(3, 'off'); // LA2 Backward -> Turn off LA2 Forward
    }

    update_relay_state(relay_id, new_state);
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {relays.map((relay) => (
        <div 
          key={relay.relay_id} 
          className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
          onClick={() => handleRelayClick(relay.relay_id)}
        >
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
