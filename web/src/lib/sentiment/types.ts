/**
 * TypeScript types for the sentiment analysis pipeline
 * All entities are strongly typed for maintainability and extensibility
 */

/**
 * Tool definition - minimum required fields for sentiment collection
 */
export type Tool = {
  id: string;
  name: string;
  slug: string;
  search_query?: string | null; // Optional custom search query for social platforms
};

/**
 * Raw data collected from a source (before LLM summarization)
 */
export type RawSourceData = {
  source: 'reddit' | 'x' | 'youtube';
  tool_id: string;
  text_blocks: string[]; // Array of text fragments (posts, comments, tweets, etc.)
  metadata: {
    // Engagement stats (if available)
    total_items?: number;
    total_upvotes?: number;
    total_comments?: number;
    total_views?: number;
    // Time range covered
    window_start?: string; // ISO timestamp
    window_end?: string; // ISO timestamp
    // Source-specific metadata
    [key: string]: unknown;
  };
};

/**
 * Structured sentiment summary from OpenAI (per source)
 */
export type SentimentSummary = {
  overall_sentiment_0_to_10: number;
  sentiment_label: 'very negative' | 'negative' | 'mixed' | 'positive' | 'very positive';
  summary: string; // Short paragraph summary
  top_positives: string[]; // Up to 5 bullet points
  top_negatives: string[]; // Up to 5 bullet points
  top_features: string[]; // Up to 10 features/themes mentioned
  subscores?: {
    pricing?: number; // 0-10
    performance?: number; // 0-10
    quality?: number; // 0-10
    ease_of_use?: number; // 0-10
    innovation?: number; // 0-10
    [key: string]: number | undefined;
  };
  // Meta-review fields (for X/Grok source)
  grok_original_score?: number; // Original score from Grok
  pinpoint_adjusted_score?: number; // Adjusted score by OpenAI meta-reviewer
  reason_for_adjustment?: string; // Why score was adjusted (if applicable)
  confidence_0_to_1?: number; // Confidence in the score (0-1)
  source_post_count?: number; // Estimated number of posts/threads considered
};

/**
 * Sentiment run record (stored in Supabase sentiment_runs table)
 */
export type SentimentRun = {
  id?: string; // Auto-generated UUID
  tool_id: string;
  source: 'reddit' | 'x' | 'youtube';
  run_at: string; // ISO timestamp
  raw_window_start: string; // ISO timestamp - time span start
  raw_window_end: string; // ISO timestamp - time span end
  overall_sentiment_0_to_10: number;
  sentiment_label: 'very negative' | 'negative' | 'mixed' | 'positive' | 'very positive';
  summary: string;
  top_positives: string[]; // Stored as JSONB
  top_negatives: string[]; // Stored as JSONB
  top_features: string[]; // Stored as JSONB
  subscores: Record<string, number>; // Stored as JSONB
  // Enhanced tracking fields
  data_window_start?: string; // ISO timestamp - actual data window start
  data_window_end?: string; // ISO timestamp - actual data window end
  source_post_count?: number; // Number of posts/threads/videos considered
  confidence_0_to_1?: number; // Confidence in score (0-1)
  grok_original_score?: number; // Original Grok score (for X source)
  pinpoint_adjusted_score?: number; // Adjusted score by OpenAI meta-reviewer
  reason_for_adjustment?: string; // Why score was adjusted
  scoring_schema_version?: string; // Version of scoring schema used (e.g., "x_sentiment_v1")
  openai_model?: string; // OpenAI model used (e.g., "gpt-4o")
  grok_model?: string; // Grok model used (e.g., "grok-2")
};

/**
 * Sentiment aggregate record (stored in Supabase sentiment_aggregate table)
 * Represents unified result across all sources for a single run
 */
export type SentimentAggregate = {
  id?: string; // Auto-generated UUID
  tool_id: string;
  run_at: string; // ISO timestamp
  reddit_sentiment_0_to_10: number | null;
  x_sentiment_0_to_10: number | null;
  youtube_sentiment_0_to_10: number | null;
  final_score_0_to_10: number;
  final_label: 'very negative' | 'negative' | 'mixed' | 'positive' | 'very positive';
  cross_platform_summary: string;
  combined_top_positives: string[]; // Stored as JSONB
  combined_top_negatives: string[]; // Stored as JSONB
  combined_top_features: string[]; // Stored as JSONB
  rubric_version?: string; // Version of scoring rubric used (for consistency over time)
};

/**
 * Configuration for sentiment collection
 */
export type SentimentConfig = {
  // How far back to look for data
  lookback_months: number; // Default: 12
  // How often to schedule runs (in months)
  run_frequency_months: number; // Default: 3
  // Source-specific limits
  reddit_max_posts?: number;
  x_max_posts?: number;
  youtube_max_videos?: number;
  youtube_max_comments_per_video?: number;
  // Feature flags
  enable_reddit?: boolean; // Set to true to enable Reddit collection (default: false, browser automation can be unreliable)
};

/**
 * Result returned by sentiment collection job
 */
export type SentimentJobResult = {
  tool_id: string;
  tool_name: string;
  success: boolean;
  sources: {
    reddit?: {
      success: boolean;
      error?: string;
      sentiment_score?: number;
    };
    x?: {
      success: boolean;
      error?: string;
      sentiment_score?: number;
    };
    youtube?: {
      success: boolean;
      error?: string;
      sentiment_score?: number;
    };
  };
  aggregate?: {
    final_score: number;
    final_label: string;
  };
  errors?: string[];
};

/**
 * Tool sentiment data for frontend display
 */
export type ToolSentimentData = {
  // Latest aggregate
  aggregate: SentimentAggregate;
  // Latest runs per source
  runs: {
    reddit?: SentimentRun;
    x?: SentimentRun;
    youtube?: SentimentRun;
  };
  // Historical trend (optional, for charts)
  history?: Array<{
    run_at: string;
    final_score_0_to_10: number;
  }>;
};

