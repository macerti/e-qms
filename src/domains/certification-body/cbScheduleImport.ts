/**
 * Audit programme → Scheduling import helpers (pure logic, no React).
 * Maps a programme's planned audits onto pre-filled allocation rows and
 * surfaces conflicts / competence gaps before commit.
 */

import { rangesOverlap } from "./cbFinance";

export type AllocationRole = "lead_auditor" | "auditor" | "technical_expert" | "observer";

export interface ImportRow {
  /** Stable client-side id used for React keys. */
  rowId: string;
  auditId: string;
  auditLabel: string;        // e.g. "Stage 2 — Acme · 2026-05-04 → 05-06"
  selected: boolean;
  /** Allocation payload (mirrors cbStore.allocations shape). */
  auditorId?: string;
  client: string;
  role: AllocationRole;
  startDate?: string;
  endDate?: string;
  mandays?: number;
  costRate?: number;
}

export interface RowWarnings {
  conflict?: { client?: string; startDate?: string; endDate?: string };
  competenceMissing?: boolean;
  invalid?: string;          // missing required field
}

export interface AuditorLite {
  id: string;
  fullName?: string;
  standards?: string[];
}
export interface ProgramLite {
  id: string;
  client?: string;
  standardId?: string;
  auditorCostRate?: number;
}
export interface AuditLite {
  id: string;
  programId?: string;
  client?: string;
  auditType?: string;
  plannedStart?: string;
  plannedEnd?: string;
  durationDays?: number;
  leadAuditor?: string;
}
export interface AllocationLite {
  id: string;
  auditorId?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
}

/** Filter the audits that belong to a programme (by programId, fallback by client). */
export function audtisForProgram(program: ProgramLite, audits: AuditLite[]): AuditLite[] {
  return audits.filter(
    (a) =>
      (a.programId && a.programId === program.id) ||
      (!a.programId && program.client && a.client === program.client),
  );
}

const AUDIT_TYPE_LABEL: Record<string, string> = {
  stage1: "Stage 1",
  stage2: "Stage 2",
  surveillance: "Surveillance",
  recertification: "Recertification",
  special: "Special",
  transfer: "Transfer",
};

function fmtAuditLabel(a: AuditLite): string {
  const type = AUDIT_TYPE_LABEL[a.auditType ?? ""] ?? a.auditType ?? "Audit";
  const dates = a.plannedStart
    ? ` · ${a.plannedStart}${a.plannedEnd && a.plannedEnd !== a.plannedStart ? ` → ${a.plannedEnd}` : ""}`
    : "";
  return `${type} — ${a.client ?? "—"}${dates}`;
}

/** Best-effort match an auditor by name against `audit.leadAuditor`. */
function matchLeadAuditor(audit: AuditLite, auditors: AuditorLite[]): string | undefined {
  if (!audit.leadAuditor) return undefined;
  const target = audit.leadAuditor.trim().toLowerCase();
  return auditors.find((a) => (a.fullName ?? "").trim().toLowerCase() === target)?.id;
}

export function buildImportRows(
  program: ProgramLite,
  audits: AuditLite[],
  auditors: AuditorLite[],
): ImportRow[] {
  const programAudits = audtisForProgram(program, audits);
  return programAudits.map((a) => {
    const auditorId = matchLeadAuditor(a, auditors);
    return {
      rowId: `imp_${a.id}`,
      auditId: a.id,
      auditLabel: fmtAuditLabel(a),
      selected: true,
      auditorId,
      client: a.client ?? program.client ?? "",
      role: auditorId ? "lead_auditor" : "auditor",
      startDate: a.plannedStart,
      endDate: a.plannedEnd ?? a.plannedStart,
      mandays: a.durationDays,
      costRate: program.auditorCostRate,
    };
  });
}

export function validateRow(
  row: ImportRow,
  program: ProgramLite,
  auditors: AuditorLite[],
  existingAllocations: AllocationLite[],
): RowWarnings {
  const w: RowWarnings = {};

  if (!row.auditorId) {
    w.invalid = "Auditor required";
  } else if (!row.startDate || !row.endDate) {
    w.invalid = "Dates required";
  }

  // Conflict: same auditor, overlapping range with an existing allocation.
  if (row.auditorId && row.startDate) {
    const clash = existingAllocations.find(
      (x) =>
        x.auditorId === row.auditorId &&
        rangesOverlap(row.startDate, row.endDate, x.startDate, x.endDate),
    );
    if (clash) {
      w.conflict = { client: clash.client, startDate: clash.startDate, endDate: clash.endDate };
    }
  }

  // Competence: auditor.standards must include programme.standardId (when both known).
  if (row.auditorId && program.standardId) {
    const auditor = auditors.find((a) => a.id === row.auditorId);
    if (auditor && Array.isArray(auditor.standards) && auditor.standards.length > 0) {
      if (!auditor.standards.includes(program.standardId)) {
        w.competenceMissing = true;
      }
    }
  }

  return w;
}

export function summarizeRows(
  rows: ImportRow[],
  program: ProgramLite,
  auditors: AuditorLite[],
  existingAllocations: AllocationLite[],
  skipWarnings: boolean,
) {
  let willCreate = 0;
  let conflicts = 0;
  let competenceGaps = 0;
  let invalid = 0;

  for (const r of rows) {
    if (!r.selected) continue;
    const w = validateRow(r, program, auditors, existingAllocations);
    if (w.invalid) {
      invalid++;
      continue;
    }
    if (w.conflict) conflicts++;
    if (w.competenceMissing) competenceGaps++;
    if (skipWarnings && (w.conflict || w.competenceMissing)) continue;
    willCreate++;
  }

  return { willCreate, conflicts, competenceGaps, invalid };
}
