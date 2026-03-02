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
import { IssueType, SwotQuadrant, ContextNature } from "@/api/contracts/viewModels";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RiskEvaluation, getPriorityFromCriticity } from "@/components/risk/RiskEvaluation";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { HelpHint } from "@/components/ui/help-hint";
import { ArrowRight } from "lucide-react";

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
    severity: 2,
    probability: 2,
  });

  const selectedQuadrant = quadrantOptions.find(q => q.value === formData.quadrant);
  const isRisk = selectedQuadrant?.type === "risk";
  const criticity = isRisk ? formData.severity * formData.probability : undefined;
  const priorityInfo = criticity ? getPriorityFromCriticity(criticity) : undefined;

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
    if (!formData.processId) { toast.error("Please select a process"); return; }
    if (!formData.quadrant) { toast.error("Please select a quadrant type"); return; }
    if (!formData.description.trim()) { toast.error("Description is required"); return; }

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

      <AdaptiveContainer maxWidth="content">
        <form onSubmit={handleSubmit} className="py-8 space-y-8 max-w-2xl mx-auto">
          
          {/* Classification */}
          <div className="form-section">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Classification</h2>
            
            {/* Quadrant Selection */}
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label>Type *</Label>
                <HelpHint content="ISO 9001 requires identifying risks and opportunities. Choose the SWOT type that best describes the context factor." />
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-1">
                {quadrantOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleQuadrantChange(option.value)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left transition-all duration-200",
                      formData.quadrant === option.value
                        ? "border-primary bg-primary/5 shadow-metric ring-1 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-semibold",
                      option.type === "risk" ? "text-risk" : "text-opportunity"
                    )}>
                      {option.label}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Field */}
            {formData.quadrant && (
              <div className="form-field animate-fade-in">
                <div className="flex items-center gap-2">
                  <Label htmlFor="code">Reference Code</Label>
                  <HelpHint content="Use a stable code so risks and opportunities remain traceable." />
                </div>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="RISK/25/001"
                  className="font-mono"
                />
                <p className="form-helper">
                  Auto-generated. Format: {isRisk ? "RISK" : "OPP"}/YY/XXX
                </p>
              </div>
            )}
          </div>

          {/* Context */}
          <div className="form-section">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Context</h2>
            
            {/* Process Selection */}
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label>Process *</Label>
                <HelpHint content="Link the issue to the process where it occurs." />
              </div>
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
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{process.code}</span>
                      {process.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Context Nature */}
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label>Context Nature</Label>
                <HelpHint content="Classify whether the factor is internal or external." />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contextNature: "internal" }))}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                    formData.contextNature === "internal" 
                      ? "bg-primary text-primary-foreground shadow-metric" 
                      : "bg-muted/60 text-muted-foreground hover:bg-muted border border-border/40"
                  )}
                >
                  Internal
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contextNature: "external" }))}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                    formData.contextNature === "external" 
                      ? "bg-primary text-primary-foreground shadow-metric" 
                      : "bg-muted/60 text-muted-foreground hover:bg-muted border border-border/40"
                  )}
                >
                  External
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Description</h2>
            
            <div className="form-field">
              <div className="flex items-center gap-2">
                <Label htmlFor="description">Description *</Label>
                <HelpHint content="Describe the situation clearly enough so another user can assess impact." />
              </div>
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
                className="leading-relaxed"
              />
            </div>
          </div>

          {/* Risk Evaluation */}
          {isRisk && (
            <div className="form-section animate-fade-in">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Risk Evaluation</h2>
              <RiskEvaluation
                severity={formData.severity}
                probability={formData.probability}
                onSeverityChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
                onProbabilityChange={(value) => setFormData(prev => ({ ...prev, probability: value }))}
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <Button type="submit" className="w-full h-12 text-base shadow-metric">
              Add {selectedQuadrant?.label || "Issue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </AdaptiveContainer>
    </div>
  );
}
