/**
 * Alpha Bar Component
 * 
 * Displays up to 3 featured tools directly under the main search bar on the homepage.
 * Shows both sponsored tools and tools included in the 499 USD listing package.
 */

import { TrendingUp, ExternalLink, CheckCircle, CheckCircle2 } from 'lucide-react';
import { useAlphaBarSlots } from '../hooks/useBilling';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScoreCircle } from './ScoreCircle';
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";

interface AlphaBarProps {
  onSelectTool?: (toolId: string) => void;
}

export function AlphaBar({ onSelectTool }: AlphaBarProps) {
  const { slots, isLoading } = useAlphaBarSlots();

  if (isLoading || slots.length === 0) {
    return null;
  }

  return (
    <section className="px-4 md:px-8 py-8 bg-accent/5 border-y border-border/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src={pinpointLogo} alt="Pinpoint AI" className="w-4 h-4" />
          <h3 className="text-sm tracking-wide" style={{ fontWeight: 500, letterSpacing: '0.05em' }}>
            ALPHA BAR
          </h3>
          <span className="hidden md:inline text-xs text-muted-foreground">Latest tools being tested by the community</span>
          <span className="md:hidden text-xs text-muted-foreground whitespace-nowrap">Latest tools being tested</span>
        </div>

        {/* Tool Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => onSelectTool?.(slot.toolId)}
              className="group bg-card rounded-[16px] overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:shadow-md"
            >
              {/* Image */}
              <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                <ImageWithFallback
                  src={slot.toolImage || ''}
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
                      <img src={pinpointLogo} alt="Alpha" className="w-3 h-3" />
                      <span className="text-xs text-primary-foreground" style={{ fontWeight: 500 }}>
                        Alpha
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Header Row: Name + Score */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  {/* Name + Company + Verified Icon */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl tracking-tight" style={{ fontWeight: 500 }}>
                        {slot.toolName}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                    </div>
                    {slot.companyName && (
                      <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                        {slot.companyName}
                      </p>
                    )}
                  </div>
                  
                  {/* Circular Score */}
                  <div className="flex-shrink-0">
                    <ScoreCircle score={9.4} size={56} strokeWidth={5} textSize="text-base" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                  {slot.toolDescription}
                </p>

                {/* Pricing Badge */}
                <div className="inline-block">
                  <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">Freemium</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Alpha Bar tools are new releases being tested by the community. 
            <a href="/pricing" className="text-primary hover:underline ml-1">Learn more</a>
          </p>
        </div>
      </div>
    </section>
  );
}