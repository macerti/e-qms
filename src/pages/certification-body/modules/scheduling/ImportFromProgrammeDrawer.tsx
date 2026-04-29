import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, FileWarning } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CBClauseBadge } from "@/components/certification-body/CBClauseBadge";
import { CBFormField, CBFormSection } from "@/components/certification-body/CBFormField";
import { CBStatusPill } from "@/components/certification-body/CBStatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCBCollection } from "@/domains/certification-body/cbStore";
import {
  buildImportRows,
  summarizeRows,
  validateRow,
  type AllocationRole,
  type ImportRow,
} from "@/domains/certification-body/cbScheduleImport";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLES: { value: AllocationRole; label: string }[] = [
  { value: "lead_auditor", label: "Lead auditor" },
  { value: "auditor", label: "Auditor" },
  { value: "technical_expert", label: "Technical expert" },
  { value: "observer", label: "Observer" },
];

/**
 * Bulk-import scheduling allocations from an existing audit programme.
 * Pre-fills one editable row per planned audit, with live conflict and
 * competence checks (ISO/IEC 17021-1 §7.2 / §9.1.9).
 */
export function ImportFromProgrammeDrawer({ open, onOpenChange }: Props) {
  const programs = useCBCollection("programs");
  const audits = useCBCollection("audits");
  const auditors = useCBCollection("auditors");
  const allocations = useCBCollection("allocations");

  const [programId, setProgramId] = useState<string>("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [skipWarnings, setSkipWarnings] = useState(false);

  const program = useMemo(
    () => programs.data.find((p: any) => p.id === programId),
    [programs.data, programId],
  );

  // Reset on close.
  useEffect(() => {
    if (!open) {
      setProgramId("");
      setRows([]);
      setSkipWarnings(false);
    }
  }, [open]);

  // Re-seed rows whenever the programme changes.
  useEffect(() => {
    if (!program) {
      setRows([]);
      return;
    }
    setRows(buildImportRows(program, audits.data as any, auditors.data as any));
  }, [program, audits.data, auditors.data]);

  const summary = useMemo(() => {
    if (!program) return { willCreate: 0, conflicts: 0, competenceGaps: 0, invalid: 0 };
    return summarizeRows(rows, program, auditors.data as any, allocations.data as any, skipWarnings);
  }, [rows, program, auditors.data, allocations.data, skipWarnings]);

  const updateRow = (rowId: string, patch: Partial<ImportRow>) => {
    setRows((rs) => rs.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  };

  const handleImport = () => {
    if (!program) return;
    let created = 0;
    for (const r of rows) {
      if (!r.selected) continue;
      const w = validateRow(r, program, auditors.data as any, allocations.data as any);
      if (w.invalid) continue;
      if (skipWarnings && (w.conflict || w.competenceMissing)) continue;
      allocations.add({
        programId: program.id,
        auditId: r.auditId,
        auditorId: r.auditorId,
        client: r.client,
        role: r.role,
        startDate: r.startDate,
        endDate: r.endDate,
        mandays: r.mandays,
        costRate: r.costRate,
      });
      created++;
    }
    if (created === 0) {
      toast.error("Nothing to import — check selection and warnings.");
      return;
    }
    toast.success(`Imported ${created} allocation${created > 1 ? "s" : ""} from ${program.client ?? "programme"}.`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl flex flex-col p-0">
        <SheetHeader className="border-b border-border/60 bg-muted/20 px-6 py-4 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <CBClauseBadge code="9.1.4" />
            <CBClauseBadge code="9.1.9" />
            <CBClauseBadge code="7.2" />
          </div>
          <SheetTitle className="text-lg">Import allocations from audit programme</SheetTitle>
          <SheetDescription className="text-xs leading-relaxed">
            Bulk-create scheduling allocations from a programme's planned audits. Dates and lead auditor are
            pre-filled and editable. Conflicts and competence gaps are flagged before import.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 1. Programme picker */}
          <CBFormSection title="Source programme" clauseCode="9.1.4">
            <CBFormField label="Audit programme" required>
              <Select value={programId} onValueChange={setProgramId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a programme…" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  {programs.data.length === 0 && (
                    <SelectItem value="__none" disabled>
                      No programmes available
                    </SelectItem>
                  )}
                  {programs.data.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.client ?? "—"}{p.standardId ? ` · ${p.standardId}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CBFormField>
            {program && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <CBStatusPill tone="info" label={program.standardId ?? "No standard"} />
                {program.auditorCostRate ? (
                  <CBStatusPill
                    tone="brand"
                    label={`Cost rate ${program.currency ?? "EUR"} ${program.auditorCostRate}/d`}
                  />
                ) : null}
                <span className="self-center">{rows.length} planned audit{rows.length === 1 ? "" : "s"} found</span>
              </div>
            )}
          </CBFormSection>

          {/* 2 + 3. Mapping rows */}
          {program && rows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
              <FileWarning className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">No planned audits in this programme</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add audits in <span className="font-mono">Programmes → Schedule</span> first.
              </p>
            </div>
          )}

          {program && rows.length > 0 && (
            <CBFormSection
              title="Allocation mapping"
              description="Edit any row inline. The system validates conflicts and competence on the fly."
            >
              {/* Select-all + skip toggle */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <Checkbox
                    checked={rows.every((r) => r.selected)}
                    onCheckedChange={(v) => {
                      const sel = v === true;
                      setRows((rs) => rs.map((r) => ({ ...r, selected: sel })));
                    }}
                  />
                  Select all ({rows.filter((r) => r.selected).length}/{rows.length})
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Switch checked={skipWarnings} onCheckedChange={setSkipWarnings} />
                  Skip rows with warnings
                </label>
              </div>

              <div className="space-y-2">
                {rows.map((r) => {
                  const w = validateRow(r, program, auditors.data as any, allocations.data as any);
                  return (
                    <RowCard
                      key={r.rowId}
                      row={r}
                      auditors={auditors.data as any}
                      warnings={w}
                      onChange={(patch) => updateRow(r.rowId, patch)}
                    />
                  );
                })}
              </div>
            </CBFormSection>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 bg-muted/20 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <CBStatusPill
              tone={summary.willCreate > 0 ? "success" : "neutral"}
              label={`${summary.willCreate} to create`}
            />
            {summary.conflicts > 0 && (
              <CBStatusPill tone="danger" label={`${summary.conflicts} conflict${summary.conflicts > 1 ? "s" : ""}`} />
            )}
            {summary.competenceGaps > 0 && (
              <CBStatusPill tone="warning" label={`${summary.competenceGaps} competence gap${summary.competenceGaps > 1 ? "s" : ""}`} />
            )}
            {summary.invalid > 0 && (
              <CBStatusPill tone="neutral" label={`${summary.invalid} invalid`} />
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!program || summary.willCreate === 0}>
              Import {summary.willCreate} allocation{summary.willCreate === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ───────────── Row card (responsive: stacks on mobile, grid ≥ sm) ───────────── */
function RowCard({
  row,
  auditors,
  warnings,
  onChange,
}: {
  row: ImportRow;
  auditors: { id: string; fullName?: string }[];
  warnings: ReturnType<typeof validateRow>;
  onChange: (patch: Partial<ImportRow>) => void;
}) {
  const hasWarning = !!(warnings.conflict || warnings.competenceMissing);
  const hasError = !!warnings.invalid;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 shadow-sm transition-colors",
        !row.selected && "opacity-60",
        hasError ? "border-border/60" :
        warnings.conflict ? "border-destructive/40 bg-destructive/[0.02]" :
        warnings.competenceMissing ? "border-warning/40 bg-warning/[0.03]" :
        "border-border/60",
      )}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={row.selected}
          onCheckedChange={(v) => onChange({ selected: v === true })}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold truncate">{row.auditLabel}</div>
            {!hasError && !hasWarning && row.selected && (
              <span className="inline-flex items-center gap-1 text-[11px] text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Auditor</label>
              <Select
                value={row.auditorId ?? ""}
                onValueChange={(v) => onChange({ auditorId: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select auditor" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  {auditors.length === 0 && (
                    <SelectItem value="__none" disabled>No auditors</SelectItem>
                  )}
                  {auditors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.fullName ?? "—"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Role</label>
              <Select value={row.role} onValueChange={(v) => onChange({ role: v as AllocationRole })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Start</label>
              <Input
                type="date"
                className="h-9"
                value={row.startDate ?? ""}
                onChange={(e) => onChange({ startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">End</label>
              <Input
                type="date"
                className="h-9"
                value={row.endDate ?? ""}
                onChange={(e) => onChange({ endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Days</label>
              <Input
                type="number"
                min={0}
                step="0.5"
                className="h-9 tabular-nums"
                value={row.mandays ?? ""}
                onChange={(e) => onChange({ mandays: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Warnings */}
          {warnings.invalid && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <FileWarning className="h-3.5 w-3.5" />
              <span>{warnings.invalid} — row will be skipped.</span>
            </div>
          )}
          {warnings.conflict && (
            <div className="mt-2 flex items-start gap-1.5 text-[11px] text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Conflict — auditor already booked on{" "}
                <span className="font-medium">{warnings.conflict.client ?? "another audit"}</span>
                {warnings.conflict.startDate && (
                  <> ({warnings.conflict.startDate}
                    {warnings.conflict.endDate ? ` → ${warnings.conflict.endDate}` : ""})</>
                )}.
              </span>
            </div>
          )}
          {warnings.competenceMissing && (
            <div className="mt-2 flex items-start gap-1.5 text-[11px] text-warning">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>Competence gap — auditor is not qualified for the programme's standard (§7.2 / §9.1.9).</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
