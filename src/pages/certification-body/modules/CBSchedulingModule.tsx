import { useMemo, useState } from "react";
import { CalendarDays, AlertTriangle, Users, ChevronLeft, ChevronRight, FileDown, Briefcase } from "lucide-react";
import { CBPageShell } from "@/components/certification-body/CBPageShell";
import { CBStatTile, CBStatGrid } from "@/components/certification-body/CBStatTile";
import { CBRecordList, type CBColumn } from "@/components/certification-body/CBRecordList";
import { CBRecordDrawer } from "@/components/certification-body/CBRecordDrawer";
import { CBFormField, CBFormSection } from "@/components/certification-body/CBFormField";
import { CBStatusPill } from "@/components/certification-body/CBStatusPill";
import { TabLayout, type TabItem } from "@/ui/components/TabLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCBCollection } from "@/domains/certification-body/cbStore";
import { rangesOverlap, listDatesInRange } from "@/domains/certification-body/cbFinance";
import { ImportFromProgrammeDrawer } from "./scheduling/ImportFromProgrammeDrawer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CBSchedulingModule() {
  const [activeTab, setActiveTab] = useState<"calendar" | "allocations" | "conflicts">("calendar");
  const allocations = useCBCollection("allocations");
  const auditors = useCBCollection("auditors");
  const audits = useCBCollection("audits");

  const conflicts = useMemo(() => detectConflicts(allocations.data), [allocations.data]);
  const tabs: TabItem[] = [
    { key: "calendar", label: "Calendar", icon: CalendarDays, count: allocations.data.length },
    { key: "allocations", label: "Allocations", icon: Users, count: allocations.data.length },
    { key: "conflicts", label: "Conflicts", icon: AlertTriangle, count: conflicts.length },
  ];

  return (
    <CBPageShell
      toolTitle="Scheduling"
      toolCodification="ISO/IEC 17021-1 · Clause 9.1.9"
      toolDescription="Allocate competent auditors to scheduled audits. The system automatically detects double-bookings and flags missing competence."
      clauseCodes={["9.1.9", "7.2"]}
    >
      {(() => {
        const now = new Date();
        const upcoming = allocations.data.filter((a: any) => a.startDate && new Date(a.startDate) >= now).length;
        const totalMandays = allocations.data.reduce((s: number, a: any) => s + (Number(a.mandays) || 0), 0);
        const utilisedAuditors = new Set(allocations.data.map((a: any) => a.auditorId).filter(Boolean)).size;
        return (
          <CBStatGrid className="mb-5">
            <CBStatTile label="Allocations" value={allocations.data.length} icon={Users} tone="primary" hint="All assignments" />
            <CBStatTile label="Upcoming" value={upcoming} icon={CalendarDays} tone="info" hint="Future scheduled" />
            <CBStatTile label="Total mandays" value={totalMandays} icon={Briefcase} tone="violet" hint="Across allocations" />
            <CBStatTile label="Auditors used" value={`${utilisedAuditors}/${auditors.data.length}`} icon={Users} tone="success" hint="Pool utilisation" />
            <CBStatTile label="Conflicts" value={conflicts.length} icon={AlertTriangle} tone={conflicts.length > 0 ? "danger" : "neutral"} hint="Double-bookings" />
          </CBStatGrid>
        );
      })()}
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "calendar" && <CalendarTab allocations={allocations.data} auditors={auditors.data} />}
        {activeTab === "allocations" && (
          <AllocationsTab allocations={allocations} auditors={auditors.data} audits={audits.data} />
        )}
        {activeTab === "conflicts" && <ConflictsTab conflicts={conflicts} />}
      </div>
    </CBPageShell>
  );
}

/* ───────────── Conflict detection ───────────── */
function detectConflicts(allocations: any[]) {
  const out: { auditorId: string; a: any; b: any }[] = [];
  for (let i = 0; i < allocations.length; i++) {
    for (let j = i + 1; j < allocations.length; j++) {
      const a = allocations[i];
      const b = allocations[j];
      if (a.auditorId && a.auditorId === b.auditorId && rangesOverlap(a.startDate, a.endDate, b.startDate, b.endDate)) {
        out.push({ auditorId: a.auditorId, a, b });
      }
    }
  }
  return out;
}

/* ───────────── Calendar tab ───────────── */
function CalendarTab({ allocations, auditors }: { allocations: any[]; auditors: any[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const days = useMemo(() => buildMonthDays(cursor), [cursor]);

  const allocByAuditorDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const a of allocations) {
      const key = a.auditorId;
      if (!key) continue;
      for (const d of listDatesInRange(a.startDate, a.endDate)) {
        const k = `${key}|${d}`;
        const arr = map.get(k) ?? [];
        arr.push(a);
        map.set(k, arr);
      }
    }
    return map;
  }, [allocations]);

  const visibleAuditors = auditors.length ? auditors : [{ id: "—", fullName: "No auditors yet" }];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => setCursor(addMonths(cursor, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-semibold">{monthLabel}</span>
          <Button size="icon" variant="ghost" onClick={() => setCursor(addMonths(cursor, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {allocations.length} allocations · {auditors.length} auditors
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
        <table className="w-full border-separate border-spacing-0 text-xs">
          <thead className="bg-muted/40">
            <tr>
              <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground">
                Auditor
              </th>
              {days.map((d) => (
                <th
                  key={d.iso}
                  className={cn(
                    "min-w-[2rem] px-1 py-2 text-center font-medium",
                    d.isWeekend && "bg-muted/60 text-muted-foreground",
                    d.isToday && "text-primary",
                  )}
                >
                  <div className="text-[10px] opacity-70">{d.dow}</div>
                  <div>{d.day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleAuditors.map((a) => (
              <tr key={a.id}>
                <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium border-t border-border/40">
                  {a.fullName ?? "—"}
                </td>
                {days.map((d) => {
                  const cellAllocs = allocByAuditorDay.get(`${a.id}|${d.iso}`) ?? [];
                  const overload = cellAllocs.length > 1;
                  return (
                    <td
                      key={d.iso}
                      className={cn(
                        "border-t border-l border-border/40 p-0.5 align-top",
                        d.isWeekend && "bg-muted/30",
                      )}
                      title={cellAllocs.map((c) => `${c.client} (${c.role || "auditor"})`).join("\n")}
                    >
                      {cellAllocs.length > 0 && (
                        <div
                          className={cn(
                            "h-5 rounded-sm px-1 text-[9px] font-medium leading-5 truncate",
                            overload
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/15 text-primary",
                          )}
                        >
                          {cellAllocs[0].client?.slice(0, 6) ?? "·"}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-primary/30" /> Allocated</div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-destructive/30" /> Conflict (double-booking)</div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-muted" /> Weekend</div>
      </div>
    </div>
  );
}

function buildMonthDays(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const last = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const out: { iso: string; day: number; dow: string; isWeekend: boolean; isToday: boolean }[] = [];
  for (let i = 1; i <= last; i++) {
    const d = new Date(year, month, i);
    const iso = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString(undefined, { weekday: "narrow" });
    const dow = d.getDay();
    out.push({ iso, day: i, dow: dayName, isWeekend: dow === 0 || dow === 6, isToday: iso === today });
  }
  return out;
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

/* ───────────── Allocations tab ───────────── */
function AllocationsTab({
  allocations,
  auditors,
  audits,
}: {
  allocations: ReturnType<typeof useCBCollection<"allocations">>;
  auditors: any[];
  audits: any[];
}) {
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (row: any | null = null) => {
    setEditing(row);
    setForm(row ? { ...row } : { role: "auditor" });
    setOpen(true);
  };

  const save = () => {
    if (!form.auditorId || !form.startDate || !form.endDate) {
      toast.error("Auditor, start and end dates are required.");
      return;
    }
    // Conflict check
    const conflict = allocations.data.find(
      (x: any) =>
        x.id !== editing?.id &&
        x.auditorId === form.auditorId &&
        rangesOverlap(form.startDate, form.endDate, x.startDate, x.endDate),
    );
    if (conflict) {
      toast.error(`Conflict with allocation on ${conflict.client} (${conflict.startDate} → ${conflict.endDate}).`);
      return;
    }
    // Competence check (if auditor + auditId present)
    const auditor = auditors.find((a) => a.id === form.auditorId);
    const audit = audits.find((a) => a.id === form.auditId);
    if (auditor && audit && audit.standardId && Array.isArray(auditor.standards) && !auditor.standards.includes(audit.standardId)) {
      toast.error(`Competence missing: ${auditor.fullName} is not qualified for ${audit.standardId} (§7.2 / 9.1.9).`);
      return;
    }
    if (editing) allocations.update(editing.id, form);
    else allocations.add(form);
    toast.success("Allocation saved");
    setOpen(false);
  };

  const cols: CBColumn<any>[] = [
    {
      key: "auditor",
      header: "Auditor",
      render: (r) => <span className="text-sm font-medium">{auditors.find((a) => a.id === r.auditorId)?.fullName ?? r.auditorId}</span>,
    },
    { key: "client", header: "Client", render: (r) => <span className="text-sm">{r.client || "—"}</span> },
    { key: "role", header: "Role", render: (r) => <CBStatusPill tone="info" label={r.role || "auditor"} /> },
    { key: "dates", header: "Dates", render: (r) => <span className="text-xs tabular-nums">{r.startDate} → {r.endDate}</span> },
    { key: "mandays", header: "Mandays", render: (r) => <span className="text-sm tabular-nums">{r.mandays ?? "—"}</span> },
    { key: "rate", header: "Cost rate", render: (r) => <span className="text-xs tabular-nums">{r.costRate ?? "—"}</span> },
  ];

  return (
    <>
      <CBRecordList
        records={allocations.data}
        columns={cols}
        searchFields={["client"] as any}
        searchPlaceholder="Search allocations…"
        emptyTitle="No allocations yet"
        emptyDescription="Allocate competent auditors to scheduled audits with explicit start/end and manday cost."
        primaryActionLabel="New allocation"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => allocations.remove(r.id)}
        rightSlot={
          <Button variant="outline" size="sm" className="h-10" onClick={() => setImportOpen(true)}>
            <FileDown className="mr-1.5 h-4 w-4" />
            Import from programme
          </Button>
        }
      />
      <ImportFromProgrammeDrawer open={importOpen} onOpenChange={setImportOpen} />
      <CBRecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit allocation" : "Allocate auditor"}
        clauseCodes={["9.1.9", "7.2"]}
        description="Assign a competent auditor — the system blocks double-bookings and missing competence."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <CBFormSection title="Assignment">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Auditor" required clauseCode="7.2">
              <Select value={form.auditorId} onValueChange={(v) => setForm({ ...form, auditorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select auditor" /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  {auditors.length === 0 && <SelectItem value="__none" disabled>No auditors yet</SelectItem>}
                  {auditors.map((a) => <SelectItem key={a.id} value={a.id}>{a.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </CBFormField>
            <CBFormField label="Audit (optional)">
              <Select value={form.auditId ?? ""} onValueChange={(v) => setForm({ ...form, auditId: v, client: audits.find((x) => x.id === v)?.client ?? form.client })}>
                <SelectTrigger><SelectValue placeholder="Link to audit" /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  {audits.length === 0 && <SelectItem value="__none" disabled>No audits</SelectItem>}
                  {audits.map((a) => <SelectItem key={a.id} value={a.id}>{a.client} — {a.auditType}</SelectItem>)}
                </SelectContent>
              </Select>
            </CBFormField>
            <CBFormField label="Client"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
            <CBFormField label="Role">
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  <SelectItem value="lead_auditor">Lead auditor</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="technical_expert">Technical expert</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                </SelectContent>
              </Select>
            </CBFormField>
          </div>
        </CBFormSection>
        <CBFormSection title="Dates & cost">
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Start date" required><Input type="date" value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></CBFormField>
            <CBFormField label="End date" required><Input type="date" value={form.endDate ?? ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></CBFormField>
            <CBFormField label="Mandays"><Input type="number" min={0} step="0.5" value={form.mandays ?? ""} onChange={(e) => setForm({ ...form, mandays: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Cost rate / day" hint="Subcontractor day rate (used for fee notes)."><Input type="number" min={0} step="10" value={form.costRate ?? ""} onChange={(e) => setForm({ ...form, costRate: Number(e.target.value) })} /></CBFormField>
          </div>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}

/* ───────────── Conflicts tab ───────────── */
function ConflictsTab({ conflicts }: { conflicts: { auditorId: string; a: any; b: any }[] }) {
  if (conflicts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <AlertTriangle className="h-6 w-6 text-success" />
        </div>
        <h3 className="text-base font-semibold">No conflicts detected</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">All auditor allocations have non-overlapping date ranges.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {conflicts.map((c, i) => (
        <div key={i} className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" /> Double-booking detected
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Auditor <span className="font-mono">{c.auditorId}</span> is allocated twice over overlapping dates:
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
            <div className="rounded-md bg-background p-2 border border-border/60">
              <div className="font-medium">{c.a.client || "—"}</div>
              <div className="text-muted-foreground tabular-nums">{c.a.startDate} → {c.a.endDate}</div>
            </div>
            <div className="rounded-md bg-background p-2 border border-border/60">
              <div className="font-medium">{c.b.client || "—"}</div>
              <div className="text-muted-foreground tabular-nums">{c.b.startDate} → {c.b.endDate}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
