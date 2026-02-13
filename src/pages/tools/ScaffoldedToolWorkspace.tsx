import { useMemo, useState } from "react";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { TabWorkspace } from "@/components/tools/shared/components/TabWorkspace";
import { ToolHeader } from "@/components/tools/shared/components/ToolHeader";
import { ToolLayout } from "@/components/tools/shared/layouts/ToolLayout";
import { type ScaffoldToolContract } from "@/api/contracts/tools";
import { toolsApplicationService } from "@/application/tools/toolsApplicationService";
import { TabLayout } from "@/ui/components/TabLayout";
import { ManagementReviewWorkspace } from "@/components/tools/management-review/ManagementReviewWorkspace";

export function ScaffoldedToolWorkspace({ tool }: { tool: ScaffoldToolContract }) {
  const { processes } = useManagementSystem();
  const [linkedProcess, setLinkedProcess] = useState("not_assigned");

  const processOptions = useMemo(
    () => processes.filter((process) => process.status !== "archived").map((process) => ({ value: process.id, label: `${process.code} · ${process.name}` })),
    [processes],
  );

  const meta = toolsApplicationService.getScaffoldMeta(tool);
  const tabs = toolsApplicationService.getScaffoldTabs(tool);
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const currentTab = tabs.find((tab) => tab.key === activeTab) || tabs[0];
  const isManagementReview = tool === "management-review";

  return (
    <ToolLayout
      header={
        <ToolHeader
          title={meta.title}
          codification={meta.codification}
          description={meta.description}
          linkedProcess={linkedProcess}
          processOptions={processOptions}
          onLinkedProcessChange={setLinkedProcess}
        />
      }
      tabBar={isManagementReview ? null : <TabLayout activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs.map((tab) => ({ key: tab.key, label: tab.label }))}>{null}</TabLayout>}
      workspace={isManagementReview ? <ManagementReviewWorkspace /> : <TabWorkspace tab={currentTab} />}
    />
  );
}
