import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, GripVertical, ShieldCheck, Lock } from "lucide-react";
import { ProcessActivity } from "@/types/management-system";
import { ActivityRequirements } from "./ActivityRequirements";
import { RequirementsOverview } from "./RequirementsOverview";
import { GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";

interface ActivitiesTabProps {
  activities: ProcessActivity[];
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  processId?: string; // Optional - only present when editing existing process
}

export function ActivitiesTab({ activities, setFormData, processId }: ActivitiesTabProps) {
  // Separate governance activity from user activities
  const governanceActivity = activities.find(a => a.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX));
  const userActivities = activities.filter(a => !a.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX));
  
  const addActivity = () => {
    const newActivity: ProcessActivity = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      sequence: activities.length + 1,
    };
    setFormData((prev: any) => ({ ...prev, activities: [...prev.activities, newActivity] }));
  };

  const removeActivity = (activityId: string) => {
    // Cannot remove system activities
    if (activityId.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX)) return;
    
    setFormData((prev: any) => ({
      ...prev,
      activities: prev.activities.filter((a: ProcessActivity) => a.id !== activityId),
    }));
  };

  const updateActivity = (activityId: string, field: keyof ProcessActivity, value: string | number) => {
    // Cannot update system activity name
    if (activityId.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX) && field === "name") return;
    
    setFormData((prev: any) => ({
      ...prev,
      activities: prev.activities.map((activity: ProcessActivity) => 
        activity.id === activityId ? { ...activity, [field]: value } : activity
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Governance Activity - System-generated, immutable */}
      {governanceActivity && (
        <div className="form-field">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <Label className="mb-0">System Governance Activity</Label>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <Lock className="w-2.5 h-2.5 mr-1" />
              System
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            This activity hosts generic ISO 9001 requirements applicable to all processes.
          </p>
          
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-muted-foreground w-6">0.</span>
              <span className="font-medium">{governanceActivity.name}</span>
            </div>
            {governanceActivity.description && (
              <p className="text-sm text-muted-foreground ml-8">
                {governanceActivity.description}
              </p>
            )}
            
            {/* Show requirements for governance activity */}
            {processId && (
              <div className="ml-8">
                <ActivityRequirements 
                  processId={processId} 
                  activityId={governanceActivity.id}
                  isGovernance
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* User-defined Activities */}
      <div className="form-field">
        <Label>Process Activities</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Define the sequential activities that compose this process. Activities describe the work performed, in order.
        </p>
        
        <div className="space-y-3">
          {userActivities.length === 0 ? (
            <div className="p-6 bg-muted/30 rounded-lg border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">
                No custom activities defined yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add activities to describe the sequence of work within this process.
              </p>
            </div>
          ) : (
            userActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 text-muted-foreground shrink-0 pt-2">
                  <GripVertical className="w-4 h-4" />
                  <span className="font-mono text-xs w-6">{index + 1}.</span>
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={activity.name}
                    onChange={(e) => updateActivity(activity.id, "name", e.target.value)}
                    placeholder="e.g., Receive and validate order"
                    className="bg-background"
                  />
                  <Textarea
                    value={activity.description || ""}
                    onChange={(e) => updateActivity(activity.id, "description", e.target.value)}
                    placeholder="Optional: Describe this activity in more detail..."
                    rows={2}
                    className="bg-background text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeActivity(activity.id)}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addActivity}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Requirements Overview - Only show when editing existing process */}
      {processId && (
        <RequirementsOverview processId={processId} />
      )}
    </div>
  );
}
