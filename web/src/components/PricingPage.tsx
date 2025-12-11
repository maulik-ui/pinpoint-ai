"use client";

/**
 * Pricing Page Component
 * 
 * Displays all pricing tiers and options for Pinpoint AI:
 * - Free tier
 * - Premium (monthly/yearly)
 * - Founder products (listing, rechecks, Alpha Bar sponsorship)
 */

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ChevronLeft, Package, RefreshCw, TrendingUp } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import AuthButton from './AuthButton';
import { USER_PLANS, FOUNDER_PRODUCTS, formatPrice } from '../lib/billing/plans';
import { useRouter } from 'next/navigation';

interface PricingPageProps {
  onBack?: () => void;
}

export default function PricingPage({ onBack }: PricingPageProps) {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  // Get premium plans based on toggle
  const freePlan = USER_PLANS.find(p => p.id === 'free')!;
  const premiumPlan = isYearly 
    ? USER_PLANS.find(p => p.id === 'premium_yearly')!
    : USER_PLANS.find(p => p.id === 'premium_monthly')!;

  // Group founder products by category
  const toolListing = FOUNDER_PRODUCTS.find(p => p.id === 'new_tool_listing')!;
  const quarterlyRecheck = FOUNDER_PRODUCTS.find(p => p.id === 'quarterly_recheck')!;
  const annualRecheck = FOUNDER_PRODUCTS.find(p => p.id === 'annual_recheck_plan')!;
  const alphaBarSponsorship = FOUNDER_PRODUCTS.find(p => p.id === 'alpha_bar_sponsorship')!;

  const handleGetStarted = (planId: string) => {
    // TODO: Integrate with Stripe checkout
    router.push(`/api/auth/signin?redirect=${encodeURIComponent("/pricing")}`);
  };

  const handleFounderAction = (productId: string) => {
    // TODO: Integrate with Stripe checkout for founder products
    router.push(`/api/auth/signin?redirect=${encodeURIComponent("/pricing")}`);
  };

  // Calculate savings for yearly plan
  const monthlyPrice = USER_PLANS.find(p => p.id === 'premium_monthly')!.price;
  const yearlyPrice = USER_PLANS.find(p => p.id === 'premium_yearly')!.price;
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;
  const monthlyEquivalent = yearlyPrice / 12;

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <Sparkles className="w-10 h-10 text-primary" strokeWidth={1.5} />
              <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>Pinpoint AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">Browse</Link>
            <Link href="/pricing" className="text-foreground font-medium">Pricing</Link>
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl mb-4" style={{ fontWeight: 500, lineHeight: 1.2 }}>
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.6 }}>
          Choose the plan that works for you. Whether you're discovering tools, getting deep insights, or listing your own AI product.
        </p>
      </section>

      {/* User Plans Section */}
      <section className="px-8 pb-16 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl mb-4" style={{ fontWeight: 500 }}>For Users</h2>
          
          {/* Monthly/Yearly Toggle */}
          <div className="inline-flex items-center gap-3 bg-secondary/40 p-1.5 rounded-full">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full transition-all ${
                !isYearly 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ fontWeight: 500 }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full transition-all ${
                isYearly 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ fontWeight: 500 }}
            >
              Yearly
              <span className="ml-2 text-xs bg-accent/30 px-2 py-0.5 rounded-full">Save ${yearlySavings.toFixed(0)}</span>
            </button>
          </div>
        </div>

        {/* User Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card rounded-[24px] border border-border/50 p-8 hover:shadow-md transition-all">
            <div className="mb-6">
              <h3 className="text-2xl mb-2" style={{ fontWeight: 500 }}>{freePlan.name}</h3>
              <p className="text-muted-foreground mb-4">{freePlan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl" style={{ fontWeight: 500 }}>Free</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-3.5 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all mb-6" 
              style={{ fontWeight: 500 }}
            >
              Start for Free
            </button>
            <div className="space-y-3">
              {freePlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-primary/5 border-2 border-primary rounded-[24px] p-8 hover:shadow-lg transition-all relative">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs" style={{ fontWeight: 500 }}>
                MOST POPULAR
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl mb-2" style={{ fontWeight: 500 }}>{premiumPlan.name}</h3>
              <p className="text-muted-foreground mb-4">{premiumPlan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl" style={{ fontWeight: 500 }}>{formatPrice(premiumPlan.price)}</span>
                <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
              </div>
              {isYearly && (
                <p className="text-sm text-primary mt-2">
                  ${monthlyEquivalent.toFixed(2)}/month — Save ${yearlySavings.toFixed(0)} per year
                </p>
              )}
            </div>
            <button 
              onClick={() => handleGetStarted(premiumPlan.id)}
              className="w-full py-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm mb-6" 
              style={{ fontWeight: 500 }}
            >
              Upgrade to Premium
            </button>
            <div className="space-y-3">
              {premiumPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Products Section */}
      <section className="px-8 py-20 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl mb-4" style={{ fontWeight: 500 }}>For Founders</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              List your AI tool, keep it verified and fresh, or get premium visibility on our homepage.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tool Listing */}
            <div className="bg-card rounded-[20px] border border-border/50 p-6 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>{toolListing.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{toolListing.description}</p>
              <div className="mb-4">
                <span className="text-3xl" style={{ fontWeight: 500 }}>{formatPrice(toolListing.price)}</span>
                <span className="text-sm text-muted-foreground ml-1">one-time</span>
              </div>
              <button 
                onClick={() => handleFounderAction(toolListing.id)}
                className="w-full py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm mb-4" 
                style={{ fontWeight: 500 }}
              >
                List Your Tool
              </button>
              <div className="space-y-2">
                {toolListing.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs text-foreground/75">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quarterly Recheck */}
            <div className="bg-card rounded-[20px] border border-border/50 p-6 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>{quarterlyRecheck.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{quarterlyRecheck.description}</p>
              <div className="mb-4">
                <span className="text-3xl" style={{ fontWeight: 500 }}>{formatPrice(quarterlyRecheck.price)}</span>
                <span className="text-sm text-muted-foreground ml-1">per recheck</span>
              </div>
              <button 
                onClick={() => handleFounderAction(quarterlyRecheck.id)}
                className="w-full py-2.5 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all text-sm mb-4" 
                style={{ fontWeight: 500 }}
              >
                Get Recheck
              </button>
              <div className="space-y-2">
                {quarterlyRecheck.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs text-foreground/75">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Annual Recheck Bundle */}
            <div className="bg-card rounded-[20px] border border-primary/30 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full" style={{ fontWeight: 500 }}>
                  BEST VALUE
                </span>
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>{annualRecheck.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{annualRecheck.description}</p>
              <div className="mb-4">
                <span className="text-3xl" style={{ fontWeight: 500 }}>{formatPrice(annualRecheck.price)}</span>
                <span className="text-sm text-muted-foreground ml-1">per year</span>
              </div>
              <button 
                onClick={() => handleFounderAction(annualRecheck.id)}
                className="w-full py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm mb-4" 
                style={{ fontWeight: 500 }}
              >
                Get Annual Plan
              </button>
              <div className="space-y-2">
                {annualRecheck.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs text-foreground/75">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alpha Bar Sponsorship */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-[20px] border border-primary/40 p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>{alphaBarSponsorship.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{alphaBarSponsorship.description}</p>
              <div className="mb-4">
                <span className="text-3xl" style={{ fontWeight: 500 }}>{formatPrice(alphaBarSponsorship.price)}</span>
                <span className="text-sm text-muted-foreground ml-1">per week</span>
              </div>
              <button 
                onClick={() => handleFounderAction(alphaBarSponsorship.id)}
                className="w-full py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm mb-4" 
                style={{ fontWeight: 500 }}
              >
                Book Alpha Bar Slot
              </button>
              <div className="space-y-2">
                {alphaBarSponsorship.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs text-foreground/75">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Founder Note */}
          <div className="mt-12 text-center max-w-3xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[20px] p-8">
              <h3 className="text-lg mb-3" style={{ fontWeight: 500 }}>Why list your tool on Pinpoint AI?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our platform is built for discerning users who value quality and verification. Every tool is scored by humans, 
                ensuring your product reaches an audience that appreciates thorough research and authentic reviews. 
                Unlike algorithmic marketplaces, we curate like a boutique library—giving your tool the spotlight it deserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="px-8 py-20 max-w-4xl mx-auto">
        <h2 className="text-2xl text-center mb-12" style={{ fontWeight: 500 }}>Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div className="border-b border-border/30 pb-6">
            <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>Can I upgrade from Free to Premium anytime?</h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade to Premium at any time. Your new plan takes effect immediately, and you'll have access to all premium features right away.
            </p>
          </div>
          <div className="border-b border-border/30 pb-6">
            <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor Stripe.
            </p>
          </div>
          <div className="border-b border-border/30 pb-6">
            <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>How does the Alpha Bar work?</h3>
            <p className="text-muted-foreground">
              The Alpha Bar is a featured section on our homepage showcasing the newest tools. When you list a tool for $499, you get 3 days of Alpha Bar exposure. 
              For extended visibility, you can purchase a sponsored week for $999, giving you one of three premium spots for 7 days.
            </p>
          </div>
          <div className="pb-6">
            <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>What's included in the Human Verified badge?</h3>
            <p className="text-muted-foreground">
              Our team personally tests and evaluates your tool across multiple dimensions: features, pricing fairness, user experience, 
              and real-world performance. The badge signals to users that your tool has been thoroughly vetted by our experts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-16 bg-primary/10 border-t border-border/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <span style={{ fontWeight: 500 }}>Pinpoint AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Questions about pricing? <a href="#" className="text-primary hover:underline">Contact our team</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
