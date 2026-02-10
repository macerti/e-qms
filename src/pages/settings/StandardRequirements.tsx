import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { ISO9001_STANDARD, type RequirementGuidance } from "@/data/iso9001-guidance";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FileText, Target, CheckCircle2, Archive } from "lucide-react";

function RequirementDetail({ req }: { req: RequirementGuidance }) {
  return (
    <div className="space-y-5">
      {/* Statement */}
      <section>
        <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Requirement Statement
        </h4>
        <p className="text-sm text-foreground/90 leading-relaxed pl-6">
          {req.statement}
        </p>
      </section>

      {/* Typical Allocation */}
      <section>
        <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          Typical Allocation
        </h4>
        <div className="flex flex-wrap gap-1.5 pl-6">
          {req.typicalAllocation.map((alloc) => (
            <Badge key={alloc} variant="secondary" className="text-xs">
              {alloc}
            </Badge>
          ))}
        </div>
      </section>

      {/* How to Satisfy */}
      <section>
        <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          How to Satisfy
        </h4>
        <div className="pl-6 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Expected Practices</p>
            <ul className="text-sm space-y-0.5 list-disc list-inside text-foreground/85">
              {req.howToSatisfy.practices.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Typical Controls</p>
            <ul className="text-sm space-y-0.5 list-disc list-inside text-foreground/85">
              {req.howToSatisfy.controls.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Evidence Examples</p>
            <ul className="text-sm space-y-0.5 list-disc list-inside text-foreground/85">
              {req.howToSatisfy.evidenceExamples.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Supporting Evidence */}
      <section>
        <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-2">
          <Archive className="h-4 w-4 text-muted-foreground" />
          Supporting Evidence
        </h4>
        <div className="pl-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Documents</p>
            <ul className="text-sm space-y-0.5 text-foreground/85">
              {req.supportingEvidence.documents.map((d, i) => <li key={i}>• {d}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Records</p>
            <ul className="text-sm space-y-0.5 text-foreground/85">
              {req.supportingEvidence.records.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Other</p>
            <ul className="text-sm space-y-0.5 text-foreground/85">
              {req.supportingEvidence.other.map((o, i) => <li key={i}>• {o}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function StandardRequirements() {
  const standard = ISO9001_STANDARD;

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Standard Requirements"
        subtitle={`${standard.name}:${standard.version} — Clause Reference & Guidance`}
      />
      <AdaptiveContainer className="py-6 max-w-[860px] space-y-6">
        {standard.clauseGroups.map((group) => (
          <section key={group.clauseNumber} className="mobile-card">
            <h3 className="text-base font-semibold mb-3">
              Clause {group.clauseNumber} — {group.clauseTitle}
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {group.requirements.map((req) => (
                <AccordionItem key={req.clauseNumber} value={req.clauseNumber}>
                  <AccordionTrigger className="text-sm text-left hover:no-underline py-3">
                    <span>
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {req.clauseNumber}
                      </span>
                      {req.clauseTitle}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <RequirementDetail req={req} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </AdaptiveContainer>
    </div>
  );
}
