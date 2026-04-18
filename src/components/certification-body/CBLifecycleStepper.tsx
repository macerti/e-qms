import { Check, Circle } from "lucide-react";
import { LIFECYCLE_LABELS, LIFECYCLE_ORDER, LIFECYCLE_CLAUSE } from "@/domains/certification-body/cbLifecycle";
import type { CertificationLifecycleStage } from "@/domains/certification-body/models";
import { cn } from "@/lib/utils";

interface CBLifecycleStepperProps {
  current: CertificationLifecycleStage;
  className?: string;
}

/**
 * Horizontal scrollable stepper that visualises the certification lifecycle
 * defined in ISO/IEC 17021-1 §9.
 */
export function CBLifecycleStepper({ current, className }: CBLifecycleStepperProps) {
  const currentIdx = LIFECYCLE_ORDER.indexOf(current);

  return (
    <div className={cn("no-scrollbar touch-scroll overflow-x-auto", className)}>
      <ol className="flex min-w-max items-center gap-2 py-1">
        {LIFECYCLE_ORDER.map((stage, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <li key={stage} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.7rem] font-medium whitespace-nowrap transition-colors",
                  done && "border-success/40 bg-success/10 text-success",
                  active && "border-primary bg-primary/10 text-primary shadow-sm",
                  !done && !active && "border-border/60 bg-muted/40 text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                <span>{LIFECYCLE_LABELS[stage]}</span>
                <span className="font-mono text-[0.6rem] opacity-70">§{LIFECYCLE_CLAUSE[stage]}</span>
              </div>
              {idx < LIFECYCLE_ORDER.length - 1 && (
                <span className={cn("h-px w-4 bg-border", done && "bg-success/40")} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
