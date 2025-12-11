import { useState, useEffect } from "react";
import { 
  CheckCircle2, ExternalLink, Play, Check, X, AlertTriangle,
  MessageSquare, TrendingUp, Users, Code, Briefcase, GraduationCap,
  Calendar, Zap, Target, Shield, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Share2, User, ThumbsUp, ThumbsDown, Bookmark, Star,
  FileText, BarChart3, ClipboardCheck, Image, DollarSign, GitBranch, UserPen
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import scoreCircleImage from "figma:asset/67b6c73de8e1997623725fa846795c1379c1cd74.png";
import { ScoreCircle } from "./ScoreCircle";
import { StarRating } from "./StarRating";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ContactForm } from "./ContactForm";
import { useSavedTools } from "../hooks/useSavedTools";
import { Footer } from "./Footer";
import { SentimentPopup } from "./SentimentPopup";
import { Navigation } from "./Navigation";

interface ToolPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onCategoryClick?: (categoryId: string, categoryName: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function ToolPage({ onBack, onNavigate, onCategoryClick, isDarkMode = false, onToggleDarkMode = () => {} }: ToolPageProps) {
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const [prosConsExpanded, setProsConsExpanded] = useState(false);
  const [currentAlternativeIndex, setCurrentAlternativeIndex] = useState(0);
  const [scoresDialogOpen, setScoresDialogOpen] = useState(false);
  const [detailedScoresOpen, setDetailedScoresOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [pricingCarouselIndex, setPricingCarouselIndex] = useState(0);
  const [demosCarouselIndex, setDemosCarouselIndex] = useState(0);
  const [prosConsCarouselIndex, setProsConsCarouselIndex] = useState(0);
  const [reviewsCarouselIndex, setReviewsCarouselIndex] = useState(0);
  const [sentimentPopupOpen, setSentimentPopupOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'X' | 'Reddit' | 'YouTube'>('X');
  const [selectedScore, setSelectedScore] = useState(8.9);
  const { savedTools, toggleSaveTool, isSaved } = useSavedTools();
  const [comments, setComments] = useState([
    {
      id: 1,
      user: {
        name: 'Sarah Chen',
        avatar: 'SC',
        initials: 'SC'
      },
      rating: 5,
      comment: 'ChatGPT has completely transformed how I work. The responses are incredibly accurate and helpful. I use it daily for writing, brainstorming, and problem-solving. Highly recommend!',
      date: '2 days ago',
      thumbsUp: 24,
      thumbsDown: 2
    },
    {
      id: 2,
      user: {
        name: 'Michael Rodriguez',
        avatar: 'MR',
        initials: 'MR'
      },
      rating: 4,
      comment: 'Great tool overall. The free version is solid, but the paid version with GPT-4 is definitely worth it if you use it frequently. Would love to see better handling of very long conversations.',
      date: '1 week ago',
      thumbsUp: 18,
      thumbsDown: 3
    },
    {
      id: 3,
      user: {
        name: 'Emma Thompson',
        avatar: 'ET',
        initials: 'ET'
      },
      rating: 5,
      comment: 'As a developer, ChatGPT has been invaluable for debugging and learning new frameworks. The code it generates is usually spot-on and well-explained.',
      date: '2 weeks ago',
      thumbsUp: 31,
      thumbsDown: 1
    }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Scroll spy for active section
    const handleScroll = () => {
      const sections = ['overview', 'traction', 'features-pros', 'editor', 'verification', 'sentiment', 'demos', 'pricing', 'alternatives'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        if (section === 'features-pros') {
          // Check both features and proscons sections for this nav item
          const featuresElement = document.getElementById('features');
          const prosconsElement = document.getElementById('proscons');
          if (featuresElement && prosconsElement) {
            const offsetTop = featuresElement.offsetTop;
            const offsetBottom = prosconsElement.offsetTop + prosconsElement.offsetHeight;
            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
              setActiveSection('features-pros');
              break;
            }
          }
        } else {
          const element = document.getElementById(section);
          if (element) {
            const offsetTop = element.offsetTop;
            const offsetBottom = offsetTop + element.offsetHeight;

            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Smooth scroll handler for navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const trafficData = [
    { month: "Jul", visits: 245000 },
    { month: "Aug", visits: 312000 },
    { month: "Sep", visits: 385000 },
    { month: "Oct", visits: 421000 },
    { month: "Nov", visits: 498000 },
    { month: "Dec", visits: 567000 },
  ];

  const features = [
    { name: "Real-time collaboration", status: "verified" },
    { name: "AI-powered suggestions", status: "verified" },
    { name: "Unlimited storage", status: "partial" },
    { name: "Advanced analytics", status: "verified" },
    { name: "99.9% uptime guarantee", status: "failed" },
    { name: "24/7 customer support", status: "verified" },
    { name: "Custom integrations", status: "verified" },
    { name: "Mobile app", status: "partial" },
  ];

  const alternatives = [
    {
      name: "Notion AI",
      description: "All-in-one collaborative workspace that combines notes, databases, and project management with built-in AI assistance for writing and organizing.",
      bestFor: "Teams wanting unified workspace",
      score: 8.2,
      pricing: "Subscription",
      image: "https://images.unsplash.com/photo-1652177216993-5b17051b3554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc3BhY2UlMjBwcm9kdWN0aXZpdHl8ZW58MXx8fHwxNzY0MDY2Nzg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      pros: ["Unified workspace with AI", "Real-time collaboration", "Custom databases & views"],
    },
    {
      name: "Jasper",
      description: "Marketing-focused AI writing assistant that specializes in creating brand-aligned content with templates optimized for copywriters and content teams.",
      bestFor: "Content marketers & copywriters",
      score: 7.9,
      pricing: "Subscription",
      image: "https://images.unsplash.com/photo-1642437832852-4f6192df4548?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3cml0aW5nJTIwZGVzayUyMG1pbmltYWx8ZW58MXx8fHwxNzY0MDQwNzI1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      pros: ["50+ marketing templates", "Brand voice customization", "SEO optimization tools"],
    },
    {
      name: "Copy.ai",
      description: "Fast and efficient AI content generation tool designed for creating marketing copy, social posts, and blog content at scale across multiple languages.",
      bestFor: "Fast content creation at scale",
      score: 7.5,
      pricing: "Freemium",
      image: "https://images.unsplash.com/photo-1761045736883-57e953e0c5e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHRvb2xzfGVufDF8fHx8MTc2NDAwMDEyOHww&ixlib=rb-4.1.0&q=80&w=1080",
      pros: ["Lightning-fast generation", "90+ languages supported", "Bulk content creation"],
    },
    {
      name: "Claude",
      description: "Advanced AI assistant by Anthropic",
      bestFor: "Complex reasoning and analysis",
      score: 8.8,
      pricing: "Freemium",
      image: "https://images.unsplash.com/photo-1652177216993-5b17051b3554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc3BhY2UlMjBwcm9kdWN0aXZpdHl8ZW58MXx8fHwxNzY0MDY2Nzg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      pros: ["Long context", "Strong reasoning"],
    },
    {
      name: "Perplexity",
      description: "AI-powered search and research",
      bestFor: "Real-time information needs",
      score: 8.1,
      pricing: "Freemium",
      image: "https://images.unsplash.com/photo-1642437832852-4f6192df4548?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3cml0aW5nJTIwZGVzayUyMG1pbmltYWx8ZW58MXx8fHwxNzY0MDQwNzI1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      pros: ["Real-time search", "Citations"],
    },
  ];

  const techSpecs = [
    { label: "API Access", value: "Yes (REST & GraphQL)" },
    { label: "Integrations", value: "Slack, Teams, Zapier, 50+" },
    { label: "Model Type", value: "GPT-4 based, fine-tuned" },
    { label: "Output Formats", value: "Text, Markdown, HTML, PDF" },
    { label: "Max Input Length", value: "25,000 words" },
    { label: "Supported Platforms", value: "Web, iOS, Android, Desktop" },
    { label: "Data Storage", value: "US & EU regions" },
    { label: "SSO Support", value: "Google, Microsoft, Okta" },
  ];

  const pros = [
    "Incredibly natural and context-aware conversations",
    "Versatile across many use cases and industries",
    "Free tier is genuinely useful for most users",
    "Regular updates and improvements",
    "Clean, intuitive interface",
    "Strong API and developer tools",
    "Excellent documentation and support",
  ];

  const cons = [
    "Can occasionally provide inaccurate information",
    "Knowledge cutoff means it's not aware of recent events",
    "Free tier can be slow during peak hours",
    "Premium pricing may be steep for individual users",
    "Limited customization options",
    "Some privacy concerns with data handling",
  ];

  const displayedFeatures = featuresExpanded ? features : features.slice(0, 4);
  const displayedPros = prosConsExpanded ? pros : pros.slice(0, 5);
  const displayedCons = prosConsExpanded ? cons : cons.slice(0, 4);

  const nextAlternative = () => {
    setCurrentAlternativeIndex((prev) => (prev + 1) % alternatives.length);
  };

  const prevAlternative = () => {
    setCurrentAlternativeIndex((prev) => (prev - 1 + alternatives.length) % alternatives.length);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation 
        onBack={onBack}
        onNavigate={(page) => {
          if (page === 'contact') {
            setContactFormOpen(true);
          } else if (page === 'home') {
            onBack();
          } else {
            onNavigate(page);
          }
        }}
        onLogoClick={onBack}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        showBackButton={false}
      />

      <div className="flex max-w-[1400px] mx-auto px-4 md:px-8 gap-5">
        {/* Main Content */}
        <div className="flex-1 max-w-[1200px] min-w-0">
          {/* Hero Section with enhanced background */}
          <section className="pb-6">
            <div 
              className="rounded-[24px] p-8 shadow-sm relative overflow-hidden border border-border/50 bg-card"
            >
              {/* Bookmark button - positioned in top right */}
              <motion.button
                onClick={() => toggleSaveTool({
                  name: 'ChatGPT',
                  description: 'Advanced conversational AI that understands context and generates human-like responses for any task.',
                  score: 8.7,
                  pricing: 'Freemium',
                  logo: pinpointLogo
                })}
                className={`absolute top-6 right-6 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md border-2 ${
                  isSaved('ChatGPT')
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-card border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={isSaved('ChatGPT') ? 'Remove from saved' : 'Save tool'}
              >
                <Bookmark
                  className="w-5 h-5 transition-all"
                  strokeWidth={isSaved('ChatGPT') ? 0 : 2}
                  fill={isSaved('ChatGPT') ? 'currentColor' : 'none'}
                />
              </motion.button>
              
              {/* Mobile Layout */}
              <div className="relative z-10 flex md:hidden flex-col items-center text-center space-y-3">
                {/* Logo */}
                <div className="flex items-center justify-center mt-2">
                  <motion.a
                    href="https://chat.openai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center cursor-pointer group"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={pinpointLogo} alt="ChatGPT" className="w-16 h-16 group-hover:scale-110 transition-transform" />
                  </motion.a>
                </div>

                {/* Title with Verified Check */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl tracking-tight" style={{ fontWeight: 700 }}>ChatGPT</h1>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    </motion.div>
                  </div>
                  <p className="text-base text-muted-foreground" style={{ fontWeight: 500 }}>OpenAI Inc.</p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed text-[16px]">
                  Advanced conversational AI that understands context and generates human-like responses for any task.
                </p>

                {/* Meta badges */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button 
                    onClick={() => onCategoryClick?.('core-models', 'Core Models')}
                    className="px-3 py-1.5 rounded-full text-sm text-muted-foreground border border-primary/30 bg-transparent hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    Core Models
                  </button>
                  <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">
                    Freemium
                  </span>
                </div>

                {/* Pinpoint Score at Bottom */}
                <motion.div 
                  className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-card rounded-[20px] p-3 border-2 border-primary/30 shadow-lg cursor-pointer relative overflow-hidden"
                  onClick={() => setDetailedScoresOpen(true)}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Badge seal background */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                  
                  <div className="relative flex items-center justify-between">
                    {/* Left side - PINPOINT Score label */}
                    <div className="flex items-center gap-2 ml-3">
                      <Shield className="w-4 h-4 text-primary" strokeWidth={2.5} />
                      <span className="text-sm" style={{ fontWeight: 700, color: "#6E7E55" }}>PINPOINT SCORE</span>
                    </div>
                    
                    {/* Right side - Score Circle */}
                    <div className="flex-shrink-0">
                      <ScoreCircle score={8.7} size={64} strokeWidth={6} textSize="text-lg" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Desktop Layout */}
              <div className="relative z-10 hidden md:block">
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {/* Logo with badge underneath */}
                  <div className="flex flex-col items-center gap-3">
                    <motion.button
                      onClick={() => onCategoryClick?.('core-models', 'Core Models')}
                      className="w-32 h-32 rounded-[20px] bg-card shadow-md flex items-center justify-center flex-shrink-0 cursor-pointer group border-2 border-transparent hover:border-primary/40 transition-all"
                      whileHover={{ scale: 1.08, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)" }}
                      transition={{ duration: 0.3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img src={pinpointLogo} alt="Example Tool" className="w-16 h-16 group-hover:scale-110 transition-transform" />
                    </motion.button>
                    <motion.button 
                      onClick={() => onCategoryClick?.('core-models', 'Core Models')}
                      className="relative px-4 py-1.5 rounded-full text-center whitespace-nowrap border-2 bg-transparent hover:bg-[#b3623f]/5 transition-all cursor-pointer"
                      style={{ borderColor: '#b3623f' }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative text-xs" style={{ fontWeight: 700, color: '#b3623f' }}>#1 in Core Models</span>
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                      {/* Title with badges */}
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                          <h1 className="text-4xl tracking-tight" style={{ fontWeight: 700 }}>ChatGPT</h1>
                          <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>OpenAI Inc.</p>
                        </div>
                        <motion.div 
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary/15 rounded-full mt-1"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary" strokeWidth={2.5} />
                          <span className="text-sm" style={{ fontWeight: 600 }}>Verified by Humans</span>
                        </motion.div>
                      </div>

                      {/* Tagline */}
                      <p className="text-lg text-muted-foreground max-w-3xl" style={{ lineHeight: 1.6 }}>
                        Advanced conversational AI that understands context and generates human-like responses for any task.
                      </p>

                      {/* Meta badges */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <button 
                          onClick={() => onCategoryClick?.('core-models', 'Core Models')}
                          className="px-3 py-1.5 rounded-full text-sm text-muted-foreground border border-primary/30 bg-transparent hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                        >
                          Core Models
                        </button>
                        <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">
                          Freemium
                        </span>
                        <span className="px-5 py-2 bg-primary/10 text-primary rounded-full text-sm hidden" style={{ fontWeight: 600 }}>
                          Score: 8.7/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cozy Summary Block */}
          <section id="overview" className="py-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <FileText className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>What is ChatGPT?</h2>
              </div>
              
              {/* Detailed paragraphs */}
              <div className="space-y-4 text-base text-foreground/85" style={{ lineHeight: 1.8 }}>
                <p>
                  Unlike traditional chatbots that follow scripts, ChatGPT understands context, remembers your conversation 
                  history, and adapts its responses based on your needs. It can switch between formal and casual tones, 
                  explain complex topics simply, or dive deep into technical details.
                </p>
                <p>
                  From drafting emails to debugging code, writing essays to brainstorming business ideas, ChatGPT has 
                  become an essential productivity tool for millions. The free tier uses GPT-3.5, while paid subscribers 
                  get access to GPT-4 with enhanced reasoning and creativity.
                </p>
              </div>

              {/* Key highlights */}
              <div className="pt-3 grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-card rounded-[12px] border border-border/30">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600 }}>Natural Conversations</p>
                    <p className="text-sm text-muted-foreground mt-1">Human-like responses that feel authentic</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-card rounded-[12px] border border-border/30">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600 }}>Context Memory</p>
                    <p className="text-sm text-muted-foreground mt-1">Remembers your entire conversation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-card rounded-[12px] border border-border/30">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600 }}>Regular Updates</p>
                    <p className="text-sm text-muted-foreground mt-1">Constantly learning and improving</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-card rounded-[12px] border border-border/30">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600 }}>Versatile Use Cases</p>
                    <p className="text-sm text-muted-foreground mt-1">Writing, coding, research, and more</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Traffic & Traction Charts */}
          <section id="traction" className="py-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>Traffic & Growth</h2>
              </div>
              <div className="bg-card rounded-[20px] p-6 shadow-sm border border-border/50">
                <h3 className="text-lg mb-6 text-muted-foreground" style={{ fontWeight: 500 }}>
                  6-Month Traffic Growth
                </h3>
                {/* Desktop chart */}
                <ResponsiveContainer width="100%" height={300} className="hidden md:block">
                  <LineChart data={trafficData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDark ? "rgba(175,193,161,0.2)" : "rgba(110, 126, 85, 0.15)"} 
                    />
                    <XAxis 
                      dataKey="month" 
                      stroke={isDark ? "#B5AFA9" : "#8A847F"}
                      style={{ fontSize: '14px' }}
                    />
                    <YAxis 
                      stroke={isDark ? "#B5AFA9" : "#8A847F"}
                      style={{ fontSize: '14px' }}
                      tickFormatter={(value) => `${(value / 1000)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#34302C' : '#FDFCFA', 
                        border: isDark ? '1px solid rgba(175, 193, 161, 0.2)' : '1px solid rgba(110, 126, 85, 0.15)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: isDark ? '#F5F2EB' : '#3D3834'
                      }}
                      labelStyle={{ color: isDark ? '#F5F2EB' : '#3D3834' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke={isDark ? "#AFC1A1" : "#6E7E55"} 
                      strokeWidth={3}
                      dot={{ fill: isDark ? "#AFC1A1" : "#6E7E55", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {/* Mobile chart - 30% shorter */}
                <ResponsiveContainer width="100%" height={210} className="md:hidden">
                  <LineChart data={trafficData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDark ? "rgba(175,193,161,0.2)" : "rgba(110, 126, 85, 0.15)"} 
                    />
                    <XAxis 
                      dataKey="month" 
                      stroke={isDark ? "#B5AFA9" : "#8A847F"}
                      style={{ fontSize: '14px' }}
                    />
                    <YAxis 
                      stroke={isDark ? "#B5AFA9" : "#8A847F"}
                      style={{ fontSize: '14px' }}
                      tickFormatter={(value) => `${(value / 1000)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#34302C' : '#FDFCFA', 
                        border: isDark ? '1px solid rgba(175, 193, 161, 0.2)' : '1px solid rgba(110, 126, 85, 0.15)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: isDark ? '#F5F2EB' : '#3D3834'
                      }}
                      labelStyle={{ color: isDark ? '#F5F2EB' : '#3D3834' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke={isDark ? "#AFC1A1" : "#6E7E55"} 
                      strokeWidth={3}
                      dot={{ fill: isDark ? "#AFC1A1" : "#6E7E55", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Strong upward trend showing 131% growth over 6 months
                </p>
              </div>
            </div>
          </section>

          {/* Feature Checklist with larger icons and color coding */}
          <section id="features" className="py-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>
                  Feature Verification
                </h2>
              </div>
              <div className="bg-card rounded-[20px] p-6 shadow-sm border border-border/50">
                <div className="grid grid-cols-1 gap-1.5">
                  {displayedFeatures.map((feature) => (
                    <motion.div 
                      key={feature.name} 
                      className="flex items-center gap-4 p-2.5 rounded-[12px] bg-secondary/20"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feature.status === "verified" ? "bg-[#6E7E55]" : 
                        feature.status === "partial" ? "bg-[#D4A574]" : 
                        "bg-[#C46A4A]"
                      }`}>
                        {feature.status === "verified" && (
                          <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                        )}
                        {feature.status === "partial" && (
                          <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2.5} />
                        )}
                        {feature.status === "failed" && (
                          <X className="w-4 h-4 text-white" strokeWidth={2.5} />
                        )}
                      </div>
                      <span className="text-foreground/90">{feature.name}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setFeaturesExpanded(!featuresExpanded)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary/50 hover:bg-secondary/70 rounded-full transition-colors"
                  >
                    <span className="text-sm" style={{ fontWeight: 500 }}>
                      {featuresExpanded ? "Show Less" : "Show All"}
                    </span>
                    {featuresExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Pros & Cons with divider and background tints */}
          <section id="proscons" className="py-6">
            {isMobile ? (
              <div className="space-y-4">
                <div className="overflow-hidden">
                  <motion.div 
                    className="flex pl-1"
                    animate={{ x: `calc(-${prosConsCarouselIndex} * 83.5vw)` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Pros Card */}
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        
                        if (swipe > 500 || offset.x > 100) {
                          setProsConsCarouselIndex((prev) => (prev === 0 ? 1 : prev - 1));
                        } else if (swipe < -500 || offset.x < -100) {
                          setProsConsCarouselIndex((prev) => (prev === 1 ? 0 : prev + 1));
                        }
                      }}
                      animate={{
                        scale: prosConsCarouselIndex === 0 ? 1 : 0.92,
                        opacity: prosConsCarouselIndex === 0 ? 1 : 0.3
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 w-[82.5vw] mr-[1vw]"
                    >
                      <div className="bg-card rounded-[20px] overflow-hidden shadow-sm border border-primary md:border-border/50 cursor-grab active:cursor-grabbing">
                        <div className="space-y-4 p-7 bg-primary/[0.03]">
                          <h2 className="text-6xl tracking-tight text-primary" style={{ fontWeight: 700 }}>
                            +
                          </h2>
                          <div className="space-y-4">
                            {displayedPros.map((pro, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>{pro}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Cons Card */}
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        
                        if (swipe > 500 || offset.x > 100) {
                          setProsConsCarouselIndex((prev) => (prev === 0 ? 1 : prev - 1));
                        } else if (swipe < -500 || offset.x < -100) {
                          setProsConsCarouselIndex((prev) => (prev === 1 ? 0 : prev + 1));
                        }
                      }}
                      animate={{
                        scale: prosConsCarouselIndex === 1 ? 1 : 0.92,
                        opacity: prosConsCarouselIndex === 1 ? 1 : 0.3
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 w-[82.5vw] mr-[1vw]"
                    >
                      <div className="bg-card rounded-[20px] overflow-hidden shadow-sm border border-primary md:border-border/50 cursor-grab active:cursor-grabbing">
                        <div className="space-y-4 p-7 bg-destructive/[0.03]">
                          <h2 className="text-6xl tracking-tight text-destructive" style={{ fontWeight: 700 }}>
                            -
                          </h2>
                          <div className="space-y-4">
                            {displayedCons.map((con, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-2" />
                                <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>{con}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Dots indicator */}
                <div className="flex justify-center gap-2">
                  {[0, 1].map((index) => (
                    <button
                      key={index}
                      onClick={() => setProsConsCarouselIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === prosConsCarouselIndex 
                          ? 'bg-primary w-6' 
                          : 'bg-border'
                      }`}
                    />
                  ))}
                </div>

                {/* Show All/Less Button */}
                <div className="text-center">
                  <button
                    onClick={() => setProsConsExpanded(!prosConsExpanded)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary/50 hover:bg-secondary/70 rounded-full transition-colors"
                  >
                    <span className="text-sm" style={{ fontWeight: 500 }}>
                      {prosConsExpanded ? "Show Less" : "Show All"}
                    </span>
                    {prosConsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-[20px] overflow-hidden shadow-sm border border-border/50">
                <div className="grid md:grid-cols-2 gap-0 relative">
                {/* Pros */}
                <motion.div 
                  className="space-y-4 p-7 bg-primary/[0.03]"
                  whileHover={{ backgroundColor: "rgba(110, 126, 85, 0.05)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-6xl tracking-tight text-primary" style={{ fontWeight: 700 }}>
                    +
                  </h2>
                  <div className="space-y-4">
                    {displayedPros.map((pro, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>{pro}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Cons */}
                <motion.div 
                  className="space-y-4 p-7 bg-destructive/[0.03]"
                  whileHover={{ backgroundColor: "rgba(196, 106, 74, 0.05)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-6xl tracking-tight text-destructive" style={{ fontWeight: 700 }}>
                    -
                  </h2>
                  <div className="space-y-4">
                    {displayedCons.map((con, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-2" />
                        <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>{con}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
              <div className="text-center py-6 border-t border-border/50">
                <button
                  onClick={() => setProsConsExpanded(!prosConsExpanded)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary/50 hover:bg-secondary/70 rounded-full transition-colors"
                >
                  <span className="text-sm" style={{ fontWeight: 500 }}>
                    {prosConsExpanded ? "Show Less" : "Show All"}
                  </span>
                  {prosConsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
            )}
          </section>

          {/* Editor's Notes */}
          <section id="editor" className="py-6">
            <div className="bg-secondary/40 rounded-[20px] p-7">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserPen className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>
                    Editor's Notes
                  </h2>
                </div>
                <div className="space-y-4 text-lg text-foreground/85" style={{ lineHeight: 1.8 }}>
                  <p>
                    After extensive testing, ChatGPT consistently impressed us with its ability to understand 
                    nuance and provide thoughtful, well-structured responses. The conversation flow feels 
                    remarkably natural, and it adapts well to different tones and contexts.
                  </p>
                  <p>
                    <span style={{ fontWeight: 600 }}>You'll love it if:</span> You're looking for a versatile 
                    AI assistant for writing, research, brainstorming, or learning. It's especially valuable 
                    for professionals who need quick, reliable assistance throughout their day.
                  </p>
                  <p>
                    <span style={{ fontWeight: 600 }}>It might not be for you if:</span> You need real-time 
                    information or specialized domain expertise that requires up-to-the-minute accuracy. 
                    Always fact-check critical information.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Verification History - MOVED UP FOR PROMINENCE */}
          <section id="verification" className="py-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Shield className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>
                  Verification History
                </h2>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-[20px] p-7 border-2 border-primary/20 shadow-sm">
                <div className="relative">
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-primary/30\" />
                  <div className="space-y-5">
                    <motion.div 
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 mt-1 relative z-10 ring-4 ring-primary/20" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm text-muted-foreground">November 15, 2025</p>
                          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs" style={{ fontWeight: 600 }}>
                            Latest
                          </span>
                        </div>
                        <p className="mt-2" style={{ fontWeight: 600, fontSize: '1.05rem' }}>Full reverification completed</p>
                        <p className="text-sm text-foreground/80 mt-2" style={{ lineHeight: 1.7 }}>
                          All features, pricing, and performance metrics verified by our team. Score updated to reflect current capabilities.
                        </p>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/60 flex-shrink-0 mt-1 relative z-10 ring-4 ring-primary/10" />
                      <div>
                        <p className="text-sm text-muted-foreground">August 22, 2025</p>
                        <p className="mt-2" style={{ fontWeight: 600 }}>Major update verification</p>
                        <p className="text-sm text-foreground/80 mt-2" style={{ lineHeight: 1.7 }}>
                          New features and pricing changes reviewed and documented
                        </p>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/40 flex-shrink-0 mt-1 relative z-10 ring-4 ring-primary/5" />
                      <div>
                        <p className="text-sm text-muted-foreground">May 10, 2025</p>
                        <p className="mt-2" style={{ fontWeight: 600 }}>Initial verification</p>
                        <p className="text-sm text-foreground/80 mt-2" style={{ lineHeight: 1.7 }}>
                          Tool added to Pinpoint database with full feature audit
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sentiment Analysis with platform icons */}
          <section id="sentiment" className="py-6">
            <div className="bg-secondary/30 rounded-[20px] p-7">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>
                  Community Sentiment
                </h2>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-5">
                <motion.div 
                  className="flex flex-col items-center gap-2 md:gap-4 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => {
                    setSelectedPlatform('X');
                    setSelectedScore(8.9);
                    setSentimentPopupOpen(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-card shadow-sm flex items-center justify-center relative hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <motion.div 
                        className="text-2xl md:text-3xl" 
                        style={{ fontWeight: 600, color: "#6E7E55" }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        8.9
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <svg className="w-3 h-3 md:w-4 md:h-4 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex flex-col items-center gap-2 md:gap-4 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    setSelectedPlatform('Reddit');
                    setSelectedScore(8.4);
                    setSentimentPopupOpen(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-card shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <motion.div 
                        className="text-2xl md:text-3xl" 
                        style={{ fontWeight: 600, color: "#6E7E55" }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        8.4
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <svg className="w-3 h-3 md:w-4 md:h-4 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                    </svg>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex flex-col items-center gap-2 md:gap-4 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => {
                    setSelectedPlatform('YouTube');
                    setSelectedScore(9.1);
                    setSentimentPopupOpen(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-card shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <motion.div 
                        className="text-2xl md:text-3xl" 
                        style={{ fontWeight: 600, color: "#6E7E55" }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                      >
                        9.1
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <svg className="w-3 h-3 md:w-4 md:h-4 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Screenshots & Demo */}
          <section id="demos" className="py-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Image className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>
                  Demos
                </h2>
              </div>
              
              {/* Mobile Carousel */}
              {isMobile ? (
                <div className="space-y-4">
                  <div className="overflow-hidden">
                    <motion.div 
                      className="flex pl-1"
                      animate={{ x: `calc(-${demosCarouselIndex} * 83.5vw)` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {[
                        {
                          src: "https://images.unsplash.com/photo-1717323454555-f053c31ff4b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmZhY2UlMjBkZXNpZ258ZW58MXx8fHwxNzYzNDQ2ODE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
                          alt: "ChatGPT Interface",
                          caption: "Clean, intuitive chat interface with conversation history"
                        },
                        {
                          src: "https://images.unsplash.com/photo-1730206562928-0efd62560435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHRvb2xzfGVufDF8fHx8MTc2MzQwNzQ4M3ww&ixlib=rb-4.1.0&q=80&w=1080",
                          alt: "ChatGPT Features",
                          caption: "Advanced features including plugins and code interpreter"
                        },
                        {
                          src: "https://images.unsplash.com/photo-1763107228544-2ad5d71c21f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwcHJvZHVjdGl2aXR5JTIwYXBwfGVufDF8fHx8MTc2MzQ5MDgyNnww&ixlib=rb-4.1.0&q=80&w=1080",
                          alt: "ChatGPT in Action",
                          caption: "Real-time collaboration workflow showing multi-turn conversations"
                        }
                      ].map((demo, index) => {
                        const isActive = index === demosCarouselIndex;
                        return (
                          <motion.div
                            key={demo.alt}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, { offset, velocity }) => {
                              const swipe = Math.abs(offset.x) * velocity.x;
                              
                              if (swipe > 500 || offset.x > 100) {
                                setDemosCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
                              } else if (swipe < -500 || offset.x < -100) {
                                setDemosCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));
                              }
                            }}
                            animate={{
                              scale: isActive ? 1 : 0.92,
                              opacity: isActive ? 1 : 0.3
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0 w-[82.5vw] mr-[1vw]"
                          >
                            <div className="space-y-3 cursor-grab active:cursor-grabbing">
                              <div className="rounded-[20px] overflow-hidden shadow-md border border-primary md:border-border/50 aspect-video bg-muted">
                                <ImageWithFallback
                                  src={demo.src}
                                  alt={demo.alt}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-sm text-muted-foreground text-center" style={{ fontWeight: 500 }}>
                                {demo.caption}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* Dots indicator */}
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => setDemosCarouselIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === demosCarouselIndex 
                            ? 'bg-primary w-6' 
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <motion.div 
                    className="rounded-[20px] overflow-hidden shadow-md border border-border/50 aspect-video bg-muted"
                    whileHover={{ scale: 1.02, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1717323454555-f053c31ff4b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmZhY2UlMjBkZXNpZ258ZW58MXx8fHwxNzYzNDQ2ODE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="ChatGPT Interface"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <p className="text-sm text-muted-foreground text-center" style={{ fontWeight: 500 }}>
                    Clean, intuitive chat interface with conversation history
                  </p>
                </div>
                <div className="space-y-3">
                  <motion.div 
                    className="rounded-[20px] overflow-hidden shadow-md border border-border/50 aspect-video bg-muted"
                    whileHover={{ scale: 1.02, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1730206562928-0efd62560435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHRvb2xzfGVufDF8fHx8MTc2MzQwNzQ4M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="ChatGPT Features"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <p className="text-sm text-muted-foreground text-center" style={{ fontWeight: 500 }}>
                    Advanced features including plugins and code interpreter
                  </p>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <motion.div 
                    className="rounded-[20px] overflow-hidden shadow-md border border-border/50 aspect-video bg-muted"
                    whileHover={{ scale: 1.01, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1763107228544-2ad5d71c21f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwcHJvZHVjdGl2aXR5JTIwYXBwfGVufDF8fHx8MTc2MzQ5MDgyNnww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="ChatGPT in Action"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <p className="text-sm text-muted-foreground text-center" style={{ fontWeight: 500 }}>
                    Real-time collaboration workflow showing multi-turn conversations
                  </p>
                </div>
              </div>
              )}
            </div>
          </section>

          {/* Pricing Breakdown with improved badge */}
          <section id="pricing" className="py-8">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>
                  Pricing
                </h2>
              </div>
              
              {/* Mobile Carousel for Pricing */}
              {isMobile ? (
                <div className="space-y-4">
                  <div className="overflow-hidden">
                    {(() => {
                      const pricingTiers = [
                            {
                              name: "Free",
                              price: "$0",
                              period: "Forever free",
                              features: [
                                "Access to GPT-3.5",
                                "Standard response speed",
                                "Basic features"
                              ],
                              valueRating: "Excellent"
                            },
                            {
                              name: "Plus",
                              price: "$20",
                              period: "Per month",
                              features: [
                                "Access to GPT-4",
                                "Faster response times",
                                "Priority access during peak times",
                                "Advanced features & plugins"
                              ],
                              valueRating: "Very Good"
                            },
                            {
                              name: "Enterprise",
                              price: "Custom",
                              period: "Contact sales",
                              features: [
                                "Unlimited usage",
                                "Advanced security & compliance",
                                "Dedicated support",
                                "Custom integrations"
                              ],
                              valueRating: "Fair"
                            }
                          ];
                          
                          return (
                            <motion.div 
                              className="flex pl-1"
                              animate={{ x: `calc(-${pricingCarouselIndex} * 83.5vw)` }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                              {pricingTiers.map((tier, index) => {
                                const isActive = index === pricingCarouselIndex;
                                return (
                                  <motion.div
                                    key={tier.name}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset, velocity }) => {
                                      const swipe = Math.abs(offset.x) * velocity.x;
                                      
                                      if (swipe > 500 || offset.x > 100) {
                                        setPricingCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
                                      } else if (swipe < -500 || offset.x < -100) {
                                        setPricingCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));
                                      }
                                    }}
                                    animate={{
                                      scale: isActive ? 1 : 0.92,
                                      opacity: isActive ? 1 : 0.3
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-shrink-0 w-[82.5vw] mr-[1vw]"
                                  >
                            <div className="bg-card rounded-[20px] p-6 border border-primary md:border-border/50 space-y-4 cursor-grab active:cursor-grabbing">
                              <div>
                                <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>{tier.name}</h3>
                                <div className="text-4xl" style={{ fontWeight: 600, color: "#6E7E55" }}>{tier.price}</div>
                                <p className="text-sm text-muted-foreground mt-2">{tier.period}</p>
                              </div>
                              <div className="space-y-2.5">
                                {tier.features.map((feature, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                                    <span className="text-sm">{feature}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-3">
                                <div className="text-sm text-muted-foreground">Value Rating</div>
                                <div className="text-lg" style={{ fontWeight: 600, color: "#6E7E55" }}>{tier.valueRating}</div>
                              </div>
                            </div>
                                </motion.div>
                              )})}

                            </motion.div>
                          );
                        })()}
                  </div>
                  
                  {/* Dot indicators */}
                  <div className="flex items-center justify-center gap-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => setPricingCarouselIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === pricingCarouselIndex 
                            ? 'w-8 bg-primary' 
                            : 'w-2 bg-primary/30'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Desktop Grid for Pricing */
                <div className="grid md:grid-cols-3 gap-4">
                <motion.div 
                  className="bg-card rounded-[20px] p-6 border border-border/50 space-y-4"
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>Free</h3>
                    <div className="text-4xl" style={{ fontWeight: 600, color: "#6E7E55" }}>$0</div>
                    <p className="text-sm text-muted-foreground mt-2">Forever free</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Access to GPT-3.5</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Standard response speed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Basic features</span>
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="text-sm text-muted-foreground">Value Rating</div>
                    <div className="text-lg" style={{ fontWeight: 600, color: "#6E7E55" }}>Excellent</div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-card rounded-[20px] p-6 border border-border/50 space-y-4"
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>Plus</h3>
                    <div className="text-4xl" style={{ fontWeight: 600, color: "#6E7E55" }}>$20</div>
                    <p className="text-sm text-muted-foreground mt-2">Per month</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Access to GPT-4</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Faster response times</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Priority access during peak times</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Advanced features & plugins</span>
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="text-sm text-muted-foreground">Value Rating</div>
                    <div className="text-lg" style={{ fontWeight: 600, color: "#6E7E55" }}>Very Good</div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-card rounded-[20px] p-6 border border-border/50 space-y-4"
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <h3 className="text-2xl mb-2" style={{ fontWeight: 600 }}>Enterprise</h3>
                    <div className="text-4xl" style={{ fontWeight: 600, color: "#6E7E55" }}>Custom</div>
                    <p className="text-sm text-muted-foreground mt-2">Contact sales</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Unlimited usage</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Advanced security & compliance</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Dedicated support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" strokeWidth={2} />
                      <span className="text-sm">Custom integrations</span>
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="text-sm text-muted-foreground">Value Rating</div>
                    <div className="text-lg" style={{ fontWeight: 600, color: "#6E7E55" }}>Fair</div>
                  </div>
                </motion.div>
              </div>
              )}
              
              <div className="text-center pt-2">
                <p className="text-muted-foreground">
                  <span style={{ fontWeight: 500 }}>Pricing Fairness Score: 7.8/10</span> — 
                  Competitive pricing with a genuinely useful free tier
                </p>
              </div>
            </div>
          </section>

          {/* Recommended Alternatives - Completely Redesigned */}
          <section className="py-6" id="alternatives">
            <div className="space-y-5">
              <div className="text-center space-y-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>
                    Alternatives
                  </h2>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Similar tools worth considering, each with unique strengths
                </p>
              </div>
              
              {/* Mobile Carousel */}
              {isMobile ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden">
                    <motion.div 
                      className="flex pl-1"
                      animate={{ x: `calc(-${carouselIndex} * 83.5vw)` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {alternatives.slice(0, 3).map((alt, index) => {
                        const isActive = index === carouselIndex;
                        return (
                          <motion.div
                            key={alt.name}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, { offset, velocity }) => {
                              const swipe = Math.abs(offset.x) * velocity.x;
                              
                              if (swipe > 500 || offset.x > 100) {
                                setCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
                              } else if (swipe < -500 || offset.x < -100) {
                                setCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));
                              }
                            }}
                            animate={{
                              scale: isActive ? 1 : 0.92,
                              opacity: isActive ? 1 : 0.3
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0 w-[82.5vw] mr-[1vw]"
                          >
                            <div className="bg-card rounded-[20px] overflow-hidden border border-primary md:border-border/50 md:hover:border-primary/30 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group">
                              {/* Image */}
                              <div className="aspect-video overflow-hidden bg-muted">
                                <ImageWithFallback
                                  src={alt.image}
                                  alt={alt.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>

                              {/* Content */}
                              <div className="p-6 space-y-4">
                                {/* Header with circular score */}
                                <div className="flex items-center justify-between gap-4">
                                  <h3 className="text-xl" style={{ fontWeight: 600 }}>{alt.name}</h3>
                                  <div className="flex-shrink-0">
                                    <ScoreCircle score={alt.score} size={52} strokeWidth={5} textSize="text-base" />
                                  </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-foreground/80" style={{ lineHeight: 1.6 }}>
                                  {alt.description}
                                </p>

                                {/* Top 3 Features */}
                                <div className="space-y-2">
                                  {alt.pros.map((pro) => (
                                    <div key={pro} className="flex items-center gap-2">
                                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2.5} />
                                      <span className="text-xs text-foreground/70">{pro}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Footer with pricing only */}
                                <div className="pt-4 border-t border-border/30">
                                  <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">
                                    {alt.pricing}
                                  </span>
                                </div>
                              </div>
                            </div>
                        </motion.div>
                      )})}

                    </motion.div>
                  </div>
                  
                  {/* Dot indicators */}
                  <div className="flex items-center justify-center gap-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => setCarouselIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === carouselIndex 
                            ? 'w-8 bg-primary' 
                            : 'w-2 bg-primary/30'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Desktop Grid */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alternatives.slice(0, 3).map((alt, index) => (
                    <motion.div
                      key={alt.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-[20px] overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      {/* Image */}
                      <div className="aspect-video overflow-hidden bg-muted">
                        <ImageWithFallback
                          src={alt.image}
                          alt={alt.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Header with circular score */}
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-xl" style={{ fontWeight: 600 }}>{alt.name}</h3>
                          <div className="flex-shrink-0">
                            <ScoreCircle score={alt.score} size={52} strokeWidth={5} textSize="text-base" />
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-foreground/80" style={{ lineHeight: 1.6 }}>
                          {alt.description}
                        </p>

                        {/* Top 3 Features */}
                        <div className="space-y-2">
                          {alt.pros.map((pro) => (
                            <div key={pro} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2.5} />
                              <span className="text-xs text-foreground/70">{pro}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer with pricing only */}
                        <div className="pt-4 border-t border-border/30">
                          <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">
                            {alt.pricing}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Comments & Reviews Section */}
          <section className="py-6" id="comments">
            <div className="space-y-6">
              {/* Section Header */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-7 h-7 text-primary" strokeWidth={1.5} />
                    <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>
                      Community Reviews
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-[24px] border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= 5 
                                ? 'fill-[#7a8a62] text-[#7a8a62]' 
                                : 'fill-none text-muted-foreground/30'
                            }`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <span className="text-4xl" style={{ fontWeight: 700, color: "#6E7E55" }}>4.7</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({comments.length} reviews)</span>
                  </div>
                </motion.div>
              </div>

              {/* Add Comment Form */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-[28px] p-6 md:p-7 mb-6 bg-gradient-to-br from-card via-card to-secondary/20 border-2 border-border/30 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-2xl mb-5" style={{ fontWeight: 700 }}>Share Your Experience</h3>
                
                <div className="space-y-5">
                  {/* Rating Input */}
                  <div className="space-y-2">
                    <label className="block text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                      How would you rate this tool?
                    </label>
                    <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-[16px] w-fit">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-7 h-7 ${
                              star <= userRating 
                                ? 'fill-[#7a8a62] text-[#7a8a62]' 
                                : 'fill-none text-muted-foreground/30'
                            } cursor-pointer hover:scale-110 transition-transform`}
                            strokeWidth={1.5}
                            onClick={() => setUserRating(star)}
                          />
                        ))}
                      </div>
                      {userRating > 0 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-2xl"
                          style={{ fontWeight: 700, color: "#6E7E55" }}
                        >
                          {userRating}.0
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-2">
                    <label htmlFor="comment" className="block text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                      Tell us about your experience
                    </label>
                    <textarea
                      id="comment"
                      rows={5}
                      className="w-full px-4 py-4 md:px-5 md:py-4 bg-background rounded-[20px] border-2 border-border/50 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none text-base"
                      placeholder="What do you love about this tool? What could be improved?"
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      style={{ lineHeight: 1.7 }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end -mt-2.5">
                    <motion.button
                      onClick={() => {
                        if (userRating > 0 && userComment.trim()) {
                          const newComment = {
                            id: comments.length + 1,
                            user: {
                              name: 'You',
                              avatar: 'Y',
                              initials: 'Y'
                            },
                            rating: userRating,
                            comment: userComment,
                            date: 'Just now',
                            thumbsUp: 0,
                            thumbsDown: 0
                          };
                          setComments([newComment, ...comments]);
                          setUserRating(0);
                          setUserComment('');
                        }
                      }}
                      disabled={userRating === 0 || !userComment.trim()}
                      className={`px-8 py-3 rounded-full flex items-center gap-2 transition-all text-base shadow-md ${
                        userRating > 0 && userComment.trim()
                          ? 'bg-primary text-primary-foreground hover:shadow-xl hover:scale-105'
                          : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
                      }`}
                      style={{ fontWeight: 600 }}
                      whileHover={userRating > 0 && userComment.trim() ? { y: -2 } : {}}
                      whileTap={userRating > 0 && userComment.trim() ? { scale: 0.98 } : {}}
                    >
                      <MessageSquare className="w-5 h-5" strokeWidth={2.5} />
                      Publish Review
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Comments List */}
              <div className="space-y-6" id="reviews">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl" style={{ fontWeight: 700 }}>
                    Reviews ({comments.length})
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-full">
                    <TrendingUp className="w-4 h-4 text-primary" strokeWidth={2} />
                    <span className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>Most Helpful</span>
                  </div>
                </div>
                
                {isMobile ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden">
                      <motion.div 
                        className="flex pl-1"
                        animate={{ x: `calc(-${reviewsCarouselIndex} * 83.5vw)` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {comments.map((comment, index) => {
                          const avatarColors = [
                            'from-[#6E7E55] to-[#5a6847]',
                            'from-[#D4A574] to-[#b8895f]',
                            'from-[#AFC1A1] to-[#96a887]',
                            'from-[#8A847F] to-[#726d69]',
                            'from-[#C46A4A] to-[#a5563d]',
                          ];
                          const colorIndex = index % avatarColors.length;
                          const isActive = index === reviewsCarouselIndex;
                          
                          return (
                            <motion.div
                              key={comment.id}
                              drag="x"
                              dragConstraints={{ left: 0, right: 0 }}
                              dragElastic={0.2}
                              onDragEnd={(e, { offset, velocity }) => {
                                const swipe = Math.abs(offset.x) * velocity.x;
                                
                                if (swipe > 500 || offset.x > 100) {
                                  setReviewsCarouselIndex((prev) => (prev === 0 ? comments.length - 1 : prev - 1));
                                } else if (swipe < -500 || offset.x < -100) {
                                  setReviewsCarouselIndex((prev) => (prev === comments.length - 1 ? 0 : prev + 1));
                                }
                              }}
                              animate={{
                                scale: isActive ? 1 : 0.92,
                                opacity: isActive ? 1 : 0.3
                              }}
                              transition={{ duration: 0.3 }}
                              className="flex-shrink-0 w-[82.5vw] mr-[1vw]"
                            >
                              <div className="group rounded-[24px] p-7 border border-primary md:border-2 md:border-border/30 md:hover:border-primary/30 hover:shadow-lg transition-all duration-300 space-y-5 cursor-grab active:cursor-grabbing">
                                {/* User Info & Rating */}
                                <div className="flex items-start gap-4">
                                  {/* User Avatar with gradient */}
                                  <div className="flex-shrink-0">
                                    <div 
                                      className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${avatarColors[colorIndex]} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
                                    >
                                      <span className="text-lg" style={{ fontWeight: 700 }}>{comment.user.initials}</span>
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                      <div className="min-w-0">
                                        <h4 className="text-lg mb-1" style={{ fontWeight: 700 }}>
                                          {comment.user.name}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">{comment.date}</p>
                                      </div>
                                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full flex-shrink-0">
                                        <div className="flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`w-4 h-4 ${
                                                star <= comment.rating 
                                                  ? 'fill-[#7a8a62] text-[#7a8a62]' 
                                                  : 'fill-none text-muted-foreground/30'
                                              }`}
                                              strokeWidth={1.5}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm" style={{ fontWeight: 700, color: "#6E7E55" }}>
                                          {comment.rating}.0
                                        </span>
                                      </div>
                                  </div>
                                </div>

                                {/* Comment Text - Full Width */}
                                <p className="text-foreground/90 text-base leading-relaxed break-words w-full">
                                  {comment.comment}
                                </p>

                                {/* Actions - Full Width */}
                                <div className="flex items-center justify-between w-full pt-2 border-t border-border/20">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => {
                                        setComments(comments.map(c => 
                                          c.id === comment.id 
                                            ? { ...c, thumbsUp: c.thumbsUp + 1 }
                                            : c
                                        ));
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group/btn"
                                    >
                                      <ThumbsUp className="w-4 h-4 group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                                      <span style={{ fontWeight: 600 }}>{comment.thumbsUp}</span>
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setComments(comments.map(c => 
                                          c.id === comment.id 
                                            ? { ...c, thumbsDown: c.thumbsDown + 1 }
                                            : c
                                        ));
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group/btn"
                                    >
                                      <ThumbsDown className="w-4 h-4 group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                                      <span style={{ fontWeight: 600 }}>{comment.thumbsDown}</span>
                                    </button>
                                  </div>
                                  <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                                    <MessageSquare className="w-4 h-4" strokeWidth={2.5} />
                                    <span style={{ fontWeight: 600 }}>Reply</span>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2">
                      {comments.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setReviewsCarouselIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === reviewsCarouselIndex 
                              ? 'bg-primary w-6' 
                              : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                  {comments.map((comment, index) => {
                    // Generate different color variations for avatars
                    const avatarColors = [
                      'from-[#6E7E55] to-[#5a6847]',
                      'from-[#D4A574] to-[#b8895f]',
                      'from-[#AFC1A1] to-[#96a887]',
                      'from-[#8A847F] to-[#726d69]',
                      'from-[#C46A4A] to-[#a5563d]',
                    ];
                    const colorIndex = index % avatarColors.length;
                    
                    return (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group rounded-[24px] p-7 border-2 border-border/30 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 space-y-5"
                      >
                        {/* User Info & Rating */}
                        <div className="flex items-start gap-4">
                          {/* User Avatar with gradient */}
                          <div className="flex-shrink-0">
                            <div 
                              className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${avatarColors[colorIndex]} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
                            >
                              <span className="text-lg" style={{ fontWeight: 700 }}>{comment.user.initials}</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="text-lg mb-1" style={{ fontWeight: 700 }}>
                                  {comment.user.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">{comment.date}</p>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full flex-shrink-0">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= comment.rating 
                                          ? 'fill-[#7a8a62] text-[#7a8a62]' 
                                          : 'fill-none text-muted-foreground/30'
                                      }`}
                                      strokeWidth={1.5}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm" style={{ fontWeight: 700, color: "#6E7E55" }}>
                                  {comment.rating}.0
                                </span>
                              </div>
                          </div>
                        </div>

                        {/* Comment Text - Full Width */}
                        <p className="text-foreground/90 text-base leading-relaxed break-words w-full">
                          {comment.comment}
                        </p>

                        {/* Actions - Full Width */}
                        <div className="flex items-center justify-between w-full pt-2 border-t border-border/20">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setComments(comments.map(c => 
                                  c.id === comment.id 
                                    ? { ...c, thumbsUp: c.thumbsUp + 1 }
                                    : c
                                ));
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group/btn"
                            >
                              <ThumbsUp className="w-4 h-4 group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                              <span style={{ fontWeight: 600 }}>{comment.thumbsUp}</span>
                            </button>
                            <button 
                              onClick={() => {
                                setComments(comments.map(c => 
                                  c.id === comment.id 
                                    ? { ...c, thumbsDown: c.thumbsDown + 1 }
                                    : c
                                ));
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group/btn"
                            >
                              <ThumbsDown className="w-4 h-4 group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                              <span style={{ fontWeight: 600 }}>{comment.thumbsDown}</span>
                            </button>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                            <MessageSquare className="w-4 h-4" strokeWidth={2.5} />
                            <span style={{ fontWeight: 600 }}>Reply</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Sticky Sidebar */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            {/* Pinpoint Score */}
            <motion.div 
              className="bg-gradient-to-br from-primary/10 via-primary/5 to-card rounded-[24px] p-4 border-2 border-primary/30 shadow-xl cursor-pointer relative overflow-hidden"
              onClick={() => setScoresDialogOpen(true)}
              whileHover={{ scale: 1.02, boxShadow: "0 16px 32px rgba(110, 126, 85, 0.2)" }}
              transition={{ duration: 0.3 }}
            >
              {/* Badge seal background */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              
              <div className="relative space-y-3">
                {/* Trust Badge Header */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full">
                    <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                    <span className="text-xs" style={{ fontWeight: 700, color: "#6E7E55" }}>PINPOINT SCORE</span>
                  </div>
                </div>
                
                {/* Large Score Display */}
                <div className="flex flex-col items-center py-2">
                  <ScoreCircle score={8.7} size={96} strokeWidth={10} />
                </div>

                {/* Verification badge */}
                <div className="bg-card/80 backdrop-blur rounded-[14px] p-3 border border-border/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs" style={{ fontWeight: 600 }}>Human Verified</div>
                      <div className="text-xs text-muted-foreground">Updated 3 days ago</div>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-card/60 rounded-[10px] border border-border/20">
                    <div className="text-base" style={{ fontWeight: 700, color: "#6E7E55" }}>9.2</div>
                    <div className="text-xs text-muted-foreground">Sentiment</div>
                  </div>
                  <div className="text-center p-2 bg-card/60 rounded-[10px] border border-border/20">
                    <div className="text-base" style={{ fontWeight: 700, color: "#6E7E55" }}>9.4</div>
                    <div className="text-xs text-muted-foreground">Traction</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pricing Card */}
            <motion.div 
              className="bg-card rounded-[20px] p-5 shadow-sm border border-border/50 cursor-pointer"
              onClick={() => {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base" style={{ fontWeight: 600 }}>Pricing</h3>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground mb-1">Starting Price</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl" style={{ fontWeight: 600, color: "#6E7E55" }}>Free</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Plus: $20/mo</div>
              </div>
            </motion.div>

            {/* Quick Navigation */}
            <div className="bg-card rounded-[20px] p-5 shadow-sm border border-border/50">
              <h3 className="text-sm mb-3" style={{ fontWeight: 600 }}>Quick Navigation</h3>
              <nav className="space-y-1">
                <a 
                  href="#overview" 
                  onClick={(e) => handleNavClick(e, 'overview')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'overview' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <FileText className="w-4 h-4" strokeWidth={1.5} />
                  Overview
                </a>
                <a 
                  href="#traction" 
                  onClick={(e) => handleNavClick(e, 'traction')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'traction' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                  Traffic & Growth
                </a>
                <a 
                  href="#features" 
                  onClick={(e) => handleNavClick(e, 'features')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'features-pros' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" strokeWidth={1.5} />
                  Features
                </a>
                <a 
                  href="#editor" 
                  onClick={(e) => handleNavClick(e, 'editor')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'editor' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <UserPen className="w-4 h-4" strokeWidth={1.5} />
                  Editor's Notes
                </a>
                <a 
                  href="#verification" 
                  onClick={(e) => handleNavClick(e, 'verification')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'verification' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <Shield className="w-4 h-4" strokeWidth={1.5} />
                  Verification
                </a>
                <a 
                  href="#sentiment" 
                  onClick={(e) => handleNavClick(e, 'sentiment')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'sentiment' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
                  Community Sentiment
                </a>
                <a 
                  href="#demos" 
                  onClick={(e) => handleNavClick(e, 'demos')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'demos' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <Image className="w-4 h-4" strokeWidth={1.5} />
                  Demos
                </a>
                <a 
                  href="#pricing" 
                  onClick={(e) => handleNavClick(e, 'pricing')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'pricing' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                  Pricing
                </a>
                <a 
                  href="#alternatives" 
                  onClick={(e) => handleNavClick(e, 'alternatives')}
                  className={`flex items-center gap-2 text-sm hover:text-foreground hover:translate-x-1 transition-all py-1.5 border-l-2 pl-3 ${
                    activeSection === 'alternatives' 
                      ? 'text-primary border-primary' 
                      : 'text-muted-foreground border-transparent hover:border-primary'
                  }`}
                >
                  <GitBranch className="w-4 h-4" strokeWidth={1.5} />
                  Alternatives
                </a>
              </nav>
            </div>
          </div>
        </aside>
      </div>

      {/* Scores Detail Dialog */}
      <Dialog open={scoresDialogOpen} onOpenChange={setScoresDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-xl tracking-tight" style={{ fontWeight: 600 }}>Detailed Scores</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              In-depth breakdown of how ChatGPT performs across key metrics
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2.5 py-2">
            {/* Pinpoint Score - Featured at top center */}
            <div className="p-4 rounded-[16px] bg-primary/10 border-2 border-primary/30 text-center space-y-1">
              <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Pinpoint Score</p>
              <p className="text-5xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>9.2</p>
              <p className="text-xs text-muted-foreground/80">Weighted average of all metrics</p>
            </div>

            {/* Grid of remaining scores */}
            <div className="grid grid-cols-2 gap-2">
              {/* Public Sentiment */}
              <div 
                className="p-3 rounded-[12px] bg-card/50 hover:bg-card/80 transition-all duration-300 space-y-1 cursor-pointer hover:shadow-md"
                onClick={() => {
                  setScoresDialogOpen(false);
                  setTimeout(() => {
                    document.getElementById('sentiment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Public Sentiment</p>
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>8.9</p>
                <p className="text-xs text-muted-foreground/80 leading-tight">Community feedback across platforms</p>
              </div>

              {/* Features Accuracy */}
              <div 
                className="p-3 rounded-[12px] bg-card/50 hover:bg-card/80 transition-all duration-300 space-y-1 cursor-pointer hover:shadow-md"
                onClick={() => {
                  setScoresDialogOpen(false);
                  setTimeout(() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Features Accuracy</p>
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#C9A94E" }}>7.8</p>
                <p className="text-xs text-muted-foreground/80 leading-tight">Claims vs. actual capabilities</p>
              </div>

              {/* Market Adoption */}
              <div 
                className="p-3 rounded-[12px] bg-card/50 hover:bg-card/80 transition-all duration-300 space-y-1 cursor-pointer hover:shadow-md"
                onClick={() => {
                  setScoresDialogOpen(false);
                  setTimeout(() => {
                    document.getElementById('traction')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Market Adoption</p>
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>9.4</p>
                <p className="text-xs text-muted-foreground/80 leading-tight">Adoption and user growth</p>
              </div>

              {/* Pricing Fairness */}
              <div 
                className="p-3 rounded-[12px] bg-card/50 hover:bg-card/80 transition-all duration-300 space-y-1 cursor-pointer hover:shadow-md"
                onClick={() => {
                  setScoresDialogOpen(false);
                  setTimeout(() => {
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Pricing Fairness</p>
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#E06A28" }}>6.5</p>
                <p className="text-xs text-muted-foreground/80 leading-tight">Value for money</p>
              </div>

              {/* Pro Verification */}
              <div 
                className="p-3 rounded-[12px] bg-card/50 hover:bg-card/80 transition-all duration-300 space-y-1 cursor-pointer hover:shadow-md"
                onClick={() => {
                  setScoresDialogOpen(false);
                  setTimeout(() => {
                    document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Pro Verification</p>
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>8.6</p>
                <p className="text-xs text-muted-foreground/80 leading-tight">Expert review and validation</p>
              </div>

              {/* Pinpoint Users */}
              <div 
                className="p-3 rounded-[12px] bg-card/50 hover:bg-card/80 transition-all duration-300 space-y-1 cursor-pointer hover:shadow-md"
                onClick={() => {
                  setScoresDialogOpen(false);
                  setTimeout(() => {
                    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Pinpoint Users</p>
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#C85250" }}>5.2</p>
                <p className="text-xs text-muted-foreground/80 leading-tight">Community ratings</p>
              </div>

              {/* Trust and Transparency */}
              <div className="p-3 rounded-[12px] bg-card/50 transition-all duration-300 space-y-1 col-span-2 opacity-60">
                <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Trust and Transparency</p>
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#C9A94E" }}>7.2</p>
                <p className="text-xs text-muted-foreground/80 leading-tight">Company ethics and data practices</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Detail Dialog */}
      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ fontWeight: 600 }}>Pricing Details</DialogTitle>
            <DialogDescription>
              Comprehensive overview of ChatGPT's pricing structure
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ fontWeight: 500 }}>Free Tier</p>
                <p className="text-xs text-muted-foreground mt-1">Access to GPT-3.5</p>
              </div>
              <div className="text-right">
                <span className="text-2xl" style={{ fontWeight: 600, color: "#6E7E55" }}>Free</span>
              </div>
            </div>
            <div className="border-t border-border/30" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ fontWeight: 500 }}>Plus Tier</p>
                <p className="text-xs text-muted-foreground mt-1">Access to GPT-4</p>
              </div>
              <div className="text-right">
                <span className="text-2xl" style={{ fontWeight: 600, color: "#6E7E55" }}>$20</span>
                <span className="text-sm text-muted-foreground"> / month</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ fontWeight: 500 }}>Enterprise Tier</p>
                <p className="text-xs text-muted-foreground mt-1">Unlimited usage</p>
              </div>
              <div className="text-right">
                <span className="text-2xl" style={{ fontWeight: 600, color: "#6E7E55" }}>Custom</span>
                <span className="text-sm text-muted-foreground"> Contact sales</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detailed Scores Modal */}
      <AnimatePresence>
        {detailedScoresOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setDetailedScoresOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:max-w-lg md:w-full z-50 bg-background rounded-[20px] border-2 border-border/50 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl tracking-tight" style={{ fontWeight: 600 }}>Detailed Scores</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      In-depth breakdown of how ChatGPT performs across key metrics
                    </p>
                  </div>
                  <button
                    onClick={() => setDetailedScoresOpen(false)}
                    className="w-9 h-9 rounded-[10px] bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Pinpoint Score Card */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-card rounded-[16px] p-4 border-2 border-primary/30">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>Pinpoint Score</p>
                    <p className="text-5xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>9.2</p>
                    <p className="text-[10px] text-muted-foreground/80">Weighted average of all metrics</p>
                  </div>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Public Sentiment */}
                  <div 
                    className="bg-card/50 hover:bg-card/80 rounded-[14px] p-3 space-y-1 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      setDetailedScoresOpen(false);
                      setTimeout(() => {
                        document.getElementById('sentiment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  >
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>Public Sentiment</p>
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>8.9</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">Community feedback across platforms</p>
                  </div>

                  {/* Features Accuracy */}
                  <div 
                    className="bg-card/50 hover:bg-card/80 rounded-[14px] p-3 space-y-1 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      setDetailedScoresOpen(false);
                      setTimeout(() => {
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  >
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>Features Accuracy</p>
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#C9A94E" }}>7.8</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">Claims vs. actual capabilities</p>
                  </div>

                  {/* Market Adoption */}
                  <div 
                    className="bg-card/50 hover:bg-card/80 rounded-[14px] p-3 space-y-1 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      setDetailedScoresOpen(false);
                      setTimeout(() => {
                        document.getElementById('traction')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  >
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>Market Adoption</p>
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>9.4</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">Adoption and user growth</p>
                  </div>

                  {/* Pricing Fairness */}
                  <div 
                    className="bg-card/50 hover:bg-card/80 rounded-[14px] p-3 space-y-1 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      setDetailedScoresOpen(false);
                      setTimeout(() => {
                        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  >
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>Pricing Fairness</p>
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#E06A28" }}>6.5</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">Value for money</p>
                  </div>

                  {/* Pro Verification */}
                  <div 
                    className="bg-card/50 hover:bg-card/80 rounded-[14px] p-3 space-y-1 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      setDetailedScoresOpen(false);
                      setTimeout(() => {
                        document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  >
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>Pro Verification</p>
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>8.6</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">Expert review and validation</p>
                  </div>

                  {/* Pinpoint Users */}
                  <div 
                    className="bg-card/50 hover:bg-card/80 rounded-[14px] p-3 space-y-1 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      setDetailedScoresOpen(false);
                      setTimeout(() => {
                        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  >
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>Pinpoint Users</p>
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#C85250" }}>5.2</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">Community ratings</p>
                  </div>

                  {/* Trust and Transparency - Full Width */}
                  <div className="bg-card/50 rounded-[14px] p-3 space-y-1 col-span-2 opacity-60">
                    <p className="text-xs text-muted-foreground" style={{ fontWeight: 600 }}>Trust and Transparency</p>
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#C9A94E" }}>7.2</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-tight">Company ethics and data practices</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer 
        onNavigate={onNavigate} 
        onContactClick={() => setContactFormOpen(true)}
        compact={true}
      />

      {/* Contact Form Dialog */}
      <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />

      {/* Sentiment Popup */}
      <SentimentPopup
        isOpen={sentimentPopupOpen}
        onClose={() => setSentimentPopupOpen(false)}
        platform={selectedPlatform}
        score={selectedScore}
      />
    </div>
  );
}