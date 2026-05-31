How to add the sample exercises to your Supabase database

Option A — Supabase SQL Editor (recommended):
1. Open your Supabase project → SQL Editor → New Query
2. Copy the contents of `sql/seed_exercises.sql` and click Run

Option B — Use the `supabase` client locally (requires env keys):
1. Ensure `.env.local` contains your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Run a Node script that uses `@supabase/supabase-js` to run the SQL or perform inserts

Sample direct SQL (same content as `sql/seed_exercises.sql`):

INSERT INTO exercises (name, description, difficulty) VALUES
  ('Push-up', 'A foundational bodyweight pressing exercise performed from a plank, lowering the chest to the ground and pressing back up to strengthen the chest, shoulders, triceps, and core.', 'beginner'),
  ('Pull-up', 'A vertical pulling exercise performed by hanging from a bar and pulling the chin above it, emphasizing the lats, biceps, and upper back; often progressed with band assists or negatives.', 'intermediate'),
  ('Muscle-up', 'An advanced compound movement combining an explosive pull-up with a transition into a dip above the bar or rings; requires high pulling power, coordination, and dip strength.', 'advanced');

Notes:
- Do not commit real API keys to source control.
- If you want, I can create a small seed script that attempts to run these inserts via the `utils/supabase.ts` client if your `.env.local` is configured; tell me if you'd like that executed here or you'd prefer to run it locally.
