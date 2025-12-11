/**
 * Main sentiment analysis job orchestrator
 * Coordinates collection, summarization, and persistence for a single tool
 * 
 * This is the main entry point for running sentiment analysis on a tool
 */

import type { Tool, SentimentJobResult, SentimentConfig } from './types';
import { DEFAULT_SENTIMENT_CONFIG } from './config';
import { collectRedditData } from './collectors/reddit';
import { collectGrokData } from './collectors/grok';
import { collectYouTubeData } from './collectors/youtube';
import { summarizeSentiment } from './services/openai';
import { insertSentimentRun, insertSentimentAggregate } from './services/supabase';
import { computeSentimentAggregate } from './services/scoring';

/**
 * Runs full sentiment analysis pipeline for a single tool
 * 
 * Steps:
 * 1. Collect data from Reddit, X (Grok), and YouTube
 * 2. Summarize each source with OpenAI
 * 3. Store sentiment runs in Supabase
 * 4. Compute aggregate score
 * 5. Store aggregate in Supabase
 * 
 * @param tool - Tool to analyze
 * @param config - Optional configuration (uses defaults if not provided)
 * @returns Job result with success status and details
 */
export async function runSentimentAnalysis(
  tool: Tool,
  config: SentimentConfig = DEFAULT_SENTIMENT_CONFIG
): Promise<SentimentJobResult> {
  const runAt = new Date().toISOString();
  const result: SentimentJobResult = {
    tool_id: tool.id,
    tool_name: tool.name,
    success: false,
    sources: {},
    errors: [],
  };

  const sentimentRuns: {
    reddit?: { run: any; summary: any };
    x?: { run: any; summary: any };
    youtube?: { run: any; summary: any };
  } = {};

  // Step 1: Collect data from each source (with error handling)
  console.log(`[Sentiment] Starting collection for ${tool.name}...`);

  // Reddit collection (optional - browser automation can be unreliable)
  if (config.enable_reddit !== true) {
    console.log(`[Sentiment] Reddit collection disabled (set enable_reddit: true in config to enable)`);
    result.sources.reddit = {
      success: false,
      error: 'Reddit collection disabled by config',
    };
  } else {
    try {
      console.log(`[Sentiment] Collecting Reddit data for ${tool.name}...`);
      const redditData = await collectRedditData(tool, config);
      
      // Skip summarization if no data collected
      if (redditData.text_blocks.length === 0) {
        console.log(`[Sentiment] Reddit: No data collected, skipping summarization`);
        result.sources.reddit = {
          success: false,
          error: 'No data collected from Reddit',
        };
      } else {
      console.log(`[Sentiment] Reddit: Collected ${redditData.text_blocks.length} text blocks`);
      
      // Summarize Reddit data
      console.log(`[Sentiment] Summarizing Reddit data for ${tool.name}...`);
      const redditSummary = await summarizeSentiment('reddit', tool.name, redditData);
    
    sentimentRuns.reddit = {
      run: {
        tool_id: tool.id,
        source: 'reddit' as const,
        run_at: runAt,
        raw_window_start: redditData.metadata.window_start || runAt,
        raw_window_end: redditData.metadata.window_end || runAt,
        overall_sentiment_0_to_10: redditSummary.overall_sentiment_0_to_10,
        sentiment_label: redditSummary.sentiment_label,
        summary: redditSummary.summary,
        top_positives: redditSummary.top_positives,
        top_negatives: redditSummary.top_negatives,
        top_features: redditSummary.top_features,
        subscores: redditSummary.subscores || {},
        openai_model: (redditSummary as any).openai_model_used || 'gpt-4o', // Latest OpenAI model (gpt-4o)
      },
      summary: redditSummary,
    };
    
        result.sources.reddit = {
          success: true,
          sentiment_score: redditSummary.overall_sentiment_0_to_10,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[Sentiment] Reddit collection failed for ${tool.name} (continuing with other sources):`, errorMessage);
      result.sources.reddit = {
        success: false,
        error: errorMessage,
      };
      // Don't add to errors array - Reddit is optional, failure is expected
    }
  }

  // X/Grok collection
  try {
    console.log(`[Sentiment] Collecting X/Grok data for ${tool.name}...`);
    const grokData = await collectGrokData(tool, config);
    console.log(`[Sentiment] X/Grok: Collected ${grokData.text_blocks.length} text blocks`);
    
    // Summarize X data
    console.log(`[Sentiment] Summarizing X/Grok data for ${tool.name}...`);
    const xSummary = await summarizeSentiment('x', tool.name, grokData);
    
    sentimentRuns.x = {
      run: {
        tool_id: tool.id,
        source: 'x' as const,
        run_at: runAt,
        raw_window_start: grokData.metadata.window_start || runAt,
        raw_window_end: grokData.metadata.window_end || runAt,
        overall_sentiment_0_to_10: xSummary.overall_sentiment_0_to_10,
        sentiment_label: xSummary.sentiment_label,
        summary: xSummary.summary,
        top_positives: xSummary.top_positives,
        top_negatives: xSummary.top_negatives,
        top_features: xSummary.top_features,
        subscores: xSummary.subscores || {},
        // Enhanced tracking fields
        data_window_start: grokData.metadata.data_window_start || grokData.metadata.window_start,
        data_window_end: grokData.metadata.data_window_end || grokData.metadata.window_end,
        source_post_count: xSummary.source_post_count || grokData.metadata.source_post_count,
        confidence_0_to_1: xSummary.confidence_0_to_1,
        grok_original_score: xSummary.grok_original_score || grokData.metadata.grok_original_score,
        pinpoint_adjusted_score: xSummary.pinpoint_adjusted_score,
        reason_for_adjustment: xSummary.reason_for_adjustment,
        scoring_schema_version: 'x_sentiment_v1',
        openai_model: (xSummary as any).openai_model_used || 'gpt-4o', // Latest OpenAI model (gpt-4o)
        grok_model: grokData.metadata.grok_model, // Latest available Grok model (grok-4 preferred)
      },
      summary: xSummary,
    };
    
    result.sources.x = {
      success: true,
      sentiment_score: xSummary.overall_sentiment_0_to_10,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Sentiment] X/Grok collection failed for ${tool.name}:`, errorMessage);
    result.sources.x = {
      success: false,
      error: errorMessage,
    };
    result.errors?.push(`X/Grok: ${errorMessage}`);
  }

  // YouTube collection
  try {
    console.log(`[Sentiment] Collecting YouTube data for ${tool.name}...`);
    const youtubeData = await collectYouTubeData(tool, config);
    console.log(`[Sentiment] YouTube: Collected ${youtubeData.text_blocks.length} text blocks`);
    
    // Summarize YouTube data
    console.log(`[Sentiment] Summarizing YouTube data for ${tool.name}...`);
    const youtubeSummary = await summarizeSentiment('youtube', tool.name, youtubeData);
    
    sentimentRuns.youtube = {
      run: {
        tool_id: tool.id,
        source: 'youtube' as const,
        run_at: runAt,
        raw_window_start: youtubeData.metadata.window_start || runAt,
        raw_window_end: youtubeData.metadata.window_end || runAt,
        overall_sentiment_0_to_10: youtubeSummary.overall_sentiment_0_to_10,
        sentiment_label: youtubeSummary.sentiment_label,
        summary: youtubeSummary.summary,
        top_positives: youtubeSummary.top_positives,
        top_negatives: youtubeSummary.top_negatives,
        top_features: youtubeSummary.top_features,
        subscores: youtubeSummary.subscores || {},
        openai_model: (youtubeSummary as any).openai_model_used || 'gpt-4o', // Latest OpenAI model (gpt-4o)
      },
      summary: youtubeSummary,
    };
    
    result.sources.youtube = {
      success: true,
      sentiment_score: youtubeSummary.overall_sentiment_0_to_10,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Sentiment] YouTube collection failed for ${tool.name}:`, errorMessage);
    result.sources.youtube = {
      success: false,
      error: errorMessage,
    };
    result.errors?.push(`YouTube: ${errorMessage}`);
  }

  // Step 2: Store sentiment runs in Supabase
  console.log(`[Sentiment] Storing sentiment runs for ${tool.name}...`);
  const storedRuns: {
    reddit?: any;
    x?: any;
    youtube?: any;
  } = {};

  for (const [source, data] of Object.entries(sentimentRuns)) {
    if (data) {
      try {
        const stored = await insertSentimentRun(data.run);
        storedRuns[source as 'reddit' | 'x' | 'youtube'] = stored;
        console.log(`[Sentiment] Stored ${source} run for ${tool.name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Sentiment] Failed to store ${source} run:`, errorMessage);
        result.errors?.push(`Store ${source}: ${errorMessage}`);
      }
    }
  }

  // Step 3: Compute aggregate score
  console.log(`[Sentiment] Computing aggregate score for ${tool.name}...`);
  const aggregateData = computeSentimentAggregate({
    reddit: storedRuns.reddit,
    x: storedRuns.x,
    youtube: storedRuns.youtube,
  });

  // Step 4: Store aggregate in Supabase
  try {
    const aggregate = await insertSentimentAggregate({
      tool_id: tool.id,
      run_at: runAt,
      ...aggregateData,
    });
    
    console.log(`[Sentiment] Stored aggregate for ${tool.name}: ${aggregate.final_score_0_to_10}/10 (${aggregate.final_label})`);
    
    result.aggregate = {
      final_score: aggregate.final_score_0_to_10,
      final_label: aggregate.final_label,
    };
    
    result.success = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Sentiment] Failed to store aggregate:`, errorMessage);
    result.errors?.push(`Store aggregate: ${errorMessage}`);
  }

  return result;
}

