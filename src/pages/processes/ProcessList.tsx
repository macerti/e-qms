import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Workflow, ArrowRight, Settings, Cog, Wrench, Scale } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { StatusBadge } from "@/components/ui/status-badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";
import { ProcessType } from "@/types/management-system";
import { CreateProcessDialog } from "@/components/process/CreateProcessDialog";

const PROCESS_TYPE_CONFIG: Record<ProcessType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  management: { label: "Mgmt", icon: Settings, color: "text-purple-600", bgColor: "bg-purple-100" },
  operational: { label: "Oper", icon: Cog, color: "text-process", bgColor: "bg-blue-100" },
  support: { label: "Supp", icon: Wrench, color: "text-amber-600", bgColor: "bg-amber-100" },
};

export default function ProcessList() {
  const navigate = useNavigate();
  const { processes } = useManagementSystem();
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ProcessType>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredProcesses = processes.filter((p) => {
    if (p.status === "archived") return false;
    if (filter !== "all" && p.status !== filter) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Processes" 
        subtitle="Fiche Processus — ISO 9001"
      />

      {processes.length > 0 && (
        <AdaptiveContainer padding="default" className="py-3 space-y-3 border-b border-border">
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <FilterButton 
              active={filter === "all"} 
              onClick={() => setFilter("all")}
            >
              All
            </FilterButton>
            <FilterButton 
              active={filter === "active"} 
              onClick={() => setFilter("active")}
            >
              Active
            </FilterButton>
            <FilterButton 
              active={filter === "draft"} 
              onClick={() => setFilter("draft")}
            >
              Draft
            </FilterButton>
          </div>
          
          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <FilterButton 
              active={typeFilter === "all"} 
              onClick={() => setTypeFilter("all")}
              variant="secondary"
            >
              All Types
            </FilterButton>
            <FilterButton 
              active={typeFilter === "management"} 
              onClick={() => setTypeFilter("management")}
              variant="secondary"
            >
              <Settings className="w-3.5 h-3.5 mr-1" />
              Mgmt
            </FilterButton>
            <FilterButton 
              active={typeFilter === "operational"} 
              onClick={() => setTypeFilter("operational")}
              variant="secondary"
            >
              <Cog className="w-3.5 h-3.5 mr-1" />
              Oper
            </FilterButton>
            <FilterButton 
              active={typeFilter === "support"} 
              onClick={() => setTypeFilter("support")}
              variant="secondary"
            >
              <Wrench className="w-3.5 h-3.5 mr-1" />
              Supp
            </FilterButton>
          </div>
        </AdaptiveContainer>
      )}

      <AdaptiveContainer className="py-4">
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
          <AdaptiveGrid cols="1-2" gap="md">
            {filteredProcesses.map((process) => {
              const typeConfig = PROCESS_TYPE_CONFIG[process.type];
              const TypeIcon = typeConfig.icon;
              const regulationsCount = process.regulations?.length || 0;
              
              return (
                <button
                  key={process.id}
                  onClick={() => navigate(`/processes/${process.id}`)}
                  className="process-card w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-process font-medium">
                          {process.code}
                        </span>
                        <StatusBadge status={process.status} />
                        <div className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
                          typeConfig.bgColor,
                          typeConfig.color
                        )}>
                          <TypeIcon className="w-3 h-3" />
                          <span className="font-medium">{typeConfig.label}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold truncate">{process.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {process.purpose}
                      </p>
                      {process.pilotName && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Pilot: {process.pilotName}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    <StatChip label="Activities" value={process.activities?.length || 0} />
                    <StatChip label="Risks" value={process.riskIds.length} />
                    <StatChip label="Actions" value={process.actionIds.length} />
                    {regulationsCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono text-sm font-medium">{regulationsCount}</span>
                        <span className="text-xs text-muted-foreground">Regs</span>
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

function FilterButton({ 
  children, 
  active, 
  onClick,
  variant = "primary"
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center whitespace-nowrap",
        active 
          ? variant === "primary" 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted-foreground text-background"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm font-medium">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
