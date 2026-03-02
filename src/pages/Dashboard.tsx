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

  // Calculate compliance coverage
  const totalRequirements = standardsEngineService.getRequirements().length;
  
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
        subtitle={`${activeStandard.code} ${activeStandard.version} ${activeStandard.name}`}
      />
      
      <AdaptiveContainer className="py-6 space-y-8 max-w-[var(--wide-max-width)]">
        {/* Signal Cards */}
        <section className="animate-fade-in">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-1">
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
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-1">
            Modules
            <span className="ml-2 text-[10px] font-normal tracking-normal normal-case bg-muted px-2 py-0.5 rounded-full">
              Demo dataset loaded
            </span>
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

        {/* Requirements fulfillment */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-1">
            Requirements Fulfillment
            <span className="ml-2 text-[10px] font-normal tracking-normal normal-case">(allocated set)</span>
          </h2>
          <AdaptiveGrid cols="1-2-3" gap="md">
            <div className="signal-card">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Allocated</p>
              <p className="text-3xl font-bold mt-2 font-mono leading-none">{requirementsStats.allocated}</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Across all process activities</p>
            </div>
            <div className="signal-card border-success/20">
              <div className="absolute top-0 left-0 right-0 h-1 bg-success/40 rounded-t-xl" />
              <p className="text-xs font-medium text-success uppercase tracking-wide">Satisfied</p>
              <p className="text-3xl font-bold mt-2 text-success font-mono leading-none">
                {requirementsStats.satisfied}
                <span className="text-base font-semibold ml-1.5 opacity-70">({satisfactionRate}%)</span>
              </p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Evidence inferred from linked documents, issues and actions</p>
            </div>
            <div className="signal-card border-warning/20">
              <div className="absolute top-0 left-0 right-0 h-1 bg-warning/40 rounded-t-xl" />
              <p className="text-xs font-medium text-warning uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold mt-2 text-warning font-mono leading-none">
                {requirementsStats.notSatisfied}
                <span className="text-base font-semibold ml-1.5 opacity-70">({pendingRate}%)</span>
              </p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Needs stronger evidence (docs, evaluated actions, or issue traceability)</p>
            </div>
          </AdaptiveGrid>
        </section>

        {/* Standard Info */}
        <section className="max-w-md animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="signal-card bg-primary text-primary-foreground border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 opacity-80" />
              </div>
              <div>
                <h3 className="font-semibold text-base">ISO 9001:2015</h3>
                <p className="text-sm opacity-80 mt-1 leading-relaxed">
                  Quality management systems — Requirements
                </p>
                <p className="text-xs opacity-50 mt-2 font-mono">
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
