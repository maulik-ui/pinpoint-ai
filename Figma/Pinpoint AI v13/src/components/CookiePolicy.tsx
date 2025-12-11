import { User, Cookie, Settings, Info, CheckCircle2, XCircle } from "lucide-react";
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import { motion } from "framer-motion";
import { Navigation } from './Navigation';

interface CookiePolicyProps {
  onBack: () => void;
  onNavigateToAccount: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToCategories?: () => void;
  onOpenContact?: () => void;
  onNavigate?: (page: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function CookiePolicy({ onBack, onNavigateToAccount, onNavigateToPrivacy, onNavigateToTerms, onNavigateToPricing, onNavigateToAbout, onNavigateToCategories, onOpenContact, onNavigate, isDarkMode = false, onToggleDarkMode = () => {} }: CookiePolicyProps) {
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
              <Cookie className="w-5 h-5 text-primary" strokeWidth={2} />
              <span className="text-sm text-primary" style={{ fontWeight: 500 }}>Simple & Transparent</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ fontWeight: 600, lineHeight: 1.2 }}>
              Cookie Policy
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
              We use a minimal set of cookies
            </p>
            
            <p className="text-sm text-muted-foreground">
              Last Updated: December 3rd, 2025
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
                <CheckCircle2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Essential Only</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Only analytics cookies, nothing more</p>
            </div>
            
            <div className="bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>No Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Zero advertising or behavioral profiling</p>
            </div>
            
            <div className="bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Your Control</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Easy to disable via browser settings</p>
            </div>
          </motion.div>
          
          <div className="bg-card rounded-[20px] p-8 border border-border/30">
            <p className="text-foreground/85 mb-4" style={{ lineHeight: 1.8 }}>
              Pinpoint AI uses cookies to help us understand how visitors use our website and to improve overall performance. This Cookie Policy explains what cookies we use, what information they collect, and how you can manage them.
            </p>
            <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
              Pinpoint AI is operated by <span style={{ fontWeight: 500 }}>Module Creative LLC</span>.
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
              1. What Are Cookies
            </h2>
            
            <div className="pl-4 space-y-3 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                Cookies are small text files placed on your device when you visit a website. They help provide essential functionality and improve the user experience.
              </p>
              <p style={{ lineHeight: 1.8, fontWeight: 500 }}>
                Pinpoint AI uses a very minimal set of cookies.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              2. Types of Cookies We Use
            </h2>
            
            <div className="space-y-6 pl-4">
              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  2.1 Analytics Cookies
                </h3>
                <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                  Pinpoint AI uses Google Analytics to understand general website usage. These cookies help us learn:
                </p>
                <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                  <li style={{ lineHeight: 1.8 }}>• How visitors navigate the site</li>
                  <li style={{ lineHeight: 1.8 }}>• What pages are viewed</li>
                  <li style={{ lineHeight: 1.8 }}>• Time spent on the site</li>
                  <li style={{ lineHeight: 1.8 }}>• Device and browser information</li>
                  <li style={{ lineHeight: 1.8 }}>• General region information (non-precise)</li>
                </ul>
                <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                  These cookies do not identify you personally.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  2.2 No Advertising or Tracking Cookies
                </h3>
                <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                  Pinpoint AI does not use:
                </p>
                <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                  <li style={{ lineHeight: 1.8 }}>• Advertising cookies</li>
                  <li style={{ lineHeight: 1.8 }}>• Behavioral tracking cookies</li>
                  <li style={{ lineHeight: 1.8 }}>• Third party marketing cookies</li>
                  <li style={{ lineHeight: 1.8 }}>• Retargeting or profiling cookies</li>
                </ul>
                <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                  We only use the default analytics cookies required for Google Analytics to function.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  2.3 Strictly Necessary Cookies
                </h3>
                <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                  If used, these support core site functionality such as basic security or session stability. Pinpoint AI does not use optional or unnecessary cookies.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              3. How We Use Cookie Information
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                Cookie data helps us:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                <li style={{ lineHeight: 1.8 }}>• Improve website performance and layout</li>
                <li style={{ lineHeight: 1.8 }}>• Understand traffic patterns</li>
                <li style={{ lineHeight: 1.8 }}>• Enhance content and navigation</li>
                <li style={{ lineHeight: 1.8 }}>• Identify technical issues</li>
              </ul>
              <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                We do not use cookie information for advertising, selling data, or profiling users.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              4. Managing Cookies
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-4" style={{ lineHeight: 1.8 }}>
                You can manage or disable cookies through your browser settings.
              </p>
              
              <div className="mb-4">
                <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                  Popular browser links:
                </p>
                <ul className="space-y-2 text-foreground/85 pl-6">
                  <li style={{ lineHeight: 1.8 }}>
                    • <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chrome</a>
                  </li>
                  <li style={{ lineHeight: 1.8 }}>
                    • <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a>
                  </li>
                  <li style={{ lineHeight: 1.8 }}>
                    • <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firefox</a>
                  </li>
                  <li style={{ lineHeight: 1.8 }}>
                    • <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Edge</a>
                  </li>
                </ul>
              </div>

              <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                Disabling cookies may limit certain analytics insights but will not prevent you from using the site.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              5. Third Party Cookies
            </h2>
            
            <div className="pl-4 space-y-3 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                The only third party cookies used on Pinpoint AI are those from Google Analytics.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                We do not embed other trackers, pixels, or marketing scripts.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                You can learn more about Google's cookie usage here:{" "}
                <a 
                  href="https://policies.google.com/technologies/cookies" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  Google Privacy and Terms page
                </a>.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              6. Updates to This Cookie Policy
            </h2>
            
            <div className="pl-4 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                We may update this policy when we change technologies or expand our features. Updates will be posted on this page with a new date.
              </p>
            </div>
          </section>

          {/* Section 7 - Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              7. Contact Us
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                If you have questions about cookies or data on Pinpoint AI, contact us:
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
                  <button 
                    onClick={onNavigateToPrivacy || onBack} 
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
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
                  <span className="text-foreground" style={{ fontWeight: 500 }}>Cookie Policy</span>
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