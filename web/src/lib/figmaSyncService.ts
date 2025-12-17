/**
 * Figma Sync Service
 * 
 * Service to sync design tokens from Figma and update the application
 */

import { 
  extractColorTokens, 
  extractTypographyTokens, 
  extractSpacingTokens,
  generateCSSVariables
} from './figma-sync';
import { getFigmaFile, type DesignTokens } from './figma';

export interface SyncOptions {
  fileKey: string;
  frames?: {
    colors?: string;
    typography?: string;
    spacing?: string;
  };
  generateCSS?: boolean;
  updateTailwind?: boolean;
}

export interface SyncResult {
  success: boolean;
  tokens: DesignTokens;
  metadata: {
    syncedAt: string;
    fileKey: string;
    fileName: string;
    lastModified: string;
    tokenCounts: {
      colors: number;
      typography: number;
      spacing: number;
    };
  };
  css?: string;
  tailwindConfig?: string;
}

/**
 * Sync design tokens from Figma
 */
export async function syncDesignTokens(options: SyncOptions): Promise<SyncResult> {
  const {
    fileKey,
    frames = { colors: 'Colors', typography: 'Typography', spacing: 'Spacing' },
    generateCSS = true,
  } = options;

  // Extract tokens from Figma
  const [colors, typography, spacing] = await Promise.all([
    extractColorTokens(frames.colors || 'Colors', fileKey).catch(() => ({})),
    extractTypographyTokens(frames.typography || 'Typography', fileKey).catch(() => ({})),
    extractSpacingTokens(frames.spacing || 'Spacing', fileKey).catch(() => ({})),
  ]);

  const tokens: DesignTokens = {
    colors,
    typography,
    spacing,
    radii: {},
  };

  // Get file metadata
  const file = await getFigmaFile(fileKey);

  const metadata = {
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

  let css: string | undefined;
  if (generateCSS) {
    css = generateCSSVariables(tokens);
  }

  return {
    success: true,
    tokens,
    metadata,
    css,
  };
}

/**
 * Check if Figma file has been updated since last sync
 */
export async function checkForUpdates(
  fileKey: string,
  lastSyncedAt: string
): Promise<{ hasUpdates: boolean; lastModified: string }> {
  const file = await getFigmaFile(fileKey);
  const lastSynced = new Date(lastSyncedAt);
  const lastModified = new Date(file.lastModified);

  return {
    hasUpdates: lastModified > lastSynced,
    lastModified: file.lastModified,
  };
}

/**
 * Generate Tailwind config from design tokens
 */
export function generateTailwindConfigFromTokens(tokens: DesignTokens): string {
  const config = {
    theme: {
      extend: {
        colors: tokens.colors,
        fontSize: Object.entries(tokens.typography).reduce((acc, [name, value]) => {
          acc[name] = [value.fontSize, { lineHeight: value.lineHeight }];
          return acc;
        }, {} as Record<string, any>),
        spacing: tokens.spacing,
        borderRadius: tokens.radii,
      },
    },
  };

  return `// Auto-generated from Figma - Do not edit manually
// Last synced: ${new Date().toISOString()}
export default ${JSON.stringify(config, null, 2)}`;
}

