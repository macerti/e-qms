// Management System Core Types
// ISO 9001 aligned, extensible for other standards

export type ManagementStandard = 'ISO_9001' | 'ISO_14001' | 'ISO_45001' | 'ISO_22000';

export type ProcessStatus = 'draft' | 'active' | 'archived';
export type ProcessType = 'management' | 'operational' | 'support';
export type ActionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type IssueType = 'risk' | 'opportunity';
export type IssueOrigin = 'internal' | 'external';
export type SwotQuadrant = 'strength' | 'weakness' | 'opportunity' | 'threat';

// Process Activity
export interface ProcessActivity {
  id: string;
  name: string;
  description?: string;
  sequence: number;
}

// Versioning interface - all major entities must implement this
export interface Versionable {
  version: number;
  revisionDate: string;
  revisionNote?: string;
}

// Base entity with audit trail
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Process (Fiche Processus) - Core backbone entity
export interface Process extends BaseEntity, Versionable {
  code: string; // e.g., "PRO-001"
  name: string;
  type: ProcessType; // Management, Operational, or Support
  purpose: string;
  inputs: string[];
  outputs: string[];
  activities: ProcessActivity[]; // Ordered list of process activities
  pilotId?: string; // Owner/pilot user ID
  pilotName?: string;
  status: ProcessStatus;
  standard: ManagementStandard;
  // Linked entities - stored as IDs for normalization
  indicatorIds: string[];
  riskIds: string[];
  opportunityIds: string[];
  actionIds: string[];
  auditIds: string[];
}

// Context Issue (Risk or Opportunity from SWOT analysis)
export interface ContextIssue extends BaseEntity, Versionable {
  type: IssueType;
  quadrant: SwotQuadrant;
  description: string;
  origin: IssueOrigin;
  processId: string;
  // Risk evaluation (applies to risks)
  severity?: number; // 1-5
  probability?: number; // 1-5
  criticality?: number; // Calculated: severity * probability
  priorityRank?: number;
  // Post-action evaluation
  residualRisk?: number;
  effectivenessRating?: number;
}

// Action (Corrective/Improvement)
export interface Action extends BaseEntity, Versionable {
  code: string; // e.g., "ACT-001"
  title: string;
  description: string;
  sourceType: 'risk' | 'opportunity' | 'internal_audit' | 'external_audit' | 'management_review';
  sourceId: string;
  processId: string;
  deadline: string;
  responsibleId?: string;
  responsibleName?: string;
  status: ActionStatus;
  impact?: string;
  effectivenessAssessment?: string;
}

// KPI/Indicator
export interface Indicator extends BaseEntity, Versionable {
  code: string;
  name: string;
  definition: string;
  formula?: string;
  measurementFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  dataSource: string;
  targetValue: number;
  unit: string;
  responsibleId?: string;
  responsibleName?: string;
  processId: string;
  objectiveId?: string;
}

// Indicator Measurement
export interface IndicatorMeasurement extends BaseEntity {
  indicatorId: string;
  period: string; // ISO date or period identifier
  value: number;
  status: 'achieved' | 'not_achieved' | 'at_risk';
  notes?: string;
}

// Policy Axis
export interface PolicyAxis extends BaseEntity, Versionable {
  code: string;
  name: string;
  description: string;
  processIds: string[];
}

// Objective
export interface Objective extends BaseEntity, Versionable {
  code: string;
  description: string;
  policyAxisId: string;
  processIds: string[];
  targetValue?: number;
  unit?: string;
  timeHorizon: string; // Target date
  indicatorIds: string[];
}

// Audit
export interface Audit extends BaseEntity, Versionable {
  code: string;
  type: 'internal' | 'external';
  processId: string;
  plannedDate: string;
  executedDate?: string;
  auditorName?: string;
  status: 'planned' | 'in_progress' | 'completed';
  findings: AuditFinding[];
}

export interface AuditFinding extends BaseEntity {
  auditId: string;
  type: 'nonconformity' | 'observation' | 'opportunity';
  clauseReference?: string;
  description: string;
  actionId?: string; // Linked corrective action
}

// Management Review
export interface ManagementReview extends BaseEntity, Versionable {
  code: string;
  date: string;
  attendees: string[];
  agenda: string[];
  decisions: ManagementReviewDecision[];
  nextReviewDate?: string;
}

export interface ManagementReviewDecision extends BaseEntity {
  reviewId: string;
  description: string;
  actionId?: string; // Auto-generated action
}

// Quality Policy
export interface QualityPolicy extends BaseEntity, Versionable {
  content: string;
  approvedBy?: string;
  approvalDate?: string;
  effectiveDate: string;
}

// Module navigation types
export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  isActive: boolean;
  plannedFeatureMessage?: string;
}
