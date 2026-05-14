import { ArrowRight, Settings, Cog, Wrench, Scale, ListChecks, AlertTriangle, TrendingUp, CheckSquare, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Process, ProcessType } from "@/api/contracts/viewModels";

interface ProcessCardProps {
  process: Process;
  index: number;
  risks: number;
  opportunities: number;
  actions: number;
  documents: number;
  onClick: () => void;
}

const TYPE: Record<ProcessType, { label: string; icon: typeof Settings; aura: string; tint: string; ring: string; text: string }> = {
  management:  { label: "Management",  icon: Settings, aura: "var(--audit)",   tint: "bg-audit/10",   ring: "ring-audit/20",   text: "text-audit" },
  operational: { label: "Operational", icon: Cog,      aura: "var(--process)", tint: "bg-process/10", ring: "ring-process/20", text: "text-process" },
  support:     { label: "Support",     icon: Wrench,   aura: "var(--warning)", tint: "bg-warning/10", ring: "ring-warning/20", text: "text-warning" },
};

export function ProcessCard({ process, index, risks, opportunities, actions, documents, onClick }: ProcessCardProps) {
  const t = TYPE[process.type];
  const TypeIcon = t.icon;
  const regulationsCount = process.regulations?.length || 0;

  return (
    <button
      onClick={onClick}
      className="tile-depth tile-depth-hover aura-radial group w-full text-left p-5 animate-fade-in"
      style={{
        animationDelay: `${index * 30}ms`,
        ["--aura" as never]: t.aura,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-80 rounded-t-2xl" style={{ background: `hsl(${t.aura})` }} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn("inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1", t.tint, t.ring, t.text)}>
              {process.code}
            </span>
            <StatusBadge status={process.status} />
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ring-1", t.tint, t.ring, t.text)}>
              <TypeIcon className="w-3 h-3" />
              {t.label}
            </span>
          </div>
          <h3 className="font-semibold text-[15px] leading-snug truncate">{process.name}</h3>
          {process.purpose && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
              {process.purpose}
            </p>
          )}
          {process.pilotName && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <User className="w-3 h-3" />
              {process.pilotName}
            </p>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-3 sm:grid-cols-5 gap-2">
        <Mini icon={ListChecks} value={process.activities?.length || 0} label="Acts" />
        <Mini icon={AlertTriangle} value={risks} label="Risks" tone={risks > 0 ? "risk" : "default"} />
        <Mini icon={TrendingUp} value={opportunities} label="Opps" tone={opportunities > 0 ? "success" : "default"} />
        <Mini icon={CheckSquare} value={actions} label="Actions" />
        <Mini icon={FileText} value={documents} label="Docs" />
        {regulationsCount > 0 && (
          <Mini icon={Scale} value={regulationsCount} label="Regs" tone="warning" />
        )}
      </div>
    </button>
  );
}

function Mini({
  icon: Icon, value, label, tone = "default",
}: { icon: typeof ListChecks; value: number; label: string; tone?: "default" | "risk" | "success" | "warning" }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon className={cn(
        "w-3.5 h-3.5 shrink-0",
        tone === "default" && "text-muted-foreground/70",
        tone === "risk" && "text-risk",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning",
      )} />
      <span className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        tone === "risk" && "text-risk",
      )}>{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{label}</span>
    </div>
  );
}
