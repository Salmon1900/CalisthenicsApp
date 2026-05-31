# Supabase Schema Documentation

## Overview

This document describes the database schema for CalisthenicsApp. Follow the instructions below to set up your Supabase database.

---

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **New Project**
4. Choose your organization, enter a project name (e.g., **CalisthenicsApp**)
5. Set a strong database password and select your region
6. Wait for the project to initialize (2-3 minutes)

### 2. Get Your Credentials
1. In your Supabase project, go to **Settings > API**
2. Copy the **Project URL** and set it as \EXPO_PUBLIC_SUPABASE_URL\ in \.env.local\
3. Copy the **anon (public)** key and set it as \EXPO_PUBLIC_SUPABASE_ANON_KEY\ in \.env.local\

### 3. Create the Exercises Table
Follow these steps in the Supabase dashboard:

1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the SQL schema below:

\\\sql
-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on difficulty for faster queries
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);

-- Enable Row Level Security (RLS)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow public read access
CREATE POLICY "Allow public read access" ON exercises
  FOR SELECT USING (true);

-- Create RLS policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON exercises
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policy to allow users to update their own exercises
CREATE POLICY "Allow authenticated update" ON exercises
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
\\\

4. Click **Run** to execute the SQL

### 4. Verify Table Creation
1. Go to **Table Editor** in the left sidebar
2. You should see \exercises\ listed in your tables
3. Click on it to verify the columns are correct

---

## Database Schema

### exercises table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for each exercise |
| name | TEXT | NOT NULL | Exercise name (e.g., "Push-ups", "Pull-ups") |
| description | TEXT | NULL | Optional detailed description of the exercise |
| difficulty | TEXT | NOT NULL, CHECK (beginner\|intermediate\|advanced) | Skill level required |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Timestamp when exercise was added |

### Indexes
- \idx_exercises_difficulty\ on \difficulty\ column for optimized filtering by skill level

### Row Level Security (RLS)
- **Public Read**: Anyone can view exercises
- **Authenticated Insert**: Only logged-in users can add new exercises
- **Authenticated Update**: Only logged-in users can modify exercises

---

## Sample Data

To add sample exercises for testing, run this SQL query in the SQL Editor:

\\\sql
INSERT INTO exercises (name, description, difficulty) VALUES
  ('Push-ups', 'A basic bodyweight exercise for chest and triceps', 'beginner'),
  ('Pull-ups', 'An upper body exercise requiring a pull-up bar', 'intermediate'),
  ('Handstand Hold', 'An advanced balance and strength exercise', 'advanced'),
  ('Dips', 'Bodyweight exercise for triceps and chest', 'beginner'),
  ('Muscle-ups', 'Advanced movement combining pull-up and dip', 'advanced');
\\\

---

## TypeScript Integration

The \useExercises\ hook in \hooks/useExercises.ts\ provides typed access to exercises:

\\\	ypescript
import { useExercises } from './hooks/useExercises';

function ExerciseList() {
  const { exercises, loading, error, refetch } = useExercises();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {exercises.map((exercise) => (
        <Text key={exercise.id}>{exercise.name} ({exercise.difficulty})</Text>
      ))}
    </View>
  );
}
\\\

---

## Environment Variables

Ensure \.env.local\ is configured:

\\\
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\\\

**Note**: Never commit actual credentials to version control. Use \.env.local\ (add to \.gitignore\).

---

## Next Steps

1. ? Supabase project created
2. ? Credentials added to \.env.local\
3. ? Database schema created
4. Start building features that use \useExercises()\ hook
5. Add authentication when ready (Supabase Auth integration)
