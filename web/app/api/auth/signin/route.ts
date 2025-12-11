import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirect") || "/";

  // Create a temporary Supabase client to initiate OAuth
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Redirect to Google OAuth
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${request.nextUrl.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (data.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.json(
    { error: "Failed to initiate sign-in" },
    { status: 500 }
  );
}
