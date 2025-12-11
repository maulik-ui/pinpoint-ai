# Bookmark Feature Guide

## Overview

The bookmark (save tool) feature allows users to save tools they're interested in for quick access later. This is a core Free tier feature available to all users.

## Components

### BookmarkButton Component

**Location:** `/components/BookmarkButton.tsx`

A reusable button that can be added anywhere tools are displayed.

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `toolId` | string | Yes | - | Unique tool identifier |
| `toolName` | string | Yes | - | Tool display name |
| `toolCategory` | string | No | - | Tool category |
| `toolImage` | string | No | - | Tool image URL |
| `size` | 'sm' \| 'md' \| 'lg' | No | 'md' | Button size |
| `variant` | 'icon' \| 'button' | No | 'icon' | Display variant |
| `className` | string | No | '' | Additional CSS classes |

**Variants:**

1. **Icon variant** (default):
   - Circular button with bookmark icon only
   - Perfect for tool cards, compact spaces
   - Hover effects and smooth transitions

2. **Button variant**:
   - Pill-shaped button with icon and text
   - Shows "Save" or "Saved" label
   - Good for detail pages, prominent placement

**Visual States:**

- **Unsaved:** Outline bookmark icon, muted color
- **Saved:** Filled bookmark icon, primary color
- **Hover:** Color change, subtle scale
- **Animating:** Brief scale animation on click

## Usage Examples

### 1. Icon Variant (Tool Cards)

```tsx
import { BookmarkButton } from './components/BookmarkButton';

function ToolCard({ tool }) {
  return (
    <div className="tool-card">
      {/* Tool content */}
      <div className="absolute top-3 right-3">
        <BookmarkButton
          toolId={tool.id}
          toolName={tool.name}
          toolCategory={tool.category}
          toolImage={tool.image}
          size="sm"
        />
      </div>
    </div>
  );
}
```

### 2. Button Variant (Tool Detail Page)

```tsx
import { BookmarkButton } from './components/BookmarkButton';

function ToolDetailPage({ tool }) {
  return (
    <div className="tool-detail">
      <div className="header">
        <h1>{tool.name}</h1>
        <BookmarkButton
          toolId={tool.id}
          toolName={tool.name}
          toolCategory={tool.category}
          toolImage={tool.image}
          variant="button"
          size="lg"
        />
      </div>
      {/* Rest of page */}
    </div>
  );
}
```

### 3. Custom Styling

```tsx
<BookmarkButton
  toolId="chatgpt"
  toolName="ChatGPT"
  className="shadow-md"
  size="md"
/>
```

## Hook: useSavedTools

**Location:** `/hooks/useBilling.ts`

The BookmarkButton uses the `useSavedTools` hook internally.

**API:**

```typescript
const {
  savedTools,      // Array of SavedTool objects
  saveTool,        // Function to save a tool
  unsaveTool,      // Function to unsave a tool
  isToolSaved,     // Function to check if tool is saved
  isLoading,       // Loading state
} = useSavedTools();
```

**Direct Usage (if needed):**

```tsx
import { useSavedTools } from '../hooks/useBilling';

function MyComponent() {
  const { savedTools, isToolSaved, saveTool } = useSavedTools();

  const handleSave = async () => {
    await saveTool({
      toolId: 'example-tool',
      toolName: 'Example Tool',
      toolCategory: 'Productivity',
      toolImage: 'https://...',
    });
  };

  const isSaved = isToolSaved('example-tool');

  return (
    <div>
      <p>You have {savedTools.length} saved tools</p>
      <button onClick={handleSave}>
        {isSaved ? 'Saved!' : 'Save Tool'}
      </button>
    </div>
  );
}
```

## SavedTools Component

**Location:** `/components/SavedTools.tsx`

Displays a user's complete saved tools list. Used in the User Profile page.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSelectTool` | (toolId: string) => void | No | Callback when tool is clicked |

**Features:**

- Grid layout of saved tools
- Tool images with hover effects
- Remove button on hover
- Empty state with helpful message
- Saved date display
- Notes field (if available)

**Usage:**

```tsx
import { SavedTools } from './components/SavedTools';

function UserProfilePage() {
  return (
    <div className="profile">
      <SavedTools 
        onSelectTool={(toolId) => navigateToTool(toolId)}
      />
    </div>
  );
}
```

## Data Structure

### SavedTool Type

```typescript
interface SavedTool {
  id: string;              // Unique bookmark ID
  userId: string;          // User who saved it
  toolId: string;          // Tool identifier
  toolName: string;        // Tool display name
  toolCategory?: string;   // Optional category
  toolImage?: string;      // Optional image URL
  savedAt: Date;           // When it was saved
  notes?: string;          // Optional user notes
}
```

## Database Integration

**Table:** `saved_tools`

**Schema:**
```sql
CREATE TABLE saved_tools (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_category TEXT,
  tool_image TEXT,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_tool UNIQUE (user_id, tool_id)
);
```

**Current State:** Uses mock data  
**To Connect:** Update `useSavedTools` hook with Supabase queries

**Example Integration:**

```typescript
// In useSavedTools hook
useEffect(() => {
  async function fetchSavedTools() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: saved } = await supabase
      .from('saved_tools')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    setSavedTools(saved || []);
  }

  fetchSavedTools();
}, []);
```

## Best Practices

### 1. Placement

✅ **Good places for bookmark buttons:**
- Tool cards in directory/search
- Tool detail page header
- Search results
- Category listings

❌ **Avoid placing in:**
- Navigation bars
- Footers
- Non-tool contexts

### 2. Size Guidelines

- **Small (sm):** Compact cards, list views
- **Medium (md):** Standard tool cards, default choice
- **Large (lg):** Hero sections, detail pages

### 3. Variant Selection

- **Icon:** When space is limited or button should be subtle
- **Button:** When action should be prominent and clear

### 4. User Feedback

The button provides feedback through:
- Visual state change (filled vs. outline)
- Brief scale animation
- Color change
- Text change (button variant)

### 5. Performance

- Component prevents event bubbling (won't trigger parent clicks)
- Debounced with animation state
- Optimistic UI updates
- Minimal re-renders

## Customization

### Custom Icons

Replace the `Bookmark` icon:

```tsx
import { Heart } from 'lucide-react';

// In BookmarkButton.tsx, replace Bookmark with Heart
<Heart
  className={`${iconSizes[size]}`}
  strokeWidth={saved ? 0 : 2}
  fill={saved ? 'currentColor' : 'none'}
/>
```

### Custom Colors

Override with Tailwind classes:

```tsx
<BookmarkButton
  toolId="example"
  toolName="Example"
  className="bg-blue-500 hover:bg-blue-600 text-white"
/>
```

### Custom Animation

Modify the animation state logic:

```tsx
// Longer animation
setTimeout(() => setIsAnimating(false), 600);

// Different animation effect
className={isAnimating ? 'animate-bounce' : ''}
```

## Testing

### Mock States

```typescript
// In /hooks/useBilling.ts

// Test with empty saved tools
const mockSavedTools: SavedTool[] = [];

// Test with many saved tools
const mockSavedTools: SavedTool[] = Array.from({ length: 20 }, (_, i) => ({
  id: `saved_${i}`,
  userId: 'user_123',
  toolId: `tool_${i}`,
  toolName: `Tool ${i}`,
  toolCategory: 'Category',
  savedAt: new Date(),
}));
```

### Manual Testing Checklist

- [ ] Click bookmark button to save
- [ ] Click again to unsave
- [ ] Animation plays on click
- [ ] Icon fills when saved
- [ ] Icon outlines when unsaved
- [ ] Saved tools appear in profile
- [ ] Remove from saved tools list
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Responsive on mobile
- [ ] Hover states work
- [ ] Doesn't trigger parent onClick

## Future Enhancements

**Potential additions:**

1. **Collections:**
   - Group saved tools into custom lists
   - Share collections with others

2. **Notes:**
   - Add personal notes to saved tools
   - Edit notes inline

3. **Sorting:**
   - Sort by date saved, name, category
   - Filter by category

4. **Bulk Actions:**
   - Remove multiple tools at once
   - Export saved tools list

5. **Notifications:**
   - Alert when saved tool updates
   - Weekly digest of saved tools

6. **Social Features:**
   - See how many users saved a tool
   - "Popular in your saved tools" suggestions

## Support

For issues or questions:
- Check the TypeScript types in `/types/billing.ts`
- Review hook implementation in `/hooks/useBilling.ts`
- See component code in `/components/BookmarkButton.tsx`

---

**Last Updated:** November 21, 2025
