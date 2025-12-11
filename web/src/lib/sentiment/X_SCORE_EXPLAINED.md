# How X (Twitter) Score is Calculated

This document explains the exact process for calculating the X/Twitter sentiment score.

## Step-by-Step Process

### Step 1: Data Collection via Grok API

**File**: `src/lib/sentiment/collectors/grok.ts`

1. **Question Asked to Grok**:
   ```
   What do people on X (Twitter) think about "{tool_name}" in the last 6 months?
   
   Please analyze X posts and provide a JSON object with the following structure:
   {
     "overall_sentiment_0_to_10": 7.5,
     "summary": "A brief summary of overall sentiment",
     "top_positives": ["positive point 1", "positive point 2", ...],
     "top_negatives": ["negative point 1", "negative point 2", ...],
     "major_features": ["feature 1", "feature 2", ...]
   }
   
   Requirements:
   - overall_sentiment_0_to_10: A number from 0 to 10 (0 = very negative, 10 = very positive)
   - top_positives: Array of exactly 10 positive things people say about {tool_name}
   - top_negatives: Array of exactly 10 negative things people say about {tool_name}
   - major_features: Array of major features or capabilities that people mention about {tool_name}
   - summary: 2-3 sentence summary of overall sentiment
   
   Focus on actual user posts, reviews, complaints, praise, and discussions about {tool_name}.
   Return ONLY valid JSON, no additional text or explanation.
   ```

2. **Grok API Call**:
   - Endpoint: `https://api.x.ai/v1/chat/completions`
   - Model: Tries `grok-3`, `grok-2`, `grok-2-latest`, `grok-2-1212` (in order)
   - Request format: OpenAI-compatible chat completions
   - Response format: JSON object

3. **Grok Response**:
   Grok searches X/Twitter and returns structured data including:
   - `overall_sentiment_0_to_10`: A score from 0-10
   - `summary`: Text summary
   - `top_positives`: Array of 10 positive points
   - `top_negatives`: Array of 10 negative points
   - `major_features`: Array of features mentioned

### Step 2: Data Normalization

**File**: `src/lib/sentiment/collectors/grok.ts` (lines 157-197)

The Grok response is parsed and normalized into text blocks:

```typescript
// Example normalized structure:
text_blocks = [
  "SUMMARY: [Grok's summary]\n\n" +
  "OVERALL SENTIMENT: 7.5/10\n\n" +
  "TOP POSITIVES:\n1. [positive 1]\n2. [positive 2]...\n\n" +
  "TOP NEGATIVES:\n1. [negative 1]\n2. [negative 2]...\n\n" +
  "MAJOR FEATURES:\n1. [feature 1]\n2. [feature 2]..."
]
```

### Step 3: OpenAI Summarization

**File**: `src/lib/sentiment/services/openai.ts` (lines 23-95)

The normalized text is sent to OpenAI for final sentiment analysis:

1. **System Prompt**:
   ```
   You are a precise sentiment analyst for AI tools. You analyze community 
   feedback from various sources and provide structured, consistent sentiment analysis.
   ```

2. **User Prompt**:
   ```
   You are evaluating sentiment about the AI tool "{tool_name}" based on x data from the community.

   You are given text content from x (posts, comments, tweets, videos, etc.).
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

   Here is the x data for {tool_name}:
   
   [The normalized text from Grok]
   ```

3. **OpenAI Processing**:
   - Model: `gpt-4o`
   - Temperature: `0.3` (lower = more consistent)
   - Response format: `json_object` (ensures valid JSON)
   - Max tokens: `2000`

4. **OpenAI Response**:
   ```json
   {
     "overall_sentiment_0_to_10": 7.5,
     "sentiment_label": "positive",
     "summary": "...",
     "top_positives": [...],
     "top_negatives": [...],
     "top_features": [...],
     "subscores": {...}
   }
   ```

### Step 4: Score Extraction and Validation

**File**: `src/lib/sentiment/services/openai.ts` (lines 78-86)

The score is extracted and validated:

```typescript
overall_sentiment_0_to_10: Math.max(0, Math.min(10, parsed.overall_sentiment_0_to_10))
// Clamps the score to 0-10 range
```

**Final X Score**: This `overall_sentiment_0_to_10` value becomes the X score.

---

## Important Notes

### Two-Stage Process:

1. **Grok Stage**: Grok searches X/Twitter and provides initial analysis
   - Grok may return its own `overall_sentiment_0_to_10` score
   - This is included in the text sent to OpenAI but may be refined

2. **OpenAI Stage**: OpenAI analyzes Grok's output and produces the final score
   - OpenAI reads Grok's summary, positives, negatives, and features
   - OpenAI produces the **final** `overall_sentiment_0_to_10` score
   - This is the score that gets stored and used

### Why Two Stages?

- **Grok**: Has access to real-time X/Twitter data and can search recent posts
- **OpenAI**: Provides consistent, structured analysis with standardized scoring

### Score Perspective:

The score is **from the perspective of creators/users** using the tool:
- **0-2**: Very negative (users hate it)
- **2-4**: Negative (users are dissatisfied)
- **4-6**: Mixed (users have mixed feelings)
- **6-8**: Positive (users like it)
- **8-10**: Very positive (users love it)

### Example Flow:

1. Tool: "Luma AI"
2. Grok searches X for posts about "Luma AI" in last 6 months
3. Grok returns: summary + 10 positives + 10 negatives + features
4. This data is formatted and sent to OpenAI
5. OpenAI analyzes it and returns: `overall_sentiment_0_to_10: 7.5`
6. **X Score = 7.5/10** (stored in database)

---

## Code Flow

```
collectGrokData() 
  → Calls Grok API with question
  → Parses Grok's JSON response
  → Normalizes into text blocks
  → Returns RawSourceData

summarizeSentiment('x', toolName, grokData)
  → Sends normalized text to OpenAI
  → OpenAI analyzes and returns JSON
  → Extracts overall_sentiment_0_to_10
  → Returns SentimentSummary with score

insertSentimentRun()
  → Stores score in database (x.overall_sentiment_0_to_10)
```

The X score you see is the `overall_sentiment_0_to_10` value returned by OpenAI after analyzing Grok's X/Twitter search results.

