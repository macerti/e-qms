// Management System Core Types
// ISO 9001 aligned, extensible for other standards

export type ManagementStandard = 'ISO_9001' | 'ISO_14001' | 'ISO_45001' | 'ISO_22000';

export type ProcessStatus = 'draft' | 'active' | 'archived';
export type ProcessType = 'management' | 'operational' | 'support';
// Action status flow: planned → in_progress → completed_pending_evaluation → evaluated (or cancelled at any point)
export type ActionStatus = 'planned' | 'in_progress' | 'completed_pending_evaluation' | 'evaluated' | 'cancelled';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type IssueType = 'risk' | 'opportunity';
export type ContextNature = 'internal' | 'external';
export type SwotQuadrant = 'strength' | 'weakness' | 'opportunity' | 'threat';
export type RiskTrigger = 'initial' | 'post_action_review';
export type EfficiencyResult = 'effective' | 'ineffective';

// Action origin - where the action comes from
export type ActionOrigin = 
  | 'issue'           // From a risk or opportunity Issue
  | 'internal_audit'  // From internal audit finding
  | 'external_audit'  // From external/certification audit
  | 'management_review' // Decision from management review
  | 'objective_not_met' // Objective target not achieved
  | 'other';           // Other source

// Process Activity
export interface ProcessActivity {
  id: string;
  name: string;
  description?: string;
  sequence: number;
  isSystemActivity?: boolean; // true for governance activity (cannot be deleted)
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

// Risk Version - append-only history for risk evaluations
export interface RiskVersion {
  id: string;
  versionNumber: number;
  date: string;
  trigger: RiskTrigger; // 'initial' or 'post_action_review'
  description: string; // Current description at time of evaluation
  severity: number; // 1-3
  probability: number; // 1-3
  criticity: number; // severity × probability (1-9)
  priority: RiskPriority; // Derived from criticity
  evaluatorName?: string;
  notes?: string;
}

// Context Issue (Risk or Opportunity from SWOT analysis)
// Issues are persistent contextual objects - they evolve, never reset
export interface ContextIssue extends BaseEntity, Versionable {
  code: string; // Format: RISK/YY/XXX or OPP/YY/XXX (editable by user)
  type: IssueType;
  quadrant: SwotQuadrant;
  description: string; // Current description (can evolve with residual risk)
  contextNature: ContextNature; // Internal or External (explicit, not derived from SWOT)
  processId: string;
  
  // Risk evaluation - append-only versioned history (applies to Weakness and Threat only)
  // The latest version defines the current state
  riskVersions: RiskVersion[];
  
  // Legacy fields for backwards compatibility - derived from latest risk version
  severity?: number; // 1-3 (from latest risk version)
  probability?: number; // 1-3 (from latest risk version)
  criticity?: number; // Calculated: severity × probability (1-9 range)
  priority?: RiskPriority; // Derived from criticity: 1-3=03, 4-6=02, 7-9=01
}

// Efficiency Evaluation for an Action
export interface EfficiencyEvaluation {
  id: string;
  date: string;
  result: EfficiencyResult; // 'effective' or 'ineffective'
  evidence?: string; // File path, link, or description
  evidenceType?: 'file' | 'link' | 'note';
  evaluatorName?: string;
  notes?: string;
}

// Action (Corrective/Improvement) - Universal improvement object
// All actions share the same structure regardless of origin
export interface Action extends BaseEntity, Versionable {
  code: string; // e.g., "ACT-001"
  title: string;
  description: string;
  origin: ActionOrigin; // Where this action comes from
  linkedIssueIds: string[]; // Issue IDs this action addresses (can be multiple or empty)
  processId: string;
  deadline: string;
  responsibleId?: string;
  responsibleName?: string;
  status: ActionStatus;
  
  // Status history - append-only for audit trail
  statusHistory: ActionStatusChange[];
  
  // Completion tracking
  completedDate?: string;
  
  // Efficiency evaluation - only available after status = completed_pending_evaluation
  // One efficiency evaluation per action (immutable once saved)
  efficiencyEvaluation?: EfficiencyEvaluation;
}

// Status change record for action history
export interface ActionStatusChange {
  id: string;
  date: string;
  fromStatus: ActionStatus | null; // null for initial status
  toStatus: ActionStatus;
  changedBy?: string;
  notes?: string;
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

// Helper type for implemented controls display
export interface ImplementedControl {
  actionId: string;
  actionCode: string;
  actionTitle: string;
  completedDate: string;
  efficiencyResult?: EfficiencyResult;
}
