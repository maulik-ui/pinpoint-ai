# Apply Migration 005: Comprehensive SEO Data

This migration adds columns for comprehensive SEO data from DataForSEO APIs.

## Option 1: Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `supabase/migrations/005_add_comprehensive_seo_data.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

## Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
cd web
supabase db push
```

Or if you're using migrations:

```bash
cd web
supabase migration up
```

## Option 3: Direct SQL Execution

You can also run the SQL directly using any PostgreSQL client:

```sql
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
```

## Verify Migration

After applying, verify the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tools' 
AND column_name IN (
  'domain_authority', 
  'referring_domains', 
  'backlinks_count', 
  'ranked_keywords_count', 
  'top_keywords', 
  'competitors', 
  'seo_data', 
  'seo_data_updated_at', 
  'seo_score'
)
ORDER BY column_name;
```

You should see all 9 columns listed.

## What This Migration Adds

- **domain_authority**: Domain authority score (0-100)
- **referring_domains**: Number of unique domains linking to the tool
- **backlinks_count**: Total number of backlinks
- **ranked_keywords_count**: Number of keywords the domain ranks for
- **top_keywords**: JSON array of top ranking keywords with positions
- **competitors**: JSON array of competitor domains with overlap data
- **seo_data**: Raw JSON data from all DataForSEO APIs
- **seo_data_updated_at**: Timestamp when SEO data was last updated
- **seo_score**: Overall SEO rating score (0-10)

## Next Steps

After applying the migration:

1. ✅ Enrich a tool in the admin panel
2. ✅ Check the "SEO & Analytics Data" section in enrichment results
3. ✅ View SEO score on tool pages


