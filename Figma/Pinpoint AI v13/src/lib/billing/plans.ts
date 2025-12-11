/**
 * Plan Configurations and Definitions
 * 
 * This file contains all plan configurations for Pinpoint AI.
 * Update prices and features here when making changes to the pricing model.
 */

import { Plan, FounderProduct } from '../../types/billing';

/**
 * User Plans (Free and Premium)
 */
export const USER_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for exploring AI tools',
    price: 0,
    billingCycle: 'monthly',
    audience: 'user',
    ctaText: 'Start for Free',
    features: [
      'Full Directory access',
      'AI-powered search',
      'Curated tool lists',
      'Score and provide feedback',
      'Save tools with bookmarks',
      'Compare tools side-by-side',
      'View scores and pricing info',
      'Personalized recommendations',
      'Weekly newsletter with latest tools',
    ],
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    description: 'Deep insights for power users',
    price: 29,
    billingCycle: 'monthly',
    audience: 'user',
    highlighted: true,
    ctaText: 'Upgrade to Premium',
    features: [
      'Everything in Free, plus:',
      'Market worth estimates',
      'Web traction & engagement charts',
      'Sentiment breakdown by source',
      '- Reddit sentiment analysis',
      '- X (Twitter) sentiment analysis',
      '- YouTube sentiment analysis',
      'Pinpoint Score breakdown',
      'Competitive landscape view',
      'Trend projections',
      'Early niche detection',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium Annual',
    description: 'Save 30% with annual billing',
    price: 249,
    billingCycle: 'yearly',
    audience: 'user',
    ctaText: 'Upgrade to Premium',
    features: [
      'Everything in Free, plus:',
      'Market worth estimates',
      'Web traction & engagement charts',
      'Sentiment breakdown by source',
      '- Reddit sentiment analysis',
      '- X (Twitter) sentiment analysis',
      '- YouTube sentiment analysis',
      'Pinpoint Score breakdown',
      'Competitive landscape view',
      'Trend projections',
      'Early niche detection',
      '✨ Save $99/year vs monthly',
    ],
  },
];

/**
 * Founder Products and Services
 */
export const FOUNDER_PRODUCTS: FounderProduct[] = [
  {
    id: 'tool_listing',
    name: 'New Tool Listing',
    description: 'Get your AI tool listed and verified on Pinpoint',
    price: 499,
    billingCycle: 'one_time',
    category: 'listing',
    ctaText: 'List Your Tool',
    features: [
      'Tool listing on Pinpoint AI',
      'Human Verified badge included',
      'Full scoring and analysis',
      '3 days in Alpha Bar (homepage)',
      'Announcement in weekly email',
      'Initial analytics snapshot:',
      '- Views and click-throughs',
      '- Sentiment snapshot',
      '- Traction snapshot',
    ],
  },
  {
    id: 'quarterly_recheck',
    name: 'Quarterly Recheck',
    description: 'Keep your tool data fresh and accurate',
    price: 299,
    billingCycle: 'one_time',
    category: 'recheck',
    ctaText: 'Purchase Recheck',
    features: [
      'Rescore & updated Pinpoint Score',
      'Refreshed sentiment analysis',
      'Refreshed traction data',
      'Updated pricing fairness analysis',
      'Updated feature checklist',
      'Market worth reevaluation',
      'Updated Human Verified timestamp',
      'Quarterly performance report',
      'Ranking improvements applied',
    ],
  },
  {
    id: 'annual_recheck_bundle',
    name: 'Annual Recheck Bundle',
    description: '4 rechecks per year at a discounted rate',
    price: 749,
    billingCycle: 'yearly',
    category: 'recheck',
    ctaText: 'Purchase Annual Bundle',
    features: [
      'All Quarterly Recheck features',
      '4 rechecks per year (quarterly)',
      'Save $447 vs individual rechecks',
      'Automated scheduling',
      'Priority support',
      'Yearly performance summary',
    ],
  },
  {
    id: 'alpha_bar_sponsorship',
    name: 'Alpha Bar Sponsorship',
    description: 'Premium homepage visibility for 7 days',
    price: 999,
    billingCycle: 'weekly',
    category: 'sponsorship',
    ctaText: 'Book Alpha Bar Slot',
    features: [
      '1 of 3 spots in Alpha Bar',
      '7 days of homepage visibility',
      '"Alpha Bar Sponsored" badge',
      'High visibility under main search',
      'User feedback collection',
      'Analytics bundle:',
      '- Impressions',
      '- Clicks',
      '- Click-through rate',
      'Highlight in weekly top 3 email',
    ],
  },
];

/**
 * Helper function to get a plan by ID
 */
export function getPlanById(planId: string): Plan | undefined {
  return USER_PLANS.find(plan => plan.id === planId);
}

/**
 * Helper function to get a founder product by ID
 */
export function getFounderProductById(productId: string): FounderProduct | undefined {
  return FOUNDER_PRODUCTS.find(product => product.id === productId);
}

/**
 * Helper function to check if a plan is premium
 */
export function isPremiumPlan(planId: string): boolean {
  return planId === 'premium_monthly' || planId === 'premium_yearly';
}

/**
 * Helper function to format price
 */
export function formatPrice(price: number, billingCycle: string): string {
  if (price === 0) return 'Free';
  
  const formattedPrice = `$${price}`;
  
  switch (billingCycle) {
    case 'monthly':
      return `${formattedPrice}/month`;
    case 'yearly':
      return `${formattedPrice}/year`;
    case 'weekly':
      return `${formattedPrice}/week`;
    case 'one_time':
      return formattedPrice;
    default:
      return formattedPrice;
  }
}
