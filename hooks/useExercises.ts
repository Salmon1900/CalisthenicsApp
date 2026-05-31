import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import { fetchExercises } from '../utils/queryFunctions';
import type { Exercise } from '../utils/supabase';

interface UseExercisesReturn {
  exercises: Exercise[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useExercises(): UseExercisesReturn {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.exercises.all(),
    queryFn: fetchExercises,
  });

  return {
    exercises: data ?? [],
    loading: isPending,
    error: error ?? null,
    refetch: async () => { await refetch(); },
  };
}
