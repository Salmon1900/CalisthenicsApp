import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import {
  deletePlanById,
  fetchPlans,
  insertPlan,
  updatePlanById,
} from '../utils/queryFunctions';
import type { WorkoutPlan } from '../utils/supabase';

interface UsePlansReturn {
  plans: WorkoutPlan[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createPlan: (name: string, description?: string) => Promise<WorkoutPlan | null>;
  updatePlan: (id: string, fields: Partial<Pick<WorkoutPlan, 'name' | 'description'>>) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;
}

export function usePlans(): UsePlansReturn {
  const queryClient = useQueryClient();

  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.plans.all(),
    queryFn: fetchPlans,
  });

  const invalidatePlans = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.all() });

  const createMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      insertPlan(name, description),
    onSuccess: invalidatePlans,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<Pick<WorkoutPlan, 'name' | 'description'>> }) =>
      updatePlanById(id, fields),
    onSuccess: invalidatePlans,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlanById,
    onSuccess: invalidatePlans,
  });

  const createPlan = async (name: string, description?: string): Promise<WorkoutPlan | null> => {
    try {
      return await createMutation.mutateAsync({ name, description });
    } catch {
      return null;
    }
  };

  const updatePlan = async (
    id: string,
    fields: Partial<Pick<WorkoutPlan, 'name' | 'description'>>,
  ): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ id, fields });
      return true;
    } catch {
      return false;
    }
  };

  const deletePlan = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    plans: data ?? [],
    loading: isPending,
    error: error ?? null,
    refetch: async () => { await refetch(); },
    createPlan,
    updatePlan,
    deletePlan,
  };
}
