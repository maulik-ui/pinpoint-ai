import Link from "next/link";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import FeaturesForm from "./FeaturesForm";
import AdminLogout from "@/src/components/AdminLogout";

async function bulkUpdateFeaturesAction(formData: FormData) {
  "use server";
  const toolSlug = formData.get("tool_slug")?.toString() ?? "";
  const featureIds = formData.getAll("feature_id[]").map((id) => id.toString());
  const statuses = formData.getAll("status[]").map((s) => s.toString());

  const updates = featureIds.map((id, index) => ({
    id,
    status: statuses[index] || "works",
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("tool_features")
      .update({
        status: update.status,
        last_checked_at: new Date().toISOString(),
      })
      .eq("id", update.id);

    if (error) {
      console.error("bulkUpdateFeaturesAction error", error);
    }
  }

  revalidatePath(`/admin/tool/${toolSlug}/features`);
}

type Tool = {
  id: string;
  name: string;
  slug: string;
};

type Feature = {
  id: string;
  feature_name: string;
  status: string;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminToolFeaturesPage({ params }: PageProps) {
  noStore();
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const {
    data: tool,
    error: toolError,
  } = await supabase
    .from("tools")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle<Tool>();

  if (toolError) {
    console.error("Failed to load tool", toolError);
  }

  if (!tool) {
    notFound();
  }

  const {
    data: features,
    error: featureError,
  } = await supabase
    .from("tool_features")
    .select("id, feature_name, status")
    .eq("tool_id", tool.id)
    .order("feature_name", { ascending: true });

  if (featureError) {
    console.error("Failed to load features", featureError);
  }

  const featureList = (features ?? []) as Feature[];

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8 text-black">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/tools"
            className="text-sm text-blue-600 underline inline-block mb-2"
          >
            ← Back to admin tools
          </Link>
          <h1 className="text-3xl font-bold">Feature checklist · {tool.name}</h1>
          <p className="text-sm text-gray-600">
            Add or update features tracked on the public detail page.
          </p>
        </div>
        <AdminLogout />
      </div>

      <section className="border rounded-lg p-4 bg-white">
        <h2 className="text-xl font-semibold mb-3">Add feature</h2>
        <form action={addFeatureAction} className="flex gap-3">
          <input type="hidden" name="tool_id" value={tool.id} />
          <input type="hidden" name="tool_slug" value={tool.slug} />
          <input
            name="feature_name"
            required
            placeholder="Feature name"
            className="flex-1 rounded border px-3 py-2 text-black"
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Add
          </button>
        </form>
      </section>

      <FeaturesForm
        features={featureList}
        toolSlug={tool.slug}
        bulkUpdateAction={bulkUpdateFeaturesAction}
        deleteAction={deleteFeatureAction}
      />
    </main>
  );
}

async function addFeatureAction(formData: FormData) {
  "use server";
  const toolId = formData.get("tool_id")?.toString();
  const toolSlug = formData.get("tool_slug")?.toString() ?? "";
  if (!toolId) return;

  const payload = {
    tool_id: toolId,
    feature_name: formData.get("feature_name")?.toString().trim() ?? "",
    status: "works",
    last_checked_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("tool_features").insert(payload);
  if (error) {
    console.error("addFeatureAction error", error);
  }
  revalidatePath(`/admin/tool/${toolSlug}/features`);
}

async function deleteFeatureAction(formData: FormData) {
  "use server";
  const featureId = formData.get("feature_id")?.toString();
  const toolSlug = formData.get("tool_slug")?.toString() ?? "";
  if (!featureId) return;

  const { error } = await supabase
    .from("tool_features")
    .delete()
    .eq("id", featureId);

  if (error) {
    console.error("deleteFeatureAction error", error);
  }

  revalidatePath(`/admin/tool/${toolSlug}/features`);
}
