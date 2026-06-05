import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ClipboardCheck, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { MorphIn } from "@/components/animation/MorphIn";
import { Skeleton } from "@/components/ui/skeleton";

interface Audit {
  id: string;
  reference_code: string | null;
  title: string;
  status: string;
  planned_start: string | null;
  planned_end: string | null;
  scope_description: string | null;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  planned: "outline",
  in_progress: "default",
  reporting: "secondary",
  closed: "secondary",
  cancelled: "destructive",
};

export default function AuditList() {
  const { profile, hasRole } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [busy, setBusy] = useState(false);

  const canCreate = hasRole("rmq") || hasRole("top_management") || hasRole("auditor_internal");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audits")
      .select("*")
      .is("archived_at", null)
      .order("planned_start", { ascending: false, nullsFirst: false });
    setAudits((data ?? []) as Audit[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!profile?.organization_id) return;
    setBusy(true);
    try {
      const year = new Date().getFullYear().toString().slice(-2);
      const ref = `AUD/${year}/${String(audits.length + 1).padStart(3, "0")}`;
      const { error } = await supabase.from("audits").insert({
        organization_id: profile.organization_id,
        title,
        scope_description: scope,
        planned_start: plannedStart || null,
        planned_end: plannedEnd || null,
        reference_code: ref,
      });
      if (error) throw error;
      toast.success("Audit created");
      setOpen(false);
      setTitle("");
      setScope("");
      setPlannedStart("");
      setPlannedEnd("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Internal Audits"
        subtitle="Plan, conduct and follow up internal audits of your QMS"
        action={
          canCreate && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1.5" />New audit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New internal audit</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q2 internal audit — Production process" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Scope</Label>
                    <Textarea rows={3} value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Processes & ISO clauses covered" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Planned start</Label>
                      <Input type="date" value={plannedStart} onChange={(e) => setPlannedStart(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Planned end</Label>
                      <Input type="date" value={plannedEnd} onChange={(e) => setPlannedEnd(e.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={create} disabled={!title || busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <MorphIn
        loading={loading}
        skeleton={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="morph-card-skeleton">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="pt-3 border-t border-border/60">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        {audits.length === 0 ? (
          <Card className="p-12 text-center morph-fade-in">
            <ClipboardCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-medium mb-1">No audits yet</h3>
            <p className="text-sm text-muted-foreground">{canCreate ? "Plan your first internal audit to get started." : "Audits will appear here once planned."}</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 list-stagger">
            {audits.map((a) => (
              <Link key={a.id} to={`/audits/${a.id}`}>
                <Card className="p-4 hover:shadow-md transition-all duration-300 group cursor-pointer h-full hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-[11px] font-mono text-muted-foreground">{a.reference_code}</div>
                    <Badge variant={STATUS_VARIANT[a.status] ?? "outline"} className="capitalize">{a.status.replace("_", " ")}</Badge>
                  </div>
                  <h3 className="font-medium leading-snug group-hover:text-primary transition-colors">{a.title}</h3>
                  {a.scope_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">{a.scope_description}</p>
                  )}
                  {a.planned_start && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-3 border-t">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(a.planned_start), "MMM d")}
                      {a.planned_end && ` → ${format(new Date(a.planned_end), "MMM d, yyyy")}`}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </MorphIn>
    </div>
  );
}
