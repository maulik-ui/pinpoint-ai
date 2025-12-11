/**
 * Billing Hooks
 * 
 * Custom React hooks for managing user plans, subscriptions, and founder status.
 * These hooks use stubbed data for now and can be wired to Supabase later.
 */

import { useState, useEffect } from 'react';
import { UserProfile, UserSubscription, SavedTool, AlphaBarSlot } from '../types/billing';
import { getPlanById } from '../lib/billing/plans';

/**
 * Hook to get the current user's plan information
 * 
 * @returns Object containing user plan details and helper functions
 * 
 * TODO: Wire this to Supabase auth and user_subscriptions table
 * Example query: SELECT * FROM user_subscriptions WHERE user_id = auth.uid() AND status = 'active'
 */
export function useCurrentUserPlan() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // STUB: Simulating user data fetch
    // In production, replace with actual Supabase query:
    // const { data: profile } = await supabase
    //   .from('user_profiles')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .single();
    
    const mockUserProfile: UserProfile = {
      id: 'user_123',
      email: 'demo@pinpointai.com',
      displayName: 'Demo User',
      avatarUrl: undefined,
      currentPlan: 'free', // Change to 'premium_monthly' or 'premium_yearly' to test
      isFounder: false,
      createdAt: new Date('2025-01-01'),
      metadata: {},
    };

    setUserProfile(mockUserProfile);
    setIsLoading(false);
  }, []);

  const currentPlan = userProfile ? getPlanById(userProfile.currentPlan) : null;
  const isPremium = userProfile ? 
    (userProfile.currentPlan === 'premium_monthly' || userProfile.currentPlan === 'premium_yearly') : 
    false;
  const isFree = userProfile?.currentPlan === 'free';

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
 * 
 * TODO: Wire this to Supabase founder_orders and alpha_bar_slots tables
 */
export function useFounderStatus() {
  const [isFounder, setIsFounder] = useState(false);
  const [listedTools, setListedTools] = useState<any[]>([]);
  const [activeAlphaSlots, setActiveAlphaSlots] = useState<AlphaBarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // STUB: Simulating founder data fetch
    // In production, replace with actual Supabase query:
    // const { data: orders } = await supabase
    //   .from('founder_orders')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .eq('status', 'completed');
    
    // For demo purposes, set to false. Change to true to test founder features.
    setIsFounder(false);
    setListedTools([]);
    setActiveAlphaSlots([]);
    setIsLoading(false);
  }, []);

  return {
    isFounder,
    listedTools,
    activeAlphaSlots,
    hasActiveRechecks: listedTools.some(tool => tool.hasActiveRecheck),
    hasActiveSponsorship: activeAlphaSlots.some(slot => slot.isSponsored),
    isLoading,
  };
}

/**
 * Hook to manage saved/bookmarked tools
 * 
 * @returns Object containing saved tools and management functions
 * 
 * TODO: Wire this to Supabase saved_tools table
 */
export function useSavedTools() {
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // STUB: Simulating saved tools fetch
    // In production, replace with actual Supabase query:
    // const { data: saved } = await supabase
    //   .from('saved_tools')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .order('saved_at', { ascending: false });
    
    const mockSavedTools: SavedTool[] = [
      {
        id: 'saved_1',
        userId: 'user_123',
        toolId: 'chatgpt',
        toolName: 'ChatGPT',
        toolCategory: 'Conversational AI',
        toolImage: 'https://images.unsplash.com/photo-1597075095391-f15c2f9f359a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNobm9sb2d5JTIwaW50ZXJmYWNlfGVufDF8fHx8MTc2MzQ3MDI2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        savedAt: new Date('2025-11-15'),
      },
      {
        id: 'saved_2',
        userId: 'user_123',
        toolId: 'midjourney',
        toolName: 'Midjourney',
        toolCategory: 'Image Generation',
        toolImage: 'https://images.unsplash.com/photo-1595411425732-e69c1abe2763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHBhdHRlcm58ZW58MXx8fHwxNzYzNDA3NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        savedAt: new Date('2025-11-18'),
      },
    ];

    setSavedTools(mockSavedTools);
    setIsLoading(false);
  }, []);

  const saveTool = async (tool: Omit<SavedTool, 'id' | 'userId' | 'savedAt'>) => {
    // STUB: In production, insert into Supabase
    // const { data, error } = await supabase
    //   .from('saved_tools')
    //   .insert([{ ...tool, user_id: user.id }])
    //   .select()
    //   .single();
    
    const newSavedTool: SavedTool = {
      id: `saved_${Date.now()}`,
      userId: 'user_123',
      ...tool,
      savedAt: new Date(),
    };

    setSavedTools(prev => [newSavedTool, ...prev]);
    return { success: true, tool: newSavedTool };
  };

  const unsaveTool = async (toolId: string) => {
    // STUB: In production, delete from Supabase
    // await supabase
    //   .from('saved_tools')
    //   .delete()
    //   .eq('tool_id', toolId)
    //   .eq('user_id', user.id);
    
    setSavedTools(prev => prev.filter(t => t.toolId !== toolId));
    return { success: true };
  };

  const isToolSaved = (toolId: string) => {
    return savedTools.some(t => t.toolId === toolId);
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
 * Hook to get active Alpha Bar slots
 * 
 * @returns Array of active Alpha Bar slots (max 3)
 * 
 * TODO: Wire this to Supabase alpha_bar_slots table
 */
export function useAlphaBarSlots() {
  const [slots, setSlots] = useState<AlphaBarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // STUB: Simulating Alpha Bar slots fetch
    // In production, replace with actual Supabase query:
    // const { data: activeSlots } = await supabase
    //   .from('alpha_bar_slots')
    //   .select('*')
    //   .lte('start_date', new Date().toISOString())
    //   .gte('end_date', new Date().toISOString())
    //   .order('start_date', { ascending: true })
    //   .limit(3);
    
    const now = new Date();
    const mockSlots: AlphaBarSlot[] = [
      {
        id: 'slot_1',
        toolId: 'voiceflow',
        toolName: 'Voiceflow',
        toolDescription: 'Build and deploy AI agents for customer support',
        toolImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NjM0NzQ3MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        companyName: 'Voiceflow Inc.',
        founderId: 'founder_1',
        isSponsored: true,
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        analytics: {
          impressions: 4521,
          clicks: 189,
          clickThroughRate: 4.18,
        },
      },
      {
        id: 'slot_2',
        toolId: 'perplexity',
        toolName: 'Perplexity AI',
        toolDescription: 'AI-powered search engine with real-time answers',
        toolImage: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFyY2glMjBlbmdpbmV8ZW58MXx8fHwxNzYzNDc0NzIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        companyName: 'Perplexity AI Inc.',
        founderId: 'founder_2',
        isSponsored: false,
        startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        analytics: {
          impressions: 3847,
          clicks: 156,
          clickThroughRate: 4.06,
        },
      },
      {
        id: 'slot_3',
        toolId: 'gamma',
        toolName: 'Gamma',
        toolDescription: 'Create beautiful presentations with AI in seconds',
        toolImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBkZXNpZ258ZW58MXx8fHwxNzYzNDc0NzI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        companyName: 'Gamma Technologies',
        founderId: 'founder_3',
        isSponsored: false,
        startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        analytics: {
          impressions: 3214,
          clicks: 134,
          clickThroughRate: 4.17,
        },
      },
    ];

    setSlots(mockSlots);
    setIsLoading(false);
  }, []);

  return {
    slots,
    isLoading,
  };
}