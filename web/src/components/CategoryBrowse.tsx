"use client";

/**
 * Category Browse Page
 * 
 * A visually rich page displaying all 25 AI tool categories with smooth animations,
 * search functionality, and an intuitive grid layout.
 */

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Brain,
  Briefcase,
  PenTool,
  Code,
  Layout,
  Image as ImageIcon,
  Wand2,
  Video,
  Film,
  Mic,
  Presentation,
  Megaphone,
  Headset,
  BarChart3,
  Workflow,
  BookOpen,
  GraduationCap,
  Scale,
  DollarSign,
  Users,
  Heart,
  ShoppingCart,
  Home,
  Box,
  Shield,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import AuthButton from "./AuthButton";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ScoreCircle } from "./ScoreCircle";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string; // Tailwind color class
  toolCount?: number;
}

// Base categories definition - toolCount will be updated with real data
const baseCategories: Omit<Category, "toolCount">[] = [
  {
    id: "core-models",
    name: "Core Models",
    description: "Foundation models and LLMs powering AI applications",
    icon: Brain,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "ai-workspaces",
    name: "AI Workspaces",
    description: "Integrated environments for AI-powered productivity",
    icon: Briefcase,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "writing-tools",
    name: "Writing Tools",
    description: "AI assistants for content creation and copywriting",
    icon: PenTool,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "code-copilots",
    name: "Code Copilots",
    description: "AI pair programmers and code generation tools",
    icon: Code,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "ui-design",
    name: "UI Design",
    description: "Design tools with AI-powered features and automation",
    icon: Layout,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "image-gen",
    name: "Image Gen",
    description: "Text-to-image and AI image generation platforms",
    icon: ImageIcon,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "image-editing",
    name: "Image Editing",
    description: "AI-powered photo editing and enhancement tools",
    icon: Wand2,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "video-gen",
    name: "Video Gen",
    description: "Text-to-video and AI video creation platforms",
    icon: Video,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "video-editing",
    name: "Video Editing",
    description: "AI assistants for video editing and post-production",
    icon: Film,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "audio-voice",
    name: "Audio and Voice",
    description: "Voice cloning, music generation, and audio tools",
    icon: Mic,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "presentations",
    name: "Presentations",
    description: "AI-powered slide decks and presentation builders",
    icon: Presentation,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "marketing-ai",
    name: "Marketing AI",
    description: "Campaign tools, SEO, and marketing automation",
    icon: Megaphone,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "sales-support",
    name: "Sales and Support",
    description: "CRM tools, chatbots, and customer service AI",
    icon: Headset,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "data-analytics",
    name: "Data and Analytics",
    description: "Business intelligence and data visualization tools",
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "automation-agents",
    name: "Automation Agents",
    description: "Workflow automation and AI agent platforms",
    icon: Workflow,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "research-tools",
    name: "Research Tools",
    description: "Academic research, literature review, and analysis",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "education-ai",
    name: "Education AI",
    description: "Learning platforms and educational content tools",
    icon: GraduationCap,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "legal-ai",
    name: "Legal AI",
    description: "Legal research, document review, and compliance",
    icon: Scale,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "finance-ops",
    name: "Finance Ops",
    description: "Accounting, forecasting, and financial analysis",
    icon: DollarSign,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "hr-tech",
    name: "HR Tech",
    description: "Recruiting, onboarding, and talent management",
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "healthcare-ai",
    name: "Healthcare AI",
    description: "Medical diagnosis, research, and patient care tools",
    icon: Heart,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "ecommerce-ai",
    name: "Ecommerce AI",
    description: "Product recommendations and online retail tools",
    icon: ShoppingCart,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "real-estate-ai",
    name: "Real Estate AI",
    description: "Property valuation, listing tools, and market analysis",
    icon: Home,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "3d-vfx",
    name: "3D and VFX",
    description: "3D modeling, rendering, and visual effects tools",
    icon: Box,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "security-compliance",
    name: "Security and Compliance",
    description: "Cybersecurity tools and compliance automation",
    icon: Shield,
    color: "bg-primary/10 text-primary",
  },
];

// Create categories with real counts
function getCategoriesWithCounts(categoryCounts: Record<string, number>): Category[] {
  return baseCategories.map((cat) => ({
    ...cat,
    toolCount: categoryCounts[cat.id] || 0,
  }));
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  category: string | null;
  logo_url: string | null;
  pricing_model: string | null;
  overall_score: number | null;
  pinpoint_score?: number | null;
}

interface CategoryBrowseProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategoryId?: string | null;
  categoryCounts?: Record<string, number>;
}

export function CategoryBrowse({ onSelectCategory, selectedCategoryId, categoryCounts = {} }: CategoryBrowseProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  
  // Get categories with real counts
  const categories = getCategoriesWithCounts(categoryCounts);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Fetch tools when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      fetchToolsByCategory(selectedCategoryId);
    } else {
      setTools([]);
      setToolsError(null);
    }
  }, [selectedCategoryId]);

  async function fetchToolsByCategory(categoryId: string) {
    setLoadingTools(true);
    setToolsError(null);

    try {
      const response = await fetch(`/api/tools/by-category?category=${encodeURIComponent(categoryId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch tools: ${response.status}`);
      }

      // Log for debugging
      console.log("Tools fetched:", data.tools?.map((t: Tool) => ({ name: t.name, pinpoint_score: t.pinpoint_score, overall_score: t.overall_score })));

      // Ensure tools are sorted by score (highest first)
      const sortedTools = (data.tools || []).sort((a: Tool, b: Tool) => {
        const scoreA = a.pinpoint_score ?? a.overall_score ?? 0;
        const scoreB = b.pinpoint_score ?? b.overall_score ?? 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA; // Descending order
        }
        return (a.name || '').localeCompare(b.name || '');
      });

      setTools(sortedTools);
    } catch (err) {
      console.error("Error fetching tools by category:", err);
      setToolsError(err instanceof Error ? err.message : "Failed to load tools");
      setTools([]);
    } finally {
      setLoadingTools(false);
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    } else {
      // Navigate to browse page with category filter
      router.push(`/browse?category=${encodeURIComponent(categoryId)}`);
    }
  };

  const selectedCategory = selectedCategoryId
    ? categories.find((cat) => cat.id === selectedCategoryId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="px-8 py-6 border-b border-border/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <Logo size="md" />
            <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>
              Pinpoint AI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              Search
            </Link>
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section - Only show when no category is selected */}
      {!selectedCategoryId && (
        <section className="px-8 py-16 border-b border-border/30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
              <span className="text-sm" style={{ fontWeight: 500 }}>
                Browse by Category
              </span>
            </div>

            <h1 className="text-4xl mb-4" style={{ fontWeight: 500 }}>
              Discover AI Tools
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Explore 25 carefully curated categories featuring the best AI tools for every use case.
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-card rounded-[16px] border border-border/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Tools Section - Show when category is selected */}
      {selectedCategoryId && selectedCategory && (
        <section className="px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span className="text-sm" style={{ fontWeight: 500 }}>
                    {selectedCategory.name}
                  </span>
                </div>
                <h1 className="text-4xl tracking-tight mb-2" style={{ fontWeight: 600 }}>
                  {selectedCategory.name}
                </h1>
                <p className="text-lg text-muted-foreground">{selectedCategory.description}</p>
              </div>
              <button
                onClick={() => router.push("/browse")}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Categories
              </button>
            </div>

            {loadingTools && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading tools...</p>
              </div>
            )}

            {toolsError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-[20px] p-6 text-center">
                <p className="text-destructive">{toolsError}</p>
              </div>
            )}

            {!loadingTools && !toolsError && tools.length === 0 && (
              <div className="bg-secondary/30 rounded-[20px] p-8 text-center">
                <p className="text-muted-foreground">No tools found in this category.</p>
              </div>
            )}

            {!loadingTools && !toolsError && tools.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-9">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link
                      href={`/tool/${tool.slug}`}
                      className="block bg-card rounded-[20px] p-9 border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between gap-6 mb-6">
                        <div className="flex items-start gap-6 flex-1 min-w-0">
                          {tool.logo_url ? (
                            <ImageWithFallback
                              src={tool.logo_url}
                              alt={`${tool.name} logo`}
                              className="w-18 h-18 rounded-lg object-cover flex-shrink-0"
                              style={{ width: '4.5rem', height: '4.5rem' }}
                            />
                          ) : (
                            <div className="rounded-lg bg-secondary flex items-center justify-center text-2xl font-semibold flex-shrink-0" style={{ width: '4.5rem', height: '4.5rem' }}>
                              {tool.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl mb-2 truncate" style={{ fontWeight: 600 }}>
                              {tool.name}
                            </h3>
                            {tool.pricing_model && (
                              <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                                {tool.pricing_model}
                              </span>
                            )}
                          </div>
                        </div>
                        {(tool.pinpoint_score ?? tool.overall_score) !== null && (tool.pinpoint_score ?? tool.overall_score) !== undefined && (tool.pinpoint_score ?? tool.overall_score)! > 0 ? (
                          <div className="flex-shrink-0">
                            <ScoreCircle score={tool.pinpoint_score ?? tool.overall_score ?? 0} size={84} strokeWidth={6} />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center rounded-full border-2 border-primary/30 bg-primary/5 flex-shrink-0" style={{ width: '5.25rem', height: '5.25rem' }}>
                            <div className="text-sm text-foreground/50" style={{ fontWeight: 500 }}>N/A</div>
                          </div>
                        )}
                      </div>
                      {tool.short_description && (
                        <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed">
                          {tool.short_description}
                        </p>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories Grid - Only show when no category is selected */}
      {!selectedCategoryId && (
        <section className="px-8 py-16">
          <div className="max-w-7xl mx-auto">
            {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground">No categories found matching "{searchQuery}"</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              layout
            >
              {filteredCategories.map((category, index) => {
                const Icon = category.icon;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    whileHover={{ y: -4 }}
                    layout
                  >
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-full text-left bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Icon and Title - Horizontal Layout */}
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-16 h-16 rounded-[12px] ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                        >
                          <Icon className="w-8 h-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-base text-secondary-foreground" style={{ fontWeight: 500 }}>
                          {category.name}
                        </h3>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {category.description}
                      </p>

                      {/* Tool Count */}
                      {category.toolCount && (
                        <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                          <div className="flex-1">
                            <span className="text-sm text-muted-foreground">
                              {category.toolCount} tools
                            </span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-primary text-xs">→</span>
                          </div>
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          </div>
        </section>
      )}

      {/* Bottom CTA - Only show when no category is selected */}
      {!selectedCategoryId && (
        <section className="px-8 py-16 border-t border-border/30">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl mb-4" style={{ fontWeight: 500 }}>
            Can't find what you're looking for?
          </h2>
          <p className="text-muted-foreground mb-6">
            Use our AI-powered search to discover tools across all categories
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-[12px] hover:bg-primary/90 transition-colors"
          >
            Try AI Search
          </Link>
        </motion.div>
      </section>
      )}
    </div>
  );
}

