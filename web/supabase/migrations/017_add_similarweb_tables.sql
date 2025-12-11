-- Create similarweb_reports table
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

-- Create similarweb_monthly_data table
CREATE TABLE IF NOT EXISTS similarweb_monthly_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES similarweb_reports(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  visits BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, month)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_similarweb_reports_tool_id ON similarweb_reports(tool_id);
CREATE INDEX IF NOT EXISTS idx_similarweb_reports_period ON similarweb_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_similarweb_monthly_report_id ON similarweb_monthly_data(report_id);
CREATE INDEX IF NOT EXISTS idx_similarweb_monthly_tool_id ON similarweb_monthly_data(tool_id);
CREATE INDEX IF NOT EXISTS idx_similarweb_monthly_month ON similarweb_monthly_data(month);


