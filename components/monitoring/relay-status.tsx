'use client';

import React from 'react';
import { StatusIndicator } from '@/components/common/status-indicator';
import { useActuatorStore } from '@/store/actuator-store';
import { useConveyorStore } from '@/store/conveyor-store';
import { useSensorStore } from '@/store/sensor-store';

// Kita terima data dari parent (MonitoringTab)
export function RelayStatus() {

  const actuator_store = useActuatorStore();
  const conveyor_store = useConveyorStore();
  const sensor_store = useSensorStore();

  // Create relay list merging Real-time Store (Priority) with DB Data (Fallback)
  const relayList = [
    // Actuators (DL/LD)
    { name: 'DL Push', active: useSensorStore((s) => s.feedback_actuator_dl_push.state) },
    { name: 'DL Pull', active: useSensorStore((s) => s.feedback_actuator_dl_pull.state) },
    { name: 'LD Push', active: useSensorStore((s) => s.feedback_actuator_ld_push.state) },
    { name: 'LD Pull', active: useSensorStore((s) => s.feedback_actuator_ld_pull.state) },
    
    // Steppers
    { name: 'Stepper Inner', active: useSensorStore((s) => s.stepper_inner_sensor.state) },
    { name: 'Stepper Outer', active: useSensorStore((s) => s.stepper_outer_sensor.state) },
    
    // Sensors
    { name: 'IR Sensor', active: sensor_store.ir_sensor.state },
    { name: 'Inductive', active: sensor_store.inductive_sensor.state },
    { name: 'Capacitive', active: sensor_store.capacitive_sensor.state },
    { name: 'Pos Inner', active: sensor_store.position_inner_sensor.state },
    { name: 'Pos Outer', active: sensor_store.position_outer_sensor.state },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {relayList.map((relay, index) => (
        <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
          
          {/* Indikator Lampu */}
          <StatusIndicator
            status={relay.active ? 'active' : 'inactive'}
            size="small"
            animated={relay.active} // Kedip kalau aktif
            title={relay.name}
          />

          <div className="flex flex-col">
            {/* Nama Relay */}
            <div className="font-semibold text-sm">{relay.name}</div>
            
            {/* Status Text (ON/OFF) */}
            <div className={`text-xs font-mono ${relay.active ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
              State: {relay.active ? 'ON' : 'OFF'}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}