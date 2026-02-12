export interface ToolWorkspaceTab {
  key: string;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: string[];
}

export type ScaffoldTool = "internal-audit" | "management-review" | "supplier-evaluation" | "competency-evaluation";

export const scaffoldedToolTabs: Record<ScaffoldTool, ToolWorkspaceTab[]> = {
  "internal-audit": [
    { key: "program", label: "Program", emptyTitle: "No audit program yet", emptyDescription: "Define annual or periodic audit cycles.", columns: ["Program", "Owner", "Period", "Status"] },
    { key: "plans", label: "Audit Plans", emptyTitle: "No audit plans", emptyDescription: "Create plans with scope, criteria, and timing.", columns: ["Plan", "Scope", "Lead Auditor", "Date"] },
    { key: "checklists", label: "Checklists", emptyTitle: "No checklists", emptyDescription: "Maintain clause-based checklist templates.", columns: ["Checklist", "Standard", "Version", "Owner"] },
    { key: "trails", label: "Audit Trails", emptyTitle: "No audit trails", emptyDescription: "Capture evidence and traceability logs.", columns: ["Trail ID", "Source", "Evidence", "Finding"] },
    { key: "ncs", label: "Non-Conformities", emptyTitle: "No non-conformities", emptyDescription: "List findings requiring corrective action.", columns: ["Reference", "Severity", "Linked Action", "Status"] },
  ],
  "management-review": [
    { key: "inputs", label: "Inputs", emptyTitle: "No review inputs", emptyDescription: "Collect performance and context inputs.", columns: ["Input", "Source", "Period", "Owner"] },
    { key: "outputs", label: "Outputs", emptyTitle: "No review outputs", emptyDescription: "Capture review outcomes and updates.", columns: ["Output", "Date", "Type", "Status"] },
    { key: "decisions", label: "Decisions & Actions", emptyTitle: "No decisions recorded", emptyDescription: "Track decisions and related commitments.", columns: ["Decision", "Responsible", "Due Date", "Action"] },
    { key: "follow-up", label: "Follow-up", emptyTitle: "No follow-up items", emptyDescription: "Monitor completion of review actions.", columns: ["Item", "Owner", "Due", "Progress"] },
  ],
  "supplier-evaluation": [
    { key: "criteria", label: "Criteria Definition", emptyTitle: "No criteria defined", emptyDescription: "Define and maintain supplier criteria.", columns: ["Criterion", "Weight", "Category", "Active"] },
    { key: "suppliers", label: "Supplier List", emptyTitle: "No suppliers listed", emptyDescription: "Build your approved supplier register.", columns: ["Supplier", "Category", "Risk", "Status"] },
    { key: "evaluations", label: "Evaluations", emptyTitle: "No evaluations yet", emptyDescription: "Run recurring supplier evaluations.", columns: ["Supplier", "Date", "Evaluator", "Result"] },
    { key: "reeval", label: "Re-Evaluations", emptyTitle: "No re-evaluations", emptyDescription: "Track follow-up evaluations and updates.", columns: ["Supplier", "Trigger", "Due Date", "Status"] },
  ],
  "competency-evaluation": [
    { key: "roles", label: "Roles & Required Competencies", emptyTitle: "No role matrix yet", emptyDescription: "Define competencies expected per role.", columns: ["Role", "Competency", "Minimum Level", "Owner"] },
    { key: "personnel", label: "Personnel", emptyTitle: "No personnel records", emptyDescription: "Register personnel to evaluate.", columns: ["Name", "Role", "Area", "Status"] },
    { key: "assessments", label: "Assessments", emptyTitle: "No assessments yet", emptyDescription: "Document assessments and evidence.", columns: ["Person", "Assessment", "Date", "Result"] },
    { key: "plans", label: "Development Plans", emptyTitle: "No development plans", emptyDescription: "Create upskilling and development plans.", columns: ["Person", "Plan", "Target Date", "Progress"] },
  ],
};

export const scaffoldedToolMeta: Record<ScaffoldTool, { title: string; codification: string; description: string }> = {
  "internal-audit": { title: "Internal Audit", codification: "Standard Clause · 9.2", description: "Scaffolded workspace for planning and managing internal audit records." },
  "management-review": { title: "Management Review", codification: "Standard Clause · 9.3", description: "Scaffolded workspace for review inputs, outputs, decisions, and follow-up." },
  "supplier-evaluation": { title: "Supplier Evaluation", codification: "Standard Clause · 8.4", description: "Scaffolded workspace for supplier performance lifecycle." },
  "competency-evaluation": { title: "Competency Evaluation", codification: "Standard Clause · 7.2", description: "Scaffolded workspace for competency planning and assessment." },
};
