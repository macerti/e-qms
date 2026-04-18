import { useState } from "react";
import { MessageSquareWarning, Gavel, CheckCircle } from "lucide-react";
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

const COMPLAINT_STATUS = [
  { value: "received", label: "Received", tone: "info" as const },
  { value: "under_investigation", label: "Under investigation", tone: "warning" as const },
  { value: "resolved", label: "Resolved", tone: "success" as const },
  { value: "closed", label: "Closed", tone: "neutral" as const },
];

const APPEAL_STATUS = [
  { value: "filed", label: "Filed", tone: "info" as const },
  { value: "panel_review", label: "Panel review", tone: "warning" as const },
  { value: "decision_made", label: "Decision made", tone: "brand" as const },
  { value: "closed", label: "Closed", tone: "neutral" as const },
];

export default function CBComplaintsModule() {
  const [activeTab, setActiveTab] = useState<"complaints" | "appeals" | "resolutions">("complaints");
  const complaints = useCBCollection("complaints");
  const appeals = useCBCollection("appeals");
  const resolutions = useCBCollection("resolutions");

  const tabs: TabItem[] = [
    { key: "complaints", label: "Complaints", icon: MessageSquareWarning, count: complaints.data.length },
    { key: "appeals", label: "Appeals", icon: Gavel, count: appeals.data.length },
    { key: "resolutions", label: "Resolutions", icon: CheckCircle, count: resolutions.data.length },
  ];

  return (
    <CBPageShell
      toolTitle="Complaints & Appeals"
      toolCodification="ISO/IEC 17021-1 · Clauses 9.7–9.8"
      toolDescription="Receive, validate, investigate and resolve complaints and appeals impartially. Independent panels handle appeals to certification decisions."
      clauseCodes={["9.7", "9.8"]}
    >
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "complaints" && <ComplaintsTab complaints={complaints} />}
        {activeTab === "appeals" && <AppealsTab appeals={appeals} />}
        {activeTab === "resolutions" && <ResolutionsTab resolutions={resolutions} />}
      </div>
    </CBPageShell>
  );
}

function ComplaintsTab({ complaints }: { complaints: ReturnType<typeof useCBCollection<"complaints">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { status: "received", receivedDate: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const save = () => {
    if (!form.complainant?.trim() || !form.description?.trim()) { toast.error("Complainant and description are required (§9.8.1)."); return; }
    if (editing) complaints.update(editing.id, form); else complaints.add(form);
    toast.success("Complaint logged"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={complaints.data}
        columns={[
          { key: "ref", header: "Ref", render: (r) => <span className="font-mono text-xs">CMP-{String(r.id).slice(-5).toUpperCase()}</span> },
          { key: "complainant", header: "Complainant", render: (r) => <span className="text-sm font-medium">{r.complainant}</span> },
          { key: "subject", header: "Subject", className: "max-w-md", render: (r) => <p className="text-sm line-clamp-2">{r.description}</p> },
          { key: "received", header: "Received", render: (r) => <span className="text-xs tabular-nums">{r.receivedDate}</span> },
          { key: "status", header: "Status", render: (r) => { const cfg = COMPLAINT_STATUS.find((s) => s.value === r.status); return <CBStatusPill label={cfg?.label ?? r.status} tone={cfg?.tone ?? "neutral"} />; } },
        ]}
        searchFields={["complainant", "description"] as any}
        searchPlaceholder="Search complaints…"
        filters={[{ id: "status", label: "Status", options: [{ value: "all", label: "All" }, ...COMPLAINT_STATUS.map((s) => ({ value: s.value, label: s.label }))] }]}
        filterPredicates={{ status: (r, v) => r.status === v }}
        emptyTitle="No complaints"
        emptyDescription="The complaint handling process is publicly available and documented (§9.8)."
        primaryActionLabel="Log complaint"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => complaints.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit complaint" : "Log complaint"}
        clauseCodes={["9.8"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <CBFormSection title="Complaint intake" clauseCode="9.8.1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Complainant" required><Input value={form.complainant ?? ""} onChange={(e) => setForm({ ...form, complainant: e.target.value })} /></CBFormField>
            <CBFormField label="Related client"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
            <CBFormField label="Received date" required><Input type="date" value={form.receivedDate ?? ""} onChange={(e) => setForm({ ...form, receivedDate: e.target.value })} /></CBFormField>
            <CBFormField label="Channel">
              <Select value={form.channel ?? "email"} onValueChange={(v) => setForm({ ...form, channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  <SelectItem value="email">Email</SelectItem><SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="web">Web form</SelectItem><SelectItem value="post">Postal mail</SelectItem>
                </SelectContent>
              </Select>
            </CBFormField>
          </div>
          <CBFormField label="Description of complaint" required><Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></CBFormField>
        </CBFormSection>
        <CBFormSection title="Investigation" clauseCode="9.8.4">
          <CBFormField label="Assigned to (independent of subject)"><Input value={form.assignedTo ?? ""} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></CBFormField>
          <CBFormField label="Investigation summary"><Textarea rows={3} value={form.investigation ?? ""} onChange={(e) => setForm({ ...form, investigation: e.target.value })} /></CBFormField>
          <CBFormField label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">{COMPLAINT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Resolution"><Textarea rows={3} value={form.resolution ?? ""} onChange={(e) => setForm({ ...form, resolution: e.target.value })} /></CBFormField>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}

function AppealsTab({ appeals }: { appeals: ReturnType<typeof useCBCollection<"appeals">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { status: "filed", filedDate: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const save = () => {
    if (!form.client?.trim() || !form.description?.trim()) { toast.error("Client and description are required (§9.7)."); return; }
    if (editing) appeals.update(editing.id, form); else appeals.add(form);
    toast.success("Appeal recorded"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={appeals.data}
        columns={[
          { key: "ref", header: "Ref", render: (r) => <span className="font-mono text-xs">APP-{String(r.id).slice(-5).toUpperCase()}</span> },
          { key: "client", header: "Client", render: (r) => <span className="text-sm font-medium">{r.client}</span> },
          { key: "decision", header: "Related decision", render: (r) => <span className="text-sm">{r.relatedDecision || "—"}</span> },
          { key: "filed", header: "Filed", render: (r) => <span className="text-xs tabular-nums">{r.filedDate}</span> },
          { key: "status", header: "Status", render: (r) => { const cfg = APPEAL_STATUS.find((s) => s.value === r.status); return <CBStatusPill label={cfg?.label ?? r.status} tone={cfg?.tone ?? "neutral"} />; } },
        ]}
        searchFields={["client", "description"] as any}
        searchPlaceholder="Search appeals…"
        filters={[{ id: "status", label: "Status", options: [{ value: "all", label: "All" }, ...APPEAL_STATUS.map((s) => ({ value: s.value, label: s.label }))] }]}
        filterPredicates={{ status: (r, v) => r.status === v }}
        emptyTitle="No appeals"
        emptyDescription="Appeals against certification decisions are handled by an independent panel (§9.7.2)."
        primaryActionLabel="File appeal"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => appeals.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit appeal" : "File appeal"}
        clauseCodes={["9.7"]}
        description="Panel members must be independent of the original certification decision."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Client" required><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Related decision"><Input value={form.relatedDecision ?? ""} onChange={(e) => setForm({ ...form, relatedDecision: e.target.value })} /></CBFormField>
          <CBFormField label="Filed date"><Input type="date" value={form.filedDate ?? ""} onChange={(e) => setForm({ ...form, filedDate: e.target.value })} /></CBFormField>
          <CBFormField label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">{APPEAL_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </CBFormField>
        </div>
        <CBFormField label="Grounds of appeal" required><Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></CBFormField>
        <CBFormField label="Independent panel members" clauseCode="9.7.2"><Textarea rows={2} value={form.panelMembers ?? ""} onChange={(e) => setForm({ ...form, panelMembers: e.target.value })} /></CBFormField>
        <CBFormField label="Panel decision"><Textarea rows={3} value={form.panelDecision ?? ""} onChange={(e) => setForm({ ...form, panelDecision: e.target.value })} /></CBFormField>
        <CBFormField label="Panel decision date"><Input type="date" value={form.panelDecisionDate ?? ""} onChange={(e) => setForm({ ...form, panelDecisionDate: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function ResolutionsTab({ resolutions }: { resolutions: ReturnType<typeof useCBCollection<"resolutions">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { type: "complaint" }); setOpen(true); };
  const save = () => {
    if (!form.reference?.trim() || !form.resolution?.trim()) { toast.error("Reference and resolution are required."); return; }
    if (editing) resolutions.update(editing.id, form); else resolutions.add(form);
    toast.success("Resolution logged"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={resolutions.data}
        columns={[
          { key: "ref", header: "Reference", render: (r) => <span className="font-mono text-xs">{r.reference}</span> },
          { key: "type", header: "Type", render: (r) => <CBStatusPill tone="brand" label={r.type} /> },
          { key: "res", header: "Resolution", className: "max-w-md", render: (r) => <p className="text-sm line-clamp-2">{r.resolution}</p> },
          { key: "date", header: "Date", render: (r) => <span className="text-xs tabular-nums">{r.date}</span> },
          { key: "follow", header: "Follow-up", render: (r) => <span className="text-xs">{r.followUp || "—"}</span> },
        ]}
        searchFields={["reference", "resolution"] as any}
        searchPlaceholder="Search resolutions…"
        emptyTitle="No resolutions logged"
        emptyDescription="Track every resolution and any follow-up corrective actions."
        primaryActionLabel="Log resolution"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => resolutions.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit resolution" : "Log resolution"}
        clauseCodes={["9.7", "9.8"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Reference" required><Input value={form.reference ?? ""} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="CMP-XXXXX or APP-XXXXX" /></CBFormField>
          <CBFormField label="Type">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="appeal">Appeal</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Date"><Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></CBFormField>
        </div>
        <CBFormField label="Resolution" required><Textarea rows={4} value={form.resolution ?? ""} onChange={(e) => setForm({ ...form, resolution: e.target.value })} /></CBFormField>
        <CBFormField label="Follow-up actions"><Textarea rows={2} value={form.followUp ?? ""} onChange={(e) => setForm({ ...form, followUp: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}
