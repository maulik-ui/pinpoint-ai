"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/src/lib/supabaseClientBrowser";
import { User, LogOut } from "lucide-react";

interface UserProfileProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign-out error:", error);
        alert(`Sign-out failed: ${error.message}`);
      } else {
        router.refresh();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Sign-out error:", error);
      alert("An error occurred during sign-out");
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary/50 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        )}
        <span className="text-sm hidden sm:block" style={{ fontWeight: 500 }}>
          {displayName}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-[16px] border border-border/50 shadow-lg z-50 py-2">
            <Link
              href="/user"
              className="block px-4 py-3 border-b border-border/30 hover:bg-secondary/30 transition-colors"
            >
              <p className="text-sm font-semibold">{displayName}</p>
              {user.email && (
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              )}
            </Link>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loading ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

