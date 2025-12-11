# Sentiment Analysis Pipeline

A comprehensive sentiment analysis pipeline for AI tools that collects community feedback from Reddit, X (Twitter), and YouTube, analyzes it with OpenAI, and stores structured results in Supabase.

## Architecture

The pipeline is organized into clear layers:

1. **Collectors** (`collectors/`) - Fetch raw data from each source
   - `reddit.ts` - Reddit API collector
   - `grok.ts` - Grok/X (Twitter) collector
   - `youtube.ts` - YouTube Data API collector

2. **Services** (`services/`) - Core business logic
   - `openai.ts` - LLM summarization service
   - `supabase.ts` - Database persistence layer
   - `scoring.ts` - Scoring and aggregation logic

3. **Job** (`job.ts`) - Main orchestrator that coordinates the entire pipeline

4. **Types** (`types.ts`) - TypeScript type definitions

5. **Config** (`config.ts`) - Configuration constants and weights

## Environment Variables

Required environment variables:

```bash
# OpenAI (required)
OPENAI_API_KEY=sk-...

# Supabase (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Reddit (optional - Reddit collector needs implementation)
REDDIT_API_KEY=your-reddit-api-key

# X.AI/Grok (optional - for X/Twitter collection)
XAI_API_KEY=your-xai-api-key

# YouTube (required for YouTube collection)
YOUTUBE_API_KEY=your-youtube-api-key
```

## Database Schema

The pipeline uses two main tables:

### `sentiment_runs`
Stores individual sentiment runs per source (Reddit, X, YouTube). Each row represents sentiment analysis for one source at one point in time.

### `sentiment_aggregate`
Stores unified sentiment results across all sources. Each row represents one complete sentiment analysis run for a tool.

See `supabase/migrations/001_sentiment_tables.sql` for the full schema.

## Usage

### Automatic (via Tool Enrichment)

The sentiment pipeline automatically runs when you click "Enrich tool" in the admin panel. It collects data from all three sources, summarizes with OpenAI, and stores results in Supabase.

### Manual (via API or Script)

```typescript
import { runSentimentAnalysis } from '@/src/lib/sentiment';

const result = await runSentimentAnalysis({
  id: 'tool-uuid',
  name: 'Luma AI',
  slug: 'luma-ai',
  search_query: null, // Optional custom search query
});
```

### Fetching Sentiment Data

```typescript
import { getLatestSentimentAggregate, getLatestSentimentRuns } from '@/src/lib/sentiment';

// Get latest aggregate
const aggregate = await getLatestSentimentAggregate(toolId);

// Get latest runs per source
const runs = await getLatestSentimentRuns(toolId);
```

### API Endpoint

```
GET /api/tool/[slug]/sentiment
```

Returns the latest sentiment aggregate, per-source runs, and historical trend data.

## Configuration

Edit `config.ts` to adjust:

- **Lookback period**: How far back to collect data (default: 12 months)
- **Collection limits**: Max posts/videos/comments per source
- **Scoring weights**: How much each source contributes to final score
- **Label thresholds**: Score ranges for sentiment labels

## Scoring Model

The pipeline uses a weighted average to combine scores from different sources:

- Each source gets equal weight by default (10 each)
- Final score is computed as: `(reddit_score * reddit_weight + x_score * x_weight + youtube_score * youtube_weight) / total_weight`
- Score is mapped to a label using fixed thresholds (never changed casually)

## Historical Data

All sentiment runs and aggregates are preserved in Supabase. Never delete rows - only insert new ones. This allows:

- Trend analysis over time
- Comparison of sentiment changes
- Re-running analysis with new rubric versions

## Error Handling

The pipeline is designed to be resilient:

- If one source fails, others continue
- Errors are logged but don't crash the entire job
- Failed sources are marked in the result but don't prevent aggregate computation

## Future Enhancements

- Implement actual Reddit API integration (currently placeholder)
- Add retry logic for transient API failures
- Add rate limiting awareness
- Create scheduled job runner for automatic runs every 3-6 months
- Add trend analysis endpoint with charts

