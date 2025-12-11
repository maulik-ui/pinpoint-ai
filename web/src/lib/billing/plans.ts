/**
 * Plan and product configurations for Pinpoint AI
 * 
 * To update pricing, modify the price values in this file.
 * TODO: When integrating Stripe, add stripePriceId and stripeProductId to each plan/product
 */

import { Plan, FounderProduct } from "./types";

/**
 * User subscription plans
 */
export const USER_PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for discovering AI tools",
    price: 0, // Free
    billingCycle: "one_time",
    audience: "user",
    features: [
      "Full Directory access",
      "AI search",
      "Curated tool lists",
      "Score tools and provide feedback",
      "Save tools (bookmarks)",
      "Compare tools",
      "Scores and price info",
      "Personalized recommendations",
      "Weekly Newsletter",
    ],
    highlighted: false,
    ctaText: "Get Started",
  },
  {
    id: "premium_monthly",
    name: "Premium",
    description: "Deep insights for power users",
    price: 29.0, // $29.00 in USD
    billingCycle: "monthly",
    audience: "user",
    features: [
      "Everything in Free",
      "Market worth estimate",
      "Web traction and engagement charts",
      "Deep dive sentiment breakdown by source (Reddit, X, YouTube)",
      "Pinpoint Score Breakdown",
      "Competitive landscape view",
      "Trend projections and early niche detection",
    ],
    highlighted: true,
    ctaText: "Start Premium",
  },
  {
    id: "premium_yearly",
    name: "Premium",
    description: "Deep insights for power users",
    price: 249.0, // $249.00 in USD
    billingCycle: "yearly",
    audience: "user",
    features: [
      "Everything in Free",
      "Market worth estimate",
      "Web traction and engagement charts",
      "Deep dive sentiment breakdown by source (Reddit, X, YouTube)",
      "Pinpoint Score Breakdown",
      "Competitive landscape view",
      "Trend projections and early niche detection",
    ],
    highlighted: true,
    ctaText: "Start Premium",
  },
];

/**
 * Founder products
 */
export const FOUNDER_PRODUCTS: FounderProduct[] = [
  {
    id: "new_tool_listing",
    name: "New Tool Listing",
    description: "Get your AI tool listed on Pinpoint",
    price: 499.0, // $499.00 in USD
    billingCycle: "one_time",
    features: [
      "Tool listing on the site",
      "Human Verified badge included",
      "Full scoring and analysis",
      "3 days in the Alpha Bar by default",
      "Announcement in weekly email",
      "Initial analytics snapshot (views, click-throughs, sentiment, traction)",
    ],
    ctaText: "List Your Tool",
    category: "listing",
  },
  {
    id: "quarterly_recheck",
    name: "Quarterly Recheck",
    description: "Keep your tool's data fresh",
    price: 299.0, // $299.00 in USD
    billingCycle: "one_time",
    features: [
      "Rescore and updated Pinpoint Score",
      "Refreshed sentiment",
      "Refreshed traction data",
      "Updated pricing fairness analysis",
      "Updated feature verification",
      "Updated competitive landscape",
    ],
    ctaText: "Order Recheck",
    category: "recheck",
  },
  {
    id: "annual_recheck_plan",
    name: "Annual Recheck Plan",
    description: "Keep your tool's data fresh all year",
    price: 999.0, // $999.00 in USD
    billingCycle: "one_time",
    features: [
      "4 quarterly rechecks (one per quarter)",
      "Rescore and updated Pinpoint Score each quarter",
      "Refreshed sentiment each quarter",
      "Refreshed traction data each quarter",
      "Updated pricing fairness analysis each quarter",
      "Updated feature verification each quarter",
      "Updated competitive landscape each quarter",
      "Priority support",
    ],
    ctaText: "Order Annual Plan",
    category: "recheck",
  },
  {
    id: "alpha_bar_sponsorship",
    name: "Alpha Bar Sponsorship",
    description: "Get featured in the Alpha Bar",
    price: 199.0, // $199.00 in USD
    billingCycle: "one_time",
    features: [
      "7 days in the Alpha Bar",
      "Sponsored badge",
      "Analytics dashboard access",
      "Priority placement",
      "Featured in weekly email",
    ],
    ctaText: "Sponsor Alpha Bar",
    category: "sponsorship",
  },
];

/**
 * Helper function to get a plan by ID
 */
export function getPlanById(planId: string): Plan | null {
  return USER_PLANS.find((plan) => plan.id === planId) || null;
}

/**
 * Helper function to get a founder product by ID
 */
export function getFounderProductById(productId: string): FounderProduct | null {
  return FOUNDER_PRODUCTS.find((product) => product.id === productId) || null;
}

/**
 * Helper function to format price (in USD)
 */
export function formatPrice(price: number): string {
  if (price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Helper function to format price with billing cycle
 */
export function formatPriceWithCycle(price: number, cycle: string): string {
  if (price === 0) {
    return "Free";
  }

  const formattedPrice = formatPrice(price);

  if (cycle === "monthly") {
    return `${formattedPrice}/mo`;
  } else if (cycle === "yearly") {
    return `${formattedPrice}/yr`;
  } else if (cycle === "weekly") {
    return `${formattedPrice}/wk`;
  }

  return formattedPrice;
}
