import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { queryKeys } from '../utils/queryKeys';
import type { Exercise, WorkoutPlan } from '../utils/supabase';

interface GeneratePlanInput {
  goals: string;
  injuries?: string;
  exercises: Exercise[];
}

interface GeneratePlanResult {
  plan: WorkoutPlan;
}

async function generatePlan(input: GeneratePlanInput): Promise<WorkoutPlan> {
  const { data, error } = await supabase.functions.invoke<GeneratePlanResult>('generate-plan', {
    body: {
      goals: input.goals,
      injuries: input.injuries || undefined,
      exercises: input.exercises.map((e) => ({
        id: e.id,
        name: e.name,
        difficulty: e.difficulty,
        type: e.type,
      })),
    },
  });

  if (error) throw new Error(error.message);
  if (!data?.plan) throw new Error('No plan returned from server');
  return data.plan;
}

export function useGeneratePlan() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: generatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all() });
    },
  });

  return {
    generatePlan: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
