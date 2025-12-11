import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Clear any additional cookies if needed
    const cookieStore = await cookies();
    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign-out error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign-out" },
      { status: 500 }
    );
  }
}

