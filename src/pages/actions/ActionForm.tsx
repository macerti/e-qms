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
import { ActionOrigin, ActionStatus } from "@/api/contracts/viewModels";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { CheckCircle, ArrowRight } from "lucide-react";
import { HelpHint } from "@/components/ui/help-hint";

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
  const { createAction, processes, issues, generateActionCode, getIssueById } = useManagementSystem();
  
  const preselectedProcess = searchParams.get("process");
  const preselectedOrigin = searchParams.get("origin") as ActionOrigin | null;
  const preselectedIssueId = searchParams.get("issueId");
  
  const preselectedIssue = preselectedIssueId ? getIssueById(preselectedIssueId) : null;

  const [formData, setFormData] = useState({
    code: generateActionCode(),
    processId: preselectedIssue?.processId || preselectedProcess || "",
    title: "",
    description: "",
    origin: (preselectedIssue ? "issue" : preselectedOrigin || "") as ActionOrigin | "",
    linkedIssueIds: preselectedIssueId ? [preselectedIssueId] : [] as string[],
    deadline: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    responsibleName: "",
    status: "planned" as ActionStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.processId) { toast.error("Please select a process"); return; }
    if (!formData.title.trim()) { toast.error("Action title is required"); return; }
    if (!formData.description.trim()) { toast.error("Description is required"); return; }
    if (!formData.origin) { toast.error("Please select an origin"); return; }
    if (formData.origin === "issue" && formData.linkedIssueIds.length === 0) {
      toast.error("Please link at least one issue when origin is 'Issue'"); return;
    }
    if (!formData.deadline) { toast.error("Deadline is required"); return; }

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

      <AdaptiveContainer maxWidth="content">
        <form onSubmit={handleSubmit} className="py-8 space-y-8 max-w-2xl mx-auto">
          
          {/* Identity Section */}
          <div className="form-section">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Identity</h2>
            
            {/* Action Code */}
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label htmlFor="code">Reference Code *</Label>
                <HelpHint content="Use a unique code to track this action through planning, implementation, and effectiveness review." />
              </div>
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
              <div className="flex items-center gap-2">
                <Label>Process *</Label>
                <HelpHint content="Actions should be linked to the affected process so compliance evidence and KPI impact are visible in one place." />
              </div>
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
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{process.code}</span>
                      {process.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Origin & Traceability */}
          <div className="form-section">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Origin & Traceability</h2>
            
            {/* Origin */}
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label>Origin *</Label>
                <HelpHint content="Select the source event that triggered this action." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                {originOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, origin: option.value }))}
                    className={cn(
                      "p-3.5 rounded-xl border text-left transition-all duration-200",
                      formData.origin === option.value
                        ? "border-action bg-action/5 shadow-metric ring-1 ring-action/20"
                        : "border-border hover:border-action/40 hover:bg-muted/30"
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Link to Issues */}
            {(formData.origin === "issue" || preselectedIssueId) && formData.processId && (
              <div className="form-field">
                <div className="flex items-center gap-2">
                  <Label>Link to Issue(s) *</Label>
                  <HelpHint content="Link one or more issues so action effectiveness can be traced back to the original risk/opportunity." />
                </div>
                {availableIssues.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto border border-border/60 rounded-xl p-3 bg-muted/20">
                    {availableIssues.map((issue) => (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => toggleIssueLink(issue.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left text-sm transition-all duration-200",
                          formData.linkedIssueIds.includes(issue.id)
                            ? "border-primary bg-primary/5 shadow-metric"
                            : "border-border/60 hover:border-primary/40 bg-card"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {issue.code}
                          </span>
                          {formData.linkedIssueIds.includes(issue.id) && (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="line-clamp-1 mt-1.5 leading-relaxed">{issue.description}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-3 px-4 bg-muted/30 rounded-lg">
                    No issues available for this process.
                  </p>
                )}
                {formData.linkedIssueIds.length > 0 && (
                  <p className="text-xs text-success font-medium mt-1.5">
                    ✓ {formData.linkedIssueIds.length} issue(s) selected
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="form-section">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Details</h2>
            
            {/* Action Title */}
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label htmlFor="title">Action Title *</Label>
                <HelpHint content="Write the action as a concrete deliverable." />
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Implement automated inspection checkpoint"
              />
            </div>

            {/* Description */}
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label htmlFor="description">Description *</Label>
                <HelpHint content="Explain scope, expected result, and acceptance criteria." />
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the action in detail, including expected outcome..."
                rows={4}
                className="leading-relaxed"
              />
            </div>
          </div>

          {/* Planning */}
          <div className="form-section">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Planning</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Deadline */}
              <div className="form-field">
                <div className="flex items-center gap-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <HelpHint content="Set a realistic due date." />
                </div>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>

              {/* Responsible */}
              <div className="form-field">
                <div className="flex items-center gap-2">
                  <Label htmlFor="responsible">Responsible Person</Label>
                  <HelpHint content="Assign an accountable owner." />
                </div>
                <Input
                  id="responsible"
                  value={formData.responsibleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
                  placeholder="e.g., Quality Engineer"
                />
              </div>
            </div>

            {/* Initial Status */}
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label>Initial Status</Label>
                <HelpHint content="Use Planned for approved but not started actions." />
              </div>
              <div className="flex gap-2 mt-1">
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
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button type="submit" className="w-full h-12 text-base shadow-metric">
              Create Action
              <ArrowRight className="w-4 h-4 ml-2" />
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
        "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
        selected 
          ? "bg-primary text-primary-foreground shadow-metric" 
          : "bg-muted/60 text-muted-foreground hover:bg-muted border border-border/40"
      )}
    >
      {children}
    </button>
  );
}
