import { supabase } from './supabase';
import type { Exercise, Workout, WorkoutPlan, WorkoutPlanExercise } from './supabase';

export type PlanExerciseWithExercise = WorkoutPlanExercise & { exercise: Exercise };
export type NewExercise = Omit<Exercise, 'id' | 'created_at'>;
export type NewWorkout = Omit<Workout, 'id' | 'created_at'>;

/** Editable per-set configuration of a plan exercise. */
export type PlanExerciseConfig = Pick<
  WorkoutPlanExercise,
  'quantity' | 'sets' | 'set_reps' | 'rest_seconds'
>;

export const DEFAULT_SETS = 3;
export const DEFAULT_REST_SECONDS = 60;

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Exercise[];
}

export async function fetchExercisesByNames(names: readonly string[]): Promise<Exercise[]> {
  if (names.length === 0) return [];
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .in('name', names as string[]);
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
  config?: Partial<Omit<PlanExerciseConfig, 'quantity'>>,
): Promise<void> {
  const { error } = await supabase.from('workout_plan_exercises').insert({
    workout_plan_id: planId,
    exercise_id: exerciseId,
    order_index: maxIndex + 1,
    quantity,
    sets: config?.sets ?? DEFAULT_SETS,
    set_reps: config?.set_reps ?? null,
    rest_seconds: config?.rest_seconds ?? DEFAULT_REST_SECONDS,
  });
  if (error) throw new Error(error.message);
}

export async function deletePlanExerciseById(id: string): Promise<void> {
  const { error } = await supabase.from('workout_plan_exercises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updatePlanExerciseConfig(
  id: string,
  config: PlanExerciseConfig,
): Promise<void> {
  const { error } = await supabase
    .from('workout_plan_exercises')
    .update(config)
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

export async function insertWorkout(workout: NewWorkout): Promise<void> {
  const { error } = await supabase.from('workouts').insert(workout);
  if (error) throw new Error(error.message);
}
