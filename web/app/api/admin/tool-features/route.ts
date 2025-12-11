import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const toolId = searchParams.get("toolId");

  if (!toolId) {
    return NextResponse.json(
      { error: "toolId is required" },
      { status: 400 }
    );
  }

  try {
    const { data: features, error } = await supabase
      .from("tool_features")
      .select("*")
      .eq("tool_id", toolId)
      .order("feature_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch features", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ features: features || [] });
  } catch (err) {
    console.error("Failed to fetch features", err);
    return NextResponse.json(
      { error: "Unable to fetch features", detail: String(err) },
      { status: 500 }
    );
  }
}


