import { User, Shield, Lock, Eye, Cookie, Database, FileText, Mail, ArrowLeft } from "lucide-react";
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import { motion } from "framer-motion";
import { Navigation } from './Navigation';

interface PrivacyPolicyProps {
  onBack: () => void;
  onNavigateToAccount: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToCookies?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToCategories?: () => void;
  onOpenContact?: () => void;
  onNavigate?: (page: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function PrivacyPolicy({ onBack, onNavigateToAccount, onNavigateToTerms, onNavigateToCookies, onNavigateToPricing, onNavigateToAbout, onNavigateToCategories, onOpenContact, onNavigate, isDarkMode = false, onToggleDarkMode = () => {} }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation 
        onBack={onBack}
        onNavigate={(page) => {
          if (page === 'contact') {
            onOpenContact?.();
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
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full mb-4">
              <Shield className="w-5 h-5 text-primary" strokeWidth={2} />
              <span className="text-sm text-primary" style={{ fontWeight: 500 }}>Your Privacy Matters</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ fontWeight: 600, lineHeight: 1.2 }}>
              Privacy Policy
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
              We're committed to protecting your personal information and being transparent about our data practices.
            </p>
            
            <p className="text-sm text-muted-foreground">
              Last updated: December 3rd, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-4 md:px-8 py-8 bg-accent/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Secure Storage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Industry-standard encryption and security measures</p>
            </div>
            
            <div className="bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Full Transparency</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Clear information about what we collect and why</p>
            </div>
            
            <div className="bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Minimal Data</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">We only collect what's necessary to serve you</p>
            </div>
          </motion.div>
          
          <div className="bg-card rounded-[20px] p-8 border border-border/30">
            <p className="text-foreground/85 mb-4" style={{ lineHeight: 1.8 }}>
              Pinpoint AI is a curated platform that helps users discover, evaluate, and track artificial intelligence tools. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and the choices you have.
            </p>
            <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
              Pinpoint AI is operated by <span style={{ fontWeight: 500 }}>Module Creative LLC</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 pb-20">
        {/* Content Sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              1. Information We Collect
            </h2>
            
            <div className="space-y-6 pl-4">
              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  1.1 Information You Provide Directly
                </h3>
                <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                  We may collect information that you voluntarily provide when interacting with the site, including:
                </p>
                <ul className="space-y-2 text-foreground/85 pl-6">
                  <li style={{ lineHeight: 1.8 }}>• Information submitted through contact forms or email, such as your name and email address.</li>
                  <li style={{ lineHeight: 1.8 }}>• Information submitted by tool creators during listing or recheck requests, such as product details, URLs, and feature documentation.</li>
                </ul>
                <p className="text-foreground/85 mt-3" style={{ lineHeight: 1.8 }}>
                  <span style={{ fontWeight: 500 }}>Pinpoint AI does not collect login information, passwords, or sensitive personal data.</span>
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              2. Information Collected Automatically
            </h2>
            
            <div className="space-y-6 pl-4">
              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  2.1 Google Analytics
                </h3>
                <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                  Pinpoint AI uses Google Analytics to understand website usage and improve user experience. This includes:
                </p>
                <ul className="space-y-2 text-foreground/85 pl-6">
                  <li style={{ lineHeight: 1.8 }}>• Device type</li>
                  <li style={{ lineHeight: 1.8 }}>• Browser</li>
                  <li style={{ lineHeight: 1.8 }}>• Pages visited</li>
                  <li style={{ lineHeight: 1.8 }}>• Time spent on the site</li>
                  <li style={{ lineHeight: 1.8 }}>• Geographic region at a general level</li>
                </ul>
                <p className="text-foreground/85 mt-3" style={{ lineHeight: 1.8 }}>
                  Google Analytics may use cookies to track activity across sessions.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  2.2 Cookies
                </h3>
                <p className="text-foreground/85 mb-2" style={{ lineHeight: 1.8 }}>
                  Pinpoint AI does not use additional cookies beyond those required by Google Analytics.
                </p>
                <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                  We do not use cookies for advertising, behavioral profiling, or retargeting.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              3. How We Use Your Information
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                We use collected information to:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6">
                <li style={{ lineHeight: 1.8 }}>• Improve and optimize the website</li>
                <li style={{ lineHeight: 1.8 }}>• Evaluate traffic patterns for internal analytics</li>
                <li style={{ lineHeight: 1.8 }}>• Process tool submission and recheck requests</li>
                <li style={{ lineHeight: 1.8 }}>• Communicate with users who contact us</li>
                <li style={{ lineHeight: 1.8 }}>• Maintain platform security and prevent improper use</li>
              </ul>
              <p className="text-foreground/85 mt-4" style={{ lineHeight: 1.8 }}>
                <span style={{ fontWeight: 500 }}>We do not sell, rent, or share personal information with third parties for marketing purposes.</span>
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              4. How We Store and Protect Your Information
            </h2>
            
            <div className="pl-4">
              <ul className="space-y-2 text-foreground/85 pl-6">
                <li style={{ lineHeight: 1.8 }}>• Your contact form submissions are stored securely.</li>
                <li style={{ lineHeight: 1.8 }}>• Access is restricted to authorized personnel.</li>
                <li style={{ lineHeight: 1.8 }}>• We use industry standard technical and organizational security measures.</li>
                <li style={{ lineHeight: 1.8 }}>• No payment information is stored on our servers. Payments, if applicable, are handled by secure third-party processors.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              5. Children's Privacy
            </h2>
            
            <div className="pl-4 space-y-2 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                Pinpoint AI is intended for users in the United States who are 13 years or older.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                We do not knowingly collect or store information from children under 13.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                If you believe a child has provided us with personal data, contact us at <a href="mailto:human@pinpointai.tools" className="text-primary hover:underline">human@pinpointai.tools</a> and we will delete it.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              6. Third Party Services
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                Pinpoint AI may integrate with or link to third-party services, such as:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6">
                <li style={{ lineHeight: 1.8 }}>• Google Analytics</li>
                <li style={{ lineHeight: 1.8 }}>• External AI tools listed in the directory</li>
                <li style={{ lineHeight: 1.8 }}>• Payment processors for tool listing subscriptions</li>
              </ul>
              <p className="text-foreground/85 mt-4" style={{ lineHeight: 1.8 }}>
                These services have their own privacy policies. We encourage you to review them separately.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              7. Your Choices and Rights
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                Depending on your location, you may have rights to:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6">
                <li style={{ lineHeight: 1.8 }}>• Request access to data you have provided</li>
                <li style={{ lineHeight: 1.8 }}>• Request deletion of personal information</li>
                <li style={{ lineHeight: 1.8 }}>• Opt out of non essential data tracking</li>
                <li style={{ lineHeight: 1.8 }}>• Contact us to update any inaccurate information</li>
              </ul>
              <p className="text-foreground/85 mt-4" style={{ lineHeight: 1.8 }}>
                To exercise any of these rights, email us at <a href="mailto:human@pinpointai.tools" className="text-primary hover:underline">human@pinpointai.tools</a>.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              8. Data Retention
            </h2>
            
            <div className="pl-4 space-y-2 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                We retain contact form submissions and tool listing data only as long as needed for operational purposes or legal requirements.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                Google Analytics data follows Google's retention settings.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              9. International Users
            </h2>
            
            <div className="pl-4 space-y-2 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                Pinpoint AI is primarily intended for users in the United States.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                If you are accessing from outside the US, you understand your information may be processed in the United States.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              10. Updates to This Privacy Policy
            </h2>
            
            <div className="pl-4 space-y-2 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                We may update this Privacy Policy from time to time.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                Updates will be posted on this page with a revised date.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                Continued use of the site means you accept the updated policy.
              </p>
            </div>
          </section>

          {/* Section 11 - Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              11. Contact Us
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                If you have questions about this Privacy Policy or our data practices, contact us:
              </p>
              <div className="p-6 bg-secondary/30 rounded-[16px] space-y-2">
                <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                  <span style={{ fontWeight: 500 }}>Email:</span> <a href="mailto:human@pinpointai.tools" className="text-primary hover:underline">human@pinpointai.tools</a>
                </p>
                <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                  <span style={{ fontWeight: 500 }}>Website:</span> <a href="https://pinpointai.tools" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://pinpointai.tools</a>
                </p>
              </div>
            </div>
          </section>
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
                <li>
                  <button 
                    onClick={onBack}
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    All Tools
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onNavigateToCategories || onBack}
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    Categories
                  </button>
                </li>
                <li><a href="#" className="hover:text-foreground transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Popular</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm" style={{ fontWeight: 500 }}>Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={onNavigateToAbout || onBack}
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (onNavigateToPricing) {
                        onNavigateToPricing();
                        setTimeout(() => {
                          document.getElementById('founders')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      } else {
                        onBack();
                      }
                    }}
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    Submit a Tool
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenContact || (() => {})}
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    Contact
                  </button>
                </li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li>
                  <button
                    onClick={onNavigateToPricing || onBack}
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
                <li>
                  <span className="text-foreground" style={{ fontWeight: 500 }}>Privacy Policy</span>
                </li>
                <li>
                  <button 
                    onClick={onNavigateToTerms || onBack} 
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onNavigateToCookies || onBack} 
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    Cookie Policy
                  </button>
                </li>
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