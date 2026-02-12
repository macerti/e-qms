import { useMemo, useState } from "react";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { TabWorkspace } from "@/components/tools/shared/components/TabWorkspace";
import { ToolHeader } from "@/components/tools/shared/components/ToolHeader";
import { ToolLayout } from "@/components/tools/shared/layouts/ToolLayout";
import { type ScaffoldTool } from "@/domains/tools/toolWorkspace";
import { toolsApplicationService } from "@/application/tools/toolsApplicationService";
import { TabLayout } from "@/ui/components/TabLayout";

export function ScaffoldedToolWorkspace({ tool }: { tool: ScaffoldTool }) {
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
      tabBar={<TabLayout activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs.map((tab) => ({ key: tab.key, label: tab.label }))}>{null}</TabLayout>}
      workspace={<TabWorkspace tab={currentTab} />}
    />
  );
}
