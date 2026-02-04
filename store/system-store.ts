'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
// Pastikan sendCommand ada di actions.ts, kalau error comment dulu baris ini & bagian toggle_actuator
// import { sendCommand } from '@/app/actions'; 

// Definisi Tipe
export type SystemMode = 'manual' | 'automatic' | 'off';
export type ElectricityStatus = 'live' | 'not-live';

interface SystemStoreState {
  // --- 1. STATE CONTROL UTAMA ---
  mode: SystemMode;
  speed_level: number;
  electricity_status: ElectricityStatus;

  // --- 2. STATE SYSTEM/MQTT (YANG TADI HILANG) ---
  mqtt_connected: boolean;
  last_mqtt_update: string | null;
  error_message: string | null;
  
  // --- 3. ACTIONS CONTROL ---
  set_mode: (mode: SystemMode) => void;
  set_speed_level: (level: number) => void;
  set_electricity_status: (status: ElectricityStatus) => void;
  toggle_actuator: (part: string, action: 'extend' | 'retract') => void;

  // --- 4. ACTIONS SYSTEM/MQTT (RESTORED) ---
  set_mqtt_connected: (connected: boolean) => void;
  set_last_mqtt_update: (timestamp: string) => void;
  set_error_message: (message: string | null) => void;
  reset_error: () => void;
  
  // New Online Status
  mqtt_online_status: number;
  set_mqtt_online_status: (status: number) => void;
}

export const useSystemStore = create<SystemStoreState>()(
  subscribeWithSelector((set) => ({
    // --- INITIAL STATES ---
    mode: 'automatic',
    speed_level: 3,
    electricity_status: 'not-live',
    mqtt_connected: false,
    last_mqtt_update: null,
    error_message: null,
    mqtt_online_status: 0,

    // --- IMPLEMENTASI CONTROL ---
    set_mode: (mode) => set({ mode }),
    
    set_speed_level: (level) => set({ 
      speed_level: Math.max(0, Math.min(4, level)) 
    }),
    
    set_electricity_status: (status) => set({ electricity_status: status }),

    toggle_actuator: async (part, action) => {
      // Logic kirim database (Opsional, kalau sendCommand belum siap bisa dikosongin dulu)
      /* 
      // LEGACY CODE - REMOVED
      try {
        let updates = {};
        if (part === 'LA1') {
          updates = { la1Forward: action === 'extend', la1Backward: action === 'retract' };
        } else if (part === 'LA2') {
          updates = { la2Forward: action === 'extend', la2Backward: action === 'retract' };
        }
        await sendCommand(updates);
      } catch (e) {
        console.error("Gagal toggle actuator:", e);
      }
      */
     console.warn('toggle_actuator is deprecated');
    },

    // --- IMPLEMENTASI MQTT (RESTORED) ---
    // Ini yang bikin error tadi karena hilang
    set_mqtt_connected: (connected) => set({ mqtt_connected: connected }),
    
    set_last_mqtt_update: (timestamp) => set({ last_mqtt_update: timestamp }),
    
    set_error_message: (message) => set({ error_message: message }),
    
    reset_error: () => set({ error_message: null }),

    // New Online Status
    set_mqtt_online_status: (status) => set({ mqtt_online_status: status }),
  }))
);