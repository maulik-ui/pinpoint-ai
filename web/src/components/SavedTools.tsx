"use client";

/**
 * Saved Tools Component - Clean Implementation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { createClient } from '@/src/lib/supabaseClientBrowser';
import Link from 'next/link';
import ToolLogo from './ToolLogo';
import { ScoreCircle } from './ScoreCircle';

interface SavedToolsProps {
  onSelectTool?: (toolId: string) => void;
}

type SavedTool = {
  id: string;
  tool_id: string;
  created_at: string;
  tools: {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    logo_url: string | null;
    overall_score: number | null;
  };
};

export function SavedTools({ onSelectTool }: SavedToolsProps) {
  const router = useRouter();
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSavedTools() {
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Handle refresh token errors
        if (sessionError) {
          if (sessionError.message?.includes('Refresh Token') || sessionError.message?.includes('refresh_token')) {
            await supabase.auth.signOut({ scope: 'local' });
          }
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (!session?.user) {
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("user_saved_tools")
          .select(`
            id,
            tool_id,
            created_at,
            tools:tool_id (
              id,
              name,
              slug,
              category,
              logo_url,
              overall_score
            )
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (!mounted) return;

        if (error) {
          console.error("Error fetching saved tools:", error);
          setSavedTools([]);
        } else {
          const validData = (data || [])
            .filter((item: any) => item.tools !== null)
            .map((item: any) => ({
              id: item.id,
              tool_id: item.tool_id,
              created_at: item.created_at,
              tools: item.tools,
            })) as SavedTool[];
          setSavedTools(validData);
        }
      } catch (error) {
        console.error("Error fetching saved tools:", error);
        if (mounted) {
          setSavedTools([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSavedTools();

    return () => {
      mounted = false;
    };
  }, []);

  const handleToolClick = (tool: SavedTool['tools']) => {
    if (onSelectTool) {
      onSelectTool(tool.id);
    } else {
      router.push(`/tool/${tool.slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Saved Tools</h2>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (savedTools.length === 0) {
    return (
      <div className="p-8">
        <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Saved Tools</h2>
        <div className="text-center py-12">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">
            You haven't saved any tools yet
          </p>
          <Link
            href="/search"
            className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Browse Tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Saved Tools</h2>
      <div className="space-y-4">
        {savedTools.map((savedTool) => (
          <div
            key={savedTool.id}
            onClick={() => handleToolClick(savedTool.tools)}
            className="flex items-center gap-4 p-4 bg-secondary/20 rounded-[16px] border border-border/30 hover:bg-secondary/40 hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-card border border-border/50">
              <ToolLogo
                logoUrl={savedTool.tools.logo_url}
                toolName={savedTool.tools.name}
                size="md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg mb-1 group-hover:text-primary transition-colors" style={{ fontWeight: 500 }}>
                {savedTool.tools.name}
              </h3>
              {savedTool.tools.category && (
                <span className="text-xs text-muted-foreground">{savedTool.tools.category}</span>
              )}
            </div>
            {savedTool.tools.overall_score !== null && savedTool.tools.overall_score !== undefined && (
              <div className="flex-shrink-0">
                <ScoreCircle score={savedTool.tools.overall_score} size="sm" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
