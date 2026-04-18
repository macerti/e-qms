import { useState, useMemo } from "react";
import { ShieldQuestion, FileWarning, UsersRound, ShieldAlert } from "lucide-react";
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
import { toast } from "sonner";

const THREATS = [
  { value: "self_interest", label: "Self-interest" },
  { value: "self_review", label: "Self-review" },
  { value: "familiarity", label: "Familiarity" },
  { value: "intimidation", label: "Intimidation" },
  { value: "advocacy", label: "Advocacy" },
];

const RISK_LEVELS = [
  { value: "low", label: "Low", tone: "success" as const },
  { value: "medium", label: "Medium", tone: "warning" as const },
  { value: "high", label: "High", tone: "danger" as const },
  { value: "unacceptable", label: "Unacceptable", tone: "danger" as const },
];

export default function CBImpartialityModule() {
  const [activeTab, setActiveTab] = useState<"risks" | "declarations" | "committee">("risks");
  const risks = useCBCollection("impartialityRisks");
  const declarations = useCBCollection("conflictDeclarations");
  const minutes = useCBCollection("committeeMinutes");

  const unmitigated = useMemo(() => risks.data.filter((r: any) => !r.mitigated).length, [risks.data]);

  const tabs: TabItem[] = [
    { key: "risks", label: "Risk register", icon: ShieldQuestion, count: risks.data.length },
    { key: "declarations", label: "Conflict declarations", icon: FileWarning, count: declarations.data.length },
    { key: "committee", label: "Impartiality committee", icon: UsersRound, count: minutes.data.length },
  ];

  return (
    <CBPageShell
      toolTitle="Impartiality"
      toolCodification="ISO/IEC 17021-1 · Clause 5.2"
      toolDescription="Identify, evaluate and treat threats to impartiality. Capture auditor conflict declarations and the safeguarding committee's oversight activities."
      clauseCodes={["5.2"]}
    >
      {unmitigated > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" />
          <span><strong>{unmitigated}</strong> unmitigated impartiality risk{unmitigated > 1 ? "s" : ""} require attention.</span>
        </div>
      )}
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "risks" && <RisksTab risks={risks} />}
        {activeTab === "declarations" && <DeclarationsTab decls={declarations} />}
        {activeTab === "committee" && <CommitteeTab minutes={minutes} />}
      </div>
    </CBPageShell>
  );
}

function RisksTab({ risks }: { risks: ReturnType<typeof useCBCollection<"impartialityRisks">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { threatType: "self_interest", riskLevel: "medium", mitigated: false, identifiedDate: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const save = () => {
    if (!form.description?.trim()) { toast.error("Description is required (§5.2.4)."); return; }
    if (form.riskLevel === "unacceptable" && !form.safeguard?.trim()) { toast.error("Unacceptable risks must have a safeguard or the activity cannot proceed."); return; }
    if (editing) risks.update(editing.id, form); else risks.add(form);
    toast.success("Impartiality risk recorded"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={risks.data}
        columns={[
          { key: "threat", header: "Threat", render: (r) => <CBStatusPill tone="brand" label={THREATS.find((t) => t.value === r.threatType)?.label ?? r.threatType} /> },
          { key: "desc", header: "Description", className: "max-w-md", render: (r) => <p className="text-sm line-clamp-2">{r.description}</p> },
          { key: "level", header: "Level", render: (r) => { const cfg = RISK_LEVELS.find((l) => l.value === r.riskLevel); return <CBStatusPill label={cfg?.label ?? r.riskLevel} tone={cfg?.tone ?? "neutral"} />; } },
          { key: "safeguard", header: "Safeguard", className: "max-w-xs", render: (r) => <p className="text-xs text-muted-foreground line-clamp-2">{r.safeguard || "—"}</p> },
          { key: "mit", header: "Status", render: (r) => <CBStatusPill label={r.mitigated ? "Mitigated" : "Open"} tone={r.mitigated ? "success" : "warning"} /> },
        ]}
        searchFields={["description", "safeguard"] as any}
        searchPlaceholder="Search impartiality risks…"
        filters={[
          { id: "threat", label: "Threat", options: [{ value: "all", label: "All" }, ...THREATS] },
          { id: "level", label: "Risk level", options: [{ value: "all", label: "All" }, ...RISK_LEVELS.map((l) => ({ value: l.value, label: l.label }))] },
        ]}
        filterPredicates={{ threat: (r, v) => r.threatType === v, level: (r, v) => r.riskLevel === v }}
        emptyTitle="No impartiality risks identified"
        emptyDescription="Identify and assess all threats to impartiality on an ongoing basis (§5.2.4)."
        primaryActionLabel="Identify risk"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => risks.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit impartiality risk" : "Identify impartiality risk"}
        clauseCodes={["5.2"]}
        description="Document threat type, source and treatment. Risks must be reviewed by the impartiality committee."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <CBFormSection title="Threat identification" clauseCode="5.2.4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Threat type" required>
              <Select value={form.threatType} onValueChange={(v) => setForm({ ...form, threatType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">{THREATS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </CBFormField>
            <CBFormField label="Identified on"><Input type="date" value={form.identifiedDate ?? ""} onChange={(e) => setForm({ ...form, identifiedDate: e.target.value })} /></CBFormField>
          </div>
          <CBFormField label="Description of threat" required><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Auditor previously delivered consultancy to client X during the past 2 years." /></CBFormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Related auditor"><Input value={form.relatedAuditor ?? ""} onChange={(e) => setForm({ ...form, relatedAuditor: e.target.value })} /></CBFormField>
            <CBFormField label="Related client"><Input value={form.relatedClient ?? ""} onChange={(e) => setForm({ ...form, relatedClient: e.target.value })} /></CBFormField>
          </div>
        </CBFormSection>

        <CBFormSection title="Evaluation & treatment" clauseCode="5.2.5">
          <CBFormField label="Risk level" required>
            <Select value={form.riskLevel} onValueChange={(v) => setForm({ ...form, riskLevel: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">{RISK_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Safeguard" hint="Mandatory if risk is unacceptable. E.g. exclude auditor from assignment, additional review, etc."><Textarea rows={3} value={form.safeguard ?? ""} onChange={(e) => setForm({ ...form, safeguard: e.target.value })} /></CBFormField>
          <CBFormField label="Mitigated?">
            <Select value={form.mitigated ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, mitigated: v === "yes" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="no">No — open</SelectItem>
                <SelectItem value="yes">Yes — safeguard implemented</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Reviewed by"><Input value={form.reviewedBy ?? ""} onChange={(e) => setForm({ ...form, reviewedBy: e.target.value })} /></CBFormField>
            <CBFormField label="Review date"><Input type="date" value={form.reviewDate ?? ""} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} /></CBFormField>
          </div>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}

function DeclarationsTab({ decls }: { decls: ReturnType<typeof useCBCollection<"conflictDeclarations">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { type: "no_conflict", date: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const save = () => {
    if (!form.auditor?.trim()) { toast.error("Auditor is required."); return; }
    if (editing) decls.update(editing.id, form); else decls.add(form);
    toast.success("Declaration recorded"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={decls.data}
        columns={[
          { key: "auditor", header: "Auditor", render: (r) => <span className="text-sm font-medium">{r.auditor}</span> },
          { key: "client", header: "Client", render: (r) => <span className="text-sm">{r.client || "General"}</span> },
          { key: "type", header: "Type", render: (r) => <CBStatusPill label={r.type} tone={r.type === "no_conflict" ? "success" : r.type === "conflict" ? "danger" : "warning"} /> },
          { key: "date", header: "Date", render: (r) => <span className="text-xs tabular-nums">{r.date}</span> },
          { key: "valid", header: "Valid until", render: (r) => <span className="text-xs tabular-nums">{r.validUntil || "—"}</span> },
        ]}
        searchFields={["auditor", "client"] as any}
        searchPlaceholder="Search declarations…"
        emptyTitle="No conflict declarations"
        emptyDescription="Each auditor declares conflicts before assignment to a client (§5.2.6, 7.3)."
        primaryActionLabel="New declaration"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => decls.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit declaration" : "Auditor conflict declaration"}
        clauseCodes={["5.2.6", "7.3"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Auditor" required><Input value={form.auditor ?? ""} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></CBFormField>
          <CBFormField label="Client (optional)"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Type" required>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="no_conflict">No conflict declared</SelectItem>
                <SelectItem value="potential_conflict">Potential conflict</SelectItem>
                <SelectItem value="conflict">Conflict — must not be assigned</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Declaration date" required><Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></CBFormField>
          <CBFormField label="Valid until"><Input type="date" value={form.validUntil ?? ""} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></CBFormField>
        </div>
        <CBFormField label="Description (relationship, prior involvement, financial interest…)"><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function CommitteeTab({ minutes }: { minutes: ReturnType<typeof useCBCollection<"committeeMinutes">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : {}); setOpen(true); };
  const save = () => {
    if (!form.date || !form.members?.trim()) { toast.error("Date and members are required."); return; }
    if (editing) minutes.update(editing.id, form); else minutes.add(form);
    toast.success("Meeting minutes saved"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={minutes.data}
        columns={[
          { key: "date", header: "Date", render: (r) => <span className="text-sm tabular-nums">{r.date}</span> },
          { key: "members", header: "Members", className: "max-w-xs", render: (r) => <p className="text-xs line-clamp-1">{r.members}</p> },
          { key: "topics", header: "Topics", className: "max-w-md", render: (r) => <p className="text-sm line-clamp-2">{r.topics}</p> },
          { key: "decisions", header: "Decisions", className: "max-w-md", render: (r) => <p className="text-xs text-muted-foreground line-clamp-2">{r.decisions || "—"}</p> },
        ]}
        searchFields={["topics", "decisions"] as any}
        searchPlaceholder="Search minutes…"
        emptyTitle="No committee meetings recorded"
        emptyDescription="The impartiality committee oversees the CB's decisions on impartiality (§5.2.3)."
        primaryActionLabel="Log meeting"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => minutes.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit meeting" : "Log committee meeting"}
        clauseCodes={["5.2.3"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <CBFormField label="Meeting date" required><Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></CBFormField>
        <CBFormField label="Members present" required hint="Independent representation of interested parties (§5.2.3.b)."><Textarea rows={2} value={form.members ?? ""} onChange={(e) => setForm({ ...form, members: e.target.value })} /></CBFormField>
        <CBFormField label="Topics discussed"><Textarea rows={3} value={form.topics ?? ""} onChange={(e) => setForm({ ...form, topics: e.target.value })} /></CBFormField>
        <CBFormField label="Decisions taken"><Textarea rows={3} value={form.decisions ?? ""} onChange={(e) => setForm({ ...form, decisions: e.target.value })} /></CBFormField>
        <CBFormField label="Follow-up actions"><Textarea rows={2} value={form.actions ?? ""} onChange={(e) => setForm({ ...form, actions: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}
