"use client";

/**
 * Billing Hooks
 * 
 * Custom React hooks for managing user plans, subscriptions, and founder status.
 * These hooks are wired to Supabase for real-time data.
 */

import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabaseClientBrowser";
import { UserProfile, UserSubscription, SavedTool, AlphaBarSlot } from "@/src/lib/billing/types";
import { getPlanById } from "@/src/lib/billing/plans";

/**
 * Hook to get the current user's plan information
 * 
 * @returns Object containing user plan details and helper functions
 */
export function useCurrentUserPlan() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        // Fetch user subscription
        const { data: subscriptionData, error: subError } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Only log errors that are not "no rows returned" (PGRST116)
        // Also check if error exists and has meaningful content
        if (subError) {
          // PGRST116 is "no rows returned" which is expected for users without subscriptions
          // Check if error has meaningful content (not empty object)
          const hasErrorCode = subError.code && subError.code !== "PGRST116";
          const hasErrorMessage = subError.message && typeof subError.message === 'string' && subError.message.trim() !== "";
          const hasErrorDetails = subError.details && typeof subError.details === 'string' && subError.details.trim() !== "";
          const hasErrorHint = subError.hint && typeof subError.hint === 'string' && subError.hint.trim() !== "";
          
          // Only log if error has meaningful content
          if (hasErrorCode || hasErrorMessage || hasErrorDetails || hasErrorHint) {
            console.error("Error fetching subscription:", {
              code: subError.code,
              message: subError.message,
              details: subError.details,
              hint: subError.hint,
            });
          }
          // Silently ignore empty error objects or "no rows" errors
        }

        // Build user profile
        const profile: UserProfile = {
          id: session.user.id,
          email: session.user.email || "",
          displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name,
          avatarUrl: session.user.user_metadata?.avatar_url,
          currentPlan: subscriptionData?.plan_id || "free",
          isFounder: false, // Will be determined by founder orders
          createdAt: new Date(session.user.created_at),
          metadata: session.user.user_metadata,
        };

        setUserProfile(profile);
        setSubscription(subscriptionData || null);
      } catch (err) {
        console.error("Failed to fetch user plan:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserPlan();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUserProfile(null);
        setSubscription(null);
        setIsLoading(false);
      } else {
        fetchUserPlan();
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const currentPlan = userProfile ? getPlanById(userProfile.currentPlan) : null;
  const isPremium = userProfile
    ? userProfile.currentPlan === "premium_monthly" || userProfile.currentPlan === "premium_yearly"
    : false;
  const isFree = userProfile?.currentPlan === "free";

  return {
    userProfile,
    subscription,
    currentPlan,
    isPremium,
    isFree,
    isLoading,
  };
}

/**
 * Hook to get founder status and tools
 * 
 * @returns Object containing founder status and listed tools
 */
export function useFounderStatus() {
  const [isFounder, setIsFounder] = useState(false);
  const [listedTools, setListedTools] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [activeAlphaSlots, setActiveAlphaSlots] = useState<AlphaBarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFounderStatus() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        // Fetch completed founder orders
        const { data: orders, error: ordersError } = await supabase
          .from("founder_orders")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("status", "completed");

        // Only log meaningful errors
        if (ordersError) {
          const hasErrorCode = ordersError.code && ordersError.code.trim() !== "";
          const hasErrorMessage = ordersError.message && ordersError.message.trim() !== "";
          
          if (hasErrorCode || hasErrorMessage) {
            console.error("Error fetching founder orders:", {
              code: ordersError.code,
              message: ordersError.message,
              details: ordersError.details,
              hint: ordersError.hint,
            });
          }
        }

        // Store orders in state
        setActiveOrders(orders || []);

        // Fetch active alpha bar slots
        const now = new Date().toISOString();
        const { data: slots, error: slotsError } = await supabase
          .from("alpha_bar_slots")
          .select("*")
          .eq("user_id", session.user.id)
          .lte("start_date", now)
          .gte("end_date", now);

        // Only log meaningful errors
        if (slotsError) {
          const hasErrorCode = slotsError.code && slotsError.code.trim() !== "";
          const hasErrorMessage = slotsError.message && slotsError.message.trim() !== "";
          
          if (hasErrorCode || hasErrorMessage) {
            console.error("Error fetching alpha bar slots:", {
              code: slotsError.code,
              message: slotsError.message,
              details: slotsError.details,
              hint: slotsError.hint,
            });
          }
        }

        // Determine if user is a founder (has any completed orders)
        const hasFounderOrders = (orders || []).length > 0;

        // Fetch tool details for listed tools
        const toolIds = (orders || [])
          .filter((order) => order.product_type === "new_tool_listing" && order.tool_id)
          .map((order) => order.tool_id);

        let tools: any[] = [];
        if (toolIds.length > 0) {
          const { data: toolsData } = await supabase
            .from("tools")
            .select("id, name, slug, logo_url, category")
            .in("id", toolIds);

          tools = (toolsData || []).map((tool) => ({
            ...tool,
            hasActiveRecheck: (orders || []).some(
              (order) =>
                order.tool_id === tool.id &&
                (order.product_type === "quarterly_recheck" ||
                  order.product_type === "annual_recheck_plan") &&
                order.status === "completed"
            ),
          }));
        }

        setIsFounder(hasFounderOrders);
        setListedTools(tools);
        setActiveAlphaSlots(slots || []);
      } catch (err) {
        console.error("Failed to fetch founder status:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFounderStatus();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setIsFounder(false);
        setListedTools([]);
        setActiveOrders([]);
        setActiveAlphaSlots([]);
        setIsLoading(false);
      } else {
        fetchFounderStatus();
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  return {
    isFounder,
    listedTools,
    activeOrders,
    activeAlphaSlots,
    hasActiveRechecks: listedTools.some((tool) => tool.hasActiveRecheck),
    hasActiveSponsorship: activeAlphaSlots.some((slot) => slot.isSponsored),
    isLoading,
  };
}

/**
 * Hook to manage saved/bookmarked tools
 * 
 * @returns Object containing saved tools and management functions
 */
export function useSavedTools() {
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedTools() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        // Fetch saved tools with tool details
        const { data: savedData, error } = await supabase
          .from("user_saved_tools")
          .select(`
            id,
            tool_id,
            created_at,
            tools:tool_id (
              id,
              name,
              slug,
              category,
              logo_url
            )
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching saved tools:", error);
          setIsLoading(false);
          return;
        }

        // Transform to SavedTool format
        const transformed = (savedData || [])
          .map((item: any) => {
            const tool = item.tools;
            if (!tool) return null;

            return {
              id: item.id,
              userId: session.user.id,
              toolId: tool.id,
              toolName: tool.name,
              toolCategory: tool.category,
              toolImage: tool.logo_url,
              savedAt: new Date(item.created_at),
            };
          })
          .filter((tool) => tool !== null) as SavedTool[];

        setSavedTools(transformed);
      } catch (err) {
        console.error("Failed to fetch saved tools:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedTools();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setSavedTools([]);
        setIsLoading(false);
      } else {
        fetchSavedTools();
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const saveTool = async (tool: Omit<SavedTool, "id" | "userId" | "savedAt">) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("User must be authenticated to save tools");
      }

      const { data, error } = await supabase
        .from("user_saved_tools")
        .insert([
          {
            user_id: session.user.id,
            tool_id: tool.toolId,
          },
        ])
        .select(`
          id,
          tool_id,
          created_at,
          tools:tool_id (
            id,
            name,
            slug,
            category,
            logo_url
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      const newSavedTool: SavedTool = {
        id: data.id,
        userId: session.user.id,
        toolId: tool.toolId,
        toolName: tool.toolName,
        toolCategory: tool.toolCategory,
        toolImage: tool.toolImage,
        savedAt: new Date(data.created_at),
      };

      setSavedTools((prev) => [newSavedTool, ...prev]);
      return { success: true, tool: newSavedTool };
    } catch (err) {
      console.error("Failed to save tool:", err);
      throw err;
    }
  };

  const unsaveTool = async (toolId: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("User must be authenticated to unsave tools");
      }

      const { error } = await supabase
        .from("user_saved_tools")
        .delete()
        .eq("tool_id", toolId)
        .eq("user_id", session.user.id);

      if (error) {
        throw error;
      }

      setSavedTools((prev) => prev.filter((t) => t.toolId !== toolId));
      return { success: true };
    } catch (err) {
      console.error("Failed to unsave tool:", err);
      throw err;
    }
  };

  const isToolSaved = (toolId: string) => {
    return savedTools.some((t) => t.toolId === toolId);
  };

  return {
    savedTools,
    saveTool,
    unsaveTool,
    isToolSaved,
    isLoading,
  };
}

/**
 * Alpha Bar slot for component display (transformed from database)
 */
interface AlphaBarSlotDisplay {
  id: string;
  toolId: string;
  toolSlug: string;
  toolName: string;
  toolDescription: string | null;
  toolImage: string | null;
  isSponsored: boolean;
  analytics?: {
    impressions: number;
    clicks: number;
    clickThroughRate: number;
  };
}

/**
 * Mock Alpha Bar slots for development/testing
 * These will be shown when no real slots exist in the database
 */
const MOCK_ALPHA_BAR_SLOTS: AlphaBarSlotDisplay[] = [
  {
    id: "mock_slot_1",
    toolId: "mock_tool_1",
    toolSlug: "voiceflow",
    toolName: "Voiceflow",
    toolDescription: "Build and deploy AI agents for customer support",
    toolImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NjM0NzQ3MTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isSponsored: true,
    analytics: {
      impressions: 4521,
      clicks: 189,
      clickThroughRate: 4.18,
    },
  },
  {
    id: "mock_slot_2",
    toolId: "mock_tool_2",
    toolSlug: "perplexity",
    toolName: "Perplexity AI",
    toolDescription: "AI-powered search engine with real-time answers",
    toolImage: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFyY2glMjBlbmdpbmV8ZW58MXx8fHwxNzYzNDc0NzIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    isSponsored: false,
    analytics: {
      impressions: 3847,
      clicks: 156,
      clickThroughRate: 4.06,
    },
  },
  {
    id: "mock_slot_3",
    toolId: "mock_tool_3",
    toolSlug: "gamma",
    toolName: "Gamma",
    toolDescription: "Create beautiful presentations with AI in seconds",
    toolImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBkZXNpZ258ZW58MXx8fHwxNzYzNDc0NzI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isSponsored: false,
    analytics: {
      impressions: 3214,
      clicks: 134,
      clickThroughRate: 4.17,
    },
  },
];

/**
 * Hook to get active Alpha Bar slots
 * 
 * @returns Array of active Alpha Bar slots (max 3)
 * Falls back to mock data if no real slots exist (for development)
 */
export function useAlphaBarSlots() {
  const [slots, setSlots] = useState<AlphaBarSlotDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlphaBarSlots() {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        // Fetch active alpha bar slots with tool data
        const { data, error } = await supabase
          .from("alpha_bar_slots")
          .select(`
            id,
            tool_id,
            is_sponsored,
            position,
            impressions,
            clicks,
            click_through_rate,
            tools:tool_id (
              id,
              name,
              slug,
              logo_url,
              short_description
            )
          `)
          .lte("start_date", now)
          .gte("end_date", now)
          .order("position", { ascending: true })
          .limit(3);

        if (error) {
          console.error("Error fetching alpha bar slots:", error);
          // Fall back to mock data on error
          setSlots(MOCK_ALPHA_BAR_SLOTS);
          setIsLoading(false);
          return;
        }

        // Transform the data to match component interface
        const transformedSlots = (data || [])
          .map((slot: any) => {
            const tool = slot.tools;
            if (!tool) return null;

            // Calculate CTR if we have clicks and impressions
            let clickThroughRate = 0;
            if (slot.impressions > 0 && slot.clicks > 0) {
              clickThroughRate = Number(
                ((slot.clicks / slot.impressions) * 100).toFixed(2)
              );
            } else if (slot.click_through_rate !== null) {
              clickThroughRate = Number(slot.click_through_rate);
            }

            return {
              id: slot.id,
              toolId: tool.id,
              toolSlug: tool.slug,
              toolName: tool.name,
              toolDescription: tool.short_description,
              toolImage: tool.logo_url,
              isSponsored: slot.is_sponsored || false,
              analytics: {
                impressions: slot.impressions || 0,
                clicks: slot.clicks || 0,
                clickThroughRate,
              },
            };
          })
          .filter((slot) => slot !== null) as AlphaBarSlotDisplay[];

        // If no real slots found, use mock data for development
        if (transformedSlots.length === 0) {
          setSlots(MOCK_ALPHA_BAR_SLOTS);
        } else {
          setSlots(transformedSlots);
        }
      } catch (err) {
        console.error("Failed to fetch alpha bar slots:", err);
        // Fall back to mock data on error
        setSlots(MOCK_ALPHA_BAR_SLOTS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlphaBarSlots();
  }, []);

  return {
    slots,
    isLoading,
  };
}
