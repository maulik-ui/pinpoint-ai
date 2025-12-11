import { NextResponse } from "next/server";
import { 
  extractColorTokens, 
  extractTypographyTokens, 
  extractSpacingTokens,
  generateCSSVariables,
  type DesignTokens 
} from "@/src/lib/figma-sync";
import { getFigmaFile } from "@/src/lib/figma";
import { writeFileSync } from "fs";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      fileKey, 
      frames = { colors: 'Colors', typography: 'Typography', spacing: 'Spacing' },
      generateCSS = true,
      updateGlobals = true 
    } = body;

    if (!fileKey) {
      return NextResponse.json(
        { error: "Missing fileKey parameter" },
        { status: 400 }
      );
    }

    // Extract design tokens from Figma
    const [colors, typography, spacing] = await Promise.all([
      extractColorTokens(frames.colors, fileKey).catch(() => ({})),
      extractTypographyTokens(frames.typography, fileKey).catch(() => ({})),
      extractSpacingTokens(frames.spacing, fileKey).catch(() => ({})),
    ]);

    const tokens: DesignTokens = {
      colors,
      typography,
      spacing,
      radii: {}, // Can be extracted similarly if needed
    };

    // Get file metadata
    const file = await getFigmaFile(fileKey);
    const syncMetadata = {
      syncedAt: new Date().toISOString(),
      fileKey,
      fileName: file.name,
      lastModified: file.lastModified,
      tokenCounts: {
        colors: Object.keys(colors).length,
        typography: Object.keys(typography).length,
        spacing: Object.keys(spacing).length,
      },
    };

    let cssContent = '';
    if (generateCSS) {
      cssContent = generateCSSVariables(tokens);
      
      // Save to file if in server environment
      if (typeof window === 'undefined') {
        try {
          const cssPath = join(process.cwd(), 'styles', 'figma-tokens.css');
          writeFileSync(cssPath, cssContent, 'utf-8');
        } catch (err) {
          console.warn('Could not write CSS file:', err);
        }
      }
    }

    // Update globals.css if requested
    if (updateGlobals && typeof window === 'undefined') {
      try {
        const globalsPath = join(process.cwd(), 'app', 'globals.css');
        // This would require reading, parsing, and updating the CSS file
        // For now, we'll return the tokens and let the frontend handle it
      } catch (err) {
        console.warn('Could not update globals.css:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Design tokens synced successfully",
      tokens,
      metadata: syncMetadata,
      css: generateCSS ? cssContent : undefined,
    });
  } catch (error: any) {
    console.error("Figma sync error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to sync design tokens",
        message: error?.message || "Unknown error",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
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

    // Get file metadata to check last modified
    const file = await getFigmaFile(fileKey);

    return NextResponse.json({
      fileKey,
      fileName: file.name,
      lastModified: file.lastModified,
      components: Object.keys(file.components || {}).length,
      styles: Object.keys(file.styles || {}).length,
      readyToSync: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to check sync status",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
