 import { useState, useMemo, useCallback } from "react";
 import { useNavigate, useSearchParams } from "react-router-dom";
 import { CheckSquare, ArrowRight, Clock, AlertCircle } from "lucide-react";
 import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { StatusBadge } from "@/components/ui/status-badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
 import { ActionStatus } from "@/api/contracts/viewModels";
import { format, isPast, isToday } from "date-fns";

const originLabels: Record<string, string> = {
  issue: "Issue",
  internal_audit: "Internal Audit",
  external_audit: "External Audit",
  management_review: "Management Review",
  objective_not_met: "Objective Not Met",
  other: "Other",
};

 export default function ActionList() {
   const navigate = useNavigate();
   const [searchParams, setSearchParams] = useSearchParams();
   const { actions, processes } = useManagementSystem();
   
   const processParam = searchParams.get("process") || "all";
   const statusParam = searchParams.get("status") || "all";
   
   const [filterValues, setFilterValues] = useState<Record<string, string>>({
     status: statusParam,
     process: processParam,
     issue: "all",
   });
   const [searchValue, setSearchValue] = useState("");
 
   // Build filter configs
   const filterConfigs: FilterConfig[] = useMemo(() => [
     {
       id: "status",
       label: "Status",
       options: [
         { value: "all", label: "All" },
         { value: "planned", label: "Planned" },
         { value: "in_progress", label: "In Progress" },
         { value: "completed_pending_evaluation", label: "Pending Eval" },
         { value: "evaluated", label: "Evaluated" },
       ],
       defaultValue: "all",
     },
     {
       id: "process",
       label: "Process",
       options: [
         { value: "all", label: "All Processes" },
         ...processes.filter(p => p.status !== "archived").map(p => ({
           value: p.id,
           label: p.code,
         })),
       ],
       defaultValue: "all",
     },
     {
       id: "issue",
       label: "Linked Issue",
       options: [
         { value: "all", label: "All" },
         { value: "with_issue", label: "With Issue" },
         { value: "without_issue", label: "No Issue" },
       ],
       defaultValue: "all",
     },
   ], [processes]);
 
   const handleFilterChange = useCallback((filterId: string, value: string) => {
     setFilterValues(prev => ({ ...prev, [filterId]: value }));
   }, []);
 
   const handleClearAll = useCallback(() => {
     setFilterValues({ status: "all", process: "all", issue: "all" });
     setSearchValue("");
     setSearchParams({});
   }, [setSearchParams]);
 
   const filteredActions = useMemo(() => {
     return actions.filter((action) => {
       // Status filter
       if (filterValues.status !== "all" && action.status !== filterValues.status) return false;
       // Process filter
       if (filterValues.process !== "all" && action.processId !== filterValues.process) return false;
       // Issue link filter
       if (filterValues.issue === "with_issue" && (!action.linkedIssueIds || action.linkedIssueIds.length === 0)) {
         return false;
       }
       if (filterValues.issue === "without_issue" && action.linkedIssueIds && action.linkedIssueIds.length > 0) {
         return false;
       }
       // Search filter
       if (searchValue) {
         const query = searchValue.toLowerCase();
         if (!action.title.toLowerCase().includes(query) && !action.code.toLowerCase().includes(query)) {
           return false;
         }
       }
       return true;
     });
   }, [actions, filterValues, searchValue]);

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

 
       <FilterBar
         filters={filterConfigs}
         searchPlaceholder="Search actions..."
         values={filterValues}
         searchValue={searchValue}
         onFilterChange={handleFilterChange}
         onSearchChange={setSearchValue}
         onClearAll={handleClearAll}
       />

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
          <AdaptiveGrid cols="1-2-3" gap="md">
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
                      {originLabels[action.origin]}
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

