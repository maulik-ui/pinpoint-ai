import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/src/lib/supabaseClient";

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

type ToolRecord = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  logo_url: string | null;
  pricing_model: string | null;
};

type FeatureRecord = {
  tool_id: string;
  feature_name: string;
  status: string;
  notes: string | null;
};

type AiResult = {
  tool_id: string;
  score: number;
  reason?: string;
};

type ToolWithFeatures = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  logo_url: string | null;
  pricing_model: string | null;
  greenFeatures: number;
  yellowFeatures: number;
  redFeatures: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch((err) => {
      console.error("Failed to parse request body", err);
      return null;
    });
    const query = body?.query?.toString().trim();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

  // Fetch up to 50 tools with required fields
  const toolsResult = await supabase
    .from("tools")
    .select("id, name, slug, short_description, category, logo_url, pricing_model")
    .limit(50);

  if (toolsResult.error) {
    console.error("Supabase tools fetch failed", {
      error: toolsResult.error,
      message: toolsResult.error.message,
      details: toolsResult.error.details,
      hint: toolsResult.error.hint,
    });
    return NextResponse.json(
      { error: `Unable to load tools: ${toolsResult.error.message || "Unknown error"}` },
      { status: 500 }
    );
  }

  const tools = (toolsResult.data ?? []) as ToolRecord[];

  if (tools.length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Fetch features for all tools
  const toolIds = tools.map((t) => t.id);
  const featuresResult = await supabase
    .from("tool_features")
    .select("tool_id, feature_name, status, notes")
    .in("tool_id", toolIds);

  if (featuresResult.error) {
    console.error("Supabase features fetch failed", featuresResult.error);
    return NextResponse.json(
      { error: "Unable to load features" },
      { status: 500 }
    );
  }

  const features = (featuresResult.data ?? []) as FeatureRecord[];

  // Group features by tool_id and compute counts
  const featureMap = new Map<string, FeatureRecord[]>();
  features.forEach((feature) => {
    const list = featureMap.get(feature.tool_id) ?? [];
    list.push(feature);
    featureMap.set(feature.tool_id, list);
  });

  // Build tools with feature counts
  const toolsWithFeatures: ToolWithFeatures[] = tools.map((tool) => {
    const toolFeatures = featureMap.get(tool.id) ?? [];
    const greenFeatures = toolFeatures.filter((f) => f.status === "works").length;
    const yellowFeatures = toolFeatures.filter((f) => f.status === "mediocre").length;
    const redFeatures = toolFeatures.filter((f) => f.status === "fails").length;

    return {
      ...tool,
      greenFeatures,
      yellowFeatures,
      redFeatures,
    };
  });

  // Build compact tool list for AI
  const compactTools = toolsWithFeatures.map((tool) => ({
    tool_id: tool.id,
    name: tool.name,
    category: tool.category,
    description: tool.short_description || "",
    greenFeatures: tool.greenFeatures,
    yellowFeatures: tool.yellowFeatures,
    redFeatures: tool.redFeatures,
  }));

  const fallback = () =>
    NextResponse.json({
      results: buildFallbackResults(query, toolsWithFeatures),
    });

  if (!openai) {
    return fallback();
  }

  const systemPrompt = `You are ranking AI tools for a user. You will receive a user query and a list of tools with descriptions, capabilities, and feature verification statuses (green = works, yellow = mixed, red = fails). Return the best matching tools for the query, favoring tools with more green and fewer red features. Respond with JSON only: an array of { tool_id, score (0 to 1), reason } sorted by score descending.`;

  const userContent = `User query: ${query}\n\nAvailable tools:\n${JSON.stringify(compactTools, null, 2)}`;

  let aiResponse: AiResult[] | null = null;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    aiResponse = parseAiResponse(content);

    if (!aiResponse) {
      throw new Error("OpenAI response was not valid JSON");
    }
  } catch (err) {
    console.error("OpenAI request failed", err);
    return fallback();
  }

  if (!Array.isArray(aiResponse)) {
    return fallback();
  }

  // Map tool_ids back to full tool objects
  const toolMap = new Map(toolsWithFeatures.map((tool) => [tool.id, tool]));

  const results = aiResponse
    .map((entry) => {
      const tool = toolMap.get(entry.tool_id);
      if (!tool) return null;
      return {
        tool: {
          id: tool.id,
          name: tool.name,
          slug: tool.slug,
          category: tool.category,
          short_description: tool.short_description,
          logo_url: tool.logo_url,
          pricing_model: tool.pricing_model,
        },
        score: entry.score ?? 0,
        reason: entry.reason ?? "",
      };
    })
    .filter((result): result is NonNullable<typeof result> => result !== null)
    .sort((a, b) => b.score - a.score); // Ensure descending order

  if (results.length === 0) {
    return fallback();
  }

  // Fetch features for top 3 results
  const top3Ids = results.slice(0, 3).map((r) => r.tool.id);
  const top3FeaturesResult = await supabase
    .from("tool_features")
    .select("tool_id, feature_name")
    .in("tool_id", top3Ids)
    .eq("status", "works")
    .limit(9); // 3 features per tool

  const featuresMap = new Map<string, string[]>();
  top3FeaturesResult.data?.forEach((f) => {
    const existing = featuresMap.get(f.tool_id) || [];
    if (existing.length < 3) {
      existing.push(f.feature_name);
      featuresMap.set(f.tool_id, existing);
    }
  });

  // Add features to top 3 results
  const enrichedResults = results.map((result, index) => {
    if (index < 3) {
      return {
        ...result,
        features: featuresMap.get(result.tool.id) || [],
      };
    }
    return result;
  });

  return NextResponse.json({ results: enrichedResults });
  } catch (err) {
    console.error("Unexpected error in ai-search route", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function buildFallbackResults(query: string, tools: ToolWithFeatures[]) {
  const q = query.toLowerCase();
  const ranked = tools
    .map((tool) => {
      const text = [
        tool.name,
        tool.category,
        tool.short_description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const hits = q
        .split(/\s+/)
        .filter(Boolean)
        .filter((term) => text.includes(term)).length;
      
      // Boost score for tools with more green features
      const featureBonus = (tool.greenFeatures * 0.1) - (tool.redFeatures * 0.05);
      
      return {
        tool,
        hits,
        featureBonus,
      };
    })
    .filter((entry) => entry.hits > 0 || entry.featureBonus > 0)
    .sort((a, b) => {
      const scoreA = a.hits + a.featureBonus;
      const scoreB = b.hits + b.featureBonus;
      return scoreB - scoreA;
    })
    .slice(0, 10);

  return ranked.map((entry) => ({
    tool: {
      id: entry.tool.id,
      name: entry.tool.name,
      slug: entry.tool.slug,
      category: entry.tool.category,
      short_description: entry.tool.short_description,
      logo_url: entry.tool.logo_url,
      pricing_model: entry.tool.pricing_model,
    },
    score: Math.min(1, 0.3 + entry.hits * 0.1 + entry.featureBonus),
    reason: entry.hits > 0
      ? `Matches ${entry.hits} keyword${entry.hits === 1 ? "" : "s"} from your query.`
      : `Has ${entry.tool.greenFeatures} verified working features.`,
  }));
}

function parseAiResponse(raw: string): AiResult[] | null {
  const cleaned = stripCodeFences(raw);
  try {
    const parsed = JSON.parse(cleaned) as AiResult[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function stripCodeFences(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  const firstNewline = trimmed.indexOf("\n");
  const lastFence = trimmed.lastIndexOf("```");
  if (firstNewline !== -1 && lastFence > firstNewline) {
    return trimmed.slice(firstNewline + 1, lastFence).trim();
  }

  return trimmed.replace(/```/g, "").trim();
}
