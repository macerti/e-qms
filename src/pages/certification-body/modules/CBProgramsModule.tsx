import { useState } from "react";
import { CalendarRange, Calendar, Users } from "lucide-react";
import { CBPageShell } from "@/components/certification-body/CBPageShell";
import { CBRecordList, type CBColumn } from "@/components/certification-body/CBRecordList";
import { CBRecordDrawer } from "@/components/certification-body/CBRecordDrawer";
import { CBFormField, CBFormSection } from "@/components/certification-body/CBFormField";
import { CBStatusPill } from "@/components/certification-body/CBStatusPill";
import { CBLifecycleStepper } from "@/components/certification-body/CBLifecycleStepper";
import { TabLayout, type TabItem } from "@/ui/components/TabLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCBCollection } from "@/domains/certification-body/cbStore";
import { toast } from "sonner";

const AUDIT_TYPES = [
  { value: "stage1", label: "Stage 1 — Readiness" },
  { value: "stage2", label: "Stage 2 — Implementation" },
  { value: "surveillance", label: "Surveillance" },
  { value: "recertification", label: "Recertification" },
  { value: "special", label: "Special / for-cause" },
  { value: "transfer", label: "Transfer" },
];

export default function CBProgramsModule() {
  const [activeTab, setActiveTab] = useState<"programs" | "schedule" | "resources">("programs");
  const programs = useCBCollection("programs");
  const audits = useCBCollection("audits");
  const auditors = useCBCollection("auditors");

  const tabs: TabItem[] = [
    { key: "programs", label: "Programmes", icon: CalendarRange, count: programs.data.length },
    { key: "schedule", label: "Schedule", icon: Calendar, count: audits.data.length },
    { key: "resources", label: "Resources", icon: Users, count: auditors.data.length },
  ];

  return (
    <CBPageShell
      toolTitle="Audit Programmes"
      toolCodification="ISO/IEC 17021-1 · Clause 9.1.4–9.1.5"
      toolDescription="Build the 3-year certification cycle programme for each client, schedule individual audits and allocate competent resources to every assignment."
      clauseCodes={["9.1.4", "9.1.5", "9.1.9"]}
    >
      <CBLifecycleStepper current="audit_program_created" className="mb-5" />
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "programs" && <ProgramsTab programs={programs} />}
        {activeTab === "schedule" && <ScheduleTab audits={audits} />}
        {activeTab === "resources" && <ResourcesTab auditors={auditors} />}
      </div>
    </CBPageShell>
  );
}

function ProgramsTab({ programs }: { programs: ReturnType<typeof useCBCollection<"programs">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (row: any | null = null) => { setEditing(row); setForm(row ? { ...row } : { auditCount: 5 }); setOpen(true); };
  const save = () => {
    if (!form.client?.trim()) { toast.error("Client is required."); return; }
    if (editing) programs.update(editing.id, form); else programs.add(form);
    toast.success("Programme saved"); setOpen(false);
  };

  const cols: CBColumn<any>[] = [
    { key: "client", header: "Client", render: (r) => <span className="font-medium text-sm">{r.client}</span> },
    { key: "scope", header: "Scope/Standard", render: (r) => <span className="text-sm">{r.standardId || "—"}</span> },
    { key: "cycle", header: "Cycle", render: (r) => <span className="text-xs tabular-nums">{r.cycleStart} → {r.cycleEnd}</span> },
    { key: "audits", header: "Audits", render: (r) => <span className="text-sm tabular-nums">{r.auditCount ?? 0}</span> },
    { key: "rate", header: "Manday rate", render: (r) => <span className="text-sm tabular-nums">{r.mandayRate ? `${r.currency || "EUR"} ${r.mandayRate}` : "—"}</span> },
    { key: "status", header: "Status", render: (r) => <CBStatusPill label={r.status || "draft"} tone={r.status === "active" ? "success" : "info"} /> },
  ];

  return (
    <>
      <CBRecordList
        records={programs.data}
        columns={cols}
        searchFields={["client"] as any}
        searchPlaceholder="Search programmes…"
        emptyTitle="No audit programmes"
        emptyDescription="Build a 3-year certification cycle covering Stage 1, Stage 2, two surveillances and recertification (§9.1.4)."
        primaryActionLabel="New programme"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => programs.remove(r.id)}
      />
      <CBRecordDrawer
        open={open} onOpenChange={setOpen}
        title={editing ? "Edit programme" : "New audit programme"}
        clauseCodes={["9.1.4", "9.1.5"]}
        description="The audit programme spans the full certification cycle (typically 3 years) and shall be reviewed before each audit."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <CBFormSection title="Programme identification" clauseCode="9.1.4">
          <CBFormField label="Client" required><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Standard"><Input value={form.standardId ?? ""} onChange={(e) => setForm({ ...form, standardId: e.target.value })} placeholder="e.g. ISO 9001" /></CBFormField>
        </CBFormSection>
        <CBFormSection title="Cycle dates">
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Cycle start"><Input type="date" value={form.cycleStart ?? ""} onChange={(e) => setForm({ ...form, cycleStart: e.target.value })} /></CBFormField>
            <CBFormField label="Cycle end"><Input type="date" value={form.cycleEnd ?? ""} onChange={(e) => setForm({ ...form, cycleEnd: e.target.value })} /></CBFormField>
          </div>
        </CBFormSection>
        <CBFormSection title="Audit time calculation" clauseCode="9.1.5" description="Capture the IAF MD 5 calculation rationale.">
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Audits planned"><Input type="number" min={1} value={form.auditCount ?? ""} onChange={(e) => setForm({ ...form, auditCount: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Total audit days (cycle)"><Input type="number" min={0} step="0.5" value={form.totalDays ?? ""} onChange={(e) => setForm({ ...form, totalDays: Number(e.target.value) })} /></CBFormField>
          </div>
          <CBFormField label="Justification of audit time" hint="Explain reductions/increases vs MD 5 baseline.">
            <Textarea rows={3} value={form.justification ?? ""} onChange={(e) => setForm({ ...form, justification: e.target.value })} />
          </CBFormField>
        </CBFormSection>
        <CBFormSection title="Commercial — manday rate" description="Default rate billed to the client per audit day. Used as the sell rate when creating quotations and invoices.">
          <div className="grid grid-cols-3 gap-3">
            <CBFormField label="Manday rate (sell)"><Input type="number" min={0} step="10" value={form.mandayRate ?? ""} onChange={(e) => setForm({ ...form, mandayRate: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Auditor cost rate"><Input type="number" min={0} step="10" value={form.auditorCostRate ?? ""} onChange={(e) => setForm({ ...form, auditorCostRate: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Currency"><Input value={form.currency ?? "EUR"} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></CBFormField>
          </div>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}

function ScheduleTab({ audits }: { audits: ReturnType<typeof useCBCollection<"audits">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (row: any | null = null) => { setEditing(row); setForm(row ? { ...row } : { auditType: "stage1", stage: "planned" }); setOpen(true); };
  const save = () => {
    if (!form.client?.trim() || !form.plannedStart) { toast.error("Client and planned start are required."); return; }
    if (editing) audits.update(editing.id, form); else audits.add(form);
    toast.success("Audit scheduled"); setOpen(false);
  };

  const cols: CBColumn<any>[] = [
    { key: "client", header: "Client", render: (r) => <span className="font-medium text-sm">{r.client}</span> },
    { key: "type", header: "Type", render: (r) => <CBStatusPill tone="brand" label={AUDIT_TYPES.find((t) => t.value === r.auditType)?.label.split(" — ")[0] ?? r.auditType} /> },
    { key: "lead", header: "Lead auditor", render: (r) => <span className="text-sm">{r.leadAuditor || "—"}</span> },
    { key: "dates", header: "Dates", render: (r) => <span className="text-xs tabular-nums">{r.plannedStart} → {r.plannedEnd || "?"}</span> },
    { key: "duration", header: "Days", render: (r) => <span className="text-sm tabular-nums">{r.durationDays ?? "—"}</span> },
    { key: "stage", header: "Status", render: (r) => <CBStatusPill label={r.stage ?? "planned"} tone={r.stage === "completed" ? "success" : r.stage === "in_progress" ? "warning" : "info"} /> },
  ];

  return (
    <>
      <CBRecordList
        records={audits.data}
        columns={cols}
        searchFields={["client", "leadAuditor"] as any}
        searchPlaceholder="Search audits…"
        filters={[
          { id: "type", label: "Type", options: [{ value: "all", label: "All" }, ...AUDIT_TYPES.map((t) => ({ value: t.value, label: t.label }))] },
          { id: "stage", label: "Status", options: ["all", "planned", "in_progress", "completed", "cancelled"].map((v) => ({ value: v, label: v === "all" ? "All" : v })) },
        ]}
        filterPredicates={{ type: (r, v) => r.auditType === v, stage: (r, v) => r.stage === v }}
        emptyTitle="No audits scheduled"
        emptyDescription="Plan Stage 1, Stage 2, surveillance and recertification audits with dates, duration and lead auditor."
        primaryActionLabel="Schedule audit"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => audits.remove(r.id)}
      />
      <CBRecordDrawer
        open={open} onOpenChange={setOpen}
        title={editing ? "Edit audit" : "Schedule new audit"}
        clauseCodes={["9.2", "9.1.9"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Client" required><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Audit type" required>
            <Select value={form.auditType} onValueChange={(v) => setForm({ ...form, auditType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">{AUDIT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Planned start" required><Input type="date" value={form.plannedStart ?? ""} onChange={(e) => setForm({ ...form, plannedStart: e.target.value })} /></CBFormField>
          <CBFormField label="Planned end"><Input type="date" value={form.plannedEnd ?? ""} onChange={(e) => setForm({ ...form, plannedEnd: e.target.value })} /></CBFormField>
          <CBFormField label="Audit duration (days)" clauseCode="9.1.5"><Input type="number" min={0} step="0.5" value={form.durationDays ?? ""} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} /></CBFormField>
          <CBFormField label="Status">
            <Select value={form.stage ?? "planned"} onValueChange={(v) => setForm({ ...form, stage: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                {["planned", "in_progress", "completed", "cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </CBFormField>
        </div>
        <CBFormField label="Lead auditor" required clauseCode="9.1.9" hint="Must be competent for the standard and IAF sector."><Input value={form.leadAuditor ?? ""} onChange={(e) => setForm({ ...form, leadAuditor: e.target.value })} /></CBFormField>
        <CBFormField label="Team members (comma separated)"><Input value={form.team ?? ""} onChange={(e) => setForm({ ...form, team: e.target.value })} /></CBFormField>
        <CBFormField label="Audit objectives" clauseCode="9.2"><Textarea rows={2} value={form.objectives ?? ""} onChange={(e) => setForm({ ...form, objectives: e.target.value })} /></CBFormField>
        <CBFormField label="Audit criteria"><Textarea rows={2} value={form.criteria ?? ""} onChange={(e) => setForm({ ...form, criteria: e.target.value })} placeholder="Standard, client documented information, statutory & regulatory requirements." /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function ResourcesTab({ auditors }: { auditors: ReturnType<typeof useCBCollection<"auditors">> }) {
  return (
    <CBRecordList
      records={auditors.data}
      columns={[
        { key: "name", header: "Auditor", render: (r) => <span className="font-medium text-sm">{r.fullName}</span> },
        { key: "status", header: "Status", render: (r) => <CBStatusPill label={r.status ?? "qualified"} tone={r.status === "qualified" ? "success" : "warning"} /> },
        { key: "standards", header: "Standards", render: (r) => <span className="text-xs">{(r.standards ?? []).join(", ") || "—"}</span> },
        { key: "sectors", header: "Sectors", render: (r) => <span className="text-xs font-mono">{(r.sectors ?? []).join(", ") || "—"}</span> },
      ]}
      searchFields={["fullName"] as any}
      searchPlaceholder="Search auditors…"
      emptyTitle="No auditors registered"
      emptyDescription="Add auditors in the Competence module — they will appear here for assignment."
    />
  );
}
