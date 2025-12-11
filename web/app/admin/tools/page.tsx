import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "@/src/lib/supabaseClient";
import EnrichToolForm from "@/src/components/EnrichToolForm";
import RedditSentimentForm from "@/src/components/RedditSentimentForm";
import ToolLogo from "@/src/components/ToolLogo";
import AdminLogout from "@/src/components/AdminLogout";
import Logo from "@/src/components/Logo";
import { ThemeToggle } from "@/src/components/ThemeToggle";

type Tool = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
};

export const dynamic = "force-dynamic";

export default async function AdminToolsPage() {
  noStore();
  const { data: tools, error } = await supabase
    .from("tools")
    .select("id, name, slug, logo_url")
    .order("name", { ascending: true });
  const toolList = (tools ?? []) as Tool[];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Logo size="md" />
            <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>
              Pinpoint AI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/admin/tools" className="text-foreground font-medium">
              Admin
            </Link>
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <ThemeToggle />
            <AdminLogout />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pb-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl tracking-tight" style={{ fontWeight: 600 }}>
            Admin · Tools
          </h1>
          <p className="text-muted-foreground">
            Manage tools and their data. Click on a tool to edit.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-[20px] p-4">
            <p className="text-sm">
              Failed to load tools: {error.message}
            </p>
          </div>
        )}

        <EnrichToolForm />

        <RedditSentimentForm />

        <section className="bg-card rounded-[20px] p-8 shadow-sm border border-border/50">
          <h2 className="text-2xl tracking-tight mb-6" style={{ fontWeight: 600 }}>
            All Tools
          </h2>
          {toolList.length === 0 ? (
            <p className="text-muted-foreground">
              No tools in the database. Use "Auto enrich a tool" above to add one.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolList.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/admin/tool/${tool.slug}/edit`}
                  className="flex items-center gap-4 rounded-[16px] border border-border/50 bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <ToolLogo
                    logoUrl={tool.logo_url}
                    toolName={tool.name}
                    size="md"
                  />
                  <span className="font-semibold text-lg">{tool.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
