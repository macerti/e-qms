import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PenLine, Loader2, ShieldCheck } from "lucide-react";

interface Props {
  entityType: string;
  entityId: string;
  entityVersion?: number;
  payload: Record<string, unknown>;
  /** Required role to sign — if user lacks it, button disables. */
  requiredRole?: AppRole;
  /** Default intent label. */
  intent?: "approve" | "review" | "release" | "reject" | "witness";
  /** Called after a successful signature insert. */
  onSigned?: () => void;
  /** Render-as-trigger button. */
  trigger?: React.ReactNode;
}

export function SignaturePad({
  entityType,
  entityId,
  entityVersion = 1,
  payload,
  requiredRole,
  intent = "approve",
  onSigned,
  trigger,
}: Props) {
  const { user, profile, roles, hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [comment, setComment] = useState("");
  const [affirm, setAffirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const canSign = !requiredRole || hasRole(requiredRole);
  const signerRole: AppRole = requiredRole ?? (roles[0] ?? "contributor");

  const sign = async () => {
    if (!user || !profile) return;
    if (typedName.trim().toLowerCase() !== profile.display_name.trim().toLowerCase()) {
      toast.error("Type your full name exactly as it appears on your profile");
      return;
    }
    setBusy(true);
    try {
      // Canonical hash
      const canonical = JSON.stringify(payload, Object.keys(payload).sort());
      const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
      const hash = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const { error } = await supabase.from("signatures").insert({
        organization_id: profile.organization_id,
        entity_type: entityType,
        entity_id: entityId,
        entity_version: entityVersion,
        signer_id: user.id,
        signer_role: signerRole,
        signer_display_name: profile.display_name,
        intent,
        comment: comment || null,
        payload_hash: hash,
        user_agent: navigator.userAgent,
      });
      if (error) throw error;

      // Append audit log
      await supabase.from("audit_log").insert({
        organization_id: profile.organization_id,
        actor_id: user.id,
        action: `signature.${intent}`,
        entity_type: entityType,
        entity_id: entityId,
        payload: { hash, comment },
      });

      toast.success("Record signed");
      setOpen(false);
      setTypedName("");
      setComment("");
      setAffirm(false);
      onSigned?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signing failed");
    } finally {
      setBusy(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" disabled={!canSign} className="gap-1.5">
      <PenLine className="h-3.5 w-3.5" />
      {canSign ? "Sign" : "Sign (role required)"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Electronic signature
          </DialogTitle>
          <DialogDescription>
            By signing, you affirm you reviewed this record. This action is recorded with your name, role, timestamp, and a cryptographic hash of the record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-xs space-y-1 rounded-md border bg-muted/40 p-3">
            <div><span className="text-muted-foreground">Signer:</span> <strong>{profile?.display_name}</strong></div>
            <div><span className="text-muted-foreground">Role:</span> <strong>{signerRole}</strong></div>
            <div><span className="text-muted-foreground">Intent:</span> <strong className="capitalize">{intent}</strong></div>
            <div><span className="text-muted-foreground">Entity:</span> <strong>{entityType} · v{entityVersion}</strong></div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tn">Type your full name to confirm</Label>
            <Input
              id="tn"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={profile?.display_name ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cm">Comment (optional)</Label>
            <Textarea id="cm" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox checked={affirm} onCheckedChange={(v) => setAffirm(Boolean(v))} className="mt-0.5" />
            <span>I affirm this electronic signature is the legal equivalent of my handwritten signature.</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={sign} disabled={!affirm || !typedName || busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
