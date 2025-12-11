import { supabase } from "@/src/lib/supabaseClient";
import OpenAI from "openai";

export type EnrichmentSummary = {
  toolId: string;
  slug: string;
  steps: Array<{
    name: string;
    status: "skipped" | "ok" | "failed";
    detail?: string;
  }>;
  data: {
    website_url?: string | null;
    logo_url?: string | null;
    short_description?: string | null;
    category?: string | null;
    pricing_model?: string | null;
    tool_overview?: string | null;
  };
};

type SearchResult = {
  url: string;
  title: string;
  summary?: string;
  score?: number;
};

type FeatureExtraction = {
  capabilitiesSummary: string;
  features: Array<{ name: string; description: string }>;
  pricingNotes?: string;
  useCases?: string[];
  pros?: string[];
  cons?: string[];
};

const FEATURE_LINK_KEYWORDS = [
  "feature",
  "features",
  "product",
  "products",
  "platform",
];

export async function enrichToolByName(toolName: string, companyName?: string | null, providedWebsiteUrl?: string | null, providedCategory?: string | null): Promise<EnrichmentSummary> {
  const steps: EnrichmentSummary["steps"] = [];
  const slug = slugify(toolName);

  const toolId = await ensureToolRow(toolName, slug, steps);
  
  // Save company_name if provided
  if (companyName && companyName.trim()) {
    try {
      const { error: updateError } = await supabase
        .from("tools")
        .update({ company_name: companyName.trim() })
        .eq("id", toolId);
      
      if (updateError) {
        console.error("Failed to update company_name:", updateError);
        steps.push({
          name: "company_name",
          status: "failed",
          detail: `Failed to set company name: ${updateError.message || String(updateError)}`,
        });
      } else {
        steps.push({
          name: "company_name",
          status: "ok",
          detail: `Set company name: ${companyName.trim()}`,
        });
      }
    } catch (err) {
      console.error("Exception while updating company_name:", err);
      steps.push({
        name: "company_name",
        status: "failed",
        detail: `Failed to set company name: ${String(err)}`,
      });
    }
  }

  let websiteUrl = null as string | null;
  let logoUrl = null as string | null;
  let homepageHtml = "";
  let descriptionText = "";
  let toolOverview = "";
  let category: string | null = (providedCategory && providedCategory.trim()) ? providedCategory.trim() : null;
  let pricingModel: string | null = null;

  // 2. Discover website and get Tavily content
  let tavilyContent = "";
  
  // If website URL is provided manually, use it; otherwise try to discover it
  if (providedWebsiteUrl && providedWebsiteUrl.trim()) {
    try {
      // Validate and normalize the URL
      let normalizedUrl = providedWebsiteUrl.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      // Validate URL format
      new URL(normalizedUrl); // This will throw if invalid
      
      websiteUrl = normalizedUrl;
      await supabase.from("tools").update({ website_url: websiteUrl }).eq("id", toolId);
      
      // Try to get Tavily content for the provided URL
      try {
        const tavilyResult = await searchWebForOfficialSite(toolName);
        if (tavilyResult && tavilyResult.url === websiteUrl) {
          tavilyContent = tavilyResult.content;
        }
      } catch {
        // Tavily lookup failed, but we have the URL so continue
      }
      
      steps.push({
        name: "website_discovery",
        status: "ok",
        detail: `Manually set: ${websiteUrl}${tavilyContent ? " (with Tavily content)" : ""}`,
      });
    } catch (err) {
      steps.push({
        name: "website_discovery",
        status: "failed",
        detail: `Invalid URL provided: ${String(err)}`,
      });
    }
  } else {
    // Auto-discover website
    try {
      const tavilyResult = await searchWebForOfficialSite(toolName);
      if (tavilyResult) {
        websiteUrl = tavilyResult.url;
        tavilyContent = tavilyResult.content;
        await supabase.from("tools").update({ website_url: websiteUrl }).eq("id", toolId);
        steps.push({
          name: "website_discovery",
          status: "ok",
          detail: `Auto-discovered: ${websiteUrl}${tavilyContent ? " (with Tavily content)" : ""}`,
        });
      } else {
        steps.push({
          name: "website_discovery",
          status: "failed",
          detail: "No plausible site returned by search API",
        });
      }
    } catch (err) {
      steps.push({
        name: "website_discovery",
        status: "failed",
        detail: `Search lookup failed: ${String(err)}`,
      });
    }
  }

  // 3. Logo fetching
  if (websiteUrl) {
    try {
      const domain = new URL(websiteUrl).hostname;
      
      // Try multiple logo sources in order of preference
      let logoFound = false;
      
      // Method 1: Try Logo.dev API (more reliable than Clearbit)
      try {
        const logoDevUrl = await getLogoFromLogoDev(domain);
        if (logoDevUrl) {
          logoUrl = logoDevUrl;
          logoFound = true;
        }
      } catch (err) {
        // Continue to next method
      }
      
      // Method 2: Try Clearbit (if Logo.dev didn't work)
      if (!logoFound) {
        const clearbitLogo = await getLogoUrlFromDomain(domain);
        if (clearbitLogo) {
          logoUrl = clearbitLogo;
          logoFound = true;
        }
      }
      
      // Method 3: Try LogoKit API (alternative service)
      if (!logoFound) {
        try {
          const logoKitUrl = await getLogoFromLogoKit(domain);
          if (logoKitUrl) {
            logoUrl = logoKitUrl;
            logoFound = true;
          }
        } catch (err) {
          // Continue to next method
        }
      }
      
      // Method 4: Try common paths on the website
      if (!logoFound) {
        const guessedLogos = buildLogoGuesses(domain);
        for (const guess of guessedLogos) {
          if (guess && await verifyLogoExists(guess)) {
            logoUrl = guess;
            logoFound = true;
            break;
          }
        }
      }
      
      // Method 5: Try to extract logo from HTML meta tags or page content
      if (!logoFound) {
        try {
          const html = await fetchHtml(websiteUrl).catch(() => "");
          if (html) {
            const extractedLogo = extractLogoFromHtml(html, websiteUrl);
            if (extractedLogo && await verifyLogoExists(extractedLogo)) {
              logoUrl = extractedLogo;
              logoFound = true;
            }
          }
        } catch (err) {
          // Continue - HTML extraction failed, but we already tried other methods
        }
      }
      
      if (logoUrl && logoFound) {
        await supabase.from("tools").update({ logo_url: logoUrl }).eq("id", toolId);
        steps.push({
          name: "logo_fetch",
          status: "ok",
          detail: `Logo URL ${logoUrl}`,
        });
      } else {
        steps.push({
          name: "logo_fetch",
          status: "failed",
          detail: "No logo found from any source. You can manually set it in the admin edit page.",
        });
      }
    } catch (err) {
      steps.push({
        name: "logo_fetch",
        status: "failed",
        detail: `Logo lookup failed: ${String(err)}`,
      });
    }
  } else {
    steps.push({
      name: "logo_fetch",
      status: "skipped",
      detail: "Website URL missing",
    });
  }

  // 4. Description extraction - use Tavily content as primary source
  if (websiteUrl) {
    try {
      let textForAi = "";
      let usedTavily = false;
      
      // Use Tavily content first (it's already scraped and more reliable)
      if (tavilyContent && tavilyContent.trim().length > 50) {
        textForAi = tavilyContent.slice(0, 2000); // Use more content from Tavily
        usedTavily = true;
      } else {
        // Fallback: try to fetch HTML directly if Tavily content is insufficient
        try {
          homepageHtml = await fetchHtml(websiteUrl);
          const rawDescription = extractDescriptionFromHtml(homepageHtml);
          const heroText = extractHeroText(homepageHtml);
          const visibleText = extractVisibleText(homepageHtml);
          
          // Use meta description first, then hero text, then first 1000 chars of visible text
          textForAi = rawDescription || heroText || visibleText.slice(0, 1000);
        } catch (fetchErr) {
          // If fetch fails, try cached Tavily result
          const tavilyCache = tavilyResultsCache.get(toolName);
          if (tavilyCache?.content && tavilyCache.content.trim().length > 50) {
            textForAi = tavilyCache.content.slice(0, 2000);
            usedTavily = true;
          } else {
            throw fetchErr;
          }
        }
      }
      
      if (textForAi && textForAi.trim().length > 50) {
        descriptionText = await summarizeDescription(toolName, textForAi);
        await supabase
          .from("tools")
          .update({ short_description: descriptionText })
          .eq("id", toolId);
        steps.push({
          name: "description_summary",
          status: "ok",
          detail: `${usedTavily ? "Using Tavily content. " : ""}Generated: ${descriptionText.slice(0, 60)}...`,
        });
      } else {
        steps.push({
          name: "description_summary",
          status: "failed",
          detail: "No descriptive text found",
        });
      }
    } catch (err) {
      steps.push({
        name: "description_summary",
        status: "failed",
        detail: `Description extraction failed: ${String(err)}`,
      });
    }
  } else {
    steps.push({
      name: "description_summary",
      status: "skipped",
      detail: "Website URL missing",
    });
  }

  // 5. Features + capabilities - use Tavily content as primary source
  if (websiteUrl) {
    try {
      let combinedText = "";
      
      // Start with Tavily content (primary source)
      if (tavilyContent && tavilyContent.trim().length > 100) {
        combinedText = tavilyContent.slice(0, 6000); // Use Tavily content
      }
      
      // Try to get HTML for feature links if we need more content
      if (!homepageHtml && websiteUrl) {
        try {
          homepageHtml = await fetchHtml(websiteUrl);
        } catch {
          // If fetch fails, continue with just Tavily content
        }
      }
      
      // If we have HTML, try to get feature pages for additional content
      if (homepageHtml) {
        const featureLinks = extractFeatureLinks(homepageHtml, websiteUrl);
        if (featureLinks.length > 0) {
          const featurePages = await Promise.all(
            featureLinks.slice(0, 3).map(async (url) => { // Limit to 3 feature pages
              const html = await safeFetchText(url);
              return html ? extractVisibleText(html) : "";
            })
          );
          const featureText = featurePages.filter(Boolean).join("\n");
          if (featureText) {
            combinedText = [combinedText, featureText].filter(Boolean).join("\n");
          }
        }
        
        // Also add visible text from homepage if we have it
        const homepageText = extractVisibleText(homepageHtml);
        if (homepageText && !combinedText.includes(homepageText.slice(0, 200))) {
          combinedText = [combinedText, homepageText].filter(Boolean).join("\n");
        }
      }
      
      // Limit total text to avoid token limits
      combinedText = combinedText.slice(0, 8000);
      
      if (combinedText && combinedText.trim().length > 100) {
        const aiFeatures = await extractFeaturesAndCapabilities(combinedText);
        toolOverview = aiFeatures.capabilitiesSummary;
        
        if (toolOverview) {
          await supabase
            .from("tools")
            .update({ tool_overview: toolOverview })
            .eq("id", toolId);
        }

        if (aiFeatures.features.length > 0) {
          const rows = aiFeatures.features.map((feature) => ({
            tool_id: toolId,
            feature_name: feature.name,
            promise_description: feature.description || "",
            status: "works",
          }));
          const { error: insertError } = await supabase.from("tool_features").insert(rows);
          if (insertError) {
            console.warn("Failed to insert features:", insertError);
          }
        }

        steps.push({
          name: "feature_capabilities",
          status: "ok",
          detail: `Captured ${aiFeatures.features.length} features, ${toolOverview ? "capabilities saved" : "no capabilities"}`,
        });
      } else {
        steps.push({
          name: "feature_capabilities",
          status: "failed",
          detail: `No crawlable text found (got ${combinedText?.length || 0} chars)`,
        });
      }
    } catch (err) {
      steps.push({
        name: "feature_capabilities",
        status: "failed",
        detail: `Feature extraction failed: ${String(err)}`,
      });
    }
  } else {
    steps.push({
      name: "feature_capabilities",
      status: "skipped",
      detail: "Website URL missing",
    });
  }

  // 6. Category classification
  try {
    // If category is provided manually, use it; otherwise try AI classification
    if (category && category.trim()) {
      await supabase.from("tools").update({ category: category.trim() }).eq("id", toolId);
      steps.push({
        name: "category_classification",
        status: "ok",
        detail: `Manually set: ${category.trim()}`,
      });
    } else {
      // Only classify if we have some text to work with
      const hasDescription = descriptionText && descriptionText.trim().length > 0;
      const hasCapabilities = toolOverview && toolOverview.trim().length > 0;
      
      if (hasDescription || hasCapabilities) {
        category = await classifyCategory(descriptionText || "", toolOverview || "");
        if (category && category !== "Other") {
          await supabase.from("tools").update({ category }).eq("id", toolId);
          steps.push({
            name: "category_classification",
            status: "ok",
            detail: `AI classified: ${category}`,
          });
        } else {
          steps.push({
            name: "category_classification",
            status: "failed",
            detail: `AI classification returned: ${category || "empty result"}`,
          });
        }
      } else {
        steps.push({
          name: "category_classification",
          status: "failed",
          detail: "No description or capabilities text available for classification",
        });
      }
    }
  } catch (err) {
    steps.push({
      name: "category_classification",
      status: "failed",
      detail: `Category classification failed: ${String(err)}`,
    });
  }

  // 7. Pricing model detection - comprehensive search
  if (websiteUrl) {
    try {
      let pricingText = "";
      const pricingSources: string[] = [];
      
      // 1. Start with Tavily content (look for pricing keywords)
      if (tavilyContent) {
        const pricingKeywords = ["pricing", "plan", "subscription", "cost", "price", "free", "tier", "monthly", "annual", "billing", "payment"];
        const lines = tavilyContent.split("\n");
        const pricingLines = lines.filter(line => 
          pricingKeywords.some(keyword => line.toLowerCase().includes(keyword))
        );
        if (pricingLines.length > 0) {
          pricingText = pricingLines.join("\n").slice(0, 2000);
          pricingSources.push("Tavily content");
        } else {
          // If no pricing keywords found, use all Tavily content
          pricingText = tavilyContent.slice(0, 2000);
          pricingSources.push("Tavily content (full)");
        }
      }
      
      // 2. Try to get HTML for more detailed pricing info
      if (!homepageHtml && websiteUrl) {
        try {
          homepageHtml = await fetchHtml(websiteUrl);
        } catch {
          // Continue with just Tavily content
        }
      }
      
      // 3. Search for pricing page using multiple methods
      if (homepageHtml) {
        // Method 1: Find pricing link from homepage
        const pricingUrl = resolvePricingUrl(homepageHtml, websiteUrl);
        if (pricingUrl && pricingUrl !== websiteUrl) {
          try {
            const pricingHtml = await fetchHtml(pricingUrl);
            const pricingPageText = extractVisibleText(pricingHtml);
            if (pricingPageText && pricingPageText.length > 100) {
              pricingText = [pricingText, pricingPageText].filter(Boolean).join("\n\n");
              pricingSources.push(`Pricing page: ${pricingUrl}`);
            }
          } catch (err) {
            console.warn(`Failed to fetch pricing page ${pricingUrl}:`, err);
          }
        }
        
        // Method 2: Try common pricing URL patterns
        const baseUrl = new URL(websiteUrl);
        const commonPricingPaths = [
          "/pricing",
          "/plans",
          "/prices",
          "/subscription",
          "/billing",
          "/pricing-plans",
          "/choose-plan",
          "/pricing-tiers"
        ];
        
        for (const path of commonPricingPaths) {
          try {
            const testUrl = new URL(path, baseUrl).toString();
            if (testUrl !== websiteUrl && testUrl !== pricingUrl) {
              const testHtml = await fetchHtml(testUrl);
              const testText = extractVisibleText(testHtml);
              if (testText && testText.length > 100 && !pricingText.includes(testText.slice(0, 100))) {
                pricingText = [pricingText, testText].filter(Boolean).join("\n\n");
                pricingSources.push(`Found: ${testUrl}`);
                break; // Found one, stop trying others
              }
            }
          } catch {
            // Continue to next path
          }
        }
        
        // Method 3: Extract pricing sections from homepage (multiple patterns)
        const pricingSectionPatterns = [
          /<section[^>]*(?:pricing|plan|subscription)[^>]*>([\s\S]*?)<\/section>/i,
          /<div[^>]*(?:pricing|plan|subscription)[^>]*>([\s\S]*?)<\/div>/i,
          /<article[^>]*(?:pricing|plan|subscription)[^>]*>([\s\S]*?)<\/article>/i,
        ];
        
        for (const pattern of pricingSectionPatterns) {
          const match = homepageHtml.match(pattern);
          if (match) {
            const sectionText = extractVisibleText(match[1]);
            if (sectionText && sectionText.length > 50 && !pricingText.includes(sectionText.slice(0, 100))) {
              pricingText = [pricingText, sectionText].filter(Boolean).join("\n\n");
              pricingSources.push("Homepage pricing section");
              break; // Found one section, stop
            }
          }
        }
      }
      
      // 4. Use Tavily to search specifically for pricing pages (always try this for better coverage)
      if (websiteUrl) {
        try {
          const tavilyPricingResult = await searchWebForPricing(toolName, websiteUrl);
          if (tavilyPricingResult && tavilyPricingResult.length > 100) {
            // Check if this adds new information
            const isNewContent = !pricingText.includes(tavilyPricingResult.slice(0, 200));
            if (isNewContent) {
              pricingText = [pricingText, tavilyPricingResult].filter(Boolean).join("\n\n");
              pricingSources.push("Tavily pricing search");
            }
          }
        } catch (err) {
          console.warn("Tavily pricing search failed:", err);
        }
      }
      
      // 5. Try to extract pricing tables and structured data more aggressively
      if (homepageHtml) {
        // Look for table structures with pricing data
        const pricingTablePatterns = [
          /<table[^>]*>[\s\S]*?(?:pricing|plan|tier|price|cost)[\s\S]*?<\/table>/gi,
          /<div[^>]*class=["'][^"']*(?:pricing|plan|tier)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
        ];
        
        for (const pattern of pricingTablePatterns) {
          const matches = Array.from(homepageHtml.matchAll(pattern));
          for (const match of matches) {
            const tableText = extractVisibleText(match[0] || match[1] || "");
            if (tableText && tableText.length > 100 && !pricingText.includes(tableText.slice(0, 100))) {
              pricingText = [pricingText, tableText].filter(Boolean).join("\n\n");
              pricingSources.push("Pricing table/structure");
              break;
            }
          }
        }
      }
      
      // Limit to 8000 chars for better context (pricing pages can be long)
      pricingText = pricingText.slice(0, 8000);
      
      if (pricingText.trim().length > 50) {
        // Extract detailed pricing information
        const pricingDetails = await extractDetailedPricing(toolName, pricingText);
        
        // Detect pricing model
        pricingModel = await detectPricingModel(pricingText);
        
        // Update database with pricing model
        if (pricingModel && pricingModel !== "Unknown") {
          await supabase.from("tools").update({ pricing_model: pricingModel }).eq("id", toolId);
          
          // Update tool_overview with pricing details if available
          if (pricingDetails && pricingDetails.length > 0) {
            const currentOverview = toolOverview || "";
            const pricingSection = `\n\nPricing Details:\n${pricingDetails}`;
            const updatedOverview = (currentOverview + pricingSection).slice(0, 5000); // Limit total length
            await supabase.from("tools").update({ tool_overview: updatedOverview }).eq("id", toolId);
            toolOverview = updatedOverview;
          }
          
          steps.push({
            name: "pricing_detection",
            status: "ok",
            detail: `${pricingModel}${pricingDetails ? ` - ${pricingDetails.split('\n')[0]}` : ''} (sources: ${pricingSources.join(', ')})`,
          });
        } else {
          steps.push({
            name: "pricing_detection",
            status: "failed",
            detail: `Pricing model not detected or returned Unknown. Found text: ${pricingText.slice(0, 200)}...`,
          });
        }
      } else {
        steps.push({
          name: "pricing_detection",
          status: "failed",
          detail: `No pricing text found. Sources checked: ${pricingSources.length > 0 ? pricingSources.join(', ') : 'none'}`,
        });
      }
    } catch (err) {
      steps.push({
        name: "pricing_detection",
        status: "failed",
        detail: `Pricing detection failed: ${String(err)}`,
      });
    }
  } else {
    steps.push({
      name: "pricing_detection",
      status: "skipped",
      detail: "Website URL missing",
    });
  }

  // 8. Domain Data from DataForSEO (Domain Rank Overview + Backlinks)
  if (websiteUrl) {
    try {
      const apiKey = process.env.DATAFORSEO_API_KEY || process.env.DATAFORSEO_USERNAME;
      if (!apiKey) {
        steps.push({
          name: 'domain_data',
          status: 'skipped',
          detail: 'DataForSEO credentials not set in environment',
        });
      } else {
        const { fetchComprehensiveDomainData } = await import('./dataforseo');
        const { calculateDomainScore } = await import('./domainScoring');
        
        console.log(`Enrichment: Fetching domain data for ${websiteUrl}`);
        const domainData = await fetchComprehensiveDomainData(websiteUrl);
        
        // Log what we received
        console.log(`Enrichment: Domain data received:`, {
          hasDomainRankOverview: !!domainData.domain_rank_overview,
          hasBacklinks: !!domainData.backlinks,
          organic_etv: domainData.domain_rank_overview?.organic_etv,
          organic_keywords: domainData.domain_rank_overview?.organic_keywords,
          domain_rank: domainData.backlinks?.rank,
          referring_domains: domainData.backlinks?.referring_domains,
        });
        
        // Calculate overall domain score
        const scoreBreakdown = calculateDomainScore(
          domainData.domain_rank_overview,
          domainData.backlinks
        );
        
        // Prepare update data
        const updateData: Record<string, any> = {
          domain_data: {
            domain_rank_overview: domainData.domain_rank_overview,
            backlinks: domainData.backlinks,
            historical_data: domainData.historical_data,
          },
          domain_data_updated_at: new Date().toISOString(),
          domain_score: scoreBreakdown.overall_score,
        };
        
        // Store individual fields for easy querying
        if (domainData.domain_rank_overview) {
          updateData.organic_etv = domainData.domain_rank_overview.organic_etv || null;
          updateData.organic_keywords = domainData.domain_rank_overview.organic_keywords || null;
        }
        
        if (domainData.backlinks) {
          updateData.domain_rank = domainData.backlinks.rank || null;
          updateData.referring_domains = domainData.backlinks.referring_domains || null;
          updateData.backlinks_count = domainData.backlinks.backlinks || null;
          updateData.spam_score = domainData.backlinks.target_spam_score || null;
        }
        
        // Calculate growth trends from historical data
        if (domainData.historical_data && Array.isArray(domainData.historical_data) && domainData.historical_data.length >= 2) {
          const historical = domainData.historical_data;
          const oldest = historical[0];
          const newest = historical[historical.length - 1];
          
          // Calculate ETV growth percentage
          if (oldest.organic_etv && newest.organic_etv && oldest.organic_etv > 0) {
            const etvGrowth = ((newest.organic_etv - oldest.organic_etv) / oldest.organic_etv) * 100;
            updateData.etv_growth_percentage = Math.round(etvGrowth * 100) / 100; // Round to 2 decimals
          }
          
          // Calculate keywords growth percentage
          if (oldest.organic_keywords && newest.organic_keywords && oldest.organic_keywords > 0) {
            const keywordsGrowth = ((newest.organic_keywords - oldest.organic_keywords) / oldest.organic_keywords) * 100;
            updateData.keywords_growth_percentage = Math.round(keywordsGrowth * 100) / 100;
          }
          
          updateData.historical_months_count = historical.length;
        } else if (domainData.historical_data && Array.isArray(domainData.historical_data)) {
          updateData.historical_months_count = domainData.historical_data.length;
        }
        
        console.log(`Enrichment: Updating database with domain data for tool ${toolId}`);
        const { error: updateError, data: updateResult } = await supabase
          .from("tools")
          .update(updateData)
          .eq("id", toolId)
          .select("id, domain_score");
        
        if (updateError) {
          console.error(`Enrichment: Database update failed:`, {
            error: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code,
          });
          throw new Error(`Database update failed: ${updateError.message}`);
        }
        
        console.log(`Enrichment: Database update successful:`, {
          toolId: updateResult?.[0]?.id,
          domain_score: updateResult?.[0]?.domain_score,
        });
        
        // Build detail message
        const details: string[] = [];
        if (scoreBreakdown.overall_score > 0) {
          details.push(`Domain Score: ${scoreBreakdown.overall_score.toFixed(1)}/10`);
        }
        if (domainData.domain_rank_overview?.organic_etv) {
          details.push(`ETV: ${domainData.domain_rank_overview.organic_etv.toLocaleString()}`);
        }
        if (domainData.domain_rank_overview?.organic_keywords) {
          details.push(`Keywords: ${domainData.domain_rank_overview.organic_keywords.toLocaleString()}`);
        }
        if (domainData.backlinks?.rank) {
          details.push(`Rank: ${domainData.backlinks.rank}/100`);
        }
        
        steps.push({
          name: 'domain_data',
          status: 'ok',
          detail: details.join(', ') || 'Domain data collected',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      steps.push({
        name: 'domain_data',
        status: 'failed',
        detail: `Domain data collection failed: ${errorMessage}`,
      });
      console.error('Enrichment: Domain data collection failed:', err);
    }
  } else {
    steps.push({
      name: 'domain_data',
      status: 'skipped',
      detail: 'Website URL missing',
    });
  }

  // 9. Sentiment analysis from Reddit, X, and YouTube
  try {
    // Import sentiment job dynamically to avoid circular dependencies
    const { runSentimentAnalysis } = await import('./sentiment/job');
    
    // Run sentiment analysis (this may take a while)
    const sentimentResult = await runSentimentAnalysis(
      {
        id: toolId,
        name: toolName,
        slug,
        search_query: null, // Use default search query
      }
    );

    if (sentimentResult.success) {
      const score = sentimentResult.aggregate?.final_score || 0;
      const label = sentimentResult.aggregate?.final_label || 'mixed';
      const successfulSources = Object.values(sentimentResult.sources).filter(s => s?.success).length;
      steps.push({
        name: 'sentiment_analysis',
        status: 'ok',
        detail: `Completed: ${score}/10 (${label}). Sources: ${successfulSources}/3`,
      });
    } else {
      const errors = sentimentResult.errors?.join('; ') || 'Unknown error';
      steps.push({
        name: 'sentiment_analysis',
        status: 'failed',
        detail: `Failed: ${errors}`,
      });
    }
  } catch (err) {
    steps.push({
      name: 'sentiment_analysis',
      status: 'failed',
      detail: `Sentiment analysis failed: ${String(err)}`,
    });
    // Don't fail the entire enrichment if sentiment fails
    console.warn('Sentiment analysis failed during enrichment:', err);
  }

  return {
    toolId,
    slug,
    steps,
    data: {
      website_url: websiteUrl,
      logo_url: logoUrl,
      short_description: descriptionText,
      category,
      pricing_model: pricingModel,
      tool_overview: toolOverview,
    },
  };
}

async function ensureToolRow(
  toolName: string,
  slug: string,
  steps: EnrichmentSummary["steps"]
): Promise<string> {
  try {
    const { data: existing, error: lookupError } = await supabase
      .from("tools")
      .select("id, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (lookupError) {
      console.error("Error looking up existing tool:", lookupError);
      // Continue to try creating new row
    }

    if (existing?.id) {
      steps.push({
        name: "tool_creation",
        status: "ok",
        detail: "Existing row reused",
      });
      return existing.id;
    }

    const { data, error } = await supabase
      .from("tools")
      .insert({ name: toolName, slug })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(
        `Unable to create tool row: ${error.message || "unknown error"}. ` +
        `Details: ${error.details || "none"}. ` +
        `Code: ${error.code || "none"}`
      );
    }

    if (!data) {
      throw new Error("Unable to create tool row: No data returned from insert");
    }

    steps.push({
      name: "tool_creation",
      status: "ok",
      detail: "New tool row created",
    });

    return data.id;
  } catch (err) {
    // Catch network/connection errors
    if (err instanceof TypeError && err.message.includes("fetch")) {
      console.error("Network error connecting to Supabase:", err);
      throw new Error(
        `Network error connecting to Supabase. ` +
        `Please check your SUPABASE_URL and SUPABASE_ANON_KEY environment variables. ` +
        `Original error: ${err.message}`
      );
    }
    // Re-throw other errors
    throw err;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanToolName(toolName: string): string {
  return toolName
    .toLowerCase()
    .trim()
    .replace(/\s+(ai|llm|api|sdk|tool|app|software|platform)$/i, "") // Remove common suffixes
    .replace(/[^a-z0-9]+/g, "") // Remove all non-alphanumeric
    .replace(/^(the|a|an)\s+/i, ""); // Remove articles
}

type ScoredUrl = {
  url: string;
  score: number;
  reason?: string;
};

function pickOfficialHomepage(results: SearchResult[], toolName: string): string | null {
  if (!results.length) return null;

  const cleanedName = cleanToolName(toolName);
  const MIN_SCORE = 35; // Minimum score to be considered

  const scored = results
    .map((result): ScoredUrl | null => {
      try {
        const url = new URL(result.url);
        const hostname = url.hostname.replace(/^www\./, "");
        const tld = hostname.split(".").pop() || "";
        const subdomain = hostname.split(".").slice(0, -2).join(".");
        const path = url.pathname.toLowerCase();
        const pathSegments = path.split("/").filter(Boolean);

        let score = 0;
        const reasons: string[] = [];

        // REJECTIONS (immediate disqualification)
        // Reject social domains
        if (
          SOCIAL_DOMAIN_BLOCKLIST.some(
            (blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`),
          )
        ) {
          return null;
        }

        // Reject .gov and .edu domains
        if (tld === "gov" || tld === "edu") {
          return null;
        }

        // Reject obvious non-official patterns
        if (hostname.includes("wikipedia.org") || hostname.includes("reddit.com")) {
          return null;
        }

        // SCORING: Domain name matching (highest priority)
        const hostnameWithoutTld = hostname.replace(/\.[^.]+$/, "");
        
        // Exact match: toolname.com or toolname.ai
        if (hostnameWithoutTld === cleanedName) {
          score += 100;
          reasons.push("exact domain match");
        }
        // Contains cleaned name
        else if (hostnameWithoutTld.includes(cleanedName)) {
          score += 60;
          reasons.push("domain contains tool name");
        }
        // Cleaned name contains domain (e.g., "lumaai" contains "luma")
        else if (cleanedName.includes(hostnameWithoutTld) && hostnameWithoutTld.length >= 3) {
          score += 40;
          reasons.push("tool name contains domain");
        }
        // Partial match (at least 4 chars)
        else {
          const minLen = Math.min(cleanedName.length, hostnameWithoutTld.length, 4);
          for (let i = minLen; i <= Math.min(cleanedName.length, hostnameWithoutTld.length); i++) {
            if (cleanedName.slice(0, i) === hostnameWithoutTld.slice(0, i)) {
              score += 20;
              reasons.push(`partial domain match (${i} chars)`);
              break;
            }
          }
        }

        // SCORING: TLD preferences
        if (tld === "com") {
          score += 20;
          reasons.push(".com TLD");
        } else if (tld === "ai" || tld === "io" || tld === "dev" || tld === "sh") {
          // .sh is common for tech companies (e.g., cursor.sh)
          score += 15;
          reasons.push(`.${tld} TLD`);
        } else if (tld === "org" || tld === "net") {
          score += 10;
          reasons.push(`.${tld} TLD`);
        } else {
          score += 5;
          reasons.push(`.${tld} TLD`);
        }

        // SCORING: Path depth (prefer root or shallow paths)
        if (pathSegments.length === 0) {
          score += 30;
          reasons.push("root path");
        } else if (pathSegments.length === 1) {
          score += 20;
          reasons.push("shallow path");
        } else if (pathSegments.length === 2) {
          score += 10;
          reasons.push("medium path depth");
        } else {
          score -= 10 * (pathSegments.length - 2); // Penalize deep paths
          reasons.push(`deep path (${pathSegments.length} segments)`);
        }

        // SCORING: Path content analysis
        const pathStr = path.toLowerCase();
        
        // Penalize download/file paths
        if (
          pathStr.includes("/download") ||
          pathStr.includes("/file") ||
          pathStr.includes("/pdf") ||
          pathStr.includes("/doc") ||
          pathStr.endsWith(".pdf") ||
          pathStr.endsWith(".zip") ||
          pathStr.endsWith(".exe")
        ) {
          score -= 50;
          reasons.push("download/file path");
        }

        // Penalize city/government pages
        if (
          pathStr.includes("/city") ||
          pathStr.includes("/government") ||
          pathStr.includes("/municipal") ||
          (pathStr.includes("/acrobat") && hostname.includes("adobe")) // Adobe Acrobat city pages
        ) {
          score -= 40;
          reasons.push("city/government page");
        }

        // Penalize blog/news paths
        if (pathStr.includes("/blog/") || pathStr.includes("/news/") || pathStr.includes("/article/")) {
          score -= 20;
          reasons.push("blog/news path");
        }

        // Prefer common homepage paths
        if (
          pathStr === "/" ||
          pathStr === "/home" ||
          pathStr === "/index" ||
          pathStr === "/welcome"
        ) {
          score += 15;
          reasons.push("homepage path");
        }

        // SCORING: Subdomain analysis
        if (subdomain && subdomain !== "www") {
          // Prefer no subdomain or common ones
          if (["app", "www", "www2"].includes(subdomain)) {
            score += 5;
          } else {
            score -= 10; // Penalize other subdomains
            reasons.push(`subdomain: ${subdomain}`);
          }
        }

        // SCORING: Use original Tavily score if available
        if (result.score !== undefined) {
          score += result.score * 0.5; // Weight Tavily's score less than our heuristics
        }

        return {
          url: result.url,
          score: Math.max(0, score), // Ensure non-negative
          reason: reasons.length > 0 ? reasons.join(", ") : undefined,
        };
      } catch {
        return null; // Invalid URL
      }
    })
    .filter((scored): scored is ScoredUrl => scored !== null) as ScoredUrl[];

  if (!scored.length) {
    console.warn(
      `No valid URLs found for ${toolName}. Top candidates:`,
      results.slice(0, 3).map((r) => r.url),
    );
    return null;
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  
  // If the best score is below minimum, but it's not from a blocked domain, still consider it
  // This handles cases where the official site might be in results but scored lower
  if (best.score < MIN_SCORE) {
    // Check if it's at least a reasonable candidate (not social media, not .gov/.edu)
    const url = new URL(best.url);
    const hostname = url.hostname.replace(/^www\./, "");
    const tld = hostname.split(".").pop() || "";
    
    const isBlocked = 
      SOCIAL_DOMAIN_BLOCKLIST.some(
        (blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`),
      ) ||
      tld === "gov" ||
      tld === "edu" ||
      hostname.includes("wikipedia.org") ||
      hostname.includes("reddit.com");
    
    if (isBlocked || best.score < 10) {
      console.warn(
        `No URLs passed minimum score (${MIN_SCORE}) for ${toolName}. Best candidate: ${best.url} (score: ${best.score.toFixed(1)})`,
      );
      return null;
    }
    
    // Allow it if it's not blocked and has at least some score
    console.log(
      `Selected homepage for ${toolName}: ${best.url} (score: ${best.score.toFixed(1)}, below threshold but acceptable, reasons: ${best.reason})`,
    );
  } else {
    console.log(
      `Selected homepage for ${toolName}: ${best.url} (score: ${best.score.toFixed(1)}, reasons: ${best.reason})`,
    );
  }

  return best.url;
}

async function safeFetchText(url: string): Promise<string> {
  try {
    return await fetchHtml(url);
  } catch {
    return "";
  }
}

function buildLogoGuesses(domain: string): Array<string | null> {
  return [
    `https://${domain}/favicon.ico`,
    `https://${domain}/logo.png`,
    `https://${domain}/logo.svg`,
    `https://${domain}/assets/logo.png`,
    `https://${domain}/assets/logo.svg`,
    `https://${domain}/images/logo.png`,
    `https://${domain}/images/logo.svg`,
  ];
}

async function getLogoFromLogoDev(domain: string): Promise<string | null> {
  try {
    const logoDevUrl = `https://img.logo.dev/${domain}?token=${process.env.LOGO_DEV_API_KEY || ''}`;
    const response = await fetch(logoDevUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Pinpoint/1.0)",
      },
    });
    
    if (response.ok && response.status === 200) {
      return logoDevUrl;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function getLogoFromLogoKit(domain: string): Promise<string | null> {
  try {
    const logoKitUrl = `https://img.logokit.com/${domain}/logo.png`;
    const response = await fetch(logoKitUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Pinpoint/1.0)",
      },
    });
    
    if (response.ok && response.status === 200) {
      return logoKitUrl;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function verifyLogoExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Pinpoint/1.0)",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok && response.status === 200;
  } catch (err) {
    return false;
  }
}

function extractLogoFromHtml(html: string, baseUrl: string): string | null {
  try {
    const base = new URL(baseUrl);
    
    // Try to find logo in common meta tags
    const metaLogoMatch = html.match(/<meta\s+property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (metaLogoMatch?.[1]) {
      try {
        return new URL(metaLogoMatch[1], baseUrl).toString();
      } catch {
        return null;
      }
    }
    
    // Try to find logo in link rel="icon" or "apple-touch-icon"
    const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|apple-touch-icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
    if (iconMatch?.[1]) {
      try {
        return new URL(iconMatch[1], baseUrl).toString();
      } catch {
        return null;
      }
    }
    
    // Try to find logo in img tags with common class/id patterns
    const logoImgMatch = html.match(/<img[^>]*(?:class|id)=["'][^"']*(?:logo|brand|header)[^"']*["'][^>]*src=["']([^"']+)["']/i);
    if (logoImgMatch?.[1]) {
      try {
        return new URL(logoImgMatch[1], baseUrl).toString();
      } catch {
        return null;
      }
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

function extractDescriptionFromHtml(html: string): string {
  const metaMatch = html.match(
    /<meta\s+(?:name|property)=["']description["'][^>]*content=["']([^"']+)["']/i
  );
  if (metaMatch?.[1]) {
    return metaMatch[1];
  }
  return "";
}

function extractHeroText(html: string): string {
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  if (h1Match?.[1]) {
    return stripHtml(h1Match[1]);
  }
  const heroMatch = html.match(/<section[^>]*hero[^>]*>(.*?)<\/section>/is);
  if (heroMatch?.[1]) {
    return stripHtml(heroMatch[1]);
  }
  return "";
}

function extractFeatureLinks(html: string, baseUrl: string): string[] {
  const matches = Array.from(html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis));
  const links: string[] = [];
  for (const match of matches) {
    const href = match[1];
    const anchorText = stripHtml(match[2]).toLowerCase();
    const candidate = href?.trim();
    if (!candidate) continue;
    if (
      FEATURE_LINK_KEYWORDS.some(
        (keyword) => anchorText.includes(keyword) || candidate.toLowerCase().includes(keyword)
      )
    ) {
      links.push(new URL(candidate, baseUrl).toString());
    }
  }
  return Array.from(new Set(links));
}

function extractVisibleText(html: string): string {
  // Remove scripts, styles, and other non-visible content
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " "); // Remove comments
  
  // First, try to extract table data (important for pricing tables)
  const tableTexts: string[] = [];
  const tableMatches = Array.from(cleaned.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi));
  for (const match of tableMatches) {
    // Extract table rows and cells
    const rowMatches = Array.from(match[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
    for (const row of rowMatches) {
      const cellMatches = Array.from(row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi));
      const rowText = cellMatches.map(cell => stripHtml(cell[1]).trim()).filter(Boolean).join(" | ");
      if (rowText.length > 5) {
        tableTexts.push(rowText);
      }
    }
  }
  
  // Extract text from common content tags
  const contentTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "span", "div", "article", "section", "td", "th"];
  const textParts: string[] = [];
  
  for (const tag of contentTags) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    const matches = Array.from(cleaned.matchAll(regex));
    for (const match of matches) {
      const text = stripHtml(match[1]).trim();
      if (text.length > 10) {
        textParts.push(text);
      }
    }
  }
  
  // Combine table data with other content
  const allText = [...tableTexts, ...textParts].join("\n");
  
  // If we found structured content, use it; otherwise fall back to stripping all HTML
  if (allText.length > 0) {
    return allText.slice(0, 10000); // Increased limit for pricing pages
  }
  
  // Fallback: strip all HTML
  return stripHtml(cleaned).slice(0, 10000);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function resolvePricingUrl(html: string, baseUrl: string): string | null {
  // Try multiple patterns to find pricing links
  const pricingKeywords = ["pricing", "plan", "plans", "subscription", "billing", "prices", "cost", "tier", "tiers"];
  
  // Pattern 1: Standard anchor tags
  const anchorMatches = Array.from(
    html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis)
  );
  
  for (const match of anchorMatches) {
    const text = stripHtml(match[2]).toLowerCase();
    const href = match[1].toLowerCase();
    
    // Check if link text or href contains pricing keywords
    const hasKeyword = pricingKeywords.some(keyword => 
      text.includes(keyword) || href.includes(keyword)
    );
    
    if (hasKeyword) {
      try {
        const url = new URL(match[1], baseUrl);
        // Prefer same-domain links
        const baseDomain = new URL(baseUrl).hostname;
        if (url.hostname === baseDomain || url.hostname === `www.${baseDomain}` || `www.${url.hostname}` === baseDomain) {
          return url.toString();
        }
      } catch {
        // Invalid URL, continue
      }
    }
  }
  
  // Pattern 2: Look for navigation menus with pricing links
  const navMatches = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/gi);
  if (navMatches) {
    for (const nav of navMatches) {
      const navLinks = Array.from(nav.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis));
      for (const match of navLinks) {
        const text = stripHtml(match[2]).toLowerCase();
        const href = match[1].toLowerCase();
        if (pricingKeywords.some(keyword => text.includes(keyword) || href.includes(keyword))) {
          try {
            const url = new URL(match[1], baseUrl);
            const baseDomain = new URL(baseUrl).hostname;
            if (url.hostname === baseDomain || url.hostname === `www.${baseDomain}` || `www.${url.hostname}` === baseDomain) {
              return url.toString();
            }
          } catch {
            // Invalid URL, continue
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * --- Stubbed external dependencies ---
 * Replace these with real implementations (search APIs, HTML fetchers, OpenAI, etc.)
 */

const SOCIAL_DOMAIN_BLOCKLIST = [
  "twitter.com",
  "x.com",
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "medium.com",
  "substack.com",
  "tiktok.com",
  "threads.net",
  "github.com",
];

// Store Tavily results with content for extraction
type TavilyResultWithContent = {
  url: string;
  content?: string;
  description?: string;
  title?: string;
};

const tavilyResultsCache: Map<string, TavilyResultWithContent | null> = new Map();

async function searchWebForOfficialSite(toolName: string): Promise<{ url: string; content: string } | null> {
  const apiKey = process.env.TAVILY_API_KEY ?? process.env.NEXT_PUBLIC_TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("TAVILY_API_KEY missing; unable to search for official site.");
    return null;
  }

  try {
    const searchPayload = {
      query: `${toolName} official website`,
      search_depth: "basic",
      max_results: 10, // Increased to get more candidates
    };

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(searchPayload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `Tavily search failed (${response.status} ${response.statusText}) for ${toolName}. ${detail || ""} [key: ${maskApiKey(apiKey)}]`,
      );
      return null;
    }

    const payload = (await response.json()) as { results?: Array<Record<string, unknown>> } | null;
    const rawResults = Array.isArray(payload?.results) ? payload?.results : [];

    const normalizedResults: SearchResult[] = rawResults
      .map((result, index) => {
        const url = typeof result.url === "string" ? result.url : null;
        if (!url) return null;
        const title = typeof result.title === "string" ? result.title : toolName;
        const summary =
          typeof result.description === "string"
            ? result.description
            : typeof result.content === "string"
            ? result.content
            : typeof result.snippet === "string"
            ? result.snippet
            : undefined;
        const score = typeof result.score === "number" ? result.score : rawResults.length - index;
        const searchResult: SearchResult = { url, title };
        if (summary !== undefined) searchResult.summary = summary;
        if (score !== undefined) searchResult.score = score;
        return searchResult;
      })
      .filter((result): result is SearchResult => result !== null);

    if (!normalizedResults.length) {
      console.warn(`Tavily search returned no usable homepage matches for ${toolName}.`);
      return null;
    }

    const bestUrl = pickOfficialHomepage(normalizedResults, toolName);
    if (!bestUrl) {
      return null;
    }

    // Find the matching result to get its content
    const bestResult = rawResults.find(
      (r) => typeof r.url === "string" && r.url === bestUrl
    );

    if (!bestResult) {
      return { url: bestUrl, content: "" };
    }

    // Extract content from Tavily result
    const content =
      typeof bestResult.content === "string"
        ? bestResult.content
        : typeof bestResult.description === "string"
        ? bestResult.description
        : typeof bestResult.snippet === "string"
        ? bestResult.snippet
        : "";

    // Cache the result for later use
    tavilyResultsCache.set(toolName, {
      url: bestUrl,
      content,
      description: typeof bestResult.description === "string" ? bestResult.description : undefined,
      title: typeof bestResult.title === "string" ? bestResult.title : undefined,
    });

    return { url: bestUrl, content };
  } catch (err) {
    console.warn(`Error while fetching Tavily results for ${toolName}: ${String(err)}`);
    return null;
  }
}

function maskApiKey(key: string): string {
  if (!key) return "missing";
  if (key.length <= 8) return "hidden";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

async function getLogoUrlFromDomain(domain: string): Promise<string | null> {
  if (!domain) return null;

  // Clean the domain (remove www, protocol, etc.)
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0] // Remove path if present
    .toLowerCase()
    .trim();

  if (!cleanDomain) return null;

  // Use Clearbit Logo API
  // Note: Clearbit Logo API is scheduled to be discontinued on December 1, 2025
  // Consider migrating to Logo.dev or LogoKit before then
  const clearbitUrl = `https://logo.clearbit.com/${cleanDomain}`;

  try {
    // Verify the logo exists by making a HEAD request
    const response = await fetch(clearbitUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Pinpoint/1.0)",
      },
    });

    // Clearbit returns 200 if logo exists, 404 if not
    if (response.ok && response.status === 200) {
      return clearbitUrl;
    }

    return null;
  } catch (err) {
    // If fetch fails, return null (will fall back to buildLogoGuesses)
    console.warn(`Clearbit logo fetch failed for ${cleanDomain}: ${String(err)}`);
    return null;
  }
}

async function fetchHtml(url: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        // Add timeout
        signal: AbortSignal.timeout(15000), // 15 second timeout
        redirect: "follow",
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          // Rate limited or blocked - wait before retry
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
          }
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Check if we got a valid HTML response (not an error page)
      if (html.length < 100 || html.includes("Access Denied") || html.includes("403 Forbidden")) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error("Received error page or invalid response");
      }
      
      return html;
    } catch (err) {
      if (attempt === retries) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown fetch error";
        console.warn(`Failed to fetch HTML from ${url} after ${retries + 1} attempts: ${errorMessage}`);
        throw err;
      }
      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  throw new Error("Failed to fetch after retries");
}

async function summarizeDescription(toolName: string, text: string): Promise<string> {
  const systemPrompt =
    "You are helping build a directory of AI tools. Given raw website copy, write a clear, neutral 1–2 sentence product description suitable for a directory listing. No marketing fluff, no emojis, just factual information about what the tool does.";
  
  const userPrompt = `Tool name: ${toolName}\n\nWebsite text:\n${text}`;
  
  return await callOpenAI(userPrompt, systemPrompt);
}

async function extractFeaturesAndCapabilities(text: string): Promise<FeatureExtraction> {
  const systemPrompt =
    "You are analyzing an AI tool's website for a tool directory. From the text, extract: (a) core features, (b) ideal use cases, (c) notable strengths / pros, (d) notable weaknesses / cons. Return a compact JSON object with keys: core_features (string[]), use_cases (string[]), pros (string[]), cons (string[]). Do not include any extra commentary.";
  
  const response = await callOpenAI(text, systemPrompt);
  
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    const parsed = JSON.parse(jsonStr) as {
      core_features?: string[];
      use_cases?: string[];
      pros?: string[];
      cons?: string[];
    };

    // Convert to FeatureExtraction format
    const features: Array<{ name: string; description: string }> =
      (parsed.core_features ?? []).map((feature) => ({
        name: feature,
        description: "",
      }));

    // Create a human-readable capabilities summary
    const capabilitiesSummary = [
      parsed.core_features && parsed.core_features.length > 0
        ? `Core features: ${parsed.core_features.join(", ")}`
        : "",
      parsed.use_cases && parsed.use_cases.length > 0
        ? `Use cases: ${parsed.use_cases.join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join(". ");

    return {
      capabilitiesSummary,
      features,
      pricingNotes: undefined,
      useCases: parsed.use_cases,
      pros: parsed.pros,
      cons: parsed.cons,
    };
  } catch (err) {
    // If JSON parsing fails, return a basic summary
    console.warn("Failed to parse features JSON:", err);
    return {
      capabilitiesSummary: response.slice(0, 500), // Truncate if too long
      features: [],
    };
  }
}

async function classifyCategory(description: string, capabilities: string): Promise<string | null> {
  const systemPrompt =
    "You are classifying an AI tool into a single category for a directory. Valid categories: Image, Video, Audio, Coding, Agents, Marketing, Business, Productivity, Design, Data/Analytics, Other. Return only the category string, no explanation.";
  
  const combinedText = [description, capabilities].filter(Boolean).join("\n\n");
  const response = await callOpenAI(combinedText, systemPrompt);
  
  // Normalize the response: trim, fix capitalization
  const category = response
    .trim()
    .split(/\s+/)[0] // Take first word
    .split("/")[0] // Handle "Data/Analytics" -> "Data"
    .trim();
  
  // Capitalize first letter, lowercase rest
  const normalized =
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  
  // Validate against known categories
  const validCategories = [
    "Image",
    "Video",
    "Audio",
    "Coding",
    "Agents",
    "Marketing",
    "Business",
    "Productivity",
    "Design",
    "Data",
    "Analytics",
    "Other",
  ];
  
  if (validCategories.includes(normalized)) {
    return normalized;
  }
  
  // If it's "Data/Analytics" or similar, return "Data/Analytics"
  if (category.toLowerCase().includes("data") || category.toLowerCase().includes("analytics")) {
    return "Data/Analytics";
  }
  
  return "Other";
}

async function detectPricingModel(text: string): Promise<string | null> {
  const systemPrompt =
    "You are extracting a simple pricing model label for an AI tool. Valid labels: Free, Free tier, Monthly subscription, Usage-based, One-time license, Enterprise only, Unknown. Return exactly one of these labels, no explanation.";
  
  const response = await callOpenAI(text, systemPrompt);
  
  // Normalize the response
  const label = response.trim().split(/\s+/)[0].trim();
  
  // Validate against known labels
  const validLabels = [
    "Free",
    "Free tier",
    "Monthly subscription",
    "Usage-based",
    "One-time license",
    "Enterprise only",
    "Unknown",
  ];
  
  // Check for variations
  const normalized = label.toLowerCase();
  if (normalized.includes("free tier") || normalized.includes("freemium")) {
    return "Free tier";
  }
  if (normalized.includes("free") && !normalized.includes("tier")) {
    return "Free";
  }
  if (normalized.includes("monthly") || normalized.includes("subscription")) {
    return "Monthly subscription";
  }
  if (normalized.includes("usage") || normalized.includes("token") || normalized.includes("pay per")) {
    return "Usage-based";
  }
  if (normalized.includes("one-time") || normalized.includes("one time") || normalized.includes("license")) {
    return "One-time license";
  }
  if (normalized.includes("enterprise")) {
    return "Enterprise only";
  }
  
  // If it matches a valid label exactly, return it
  if (validLabels.includes(label)) {
    return label;
  }
  
  // Default to Unknown if we can't determine
  return "Unknown";
}

async function extractDetailedPricing(toolName: string, text: string): Promise<string> {
  const systemPrompt = `You are extracting detailed, accurate pricing information for an AI tool from website content.

CRITICAL REQUIREMENTS:
1. Extract EVERY pricing tier/plan mentioned in the text
2. For EACH tier, provide:
   - Exact tier/plan name (e.g., "Free", "Starter", "Pro", "Enterprise")
   - Exact price(s) - include both monthly and annual if mentioned
   - All key features, limits, and capabilities for that tier
   - Any restrictions or limitations
   - Who the tier is designed for

3. Be PRECISE with numbers - if it says "$12/month" or "$144/year", include those exact amounts
4. Include feature comparisons between tiers (what's included vs excluded)
5. Note any special offers, discounts, or trial periods
6. If there's a free tier, describe what's included and what's limited

FORMAT:
Structure the response clearly with each tier as a separate section. Use this format:

**Tier Name** (e.g., Free, Starter, Pro, Enterprise)
- Price: [exact price with billing period]
- Key Features: [list main features]
- Limits: [any usage limits, storage limits, etc.]
- Best For: [target audience]

Repeat for each tier found.

Be thorough and accurate. If the text mentions pricing tables, compare tables, or feature lists, extract ALL the information. Don't summarize or generalize - be specific about what each tier includes.`;

  const userPrompt = `Tool name: ${toolName}

Extract ALL pricing tiers, exact prices, and detailed feature descriptions from the following website content. Be thorough and accurate:

${text}`;
  
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const openai = new OpenAI({ apiKey });

    const messages: Array<
      | { role: "system"; content: string }
      | { role: "user"; content: string }
    > = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.2, // Lower temperature for more accurate extraction
      max_tokens: 2000, // Increased significantly for detailed tier information
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    return content.trim();
  } catch (err) {
    console.warn("Failed to extract detailed pricing:", err);
    return "";
  }
}

async function searchWebForPricing(toolName: string, websiteUrl: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY ?? process.env.NEXT_PUBLIC_TAVILY_API_KEY;
  if (!apiKey) {
    return "";
  }

  try {
    const domain = new URL(websiteUrl).hostname;
    
    // Search specifically for pricing pages with multiple query variations
    const queries = [
      `${toolName} pricing plans subscription cost`,
      `${toolName} pricing tiers features`,
      `${domain} pricing page`,
    ];
    
    let allContent = "";
    
    for (const query of queries) {
      try {
        const searchPayload = {
          query,
          search_depth: "advanced", // Use advanced search for better results
          max_results: 3, // Get top 3 results per query
          include_domains: [domain], // Focus on the tool's domain
        };

        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(searchPayload),
        });

        if (!response.ok) {
          continue;
        }

        const payload = (await response.json()) as { results?: Array<Record<string, unknown>> } | null;
        const results = Array.isArray(payload?.results) ? payload.results : [];

        // Combine content from all results
        const pricingTexts = results
          .map((result) => {
            const content =
              typeof result.content === "string"
                ? result.content
                : typeof result.description === "string"
                ? result.description
                : typeof result.snippet === "string"
                ? result.snippet
                : "";
            return content;
          })
          .filter(Boolean)
          .join("\n\n");
        
        if (pricingTexts) {
          allContent = [allContent, pricingTexts].filter(Boolean).join("\n\n");
        }
      } catch (err) {
        // Continue to next query
        continue;
      }
    }

    return allContent.slice(0, 5000); // Increased limit for more comprehensive pricing info
  } catch (err) {
    console.warn(`Error while fetching Tavily pricing results for ${toolName}:`, err);
    return "";
  }
}

async function callOpenAI(prompt: string, system?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  try {
    const openai = new OpenAI({ apiKey });

    const messages: Array<
      | { role: "system"; content: string }
      | { role: "user"; content: string }
    > = [];

    if (system) {
      messages.push({ role: "system", content: system });
    }
    messages.push({ role: "user", content: prompt });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    return content.trim();
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown OpenAI API error";
    console.error("OpenAI API call failed:", {
      error: errorMessage,
      model: "gpt-4o",
      hasApiKey: !!apiKey,
    });
    throw new Error(`OpenAI API call failed: ${errorMessage}`);
  }
}
