// Maps the app's own exercises against the service's live capability list.
// The picker shows every app exercise; only those the service supports are
// selectable, and we keep the exact service display name to send back verbatim.

import type { Exercise } from './supabase';

/** Normalize a name for matching: lowercase, strip non-alphanumerics. */
export function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export interface MatchedExercise {
  exercise: Exercise;
  /** Exact service display name to send, or null if the service can't analyze this. */
  serviceName: string | null;
}

/**
 * For each app exercise, find the matching service display name (or null).
 * Matching is normalization-based so "Pike Push-up" matches "pike pushup".
 * Supported exercises are returned first (then unsupported), each group keeping
 * its original order.
 */
export function matchAppExercises(
  appExercises: Exercise[],
  serviceNames: string[],
): MatchedExercise[] {
  const byNormalized = new Map(serviceNames.map((name) => [normalize(name), name]));
  const matched: MatchedExercise[] = appExercises.map((exercise) => ({
    exercise,
    serviceName: byNormalized.get(normalize(exercise.name)) ?? null,
  }));
  return [
    ...matched.filter((m) => m.serviceName !== null),
    ...matched.filter((m) => m.serviceName === null),
  ];
}
