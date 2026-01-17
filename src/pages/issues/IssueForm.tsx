import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { IssueType, SwotQuadrant, ContextNature } from "@/types/management-system";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RiskEvaluation, getPriorityFromCriticity } from "@/components/risk/RiskEvaluation";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";

const quadrantOptions: { value: SwotQuadrant; label: string; type: IssueType; description: string; defaultNature: ContextNature }[] = [
  { value: "strength", label: "Strength", type: "opportunity", description: "Internal positive factor", defaultNature: "internal" },
  { value: "weakness", label: "Weakness", type: "risk", description: "Internal negative factor", defaultNature: "internal" },
  { value: "opportunity", label: "Opportunity", type: "opportunity", description: "External positive factor", defaultNature: "external" },
  { value: "threat", label: "Threat", type: "risk", description: "External negative factor", defaultNature: "external" },
];

export default function IssueForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createIssue, processes, generateIssueCode } = useManagementSystem();
  
  const preselectedProcess = searchParams.get("process");

  const [formData, setFormData] = useState({
    code: "",
    processId: preselectedProcess || "",
    quadrant: "" as SwotQuadrant | "",
    description: "",
    contextNature: "internal" as ContextNature,
    severity: 2, // Default to middle value (1-3 scale)
    probability: 2, // Default to middle value (1-3 scale)
  });

  const selectedQuadrant = quadrantOptions.find(q => q.value === formData.quadrant);
  const isRisk = selectedQuadrant?.type === "risk";
  const criticity = isRisk ? formData.severity * formData.probability : undefined;
  const priorityInfo = criticity ? getPriorityFromCriticity(criticity) : undefined;

  // Generate code when quadrant is selected
  const handleQuadrantChange = (quadrant: SwotQuadrant) => {
    const option = quadrantOptions.find(q => q.value === quadrant);
    const issueType = option?.type || "risk";
    setFormData(prev => ({ 
      ...prev, 
      quadrant,
      contextNature: option?.defaultNature || "internal",
      code: generateIssueCode(issueType),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.processId) {
      toast.error("Please select a process");
      return;
    }
    if (!formData.quadrant) {
      toast.error("Please select a quadrant type");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    createIssue({
      code: formData.code,
      processId: formData.processId,
      quadrant: formData.quadrant as SwotQuadrant,
      type: selectedQuadrant!.type,
      description: formData.description.trim(),
      contextNature: formData.contextNature,
      severity: isRisk ? formData.severity : undefined,
      probability: isRisk ? formData.probability : undefined,
    });

    toast.success(`${selectedQuadrant!.label} added successfully`);
    navigate("/issues");
  };

  const activeProcesses = processes.filter(p => p.status !== "archived");

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="New Issue" 
        subtitle="Context Analysis"
        showBack
      />

      <AdaptiveContainer>
        <form onSubmit={handleSubmit} className="py-6 space-y-6">
          {/* Quadrant Selection - First to generate code */}
          <div className="form-field">
            <Label>Type *</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {quadrantOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleQuadrantChange(option.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    formData.quadrant === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    option.type === "risk" ? "text-risk" : "text-opportunity"
                  )}>
                    {option.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Code Field - Only shown after quadrant selected */}
          {formData.quadrant && (
            <div className="form-field">
              <Label htmlFor="code">Reference Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="RISK/25/001"
                className="font-mono"
              />
              <p className="form-helper">
                Auto-generated. Format: {isRisk ? "RISK" : "OPP"}/YY/XXX. You can customize it.
              </p>
            </div>
          )}

          {/* Process Selection */}
          <div className="form-field">
            <Label>Process *</Label>
            <Select
              value={formData.processId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, processId: value }))}
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
              This issue will be linked to the selected process.
            </p>
          </div>

          {/* Context Nature (Internal / External) */}
          <div className="form-field">
            <Label>Context Nature</Label>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, contextNature: "internal" }))}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                  formData.contextNature === "internal" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Internal
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, contextNature: "external" }))}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                  formData.contextNature === "external" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                External
              </button>
            </div>
            <p className="form-helper">
              Is this factor from within the organization or the external environment?
            </p>
          </div>

          {/* Description */}
          <div className="form-field">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={
                formData.quadrant === "strength" 
                  ? "e.g., Experienced quality team with deep process knowledge" 
                  : formData.quadrant === "weakness"
                  ? "e.g., Limited automation in inspection processes"
                  : formData.quadrant === "opportunity"
                  ? "e.g., New market segment with demand for certified products"
                  : formData.quadrant === "threat"
                  ? "e.g., Increasing regulatory requirements in target markets"
                  : "Describe the factor or situation"
              }
              rows={4}
            />
            <p className="form-helper">
              Be specific about the factor and its potential impact.
            </p>
          </div>

          {/* Risk Evaluation (only for Weakness and Threat) */}
          {isRisk && (
            <RiskEvaluation
              severity={formData.severity}
              probability={formData.probability}
              onSeverityChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
              onProbabilityChange={(value) => setFormData(prev => ({ ...prev, probability: value }))}
            />
          )}

          {/* Submit */}
          <div className="pt-4">
            <Button type="submit" className="w-full">
              Add {selectedQuadrant?.label || "Issue"}
            </Button>
          </div>
        </form>
      </AdaptiveContainer>
    </div>
  );
}