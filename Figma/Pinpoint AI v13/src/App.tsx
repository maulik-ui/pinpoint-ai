import { useState, useEffect } from "react";
import { Search, ImageIcon, Code, Brain, User, Briefcase, PenTool, Layout } from "lucide-react";
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import { ToolPage } from "./components/ToolPage";
import { SearchResults } from "./components/SearchResults";
import { PricingPage } from "./components/PricingPage";
import { ToolSubmissionPage } from "./components/ToolSubmissionPage";
import { UserPage } from "./components/UserPage";
import { AlphaBar } from "./components/AlphaBar";
import { CategoryBrowse } from "./components/CategoryBrowse";
import { ContactForm } from "./components/ContactForm";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { CookiePolicy } from "./components/CookiePolicy";
import { CategoryResults } from "./components/CategoryResults";
import { AboutUs } from "./components/AboutUs";
import { Footer } from "./components/Footer";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { BlogPage } from "./components/BlogPage";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'tool' | 'search' | 'pricing' | 'user' | 'categories' | 'privacy' | 'terms' | 'cookies' | 'category-results' | 'about' | 'submit-tool' | 'blog'>('home');
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const placeholders = [
    "I want to convert images into a textured 3D model",
    "Find me a tool that can turn drone photos into a point cloud",
    "What tool can generate product renders from a single image",
    "I want to upscale my videos to real 4K without artifacts",
    "Find me a tool that removes noise from podcast recordings",
    "What tool can separate vocals from instruments cleanly",
    "I want to turn meeting audio into action items automatically",
    "Find me a tool that creates animations straight from storyboards",
    "What tool can track my SaaS competitors and their feature updates",
    "I want to clean and organize customer support tickets with AI",
    "Find me a tool that generates API docs directly from my codebase",
    "What tool can test my API endpoints without writing scripts",
    "I want to label a large dataset for object detection fast",
    "Find me a tool that auto-labels training data with bounding boxes",
    "What tool can turn CSV datasets into structured labeled data",
    "I want to convert handwriting into clean vector SVG files",
    "Find me a tool that generates accurate transcripts for medical audio",
    "What tool can create photorealistic lighting for product shots",
    "I want to compare AI coding assistants for React accuracy",
    "Find me a tool that generates voiceovers in 48 kHz quality"
  ];

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { 
      id: 'core-models',
      name: 'Core Models', 
      icon: Brain, 
      description: 'Foundation models and LLMs powering AI applications',
      toolCount: 12,
    },
    { 
      id: 'ai-workspaces',
      name: 'AI Workspaces', 
      icon: Briefcase, 
      description: 'Integrated environments for AI-powered productivity',
      toolCount: 18,
    },
    { 
      id: 'writing-tools',
      name: 'Writing Tools', 
      icon: PenTool, 
      description: 'AI assistants for content creation and copywriting',
      toolCount: 34,
    },
    { 
      id: 'code-copilots',
      name: 'Code Copilots', 
      icon: Code, 
      description: 'AI pair programmers and code generation tools',
      toolCount: 22,
    },
    { 
      id: 'ui-design',
      name: 'UI Design', 
      icon: Layout, 
      description: 'Design tools with AI-powered features and automation',
      toolCount: 15,
    },
    { 
      id: 'image-gen',
      name: 'Image Gen', 
      icon: ImageIcon, 
      description: 'Text-to-image and AI image generation platforms',
      toolCount: 28,
    },
  ];

  if (currentPage === 'tool') {
    return (
      <>
        <ToolPage 
          onBack={() => setCurrentPage('home')} 
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          onCategoryClick={(categoryId, categoryName) => {
            setSelectedCategory({ id: categoryId, name: categoryName });
            setCurrentPage('category-results');
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'search') {
    return (
      <>
        <SearchResults
          query={searchQuery || "AI writing tools"}
          onBack={() => setCurrentPage('home')}
          onSelectTool={() => {
            setCurrentPage('tool');
          }}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'pricing') {
    return (
      <>
        <PricingPage 
          onBack={() => setCurrentPage('home')}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'user') {
    return (
      <>
        <UserPage 
          onBack={() => setCurrentPage('home')} 
          onSelectTool={() => setCurrentPage('tool')}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'categories') {
    return (
      <>
        <CategoryBrowse
          onBack={() => setCurrentPage('home')}
          onSelectCategory={(categoryId) => {
            // Find the category by ID and set it
            const category = categories.find(c => c.id === categoryId);
            if (category) {
              setSelectedCategory(category);
              setCurrentPage('category-results');
            }
          }}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'privacy') {
    return (
      <>
        <PrivacyPolicy
          onBack={() => setCurrentPage('home')}
          onNavigateToAccount={() => setCurrentPage('user')}
          onNavigateToTerms={() => setCurrentPage('terms')}
          onNavigateToCookies={() => setCurrentPage('cookies')}
          onNavigateToPricing={() => setCurrentPage('pricing')}
          onNavigateToAbout={() => setCurrentPage('about')}
          onNavigateToCategories={() => setCurrentPage('categories')}
          onOpenContact={() => setContactFormOpen(true)}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'terms') {
    return (
      <>
        <TermsOfService
          onBack={() => setCurrentPage('home')}
          onNavigateToAccount={() => setCurrentPage('user')}
          onNavigateToPrivacy={() => setCurrentPage('privacy')}
          onNavigateToCookies={() => setCurrentPage('cookies')}
          onNavigateToPricing={() => setCurrentPage('pricing')}
          onNavigateToAbout={() => setCurrentPage('about')}
          onNavigateToCategories={() => setCurrentPage('categories')}
          onOpenContact={() => setContactFormOpen(true)}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'cookies') {
    return (
      <>
        <CookiePolicy
          onBack={() => setCurrentPage('home')}
          onNavigateToAccount={() => setCurrentPage('user')}
          onNavigateToPrivacy={() => setCurrentPage('privacy')}
          onNavigateToTerms={() => setCurrentPage('terms')}
          onNavigateToPricing={() => setCurrentPage('pricing')}
          onNavigateToAbout={() => setCurrentPage('about')}
          onNavigateToCategories={() => setCurrentPage('categories')}
          onOpenContact={() => setContactFormOpen(true)}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'category-results') {
    return (
      <>
        <CategoryResults
          categoryId={selectedCategory?.id || ''}
          categoryName={selectedCategory?.name || ''}
          onBack={() => setCurrentPage('home')}
          onSelectTool={() => setCurrentPage('tool')}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'about') {
    return (
      <>
        <AboutUs
          onBack={() => setCurrentPage('home')}
          onOpenContact={() => setContactFormOpen(true)}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'submit-tool') {
    return (
      <>
        <ToolSubmissionPage 
          onBack={() => setCurrentPage('home')}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  if (currentPage === 'blog') {
    return (
      <>
        <BlogPage
          onBack={() => setCurrentPage('home')}
          onNavigate={(page) => {
            if (page === 'contact') {
              setContactFormOpen(true);
            } else {
              setCurrentPage(page as any);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <img src={pinpointLogo} alt="Pinpoint AI" className="w-10 h-10" />
            <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>Pinpoint AI</span>
          </div>
          <HamburgerMenu 
            onNavigate={(page) => {
              if (page === 'contact') {
                setContactFormOpen(true);
              } else {
                setCurrentPage(page as any);
              }
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        </div>
      </nav>

      {/* Hero Section - Premium Redesign */}
      <section className="px-4 md:px-8 py-24 md:py-32 lg:py-40 max-w-6xl mx-auto min-h-[80vh] flex items-center">
        <div className="text-center w-full">
          {/* Main Headline */}
          <motion.div 
            className="space-y-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="tracking-tight" style={{ fontWeight: 400, lineHeight: 1.15 }}>
              <span className="text-[1.75rem] md:text-[1.2rem] lg:text-[2rem] block text-foreground/90">
                Find the Perfect{" "}
                <span 
                  className="inline-block relative"
                  style={{ color: "#6E7E55", fontWeight: 500 }}
                >
                  AI
                </span>{" "}
                Tool,
              </span>
              <span 
                className="text-[2.75rem] md:text-[2.4rem] lg:text-5xl block mt-2" 
                style={{ fontWeight: 500, letterSpacing: '-0.02em' }}
              >
                Every Time
              </span>
            </h1>
          </motion.div>

          {/* Premium Search Bar */}
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors z-10" strokeWidth={1.8} />
                
                {/* Animated placeholder for desktop */}
                {!searchQuery && (
                  <div className="hidden md:block absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden w-[calc(100%-8rem)]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="block text-muted-foreground/60"
                        style={{ fontSize: '1.1rem', letterSpacing: '0.01em' }}
                      >
                        {placeholders[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}

                {/* Static placeholder for mobile */}
                {!searchQuery && (
                  <div className="md:hidden absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-muted-foreground/60" style={{ fontSize: '1.1rem', letterSpacing: '0.01em' }}>
                      Search AI tools
                    </span>
                  </div>
                )}
                
                <input
                  type="text"
                  className="w-full pl-16 pr-8 py-5 md:py-5 bg-card rounded-[24px] border border-border/60 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.01em' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage('search');
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Curated by Humans */}
            <motion.p 
              className="text-center mt-12 text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Curated by Humans.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Alpha Bar - Featured new tools */}
      <AlphaBar onSelectTool={() => setCurrentPage('tool')} />

      {/* Categories Section */}
      <section className="px-4 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl tracking-tight mb-3" style={{ fontWeight: 500 }}>Browse by Category</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discover tools organized by your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage('category-results');
                  }}
                  className="group bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300 text-left"
                >
                  {/* Icon and Title - Horizontal Layout */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-[12px] bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <Icon className="w-8 h-8 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="text-base" style={{ fontWeight: 500 }}>{category.name}</h3>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Show All Button */}
          <div className="text-center">
            <button
              onClick={() => setCurrentPage('categories')}
              className="px-8 py-3 bg-primary/10 text-primary rounded-[12px] hover:bg-primary/20 transition-all duration-300 hover:shadow-sm"
              style={{ fontWeight: 500 }}
            >
              Show All Categories
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer 
        onNavigate={(page) => setCurrentPage(page)} 
        onContactClick={() => setContactFormOpen(true)}
      />

      {/* Contact Form Dialog */}
      <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
    </div>
  );
}