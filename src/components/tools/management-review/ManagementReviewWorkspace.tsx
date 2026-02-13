import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TabLayout } from "@/ui/components/TabLayout";
import { EditableTable } from "@/components/tools/shared/components/EditableTable";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { managementReviewWorkspaceService } from "@/application/tools/managementReviewWorkspaceService";

export function ManagementReviewWorkspace() {
  const { processes } = useManagementSystem();
  const tabs = managementReviewWorkspaceService.getTabs();
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [linkedProcess, setLinkedProcess] = useState("not_assigned");
  const [periodDate, setPeriodDate] = useState("");
  const [periodTime, setPeriodTime] = useState("");
  const [participantRole, setParticipantRole] = useState("top_management");
  const [strategicAlignment, setStrategicAlignment] = useState(true);
  const [agendaLink, setAgendaLink] = useState("");
  const [recordLink, setRecordLink] = useState("");
  const [summary, setSummary] = useState("");

  const processOptions = useMemo(
    () => processes.filter((process) => process.status !== "archived").map((process) => ({ value: process.id, label: `${process.code} · ${process.name}` })),
    [processes],
  );

  const currentTab = tabs.find((tab) => tab.key === activeTab) || tabs[0];

  return (
    <div className="space-y-4">
      <TabLayout activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs.map((tab) => ({ key: tab.key, label: tab.label }))}>
        {null}
      </TabLayout>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{currentTab.label}</CardTitle>
          <p className="text-xs text-muted-foreground">ISO 9001:2015 clause {currentTab.clause} · {currentTab.description}</p>
        </CardHeader>
        <CardContent>
          {currentTab.key === "overview" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Review period date</Label>
                <Input type="date" value={periodDate} onChange={(e) => setPeriodDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Review period time</Label>
                <Input type="time" value={periodTime} onChange={(e) => setPeriodTime(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Linked process</Label>
                <Select value={linkedProcess} onValueChange={setLinkedProcess}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select process" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_assigned">Not assigned</SelectItem>
                    {processOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Top management participant role</Label>
                <Select value={participantRole} onValueChange={setParticipantRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top_management">Top Management</SelectItem>
                    <SelectItem value="authorized_delegate">Authorized Delegate</SelectItem>
                    <SelectItem value="qa_manager">QA Manager</SelectItem>
                    <SelectItem value="process_owner">Process Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex items-center gap-2 rounded-md border p-3">
                <Checkbox checked={strategicAlignment} onCheckedChange={(v) => setStrategicAlignment(Boolean(v))} id="strategicAlignment" />
                <Label htmlFor="strategicAlignment" className="text-sm">Review confirms alignment with strategic direction</Label>
              </div>

              <div className="space-y-2">
                <Label>Agenda record link</Label>
                <Input value={agendaLink} onChange={(e) => setAgendaLink(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Review records link</Label>
                <Input value={recordLink} onChange={(e) => setRecordLink(e.target.value)} placeholder="https://..." />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Review summary</Label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Capture suitability, adequacy, effectiveness and strategic alignment conclusions." className="min-h-[120px]" />
              </div>
            </div>
          ) : (
            <div className="h-[440px] overflow-auto rounded-md border border-border/60 p-2">
              <EditableTable columns={currentTab.columns ?? ["Item", "Owner", "Status"]} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
