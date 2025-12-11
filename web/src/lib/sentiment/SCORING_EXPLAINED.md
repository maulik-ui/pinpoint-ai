# Sentiment Scoring Explained

This document explains how sentiment scores are calculated at each stage of the pipeline.

## Overview

The sentiment pipeline calculates scores in three stages:

1. **Per-Source Scores** (0-10): Each source (Reddit, X, YouTube) gets its own score
2. **Final Aggregate Score** (0-10): Weighted average across all sources
3. **Sentiment Labels**: Text labels mapped from numeric scores

---

## Stage 1: Per-Source Scores (0-10)

### How it works:

Each source (Reddit, X, YouTube) goes through the same process:

1. **Data Collection**: Raw text is collected from the source
   - Reddit: Manual input or browser automation
   - X: Grok API query
   - YouTube: Video titles, descriptions, and top comments

2. **OpenAI Summarization**: The raw text is sent to OpenAI with this prompt:

```
You are evaluating sentiment about the AI tool "{tool_name}" based on {source} data.

You are given text content from {source} (posts, comments, tweets, videos, etc.).
Please read everything and respond with **only** a JSON object matching this exact schema:

{
  "overall_sentiment_0_to_10": number,
  "sentiment_label": "very negative" | "negative" | "mixed" | "positive" | "very positive",
  "summary": string,
  "top_positives": string[],
  "top_negatives": string[],
  "top_features": string[],
  "subscores": {
    "pricing": number,
    "performance": number,
    "quality": number,
    "ease_of_use": number,
    "innovation": number
  }
}

Rules:
- Score should be from the perspective of creators/users using the tool (0 = very negative, 10 = very positive)
- Consider both praise and complaints
- Be honest and balanced, do not be overly optimistic or pessimistic
- Extract real themes and features that users mention
- Limit arrays: top_positives (max 5), top_negatives (max 5), top_features (max 10)
- Subscores are optional but helpful (0-10 each)
- Summary should be 2-4 sentences capturing overall sentiment
```

3. **Score Extraction**: OpenAI returns `overall_sentiment_0_to_10` (0-10 scale)

### Example:
- **Reddit**: 7.5/10 (positive)
- **X**: 8.2/10 (very positive)
- **YouTube**: 6.8/10 (positive)

---

## Stage 2: Final Aggregate Score (0-10)

### Formula:

```
final_score = (reddit_score × reddit_weight + x_score × x_weight + youtube_score × youtube_weight) / total_weight
```

### Current Weights:

```typescript
SENTIMENT_WEIGHTS = {
  reddit: 10,
  x: 10,
  youtube: 10,
}
```

**Equal weighting** - each source contributes equally to the final score.

### Calculation Example:

If you have:
- Reddit: 7.5/10
- X: 8.2/10
- YouTube: 6.8/10

```
total_weight = 10 + 10 + 10 = 30
weighted_sum = (7.5 × 10) + (8.2 × 10) + (6.8 × 10) = 75 + 82 + 68 = 225
final_score = 225 / 30 = 7.5
```

### Missing Sources:

If a source is missing (e.g., Reddit disabled), only available sources are used:

```
// If Reddit is missing:
total_weight = 0 + 10 + 10 = 20
weighted_sum = (8.2 × 10) + (6.8 × 10) = 82 + 68 = 150
final_score = 150 / 20 = 7.5
```

The score is **rounded to 1 decimal place** for display.

---

## Stage 3: Sentiment Labels

### Mapping Rules:

Numeric scores are mapped to text labels using fixed thresholds:

```typescript
SENTIMENT_LABEL_THRESHOLDS = {
  'very negative': { min: 0, max: 2 },    // 0.0 - 1.9
  'negative':      { min: 2, max: 4 },    // 2.0 - 3.9
  'mixed':         { min: 4, max: 6 },    // 4.0 - 5.9
  'positive':      { min: 6, max: 8 },    // 6.0 - 7.9
  'very positive': { min: 8, max: 10 },  // 8.0 - 10.0
}
```

### Examples:

- **Score: 1.5** → Label: "very negative"
- **Score: 3.2** → Label: "negative"
- **Score: 5.5** → Label: "mixed"
- **Score: 7.5** → Label: "positive"
- **Score: 9.2** → Label: "very positive"

**Important**: These thresholds are **never changed casually** to ensure score comparability over time.

---

## Subscores (Optional)

OpenAI can also return subscores for specific aspects:

- **pricing** (0-10): How users feel about pricing
- **performance** (0-10): Speed, reliability, etc.
- **quality** (0-10): Output quality
- **ease_of_use** (0-10): How easy it is to use
- **innovation** (0-10): How innovative the tool is

These are stored but **not used** in the final aggregate calculation. They're available for detailed analysis.

---

## Code Locations

- **Per-Source Scoring**: `src/lib/sentiment/services/openai.ts` - `summarizeSentiment()`
- **Aggregate Calculation**: `src/lib/sentiment/services/scoring.ts` - `computeSentimentAggregate()`
- **Label Mapping**: `src/lib/sentiment/services/scoring.ts` - `mapScoreToLabel()`
- **Weights & Thresholds**: `src/lib/sentiment/config.ts`

---

## Adjusting Weights

To change how much each source contributes, edit `config.ts`:

```typescript
export const SENTIMENT_WEIGHTS = {
  reddit: 15,   // Reddit now counts 50% more
  x: 10,
  youtube: 5,  // YouTube counts 50% less
} as const;
```

Example with new weights:
- Reddit: 7.5, X: 8.2, YouTube: 6.8
- total_weight = 15 + 10 + 5 = 30
- weighted_sum = (7.5 × 15) + (8.2 × 10) + (6.8 × 5) = 112.5 + 82 + 34 = 228.5
- final_score = 228.5 / 30 = 7.6

---

## Consistency Over Time

- **Rubric Version**: Each aggregate stores a `rubric_version` (currently "1.0.0")
- **Historical Data**: All scores are preserved, never deleted
- **Threshold Stability**: Label thresholds never change (ensures comparability)
- **Weight Stability**: Weights should only change with deliberate version bumps

This ensures you can compare sentiment scores across different time periods reliably.

