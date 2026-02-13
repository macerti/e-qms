export type {
  Action,
  ActionOrigin,
  ActionStatus,
  ContextIssue,
  ContextNature,
  Document,
  DocumentType,
  ISOClauseReference,
  IssueType,
  Process,
  ProcessActivity,
  ProcessStatus,
  ProcessType,
  RevisionEntry,
  RiskLevel,
  SwotQuadrant,
} from "@/domains/core/models";

export type { Requirement, RequirementFulfillment } from "@/domains/requirement/models";
export { GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/domains/requirement/models";

export type { KPIValueRecord, KPIFrequency, ProcessKPI, ProcessObjective } from "@/domains/objectives/models";
