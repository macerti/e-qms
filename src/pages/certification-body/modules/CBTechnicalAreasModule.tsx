import { useMemo, useState } from "react";
import { Layers, Users } from "lucide-react";
import { CBPageShell } from "@/components/certification-body/CBPageShell";
import { CBRecordList, type CBColumn } from "@/components/certification-body/CBRecordList";
import { CBRecordDrawer } from "@/components/certification-body/CBRecordDrawer";
import { CBFormField } from "@/components/certification-body/CBFormField";
import { CBStatusPill } from "@/components/certification-body/CBStatusPill";
import { TabLayout, type TabItem } from "@/ui/components/TabLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCBCollection } from "@/domains/certification-body/cbStore";
import { IAF_SECTORS } from "@/domains/certification-body/iafSectors";
import { toast } from "sonner";

export default function CBTechnicalAreasModule() {
  const [activeTab, setActiveTab] = useState<"areas" | "matrix">("areas");
  const technicalAreas = useCBCollection("technicalAreas");
  const auditors = useCBCollection("auditors");

  const tabs: TabItem[] = [
    { key: "areas", label: "Technical areas", icon: Layers, count: technicalAreas.data.length },
    { key: "matrix", label: "Auditor matrix", icon: Users, count: auditors.data.length },
  ];

  return (
    <CBPageShell
      toolTitle="Technical Areas"
      toolCodification="IAF MD 5 · ISO/IEC 17021-1 §7"
      toolDescription="Define the technical areas / IAF sectors the CB is competent for. Each area can be linked to qualified auditors and used to validate audit team assignments."
      clauseCodes={["7.2", "9.1.9"]}
    >
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as any)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "areas" && <AreasTab technicalAreas={technicalAreas} />}
        {activeTab === "matrix" && <MatrixTab technicalAreas={technicalAreas.data} auditors={auditors} />}
      </div>
    </CBPageShell>
  );
}

function AreasTab({ technicalAreas }: { technicalAreas: ReturnType<typeof useCBCollection<"technicalAreas">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const launch = (r: any | null = null) => {
    setEditing(r);
    setForm(r ? { ...r } : { status: "active" });
    setOpen(true);
  };
  const save = () => {
    if (!form.label?.trim()) { toast.error("Label is required."); return; }
    if (editing) technicalAreas.update(editing.id, form);
    else technicalAreas.add(form);
    toast.success("Technical area saved");
    setOpen(false);
  };

  const cols: CBColumn<any>[] = [
    { key: "iaf", header: "IAF", render: (r) => <span className="font-mono text-xs">{r.iafCode || "—"}</span> },
    { key: "label", header: "Technical area", render: (r) => <span className="text-sm font-medium">{r.label}</span> },
    { key: "family", header: "Family", render: (r) => <span className="text-xs text-muted-foreground">{r.family || "—"}</span> },
    { key: "criteria", header: "Competence criteria", className: "max-w-md", render: (r) => <p className="text-xs line-clamp-2">{r.competenceCriteria || "—"}</p> },
    { key: "status", header: "Status", render: (r) => <CBStatusPill label={r.status || "active"} tone={r.status === "active" ? "success" : "neutral"} /> },
  ];

  return (
    <>
      <CBRecordList
        records={technicalAreas.data}
        columns={cols}
        searchFields={["label", "iafCode", "family"] as any}
        searchPlaceholder="Search technical areas…"
        filters={[
          { id: "family", label: "Family", options: [{ value: "all", label: "All" }, ...uniqueFamilies(technicalAreas.data).map((f) => ({ value: f, label: f }))] },
          { id: "status", label: "Status", options: [{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "withdrawn", label: "Withdrawn" }] },
        ]}
        filterPredicates={{
          family: (r, v) => r.family === v,
          status: (r, v) => (r.status || "active") === v,
        }}
        emptyTitle="No technical areas defined"
        emptyDescription="Add IAF sectors / technical areas the CB is competent for. Used to validate scopes and auditor assignments."
        primaryActionLabel="New technical area"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => technicalAreas.remove(r.id)}
      />
      <CBRecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit technical area" : "New technical area"}
        clauseCodes={["7.2"]}
        description="Capture the IAF sector code, technical scope and the specific competence criteria required to audit it."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="IAF code">
            <Select value={form.iafCode ?? ""} onValueChange={(v) => {
              const s = IAF_SECTORS.find((x) => x.code === v);
              setForm({ ...form, iafCode: v, label: form.label || s?.label, family: form.family || s?.family });
            }}>
              <SelectTrigger><SelectValue placeholder="Select IAF…" /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                {IAF_SECTORS.map((s) => (
                  <SelectItem key={s.code} value={s.code}>IAF {s.code} · {s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Family">
            <Input value={form.family ?? ""} onChange={(e) => setForm({ ...form, family: e.target.value })} />
          </CBFormField>
        </div>
        <CBFormField label="Technical area label" required>
          <Input value={form.label ?? ""} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </CBFormField>
        <CBFormField label="Competence criteria" hint="Knowledge, qualifications and experience required.">
          <Textarea rows={3} value={form.competenceCriteria ?? ""} onChange={(e) => setForm({ ...form, competenceCriteria: e.target.value })} />
        </CBFormField>
        <CBFormField label="Status">
          <Select value={form.status ?? "active"} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-[60]">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function uniqueFamilies(rows: any[]): string[] {
  return Array.from(new Set(rows.map((r) => r.family).filter(Boolean)));
}

function MatrixTab({ technicalAreas, auditors }: { technicalAreas: any[]; auditors: ReturnType<typeof useCBCollection<"auditors">> }) {
  const areas = useMemo(() => technicalAreas, [technicalAreas]);

  const toggle = (auditor: any, areaCode: string) => {
    const set = new Set<string>(auditor.technicalAreas ?? []);
    if (set.has(areaCode)) set.delete(areaCode);
    else set.add(areaCode);
    auditors.update(auditor.id, { technicalAreas: Array.from(set) });
  };

  if (areas.length === 0 || auditors.data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
        <h3 className="text-base font-semibold">Matrix unavailable</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          You need at least one technical area and one auditor to map the competence matrix.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
      <table className="w-full text-xs border-separate border-spacing-0">
        <thead className="bg-muted/40">
          <tr>
            <th className="sticky left-0 bg-muted/40 px-3 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              Auditor
            </th>
            {areas.map((a) => (
              <th key={a.id} className="px-2 py-2 text-center font-semibold text-muted-foreground">
                <span className="font-mono">{a.iafCode || "—"}</span>
                <div className="text-[10px] font-normal opacity-70 max-w-[8rem] mx-auto truncate">{a.label}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {auditors.data.map((a: any) => (
            <tr key={a.id}>
              <td className="sticky left-0 bg-card border-t border-border/40 px-3 py-2 font-medium">{a.fullName}</td>
              {areas.map((area) => {
                const has = (a.technicalAreas ?? []).includes(area.iafCode || area.id);
                return (
                  <td key={area.id} className="border-t border-l border-border/40 p-1 text-center">
                    <button
                      onClick={() => toggle(a, area.iafCode || area.id)}
                      className={`mx-auto block h-6 w-6 rounded-md border transition-colors ${has ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border/60"}`}
                      aria-label={has ? "Qualified" : "Not qualified"}
                    >
                      {has ? "✓" : ""}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
