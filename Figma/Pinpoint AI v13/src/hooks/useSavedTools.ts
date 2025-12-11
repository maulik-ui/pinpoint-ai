import { useState, useEffect } from 'react';

interface SavedTool {
  name: string;
  description: string;
  score: number;
  pricing: string;
  logo: string;
}

export function useSavedTools() {
  const [savedTools, setSavedTools] = useState<SavedTool[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinpoint-saved-tools');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Save to localStorage whenever savedTools changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pinpoint-saved-tools', JSON.stringify(savedTools));
    }
  }, [savedTools]);

  const toggleSaveTool = (tool: SavedTool) => {
    setSavedTools(prev => {
      const isAlreadySaved = prev.some(saved => saved.name === tool.name);
      if (isAlreadySaved) {
        // Remove from saved
        return prev.filter(saved => saved.name !== tool.name);
      } else {
        // Add to saved
        return [...prev, tool];
      }
    });
  };

  const isSaved = (toolName: string) => {
    return savedTools.some(saved => saved.name === toolName);
  };

  return {
    savedTools,
    toggleSaveTool,
    isSaved,
  };
}
