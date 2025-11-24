'use client';

import React, { useState, useEffect } from 'react';
import { RelayToggle } from '../diagnostics/relay-toggle';
import { PlacingPointModifier } from '../diagnostics/placing-points-modifier';
import { SystemLogs } from '@/components/diagnostics/system-logs';
import { ConnectionDiagnostics } from '../diagnostics/connection-diagnostics';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DiagnosticsTab() {
  // 1. Initialize state safely (check localStorage if available)
  const [diagnostics_mode, set_diagnostics_mode] = useState<boolean>(false);
  const [is_mounted, set_is_mounted] = useState(false);

  // 2. On Mount: Read from localStorage
  useEffect(() => {
    set_is_mounted(true); // Prevents hydration mismatch
    const saved = localStorage.getItem('diagnostics_mode');
    if (saved) {
      set_diagnostics_mode(JSON.parse(saved));
    }
  }, []);

  // 3. Handler: Update State AND localStorage
  const handleToggle = (checked: boolean) => {
    set_diagnostics_mode(checked);
    localStorage.setItem('diagnostics_mode', JSON.stringify(checked));
  };

  // Prevent flash of incorrect content during hydration
  if (!is_mounted) return null; 

  return (
    <div className="space-y-6">
      {/* Warning */}
      <Alert variant="destructive">
        <AlertDescription>
          ⚠️ Diagnostics Tab - For testing and debugging only. Only use in development!
        </AlertDescription>
      </Alert>
      {/* Enable Diagnostics */}
      <Card className="p-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={diagnostics_mode}
            onChange={(e) => handleToggle(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="font-medium">Enable Diagnostics Mode (Unsafe!)</span>
        </label>
      </Card>

      {diagnostics_mode && (
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="relays">Relays</TabsTrigger>
            <TabsTrigger value="placing-points">Points</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            <Card className="p-6">
              <ConnectionDiagnostics />
            </Card>
          </TabsContent>

          <TabsContent value="relays" className="space-y-6">
            <Card className="p-6">
              <RelayToggle />
            </Card>
          </TabsContent>

          <TabsContent value="placing-points" className="space-y-6">
            <Card className="p-6">
              <PlacingPointModifier />
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="p-6">
              <SystemLogs />
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}