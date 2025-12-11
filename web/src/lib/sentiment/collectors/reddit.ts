/**
 * Reddit Answers Browser Automation collector
 * Uses browser automation to interact with reddit.com/answers/ and extract responses
 * 
 * This is a wrapper that uses the Reddit Answers browser automation collector
 */

import type { Tool, RawSourceData, SentimentConfig } from '../types';
import { DEFAULT_SENTIMENT_CONFIG } from '../config';
import { collectRedditAnswersData } from './redditAnswers';

/**
 * Collects Reddit data for a given tool using Reddit Answers browser automation
 * 
 * @param tool - Tool definition with id, name, and optional search_query
 * @param config - Configuration for collection (lookback period, limits, etc.)
 * @returns Raw source data with text blocks and metadata
 */
export async function collectRedditData(
  tool: Tool,
  config: SentimentConfig = DEFAULT_SENTIMENT_CONFIG
): Promise<RawSourceData> {
  // Use the Reddit Answers browser automation collector
  return await collectRedditAnswersData(tool, config);
}
