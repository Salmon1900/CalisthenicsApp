---
name: schema-state
description: Current public schema tables, columns, constraints, indexes, and RLS state for the CalisthenicsApp Supabase project
metadata:
  type: project
---

## Supabase Project URL
https://wshezrsjjeippmvucsjm.supabase.co

## Tables (as of 2026-06-01)

### exercises
- RLS: enabled
- Rows: 24 (seeded exercise catalog)
- PK: id (uuid, gen_random_uuid())
- Columns: id, name, description (nullable), difficulty (CHECK: beginner/intermediate/advanced), created_at (timestamptz), type (text NOT NULL DEFAULT 'reps', CHECK: reps/timed)
- FK referenced by: workout_plan_exercises.exercise_id
- RLS policies: public SELECT (true), public INSERT (true), public UPDATE (true), public DELETE (true)
  - Migration `allow_anon_insert_update_exercises` added SELECT/INSERT/UPDATE
  - Migration `allow_anon_delete_exercises` added missing DELETE policy (bug fix: RLS was silently swallowing deletes, returning 204 with no row removed)

### workout_plans
- RLS: enabled (permissive — all operations USING/WITH CHECK true)
- Rows: 0
- PK: id (uuid, gen_random_uuid())
- Columns: id, name (NOT NULL), description (nullable), created_at (timestamptz), updated_at (timestamptz)
- FK referenced by: workout_plan_exercises.workout_plan_id
- Policies: Public SELECT, Anyone INSERT/UPDATE/DELETE (all true)

### workout_plan_exercises
- RLS: enabled (permissive — all operations USING/WITH CHECK true)
- Rows: 0
- PK: id (uuid, gen_random_uuid())
- Columns: id, workout_plan_id (uuid NOT NULL FK -> workout_plans.id CASCADE DELETE), exercise_id (uuid NOT NULL FK -> exercises.id CASCADE DELETE), order_index (integer NOT NULL), quantity (integer NOT NULL), created_at (timestamptz)
- Indexes: idx_wpe_plan ON (workout_plan_id, order_index)
- Policies: Public SELECT, Anyone INSERT/UPDATE/DELETE (all true)

### workouts
- RLS: enabled (permissive — all operations USING/WITH CHECK true)
- Rows: 0
- PK: id (uuid, gen_random_uuid())
- Columns: id, user_id (uuid NULLABLE — no FK yet, intentional; will bind to auth.uid() when auth is added), workout_plan_id (uuid NULLABLE FK -> workout_plans.id ON DELETE SET NULL), duration_seconds (integer NOT NULL), completion_percentage (integer NOT NULL, CHECK 0-100), created_at (timestamptz)
- Indexes: workouts_user_id_idx ON (user_id), workouts_plan_id_idx ON (workout_plan_id)
- Policies: Public SELECT/INSERT/UPDATE/DELETE (all true)
- Design note: user_id nullable with no FK by design — app has no auth yet. ON DELETE SET NULL on workout_plan_id preserves history if a plan is deleted.

## Migration History
1. 20260531192844 — allow_anon_insert_update_exercises
2. 20260531194611 — add_type_column_to_exercises
3. 20260531194619 — create_workout_plans_table
4. 20260531194629 — create_workout_plan_exercises_table
5. 20260531194643 — rls_workout_plans
6. 20260531194647 — rls_workout_plan_exercises
7. (2026-05-31) allow_anon_delete_exercises — added DELETE policy to exercises (was missing, causing silent RLS block)
8. (2026-06-01) create_workouts_table — created workouts table with permissive RLS, FK to workout_plans (ON DELETE SET NULL), indexes on user_id and workout_plan_id

## Auth / RLS pattern note
App currently operates without user authentication in practice. All new tables use permissive `USING (true)` / `WITH CHECK (true)` policies across all operations to match this. RLS is still ENABLED on all tables so policies can be tightened later when auth is wired in (scope via auth.uid()).

See [[rls-policy-intent]] for future tightening plan.
