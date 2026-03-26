/**
 * ISO/IEC 17021-1 — Certification Body Domain Models
 * Conformity assessment — Requirements for bodies providing audit and certification of management systems
 *
 * These entities are CB-specific and DO NOT touch existing QMS entities.
 * All prefixed conceptually with "CB" to maintain separation.
 */

// ─── Enums & Status Types ───────────────────────────────────────────

export type CertificationStatus = "active" | "suspended" | "withdrawn" | "expired";
export type ApplicationStatus = "received" | "under_review" | "accepted" | "rejected";
export type AuditType_CB = "stage1" | "stage2" | "surveillance" | "recertification" | "special" | "transfer";
export type AuditStage = "planned" | "in_progress" | "completed" | "cancelled";
export type DecisionOutcome = "grant" | "maintain" | "renew" | "suspend" | "withdraw" | "refuse";
export type NCGrade = "major" | "minor" | "observation";
export type NCStatus_CB = "open" | "correction_submitted" | "verified_closed" | "escalated";
export type ImpartialityThreatType = "self_interest" | "self_review" | "familiarity" | "intimidation" | "advocacy";
export type RiskLevel_CB = "low" | "medium" | "high" | "unacceptable";
export type CompetenceStatus = "qualified" | "in_training" | "provisionally_qualified" | "suspended" | "withdrawn";
export type ComplaintStatus_CB = "received" | "under_investigation" | "resolved" | "closed";
export type AppealStatus = "filed" | "panel_review" | "decision_made" | "closed";

// ─── Base ──────────────────────────────────────────────────────────

export interface CBBaseEntity {
  id: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Client & Scope ────────────────────────────────────────────────

export interface CertificationClient extends CBBaseEntity {
  name: string;
  legalEntity?: string;
  address?: string;
  country?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  sector?: string; // IAF code
  employeeCount?: number;
  multiSite?: boolean;
  sites?: CertificationSite[];
  applicationStatus: ApplicationStatus;
  notes?: string;
}

export interface CertificationSite extends CBBaseEntity {
  clientId: string;
  name: string;
  address: string;
  employeeCount?: number;
  isCentral?: boolean;
}

export interface CertificationScope extends CBBaseEntity {
  clientId: string;
  standardId: string; // e.g. "iso9001", "iso14001", "iso45001"
  schemeExtension?: string; // e.g. "17021-3" for QMS
  iafCodes: string[];
  scopeStatement: string;
  exclusions?: string;
}

// ─── Certification & Certificates ──────────────────────────────────

export interface Certificate extends CBBaseEntity {
  clientId: string;
  scopeId: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string; // 3-year cycle
  status: CertificationStatus;
  suspensionDate?: string;
  suspensionReason?: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  lastSurveillanceDate?: string;
  nextSurveillanceDate?: string;
}

// ─── Audit Program & Planning ──────────────────────────────────────

export interface AuditProgram_CB extends CBBaseEntity {
  clientId: string;
  scopeId: string;
  cycleStartDate: string;
  cycleEndDate: string; // typically 3 years
  audits: AuditPlan_CB[];
}

export interface AuditPlan_CB extends CBBaseEntity {
  programId: string;
  clientId: string;
  auditType: AuditType_CB;
  stage: AuditStage;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  leadAuditorId: string;
  teamMemberIds: string[];
  technicalExpertIds?: string[];
  auditDurationDays: number;
  objectives?: string;
  scope?: string;
  criteria?: string;
}

export interface AuditReport_CB extends CBBaseEntity {
  auditPlanId: string;
  clientId: string;
  summary: string;
  conclusion: string;
  nonconformities: Nonconformity_CB[];
  recommendations?: string;
  auditorSignoff?: string;
  signoffDate?: string;
}

// ─── Nonconformities ───────────────────────────────────────────────

export interface Nonconformity_CB extends CBBaseEntity {
  auditReportId: string;
  clientId: string;
  clauseReference: string;
  description: string;
  objectiveEvidence: string;
  grade: NCGrade;
  status: NCStatus_CB;
  rootCauseAnalysis?: string;
  correction?: string;
  correctionDeadline?: string;
  correctionSubmittedDate?: string;
  verificationDate?: string;
  verifiedBy?: string;
}

// ─── Certification Decision (Independent) ──────────────────────────

export interface CertificationDecision extends CBBaseEntity {
  auditReportId: string;
  clientId: string;
  decisionMakerId: string; // MUST differ from audit team
  technicalReviewerId?: string; // MUST differ from audit team
  technicalReviewSummary?: string;
  outcome: DecisionOutcome;
  justification: string;
  conditions?: string;
  decisionDate: string;
  certificateId?: string;
}

// ─── Auditor & Competence ──────────────────────────────────────────

export interface Auditor extends CBBaseEntity {
  fullName: string;
  email?: string;
  employeeId?: string;
  status: CompetenceStatus;
  competences: CompetenceRecord[];
  witnessAudits: WitnessAuditRecord[];
  conflictDeclarations: ConflictDeclaration[];
}

export interface CompetenceRecord extends CBBaseEntity {
  auditorId: string;
  standardId: string; // which standard they're qualified for
  iafCodes: string[]; // which sectors
  auditRole: "lead_auditor" | "auditor" | "technical_expert";
  qualificationDate: string;
  expiryDate?: string;
  evidenceReference?: string;
}

export interface WitnessAuditRecord extends CBBaseEntity {
  auditorId: string;
  auditPlanId: string;
  witnessDate: string;
  evaluatorId: string;
  result: "satisfactory" | "needs_improvement" | "unsatisfactory";
  notes?: string;
}

// ─── Impartiality ──────────────────────────────────────────────────

export interface ImpartialityRisk extends CBBaseEntity {
  threatType: ImpartialityThreatType;
  description: string;
  relatedClientId?: string;
  relatedAuditorId?: string;
  riskLevel: RiskLevel_CB;
  safeguard?: string;
  mitigated: boolean;
  identifiedDate: string;
  reviewDate?: string;
  reviewedBy?: string;
}

export interface ConflictDeclaration extends CBBaseEntity {
  auditorId: string;
  clientId?: string;
  declarationType: "no_conflict" | "potential_conflict" | "conflict";
  description?: string;
  declarationDate: string;
  validUntil?: string;
}

// ─── Complaints & Appeals ──────────────────────────────────────────

export interface Complaint_CB extends CBBaseEntity {
  clientId?: string;
  complainant: string;
  description: string;
  receivedDate: string;
  status: ComplaintStatus_CB;
  investigationSummary?: string;
  resolution?: string;
  resolvedDate?: string;
  assignedTo?: string;
}

export interface Appeal_CB extends CBBaseEntity {
  clientId: string;
  relatedDecisionId?: string;
  description: string;
  filedDate: string;
  status: AppealStatus;
  panelMembers?: string[];
  panelDecision?: string;
  panelDecisionDate?: string;
  resolution?: string;
}

// ─── Certification Lifecycle State Machine ─────────────────────────

export const CERTIFICATION_LIFECYCLE_STAGES = [
  "application_received",
  "application_review",
  "audit_program_created",
  "stage1_audit",
  "stage2_audit",
  "nc_closure",
  "technical_review",
  "certification_decision",
  "certificate_issuance",
  "surveillance_1",
  "surveillance_2",
  "recertification",
] as const;

export type CertificationLifecycleStage = typeof CERTIFICATION_LIFECYCLE_STAGES[number];

// ─── Scheme Extensions ─────────────────────────────────────────────

export interface SchemeExtension {
  id: string;
  baseStandardId: string;
  schemeStandardCode: string;
  schemeStandardName: string;
  competenceRequirements: string[];
  auditDurationRules?: string;
  technicalAreas: string[];
}

export const CB_SCHEME_EXTENSIONS: SchemeExtension[] = [
  {
    id: "ext-qms",
    baseStandardId: "iso9001",
    schemeStandardCode: "ISO/IEC 17021-3",
    schemeStandardName: "Competence requirements for auditing and certification of QMS",
    competenceRequirements: ["Quality management principles", "Process approach", "Risk-based thinking", "Customer focus"],
    technicalAreas: ["Manufacturing", "Service", "Construction", "IT"],
  },
  {
    id: "ext-ems",
    baseStandardId: "iso14001",
    schemeStandardCode: "ISO/IEC 17021-2",
    schemeStandardName: "Competence requirements for auditing and certification of EMS",
    competenceRequirements: ["Environmental legislation", "Environmental aspects/impacts", "Life cycle perspective", "Pollution prevention"],
    technicalAreas: ["Emissions", "Waste", "Water", "Energy"],
  },
  {
    id: "ext-ohsms",
    baseStandardId: "iso45001",
    schemeStandardCode: "ISO/IEC 17021-10",
    schemeStandardName: "Competence requirements for auditing and certification of OHSMS",
    competenceRequirements: ["OH&S hazard identification", "Risk assessment", "Legal requirements", "Worker consultation"],
    technicalAreas: ["Construction safety", "Chemical hazards", "Ergonomics", "Machine safety"],
  },
];
