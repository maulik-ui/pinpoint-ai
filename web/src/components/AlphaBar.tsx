"use client";

/**
 * Alpha Bar Component
 * 
 * Displays up to 3 featured tools directly under the main search bar on the homepage.
 * Shows both sponsored tools and tools included in the 499 USD listing package.
 */

import { useRouter } from "next/navigation";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ScoreCircle } from "./ScoreCircle";
import ToolLogo from "./ToolLogo";

interface AlphaBarTool {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  companyName?: string | null;
  description?: string | null;
  image?: string;
  isSponsored?: boolean;
  score?: number;
  pricingModel?: string | null;
  pinpoint_score?: number | null;
}

interface AlphaBarProps {
  onSelectTool?: (toolId: string) => void;
  tools?: AlphaBarTool[];
}

// Placeholder data matching Figma design
const placeholderTools = [
  {
    id: "voiceflow",
    name: "Voiceflow",
    slug: "voiceflow",
    logoUrl: null,
    companyName: "Voiceflow Inc.",
    description: "Build and deploy AI agents for customer support",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop",
    isSponsored: true,
    score: 9.4,
    pricingModel: "Freemium"
  },
  {
    id: "perplexity-ai",
    name: "Perplexity AI",
    slug: "perplexity-ai",
    logoUrl: null,
    companyName: "Perplexity AI",
    description: "AI-powered search engine with real-time answers",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    isSponsored: false,
    score: 9.4,
    pricingModel: "Freemium"
  },
  {
    id: "gamma",
    name: "Gamma",
    slug: "gamma",
    logoUrl: null,
    companyName: "Gamma Technologies",
    description: "Create beautiful presentations with AI in seconds",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
    isSponsored: false,
    score: 9.4,
    pricingModel: "Freemium"
  }
];

export function AlphaBar({ onSelectTool, tools }: AlphaBarProps) {
  const router = useRouter();
  
  // Use provided tools or fallback to placeholder
  const displayTools = tools && tools.length > 0 ? tools : placeholderTools;

  const handleToolClick = (toolSlug: string, toolId: string) => {
    if (onSelectTool) {
      onSelectTool(toolId);
    } else {
      router.push(`/tool/${toolSlug}`);
    }
  };

  // Don't render if no tools
  if (!displayTools || displayTools.length === 0) {
    return null;
  }

  return (
    <section className="px-4 md:px-8 py-8 bg-accent/5 border-y border-border/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Image 
            src="/logo.png" 
            alt="Pinpoint AI" 
            width={16} 
            height={16} 
            className="w-4 h-4"
          />
          <h3 className="text-sm tracking-wide" style={{ fontWeight: 500, letterSpacing: '0.05em' }}>
            ALPHA BAR
          </h3>
          <span className="hidden md:inline text-xs text-muted-foreground">Latest tools being tested by the community</span>
          <span className="md:hidden text-xs text-muted-foreground whitespace-nowrap">Latest tools being tested</span>
        </div>

        {/* Tool Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {displayTools.slice(0, 3).map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool.slug, tool.id)}
              className="group bg-card rounded-[16px] overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:shadow-md"
            >
              {/* Image */}
              <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                <ImageWithFallback
                  src={tool.image}
                  alt={tool.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge overlay */}
                <div className="absolute top-3 right-3">
                  {tool.isSponsored ? (
                    <div className="px-2.5 py-1 bg-accent/95 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-primary" strokeWidth={2} />
                      <span className="text-xs text-foreground" style={{ fontWeight: 500 }}>
                        Sponsored
                      </span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 bg-primary/95 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                      <Image 
                        src="/logo.png" 
                        alt="Alpha" 
                        width={12} 
                        height={12} 
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-primary-foreground" style={{ fontWeight: 500 }}>
                        Alpha
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Header Row: Logo + Name + Score */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  {/* Logo + Name + Company + Verified Icon */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <ToolLogo 
                        logoUrl={tool.logoUrl} 
                        toolName={tool.name} 
                        size="md"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl tracking-tight" style={{ fontWeight: 500 }}>
                          {tool.name}
                        </h4>
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                      </div>
                      {tool.companyName && (
                        <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                          {tool.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Circular Score */}
                  <div className="flex-shrink-0">
                    <ScoreCircle score={tool.pinpoint_score ?? tool.score ?? 0} size={56} strokeWidth={5} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                  {tool.description}
                </p>

                {/* Pricing Badge */}
                <div className="inline-block">
                  <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">
                    {tool.pricingModel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Alpha Bar tools are new releases being tested by the community.{" "}
            <Link href="/pricing" className="text-primary hover:underline ml-1">Learn more</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
