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
import { IssueType, SwotQuadrant, IssueOrigin } from "@/types/management-system";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RiskEvaluation, getPriorityFromCriticity } from "@/components/risk/RiskEvaluation";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";

const quadrantOptions: { value: SwotQuadrant; label: string; type: IssueType; description: string }[] = [
  { value: "strength", label: "Strength", type: "opportunity", description: "Internal positive factor" },
  { value: "weakness", label: "Weakness", type: "risk", description: "Internal negative factor" },
  { value: "opportunity", label: "Opportunity", type: "opportunity", description: "External positive factor" },
  { value: "threat", label: "Threat", type: "risk", description: "External negative factor" },
];

export default function IssueForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createIssue, processes } = useManagementSystem();
  
  const preselectedProcess = searchParams.get("process");
  const { generateIssueCode } = useManagementSystem();

  const [formData, setFormData] = useState({
    code: generateIssueCode(),
    processId: preselectedProcess || "",
    quadrant: "" as SwotQuadrant | "",
    description: "",
    origin: "internal" as IssueOrigin,
    severity: 2, // Default to middle value (1-3 scale)
    probability: 2, // Default to middle value (1-3 scale)
  });

  const selectedQuadrant = quadrantOptions.find(q => q.value === formData.quadrant);
  const isRisk = selectedQuadrant?.type === "risk";
  const criticity = isRisk ? formData.severity * formData.probability : undefined;
  const priorityInfo = criticity ? getPriorityFromCriticity(criticity) : undefined;

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
      origin: formData.origin,
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
          {/* Code Field */}
          <div className="form-field">
            <Label htmlFor="code">Reference Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="ISS-001"
              className="font-mono"
            />
            <p className="form-helper">
              Auto-generated reference. You can customize it.
            </p>
          </div>

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

        {/* Quadrant Selection */}
        <div className="form-field">
          <Label>Type *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {quadrantOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    quadrant: option.value,
                    origin: option.value === "strength" || option.value === "weakness" 
                      ? "internal" 
                      : "external"
                  }));
                }}
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
