import type { PlanExerciseWithExercise } from './queryFunctions';
import type { WorkoutPlanExercise } from './supabase';

/** Reps (or seconds for timed exercises) to perform on a given 0-based set index. */
export function repsForSet(item: Pick<WorkoutPlanExercise, 'quantity' | 'set_reps'>, setIndex: number): number {
  return item.set_reps?.[setIndex] ?? item.quantity;
}

/** Total number of sets across every exercise in a plan. */
export function totalSetsForItems(items: Array<Pick<WorkoutPlanExercise, 'sets'>>): number {
  return items.reduce((sum, item) => sum + item.sets, 0);
}

/** Whether the exercise uses a per-set override list (non-uniform reps). */
export function hasSetOverrides(item: Pick<WorkoutPlanExercise, 'set_reps'>): boolean {
  return Array.isArray(item.set_reps) && item.set_reps.length > 0;
}

/**
 * Build a per-set reps array of length `sets`, keeping existing values where
 * possible, padding new sets with `base`, and truncating extras.
 */
export function reconcileSetReps(current: number[] | null, sets: number, base: number): number[] {
  return Array.from({ length: sets }, (_, i) => current?.[i] ?? base);
}

/**
 * Human-readable summary of an exercise's set configuration, e.g. "3 × 10 reps"
 * for uniform sets or "12/10/8 reps" when each set differs.
 */
export function formatSetSummary(item: PlanExerciseWithExercise): string {
  const unit = item.exercise.type === 'reps' ? 'reps' : 'sec';
  if (hasSetOverrides(item)) {
    return `${item.set_reps!.join('/')} ${unit}`;
  }
  return `${item.sets} × ${item.quantity} ${unit}`;
}
