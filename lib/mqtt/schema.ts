'use client';

import { z } from 'zod';

export const mqtt_relay_schema = z.object({
relay_id: z.number().min(1).max(9),
state: z.enum(['on', 'off']),
timestamp: z.string().datetime(),
});

export const mqtt_outer_point_schema = z.object({
point_id: z.string().regex(/^O\d{1,2}$/),
state: z.enum(['non-occupied', 'occupied', 'occupied-metallic']),
timestamp: z.string().datetime(),
});

export const mqtt_inner_point_schema = z.object({
point_id: z.string().regex(/^I\d{1,2}$/),
state: z.enum(['occupied', 'non-occupied']),
timestamp: z.string().datetime(),
});

export const mqtt_conveyor_schema = z.object({
conveyor_id: z.union([z.number(), z.string()]),
direction: z.enum(['CW', 'CCW']),
angle_deg: z.number().min(0).max(360),
position: z.number(),
speed_rpm: z.number(),
timestamp: z.string().datetime(),
});

export const mqtt_actuator_schema = z.object({
actuator_id: z.number().min(1).max(2),
state: z.enum(['moving-forward', 'moving-backward', 'idle-forward', 'idle-backward']),
position_mm: z.number().min(0).max(100),
timestamp: z.string().datetime(),
});

export const mqtt_sensor_schema = z.object({
sensor: z.enum(['ir', 'inductive', 'capacitive']),
state: z.enum(['triggered', 'not-triggered']),
timestamp: z.string().datetime(),
});