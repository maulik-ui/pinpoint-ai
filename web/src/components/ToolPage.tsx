"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, ExternalLink, Play, Check, X, AlertTriangle,
  MessageSquare, TrendingUp, Users, Code, Briefcase, GraduationCap,
  Calendar, Zap, Target, Shield, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Share2, User, ThumbsUp, ThumbsDown, Bookmark, Star,
  FileText, BarChart3, ClipboardCheck, Image, DollarSign, GitBranch, UserPen
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import Logo from "./Logo";
import { ScoreCircle } from "./ScoreCircle";
import ToolLogo from "./ToolLogo";
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
// import { ContactForm } from "./ContactForm";
// import { BookmarkButton } from "./BookmarkButton";
import { Footer } from "./Footer";
import { SentimentPopup } from "./SentimentPopup";
import { Navigation } from "./Navigation";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { EditableText } from "./admin/EditableText";
import { EditableList } from "./admin/EditableList";
import { EditableFeatureList } from "./admin/EditableFeatureList";
import { EditableProsConsList } from "./admin/EditableProsConsList";
import { EditableFunctionalityBlocks } from "./admin/EditableFunctionalityBlocks";
import { EditableVerificationHistory } from "./admin/EditableVerificationHistory";
import { SimilarwebUpload } from "./admin/SimilarwebUpload";

interface Feature {
  id: string;
  feature_name: string;
  status: string;
  notes: string | null;
  display_order?: number | null;
}

interface SentimentRun {
  reddit?: {
    overall_sentiment_0_to_10: number;
    sentiment_label: string;
    summary: string;
    top_positives?: string[];
    top_negatives?: string[];
  };
  x?: {
    overall_sentiment_0_to_10: number;
    sentiment_label: string;
    summary: string;
    top_positives?: string[];
    top_negatives?: string[];
  };
  youtube?: {
    overall_sentiment_0_to_10: number;
    sentiment_label: string;
    summary: string;
    top_positives?: string[];
    top_negatives?: string[];
  };
}

interface SentimentAggregate {
  final_score_0_to_10: number;
  final_label: string;
  cross_platform_summary: string;
}

interface AlternativeTool {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  logo_url: string | null;
  overall_score: number | null;
  company_name: string | null;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  category: string | null;
  logo_url: string | null;
  website_url: string | null;
  pricing_model: string | null;
  overall_score: number | null;
  capabilities_text: string | null;
  domain_data: any | null;
  domain_score: number | null;
  organic_etv: number | null;
  organic_keywords: number | null;
  domain_rank: number | null;
  referring_domains: number | null;
  backlinks_count: number | null;
  spam_score: number | null;
  company_name: string | null;
}

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  valueRating?: string;
}

interface ToolPageProps {
  tool: Tool;
  features: Feature[];
  sentimentRuns: SentimentRun | null;
  sentimentAggregate: SentimentAggregate | null;
  alternatives?: AlternativeTool[];
  similarwebReport?: any | null;
  similarwebMonthlyData?: any[];
  isAdmin?: boolean;
}

// Parse pricing tiers from capabilities_text
function parsePricingTiers(capabilitiesText: string | null): PricingTier[] {
  if (!capabilitiesText) {
    return [];
  }
  
  const pricingSectionMatch = capabilitiesText.match(/Pricing\s+Details\s*:\s*([\s\S]*)/i);
  if (!pricingSectionMatch) {
    const altMatch = capabilitiesText.match(/(?:Pricing|Pricing Information|Pricing Plans)\s*:\s*([\s\S]*)/i);
    if (!altMatch) {
      return [];
    }
    var pricingText = altMatch[1];
  } else {
    var pricingText = pricingSectionMatch[1];
  }
  
  const tiers: PricingTier[] = [];
  const tierMatches = pricingText.matchAll(/\*\*([^*]+?)\*\*[\s\S]*?(?=\*\*|$)/g);
  
  for (const match of tierMatches) {
    const tierName = match[1].trim();
    let tierContent = match[0].replace(/\*\*[^*]+\*\*/, "").trim();
    
    let price = "Custom";
    const pricePatterns = [
      /\*\*Price:\*\*\s*([^\n]+)/i,
      /Price:\s*\*\*([^*]+)\*\*/i,
      /Price:\s*([^\n]+)/i,
      /\$[\d,]+(?:\/[a-z]+)?/i,
      /\b(Free|Custom)\b/i,
    ];
    
    for (const pattern of pricePatterns) {
      const match = tierContent.match(pattern);
      if (match) {
        price = (match[1] || match[0]).trim().replace(/^(Price:|-\s*Price:|\*\*Price:\*\*|\*\*)\s*/i, "").trim().replace(/\*\*/g, "").trim();
        if (!price.match(/^(\$|Free|Custom)/i)) {
          const nearbyPrice = tierContent.match(/\$[\d,]+(?:\/[a-z]+)?|\b(Free|Custom)\b/i);
          if (nearbyPrice) {
            price = nearbyPrice[0];
          }
        }
        break;
      }
    }
    
    let description = "";
    const bestForMatch = tierContent.match(/Best For:\s*([^\n]+)/i);
    if (bestForMatch) {
      description = bestForMatch[1].trim();
    }
    
    const features: string[] = [];
    const keyFeaturesPatterns = [
      /\*\*Key Features:\*\*\s*([\s\S]*?)(?=\*\*Limits:|Limits:|Best For:|Price:|$)/i,
      /Key Features:\s*([\s\S]*?)(?=Limits:|Best For:|Price:|$)/i,
    ];
    
    let featuresText = "";
    for (const pattern of keyFeaturesPatterns) {
      const match = tierContent.match(pattern);
      if (match && match[1]) {
        featuresText = match[1];
        break;
      }
    }
    
    if (featuresText) {
      const bulletMatches = featuresText.matchAll(/(?:[-•✓]|✓|\*)\s*([^\n]+)/g);
      for (const bulletMatch of bulletMatches) {
        let feature = (bulletMatch[1] || bulletMatch[0]).trim().replace(/^[-•✓*]\s*/, "").trim().replace(/\*\*/g, "").trim();
        if (feature && !feature.match(/^(Key Features|Limits|Best For|Price):/i) && feature.length > 3) {
          features.push(feature);
        }
      }
    }
    
    let valueRating: string | undefined = undefined;
    const ratingMatch = tierContent.match(/Value Rating:\s*([^\n]+)/i) ||
                       tierContent.match(/\b(Excellent|Very Good|Good|Fair|Poor)\b/i);
    if (ratingMatch) {
      valueRating = (ratingMatch[1] || ratingMatch[0]).trim();
    }
    
    if (tierName && (price !== "Custom" || description || features.length > 0)) {
      tiers.push({
        name: tierName.replace(/\s*\([^)]*\)\s*$/, "").trim(),
        price: price,
        description: description,
        features: features.slice(0, 6),
        valueRating,
      });
    }
  }
  
  if (tiers.length === 0) {
    const commonTiers = ["Free", "Hobby", "Starter", "Pro", "Pro+", "Plus", "Ultra", "Enterprise", "Business", "Premium"];
    for (const tierName of commonTiers) {
      const tierRegex = new RegExp(`\\b${tierName.replace(/[+]/g, "\\+")}\\b[\\s\\S]*?(?=\\b(?:${commonTiers.filter(t => t !== tierName).map(t => t.replace(/[+]/g, "\\+")).join("|")})\\b|$)`, "i");
      const tierMatch = pricingText.match(tierRegex);
      if (tierMatch) {
        const tierContent = tierMatch[0];
        const priceMatch = tierContent.match(/\$[\d,]+(?:\/[a-z]+)?|\b(Free|Custom)\b/i);
        const features: string[] = [];
        const featureMatches = tierContent.matchAll(/(?:[-•✓]|✓|\*)\s*([^\n]+)/gi);
        for (const featMatch of featureMatches) {
          const feature = (featMatch[1] || featMatch[0]).replace(/^[-•✓*]\s*/, "").trim();
          if (feature && feature.length > 3) {
            features.push(feature);
          }
        }
        
        if (priceMatch || features.length > 0) {
          tiers.push({
            name: tierName,
            price: priceMatch ? priceMatch[0] : "Custom",
            description: "",
            features: features.slice(0, 6),
          });
        }
      }
    }
  }
  
  const uniqueTiers = tiers.filter((tier, index, self) => 
    index === self.findIndex(t => t.name === tier.name && t.price === tier.price)
  );
  
  uniqueTiers.sort((a, b) => {
    if (a.price.toLowerCase() === "free") return -1;
    if (b.price.toLowerCase() === "free") return 1;
    const aPrice = parseFloat(a.price.replace(/[^0-9.]/g, ""));
    const bPrice = parseFloat(b.price.replace(/[^0-9.]/g, ""));
    if (!isNaN(aPrice) && !isNaN(bPrice)) return aPrice - bPrice;
    if (!isNaN(aPrice)) return -1;
    if (!isNaN(bPrice)) return 1;
    return 0;
  });
  
  return uniqueTiers.slice(0, 4);
}

export function ToolPage({ tool, features, sentimentRuns, sentimentAggregate, alternatives = [], similarwebReport = null, similarwebMonthlyData = [], isAdmin = false }: ToolPageProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  // Helper function to save tool fields
  const saveToolField = async (field: string, value: string | string[] | any) => {
    const response = await fetch("/api/admin/update-tool-field", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId: tool.id, field, value }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save");
    }
    // Reload page to show updated data
    window.location.reload();
  };
  
  const saveFunctionalityBlocks = async (blocks: Array<{ title: string; description: string }>) => {
    await saveToolField("functionality_blocks", blocks);
  };
  
  const saveVerificationHistory = async (history: Array<{ date: string; title: string; description: string; isLatest?: boolean }>) => {
    await saveToolField("verification_history", history);
  };
  
  // Helper function to save all feature changes at once
  const saveAllFeatures = async (changes: {
    updates: Array<{ id: string; status: string; feature_name: string; display_order?: number }>;
    additions: Array<{ feature_name: string; status: string; display_order?: number }>;
    deletions: string[];
  }) => {
    const response = await fetch("/api/admin/bulk-update-features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...changes, toolId: tool.id }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save features");
    }
    // Reload page to show updated data
    window.location.reload();
  };
  
  // Extract pros/cons from domain_data or sentiment data
  const domainData = tool.domain_data || {};
  const customProsCons = domainData.pros_cons || {};
  const pros = customProsCons.pros && customProsCons.pros.length > 0
    ? customProsCons.pros
    : (sentimentRuns?.x?.top_positives || 
       sentimentRuns?.reddit?.top_positives || 
       sentimentRuns?.youtube?.top_positives || []);
  
  const cons = customProsCons.cons && customProsCons.cons.length > 0
    ? customProsCons.cons
    : (sentimentRuns?.x?.top_negatives || 
       sentimentRuns?.reddit?.top_negatives || 
       sentimentRuns?.youtube?.top_negatives || []);
  
  // Editor's note from domain_data or sentiment aggregate
  const editorNote = domainData.editor_note || sentimentAggregate?.cross_platform_summary || "";
  
  // Functionality blocks from domain_data or default placeholder
  const functionalityBlocks = domainData.functionality_blocks && domainData.functionality_blocks.length > 0
    ? domainData.functionality_blocks
    : [
        { title: "Natural Conversations", description: "Human-like responses that feel authentic" },
        { title: "Context Memory", description: "Remembers your entire conversation" },
        { title: "Regular Updates", description: "Constantly learning and improving" },
        { title: "Versatile Use Cases", description: "Writing, coding, research, and more" }
      ];
  
  // Verification history from domain_data or default placeholder
  const verificationHistory = domainData.verification_history && domainData.verification_history.length > 0
    ? domainData.verification_history
    : [
        {
          date: "November 15, 2025",
          title: "Full reverification completed",
          description: "All features, pricing, and performance metrics verified by our team. Score updated to reflect current capabilities.",
          isLatest: true
        },
        {
          date: "August 22, 2025",
          title: "Major update verification",
          description: "New features and pricing changes reviewed and documented",
          isLatest: false
        },
        {
          date: "May 10, 2025",
          title: "Initial verification",
          description: "Tool added to Pinpoint database with full feature audit",
          isLatest: false
        }
      ];
  
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
  const [selectedScore, setSelectedScore] = useState(sentimentRuns?.x?.overall_sentiment_0_to_10 || sentimentAggregate?.final_score_0_to_10 || tool.overall_score || 8.0);
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

  // Helper to convert Supabase NUMERIC fields to numbers
  const toNumber = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }
    return null;
  };

  // Format helpers
  const formatNumber = (num: number | null): string => {
    if (num === null) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const formatPercentage = (val: number | null): string => {
    if (val === null) return "N/A";
    return `${val.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate traffic data from Similarweb monthly data or fallback to domain_data or mock data
  let trafficData: Array<{ month: string; visits: number }> = [];
  
  if (similarwebMonthlyData && similarwebMonthlyData.length > 0) {
    // Use Similarweb monthly data - map to chart format
    trafficData = similarwebMonthlyData.map((item) => {
      // Parse date string directly to avoid timezone issues
      // Format: "2025-09-01" -> extract year and month
      const dateStr = String(item.month || item.month_date || '');
      const [year, month] = dateStr.split('-');
      const monthIndex = parseInt(month) - 1; // 0-indexed
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[monthIndex] || month;
      
      // Extract visits number - handle both string and number formats
      let visits = 0;
      if (typeof item.visits === 'string') {
        visits = parseFloat(item.visits.replace(/,/g, '')) || 0;
      } else if (typeof item.visits === 'number') {
        visits = item.visits;
      }
      
      return {
        month: monthName,
        visits: Math.round(visits),
      };
    }).sort((a, b) => {
      // Sort by month order
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  } else {
    // Fallback to domain_data or mock data
    trafficData = tool.domain_data?.traffic_data || [
      { month: "Jul", visits: tool.organic_etv ? Math.round(tool.organic_etv * 0.4) : 245000 },
      { month: "Aug", visits: tool.organic_etv ? Math.round(tool.organic_etv * 0.5) : 312000 },
      { month: "Sep", visits: tool.organic_etv ? Math.round(tool.organic_etv * 0.6) : 385000 },
      { month: "Oct", visits: tool.organic_etv ? Math.round(tool.organic_etv * 0.7) : 421000 },
      { month: "Nov", visits: tool.organic_etv ? Math.round(tool.organic_etv * 0.8) : 498000 },
      { month: "Dec", visits: tool.organic_etv || 567000 },
    ];
  }

  // Get latest month's visits - prioritize Similarweb monthly_visits, then use latest from trafficData
  const latestMonthVisits = similarwebReport?.monthly_visits 
    ? similarwebReport.monthly_visits 
    : (trafficData.length > 0 ? trafficData[trafficData.length - 1].visits : null);
  
  // Get metrics from Similarweb report
  const totalVisits = similarwebReport ? toNumber(similarwebReport.total_visits) : null;
  const pagesPerVisit = similarwebReport ? toNumber(similarwebReport.pages_per_visit) : null;
  const bounceRate = similarwebReport ? toNumber(similarwebReport.bounce_rate) : null;
  const visitDurationSeconds = similarwebReport ? toNumber(similarwebReport.visit_duration_seconds || similarwebReport.avg_visit_duration_seconds) : null;
  const globalRank = similarwebReport ? toNumber(similarwebReport.global_rank) : null;
  const industryRank = similarwebReport ? toNumber(similarwebReport.industry_rank) : null;
  
  // Debug logging for ranks
  if (similarwebReport) {
    console.log('Similarweb report ranks:', {
      global_rank_raw: similarwebReport.global_rank,
      global_rank_parsed: globalRank,
      industry_rank_raw: similarwebReport.industry_rank,
      industry_rank_parsed: industryRank,
      industry: similarwebReport.industry,
    });
  }

  // Map features from props - preserve custom display_order, fallback to feature_name
  // Sort features by display_order first, then by feature_name as fallback
  const sortedFeatures = [...features].sort((a, b) => {
    const orderA = (a as any).display_order ?? 999999;
    const orderB = (b as any).display_order ?? 999999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.feature_name || '').localeCompare(b.feature_name || '');
  });
  
  const mappedFeatures = sortedFeatures.map((f, idx) => ({
    id: f.id || `feature-${idx}`,
    name: f.feature_name,
    status: f.status || 'works' // Default to 'works' if status is missing
  }));
  
  const defaultFeatures = [
    { id: 'default-feature-1', name: "AI-powered capabilities", status: "works" },
    { id: 'default-feature-2', name: "User-friendly interface", status: "works" },
  ];
  
  const featuresToDisplay = mappedFeatures.length > 0 ? mappedFeatures : defaultFeatures;

  // Map alternatives from props
  const mappedAlternatives = alternatives.map(alt => ({
    name: alt.name,
    companyName: alt.company_name || null,
    logoUrl: alt.logo_url || null,
    description: alt.short_description || 'AI-powered alternative tool',
    bestFor: alt.category || 'Similar use case',
    score: alt.overall_score || 7.5,
    pricing: 'Various',
    image: alt.logo_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
    pros: [alt.short_description || 'AI-powered features'],
    slug: alt.slug,
  }));
  
  const defaultAlternatives = [
    {
      name: "Similar Tool 1",
      companyName: null,
      logoUrl: null,
      description: "Alternative AI tool with similar capabilities",
      bestFor: "Similar use cases",
      score: 7.5,
      pricing: "Various",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
      pros: ["AI-powered features"],
      slug: "",
    },
  ];
  
  const alternativesToDisplay = mappedAlternatives.length > 0 ? mappedAlternatives : defaultAlternatives;

  // Parse pricing tiers from capabilities_text
  const parsedPricingTiers = parsePricingTiers(tool.capabilities_text);
  const defaultPricingTiers = tool.pricing_model ? [
    {
      name: tool.pricing_model,
      price: tool.pricing_model === "Free" ? "Free" : tool.pricing_model === "Freemium" ? "Free" : "Custom",
      description: "",
      features: ["Core features"],
      valueRating: "Good"
    }
  ] : [];
  const pricingTiersToDisplay = parsedPricingTiers.length > 0 ? parsedPricingTiers : defaultPricingTiers;

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

  // Use pros/cons from above (already extracted from domain_data or sentiment)

  const displayedFeatures = featuresExpanded ? featuresToDisplay : featuresToDisplay.slice(0, 4);
  const displayedPros = prosConsExpanded ? pros : pros.slice(0, 5);
  const displayedCons = prosConsExpanded ? cons : cons.slice(0, 4);

  const nextAlternative = () => {
    setCurrentAlternativeIndex((prev) => (prev + 1) % alternativesToDisplay.length);
  };

  const prevAlternative = () => {
    setCurrentAlternativeIndex((prev) => (prev - 1 + alternativesToDisplay.length) % alternativesToDisplay.length);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation 
        onBack={() => router.back()}
        onNavigate={(page: string) => {
          if (page === 'contact') {
            setContactFormOpen(true);
          } else if (page === 'home') {
            router.push('/');
          } else if (page === 'pricing') {
            router.push('/pricing');
          } else if (page === 'user') {
            router.push('/user');
          } else if (page === 'categories') {
            router.push('/browse');
          } else if (page === 'submit-tool') {
            router.push('/submit-tool');
          }
        }}
        onLogoClick={() => router.push('/')}
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
              <div className="absolute top-6 right-6 z-20">
                {/* <BookmarkButton
                  toolId={tool.id}
                  toolName={tool.name}
                  toolCategory={tool.category || undefined}
                  toolImage={tool.logo_url || undefined}
                  size="lg"
                  variant="icon"
                  className="w-12 h-12 shadow-md"
                /> */}
                <button className="w-12 h-12 rounded-full bg-card border border-border/30 hover:border-primary/40 flex items-center justify-center transition-all shadow-md">
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>
              
              {/* Mobile Layout */}
              <div className="relative z-10 flex md:hidden flex-col items-center text-center space-y-3">
                {/* Logo */}
                <div className="flex items-center justify-center mt-2">
                  <motion.a
                    href={tool.website_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center cursor-pointer group"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageWithFallback
                      src={tool.logo_url || ''}
                      alt={tool.name}
                      className="w-16 h-16 group-hover:scale-110 transition-transform rounded-[12px]"
                    />
                  </motion.a>
                </div>

                {/* Title with Verified Check */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <EditableText
                        value={tool.name}
                        onSave={(v) => saveToolField("name", v)}
                        as="h1"
                        className="text-3xl tracking-tight"
                        displayClassName="text-3xl tracking-tight"
                        style={{ fontWeight: 700 }}
                      />
                    ) : (
                      <h1 className="text-3xl tracking-tight" style={{ fontWeight: 700 }}>{tool.name}</h1>
                    )}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    </motion.div>
                  </div>
                  {tool.company_name && (
                    <p className="text-base text-muted-foreground" style={{ fontWeight: 500 }}>{tool.company_name}</p>
                  )}
                </div>

                {/* Description */}
                {isAdmin ? (
                  <EditableText
                    value={tool.short_description || ""}
                    onSave={(v) => saveToolField("short_description", v)}
                    as="p"
                    className="text-muted-foreground leading-relaxed text-[16px]"
                    displayClassName="text-muted-foreground leading-relaxed text-[16px]"
                    placeholder="AI-powered tool"
                    label="short_description"
                    minLength={50}
                    maxLength={150}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed text-[16px]">
                    {tool.short_description || 'AI-powered tool'}
                  </p>
                )}

                {/* Meta badges */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {tool.category && (
                    <Link
                      href={`/category/${tool.category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-3 py-1.5 rounded-full text-sm text-muted-foreground border border-primary/30 bg-transparent hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      {tool.category}
                    </Link>
                  )}
                  {tool.pricing_model && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">
                      {tool.pricing_model}
                    </span>
                  )}
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
                    <ScoreCircle score={tool.overall_score || 0} size={64} strokeWidth={6}  />
                  </div>
                  </div>
                </motion.div>
              </div>

              {/* Desktop Layout */}
              <div className="relative z-10 hidden md:block">
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {/* Logo with badge underneath */}
                  <div className="flex flex-col items-center gap-3">
                    <motion.a
                      href={tool.website_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-32 h-32 rounded-[20px] bg-card shadow-md flex items-center justify-center flex-shrink-0 cursor-pointer group border-2 border-transparent hover:border-primary/40 transition-all"
                      whileHover={{ scale: 1.08, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)" }}
                      transition={{ duration: 0.3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ImageWithFallback
                        src={tool.logo_url || ''}
                        alt={tool.name}
                        className="w-16 h-16 group-hover:scale-110 transition-transform rounded-[12px]"
                      />
                    </motion.a>
                    {tool.category && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={`/category/${tool.category.toLowerCase().replace(/\s+/g, '-')}`}
                          className="relative px-4 py-1.5 rounded-full text-center whitespace-nowrap border-2 bg-transparent hover:bg-[#b3623f]/5 transition-all cursor-pointer"
                          style={{ borderColor: '#b3623f' }}
                        >
                          <span className="relative text-xs" style={{ fontWeight: 700, color: '#b3623f' }}>#{tool.category}</span>
                        </Link>
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                      {/* Title with badges */}
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                          {isAdmin ? (
                            <EditableText
                              value={tool.name}
                              onSave={(v) => saveToolField("name", v)}
                              as="h1"
                              className="text-4xl tracking-tight"
                              displayClassName="text-4xl tracking-tight"
                              style={{ fontWeight: 700 }}
                            />
                          ) : (
                            <h1 className="text-4xl tracking-tight" style={{ fontWeight: 700 }}>{tool.name}</h1>
                          )}
                          {tool.company_name && (
                            <p className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>{tool.company_name}</p>
                          )}
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
                      {isAdmin ? (
                        <EditableText
                          value={tool.short_description || ""}
                          onSave={(v) => saveToolField("short_description", v)}
                          as="p"
                          className="text-lg text-muted-foreground max-w-3xl"
                          displayClassName="text-lg text-muted-foreground max-w-3xl"
                          style={{ lineHeight: 1.6 }}
                          placeholder="AI-powered tool"
                          label="short_description"
                          minLength={50}
                          maxLength={150}
                        />
                      ) : (
                        <p className="text-lg text-muted-foreground max-w-3xl" style={{ lineHeight: 1.6 }}>
                          {tool.short_description || 'AI-powered tool'}
                        </p>
                      )}

                      {/* Meta badges */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {tool.category && (
                          <Link
                            href={`/category/${tool.category.toLowerCase().replace(/\s+/g, '-')}`}
                            className="px-3 py-1.5 rounded-full text-sm text-muted-foreground border border-primary/30 bg-transparent hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                          >
                            {tool.category}
                          </Link>
                        )}
                        {tool.pricing_model && (
                          <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">
                            {tool.pricing_model}
                          </span>
                        )}
                        {tool.overall_score && (
                          <span className="px-5 py-2 bg-primary/10 text-primary rounded-full text-sm hidden" style={{ fontWeight: 600 }}>
                            Score: {tool.overall_score.toFixed(1)}/10
                          </span>
                        )}
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
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>What is {tool.name}?</h2>
              </div>
              
              {/* Detailed paragraphs */}
              <div className="space-y-4 text-base text-foreground/85" style={{ lineHeight: 1.8 }}>
                {isAdmin ? (
                  <EditableText
                    value={tool.tool_overview || tool.capabilities_text || ""}
                    onSave={(v) => saveToolField("tool_overview", v)}
                    as="div"
                    multiline={true}
                    rows={8}
                    className="w-full"
                    displayClassName="space-y-4"
                    placeholder="Enter tool overview..."
                    label="tool_overview"
                    minLength={400}
                    maxLength={700}
                  />
                ) : (
                  tool.capabilities_text ? (
                    <div dangerouslySetInnerHTML={{ __html: tool.capabilities_text.replace(/\n/g, '<br />') }} />
                  ) : (
                    <>
                      <p>
                        {tool.tool_overview || tool.short_description || 'AI-powered tool that helps you accomplish your tasks efficiently.'}
                      </p>
                      <p>
                        This tool has been verified by our team and is trusted by thousands of users worldwide.
                      </p>
                    </>
                  )
                )}
              </div>

              {/* Key highlights */}
              {isAdmin ? (
                <div className="pt-3">
                  <EditableFunctionalityBlocks
                    blocks={functionalityBlocks}
                    onSave={saveFunctionalityBlocks}
                    toolId={tool.id}
                  />
                </div>
              ) : (
                <div className="pt-3 grid md:grid-cols-2 gap-3">
                  {functionalityBlocks.map((block, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-card rounded-[12px] border border-border/30">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-sm" style={{ fontWeight: 600 }}>{block.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Similarweb Upload (Admin Only) */}
          {isAdmin && (
            <section className="py-6">
              <div className="bg-card rounded-[20px] p-6 shadow-sm border border-border/50">
                <SimilarwebUpload toolId={tool.id} toolSlug={tool.slug} />
              </div>
            </section>
          )}

          {/* Traffic & Traction Charts */}
          <section id="traction" className="py-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl tracking-tight" style={{ fontWeight: 700 }}>Traffic & Growth</h2>
              </div>
              <div className="bg-card rounded-[20px] p-6 shadow-sm border border-border/50">
                <h3 className="text-lg mb-6 text-muted-foreground" style={{ fontWeight: 500 }}>
                  {trafficData.length > 0 ? `${trafficData.length}-Month Traffic Growth` : 'Traffic Growth'}
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
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `${(value / 1000).toFixed(0)}k`;
                        }
                        return value.toString();
                      }}
                      domain={(() => {
                        if (trafficData.length === 0) return [0, 'dataMax'];
                        const visits = trafficData.map(d => d.visits);
                        const min = Math.min(...visits);
                        const max = Math.max(...visits);
                        const range = max - min;
                        const padding = range * 0.2; // 20% padding on top and bottom
                        const domainMin = Math.max(0, min - padding);
                        const domainMax = max + padding;
                        return [domainMin, domainMax];
                      })()}
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
                      formatter={(value: number, name: string) => {
                        let formatted: string;
                        if (value >= 1000000) {
                          formatted = `${(value / 1000000).toFixed(2)}M`;
                        } else if (value >= 1000) {
                          formatted = `${(value / 1000).toFixed(1)}k`;
                        } else {
                          formatted = value.toLocaleString();
                        }
                        return [formatted, name === 'visits' ? 'Visits' : name];
                      }}
                      labelFormatter={(label) => label}
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
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `${(value / 1000).toFixed(0)}k`;
                        }
                        return value.toString();
                      }}
                      domain={(() => {
                        if (trafficData.length === 0) return [0, 'dataMax'];
                        const visits = trafficData.map(d => d.visits);
                        const min = Math.min(...visits);
                        const max = Math.max(...visits);
                        const range = max - min;
                        const padding = range * 0.2; // 20% padding on top and bottom
                        const domainMin = Math.max(0, min - padding);
                        const domainMax = max + padding;
                        return [domainMin, domainMax];
                      })()}
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
                      formatter={(value: number, name: string) => {
                        let formatted: string;
                        if (value >= 1000000) {
                          formatted = `${(value / 1000000).toFixed(2)}M`;
                        } else if (value >= 1000) {
                          formatted = `${(value / 1000).toFixed(1)}k`;
                        } else {
                          formatted = value.toLocaleString();
                        }
                        return [formatted, name === 'visits' ? 'Visits' : name];
                      }}
                      labelFormatter={(label) => label}
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
                {trafficData.length > 1 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {(() => {
                      const firstVisits = trafficData[0].visits;
                      const lastVisits = trafficData[trafficData.length - 1].visits;
                      const growth = firstVisits > 0 ? ((lastVisits - firstVisits) / firstVisits * 100) : 0;
                      const trend = growth > 0 ? 'upward' : growth < 0 ? 'downward' : 'stable';
                      return `${trend.charAt(0).toUpperCase() + trend.slice(1)} trend showing ${Math.abs(growth).toFixed(0)}% ${growth >= 0 ? 'growth' : 'decline'} over ${trafficData.length} months`;
                    })()}
                  </p>
                )}
                {trafficData.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    No monthly traffic data available. Upload a Similarweb report to see monthly visits over time.
                  </p>
                )}
                
                {/* Key Metrics Grid */}
                {(latestMonthVisits !== null || pagesPerVisit !== null || bounceRate !== null || visitDurationSeconds !== null || globalRank !== null || industryRank !== null) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-border/30">
                    {latestMonthVisits !== null && (
                      <div className="bg-secondary/30 rounded-[12px] p-4">
                        <div className="text-xs text-muted-foreground mb-1">Monthly Visits</div>
                        <div className="text-xl" style={{ fontWeight: 700 }}>
                          {formatNumber(latestMonthVisits)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Latest month</div>
                      </div>
                    )}
                    {pagesPerVisit !== null && (
                      <div className="bg-secondary/30 rounded-[12px] p-4">
                        <div className="text-xs text-muted-foreground mb-1">Pages/Visit</div>
                        <div className="text-xl" style={{ fontWeight: 700 }}>
                          {pagesPerVisit.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {bounceRate !== null && (
                      <div className="bg-secondary/30 rounded-[12px] p-4">
                        <div className="text-xs text-muted-foreground mb-1">Bounce Rate</div>
                        <div className="text-xl" style={{ fontWeight: 700 }}>
                          {formatPercentage(bounceRate)}
                        </div>
                      </div>
                    )}
                    {visitDurationSeconds !== null && (
                      <div className="bg-secondary/30 rounded-[12px] p-4">
                        <div className="text-xs text-muted-foreground mb-1">Visit Duration</div>
                        <div className="text-xl" style={{ fontWeight: 700 }}>
                          {formatDuration(visitDurationSeconds)}
                        </div>
                      </div>
                    )}
                    {globalRank !== null && (
                      <div className="bg-secondary/30 rounded-[12px] p-4">
                        <div className="text-xs text-muted-foreground mb-1">Global Rank</div>
                        <div className="text-xl" style={{ fontWeight: 700 }}>
                          #{formatNumber(globalRank)}
                        </div>
                      </div>
                    )}
                    {industryRank !== null && (
                      <div className="bg-secondary/30 rounded-[12px] p-4">
                        <div className="text-xs text-muted-foreground mb-1">Industry Rank</div>
                        <div className="text-xl" style={{ fontWeight: 700 }}>
                          #{formatNumber(industryRank)}
                        </div>
                        {similarwebReport?.industry && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {similarwebReport.industry}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                {isAdmin ? (
                  <EditableFeatureList
                    features={sortedFeatures}
                    toolId={tool.id}
                    onSave={saveAllFeatures}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-1.5">
                      {displayedFeatures.map((feature, idx) => (
                        <motion.div 
                          key={feature.id || `feature-${idx}`} 
                          className="flex items-center gap-4 p-2.5 rounded-[12px] bg-secondary/20"
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            feature.status === "works" ? "bg-[#6E7E55]" : 
                            (feature.status === "partial" || feature.status === "mediocre") ? "bg-[#D4A574]" : 
                            "bg-[#C46A4A]"
                          }`}>
                            {feature.status === "works" && (
                              <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                            )}
                            {(feature.status === "partial" || feature.status === "mediocre") && (
                              <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2.5} />
                            )}
                            {(feature.status === "fails" || feature.status === "failed") && (
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
                  </>
                )}
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
                          {isAdmin ? (
                            <EditableProsConsList
                              items={pros}
                              type="pros"
                              toolId={tool.id}
                              onSave={(items) => saveToolField("pros", items)}
                            />
                          ) : (
                            <div className="space-y-4">
                              {displayedPros.map((pro, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                  <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>{pro}</p>
                                </div>
                              ))}
                            </div>
                          )}
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
                          {isAdmin ? (
                            <EditableProsConsList
                              items={cons}
                              type="cons"
                              toolId={tool.id}
                              onSave={(items) => saveToolField("cons", items)}
                            />
                          ) : (
                            <div className="space-y-4">
                              {displayedCons.map((con, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-2" />
                                  <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>{con}</p>
                                </div>
                              ))}
                            </div>
                          )}
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
                  {isAdmin ? (
                    <EditableProsConsList
                      items={pros}
                      type="pros"
                      toolId={tool.id}
                      onSave={(items) => saveToolField("pros", items)}
                    />
                  ) : (
                    <div className="space-y-4">
                      {displayedPros.map((pro, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>{pro}</p>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {isAdmin ? (
                    <EditableProsConsList
                      items={cons}
                      type="cons"
                      toolId={tool.id}
                      onSave={(items) => saveToolField("cons", items)}
                    />
                  ) : (
                    <div className="space-y-4">
                      {displayedCons.map((con, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-2" />
                          <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>{con}</p>
                        </div>
                      ))}
                    </div>
                  )}
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
                {isAdmin ? (
                  <EditableText
                    value={editorNote}
                    onSave={(v) => saveToolField("editor_note", v)}
                    multiline={true}
                    rows={6}
                    className="w-full"
                    displayClassName="space-y-4 text-lg text-foreground/85"
                    style={{ lineHeight: 1.8 }}
                    placeholder="Enter editor's notes..."
                    label="editor_note"
                    minLength={400}
                    maxLength={700}
                  />
                ) : (
                  <div className="space-y-4 text-lg text-foreground/85" style={{ lineHeight: 1.8 }}>
                    <p>
                      {editorNote || sentimentAggregate?.cross_platform_summary || sentimentRuns?.x?.summary || sentimentRuns?.reddit?.summary || 
                      `After extensive testing, ${tool.name} consistently impressed us with its capabilities and performance.`}
                    </p>
                    <p>
                      <span style={{ fontWeight: 600 }}>You'll love it if:</span> {tool.short_description || 'You need a reliable AI tool for your workflow.'}
                    </p>
                    <p>
                      <span style={{ fontWeight: 600 }}>It might not be for you if:</span> You need specialized features that this tool doesn't offer. Always verify the tool meets your specific requirements.
                    </p>
                  </div>
                )}
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
              {isAdmin ? (
                <EditableVerificationHistory
                  items={verificationHistory}
                  onSave={saveVerificationHistory}
                  toolId={tool.id}
                />
              ) : (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-[20px] p-7 border-2 border-primary/20 shadow-sm">
                  <div className="relative">
                    <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-primary/30" />
                    <div className="space-y-5">
                      {verificationHistory.map((item, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-start gap-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + (index * 0.1) }}
                        >
                          <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 relative z-10 ring-4 ${
                            index === 0 ? 'bg-primary ring-primary/20' : index === 1 ? 'bg-primary/60 ring-primary/10' : 'bg-primary/40 ring-primary/5'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-sm text-muted-foreground">{item.date}</p>
                              {index === 0 && (
                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs" style={{ fontWeight: 600 }}>
                                  Latest
                                </span>
                              )}
                            </div>
                            <p className="mt-2" style={{ fontWeight: 600, fontSize: '1.05rem' }}>{item.title}</p>
                            <p className="text-sm text-foreground/80 mt-2" style={{ lineHeight: 1.7 }}>
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                    setSelectedScore(sentimentRuns?.x?.overall_sentiment_0_to_10 || sentimentAggregate?.final_score_0_to_10 || tool.overall_score || 8.0);
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
                        {sentimentRuns?.x?.overall_sentiment_0_to_10?.toFixed(1) || sentimentAggregate?.final_score_0_to_10?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}
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
                    setSelectedScore(sentimentRuns?.reddit?.overall_sentiment_0_to_10 || sentimentAggregate?.final_score_0_to_10 || tool.overall_score || 8.0);
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
                        {sentimentRuns?.reddit?.overall_sentiment_0_to_10?.toFixed(1) || sentimentAggregate?.final_score_0_to_10?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}
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
                    setSelectedScore(sentimentRuns?.youtube?.overall_sentiment_0_to_10 || sentimentAggregate?.final_score_0_to_10 || tool.overall_score || 8.0);
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
                        {sentimentRuns?.youtube?.overall_sentiment_0_to_10?.toFixed(1) || sentimentAggregate?.final_score_0_to_10?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}
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
                          alt: `${tool.name} Interface`,
                          caption: "Clean, intuitive interface"
                        },
                        {
                          src: "https://images.unsplash.com/photo-1730206562928-0efd62560435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHRvb2xzfGVufDF8fHx8MTc2MzQwNzQ4M3ww&ixlib=rb-4.1.0&q=80&w=1080",
                          alt: `${tool.name} Features`,
                          caption: "Advanced features and capabilities"
                        },
                        {
                          src: "https://images.unsplash.com/photo-1763107228544-2ad5d71c21f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwcHJvZHVjdGl2aXR5JTIwYXBwfGVufDF8fHx8MTc2MzQ5MDgyNnww&ixlib=rb-4.1.0&q=80&w=1080",
                          alt: `${tool.name} in Action`,
                          caption: "Real-time workflow and collaboration"
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
                      alt={`${tool.name} Interface`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <p className="text-sm text-muted-foreground text-center" style={{ fontWeight: 500 }}>
                    Clean, intuitive interface
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
                      alt={`${tool.name} Features`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <p className="text-sm text-muted-foreground text-center" style={{ fontWeight: 500 }}>
                    Advanced features and capabilities
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
                      alt={`${tool.name} in Action`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <p className="text-sm text-muted-foreground text-center" style={{ fontWeight: 500 }}>
                    Real-time workflow and collaboration
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
                      const pricingTiers = pricingTiersToDisplay.length > 0 ? pricingTiersToDisplay.map(tier => ({
                        name: tier.name,
                        price: tier.price,
                        period: tier.description || (tier.price.toLowerCase().includes('free') ? 'Forever free' : tier.price.toLowerCase().includes('custom') ? 'Contact sales' : 'Per month'),
                        features: tier.features.length > 0 ? tier.features : ["Core features"],
                        valueRating: tier.valueRating || 'Good'
                      })) : [
                            {
                              name: tool.pricing_model || "Free",
                              price: tool.pricing_model === "Free" ? "Free" : tool.pricing_model === "Freemium" ? "Free" : "Custom",
                              period: tool.pricing_model === "Free" ? "Forever free" : tool.pricing_model === "Freemium" ? "Forever free" : "Contact sales",
                              features: ["Core features"],
                              valueRating: "Good"
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
                      {alternativesToDisplay.slice(0, 3).map((alt, index) => {
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
                            <div 
                              onClick={() => alt.slug && router.push(`/tool/${alt.slug}`)}
                              className="bg-card rounded-[20px] overflow-hidden border border-primary md:border-border/50 md:hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
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
                                {/* Header with logo, name, company, and score */}
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <ToolLogo 
                                      logoUrl={alt.logoUrl} 
                                      toolName={alt.name} 
                                      size="md"
                                      className="flex-shrink-0"
                                    />
                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                      <h3 className="text-xl" style={{ fontWeight: 600 }}>{alt.name}</h3>
                                      {alt.companyName && (
                                        <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                                          {alt.companyName}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <ScoreCircle score={alt.score} size={52} strokeWidth={5}  />
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
                  {alternativesToDisplay.slice(0, 3).map((alt, index) => (
                    <motion.div
                      key={alt.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => alt.slug && router.push(`/tool/${alt.slug}`)}
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
                        {/* Header with logo, name, company, and score */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <ToolLogo 
                              logoUrl={alt.logoUrl} 
                              toolName={alt.name} 
                              size="md"
                              className="flex-shrink-0"
                            />
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <h3 className="text-xl" style={{ fontWeight: 600 }}>{alt.name}</h3>
                              {alt.companyName && (
                                <p className="text-xs text-muted-foreground" style={{ fontWeight: 500 }}>
                                  {alt.companyName}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <ScoreCircle score={alt.score} size={52} strokeWidth={5}  />
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
        {!isAdmin && (
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
                  <ScoreCircle score={tool.overall_score || 0} size={96} strokeWidth={10} />
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
                    <div className="text-base" style={{ fontWeight: 700, color: "#6E7E55" }}>{sentimentAggregate?.final_score_0_to_10?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}</div>
                    <div className="text-xs text-muted-foreground">Sentiment</div>
                  </div>
                  <div className="text-center p-2 bg-card/60 rounded-[10px] border border-border/20">
                    <div className="text-base" style={{ fontWeight: 700, color: "#6E7E55" }}>{tool.domain_score?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}</div>
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
                  <span className="text-2xl" style={{ fontWeight: 600, color: "#6E7E55" }}>
                    {pricingTiersToDisplay.length > 0 ? pricingTiersToDisplay[0].price : (tool.pricing_model === "Free" ? "Free" : tool.pricing_model === "Freemium" ? "Free" : "Custom")}
                  </span>
                </div>
                {pricingTiersToDisplay.length > 1 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {pricingTiersToDisplay[1].name}: {pricingTiersToDisplay[1].price}
                  </div>
                )}
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
        )}
      </div>

      {/* Scores Detail Dialog */}
      <Dialog open={scoresDialogOpen} onOpenChange={setScoresDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-xl tracking-tight" style={{ fontWeight: 600 }}>Detailed Scores</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              In-depth breakdown of how {tool.name} performs across key metrics
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2.5 py-2">
            {/* Pinpoint Score - Featured at top center */}
            <div className="p-4 rounded-[16px] bg-primary/10 border-2 border-primary/30 text-center space-y-1">
              <p className="text-sm text-muted-foreground" style={{ fontWeight: 600 }}>Pinpoint Score</p>
              <p className="text-5xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>{tool.overall_score?.toFixed(1) || '8.0'}</p>
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
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>{sentimentRuns?.x?.overall_sentiment_0_to_10?.toFixed(1) || sentimentAggregate?.final_score_0_to_10?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}</p>
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
                <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>{tool.domain_score?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}</p>
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
              Comprehensive overview of {tool.name}'s pricing structure
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {pricingTiersToDisplay.length > 0 ? pricingTiersToDisplay.map((tier, index) => (
              <div key={tier.name}>
                {index > 0 && <div className="border-t border-border/30 mb-4" />}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ fontWeight: 500 }}>{tier.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tier.description || tier.features[0] || 'Core features'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl" style={{ fontWeight: 600, color: "#6E7E55" }}>{tier.price}</span>
                    {!tier.price.toLowerCase().includes('free') && !tier.price.toLowerCase().includes('custom') && (
                      <span className="text-sm text-muted-foreground"> / month</span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ fontWeight: 500 }}>{tool.pricing_model || 'Free'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Core features</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl" style={{ fontWeight: 600, color: "#6E7E55" }}>
                      {tool.pricing_model === "Free" ? "Free" : tool.pricing_model === "Freemium" ? "Free" : "Custom"}
                    </span>
                  </div>
                </div>
              </>
            )}
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
                      In-depth breakdown of how {tool.name} performs across key metrics
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
                    <p className="text-5xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>{tool.overall_score?.toFixed(1) || '8.0'}</p>
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
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>{sentimentRuns?.x?.overall_sentiment_0_to_10?.toFixed(1) || sentimentAggregate?.final_score_0_to_10?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}</p>
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
                    <p className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>{tool.domain_score?.toFixed(1) || tool.overall_score?.toFixed(1) || '8.0'}</p>
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
        onContactClick={() => setContactFormOpen(true)}
        compact={true}
      />

      {/* Contact Form Dialog */}
      {/* <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} /> */}

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