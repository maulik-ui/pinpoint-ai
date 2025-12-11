/**
 * Navigation Component
 * 
 * Reusable navigation bar for all pages
 */

import { ArrowLeft } from 'lucide-react';
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import { HamburgerMenu } from './HamburgerMenu';

interface NavigationProps {
  onBack?: () => void;
  onNavigate: (page: string) => void;
  onLogoClick?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  showBackButton?: boolean;
}

export function Navigation({ 
  onBack, 
  onNavigate, 
  onLogoClick, 
  isDarkMode, 
  onToggleDarkMode,
  showBackButton = false
}: NavigationProps) {
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
            <img src={pinpointLogo} alt="Pinpoint AI" className="w-10 h-10" />
          </div>
        </div>
        <HamburgerMenu 
          onNavigate={onNavigate}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
      </div>
    </nav>
  );
}