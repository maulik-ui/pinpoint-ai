import { ArrowLeft, Heart, Users, Target, Sparkles, Search, CheckCircle2, Mail } from "lucide-react";
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import { motion } from "motion/react";
import { Navigation } from './Navigation';

interface AboutUsProps {
  onBack: () => void;
  onOpenContact: () => void;
  onNavigate?: (page: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function AboutUs({ onBack, onOpenContact, onNavigate, isDarkMode = false, onToggleDarkMode = () => {} }: AboutUsProps) {
  const values = [
    {
      icon: Target,
      title: "Human-Centered Curation",
      description: "Every tool is personally tested and reviewed by our team. We don't rely on algorithms alone. We add the human touch that makes all the difference."
    },
    {
      icon: Heart,
      title: "Quality Over Quantity",
      description: "We're not trying to list every AI tool ever made. We focus on the ones that truly matter, the ones that work, and the ones worth your time."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Built for makers, creators, and curious minds. Your feedback shapes our direction, and your success stories inspire us to keep going."
    },
    {
      icon: CheckCircle2,
      title: "Transparency Always",
      description: "No hidden agendas, no pay-to-win rankings. Our reviews are honest, our verification process is rigorous, and our community comes first."
    }
  ];

  const team = [
    {
      role: "Our Mission",
      description: "To be your trusted companion in the AI landscape, cutting through the noise, surfacing what matters, and helping you find tools that genuinely improve your work and life."
    },
    {
      role: "Our Vision",
      description: "A world where finding the right AI tool feels less like searching through a marketplace and more like getting a recommendation from a knowledgeable friend."
    },
    {
      role: "Our Approach",
      description: "We combine AI-powered search with meticulous human curation. Every tool listing includes sentiment analysis, verified reviews, and editorial notes, because context matters."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation 
        onBack={onBack}
        onNavigate={(page) => {
          if (page === 'contact') {
            onOpenContact();
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
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <img src={pinpointLogo} alt="Pinpoint AI" className="w-4 h-4" />
              <span className="text-sm text-primary" style={{ fontWeight: 500 }}>About Pinpoint AI</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ fontWeight: 500, lineHeight: 1.2 }}>
              A Boutique Library, <br />
              <span className="text-primary">Not a Marketplace</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
              We built Pinpoint AI because we were frustrated. There were dozens of AI tool directories, 
              but they all felt the same, overwhelming lists with no real guidance, no personality, no care.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 md:px-8 py-16 bg-accent/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 500 }}>
                Our Story
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed" style={{ lineHeight: 1.8 }}>
                <p>
                  Pinpoint AI started with a simple question: <em>"Why is it so hard to find a good AI tool?"</em>
                </p>
                <p>
                  Sure, there are thousands of AI tools out there. But which ones actually work? Which ones are worth paying for? 
                  Which ones will still be around in six months? Most directories just list everything and call it a day.
                </p>
                <p>
                  We wanted something different. Something that felt more like a trusted recommendation from a friend who's 
                  already done the research. A place where quality beats quantity, where every listing has been vetted, 
                  and where you can trust that the information is real.
                </p>
                <p>
                  So we built it. We test every tool ourselves. We read real user reviews. We track sentiment across communities. 
                  We verify features. We check pricing. And we write editorial notes to give you the context you need to make 
                  the right choice.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 500 }}>
                What We Believe
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
                These principles guide everything we do at Pinpoint AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    className="bg-card rounded-[20px] p-6 md:p-8 border border-border/30 hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl" style={{ fontWeight: 600 }}>
                          {value.title}
                        </h3>
                        <p className="text-sm text-foreground/70 leading-relaxed" style={{ lineHeight: 1.6 }}>
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission/Vision Section */}
      <section className="px-4 md:px-8 py-16 bg-accent/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="space-y-8"
          >
            {team.map((item, index) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="bg-card rounded-[20px] p-6 md:p-8 border border-border/30"
              >
                <h3 className="text-2xl mb-4 text-primary" style={{ fontWeight: 600 }}>
                  {item.role}
                </h3>
                <p className="text-foreground/80 leading-relaxed text-lg" style={{ lineHeight: 1.7 }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { number: "500+", label: "Curated Tools" },
              { number: "10K+", label: "Community Members" },
              { number: "25", label: "Categories" },
              { number: "100%", label: "Human Verified" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                className="text-center space-y-2"
              >
                <div className="text-4xl md:text-5xl text-primary" style={{ fontWeight: 600 }}>
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-gradient-to-b from-accent/5 to-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
            className="text-center space-y-8 bg-card rounded-[24px] p-8 md:p-12 border border-border/30"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontWeight: 500 }}>
                Want to Get Involved?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
                We're always looking for feedback, suggestions, and stories from our community. 
                Whether you've found the perfect tool or think we're missing something important, we'd love to hear from you.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onOpenContact}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-[12px] hover:bg-primary/90 transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                style={{ fontWeight: 500 }}
              >
                <Mail className="w-4 h-4" />
                Get in Touch
              </button>
              <button
                onClick={onBack}
                className="px-8 py-3 bg-primary/10 text-primary rounded-[12px] hover:bg-primary/20 transition-all duration-300"
                style={{ fontWeight: 500 }}
              >
                Explore Tools
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-12 bg-[#6E7E55]/10 border-t border-border/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={pinpointLogo} alt="Pinpoint AI" className="w-5 h-5" />
            <span style={{ fontWeight: 500 }}>Pinpoint AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with care for the AI community
          </p>
        </div>
      </footer>
    </div>
  );
}