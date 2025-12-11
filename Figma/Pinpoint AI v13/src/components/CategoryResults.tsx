import { ArrowLeft, User } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import verifiedBadge from "figma:asset/d4269280a696e2a1f309e5b0b79398e3b636d9eb.png";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

interface CategoryResultsProps {
  categoryId: string;
  categoryName: string;
  onBack: () => void;
  onSelectTool: () => void;
}

export function CategoryResults({ categoryId, categoryName, onBack, onSelectTool }: CategoryResultsProps) {

  // Mock data for category tools - in production, this would filter by categoryId
  const categoryTools = [
    {
      id: '1',
      name: "ChatGPT",
      category: "Conversational AI",
      description: "Advanced language model for natural conversations and content creation with GPT-4 architecture",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
      logo: "https://images.unsplash.com/photo-1655635949384-f737c5133dfe?w=100&h=100&fit=crop",
      verified: true,
      rating: 9.4,
      pricing: "Freemium",
      trustScore: 95,
    },
    {
      id: '2',
      name: "Claude",
      category: "Conversational AI",
      description: "Constitutional AI assistant focused on helpfulness, harmlessness, and honesty",
      image: "https://images.unsplash.com/photo-1655635949384-f737c5133dfe?w=400",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
      verified: true,
      rating: 9.2,
      pricing: "Freemium",
      trustScore: 93,
    },
    {
      id: '3',
      name: "Jasper AI",
      category: "Writing Tools",
      description: "AI writing assistant for marketing copy, blog posts, and creative content",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
      logo: "https://images.unsplash.com/photo-1598662957477-64e573d80f4d?w=100&h=100&fit=crop",
      verified: true,
      rating: 8.8,
      pricing: "Subscription",
      trustScore: 89,
    },
    {
      id: '4',
      name: "Copy.ai",
      category: "Writing Tools",
      description: "Generate marketing copy and creative content with AI-powered templates",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
      logo: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=100&h=100&fit=crop",
      verified: true,
      rating: 8.6,
      pricing: "Freemium",
      trustScore: 87,
    },
    {
      id: '5',
      name: "GitHub Copilot",
      category: "Code Copilots",
      description: "AI pair programmer that suggests code and entire functions in real-time",
      image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400",
      logo: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=100&h=100&fit=crop",
      verified: true,
      rating: 9.1,
      pricing: "Subscription",
      trustScore: 92,
    },
    {
      id: '6',
      name: "Cursor",
      category: "Code Copilots",
      description: "AI-first code editor built for pair programming with AI",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
      logo: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=100&fit=crop",
      verified: true,
      rating: 8.9,
      pricing: "Freemium",
      trustScore: 90,
    },
    {
      id: '7',
      name: "Midjourney",
      category: "Image Generation",
      description: "Create stunning artwork and visuals from text descriptions",
      image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400",
      logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
      verified: true,
      rating: 9.3,
      pricing: "Subscription",
      trustScore: 94,
    },
    {
      id: '8',
      name: "DALL-E 3",
      category: "Image Generation",
      description: "Advanced AI image generator integrated with ChatGPT",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400",
      logo: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop",
      verified: true,
      rating: 9.0,
      pricing: "Subscription",
      trustScore: 91,
    },
    {
      id: '9',
      name: "Notion AI",
      category: "Productivity",
      description: "Intelligent writing assistant integrated into your workspace",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400",
      logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
      verified: true,
      rating: 8.7,
      pricing: "Subscription",
      trustScore: 88,
    },
    {
      id: '10',
      name: "Grammarly",
      category: "Writing Tools",
      description: "AI-powered writing assistant for grammar, spelling, and style",
      image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400",
      logo: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=100&fit=crop",
      verified: true,
      rating: 8.5,
      pricing: "Freemium",
      trustScore: 86,
    },
    {
      id: '11',
      name: "Runway ML",
      category: "Video Generation",
      description: "AI-powered video editing and generation platform",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400",
      logo: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop",
      verified: true,
      rating: 8.8,
      pricing: "Freemium",
      trustScore: 89,
    },
    {
      id: '12',
      name: "ElevenLabs",
      category: "Voice AI",
      description: "High-quality AI voice generation and cloning",
      image: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400",
      logo: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop",
      verified: true,
      rating: 9.2,
      pricing: "Freemium",
      trustScore: 93,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div onClick={onBack} className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
            <img src={pinpointLogo} alt="Pinpoint AI" className="w-10 h-10" />
            <span className="text-3xl tracking-tight hidden md:inline-block" style={{ fontWeight: 500 }}>Pinpoint AI</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse
            </button>
            <button
              className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              title="Account"
            >
              <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-20">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Categories</span>
          </button>
          
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl tracking-tight" style={{ fontWeight: 500 }}>
              {categoryName}
            </h1>
            <p className="text-muted-foreground text-lg">
              {categoryTools.length} tools • Sorted by ranking
            </p>
          </div>
        </div>

        {/* Tools Grid - All same size */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categoryTools.map((tool, index) => {
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group bg-card rounded-[20px] border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Content */}
                <div className="p-4 md:p-6 space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 md:gap-3 mb-3">
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        {/* Tool Logo */}
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-[12px] overflow-hidden flex-shrink-0 bg-secondary/30">
                          <ImageWithFallback
                            src={tool.logo}
                            alt={`${tool.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                          <h3 className="text-lg md:text-xl truncate" style={{ fontWeight: 600 }}>
                            {tool.name}
                          </h3>
                          {tool.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                          )}
                        </div>
                      </div>
                      {/* Overall Rating - Circular Progress with Animation */}
                      <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
                        <svg className="w-12 h-12 md:w-16 md:h-16 -rotate-90" viewBox="0 0 36 36">
                          {/* Background circle */}
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-secondary/30"
                          />
                          {/* Progress circle - Animated */}
                          <motion.circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="text-[#6E7E55]"
                            initial={{ strokeDasharray: "0 87.96" }}
                            animate={{ strokeDasharray: `${(tool.rating / 10) * 87.96} 87.96` }}
                            transition={{ 
                              delay: index * 0.1 + 0.3, 
                              duration: 1,
                              ease: "easeOut"
                            }}
                          />
                        </svg>
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                        >
                          <span className="text-sm md:text-base" style={{ fontWeight: 500 }}>
                            {tool.rating}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed" style={{ lineHeight: 1.6 }}>
                      {tool.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="pt-4 border-t border-border/30">
                    <span className="px-3 py-1.5 rounded-full text-sm bg-[#e8ebe4] text-[#4a5240] dark:bg-[#3a3d3a] dark:text-[#d4d4c8]">
                      {tool.pricing}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <button
            className="px-8 py-3 bg-secondary/50 hover:bg-secondary text-foreground rounded-[12px] transition-all duration-300"
            style={{ fontWeight: 500 }}
          >
            Load More Tools
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-12 bg-[#6E7E55]/10 border-t border-border/30 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-6 md:gap-12 mb-12">
            <div className="space-y-4 col-span-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <img src={pinpointLogo} alt="Pinpoint AI" className="w-5 h-5" />
                <span style={{ fontWeight: 500 }}>Pinpoint AI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your trusted guide to discovering the perfect AI tools for any task.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm" style={{ fontWeight: 500 }}>Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">All Tools</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Categories</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Popular</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm" style={{ fontWeight: 500 }}>Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Submit a Tool</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li>
                  <button
                    onClick={onBack}
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm" style={{ fontWeight: 500 }}>Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 Pinpoint AI. All rights reserved.</p>
            <p>Made with care for the AI community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
