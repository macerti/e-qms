import { Page } from "@/ui/layout/Page";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { ModuleCard } from "@/components/ui/module-card";
import { Badge } from "@/components/ui/badge";
import { Shield, Building2, CalendarRange, ClipboardCheck, Award, Scale, GraduationCap, MessageSquareWarning, CalendarDays, Layers, Coins } from "lucide-react";
import { cbToolCatalog } from "@/domains/certification-body/cbToolCatalog";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Building2, CalendarRange, ClipboardCheck, Award,
  Scale, GraduationCap, MessageSquareWarning,
  CalendarDays, Layers, Coins,
};

export default function CBOverview() {
  return (
    <Page>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Certification Body</h1>
              <p className="text-sm text-muted-foreground">ISO/IEC 17021-1 · Conformity Assessment Operations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="font-mono text-[0.65rem]">17021-3 · QMS</Badge>
            <Badge variant="outline" className="font-mono text-[0.65rem]">17021-2 · EMS</Badge>
            <Badge variant="outline" className="font-mono text-[0.65rem]">17021-10 · OH&SMS</Badge>
          </div>
        </div>

        <AdaptiveGrid cols="1-2-3">
          {cbToolCatalog.map((tool) => {
            const Icon = iconMap[tool.iconName] ?? Shield;
            return (
              <ModuleCard
                key={tool.id}
                title={tool.name}
                description={tool.description}
                icon={Icon}
                path={tool.route}
                isActive
                codification={tool.codification}
              />
            );
          })}
        </AdaptiveGrid>
      </div>
    </Page>
  );
}
