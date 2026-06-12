import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import {
  deletePlanExerciseById,
  fetchPlanExercises,
  insertPlanExercise,
  reorderPlanExercises,
  updatePlanExerciseConfig,
} from '../utils/queryFunctions';
import type { PlanExerciseConfig, PlanExerciseWithExercise } from '../utils/queryFunctions';

interface ReorderUpdate {
  id: string;
  order_index: number;
}

interface UsePlanExercisesReturn {
  planExercises: PlanExerciseWithExercise[];
  loading: boolean;
  error: Error | null;
  refetch: (planId: string) => Promise<void>;
  addExercise: (planId: string, exerciseId: string, quantity: number) => Promise<boolean>;
  removeExercise: (id: string) => Promise<boolean>;
  reorderExercises: (updates: ReorderUpdate[]) => Promise<boolean>;
  updateConfig: (id: string, config: PlanExerciseConfig) => Promise<boolean>;
}

export function usePlanExercises(): UsePlanExercisesReturn {
  const [planId, setPlanId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const queryKey = planId
    ? queryKeys.planExercises.byPlan(planId)
    : (['planExercises', '__none__'] as const);

  const { data, isFetching, error, refetch: queryRefetch } = useQuery({
    queryKey,
    queryFn: () => (planId ? fetchPlanExercises(planId) : Promise.resolve([] as PlanExerciseWithExercise[])),
    enabled: !!planId,
    staleTime: 30_000,
  });

  const refetch = async (id: string): Promise<void> => {
    if (id !== planId) {
      setPlanId(id);
    } else {
      await queryRefetch();
    }
  };

  const invalidate = () => {
    if (planId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.planExercises.byPlan(planId) });
    }
  };

  const addMutation = useMutation({
    mutationFn: ({ pId, exerciseId, quantity }: { pId: string; exerciseId: string; quantity: number }) => {
      const cached = queryClient.getQueryData<PlanExerciseWithExercise[]>(
        queryKeys.planExercises.byPlan(pId),
      ) ?? [];
      const maxIndex = cached.length > 0 ? Math.max(...cached.map((pe) => pe.order_index)) : -1;
      return insertPlanExercise(pId, exerciseId, quantity, maxIndex);
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: deletePlanExerciseById,
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: reorderPlanExercises,
    onSuccess: invalidate,
  });

  const configMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: PlanExerciseConfig }) =>
      updatePlanExerciseConfig(id, config),
    onSuccess: invalidate,
  });

  const addExercise = async (pId: string, exerciseId: string, quantity: number): Promise<boolean> => {
    try {
      await addMutation.mutateAsync({ pId, exerciseId, quantity });
      return true;
    } catch {
      return false;
    }
  };

  const removeExercise = async (id: string): Promise<boolean> => {
    try {
      await removeMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const reorderExercises = async (updates: ReorderUpdate[]): Promise<boolean> => {
    try {
      await reorderMutation.mutateAsync(updates);
      return true;
    } catch {
      return false;
    }
  };

  const updateConfig = async (id: string, config: PlanExerciseConfig): Promise<boolean> => {
    try {
      await configMutation.mutateAsync({ id, config });
      return true;
    } catch {
      return false;
    }
  };

  return {
    planExercises: data ?? [],
    loading: isFetching,
    error: error ?? null,
    refetch,
    addExercise,
    removeExercise,
    reorderExercises,
    updateConfig,
  };
}
