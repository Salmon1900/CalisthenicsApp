import { createClient } from '@supabase/supabase-js';

// Environment variables must be prefixed with EXPO_PUBLIC_ to be accessible in Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export type ExerciseCategory =
  | 'strength'
  | 'warmup'
  | 'dynamic_stretch'
  | 'static_stretch'
  | 'mobility';

export type ExercisePhase = 'pre' | 'post' | 'both';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  difficulty: number;
  type: 'reps' | 'timed';
  /** Movement category — distinguishes warmups/stretches from strength work. */
  category: ExerciseCategory;
  /** When the exercise belongs in a session: pre-workout, post-workout, or both. */
  phase: ExercisePhase;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanExercise {
  id: string;
  workout_plan_id: string;
  exercise_id: string;
  order_index: number;
  /** Per-set base value: reps for `reps` exercises, seconds for `timed`. */
  quantity: number;
  /** Number of sets to perform. */
  sets: number;
  /** Per-set override list; null means every set uses `quantity`. */
  set_reps: number[] | null;
  /** Rest in seconds between sets. */
  rest_seconds: number;
  created_at: string;
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  user_id: string | null;
  workout_plan_id: string | null;
  duration_seconds: number;
  completion_percentage: number;
  created_at: string;
}

export interface MapLevel {
  id: string;
  level_number: number;
  workout_plan_id: string;
  is_boss: boolean;
  created_at: string;
  workout_plans?: WorkoutPlan;
}

export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, 'id' | 'created_at'>;
        Update: Partial<Omit<Exercise, 'id' | 'created_at'>>;
      };
      workout_plans: {
        Row: WorkoutPlan;
        Insert: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>>;
      };
      workout_plan_exercises: {
        Row: WorkoutPlanExercise;
        Insert: Omit<WorkoutPlanExercise, 'id' | 'created_at' | 'exercise'>;
        Update: Partial<Omit<WorkoutPlanExercise, 'id' | 'created_at' | 'exercise'>>;
      };
      workouts: {
        Row: Workout;
        Insert: Omit<Workout, 'id' | 'created_at'>;
        Update: Partial<Omit<Workout, 'id' | 'created_at'>>;
      };
    };
  };
}
