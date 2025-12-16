import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, scoreName, visible } = body;

    if (!toolId || !scoreName || typeof visible !== "boolean") {
      return NextResponse.json(
        { error: "toolId, scoreName, and visible (boolean) are required" },
        { status: 400 }
      );
    }

    // Validate score name
    const validScoreNames = [
      "pinpoint_score",
      "sentiment_score",
      "features_score",
      "adoption_score",
      "pricing_score",
      "verification_score",
      "users_score",
      "trust_score",
    ];

    if (!validScoreNames.includes(scoreName)) {
      return NextResponse.json(
        { error: `Invalid score name: ${scoreName}` },
        { status: 400 }
      );
    }

    // Get current score_visibility
    const { data: tool, error: fetchError } = await supabase
      .from("tools")
      .select("score_visibility")
      .eq("id", toolId)
      .single();

    if (fetchError) {
      console.error("Error fetching tool:", fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // Update the specific score visibility
    const currentVisibility = tool?.score_visibility || {
      pinpoint_score: true,
      sentiment_score: true,
      features_score: true,
      adoption_score: true,
      pricing_score: true,
      verification_score: true,
      users_score: true,
      trust_score: true,
    };

    const updatedVisibility = {
      ...currentVisibility,
      [scoreName]: visible,
    };

    const { error } = await supabase
      .from("tools")
      .update({ score_visibility: updatedVisibility })
      .eq("id", toolId);

    if (error) {
      console.error("Error updating score visibility:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, score_visibility: updatedVisibility });
  } catch (error: any) {
    console.error("Error in update-score-visibility route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
