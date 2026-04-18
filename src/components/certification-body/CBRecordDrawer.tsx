import type { ReactNode } from "react";
import { FileQuestion } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CBClauseBadge } from "./CBClauseBadge";

interface CBRecordDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  clauseCodes?: string[];
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Side drawer used for both creating and editing CB records.
 * Provides clear clause traceability + spacious form layout.
 */
export function CBRecordDrawer({
  open,
  onOpenChange,
  title,
  description,
  clauseCodes = [],
  children,
  footer,
}: CBRecordDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="border-b border-border/60 bg-muted/20 px-6 py-4 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {clauseCodes.map((c) => (
              <CBClauseBadge key={c} code={c} />
            ))}
          </div>
          <SheetTitle className="text-lg">{title}</SheetTitle>
          {description && <SheetDescription className="text-xs leading-relaxed">{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">{children}</div>

        {footer && (
          <div className="border-t border-border/60 bg-muted/20 px-6 py-3 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface CBEmptyProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function CBEmpty({ title, description, actionLabel, onAction, icon }: CBEmptyProps) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {icon ?? <FileQuestion className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
