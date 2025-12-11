-- Billing and subscription tables for Pinpoint AI
-- TODO: Add Stripe integration columns when ready

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL, -- References plan.id from plans.ts
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id TEXT, -- TODO: Add when integrating Stripe
  stripe_customer_id TEXT, -- TODO: Add when integrating Stripe
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Founder orders table
CREATE TABLE IF NOT EXISTS founder_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('new_tool_listing', 'quarterly_recheck', 'annual_recheck_plan', 'alpha_bar_sponsorship')),
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL, -- For tool listing and rechecks
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  amount INTEGER NOT NULL, -- Price in cents
  stripe_payment_intent_id TEXT, -- TODO: Add when integrating Stripe
  stripe_checkout_session_id TEXT, -- TODO: Add when integrating Stripe
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alpha Bar slots table
CREATE TABLE IF NOT EXISTS alpha_bar_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES founder_orders(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sponsored BOOLEAN DEFAULT false,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 3),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  click_through_rate NUMERIC(5, 2), -- Percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User saved tools (bookmarks)
CREATE TABLE IF NOT EXISTS user_saved_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_founder_orders_user_id ON founder_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_orders_tool_id ON founder_orders(tool_id);
CREATE INDEX IF NOT EXISTS idx_founder_orders_status ON founder_orders(status);
CREATE INDEX IF NOT EXISTS idx_founder_orders_product_type ON founder_orders(product_type);

CREATE INDEX IF NOT EXISTS idx_alpha_bar_slots_tool_id ON alpha_bar_slots(tool_id);
CREATE INDEX IF NOT EXISTS idx_alpha_bar_slots_user_id ON alpha_bar_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_alpha_bar_slots_dates ON alpha_bar_slots(start_date, end_date);
-- Note: Partial index with NOW() cannot be created as NOW() is not IMMUTABLE
-- Instead, query will filter by date range at query time

CREATE INDEX IF NOT EXISTS idx_user_saved_tools_user_id ON user_saved_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_tools_tool_id ON user_saved_tools(tool_id);

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_founder_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_alpha_bar_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();

CREATE TRIGGER update_founder_orders_updated_at
  BEFORE UPDATE ON founder_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_founder_orders_updated_at();

CREATE TRIGGER update_alpha_bar_slots_updated_at
  BEFORE UPDATE ON alpha_bar_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_alpha_bar_slots_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_bar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for founder_orders
CREATE POLICY "Users can view their own founder orders"
  ON founder_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own founder orders"
  ON founder_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own founder orders"
  ON founder_orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for alpha_bar_slots (public read for active slots)
CREATE POLICY "Anyone can view active alpha bar slots"
  ON alpha_bar_slots FOR SELECT
  USING (start_date <= NOW() AND end_date >= NOW());

CREATE POLICY "Users can view their own alpha bar slots"
  ON alpha_bar_slots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alpha bar slots"
  ON alpha_bar_slots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alpha bar slots"
  ON alpha_bar_slots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_saved_tools
CREATE POLICY "Users can view their own saved tools"
  ON user_saved_tools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved tools"
  ON user_saved_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved tools"
  ON user_saved_tools FOR DELETE
  USING (auth.uid() = user_id);

