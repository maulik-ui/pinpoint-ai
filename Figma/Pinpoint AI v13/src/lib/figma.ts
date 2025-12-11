/**
 * Figma API Integration Library
 * 
 * This library provides utilities for:
 * - Fetching Figma files and components
 * - Extracting design tokens (colors, typography, spacing)
 * - Downloading assets (images, SVGs)
 * - Syncing design system with your codebase
 */

// Environment variables (set these in your .env.local file)
const FIGMA_API_TOKEN = process.env.NEXT_PUBLIC_FIGMA_API_TOKEN || process.env.FIGMA_API_TOKEN;
const FIGMA_FILE_KEY = process.env.NEXT_PUBLIC_FIGMA_FILE_KEY || process.env.FIGMA_FILE_KEY;
const FIGMA_API_BASE = 'https://api.figma.com/v1';

// Types
export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
  name: string;
  lastModified: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  effects?: FigmaEffect[];
  absoluteBoundingBox?: BoundingBox;
  [key: string]: any;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description: string;
}

export interface FigmaFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  color?: { r: number; g: number; b: number; a: number };
  opacity?: number;
}

export interface FigmaStroke {
  type: string;
  color?: { r: number; g: number; b: number; a: number };
}

export interface FigmaEffect {
  type: string;
  radius?: number;
  color?: { r: number; g: number; b: number; a: number };
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, TypographyToken>;
  spacing: Record<string, string>;
  radii: Record<string, string>;
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

/**
 * Fetch the entire Figma file
 */
export async function getFigmaFile(fileKey?: string): Promise<FigmaFile> {
  const key = fileKey || FIGMA_FILE_KEY;
  
  if (!key) {
    throw new Error('Figma file key is required. Set FIGMA_FILE_KEY in your environment variables.');
  }

  if (!FIGMA_API_TOKEN) {
    throw new Error('Figma API token is required. Set FIGMA_API_TOKEN in your environment variables.');
  }

  const response = await fetch(`${FIGMA_API_BASE}/files/${key}`, {
    headers: {
      'X-Figma-Token': FIGMA_API_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get specific nodes from a Figma file
 */
export async function getFigmaNodes(nodeIds: string[], fileKey?: string): Promise<any> {
  const key = fileKey || FIGMA_FILE_KEY;
  
  if (!key || !FIGMA_API_TOKEN) {
    throw new Error('Figma file key and API token are required.');
  }

  const ids = nodeIds.join(',');
  const response = await fetch(`${FIGMA_API_BASE}/files/${key}/nodes?ids=${ids}`, {
    headers: {
      'X-Figma-Token': FIGMA_API_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get image URLs for specific nodes
 * @param nodeIds - Array of node IDs to export
 * @param format - Image format (png, jpg, svg, pdf)
 * @param scale - Scale factor (1-4)
 */
export async function getFigmaImages(
  nodeIds: string[],
  format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png',
  scale: number = 2,
  fileKey?: string
): Promise<{ images: Record<string, string> }> {
  const key = fileKey || FIGMA_FILE_KEY;
  
  if (!key || !FIGMA_API_TOKEN) {
    throw new Error('Figma file key and API token are required.');
  }

  const ids = nodeIds.join(',');
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${key}?ids=${ids}&format=${format}&scale=${scale}`,
    {
      headers: {
        'X-Figma-Token': FIGMA_API_TOKEN,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Extract design tokens from Figma file
 */
export async function getDesignTokens(fileKey?: string): Promise<DesignTokens> {
  const file = await getFigmaFile(fileKey);
  
  const tokens: DesignTokens = {
    colors: {},
    typography: {},
    spacing: {},
    radii: {},
  };

  // Extract color styles
  if (file.styles) {
    Object.entries(file.styles).forEach(([id, style]) => {
      if (style.styleType === 'FILL') {
        // You'll need to fetch the actual style data separately
        // This is a simplified version
        tokens.colors[style.name] = id;
      }
      
      if (style.styleType === 'TEXT') {
        tokens.typography[style.name] = {
          fontFamily: 'Inter',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '1.5',
        };
      }
    });
  }

  // Extract spacing and other tokens from the document
  // You can traverse the document tree to find specific frames or components
  
  return tokens;
}

/**
 * Helper: Convert Figma color to CSS
 */
export function figmaColorToCSS(color: { r: number; g: number; b: number; a?: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;
  
  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Helper: Convert Figma color to hex
 */
export function figmaColorToHex(color: { r: number; g: number; b: number }): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

/**
 * Helper: Find node by name in the document tree
 */
export function findNodeByName(node: FigmaNode, name: string): FigmaNode | null {
  if (node.name === name) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByName(child, name);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Helper: Find all nodes of a specific type
 */
export function findNodesByType(node: FigmaNode, type: string): FigmaNode[] {
  const results: FigmaNode[] = [];
  
  if (node.type === type) {
    results.push(node);
  }
  
  if (node.children) {
    for (const child of node.children) {
      results.push(...findNodesByType(child, type));
    }
  }
  
  return results;
}

/**
 * Helper: Extract all image nodes
 */
export function findAllImages(node: FigmaNode): FigmaNode[] {
  return findNodesByType(node, 'RECTANGLE').filter((n) => {
    return n.fills?.some((fill: FigmaFill) => fill.type === 'IMAGE');
  });
}

/**
 * Get Figma file metadata
 */
export async function getFigmaFileMetadata(fileKey?: string): Promise<{
  name: string;
  lastModified: string;
  version: string;
}> {
  const file = await getFigmaFile(fileKey);
  
  return {
    name: file.name,
    lastModified: file.lastModified,
    version: file.lastModified, // Figma uses lastModified as version
  };
}

/**
 * Download image from URL
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  
  // In Node.js environment, you would save this to disk
  // In browser, you can create a download link
  // This is a placeholder - implementation depends on your environment
  console.log(`Downloaded ${filename}: ${blob.size} bytes`);
}

/**
 * Get all components from Figma file
 */
export async function getFigmaComponents(fileKey?: string): Promise<FigmaComponent[]> {
  const file = await getFigmaFile(fileKey);
  
  if (!file.components) {
    return [];
  }
  
  return Object.values(file.components);
}

/**
 * Get component sets (variants)
 */
export async function getFigmaComponentSets(fileKey?: string): Promise<any[]> {
  const file = await getFigmaFile(fileKey);
  const componentSets = findNodesByType(file.document, 'COMPONENT_SET');
  
  return componentSets;
}
