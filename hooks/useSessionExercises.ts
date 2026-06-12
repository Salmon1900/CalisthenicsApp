import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../utils/queryKeys';
import { fetchExercisesByNames } from '../utils/queryFunctions';
import type { PlanExerciseWithExercise } from '../utils/queryFunctions';
import {
  CURATED_COOLDOWN_NAMES,
  CURATED_WARMUP_NAMES,
  buildSectionItems,
} from '../utils/warmup';
import type { WorkoutSection } from '../utils/warmup';

interface SessionOptions {
  warmup: boolean;
  cooldown: boolean;
}

interface UseSessionExercisesReturn {
  /** Full ordered session: warmup → main → cooldown. */
  items: PlanExerciseWithExercise[];
  /** Maps each item id to the section it belongs to. */
  sectionById: Record<string, WorkoutSection>;
  loading: boolean;
  error: Error | null;
}

/**
 * Composes the workout session list by wrapping the user's plan exercises
 * (the "main" section) with an auto-generated warmup block before and a
 * cooldown block after. Warmup/cooldown exercises are fetched from the shared
 * exercise library and synthesized into single-set items, so the existing
 * {@link useWorkoutSession} runs them unchanged.
 */
export function useSessionExercises(
  planExercises: PlanExerciseWithExercise[],
  options: SessionOptions,
): UseSessionExercisesReturn {
  const warmupQuery = useQuery({
    queryKey: queryKeys.exercises.byNames(CURATED_WARMUP_NAMES),
    queryFn: () => fetchExercisesByNames(CURATED_WARMUP_NAMES),
    enabled: options.warmup,
    staleTime: Infinity,
  });

  const cooldownQuery = useQuery({
    queryKey: queryKeys.exercises.byNames(CURATED_COOLDOWN_NAMES),
    queryFn: () => fetchExercisesByNames(CURATED_COOLDOWN_NAMES),
    enabled: options.cooldown,
    staleTime: Infinity,
  });

  return useMemo(() => {
    const warmupItems = options.warmup
      ? buildSectionItems(warmupQuery.data ?? [], CURATED_WARMUP_NAMES, 'warmup')
      : [];
    const cooldownItems = options.cooldown
      ? buildSectionItems(cooldownQuery.data ?? [], CURATED_COOLDOWN_NAMES, 'cooldown')
      : [];

    const items = [...warmupItems, ...planExercises, ...cooldownItems];

    const sectionById: Record<string, WorkoutSection> = {};
    for (const item of warmupItems) sectionById[item.id] = 'warmup';
    for (const item of planExercises) sectionById[item.id] = 'main';
    for (const item of cooldownItems) sectionById[item.id] = 'cooldown';

    return {
      items,
      sectionById,
      loading:
        (options.warmup && warmupQuery.isLoading) ||
        (options.cooldown && cooldownQuery.isLoading),
      error: (warmupQuery.error as Error | null) ?? (cooldownQuery.error as Error | null) ?? null,
    };
  }, [
    planExercises,
    options.warmup,
    options.cooldown,
    warmupQuery.data,
    cooldownQuery.data,
    warmupQuery.isLoading,
    cooldownQuery.isLoading,
    warmupQuery.error,
    cooldownQuery.error,
  ]);
}
