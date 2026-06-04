import { useMemo, useState } from 'react';
import type { PlanExerciseWithExercise } from '../utils/queryFunctions';

export type ExerciseStatus = 'pending' | 'completed' | 'skipped';

interface UseWorkoutSessionReturn {
  current: PlanExerciseWithExercise | undefined;
  currentIndex: number;
  currentStatus: ExerciseStatus;
  total: number;
  completedCount: number;
  completionPercentage: number;
  goNext: () => void;
  goPrev: () => void;
  markCompleted: () => void;
  markSkipped: () => void;
}

export function useWorkoutSession(items: PlanExerciseWithExercise[]): UseWorkoutSessionReturn {
  const total = items.length;
  const [rawIndex, setRawIndex] = useState<number>(0);
  const [statusMap, setStatusMap] = useState<Record<string, ExerciseStatus>>({});

  const currentIndex = total === 0 ? 0 : Math.min(Math.max(rawIndex, 0), total - 1);
  const current = total === 0 ? undefined : items[currentIndex];
  const currentStatus: ExerciseStatus = current ? statusMap[current.id] ?? 'pending' : 'pending';

  const completedCount = useMemo(
    () => items.filter((item) => statusMap[item.id] === 'completed').length,
    [items, statusMap],
  );

  const completionPercentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const goNext = (): void => {
    setRawIndex((prev) => Math.min(prev + 1, Math.max(total - 1, 0)));
  };

  const goPrev = (): void => {
    setRawIndex((prev) => Math.max(prev - 1, 0));
  };

  const setStatusAndAdvance = (status: ExerciseStatus): void => {
    if (!current) return;
    setStatusMap((prev) => {
      const next = { ...prev };
      // Toggle back to pending when re-tapping the same status.
      next[current.id] = prev[current.id] === status ? 'pending' : status;
      return next;
    });
    if (currentIndex < total - 1) {
      goNext();
    }
  };

  const markCompleted = (): void => setStatusAndAdvance('completed');
  const markSkipped = (): void => setStatusAndAdvance('skipped');

  return {
    current,
    currentIndex,
    currentStatus,
    total,
    completedCount,
    completionPercentage,
    goNext,
    goPrev,
    markCompleted,
    markSkipped,
  };
}
