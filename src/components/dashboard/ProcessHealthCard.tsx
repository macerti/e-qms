import { Workflow, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Process } from "@/api/contracts/viewModels";

interface ProcessHealthCardProps {
  processes: Process[];
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted-foreground", bgColor: "bg-muted/60" },
  active: { label: "Active", color: "bg-success", bgColor: "bg-success/8" },
} as const;

export function ProcessHealthCard({ processes }: ProcessHealthCardProps) {
  const navigate = useNavigate();
  
  const activeProcesses = processes.filter(p => p.status !== "archived");
  const byStatus = {
    draft: activeProcesses.filter(p => p.status === "draft").length,
    active: activeProcesses.filter(p => p.status === "active").length,
  };

  // Identify problematic processes
  const withNoActivities = activeProcesses.filter(p => !p.activities || p.activities.length === 0);
  const withNoRequirements = activeProcesses.filter(p => 
    p.activities.every(a => !a.allocatedRequirementIds?.length)
  );

  const issues: { label: string; count: number; filter?: string }[] = [];
  if (withNoActivities.length > 0) {
    issues.push({ label: "No activities", count: withNoActivities.length });
  }
  if (withNoRequirements.length > 0) {
    issues.push({ label: "No requirements allocated", count: withNoRequirements.length });
  }

  return (
    <div className="signal-card space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-process/10 flex items-center justify-center">
          <Workflow className="w-4.5 h-4.5 text-process" />
        </div>
        <div>
          <h3 className="font-semibold text-sm leading-tight">Process Health</h3>
          <p className="text-[11px] text-muted-foreground">{activeProcesses.length} active processes</p>
        </div>
      </div>
      
      {/* Status breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {(["draft", "active"] as const).map((status) => (
          <button
            key={status}
            onClick={() => navigate(`/processes?status=${status}`)}
            className={cn(
              "flex flex-col items-center p-3 rounded-xl transition-all duration-200",
              statusConfig[status].bgColor,
              "hover:shadow-metric active:scale-[0.97]"
            )}
          >
            <span className={cn(
              "w-2.5 h-2.5 rounded-full mb-1.5",
              statusConfig[status].color
            )} />
            <span className="font-mono text-xl font-bold leading-none">{byStatus[status]}</span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide mt-1">
              {statusConfig[status].label}
            </span>
          </button>
        ))}
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-1.5 pt-3 border-t border-border">
          {issues.map((issue, i) => (
            <div 
              key={i}
              className="flex items-center justify-between text-xs py-1"
            >
              <span className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-3.5 h-3.5" />
                {issue.label}
              </span>
              <span className="font-mono font-semibold bg-warning/10 text-warning px-2 py-0.5 rounded-md">
                {issue.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
