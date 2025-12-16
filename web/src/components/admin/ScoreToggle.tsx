"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/src/components/ui/switch";

interface ScoreToggleProps {
  toolId: string;
  scoreName: string;
  visible: boolean;
  onToggle?: (scoreName: string, visible: boolean) => void;
}

export function ScoreToggle({ toolId, scoreName, visible, onToggle }: ScoreToggleProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Inject style for red unchecked state
    const styleId = `score-toggle-${scoreName}`;
    let style = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!isVisible) {
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.textContent = `
        [data-score-toggle="${scoreName}"] [data-state="unchecked"] {
          background-color: rgba(196, 106, 74, 0.7) !important;
        }
        [data-score-toggle="${scoreName}"] [data-state="unchecked"]:hover {
          background-color: rgba(196, 106, 74, 0.8) !important;
        }
      `;
    } else {
      // Remove style when visible
      if (style) {
        style.remove();
      }
    }
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isVisible, scoreName]);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/update-score-visibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId,
          scoreName,
          visible: checked,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update score visibility");
      }

      setIsVisible(checked);
      if (onToggle) {
        onToggle(scoreName, checked);
      }
    } catch (error) {
      console.error("Error toggling score visibility:", error);
      // Revert on error
      setIsVisible(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-score-toggle={scoreName}>
      <Switch
        checked={isVisible}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        aria-label={`Toggle ${scoreName} visibility`}
      />
    </div>
  );
}
