-- Migration: Add traffic analytics columns to tools table
-- Stores web traffic data from DataForSEO API

ALTER TABLE tools ADD COLUMN IF NOT EXISTS monthly_visits INTEGER;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS unique_visitors INTEGER;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS bounce_rate NUMERIC(5, 2) CHECK (bounce_rate IS NULL OR (bounce_rate >= 0 AND bounce_rate <= 100));
ALTER TABLE tools ADD COLUMN IF NOT EXISTS avg_visit_duration INTEGER; -- in seconds
ALTER TABLE tools ADD COLUMN IF NOT EXISTS pages_per_visit NUMERIC(5, 2);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS traffic_data JSONB; -- Store full traffic data as JSON
ALTER TABLE tools ADD COLUMN IF NOT EXISTS traffic_data_updated_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN tools.monthly_visits IS 'Monthly website visits from DataForSEO';
COMMENT ON COLUMN tools.unique_visitors IS 'Unique visitors count';
COMMENT ON COLUMN tools.bounce_rate IS 'Bounce rate percentage (0-100)';
COMMENT ON COLUMN tools.avg_visit_duration IS 'Average visit duration in seconds';
COMMENT ON COLUMN tools.pages_per_visit IS 'Average number of pages per visit';
COMMENT ON COLUMN tools.traffic_data IS 'Full traffic analytics data from DataForSEO as JSON';
COMMENT ON COLUMN tools.traffic_data_updated_at IS 'Timestamp when traffic data was last updated';

-- Add index for traffic data queries
CREATE INDEX IF NOT EXISTS idx_tools_monthly_visits ON tools(monthly_visits DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_tools_traffic_updated ON tools(traffic_data_updated_at DESC NULLS LAST);


