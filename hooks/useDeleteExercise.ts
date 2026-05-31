import { useState } from 'react';
import { supabase } from '../utils/supabase';

interface UseDeleteExerciseReturn {
  deleteExercise: (id: string) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

export function useDeleteExercise(): UseDeleteExerciseReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteExercise = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      setError(new Error(err instanceof Error ? err.message : 'Failed to delete exercise'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteExercise, loading, error };
}
