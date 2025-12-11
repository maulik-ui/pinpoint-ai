"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2, Check, X, Loader2 } from "lucide-react";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  displayClassName?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  style?: React.CSSProperties;
}

export function EditableText({
  value,
  onSave,
  as = "p",
  className = "",
  displayClassName = "",
  placeholder = "Click to edit...",
  multiline = false,
  rows = 3,
  style,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    const inputClasses = `w-full bg-background border-2 border-primary rounded-[8px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`;
    
    return (
      <div className="relative group">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inputClasses}
            rows={rows}
            placeholder={placeholder}
            style={style}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inputClasses}
            placeholder={placeholder}
            style={style}
          />
        )}
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 rounded bg-primary text-primary-foreground hover:opacity-80 transition-opacity disabled:opacity-50"
            title="Save"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1.5 rounded bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const Component = as;
  const displayValue = value || placeholder;
  const isEmpty = !value;

  return (
    <div className="relative group group-hover:bg-secondary/20 rounded-[8px] p-1 -m-1 transition-colors">
      <Component
        className={`${displayClassName} ${isEmpty ? "text-muted-foreground italic" : ""}`}
        style={style}
      >
        {displayValue}
      </Component>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-secondary"
        title="Edit"
      >
        <Edit2 className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

