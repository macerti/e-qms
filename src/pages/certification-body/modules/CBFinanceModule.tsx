import { useMemo, useState } from "react";
import { Calculator, Receipt, FileText, Award, Settings2, BarChart3 } from "lucide-react";
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
import {
  CURRENCIES, type Currency, fmtMoney, fmtPercent,
  computeQuotation, annualOverheadTotal,
} from "@/domains/certification-body/cbFinance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TabKey = "quotations" | "invoices" | "feeNotes" | "accreditation" | "overheads" | "pnl";

export default function CBFinanceModule() {
  const [activeTab, setActiveTab] = useState<TabKey>("quotations");
  const quotations = useCBCollection("quotations");
  const invoices = useCBCollection("invoices");
  const feeNotes = useCBCollection("feeNotes");
  const accreditationFees = useCBCollection("accreditationFees");
  const overheadCosts = useCBCollection("overheadCosts");
  const auditors = useCBCollection("auditors");
  const allocations = useCBCollection("allocations");

  const tabs: TabItem[] = [
    { key: "quotations", label: "Quotations", icon: Calculator, count: quotations.data.length },
    { key: "invoices", label: "Invoices", icon: Receipt, count: invoices.data.length },
    { key: "feeNotes", label: "Fee notes", icon: FileText, count: feeNotes.data.length },
    { key: "accreditation", label: "Accreditation fees", icon: Award, count: accreditationFees.data.length },
    { key: "overheads", label: "Overheads", icon: Settings2, count: overheadCosts.data.length },
    { key: "pnl", label: "P&L", icon: BarChart3 },
  ];

  return (
    <CBPageShell
      toolTitle="Finance & P&L"
      toolCodification="Commercial · Subcontractor management"
      toolDescription="Quotations with margin & profit estimator, client invoices, auditor fee notes (notes d'honoraires), accreditation fee cost vs sell, overheads, and full P&L analytics."
      clauseCodes={[]}
    >
      <TabLayout activeTab={activeTab} onTabChange={(k) => setActiveTab(k as TabKey)} tabs={tabs} />
      <div className="mt-5">
        {activeTab === "quotations" && (
          <QuotationsTab quotations={quotations} overheads={overheadCosts.data} />
        )}
        {activeTab === "invoices" && <InvoicesTab invoices={invoices} />}
        {activeTab === "feeNotes" && <FeeNotesTab feeNotes={feeNotes} auditors={auditors.data} allocations={allocations.data} />}
        {activeTab === "accreditation" && <AccreditationTab accred={accreditationFees} />}
        {activeTab === "overheads" && <OverheadsTab overheads={overheadCosts} />}
        {activeTab === "pnl" && (
          <PnlTab
            invoices={invoices.data}
            feeNotes={feeNotes.data}
            accred={accreditationFees.data}
            overheads={overheadCosts.data}
            allocations={allocations.data}
          />
        )}
      </div>
    </CBPageShell>
  );
}

/* ───────────── Quotations (margin estimator) ───────────── */
function QuotationsTab({
  quotations,
  overheads,
}: {
  quotations: ReturnType<typeof useCBCollection<"quotations">>;
  overheads: any[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(blankQuote());
  const annualOverhead = annualOverheadTotal(overheads);

  const launch = (r: any | null = null) => {
    setEditing(r);
    setForm(r ? { ...blankQuote(), ...r } : blankQuote());
    setOpen(true);
  };

  const inputs = useMemo(() => ({
    lines: form.lines ?? [],
    accreditationCost: Number(form.accreditationCost) || 0,
    accreditationSell: Number(form.accreditationSell) || 0,
    travelCost: Number(form.travelCost) || 0,
    travelSell: Number(form.travelSell) || 0,
    otherIndirectCost: Number(form.otherIndirectCost) || 0,
    overheadAllocation: Number(form.overheadAllocation) || 0,
    discount: (Number(form.discountPct) || 0) / 100,
  }), [form]);
  const out = useMemo(() => computeQuotation(inputs), [inputs]);

  const save = () => {
    if (!form.client?.trim()) { toast.error("Client is required."); return; }
    const payload = { ...form, ...out };
    if (editing) quotations.update(editing.id, payload); else quotations.add(payload);
    toast.success("Quotation saved");
    setOpen(false);
  };

  const updateLine = (i: number, patch: any) => {
    const lines = [...(form.lines ?? [])];
    lines[i] = { ...lines[i], ...patch };
    setForm({ ...form, lines });
  };
  const addLine = () => setForm({ ...form, lines: [...(form.lines ?? []), { label: "Stage 2", mandays: 0, sellRate: 0, costRate: 0 }] });
  const removeLine = (i: number) => setForm({ ...form, lines: (form.lines ?? []).filter((_: any, idx: number) => idx !== i) });

  const cols: CBColumn<any>[] = [
    { key: "ref", header: "Ref", render: (r) => <span className="font-mono text-xs">QUO-{String(r.id).slice(-5).toUpperCase()}</span> },
    { key: "client", header: "Client", render: (r) => <span className="text-sm font-medium">{r.client}</span> },
    { key: "currency", header: "Cur.", render: (r) => <span className="text-xs font-mono">{r.currency || "EUR"}</span> },
    { key: "sell", header: "Sell", render: (r) => <span className="text-sm tabular-nums">{fmtMoney(r.totalSell, r.currency)}</span> },
    { key: "cost", header: "Total cost", render: (r) => <span className="text-sm tabular-nums">{fmtMoney(r.totalCost, r.currency)}</span> },
    { key: "profit", header: "Profit", render: (r) => <span className={cn("text-sm tabular-nums font-semibold", (r.netProfit ?? 0) >= 0 ? "text-success" : "text-destructive")}>{fmtMoney(r.netProfit, r.currency)}</span> },
    { key: "margin", header: "Net margin", render: (r) => <CBStatusPill tone={(r.netMarginPct ?? 0) > 0.2 ? "success" : (r.netMarginPct ?? 0) > 0 ? "warning" : "danger"} label={fmtPercent(r.netMarginPct)} /> },
    { key: "status", header: "Status", render: (r) => <CBStatusPill label={r.status || "draft"} tone={r.status === "won" ? "success" : r.status === "lost" ? "danger" : "info"} /> },
  ];

  return (
    <>
      <CBRecordList
        records={quotations.data}
        columns={cols}
        searchFields={["client"] as any}
        searchPlaceholder="Search quotations…"
        emptyTitle="No quotations yet"
        emptyDescription="Build a quotation with sell rates per manday, accreditation fees and overhead allocation — and see the profit/margin instantly."
        primaryActionLabel="New quotation"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => quotations.remove(r.id)}
      />
      <CBRecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit quotation" : "New quotation"}
        description="Sell prices on the left, costs on the right. Profit and margin update live."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save quotation</Button></>}
      >
        <CBFormSection title="Header">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CBFormField label="Client" required className="sm:col-span-2"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
            <CBFormField label="Currency"><CurrencySelect value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} /></CBFormField>
            <CBFormField label="Status">
              <Select value={form.status ?? "draft"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </CBFormField>
            <CBFormField label="Discount (%)"><Input type="number" min={0} max={100} step="0.5" value={form.discountPct ?? 0} onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })} /></CBFormField>
          </div>
        </CBFormSection>

        <CBFormSection title="Audit lines (sell vs cost rate per manday)">
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
              <div className="col-span-4">Label</div>
              <div className="col-span-2">Mandays</div>
              <div className="col-span-2">Sell rate</div>
              <div className="col-span-2">Cost rate</div>
              <div className="col-span-2 text-right">Margin</div>
            </div>
            {(form.lines ?? []).map((l: any, i: number) => {
              const sell = (l.mandays || 0) * (l.sellRate || 0);
              const cost = (l.mandays || 0) * (l.costRate || 0);
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-center rounded-lg border border-border/60 bg-card/60 p-2">
                  <Input className="col-span-12 sm:col-span-4 h-9" placeholder="Stage 2 audit" value={l.label} onChange={(e) => updateLine(i, { label: e.target.value })} />
                  <Input className="col-span-3 sm:col-span-2 h-9" type="number" min={0} step="0.5" value={l.mandays} onChange={(e) => updateLine(i, { mandays: Number(e.target.value) })} />
                  <Input className="col-span-3 sm:col-span-2 h-9" type="number" min={0} step="10" value={l.sellRate} onChange={(e) => updateLine(i, { sellRate: Number(e.target.value) })} />
                  <Input className="col-span-3 sm:col-span-2 h-9" type="number" min={0} step="10" value={l.costRate} onChange={(e) => updateLine(i, { costRate: Number(e.target.value) })} />
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                    <span className={cn("text-xs tabular-nums", sell - cost >= 0 ? "text-success" : "text-destructive")}>{fmtMoney(sell - cost, form.currency)}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeLine(i)} aria-label="Remove">×</Button>
                  </div>
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={addLine}>+ Add line</Button>
          </div>
        </CBFormSection>

        <CBFormSection title="Accreditation & travel">
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Accreditation cost" hint="What you pay accreditation body."><Input type="number" min={0} value={form.accreditationCost ?? 0} onChange={(e) => setForm({ ...form, accreditationCost: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Accreditation sell" hint="What you re-bill the client."><Input type="number" min={0} value={form.accreditationSell ?? 0} onChange={(e) => setForm({ ...form, accreditationSell: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Travel cost"><Input type="number" min={0} value={form.travelCost ?? 0} onChange={(e) => setForm({ ...form, travelCost: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Travel sell"><Input type="number" min={0} value={form.travelSell ?? 0} onChange={(e) => setForm({ ...form, travelSell: Number(e.target.value) })} /></CBFormField>
          </div>
        </CBFormSection>

        <CBFormSection title="Indirect costs" description={`Annual overhead pool (informational): ${fmtMoney(annualOverhead, form.currency)}`}>
          <div className="grid grid-cols-2 gap-3">
            <CBFormField label="Overhead allocation" hint="Salaries, rent, software amortised on this audit."><Input type="number" min={0} value={form.overheadAllocation ?? 0} onChange={(e) => setForm({ ...form, overheadAllocation: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Other indirect cost"><Input type="number" min={0} value={form.otherIndirectCost ?? 0} onChange={(e) => setForm({ ...form, otherIndirectCost: Number(e.target.value) })} /></CBFormField>
          </div>
        </CBFormSection>

        <CBFormSection title="Live result">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Total sell" value={fmtMoney(out.totalSell, form.currency)} />
            <Stat label="Direct cost" value={fmtMoney(out.totalDirectCost, form.currency)} />
            <Stat label="Indirect cost" value={fmtMoney(out.totalIndirectCost, form.currency)} />
            <Stat label="Total cost" value={fmtMoney(out.totalCost, form.currency)} />
            <Stat label="Gross margin" value={fmtMoney(out.grossMargin, form.currency)} tone={out.grossMargin >= 0 ? "success" : "danger"} />
            <Stat label="Gross %" value={fmtPercent(out.marginPct)} tone={out.marginPct > 0.2 ? "success" : "warning"} />
            <Stat label="Net profit" value={fmtMoney(out.netProfit, form.currency)} tone={out.netProfit >= 0 ? "success" : "danger"} />
            <Stat label="Net margin %" value={fmtPercent(out.netMarginPct)} tone={out.netMarginPct > 0.15 ? "success" : out.netMarginPct > 0 ? "warning" : "danger"} />
          </div>
        </CBFormSection>

        <CBFormField label="Notes"><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}

function blankQuote() {
  return {
    currency: "EUR",
    status: "draft",
    discountPct: 0,
    lines: [
      { label: "Stage 1", mandays: 1, sellRate: 1200, costRate: 600 },
      { label: "Stage 2", mandays: 3, sellRate: 1200, costRate: 600 },
    ],
    accreditationCost: 0,
    accreditationSell: 0,
    travelCost: 0, travelSell: 0,
    overheadAllocation: 0, otherIndirectCost: 0,
  };
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "danger" | "info" }) {
  const toneCls =
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning" :
    tone === "danger" ? "text-destructive" :
    "text-foreground";
  return (
    <div className="rounded-lg border border-border/60 bg-background/80 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-sm font-semibold tabular-nums mt-1", toneCls)}>{value}</div>
    </div>
  );
}

function CurrencySelect({ value, onChange }: { value?: string; onChange: (v: Currency) => void }) {
  return (
    <Select value={value ?? "EUR"} onValueChange={(v) => onChange(v as Currency)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent className="bg-popover z-[60]">
        {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/* ───────────── Invoices ───────────── */
function InvoicesTab({ invoices }: { invoices: ReturnType<typeof useCBCollection<"invoices">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(blankInvoice());

  const launch = (r: any | null = null) => {
    setEditing(r);
    setForm(r ? { ...blankInvoice(), ...r } : blankInvoice());
    setOpen(true);
  };
  const total = useMemo(() => (form.lines ?? []).reduce((s: number, l: any) => s + (l.qty || 0) * (l.unitPrice || 0), 0), [form]);
  const save = () => {
    if (!form.client?.trim()) { toast.error("Client is required."); return; }
    const payload = { ...form, total };
    if (editing) invoices.update(editing.id, payload); else invoices.add(payload);
    toast.success("Invoice saved"); setOpen(false);
  };
  const updateLine = (i: number, patch: any) => {
    const lines = [...(form.lines ?? [])]; lines[i] = { ...lines[i], ...patch }; setForm({ ...form, lines });
  };

  const cols: CBColumn<any>[] = [
    { key: "ref", header: "Ref", render: (r) => <span className="font-mono text-xs">{r.invoiceNo || `INV-${String(r.id).slice(-5).toUpperCase()}`}</span> },
    { key: "client", header: "Client", render: (r) => <span className="text-sm font-medium">{r.client}</span> },
    { key: "issued", header: "Issued", render: (r) => <span className="text-xs tabular-nums">{r.issueDate || "—"}</span> },
    { key: "due", header: "Due", render: (r) => <span className="text-xs tabular-nums">{r.dueDate || "—"}</span> },
    { key: "total", header: "Total", render: (r) => <span className="text-sm tabular-nums">{fmtMoney(r.total, r.currency)}</span> },
    { key: "status", header: "Status", render: (r) => <CBStatusPill label={r.status || "draft"} tone={r.status === "paid" ? "success" : r.status === "overdue" ? "danger" : "info"} /> },
  ];

  return (
    <>
      <CBRecordList
        records={invoices.data}
        columns={cols}
        searchFields={["client", "invoiceNo"] as any}
        searchPlaceholder="Search invoices…"
        filters={[
          { id: "status", label: "Status", options: ["all", "draft", "sent", "paid", "overdue", "cancelled"].map((v) => ({ value: v, label: v })) },
        ]}
        filterPredicates={{ status: (r, v) => (r.status || "draft") === v }}
        emptyTitle="No invoices"
        emptyDescription="Issue invoices to clients with line items, currency and due dates."
        primaryActionLabel="New invoice"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => invoices.remove(r.id)}
      />
      <CBRecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit invoice" : "New invoice"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            {editing && <Button variant="outline" onClick={() => printRecord("Invoice", form)}>Print</Button>}
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CBFormField label="Client" required className="sm:col-span-2"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Currency"><CurrencySelect value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} /></CBFormField>
          <CBFormField label="Invoice no."><Input value={form.invoiceNo ?? ""} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} /></CBFormField>
          <CBFormField label="Issue date"><Input type="date" value={form.issueDate ?? ""} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></CBFormField>
          <CBFormField label="Due date"><Input type="date" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></CBFormField>
        </div>

        <CBFormSection title="Line items">
          <div className="space-y-2">
            {(form.lines ?? []).map((l: any, i: number) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center rounded-lg border border-border/60 bg-card/60 p-2">
                <Input className="col-span-12 sm:col-span-6 h-9" placeholder="Description" value={l.label} onChange={(e) => updateLine(i, { label: e.target.value })} />
                <Input className="col-span-4 sm:col-span-2 h-9" type="number" min={0} step="0.5" placeholder="Qty" value={l.qty} onChange={(e) => updateLine(i, { qty: Number(e.target.value) })} />
                <Input className="col-span-4 sm:col-span-2 h-9" type="number" min={0} step="0.01" placeholder="Unit" value={l.unitPrice} onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })} />
                <div className="col-span-4 sm:col-span-2 text-right text-xs tabular-nums">{fmtMoney((l.qty || 0) * (l.unitPrice || 0), form.currency)}</div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, lines: [...(form.lines ?? []), { label: "", qty: 1, unitPrice: 0 }] })}>+ Add line</Button>
            <div className="flex items-center justify-end pt-2 border-t border-border/40">
              <span className="text-sm font-semibold mr-3">Total</span>
              <span className="text-lg font-semibold tabular-nums">{fmtMoney(total, form.currency)}</span>
            </div>
          </div>
        </CBFormSection>

        <CBFormField label="Status">
          <Select value={form.status ?? "draft"} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-[60]">
              {["draft", "sent", "paid", "overdue", "cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CBFormField>
        <CBFormField label="Notes"><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></CBFormField>
      </CBRecordDrawer>
    </>
  );
}
function blankInvoice() {
  return { currency: "EUR", status: "draft", lines: [{ label: "", qty: 1, unitPrice: 0 }] };
}

/* ───────────── Fee notes (notes d'honoraires) ───────────── */
function FeeNotesTab({
  feeNotes,
  auditors,
  allocations,
}: {
  feeNotes: ReturnType<typeof useCBCollection<"feeNotes">>;
  auditors: any[];
  allocations: any[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(blankFeeNote());

  const launch = (r: any | null = null) => {
    setEditing(r);
    setForm(r ? { ...blankFeeNote(), ...r } : blankFeeNote());
    setOpen(true);
  };

  const computedTotal = useMemo(() => {
    const days = Number(form.mandays) || 0;
    const rate = Number(form.dayRate) || 0;
    const expenses = Number(form.expenses) || 0;
    return days * rate + expenses;
  }, [form]);

  const save = () => {
    if (!form.auditorId) { toast.error("Auditor is required."); return; }
    const payload = { ...form, total: computedTotal };
    if (editing) feeNotes.update(editing.id, payload); else feeNotes.add(payload);
    toast.success("Fee note saved"); setOpen(false);
  };

  // Pre-fill from allocation
  const prefillFromAllocation = (allocId: string) => {
    const al = allocations.find((a) => a.id === allocId);
    if (!al) return;
    const auditor = auditors.find((a) => a.id === al.auditorId);
    setForm({
      ...form,
      auditorId: al.auditorId,
      auditorName: auditor?.fullName,
      client: al.client,
      periodStart: al.startDate,
      periodEnd: al.endDate,
      mandays: al.mandays,
      dayRate: al.costRate ?? form.dayRate,
      allocationId: allocId,
    });
  };

  const cols: CBColumn<any>[] = [
    { key: "ref", header: "Ref", render: (r) => <span className="font-mono text-xs">{r.feeNoteNo || `FN-${String(r.id).slice(-5).toUpperCase()}`}</span> },
    { key: "auditor", header: "Auditor", render: (r) => <span className="text-sm font-medium">{auditors.find((a) => a.id === r.auditorId)?.fullName ?? r.auditorName ?? r.auditorId}</span> },
    { key: "client", header: "Client", render: (r) => <span className="text-sm">{r.client || "—"}</span> },
    { key: "period", header: "Period", render: (r) => <span className="text-xs tabular-nums">{r.periodStart} → {r.periodEnd}</span> },
    { key: "days", header: "Days", render: (r) => <span className="text-sm tabular-nums">{r.mandays || "—"}</span> },
    { key: "rate", header: "Day rate", render: (r) => <span className="text-xs tabular-nums">{fmtMoney(r.dayRate, r.currency)}</span> },
    { key: "total", header: "Total", render: (r) => <span className="text-sm tabular-nums font-semibold">{fmtMoney(r.total, r.currency)}</span> },
    { key: "status", header: "Status", render: (r) => <CBStatusPill label={r.status || "draft"} tone={r.status === "paid" ? "success" : r.status === "approved" ? "info" : "neutral"} /> },
  ];

  return (
    <>
      <CBRecordList
        records={feeNotes.data}
        columns={cols}
        searchFields={["client", "auditorName", "feeNoteNo"] as any}
        searchPlaceholder="Search fee notes…"
        filters={[
          { id: "status", label: "Status", options: ["all", "draft", "submitted", "approved", "paid", "rejected"].map((v) => ({ value: v, label: v })) },
        ]}
        filterPredicates={{ status: (r, v) => (r.status || "draft") === v }}
        emptyTitle="No fee notes yet"
        emptyDescription="Subcontractor auditors submit fee notes (notes d'honoraires) — track day rate, expenses and payment status."
        primaryActionLabel="New fee note"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => feeNotes.remove(r.id)}
      />
      <CBRecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit fee note" : "New fee note (note d'honoraires)"}
        description="Used to pay subcontractor auditors. Pre-fill from an existing allocation to save time."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            {editing && <Button variant="outline" onClick={() => printRecord("Fee note", form)}>Print</Button>}
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <CBFormSection title="Pre-fill (optional)">
          <CBFormField label="From allocation">
            <Select value={form.allocationId ?? ""} onValueChange={prefillFromAllocation}>
              <SelectTrigger><SelectValue placeholder="Select an allocation…" /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                {allocations.length === 0 && <SelectItem value="__none" disabled>No allocations</SelectItem>}
                {allocations.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.client} · {a.startDate} → {a.endDate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CBFormField>
        </CBFormSection>

        <CBFormSection title="Fee note">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CBFormField label="Auditor" required>
              <Select value={form.auditorId} onValueChange={(v) => {
                const a = auditors.find((x) => x.id === v);
                setForm({ ...form, auditorId: v, auditorName: a?.fullName });
              }}>
                <SelectTrigger><SelectValue placeholder="Select auditor" /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  {auditors.length === 0 && <SelectItem value="__none" disabled>No auditors</SelectItem>}
                  {auditors.map((a) => <SelectItem key={a.id} value={a.id}>{a.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </CBFormField>
            <CBFormField label="Fee note no."><Input value={form.feeNoteNo ?? ""} onChange={(e) => setForm({ ...form, feeNoteNo: e.target.value })} /></CBFormField>
            <CBFormField label="Client"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
            <CBFormField label="Currency"><CurrencySelect value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} /></CBFormField>
            <CBFormField label="Period start"><Input type="date" value={form.periodStart ?? ""} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} /></CBFormField>
            <CBFormField label="Period end"><Input type="date" value={form.periodEnd ?? ""} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} /></CBFormField>
            <CBFormField label="Mandays"><Input type="number" min={0} step="0.5" value={form.mandays ?? 0} onChange={(e) => setForm({ ...form, mandays: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Day rate"><Input type="number" min={0} step="10" value={form.dayRate ?? 0} onChange={(e) => setForm({ ...form, dayRate: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Expenses"><Input type="number" min={0} step="0.01" value={form.expenses ?? 0} onChange={(e) => setForm({ ...form, expenses: Number(e.target.value) })} /></CBFormField>
            <CBFormField label="Status">
              <Select value={form.status ?? "draft"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  {["draft", "submitted", "approved", "paid", "rejected"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </CBFormField>
          </div>
          <div className="flex items-center justify-end pt-2 border-t border-border/40">
            <span className="text-sm font-semibold mr-3">Total</span>
            <span className="text-lg font-semibold tabular-nums">{fmtMoney(computedTotal, form.currency)}</span>
          </div>
        </CBFormSection>
      </CBRecordDrawer>
    </>
  );
}
function blankFeeNote() {
  return { currency: "EUR", status: "draft", mandays: 0, dayRate: 0, expenses: 0 };
}

/* ───────────── Accreditation fees ───────────── */
function AccreditationTab({ accred }: { accred: ReturnType<typeof useCBCollection<"accreditationFees">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ currency: "EUR" });

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { currency: "EUR" }); setOpen(true); };
  const save = () => {
    if (!form.label?.trim()) { toast.error("Label is required."); return; }
    if (editing) accred.update(editing.id, form); else accred.add(form);
    toast.success("Accreditation fee saved"); setOpen(false);
  };

  const cols: CBColumn<any>[] = [
    { key: "label", header: "Item", render: (r) => <span className="text-sm font-medium">{r.label}</span> },
    { key: "client", header: "Client / scope", render: (r) => <span className="text-sm">{r.client || "—"}</span> },
    { key: "cost", header: "Cost (paid)", render: (r) => <span className="text-sm tabular-nums">{fmtMoney(r.cost, r.currency)}</span> },
    { key: "sell", header: "Sell (re-billed)", render: (r) => <span className="text-sm tabular-nums">{fmtMoney(r.sell, r.currency)}</span> },
    { key: "margin", header: "Margin", render: (r) => {
        const m = (Number(r.sell) || 0) - (Number(r.cost) || 0);
        return <span className={cn("text-sm tabular-nums font-semibold", m >= 0 ? "text-success" : "text-destructive")}>{fmtMoney(m, r.currency)}</span>;
      } },
  ];

  return (
    <>
      <CBRecordList
        records={accred.data}
        columns={cols}
        searchFields={["label", "client"] as any}
        searchPlaceholder="Search accreditation fees…"
        emptyTitle="No accreditation fees recorded"
        emptyDescription="Track fees paid to the accreditation body and what is re-billed to the client — auto-margin per line."
        primaryActionLabel="New entry"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => accred.remove(r.id)}
      />
      <CBRecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit accreditation fee" : "New accreditation fee"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Item / label" required className="sm:col-span-2"><Input value={form.label ?? ""} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Annual accreditation fee" /></CBFormField>
          <CBFormField label="Client / scope"><Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} /></CBFormField>
          <CBFormField label="Currency"><CurrencySelect value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} /></CBFormField>
          <CBFormField label="Cost (paid to accred. body)"><Input type="number" min={0} value={form.cost ?? 0} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} /></CBFormField>
          <CBFormField label="Selling price (re-billed)"><Input type="number" min={0} value={form.sell ?? 0} onChange={(e) => setForm({ ...form, sell: Number(e.target.value) })} /></CBFormField>
          <CBFormField label="Date"><Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></CBFormField>
        </div>
      </CBRecordDrawer>
    </>
  );
}

/* ───────────── Overheads ───────────── */
function OverheadsTab({ overheads }: { overheads: ReturnType<typeof useCBCollection<"overheadCosts">> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ frequency: "monthly", currency: "EUR" });

  const launch = (r: any | null = null) => { setEditing(r); setForm(r ? { ...r } : { frequency: "monthly", currency: "EUR" }); setOpen(true); };
  const save = () => {
    if (!form.label?.trim()) { toast.error("Label is required."); return; }
    if (editing) overheads.update(editing.id, form); else overheads.add(form);
    toast.success("Overhead saved"); setOpen(false);
  };

  const annualTotal = annualOverheadTotal(overheads.data);

  const cols: CBColumn<any>[] = [
    { key: "label", header: "Cost line", render: (r) => <span className="text-sm font-medium">{r.label}</span> },
    { key: "category", header: "Category", render: (r) => <CBStatusPill tone="info" label={r.category || "general"} /> },
    { key: "amount", header: "Amount", render: (r) => <span className="text-sm tabular-nums">{fmtMoney(r.amount, r.currency)}</span> },
    { key: "freq", header: "Frequency", render: (r) => <span className="text-xs">{r.frequency || "monthly"}</span> },
    { key: "annual", header: "Annual", render: (r) => <span className="text-sm tabular-nums font-semibold">{fmtMoney((r.amount || 0) * (r.frequency === "monthly" ? 12 : 1), r.currency)}</span> },
  ];

  return (
    <>
      <div className="mb-3 rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Annual overhead pool</div>
          <div className="text-2xl font-semibold tabular-nums">{fmtMoney(annualTotal, "EUR")}</div>
        </div>
        <div className="text-xs text-muted-foreground max-w-sm text-right">
          Use this baseline to allocate a fair share of overheads to each quotation.
        </div>
      </div>
      <CBRecordList
        records={overheads.data}
        columns={cols}
        searchFields={["label", "category"] as any}
        searchPlaceholder="Search overheads…"
        filters={[
          { id: "category", label: "Category", options: ["all", "salaries", "rent", "software", "industry", "marketing", "general"].map((v) => ({ value: v, label: v })) },
        ]}
        filterPredicates={{ category: (r, v) => (r.category || "general") === v }}
        emptyTitle="No overhead lines"
        emptyDescription="Add salaries, rent, software, accreditation industry costs etc. — used to compute realistic margin per quotation."
        primaryActionLabel="New overhead"
        onCreate={() => launch(null)}
        onEdit={(r) => launch(r)}
        onDelete={(r) => overheads.remove(r.id)}
      />
      <CBRecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit overhead" : "New overhead"}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CBFormField label="Label" required className="sm:col-span-2"><Input value={form.label ?? ""} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Office rent / Lead auditor salary…" /></CBFormField>
          <CBFormField label="Category">
            <Select value={form.category ?? "general"} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                {["salaries", "rent", "software", "industry", "marketing", "general"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Frequency">
            <Select value={form.frequency ?? "monthly"} onValueChange={(v) => setForm({ ...form, frequency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-[60]">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </CBFormField>
          <CBFormField label="Amount"><Input type="number" min={0} value={form.amount ?? 0} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></CBFormField>
          <CBFormField label="Currency"><CurrencySelect value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} /></CBFormField>
        </div>
      </CBRecordDrawer>
    </>
  );
}

/* ───────────── P&L ───────────── */
function PnlTab({
  invoices, feeNotes, accred, overheads, allocations,
}: {
  invoices: any[]; feeNotes: any[]; accred: any[]; overheads: any[]; allocations: any[];
}) {
  const sumByCurrency = (rows: any[], field = "total") => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const cur = (r.currency as string) || "EUR";
      m.set(cur, (m.get(cur) || 0) + (Number(r[field]) || 0));
    }
    return m;
  };

  const revenue = useMemo(() => sumByCurrency(invoices.filter((i) => i.status !== "cancelled"), "total"), [invoices]);
  const accredSell = useMemo(() => sumByCurrency(accred, "sell"), [accred]);
  const accredCost = useMemo(() => sumByCurrency(accred, "cost"), [accred]);
  const subcontractor = useMemo(() => sumByCurrency(feeNotes.filter((f) => f.status !== "rejected"), "total"), [feeNotes]);
  const annualOverhead = annualOverheadTotal(overheads);
  const allocCost = useMemo(() => allocations.reduce((s, a) => s + (Number(a.mandays) || 0) * (Number(a.costRate) || 0), 0), [allocations]);

  const currencies = Array.from(new Set([...revenue.keys(), ...subcontractor.keys(), ...accredSell.keys(), ...accredCost.keys()]));
  if (currencies.length === 0) currencies.push("EUR");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Annual overhead" value={fmtMoney(annualOverhead, "EUR")} hint="From overheads tab × 12 / annual" />
        <KpiCard label="Allocated auditor cost" value={fmtMoney(allocCost, "EUR")} hint="Sum of allocations (mandays × rate)" />
        <KpiCard label="Subcontractor fee notes" value={[...subcontractor.entries()].map(([c, v]) => fmtMoney(v, c as Currency)).join(" · ") || "—"} hint="Approved + paid + submitted" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-xs text-muted-foreground">Metric</th>
              {currencies.map((c) => (
                <th key={c} className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-xs text-muted-foreground">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <PnlRow label="Revenue (invoices issued)" values={currencies.map((c) => revenue.get(c) || 0)} currencies={currencies} />
            <PnlRow label="+ Accreditation re-billed" values={currencies.map((c) => accredSell.get(c) || 0)} currencies={currencies} />
            <PnlRow label="− Auditor fee notes" values={currencies.map((c) => -(subcontractor.get(c) || 0))} currencies={currencies} negative />
            <PnlRow label="− Accreditation cost" values={currencies.map((c) => -(accredCost.get(c) || 0))} currencies={currencies} negative />
            <PnlRow
              label="Gross margin"
              values={currencies.map((c) => (revenue.get(c) || 0) + (accredSell.get(c) || 0) - (subcontractor.get(c) || 0) - (accredCost.get(c) || 0))}
              currencies={currencies}
              bold
            />
            <PnlRow label="− Overheads (annualised)" values={currencies.map((c, i) => i === 0 ? -annualOverhead : 0)} currencies={currencies} negative />
            <PnlRow
              label="Net profit"
              values={currencies.map((c, i) => {
                const gross = (revenue.get(c) || 0) + (accredSell.get(c) || 0) - (subcontractor.get(c) || 0) - (accredCost.get(c) || 0);
                return gross - (i === 0 ? annualOverhead : 0);
              })}
              currencies={currencies}
              bold
              accent
            />
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Note: amounts are summed per entry currency; no automatic FX conversion. Overheads are subtracted in your primary currency only.
      </p>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
function PnlRow({
  label, values, currencies, bold, accent, negative,
}: { label: string; values: number[]; currencies: string[]; bold?: boolean; accent?: boolean; negative?: boolean }) {
  return (
    <tr className={cn("border-t border-border/40", bold && "bg-muted/20")}>
      <td className={cn("px-3 py-2", bold && "font-semibold")}>{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={cn(
            "px-3 py-2 text-right tabular-nums",
            bold && "font-semibold",
            accent && (v >= 0 ? "text-success" : "text-destructive"),
            negative && !accent && "text-muted-foreground",
          )}
        >
          {fmtMoney(v, currencies[i] as Currency)}
        </td>
      ))}
    </tr>
  );
}

/* ───────────── Print helper ───────────── */
function printRecord(kind: string, data: any) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  const cur = (data.currency || "EUR") as Currency;
  const total = data.total ?? (data.lines ?? []).reduce((s: number, l: any) => s + (l.qty || 0) * (l.unitPrice || 0), 0);
  w.document.write(`<!doctype html><html><head><title>${kind} ${data.invoiceNo || data.feeNoteNo || ""}</title>
    <style>
      body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;padding:48px;color:#111}
      h1{margin:0 0 4px;font-size:28px} .muted{color:#666;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-top:24px}
      th,td{padding:8px;border-bottom:1px solid #eee;text-align:left;font-size:13px}
      th{background:#f7f7f7;text-transform:uppercase;font-size:10px;letter-spacing:.05em}
      .right{text-align:right} .total{font-weight:600;font-size:18px}
    </style></head><body>
    <h1>${kind}</h1>
    <p class="muted">${data.invoiceNo || data.feeNoteNo || ""} · Issued ${data.issueDate || data.periodStart || ""}</p>
    <p><strong>${kind === "Fee note" ? "Auditor" : "Client"}:</strong> ${data.auditorName || data.client || ""}</p>
    ${kind === "Fee note" ? `
      <p><strong>Period:</strong> ${data.periodStart || ""} → ${data.periodEnd || ""}</p>
      <table><thead><tr><th>Description</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
      <tbody>
        <tr><td>Audit mandays</td><td class="right">${data.mandays || 0}</td><td class="right">${fmtMoney(data.dayRate, cur)}</td><td class="right">${fmtMoney((data.mandays || 0) * (data.dayRate || 0), cur)}</td></tr>
        ${data.expenses ? `<tr><td>Expenses</td><td class="right">1</td><td class="right">${fmtMoney(data.expenses, cur)}</td><td class="right">${fmtMoney(data.expenses, cur)}</td></tr>` : ""}
      </tbody></table>
    ` : `
      <table><thead><tr><th>Description</th><th class="right">Qty</th><th class="right">Unit</th><th class="right">Amount</th></tr></thead>
      <tbody>${(data.lines || []).map((l: any) => `<tr><td>${l.label || ""}</td><td class="right">${l.qty || 0}</td><td class="right">${fmtMoney(l.unitPrice, cur)}</td><td class="right">${fmtMoney((l.qty || 0) * (l.unitPrice || 0), cur)}</td></tr>`).join("")}</tbody></table>
    `}
    <p class="right total" style="margin-top:24px">Total: ${fmtMoney(total, cur)}</p>
    <script>window.print()</script>
  </body></html>`);
  w.document.close();
}
