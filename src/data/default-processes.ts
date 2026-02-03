import { Process, ProcessType, ProcessActivity } from "@/types/management-system";
import { GOVERNANCE_ACTIVITY_NAME, GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";

export interface DefaultProcessData {
  code: string;
  name: string;
  type: ProcessType;
  purpose: string;
  inputs: string[];
  outputs: string[];
  activities: ProcessActivity[];
  pilotName?: string;
}

// Creates the system governance activity for a process
export function createGovernanceActivity(processId: string): ProcessActivity {
  return {
    id: `${GOVERNANCE_ACTIVITY_ID_PREFIX}${processId}`,
    name: GOVERNANCE_ACTIVITY_NAME,
    description: "System activity hosting generic ISO 9001 requirements applicable to all processes. This activity cannot be deleted.",
    sequence: 0, // Always first
    isSystemActivity: true,
  };
}

export const DEFAULT_PROCESSES: DefaultProcessData[] = [
  {
    code: "PRO-001",
    name: "Human Resources",
    type: "support",
    purpose: "Ensure the organization has competent personnel through recruitment, training, performance evaluation, and career development to support quality objectives.",
    inputs: [
      "Competency requirements from processes",
      "Training needs analysis",
      "Recruitment requests",
      "Performance data"
    ],
    outputs: [
      "Competent personnel",
      "Training records",
      "Performance evaluation results",
      "Updated competency matrix"
    ],
    activities: [
      { id: crypto.randomUUID(), name: "Identify competency requirements", description: "Define required competencies for each role based on process needs", sequence: 1 },
      { id: crypto.randomUUID(), name: "Recruit and select personnel", description: "Attract, evaluate, and hire qualified candidates", sequence: 2 },
      { id: crypto.randomUUID(), name: "Provide training and development", description: "Plan and deliver training programs to address gaps", sequence: 3 },
      { id: crypto.randomUUID(), name: "Evaluate performance", description: "Conduct regular performance reviews and feedback sessions", sequence: 4 },
      { id: crypto.randomUUID(), name: "Maintain competency records", description: "Document training, certifications, and skills", sequence: 5 }
    ],
    pilotName: "HR Manager"
  },
  {
    code: "PRO-002",
    name: "Leadership",
    type: "management",
    purpose: "Establish quality policy, objectives, and strategic direction. Ensure leadership commitment, accountability, and resource provision for the QMS.",
    inputs: [
      "Strategic planning inputs",
      "Context analysis results",
      "Interested parties requirements",
      "Performance data and trends"
    ],
    outputs: [
      "Quality policy",
      "Quality objectives",
      "Management review decisions",
      "Resource allocation decisions"
    ],
    activities: [
      { id: crypto.randomUUID(), name: "Establish quality policy", description: "Define and communicate the organization's quality commitment", sequence: 1 },
      { id: crypto.randomUUID(), name: "Define quality objectives", description: "Set measurable objectives aligned with strategic direction", sequence: 2 },
      { id: crypto.randomUUID(), name: "Conduct management review", description: "Periodic review of QMS performance and effectiveness", sequence: 3 },
      { id: crypto.randomUUID(), name: "Allocate resources", description: "Ensure adequate resources for QMS operation and improvement", sequence: 4 },
      { id: crypto.randomUUID(), name: "Promote customer focus", description: "Ensure customer requirements are understood and met", sequence: 5 }
    ],
    pilotName: "General Manager"
  },
  {
    code: "PRO-003",
    name: "Continual Improvement",
    type: "management",
    purpose: "Drive systematic improvement of the QMS effectiveness through analysis of data, corrective actions, and improvement initiatives.",
    inputs: [
      "Nonconformity reports",
      "Audit findings",
      "Customer feedback",
      "Performance indicators",
      "Improvement suggestions"
    ],
    outputs: [
      "Corrective actions",
      "Preventive measures",
      "Process improvements",
      "Updated procedures",
      "Lessons learned"
    ],
    activities: [
      { id: crypto.randomUUID(), name: "Collect and analyze data", description: "Gather performance data and identify trends", sequence: 1 },
      { id: crypto.randomUUID(), name: "Identify improvement opportunities", description: "Analyze root causes and potential improvements", sequence: 2 },
      { id: crypto.randomUUID(), name: "Plan corrective actions", description: "Define actions to address nonconformities and prevent recurrence", sequence: 3 },
      { id: crypto.randomUUID(), name: "Implement improvements", description: "Execute planned actions and changes", sequence: 4 },
      { id: crypto.randomUUID(), name: "Verify effectiveness", description: "Evaluate if improvements achieved intended results", sequence: 5 }
    ],
    pilotName: "Quality Manager"
  },
  {
    code: "PRO-004",
    name: "Purchasing",
    type: "support",
    purpose: "Ensure externally provided products and services conform to requirements through supplier evaluation, selection, and monitoring.",
    inputs: [
      "Purchase requisitions",
      "Product/service specifications",
      "Approved supplier list",
      "Budget allocations"
    ],
    outputs: [
      "Purchase orders",
      "Received products/services",
      "Supplier evaluation records",
      "Inspection/verification records"
    ],
    activities: [
      { id: crypto.randomUUID(), name: "Define purchasing requirements", description: "Specify product/service requirements and criteria", sequence: 1 },
      { id: crypto.randomUUID(), name: "Evaluate and select suppliers", description: "Assess supplier capability and approve suppliers", sequence: 2 },
      { id: crypto.randomUUID(), name: "Issue purchase orders", description: "Create and communicate purchase orders with requirements", sequence: 3 },
      { id: crypto.randomUUID(), name: "Verify received products", description: "Inspect and verify conformity of received items", sequence: 4 },
      { id: crypto.randomUUID(), name: "Monitor supplier performance", description: "Track delivery, quality, and responsiveness", sequence: 5 }
    ],
    pilotName: "Procurement Manager"
  }
];
