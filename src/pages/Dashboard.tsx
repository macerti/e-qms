import { 
  Workflow, 
  AlertTriangle, 
  CheckSquare, 
  FileText
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
];

export default function Dashboard() {
  const { processes, issues, actions, getOverdueActions, allRequirements } = useManagementSystem();

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
            Modules
          </h2>
          <AdaptiveGrid cols="1-2" gap="md">
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
                  undefined
                }
              />
            ))}
          </AdaptiveGrid>
        </section>

        {/* Standard Info */}
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
