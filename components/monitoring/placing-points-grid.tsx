'use client';

import React from 'react';
import { usePlacingPoints } from '@/hooks/use-placing-points';
import { get_placing_point_color } from '@/lib/utils/helpers';

export function PlacingPointsGrid() {
  const { outer_points, inner_points } = usePlacingPoints();
  const is_dark = typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="font-semibold mb-3 text-lg">Outer Conveyor (O1-O5)</h3>
        <div className="grid grid-cols-5 gap-2">
          {outer_points.map((point) => (
            <div
              key={point.id}
              className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all hover:shadow-lg"
              style={{
                backgroundColor: get_placing_point_color(point.state, true, is_dark),
              }}
              title={`${point.id}: ${point.state}`}
            >
              {point.id}
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-lg">Inner Conveyor (I1-I5)</h3>
          <div className="grid grid-cols-5 gap-2">
            {inner_points.map((point) => (
              <div
                key={point.id}
                className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all hover:shadow-lg"
                style={{
                  backgroundColor: get_placing_point_color(point.state, false, is_dark),
                }}
                title={`${point.id}: ${point.state}`}
              >
                {point.id}
              </div>
            ))}
          </div>
        </div>
      </div >
    </div>
  );
}