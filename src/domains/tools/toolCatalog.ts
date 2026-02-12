export type ToolStatus = "active" | "scaffold";

export interface ToolDefinition {
  key: "issues" | "actions" | "internal-audit" | "management-review" | "supplier-evaluation" | "competency-evaluation";
  name: string;
  codification: string;
  description: string;
  route: string;
  status: ToolStatus;
}

export const toolCatalog: ToolDefinition[] = [
  {
    key: "issues",
    name: "Issues (Risks & Opportunities)",
    codification: "Standard Clause · 6.1",
    description: "Capture risks and opportunities from context and process analysis.",
    route: "/issues",
    status: "active",
  },
  {
    key: "actions",
    name: "Actions",
    codification: "Standard Clauses · 6.1/10.2",
    description: "Plan and track corrective and improvement actions.",
    route: "/actions",
    status: "active",
  },
  {
    key: "internal-audit",
    name: "Internal Audit",
    codification: "Standard Clause · 9.2",
    description: "Structure audit programs, plans, checklists, and resulting records.",
    route: "/tools/internal-audit",
    status: "scaffold",
  },
  {
    key: "management-review",
    name: "Management Review",
    codification: "Standard Clause · 9.3",
    description: "Organize review inputs, outputs, decisions, and follow-up items.",
    route: "/tools/management-review",
    status: "scaffold",
  },
  {
    key: "supplier-evaluation",
    name: "Supplier Evaluation",
    codification: "Standard Clause · 8.4",
    description: "Maintain supplier criteria and recurring evaluation records.",
    route: "/tools/supplier-evaluation",
    status: "scaffold",
  },
  {
    key: "competency-evaluation",
    name: "Competency Evaluation",
    codification: "Standard Clause · 7.2",
    description: "Define required competencies and assess personnel development.",
    route: "/tools/competency-evaluation",
    status: "scaffold",
  },
];
