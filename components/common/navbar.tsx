// File: src/components/common/navbar.tsx (Client Component)
'use client';

import React from 'react';
import { useSystemStore } from '@/store/system-store';
import { MqttStatus } from '@/components/common/mqtt-status';
import { StatusIndicator } from '@/components/common/status-indicator';
import { Card } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';

export function Navbar() {
  const { mqtt_online_status, mqtt_connected } = useSystemStore();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <Card className="rounded-none border-b-2 py-2">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ⚙️ Conveyor HMI
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Sorting System v1.0
              </span>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-6">
              {/* MQTT Connection */}
              <MqttStatus is_connected={mqtt_connected} />

              {/* Online Status (Replacing Power Status) */}
              <div className="flex items-center gap-2">
                <StatusIndicator
                  status={mqtt_online_status === 2 ? 'safe' : 'inactive'}
                  size="small"
                />
                <span className="text-sm font-medium">
                  {mqtt_online_status === 2 ? 'System Online' : 'Offline / Standby'}
                </span>
              </div>

              {/* Theme Toggle (optional) */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </Card>
    </nav>
  );
}

function ThemeToggle() {
  const [theme, set_theme] = React.useState<'light' | 'dark'>('light');

  const toggle_theme = (): void => {
    const new_theme = theme === 'light' ? 'dark' : 'light';
    set_theme(new_theme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggle_theme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
