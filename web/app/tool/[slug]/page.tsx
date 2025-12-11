import { notFound } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import {
  getLatestSentimentAggregate,
  getLatestSentimentRuns,
} from "@/src/lib/sentiment/services/supabase";
import { ToolPage } from "@/src/components/ToolPage";

type Feature = {
  id: string;
  feature_name: string;
  promise_description: string | null;
  status: string;
  last_checked_at: string | null;
  notes: string | null;
  display_order?: number | null;
};

type Tool = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  category: string | null;
  logo_url: string | null;
  website_url: string | null;
  pricing_model: string | null;
  overall_score: number | null;
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
};

type AlternativeTool = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  logo_url: string | null;
  overall_score: number | null;
};

type ToolPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ToolPageServer({ params }: ToolPageProps) {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).trim();

  let tool: Tool | null = null;
  let toolError: any = null;

  // Try to fetch with all columns first
  const result = await supabase
    .from("tools")
    .select("id, name, slug, short_description, category, logo_url, website_url, pricing_model, overall_score, tool_overview, domain_data, domain_score, organic_etv, organic_keywords, domain_rank, referring_domains, backlinks_count, spam_score, company_name")
    .eq("slug", normalizedSlug)
    .maybeSingle<Tool>();

  tool = result.data;
  toolError = result.error;

  // Log the result for debugging
  if (toolError) {
    console.log("Initial query error:", {
      hasError: !!toolError,
      errorType: typeof toolError,
      errorKeys: toolError ? Object.keys(toolError) : [],
      errorString: JSON.stringify(toolError),
      message: toolError?.message,
      code: toolError?.code,
    });
  }

  // If some columns don't exist, retry with basic columns
  if (toolError && (toolError.message?.includes("tool_overview") || toolError.message?.includes("domain_data") || toolError.message?.includes("company_name") || toolError.code === "PGRST116")) {
    console.warn("Some columns not found, retrying with basic columns", {
      error: toolError,
      message: toolError.message,
      code: toolError.code,
    });
    const retryResult = await supabase
      .from("tools")
      .select("id, name, slug, short_description, category, logo_url, website_url, pricing_model, overall_score")
      .eq("slug", normalizedSlug)
      .maybeSingle<Partial<Tool>>();
    
    if (retryResult.error) {
      console.error("Error loading tool (retry)", {
        message: retryResult.error.message,
        details: retryResult.error.details,
        hint: retryResult.error.hint,
        code: retryResult.error.code,
        fullError: retryResult.error,
      });
      notFound();
    }
    
    tool = retryResult.data ? { 
      ...retryResult.data, 
      tool_overview: null,
      domain_data: null,
      domain_score: null,
      organic_etv: null,
      organic_keywords: null,
      domain_rank: null,
      referring_domains: null,
      backlinks_count: null,
      spam_score: null,
      company_name: null,
    } as Tool : null;
  } else if (toolError && (toolError.message || toolError.code)) {
    // Only log error if it has meaningful information
    console.error("Error loading tool", {
      message: toolError.message,
      details: toolError.details,
      hint: toolError.hint,
      code: toolError.code,
      fullError: toolError,
      slug: normalizedSlug,
    });
    // Only call notFound if we don't have tool data
    if (!tool) {
      notFound();
    }
  } else if (toolError) {
    // toolError exists but has no meaningful properties - log it anyway for debugging
    console.warn("Unexpected error format when loading tool", {
      toolError,
      toolErrorType: typeof toolError,
      toolErrorKeys: Object.keys(toolError || {}),
      slug: normalizedSlug,
      hasData: !!result.data,
      hasTool: !!tool,
    });
    // If we have data despite the error, continue; otherwise not found
    if (!tool) {
      notFound();
    }
  }

  if (!tool) {
    notFound();
  }

  const { data: features, error: featureError } = await supabase
    .from("tool_features")
    .select("*")
    .eq("tool_id", tool.id)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("feature_name", { ascending: true });

  if (featureError) {
    console.error("Error loading features", featureError);
  }

  const featureList = (features ?? []) as Feature[];

  // Fetch sentiment data
  let sentimentRuns = null;
  let sentimentAggregate = null;
  try {
    sentimentRuns = await getLatestSentimentRuns(tool.id);
    sentimentAggregate = await getLatestSentimentAggregate(tool.id);
  } catch (error) {
    console.error("Error loading sentiment data", error);
    // Continue without sentiment data if it fails
  }

  // Fetch alternative tools - find similar tools by category
  let alternatives: AlternativeTool[] = [];
  try {
    let alternativesQuery = supabase
      .from("tools")
      .select("id, name, slug, category, short_description, logo_url, overall_score")
      .neq("id", tool.id)
      .limit(10);

    // If tool has a category, prioritize same category
    if (tool.category) {
      alternativesQuery = alternativesQuery.eq("category", tool.category);
    }

    const { data: altData, error: altError } = await alternativesQuery;

    if (!altError && altData) {
      // Sort by score (tools with scores first, then tools without), then take top 3
      alternatives = altData
        .sort((a: any, b: any) => {
          // Prioritize tools with scores
          const aHasScore = a.overall_score !== null && a.overall_score !== undefined;
          const bHasScore = b.overall_score !== null && b.overall_score !== undefined;
          
          if (aHasScore && !bHasScore) return -1;
          if (!aHasScore && bHasScore) return 1;
          
          // If both have scores or both don't, sort by score value
          return (b.overall_score || 0) - (a.overall_score || 0);
        })
        .slice(0, 3) as AlternativeTool[];

      // If we don't have enough, fill with other tools
      if (alternatives.length < 3) {
        const { data: moreData } = await supabase
          .from("tools")
          .select("id, name, slug, category, short_description, logo_url, overall_score")
          .neq("id", tool.id)
          .order("overall_score", { ascending: false })
          .limit(10);

        const existingIds = new Set(alternatives.map((a) => a.id));
        const additional = (moreData || [])
          .filter((a: any) => !existingIds.has(a.id))
          .slice(0, 3 - alternatives.length) as AlternativeTool[];
        
        alternatives = [...alternatives, ...additional];
      }
    }
  } catch (error) {
    console.error("Error loading alternatives", error);
    // Continue without alternatives if it fails
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
        r.pages_per_visit || r.bounce_rate || r.visit_duration_seconds || r.monthly_visits || r.total_visits
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
      if (similarwebReport && (!similarwebReport.global_rank || !similarwebReport.industry_rank)) {
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
            if (similarwebReport.global_rank && similarwebReport.industry_rank) {
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

  return (
    <ToolPage
      tool={tool}
      features={featureList}
      sentimentRuns={sentimentRuns}
      sentimentAggregate={sentimentAggregate}
      alternatives={alternatives}
      similarwebReport={similarwebReport}
      similarwebMonthlyData={similarwebMonthlyData}
    />
  );
}
