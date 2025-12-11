/**
 * Billing and Subscription Type Definitions
 * 
 * This file contains all type definitions for the Pinpoint AI pricing system.
 * It supports three main user types: Free, Premium, and Founder.
 */

export type BillingCycle = "monthly" | "yearly" | "one_time" | "weekly";

export type PlanAudience = "user" | "founder";

export type PlanType = "free" | "premium_monthly" | "premium_yearly" | "founder";

export type SubscriptionStatus = "active" | "canceled" | "expired" | "pending";

/**
 * Core Plan Definition
 */
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number; // in USD
  billingCycle: BillingCycle;
  audience: PlanAudience;
  features: string[];
  highlighted?: boolean; // For featured plans
  ctaText: string; // Call to action button text
}

/**
 * Founder Products/Add-ons
 * These are separate from user subscriptions
 */
export interface FounderProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  ctaText: string;
  category: "listing" | "recheck" | "sponsorship";
}

/**
 * User Subscription Model
 * Represents a user's active subscription
 */
export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: Date;
  endsAt?: Date;
  canceledAt?: Date;
  stripeSubscriptionId?: string; // For Stripe integration
  stripeCustomerId?: string;
  metadata?: Record<string, any>;
}

/**
 * Founder Order Model
 * Represents a one-time purchase by a founder (listing, recheck, etc.)
 */
export interface FounderOrder {
  id: string;
  userId: string;
  productId: string;
  toolId?: string; // Associated tool (for listings and rechecks)
  status: "pending" | "completed" | "refunded";
  amount: number;
  purchasedAt: Date;
  stripePaymentIntentId?: string;
  metadata?: Record<string, any>;
}

/**
 * Alpha Bar Slot Model
 * Represents a tool's placement in the Alpha Bar
 */
export interface AlphaBarSlot {
  id: string;
  toolId: string;
  toolName: string;
  toolDescription: string;
  toolImage?: string;
  founderId: string;
  isSponsored: boolean; // True if paid sponsorship, false if from 499 package
  startDate: Date;
  endDate: Date;
  orderId?: string; // Link to FounderOrder if sponsored
  analytics: {
    impressions: number;
    clicks: number;
    clickThroughRate: number;
  };
}

/**
 * Saved Tool Model
 * Represents a user's bookmarked/saved tool
 */
export interface SavedTool {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  toolCategory?: string;
  toolImage?: string;
  savedAt: Date;
  notes?: string;
}

/**
 * User Profile Model
 * Extended user information beyond auth
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  currentPlan: "free" | "premium_monthly" | "premium_yearly";
  isFounder: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}
