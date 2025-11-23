'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { SystemMode, ElectricityStatus } from '@/types';

interface SystemStoreState {
  mode: SystemMode;
  speed_level: number; // 1-5
  electricity_status: ElectricityStatus;
  mqtt_connected: boolean;
  last_mqtt_update: string | null;
  error_message: string | null;
  
  // Actions
  set_mode: (mode: SystemMode) => void;
  set_speed_level: (level: number) => void;
  set_electricity_status: (status: ElectricityStatus) => void;
  set_mqtt_connected: (connected: boolean) => void;
  set_last_mqtt_update: (timestamp: string) => void;
  set_error_message: (message: string | null) => void;
  reset_error: () => void;
}

export const useSystemStore = create<SystemStoreState>()(
  subscribeWithSelector((set) => ({
    mode: 'automatic',
    speed_level: 3,
    electricity_status: 'not-live',
    mqtt_connected: false,
    last_mqtt_update: null,
    error_message: null,
    
    set_mode: (mode: SystemMode) => set({ mode }),
    set_speed_level: (level: number) => set({ 
      speed_level: Math.max(1, Math.min(5, level)) 
    }),
    set_electricity_status: (status: ElectricityStatus) => 
      set({ electricity_status: status }),
    set_mqtt_connected: (connected: boolean) => 
      set({ mqtt_connected: connected }),
    set_last_mqtt_update: (timestamp: string) => 
      set({ last_mqtt_update: timestamp }),
    set_error_message: (message: string | null) => 
      set({ error_message: message }),
    reset_error: () => set({ error_message: null }),
  }))
);
