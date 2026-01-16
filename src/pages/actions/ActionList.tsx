import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckSquare, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { StatusBadge } from "@/components/ui/status-badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";
import { ActionStatus } from "@/types/management-system";
import { format, isPast, isToday } from "date-fns";

const sourceLabels: Record<string, string> = {
  risk: "Risk",
  opportunity: "Opportunity", 
  internal_audit: "Internal Audit",
  external_audit: "External Audit",
  management_review: "Management Review",
};

export default function ActionList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { actions, processes } = useManagementSystem();
  
  const processFilter = searchParams.get("process");
  
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all");
  const [selectedProcess, setSelectedProcess] = useState<string | "all">(processFilter || "all");

  const filteredActions = actions.filter((action) => {
    if (selectedProcess !== "all" && action.processId !== selectedProcess) return false;
    if (statusFilter !== "all" && action.status !== statusFilter) return false;
    return true;
  });

  const getProcessName = (processId: string) => {
    const process = processes.find(p => p.id === processId);
    return process?.name || "Unknown Process";
  };

  const isOverdue = (deadline: string, status: ActionStatus) => {
    if (status === "evaluated" || status === "completed_pending_evaluation" || status === "cancelled") return false;
    return isPast(new Date(deadline)) && !isToday(new Date(deadline));
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Action Plan" 
        subtitle="Corrective & Improvement Actions"
      />

      {/* Filters */}
      <AdaptiveContainer padding="default" className="py-3 space-y-2 border-b border-border">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <FilterChip selected={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            All
          </FilterChip>
          <FilterChip selected={statusFilter === "planned"} onClick={() => setStatusFilter("planned")}>
            Planned
          </FilterChip>
          <FilterChip selected={statusFilter === "in_progress"} onClick={() => setStatusFilter("in_progress")}>
            In Progress
          </FilterChip>
          <FilterChip selected={statusFilter === "completed_pending_evaluation"} onClick={() => setStatusFilter("completed_pending_evaluation")}>
            Pending Eval
          </FilterChip>
          <FilterChip selected={statusFilter === "evaluated"} onClick={() => setStatusFilter("evaluated")}>
            Evaluated
          </FilterChip>
        </div>
        
        {/* Process Filter */}
        {processes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <FilterChip
              selected={selectedProcess === "all"}
              onClick={() => setSelectedProcess("all")}
              variant="secondary"
            >
              All Processes
            </FilterChip>
            {processes.filter(p => p.status !== "archived").map((process) => (
              <FilterChip
                key={process.id}
                selected={selectedProcess === process.id}
                onClick={() => setSelectedProcess(process.id)}
                variant="secondary"
              >
                {process.code}
              </FilterChip>
            ))}
          </div>
        )}
      </AdaptiveContainer>

      <AdaptiveContainer className="py-4">
        {filteredActions.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No actions defined"
            description="Actions track corrective measures and improvements arising from risks, audits, or management decisions."
            actionLabel="Create First Action"
            onAction={() => navigate("/actions/new")}
            helperText="Each action links to its source and the responsible process."
          />
        ) : (
          <AdaptiveGrid cols="1-2" gap="md">
            {filteredActions.map((action) => {
              const overdue = isOverdue(action.deadline, action.status);
              
              return (
                <button
                  key={action.id}
                  onClick={() => navigate(`/actions/${action.id}`)}
                  className="action-card w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-action font-medium">
                          {action.code}
                        </span>
                        <StatusBadge status={action.status} />
                        {overdue && (
                          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold truncate">{action.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(action.deadline), "dd MMM yyyy")}
                    </span>
                    <span className="bg-muted px-2 py-0.5 rounded">
                      {sourceLabels[action.sourceType]}
                    </span>
                    <span className="truncate">
                      {getProcessName(action.processId)}
                    </span>
                  </div>
                </button>
              );
            })}
          </AdaptiveGrid>
        )}
      </AdaptiveContainer>

      <Fab onClick={() => navigate("/actions/new")} label="Create action" />
    </div>
  );
}

function FilterChip({ 
  children, 
  selected, 
  onClick,
  variant = "primary"
}: { 
  children: React.ReactNode; 
  selected: boolean; 
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
        variant === "primary" 
          ? selected 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
          : selected
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}
