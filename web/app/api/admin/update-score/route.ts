import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, scoreName, value } = body;

    if (!toolId || !scoreName || value === undefined) {
      return NextResponse.json(
        { error: "toolId, scoreName, and value are required" },
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

    // Validate value is between 0 and 10
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 10) {
      return NextResponse.json(
        { error: "Score value must be between 0 and 10" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("tools")
      .update({ [scoreName]: numValue })
      .eq("id", toolId);

    if (error) {
      console.error("Error updating score:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in update-score route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
