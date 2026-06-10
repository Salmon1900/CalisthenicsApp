ALTER TABLE map_levels DROP CONSTRAINT IF EXISTS map_levels_level_number_check;
ALTER TABLE map_levels ADD CONSTRAINT map_levels_level_number_check CHECK (level_number BETWEEN 1 AND 100);
