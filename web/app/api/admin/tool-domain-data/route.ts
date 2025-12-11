import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const toolId = searchParams.get("toolId");

  if (!toolId) {
    return NextResponse.json(
      { error: "toolId is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(
        "domain_data, domain_score, organic_etv, organic_keywords, domain_rank, referring_domains, backlinks_count, spam_score"
      )
      .eq("id", toolId)
      .single();

    if (error) {
      console.error("Error fetching domain data:", error);
      return NextResponse.json(
        { error: "Failed to fetch domain data" },
        { status: 500 }
      );
    }

    // If domain_data is null but we have individual fields, construct it
    let domainData = data.domain_data;
    if (!domainData && (data.organic_etv !== null || data.domain_rank !== null)) {
      domainData = {
        domain_rank_overview: data.organic_etv !== null || data.organic_keywords !== null ? {
          organic_etv: data.organic_etv,
          organic_keywords: data.organic_keywords,
        } : null,
        backlinks: data.domain_rank !== null || data.referring_domains !== null ? {
          rank: data.domain_rank,
          referring_domains: data.referring_domains,
          backlinks: data.backlinks_count,
          target_spam_score: data.spam_score,
        } : null,
      };
    }

    return NextResponse.json({
      domainData: {
        domain_data: domainData,
        domain_score: data.domain_score,
        organic_etv: data.organic_etv,
        organic_keywords: data.organic_keywords,
        domain_rank: data.domain_rank,
        referring_domains: data.referring_domains,
        backlinks_count: data.backlinks_count,
        spam_score: data.spam_score,
      },
    });
  } catch (error) {
    console.error("Error in tool-domain-data route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


