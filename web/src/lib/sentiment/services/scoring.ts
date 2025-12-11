/**
 * Scoring and aggregation service
 * Combines sentiment from multiple sources into a consistent final score
 * Uses fixed weights and thresholds to ensure comparability over time
 */

import type { SentimentRun, SentimentAggregate, SentimentSummary } from '../types';
import { SENTIMENT_WEIGHTS, SENTIMENT_LABEL_THRESHOLDS, RUBRIC_VERSION } from '../config';

/**
 * Computes final sentiment score and combined narrative from multiple sources
 * Uses weighted average and merges positives/negatives/features
 * 
 * @param runs - Latest sentiment runs from each source (may be missing some sources)
 * @returns Sentiment aggregate with final score and combined insights
 */
export function computeSentimentAggregate(runs: {
  reddit?: SentimentRun;
  x?: SentimentRun;
  youtube?: SentimentRun;
}): Omit<SentimentAggregate, 'id' | 'tool_id' | 'run_at'> {
  const scores: Array<{ source: 'reddit' | 'x' | 'youtube'; score: number; weight: number }> = [];
  const summaries: string[] = [];
  const allPositives: string[] = [];
  const allNegatives: string[] = [];
  const allFeatures: string[] = [];

  // Collect scores and content from each source
  if (runs.reddit) {
    scores.push({
      source: 'reddit',
      score: runs.reddit.overall_sentiment_0_to_10,
      weight: SENTIMENT_WEIGHTS.reddit,
    });
    summaries.push(`Reddit: ${runs.reddit.summary}`);
    allPositives.push(...runs.reddit.top_positives);
    allNegatives.push(...runs.reddit.top_negatives);
    allFeatures.push(...runs.reddit.top_features);
  }

  if (runs.x) {
    scores.push({
      source: 'x',
      score: runs.x.overall_sentiment_0_to_10,
      weight: SENTIMENT_WEIGHTS.x,
    });
    summaries.push(`X/Twitter: ${runs.x.summary}`);
    allPositives.push(...runs.x.top_positives);
    allNegatives.push(...runs.x.top_negatives);
    allFeatures.push(...runs.x.top_features);
  }

  if (runs.youtube) {
    scores.push({
      source: 'youtube',
      score: runs.youtube.overall_sentiment_0_to_10,
      weight: SENTIMENT_WEIGHTS.youtube,
    });
    summaries.push(`YouTube: ${runs.youtube.summary}`);
    allPositives.push(...runs.youtube.top_positives);
    allNegatives.push(...runs.youtube.top_negatives);
    allFeatures.push(...runs.youtube.top_features);
  }

  // Compute weighted average
  let totalWeight = 0;
  let weightedSum = 0;

  for (const { score, weight } of scores) {
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const finalLabel = mapScoreToLabel(finalScore);

  // Merge and deduplicate positives, negatives, and features
  // Prefer items that appear in multiple sources
  const combinedPositives = mergeAndDeduplicate(allPositives, 5);
  const combinedNegatives = mergeAndDeduplicate(allNegatives, 5);
  const combinedFeatures = mergeAndDeduplicate(allFeatures, 10);

  // Create cross-platform summary
  const crossPlatformSummary = summaries.join(' ');

  return {
    reddit_sentiment_0_to_10: runs.reddit?.overall_sentiment_0_to_10 ?? null,
    x_sentiment_0_to_10: runs.x?.overall_sentiment_0_to_10 ?? null,
    youtube_sentiment_0_to_10: runs.youtube?.overall_sentiment_0_to_10 ?? null,
    final_score_0_to_10: Math.round(finalScore * 10) / 10, // Round to 1 decimal place
    final_label: finalLabel,
    cross_platform_summary: crossPlatformSummary,
    combined_top_positives: combinedPositives,
    combined_top_negatives: combinedNegatives,
    combined_top_features: combinedFeatures,
    rubric_version: RUBRIC_VERSION,
  };
}

/**
 * Maps a numeric score (0-10) to a sentiment label
 * Uses fixed thresholds to ensure consistency over time
 * 
 * @param score - Numeric score from 0 to 10
 * @returns Sentiment label
 */
export function mapScoreToLabel(
  score: number
): 'very negative' | 'negative' | 'mixed' | 'positive' | 'very positive' {
  const clampedScore = Math.max(0, Math.min(10, score));

  for (const [label, range] of Object.entries(SENTIMENT_LABEL_THRESHOLDS)) {
    if (clampedScore >= range.min && clampedScore < range.max) {
      return label as 'very negative' | 'negative' | 'mixed' | 'positive' | 'very positive';
    }
  }

  // Handle edge case: exactly 10
  if (clampedScore === 10) {
    return 'very positive';
  }

  // Default fallback
  return 'mixed';
}

/**
 * Merges and deduplicates an array of strings
 * Prefers items that appear multiple times (from multiple sources)
 * Limits to maxItems
 * 
 * @param items - Array of items to merge
 * @param maxItems - Maximum number of items to return
 * @returns Deduplicated and prioritized array
 */
function mergeAndDeduplicate(items: string[], maxItems: number): string[] {
  // Count occurrences
  const counts = new Map<string, number>();
  for (const item of items) {
    const normalized = item.trim().toLowerCase();
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  }

  // Create array of [item, count] pairs
  const itemsWithCounts = Array.from(counts.entries()).map(([normalized, count]) => {
    // Find original item (preserve capitalization)
    const original = items.find((item) => item.trim().toLowerCase() === normalized);
    return { item: original || normalized, count };
  });

  // Sort by count (descending), then alphabetically
  itemsWithCounts.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.item.localeCompare(b.item);
  });

  // Return top maxItems
  return itemsWithCounts.slice(0, maxItems).map(({ item }) => item);
}

