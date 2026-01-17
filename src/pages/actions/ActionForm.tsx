import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
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
import { ActionOrigin, ActionStatus } from "@/types/management-system";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

const originOptions: { value: ActionOrigin; label: string; description: string }[] = [
  { value: "issue", label: "Issue (Risk/Opportunity)", description: "Action from a risk or opportunity" },
  { value: "internal_audit", label: "Internal Audit", description: "Corrective action from audit finding" },
  { value: "external_audit", label: "External Audit", description: "Action from certification audit" },
  { value: "management_review", label: "Management Review", description: "Decision from management review" },
  { value: "objective_not_met", label: "Objective Not Met", description: "Action from missed target" },
  { value: "other", label: "Other", description: "Other improvement initiative" },
];

export default function ActionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createAction, processes, issues, generateActionCode } = useManagementSystem();
  
  const preselectedProcess = searchParams.get("process");
  const preselectedOrigin = searchParams.get("origin") as ActionOrigin | null;
  const preselectedIssueId = searchParams.get("issueId");

  const [formData, setFormData] = useState({
    code: generateActionCode(),
    processId: preselectedProcess || "",
    title: "",
    description: "",
    origin: preselectedOrigin || "" as ActionOrigin | "",
    linkedIssueIds: preselectedIssueId ? [preselectedIssueId] : [] as string[],
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
    if (!formData.origin) {
      toast.error("Please select an origin");
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
      origin: formData.origin as ActionOrigin,
      linkedIssueIds: formData.linkedIssueIds,
      deadline: formData.deadline,
      responsibleName: formData.responsibleName.trim() || undefined,
      status: formData.status,
    });

    toast.success("Action created successfully");
    navigate("/actions");
  };

  const activeProcesses = processes.filter(p => p.status !== "archived");
  
  // Get available issues for linking based on selected process
  const availableIssues = formData.processId 
    ? issues.filter(i => i.processId === formData.processId)
    : [];

  const toggleIssueLink = (issueId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedIssueIds: prev.linkedIssueIds.includes(issueId)
        ? prev.linkedIssueIds.filter(id => id !== issueId)
        : [...prev.linkedIssueIds, issueId]
    }));
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="New Action" 
        subtitle="Corrective or Improvement Action"
        showBack
      />

      <AdaptiveContainer>
        <form onSubmit={handleSubmit} className="py-6 space-y-6">
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
              onValueChange={(value) => setFormData(prev => ({ ...prev, processId: value, linkedIssueIds: [] }))}
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

          {/* Origin */}
          <div className="form-field">
            <Label>Origin *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {originOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, origin: option.value }))}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    formData.origin === option.value
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

          {/* Link to Issues (optional) */}
          {formData.origin === "issue" && formData.processId && availableIssues.length > 0 && (
            <div className="form-field">
              <Label>Link to Issue(s)</Label>
              <p className="form-helper mb-2">
                Select one or more issues this action addresses.
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                {availableIssues.map((issue) => (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => toggleIssueLink(issue.id)}
                    className={cn(
                      "w-full p-2 rounded-lg border text-left text-sm transition-all",
                      formData.linkedIssueIds.includes(issue.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {issue.code}
                    </span>
                    <p className="line-clamp-1">{issue.description}</p>
                  </button>
                ))}
              </div>
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
      </AdaptiveContainer>
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