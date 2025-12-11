import { NextResponse } from "next/server";
import { enrichToolByName } from "@/src/lib/toolEnrichment";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const toolName = body?.toolName?.toString().trim();
  const companyName = body?.companyName?.toString().trim() || null;
  const websiteUrl = body?.websiteUrl?.toString().trim() || null;
  const category = body?.category?.toString().trim() || null;

  if (!toolName) {
    return NextResponse.json(
      { error: "toolName is required" },
      { status: 400 }
    );
  }

  try {
    const enrichment = await enrichToolByName(toolName, companyName, websiteUrl, category);
    return NextResponse.json(enrichment);
  } catch (err) {
    console.error("enrichToolByName failed", err);
    return NextResponse.json(
      { error: "Unable to enrich tool", detail: String(err) },
      { status: 500 }
    );
  }
}
