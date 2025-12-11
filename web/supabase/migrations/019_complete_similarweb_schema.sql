-- Complete Similarweb schema migration
-- This migration safely handles existing tables and adds all required columns

-- First, check if the table exists and what structure it has
-- If table doesn't exist, create it with all columns
-- If table exists, add missing columns

-- Step 1: Create the table if it doesn't exist (with all columns)
CREATE TABLE IF NOT EXISTS similarweb_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  report_period_start DATE,
  report_period_end DATE,
  total_visits BIGINT,
  monthly_visits BIGINT,
  pages_per_visit NUMERIC(10, 2),
  bounce_rate NUMERIC(5, 2),
  visit_duration_seconds INTEGER,
  avg_visit_duration_seconds INTEGER,
  unique_visitors BIGINT,
  desktop_percentage NUMERIC(5, 2),
  mobile_percentage NUMERIC(5, 2),
  total_page_views BIGINT,
  global_rank INTEGER,
  country_rank INTEGER,
  industry_rank INTEGER,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add tool_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'tool_id'
    ) THEN
        -- Add tool_id column with a temporary default, then make it NOT NULL
        ALTER TABLE similarweb_reports ADD COLUMN tool_id UUID;
        -- Add foreign key constraint
        ALTER TABLE similarweb_reports 
        ADD CONSTRAINT similarweb_reports_tool_id_fkey 
        FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE;
        -- Make it NOT NULL (this will fail if there are existing rows, so we do it last)
        -- If there are existing rows, you'll need to populate tool_id first
        -- ALTER TABLE similarweb_reports ALTER COLUMN tool_id SET NOT NULL;
    END IF;
END $$;

-- Step 3: Add all other columns if they don't exist
DO $$ 
BEGIN
    -- report_period_start
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'report_period_start'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN report_period_start DATE;
    END IF;
    
    -- report_period_end
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'report_period_end'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN report_period_end DATE;
    END IF;
    
    -- total_visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'total_visits'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN total_visits BIGINT;
    END IF;
    
    -- monthly_visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'monthly_visits'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN monthly_visits BIGINT;
    END IF;
    
    -- pages_per_visit
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'pages_per_visit'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN pages_per_visit NUMERIC(10, 2);
    END IF;
    
    -- bounce_rate
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'bounce_rate'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN bounce_rate NUMERIC(5, 2);
    END IF;
    
    -- visit_duration_seconds
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'visit_duration_seconds'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN visit_duration_seconds INTEGER;
    END IF;
    
    -- avg_visit_duration_seconds
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'avg_visit_duration_seconds'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN avg_visit_duration_seconds INTEGER;
    END IF;
    
    -- unique_visitors
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'unique_visitors'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN unique_visitors BIGINT;
    END IF;
    
    -- desktop_percentage
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'desktop_percentage'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN desktop_percentage NUMERIC(5, 2);
    END IF;
    
    -- mobile_percentage
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'mobile_percentage'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN mobile_percentage NUMERIC(5, 2);
    END IF;
    
    -- total_page_views
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'total_page_views'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN total_page_views BIGINT;
    END IF;
    
    -- global_rank
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'global_rank'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN global_rank INTEGER;
    END IF;
    
    -- country_rank
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'country_rank'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN country_rank INTEGER;
    END IF;
    
    -- industry_rank
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'industry_rank'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN industry_rank INTEGER;
    END IF;
    
    -- industry
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'industry'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN industry TEXT;
    END IF;
    
    -- created_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- updated_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'similarweb_reports' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE similarweb_reports ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 4: Create similarweb_monthly_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS similarweb_monthly_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES similarweb_reports(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  visits BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, month)
);

-- Step 5: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_similarweb_reports_tool_id ON similarweb_reports(tool_id);
CREATE INDEX IF NOT EXISTS idx_similarweb_reports_period ON similarweb_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_similarweb_monthly_report_id ON similarweb_monthly_data(report_id);
CREATE INDEX IF NOT EXISTS idx_similarweb_monthly_tool_id ON similarweb_monthly_data(tool_id);
CREATE INDEX IF NOT EXISTS idx_similarweb_monthly_month ON similarweb_monthly_data(month);

