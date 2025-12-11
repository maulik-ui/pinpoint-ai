"use client";

import { useState } from "react";

type Feature = {
  id: string;
  feature_name: string;
  status: string;
};

type FeaturesFormProps = {
  features: Feature[];
  toolSlug: string;
  bulkUpdateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
};

export default function FeaturesForm({
  features,
  toolSlug,
  bulkUpdateAction,
  deleteAction,
}: FeaturesFormProps) {
  const [featureStatuses, setFeatureStatuses] = useState<Record<string, string>>(
    Object.fromEntries(features.map((f) => [f.id, f.status]))
  );
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const handleStatusClick = (featureId: string, status: string) => {
    setFeatureStatuses((prev) => ({ ...prev, [featureId]: status }));
  };

  const handleDelete = async (featureId: string) => {
    setDeletedIds((prev) => new Set(prev).add(featureId));
    const formData = new FormData();
    formData.append("feature_id", featureId);
    formData.append("tool_slug", toolSlug);
    
    await deleteAction(formData);
    window.location.reload();
  };

  const visibleFeatures = features.filter((f) => !deletedIds.has(f.id));

  if (visibleFeatures.length === 0) {
    return (
      <section className="border rounded-lg p-4">
        <p className="text-sm text-gray-500">
          No features found. Add your first entry above.
        </p>
      </section>
    );
  }

  return (
    <section className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Features</h2>
      <form action={bulkUpdateAction} className="space-y-3">
        <input type="hidden" name="tool_slug" value={toolSlug} />
        {visibleFeatures.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center gap-4 py-2 border-b last:border-b-0"
          >
            <span className="flex-1 font-medium">{feature.feature_name}</span>
            <div className="flex items-center gap-2">
              <input
                type="hidden"
                name="feature_id[]"
                value={feature.id}
              />
              <input
                type="hidden"
                name="status[]"
                value={featureStatuses[feature.id] || feature.status}
              />
              <button
                type="button"
                onClick={() => handleStatusClick(feature.id, "works")}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  (featureStatuses[feature.id] || feature.status) === "works"
                    ? "bg-green-600 border-green-700 scale-110"
                    : "bg-green-200 border-green-400 hover:bg-green-300"
                }`}
                title="Works well"
              />
              <button
                type="button"
                onClick={() => handleStatusClick(feature.id, "mediocre")}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  (featureStatuses[feature.id] || feature.status) === "mediocre"
                    ? "bg-yellow-600 border-yellow-700 scale-110"
                    : "bg-yellow-200 border-yellow-400 hover:bg-yellow-300"
                }`}
                title="Mediocre"
              />
              <button
                type="button"
                onClick={() => handleStatusClick(feature.id, "fails")}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  (featureStatuses[feature.id] || feature.status) === "fails"
                    ? "bg-red-600 border-red-700 scale-110"
                    : "bg-red-200 border-red-400 hover:bg-red-300"
                }`}
                title="Doesn't work"
              />
            </div>
            <button
              type="button"
              onClick={() => handleDelete(feature.id)}
              className="ml-2 p-1 hover:bg-gray-100 rounded"
              title="Delete"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        ))}
        <div className="pt-4 border-t">
          <button
            type="submit"
            className="rounded bg-blue-600 px-6 py-2 text-white font-semibold"
          >
            Save All
          </button>
        </div>
      </form>
    </section>
  );
}

