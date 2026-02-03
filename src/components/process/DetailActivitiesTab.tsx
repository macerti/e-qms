import { useState } from "react";
import { ListOrdered, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProcessActivity } from "@/types/management-system";
import { ActivityDetailCard } from "./ActivityDetailCard";
import { RequirementsOverview } from "./RequirementsOverview";
import { GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";

interface DetailActivitiesTabProps {
  activities: ProcessActivity[];
  processId: string;
}

export function DetailActivitiesTab({ activities, processId }: DetailActivitiesTabProps) {
  const { updateProcess, getProcessById } = useManagementSystem();
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");
  
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

  return (
    <div className="space-y-6">
      {/* Governance Activity Section */}
      {governanceActivity && (
        <section>
          <ActivityDetailCard
            activity={governanceActivity}
            index={-1}
            processId={processId}
            onUpdate={handleUpdateActivity}
            isEditable={false}
          />
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
          <div className="space-y-3">
            {userActivities.sort((a, b) => a.sequence - b.sequence).map((activity, index) => (
              <ActivityDetailCard
                key={activity.id}
                activity={activity}
                index={index}
                processId={processId}
                onUpdate={handleUpdateActivity}
                onDelete={handleDeleteActivity}
                isEditable
              />
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
                    >
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
    </div>
  );
}
