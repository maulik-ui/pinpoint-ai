/**
 * Hook to get founder status and products for the current user
 * 
 * TODO: Replace mock data with actual Supabase queries
 * TODO: Add real-time updates for founder orders and alpha bar slots
 */

import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabaseClientBrowser";
import { FounderOrder, AlphaBarSlot } from "@/src/lib/billing/types";

export interface FounderStatus {
  hasListedTools: boolean;
  activeOrders: FounderOrder[];
  activeAlphaBarSlots: AlphaBarSlot[];
  isLoading: boolean;
}

export function useFounderStatus(): FounderStatus {
  const [activeOrders, setActiveOrders] = useState<FounderOrder[]>([]);
  const [activeAlphaBarSlots, setActiveAlphaBarSlots] = useState<AlphaBarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      // TODO: Replace with actual Supabase queries
      // For now, return mock data
      // const { data: orders } = await supabase
      //   .from("founder_orders")
      //   .select("*")
      //   .eq("user_id", session.user.id)
      //   .eq("status", "completed");

      // const { data: slots } = await supabase
      //   .from("alpha_bar_slots")
      //   .select("*")
      //   .eq("user_id", session.user.id)
      //   .gte("end_date", new Date().toISOString())
      //   .lte("start_date", new Date().toISOString());

      // Mock data - remove when integrating real data
      setTimeout(() => {
        setActiveOrders([]);
        setActiveAlphaBarSlots([]);
        setIsLoading(false);
      }, 100);
    });

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setActiveOrders([]);
        setActiveAlphaBarSlots([]);
        setIsLoading(false);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const hasListedTools = activeOrders.some(
    (order) => order.product_type === "new_tool_listing" && order.status === "completed"
  );

  return {
    hasListedTools,
    activeOrders,
    activeAlphaBarSlots,
    isLoading,
  };
}





