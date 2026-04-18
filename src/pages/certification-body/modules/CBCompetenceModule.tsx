import { useState } from "react";
import { UserCheck, Grid3X3, Eye, BookOpen } from "lucide-react";
import { CBPageShell } from "@/components/certification-body/CBPageShell";
import { CBRecordList, type CBColumn } from "@/components/certification-body/CBRecordList";
import { CBRecordDrawer } from "@/components/certification-body/CBRecordDrawer";
import { CBFormField, CBFormSection } from "@/components/certification-body/CBFormField";
import { CBStatusPill } from "@/components/certification-body/CBStatusPill";
import { TabLayout, type TabItem } from "@/ui/components/TabLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCBCollection } from "@/domains/certification-body/cbStore";
import { IAF_SECTORS } from "@/domains/certification-body/iafSectors";
import { toast } from "sonner";

const COMPETENCE_STATUSES = [
  { value: "qualified", label: "Qualified", tone: "success" as const },
  { value: "in_training", label: "In training", tone: "info" as const },
  { value: "provisionally_qualified", label: "Provisional", tone: "warning" as const },
  { value: "suspended", label: "Suspended", tone: "danger" as const },
  { value: "withdrawn", label: "Withdrawn", tone: "neutral" as const },
];

const ROLES = [
  { value: "lead_auditor", label: "Lead auditor" },
  { value: "auditor", label: "Auditor" },
  { value: "technical_expert", label: "Technical expert" },
];

export default function CBCompetenceModule() {
  const [activeTab, setActiveTab] = useState<"auditors" | "matrix" | "witness" | "training">("auditors");
  const auditors = useCBCollection("auditors");
  const matrix = useCBCollection("competences");
  const witness = useCBCollection("witnessAudits");
  const training = useCBCollection("trainings");

  const tabs: TabItem[] = [
    { key: "auditors", label: "Auditors", icon: UserCheck, count: auditors.data.length },
    { key: "matrix", label: "Competence matrix", icon: Grid3X3, count: matrix.data.length },
    { key: "witness", label: "Witness audits", icon: Eye, count: witness.data.length },
    { key: "training", label: "Training & CPD", icon: BookOpen, count: training.data.length },
  ];

  return (
    <CBPageShell
      toolTitle="Competence"
      toolCodification="ISO/IEC 17021-1 · Clause 7"
      toolDescription="Manage auditor profiles, map competences to standards and IAF sectors, plan witness audits and track continuous professional development."
      clauseCodes={["7.1", "7.2", "7.4"]}
    >
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "auditors" && <AuditorsTab auditors={auditors} />}
        {activeTab === "matrix" && <MatrixTab matrix={matrix} auditors={auditors} />}
        {activeTab === "witness" && <WitnessTab witness={witness} />}
        {activeTab === "training" && <TrainingTab training={training} />}
      </div>
    </CBPageShell>
  );
}

function AuditorsTab({ auditors }: { auditors: ReturnType<typeof useCBCollection<"auditors">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { status: "qualified", standards: [], sectors: [] }); setOpen(true); };
  const save = () => {
    if (!form.fullName?.trim()) { toast.error("Full name is required (§7.4)."); return; }
    if (editing) auditors.update(editing.id, form); else auditors.add(form);
    toast.success("Auditor profile saved"); setOpen(false);
  };

  const cols: CBColumn<any>[] = [
    { key: "name", header: "Auditor", render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.fullName}</div>
        {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
      </div>
    )},
    { key: "status", header: "Status", render: (r) => { const cfg = COMPETENCE_STATUSES.find((s) => s.value === r.status); return <CBStatusPill label={cfg?.label ?? r.status} tone={cfg?.tone ?? "neutral"} />; } },
    { key: "stds", header: "Standards", render: (r) => <span className="text-xs">{(r.standards ?? []).join(", ") || "—"}</span> },
    { key: "sectors", header: "Sectors (IAF)", render: (r) => <span className="font-mono text-xs">{(r.sectors ?? []).join(", ") || "—"}</span> },
    { key: "lastWit", header: "Last witness", render: (r) => <span className="text-xs tabular-nums">{r.lastWitness || "—"}</span> },
  ];

  return (
    <>
      <CBRecordList
        records={auditors.data}
        columns={cols}
        searchFields={["fullName", "email"] as any}
        searchPlaceholder="Search auditors…"
        filters={[
          { id: "status", label: "Status", options: [{ value: "all", label: "All" }, ...COMPETENCE_STATUSES.map((s) => ({ value: s.value, label: s.label }))] },
        ]}
        filterPredicates={{ status: (r, v) => r.status === v }}
        emptyTitle="No auditors registered"
        emptyDescription="Maintain personnel records and continually evaluate performance (§7.4)."
        primaryActionLabel="Add auditor"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => auditors.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit auditor" : "Add auditor"}
        clauseCodes={["7.2", "7.4"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <CBFormSection title="Identity" clauseCode="7.4">
          <CBFormField label="Full name" required><Input value={form.fullName ?? ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></CBFormField>
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Email"><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></CBFormField>
            <CBFormField label="Employee ID"><Input value={form.employeeId ?? ""} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></CBFormField>
          </div>
          <CBFormField label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">{COMPETENCE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </CBFormField>
        </CBFormSection>

        <CBFormSection title="Authorised standards" clauseCode="7.1" description="Pick all standards this auditor is qualified to audit.">
          <div className="flex flex-wrap gap-2">
            {["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001"].map((std) => {
              const active = (form.standards ?? []).includes(std);
              return (
                <button type="button" key={std} onClick={() => {
                  const cur: string[] = form.standards ?? [];
                  setForm({ ...form, standards: active ? cur.filter((s) => s !== std) : [...cur, std] });
                }} className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                  {std}
                </button>
              );
            })}
          </div>
        </CBFormSection>

        <CBFormSection title="IAF technical sectors" description="Auditor cannot be assigned outside these sectors.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto rounded-lg border border-border/60 p-2 bg-background">
            {IAF_SECTORS.map((s) => {
              const active = (form.sectors ?? []).includes(s.code);
              return (
                <label key={s.code} className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs cursor-pointer ${active ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  <input type="checkbox" checked={active} onChange={() => {
                    const cur: string[] = form.sectors ?? [];
                    setForm({ ...form, sectors: active ? cur.filter((c) => c !== s.code) : [...cur, s.code] });
                  }} className="h-3.5 w-3.5 accent-primary" />
                  <span className="font-mono">{s.code}</span>
                  <span className="truncate">{s.label}</span>
                </label>
              );
            })}
          </div>
        </CBFormSection>

        <CBFormSection title="Notes & evidence" clauseCode="7.4">
          <CBFormField label="Qualification evidence (training, exams, witness audits…)"><Textarea rows={3} value={form.evidence ?? ""} onChange={(e) => setForm({ ...form, evidence: e.target.value })} /></CBFormField>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}

function MatrixTab({ matrix, auditors }: { matrix: ReturnType<typeof useCBCollection<"competences">>; auditors: ReturnType<typeof useCBCollection<"auditors">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { role: "auditor" }); setOpen(true); };
  const save = () => {
    if (!form.auditor || !form.standard || !form.iafCode) { toast.error("Auditor, standard and IAF sector are required."); return; }
    if (editing) matrix.update(editing.id, form); else matrix.add(form);
    toast.success("Competence record saved"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={matrix.data}
        columns={[
          { key: "auditor", header: "Auditor", render: (r) => <span className="text-sm font-medium">{r.auditor}</span> },
          { key: "std", header: "Standard", render: (r) => <span className="text-sm">{r.standard}</span> },
          { key: "iaf", header: "IAF", render: (r) => <span className="font-mono text-xs">{r.iafCode}</span> },
          { key: "role", header: "Role", render: (r) => <CBStatusPill tone="brand" label={ROLES.find((x) => x.value === r.role)?.label ?? r.role} /> },
          { key: "qual", header: "Qualified on", render: (r) => <span className="text-xs tabular-nums">{r.qualificationDate}</span> },
          { key: "exp", header: "Expires", render: (r) => <span className="text-xs tabular-nums">{r.expiryDate || "—"}</span> },
        ]}
        searchFields={["auditor", "standard"] as any}
        searchPlaceholder="Search competence matrix…"
        emptyTitle="No competence records"
        emptyDescription="Map every auditor's competences to specific standards, IAF sectors and audit roles (§7.1.2)."
        primaryActionLabel="Add competence"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => matrix.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit competence" : "Add competence record"}
        clauseCodes={["7.1.2", "7.2"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <CBFormField label="Auditor" required>
          <Select value={form.auditor} onValueChange={(v) => setForm({ ...form, auditor: v })}>
            <SelectTrigger><SelectValue placeholder="Pick auditor" /></SelectTrigger>
            <SelectContent className="bg-popover z-[60]">{auditors.data.map((a: any) => <SelectItem key={a.id} value={a.fullName}>{a.fullName}</SelectItem>)}</SelectContent>
          </Select>
        </CBFormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Standard" required><Input value={form.standard ?? ""} onChange={(e) => setForm({ ...form, standard: e.target.value })} placeholder="ISO 9001" /></CBFormField>
          <CBFormField label="IAF sector" required>
            <Select value={form.iafCode} onValueChange={(v) => setForm({ ...form, iafCode: v })}>
              <SelectTrigger><SelectValue placeholder="Pick sector" /></SelectTrigger>
              <SelectContent className="bg-popover z-[60] max-h-72">{IAF_SECTORS.map((s) => <SelectItem key={s.code} value={s.code}>IAF {s.code} · {s.label}</SelectItem>)}</SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Role">
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">{ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Qualification date"><Input type="date" value={form.qualificationDate ?? ""} onChange={(e) => setForm({ ...form, qualificationDate: e.target.value })} /></CBFormField>
          <CBFormField label="Expiry date"><Input type="date" value={form.expiryDate ?? ""} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></CBFormField>
        </div>
        <CBFormField label="Evidence reference"><Input value={form.evidence ?? ""} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder="Training cert ID, witness audit ref…" /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function WitnessTab({ witness }: { witness: ReturnType<typeof useCBCollection<"witnessAudits">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { result: "satisfactory" }); setOpen(true); };
  const save = () => {
    if (!form.auditor?.trim() || !form.evaluator?.trim() || !form.date) { toast.error("Auditor, evaluator and date are required."); return; }
    if (editing) witness.update(editing.id, form); else witness.add(form);
    toast.success("Witness audit saved"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={witness.data}
        columns={[
          { key: "auditor", header: "Auditor", render: (r) => <span className="text-sm font-medium">{r.auditor}</span> },
          { key: "client", header: "Client audited", render: (r) => <span className="text-sm">{r.client || "—"}</span> },
          { key: "evaluator", header: "Evaluator", render: (r) => <span className="text-sm">{r.evaluator}</span> },
          { key: "date", header: "Date", render: (r) => <span className="text-xs tabular-nums">{r.date}</span> },
          { key: "result", header: "Result", render: (r) => <CBStatusPill label={r.result} tone={r.result === "satisfactory" ? "success" : r.result === "needs_improvement" ? "warning" : "danger"} /> },
        ]}
        searchFields={["auditor", "evaluator"] as any}
        searchPlaceholder="Search witness audits…"
        emptyTitle="No witness audits"
        emptyDescription="Track witness audit evaluations to confirm ongoing auditor performance (§7.2.7)."
        primaryActionLabel="Log witness audit"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => witness.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit witness audit" : "Log witness audit"}
        clauseCodes={["7.2.7"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Auditor witnessed" required><Input value={form.auditor ?? ""} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></CBFormField>
          <CBFormField label="Evaluator" required><Input value={form.evaluator ?? ""} onChange={(e) => setForm({ ...form, evaluator: e.target.value })} /></CBFormField>
          <CBFormField label="Client audited"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Date" required><Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></CBFormField>
          <CBFormField label="Result">
            <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="satisfactory">Satisfactory</SelectItem>
                <SelectItem value="needs_improvement">Needs improvement</SelectItem>
                <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
        </div>
        <CBFormField label="Observations / development plan"><Textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function TrainingTab({ training }: { training: ReturnType<typeof useCBCollection<"trainings">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : {}); setOpen(true); };
  const save = () => {
    if (!form.auditor?.trim() || !form.title?.trim()) { toast.error("Auditor and title are required."); return; }
    if (editing) training.update(editing.id, form); else training.add(form);
    toast.success("Training record saved"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={training.data}
        columns={[
          { key: "auditor", header: "Auditor", render: (r) => <span className="text-sm font-medium">{r.auditor}</span> },
          { key: "title", header: "Training", render: (r) => <span className="text-sm">{r.title}</span> },
          { key: "provider", header: "Provider", render: (r) => <span className="text-sm">{r.provider || "—"}</span> },
          { key: "date", header: "Date", render: (r) => <span className="text-xs tabular-nums">{r.date}</span> },
          { key: "hours", header: "CPD hrs", render: (r) => <span className="text-sm tabular-nums">{r.hours ?? 0}</span> },
        ]}
        searchFields={["auditor", "title", "provider"] as any}
        searchPlaceholder="Search training…"
        emptyTitle="No training records"
        emptyDescription="Track continuous professional development to maintain auditor competence (§7.2.8)."
        primaryActionLabel="Log training"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => training.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit training record" : "Log training"}
        clauseCodes={["7.2.8"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Auditor" required><Input value={form.auditor ?? ""} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></CBFormField>
          <CBFormField label="Date"><Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></CBFormField>
          <CBFormField label="Title" required><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></CBFormField>
          <CBFormField label="Provider"><Input value={form.provider ?? ""} onChange={(e) => setForm({ ...form, provider: e.target.value })} /></CBFormField>
          <CBFormField label="CPD hours"><Input type="number" min={0} step="0.5" value={form.hours ?? ""} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} /></CBFormField>
          <CBFormField label="Outcome">
            <Select value={form.outcome ?? "completed"} onValueChange={(v) => setForm({ ...form, outcome: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="passed">Passed (with certification)</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
        </div>
        <CBFormField label="Notes"><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}
