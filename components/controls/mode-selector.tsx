'use client';

import { useSystemStore } from '@/store/system-store';

export function ModeSelector() {
  const { mode, set_mode } = useSystemStore();
  return (
    <div className="flex gap-4">
      {['manual', 'automatic', 'off'].map((m) => (
        <button
          key={m}
          onClick={() => set_mode(m as 'manual' | 'automatic' | 'off')}
          className={`
            px-4 py-2 rounded-lg text-sm
            ${mode === m ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}
          `}
        >
          {m.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
