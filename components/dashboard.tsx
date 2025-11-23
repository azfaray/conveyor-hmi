// File: src/components/dashboard.tsx (Client Component)
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonitoringTab } from './tabs/monitoring-tab';
import { ControlsTab } from './tabs/controls-tab';
import { DiagnosticsTab } from './tabs/diagnostics-tab';

type TabType = 'monitoring' | 'controls' | 'diagnostics';

export function Dashboard() {
  const [active_tab, set_active_tab] = useState<TabType>('monitoring');

  return (
    <div className="container mx-auto p-6">
      <Tabs
        value={active_tab}
        onValueChange={(value) => set_active_tab(value as TabType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring" className="text-base">
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="controls" className="text-base">
            Controls
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-base">
            Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          <MonitoringTab />
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <ControlsTab />
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <DiagnosticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
