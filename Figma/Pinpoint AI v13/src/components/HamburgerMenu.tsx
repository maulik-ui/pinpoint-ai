/**
 * Hamburger Menu Component
 * 
 * A dropdown menu in the top right corner with navigation options
 */

import { useState } from 'react';
import { Menu, X, User, Grid3x3, PlusCircle, FileText, Mail, DollarSign, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface HamburgerMenuProps {
  onNavigate: (page: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function HamburgerMenu({ onNavigate, isDarkMode, onToggleDarkMode }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Account', icon: User, page: 'user' },
    { label: 'Browse', icon: Grid3x3, page: 'categories' },
    { label: 'Submit a Tool', icon: PlusCircle, page: 'submit-tool' },
    { label: 'Blog', icon: FileText, page: 'blog' },
    { label: 'Contact Us', icon: Mail, page: 'contact' },
    { label: 'Pricing', icon: DollarSign, page: 'pricing' },
  ];

  const handleItemClick = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Hamburger Button - Just three lines, no background */}
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
                    onClick={() => handleItemClick(item.page)}
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
                    onCheckedChange={onToggleDarkMode}
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