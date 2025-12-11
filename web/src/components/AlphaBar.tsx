"use client";

/**
 * Alpha Bar Component
 * 
 * Displays up to 3 featured tools directly under the main search bar on the homepage.
 * Shows both sponsored tools and tools included in the 499 USD listing package.
 */

import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp } from "lucide-react";
import { useAlphaBarSlots } from "../hooks/useBilling";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AlphaBarProps {
  onSelectTool?: (toolId: string) => void;
}

export function AlphaBar({ onSelectTool }: AlphaBarProps) {
  const router = useRouter();
  const { slots, isLoading } = useAlphaBarSlots();

  // Show loading state briefly, but always show content (including mock data)
  if (isLoading) {
    return null; // Brief loading state
  }

  // If no slots (shouldn't happen due to mock fallback, but just in case)
  if (slots.length === 0) {
    return null;
  }

  const handleToolClick = (toolSlug: string, toolId: string, slotId: string) => {
    // Track click analytics (you can implement this later)
    // For now, just navigate to the tool
    if (onSelectTool) {
      onSelectTool(toolId);
    } else {
      router.push(`/tool/${toolSlug}`);
    }
  };

  return (
    <section className="px-8 py-8 bg-accent/5 border-y border-border/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
          <h3 className="text-sm tracking-wide" style={{ fontWeight: 500, letterSpacing: "0.05em" }}>
            ALPHA BAR
          </h3>
          <span className="text-xs text-muted-foreground">— Latest tools being tested by the community</span>
        </div>

        {/* Tool Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => handleToolClick(slot.toolSlug, slot.toolId, slot.id)}
              className="group bg-card rounded-[16px] overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:shadow-md"
            >
              {/* Image */}
              <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                <ImageWithFallback
                  src={slot.toolImage || ""}
                  alt={slot.toolName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge overlay */}
                <div className="absolute top-3 right-3">
                  {slot.isSponsored ? (
                    <div className="px-2.5 py-1 bg-accent/95 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-primary" strokeWidth={2} />
                      <span className="text-xs text-foreground" style={{ fontWeight: 500 }}>
                        Sponsored
                      </span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 bg-primary/95 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary-foreground" strokeWidth={2} />
                      <span className="text-xs text-primary-foreground" style={{ fontWeight: 500 }}>
                        Alpha
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="text-base mb-1" style={{ fontWeight: 500 }}>
                  {slot.toolName}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {slot.toolDescription || "AI-powered tool"}
                </p>

                {/* Analytics preview (only for sponsored) */}
                {slot.isSponsored && slot.analytics && (
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span style={{ fontWeight: 500 }}>{slot.analytics.impressions.toLocaleString()}</span>
                      <span>views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span style={{ fontWeight: 500 }}>{slot.analytics.clickThroughRate}%</span>
                      <span>CTR</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Alpha Bar tools are new releases being tested by the community.{" "}
            <a href="/pricing" className="text-primary hover:underline ml-1">Learn more</a>
          </p>
        </div>
      </div>
    </section>
  );
}
