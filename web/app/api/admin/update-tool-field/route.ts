import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, field, value } = body;

    if (!toolId || !field) {
      return NextResponse.json(
        { error: "toolId and field are required" },
        { status: 400 }
      );
    }

    // Handle different field types
    let updateData: any = {};

    if (field === "name" || field === "short_description" || field === "tool_overview" || 
        field === "category" || field === "pricing_model" || field === "website_url" || 
        field === "logo_url" || field === "company_name") {
      // Direct tool fields
      updateData[field] = value;
    } else if (field === "pros" || field === "cons") {
      // Pros/cons are stored in sentiment runs - we'll update the most recent one
      // For now, we'll store in domain_data as a fallback
      const { data: tool } = await supabase
        .from("tools")
        .select("domain_data")
        .eq("id", toolId)
        .single();

      const domainData = tool?.domain_data || {};
      if (!domainData.pros_cons) {
        domainData.pros_cons = {};
      }
      domainData.pros_cons[field] = value;

      updateData.domain_data = domainData;
    } else if (field === "editor_note") {
      // Editor's note - store in domain_data
      const { data: tool } = await supabase
        .from("tools")
        .select("domain_data")
        .eq("id", toolId)
        .single();

      const domainData = tool?.domain_data || {};
      domainData.editor_note = value;

      updateData.domain_data = domainData;
    } else if (field === "functionality_blocks") {
      // Functionality blocks - store in domain_data
      const { data: tool } = await supabase
        .from("tools")
        .select("domain_data")
        .eq("id", toolId)
        .single();

      const domainData = tool?.domain_data || {};
      domainData.functionality_blocks = value;

      updateData.domain_data = domainData;
    } else {
      return NextResponse.json(
        { error: `Unknown field: ${field}` },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("tools")
      .update(updateData)
      .eq("id", toolId);

    if (error) {
      console.error("Error updating tool field:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in update-tool-field route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

