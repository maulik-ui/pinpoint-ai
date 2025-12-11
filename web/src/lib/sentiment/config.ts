/**
 * Configuration constants for sentiment analysis pipeline
 * Centralized configuration that can be adjusted in one place
 */

import type { SentimentConfig } from './types';

/**
 * Default configuration for sentiment collection
 * Adjust these values to control how far back to look and collection limits
 */
export const DEFAULT_SENTIMENT_CONFIG: SentimentConfig = {
  lookback_months: 12, // Look back 12 months for data
  run_frequency_months: 3, // Run every 3 months for full refresh
  reddit_max_posts: 50, // Maximum Reddit posts to collect
  x_max_posts: 100, // Maximum X/Twitter posts to collect (via Grok)
  youtube_max_videos: 15, // Maximum YouTube videos to analyze
  youtube_max_comments_per_video: 80, // Maximum comments per video
  enable_reddit: false, // Set to true to enable Reddit collection (browser automation, can be unreliable)
};

/**
 * Scoring weights for combining sentiment from different sources
 * These weights determine how much each source contributes to the final score
 * 
 * Current weights: Equal weighting (10 each)
 * Adjust these if you want to prioritize certain sources over others
 */
export const SENTIMENT_WEIGHTS = {
  reddit: 10,
  x: 10,
  youtube: 10,
} as const;

/**
 * Thresholds for mapping numeric scores to sentiment labels
 * These thresholds ensure consistent labeling over time
 * DO NOT CHANGE these casually - they affect score comparability
 */
export const SENTIMENT_LABEL_THRESHOLDS = {
  'very negative': { min: 0, max: 2 },
  'negative': { min: 2, max: 4 },
  'mixed': { min: 4, max: 6 },
  'positive': { min: 6, max: 8 },
  'very positive': { min: 8, max: 10 },
} as const;

/**
 * Current rubric version for sentiment scoring
 * Increment this when making deliberate changes to the scoring methodology
 * This allows re-running all tools under a new rubric if needed
 */
export const RUBRIC_VERSION = '1.0.0';

/**
 * Scoring schema versions per source
 * Increment when changing prompts, rubrics, or models for a specific source
 */
export const SCORING_SCHEMA_VERSIONS = {
  reddit: 'reddit_sentiment_v1',
  x: 'x_sentiment_v1',
  youtube: 'youtube_sentiment_v1',
} as const;

/**
 * OpenAI model used for sentiment analysis
 * Using gpt-4o as the latest stable model available via API
 * Note: GPT-5.1 may not be available via API yet, using gpt-4o instead
 * Update this when GPT-5.1 becomes available via API
 */
export const OPENAI_MODEL = 'gpt-4o';
export const OPENAI_FALLBACK_MODEL = 'gpt-4o-mini';

/**
 * Environment variable names used by the pipeline
 * Documented here for reference
 */
export const ENV_VARS = {
  OPENAI_API_KEY: 'OPENAI_API_KEY', // OpenAI API key for LLM summarization
  SUPABASE_URL: 'SUPABASE_URL', // Supabase project URL
  SUPABASE_SERVICE_KEY: 'SUPABASE_SERVICE_KEY', // Supabase service role key (for admin operations)
  REDDIT_API_KEY: 'REDDIT_API_KEY', // Reddit API key (or Reddit Answers API key)
  XAI_API_KEY: 'XAI_API_KEY', // X.AI API key for Grok/X/Twitter search
  YOUTUBE_API_KEY: 'YOUTUBE_API_KEY', // YouTube Data API v3 key
} as const;

