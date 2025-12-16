import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "@/src/lib/supabaseClient";
import Link from "next/link";
import {
  getLatestSentimentAggregate,
  getLatestSentimentRuns,
} from "@/src/lib/sentiment/services/supabase";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Logo from "@/src/components/Logo";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import AdminLogout from "@/src/components/AdminLogout";
import { ToolPage } from "@/src/components/ToolPage";

type Tool = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  pricing_model: string | null;
  overall_score: number | null;
  website_url: string | null;
  logo_url: string | null;
  tool_overview: string | null;
  domain_data: any | null;
  domain_score: number | null;
  organic_etv: number | null;
  organic_keywords: number | null;
  domain_rank: number | null;
  referring_domains: number | null;
  backlinks_count: number | null;
  spam_score: number | null;
  company_name: string | null;
  capabilities_text: string | null;
  pinpoint_score?: number | null;
  sentiment_score?: number | null;
  features_score?: number | null;
  adoption_score?: number | null;
  pricing_score?: number | null;
  verification_score?: number | null;
  users_score?: number | null;
  trust_score?: number | null;
  section_visibility?: {
    overview?: boolean;
    traction?: boolean;
    features?: boolean;
    proscons?: boolean;
    editor?: boolean;
    verification?: boolean;
    sentiment?: boolean;
    demos?: boolean;
    pricing?: boolean;
    alternatives?: boolean;
  } | null;
  score_visibility?: {
    pinpoint_score?: boolean;
    sentiment_score?: boolean;
    features_score?: boolean;
    adoption_score?: boolean;
    pricing_score?: boolean;
    verification_score?: boolean;
    users_score?: boolean;
    trust_score?: boolean;
  } | null;
};

type ToolPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminToolEditPage({ params }: ToolPageProps) {
  noStore();
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).trim();

  let tool: Tool | null = null;
  let toolError: any = null;
  
  // Try to fetch with section_visibility first
  const result = await supabase
    .from("tools")
    .select("id, name, slug, short_description, category, logo_url, website_url, pricing_model, overall_score, tool_overview, domain_data, domain_score, organic_etv, organic_keywords, domain_rank, referring_domains, backlinks_count, spam_score, company_name, capabilities_text, section_visibility, pinpoint_score, sentiment_score, features_score, adoption_score, pricing_score, verification_score, users_score, trust_score, score_visibility")
    .eq("slug", normalizedSlug)
    .maybeSingle<Tool>();

  tool = result.data;
  toolError = result.error;

  // If section_visibility column doesn't exist yet, retry without it
  if (toolError && (
    toolError.message?.includes("section_visibility") || 
    toolError.message?.includes("column") ||
    toolError.code === "PGRST116" ||
    toolError.code === "42703"
  )) {
    console.warn("Column error detected, retrying without section_visibility", {
      message: toolError.message,
      code: toolError.code,
    });
    const retryResult = await supabase
      .from("tools")
      .select("id, name, slug, short_description, category, logo_url, website_url, pricing_model, overall_score, tool_overview, domain_data, domain_score, organic_etv, organic_keywords, domain_rank, referring_domains, backlinks_count, spam_score, company_name, capabilities_text, pinpoint_score, sentiment_score, features_score, adoption_score, pricing_score, verification_score, users_score, trust_score, score_visibility")
      .eq("slug", normalizedSlug)
      .maybeSingle<Tool>();
    
    if (retryResult.error && !retryResult.error.message?.includes("section_visibility")) {
      // Only use the retry error if it's not about section_visibility
      toolError = retryResult.error;
    } else if (!retryResult.error) {
      tool = retryResult.data;
      toolError = null;
    }
  }

  if (toolError || !tool) {
    notFound();
  }

  // Fetch sentiment data
  let sentimentRuns = null;
  let sentimentAggregate = null;
  try {
    sentimentRuns = await getLatestSentimentRuns(tool.id);
    sentimentAggregate = await getLatestSentimentAggregate(tool.id);
  } catch (error) {
    console.error("Error loading sentiment data", error);
  }

  // Fetch Similarweb data
  let similarwebReport = null;
  let similarwebMonthlyData: any[] = [];
  try {
    // Try fetching from similarweb_reports table first
    const { data: reports, error: reportsError } = await supabase
      .from('similarweb_reports')
      .select('*')
      .eq('tool_id', tool.id)
      .order('created_at', { ascending: false });

    if (!reportsError && reports && reports.length > 0) {
      // Prioritize report with metrics (pages_per_visit, bounce_rate, etc.)
      // This ensures Excel reports (with metrics) are shown over PDF-only reports (with only ranks)
      const reportWithMetrics = reports.find(r => 
        r.pages_per_visit || r.bounce_rate || r.visit_duration_seconds || r.monthly_visits
      );
      
      // If no report with metrics, prioritize report with ranks
      const reportWithRanks = reports.find(r => r.global_rank || r.industry_rank || r.country_rank);
      
      // Use report with metrics first, then ranks, then most recent
      similarwebReport = reportWithMetrics || reportWithRanks || reports[0];

      // Fetch monthly data - try from the selected report first
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('similarweb_monthly_data')
        .select('*')
        .eq('report_id', similarwebReport.id)
        .order('month', { ascending: true });

      if (!monthlyError && monthlyData && monthlyData.length > 0) {
        similarwebMonthlyData = monthlyData;
      } else {
        // If no monthly data in selected report, try other reports
        for (const report of reports) {
          const { data: monthly, error: monthlyErr } = await supabase
            .from('similarweb_monthly_data')
            .select('*')
            .eq('report_id', report.id)
            .order('month', { ascending: true });
          
          if (!monthlyErr && monthly && monthly.length > 0) {
            similarwebMonthlyData = monthly;
            break;
          }
        }
      }
      
      // Merge ranks from other reports if current report doesn't have them
      if (similarwebReport && (!similarwebReport.global_rank || !similarwebReport.country_rank || !similarwebReport.industry_rank)) {
        for (const report of reports) {
          if (report.id !== similarwebReport.id) {
            // Merge missing ranks
            if (!similarwebReport.global_rank && report.global_rank) {
              similarwebReport.global_rank = report.global_rank;
            }
            if (!similarwebReport.country_rank && report.country_rank) {
              similarwebReport.country_rank = report.country_rank;
            }
            if (!similarwebReport.industry_rank && report.industry_rank) {
              similarwebReport.industry_rank = report.industry_rank;
            }
            if (!similarwebReport.industry && report.industry) {
              similarwebReport.industry = report.industry;
            }
            // Stop if all ranks are filled
            if (similarwebReport.global_rank && similarwebReport.country_rank && similarwebReport.industry_rank) {
              break;
            }
          }
        }
      }
    }
    
    // Fallback: Check domain_data JSON for monthly data (if tables don't exist)
    if (similarwebMonthlyData.length === 0 && tool.domain_data) {
      const domainData = tool.domain_data as any;
      if (domainData.similarweb_monthly_data && Array.isArray(domainData.similarweb_monthly_data)) {
        similarwebMonthlyData = domainData.similarweb_monthly_data;
      }
      
      // Also create a report-like object from summary data
      if (domainData.similarweb_summary && !similarwebReport) {
        similarwebReport = {
          ...domainData.similarweb_summary,
          monthly_visits: domainData.similarweb_summary.monthly_visits || 
            (similarwebMonthlyData.length > 0 ? similarwebMonthlyData[similarwebMonthlyData.length - 1]?.visits : null),
        };
      }
    }
  } catch (error) {
    console.error("Error loading Similarweb data", error);
    
    // Fallback: Check domain_data JSON
    if (tool.domain_data) {
      const domainData = tool.domain_data as any;
      if (domainData.similarweb_monthly_data && Array.isArray(domainData.similarweb_monthly_data)) {
        similarwebMonthlyData = domainData.similarweb_monthly_data;
      }
      if (domainData.similarweb_summary) {
        similarwebReport = {
          ...domainData.similarweb_summary,
          monthly_visits: domainData.similarweb_summary.monthly_visits || 
            (similarwebMonthlyData.length > 0 ? similarwebMonthlyData[similarwebMonthlyData.length - 1]?.visits : null),
        };
      }
    }
  }

  // Fetch features - order by display_order, fallback to feature_name
  const { data: features } = await supabase
    .from("tool_features")
    .select("*")
    .eq("tool_id", tool.id)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("feature_name", { ascending: true });

  const featureList = (features || []) as Array<{
    id: string;
    feature_name: string;
    status: string;
    notes: string | null;
  }>;

  // Fetch alternatives (tools in same category) and determine if this tool is #1
  let alternatives: any[] = [];
  let isTopInCategory = false;
  if (tool.category) {
    // Fetch ALL tools in the category (including current tool) to determine ranking
    const { data: allCategoryTools } = await supabase
      .from("tools")
      .select("id, name, slug, category, short_description, logo_url, overall_score, pinpoint_score, company_name")
      .eq("category", tool.category);
    
    if (allCategoryTools && allCategoryTools.length > 0) {
      // Fetch sentiment aggregates for enrichment
      const toolIds = allCategoryTools.map((t: any) => t.id);
      let sentimentMap = new Map<string, number>();
      
      const { data: aggregates } = await supabase
        .from("sentiment_aggregate")
        .select("tool_id, final_score_0_to_10")
        .in("tool_id", toolIds)
        .order("run_at", { ascending: false });

      if (aggregates) {
        const seen = new Set<string>();
        aggregates.forEach((agg: any) => {
          if (!seen.has(agg.tool_id) && agg.final_score_0_to_10 !== null) {
            sentimentMap.set(agg.tool_id, agg.final_score_0_to_10);
            seen.add(agg.tool_id);
          }
        });
      }

      // Enrich and sort tools
      const enrichedTools = allCategoryTools.map((t: any) => ({
        ...t,
        pinpoint_score: t.pinpoint_score ?? t.overall_score ?? sentimentMap.get(t.id) ?? null,
      }));

      enrichedTools.sort((a: any, b: any) => {
        const scoreA = a.pinpoint_score ?? a.overall_score ?? 0;
        const scoreB = b.pinpoint_score ?? b.overall_score ?? 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return (a.name || '').localeCompare(b.name || '');
      });

      // Check if current tool is #1
      if (enrichedTools.length > 0 && enrichedTools[0].id === tool.id) {
        const topScore = enrichedTools[0].pinpoint_score ?? enrichedTools[0].overall_score;
        if (topScore !== null && topScore !== undefined && topScore > 0) {
          isTopInCategory = true;
        }
      }

      // Get alternatives (exclude current tool)
      alternatives = enrichedTools.filter((t: any) => t.id !== tool.id).slice(0, 10);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Admin Navigation Bar */}
      <div className="bg-primary/10 border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/tools"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tools
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Admin Mode</span>
              <Link
                href={`/tool/${tool.slug}`}
                className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity text-sm"
                target="_blank"
              >
                View Public Page
                <ExternalLink className="w-4 h-4" />
              </Link>
              <AdminLogout />
            </div>
          </div>
        </div>
      </div>

      {/* Render ToolPage with admin mode */}
      <ToolPage
        tool={tool as any}
        features={featureList}
        sentimentRuns={sentimentRuns}
        sentimentAggregate={sentimentAggregate}
        alternatives={alternatives}
        similarwebReport={similarwebReport}
        similarwebMonthlyData={similarwebMonthlyData}
        isAdmin={true}
        isTopInCategory={isTopInCategory}
      />
    </div>
  );
}


async function deleteToolAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }
  const { error } = await supabase.from("tools").delete().eq("id", id);
  if (error) {
    console.error("deleteToolAction error", error);
  }
  revalidatePath("/admin/tools");
  redirect("/admin/tools");
}

async function updateSentimentAction(formData: FormData) {
  "use server";
  const runId = formData.get("run_id")?.toString();
  const toolId = formData.get("tool_id")?.toString();
  const source = formData.get("source")?.toString();
  
  if (!runId || !toolId || !source) {
    return;
  }

  const topPositives = formData.get("top_positives")?.toString().split("\n").filter(Boolean) || [];
  const topNegatives = formData.get("top_negatives")?.toString().split("\n").filter(Boolean) || [];
  const topFeatures = formData.get("top_features")?.toString().split("\n").filter(Boolean) || [];
  
  const overallScoreRaw = formData.get("overall_sentiment_0_to_10");
  const overallScore = overallScoreRaw ? Number(overallScoreRaw) : null;

  const { error } = await supabase
    .from("sentiment_runs")
    .update({
      overall_sentiment_0_to_10: overallScore,
      sentiment_label: formData.get("sentiment_label")?.toString() || null,
      summary: formData.get("summary")?.toString().trim() || null,
      top_positives: topPositives,
      top_negatives: topNegatives,
      top_features: topFeatures,
    })
    .eq("id", runId);

  if (error) {
    console.error("updateSentimentAction error", error);
  }

  // Recompute aggregate after updating sentiment
  const { data: tool } = await supabase
    .from("tools")
    .select("slug")
    .eq("id", toolId)
    .single();

  revalidatePath(`/admin/tool/${tool?.slug}/edit`);
  revalidatePath(`/tool/${tool?.slug}`);
}

