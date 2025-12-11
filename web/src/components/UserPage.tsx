"use client";

/**
 * User Profile and Membership Page
 * 
 * Displays user profile, current plan, and membership management options.
 * Includes a sidebar for navigation between profile sections.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Settings, Bookmark, CreditCard, ChevronLeft, 
  Check, Crown, Package, Calendar
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SavedTools } from './SavedTools';
import { useCurrentUserPlan, useFounderStatus } from '../hooks/useBilling';
import { USER_PLANS, FOUNDER_PRODUCTS } from '../lib/billing/plans';
import { createClient } from '@/src/lib/supabaseClientBrowser';
import Link from 'next/link';
import Logo from './Logo';

interface UserPageProps {
  onBack?: () => void;
  onSelectTool?: (toolId: string) => void;
}

type TabType = 'profile' | 'membership' | 'saved' | 'settings';

export function UserPage({ onBack, onSelectTool }: UserPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('membership');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userProfile, currentPlan, isPremium, isFree } = useCurrentUserPlan();
  const { isFounder, listedTools } = useFounderStatus();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (!mounted) return;
      
      // Handle refresh token errors
      if (sessionError) {
        if (sessionError.message?.includes('Refresh Token') || sessionError.message?.includes('refresh_token')) {
          supabase.auth.signOut({ scope: 'local' });
        }
        router.push("/api/auth/signin?redirect=" + encodeURIComponent("/user"));
        return;
      }
      
      if (!session?.user) {
        router.push("/api/auth/signin?redirect=" + encodeURIComponent("/user"));
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      if (!session?.user) {
        router.push("/api/auth/signin?redirect=" + encodeURIComponent("/user"));
        setUser(null);
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'membership' as TabType, label: 'Membership', icon: CreditCard },
    { id: 'saved' as TabType, label: 'Saved Tools', icon: Bookmark },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-8 py-6 max-w-7xl mx-auto border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <Logo size="md" />
                <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>Pinpoint AI</span>
              </Link>
            )}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                  }`}
                  style={{ fontWeight: activeTab === tab.id ? 500 : 400 }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="bg-card rounded-[24px] border border-border/50 shadow-sm min-h-[600px]">
            {activeTab === 'profile' && <ProfileTab userProfile={userProfile || user} />}
            {activeTab === 'membership' && (
              <MembershipTab 
                currentPlan={currentPlan} 
                isPremium={isPremium}
                isFree={isFree}
                isFounder={isFounder}
                listedTools={listedTools}
              />
            )}
            {activeTab === 'saved' && <SavedTools onSelectTool={onSelectTool} />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ userProfile }: { userProfile: any }) {
  const displayName = userProfile?.displayName || 
    userProfile?.user_metadata?.full_name || 
    userProfile?.email?.split("@")[0] || 
    'User Name';
  
  const email = userProfile?.email || userProfile?.user?.email || '';
  const createdAt = userProfile?.createdAt || userProfile?.created_at || new Date();

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Profile</h2>
      
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg mb-1" style={{ fontWeight: 500 }}>
              {displayName}
            </h3>
            <p className="text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4 pt-6 border-t border-border/30">
          <div>
            <label className="text-sm text-muted-foreground">Display Name</label>
            <input
              type="text"
              defaultValue={displayName}
              placeholder="Enter your name"
              className="w-full mt-1.5 px-4 py-2.5 bg-background rounded-[12px] border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              type="email"
              defaultValue={email}
              disabled
              className="w-full mt-1.5 px-4 py-2.5 bg-muted rounded-[12px] border border-border text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Member Since</label>
            <p className="mt-1.5 text-foreground">
              {new Date(createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="pt-6">
          <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all" style={{ fontWeight: 500 }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Membership Tab Component
function MembershipTab({ currentPlan, isPremium, isFree, isFounder, listedTools }: any) {
  return (
    <div className="p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Membership</h2>

      {/* Current Plan */}
      <div className="mb-8">
        <h3 className="text-lg mb-4" style={{ fontWeight: 500 }}>Current Plan</h3>
        <div className={`p-6 rounded-[16px] border-2 ${
          isPremium ? 'bg-primary/5 border-primary' : 'border-border/50 bg-secondary/20'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl" style={{ fontWeight: 500 }}>
                  {currentPlan?.name || 'Free'}
                </h4>
                {isPremium && <Crown className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-muted-foreground">{currentPlan?.description}</p>
            </div>
            <div className="text-right">
              {isPremium ? (
                <>
                  <p className="text-2xl" style={{ fontWeight: 500 }}>${currentPlan?.price}</p>
                  <p className="text-sm text-muted-foreground">
                    /{currentPlan?.billingCycle === 'yearly' ? 'year' : 'month'}
                  </p>
                </>
              ) : (
                <p className="text-2xl" style={{ fontWeight: 500 }}>Free</p>
              )}
            </div>
          </div>

          {/* Plan Features Preview */}
          <div className="space-y-2 mb-4">
            {currentPlan?.features?.slice(0, 3).map((feature: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-foreground/85">{feature}</span>
              </div>
            ))}
            {currentPlan && currentPlan.features && currentPlan.features.length > 3 && (
              <p className="text-sm text-muted-foreground pl-6">
                +{currentPlan.features.length - 3} more features
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/30">
            {isFree && (
              <Link
                href="/pricing"
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all text-center"
                style={{ fontWeight: 500 }}
              >
                Upgrade to Premium
              </Link>
            )}
            {isPremium && (
              <>
                <button className="px-6 py-2.5 border-2 border-border rounded-full hover:bg-accent/20 transition-all" style={{ fontWeight: 500 }}>
                  Manage Billing
                </button>
                <button className="px-6 py-2.5 border-2 border-destructive/30 text-destructive rounded-full hover:bg-destructive/10 transition-all" style={{ fontWeight: 500 }}>
                  Cancel Plan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* All Plans */}
      <div className="mb-8">
        <h3 className="text-lg mb-4" style={{ fontWeight: 500 }}>Available Plans</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {USER_PLANS.filter(p => p.id !== 'premium_yearly').map((plan) => {
            const isCurrentPlan = plan.id === currentPlan?.id;
            return (
              <div
                key={plan.id}
                className={`p-5 rounded-[16px] border ${
                  isCurrentPlan
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-primary/30'
                } transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg" style={{ fontWeight: 500 }}>{plan.name}</h4>
                  {isCurrentPlan && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full" style={{ fontWeight: 500 }}>
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                <p className="text-2xl mb-4" style={{ fontWeight: 500 }}>
                  {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.billingCycle === 'yearly' ? 'year' : 'month'}`}
                </p>
                {!isCurrentPlan && (
                  <Link
                    href="/pricing"
                    className="w-full py-2 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all text-sm text-center block"
                    style={{ fontWeight: 500 }}
                  >
                    {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Founder Section */}
      <div className="pt-8 border-t border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg" style={{ fontWeight: 500 }}>Founder Products</h3>
          {isFounder && (
            <span className="flex items-center gap-1.5 text-sm bg-accent/20 text-primary px-3 py-1.5 rounded-full" style={{ fontWeight: 500 }}>
              <Crown className="w-4 h-4" />
              Founder
            </span>
          )}
        </div>

        {isFounder && listedTools && listedTools.length > 0 ? (
          <div className="space-y-4 mb-6">
            {listedTools.map((tool: any, idx: number) => (
              <div key={idx} className="p-4 bg-secondary/20 rounded-[12px] border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="text-base" style={{ fontWeight: 500 }}>{tool.name || tool.tool_name || 'Tool'}</h4>
                      <p className="text-sm text-muted-foreground">
                        Listed on {tool.listedDate || tool.created_at ? new Date(tool.listedDate || tool.created_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-primary hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-6">
            List your AI tool on Pinpoint to reach a curated audience of quality-conscious users.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {FOUNDER_PRODUCTS.slice(0, 2).map((product) => (
            <div
              key={product.id}
              className="p-5 rounded-[16px] border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                {product.category === 'listing' ? (
                  <Package className="w-5 h-5 text-primary" />
                ) : (
                  <Calendar className="w-5 h-5 text-primary" />
                )}
                <h4 className="text-base" style={{ fontWeight: 500 }}>{product.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
              <p className="text-xl mb-4" style={{ fontWeight: 500 }}>
                ${product.price}
              </p>
              <Link
                href="/pricing"
                className="w-full py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all text-sm text-center block"
                style={{ fontWeight: 500 }}
              >
                {product.ctaText}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link href="/pricing" className="text-sm text-primary hover:underline">
            View all founder products →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Settings</h2>
      
      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h3 className="text-lg mb-4" style={{ fontWeight: 500 }}>Email Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-secondary/20 rounded-[12px] border border-border/30 cursor-pointer hover:border-primary/30 transition-all">
              <div>
                <p style={{ fontWeight: 500 }}>Weekly Newsletter</p>
                <p className="text-sm text-muted-foreground">Get the latest AI tools every week</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-primary" />
            </label>
            
            <label className="flex items-center justify-between p-4 bg-secondary/20 rounded-[12px] border border-border/30 cursor-pointer hover:border-primary/30 transition-all">
              <div>
                <p style={{ fontWeight: 500 }}>Product Updates</p>
                <p className="text-sm text-muted-foreground">Updates about new features and improvements</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-primary" />
            </label>

            <label className="flex items-center justify-between p-4 bg-secondary/20 rounded-[12px] border border-border/30 cursor-pointer hover:border-primary/30 transition-all">
              <div>
                <p style={{ fontWeight: 500 }}>Personalized Recommendations</p>
                <p className="text-sm text-muted-foreground">Tool suggestions based on your interests</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded accent-primary" />
            </label>
          </div>
        </div>

        {/* Privacy */}
        <div className="pt-6 border-t border-border/30">
          <h3 className="text-lg mb-4" style={{ fontWeight: 500 }}>Privacy & Data</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-secondary/20 rounded-[12px] border border-border/30 hover:border-primary/30 transition-all">
              <p style={{ fontWeight: 500 }}>Download Your Data</p>
              <p className="text-sm text-muted-foreground">Export all your saved data and preferences</p>
            </button>
            
            <button className="w-full text-left p-4 bg-destructive/5 rounded-[12px] border border-destructive/30 hover:border-destructive/50 transition-all">
              <p style={{ fontWeight: 500 }} className="text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

