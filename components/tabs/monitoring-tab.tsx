'use client';

import { DigitalTwin2D } from '../monitoring/digital-twin2d';
import { RelayStatus } from '@/components/monitoring/relay-status';
import { Card } from '@/components/ui/card';

export function MonitoringTab() {
  return (
    <div className="space-y-6">
      {/* 2D Digital Twin */}
      <Card className="p-6">
        <DigitalTwin2D />
      </Card>

      {/* Relay Status */}
      <Card className="p-6">
        <RelayStatus />
      </Card>
    </div>
  );
}

