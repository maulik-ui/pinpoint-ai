/**
 * Hook to get the current user's subscription plan
 * 
 * TODO: Replace mock data with actual Supabase query
 * TODO: Add real-time subscription updates
 */

import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabaseClientBrowser";
import { UserSubscription } from "@/src/lib/billing/types";
import { getPlanById } from "@/src/lib/billing/plans";

export interface CurrentPlan {
  plan: ReturnType<typeof getPlanById>;
  subscription: UserSubscription | null;
  isPremium: boolean;
  isLoading: boolean;
}

export function useCurrentUserPlan(): CurrentPlan {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      // TODO: Replace with actual Supabase query
      // For now, return mock data
      // const { data, error } = await supabase
      //   .from("user_subscriptions")
      //   .select("*")
      //   .eq("user_id", session.user.id)
      //   .eq("status", "active")
      //   .order("created_at", { ascending: false })
      //   .limit(1)
      //   .single();

      // Mock data - remove when integrating real data
      setTimeout(() => {
        setSubscription(null); // Default to free plan
        setIsLoading(false);
      }, 100);
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setSubscription(null);
        setIsLoading(false);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const plan = subscription ? getPlanById(subscription.planId) : getPlanById("free");
  const isPremium = plan?.id === "premium_monthly" || plan?.id === "premium_yearly";

  return {
    plan: plan || getPlanById("free"),
    subscription,
    isPremium,
    isLoading,
  };
}





