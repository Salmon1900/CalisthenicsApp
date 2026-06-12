import type { Exercise } from './supabase';
import type { PlanExerciseWithExercise } from './queryFunctions';

/** Which part of a workout session an exercise belongs to. */
export type WorkoutSection = 'warmup' | 'main' | 'cooldown';

/** Sections that are auto-generated (everything except the user's own plan). */
export type GeneratedSection = Exclude<WorkoutSection, 'main'>;

/**
 * Fixed, head-to-toe warmup routine prepended before the main workout.
 * Names must match `exercises.name` exactly — unmatched names are skipped.
 */
export const CURATED_WARMUP_NAMES = [
  'Jumping Jack',
  'Arm Circles',
  'Torso Twists',
  'Standing Hip Circle',
  'Leg Swings (Front-to-Back)',
  'Deep Squat Hold',
] as const;

/** Fixed static-stretch cooldown appended after the main workout. */
export const CURATED_COOLDOWN_NAMES = [
  'Standing Quad Stretch',
  'Standing Hamstring Stretch',
  'Cross-Body Shoulder Stretch',
  "Child's Pose",
] as const;

/** Default hold for a timed warmup/cooldown move, in seconds. */
export const DEFAULT_TIMED_SECONDS = 30;
/** Default reps for a rep-based warmup/cooldown move. */
export const DEFAULT_WARMUP_REPS = 10;
/** Rest between warmup/cooldown moves (never triggers — they are single-set). */
const SECTION_REST_SECONDS = 15;

/** Human-readable label for a section. */
export function sectionLabel(section: WorkoutSection): string {
  switch (section) {
    case 'warmup':
      return 'Warm-up';
    case 'cooldown':
      return 'Cooldown';
    default:
      return 'Main set';
  }
}

/** Default dosage (reps or seconds) for an auto-generated warmup/cooldown move. */
export function defaultDosage(exercise: Exercise): number {
  return exercise.type === 'timed' ? DEFAULT_TIMED_SECONDS : DEFAULT_WARMUP_REPS;
}

/**
 * Wrap a library {@link Exercise} as a single-set synthetic plan-exercise so the
 * existing workout session can run it like any other item. The id is prefixed
 * with the section to guarantee uniqueness against real plan-exercise rows.
 */
export function toSessionItem(
  exercise: Exercise,
  section: GeneratedSection,
  orderIndex: number,
): PlanExerciseWithExercise {
  return {
    id: `${section}-${exercise.id}`,
    workout_plan_id: '',
    exercise_id: exercise.id,
    order_index: orderIndex,
    quantity: defaultDosage(exercise),
    sets: 1,
    set_reps: null,
    rest_seconds: SECTION_REST_SECONDS,
    created_at: '',
    exercise,
  };
}

/** Order fetched exercises by the curated name list, dropping any not found. */
export function orderByCuratedNames(
  exercises: Exercise[],
  names: readonly string[],
): Exercise[] {
  const byName = new Map(exercises.map((e) => [e.name, e]));
  return names
    .map((name) => byName.get(name))
    .filter((e): e is Exercise => e !== undefined);
}

/** Build ordered, single-set synthetic items for a generated section. */
export function buildSectionItems(
  exercises: Exercise[],
  names: readonly string[],
  section: GeneratedSection,
): PlanExerciseWithExercise[] {
  return orderByCuratedNames(exercises, names).map((exercise, index) =>
    toSessionItem(exercise, section, index),
  );
}
