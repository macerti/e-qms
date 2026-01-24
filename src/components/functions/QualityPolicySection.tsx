import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  X, 
  FileText, 
  Target, 
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { PolicyAxis } from "@/types/functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QualityPolicySectionProps {
  instanceId: string;
}

export function QualityPolicySection({ instanceId }: QualityPolicySectionProps) {
  const navigate = useNavigate();
  const {
    getFunctionInstanceById,
    updateFunctionInstanceData,
    updatePolicyAxes,
    objectives,
    processes,
  } = useManagementSystem();

  const instance = getFunctionInstanceById(instanceId);
  
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [showAxisDialog, setShowAxisDialog] = useState(false);
  const [expandedAxis, setExpandedAxis] = useState<string | null>(null);
  const [editingAxisId, setEditingAxisId] = useState<string | null>(null);

  const [policyContent, setPolicyContent] = useState(instance?.data.policyContent as string || "");
  const [newAxis, setNewAxis] = useState({
    name: "",
    description: "",
    linkedObjectiveIds: [] as string[],
    linkedProcessIds: [] as string[],
  });

  if (!instance) return null;

  const policyAxes = (instance.data.policyAxes as PolicyAxis[]) || [];

  const handleSavePolicy = () => {
    updateFunctionInstanceData(instanceId, { policyContent });
    setIsEditingPolicy(false);
    toast.success("Quality policy saved");
  };

  const handleAddAxis = () => {
    if (!newAxis.name.trim()) {
      toast.error("Axis name is required");
      return;
    }

    const newPolicyAxis: PolicyAxis = {
      id: crypto.randomUUID(),
      name: newAxis.name.trim(),
      description: newAxis.description.trim(),
      linkedObjectiveIds: newAxis.linkedObjectiveIds,
      linkedProcessIds: newAxis.linkedProcessIds,
      createdAt: new Date().toISOString(),
    };

    updatePolicyAxes(instanceId, [...policyAxes, newPolicyAxis]);
    setNewAxis({ name: "", description: "", linkedObjectiveIds: [], linkedProcessIds: [] });
    setShowAxisDialog(false);
    toast.success("Policy axis added");
  };

  const handleRemoveAxis = (axisId: string) => {
    updatePolicyAxes(instanceId, policyAxes.filter(a => a.id !== axisId));
    toast.success("Policy axis removed");
  };

  const handleToggleObjective = (objectiveId: string) => {
    if (newAxis.linkedObjectiveIds.includes(objectiveId)) {
      setNewAxis(prev => ({
        ...prev,
        linkedObjectiveIds: prev.linkedObjectiveIds.filter(id => id !== objectiveId),
      }));
    } else {
      setNewAxis(prev => ({
        ...prev,
        linkedObjectiveIds: [...prev.linkedObjectiveIds, objectiveId],
      }));
    }
  };

  const handleToggleProcess = (processId: string) => {
    if (newAxis.linkedProcessIds.includes(processId)) {
      setNewAxis(prev => ({
        ...prev,
        linkedProcessIds: prev.linkedProcessIds.filter(id => id !== processId),
      }));
    } else {
      setNewAxis(prev => ({
        ...prev,
        linkedProcessIds: [...prev.linkedProcessIds, processId],
      }));
    }
  };

  const getObjectiveName = (id: string) => {
    const obj = objectives.find(o => o.id === id);
    return obj?.name || 'Unknown';
  };

  const getProcessName = (id: string) => {
    const proc = processes.find(p => p.id === id);
    return proc?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Quality Policy Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Quality Policy Statement
          </Label>
          {!isEditingPolicy ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingPolicy(true)}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={handleSavePolicy}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
        </div>

        {isEditingPolicy ? (
          <Textarea
            value={policyContent}
            onChange={(e) => setPolicyContent(e.target.value)}
            placeholder="Enter your organization's quality policy statement..."
            rows={6}
          />
        ) : policyContent ? (
          <div className="p-4 bg-muted/30 rounded-lg border border-border whitespace-pre-wrap text-sm">
            {policyContent}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic py-2">
            No quality policy statement defined yet.
          </p>
        )}
      </div>

      {/* Policy Axes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-kpi" />
            Policy Axes / Commitments
          </Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAxisDialog(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Axis
          </Button>
        </div>

        {policyAxes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-2">
            No policy axes defined. Add axes to structure your quality commitments.
          </p>
        ) : (
          <div className="space-y-2">
            {policyAxes.map((axis) => {
              const isExpanded = expandedAxis === axis.id;
              
              return (
                <div 
                  key={axis.id}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedAxis(isExpanded ? null : axis.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-kpi" />
                      <span className="font-medium">{axis.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                      {axis.description && (
                        <p className="text-sm text-muted-foreground">
                          {axis.description}
                        </p>
                      )}

                      {axis.linkedObjectiveIds.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Linked Objectives
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {axis.linkedObjectiveIds.map(id => (
                              <Badge key={id} variant="secondary" className="text-xs">
                                {getObjectiveName(id)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {axis.linkedProcessIds.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Linked Processes
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {axis.linkedProcessIds.map(id => (
                              <Badge key={id} variant="outline" className="text-xs">
                                {getProcessName(id)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAxis(axis.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove Axis
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Axis Dialog */}
      <Dialog open={showAxisDialog} onOpenChange={setShowAxisDialog}>
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Policy Axis</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label>Axis Name *</Label>
              <Input
                value={newAxis.name}
                onChange={(e) => setNewAxis(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Customer Satisfaction"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newAxis.description}
                onChange={(e) => setNewAxis(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this policy axis..."
                rows={2}
              />
            </div>

            {objectives.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Link to Objectives
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
                  {objectives.map(obj => (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => handleToggleObjective(obj.id)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors",
                        newAxis.linkedObjectiveIds.includes(obj.id)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center",
                        newAxis.linkedObjectiveIds.includes(obj.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border"
                      )}>
                        {newAxis.linkedObjectiveIds.includes(obj.id) && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                      {obj.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {processes.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Link to Processes
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
                  {processes.filter(p => p.status === 'active').map(proc => (
                    <button
                      key={proc.id}
                      type="button"
                      onClick={() => handleToggleProcess(proc.id)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors",
                        newAxis.linkedProcessIds.includes(proc.id)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center",
                        newAxis.linkedProcessIds.includes(proc.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border"
                      )}>
                        {newAxis.linkedProcessIds.includes(proc.id) && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                      {proc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setShowAxisDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAxis}>
              Add Axis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
