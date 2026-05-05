import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolTone = "risk" | "primary" | "info" | "accent" | "success" | "violet";

interface ToolSignatureCardProps {
  title: string;
  description: string;
  codification: string;
  icon: LucideIcon;
  signature: React.ReactNode;
  path: string;
  tone: ToolTone;
  count?: number;
  status?: "active" | "scaffold";
  pattern?: "dots" | "grid" | "diagonal" | "radial";
  index?: number;
}

const TONE: Record<
  ToolTone,
  {
    bar: string;
    glow: string;
    iconBg: string;
    iconFg: string;
    chipBg: string;
    chipFg: string;
    hoverRing: string;
  }
> = {
  risk: {
    bar: "from-risk via-risk/70 to-warning",
    glow: "bg-risk/15",
    iconBg: "bg-risk/10",
    iconFg: "text-risk",
    chipBg: "bg-risk/10",
    chipFg: "text-risk",
    hoverRing: "group-hover:ring-risk/30",
  },
  primary: {
    bar: "from-primary via-primary/70 to-accent",
    glow: "bg-primary/15",
    iconBg: "bg-primary/10",
    iconFg: "text-primary",
    chipBg: "bg-primary/10",
    chipFg: "text-primary",
    hoverRing: "group-hover:ring-primary/30",
  },
  info: {
    bar: "from-info via-info/70 to-primary",
    glow: "bg-info/15",
    iconBg: "bg-info/10",
    iconFg: "text-info",
    chipBg: "bg-info/10",
    chipFg: "text-info",
    hoverRing: "group-hover:ring-info/30",
  },
  accent: {
    bar: "from-accent via-warning to-accent",
    glow: "bg-accent/15",
    iconBg: "bg-accent/10",
    iconFg: "text-accent",
    chipBg: "bg-accent/15",
    chipFg: "text-accent-foreground",
    hoverRing: "group-hover:ring-accent/30",
  },
  success: {
    bar: "from-success via-success/70 to-info",
    glow: "bg-success/15",
    iconBg: "bg-success/10",
    iconFg: "text-success",
    chipBg: "bg-success/10",
    chipFg: "text-success",
    hoverRing: "group-hover:ring-success/30",
  },
  violet: {
    bar: "from-primary via-accent to-info",
    glow: "bg-primary/15",
    iconBg: "bg-primary/10",
    iconFg: "text-primary",
    chipBg: "bg-primary/10",
    chipFg: "text-primary",
    hoverRing: "group-hover:ring-primary/30",
  },
};

const PATTERN: Record<NonNullable<ToolSignatureCardProps["pattern"]>, string> = {
  dots:
    "[background-image:radial-gradient(hsl(var(--foreground)/0.08)_1px,transparent_1px)] [background-size:14px_14px]",
  grid:
    "[background-image:linear-gradient(hsl(var(--foreground)/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:18px_18px]",
  diagonal:
    "[background-image:repeating-linear-gradient(45deg,hsl(var(--foreground)/0.05)_0_1px,transparent_1px_10px)]",
  radial:
    "[background-image:radial-gradient(circle_at_top_right,hsl(var(--foreground)/0.08),transparent_60%)]",
};

export function ToolSignatureCard({
  title,
  description,
  codification,
  icon: Icon,
  signature,
  path,
  tone,
  count,
  status = "active",
  pattern = "dots",
  index = 0,
}: ToolSignatureCardProps) {
  const t = TONE[tone];
  return (
    <Link
      to={path}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
        "ring-1 ring-transparent transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg",
        t.hoverRing,
        "animate-fade-in",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top accent bar */}
      <div className={cn("h-1.5 w-full bg-gradient-to-r", t.bar)} />

      {/* Decorative header zone */}
      <div className="relative h-28 overflow-hidden border-b border-border/50 bg-gradient-to-br from-muted/30 to-background">
        {/* Pattern */}
        <div className={cn("absolute inset-0 opacity-70", PATTERN[pattern])} />
        {/* Soft glow */}
        <div className={cn("absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl", t.glow)} />
        <div className={cn("absolute -bottom-12 -left-10 h-32 w-32 rounded-full blur-3xl opacity-60", t.glow)} />

        {/* Signature visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-background/40 p-3 backdrop-blur-sm ring-1 ring-border/40 shadow-sm">
            {signature}
          </div>
        </div>

        {/* Status chip */}
        {status === "scaffold" && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Scaffold
          </div>
        )}
        {count !== undefined && (
          <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-background/70 px-2 py-0.5 font-mono text-[11px] font-semibold backdrop-blur">
            {count}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              t.iconBg,
            )}
          >
            <Icon className={cn("h-4.5 w-4.5", t.iconFg)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-[0.95rem] font-semibold leading-snug">{title}</h3>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
            </div>
            <span
              className={cn(
                "mt-1 inline-block rounded px-1.5 py-px font-mono text-[10px]",
                t.chipBg,
                t.chipFg,
              )}
            >
              {codification}
            </span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
