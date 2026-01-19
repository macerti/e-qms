import { useState } from "react";
import { Plus, BarChart3, Archive, ChevronDown, ChevronUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ProcessKPI, KPIFrequency } from "@/types/objectives";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface KPISectionProps {
  processId: string;
  isEditing: boolean;
}

const FREQUENCY_LABELS: Record<KPIFrequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  semestrially: "Semestrially",
};

export function KPISection({ processId, isEditing }: KPISectionProps) {
  const { 
    getKPIsByProcess, 
    getActiveObjectivesByProcess,
    getObjectiveById,
    createKPI, 
    archiveKPI,
    addKPIValue,
    getCurrentKPIValue,
  } = useManagementSystem();
  
  const kpis = getKPIsByProcess(processId);
  const objectives = getActiveObjectivesByProcess(processId);
  const [showForm, setShowForm] = useState(false);
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null);
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({});
  
  const [newKPI, setNewKPI] = useState({
    objectiveId: "",
    name: "",
    formula: "",
    target: "",
    unit: "",
    frequency: "monthly" as KPIFrequency,
  });

  const handleAddKPI = () => {
    if (!newKPI.objectiveId) {
      toast.error("Please select an objective");
      return;
    }
    if (!newKPI.name.trim()) {
      toast.error("Indicator name is required");
      return;
    }
    if (!newKPI.formula.trim()) {
      toast.error("Formula is required");
      return;
    }
    if (!newKPI.target) {
      toast.error("Target value is required");
      return;
    }

    createKPI({
      processId,
      objectiveId: newKPI.objectiveId,
      name: newKPI.name.trim(),
      formula: newKPI.formula.trim(),
      target: parseFloat(newKPI.target),
      unit: newKPI.unit.trim() || undefined,
      frequency: newKPI.frequency,
      status: 'active',
    });

    setNewKPI({
      objectiveId: "",
      name: "",
      formula: "",
      target: "",
      unit: "",
      frequency: "monthly",
    });
    setShowForm(false);
    toast.success("KPI created");
  };

  const handleAddValue = (kpiId: string) => {
    const valueStr = newValueInputs[kpiId];
    if (!valueStr) {
      toast.error("Please enter a value");
      return;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    addKPIValue(kpiId, value);
    setNewValueInputs(prev => ({ ...prev, [kpiId]: "" }));
    toast.success("Value recorded");
  };

  const handleArchive = (kpiId: string) => {
    archiveKPI(kpiId);
    toast.success("KPI archived");
  };

  const activeKPIs = kpis.filter(k => k.status === 'active');
  const archivedKPIs = kpis.filter(k => k.status === 'archived');

  return (
    <div className="form-field">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-kpi" />
        <Label>Key Performance Indicators (KPIs)</Label>
      </div>
      
      <div className="space-y-3">
        {activeKPIs.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground italic py-2">
            No KPIs defined yet. {objectives.length === 0 && "Create objectives first to add KPIs."}
          </p>
        ) : (
          activeKPIs.map((kpi) => {
            const objective = getObjectiveById(kpi.objectiveId);
            const currentValue = getCurrentKPIValue(kpi);
            const isExpanded = expandedKPI === kpi.id;
            
            return (
              <div 
                key={kpi.id}
                className="p-3 bg-muted/30 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{kpi.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Objective: {objective?.name || "Unknown"}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                        {kpi.formula}
                      </span>
                      <span className={cn(
                        "font-medium",
                        currentValue && currentValue.value >= kpi.target 
                          ? "text-success" 
                          : "text-muted-foreground"
                      )}>
                        {currentValue ? currentValue.value : "—"} 
                        {kpi.unit && ` ${kpi.unit}`} / {kpi.target}{kpi.unit && ` ${kpi.unit}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-kpi/10 text-kpi">
                        {FREQUENCY_LABELS[kpi.frequency]}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedKPI(isExpanded ? null : kpi.id)}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(kpi.id)}
                        className="text-muted-foreground"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    {/* Add new value */}
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={`Enter value${kpi.unit ? ` (${kpi.unit})` : ''}`}
                        value={newValueInputs[kpi.id] || ""}
                        onChange={(e) => setNewValueInputs(prev => ({ 
                          ...prev, 
                          [kpi.id]: e.target.value 
                        }))}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddValue(kpi.id)}
                      >
                        Record
                      </Button>
                    </div>
                    
                    {/* Value history */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <History className="w-3 h-3" />
                        <span>Value History</span>
                      </div>
                      {kpi.valueHistory.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          No values recorded yet
                        </p>
                      ) : (
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {[...kpi.valueHistory].reverse().map((record) => (
                            <div 
                              key={record.id}
                              className="flex justify-between text-xs p-1.5 bg-background rounded"
                            >
                              <span className={cn(
                                "font-medium",
                                record.value >= kpi.target ? "text-success" : "text-foreground"
                              )}>
                                {record.value}{kpi.unit && ` ${kpi.unit}`}
                              </span>
                              <span className="text-muted-foreground font-mono">
                                {format(new Date(record.recordedAt), "dd/MM/yyyy HH:mm")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {showForm && (
          <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-3">
            <div className="space-y-2">
              <Label>Linked Objective *</Label>
              <Select 
                value={newKPI.objectiveId} 
                onValueChange={(v) => setNewKPI(prev => ({ ...prev, objectiveId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select objective..." />
                </SelectTrigger>
                <SelectContent>
                  {objectives.map((obj) => (
                    <SelectItem key={obj.id} value={obj.id}>
                      {obj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-name">Indicator Name *</Label>
              <Input
                id="kpi-name"
                value={newKPI.name}
                onChange={(e) => setNewKPI(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Customer Complaint Rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-formula">Formula *</Label>
              <Input
                id="kpi-formula"
                value={newKPI.formula}
                onChange={(e) => setNewKPI(prev => ({ ...prev, formula: e.target.value }))}
                placeholder="e.g., (Complaints / Total Orders) × 100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="kpi-target">Target Value *</Label>
                <Input
                  id="kpi-target"
                  type="number"
                  value={newKPI.target}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, target: e.target.value }))}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kpi-unit">Unit</Label>
                <Input
                  id="kpi-unit"
                  value={newKPI.unit}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., %"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Frequency *</Label>
              <Select 
                value={newKPI.frequency} 
                onValueChange={(v: KPIFrequency) => setNewKPI(prev => ({ ...prev, frequency: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="semestrially">Semestrially</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleAddKPI} size="sm">
                Add KPI
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setNewKPI({
                    objectiveId: "",
                    name: "",
                    formula: "",
                    target: "",
                    unit: "",
                    frequency: "monthly",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!showForm && objectives.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add KPI
          </Button>
        )}

        {objectives.length === 0 && !showForm && (
          <p className="text-xs text-muted-foreground">
            Create at least one objective above to add KPIs.
          </p>
        )}

        {/* Archived KPIs */}
        {archivedKPIs.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Archive className="w-3 h-3" />
              Archived KPIs ({archivedKPIs.length})
            </p>
            <div className="space-y-2">
              {archivedKPIs.map((kpi) => {
                const objective = getObjectiveById(kpi.objectiveId);
                return (
                  <div 
                    key={kpi.id}
                    className="p-2 bg-muted/20 rounded-lg text-sm opacity-60"
                  >
                    <p className="font-medium">{kpi.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {objective?.name} • {kpi.valueHistory.length} recorded values
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <p className="form-helper mt-2">
        Define measurable indicators to track objective achievement. Values are historical and cannot be edited.
      </p>
    </div>
  );
}
