CREATE TABLE IF NOT EXISTS map_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER UNIQUE NOT NULL CHECK (level_number BETWEEN 1 AND 70),
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  is_boss BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_map_levels_workout_plan_id ON map_levels(workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_map_levels_level_number ON map_levels(level_number);

ALTER TABLE map_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON map_levels FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON map_levels FOR ALL USING (true) WITH CHECK (true);
