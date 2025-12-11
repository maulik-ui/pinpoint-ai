/**
 * Blog Page Component
 * 
 * Placeholder for the blog page
 */

import { ArrowLeft } from 'lucide-react';
import { Navigation } from './Navigation';

interface BlogPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function BlogPage({ onBack, onNavigate, isDarkMode = false, onToggleDarkMode = () => {} }: BlogPageProps) {
  return (
    <div className="min-h-screen pb-16">
      {/* Navigation */}
      <Navigation 
        onBack={onBack}
        onNavigate={(page) => {
          if (page === 'home' && onBack) {
            onBack();
          } else if (onNavigate) {
            onNavigate(page);
          }
        }}
        onLogoClick={onBack}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        showBackButton={false}
      />

      {/* Content */}
      <div className="px-4 md:px-8 py-16 max-w-4xl mx-auto text-center">
        <div className="space-y-6">
          <h2 className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>Coming Soon</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Our blog is currently under construction. Check back soon for AI tool insights, reviews, and industry updates.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-primary/10 text-primary rounded-[12px] hover:bg-primary/20 transition-all duration-300 hover:shadow-sm"
            style={{ fontWeight: 500 }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}