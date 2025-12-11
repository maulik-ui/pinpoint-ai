"use client";

import { useState, useEffect } from "react";
import { Check, AlertTriangle, X, Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";

interface Feature {
  id: string;
  feature_name: string;
  status: string;
  notes: string | null;
  display_order?: number | null;
}

interface EditableFeatureListProps {
  features: Feature[];
  toolId: string;
  onSave: (updates: {
    updates: Array<{ id: string; status: string; feature_name: string; display_order?: number }>;
    additions: Array<{ feature_name: string; status: string; display_order?: number }>;
    deletions: string[];
  }) => Promise<void>;
}

export function EditableFeatureList({ features, toolId, onSave }: EditableFeatureListProps) {
  // Initialize state with features, preserving custom order
  const [featureStates, setFeatureStates] = useState<Record<string, { status: string; feature_name: string; display_order: number }>>({});
  const [newFeatures, setNewFeatures] = useState<Array<{ tempId: string; status: string; feature_name: string; display_order: number }>>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Initialize feature states on mount, preserving display_order
  useEffect(() => {
    const initialState: Record<string, { status: string; feature_name: string; display_order: number }> = {};
    // Sort features by display_order, then by feature_name as fallback
    const sortedFeatures = [...features].sort((a, b) => {
      const orderA = a.display_order ?? 999999;
      const orderB = b.display_order ?? 999999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.feature_name || "").localeCompare(b.feature_name || "");
    });
    
    sortedFeatures.forEach((feature, index) => {
      initialState[feature.id] = {
        status: feature.status || "works",
        feature_name: feature.feature_name || "",
        display_order: feature.display_order ?? index + 1,
      };
    });
    setFeatureStates(initialState);
  }, [features]);

  const handleStatusChange = (featureId: string, newStatus: string) => {
    setFeatureStates(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        status: newStatus,
      },
    }));
    setHasChanges(true);
  };

  const handleNameChange = (featureId: string, newName: string) => {
    // Enforce maximum character limit (60 characters)
    if (newName.length > 60) return;
    
    // Allow editing even if less than 20, but show validation on save
    setFeatureStates(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        feature_name: newName,
      },
    }));
    setHasChanges(true);
  };

  const handleAddFeature = () => {
    if (!newFeatureName.trim()) return;
    
    const nameLength = newFeatureName.trim().length;
    if (nameLength < 20 || nameLength > 60) {
      alert("Feature name must be between 20 and 60 characters.");
      return;
    }

    // Calculate next display_order (max existing order + 1, or 1 if no features)
    const maxOrder = Math.max(
      ...Object.values(featureStates).map(s => s.display_order),
      ...newFeatures.map(f => f.display_order),
      0
    );

    const tempId = `new-${Date.now()}-${Math.random()}`;
    setNewFeatures(prev => [...prev, {
      tempId,
      status: "works",
      feature_name: newFeatureName.trim(),
      display_order: maxOrder + 1,
    }]);
    setNewFeatureName("");
    setHasChanges(true);
  };

  const handleDragStart = (e: React.DragEvent, featureId: string) => {
    setDraggedId(featureId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", featureId);
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragOver = (e: React.DragEvent, featureId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedId && draggedId !== featureId) {
      setDragOverId(featureId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) return;

    const allFeatures = [
      ...Object.entries(featureStates).map(([id, state]) => ({ id, ...state })),
      ...newFeatures.map(f => ({ id: f.tempId, ...f })),
    ].filter(f => !deletedIds.has(f.id))
     .sort((a, b) => a.display_order - b.display_order);

    const draggedIndex = allFeatures.findIndex(f => f.id === draggedId);
    const targetIndex = allFeatures.findIndex(f => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder the array
    const reordered = [...allFeatures];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    // Update display_order for all affected features
    reordered.forEach((feature, index) => {
      const newOrder = index + 1;
      if (feature.id.startsWith("new-")) {
        setNewFeatures(prev => prev.map(f => 
          f.tempId === feature.id ? { ...f, display_order: newOrder } : f
        ));
      } else {
        setFeatureStates(prev => ({
          ...prev,
          [feature.id]: { ...prev[feature.id], display_order: newOrder },
        }));
      }
    });

    setHasChanges(true);
    setDraggedId(null);
  };

  const handleRemoveFeature = (featureId: string) => {
    if (featureId.startsWith("new-")) {
      // Remove from new features
      setNewFeatures(prev => prev.filter(f => f.tempId !== featureId));
    } else {
      // Mark for deletion
      setDeletedIds(prev => new Set(prev).add(featureId));
      // Remove from feature states
      setFeatureStates(prev => {
        const next = { ...prev };
        delete next[featureId];
        return next;
      });
    }
    setHasChanges(true);
  };

  const handleNewFeatureStatusChange = (tempId: string, newStatus: string) => {
    setNewFeatures(prev => prev.map(f => 
      f.tempId === tempId ? { ...f, status: newStatus } : f
    ));
    setHasChanges(true);
  };

  const handleNewFeatureNameChange = (tempId: string, newName: string) => {
    if (newName.length > 60) return;
    setNewFeatures(prev => prev.map(f => 
      f.tempId === tempId ? { ...f, feature_name: newName } : f
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validate all existing feature names
    const invalidFeatures = Object.entries(featureStates).filter(([id, state]) => {
      if (deletedIds.has(id)) return false; // Skip deleted features
      const nameLength = state.feature_name.trim().length;
      return nameLength > 0 && (nameLength < 20 || nameLength > 60);
    });

    // Validate new feature names
    const invalidNewFeatures = newFeatures.filter(f => {
      const nameLength = f.feature_name.trim().length;
      return nameLength < 20 || nameLength > 60;
    });

    if (invalidFeatures.length > 0 || invalidNewFeatures.length > 0) {
      alert(`Please ensure all feature names are between 20 and 60 characters. ${invalidFeatures.length + invalidNewFeatures.length} feature(s) need adjustment.`);
      return;
    }

    setIsSaving(true);
    try {
      const updates = Object.entries(featureStates)
        .filter(([id]) => !deletedIds.has(id))
        .map(([id, state]) => ({
          id,
          status: state.status,
          feature_name: state.feature_name.trim(),
          display_order: state.display_order,
        }));
      
      const additions = newFeatures.map(f => ({
        feature_name: f.feature_name.trim(),
        status: f.status,
        display_order: f.display_order,
      }));

      const deletions = Array.from(deletedIds);
      
      await onSave({ updates, additions, deletions });
      setHasChanges(false);
      setNewFeatures([]);
      setDeletedIds(new Set());
    } catch (error) {
      console.error("Failed to save features:", error);
      alert("Failed to save features. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "works":
        return {
          label: "Works",
          color: "bg-[#6E7E55]",
          icon: Check,
        };
      case "partial":
      case "mediocre":
        return {
          label: "Mediocre",
          color: "bg-[#D4A574]",
          icon: AlertTriangle,
        };
      case "fails":
      case "failed":
        return {
          label: "Doesn't work",
          color: "bg-[#C46A4A]",
          icon: X,
        };
      default:
        return {
          label: "Works",
          color: "bg-[#6E7E55]",
          icon: Check,
        };
    }
  };

  // Combine existing and new features, sort by display_order
  const allFeatures = [
    ...Object.entries(featureStates)
      .filter(([id]) => !deletedIds.has(id))
      .map(([id, state]) => ({
        id,
        feature_name: state.feature_name,
        status: state.status,
        notes: null,
        display_order: state.display_order,
      })),
    ...newFeatures.map(f => ({
      id: f.tempId,
      feature_name: f.feature_name,
      status: f.status,
      notes: null,
      display_order: f.display_order,
    })),
  ].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-3">
      {/* Add new feature input */}
      <div className="flex items-center gap-3 p-3 rounded-[12px] bg-primary/5 border-2 border-dashed border-primary/30">
        <input
          type="text"
          value={newFeatureName}
          onChange={(e) => setNewFeatureName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddFeature();
            }
          }}
          placeholder="Enter new feature name (20-60 characters)"
          className="flex-1 bg-background border-2 border-primary rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          maxLength={60}
        />
        <button
          onClick={handleAddFeature}
          disabled={newFeatureName.trim().length < 20 || newFeatureName.trim().length > 60}
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
        {newFeatureName.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {newFeatureName.length}/60 {newFeatureName.length < 20 && `(min 20)`}
          </p>
        )}
      </div>

      {allFeatures.map((feature) => {
        const isNewFeature = feature.id.startsWith("new-");
        const state = isNewFeature
          ? (newFeatures.find(f => f.tempId === feature.id) || { status: "works", feature_name: "" })
          : (featureStates[feature.id] || { status: feature.status || "works", feature_name: feature.feature_name });
        const config = getStatusConfig(state.status);
        const Icon = config.icon;
        const nameLength = state.feature_name.length;
        const isValidLength = nameLength === 0 || (nameLength >= 20 && nameLength <= 60);

        return (
          <div
            key={feature.id}
            draggable
            onDragStart={(e) => handleDragStart(e, feature.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, feature.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, feature.id)}
            className={`flex items-center gap-3 p-2.5 rounded-[12px] bg-secondary/20 transition-all cursor-move ${
              draggedId === feature.id ? "opacity-50" : ""
            } ${
              dragOverId === feature.id ? "border-2 border-primary border-dashed bg-primary/10" : ""
            }`}
          >
            {/* Drag handle */}
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Status indicator */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
              <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>

            {/* Feature name input */}
            <div className="flex-1">
              <input
                type="text"
                value={feature.id.startsWith("new-") 
                  ? (newFeatures.find(f => f.tempId === feature.id)?.feature_name || "")
                  : state.feature_name}
                onChange={(e) => {
                  if (feature.id.startsWith("new-")) {
                    handleNewFeatureNameChange(feature.id, e.target.value);
                  } else {
                    handleNameChange(feature.id, e.target.value);
                  }
                }}
                className={`w-full bg-background border-2 rounded-[8px] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                  !isValidLength && nameLength > 0
                    ? "border-destructive"
                    : "border-transparent hover:border-border"
                }`}
                placeholder="Feature name (20-60 characters)"
                maxLength={60}
              />
              {!isValidLength && nameLength > 0 && (
                <p className="text-xs text-destructive mt-1">
                  {nameLength < 20 ? `Minimum 20 characters (${nameLength}/20)` : `Maximum 60 characters (${nameLength}/60)`}
                </p>
              )}
              {nameLength > 0 && isValidLength && (
                <p className="text-xs text-muted-foreground mt-1">
                  {nameLength}/60 characters
                </p>
              )}
            </div>

            {/* Status buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (feature.id.startsWith("new-")) {
                    handleNewFeatureStatusChange(feature.id, "works");
                  } else {
                    handleStatusChange(feature.id, "works");
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  state.status === "works"
                    ? "bg-[#6E7E55] text-white shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-[#6E7E55]/20"
                }`}
                title="Works"
              >
                Works
              </button>
              <button
                onClick={() => {
                  if (feature.id.startsWith("new-")) {
                    handleNewFeatureStatusChange(feature.id, "mediocre");
                  } else {
                    handleStatusChange(feature.id, "mediocre");
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  state.status === "mediocre" || state.status === "partial"
                    ? "bg-[#D4A574] text-white shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-[#D4A574]/20"
                }`}
                title="Mediocre"
              >
                Mediocre
              </button>
              <button
                onClick={() => {
                  if (feature.id.startsWith("new-")) {
                    handleNewFeatureStatusChange(feature.id, "fails");
                  } else {
                    handleStatusChange(feature.id, "fails");
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  state.status === "fails" || state.status === "failed"
                    ? "bg-[#C46A4A] text-white shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-[#C46A4A]/20"
                }`}
                title="Doesn't work"
              >
                Doesn't work
              </button>
              <button
                onClick={() => handleRemoveFeature(feature.id)}
                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                title="Remove feature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      {allFeatures.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No features. Add your first feature above.
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-border/30">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontWeight: 500 }}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

