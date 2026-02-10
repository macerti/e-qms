import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { EmptyState } from "@/components/ui/empty-state";
import { HelpCircle } from "lucide-react";

export default function Help() {
  return (
    <div className="min-h-screen">
      <PageHeader title="Help" subtitle="Guides and support resources" />
      <AdaptiveContainer className="py-6">
        <EmptyState
          icon={HelpCircle}
          title="Help center coming soon"
          description="Add onboarding guides, FAQs, and support contacts here."
        />
      </AdaptiveContainer>
    </div>
  );
}
