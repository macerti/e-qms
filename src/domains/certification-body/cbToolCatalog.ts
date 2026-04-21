/**
 * ISO/IEC 17021-1 Certification Body Tool Catalog
 */

export type CBToolId =
  | "cb-clients"
  | "cb-audit-programs"
  | "cb-audits"
  | "cb-scheduling"
  | "cb-technical-areas"
  | "cb-certificates"
  | "cb-impartiality"
  | "cb-competence"
  | "cb-finance"
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
    name: "Audit Programmes",
    codification: "17021-1 · Clause 9.1",
    description: "Plan 3-year audit cycles, define manday rates, allocate resources and manage programme schedules.",
    route: "/cb/audit-programs",
    iconName: "CalendarRange",
    capabilities: ["program.plan", "program.rate", "program.resource"],
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
    id: "cb-scheduling",
    name: "Scheduling",
    codification: "17021-1 · Clause 9.1.9",
    description: "Visual auditor calendar, allocations and automatic conflict detection.",
    route: "/cb/scheduling",
    iconName: "CalendarDays",
    capabilities: ["schedule.calendar", "schedule.allocate", "schedule.conflict"],
  },
  {
    id: "cb-technical-areas",
    name: "Technical Areas",
    codification: "IAF MD 5 · 17021-1 §7",
    description: "Manage IAF sectors and technical areas; map to qualified auditors and client scopes.",
    route: "/cb/technical-areas",
    iconName: "Layers",
    capabilities: ["technical.area", "technical.matrix"],
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
    description: "Track auditor qualifications, competence matrices, witness audits, and sector authorisations.",
    route: "/cb/competence",
    iconName: "GraduationCap",
    capabilities: ["competence.matrix", "competence.witness", "competence.assignment"],
  },
  {
    id: "cb-finance",
    name: "Finance & P&L",
    codification: "Commercial · Subcontractor management",
    description: "Quotations with margin estimator, client invoices, auditor fee notes, accreditation cost vs sell, overheads and P&L analytics.",
    route: "/cb/finance",
    iconName: "Coins",
    capabilities: ["finance.quote", "finance.invoice", "finance.feenote", "finance.pnl"],
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
