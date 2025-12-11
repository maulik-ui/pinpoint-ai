-- Migration: Add domain data columns from DataForSEO APIs
-- Stores Domain Rank Overview and Backlinks Summary data

ALTER TABLE tools ADD COLUMN IF NOT EXISTS domain_data JSONB;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS domain_data_updated_at TIMESTAMPTZ;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS domain_score NUMERIC(5, 2);

-- Individual fields for easy querying
ALTER TABLE tools ADD COLUMN IF NOT EXISTS organic_etv NUMERIC(12, 2);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS organic_keywords INTEGER;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS domain_rank INTEGER;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS referring_domains INTEGER;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS backlinks_count BIGINT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS spam_score INTEGER;

COMMENT ON COLUMN tools.domain_data IS 'Raw JSON data from DataForSEO Domain Rank Overview and Backlinks Summary APIs';
COMMENT ON COLUMN tools.domain_data_updated_at IS 'Timestamp when domain data was last updated from DataForSEO';
COMMENT ON COLUMN tools.domain_score IS 'Overall domain score (0-10) calculated from traffic, visibility, authority, and quality metrics';
COMMENT ON COLUMN tools.organic_etv IS 'Estimated Traffic Value from Domain Rank Overview API';
COMMENT ON COLUMN tools.organic_keywords IS 'Number of organic keywords ranking from Domain Rank Overview API';
COMMENT ON COLUMN tools.domain_rank IS 'Domain rank (0-100) from Backlinks Summary API';
COMMENT ON COLUMN tools.referring_domains IS 'Number of unique domains linking to this tool';
COMMENT ON COLUMN tools.backlinks_count IS 'Total number of backlinks';
COMMENT ON COLUMN tools.spam_score IS 'Target spam score (0-100, lower is better)';

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tools_domain_score ON tools(domain_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_tools_organic_etv ON tools(organic_etv DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_tools_domain_rank ON tools(domain_rank DESC NULLS LAST);


