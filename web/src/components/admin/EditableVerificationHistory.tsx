"use client";

import { useState, useEffect } from "react";
import { Edit2, Plus, X, Save, Loader2, Calendar } from "lucide-react";
import { motion } from "motion/react";

interface VerificationHistoryItem {
  date: string;
  title: string;
  description: string;
  isLatest?: boolean;
}

interface EditableVerificationHistoryProps {
  items: VerificationHistoryItem[];
  onSave: (items: VerificationHistoryItem[]) => Promise<void>;
  toolId: string;
}

export function EditableVerificationHistory({
  items: initialItems,
  onSave,
  toolId,
}: EditableVerificationHistoryProps) {
  const [items, setItems] = useState<VerificationHistoryItem[]>(initialItems || []);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<number, { title?: string; description?: string; date?: string }>>({});

  useEffect(() => {
    setItems(initialItems || []);
  }, [initialItems]);

  const validateItem = (item: VerificationHistoryItem, index: number): boolean => {
    const newErrors: { title?: string; description?: string; date?: string } = {};
    
    if (!item.date || item.date.trim().length === 0) {
      newErrors.date = "Date is required";
    }
    
    if (!item.title || item.title.trim().length === 0) {
      newErrors.title = "Title is required";
    } else if (item.title.length > 50) {
      newErrors.title = "Title must be 50 characters or less";
    }
    
    if (!item.description || item.description.trim().length === 0) {
      newErrors.description = "Description is required";
    } else if (item.description.length > 150) {
      newErrors.description = "Description must be 150 characters or less";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, [index]: newErrors }));
      return false;
    }
    
    setErrors(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    return true;
  };

  const handleSave = async () => {
    // Validate all items
    let isValid = true;
    items.forEach((item, index) => {
      if (!validateItem(item, index)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    // Ensure only the first item (most recent) is marked as latest
    const updatedItems = items.map((item, index) => ({
      ...item,
      isLatest: index === 0,
    }));

    setIsSaving(true);
    try {
      await onSave(updatedItems);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error("Failed to save verification history:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    const newItem: VerificationHistoryItem = {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      title: "",
      description: "",
      isLatest: false,
    };
    setItems([newItem, ...items]);
    setIsEditing(true);
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setErrors(prev => {
      const next = { ...prev };
      delete next[index];
      // Reindex errors
      const reindexed: Record<number, { title?: string; description?: string; date?: string }> = {};
      Object.keys(next).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = next[oldIndex];
        } else if (oldIndex < index) {
          reindexed[oldIndex] = next[oldIndex];
        }
      });
      return reindexed;
    });
  };

  const handleUpdate = (index: number, field: "date" | "title" | "description", value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
    
    // Clear error for this field when user types
    if (errors[index]?.[field]) {
      setErrors(prev => {
        const next = { ...prev };
        if (next[index]) {
          delete next[index][field];
          if (Object.keys(next[index]).length === 0) {
            delete next[index];
          }
        }
        return next;
      });
    }
    
    // Validate on blur
    validateItem(updated[index], index);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Display mode
  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-medium">
            verification_history
            <span className="ml-2 text-muted-foreground/70">
              (title: 50 chars, description: 150 chars)
            </span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-[20px] p-7 border-2 border-primary/20 shadow-sm">
          <div className="relative">
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-primary/30" />
            <div className="space-y-5">
              {items.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 relative z-10 ring-4 ${
                    index === 0 ? 'bg-primary ring-primary/20' : index === 1 ? 'bg-primary/60 ring-primary/10' : 'bg-primary/40 ring-primary/5'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                      {index === 0 && (
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs" style={{ fontWeight: 600 }}>
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="mt-2" style={{ fontWeight: 600, fontSize: '1.05rem' }}>{item.title}</p>
                    <p className="text-sm text-foreground/80 mt-2" style={{ lineHeight: 1.7 }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground font-medium">
          verification_history
          <span className="ml-2 text-muted-foreground/70">
            (title: 50 chars, description: 150 chars)
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-[20px] p-7 border-2 border-primary/20 shadow-sm">
        <div className="relative">
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-primary/30" />
          <div className="space-y-5">
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 relative z-10 ring-4 ${
                  index === 0 ? 'bg-primary ring-primary/20' : index === 1 ? 'bg-primary/60 ring-primary/10' : 'bg-primary/40 ring-primary/5'
                }`} />
                <div className="flex-1 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={item.date}
                      onChange={(e) => handleUpdate(index, "date", e.target.value)}
                      onBlur={() => validateItem(item, index)}
                      placeholder="Date (e.g., November 15, 2025)"
                      className={`w-full bg-background border rounded-[8px] px-3 py-2 text-sm ${
                        errors[index]?.date ? 'border-red-500' : 'border-border'
                      }`}
                    />
                    {errors[index]?.date && (
                      <p className="text-xs text-red-500 mt-1">{errors[index].date}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdate(index, "title", e.target.value)}
                      onBlur={() => validateItem(item, index)}
                      maxLength={50}
                      placeholder="Title (max 50 characters)"
                      className={`w-full bg-background border rounded-[8px] px-3 py-2 text-sm ${
                        errors[index]?.title ? 'border-red-500' : 'border-border'
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors[index]?.title && (
                        <p className="text-xs text-red-500">{errors[index].title}</p>
                      )}
                      <p className={`text-xs ml-auto ${item.title.length > 50 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {item.title.length} / 50
                      </p>
                    </div>
                  </div>
                  <div>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleUpdate(index, "description", e.target.value)}
                      onBlur={() => validateItem(item, index)}
                      maxLength={150}
                      rows={3}
                      placeholder="Description (max 150 characters)"
                      className={`w-full bg-background border rounded-[8px] px-3 py-2 text-sm ${
                        errors[index]?.description ? 'border-red-500' : 'border-border'
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors[index]?.description && (
                        <p className="text-xs text-red-500">{errors[index].description}</p>
                      )}
                      <p className={`text-xs ml-auto ${item.description.length > 150 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {item.description.length} / 150
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="flex-shrink-0 p-1.5 rounded hover:bg-secondary transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-secondary hover:bg-secondary/80 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setItems(initialItems || []);
              setIsEditing(false);
              setErrors({});
            }}
            className="px-4 py-2 rounded-[8px] bg-secondary hover:bg-secondary/80 transition-colors text-sm"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || items.length === 0}
            className="px-4 py-2 rounded-[8px] bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
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
    </div>
  );
}

