import { useState } from "react";
import { ClipboardList, FileCheck, AlertTriangle, Search, ShieldCheck, Activity } from "lucide-react";
import { CBPageShell } from "@/components/certification-body/CBPageShell";
import { CBStatTile, CBStatGrid } from "@/components/certification-body/CBStatTile";
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
import { validateDecisionIndependence } from "@/domains/certification-body/cbLifecycle";
import { toast } from "sonner";

const NC_GRADES = [
  { value: "major", label: "Major", tone: "danger" as const },
  { value: "minor", label: "Minor", tone: "warning" as const },
  { value: "observation", label: "Observation", tone: "info" as const },
];

const NC_STATUS = [
  { value: "open", label: "Open", tone: "warning" as const },
  { value: "correction_submitted", label: "Correction submitted", tone: "info" as const },
  { value: "verified_closed", label: "Verified & closed", tone: "success" as const },
  { value: "escalated", label: "Escalated", tone: "danger" as const },
];

export default function CBAuditsModule() {
  const [activeTab, setActiveTab] = useState<"active" | "reports" | "ncs" | "review">("active");
  const audits = useCBCollection("audits");
  const reports = useCBCollection("reports");
  const ncs = useCBCollection("ncs");
  const reviews = useCBCollection("reviews");

  const tabs: TabItem[] = [
    { key: "active", label: "Active audits", icon: ClipboardList, count: audits.data.filter((a: any) => a.stage !== "completed" && a.stage !== "cancelled").length },
    { key: "reports", label: "Audit reports", icon: FileCheck, count: reports.data.length },
    { key: "ncs", label: "Nonconformities", icon: AlertTriangle, count: ncs.data.filter((n: any) => n.status !== "verified_closed").length },
    { key: "review", label: "Technical review", icon: Search, count: reviews.data.length },
  ];

  return (
    <CBPageShell
      toolTitle="Audits"
      toolCodification="ISO/IEC 17021-1 · Clauses 9.2–9.4"
      toolDescription="Execute Stage 1 readiness reviews, Stage 2 implementation audits, surveillance and recertification — capture findings, manage nonconformities, then submit for technical review."
      clauseCodes={["9.2", "9.3", "9.4", "9.5"]}
    >
      <CBLifecycleStepper current="stage2_audit" className="mb-5" />

      <CBStatGrid className="mb-5">
        <CBStatTile label="In progress" value={audits.data.filter((a: any) => a.stage === "in_progress").length} icon={Activity} tone="primary" hint="Active fieldwork" />
        <CBStatTile label="Planned" value={audits.data.filter((a: any) => a.stage === "planned").length} icon={ClipboardList} tone="info" hint="Awaiting kickoff" />
        <CBStatTile label="Completed" value={audits.data.filter((a: any) => a.stage === "completed").length} icon={ShieldCheck} tone="success" hint="Closed audits" />
        <CBStatTile label="Open NCs" value={ncs.data.filter((n: any) => n.status !== "verified_closed").length} icon={AlertTriangle} tone="warning" hint="Need verification" />
        <CBStatTile label="Reports filed" value={reports.data.length} icon={FileCheck} tone="violet" hint="Drafted & reviewed" />
      </CBStatGrid>

      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "active" && <ActiveAuditsTab audits={audits} />}
        {activeTab === "reports" && <ReportsTab reports={reports} />}
        {activeTab === "ncs" && <NCsTab ncs={ncs} />}
        {activeTab === "review" && <ReviewTab reviews={reviews} />}
      </div>
    </CBPageShell>
  );
}

function ActiveAuditsTab({ audits }: { audits: ReturnType<typeof useCBCollection<"audits">> }) {
  const cols: CBColumn<any>[] = [
    { key: "client", header: "Client", render: (r) => <span className="font-medium text-sm">{r.client}</span> },
    { key: "type", header: "Type", render: (r) => <CBStatusPill tone="brand" label={r.auditType} /> },
    { key: "lead", header: "Lead", render: (r) => <span className="text-sm">{r.leadAuditor || "—"}</span> },
    { key: "start", header: "Start", render: (r) => <span className="text-xs tabular-nums">{r.plannedStart}</span> },
    { key: "stage", header: "Status", render: (r) => <CBStatusPill label={r.stage ?? "planned"} tone={r.stage === "completed" ? "success" : r.stage === "in_progress" ? "warning" : "info"} /> },
  ];
  const filtered = audits.data.filter((a: any) => a.stage !== "completed" && a.stage !== "cancelled");
  return (
    <CBRecordList
      records={filtered}
      columns={cols}
      searchFields={["client", "leadAuditor"] as any}
      searchPlaceholder="Search active audits…"
      emptyTitle="No active audits"
      emptyDescription="Schedule audits in Audit Programmes — they will appear here while in progress."
      onEdit={(r) => audits.update(r.id, { stage: r.stage === "planned" ? "in_progress" : "completed" }) as any}
    />
  );
}

function ReportsTab({ reports }: { reports: ReturnType<typeof useCBCollection<"reports">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : {}); setOpen(true); };
  const save = () => {
    if (!form.client?.trim() || !form.summary?.trim()) { toast.error("Client and summary are required (§9.4.8)."); return; }
    if (editing) reports.update(editing.id, form); else reports.add(form);
    toast.success("Audit report saved"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={reports.data}
        columns={[
          { key: "client", header: "Client", render: (r) => <span className="font-medium text-sm">{r.client}</span> },
          { key: "type", header: "Audit type", render: (r) => <span className="text-sm">{r.auditType}</span> },
          { key: "date", header: "Date", render: (r) => <span className="text-xs tabular-nums">{r.signoffDate || r.date}</span> },
          { key: "ncs", header: "NCs", render: (r) => <span className="text-sm tabular-nums">{r.ncCount ?? 0}</span> },
          { key: "concl", header: "Conclusion", render: (r) => <CBStatusPill label={r.conclusion || "draft"} tone={r.conclusion === "recommended" ? "success" : r.conclusion === "not_recommended" ? "danger" : "info"} /> },
        ]}
        searchFields={["client"] as any}
        searchPlaceholder="Search reports…"
        emptyTitle="No audit reports"
        emptyDescription="Audit reports document conclusions and feed the technical review (§9.4.8)."
        primaryActionLabel="New report"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => reports.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen} title={editing ? "Edit report" : "New audit report"} clauseCodes={["9.4.8", "9.4.9"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Client" required><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Audit type"><Input value={form.auditType ?? ""} onChange={(e) => setForm({ ...form, auditType: e.target.value })} /></CBFormField>
          <CBFormField label="Sign-off date"><Input type="date" value={form.signoffDate ?? ""} onChange={(e) => setForm({ ...form, signoffDate: e.target.value })} /></CBFormField>
          <CBFormField label="Conclusion">
            <Select value={form.conclusion ?? ""} onValueChange={(v) => setForm({ ...form, conclusion: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="recommended">Recommended for certification</SelectItem>
                <SelectItem value="conditional">Conditional — pending NC closure</SelectItem>
                <SelectItem value="not_recommended">Not recommended</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
        </div>
        <CBFormField label="Audit summary" required clauseCode="9.4.8"><Textarea rows={4} value={form.summary ?? ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></CBFormField>
        <CBFormField label="Strengths & opportunities"><Textarea rows={3} value={form.strengths ?? ""} onChange={(e) => setForm({ ...form, strengths: e.target.value })} /></CBFormField>
        <CBFormField label="Recommendations"><Textarea rows={3} value={form.recommendations ?? ""} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function NCsTab({ ncs }: { ncs: ReturnType<typeof useCBCollection<"ncs">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { grade: "minor", status: "open" }); setOpen(true); };
  const save = () => {
    if (!form.client?.trim() || !form.description?.trim() || !form.evidence?.trim()) { toast.error("Client, description and objective evidence are required (§9.4.9)."); return; }
    if (editing) ncs.update(editing.id, form); else ncs.add(form);
    toast.success("Nonconformity saved"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={ncs.data}
        columns={[
          { key: "ref", header: "Ref", render: (r) => <span className="font-mono text-xs">NC-{String(r.id).slice(-5).toUpperCase()}</span> },
          { key: "client", header: "Client", render: (r) => <span className="text-sm font-medium">{r.client}</span> },
          { key: "clause", header: "Clause", render: (r) => <span className="font-mono text-xs">{r.clause || "—"}</span> },
          { key: "grade", header: "Grade", render: (r) => { const cfg = NC_GRADES.find((g) => g.value === r.grade); return <CBStatusPill label={cfg?.label ?? r.grade} tone={cfg?.tone ?? "neutral"} />; } },
          { key: "desc", header: "Description", className: "max-w-md", render: (r) => <p className="text-sm line-clamp-2">{r.description}</p> },
          { key: "status", header: "Status", render: (r) => { const cfg = NC_STATUS.find((s) => s.value === r.status); return <CBStatusPill label={cfg?.label ?? r.status} tone={cfg?.tone ?? "neutral"} />; } },
        ]}
        searchFields={["client", "description", "clause"] as any}
        searchPlaceholder="Search nonconformities…"
        filters={[
          { id: "grade", label: "Grade", options: [{ value: "all", label: "All" }, ...NC_GRADES.map((g) => ({ value: g.value, label: g.label }))] },
          { id: "status", label: "Status", options: [{ value: "all", label: "All" }, ...NC_STATUS.map((s) => ({ value: s.value, label: s.label }))] },
        ]}
        filterPredicates={{ grade: (r, v) => r.grade === v, status: (r, v) => r.status === v }}
        emptyTitle="No nonconformities"
        emptyDescription="Record findings against specific clauses with objective evidence (§9.4.9)."
        primaryActionLabel="New NC"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => ncs.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit nonconformity" : "Raise nonconformity"}
        clauseCodes={["9.4.9", "9.4.10"]}
        description="Describe the requirement not met, present objective evidence, then track correction and verification."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <CBFormSection title="Finding" clauseCode="9.4.9">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CBFormField label="Client" required className="sm:col-span-2"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
            <CBFormField label="Clause"><Input value={form.clause ?? ""} onChange={(e) => setForm({ ...form, clause: e.target.value })} placeholder="e.g. 8.5.1" /></CBFormField>
          </div>
          <CBFormField label="Description of NC" required><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></CBFormField>
          <CBFormField label="Objective evidence" required hint="Records, observations, witness statements supporting the finding."><Textarea rows={3} value={form.evidence ?? ""} onChange={(e) => setForm({ ...form, evidence: e.target.value })} /></CBFormField>
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Grade">
              <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">{NC_GRADES.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
              </Select>
            </CBFormField>
            <CBFormField label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">{NC_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </CBFormField>
          </div>
        </CBFormSection>
        <CBFormSection title="Correction & root-cause" clauseCode="9.4.10">
          <CBFormField label="Root cause analysis"><Textarea rows={3} value={form.rootCause ?? ""} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} /></CBFormField>
          <CBFormField label="Correction & corrective action"><Textarea rows={3} value={form.correction ?? ""} onChange={(e) => setForm({ ...form, correction: e.target.value })} /></CBFormField>
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Correction deadline"><Input type="date" value={form.deadline ?? ""} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></CBFormField>
            <CBFormField label="Verified by"><Input value={form.verifiedBy ?? ""} onChange={(e) => setForm({ ...form, verifiedBy: e.target.value })} /></CBFormField>
          </div>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}

function ReviewTab({ reviews }: { reviews: ReturnType<typeof useCBCollection<"reviews">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { outcome: "pending" }); setOpen(true); };
  const save = () => {
    if (!form.client?.trim() || !form.reviewer?.trim()) { toast.error("Client and reviewer are required."); return; }
    const team: string[] = (form.auditTeam ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const violation = validateDecisionIndependence(form.reviewer, team);
    if (violation && form.outcome !== "pending") { toast.error(violation); return; }
    if (editing) reviews.update(editing.id, form); else reviews.add(form);
    toast.success("Technical review saved"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={reviews.data}
        columns={[
          { key: "client", header: "Client", render: (r) => <span className="text-sm font-medium">{r.client}</span> },
          { key: "reviewer", header: "Reviewer", render: (r) => <span className="text-sm">{r.reviewer}</span> },
          { key: "submitted", header: "Submitted", render: (r) => <span className="text-xs tabular-nums">{r.submittedDate || "—"}</span> },
          { key: "outcome", header: "Outcome", render: (r) => <CBStatusPill label={r.outcome ?? "pending"} tone={r.outcome === "approved" ? "success" : r.outcome === "rejected" ? "danger" : "info"} /> },
        ]}
        searchFields={["client", "reviewer"] as any}
        searchPlaceholder="Search technical reviews…"
        emptyTitle="No technical reviews pending"
        emptyDescription="Independent technical review precedes the certification decision (§9.5)."
        primaryActionLabel="Submit for review"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => reviews.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit technical review" : "Technical review"}
        clauseCodes={["9.5"]}
        description="Reviewer must NOT have been a member of the audit team. The system enforces this independence rule."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Client" required><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Reviewer" required clauseCode="9.5"><Input value={form.reviewer ?? ""} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} /></CBFormField>
        </div>
        <CBFormField label="Audit team (comma separated names/IDs)" hint="Used to enforce reviewer independence."><Input value={form.auditTeam ?? ""} onChange={(e) => setForm({ ...form, auditTeam: e.target.value })} /></CBFormField>
        <CBFormField label="Submitted date"><Input type="date" value={form.submittedDate ?? ""} onChange={(e) => setForm({ ...form, submittedDate: e.target.value })} /></CBFormField>
        <CBFormField label="Review summary"><Textarea rows={4} value={form.summary ?? ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></CBFormField>
        <CBFormField label="Outcome">
          <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-[60]">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved — proceed to decision</SelectItem>
              <SelectItem value="returned">Returned to audit team</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CBFormField>
      </CBRecordDrawer>
    </>
  );
}
