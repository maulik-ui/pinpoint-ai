# Pricing System Implementation Summary

## Overview
Complete pricing system implementation for Pinpoint AI with user subscriptions, founder products, and Alpha Bar sponsorship.

## New Files Created

### Data Model & Types
- `web/src/lib/billing/types.ts` - TypeScript types for plans, subscriptions, and founder products
- `web/src/lib/billing/plans.ts` - Plan and product configurations with pricing
- `web/supabase/migrations/010_add_billing_tables.sql` - Database schema for billing system

### Hooks
- `web/src/hooks/useCurrentUserPlan.ts` - Hook to get current user's subscription plan
- `web/src/hooks/useFounderStatus.ts` - Hook to get founder status and products

### UI Components
- `web/src/components/PricingPage.tsx` - Main pricing page component
- `web/src/components/UserDashboard.tsx` - User profile page with membership tab
- `web/src/components/AlphaBar.tsx` - Alpha Bar component for homepage

### Pages
- `web/app/pricing/page.tsx` - Pricing page route
- `web/app/user/page.tsx` - User dashboard route

### Modified Files
- `web/src/components/HomePage.tsx` - Added Alpha Bar section
- `web/src/components/UserProfile.tsx` - Added link to user dashboard
- `web/app/page.tsx` - Added Alpha Bar data fetching (commented out until migration runs)

## How to Navigate

### Pricing Page
- URL: `/pricing`
- Access: Public (anyone can view)
- Features:
  - Free plan display
  - Premium plan with monthly/yearly toggle
  - Founder products (4 different options)
  - Clear call-to-action buttons

### User Dashboard
- URL: `/user`
- Access: Requires authentication (redirects to sign-in if not logged in)
- Features:
  - Overview tab: User stats and quick info
  - Membership tab: Current plan, upgrade options, founder products
  - Saved Tools tab: Bookmarked tools (stub - needs implementation)

### Alpha Bar
- Location: Homepage, directly under the main search bar
- Displays: Up to 3 tools with "Alpha Bar" and "Sponsored" badges
- Data: Currently uses mock data (empty array), will fetch from database after migration

## Updating Plan Pricing

To update pricing, edit `web/src/lib/billing/plans.ts`:

```typescript
// Example: Update Premium monthly price
{
  id: "premium_monthly",
  price: 2900, // Change this value (in cents, so $29.00 = 2900)
  // ...
}
```

All prices are stored in **cents** (USD). To change $29 to $35, set `price: 3500`.

## Database Migration

**Important**: Run the migration before using the billing features:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `web/supabase/migrations/010_add_billing_tables.sql`
3. Run the migration
4. Verify tables are created:
   - `user_subscriptions`
   - `founder_orders`
   - `alpha_bar_slots`
   - `user_saved_tools`

## Wiring in Stripe Integration

When ready to integrate Stripe, update these files:

### 1. Plan Configuration (`web/src/lib/billing/plans.ts`)
Add Stripe price and product IDs:
```typescript
{
  id: "premium_monthly",
  stripePriceId: "price_xxxxx", // Add Stripe price ID
  stripeProductId: "prod_xxxxx", // Add Stripe product ID
  // ...
}
```

### 2. Hooks (`web/src/hooks/useCurrentUserPlan.ts`)
Replace mock data with actual Supabase queries:
```typescript
const { data, error } = await supabase
  .from("user_subscriptions")
  .select("*")
  .eq("user_id", session.user.id)
  .eq("status", "active")
  .single();
```

### 3. Pricing Page (`web/src/components/PricingPage.tsx`)
Update `handleGetStarted` and `handleFounderAction` functions:
```typescript
const handleGetStarted = async (planId: string) => {
  // Create Stripe checkout session
  const response = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
  const { url } = await response.json();
  window.location.href = url;
};
```

### 4. Create Stripe API Routes
- `web/app/api/stripe/create-checkout/route.ts` - Create checkout session
- `web/app/api/stripe/webhook/route.ts` - Handle Stripe webhooks
- `web/app/api/stripe/cancel-subscription/route.ts` - Cancel subscription

### 5. Database Schema
Add Stripe IDs to tables (already included in migration):
- `user_subscriptions.stripe_subscription_id`
- `user_subscriptions.stripe_customer_id`
- `founder_orders.stripe_payment_intent_id`
- `founder_orders.stripe_checkout_session_id`

## Features Implemented

### ✅ User Plans
- Free tier (no payment)
- Premium monthly ($29/month)
- Premium yearly ($249/year)
- Plan switching UI

### ✅ Founder Products
- New Tool Listing ($499 one-time)
- Quarterly Recheck ($299 per recheck)
- Annual Recheck Plan ($749/year)
- Alpha Bar Sponsorship ($999/week)

### ✅ User Dashboard
- Profile overview
- Membership management
- Saved tools section (UI ready, needs data integration)

### ✅ Alpha Bar
- Component created
- Homepage integration
- Ready for database integration

## Features Not Yet Implemented

### Saved Tools
- Bookmark functionality on tool pages
- Saved tools list in user dashboard
- Need to implement:
  - Add/remove bookmark API endpoints
  - UI button on tool pages
  - Query `user_saved_tools` table

### Stripe Integration
- Payment processing
- Subscription management
- Webhook handling
- See "Wiring in Stripe Integration" section above

### Real-time Data
- Currently using mock/stub data in hooks
- Need to replace with actual Supabase queries
- See TODO comments in hook files

## Design Notes

- Uses existing design system (neutral/earthy tones)
- Consistent with rest of site (rounded corners, spacing, typography)
- Responsive design (mobile-friendly)
- Matches existing component patterns

## Next Steps

1. **Run database migration** (`010_add_billing_tables.sql`)
2. **Test user dashboard** - Sign in and navigate to `/user`
3. **Test pricing page** - Navigate to `/pricing`
4. **Implement saved tools** - Add bookmark functionality
5. **Integrate Stripe** - When ready for payments
6. **Populate Alpha Bar** - Add tools to alpha_bar_slots table

## Testing Checklist

- [ ] Pricing page displays correctly
- [ ] User dashboard loads for authenticated users
- [ ] Membership tab shows current plan
- [ ] Alpha Bar component renders (even if empty)
- [ ] Navigation links work correctly
- [ ] Sign-in redirects work properly





