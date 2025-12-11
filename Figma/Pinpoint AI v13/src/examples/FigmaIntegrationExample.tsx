/**
 * Example Component: Figma API Integration
 * 
 * This demonstrates various ways to use the Figma API in your React components.
 * Copy and modify these patterns for your own use cases.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  getFigmaFile, 
  getFigmaImages,
  findNodeByName,
  figmaColorToHex 
} from '@/lib/figma';
import {
  extractColorTokens,
  extractTypographyTokens,
  downloadAssets
} from '@/lib/figma-sync';

/**
 * Example 1: Display Figma File Info
 */
export function FigmaFileInfo() {
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFileInfo() {
      try {
        const file = await getFigmaFile();
        setFileInfo({
          name: file.name,
          lastModified: new Date(file.lastModified).toLocaleDateString(),
          componentCount: Object.keys(file.components || {}).length,
          styleCount: Object.keys(file.styles || {}).length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    }

    loadFileInfo();
  }, []);

  if (loading) return <div>Loading Figma file info...</div>;
  if (error) return <div className="text-destructive">Error: {error}</div>;
  if (!fileInfo) return null;

  return (
    <div className="p-6 bg-card rounded-lg">
      <h2 className="mb-4">Figma File Info</h2>
      <dl className="space-y-2">
        <div>
          <dt className="text-muted-foreground">File Name:</dt>
          <dd>{fileInfo.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last Modified:</dt>
          <dd>{fileInfo.lastModified}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Components:</dt>
          <dd>{fileInfo.componentCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Styles:</dt>
          <dd>{fileInfo.styleCount}</dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Example 2: Display Color Tokens from Figma
 */
export function FigmaColorPalette() {
  const [colors, setColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadColors() {
      try {
        const colorTokens = await extractColorTokens('Colors');
        setColors(colorTokens);
      } catch (err) {
        console.error('Failed to load colors:', err);
      } finally {
        setLoading(false);
      }
    }

    loadColors();
  }, []);

  if (loading) return <div>Loading colors...</div>;

  return (
    <div className="p-6 bg-card rounded-lg">
      <h2 className="mb-4">Color Palette from Figma</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(colors).map(([name, value]) => (
          <div key={name} className="space-y-2">
            <div
              className="w-full h-20 rounded-lg border"
              style={{ backgroundColor: value }}
            />
            <div>
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-muted-foreground">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 3: Display Typography Tokens
 */
export function FigmaTypography() {
  const [typography, setTypography] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTypography() {
      try {
        const typographyTokens = await extractTypographyTokens('Typography');
        setTypography(typographyTokens);
      } catch (err) {
        console.error('Failed to load typography:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTypography();
  }, []);

  if (loading) return <div>Loading typography...</div>;

  return (
    <div className="p-6 bg-card rounded-lg">
      <h2 className="mb-4">Typography from Figma</h2>
      <div className="space-y-4">
        {Object.entries(typography).map(([name, style]) => (
          <div key={name} className="border-b pb-4">
            <div
              style={{
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                lineHeight: style.lineHeight,
              }}
            >
              The quick brown fox jumps over the lazy dog
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {name}: {style.fontSize} / {style.fontWeight} / {style.lineHeight}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Display Component Preview from Figma
 */
export function FigmaComponentPreview({ nodeId }: { nodeId: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreview() {
      try {
        const { images } = await getFigmaImages([nodeId], 'png', 2);
        setImageUrl(images[nodeId]);
      } catch (err) {
        console.error('Failed to load preview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPreview();
  }, [nodeId]);

  if (loading) return <div>Loading preview...</div>;
  if (!imageUrl) return <div>Preview not available</div>;

  return (
    <div className="p-6 bg-card rounded-lg">
      <h3 className="mb-4">Component Preview</h3>
      <img
        src={imageUrl}
        alt="Component preview"
        className="w-full rounded-lg border"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Node ID: {nodeId}
      </p>
    </div>
  );
}

/**
 * Example 5: Interactive Color Extractor
 */
export function ColorExtractor() {
  const [componentName, setComponentName] = useState('');
  const [extractedColor, setExtractedColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function extractColor() {
    if (!componentName) return;
    
    setLoading(true);
    try {
      const file = await getFigmaFile();
      const node = findNodeByName(file.document, componentName);
      
      if (node?.fills?.[0]?.color) {
        const hex = figmaColorToHex(node.fills[0].color);
        setExtractedColor(hex);
      } else {
        setExtractedColor(null);
        alert('Component not found or has no color');
      }
    } catch (err) {
      console.error('Failed to extract color:', err);
      alert('Failed to extract color');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-card rounded-lg">
      <h3 className="mb-4">Extract Color from Component</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">
            Component Name in Figma:
          </label>
          <input
            type="text"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            placeholder="e.g., Primary Button"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={extractColor}
          disabled={loading || !componentName}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
        >
          {loading ? 'Extracting...' : 'Extract Color'}
        </button>
        {extractedColor && (
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-lg border"
              style={{ backgroundColor: extractedColor }}
            />
            <div>
              <div className="text-sm font-medium">Extracted Color</div>
              <div className="text-2xl font-mono">{extractedColor}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 6: Asset Gallery from Figma
 */
export function FigmaAssetGallery() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      try {
        const assetList = await downloadAssets('Assets');
        setAssets(assetList);
      } catch (err) {
        console.error('Failed to load assets:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, []);

  if (loading) return <div>Loading assets...</div>;

  return (
    <div className="p-6 bg-card rounded-lg">
      <h2 className="mb-4">Assets from Figma</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <div key={asset.nodeId} className="space-y-2">
            <img
              src={asset.url}
              alt={asset.name}
              className="w-full h-32 object-contain bg-muted rounded-lg"
            />
            <div className="text-sm font-medium truncate">{asset.name}</div>
          </div>
        ))}
      </div>
      {assets.length === 0 && (
        <p className="text-muted-foreground">
          No assets found. Create a frame named "Assets" in Figma with your images/icons.
        </p>
      )}
    </div>
  );
}

/**
 * Example 7: Sync Status Dashboard
 */
export function FigmaSyncDashboard() {
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null as Date | null,
    colorCount: 0,
    typographyCount: 0,
    assetCount: 0,
  });

  async function performSync() {
    try {
      const [colors, typography, assets] = await Promise.all([
        extractColorTokens('Colors'),
        extractTypographyTokens('Typography'),
        downloadAssets('Assets'),
      ]);

      setSyncStatus({
        lastSync: new Date(),
        colorCount: Object.keys(colors).length,
        typographyCount: Object.keys(typography).length,
        assetCount: assets.length,
      });

      alert('✅ Sync complete!');
    } catch (err) {
      console.error('Sync failed:', err);
      alert('❌ Sync failed. Check console for details.');
    }
  }

  return (
    <div className="p-6 bg-card rounded-lg">
      <h2 className="mb-4">Figma Sync Dashboard</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-3xl font-bold">{syncStatus.colorCount}</div>
          <div className="text-sm text-muted-foreground">Colors</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-3xl font-bold">{syncStatus.typographyCount}</div>
          <div className="text-sm text-muted-foreground">Typography</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-3xl font-bold">{syncStatus.assetCount}</div>
          <div className="text-sm text-muted-foreground">Assets</div>
        </div>
      </div>

      {syncStatus.lastSync && (
        <p className="text-sm text-muted-foreground mb-4">
          Last synced: {syncStatus.lastSync.toLocaleString()}
        </p>
      )}

      <button
        onClick={performSync}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        🔄 Sync from Figma
      </button>
    </div>
  );
}

/**
 * Example 8: Demo Page Component
 * 
 * Use this to showcase all Figma integration features
 */
export default function FigmaIntegrationDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="mb-2">Figma API Integration Examples</h1>
          <p className="text-muted-foreground">
            These components demonstrate how to use the Figma API in your React app.
          </p>
        </div>

        <FigmaSyncDashboard />
        
        <div className="grid md:grid-cols-2 gap-8">
          <FigmaFileInfo />
          <ColorExtractor />
        </div>

        <FigmaColorPalette />
        
        <FigmaTypography />
        
        <FigmaAssetGallery />
        
        {/* Example with specific node ID */}
        {/* <FigmaComponentPreview nodeId="123:456" /> */}
      </div>
    </div>
  );
}

/**
 * Usage in your app:
 * 
 * 1. Import any of these components:
 *    import { FigmaColorPalette } from '@/examples/FigmaIntegrationExample';
 * 
 * 2. Use in your page:
 *    <FigmaColorPalette />
 * 
 * 3. Customize for your needs:
 *    - Modify frame names (e.g., 'Colors' -> 'Color Palette')
 *    - Add error handling
 *    - Style with your theme
 *    - Add loading states
 * 
 * 4. For API routes, check the functions in /lib/figma.ts and /lib/figma-sync.ts
 */
