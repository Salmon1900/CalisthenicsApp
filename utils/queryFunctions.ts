import { supabase } from './supabase';
import type { Exercise, WorkoutPlan, WorkoutPlanExercise } from './supabase';

export type PlanExerciseWithExercise = WorkoutPlanExercise & { exercise: Exercise };
export type NewExercise = Omit<Exercise, 'id' | 'created_at'>;

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Exercise[];
}

export async function insertExercise(exercise: NewExercise): Promise<void> {
  const { error } = await supabase.from('exercises').insert(exercise);
  if (error) throw new Error(error.message);
}

export async function deleteExerciseById(id: string): Promise<void> {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchPlans(): Promise<WorkoutPlan[]> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as WorkoutPlan[];
}

export async function insertPlan(name: string, description?: string | null): Promise<WorkoutPlan> {
  const { data, error } = await supabase
    .from('workout_plans')
    .insert({ name, description })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as WorkoutPlan;
}

export async function updatePlanById(
  id: string,
  fields: Partial<Pick<WorkoutPlan, 'name' | 'description'>>,
): Promise<void> {
  const { error } = await supabase.from('workout_plans').update(fields).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deletePlanById(id: string): Promise<void> {
  const { error } = await supabase.from('workout_plans').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchPlanExercises(planId: string): Promise<PlanExerciseWithExercise[]> {
  const { data, error } = await supabase
    .from('workout_plan_exercises')
    .select('*, exercise:exercises(*)')
    .eq('workout_plan_id', planId)
    .order('order_index', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PlanExerciseWithExercise[];
}

export async function insertPlanExercise(
  planId: string,
  exerciseId: string,
  quantity: number,
  maxIndex: number,
): Promise<void> {
  const { error } = await supabase.from('workout_plan_exercises').insert({
    workout_plan_id: planId,
    exercise_id: exerciseId,
    order_index: maxIndex + 1,
    quantity,
  });
  if (error) throw new Error(error.message);
}

export async function deletePlanExerciseById(id: string): Promise<void> {
  const { error } = await supabase.from('workout_plan_exercises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updatePlanExerciseQuantity(id: string, quantity: number): Promise<void> {
  const { error } = await supabase
    .from('workout_plan_exercises')
    .update({ quantity })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderPlanExercises(
  updates: Array<{ id: string; order_index: number }>,
): Promise<void> {
  const results = await Promise.all(
    updates.map(({ id, order_index }) =>
      supabase.from('workout_plan_exercises').update({ order_index }).eq('id', id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
