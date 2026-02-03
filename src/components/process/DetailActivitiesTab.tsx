import { useState } from "react";
import { ListOrdered, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProcessActivity } from "@/types/management-system";
import { ActivityDetailPanel } from "./ActivityDetailPanel";
import { RequirementsOverview } from "./RequirementsOverview";
import { GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ShieldCheck, Lock, Pencil, Check } from "lucide-react";

interface DetailActivitiesTabProps {
  activities: ProcessActivity[];
  processId: string;
}

export function DetailActivitiesTab({ activities, processId }: DetailActivitiesTabProps) {
  const { updateProcess, getProcessById, getRequirementsForActivity, inferFulfillment } = useManagementSystem();
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<ProcessActivity | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Separate governance activity from user activities
  const governanceActivity = activities.find(a => a.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX));
  const userActivities = activities.filter(a => !a.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX));
  
  const handleUpdateActivity = (activityId: string, updates: Partial<ProcessActivity>) => {
    const process = getProcessById(processId);
    if (!process) return;
    
    const updatedActivities = process.activities.map(a => 
      a.id === activityId ? { ...a, ...updates } : a
    );
    
    updateProcess(processId, { activities: updatedActivities }, `Updated activity: ${updates.name || 'description updated'}`);
    toast.success("Activity updated");
  };
  
  const handleDeleteActivity = (activityId: string) => {
    const process = getProcessById(processId);
    if (!process) return;
    
    // Cannot delete governance activity
    if (activityId.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX)) return;
    
    const activityToDelete = process.activities.find(a => a.id === activityId);
    const updatedActivities = process.activities.filter(a => a.id !== activityId);
    
    updateProcess(processId, { activities: updatedActivities }, `Removed activity: ${activityToDelete?.name || 'unnamed'}`);
    toast.success("Activity removed");
  };
  
  const handleAddActivity = () => {
    const trimmedName = newActivityName.trim();
    if (!trimmedName) {
      toast.error("Activity name is required");
      return;
    }
    
    const process = getProcessById(processId);
    if (!process) return;
    
    const newActivity: ProcessActivity = {
      id: crypto.randomUUID(),
      name: trimmedName,
      description: newActivityDescription.trim() || undefined,
      sequence: process.activities.length + 1,
    };
    
    const updatedActivities = [...process.activities, newActivity];
    
    updateProcess(processId, { activities: updatedActivities }, `Added activity: ${trimmedName}`);
    toast.success("Activity added");
    
    // Reset form
    setNewActivityName("");
    setNewActivityDescription("");
    setIsAddingActivity(false);
  };
  
  const handleCancelAdd = () => {
    setNewActivityName("");
    setNewActivityDescription("");
    setIsAddingActivity(false);
  };

  const handleActivityClick = (activity: ProcessActivity, index: number) => {
    setSelectedActivity(activity);
    setSelectedIndex(index);
  };

  // Count satisfied requirements for an activity
  const getRequirementStats = (activityId: string) => {
    const reqs = getRequirementsForActivity(processId, activityId);
    const satisfied = reqs.filter(r => inferFulfillment(r, processId).state === "satisfied").length;
    return { total: reqs.length, satisfied };
  };

  return (
    <div className="space-y-6">
      {/* Governance Activity Section */}
      {governanceActivity && (
        <section>
          <button
            type="button"
            onClick={() => handleActivityClick(governanceActivity, -1)}
            className="w-full text-left p-4 bg-primary/5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 text-primary shrink-0 pt-0.5">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-mono text-xs w-6">0.</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium">{governanceActivity.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    <Lock className="w-2.5 h-2.5 mr-1" />
                    System
                  </Badge>
                </div>
                {governanceActivity.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {governanceActivity.description}
                  </p>
                )}
                
                {/* Requirements count */}
                {(() => {
                  const stats = getRequirementStats(governanceActivity.id);
                  return stats.total > 0 ? (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{stats.satisfied}/{stats.total} requirements satisfied</span>
                    </div>
                  ) : null;
                })()}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>
          </button>
        </section>
      )}

      {/* User-defined Activities Section */}
      <section className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Process Activities
            </h3>
          </div>
          {!isAddingActivity && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingActivity(true)}
              className="h-7 text-xs gap-1"
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          )}
        </div>
        
        {userActivities.length === 0 && !isAddingActivity ? (
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">
              No custom activities defined for this process.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingActivity(true)}
              className="mt-3 gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {userActivities.sort((a, b) => a.sequence - b.sequence).map((activity, index) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => handleActivityClick(activity, index)}
                className={cn(
                  "w-full text-left p-4 bg-muted/50 rounded-lg border border-border",
                  "hover:bg-muted/70 transition-colors"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-6 pt-0.5">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.name}</p>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    
                    {/* Requirements count for user activity */}
                    {(() => {
                      const stats = getRequirementStats(activity.id);
                      return stats.total > 0 ? (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{stats.satisfied}/{stats.total} requirements</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <ShieldCheck className="w-3 h-3 opacity-50" />
                          <span className="italic">No requirements</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
            
            {/* Add new activity inline form */}
            {isAddingActivity && (
              <div className="p-4 bg-primary/5 rounded-lg border-2 border-dashed border-primary/30">
                <p className="text-sm font-medium mb-3">New Activity</p>
                <div className="space-y-3">
                  <Input
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    placeholder="Activity name"
                    className="bg-background"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddActivity();
                      }
                      if (e.key === "Escape") {
                        handleCancelAdd();
                      }
                    }}
                  />
                  <Textarea
                    value={newActivityDescription}
                    onChange={(e) => setNewActivityDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={2}
                    className="bg-background text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddActivity}
                      className="gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Add Activity
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelAdd}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Requirements Overview */}
      <RequirementsOverview processId={processId} />

      {/* Activity Detail Panel */}
      <ActivityDetailPanel
        activity={selectedActivity}
        processId={processId}
        index={selectedIndex}
        open={selectedActivity !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedActivity(null);
        }}
        onUpdate={handleUpdateActivity}
        onDelete={handleDeleteActivity}
      />
    </div>
  );
}
