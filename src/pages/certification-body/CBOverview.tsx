import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Building2, CalendarRange, ClipboardCheck, Award, Scale, GraduationCap,
  MessageSquareWarning, CalendarDays, Layers, Coins, ChevronRight, Sparkles,
  Users, FileCheck, AlertTriangle, TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cbToolCatalog, type CBToolDefinition } from "@/domains/certification-body/cbToolCatalog";
import { useCBCollection } from "@/domains/certification-body/cbStore";
import { fmtMoney, annualOverheadTotal } from "@/domains/certification-body/cbFinance";
import { CBStatTile, CBStatGrid } from "@/components/certification-body/CBStatTile";
import { Page } from "@/ui/layout/Page";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Building2, CalendarRange, ClipboardCheck, Award,
  Scale, GraduationCap, MessageSquareWarning,
  CalendarDays, Layers, Coins,
};

// Group definitions for visual variety — each section has its own accent color
type GroupKey = "lifecycle" | "operations" | "decisions" | "governance";

const GROUPS: Record<GroupKey, {
  label: string;
  description: string;
  toolIds: string[];
  accent: string;     // bg gradient
  ring: string;       // accent ring on hover
  iconTint: string;   // icon background tint
  badge: string;
}> = {
  lifecycle: {
    label: "Certification lifecycle",
    description: "From application intake through scope definition to programme planning.",
    toolIds: ["cb-clients", "cb-audit-programs"],
    accent: "from-primary/10 via-primary/5 to-transparent",
    ring: "hover:ring-primary/30",
    iconTint: "bg-primary/10 text-primary",
    badge: "bg-primary/10 text-primary",
  },
  operations: {
    label: "Audit operations",
    description: "Day-to-day execution: schedule auditors, run audits and bill the work.",
    toolIds: ["cb-scheduling", "cb-audits", "cb-technical-areas", "cb-finance"],
    accent: "from-sky-500/10 via-cyan-400/5 to-transparent",
    ring: "hover:ring-sky-400/30",
    iconTint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  decisions: {
    label: "Decisions & certificates",
    description: "Independent decision-making and certificate lifecycle management.",
    toolIds: ["cb-certificates"],
    accent: "from-emerald-500/10 via-teal-400/5 to-transparent",
    ring: "hover:ring-emerald-400/30",
    iconTint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  governance: {
    label: "Impartiality & quality",
    description: "Safeguard impartiality, maintain competence, and resolve complaints.",
    toolIds: ["cb-impartiality", "cb-competence", "cb-complaints-appeals"],
    accent: "from-violet-500/10 via-fuchsia-400/5 to-transparent",
    ring: "hover:ring-violet-400/30",
    iconTint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
};

export default function CBOverview() {
  const clients = useCBCollection("clients");
  const audits = useCBCollection("audits");
  const certificates = useCBCollection("certificates");
  const allocations = useCBCollection("allocations");
  const ncs = useCBCollection("ncs");
  const complaints = useCBCollection("complaints");
  const invoices = useCBCollection("invoices");
  const overheads = useCBCollection("overheadCosts");
  const auditors = useCBCollection("auditors");
  const impartialityRisks = useCBCollection("impartialityRisks");

  const stats = useMemo(() => {
    const activeCerts = certificates.data.filter((c: any) => c.status === "active").length;
    const inProgressAudits = audits.data.filter((a: any) => a.stage === "in_progress" || a.stage === "planned").length;
    const openNcs = ncs.data.filter((n: any) => n.status !== "verified_closed").length;
    const upcomingAllocations = allocations.data.filter((a: any) => {
      if (!a.startDate) return false;
      const d = new Date(a.startDate); const now = new Date();
      const diff = (d.getTime() - now.getTime()) / 86400000;
      return diff >= 0 && diff <= 30;
    }).length;
    const revenue = invoices.data
      .filter((i: any) => i.status !== "cancelled")
      .reduce((s: number, i: any) => s + (Number(i.total) || 0), 0);
    const overhead = annualOverheadTotal(overheads.data);
    const openComplaints = complaints.data.filter((c: any) => c.status !== "resolved" && c.status !== "closed").length;

    return {
      activeCerts,
      inProgressAudits,
      openNcs,
      upcomingAllocations,
      revenue,
      overhead,
      openComplaints,
      clients: clients.data.length,
      auditors: auditors.data.length,
      impartialityRisks: impartialityRisks.data.filter((r: any) => r.severity === "high" || r.severity === "critical").length,
    };
  }, [clients.data, audits.data, certificates.data, allocations.data, ncs.data, complaints.data, invoices.data, overheads.data, auditors.data, impartialityRisks.data]);

  // Counts per tool used for module cards
  const toolCounts: Record<string, number | undefined> = {
    "cb-clients": clients.data.length || undefined,
    "cb-audits": audits.data.length || undefined,
    "cb-certificates": certificates.data.length || undefined,
    "cb-scheduling": allocations.data.length || undefined,
    "cb-competence": auditors.data.length || undefined,
    "cb-complaints-appeals": complaints.data.length || undefined,
    "cb-impartiality": impartialityRisks.data.length || undefined,
    "cb-finance": invoices.data.length || undefined,
  };

  const catalogById = new Map(cbToolCatalog.map((t) => [t.id, t]));

  return (
    <Page>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-violet-500/5 to-transparent p-6 lg:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                ISO/IEC 17021-1 · Conformity Assessment
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">Certification Body</h1>
                  <p className="text-sm text-muted-foreground">Operate a fully accredited CB end-to-end — clients, audits, certificates and finance.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["17021-3 · QMS", "17021-2 · EMS", "17021-10 · OH&SMS", "IAF MD 5", "MD 11"].map((c) => (
                  <span key={c} className="rounded-md border border-border/60 bg-card/60 px-2 py-0.5 font-mono text-[0.65rem] text-muted-foreground backdrop-blur-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                to="/cb/clients"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <Building2 className="h-3.5 w-3.5" /> New application
              </Link>
              <Link
                to="/cb/scheduling"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium transition hover:bg-muted/60"
              >
                <CalendarDays className="h-3.5 w-3.5" /> Schedule auditor
              </Link>
              <Link
                to="/cb/finance"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium transition hover:bg-muted/60"
              >
                <Coins className="h-3.5 w-3.5" /> New quotation
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Live KPI strip ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">CB at a glance</h2>
            <span className="text-[11px] text-muted-foreground">Live · localStorage</span>
          </div>
          <CBStatGrid>
            <CBStatTile
              label="Active certificates"
              value={stats.activeCerts}
              icon={Award}
              tone="success"
              hint={`${certificates.data.length} total issued`}
            />
            <CBStatTile
              label="Audits in flight"
              value={stats.inProgressAudits}
              icon={ClipboardCheck}
              tone="primary"
              hint="Planned & in progress"
            />
            <CBStatTile
              label="Open nonconformities"
              value={stats.openNcs}
              icon={AlertTriangle}
              tone={stats.openNcs > 0 ? "warning" : "neutral"}
              hint="Awaiting verification"
            />
            <CBStatTile
              label="Upcoming (30 days)"
              value={stats.upcomingAllocations}
              icon={CalendarDays}
              tone="info"
              hint="Scheduled allocations"
            />
            <CBStatTile
              label="Auditor pool"
              value={stats.auditors}
              icon={Users}
              tone="violet"
              hint="Qualified auditors"
            />
            <CBStatTile
              label="Active clients"
              value={stats.clients}
              icon={Building2}
              tone="primary"
              hint="Applications in scope"
            />
            <CBStatTile
              label="Open complaints"
              value={stats.openComplaints}
              icon={MessageSquareWarning}
              tone={stats.openComplaints > 0 ? "danger" : "neutral"}
              hint="Pending resolution"
            />
            <CBStatTile
              label="High impartiality risks"
              value={stats.impartialityRisks}
              icon={Scale}
              tone={stats.impartialityRisks > 0 ? "warning" : "neutral"}
              hint="Critical / high"
            />
            <CBStatTile
              label="Invoiced revenue"
              value={fmtMoney(stats.revenue, "EUR" as any)}
              icon={Coins}
              tone="success"
              hint="All currencies summed as EUR"
            />
            <CBStatTile
              label="Annual overhead"
              value={fmtMoney(stats.overhead, "EUR" as any)}
              icon={TrendingUp}
              tone="neutral"
              hint="From overhead pool"
            />
          </CBStatGrid>
        </section>

        {/* ─── Grouped module sections ─── */}
        {(Object.keys(GROUPS) as GroupKey[]).map((gKey) => {
          const g = GROUPS[gKey];
          const tools = g.toolIds
            .map((id) => catalogById.get(id as any))
            .filter(Boolean) as CBToolDefinition[];
          if (tools.length === 0) return null;
          return (
            <section key={gKey} className="space-y-3">
              <div className={cn("relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-4", g.accent)}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", g.badge)}>
                      {g.label}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">{g.description}</p>
                  </div>
                  <span className="rounded-full bg-card/70 px-2 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
                    {tools.length} tool{tools.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => {
                  const Icon = iconMap[tool.iconName] ?? Shield;
                  const count = toolCounts[tool.id];
                  return (
                    <Link
                      key={tool.id}
                      to={tool.route}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                        g.ring,
                      )}
                    >
                      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 transition-opacity group-hover:opacity-100", g.accent)} />
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110", g.iconTint)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold tracking-tight">{tool.name}</h3>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                          </div>
                          <div className="mt-1 inline-block rounded border border-border/50 px-1.5 py-px font-mono text-[0.6rem] text-muted-foreground">
                            {tool.codification}
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
                          {count !== undefined && count > 0 && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground">
                              {count} record{count > 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </Page>
  );
}
