# Integration Examples

This document provides practical examples of integrating the pricing system components into your Pinpoint AI application.

## Table of Contents

1. [Adding Bookmark Button to Homepage](#adding-bookmark-button-to-homepage)
2. [Adding Bookmark to Tool Detail Page](#adding-bookmark-to-tool-detail-page)
3. [Adding Premium Feature Gates](#adding-premium-feature-gates)
4. [Adding Upgrade Prompts](#adding-upgrade-prompts)
5. [Adding Founder Badges](#adding-founder-badges)

---

## Adding Bookmark Button to Homepage

Update `/App.tsx` to add bookmark buttons to the featured tools section:

```tsx
// At the top of App.tsx
import { BookmarkButton } from "./components/BookmarkButton";

// In the return statement, update the featured tools mapping:

<div className="grid md:grid-cols-3 gap-8">
  {featuredTools.map((tool) => (
    <div
      key={tool.name}
      className="group bg-card rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 cursor-pointer relative"
    >
      {/* Add bookmark button in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <BookmarkButton
          toolId={tool.name.toLowerCase().replace(/\s+/g, '-')}
          toolName={tool.name}
          toolCategory={tool.category}
          toolImage={tool.image}
          size="sm"
        />
      </div>

      {/* Rest of the card remains the same */}
      <div 
        onClick={() => setCurrentPage('tool')}
        className="cursor-pointer"
      >
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <ImageWithFallback
            src={tool.image}
            alt={tool.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 space-y-3">
          {/* ... rest of card content ... */}
        </div>
      </div>
    </div>
  ))}
</div>
```

**Result:** Each featured tool card now has a bookmark button in the top-right corner that doesn't interfere with the card click.

---

## Adding Bookmark to Tool Detail Page

Update `/components/ToolPage.tsx` to add a prominent bookmark button:

```tsx
// At the top of ToolPage.tsx
import { BookmarkButton } from "./BookmarkButton";

// In the hero section, add the bookmark button next to the external link button:

<div className="flex items-center gap-4 mb-8">
  <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-sm">
    <ExternalLink className="w-5 h-5" />
    <span>Visit Website</span>
  </button>

  {/* Add bookmark button */}
  <BookmarkButton
    toolId="chatgpt" // Replace with actual tool ID
    toolName="ChatGPT" // Replace with actual tool name
    toolCategory="Conversational AI"
    toolImage="https://..."
    variant="button"
    size="lg"
  />

  <button className="flex items-center gap-2 px-6 py-3 border-2 border-border rounded-full hover:border-primary/50 transition-all">
    <Play className="w-5 h-5" />
    <span>Try Demo</span>
  </button>
</div>
```

**Result:** Users can save the tool directly from the detail page with a clear, prominent button.

---

## Adding Premium Feature Gates

Create a reusable gate component to lock premium features:

### Step 1: Create PremiumGate Component

```tsx
// /components/PremiumGate.tsx
import { useCurrentUserPlan } from '../hooks/useBilling';
import { Lock, Crown } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
}

export function PremiumGate({ children, fallback, featureName = 'this feature' }: PremiumGateProps) {
  const { isPremium } = useCurrentUserPlan();

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-sm">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl mb-2" style={{ fontWeight: 500 }}>
            Premium Feature
          </h3>
          <p className="text-muted-foreground mb-6">
            Upgrade to Premium to access {featureName} and unlock deep insights for all AI tools.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = '#pricing'}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all"
              style={{ fontWeight: 500 }}
            >
              Upgrade to Premium
            </button>
            <button className="px-6 py-3 border-2 border-border rounded-full hover:border-primary/50 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Use PremiumGate in Tool Detail Page

```tsx
// In /components/ToolPage.tsx
import { PremiumGate } from './PremiumGate';

// Wrap premium sections
<PremiumGate featureName="sentiment analysis">
  <section className="px-8 py-16">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl mb-8">Sentiment Analysis</h2>
      {/* Sentiment charts and data */}
    </div>
  </section>
</PremiumGate>

<PremiumGate featureName="market worth estimates">
  <section className="px-8 py-16 bg-secondary/40">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl mb-8">Market Worth Analysis</h2>
      {/* Market data */}
    </div>
  </section>
</PremiumGate>
```

**Result:** Premium features are visually locked with an upgrade prompt overlay.

---

## Adding Upgrade Prompts

Create inline upgrade prompts that fit the design:

```tsx
// /components/UpgradePrompt.tsx
import { TrendingUp, Crown } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  benefit: string;
  compact?: boolean;
}

export function UpgradePrompt({ feature, benefit, compact = false }: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-[16px] p-4 flex items-center gap-4">
        <Crown className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm">
            <span style={{ fontWeight: 500 }}>{feature}</span> is a Premium feature. 
            <button 
              onClick={() => window.location.href = '#pricing'}
              className="text-primary hover:underline ml-1"
            >
              Upgrade now
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[20px] border border-primary/30 p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>
        Unlock {feature}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {benefit}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => window.location.href = '#pricing'}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all"
          style={{ fontWeight: 500 }}
        >
          Upgrade to Premium
        </button>
        <button className="px-6 py-3 border-2 border-border rounded-full hover:border-primary/50 transition-all">
          See Plans
        </button>
      </div>
    </div>
  );
}
```

**Usage:**

```tsx
// Compact version in lists
<UpgradePrompt 
  feature="Sentiment Breakdown"
  benefit=""
  compact
/>

// Full version in sections
<UpgradePrompt 
  feature="Market Worth Estimates"
  benefit="Get AI-powered market value estimates and see how tools stack up financially against competitors."
/>
```

---

## Adding Founder Badges

Show founder status and verified badges on tools:

```tsx
// /components/ToolBadges.tsx
import { CheckCircle2, Crown, Sparkles } from 'lucide-react';

interface ToolBadgesProps {
  isVerified?: boolean;
  isFounder?: boolean;
  inAlphaBar?: boolean;
}

export function ToolBadges({ isVerified, isFounder, inAlphaBar }: ToolBadgesProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isVerified && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="text-xs" style={{ fontWeight: 500 }}>
            Human Verified
          </span>
        </div>
      )}

      {isFounder && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/20 text-foreground rounded-full">
          <Crown className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs" style={{ fontWeight: 500 }}>
            Founder Listed
          </span>
        </div>
      )}

      {inAlphaBar && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-primary/20 to-accent/20 text-foreground rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs" style={{ fontWeight: 500 }}>
            Alpha Bar
          </span>
        </div>
      )}
    </div>
  );
}
```

**Usage in tool cards:**

```tsx
<div className="p-6 space-y-3">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h3 className="text-lg" style={{ fontWeight: 500 }}>{tool.name}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{tool.category}</p>
      
      {/* Add badges */}
      <div className="mt-3">
        <ToolBadges 
          isVerified={true}
          isFounder={false}
          inAlphaBar={false}
        />
      </div>
    </div>
  </div>
</div>
```

---

## Complete Integration Example

Here's how everything works together in a tool card:

```tsx
import { BookmarkButton } from './components/BookmarkButton';
import { ToolBadges } from './components/ToolBadges';
import { useCurrentUserPlan } from './hooks/useBilling';

function ToolCard({ tool }) {
  const { isPremium } = useCurrentUserPlan();

  return (
    <div className="group bg-card rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all border border-border/50 relative">
      {/* Bookmark button */}
      <div className="absolute top-4 right-4 z-10">
        <BookmarkButton
          toolId={tool.id}
          toolName={tool.name}
          toolCategory={tool.category}
          toolImage={tool.image}
          size="sm"
        />
      </div>

      {/* Tool image */}
      <div className="aspect-[4/3] overflow-hidden bg-muted cursor-pointer" onClick={() => navigate(`/tool/${tool.id}`)}>
        <img
          src={tool.image}
          alt={tool.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Tool content */}
      <div className="p-6 space-y-3">
        <div>
          <h3 className="text-lg mb-1" style={{ fontWeight: 500 }}>{tool.name}</h3>
          <p className="text-sm text-muted-foreground">{tool.category}</p>
          
          {/* Badges */}
          <div className="mt-3">
            <ToolBadges 
              isVerified={tool.isVerified}
              isFounder={tool.isFounderListed}
              inAlphaBar={tool.inAlphaBar}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {tool.description}
        </p>

        {/* Score display - Premium feature teaser */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div>
            <span className="text-2xl" style={{ fontWeight: 500 }}>
              {tool.score}
            </span>
            <span className="text-sm text-muted-foreground ml-1">/ 100</span>
          </div>

          {!isPremium && (
            <button 
              onClick={() => navigate('/pricing')}
              className="text-xs text-primary hover:underline"
            >
              See detailed breakdown →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Progressive Enhancement

Show users what they're missing at each tier:

```tsx
function FeatureComparison() {
  const { currentPlan, isPremium } = useCurrentUserPlan();

  return (
    <div className="space-y-4">
      {/* Always visible */}
      <FeatureSection title="Basic Tool Info" available={true}>
        <ToolBasicInfo />
      </FeatureSection>

      {/* Locked for free users */}
      <FeatureSection 
        title="Sentiment Analysis" 
        available={isPremium}
        promptText="Upgrade to Premium"
      >
        <SentimentBreakdown />
      </FeatureSection>

      <FeatureSection 
        title="Market Worth" 
        available={isPremium}
        promptText="Upgrade to Premium"
      >
        <MarketWorthChart />
      </FeatureSection>
    </div>
  );
}

function FeatureSection({ title, available, promptText, children }) {
  if (available) {
    return (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    );
  }

  return (
    <section className="relative">
      <h2 className="flex items-center gap-2">
        {title}
        <Lock className="w-4 h-4 text-muted-foreground" />
      </h2>
      <div className="blur-sm opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full">
          {promptText}
        </button>
      </div>
    </section>
  );
}
```

---

## Navigation Integration

Update navigation to show user status:

```tsx
// In navigation bar
function NavBar() {
  const { isPremium, userProfile } = useCurrentUserPlan();

  return (
    <nav className="px-8 py-6">
      <div className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          <NavLink href="/browse">Browse</NavLink>
          <NavLink href="/categories">Categories</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          
          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-accent/20 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              {isPremium && <Crown className="w-4 h-4 text-primary" />}
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-64 bg-card rounded-[16px] shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-4 border-b border-border/30">
                <p style={{ fontWeight: 500 }}>{userProfile?.displayName}</p>
                <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                {isPremium && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                    <Crown className="w-3 h-3" />
                    <span>Premium Member</span>
                  </div>
                )}
              </div>
              <div className="p-2">
                <MenuItem href="/profile">Profile</MenuItem>
                <MenuItem href="/saved">Saved Tools</MenuItem>
                <MenuItem href="/settings">Settings</MenuItem>
                {!isPremium && (
                  <MenuItem href="/pricing" highlight>
                    Upgrade to Premium
                  </MenuItem>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

---

## Key Takeaways

1. **Bookmark buttons** work anywhere - just pass tool data
2. **Premium gates** create clear upgrade paths
3. **Badges** communicate value and status
4. **Progressive enhancement** shows users what they're missing
5. **Consistent design** maintains the cozy, earthy aesthetic

All components are designed to work together seamlessly while maintaining the Pinpoint AI brand identity.

---

**Last Updated:** November 21, 2025
