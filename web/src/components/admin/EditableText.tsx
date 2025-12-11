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
  label?: string;
  minLength?: number;
  maxLength?: number;
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
  label,
  minLength,
  maxLength,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    // Validate length constraints
    if (minLength !== undefined && editValue.length < minLength) {
      setError(`Minimum ${minLength} characters required`);
      return;
    }
    if (maxLength !== undefined && editValue.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setError("Failed to save. Please try again.");
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
    const inputClasses = `w-full bg-background border-2 ${error ? 'border-red-500' : 'border-primary'} rounded-[8px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`;
    const currentLength = editValue.length;
    const isValidLength = (minLength === undefined || currentLength >= minLength) && 
                          (maxLength === undefined || currentLength <= maxLength);
    
    return (
      <div className="relative group space-y-2">
        {label && (
          <div className="text-xs text-muted-foreground font-medium">
            {label}
            {(minLength !== undefined || maxLength !== undefined) && (
              <span className="ml-2 text-muted-foreground/70">
                ({minLength !== undefined ? `${minLength}-` : ''}{maxLength || ''} characters)
              </span>
            )}
          </div>
        )}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className={inputClasses}
            rows={rows}
            placeholder={placeholder}
            style={style}
            minLength={minLength}
            maxLength={maxLength}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className={inputClasses}
            placeholder={placeholder}
            style={style}
            minLength={minLength}
            maxLength={maxLength}
          />
        )}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
            {(minLength !== undefined || maxLength !== undefined) && !error && (
              <p className={`text-xs mt-1 ${isValidLength ? 'text-muted-foreground' : 'text-yellow-600'}`}>
                {currentLength} / {maxLength || '∞'} characters
                {minLength !== undefined && currentLength < minLength && ` (minimum ${minLength})`}
              </p>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !isValidLength}
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
      </div>
    );
  }

  const Component = as;
  const displayValue = value || placeholder;
  const isEmpty = !value;

  return (
    <div className="relative group group-hover:bg-secondary/20 rounded-[8px] p-1 -m-1 transition-colors">
      {label && (
        <div className="flex items-center gap-2 mb-1">
          <div className="text-xs text-muted-foreground font-medium">
            {label}
            {(minLength !== undefined || maxLength !== undefined) && (
              <span className="ml-2 text-muted-foreground/70">
                ({minLength !== undefined ? `${minLength}-` : ''}{maxLength || ''} characters)
              </span>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
      {!label && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-secondary"
          title="Edit"
        >
          <Edit2 className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
      <Component
        className={`${displayClassName} ${isEmpty ? "text-muted-foreground italic" : ""}`}
        style={style}
      >
        {displayValue}
      </Component>
    </div>
  );
}

