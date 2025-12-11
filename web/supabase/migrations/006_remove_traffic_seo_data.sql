-- Migration: Remove all traffic and SEO data columns
-- This removes the DataForSEO integration columns

-- Drop indexes first
DROP INDEX IF EXISTS idx_tools_monthly_visits;
DROP INDEX IF EXISTS idx_tools_traffic_updated;

-- Drop traffic analytics columns
ALTER TABLE tools DROP COLUMN IF EXISTS monthly_visits;
ALTER TABLE tools DROP COLUMN IF EXISTS unique_visitors;
ALTER TABLE tools DROP COLUMN IF EXISTS bounce_rate;
ALTER TABLE tools DROP COLUMN IF EXISTS avg_visit_duration;
ALTER TABLE tools DROP COLUMN IF EXISTS pages_per_visit;
ALTER TABLE tools DROP COLUMN IF EXISTS traffic_data;
ALTER TABLE tools DROP COLUMN IF EXISTS traffic_data_updated_at;

-- Drop SEO data columns
ALTER TABLE tools DROP COLUMN IF EXISTS domain_authority;
ALTER TABLE tools DROP COLUMN IF EXISTS referring_domains;
ALTER TABLE tools DROP COLUMN IF EXISTS backlinks_count;
ALTER TABLE tools DROP COLUMN IF EXISTS ranked_keywords_count;
ALTER TABLE tools DROP COLUMN IF EXISTS top_keywords;
ALTER TABLE tools DROP COLUMN IF EXISTS competitors;
ALTER TABLE tools DROP COLUMN IF EXISTS seo_data;
ALTER TABLE tools DROP COLUMN IF EXISTS seo_data_updated_at;
ALTER TABLE tools DROP COLUMN IF EXISTS seo_score;


