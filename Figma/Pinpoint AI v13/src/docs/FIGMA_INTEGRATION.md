# Figma API Integration Guide for Pinpoint AI

This guide will help you integrate your Figma designs with your Pinpoint AI codebase using the Figma API.

## 📋 Table of Contents

1. [Setup](#setup)
2. [Getting Your Figma Credentials](#getting-your-figma-credentials)
3. [Syncing Design Tokens](#syncing-design-tokens)
4. [Downloading Assets](#downloading-assets)
5. [Advanced Usage](#advanced-usage)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup

### 1. Get Your Figma API Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll down to **Personal Access Tokens**
3. Click **Generate new token**
4. Give it a name (e.g., "Pinpoint AI Integration")
5. Copy the token (you'll only see it once!)

### 2. Get Your Figma File Key

Your file key is in the Figma URL:

```
https://www.figma.com/file/ABC123DEF456/YourFileName
                            ^^^^^^^^^^^^
                            This is your file key
```

### 3. Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your credentials:
   ```env
   FIGMA_API_TOKEN=figd_your_actual_token_here
   FIGMA_FILE_KEY=ABC123DEF456
   ```

3. **Important**: Never commit `.env.local` to version control!

---

## 🎨 Getting Your Figma Credentials

### Step-by-Step Visual Guide

#### Getting API Token:
1. Open Figma
2. Click your profile picture → Settings
3. Scroll to "Personal access tokens"
4. Click "Create a new personal access token"
5. Name it (e.g., "Pinpoint AI")
6. Copy and save it immediately

#### Getting File Key:
1. Open your Figma file
2. Look at the URL in your browser
3. Copy the part between `/file/` and the next `/`

Example URL:
```
https://www.figma.com/file/Abc123Def456Ghi789/Pinpoint-AI-Design
                            ^^^^^^^^^^^^^^^^^^^
                            This is your file key
```

---

## 🔄 Syncing Design Tokens

Design tokens are the foundation of your design system (colors, typography, spacing, etc.).

### Prepare Your Figma File

For the sync scripts to work, organize your Figma file with these frames:

#### 1. **Colors Frame**
Create a frame named "Colors" with rectangles for each color:
```
Colors/
  ├─ primary (fill: #6E7E55)
  ├─ secondary (fill: #EFE9E4)
  ├─ background (fill: #F5F2EB)
  └─ ... (other colors)
```

#### 2. **Typography Frame**
Create a frame named "Typography" with text samples:
```
Typography/
  ├─ heading-1 (Inter, 32px, 500)
  ├─ heading-2 (Inter, 24px, 500)
  ├─ body-text (Inter, 16px, 400)
  └─ ... (other styles)
```

#### 3. **Spacing Frame**
Create a frame named "Spacing" with rectangles of different sizes:
```
Spacing/
  ├─ spacing-xs (4px)
  ├─ spacing-sm (8px)
  ├─ spacing-md (16px)
  └─ ... (other spacing values)
```

### Run the Sync Script

```bash
# Dry run (preview without saving)
node scripts/sync-figma-tokens.js sync --dry-run

# Actually sync tokens
node scripts/sync-figma-tokens.js sync

# Compare Figma tokens with current CSS
node scripts/sync-figma-tokens.js compare
```

### What It Does

1. Connects to your Figma file
2. Extracts colors, typography, and spacing
3. Generates CSS custom properties
4. Shows you the output

### Example Output

```css
:root {
  --color-primary: #6E7E55;
  --color-secondary: #EFE9E4;
  --color-background: #F5F2EB;
  --typography-heading-1-family: Inter;
  --typography-heading-1-size: 32px;
  --typography-heading-1-weight: 500;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}
```

---

## 📦 Downloading Assets

### Prepare Your Figma File

Create frames for different asset types:

```
Assets/
  ├─ logo
  ├─ icon-search
  ├─ icon-menu
  └─ hero-image

Icons/
  ├─ arrow-right
  ├─ check-circle
  └─ x-close
```

### Download Assets

```bash
# Download all assets from "Assets" frame
node scripts/download-figma-assets.js assets

# Download as SVG instead of PNG
node scripts/download-figma-assets.js assets "Assets" --format=svg

# Download icons specifically
node scripts/download-figma-assets.js icons

# Export specific frames
node scripts/download-figma-assets.js frames "Homepage" "Dashboard"

# Generate asset manifest
node scripts/download-figma-assets.js manifest
```

### What You Get

The script will output URLs for each asset:
```
1. logo
   URL: https://s3-alpha.figma.com/...
   Node ID: 123:456

2. icon-search
   URL: https://s3-alpha.figma.com/...
   Node ID: 123:457
```

You can then download these and save them to `/public/assets/`.

---

## 🔧 Advanced Usage

### Use the API in Your Components

```typescript
// In a React component
import { getFigmaFile, getFigmaImages } from '@/lib/figma';

async function MyComponent() {
  // Get file metadata
  const metadata = await getFigmaFileMetadata();
  
  // Get specific component
  const component = await getFigmaNodes(['node-id-here']);
  
  // Get image URLs
  const images = await getFigmaImages(['node-id-1', 'node-id-2']);
  
  return <div>{/* Your component */}</div>;
}
```

### Create API Routes

```typescript
// /app/api/figma/tokens/route.ts
import { extractColorTokens } from '@/lib/figma-sync';

export async function GET() {
  const colors = await extractColorTokens();
  return Response.json({ colors });
}
```

### Auto-Sync on Deploy

Add to your `package.json`:

```json
{
  "scripts": {
    "sync-figma": "node scripts/sync-figma-tokens.js sync",
    "download-assets": "node scripts/download-figma-assets.js assets",
    "prebuild": "npm run sync-figma"
  }
}
```

This will sync tokens before every build!

---

## ✅ Best Practices

### 1. **Organize Your Figma File**
- Use consistent naming (kebab-case: `primary-button`, not `Primary Button`)
- Group related elements in frames
- Use Figma components for reusable elements
- Document your design tokens

### 2. **Version Control**
- Commit synced tokens to git
- Track when tokens were last synced
- Document any manual overrides

### 3. **Automation**
- Set up CI/CD to sync tokens on Figma changes
- Use Figma webhooks for real-time updates
- Schedule regular syncs (daily or weekly)

### 4. **Security**
- Never commit `.env.local` or API tokens
- Use environment variables for tokens
- Rotate tokens regularly
- Limit token permissions if possible

### 5. **Team Workflow**
- Document your Figma file structure
- Communicate when design tokens change
- Review token changes in pull requests
- Keep a changelog of design system updates

---

## 🐛 Troubleshooting

### Error: "Figma API token is required"

**Solution**: Make sure you've set `FIGMA_API_TOKEN` in your `.env.local` file.

```bash
# Check if the file exists
cat .env.local

# Should contain:
FIGMA_API_TOKEN=figd_your_token_here
```

---

### Error: "Frame 'Colors' not found in Figma file"

**Solution**: Create a frame named "Colors" in your Figma file with color swatches.

1. Open your Figma file
2. Create a new frame (press `F`)
3. Name it exactly "Colors"
4. Add rectangles for each color
5. Name each rectangle by its token name (e.g., "primary", "secondary")

---

### Error: "Figma API error: 403 Forbidden"

**Solution**: Your API token may be invalid or expired.

1. Go to Figma Settings
2. Revoke the old token
3. Generate a new token
4. Update `.env.local` with the new token

---

### Assets Not Downloading

**Solution**: Make sure nodes are exportable.

1. In Figma, select the asset
2. In the right panel, go to "Export"
3. Make sure it has an export setting
4. Re-run the download script

---

### Token Values Don't Match Figma

**Solution**: Check your frame structure and naming.

1. Verify frame names are exact matches ("Colors", not "colors")
2. Check that color names follow conventions
3. Make sure fills are solid colors, not gradients
4. Re-run the sync script

---

### Rate Limiting

**Solution**: The Figma API has rate limits (500 requests/min).

If you hit this:
1. Wait a minute and try again
2. Reduce the number of assets/nodes you're fetching
3. Implement caching in your code
4. Batch requests when possible

---

## 📚 Additional Resources

### Figma API Documentation
- [Official Figma API Docs](https://www.figma.com/developers/api)
- [Figma API Rate Limits](https://www.figma.com/developers/api#ratelimit)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)

### Pinpoint AI Specific
- See `/lib/figma.ts` for all available functions
- See `/lib/figma-sync.ts` for sync utilities
- Check `/scripts/` for example scripts

### Community Resources
- [Figma API Community Forum](https://forum.figma.com/c/api/)
- [Design Tokens Format](https://design-tokens.github.io/community-group/)

---

## 🎯 Quick Start Checklist

- [ ] Get Figma API token
- [ ] Get Figma file key
- [ ] Create `.env.local` with credentials
- [ ] Organize Figma file with Colors, Typography, Spacing frames
- [ ] Run sync script: `node scripts/sync-figma-tokens.js sync --dry-run`
- [ ] Review generated tokens
- [ ] Run actual sync
- [ ] Copy CSS to `/styles/figma-tokens.css`
- [ ] Import in `globals.css`
- [ ] Test in your app
- [ ] Set up automatic syncing (optional)

---

## 🤝 Need Help?

If you run into issues:

1. Check this guide first
2. Review the error messages carefully
3. Check your Figma file structure
4. Verify your API credentials
5. Look at the example scripts in `/scripts/`

Good luck! 🚀
