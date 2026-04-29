
## Goal

Let the user pick an audit programme and bulk-create scheduling allocations from all (or selected) audits in that programme — with a per-row mapping table where dates and auditors are pre-filled and editable, and conflicts / competence gaps are flagged before commit.

## Where it lives

- New entry point in **CB → Scheduling → Allocations tab**: a secondary button "Import from programme" next to the existing "New allocation" CTA.
- New component: `src/pages/certification-body/modules/scheduling/ImportFromProgrammeDrawer.tsx` (right-side `CBRecordDrawer`-styled wide sheet so it works on mobile and desktop).
- Pure logic helper: `src/domains/certification-body/cbScheduleImport.ts` (mapping + validation, no React).

## Data sources used (already in `cbStore`)

- `programs` — to pick a programme (client, standard, manday rate, currency, auditor cost rate).
- `audits` — filtered by `audits.programId === selectedProgramId` (fallback: `audits.client === program.client` when `programId` is missing on legacy rows).
- `auditors` — for the auditor dropdown per row + competence check (`auditor.standards`, `auditor.sectors`).
- `allocations` — for conflict pre-flight against existing allocations.

No new persisted fields are required, but we will start writing `programId` on newly created allocations so they can be traced back to the source programme.

## Wizard flow (single drawer, 3 stacked sections)

```text
┌──────────────────────────────────────────────────────────────┐
│ 1. Source programme   [ Select programme ▾ ]  client · stand │
│                                                              │
│ 2. Audits in scope                                           │
│    ☑ All  ┌──────────────────────────────────────────────┐   │
│           │ ☑ Stage 2 · 2026-05-04 → 05-06 · 3d · TBD   │   │
│           │ ☑ Surv 1 · 2026-11-09 → 11-10 · 2d · TBD    │   │
│           │ ☐ Surv 2 · 2027-05 ...                       │   │
│           └──────────────────────────────────────────────┘   │
│                                                              │
│ 3. Allocation mapping  (editable rows, one per audit)        │
│   ┌───────────┬──────────┬──────────┬───────┬──────┬─────┐   │
│   │ Audit     │ Auditor  │ Role     │ Start │ End  │ Days│   │
│   ├───────────┼──────────┼──────────┼───────┼──────┼─────┤   │
│   │ Stage 2   │ [▾ J.D.] │ [▾ Lead] │ 05-04 │05-06 │ 3   │   │
│   │ ⚠ Conflict with “Acme · 05-05→05-07”                   │
│   │ Surv 1    │ [▾ —   ] │ [▾ Aud ] │ 11-09 │11-10 │ 2   │   │
│   │ ⚠ Competence: not qualified for ISO 14001               │
│   └───────────┴──────────┴──────────┴───────┴──────┴─────┘   │
│                                                              │
│ Summary: 2 will be created · 1 conflict · 1 competence gap   │
│                  [ Cancel ]   [ Import 2 allocations ]       │
└──────────────────────────────────────────────────────────────┘
```

Behaviour:

- Selecting a programme auto-checks all its audits and pre-fills one mapping row per audit:
  - `auditId`, `client` (from audit), `startDate` = `audit.plannedStart`, `endDate` = `audit.plannedEnd ?? plannedStart`, `mandays` = `audit.durationDays`, `costRate` = `program.auditorCostRate`, `role` = `"lead_auditor"` if the row's auditor matches `audit.leadAuditor`, otherwise `"auditor"`.
  - `auditorId`: best-effort match by name against `audit.leadAuditor` (case-insensitive); otherwise empty (user must pick).
- Per-row inline edit of auditor, role, dates, mandays. Re-validates live.
- Validation per row (re-uses existing helpers from `cbFinance` / `CBSchedulingModule`):
  - `rangesOverlap` against existing `allocations` for the same auditor → conflict warning.
  - Auditor `standards` must include the programme's `standardId` (skip if either is missing) → competence warning.
  - Missing auditor or missing dates → row marked invalid (excluded from import count).
- Footer button label is dynamic: `Import N allocations`. Disabled when `N === 0`.
- "Skip rows with warnings" toggle: when on, conflict/competence rows are excluded from creation but kept visible. Default off (warnings still let the user import — matches the existing single-allocation drawer behaviour where conflicts block via toast; here we surface them up-front instead).

On commit:
- For each valid row, call `allocations.add({...})` with `programId`, `auditId`, `client`, `auditorId`, `role`, `startDate`, `endDate`, `mandays`, `costRate`.
- Toast: `Imported N allocations from {client} programme`. Drawer closes; calendar/list refresh through the existing `useCBCollection` subscription.

## Files to add / change

- **Add** `src/domains/certification-body/cbScheduleImport.ts`
  - `buildImportRows(program, audits, auditors, existingAllocations)` → returns `ImportRow[]` with pre-filled values + per-row `warnings: { conflict?: Allocation; competenceMissing?: boolean; invalid?: string }`.
  - `validateRow(row, auditors, existingAllocations, program)` → recomputes warnings after edits.
- **Add** `src/pages/certification-body/modules/scheduling/ImportFromProgrammeDrawer.tsx`
  - Uses `CBRecordDrawer` for shell, `CBFormSection` / `CBFormField` for the programme picker, a compact responsive table (cards on mobile, table ≥ `sm`), and `CBStatusPill` for warning chips.
  - Reads `useCBCollection("programs" | "audits" | "auditors" | "allocations")`.
- **Edit** `src/pages/certification-body/modules/CBSchedulingModule.tsx`
  - In `AllocationsTab`, render a secondary "Import from programme" button via `CBRecordList`'s right-slot pattern (or a small toolbar above it if no slot exists — confirmed `CBRecordList` already renders a toolbar with `primaryActionLabel`; we'll add a `secondaryAction` prop, or place the button just above the list).
- **Edit** `src/components/certification-body/CBRecordList.tsx` (small, additive)
  - Add optional `secondaryAction?: { label, icon?, onClick }` rendered next to the primary action. Backward compatible.

## Compliance notes (ISO/IEC 17021-1)

- Surfacing competence gaps at import time enforces §7.2 / §9.1.9 (only competent auditors assigned).
- Conflict pre-flight protects auditor independence and effective time-on-site (§9.1.9.2).
- Persisting `programId` on each allocation strengthens traceability between the audit programme (§9.1.4) and resource allocation records.

## Out of scope (not in this change)

- Recurring-cycle generation of the audits themselves (Stage 1 → Stage 2 → Surv → Recert) — programme already drives that elsewhere.
- Travel days, fee notes, invoices — handled by the existing Finance module; can be a follow-up "Generate fee notes from imported allocations".
- Multi-auditor team import per audit row (v1 imports one allocation per audit; team members can be added afterward via the existing single-allocation drawer). A follow-up can add an "Add team member" sub-row.
