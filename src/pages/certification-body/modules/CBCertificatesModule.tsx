import { useState } from "react";
import { Award, ShieldAlert, Scale, Globe } from "lucide-react";
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
import { validateDecisionIndependence } from "@/domains/certification-body/cbLifecycle";
import { toast } from "sonner";

const CERT_STATUSES = [
  { value: "active", label: "Active", tone: "success" as const },
  { value: "suspended", label: "Suspended", tone: "warning" as const },
  { value: "withdrawn", label: "Withdrawn", tone: "danger" as const },
  { value: "expired", label: "Expired", tone: "neutral" as const },
];

const DECISION_OUTCOMES = [
  { value: "grant", label: "Grant" },
  { value: "maintain", label: "Maintain" },
  { value: "renew", label: "Renew" },
  { value: "suspend", label: "Suspend" },
  { value: "withdraw", label: "Withdraw" },
  { value: "refuse", label: "Refuse" },
];

export default function CBCertificatesModule() {
  const [activeTab, setActiveTab] = useState<"active" | "suspended" | "decisions" | "directory">("active");
  const certs = useCBCollection("certificates");
  const decisions = useCBCollection("decisions");

  const active = certs.data.filter((c: any) => c.status === "active");
  const suspended = certs.data.filter((c: any) => c.status === "suspended" || c.status === "withdrawn");
  const directory = certs.data.filter((c: any) => c.publicListing !== false);

  const tabs: TabItem[] = [
    { key: "active", label: "Active", icon: Award, count: active.length },
    { key: "suspended", label: "Suspended / Withdrawn", icon: ShieldAlert, count: suspended.length },
    { key: "decisions", label: "Decisions", icon: Scale, count: decisions.data.length },
    { key: "directory", label: "Public directory", icon: Globe, count: directory.length },
  ];

  return (
    <CBPageShell
      toolTitle="Certificates"
      toolCodification="ISO/IEC 17021-1 · Clauses 8.2, 8.4, 9.5"
      toolDescription="Issue, suspend, withdraw and renew certificates. The independent decision is logged here, certificates are generated and the public directory is kept up to date."
      clauseCodes={["8.2", "8.4", "8.5", "9.5"]}
    >
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "active" && <CertificatesTab certs={certs} filter={(c) => c.status === "active"} title="active" />}
        {activeTab === "suspended" && <CertificatesTab certs={certs} filter={(c) => c.status === "suspended" || c.status === "withdrawn"} title="suspended/withdrawn" />}
        {activeTab === "decisions" && <DecisionsTab decisions={decisions} />}
        {activeTab === "directory" && <DirectoryTab certs={directory} />}
      </div>
    </CBPageShell>
  );
}

function CertificatesTab({ certs, filter, title }: { certs: ReturnType<typeof useCBCollection<"certificates">>; filter: (c: any) => boolean; title: string }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { status: "active", publicListing: true }); setOpen(true); };
  const save = () => {
    if (!form.client?.trim() || !form.certificateNumber?.trim() || !form.issueDate || !form.expiryDate) { toast.error("Client, certificate number, issue and expiry dates are required (§8.2.2)."); return; }
    if (editing) certs.update(editing.id, form); else certs.add(form);
    toast.success("Certificate saved"); setOpen(false);
  };

  const cols: CBColumn<any>[] = [
    { key: "num", header: "Certificate #", render: (r) => <span className="font-mono text-xs font-semibold">{r.certificateNumber}</span> },
    { key: "client", header: "Client", render: (r) => <span className="text-sm font-medium">{r.client}</span> },
    { key: "std", header: "Standard", render: (r) => <span className="text-xs">{r.standardId}</span> },
    { key: "issued", header: "Issued", render: (r) => <span className="text-xs tabular-nums">{r.issueDate}</span> },
    { key: "expires", header: "Expires", render: (r) => <span className="text-xs tabular-nums">{r.expiryDate}</span> },
    { key: "status", header: "Status", render: (r) => { const cfg = CERT_STATUSES.find((s) => s.value === r.status); return <CBStatusPill label={cfg?.label ?? r.status} tone={cfg?.tone ?? "neutral"} />; } },
  ];

  return (
    <>
      <CBRecordList
        records={certs.data.filter(filter)}
        columns={cols}
        searchFields={["client", "certificateNumber"] as any}
        searchPlaceholder="Search certificates…"
        filters={[{ id: "status", label: "Status", options: [{ value: "all", label: "All" }, ...CERT_STATUSES.map((s) => ({ value: s.value, label: s.label }))] }]}
        filterPredicates={{ status: (r, v) => r.status === v }}
        emptyTitle={`No ${title} certificates`}
        emptyDescription="Issue certificates after a positive certification decision (§8.2)."
        primaryActionLabel="Issue certificate"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => certs.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit certificate" : "Issue certificate"}
        clauseCodes={["8.2", "8.4"]}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <CBFormSection title="Certificate identification" clauseCode="8.2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Certificate number" required><Input value={form.certificateNumber ?? ""} onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })} /></CBFormField>
            <CBFormField label="Client" required><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
            <CBFormField label="Standard"><Input value={form.standardId ?? ""} onChange={(e) => setForm({ ...form, standardId: e.target.value })} placeholder="ISO 9001:2015" /></CBFormField>
            <CBFormField label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">{CERT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </CBFormField>
            <CBFormField label="Issue date" required><Input type="date" value={form.issueDate ?? ""} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></CBFormField>
            <CBFormField label="Expiry date" required hint="Typically 3 years from issuance."><Input type="date" value={form.expiryDate ?? ""} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></CBFormField>
          </div>
          <CBFormField label="Scope statement on certificate" required clauseCode="8.2.2"><Textarea rows={3} value={form.scopeStatement ?? ""} onChange={(e) => setForm({ ...form, scopeStatement: e.target.value })} /></CBFormField>
        </CBFormSection>

        {form.status === "suspended" && (
          <CBFormSection title="Suspension details">
            <CBFormField label="Suspension date"><Input type="date" value={form.suspensionDate ?? ""} onChange={(e) => setForm({ ...form, suspensionDate: e.target.value })} /></CBFormField>
            <CBFormField label="Reason"><Textarea rows={2} value={form.suspensionReason ?? ""} onChange={(e) => setForm({ ...form, suspensionReason: e.target.value })} /></CBFormField>
          </CBFormSection>
        )}

        {form.status === "withdrawn" && (
          <CBFormSection title="Withdrawal details">
            <CBFormField label="Withdrawal date"><Input type="date" value={form.withdrawalDate ?? ""} onChange={(e) => setForm({ ...form, withdrawalDate: e.target.value })} /></CBFormField>
            <CBFormField label="Reason"><Textarea rows={2} value={form.withdrawalReason ?? ""} onChange={(e) => setForm({ ...form, withdrawalReason: e.target.value })} /></CBFormField>
          </CBFormSection>
        )}

        <CBFormSection title="Surveillance schedule" clauseCode="9.6.2">
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Last surveillance"><Input type="date" value={form.lastSurveillanceDate ?? ""} onChange={(e) => setForm({ ...form, lastSurveillanceDate: e.target.value })} /></CBFormField>
            <CBFormField label="Next surveillance"><Input type="date" value={form.nextSurveillanceDate ?? ""} onChange={(e) => setForm({ ...form, nextSurveillanceDate: e.target.value })} /></CBFormField>
          </div>
        </CBFormSection>

        <CBFormSection title="Public directory" clauseCode="8.4">
          <CBFormField label="Listed publicly?">
            <Select value={form.publicListing ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, publicListing: v === "yes" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="yes">Yes — display in public directory</SelectItem>
                <SelectItem value="no">No — confidential listing</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}

function DecisionsTab({ decisions }: { decisions: ReturnType<typeof useCBCollection<"decisions">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { outcome: "grant" }); setOpen(true); };
  const save = () => {
    if (!form.client?.trim() || !form.decisionMaker?.trim() || !form.justification?.trim()) { toast.error("Client, decision maker and justification are required (§9.5)."); return; }
    const team: string[] = (form.auditTeam ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const violation = validateDecisionIndependence(form.decisionMaker, team);
    if (violation) { toast.error(violation); return; }
    if (editing) decisions.update(editing.id, form); else decisions.add(form);
    toast.success("Certification decision logged"); setOpen(false);
  };

  return (
    <>
      <CBRecordList
        records={decisions.data}
        columns={[
          { key: "client", header: "Client", render: (r) => <span className="text-sm font-medium">{r.client}</span> },
          { key: "type", header: "Decision type", render: (r) => <span className="text-sm">{r.decisionType || "Initial"}</span> },
          { key: "maker", header: "Decision maker", render: (r) => <span className="text-sm">{r.decisionMaker}</span> },
          { key: "outcome", header: "Outcome", render: (r) => <CBStatusPill label={r.outcome} tone={r.outcome === "grant" || r.outcome === "renew" || r.outcome === "maintain" ? "success" : r.outcome === "refuse" || r.outcome === "withdraw" ? "danger" : "warning"} /> },
          { key: "date", header: "Date", render: (r) => <span className="text-xs tabular-nums">{r.decisionDate}</span> },
        ]}
        searchFields={["client", "decisionMaker"] as any}
        searchPlaceholder="Search decisions…"
        emptyTitle="No certification decisions"
        emptyDescription="Independent persons not involved in the audit make and document the certification decision (§9.5)."
        primaryActionLabel="Log decision"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => decisions.remove(r.id)}
      />
      <CBRecordDrawer open={open} onOpenChange={setOpen}
        title={editing ? "Edit decision" : "Log certification decision"}
        clauseCodes={["9.5"]}
        description="Decision maker must NOT have been part of the audit team. The system enforces independence."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Client" required><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Decision type">
            <Select value={form.decisionType ?? "initial"} onValueChange={(v) => setForm({ ...form, decisionType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="initial">Initial</SelectItem>
                <SelectItem value="surveillance">Surveillance</SelectItem>
                <SelectItem value="recertification">Recertification</SelectItem>
                <SelectItem value="scope_change">Scope change</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Decision maker" required clauseCode="9.5"><Input value={form.decisionMaker ?? ""} onChange={(e) => setForm({ ...form, decisionMaker: e.target.value })} /></CBFormField>
          <CBFormField label="Decision date" required><Input type="date" value={form.decisionDate ?? ""} onChange={(e) => setForm({ ...form, decisionDate: e.target.value })} /></CBFormField>
        </div>
        <CBFormField label="Audit team (comma separated)" hint="Used to enforce decision-maker independence."><Input value={form.auditTeam ?? ""} onChange={(e) => setForm({ ...form, auditTeam: e.target.value })} /></CBFormField>
        <CBFormField label="Outcome" required>
          <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-[60]">{DECISION_OUTCOMES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
          </Select>
        </CBFormField>
        <CBFormField label="Justification" required hint="Reference audit report, NCs closed, evidence reviewed."><Textarea rows={4} value={form.justification ?? ""} onChange={(e) => setForm({ ...form, justification: e.target.value })} /></CBFormField>
        <CBFormField label="Conditions / restrictions"><Textarea rows={2} value={form.conditions ?? ""} onChange={(e) => setForm({ ...form, conditions: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function DirectoryTab({ certs }: { certs: any[] }) {
  const cols: CBColumn<any>[] = [
    { key: "client", header: "Organisation", render: (r) => <span className="text-sm font-medium">{r.client}</span> },
    { key: "num", header: "Certificate", render: (r) => <span className="font-mono text-xs">{r.certificateNumber}</span> },
    { key: "std", header: "Standard", render: (r) => <span className="text-xs">{r.standardId}</span> },
    { key: "scope", header: "Scope", className: "max-w-md", render: (r) => <p className="text-sm line-clamp-2">{r.scopeStatement}</p> },
    { key: "valid", header: "Valid until", render: (r) => <span className="text-xs tabular-nums">{r.expiryDate}</span> },
    { key: "status", header: "Status", render: (r) => { const cfg = CERT_STATUSES.find((s) => s.value === r.status); return <CBStatusPill label={cfg?.label ?? r.status} tone={cfg?.tone ?? "neutral"} />; } },
  ];

  return (
    <CBRecordList
      records={certs}
      columns={cols}
      searchFields={["client", "certificateNumber", "scopeStatement"] as any}
      searchPlaceholder="Search public directory…"
      filters={[{ id: "status", label: "Status", options: [{ value: "all", label: "All" }, ...CERT_STATUSES.map((s) => ({ value: s.value, label: s.label }))] }]}
      filterPredicates={{ status: (r, v) => r.status === v }}
      emptyTitle="No certificates listed publicly"
      emptyDescription="Toggle 'Listed publicly' on individual certificates to make them visible here (§8.4)."
    />
  );
}
