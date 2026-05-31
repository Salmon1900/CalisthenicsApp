import type { Exercise, WorkoutPlan } from '../utils/supabase';

export type RootStackParamList = {
  Home: undefined;
  Exercises: undefined;
  ExerciseDetail: { exercise: Exercise };
  Admin: undefined;
  Plans: undefined;
  PlanDetail: { plan: WorkoutPlan };
};
