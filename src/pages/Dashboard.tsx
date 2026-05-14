import { 
  Workflow, 
  AlertTriangle, 
  CheckSquare, 
  FolderKanban
} from "lucide-react";
import { ComplianceCard } from "@/components/dashboard/ComplianceCard";
import { ProcessHealthCard } from "@/components/dashboard/ProcessHealthCard";
import { RiskActionCard } from "@/components/dashboard/RiskActionCard";
import { HeroBand } from "@/components/dashboard/HeroBand";
import { RequirementsBar } from "@/components/dashboard/RequirementsBar";
import { standardsEngineService } from "@/application/standards/standardsEngineService";
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
  const activeStandard = standardsEngineService.getDefaultStandard();

  const totalRequirements = standardsEngineService.getRequirements().length;

  const allocatedRequirementIds = new Set<string>();
  processes.forEach(process => {
    process.activities.forEach(activity => {
      if (activity.allocatedRequirementIds) {
        activity.allocatedRequirementIds.forEach(id => allocatedRequirementIds.add(id));
      }
    });
  });
  allRequirements.filter(r => r.type === "generic").forEach(r => allocatedRequirementIds.add(r.id));

  const allocatedCount = allocatedRequirementIds.size;
  const uniqueReqs = standardsEngineService.getUniqueRequirements();
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

  const compliancePct = totalRequirements > 0
    ? Math.round((allocatedCount / totalRequirements) * 100)
    : 0;

  const openRisks = issues.filter(i => i.type === "risk").length;

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Management System" 
        subtitle={`${activeStandard.code} ${activeStandard.version} ${activeStandard.name}`}
      />
      
      <AdaptiveContainer className="py-6 space-y-8 max-w-[var(--wide-max-width)]">
        <HeroBand
          standardCode={activeStandard.code}
          standardVersion={activeStandard.version}
          standardName={activeStandard.name}
          compliancePct={compliancePct}
          processCount={processes.length}
          openRisks={openRisks}
          overdueActions={overdueActions.length}
        />

        {/* Bento Signals */}
        <section className="animate-fade-in" style={{ animationDelay: '60ms' }}>
          <SectionLabel>System Signals</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-1">
              <ComplianceCard
                totalRequirements={totalRequirements}
                allocatedCount={allocatedCount}
                unallocatedUniqueCount={unallocatedUniqueCount}
              />
            </div>
            <ProcessHealthCard processes={processes} />
            <RiskActionCard 
              issues={issues} 
              actions={actions}
              overdueActions={overdueActions}
            />
          </div>
        </section>

        {/* Modules */}
        <section className="animate-fade-in" style={{ animationDelay: '120ms' }}>
          <SectionLabel>
            Modules
            <span className="ml-2 text-[10px] font-normal tracking-normal normal-case bg-muted px-2 py-0.5 rounded-full">
              Demo dataset loaded
            </span>
          </SectionLabel>
          <AdaptiveGrid cols="1-2-3-4" gap="md">
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

        {/* Requirements segmented bar */}
        <section className="animate-fade-in" style={{ animationDelay: '180ms' }}>
          <SectionLabel>Requirements Fulfillment</SectionLabel>
          <RequirementsBar
            satisfied={requirementsStats.satisfied}
            pending={requirementsStats.notSatisfied}
            unallocated={unallocatedUniqueCount}
          />
        </section>
      </AdaptiveContainer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-3 px-1 flex items-center">
      {children}
    </h2>
  );
}
