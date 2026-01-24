import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Link as LinkIcon, 
  MessageSquare,
  Plus,
  Target,
  BarChart3,
  Zap,
  History,
  ExternalLink,
  Trash2,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { getFunctionById } from "@/data/iso9001-functions";
import { 
  FunctionInstanceStatus, 
  FUNCTION_STATUS_LABELS, 
  FUNCTION_STATUS_COLORS,
  FunctionEvidence,
} from "@/types/functions";
import { QualityPolicySection } from "@/components/functions/QualityPolicySection";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function FunctionInstanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getFunctionInstanceById,
    getProcessById,
    updateFunctionInstanceStatus,
    updateFunctionInstanceData,
    addFunctionEvidence,
    removeFunctionEvidence,
    getObjectiveById,
    getKPIById,
    getActionById,
    objectives,
    kpis,
    actions,
    linkObjectiveToFunction,
    unlinkObjectiveFromFunction,
    linkKPIToFunction,
    unlinkKPIFromFunction,
    linkActionToFunction,
    unlinkActionFromFunction,
  } = useManagementSystem();

  const instance = id ? getFunctionInstanceById(id) : undefined;
  const fn = instance ? getFunctionById(instance.functionId) : undefined;
  const process = instance ? getProcessById(instance.processId) : undefined;

  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState<'objective' | 'kpi' | 'action' | null>(null);
  const [newEvidence, setNewEvidence] = useState({
    type: 'note' as FunctionEvidence['type'],
    title: '',
    description: '',
    reference: '',
  });

  if (!instance || !fn) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Function Not Found" showBack />
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">The requested function instance could not be found.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: FunctionInstanceStatus) => {
    updateFunctionInstanceStatus(instance.id, newStatus);
    toast.success(`Status updated to ${FUNCTION_STATUS_LABELS[newStatus]}`);
  };

  const handleAddEvidence = () => {
    if (!newEvidence.title.trim()) {
      toast.error("Evidence title is required");
      return;
    }

    addFunctionEvidence(instance.id, {
      type: newEvidence.type,
      title: newEvidence.title.trim(),
      description: newEvidence.description.trim() || undefined,
      reference: newEvidence.reference.trim() || undefined,
    });

    setNewEvidence({ type: 'note', title: '', description: '', reference: '' });
    setShowEvidenceDialog(false);
    toast.success("Evidence added");
  };

  const handleRemoveEvidence = (evidenceId: string) => {
    removeFunctionEvidence(instance.id, evidenceId);
    toast.success("Evidence removed");
  };

  const handleLinkObjective = (objectiveId: string) => {
    linkObjectiveToFunction(instance.id, objectiveId);
    setShowLinkDialog(null);
    toast.success("Objective linked");
  };

  const handleUnlinkObjective = (objectiveId: string) => {
    unlinkObjectiveFromFunction(instance.id, objectiveId);
    toast.success("Objective unlinked");
  };

  const handleLinkKPI = (kpiId: string) => {
    linkKPIToFunction(instance.id, kpiId);
    setShowLinkDialog(null);
    toast.success("KPI linked");
  };

  const handleUnlinkKPI = (kpiId: string) => {
    unlinkKPIFromFunction(instance.id, kpiId);
    toast.success("KPI unlinked");
  };

  const handleLinkAction = (actionId: string) => {
    linkActionToFunction(instance.id, actionId);
    setShowLinkDialog(null);
    toast.success("Action linked");
  };

  const handleUnlinkAction = (actionId: string) => {
    unlinkActionFromFunction(instance.id, actionId);
    toast.success("Action unlinked");
  };

  const linkedObjectives = instance.linkedObjectiveIds.map(id => getObjectiveById(id)).filter(Boolean);
  const linkedKPIs = instance.linkedKPIIds.map(id => getKPIById(id)).filter(Boolean);
  const linkedActions = instance.linkedActionIds.map(id => getActionById(id)).filter(Boolean);

  const availableObjectives = objectives.filter(o => !instance.linkedObjectiveIds.includes(o.id));
  const availableKPIs = kpis.filter(k => !instance.linkedKPIIds.includes(k.id));
  const availableActions = actions.filter(a => !instance.linkedActionIds.includes(a.id));

  const getStatusIcon = (status: FunctionInstanceStatus) => {
    switch (status) {
      case 'implemented': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'partially_implemented': return <Clock className="w-5 h-5 text-warning" />;
      case 'nonconformity': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'improvement_opportunity': return <Zap className="w-5 h-5 text-kpi" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title={fn.name}
        subtitle={`ISO 9001:2015 - Clause ${fn.clauseReferences.join(', ')}`}
        showBack
      />

      <div className="px-4 py-6 space-y-6">
        {/* Function Metadata */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{fn.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="font-mono text-xs">
                  {fn.clauseReferences.join(', ')}
                </Badge>
                <Badge variant={fn.duplicationRule === 'unique' ? 'default' : 'secondary'}>
                  {fn.duplicationRule === 'unique' ? 'Organization-level' : 'Per Process'}
                </Badge>
                {fn.mandatory && (
                  <Badge variant="destructive" className="text-xs">Mandatory</Badge>
                )}
              </div>
            </div>
          </div>

          {process && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Hosted by Process</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary"
                onClick={() => navigate(`/processes/${process.id}`)}
              >
                {process.name}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Status Management */}
        <div className="space-y-3">
          <Label>Implementation Status</Label>
          <Select 
            value={instance.status} 
            onValueChange={(v: FunctionInstanceStatus) => handleStatusChange(v)}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                {getStatusIcon(instance.status)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_implemented">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Not Implemented
                </div>
              </SelectItem>
              <SelectItem value="partially_implemented">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  Partially Implemented
                </div>
              </SelectItem>
              <SelectItem value="implemented">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Implemented
                </div>
              </SelectItem>
              <SelectItem value="nonconformity">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Nonconformity
                </div>
              </SelectItem>
              <SelectItem value="improvement_opportunity">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-kpi" />
                  Improvement Opportunity
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Evidence Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Evidence ({instance.evidence.length})
            </Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEvidenceDialog(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {instance.evidence.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No evidence attached yet.
            </p>
          ) : (
            <div className="space-y-2">
              {instance.evidence.map((evidence) => (
                <div 
                  key={evidence.id}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0">
                    {evidence.type === 'file' && <FileText className="w-4 h-4 text-primary" />}
                    {evidence.type === 'link' && <LinkIcon className="w-4 h-4 text-primary" />}
                    {evidence.type === 'note' && <MessageSquare className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{evidence.title}</p>
                    {evidence.description && (
                      <p className="text-xs text-muted-foreground mt-1">{evidence.description}</p>
                    )}
                    {evidence.reference && (
                      <a 
                        href={evidence.reference} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        {evidence.reference}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {format(new Date(evidence.addedAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveEvidence(evidence.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Objectives */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4 text-kpi" />
              Linked Objectives ({linkedObjectives.length})
            </Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowLinkDialog('objective')}
              disabled={availableObjectives.length === 0}
            >
              <Plus className="w-4 h-4 mr-1" />
              Link
            </Button>
          </div>

          {linkedObjectives.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No objectives linked.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedObjectives.map((objective) => objective && (
                <div 
                  key={objective.id}
                  className="flex items-center justify-between p-3 bg-kpi/5 rounded-lg border border-kpi/20"
                >
                  <div>
                    <p className="font-medium text-sm">{objective.name}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{objective.status}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUnlinkObjective(objective.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked KPIs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-kpi" />
              Linked KPIs ({linkedKPIs.length})
            </Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowLinkDialog('kpi')}
              disabled={availableKPIs.length === 0}
            >
              <Plus className="w-4 h-4 mr-1" />
              Link
            </Button>
          </div>

          {linkedKPIs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No KPIs linked.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedKPIs.map((kpi) => kpi && (
                <div 
                  key={kpi.id}
                  className="flex items-center justify-between p-3 bg-kpi/5 rounded-lg border border-kpi/20"
                >
                  <div>
                    <p className="font-medium text-sm">{kpi.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {kpi.target}{kpi.unit && ` ${kpi.unit}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUnlinkKPI(kpi.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-action" />
              Linked Actions ({linkedActions.length})
            </Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowLinkDialog('action')}
              disabled={availableActions.length === 0}
            >
              <Plus className="w-4 h-4 mr-1" />
              Link
            </Button>
          </div>

          {linkedActions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No actions linked.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedActions.map((action) => action && (
                <div 
                  key={action.id}
                  className="flex items-center justify-between p-3 bg-action/5 rounded-lg border border-action/20"
                >
                  <div>
                    <p className="font-medium text-sm">{action.title}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{action.status}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUnlinkAction(action.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History ({instance.history.length})
          </Label>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...instance.history].reverse().map((entry) => (
              <div 
                key={entry.id}
                className="flex items-start gap-3 p-2 bg-muted/20 rounded-lg text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p>{entry.description}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {format(new Date(entry.date), 'dd/MM/yyyy HH:mm')}
                    {entry.changedBy && ` • ${entry.changedBy}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Evidence Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Evidence</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Evidence Type</Label>
              <Select 
                value={newEvidence.type} 
                onValueChange={(v: FunctionEvidence['type']) => setNewEvidence(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="link">URL Link</SelectItem>
                  <SelectItem value="file">File Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newEvidence.title}
                onChange={(e) => setNewEvidence(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Internal Audit Report Q4 2024"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newEvidence.description}
                onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            {(newEvidence.type === 'link' || newEvidence.type === 'file') && (
              <div className="space-y-2">
                <Label>{newEvidence.type === 'link' ? 'URL' : 'File Path'}</Label>
                <Input
                  value={newEvidence.reference}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder={newEvidence.type === 'link' ? 'https://...' : '/documents/...'}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvidenceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvidence}>
              Add Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={!!showLinkDialog} onOpenChange={() => setShowLinkDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Link {showLinkDialog === 'objective' ? 'Objective' : showLinkDialog === 'kpi' ? 'KPI' : 'Action'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {showLinkDialog === 'objective' && availableObjectives.map(obj => (
              <Button
                key={obj.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleLinkObjective(obj.id)}
              >
                <Target className="w-4 h-4 mr-2 text-kpi" />
                {obj.name}
              </Button>
            ))}
            {showLinkDialog === 'kpi' && availableKPIs.map(kpi => (
              <Button
                key={kpi.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleLinkKPI(kpi.id)}
              >
                <BarChart3 className="w-4 h-4 mr-2 text-kpi" />
                {kpi.name}
              </Button>
            ))}
            {showLinkDialog === 'action' && availableActions.map(action => (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleLinkAction(action.id)}
              >
                <Zap className="w-4 h-4 mr-2 text-action" />
                {action.title}
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
