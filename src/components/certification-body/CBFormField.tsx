import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CBClauseBadge } from "./CBClauseBadge";

interface CBFormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  clauseCode?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Standard CB form field wrapper. Optional clause traceability so users
 * understand WHY a piece of information is captured.
 */
export function CBFormField({ label, required, hint, clauseCode, children, className }: CBFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
        {clauseCode && <CBClauseBadge code={clauseCode} />}
      </div>
      {children}
      {hint && <p className="text-[0.7rem] text-muted-foreground leading-relaxed">{hint}</p>}
    </div>
  );
}

interface CBFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  clauseCode?: string;
}

export function CBFormSection({ title, description, children, clauseCode }: CBFormSectionProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
        </div>
        {clauseCode && <CBClauseBadge code={clauseCode} />}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
