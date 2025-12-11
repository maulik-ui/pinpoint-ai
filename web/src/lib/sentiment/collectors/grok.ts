/**
 * Grok/X (Twitter) collector
 * Uses Grok API to search X posts about a tool for sentiment analysis
 * 
 * Environment variables required:
 * - XAI_API_KEY: X.AI API key (for Grok/X/Twitter search)
 */

import type { Tool, RawSourceData, SentimentConfig } from '../types';
import { DEFAULT_SENTIMENT_CONFIG } from '../config';

/**
 * Collects X/Twitter data for a given tool using Grok API
 * Queries Grok to search X posts about the tool within the specified time window
 * 
 * @param tool - Tool definition with id, name, and optional search_query
 * @param config - Configuration for collection (lookback period, limits, etc.)
 * @returns Raw source data with text blocks and metadata
 */
export async function collectGrokData(
  tool: Tool,
  config: SentimentConfig = DEFAULT_SENTIMENT_CONFIG
): Promise<RawSourceData> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('XAI_API_KEY environment variable is not set');
  }

  // Calculate time window
  const windowEnd = new Date();
  const windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - config.lookback_months);

  // Build search query for Grok
  const searchQuery = tool.search_query || tool.name;
  const lookbackMonths = Math.min(config.lookback_months, 6); // Use 6 months as requested
  
  const grokPrompt = `What does people on X think about "${tool.name}"? Please summarize the top positives and top negatives and the major features of the tool.

Please analyze X posts and provide a JSON object with the following structure:
{
  "overall_sentiment_0_to_10": 7.5,
  "summary": "A brief summary of overall sentiment",
  "top_positives": ["positive point 1", "positive point 2", ...],
  "top_negatives": ["negative point 1", "negative point 2", ...],
  "major_features": ["feature 1", "feature 2", ...],
  "source_post_count": 150,
  "data_window_start": "2024-10-01T00:00:00Z",
  "data_window_end": "2025-04-01T00:00:00Z"
}

Requirements:
- overall_sentiment_0_to_10: A number from 0.0 to 10.0 with exactly ONE decimal place (e.g., 7.5, 8.2, 6.0)
  Score anchor points:
  * 0.0 = Overwhelmingly negative. Most users complain, very few positives.
  * 5.0 = Mixed or neutral. Similar number of positives and negatives, or mild satisfaction.
  * 10.0 = Overwhelmingly positive. Strong enthusiasm, very few serious complaints, widely considered best in class.
- top_positives: Array of exactly 10 positive things people say about ${tool.name}
- top_negatives: Array of exactly 10 negative things people say about ${tool.name}
- major_features: Array of major features or capabilities that people mention about ${tool.name}
- summary: 2-3 sentence summary of overall sentiment
- source_post_count: Estimated number of X posts/threads you analyzed (integer)
- data_window_start: ISO timestamp of the earliest post you found
- data_window_end: ISO timestamp of the latest post you found

Focus on actual user posts, reviews, complaints, praise, and discussions about ${tool.name}.
Return ONLY valid JSON, no additional text or explanation.`;

  const textBlocks: string[] = [];
  let totalItems = 0;
  let approximateSentiment: number | undefined;
  let grokModelUsed: string | undefined;
  let grokOriginalScore: number | undefined;
  let sourcePostCount: number | undefined;
  let dataWindowStart: string | undefined;
  let dataWindowEnd: string | undefined;

  try {
    // Call X.AI API (Grok)
    // X.AI uses OpenAI-compatible API format
    // Try different model names if one fails
    // Models are tried in order - latest first
    // grok-4 is the latest model (released July 2025)
    // Note: grok-beta was deprecated on 2025-09-15
    const modelsToTry = [
      'grok-4',           // Latest model (released July 2025)
      'grok-3',           // Previous stable model
      'grok-2-latest',    // Latest grok-2 variant
      'grok-2',           // Stable grok-2
      'grok-2-1212',      // Specific grok-2 version
    ];
    let lastError: Error | null = null;
    let response: Response | null = null;
    let data: any = null;
    let lastErrorDetails: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[X.AI] Trying model: ${model} for tool: ${tool.name}`);
        response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that analyzes X (Twitter) posts and provides structured JSON summaries. Always return valid JSON only.',
              },
              {
                role: 'user',
                content: grokPrompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 4000,
            response_format: { type: 'json_object' }, // Request JSON format for easier parsing
          }),
        });

        if (response.ok) {
          data = await response.json();
          console.log(`[X.AI] ✅ Successfully used model: ${model}`);
          // Store which model was used
          grokModelUsed = model;
          break; // Success, exit loop
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          let errorJson: any = null;
          try {
            errorJson = JSON.parse(errorText);
          } catch {
            // Not JSON, use as text
          }
          
          const errorMessage = errorJson?.error?.message || errorJson?.message || errorText;
          console.error(`[X.AI] ❌ Model ${model} failed:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            fullError: errorText,
          });
          
          lastError = new Error(
            `X.AI API error with model "${model}" (${response.status}): ${errorMessage}`
          );
          lastErrorDetails = {
            model,
            status: response.status,
            error: errorMessage,
            fullError: errorText,
          };
          // Continue to next model
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[X.AI] ❌ Model ${model} threw exception:`, errorMessage);
        lastError = err instanceof Error ? err : new Error(String(err));
        lastErrorDetails = {
          model,
          exception: errorMessage,
        };
        // Continue to next model
      }
    }

    if (!response || !response.ok || !data) {
      // Log all attempted models for debugging
      console.error(`[X.AI] All models failed for ${tool.name}. Last error details:`, lastErrorDetails);
      if (lastError) {
        throw lastError;
      }
      throw new Error(
        `All X.AI models failed. Check your XAI_API_KEY and available models. Last error: ${JSON.stringify(lastErrorDetails)}`
      );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[X.AI] Empty response from API:', data);
      throw new Error('X.AI API returned empty response');
    }

    // Parse X.AI response - should be JSON if response_format was requested
    let parsed: any;
    try {
      // Try parsing as JSON first
      parsed = JSON.parse(content);
    } catch (parseError) {
      // If not JSON, try to extract JSON from text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // If all parsing fails, use content as-is
          console.warn('[X.AI] Could not parse response as JSON, using raw content');
          textBlocks.push(content);
          totalItems = 1;
          parsed = null;
        }
      } else {
        // No JSON found, use entire response as text block
        console.warn('[X.AI] No JSON found in response, using raw content');
        textBlocks.push(content);
        totalItems = 1;
        parsed = null;
      }
    }

    if (parsed) {
      // Build text blocks from the structured response
      const parts: string[] = [];
      
      // Add summary
      if (parsed.summary) {
        parts.push(`SUMMARY: ${parsed.summary}`);
      }
      
      // Add overall sentiment score (Grok's original)
      if (typeof parsed.overall_sentiment_0_to_10 === 'number') {
        approximateSentiment = parsed.overall_sentiment_0_to_10;
        // Round to 1 decimal for consistency
        const grokScore = Math.round(parsed.overall_sentiment_0_to_10 * 10) / 10;
        parts.push(`GROK ORIGINAL SENTIMENT: ${grokScore}/10`);
      }
      
      // Add source post count if available
      if (typeof parsed.source_post_count === 'number') {
        parts.push(`SOURCE POST COUNT: ${parsed.source_post_count} posts analyzed`);
        totalItems = parsed.source_post_count;
      }
      
      // Add data window if available
      if (parsed.data_window_start && parsed.data_window_end) {
        parts.push(`DATA WINDOW: ${parsed.data_window_start} to ${parsed.data_window_end}`);
      }
      
      // Add top positives
      if (Array.isArray(parsed.top_positives) && parsed.top_positives.length > 0) {
        parts.push(`TOP POSITIVES:\n${parsed.top_positives.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}`);
      }
      
      // Add top negatives
      if (Array.isArray(parsed.top_negatives) && parsed.top_negatives.length > 0) {
        parts.push(`TOP NEGATIVES:\n${parsed.top_negatives.map((n: string, i: number) => `${i + 1}. ${n}`).join('\n')}`);
      }
      
      // Add major features
      if (Array.isArray(parsed.major_features) && parsed.major_features.length > 0) {
        parts.push(`MAJOR FEATURES:\n${parsed.major_features.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}`);
      }

      // Combine all parts
      if (parts.length > 0) {
        textBlocks.push(parts.join('\n\n'));
      } else if (parsed.summary) {
        // Fallback: use summary if no structured data
        textBlocks.push(parsed.summary);
        totalItems = 1;
      }
      
      // Store Grok's original score and metadata for later use
      if (typeof parsed.overall_sentiment_0_to_10 === 'number') {
        approximateSentiment = Math.round(parsed.overall_sentiment_0_to_10 * 10) / 10;
        grokOriginalScore = approximateSentiment;
      }
      if (typeof parsed.source_post_count === 'number') {
        sourcePostCount = parsed.source_post_count;
      }
      if (parsed.data_window_start) {
        dataWindowStart = parsed.data_window_start;
      }
      if (parsed.data_window_end) {
        dataWindowEnd = parsed.data_window_end;
      }
    }

  } catch (error) {
    console.error(`Grok collection failed for tool ${tool.name}:`, error);
    throw new Error(`Grok collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    source: 'x',
    tool_id: tool.id,
    text_blocks: textBlocks,
    metadata: {
      total_items: totalItems,
      window_start: windowStart.toISOString(),
      window_end: windowEnd.toISOString(),
      approximate_sentiment: approximateSentiment,
      grok_original_score: grokOriginalScore,
      source_post_count: sourcePostCount,
      data_window_start: dataWindowStart,
      data_window_end: dataWindowEnd,
      grok_model: grokModelUsed,
    },
  };
}

