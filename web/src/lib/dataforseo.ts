/**
 * DataForSEO API Client
 * Simplified integration using only Domain Rank Overview and Backlinks Summary APIs
 */

const DATAFORSEO_API_URL = "https://api.dataforseo.com/v3";

export interface DomainRankOverviewData {
  target: string;
  organic_etv: number; // Estimated Traffic Value
  organic_keywords: number; // Total keywords ranking
  position_distribution: {
    pos_1: number;
    pos_2_3: number;
    pos_4_10: number;
    pos_11_20: number;
    pos_21_30: number;
    pos_31_40: number;
    pos_41_50: number;
    pos_51_60: number;
    pos_61_70: number;
    pos_71_80: number;
    pos_81_90: number;
    pos_91_100: number;
  };
  keyword_movement: {
    is_new: number;
    is_up: number;
    is_down: number;
    is_lost: number;
  };
  estimated_paid_traffic_cost: number;
}

export interface BacklinksData {
  target: string;
  rank: number; // Domain rank (0-100)
  backlinks: number; // Total backlinks
  referring_domains: number; // Unique domains linking
  referring_main_domains: number;
  referring_ips: number;
  referring_subnets: number;
  backlinks_spam_score: number; // Lower is better (0-100)
  target_spam_score: number; // Lower is better (0-100)
  first_seen: string | null;
}

export interface HistoricalRankData {
  year: number;
  month: number;
  organic_etv: number;
  organic_keywords: number;
  position_distribution: {
    pos_1: number;
    pos_2_3: number;
    pos_4_10: number;
    pos_11_20: number;
    pos_21_30: number;
    pos_31_40: number;
    pos_41_50: number;
    pos_51_60: number;
    pos_61_70: number;
    pos_71_80: number;
    pos_81_90: number;
    pos_91_100: number;
  };
  keyword_movement: {
    is_new: number;
    is_up: number;
    is_down: number;
    is_lost: number;
  };
}

export interface ComprehensiveDomainData {
  domain_rank_overview: DomainRankOverviewData | null;
  backlinks: BacklinksData | null;
  historical_data: HistoricalRankData[] | null;
}

/**
 * Get DataForSEO API credentials from environment
 * Supports two formats:
 * 1. DATAFORSEO_API_KEY (base64 encoded username:password)
 * 2. DATAFORSEO_USERNAME + DATAFORSEO_PASSWORD (will be encoded automatically)
 */
function getCredentials(): string | null {
  // Option 1: Pre-encoded base64 key
  const apiKey = process.env.DATAFORSEO_API_KEY;
  if (apiKey) {
    return apiKey;
  }
  
  // Option 2: Username and password separately
  const username = process.env.DATAFORSEO_USERNAME;
  const password = process.env.DATAFORSEO_PASSWORD;
  
  if (username && password) {
    // Encode username:password to base64
    const credentials = `${username}:${password}`;
    const encoded = Buffer.from(credentials).toString('base64');
    return encoded;
  }
  
  console.warn("DataForSEO: No credentials found. Set either DATAFORSEO_API_KEY or DATAFORSEO_USERNAME + DATAFORSEO_PASSWORD");
  return null;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Remove 'www.' prefix if present
    return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
  } catch (error) {
    // If URL is invalid, assume it's already a domain
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

/**
 * Fetch Domain Rank Overview data
 */
export async function fetchDomainRankOverview(domainOrUrl: string): Promise<DomainRankOverviewData | null> {
  const apiKey = getCredentials();
  if (!apiKey) {
    console.warn("DataForSEO: API key not found");
    return null;
  }

  const domain = extractDomain(domainOrUrl);
  console.log(`DataForSEO: Fetching domain rank overview for domain: ${domain}`);

  try {
    const response = await fetch(`${DATAFORSEO_API_URL}/dataforseo_labs/google/domain_rank_overview/live`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        target: domain,
        location_code: 2840, // United States
        language_code: "en",
        limit: 100,
        ignore_synonyms: false,
      }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO: Domain Rank Overview API failed (${response.status}):`, errorText.substring(0, 500));
      return null;
    }

    const data: any = await response.json();
    
    // Check top-level status
    if (data.status_code !== 20000) {
      console.warn(`DataForSEO: Domain Rank Overview API error: ${data.status_message} (code: ${data.status_code})`);
      return null;
    }

    // Handle both result structure and tasks structure
    let resultData: any = null;
    let item: any = null;

    if (data.result && data.result.length > 0 && data.result[0].items && data.result[0].items.length > 0) {
      // Direct result structure
      resultData = data.result[0];
      item = resultData.items[0];
    } else if (data.tasks && data.tasks.length > 0) {
      // Tasks structure
      const task = data.tasks[0];
      if (task.status_code !== 20000) {
        console.warn(`DataForSEO: Domain Rank Overview API task error: ${task.status_message} (code: ${task.status_code})`);
        return null;
      }
      if (task.result && task.result.length > 0 && task.result[0].items && task.result[0].items.length > 0) {
        resultData = task.result[0];
        item = resultData.items[0];
      }
    }

    if (!resultData || !item) {
      console.warn(`DataForSEO: Domain Rank Overview API returned no result data`);
      console.warn(`DataForSEO: Full response structure:`, JSON.stringify(data, null, 2).substring(0, 2000));
      return null;
    }

    console.log(`DataForSEO: Domain Rank Overview - Found resultData with ${resultData.items?.length || 0} items`);
    console.log(`DataForSEO: Domain Rank Overview - Item structure:`, JSON.stringify({
      has_metrics: !!item.metrics,
      has_organic: !!item.metrics?.organic,
      etv: item.metrics?.organic?.etv,
      count: item.metrics?.organic?.count,
    }).substring(0, 500));
    const metrics = item.metrics?.organic || {};

    const result: DomainRankOverviewData = {
      target: resultData.target || item.target || domain,
      organic_etv: metrics.etv || 0,
      organic_keywords: metrics.count || 0,
      position_distribution: {
        pos_1: metrics.pos_1 || 0,
        pos_2_3: metrics.pos_2_3 || 0,
        pos_4_10: metrics.pos_4_10 || 0,
        pos_11_20: metrics.pos_11_20 || 0,
        pos_21_30: metrics.pos_21_30 || 0,
        pos_31_40: metrics.pos_31_40 || 0,
        pos_41_50: metrics.pos_41_50 || 0,
        pos_51_60: metrics.pos_51_60 || 0,
        pos_61_70: metrics.pos_61_70 || 0,
        pos_71_80: metrics.pos_71_80 || 0,
        pos_81_90: metrics.pos_81_90 || 0,
        pos_91_100: metrics.pos_91_100 || 0,
      },
      keyword_movement: {
        is_new: metrics.is_new || 0,
        is_up: metrics.is_up || 0,
        is_down: metrics.is_down || 0,
        is_lost: metrics.is_lost || 0,
      },
      estimated_paid_traffic_cost: metrics.estimated_paid_traffic_cost || 0,
    };

    console.log(`DataForSEO: Successfully retrieved domain rank overview for ${domain}:`, {
      organic_etv: result.organic_etv,
      organic_keywords: result.organic_keywords,
      top_3_keywords: result.position_distribution.pos_1 + result.position_distribution.pos_2_3,
    });

    return result;
  } catch (error) {
    console.error(`DataForSEO: Error fetching domain rank overview:`, error);
    return null;
  }
}

/**
 * Fetch Backlinks Summary data
 */
export async function fetchBacklinksSummary(domainOrUrl: string): Promise<BacklinksData | null> {
  const apiKey = getCredentials();
  if (!apiKey) {
    console.warn("DataForSEO: API key not found");
    return null;
  }

  const domain = extractDomain(domainOrUrl);
  console.log(`DataForSEO: Fetching backlinks summary for domain: ${domain}`);

  try {
    const response = await fetch(`${DATAFORSEO_API_URL}/backlinks/summary/live`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        target: domain,
        backlinks_status_type: "live",
        internal_list_limit: 10,
        include_subdomains: true,
        exclude_internal_backlinks: true,
        include_indirect_links: true,
        rank_scale: "one_hundred",
      }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO: Backlinks Summary API failed (${response.status}):`, errorText.substring(0, 500));
      
      // Check for payment required error
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.status_code === 40200 || errorJson.tasks?.[0]?.status_code === 40200) {
          console.warn(`DataForSEO: Backlinks API requires separate subscription (Payment Required)`);
        }
      } catch {
        // Not JSON, that's fine
      }
      
      return null;
    }

    const data: any = await response.json();
    
    // Check top-level status
    if (data.status_code !== 20000) {
      console.warn(`DataForSEO: Backlinks Summary API top-level error: ${data.status_message} (code: ${data.status_code})`);
      return null;
    }

    // Backlinks API can return data directly in result array or in tasks array
    let result: any = null;
    
    if (data.result && data.result.length > 0) {
      // Direct result structure
      result = data.result[0];
    } else if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      // Tasks structure (less common for this API)
      const task = data.tasks[0];
      if (task.status_code !== 20000) {
        if (task.status_code === 40200) {
          console.warn(`DataForSEO: Backlinks API requires separate subscription (Payment Required)`);
        } else {
          console.warn(`DataForSEO: Backlinks API task error: ${task.status_message} (code: ${task.status_code})`);
        }
        return null;
      }
      result = task.result[0];
    } else {
      console.warn(`DataForSEO: Backlinks Summary API returned no result data`);
      return null;
    }

    const backlinksData: BacklinksData = {
      target: result.target || domain,
      rank: result.rank || 0,
      backlinks: result.backlinks || 0,
      referring_domains: result.referring_domains || 0,
      referring_main_domains: result.referring_main_domains || 0,
      referring_ips: result.referring_ips || 0,
      referring_subnets: result.referring_subnets || 0,
      backlinks_spam_score: result.backlinks_spam_score || null,
      target_spam_score: result.target_spam_score || null,
      first_seen: result.first_seen || null,
    };

    console.log(`DataForSEO: Successfully retrieved backlinks summary for ${domain}:`, {
      rank: backlinksData.rank,
      backlinks: backlinksData.backlinks,
      referring_domains: backlinksData.referring_domains,
      spam_score: backlinksData.target_spam_score,
    });

    return backlinksData;
  } catch (error) {
    console.error(`DataForSEO: Error fetching backlinks summary:`, error);
    return null;
  }
}

/**
 * Fetch Historical Rank Overview data
 */
export async function fetchHistoricalRankOverview(domainOrUrl: string): Promise<HistoricalRankData[] | null> {
  const apiKey = getCredentials();
  if (!apiKey) {
    console.warn("DataForSEO: API key not found");
    return null;
  }

  const domain = extractDomain(domainOrUrl);
  console.log(`DataForSEO: Fetching historical rank overview for domain: ${domain}`);

  try {
    const response = await fetch(`${DATAFORSEO_API_URL}/dataforseo_labs/google/historical_rank_overview/live`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        target: domain,
        location_code: 2840, // United States
        language_code: "en",
        correlate: true,
        ignore_synonyms: false,
        include_clickstream_data: false,
      }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO: Historical Rank Overview API failed (${response.status}):`, errorText.substring(0, 500));
      return null;
    }

    const data: any = await response.json();
    
    // Check top-level status
    if (data.status_code !== 20000) {
      console.warn(`DataForSEO: Historical Rank Overview API error: ${data.status_message} (code: ${data.status_code})`);
      return null;
    }

    // Handle both result structure and tasks structure
    let items: any[] = [];

    if (data.result && data.result.length > 0 && data.result[0].items && data.result[0].items.length > 0) {
      // Direct result structure
      items = data.result[0].items;
    } else if (data.tasks && data.tasks.length > 0) {
      // Tasks structure
      const task = data.tasks[0];
      if (task.status_code !== 20000) {
        console.warn(`DataForSEO: Historical Rank Overview API task error: ${task.status_message} (code: ${task.status_code})`);
        return null;
      }
      if (task.result && task.result.length > 0 && task.result[0].items && task.result[0].items.length > 0) {
        items = task.result[0].items;
      }
    }

    if (items.length === 0) {
      console.warn(`DataForSEO: Historical Rank Overview API returned no result data`);
      console.warn(`DataForSEO: Full response structure:`, JSON.stringify(data, null, 2).substring(0, 2000));
      return null;
    }

    console.log(`DataForSEO: Historical Rank Overview - Found ${items.length} historical data points`);
    
    // Transform historical data
    const historicalData: HistoricalRankData[] = items.map((item: any) => {
      const metrics = item.metrics?.organic || {};
      return {
        year: item.year || new Date().getFullYear(),
        month: item.month || new Date().getMonth() + 1,
        organic_etv: metrics.etv || 0,
        organic_keywords: metrics.count || 0,
        position_distribution: {
          pos_1: metrics.pos_1 || 0,
          pos_2_3: metrics.pos_2_3 || 0,
          pos_4_10: metrics.pos_4_10 || 0,
          pos_11_20: metrics.pos_11_20 || 0,
          pos_21_30: metrics.pos_21_30 || 0,
          pos_31_40: metrics.pos_31_40 || 0,
          pos_41_50: metrics.pos_41_50 || 0,
          pos_51_60: metrics.pos_51_60 || 0,
          pos_61_70: metrics.pos_61_70 || 0,
          pos_71_80: metrics.pos_71_80 || 0,
          pos_81_90: metrics.pos_81_90 || 0,
          pos_91_100: metrics.pos_91_100 || 0,
        },
        keyword_movement: {
          is_new: metrics.is_new || 0,
          is_up: metrics.is_up || 0,
          is_down: metrics.is_down || 0,
          is_lost: metrics.is_lost || 0,
        },
      };
    }).sort((a: HistoricalRankData, b: HistoricalRankData) => {
      // Sort by year and month (oldest first)
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    console.log(`DataForSEO: Successfully retrieved ${historicalData.length} months of historical data for ${domain}`);
    
    return historicalData;
  } catch (error) {
    console.error(`DataForSEO: Error fetching historical rank overview:`, error);
    return null;
  }
}

/**
 * Fetch comprehensive domain data from all APIs
 */
export async function fetchComprehensiveDomainData(domainOrUrl: string): Promise<ComprehensiveDomainData> {
  console.log(`DataForSEO: Fetching comprehensive domain data for: ${domainOrUrl}`);
  
  const [domainRankOverview, backlinks, historicalData] = await Promise.all([
    fetchDomainRankOverview(domainOrUrl),
    fetchBacklinksSummary(domainOrUrl),
    fetchHistoricalRankOverview(domainOrUrl),
  ]);

  return {
    domain_rank_overview: domainRankOverview,
    backlinks: backlinks,
    historical_data: historicalData,
  };
}

