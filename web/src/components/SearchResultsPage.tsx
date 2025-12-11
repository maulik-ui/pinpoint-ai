"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import AuthButton from "./AuthButton";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import Link from "next/link";
import { Footer } from "./Footer";

type SearchResult = {
  tool: {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    short_description: string | null;
    logo_url: string | null;
    pricing_model?: string | null;
  };
  score: number;
  reason: string;
  features?: string[];
};

interface SearchResultsPageProps {
  query: string;
}

export default function SearchResultsPage({ query }: SearchResultsPageProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim()) {
      handleSearch(query);
    }
  }, [query]);

  async function handleSearch(searchQuery: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      const data = (await response.json()) as { results?: SearchResult[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error || `Search failed with status ${response.status}`);
      }

      setResults(data.results ?? []);
    } catch (err) {
      console.error("AI search failed", err);
      const errorMessage = err instanceof Error ? err.message : "Unable to search right now. Please try again.";
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const topResults = results.slice(0, 3);
  const otherResults = results.slice(3);

  // Get category from top results for insights section
  const primaryCategory = topResults[0]?.tool.category || "AI Tools";

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Logo size="md" />
            <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>
              Pinpoint AI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 pb-16">
        {/* Query Title Section */}
        <section className="py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl tracking-tight" style={{ fontWeight: 600 }}>
              Results for <span className="text-primary">'{query}'</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
              AI-powered search combined with human curation to find the perfect tools for your needs
            </p>
          </motion.div>
        </section>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-[20px] p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && query && (
          <div className="bg-secondary/30 rounded-[20px] p-8 text-center">
            <p className="text-muted-foreground">No tools found for that search.</p>
          </div>
        )}

        {/* Top Recommended Tools Section */}
        {!loading && !error && topResults.length > 0 && (
          <section className="py-8">
            <h2 className="text-2xl tracking-tight mb-8" style={{ fontWeight: 600 }}>
              Top Recommended
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {topResults.map((result, index) => (
                <motion.div
                  key={result.tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={`/tool/${result.tool.slug}`}
                    className="block bg-card rounded-[20px] pt-6 px-8 pb-8 shadow-sm border border-border/50 space-y-5 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {result.tool.logo_url ? (
                            <ImageWithFallback
                              src={result.tool.logo_url}
                              alt={`${result.tool.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-xl font-semibold">
                              {result.tool.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <h3 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
                            {result.tool.name}
                          </h3>
                        </div>
                        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-primary/30 bg-primary/5 flex-shrink-0">
                          <div className="text-xl" style={{ fontWeight: 600, color: "#6E7E55" }}>
                            {Math.round(result.score * 10)}/10
                          </div>
                          <div className="text-xs text-foreground/70" style={{ fontWeight: 500 }}>match</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" strokeWidth={2} />
                        <span className="text-xs" style={{ fontWeight: 500 }}>
                          Verified by Humans
                        </span>
                      </div>

                      <p className="text-sm text-foreground/80" style={{ lineHeight: 1.7 }}>
                        {result.reason || result.tool.short_description || "AI-powered tool"}
                      </p>
                    </div>

                    {result.features && result.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-3 py-1 bg-secondary/40 rounded-full text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center pt-2">
                      {result.tool.pricing_model && (
                        <span
                          className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full"
                          style={{ fontWeight: 500 }}
                        >
                          {result.tool.pricing_model}
                        </span>
                      )}
                      {!result.tool.pricing_model && result.tool.category && (
                        <span
                          className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full"
                          style={{ fontWeight: 500 }}
                        >
                          {result.tool.category}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* AI Reasoning Box */}
        {!loading && !error && results.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="py-8"
          >
            <div className="bg-secondary/30 rounded-[20px] p-8">
              <h3 className="text-xl tracking-tight mb-4" style={{ fontWeight: 600 }}>
                Why these tools?
              </h3>
              <p className="text-foreground/80" style={{ lineHeight: 1.8 }}>
                These recommendations are ranked using a combination of{" "}
                <span style={{ fontWeight: 500 }}>community sentiment</span> across platforms,{" "}
                <span style={{ fontWeight: 500 }}>market traction</span>,{" "}
                <span style={{ fontWeight: 500 }}>feature accuracy</span> (claims vs. reality),{" "}
                <span style={{ fontWeight: 500 }}>pricing fairness</span>, and{" "}
                <span style={{ fontWeight: 500 }}>human verification</span>. We prioritize tools that
                deliver real value and match your specific needs.
              </p>
            </div>
          </motion.section>
        )}

        {/* Other Tools You May Like */}
        {!loading && !error && otherResults.length > 0 && (
          <section className="py-8">
            <h2 className="text-2xl tracking-tight mb-8" style={{ fontWeight: 600 }}>
              Other Tools You May Like
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {otherResults.map((result, index) => (
                <motion.div
                  key={result.tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                >
                  <Link
                    href={`/tool/${result.tool.slug}`}
                    className="block bg-card rounded-[16px] p-6 shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {result.tool.logo_url ? (
                            <ImageWithFallback
                              src={result.tool.logo_url}
                              alt={`${result.tool.name} logo`}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-base font-semibold">
                              {result.tool.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <h4 className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
                            {result.tool.name}
                          </h4>
                          {result.tool.pricing_model && (
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {result.tool.pricing_model}
                            </span>
                          )}
                          {!result.tool.pricing_model && result.tool.category && (
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {result.tool.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/70" style={{ lineHeight: 1.6 }}>
                          {result.reason || result.tool.short_description || "AI-powered tool"}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-primary/30 bg-primary/5 flex-shrink-0">
                        <div className="text-lg" style={{ fontWeight: 600, color: "#6E7E55" }}>
                          {Math.round(result.score * 10)}/10
                        </div>
                        <div className="text-xs text-foreground/70" style={{ fontWeight: 500 }}>match</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Category Insights Section */}
        {!loading && !error && results.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="py-8"
          >
            <div className="bg-secondary/30 rounded-[20px] p-10">
              <h2 className="text-2xl tracking-tight mb-6" style={{ fontWeight: 600 }}>
                Insights on {primaryCategory}
              </h2>
              <div className="space-y-4 text-foreground/85" style={{ lineHeight: 1.8 }}>
                <p>
                  The {primaryCategory} space has evolved dramatically in 2025. What started as simple
                  solutions have transformed into sophisticated tools that understand context, user needs,
                  and deliver real value. The best tools now combine powerful capabilities with intuitive
                  interfaces and specialized features.
                </p>
                <p>
                  <span style={{ fontWeight: 600 }}>Key trends:</span> We're seeing a shift toward more
                  specialized tools rather than one-size-fits-all solutions. Tools that excel in specific
                  use cases often outperform general-purpose alternatives. Pricing models are stabilizing,
                  with most offering generous free tiers or transparent pricing structures.
                </p>
                <p>
                  <span style={{ fontWeight: 600 }}>What to consider:</span> Look beyond the hype. The
                  highest-rated tools aren't always the most expensive. Community sentiment strongly favors
                  tools with transparent pricing, reliable output, and responsive support. Feature
                  accuracy matters—many tools overpromise on capabilities they can't consistently deliver.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
