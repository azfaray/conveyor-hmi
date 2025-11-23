// File: src/store/plc-store.ts
'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  OuterPlacingPoint, 
  InnerPlacingPoint, 
  RelayStatus,
  OuterPlacingPointState,
  InnerPlacingPointState 
} from '@/types';
import { APP_CONFIG } from '@/lib/constants/config';

interface PLCStoreState {
  outer_points: OuterPlacingPoint[];
  inner_points: InnerPlacingPoint[];
  relay_states: RelayStatus[];
  
  // Actions
  update_outer_point: (id: string, state: OuterPlacingPointState) => void;
  update_inner_point: (id: string, state: InnerPlacingPointState) => void;
  update_relay_state: (relay_id: number, state: 'on' | 'off') => void;
  reset_all_states: () => void;
}

const initialize_outer_points = (): OuterPlacingPoint[] => {
  return APP_CONFIG.OUTER_PLACING_POINTS.map((id) => ({
    id,
    state: 'non-occupied' as const,
    timestamp: new Date().toISOString(),
  }));
};

const initialize_inner_points = (): InnerPlacingPoint[] => {
  return APP_CONFIG.INNER_PLACING_POINTS.map((id) => ({
    id,
    state: 'non-occupied' as const,
    timestamp: new Date().toISOString(),
  }));
};

const initialize_relays = (): RelayStatus[] => {
  return Array.from({ length: APP_CONFIG.TOTAL_RELAYS }, (_, i) => ({
    relay_id: i + 1,
    state: 'off' as const,
    timestamp: new Date().toISOString(),
  }));
};

export const usePlcStore = create<PLCStoreState>()(
  subscribeWithSelector((set) => ({
    outer_points: initialize_outer_points(),
    inner_points: initialize_inner_points(),
    relay_states: initialize_relays(),
    
    update_outer_point: (id: string, state: OuterPlacingPointState) =>
      set((store) => ({
        outer_points: store.outer_points.map((point) =>
          point.id === id
            ? { ...point, state, timestamp: new Date().toISOString() }
            : point
        ),
      })),
    
    update_inner_point: (id: string, state: InnerPlacingPointState) =>
      set((store) => ({
        inner_points: store.inner_points.map((point) =>
          point.id === id
            ? { ...point, state, timestamp: new Date().toISOString() }
            : point
        ),
      })),
    
    update_relay_state: (relay_id: number, state: 'on' | 'off') =>
      set((store) => ({
        relay_states: store.relay_states.map((relay) =>
          relay.relay_id === relay_id
            ? { ...relay, state, timestamp: new Date().toISOString() }
            : relay
        ),
      })),
    
    reset_all_states: () =>
      set(() => ({
        outer_points: initialize_outer_points(),
        inner_points: initialize_inner_points(),
        relay_states: initialize_relays(),
      })),
  }))
);

