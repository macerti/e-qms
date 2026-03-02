import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Workflow, ArrowRight, Settings, Cog, Wrench, Scale } from "lucide-react";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { StatusBadge } from "@/components/ui/status-badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";
import { ProcessType } from "@/api/contracts/viewModels";
import { CreateProcessDialog } from "@/components/process/CreateProcessDialog";

const PROCESS_TYPE_CONFIG: Record<ProcessType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  management: { label: "Mgmt", icon: Settings, color: "text-purple-600", bgColor: "bg-purple-100" },
  operational: { label: "Oper", icon: Cog, color: "text-process", bgColor: "bg-blue-100" },
  support: { label: "Supp", icon: Wrench, color: "text-amber-600", bgColor: "bg-amber-100" },
};

export default function ProcessList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { processes, issues, actions, documents } = useManagementSystem();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const statusParam = searchParams.get("status") || "all";
  const typeParam = searchParams.get("type") || "all";
  const searchParam = searchParams.get("q") || "";

  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: statusParam,
    type: typeParam,
  });
  const [searchValue, setSearchValue] = useState(searchParam);

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
        { value: "archived", label: "Archived" },
      ],
      defaultValue: "all",
    },
    {
      id: "type",
      label: "Type",
      options: [
        { value: "all", label: "All Types" },
        { value: "management", label: "Management", icon: <Settings className="w-3.5 h-3.5" /> },
        { value: "operational", label: "Operational", icon: <Cog className="w-3.5 h-3.5" /> },
        { value: "support", label: "Support", icon: <Wrench className="w-3.5 h-3.5" /> },
      ],
      defaultValue: "all",
    },
  ], []);

  const handleFilterChange = useCallback((filterId: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterId]: value }));
  }, []);

  const handleClearAll = useCallback(() => {
    setFilterValues({ status: "all", type: "all" });
    setSearchValue("");
    setSearchParams({});
  }, [setSearchParams]);

  const filteredProcesses = useMemo(() => {
    return processes.filter((p) => {
      if (filterValues.status !== "all" && p.status !== filterValues.status) return false;
      if (filterValues.type !== "all" && p.type !== filterValues.type) return false;
      if (searchValue) {
        const query = searchValue.toLowerCase();
        if (!p.name.toLowerCase().includes(query) && !p.code.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [processes, filterValues, searchValue]);

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Processes" 
        subtitle="Fiche Processus — ISO 9001"
      />

      <FilterBar
        filters={filterConfigs}
        searchPlaceholder="Search by name or code..."
        values={filterValues}
        searchValue={searchValue}
        onFilterChange={handleFilterChange}
        onSearchChange={setSearchValue}
        onClearAll={handleClearAll}
      />

      <AdaptiveContainer className="py-5">
        {filteredProcesses.length === 0 ? (
          <EmptyState
            icon={Workflow}
            title="No processes defined"
            description="Processes are the backbone of your management system. Start by defining your key organizational processes."
            actionLabel="Create First Process"
            onAction={() => setShowCreateDialog(true)}
            helperText="Each process will have inputs, outputs, a pilot, and linked indicators, risks, and actions."
          />
        ) : (
          <AdaptiveGrid cols="1-2-3-4" gap="md">
            {filteredProcesses.map((process, index) => {
              const typeConfig = PROCESS_TYPE_CONFIG[process.type];
              const TypeIcon = typeConfig.icon;
              const regulationsCount = process.regulations?.length || 0;
              const risksCount = issues.filter((issue) => issue.processId === process.id && issue.type === "risk").length;
              const opportunitiesCount = issues.filter((issue) => issue.processId === process.id && issue.type === "opportunity").length;
              const actionsCount = actions.filter((action) => action.processId === process.id).length;
              const documentsCount = documents.filter((document) => document.processIds.includes(process.id) && document.status !== "archived").length;
              
              return (
                <button
                  key={process.id}
                  onClick={() => navigate(`/processes/${process.id}`)}
                  className="process-card w-full text-left group animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-mono text-xs text-process font-semibold bg-process/8 px-2 py-0.5 rounded-md">
                          {process.code}
                        </span>
                        <StatusBadge status={process.status} />
                        <div className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs",
                          typeConfig.bgColor,
                          typeConfig.color
                        )}>
                          <TypeIcon className="w-3 h-3" />
                          <span className="font-medium">{typeConfig.label}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold truncate text-[15px]">{process.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                        {process.purpose}
                      </p>
                      {process.pilotName && (
                        <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                          Pilot: {process.pilotName}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-1 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/60 flex-wrap">
                    <StatChip label="Activities" value={process.activities?.length || 0} />
                    <StatChip label="Risks" value={risksCount} highlight={risksCount > 0} />
                    <StatChip label="Opps" value={opportunitiesCount} />
                    <StatChip label="Actions" value={actionsCount} />
                    <StatChip label="Docs" value={documentsCount} />
                    {regulationsCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono text-sm font-semibold">{regulationsCount}</span>
                        <span className="text-[11px] text-muted-foreground">Regs</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </AdaptiveGrid>
        )}
      </AdaptiveContainer>

      <Fab onClick={() => setShowCreateDialog(true)} label="Create process" />
      
      <CreateProcessDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
}

function StatChip({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-0.5 rounded-md",
      highlight && value > 0 && "bg-risk/5"
    )}>
      <span className={cn(
        "font-mono text-sm font-semibold",
        highlight && value > 0 && "text-risk"
      )}>{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
