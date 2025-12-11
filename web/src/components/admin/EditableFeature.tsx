"use client";

import { useState } from "react";
import { Check, AlertTriangle, X, Loader2 } from "lucide-react";

interface EditableFeatureProps {
  feature: {
    id: string;
    feature_name: string;
    status: string;
    notes: string | null;
  };
  onSave: (featureId: string, status: string) => Promise<void>;
}

export function EditableFeature({ feature, onSave }: EditableFeatureProps) {
  // Map database status to display status
  const normalizeStatus = (status: string) => {
    if (status === "partial" || status === "mediocre") return "mediocre";
    if (status === "failed" || status === "fails") return "fails";
    return status || "works";
  };
  
  const [selectedStatus, setSelectedStatus] = useState(normalizeStatus(feature.status || "works"));
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === selectedStatus || isSaving) return;
    
    setIsSaving(true);
    setSelectedStatus(newStatus);
    try {
      await onSave(feature.id, newStatus);
    } catch (error) {
      console.error("Failed to save feature status:", error);
      // Revert on error
      setSelectedStatus(normalizeStatus(feature.status || "works"));
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
          hoverColor: "hover:bg-[#5a6a45]",
          icon: Check,
        };
      case "partial":
      case "mediocre":
        return {
          label: "Mediocre",
          color: "bg-[#D4A574]",
          hoverColor: "hover:bg-[#c49564]",
          icon: AlertTriangle,
        };
      case "fails":
      case "failed":
        return {
          label: "Doesn't work",
          color: "bg-[#C46A4A]",
          hoverColor: "hover:bg-[#b35a3a]",
          icon: X,
        };
      default:
        return {
          label: "Works",
          color: "bg-[#6E7E55]",
          hoverColor: "hover:bg-[#5a6a45]",
          icon: Check,
        };
    }
  };

  const currentConfig = getStatusConfig(selectedStatus);
  const Icon = currentConfig.icon;

  return (
    <div className="flex items-center gap-4 p-2.5 rounded-[12px] bg-secondary/20">
      {/* Status indicator */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${currentConfig.color}`}>
        <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>

      {/* Feature name */}
      <span className="text-foreground/90 flex-1">{feature.feature_name}</span>

      {/* Status buttons */}
      {isSaving ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusChange("works")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStatus === "works"
                ? "bg-[#6E7E55] text-white shadow-md"
                : "bg-secondary text-muted-foreground hover:bg-[#6E7E55]/20"
            }`}
            title="Works"
          >
            Works
          </button>
          <button
            onClick={() => handleStatusChange("mediocre")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStatus === "mediocre" || selectedStatus === "partial"
                ? "bg-[#D4A574] text-white shadow-md"
                : "bg-secondary text-muted-foreground hover:bg-[#D4A574]/20"
            }`}
            title="Mediocre"
          >
            Mediocre
          </button>
          <button
            onClick={() => handleStatusChange("fails")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStatus === "fails"
                ? "bg-[#C46A4A] text-white shadow-md"
                : "bg-secondary text-muted-foreground hover:bg-[#C46A4A]/20"
            }`}
            title="Doesn't work"
          >
            Doesn't work
          </button>
        </div>
      )}
    </div>
  );
}

