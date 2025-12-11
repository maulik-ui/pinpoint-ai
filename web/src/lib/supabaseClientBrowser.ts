// Client-side Supabase client for browser usage
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  );

  // Handle auth errors globally
  if (typeof window !== 'undefined') {
    client.auth.onAuthStateChange((event, session) => {
      // Clear session on token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        client.auth.signOut({ scope: 'local' });
      }
    });
  }

  return client;
}

