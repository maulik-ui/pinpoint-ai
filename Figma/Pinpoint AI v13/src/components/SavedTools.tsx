/**
 * Saved Tools Component
 * 
 * Displays user's bookmarked/saved tools with options to view or remove them.
 */

import { Bookmark, X } from 'lucide-react';
import { useSavedTools } from '../hooks/useBilling';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SavedToolsProps {
  onSelectTool?: (toolId: string) => void;
}

export function SavedTools({ onSelectTool }: SavedToolsProps) {
  const { savedTools, unsaveTool, isLoading } = useSavedTools();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (savedTools.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>No Saved Tools Yet</h3>
          <p className="text-sm text-muted-foreground">
            Start bookmarking tools you're interested in to keep track of them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl mb-2" style={{ fontWeight: 500 }}>Saved Tools</h2>
        <p className="text-muted-foreground">
          {savedTools.length} {savedTools.length === 1 ? 'tool' : 'tools'} saved
        </p>
      </div>

      <div className="space-y-3">
        {savedTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-card rounded-[16px] border border-border/50 p-4 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              {/* Tool Image */}
              {tool.toolImage && (
                <div 
                  className="w-20 h-20 rounded-[12px] overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                  onClick={() => onSelectTool?.(tool.toolId)}
                >
                  <ImageWithFallback
                    src={tool.toolImage}
                    alt={tool.toolName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Tool Info */}
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onSelectTool?.(tool.toolId)}
              >
                <h3 className="text-base mb-1" style={{ fontWeight: 500 }}>
                  {tool.toolName}
                </h3>
                {tool.toolCategory && (
                  <p className="text-sm text-muted-foreground">
                    {tool.toolCategory}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Saved {new Date(tool.savedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  unsaveTool(tool.toolId);
                }}
                className="w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from saved"
              >
                <X className="w-4 h-4 text-destructive" strokeWidth={2} />
              </button>
            </div>

            {/* Notes if any */}
            {tool.notes && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-sm text-foreground/75 italic">"{tool.notes}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
