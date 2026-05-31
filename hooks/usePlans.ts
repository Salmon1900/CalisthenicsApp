import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
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
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlans = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('workout_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setPlans(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(new Error(message));
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const refetch = async (): Promise<void> => {
    await fetchPlans();
  };

  const createPlan = async (name: string, description?: string): Promise<WorkoutPlan | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('workout_plans')
        .insert({ name, description: description ?? null })
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchPlans();
      return data;
    } catch (err) {
      console.error('Error creating plan:', err);
      return null;
    }
  };

  const updatePlan = async (
    id: string,
    fields: Partial<Pick<WorkoutPlan, 'name' | 'description'>>,
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('workout_plans')
        .update(fields)
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchPlans();
      return true;
    } catch (err) {
      console.error('Error updating plan:', err);
      return false;
    }
  };

  const deletePlan = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchPlans();
      return true;
    } catch (err) {
      console.error('Error deleting plan:', err);
      return false;
    }
  };

  return { plans, loading, error, refetch, createPlan, updatePlan, deletePlan };
}
