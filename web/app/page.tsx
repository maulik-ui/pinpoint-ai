import { supabase } from "@/src/lib/supabaseClient";
import HomePage from "@/src/components/HomePage";

export const dynamic = "force-dynamic";

type Tool = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  logo_url: string | null;
  overall_score: number | null;
  pinpoint_score?: number | null;
};

type AlphaBarTool = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  short_description: string | null;
  is_sponsored: boolean;
  position: number;
};

export default async function Home() {
  // Fetch featured tools (top 3 by score or most recent)
  const { data: tools } = await supabase
    .from("tools")
    .select("id, name, slug, category, short_description, logo_url, overall_score, pinpoint_score")
    .order("pinpoint_score", { ascending: false, nullsLast: true })
    .order("overall_score", { ascending: false, nullsLast: true })
    .limit(3);

  const featuredTools = (tools ?? []) as Tool[];

  // Fetch active Alpha Bar slots
  // TODO: Uncomment when alpha_bar_slots table exists
  // const now = new Date().toISOString();
  // const { data: alphaBarSlots } = await supabase
  //   .from("alpha_bar_slots")
  //   .select(`
  //     id,
  //     tool_id,
  //     is_sponsored,
  //     position,
  //     tools:tool_id (
  //       id,
  //       name,
  //       slug,
  //       logo_url,
  //       short_description
  //     )
  //   `)
  //   .lte("start_date", now)
  //   .gte("end_date", now)
  //   .order("position", { ascending: true })
  //   .limit(3);

  // For now, use empty array (AlphaBar component handles empty state)
  const alphaBarTools: AlphaBarTool[] = [];

  // Fetch category tool counts
  let categoryCounts: Record<string, number> = {};
  try {
    const { data: tools } = await supabase
      .from("tools")
      .select("category");

    // Count tools per category
    const counts: Record<string, number> = {};
    (tools || []).forEach((tool) => {
      if (tool.category) {
        counts[tool.category] = (counts[tool.category] || 0) + 1;
      }
    });

    // Map category names to category IDs
    const categoryMap: Record<string, string> = {
      "Core Models": "core-models",
      "AI Workspaces": "ai-workspaces",
      "Writing Tools": "writing-tools",
      "Code Copilots": "code-copilots",
      "UI Design": "ui-design",
      "Image Gen": "image-gen",
      "Image Editing": "image-editing",
      "Video Gen": "video-gen",
      "Video Editing": "video-editing",
      "Audio and Voice": "audio-voice",
      "Presentations": "presentations",
      "Marketing AI": "marketing-ai",
      "Sales and Support": "sales-support",
      "Data and Analytics": "data-analytics",
      "Automation Agents": "automation-agents",
      "Research Tools": "research-tools",
      "Education AI": "education-ai",
      "Legal AI": "legal-ai",
      "Finance Ops": "finance-ops",
      "HR Tech": "hr-tech",
      "Healthcare AI": "healthcare-ai",
      "Ecommerce AI": "ecommerce-ai",
      "Real Estate AI": "real-estate-ai",
      "3D and VFX": "3d-vfx",
      "Security and Compliance": "security-compliance",
    };

    Object.entries(counts).forEach(([categoryName, count]) => {
      const categoryId = categoryMap[categoryName];
      if (categoryId) {
        categoryCounts[categoryId] = count;
      }
    });
  } catch (err) {
    console.error("Error fetching category counts:", err);
  }

  return <HomePage featuredTools={featuredTools} alphaBarTools={alphaBarTools} categoryCounts={categoryCounts} />;
}
