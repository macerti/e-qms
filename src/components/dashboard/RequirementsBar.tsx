import { cn } from "@/lib/utils";

interface RequirementsBarProps {
  satisfied: number;
  pending: number;
  unallocated: number;
}

export function RequirementsBar({ satisfied, pending, unallocated }: RequirementsBarProps) {
  const total = Math.max(satisfied + pending + unallocated, 1);
  const segs = [
    { key: "satisfied", value: satisfied, color: "bg-success", label: "Satisfied", text: "text-success" },
    { key: "pending",   value: pending,   color: "bg-warning", label: "Pending",   text: "text-warning" },
    { key: "unalloc",   value: unallocated, color: "bg-muted-foreground/40", label: "Unallocated", text: "text-muted-foreground" },
  ];

  return (
    <div
      className="tile-depth aura-radial p-6 animate-fade-in"
      style={{ ["--aura" as never]: "var(--success)" }}
    >
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-base">Requirements Fulfillment</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Evidence inferred across processes</p>
        </div>
        <div className="font-mono text-3xl font-bold tabular-nums">
          {satisfied + pending + unallocated}
          <span className="text-sm text-muted-foreground font-medium ml-1.5">total</span>
        </div>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segs.map((s) => (
          <div
            key={s.key}
            className={cn("h-full transition-all duration-700 ease-out", s.color)}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        {segs.map((s) => (
          <div key={s.key} className="flex items-center gap-2.5">
            <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.color)} />
            <div className="min-w-0">
              <div className={cn("font-mono text-lg font-bold leading-none tabular-nums", s.text)}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
