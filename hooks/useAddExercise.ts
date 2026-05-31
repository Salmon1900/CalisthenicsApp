import { useState } from 'react';
import { supabase } from '../utils/supabase';
import type { Exercise } from '../utils/supabase';

type NewExercise = Omit<Exercise, 'id' | 'created_at'>;

interface UseAddExerciseReturn {
  addExercise: (exercise: NewExercise) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

export function useAddExercise(): UseAddExerciseReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addExercise = async (exercise: NewExercise): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('exercises')
        .insert(exercise);

      if (insertError) {
        throw insertError;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add exercise';
      setError(new Error(message));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addExercise, loading, error };
}
