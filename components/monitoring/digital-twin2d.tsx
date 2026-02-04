//DIGITAL TWIN 2D COMPONENT - FIXED VERSION
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlcStore } from '@/store/plc-store';
import { useSensorStore } from '@/store/sensor-store';
import { useActuatorStore } from '@/store/actuator-store';
import { useConveyorStore } from '@/store/conveyor-store';
import { useSystemStore } from '@/store/system-store';

export function DigitalTwin2D() {
  // Use PLC Store for Points (Real-time MQTT fallback)
  const outer_points_store = usePlcStore((s) => s.outer_points);
  const inner_points_store = usePlcStore((s) => s.inner_points);

  // Real-time Stores
  const sensor_store = useSensorStore();
  const actuator_store = useActuatorStore();
  const conveyor_store = useConveyorStore();
  // const speed_level = useSystemStore((s) => s.speed_level);
  // Access the 'motor_speed' variable directly
  const speed_level = useSensorStore((s) => s.motor_speed); // berubah 

  // Actuator States
  const la1_state = actuator_store.dl_actuator;
  const la2_state = actuator_store.ld_actuator;

  // 2. LOGIKA ANIMASI ROTASI (Hybrid System)
  const [visualOuterAngle, setVisualOuterAngle] = useState(0);
  const [visualInnerAngle, setVisualInnerAngle] = useState(0);
  const [la1Extension, setLa1Extension] = useState(0); // 0 to 40
  const [la2Extension, setLa2Extension] = useState(0); // 0 to 40
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  // Data Mapping (Prioritize Store)
  // Use is_running from conveyor store for logic
  const innerRunning = useSensorStore((s) => s.stepper_inner_sensor.state);
  const outerRunning = useSensorStore((s) => s.stepper_outer_sensor.state);


  const speedMultiplier = speed_level * 10; // This gives us the RPM based on level

  // Logic: If running AND speed > 0, use calculated speed, else 0
  // const outerRpm = outerRunning && speed_level > 0 ? speedMultiplier : 0;
  // const innerRpm = innerRunning && speed_level > 0 ? speedMultiplier : 0;

  const outerRpm =  outerRunning && speed_level > 0 ? speedMultiplier : 0;
  const innerRpm =  innerRunning && speed_level > 0 ? speedMultiplier : 0;

  // --- SYNC POSISI SAAT DIAM ---
  useEffect(() => {
    if (outerRpm === 0) setVisualOuterAngle(0);
    if (innerRpm === 0) setVisualInnerAngle(0);
  }, [outerRpm, innerRpm]);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      
      const outerSpeedDeg = outerRpm * 6;
      const innerSpeedDeg = innerRpm * 6;

      if (outerSpeedDeg > 0 || innerSpeedDeg > 0) {
        setVisualOuterAngle((prev) => (prev + outerSpeedDeg * deltaTime) % 360);
        setVisualInnerAngle((prev) => (prev + innerSpeedDeg * deltaTime) % 360);
      }

      // Linear Actuator Animation Logic
      // Stroke 100mm = 40 units => 1mm = 0.4 units.
      // Speed 10mm/s = 4 units/s.
      const STROKE_PIXELS = 40;
      const SPEED_PIXELS_S = 4;

      // LA1 Logic
      let dir1 = 0;
      if (la1_state.push && !la1_state.pull) dir1 = 1;
      else if (!la1_state.push && la1_state.pull) dir1 = -1;

      if (dir1 !== 0) {
        setLa1Extension((prev) => {
          const next = prev + dir1 * SPEED_PIXELS_S * deltaTime;
          return Math.max(0, Math.min(next, STROKE_PIXELS));
        });
      }

      // LA2 Logic
      let dir2 = 0;
      if (la2_state.push && !la2_state.pull) dir2 = 1;
      else if (!la2_state.push && la2_state.pull) dir2 = -1;

      if (dir2 !== 0) {
        setLa2Extension((prev) => {
          const next = prev + dir2 * SPEED_PIXELS_S * deltaTime;
          return Math.max(0, Math.min(next, STROKE_PIXELS));
        });
      }

    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [outerRpm, innerRpm, la1_state.push, la1_state.pull, la2_state.push, la2_state.pull]);

  // 3. PREPARE DATA (Mapping dari DB ke Visual)
  // Real-time Actuators (For color mainly)
  const relay_actuator_1 = la1_state.push;
  const relay_actuator_2 = la2_state.push;

  // Real-time Sensors
  const relay_ir = sensor_store.ir_sensor.state;
  const relay_inductive = sensor_store.inductive_sensor.state;
  const relay_capacitive = sensor_store.capacitive_sensor.state;

  // Map Store Points to Visual Array
  const outer_points = [1, 2, 3, 4, 5].map(id => {
    const pt = outer_points_store[`O${id}` as any];
    const stateVal = pt?.state || 'non-occupied';
    return {
      id,
      state: stateVal === 'non-occupied' ? 'empty' : (stateVal === 'occupied-metallic' ? 'occupied_metallic' : 'occupied')
    };
  });

  const inner_points = [1, 2, 3, 4, 5].map(id => {
    const pt = inner_points_store[`I${id}` as any];
    const stateVal = pt?.state || 'non-occupied';
    return {
      id,
      state: stateVal === 'non-occupied' ? 'empty' : 'occupied'
    };
  });

  // Constants
  const LA_LENGTH = 80;
  const OUTER_RADIUS = 150;
  const INNER_RADIUS = 80;
  const CENTER_X = 400;
  const CENTER_Y = 250;

  return (
    <div className="w-full space-y-4 flex flex-col xl:flex-row gap-4">
      {/* --- BAGIAN 1: SVG VISUALIZATION --- */}
      <div className="w-full xl:w-2/3 h-[500px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 800 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          
          {/* OUTER CONVEYOR GROUP */}
          <g transform={`rotate(${visualOuterAngle} ${CENTER_X} ${CENTER_Y})`}>
            <circle cx={CENTER_X} cy={CENTER_Y} r={OUTER_RADIUS} fill="none" stroke="#93c5fd" strokeWidth="30" opacity="0.4" />
            <circle cx={CENTER_X} cy={CENTER_Y} r={OUTER_RADIUS} fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="15,10" />
            
            {outer_points.map((point, index) => {
              const rotated_angle = (-90 + (index * (360 / outer_points.length))) * (Math.PI / 180);
              const x = CENTER_X + OUTER_RADIUS * Math.cos(rotated_angle);
              const y = CENTER_Y + OUTER_RADIUS * Math.sin(rotated_angle);

              let fill = '#6b7280'; let stroke = '#374151'; let width = 2;
              if (point.state === 'occupied') { fill = '#fbbf24'; stroke = '#d97706'; width = 3; }
              else if (point.state === 'occupied_metallic') { fill = '#ef4444'; stroke = '#991b1b'; width = 3; }

              return (
                <g key={point.id}>
                  <circle cx={x} cy={y} r={14} fill={fill} stroke={stroke} strokeWidth={width} />
                  <text x={x} y={y + 5} textAnchor="middle" className="text-[11px] fill-white font-bold pointer-events-none">{point.id}</text>
                </g>
              );
            })}
          </g>

          {/* INNER CONVEYOR GROUP */}
          <g transform={`rotate(${visualInnerAngle} ${CENTER_X} ${CENTER_Y})`}>
            <circle cx={CENTER_X} cy={CENTER_Y} r={INNER_RADIUS} fill="none" stroke="#86efac" strokeWidth="20" opacity="0.4" />
            <circle cx={CENTER_X} cy={CENTER_Y} r={INNER_RADIUS} fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="15,10" />
            
            {inner_points.map((point, index) => {
              const rotated_angle = (-90 + (index * (360 / inner_points.length))) * (Math.PI / 180);
              const x = CENTER_X + INNER_RADIUS * Math.cos(rotated_angle);
              const y = CENTER_Y + INNER_RADIUS * Math.sin(rotated_angle);

              let fill = point.state === 'occupied' ? '#fbbf24' : '#6b7280';
              let stroke = point.state === 'occupied' ? '#d97706' : '#374151';

              return (
                <g key={point.id}>
                  <circle cx={x} cy={y} r={12} fill={fill} stroke={stroke} strokeWidth={2} />
                  <text x={x} y={y + 4} textAnchor="middle" className="text-[10px] fill-white font-bold pointer-events-none">{point.id}</text>
                </g>
              );
            })}
          </g>

          {/* --- ACTUATORS & SENSORS (ANIMATED) --- */}

          {/* Linear Actuator 1 (DL) */}
          <g>
            <rect x={CENTER_X - OUTER_RADIUS - LA_LENGTH / 2} y={CENTER_Y - 8} width={LA_LENGTH} height={16} fill={relay_actuator_1 ? '#7c3aed' : '#9ca3af'} stroke={relay_actuator_1 ? '#5b21b6' : '#6b7280'} strokeWidth="3" rx="4" />

            {/* Moving Head */}
            <rect
              x={(CENTER_X - OUTER_RADIUS - LA_LENGTH / 2 + 10) + la1Extension}
              y={CENTER_Y - 12}
              width={24}
              height={24}
              fill={relay_actuator_1 ? '#c4b5fd' : '#d1d5db'}
              stroke={relay_actuator_1 ? '#5b21b6' : '#6b7280'}
              strokeWidth="3"
              rx="3"
            />
            <text x={CENTER_X - OUTER_RADIUS - LA_LENGTH / 2 - 10} y={CENTER_Y + 5} textAnchor="end" className="text-[11px] fill-current font-semibold">LA1</text>
          </g>

          {/* Inductive Sensor */}
          <g>
            <rect x={CENTER_X - OUTER_RADIUS - 15} y={CENTER_Y - 9} width={30} height={18} fill={relay_inductive ? '#3b82f6' : '#bfdbfe'} stroke="#1e3a8a" strokeWidth="2" rx="3" />
            {relay_inductive && (
              <circle cx={CENTER_X - OUTER_RADIUS + 15} cy={CENTER_Y} r="4" fill="#60a5fa" opacity="0.8"><animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" /></circle>
            )}
            <text x={CENTER_X - OUTER_RADIUS - 35} y={CENTER_Y + 25} textAnchor="middle" className="text-[11px] fill-current font-bold">IP</text>
          </g>

          {/* IR Sensor */}
          <g>
            <rect x={CENTER_X + OUTER_RADIUS * Math.cos((200 * Math.PI) / 180) - 75} y={CENTER_Y + OUTER_RADIUS * Math.sin((200 * Math.PI) / 180) - 9} width={30} height={18} fill={relay_ir ? '#f97316' : '#fed7aa'} stroke="#9a3412" strokeWidth="2" rx="3" />
            {relay_ir && <circle cx={CENTER_X + OUTER_RADIUS * Math.cos((200 * Math.PI) / 180)} cy={CENTER_Y + OUTER_RADIUS * Math.sin((200 * Math.PI) / 180)} r="4" fill="#ff6b35" opacity="0.8"><animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" /></circle>}
            <text x={CENTER_X + OUTER_RADIUS * Math.cos((210 * Math.PI) / 180) - 70} y={CENTER_Y + OUTER_RADIUS * Math.sin((210 * Math.PI) / 180) + 10} textAnchor="middle" className="text-[11px] fill-current font-bold">IR</text>
          </g>

          {/* Linear Actuator 2 (LD) */}
          <g>
            <rect x={CENTER_X + INNER_RADIUS - LA_LENGTH / 2} y={CENTER_Y - 8} width={LA_LENGTH} height={16} fill={relay_actuator_2 ? '#7c3aed' : '#9ca3af'} stroke={relay_actuator_2 ? '#5b21b6' : '#6b7280'} strokeWidth="3" rx="4" />

            {/* Moving Head */}
            <rect
              x={(CENTER_X + INNER_RADIUS - LA_LENGTH / 2 + 10) + la2Extension}
              y={CENTER_Y - 12}
              width={24}
              height={24}
              fill={relay_actuator_2 ? '#c4b5fd' : '#d1d5db'}
              stroke={relay_actuator_2 ? '#5b21b6' : '#6b7280'}
              strokeWidth="3"
              rx="3"
            />
            <text x={CENTER_X + INNER_RADIUS + LA_LENGTH / 2 + 10} y={CENTER_Y + 5} textAnchor="start" className="text-[11px] fill-current font-semibold">LA2</text>
          </g>

          {/* Capacitive Sensor */}
          <g>
            <rect x={CENTER_X + INNER_RADIUS - 15} y={CENTER_Y - 9} width={30} height={18} fill={relay_capacitive ? '#eab308' : '#fef08a'} stroke="#713f12" strokeWidth="2" rx="3" />
            {relay_capacitive && (
              <circle cx={CENTER_X + INNER_RADIUS} cy={CENTER_Y} r="4" fill="#facc15" opacity="0.8"><animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" /></circle>
            )}
            <text x={CENTER_X + INNER_RADIUS + 35} y={CENTER_Y + 25} textAnchor="middle" className="text-[11px] fill-current font-bold">CP</text>
          </g>

          {/* Speed Display - Single Text at Bottom */}
          <text x={CENTER_X} y="485" textAnchor="middle" className="text-base fill-gray-700 dark:fill-gray-300 font-bold">
            Speed: Level {speed_level}
          </text>
        </svg>
      </div>

      {/* --- BAGIAN 2: STATISTIK & LEGEND (SIDEBAR) --- */}
      <div className="w-full xl:w-1/3 space-y-4 flex flex-col">

        {/* Statistics */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Object Count</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span>Outer Total:</span>
              <b className="text-lg">{sensor_store.object_outer_count}</b>
            </div>
            <hr className="border-gray-300 dark:border-gray-700 my-2"/>
            <div className="flex justify-between items-center">
              <span>Inner Total:</span>
              <b className="text-lg">{sensor_store.object_inner_count}</b>
            </div>
          </div>
        </div>

        {/* Sensor Status List (Inline Visual) */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
           <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Sensor Status</h3>
           <div className="space-y-2">
              <SensorStatusRow label="IR Sensor" active={relay_ir} />
              <SensorStatusRow label="Inductive" active={relay_inductive} />
              <SensorStatusRow label="Capacitive" active={relay_capacitive} />
            <SensorStatusRow label="Proximity (Outer)" active={sensor_store.position_outer_sensor.state} />
            <SensorStatusRow label="Proximity (Inner)" active={sensor_store.position_inner_sensor.state} />
           </div>
        </div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function SensorStatusRow({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <div className={`px-2 py-0.5 rounded text-xs font-bold ${active ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
        {active ? 'ACTIVE' : 'IDLE'}
      </div>
    </div>
  )
}