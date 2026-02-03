import { ListOrdered, ShieldCheck, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProcessActivity } from "@/types/management-system";
import { ActivityRequirements } from "./ActivityRequirements";
import { RequirementsOverview } from "./RequirementsOverview";
import { GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";

interface DetailActivitiesTabProps {
  activities: ProcessActivity[];
  processId: string;
}

export function DetailActivitiesTab({ activities, processId }: DetailActivitiesTabProps) {
  // Separate governance activity from user activities
  const governanceActivity = activities.find(a => a.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX));
  const userActivities = activities.filter(a => !a.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX));
  
  return (
    <div className="space-y-6">
      {/* Governance Activity Section */}
      {governanceActivity && (
        <section className="mobile-card bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              System Governance
            </h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <Lock className="w-2.5 h-2.5 mr-1" />
              System
            </Badge>
          </div>
          
          <div className="mb-3">
            <div className="flex gap-3">
              <span className="font-mono text-xs text-muted-foreground w-6 shrink-0 pt-0.5">
                0.
              </span>
              <div className="flex-1">
                <p className="font-medium">{governanceActivity.name}</p>
                {governanceActivity.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {governanceActivity.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Requirements for governance activity */}
          <ActivityRequirements 
            processId={processId} 
            activityId={governanceActivity.id}
            isGovernance
          />
        </section>
      )}

      {/* User-defined Activities Section */}
      <section className="mobile-card">
        <div className="flex items-center gap-2 mb-4">
          <ListOrdered className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Process Activities
          </h3>
        </div>
        
        {userActivities.length === 0 ? (
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">
              No custom activities defined for this process.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Edit the process to add activities.
            </p>
          </div>
        ) : (
          <ol className="space-y-3">
            {userActivities.sort((a, b) => a.sequence - b.sequence).map((activity, index) => (
              <li key={activity.id} className="flex gap-3">
                <span className="font-mono text-xs text-muted-foreground w-6 shrink-0 pt-0.5">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <p className="font-medium">{activity.name}</p>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {activity.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Requirements Overview */}
      <RequirementsOverview processId={processId} />
    </div>
  );
}
