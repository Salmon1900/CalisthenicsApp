import type { Exercise, WorkoutPlan } from '../utils/supabase';

export type RootStackParamList = {
  Home: undefined;
  Exercises: undefined;
  ExerciseDetail: { exercise: Exercise };
  Plans: undefined;
  PlanDetail: { plan: WorkoutPlan; locked?: boolean };
  PlanMaker: undefined;
  Workout: { plan: WorkoutPlan; includeWarmup?: boolean; includeCooldown?: boolean };
  ProgressMap: undefined;
  DigitalCoach: undefined;
  DigitalCoachResult: { exerciseDisplayName: string; videoUri: string };
};
