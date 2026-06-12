import { useMemo, useState } from 'react';
import type { PlanExerciseWithExercise } from '../utils/queryFunctions';
import { repsForSet, totalSetsForItems } from '../utils/sets';

export type ExerciseStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

interface ExerciseProgress {
  completedSets: number;
  skipped: boolean;
}

interface UseWorkoutSessionReturn {
  current: PlanExerciseWithExercise | undefined;
  currentIndex: number;
  currentStatus: ExerciseStatus;
  /** 0-based index of the set the user is about to perform. */
  currentSetIndex: number;
  /** Total sets for the current exercise. */
  currentTotalSets: number;
  /** Reps (or seconds) for the current set. */
  currentReps: number;
  /** Sets already completed for the current exercise. */
  completedSets: number;
  /** True once every set of the current exercise is done. */
  allSetsDone: boolean;
  total: number;
  completedCount: number;
  completionPercentage: number;
  goNext: () => void;
  goPrev: () => void;
  /** Completes the current set without leaving the exercise. */
  markSetCompleted: () => void;
  markSkipped: () => void;
}

export function useWorkoutSession(items: PlanExerciseWithExercise[]): UseWorkoutSessionReturn {
  const total = items.length;
  const [rawIndex, setRawIndex] = useState<number>(0);
  const [progressMap, setProgressMap] = useState<Record<string, ExerciseProgress>>({});

  const currentIndex = total === 0 ? 0 : Math.min(Math.max(rawIndex, 0), total - 1);
  const current = total === 0 ? undefined : items[currentIndex];

  const progress: ExerciseProgress = current
    ? progressMap[current.id] ?? { completedSets: 0, skipped: false }
    : { completedSets: 0, skipped: false };

  const currentTotalSets = current?.sets ?? 0;
  const completedSets = progress.completedSets;
  const allSetsDone = currentTotalSets > 0 && completedSets >= currentTotalSets;
  const currentSetIndex = Math.min(completedSets, Math.max(currentTotalSets - 1, 0));
  const currentReps = current ? repsForSet(current, currentSetIndex) : 0;

  const currentStatus: ExerciseStatus = progress.skipped
    ? 'skipped'
    : allSetsDone
      ? 'completed'
      : completedSets > 0
        ? 'in-progress'
        : 'pending';

  // Number of exercises fully completed (all sets done, not skipped).
  const completedCount = useMemo(
    () =>
      items.filter((item) => {
        const p = progressMap[item.id];
        return p && !p.skipped && p.completedSets >= item.sets;
      }).length,
    [items, progressMap],
  );

  const completionPercentage = useMemo(() => {
    const totalSets = totalSetsForItems(items);
    if (totalSets === 0) return 0;
    const doneSets = items.reduce((sum, item) => {
      const p = progressMap[item.id];
      if (!p || p.skipped) return sum;
      return sum + Math.min(p.completedSets, item.sets);
    }, 0);
    return Math.round((doneSets / totalSets) * 100);
  }, [items, progressMap]);

  const goNext = (): void => {
    setRawIndex((prev) => Math.min(prev + 1, Math.max(total - 1, 0)));
  };

  const goPrev = (): void => {
    setRawIndex((prev) => Math.max(prev - 1, 0));
  };

  const markSetCompleted = (): void => {
    if (!current) return;
    setProgressMap((prev) => {
      const existing = prev[current.id] ?? { completedSets: 0, skipped: false };
      const nextSets = Math.min(existing.completedSets + 1, current.sets);
      return { ...prev, [current.id]: { completedSets: nextSets, skipped: false } };
    });
  };

  const markSkipped = (): void => {
    if (!current) return;
    setProgressMap((prev) => {
      const existing = prev[current.id] ?? { completedSets: 0, skipped: false };
      // Toggle skip off when re-tapping.
      const skipped = !existing.skipped;
      return { ...prev, [current.id]: { ...existing, skipped } };
    });
    if (!progress.skipped && currentIndex < total - 1) {
      goNext();
    }
  };

  return {
    current,
    currentIndex,
    currentStatus,
    currentSetIndex,
    currentTotalSets,
    currentReps,
    completedSets,
    allSetsDone,
    total,
    completedCount,
    completionPercentage,
    goNext,
    goPrev,
    markSetCompleted,
    markSkipped,
  };
}
