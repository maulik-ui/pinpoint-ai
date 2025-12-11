import { CategoryBrowse } from "@/src/components/CategoryBrowse";
import { supabase } from "@/src/lib/supabaseClient";

export const dynamic = "force-dynamic";

type BrowsePageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { category } = await searchParams;
  
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

  return <CategoryBrowse selectedCategoryId={category || null} categoryCounts={categoryCounts} />;
}

