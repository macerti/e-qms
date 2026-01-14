import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { Action, ActionStatus } from "@/types/management-system";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

const sourceOptions: { value: Action["sourceType"]; label: string; description: string }[] = [
  { value: "risk", label: "Risk", description: "Action to mitigate identified risk" },
  { value: "opportunity", label: "Opportunity", description: "Action to exploit opportunity" },
  { value: "internal_audit", label: "Internal Audit", description: "Corrective action from audit finding" },
  { value: "external_audit", label: "External Audit", description: "Action from certification audit" },
  { value: "management_review", label: "Management Review", description: "Decision from management review" },
];

export default function ActionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createAction, processes, issues, generateActionCode } = useManagementSystem();
  
  const preselectedProcess = searchParams.get("process");
  const preselectedSource = searchParams.get("source") as Action["sourceType"] | null;
  const preselectedSourceId = searchParams.get("sourceId");

  const [formData, setFormData] = useState({
    code: generateActionCode(),
    processId: preselectedProcess || "",
    title: "",
    description: "",
    sourceType: preselectedSource || "" as Action["sourceType"] | "",
    sourceId: preselectedSourceId || "",
    deadline: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    responsibleName: "",
    status: "planned" as ActionStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.processId) {
      toast.error("Please select a process");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Action title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.sourceType) {
      toast.error("Please select a source type");
      return;
    }
    if (!formData.deadline) {
      toast.error("Deadline is required");
      return;
    }

    createAction({
      code: formData.code.trim(),
      processId: formData.processId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      sourceType: formData.sourceType as Action["sourceType"],
      sourceId: formData.sourceId || formData.sourceType,
      deadline: formData.deadline,
      responsibleName: formData.responsibleName.trim() || undefined,
      status: formData.status,
    });

    toast.success("Action created successfully");
    navigate("/actions");
  };

  const activeProcesses = processes.filter(p => p.status !== "archived");
  
  // Get available sources based on selected process
  const availableSources = formData.processId 
    ? issues.filter(i => i.processId === formData.processId)
    : [];

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="New Action" 
        subtitle="Corrective or Improvement Action"
        showBack
      />

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Action Code */}
        <div className="form-field">
          <Label htmlFor="code">Reference Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="e.g., ACT-001"
            className="font-mono"
          />
          <p className="form-helper">
            Unique identifier for this action. Auto-generated but editable.
          </p>
        </div>

        {/* Process Selection */}
        <div className="form-field">
          <Label>Process *</Label>
          <Select
            value={formData.processId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, processId: value, sourceId: "" }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a process" />
            </SelectTrigger>
            <SelectContent>
              {activeProcesses.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.code} — {process.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="form-helper">
            This action will be linked to the selected process.
          </p>
        </div>

        {/* Source Type */}
        <div className="form-field">
          <Label>Source Type *</Label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {sourceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, sourceType: option.value, sourceId: "" }))}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  formData.sourceType === option.value
                    ? "border-action bg-action/5"
                    : "border-border hover:border-action/50"
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Source Reference (if risk or opportunity) */}
        {(formData.sourceType === "risk" || formData.sourceType === "opportunity") && 
         formData.processId && availableSources.length > 0 && (
          <div className="form-field">
            <Label>Link to Specific {formData.sourceType === "risk" ? "Risk" : "Opportunity"}</Label>
            <Select
              value={formData.sourceId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, sourceId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source (optional)" />
              </SelectTrigger>
              <SelectContent>
                {availableSources
                  .filter(s => s.type === formData.sourceType)
                  .map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.description.substring(0, 50)}...
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Title */}
        <div className="form-field">
          <Label htmlFor="title">Action Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Implement automated inspection checkpoint"
          />
          <p className="form-helper">
            A clear, actionable title describing what needs to be done.
          </p>
        </div>

        {/* Description */}
        <div className="form-field">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="e.g., Design and implement an automated quality checkpoint at station 3 to reduce defect escape rate. Include sensor integration and alert system."
            rows={4}
          />
          <p className="form-helper">
            Describe the action in detail, including expected outcome.
          </p>
        </div>

        {/* Deadline */}
        <div className="form-field">
          <Label htmlFor="deadline">Deadline *</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          />
          <p className="form-helper">
            Target completion date for this action.
          </p>
        </div>

        {/* Responsible */}
        <div className="form-field">
          <Label htmlFor="responsible">Responsible Person</Label>
          <Input
            id="responsible"
            value={formData.responsibleName}
            onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
            placeholder="e.g., Quality Engineer"
          />
          <p className="form-helper">
            Who is accountable for completing this action.
          </p>
        </div>

        {/* Initial Status */}
        <div className="form-field">
          <Label>Initial Status</Label>
          <div className="flex gap-2 mt-2">
            <StatusButton
              selected={formData.status === "planned"}
              onClick={() => setFormData(prev => ({ ...prev, status: "planned" }))}
            >
              Planned
            </StatusButton>
            <StatusButton
              selected={formData.status === "in_progress"}
              onClick={() => setFormData(prev => ({ ...prev, status: "in_progress" }))}
            >
              In Progress
            </StatusButton>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button type="submit" className="w-full">
            Create Action
          </Button>
        </div>
      </form>
    </div>
  );
}

function StatusButton({ 
  children, 
  selected, 
  onClick 
}: { 
  children: React.ReactNode; 
  selected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
        selected 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  );
}
