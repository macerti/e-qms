import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Plus, 
  X,
  Search,
} from "lucide-react";
import { Requirement } from "@/types/requirements";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RequirementAllocationPickerProps {
  processId: string;
  activityId: string;
  allocatedRequirements: Requirement[];
  onAllocate: (requirement: Requirement) => void;
  onDeallocate: (requirement: Requirement) => void;
  isGovernance?: boolean;
  isEditing?: boolean;
}

export function RequirementAllocationPicker({
  processId,
  allocatedRequirements,
  onAllocate,
  onDeallocate,
  isGovernance = false,
  isEditing = false,
}: RequirementAllocationPickerProps) {
  const { allRequirements, inferFulfillment } = useManagementSystem();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAvailable, setShowAvailable] = useState(false);

  // Get available requirements (not already allocated to this activity)
  const allocatedIds = new Set(allocatedRequirements.map(r => r.id));
  const availableRequirements = allRequirements.filter(r => !allocatedIds.has(r.id));

  // Filter by search term
  const filteredAvailable = availableRequirements.filter(r =>
    r.clauseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.clauseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: Requirement["type"]) => {
    switch (type) {
      case "generic": return "Generic";
      case "unique": return "Unique";
      case "duplicable": return "Duplicable";
    }
  };

  const getTypeBadgeClass = (type: Requirement["type"]) => {
    switch (type) {
      case "generic": return "bg-primary/10 text-primary border-primary/30";
      case "unique": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "duplicable": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Associated Requirements
        </span>
        {isGovernance && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            <Lock className="w-2.5 h-2.5 mr-1" />
            System
          </Badge>
        )}
      </div>

      {/* Allocated Requirements */}
      {allocatedRequirements.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">
          No requirements associated with this activity yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <TooltipProvider>
            {allocatedRequirements.map((req) => {
              const fulfillment = inferFulfillment(req, processId);
              const isSatisfied = fulfillment.state === "satisfied";
              const isRemovable = !isGovernance && req.type !== "generic" && isEditing;

              return (
                <Tooltip key={req.id}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs transition-colors cursor-help",
                        isSatisfied 
                          ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" 
                          : "bg-muted text-muted-foreground",
                        isRemovable && "pr-1"
                      )}
                    >
                      {isSatisfied ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <Circle className="w-3 h-3 mr-1" />
                      )}
                      {req.clauseNumber}
                      {isRemovable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeallocate(req);
                          }}
                          className="ml-1.5 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px] px-1 py-0", getTypeBadgeClass(req.type))}>
                          {getTypeLabel(req.type)}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{req.clauseTitle}</p>
                      <p className="text-xs text-muted-foreground">{req.description}</p>
                      <div className="pt-1 border-t border-border/50 mt-1">
                        <span className={`text-xs ${isSatisfied ? "text-green-600" : "text-amber-600"}`}>
                          {isSatisfied ? "✓ Satisfied" : "○ Not yet satisfied"}
                        </span>
                      </div>
                      {req.type === "generic" && (
                        <p className="text-[10px] text-muted-foreground">
                          System requirement — cannot be removed
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}

      {/* Add Requirements Button / Picker */}
      {isEditing && !isGovernance && (
        <div className="pt-2">
          {!showAvailable ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAvailable(true)}
              className="w-full text-xs gap-1"
            >
              <Plus className="w-3 h-3" />
              Allocate Requirements
            </Button>
          ) : (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-dashed border-border">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search requirements..."
                  className="h-8 pl-8 text-sm"
                  autoFocus
                />
              </div>

              {/* Available Requirements */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredAvailable.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    {searchTerm ? "No matching requirements" : "All requirements allocated"}
                  </p>
                ) : (
                  filteredAvailable.map((req) => (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => {
                        onAllocate(req);
                        setSearchTerm("");
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted text-left transition-colors"
                    >
                      <Plus className="w-3 h-3 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium">{req.clauseNumber}</span>
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getTypeBadgeClass(req.type))}>
                            {getTypeLabel(req.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{req.clauseTitle}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Close picker */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAvailable(false);
                  setSearchTerm("");
                }}
                className="w-full text-xs"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
