import { cn } from "@/lib/utils";

interface RiskMatrixProps {
  severity: number;
  probability: number;
}

// 3×3 Risk Matrix with color coding based on criticity
// Criticity = Severity × Probability (1-9 range)
// 1-3: Green (Priority 03 - Optional)
// 4-6: Orange (Priority 02 - Required)
// 7-9: Red (Priority 01 - Mandatory/Urgent)

const getCriticityColor = (criticity: number): string => {
  if (criticity <= 3) return "bg-success/20 border-success/40";
  if (criticity <= 6) return "bg-warning/20 border-warning/40";
  return "bg-risk/20 border-risk/40";
};

const getSelectedCriticityColor = (criticity: number): string => {
  if (criticity <= 3) return "bg-success border-success ring-2 ring-success/50";
  if (criticity <= 6) return "bg-warning border-warning ring-2 ring-warning/50";
  return "bg-risk border-risk ring-2 ring-risk/50";
};

export function RiskMatrix({ severity, probability }: RiskMatrixProps) {
  const currentCriticity = severity * probability;

  // Matrix is displayed with Severity on Y-axis (3 at top, 1 at bottom)
  // and Probability on X-axis (1 at left, 3 at right)
  const rows = [3, 2, 1]; // Severity values (top to bottom)
  const cols = [1, 2, 3]; // Probability values (left to right)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Risk Matrix</span>
        <span className="text-[10px]">(Severity × Probability)</span>
      </div>
      
      <div className="flex">
        {/* Y-axis label */}
        <div className="flex flex-col justify-center items-center pr-2">
          <span className="text-[10px] text-muted-foreground font-medium -rotate-90 whitespace-nowrap">
            Severity
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {/* Y-axis labels */}
          <div className="flex gap-1">
            <div className="w-6" /> {/* Spacer for Y labels */}
            {cols.map((prob) => (
              <div key={prob} className="w-10 h-4 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground font-medium">{prob}</span>
              </div>
            ))}
          </div>
          
          {/* Matrix grid */}
          {rows.map((sev) => (
            <div key={sev} className="flex gap-1 items-center">
              <div className="w-6 h-10 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground font-medium">{sev}</span>
              </div>
              {cols.map((prob) => {
                const cellCriticity = sev * prob;
                const isSelected = sev === severity && prob === probability;
                
                return (
                  <div
                    key={`${sev}-${prob}`}
                    className={cn(
                      "w-10 h-10 rounded-md border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? getSelectedCriticityColor(cellCriticity)
                        : getCriticityColor(cellCriticity)
                    )}
                  >
                    <span className={cn(
                      "text-xs font-bold",
                      isSelected ? "text-primary-foreground" : "text-foreground/70"
                    )}>
                      {cellCriticity}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* X-axis label */}
          <div className="flex justify-center pt-1">
            <span className="text-[10px] text-muted-foreground font-medium">Probability</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/40 border border-success" />
          <span className="text-muted-foreground">1-3: Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/40 border border-warning" />
          <span className="text-muted-foreground">4-6: Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-risk/40 border border-risk" />
          <span className="text-muted-foreground">7-9: High</span>
        </div>
      </div>
    </div>
  );
}
