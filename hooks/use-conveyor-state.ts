'use client';

import { useQuery } from '@tanstack/react-query';
import { useConveyorStore } from '@/store/conveyor-store';

export function useConveyorState() {
const conveyor_store = useConveyorStore();

return useQuery({
queryKey: ['conveyor-state'],
queryFn: () => ({
outer: conveyor_store.outer_conveyor,
inner: conveyor_store.inner_conveyor,
}),
refetchInterval: 500,
staleTime: 100,
});
}