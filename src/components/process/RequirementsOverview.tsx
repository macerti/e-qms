import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Circle, Info } from "lucide-react";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RequirementsOverviewProps {
  processId: string;
}

export function RequirementsOverview({ processId }: RequirementsOverviewProps) {
  const { getRequirementsOverview, inferFulfillment } = useManagementSystem();
  
  const overview = getRequirementsOverview(processId);
  
  if (overview.total === 0) {
    return null;
  }

  const genericReqs = overview.requirements.filter(r => r.type === "generic");
  const uniqueReqs = overview.requirements.filter(r => r.type === "unique");
  
  return (
    <div className="space-y-4 mt-6">
      {/* Section A: Requirements Allocated to This Process */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">Requirements Allocated to This Process</h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              {overview.satisfied}
            </span>
            <span>/</span>
            <span>{overview.total}</span>
          </div>
        </div>
        
        {/* Generic Requirements */}
        {genericReqs.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Generic
              </Badge>
              <span className="text-xs text-muted-foreground">
                Via Management System Governance activity
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <TooltipProvider>
                {genericReqs.map((req) => {
                  const fulfillment = inferFulfillment(req, processId);
                  const isSatisfied = fulfillment.state === "satisfied";
                  
                  return (
                    <Tooltip key={req.id}>
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
                          {req.clauseNumber}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{req.clauseTitle}</p>
                          <p className="text-xs text-muted-foreground">{req.description}</p>
                          <div className="pt-1 border-t border-border/50 mt-1">
                            <span className={`text-xs ${isSatisfied ? "text-green-600" : "text-amber-600"}`}>
                              {isSatisfied ? "✓ Satisfied" : "○ Not yet satisfied"}
                            </span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>
        )}
        
        {/* Unique Requirements (for visibility) */}
        {uniqueReqs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/50 text-amber-600">
                Unique
              </Badge>
              <span className="text-xs text-muted-foreground">
                System-wide requirements
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <TooltipProvider>
                {uniqueReqs.map((req) => (
                  <Tooltip key={req.id}>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        <Info className="w-3 h-3 mr-1" />
                        {req.clauseNumber}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{req.clauseTitle}</p>
                        <p className="text-xs text-muted-foreground">{req.description}</p>
                        <p className="text-[10px] text-amber-600 pt-1">
                          Unique requirement - allocated system-wide
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          <span>Satisfied (inferred)</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-muted-foreground" />
          <span>Not yet satisfied</span>
        </div>
      </div>
    </div>
  );
}
