import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ key: string; label: string }>;
  children?: ReactNode;
}

export function TabLayout({ activeTab, onTabChange, tabs, children }: TabLayoutProps) {
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="no-scrollbar touch-scroll h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-1.5 sm:flex-wrap sm:overflow-visible">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="min-h-11 flex-none whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-xs font-medium leading-none text-muted-foreground transition-all data-[state=active]:border-border/70 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}
