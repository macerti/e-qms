// ISO 9001 Requirements Types
// Requirements are preloaded and allocated by system rules, not user-created

export type RequirementType = 'generic' | 'unique' | 'duplicable';

export type AllocationState = 'allocated' | 'not_allocated';

export type FulfillmentState = 'satisfied' | 'not_yet_satisfied';

export interface Requirement {
  id: string;
  clauseNumber: string; // e.g., "6.1"
  clauseTitle: string; // e.g., "Actions to address risks and opportunities"
  description: string;
  type: RequirementType;
  // Allocation is per-process, tracked separately
}

export interface RequirementAllocation {
  requirementId: string;
  processId: string;
  activityId: string;
  allocatedAt: string;
  isSystemAllocated: boolean; // true for generic requirements auto-allocated
}

// Fulfillment inference result (read-only, derived from existing data)
export interface RequirementFulfillment {
  requirementId: string;
  processId: string;
  state: FulfillmentState;
  inferredFrom: RequirementInferenceSource[];
}

export type RequirementInferenceSource = 
  | { type: 'issue_linked'; issueId: string }
  | { type: 'action_linked'; actionId: string }
  | { type: 'kpi_linked'; kpiId: string }
  | { type: 'objective_linked'; objectiveId: string }
  | { type: 'document_linked'; documentId: string };

// Governance activity constant
export const GOVERNANCE_ACTIVITY_NAME = "Management System Governance";
export const GOVERNANCE_ACTIVITY_ID_PREFIX = "gov-";
