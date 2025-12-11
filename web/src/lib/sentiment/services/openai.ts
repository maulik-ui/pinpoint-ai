/**
 * OpenAI LLM summarization service
 * Converts raw source data into structured sentiment summaries
 * 
 * Environment variables required:
 * - OPENAI_API_KEY: OpenAI API key
 */

import OpenAI from 'openai';
import type { RawSourceData, SentimentSummary } from '../types';
import { SCORING_SCHEMA_VERSIONS, OPENAI_MODEL, OPENAI_FALLBACK_MODEL, SENTIMENT_LABEL_THRESHOLDS } from '../config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Summarizes raw source data into structured sentiment analysis
 * Uses OpenAI with JSON response format for reliable parsing
 * 
 * @param sourceName - Name of the source ('reddit', 'x', or 'youtube')
 * @param toolName - Name of the tool being analyzed
 * @param rawData - Raw text blocks and metadata from the collector
 * @returns Structured sentiment summary
 */
export async function summarizeSentiment(
  sourceName: 'reddit' | 'x' | 'youtube',
  toolName: string,
  rawData: RawSourceData
): Promise<SentimentSummary> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  // Combine all text blocks into a single input
  const combinedText = rawData.text_blocks.join('\n\n=========================\n\n');

  // Build the prompt for sentiment analysis (pass rawData for X source meta-reviewer)
  const prompt = buildSentimentPrompt(sourceName, toolName, combinedText, rawData);

  try {
    // Try latest model first, fallback to previous version if needed
    let completion;
    let modelUsed = OPENAI_MODEL;
    
    try {
      completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a precise sentiment analyst for AI tools. You analyze community feedback from various sources and provide structured, consistent sentiment analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0, // Zero temperature for maximum determinism
        max_tokens: 2000,
      });
    } catch (error) {
      // If latest model fails, try fallback
      console.warn(`[OpenAI] ${OPENAI_MODEL} failed, trying fallback ${OPENAI_FALLBACK_MODEL}:`, error);
      modelUsed = OPENAI_FALLBACK_MODEL;
      completion = await openai.chat.completions.create({
        model: OPENAI_FALLBACK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a precise sentiment analyst for AI tools. You analyze community feedback from various sources and provide structured, consistent sentiment analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0, // Zero temperature for maximum determinism
        max_tokens: 2000,
      });
    }

    const jsonContent = completion.choices[0]?.message?.content;
    if (!jsonContent) {
      throw new Error('OpenAI returned empty response');
    }

    // Parse and validate the JSON response
    let parsed: Partial<SentimentSummary>;
    try {
      parsed = JSON.parse(jsonContent) as Partial<SentimentSummary>;
    } catch (parseError) {
      console.error(`[OpenAI] Failed to parse JSON response for ${sourceName}:`, jsonContent);
      throw new Error(`Invalid JSON response from OpenAI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Log the parsed response for debugging
    console.log(`[OpenAI] Parsed response for ${sourceName} (${toolName}):`, {
      has_score: typeof parsed.overall_sentiment_0_to_10 === 'number',
      score: parsed.overall_sentiment_0_to_10,
      has_label: !!parsed.sentiment_label,
      label: parsed.sentiment_label,
      label_valid: parsed.sentiment_label ? isValidSentimentLabel(parsed.sentiment_label) : false,
    });

    // Validate required fields
    if (typeof parsed.overall_sentiment_0_to_10 !== 'number') {
      console.error(`[OpenAI] Invalid score in response:`, parsed);
      throw new Error('Missing or invalid overall_sentiment_0_to_10');
    }

    // If sentiment_label is missing or invalid, derive it from the score using the same thresholds
    let sentimentLabel: 'very negative' | 'negative' | 'mixed' | 'positive' | 'very positive';
    if (!parsed.sentiment_label || !isValidSentimentLabel(parsed.sentiment_label)) {
      console.warn(`[OpenAI] Missing or invalid sentiment_label for ${sourceName} (${toolName}), deriving from score ${parsed.overall_sentiment_0_to_10}`);
      // Derive label from score using the same thresholds as scoring.ts
      const score = parsed.overall_sentiment_0_to_10;
      const clampedScore = Math.max(0, Math.min(10, score));
      
      if (clampedScore >= SENTIMENT_LABEL_THRESHOLDS['very positive'].min && clampedScore <= 10) {
        sentimentLabel = 'very positive';
      } else if (clampedScore >= SENTIMENT_LABEL_THRESHOLDS['positive'].min && clampedScore < SENTIMENT_LABEL_THRESHOLDS['positive'].max) {
        sentimentLabel = 'positive';
      } else if (clampedScore >= SENTIMENT_LABEL_THRESHOLDS['mixed'].min && clampedScore < SENTIMENT_LABEL_THRESHOLDS['mixed'].max) {
        sentimentLabel = 'mixed';
      } else if (clampedScore >= SENTIMENT_LABEL_THRESHOLDS['negative'].min && clampedScore < SENTIMENT_LABEL_THRESHOLDS['negative'].max) {
        sentimentLabel = 'negative';
      } else {
        sentimentLabel = 'very negative';
      }
    } else {
      sentimentLabel = parsed.sentiment_label;
    }

    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Missing or invalid summary');
    }

    // For X source, use pinpoint_adjusted_score if available, otherwise use overall_sentiment_0_to_10
    let finalScore = parsed.overall_sentiment_0_to_10;
    if (sourceName === 'x' && typeof parsed.pinpoint_adjusted_score === 'number') {
      finalScore = parsed.pinpoint_adjusted_score;
    }

    // Round to 1 decimal place for consistency
    finalScore = Math.round(finalScore * 10) / 10;
    finalScore = Math.max(0, Math.min(10, finalScore)); // Clamp to 0-10

    // Ensure arrays exist and are properly formatted
    const summary: SentimentSummary = {
      overall_sentiment_0_to_10: finalScore,
      sentiment_label: sentimentLabel,
      summary: parsed.summary,
      top_positives: Array.isArray(parsed.top_positives) ? parsed.top_positives.slice(0, 5) : [],
      top_negatives: Array.isArray(parsed.top_negatives) ? parsed.top_negatives.slice(0, 5) : [],
      top_features: Array.isArray(parsed.top_features) ? parsed.top_features.slice(0, 10) : [],
      subscores: (parsed.subscores && typeof parsed.subscores === 'object') 
        ? Object.fromEntries(
            Object.entries(parsed.subscores).filter(([_, value]) => typeof value === 'number')
          ) as Record<string, number>
        : {},
      // Meta-reviewer fields (for X source)
      grok_original_score: typeof parsed.grok_original_score === 'number' ? Math.round(parsed.grok_original_score * 10) / 10 : undefined,
      pinpoint_adjusted_score: typeof parsed.pinpoint_adjusted_score === 'number' ? Math.round(parsed.pinpoint_adjusted_score * 10) / 10 : undefined,
      reason_for_adjustment: typeof parsed.reason_for_adjustment === 'string' ? parsed.reason_for_adjustment : undefined,
      confidence_0_to_1: typeof parsed.confidence_0_to_1 === 'number' ? Math.max(0, Math.min(1, parsed.confidence_0_to_1)) : undefined,
      source_post_count: typeof parsed.source_post_count === 'number' 
        ? parsed.source_post_count 
        : (typeof rawData.metadata.source_post_count === 'number' ? rawData.metadata.source_post_count : undefined),
    };

    // Store which model was actually used (for tracking/debugging)
    (summary as any).openai_model_used = modelUsed;

    return summary;
  } catch (error) {
    console.error(`OpenAI summarization failed for ${sourceName}:`, error);
    throw new Error(
      `OpenAI summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Builds the prompt for sentiment analysis
 * Includes deterministic scoring rubric and meta-reviewer logic for X source
 */
function buildSentimentPrompt(
  sourceName: string,
  toolName: string,
  combinedText: string,
  rawData?: RawSourceData
): string {
  const isXSource = sourceName === 'x';
  const grokOriginalScore = rawData?.metadata?.grok_original_score;
  const sourcePostCount = rawData?.metadata?.source_post_count;
  const dataWindowStart = rawData?.metadata?.data_window_start;
  const dataWindowEnd = rawData?.metadata?.data_window_end;

  // Base prompt
  let prompt = '';
  
  // Add source-specific question for YouTube
  if (sourceName === 'youtube') {
    prompt = `What does people on youtube think about "${toolName}"? Please summarize the top positives and top negatives and the major features of the tool.

You are evaluating sentiment about the AI tool "${toolName}" based on ${sourceName} data from the community.

You are given text content from ${sourceName} (posts, comments, tweets, videos, etc.).
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
  }`;
  } else {
    prompt = `You are evaluating sentiment about the AI tool "${toolName}" based on ${sourceName} data from the community.

You are given text content from ${sourceName} (posts, comments, tweets, videos, etc.).
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
  }`;
  }

  // Add meta-reviewer fields for X source
  if (isXSource) {
    prompt += `,
  "grok_original_score": number,
  "pinpoint_adjusted_score": number,
  "reason_for_adjustment": string,
  "confidence_0_to_1": number`;
  }

  prompt += `
}

SCORING RUBRIC (apply this scale consistently):
- 0.0 to 2.0: Overwhelmingly negative. Most users complain, very few positives. Serious fundamental issues.
- 2.1 to 4.0: Mostly negative. More complaints than praise. Serious issues or missing core features.
- 4.1 to 6.0: Mixed or lukewarm. Similar number of positives and negatives, or mild satisfaction. Some issues but also some strengths.
- 6.1 to 8.0: Mostly positive. Users are generally happy, issues exist but are not dealbreakers. Good tool with minor flaws.
- 8.1 to 10.0: Overwhelmingly positive. Strong enthusiasm, very few serious complaints, widely considered best in class.

Rules:
- Score should be from the perspective of creators/users using the tool
- Score must be a number with exactly ONE decimal place (e.g., 7.5, 8.2, 6.0)
- Apply the rubric above consistently - do not be overly optimistic or pessimistic
- Extract real themes and features that users mention
- Limit arrays: top_positives (max 5), top_negatives (max 5), top_features (max 10)
- Subscores are optional but helpful (0-10 each, one decimal place)
- Summary should be 2-4 sentences capturing overall sentiment`;

  // Add meta-reviewer instructions for X source
  if (isXSource && grokOriginalScore !== undefined) {
    prompt += `

META-REVIEWER INSTRUCTIONS (for X/Twitter source):
You are acting as a meta-reviewer. Grok has already analyzed X posts and provided:
- Grok's original score: ${grokOriginalScore}/10
${sourcePostCount ? `- Source post count: ${sourcePostCount} posts analyzed` : ''}
${dataWindowStart && dataWindowEnd ? `- Data window: ${dataWindowStart} to ${dataWindowEnd}` : ''}

Your job:
1. Review Grok's summary, positives, negatives, and features
2. Compare Grok's numeric score (${grokOriginalScore}/10) to the evidence provided
3. If the score seems inconsistent with the evidence, adjust it using the rubric above
4. Set "pinpoint_adjusted_score" to your final score (this becomes the official X score)
5. Set "grok_original_score" to ${grokOriginalScore}
6. If you adjusted the score, provide a brief "reason_for_adjustment" (e.g., "Grok score too optimistic given number of complaints")
7. If you kept Grok's score, set "reason_for_adjustment" to "Score consistent with evidence"
8. Set "confidence_0_to_1" based on data quality:
   - 0.9-1.0: High confidence (${sourcePostCount && typeof sourcePostCount === 'number' && sourcePostCount >= 100 ? '100+' : 'many'} posts, clear patterns)
   - 0.7-0.8: Medium confidence (moderate data, some patterns)
   - 0.5-0.6: Low confidence (limited data, unclear patterns)
   - Below 0.5: Very low confidence (very limited or conflicting data)

IMPORTANT: Do not just repeat Grok's score. Your job is to apply the Pinpoint scoring rubric consistently. Adjust if needed.`;
  } else if (isXSource) {
    prompt += `

META-REVIEWER INSTRUCTIONS (for X/Twitter source):
You are analyzing X/Twitter data. Provide:
- "pinpoint_adjusted_score": Your final score using the rubric above (this becomes the official X score)
- "grok_original_score": Set to null or omit if not available
- "reason_for_adjustment": "Initial analysis" or explanation if adjusting
- "confidence_0_to_1": Your confidence in the score based on data quality`;
  }

  prompt += `

Here is the ${sourceName} data for ${toolName}:

${combinedText}`;

  return prompt;
}

/**
 * Validates that a sentiment label is one of the allowed values
 */
function isValidSentimentLabel(
  label: string
): label is 'very negative' | 'negative' | 'mixed' | 'positive' | 'very positive' {
  return ['very negative', 'negative', 'mixed', 'positive', 'very positive'].includes(label);
}

