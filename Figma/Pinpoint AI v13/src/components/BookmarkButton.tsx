/**
 * Bookmark Button Component
 * 
 * A reusable button to save/unsave tools.
 * Can be added to tool cards, detail pages, etc.
 */

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useSavedTools } from '../hooks/useBilling';

interface BookmarkButtonProps {
  toolId: string;
  toolName: string;
  toolCategory?: string;
  toolImage?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
}

export function BookmarkButton({
  toolId,
  toolName,
  toolCategory,
  toolImage,
  size = 'md',
  variant = 'icon',
  className = '',
}: BookmarkButtonProps) {
  const { isToolSaved, saveTool, unsaveTool } = useSavedTools();
  const [isAnimating, setIsAnimating] = useState(false);

  const saved = isToolSaved(toolId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    
    setIsAnimating(true);
    
    if (saved) {
      await unsaveTool(toolId);
    } else {
      await saveTool({
        toolId,
        toolName,
        toolCategory,
        toolImage,
      });
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
          saved
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
        } ${className}`}
        title={saved ? 'Remove from saved' : 'Save tool'}
      >
        <Bookmark
          className={`${iconSizes[size]} transition-all ${isAnimating ? 'scale-125' : 'scale-100'}`}
          strokeWidth={saved ? 0 : 2}
          fill={saved ? 'currentColor' : 'none'}
        />
        <span className="text-sm" style={{ fontWeight: 500 }}>
          {saved ? 'Saved' : 'Save'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${buttonSizes[size]} rounded-full flex items-center justify-center transition-all ${
        saved
          ? 'bg-primary text-primary-foreground'
          : 'bg-card hover:bg-accent/20 text-muted-foreground hover:text-foreground'
      } ${className}`}
      title={saved ? 'Remove from saved' : 'Save tool'}
    >
      <Bookmark
        className={`${iconSizes[size]} transition-all ${isAnimating ? 'scale-125' : 'scale-100'}`}
        strokeWidth={saved ? 0 : 2}
        fill={saved ? 'currentColor' : 'none'}
      />
    </button>
  );
}
