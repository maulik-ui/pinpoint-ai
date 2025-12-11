# Sentiment Pipeline Setup Guide

## ✅ Step 1: Environment Variables (DONE)

You've already added:
- `YOUTUBE_API_KEY`
- `XAI_API_KEY` (for X/Twitter via Grok)
- `OPENAI_API_KEY`

Make sure these are in your `.env.local` file in the `web/` directory:
```bash
# In web/.env.local
YOUTUBE_API_KEY=your-key-here
XAI_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here

# Also ensure Supabase keys are set
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
# or
SUPABASE_ANON_KEY=your-anon-key
```

## 📋 Step 2: Create Database Tables

You need to run the SQL migration to create the sentiment tables in Supabase.

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `web/supabase/migrations/001_sentiment_tables.sql`
5. Click **Run** to execute the migration

### Option B: Via Supabase CLI

If you have Supabase CLI installed:
```bash
cd web
supabase db push
```

## 🧪 Step 3: Test the Pipeline

### Test via Tool Enrichment

1. Start your Next.js dev server:
   ```bash
   cd web
   npm run dev
   ```

2. Go to `/admin/tools` in your browser
3. Enter a tool name (e.g., "Luma AI") and click "Enrich tool"
4. The sentiment analysis will run automatically as part of the enrichment process
5. Check the steps output - you should see a `sentiment_analysis` step

### Test via API

Once a tool has been enriched, you can fetch sentiment data:
```bash
curl http://localhost:3000/api/tool/luma-ai/sentiment
```

## 📊 Step 4: Verify Data in Supabase

After running enrichment, check your Supabase tables:

1. **sentiment_runs** - Should have rows for each source (X, YouTube)
2. **sentiment_aggregate** - Should have one row per tool with the final score
3. **tools** - Should have `latest_sentiment_score` and `latest_sentiment_label` updated

## 🔧 Troubleshooting

### "Reddit collector not yet implemented"
This is expected - Reddit collection is not implemented yet. The pipeline will continue with X and YouTube.

### "XAI_API_KEY not set"
Make sure your X.AI API key is in `.env.local`. The X collector uses Grok (via X.AI API) to search Twitter.

### "YOUTUBE_API_KEY not set"
Make sure your YouTube API key is in `.env.local`.

### "Failed to insert sentiment run"
Check that:
1. The SQL migration has been run
2. Your Supabase service key has write permissions
3. The `tools` table exists and has the tool you're enriching

### Empty sentiment results
- Check that the tool name is searchable on YouTube/X
- Verify API keys are correct
- Check server logs for detailed error messages

## 📝 Next Steps

1. **Implement Reddit Collector** - Currently returns empty data. You'll need to integrate with Reddit's API or a Reddit search service.

2. **Schedule Automatic Runs** - Set up a cron job or scheduled task to run sentiment analysis every 3-6 months for all tools.

3. **Add Frontend Display** - Use the `/api/tool/[slug]/sentiment` endpoint to display sentiment scores on tool pages.

## 🎯 Quick Test Command

To test sentiment analysis for a specific tool programmatically:

```typescript
import { runSentimentAnalysis } from '@/src/lib/sentiment';

const result = await runSentimentAnalysis({
  id: 'your-tool-id',
  name: 'Luma AI',
  slug: 'luma-ai',
});
console.log(result);
```

