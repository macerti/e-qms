import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  FileCheck,
  ChevronRight,
  Workflow,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";

export default function KPIDashboard() {
  const navigate = useNavigate();
  const {
    objectives,
    kpis,
    processes,
    getActiveKPIsByProcess,
    getCurrentKPIValue,
    calculateComplianceMetrics,
    functionInstances,
  } = useManagementSystem();

  const complianceMetrics = calculateComplianceMetrics();
  const hasData = objectives.length > 0 || kpis.length > 0 || functionInstances.length > 0;

  // Calculate KPI performance
  const activeKPIs = kpis.filter(k => k.status === 'active');
  const kpisWithValues = activeKPIs.filter(k => k.valueHistory.length > 0);
  const kpisOnTarget = kpisWithValues.filter(k => {
    const current = getCurrentKPIValue(k);
    return current && current.value >= k.target;
  });

  // Calculate objective stats
  const activeObjectives = objectives.filter(o => o.status === 'active');
  const achievedObjectives = objectives.filter(o => o.status === 'achieved');

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  if (!hasData) {
    return (
      <div className="min-h-screen">
        <PageHeader 
          title="Dashboard & KPIs" 
          subtitle="Performance Monitoring"
        />

        <div className="px-4 py-6">
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-kpi/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-kpi" />
            </div>
            
            <h3 className="font-serif text-lg font-semibold mb-2">
              No Data Available
            </h3>
            
            <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
              Create processes and define objectives and KPIs to start monitoring performance.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => navigate('/processes/new')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              >
                Create Process
              </button>
              <button
                onClick={() => navigate('/compliance')}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium"
              >
                View Compliance
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Dashboard & KPIs" 
        subtitle="Performance Monitoring"
      />

      <div className="px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/compliance')}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Compliance</span>
            </div>
            <p className={cn("text-3xl font-bold", getComplianceColor(complianceMetrics.compliancePercentage))}>
              {complianceMetrics.compliancePercentage}%
            </p>
            <Progress value={complianceMetrics.compliancePercentage} className="h-1.5 mt-2" />
          </button>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-kpi" />
              <span className="text-xs text-muted-foreground">Objectives</span>
            </div>
            <p className="text-3xl font-bold">
              {activeObjectives.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {achievedObjectives.length} achieved
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-kpi" />
              <span className="text-xs text-muted-foreground">KPIs</span>
            </div>
            <p className="text-3xl font-bold">
              {activeKPIs.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {kpisOnTarget.length} on target
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Workflow className="w-5 h-5 text-process" />
              <span className="text-xs text-muted-foreground">Processes</span>
            </div>
            <p className="text-3xl font-bold">
              {processes.filter(p => p.status === 'active').length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              active
            </p>
          </div>
        </div>

        {/* Objectives Overview */}
        {objectives.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-kpi" />
              Objectives
            </h3>
            
            <div className="space-y-2">
              {objectives.slice(0, 5).map((objective) => {
                const process = processes.find(p => p.id === objective.processId);
                const relatedKPIs = kpis.filter(k => k.objectiveId === objective.id);
                
                return (
                  <div 
                    key={objective.id}
                    className="bg-card border border-border rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{objective.name}</p>
                          {objective.status === 'achieved' && (
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                          )}
                        </div>
                        {process && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {process.name}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={objective.status === 'achieved' ? 'default' : 'secondary'}
                        className="text-xs shrink-0"
                      >
                        {objective.status}
                      </Badge>
                    </div>
                    {relatedKPIs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          {relatedKPIs.length} KPI{relatedKPIs.length > 1 ? 's' : ''} linked
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KPIs Overview */}
        {activeKPIs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-kpi" />
              Key Performance Indicators
            </h3>
            
            <div className="space-y-2">
              {activeKPIs.slice(0, 5).map((kpi) => {
                const currentValue = getCurrentKPIValue(kpi);
                const process = processes.find(p => p.id === kpi.processId);
                const isOnTarget = currentValue && currentValue.value >= kpi.target;
                const percentage = currentValue 
                  ? Math.min(100, Math.round((currentValue.value / kpi.target) * 100))
                  : 0;
                
                return (
                  <div 
                    key={kpi.id}
                    className="bg-card border border-border rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{kpi.name}</p>
                        {process && (
                          <p className="text-xs text-muted-foreground">
                            {process.name}
                          </p>
                        )}
                      </div>
                      <span className={cn(
                        "font-bold text-lg",
                        isOnTarget ? "text-success" : "text-muted-foreground"
                      )}>
                        {currentValue ? currentValue.value : '—'}
                        {kpi.unit && <span className="text-sm ml-0.5">{kpi.unit}</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={percentage} 
                        className={cn("h-2 flex-1", isOnTarget && "[&>div]:bg-success")}
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        / {kpi.target}{kpi.unit && ` ${kpi.unit}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-serif font-semibold">Quick Actions</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => navigate('/compliance')}
              className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-primary" />
                <span className="font-medium">View Compliance Dashboard</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate('/processes')}
              className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Workflow className="w-5 h-5 text-process" />
                <span className="font-medium">Manage Processes</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
