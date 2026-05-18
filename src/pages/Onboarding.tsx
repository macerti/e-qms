import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Building2, User, Target, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, reload } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? "");
  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("");
  const [scopeStatement, setScopeStatement] = useState("");

  const steps = [
    { label: "Profile", icon: User },
    { label: "Organization", icon: Building2 },
    { label: "QMS Scope", icon: Target },
    { label: "Finish", icon: Sparkles },
  ];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (!user) return;
    setBusy(true);
    try {
      // 1. Update profile name/title
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ display_name: displayName, job_title: jobTitle, onboarded_at: new Date().toISOString() })
        .eq("id", user.id);
      if (pErr) throw pErr;

      // 2. Create organization
      const { data: org, error: oErr } = await supabase
        .from("organizations")
        .insert({ name: orgName, sector, country, scope_statement: scopeStatement })
        .select()
        .single();
      if (oErr) throw oErr;

      // 3. Link profile to org
      const { error: lErr } = await supabase
        .from("profiles")
        .update({ organization_id: org.id })
        .eq("id", user.id);
      if (lErr) throw lErr;

      // 4. Grant first RMQ role (RLS policy allows this when no roles exist yet)
      const { error: rErr } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, organization_id: org.id, role: "rmq" });
      if (rErr) throw rErr;

      await reload();
      toast.success("Welcome to your QMS");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setBusy(false);
    }
  };

  const StepIcon = steps[step].icon;

  return (
    <div className="min-h-dvh grid place-items-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <StepIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle>{steps[step].label}</CardTitle>
              <CardDescription>Step {step + 1} of {steps.length}</CardDescription>
            </div>
          </div>
          <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Tell us who you are. As the first user, you become RMQ (super-admin) of this organization.</p>
              <div className="space-y-1.5">
                <Label htmlFor="dn">Full name</Label>
                <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jt">Job title</Label>
                <Input id="jt" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Quality Manager" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="on">Organization name</Label>
                <Input id="on" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Industries" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sec">Sector</Label>
                  <Input id="sec" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Manufacturing" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cn">Country</Label>
                  <Input id="cn" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="France" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Describe the scope of your Quality Management System (ISO 9001 clause 4.3).</p>
              <Textarea
                rows={6}
                value={scopeStatement}
                onChange={(e) => setScopeStatement(e.target.value)}
                placeholder="Design, manufacture, and after-sales service of …"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm">
              <p>You're ready to start. Your QMS will be initialized with:</p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Standard: <strong className="text-foreground">ISO 9001</strong></li>
                <li>Organization: <strong className="text-foreground">{orgName || "—"}</strong></li>
                <li>Your role: <strong className="text-foreground">RMQ (Super-admin)</strong></li>
              </ul>
              <p className="text-muted-foreground">You can invite colleagues and assign roles from Settings.</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={back} disabled={step === 0 || busy}>Back</Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={next}
                disabled={
                  busy ||
                  (step === 0 && !displayName) ||
                  (step === 1 && !orgName)
                }
              >
                Continue
              </Button>
            ) : (
              <Button onClick={finish} disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enter QMS
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
