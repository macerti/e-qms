import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Lock, 
  Pencil, 
  Check, 
  X,
  Trash2,
  ListOrdered,
} from "lucide-react";
import { ProcessActivity } from "@/types/management-system";
import { Requirement, GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";
import { RequirementAllocationPicker } from "./RequirementAllocationPicker";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";

interface ActivityDetailPanelProps {
  activity: ProcessActivity | null;
  processId: string;
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (activityId: string, updates: Partial<ProcessActivity>) => void;
  onDelete?: (activityId: string) => void;
}

export function ActivityDetailPanel({
  activity,
  processId,
  index,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: ActivityDetailPanelProps) {
  const { getRequirementsForActivity } = useManagementSystem();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [allocatedRequirements, setAllocatedRequirements] = useState<Requirement[]>([]);

  const isGovernance = activity?.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX) || false;

  // Reset state when activity changes
  useEffect(() => {
    if (activity) {
      setEditName(activity.name);
      setEditDescription(activity.description || "");
      // Get allocated requirements for this activity
      const reqs = getRequirementsForActivity(processId, activity.id);
      setAllocatedRequirements(reqs);
    }
    setIsEditing(false);
  }, [activity, processId, getRequirementsForActivity]);

  if (!activity) return null;

  const handleSave = () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditName(activity.name);
      setIsEditing(false);
      return;
    }
    onUpdate(activity.id, {
      name: trimmedName,
      description: editDescription.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(activity.name);
    setEditDescription(activity.description || "");
    setIsEditing(false);
  };

  const handleAllocate = (requirement: Requirement) => {
    setAllocatedRequirements(prev => [...prev, requirement]);
    // Note: In a real implementation, this would persist to backend
  };

  const handleDeallocate = (requirement: Requirement) => {
    if (requirement.type === "generic") return; // Cannot remove generic
    setAllocatedRequirements(prev => prev.filter(r => r.id !== requirement.id));
    // Note: In a real implementation, this would persist to backend
  };

  const handleDelete = () => {
    if (isGovernance) return;
    onDelete?.(activity.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1 pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListOrdered className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Activity</span>
            {isGovernance ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                <Lock className="w-2.5 h-2.5 mr-1" />
                System
              </Badge>
            ) : (
              <span className="font-mono text-xs">#{index + 1}</span>
            )}
          </div>
          
          {isEditing && !isGovernance ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-lg font-semibold h-auto py-1"
              autoFocus
            />
          ) : (
            <SheetTitle className="flex items-center gap-2">
              {activity.name}
              {!isGovernance && !isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
            </SheetTitle>
          )}
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Description */}
          <section className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            {isEditing && !isGovernance ? (
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe this activity..."
                rows={4}
              />
            ) : (
              <p className={cn(
                "text-sm leading-relaxed",
                !activity.description && "text-muted-foreground italic"
              )}>
                {activity.description || "No description provided"}
              </p>
            )}
          </section>

          {/* Edit Actions */}
          {isEditing && !isGovernance && (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="gap-1">
                <Check className="w-3 h-3" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}

          {/* Requirements Section */}
          <section className="pt-4 border-t border-border">
            <RequirementAllocationPicker
              processId={processId}
              activityId={activity.id}
              allocatedRequirements={allocatedRequirements}
              onAllocate={handleAllocate}
              onDeallocate={handleDeallocate}
              isGovernance={isGovernance}
              isEditing={!isGovernance}
            />
          </section>

          {/* Governance Info */}
          {isGovernance && (
            <section className="pt-4 border-t border-border">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">System Governance Activity</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This activity is automatically created for every process and hosts generic ISO 9001 requirements. 
                    It cannot be renamed or deleted.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Delete Action */}
          {!isGovernance && onDelete && (
            <section className="pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Activity
              </Button>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
