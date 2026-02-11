import { Action, ActionStatusChange, ContextIssue, Process, RiskVersion } from "@/types/management-system";

function findProcessId(processes: Process[], nameIncludes: string, fallbackIndex = 0): string {
  const query = nameIncludes.toLowerCase();

  const byName = processes.find((process) => process.name.toLowerCase().includes(query));
  if (byName) return byName.id;

  const aliasMap: Record<string, string[]> = {
    "human resources": ["human resources", "hr", "recruit", "talent", "pro-001"],
    "management": ["management", "leadership", "governance", "pro-002"],
    "quality": ["quality", "audit", "corrective", "continual improvement", "pro-003"],
    "operational process 01": ["operational process 01", "operation 01", "operations 01", "pro-004"],
    "operational process 02": ["operational process 02", "operation 02", "operations 02", "pro-005"],
    "purchasing": ["purchasing", "procurement", "supplier", "pro-006"],
    "it process": ["it process", "information technology", "infrastructure", "pro-007"],
    "administration process": ["administration process", "administration", "admin", "pro-008"],
    "sales process": ["sales process", "sales", "crm", "customer", "pro-009"],
  };

  const aliases = aliasMap[query] ?? [query];
  const byAlias = processes.find((process) => {
    const haystack = `${process.name} ${process.code}`.toLowerCase();
    return aliases.some((alias) => haystack.includes(alias));
  });

  return byAlias?.id ?? processes[fallbackIndex]?.id ?? "";
}

export function inferProcessIdFromText(processes: Process[], text: string, fallbackIndex = 0): string {
  const normalized = text.toLowerCase();

  if (normalized.includes("supplier") || normalized.includes("procurement") || normalized.includes("purchas")) {
    return findProcessId(processes, "purchasing", fallbackIndex);
  }
  if (normalized.includes("recruit") || normalized.includes("training") || normalized.includes("human resource") || normalized.includes("competence")) {
    return findProcessId(processes, "human resources", fallbackIndex);
  }
  if (normalized.includes("management review") || normalized.includes("leadership") || normalized.includes("governance")) {
    return findProcessId(processes, "management", fallbackIndex);
  }
  if (normalized.includes("audit") || normalized.includes("nonconform") || normalized.includes("corrective") || normalized.includes("improvement")) {
    return findProcessId(processes, "quality", fallbackIndex);
  }
  if (normalized.includes("operational process 01") || normalized.includes("checklist") || normalized.includes("production")) {
    return findProcessId(processes, "operational process 01", fallbackIndex);
  }
  if (normalized.includes("operational process 02") || normalized.includes("intervention")) {
    return findProcessId(processes, "operational process 02", fallbackIndex);
  }
  if (/\bit\b/.test(normalized) || normalized.includes("information technology") || normalized.includes("infrastructure") || normalized.includes("monitoring")) {
    return findProcessId(processes, "it process", fallbackIndex);
  }
  if (normalized.includes("admin") || normalized.includes("filing") || normalized.includes("archive")) {
    return findProcessId(processes, "administration process", fallbackIndex);
  }
  if (normalized.includes("sales") || normalized.includes("crm") || normalized.includes("funnel")) {
    return findProcessId(processes, "sales process", fallbackIndex);
  }

  return processes[fallbackIndex]?.id ?? "";
}

function mkRiskVersion(versionNumber: number, description: string, severity: number, probability: number, trigger: "initial" | "post_action_review"): RiskVersion {
  const criticity = severity * probability;
  const priority = criticity <= 3 ? "03" : criticity <= 6 ? "02" : "01";
  return {
    id: crypto.randomUUID(),
    versionNumber,
    date: new Date().toISOString(),
    trigger,
    description,
    severity,
    probability,
    criticity,
    priority,
    evaluatorName: "QMS Team",
    notes: trigger === "initial" ? "Initial evaluation" : "Residual risk review",
  };
}

export function createDemoIssues(processes: Process[]): ContextIssue[] {
  const now = new Date().toISOString();

  const hr = findProcessId(processes, "human resources");
  const mgmt = findProcessId(processes, "management");
  const quality = findProcessId(processes, "quality");
  const op1 = findProcessId(processes, "operational process 01", 0);
  const op2 = findProcessId(processes, "operational process 02", 0);
  const purchasing = findProcessId(processes, "purchasing");
  const it = findProcessId(processes, "it process");
  const admin = findProcessId(processes, "administration process");
  const sales = findProcessId(processes, "sales process");

  const items: ContextIssue[] = [
    {
      id: crypto.randomUUID(),
      code: "RISK/26/001",
      type: "risk",
      quadrant: "weakness",
      description: "Training completion rate below annual target in HR.",
      contextNature: "internal",
      processId: hr,
      riskVersions: [mkRiskVersion(1, "Training completion rate below annual target in HR.", 2, 3, "initial")],
      severity: 2,
      probability: 3,
      criticity: 6,
      priority: "02",
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
    } as ContextIssue,
    {
      id: crypto.randomUUID(),
      code: "OPP/26/001",
      type: "opportunity",
      quadrant: "opportunity",
      description: "Digitize management review minutes and action tracking.",
      contextNature: "external",
      processId: mgmt,
      riskVersions: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
    },
    {
      id: crypto.randomUUID(),
      code: "RISK/26/002",
      type: "risk",
      quadrant: "threat",
      description: "Supplier delivery variability impacts incoming quality.",
      contextNature: "external",
      processId: purchasing,
      riskVersions: [
        mkRiskVersion(1, "Supplier delivery variability impacts incoming quality.", 3, 3, "initial"),
        mkRiskVersion(2, "Residual risk after supplier scoring and dual sourcing.", 2, 2, "post_action_review"),
      ],
      severity: 2,
      probability: 2,
      criticity: 4,
      priority: "02",
      createdAt: now,
      updatedAt: now,
      version: 2,
      revisionDate: now,
      revisionNote: "Residual risk updated after action evaluation",
    },
    {
      id: crypto.randomUUID(),
      code: "RISK/26/003",
      type: "risk",
      quadrant: "threat",
      description: "In-process controls in Operational Process 01 are not consistently recorded.",
      contextNature: "internal",
      processId: op1,
      riskVersions: [mkRiskVersion(1, "In-process controls in Operational Process 01 are not consistently recorded.", 3, 2, "initial")],
      severity: 3,
      probability: 2,
      criticity: 6,
      priority: "02",
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
    },
    {
      id: crypto.randomUUID(),
      code: "OPP/26/002",
      type: "opportunity",
      quadrant: "strength",
      description: "Quality process has strong audit discipline that can be productized for clients.",
      contextNature: "internal",
      processId: quality,
      riskVersions: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
    },
    {
      id: crypto.randomUUID(),
      code: "RISK/26/004",
      type: "risk",
      quadrant: "weakness",
      description: "Operational Process 02 has delayed closure of intervention reports.",
      contextNature: "internal",
      processId: op2,
      riskVersions: [mkRiskVersion(1, "Operational Process 02 has delayed closure of intervention reports.", 2, 2, "initial")],
      severity: 2,
      probability: 2,
      criticity: 4,
      priority: "02",
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
    },
    {
      id: crypto.randomUUID(),
      code: "RISK/26/005",
      type: "risk",
      quadrant: "threat",
      description: "Unplanned IT downtime affects process continuity.",
      contextNature: "external",
      processId: it,
      riskVersions: [mkRiskVersion(1, "Unplanned IT downtime affects process continuity.", 3, 2, "initial")],
      severity: 3,
      probability: 2,
      criticity: 6,
      priority: "02",
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
    },
    {
      id: crypto.randomUUID(),
      code: "OPP/26/003",
      type: "opportunity",
      quadrant: "opportunity",
      description: "Use CRM analytics to improve sales conversion and forecasting.",
      contextNature: "external",
      processId: sales,
      riskVersions: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
    },
    {
      id: crypto.randomUUID(),
      code: "RISK/26/006",
      type: "risk",
      quadrant: "weakness",
      description: "Administrative filing delays can lead to outdated controlled records.",
      contextNature: "internal",
      processId: admin,
      riskVersions: [mkRiskVersion(1, "Administrative filing delays can lead to outdated controlled records.", 2, 2, "initial")],
      severity: 2,
      probability: 2,
      criticity: 4,
      priority: "02",
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
    },
  ];

  return items;
}

function statusHistory(status: Action["status"], note: string): ActionStatusChange[] {
  return [
    {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      fromStatus: null,
      toStatus: status,
      notes: note,
    },
  ];
}

export function createDemoActions(processes: Process[], issues: ContextIssue[]): Action[] {
  const now = new Date();
  const issueByCode = (code: string) => issues.find((issue) => issue.code === code)?.id;
  const p = (name: string, idx = 0) => findProcessId(processes, name, idx);

  const dataset: Action[] = [
    {
      id: crypto.randomUUID(),
      code: "ACT-001",
      title: "Deploy annual training plan follow-up dashboard",
      description: "Track attendance and completion by department every month.",
      origin: "issue",
      linkedIssueIds: [issueByCode("RISK/26/001")].filter(Boolean) as string[],
      processId: p("human resources"),
      deadline: new Date(now.getFullYear(), now.getMonth() + 2, 15).toISOString(),
      responsibleName: "HR Manager",
      status: "in_progress",
      statusHistory: statusHistory("in_progress", "Action started"),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 1,
      revisionDate: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: "ACT-002",
      title: "Implement supplier scorecard and dual-source policy",
      description: "Monthly supplier scorecard with quality, lead-time and responsiveness metrics.",
      origin: "issue",
      linkedIssueIds: [issueByCode("RISK/26/002")].filter(Boolean) as string[],
      processId: p("purchasing"),
      deadline: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString(),
      responsibleName: "Procurement Manager",
      status: "evaluated",
      statusHistory: statusHistory("evaluated", "Implemented and evaluated"),
      completedDate: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString(),
      efficiencyEvaluation: {
        id: crypto.randomUUID(),
        date: new Date(now.getFullYear(), now.getMonth() - 1, 12).toISOString(),
        result: "effective",
        evidenceType: "note",
        evidence: "Supplier KPI trend and rejection rate report",
        evaluatorName: "Quality Manager",
        notes: "Late deliveries reduced and incoming defects decreased.",
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 2,
      revisionDate: now.toISOString(),
      revisionNote: "Efficiency evaluated: effective",
    },
    {
      id: crypto.randomUUID(),
      code: "ACT-003",
      title: "Standardize in-process quality checklist usage",
      description: "Mandatory checklist completion with supervisor sign-off.",
      origin: "issue",
      linkedIssueIds: [issueByCode("RISK/26/003")].filter(Boolean) as string[],
      processId: p("operational process 01"),
      deadline: new Date(now.getFullYear(), now.getMonth() + 1, 10).toISOString(),
      responsibleName: "Operations Lead 01",
      status: "completed_pending_evaluation",
      statusHistory: statusHistory("completed_pending_evaluation", "Completed and awaiting evaluation"),
      completedDate: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 1,
      revisionDate: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: "ACT-004",
      title: "Digitize management review minutes template",
      description: "Create a single template with action extraction automation.",
      origin: "management_review",
      linkedIssueIds: [issueByCode("OPP/26/001")].filter(Boolean) as string[],
      processId: p("management process"),
      deadline: new Date(now.getFullYear(), now.getMonth() + 1, 25).toISOString(),
      responsibleName: "QMS Coordinator",
      status: "planned",
      statusHistory: statusHistory("planned", "Planned"),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 1,
      revisionDate: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: "ACT-005",
      title: "Close overdue intervention reports weekly",
      description: "Weekly closure ritual with responsible operations supervisor.",
      origin: "issue",
      linkedIssueIds: [issueByCode("RISK/26/004")].filter(Boolean) as string[],
      processId: p("operational process 02"),
      deadline: new Date(now.getFullYear(), now.getMonth() - 2, 5).toISOString(),
      responsibleName: "Operations Lead 02",
      status: "in_progress",
      statusHistory: statusHistory("in_progress", "In progress"),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 1,
      revisionDate: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: "ACT-006",
      title: "Implement IT monitoring and alert escalation",
      description: "Deploy infrastructure monitoring with escalation matrix and monthly review.",
      origin: "issue",
      linkedIssueIds: [issueByCode("RISK/26/005")].filter(Boolean) as string[],
      processId: p("it process"),
      deadline: new Date(now.getFullYear(), now.getMonth() + 1, 18).toISOString(),
      responsibleName: "IT Manager",
      status: "completed_pending_evaluation",
      statusHistory: statusHistory("completed_pending_evaluation", "Monitoring deployed"),
      completedDate: new Date(now.getFullYear(), now.getMonth(), 6).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 1,
      revisionDate: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: "ACT-007",
      title: "Launch CRM sales funnel dashboard",
      description: "Create pipeline dashboard and weekly conversion review ritual.",
      origin: "objective_not_met",
      linkedIssueIds: [issueByCode("OPP/26/003")].filter(Boolean) as string[],
      processId: p("sales process"),
      deadline: new Date(now.getFullYear(), now.getMonth() + 2, 7).toISOString(),
      responsibleName: "Sales Manager",
      status: "planned",
      statusHistory: statusHistory("planned", "Planned for next quarter"),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 1,
      revisionDate: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: "ACT-008",
      title: "Digitize administration archive and retention index",
      description: "Create indexed archive workflow and monthly compliance checks.",
      origin: "internal_audit",
      linkedIssueIds: [issueByCode("RISK/26/006")].filter(Boolean) as string[],
      processId: p("administration process"),
      deadline: new Date(now.getFullYear(), now.getMonth() - 1, 12).toISOString(),
      responsibleName: "Administration Manager",
      status: "evaluated",
      statusHistory: statusHistory("evaluated", "Evaluated after archive migration"),
      completedDate: new Date(now.getFullYear(), now.getMonth() - 2, 28).toISOString(),
      efficiencyEvaluation: {
        id: crypto.randomUUID(),
        date: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString(),
        result: "ineffective",
        evidenceType: "note",
        evidence: "Sample check showed missing metadata in 12% of files",
        evaluatorName: "QMS Lead",
        notes: "Second corrective cycle required for full compliance.",
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      version: 2,
      revisionDate: now.toISOString(),
      revisionNote: "Efficiency evaluated: ineffective",
    },
  ];

  return dataset;
}
