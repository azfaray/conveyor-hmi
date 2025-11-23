'use client';

import { useEffect } from 'react';
import { useConveyorStore } from '@/store/conveyor-store';
import { usePlacingPoints } from '@/hooks/use-placing-points';
import { usePlcStore } from '@/store/plc-store';
import { SensorStatus } from './sensor-status';

export function DigitalTwin2D() {
  const conveyor_store = useConveyorStore();
  const plc_store = usePlcStore();
  const { outer_points, inner_points, is_loading } = usePlacingPoints();

  const outer_state = conveyor_store.outer_conveyor;
  const inner_state = conveyor_store.inner_conveyor;

  useEffect(() => {
    // dummy, replace this later
    conveyor_store.update_conveyor(1, { speed_rpm: 10, direction: 'CW' });
      conveyor_store.update_conveyor(2, { speed_rpm: 15, direction: 'CCW' });
    conveyor_store.start_animation_loop();

    return () => {
      conveyor_store.stop_animation_loop();
    };
  }, []);

  // Start animation loop on mount
  useEffect(() => {
    conveyor_store.start_animation_loop();

    return () => {
      conveyor_store.stop_animation_loop();
    };
  }, [conveyor_store]);

  // Get relay states from PLC store
  const get_relay_state = (relay_id: number) => {
    const relay = plc_store.relay_states.find(r => r.relay_id === relay_id);
    return relay?.state === 'on';
  };

  const relay_actuator_1 = get_relay_state(1);
  const relay_actuator_2 = get_relay_state(2);
  const relay_ir = get_relay_state(3);
  const relay_inductive = get_relay_state(4);
  const relay_capacitive = get_relay_state(5);

  if (is_loading) {
    return (
      <div className="w-full h-[500px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Digital Twin...</p>
        </div>
      </div>
    );
  }

  // Constants for positioning
  const LA_LENGTH = 80;
  const OUTER_RADIUS = 150;
  const INNER_RADIUS = 80;
  const CENTER_X = 400;
  const CENTER_Y = 250;

  return (
    <div className="w-full space-y-4 flex gap-4">
      {/* Digital Twin Visualization */}
      <div className="w-fit h-[500px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* OUTER CONVEYOR GROUP - Rotates with placing points */}
          <g transform={`rotate(${outer_state.angle_deg} ${CENTER_X} ${CENTER_Y})`}>
            {/* Outer Conveyor Circle (Conveyor 1) - Blue */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={OUTER_RADIUS}
              fill="none"
              stroke="#93c5fd"
              strokeWidth="30"
              opacity="0.4"
            />
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={OUTER_RADIUS}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray="15,10"
            />

            {/* Outer placing points - rotate with conveyor */}
            {outer_points.map((point, index) => {
              const base_angle_step = 360 / outer_points.length;
              const base_angle = -90 + (index * base_angle_step);
              const rotated_angle = base_angle * (Math.PI / 180);

              const x = CENTER_X + OUTER_RADIUS * Math.cos(rotated_angle);
              const y = CENTER_Y + OUTER_RADIUS * Math.sin(rotated_angle);

              let fill_color = '#6b7280';
              let stroke_color = '#374151';
              let stroke_width = 2;

              if (point.state === 'occupied') {
                fill_color = '#fbbf24';
                stroke_color = '#d97706';
                stroke_width = 3;
              } else if (point.state === 'occupied-metallic') {
                fill_color = '#ef4444';
                stroke_color = '#991b1b';
                stroke_width = 3;
              }

              return (
                <g key={point.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill={fill_color}
                    stroke={stroke_color}
                    strokeWidth={stroke_width}
                  />
                  <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    className="text-[11px] fill-white font-bold pointer-events-none"
                  >
                    {point.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* INNER CONVEYOR GROUP - Rotates with placing points */}
          <g transform={`rotate(${inner_state.angle_deg} ${CENTER_X} ${CENTER_Y})`}>
            {/* Inner Conveyor Circle (Conveyor 2) - Green */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={INNER_RADIUS}
              fill="none"
              stroke="#86efac"
              strokeWidth="20"
              opacity="0.4"
            />
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={INNER_RADIUS}
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray="15,10"
            />

            {/* Inner placing points - rotate with conveyor */}
            {inner_points.map((point, index) => {
              const base_angle_step = 360 / inner_points.length;
              const base_angle = -90 + (index * base_angle_step);
              const rotated_angle = base_angle * (Math.PI / 180);

              const x = CENTER_X + INNER_RADIUS * Math.cos(rotated_angle);
              const y = CENTER_Y + INNER_RADIUS * Math.sin(rotated_angle);

              const fill_color = point.state === 'occupied' ? '#fbbf24' : '#6b7280';
              const stroke_color = point.state === 'occupied' ? '#d97706' : '#374151';
              const stroke_width = point.state === 'occupied' ? 3 : 2;

              return (
                <g key={point.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={fill_color}
                    stroke={stroke_color}
                    strokeWidth={stroke_width}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="text-[10px] fill-white font-bold pointer-events-none"
                  >
                    {point.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Linear Actuator 1 (9 o'clock - outer conveyor) */}
          <g>
            <rect
              x={CENTER_X - OUTER_RADIUS - LA_LENGTH / 2}
              y={CENTER_Y - 8}
              width={LA_LENGTH}
              height={16}
              fill={relay_actuator_1 ? '#7c3aed' : '#9ca3af'}
              stroke={relay_actuator_1 ? '#5b21b6' : '#6b7280'}
              strokeWidth="3"
              rx="4"
            />
            <rect
              x={relay_actuator_1 ? (CENTER_X - OUTER_RADIUS + 10) : (CENTER_X - OUTER_RADIUS - LA_LENGTH / 2 + 10)}
              y={CENTER_Y - 12}
              width={24}
              height={24}
              fill={relay_actuator_1 ? '#c4b5fd' : '#d1d5db'}
              stroke={relay_actuator_1 ? '#5b21b6' : '#6b7280'}
              strokeWidth="3"
              rx="3"
            >
              {relay_actuator_1 && (
                <animate
                  attributeName="x"
                  values={`${CENTER_X - OUTER_RADIUS - LA_LENGTH / 2 + 10};${CENTER_X - OUTER_RADIUS + 10};${CENTER_X - OUTER_RADIUS - LA_LENGTH / 2 + 10}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            <text
              x={CENTER_X - OUTER_RADIUS - LA_LENGTH / 2 - 10}
              y={CENTER_Y + 5}
              textAnchor="end"
              className="text-[11px] fill-current font-semibold"
            >
              LA1 {relay_actuator_1 ? '(Active)' : '(Idle)'}
            </text>
          </g>

          {/* Inductive Proximity Sensor */}
          <g>
            <rect
              x={CENTER_X - OUTER_RADIUS - 15}
              y={CENTER_Y - 9}
              width={30}
              height={18}
              fill={relay_inductive ? '#3b82f6' : '#bfdbfe'}
              stroke="#1e3a8a"
              strokeWidth="2"
              rx="3"
            />
            {relay_inductive && (
              <>
                <circle cx={CENTER_X - OUTER_RADIUS} cy={CENTER_Y} r="4" fill="#60a5fa" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" />
                </circle>
                <line x1={CENTER_X - OUTER_RADIUS + 15} y1={CENTER_Y} x2={CENTER_X - OUTER_RADIUS + 35} y2={CENTER_Y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="2,2">
                  <animate attributeName="x2" values={`${CENTER_X - OUTER_RADIUS + 15};${CENTER_X - OUTER_RADIUS + 35};${CENTER_X - OUTER_RADIUS + 15}`} dur="1s" repeatCount="indefinite" />
                </line>
              </>
            )}
            <text
              x={CENTER_X - OUTER_RADIUS - 35}
              y={CENTER_Y + 25}
              textAnchor="middle"
              className="text-[11px] fill-current font-bold"
            >
              IP
            </text>
          </g>

          {/* IR Proximity Sensor */}
          <g>
            <rect
              x={CENTER_X + OUTER_RADIUS * Math.cos((200 * Math.PI) / 180) - 75}
              y={CENTER_Y + OUTER_RADIUS * Math.sin((200 * Math.PI) / 180) - 9}
              width={30}
              height={18}
              fill={relay_ir ? '#f97316' : '#fed7aa'}
              stroke="#9a3412"
              strokeWidth="2"
              rx="3"
            />
            {relay_ir && (
              <>
                <circle
                  cx={CENTER_X + OUTER_RADIUS * Math.cos((200 * Math.PI) / 180)}
                  cy={CENTER_Y + OUTER_RADIUS * Math.sin((200 * Math.PI) / 180)}
                  r="4"
                  fill="#ff6b35"
                  opacity="0.8"
                >
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            <text
              x={CENTER_X + OUTER_RADIUS * Math.cos((210 * Math.PI) / 180) - 70}
              y={CENTER_Y + OUTER_RADIUS * Math.sin((210 * Math.PI) / 180) + 10}
              textAnchor="middle"
              className="text-[11px] fill-current font-bold"
            >
              IR
            </text>
          </g>

          {/* Linear Actuator 2 (3 o'clock - inner conveyor) */}
          <g>
            <rect
              x={CENTER_X + INNER_RADIUS - LA_LENGTH / 2}
              y={CENTER_Y - 8}
              width={LA_LENGTH}
              height={16}
              fill={relay_actuator_2 ? '#7c3aed' : '#9ca3af'}
              stroke={relay_actuator_2 ? '#5b21b6' : '#6b7280'}
              strokeWidth="3"
              rx="4"
            />
            <rect
              x={relay_actuator_2 ? (CENTER_X + INNER_RADIUS + 10) : (CENTER_X + INNER_RADIUS - LA_LENGTH / 2 + 10)}
              y={CENTER_Y - 12}
              width={24}
              height={24}
              fill={relay_actuator_2 ? '#c4b5fd' : '#d1d5db'}
              stroke={relay_actuator_2 ? '#5b21b6' : '#6b7280'}
              strokeWidth="3"
              rx="3"
            >
              {relay_actuator_2 && (
                <animate
                  attributeName="x"
                  values={`${CENTER_X + INNER_RADIUS - LA_LENGTH / 2 + 10};${CENTER_X + INNER_RADIUS + 10};${CENTER_X + INNER_RADIUS - LA_LENGTH / 2 + 10}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            <text
              x={CENTER_X + INNER_RADIUS + LA_LENGTH / 2 + 10}
              y={CENTER_Y + 5}
              textAnchor="start"
              className="text-[11px] fill-current font-semibold"
            >
              LA2 {relay_actuator_2 ? '(Active)' : '(Idle)'}
            </text>
          </g>

          {/* Capacitive Proximity Sensor */}
          <g>
            <rect
              x={CENTER_X + INNER_RADIUS - 15}
              y={CENTER_Y - 9}
              width={30}
              height={18}
              fill={relay_capacitive ? '#eab308' : '#fef08a'}
              stroke="#713f12"
              strokeWidth="2"
              rx="3"
            />
            {relay_capacitive && (
              <>
                <circle cx={CENTER_X + INNER_RADIUS} cy={CENTER_Y} r="4" fill="#facc15" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.8s" repeatCount="indefinite" />
                </circle>
                <line x1={CENTER_X + INNER_RADIUS - 35} y1={CENTER_Y} x2={CENTER_X + INNER_RADIUS - 15} y2={CENTER_Y} stroke="#eab308" strokeWidth="2" strokeDasharray="2,2">
                  <animate attributeName="x2" values={`${CENTER_X + INNER_RADIUS - 15};${CENTER_X + INNER_RADIUS - 35};${CENTER_X + INNER_RADIUS - 15}`} dur="1s" repeatCount="indefinite" />
                </line>
              </>
            )}
            <text
              x={CENTER_X + INNER_RADIUS + 35}
              y={CENTER_Y + 25}
              textAnchor="middle"
              className="text-[11px] fill-current font-bold"
            >
              CP
            </text>
          </g>

          {/* Direction and Speed indicators */}
          <text
            x={CENTER_X}
            y="30"
            textAnchor="middle"
            className="text-base fill-blue-600 dark:fill-blue-400 font-bold"
          >
            Outer: {outer_state.speed_rpm.toFixed(1)} RPM ({outer_state.direction})
          </text>

          <text
            x={CENTER_X}
            y="485"
            textAnchor="middle"
            className="text-base fill-green-600 dark:fill-green-400 font-bold"
          >
            Inner: {inner_state.speed_rpm.toFixed(1)} RPM ({inner_state.direction})
          </text>
        </svg>
      </div>

      {/* Legend and Statistics */}
      <div className="space-y-4 flex flex-col">
        {/* Legend */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Legend</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-600 border-2 border-gray-800"></div>
              <span className="text-gray-600 dark:text-gray-400">Empty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-700"></div>
              <span className="text-gray-600 dark:text-gray-400">Occupied (Non-metallic)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-900"></div>
              <span className="text-gray-600 dark:text-gray-400">Metallic Object</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-600 border-2 border-purple-900 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Linear Actuator</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-500 border border-orange-900 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">IR Proximity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 border border-blue-900 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Inductive Prox</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Object Count</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                Outer Total: <span className="font-semibold">
                  {outer_points.filter(p => p.state !== 'non-occupied').length}/{outer_points.length}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Metallic: <span className="font-semibold text-red-600">
                  {outer_points.filter(p => p.state === 'occupied-metallic').length}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Non-metallic: <span className="font-semibold text-yellow-600">
                  {outer_points.filter(p => p.state === 'occupied').length}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                Inner Total: <span className="font-semibold">
                  {inner_points.filter(p => p.state === 'occupied').length}/{inner_points.length}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Empty Slots: <span className="font-semibold">
                  {inner_points.filter(p => p.state === 'non-occupied').length + 
                  outer_points.filter(p => p.state === 'non-occupied').length}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Sensor Status */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
          <SensorStatus />
        </div>
      </div>
    </div>
  );
}
