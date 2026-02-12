import { Workflow } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContextHelp } from "@/ui/patterns/help/ContextHelp";
import { helpConfig } from "@/ui/patterns/help/helpConfig";

interface ProcessLinkBadgeProps {
  value?: string;
  processOptions?: Array<{ value: string; label: string }>;
  onValueChange?: (value: string) => void;
}

export function ProcessLinkBadge({
  value = "not_assigned",
  processOptions = [],
  onValueChange,
}: ProcessLinkBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Workflow className="h-4 w-4" />
        Linked Process
        <ContextHelp text={helpConfig.linkedProcess} />
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 w-[220px] bg-background">
          <SelectValue placeholder="Not Assigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not_assigned">Not Assigned</SelectItem>
          {processOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
