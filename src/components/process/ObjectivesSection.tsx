import { useState } from "react";
import { Plus, X, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProcessObjective } from "@/types/objectives";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";

interface ObjectivesSectionProps {
  processId: string;
  isEditing: boolean;
}

export function ObjectivesSection({ processId, isEditing }: ObjectivesSectionProps) {
  const { 
    getObjectivesByProcess, 
    createObjective, 
    updateObjective 
  } = useManagementSystem();
  
  const objectives = getObjectivesByProcess(processId);
  const [showForm, setShowForm] = useState(false);
  const [newObjective, setNewObjective] = useState({
    name: "",
    description: "",
    targetDate: "",
  });

  const handleAddObjective = () => {
    if (!newObjective.name.trim()) {
      toast.error("Objective name is required");
      return;
    }

    createObjective({
      processId,
      name: newObjective.name.trim(),
      description: newObjective.description.trim(),
      targetDate: newObjective.targetDate || undefined,
      status: 'active',
    });

    setNewObjective({ name: "", description: "", targetDate: "" });
    setShowForm(false);
    toast.success("Objective created");
  };

  const handleUpdateStatus = (objective: ProcessObjective, newStatus: ProcessObjective['status']) => {
    updateObjective(objective.id, { status: newStatus });
    toast.success(`Objective marked as ${newStatus}`);
  };

  return (
    <div className="form-field">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-kpi" />
        <Label>Process Objectives</Label>
      </div>
      
      <div className="space-y-3">
        {objectives.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground italic py-2">
            No objectives defined yet. Add objectives to track process performance goals.
          </p>
        ) : (
          objectives.map((objective) => (
            <div 
              key={objective.id}
              className="p-3 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{objective.name}</p>
                    {objective.status === 'achieved' && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                  {objective.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {objective.description}
                    </p>
                  )}
                  {objective.targetDate && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Target: {new Date(objective.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {objective.status === 'active' && isEditing && (
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus(objective, 'achieved')}
                      className="text-success hover:text-success"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus(objective, 'cancelled')}
                      className="text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  objective.status === 'active' 
                    ? 'bg-kpi/10 text-kpi' 
                    : objective.status === 'achieved'
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {objective.status}
                </span>
              </div>
            </div>
          ))
        )}

        {showForm && (
          <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-3">
            <div className="space-y-2">
              <Label htmlFor="obj-name">Objective Name *</Label>
              <Input
                id="obj-name"
                value={newObjective.name}
                onChange={(e) => setNewObjective(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Reduce customer complaints by 20%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obj-desc">Description</Label>
              <Textarea
                id="obj-desc"
                value={newObjective.description}
                onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the objective..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obj-date">Target Date</Label>
              <Input
                id="obj-date"
                type="date"
                value={newObjective.targetDate}
                onChange={(e) => setNewObjective(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleAddObjective} size="sm">
                Add Objective
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setNewObjective({ name: "", description: "", targetDate: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!showForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Objective
          </Button>
        )}
      </div>
      
      <p className="form-helper mt-2">
        Define measurable objectives for this process aligned with quality policy.
      </p>
    </div>
  );
}
