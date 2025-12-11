-- Migration: Add capabilities_text column to tools table
-- This column stores detailed capabilities and pricing information extracted during enrichment

ALTER TABLE tools ADD COLUMN IF NOT EXISTS capabilities_text TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN tools.capabilities_text IS 'Stores detailed capabilities summary and pricing details extracted during tool enrichment. Pricing details are stored in a "Pricing Details:" section.';


