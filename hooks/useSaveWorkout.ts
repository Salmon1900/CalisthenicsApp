import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import { insertWorkout } from '../utils/queryFunctions';
import type { NewWorkout } from '../utils/queryFunctions';

interface UseSaveWorkoutReturn {
  saveWorkout: (input: NewWorkout) => Promise<boolean>;
  saving: boolean;
  error: Error | null;
}

export function useSaveWorkout(): UseSaveWorkoutReturn {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: insertWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all() });
    },
  });

  const saveWorkout = async (input: NewWorkout): Promise<boolean> => {
    try {
      await mutateAsync(input);
      return true;
    } catch {
      return false;
    }
  };

  return { saveWorkout, saving: isPending, error: error ?? null };
}
