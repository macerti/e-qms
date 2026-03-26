/**
 * ISO/IEC 17021-1 Certification Body Tool Catalog
 *
 * Extends the tool system with CB-specific workspaces.
 * These are separate from QMS tools and render under /cb/* routes.
 */

import type { LucideIcon } from "lucide-react";

export type CBToolId =
  | "cb-clients"
  | "cb-audit-programs"
  | "cb-audits"
  | "cb-certificates"
  | "cb-impartiality"
  | "cb-competence"
  | "cb-complaints-appeals";

export interface CBToolDefinition {
  id: CBToolId;
  name: string;
  codification: string;
  description: string;
  route: string;
  iconName: string;
  capabilities: string[];
}

export const cbToolCatalog: CBToolDefinition[] = [
  {
    id: "cb-clients",
    name: "Clients & Contracts",
    codification: "17021-1 · Clause 8.2",
    description: "Manage certification applications, client contracts, scope definitions, and multi-site tracking.",
    route: "/cb/clients",
    iconName: "Building2",
    capabilities: ["client.application", "client.scope", "client.contract"],
  },
  {
    id: "cb-audit-programs",
    name: "Audit Programs",
    codification: "17021-1 · Clause 9.1",
    description: "Plan 3-year audit cycles, define objectives, allocate resources, and manage program schedules.",
    route: "/cb/audit-programs",
    iconName: "CalendarRange",
    capabilities: ["program.plan", "program.schedule", "program.resource"],
  },
  {
    id: "cb-audits",
    name: "Audits",
    codification: "17021-1 · Clauses 9.2–9.4",
    description: "Execute Stage 1, Stage 2, surveillance, and recertification audits with full team management.",
    route: "/cb/audits",
    iconName: "ClipboardCheck",
    capabilities: ["audit.stage1", "audit.stage2", "audit.surveillance", "audit.recertification"],
  },
  {
    id: "cb-certificates",
    name: "Certificates",
    codification: "17021-1 · Clause 8.4",
    description: "Issue, suspend, withdraw, and renew management system certificates with lifecycle tracking.",
    route: "/cb/certificates",
    iconName: "Award",
    capabilities: ["cert.issue", "cert.suspend", "cert.withdraw", "cert.renew"],
  },
  {
    id: "cb-impartiality",
    name: "Impartiality",
    codification: "17021-1 · Clause 5.2",
    description: "Manage impartiality risks, conflict-of-interest declarations, and safeguarding mechanisms.",
    route: "/cb/impartiality",
    iconName: "Scale",
    capabilities: ["impartiality.risk", "impartiality.conflict", "impartiality.safeguard"],
  },
  {
    id: "cb-competence",
    name: "Competence",
    codification: "17021-1 · Clause 7",
    description: "Track auditor qualifications, competence matrices, witness audits, and sector authorizations.",
    route: "/cb/competence",
    iconName: "GraduationCap",
    capabilities: ["competence.matrix", "competence.witness", "competence.assignment"],
  },
  {
    id: "cb-complaints-appeals",
    name: "Complaints & Appeals",
    codification: "17021-1 · Clause 9.8–9.9",
    description: "Handle complaints intake, independent appeals review, and resolution tracking.",
    route: "/cb/complaints-appeals",
    iconName: "MessageSquareWarning",
    capabilities: ["complaint.intake", "appeal.review", "resolution.track"],
  },
];
