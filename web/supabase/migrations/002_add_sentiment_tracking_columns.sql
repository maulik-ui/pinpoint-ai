-- Migration: Add enhanced tracking columns to sentiment_runs table
-- This migration adds the new columns that were added to the schema
-- Run this if you already have sentiment_runs table without these columns

-- Add enhanced tracking columns if they don't exist
ALTER TABLE sentiment_runs 
  ADD COLUMN IF NOT EXISTS data_window_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_window_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_post_count INTEGER,
  ADD COLUMN IF NOT EXISTS confidence_0_to_1 NUMERIC(3, 2) CHECK (confidence_0_to_1 IS NULL OR (confidence_0_to_1 >= 0 AND confidence_0_to_1 <= 1)),
  ADD COLUMN IF NOT EXISTS grok_original_score NUMERIC(3, 1) CHECK (grok_original_score IS NULL OR (grok_original_score >= 0 AND grok_original_score <= 10)),
  ADD COLUMN IF NOT EXISTS pinpoint_adjusted_score NUMERIC(3, 1) CHECK (pinpoint_adjusted_score IS NULL OR (pinpoint_adjusted_score >= 0 AND pinpoint_adjusted_score <= 10)),
  ADD COLUMN IF NOT EXISTS reason_for_adjustment TEXT,
  ADD COLUMN IF NOT EXISTS scoring_schema_version TEXT,
  ADD COLUMN IF NOT EXISTS openai_model TEXT,
  ADD COLUMN IF NOT EXISTS grok_model TEXT;

