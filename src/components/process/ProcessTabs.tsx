import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileText, ListOrdered, BarChart3 } from "lucide-react";

interface ProcessTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function ProcessTabs({ 
  children, 
  defaultValue = "overview",
  value,
  onValueChange 
}: ProcessTabsProps) {
  return (
    <Tabs 
      defaultValue={defaultValue} 
      value={value}
      onValueChange={onValueChange}
      className="w-full"
    >
      {children}
    </Tabs>
  );
}

interface ProcessTabsListProps {
  className?: string;
}

export function ProcessTabsList({ className }: ProcessTabsListProps) {
  return (
    <TabsList 
      className={cn(
        // Base styles - horizontal scrollable on mobile
        "w-full h-auto p-1 bg-muted/50 rounded-lg",
        // Mobile: horizontal scroll with flex
        "flex overflow-x-auto scrollbar-hide",
        // Desktop: justify-start with max-width
        "md:overflow-visible md:justify-start",
        className
      )}
    >
      <TabsTrigger 
        value="overview"
        className={cn(
          "flex-shrink-0 gap-2 px-4 py-2.5 text-sm font-medium",
          "data-[state=active]:bg-background data-[state=active]:shadow-sm",
          "transition-all duration-150"
        )}
      >
        <FileText className="w-4 h-4" />
        <span>Overview</span>
      </TabsTrigger>
      <TabsTrigger 
        value="activities"
        className={cn(
          "flex-shrink-0 gap-2 px-4 py-2.5 text-sm font-medium",
          "data-[state=active]:bg-background data-[state=active]:shadow-sm",
          "transition-all duration-150"
        )}
      >
        <ListOrdered className="w-4 h-4" />
        <span>Activities</span>
      </TabsTrigger>
      <TabsTrigger 
        value="kpis"
        className={cn(
          "flex-shrink-0 gap-2 px-4 py-2.5 text-sm font-medium",
          "data-[state=active]:bg-background data-[state=active]:shadow-sm",
          "transition-all duration-150"
        )}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="hidden sm:inline">KPIs & Objectives</span>
        <span className="sm:hidden">KPIs</span>
      </TabsTrigger>
    </TabsList>
  );
}

interface ProcessTabContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const ProcessTabContent = React.forwardRef<HTMLDivElement, ProcessTabContentProps>(
  ({ value, children, className }, ref) => {
    return (
      <TabsContent 
        ref={ref}
        value={value}
        className={cn(
          "mt-4 animate-in fade-in-50 duration-150",
          className
        )}
      >
        {children}
      </TabsContent>
    );
  }
);
ProcessTabContent.displayName = "ProcessTabContent";
