# Quick Start Guide - Figma API Integration in Cursor

Get your Pinpoint AI project integrated with Figma API in under 10 minutes!

## 🚀 5-Minute Setup

### Step 1: Get Figma Credentials (2 minutes)

1. **Get API Token**:
   - Go to https://www.figma.com/settings
   - Scroll to "Personal access tokens"
   - Click "Create a new personal access token"
   - Name it "Pinpoint AI"
   - Copy the token (save it immediately!)

2. **Get File Key**:
   - Open your Figma file
   - Look at the URL: `https://www.figma.com/file/ABC123/YourFile`
   - Copy `ABC123` (the part between `/file/` and next `/`)

### Step 2: Configure Environment (1 minute)

```bash
# Create .env.local file
cp .env.example .env.local

# Edit with your credentials
echo "FIGMA_API_TOKEN=figd_your_token_here" >> .env.local
echo "FIGMA_FILE_KEY=your_file_key_here" >> .env.local
```

### Step 3: Prepare Figma File (2 minutes)

In your Figma file, create these frames:

```
📄 Your Figma File
├─ 🎨 Colors (frame)
│  ├─ primary (rectangle with #6E7E55)
│  ├─ secondary (rectangle with #EFE9E4)
│  └─ background (rectangle with #F5F2EB)
├─ 📝 Typography (frame)
│  ├─ heading-1 (text: "Heading 1", 32px, Inter, 500)
│  ├─ body-text (text: "Body", 16px, Inter, 400)
│  └─ caption (text: "Caption", 14px, Inter, 400)
└─ 📦 Assets (frame)
   ├─ logo (your logo component)
   ├─ icon-search (search icon)
   └─ hero-image (hero image)
```

### Step 4: Run First Sync (30 seconds)

```bash
# Test connection (dry run)
npm run figma:sync:dry

# If it works, sync for real
npm run figma:sync
```

### Step 5: Verify (30 seconds)

You should see output like:
```
🎨 Starting Figma token sync...

📥 Extracting color tokens...
   Found 8 colors
📥 Extracting typography tokens...
   Found 5 typography styles
📥 Extracting spacing tokens...
   Found 6 spacing values

✅ Sync complete!
```

---

## 🎯 Common Use Cases

### Use Case 1: Sync Colors Only

```bash
# In your terminal
node -e "
const { extractColorTokens } = require('./lib/figma-sync');
extractColorTokens('Colors').then(colors => {
  console.log('Colors:', colors);
});
"
```

### Use Case 2: Download All Icons

```bash
npm run figma:icons
```

This will output URLs for all your icons. Copy them and save to `/public/icons/`.

### Use Case 3: Export Specific Frames

```bash
node scripts/download-figma-assets.js frames "Homepage Mockup" "Dashboard" --format=png
```

### Use Case 4: Compare Tokens

```bash
npm run figma:compare
```

This shows what changed between your Figma file and current code.

---

## 🔧 Use in Your Code

### Example 1: Fetch Figma Data

```typescript
// In any component or API route
import { getFigmaFile } from '@/lib/figma';

const file = await getFigmaFile();
console.log('File name:', file.name);
console.log('Last modified:', file.lastModified);
```

### Example 2: Get Component Preview

```typescript
import { getFigmaImages } from '@/lib/figma';

// Get preview of a specific component
const nodeId = '123:456'; // From Figma (right-click → Copy link → extract ID)
const { images } = await getFigmaImages([nodeId], 'png', 2);

console.log('Preview URL:', images[nodeId]);
```

### Example 3: Extract Color from Figma Node

```typescript
import { findNodeByName, figmaColorToHex } from '@/lib/figma';

const file = await getFigmaFile();
const primaryButton = findNodeByName(file.document, 'Primary Button');

if (primaryButton?.fills?.[0]?.color) {
  const hex = figmaColorToHex(primaryButton.fills[0].color);
  console.log('Button color:', hex);
}
```

---

## 📚 File Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| `/lib/figma.ts` | Core Figma API functions | Import in any file that needs Figma data |
| `/lib/figma-sync.ts` | Design token extraction | Use for syncing colors, typography, etc. |
| `/scripts/sync-figma-tokens.ts` | CLI tool for syncing tokens | Run from terminal to update design system |
| `/scripts/download-figma-assets.ts` | CLI tool for downloading assets | Run from terminal to get images/icons |
| `/.env.example` | Template for environment variables | Copy to `.env.local` and fill in |
| `/docs/FIGMA_INTEGRATION.md` | Full documentation | Read when you need detailed info |

---

## 🎨 Figma File Best Practices

### ✅ DO

- ✅ Use consistent naming (kebab-case: `primary-button`)
- ✅ Group related items in frames
- ✅ Name frames exactly as expected: "Colors", "Typography", "Assets"
- ✅ Use components for reusable elements
- ✅ Document your design tokens in Figma

### ❌ DON'T

- ❌ Don't use special characters in names
- ❌ Don't nest tokens too deeply
- ❌ Don't rename frames frequently (scripts depend on them)
- ❌ Don't commit API tokens to git

---

## 🐛 Troubleshooting

### "Figma API token is required"
**Fix**: Check your `.env.local` file exists and has the correct token.

```bash
cat .env.local  # Should show your token
```

### "Frame 'Colors' not found"
**Fix**: Create a frame in Figma named exactly "Colors" (case-sensitive).

### "Figma API error: 403 Forbidden"
**Fix**: Your token may be expired. Generate a new one in Figma settings.

### Rate Limit Errors
**Fix**: Wait 60 seconds. Figma allows 500 requests/minute.

---

## 🔄 Workflow

Here's the ideal workflow for design-to-code:

```
1. 🎨 Design in Figma
   └─ Update colors, typography, components

2. 🔄 Sync to code
   └─ Run: npm run figma:sync

3. 📝 Review changes
   └─ Check generated CSS in terminal

4. ✅ Apply to codebase
   └─ Copy to /styles/figma-tokens.css

5. 🧪 Test
   └─ Verify in browser

6. 🚀 Deploy
   └─ Push to production
```

---

## 💡 Pro Tips

### Tip 1: Auto-sync on build
Add to `package.json`:
```json
{
  "scripts": {
    "prebuild": "npm run figma:sync"
  }
}
```

### Tip 2: Version control your tokens
Commit the generated CSS so your team can see when tokens change.

### Tip 3: Use webhooks for real-time sync
Set up Figma webhooks to trigger syncs when designs change.

### Tip 4: Cache Figma responses
The API has rate limits. Cache responses in development:

```typescript
const cache = new Map();

async function getCachedFigmaFile() {
  if (cache.has('file')) {
    return cache.get('file');
  }
  
  const file = await getFigmaFile();
  cache.set('file', file);
  return file;
}
```

### Tip 5: Document your node IDs
Keep a list of important node IDs in a constants file:

```typescript
// /lib/figma-constants.ts
export const FIGMA_NODES = {
  LOGO: '123:456',
  PRIMARY_BUTTON: '123:457',
  HERO_IMAGE: '123:458',
};
```

---

## 📞 Need Help?

- 📖 Full docs: See `/docs/FIGMA_INTEGRATION.md`
- 🔌 Backend: See `/docs/BACKEND_INTEGRATION.md`
- 🐛 Issues: Check troubleshooting section above
- 💬 Community: Figma Developer Forum

---

## ✅ Checklist

Before moving to production:

- [ ] Figma credentials in `.env.local`
- [ ] Figma file organized with proper frames
- [ ] Ran sync successfully at least once
- [ ] Tested token changes in browser
- [ ] Downloaded necessary assets
- [ ] Set up auto-sync (optional)
- [ ] Documented your Figma structure
- [ ] Added tokens to version control

---

**You're all set!** 🎉

Now you can sync your Figma design system with your code automatically.

Happy coding! 🚀
