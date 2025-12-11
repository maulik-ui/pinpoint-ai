import { NextResponse } from "next/server";
import { getFigmaImages } from "@/src/lib/figma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get("fileKey");
    const nodeIds = searchParams.get("nodeIds");
    const format = (searchParams.get("format") || "png") as "png" | "jpg" | "svg" | "pdf";
    const scale = parseInt(searchParams.get("scale") || "2");

    if (!fileKey) {
      return NextResponse.json(
        { error: "Missing fileKey parameter" },
        { status: 400 }
      );
    }

    if (!nodeIds) {
      return NextResponse.json(
        { error: "Missing nodeIds parameter (comma-separated)" },
        { status: 400 }
      );
    }

    const nodeIdsArray = nodeIds.split(",").map((id) => id.trim());

    const result = await getFigmaImages(nodeIdsArray, format, scale, fileKey);

    return NextResponse.json({
      success: true,
      images: result.images,
      format,
      scale,
    });
  } catch (error: any) {
    console.error("Figma images error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch images",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

