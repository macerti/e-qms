import { FileText, Workflow, AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroBandProps {
  standardCode: string;
  standardVersion: string;
  standardName: string;
  compliancePct: number;
  processCount: number;
  openRisks: number;
  overdueActions: number;
}

export function HeroBand({
  standardCode,
  standardVersion,
  standardName,
  compliancePct,
  processCount,
  openRisks,
  overdueActions,
}: HeroBandProps) {
  return (
    <section
      className="tile-depth tile-sweep aura-radial p-6 md:p-8 animate-fade-in"
      style={{ ["--aura" as never]: "var(--process)" }}
    >
      <div className="absolute inset-0 pattern-dots opacity-60 pointer-events-none rounded-2xl" />
      <div className="relative grid gap-6 md:grid-cols-[1.2fr_2fr] md:items-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-medium uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active standard
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {standardCode} <span className="text-muted-foreground font-normal">{standardVersion}</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            {standardName}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiPill icon={ShieldCheck} label="Compliance" value={`${compliancePct}%`} tone="process" />
          <KpiPill icon={Workflow} label="Processes" value={processCount} tone="primary" />
          <KpiPill icon={AlertTriangle} label="Open Risks" value={openRisks} tone="risk" />
          <KpiPill icon={Clock} label="Overdue" value={overdueActions} tone="warning" />
        </div>
      </div>
    </section>
  );
}

const TONE: Record<string, { text: string; bg: string; ring: string }> = {
  process:  { text: "text-process",  bg: "bg-process/10",  ring: "ring-process/20" },
  primary:  { text: "text-primary",  bg: "bg-primary/8",   ring: "ring-primary/15" },
  risk:     { text: "text-risk",     bg: "bg-risk/10",     ring: "ring-risk/20" },
  warning:  { text: "text-warning",  bg: "bg-warning/10",  ring: "ring-warning/20" },
};

function KpiPill({
  icon: Icon, label, value, tone,
}: { icon: typeof FileText; label: string; value: string | number; tone: keyof typeof TONE }) {
  const t = TONE[tone];
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card/70 backdrop-blur-sm ring-1", t.ring)}>
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", t.bg)}>
        <Icon className={cn("w-4 h-4", t.text)} />
      </div>
      <div className="min-w-0">
        <div className={cn("font-mono text-xl font-bold leading-none tabular-nums", t.text)}>{value}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 truncate">{label}</div>
      </div>
    </div>
  );
}
