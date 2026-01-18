import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, AlertTriangle, History, CheckCircle, XCircle, Shield, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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

const severityDefinitions = [
  { level: 1, label: "Minor", description: "Limited impact, easily recoverable" },
  { level: 2, label: "Moderate", description: "Significant impact, requires resources to recover" },
  { level: 3, label: "Major", description: "Severe impact, critical to operations" },
];

const probabilityDefinitions = [
  { level: 1, label: "Low", description: "Unlikely to occur (< 30%)" },
  { level: 2, label: "Medium", description: "May occur (30-70%)" },
  { level: 3, label: "High", description: "Likely to occur (> 70%)" },
];

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, processes, actions, getLatestRiskVersion, getRiskHistory, addRiskVersion, canEvaluateResidualRisk } = useManagementSystem();

  const [showResidualDialog, setShowResidualDialog] = useState(false);
  const [residualSeverity, setResidualSeverity] = useState(1);
  const [residualProbability, setResidualProbability] = useState(1);
  const [residualDescription, setResidualDescription] = useState("");
  const [residualNotes, setResidualNotes] = useState("");

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
  
  // Check if residual risk evaluation is allowed
  const canEvaluateResidual = canEvaluateResidualRisk(issue.id);
  const hasEffectiveActions = implementedControls.some(a => a.efficiencyEvaluation?.result === "effective");

  const handleOpenResidualDialog = () => {
    if (latestRisk) {
      setResidualSeverity(latestRisk.severity);
      setResidualProbability(latestRisk.probability);
      setResidualDescription(issue.description);
    }
    setShowResidualDialog(true);
  };

  const handleSaveResidualRisk = () => {
    addRiskVersion(issue.id, {
      severity: residualSeverity,
      probability: residualProbability,
      description: residualDescription,
      trigger: "post_action_review",
      notes: residualNotes || undefined,
    });
    setShowResidualDialog(false);
    setResidualNotes("");
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={issue.code}
        subtitle={config.label}
        showBack
      />

      <AdaptiveContainer className="py-4 space-y-4">
        {/* SECTION 1: Issue Header (Static Identity) */}
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

        {/* SECTION 2: Current Risk State - Only for Weakness/Threat */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <RiskMatrix 
                    severity={latestRisk.severity} 
                    probability={latestRisk.probability} 
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Severity</span>
                    <p className="font-semibold">{latestRisk.severity} / 3 - {severityDefinitions[latestRisk.severity - 1]?.label}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Probability</span>
                    <p className="font-semibold">{latestRisk.probability} / 3 - {probabilityDefinitions[latestRisk.probability - 1]?.label}</p>
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

        {/* SECTION 3: Implemented Controls (Actions) - BEFORE Risk History */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-action" />
                Implemented Controls
                {implementedControls.length > 0 && (
                  <Badge variant="secondary">{implementedControls.length}</Badge>
                )}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/actions/new?issueId=${issue.id}`)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Action
              </Button>
            </div>
            <CardDescription>
              Completed actions linked to this issue, ordered by completion date.
            </CardDescription>
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-action">{action.code}</span>
                        <StatusBadge status={action.status} />
                      </div>
                      {action.efficiencyEvaluation && (
                        <Badge 
                          variant={action.efficiencyEvaluation.result === "effective" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {action.efficiencyEvaluation.result === "effective" ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Effective</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Ineffective</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{action.title}</p>
                    {action.completedDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed: {format(new Date(action.completedDate), "dd MMM yyyy")}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 4: Risk History */}
        {isRisk && riskHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Risk Version History
              </CardTitle>
              <CardDescription>
                All risk evaluations for this issue, from newest to oldest.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskHistory.slice().reverse().map((version, index) => (
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
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {version.description}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>Severity: {version.severity}</span>
                      <span>Probability: {version.probability}</span>
                      <span className={cn(
                        "font-bold",
                        version.criticity >= 7 ? "text-risk" :
                        version.criticity >= 4 ? "text-warning" :
                        "text-success"
                      )}>
                        Criticity: {version.criticity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      Trigger: {version.trigger.replace(/_/g, " ")}
                    </p>
                    {version.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Notes: {version.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SECTION 5: Residual Risk Evaluation Trigger */}
        {isRisk && (
          <Card className={cn(
            "border-2",
            canEvaluateResidual && hasEffectiveActions ? "border-action" : "border-border"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Residual Risk Evaluation
              </CardTitle>
              <CardDescription>
                Re-evaluate risk after implementing control actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canEvaluateResidual ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  <p className="mb-2">Cannot evaluate residual risk yet.</p>
                  <p className="text-xs">
                    Requirements: At least one linked action must be completed and have an efficiency evaluation.
                  </p>
                </div>
              ) : !hasEffectiveActions ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  <p className="mb-2">No effective actions found.</p>
                  <p className="text-xs">
                    At least one linked action must be evaluated as "Effective" to reduce risk.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleOpenResidualDialog}
                  >
                    Evaluate Anyway (No Reduction Expected)
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>{implementedControls.filter(a => a.efficiencyEvaluation?.result === "effective").length} effective action(s) available for risk reduction.</span>
                  </div>
                  <Button onClick={handleOpenResidualDialog}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Evaluate Residual Risk
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </AdaptiveContainer>

      {/* Residual Risk Evaluation Dialog */}
      <Dialog open={showResidualDialog} onOpenChange={setShowResidualDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Evaluate Residual Risk</DialogTitle>
            <DialogDescription>
              Re-assess the risk level after implementing control actions. This creates a new risk version (v{riskHistory.length + 1}).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Severity Scale */}
            <div className="space-y-3">
              <Label>Severity: {residualSeverity} - {severityDefinitions[residualSeverity - 1]?.label}</Label>
              <Slider
                value={[residualSeverity]}
                onValueChange={([v]) => setResidualSeverity(v)}
                min={1}
                max={3}
                step={1}
              />
              <div className="grid grid-cols-3 gap-2 text-xs">
                {severityDefinitions.map((def) => (
                  <div 
                    key={def.level} 
                    className={cn(
                      "p-2 rounded text-center",
                      residualSeverity === def.level ? "bg-primary/10 border border-primary" : "bg-muted"
                    )}
                  >
                    <p className="font-medium">{def.level}. {def.label}</p>
                    <p className="text-muted-foreground">{def.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Probability Scale */}
            <div className="space-y-3">
              <Label>Probability: {residualProbability} - {probabilityDefinitions[residualProbability - 1]?.label}</Label>
              <Slider
                value={[residualProbability]}
                onValueChange={([v]) => setResidualProbability(v)}
                min={1}
                max={3}
                step={1}
              />
              <div className="grid grid-cols-3 gap-2 text-xs">
                {probabilityDefinitions.map((def) => (
                  <div 
                    key={def.level} 
                    className={cn(
                      "p-2 rounded text-center",
                      residualProbability === def.level ? "bg-primary/10 border border-primary" : "bg-muted"
                    )}
                  >
                    <p className="font-medium">{def.level}. {def.label}</p>
                    <p className="text-muted-foreground">{def.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculated Criticity */}
            <div className="p-4 rounded-lg bg-muted text-center">
              <p className="text-sm text-muted-foreground mb-1">New Criticity</p>
              <p className={cn(
                "text-3xl font-bold",
                residualSeverity * residualProbability >= 7 ? "text-risk" :
                residualSeverity * residualProbability >= 4 ? "text-warning" :
                "text-success"
              )}>
                {residualSeverity * residualProbability}
              </p>
              {latestRisk && (
                <p className="text-xs text-muted-foreground mt-1">
                  Previous: {latestRisk.criticity} → New: {residualSeverity * residualProbability}
                  {residualSeverity * residualProbability < latestRisk.criticity && " ↓ Reduced"}
                </p>
              )}
            </div>

            {/* Updated Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Updated Description</Label>
              <Textarea
                id="description"
                value={residualDescription}
                onChange={(e) => setResidualDescription(e.target.value)}
                placeholder="Describe the current state of this issue..."
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Evaluation Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={residualNotes}
                onChange={(e) => setResidualNotes(e.target.value)}
                placeholder="Additional notes about this evaluation..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResidualDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveResidualRisk} disabled={!residualDescription.trim()}>
              Save Risk Version v{riskHistory.length + 1}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
