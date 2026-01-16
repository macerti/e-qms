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

// Applicable Regulation (per process)
export interface ApplicableRegulation {
  id: string;
  reference: string; // e.g., "Regulation (EU) 2016/679"
  name: string; // e.g., "GDPR - General Data Protection Regulation"
  description?: string;
  complianceDisposition?: string; // How the organization addresses this requirement
}

// Document Type
export type DocumentType = 'procedure' | 'form' | 'instruction' | 'record' | 'policy';

// ISO 9001 Clause Reference
export interface ISOClauseReference {
  clauseNumber: string; // e.g., "7.5.1"
  clauseTitle: string; // e.g., "Documented Information - General"
}

// Document (Procedure, Form, etc.)
export interface Document extends BaseEntity, Versionable {
  code: string; // e.g., "DOC-001"
  title: string;
  type: DocumentType;
  description?: string;
  processIds: string[]; // Processes this document applies to
  isoClauseReferences: ISOClauseReference[]; // ISO 9001 requirements satisfied
  standard: ManagementStandard;
  status: 'draft' | 'active' | 'archived';
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
  regulations: ApplicableRegulation[]; // Applicable legal/regulatory requirements
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
  documentIds: string[]; // Utilized documentation
}

// Risk Priority (calculated from criticity)
export type RiskPriority = '01' | '02' | '03';

// Context Issue (Risk or Opportunity from SWOT analysis)
export interface ContextIssue extends BaseEntity, Versionable {
  code: string; // e.g., "ISS-001"
  type: IssueType;
  quadrant: SwotQuadrant;
  description: string;
  origin: IssueOrigin;
  processId: string;
  // Risk evaluation (applies to Weakness and Threat only)
  // Uses 3×3 scale: Severity (1-3), Probability (1-3)
  severity?: number; // 1-3 (Minor, Significant, Major)
  probability?: number; // 1-3 (Unlikely, Possible, Likely)
  criticity?: number; // Calculated: severity × probability (1-9 range)
  priority?: RiskPriority; // Derived from criticity: 1-3=03, 4-6=02, 7-9=01
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
