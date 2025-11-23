import { useQuery } from '@tanstack/react-query';
import { usePlcStore } from '@/store/plc-store';

export function usePlacingPoints() {
const plc_store = usePlcStore();

const outer_points_query = useQuery({
queryKey: ['placing-points', 'outer'],
queryFn: () => plc_store.outer_points,
refetchInterval: 500,
staleTime: 100,
});

const inner_points_query = useQuery({
queryKey: ['placing-points', 'inner'],
queryFn: () => plc_store.inner_points,
refetchInterval: 500,
staleTime: 100,
});

return {
outer_points: outer_points_query.data || [],
inner_points: inner_points_query.data || [],
is_loading: outer_points_query.isLoading || inner_points_query.isLoading,
};
}