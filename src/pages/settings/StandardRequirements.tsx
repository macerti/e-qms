import { useState, useMemo } from "react";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { standardsEngineService } from "@/application/standards/standardsEngineService";
import type { RequirementGuidance } from "@/domains/standards/iso9001-guidance";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText, Target, CheckCircle2, Archive, BookOpen, Search,
  Compass, Users, Lightbulb, Settings2, BarChart3, Sparkles, ShieldCheck,
  Table2, PenLine, ShieldOff, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Visual signature per ISO 9001 clause group
const CLAUSE_META: Record<string, { icon: typeof FileText; aura: string; tint: string; chip: string; label: string }> = {
  "4":  { icon: Compass,     aura: "var(--process)",    tint: "text-process",    chip: "bg-process/10 text-process ring-process/20",    label: "Context" },
  "5":  { icon: Users,       aura: "var(--audit)",      tint: "text-audit",      chip: "bg-audit/10 text-audit ring-audit/20",          label: "Leadership" },
  "6":  { icon: Lightbulb,   aura: "var(--accent)",     tint: "text-accent",     chip: "bg-accent/10 text-accent ring-accent/20",       label: "Planning" },
  "7":  { icon: Settings2,   aura: "var(--info)",       tint: "text-info",       chip: "bg-info/10 text-info ring-info/20",             label: "Support" },
  "8":  { icon: ShieldCheck, aura: "var(--primary)",    tint: "text-primary",    chip: "bg-primary/8 text-primary ring-primary/15",     label: "Operation" },
  "9":  { icon: BarChart3,   aura: "var(--kpi)",        tint: "text-kpi",        chip: "bg-kpi/10 text-kpi ring-kpi/20",                label: "Evaluation" },
  "10": { icon: Sparkles,    aura: "var(--opportunity)",tint: "text-opportunity",chip: "bg-opportunity/10 text-opportunity ring-opportunity/20", label: "Improvement" },
};

function metaFor(num: string) {
  return CLAUSE_META[num] ?? { icon: BookOpen, aura: "var(--primary)", tint: "text-primary", chip: "bg-primary/8 text-primary ring-primary/15", label: "Clause" };
}

function RequirementDetail({ req }: { req: RequirementGuidance }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <h4 className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5 text-muted-foreground uppercase tracking-widest">
          <FileText className="h-3.5 w-3.5" /> Statement
        </h4>
        <p className="text-sm text-foreground/90 leading-relaxed">{req.statement}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DetailBlock icon={Target} title="Typical Allocation" tone="text-process">
          <div className="flex flex-wrap gap-1.5">
            {req.typicalAllocation.map((alloc) => (
              <Badge key={alloc} variant="secondary" className="text-xs">{alloc}</Badge>
            ))}
          </div>
        </DetailBlock>

        <DetailBlock icon={CheckCircle2} title="Expected Practices" tone="text-opportunity">
          <ul className="text-sm space-y-1 text-foreground/85">
            {req.howToSatisfy.practices.map((p, i) => (
              <li key={i} className="flex gap-2"><span className="text-opportunity/60 mt-1">•</span><span>{p}</span></li>
            ))}
          </ul>
        </DetailBlock>

        <DetailBlock icon={Settings2} title="Typical Controls" tone="text-info">
          <ul className="text-sm space-y-1 text-foreground/85">
            {req.howToSatisfy.controls.map((c, i) => (
              <li key={i} className="flex gap-2"><span className="text-info/60 mt-1">•</span><span>{c}</span></li>
            ))}
          </ul>
        </DetailBlock>

        <DetailBlock icon={Archive} title="Evidence Examples" tone="text-accent">
          <ul className="text-sm space-y-1 text-foreground/85">
            {req.howToSatisfy.evidenceExamples.map((e, i) => (
              <li key={i} className="flex gap-2"><span className="text-accent/60 mt-1">•</span><span>{e}</span></li>
            ))}
          </ul>
        </DetailBlock>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h4 className="text-[11px] font-semibold mb-3 flex items-center gap-1.5 text-muted-foreground uppercase tracking-widest">
          <Archive className="h-3.5 w-3.5" /> Supporting Evidence
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <EvidenceCol label="Documents" items={req.supportingEvidence.documents} />
          <EvidenceCol label="Records" items={req.supportingEvidence.records} />
          <EvidenceCol label="Other" items={req.supportingEvidence.other} />
        </div>
      </div>
    </div>
  );
}

function DetailBlock({
  icon: Icon, title, tone, children,
}: { icon: typeof FileText; title: string; tone: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <h4 className={cn("text-[11px] font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-widest", tone)}>
        <Icon className="h-3.5 w-3.5" /> {title}
      </h4>
      {children}
    </div>
  );
}

function EvidenceCol({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>
      <ul className="text-sm space-y-1 text-foreground/85">
        {items.map((d, i) => <li key={i} className="leading-snug">• {d}</li>)}
      </ul>
    </div>
  );
}

export default function StandardRequirements() {
  const standard = standardsEngineService.getDefaultStandard();
  const [query, setQuery] = useState("");

  const totalRequirements = useMemo(
    () => standard.clauseGroups.reduce((sum, g) => sum + g.requirements.length, 0),
    [standard],
  );

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return standard.clauseGroups;
    const q = query.toLowerCase();
    return standard.clauseGroups
      .map((g) => ({
        ...g,
        requirements: g.requirements.filter(
          (r) =>
            r.clauseNumber.includes(q) ||
            r.clauseTitle.toLowerCase().includes(q) ||
            r.statement.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.requirements.length > 0);
  }, [standard, query]);

  return (
    <div className="min-h-screen">
      <AdaptiveContainer className="pt-4 pb-2 max-w-[960px]">
        {/* Hero band */}
        <section
          className="tile-depth tile-sweep aura-radial p-6 md:p-8 animate-fade-in"
          style={{ ["--aura" as never]: "var(--audit)" }}
        >
          <div className="absolute inset-0 pattern-grid opacity-50 pointer-events-none rounded-2xl" />
          <div className="relative grid gap-6 md:grid-cols-[1.2fr_2fr] md:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-audit/10 text-audit text-[11px] font-medium uppercase tracking-widest">
                <BookOpen className="w-3.5 h-3.5" /> Reference library
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {standard.name} <span className="text-muted-foreground font-normal">{standard.version}</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Clause-by-clause guidance — statements, allocation, controls and evidence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="Clause groups" value={standard.clauseGroups.length} tone="audit" icon={BookOpen} />
              <StatBlock label="Requirements" value={totalRequirements} tone="primary" icon={CheckCircle2} />
            </div>
          </div>
        </section>
      </AdaptiveContainer>

      <AdaptiveContainer className="py-4 max-w-[960px] space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clauses, titles, statements..."
            className="pl-10 h-11"
          />
        </div>

        {/* Quick clause nav */}
        <div className="flex flex-wrap gap-2">
          {standard.clauseGroups.map((g) => {
            const meta = metaFor(g.clauseNumber);
            const Icon = meta.icon;
            return (
              <a
                key={g.clauseNumber}
                href={`#clause-${g.clauseNumber}`}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ring-1 transition-all hover:scale-105",
                  meta.chip,
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-mono">{g.clauseNumber}</span>
                <span className="opacity-70">·</span>
                <span>{meta.label}</span>
              </a>
            );
          })}
        </div>

        {/* Clause groups */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No clauses match your search.
          </div>
        )}
        {filteredGroups.map((group, gi) => {
          const meta = metaFor(group.clauseNumber);
          const Icon = meta.icon;
          return (
            <section
              key={group.clauseNumber}
              id={`clause-${group.clauseNumber}`}
              className="tile-depth aura-radial p-5 md:p-6 animate-fade-in scroll-mt-20"
              style={{ ["--aura" as never]: meta.aura, animationDelay: `${gi * 50}ms` }}
            >
              <div className="relative flex items-start gap-3 mb-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ring-1", meta.chip)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[10px] font-semibold uppercase tracking-widest", meta.tint)}>
                    {meta.label}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold leading-tight">
                    Clause {group.clauseNumber} — {group.clauseTitle}
                  </h3>
                </div>
                <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0">
                  {group.requirements.length} req
                </span>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {group.requirements.map((req) => (
                  <AccordionItem key={req.clauseNumber} value={req.clauseNumber} className="border-border/60">
                    <AccordionTrigger className="text-sm text-left hover:no-underline py-3 group">
                      <span className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={cn(
                          "font-mono text-xs px-2 py-0.5 rounded ring-1 shrink-0 transition-colors",
                          meta.chip,
                        )}>
                          {req.clauseNumber}
                        </span>
                        <span className="truncate text-left">{req.clauseTitle}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <RequirementDetail req={req} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          );
        })}
      </AdaptiveContainer>
    </div>
  );
}

function StatBlock({
  label, value, tone, icon: Icon,
}: { label: string; value: number; tone: "audit" | "primary"; icon: typeof FileText }) {
  const cls = tone === "audit"
    ? { text: "text-audit", bg: "bg-audit/10", ring: "ring-audit/20" }
    : { text: "text-primary", bg: "bg-primary/8", ring: "ring-primary/15" };
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl bg-card/70 backdrop-blur-sm ring-1", cls.ring)}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", cls.bg)}>
        <Icon className={cn("w-5 h-5", cls.text)} />
      </div>
      <div className="min-w-0">
        <div className={cn("font-mono text-2xl font-bold leading-none tabular-nums", cls.text)}>{value}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
      </div>
    </div>
  );
}
