/**
 * ISO/IEC 17021-1 certification lifecycle helpers.
 * Lightweight state machine used by UI to disable forbidden transitions.
 */

import type { CertificationLifecycleStage } from "./models";

export const LIFECYCLE_ORDER: CertificationLifecycleStage[] = [
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
];

export const LIFECYCLE_LABELS: Record<CertificationLifecycleStage, string> = {
  application_received: "Application received",
  application_review: "Application review",
  audit_program_created: "Audit programme",
  stage1_audit: "Stage 1 audit",
  stage2_audit: "Stage 2 audit",
  nc_closure: "NC closure",
  technical_review: "Technical review",
  certification_decision: "Certification decision",
  certificate_issuance: "Certificate issuance",
  surveillance_1: "Surveillance 1",
  surveillance_2: "Surveillance 2",
  recertification: "Recertification",
};

export const LIFECYCLE_CLAUSE: Record<CertificationLifecycleStage, string> = {
  application_received: "9.1.2",
  application_review: "9.1.3",
  audit_program_created: "9.1.4",
  stage1_audit: "9.3",
  stage2_audit: "9.3",
  nc_closure: "9.4",
  technical_review: "9.5",
  certification_decision: "9.5",
  certificate_issuance: "8.2",
  surveillance_1: "9.6.2",
  surveillance_2: "9.6.2",
  recertification: "9.6.3",
};

export function nextStage(current: CertificationLifecycleStage): CertificationLifecycleStage | null {
  const idx = LIFECYCLE_ORDER.indexOf(current);
  if (idx < 0 || idx >= LIFECYCLE_ORDER.length - 1) return null;
  return LIFECYCLE_ORDER[idx + 1];
}

export function canTransition(from: CertificationLifecycleStage, to: CertificationLifecycleStage): boolean {
  return LIFECYCLE_ORDER.indexOf(to) === LIFECYCLE_ORDER.indexOf(from) + 1;
}

/**
 * Validate that a Stage 2 audit cannot start before Stage 1 is completed.
 * Returns null if valid, otherwise a violation message.
 */
export function validateStage2Prereq(stage1Completed: boolean): string | null {
  if (!stage1Completed) return "ISO/IEC 17021-1 §9.3 — Stage 2 cannot start before Stage 1 is completed.";
  return null;
}

/**
 * Validate independence of certification decision (decision-maker ≠ audit team).
 */
export function validateDecisionIndependence(decisionMakerId: string, auditTeamIds: string[]): string | null {
  if (auditTeamIds.includes(decisionMakerId)) {
    return "ISO/IEC 17021-1 §9.5 — Decision maker must not have participated in the audit.";
  }
  return null;
}
