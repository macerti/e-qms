import { cn } from "@/lib/utils";
import { ProcessStatus, ActionStatus, RiskLevel } from "@/types/management-system";

type StatusType = ProcessStatus | ActionStatus | RiskLevel | 'achieved' | 'not_achieved' | 'at_risk';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Process statuses
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-success/15 text-success" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
  
  // Action statuses (new flow)
  planned: { label: "Planned", className: "bg-info/15 text-info" },
  in_progress: { label: "In Progress", className: "bg-warning/15 text-warning" },
  completed_pending_evaluation: { label: "Pending Evaluation", className: "bg-action/15 text-action" },
  evaluated: { label: "Evaluated", className: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  
  // Risk levels
  low: { label: "Low", className: "bg-success/15 text-success" },
  medium: { label: "Medium", className: "bg-warning/15 text-warning" },
  high: { label: "High", className: "bg-destructive/15 text-destructive" },
  critical: { label: "Critical", className: "bg-destructive text-destructive-foreground" },
  
  // KPI statuses
  achieved: { label: "Achieved", className: "bg-success/15 text-success" },
  not_achieved: { label: "Not Achieved", className: "bg-destructive/15 text-destructive" },
  at_risk: { label: "At Risk", className: "bg-warning/15 text-warning" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
