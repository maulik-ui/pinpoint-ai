import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Create a Supabase client with auth from the request
 */
async function createServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Try to get token from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  // Fall back to cookies
  const cookieStore = await cookies();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      storage: {
        getItem: (key: string) => {
          return cookieStore.get(key)?.value ?? null;
        },
        setItem: () => {
          // No-op in API routes
        },
        removeItem: () => {
          // No-op in API routes
        },
      },
    },
  });
}

/**
 * Save or unsave a tool for the current user
 * POST /api/tool/[slug]/save
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action; // "save" or "unsave"

    if (!action || (action !== "save" && action !== "unsave")) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createServerClient(request);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tool ID from slug
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id")
      .eq("slug", slug)
      .single();

    if (toolError || !tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    if (action === "save") {
      // Insert (ignore if already exists due to UNIQUE constraint)
      const { error: insertError } = await supabase
        .from("user_saved_tools")
        .insert({
          user_id: session.user.id,
          tool_id: tool.id,
        });

      if (insertError) {
        // If already exists, that's fine
        if (insertError.code === "23505") {
          return NextResponse.json({ saved: true });
        }
        return NextResponse.json({ error: "Failed to save tool" }, { status: 500 });
      }

      return NextResponse.json({ saved: true });
    } else {
      // Delete
      const { error: deleteError } = await supabase
        .from("user_saved_tools")
        .delete()
        .eq("user_id", session.user.id)
        .eq("tool_id", tool.id);

      if (deleteError) {
        return NextResponse.json({ error: "Failed to unsave tool" }, { status: 500 });
      }

      return NextResponse.json({ saved: false });
    }
  } catch (error) {
    console.error("Error in save/unsave route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Check if a tool is saved by the current user
 * GET /api/tool/[slug]/save
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ saved: false });
    }

    // Get authenticated user
    const supabase = await createServerClient(request);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ saved: false });
    }

    // Get tool ID from slug
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id")
      .eq("slug", slug)
      .single();

    if (toolError || !tool) {
      return NextResponse.json({ saved: false });
    }

    // Check if saved
    const { data, error } = await supabase
      .from("user_saved_tools")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("tool_id", tool.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ saved: false });
    }

    return NextResponse.json({ saved: !!data });
  } catch (error) {
    return NextResponse.json({ saved: false });
  }
}
