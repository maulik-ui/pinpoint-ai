/**
 * Sentiment Analysis Pipeline - Main Exports
 * 
 * This module provides a complete sentiment analysis pipeline that:
 * - Collects data from Reddit, X (via Grok), and YouTube
 * - Summarizes sentiment using OpenAI
 * - Stores results in Supabase with full history
 * - Provides consistent scoring across sources
 */

export * from './types';
export * from './config';
export { runSentimentAnalysis } from './job';
export {
  insertSentimentRun,
  insertSentimentAggregate,
  getLatestSentimentRuns,
  getLatestSentimentAggregate,
  getSentimentHistory,
} from './services/supabase';
export { summarizeSentiment } from './services/openai';
export { computeSentimentAggregate, mapScoreToLabel } from './services/scoring';
export { collectRedditData } from './collectors/reddit';
export { collectGrokData } from './collectors/grok';
export { collectYouTubeData } from './collectors/youtube';

