/**
 * Hamburger Menu Component
 * 
 * A dropdown menu in the top right corner with navigation options - Updated for Next.js
 */

"use client";

import { useState, useEffect } from 'react';
import { Menu, X, User, Grid3x3, PlusCircle, FileText, Mail, DollarSign, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Switch } from './ui/switch';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const menuItems = [
    { label: 'Account', icon: User, href: '/user' },
    { label: 'Browse', icon: Grid3x3, href: '/browse' },
    { label: 'Submit a Tool', icon: PlusCircle, href: '/submit-tool' },
    { label: 'Blog', icon: FileText, href: '/blog' },
    { label: 'Contact Us', icon: Mail, href: '#', onClick: () => {
      // Open contact form modal - you'll need to implement this
      setIsOpen(false);
    }},
    { label: 'Pricing', icon: DollarSign, href: '/pricing' },
  ];

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href && item.href !== '#') {
      router.push(item.href);
      setIsOpen(false);
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:opacity-70 transition-opacity"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" strokeWidth={2} />
        ) : (
          <Menu className="w-6 h-6 text-foreground" strokeWidth={2} />
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-56 bg-card rounded-[16px] shadow-lg border border-border/30 overflow-hidden z-50"
            >
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-sm" style={{ fontWeight: 500 }}>{item.label}</span>
                  </button>
                ))}

                {/* Divider */}
                <div className="my-2 border-t border-border/30" />

                {/* Dark Mode Toggle */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    ) : (
                      <Sun className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    )}
                    <span className="text-sm" style={{ fontWeight: 500 }}>Dark Mode</span>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

