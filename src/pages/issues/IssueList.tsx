import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, TrendingUp, ArrowRight, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";
import { IssueType, SwotQuadrant } from "@/types/management-system";

const quadrantConfig: Record<SwotQuadrant, { label: string; color: string; bgColor: string }> = {
  strength: { label: "Strength", color: "text-swot-strength", bgColor: "bg-swot-strength/10" },
  weakness: { label: "Weakness", color: "text-swot-weakness", bgColor: "bg-swot-weakness/10" },
  opportunity: { label: "Opportunity", color: "text-swot-opportunity", bgColor: "bg-swot-opportunity/10" },
  threat: { label: "Threat", color: "text-swot-threat", bgColor: "bg-swot-threat/10" },
};

export default function IssueList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { issues, processes } = useManagementSystem();
  
  const processFilter = searchParams.get("process");
  const typeFilter = searchParams.get("type") as IssueType | null;
  
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");
  const [selectedProcess, setSelectedProcess] = useState<string | "all">(processFilter || "all");

  const filteredIssues = issues.filter((issue) => {
    if (selectedProcess !== "all" && issue.processId !== selectedProcess) return false;
    if (typeFilter && issue.type !== typeFilter) return false;
    return true;
  });

  const getProcessName = (processId: string) => {
    const process = processes.find(p => p.id === processId);
    return process?.name || "Unknown Process";
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Context & Issues" 
        subtitle="Risks, Opportunities & SWOT Analysis"
      />

      {/* Process Filter */}
      {processes.length > 0 && (
        <AdaptiveContainer padding="default" className="py-3 border-b border-border">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <FilterChip
              selected={selectedProcess === "all"}
              onClick={() => setSelectedProcess("all")}
            >
              All Processes
            </FilterChip>
            {processes.filter(p => p.status !== "archived").map((process) => (
              <FilterChip
                key={process.id}
                selected={selectedProcess === process.id}
                onClick={() => setSelectedProcess(process.id)}
              >
                {process.code}
              </FilterChip>
            ))}
          </div>
        </AdaptiveContainer>
      )}

      <AdaptiveContainer className="py-4 space-y-4">
        {/* View Toggle */}
        {filteredIssues.length > 0 && (
          <div className="flex gap-2">
            <ViewButton
              active={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              List View
            </ViewButton>
            <ViewButton
              active={viewMode === "matrix"}
              onClick={() => setViewMode("matrix")}
            >
              Matrix View
            </ViewButton>
          </div>
        )}

        {filteredIssues.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No issues identified"
            description="Context analysis helps identify internal and external factors affecting your management system."
            actionLabel="Add First Issue"
            onAction={() => navigate(`/issues/new${selectedProcess !== "all" ? `?process=${selectedProcess}` : ""}`)}
            helperText="Issues can be risks (threats, weaknesses) or opportunities (strengths, external opportunities)."
          />
        ) : viewMode === "list" ? (
          <AdaptiveGrid cols="1-2" gap="md">
            {filteredIssues.map((issue) => {
              const config = quadrantConfig[issue.quadrant];
              return (
                <button
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className={cn(
                    "mobile-card w-full text-left",
                    issue.type === "risk" ? "border-l-4 border-l-risk" : "border-l-4 border-l-opportunity"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("module-badge", config.bgColor, config.color)}>
                          {config.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {issue.origin === "internal" ? "Internal" : "External"}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{issue.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {getProcessName(issue.processId)}
                      </p>
                    </div>
                    
                    {issue.criticity !== undefined && (
                      <div className="text-right shrink-0">
                        <span className="text-xs text-muted-foreground">Criticity</span>
                        <p className={cn(
                          "font-mono text-lg font-bold",
                          issue.criticity >= 7 ? "text-risk" :
                          issue.criticity >= 4 ? "text-warning" :
                          "text-success"
                        )}>
                          {issue.criticity}
                        </p>
                        {issue.priority && (
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            issue.priority === '01' && "bg-risk/20 text-risk",
                            issue.priority === '02' && "bg-warning/20 text-warning",
                            issue.priority === '03' && "bg-success/20 text-success"
                          )}>
                            P{issue.priority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </AdaptiveGrid>
        ) : (
          <SwotMatrix issues={filteredIssues} />
        )}
      </AdaptiveContainer>

      <Fab 
        onClick={() => navigate(`/issues/new${selectedProcess !== "all" ? `?process=${selectedProcess}` : ""}`)} 
        label="Add issue" 
      />
    </div>
  );
}

function FilterChip({ 
  children, 
  selected, 
  onClick 
}: { 
  children: React.ReactNode; 
  selected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
        selected 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ViewButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
        active 
          ? "bg-secondary text-secondary-foreground" 
          : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SwotMatrix({ issues }: { issues: ReturnType<typeof useManagementSystem>["issues"] }) {
  const quadrants: SwotQuadrant[] = ["strength", "weakness", "opportunity", "threat"];
  
  return (
    <AdaptiveGrid cols="1-2" gap="sm">
      {quadrants.map((quadrant) => {
        const config = quadrantConfig[quadrant];
        const quadrantIssues = issues.filter(i => i.quadrant === quadrant);
        
        return (
          <div 
            key={quadrant}
            className={cn(
              "rounded-xl p-3 min-h-[120px]",
              config.bgColor
            )}
          >
            <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", config.color)}>
              {config.label}
            </h4>
            <div className="space-y-1.5">
              {quadrantIssues.slice(0, 3).map((issue) => (
                <p key={issue.id} className="text-xs line-clamp-2">
                  {issue.description}
                </p>
              ))}
              {quadrantIssues.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{quadrantIssues.length - 3} more
                </p>
              )}
              {quadrantIssues.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No items
                </p>
              )}
            </div>
          </div>
        );
      })}
    </AdaptiveGrid>
  );
}
