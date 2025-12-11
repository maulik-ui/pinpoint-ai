import { useState } from "react";
import { CheckCircle2, Filter, X, User } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ContactForm } from "./ContactForm";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";

interface SearchResultsProps {
  query: string;
  onBack: () => void;
  onSelectTool: () => void;
  onNavigate: (page: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function SearchResults({ query, onBack, onSelectTool, onNavigate, isDarkMode = false, onToggleDarkMode = () => {} }: SearchResultsProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [contactFormOpen, setContactFormOpen] = useState(false);

  const filters = [
    { id: "free", label: "Free" },
    { id: "freemium", label: "Freemium" },
    { id: "paid", label: "Paid" },
    { id: "verified", label: "Verified Only" },
  ];

  const categories = [
    { id: "writing", label: "Writing" },
    { id: "design", label: "Design" },
    { id: "productivity", label: "Productivity" },
  ];

  const topTools = [
    {
      name: "ChatGPT",
      description: "Advanced conversational AI that understands context and generates human-like responses",
      score: 8.7,
      matchScore: 10,
      pricing: "Freemium",
      category: "Conversational AI",
      verified: true,
      logo: "https://images.unsplash.com/photo-1761223956832-a1e341babb92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGF0R1BUJTIwbG9nbyUyMEFJfGVufDF8fHx8MTc2MzUzMzQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Jasper",
      description: "AI writing assistant designed for marketing content and copywriting at scale",
      score: 8.3,
      matchScore: 9,
      pricing: "Subscription",
      category: "Writing & Content",
      verified: true,
      logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2glMjBsb2dvfGVufDF8fHx8MTc2MzUzMzQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Copy.ai",
      description: "Quick AI content generation for blogs, social media, and marketing materials",
      score: 8.1,
      matchScore: 9,
      pricing: "Freemium",
      category: "Writing & Content",
      verified: true,
      logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2glMjBsb2dvfGVufDF8fHx8MTc2MzUzMzQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const otherTools = [
    {
      name: "Notion AI",
      description: "AI-powered workspace for notes, docs, and collaboration",
      score: 8.5,
      matchScore: 8,
      pricing: "Freemium",
      logo: "https://images.unsplash.com/photo-1683114010575-3ead4403180e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOb3Rpb24lMjBsb2dvJTIwYXBwfGVufDF8fHx8MTc2MzUzMzQ0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Writesonic",
      description: "AI writing tool for articles, ads, and product descriptions",
      score: 7.9,
      matchScore: 8,
      pricing: "Freemium",
      logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2glMjBsb2dvfGVufDF8fHx8MTc2MzUzMzQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Rytr",
      description: "Affordable AI writing assistant for various content types",
      score: 7.6,
      matchScore: 7,
      pricing: "Freemium",
      logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2glMjBsb2dvfGVufDF8fHx8MTc2MzUzMzQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Wordtune",
      description: "AI writing companion that helps you rewrite and improve your text",
      score: 7.8,
      matchScore: 7,
      pricing: "Freemium",
      logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2glMjBsb2dvfGVufDF8fHx8MTc2MzUzMzQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Grammarly",
      description: "AI-powered writing assistant for grammar, spelling, and style",
      score: 8.4,
      matchScore: 6,
      pricing: "Freemium",
      logo: "https://images.unsplash.com/photo-1613905383527-8994ba2f9896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHcmFtbWFybHklMjBsb2dvfGVufDF8fHx8MTc2MzUzMzQ0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "QuillBot",
      description: "Paraphrasing and writing enhancement tool powered by AI",
      score: 7.7,
      matchScore: 6,
      pricing: "Freemium",
      logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2glMjBsb2dvfGVufDF8fHx8MTc2MzUzMzQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
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

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        {/* Query Title Section */}
        <section className="py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h1 className="text-3xl tracking-tight" style={{ fontWeight: 600 }}>
              Results for <span className="text-primary">'{query}'</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
              AI-powered search combined with human curation to find the perfect tools for your needs
            </p>
          </motion.div>
        </section>

        {/* Top Recommended Tools Section */}
        <section className="py-8">
          <h2 className="text-2xl tracking-tight mb-8" style={{ fontWeight: 600 }}>
            Top Recommended
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topTools.map((tool, index) => {
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={onSelectTool}
                  className="group bg-card rounded-[20px] border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Match Score at Top - Centered */}
                    <div className="flex justify-center">
                      <div className="text-xs px-2.5 py-1 bg-primary/15 text-primary rounded-full" style={{ fontWeight: 500 }}>
                        {tool.matchScore}/10 match
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Tool Logo */}
                          <div className="w-16 h-16 rounded-[12px] overflow-hidden flex-shrink-0 bg-secondary/30">
                            <ImageWithFallback
                              src={tool.logo}
                              alt={`${tool.name} logo`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl" style={{ fontWeight: 600 }}>
                              {tool.name}
                            </h3>
                            {tool.verified && (
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                            )}
                          </div>
                        </div>
                        {/* Overall Rating - Circular Progress with Animation */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
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
                              animate={{ strokeDasharray: `${(tool.score / 10) * 87.96} 87.96` }}
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
                            <span className="text-base" style={{ fontWeight: 500 }}>
                              {tool.score}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-foreground/80 leading-relaxed mb-3" style={{ lineHeight: 1.6 }}>
                        {tool.description}
                      </p>
                    </div>

                    {/* Category Badge */}
                    <div>
                      <span className="px-3 py-1.5 bg-secondary/40 rounded-full text-xs">
                        {tool.category}
                      </span>
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
        </section>

        {/* AI Reasoning Box */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="py-8"
        >
          <div className="bg-secondary/30 rounded-[20px] p-8">
            <h3 className="text-xl tracking-tight mb-4" style={{ fontWeight: 600 }}>
              Why these tools?
            </h3>
            <p className="text-foreground/80" style={{ lineHeight: 1.8 }}>
              These recommendations are ranked using a combination of{" "}
              <span style={{ fontWeight: 500 }}>community sentiment</span> across platforms,{" "}
              <span style={{ fontWeight: 500 }}>market traction</span>,{" "}
              <span style={{ fontWeight: 500 }}>feature accuracy</span> (claims vs. reality),{" "}
              <span style={{ fontWeight: 500 }}>pricing fairness</span>, and{" "}
              <span style={{ fontWeight: 500 }}>human verification</span>. We prioritize tools that 
              deliver real value and match your specific needs.
            </p>
          </div>
        </motion.section>

        {/* Other Tools You May Like */}
        <section className="py-8">
          <h2 className="text-2xl tracking-tight mb-8" style={{ fontWeight: 600 }}>
            Other Tools You May Like
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {otherTools.map((tool, index) => {
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                  className="bg-card rounded-[16px] p-6 shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer relative group"
                >
                  <div 
                    onClick={onSelectTool}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ImageWithFallback 
                          src={tool.logo} 
                          alt={`${tool.name} logo`}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <h4 className="text-lg tracking-tight" style={{ fontWeight: 600 }}>
                          {tool.name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {tool.pricing}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary rounded-full" style={{ fontWeight: 500 }}>
                          {tool.matchScore}/10 match
                        </span>
                      </div>
                      <p className="text-sm text-foreground/70" style={{ lineHeight: 1.6 }}>
                        {tool.description}
                      </p>
                    </div>
                    {/* Circular Score Bar */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
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
                          animate={{ strokeDasharray: `${(tool.score / 10) * 87.96} 87.96` }}
                          transition={{ 
                            delay: 0.5 + index * 0.05 + 0.3, 
                            duration: 1,
                            ease: "easeOut"
                          }}
                        />
                      </svg>
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 + 0.5, duration: 0.3 }}
                      >
                        <span className="text-base" style={{ fontWeight: 500 }}>
                          {tool.score}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Category Insights Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="py-8"
        >
          <div className="bg-secondary/30 rounded-[20px] p-10">
            <h2 className="text-2xl tracking-tight mb-6" style={{ fontWeight: 600 }}>
              Insights on AI Writing Tools
            </h2>
            <div className="space-y-4 text-foreground/85" style={{ lineHeight: 1.8 }}>
              <p>
                The AI writing space has evolved dramatically in 2025. What started as simple text completion 
                has transformed into sophisticated tools that understand context, tone, and audience. The best 
                tools now combine powerful language models with intuitive interfaces and specialized features.
              </p>
              <p>
                <span style={{ fontWeight: 600 }}>Key trends:</span> We're seeing a shift toward more 
                specialized tools rather than one-size-fits-all solutions. Marketing-focused tools like Jasper 
                excel at brand voice consistency, while conversational AI like ChatGPT shines in versatility. 
                Pricing models are stabilizing, with most offering generous free tiers.
              </p>
              <p>
                <span style={{ fontWeight: 600 }}>What to consider:</span> Look beyond the hype. The highest-rated 
                tools aren't always the most expensive. Community sentiment strongly favors tools with transparent 
                pricing, reliable output, and responsive support. Feature accuracy matters—many tools overpromise 
                on capabilities they can't consistently deliver.
              </p>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <Footer 
        onNavigate={onNavigate} 
        onContactClick={() => setContactFormOpen(true)}
      />

      {/* Contact Form Dialog */}
      <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
    </div>
  );
}