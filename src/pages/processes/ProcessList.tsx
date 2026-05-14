import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Workflow, Settings, Cog, Wrench } from "lucide-react";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { CreateProcessDialog } from "@/components/process/CreateProcessDialog";
import { ProcessHero } from "@/components/processes/ProcessHero";
import { ProcessCard } from "@/components/processes/ProcessCard";

export default function ProcessList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { processes, issues, actions, documents } = useManagementSystem();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const statusParam = searchParams.get("status") || "all";
  const typeParam = searchParams.get("type") || "all";
  const searchParam = searchParams.get("q") || "";
  const viewParam = (searchParams.get("view") as "grid" | "table") || "grid";

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
    setSearchParams(viewParam !== "grid" ? { view: viewParam } : {});
  }, [setSearchParams, viewParam]);

  const setView = useCallback((v: "grid" | "table") => {
    const next = new URLSearchParams(searchParams);
    if (v === "grid") next.delete("view"); else next.set("view", v);
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const totals = useMemo(() => ({
    total: processes.length,
    active: processes.filter(p => p.status === "active").length,
    draft: processes.filter(p => p.status === "draft").length,
    archived: processes.filter(p => p.status === "archived").length,
  }), [processes]);

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
      <PageHeader title="Processes" subtitle="Fiche Processus — ISO 9001" />

      <ProcessHero
        total={totals.total}
        active={totals.active}
        draft={totals.draft}
        archived={totals.archived}
        view={viewParam}
        onViewChange={setView}
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
        ) : viewParam === "table" ? (
          <ProcessTableView processes={filteredProcesses} onOpen={(id) => navigate(`/processes/${id}`)} />
        ) : (
          <AdaptiveGrid cols="1-2-3-4" gap="md">
            {filteredProcesses.map((process, index) => (
              <ProcessCard
                key={process.id}
                process={process}
                index={index}
                risks={issues.filter((i) => i.processId === process.id && i.type === "risk").length}
                opportunities={issues.filter((i) => i.processId === process.id && i.type === "opportunity").length}
                actions={actions.filter((a) => a.processId === process.id).length}
                documents={documents.filter((d) => d.processIds.includes(process.id) && d.status !== "archived").length}
                onClick={() => navigate(`/processes/${process.id}`)}
              />
            ))}
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

function ProcessTableView({ processes, onOpen }: { processes: ReturnType<typeof useManagementSystem>["processes"]; onOpen: (id: string) => void }) {
  return (
    <div className="tile-depth overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Code</th>
              <th className="text-left font-semibold px-4 py-3">Name</th>
              <th className="text-left font-semibold px-4 py-3">Type</th>
              <th className="text-left font-semibold px-4 py-3">Status</th>
              <th className="text-left font-semibold px-4 py-3">Pilot</th>
              <th className="text-right font-semibold px-4 py-3">Activities</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr
                key={p.id}
                onClick={() => onOpen(p.id)}
                className="border-t border-border/60 hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs font-semibold text-process">{p.code}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{p.type}</td>
                <td className="px-4 py-3 capitalize">{p.status}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.pilotName || "—"}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{p.activities?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
