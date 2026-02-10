import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity } from "lucide-react";

export default function ActivityLog() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Activity Log" subtitle="User activity and audit trail" />
      <AdaptiveContainer className="py-6">
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity events will appear here once users start making changes."
        />
      </AdaptiveContainer>
    </div>
  );
}
