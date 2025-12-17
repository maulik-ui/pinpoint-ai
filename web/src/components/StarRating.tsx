"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/src/lib/supabaseClientBrowser";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

interface StarRatingProps {
  toolId: string;
  toolSlug: string;
  className?: string;
}

export function StarRating({ toolId, toolSlug, className = "" }: StarRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const fetchRatings = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Fetch all ratings for this tool
      const { data: ratings, error } = await supabase
        .from("tool_ratings")
        .select("rating, user_id")
        .eq("tool_id", toolId);

      if (error) {
        // Log the full error for debugging
        console.log("Rating fetch error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        
        // Handle specific error cases
        if (error.code === "42P01" || error.code === "PGRST116") {
          // Table doesn't exist
          setUserRating(null);
          setAverageRating(null);
          setTotalRatings(0);
          setIsLoading(false);
          return;
        }
        
        // For RLS/permission errors, just set empty state
        if (error.code === "PGRST301" || error.message?.includes("permission") || error.message?.includes("RLS")) {
          setUserRating(null);
          setAverageRating(null);
          setTotalRatings(0);
          setIsLoading(false);
          return;
        }
        
        // For other errors, set empty state but don't spam console
        setUserRating(null);
        setAverageRating(null);
        setTotalRatings(0);
        setIsLoading(false);
        return;
      }

      // Calculate average rating
      const totalRatings = ratings?.length || 0;
      const averageRating =
        totalRatings > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
          : null;

      // Get user's rating if authenticated
      const userRating =
        user && ratings
          ? ratings.find((r) => r.user_id === user.id)?.rating ?? null
          : null;

      setUserRating(userRating);
      setAverageRating(averageRating);
      setTotalRatings(totalRatings);
    } catch (error: any) {
      // Log unexpected errors
      console.log("Unexpected error fetching ratings:", error);
      setUserRating(null);
      setAverageRating(null);
      setTotalRatings(0);
    } finally {
      setIsLoading(false);
    }
  }, [toolId, user]);

  useEffect(() => {
    const supabase = createClient();

    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch ratings when toolId or user changes
    fetchRatings();
  }, [fetchRatings]);

  const handleStarClick = async (rating: number) => {
    // If user is not authenticated, redirect to sign in
    if (!user) {
      // Store the current URL to redirect back after sign in
      const currentUrl = `/tool/${toolSlug}`;
      router.push(`/api/auth/signin?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      // Use Supabase client directly - it handles auth automatically via cookies
      const { data, error } = await supabase
        .from("tool_ratings")
        .upsert(
          {
            tool_id: toolId,
            user_id: user.id,
            rating: rating,
          },
          {
            onConflict: "tool_id,user_id",
          }
        )
        .select();

      if (error) {
        console.error("Error submitting rating:", error);
        if (error.code === "PGRST301" || error.message?.includes("permission")) {
          router.push(`/api/auth/signin?redirect=${encodeURIComponent(`/tool/${toolSlug}`)}`);
        } else {
          alert(error.message || "Failed to submit rating");
        }
        return;
      }

      // Refresh ratings after successful submission
      await fetchRatings();
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredStar !== null ? hoveredStar : (userRating || averageRating || 0);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className="w-5 h-5 rounded animate-pulse bg-secondary/30"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isUserRating = userRating !== null && star <= userRating;
          
          return (
            <motion.button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              disabled={isSubmitting}
              className="transition-all cursor-pointer hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  isFilled
                    ? isUserRating
                      ? "fill-primary text-primary"
                      : "fill-primary/60 text-primary/60"
                    : "fill-transparent text-muted-foreground/30"
                } hover:text-primary`}
                strokeWidth={1.5}
              />
            </motion.button>
          );
        })}
      </div>
      
      {averageRating !== null && totalRatings > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{averageRating.toFixed(1)}</span>
          <span className="text-xs">({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})</span>
        </div>
      )}
      
      {userRating !== null && (
        <span className="text-xs text-muted-foreground">Your rating</span>
      )}
    </div>
  );
}

