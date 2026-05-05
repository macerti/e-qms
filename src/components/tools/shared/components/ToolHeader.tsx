import type { LucideIcon } from "lucide-react";
import { ProcessLinkBadge } from "@/components/tools/shared/components/ProcessLinkBadge";
import { cn } from "@/lib/utils";

type Tone = "risk" | "primary" | "info" | "accent" | "success" | "violet";

const TONE: Record<Tone, { bar: string; glow: string; chip: string; icon: string }> = {
  risk: { bar: "from-risk via-risk/70 to-warning", glow: "bg-risk/15", chip: "bg-risk/10 text-risk", icon: "text-risk" },
  primary: { bar: "from-primary via-primary/70 to-accent", glow: "bg-primary/15", chip: "bg-primary/10 text-primary", icon: "text-primary" },
  info: { bar: "from-info via-info/70 to-primary", glow: "bg-info/15", chip: "bg-info/10 text-info", icon: "text-info" },
  accent: { bar: "from-accent via-warning to-accent", glow: "bg-accent/20", chip: "bg-accent/15 text-accent-foreground", icon: "text-accent" },
  success: { bar: "from-success via-success/70 to-info", glow: "bg-success/15", chip: "bg-success/10 text-success", icon: "text-success" },
  violet: { bar: "from-primary via-accent to-info", glow: "bg-primary/15", chip: "bg-primary/10 text-primary", icon: "text-primary" },
};

interface ToolHeaderProps {
  title: string;
  codification: string;
  linkedProcess?: string;
  processOptions?: Array<{ value: string; label: string }>;
  onLinkedProcessChange?: (value: string) => void;
  description?: string;
  tone?: Tone;
  icon?: LucideIcon;
  signature?: React.ReactNode;
  pattern?: "dots" | "grid" | "diagonal" | "radial";
}

const PATTERN: Record<NonNullable<ToolHeaderProps["pattern"]>, string> = {
  dots: "[background-image:radial-gradient(hsl(var(--foreground)/0.07)_1px,transparent_1px)] [background-size:16px_16px]",
  grid: "[background-image:linear-gradient(hsl(var(--foreground)/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:20px_20px]",
  diagonal: "[background-image:repeating-linear-gradient(45deg,hsl(var(--foreground)/0.05)_0_1px,transparent_1px_10px)]",
  radial: "[background-image:radial-gradient(circle_at_top_right,hsl(var(--foreground)/0.08),transparent_60%)]",
};

export function ToolHeader({
  title,
  codification,
  linkedProcess,
  processOptions,
  onLinkedProcessChange,
  description,
  tone = "primary",
  icon: Icon,
  signature,
  pattern = "dots",
}: ToolHeaderProps) {
  const t = TONE[tone];
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className={cn("h-1.5 w-full bg-gradient-to-r", t.bar)} />
      <div className="relative">
        <div className={cn("absolute inset-0 opacity-60", PATTERN[pattern])} aria-hidden />
        <div className={cn("absolute -top-14 -right-14 h-48 w-48 rounded-full blur-3xl", t.glow)} aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-background/70 ring-1 ring-border/50 backdrop-blur", t.icon)}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <span className={cn("inline-block rounded px-1.5 py-0.5 font-mono text-[10px]", t.chip)}>
                {codification}
              </span>
              {description && (
                <p className="max-w-2xl pt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {signature && (
              <div className="hidden rounded-xl bg-background/60 p-2.5 ring-1 ring-border/50 backdrop-blur sm:block">
                {signature}
              </div>
            )}
            <ProcessLinkBadge
              value={linkedProcess}
              processOptions={processOptions}
              onValueChange={onLinkedProcessChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
