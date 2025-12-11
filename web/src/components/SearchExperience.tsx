"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import ToolLogo from "./ToolLogo";

type Tool = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  overall_score: number | null;
  logo_url: string | null;
};

type SearchResult = {
  tool: Tool;
  score: number;
  reason: string;
};

export default function SearchExperience() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
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

  return (
    <div className="flex w-full max-w-2xl flex-col items-center text-center">
      <form
        onSubmit={handleSearch}
        className="flex w-full items-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-4 shadow-sm focus-within:ring-2 focus-within:ring-black/10"
      >
        <input
          type="text"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search AI tools or type a prompt…"
          className="w-full border-none bg-transparent text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
          disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {!hasSearched && (
        <p className="mt-6 text-xs text-gray-400">
          Start typing to explore the latest tools.
        </p>
      )}

      {error && (
        <div className="mt-8 w-full rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {hasSearched && !error && (
        <div className="mt-8 w-full text-left">
          {loading && (
            <p className="text-sm text-gray-500">Thinking about the best tools…</p>
          )}
          {!loading && results.length === 0 && (
            <div className="rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              No tools found for that search.
            </div>
          )}
          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((result) => (
                <Link
                  key={result.tool.id}
                  href={`/tool/${result.tool.slug}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-black/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ToolLogo
                        logoUrl={result.tool.logo_url}
                        toolName={result.tool.name}
                        size="md"
                      />
                      <div>
                        <p className="text-lg font-semibold">{result.tool.name}</p>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          {result.tool.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-gray-400">AI score</p>
                      <p className="text-2xl font-bold">
                        {result.score.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {result.reason || result.tool.short_description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
