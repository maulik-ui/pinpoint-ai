/**
 * Supabase persistence service for sentiment data
 * Handles storing sentiment runs and aggregates with full history preservation
 * 
 * Environment variables required:
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_KEY: Supabase service role key (for admin operations)
 */

import { createClient } from '@supabase/supabase-js';
import type { SentimentRun, SentimentAggregate } from '../types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase env vars. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in environment.'
  );
}

// Use service role key for admin operations (inserts, updates)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Inserts a new sentiment run record
 * Never deletes, only adds new rows to preserve history
 * 
 * @param run - Sentiment run data to insert
 * @returns The inserted record with generated ID
 */
export async function insertSentimentRun(run: Omit<SentimentRun, 'id'>): Promise<SentimentRun> {
  const { data, error } = await supabase
    .from('sentiment_runs')
    .insert({
      tool_id: run.tool_id,
      source: run.source,
      run_at: run.run_at,
      raw_window_start: run.raw_window_start,
      raw_window_end: run.raw_window_end,
      overall_sentiment_0_to_10: run.overall_sentiment_0_to_10,
      sentiment_label: run.sentiment_label,
      summary: run.summary,
      top_positives: run.top_positives,
      top_negatives: run.top_negatives,
      top_features: run.top_features,
      subscores: run.subscores,
      // Enhanced tracking fields (optional, will be null if not provided)
      data_window_start: run.data_window_start || null,
      data_window_end: run.data_window_end || null,
      source_post_count: run.source_post_count || null,
      confidence_0_to_1: run.confidence_0_to_1 || null,
      grok_original_score: run.grok_original_score || null,
      pinpoint_adjusted_score: run.pinpoint_adjusted_score || null,
      reason_for_adjustment: run.reason_for_adjustment || null,
      scoring_schema_version: run.scoring_schema_version || null,
      openai_model: run.openai_model || null,
      grok_model: run.grok_model || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to insert sentiment run:', error);
    throw new Error(`Failed to insert sentiment run: ${error.message}`);
  }

  return data as SentimentRun;
}

/**
 * Inserts a new sentiment aggregate record
 * Represents unified result across all sources for a single run
 * 
 * @param aggregate - Sentiment aggregate data to insert
 * @returns The inserted record with generated ID
 */
export async function insertSentimentAggregate(
  aggregate: Omit<SentimentAggregate, 'id'>
): Promise<SentimentAggregate> {
  const { data, error } = await supabase
    .from('sentiment_aggregate')
    .insert({
      tool_id: aggregate.tool_id,
      run_at: aggregate.run_at,
      reddit_sentiment_0_to_10: aggregate.reddit_sentiment_0_to_10,
      x_sentiment_0_to_10: aggregate.x_sentiment_0_to_10,
      youtube_sentiment_0_to_10: aggregate.youtube_sentiment_0_to_10,
      final_score_0_to_10: aggregate.final_score_0_to_10,
      final_label: aggregate.final_label,
      cross_platform_summary: aggregate.cross_platform_summary,
      combined_top_positives: aggregate.combined_top_positives,
      combined_top_negatives: aggregate.combined_top_negatives,
      combined_top_features: aggregate.combined_top_features,
      rubric_version: aggregate.rubric_version,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to insert sentiment aggregate:', error);
    throw new Error(`Failed to insert sentiment aggregate: ${error.message}`);
  }

  return data as SentimentAggregate;
}

/**
 * Fetches the latest sentiment runs for a tool (one per source)
 * 
 * @param toolId - Tool ID to fetch runs for
 * @returns Latest runs for each source, or null if not found
 */
export async function getLatestSentimentRuns(toolId: string): Promise<{
  reddit?: SentimentRun;
  x?: SentimentRun;
  youtube?: SentimentRun;
}> {
  const { data, error } = await supabase
    .from('sentiment_runs')
    .select('*')
    .eq('tool_id', toolId)
    .order('run_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch sentiment runs:', error);
    throw new Error(`Failed to fetch sentiment runs: ${error.message}`);
  }

  const runs: { reddit?: SentimentRun; x?: SentimentRun; youtube?: SentimentRun } = {};

  for (const run of data || []) {
    if (run.source === 'reddit' && !runs.reddit) {
      runs.reddit = run as SentimentRun;
    } else if (run.source === 'x' && !runs.x) {
      runs.x = run as SentimentRun;
    } else if (run.source === 'youtube' && !runs.youtube) {
      runs.youtube = run as SentimentRun;
    }

    // Stop once we have all three sources
    if (runs.reddit && runs.x && runs.youtube) {
      break;
    }
  }

  return runs;
}

/**
 * Fetches the latest sentiment aggregate for a tool
 * 
 * @param toolId - Tool ID to fetch aggregate for
 * @returns Latest aggregate, or null if not found
 */
export async function getLatestSentimentAggregate(
  toolId: string
): Promise<SentimentAggregate | null> {
  const { data, error } = await supabase
    .from('sentiment_aggregate')
    .select('*')
    .eq('tool_id', toolId)
    .order('run_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch sentiment aggregate:', error);
    throw new Error(`Failed to fetch sentiment aggregate: ${error.message}`);
  }

  return data as SentimentAggregate | null;
}

/**
 * Fetches historical sentiment aggregates for trend analysis
 * 
 * @param toolId - Tool ID to fetch history for
 * @param limit - Maximum number of records to return (default: 12)
 * @returns Array of historical aggregates, ordered by run_at descending
 */
export async function getSentimentHistory(
  toolId: string,
  limit: number = 12
): Promise<SentimentAggregate[]> {
  const { data, error } = await supabase
    .from('sentiment_aggregate')
    .select('*')
    .eq('tool_id', toolId)
    .order('run_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch sentiment history:', error);
    throw new Error(`Failed to fetch sentiment history: ${error.message}`);
  }

  return (data || []) as SentimentAggregate[];
}

