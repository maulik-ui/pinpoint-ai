-- Add section_visibility JSONB column to tools table for controlling section visibility
-- Each section can be toggled ON/OFF independently
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS section_visibility JSONB DEFAULT '{
  "overview": true,
  "traction": true,
  "features": true,
  "proscons": true,
  "editor": true,
  "verification": true,
  "sentiment": true,
  "demos": true,
  "pricing": true,
  "alternatives": true
}'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tools_section_visibility ON tools USING GIN (section_visibility);
