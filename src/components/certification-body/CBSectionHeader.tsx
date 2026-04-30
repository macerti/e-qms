import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CBSectionHeaderProps {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  accent?: "primary" | "violet" | "emerald" | "amber" | "sky";
  right?: React.ReactNode;
  className?: string;
}

const ACCENT: Record<NonNullable<CBSectionHeaderProps["accent"]>, string> = {
  primary: "from-primary/15 via-primary/5 to-transparent",
  violet:  "from-violet-500/15 via-fuchsia-400/5 to-transparent",
  emerald: "from-emerald-500/15 via-teal-400/5 to-transparent",
  amber:   "from-amber-500/15 via-orange-400/5 to-transparent",
  sky:     "from-sky-500/15 via-cyan-400/5 to-transparent",
};

const ICON_BG: Record<NonNullable<CBSectionHeaderProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  violet:  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber:   "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  sky:     "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export function CBSectionHeader({ icon: Icon, eyebrow, title, description, accent = "primary", right, className }: CBSectionHeaderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br p-4",
      ACCENT[accent],
      className,
    )}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", ICON_BG[accent])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="space-y-0.5">
            {eyebrow && (
              <div className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
            )}
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
          </div>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </div>
  );
}
