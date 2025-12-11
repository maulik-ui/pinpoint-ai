"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2, Check, X, Plus, Trash2, Loader2 } from "lucide-react";

interface EditableListProps {
  items: string[];
  onSave: (items: string[]) => Promise<void>;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function EditableList({
  items,
  onSave,
  label,
  placeholder = "Add item...",
  emptyMessage = "No items",
  className = "",
}: EditableListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState(items);
  const [newItem, setNewItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditItems(items);
  }, [items]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editItems.filter(item => item.trim() !== ""));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditItems(items);
    setNewItem("");
    setIsEditing(false);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setEditItems([...editItems, newItem.trim()]);
      setNewItem("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        {label && (
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
        )}
        <div className="space-y-2">
          {editItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 bg-background border-2 border-primary rounded-[8px] px-4 py-2">
                {item}
              </div>
              <button
                onClick={() => handleRemoveItem(index)}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-background border-2 border-primary rounded-[8px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleAddItem}
              className="p-2 rounded bg-primary text-primary-foreground hover:opacity-80 transition-opacity"
              title="Add"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 rounded bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {label && (
        <div className="text-sm font-medium text-muted-foreground mb-2">{label}</div>
      )}
      {items.length === 0 ? (
        <div className="text-muted-foreground italic py-2">{emptyMessage}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
              <p className="text-foreground/85" style={{ lineHeight: 1.7 }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      )}
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

