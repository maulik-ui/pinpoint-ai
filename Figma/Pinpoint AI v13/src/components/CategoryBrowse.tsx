/**
 * Category Browse Page
 * 
 * A visually rich page displaying all 25 AI tool categories with smooth animations,
 * search functionality, and an intuitive grid layout.
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
  ArrowLeft,
  User,
} from 'lucide-react';
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import { Navigation } from './Navigation';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string; // Tailwind color class
  toolCount?: number;
}

const categories: Category[] = [
  {
    id: 'core-models',
    name: 'Core Models',
    description: 'Foundation models and LLMs powering AI applications',
    icon: Brain,
    color: 'bg-primary/10 text-primary',
    toolCount: 12,
  },
  {
    id: 'ai-workspaces',
    name: 'AI Workspaces',
    description: 'Integrated environments for AI-powered productivity',
    icon: Briefcase,
    color: 'bg-primary/10 text-primary',
    toolCount: 18,
  },
  {
    id: 'writing-tools',
    name: 'Writing Tools',
    description: 'AI assistants for content creation and copywriting',
    icon: PenTool,
    color: 'bg-primary/10 text-primary',
    toolCount: 34,
  },
  {
    id: 'code-copilots',
    name: 'Code Copilots',
    description: 'AI pair programmers and code generation tools',
    icon: Code,
    color: 'bg-primary/10 text-primary',
    toolCount: 22,
  },
  {
    id: 'ui-design',
    name: 'UI Design',
    description: 'Design tools with AI-powered features and automation',
    icon: Layout,
    color: 'bg-primary/10 text-primary',
    toolCount: 15,
  },
  {
    id: 'image-gen',
    name: 'Image Gen',
    description: 'Text-to-image and AI image generation platforms',
    icon: ImageIcon,
    color: 'bg-primary/10 text-primary',
    toolCount: 28,
  },
  {
    id: 'image-editing',
    name: 'Image Editing',
    description: 'AI-powered photo editing and enhancement tools',
    icon: Wand2,
    color: 'bg-primary/10 text-primary',
    toolCount: 19,
  },
  {
    id: 'video-gen',
    name: 'Video Gen',
    description: 'Text-to-video and AI video creation platforms',
    icon: Video,
    color: 'bg-primary/10 text-primary',
    toolCount: 16,
  },
  {
    id: 'video-editing',
    name: 'Video Editing',
    description: 'AI assistants for video editing and post-production',
    icon: Film,
    color: 'bg-primary/10 text-primary',
    toolCount: 14,
  },
  {
    id: 'audio-voice',
    name: 'Audio and Voice',
    description: 'Voice cloning, music generation, and audio tools',
    icon: Mic,
    color: 'bg-primary/10 text-primary',
    toolCount: 21,
  },
  {
    id: 'presentations',
    name: 'Presentations',
    description: 'AI-powered slide decks and presentation builders',
    icon: Presentation,
    color: 'bg-primary/10 text-primary',
    toolCount: 9,
  },
  {
    id: 'marketing-ai',
    name: 'Marketing AI',
    description: 'Campaign tools, SEO, and marketing automation',
    icon: Megaphone,
    color: 'bg-primary/10 text-primary',
    toolCount: 31,
  },
  {
    id: 'sales-support',
    name: 'Sales and Support',
    description: 'CRM tools, chatbots, and customer service AI',
    icon: Headset,
    color: 'bg-primary/10 text-primary',
    toolCount: 24,
  },
  {
    id: 'data-analytics',
    name: 'Data and Analytics',
    description: 'Business intelligence and data visualization tools',
    icon: BarChart3,
    color: 'bg-primary/10 text-primary',
    toolCount: 17,
  },
  {
    id: 'automation-agents',
    name: 'Automation Agents',
    description: 'Workflow automation and AI agent platforms',
    icon: Workflow,
    color: 'bg-primary/10 text-primary',
    toolCount: 26,
  },
  {
    id: 'research-tools',
    name: 'Research Tools',
    description: 'Academic research, literature review, and analysis',
    icon: BookOpen,
    color: 'bg-primary/10 text-primary',
    toolCount: 13,
  },
  {
    id: 'education-ai',
    name: 'Education AI',
    description: 'Learning platforms and educational content tools',
    icon: GraduationCap,
    color: 'bg-primary/10 text-primary',
    toolCount: 18,
  },
  {
    id: 'legal-ai',
    name: 'Legal AI',
    description: 'Legal research, document review, and compliance',
    icon: Scale,
    color: 'bg-primary/10 text-primary',
    toolCount: 11,
  },
  {
    id: 'finance-ops',
    name: 'Finance Ops',
    description: 'Accounting, forecasting, and financial analysis',
    icon: DollarSign,
    color: 'bg-primary/10 text-primary',
    toolCount: 15,
  },
  {
    id: 'hr-tech',
    name: 'HR Tech',
    description: 'Recruiting, onboarding, and talent management',
    icon: Users,
    color: 'bg-primary/10 text-primary',
    toolCount: 14,
  },
  {
    id: 'healthcare-ai',
    name: 'Healthcare AI',
    description: 'Medical diagnosis, research, and patient care tools',
    icon: Heart,
    color: 'bg-primary/10 text-primary',
    toolCount: 19,
  },
  {
    id: 'ecommerce-ai',
    name: 'Ecommerce AI',
    description: 'Product recommendations and online retail tools',
    icon: ShoppingCart,
    color: 'bg-primary/10 text-primary',
    toolCount: 22,
  },
  {
    id: 'real-estate-ai',
    name: 'Real Estate AI',
    description: 'Property valuation, listing tools, and market analysis',
    icon: Home,
    color: 'bg-primary/10 text-primary',
    toolCount: 8,
  },
  {
    id: '3d-vfx',
    name: '3D and VFX',
    description: '3D modeling, rendering, and visual effects tools',
    icon: Box,
    color: 'bg-primary/10 text-primary',
    toolCount: 12,
  },
  {
    id: 'security-compliance',
    name: 'Security and Compliance',
    description: 'Cybersecurity tools and compliance automation',
    icon: Shield,
    color: 'bg-primary/10 text-primary',
    toolCount: 16,
  },
];

interface CategoryBrowseProps {
  onSelectCategory?: (categoryId: string) => void;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function CategoryBrowse({ onSelectCategory, onBack, onNavigate, isDarkMode = false, onToggleDarkMode = () => {} }: CategoryBrowseProps) {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation 
        onBack={onBack}
        onNavigate={(page) => {
          if (page === 'home' && onBack) {
            onBack();
          } else if (onNavigate) {
            onNavigate(page);
          }
        }}
        onLogoClick={onBack}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        showBackButton={false}
      />

      {/* Hero Section */}
      <section className="px-4 md:px-8 py-16 border-b border-border/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
            <img src={pinpointLogo} alt="Pinpoint AI" className="w-4 h-4" />
            <span className="text-sm" style={{ fontWeight: 500 }}>
              Browse by Category
            </span>
          </div>
          
          <h1 className="text-4xl mb-4" style={{ fontWeight: 500 }}>
            Discover AI Tools
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Explore carefully curated categories featuring the best AI tools for every use case.
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

      {/* Categories Grid */}
      <section className="px-4 md:px-8 py-16">
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
                      onClick={() => onSelectCategory?.(category.id)}
                      className="w-full text-left bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Icon and Title - Horizontal Layout */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-[12px] ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
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
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 md:px-8 py-16 border-t border-border/30">
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
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-[12px] hover:bg-primary/90 transition-colors">
            Try AI Search
          </button>
        </motion.div>
      </section>
    </div>
  );
}