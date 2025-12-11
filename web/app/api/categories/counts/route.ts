import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Category ID to Category Name mapping
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

export async function GET() {
  try {
    // Fetch all tools with their categories
    const { data: tools, error } = await supabase
      .from("tools")
      .select("category");

    if (error) {
      console.error("Error fetching tools for category counts:", error);
      return NextResponse.json(
        { error: "Failed to fetch tool counts", details: error.message },
        { status: 500 }
      );
    }

    // Count tools per category
    const categoryCounts: Record<string, number> = {};
    
    // Initialize all categories with 0
    Object.values(CATEGORY_MAP).forEach((categoryName) => {
      categoryCounts[categoryName] = 0;
    });

    // Count tools by category
    (tools || []).forEach((tool) => {
      if (tool.category) {
        categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
      }
    });

    // Map back to category IDs
    const countsByCategoryId: Record<string, number> = {};
    Object.entries(CATEGORY_MAP).forEach(([categoryId, categoryName]) => {
      countsByCategoryId[categoryId] = categoryCounts[categoryName] || 0;
    });

    return NextResponse.json({
      counts: countsByCategoryId,
    });
  } catch (err) {
    console.error("Unexpected error in category counts route:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

