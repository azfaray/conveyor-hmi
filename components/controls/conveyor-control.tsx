'use client';

import { useConveyorStore } from '@/store/conveyor-store';

interface ConveyorControlsProps {
  is_enabled?: boolean;
}
export function ConveyorControls({ is_enabled = true }: ConveyorControlsProps) {
  const update_conveyor = useConveyorStore((state) => state.update_conveyor);

  function rotate(id: number, direction: 'CW' | 'CCW') {
    if (is_enabled) {
      update_conveyor(id, { direction });
    }
  }
  function stop(id: number) {
    if (is_enabled) {
      update_conveyor(id, { speed_rpm: 0 });
    }
  }
  return (
    <div className="space-y-4">
      {[1, 2].map((id) => (
        <div key={id} className="flex gap-2 items-center">
          <span className="font-bold">Conveyor{id}</span>
          <button
            className="px-3 py-2 rounded text-sm bg-blue-500 text-white"
            disabled={!is_enabled}
            onClick={() => rotate(id, 'CW')}
          >
            Rotate CW
          </button>
          <button
            className="px-3 py-2 rounded text-sm bg-purple-500 text-white"
            disabled={!is_enabled}
            onClick={() => rotate(id, 'CCW')}
          >
            Rotate CCW
          </button>
          <button
            className="px-3 py-2 rounded text-sm bg-gray-400 text-white"
            disabled={!is_enabled}
            onClick={() => stop(id)}
          >
            Stop
          </button>
        </div>
      ))}
    </div>
  );
}
