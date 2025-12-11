# Pinpoint AI - Pricing System Implementation Guide

## Overview

This document provides a complete guide to the pricing and billing system implemented for Pinpoint AI. The system supports three main user groups: **Free users**, **Premium users** (subscription), and **Founders** (tool listing and sponsorships).

## Table of Contents

1. [File Structure](#file-structure)
2. [User Tiers](#user-tiers)
3. [Navigation Guide](#navigation-guide)
4. [Updating Pricing](#updating-pricing)
5. [Database Integration](#database-integration)
6. [Stripe Integration](#stripe-integration)
7. [Feature Flags](#feature-flags)

---

## File Structure

### New Files Created

```
/types/billing.ts                           # TypeScript type definitions
/lib/billing/plans.ts                       # Plan configurations and helper functions
/hooks/useBilling.ts                        # React hooks for billing state
/components/PricingPage.tsx                 # Pricing page component
/components/UserPage.tsx                    # User profile and membership page
/components/AlphaBar.tsx                    # Alpha Bar featured tools section
/components/SavedTools.tsx                  # Saved/bookmarked tools component
/supabase/migrations/001_billing_schema.sql # Database schema for billing
```

### Modified Files

```
/App.tsx                                    # Added routing and Alpha Bar integration
```

---

## User Tiers

### 1. Free Users

**Price:** $0/month

**Features:**

- Full Directory access
- AI-powered search
- Curated tool lists
- Score and provide feedback
- Save tools with bookmarks
- Compare tools side-by-side
- View scores and pricing info
- Personalized recommendations
- Weekly newsletter

### 2. Premium Users

**Pricing Options:**

- **Monthly:** $29/month
- **Annual:** $249/year (Save $99/year, equivalent to $20.75/month)

**Additional Features (on top of Free):**

- Market worth estimates
- Web traction & engagement charts
- Deep sentiment breakdown by source (Reddit, X, YouTube)
- Pinpoint Score breakdown
- Competitive landscape view
- Trend projections
- Early niche detection

### 3. Founders

Founders can list and promote their AI tools through various packages:

#### A) New Tool Listing Package

**Price:** $499 (one-time)

**Includes:**

- Tool listing on Pinpoint AI
- Human Verified badge
- Full scoring and analysis
- 3 days in Alpha Bar (homepage)
- Announcement in weekly email
- Initial analytics snapshot (views, clicks, sentiment, traction)

#### B) Quarterly Recheck Package

**Price:** $299 per recheck

**Includes:**

- Rescore and updated Pinpoint Score
- Refreshed sentiment analysis
- Refreshed traction data
- Updated pricing fairness analysis
- Updated feature checklist and statuses
- Market worth reevaluation
- Updated Human Verified timestamp
- Quarterly performance report
- Ranking improvements applied

#### C) Annual Recheck Bundle

**Price:** $749/year (4 rechecks)

**Savings:** $447 vs individual rechecks  
**Includes:** All quarterly recheck features + automated scheduling + priority support

#### D) Alpha Bar Sponsorship

**Price:** $999 per week

**Includes:**

- 1 of 3 spots in Alpha Bar
- 7 days of homepage visibility
- "Alpha Bar Sponsored" badge
- High visibility under main search bar
- User feedback collection
- Analytics bundle (impressions, clicks, CTR)
- Highlight in weekly top 3 email

---

## Navigation Guide

### Accessing Different Pages

1. **Homepage:** Default landing page (`/`)
   - Click the Pinpoint AI logo in the nav to return home
2. **Pricing Page:**
   - Click "Pricing" in the navigation bar
   - Shows all plans and founder products
3. **User Profile/Membership Page:**
   - Click the user icon (circle with person) in the navigation bar
   - Tabs available:
     - **Profile:** User information and settings
     - **Membership:** Current plan, upgrade options, founder products
     - **Saved Tools:** Bookmarked tools
     - **Settings:** Email notifications, privacy settings

4. **Alpha Bar:**
   - Visible on homepage directly under the search bar
   - Shows up to 3 featured tools (new listings or sponsored)

---

## Updating Pricing

### To Update Plan Prices or Features:

1. **Open `/lib/billing/plans.ts`**
2. **Modify the relevant plan object:**

```typescript
// Example: Changing Premium monthly price
{
  id: 'premium_monthly',
  name: 'Premium',
  price: 39, // Changed from 29 to 39
  // ... rest of config
}
```

3. **Update features array:**

```typescript
features: [
  'Everything in Free, plus:',
  'Market worth estimates',
  'New feature here', // Add new features
  // ...
],
```

### To Add a New Plan:

1. Add a new plan object to `USER_PLANS` or `FOUNDER_PRODUCTS` array
2. Update TypeScript types in `/types/billing.ts` if needed
3. The pricing page will automatically display the new plan

---

## Database Integration

### Schema Overview

The database schema is defined in `/supabase/migrations/001_billing_schema.sql`

**Tables:**

1. **user_profiles**
   - Extended user information
   - Current plan tracking
   - Founder status

2. **user_subscriptions**
   - Active Premium subscriptions
   - Stripe subscription IDs
   - Start/end dates

3. **founder_orders**
   - One-time purchases (listings, rechecks, sponsorships)
   - Tool associations
   - Payment tracking

4. **alpha_bar_slots**
   - Tools featured in Alpha Bar
   - Sponsorship status
   - Analytics (impressions, clicks, CTR)
   - Active date ranges

5. **saved_tools**
   - User bookmarks
   - Tool associations
   - Notes

### Running the Migration

When ready to deploy the database:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# Copy and paste the SQL from /supabase/migrations/001_billing_schema.sql
```

### Connecting React Hooks to Supabase

Currently, the hooks in `/hooks/useBilling.ts` use stubbed data. To connect to real data:

1. **Install Supabase client:**

```bash
npm install @supabase/supabase-js
```

2. **Create Supabase client** (`/lib/supabase.ts`):

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

3. **Update hooks to use real queries:**

Example for `useCurrentUserPlan`:

```typescript
import { supabase } from "../lib/supabase";

export function useCurrentUserPlan() {
  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setUserProfile(profile);
    }

    fetchProfile();
  }, []);

  // ... rest of hook
}
```

---

## Stripe Integration

### Setup Steps

1. **Install Stripe:**

```bash
npm install @stripe/stripe-js stripe
```

2. **Create Stripe Products:**
   - Go to Stripe Dashboard → Products
   - Create products for each plan
   - Copy the Price IDs

3. **Update plan configurations** in `/lib/billing/plans.ts`:

```typescript
{
  id: 'premium_monthly',
  stripePriceId: 'price_xxxxxxxxxxxxx', // Add this field
  // ...
}
```

4. **Implement checkout flow:**

```typescript
// Example checkout function
async function handleUpgrade(planId: string) {
  const plan = getPlanById(planId);

  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      priceId: plan.stripePriceId,
      userId: user.id,
    }),
  });

  const { sessionId } = await response.json();

  // Redirect to Stripe Checkout
  const stripe = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  );
  await stripe.redirectToCheckout({ sessionId });
}
```

5. **Create API endpoint** (`/pages/api/create-checkout-session.ts`):

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  const { priceId, userId } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/account?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    client_reference_id: userId,
  });

  res.json({ sessionId: session.id });
}
```

6. **Set up webhooks** to handle subscription events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Webhook Example

```typescript
// /pages/api/webhooks/stripe.ts
import { buffer } from "micro";
import Stripe from "stripe";
import { supabase } from "../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    const body = await buffer(req);
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret,
    );
  } catch (err) {
    return res
      .status(400)
      .send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      // Update user_subscriptions table
      await supabase.from("user_subscriptions").insert({
        user_id: session.client_reference_id,
        plan_id: "premium_monthly", // Determine from session
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        status: "active",
      });
      break;

    case "customer.subscription.deleted":
      // Cancel subscription in database
      break;
  }

  res.json({ received: true });
}
```

---

## Feature Flags

### Controlling Premium Features

In `/hooks/useBilling.ts`, the `useCurrentUserPlan` hook provides:

```typescript
const { isPremium, isFree, currentPlan } = useCurrentUserPlan();
```

**Usage in components:**

```typescript
function ToolDetailPage() {
  const { isPremium } = useCurrentUserPlan();

  return (
    <div>
      {isPremium ? (
        <SentimentBreakdown />
      ) : (
        <UpgradeBanner feature="Sentiment Analysis" />
      )}
    </div>
  );
}
```

### Implementing Feature Gates

Create a reusable component:

```typescript
// /components/PremiumGate.tsx
import { useCurrentUserPlan } from '../hooks/useBilling';

export function PremiumGate({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isPremium } = useCurrentUserPlan();

  if (isPremium) return <>{children}</>;

  return fallback || (
    <div className="p-8 bg-accent/10 rounded-lg text-center">
      <p>This feature is available for Premium users.</p>
      <button onClick={() => navigate('/pricing')}>
        Upgrade to Premium
      </button>
    </div>
  );
}
```

**Usage:**

```typescript
<PremiumGate>
  <MarketWorthChart />
</PremiumGate>
```

---

## Testing Different User States

To test different user tiers, modify the mock data in `/hooks/useBilling.ts`:

```typescript
// In useCurrentUserPlan hook
const mockUserProfile: UserProfile = {
  // ...
  currentPlan: "free", // Change to 'premium_monthly' or 'premium_yearly'
  isFounder: false, // Change to true to test founder features
};
```

---

## Summary

The pricing system is now fully implemented with:

✅ **Complete type definitions** for all billing entities  
✅ **Plan configurations** centralized in one file  
✅ **Comprehensive pricing page** with user and founder tiers  
✅ **User profile page** with membership management  
✅ **Alpha Bar component** for homepage featuring  
✅ **Saved tools functionality** with bookmark management  
✅ **Database schema** ready for Supabase deployment  
✅ **React hooks** structured for easy Stripe integration  
✅ **Responsive design** matching the earthy, cozy aesthetic

**Next Steps:**

1. Set up Supabase project and run migrations
2. Connect authentication (Supabase Auth or custom)
3. Integrate Stripe for payments
4. Wire hooks to real database queries
5. Implement webhook handlers
6. Test payment flows end-to-end

---

## Support

For questions or issues:

- Review the inline code comments (JSDoc)
- Check the type definitions in `/types/billing.ts`
- Refer to Supabase docs: https://supabase.com/docs
- Refer to Stripe docs: https://stripe.com/docs

Last Updated: November 21, 2025