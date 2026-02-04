'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ActuatorStatus } from '@/types';

interface SingleActuatorState {
  push: boolean;
  pull: boolean;
  timestamp: string;
}

interface ActuatorStoreState {
  dl_actuator: SingleActuatorState; // LA1
  ld_actuator: SingleActuatorState; // LA2
  
  // Actions
  update_actuator_state: (id: 'dl' | 'ld', data: Partial<SingleActuatorState>) => void;
}

const create_initial_actuator = (): SingleActuatorState => ({
  push: false,
  pull: false,
  timestamp: new Date().toISOString(),
});

export const useActuatorStore = create<ActuatorStoreState>()(
  subscribeWithSelector((set) => ({
    dl_actuator: create_initial_actuator(),
    ld_actuator: create_initial_actuator(),
    
    update_actuator_state: (id, data) =>
      set((store) => ({
        [`${id}_actuator` as const]: {
          ...(store[`${id}_actuator` as keyof ActuatorStoreState]),
          ...data,
          timestamp: new Date().toISOString(),
        },
      })),
  }))
);