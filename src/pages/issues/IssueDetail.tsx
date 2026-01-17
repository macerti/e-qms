import { useParams, useNavigate } from "react-router-dom";
import { Edit, AlertTriangle, History, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RiskMatrix } from "@/components/risk/RiskMatrix";
import { getPriorityFromCriticity } from "@/components/risk/RiskEvaluation";
import { SwotQuadrant } from "@/types/management-system";

const quadrantConfig: Record<SwotQuadrant, { label: string; color: string; bgColor: string }> = {
  strength: { label: "Strength", color: "text-swot-strength", bgColor: "bg-swot-strength/10" },
  weakness: { label: "Weakness", color: "text-swot-weakness", bgColor: "bg-swot-weakness/10" },
  opportunity: { label: "Opportunity", color: "text-swot-opportunity", bgColor: "bg-swot-opportunity/10" },
  threat: { label: "Threat", color: "text-swot-threat", bgColor: "bg-swot-threat/10" },
};

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, processes, actions, getLatestRiskVersion, getRiskHistory } = useManagementSystem();

  const issue = issues.find(i => i.id === id);

  if (!issue) {
    return (
      <div className="min-h-screen">
        <AdaptiveContainer className="py-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Issue Not Found</h2>
            <p className="text-muted-foreground mb-4">The issue you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/issues")}>Back to Issues</Button>
          </div>
        </AdaptiveContainer>
      </div>
    );
  }

  const process = processes.find(p => p.id === issue.processId);
  const config = quadrantConfig[issue.quadrant];
  const isRisk = issue.type === "risk";
  const latestRisk = isRisk ? getLatestRiskVersion(issue.id) : null;
  const riskHistory = isRisk ? getRiskHistory(issue.id) : [];
  
  // Get implemented controls - actions linked to this issue that are completed or evaluated
  const implementedControls = actions.filter(a => 
    a.linkedIssueIds?.includes(issue.id) && 
    (a.status === "completed_pending_evaluation" || a.status === "evaluated")
  ).sort((a, b) => new Date(b.completedDate || b.updatedAt).getTime() - new Date(a.completedDate || a.updatedAt).getTime());
  
  const priorityInfo = latestRisk ? getPriorityFromCriticity(latestRisk.criticity) : null;

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={issue.code}
        subtitle={config.label}
        showBack
      />

      <AdaptiveContainer className="py-4 space-y-4">
        {/* Main Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("module-badge", config.bgColor, config.color)}>
                  {config.label}
                </span>
                <Badge variant="outline">
                  {issue.contextNature === "internal" ? "Internal" : "External"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate(`/issues/${id}/edit`)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{issue.description}</p>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Process:</span>{" "}
                <span className="font-medium">{process?.name || "Unknown"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                <span className="font-medium">{format(new Date(issue.createdAt), "dd MMM yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Evaluation Section - Only for Weakness/Threat */}
        {isRisk && latestRisk && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-risk" />
                Current Risk State
                {riskHistory.length > 1 && (
                  <Badge variant="secondary" className="ml-2">v{riskHistory.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <RiskMatrix 
                    severity={latestRisk.severity} 
                    probability={latestRisk.probability} 
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Severity</span>
                    <p className="font-semibold">{latestRisk.severity} / 3</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Probability</span>
                    <p className="font-semibold">{latestRisk.probability} / 3</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Criticity</span>
                    <p className={cn(
                      "text-2xl font-bold",
                      latestRisk.criticity >= 7 ? "text-risk" :
                      latestRisk.criticity >= 4 ? "text-warning" :
                      "text-success"
                    )}>
                      {latestRisk.criticity}
                    </p>
                  </div>
                  {priorityInfo && (
                    <div className={cn(
                      "p-2 rounded-lg text-center",
                      priorityInfo.variant === "risk" && "bg-risk/10",
                      priorityInfo.variant === "warning" && "bg-warning/10",
                      priorityInfo.variant === "success" && "bg-success/10"
                    )}>
                      <span className={cn(
                        "text-sm font-bold",
                        priorityInfo.variant === "risk" && "text-risk",
                        priorityInfo.variant === "warning" && "text-warning",
                        priorityInfo.variant === "success" && "text-success"
                      )}>
                        Priority {priorityInfo.priority}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {priorityInfo.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk History */}
        {isRisk && riskHistory.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Risk Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskHistory.map((version, index) => (
                  <div 
                    key={version.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      index === 0 ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        v{version.versionNumber} 
                        {index === 0 && <Badge variant="secondary" className="ml-2">Current</Badge>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(version.date), "dd MMM yyyy")}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span>S: {version.severity}</span>
                      <span>P: {version.probability}</span>
                      <span className={cn(
                        "font-bold",
                        version.criticity >= 7 ? "text-risk" :
                        version.criticity >= 4 ? "text-warning" :
                        "text-success"
                      )}>
                        C: {version.criticity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      Trigger: {version.trigger.replace("_", " ")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Implemented Controls */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-action" />
                Implemented Controls
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/actions/new?issueId=${issue.id}`)}
              >
                Add Action
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {implementedControls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No completed actions linked to this issue yet.
              </p>
            ) : (
              <div className="space-y-2">
                {implementedControls.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => navigate(`/actions/${action.id}`)}
                    className="w-full p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-action">{action.code}</span>
                      {action.efficiencyEvaluation && (
                        <Badge variant={action.efficiencyEvaluation.result === "effective" ? "default" : "destructive"}>
                          {action.efficiencyEvaluation.result === "effective" ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Effective</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Ineffective</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1">{action.title}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AdaptiveContainer>
    </div>
  );
}
