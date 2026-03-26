/**
 * ISO/IEC 17021-1 CB Tool Workspace Tabs
 * Each CB tool has its own tab structure for the workspace view.
 */

export interface CBWorkspaceTab {
  key: string;
  label: string;
  icon?: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: string[];
}

export const cbWorkspaceTabs: Record<string, CBWorkspaceTab[]> = {
  "cb-clients": [
    { key: "applications", label: "Applications", icon: "FileInput", emptyTitle: "No applications", emptyDescription: "Register new certification applications.", columns: ["Client", "Standard", "Scope", "Date", "Status"] },
    { key: "contracts", label: "Active Contracts", icon: "FileText", emptyTitle: "No active contracts", emptyDescription: "Manage ongoing certification contracts.", columns: ["Client", "Standard", "Start", "Renewal", "Status"] },
    { key: "scopes", label: "Scope Definitions", icon: "Target", emptyTitle: "No scopes defined", emptyDescription: "Define certification scopes per client.", columns: ["Client", "Standard", "IAF Code", "Statement", "Exclusions"] },
  ],
  "cb-audit-programs": [
    { key: "programs", label: "Programs", icon: "CalendarRange", emptyTitle: "No audit programs", emptyDescription: "Create 3-year certification audit cycle programs.", columns: ["Client", "Standard", "Cycle", "Audits Planned", "Status"] },
    { key: "schedule", label: "Schedule", icon: "Calendar", emptyTitle: "No scheduled audits", emptyDescription: "View and manage the audit calendar.", columns: ["Audit", "Client", "Type", "Date", "Lead Auditor"] },
    { key: "resources", label: "Resource Allocation", icon: "Users", emptyTitle: "No allocations", emptyDescription: "Assign auditors and technical experts.", columns: ["Auditor", "Availability", "Standards", "Sectors", "Assignments"] },
  ],
  "cb-audits": [
    { key: "active", label: "Active Audits", icon: "ClipboardList", emptyTitle: "No active audits", emptyDescription: "Audits currently in execution.", columns: ["Client", "Type", "Lead", "Start", "Status"] },
    { key: "reports", label: "Audit Reports", icon: "FileCheck", emptyTitle: "No reports", emptyDescription: "Finalized audit reports and findings.", columns: ["Client", "Type", "Date", "NCs", "Conclusion"] },
    { key: "ncs", label: "Nonconformities", icon: "AlertTriangle", emptyTitle: "No NCs recorded", emptyDescription: "Track nonconformities and corrective actions.", columns: ["Reference", "Client", "Grade", "Clause", "Status"] },
    { key: "technical-review", label: "Technical Review", icon: "Search", emptyTitle: "No pending reviews", emptyDescription: "Pre-decision technical review queue.", columns: ["Client", "Audit", "Reviewer", "Submitted", "Status"] },
  ],
  "cb-certificates": [
    { key: "active", label: "Active Certificates", icon: "Award", emptyTitle: "No active certificates", emptyDescription: "Currently valid certificates.", columns: ["Certificate #", "Client", "Standard", "Issued", "Expires"] },
    { key: "suspended", label: "Suspended / Withdrawn", icon: "ShieldAlert", emptyTitle: "None suspended", emptyDescription: "Certificates with suspended or withdrawn status.", columns: ["Certificate #", "Client", "Standard", "Action", "Date", "Reason"] },
    { key: "decisions", label: "Certification Decisions", icon: "Scale", emptyTitle: "No decisions", emptyDescription: "Independent certification decision log.", columns: ["Client", "Type", "Decision Maker", "Outcome", "Date"] },
    { key: "directory", label: "Public Directory", icon: "Globe", emptyTitle: "No public listings", emptyDescription: "Publicly visible certified organizations.", columns: ["Client", "Standard", "Scope", "Status", "Valid Until"] },
  ],
  "cb-impartiality": [
    { key: "risk-register", label: "Risk Register", icon: "ShieldQuestion", emptyTitle: "No risks identified", emptyDescription: "Register and assess impartiality threats.", columns: ["Threat Type", "Description", "Risk Level", "Safeguard", "Mitigated"] },
    { key: "declarations", label: "Conflict Declarations", icon: "FileWarning", emptyTitle: "No declarations", emptyDescription: "Auditor conflict-of-interest declarations.", columns: ["Auditor", "Client", "Type", "Date", "Valid Until"] },
    { key: "committee", label: "Impartiality Committee", icon: "UsersRound", emptyTitle: "No committee records", emptyDescription: "Safeguarding committee meetings and decisions.", columns: ["Date", "Members", "Topics", "Decisions", "Actions"] },
  ],
  "cb-competence": [
    { key: "auditors", label: "Auditor Profiles", icon: "UserCheck", emptyTitle: "No auditors registered", emptyDescription: "Register and manage auditor profiles.", columns: ["Name", "Status", "Standards", "Sectors", "Last Witness"] },
    { key: "matrix", label: "Competence Matrix", icon: "Grid3x3", emptyTitle: "No matrix configured", emptyDescription: "Map auditor competences to standards and sectors.", columns: ["Auditor", "Standard", "IAF Code", "Role", "Qualified Until"] },
    { key: "witness", label: "Witness Audits", icon: "Eye", emptyTitle: "No witness records", emptyDescription: "Track witness audit evaluations.", columns: ["Auditor", "Audit", "Evaluator", "Date", "Result"] },
    { key: "training", label: "Training & CPD", icon: "BookOpen", emptyTitle: "No training records", emptyDescription: "Continuous professional development tracking.", columns: ["Auditor", "Training", "Provider", "Date", "Hours"] },
  ],
  "cb-complaints-appeals": [
    { key: "complaints", label: "Complaints", icon: "MessageSquareWarning", emptyTitle: "No complaints", emptyDescription: "Register and investigate complaints.", columns: ["Reference", "Complainant", "Subject", "Received", "Status"] },
    { key: "appeals", label: "Appeals", icon: "Gavel", emptyTitle: "No appeals", emptyDescription: "Manage formal appeals against decisions.", columns: ["Reference", "Client", "Related Decision", "Filed", "Status"] },
    { key: "resolutions", label: "Resolutions", icon: "CheckCircle", emptyTitle: "No resolutions", emptyDescription: "Track resolved complaints and appeals.", columns: ["Reference", "Type", "Resolution", "Date", "Follow-up"] },
  ],
};

export const cbToolMeta: Record<string, { title: string; codification: string; description: string }> = {
  "cb-clients": { title: "Clients & Contracts", codification: "ISO/IEC 17021-1 · Clause 8.2", description: "Application review, contract management, and scope definitions for certification clients." },
  "cb-audit-programs": { title: "Audit Programs", codification: "ISO/IEC 17021-1 · Clause 9.1", description: "3-year audit cycle planning, scheduling, and resource allocation." },
  "cb-audits": { title: "Audits", codification: "ISO/IEC 17021-1 · Clauses 9.2–9.4", description: "Stage 1, Stage 2, surveillance, and recertification audit execution." },
  "cb-certificates": { title: "Certificates", codification: "ISO/IEC 17021-1 · Clause 8.4", description: "Certificate lifecycle — issuance, suspension, withdrawal, and public directory." },
  "cb-impartiality": { title: "Impartiality", codification: "ISO/IEC 17021-1 · Clause 5.2", description: "Impartiality risk assessment, conflict declarations, and safeguarding committee." },
  "cb-competence": { title: "Competence", codification: "ISO/IEC 17021-1 · Clause 7", description: "Auditor qualification, competence matrix, witness audits, and CPD tracking." },
  "cb-complaints-appeals": { title: "Complaints & Appeals", codification: "ISO/IEC 17021-1 · Clauses 9.8–9.9", description: "Complaint handling, appeals process, and resolution tracking." },
};
