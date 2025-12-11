import { NextResponse } from "next/server";
import { getFigmaFile, findNodeByName, figmaColorToHex } from "@/src/lib/figma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get("fileKey");

    if (!fileKey) {
      return NextResponse.json(
        { error: "Missing fileKey parameter" },
        { status: 400 }
      );
    }

    // Fetch Figma file
    const file = await getFigmaFile(fileKey);

    // Extract design tokens
    const tokens = {
      colors: {} as Record<string, string>,
      typography: {} as Record<string, any>,
      spacing: {} as Record<string, string>,
    };

    // Extract colors from styles
    if (file.styles) {
      Object.entries(file.styles).forEach(([id, style]: [string, any]) => {
        if (style.styleType === "FILL") {
          // Note: To get actual color values, you'd need to fetch style details
          tokens.colors[style.name] = id;
        }
      });
    }

    // Try to find a "Colors" frame in the document
    const colorsFrame = findNodeByName(file.document, "Colors");
    if (colorsFrame && colorsFrame.children) {
      colorsFrame.children.forEach((child: any) => {
        if (child.fills && child.fills[0]?.color) {
          const colorHex = figmaColorToHex(child.fills[0].color);
          tokens.colors[child.name || `color-${child.id}`] = colorHex;
        }
      });
    }

    return NextResponse.json({
      success: true,
      tokens,
      file: {
        name: file.name,
        lastModified: file.lastModified,
      },
    });
  } catch (error: any) {
    console.error("Figma design tokens error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch design tokens",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

