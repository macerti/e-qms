import {
  ClipboardCheck,
  ShieldAlert,
  CheckSquare,
  Building2,
  GraduationCap,
  Users,
  Wrench,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { toolsApplicationService } from "@/application/tools/toolsApplicationService";
import { ToolSignatureCard, type ToolTone } from "@/components/tools/ToolSignatureCard";
import {
  IssuesSignature,
  ActionsSignature,
  AuditSignature,
  ReviewSignature,
  SupplierSignature,
  CompetencySignature,
} from "@/components/tools/signatures/ToolSignatures";
import { useContextIssues } from "@/hooks/useContextIssues";
import { useActions } from "@/hooks/useActions";

type ToolId =
  | "issues"
  | "actions"
  | "internal-audit"
  | "management-review"
  | "supplier-evaluation"
  | "competency-evaluation";

const TOOL_VISUALS: Record<
  ToolId,
  {
    icon: typeof ShieldAlert;
    tone: ToolTone;
    pattern: "dots" | "grid" | "diagonal" | "radial";
    signature: React.ReactNode;
  }
> = {
  issues: {
    icon: ShieldAlert,
    tone: "risk",
    pattern: "diagonal",
    signature: <IssuesSignature />,
  },
  actions: {
    icon: CheckSquare,
    tone: "primary",
    pattern: "grid",
    signature: <ActionsSignature className="h-14" />,
  },
  "internal-audit": {
    icon: ClipboardCheck,
    tone: "info",
    pattern: "radial",
    signature: <AuditSignature />,
  },
  "management-review": {
    icon: Users,
    tone: "accent",
    pattern: "dots",
    signature: <ReviewSignature />,
  },
  "supplier-evaluation": {
    icon: Building2,
    tone: "success",
    pattern: "grid",
    signature: <SupplierSignature className="h-14" />,
  },
  "competency-evaluation": {
    icon: GraduationCap,
    tone: "violet",
    pattern: "dots",
    signature: <CompetencySignature />,
  },
};

export default function ToolsOverview() {
  const { issues } = useContextIssues();
  const { actions } = useActions();
  const catalog = toolsApplicationService.getToolCatalog();

  const counts: Partial<Record<ToolId, number>> = {
    issues: issues.length,
    actions: actions.length,
  };

  const activeCount = catalog.filter((t) => t.status === "active").length;

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Compliance Tools"
        subtitle="Standard-oriented tool workspaces linked to your processes"
      />
      <AdaptiveContainer className="space-y-6 py-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-40 [background-image:radial-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:18px_18px]"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3 w-3 text-accent" />
                Compliance toolbox
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Tailored workspaces for every requirement
              </h2>
              <p className="text-sm text-muted-foreground">
                Each tool is shaped around the standard clause it serves — risk matrices for
                issues, gauges for management review, scan rings for audit, radar for competency.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 backdrop-blur">
                <div className="text-[10px] uppercase text-muted-foreground">Tools</div>
                <div className="font-mono text-lg font-semibold">{catalog.length}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 backdrop-blur">
                <div className="text-[10px] uppercase text-muted-foreground">Active</div>
                <div className="font-mono text-lg font-semibold">{activeCount}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 backdrop-blur">
                <div className="text-[10px] uppercase text-muted-foreground">Records</div>
                <div className="font-mono text-lg font-semibold">
                  {issues.length + actions.length}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools grid */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              All tools
            </h3>
          </div>
          <AdaptiveGrid cols="1-2-3" gap="md">
            {catalog.map((tool, index) => {
              const visual = TOOL_VISUALS[tool.id as ToolId];
              return (
                <ToolSignatureCard
                  key={tool.id}
                  title={tool.name}
                  description={tool.description}
                  codification={tool.codification}
                  icon={visual.icon}
                  signature={visual.signature}
                  pattern={visual.pattern}
                  tone={visual.tone}
                  path={tool.route}
                  status={tool.status}
                  count={counts[tool.id as ToolId]}
                  index={index}
                />
              );
            })}
          </AdaptiveGrid>
        </section>
      </AdaptiveContainer>
    </div>
  );
}
