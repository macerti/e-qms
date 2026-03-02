import { Shield, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComplianceCardProps {
  totalRequirements: number;
  allocatedCount: number;
  unallocatedUniqueCount: number;
}

export function ComplianceCard({ 
  totalRequirements, 
  allocatedCount, 
  unallocatedUniqueCount 
}: ComplianceCardProps) {
  const navigate = useNavigate();
  const percentage = totalRequirements > 0 
    ? Math.round((allocatedCount / totalRequirements) * 100) 
    : 0;

  return (
    <div className="signal-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-process/10 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-process" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">Compliance Coverage</h3>
            <p className="text-[11px] text-muted-foreground">Requirements allocation</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-3xl font-bold text-process leading-none">
            {percentage}
          </span>
          <span className="text-sm text-process font-medium">%</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-process/80 to-process rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{allocatedCount} allocated</span>
          <span>{totalRequirements} total</span>
        </div>
      </div>

      {/* Unallocated unique requirements warning */}
      {unallocatedUniqueCount > 0 && (
        <button 
          onClick={() => navigate("/processes")}
          className="flex items-center gap-2.5 w-full p-3 rounded-lg bg-destructive/8 text-destructive text-xs font-medium hover:bg-destructive/12 transition-colors border border-destructive/10"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{unallocatedUniqueCount} unique requirement{unallocatedUniqueCount > 1 ? 's' : ''} not allocated</span>
        </button>
      )}
    </div>
  );
}
