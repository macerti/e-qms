import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RiskMatrix } from "./RiskMatrix";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface RiskEvaluationProps {
  severity: number;
  probability: number;
  onSeverityChange: (value: number) => void;
  onProbabilityChange: (value: number) => void;
}

// Severity level definitions
const severityLevels = [
  {
    value: 1,
    label: "Minor",
    description: "Limited impact. No effect on conformity or objectives.",
  },
  {
    value: 2,
    label: "Significant",
    description: "Noticeable impact. Partial degradation of performance or compliance.",
  },
  {
    value: 3,
    label: "Major",
    description: "Serious impact. Failure to meet objectives, requirements, or customer expectations.",
  },
];

// Probability level definitions
const probabilityLevels = [
  {
    value: 1,
    label: "Unlikely",
    description: "Rare or exceptional occurrence.",
  },
  {
    value: 2,
    label: "Possible",
    description: "Occasional occurrence.",
  },
  {
    value: 3,
    label: "Likely",
    description: "Frequent or expected occurrence.",
  },
];

// Priority mapping based on criticity
export function getPriorityFromCriticity(criticity: number): {
  priority: string;
  label: string;
  description: string;
  variant: "success" | "warning" | "risk";
} {
  if (criticity <= 3) {
    return {
      priority: "03",
      label: "Low Priority",
      description: "Action is optional",
      variant: "success",
    };
  }
  if (criticity <= 6) {
    return {
      priority: "02",
      label: "Medium Priority",
      description: "Action is required",
      variant: "warning",
    };
  }
  return {
    priority: "01",
    label: "High Priority",
    description: "Action is mandatory and urgent",
    variant: "risk",
  };
}

export function RiskEvaluation({
  severity,
  probability,
  onSeverityChange,
  onProbabilityChange,
}: RiskEvaluationProps) {
  const criticity = severity * probability;
  const priorityInfo = getPriorityFromCriticity(criticity);

  return (
    <div className="space-y-6 p-4 bg-risk/5 rounded-xl border border-risk/20">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-risk" />
        Risk Evaluation
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[280px]">
              <p className="text-xs">
                Risk is evaluated using a 3×3 matrix. Criticity = Severity × Probability.
                The resulting score determines the action priority level.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Severity Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Severity</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[280px]">
                    <p className="text-xs">
                      The severity of impact if the risk materializes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <RadioGroup
              value={severity.toString()}
              onValueChange={(v) => onSeverityChange(parseInt(v))}
              className="space-y-2"
            >
              {severityLevels.map((level) => (
                <label
                  key={level.value}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    severity === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem
                    value={level.value.toString()}
                    id={`severity-${level.value}`}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">{level.value}</span>
                      <span className="text-sm font-medium">{level.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {level.description}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Probability Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Probability</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[280px]">
                    <p className="text-xs">
                      The likelihood of the risk occurring.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <RadioGroup
              value={probability.toString()}
              onValueChange={(v) => onProbabilityChange(parseInt(v))}
              className="space-y-2"
            >
              {probabilityLevels.map((level) => (
                <label
                  key={level.value}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    probability === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem
                    value={level.value.toString()}
                    id={`probability-${level.value}`}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">{level.value}</span>
                      <span className="text-sm font-medium">{level.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {level.description}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-4">
          {/* Risk Matrix */}
          <RiskMatrix severity={severity} probability={probability} />

          {/* Criticity Result */}
          <div className={cn(
            "p-4 rounded-lg border-2",
            priorityInfo.variant === "success" && "bg-success/10 border-success/30",
            priorityInfo.variant === "warning" && "bg-warning/10 border-warning/30",
            priorityInfo.variant === "risk" && "bg-risk/10 border-risk/30"
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Criticity Score</span>
              <span className={cn(
                "font-mono text-3xl font-bold",
                priorityInfo.variant === "success" && "text-success",
                priorityInfo.variant === "warning" && "text-warning",
                priorityInfo.variant === "risk" && "text-risk"
              )}>
                {criticity}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded",
                priorityInfo.variant === "success" && "bg-success/20 text-success",
                priorityInfo.variant === "warning" && "bg-warning/20 text-warning",
                priorityInfo.variant === "risk" && "bg-risk/20 text-risk"
              )}>
                Priority {priorityInfo.priority}
              </span>
              <span className="text-sm font-medium">{priorityInfo.label}</span>
            </div>

            {/* Action Expectation */}
            <div className={cn(
              "flex items-start gap-2 p-3 rounded-md mt-3",
              priorityInfo.variant === "success" && "bg-success/5",
              priorityInfo.variant === "warning" && "bg-warning/5",
              priorityInfo.variant === "risk" && "bg-risk/5"
            )}>
              {priorityInfo.variant === "success" && (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              )}
              {priorityInfo.variant === "warning" && (
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              )}
              {priorityInfo.variant === "risk" && (
                <AlertCircle className="h-4 w-4 text-risk shrink-0 mt-0.5" />
              )}
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  priorityInfo.variant === "success" && "text-success",
                  priorityInfo.variant === "warning" && "text-warning",
                  priorityInfo.variant === "risk" && "text-risk"
                )}>
                  {priorityInfo.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {priorityInfo.variant === "success" && 
                    "This risk can be accepted with monitoring. Action is at your discretion."}
                  {priorityInfo.variant === "warning" && 
                    "This risk requires attention. Define actions to reduce exposure."}
                  {priorityInfo.variant === "risk" && 
                    "This risk demands immediate treatment. Actions must be defined urgently."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
