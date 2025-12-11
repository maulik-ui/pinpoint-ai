/**
 * API endpoint to manually submit Reddit Answers response for sentiment analysis
 * 
 * POST /api/admin/reddit-sentiment
 * Body: { toolSlug: string, redditAnswer: string }
 */

import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";
import { summarizeSentiment } from "@/src/lib/sentiment/services/openai";
import { insertSentimentRun, getLatestSentimentRuns } from "@/src/lib/sentiment/services/supabase";
import { computeSentimentAggregate } from "@/src/lib/sentiment/services/scoring";
import { insertSentimentAggregate } from "@/src/lib/sentiment/services/supabase";
import type { RawSourceData } from "@/src/lib/sentiment/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const toolSlug = body?.toolSlug?.toString().trim();
    const redditAnswer = body?.redditAnswer?.toString().trim();

    if (!toolSlug) {
      return NextResponse.json(
        { success: false, error: "toolSlug is required" },
        { status: 400 }
      );
    }

    if (!redditAnswer || redditAnswer.length < 50) {
      return NextResponse.json(
        { success: false, error: "redditAnswer must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Get the tool by slug
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id, name, slug")
      .eq("slug", toolSlug)
      .maybeSingle();

    if (toolError || !tool) {
      return NextResponse.json(
        { success: false, error: `Tool not found with slug: ${toolSlug}` },
        { status: 404 }
      );
    }

    const runAt = new Date().toISOString();
    const windowStart = new Date();
    windowStart.setMonth(windowStart.getMonth() - 12); // Default 12 months lookback

    // Create RawSourceData from the manual input
    const redditData: RawSourceData = {
      source: "reddit",
      tool_id: tool.id,
      text_blocks: [
        `REDDIT ANSWERS RESPONSE (Manual Input):\n\n${redditAnswer}`,
      ],
      metadata: {
        total_items: 1,
        window_start: windowStart.toISOString(),
        window_end: runAt,
        manual_input: true,
      },
    };

    // Summarize with OpenAI
    console.log(`[Reddit Manual] Summarizing Reddit data for ${tool.name}...`);
    const redditSummary = await summarizeSentiment("reddit", tool.name, redditData);

    // Store sentiment run
    const sentimentRun = await insertSentimentRun({
      tool_id: tool.id,
      source: "reddit",
      run_at: runAt,
      raw_window_start: windowStart.toISOString(),
      raw_window_end: runAt,
      overall_sentiment_0_to_10: redditSummary.overall_sentiment_0_to_10,
      sentiment_label: redditSummary.sentiment_label,
      summary: redditSummary.summary,
      top_positives: redditSummary.top_positives,
      top_negatives: redditSummary.top_negatives,
      top_features: redditSummary.top_features,
      subscores: redditSummary.subscores ? Object.fromEntries(
        Object.entries(redditSummary.subscores).filter(([_, value]) => typeof value === 'number')
      ) as Record<string, number> : {},
    });

    console.log(`[Reddit Manual] Stored Reddit run for ${tool.name}`);

    // Get latest runs for all sources to compute aggregate
    const latestRuns = await getLatestSentimentRuns(tool.id);

    // Compute new aggregate with the updated Reddit data
    const aggregateData = computeSentimentAggregate({
      reddit: sentimentRun,
      x: latestRuns.x,
      youtube: latestRuns.youtube,
    });

    // Store aggregate
    const aggregate = await insertSentimentAggregate({
      tool_id: tool.id,
      run_at: runAt,
      ...aggregateData,
    });

    console.log(
      `[Reddit Manual] Updated aggregate for ${tool.name}: ${aggregate.final_score_0_to_10}/10 (${aggregate.final_label})`
    );

    return NextResponse.json({
      success: true,
      toolId: tool.id,
      toolName: tool.name,
      message: `Sentiment score: ${redditSummary.overall_sentiment_0_to_10}/10 (${redditSummary.sentiment_label}). Aggregate updated: ${aggregate.final_score_0_to_10}/10`,
    });
  } catch (error) {
    console.error("Failed to process Reddit sentiment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process Reddit sentiment",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

