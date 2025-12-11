#!/bin/bash
# Export components and files for Figma Make import

EXPORT_DIR="../figma-make-import"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "📦 Exporting files for Figma Make..."
echo ""

# Create export directory
mkdir -p "$EXPORT_DIR"/{components,lib,styles,api-routes}

# Export components
echo "📁 Exporting components..."
cp -r "$PROJECT_ROOT/web/src/components"/* "$EXPORT_DIR/components/" 2>/dev/null || true

# Export styles
echo "🎨 Exporting styles..."
cp "$PROJECT_ROOT/web/app/globals.css" "$EXPORT_DIR/styles/" 2>/dev/null || true
cp "$PROJECT_ROOT/web/styles/figma-tokens.css" "$EXPORT_DIR/styles/" 2>/dev/null || true

# Export lib files
echo "🔧 Exporting utilities..."
cp "$PROJECT_ROOT/web/src/lib/supabaseClient.ts" "$EXPORT_DIR/lib/" 2>/dev/null || true

# Create API client template
echo "📡 Creating API client template..."
cat > "$EXPORT_DIR/lib/api.ts" << 'EOF'
/**
 * API Client for Figma Make
 * 
 * Update API_BASE with your backend URL
 * Example: https://your-domain.com or http://localhost:3000
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SearchResult {
  tool: {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    short_description: string | null;
    logo_url: string | null;
  };
  score: number;
  reason: string;
}

/**
 * Search for AI tools
 */
export async function searchTools(query: string): Promise<{ results: SearchResult[] }> {
  const response = await fetch(`${API_BASE}/api/ai-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get tool by slug
 */
export async function getTool(slug: string) {
  const response = await fetch(`${API_BASE}/api/tool/${slug}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tool: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get featured tools (top 3)
 */
export async function getFeaturedTools() {
  // Option 1: Via API endpoint (create this in your backend)
  // const response = await fetch(`${API_BASE}/api/tools/featured`);
  // return response.json();
  
  // Option 2: Direct Supabase (if you import supabaseClient)
  // import { supabase } from './supabaseClient';
  // const { data } = await supabase
  //   .from('tools')
  //   .select('*')
  //   .order('overall_score', { ascending: false })
  //   .limit(3);
  // return data;
  
  // For now, return empty array - implement based on your setup
  return [];
}
EOF

# Create API routes documentation
echo "📚 Creating API documentation..."
cat > "$EXPORT_DIR/api-routes/README.md" << 'EOF'
# Backend API Routes

These are your backend API endpoints that Figma Make will call.

## Available Endpoints

### Search Tools
- **URL**: `POST /api/ai-search`
- **Body**: `{ "query": "search term" }`
- **Response**: `{ "results": [...] }`

### Get Tool
- **URL**: `GET /api/tool/[slug]`
- **Response**: Tool data with features, sentiment, etc.

### Get Featured Tools (create this)
- **URL**: `GET /api/tools/featured`
- **Response**: Top 3 tools

## Setup in Figma Make

1. Set `NEXT_PUBLIC_API_URL` in your `.env` file
2. Update `lib/api.ts` with your backend URL
3. Use API functions in your components
EOF

# Create main README
cat > "$EXPORT_DIR/README.md" << 'EOF'
# Figma Make Import Package

This package contains components and utilities exported from your Cursor project.

## 📁 Structure

- `components/` - React components (HomePage, SearchResults, UI components)
- `lib/` - Utilities (API client, Supabase client)
- `styles/` - CSS files (globals.css, design tokens)
- `api-routes/` - Documentation for backend APIs

## 🚀 Setup in Figma Make

### 1. Import Files
- Copy `components/` to your Figma Make project
- Copy `styles/` to your Figma Make project
- Copy `lib/` to your Figma Make project

### 2. Install Dependencies
```bash
npm install lucide-react motion recharts
npm install @supabase/supabase-js  # If using Supabase
```

### 3. Set Environment Variables
Create `.env` file:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Update API Client
Edit `lib/api.ts`:
- Update `API_BASE` with your backend URL
- Implement `getFeaturedTools()` based on your backend

### 5. Update Components
Replace mock data with API calls:

```typescript
// Before
const tools = [{ name: "ChatGPT" }];

// After
import { getFeaturedTools } from '../lib/api';
const [tools, setTools] = useState([]);
useEffect(() => {
  getFeaturedTools().then(setTools);
}, []);
```

## 🔌 Connecting to Backend

Your backend APIs are running in Cursor. Figma Make will call them:

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

Update `lib/api.ts` with the correct URL.

## 📝 Next Steps

1. Import components into Figma Make
2. Set up environment variables
3. Update API URLs
4. Replace mock data with API calls
5. Test end-to-end flow

## 🔄 Two-Way Workflow

- **Figma Make**: Frontend development, design iteration
- **Cursor**: Backend APIs, database, production deployment
- **Connection**: Figma Make → API calls → Cursor backend

## 📚 Documentation

- API Routes: See `api-routes/README.md`
- Components: Check component files for usage
- Styles: Import `styles/globals.css` in your main CSS
EOF

echo ""
echo "✅ Export complete!"
echo ""
echo "📦 Exported to: $EXPORT_DIR"
echo ""
echo "📋 Next steps:"
echo "1. Review exported files"
echo "2. Import into Figma Make"
echo "3. Set up environment variables"
echo "4. Update API URLs in lib/api.ts"
echo "5. Connect components to backend APIs"
echo ""
echo "📖 See $EXPORT_DIR/README.md for detailed instructions"

