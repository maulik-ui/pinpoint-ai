import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

/**
 * Get alternative/recommended tools for a given tool
 * Returns tools similar to the current one (by category or name similarity)
 * Excludes the current tool
 * 
 * TODO: Could be enhanced with AI-based similarity matching
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get the current tool
    const { data: currentTool, error: toolError } = await supabase
      .from("tools")
      .select("id, name, category")
      .eq("slug", slug)
      .single();

    if (toolError || !currentTool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Find alternatives - prioritize same category, then similar tools
    let alternativesQuery = supabase
      .from("tools")
      .select("id, name, slug, category, short_description, logo_url, overall_score")
      .neq("id", currentTool.id)
      .limit(10);

    // If tool has a category, prioritize same category
    if (currentTool.category) {
      alternativesQuery = alternativesQuery.eq("category", currentTool.category);
    }

    const { data: alternatives, error: altError } = await alternativesQuery;

    if (altError) {
      console.error("Error fetching alternatives:", altError);
      return NextResponse.json(
        { error: "Failed to fetch alternatives" },
        { status: 500 }
      );
    }

    // If we don't have enough results, fill with other tools
    if (!alternatives || alternatives.length < 3) {
      const { data: moreAlternatives } = await supabase
        .from("tools")
        .select("id, name, slug, category, short_description, logo_url, overall_score")
        .neq("id", currentTool.id)
        .order("overall_score", { ascending: false, nullsLast: true })
        .limit(10);

      // Merge and deduplicate
      const existingIds = new Set((alternatives || []).map((a: any) => a.id));
      const additional = (moreAlternatives || []).filter((a: any) => !existingIds.has(a.id));
      const merged = [...(alternatives || []), ...additional].slice(0, 10);
      
      return NextResponse.json({ alternatives: merged.slice(0, 3) });
    }

    // Sort by score and return top 3
    const sorted = (alternatives || [])
      .sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 3);

    return NextResponse.json({ alternatives: sorted });
  } catch (error) {
    console.error("Error in alternatives route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}





