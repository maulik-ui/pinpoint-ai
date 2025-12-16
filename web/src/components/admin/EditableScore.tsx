"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2, Check, X, Loader2 } from "lucide-react";

interface EditableScoreProps {
  value: number | null;
  onSave: (value: number | null) => Promise<void>;
  className?: string;
  displayClassName?: string;
  label?: string;
  min?: number;
  max?: number;
}

export function EditableScore({
  value,
  onSave,
  className = "",
  displayClassName = "",
  label,
  min = 0,
  max = 10,
}: EditableScoreProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toFixed(1) || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value?.toFixed(1) || "");
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setError(null);
    const numValue = editValue.trim() === "" ? null : parseFloat(editValue);

    if (editValue.trim() !== "" && (isNaN(numValue!) || numValue! < min || numValue! > max)) {
      setError(`Value must be between ${min} and ${max}`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(numValue);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value?.toFixed(1) || "");
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={inputRef}
          type="number"
          step="0.1"
          min={min}
          max={max}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 border border-primary/30 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1.5 hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
          title="Save"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Check className="w-4 h-4 text-primary" />
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
          title="Cancel"
        >
          <X className="w-4 h-4 text-destructive" />
        </button>
        {error && (
          <span className="text-xs text-destructive ml-2">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group ${displayClassName || className}`}>
      <span className="text-2xl tracking-tight" style={{ fontWeight: 700, color: "#6E7E55" }}>
        {value?.toFixed(1) || "—"}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded-md transition-all"
        title={`Edit ${label || "score"}`}
      >
        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
