import { Document, DocumentType, ISOClauseReference } from "@/types/management-system";

type SeedRow = {
  code: string;
  title: string;
  type: DocumentType;
  clause: string;
  purpose: string;
  section: string;
};

const rows: SeedRow[] = [
  { section: "1", code: "MS-001", title: "Quality Management System Manual", type: "record", clause: "4-10", purpose: "Overview of QMS structure, processes, interactions, and compliance approach." },
  { section: "1", code: "MS-001-01", title: "Quality Policy", type: "policy", clause: "5.2", purpose: "Statement of commitments: customer focus, legal requirements, improvement." },
  { section: "1", code: "MS-001-02", title: "Quality Objectives", type: "policy", clause: "6.2", purpose: "Defined measurable objectives consistent with policy and context; baseline for performance." },
  { section: "1", code: "MS-001-02-A", title: "QMS KPI Dashboard", type: "record", clause: "6.2 / 9.1", purpose: "Monitors progress against quality objectives." },
  { section: "1", code: "MS-001-03", title: "QMS Scope", type: "record", clause: "4.3", purpose: "Definition of QMS boundaries, products/services, and applicability." },
  { section: "1", code: "MS-001-04", title: "Process Interaction Map", type: "record", clause: "4.4", purpose: "Visual representation of QMS processes and interactions." },
  { section: "2", code: "MS-012", title: "Leadership & Governance Procedure", type: "procedure", clause: "5.1-5.3", purpose: "How top management demonstrates commitment, accountability and support to the QMS." },
  { section: "2", code: "MS-012-01", title: "Roles, Responsibilities & Authorities Matrix", type: "record", clause: "5.3", purpose: "Clear assignment of QMS responsibilities." },
  { section: "2", code: "MS-012-02", title: "Leadership Commitment Evidence", type: "record", clause: "5.1", purpose: "Evidence (meetings, approvals, communications)." },
  { section: "3", code: "MS-002", title: "Document & Record Control Procedure", type: "procedure", clause: "7.5", purpose: "How controlled information is created, approved, updated, distributed, and archived." },
  { section: "3", code: "MS-002-01", title: "Controlled Document Register", type: "record", clause: "7.5", purpose: "Master list with current versions, owners, retention schedule." },
  { section: "3", code: "MS-002-02", title: "Document Change/Revision Log", type: "record", clause: "7.5", purpose: "Tracks revisions, authors, justification, review dates." },
  { section: "4", code: "MS-003", title: "Context & Interested Parties Procedure", type: "procedure", clause: "4.1-4.2", purpose: "How organizational context and relevant issues are monitored." },
  { section: "4", code: "MS-003-01", title: "Interested Parties & Needs Register", type: "record", clause: "4.2", purpose: "Stakeholder list and relevant requirements." },
  { section: "4", code: "MS-003-02", title: "Risk & Opportunity Assessment Form", type: "form", clause: "6.1", purpose: "Template to identify, evaluate and plan responses to risks & opportunities." },
  { section: "4", code: "MS-003-03", title: "Risk & Opportunity Log", type: "record", clause: "6.1", purpose: "Documented risk treatment and review outcomes." },
  { section: "5", code: "MS-004", title: "HR, Competence, Awareness & Training Procedure", type: "procedure", clause: "7.1-7.3", purpose: "How personnel needs, job profiles, recruitment, onboarding, training, awareness and competence are managed." },
  { section: "5", code: "MS-004-01", title: "Job Description & Competence Profile", type: "record", clause: "7.1-7.2", purpose: "Role requirements linked to QMS impact." },
  { section: "5", code: "MS-004-02", title: "Recruitment & Selection Records", type: "record", clause: "7.1-7.2", purpose: "Evidence of hiring actions & candidate evaluation." },
  { section: "5", code: "MS-004-03", title: "Training Needs & Plan", type: "record", clause: "7.2", purpose: "Identifies training requirements and schedules." },
  { section: "5", code: "MS-004-04", title: "Training Record / Attendance", type: "record", clause: "7.2", purpose: "Evidence of training completion." },
  { section: "5", code: "MS-004-05", title: "Competence Assessment", type: "record", clause: "7.2", purpose: "Evaluations showing employees are competent." },
  { section: "5", code: "MS-004-06", title: "Awareness & Induction Record", type: "record", clause: "7.3", purpose: "Evidence employees understand policy, objectives, and contribution." },
  { section: "5", code: "MS-004-07", title: "Organizational Knowledge Management", type: "procedure", clause: "7.1.6", purpose: "How critical knowledge is identified, maintained, and protected." },
  { section: "5", code: "MS-004-08", title: "Knowledge Register", type: "record", clause: "7.1.6", purpose: "List of key knowledge, holders, backup and risks." },
  { section: "6", code: "MS-013", title: "Infrastructure & Work Environment Control", type: "procedure", clause: "7.1.3-7.1.4", purpose: "How facilities, equipment, IT, and work conditions are maintained." },
  { section: "6", code: "MS-013-01", title: "Maintenance / Infrastructure Log", type: "record", clause: "7.1.3", purpose: "Evidence of maintenance activities." },
  { section: "7", code: "MS-005", title: "Operational Planning & Control Procedure", type: "procedure", clause: "8.1-8.5", purpose: "How processes are planned, controlled, changes managed, and outputs ensured." },
  { section: "7", code: "MS-005-01", title: "SOP: Core Operational Process", type: "instruction", clause: "8.5", purpose: "Standard operating procedures for main product/service delivery." },
  { section: "7", code: "MS-005-02", title: "Work Instruction - Task Detail", type: "instruction", clause: "8.5", purpose: "Procedure-level task instructions for critical activities." },
  { section: "7", code: "MS-005-03", title: "Change Request & Log", type: "form", clause: "8.5.6", purpose: "Form to request changes and record outcomes." },
  { section: "7", code: "MS-014", title: "Design & Development Applicability Assessment", type: "record", clause: "8.3", purpose: "Justification of applicability/exclusion of design & development." },
  { section: "8", code: "MS-006", title: "Customer Communication & Requirements", type: "procedure", clause: "8.2.1", purpose: "How customer needs, communications, and commitments are captured and addressed." },
  { section: "8", code: "MS-006-01", title: "Customer Feedback & Complaints Log", type: "record", clause: "9.1.2 / 8.2.1", purpose: "Captures feedback, complaints, and actions." },
  { section: "8", code: "MS-006-02", title: "Customer Satisfaction Survey", type: "form", clause: "9.1.2", purpose: "Template for measuring customer satisfaction." },
  { section: "8", code: "MS-007", title: "Supplier Evaluation & Control", type: "procedure", clause: "8.4", purpose: "How suppliers are assessed, selected, monitored, and re-evaluated." },
  { section: "8", code: "MS-007-01", title: "Supplier Evaluation Form", type: "form", clause: "8.4.1", purpose: "Criteria and results of supplier evaluation." },
  { section: "8", code: "MS-007-02", title: "Approved Supplier List", type: "record", clause: "8.4.1", purpose: "Current list of qualified suppliers." },
  { section: "9", code: "MS-008", title: "Monitoring, Measurement & Calibration Procedure", type: "procedure", clause: "9.1 / 7.1.5", purpose: "How performance, compliance and measurement resources are managed." },
  { section: "9", code: "MS-008-01", title: "Measurement Results Record", type: "record", clause: "9.1", purpose: "Evidence of monitoring outputs." },
  { section: "9", code: "MS-008-02", title: "Calibration Schedule", type: "record", clause: "7.1.5", purpose: "Planned calibration dates." },
  { section: "9", code: "MS-008-03", title: "Calibration Records", type: "record", clause: "7.1.5", purpose: "Evidence calibrations performed." },
  { section: "10", code: "MS-009", title: "Nonconformance & Corrective Action Procedure", type: "procedure", clause: "10.2", purpose: "Handling, documenting, correcting nonconformities and preventing recurrence." },
  { section: "10", code: "MS-009-01", title: "Nonconformance Report (NCR)", type: "form", clause: "10.2", purpose: "Captures nonconformity details." },
  { section: "10", code: "MS-009-02", title: "Corrective Action Plan", type: "record", clause: "10.2", purpose: "Plans to address root cause." },
  { section: "10", code: "MS-009-03", title: "Corrective Action Results", type: "record", clause: "10.2", purpose: "Proof corrective action was effective." },
  { section: "10", code: "MS-015", title: "Continual Improvement Procedure", type: "procedure", clause: "10.3", purpose: "How improvement opportunities are identified, evaluated, and implemented." },
  { section: "10", code: "MS-015-01", title: "Improvement Opportunity Log", type: "record", clause: "10.3", purpose: "Tracks ideas, improvements and benefits achieved." },
  { section: "11", code: "MS-010", title: "Internal Audit Procedure", type: "procedure", clause: "9.2", purpose: "How internal audits are planned, executed, and recorded." },
  { section: "11", code: "MS-010-01", title: "Internal Audit Plan", type: "record", clause: "9.2", purpose: "Scheduled internal audit timetable." },
  { section: "11", code: "MS-010-02", title: "Internal Audit Report", type: "record", clause: "9.2", purpose: "Findings and conclusions." },
  { section: "11", code: "MS-010-03", title: "Internal Audit Checklist", type: "form", clause: "9.2", purpose: "Audit questions and criteria." },
  { section: "11", code: "MS-011", title: "Management Review Procedure", type: "procedure", clause: "9.3", purpose: "How management evaluates QMS performance and opportunities." },
  { section: "11", code: "MS-011-01", title: "Management Review Agenda", type: "form", clause: "9.3", purpose: "Topics for review." },
  { section: "11", code: "MS-011-02", title: "Management Review Minutes", type: "record", clause: "9.3", purpose: "Decisions and action items." },
];

function parseClauses(clauseText: string): ISOClauseReference[] {
  return clauseText
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ({ clauseNumber: part, clauseTitle: "ISO 9001:2015" }));
}

export function createSeedDocuments(): Document[] {
  const now = new Date().toISOString();
  const sectionProcedureById = new Map<string, string>();

  return rows.map((row) => {
    const id = crypto.randomUUID();
    const parentProcedureId = row.type === "procedure" ? undefined : sectionProcedureById.get(row.section);
    if (row.type === "procedure") {
      sectionProcedureById.set(row.section, id);
    }

    return {
      id,
      code: row.code,
      title: row.title,
      type: row.type,
      description: row.purpose,
      processIds: [],
      isoClauseReferences: parseClauses(row.clause),
      standard: "ISO_9001",
      status: "active",
      version: 1,
      revisionDate: now,
      createdAt: now,
      updatedAt: now,
      purpose: row.purpose,
      parentProcedureId,
      responsibilities: "",
      definitions: "",
      content: "",
      attachments: [],
      mergedDocumentIds: [],
    };
  });
}
