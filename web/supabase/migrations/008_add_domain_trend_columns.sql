-- Migration: Add optional trend columns for domain data
-- These can be computed from historical_data in domain_data JSONB
-- Optional columns for easier querying and filtering

ALTER TABLE tools ADD COLUMN IF NOT EXISTS etv_growth_percentage NUMERIC(5, 2);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS keywords_growth_percentage NUMERIC(5, 2);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS historical_months_count INTEGER;

COMMENT ON COLUMN tools.etv_growth_percentage IS 'ETV growth percentage over historical period (computed from historical_data)';
COMMENT ON COLUMN tools.keywords_growth_percentage IS 'Keywords growth percentage over historical period (computed from historical_data)';
COMMENT ON COLUMN tools.historical_months_count IS 'Number of months of historical data available';


