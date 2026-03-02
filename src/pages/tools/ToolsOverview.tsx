import { ClipboardCheck, ShieldAlert, CheckSquare, Building2, GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ModuleCard } from "@/components/ui/module-card";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { toolsApplicationService } from "@/application/tools/toolsApplicationService";

const iconMap = {
  issues: ShieldAlert,
  actions: CheckSquare,
  "internal-audit": ClipboardCheck,
  "management-review": Users,
  "supplier-evaluation": Building2,
  "competency-evaluation": GraduationCap,
};

export default function ToolsOverview() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Compliance Tools" subtitle="Standard-oriented tool workspaces linked to your processes" />
      <AdaptiveContainer className="py-6">
        <AdaptiveGrid cols="1-2-3" gap="md">
          {toolsApplicationService.getToolCatalog().map((tool, index) => (
            <div key={tool.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <ModuleCard
                title={tool.name}
                description={`${tool.codification} · ${tool.description}`}
                icon={iconMap[tool.id]}
                path={tool.route}
                isActive
                accentColor={tool.status === "active" ? "bg-primary" : "bg-info"}
              />
            </div>
          ))}
        </AdaptiveGrid>
      </AdaptiveContainer>
    </div>
  );
}
