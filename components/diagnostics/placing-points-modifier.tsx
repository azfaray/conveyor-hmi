'use client';

import React from 'react';
import { usePlcStore } from '@/store/plc-store';
import { InnerPlacingPointState, OuterPlacingPointState } from '@/types';

export function PlacingPointModifier() {
  const outer_points = usePlcStore((state) => state.outer_points);
  const inner_points = usePlcStore((state) => state.inner_points);
  const update_outer = usePlcStore((state) => state.update_outer_point);
  const update_inner = usePlcStore((state) => state.update_inner_point);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold">Outer Placing Points</h4>
        <div className="grid grid-cols-5 gap-2">
          {outer_points.map((point) => (
            <select
              key={point.id}
              value={point.state}
              onChange={(e) =>
                update_outer(point.id, e.target.value as OuterPlacingPointState)
              }
              className="rounded border px-2 py-1"
            >
              <option value="non-occupied">non-occupied</option>
              <option value="occupied">occupied</option>
              <option value="occupied-metallic">occupied-metallic</option>
            </select>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-bold mt-6">Inner Placing Points</h4>
        <div className="grid grid-cols-5 gap-2">
          {inner_points.map((point) => (
            <select
              key={point.id}
              value={point.state}
              onChange={(e) =>
                update_inner(point.id, e.target.value as InnerPlacingPointState)
              }
              className="rounded border px-2 py-1"
            >
              <option value="non-occupied">non-occupied</option>
              <option value="occupied">occupied</option>
            </select>
          ))}
        </div>
      </div>
    </div>
  );
}
