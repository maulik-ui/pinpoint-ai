"use client";

import { useState, FormEvent } from "react";

type RedditSubmissionResponse = {
  success: boolean;
  toolId?: string;
  toolName?: string;
  error?: string;
  message?: string;
};

export default function RedditSentimentForm() {
  const [toolSlug, setToolSlug] = useState("");
  const [redditAnswer, setRedditAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RedditSubmissionResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedSlug = toolSlug.trim();
    const trimmedAnswer = redditAnswer.trim();

    if (!trimmedSlug) {
      setError("Tool slug is required");
      return;
    }

    if (!trimmedAnswer || trimmedAnswer.length < 50) {
      setError("Reddit answer must be at least 50 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/reddit-sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolSlug: trimmedSlug,
          redditAnswer: trimmedAnswer,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to process Reddit sentiment");
      }

      const payload = (await response.json()) as RedditSubmissionResponse;
      setResult(payload);
      setRedditAnswer(""); // Clear form on success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process Reddit sentiment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-card rounded-[20px] p-8 shadow-sm border border-border/50 space-y-6">
      <div>
        <h2 className="text-2xl tracking-tight mb-2" style={{ fontWeight: 600 }}>
          Manual Reddit Sentiment
        </h2>
        <p className="text-muted-foreground">
          Paste the Reddit Answers response here. It will be processed with OpenAI and stored as sentiment data.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tool-slug" className="block text-sm font-medium mb-2">
            Tool Slug
          </label>
          <input
            id="tool-slug"
            type="text"
            placeholder="luma-ai"
            value={toolSlug}
            onChange={(event) => setToolSlug(event.target.value)}
            className="w-full rounded-[12px] border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Enter the tool slug (e.g., "luma-ai" for the tool at /tool/luma-ai)
          </p>
        </div>

        <div>
          <label htmlFor="reddit-answer" className="block text-sm font-medium mb-2">
            Reddit Answers Response
          </label>
          <textarea
            id="reddit-answer"
            placeholder="Paste the full Reddit Answers response here..."
            value={redditAnswer}
            onChange={(event) => setRedditAnswer(event.target.value)}
            rows={10}
            className="w-full rounded-[12px] border border-border bg-background px-4 py-2.5 text-foreground font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Paste the complete answer from Reddit Answers. Minimum 50 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !toolSlug.trim() || !redditAnswer.trim() || redditAnswer.trim().length < 50}
          className="w-full rounded-full bg-primary text-primary-foreground px-6 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{ fontWeight: 500 }}
        >
          {loading ? "Processing…" : "Process Reddit Sentiment"}
        </button>
      </form>

      {error && (
        <div className="rounded-[12px] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className={`rounded-[12px] border p-4 text-sm ${
          result.success 
            ? "border-primary/20 bg-primary/10 text-primary" 
            : "border-destructive/20 bg-destructive/10 text-destructive"
        }`}>
          {result.success ? (
            <div>
              <p className="font-semibold mb-1">✓ Success!</p>
              <p className="mt-1">
                Reddit sentiment processed and stored for{" "}
                <span className="font-mono font-semibold">{result.toolName}</span>
              </p>
              {result.message && (
                <p className="mt-1 text-xs opacity-80">{result.message}</p>
              )}
            </div>
          ) : (
            <p>{result.error || "Failed to process"}</p>
          )}
        </div>
      )}
    </section>
  );
}

