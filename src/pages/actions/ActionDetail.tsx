import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Clock, AlertCircle, CheckCircle, XCircle, History, Link as LinkIcon, Play, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { ActionStatus } from "@/types/management-system";

const originLabels: Record<string, string> = {
  issue: "Issue",
  internal_audit: "Internal Audit",
  external_audit: "External Audit",
  management_review: "Management Review",
  objective_not_met: "Objective Not Met",
  other: "Other",
};

const statusFlow: { from: ActionStatus; to: ActionStatus; label: string; icon: React.ReactNode }[] = [
  { from: "planned", to: "in_progress", label: "Start", icon: <Play className="w-4 h-4" /> },
  { from: "in_progress", to: "completed_pending_evaluation", label: "Mark Complete", icon: <Check className="w-4 h-4" /> },
  { from: "planned", to: "cancelled", label: "Cancel", icon: <X className="w-4 h-4" /> },
  { from: "in_progress", to: "cancelled", label: "Cancel", icon: <X className="w-4 h-4" /> },
];

export default function ActionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { actions, processes, issues, updateAction, completeAction, evaluateActionEfficiency } = useManagementSystem();
  
  const [showEvalDialog, setShowEvalDialog] = useState(false);
  const [evalResult, setEvalResult] = useState<"effective" | "ineffective">("effective");
  const [evalEvidence, setEvalEvidence] = useState("");
  const [evalNotes, setEvalNotes] = useState("");

  const action = actions.find(a => a.id === id);

  if (!action) {
    return (
      <div className="min-h-screen">
        <AdaptiveContainer className="py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Action Not Found</h2>
            <p className="text-muted-foreground mb-4">The action you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/actions")}>Back to Actions</Button>
          </div>
        </AdaptiveContainer>
      </div>
    );
  }

  const process = processes.find(p => p.id === action.processId);
  const linkedIssues = issues.filter(i => action.linkedIssueIds?.includes(i.id));
  const isOverdue = action.status !== "evaluated" && 
                    action.status !== "completed_pending_evaluation" && 
                    action.status !== "cancelled" && 
                    isPast(new Date(action.deadline)) && 
                    !isToday(new Date(action.deadline));

  const availableTransitions = statusFlow.filter(t => t.from === action.status);

  const handleStatusChange = (newStatus: ActionStatus) => {
    if (newStatus === "completed_pending_evaluation") {
      completeAction(action.id);
    } else {
      updateAction(action.id, { status: newStatus });
    }
  };

  const handleEvaluate = () => {
    evaluateActionEfficiency(action.id, {
      result: evalResult,
      evidence: evalEvidence || undefined,
      notes: evalNotes || undefined,
    });
    setShowEvalDialog(false);
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={action.code}
        subtitle={action.title}
        showBack
      />

      <AdaptiveContainer className="py-4 space-y-4">
        {/* Main Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={action.status} />
                {isOverdue && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Overdue
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate(`/actions/${id}/edit`)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{action.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Process:</span>
                <p className="font-medium">{process?.name || "Unknown"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Origin:</span>
                <p className="font-medium">{originLabels[action.origin]}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Responsible:</span>
                <p className="font-medium">{action.responsibleName || "Unassigned"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Deadline:</span>
                <p className={cn("font-medium", isOverdue && "text-destructive")}>
                  {format(new Date(action.deadline), "dd MMM yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Transitions */}
        {availableTransitions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {availableTransitions.map((transition) => (
                  <Button
                    key={transition.to}
                    variant={transition.to === "cancelled" ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleStatusChange(transition.to)}
                    className={cn(
                      transition.to === "cancelled" && "text-destructive hover:text-destructive"
                    )}
                  >
                    {transition.icon}
                    <span className="ml-2">{transition.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evaluate Efficiency - Only for completed_pending_evaluation */}
        {action.status === "completed_pending_evaluation" && !action.efficiencyEvaluation && (
          <Card className="border-action">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-action">
                <CheckCircle className="w-5 h-5" />
                Ready for Efficiency Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This action is completed and pending efficiency evaluation. Evaluate whether the action achieved its intended outcome.
              </p>
              <Button onClick={() => setShowEvalDialog(true)}>
                Evaluate Efficiency
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Efficiency Evaluation Result */}
        {action.efficiencyEvaluation && (
          <Card className={cn(
            "border-2",
            action.efficiencyEvaluation.result === "effective" ? "border-success" : "border-destructive"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {action.efficiencyEvaluation.result === "effective" ? (
                  <><CheckCircle className="w-5 h-5 text-success" /> Effective</>
                ) : (
                  <><XCircle className="w-5 h-5 text-destructive" /> Ineffective</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Evaluated on:</span>{" "}
                <span className="font-medium">
                  {format(new Date(action.efficiencyEvaluation.date), "dd MMM yyyy")}
                </span>
              </div>
              {action.efficiencyEvaluation.evidence && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Evidence:</span>
                  <p className="mt-1">{action.efficiencyEvaluation.evidence}</p>
                </div>
              )}
              {action.efficiencyEvaluation.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="mt-1">{action.efficiencyEvaluation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Linked Issues */}
        {linkedIssues.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Linked Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {linkedIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    className="w-full p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{issue.code}</span>
                      <Badge variant="outline" className={cn(
                        issue.type === "risk" ? "border-risk text-risk" : "border-opportunity text-opportunity"
                      )}>
                        {issue.type === "risk" ? "Risk" : "Opportunity"}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 line-clamp-2">{issue.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status History */}
        {action.statusHistory && action.statusHistory.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {action.statusHistory.slice().reverse().map((change) => (
                  <div key={change.id} className="flex items-center gap-3 text-sm">
                    <span className="text-xs text-muted-foreground w-20">
                      {format(new Date(change.date), "dd MMM")}
                    </span>
                    <div className="flex items-center gap-2">
                      {change.fromStatus && (
                        <>
                          <StatusBadge status={change.fromStatus} />
                          <span className="text-muted-foreground">→</span>
                        </>
                      )}
                      <StatusBadge status={change.toStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </AdaptiveContainer>

      {/* Evaluation Dialog */}
      <Dialog open={showEvalDialog} onOpenChange={setShowEvalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluate Action Efficiency</DialogTitle>
            <DialogDescription>
              Assess whether this action achieved its intended outcome.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Result</Label>
              <RadioGroup value={evalResult} onValueChange={(v) => setEvalResult(v as "effective" | "ineffective")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="effective" id="effective" />
                  <Label htmlFor="effective" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Effective - Action achieved its goal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ineffective" id="ineffective" />
                  <Label htmlFor="ineffective" className="flex items-center gap-2 cursor-pointer">
                    <XCircle className="w-4 h-4 text-destructive" />
                    Ineffective - Action did not achieve its goal
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="evidence">Evidence (File/Link)</Label>
              <Input 
                id="evidence" 
                placeholder="URL or file reference..."
                value={evalEvidence}
                onChange={(e) => setEvalEvidence(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Additional notes about the evaluation..."
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvalDialog(false)}>Cancel</Button>
            <Button onClick={handleEvaluate}>Save Evaluation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
