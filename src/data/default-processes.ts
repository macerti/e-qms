import { ApplicableRegulation, ProcessType, ProcessActivity } from "@/types/management-system";
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

function dzReg(reference: string, name: string, complianceDisposition: string): ApplicableRegulation {
  return {
    id: crypto.randomUUID(),
    reference,
    name,
    complianceDisposition,
  };
}

export const DEFAULT_PROCESSES: DefaultProcessData[] = [
  {
    code: "PRO-001",
    name: "Human Resources",
    type: "support",
    purpose:
      "Ensure competency, awareness and availability of personnel through recruitment, onboarding, training, and performance follow-up.",
    inputs: ["Staffing needs", "Competence matrix", "Training requests", "Labor requirements"],
    outputs: ["Qualified personnel", "Training records", "Updated competence matrix", "Performance reviews"],
    activities: [
      { id: crypto.randomUUID(), name: "Workforce planning", description: "Determine roles and competency demand", sequence: 1 },
      { id: crypto.randomUUID(), name: "Recruitment and selection", description: "Run sourcing, interviews and selection", sequence: 2 },
      { id: crypto.randomUUID(), name: "Onboarding and induction", description: "Integrate new staff and QMS awareness", sequence: 3 },
      { id: crypto.randomUUID(), name: "Training management", description: "Plan and execute annual training", sequence: 4 },
      { id: crypto.randomUUID(), name: "Competence evaluation", description: "Evaluate effectiveness and close gaps", sequence: 5 },
    ],
    regulations: [
      dzReg("Law 90-11", "Algerian Labor Relations Law", "Employment contracts, duties and employee rights integrated into HR workflow."),
      dzReg("Executive Decree 96-98", "Occupational health and safety obligations", "Mandatory safety awareness and preventive training are tracked."),
    ],
    pilotName: "HR Manager",
  },
  {
    code: "PRO-002",
    name: "Management Process",
    type: "management",
    purpose:
      "Define strategy, policy and quality objectives, then review QMS performance and allocate resources for continual improvement.",
    inputs: ["Strategic context", "Risk and opportunity analysis", "Customer requirements", "Process performance reports"],
    outputs: ["Quality policy", "Quality objectives", "Management review decisions", "Resource allocation plan"],
    activities: [
      { id: crypto.randomUUID(), name: "Define strategic orientation", description: "Set yearly direction and priorities", sequence: 1 },
      { id: crypto.randomUUID(), name: "Set quality objectives", description: "Publish measurable and monitored objectives", sequence: 2 },
      { id: crypto.randomUUID(), name: "Conduct management review", description: "Review KPI trends, risks and audit results", sequence: 3 },
      { id: crypto.randomUUID(), name: "Approve action plans", description: "Approve CAPA and improvement initiatives", sequence: 4 },
      { id: crypto.randomUUID(), name: "Communicate leadership decisions", description: "Cascade decisions to pilots and teams", sequence: 5 },
    ],
    regulations: [
      dzReg("Law 04-08", "Commercial register and governance obligations", "Governance and accountability duties are integrated into leadership review."),
    ],
    pilotName: "General Manager",
  },
  {
    code: "PRO-003",
    name: "Quality Process",
    type: "management",
    purpose:
      "Maintain the ISO 9001 management system, deploy audits, monitor conformity, and drive corrective and preventive actions.",
    inputs: ["Audit findings", "Nonconformities", "Customer feedback", "Process KPI data"],
    outputs: ["Audit reports", "Corrective actions", "Updated procedures", "QMS performance dashboard"],
    activities: [
      { id: crypto.randomUUID(), name: "Plan internal audits", description: "Build and maintain annual audit program", sequence: 1 },
      { id: crypto.randomUUID(), name: "Run conformity checks", description: "Verify controls against QMS requirements", sequence: 2 },
      { id: crypto.randomUUID(), name: "Manage nonconformities", description: "Register, investigate and classify NCs", sequence: 3 },
      { id: crypto.randomUUID(), name: "Supervise corrective actions", description: "Track action plans and due dates", sequence: 4 },
      { id: crypto.randomUUID(), name: "Evaluate effectiveness", description: "Assess residual risk and close actions", sequence: 5 },
    ],
    regulations: [
      dzReg("Law 09-03", "Consumer protection and fraud control", "Customer complaint handling and product/service conformity checks included."),
    ],
    pilotName: "Quality Manager",
  },
  {
    code: "PRO-004",
    name: "Operational Process 01",
    type: "operational",
    purpose:
      "Deliver core service/product flow from order intake to execution while meeting specification, time and quality commitments.",
    inputs: ["Customer orders", "Technical specifications", "Approved resources", "Work instructions"],
    outputs: ["Delivered service/product", "Production records", "Release decision", "Delivery traceability"],
    activities: [
      { id: crypto.randomUUID(), name: "Order review", description: "Validate requirement feasibility", sequence: 1 },
      { id: crypto.randomUUID(), name: "Operational planning", description: "Prepare resources and timeline", sequence: 2 },
      { id: crypto.randomUUID(), name: "Execution", description: "Perform production/service realization", sequence: 3 },
      { id: crypto.randomUUID(), name: "In-process control", description: "Perform checkpoints and rework decisions", sequence: 4 },
      { id: crypto.randomUUID(), name: "Final release", description: "Verify final conformity before delivery", sequence: 5 },
    ],
    regulations: [
      dzReg("Law 03-10", "Environmental protection law", "Operational waste and environmental impacts are controlled and logged."),
    ],
    pilotName: "Operations Lead 01",
  },
  {
    code: "PRO-005",
    name: "Operational Process 02",
    type: "operational",
    purpose:
      "Execute secondary/field operations with controlled methods, preserving safety, traceability and customer commitments.",
    inputs: ["Work orders", "Field constraints", "Competent staff", "Approved supplier inputs"],
    outputs: ["Completed work package", "Service reports", "Acceptance records", "Operational lessons learned"],
    activities: [
      { id: crypto.randomUUID(), name: "Prepare intervention", description: "Plan resources and logistics", sequence: 1 },
      { id: crypto.randomUUID(), name: "Execute intervention", description: "Perform field operation", sequence: 2 },
      { id: crypto.randomUUID(), name: "Safety verification", description: "Check HSE controls and incidents", sequence: 3 },
      { id: crypto.randomUUID(), name: "Customer validation", description: "Capture acceptance and remarks", sequence: 4 },
      { id: crypto.randomUUID(), name: "Close operation", description: "Archive records and feedback", sequence: 5 },
    ],
    regulations: [
      dzReg("Executive Decree 05-09", "Workplace prevention and incident reporting", "HSE checks and incident escalation are mandatory per intervention."),
    ],
    pilotName: "Operations Lead 02",
  },
  {
    code: "PRO-006",
    name: "Purchasing Process",
    type: "support",
    purpose:
      "Select and monitor suppliers, purchase compliant inputs, and ensure external providers meet contractual and quality requirements.",
    inputs: ["Purchase requests", "Technical specifications", "Approved supplier list", "Budget and lead-time constraints"],
    outputs: ["Purchase orders", "Supplier evaluations", "Incoming inspection records", "Updated approved supplier list"],
    activities: [
      { id: crypto.randomUUID(), name: "Define purchase requirements", description: "Specify technical and quality criteria", sequence: 1 },
      { id: crypto.randomUUID(), name: "Evaluate suppliers", description: "Select suppliers based on risk and performance", sequence: 2 },
      { id: crypto.randomUUID(), name: "Issue and monitor orders", description: "Track delivery and conformity commitments", sequence: 3 },
      { id: crypto.randomUUID(), name: "Incoming verification", description: "Inspect incoming products/services", sequence: 4 },
      { id: crypto.randomUUID(), name: "Supplier review", description: "Review supplier score and improvement plan", sequence: 5 },
    ],
    regulations: [
      dzReg("Law 04-02", "Commercial practices law", "Supplier selection and contracting respect fair commercial practices and documentation."),
    ],
    pilotName: "Procurement Manager",
  },
];
