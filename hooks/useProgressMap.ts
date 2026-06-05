import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { queryKeys } from '../utils/queryKeys';
import type { WorkoutPlan } from '../utils/supabase';

export interface LevelState {
  levelNumber: number;
  plan: WorkoutPlan;
  isBoss: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
}

async function fetchProgressMap(userId: string): Promise<LevelState[]> {
  const [levelsResult, completionsResult] = await Promise.all([
    supabase
      .from('map_levels')
      .select('*, workout_plans(*)')
      .order('level_number', { ascending: true }),
    supabase
      .from('workouts')
      .select('workout_plan_id')
      .eq('user_id', userId)
      .eq('completion_percentage', 100),
  ]);

  if (levelsResult.error) throw new Error(levelsResult.error.message);
  if (completionsResult.error) throw new Error(completionsResult.error.message);

  const completedPlanIds = new Set(
    (completionsResult.data ?? []).map((w) => w.workout_plan_id as string),
  );

  const raw = (levelsResult.data ?? []) as Array<{
    level_number: number;
    workout_plan_id: string;
    is_boss: boolean;
    workout_plans: WorkoutPlan;
  }>;

  const levels: LevelState[] = raw.map((row, index) => ({
    levelNumber: row.level_number,
    plan: row.workout_plans,
    isBoss: row.is_boss,
    isCompleted: completedPlanIds.has(row.workout_plan_id),
    isUnlocked: index === 0 || completedPlanIds.has(raw[index - 1].workout_plan_id),
  }));

  return levels;
}

export function useProgressMap(userId: string | null): {
  levels: LevelState[];
  loading: boolean;
  error: string | null;
} {
  const { data, isPending, error } = useQuery({
    queryKey: userId ? queryKeys.progressMap.byUser(userId) : ['progressMap', 'none'],
    queryFn: () => fetchProgressMap(userId!),
    enabled: userId !== null,
  });

  return {
    levels: data ?? [],
    loading: isPending && userId !== null,
    error: error ? error.message : null,
  };
}
