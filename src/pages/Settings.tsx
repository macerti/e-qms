import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/context/TenantContext";

export default function Settings() {
  const { tenantId, setTenantId } = useTenant();
  const [draftTenantId, setDraftTenantId] = useState(tenantId);

  const handleSave = () => {
    setTenantId(draftTenantId);
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="Settings" subtitle="Access & Tenant Configuration" />
      <AdaptiveContainer className="py-6 max-w-[720px] space-y-6">
        <section className="mobile-card space-y-4">
          <div>
            <h2 className="text-base font-semibold">Tenant ID</h2>
            <p className="text-sm text-muted-foreground">
              Used to scope data to your organization. This value is sent with every API request.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tenantId">
              Tenant ID
            </label>
            <Input
              id="tenantId"
              placeholder="e.g. tenant_acme_001"
              value={draftTenantId}
              onChange={(event) => setDraftTenantId(event.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save tenant</Button>
          </div>
        </section>
        <section className="mobile-card space-y-3">
          <div>
            <h2 className="text-base font-semibold">User Access</h2>
            <p className="text-sm text-muted-foreground">
              Roles and permissions are enforced in the backend. This UI section will expand with
              user management tools in the next iteration.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Planned roles: Owner, Admin, Editor, Viewer.
          </div>
        </section>
      </AdaptiveContainer>
    </div>
  );
}
