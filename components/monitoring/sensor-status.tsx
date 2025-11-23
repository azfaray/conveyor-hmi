// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

'use client';

import { useSensorData } from '@/hooks/use-sensor-data';
import { StatusIndicator } from '@/components/common/status-indicator';

export function SensorStatus() {
  const { data, isLoading } = useSensorData();

  if (isLoading || !data) {
    return <div>Loading sensor status...</div>;
  }

  return (
    <div className="flex gap-8">
      {['ir', 'inductive', 'capacitive'].map((sensor) => (
        <div key={sensor} className="flex flex-col items-center">
          <StatusIndicator
            status={data[sensor].state === 'triggered' ? 'active' : 'inactive'}
            size="medium"
            animated={data[sensor].state === 'triggered'}
            title={sensor}
          />
          <div className="mt-2 font-semibold capitalize text-center text-sm">{sensor} sensor</div>
          <div className="text-xs opacity-70 text-center">State: {data[sensor].state}</div>
        </div>
      ))}
    </div>
  );
}
