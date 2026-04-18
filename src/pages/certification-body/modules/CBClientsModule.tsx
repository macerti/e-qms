import { useState } from "react";
import { Building2, FileText, Target, Users } from "lucide-react";
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
import { IAF_SECTORS, formatIAF } from "@/domains/certification-body/iafSectors";
import { toast } from "sonner";

const STANDARDS = [
  { value: "iso9001", label: "ISO 9001 (QMS)" },
  { value: "iso14001", label: "ISO 14001 (EMS)" },
  { value: "iso45001", label: "ISO 45001 (OH&SMS)" },
];

const APPLICATION_STATUSES = [
  { value: "received", label: "Received", tone: "info" as const },
  { value: "under_review", label: "Under review", tone: "warning" as const },
  { value: "accepted", label: "Accepted", tone: "success" as const },
  { value: "rejected", label: "Rejected", tone: "danger" as const },
];

export default function CBClientsModule() {
  const [activeTab, setActiveTab] = useState<"applications" | "contracts" | "scopes">("applications");

  const apps = useCBCollection("clients");
  const contracts = useCBCollection("contracts");
  const scopes = useCBCollection("scopes");

  const tabs: TabItem[] = [
    { key: "applications", label: "Applications", icon: Building2, count: apps.data.length },
    { key: "contracts", label: "Active Contracts", icon: FileText, count: contracts.data.length },
    { key: "scopes", label: "Scope Definitions", icon: Target, count: scopes.data.length },
  ];

  return (
    <CBPageShell
      toolTitle="Clients & Contracts"
      toolCodification="ISO/IEC 17021-1 · Clauses 9.1.1–9.1.3 & 8.2"
      toolDescription="Capture every certification application, formalise contracts and define the precise scope per client — the foundation for impartial, traceable certification activities."
      clauseCodes={["9.1.2", "9.1.3", "8.2"]}
    >
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "applications" && <ApplicationsTab apps={apps} />}
        {activeTab === "contracts" && <ContractsTab contracts={contracts} />}
        {activeTab === "scopes" && <ScopesTab scopes={scopes} />}
      </div>
    </CBPageShell>
  );
}

// ─── Applications ───────────────────────────────────────────────────

function ApplicationsTab({ apps }: { apps: ReturnType<typeof useCBCollection<"clients">> }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(initialAppForm());

  function open(row: any | null = null) {
    setEditing(row);
    setForm(row ? { ...row } : initialAppForm());
    setDrawerOpen(true);
  }

  function save() {
    if (!form.name?.trim()) {
      toast.error("Client legal name is required (§9.1.2).");
      return;
    }
    if (editing) {
      apps.update(editing.id, form);
      toast.success("Application updated");
    } else {
      apps.add({ ...form, applicationStatus: form.applicationStatus || "received" });
      toast.success("Application registered");
    }
    setDrawerOpen(false);
  }

  const columns: CBColumn<any>[] = [
    { key: "name", header: "Client", render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.name}</div>
        {r.legalEntity && <div className="text-xs text-muted-foreground">{r.legalEntity}</div>}
      </div>
    )},
    { key: "country", header: "Country", render: (r) => <span className="text-sm">{r.country || "—"}</span> },
    { key: "sector", header: "IAF sector", render: (r) => (
      <span className="text-xs text-muted-foreground">{r.sector ? formatIAF(r.sector) : "—"}</span>
    )},
    { key: "size", header: "Employees", render: (r) => (
      <span className="text-sm tabular-nums">{r.employeeCount ?? "—"}</span>
    )},
    { key: "status", header: "Status", render: (r) => {
      const cfg = APPLICATION_STATUSES.find((s) => s.value === r.applicationStatus);
      return <CBStatusPill label={cfg?.label ?? r.applicationStatus} tone={cfg?.tone ?? "neutral"} />;
    }},
  ];

  return (
    <>
      <CBRecordList
        records={apps.data}
        columns={columns}
        searchPlaceholder="Search by name, legal entity…"
        searchFields={["name", "legalEntity", "country"] as any}
        filters={[
          { id: "status", label: "Status", options: [{ value: "all", label: "All" }, ...APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))] },
          { id: "sector", label: "Sector", options: [{ value: "all", label: "All" }, ...IAF_SECTORS.map((s) => ({ value: s.code, label: `IAF ${s.code}` }))] },
        ]}
        filterPredicates={{
          status: (r, v) => r.applicationStatus === v,
          sector: (r, v) => r.sector === v,
        }}
        emptyTitle="No applications yet"
        emptyDescription="Register your first certification application. The CB must review every application before contracting (§9.1.3)."
        primaryActionLabel="New application"
        onCreate={() => open(null)}
        onEdit={(r) => open(r)}
        onDelete={(r) => {
          apps.remove(r.id);
          toast.success("Application removed");
        }}
      />

      <CBRecordDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? "Edit application" : "Register new application"}
        description="Capture all information required by ISO/IEC 17021-1 §9.1.2 to determine scope, feasibility and audit time."
        clauseCodes={["9.1.2", "9.1.3"]}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Register"}</Button>
          </>
        }
      >
        <CBFormSection title="Client identification" clauseCode="9.1.2">
          <CBFormField label="Legal name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ACME Manufacturing Ltd." />
          </CBFormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Trading entity">
              <Input value={form.legalEntity ?? ""} onChange={(e) => setForm({ ...form, legalEntity: e.target.value })} />
            </CBFormField>
            <CBFormField label="Country">
              <Input value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </CBFormField>
          </div>
          <CBFormField label="Registered address">
            <Textarea rows={2} value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </CBFormField>
        </CBFormSection>

        <CBFormSection title="Primary contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Contact name">
              <Input value={form.contactName ?? ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            </CBFormField>
            <CBFormField label="Email">
              <Input type="email" value={form.contactEmail ?? ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </CBFormField>
          </div>
          <CBFormField label="Phone">
            <Input value={form.contactPhone ?? ""} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </CBFormField>
        </CBFormSection>

        <CBFormSection
          title="Activity & sector"
          description="Used to determine competence requirements and audit duration (§9.1.5, MD 5)."
          clauseCode="9.1.5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="IAF sector code" hint="Aligns with IAF MD 5 technical sectors.">
              <Select value={form.sector ?? ""} onValueChange={(v) => setForm({ ...form, sector: v })}>
                <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                <SelectContent className="bg-popover z-[60] max-h-72">
                  {IAF_SECTORS.map((s) => (
                    <SelectItem key={s.code} value={s.code}>IAF {s.code} · {s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CBFormField>
            <CBFormField label="Effective personnel" hint="FTE in scope — drives audit duration.">
              <Input type="number" min={0} value={form.employeeCount ?? ""} onChange={(e) => setForm({ ...form, employeeCount: Number(e.target.value) })} />
            </CBFormField>
          </div>
          <CBFormField label="Multi-site operation">
            <Select value={form.multiSite ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, multiSite: v === "yes" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="no">No — single site</SelectItem>
                <SelectItem value="yes">Yes — multi-site sampling required</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
        </CBFormSection>

        <CBFormSection title="Application review outcome" clauseCode="9.1.3">
          <CBFormField label="Status" required>
            <Select value={form.applicationStatus} onValueChange={(v) => setForm({ ...form, applicationStatus: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                {APPLICATION_STATUSES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Review notes" hint="Document feasibility, competence available and any ambiguities resolved.">
            <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </CBFormField>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}

function initialAppForm() {
  return { name: "", applicationStatus: "received", multiSite: false };
}

// ─── Contracts ──────────────────────────────────────────────────────

function ContractsTab({ contracts }: { contracts: ReturnType<typeof useCBCollection<"contracts">> }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  function open(row: any | null = null) {
    setEditing(row);
    setForm(row ? { ...row } : { status: "active" });
    setDrawerOpen(true);
  }

  function save() {
    if (!form.client?.trim() || !form.standardId) {
      toast.error("Client and standard are required.");
      return;
    }
    if (editing) contracts.update(editing.id, form);
    else contracts.add(form);
    toast.success("Contract saved");
    setDrawerOpen(false);
  }

  return (
    <>
      <CBRecordList
        records={contracts.data}
        columns={[
          { key: "client", header: "Client", render: (r) => <span className="font-medium text-sm">{r.client}</span> },
          { key: "standard", header: "Standard", render: (r) => <span className="text-sm">{STANDARDS.find((s) => s.value === r.standardId)?.label ?? r.standardId}</span> },
          { key: "start", header: "Start", render: (r) => <span className="text-sm tabular-nums">{r.startDate || "—"}</span> },
          { key: "renewal", header: "Renewal", render: (r) => <span className="text-sm tabular-nums">{r.renewalDate || "—"}</span> },
          { key: "status", header: "Status", render: (r) => <CBStatusPill label={r.status} tone={r.status === "active" ? "success" : r.status === "expired" ? "danger" : "warning"} /> },
        ]}
        searchFields={["client"] as any}
        searchPlaceholder="Search contracts…"
        filters={[{ id: "standard", label: "Standard", options: [{ value: "all", label: "All" }, ...STANDARDS] }]}
        filterPredicates={{ standard: (r, v) => r.standardId === v }}
        emptyTitle="No active contracts"
        emptyDescription="Formalise a certification agreement after the application has been accepted."
        primaryActionLabel="New contract"
        onCreate={() => open(null)}
        onEdit={(r) => open(r)}
        onDelete={(r) => contracts.remove(r.id)}
      />

      <CBRecordDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? "Edit contract" : "New certification contract"}
        clauseCodes={["8.2"]}
        footer={<><Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <CBFormField label="Client" required>
          <Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} />
        </CBFormField>
        <CBFormField label="Standard" required clauseCode="8.2">
          <Select value={form.standardId ?? ""} onValueChange={(v) => setForm({ ...form, standardId: v })}>
            <SelectTrigger><SelectValue placeholder="Pick a standard" /></SelectTrigger>
            <SelectContent className="bg-popover z-[60]">{STANDARDS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </CBFormField>
        <div className="grid grid-cols-2 gap-3">
          <CBFormField label="Start date"><Input type="date" value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></CBFormField>
          <CBFormField label="Renewal date"><Input type="date" value={form.renewalDate ?? ""} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} /></CBFormField>
        </div>
        <CBFormField label="Status">
          <Select value={form.status ?? "active"} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-[60]">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </CBFormField>
        <CBFormField label="Contract terms / annex">
          <Textarea rows={3} value={form.terms ?? ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} />
        </CBFormField>
      </CBRecordDrawer>
    </>
  );
}

// ─── Scopes ─────────────────────────────────────────────────────────

function ScopesTab({ scopes }: { scopes: ReturnType<typeof useCBCollection<"scopes">> }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ iafCodes: [] });

  function open(row: any | null = null) {
    setEditing(row);
    setForm(row ? { ...row } : { iafCodes: [], standardId: "iso9001" });
    setDrawerOpen(true);
  }

  function save() {
    if (!form.client?.trim() || !form.scopeStatement?.trim()) {
      toast.error("Client and scope statement are required (§8.2).");
      return;
    }
    if (editing) scopes.update(editing.id, form);
    else scopes.add(form);
    toast.success("Scope saved");
    setDrawerOpen(false);
  }

  function toggleIAF(code: string) {
    const current: string[] = form.iafCodes ?? [];
    setForm({ ...form, iafCodes: current.includes(code) ? current.filter((c) => c !== code) : [...current, code] });
  }

  return (
    <>
      <CBRecordList
        records={scopes.data}
        columns={[
          { key: "client", header: "Client", render: (r) => <span className="font-medium text-sm">{r.client}</span> },
          { key: "standard", header: "Standard", render: (r) => <span className="text-xs text-muted-foreground">{STANDARDS.find((s) => s.value === r.standardId)?.label ?? r.standardId}</span> },
          { key: "iaf", header: "IAF codes", render: (r) => (
            <div className="flex flex-wrap gap-1">{(r.iafCodes ?? []).map((c: string) => <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-[0.65rem] font-mono">{c}</span>)}</div>
          )},
          { key: "scope", header: "Scope statement", className: "max-w-md", render: (r) => <p className="text-sm leading-relaxed line-clamp-2">{r.scopeStatement}</p> },
          { key: "exclusions", header: "Exclusions", className: "max-w-xs", render: (r) => <p className="text-xs text-muted-foreground line-clamp-2">{r.exclusions || "—"}</p> },
        ]}
        searchFields={["client", "scopeStatement"] as any}
        searchPlaceholder="Search scopes…"
        filters={[{ id: "standard", label: "Standard", options: [{ value: "all", label: "All" }, ...STANDARDS] }]}
        filterPredicates={{ standard: (r, v) => r.standardId === v }}
        emptyTitle="No scopes defined"
        emptyDescription="Define the precise certification scope per client. Required to issue certification documents (§8.2)."
        primaryActionLabel="New scope"
        onCreate={() => open(null)}
        onEdit={(r) => open(r)}
        onDelete={(r) => scopes.remove(r.id)}
      />

      <CBRecordDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? "Edit scope" : "Define scope of certification"}
        description="The scope appears on the certificate and in the public directory. Be explicit and unambiguous."
        clauseCodes={["8.2", "8.4"]}
        footer={<><Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Client" required>
            <Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} />
          </CBFormField>
          <CBFormField label="Standard" required>
            <Select value={form.standardId} onValueChange={(v) => setForm({ ...form, standardId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">{STANDARDS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </CBFormField>
        </div>

        <CBFormField
          label="Scope statement"
          required
          clauseCode="8.2"
          hint="Describe the activities, products and services covered. Use the client's terminology."
        >
          <Textarea rows={4} value={form.scopeStatement ?? ""} onChange={(e) => setForm({ ...form, scopeStatement: e.target.value })} placeholder="Design, manufacture and after-sales support of industrial pumps." />
        </CBFormField>

        <CBFormField label="Exclusions & justification" hint="Any clauses excluded must be justified per the standard.">
          <Textarea rows={3} value={form.exclusions ?? ""} onChange={(e) => setForm({ ...form, exclusions: e.target.value })} />
        </CBFormField>

        <CBFormField label="IAF technical sectors" clauseCode="9.1.5" hint="Pick all sectors that apply. Drives auditor competence matching.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto rounded-lg border border-border/60 p-2 bg-background">
            {IAF_SECTORS.map((s) => {
              const active = (form.iafCodes ?? []).includes(s.code);
              return (
                <label key={s.code} className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs cursor-pointer transition-colors ${active ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  <input type="checkbox" checked={active} onChange={() => toggleIAF(s.code)} className="h-3.5 w-3.5 accent-primary" />
                  <span className="font-mono">{s.code}</span>
                  <span className="truncate">{s.label}</span>
                </label>
              );
            })}
          </div>
        </CBFormField>
      </CBRecordDrawer>
    </>
  );
}
