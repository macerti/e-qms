 import { AlertTriangle, CheckSquare, Clock, Link2Off } from "lucide-react";
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
 
 
   // Actions without linked issue (origin is 'issue' but no linkedIssueIds)
   const actionsWithoutIssue = actions.filter(a => 
     a.origin === "issue" && (!a.linkedIssueIds || a.linkedIssueIds.length === 0)
   ).length;
 
   // Open actions
   const openActions = actions.filter(a => 
     a.status !== "evaluated" && a.status !== "cancelled"
   ).length;
 
   return (
     <div className="mobile-card space-y-4">
       {/* Risks Section */}
       <div className="space-y-2">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <AlertTriangle className="w-4 h-4 text-risk" />
             <h3 className="font-semibold text-sm">Risks</h3>
           </div>
           <span className="font-mono font-bold">{risks.length}</span>
         </div>
         
         {risks.length > 0 && (
           <div className="flex gap-2">
             {highRisks > 0 && (
               <button 
                 onClick={() => navigate("/issues?type=risk")}
                 className="flex items-center gap-1.5 px-2 py-1 rounded bg-risk/10 text-risk text-xs font-medium hover:bg-risk/20 transition-colors"
               >
                 <span className="w-1.5 h-1.5 rounded-full bg-risk" />
                 P01: {highRisks}
               </button>
             )}
             {mediumRisks > 0 && (
               <button 
                 onClick={() => navigate("/issues?type=risk")}
                 className="flex items-center gap-1.5 px-2 py-1 rounded bg-warning/10 text-warning text-xs font-medium hover:bg-warning/20 transition-colors"
               >
                 <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                 P02: {mediumRisks}
               </button>
             )}
             {lowRisks > 0 && (
               <button 
                 onClick={() => navigate("/issues?type=risk")}
                 className="flex items-center gap-1.5 px-2 py-1 rounded bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors"
               >
                 <span className="w-1.5 h-1.5 rounded-full bg-success" />
                 P03: {lowRisks}
               </button>
             )}
             {unassessedRisks > 0 && (
               <span className="text-xs text-muted-foreground">
                 +{unassessedRisks} unassessed
               </span>
             )}
           </div>
         )}
       </div>
 
       {/* Divider */}
       <div className="border-t border-border" />
 
       {/* Actions Section */}
       <div className="space-y-2">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <CheckSquare className="w-4 h-4 text-action" />
             <h3 className="font-semibold text-sm">Actions</h3>
           </div>
           <span className="font-mono font-bold">{openActions} open</span>
         </div>
         
         <div className="flex flex-wrap gap-2">
           {overdueActions.length > 0 && (
             <button 
               onClick={() => navigate("/actions")}
               className="flex items-center gap-1.5 px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
             >
               <Clock className="w-3 h-3" />
               {overdueActions.length} overdue
             </button>
           )}
           
           {actionsWithoutIssue > 0 && (
             <button 
               onClick={() => navigate("/actions")}
               className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
             >
               <Link2Off className="w-3 h-3" />
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
             className="flex items-center justify-between w-full text-xs hover:bg-muted p-2 -m-2 rounded transition-colors"
           >
             <span className="text-muted-foreground">Opportunities identified</span>
             <span className="font-mono font-medium text-opportunity">{opportunities.length}</span>
           </button>
         </>
       )}
     </div>
   );
 }