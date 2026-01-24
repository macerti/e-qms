// ISO Standard Function Types
// Functions are standard-mandated capabilities - immutable, preconfigured

import { ProcessType, ManagementStandard } from "./management-system";

// Duplication rules for functions
export type FunctionDuplicationRule = 'unique' | 'per_process';

// Function status
export type FunctionStatus = 'active' | 'future';

// Function Instance implementation status (extended for compliance)
export type FunctionInstanceStatus = 
  | 'not_implemented'
  | 'implemented'
  | 'partially_implemented'
  | 'nonconformity'
  | 'improvement_opportunity';

// Eligible process types for a function
export type EligibleProcessType = ProcessType | 'leadership' | 'support' | 'operational';

// Global Function definition (immutable, system-defined)
export interface StandardFunction {
  id: string;
  name: string;
  linkedStandards: ManagementStandard[];
  clauseReferences: string[]; // e.g., ["4.1", "4.2"]
  description: string;
  duplicationRule: FunctionDuplicationRule;
  eligibleProcessTypes: EligibleProcessType[];
  mandatory: boolean;
  status: FunctionStatus;
  category: 'context' | 'leadership' | 'support' | 'operation' | 'performance' | 'improvement';
}

// Function Instance - created when a function is attached to a process
export interface FunctionInstance {
  id: string;
  functionId: string; // Reference to StandardFunction (immutable)
  processId: string; // Reference to Process
  status: FunctionInstanceStatus;
  createdAt: string;
  updatedAt: string;
  
  // Function-specific data storage (flexible JSON-like structure)
  data: FunctionInstanceData;
  
  // Linked Actions (action IDs)
  linkedActionIds: string[];
  
  // Linked Objectives (objective IDs)
  linkedObjectiveIds: string[];
  
  // Linked KPIs (kpi IDs)
  linkedKPIIds: string[];
  
  // Evidence records
  evidence: FunctionEvidence[];
  
  // Append-only history
  history: FunctionHistoryEntry[];
}

// Flexible data container for function-specific fields
export interface FunctionInstanceData {
  // Common fields
  notes?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  responsibleName?: string;
  
  // Quality Policy specific (for Policy Management function)
  policyContent?: string;
  policyAxes?: PolicyAxis[];
  policyApprovedBy?: string;
  policyApprovalDate?: string;
  policyEffectiveDate?: string;
  
  // Function-specific fields stored as key-value
  [key: string]: unknown;
}

// Policy Axis for Quality Policy Management
export interface PolicyAxis {
  id: string;
  name: string;
  description: string;
  linkedObjectiveIds: string[];
  linkedProcessIds: string[];
  createdAt: string;
}

// Evidence record for function instance
export interface FunctionEvidence {
  id: string;
  type: 'file' | 'link' | 'note';
  title: string;
  description?: string;
  reference?: string; // URL or file path
  fileName?: string; // Original file name for uploads
  fileSize?: number; // File size in bytes
  mimeType?: string; // MIME type for files
  addedAt: string;
  addedBy?: string;
}

// History entry for audit trail
export interface FunctionHistoryEntry {
  id: string;
  date: string;
  action: 
    | 'created' 
    | 'updated' 
    | 'status_changed' 
    | 'evidence_added' 
    | 'evidence_removed'
    | 'action_linked'
    | 'action_unlinked'
    | 'objective_linked'
    | 'objective_unlinked'
    | 'kpi_linked'
    | 'kpi_unlinked'
    | 'policy_updated';
  description: string;
  changedBy?: string;
  previousValue?: string;
  newValue?: string;
}

// Compliance calculation result
export interface ComplianceMetrics {
  totalFunctions: number;
  implementedCount: number;
  partiallyImplementedCount: number;
  notImplementedCount: number;
  nonconformityCount: number;
  improvementOpportunityCount: number;
  compliancePercentage: number;
}

// Compliance by category
export interface CategoryCompliance {
  category: StandardFunction['category'];
  categoryLabel: string;
  metrics: ComplianceMetrics;
}

// Compliance by clause
export interface ClauseCompliance {
  clause: string;
  clauseLabel: string;
  metrics: ComplianceMetrics;
}

// Status labels for display
export const FUNCTION_STATUS_LABELS: Record<FunctionInstanceStatus, string> = {
  not_implemented: 'Not Implemented',
  implemented: 'Implemented',
  partially_implemented: 'Partially Implemented',
  nonconformity: 'Nonconformity',
  improvement_opportunity: 'Improvement Opportunity',
};

// Status colors for display
export const FUNCTION_STATUS_COLORS: Record<FunctionInstanceStatus, string> = {
  not_implemented: 'text-muted-foreground bg-muted',
  implemented: 'text-success bg-success/10',
  partially_implemented: 'text-warning bg-warning/10',
  nonconformity: 'text-destructive bg-destructive/10',
  improvement_opportunity: 'text-kpi bg-kpi/10',
};
