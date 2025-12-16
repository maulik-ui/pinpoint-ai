import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, section, visible } = body;

    if (!toolId || !section || typeof visible !== "boolean") {
      return NextResponse.json(
        { error: "toolId, section, and visible (boolean) are required" },
        { status: 400 }
      );
    }

    // Get current section_visibility
    const { data: tool, error: fetchError } = await supabase
      .from("tools")
      .select("section_visibility")
      .eq("id", toolId)
      .single();

    if (fetchError) {
      console.error("Error fetching tool:", fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // Update the specific section visibility
    const currentVisibility = tool?.section_visibility || {
      overview: true,
      traction: true,
      features: true,
      proscons: true,
      editor: true,
      verification: true,
      sentiment: true,
      demos: true,
      pricing: true,
      alternatives: true,
    };

    const updatedVisibility = {
      ...currentVisibility,
      [section]: visible,
    };

    const { error } = await supabase
      .from("tools")
      .update({ section_visibility: updatedVisibility })
      .eq("id", toolId);

    if (error) {
      console.error("Error updating section visibility:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, section_visibility: updatedVisibility });
  } catch (error: any) {
    console.error("Error in update-section-visibility route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
