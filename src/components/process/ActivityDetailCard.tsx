import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GripVertical, 
  ShieldCheck, 
  Lock, 
  Pencil, 
  Check, 
  X,
  Trash2,
} from "lucide-react";
import { ProcessActivity } from "@/types/management-system";
import { ActivityRequirements } from "./ActivityRequirements";
import { GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";
import { cn } from "@/lib/utils";

interface ActivityDetailCardProps {
  activity: ProcessActivity;
  index: number;
  processId: string;
  onUpdate: (activityId: string, updates: Partial<ProcessActivity>) => void;
  onDelete?: (activityId: string) => void;
  isEditable?: boolean;
}

export function ActivityDetailCard({
  activity,
  index,
  processId,
  onUpdate,
  onDelete,
  isEditable = true,
}: ActivityDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activity.name);
  const [editDescription, setEditDescription] = useState(activity.description || "");

  const isGovernance = activity.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Governance activity - special styling and limited editing
  if (isGovernance) {
    return (
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 text-primary shrink-0 pt-0.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-mono text-xs w-6">0.</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium">{activity.name}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                <Lock className="w-2.5 h-2.5 mr-1" />
                System
              </Badge>
            </div>
            {activity.description && (
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
            )}
            
            {/* Requirements for governance activity */}
            <ActivityRequirements 
              processId={processId} 
              activityId={activity.id}
              isGovernance
            />
          </div>
        </div>
      </div>
    );
  }

  // User-defined activity
  return (
    <div 
      className={cn(
        "p-4 bg-muted/50 rounded-lg border border-border transition-colors",
        isEditing && "ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 text-muted-foreground shrink-0 pt-0.5">
          <GripVertical className="w-4 h-4" />
          <span className="font-mono text-xs w-6">{index + 1}.</span>
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3" onKeyDown={handleKeyDown}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Activity name"
                className="bg-background"
                autoFocus
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="bg-background text-sm"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  className="gap-1"
                >
                  <Check className="w-3 h-3" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{activity.name}</p>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {activity.description}
                    </p>
                  )}
                </div>
                
                {isEditable && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(activity.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Associated Requirements - empty state for non-governance */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Associated Requirements
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  No requirements associated with this activity yet.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
