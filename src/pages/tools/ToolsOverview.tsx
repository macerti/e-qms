import { ClipboardCheck, ShieldAlert, CheckSquare, Building2, GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ModuleCard } from "@/components/ui/module-card";
import { Page } from "@/ui/layout/Page";
import { Section } from "@/ui/layout/Section";
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
      <Page className="pt-0">
        <Section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {toolsApplicationService.getToolCatalog().map((tool) => (
            <ModuleCard
              key={tool.key}
              title={tool.name}
              description={`${tool.codification} · ${tool.description}`}
              icon={iconMap[tool.key]}
              path={tool.route}
              isActive
              accentColor={tool.status === "active" ? "bg-primary" : "bg-blue-500"}
            />
          ))}
        </Section>
      </Page>
    </div>
  );
}
