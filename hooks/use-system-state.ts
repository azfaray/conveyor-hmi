'use client';

import { useQuery } from '@tanstack/react-query';
import { useSystemStore } from '@/store/system-store';

export function useSystemState() {
const system_store = useSystemStore();

return useQuery({
queryKey: ['system-state'],
queryFn: () => ({
mode: system_store.mode,
speed_level: system_store.speed_level,
electricity_status: system_store.electricity_status,
mqtt_connected: system_store.mqtt_connected,
}),
refetchInterval: 500,
staleTime: 100,
});
}