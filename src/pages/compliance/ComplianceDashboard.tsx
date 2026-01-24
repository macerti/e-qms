import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap,
  TrendingUp,
  BarChart3,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { getFunctionById } from "@/data/iso9001-functions";
import { FUNCTION_STATUS_LABELS, FUNCTION_STATUS_COLORS, FunctionInstanceStatus } from "@/types/functions";
import { cn } from "@/lib/utils";

export default function ComplianceDashboard() {
  const navigate = useNavigate();
  const {
    calculateComplianceMetrics,
    getComplianceByCategory,
    getComplianceByClause,
    getComplianceByProcess,
    getAllFunctionInstances,
    getProcessById,
    processes,
  } = useManagementSystem();

  const overallMetrics = calculateComplianceMetrics();
  const categoryCompliance = getComplianceByCategory();
  const clauseCompliance = getComplianceByClause();
  const allInstances = getAllFunctionInstances();

  // Get instances with issues (nonconformity or improvement opportunity)
  const issueInstances = allInstances.filter(
    fi => fi.status === 'nonconformity' || fi.status === 'improvement_opportunity'
  );

  // Get recently updated instances
  const recentInstances = [...allInstances]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getStatusIcon = (status: FunctionInstanceStatus) => {
    switch (status) {
      case 'implemented': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'partially_implemented': return <Clock className="w-4 h-4 text-warning" />;
      case 'nonconformity': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'improvement_opportunity': return <Zap className="w-4 h-4 text-kpi" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Compliance Dashboard"
        subtitle="ISO 9001:2015 Function Implementation"
      />

      <div className="px-4 py-6 space-y-6">
        {/* Overall Compliance */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">Overall Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  {overallMetrics.totalFunctions} functions tracked
                </p>
              </div>
            </div>
            <div className={cn("text-4xl font-bold", getComplianceColor(overallMetrics.compliancePercentage))}>
              {overallMetrics.compliancePercentage}%
            </div>
          </div>

          <Progress 
            value={overallMetrics.compliancePercentage} 
            className="h-3"
          />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-success">{overallMetrics.implementedCount}</p>
              <p className="text-xs text-muted-foreground">Implemented</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-warning">{overallMetrics.partiallyImplementedCount}</p>
              <p className="text-xs text-muted-foreground">Partial</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-muted-foreground">{overallMetrics.notImplementedCount}</p>
              <p className="text-xs text-muted-foreground">Not Implemented</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-destructive">{overallMetrics.nonconformityCount}</p>
              <p className="text-xs text-muted-foreground">Nonconformities</p>
            </div>
          </div>
        </div>

        {/* Compliance by ISO Clause */}
        <div className="space-y-3">
          <h3 className="font-serif font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Compliance by Clause
          </h3>
          
          <div className="space-y-2">
            {clauseCompliance.filter(c => c.metrics.totalFunctions > 0).map((item) => (
              <div 
                key={item.clause}
                className="bg-card border border-border rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      Clause {item.clause}
                    </Badge>
                    <span className="text-sm font-medium">{item.clauseLabel}</span>
                  </div>
                  <span className={cn("font-bold", getComplianceColor(item.metrics.compliancePercentage))}>
                    {item.metrics.compliancePercentage}%
                  </span>
                </div>
                <Progress 
                  value={item.metrics.compliancePercentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {item.metrics.implementedCount}/{item.metrics.totalFunctions} implemented
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance by Category */}
        <div className="space-y-3">
          <h3 className="font-serif font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-kpi" />
            Compliance by Category
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {categoryCompliance.filter(c => c.metrics.totalFunctions > 0).map((item) => (
              <div 
                key={item.category}
                className="bg-card border border-border rounded-lg p-3"
              >
                <p className="text-xs text-muted-foreground truncate">{item.categoryLabel}</p>
                <p className={cn("text-2xl font-bold mt-1", getComplianceColor(item.metrics.compliancePercentage))}>
                  {item.metrics.compliancePercentage}%
                </p>
                <Progress 
                  value={item.metrics.compliancePercentage} 
                  className="h-1.5 mt-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Compliance by Process */}
        <div className="space-y-3">
          <h3 className="font-serif font-semibold">Compliance by Process</h3>
          
          <div className="space-y-2">
            {processes.filter(p => p.status === 'active').map((process) => {
              const processMetrics = getComplianceByProcess(process.id);
              if (processMetrics.totalFunctions === 0) return null;
              
              return (
                <button
                  key={process.id}
                  onClick={() => navigate(`/processes/${process.id}`)}
                  className="w-full bg-card border border-border rounded-lg p-3 text-left hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{process.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {processMetrics.implementedCount}/{processMetrics.totalFunctions} functions implemented
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold", getComplianceColor(processMetrics.compliancePercentage))}>
                        {processMetrics.compliancePercentage}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Issues & Opportunities */}
        {issueInstances.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Attention Required
            </h3>
            
            <div className="space-y-2">
              {issueInstances.map((instance) => {
                const fn = getFunctionById(instance.functionId);
                const process = getProcessById(instance.processId);
                
                return (
                  <button
                    key={instance.id}
                    onClick={() => navigate(`/functions/${instance.id}`)}
                    className="w-full bg-card border border-border rounded-lg p-3 text-left hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(instance.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{fn?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {process?.name}
                        </p>
                        <Badge 
                          className={cn("mt-2 text-xs", FUNCTION_STATUS_COLORS[instance.status])}
                        >
                          {FUNCTION_STATUS_LABELS[instance.status]}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentInstances.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-semibold">Recent Activity</h3>
            
            <div className="space-y-2">
              {recentInstances.map((instance) => {
                const fn = getFunctionById(instance.functionId);
                
                return (
                  <button
                    key={instance.id}
                    onClick={() => navigate(`/functions/${instance.id}`)}
                    className="w-full bg-muted/30 rounded-lg p-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(instance.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fn?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(instance.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allInstances.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold mb-2">No Functions Tracked</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
              Create processes to automatically assign ISO 9001 functions and start tracking compliance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
