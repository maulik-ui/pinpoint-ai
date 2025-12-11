# Backend Integration Guide for Pinpoint AI

This guide explains how to integrate your Pinpoint AI frontend with your backend logic when using Cursor.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Export from Figma Make](#export-from-figma-make)
3. [Set Up in Cursor](#set-up-in-cursor)
4. [Replace Mock Data](#replace-mock-data)
5. [API Integration Patterns](#api-integration-patterns)
6. [State Management](#state-management)
7. [Database Integration](#database-integration)
8. [Authentication](#authentication)

---

## 🎯 Overview

Your Pinpoint AI app currently uses mock data. Here's how to connect it to real backend APIs:

```
Figma Make (Frontend)  →  Export Code  →  Cursor (Full Stack)  →  Backend APIs
```

---

## 📤 Export from Figma Make

### Step 1: Copy All Files

From Figma Make, copy these files to your local machine:

```
/App.tsx                    → Your main component
/components/                → All React components
/styles/globals.css         → Your styling
/lib/                      → Utility functions
/scripts/                  → Figma sync scripts
```

### Step 2: Create a New Project in Cursor

```bash
# Create a Next.js project
npx create-next-app@latest pinpoint-ai
cd pinpoint-ai

# Open in Cursor
cursor .
```

### Step 3: Install Dependencies

```bash
npm install lucide-react motion recharts
```

### Step 4: Copy Your Files

```bash
# Copy components
cp -r /path/to/figma-make/components ./components

# Copy styles
cp /path/to/figma-make/styles/globals.css ./styles

# Copy your App.tsx content to app/page.tsx
```

---

## 🔄 Replace Mock Data

Currently, your components use mock data. Let's replace it with real API calls.

### Current Mock Data Pattern

```typescript
// Current: Static mock data
const topTools = [
  {
    name: "ChatGPT",
    description: "Conversational AI assistant",
    category: "AI Chat",
    verified: true,
    score: 8.7,
    pricing: "Freemium",
    image: "/placeholder.jpg",
  },
  // ... more tools
];
```

### New API Pattern

```typescript
// New: Dynamic data from API
import { useState, useEffect } from 'react';

function HomePage() {
  const [topTools, setTopTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTools() {
      try {
        const response = await fetch('/api/tools');
        const data = await response.json();
        setTopTools(data.topTools);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTools();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {topTools.map(tool => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
```

---

## 🔌 API Integration Patterns

### Pattern 1: Next.js API Routes (Recommended)

Create API routes in your Next.js app:

```typescript
// /app/api/tools/route.ts
import { NextResponse } from 'next/server';

// Connect to your database or external API
export async function GET(request: Request) {
  try {
    // Fetch from your database
    const tools = await db.tools.findMany({
      orderBy: { score: 'desc' },
      take: 10,
    });

    return NextResponse.json({ topTools: tools });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// POST endpoint for creating tools
export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const newTool = await db.tools.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        // ... other fields
      },
    });

    return NextResponse.json(newTool);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}
```

### Pattern 2: External Backend API

If you have a separate backend (Node.js, Python, etc.):

```typescript
// /lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getTools(query?: string) {
  const url = query 
    ? `${API_URL}/api/tools?q=${encodeURIComponent(query)}`
    : `${API_URL}/api/tools`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch tools');
  }

  return response.json();
}

export async function getToolDetails(id: string) {
  const response = await fetch(`${API_URL}/api/tools/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch tool details');
  }

  return response.json();
}

export async function searchTools(query: string) {
  const response = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  return response.json();
}
```

Use it in your components:

```typescript
import { getTools } from '@/lib/api';

function ToolsList() {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    getTools().then(setTools);
  }, []);

  return (/* ... */);
}
```

### Pattern 3: React Query (Best for Complex Apps)

For better caching and state management:

```bash
npm install @tanstack/react-query
```

```typescript
// /app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```typescript
// /hooks/useTools.ts
import { useQuery } from '@tanstack/react-query';
import { getTools } from '@/lib/api';

export function useTools() {
  return useQuery({
    queryKey: ['tools'],
    queryFn: getTools,
  });
}

export function useToolDetails(id: string) {
  return useQuery({
    queryKey: ['tool', id],
    queryFn: () => getToolDetails(id),
  });
}
```

Use in components:

```typescript
import { useTools } from '@/hooks/useTools';

function ToolsList() {
  const { data: tools, isLoading, error } = useTools();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tools</div>;

  return (
    <div>
      {tools?.map(tool => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
```

---

## 📊 State Management

For larger apps, consider state management:

### Option 1: Zustand (Simple & Recommended)

```bash
npm install zustand
```

```typescript
// /store/useToolStore.ts
import { create } from 'zustand';

interface ToolStore {
  tools: Tool[];
  selectedTool: Tool | null;
  searchQuery: string;
  setTools: (tools: Tool[]) => void;
  setSelectedTool: (tool: Tool | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  tools: [],
  selectedTool: null,
  searchQuery: '',
  setTools: (tools) => set({ tools }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
```

Use in components:

```typescript
import { useToolStore } from '@/store/useToolStore';

function SearchBar() {
  const { searchQuery, setSearchQuery } = useToolStore();

  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
}
```

### Option 2: Redux Toolkit (For Complex Apps)

```bash
npm install @reduxjs/toolkit react-redux
```

---

## 💾 Database Integration

### Option 1: Prisma (Recommended)

```bash
npm install @prisma/client
npm install -D prisma
```

Initialize Prisma:

```bash
npx prisma init
```

Define your schema:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tool {
  id          String   @id @default(cuid())
  name        String
  description String
  category    String
  verified    Boolean  @default(false)
  score       Float
  pricing     String
  image       String?
  url         String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  reviews     Review[]
  features    Feature[]
}

model Review {
  id        String   @id @default(cuid())
  toolId    String
  tool      Tool     @relation(fields: [toolId], references: [id])
  rating    Float
  comment   String
  createdAt DateTime @default(now())
}

model Feature {
  id          String  @id @default(cuid())
  toolId      String
  tool        Tool    @relation(fields: [toolId], references: [id])
  name        String
  description String
  verified    Boolean @default(false)
}
```

Create Prisma client:

```typescript
// /lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Use in API routes:

```typescript
// /app/api/tools/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const tools = await prisma.tool.findMany({
    include: {
      reviews: true,
      features: true,
    },
    orderBy: {
      score: 'desc',
    },
  });

  return NextResponse.json(tools);
}
```

### Option 2: Supabase

```bash
npm install @supabase/supabase-js
```

```typescript
// /lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

Use in your app:

```typescript
import { supabase } from '@/lib/supabase';

async function getTools() {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('score', { ascending: false });

  if (error) throw error;
  return data;
}
```

---

## 🔐 Authentication

### Option 1: NextAuth.js

```bash
npm install next-auth
```

```typescript
// /app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});

export { handler as GET, handler as POST };
```

Use in components:

```typescript
import { useSession, signIn, signOut } from 'next-auth/react';

function Header() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <>
          <p>Welcome, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <button onClick={() => signIn()}>Sign in</button>
      )}
    </div>
  );
}
```

### Option 2: Clerk

```bash
npm install @clerk/nextjs
```

---

## 🔗 Complete Integration Example

Here's a complete example showing all pieces together:

### 1. API Layer

```typescript
// /lib/api/tools.ts
import { prisma } from '@/lib/prisma';

export async function getAllTools() {
  return await prisma.tool.findMany({
    include: {
      reviews: true,
      features: true,
    },
    orderBy: { score: 'desc' },
  });
}

export async function getToolById(id: string) {
  return await prisma.tool.findUnique({
    where: { id },
    include: {
      reviews: true,
      features: true,
    },
  });
}

export async function searchTools(query: string) {
  return await prisma.tool.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      reviews: true,
    },
  });
}
```

### 2. API Routes

```typescript
// /app/api/tools/route.ts
import { getAllTools } from '@/lib/api/tools';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const tools = query 
      ? await searchTools(query)
      : await getAllTools();

    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// /app/api/tools/[id]/route.ts
import { getToolById } from '@/lib/api/tools';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tool = await getToolById(params.id);
    
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
}
```

### 3. React Hook

```typescript
// /hooks/useTools.ts
import { useQuery } from '@tanstack/react-query';

export function useTools(query?: string) {
  return useQuery({
    queryKey: ['tools', query],
    queryFn: async () => {
      const url = query 
        ? `/api/tools?q=${encodeURIComponent(query)}`
        : '/api/tools';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });
}

export function useTool(id: string) {
  return useQuery({
    queryKey: ['tool', id],
    queryFn: async () => {
      const response = await fetch(`/api/tools/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    enabled: !!id,
  });
}
```

### 4. Component

```typescript
// /components/ToolsList.tsx
import { useTools } from '@/hooks/useTools';
import { ToolCard } from './ToolCard';

export function ToolsList({ searchQuery }: { searchQuery?: string }) {
  const { data: tools, isLoading, error } = useTools(searchQuery);

  if (isLoading) {
    return <div className="text-center py-12">Loading tools...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">
      Error loading tools. Please try again.
    </div>;
  }

  if (!tools || tools.length === 0) {
    return <div className="text-center py-12">No tools found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map(tool => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
```

---

## 🎯 Quick Migration Checklist

- [ ] Set up Next.js project in Cursor
- [ ] Copy all components and styles
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Choose database (Prisma/Supabase)
- [ ] Define data models/schema
- [ ] Create API routes
- [ ] Replace mock data with API calls
- [ ] Set up authentication (optional)
- [ ] Set up state management (optional)
- [ ] Test all functionality
- [ ] Deploy!

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [NextAuth.js Documentation](https://next-auth.js.org)

---

Good luck with your integration! 🚀
