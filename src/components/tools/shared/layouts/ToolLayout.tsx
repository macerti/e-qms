import { ReactNode } from "react";
import { ChevronsLeftRightEllipsis } from "lucide-react";
import { Section } from "@/ui/layout/Section";
import { Page } from "@/ui/layout/Page";

interface ToolLayoutProps {
  header: ReactNode;
  tabBar: ReactNode;
  workspace: ReactNode;
}

export function ToolLayout({ header, tabBar, workspace }: ToolLayoutProps) {
  return (
    <Page>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-4">
          {header}
          {tabBar}
          {workspace}
        </section>

        <Section className="h-fit lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold">Context Panel</h2>
          <p className="mt-2 text-sm text-muted-foreground">Reserved for future cross-tool context and assistants.</p>
          <button type="button" className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ChevronsLeftRightEllipsis className="h-4 w-4" />
            Collapsed
          </button>
        </Section>
      </div>
    </Page>
  );
}
