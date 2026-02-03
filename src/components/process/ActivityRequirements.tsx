import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Circle } from "lucide-react";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { Requirement, RequirementFulfillment } from "@/types/requirements";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityRequirementsProps {
  processId: string;
  activityId: string;
  isGovernance?: boolean;
}

export function ActivityRequirements({ 
  processId, 
  activityId, 
  isGovernance 
}: ActivityRequirementsProps) {
  const { getRequirementsForActivity, inferFulfillment } = useManagementSystem();
  
  const requirements = getRequirementsForActivity(processId, activityId);
  
  if (requirements.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Associated Requirements
        </span>
        {isGovernance && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            System
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <TooltipProvider>
          {requirements.map((req) => {
            const fulfillment = inferFulfillment(req, processId);
            return (
              <RequirementBadge 
                key={req.id} 
                requirement={req} 
                fulfillment={fulfillment}
              />
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}

interface RequirementBadgeProps {
  requirement: Requirement;
  fulfillment: RequirementFulfillment;
}

function RequirementBadge({ requirement, fulfillment }: RequirementBadgeProps) {
  const isSatisfied = fulfillment.state === "satisfied";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={isSatisfied ? "default" : "secondary"}
          className={`text-xs cursor-help transition-colors ${
            isSatisfied 
              ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" 
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isSatisfied ? (
            <CheckCircle2 className="w-3 h-3 mr-1" />
          ) : (
            <Circle className="w-3 h-3 mr-1" />
          )}
          {requirement.clauseNumber}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium text-sm">{requirement.clauseTitle}</p>
          <p className="text-xs text-muted-foreground">{requirement.description}</p>
          <div className="pt-1 border-t border-border/50 mt-1">
            <span className={`text-xs ${isSatisfied ? "text-green-600" : "text-amber-600"}`}>
              {isSatisfied ? "✓ Satisfied" : "○ Not yet satisfied"}
            </span>
            {fulfillment.inferredFrom.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Inferred from {fulfillment.inferredFrom.length} linked item(s)
              </p>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
