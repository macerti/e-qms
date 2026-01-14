import { BaseEntity, Versionable } from "./management-system";

// Quality Policy - stored per organization
export interface QualityPolicyData extends BaseEntity, Versionable {
  content: string;
  commitments: string[];
  approvedBy?: string;
  approvalDate?: string;
  effectiveDate: string;
  status: 'draft' | 'active';
}

// Management Review
export interface ManagementReviewData extends BaseEntity, Versionable {
  code: string;
  date: string;
  attendees: string[];
  agenda: ManagementReviewAgendaItem[];
  inputs: ManagementReviewInput[];
  outputs: ManagementReviewOutput[];
  decisions: ManagementReviewDecision[];
  nextReviewDate?: string;
  status: 'planned' | 'completed';
}

export interface ManagementReviewAgendaItem {
  id: string;
  topic: string;
  presenter?: string;
}

export interface ManagementReviewInput {
  id: string;
  category: ManagementReviewInputCategory;
  description: string;
}

export type ManagementReviewInputCategory = 
  | 'previous_actions'
  | 'changes_context'
  | 'customer_feedback'
  | 'process_performance'
  | 'nonconformities'
  | 'audit_results'
  | 'supplier_performance'
  | 'resource_adequacy'
  | 'improvement_opportunities'
  | 'other';

export interface ManagementReviewOutput {
  id: string;
  category: ManagementReviewOutputCategory;
  description: string;
}

export type ManagementReviewOutputCategory =
  | 'improvement_opportunities'
  | 'qms_changes'
  | 'resource_needs';

export interface ManagementReviewDecision {
  id: string;
  description: string;
  responsibleName?: string;
  deadline?: string;
  actionId?: string; // Linked action if created
}
