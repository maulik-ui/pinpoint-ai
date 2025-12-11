import { NextResponse } from "next/server";
import { getFigmaFile, findNodesByType } from "@/src/lib/figma";

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

    // Get file structure
    const file = await getFigmaFile(fileKey);

    // Find all frames (potential token containers)
    const frames = findNodesByType(file.document, 'FRAME');
    const pages = findNodesByType(file.document, 'CANVAS');

    // Extract frame names and their children
    const frameStructure = frames.map((frame: any) => ({
      id: frame.id,
      name: frame.name,
      type: frame.type,
      childrenCount: frame.children?.length || 0,
      children: frame.children?.slice(0, 10).map((child: any) => ({
        id: child.id,
        name: child.name,
        type: child.type,
        hasFills: !!child.fills,
        fillType: child.fills?.[0]?.type,
      })) || [],
    }));

    // Find potential color frames (frames with "color" in name, case-insensitive)
    const colorFrames = frames.filter((f: any) => 
      f.name.toLowerCase().includes('color')
    );

    // Find potential typography frames
    const typographyFrames = frames.filter((f: any) => 
      f.name.toLowerCase().includes('typography') || 
      f.name.toLowerCase().includes('text') ||
      f.name.toLowerCase().includes('font')
    );

    // Find potential spacing frames
    const spacingFrames = frames.filter((f: any) => 
      f.name.toLowerCase().includes('spacing') ||
      f.name.toLowerCase().includes('space')
    );

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        lastModified: file.lastModified,
      },
      structure: {
        totalFrames: frames.length,
        totalPages: pages.length,
        frames: frameStructure,
      },
      suggestions: {
        colorFrames: colorFrames.map((f: any) => ({
          name: f.name,
          id: f.id,
          childrenCount: f.children?.length || 0,
        })),
        typographyFrames: typographyFrames.map((f: any) => ({
          name: f.name,
          id: f.id,
          childrenCount: f.children?.length || 0,
        })),
        spacingFrames: spacingFrames.map((f: any) => ({
          name: f.name,
          id: f.id,
          childrenCount: f.children?.length || 0,
        })),
      },
      allFrameNames: frames.map((f: any) => f.name),
    });
  } catch (error: any) {
    console.error("Figma explore error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to explore Figma file",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

