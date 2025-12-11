-- Migration: Create sentiment analysis tables
-- These tables store sentiment data collected from Reddit, X, and YouTube
-- All tables preserve history (never delete, only insert)

-- Table: sentiment_runs
-- Stores individual sentiment runs per source (Reddit, X, YouTube)
-- Each run represents sentiment analysis for one source at one point in time
CREATE TABLE IF NOT EXISTS sentiment_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('reddit', 'x', 'youtube')),
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_window_start TIMESTAMPTZ NOT NULL, -- Start of time window for collected data
  raw_window_end TIMESTAMPTZ NOT NULL, -- End of time window for collected data
  overall_sentiment_0_to_10 NUMERIC(3, 1) NOT NULL CHECK (overall_sentiment_0_to_10 >= 0 AND overall_sentiment_0_to_10 <= 10),
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('very negative', 'negative', 'mixed', 'positive', 'very positive')),
  summary TEXT NOT NULL,
  top_positives JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of up to 5 positive points
  top_negatives JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of up to 5 negative points
  top_features JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of up to 10 features/themes
  subscores JSONB NOT NULL DEFAULT '{}'::jsonb, -- Object with optional subscores (pricing, performance, etc.)
  -- Enhanced tracking fields
  data_window_start TIMESTAMPTZ, -- Actual data window start (more precise than raw_window_start)
  data_window_end TIMESTAMPTZ, -- Actual data window end (more precise than raw_window_end)
  source_post_count INTEGER, -- Number of posts/threads/videos considered
  confidence_0_to_1 NUMERIC(3, 2) CHECK (confidence_0_to_1 IS NULL OR (confidence_0_to_1 >= 0 AND confidence_0_to_1 <= 1)), -- Confidence in score (0-1)
  grok_original_score NUMERIC(3, 1) CHECK (grok_original_score IS NULL OR (grok_original_score >= 0 AND grok_original_score <= 10)), -- Original Grok score (for X source)
  pinpoint_adjusted_score NUMERIC(3, 1) CHECK (pinpoint_adjusted_score IS NULL OR (pinpoint_adjusted_score >= 0 AND pinpoint_adjusted_score <= 10)), -- Adjusted score by OpenAI meta-reviewer
  reason_for_adjustment TEXT, -- Why score was adjusted
  scoring_schema_version TEXT, -- Version of scoring schema used (e.g., "x_sentiment_v1")
  openai_model TEXT, -- OpenAI model used (e.g., "gpt-4o")
  grok_model TEXT, -- Grok model used (e.g., "grok-2")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_sentiment_runs_tool_id ON sentiment_runs(tool_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_runs_source ON sentiment_runs(source);
CREATE INDEX IF NOT EXISTS idx_sentiment_runs_run_at ON sentiment_runs(run_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_runs_tool_source ON sentiment_runs(tool_id, source, run_at DESC);

-- Table: sentiment_aggregate
-- Stores unified sentiment results across all sources for a single run
-- Each row represents one complete sentiment analysis run for a tool
CREATE TABLE IF NOT EXISTS sentiment_aggregate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reddit_sentiment_0_to_10 NUMERIC(3, 1) CHECK (reddit_sentiment_0_to_10 IS NULL OR (reddit_sentiment_0_to_10 >= 0 AND reddit_sentiment_0_to_10 <= 10)),
  x_sentiment_0_to_10 NUMERIC(3, 1) CHECK (x_sentiment_0_to_10 IS NULL OR (x_sentiment_0_to_10 >= 0 AND x_sentiment_0_to_10 <= 10)),
  youtube_sentiment_0_to_10 NUMERIC(3, 1) CHECK (youtube_sentiment_0_to_10 IS NULL OR (youtube_sentiment_0_to_10 >= 0 AND youtube_sentiment_0_to_10 <= 10)),
  final_score_0_to_10 NUMERIC(3, 1) NOT NULL CHECK (final_score_0_to_10 >= 0 AND final_score_0_to_10 <= 10),
  final_label TEXT NOT NULL CHECK (final_label IN ('very negative', 'negative', 'mixed', 'positive', 'very positive')),
  cross_platform_summary TEXT NOT NULL,
  combined_top_positives JSONB NOT NULL DEFAULT '[]'::jsonb, -- Merged positives from all sources
  combined_top_negatives JSONB NOT NULL DEFAULT '[]'::jsonb, -- Merged negatives from all sources
  combined_top_features JSONB NOT NULL DEFAULT '[]'::jsonb, -- Merged features from all sources
  rubric_version TEXT, -- Version of scoring rubric used (for consistency tracking)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_sentiment_aggregate_tool_id ON sentiment_aggregate(tool_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_aggregate_run_at ON sentiment_aggregate(run_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_aggregate_tool_run ON sentiment_aggregate(tool_id, run_at DESC);

-- Optional: Add a column to tools table to store latest sentiment score for quick access
-- This can be updated via a trigger or application logic
ALTER TABLE tools ADD COLUMN IF NOT EXISTS latest_sentiment_score NUMERIC(3, 1) CHECK (latest_sentiment_score IS NULL OR (latest_sentiment_score >= 0 AND latest_sentiment_score <= 10));
ALTER TABLE tools ADD COLUMN IF NOT EXISTS latest_sentiment_label TEXT CHECK (latest_sentiment_label IS NULL OR latest_sentiment_label IN ('very negative', 'negative', 'mixed', 'positive', 'very positive'));

CREATE INDEX IF NOT EXISTS idx_tools_latest_sentiment ON tools(latest_sentiment_score);

-- Function to update latest sentiment on tools table when new aggregate is inserted
-- This keeps the tools table in sync with the latest sentiment data
CREATE OR REPLACE FUNCTION update_tool_latest_sentiment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tools
  SET 
    latest_sentiment_score = NEW.final_score_0_to_10,
    latest_sentiment_label = NEW.final_label
  WHERE id = NEW.tool_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update tools table when sentiment aggregate is inserted
DROP TRIGGER IF EXISTS trigger_update_tool_sentiment ON sentiment_aggregate;
CREATE TRIGGER trigger_update_tool_sentiment
  AFTER INSERT ON sentiment_aggregate
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_latest_sentiment();

