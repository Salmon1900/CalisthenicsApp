import type { Exercise } from '../utils/supabase';

export type RootStackParamList = {
  Home: undefined;
  Exercises: undefined;
  ExerciseDetail: { exercise: Exercise };
  Admin: undefined;
};
