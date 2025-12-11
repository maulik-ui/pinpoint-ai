"use client";

import { useState } from 'react';
import { Save, Edit2 } from 'lucide-react';

interface SimilarwebRankingEditorProps {
  reportId: string | null;
  toolId: string;
  globalRank: number | null | undefined;
  countryRank: number | null | undefined;
  industryRank: number | null | undefined;
  industry: string | null | undefined;
  onUpdate?: () => void;
}

export function SimilarwebRankingEditor({
  reportId,
  toolId,
  globalRank: initialGlobalRank,
  countryRank: initialCountryRank,
  industryRank: initialIndustryRank,
  industry: initialIndustry,
  onUpdate,
}: SimilarwebRankingEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [globalRank, setGlobalRank] = useState<string>(initialGlobalRank?.toString() || '');
  const [countryRank, setCountryRank] = useState<string>(initialCountryRank?.toString() || '');
  const [industryRank, setIndustryRank] = useState<string>(initialIndustryRank?.toString() || '');
  const [industry, setIndustry] = useState<string>(initialIndustry || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/similarweb/update-ranks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          toolId,
          globalRank: globalRank ? parseInt(globalRank) : null,
          countryRank: countryRank ? parseInt(countryRank) : null,
          industryRank: industryRank ? parseInt(industryRank) : null,
          industry: industry.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update rankings');
      }

      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setGlobalRank(initialGlobalRank?.toString() || '');
    setCountryRank(initialCountryRank?.toString() || '');
    setIndustryRank(initialIndustryRank?.toString() || '');
    setIndustry(initialIndustry || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-secondary/30 rounded-[12px] p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold" style={{ fontWeight: 600 }}>
          Rankings (Editable)
        </h4>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Global Rank</label>
            <input
              type="number"
              value={globalRank}
              onChange={(e) => setGlobalRank(e.target.value)}
              placeholder="e.g., 12345"
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Country Rank</label>
            <input
              type="number"
              value={countryRank}
              onChange={(e) => setCountryRank(e.target.value)}
              placeholder="e.g., 5678"
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Industry Rank</label>
            <input
              type="number"
              value={industryRank}
              onChange={(e) => setIndustryRank(e.target.value)}
              placeholder="e.g., 234"
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Industry Name</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Technology"
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Global Rank</div>
              {initialGlobalRank !== null && initialGlobalRank !== undefined ? (
                <div className="text-lg font-bold">#{initialGlobalRank.toLocaleString()}</div>
              ) : (
                <div className="text-sm text-muted-foreground">Not set</div>
              )}
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Country Rank</div>
              {initialCountryRank !== null && initialCountryRank !== undefined ? (
                <div className="text-lg font-bold">#{initialCountryRank.toLocaleString()}</div>
              ) : (
                <div className="text-sm text-muted-foreground">Not set</div>
              )}
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Industry Rank</div>
              {initialIndustryRank !== null && initialIndustryRank !== undefined ? (
                <>
                  <div className="text-lg font-bold">#{initialIndustryRank.toLocaleString()}</div>
                  {initialIndustry && (
                    <div className="text-xs text-muted-foreground mt-1">{initialIndustry}</div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Not set</div>
              )}
            </div>
          </div>
          {(!initialGlobalRank && !initialCountryRank && !initialIndustryRank) && (
            <div className="text-sm text-muted-foreground text-center pt-2">No ranking data. Click Edit to add.</div>
          )}
        </div>
      )}
    </div>
  );
}

