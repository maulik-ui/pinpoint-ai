"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Bookmark, Settings, Crown, CheckCircle2 } from "lucide-react";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/src/lib/supabaseClientBrowser";
import { useCurrentUserPlan, useFounderStatus } from "@/src/hooks/useBilling";
import { formatPriceWithCycle } from "@/src/lib/billing/plans";
import ToolLogo from "./ToolLogo";

type Tab = "overview" | "membership" | "saved";

type SavedTool = {
  id: string;
  tool_id: string;
  created_at: string;
  tools: {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    logo_url: string | null;
    overall_score: number | null;
  };
};

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [savedToolsLoading, setSavedToolsLoading] = useState(true);
  const { currentPlan: plan, isPremium, isLoading: planLoading } = useCurrentUserPlan();
  const { isFounder, listedTools, activeOrders, isLoading: founderLoading } = useFounderStatus();
  const hasListedTools = listedTools.length > 0;

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/api/auth/signin?redirect=" + encodeURIComponent("/user"));
        return;
      }
      setUser(session.user);
      setLoading(false);
      
      // Fetch saved tools
      fetchSavedTools(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/api/auth/signin?redirect=" + encodeURIComponent("/user"));
        setSavedTools([]);
      } else {
        setUser(session.user);
        fetchSavedTools(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchSavedTools = async (userId: string) => {
    setSavedToolsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_saved_tools")
        .select(`
          id,
          tool_id,
          created_at,
          tools:tool_id (
            id,
            name,
            slug,
            category,
            logo_url,
            overall_score
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching saved tools:", error);
        setSavedTools([]);
      } else {
        setSavedTools((data || []) as SavedTool[]);
      }
    } catch (error) {
      console.error("Error fetching saved tools:", error);
      setSavedTools([]);
    } finally {
      setSavedToolsLoading(false);
    }
  };

  if (loading || planLoading || founderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-8 py-6 max-w-7xl mx-auto border-b border-border/30">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Logo size="md" />
            <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>
              Pinpoint AI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-card rounded-[20px] p-6 border border-border/50 shadow-sm mb-6">
              <div className="flex items-center gap-4 mb-4">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={displayName}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold">{displayName}</h2>
                  {user.email && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </div>
              {isPremium && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Premium Member</span>
                </div>
              )}
              {hasListedTools && (
                <div className="flex items-center gap-2 px-3 py-2 bg-accent-warm/10 rounded-full mt-2">
                  <Crown className="w-4 h-4 text-accent-warm" />
                  <span className="text-sm font-medium text-accent-warm">Founder</span>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${
                  activeTab === "overview"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <User className="w-5 h-5" />
                <span style={{ fontWeight: activeTab === "overview" ? 500 : 400 }}>
                  Overview
                </span>
              </button>
              <button
                onClick={() => setActiveTab("membership")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${
                  activeTab === "membership"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <Crown className="w-5 h-5" />
                <span style={{ fontWeight: activeTab === "membership" ? 500 : 400 }}>
                  Membership
                </span>
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${
                  activeTab === "saved"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span style={{ fontWeight: activeTab === "saved" ? 500 : 400 }}>
                  Saved Tools
                </span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "overview" && (
              <div className="bg-card rounded-[20px] p-8 border border-border/50 shadow-sm">
                <h1 className="text-2xl mb-6" style={{ fontWeight: 600 }}>
                  Welcome back, {displayName}!
                </h1>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-secondary/30 rounded-[16px]">
                    <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>
                      Your Plan
                    </h3>
                    <p className="text-2xl mb-1" style={{ fontWeight: 600, color: "#6E7E55" }}>
                      {plan?.name || "Free"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plan?.description || "Discover AI tools"}
                    </p>
                  </div>
                  <div className="p-6 bg-secondary/30 rounded-[16px]">
                    <h3 className="text-lg mb-2" style={{ fontWeight: 500 }}>
                      Saved Tools
                    </h3>
                    <p className="text-2xl mb-1" style={{ fontWeight: 600, color: "#6E7E55" }}>
                      {savedTools.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tools you've bookmarked
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "membership" && (
              <div className="space-y-6">
                <div className="bg-card rounded-[20px] p-8 border border-border/50 shadow-sm">
                  <h1 className="text-2xl mb-6" style={{ fontWeight: 600 }}>
                    Membership
                  </h1>

                  {/* Current Plan */}
                  <div className="mb-8">
                    <h2 className="text-lg mb-4" style={{ fontWeight: 500 }}>
                      Current Plan
                    </h2>
                    <div className="p-6 bg-secondary/30 rounded-[16px] border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-xl mb-1" style={{ fontWeight: 600 }}>
                            {plan?.name || "Free"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {plan?.description || "Perfect for discovering AI tools"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl mb-1" style={{ fontWeight: 600, color: "#6E7E55" }}>
                            {formatPriceWithCycle(plan?.price || 0, plan?.billingCycle || "one_time")}
                          </p>
                          {plan?.billingCycle !== "one_time" && (
                            <p className="text-xs text-muted-foreground">
                              {plan?.billingCycle === "monthly" ? "Billed monthly" : "Billed yearly"}
                            </p>
                          )}
                        </div>
                      </div>
                      {!isPremium && (
                        <Link
                          href="/pricing"
                          className="inline-block mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm"
                          style={{ fontWeight: 500 }}
                        >
                          Upgrade to Premium
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Founder Status */}
                  {hasListedTools && (
                    <div>
                      <h2 className="text-lg mb-4" style={{ fontWeight: 500 }}>
                        Founder Products
                      </h2>
                      {activeOrders.length > 0 ? (
                        <div className="space-y-4">
                          {activeOrders.map((order) => (
                            <div
                              key={order.id}
                              className="p-6 bg-secondary/30 rounded-[16px] border border-border/30"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>
                                    {order.product_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Status: {order.status}
                                  </p>
                                </div>
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-secondary/30 rounded-[16px] border border-border/30 text-center">
                          <p className="text-muted-foreground mb-4">
                            No active founder products
                          </p>
                          <Link
                            href="/pricing"
                            className="inline-block px-6 py-2.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm"
                            style={{ fontWeight: 500 }}
                          >
                            View Founder Plans
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "saved" && (
              <div className="bg-card rounded-[20px] p-8 border border-border/50 shadow-sm">
                <h1 className="text-2xl mb-6" style={{ fontWeight: 600 }}>
                  Saved Tools
                </h1>
                {savedToolsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : savedTools.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      You haven't saved any tools yet
                    </p>
                    <Link
                      href="/search"
                      className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      Browse Tools
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedTools.map((savedTool) => (
                      <Link
                        key={savedTool.id}
                        href={`/tool/${savedTool.tools.slug}`}
                        className="flex items-center gap-4 p-4 bg-secondary/30 rounded-[16px] border border-border/30 hover:bg-secondary/50 transition-all group"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-card border border-border/50">
                          <ToolLogo
                            logoUrl={savedTool.tools.logo_url}
                            toolName={savedTool.tools.name}
                            size="md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg mb-1 group-hover:text-primary transition-colors" style={{ fontWeight: 600 }}>
                            {savedTool.tools.name}
                          </h3>
                          {savedTool.tools.category && (
                            <span className="text-xs text-muted-foreground">{savedTool.tools.category}</span>
                          )}
                        </div>
                        {savedTool.tools.overall_score !== null && (
                          <div className="flex-shrink-0">
                            <div className="text-lg" style={{ fontWeight: 600, color: "#6E7E55" }}>
                              {savedTool.tools.overall_score.toFixed(1)}
                            </div>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

