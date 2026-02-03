import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditableProps {
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "textarea";
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}

export function InlineEditable({
  value,
  onSave,
  type = "text",
  placeholder,
  className,
  displayClassName,
  emptyText = "Click to edit...",
  disabled = false,
  required = false,
  maxLength,
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
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

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (required && !trimmedValue) {
      setEditValue(value);
      setIsEditing(false);
      return;
    }
    if (trimmedValue !== value) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type === "text") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (disabled) {
    return (
      <span className={cn("text-foreground", displayClassName)}>
        {value || <span className="text-muted-foreground italic">{emptyText}</span>}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className={cn("flex items-start gap-2", className)}>
        {type === "textarea" ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={3}
            className="flex-1 text-sm"
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className="flex-1"
          />
        )}
        <div className="flex gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "group flex items-center gap-2 text-left w-full rounded-md px-2 py-1 -mx-2 -my-1",
        "hover:bg-muted/50 transition-colors",
        displayClassName
      )}
    >
      <span className="flex-1">
        {value || <span className="text-muted-foreground italic">{emptyText}</span>}
      </span>
      <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

interface InlineEditableSectionProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  editable?: boolean;
}

export function InlineEditableSection({
  title,
  children,
  onEdit,
  isEditing = false,
  onSave,
  onCancel,
  editable = true,
}: InlineEditableSectionProps) {
  return (
    <section className="mobile-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        {editable && !isEditing && onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 text-xs gap-1"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </Button>
        )}
        {isEditing && onSave && onCancel && (
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="h-7 text-xs gap-1 text-success hover:text-success"
            >
              <Check className="w-3 h-3" />
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
