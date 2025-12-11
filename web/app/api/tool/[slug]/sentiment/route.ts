/**
 * API endpoint to fetch sentiment data for a tool
 * Returns latest sentiment aggregate and per-source runs
 * 
 * GET /api/tool/[slug]/sentiment
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabaseClient';
import {
  getLatestSentimentAggregate,
  getLatestSentimentRuns,
  getSentimentHistory,
} from '@/src/lib/sentiment/services/supabase';
import type { ToolSentimentData } from '@/src/lib/sentiment/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // First, get the tool ID from the slug
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id, name')
      .eq('slug', slug)
      .maybeSingle();

    if (toolError || !tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Fetch latest sentiment aggregate
    const aggregate = await getLatestSentimentAggregate(tool.id);

    if (!aggregate) {
      return NextResponse.json(
        { error: 'No sentiment data found for this tool' },
        { status: 404 }
      );
    }

    // Fetch latest runs per source
    const runs = await getLatestSentimentRuns(tool.id);

    // Fetch historical trend (last 12 runs)
    const history = await getSentimentHistory(tool.id, 12);

    const sentimentData: ToolSentimentData = {
      aggregate,
      runs,
      history: history.map((h) => ({
        run_at: h.run_at,
        final_score_0_to_10: h.final_score_0_to_10,
      })),
    };

    return NextResponse.json(sentimentData);
  } catch (error) {
    console.error('Failed to fetch sentiment data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sentiment data',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

