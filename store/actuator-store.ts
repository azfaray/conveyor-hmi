// File: src/store/actuator-store.ts
'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { LinearActuator, ActuatorState } from '@/types';

interface ActuatorStoreState {
  actuator_1: LinearActuator;
  actuator_2: LinearActuator;
  
  // Actions
  update_actuator: (actuator_id: number, data: Partial<LinearActuator>) => void;
  get_actuator: (actuator_id: number) => LinearActuator;
}

const create_initial_actuator = (actuator_id: number): LinearActuator => ({
  actuator_id,
  state: 'idle-backward' as const,
  position_mm: 0,
  timestamp: new Date().toISOString(),
});

export const useActuatorStore = create<ActuatorStoreState>()(
  subscribeWithSelector((set, get) => ({
    actuator_1: create_initial_actuator(1),
    actuator_2: create_initial_actuator(2),
    
    update_actuator: (actuator_id: number, data: Partial<LinearActuator>) =>
      set((store) => ({
        [`actuator_${actuator_id}` as const]: {
          ...(store[`actuator_${actuator_id}` as keyof ActuatorStoreState] as LinearActuator),
          ...data,
          timestamp: new Date().toISOString(),
        },
      })),
    
    get_actuator: (actuator_id: number) => {
      const store = get();
      return store[`actuator_${actuator_id}` as keyof ActuatorStoreState] as LinearActuator;
    },
  }))
);