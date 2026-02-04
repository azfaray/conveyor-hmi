'use client';

import React from 'react';
import { useSystemStore } from '@/store/system-store';
import { ModeSelector } from '@/components/controls/mode-selector';
import { SpeedControl } from '../controls/speed-control';
import { ActuatorControls } from '../controls/actuator-control';
import { ConveyorControls } from '../controls/conveyor-control';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Info,
  Settings,
  Gauge
} from 'lucide-react';

export function ControlsTab() {
  // Removed electricity_status
  const { mode } = useSystemStore();

  const is_manual_mode = mode === 'manual';

  // We treat power as always "true" now, so we don't need a variable for it.

  return (
    <div className="space-y-4">
      {/* Power Alert Removed */}

      {/* Manual Mode Alert */}
      {!is_manual_mode && (
        <Alert className="py-2">
          <Info className="h-4 w-4" />
          <AlertDescription className="ml-2">
            System in {mode} mode. Switch to Manual for manual controls.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Control Grid - Compact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left Column - Mode */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                System Mode
              </h3>
            </div>
            <ModeSelector />
          </Card>
        </div>

        {/* Middle Column - Speed Control */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">
              Speed Control
            </h3>
          </div>
          {/* Always enabled from the parent's perspective. 
              (The component itself likely still checks for Manual mode) */}
          <SpeedControl is_enabled={true} />
        </Card>

        {/* Right Column - Manual Controls */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">
              Actuators
            </h3>
            {/* Only check for manual mode now */}
            <ActuatorControls is_enabled={is_manual_mode} />
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">
              Conveyors
            </h3>
            {/* Only check for manual mode now */}
            <ConveyorControls is_enabled={is_manual_mode} />
          </Card>
        </div>
      </div>
    </div>
  );
}