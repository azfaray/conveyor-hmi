'use client';

import React from 'react';
import { useSystemStore } from '@/store/system-store';
import { ModeSelector } from '@/components/controls/mode-selector';
import { SpeedControl } from '../controls/speed-control';
import { ActuatorControls } from '../controls/actuator-control';
import { ConveyorControls } from '../controls/conveyor-control';
import { EmergencyStop } from '@/components/controls/emergency-stop';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Info,
  Settings,
  Gauge,
  AlertOctagon
} from 'lucide-react';

export function ControlsTab() {
  const { mode, electricity_status } = useSystemStore();

  const is_manual_mode = mode === 'manual';
  const has_power = electricity_status === 'live';

  return (
    <div className="space-y-4">
      {/* Status Alerts - Compact */}
      {!has_power && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            No power detected. Check electricity status before operating.
          </AlertDescription>
        </Alert>
      )}
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

        {/* Left Column - Mode & Emergency */}
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

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Emergency Stop
              </h3>
            </div>
            <EmergencyStop is_enabled={has_power && is_manual_mode} />
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
          <SpeedControl is_enabled={has_power} />
        </Card>

        {/* Right Column - Manual Controls */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">
              Actuators
            </h3>
            <ActuatorControls is_enabled={has_power && is_manual_mode} />
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">
              Conveyors
            </h3>
            <ConveyorControls is_enabled={has_power && is_manual_mode} />
          </Card>
        </div>
      </div>
    </div>
  );
}
