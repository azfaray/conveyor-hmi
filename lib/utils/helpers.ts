export function format_time(timestamp: string): string {
try {
return new Date(timestamp).toLocaleTimeString();
} catch {
return 'Invalid time';
}
}

export function get_status_color_light(status: string): string {
const colors: Record<string, string> = {
'safe': '#16a34a',
'warning': '#d97706',
'danger': '#dc2626',
'active': '#2563eb',
'inactive': '#6b7280',
};
return colors[status] || '#6b7280';
}

export function get_status_color_dark(status: string): string {
const colors: Record<string, string> = {
'safe': '#86efac',
'warning': '#fbbf24',
'danger': '#f87171',
'active': '#60a5fa',
'inactive': '#9ca3af',
};
return colors[status] || '#9ca3af';
}

export function format_relay_name(relay_id: number): string {
const names: Record<number, string> = {
1: 'LA1 Forward', 2: 'LA1 Backward',
3: 'LA2 Forward', 4: 'LA2 Backward',
5: 'IR Sensor', 6: 'Inductive Sensor',
7: 'Capacitive Sensor', 8: 'Stepper Motor 1',
9: 'Stepper Motor 2',
};
return names[relay_id] || `Relay ${relay_id}`;
}

export function get_placing_point_color(
state: string,
is_outer: boolean,
is_dark: boolean
): string {
if (is_outer) {
const light_colors: Record<string, string> = {
'non-occupied': '#16a34a',
'occupied': '#d97706',
'occupied-metallic': '#dc2626',
};
const dark_colors: Record<string, string> = {
'non-occupied': '#86efac',
'occupied': '#fbbf24',
'occupied-metallic': '#f87171',
};
const colors = is_dark ? dark_colors : light_colors;
return colors[state] || '#6b7280';
} else {
const light_colors: Record<string, string> = {
'non-occupied': '#16a34a',
'occupied': '#2563eb',
};
const dark_colors: Record<string, string> = {
'non-occupied': '#86efac',
'occupied': '#60a5fa',
};
const colors = is_dark ? dark_colors : light_colors;
return colors[state] || '#6b7280';
}
}

