"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";

interface EditableProsConsListProps {
  items: string[];
  type: "pros" | "cons";
  toolId: string;
  onSave: (items: string[]) => Promise<void>;
}

export function EditableProsConsList({ items, type, toolId, onSave }: EditableProsConsListProps) {
  const [itemStates, setItemStates] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Initialize item states on mount
  useEffect(() => {
    setItemStates([...items]);
  }, [items]);

  const handleItemChange = (index: number, newValue: string) => {
    if (newValue.length > 60) return;
    
    setItemStates(prev => {
      const updated = [...prev];
      updated[index] = newValue;
      return updated;
    });
    setHasChanges(true);
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    const nameLength = newItem.trim().length;
    if (nameLength < 20 || nameLength > 60) {
      alert("Item must be between 20 and 60 characters.");
      return;
    }

    setItemStates(prev => [...prev, newItem.trim()]);
    setNewItem("");
    setHasChanges(true);
  };

  const handleRemoveItem = (index: number) => {
    setItemStates(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reordered = [...itemStates];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    setItemStates(reordered);
    setHasChanges(true);
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    // Validate all items
    const invalidItems = itemStates.filter(item => {
      const nameLength = item.trim().length;
      return nameLength > 0 && (nameLength < 20 || nameLength > 60);
    });

    if (invalidItems.length > 0) {
      alert(`Please ensure all items are between 20 and 60 characters. ${invalidItems.length} item(s) need adjustment.`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(itemStates.map(item => item.trim()).filter(item => item.length > 0));
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save items:", error);
      alert("Failed to save items. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Add new item input */}
      <div className="flex items-center gap-3 p-3 rounded-[12px] bg-background/50 border-2 border-dashed border-border">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem();
            }
          }}
          placeholder={`Enter new ${type === "pros" ? "positive" : "negative"} point (20-60 characters)`}
          className="flex-1 bg-background border-2 border-primary rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          maxLength={60}
        />
        <button
          onClick={handleAddItem}
          disabled={newItem.trim().length < 20 || newItem.trim().length > 60}
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
        {newItem.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {newItem.length}/60 {newItem.length < 20 && `(min 20)`}
          </p>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-2 mt-4">
        {itemStates.map((item, index) => {
          const nameLength = item.length;
          const isValidLength = nameLength === 0 || (nameLength >= 20 && nameLength <= 60);

          return (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex items-start gap-3 p-2.5 rounded-[12px] bg-background/50 transition-all cursor-move ${
                draggedIndex === index ? "opacity-50" : ""
              } ${
                dragOverIndex === index ? "border-2 border-primary border-dashed bg-primary/10" : ""
              }`}
            >
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors mt-1">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Bullet point */}
              <div className={`w-2 h-2 rounded-full ${type === "pros" ? "bg-primary" : "bg-destructive"} flex-shrink-0 mt-2`} />

              {/* Item input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  className={`w-full bg-background border-2 rounded-[8px] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                    !isValidLength && nameLength > 0
                      ? "border-destructive"
                      : "border-transparent hover:border-border"
                  }`}
                  placeholder={`${type === "pros" ? "Positive" : "Negative"} point (20-60 characters)`}
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

              {/* Remove button */}
              <button
                onClick={() => handleRemoveItem(index)}
                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors flex-shrink-0"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {itemStates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No {type === "pros" ? "positives" : "negatives"}. Add your first item above.
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

