import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ACTIVITY = [
  "Updated process documentation links",
  "Reviewed issue risk priorities",
  "Exported process detail PDF",
  "Edited document responsibilities",
  "Archived outdated procedure",
];

export default function UserDetails() {
  const [query, setQuery] = useState("");

  const filteredActivity = useMemo(() => {
    if (!query.trim()) return ACTIVITY;
    const q = query.toLowerCase();
    return ACTIVITY.filter((entry) => entry.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen">
      <PageHeader title="User Details" subtitle="Profile, roles and recent activity" showBack />
      <AdaptiveContainer className="py-6 space-y-4">
        <section className="mobile-card space-y-4 max-w-[900px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" defaultValue="QMS User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="user@macerti.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div><Badge variant="secondary">Admin</Badge></div>
            </div>
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Input value="default" readOnly />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save profile</Button>
          </div>
        </section>

        <section className="mobile-card space-y-3 max-w-[900px]">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <Input
              placeholder="Search activity..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="max-w-[320px]"
            />
          </div>
          <ul className="space-y-2">
            {filteredActivity.map((entry, index) => (
              <li key={index} className="text-sm p-2 rounded-md border border-border bg-muted/20">{entry}</li>
            ))}
            {filteredActivity.length === 0 && <li className="text-sm text-muted-foreground">No matching activity.</li>}
          </ul>
        </section>
      </AdaptiveContainer>
    </div>
  );
}
