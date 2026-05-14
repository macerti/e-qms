import { LayoutGrid, Table as TableIcon, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessHeroProps {
  total: number;
  active: number;
  draft: number;
  archived: number;
  view: "grid" | "table";
  onViewChange: (v: "grid" | "table") => void;
}

export function ProcessHero({ total, active, draft, archived, view, onViewChange }: ProcessHeroProps) {
  return (
    <section
      className="tile-depth tile-sweep aura-radial mx-4 lg:mx-6 mt-4 p-5 md:p-6 animate-fade-in"
      style={{ ["--aura" as never]: "var(--process)" }}
    >
      <div className="absolute inset-0 pattern-grid opacity-60 pointer-events-none rounded-2xl" />
      <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-process/10 flex items-center justify-center shrink-0 ring-1 ring-process/15">
            <Workflow className="w-5 h-5 text-process" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Process Catalogue</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Fiche Processus — ISO 9001</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Stat label="Total" value={total} />
              <Stat label="Active" value={active} tone="success" />
              <Stat label="Draft" value={draft} tone="muted" />
              <Stat label="Archived" value={archived} tone="muted" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center rounded-full bg-muted/70 backdrop-blur-sm p-1 self-start md:self-center ring-1 ring-border/60">
          <ViewBtn active={view === "grid"} onClick={() => onViewChange("grid")} icon={LayoutGrid} label="Grid" />
          <ViewBtn active={view === "table"} onClick={() => onViewChange("table")} icon={TableIcon} label="Table" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "muted" }) {
  return (
    <div className={cn(
      "inline-flex items-baseline gap-1.5 px-2.5 py-1 rounded-lg ring-1",
      tone === "success" && "bg-success/8 ring-success/15",
      tone === "muted" && "bg-muted/60 ring-border/60",
      tone === "default" && "bg-card ring-border/60",
    )}>
      <span className={cn(
        "font-mono text-sm font-bold tabular-nums",
        tone === "success" && "text-success",
        tone === "muted" && "text-muted-foreground",
      )}>{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

function ViewBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof LayoutGrid; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 min-h-0",
        active ? "bg-card text-foreground shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
