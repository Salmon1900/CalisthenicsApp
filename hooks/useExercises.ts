import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import type { Exercise } from '../utils/supabase';

interface UseExercisesReturn {
  exercises: Exercise[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch exercises from Supabase
 * Handles loading, error states, and provides refetch capability
 */
export function useExercises(): UseExercisesReturn {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setExercises(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exercises';
      setError(new Error(errorMessage));
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const refetch = async () => {
    await fetchExercises();
  };

  return { exercises, loading, error, refetch };
}
