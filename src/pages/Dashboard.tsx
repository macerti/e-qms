import { 
  Workflow, 
  AlertTriangle, 
  CheckSquare, 
  FileText,
  FolderKanban
} from "lucide-react";
import { ComplianceCard } from "@/components/dashboard/ComplianceCard";
import { ProcessHealthCard } from "@/components/dashboard/ProcessHealthCard";
import { RiskActionCard } from "@/components/dashboard/RiskActionCard";
import { ISO9001_REQUIREMENTS, getUniqueRequirements } from "@/data/iso9001-requirements";
import { PageHeader } from "@/components/layout/PageHeader";
import { ModuleCard } from "@/components/ui/module-card";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { useManagementSystem } from "@/context/ManagementSystemContext";

const modules = [
  {
    id: "processes",
    title: "Processes",
    description: "Define and manage organizational processes with inputs, outputs, and ownership.",
    icon: Workflow,
    path: "/processes",
    isActive: true,
    accentColor: "bg-process",
  },
  {
    id: "issues",
    title: "Context & Issues",
    description: "SWOT analysis, risks and opportunities identification per process.",
    icon: AlertTriangle,
    path: "/issues",
    isActive: true,
    accentColor: "bg-warning",
  },
  {
    id: "actions",
    title: "Action Plan",
    description: "Corrective and improvement actions with full traceability to source.",
    icon: CheckSquare,
    path: "/actions",
    isActive: true,
    accentColor: "bg-action",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Prefilled QMS procedure hierarchy with forms and records.",
    icon: FolderKanban,
    path: "/documents",
    isActive: true,
    accentColor: "bg-primary",
  },
];

export default function Dashboard() {
  const { processes, issues, actions, documents, getOverdueActions, allRequirements, getRequirementsOverview } = useManagementSystem();

  const overdueActions = getOverdueActions();

  // Calculate compliance coverage
  const totalRequirements = ISO9001_REQUIREMENTS.length;
  
  // Count all allocated requirements across all processes
  const allocatedRequirementIds = new Set<string>();
  processes.forEach(process => {
    process.activities.forEach(activity => {
      if (activity.allocatedRequirementIds) {
        activity.allocatedRequirementIds.forEach(id => allocatedRequirementIds.add(id));
      }
    });
  });
  // Generic requirements are always considered allocated
  allRequirements.filter(r => r.type === "generic").forEach(r => allocatedRequirementIds.add(r.id));
  
  const allocatedCount = allocatedRequirementIds.size;

  // Get unallocated unique requirements
  const uniqueReqs = getUniqueRequirements();
  const unallocatedUniqueCount = uniqueReqs.filter(r => !allocatedRequirementIds.has(r.id)).length;

  const requirementsStats = processes.reduce(
    (acc, process) => {
      const overview = getRequirementsOverview(process.id);
      acc.allocated += overview.allocated;
      acc.satisfied += overview.satisfied;
      acc.notSatisfied += overview.notSatisfied;
      return acc;
    },
    { allocated: 0, satisfied: 0, notSatisfied: 0 },
  );

  const satisfactionRate = requirementsStats.allocated > 0
    ? Math.round((requirementsStats.satisfied / requirementsStats.allocated) * 100)
    : 0;
  const pendingRate = requirementsStats.allocated > 0
    ? Math.round((requirementsStats.notSatisfied / requirementsStats.allocated) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Management System" 
        subtitle="ISO 9001 Quality Management"
      />
      
      <AdaptiveContainer className="py-6 space-y-6 max-w-[var(--wide-max-width)]">
        {/* Signal Cards */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            System Signals
          </h2>
          <AdaptiveGrid cols="1-2-3" gap="md">
            <ComplianceCard
              totalRequirements={totalRequirements}
              allocatedCount={allocatedCount}
              unallocatedUniqueCount={unallocatedUniqueCount}
            />
            <ProcessHealthCard processes={processes} />
            <RiskActionCard 
              issues={issues} 
              actions={actions}
              overdueActions={overdueActions}
            />
          </AdaptiveGrid>
        </section>

        {/* Modules Grid */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Modules (Demo dataset loaded)
          </h2>
          <AdaptiveGrid cols="1-2-3" gap="md">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                title={module.title}
                description={module.description}
                icon={module.icon}
                path={module.path}
                isActive={module.isActive}
                accentColor={module.accentColor}
                count={
                  module.id === "processes" ? processes.length :
                  module.id === "issues" ? issues.length :
                  module.id === "actions" ? actions.length :
                  module.id === "documents" ? documents.length :
                  undefined
                }
              />
            ))}
          </AdaptiveGrid>
        </section>

        {/* Standard Info */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Requirements fulfillment (allocated set)
          </h2>
          <AdaptiveGrid cols="1-2-3" gap="md">
            <div className="mobile-card">
              <p className="text-xs text-muted-foreground">Allocated requirements</p>
              <p className="text-2xl font-semibold mt-1">{requirementsStats.allocated}</p>
              <p className="text-xs text-muted-foreground mt-2">Across all process activities</p>
            </div>
            <div className="mobile-card border-green-200 bg-green-50/60">
              <p className="text-xs text-green-700">Satisfied</p>
              <p className="text-2xl font-semibold mt-1 text-green-700">{requirementsStats.satisfied} ({satisfactionRate}%)</p>
              <p className="text-xs text-green-700 mt-2">Evidence inferred from linked documents, issues and actions</p>
            </div>
            <div className="mobile-card border-amber-200 bg-amber-50/60">
              <p className="text-xs text-amber-700">Allocated but not yet satisfied</p>
              <p className="text-2xl font-semibold mt-1 text-amber-700">{requirementsStats.notSatisfied} ({pendingRate}%)</p>
              <p className="text-xs text-amber-700 mt-2">Needs stronger evidence (docs, evaluated actions, or issue traceability)</p>
            </div>
          </AdaptiveGrid>
        </section>

        <section className="max-w-md">
          <div className="mobile-card bg-primary text-primary-foreground">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
              <div>
                <h3 className="font-semibold">ISO 9001:2015</h3>
                <p className="text-sm opacity-80 mt-1">
                  Quality management systems — Requirements
                </p>
                <p className="text-xs opacity-60 mt-2 font-mono">
                  Active standard for this system
                </p>
              </div>
            </div>
          </div>
        </section>
      </AdaptiveContainer>
    </div>
  );
}
