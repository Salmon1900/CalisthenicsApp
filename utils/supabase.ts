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
export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'reps' | 'timed';
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
  quantity: number;
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
