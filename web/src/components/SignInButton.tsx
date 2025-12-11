"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabaseClientBrowser";

export default function SignInButton() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignIn = async (provider: "google" | "apple") => {
    setLoading(provider);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error("Sign-in error:", error);
        alert(`Sign-in failed: ${error.message}`);
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("An error occurred during sign-in");
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity text-sm"
        style={{ fontWeight: 500 }}
      >
        Sign In
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-[16px] border border-border/50 shadow-lg z-50 p-4">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSignIn("google")}
                disabled={loading !== null}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-card border border-border/50 rounded-full hover:bg-secondary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "google" ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span className="text-sm" style={{ fontWeight: 500 }}>
                  {loading === "google" ? "Signing in..." : "Continue with Google"}
                </span>
              </button>

              <button
                onClick={() => handleSignIn("apple")}
                disabled={loading !== null}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-card border border-border/50 rounded-full hover:bg-secondary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "apple" ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                )}
                <span className="text-sm" style={{ fontWeight: 500 }}>
                  {loading === "apple" ? "Signing in..." : "Continue with Apple"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

