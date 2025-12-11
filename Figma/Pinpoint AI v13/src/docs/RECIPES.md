# Figma API Recipes & Common Patterns

A collection of copy-paste code snippets for common Figma API tasks.

## 📚 Table of Contents

- [Basic Patterns](#basic-patterns)
- [Design Token Sync](#design-token-sync)
- [Asset Management](#asset-management)
- [Component Generation](#component-generation)
- [API Routes](#api-routes)
- [Automation](#automation)

---

## 🎯 Basic Patterns

### Get All Components

```typescript
import { getFigmaFile } from '@/lib/figma';

async function getAllComponents() {
  const file = await getFigmaFile();
  
  const components = Object.entries(file.components || {}).map(
    ([key, component]) => ({
      id: key,
      name: component.name,
      description: component.description,
    })
  );
  
  return components;
}
```

### Find Component by Name

```typescript
import { getFigmaFile, findNodeByName } from '@/lib/figma';

async function findComponent(componentName: string) {
  const file = await getFigmaFile();
  const node = findNodeByName(file.document, componentName);
  
  if (!node) {
    throw new Error(`Component "${componentName}" not found`);
  }
  
  return node;
}
```

### Get Component Screenshot

```typescript
import { getFigmaImages } from '@/lib/figma';

async function getComponentScreenshot(
  nodeId: string,
  scale: number = 2
): Promise<string> {
  const { images } = await getFigmaImages([nodeId], 'png', scale);
  return images[nodeId];
}
```

### Extract Color from Component

```typescript
import { findComponent, figmaColorToHex } from '@/lib/figma';

async function getComponentColor(componentName: string): Promise<string> {
  const component = await findComponent(componentName);
  
  if (!component.fills?.[0]?.color) {
    throw new Error('Component has no fill color');
  }
  
  return figmaColorToHex(component.fills[0].color);
}
```

---

## 🎨 Design Token Sync

### Sync All Tokens at Once

```typescript
import {
  extractColorTokens,
  extractTypographyTokens,
  extractSpacingTokens,
} from '@/lib/figma-sync';

async function syncAllTokens() {
  const [colors, typography, spacing] = await Promise.all([
    extractColorTokens('Colors'),
    extractTypographyTokens('Typography'),
    extractSpacingTokens('Spacing'),
  ]);
  
  return { colors, typography, spacing };
}
```

### Generate CSS from Tokens

```typescript
function generateCSS(tokens: {
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, string>;
}): string {
  let css = ':root {\n';
  
  // Colors
  Object.entries(tokens.colors).forEach(([name, value]) => {
    css += `  --color-${name}: ${value};\n`;
  });
  
  // Typography
  Object.entries(tokens.typography).forEach(([name, style]) => {
    css += `  --font-${name}: ${style.fontFamily};\n`;
    css += `  --text-${name}: ${style.fontSize};\n`;
  });
  
  // Spacing
  Object.entries(tokens.spacing).forEach(([name, value]) => {
    css += `  --spacing-${name}: ${value};\n`;
  });
  
  css += '}\n';
  return css;
}
```

### Save Tokens to File

```typescript
import fs from 'fs/promises';
import { syncAllTokens, generateCSS } from './patterns';

async function saveTokensToFile(outputPath: string = './styles/tokens.css') {
  const tokens = await syncAllTokens();
  const css = generateCSS(tokens);
  
  await fs.writeFile(outputPath, css, 'utf-8');
  console.log(`✅ Tokens saved to ${outputPath}`);
}
```

### Compare Tokens with Git

```typescript
import { execSync } from 'child_process';

function compareTokensWithGit(tokenFilePath: string) {
  try {
    const diff = execSync(`git diff ${tokenFilePath}`, { encoding: 'utf-8' });
    
    if (!diff) {
      console.log('✅ No changes in tokens');
      return null;
    }
    
    console.log('📝 Token changes:\n', diff);
    return diff;
  } catch (error) {
    console.error('Failed to compare tokens:', error);
    return null;
  }
}
```

---

## 📦 Asset Management

### Download All Images from Frame

```typescript
import { downloadAssets, getFigmaImages } from '@/lib/figma';
import fs from 'fs/promises';
import path from 'path';

async function downloadAllImages(
  frameName: string = 'Assets',
  outputDir: string = './public/assets'
) {
  const assets = await downloadAssets(frameName);
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // Download each asset
  for (const asset of assets) {
    const filename = asset.name.toLowerCase().replace(/\s+/g, '-') + '.png';
    const filepath = path.join(outputDir, filename);
    
    // Fetch the image
    const response = await fetch(asset.url);
    const buffer = await response.arrayBuffer();
    
    // Save to file
    await fs.writeFile(filepath, Buffer.from(buffer));
    console.log(`✅ Downloaded: ${filename}`);
  }
  
  console.log(`\n✅ Downloaded ${assets.length} assets to ${outputDir}`);
}
```

### Generate Image Manifest

```typescript
async function generateImageManifest(frameName: string = 'Assets') {
  const assets = await downloadAssets(frameName);
  
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalAssets: assets.length,
    assets: assets.map(asset => ({
      name: asset.name,
      filename: `${asset.name.toLowerCase().replace(/\s+/g, '-')}.png`,
      url: asset.url,
      nodeId: asset.nodeId,
    })),
  };
  
  return manifest;
}
```

### Optimize Downloaded Images

```typescript
import sharp from 'sharp';

async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options = { width: 1200, quality: 80 }
) {
  await sharp(inputPath)
    .resize(options.width, null, { withoutEnlargement: true })
    .webp({ quality: options.quality })
    .toFile(outputPath);
  
  console.log(`✅ Optimized: ${outputPath}`);
}
```

---

## 🔧 Component Generation

### Generate React Component from Figma

```typescript
import { findComponent, figmaColorToHex } from '@/lib/figma';

async function generateReactComponent(componentName: string): Promise<string> {
  const component = await findComponent(componentName);
  
  // Extract styles
  const width = component.absoluteBoundingBox?.width || 100;
  const height = component.absoluteBoundingBox?.height || 100;
  const backgroundColor = component.fills?.[0]?.color
    ? figmaColorToHex(component.fills[0].color)
    : '#000000';
  
  // Generate component code
  return `
export function ${componentName.replace(/\s+/g, '')}() {
  return (
    <div
      style={{
        width: '${width}px',
        height: '${height}px',
        backgroundColor: '${backgroundColor}',
      }}
    >
      {/* Component content */}
    </div>
  );
}
  `.trim();
}
```

### Generate TypeScript Types from Figma

```typescript
interface FigmaComponent {
  name: string;
  props: { name: string; type: string }[];
}

async function generateComponentTypes(
  componentName: string
): Promise<string> {
  const component = await findComponent(componentName);
  
  // For component sets (variants), extract props
  const props: { name: string; type: string }[] = [];
  
  if (component.type === 'COMPONENT_SET' && component.children) {
    component.children.forEach((variant: any) => {
      // Parse variant name (e.g., "Size=Large, State=Hover")
      variant.name.split(',').forEach((prop: string) => {
        const [key] = prop.split('=').map(s => s.trim());
        if (!props.find(p => p.name === key)) {
          props.push({ name: key, type: 'string' });
        }
      });
    });
  }
  
  const propsInterface = props.length > 0
    ? `interface ${componentName}Props {
  ${props.map(p => `${p.name}: ${p.type};`).join('\n  ')}
}`
    : '';
  
  return propsInterface;
}
```

---

## 🔌 API Routes

### GET: Fetch Design Tokens

```typescript
// /app/api/design-tokens/route.ts
import { NextResponse } from 'next/server';
import { syncAllTokens } from '@/lib/figma-patterns';

export async function GET() {
  try {
    const tokens = await syncAllTokens();
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
```

### GET: Fetch Component Preview

```typescript
// /app/api/component-preview/[nodeId]/route.ts
import { NextResponse } from 'next/server';
import { getFigmaImages } from '@/lib/figma';

export async function GET(
  request: Request,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { images } = await getFigmaImages([params.nodeId], 'png', 2);
    return NextResponse.json({ url: images[params.nodeId] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch preview' },
      { status: 500 }
    );
  }
}
```

### POST: Trigger Token Sync

```typescript
// /app/api/sync-tokens/route.ts
import { NextResponse } from 'next/server';
import { syncAllTokens, generateCSS } from '@/lib/figma-patterns';
import fs from 'fs/promises';

export async function POST() {
  try {
    const tokens = await syncAllTokens();
    const css = generateCSS(tokens);
    
    // Save to file
    await fs.writeFile('./styles/figma-tokens.css', css, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'Tokens synced successfully',
      tokenCount: {
        colors: Object.keys(tokens.colors).length,
        typography: Object.keys(tokens.typography).length,
        spacing: Object.keys(tokens.spacing).length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sync tokens' },
      { status: 500 }
    );
  }
}
```

### Webhook: Auto-sync on Figma Changes

```typescript
// /app/api/figma-webhook/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (important for security!)
    const signature = request.headers.get('x-figma-signature');
    if (!verifySignature(signature, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Trigger sync based on event type
    if (body.event_type === 'FILE_UPDATE') {
      // Trigger your sync process
      await triggerTokenSync();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function verifySignature(signature: string | null, body: any): boolean {
  // Implement signature verification
  // See Figma webhook docs for details
  return true;
}
```

---

## ⚡ Automation

### GitHub Action: Sync on Push

```yaml
# .github/workflows/sync-figma.yml
name: Sync Figma Tokens

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Sync tokens
        env:
          FIGMA_API_TOKEN: ${{ secrets.FIGMA_API_TOKEN }}
          FIGMA_FILE_KEY: ${{ secrets.FIGMA_FILE_KEY }}
        run: npm run figma:sync
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add styles/figma-tokens.css
          git commit -m "chore: sync design tokens from Figma" || exit 0
          git push
```

### Cron Job: Daily Sync

```typescript
// /scripts/cron-sync.ts
import { syncAllTokens, generateCSS } from '@/lib/figma-patterns';
import fs from 'fs/promises';

async function dailySync() {
  console.log('🕐 Starting daily Figma sync...');
  
  try {
    const tokens = await syncAllTokens();
    const css = generateCSS(tokens);
    
    await fs.writeFile('./styles/figma-tokens.css', css, 'utf-8');
    
    console.log('✅ Daily sync complete!');
    console.log(`   Colors: ${Object.keys(tokens.colors).length}`);
    console.log(`   Typography: ${Object.keys(tokens.typography).length}`);
    console.log(`   Spacing: ${Object.keys(tokens.spacing).length}`);
  } catch (error) {
    console.error('❌ Daily sync failed:', error);
    process.exit(1);
  }
}

// Run immediately
dailySync();
```

Set up with crontab:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cd /path/to/project && node scripts/cron-sync.js
```

### Pre-commit Hook: Validate Tokens

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Validating design tokens..."

# Run token validation
node scripts/validate-tokens.js

if [ $? -ne 0 ]; then
  echo "❌ Token validation failed! Please fix errors before committing."
  exit 1
fi

echo "✅ Tokens validated successfully"
exit 0
```

---

## 🧪 Testing Patterns

### Test Figma Connection

```typescript
async function testFigmaConnection() {
  try {
    const file = await getFigmaFile();
    console.log('✅ Connected to Figma!');
    console.log(`   File: ${file.name}`);
    console.log(`   Last modified: ${file.lastModified}`);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
}
```

### Validate Token Structure

```typescript
function validateTokens(tokens: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check colors
  if (!tokens.colors || Object.keys(tokens.colors).length === 0) {
    errors.push('No colors found');
  }
  
  // Validate color format
  Object.entries(tokens.colors).forEach(([name, value]) => {
    if (!/^#[0-9A-F]{6}$/i.test(value as string)) {
      errors.push(`Invalid color format for ${name}: ${value}`);
    }
  });
  
  // Check typography
  if (!tokens.typography || Object.keys(tokens.typography).length === 0) {
    errors.push('No typography found');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## 🎁 Bonus: Complete Workflow Example

```typescript
/**
 * Complete end-to-end workflow:
 * 1. Fetch from Figma
 * 2. Extract tokens
 * 3. Generate CSS
 * 4. Save to file
 * 5. Validate
 * 6. Report
 */

async function completeWorkflow() {
  console.log('🚀 Starting complete Figma workflow...\n');
  
  // 1. Test connection
  console.log('1️⃣ Testing Figma connection...');
  const connected = await testFigmaConnection();
  if (!connected) throw new Error('Connection failed');
  
  // 2. Sync tokens
  console.log('\n2️⃣ Syncing design tokens...');
  const tokens = await syncAllTokens();
  
  // 3. Generate CSS
  console.log('\n3️⃣ Generating CSS...');
  const css = generateCSS(tokens);
  
  // 4. Validate
  console.log('\n4️⃣ Validating tokens...');
  const validation = validateTokens(tokens);
  if (!validation.valid) {
    console.error('❌ Validation failed:');
    validation.errors.forEach(err => console.error(`   - ${err}`));
    throw new Error('Token validation failed');
  }
  
  // 5. Save to file
  console.log('\n5️⃣ Saving to file...');
  await fs.writeFile('./styles/figma-tokens.css', css, 'utf-8');
  
  // 6. Compare with git
  console.log('\n6️⃣ Checking for changes...');
  const changes = compareTokensWithGit('./styles/figma-tokens.css');
  
  // 7. Report
  console.log('\n📊 Summary:');
  console.log(`   ✅ Colors: ${Object.keys(tokens.colors).length}`);
  console.log(`   ✅ Typography: ${Object.keys(tokens.typography).length}`);
  console.log(`   ✅ Spacing: ${Object.keys(tokens.spacing).length}`);
  console.log(`   ${changes ? '🔄 Changes detected' : '✅ No changes'}`);
  
  console.log('\n✅ Workflow complete!');
}
```

---

## 📚 Additional Resources

- [Figma API Docs](https://www.figma.com/developers/api)
- [Design Tokens Spec](https://design-tokens.github.io/)
- [Your Project Docs](../FIGMA_INTEGRATION.md)

---

**Copy, paste, and customize these patterns for your needs!** 🚀
