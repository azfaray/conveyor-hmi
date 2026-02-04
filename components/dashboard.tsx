'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import Store & Actions untuk Cek Power Global
import { getLatestData } from '@/app/actions';
import { useSystemStore } from '@/store/system-store';

// Import Semua Tab (LENGKAP)
import { MonitoringTab } from './tabs/monitoring-tab';
import { ControlsTab } from './tabs/controls-tab';
import { DiagnosticsTab } from './tabs/diagnostics-tab'; // ✅ Diagnostics Ada
import { DatabaseTab } from './tabs/database-tab';       // ✅ Database Ada

// Tipe Tab Lengkap
type TabType = 'monitoring' | 'controls' | 'diagnostics' | 'database';

export function Dashboard() {
  const [active_tab, set_active_tab] = useState<TabType>('monitoring');

  // --- GLOBAL POWER CHECKER ---
  // Note: Power status is now handled via MQTT or assumes 'live' default if not persisted in logs.
  // Previous DB check removed as 'isPowerLive' is not in current schema.

  return (
    <div className="container mx-auto p-6">
      <Tabs
        value={active_tab}
        onValueChange={(value) => set_active_tab(value as TabType)}
        className="w-full"
      >
        {/* Navigation Tabs (Grid 4 Kolom) */}
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="database">Database & Trends</TabsTrigger>
        </TabsList>

        {/* Content Area */}
        <TabsContent value="monitoring" className="space-y-6">
          <MonitoringTab />
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <ControlsTab />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseTab />
        </TabsContent>

      </Tabs>
    </div>
  );
}