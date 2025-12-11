-- Add comprehensive SEO data columns from DataForSEO APIs
ALTER TABLE tools ADD COLUMN IF NOT EXISTS domain_authority INTEGER;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS referring_domains INTEGER;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS backlinks_count BIGINT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS ranked_keywords_count INTEGER;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS top_keywords JSONB;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS competitors JSONB;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS seo_data JSONB;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS seo_data_updated_at TIMESTAMPTZ;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS seo_score NUMERIC(5, 2);

COMMENT ON COLUMN tools.domain_authority IS 'Domain authority score from DataForSEO Backlinks API (0-100)';
COMMENT ON COLUMN tools.referring_domains IS 'Number of unique domains linking to this tool';
COMMENT ON COLUMN tools.backlinks_count IS 'Total number of backlinks';
COMMENT ON COLUMN tools.ranked_keywords_count IS 'Number of keywords the domain ranks for';
COMMENT ON COLUMN tools.top_keywords IS 'Top ranking keywords with positions and traffic (JSON array)';
COMMENT ON COLUMN tools.competitors IS 'Competitor domains with overlap percentages (JSON array)';
COMMENT ON COLUMN tools.seo_data IS 'Raw JSON data from all DataForSEO APIs (backlinks, keywords, domain rank, competitors)';
COMMENT ON COLUMN tools.seo_data_updated_at IS 'Timestamp when SEO data was last updated from DataForSEO';
COMMENT ON COLUMN tools.seo_score IS 'Overall SEO rating score (0-10) calculated from all SEO metrics';

