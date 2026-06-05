import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Loader2, AlertTriangle, CheckCircle2, ClipboardList, FileWarning, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { SignaturePad } from "@/components/signatures/SignaturePad";
import { MorphIn } from "@/components/animation/MorphIn";
import { Skeleton } from "@/components/ui/skeleton";

interface Audit {
  id: string;
  reference_code: string | null;
  title: string;
  scope_description: string | null;
  status: string;
  planned_start: string | null;
  planned_end: string | null;
  organization_id: string;
}
interface ChecklistItem {
  id: string;
  sequence: number;
  clause_code: string | null;
  question: string;
  expected_evidence: string | null;
  result: string;
  notes: string | null;
}
interface Finding {
  id: string;
  reference_code: string | null;
  finding_type: string;
  clause_code: string | null;
  statement: string;
  status: string;
  closed_at: string | null;
  action_id: string | null;
}

const RESULT_OPTIONS = [
  { v: "pending", label: "Pending", color: "outline" as const },
  { v: "conform", label: "Conform", color: "secondary" as const },
  { v: "minor_nc", label: "Minor NC", color: "default" as const },
  { v: "major_nc", label: "Major NC", color: "destructive" as const },
  { v: "observation", label: "Observation", color: "outline" as const },
  { v: "ofi", label: "OFI", color: "secondary" as const },
  { v: "na", label: "N/A", color: "outline" as const },
];

export default function AuditDetail() {
  const { id } = useParams();
  const { profile, hasRole } = useAuth();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newClause, setNewClause] = useState("");
  const [newEv, setNewEv] = useState("");

  const canEdit = hasRole("rmq") || hasRole("top_management") || hasRole("auditor_internal");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [a, c, f] = await Promise.all([
      supabase.from("audits").select("*").eq("id", id).single(),
      supabase.from("audit_checklist_items").select("*").eq("audit_id", id).order("sequence"),
      supabase.from("audit_findings").select("*").eq("audit_id", id).order("created_at"),
    ]);
    setAudit(a.data as Audit);
    setItems((c.data ?? []) as ChecklistItem[]);
    setFindings((f.data ?? []) as Finding[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addItem = async () => {
    if (!audit || !profile?.organization_id) return;
    const { error } = await supabase.from("audit_checklist_items").insert({
      audit_id: audit.id,
      organization_id: profile.organization_id,
      sequence: items.length + 1,
      question: newQ,
      clause_code: newClause || null,
      expected_evidence: newEv || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewQ("");
    setNewClause("");
    setNewEv("");
    setAddingItem(false);
    load();
  };

  const updateResult = async (itemId: string, result: string, item: ChecklistItem) => {
    if (!profile?.organization_id || !audit) return;
    type ResultEnum = "pending" | "conform" | "minor_nc" | "major_nc" | "observation" | "ofi" | "na";
    type FindingEnum = "major_nc" | "minor_nc" | "observation" | "ofi" | "conformity";
    await supabase
      .from("audit_checklist_items")
      .update({ result: result as ResultEnum, checked_at: new Date().toISOString() })
      .eq("id", itemId);

    // Spawn a finding for non-conformities / observations / OFI
    if (["minor_nc", "major_nc", "observation", "ofi"].includes(result)) {
      const yr = new Date().getFullYear().toString().slice(-2);
      const findingType: FindingEnum =
        result === "ofi" ? "ofi" : result === "observation" ? "observation" : (result as "minor_nc" | "major_nc");
      await supabase.from("audit_findings").insert({
        audit_id: audit.id,
        organization_id: profile.organization_id,
        checklist_item_id: itemId,
        reference_code: `FND/${yr}/${String(findings.length + 1).padStart(3, "0")}`,
        finding_type: findingType,
        clause_code: item.clause_code,
        statement: item.question,
        evidence: item.notes || null,
      });
    }
    load();
  };

  const updateNotes = async (itemId: string, notes: string) => {
    await supabase.from("audit_checklist_items").update({ notes }).eq("id", itemId);
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, notes } : i)));
  };

  const updateStatus = async (status: string) => {
    if (!audit) return;
    type AuditStatusEnum = "planned" | "in_progress" | "reporting" | "closed" | "cancelled";
    await supabase.from("audits").update({ status: status as AuditStatusEnum }).eq("id", audit.id);
    load();
  };

  const convertFindingToAction = async (f: Finding) => {
    if (!profile?.organization_id || !audit) return;
    const yr = new Date().getFullYear().toString().slice(-2);
    const { data, error } = await supabase
      .from("actions")
      .insert({
        organization_id: profile.organization_id,
        source_type: "internal_audit",
        source_id: f.id,
        title: `Resolve: ${f.statement.slice(0, 80)}`,
        description: `From ${audit.reference_code} — ${f.finding_type.replace("_", " ")}`,
        reference_code: `ACT/${yr}/AUD-${f.reference_code}`,
        requires_signature: true,
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("audit_findings").update({ action_id: data.id, status: "action_in_progress" }).eq("id", f.id);
    toast.success("Action created and linked");
    load();
  };

  if (loading || !audit) {
    return (
      <div className="px-4 lg:px-6 py-6 space-y-6 max-w-6xl mx-auto w-full">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="morph-card-skeleton">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const counts = {
    total: items.length,
    done: items.filter((i) => i.result !== "pending").length,
    nc: items.filter((i) => ["minor_nc", "major_nc"].includes(i.result)).length,
    ofi: items.filter((i) => i.result === "ofi").length,
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6 max-w-6xl mx-auto w-full morph-fade-in">
      <div className="space-y-3">
        <Link to="/audits" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> All audits
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="text-xs font-mono text-muted-foreground">{audit.reference_code}</div>
            <h1 className="text-2xl font-semibold">{audit.title}</h1>
            {audit.scope_description && <p className="text-sm text-muted-foreground max-w-2xl">{audit.scope_description}</p>}
            {audit.planned_start && (
              <p className="text-xs text-muted-foreground">
                Planned: {format(new Date(audit.planned_start), "MMM d, yyyy")}
                {audit.planned_end && ` → ${format(new Date(audit.planned_end), "MMM d, yyyy")}`}
              </p>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Select value={audit.status} onValueChange={updateStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-xs text-muted-foreground">Checklist</div><div className="text-2xl font-mono">{counts.done}/{counts.total}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Non-conformities</div><div className="text-2xl font-mono text-destructive">{counts.nc}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">OFIs</div><div className="text-2xl font-mono">{counts.ofi}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Findings</div><div className="text-2xl font-mono">{findings.length}</div></Card>
      </div>

      <Tabs defaultValue="checklist">
        <TabsList>
          <TabsTrigger value="checklist"><ClipboardList className="h-3.5 w-3.5 mr-1.5" />Checklist</TabsTrigger>
          <TabsTrigger value="findings"><FileWarning className="h-3.5 w-3.5 mr-1.5" />Findings ({findings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-3 mt-4">
          {items.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">No checklist items yet.</Card>
          ) : (
            items.map((it) => (
              <Card key={it.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xs font-mono text-muted-foreground pt-1 w-8">{it.sequence}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        {it.clause_code && <Badge variant="outline" className="text-[10px]">Clause {it.clause_code}</Badge>}
                        <div className="font-medium text-sm">{it.question}</div>
                        {it.expected_evidence && <div className="text-xs text-muted-foreground">Expected: {it.expected_evidence}</div>}
                      </div>
                      {canEdit && (
                        <Select value={it.result} onValueChange={(v) => updateResult(it.id, v, it)}>
                          <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {RESULT_OPTIONS.map((o) => (
                              <SelectItem key={o.v} value={o.v}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {canEdit && (
                      <Textarea
                        rows={2}
                        placeholder="Notes & evidence…"
                        defaultValue={it.notes ?? ""}
                        onBlur={(e) => e.target.value !== it.notes && updateNotes(it.id, e.target.value)}
                        className="text-xs"
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
          {canEdit && (
            <>
              {addingItem ? (
                <Card className="p-4 space-y-3 border-primary/40">
                  <div className="grid grid-cols-3 gap-2">
                    <Input value={newClause} onChange={(e) => setNewClause(e.target.value)} placeholder="Clause (e.g. 8.5.1)" />
                    <Input className="col-span-2" value={newEv} onChange={(e) => setNewEv(e.target.value)} placeholder="Expected evidence" />
                  </div>
                  <Textarea rows={2} value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Audit question…" />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setAddingItem(false)}>Cancel</Button>
                    <Button size="sm" onClick={addItem} disabled={!newQ}>Add</Button>
                  </div>
                </Card>
              ) : (
                <Button variant="outline" onClick={() => setAddingItem(true)} className="w-full"><Plus className="h-4 w-4 mr-1.5" />Add checklist item</Button>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="findings" className="space-y-3 mt-4">
          {findings.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground"><Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />No findings — checklist items flagged as NC/OFI/observation auto-create findings here.</Card>
          ) : (
            findings.map((f) => (
              <Card key={f.id} className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{f.reference_code}</span>
                      <Badge variant={f.finding_type.includes("major") ? "destructive" : f.finding_type.includes("minor") ? "default" : "outline"} className="text-[10px]">
                        {f.finding_type.replace("_", " ").toUpperCase()}
                      </Badge>
                      {f.clause_code && <Badge variant="outline" className="text-[10px]">Clause {f.clause_code}</Badge>}
                      <Badge variant="secondary" className="text-[10px] capitalize">{f.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="text-sm">{f.statement}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!f.action_id && canEdit && (
                      <Button size="sm" variant="outline" onClick={() => convertFindingToAction(f)}>
                        <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />Create action
                      </Button>
                    )}
                    {f.action_id && (
                      <Link to={`/actions/${f.action_id}`} className="text-xs text-primary hover:underline">
                        View linked action →
                      </Link>
                    )}
                    {f.status !== "closed" && canEdit && (
                      <SignaturePad
                        entityType="audit_finding"
                        entityId={f.id}
                        payload={{ ref: f.reference_code, statement: f.statement, type: f.finding_type }}
                        intent="approve"
                        onSigned={async () => {
                          await supabase.from("audit_findings").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", f.id);
                          load();
                        }}
                        trigger={
                          <Button size="sm" variant="ghost" className="gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />Close with signature
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
