'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface SingleActuatorState {
  push: boolean;
  pull: boolean;
  timestamp: string;
}

interface ActuatorStoreState {
  dl_actuator: SingleActuatorState; 
  ld_actuator: SingleActuatorState; 
  
  // ✅ NEW: The Speed Variable
  stepper_speed: number; 

  update_actuator_state: (id: 'dl' | 'ld', data: Partial<SingleActuatorState>) => void;
  set_stepper_speed: (speed: number) => void;
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
    
    // Default to 1 so if data is missing, it doesn't freeze the animation
    stepper_speed: 1, 

    update_actuator_state: (id, data) =>
      set((store) => {
        // Safe object update pattern
        const key = `${id}_actuator` as const;
        return {
          [key]: {
            ...store[key],
            ...data,
            timestamp: new Date().toISOString(),
          }
        } as Partial<ActuatorStoreState>;
      }),

    // ✅ Action to update speed
    set_stepper_speed: (speed) => set({ stepper_speed: speed }),
  }))
);