/*
  # Add Cheat Code Setting

  ## Changes
  - Add cheat_code setting to settings table for dynamic cheat code changes
  - Default value is 'admin123123'
*/

INSERT INTO settings (key, value)
VALUES ('cheat_code', 'admin123123')
ON CONFLICT (key) DO NOTHING;