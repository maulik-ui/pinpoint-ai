import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureId, status } = body;

    if (!featureId || !status) {
      return NextResponse.json(
        { error: "featureId and status are required" },
        { status: 400 }
      );
    }

    // Database enum accepts: works, mediocre, fails
    const validStatuses = ["works", "mediocre", "fails"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("tool_features")
      .update({ status })
      .eq("id", featureId);

    if (error) {
      console.error("Error updating feature status:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in update-feature-status route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

