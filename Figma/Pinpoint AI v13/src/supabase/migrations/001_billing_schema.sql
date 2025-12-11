-- Pinpoint AI Billing Schema
-- This schema supports the pricing system for Free, Premium, and Founder tiers
-- 
-- Migration: 001_billing_schema.sql
-- Created: 2025-11-21
-- 
-- IMPORTANT: This is a stub schema for frontend development.
-- When ready to deploy, run this migration in Supabase dashboard or via CLI.

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Extended user information beyond Supabase auth
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  current_plan TEXT NOT NULL DEFAULT 'free' CHECK (current_plan IN ('free', 'premium_monthly', 'premium_yearly')),
  is_founder BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================================================
-- Tracks active Premium subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('premium_monthly', 'premium_yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);

-- ============================================================================
-- FOUNDER ORDERS TABLE
-- ============================================================================
-- Tracks one-time founder purchases (listings, rechecks, sponsorships)
CREATE TABLE IF NOT EXISTS founder_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL CHECK (product_id IN ('tool_listing', 'quarterly_recheck', 'annual_recheck_bundle', 'alpha_bar_sponsorship')),
  tool_id TEXT, -- Associated tool (for listings and rechecks)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  amount NUMERIC(10, 2) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_payment_intent_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_founder_orders_user_id ON founder_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_orders_tool_id ON founder_orders(tool_id);
CREATE INDEX IF NOT EXISTS idx_founder_orders_status ON founder_orders(status);

-- ============================================================================
-- ALPHA BAR SLOTS TABLE
-- ============================================================================
-- Tracks tools featured in the Alpha Bar on homepage
CREATE TABLE IF NOT EXISTS alpha_bar_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_description TEXT NOT NULL,
  tool_image TEXT,
  founder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_sponsored BOOLEAN DEFAULT FALSE, -- TRUE for paid sponsorship, FALSE for included in listing package
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  order_id UUID REFERENCES founder_orders(id) ON DELETE SET NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  click_through_rate NUMERIC(5, 2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure we don't overlap slots (max 3 at a time)
  -- This is handled at application level, but we track it here
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alpha_bar_slots_dates ON alpha_bar_slots(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_alpha_bar_slots_tool_id ON alpha_bar_slots(tool_id);
CREATE INDEX IF NOT EXISTS idx_alpha_bar_slots_founder_id ON alpha_bar_slots(founder_id);

-- ============================================================================
-- SAVED TOOLS TABLE
-- ============================================================================
-- User bookmarks/saved tools
CREATE TABLE IF NOT EXISTS saved_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_category TEXT,
  tool_image TEXT,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: user can only save a tool once
  CONSTRAINT unique_user_tool UNIQUE (user_id, tool_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_tools_user_id ON saved_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tools_tool_id ON saved_tools(tool_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_bar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tools ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- User Subscriptions: Users can read their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Founder Orders: Users can read their own orders
CREATE POLICY "Users can view own orders" ON founder_orders
  FOR SELECT USING (auth.uid() = user_id);

-- Alpha Bar Slots: Public read access (displayed on homepage)
CREATE POLICY "Alpha bar slots are publicly readable" ON alpha_bar_slots
  FOR SELECT USING (true);

-- Saved Tools: Users can manage their own saved tools
CREATE POLICY "Users can view own saved tools" ON saved_tools
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved tools" ON saved_tools
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved tools" ON saved_tools
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_orders_updated_at BEFORE UPDATE ON founder_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alpha_bar_slots_updated_at BEFORE UPDATE ON alpha_bar_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTES FOR STRIPE INTEGRATION
-- ============================================================================
-- When integrating with Stripe:
-- 1. Store stripe_customer_id in user_subscriptions when customer is created
-- 2. Store stripe_subscription_id when subscription is created
-- 3. Store stripe_payment_intent_id in founder_orders for one-time purchases
-- 4. Use Stripe webhooks to update status fields (active, canceled, etc.)
-- 5. Consider adding a stripe_events table to track webhook events
