import { Requirement } from "@/types/requirements";

// Preloaded ISO 9001:2015 Generic Requirements
// These are automatically allocated to the "Management System Governance" activity
// Type: 'generic' = applies to all processes via governance activity
// Type: 'unique' = single-instance system-wide (e.g., Quality Policy)
// Type: 'duplicable' = per operational process (e.g., process-specific controls)

export const ISO9001_GENERIC_REQUIREMENTS: Requirement[] = [
  {
    id: "req-4.1",
    clauseNumber: "4.1",
    clauseTitle: "Understanding the organization and its context",
    description: "Determine external and internal issues relevant to the organization's purpose and strategic direction",
    type: "generic",
  },
  {
    id: "req-4.2",
    clauseNumber: "4.2",
    clauseTitle: "Understanding the needs and expectations of interested parties",
    description: "Determine interested parties and their relevant requirements",
    type: "generic",
  },
  {
    id: "req-4.4",
    clauseNumber: "4.4",
    clauseTitle: "Quality management system and its processes",
    description: "Establish, implement, maintain and continually improve the QMS including needed processes",
    type: "generic",
  },
  {
    id: "req-5.1",
    clauseNumber: "5.1",
    clauseTitle: "Leadership and commitment",
    description: "Top management shall demonstrate leadership and commitment with respect to the QMS",
    type: "unique",
  },
  {
    id: "req-5.2",
    clauseNumber: "5.2",
    clauseTitle: "Quality Policy",
    description: "Establish, implement and maintain a quality policy appropriate to the organization",
    type: "unique",
  },
  {
    id: "req-6.1",
    clauseNumber: "6.1",
    clauseTitle: "Actions to address risks and opportunities",
    description: "Plan actions to address risks and opportunities that can affect conformity and customer satisfaction",
    type: "generic",
  },
  {
    id: "req-6.2",
    clauseNumber: "6.2",
    clauseTitle: "Quality objectives and planning to achieve them",
    description: "Establish quality objectives at relevant functions, levels and processes",
    type: "generic",
  },
  {
    id: "req-7.1.6",
    clauseNumber: "7.1.6",
    clauseTitle: "Organizational knowledge",
    description: "Determine the knowledge necessary for the operation of processes and achievement of conformity",
    type: "generic",
  },
  {
    id: "req-7.5",
    clauseNumber: "7.5",
    clauseTitle: "Documented information",
    description: "Control of documented information required by the QMS and determined necessary",
    type: "generic",
  },
  {
    id: "req-9.1",
    clauseNumber: "9.1",
    clauseTitle: "Monitoring, measurement, analysis and evaluation",
    description: "Determine what needs to be monitored and measured, methods, and when to analyze results",
    type: "generic",
  },
  {
    id: "req-9.2",
    clauseNumber: "9.2",
    clauseTitle: "Internal audit",
    description: "Conduct internal audits at planned intervals to provide information on QMS conformity",
    type: "unique",
  },
  {
    id: "req-9.3",
    clauseNumber: "9.3",
    clauseTitle: "Management review",
    description: "Top management shall review the QMS at planned intervals",
    type: "unique",
  },
  {
    id: "req-10.2",
    clauseNumber: "10.2",
    clauseTitle: "Nonconformity and corrective action",
    description: "React to nonconformities, evaluate need for action, implement action, review effectiveness",
    type: "generic",
  },
  {
    id: "req-10.3",
    clauseNumber: "10.3",
    clauseTitle: "Continual improvement",
    description: "Continually improve the suitability, adequacy and effectiveness of the QMS",
    type: "generic",
  },
];

// Map requirements by clause number for easy lookup
export const REQUIREMENTS_BY_CLAUSE = ISO9001_GENERIC_REQUIREMENTS.reduce(
  (acc, req) => ({ ...acc, [req.clauseNumber]: req }),
  {} as Record<string, Requirement>
);

// Get requirements by type
export function getRequirementsByType(type: Requirement["type"]): Requirement[] {
  return ISO9001_GENERIC_REQUIREMENTS.filter(r => r.type === type);
}

// Get all generic requirements (for governance activity)
export function getGenericRequirements(): Requirement[] {
  return getRequirementsByType("generic");
}
