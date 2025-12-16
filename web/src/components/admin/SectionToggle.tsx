"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/src/components/ui/switch";

interface SectionToggleProps {
  toolId: string;
  section: string;
  visible: boolean;
  onToggle?: (section: string, visible: boolean) => void;
}

export function SectionToggle({ toolId, section, visible, onToggle }: SectionToggleProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Inject style for red unchecked state
    const styleId = `section-toggle-${section}`;
    let style = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!isVisible) {
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.textContent = `
        [data-section-toggle="${section}"] [data-state="unchecked"] {
          background-color: rgba(196, 106, 74, 0.7) !important;
        }
        [data-section-toggle="${section}"] [data-state="unchecked"]:hover {
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
  }, [isVisible, section]);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/update-section-visibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId,
          section,
          visible: checked,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update section visibility");
      }

      setIsVisible(checked);
      if (onToggle) {
        onToggle(section, checked);
      }
    } catch (error) {
      console.error("Error toggling section visibility:", error);
      // Revert on error
      setIsVisible(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-section-toggle={section}>
      <Switch
        checked={isVisible}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        aria-label={`Toggle ${section} section visibility`}
      />
    </div>
  );
}
