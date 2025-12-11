"use client";

import { useState, useEffect } from "react";
import { Edit2, Plus, X, Save, Loader2, GripVertical } from "lucide-react";

interface FunctionalityBlock {
  title: string;
  description: string;
}

interface EditableFunctionalityBlocksProps {
  blocks: FunctionalityBlock[];
  onSave: (blocks: FunctionalityBlock[]) => Promise<void>;
  toolId: string;
}

export function EditableFunctionalityBlocks({
  blocks: initialBlocks,
  onSave,
  toolId,
}: EditableFunctionalityBlocksProps) {
  const [blocks, setBlocks] = useState<FunctionalityBlock[]>(initialBlocks || []);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<number, { title?: string; description?: string }>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setBlocks(initialBlocks || []);
  }, [initialBlocks]);

  const validateBlock = (block: FunctionalityBlock, index: number): boolean => {
    const newErrors: { title?: string; description?: string } = {};
    
    if (!block.title || block.title.trim().length === 0) {
      newErrors.title = "Title is required";
    } else if (block.title.length > 30) {
      newErrors.title = "Title must be 30 characters or less";
    }
    
    if (!block.description || block.description.trim().length === 0) {
      newErrors.description = "Description is required";
    } else if (block.description.length > 50) {
      newErrors.description = "Description must be 50 characters or less";
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
    // Validate all blocks
    let isValid = true;
    blocks.forEach((block, index) => {
      if (!validateBlock(block, index)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(blocks);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error("Failed to save functionality blocks:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    const newBlock: FunctionalityBlock = { title: "", description: "" };
    setBlocks([...blocks, newBlock]);
    setIsEditing(true);
  };

  const handleRemove = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
    setErrors(prev => {
      const next = { ...prev };
      delete next[index];
      // Reindex errors
      const reindexed: Record<number, { title?: string; description?: string }> = {};
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

  const handleUpdate = (index: number, field: "title" | "description", value: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    setBlocks(updated);
    
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
    validateBlock(updated[index], index);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);
    setBlocks(newBlocks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-medium">
            functionality_blocks
            <span className="ml-2 text-muted-foreground/70">
              (title: 30 chars, description: 50 chars)
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
        <div className="grid md:grid-cols-2 gap-3">
          {blocks.map((block, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-card rounded-[12px] border border-border/30"
            >
              <div className="w-5 h-5 text-primary flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ fontWeight: 600 }}>{block.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground font-medium">
          functionality_blocks
          <span className="ml-2 text-muted-foreground/70">
            (title: 30 chars, description: 50 chars)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-start gap-3 p-3 bg-card rounded-[12px] border ${
              draggedIndex === index ? 'border-primary opacity-50' : 'border-border/30'
            }`}
          >
            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <input
                  type="text"
                  value={block.title}
                  onChange={(e) => handleUpdate(index, "title", e.target.value)}
                  onBlur={() => validateBlock(block, index)}
                  maxLength={30}
                  placeholder="Title (max 30 characters)"
                  className={`w-full bg-background border rounded-[8px] px-3 py-2 text-sm ${
                    errors[index]?.title ? 'border-red-500' : 'border-border'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors[index]?.title && (
                    <p className="text-xs text-red-500">{errors[index].title}</p>
                  )}
                  <p className={`text-xs ml-auto ${block.title.length > 30 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {block.title.length} / 30
                  </p>
                </div>
              </div>
              <div>
                <input
                  type="text"
                  value={block.description}
                  onChange={(e) => handleUpdate(index, "description", e.target.value)}
                  onBlur={() => validateBlock(block, index)}
                  maxLength={50}
                  placeholder="Description (max 50 characters)"
                  className={`w-full bg-background border rounded-[8px] px-3 py-2 text-sm ${
                    errors[index]?.description ? 'border-red-500' : 'border-border'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors[index]?.description && (
                    <p className="text-xs text-red-500">{errors[index].description}</p>
                  )}
                  <p className={`text-xs ml-auto ${block.description.length > 50 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {block.description.length} / 50
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

      <div className="flex items-center justify-between">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-secondary hover:bg-secondary/80 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Block
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setBlocks(initialBlocks || []);
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
            disabled={isSaving || blocks.length === 0}
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

