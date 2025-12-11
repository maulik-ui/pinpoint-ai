/**
 * Figma Design System Sync Utilities
 * 
 * These utilities help sync your Figma design system with your codebase:
 * - Extract and sync color tokens
 * - Extract and sync typography
 * - Download and organize assets
 * - Generate CSS/Tailwind config from Figma
 */

import {
  getFigmaFile,
  getFigmaImages,
  findNodeByName,
  findNodesByType,
  figmaColorToCSS,
  figmaColorToHex,
  type FigmaNode,
  type DesignTokens,
} from './figma';

/**
 * Extract color tokens from a specific Figma frame/page
 * 
 * Usage: Create a frame in Figma called "Colors" with rectangles named by color token
 * Example: "primary", "secondary", "background", etc.
 */
export async function extractColorTokens(
  frameName: string = 'Colors',
  fileKey?: string
): Promise<Record<string, string>> {
  const file = await getFigmaFile(fileKey);
  
  // Try exact match first
  let colorsFrame = findNodeByName(file.document, frameName, true);
  
  // If not found, try case-insensitive
  if (!colorsFrame) {
    colorsFrame = findNodeByName(file.document, frameName, false);
    if (colorsFrame && colorsFrame.name !== frameName) {
      console.warn(`Found frame "${colorsFrame.name}" (case-insensitive match for "${frameName}")`);
    }
  }
  
  if (!colorsFrame) {
    console.warn(`Frame "${frameName}" not found in Figma file (tried case-sensitive and case-insensitive)`);
    return {};
  }

  const colors: Record<string, string> = {};

  function extractColors(node: FigmaNode) {
    // Extract color from fills
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        const colorName = node.name.toLowerCase().replace(/\s+/g, '-');
        colors[colorName] = figmaColorToHex(fill.color);
      }
    }

    // Recursively process children
    if (node.children) {
      node.children.forEach(extractColors);
    }
  }

  extractColors(colorsFrame);
  return colors;
}

/**
 * Extract typography tokens from Figma text styles
 * 
 * This looks for text nodes and extracts their styles
 */
export async function extractTypographyTokens(
  frameName: string = 'Typography',
  fileKey?: string
): Promise<Record<string, any>> {
  const file = await getFigmaFile(fileKey);
  
  // Try exact match first, then case-insensitive
  let typographyFrame = findNodeByName(file.document, frameName, true);
  if (!typographyFrame) {
    typographyFrame = findNodeByName(file.document, frameName, false);
  }
  
  if (!typographyFrame) {
    console.warn(`Frame "${frameName}" not found in Figma file`);
    return {};
  }

  const typography: Record<string, any> = {};

  function extractTypography(node: FigmaNode) {
    if (node.type === 'TEXT') {
      const tokenName = node.name.toLowerCase().replace(/\s+/g, '-');
      typography[tokenName] = {
        fontFamily: node.style?.fontFamily || 'Inter',
        fontSize: `${node.style?.fontSize || 16}px`,
        fontWeight: node.style?.fontWeight || 400,
        lineHeight: node.style?.lineHeightPx 
          ? `${node.style.lineHeightPx}px` 
          : node.style?.lineHeightPercentFontSize 
          ? `${node.style.lineHeightPercentFontSize}%`
          : '1.5',
        letterSpacing: node.style?.letterSpacing ? `${node.style.letterSpacing}px` : undefined,
      };
    }

    if (node.children) {
      node.children.forEach(extractTypography);
    }
  }

  extractTypography(typographyFrame);
  return typography;
}

/**
 * Extract spacing tokens from Figma
 * 
 * Usage: Create a frame called "Spacing" with rectangles/frames of different sizes
 * Name them like: "spacing-xs", "spacing-sm", "spacing-md", etc.
 */
export async function extractSpacingTokens(
  frameName: string = 'Spacing',
  fileKey?: string
): Promise<Record<string, string>> {
  const file = await getFigmaFile(fileKey);
  
  // Try exact match first, then case-insensitive
  let spacingFrame = findNodeByName(file.document, frameName, true);
  if (!spacingFrame) {
    spacingFrame = findNodeByName(file.document, frameName, false);
  }
  
  if (!spacingFrame) {
    console.warn(`Frame "${frameName}" not found in Figma file`);
    return {};
  }

  const spacing: Record<string, string> = {};

  function extractSpacing(node: FigmaNode) {
    if (node.absoluteBoundingBox && node.name.includes('spacing')) {
      const tokenName = node.name.toLowerCase().replace(/\s+/g, '-');
      const value = node.absoluteBoundingBox.width || node.absoluteBoundingBox.height;
      spacing[tokenName] = `${value}px`;
    }

    if (node.children) {
      node.children.forEach(extractSpacing);
    }
  }

  extractSpacing(spacingFrame);
  return spacing;
}

/**
 * Generate CSS custom properties from design tokens
 */
export function generateCSSVariables(tokens: DesignTokens): string {
  let css = ':root {\n';
  
  // Colors
  Object.entries(tokens.colors).forEach(([name, value]) => {
    css += `  --color-${name}: ${value};\n`;
  });
  
  // Typography
  Object.entries(tokens.typography).forEach(([name, value]) => {
    css += `  --typography-${name}-family: ${value.fontFamily};\n`;
    css += `  --typography-${name}-size: ${value.fontSize};\n`;
    css += `  --typography-${name}-weight: ${value.fontWeight};\n`;
    css += `  --typography-${name}-line-height: ${value.lineHeight};\n`;
    if (value.letterSpacing) {
      css += `  --typography-${name}-letter-spacing: ${value.letterSpacing};\n`;
    }
  });
  
  // Spacing
  Object.entries(tokens.spacing).forEach(([name, value]) => {
    css += `  --${name}: ${value};\n`;
  });
  
  // Radii
  Object.entries(tokens.radii).forEach(([name, value]) => {
    css += `  --radius-${name}: ${value};\n`;
  });
  
  css += '}\n';
  return css;
}

/**
 * Generate Tailwind config from Figma tokens
 */
export function generateTailwindConfig(tokens: DesignTokens): string {
  const config = {
    theme: {
      extend: {
        colors: tokens.colors,
        fontSize: Object.entries(tokens.typography).reduce((acc, [name, value]) => {
          acc[name] = value.fontSize;
          return acc;
        }, {} as Record<string, string>),
        spacing: tokens.spacing,
        borderRadius: tokens.radii,
      },
    },
  };
  
  return `// Generated from Figma
export default ${JSON.stringify(config, null, 2)}`;
}

/**
 * Download all assets (images, icons) from a specific frame
 */
export async function downloadAssets(
  frameName: string = 'Assets',
  outputDir: string = '/public/assets',
  fileKey?: string
): Promise<{ name: string; url: string; nodeId: string }[]> {
  const file = await getFigmaFile(fileKey);
  const assetsFrame = findNodeByName(file.document, frameName);
  
  if (!assetsFrame) {
    console.warn(`Frame "${frameName}" not found in Figma file`);
    return [];
  }

  // Find all nodes that should be exported as assets
  const assetNodes: FigmaNode[] = [];
  
  function findAssets(node: FigmaNode) {
    // Export components, icons, and image-filled rectangles
    if (
      node.type === 'COMPONENT' ||
      node.name.toLowerCase().includes('icon') ||
      node.name.toLowerCase().includes('logo') ||
      (node.fills && node.fills.some(f => f.type === 'IMAGE'))
    ) {
      assetNodes.push(node);
    }

    if (node.children) {
      node.children.forEach(findAssets);
    }
  }

  findAssets(assetsFrame);

  // Get image URLs for all assets
  const nodeIds = assetNodes.map(node => node.id);
  
  if (nodeIds.length === 0) {
    console.log('No assets found to download');
    return [];
  }

  const { images } = await getFigmaImages(nodeIds, 'png', 2, fileKey);

  const assets = assetNodes.map((node) => ({
    name: node.name,
    url: images[node.id],
    nodeId: node.id,
  }));

  console.log(`Found ${assets.length} assets to download`);
  return assets;
}

/**
 * Extract component metadata (useful for documentation)
 */
export async function extractComponentMetadata(
  componentName: string,
  fileKey?: string
): Promise<{
  name: string;
  description: string;
  props: any[];
  previewUrl?: string;
} | null> {
  const file = await getFigmaFile(fileKey);
  const component = findNodeByName(file.document, componentName);
  
  if (!component) {
    console.warn(`Component "${componentName}" not found`);
    return null;
  }

  // Extract component variants as "props"
  const props: any[] = [];
  if (component.type === 'COMPONENT_SET' && component.children) {
    // This is a variant component
    component.children.forEach((variant: FigmaNode) => {
      // Parse variant properties from name (e.g., "Size=Large, State=Hover")
      const variantProps = variant.name.split(',').map((prop: string) => {
        const [key, value] = prop.split('=').map((s: string) => s.trim());
        return { key, value };
      });
      props.push(...variantProps);
    });
  }

  // Get preview image
  let previewUrl: string | undefined;
  try {
    const { images } = await getFigmaImages([component.id], 'png', 2, fileKey);
    previewUrl = images[component.id];
  } catch (error) {
    console.warn(`Could not generate preview for ${componentName}`);
  }

  return {
    name: component.name,
    description: component.description || '',
    props: [...new Set(props.map(p => p.key))].map(key => ({
      name: key,
      values: props.filter(p => p.key === key).map(p => p.value),
    })),
    previewUrl,
  };
}

/**
 * Compare design tokens with current implementation
 * Returns tokens that have changed
 */
export function compareTokens(
  figmaTokens: DesignTokens,
  currentTokens: DesignTokens
): {
  added: string[];
  removed: string[];
  changed: string[];
} {
  const result = {
    added: [] as string[],
    removed: [] as string[],
    changed: [] as string[],
  };

  // Check colors
  Object.keys(figmaTokens.colors).forEach(key => {
    if (!(key in currentTokens.colors)) {
      result.added.push(`color: ${key}`);
    } else if (figmaTokens.colors[key] !== currentTokens.colors[key]) {
      result.changed.push(`color: ${key}`);
    }
  });

  Object.keys(currentTokens.colors).forEach(key => {
    if (!(key in figmaTokens.colors)) {
      result.removed.push(`color: ${key}`);
    }
  });

  // Similar checks for typography, spacing, etc.
  
  return result;
}

/**
 * Batch export multiple frames as images
 */
export async function exportFrames(
  frameNames: string[],
  format: 'png' | 'jpg' | 'svg' = 'png',
  fileKey?: string
): Promise<Record<string, string>> {
  const file = await getFigmaFile(fileKey);
  const nodeIds: string[] = [];
  
  frameNames.forEach(frameName => {
    const frame = findNodeByName(file.document, frameName);
    if (frame) {
      nodeIds.push(frame.id);
    }
  });

  if (nodeIds.length === 0) {
    console.warn('No frames found to export');
    return {};
  }

  const { images } = await getFigmaImages(nodeIds, format, 2, fileKey);
  return images;
}
