import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";
import { SwotQuadrant } from "@/api/contracts/viewModels";

const quadrantConfig: Record<SwotQuadrant, { label: string; color: string; bgColor: string }> = {
  strength: { label: "Strength", color: "text-swot-strength", bgColor: "bg-swot-strength/10" },
  weakness: { label: "Weakness", color: "text-swot-weakness", bgColor: "bg-swot-weakness/10" },
  opportunity: { label: "Opportunity", color: "text-swot-opportunity", bgColor: "bg-swot-opportunity/10" },
  threat: { label: "Threat", color: "text-swot-threat", bgColor: "bg-swot-threat/10" },
};

export default function IssueList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { issues, processes } = useManagementSystem();
  
  const typeParam = searchParams.get("type") || "all";
  const processParam = searchParams.get("process") || "all";
  
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    type: typeParam,
    process: processParam,
    status: "all",
  });
  const [searchValue, setSearchValue] = useState("");

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: "type",
      label: "Type",
      options: [
        { value: "all", label: "All" },
        { value: "risk", label: "Risk" },
        { value: "opportunity", label: "Opportunity" },
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
  ], [processes]);

  const handleFilterChange = useCallback((filterId: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterId]: value }));
  }, []);

  const handleClearAll = useCallback(() => {
    setFilterValues({ type: "all", process: "all", status: "all" });
    setSearchValue("");
    setSearchParams({});
  }, [setSearchParams]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (filterValues.type !== "all" && issue.type !== filterValues.type) return false;
      if (filterValues.process !== "all" && issue.processId !== filterValues.process) return false;
      if (searchValue) {
        const query = searchValue.toLowerCase();
        if (!issue.description.toLowerCase().includes(query) && !issue.code.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [issues, filterValues, searchValue]);

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

      <FilterBar
        filters={filterConfigs}
        searchPlaceholder="Search issues..."
        values={filterValues}
        searchValue={searchValue}
        onFilterChange={handleFilterChange}
        onSearchChange={setSearchValue}
        onClearAll={handleClearAll}
      />

      <AdaptiveContainer className="py-5 space-y-4">
        {/* View Toggle */}
        {filteredIssues.length > 0 && (
          <div className="flex gap-1 p-1 bg-muted/60 rounded-xl w-fit">
            <ViewButton active={viewMode === "list"} onClick={() => setViewMode("list")}>
              List View
            </ViewButton>
            <ViewButton active={viewMode === "matrix"} onClick={() => setViewMode("matrix")}>
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
            onAction={() => navigate(`/issues/new${filterValues.process !== "all" ? `?process=${filterValues.process}` : ""}`)}
            helperText="Issues can be risks (threats, weaknesses) or opportunities (strengths, external opportunities)."
          />
        ) : viewMode === "list" ? (
          <AdaptiveGrid cols="1-2-3" gap="md">
            {filteredIssues.map((issue, index) => {
              const config = quadrantConfig[issue.quadrant];
              return (
                <button
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className={cn(
                    "mobile-card w-full text-left group animate-fade-in",
                    issue.type === "risk" ? "border-l-4 border-l-risk hover:bg-risk/[0.02]" : "border-l-4 border-l-opportunity hover:bg-opportunity/[0.02]"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className={cn("module-badge", config.bgColor, config.color)}>
                          {config.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                          {issue.contextNature === "internal" ? "Internal" : "External"}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2 leading-relaxed">{issue.description}</p>
                      <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        {getProcessName(issue.processId)}
                      </p>
                    </div>
                    
                    {issue.criticity !== undefined && (
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Criticity</span>
                        <p className={cn(
                          "font-mono text-xl font-bold leading-none",
                          issue.criticity >= 7 ? "text-risk" :
                          issue.criticity >= 4 ? "text-warning" :
                          "text-success"
                        )}>
                          {issue.criticity}
                        </p>
                        {issue.priority && (
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-md",
                            issue.priority === '01' && "bg-risk/15 text-risk",
                            issue.priority === '02' && "bg-warning/15 text-warning",
                            issue.priority === '03' && "bg-success/15 text-success"
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
        onClick={() => navigate(`/issues/new${filterValues.process !== "all" ? `?process=${filterValues.process}` : ""}`)} 
        label="Add issue" 
      />
    </div>
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
        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        active 
          ? "bg-card text-foreground shadow-metric" 
          : "text-muted-foreground hover:text-foreground"
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
              "rounded-xl p-4 min-h-[140px] border border-border/40",
              config.bgColor
            )}
          >
            <h4 className={cn("text-xs font-semibold uppercase tracking-widest mb-3", config.color)}>
              {config.label}
              <span className="ml-2 font-mono opacity-60">{quadrantIssues.length}</span>
            </h4>
            <div className="space-y-2">
              {quadrantIssues.slice(0, 3).map((issue) => (
                <p key={issue.id} className="text-xs line-clamp-2 leading-relaxed bg-card/50 p-2 rounded-lg">
                  {issue.description}
                </p>
              ))}
              {quadrantIssues.length > 3 && (
                <p className="text-xs text-muted-foreground font-medium">
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
