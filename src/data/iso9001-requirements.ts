import { Requirement } from "@/types/requirements";

// Complete ISO 9001:2015 Requirements Inventory
// Categorized by type: Generic, Duplicable, Unique
// Note: Clauses 1-3 are scope/definitions and are NOT allocatable requirements

// ============================================================================
// GENERIC REQUIREMENTS (Apply to ALL processes via Management System Governance activity)
// Pre-allocated automatically to every process
// ============================================================================

const GENERIC_REQUIREMENTS: Requirement[] = [
  // Clause 4 – Context
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
  
  // Clause 5 – Leadership (system-wide aspects)
  {
    id: "req-5.1.1",
    clauseNumber: "5.1.1",
    clauseTitle: "Leadership and commitment (general)",
    description: "Top management shall demonstrate leadership and commitment with respect to the QMS",
    type: "generic",
  },
  {
    id: "req-5.1.2",
    clauseNumber: "5.1.2",
    clauseTitle: "Customer focus",
    description: "Top management shall demonstrate leadership and commitment with respect to customer focus",
    type: "generic",
  },
  {
    id: "req-5.3",
    clauseNumber: "5.3",
    clauseTitle: "Organizational roles, responsibilities and authorities",
    description: "Top management shall ensure responsibilities and authorities are assigned, communicated and understood",
    type: "generic",
  },
  
  // Clause 6 – Planning
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
    id: "req-6.3",
    clauseNumber: "6.3",
    clauseTitle: "Planning of changes",
    description: "When changes to the QMS are needed, they shall be carried out in a planned manner",
    type: "generic",
  },
  
  // Clause 7 – Support (process-level application)
  {
    id: "req-7.1.6",
    clauseNumber: "7.1.6",
    clauseTitle: "Organizational knowledge",
    description: "Determine the knowledge necessary for the operation of processes and achievement of conformity",
    type: "generic",
  },
  {
    id: "req-7.5.1",
    clauseNumber: "7.5.1",
    clauseTitle: "Documented information – general",
    description: "The QMS shall include documented information required by the standard and determined necessary",
    type: "generic",
  },
  {
    id: "req-7.5.2",
    clauseNumber: "7.5.2",
    clauseTitle: "Creating and updating documented information",
    description: "Ensure appropriate identification, format, review and approval of documented information",
    type: "generic",
  },
  {
    id: "req-7.5.3",
    clauseNumber: "7.5.3",
    clauseTitle: "Control of documented information",
    description: "Documented information shall be controlled to ensure availability, suitability and protection",
    type: "generic",
  },
  
  // Clause 9 – Performance evaluation (process view)
  {
    id: "req-9.1.1",
    clauseNumber: "9.1.1",
    clauseTitle: "Monitoring, measurement, analysis and evaluation – general",
    description: "Determine what needs to be monitored and measured, methods, and when to analyze results",
    type: "generic",
  },
  {
    id: "req-9.1.3",
    clauseNumber: "9.1.3",
    clauseTitle: "Analysis and evaluation",
    description: "Analyze and evaluate appropriate data and information from monitoring and measurement",
    type: "generic",
  },
  
  // Clause 10 – Improvement
  {
    id: "req-10.1",
    clauseNumber: "10.1",
    clauseTitle: "General (improvement)",
    description: "Determine and select opportunities for improvement and implement necessary actions",
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

// ============================================================================
// DUPLICABLE REQUIREMENTS (Can appear in MULTIPLE processes)
// Allocated manually by user to relevant activities
// ============================================================================

const DUPLICABLE_REQUIREMENTS: Requirement[] = [
  // Clause 7 – Support (operational use)
  {
    id: "req-7.1.1",
    clauseNumber: "7.1.1",
    clauseTitle: "Resources – general",
    description: "Determine and provide the resources needed for the QMS",
    type: "duplicable",
  },
  {
    id: "req-7.1.2",
    clauseNumber: "7.1.2",
    clauseTitle: "People",
    description: "Determine and provide the persons necessary for effective QMS implementation",
    type: "duplicable",
  },
  {
    id: "req-7.1.3",
    clauseNumber: "7.1.3",
    clauseTitle: "Infrastructure",
    description: "Determine, provide and maintain the infrastructure necessary for operation of processes",
    type: "duplicable",
  },
  {
    id: "req-7.1.4",
    clauseNumber: "7.1.4",
    clauseTitle: "Environment for the operation of processes",
    description: "Determine, provide and maintain the environment necessary for operation of processes",
    type: "duplicable",
  },
  {
    id: "req-7.1.5.1",
    clauseNumber: "7.1.5.1",
    clauseTitle: "Monitoring and measuring resources – general",
    description: "Determine and provide resources needed to ensure valid monitoring and measurement results",
    type: "duplicable",
  },
  {
    id: "req-7.1.5.2",
    clauseNumber: "7.1.5.2",
    clauseTitle: "Measurement traceability",
    description: "Measuring equipment shall be calibrated or verified against traceable standards",
    type: "duplicable",
  },
  {
    id: "req-7.2",
    clauseNumber: "7.2",
    clauseTitle: "Competence",
    description: "Determine necessary competence, ensure persons are competent, and retain documented information",
    type: "duplicable",
  },
  {
    id: "req-7.3",
    clauseNumber: "7.3",
    clauseTitle: "Awareness",
    description: "Ensure relevant persons are aware of quality policy, objectives, and contribution to QMS",
    type: "duplicable",
  },
  {
    id: "req-7.4",
    clauseNumber: "7.4",
    clauseTitle: "Communication",
    description: "Determine internal and external communications relevant to the QMS",
    type: "duplicable",
  },
  
  // Clause 8 – Operation
  {
    id: "req-8.1",
    clauseNumber: "8.1",
    clauseTitle: "Operational planning and control",
    description: "Plan, implement and control processes needed to meet requirements for provision of products/services",
    type: "duplicable",
  },
  {
    id: "req-8.2.1",
    clauseNumber: "8.2.1",
    clauseTitle: "Customer communication",
    description: "Establish processes for communicating with customers about products/services",
    type: "duplicable",
  },
  {
    id: "req-8.2.2",
    clauseNumber: "8.2.2",
    clauseTitle: "Determining requirements for products and services",
    description: "Determine requirements for products and services, including applicable regulations",
    type: "duplicable",
  },
  {
    id: "req-8.2.3",
    clauseNumber: "8.2.3",
    clauseTitle: "Review of requirements for products and services",
    description: "Review requirements before commitment to supply products/services",
    type: "duplicable",
  },
  {
    id: "req-8.3.1",
    clauseNumber: "8.3.1",
    clauseTitle: "Design and development – general",
    description: "Establish, implement and maintain a design and development process when required",
    type: "duplicable",
  },
  {
    id: "req-8.3.2",
    clauseNumber: "8.3.2",
    clauseTitle: "Design and development planning",
    description: "Consider the nature, duration and complexity of design and development activities",
    type: "duplicable",
  },
  {
    id: "req-8.3.3",
    clauseNumber: "8.3.3",
    clauseTitle: "Design and development inputs",
    description: "Determine requirements essential for the specific types of products/services being designed",
    type: "duplicable",
  },
  {
    id: "req-8.3.4",
    clauseNumber: "8.3.4",
    clauseTitle: "Design and development controls",
    description: "Apply controls to the design and development process to ensure requirements are met",
    type: "duplicable",
  },
  {
    id: "req-8.3.5",
    clauseNumber: "8.3.5",
    clauseTitle: "Design and development outputs",
    description: "Ensure design and development outputs meet input requirements",
    type: "duplicable",
  },
  {
    id: "req-8.3.6",
    clauseNumber: "8.3.6",
    clauseTitle: "Design and development changes",
    description: "Identify, review and control changes made during or after design and development",
    type: "duplicable",
  },
  {
    id: "req-8.4.1",
    clauseNumber: "8.4.1",
    clauseTitle: "Control of externally provided processes, products and services – general",
    description: "Ensure externally provided processes, products and services conform to requirements",
    type: "duplicable",
  },
  {
    id: "req-8.4.2",
    clauseNumber: "8.4.2",
    clauseTitle: "Type and extent of control",
    description: "Determine the controls to be applied to externally provided processes, products and services",
    type: "duplicable",
  },
  {
    id: "req-8.4.3",
    clauseNumber: "8.4.3",
    clauseTitle: "Information for external providers",
    description: "Communicate to external providers applicable requirements",
    type: "duplicable",
  },
  {
    id: "req-8.5.1",
    clauseNumber: "8.5.1",
    clauseTitle: "Control of production and service provision",
    description: "Implement production and service provision under controlled conditions",
    type: "duplicable",
  },
  {
    id: "req-8.5.2",
    clauseNumber: "8.5.2",
    clauseTitle: "Identification and traceability",
    description: "Use suitable means to identify outputs and traceability requirements",
    type: "duplicable",
  },
  {
    id: "req-8.5.3",
    clauseNumber: "8.5.3",
    clauseTitle: "Property belonging to customers or external providers",
    description: "Exercise care with property belonging to customers or external providers",
    type: "duplicable",
  },
  {
    id: "req-8.5.4",
    clauseNumber: "8.5.4",
    clauseTitle: "Preservation",
    description: "Preserve outputs during production and service provision to ensure conformity",
    type: "duplicable",
  },
  {
    id: "req-8.5.5",
    clauseNumber: "8.5.5",
    clauseTitle: "Post-delivery activities",
    description: "Meet requirements for post-delivery activities associated with products and services",
    type: "duplicable",
  },
  {
    id: "req-8.5.6",
    clauseNumber: "8.5.6",
    clauseTitle: "Control of changes",
    description: "Review and control changes for production or service provision to ensure conformity",
    type: "duplicable",
  },
  {
    id: "req-8.6",
    clauseNumber: "8.6",
    clauseTitle: "Release of products and services",
    description: "Implement planned arrangements to verify that product/service requirements have been met",
    type: "duplicable",
  },
  {
    id: "req-8.7",
    clauseNumber: "8.7",
    clauseTitle: "Control of nonconforming outputs",
    description: "Ensure outputs not conforming to requirements are identified and controlled",
    type: "duplicable",
  },
  
  // Clause 9 (process-level evaluation)
  {
    id: "req-9.1.2",
    clauseNumber: "9.1.2",
    clauseTitle: "Customer satisfaction",
    description: "Monitor customers' perceptions of the degree to which their needs and expectations have been fulfilled",
    type: "duplicable",
  },
];

// ============================================================================
// UNIQUE REQUIREMENTS (Must be implemented ONCE and only once in the system)
// System enforces single allocation - tracked at dashboard level
// ============================================================================

const UNIQUE_REQUIREMENTS: Requirement[] = [
  // Clause 5
  {
    id: "req-5.2",
    clauseNumber: "5.2",
    clauseTitle: "Quality policy",
    description: "Establish, implement and maintain a quality policy appropriate to the organization",
    type: "unique",
  },
  {
    id: "req-5.2.1",
    clauseNumber: "5.2.1",
    clauseTitle: "Establishing the quality policy",
    description: "Top management shall establish a quality policy appropriate to the purpose and context",
    type: "unique",
  },
  {
    id: "req-5.2.2",
    clauseNumber: "5.2.2",
    clauseTitle: "Communicating the quality policy",
    description: "The quality policy shall be available, communicated, understood and applied",
    type: "unique",
  },
  
  // Clause 9
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
  
  // Clause 10
  {
    id: "req-10.2",
    clauseNumber: "10.2",
    clauseTitle: "Nonconformity and corrective action",
    description: "React to nonconformities, evaluate need for action, implement action, review effectiveness",
    type: "unique",
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

// Complete inventory of all ISO 9001:2015 requirements
export const ISO9001_REQUIREMENTS: Requirement[] = [
  ...GENERIC_REQUIREMENTS,
  ...DUPLICABLE_REQUIREMENTS,
  ...UNIQUE_REQUIREMENTS,
];

// Legacy export for backwards compatibility
export const ISO9001_GENERIC_REQUIREMENTS = ISO9001_REQUIREMENTS;

// Map requirements by clause number for easy lookup
export const REQUIREMENTS_BY_CLAUSE = ISO9001_REQUIREMENTS.reduce(
  (acc, req) => ({ ...acc, [req.clauseNumber]: req }),
  {} as Record<string, Requirement>
);

// Get requirements by type
export function getRequirementsByType(type: Requirement["type"]): Requirement[] {
  return ISO9001_REQUIREMENTS.filter(r => r.type === type);
}

// Get all generic requirements (for governance activity auto-allocation)
export function getGenericRequirements(): Requirement[] {
  return GENERIC_REQUIREMENTS;
}

// Get all duplicable requirements (for manual allocation)
export function getDuplicableRequirements(): Requirement[] {
  return DUPLICABLE_REQUIREMENTS;
}

// Get all unique requirements (single allocation system-wide)
export function getUniqueRequirements(): Requirement[] {
  return UNIQUE_REQUIREMENTS;
}

// Get available requirements for allocation (excludes already allocated)
export function getAvailableRequirements(
  allocatedIds: Set<string>,
  type?: Requirement["type"]
): Requirement[] {
  const requirements = type 
    ? getRequirementsByType(type)
    : ISO9001_REQUIREMENTS;
  
  return requirements.filter(r => !allocatedIds.has(r.id));
}
