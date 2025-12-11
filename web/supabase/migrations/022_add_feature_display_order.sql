-- Add display_order column to tool_features table for custom ordering
ALTER TABLE tool_features 
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Set initial display_order based on current order (using feature_name as fallback)
-- This ensures existing features have an order
UPDATE tool_features
SET display_order = subquery.row_number
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY tool_id ORDER BY feature_name) as row_number
  FROM tool_features
) AS subquery
WHERE tool_features.id = subquery.id;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tool_features_display_order ON tool_features(tool_id, display_order);

