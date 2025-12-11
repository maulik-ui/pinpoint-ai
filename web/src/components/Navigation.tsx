"use client";

import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import { HamburgerMenu } from './HamburgerMenu';
import { useTheme } from 'next-themes';

interface NavigationProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
  onLogoClick?: () => void;
  showBackButton?: boolean;
}

export function Navigation({ 
  onBack, 
  onNavigate, 
  onLogoClick, 
  showBackButton = false
}: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <nav className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-card border border-border/30 hover:border-primary/40 flex items-center justify-center transition-all hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={onLogoClick || onBack}
          >
            <Logo size="md" />
          </div>
        </div>
        <HamburgerMenu 
          onNavigate={onNavigate}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setTheme(isDarkMode ? "light" : "dark")}
        />
      </div>
    </nav>
  );
}
