'use client';

import { useQuery } from '@tanstack/react-query';
import { useSensorStore } from '@/store/sensor-store';

export function useSensorData() {
const sensor_store = useSensorStore();

return useQuery({
queryKey: ['sensors'],
queryFn: () => ({
ir: sensor_store.ir_sensor,
inductive: sensor_store.inductive_sensor,
capacitive: sensor_store.capacitive_sensor,
}),
refetchInterval: 500,
staleTime: 100,
});
}