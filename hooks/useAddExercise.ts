import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import { insertExercise } from '../utils/queryFunctions';
import type { NewExercise } from '../utils/queryFunctions';

interface UseAddExerciseReturn {
  addExercise: (exercise: NewExercise) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

export function useAddExercise(): UseAddExerciseReturn {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: insertExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all() });
    },
  });

  const addExercise = async (exercise: NewExercise): Promise<boolean> => {
    try {
      await mutateAsync(exercise);
      return true;
    } catch {
      return false;
    }
  };

  return { addExercise, loading: isPending, error: error ?? null };
}
