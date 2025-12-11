/**
 * User Profile and Membership Page
 * 
 * Displays user profile, current plan, and membership management options.
 * Includes a sidebar for navigation between profile sections.
 */

import { useState } from 'react';
import { 
  User, Settings, Bookmark, CreditCard, ChevronLeft, 
  Check, Crown, Package, Calendar, ShoppingBag
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SavedTools } from './SavedTools';
import { useCurrentUserPlan, useFounderStatus } from '../hooks/useBilling';
import pinpointLogo from "figma:asset/d6031ca13eac7737a5c8da806b58e09d36ecfcbc.png";
import { USER_PLANS, FOUNDER_PRODUCTS } from '../lib/billing/plans';
import { Navigation } from './Navigation';

interface UserPageProps {
  onBack?: () => void;
  onSelectTool?: (toolId: string) => void;
  onNavigate?: (page: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

type TabType = 'profile' | 'membership' | 'orders' | 'saved' | 'settings';

export function UserPage({ onBack, onSelectTool, onNavigate, isDarkMode = false, onToggleDarkMode = () => {} }: UserPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('membership');
  const { userProfile, currentPlan, isPremium, isFree } = useCurrentUserPlan();
  const { isFounder, listedTools } = useFounderStatus();

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'saved' as TabType, label: 'Saved Tools', icon: Bookmark },
    { id: 'membership' as TabType, label: 'Membership', icon: CreditCard },
    { id: 'orders' as TabType, label: 'Orders', icon: ShoppingBag },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="border-b border-border/30">
        <Navigation 
          onBack={onBack}
          onNavigate={(page) => {
            if (page === 'home' && onBack) {
              onBack();
            } else if (onNavigate) {
              onNavigate(page);
            }
          }}
          onLogoClick={onBack}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          showBackButton={false}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid lg:grid-cols-[170px_1fr] gap-8">
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
            {activeTab === 'profile' && <ProfileTab userProfile={userProfile} />}
            {activeTab === 'membership' && (
              <MembershipTab 
                currentPlan={currentPlan} 
                isPremium={isPremium}
                isFree={isFree}
                isFounder={isFounder}
                listedTools={listedTools}
                onNavigate={onNavigate}
              />
            )}
            {activeTab === 'orders' && <OrdersTab />}
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
              {userProfile?.displayName || 'User Name'}
            </h3>
            <p className="text-muted-foreground">{userProfile?.email}</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4 pt-6 border-t border-border/30">
          <div>
            <label className="text-sm text-muted-foreground">Display Name</label>
            <input
              type="text"
              defaultValue={userProfile?.displayName || ''}
              placeholder="Enter your name"
              className="w-full mt-1.5 px-4 py-2.5 bg-background rounded-[12px] border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              type="email"
              defaultValue={userProfile?.email || ''}
              disabled
              className="w-full mt-1.5 px-4 py-2.5 bg-muted rounded-[12px] border border-border text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Member Since</label>
            <p className="mt-1.5 text-foreground">
              {userProfile?.createdAt 
                ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'January 1, 2025'
              }
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
function MembershipTab({ currentPlan, isPremium, isFree, isFounder, listedTools, onNavigate }: any) {
  // Mock data - will be replaced with real data
  const [subscriptions] = useState([
    {
      id: 'SUB-2024-001',
      date: 'Dec 1, 2024',
      product: 'Premium Plan (Yearly)',
      amount: 249,
      status: 'active',
      nextBilling: 'Dec 1, 2025'
    }
  ]);

  const handleSubmitTool = () => {
    if (onNavigate) {
      onNavigate('submit-tool');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Membership</h2>

      {/* Active Subscriptions Section */}
      {subscriptions.length > 0 && (
        <div className="mb-8 pb-8 border-b border-border/30">
          <h3 className="text-lg mb-4" style={{ fontWeight: 500 }}>Active Subscriptions</h3>
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="p-3 md:p-4 bg-secondary/20 rounded-[12px] border border-border/30 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                      <h4 className="text-base" style={{ fontWeight: 500 }}>{sub.product}</h4>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary w-fit" 
                        style={{ fontWeight: 500 }}
                      >
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-muted-foreground">
                      <span>Started: {sub.date}</span>
                      <span className="hidden md:inline">•</span>
                      <span>Renews: {sub.nextBilling}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:block md:text-right">
                    <p className="text-lg" style={{ fontWeight: 500 }}>${sub.amount}/year</p>
                    <div className="flex gap-2 md:mt-2">
                      <button className="text-xs text-primary hover:underline">
                        Manage
                      </button>
                      <span className="text-xs text-muted-foreground">•</span>
                      <button className="text-xs text-destructive hover:underline">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Plans */}
      <div className="mb-8">
        <h3 className="text-lg mb-4" style={{ fontWeight: 500 }}>Researcher Plans</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {USER_PLANS.filter(p => p.id !== 'premium_yearly').map((plan) => {
            const isCurrentPlan = plan.id === currentPlan?.id;
            return (
              <div
                key={plan.id}
                className={`p-5 rounded-[16px] border-2 ${
                  isCurrentPlan
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card/50 hover:border-primary/40 hover:shadow-lg'
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
                <div className="mb-4 flex items-baseline gap-2">
                  <p className="text-2xl" style={{ fontWeight: 500 }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </p>
                  {plan.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      /{plan.billingCycle === 'yearly' ? 'year' : 'month'}
                    </p>
                  )}
                </div>
                
                {/* All Features */}
                <div className="space-y-2 mb-4">
                  {plan.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-foreground/85">{feature}</span>
                    </div>
                  ))}
                </div>

                {!isCurrentPlan && (
                  <button className="w-full py-2 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all text-sm" style={{ fontWeight: 500 }}>
                    {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
                {isCurrentPlan && isPremium && (
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-xs border border-border rounded-full hover:bg-accent/20 transition-all" style={{ fontWeight: 500 }}>
                      Manage Billing
                    </button>
                    <button className="flex-1 py-2 text-xs border border-destructive/30 text-destructive rounded-full hover:bg-destructive/10 transition-all" style={{ fontWeight: 500 }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Founder Section */}
      <div className="pt-8 border-t border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg" style={{ fontWeight: 500 }}>Founder Plans</h3>
          {isFounder && (
            <span className="flex items-center gap-1.5 text-sm bg-accent/20 text-primary px-3 py-1.5 rounded-full" style={{ fontWeight: 500 }}>
              <Crown className="w-4 h-4" />
              Founder
            </span>
          )}
        </div>

        {isFounder && listedTools.length > 0 ? (
          <div className="space-y-4 mb-6">
            {listedTools.map((tool: any, idx: number) => (
              <div key={idx} className="p-4 bg-secondary/20 rounded-[12px] border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="text-base" style={{ fontWeight: 500 }}>{tool.name}</h4>
                      <p className="text-sm text-muted-foreground">Listed on {tool.listedDate}</p>
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

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tool Listing */}
          <div className="p-5 rounded-[16px] border-2 border-border bg-card/50 hover:border-primary/40 hover:shadow-lg transition-all">
            <h4 className="text-base mb-2" style={{ fontWeight: 500 }}>New Tool Listing</h4>
            <p className="text-sm text-muted-foreground mb-4">Get your tool listed and verified by humans</p>
            <div className="mb-4 flex items-baseline gap-2">
              <p className="text-2xl" style={{ fontWeight: 500 }}>$499</p>
              <p className="text-sm text-muted-foreground">one-time</p>
            </div>
            <button 
              onClick={handleSubmitTool}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all text-sm mb-4" 
              style={{ fontWeight: 500 }}
            >
              List Your Tool
            </button>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Tool listing on Pinpoint</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Human Verified badge</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Full scoring and analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Initial sentiment and traction snapshot</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Feature checks included at launch</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Includes 3 days in Alpha Bar</span>
              </div>
            </div>
          </div>

          {/* Recheck Options */}
          <div className="p-5 rounded-[16px] border-2 border-border bg-card/50 hover:border-primary/40 hover:shadow-lg transition-all">
            <h4 className="text-base mb-2" style={{ fontWeight: 500 }}>Recheck Options</h4>
            <p className="text-sm text-muted-foreground mb-4">Keep your tool always fresh with reverification and rescoring</p>
            <div className="mb-4 flex items-baseline gap-2">
              <p className="text-2xl" style={{ fontWeight: 500 }}>$999</p>
              <p className="text-sm text-muted-foreground">/year</p>
            </div>
            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all text-sm mb-4" style={{ fontWeight: 500 }}>
              Purchase
            </button>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Updated Pinpoint Score</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Fresh sentiment and traction data</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Updated pricing fairness analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Updated feature verification and accuracy checks</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">4 recheck requests per year</span>
              </div>
            </div>
          </div>

          {/* Alpha Bar Sponsorship */}
          <div className="p-5 rounded-[16px] border-2 border-border bg-card/50 hover:border-primary/40 hover:shadow-lg transition-all">
            <h4 className="text-base mb-2" style={{ fontWeight: 500 }}>Alpha Bar Sponsorship</h4>
            <p className="text-sm text-muted-foreground mb-4">Premium homepage visibility for your AI tool</p>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Contact for pricing</p>
            </div>
            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all text-sm mb-4" style={{ fontWeight: 500 }}>
              Contact Us
            </button>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">One of three weekly homepage spots</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Sponsored badge under main search</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">High visibility for 7 days</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Priority placement for trending tools</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-xs text-foreground/85">Best for product launches and big updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Orders Tab Component
function OrdersTab() {
  const [orders] = useState([
    {
      id: 'ORD-2024-001',
      date: 'Nov 15, 2024',
      product: 'Tool Listing - MyAI Tool',
      amount: 499,
      status: 'completed'
    },
    {
      id: 'ORD-2024-002',
      date: 'Oct 22, 2024',
      product: 'Annual Recheck Bundle',
      amount: 999,
      status: 'completed'
    }
  ]);

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Orders</h2>

      {/* Orders Section */}
      {orders.length > 0 && (
        <div className="mb-8 pb-8 border-b border-border/30">
          <h3 className="text-lg mb-4" style={{ fontWeight: 500 }}>Orders</h3>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="p-3 md:p-4 bg-secondary/20 rounded-[12px] border border-border/30 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                      <h4 className="text-base" style={{ fontWeight: 500 }}>{order.product}</h4>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground w-fit" 
                        style={{ fontWeight: 500 }}
                      >
                        COMPLETED
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-muted-foreground">
                      <span>Order #{order.id}</span>
                      <span className="hidden md:inline">•</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:block md:text-right">
                    <p className="text-lg" style={{ fontWeight: 500 }}>${order.amount}</p>
                    <button className="text-xs text-primary hover:underline md:mt-2">
                      View Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 500 }}>Settings</h2>
      
      <div className="space-y-6">
        {/* Appearance */}
        <div>
          <h3 className="text-lg mb-4" style={{ fontWeight: 500 }}>Appearance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-[12px] border border-border/30">
              <div>
                <p style={{ fontWeight: 500 }}>Theme</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="pt-6 border-t border-border/30">
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