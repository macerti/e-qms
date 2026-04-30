import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger" | "info" | "violet" | "neutral";

const TONE_STYLES: Record<Tone, { bar: string; iconBg: string; iconFg: string; glow: string }> = {
  primary: { bar: "from-primary to-primary/60", iconBg: "bg-primary/10", iconFg: "text-primary", glow: "from-primary/10" },
  success: { bar: "from-emerald-500 to-emerald-300", iconBg: "bg-emerald-500/10", iconFg: "text-emerald-600 dark:text-emerald-400", glow: "from-emerald-500/10" },
  warning: { bar: "from-amber-500 to-amber-300", iconBg: "bg-amber-500/10", iconFg: "text-amber-600 dark:text-amber-400", glow: "from-amber-500/10" },
  danger:  { bar: "from-rose-500 to-rose-300",  iconBg: "bg-rose-500/10",  iconFg: "text-rose-600 dark:text-rose-400",   glow: "from-rose-500/10" },
  info:    { bar: "from-sky-500 to-sky-300",    iconBg: "bg-sky-500/10",    iconFg: "text-sky-600 dark:text-sky-400",     glow: "from-sky-500/10" },
  violet:  { bar: "from-violet-500 to-fuchsia-400", iconBg: "bg-violet-500/10", iconFg: "text-violet-600 dark:text-violet-400", glow: "from-violet-500/10" },
  neutral: { bar: "from-muted-foreground/60 to-muted-foreground/20", iconBg: "bg-muted", iconFg: "text-muted-foreground", glow: "from-muted/40" },
};

export interface CBStatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
  trend?: { direction: "up" | "down"; value: string };
  onClick?: () => void;
  className?: string;
}

export function CBStatTile({ label, value, hint, icon: Icon, tone = "primary", trend, onClick, className }: CBStatTileProps) {
  const t = TONE_STYLES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 text-left shadow-sm transition-all duration-200",
        onClick && "hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
        !onClick && "cursor-default",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", t.bar)} />
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent opacity-60", t.glow)} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums leading-tight">{value}</div>
          {hint && <div className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</div>}
          {trend && (
            <div className={cn(
              "mt-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              trend.direction === "up" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            )}>
              {trend.direction === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200", t.iconBg, onClick && "group-hover:scale-110")}>
            <Icon className={cn("h-4 w-4", t.iconFg)} />
          </div>
        )}
      </div>
    </button>
  );
}

export function CBStatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", className)}>
      {children}
    </div>
  );
}
