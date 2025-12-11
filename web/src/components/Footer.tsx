"use client";

import Link from "next/link";
import Logo from "./Logo";

interface FooterProps {
  onNavigate?: (page: 'home' | 'about' | 'pricing' | 'privacy' | 'terms' | 'cookies') => void;
  onContactClick?: () => void;
  compact?: boolean;
}

export function Footer({ onNavigate, onContactClick, compact = false }: FooterProps) {
  const paddingClass = compact ? "py-8" : "py-16";
  const marginClass = compact ? "mb-6" : "mb-12";

  const handleSubmitTool = () => {
    if (onNavigate) {
      onNavigate('submit-tool');
    }
  };

  return (
    <footer className={`px-4 md:px-8 ${paddingClass} bg-[#6E7E55]/10 border-t border-border/30 ${compact ? 'mt-12' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-3 md:grid-cols-4 gap-6 md:gap-12 ${marginClass}`}>
          <div className="space-y-4 col-span-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" />
              <span style={{ fontWeight: 500 }}>Pinpoint AI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted guide to discovering the perfect AI tools for any task.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm" style={{ fontWeight: 500 }}>Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  All Tools
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li><a href="#" className="hover:text-foreground transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Popular</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm" style={{ fontWeight: 500 }}>Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/submit-tool" className="hover:text-foreground transition-colors">
                  Submit a Tool
                </Link>
              </li>
              <li>
                {onContactClick ? (
                  <button
                    onClick={onContactClick}
                    className="hover:text-foreground transition-colors cursor-pointer text-left"
                  >
                    Contact
                  </button>
                ) : (
                  <a href="mailto:human@pinpointai.tools" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                )}
              </li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm" style={{ fontWeight: 500 }}>Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
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

