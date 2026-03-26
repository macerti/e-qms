import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ToolLayout } from "@/components/tools/shared/layouts/ToolLayout";
import { ToolHeader } from "@/components/tools/shared/components/ToolHeader";
import { TabLayout, type TabItem } from "@/ui/components/TabLayout";
import { TabWorkspace } from "@/components/tools/shared/components/TabWorkspace";
import { cbWorkspaceTabs, cbToolMeta } from "@/domains/certification-body/cbToolWorkspace";
import {
  FileInput, FileText, Target, CalendarRange, Calendar, Users,
  ClipboardList, FileCheck, AlertTriangle, Search,
  Award, ShieldAlert, Scale, Globe,
  ShieldQuestion, FileWarning, UsersRound,
  UserCheck, Grid3X3, Eye, BookOpen,
  MessageSquareWarning, Gavel, CheckCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FileInput, FileText, Target, CalendarRange, Calendar, Users,
  ClipboardList, FileCheck, AlertTriangle, Search,
  Award, ShieldAlert, Scale, Globe,
  ShieldQuestion, FileWarning, UsersRound,
  UserCheck, Grid3x3: Grid3X3, Grid3X3, Eye, BookOpen,
  MessageSquareWarning, Gavel, CheckCircle,
};

const validTools = new Set(Object.keys(cbWorkspaceTabs));

export default function CBWorkspacePage() {
  const { toolKey } = useParams();

  if (!toolKey || !validTools.has(toolKey)) {
    return <Navigate to="/cb" replace />;
  }

  const meta = cbToolMeta[toolKey];
  const tabs = cbWorkspaceTabs[toolKey];

  return <CBWorkspaceContent toolKey={toolKey} meta={meta} tabs={tabs} />;
}

function CBWorkspaceContent({
  toolKey,
  meta,
  tabs,
}: {
  toolKey: string;
  meta: { title: string; codification: string; description: string };
  tabs: typeof cbWorkspaceTabs[string];
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const currentTab = tabs.find((t) => t.key === activeTab) || tabs[0];

  const tabItems: TabItem[] = tabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    icon: tab.icon ? iconMap[tab.icon] : undefined,
    count: 0,
  }));

  return (
    <ToolLayout
      header={
        <ToolHeader
          title={meta.title}
          codification={meta.codification}
          description={meta.description}
        />
      }
      tabBar={
        <TabLayout activeTab={activeTab} onTabChange={setActiveTab} tabs={tabItems}>
          {null}
        </TabLayout>
      }
      workspace={<TabWorkspace tab={currentTab} />}
    />
  );
}
