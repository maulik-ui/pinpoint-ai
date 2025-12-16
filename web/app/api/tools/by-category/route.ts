import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Category ID to Category Name mapping
 * Maps the URL-friendly category IDs to the actual category names stored in the database
 */
const CATEGORY_MAP: Record<string, string> = {
  "core-models": "Core Models",
  "ai-workspaces": "AI Workspaces",
  "writing-tools": "Writing Tools",
  "code-copilots": "Code Copilots",
  "ui-design": "UI Design",
  "image-gen": "Image Gen",
  "image-editing": "Image Editing",
  "video-gen": "Video Gen",
  "video-editing": "Video Editing",
  "audio-voice": "Audio and Voice",
  "presentations": "Presentations",
  "marketing-ai": "Marketing AI",
  "sales-support": "Sales and Support",
  "data-analytics": "Data and Analytics",
  "automation-agents": "Automation Agents",
  "research-tools": "Research Tools",
  "education-ai": "Education AI",
  "legal-ai": "Legal AI",
  "finance-ops": "Finance Ops",
  "hr-tech": "HR Tech",
  "healthcare-ai": "Healthcare AI",
  "ecommerce-ai": "Ecommerce AI",
  "real-estate-ai": "Real Estate AI",
  "3d-vfx": "3D and VFX",
  "security-compliance": "Security and Compliance",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("category");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Missing category parameter" },
        { status: 400 }
      );
    }

    // Map category ID to category name
    const categoryName = CATEGORY_MAP[categoryId] || categoryId;

    // Fetch tools by category
    const { data: tools, error } = await supabase
      .from("tools")
      .select("id, name, slug, short_description, category, logo_url, pricing_model, overall_score, pinpoint_score")
      .eq("category", categoryName)
      .order("pinpoint_score", { ascending: false, nullsLast: true })
      .order("overall_score", { ascending: false, nullsLast: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching tools by category:", error);
      return NextResponse.json(
        { error: "Failed to fetch tools", details: error.message },
        { status: 500 }
      );
    }

    // Fetch sentiment aggregates for tools that don't have overall_score
    const toolIds = (tools || []).map((t: any) => t.id);
    let sentimentMap = new Map<string, number>();
    
    if (toolIds.length > 0) {
      const { data: aggregates } = await supabase
        .from("sentiment_aggregate")
        .select("tool_id, final_score_0_to_10")
        .in("tool_id", toolIds)
        .order("run_at", { ascending: false });

      if (aggregates) {
        // Create a map of tool_id to latest final_score_0_to_10
        const seen = new Set<string>();
        aggregates.forEach((agg: any) => {
          if (!seen.has(agg.tool_id) && agg.final_score_0_to_10 !== null) {
            sentimentMap.set(agg.tool_id, agg.final_score_0_to_10);
            seen.add(agg.tool_id);
          }
        });
      }
    }

    // Enrich tools with pinpoint_score, fallback to overall_score, then sentiment scores
    const enrichedTools = (tools || []).map((tool: any) => {
      const displayScore = tool.pinpoint_score ?? tool.overall_score ?? sentimentMap.get(tool.id) ?? null;
      return {
        ...tool,
        overall_score: displayScore, // Keep for backward compatibility
        pinpoint_score: tool.pinpoint_score ?? tool.overall_score ?? sentimentMap.get(tool.id) ?? null,
      };
    });

    // Re-sort after enrichment to ensure correct order (highest score first)
    enrichedTools.sort((a: any, b: any) => {
      const scoreA = a.pinpoint_score ?? a.overall_score ?? 0;
      const scoreB = b.pinpoint_score ?? b.overall_score ?? 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Descending order
      }
      // If scores are equal, sort by name
      return (a.name || '').localeCompare(b.name || '');
    });

    return NextResponse.json({
      tools: enrichedTools,
      category: categoryName,
      categoryId,
      count: enrichedTools.length,
    });
  } catch (err) {
    console.error("Unexpected error in by-category route:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

