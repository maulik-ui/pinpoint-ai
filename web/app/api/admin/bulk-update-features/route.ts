import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates = [], additions = [], deletions = [], toolId } = body;

    if (!toolId) {
      return NextResponse.json(
        { error: "toolId is required" },
        { status: 400 }
      );
    }

    // Validate updates
    for (const update of updates) {
      if (!update.id) {
        return NextResponse.json(
          { error: "Each update must have an id" },
          { status: 400 }
        );
      }

      // Validate status
      const validStatuses = ["works", "mediocre", "fails"];
      if (update.status && !validStatuses.includes(update.status)) {
        return NextResponse.json(
          { error: `Invalid status: ${update.status}. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }

      // Validate feature_name length (20-60 characters)
      if (update.feature_name !== undefined) {
        const nameLength = update.feature_name.trim().length;
        if (nameLength < 20 || nameLength > 60) {
          return NextResponse.json(
            { error: `Feature name must be between 20 and 60 characters. Got ${nameLength} characters.` },
            { status: 400 }
          );
        }
      }
    }

    // Validate additions
    for (const addition of additions) {
      // Validate status
      const validStatuses = ["works", "mediocre", "fails"];
      if (addition.status && !validStatuses.includes(addition.status)) {
        return NextResponse.json(
          { error: `Invalid status: ${addition.status}. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }

      // Validate feature_name length (20-60 characters)
      const nameLength = addition.feature_name.trim().length;
      if (nameLength < 20 || nameLength > 60) {
        return NextResponse.json(
          { error: `Feature name must be between 20 and 60 characters. Got ${nameLength} characters.` },
          { status: 400 }
        );
      }
    }

    // Delete features
    if (deletions.length > 0) {
      const { error: deleteError } = await supabase
        .from("tool_features")
        .delete()
        .in("id", deletions);

      if (deleteError) {
        throw deleteError;
      }
    }

    // Update existing features
    const updatePromises = updates.map(async (update: any) => {
      const updateData: any = {};
      
      if (update.status) {
        updateData.status = update.status;
      }
      
      if (update.feature_name !== undefined) {
        updateData.feature_name = update.feature_name.trim();
      }

      if (update.display_order !== undefined) {
        updateData.display_order = update.display_order;
      }

      const { error } = await supabase
        .from("tool_features")
        .update(updateData)
        .eq("id", update.id);

      if (error) {
        throw error;
      }
    });

    await Promise.all(updatePromises);

    // Add new features
    if (additions.length > 0) {
      const newFeaturesData = additions.map((addition: any) => ({
        tool_id: toolId,
        feature_name: addition.feature_name.trim(),
        status: addition.status || "works",
        display_order: addition.display_order || null,
        last_checked_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("tool_features")
        .insert(newFeaturesData);

      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: updates.length,
      added: additions.length,
      deleted: deletions.length,
    });
  } catch (error: any) {
    console.error("Error in bulk-update-features route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

