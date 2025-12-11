"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabaseClientBrowser";
import SignInButton from "./SignInButton";
import UserProfile from "./UserProfile";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary/50 animate-pulse" />
    );
  }

  if (user) {
    return <UserProfile user={user} />;
  }

  return <SignInButton />;
}

