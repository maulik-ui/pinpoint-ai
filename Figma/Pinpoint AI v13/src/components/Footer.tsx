import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";

interface FooterProps {
  onNavigate: (page: 'home' | 'about' | 'pricing' | 'privacy' | 'terms' | 'cookies') => void;
  onContactClick: () => void;
  compact?: boolean;
}

export function Footer({ onNavigate, onContactClick, compact = false }: FooterProps) {
  const paddingClass = compact ? "py-8" : "py-16";
  const marginClass = compact ? "mb-6" : "mb-12";

  return (
    <footer className={`px-4 md:px-8 ${paddingClass} bg-[#6E7E55]/10 border-t border-border/30 ${compact ? 'mt-12' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-3 md:grid-cols-4 gap-6 md:gap-12 ${marginClass}`}>
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
                  onClick={() => onNavigate('home')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  All Tools
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('home')}
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
                  onClick={() => onNavigate('about')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('pricing');
                    setTimeout(() => {
                      document.getElementById('founders')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Submit a Tool
                </button>
              </li>
              <li>
                <button
                  onClick={onContactClick}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
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
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cookies')}
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
  );
}