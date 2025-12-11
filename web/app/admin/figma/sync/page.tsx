"use client";

import { useState } from "react";
import Link from "next/link";

export default function FigmaSyncPage() {
  const [fileKey, setFileKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(false);
  const [customFrames, setCustomFrames] = useState({
    colors: 'Colors',
    typography: 'Typography',
    spacing: 'Spacing',
  });
  const [showCustomFrames, setShowCustomFrames] = useState(false);

  const syncDesignTokens = async () => {
    if (!fileKey.trim()) {
      setError("Please enter a Figma file key");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/figma/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey: fileKey.trim(),
          frames: customFrames,
          generateCSS: true,
          updateGlobals: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Sync failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to sync design tokens");
    } finally {
      setLoading(false);
    }
  };

  const checkSyncStatus = async () => {
    if (!fileKey.trim()) {
      setError("Please enter a Figma file key");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/figma/sync?fileKey=${encodeURIComponent(fileKey.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Check failed");
      }

      setResult({ status: data });
    } catch (err: any) {
      setError(err.message || "Failed to check sync status");
    } finally {
      setLoading(false);
    }
  };

  const exploreFile = async () => {
    if (!fileKey.trim()) {
      setError("Please enter a Figma file key");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/figma/explore?fileKey=${encodeURIComponent(fileKey.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Explore failed");
      }

      setResult({ exploration: data });
    } catch (err: any) {
      setError(err.message || "Failed to explore file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Figma Design Sync</h1>
          <p className="text-gray-600">
            Sync design tokens (colors, typography, spacing) from Figma to your app
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
            placeholder="Enter file key or leave empty to use .env.local"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get this from your Figma file URL or use the one from .env.local
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={syncDesignTokens}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Syncing..." : "Sync Design Tokens"}
          </button>
          <button
            onClick={exploreFile}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Exploring..." : "Explore File Structure"}
          </button>
          <button
            onClick={checkSyncStatus}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Status
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSync"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="autoSync" className="text-sm">
              Enable auto-sync (syncs every 5 minutes)
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="customFrames"
              checked={showCustomFrames}
              onChange={(e) => setShowCustomFrames(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="customFrames" className="text-sm">
              Use custom frame names
            </label>
          </div>

          {showCustomFrames && (
            <div className="grid grid-cols-3 gap-3 pl-6">
              <div>
                <label className="block text-xs font-medium mb-1">Colors Frame</label>
                <input
                  type="text"
                  value={customFrames.colors}
                  onChange={(e) => setCustomFrames({ ...customFrames, colors: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  placeholder="Colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Typography Frame</label>
                <input
                  type="text"
                  value={customFrames.typography}
                  onChange={(e) => setCustomFrames({ ...customFrames, typography: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  placeholder="Typography"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Spacing Frame</label>
                <input
                  type="text"
                  value={customFrames.spacing}
                  onChange={(e) => setCustomFrames({ ...customFrames, spacing: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  placeholder="Spacing"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-green-800 mb-4">
            ✅ Sync Successful!
          </h3>

          {result.metadata && (
            <div className="bg-white p-4 rounded-md">
              <h4 className="font-medium mb-2">Sync Metadata</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">File:</span>{" "}
                  <span className="font-medium">{result.metadata.fileName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Synced:</span>{" "}
                  <span className="font-medium">
                    {new Date(result.metadata.syncedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Colors:</span>{" "}
                  <span className="font-medium">
                    {result.metadata.tokenCounts.colors}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Typography:</span>{" "}
                  <span className="font-medium">
                    {result.metadata.tokenCounts.typography}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Spacing:</span>{" "}
                  <span className="font-medium">
                    {result.metadata.tokenCounts.spacing}
                  </span>
                </div>
              </div>
            </div>
          )}

          {result.tokens && (
            <div className="space-y-4">
              {Object.keys(result.tokens.colors || {}).length > 0 && (
                <div className="bg-white p-4 rounded-md">
                  <h4 className="font-medium mb-2">Colors</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(result.tokens.colors).map(([name, value]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: value as string }}
                        />
                        <div className="text-sm">
                          <div className="font-medium">{name}</div>
                          <div className="text-gray-500 text-xs">{value as string}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.css && (
                <div className="bg-white p-4 rounded-md">
                  <h4 className="font-medium mb-2">Generated CSS</h4>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64">
                    {result.css}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.css);
                      alert("CSS copied to clipboard!");
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Copy CSS
                  </button>
                </div>
              )}
            </div>
          )}

          {result.status && (
            <div className="bg-white p-4 rounded-md">
              <h4 className="font-medium mb-2">File Status</h4>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-600">File:</span> {result.status.fileName}
                </div>
                <div>
                  <span className="text-gray-600">Last Modified:</span>{" "}
                  {new Date(result.status.lastModified).toLocaleString()}
                </div>
                <div>
                  <span className="text-gray-600">Components:</span>{" "}
                  {result.status.components}
                </div>
                <div>
                  <span className="text-gray-600">Styles:</span> {result.status.styles}
                </div>
              </div>
            </div>
          )}

          {result.exploration && (
            <div className="bg-white p-4 rounded-md space-y-4">
              <h4 className="font-medium mb-2">File Structure</h4>
              
              <div>
                <div className="text-sm mb-2">
                  <span className="text-gray-600">Total Frames:</span>{" "}
                  <span className="font-medium">{result.exploration.structure.totalFrames}</span>
                </div>
                <div className="text-sm mb-4">
                  <span className="text-gray-600">File:</span>{" "}
                  <span className="font-medium">{result.exploration.file.name}</span>
                </div>
              </div>

              {result.exploration.suggestions.colorFrames.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">🎨 Potential Color Frames:</h5>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {result.exploration.suggestions.colorFrames.map((frame: any) => (
                      <li key={frame.id}>
                        <span className="font-medium">"{frame.name}"</span> ({frame.childrenCount} children)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.exploration.suggestions.typographyFrames.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">📝 Potential Typography Frames:</h5>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {result.exploration.suggestions.typographyFrames.map((frame: any) => (
                      <li key={frame.id}>
                        <span className="font-medium">"{frame.name}"</span> ({frame.childrenCount} children)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.exploration.suggestions.spacingFrames.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">📏 Potential Spacing Frames:</h5>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {result.exploration.suggestions.spacingFrames.map((frame: any) => (
                      <li key={frame.id}>
                        <span className="font-medium">"{frame.name}"</span> ({frame.childrenCount} children)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.exploration.suggestions.colorFrames.length === 0 &&
               result.exploration.suggestions.typographyFrames.length === 0 &&
               result.exploration.suggestions.spacingFrames.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ No frames found with "color", "typography", or "spacing" in the name.
                  </p>
                  <p className="text-xs text-yellow-700 mb-2">All frame names in your file:</p>
                  <ul className="list-disc list-inside text-xs text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                    {result.exploration.allFrameNames.map((name: string) => (
                      <li key={name}>"{name}"</li>
                    ))}
                  </ul>
                  <p className="text-xs text-yellow-700 mt-2">
                    💡 Tip: Create frames named exactly "Colors", "Typography", and "Spacing" in your Figma file.
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <h5 className="font-medium text-sm mb-2">All Frames ({result.exploration.structure.frames.length}):</h5>
                <div className="max-h-48 overflow-y-auto">
                  {result.exploration.structure.frames.slice(0, 20).map((frame: any) => (
                    <div key={frame.id} className="text-xs py-1">
                      <span className="font-medium">"{frame.name}"</span> - {frame.childrenCount} children
                    </div>
                  ))}
                  {result.exploration.structure.frames.length > 20 && (
                    <div className="text-xs text-gray-500 mt-1">
                      ... and {result.exploration.structure.frames.length - 20} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-3">How It Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Organize your Figma file with frames named "Colors", "Typography", and
            "Spacing"
          </li>
          <li>Click "Sync Design Tokens" to extract tokens from Figma</li>
          <li>
            The sync will generate CSS variables that you can use in your app
          </li>
          <li>
            Enable auto-sync to automatically sync changes every 5 minutes
          </li>
        </ol>
      </div>
    </main>
  );
}

