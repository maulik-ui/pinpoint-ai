"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface SentimentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'X' | 'Reddit' | 'YouTube';
  score: number;
}

const sentimentData = {
  X: {
    positive: 78,
    neutral: 15,
    negative: 7,
    quotes: [
      { text: "ChatGPT has completely transformed how I approach research and writing. Absolute game changer.", sentiment: "positive" },
      { text: "The responses are consistently accurate and helpful for coding tasks.", sentiment: "positive" },
      { text: "Best AI assistant I've used so far. The context awareness is genuinely impressive.", sentiment: "positive" },
      { text: "Has saved me countless hours on documentation and brainstorming sessions.", sentiment: "positive" },
      { text: "The UI is clean and intuitive, makes it very easy to get started.", sentiment: "positive" },
      { text: "Sometimes gives outdated information, but overall incredibly useful for daily work.", sentiment: "neutral" },
      { text: "Occasionally struggles with very niche technical questions in my field.", sentiment: "neutral" },
      { text: "Pricing is steep for heavy users, wish there were more flexible tier options.", sentiment: "negative" },
    ]
  },
  Reddit: {
    positive: 72,
    neutral: 18,
    negative: 10,
    quotes: [
      { text: "Using this daily for work. The quality of responses is consistently high and reliable.", sentiment: "positive" },
      { text: "GPT-4 is absolutely worth the upgrade if you use it regularly for complex tasks.", sentiment: "positive" },
      { text: "Great for learning new concepts, breaks things down in an accessible way.", sentiment: "positive" },
      { text: "More reliable than any other AI chatbot I've tried in the past year.", sentiment: "positive" },
      { text: "Performance has been solid overall, rarely see any significant downtime.", sentiment: "positive" },
      { text: "The free tier is decent but you hit the usage limits pretty quickly.", sentiment: "neutral" },
      { text: "The memory feature is useful but could definitely be more sophisticated.", sentiment: "neutral" },
      { text: "Sometimes it refuses to answer perfectly reasonable questions which is frustrating.", sentiment: "negative" },
      { text: "Wish there was better transparency around data usage and privacy policies.", sentiment: "negative" },
    ]
  },
  YouTube: {
    positive: 82,
    neutral: 12,
    negative: 6,
    quotes: [
      { text: "This tool has become essential to my daily workflow. Can't imagine going back now.", sentiment: "positive" },
      { text: "The natural language understanding is significantly better than any competitor.", sentiment: "positive" },
      { text: "Incredible for content creators and writers, genuinely speeds up everything.", sentiment: "positive" },
      { text: "The conversational ability feels genuinely intelligent and actually helpful.", sentiment: "positive" },
      { text: "Best investment I've made for productivity tools this entire year.", sentiment: "positive" },
      { text: "The learning curve is minimal, literally anyone can start using it immediately.", sentiment: "positive" },
      { text: "Impressive technology but the rate limiting can be quite annoying at times.", sentiment: "neutral" },
      { text: "Works great for most tasks but struggles with real-time information requests.", sentiment: "neutral" },
      { text: "Sometimes generates plausible-sounding but factually incorrect information.", sentiment: "negative" },
    ]
  }
};

export function SentimentPopup({ isOpen, onClose, platform, score }: SentimentPopupProps) {
  const data = sentimentData[platform];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-background rounded-3xl shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-muted/80 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
              </button>

              {/* Content */}
              <div className="p-4 md:p-12">
                {/* Score Section */}
                <div className="mb-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                    style={{ fontSize: '80px', fontWeight: 700, color: '#6E7E55', lineHeight: 0.9 }}
                  >
                    {score.toFixed(1)}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-muted-foreground mb-6"
                    style={{ fontSize: '16px', letterSpacing: '0.01em' }}
                  >
                    Community Sentiment from {platform}
                  </motion.div>

                  {/* Sentiment Summary */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-6 mb-8"
                  >
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Positive</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#6E7E55' }}>
                        {data.positive}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Neutral</div>
                      <div style={{ fontSize: '20px', fontWeight: 600 }} className="text-foreground/70">
                        {data.neutral}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Negative</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#b3623f' }}>
                        {data.negative}%
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Divider */}
                <div className="mb-8 h-px bg-border" />

                {/* Quotes Section - Moved Above Explanation */}
                <div className="space-y-5 mb-8 max-h-[380px] overflow-y-auto pr-3 scrollbar-custom">
                  {data.quotes.map((quote, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.04) }}
                      style={{
                        fontSize: '15px',
                        fontWeight: 500,
                        lineHeight: 1.7,
                        color: quote.sentiment === 'positive' 
                          ? '#6E7E55' 
                          : quote.sentiment === 'negative' 
                          ? '#b3623f' 
                          : undefined
                      }}
                      className={quote.sentiment === 'neutral' ? 'text-foreground/75' : ''}
                    >
                      "{quote.text}"
                    </motion.div>
                  ))}
                </div>

                {/* Combined Disclaimer - Below Quotes */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-muted-foreground/60 mt-8 pt-6 border-t border-border/50"
                  style={{ fontSize: '12px', lineHeight: 1.6 }}
                >
                  This score reflects aggregated community feedback from {platform}, analyzed across thousands of authentic discussions using AI analysis. We evaluate sentiment polarity, engagement patterns, and contextual relevance to calculate a weighted score. Sentiment scores are calculated from publicly available discussions and may not represent all user experiences. Scores are updated periodically and should be used as a general indicator rather than definitive assessment.
                </motion.p>
              </div>

              {/* Custom scrollbar styles */}
              <style>{`
                .scrollbar-custom::-webkit-scrollbar {
                  width: 6px;
                }
                .scrollbar-custom::-webkit-scrollbar-track {
                  background: transparent;
                }
                .scrollbar-custom::-webkit-scrollbar-thumb {
                  background: hsl(var(--muted-foreground) / 0.2);
                  border-radius: 10px;
                }
                .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                  background: hsl(var(--muted-foreground) / 0.3);
                }
              `}</style>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

