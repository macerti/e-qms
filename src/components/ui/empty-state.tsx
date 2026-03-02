import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  helperText?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  helperText,
}: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in py-16">
      <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center mb-6 shadow-metric">
        <Icon className="w-9 h-9 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-xl font-semibold mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[320px] mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mb-4 shadow-metric">
          {actionLabel}
        </Button>
      )}
      {helperText && (
        <p className="text-xs text-muted-foreground/60 max-w-[280px] leading-relaxed">
          {helperText}
        </p>
      )}
    </div>
  );
}
