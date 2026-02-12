import { EmptyStateBlock } from "@/components/tools/shared/components/EmptyStateBlock";
import { EditableTable } from "@/components/tools/shared/components/EditableTable";
import { ContextHelp } from "@/ui/patterns/help/ContextHelp";
import { helpConfig } from "@/ui/patterns/help/helpConfig";

export interface WorkspaceTab {
  key: string;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: string[];
}

interface TabWorkspaceProps {
  tab: WorkspaceTab;
}

export function TabWorkspace({ tab }: TabWorkspaceProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">{tab.label}</h3>
        <ContextHelp text={helpConfig.scaffoldTable} />
      </div>
      <EmptyStateBlock title={tab.emptyTitle} description={tab.emptyDescription} actionLabel={`Create ${tab.label}`} />
      <EditableTable columns={tab.columns} />
    </div>
  );
}
