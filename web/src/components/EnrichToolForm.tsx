"use client";

import { useState, FormEvent, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { CheckCircle2, XCircle, AlertCircle, ChevronDown } from "lucide-react";

type StepStatus = "ok" | "failed" | "skipped";

type EnrichmentResponse = {
  toolId: string;
  slug: string;
  steps: Array<{
    name: string;
    status: StepStatus;
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

type Feature = {
  id: string;
  feature_name: string;
  promise_description: string | null;
  status: string;
};

// Category options matching the CategoryBrowse component
const CATEGORY_OPTIONS = [
  { value: "", label: "Auto-detect (default)" },
  { value: "Core Models", label: "Core Models" },
  { value: "AI Workspaces", label: "AI Workspaces" },
  { value: "Writing Tools", label: "Writing Tools" },
  { value: "Code Copilots", label: "Code Copilots" },
  { value: "UI Design", label: "UI Design" },
  { value: "Image Gen", label: "Image Gen" },
  { value: "Image Editing", label: "Image Editing" },
  { value: "Video Gen", label: "Video Gen" },
  { value: "Video Editing", label: "Video Editing" },
  { value: "Audio and Voice", label: "Audio and Voice" },
  { value: "Presentations", label: "Presentations" },
  { value: "Marketing AI", label: "Marketing AI" },
  { value: "Sales and Support", label: "Sales and Support" },
  { value: "Data and Analytics", label: "Data and Analytics" },
  { value: "Automation Agents", label: "Automation Agents" },
  { value: "Research Tools", label: "Research Tools" },
  { value: "Education AI", label: "Education AI" },
  { value: "Legal AI", label: "Legal AI" },
  { value: "Finance Ops", label: "Finance Ops" },
  { value: "HR Tech", label: "HR Tech" },
  { value: "Healthcare AI", label: "Healthcare AI" },
  { value: "Ecommerce AI", label: "Ecommerce AI" },
  { value: "Real Estate AI", label: "Real Estate AI" },
  { value: "3D and VFX", label: "3D and VFX" },
  { value: "Security and Compliance", label: "Security and Compliance" },
  { value: "Other", label: "Other" },
];

export default function EnrichToolForm() {
  const [toolName, setToolName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnrichmentResponse | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [domainData, setDomainData] = useState<any>(null);
  const [loadingDomainData, setLoadingDomainData] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = toolName.trim();
    if (!trimmed) {
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/admin/enrich-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          toolName: trimmed,
          companyName: companyName.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          category: category.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Enrichment failed");
      }

      const payload = (await response.json()) as EnrichmentResponse;
      setResult(payload);
      setToolName("");
      setCompanyName("");
      setWebsiteUrl("");
      setCategory("");
      
      // Fetch features and domain data for this tool
      if (payload.toolId) {
        setLoadingFeatures(true);
        setLoadingDomainData(true);
        
        // Fetch features
        try {
          const featuresResponse = await fetch(`/api/admin/tool-features?toolId=${payload.toolId}`);
          if (featuresResponse.ok) {
            const featuresData = await featuresResponse.json();
            setFeatures(featuresData.features || []);
          }
        } catch (err) {
          console.error("Failed to fetch features:", err);
        } finally {
          setLoadingFeatures(false);
        }
        
        // Fetch domain data
        try {
          const domainResponse = await fetch(`/api/admin/tool-domain-data?toolId=${payload.toolId}`);
          if (domainResponse.ok) {
            const domainDataResponse = await domainResponse.json();
            setDomainData(domainDataResponse.domainData);
          }
        } catch (err) {
          console.error("Failed to fetch domain data:", err);
        } finally {
          setLoadingDomainData(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enrich tool");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-card rounded-[20px] p-8 shadow-sm border border-border/50 space-y-6">
      <div>
        <h2 className="text-2xl tracking-tight mb-2" style={{ fontWeight: 600 }}>
          Auto enrich a tool
        </h2>
        <p className="text-muted-foreground">
          Enter a tool name to create/fill it with website, features, category, pricing, and more.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Tool name (e.g., Midjourney)"
              value={toolName}
              onChange={(event) => setToolName(event.target.value)}
              className="flex-1 rounded-[12px] border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
              disabled={loading}
              required
            />
            <input
              type="text"
              placeholder="Company name (e.g., OpenAI)"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="flex-1 rounded-[12px] border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
              disabled={loading}
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="flex-1 rounded-[12px] border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="url"
              placeholder="Website URL (e.g., https://midjourney.com) - Optional"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              className="flex-1 rounded-[12px] border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !toolName.trim()}
              className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{ fontWeight: 500 }}
            >
              {loading ? "Enriching…" : "Enrich tool"}
            </button>
          </div>
        </div>
      </form>
      {error && (
        <div className="rounded-[12px] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">
              Tool ID: <span className="font-mono">{result.toolId}</span> · Slug:{" "}
              <span className="font-mono">{result.slug}</span>
            </p>
          </div>
          
          <Accordion type="multiple" className="w-full" defaultValue={["steps"]}>
            {/* Steps Overview */}
            <AccordionItem value="steps" className="border-none">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Enrichment Steps</h3>
                  <span className="text-xs text-muted-foreground">
                    ({result.steps.filter(s => s.status === "ok").length}/{result.steps.length} completed)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pb-4">
                  {result.steps.map((step) => (
                    <li
                      key={step.name}
                      className="flex items-start justify-between rounded-[12px] border border-border/50 bg-secondary/20 p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{step.name.replace(/_/g, " ")}</p>
                        {step.detail && (
                          <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
                        )}
                      </div>
                      <div className="ml-4">
                        {step.status === "ok" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        {step.status === "failed" && <XCircle className="w-5 h-5 text-destructive" />}
                        {step.status === "skipped" && <AlertCircle className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Website & Logo */}
            {(result.data.website_url || result.data.logo_url) && (
              <AccordionItem value="website" className="border-none">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <h3 className="text-lg font-semibold">Website & Logo</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pb-4">
                    {result.data.website_url && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Website URL</p>
                        <a
                          href={result.data.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {result.data.website_url}
                        </a>
                      </div>
                    )}
                    {result.data.logo_url && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Logo URL</p>
                        <div className="flex items-center gap-3">
                          <img
                            src={result.data.logo_url}
                            alt="Logo"
                            className="w-12 h-12 rounded-lg object-cover border border-border/50"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <a
                            href={result.data.logo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            {result.data.logo_url}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Description */}
            {result.data.short_description && (
              <AccordionItem value="description" className="border-none">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <h3 className="text-lg font-semibold">Description</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-4">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {result.data.short_description}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Features */}
            {(features.length > 0 || loadingFeatures) && (
              <AccordionItem value="features" className="border-none">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <h3 className="text-lg font-semibold">
                    Features {features.length > 0 && `(${features.length})`}
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-4">
                    {loadingFeatures ? (
                      <p className="text-sm text-muted-foreground">Loading features...</p>
                    ) : features.length > 0 ? (
                      <ul className="space-y-2">
                        {features.map((feature) => (
                          <li
                            key={feature.id}
                            className="flex items-start gap-2 rounded-[12px] border border-border/50 bg-secondary/20 p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{feature.feature_name}</p>
                              {feature.promise_description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {feature.promise_description}
                                </p>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              feature.status === "works" ? "bg-primary/20 text-primary" :
                              feature.status === "mediocre" ? "bg-yellow-500/20 text-yellow-600" :
                              "bg-destructive/20 text-destructive"
                            }`}>
                              {feature.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No features found</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Category */}
            {result.data.category && (
              <AccordionItem value="category" className="border-none">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <h3 className="text-lg font-semibold">Category</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-4">
                    <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {result.data.category}
                    </span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Pricing */}
            {(result.data.pricing_model || result.data.tool_overview) && (
              <AccordionItem value="pricing" className="border-none">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <h3 className="text-lg font-semibold">Pricing</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-4">
                    {result.data.pricing_model && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Pricing Model</p>
                        <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {result.data.pricing_model}
                        </span>
                      </div>
                    )}
                    {result.data.tool_overview && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Pricing Details</p>
                          <div className="rounded-[12px] border border-border/50 bg-secondary/20 p-4 max-h-96 overflow-y-auto">
                            <pre className="text-xs text-foreground/90 whitespace-pre-wrap break-words">
                              {result.data.tool_overview.includes("Pricing Details:") 
                                ? result.data.tool_overview.split("Pricing Details:")[1]?.trim() || result.data.tool_overview
                                : result.data.tool_overview}
                            </pre>
                          </div>
                        </div>
                        {/* Debug: Show if Pricing Details section exists */}
                        <div className="text-xs">
                          <p className="text-muted-foreground mb-1">
                            {result.data.tool_overview.includes("Pricing Details:") 
                              ? "✓ Pricing Details section found in tool_overview"
                              : "⚠ No 'Pricing Details:' section found in tool_overview"}
                          </p>
                          {result.data.tool_overview.includes("Pricing Details:") && (
                            <p className="text-muted-foreground">
                              Pricing section length: {result.data.tool_overview.split("Pricing Details:")[1]?.length || 0} characters
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Capabilities */}
            {result.data.tool_overview && !result.data.tool_overview.includes("Pricing Details:") && (
              <AccordionItem value="capabilities" className="border-none">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <h3 className="text-lg font-semibold">Capabilities</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-4">
                    <div className="rounded-[12px] border border-border/50 bg-secondary/20 p-4">
                      <pre className="text-xs text-foreground/90 whitespace-pre-wrap break-words">
                        {result.data.tool_overview.split("Pricing Details:")[0]?.trim() || result.data.tool_overview}
                      </pre>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Domain Data */}
            {(domainData || loadingDomainData) && (
              <AccordionItem value="domain" className="border-none">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Domain Traction</h3>
                    {domainData?.domain_score && (
                      <span className="text-sm font-medium text-primary">
                        Score: {domainData.domain_score.toFixed(1)}/10
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-4">
                    {loadingDomainData ? (
                      <p className="text-sm text-muted-foreground">Loading domain data...</p>
                    ) : domainData ? (
                      <>
                        {/* Domain Score */}
                        {domainData.domain_score !== null && (
                          <div className="rounded-[12px] border border-border/50 bg-secondary/20 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold">Overall Domain Score</p>
                              <span className="text-2xl font-bold text-primary">
                                {domainData.domain_score.toFixed(1)}/10
                              </span>
                            </div>
                            <div className="w-full bg-background rounded-full h-2 mt-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${(domainData.domain_score / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Domain Rank Overview */}
                        {domainData.domain_data?.domain_rank_overview && (
                          <div className="rounded-[12px] border border-border/50 bg-secondary/20 p-4">
                            <p className="text-sm font-semibold mb-3">Domain Rank Overview</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {domainData.organic_etv !== null && (
                                <div>
                                  <p className="text-muted-foreground">Organic ETV</p>
                                  <p className="font-medium">{(domainData.organic_etv / 1000).toFixed(1)}K</p>
                                </div>
                              )}
                              {domainData.organic_keywords !== null && (
                                <div>
                                  <p className="text-muted-foreground">Keywords Ranking</p>
                                  <p className="font-medium">{domainData.organic_keywords.toLocaleString()}</p>
                                </div>
                              )}
                              {domainData.domain_data.domain_rank_overview.position_distribution && (
                                <>
                                  <div>
                                    <p className="text-muted-foreground">Position #1</p>
                                    <p className="font-medium">{domainData.domain_data.domain_rank_overview.position_distribution.pos_1?.toLocaleString() || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Position 2-3</p>
                                    <p className="font-medium">{domainData.domain_data.domain_rank_overview.position_distribution.pos_2_3?.toLocaleString() || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Position 4-10</p>
                                    <p className="font-medium">{domainData.domain_data.domain_rank_overview.position_distribution.pos_4_10?.toLocaleString() || 0}</p>
                                  </div>
                                </>
                              )}
                              {domainData.domain_data.domain_rank_overview.keyword_movement && (
                                <>
                                  <div>
                                    <p className="text-muted-foreground">New Keywords</p>
                                    <p className="font-medium text-green-600">{domainData.domain_data.domain_rank_overview.keyword_movement.is_new?.toLocaleString() || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Keywords Up</p>
                                    <p className="font-medium text-green-600">{domainData.domain_data.domain_rank_overview.keyword_movement.is_up?.toLocaleString() || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Keywords Down</p>
                                    <p className="font-medium text-yellow-600">{domainData.domain_data.domain_rank_overview.keyword_movement.is_down?.toLocaleString() || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Keywords Lost</p>
                                    <p className="font-medium text-red-600">{domainData.domain_data.domain_rank_overview.keyword_movement.is_lost?.toLocaleString() || 0}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Historical Data */}
                        {domainData.domain_data?.historical_data && Array.isArray(domainData.domain_data.historical_data) && domainData.domain_data.historical_data.length > 0 && (
                          <div className="rounded-[12px] border border-border/50 bg-secondary/20 p-4">
                            <p className="text-sm font-semibold mb-3">
                              Historical Trends ({domainData.domain_data.historical_data.length} months)
                            </p>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {domainData.domain_data.historical_data.slice().reverse().map((item: any, idx: number) => {
                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                const monthName = monthNames[(item.month || 1) - 1];
                                const year = item.year || new Date().getFullYear();
                                const etv = item.organic_etv || 0;
                                const keywords = item.organic_keywords || 0;
                                
                                return (
                                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-background rounded">
                                    <span className="font-medium">{monthName} {year}</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-muted-foreground">ETV: {(etv / 1000).toFixed(1)}K</span>
                                      <span className="text-muted-foreground">Keywords: {keywords.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Backlinks Data */}
                        {domainData.domain_data?.backlinks && (
                          <div className="rounded-[12px] border border-border/50 bg-secondary/20 p-4">
                            <p className="text-sm font-semibold mb-3">Backlinks & Authority</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {domainData.domain_rank !== null && (
                                <div>
                                  <p className="text-muted-foreground">Domain Rank</p>
                                  <p className="font-medium">{domainData.domain_rank}/100</p>
                                </div>
                              )}
                              {domainData.referring_domains !== null && (
                                <div>
                                  <p className="text-muted-foreground">Referring Domains</p>
                                  <p className="font-medium">{domainData.referring_domains.toLocaleString()}</p>
                                </div>
                              )}
                              {domainData.backlinks_count !== null && (
                                <div>
                                  <p className="text-muted-foreground">Total Backlinks</p>
                                  <p className="font-medium">{domainData.backlinks_count.toLocaleString()}</p>
                                </div>
                              )}
                              {domainData.spam_score !== null && (
                                <div>
                                  <p className="text-muted-foreground">Spam Score</p>
                                  <p className={`font-medium ${domainData.spam_score <= 10 ? 'text-green-600' : domainData.spam_score <= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {domainData.spam_score}/100
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Raw Domain Data */}
                        {domainData.domain_data && (
                          <div className="rounded-[12px] border border-border/50 bg-secondary/20 p-4">
                            <p className="text-sm font-semibold mb-2">Raw Domain Data (JSON)</p>
                            <pre className="text-xs text-foreground/70 overflow-auto max-h-64 bg-background p-3 rounded">
                              {JSON.stringify(domainData.domain_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No domain data available</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}
    </section>
  );
}
