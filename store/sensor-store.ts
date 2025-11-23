// File: src/store/sensor-store.ts
'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { SensorStatus, SensorType, SensorTriggerState } from '@/types';

interface SensorStoreState {
  ir_sensor: SensorStatus;
  inductive_sensor: SensorStatus;
  capacitive_sensor: SensorStatus;
  
  // Actions
  update_sensor: (sensor_type: SensorType, state: SensorTriggerState) => void;
}

const create_initial_sensor = (sensor: SensorType): SensorStatus => ({
  sensor,
  state: 'not-triggered' as const,
  timestamp: new Date().toISOString(),
});

export const useSensorStore = create<SensorStoreState>()(
  subscribeWithSelector((set) => ({
    ir_sensor: create_initial_sensor('ir'),
    inductive_sensor: create_initial_sensor('inductive'),
    capacitive_sensor: create_initial_sensor('capacitive'),
    
    update_sensor: (sensor_type: SensorType, state: SensorTriggerState) =>
      set((store) => ({
        [`${sensor_type}_sensor` as const]: {
          ...(store[`${sensor_type}_sensor` as const]),
          state,
          timestamp: new Date().toISOString(),
        },
      })),
  }))
);
