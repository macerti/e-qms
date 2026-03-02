import { AlertTriangle, CheckSquare, Clock, Link2Off, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContextIssue, Action } from "@/api/contracts/viewModels";

interface RiskActionCardProps {
  issues: ContextIssue[];
  actions: Action[];
  overdueActions: Action[];
}

export function RiskActionCard({ issues, actions, overdueActions }: RiskActionCardProps) {
  const navigate = useNavigate();
  
  const risks = issues.filter(i => i.type === "risk");
  const opportunities = issues.filter(i => i.type === "opportunity");
  
  // Group risks by priority
  const highRisks = risks.filter(r => r.priority === "01").length;
  const mediumRisks = risks.filter(r => r.priority === "02").length;
  const lowRisks = risks.filter(r => r.priority === "03").length;
  const unassessedRisks = risks.filter(r => !r.priority).length;

  // Actions without linked issue
  const actionsWithoutIssue = actions.filter(a => 
    a.origin === "issue" && (!a.linkedIssueIds || a.linkedIssueIds.length === 0)
  ).length;

  // Open actions
  const openActions = actions.filter(a => 
    a.status !== "evaluated" && a.status !== "cancelled"
  ).length;

  return (
    <div className="signal-card space-y-4">
      {/* Risks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-risk/10 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 text-risk" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Risks</h3>
              <p className="text-[11px] text-muted-foreground">{risks.length} identified</p>
            </div>
          </div>
          <span className="font-mono text-2xl font-bold leading-none">{risks.length}</span>
        </div>
        
        {risks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {highRisks > 0 && (
              <button 
                onClick={() => navigate("/issues?type=risk")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-risk/8 text-risk text-xs font-medium hover:bg-risk/15 transition-all duration-200 border border-risk/10"
              >
                <span className="w-2 h-2 rounded-full bg-risk" />
                P01: {highRisks}
              </button>
            )}
            {mediumRisks > 0 && (
              <button 
                onClick={() => navigate("/issues?type=risk")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/8 text-warning text-xs font-medium hover:bg-warning/15 transition-all duration-200 border border-warning/10"
              >
                <span className="w-2 h-2 rounded-full bg-warning" />
                P02: {mediumRisks}
              </button>
            )}
            {lowRisks > 0 && (
              <button 
                onClick={() => navigate("/issues?type=risk")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/8 text-success text-xs font-medium hover:bg-success/15 transition-all duration-200 border border-success/10"
              >
                <span className="w-2 h-2 rounded-full bg-success" />
                P03: {lowRisks}
              </button>
            )}
            {unassessedRisks > 0 && (
              <span className="text-xs text-muted-foreground self-center">
                +{unassessedRisks} unassessed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Actions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-action/10 flex items-center justify-center">
              <CheckSquare className="w-4.5 h-4.5 text-action" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Actions</h3>
              <p className="text-[11px] text-muted-foreground">{openActions} open</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {overdueActions.length > 0 && (
            <button 
              onClick={() => navigate("/actions")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/8 text-destructive text-xs font-medium hover:bg-destructive/15 transition-all duration-200 border border-destructive/10"
            >
              <Clock className="w-3.5 h-3.5" />
              {overdueActions.length} overdue
            </button>
          )}
          
          {actionsWithoutIssue > 0 && (
            <button 
              onClick={() => navigate("/actions")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-all duration-200 border border-border"
            >
              <Link2Off className="w-3.5 h-3.5" />
              {actionsWithoutIssue} unlinked
            </button>
          )}
        </div>
      </div>

      {/* Opportunities mention */}
      {opportunities.length > 0 && (
        <>
          <div className="border-t border-border" />
          <button 
            onClick={() => navigate("/issues?type=opportunity")}
            className="flex items-center justify-between w-full text-xs hover:bg-muted/60 p-3 -mx-1 rounded-lg transition-all duration-200"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-opportunity" />
              Opportunities identified
            </span>
            <span className="font-mono font-semibold text-opportunity bg-opportunity/10 px-2 py-0.5 rounded-md">
              {opportunities.length}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
