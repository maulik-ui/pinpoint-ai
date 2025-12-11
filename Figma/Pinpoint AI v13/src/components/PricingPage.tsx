/**
 * Pricing Page Component
 * 
 * Displays all pricing tiers and options for Pinpoint AI:
 * - Free tier
 * - Premium (monthly/yearly)
 * - Founder products (listing, rechecks, Alpha Bar sponsorship)
 */

import { useState } from 'react';
import { Check } from 'lucide-react';
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import { ContactForm } from './ContactForm';
import { ToolSubmissionModal } from './ToolSubmissionModal';
import { Navigation } from './Navigation';
import { USER_PLANS, FOUNDER_PRODUCTS } from '../lib/billing/plans';

interface PricingPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function PricingPage({ onBack, onNavigate, isDarkMode = false, onToggleDarkMode = () => {} }: PricingPageProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [toolSubmissionModalOpen, setToolSubmissionModalOpen] = useState(false);

  // Get premium plans based on toggle
  const freePlan = USER_PLANS.find(p => p.id === 'free')!;
  const premiumPlan = isYearly 
    ? USER_PLANS.find(p => p.id === 'premium_yearly')!
    : USER_PLANS.find(p => p.id === 'premium_monthly')!;

  // Group founder products by category
  const toolListing = FOUNDER_PRODUCTS.find(p => p.id === 'tool_listing')!;
  const quarterlyRecheck = FOUNDER_PRODUCTS.find(p => p.id === 'quarterly_recheck')!;
  const annualRecheck = FOUNDER_PRODUCTS.find(p => p.id === 'annual_recheck_bundle')!;
  const alphaBarSponsorship = FOUNDER_PRODUCTS.find(p => p.id === 'alpha_bar_sponsorship')!;

  const handlePremiumUpgrade = () => {
    // Will connect to actual payment page later
  };

  const handleRecheckPurchase = () => {
    // Will connect to actual payment page later
  };

  const handleToolListing = () => {
    if (onNavigate) {
      onNavigate('submit-tool');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation 
        onBack={onBack}
        onNavigate={(page) => {
          if (page === 'contact') {
            setContactFormOpen(true);
          } else if (page === 'home' && onBack) {
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

      {/* Hero Section */}
      <section className="px-4 md:px-8 py-20 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl mb-4" style={{ fontWeight: 500, lineHeight: 1.2 }}>
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.6 }}>
          Choose the plan that works for you. Whether you're discovering tools, getting deep insights, or listing your own AI product.
        </p>
      </section>

      {/* User Plans Section */}
      <section className="px-4 md:px-8 pb-16 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl mb-4" style={{ fontWeight: 500 }}>For Researchers</h2>
          
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
              <span className="ml-2 text-xs bg-accent/30 px-2 py-0.5 rounded-full">Save 30%</span>
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

            <button className="w-full py-3.5 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all mb-6" style={{ fontWeight: 500 }}>
              {freePlan.ctaText}
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
                <span className="text-4xl" style={{ fontWeight: 500 }}>${premiumPlan.price}</span>
                <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
              </div>
              {isYearly && (
                <p className="text-sm text-primary mt-2">
                  $20.75/month — Save $99 per year
                </p>
              )}
            </div>

            <button 
              onClick={handlePremiumUpgrade}
              className="w-full py-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm mb-6" 
              style={{ fontWeight: 500 }}
            >
              {premiumPlan.ctaText}
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
      <section id="founders" className="px-4 md:px-8 py-20 bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl mb-4" style={{ fontWeight: 500 }}>For Founders</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              List your AI tool, keep it verified and fresh, or get premium visibility on our homepage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1: New Tool Listing */}
            <div className="bg-card rounded-[24px] border border-border/50 p-8 hover:shadow-lg transition-all">
              <div className="mb-6">
                <h3 className="text-2xl mb-2" style={{ fontWeight: 500 }}>New Tool Listing</h3>
                <p className="text-muted-foreground mb-4">Get your tool listed and verified by humans</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl" style={{ fontWeight: 500 }}>$499</span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
              </div>

              <button 
                onClick={handleToolListing}
                className="w-full py-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm mb-6" 
                style={{ fontWeight: 500 }}
              >
                List Your Tool
              </button>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Tool listing on Pinpoint</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Human Verified badge</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Full scoring and analysis</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Initial sentiment and traction snapshot</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Feature checks included at launch</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Includes 3 days in Alpha Bar</span>
                </div>
              </div>
            </div>

            {/* Card 2: Recheck Options */}
            <div className="bg-card rounded-[24px] border border-border/50 p-8 hover:shadow-lg transition-all">
              <div className="mb-6">
                <h3 className="text-2xl mb-2" style={{ fontWeight: 500 }}>Recheck Options</h3>
                <p className="text-muted-foreground mb-4">Keep your tool always fresh with reverification and rescoring</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl" style={{ fontWeight: 500 }}>$999</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
              </div>

              <button 
                onClick={handleRecheckPurchase}
                className="w-full py-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm mb-6" 
                style={{ fontWeight: 500 }}
              >
                Purchase
              </button>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Updated Pinpoint Score</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Fresh sentiment and traction data</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Updated pricing fairness analysis</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Updated feature verification and accuracy checks</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">4 recheck requests per year</span>
                </div>
              </div>
            </div>

            {/* Card 3: Alpha Bar Sponsorship */}
            <div className="bg-card rounded-[24px] border border-border/50 p-8 hover:shadow-lg transition-all">
              <div className="mb-6">
                <h3 className="text-2xl mb-2" style={{ fontWeight: 500 }}>Alpha Bar Sponsorship</h3>
                <p className="text-muted-foreground mb-4">Premium homepage visibility for your AI tool</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-muted-foreground">Contact for pricing</span>
                </div>
              </div>

              <button 
                onClick={() => setContactFormOpen(true)}
                className="w-full py-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm mb-6" 
                style={{ fontWeight: 500 }}
              >
                Contact Us
              </button>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">One of three weekly homepage spots</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Sponsored badge under main search</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">High visibility for 7 days</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Priority placement for trending tools</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-foreground/85">Best for product launches and big updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="px-4 md:px-8 py-20 max-w-4xl mx-auto">
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
      <footer className="px-4 md:px-8 py-16 bg-primary/10 border-t border-border/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={pinpointLogo} alt="Pinpoint AI" className="w-5 h-5" />
            <span style={{ fontWeight: 500 }}>Pinpoint AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Questions about pricing?{' '}
            <button
              onClick={() => setContactFormOpen(true)}
              className="text-primary hover:underline cursor-pointer"
            >
              Contact our team
            </button>
          </p>
          
          {/* Contact Form Dialog */}
          <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
          
          {/* Tool Submission Modal */}
          <ToolSubmissionModal 
            isOpen={toolSubmissionModalOpen} 
            onClose={() => setToolSubmissionModalOpen(false)}
          />
        </div>
      </footer>
    </div>
  );
}