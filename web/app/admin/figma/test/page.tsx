"use client";

import { useState } from "react";
import Link from "next/link";

export default function FigmaTestPage() {
  const [fileKey, setFileKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    if (!fileKey.trim()) {
      setError("Please enter a Figma file key");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/figma/test-connection?fileKey=${encodeURIComponent(fileKey)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to connect");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to test connection");
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignTokens = async () => {
    if (!fileKey.trim()) {
      setError("Please enter a Figma file key");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/figma/design-tokens?fileKey=${encodeURIComponent(fileKey)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to fetch tokens");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch design tokens");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Figma API Test</h1>
          <p className="text-gray-600">
            Test your Figma API connection and explore your design files
          </p>
        </div>
        <Link
          href="/admin/tools"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition"
        >
          Back to Admin
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Figma File Key
          </label>
          <input
            type="text"
            value={fileKey}
            onChange={(e) => setFileKey(e.target.value)}
            placeholder="abc123def456"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get this from your Figma file URL:{" "}
            <code className="bg-gray-100 px-1 rounded">
              figma.com/file/{"<FILE_KEY>"}/...
            </code>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Testing..." : "Test Connection"}
          </button>
          <button
            onClick={fetchDesignTokens}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Fetching..." : "Get Design Tokens"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-4">Success!</h3>
          <pre className="bg-white p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Available API Endpoints</h3>
        <div className="space-y-2 text-sm">
          <div>
            <code className="bg-white px-2 py-1 rounded">GET /api/figma/test-connection?fileKey=...</code>
            <p className="text-gray-600 mt-1">Test connection to Figma API</p>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded">GET /api/figma/design-tokens?fileKey=...</code>
            <p className="text-gray-600 mt-1">Extract design tokens (colors, typography)</p>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded">GET /api/figma/images?fileKey=...&nodeIds=...</code>
            <p className="text-gray-600 mt-1">Get image URLs for specific nodes</p>
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded">GET /api/figma</code>
            <p className="text-gray-600 mt-1">General Figma API wrapper (existing)</p>
          </div>
        </div>
      </div>
    </main>
  );
}

