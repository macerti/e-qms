import { Target, BarChart3 } from "lucide-react";
import { ProcessObjective, ProcessKPI, KPIValueRecord } from "@/api/contracts/viewModels";
import { cn } from "@/lib/utils";

interface DetailKPIsObjectivesTabProps {
  objectives: ProcessObjective[];
  kpis: ProcessKPI[];
  getCurrentKPIValue: (kpi: ProcessKPI) => KPIValueRecord | undefined;
}

export function DetailKPIsObjectivesTab({ 
  objectives, 
  kpis, 
  getCurrentKPIValue 
}: DetailKPIsObjectivesTabProps) {
  const activeKpis = kpis.filter(k => k.status === 'active');
  const archivedKpis = kpis.filter(k => k.status === 'archived');

  const hasNoContent = objectives.length === 0 && kpis.length === 0;

  if (hasNoContent) {
    return (
      <div className="p-6 bg-muted/30 rounded-lg border border-dashed border-border text-center">
        <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No objectives or KPIs defined for this process.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Edit the process to add objectives and KPIs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Objectives */}
      <section className="mobile-card">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-kpi" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Objectives
          </h3>
        </div>
        {objectives.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No objectives defined yet.
          </p>
        ) : (
          <div className="space-y-2">
            {objectives.map((obj) => (
              <div key={obj.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{obj.name}</p>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full shrink-0",
                    obj.status === 'active' && 'bg-kpi/10 text-kpi',
                    obj.status === 'achieved' && 'bg-success/10 text-success',
                    obj.status === 'cancelled' && 'bg-muted text-muted-foreground'
                  )}>
                    {obj.status}
                  </span>
                </div>
                {obj.description && (
                  <p className="text-sm text-muted-foreground mt-1">{obj.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active KPIs */}
      <section className="mobile-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-kpi" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Key Performance Indicators
          </h3>
        </div>
        {activeKpis.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No active KPIs defined yet.
          </p>
        ) : (
          <div className="space-y-3">
            {activeKpis.map((kpi) => {
              const currentValue = getCurrentKPIValue(kpi);
              const linkedObjective = objectives.find(o => o.id === kpi.objectiveId);
              const isOnTarget = currentValue && currentValue.value >= kpi.target;

              return (
                <div key={kpi.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{kpi.name}</p>
                      {linkedObjective && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Linked to: {linkedObjective.name}
                        </p>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0",
                      isOnTarget ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {isOnTarget ? "On Target" : "Below Target"}
                    </span>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Formula:</span>
                      <span className="font-mono ml-1">{kpi.formula}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="ml-1 capitalize">{kpi.frequency}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-medium ml-1">{kpi.target}{kpi.unit && ` ${kpi.unit}`}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <span className={cn(
                        "font-medium ml-1",
                        isOnTarget ? "text-success" : "text-muted-foreground"
                      )}>
                        {currentValue ? `${currentValue.value}${kpi.unit ? ` ${kpi.unit}` : ''}` : "—"}
                      </span>
                    </div>
                  </div>

                  {kpi.valueHistory.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">History ({kpi.valueHistory.length} records)</p>
                      <div className="flex gap-1 flex-wrap">
                        {kpi.valueHistory.slice(-5).map((record) => (
                          <span 
                            key={record.id} 
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded",
                              record.value >= kpi.target ? "bg-success/10" : "bg-muted"
                            )}
                          >
                            {record.value}
                          </span>
                        ))}
                        {kpi.valueHistory.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{kpi.valueHistory.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Archived KPIs */}
      {archivedKpis.length > 0 && (
        <section className="mobile-card opacity-75">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Archived KPIs
            </h3>
          </div>
          <div className="space-y-2">
            {archivedKpis.map((kpi) => (
              <div key={kpi.id} className="p-2 bg-muted/20 rounded-lg border border-border/50">
                <p className="font-medium text-sm text-muted-foreground">{kpi.name}</p>
                <p className="text-xs text-muted-foreground">
                  {kpi.valueHistory.length} historical records
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
