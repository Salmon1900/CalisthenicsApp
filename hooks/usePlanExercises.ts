import { useState } from 'react';
import { supabase } from '../utils/supabase';
import type { Exercise, WorkoutPlanExercise } from '../utils/supabase';

type PlanExerciseWithExercise = WorkoutPlanExercise & { exercise: Exercise };

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
  updateQuantity: (id: string, quantity: number) => Promise<boolean>;
}

export function usePlanExercises(): UsePlanExercisesReturn {
  const [planExercises, setPlanExercises] = useState<PlanExerciseWithExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async (planId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('workout_plan_exercises')
        .select('*, exercise:exercises(*)')
        .eq('workout_plan_id', planId)
        .order('order_index', { ascending: true });

      if (queryError) throw queryError;
      setPlanExercises((data ?? []) as PlanExerciseWithExercise[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plan exercises';
      setError(new Error(message));
      console.error('Error fetching plan exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (
    planId: string,
    exerciseId: string,
    quantity: number,
  ): Promise<boolean> => {
    try {
      const maxIndex = planExercises.length > 0
        ? Math.max(...planExercises.map((pe) => pe.order_index))
        : -1;

      const { error: insertError } = await supabase
        .from('workout_plan_exercises')
        .insert({
          workout_plan_id: planId,
          exercise_id: exerciseId,
          order_index: maxIndex + 1,
          quantity,
        });

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      console.error('Error adding exercise to plan:', err);
      return false;
    }
  };

  const removeExercise = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('workout_plan_exercises')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error removing exercise from plan:', err);
      return false;
    }
  };

  const reorderExercises = async (updates: ReorderUpdate[]): Promise<boolean> => {
    try {
      const results = await Promise.all(
        updates.map(({ id, order_index }) =>
          supabase
            .from('workout_plan_exercises')
            .update({ order_index })
            .eq('id', id),
        ),
      );

      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      return true;
    } catch (err) {
      console.error('Error reordering exercises:', err);
      return false;
    }
  };

  const updateQuantity = async (id: string, quantity: number): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('workout_plan_exercises')
        .update({ quantity })
        .eq('id', id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating quantity:', err);
      return false;
    }
  };

  return {
    planExercises,
    loading,
    error,
    refetch,
    addExercise,
    removeExercise,
    reorderExercises,
    updateQuantity,
  };
}
