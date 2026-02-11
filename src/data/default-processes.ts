import { ApplicableRegulation, Process, ProcessStatus, ProcessType, ProcessActivity } from "@/types/management-system";
import { GOVERNANCE_ACTIVITY_NAME, GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";

export interface DefaultProcessData {
  code: string;
  name: string;
  type: ProcessType;
  purpose: string;
  inputs: string[];
  outputs: string[];
  activities: ProcessActivity[];
  regulations: ApplicableRegulation[];
  pilotName?: string;
}

export function createGovernanceActivity(processId: string): ProcessActivity {
  return {
    id: `${GOVERNANCE_ACTIVITY_ID_PREFIX}${processId}`,
    name: GOVERNANCE_ACTIVITY_NAME,
    description:
      "System activity hosting generic ISO 9001 requirements applicable to all processes. This activity cannot be deleted.",
    sequence: 0,
    isSystemActivity: true,
  };
}

const req = (...ids: string[]) => ids;

function dzReg(reference: string, name: string, complianceDisposition: string): ApplicableRegulation {
  return { id: crypto.randomUUID(), reference, name, complianceDisposition };
}

export const DEFAULT_PROCESSES: DefaultProcessData[] = [
  {
    code: "PRO-001",
    name: "Human Resources",
    type: "support",
    purpose: "Ensure competency, awareness and availability of personnel.",
    inputs: ["Staffing needs", "Competence matrix", "Training requests"],
    outputs: ["Qualified personnel", "Training records", "Performance reviews"],
    activities: [
      { id: crypto.randomUUID(), name: "Workforce planning", description: "Determine roles and competency demand", sequence: 1, allocatedRequirementIds: req("req-7.1.2", "req-7.1.1") },
      { id: crypto.randomUUID(), name: "Recruitment and selection", description: "Run sourcing and selection", sequence: 2, allocatedRequirementIds: req("req-7.2") },
      { id: crypto.randomUUID(), name: "Onboarding and induction", description: "Integrate new staff and QMS awareness", sequence: 3, allocatedRequirementIds: req("req-7.3") },
      { id: crypto.randomUUID(), name: "Training management", description: "Plan and execute annual training", sequence: 4, allocatedRequirementIds: req("req-7.2") },
      { id: crypto.randomUUID(), name: "Competence evaluation", description: "Evaluate effectiveness and close gaps", sequence: 5, allocatedRequirementIds: req("req-9.1.1") },
    ],
    regulations: [
      dzReg("Law 90-11", "Algerian Labor Relations Law", "Employment duties and rights are integrated into HR workflow."),
    ],
    pilotName: "HR Manager",
  },
  {
    code: "PRO-002",
    name: "Management Process",
    type: "management",
    purpose: "Define strategy and quality objectives, then review performance.",
    inputs: ["Strategic context", "Risk analysis", "Process performance reports"],
    outputs: ["Quality policy", "Management review decisions", "Resource plan"],
    activities: [
      { id: crypto.randomUUID(), name: "Define strategic orientation", description: "Set yearly direction and priorities", sequence: 1, allocatedRequirementIds: req("req-5.1.1") },
      { id: crypto.randomUUID(), name: "Set quality objectives", description: "Publish measurable objectives", sequence: 2, allocatedRequirementIds: req("req-6.2", "req-5.2") },
      { id: crypto.randomUUID(), name: "Conduct management review", description: "Review KPI trends and risks", sequence: 3, allocatedRequirementIds: req("req-9.3") },
      { id: crypto.randomUUID(), name: "Approve action plans", description: "Approve CAPA and improvements", sequence: 4, allocatedRequirementIds: req("req-10.2", "req-10.3") },
      { id: crypto.randomUUID(), name: "Communicate leadership decisions", description: "Cascade decisions to process owners", sequence: 5 },
    ],
    regulations: [
      dzReg("Law 04-08", "Commercial register and governance obligations", "Governance duties are integrated into leadership review."),
    ],
    pilotName: "General Manager",
  },
  {
    code: "PRO-003",
    name: "Quality Process",
    type: "management",
    purpose: "Operate the QMS, audits and corrective action workflow.",
    inputs: ["Audit plans", "KPI data", "Nonconformity reports"],
    outputs: ["Audit reports", "CAPA status", "Continual improvement actions"],
    activities: [
      { id: crypto.randomUUID(), name: "Plan internal audits", description: "Define annual audit program", sequence: 1, allocatedRequirementIds: req("req-9.2") },
      { id: crypto.randomUUID(), name: "Monitor process performance", description: "Consolidate KPIs", sequence: 2, allocatedRequirementIds: req("req-9.1.1") },
      { id: crypto.randomUUID(), name: "Manage nonconformities", description: "Register and investigate NCs", sequence: 3, allocatedRequirementIds: req("req-10.2") },
      { id: crypto.randomUUID(), name: "Supervise corrective actions", description: "Track action plans and due dates", sequence: 4, allocatedRequirementIds: req("req-10.2") },
      { id: crypto.randomUUID(), name: "Evaluate effectiveness", description: "Assess residual risk and closure", sequence: 5, allocatedRequirementIds: req("req-10.3") },
    ],
    regulations: [dzReg("Law 09-03", "Consumer protection law", "Complaint handling and conformity checks are included.")],
    pilotName: "Quality Manager",
  },
  {
    code: "PRO-004",
    name: "Operational Process 01",
    type: "operational",
    purpose: "Deliver core operations from order intake to release.",
    inputs: ["Customer orders", "Technical specs", "Approved resources"],
    outputs: ["Delivered product/service", "Production records", "Release decision"],
    activities: [
      { id: crypto.randomUUID(), name: "Order review", description: "Validate requirement feasibility", sequence: 1, allocatedRequirementIds: req("req-8.2.3") },
      { id: crypto.randomUUID(), name: "Operational planning", description: "Prepare resources and timeline", sequence: 2, allocatedRequirementIds: req("req-8.1") },
      { id: crypto.randomUUID(), name: "Execution", description: "Perform production/service realization", sequence: 3, allocatedRequirementIds: req("req-8.5.1") },
      { id: crypto.randomUUID(), name: "In-process control", description: "Perform checkpoints and rework", sequence: 4, allocatedRequirementIds: req("req-8.6") },
      { id: crypto.randomUUID(), name: "Final release", description: "Verify conformity before delivery", sequence: 5, allocatedRequirementIds: req("req-8.6") },
    ],
    regulations: [dzReg("Law 03-10", "Environmental protection law", "Operational environmental impacts are controlled.")],
    pilotName: "Operations Lead 01",
  },
  {
    code: "PRO-005",
    name: "Operational Process 02",
    type: "operational",
    purpose: "Execute secondary operations with safety and traceability.",
    inputs: ["Work orders", "Field constraints", "Competent staff"],
    outputs: ["Completed work", "Service reports", "Acceptance records"],
    activities: [
      { id: crypto.randomUUID(), name: "Prepare intervention", description: "Plan resources and logistics", sequence: 1, allocatedRequirementIds: req("req-8.1", "req-7.1.3") },
      { id: crypto.randomUUID(), name: "Execute intervention", description: "Perform field operation", sequence: 2, allocatedRequirementIds: req("req-8.5.1") },
      { id: crypto.randomUUID(), name: "Safety verification", description: "Check HSE controls", sequence: 3, allocatedRequirementIds: req("req-7.1.4") },
      { id: crypto.randomUUID(), name: "Customer validation", description: "Capture acceptance and remarks", sequence: 4, allocatedRequirementIds: req("req-9.1.2") },
      { id: crypto.randomUUID(), name: "Close operation", description: "Archive records and feedback", sequence: 5 },
    ],
    regulations: [dzReg("Executive Decree 05-09", "Workplace prevention and incident reporting", "HSE checks are mandatory per intervention.")],
    pilotName: "Operations Lead 02",
  },
  {
    code: "PRO-006",
    name: "Purchasing Process",
    type: "support",
    purpose: "Select suppliers and purchase compliant inputs.",
    inputs: ["Purchase requests", "Technical specifications", "Approved supplier list"],
    outputs: ["Purchase orders", "Supplier evaluations", "Incoming records"],
    activities: [
      { id: crypto.randomUUID(), name: "Define purchase requirements", description: "Specify technical and quality criteria", sequence: 1, allocatedRequirementIds: req("req-8.4.3") },
      { id: crypto.randomUUID(), name: "Evaluate suppliers", description: "Select suppliers based on risk and performance", sequence: 2, allocatedRequirementIds: req("req-8.4.1") },
      { id: crypto.randomUUID(), name: "Issue and monitor orders", description: "Track delivery and conformity", sequence: 3, allocatedRequirementIds: req("req-8.4.2") },
      { id: crypto.randomUUID(), name: "Incoming verification", description: "Inspect incoming products/services", sequence: 4, allocatedRequirementIds: req("req-8.6", "req-8.7") },
      { id: crypto.randomUUID(), name: "Supplier review", description: "Review supplier score and plan", sequence: 5, allocatedRequirementIds: req("req-9.1.1") },
    ],
    regulations: [dzReg("Law 04-02", "Commercial practices law", "Supplier selection and contracting are documented.")],
    pilotName: "Procurement Manager",
  },
  {
    code: "PRO-007",
    name: "IT Process",
    type: "support",
    purpose: "Provide reliable infrastructure and security controls.",
    inputs: ["Support requests", "Monitoring alerts", "Change requests"],
    outputs: ["Resolved tickets", "Availability reports", "Backup records"],
    activities: [
      { id: crypto.randomUUID(), name: "Service desk triage", description: "Prioritize incidents", sequence: 1, allocatedRequirementIds: req("req-7.1.3") },
      { id: crypto.randomUUID(), name: "Change deployment", description: "Deploy approved changes", sequence: 2, allocatedRequirementIds: req("req-8.5.6") },
      { id: crypto.randomUUID(), name: "Backup and recovery", description: "Run backup plan and restoration tests", sequence: 3, allocatedRequirementIds: req("req-7.5.3") },
      { id: crypto.randomUUID(), name: "Access management", description: "Control access rights", sequence: 4, allocatedRequirementIds: req("req-8.5.2") },
      { id: crypto.randomUUID(), name: "Performance monitoring", description: "Track availability and incidents", sequence: 5, allocatedRequirementIds: req("req-9.1.1") },
    ],
    regulations: [dzReg("Law 18-07", "Personal data protection law", "Data processing and logs are controlled and retained.")],
    pilotName: "IT Manager",
  },
  {
    code: "PRO-008",
    name: "Administration Process",
    type: "support",
    purpose: "Ensure administrative governance and records management.",
    inputs: ["Administrative requests", "Regulatory notices", "Facility requests"],
    outputs: ["Administrative approvals", "Facility records", "Archived records"],
    activities: [
      { id: crypto.randomUUID(), name: "Administrative intake", description: "Receive and classify requests", sequence: 1, allocatedRequirementIds: req("req-7.5.2") },
      { id: crypto.randomUUID(), name: "Facilities coordination", description: "Coordinate maintenance and utilities", sequence: 2, allocatedRequirementIds: req("req-7.1.3") },
      { id: crypto.randomUUID(), name: "Contract and legal filing", description: "Maintain controlled legal documents", sequence: 3, allocatedRequirementIds: req("req-7.5.3") },
      { id: crypto.randomUUID(), name: "Service follow-up", description: "Track execution and response times", sequence: 4, allocatedRequirementIds: req("req-9.1.1") },
      { id: crypto.randomUUID(), name: "Administrative review", description: "Evaluate efficiency and improvement", sequence: 5, allocatedRequirementIds: req("req-10.1") },
    ],
    regulations: [dzReg("Law 06-01", "Anti-corruption law", "Administrative approvals and traceability are formalized.")],
    pilotName: "Administration Manager",
  },
  {
    code: "PRO-009",
    name: "Sales Process",
    type: "operational",
    purpose: "Capture customer requirements and manage order conversion.",
    inputs: ["Leads", "Customer inquiries", "Service catalog"],
    outputs: ["Validated quotations", "Signed contracts", "Customer feedback"],
    activities: [
      { id: crypto.randomUUID(), name: "Lead qualification", description: "Evaluate lead potential", sequence: 1, allocatedRequirementIds: req("req-8.2.1") },
      { id: crypto.randomUUID(), name: "Requirement clarification", description: "Confirm customer needs", sequence: 2, allocatedRequirementIds: req("req-8.2.2") },
      { id: crypto.randomUUID(), name: "Offer preparation", description: "Prepare validated commercial offer", sequence: 3, allocatedRequirementIds: req("req-8.2.3") },
      { id: crypto.randomUUID(), name: "Order handover", description: "Transfer requirements to operations", sequence: 4, allocatedRequirementIds: req("req-8.2.4") },
      { id: crypto.randomUUID(), name: "Satisfaction follow-up", description: "Collect feedback and complaints", sequence: 5, allocatedRequirementIds: req("req-9.1.2") },
    ],
    regulations: [dzReg("Law 04-02", "Commercial practices law", "Sales commitments and communications are controlled.")],
    pilotName: "Sales Manager",
  },
];

export function createFallbackProcesses(now = new Date().toISOString()): Process[] {
  return DEFAULT_PROCESSES.map((process) => {
    const processId = `fallback-${process.code.toLowerCase()}`;
    return {
      id: processId,
      code: process.code,
      name: process.name,
      type: process.type,
      purpose: process.purpose,
      inputs: process.inputs,
      outputs: process.outputs,
      activities: [createGovernanceActivity(processId), ...process.activities.map((activity) => ({ ...activity, sequence: activity.sequence + 1 }))],
      regulations: process.regulations,
      pilotName: process.pilotName,
      status: "active" as ProcessStatus,
      standard: "ISO_9001",
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      indicatorIds: [],
      riskIds: [],
      opportunityIds: [],
      actionIds: [],
      auditIds: [],
      documentIds: [],
    };
  });
}
