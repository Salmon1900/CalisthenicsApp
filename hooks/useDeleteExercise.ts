import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import { deleteExerciseById } from '../utils/queryFunctions';

interface UseDeleteExerciseReturn {
  deleteExercise: (id: string) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

export function useDeleteExercise(): UseDeleteExerciseReturn {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: deleteExerciseById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all() });
    },
  });

  const deleteExercise = async (id: string): Promise<boolean> => {
    try {
      await mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return { deleteExercise, loading: isPending, error: error ?? null };
}
