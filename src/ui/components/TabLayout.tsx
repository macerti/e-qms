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
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}
