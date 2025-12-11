"use client";

import { useEffect, useState } from "react";

interface AutoSyncProps {
  fileKey: string;
  intervalMinutes?: number;
  onSyncComplete?: (result: any) => void;
  onSyncError?: (error: Error) => void;
}

export default function FigmaAutoSync({
  fileKey,
  intervalMinutes = 5,
  onSyncComplete,
  onSyncError,
}: AutoSyncProps) {
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch("/api/figma/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey,
          generateCSS: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Sync failed");
      }

      setLastSync(new Date());
      onSyncComplete?.(data);
    } catch (err: any) {
      const errorMessage = err.message || "Sync failed";
      setError(errorMessage);
      onSyncError?.(err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!fileKey) return;

    // Initial sync
    performSync();

    // Set up interval
    const intervalMs = intervalMinutes * 60 * 1000;
    const interval = setInterval(performSync, intervalMs);

    return () => clearInterval(interval);
  }, [fileKey, intervalMinutes]);

  if (!fileKey) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-3 text-xs">
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <>
            <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span>Syncing...</span>
          </>
        ) : error ? (
          <>
            <span className="text-red-600">⚠️</span>
            <span className="text-red-600">Sync failed</span>
          </>
        ) : lastSync ? (
          <>
            <span className="text-green-600">✓</span>
            <span>
              Synced {lastSync.toLocaleTimeString()}
            </span>
          </>
        ) : (
          <span>Setting up sync...</span>
        )}
      </div>
      {error && (
        <div className="mt-1 text-red-600 text-xs">{error}</div>
      )}
    </div>
  );
}

