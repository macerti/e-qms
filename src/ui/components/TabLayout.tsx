import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface TabLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabItem[];
  children?: ReactNode;
}

export function TabLayout({ activeTab, onTabChange, tabs, children }: TabLayoutProps) {
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-1.5">
          <TabsList className="no-scrollbar touch-scroll flex h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className={cn(
                    "group relative flex-none items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5",
                    "text-xs font-medium text-muted-foreground",
                    "border border-transparent transition-all duration-200",
                    "hover:bg-background/60 hover:text-foreground",
                    "data-[state=active]:border-border/70 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                    "sm:px-4 sm:text-sm"
                  )}
                >
                  {Icon && (
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-60 group-data-[state=active]:opacity-100 sm:h-4 sm:w-4" />
                  )}
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span className="ml-1 inline-flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-muted px-1 text-[0.6rem] font-semibold tabular-nums text-muted-foreground group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary sm:text-[0.65rem]">
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </Tabs>
      {children}
    </div>
  );
}
