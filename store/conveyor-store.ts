'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ConveyorState, ConveyorDirection } from '@/types';

interface ConveyorStoreState {
  outer_conveyor: ConveyorState;
  inner_conveyor: ConveyorState;
  
  // Actions
  update_conveyor: (conveyor_id: number, data: Partial<ConveyorState>) => void;
  get_conveyor: (conveyor_id: number) => ConveyorState;
  start_animation_loop: () => void;
  stop_animation_loop: () => void;
}

const create_initial_conveyor = (conveyor_id: number): ConveyorState => ({
  conveyor_id,
  direction: 'CW' as const,
  angle_deg: 0,
  position: 0,
  speed_rpm: 0,
  timestamp: new Date().toISOString(),
});

let animation_frame_id: number | null = null;
let last_timestamp: number = Date.now();

export const useConveyorStore = create<ConveyorStoreState>()(
  subscribeWithSelector((set, get) => ({
    outer_conveyor: create_initial_conveyor(1),
    inner_conveyor: create_initial_conveyor(2),
    
    update_conveyor: (conveyor_id: number, data: Partial<ConveyorState>) =>
      set((store) => ({
        [conveyor_id === 1 ? 'outer_conveyor' : 'inner_conveyor']: {
          ...(conveyor_id === 1 ? store.outer_conveyor : store.inner_conveyor),
          ...data,
          timestamp: new Date().toISOString(),
        },
      })),
    
    get_conveyor: (conveyor_id: number) => {
      const store = get();
      return conveyor_id === 1 ? store.outer_conveyor : store.inner_conveyor;
    },

    start_animation_loop: () => {
      if (animation_frame_id !== null) return;

      const animate = () => {
        const current_timestamp = Date.now();
        const delta_time = (current_timestamp - last_timestamp) / 1000; // Convert to seconds
        last_timestamp = current_timestamp;

        set((store) => {
          // Calculate angle change based on RPM and delta time
          // RPM * 6 = degrees per second (60 seconds = 360 degrees)
          const outer_angle_change = (store.outer_conveyor.speed_rpm * 6 * delta_time) % 360;
          const inner_angle_change = (store.inner_conveyor.speed_rpm * 6 * delta_time) % 360;

          const new_outer_angle = 
            store.outer_conveyor.direction === 'CW'
              ? (store.outer_conveyor.angle_deg + outer_angle_change) % 360
              : (store.outer_conveyor.angle_deg - outer_angle_change + 360) % 360;

          const new_inner_angle = 
            store.inner_conveyor.direction === 'CW'
              ? (store.inner_conveyor.angle_deg + inner_angle_change) % 360
              : (store.inner_conveyor.angle_deg - inner_angle_change + 360) % 360;

          return {
            outer_conveyor: {
              ...store.outer_conveyor,
              angle_deg: new_outer_angle,
            },
            inner_conveyor: {
              ...store.inner_conveyor,
              angle_deg: new_inner_angle,
            },
          };
        });

        animation_frame_id = requestAnimationFrame(animate);
      };

      animation_frame_id = requestAnimationFrame(animate);
    },

    stop_animation_loop: () => {
      if (animation_frame_id !== null) {
        cancelAnimationFrame(animation_frame_id);
        animation_frame_id = null;
      }
    },
  }))
);
