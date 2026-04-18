import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CB_CLAUSES } from "@/domains/certification-body/cbClauseRefs";
import { cn } from "@/lib/utils";

interface CBClauseBadgeProps {
  code: string;
  className?: string;
}

/**
 * Compact, hoverable badge mapping a UI element to an ISO/IEC 17021-1 clause.
 * Provides instant traceability for users entering certification dispositions.
 */
export function CBClauseBadge({ code, className }: CBClauseBadgeProps) {
  const ref = CB_CLAUSES[code];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[0.65rem] cursor-help border-primary/30 text-primary/90 bg-primary/5",
            className,
          )}
        >
          17021-1 §{code}
        </Badge>
      </TooltipTrigger>
      {ref && (
        <TooltipContent className="max-w-xs">
          <p className="font-semibold text-xs mb-1">{ref.title}</p>
          <p className="text-xs text-muted-foreground">{ref.summary}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
